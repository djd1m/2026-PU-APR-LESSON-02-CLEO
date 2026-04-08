export function formatRub(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs);
  const sign = amount < 0 ? '-' : amount > 0 ? '+' : '';
  return `${sign}${formatted} ₽`;
}

export function parseAmount(str: string): number {
  const cleaned = str.replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function percentOf(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((Math.abs(part) / Math.abs(total)) * 1000) / 10;
}
