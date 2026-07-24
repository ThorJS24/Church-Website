'use client';

export default function SkipLink() {
  return (
    <nav aria-label="Skip links">
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        z-50 px-4 py-2 bg-blue-600 text-white rounded-md
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        font-medium text-sm transition-all duration-200
      "
    >
      Skip to main content
    </a>
    </nav>
  );
}