import { execute, query } from "./azure/postgres";
import { sendOtpEmail } from "./azure/messaging";
import { getUserById } from "./auth-store";
import { getProfileByUserId } from "./profile-store";
import { VerificationCheck, VerificationCheckType, VerificationProgress } from "./types";
import type { StudentProfile, UserAccount } from "./types";

type VerificationRow = {
  id: string;
  user_id: string;
  check_type: VerificationCheckType;
  completed: boolean;
  description: string;
  action_url: string | null;
  icon: string;
  created_at: string | Date;
  completed_at: string | Date | null;
  email_address: string | null;
  email_otp_code: string | null;
  email_otp_expiry: string | Date | null;
  email_otp_attempts: number | null;
  phone_number: string | null;
  phone_otp_code: string | null;
  phone_otp_expiry: string | Date | null;
  phone_otp_attempts: number | null;
  id_document_url: string | null;
  id_document_name: string | null;
};

const DEFAULT_CHECKS: Array<Pick<VerificationCheck, "checkType" | "description" | "actionUrl" | "icon" | "completed">> = [
  { checkType: "email_verified", completed: false, description: "Email address verified", icon: "✉️" },
  { checkType: "faculty_id_verified", completed: false, description: "Upload and verify your faculty/student ID", actionUrl: "/verification?action=id", icon: "🆔" },
  { checkType: "profile_photo_verified", completed: false, description: "Add a clear profile photo", actionUrl: "/profile/edit", icon: "📷" },
  { checkType: "profile_complete", completed: false, description: "Complete all profile information", actionUrl: "/profile/edit", icon: "👤" },
  { checkType: "bio_verified", completed: false, description: "Write a bio and add your skills", actionUrl: "/profile/edit", icon: "✍️" },
];

function isVisibleCheckType(checkType: VerificationCheckType): boolean {
  return checkType !== "phone_verified";
}

function generateId(): string {
  return `vc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isSchoolEmail(email?: string | null): boolean {
  return Boolean(email && email.toLowerCase().endsWith("@st.lasu.edu.ng"));
}

function hasText(value?: string | null): boolean {
  return Boolean(value && value.trim());
}

function isCompleteProfile(profile?: StudentProfile | null): boolean {
  if (!profile) {
    return false;
  }

  return Boolean(
    hasText(profile.fullName) &&
      hasText(profile.faculty) &&
      hasText(profile.department) &&
      hasText(profile.level) &&
      hasText(profile.phone) &&
      hasText(profile.locationText) &&
      hasText(profile.primarySkill) &&
      hasText(profile.mode),
  );
}

function deriveCompletedAt(checkType: VerificationCheckType, user?: UserAccount | null): string | undefined {
  if (checkType === "email_verified") {
    return user?.updatedAt || user?.createdAt || undefined;
  }

  return user?.updatedAt || user?.createdAt || undefined;
}

function getOtpExpiry(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 15);
  return now.toISOString();
}

function mapVerificationRow(row: VerificationRow): VerificationCheck {
  return {
    id: row.id,
    userId: row.user_id,
    checkType: row.check_type,
    completed: row.completed,
    description: row.description,
    actionUrl: row.action_url ?? undefined,
    icon: row.icon,
    createdAt: new Date(row.created_at).toISOString(),
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
    emailAddress: row.email_address ?? undefined,
    emailOtpCode: row.email_otp_code ?? undefined,
    emailOtpExpiry: row.email_otp_expiry ? new Date(row.email_otp_expiry).toISOString() : undefined,
    emailOtpAttempts: row.email_otp_attempts ?? undefined,
    phoneNumber: row.phone_number ?? undefined,
    phoneOtpCode: row.phone_otp_code ?? undefined,
    phoneOtpExpiry: row.phone_otp_expiry ? new Date(row.phone_otp_expiry).toISOString() : undefined,
    phoneOtpAttempts: row.phone_otp_attempts ?? undefined,
    idDocumentUrl: row.id_document_url ?? undefined,
    idDocumentName: row.id_document_name ?? undefined,
  };
}

async function ensureTable(): Promise<void> {
  await execute(`
    create table if not exists verification_checks (
      id text primary key,
      user_id text not null,
      check_type text not null,
      completed boolean not null default false,
      description text not null,
      action_url text null,
      icon text not null,
      created_at timestamptz not null default now(),
      completed_at timestamptz null,
      email_address text null,
      email_otp_code text null,
      email_otp_expiry timestamptz null,
      email_otp_attempts integer null,
      phone_number text null,
      phone_otp_code text null,
      phone_otp_expiry timestamptz null,
      phone_otp_attempts integer null,
      id_document_url text null,
      id_document_name text null,
      unique (user_id, check_type)
    )
  `);
}

async function getChecks(userId: string): Promise<VerificationCheck[]> {
  await ensureTable();
  const result = await query<VerificationRow>(`select * from verification_checks where user_id = $1 order by created_at asc`, [userId]);
  return result.rows.map(mapVerificationRow).filter((check) => isVisibleCheckType(check.checkType));
}

async function buildProgressChecks(userId: string): Promise<VerificationCheck[]> {
  const [checks, user] = await Promise.all([
    getOrCreateVerificationChecks(userId),
    getUserById(userId),
  ]);

  return checks.map((check) => {
    if (check.checkType === "email_verified") {
      const completed = check.completed || Boolean(user?.verified && isSchoolEmail(user.email));
      return {
        ...check,
        completed,
        completedAt: completed ? check.completedAt ?? deriveCompletedAt(check.checkType, user) : undefined,
      };
    }

    return check;
  });
}

async function reconcileChecksFromProfile(userId: string): Promise<void> {
  try {
    const profile = await getProfileByUserId(userId);

    if (!profile) {
      return;
    }

    await syncVerificationChecksFromProfileState({
      userId,
      profilePhotoVerified: Boolean(profile.profileImage),
      profileComplete: isCompleteProfile(profile),
      bioVerified: Boolean(profile.bio && profile.primarySkill),
    });
  } catch (error) {
    console.error("Unable to reconcile verification checks from profile", error);
  }
}

export async function syncVerificationChecksFromProfileState(input: {
  userId: string;
  emailVerified?: boolean;
  profilePhotoVerified?: boolean;
  profileComplete?: boolean;
  bioVerified?: boolean;
}): Promise<void> {
  const nextStates: Array<[VerificationCheckType, boolean | undefined]> = [
    ["email_verified", input.emailVerified],
    ["profile_photo_verified", input.profilePhotoVerified],
    ["profile_complete", input.profileComplete],
    ["bio_verified", input.bioVerified],
  ];

  await Promise.all(
    nextStates.map(async ([checkType, completed]) => {
      if (typeof completed !== "boolean") {
        return;
      }

      await updateVerificationCheck(input.userId, checkType, completed);
    }),
  );
}

async function upsertCheck(input: VerificationCheck): Promise<void> {
  await ensureTable();
  await query<VerificationRow>(
    `insert into verification_checks (
      id, user_id, check_type, completed, description, action_url, icon, created_at, completed_at,
      email_address, email_otp_code, email_otp_expiry, email_otp_attempts, phone_number, phone_otp_code,
      phone_otp_expiry, phone_otp_attempts, id_document_url, id_document_name
    ) values (
      $1, $2, $3, $4, $5, $6, $7, $8::timestamptz, $9::timestamptz, $10, $11, $12::timestamptz,
      $13, $14, $15, $16::timestamptz, $17, $18, $19
    ) on conflict (user_id, check_type) do update set
      completed = excluded.completed,
      description = excluded.description,
      action_url = excluded.action_url,
      icon = excluded.icon,
      created_at = excluded.created_at,
      completed_at = excluded.completed_at,
      email_address = excluded.email_address,
      email_otp_code = excluded.email_otp_code,
      email_otp_expiry = excluded.email_otp_expiry,
      email_otp_attempts = excluded.email_otp_attempts,
      phone_number = excluded.phone_number,
      phone_otp_code = excluded.phone_otp_code,
      phone_otp_expiry = excluded.phone_otp_expiry,
      phone_otp_attempts = excluded.phone_otp_attempts,
      id_document_url = excluded.id_document_url,
      id_document_name = excluded.id_document_name`,
    [
      input.id,
      input.userId,
      input.checkType,
      input.completed,
      input.description,
      input.actionUrl ?? null,
      input.icon,
      input.createdAt,
      input.completedAt ?? null,
      input.emailAddress ?? null,
      input.emailOtpCode ?? null,
      input.emailOtpExpiry ?? null,
      input.emailOtpAttempts ?? null,
      input.phoneNumber ?? null,
      input.phoneOtpCode ?? null,
      input.phoneOtpExpiry ?? null,
      input.phoneOtpAttempts ?? null,
      input.idDocumentUrl ?? null,
      input.idDocumentName ?? null,
    ],
  );
}

async function updateCheck(userId: string, checkType: VerificationCheckType, patch: Partial<VerificationCheck>): Promise<VerificationCheck | null> {
  const checks = await getChecks(userId);
  const current = checks.find((entry) => entry.checkType === checkType);
  if (!current) {
    return null;
  }

  const updated: VerificationCheck = { ...current, ...patch };
  await upsertCheck(updated);
  return updated;
}

export async function getOrCreateVerificationChecks(userId: string): Promise<VerificationCheck[]> {
  await ensureTable();
  const existing = await getChecks(userId);
  if (existing.length > 0) {
    return existing;
  }

  const now = new Date().toISOString();
  const defaults = DEFAULT_CHECKS.map((entry) => ({
    id: generateId(),
    userId,
    checkType: entry.checkType,
    completed: entry.completed,
    description: entry.description,
    actionUrl: entry.actionUrl,
    icon: entry.icon,
    createdAt: now,
    completedAt: entry.completed ? now : undefined,
  } satisfies VerificationCheck));

  await Promise.all(defaults.map((check) => upsertCheck(check)));
  return defaults;
}

export async function getVerificationChecks(userId: string): Promise<VerificationCheck[]> {
  return getOrCreateVerificationChecks(userId);
}

export async function updateVerificationCheck(
  userId: string,
  checkType: VerificationCheckType,
  completed: boolean,
): Promise<VerificationCheck | null> {
  const now = new Date().toISOString();
  return updateCheck(userId, checkType, {
    completed,
    completedAt: completed ? now : undefined,
  });
}

export async function getVerificationProgress(userId: string): Promise<VerificationProgress> {
  await reconcileChecksFromProfile(userId);
  const checks = await buildProgressChecks(userId);
  const completedChecks = checks.filter((check) => check.completed).length;
  const totalChecks = checks.length;
  const percentageComplete = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

  return {
    userId,
    totalChecks,
    completedChecks,
    percentageComplete,
    checks: checks.sort((a, b) => {
      if (a.completed === b.completed) {
        return a.checkType.localeCompare(b.checkType);
      }
      return a.completed ? 1 : -1;
    }),
  };
}

export async function completeVerificationCheck(userId: string, checkType: VerificationCheckType): Promise<VerificationCheck | null> {
  return updateVerificationCheck(userId, checkType, true);
}

export async function resetVerificationCheck(userId: string, checkType: VerificationCheckType): Promise<VerificationCheck | null> {
  return updateVerificationCheck(userId, checkType, false);
}

export async function sendEmailOTP(userId: string, emailAddress: string): Promise<VerificationCheck | null> {
  const checks = await getOrCreateVerificationChecks(userId);
  const current = checks.find((check) => check.checkType === "email_verified");
  if (!current) {
    return null;
  }

  const otp = generateOTP();
  const updated = await updateCheck(userId, "email_verified", {
    emailAddress,
    emailOtpCode: otp,
    emailOtpExpiry: getOtpExpiry(),
    emailOtpAttempts: 0,
  });

  if (!updated) {
    return null;
  }

  const delivered = await sendOtpEmail(emailAddress, otp);
  if (!delivered) {
    throw new Error("Email OTP delivery is not configured.");
  }

  return updated;
}

export async function verifyEmailOTP(userId: string, otp: string): Promise<{ success: boolean; message: string }> {
  const checks = await getOrCreateVerificationChecks(userId);
  const current = checks.find((check) => check.checkType === "email_verified");

  if (!current) {
    return { success: false, message: "Verification check not found" };
  }

  if (!current.emailOtpCode || !current.emailOtpExpiry) {
    return { success: false, message: "No OTP has been sent" };
  }

  if (new Date(current.emailOtpExpiry) < new Date()) {
    return { success: false, message: "OTP has expired" };
  }

  if ((current.emailOtpAttempts || 0) >= 3) {
    return { success: false, message: "Too many attempts" };
  }

  if (current.emailOtpCode !== otp) {
    await updateCheck(userId, "email_verified", {
      emailOtpAttempts: (current.emailOtpAttempts || 0) + 1,
    });
    return { success: false, message: "Invalid OTP" };
  }

  await updateCheck(userId, "email_verified", {
    completed: true,
    completedAt: new Date().toISOString(),
    emailOtpCode: undefined,
    emailOtpExpiry: undefined,
    emailOtpAttempts: undefined,
  });

  return { success: true, message: "Email verified successfully" };
}

export async function sendPhoneOTP(userId: string, phoneNumber: string): Promise<VerificationCheck | null> {
  throw new Error("Phone verification has been removed.");
}

export async function verifyPhoneOTP(userId: string, otp: string): Promise<{ success: boolean; message: string }> {
  throw new Error("Phone verification has been removed.");
}

export async function setIDDocument(userId: string, documentUrl: string, documentName: string): Promise<VerificationCheck | null> {
  return updateCheck(userId, "faculty_id_verified", {
    idDocumentUrl: documentUrl,
    idDocumentName: documentName,
    completed: true,
    completedAt: new Date().toISOString(),
  });
}

export async function getCheckByType(userId: string, checkType: VerificationCheckType): Promise<VerificationCheck | null> {
  const checks = await getOrCreateVerificationChecks(userId);
  return checks.find((check) => check.checkType === checkType) ?? null;
}
