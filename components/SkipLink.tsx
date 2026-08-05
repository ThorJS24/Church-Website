'use client';

export default function SkipLink() {
  return (
    <nav aria-label="Skip links">
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        z-50 px-4 py-2 bg-accent text-accent-foreground rounded-md
        focus:outline-hidden focus:ring-2 focus:ring-accent focus:ring-offset-2
        font-medium text-body-sm transition-all duration-fast
      "
    >
      Skip to main content
    </a>
    </nav>
  );
}