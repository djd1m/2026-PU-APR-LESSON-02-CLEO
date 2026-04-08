const DATE_FORMATS = [
  { regex: /^(\d{2})\.(\d{2})\.(\d{4})$/, parse: (m: RegExpMatchArray) => new Date(+m[3], +m[2] - 1, +m[1]) },
  { regex: /^(\d{4})-(\d{2})-(\d{2})$/, parse: (m: RegExpMatchArray) => new Date(+m[1], +m[2] - 1, +m[3]) },
  { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, parse: (m: RegExpMatchArray) => new Date(+m[3], +m[2] - 1, +m[1]) },
];

export function parseDate(dateStr: string): Date | null {
  const trimmed = dateStr.trim();
  for (const fmt of DATE_FORMATS) {
    const match = trimmed.match(fmt.regex);
    if (match) {
      const d = fmt.parse(match);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

export function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.abs(Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)));
}
