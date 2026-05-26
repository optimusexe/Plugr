import crypto from "node:crypto";
import { execute, query } from "@/lib/azure/postgres";
import { sendOtpEmail, sendEmail } from "@/lib/azure/messaging";
import { logAudit } from "@/lib/audit";
import { getAdminBootstrapEmails } from "@/lib/azure/config";
import type { AuthRegisterPayload, UserAccount } from "@/lib/types";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  verified: boolean;
  is_admin: boolean;
  deactivated_until: string | Date | null;
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
    deactivatedUntil: toIsoString(row.deactivated_until),
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
      deactivated_until timestamptz null,
      verification_code text null,
      verification_code_expires_at timestamptz null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await execute(`alter table users add column if not exists is_admin boolean not null default false`);
  await execute(`alter table users add column if not exists deactivated_until timestamptz null`);
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
    `insert into users (id, full_name, email, password_hash, verified, is_admin, deactivated_until, verification_code, verification_code_expires_at, created_at, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8, $9, $10::timestamptz, $11::timestamptz)
     returning *`,
    [
      user.id,
      user.fullName,
      user.email,
      user.passwordHash,
      user.verified,
      user.isAdmin,
      user.deactivatedUntil ?? null,
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
         deactivated_until = $7::timestamptz,
         verification_code = $8,
         verification_code_expires_at = $9,
         updated_at = $10::timestamptz
     where id = $1
     returning *`,
    [
      user.id,
      user.fullName,
      user.email,
      user.passwordHash,
      user.verified,
      user.isAdmin,
      user.deactivatedUntil ?? null,
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

function createAccountDeactivatedError(untilIso: string): Error & { code: string } {
  const formattedUntil = new Date(untilIso).toLocaleString();
  const error = new Error(`Account is temporarily deactivated until ${formattedUntil}.`) as Error & { code: string };
  error.code = "ACCOUNT_DEACTIVATED";
  return error;
}

async function clearExpiredDeactivationIfNeeded(user: UserAccount): Promise<UserAccount> {
  if (!user.deactivatedUntil) {
    return user;
  }

  const deactivatedUntilMs = new Date(user.deactivatedUntil).getTime();
  if (Number.isNaN(deactivatedUntilMs) || deactivatedUntilMs > Date.now()) {
    return user;
  }

  return updateUserInDb({
    ...user,
    deactivatedUntil: undefined,
    updatedAt: new Date().toISOString(),
  });
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
    deactivatedUntil: undefined,
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

export async function requestPasswordReset(emailInput: string): Promise<void> {
  const email = normalizeEmail(emailInput);
  const user = await findUserByEmailFromDb(email);
  if (!user) {
    // Do not reveal whether account exists
    return;
  }

  const code = createVerificationCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await updateUserInDb({
    ...user,
    verificationCode: code,
    verificationCodeExpiresAt: expires,
    updatedAt: new Date().toISOString(),
  });

  await sendOtpEmail(user.email, code).catch(() => undefined);
}

export async function resetPasswordWithCode(emailInput: string, code: string, newPassword: string): Promise<UserAccount> {
  const email = normalizeEmail(emailInput);
  const user = await findUserByEmailFromDb(email);
  if (!user) {
    throw new Error("Invalid code or email.");
  }

  if (!user.verificationCode || !user.verificationCodeExpiresAt) {
    throw new Error("No reset code requested.");
  }

  if (new Date(user.verificationCodeExpiresAt).getTime() < Date.now()) {
    throw new Error("Reset code has expired.");
  }

  if (user.verificationCode !== code.trim()) {
    throw new Error("Invalid reset code.");
  }

  return updateUserInDb({
    ...user,
    passwordHash: hashPassword(newPassword),
    verificationCode: undefined,
    verificationCodeExpiresAt: undefined,
    updatedAt: new Date().toISOString(),
  });
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

  const activeUser = await clearExpiredDeactivationIfNeeded(user);
  if (activeUser.deactivatedUntil && new Date(activeUser.deactivatedUntil).getTime() > Date.now()) {
    throw createAccountDeactivatedError(activeUser.deactivatedUntil);
  }

  if (!activeUser.verified) {
    throw new Error("Account not verified.");
  }

  return activeUser;
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

  const activeUser = await clearExpiredDeactivationIfNeeded(user);
  if (activeUser.deactivatedUntil && new Date(activeUser.deactivatedUntil).getTime() > Date.now()) {
    throw createAccountDeactivatedError(activeUser.deactivatedUntil);
  }

  return { user: activeUser, verified: activeUser.verified };
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

export async function verifyUserPassword(userId: string, password: string): Promise<boolean> {
  const user = await findUserByIdFromDb(userId);

  if (!user) {
    throw new Error("Account not found.");
  }

  return user.passwordHash === hashPassword(password);
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

export async function deactivateAccount(userId: string, untilIso: string): Promise<UserAccount> {
  const user = await findUserByIdFromDb(userId);

  if (!user) {
    throw new Error("Account not found.");
  }

  const untilMs = new Date(untilIso).getTime();
  if (Number.isNaN(untilMs) || untilMs <= Date.now()) {
    throw new Error("Please choose a future deactivation time.");
  }

  // Limit deactivation period to 365 days
  const maxMs = Date.now() + 365 * 24 * 60 * 60 * 1000;
  if (untilMs > maxMs) {
    throw new Error("Deactivation period cannot exceed 365 days.");
  }

  return updateUserInDb({
    ...user,
    deactivatedUntil: new Date(untilMs).toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

// Wrap with audit/logging and email notification
const originalDeactivate = deactivateAccount;
export async function deactivateAccountWithNotify(userId: string, untilIso: string): Promise<UserAccount> {
  const updated = await originalDeactivate(userId, untilIso);
  try {
    await logAudit(userId, "account_deactivated", { deactivatedUntil: updated.deactivatedUntil });
    await sendEmail(updated.email, "Account deactivated", `Your account has been deactivated until ${new Date(updated.deactivatedUntil || "").toLocaleString()}`);
  } catch (e) {
    // ignore
  }
  return updated;
}

export async function reactivateAccount(userId: string): Promise<UserAccount> {
  const user = await findUserByIdFromDb(userId);

  if (!user) {
    throw new Error("Account not found.");
  }

  return updateUserInDb({
    ...user,
    deactivatedUntil: undefined,
    updatedAt: new Date().toISOString(),
  });
}

const originalReactivate = reactivateAccount;
export async function reactivateAccountWithNotify(userId: string): Promise<UserAccount> {
  const updated = await originalReactivate(userId);
  try {
    await logAudit(userId, "account_reactivated", {});
    await sendEmail(updated.email, "Account reactivated", `Your account has been reactivated.`);
  } catch (e) {
    // ignore
  }
  return updated;
}

export async function deleteAccount(userId: string): Promise<void> {
  await ensureUsersTable();

  const statements: Array<{ sql: string; params?: unknown[] }> = [
    { sql: `delete from notifications where user_id = $1`, params: [userId] },
    { sql: `delete from verification_checks where user_id = $1`, params: [userId] },
    { sql: `delete from support_messages where sender_user_id = $1 or conversation_id in (select id from support_conversations where user_id = $1)`, params: [userId] },
    { sql: `delete from support_conversations where user_id = $1`, params: [userId] },
    { sql: `delete from reviews where consumer_id = $1 or provider_user_id = $1`, params: [userId] },
    { sql: `delete from interactions where consumer_id = $1 or provider_user_id = $1`, params: [userId] },
    { sql: `delete from profiles where user_id = $1`, params: [userId] },
    { sql: `delete from users where id = $1`, params: [userId] },
  ];

  for (const statement of statements) {
    try {
      await execute(statement.sql, statement.params ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/relation .* does not exist|42P01/i.test(message)) {
        continue;
      }
      throw error;
    }
  }
}

export async function deleteAccountWithNotify(userId: string): Promise<void> {
  const user = await findUserByIdFromDb(userId);
  try {
    if (user) {
      await logAudit(userId, "account_deletion_requested", {});
      await sendEmail(user.email, "Account deleted", `Your account and all associated data have been removed from Plugr.`);
    }
  } catch (e) {
    // swallow
  }

  await deleteAccount(userId);
  try {
    await logAudit(userId, "account_deleted", {});
  } catch (e) {
    // swallow
  }
}
