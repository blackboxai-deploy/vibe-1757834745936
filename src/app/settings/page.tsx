"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { accountingStore } from "@/lib/accounting-store";
import { CompanySettings, Currency } from "@/lib/accounting-types";
import { getSupportedCurrencies, formatCurrency } from "@/lib/currency-utils";
import { getSupportedCountries } from "@/lib/tax-calculations";

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [countries, setCountries] = useState<Array<{ code: string; name: string; currency: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const companySettings = accountingStore.getCompanySettings();
        const supportedCurrencies = getSupportedCurrencies();
        const supportedCountries = getSupportedCountries();
        
        setSettings(companySettings);
        setCurrencies(supportedCurrencies);
        setCountries(supportedCountries);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleInputChange = (field: keyof CompanySettings, value: any) => {
    if (settings) {
      setSettings(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    setMessage(null);

    try {
      accountingStore.updateCompanySettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default settings?')) {
      const defaultSettings: CompanySettings = {
        name: 'Your Company Name',
        address: '123 Business Street, City, Country',
        country: 'United States',
        currency: 'USD',
        taxId: 'TAX123456789',
        financialYearStart: '01-01',
        defaultVatRate: 20,
        defaultCorporateTaxRate: 25
      };
      setSettings(defaultSettings);
      setMessage({ type: 'success', text: 'Settings reset to defaults' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-500">Configure your accounting system</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🏢</span>
              <span>Company Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your Company Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Company Address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={settings.country}
                onValueChange={(value) => handleInputChange('country', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name} ({country.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / Registration Number</Label>
              <Input
                id="taxId"
                value={settings.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="TAX123456789"
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>💰</span>
              <span>Financial Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Base Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="financialYearStart">Financial Year Start (MM-DD)</Label>
              <Input
                id="financialYearStart"
                value={settings.financialYearStart}
                onChange={(e) => handleInputChange('financialYearStart', e.target.value)}
                placeholder="01-01"
                pattern="[0-1][0-9]-[0-3][0-9]"
              />
              <p className="text-sm text-gray-500">Format: MM-DD (e.g., 01-01 for January 1st)</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="defaultVatRate">Default VAT Rate (%)</Label>
              <Input
                id="defaultVatRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.defaultVatRate}
                onChange={(e) => handleInputChange('defaultVatRate', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultCorporateTaxRate">Default Corporate Tax Rate (%)</Label>
              <Input
                id="defaultCorporateTaxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.defaultCorporateTaxRate}
                onChange={(e) => handleInputChange('defaultCorporateTaxRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>ℹ️</span>
              <span>System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {currencies.length}
                </div>
                <div className="text-sm text-gray-600">Supported Currencies</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {countries.length}
                </div>
                <div className="text-sm text-gray-600">Supported Countries</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {accountingStore.getAllAccounts().length}
                </div>
                <div className="text-sm text-gray-600">Chart of Accounts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Exchange Rates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>💱</span>
              <span>Currency Exchange Rates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
              {currencies.slice(0, 12).map((currency) => (
                <div key={currency.code} className="text-center p-3 border rounded-lg">
                  <div className="font-semibold text-lg">{currency.symbol}</div>
                  <div className="text-sm text-gray-600">{currency.code}</div>
                  <div className="text-xs text-gray-500">
                    Rate: {currency.rate.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Exchange rates are relative to USD. In production, these would be fetched from a live currency API.
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🚀</span>
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                <span className="text-2xl mb-2">📊</span>
                <span>Export Data</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                <span className="text-2xl mb-2">📥</span>
                <span>Import Data</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                <span className="text-2xl mb-2">🔄</span>
                <span>Backup System</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                <span className="text-2xl mb-2">⚙️</span>
                <span>Advanced Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
            <span>🌍 Worldwide Accounting Software</span>
            <span>•</span>
            <span>Version 1.0.0</span>
            <span>•</span>
            <span>Built with Next.js & TypeScript</span>
            <span>•</span>
            <Badge variant="outline" className="text-xs">
              Real-time calculations enabled
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}