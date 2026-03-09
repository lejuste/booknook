/**
 * Color scheme definitions. Switch the app theme by changing `activeScheme`
 * below to one of the keys in `colorSchemes`, then run:
 *
 *   npm run theme
 *
 * to regenerate src/app/theme-generated.css. The app uses semantic classes
 * (scheme-bg, scheme-primary, scheme-border, etc.) that read from those variables.
 */

export type ColorScheme = {
  /** Page and main background */
  background: string;
  /** Cards, modals, muted surfaces */
  backgroundMuted: string;
  /** Primary buttons, links, progress bars, focus rings */
  primary: string;
  /** Hover/active state for primary */
  primaryHover: string;
  /** Borders, dividers, rings */
  border: string;
  /** Accent for badges and secondary emphasis */
  accent: string;
  /** Soft accent background (e.g. "You're here" badge) */
  accentSoft: string;
  /** Text on primary (e.g. button text) */
  textOnPrimary: string;
};

export const colorSchemes: Record<string, ColorScheme> = {
  wisteria: {
    background: "#D3D3FF",
    backgroundMuted: "#D8BFD8",
    primary: "#6B00A0",
    primaryHover: "#9400D3",
    border: "#D8BFD8",
    accent: "#ED80E9",
    accentSoft: "#D8BFD8",
    textOnPrimary: "#FFFFFF",
  },
  burntSienna: {
    background: "#F5F5DC",
    backgroundMuted: "#F4A460",
    primary: "#E35336",
    primaryHover: "#A0522D",
    border: "#F4A460",
    accent: "#F4A460",
    accentSoft: "#F4A460",
    textOnPrimary: "#FFFFFF",
  },
  wildflowers: {
    background: "#A8DCAB",
    backgroundMuted: "#DBAAA7",
    primary: "#519755",
    primaryHover: "#3d7241",
    border: "#DBAAA7",
    accent: "#BE91BE",
    accentSoft: "#A8DCAB",
    textOnPrimary: "#FFFFFF",
  },
  inkWash: {
    background: "#FFFFE3",
    backgroundMuted: "#CBCBCB",
    primary: "#6D8196",
    primaryHover: "#4A4A4A",
    border: "#CBCBCB",
    accent: "#6D8196",
    accentSoft: "#CBCBCB",
    textOnPrimary: "#FFFFFF",
  },
};

/** Current theme. Change this and run `npm run theme` to switch the app palette. */
export const activeScheme = "wisteria";

export function getActiveScheme(): ColorScheme {
  const scheme = colorSchemes[activeScheme];
  if (!scheme) {
    throw new Error(`Unknown color scheme: ${activeScheme}`);
  }
  return scheme;
}
