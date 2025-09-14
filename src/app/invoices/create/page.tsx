"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { accountingStore } from "@/lib/accounting-store";
import { CreateInvoiceData, Customer, InvoiceItem } from "@/lib/accounting-types";
import { useRouter } from 'next/navigation';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    { description: '', quantity: 1, unitPrice: 0, amount: 0, vatRate: 20 }
  ]);
  
  const [formData, setFormData] = useState<CreateInvoiceData>({
    customerId: '',
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    currency: 'USD',
    items: [],
    vatRate: 20,
    notes: '',
  });

  useEffect(() => {
    // Load customers (mock data for now)
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        phone: '+1-555-0123',
        address: '123 Business St, New York, NY 10001, USA',
        country: 'USA',
        taxId: '12-3456789',
        currency: 'USD',
        creditLimit: 50000,
        balance: 5000,
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Global Tech Solutions',
        email: 'accounts@globaltech.com',
        phone: '+44-20-7946-0958',
        address: '456 Tech Avenue, London, EC1A 1BB, UK',
        country: 'UK',
        taxId: 'GB-987654321',
        currency: 'GBP',
        creditLimit: 75000,
        balance: 12500,
        createdAt: new Date(),
      },
      {
        id: '3',
        name: 'European Enterprises',
        email: 'finance@euroenterprises.eu',
        phone: '+49-30-12345678',
        address: '789 Corporate Plaza, Berlin, 10115, Germany',
        country: 'Germany',
        taxId: 'DE-123456789',
        currency: 'EUR',
        creditLimit: 100000,
        balance: 8750,
        createdAt: new Date(),
      }
    ];
    setCustomers(mockCustomers);
  }, []);

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
    setFormData(prev => ({
      ...prev,
      customerId,
      currency: customer?.currency || 'USD'
    }));
  };

  const handleItemChange = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amount for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, amount: 0, vatRate: formData.vatRate }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = items.reduce((sum, item) => sum + (item.amount * item.vatRate / 100), 0);
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!selectedCustomer) {
        console.error('Please select a customer');
        return;
      }
      
      if (items.length === 0 || items.every(item => !item.description.trim())) {
        console.error('Please add at least one item');
        return;
      }

      // Prepare invoice data
      const invoiceData: CreateInvoiceData = {
        ...formData,
        items: items.filter(item => item.description.trim()),
      };

      // Create invoice
      const invoice = accountingStore.addInvoice(invoiceData);
      
      if (invoice) {
        console.log('Invoice created successfully');
        router.push('/invoices');
      } else {
        console.error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-gray-500 mt-1">Create a new invoice for your customer</p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCustomer && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Bill To:</h4>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                    {selectedCustomer.taxId && (
                      <p className="text-sm text-gray-600">Tax ID: {selectedCustomer.taxId}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoice Items</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                      <div className="col-span-4">
                        <Label>Description *</Label>
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice || ''}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>VAT Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={item.vatRate}
                          onChange={(e) => handleItemChange(index, 'vatRate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Label>Amount</Label>
                        <div className="text-sm font-medium py-2">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: formData.currency,
                          }).format(item.amount)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or payment instructions"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Invoice Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Invoice Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date instanceof Date 
                      ? formData.date.toISOString().split('T')[0] 
                      : new Date().toISOString().split('T')[0]
                    }
                    onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate instanceof Date 
                      ? formData.dueDate.toISOString().split('T')[0] 
                      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    }
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: new Date(e.target.value) }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, currency: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: formData.currency,
                      }).format(subtotal)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>VAT:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: formData.currency,
                      }).format(vatAmount)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: formData.currency,
                        }).format(total)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-4">
                    <p>Items: {items.filter(i => i.description.trim()).length}</p>
                    <p>Currency: {formData.currency}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Invoice...' : 'Create Invoice'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}