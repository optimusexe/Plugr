# Plugr Verification System - Complete Analysis

## Overview
The Plugr codebase contains **two distinct verification systems**:

1. **Account Verification** - Email-based account verification during registration
2. **Profile Verification** - Status badge system for profile trust and discovery

---

## 1. Account Verification System

### Data Model: `UserAccount` Type
**File:** [src/lib/types.ts](src/lib/types.ts#L46-L54)

```typescript
export type UserAccount = {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  verified: boolean;                    // ← Account verification flag
  verificationCode?: string;            // ← 6-digit code
  verificationCodeExpiresAt?: string;   // ← 10-minute expiry
  createdAt: string;
  updatedAt: string;
};
```

### Verification Fields
- **`verified`**: boolean - Whether email has been verified
- **`verificationCode`**: string - 6-digit code sent to email
- **`verificationCodeExpiresAt`**: ISO timestamp - Code expires in 10 minutes

### Account Verification Flow

#### Registration
**File:** [src/app/api/auth/register/route.ts](src/app/api/auth/register/route.ts)

1. User creates account with email/password
2. System generates 6-digit verification code
3. Code stored with 10-minute expiry
4. User receives code (in dev mode: shown on screen)
5. Account starts with `verified: false`

**Implementation:** [src/lib/auth-store.ts](src/lib/auth-store.ts#L46-L70)
```typescript
export async function registerAccount(payload: AuthRegisterPayload) {
  // Creates verification code
  const code = createVerificationCode(); // 6 digits
  const expires = new Date(now.getTime() + 10 * 60 * 1000); // 10 min
  
  const user: UserAccount = {
    // ...
    verified: false,
    verificationCode: code,
    verificationCodeExpiresAt: expires,
  };
}
```

#### Verification
**File:** [src/app/api/auth/verify/route.ts](src/app/api/auth/verify/route.ts)

User submits code → verified endpoint validates it

**Implementation:** [src/lib/auth-store.ts](src/lib/auth-store.ts#L72-L104)
```typescript
export async function verifyAccount(userId: string, code: string): Promise<UserAccount> {
  // Validates:
  // 1. User exists
  // 2. Code matches
  // 3. Code hasn't expired
  // Sets verified: true, clears verification code
}
```

#### Login Gate
**File:** [src/lib/auth-store.ts](src/lib/auth-store.ts#L106-L122)
```typescript
export async function loginAccount(emailInput: string, password: string) {
  // ... finds user ...
  if (!user.verified) {
    throw new Error("Account not verified."); // ← Login blocked
  }
  return user;
}
```

### UI Components Using Account Verification

**Registration Flow:** [src/components/workflows/auth-register-flow.tsx](src/components/workflows/auth-register-flow.tsx)
- Two-step form: Create account → Enter verification code
- Shows dev code in development mode
- Redirects to `/profile/setup` after verification

**Data File:** [src/data/users.json](src/data/users.json)
```json
{
  "id": "u_bzs91yjm",
  "fullName": "Elijah Babatunde",
  "email": "babseli933@gmail.com",
  "passwordHash": "...",
  "verified": true,
  "createdAt": "2026-04-20T23:16:25.868Z",
  "updatedAt": "2026-04-20T23:16:34.566Z"
}
```

---

## 2. Profile Verification System

### Data Model: `StudentProfile` Type
**File:** [src/lib/types.ts](src/lib/types.ts#L3-L32)

```typescript
export type VerificationStatus = "pending" | "verified";

export type StudentProfile = {
  id: string;
  userId: string;
  profileImage?: string;
  products?: ProfileProduct[];
  fullName: string;
  faculty: string;
  department: string;
  level: string;
  phone: string;
  email?: string;
  locationText: string;
  mapLink?: string;
  primarySkill?: string;
  bio?: string;
  mode: ProfileMode;
  verificationStatus: VerificationStatus;  // ← Profile verification
  credibility: number;                      // ← Trust signal
  createdAt: string;
  updatedAt: string;
};
```

### Verification Fields
- **`verificationStatus`**: "pending" | "verified" - Profile trust badge
- **`credibility`**: number (0-100) - Secondary trust signal based on reviews

### Profile Verification Status Initialization

**File:** [src/lib/profile-store.ts](src/lib/profile-store.ts#L75)

When a profile is created, verification defaults to **"pending"**:
```typescript
export async function registerProfile(payload: RegisterPayload) {
  const profile: StudentProfile = {
    // ... all profile fields ...
    verificationStatus: "pending",
    credibility: 0,
  };
}
```

### Where Profile Verification is Used

#### 1. Profile View Page
**File:** [src/app/profile/page.tsx](src/app/profile/page.tsx#L120-L122)

Shows verification status in profile details card:
```typescript
<article className="rounded-xl border border-black/10 bg-white p-4">
  <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Verification</p>
  <p className="mt-1 text-sm font-semibold capitalize">{profile.verificationStatus}</p>
</article>
```

#### 2. Discovery/Search
**File:** [src/components/workflows/discover-workflow.tsx](src/components/workflows/discover-workflow.tsx)

**Sorting:**
- Sort by "verified" prioritizes verified providers
- Sorts verified first (-1), pending last (1)

**Filtering:**
- Type: `VerificationFilter = "all" | "verified" | "pending"`
- Users can filter providers by verification status

**Display:**
- Shows badge on provider cards: 
  - `"Verified"` (green/accent) if `verificationStatus === "verified"`
  - `"Pending"` (gray) if `verificationStatus === "pending"`

```typescript
<span
  className={`rounded-md px-2 py-1 font-semibold ${
    provider.verificationStatus === "verified"
      ? "bg-[var(--accent)] text-white"
      : "bg-black/10 text-black"
  }`}
>
  {provider.verificationStatus === "verified" ? "Verified" : "Pending"}
</span>
```

#### 3. Profile Store Logic
**File:** [src/lib/profile-store.ts](src/lib/profile-store.ts#L175-L216)

```typescript
export async function getVerifiedProfiles(): Promise<StudentProfile[]> {
  const profiles = await getProfiles();
  return profiles.filter((profile) => profile.verificationStatus === "verified");
}

export async function getMetrics(): Promise<Metrics> {
  // ... calculates verifiedProviderRate based on count ...
  const verifiedProviders = providerProfiles.filter(
    (profile) => profile.verificationStatus === "verified"
  );
}
```

**Data File:** [src/data/profiles.json](src/data/profiles.json)
```json
{
  "id": "p_ykau9umh",
  "userId": "u_bzs91yjm",
  "verificationStatus": "pending",
  "credibility": 0,
  // ... other fields ...
}
```

---

## 3. Verification Checks/Fields Currently Tracked

### ✅ Current Verification Checks (IMPLEMENTED)

| Check | Type | Location | Verified | Pending |
|-------|------|----------|----------|---------|
| **Email Verification** | Account | UserAccount.verified | ✅ | ✅ |
| **Email Code** | Account | UserAccount.verificationCode | ✅ | ✅ |
| **Profile Status** | Profile | StudentProfile.verificationStatus | ✅ | ✅ |

### ❌ NOT Implemented (Missing)

- Phone verification
- Faculty/student ID verification
- Document verification (diploma, student card)
- Email verification at profile level (separate from account)
- Background checks
- Individual verification checks/items (granular)

---

## 4. Current Verification Logic Summary

### Account Verification Logic
1. **Registration**: Generate 6-digit code, set 10-min expiry
2. **Verification**: Validate code match and expiry
3. **Login**: Require `user.verified === true`
4. **Persistence**: Codes cleared after verification

### Profile Verification Logic
1. **Defaults**: All new profiles start as `"pending"`
2. **Status**: Only "pending" or "verified" (binary)
3. **No Auto-Verification**: Profiles must be manually set to verified (by admin)
4. **Trust Signals**: Credibility score (0-100) complements status
5. **Discovery Impact**: Verified status affects sorting and filtering

### Key Observations
- **No endpoint exists to change profile verification status** (must be manual in DB or need new endpoint)
- **Admin verification tooling is not implemented** (per README)
- **Verification is binary** - no intermediate steps/checklist items currently
- **No fine-grained verification checks** - only account email + profile status

---

## 5. Files Involved in Verification System

### Types & Models
- [src/lib/types.ts](src/lib/types.ts) - Type definitions

### Authentication & Account
- [src/lib/auth-store.ts](src/lib/auth-store.ts) - Account verification logic
- [src/app/api/auth/register/route.ts](src/app/api/auth/register/route.ts) - Register endpoint
- [src/app/api/auth/verify/route.ts](src/app/api/auth/verify/route.ts) - Verify endpoint

### Profile Management
- [src/lib/profile-store.ts](src/lib/profile-store.ts) - Profile logic & status checks
- [src/app/api/register/route.ts](src/app/api/register/route.ts) - Profile registration

### UI Components
- [src/components/workflows/auth-register-flow.tsx](src/components/workflows/auth-register-flow.tsx) - Registration UI
- [src/components/workflows/discover-workflow.tsx](src/components/workflows/discover-workflow.tsx) - Discovery filtering/display
- [src/app/profile/page.tsx](src/app/profile/page.tsx) - Profile view

### Data Files
- [src/data/users.json](src/data/users.json) - Account data
- [src/data/profiles.json](src/data/profiles.json) - Profile data

---

## 6. Recommendations for Verification Checklist Page

### What Should Be Displayed

#### Account-Level Checks (Required for Login)
- ✅ Email Verified - Shows completion status (code sent/verified)

#### Profile-Level Checks (For Trust/Discovery)
- Profile Verification Status
  - Manual admin review needed
  - Show as "Pending" or "Verified"
  
#### Optional Future Checks (Not Yet Implemented)
- Phone Verification
- Faculty/Student ID Verification
- Document Upload (student card, diploma)
- Background Check Status
- Identity Verification

### Current Verification Checklist Model
```typescript
// Proposed structure for verification page
type VerificationCheck = {
  id: string;           // e.g., "email", "phone", "faculty_id"
  label: string;        // e.g., "Email Verification"
  status: "pending" | "verified" | "not_started";
  description: string;
  action?: string;      // e.g., "Resend code", "Upload document"
  completedAt?: string;
};

// What would be shown for a user:
[
  {
    id: "email",
    label: "Email Verified",
    status: "verified",
    description: "Your email has been verified",
    completedAt: "2026-04-20T23:16:34.566Z"
  },
  {
    id: "profile_verification",
    label: "Profile Verification",
    status: "pending",
    description: "Awaiting admin review",
  }
]
```

---

## Summary Table

| Aspect | Current Implementation |
|--------|------------------------|
| Account Verification | ✅ Email code-based, 10-min expiry |
| Profile Verification | ✅ Binary status (pending/verified) |
| Email Verification | ✅ Required for login |
| Phone Verification | ❌ Not implemented |
| Faculty Verification | ❌ Not implemented |
| Document Verification | ❌ Not implemented |
| Granular Checks | ❌ No individual check items |
| Admin Panel | ❌ Not implemented |
| Auto-Verification | ❌ Manual only |
| Credibility Score | ✅ Based on reviews (0-100) |
| Trust Display | ✅ Badge + credibility score |

