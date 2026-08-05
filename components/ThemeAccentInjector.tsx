'use client';

import { useEffect } from 'react';
import { getSiteSettings } from '@/lib/content';
import { deriveAccentShades, type AccentShades } from '@/lib/colorTheme';

const VAR_MAP: Record<keyof AccentShades, string> = {
  accent: '--accent',
  accentHover: '--accent-hover',
  accentActive: '--accent-active',
  accentSubtle: '--accent-subtle',
  accentForeground: '--accent-foreground',
};

// Applies the admin-configured accent color override, if any, on top of the
// default tokens already set in globals.css. Runs once on mount and again
// whenever the OS/site theme flips, since light vs dark need different
// derived shades from the same base hex.
export function ThemeAccentInjector() {
  useEffect(() => {
    let cancelled = false;

    const apply = () => {
      getSiteSettings().then((settings) => {
        if (cancelled || !settings?.themeAccentColor) return;
        const isDark = document.documentElement.classList.contains('dark');
        const shades = deriveAccentShades(settings.themeAccentColor, isDark);
        if (!shades) return;
        (Object.entries(VAR_MAP) as [keyof AccentShades, string][]).forEach(([key, cssVar]) => {
          document.documentElement.style.setProperty(cssVar, shades[key]);
        });
      }).catch(() => {});
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { cancelled = true; observer.disconnect(); };
  }, []);

  return null;
}
