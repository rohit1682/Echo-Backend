/**
 * Shared domain enums. Kept in one place so backend DTOs, schemas and the
 * frontend `src/types` mirror stay aligned.
 */

export enum AuthProvider {
  PASSWORD = 'password',
  GOOGLE = 'google',
  APPLE = 'apple',
  PHONE = 'phone',
}

export enum InvestmentType {
  MUTUAL_FUND = 'mutual_fund',
  SIP = 'sip',
  STOCK = 'stock',
  FIXED_DEPOSIT = 'fixed_deposit',
  RECURRING_DEPOSIT = 'recurring_deposit',
  PPF = 'ppf',
  EPF = 'epf',
  NPS = 'nps',
  GOLD = 'gold',
  CRYPTO = 'crypto',
  BOND = 'bond',
  OTHER = 'other',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum Frequency {
  ONE_TIME = 'one_time',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  HALF_YEARLY = 'half_yearly',
  YEARLY = 'yearly',
}

export enum RecordStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AssetCategory {
  REAL_ESTATE = 'real_estate',
  VEHICLE = 'vehicle',
  GOLD = 'gold',
  SAVINGS_ACCOUNT = 'savings_account',
  FIXED_DEPOSIT = 'fixed_deposit',
  PHYSICAL = 'physical',
  OTHER = 'other',
}

export enum PolicyType {
  LIFE = 'life',
  HEALTH = 'health',
  MOTOR = 'motor',
  TERM = 'term',
  HOME = 'home',
  TRAVEL = 'travel',
  OTHER = 'other',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum EventType {
  PERSONAL = 'personal',
  MEETING = 'meeting',
  BIRTHDAY = 'birthday',
  ANNIVERSARY = 'anniversary',
  REMINDER = 'reminder',
  FINANCIAL = 'financial',
  CUSTOM = 'custom',
}

export enum RecommendationSeverity {
  INFO = 'info',
  SUGGESTION = 'suggestion',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum RecommendationDomain {
  FINANCE = 'finance',
  ACTIVITY = 'activity',
  GENERAL = 'general',
}

export enum ThemePreference {
  SYSTEM = 'system',
  LIGHT = 'light',
  DARK = 'dark',
}
