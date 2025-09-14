// Currency conversion and formatting utilities

import { Currency } from './accounting-types';

// Real-time exchange rates (in production, this would fetch from an API)
export const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.0,
  'EUR': 0.85,
  'GBP': 0.73,
  'JPY': 110.0,
  'CAD': 1.25,
  'AUD': 1.35,
  'CHF': 0.92,
  'CNY': 6.45,
  'INR': 74.5,
  'BRL': 5.2,
  'KRW': 1180.0,
  'SGD': 1.35,
  'HKD': 7.8,
  'NZD': 1.42,
  'SEK': 8.6,
  'NOK': 8.8,
  'DKK': 6.4,
  'PLN': 3.9,
  'CZK': 22.0,
  'HUF': 295.0
};

// Currency symbols mapping
export const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
  'CHF': 'CHF',
  'CNY': '¥',
  'INR': '₹',
  'BRL': 'R$',
  'KRW': '₩',
  'SGD': 'S$',
  'HKD': 'HK$',
  'NZD': 'NZ$',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'HUF': 'Ft'
};

// Currency names mapping
export const CURRENCY_NAMES: Record<string, string> = {
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'JPY': 'Japanese Yen',
  'CAD': 'Canadian Dollar',
  'AUD': 'Australian Dollar',
  'CHF': 'Swiss Franc',
  'CNY': 'Chinese Yuan',
  'INR': 'Indian Rupee',
  'BRL': 'Brazilian Real',
  'KRW': 'South Korean Won',
  'SGD': 'Singapore Dollar',
  'HKD': 'Hong Kong Dollar',
  'NZD': 'New Zealand Dollar',
  'SEK': 'Swedish Krona',
  'NOK': 'Norwegian Krone',
  'DKK': 'Danish Krone',
  'PLN': 'Polish Złoty',
  'CZK': 'Czech Koruna',
  'HUF': 'Hungarian Forint'
};

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string,
  exchangeRates?: Record<string, number>
): number {
  const rates = exchangeRates || EXCHANGE_RATES;
  
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];
  
  if (!fromRate || !toRate) {
    console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency}`);
    return amount;
  }
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

/**
 * Format amount with currency symbol and proper decimal places
 */
export function formatCurrency(
  amount: number, 
  currency: string, 
  locale: string = 'en-US',
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    decimalPlaces?: number;
  }
): string {
  const {
    showSymbol = true,
    showCode = false,
    decimalPlaces = 2
  } = options || {};
  
  const formattedAmount = amount.toLocaleString(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  });
  
  if (showSymbol) {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${formattedAmount}`;
  }
  
  if (showCode) {
    return `${formattedAmount} ${currency}`;
  }
  
  return formattedAmount;
}

/**
 * Get currency display name
 */
export function getCurrencyName(currency: string): string {
  return CURRENCY_NAMES[currency] || currency;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Get list of supported currencies
 */
export function getSupportedCurrencies(): Currency[] {
  return Object.keys(EXCHANGE_RATES).map(code => ({
    code,
    name: getCurrencyName(code),
    symbol: getCurrencySymbol(code),
    rate: EXCHANGE_RATES[code]
  }));
}

/**
 * Update exchange rates (would typically fetch from API)
 */
export async function updateExchangeRates(): Promise<Record<string, number>> {
  // In a real application, this would fetch from a currency API like:
  // - fixer.io
  // - exchangerate-api.com
  // - openexchangerates.org
  
  try {
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock updated rates with small variations
    const updatedRates: Record<string, number> = {};
    Object.keys(EXCHANGE_RATES).forEach(currency => {
      const baseRate = EXCHANGE_RATES[currency];
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      updatedRates[currency] = baseRate * (1 + variation);
    });
    
    // Update the global rates
    Object.assign(EXCHANGE_RATES, updatedRates);
    
    return updatedRates;
  } catch (error) {
    console.error('Failed to update exchange rates:', error);
    return EXCHANGE_RATES;
  }
}

/**
 * Calculate currency conversion with fees
 */
export function convertWithFees(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  feePercentage: number = 0.5
): {
  originalAmount: number;
  convertedAmount: number;
  fee: number;
  totalAmount: number;
  exchangeRate: number;
} {
  const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency);
  const fee = convertedAmount * (feePercentage / 100);
  const totalAmount = convertedAmount + fee;
  const exchangeRate = EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency];
  
  return {
    originalAmount: amount,
    convertedAmount,
    fee,
    totalAmount,
    exchangeRate
  };
}

/**
 * Format exchange rate for display
 */
export function formatExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  rate?: number
): string {
  const actualRate = rate || (EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency]);
  return `1 ${fromCurrency} = ${actualRate.toFixed(4)} ${toCurrency}`;
}

/**
 * Get historical exchange rates (mock implementation)
 */
export function getHistoricalRates(
  currency: string,
  days: number = 30
): Array<{ date: Date; rate: number }> {
  const rates: Array<{ date: Date; rate: number }> = [];
  const baseRate = EXCHANGE_RATES[currency];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate mock historical data with some variation
    const variation = Math.sin(i * 0.1) * 0.05 + (Math.random() - 0.5) * 0.02;
    const rate = baseRate * (1 + variation);
    
    rates.push({ date, rate });
  }
  
  return rates;
}

/**
 * Check if currency is supported
 */
export function isCurrencySupported(currency: string): boolean {
  return currency in EXCHANGE_RATES;
}

/**
 * Get the most commonly used currencies
 */
export function getMajorCurrencies(): string[] {
  return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
}

/**
 * Validate currency amount
 */
export function validateCurrencyAmount(amount: number | string): {
  isValid: boolean;
  numericValue: number;
  error?: string;
} {
  const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericValue)) {
    return {
      isValid: false,
      numericValue: 0,
      error: 'Invalid amount: not a number'
    };
  }
  
  if (numericValue < 0) {
    return {
      isValid: false,
      numericValue,
      error: 'Amount cannot be negative'
    };
  }
  
  if (numericValue > Number.MAX_SAFE_INTEGER) {
    return {
      isValid: false,
      numericValue,
      error: 'Amount is too large'
    };
  }
  
  return {
    isValid: true,
    numericValue
  };
}