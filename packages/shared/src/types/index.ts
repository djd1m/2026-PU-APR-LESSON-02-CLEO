// User
export type UserPlan = 'free' | 'pro';
export interface User {
  id: string;
  email: string | null;
  telegramId: string | null;
  name: string;
  age: number;
  plan: UserPlan;
  proExpiresAt: Date | null;
  roastsToday: number;
  lastRoastDate: Date | null;
  referralCode: string;
  referredBy: string | null;
  createdAt: Date;
}

// Transaction
export interface Transaction {
  id: string;
  userId: string;
  uploadId: string;
  date: Date;
  amount: number; // negative = expense, positive = income
  description: string;
  category: string;
  categoryConfidence: number;
  isSubscription: boolean;
  rawCategory: string | null;
  createdAt: Date;
}

// Upload
export type BankFormat = 'tinkoff' | 'sberbank' | 'alfa' | 'generic';
export type UploadStatus = 'parsing' | 'analyzing' | 'complete' | 'error';
export interface Upload {
  id: string;
  userId: string;
  bankFormat: BankFormat;
  transactionCount: number;
  periodStart: Date;
  periodEnd: Date;
  status: UploadStatus;
  createdAt: Date;
}

// Analysis
export interface CategoryBreakdown {
  name: string;
  total: number;
  percentage: number;
  transactionCount: number;
  trend: 'up' | 'down' | 'stable' | null;
}

export interface SubscriptionInfo {
  name: string;
  amount: number;
  frequency: 'monthly' | 'annual';
  lastCharge: Date;
  isParasite: boolean;
}

export interface Analysis {
  id: string;
  userId: string;
  uploadId: string;
  totalIncome: number;
  totalExpense: number;
  categories: CategoryBreakdown[];
  subscriptions: SubscriptionInfo[];
  roastText: string;
  recommendations: string[];
  createdAt: Date;
}

// ShareCard
export interface ShareCard {
  id: string;
  userId: string;
  analysisId: string;
  roastText: string;
  imageUrl: string;
  referralLink: string;
  shareCount: number;
  createdAt: Date;
}

// API types
export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// Roast styles
export type RoastStyle = 'roast' | 'hype' | 'balanced';
