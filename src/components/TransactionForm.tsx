"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { accountingStore } from "@/lib/accounting-store";
import { Account, Currency, TransactionCategory, TransactionFolder } from "@/lib/accounting-types";

interface TransactionFormProps {
  accounts: Account[];
  currencies: Currency[];
  onSuccess: () => void;
}

export function TransactionForm({ accounts, currencies, onSuccess }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'USD',
    category: '' as TransactionCategory | '',
    folder: '' as TransactionFolder | '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    debitAccount: '',
    creditAccount: '',
    vatRate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.folder) {
      newErrors.folder = 'Folder is required';
    }

    if (!formData.debitAccount) {
      newErrors.debitAccount = 'Debit account is required';
    }

    if (!formData.creditAccount) {
      newErrors.creditAccount = 'Credit account is required';
    }

    if (formData.debitAccount === formData.creditAccount) {
      newErrors.creditAccount = 'Credit account must be different from debit account';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const transaction = await accountingStore.addTransaction({
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        category: formData.category as TransactionCategory,
        folder: formData.folder as TransactionFolder,
        date: new Date(formData.date),
        reference: formData.reference || `TXN-${Date.now()}`,
        debitAccount: formData.debitAccount,
        creditAccount: formData.creditAccount,
        vatRate: formData.vatRate ? parseFloat(formData.vatRate) : undefined,
        attachments: [],
        status: 'pending'
      });

      console.log('Transaction created:', transaction);
      onSuccess();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      setErrors({ submit: 'Failed to create transaction. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter transaction description"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleInputChange('currency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
        </div>

        {/* Classification */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">💹 Sales</SelectItem>
                <SelectItem value="purchase">🛒 Purchase</SelectItem>
                <SelectItem value="utility">⚡ Utility</SelectItem>
                <SelectItem value="rent">🏢 Rent</SelectItem>
                <SelectItem value="salary">💼 Salary</SelectItem>
                <SelectItem value="dividend">📈 Dividend</SelectItem>
                <SelectItem value="other">💰 Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <Label htmlFor="folder">Folder *</Label>
            <Select
              value={formData.folder}
              onValueChange={(value) => handleInputChange('folder', value)}
            >
              <SelectTrigger className={errors.folder ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">🏦 Bank Folder</SelectItem>
                <SelectItem value="expenses">💸 Expenses Folder</SelectItem>
                <SelectItem value="suspense">❓ Suspense Folder</SelectItem>
              </SelectContent>
            </Select>
            {errors.folder && (
              <p className="text-red-500 text-sm mt-1">{errors.folder}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reference">Reference</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              placeholder="Optional reference number"
            />
          </div>

          <div>
            <Label htmlFor="vatRate">VAT Rate (%)</Label>
            <Input
              id="vatRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.vatRate}
              onChange={(e) => handleInputChange('vatRate', e.target.value)}
              placeholder="0.0"
            />
          </div>
        </div>
      </div>

      {/* Account Selection */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="debitAccount">Debit Account *</Label>
          <Select
            value={formData.debitAccount}
            onValueChange={(value) => handleInputChange('debitAccount', value)}
          >
            <SelectTrigger className={errors.debitAccount ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select debit account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.debitAccount && (
            <p className="text-red-500 text-sm mt-1">{errors.debitAccount}</p>
          )}
        </div>

        <div>
          <Label htmlFor="creditAccount">Credit Account *</Label>
          <Select
            value={formData.creditAccount}
            onValueChange={(value) => handleInputChange('creditAccount', value)}
          >
            <SelectTrigger className={errors.creditAccount ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select credit account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.creditAccount && (
            <p className="text-red-500 text-sm mt-1">{errors.creditAccount}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Creating...' : 'Create Transaction'}
        </Button>
      </div>
    </form>
  );
}