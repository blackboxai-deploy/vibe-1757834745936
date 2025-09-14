"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { accountingStore } from "@/lib/accounting-store";

import { Transaction } from "@/lib/accounting-types";
import Link from "next/link";

export default function TaxesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [taxSummary, setTaxSummary] = useState({
    vatLiability: 0,
    corporateTaxLiability: 0,
    totalTaxLiability: 0,
    vatCollected: 0,
    vatPaid: 0,
    taxableIncome: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTaxData();
  }, [selectedPeriod, selectedCountry]);

  const loadTaxData = () => {
    setIsLoading(true);
    try {
      const allTransactions = accountingStore.getTransactions();
      const periodDates = calculatePeriodDates(selectedPeriod);
      
      // Filter transactions for the selected period
      const periodTransactions = allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= periodDates.start && transactionDate <= periodDates.end;
      });

      setTransactions(periodTransactions);

      // Calculate tax summary
      const summary = calculateTaxSummary(periodTransactions);
      setTaxSummary(summary);
    } catch (error) {
      console.error('Failed to load tax data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePeriodDates = (period: string) => {
    const now = new Date();
    let start: Date, end: Date;

    switch (period) {
      case 'current-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'current-quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), currentQuarter * 3, 1);
        end = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        break;
      case 'current-year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
    }

    return { start, end };
  };

  const calculateTaxSummary = (periodTransactions: Transaction[]) => {
    let vatCollected = 0;
    let vatPaid = 0;
    let taxableIncome = 0;
    let totalExpenses = 0;

    periodTransactions.forEach(transaction => {
      if (transaction.taxAmount) {
        if (transaction.category === 'sales') {
          vatCollected += transaction.taxAmount;
          taxableIncome += transaction.amount;
        } else {
          vatPaid += transaction.taxAmount;
          totalExpenses += transaction.amount;
        }
      }

      // Calculate taxable income
      if (transaction.category === 'sales') {
        taxableIncome += transaction.amount;
      } else if (['purchase', 'salary', 'rent', 'utility'].includes(transaction.category)) {
        totalExpenses += transaction.amount;
      }
    });

    const netTaxableIncome = taxableIncome - totalExpenses;
    const vatLiability = vatCollected - vatPaid;
    
    // Calculate corporate tax (simplified - would need proper tax brackets in real implementation)
    const corporateTaxRate = getCorpateTaxRate(selectedCountry);
    const corporateTaxLiability = Math.max(0, netTaxableIncome * corporateTaxRate / 100);
    
    const totalTaxLiability = vatLiability + corporateTaxLiability;

    return {
      vatLiability,
      corporateTaxLiability,
      totalTaxLiability,
      vatCollected,
      vatPaid,
      taxableIncome: netTaxableIncome,
    };
  };

  const getCorpateTaxRate = (country: string): number => {
    const taxRates: { [key: string]: number } = {
      'US': 21,
      'UK': 19,
      'DE': 30,
      'FR': 28,
      'CA': 15,
      'AU': 30,
      'JP': 23.2,
      'CN': 25,
      'IN': 30,
      'BR': 34,
    };
    return taxRates[country] || 21;
  };

  const getVATRate = (country: string): number => {
    const vatRates: { [key: string]: number } = {
      'US': 0, // No federal VAT in US
      'UK': 20,
      'DE': 19,
      'FR': 20,
      'CA': 5, // GST
      'AU': 10, // GST
      'JP': 10,
      'CN': 13,
      'IN': 18, // GST
      'BR': 17,
    };
    return vatRates[country] || 20;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getPeriodName = (period: string) => {
    switch (period) {
      case 'current-month':
        return 'Current Month';
      case 'current-quarter':
        return 'Current Quarter';
      case 'current-year':
        return 'Current Year';
      default:
        return 'Current Period';
    }
  };

  const getCountryName = (code: string) => {
    const countries: { [key: string]: string } = {
      'US': 'United States',
      'UK': 'United Kingdom',
      'DE': 'Germany',
      'FR': 'France',
      'CA': 'Canada',
      'AU': 'Australia',
      'JP': 'Japan',
      'CN': 'China',
      'IN': 'India',
      'BR': 'Brazil',
    };
    return countries[code] || code;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tax Management</h1>
        </div>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Management</h1>
          <p className="text-gray-500 mt-1">VAT, Corporate Tax, and compliance management</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
              <SelectItem value="FR">France</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="AU">Australia</SelectItem>
              <SelectItem value="JP">Japan</SelectItem>
              <SelectItem value="CN">China</SelectItem>
              <SelectItem value="IN">India</SelectItem>
              <SelectItem value="BR">Brazil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Period and Country Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{getPeriodName(selectedPeriod)} Tax Summary</h2>
              <p className="text-sm text-gray-500">
                Country: {getCountryName(selectedCountry)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                VAT Rate: {getVATRate(selectedCountry)}%
              </Badge>
              <Badge variant="outline" className="text-sm">
                Corporate Tax: {getCorpateTaxRate(selectedCountry)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">VAT Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${taxSummary.vatLiability >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(taxSummary.vatLiability))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {taxSummary.vatLiability >= 0 ? 'Amount Owed' : 'Refund Due'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Corporate Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(taxSummary.corporateTaxLiability)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              On taxable income of {formatCurrency(taxSummary.taxableIncome)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tax Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(taxSummary.totalTaxLiability)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Combined tax obligations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* VAT and Corporate Tax Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VAT Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-blue-600 mr-2">🧾</span>
              VAT Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>VAT Collected (Output VAT)</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(taxSummary.vatCollected)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>VAT Paid (Input VAT)</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(taxSummary.vatPaid)}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Net VAT Liability</span>
                  <span className={taxSummary.vatLiability >= 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(Math.abs(taxSummary.vatLiability))}
                    {taxSummary.vatLiability < 0 && ' (Refund)'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Link href="/taxes/vat">
                <Button className="w-full">Manage VAT Returns</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Corporate Tax Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-orange-600 mr-2">🏢</span>
              Corporate Tax Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Taxable Income</span>
                <span className="font-semibold">
                  {formatCurrency(taxSummary.taxableIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax Rate ({selectedCountry})</span>
                <span className="font-semibold">
                  {getCorpateTaxRate(selectedCountry)}%
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Corporate Tax Liability</span>
                  <span className="text-orange-600">
                    {formatCurrency(taxSummary.corporateTaxLiability)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Link href="/taxes/corporate">
                <Button className="w-full">Manage Corporate Tax</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Calendar & Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Calendar & Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">VAT Return</h4>
                <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
              </div>
              <p className="text-sm text-gray-600">Quarterly VAT return filing</p>
              <p className="text-xs text-gray-500 mt-1">Due: End of next month</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Corporate Tax</h4>
                <Badge className="bg-green-100 text-green-800">On Track</Badge>
              </div>
              <p className="text-sm text-gray-600">Annual corporate tax filing</p>
              <p className="text-xs text-gray-500 mt-1">Due: March 15th</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Payroll Tax</h4>
                <Badge className="bg-blue-100 text-blue-800">Monthly</Badge>
              </div>
              <p className="text-sm text-gray-600">Employee tax withholdings</p>
              <p className="text-xs text-gray-500 mt-1">Due: 15th of each month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Management Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/taxes/vat">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <span className="text-xl mb-1">🧾</span>
                <span className="text-sm">VAT Returns</span>
              </Button>
            </Link>
            
            <Link href="/taxes/corporate">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <span className="text-xl mb-1">🏢</span>
                <span className="text-sm">Corporate Tax</span>
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center" disabled>
              <span className="text-xl mb-1">📊</span>
              <span className="text-sm">Tax Reports</span>
            </Button>
            
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center" disabled>
              <span className="text-xl mb-1">⚙️</span>
              <span className="text-sm">Tax Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tax-Related Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tax-Related Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.filter(t => t.taxAmount && t.taxAmount > 0).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tax-related transactions in this period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions
                .filter(t => t.taxAmount && t.taxAmount > 0)
                .slice(0, 5)
                .map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{transaction.category}</span>
                        <span>•</span>
                        <span>VAT: {transaction.vatRate}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Tax: {formatCurrency(transaction.taxAmount || 0, transaction.currency)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}