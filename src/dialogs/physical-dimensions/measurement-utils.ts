export const formatNumber = (n: number): string => {
  if (!Number.isFinite(n)) return '';
  return String(Math.round(n * 100) / 100);
}

export const parseNumber = (s: string): number | undefined => {
  const n = Number.parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}