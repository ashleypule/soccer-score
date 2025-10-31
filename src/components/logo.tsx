export function Logo() {
  return (
    <div className="flex items-center justify-center bg-primary h-10 w-10 rounded-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary-foreground h-6 w-6"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
        <path d="M12 2a10 10 0 0 0-4.47 1.25" />
        <path d="M12 2a10 10 0 0 1 4.47 1.25" />
        <path d="m2.22 14.13 1.18-3.54" />
        <path d="m21.78 14.13-1.18-3.54" />
        <path d="m7.76 16.24 6.36-2.12" />
        <path d="m14.13 2.22-3.54 1.18" />
        <path d="m9.87 21.78 3.54-1.18" />
      </svg>
    </div>
  );
}
