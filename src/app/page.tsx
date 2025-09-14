"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardCards } from "@/components/DashboardCards";
import { FinancialChart } from "@/components/FinancialChart";
import { accountingStore } from "@/lib/accounting-store";
import { DashboardKPIs, Transaction, Invoice } from "@/lib/accounting-types";
import { seedSampleData } from "@/lib/sample-data";

export default function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        // Initialize sample data if needed
        seedSampleData();
        
        const dashboardKPIs = accountingStore.getDashboardKPIs();
        const transactions = accountingStore.getTransactions().slice(0, 5);
        const invoices = accountingStore.getInvoices().slice(0, 5);

        setKpis(dashboardKPIs);
        setRecentTransactions(transactions);
        setRecentInvoices(invoices);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'approved':
      case 'reconciled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500">Welcome to your worldwide accounting software</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500">Welcome to your worldwide accounting software</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {kpis?.period}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {kpis?.currency}
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && <DashboardCards kpis={kpis} />}

      {/* Financial Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <FinancialChart />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Recent Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Latest Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No transactions found</p>
                  <p className="text-sm text-gray-400">Start by adding your first transaction to see activity here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div className="space-y-1">
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{formatDate(transaction.date)}</span>
                          <span>•</span>
                          <span className="capitalize">{transaction.category}</span>
                          <span>•</span>
                          <span className="capitalize">{transaction.folder}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-medium">{formatCurrency(transaction.amount, transaction.currency)}</p>
                        <Badge 
                          className={`text-xs ${getStatusBadgeColor(transaction.status)}`}
                          variant="secondary"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Latest Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {recentInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No invoices found</p>
                  <p className="text-sm text-gray-400">Create your first invoice to see them here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div className="space-y-1">
                        <p className="font-medium">{invoice.number}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{invoice.customerName}</span>
                          <span>•</span>
                          <span>{formatDate(invoice.date)}</span>
                          <span>•</span>
                          <span>Due: {formatDate(invoice.dueDate)}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-medium">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                        <Badge 
                          className={`text-xs ${getStatusBadgeColor(invoice.status)}`}
                          variant="secondary"
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/transactions/add"
              className="flex flex-col items-center p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-600 text-sm font-semibold">+</span>
              </div>
              <span className="text-sm font-medium">Add Transaction</span>
            </a>
            
            <a
              href="/invoices/create"
              className="flex flex-col items-center p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-600 text-sm font-semibold">📄</span>
              </div>
              <span className="text-sm font-medium">Create Invoice</span>
            </a>

            <a
              href="/reports/balance-sheet"
              className="flex flex-col items-center p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-purple-600 text-sm font-semibold">📊</span>
              </div>
              <span className="text-sm font-medium">View Reports</span>
            </a>

            <a
              href="/settings"
              className="flex flex-col items-center p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-600 text-sm font-semibold">⚙️</span>
              </div>
              <span className="text-sm font-medium">Settings</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}