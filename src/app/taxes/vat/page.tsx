"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateVAT, calculateVATFromGross, getTaxRates, getSupportedCountries } from "@/lib/tax-calculations";
import { formatCurrency } from "@/lib/currency-utils";

export default function VATPage() {
  const [countries] = useState(getSupportedCountries());
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [netAmount, setNetAmount] = useState<number>(0);
  const [grossAmount, setGrossAmount] = useState<number>(0);
  const [vatType, setVatType] = useState<'standard' | 'reduced' | 'zero'>('standard');
  const [vatCalculation, setVatCalculation] = useState<any>(null);
  const [reverseVatCalculation, setReverseVatCalculation] = useState<any>(null);
  const [taxRates, setTaxRates] = useState<any>(null);

  useEffect(() => {
    const rates = getTaxRates(selectedCountry);
    setTaxRates(rates);
  }, [selectedCountry]);

  const handleNetAmountCalculation = () => {
    if (netAmount > 0) {
      try {
        const result = calculateVAT(netAmount, selectedCountry, vatType);
        setVatCalculation(result);
      } catch (error) {
        console.error('VAT calculation failed:', error);
        setVatCalculation(null);
      }
    } else {
      setVatCalculation(null);
    }
  };

  const handleGrossAmountCalculation = () => {
    if (grossAmount > 0) {
      try {
        const result = calculateVATFromGross(grossAmount, selectedCountry, vatType);
        setReverseVatCalculation(result);
      } catch (error) {
        console.error('Reverse VAT calculation failed:', error);
        setReverseVatCalculation(null);
      }
    } else {
      setReverseVatCalculation(null);
    }
  };

  useEffect(() => {
    handleNetAmountCalculation();
  }, [netAmount, selectedCountry, vatType]);

  useEffect(() => {
    handleGrossAmountCalculation();
  }, [grossAmount, selectedCountry, vatType]);

  const getVATRate = () => {
    if (!taxRates) return 0;
    switch (vatType) {
      case 'standard': return taxRates.vatStandard;
      case 'reduced': return taxRates.vatReduced;
      case 'zero': return taxRates.vatZero;
      default: return taxRates.vatStandard;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">VAT Management</h1>
          <p className="text-gray-500">Calculate and manage VAT for worldwide operations</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          🧾 VAT Calculator
        </Badge>
      </div>

      {/* Country and Rate Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🌍</span>
            <span>Country & VAT Rate Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>VAT Type</Label>
            <Select value={vatType} onValueChange={(value: 'standard' | 'reduced' | 'zero') => setVatType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Rate</SelectItem>
                <SelectItem value="reduced">Reduced Rate</SelectItem>
                <SelectItem value="zero">Zero Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Current VAT Rate</Label>
            <div className="flex items-center h-10 px-3 border border-gray-200 rounded-md bg-gray-50">
              <span className="font-semibold text-lg">{getVATRate()}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VAT Rates Overview */}
      {taxRates && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📊</span>
              <span>VAT Rates for {taxRates.country}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{taxRates.vatStandard}%</div>
                <div className="text-sm text-blue-800">Standard Rate</div>
                <div className="text-xs text-blue-600">Most goods & services</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{taxRates.vatReduced}%</div>
                <div className="text-sm text-green-800">Reduced Rate</div>
                <div className="text-xs text-green-600">Essential goods</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{taxRates.vatZero}%</div>
                <div className="text-sm text-gray-800">Zero Rate</div>
                <div className="text-xs text-gray-600">Exempt items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VAT Calculations */}
      <Tabs defaultValue="net-to-gross" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="net-to-gross">Net Amount → Gross Amount</TabsTrigger>
          <TabsTrigger value="gross-to-net">Gross Amount → Net Amount</TabsTrigger>
        </TabsList>

        <TabsContent value="net-to-gross">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>💰</span>
                  <span>Calculate VAT on Net Amount</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="netAmount">Net Amount (excluding VAT)</Label>
                  <Input
                    id="netAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={netAmount || ''}
                    onChange={(e) => setNetAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter net amount"
                  />
                </div>
                <Button onClick={handleNetAmountCalculation} className="w-full">
                  Calculate VAT
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>VAT Calculation Result</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vatCalculation ? (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Net Amount:</span>
                        <span className="font-semibold">
                          {formatCurrency(vatCalculation.netAmount, taxRates?.currency || 'USD')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">VAT ({vatCalculation.vatRate}%):</span>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(vatCalculation.vatAmount, taxRates?.currency || 'USD')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
                        <span className="font-medium text-green-800">Gross Amount:</span>
                        <span className="font-bold text-xl text-green-600">
                          {formatCurrency(vatCalculation.grossAmount, taxRates?.currency || 'USD')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Calculation Breakdown:</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div>Country: {vatCalculation.country}</div>
                        <div>VAT Type: {vatCalculation.vatType}</div>
                        <div>Rate Applied: {vatCalculation.vatRate}%</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Enter a net amount to calculate VAT</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gross-to-net">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>💰</span>
                  <span>Extract VAT from Gross Amount</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grossAmount">Gross Amount (including VAT)</Label>
                  <Input
                    id="grossAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={grossAmount || ''}
                    onChange={(e) => setGrossAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter gross amount"
                  />
                </div>
                <Button onClick={handleGrossAmountCalculation} className="w-full">
                  Extract VAT
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>VAT Extraction Result</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reverseVatCalculation ? (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex justify-between items-center py-2 bg-blue-50 px-3 rounded-lg">
                        <span className="font-medium text-blue-800">Gross Amount:</span>
                        <span className="font-bold text-xl text-blue-600">
                          {formatCurrency(reverseVatCalculation.grossAmount, taxRates?.currency || 'USD')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">VAT ({reverseVatCalculation.vatRate}%):</span>
                        <span className="font-semibold text-red-600">
                          - {formatCurrency(reverseVatCalculation.vatAmount, taxRates?.currency || 'USD')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
                        <span className="font-medium text-green-800">Net Amount:</span>
                        <span className="font-bold text-xl text-green-600">
                          {formatCurrency(reverseVatCalculation.netAmount, taxRates?.currency || 'USD')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Extraction Breakdown:</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div>Country: {reverseVatCalculation.country}</div>
                        <div>VAT Type: {reverseVatCalculation.vatType}</div>
                        <div>Rate Applied: {reverseVatCalculation.vatRate}%</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Enter a gross amount to extract VAT</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* VAT Compliance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💡</span>
            <span>VAT Compliance Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">✅ Best Practices</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Keep detailed records of all VAT transactions</li>
                <li>• Submit VAT returns on time to avoid penalties</li>
                <li>• Use correct VAT rates for different goods/services</li>
                <li>• Maintain valid VAT receipts and invoices</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-red-700">⚠️ Common Mistakes</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Mixing up VAT-inclusive and VAT-exclusive prices</li>
                <li>• Using wrong VAT rates for cross-border transactions</li>
                <li>• Late submission of VAT returns</li>
                <li>• Incorrect VAT registration details</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}