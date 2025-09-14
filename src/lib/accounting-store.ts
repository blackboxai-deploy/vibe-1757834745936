// Centralized data store for the accounting system with real-time calculations
import { 
  Transaction, 
  Invoice, 
  Account, 
  Customer, 
  Vendor, 
  Currency,
  CompanySettings,
  DashboardKPIs,
  BalanceSheetData,
  ProfitLossData,
  FinancialPeriod,
  CreateTransactionData,
  CreateInvoiceData,
  TransactionFilters,
  InvoiceFilters,
  InvoiceItem
} from './accounting-types';

// Default currencies with exchange rates
const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.0 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.92 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.45 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 74.5 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.2 }
];

// Default accounts structure
const DEFAULT_ACCOUNTS: Account[] = [
  // Assets
  { id: '1000', name: 'Cash', code: '1000', type: 'asset', category: 'Current Assets', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  { id: '1100', name: 'Accounts Receivable', code: '1100', type: 'asset', category: 'Current Assets', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  { id: '1200', name: 'Inventory', code: '1200', type: 'asset', category: 'Current Assets', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  { id: '1500', name: 'Equipment', code: '1500', type: 'asset', category: 'Fixed Assets', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  
  // Liabilities
  { id: '2000', name: 'Accounts Payable', code: '2000', type: 'liability', category: 'Current Liabilities', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  { id: '2100', name: 'VAT Payable', code: '2100', type: 'liability', category: 'Current Liabilities', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  { id: '2500', name: 'Long-term Debt', code: '2500', type: 'liability', category: 'Long-term Liabilities', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  
  // Equity
  { id: '3000', name: 'Share Capital', code: '3000', type: 'equity', category: 'Equity', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  { id: '3100', name: 'Retained Earnings', code: '3100', type: 'equity', category: 'Equity', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  
  // Revenue
  { id: '4000', name: 'Sales Revenue', code: '4000', type: 'revenue', category: 'Revenue', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  { id: '4100', name: 'Service Revenue', code: '4100', type: 'revenue', category: 'Revenue', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  
  // Expenses
  { id: '5000', name: 'Cost of Goods Sold', code: '5000', type: 'expense', category: 'Cost of Sales', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  { id: '6000', name: 'Salaries Expense', code: '6000', type: 'expense', category: 'Operating Expenses', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  { id: '6100', name: 'Rent Expense', code: '6100', type: 'expense', category: 'Operating Expenses', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  { id: '6200', name: 'Utilities Expense', code: '6200', type: 'expense', category: 'Operating Expenses', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() },
  { id: '6300', name: 'Office Supplies', code: '6300', type: 'expense', category: 'Operating Expenses', balance: 0, currency: 'USD', isActive: true, createdAt: new Date() }
];

// Default company settings
const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: 'Your Company Name',
  address: '123 Business Street, City, Country',
  country: 'United States',
  currency: 'USD',
  taxId: 'TAX123456789',
  financialYearStart: '01-01',
  defaultVatRate: 20,
  defaultCorporateTaxRate: 25
};

class AccountingStore {
  private static instance: AccountingStore;
  
  private transactions: Transaction[] = [];
  private invoices: Invoice[] = [];
  private accounts: Account[] = [];
  private customers: Customer[] = [];
  private vendors: Vendor[] = [];
  private currencies: Currency[] = [];
  private companySettings: CompanySettings = DEFAULT_COMPANY_SETTINGS;
  
  constructor() {
    this.loadData();
    this.initializeDefaults();
  }
  
  static getInstance(): AccountingStore {
    if (!AccountingStore.instance) {
      AccountingStore.instance = new AccountingStore();
    }
    return AccountingStore.instance;
  }
  
  private loadData(): void {
    // Skip loading if localStorage is not available (SSR)
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const savedTransactions = localStorage.getItem('accounting_transactions');
      const savedInvoices = localStorage.getItem('accounting_invoices');
      const savedAccounts = localStorage.getItem('accounting_accounts');
      const savedCustomers = localStorage.getItem('accounting_customers');
      const savedVendors = localStorage.getItem('accounting_vendors');
      const savedCurrencies = localStorage.getItem('accounting_currencies');
      const savedSettings = localStorage.getItem('accounting_settings');
      
      this.transactions = savedTransactions ? JSON.parse(savedTransactions).map((t: any) => ({
        ...t,
        date: new Date(t.date),
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      })) : [];
      
      this.invoices = savedInvoices ? JSON.parse(savedInvoices).map((i: any) => ({
        ...i,
        date: new Date(i.date),
        dueDate: new Date(i.dueDate),
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt)
      })) : [];
      
      this.accounts = savedAccounts ? JSON.parse(savedAccounts).map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt)
      })) : [];
      
      this.customers = savedCustomers ? JSON.parse(savedCustomers).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt)
      })) : [];
      
      this.vendors = savedVendors ? JSON.parse(savedVendors).map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt)
      })) : [];
      
      this.currencies = savedCurrencies ? JSON.parse(savedCurrencies) : [];
      this.companySettings = savedSettings ? JSON.parse(savedSettings) : DEFAULT_COMPANY_SETTINGS;
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }
  
  private initializeDefaults(): void {
    if (this.accounts.length === 0) {
      this.accounts = [...DEFAULT_ACCOUNTS];
      this.saveAccounts();
    }
    
    if (this.currencies.length === 0) {
      this.currencies = [...DEFAULT_CURRENCIES];
      this.saveCurrencies();
    }
  }
  
  private saveTransactions(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accounting_transactions', JSON.stringify(this.transactions));
    }
  }
  
  private saveInvoices(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accounting_invoices', JSON.stringify(this.invoices));
    }
  }
  
  private saveAccounts(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accounting_accounts', JSON.stringify(this.accounts));
    }
  }
  
  private saveCustomers(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accounting_customers', JSON.stringify(this.customers));
    }
  }
  
  private saveVendors(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accounting_vendors', JSON.stringify(this.vendors));
    }
  }
  
  private saveCurrencies(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accounting_currencies', JSON.stringify(this.currencies));
    }
  }
  
  private saveSettings(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accounting_settings', JSON.stringify(this.companySettings));
    }
  }
  
  // Transaction methods
  createTransaction(data: CreateTransactionData): Transaction {
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: data.date,
      description: data.description,
      reference: data.reference || '',
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      folder: data.folder,
      debitAccount: data.debitAccount,
      creditAccount: data.creditAccount,
      taxAmount: data.vatRate ? (data.amount * data.vatRate / 100) : undefined,
      vatRate: data.vatRate,
      attachments: [],
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.transactions.push(transaction);
    this.updateAccountBalances(transaction);
    this.saveTransactions();
    this.saveAccounts();
    
    return transaction;
  }
  
  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    const oldTransaction = { ...this.transactions[index] };
    this.transactions[index] = { 
      ...this.transactions[index], 
      ...updates, 
      updatedAt: new Date() 
    };
    
    // Reverse old transaction effects and apply new ones
    this.reverseAccountBalances(oldTransaction);
    this.updateAccountBalances(this.transactions[index]);
    
    this.saveTransactions();
    this.saveAccounts();
    
    return this.transactions[index];
  }
  
  deleteTransaction(id: string): boolean {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    const transaction = this.transactions[index];
    this.reverseAccountBalances(transaction);
    this.transactions.splice(index, 1);
    
    this.saveTransactions();
    this.saveAccounts();
    
    return true;
  }
  
  getTransactions(filters?: TransactionFilters): Transaction[] {
    let filtered = [...this.transactions];
    
    if (filters) {
      if (filters.dateFrom) {
        filtered = filtered.filter(t => t.date >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filtered = filtered.filter(t => t.date <= filters.dateTo!);
      }
      if (filters.category) {
        filtered = filtered.filter(t => t.category === filters.category);
      }
      if (filters.folder) {
        filtered = filtered.filter(t => t.folder === filters.folder);
      }
      if (filters.currency) {
        filtered = filtered.filter(t => t.currency === filters.currency);
      }
      if (filters.minAmount) {
        filtered = filtered.filter(t => t.amount >= filters.minAmount!);
      }
      if (filters.maxAmount) {
        filtered = filtered.filter(t => t.amount <= filters.maxAmount!);
      }
      if (filters.status) {
        filtered = filtered.filter(t => t.status === filters.status);
      }
    }
    
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  // Invoice methods
  createInvoice(data: CreateInvoiceData): Invoice {
    const customer = this.customers.find(c => c.id === data.customerId);
    if (!customer) throw new Error('Customer not found');
    
    const items = data.items.map((item, index) => ({
      id: `item_${index}`,
      ...item,
      amount: item.quantity * item.unitPrice
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = subtotal * (data.vatRate / 100);
    
    const invoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      number: `INV-${new Date().getFullYear()}-${String(this.invoices.length + 1).padStart(4, '0')}`,
      customerId: data.customerId,
      customerName: customer.name,
      customerAddress: customer.address,
      date: data.date,
      dueDate: data.dueDate,
      currency: data.currency,
      items,
      subtotal,
      vatAmount,
      vatRate: data.vatRate,
      totalAmount: subtotal + vatAmount,
      status: 'draft',
      notes: data.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.invoices.push(invoice);
    this.saveInvoices();
    
    return invoice;
  }
  
  updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    this.invoices[index] = { 
      ...this.invoices[index], 
      ...updates, 
      updatedAt: new Date() 
    };
    
    this.saveInvoices();
    return this.invoices[index];
  }
  
  deleteInvoice(id: string): boolean {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    this.invoices.splice(index, 1);
    this.saveInvoices();
    return true;
  }
  
  getInvoices(filters?: InvoiceFilters): Invoice[] {
    let filtered = [...this.invoices];
    
    if (filters) {
      if (filters.dateFrom) {
        filtered = filtered.filter(i => i.date >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filtered = filtered.filter(i => i.date <= filters.dateTo!);
      }
      if (filters.status) {
        filtered = filtered.filter(i => i.status === filters.status);
      }
      if (filters.customerId) {
        filtered = filtered.filter(i => i.customerId === filters.customerId);
      }
      if (filters.currency) {
        filtered = filtered.filter(i => i.currency === filters.currency);
      }
      if (filters.minAmount) {
        filtered = filtered.filter(i => i.totalAmount >= filters.minAmount!);
      }
      if (filters.maxAmount) {
        filtered = filtered.filter(i => i.totalAmount <= filters.maxAmount!);
      }
    }
    
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  // Account balance management
  private updateAccountBalances(transaction: Transaction): void {
    const debitAccount = this.accounts.find(a => a.id === transaction.debitAccount);
    const creditAccount = this.accounts.find(a => a.id === transaction.creditAccount);
    
    if (debitAccount) {
      debitAccount.balance += transaction.amount;
    }
    
    if (creditAccount) {
      creditAccount.balance -= transaction.amount;
    }
  }
  
  private reverseAccountBalances(transaction: Transaction): void {
    const debitAccount = this.accounts.find(a => a.id === transaction.debitAccount);
    const creditAccount = this.accounts.find(a => a.id === transaction.creditAccount);
    
    if (debitAccount) {
      debitAccount.balance -= transaction.amount;
    }
    
    if (creditAccount) {
      creditAccount.balance += transaction.amount;
    }
  }
  
  // Dashboard KPIs calculation
  getDashboardKPIs(period?: FinancialPeriod): DashboardKPIs {
    const currency = this.companySettings.currency;
    const currentDate = new Date();
    
    // Default to current month if no period specified
    const startDate = period?.startDate || new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = period?.endDate || new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const periodTransactions = this.transactions.filter(t => 
      t.date >= startDate && t.date <= endDate && t.status !== 'pending'
    );
    
    const revenueAccounts = this.accounts.filter(a => a.type === 'revenue');
    const expenseAccounts = this.accounts.filter(a => a.type === 'expense');
    const cashAccounts = this.accounts.filter(a => a.name.toLowerCase().includes('cash'));
    const receivableAccounts = this.accounts.filter(a => a.name.toLowerCase().includes('receivable'));
    const payableAccounts = this.accounts.filter(a => a.name.toLowerCase().includes('payable'));
    
    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const cashBalance = cashAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const accountsReceivable = receivableAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const accountsPayable = payableAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    
    const currentAssets = cashBalance + accountsReceivable;
    const currentLiabilities = accountsPayable;
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      cashBalance,
      accountsReceivable,
      accountsPayable,
      currentRatio,
      currency,
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    };
  }
  
  // Getter methods
  getAllAccounts(): Account[] {
    return [...this.accounts];
  }
  
  // Alias methods for backward compatibility
  getAccounts(): Account[] {
    return this.getAllAccounts();
  }
  
  getAllCustomers(): Customer[] {
    return [...this.customers];
  }
  
  getCustomers(): Customer[] {
    return this.getAllCustomers();
  }
  
  getAllVendors(): Vendor[] {
    return [...this.vendors];
  }
  
  getVendors(): Vendor[] {
    return this.getAllVendors();
  }
  
  getAllCurrencies(): Currency[] {
    return [...this.currencies];
  }
  
  getCurrencies(): Currency[] {
    return this.getAllCurrencies();
  }
  
  // Additional alias methods for consistency
  addTransaction(data: CreateTransactionData): Transaction {
    return this.createTransaction(data);
  }
  
  addInvoice(data: CreateInvoiceData): Invoice {
    return this.createInvoice(data);
  }
  
  getCompanySettings(): CompanySettings {
    return { ...this.companySettings };
  }
  
  updateCompanySettings(settings: Partial<CompanySettings>): void {
    this.companySettings = { ...this.companySettings, ...settings };
    this.saveSettings();
  }
  
  // Financial reporting methods
  getBalanceSheet(): BalanceSheetData {
    const currentDate = new Date();
    const period = {
      startDate: new Date(currentDate.getFullYear(), 0, 1),
      endDate: currentDate,
      name: `Year ${currentDate.getFullYear()}`,
      isClosed: false
    };

    // Calculate current assets
    const cashAccounts = this.accounts.filter(a => a.name.toLowerCase().includes('cash'));
    const receivableAccounts = this.accounts.filter(a => a.name.toLowerCase().includes('receivable'));
    const inventoryAccounts = this.accounts.filter(a => a.name.toLowerCase().includes('inventory'));
    
    const cash = cashAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const accountsReceivable = receivableAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const inventory = inventoryAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    const currentAssets = {
      cash,
      accountsReceivable,
      inventory,
      other: 0,
      total: cash + accountsReceivable + inventory
    };

    // Calculate fixed assets
    const fixedAssetAccounts = this.accounts.filter(a => a.type === 'asset' && !['cash', 'receivable', 'inventory'].some(term => a.name.toLowerCase().includes(term)));
    const propertyPlantEquipment = fixedAssetAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    const fixedAssets = {
      propertyPlantEquipment,
      intangibleAssets: 0,
      other: 0,
      total: propertyPlantEquipment
    };

    // Calculate current liabilities
    const payableAccounts = this.accounts.filter(a => a.name.toLowerCase().includes('payable'));
    const vatAccounts = this.accounts.filter(a => a.name.toLowerCase().includes('vat'));
    
    const accountsPayable = payableAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    const accruedExpenses = vatAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    
    const currentLiabilities = {
      accountsPayable,
      shortTermDebt: 0,
      accruedExpenses,
      other: 0,
      total: accountsPayable + accruedExpenses
    };

    const longTermLiabilities = {
      longTermDebt: 0,
      other: 0,
      total: 0
    };

    // Calculate equity
    const equityAccounts = this.accounts.filter(a => a.type === 'equity');
    const shareCapital = equityAccounts.filter(a => a.name.toLowerCase().includes('capital')).reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    const retainedEarnings = equityAccounts.filter(a => a.name.toLowerCase().includes('retained')).reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    
    const equity = {
      shareCapital,
      retainedEarnings,
      other: 0,
      total: shareCapital + retainedEarnings
    };

    return {
      period,
      currency: this.companySettings.currency,
      assets: {
        currentAssets,
        fixedAssets,
        totalAssets: currentAssets.total + fixedAssets.total
      },
      liabilities: {
        currentLiabilities,
        longTermLiabilities,
        totalLiabilities: currentLiabilities.total + longTermLiabilities.total
      },
      equity
    };
  }

  getProfitLoss(): ProfitLossData {
    const currentDate = new Date();
    const period = {
      startDate: new Date(currentDate.getFullYear(), 0, 1),
      endDate: currentDate,
      name: `Year ${currentDate.getFullYear()}`,
      isClosed: false
    };

    // Calculate revenue
    const revenueAccounts = this.accounts.filter(a => a.type === 'revenue');
    const salesRevenue = revenueAccounts.filter(a => a.name.toLowerCase().includes('sales')).reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    const otherRevenue = revenueAccounts.filter(a => !a.name.toLowerCase().includes('sales')).reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    
    const revenue = {
      sales: salesRevenue,
      other: otherRevenue,
      total: salesRevenue + otherRevenue
    };

    // Calculate expenses
    const expenseAccounts = this.accounts.filter(a => a.type === 'expense');
    const costOfGoodsSold = expenseAccounts.filter(a => a.name.toLowerCase().includes('cost')).reduce((sum, acc) => sum + acc.balance, 0);
    const salaries = expenseAccounts.filter(a => a.name.toLowerCase().includes('salary')).reduce((sum, acc) => sum + acc.balance, 0);
    const rent = expenseAccounts.filter(a => a.name.toLowerCase().includes('rent')).reduce((sum, acc) => sum + acc.balance, 0);
    const utilities = expenseAccounts.filter(a => a.name.toLowerCase().includes('utilities')).reduce((sum, acc) => sum + acc.balance, 0);
    const otherExpenses = expenseAccounts.filter(a => 
      !['cost', 'salary', 'rent', 'utilities'].some(term => a.name.toLowerCase().includes(term))
    ).reduce((sum, acc) => sum + acc.balance, 0);
    
    const expenses = {
      costOfGoodsSold,
      salaries,
      rent,
      utilities,
      other: otherExpenses,
      total: costOfGoodsSold + salaries + rent + utilities + otherExpenses
    };

    const grossProfit = revenue.total - expenses.costOfGoodsSold;
    const profitBeforeTax = revenue.total - expenses.total;
    const taxExpense = Math.max(0, profitBeforeTax * 0.25); // Assuming 25% tax rate
    const netProfit = profitBeforeTax - taxExpense;

    return {
      period,
      currency: this.companySettings.currency,
      revenue,
      expenses,
      grossProfit,
      netProfit,
      taxExpense,
      profitBeforeTax
    };
  }
}

// Export singleton instance
export const accountingStore = AccountingStore.getInstance();