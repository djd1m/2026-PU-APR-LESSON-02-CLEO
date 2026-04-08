import iconv from 'iconv-lite';
import { BANK_FORMATS, type BankFormatConfig } from '@cleo-rf/shared';
import { parseDate } from '@cleo-rf/shared';
import { parseAmount } from '@cleo-rf/shared';
import type { BankFormat } from '@cleo-rf/shared';

export interface ParsedTransaction {
  date: Date;
  amount: number;
  description: string;
  rawCategory: string | null;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  bankFormat: BankFormat;
}

/**
 * Try to decode buffer as UTF-8 first. If invalid characters detected,
 * fall back to Windows-1251 (common for Russian bank exports).
 */
function decodeBuffer(buffer: Buffer): string {
  const utf8 = buffer.toString('utf-8');
  // Check for replacement character (indicates bad UTF-8 decoding)
  if (!utf8.includes('\uFFFD')) {
    // Also check for typical Windows-1251 misreads (sequences of high bytes)
    const suspiciousChars = utf8.match(/[\xC0-\xFF]{4,}/g);
    if (!suspiciousChars) {
      return utf8;
    }
  }
  // Fall back to Windows-1251
  return iconv.decode(buffer, 'win1251');
}

/**
 * Auto-detect the delimiter by counting occurrences of common delimiters
 * in the first 5 lines.
 */
function detectDelimiter(lines: string[]): string {
  const candidates = [';', ',', '\t'];
  const sample = lines.slice(0, 5);

  let bestDelimiter = ';';
  let bestScore = 0;

  for (const delim of candidates) {
    let totalCount = 0;
    let consistent = true;
    let firstCount = 0;

    for (let i = 0; i < sample.length; i++) {
      const count = sample[i].split(delim).length - 1;
      if (i === 0) firstCount = count;
      else if (count !== firstCount && count > 0) consistent = false;
      totalCount += count;
    }

    // Prefer delimiters that appear consistently and frequently
    const score = consistent ? totalCount * 2 : totalCount;
    if (score > bestScore) {
      bestScore = score;
      bestDelimiter = delim;
    }
  }

  return bestDelimiter;
}

/**
 * Detect bank format by matching header columns against known patterns.
 */
function detectBankFormat(headers: string[]): BankFormat {
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());

  for (const [formatKey, config] of Object.entries(BANK_FORMATS)) {
    const patterns = config.headerPatterns.map(p => p.toLowerCase());
    const matchCount = patterns.filter(p =>
      normalizedHeaders.some(h => h.includes(p))
    ).length;

    if (matchCount === patterns.length) {
      return formatKey as BankFormat;
    }
  }

  return 'generic';
}

/**
 * Split a CSV line respecting quoted fields.
 */
function splitCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current.trim());
  return fields;
}

/**
 * Parse date from a string, trying multiple formats.
 */
function parseDateValue(dateStr: string): Date | null {
  return parseDate(dateStr);
}

/**
 * Parse amount from string, handling comma decimal separator and
 * various amount formats.
 */
function parseAmountValue(amountStr: string): number {
  return parseAmount(amountStr);
}

/**
 * Get column index by header name (case-insensitive, trimmed).
 */
function getColumnIndex(headers: string[], columnName: string): number {
  const normalized = columnName.toLowerCase().trim();
  return headers.findIndex(h => h.toLowerCase().trim() === normalized);
}

/**
 * Parse transactions from a generic CSV (when bank format is not recognized).
 * Tries common column name patterns.
 */
function parseGeneric(headers: string[], rows: string[][], delimiter: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  // Try to find date, amount, description columns by common patterns
  const datePatterns = ['дата', 'date', 'дата операции'];
  const amountPatterns = ['сумма', 'amount', 'сумма операции'];
  const descPatterns = ['описание', 'description', 'назначение', 'комментарий'];
  const categoryPatterns = ['категория', 'category', 'mcc'];

  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

  let dateIdx = -1;
  let amountIdx = -1;
  let descIdx = -1;
  let categoryIdx = -1;

  for (const p of datePatterns) {
    const idx = normalizedHeaders.findIndex(h => h.includes(p));
    if (idx !== -1) { dateIdx = idx; break; }
  }

  for (const p of amountPatterns) {
    const idx = normalizedHeaders.findIndex(h => h.includes(p));
    if (idx !== -1) { amountIdx = idx; break; }
  }

  for (const p of descPatterns) {
    const idx = normalizedHeaders.findIndex(h => h.includes(p));
    if (idx !== -1) { descIdx = idx; break; }
  }

  for (const p of categoryPatterns) {
    const idx = normalizedHeaders.findIndex(h => h.includes(p));
    if (idx !== -1) { categoryIdx = idx; break; }
  }

  // Fall back to positional: first column = date, second last or specific = amount
  if (dateIdx === -1 && headers.length >= 3) dateIdx = 0;
  if (amountIdx === -1 && headers.length >= 3) amountIdx = headers.length >= 4 ? 3 : 2;
  if (descIdx === -1 && headers.length >= 3) descIdx = headers.length >= 4 ? headers.length - 1 : 1;

  if (dateIdx === -1 || amountIdx === -1) {
    return transactions;
  }

  for (const row of rows) {
    if (row.length <= Math.max(dateIdx, amountIdx)) continue;

    const dateVal = parseDateValue(row[dateIdx]);
    if (!dateVal) continue;

    const amount = parseAmountValue(row[amountIdx]);
    if (amount === 0 && !row[amountIdx].includes('0')) continue;

    const description = descIdx >= 0 && descIdx < row.length ? row[descIdx] : '';
    const rawCategory = categoryIdx >= 0 && categoryIdx < row.length ? row[categoryIdx] : null;

    transactions.push({
      date: dateVal,
      amount,
      description: description.replace(/^"|"$/g, '').trim(),
      rawCategory: rawCategory?.replace(/^"|"$/g, '').trim() || null,
    });
  }

  return transactions;
}

/**
 * Parse transactions using a known bank format configuration.
 */
function parseWithFormat(
  config: BankFormatConfig,
  headers: string[],
  rows: string[][],
): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  const dateIdx = getColumnIndex(headers, config.columns.date);
  const amountIdx = getColumnIndex(headers, config.columns.amount);
  const descIdx = getColumnIndex(headers, config.columns.description);
  const categoryIdx = config.columns.category
    ? getColumnIndex(headers, config.columns.category)
    : -1;

  if (dateIdx === -1 || amountIdx === -1) {
    return transactions;
  }

  for (const row of rows) {
    if (row.length <= Math.max(dateIdx, amountIdx)) continue;

    const dateVal = parseDateValue(row[dateIdx]);
    if (!dateVal) continue;

    let amount = parseAmountValue(row[amountIdx]);
    if (config.amountSign === 'inverted') {
      amount = -amount;
    }

    const description = descIdx >= 0 && descIdx < row.length
      ? row[descIdx].replace(/^"|"$/g, '').trim()
      : '';

    const rawCategory = categoryIdx >= 0 && categoryIdx < row.length
      ? row[categoryIdx].replace(/^"|"$/g, '').trim()
      : null;

    transactions.push({ date: dateVal, amount, description, rawCategory });
  }

  return transactions;
}

/**
 * Main entry point: parse a CSV buffer into transactions.
 * Handles encoding detection, delimiter detection, bank format detection,
 * and actual row parsing.
 */
export function parseCsv(buffer: Buffer, filename: string): ParseResult {
  const text = decodeBuffer(buffer);
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);

  if (lines.length < 2) {
    return { transactions: [], bankFormat: 'generic' };
  }

  const delimiter = detectDelimiter(lines);
  const headerFields = splitCsvLine(lines[0], delimiter);
  const bankFormat = detectBankFormat(headerFields);

  const dataRows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = splitCsvLine(lines[i], delimiter);
    if (fields.length >= 2) {
      dataRows.push(fields);
    }
  }

  let transactions: ParsedTransaction[];

  if (bankFormat !== 'generic' && BANK_FORMATS[bankFormat]) {
    transactions = parseWithFormat(BANK_FORMATS[bankFormat], headerFields, dataRows);
  } else {
    transactions = parseGeneric(headerFields, dataRows, delimiter);
  }

  return { transactions, bankFormat };
}
