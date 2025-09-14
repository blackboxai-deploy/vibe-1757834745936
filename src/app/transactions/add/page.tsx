"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionForm } from "@/components/TransactionForm";
import { accountingStore } from "@/lib/accounting-store";
import { Account, Currency } from "@/lib/accounting-types";

export default function AddTransactionPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const accountsData = accountingStore.getAccounts();
        const currenciesData = accountingStore.getCurrencies();
        
        setAccounts(accountsData);
        setCurrencies(currenciesData);
      } catch (error) {
        console.error('Failed to load form data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSuccess = () => {
    // Redirect to transactions page after successful creation
    router.push('/transactions');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Add Transaction</h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
                  <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Transaction</h1>
          <p className="text-gray-500 mt-1">Create a new financial transaction</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>

      {/* Transaction Form */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm 
            accounts={accounts}
            currencies={currencies}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">💹</div>
                <div>
                  <h3 className="font-medium">Sales Transaction</h3>
                  <p className="text-sm text-gray-500">Record a sale or revenue</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🛒</div>
                <div>
                  <h3 className="font-medium">Purchase Transaction</h3>
                  <p className="text-sm text-gray-500">Record a purchase or expense</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">💼</div>
                <div>
                  <h3 className="font-medium">Salary Payment</h3>
                  <p className="text-sm text-gray-500">Record salary or wage payment</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🏢</div>
                <div>
                  <h3 className="font-medium">Rent Payment</h3>
                  <p className="text-sm text-gray-500">Record rent or lease payment</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <h3 className="font-medium">Utility Bill</h3>
                  <p className="text-sm text-gray-500">Record utility expenses</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📈</div>
                <div>
                  <h3 className="font-medium">Dividend Payment</h3>
                  <p className="text-sm text-gray-500">Record dividend distribution</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="text-xl">💡</div>
              <div>
                <h3 className="font-medium">Double-Entry Bookkeeping</h3>
                <p className="text-sm text-gray-500">
                  Each transaction requires both a debit and credit account. The system follows standard accounting principles.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-xl">🌍</div>
              <div>
                <h3 className="font-medium">Multi-Currency Support</h3>
                <p className="text-sm text-gray-500">
                  Transactions can be recorded in any supported currency. Exchange rates are applied automatically.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-xl">📊</div>
              <div>
                <h3 className="font-medium">Real-Time Updates</h3>
                <p className="text-sm text-gray-500">
                  Account balances and financial reports are updated automatically when transactions are added.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}