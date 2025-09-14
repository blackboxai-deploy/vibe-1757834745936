"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transaction } from "@/lib/accounting-types";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
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
      case 'approved':
      case 'reconciled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales': return '💹';
      case 'purchase': return '🛒';
      case 'utility': return '⚡';
      case 'rent': return '🏢';
      case 'salary': return '💼';
      case 'dividend': return '📈';
      default: return '💰';
    }
  };

  const getFolderIcon = (folder: string) => {
    switch (folder) {
      case 'bank': return '🏦';
      case 'expenses': return '💸';
      case 'suspense': return '❓';
      default: return '📁';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
        <p className="text-gray-500">Start by adding your first transaction to see them here.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Folder</TableHead>
            <TableHead className="font-semibold text-right">Amount</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                {formatDate(transaction.date)}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{transaction.description}</p>
                  {transaction.reference && (
                    <p className="text-sm text-gray-500">Ref: {transaction.reference}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(transaction.category)}</span>
                  <span className="capitalize">{transaction.category}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getFolderIcon(transaction.folder)}</span>
                  <span className="capitalize">{transaction.folder}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                <div className="space-y-1">
                  <p className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                  </p>
                  {transaction.vatRate && transaction.vatRate > 0 && (
                    <p className="text-xs text-gray-500">
                      VAT: {transaction.vatRate}%
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge 
                  className={`text-xs ${getStatusBadgeColor(transaction.status)} border`}
                  variant="secondary"
                >
                  {transaction.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}