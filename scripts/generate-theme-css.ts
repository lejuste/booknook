/**
 * Generates theme-generated.css from the active color scheme.
 * Run with: npx tsx scripts/generate-theme-css.ts
 */

import { writeFileSync } from "fs";
import { getActiveScheme } from "../src/lib/color-scheme";

const scheme = getActiveScheme();

const css = `/* Auto-generated from src/lib/color-scheme.ts - do not edit manually */
:root {
  --scheme-bg: ${scheme.background};
  --scheme-bg-muted: ${scheme.backgroundMuted};
  --scheme-primary: ${scheme.primary};
  --scheme-primary-hover: ${scheme.primaryHover};
  --scheme-border: ${scheme.border};
  --scheme-accent: ${scheme.accent};
  --scheme-accent-soft: ${scheme.accentSoft};
  --scheme-text-on-primary: ${scheme.textOnPrimary};
}
`;

const outPath = new URL("../src/app/theme-generated.css", import.meta.url);
writeFileSync(outPath, css, "utf-8");
console.log("Wrote theme CSS to src/app/theme-generated.css");
