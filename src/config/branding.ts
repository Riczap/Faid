/**
 * Centralized branding configuration.
 * All components should reference these constants for logos and brand assets.
 * To update a logo across the entire app, change the path here.
 */

export const BRAND = {
  /** Page title — displayed in the browser tab */
  pageTitle: "Faid — Asesor Financiero",

  /** Full logo with text — used in expanded sidebar, mobile headers, auth pages (dark mode) */
  logoText: "/images/logo/logo_text.svg",

  /** Full logo with text — light mode variant */
  logoTextLight: "/images/logo/logo-text-light.svg",

  /** Small icon logo — used in collapsed sidebar */
  logoSmall: "/images/logo/logo_small.svg",

  /** Browser tab favicon */
  favicon: "/images/logo/logo.svg",

  /** Alt text for the logo */
  logoAlt: "Faid",
} as const;
