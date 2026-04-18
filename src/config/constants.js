export const EXPENSE_CATEGORIES = [
  'Housing',
  'Food',
  'Transport',
  'Utilities',
  'Entertainment',
  'Health',
  'Education',
  'Debt',
  'Misc'
];

export const CATEGORY_LABELS_ES = {
  Housing: 'Vivienda',
  Food: 'Alimentos',
  Transport: 'Transporte',
  Utilities: 'Servicios',
  Entertainment: 'Entretenimiento',
  Health: 'Salud',
  Education: 'Educación',
  Debt: 'Deudas',
  Misc: 'Otros',
};

/**
 * Cohesive chart palettes — built around the brand indigo (#465FFF).
 * Light: brighter for white backgrounds. Dark: deepened for dark UI.
 */
export const CATEGORY_COLORS_LIGHT = {
  Housing:       '#465FFF',
  Food:          '#12B76A',
  Transport:     '#36BFFA',
  Utilities:     '#7A5AF8',
  Entertainment: '#F79009',
  Health:        '#2ED3B7',
  Education:     '#9B8AFB',
  Debt:          '#F04438',
  Misc:          '#98A2B3',
};

export const CATEGORY_COLORS_DARK = {
  Housing:       '#3A4FE0',
  Food:          '#0EA05E',
  Transport:     '#2DA6E0',
  Utilities:     '#6A4AD9',
  Entertainment: '#D97D08',
  Health:        '#24B89E',
  Education:     '#8471E0',
  Debt:          '#D43A30',
  Misc:          '#7E8A9A',
};

/** Convenience: pass 'dark' or 'light' to get the right palette */
export const getCategoryColors = (theme) =>
  theme === 'dark' ? CATEGORY_COLORS_DARK : CATEGORY_COLORS_LIGHT;

/** Default export kept for backwards compat — resolves to dark */
export const CATEGORY_COLORS = CATEGORY_COLORS_DARK;
