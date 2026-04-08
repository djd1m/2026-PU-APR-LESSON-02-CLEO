import { daysBetween } from '@cleo-rf/shared';

export interface TransactionInput {
  date: Date;
  amount: number;
  description: string;
  category: string;
}

export interface Subscription {
  name: string;
  amount: number;
  frequency: 'monthly' | 'annual';
  lastCharge: Date;
  isParasite: boolean;
}

/**
 * Simple Levenshtein distance implementation for fuzzy merchant name matching.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Normalize a merchant name for grouping.
 */
function normalizeMerchant(description: string): string {
  return description
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-яё0-9\s.]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if two merchant names are similar enough to be the same merchant.
 * Uses Levenshtein distance with a threshold relative to string length.
 */
function areSimilarMerchants(a: string, b: string): boolean {
  if (a === b) return true;

  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return true;

  const distance = levenshteinDistance(a, b);
  const threshold = Math.max(2, Math.floor(maxLen * 0.25));

  return distance <= threshold;
}

/**
 * Group transactions by normalized merchant name using fuzzy matching.
 */
function groupByMerchant(transactions: TransactionInput[]): Map<string, TransactionInput[]> {
  const groups = new Map<string, TransactionInput[]>();
  const canonicalNames = new Map<string, string>(); // normalized -> canonical

  for (const t of transactions) {
    // Only consider expenses
    if (t.amount >= 0) continue;

    const normalized = normalizeMerchant(t.description);
    if (normalized.length < 3) continue;

    // Find existing group with similar name
    let matchedCanonical: string | null = null;
    for (const [existing] of canonicalNames) {
      if (areSimilarMerchants(normalized, existing)) {
        matchedCanonical = existing;
        break;
      }
    }

    if (matchedCanonical) {
      const canonical = canonicalNames.get(matchedCanonical)!;
      groups.get(canonical)!.push(t);
    } else {
      canonicalNames.set(normalized, normalized);
      groups.set(normalized, [t]);
    }
  }

  return groups;
}

/**
 * Check if a group of transactions has a monthly pattern.
 * Returns true if at least 2 transactions are spaced ~25-35 days apart.
 */
function hasMonthlyPattern(transactions: TransactionInput[]): boolean {
  if (transactions.length < 2) return false;

  // Sort by date
  const sorted = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());

  let monthlyIntervals = 0;
  for (let i = 1; i < sorted.length; i++) {
    const days = daysBetween(sorted[i].date, sorted[i - 1].date);
    if (days >= 25 && days <= 35) {
      monthlyIntervals++;
    }
  }

  return monthlyIntervals >= 1;
}

/**
 * Check if amounts are roughly consistent (within 20% of median).
 */
function hasConsistentAmounts(transactions: TransactionInput[]): boolean {
  if (transactions.length < 2) return true;

  const amounts = transactions.map(t => Math.abs(t.amount)).sort((a, b) => a - b);
  const median = amounts[Math.floor(amounts.length / 2)];

  if (median === 0) return false;

  const tolerance = median * 0.2;
  return amounts.every(a => Math.abs(a - median) <= tolerance);
}

/**
 * Detect subscriptions from a list of categorized transactions.
 * Groups by merchant, checks for recurring monthly patterns,
 * and flags "parasites" (subscriptions not charged recently).
 */
export function detectSubscriptions(transactions: TransactionInput[]): Subscription[] {
  const subscriptions: Subscription[] = [];
  const merchantGroups = groupByMerchant(transactions);
  const now = new Date();

  for (const [merchantName, txns] of merchantGroups) {
    if (txns.length < 2) continue;
    if (!hasConsistentAmounts(txns)) continue;
    if (!hasMonthlyPattern(txns)) continue;

    const sorted = [...txns].sort((a, b) => a.date.getTime() - b.date.getTime());
    const lastCharge = sorted[sorted.length - 1].date;

    // Average amount (take absolute value since these are expenses)
    const avgAmount = txns.reduce((sum, t) => sum + Math.abs(t.amount), 0) / txns.length;

    // A "parasite" is a subscription whose last charge was more than 30 days ago
    // but has been recurring (user might have forgotten about it)
    const daysSinceLastCharge = daysBetween(now, lastCharge);
    const isParasite = daysSinceLastCharge > 30;

    // Pick the most descriptive name from the group
    const displayName = txns
      .map(t => t.description)
      .sort((a, b) => b.length - a.length)[0] || merchantName;

    subscriptions.push({
      name: displayName,
      amount: Math.round(avgAmount * 100) / 100,
      frequency: 'monthly',
      lastCharge,
      isParasite,
    });
  }

  // Sort by amount descending
  subscriptions.sort((a, b) => b.amount - a.amount);

  return subscriptions;
}
