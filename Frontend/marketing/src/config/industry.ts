export const industries = [
  'retail',
  'food',
  'fashion',
  'electronics',
  'home',
  'beauty',
  'sports',
] as const;

export type Industry = typeof industries[number];