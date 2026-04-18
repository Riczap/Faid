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
 * Cohesive chart palette — built around the brand indigo (#465FFF).
 * Uses an analogous-split scheme: cool blues/teals for everyday categories,
 * warm accent for attention items (debt, entertainment).
 */
export const CATEGORY_COLORS = {
  Housing:       '#465FFF', // brand-500 (primary anchor)
  Food:          '#12B76A', // success-500 (app semantic green)
  Transport:     '#36BFFA', // sky-400
  Utilities:     '#7A5AF8', // violet-500
  Entertainment: '#F79009', // amber-500 warm accent
  Health:        '#2ED3B7', // teal-400
  Education:     '#9B8AFB', // violet-300
  Debt:          '#F04438', // error-500 (app semantic red)
  Misc:          '#98A2B3', // gray-400 neutral
};
