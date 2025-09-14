"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { accountingStore } from "@/lib/accounting-store";
import { Invoice, InvoiceFilters } from "@/lib/accounting-types";
import Link from "next/link";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, filters, searchQuery]);

  const loadInvoices = () => {
    try {
      const allInvoices = accountingStore.getInvoices();
      setInvoices(allInvoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(invoice =>
        invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(i => i.status === filters.status);
    }
    if (filters.currency) {
      filtered = filtered.filter(i => i.currency === filters.currency);
    }
    if (filters.customerId) {
      filtered = filtered.filter(i => i.customerId === filters.customerId);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(i => new Date(i.date) >= new Date(filters.dateFrom!));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(i => new Date(i.date) <= new Date(filters.dateTo!));
    }
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(i => i.totalAmount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(i => i.totalAmount <= filters.maxAmount!);
    }

    setFilteredInvoices(filtered);
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      accountingStore.deleteInvoice(invoiceId);
      loadInvoices();
    }
  };

  const calculateInvoiceStats = () => {
    const stats = {
      total: invoices.length,
      totalValue: invoices.reduce((sum, i) => sum + i.totalAmount, 0),
      draft: invoices.filter(i => i.status === 'draft').length,
      sent: invoices.filter(i => i.status === 'sent').length,
      paid: invoices.filter(i => i.status === 'paid').length,
      overdue: invoices.filter(i => i.status === 'overdue').length,
      outstanding: invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.totalAmount, 0),
    };
    return stats;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Invoices</h1>
        </div>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateInvoiceStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-500 mt-1">Manage your invoices and billing</p>
        </div>
        <Link href="/invoices/create">
          <Button>Create Invoice</Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.outstanding)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Select value={filters.status || ""} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, status: value as any || undefined }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.currency || ""} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, currency: value || undefined }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Currencies</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Min Amount"
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                minAmount: e.target.value ? parseFloat(e.target.value) : undefined 
              }))}
            />

            <Input
              type="date"
              placeholder="From Date"
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateFrom: e.target.value ? new Date(e.target.value) : undefined 
              }))}
            />

            <Input
              type="date"
              placeholder="To Date"
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateTo: e.target.value ? new Date(e.target.value) : undefined 
              }))}
            />
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setFilters({});
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
            <span className="text-sm text-gray-500">
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-500 mb-4">
                {invoices.length === 0 
                  ? "Get started by creating your first invoice"
                  : "Try adjusting your filters or search criteria"
                }
              </p>
              <Link href="/invoices/create">
                <Button>Create First Invoice</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-medium text-gray-500">Invoice #</th>
                    <th className="pb-3 font-medium text-gray-500">Customer</th>
                    <th className="pb-3 font-medium text-gray-500">Date</th>
                    <th className="pb-3 font-medium text-gray-500">Due Date</th>
                    <th className="pb-3 font-medium text-gray-500">Amount</th>
                    <th className="pb-3 font-medium text-gray-500">Status</th>
                    <th className="pb-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4">
                        <div className="font-medium">{invoice.number}</div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{invoice.customerName}</p>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="py-4">
                        <div className={`text-sm ${
                          new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-600'
                        }`}>
                          {formatDate(invoice.dueDate)}
                        </div>
                      </td>
                      <td className="py-4 font-medium">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                        <div className="text-xs text-gray-500">
                          VAT: {formatCurrency(invoice.vatAmount, invoice.currency)}
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge 
                          className={`text-xs ${getStatusBadgeColor(invoice.status)}`}
                          variant="secondary"
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-4 space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Invoice {selectedInvoice.number}</h2>
                  <p className="text-gray-500">Date: {formatDate(selectedInvoice.date)}</p>
                  <p className="text-gray-500">Due Date: {formatDate(selectedInvoice.dueDate)}</p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusBadgeColor(selectedInvoice.status)}>
                    {selectedInvoice.status}
                  </Badge>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}
                  </p>
                </div>
              </div>

              {/* Customer Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <p className="font-medium">{selectedInvoice.customerName}</p>
                <p className="text-gray-600">{selectedInvoice.customerAddress}</p>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="font-semibold mb-4">Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-right p-3 font-medium">Qty</th>
                        <th className="text-right p-3 font-medium">Unit Price</th>
                        <th className="text-right p-3 font-medium">VAT Rate</th>
                        <th className="text-right p-3 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right">
                            {formatCurrency(item.unitPrice, selectedInvoice.currency)}
                          </td>
                          <td className="p-3 text-right">{item.vatRate}%</td>
                          <td className="p-3 text-right font-medium">
                            {formatCurrency(item.amount, selectedInvoice.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="flex justify-end">
                <div className="w-80">
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT ({selectedInvoice.vatRate}%):</span>
                      <span className="font-medium">
                        {formatCurrency(selectedInvoice.vatAmount, selectedInvoice.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>
                        {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-gray-600">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}