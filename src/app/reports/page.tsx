"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { accountingStore } from "@/lib/accounting-store";
import { BalanceSheetData, ProfitLossData } from "@/lib/accounting-types";
import Link from "next/link";

export default function ReportsPage() {
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);
  const [profitLoss, setProfitLoss] = useState<ProfitLossData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = () => {
    try {
      // Calculate period dates based on selection
      const periodDates = calculatePeriodDates(selectedPeriod);
      
      const balanceSheetData = accountingStore.getBalanceSheet();
      const profitLossData = accountingStore.getProfitLoss();
      
      setBalanceSheet(balanceSheetData);
      setProfitLoss(profitLossData);
    } catch (error) {
      console.error('Failed to load reports:', error);
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
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
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
      case 'last-year':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
    }

    return { start, end };
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getPeriodName = (period: string) => {
    switch (period) {
      case 'current-month':
        return 'Current Month';
      case 'last-month':
        return 'Last Month';
      case 'current-quarter':
        return 'Current Quarter';
      case 'current-year':
        return 'Current Year';
      case 'last-year':
        return 'Last Year';
      default:
        return 'Current Period';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Financial Reports</h1>
        </div>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-gray-500 mt-1">Comprehensive financial analysis and reporting</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Period Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{getPeriodName(selectedPeriod)} Report</h2>
              <p className="text-sm text-gray-500">
                As of {formatDate(new Date())}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {profitLoss?.currency || 'USD'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {profitLoss ? formatCurrency(profitLoss.revenue.total, profitLoss.currency) : formatCurrency(0)}
            </div>
            {profitLoss && (
              <p className="text-sm text-gray-500 mt-1">
                Sales: {formatCurrency(profitLoss.revenue.sales, profitLoss.currency)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {profitLoss ? formatCurrency(profitLoss.expenses.total, profitLoss.currency) : formatCurrency(0)}
            </div>
            {profitLoss && (
              <p className="text-sm text-gray-500 mt-1">
                Operating: {formatCurrency(profitLoss.expenses.other, profitLoss.currency)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitLoss && profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitLoss ? formatCurrency(profitLoss.netProfit, profitLoss.currency) : formatCurrency(0)}
            </div>
            {profitLoss && (
              <p className="text-sm text-gray-500 mt-1">
                Margin: {formatPercentage((profitLoss.netProfit / profitLoss.revenue.total) * 100 || 0)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {balanceSheet ? formatCurrency(balanceSheet.assets.totalAssets, balanceSheet.currency) : formatCurrency(0)}
            </div>
            {balanceSheet && (
              <p className="text-sm text-gray-500 mt-1">
                Current: {formatCurrency(balanceSheet.assets.currentAssets.total, balanceSheet.currency)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Sheet Card */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <CardHeader className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-2xl">📊</span>
              </div>
              <div>
                <CardTitle>Balance Sheet</CardTitle>
                <p className="text-sm text-gray-500">Assets, liabilities, and equity</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {balanceSheet && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Assets:</span>
                  <span className="font-medium">
                    {formatCurrency(balanceSheet.assets.totalAssets, balanceSheet.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Liabilities:</span>
                  <span className="font-medium">
                    {formatCurrency(balanceSheet.liabilities.totalLiabilities, balanceSheet.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Equity:</span>
                  <span className="font-medium">
                    {formatCurrency(balanceSheet.equity.total, balanceSheet.currency)}
                  </span>
                </div>
              </div>
            )}
            <Link href="/reports/balance-sheet" className="block">
              <Button className="w-full">View Full Balance Sheet</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Profit & Loss Card */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
          <CardHeader className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-2xl">📈</span>
              </div>
              <div>
                <CardTitle>Profit & Loss</CardTitle>
                <p className="text-sm text-gray-500">Revenue, expenses, and profitability</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {profitLoss && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Revenue:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(profitLoss.revenue.total, profitLoss.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expenses:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(profitLoss.expenses.total, profitLoss.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Net Profit:</span>
                  <span className={`font-medium ${profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(profitLoss.netProfit, profitLoss.currency)}
                  </span>
                </div>
              </div>
            )}
            <Link href="/reports/profit-loss" className="block">
              <Button className="w-full">View Full P&L Statement</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Cash Flow Card */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
          <CardHeader className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-2xl">💰</span>
              </div>
              <div>
                <CardTitle>Cash Flow</CardTitle>
                <p className="text-sm text-gray-500">Cash inflows and outflows</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {balanceSheet && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cash & Equivalents:</span>
                  <span className="font-medium">
                    {formatCurrency(balanceSheet.assets.currentAssets.cash, balanceSheet.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Working Capital:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      balanceSheet.assets.currentAssets.total - balanceSheet.liabilities.currentLiabilities.total,
                      balanceSheet.currency
                    )}
                  </span>
                </div>
              </div>
            )}
            <Button className="w-full" variant="outline" disabled>
              Cash Flow Report (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <p className="text-sm text-gray-500">Download reports in various formats</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <span>📄</span>
              <span>Export PDF</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>📊</span>
              <span>Export Excel</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>📋</span>
              <span>Export CSV</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>📧</span>
              <span>Email Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Indicators */}
      {balanceSheet && profitLoss && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Health Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {((balanceSheet.assets.currentAssets.total / balanceSheet.liabilities.currentLiabilities.total) || 0).toFixed(2)}
                </div>
                <p className="text-sm text-gray-500">Current Ratio</p>
                <p className="text-xs text-gray-400">Current Assets / Current Liabilities</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage((profitLoss.netProfit / profitLoss.revenue.total) * 100 || 0)}
                </div>
                <p className="text-sm text-gray-500">Net Profit Margin</p>
                <p className="text-xs text-gray-400">Net Profit / Revenue</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatPercentage((balanceSheet.liabilities.totalLiabilities / balanceSheet.assets.totalAssets) * 100 || 0)}
                </div>
                <p className="text-sm text-gray-500">Debt-to-Asset Ratio</p>
                <p className="text-xs text-gray-400">Total Liabilities / Total Assets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}