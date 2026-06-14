export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GameCounter"
    >
      <defs>
        <linearGradient id="gc-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      {/* Die body */}
      <rect width="32" height="32" rx="8" fill="url(#gc-grad)" />

      {/* Die face — 5 dots */}
      <circle cx="10.5" cy="10.5" r="2.6" fill="white" />
      <circle cx="21.5" cy="10.5" r="2.6" fill="white" />
      <circle cx="16"   cy="16"   r="2.6" fill="white" />
      <circle cx="10.5" cy="21.5" r="2.6" fill="white" />
      <circle cx="21.5" cy="21.5" r="2.6" fill="white" />
    </svg>
  );
}
