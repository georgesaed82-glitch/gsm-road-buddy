export function InstagramBrandIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fccc63" />
          <stop offset="50%" stopColor="#e1306c" />
          <stop offset="100%" stopColor="#833ab4" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="6"
        stroke="url(#instagram-gradient)"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4.5" stroke="url(#instagram-gradient)" strokeWidth="2" />
      <circle cx="18" cy="6" r="1.25" fill="url(#instagram-gradient)" />
    </svg>
  );
}
