function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M7.7 13.3 4.6 10.2l-1.4 1.4 4.5 4.5L17 6.8l-1.4-1.4z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="m10 1.5 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 1.5A6.5 6.5 0 0 0 3.5 8c0 4.8 6.5 10.5 6.5 10.5S16.5 12.8 16.5 8A6.5 6.5 0 0 0 10 1.5Zm0 8.7A2.2 2.2 0 1 1 10 5.6a2.2 2.2 0 0 1 0 4.6Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[#0D2E2B]/55">
      <path d="M8.4 3a5.4 5.4 0 1 0 3.4 9.5l3.6 3.6 1.4-1.4-3.6-3.6A5.4 5.4 0 0 0 8.4 3Zm0 2a3.4 3.4 0 1 1 0 6.8A3.4 3.4 0 0 1 8.4 5Z" />
    </svg>
  );
}

function ProfileCard({
  initials,
  name,
  skill,
  score,
  faculty,
  location,
}: {
  initials: string;
  name: string;
  skill: string;
  score: string;
  faculty: string;
  location: string;
}) {
  return (
    <article className="relative rounded-[1.35rem] border border-[#0D2E2B]/10 bg-[#F8F4E8] p-4 shadow-[0_10px_24px_rgba(13,46,43,0.08)]">
      <div className="absolute right-3 top-3 rounded-full bg-[#008075] px-2 py-1 text-[10px] font-semibold text-white">
        {score}
      </div>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#008075] text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-[#0D2E2B]">{name}</p>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#008075] text-white">
              <CheckIcon />
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-[#008075]">{skill}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-[#0D2E2B]/10 bg-white px-2.5 py-1 text-[10px] font-medium text-[#0D2E2B]/75">
          {faculty}
        </span>
        <span className="rounded-full border border-[#0D2E2B]/10 bg-white px-2.5 py-1 text-[10px] font-medium text-[#0D2E2B]/75">
          {location}
        </span>
      </div>
    </article>
  );
}

export function HeroMockup() {
  return (
    <figure className="relative w-full max-w-[470px] overflow-visible" style={{ perspective: "1500px" }}>
      <div className="absolute -left-6 top-16 z-20 inline-flex items-center gap-2 rounded-full border border-[#0D2E2B]/10 bg-white px-4 py-2 text-xs font-semibold text-[#0D2E2B] shadow-[0_14px_30px_rgba(13,46,43,0.12)]">
        <MapPinIcon />
        Campus directions
      </div>
      <div className="absolute right-2 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-[#0D2E2B]/10 bg-white px-4 py-2 text-xs font-semibold text-[#0D2E2B] shadow-[0_14px_30px_rgba(13,46,43,0.12)]">
        <CheckIcon />
        Verified profiles
      </div>
      <div className="absolute -bottom-1 right-10 z-20 inline-flex items-center gap-2 rounded-full border border-[#0D2E2B]/10 bg-white px-4 py-2 text-xs font-semibold text-[#0D2E2B] shadow-[0_14px_30px_rgba(13,46,43,0.12)]">
        <StarIcon />
        5.0 rating
      </div>

      <div className="relative mx-auto w-[340px] max-w-full rounded-[2.8rem] border-[10px] border-[#101312] bg-[#101312] shadow-[0_38px_90px_rgba(13,46,43,0.22)] transition-transform duration-500 ease-out hover:rotate-x-0 hover:rotate-y-0" style={{ transform: "rotateX(10deg) rotateY(-18deg) rotateZ(2deg)" }}>
        <div className="pointer-events-none absolute inset-0 rounded-[2.2rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0))]" />
        <div className="rounded-[2.2rem] bg-[#EDE8D8] p-4">
          <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-[#0D2E2B]/14" />

          <div className="rounded-[1.4rem] border border-[#0D2E2B]/10 bg-white px-3 py-3 shadow-[0_10px_26px_rgba(13,46,43,0.08)]">
            <div className="flex items-center gap-2">
              <SearchIcon />
              <span className="text-sm text-[#0D2E2B]/45">Search students, skills, or services</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <ProfileCard
              initials="AD"
              name="Amina D."
              skill="Web Development"
              score="98"
              faculty="FSC"
              location="Abeokuta Hall"
            />
            <ProfileCard
              initials="KT"
              name="Kehinde T."
              skill="Video Editing"
              score="95"
              faculty="SCI"
              location="Amina Hall"
            />
            <ProfileCard
              initials="SO"
              name="Sodiq O."
              skill="Perfume Vendor"
              score="99"
              faculty="MGT"
              location="Ikeja Gate"
            />
          </div>
        </div>
      </div>
    </figure>
  );
}