"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionTable } from "@/components/TransactionTable";
import { accountingStore } from "@/lib/accounting-store";
import { Transaction, TransactionCategory, TransactionFolder } from "@/lib/accounting-types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = () => {
      try {
        const allTransactions = accountingStore.getTransactions();
        setTransactions(allTransactions);
        setFilteredTransactions(allTransactions);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === categoryFilter);
    }

    // Folder filter
    if (folderFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.folder === folderFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, categoryFilter, folderFilter, statusFilter]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getTotalsByCategory = () => {
    const categories = ['sales', 'purchase', 'utility', 'rent', 'salary', 'dividend'];
    return categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.category === category);
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        category: category.charAt(0).toUpperCase() + category.slice(1),
        total,
        count: categoryTransactions.length
      };
    }).filter(item => item.count > 0);
  };

  const getTotalsByFolder = () => {
    const folders = ['bank', 'expenses', 'suspense'];
    return folders.map(folder => {
      const folderTransactions = transactions.filter(t => t.folder === folder);
      const total = folderTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        folder: folder.charAt(0).toUpperCase() + folder.slice(1),
        total,
        count: folderTransactions.length
      };
    }).filter(item => item.count > 0);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-gray-500 mt-1">Manage all your financial transactions</p>
        </div>
        <Link href="/transactions/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Combined value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => {
                const txnDate = new Date(t.date);
                const now = new Date();
                return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Current month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="dividend">Dividend</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Folder</label>
              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                  <SelectItem value="suspense">Suspense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="reconciled">Reconciled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category and Folder Breakdowns */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="folders">By Folder</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Transactions by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getTotalsByCategory().map((item) => (
                  <div key={item.category} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{item.category}</h3>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                ))}
                {getTotalsByCategory().length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No transactions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="folders">
          <Card>
            <CardHeader>
              <CardTitle>Transactions by Folder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {getTotalsByFolder().map((item) => (
                  <div key={item.folder} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{item.folder}</h3>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                ))}
                {getTotalsByFolder().length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No transactions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Transaction List</CardTitle>
                <Badge variant="outline">{filteredTransactions.length} transactions</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={filteredTransactions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}