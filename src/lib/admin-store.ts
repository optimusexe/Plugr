import { getInteractions } from "@/lib/interaction-store";
import { getMetrics, getProfiles } from "@/lib/profile-store";
import { getReviews } from "@/lib/review-store";
import { getUsers, setUserAdminStatus } from "@/lib/auth-store";
import { getVerificationProgress } from "@/lib/verification-store";
import { getCachedAsync, setCachedAsync } from "@/lib/redis-cache";
import type { ProviderReview, ServiceInteraction, StudentProfile, UserAccount, VerificationProgress } from "@/lib/types";

export type AdminUserRow = {
  user: UserAccount;
  profile: StudentProfile | null;
};

export type AdminVerificationRow = {
  user: UserAccount;
  profile: StudentProfile;
  progress: VerificationProgress;
};

export type AdminVerifiedProfileRow = {
  user: UserAccount;
  profile: StudentProfile;
};

export type AdminOverview = {
  totalUsers: number;
  adminCount: number;
  verifiedAccounts: number;
  badgeApprovedProfiles: number;
  pendingBadgeProfiles: number;
  metrics: Awaited<ReturnType<typeof getMetrics>>;
  recentUsers: UserAccount[];
  recentReviews: ProviderReview[];
  recentInteractions: ServiceInteraction[];
  topProviders: StudentProfile[];
};

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const cacheKey = `admin:users`;
  const cached = await getCachedAsync<AdminUserRow[]>(cacheKey);
  if (cached) return cached;

  const [users, profiles] = await Promise.all([getUsers(), getProfiles()]);
  const profilesByUserId = new Map(profiles.map((profile) => [profile.userId, profile]));

  return users
    .map((user) => ({ user, profile: profilesByUserId.get(user.id) ?? null }))
    .sort((a, b) => b.user.updatedAt.localeCompare(a.user.updatedAt));
}

export async function getAdminVerificationQueue(): Promise<AdminVerificationRow[]> {
  const cacheKey = `admin:verificationQueue`;
  const cached = await getCachedAsync<AdminVerificationRow[]>(cacheKey);
  if (cached) return cached;

  const [users, profiles] = await Promise.all([getUsers(), getProfiles()]);
  const usersById = new Map(users.map((user) => [user.id, user]));

  const pendingProfiles = profiles
    .filter((profile) => profile.verificationStatus === "pending")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const rows = await Promise.all(
    pendingProfiles.map(async (profile) => {
      const user = usersById.get(profile.userId);
      if (!user) {
        return null;
      }

      const progress = await getVerificationProgress(profile.userId);
      return { user, profile, progress };
    }),
  );

  const filtered = rows.filter((row): row is AdminVerificationRow => Boolean(row));
  // cache short-lived to reduce repeated DB work
  await setCachedAsync(cacheKey, filtered, 30000);
  return filtered;
}

export async function getAdminVerifiedProfiles(): Promise<AdminVerifiedProfileRow[]> {
  const cacheKey = `admin:verifiedProfiles`;
  const cached = await getCachedAsync<AdminVerifiedProfileRow[]>(cacheKey);
  if (cached) return cached;

  const [users, profiles] = await Promise.all([getUsers(), getProfiles()]);
  const usersById = new Map(users.map((user) => [user.id, user]));

  const verifiedProfiles = profiles
    .filter((profile) => profile.verificationStatus === "verified")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const rows = verifiedProfiles
    .map((profile) => {
      const user = usersById.get(profile.userId);
      if (!user) {
        return null;
      }

      return { user, profile };
    })
    .filter((row): row is AdminVerifiedProfileRow => Boolean(row));

  await setCachedAsync(cacheKey, rows, 30000);
  return rows;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const cacheKey = `admin:overview`;
  const cached = await getCachedAsync<AdminOverview>(cacheKey);
  if (cached) return cached;

  const [metrics, users, profiles, reviews, interactions] = await Promise.all([
    getMetrics(),
    getUsers(),
    getProfiles(),
    getReviews(),
    getInteractions(),
  ]);

  const providerProfiles = profiles
    .filter((profile) => profile.mode === "provider" || profile.mode === "both")
    .sort((a, b) => b.credibility - a.credibility);

  return {
    totalUsers: users.length,
    adminCount: users.filter((user) => user.isAdmin).length,
    verifiedAccounts: users.filter((user) => user.verified).length,
    badgeApprovedProfiles: profiles.filter((profile) => profile.verificationStatus === "verified").length,
    pendingBadgeProfiles: profiles.filter((profile) => profile.verificationStatus === "pending").length,
    metrics,
    recentUsers: users.slice(-8).reverse(),
    recentReviews: reviews.slice(-8).reverse(),
    recentInteractions: interactions.slice(-8).reverse(),
    topProviders: providerProfiles.slice(0, 5),
  };
}

export async function setAdminUserStatus(userId: string, isAdmin: boolean): Promise<UserAccount | null> {
  return setUserAdminStatus(userId, isAdmin);
}