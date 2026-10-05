type P = { className?: string; strokeWidth?: number };

function S({ className, strokeWidth = 2, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const IconPlay = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "h-5 w-5"} aria-hidden>
    <path d="M7 4.5c0-.9 1-1.5 1.8-1L19.5 11c.8.5.8 1.6 0 2.1L8.8 19.5c-.8.5-1.8-.1-1.8-1V4.5Z" />
  </svg>
);

export const IconPause = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "h-5 w-5"} aria-hidden>
    <rect x="6" y="4" width="4.2" height="16" rx="1.4" />
    <rect x="13.8" y="4" width="4.2" height="16" rx="1.4" />
  </svg>
);

export const IconNext = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "h-5 w-5"} aria-hidden>
    <path d="M5 5.14v13.72c0 .8.87 1.3 1.56.88l10.2-6.86a1.03 1.03 0 0 0 0-1.76L6.56 4.26A1.03 1.03 0 0 0 5 5.14Z" />
    <rect x="17.5" y="4.5" width="2.4" height="15" rx="1.2" />
  </svg>
);

export const IconPrev = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "h-5 w-5"} aria-hidden>
    <path d="M19 5.14v13.72c0 .8-.87 1.3-1.56.88L7.24 12.88a1.03 1.03 0 0 1 0-1.76l10.2-6.86A1.03 1.03 0 0 1 19 5.14Z" />
    <rect x="4.1" y="4.5" width="2.4" height="15" rx="1.2" />
  </svg>
);

export const IconShuffle = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth}>
    <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.8-1.1 2-1.7 3.3-1.7H22" />
    <path d="m18 2 4 4-4 4" />
    <path d="M2 6h1.9c1.5 0 2.9.7 3.6 2" />
    <path d="M22 18h-5.9c-1.3 0-2.5-.6-3.3-1.7l-.6-.8" />
    <path d="m18 14 4 4-4 4" />
  </S>
);

export const IconRepeat = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </S>
);

export const IconMusic = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </S>
);

export const IconDrum = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth ?? 1.8}>
    <rect x="3" y="10" width="18" height="6.5" rx="3.2" />
    <path d="M7.5 10.5v5.5M12 10.5v5.5M16.5 10.5v5.5" />
    <path d="m13.5 3.5 4.5 4M19.5 3.5 15 7.5" />
  </S>
);

export const IconUsers = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </S>
);

export const IconCoffee = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <path d="M6 2v2M10 2v2M14 2v2" />
  </S>
);

export const IconYoutube = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "h-5 w-5"} aria-hidden>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8l5.2 3.2Z" />
  </svg>
);

export const IconSpotify = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth ?? 1.8}>
    <circle cx="12" cy="12" r="10" />
    <path d="M7.2 12.6c3.4-1 7-.6 10 1.1" />
    <path d="M7.8 9.8c3.6-1 7.8-.5 11 1.4" />
    <path d="M8.4 15.4c2.8-.8 5.8-.4 8.3 1" />
  </S>
);

export const IconInstagram = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth ?? 1.8}>
    <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.6" cy="6.4" r="0.9" fill="currentColor" stroke="none" />
  </S>
);

export const IconClose = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth}>
    <path d="M18 6 6 18M6 6l12 12" />
  </S>
);

export const IconChevronDown = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth}>
    <path d="m6 9 6 6 6-6" />
  </S>
);

export const IconList = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth}>
    <path d="M9 6h12M9 12h12M9 18h12" />
    <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </S>
);

export const IconPlus = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth}>
    <path d="M5 12h14M12 5v14" />
  </S>
);

export const IconTrash = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth ?? 1.8}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6M14 11v6" />
  </S>
);

export const IconPencil = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth ?? 1.8}>
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </S>
);

export const IconUpload = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth ?? 1.8}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m17 8-5-5-5 5" />
    <path d="M12 3v12" />
  </S>
);

export const IconCopy = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth ?? 1.8}>
    <rect x="9" y="9" width="12" height="12" rx="2.5" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </S>
);

export const IconCheck = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth ?? 2.2}>
    <path d="M20 6 9 17l-5-5" />
  </S>
);

export const IconLink = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth ?? 1.8}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </S>
);

export const IconImage = ({ className, strokeWidth }: P) => (
  <S className={className} strokeWidth={strokeWidth ?? 1.8}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
  </S>
);
