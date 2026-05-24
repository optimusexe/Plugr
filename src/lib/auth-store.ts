import crypto from "node:crypto";
import { execute, query } from "@/lib/azure/postgres";
import { sendOtpEmail } from "@/lib/azure/messaging";
import { getAdminBootstrapEmails } from "@/lib/azure/config";
import type { AuthRegisterPayload, UserAccount } from "@/lib/types";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  verified: boolean;
  is_admin: boolean;
  verification_code: string | null;
  verification_code_expires_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function toIsoString(value: string | Date | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapUserRow(row: UserRow): UserAccount {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    verified: row.verified,
    isAdmin: row.is_admin,
    verificationCode: row.verification_code ?? undefined,
    verificationCodeExpiresAt: toIsoString(row.verification_code_expires_at),
    createdAt: toIsoString(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date().toISOString(),
  };
}

async function ensureUsersTable(): Promise<void> {
  await execute(`
    create table if not exists users (
      id text primary key,
      full_name text not null,
      email text not null unique,
      password_hash text not null,
      verified boolean not null default false,
      is_admin boolean not null default false,
      verification_code text null,
      verification_code_expires_at timestamptz null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await execute(`alter table users add column if not exists is_admin boolean not null default false`);
}

async function readUsersFromDb(): Promise<UserAccount[]> {
  await ensureUsersTable();
  const result = await query<UserRow>(`select * from users order by created_at asc`);
  return result.rows.map(mapUserRow);
}

async function findUserByEmailFromDb(email: string): Promise<UserAccount | null> {
  await ensureUsersTable();
  const result = await query<UserRow>(`select * from users where email = $1 limit 1`, [email]);
  return result.rows[0] ? promoteBootstrapAdminIfNeeded(mapUserRow(result.rows[0])) : null;
}

async function findUserByIdFromDb(id: string): Promise<UserAccount | null> {
  await ensureUsersTable();
  const result = await query<UserRow>(`select * from users where id = $1 limit 1`, [id]);
  return result.rows[0] ? promoteBootstrapAdminIfNeeded(mapUserRow(result.rows[0])) : null;
}

async function insertUserIntoDb(user: UserAccount): Promise<UserAccount> {
  await ensureUsersTable();
  const result = await query<UserRow>(
    `insert into users (id, full_name, email, password_hash, verified, verification_code, verification_code_expires_at, created_at, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz, $9::timestamptz)
     returning *`,
    [
      user.id,
      user.fullName,
      user.email,
      user.passwordHash,
      user.verified,
      user.verificationCode ?? null,
      user.verificationCodeExpiresAt ?? null,
      user.createdAt,
      user.updatedAt,
    ],
  );

  return mapUserRow(result.rows[0]);
}

async function updateUserInDb(user: UserAccount): Promise<UserAccount> {
  await ensureUsersTable();
  const result = await query<UserRow>(
    `update users
     set full_name = $2,
         email = $3,
         password_hash = $4,
         verified = $5,
         is_admin = $6,
         verification_code = $7,
         verification_code_expires_at = $8,
         updated_at = $9::timestamptz
     where id = $1
     returning *`,
    [
      user.id,
      user.fullName,
      user.email,
      user.passwordHash,
      user.verified,
      user.isAdmin,
      user.verificationCode ?? null,
      user.verificationCodeExpiresAt ?? null,
      user.updatedAt,
    ],
  );

  return mapUserRow(result.rows[0]);
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function createVerificationCode(): string {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

function createUserId(): string {
  return `u_${Math.random().toString(36).slice(2, 10)}`;
}

function isBootstrapAdminEmail(email: string): boolean {
  return getAdminBootstrapEmails().includes(normalizeEmail(email));
}

async function promoteBootstrapAdminIfNeeded(user: UserAccount): Promise<UserAccount> {
  if (user.isAdmin || !isBootstrapAdminEmail(user.email)) {
    return user;
  }

  return updateUserInDb({
    ...user,
    isAdmin: true,
    updatedAt: new Date().toISOString(),
  });
}

export async function registerAccount(payload: AuthRegisterPayload): Promise<{ user: UserAccount; verificationCode: string }> {
  const email = normalizeEmail(payload.email);

  const existing = await findUserByEmailFromDb(email);
  if (existing) {
    throw new Error("Account already exists with this email.");
  }

  const code = createVerificationCode();
  const now = new Date();
  const expires = new Date(now.getTime() + 10 * 60 * 1000).toISOString();

  const user: UserAccount = {
    id: createUserId(),
    fullName: normalizeText(payload.fullName),
    email,
    passwordHash: hashPassword(payload.password),
    verified: false,
    isAdmin: isBootstrapAdminEmail(email),
    verificationCode: code,
    verificationCodeExpiresAt: expires,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  await insertUserIntoDb(user);

  await sendOtpEmail(email, code).catch(() => undefined);
  return { user, verificationCode: code };
}

export async function verifyAccount(userId: string, code: string): Promise<UserAccount> {
  const user = await findUserByIdFromDb(userId);

  if (!user) {
    throw new Error("Account not found.");
  }

  if (!user.verificationCode || !user.verificationCodeExpiresAt) {
    throw new Error("Verification code not available.");
  }

  if (new Date(user.verificationCodeExpiresAt).getTime() < Date.now()) {
    throw new Error("Verification code has expired.");
  }

  if (user.verificationCode !== code.trim()) {
    throw new Error("Invalid verification code.");
  }

  return updateUserInDb({
    ...user,
    verified: true,
    verificationCode: undefined,
    verificationCodeExpiresAt: undefined,
    updatedAt: new Date().toISOString(),
  });
}

export async function resendAccountVerificationCode(userId: string): Promise<UserAccount> {
  const user = await findUserByIdFromDb(userId);

  if (!user) {
    throw new Error("Account not found.");
  }

  if (user.verified) {
    throw new Error("Account already verified.");
  }

  const code = createVerificationCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const updatedUser = await updateUserInDb({
    ...user,
    verificationCode: code,
    verificationCodeExpiresAt: expires,
    updatedAt: new Date().toISOString(),
  });

  await sendOtpEmail(updatedUser.email, code).catch(() => undefined);
  return updatedUser;
}

export async function loginAccount(emailInput: string, password: string): Promise<UserAccount> {
  const email = normalizeEmail(emailInput);

  const user = await findUserByEmailFromDb(email);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (user.passwordHash !== hashPassword(password)) {
    throw new Error("Invalid email or password.");
  }

  if (!user.verified) {
    throw new Error("Account not verified.");
  }

  return user;
}

export async function getUserById(id: string): Promise<UserAccount | null> {
  return findUserByIdFromDb(id);
}

export async function getUsers(): Promise<UserAccount[]> {
  await ensureUsersTable();
  const result = await query<UserRow>(`select * from users order by created_at asc`);
  const users = result.rows.map(mapUserRow);
  return Promise.all(users.map((user) => promoteBootstrapAdminIfNeeded(user)));
}

export async function setUserAdminStatus(userId: string, isAdmin: boolean): Promise<UserAccount | null> {
  const user = await findUserByIdFromDb(userId);

  if (!user) {
    return null;
  }

  return updateUserInDb({
    ...user,
    isAdmin,
    updatedAt: new Date().toISOString(),
  });
}

export async function findUserByEmail(email: string): Promise<UserAccount | null> {
  return findUserByEmailFromDb(normalizeEmail(email));
}

export async function authenticateUser(emailInput: string, password: string): Promise<{ user: UserAccount; verified: boolean }> {
  const email = normalizeEmail(emailInput);
  const user = await findUserByEmailFromDb(email);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (user.passwordHash !== hashPassword(password)) {
    throw new Error("Invalid email or password.");
  }

  return { user, verified: user.verified };
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<UserAccount> {
  const user = await findUserByIdFromDb(userId);

  if (!user) {
    throw new Error("Account not found.");
  }

  if (user.passwordHash !== hashPassword(oldPassword)) {
    throw new Error("Current password is incorrect.");
  }

  return updateUserInDb({
    ...user,
    passwordHash: hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
  });
}

export async function changeEmail(userId: string, newEmail: string): Promise<UserAccount> {
  const email = normalizeEmail(newEmail);
  const user = await findUserByIdFromDb(userId);

  if (!user) {
    throw new Error("Account not found.");
  }

  const existing = await findUserByEmailFromDb(email);
  if (existing && existing.id !== userId) {
    throw new Error("Email is already in use.");
  }

  return updateUserInDb({
    ...user,
    email,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteAccount(userId: string): Promise<void> {
  await ensureUsersTable();
  await execute(`delete from users where id = $1`, [userId]);
}
