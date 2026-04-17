/**
 * Centralized branding configuration.
 * All components should reference these constants for logos and brand assets.
 * To update a logo across the entire app, change the path here.
 */

export const BRAND = {
  /** Page title — displayed in the browser tab */
  pageTitle: "Faid — Asesor Financiero",

  /** Full logo with text — used in expanded sidebar, mobile headers, auth pages */
  logoText: "/images/logo/logo_text.svg",

  /** Small icon logo — used in collapsed sidebar and browser favicon */
  logoSmall: "/images/logo/logo_small.svg",

  /** Alt text for the logo */
  logoAlt: "Faid",
} as const;
