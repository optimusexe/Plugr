"use client";

import type { StudentProfile } from "@/lib/types";
import { computeProfileSetupScore } from "@/lib/credibility";

type Props = {
  profile: Partial<StudentProfile> | null;
};

export default function CredibilityChecklist({ profile }: Props) {
  const items = [
    { key: 'fullName', label: 'Full name', points: 6, completed: Boolean(profile?.fullName && profile.fullName.trim().length > 0), hint: 'Add your full name.' },
    { key: 'profileImage', label: 'Profile photo', points: 6, completed: Boolean(profile?.profileImage && profile.profileImage.trim().length > 0), hint: 'Upload a clear photo.' },
    { key: 'bio', label: 'Bio', points: 5, completed: Boolean(profile?.bio && profile.bio.trim().length > 0), hint: 'Write a short description of your services.' },
    { key: 'primarySkill', label: 'Primary skill', points: 4, completed: Boolean(profile?.primarySkill && profile.primarySkill.trim().length > 0), hint: 'Select a primary skill.' },
    { key: 'contact', label: 'Contact (phone or email)', points: 4, completed: Boolean((profile?.phone && profile.phone.trim().length > 0) || (profile?.email && profile.email.trim().length > 0)), hint: 'Add phone or email so customers can contact you.' },
    { key: 'products', label: 'Products / Services', points: 5, completed: Boolean(Array.isArray(profile?.products) && profile!.products!.length > 0), hint: 'Add at least one product or service.' },
  ];

  const subtotal = computeProfileSetupScore((profile as StudentProfile) ?? null);

  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Profile checklist</p>
          <p className="text-xs text-[var(--muted)]">Complete items to increase your profile score ({subtotal}/30)</p>
        </div>
        <div className="text-sm font-mono font-semibold">{subtotal}/30</div>
      </div>

      <div className="mt-3 space-y-2">
        {items.map((it) => (
          <div key={it.key} className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-6 w-6 flex-none rounded-full ${it.completed ? 'bg-[var(--accent)]' : 'bg-black/5'} flex items-center justify-center text-white text-xs`}>
                {it.completed ? '✓' : ''}
              </div>
              <div>
                <div className="text-sm font-medium">{it.label}</div>
                {!it.completed ? <div className="text-xs text-[var(--muted)]">{it.hint}</div> : null}
              </div>
            </div>
            <div className="text-sm text-[var(--muted)]">{it.points} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
}
