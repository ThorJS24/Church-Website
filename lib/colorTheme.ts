// Derives the ~5 accent shades the design system expects (DEFAULT/hover/
// active/subtle/foreground) from one admin-picked hex color, so the theme
// customizer only has to ask for a single color instead of five.

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function triplet(rgb: [number, number, number]): string {
  return rgb.join(' ');
}

export interface AccentShades {
  accent: string;
  accentHover: string;
  accentActive: string;
  accentForeground: string;
  accentSubtle: string;
}

/** `isDark` should reflect the current theme — subtle/foreground contrast
 * needs opposite treatment in light vs dark mode (a light tint reads fine
 * on white, but needs to become a dark tint on a near-black background). */
export function deriveAccentShades(hex: string, isDark: boolean): AccentShades | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [h, s, l] = rgbToHsl(...rgb);

  const hover = hslToRgb(h, s, isDark ? Math.min(95, l + 12) : Math.max(5, l - 10));
  const active = hslToRgb(h, s, isDark ? Math.min(98, l + 20) : Math.max(2, l - 18));
  const subtle = hslToRgb(h, Math.min(100, s), isDark ? Math.max(8, l - 35) : Math.min(97, l + 40));
  // Perceived luminance decides black vs white text on the accent itself.
  const luminance = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  const foreground = luminance > 0.6 ? [24, 24, 27] as [number, number, number] : [255, 255, 255] as [number, number, number];

  return {
    accent: triplet(rgb),
    accentHover: triplet(hover),
    accentActive: triplet(active),
    accentSubtle: triplet(subtle),
    accentForeground: triplet(foreground),
  };
}

export function isValidHexColor(hex: string): boolean {
  return /^#?[a-f\d]{6}$/i.test(hex.trim());
}
