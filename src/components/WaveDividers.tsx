export function HeroToStoryDivider() {
  return (
    <div className="relative w-full overflow-hidden leading-none pointer-events-none select-none bg-[#477A59]" aria-hidden="true">
      <svg
        viewBox="0 0 1440 84"
        preserveAspectRatio="none"
        className="w-full h-10 sm:h-14 md:h-16 block"
      >
        <path
          d="M0 24 C220 64, 460 6, 720 34 C980 62, 1220 12, 1440 36 L1440 84 L0 84 Z"
          fill="#FAF8F0"
          fillOpacity="0.45"
        />
        <path
          d="M0 44 C260 12, 520 74, 790 42 C1040 12, 1270 68, 1440 38 L1440 84 L0 84 Z"
          fill="#FAF8F0"
        />
      </svg>
    </div>
  );
}

export function StoryToSpotlightDivider() {
  return (
    <div className="relative w-full overflow-hidden leading-none pointer-events-none select-none bg-[#FAF8F0]" aria-hidden="true">
      <svg
        viewBox="0 0 1440 78"
        preserveAspectRatio="none"
        className="w-full h-10 sm:h-14 block"
      >
        <path
          d="M0 32 Q360 78 740 28 T1440 38 L1440 78 L0 78 Z"
          fill="#DCEEDB"
          fillOpacity="0.65"
        />
        <path
          d="M0 48 Q380 12 760 50 T1440 32 L1440 78 L0 78 Z"
          fill="#E8F3E5"
        />
      </svg>
    </div>
  );
}

export function CanopyToRiverDivider() {
  return (
    <svg className="wave-divider bg-[#E4EED6]" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 32 Q360 88 760 36 T1440 44 L1440 90 L0 90 Z" fill="#C8DEA4" />
    </svg>
  );
}

export function RiverToUndergroundDivider() {
  return (
    <svg className="wave-divider bg-[#DCEEDB]" viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 38 Q280 86 580 44 T1140 52 Q1320 62 1440 34 L1440 110 L0 110 Z" fill="#477A59" />
      <path d="M0 64 Q340 100 720 68 T1440 72 L1440 110 L0 110 Z" fill="#5C4636" />
    </svg>
  );
}
