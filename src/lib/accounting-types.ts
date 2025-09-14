// Core TypeScript interfaces for the accounting system

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Exchange rate relative to base currency
}

export interface Account {
  id: string;
  name: string;
  code: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  reference: string;
  amount: number;
  currency: string;
  category: TransactionCategory;
  folder: TransactionFolder;
  debitAccount: string;
  creditAccount: string;
  taxAmount?: number;
  vatRate?: number;
  attachments: string[];
  status: 'pending' | 'approved' | 'reconciled';
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionCategory = 
  | 'sales' 
  | 'purchase' 
  | 'utility' 
  | 'rent' 
  | 'salary' 
  | 'dividend'
  | 'other';

export type TransactionFolder = 
  | 'bank' 
  | 'expenses' 
  | 'suspense';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  taxId?: string;
  currency: string;
  creditLimit: number;
  balance: number;
  createdAt: Date;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  taxId?: string;
  currency: string;
  balance: number;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  date: Date;
  dueDate: Date;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  vatRate: number;
}

export interface TaxConfiguration {
  country: string;
  vatRates: {
    standard: number;
    reduced: number;
    zero: number;
  };
  corporateTaxRate: number;
  taxYear: number;
  currency: string;
}

export interface FinancialPeriod {
  startDate: Date;
  endDate: Date;
  name: string;
  isClosed: boolean;
}

export interface BalanceSheetData {
  period: FinancialPeriod;
  currency: string;
  assets: {
    currentAssets: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      other: number;
      total: number;
    };
    fixedAssets: {
      propertyPlantEquipment: number;
      intangibleAssets: number;
      other: number;
      total: number;
    };
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: {
      accountsPayable: number;
      shortTermDebt: number;
      accruedExpenses: number;
      other: number;
      total: number;
    };
    longTermLiabilities: {
      longTermDebt: number;
      other: number;
      total: number;
    };
    totalLiabilities: number;
  };
  equity: {
    shareCapital: number;
    retainedEarnings: number;
    other: number;
    total: number;
  };
}

export interface ProfitLossData {
  period: FinancialPeriod;
  currency: string;
  revenue: {
    sales: number;
    other: number;
    total: number;
  };
  expenses: {
    costOfGoodsSold: number;
    salaries: number;
    rent: number;
    utilities: number;
    other: number;
    total: number;
  };
  grossProfit: number;
  netProfit: number;
  taxExpense: number;
  profitBeforeTax: number;
}

export interface CompanySettings {
  name: string;
  address: string;
  country: string;
  currency: string;
  taxId: string;
  financialYearStart: string; // MM-DD format
  logo?: string;
  defaultVatRate: number;
  defaultCorporateTaxRate: number;
}

export interface DashboardKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  currentRatio: number;
  currency: string;
  period: string;
}

// Utility types for form validation
export interface CreateTransactionData {
  description: string;
  amount: number;
  currency: string;
  category: TransactionCategory;
  folder: TransactionFolder;
  date: Date;
  reference?: string;
  debitAccount: string;
  creditAccount: string;
  vatRate?: number;
  taxAmount?: number;
  attachments?: string[];
  status?: 'pending' | 'approved' | 'reconciled';
}

export interface CreateInvoiceData {
  customerId: string;
  date: Date;
  dueDate: Date;
  currency: string;
  items: Omit<InvoiceItem, 'id'>[];
  vatRate: number;
  notes?: string;
}

// Filter and search types
export interface TransactionFilters {
  dateFrom?: Date;
  dateTo?: Date;
  category?: TransactionCategory;
  folder?: TransactionFolder;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: Transaction['status'];
}

export interface InvoiceFilters {
  dateFrom?: Date;
  dateTo?: Date;
  status?: Invoice['status'];
  customerId?: string;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
}