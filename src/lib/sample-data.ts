// Sample data to populate the accounting system for demo purposes

import { accountingStore } from './accounting-store';

export function seedSampleData() {
  try {
    // Check if data already exists to avoid duplicates
    const existingTransactions = accountingStore.getTransactions();
    if (existingTransactions.length > 0) {
      console.log('Sample data already exists');
      return;
    }

    console.log('Seeding sample data...');

    // Sample transactions
    const sampleTransactions = [
      {
        description: 'Website Development Services',
        amount: 5000,
        currency: 'USD',
        category: 'sales' as const,
        folder: 'bank' as const,
        date: new Date('2024-01-15'),
        debitAccount: '1000', // Cash
        creditAccount: '4000', // Sales Revenue
        vatRate: 20,
      },
      {
        description: 'Office Rent Payment',
        amount: 2500,
        currency: 'USD',
        category: 'rent' as const,
        folder: 'expenses' as const,
        date: new Date('2024-01-01'),
        debitAccount: '6100', // Rent Expense
        creditAccount: '1000', // Cash
        vatRate: 0,
      },
      {
        description: 'Laptop Purchase',
        amount: 1200,
        currency: 'USD',
        category: 'purchase' as const,
        folder: 'expenses' as const,
        date: new Date('2024-01-10'),
        debitAccount: '1500', // Equipment
        creditAccount: '1000', // Cash
        vatRate: 20,
      },
      {
        description: 'Consulting Services Revenue',
        amount: 3500,
        currency: 'USD',
        category: 'sales' as const,
        folder: 'bank' as const,
        date: new Date('2024-01-20'),
        debitAccount: '1100', // Accounts Receivable
        creditAccount: '4100', // Service Revenue
        vatRate: 20,
      },
      {
        description: 'Software Licenses',
        amount: 800,
        currency: 'USD',
        category: 'purchase' as const,
        folder: 'expenses' as const,
        date: new Date('2024-01-08'),
        debitAccount: '6300', // Office Supplies
        creditAccount: '2000', // Accounts Payable
        vatRate: 20,
      },
      {
        description: 'Electricity Bill',
        amount: 350,
        currency: 'USD',
        category: 'utility' as const,
        folder: 'expenses' as const,
        date: new Date('2024-01-05'),
        debitAccount: '6200', // Utilities Expense
        creditAccount: '1000', // Cash
        vatRate: 10,
      },
      {
        description: 'Employee Salary - John Doe',
        amount: 4500,
        currency: 'USD',
        category: 'salary' as const,
        folder: 'expenses' as const,
        date: new Date('2024-01-31'),
        debitAccount: '6000', // Salaries Expense
        creditAccount: '1000', // Cash
        vatRate: 0,
      },
      {
        description: 'Product Sales - E-commerce',
        amount: 2800,
        currency: 'USD',
        category: 'sales' as const,
        folder: 'bank' as const,
        date: new Date('2024-02-05'),
        debitAccount: '1000', // Cash
        creditAccount: '4000', // Sales Revenue
        vatRate: 20,
      },
      {
        description: 'Marketing Campaign',
        amount: 1500,
        currency: 'USD',
        category: 'other' as const,
        folder: 'expenses' as const,
        date: new Date('2024-02-10'),
        debitAccount: '6000', // Operating Expenses
        creditAccount: '1000', // Cash
        vatRate: 20,
      },
      {
        description: 'Interest Income',
        amount: 250,
        currency: 'USD',
        category: 'other' as const,
        folder: 'bank' as const,
        date: new Date('2024-02-01'),
        debitAccount: '1000', // Cash
        creditAccount: '4100', // Other Revenue
        vatRate: 0,
      },
      {
        description: 'Pending Bank Transfer',
        amount: 5500,
        currency: 'USD',
        category: 'sales' as const,
        folder: 'suspense' as const,
        date: new Date('2024-02-15'),
        debitAccount: '1000', // Cash
        creditAccount: '4000', // Sales Revenue
        vatRate: 20,
      },
    ];

    // Create sample transactions
    sampleTransactions.forEach(transaction => {
      accountingStore.createTransaction(transaction);
    });

    // Sample customers (for future use)
    const sampleCustomers = [
      {
        id: 'cust_001',
        name: 'Tech Solutions Inc.',
        email: 'billing@techsolutions.com',
        phone: '+1-555-0123',
        address: '123 Tech Street, Silicon Valley, CA 94000, USA',
        country: 'USA',
        taxId: 'US-123456789',
        currency: 'USD',
        creditLimit: 50000,
        balance: 3500,
        createdAt: new Date(),
      },
      {
        id: 'cust_002',
        name: 'European Consulting Ltd.',
        email: 'accounts@euroconsulting.eu',
        phone: '+44-20-7946-0958',
        address: '456 Business Avenue, London, EC1A 1BB, UK',
        country: 'UK',
        taxId: 'GB-987654321',
        currency: 'GBP',
        creditLimit: 75000,
        balance: 0,
        createdAt: new Date(),
      },
    ];

    console.log('Sample data seeded successfully!');
    console.log(`Created ${sampleTransactions.length} transactions`);
    
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
}