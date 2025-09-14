"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { accountingStore } from "@/lib/accounting-store";
import { BalanceSheetData } from "@/lib/accounting-types";

export default function BalanceSheetPage() {
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBalanceSheet();
  }, [selectedDate]);

  const loadBalanceSheet = () => {
    setIsLoading(true);
    try {
      const data = accountingStore.getBalanceSheet();
      setBalanceSheet(data);
    } catch (error) {
      console.error('Failed to load balance sheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Export functionality would be implemented here
    alert(`Exporting balance sheet as ${format.toUpperCase()}...`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Balance Sheet</h1>
        </div>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!balanceSheet) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Balance Sheet</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Balance Sheet Data</h3>
              <p className="text-gray-500">No financial data available for the selected date.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verify balance sheet equation: Assets = Liabilities + Equity
  const isBalanced = Math.abs(balanceSheet.assets.totalAssets - (balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.total)) < 0.01;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Balance Sheet</h1>
          <p className="text-gray-500 mt-1">Statement of Financial Position</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button variant="outline">Print</Button>
        </div>
      </div>

      {/* Balance Sheet Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">BALANCE SHEET</h2>
            <p className="text-gray-600">As of {formatDate(selectedDate)}</p>
            <div className="flex justify-center items-center space-x-4 mt-4">
              <Badge variant="outline" className="text-sm">
                Currency: {balanceSheet.currency}
              </Badge>
              <Badge 
                className={`text-sm ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                variant="secondary"
              >
                {isBalanced ? '✓ Balanced' : '⚠ Not Balanced'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-600">ASSETS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Assets */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">Current Assets</h3>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span>Cash and Cash Equivalents</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.assets.currentAssets.cash, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accounts Receivable</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.assets.currentAssets.accountsReceivable, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inventory</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.assets.currentAssets.inventory, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Current Assets</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.assets.currentAssets.other, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total Current Assets</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.assets.currentAssets.total, balanceSheet.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Non-Current Assets */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">Non-Current Assets</h3>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span>Property, Plant & Equipment</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.assets.fixedAssets.propertyPlantEquipment, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Intangible Assets</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.assets.fixedAssets.intangibleAssets, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Non-Current Assets</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.assets.fixedAssets.other, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total Non-Current Assets</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.assets.fixedAssets.total, balanceSheet.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Assets */}
              <div className="border-t-2 border-blue-600 pt-4">
                <div className="flex justify-between text-xl font-bold text-blue-600">
                  <span>TOTAL ASSETS</span>
                  <span className="font-mono">
                    {formatCurrency(balanceSheet.assets.totalAssets, balanceSheet.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liabilities & Equity Section */}
        <div className="space-y-6">
          {/* Liabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-red-600">LIABILITIES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Liabilities */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">Current Liabilities</h3>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span>Accounts Payable</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.liabilities.currentLiabilities.accountsPayable, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Short-term Debt</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.liabilities.currentLiabilities.shortTermDebt, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accrued Expenses</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.liabilities.currentLiabilities.accruedExpenses, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Current Liabilities</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.liabilities.currentLiabilities.other, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total Current Liabilities</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.liabilities.currentLiabilities.total, balanceSheet.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Long-term Liabilities */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">Long-term Liabilities</h3>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span>Long-term Debt</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.liabilities.longTermLiabilities.longTermDebt, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Long-term Liabilities</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.liabilities.longTermLiabilities.other, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total Long-term Liabilities</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.liabilities.longTermLiabilities.total, balanceSheet.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Liabilities */}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold text-red-600">
                  <span>TOTAL LIABILITIES</span>
                  <span className="font-mono">
                    {formatCurrency(balanceSheet.liabilities.totalLiabilities, balanceSheet.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-green-600">EQUITY</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Share Capital</span>
                  <span className="font-mono">
                    {formatCurrency(balanceSheet.equity.shareCapital, balanceSheet.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Retained Earnings</span>
                  <span className="font-mono">
                    {formatCurrency(balanceSheet.equity.retainedEarnings, balanceSheet.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Other Equity</span>
                  <span className="font-mono">
                    {formatCurrency(balanceSheet.equity.other, balanceSheet.currency)}
                  </span>
                </div>
                <div className="border-t-2 border-green-600 pt-4">
                  <div className="flex justify-between text-xl font-bold text-green-600">
                    <span>TOTAL EQUITY</span>
                    <span className="font-mono">
                      {formatCurrency(balanceSheet.equity.total, balanceSheet.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Liabilities + Equity */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex justify-between text-xl font-bold">
                <span>TOTAL LIABILITIES + EQUITY</span>
                <span className="font-mono">
                  {formatCurrency(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.total, balanceSheet.currency)}
                </span>
              </div>
              {!isBalanced && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">
                    ⚠ Warning: Balance sheet does not balance. Please review your entries.
                  </p>
                  <p className="text-red-500 text-xs mt-1">
                    Difference: {formatCurrency(
                      balanceSheet.assets.totalAssets - (balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.total),
                      balanceSheet.currency
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Ratios */}
      <Card>
        <CardHeader>
          <CardTitle>Key Financial Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(balanceSheet.assets.currentAssets.total / balanceSheet.liabilities.currentLiabilities.total || 0).toFixed(2)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Current Ratio</p>
              <p className="text-xs text-gray-400">Current Assets / Current Liabilities</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {((balanceSheet.assets.currentAssets.cash + balanceSheet.assets.currentAssets.accountsReceivable) / balanceSheet.liabilities.currentLiabilities.total || 0).toFixed(2)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Quick Ratio</p>
              <p className="text-xs text-gray-400">(Cash + AR) / Current Liabilities</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(balanceSheet.liabilities.totalLiabilities / balanceSheet.assets.totalAssets * 100 || 0).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Debt-to-Asset</p>
              <p className="text-xs text-gray-400">Total Liabilities / Total Assets</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(balanceSheet.equity.total / balanceSheet.assets.totalAssets * 100 || 0).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Equity Ratio</p>
              <p className="text-xs text-gray-400">Total Equity / Total Assets</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button onClick={() => handleExport('pdf')} className="flex items-center space-x-2">
              <span>📄</span>
              <span>Export PDF</span>
            </Button>
            <Button onClick={() => handleExport('excel')} variant="outline" className="flex items-center space-x-2">
              <span>📊</span>
              <span>Export Excel</span>
            </Button>
            <Button onClick={() => handleExport('csv')} variant="outline" className="flex items-center space-x-2">
              <span>📋</span>
              <span>Export CSV</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}