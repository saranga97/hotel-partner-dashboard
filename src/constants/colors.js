/**
 * Brand color values — single source of truth for the entire project.
 *
 * index.css @theme  → manually kept in sync with these values (Tailwind v4 CSS-first)
 * Any JS code (toast, charts, inline styles) → import directly from here
 *
 * To change the palette: edit values here, then update the @theme block in index.css.
 */

export const colors = {
  // ── Brand ────────────────────────────────────────────────────────────
  primary:      '#D85A30',
  primaryDark:  '#A83D18',
  tint:         '#FFF5F1',
  brandText:    '#222222',
  brandMuted:   '#717171',
  brandSurface: '#F7F7F7',
  brandBorder:  '#EBEBEB',

  // ── Semantic ──────────────────────────────────────────────────────────
  success:      '#16a34a',
  successLight: '#dcfce7',
  successDark:  '#15803d',

  error:        '#ef4444',
  errorLight:   '#fef2f2',
  errorDark:    '#dc2626',

  warning:      '#ca8a04',
  warningLight: '#fef9c3',
  warningDark:  '#a16207',
};
