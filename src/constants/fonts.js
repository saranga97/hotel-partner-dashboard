/**
 * Typography — single source of truth.
 *
 * To swap fonts:
 *  1. Change the family names below.
 *  2. Update the Google Fonts URL in index.html.
 *  3. Update the --font-sans / --font-display values in @theme (index.css).
 *
 * Use these in any JS that needs font values (inline styles, canvas, etc.).
 */

export const fonts = {
  // Headings — font-display
  display: {
    family: '"DM Serif Display"',
    stack:  ['"DM Serif Display"', 'serif'],
  },

  // Body / UI — font-sans
  sans: {
    family: '"Plus Jakarta Sans"',
    stack:  ['"Plus Jakarta Sans"', 'sans-serif'],
  },
};
