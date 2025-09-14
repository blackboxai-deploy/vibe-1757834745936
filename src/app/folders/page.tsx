"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { accountingStore } from "@/lib/accounting-store";
import { Transaction } from "@/lib/accounting-types";
import Link from "next/link";

export default function FoldersPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      try {
        const allTransactions = accountingStore.getTransactions();
        setTransactions(allTransactions);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
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

  const calculateFolderStats = (folderType: 'bank' | 'expenses' | 'suspense') => {
    const folderTransactions = transactions.filter(t => t.folder === folderType);
    return {
      total: folderTransactions.length,
      totalAmount: folderTransactions.reduce((sum, t) => sum + t.amount, 0),
      pending: folderTransactions.filter(t => t.status === 'pending').length,
      approved: folderTransactions.filter(t => t.status === 'approved').length,
      reconciled: folderTransactions.filter(t => t.status === 'reconciled').length,
    };
  };

  const bankStats = calculateFolderStats('bank');
  const expensesStats = calculateFolderStats('expenses');
  const suspenseStats = calculateFolderStats('suspense');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Folder Management</h1>
        </div>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">Folder Management</h1>
          <p className="text-gray-500 mt-1">Organize your transactions by folders</p>
        </div>
        <Link href="/transactions/add">
          <Button>Add Transaction</Button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {transactions.filter(t => t.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Reconciled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {transactions.filter(t => t.status === 'reconciled').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Folder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bank Folder */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <CardHeader className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🏦</span>
                </div>
                <div>
                  <CardTitle>Bank Folder</CardTitle>
                  <p className="text-sm text-gray-500">Banking transactions and reconciliation</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{bankStats.total}</div>
                <div className="text-sm text-gray-500">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(bankStats.totalAmount)}</div>
                <div className="text-sm text-gray-500">Total Value</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pending</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {bankStats.pending}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Approved</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {bankStats.approved}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Reconciled</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {bankStats.reconciled}
                </Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Link href="/folders/bank" className="block">
                <Button className="w-full" variant="outline">
                  Manage Bank Transactions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Folder */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-600"></div>
          <CardHeader className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">💳</span>
                </div>
                <div>
                  <CardTitle>Expenses Folder</CardTitle>
                  <p className="text-sm text-gray-500">Business expenses and costs</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{expensesStats.total}</div>
                <div className="text-sm text-gray-500">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(expensesStats.totalAmount)}</div>
                <div className="text-sm text-gray-500">Total Value</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pending</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {expensesStats.pending}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Approved</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {expensesStats.approved}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Reconciled</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {expensesStats.reconciled}
                </Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Link href="/folders/expenses" className="block">
                <Button className="w-full" variant="outline">
                  Manage Expenses
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Suspense Folder */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
          <CardHeader className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">⏳</span>
                </div>
                <div>
                  <CardTitle>Suspense Folder</CardTitle>
                  <p className="text-sm text-gray-500">Unreconciled and temporary entries</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{suspenseStats.total}</div>
                <div className="text-sm text-gray-500">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(suspenseStats.totalAmount)}</div>
                <div className="text-sm text-gray-500">Total Value</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pending</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {suspenseStats.pending}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Approved</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {suspenseStats.approved}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Reconciled</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {suspenseStats.reconciled}
                </Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Link href="/folders/suspense" className="block">
                <Button className="w-full" variant="outline">
                  Manage Suspense Items
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity by Folder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bank Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="text-blue-600 mr-2">🏦</span>
              Recent Bank Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.filter(t => t.folder === 'bank').slice(0, 3).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No bank transactions yet</p>
                <Link href="/transactions/add">
                  <Button size="sm" className="mt-2">Add Bank Transaction</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.filter(t => t.folder === 'bank').slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(transaction.amount, transaction.currency)}</p>
                      <Badge className="text-xs" variant="secondary">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link href="/folders/bank" className="block">
                  <Button size="sm" variant="outline" className="w-full">View All</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expense Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="text-red-600 mr-2">💳</span>
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.filter(t => t.folder === 'expenses').slice(0, 3).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No expense transactions yet</p>
                <Link href="/transactions/add">
                  <Button size="sm" className="mt-2">Add Expense</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.filter(t => t.folder === 'expenses').slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(transaction.amount, transaction.currency)}</p>
                      <Badge className="text-xs" variant="secondary">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link href="/folders/expenses" className="block">
                  <Button size="sm" variant="outline" className="w-full">View All</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Suspense Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="text-yellow-600 mr-2">⏳</span>
              Recent Suspense Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.filter(t => t.folder === 'suspense').slice(0, 3).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No suspense transactions yet</p>
                <Link href="/transactions/add">
                  <Button size="sm" className="mt-2">Add Suspense Item</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.filter(t => t.folder === 'suspense').slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(transaction.amount, transaction.currency)}</p>
                      <Badge className="text-xs" variant="secondary">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link href="/folders/suspense" className="block">
                  <Button size="sm" variant="outline" className="w-full">View All</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}