// Tax calculation functions for VAT and Corporate Tax worldwide

interface TaxRate {
  country: string;
  vatStandard: number;
  vatReduced: number;
  vatZero: number;
  corporateRate: number;
  currency: string;
}

// Worldwide tax rates database
export const TAX_RATES: Record<string, TaxRate> = {
  'US': { country: 'United States', vatStandard: 0, vatReduced: 0, vatZero: 0, corporateRate: 21, currency: 'USD' },
  'GB': { country: 'United Kingdom', vatStandard: 20, vatReduced: 5, vatZero: 0, corporateRate: 25, currency: 'GBP' },
  'DE': { country: 'Germany', vatStandard: 19, vatReduced: 7, vatZero: 0, corporateRate: 30, currency: 'EUR' },
  'FR': { country: 'France', vatStandard: 20, vatReduced: 10, vatZero: 0, corporateRate: 28, currency: 'EUR' },
  'IT': { country: 'Italy', vatStandard: 22, vatReduced: 10, vatZero: 0, corporateRate: 24, currency: 'EUR' },
  'ES': { country: 'Spain', vatStandard: 21, vatReduced: 10, vatZero: 0, corporateRate: 25, currency: 'EUR' },
  'NL': { country: 'Netherlands', vatStandard: 21, vatReduced: 9, vatZero: 0, corporateRate: 25.8, currency: 'EUR' },
  'BE': { country: 'Belgium', vatStandard: 21, vatReduced: 12, vatZero: 0, corporateRate: 25, currency: 'EUR' },
  'AT': { country: 'Austria', vatStandard: 20, vatReduced: 10, vatZero: 0, corporateRate: 25, currency: 'EUR' },
  'CH': { country: 'Switzerland', vatStandard: 7.7, vatReduced: 3.7, vatZero: 0, corporateRate: 21, currency: 'CHF' },
  'CA': { country: 'Canada', vatStandard: 13, vatReduced: 5, vatZero: 0, corporateRate: 26.5, currency: 'CAD' },
  'AU': { country: 'Australia', vatStandard: 10, vatReduced: 0, vatZero: 0, corporateRate: 30, currency: 'AUD' },
  'JP': { country: 'Japan', vatStandard: 10, vatReduced: 8, vatZero: 0, corporateRate: 23.2, currency: 'JPY' },
  'CN': { country: 'China', vatStandard: 13, vatReduced: 9, vatZero: 0, corporateRate: 25, currency: 'CNY' },
  'IN': { country: 'India', vatStandard: 18, vatReduced: 12, vatZero: 0, corporateRate: 30, currency: 'INR' },
  'BR': { country: 'Brazil', vatStandard: 17, vatReduced: 7, vatZero: 0, corporateRate: 34, currency: 'BRL' },
  'SG': { country: 'Singapore', vatStandard: 7, vatReduced: 0, vatZero: 0, corporateRate: 17, currency: 'SGD' },
  'HK': { country: 'Hong Kong', vatStandard: 0, vatReduced: 0, vatZero: 0, corporateRate: 16.5, currency: 'HKD' },
  'NZ': { country: 'New Zealand', vatStandard: 15, vatReduced: 0, vatZero: 0, corporateRate: 28, currency: 'NZD' },
  'SE': { country: 'Sweden', vatStandard: 25, vatReduced: 12, vatZero: 0, corporateRate: 20.6, currency: 'SEK' },
  'NO': { country: 'Norway', vatStandard: 25, vatReduced: 15, vatZero: 0, corporateRate: 22, currency: 'NOK' },
  'DK': { country: 'Denmark', vatStandard: 25, vatReduced: 0, vatZero: 0, corporateRate: 22, currency: 'DKK' },
  'FI': { country: 'Finland', vatStandard: 24, vatReduced: 14, vatZero: 0, corporateRate: 20, currency: 'EUR' },
  'IE': { country: 'Ireland', vatStandard: 23, vatReduced: 13.5, vatZero: 0, corporateRate: 12.5, currency: 'EUR' },
  'PT': { country: 'Portugal', vatStandard: 23, vatReduced: 13, vatZero: 0, corporateRate: 21, currency: 'EUR' },
  'PL': { country: 'Poland', vatStandard: 23, vatReduced: 8, vatZero: 0, corporateRate: 19, currency: 'PLN' },
  'CZ': { country: 'Czech Republic', vatStandard: 21, vatReduced: 15, vatZero: 0, corporateRate: 19, currency: 'CZK' },
  'HU': { country: 'Hungary', vatStandard: 27, vatReduced: 18, vatZero: 0, corporateRate: 9, currency: 'HUF' },
  'GR': { country: 'Greece', vatStandard: 24, vatReduced: 13, vatZero: 0, corporateRate: 22, currency: 'EUR' },
  'RO': { country: 'Romania', vatStandard: 19, vatReduced: 9, vatZero: 0, corporateRate: 16, currency: 'RON' },
  'BG': { country: 'Bulgaria', vatStandard: 20, vatReduced: 9, vatZero: 0, corporateRate: 10, currency: 'BGN' }
};

export interface VATCalculation {
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  grossAmount: number;
  country: string;
  vatType: 'standard' | 'reduced' | 'zero';
}

export interface CorporateTaxCalculation {
  grossProfit: number;
  allowableDeductions: number;
  taxableProfit: number;
  corporateRate: number;
  taxAmount: number;
  netProfit: number;
  country: string;
  effectiveRate: number;
}

export interface TaxReturn {
  period: {
    startDate: Date;
    endDate: Date;
    quarter?: number;
    year: number;
  };
  vatReturn: {
    totalSales: number;
    totalPurchases: number;
    outputVAT: number;
    inputVAT: number;
    netVATDue: number;
  };
  corporateTax: CorporateTaxCalculation;
  totalTaxLiability: number;
  dueDate: Date;
  country: string;
}

/**
 * Calculate VAT for a given amount and country
 */
export function calculateVAT(
  netAmount: number,
  countryCode: string,
  vatType: 'standard' | 'reduced' | 'zero' = 'standard'
): VATCalculation {
  const taxRate = TAX_RATES[countryCode.toUpperCase()];
  
  if (!taxRate) {
    throw new Error(`Tax rates not found for country: ${countryCode}`);
  }
  
  let vatRate: number;
  switch (vatType) {
    case 'standard':
      vatRate = taxRate.vatStandard;
      break;
    case 'reduced':
      vatRate = taxRate.vatReduced;
      break;
    case 'zero':
      vatRate = taxRate.vatZero;
      break;
    default:
      vatRate = taxRate.vatStandard;
  }
  
  const vatAmount = (netAmount * vatRate) / 100;
  const grossAmount = netAmount + vatAmount;
  
  return {
    netAmount,
    vatRate,
    vatAmount,
    grossAmount,
    country: taxRate.country,
    vatType
  };
}

/**
 * Calculate VAT from gross amount (reverse calculation)
 */
export function calculateVATFromGross(
  grossAmount: number,
  countryCode: string,
  vatType: 'standard' | 'reduced' | 'zero' = 'standard'
): VATCalculation {
  const taxRate = TAX_RATES[countryCode.toUpperCase()];
  
  if (!taxRate) {
    throw new Error(`Tax rates not found for country: ${countryCode}`);
  }
  
  let vatRate: number;
  switch (vatType) {
    case 'standard':
      vatRate = taxRate.vatStandard;
      break;
    case 'reduced':
      vatRate = taxRate.vatReduced;
      break;
    case 'zero':
      vatRate = taxRate.vatZero;
      break;
    default:
      vatRate = taxRate.vatStandard;
  }
  
  const netAmount = grossAmount / (1 + vatRate / 100);
  const vatAmount = grossAmount - netAmount;
  
  return {
    netAmount,
    vatRate,
    vatAmount,
    grossAmount,
    country: taxRate.country,
    vatType
  };
}

/**
 * Calculate corporate tax
 */
export function calculateCorporateTax(
  grossProfit: number,
  allowableDeductions: number,
  countryCode: string
): CorporateTaxCalculation {
  const taxRate = TAX_RATES[countryCode.toUpperCase()];
  
  if (!taxRate) {
    throw new Error(`Tax rates not found for country: ${countryCode}`);
  }
  
  const taxableProfit = Math.max(0, grossProfit - allowableDeductions);
  const taxAmount = (taxableProfit * taxRate.corporateRate) / 100;
  const netProfit = grossProfit - taxAmount;
  const effectiveRate = grossProfit > 0 ? (taxAmount / grossProfit) * 100 : 0;
  
  return {
    grossProfit,
    allowableDeductions,
    taxableProfit,
    corporateRate: taxRate.corporateRate,
    taxAmount,
    netProfit,
    country: taxRate.country,
    effectiveRate
  };
}

/**
 * Calculate quarterly VAT return
 */
export function calculateVATReturn(
  sales: Array<{ amount: number; vatRate: number; vatAmount: number }>,
  purchases: Array<{ amount: number; vatRate: number; vatAmount: number }>,
  countryCode: string,
  quarter: number,
  year: number
): TaxReturn['vatReturn'] {
  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const outputVAT = sales.reduce((sum, sale) => sum + sale.vatAmount, 0);
  const inputVAT = purchases.reduce((sum, purchase) => sum + purchase.vatAmount, 0);
  const netVATDue = Math.max(0, outputVAT - inputVAT);
  
  return {
    totalSales,
    totalPurchases,
    outputVAT,
    inputVAT,
    netVATDue
  };
}

/**
 * Generate complete tax return
 */
export function generateTaxReturn(
  transactions: Array<{
    amount: number;
    vatRate: number;
    vatAmount: number;
    type: 'sale' | 'purchase';
    date: Date;
  }>,
  grossProfit: number,
  allowableDeductions: number,
  countryCode: string,
  period: { startDate: Date; endDate: Date }
): TaxReturn {
  const year = period.endDate.getFullYear();
  const quarter = Math.ceil((period.endDate.getMonth() + 1) / 3);
  
  // Filter transactions for the period
  const periodTransactions = transactions.filter(
    t => t.date >= period.startDate && t.date <= period.endDate
  );
  
  const sales = periodTransactions.filter(t => t.type === 'sale');
  const purchases = periodTransactions.filter(t => t.type === 'purchase');
  
  const vatReturn = calculateVATReturn(sales, purchases, countryCode, quarter, year);
  const corporateTax = calculateCorporateTax(grossProfit, allowableDeductions, countryCode);
  
  // Calculate due date (typically end of following month after quarter end)
  const dueDate = new Date(period.endDate);
  dueDate.setMonth(dueDate.getMonth() + 1);
  dueDate.setDate(0); // Last day of the month
  
  return {
    period: {
      startDate: period.startDate,
      endDate: period.endDate,
      quarter,
      year
    },
    vatReturn,
    corporateTax,
    totalTaxLiability: vatReturn.netVATDue + corporateTax.taxAmount,
    dueDate,
    country: TAX_RATES[countryCode.toUpperCase()].country
  };
}

/**
 * Get tax rates for a country
 */
export function getTaxRates(countryCode: string): TaxRate | null {
  return TAX_RATES[countryCode.toUpperCase()] || null;
}

/**
 * Get all supported countries with tax rates
 */
export function getSupportedCountries(): Array<{ code: string; name: string; currency: string }> {
  return Object.entries(TAX_RATES).map(([code, rates]) => ({
    code,
    name: rates.country,
    currency: rates.currency
  }));
}

/**
 * Calculate penalty for late tax payment
 */
export function calculateLatePenalty(
  taxAmount: number,
  dueDate: Date,
  paymentDate: Date,
  penaltyRate: number = 5 // Default 5% per month
): {
  daysLate: number;
  monthsLate: number;
  penaltyAmount: number;
  totalAmount: number;
} {
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLate = Math.max(0, Math.floor((paymentDate.getTime() - dueDate.getTime()) / msPerDay));
  const monthsLate = Math.ceil(daysLate / 30);
  
  const penaltyAmount = (taxAmount * penaltyRate * monthsLate) / 100;
  const totalAmount = taxAmount + penaltyAmount;
  
  return {
    daysLate,
    monthsLate,
    penaltyAmount,
    totalAmount
  };
}

/**
 * Validate tax calculation inputs
 */
export function validateTaxInputs(
  amount: number,
  countryCode: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (amount < 0) {
    errors.push('Amount cannot be negative');
  }
  
  if (amount > Number.MAX_SAFE_INTEGER) {
    errors.push('Amount is too large');
  }
  
  if (!countryCode || countryCode.length !== 2) {
    errors.push('Invalid country code (must be 2 characters)');
  }
  
  if (!TAX_RATES[countryCode.toUpperCase()]) {
    errors.push(`Tax rates not available for country: ${countryCode}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format tax amount for display
 */
export function formatTaxAmount(
  amount: number,
  countryCode: string,
  options?: { showCurrency?: boolean }
): string {
  const taxRate = TAX_RATES[countryCode.toUpperCase()];
  const currency = taxRate?.currency || 'USD';
  const { showCurrency = true } = options || {};
  
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return showCurrency ? `${formatted} ${currency}` : formatted;
}

/**
 * Get tax compliance dates for a country and year
 */
export function getTaxComplianceDates(
  countryCode: string,
  year: number
): {
  vatReturnDates: Date[];
  corporateTaxDue: Date;
  annualReturnDue: Date;
} {
  // Default dates - in practice these would vary by country
  const vatReturnDates = [
    new Date(year, 3, 30), // Q1 - April 30
    new Date(year, 6, 31), // Q2 - July 31
    new Date(year, 9, 31), // Q3 - October 31
    new Date(year + 1, 0, 31) // Q4 - January 31 next year
  ];
  
  const corporateTaxDue = new Date(year + 1, 2, 31); // March 31 next year
  const annualReturnDue = new Date(year + 1, 11, 31); // December 31 next year
  
  return {
    vatReturnDates,
    corporateTaxDue,
    annualReturnDue
  };
}