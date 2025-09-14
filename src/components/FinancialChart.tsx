"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { accountingStore } from "@/lib/accounting-store";
import { formatCurrency } from "@/lib/currency-utils";

interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export function FinancialChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChartData = () => {
      try {
        // Get recent transactions for trend analysis
        const transactions = accountingStore.getTransactions();
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          return date;
        });

        // Generate monthly data
        const monthlyData = last6Months.map(month => {
          const monthTransactions = transactions.filter(t => {
            const transactionMonth = new Date(t.date);
            return transactionMonth.getMonth() === month.getMonth() &&
                   transactionMonth.getFullYear() === month.getFullYear();
          });

          const revenue = monthTransactions
            .filter(t => t.category === 'sales')
            .reduce((sum, t) => sum + t.amount, 0);
          
          const expenses = monthTransactions
            .filter(t => ['purchase', 'utility', 'rent', 'salary'].includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);

          return {
            month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            revenue,
            expenses,
            profit: revenue - expenses
          };
        });

        // Category Distribution Data
        const categoryTotals = transactions.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

        const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];
        
        const categoryChartData = Object.entries(categoryTotals).map(([category, amount], index) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          amount,
          percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
          color: colors[index % colors.length]
        })).sort((a, b) => b.amount - a.amount);

        setChartData(monthlyData);
        setCategoryData(categoryChartData);
      } catch (error) {
        console.error('Failed to load chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate max value for chart scaling
  const maxValue = Math.max(...chartData.flatMap(d => [d.revenue, d.expenses]));

  return (
    <div className="h-96">
      <Tabs defaultValue="trend" className="h-full">
        <TabsList className="mb-4">
          <TabsTrigger value="trend">Revenue Trend</TabsTrigger>
          <TabsTrigger value="comparison">Monthly Comparison</TabsTrigger>
          <TabsTrigger value="distribution">Category Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trend" className="h-80">
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Expenses</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Net Profit</span>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64 flex items-end justify-between bg-gray-50 rounded-lg p-4">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                  <div className="relative h-48 w-full max-w-16 flex flex-col justify-end">
                    {/* Revenue Bar */}
                    <div 
                      className="w-1/3 bg-green-500 rounded-t mr-1"
                      style={{ 
                        height: maxValue > 0 ? `${(data.revenue / maxValue) * 180}px` : '2px',
                        minHeight: '2px'
                      }}
                      title={`Revenue: ${formatCurrency(data.revenue, 'USD')}`}
                    ></div>
                    {/* Expenses Bar */}
                    <div 
                      className="w-1/3 bg-red-500 rounded-t"
                      style={{ 
                        height: maxValue > 0 ? `${(data.expenses / maxValue) * 180}px` : '2px',
                        minHeight: '2px'
                      }}
                      title={`Expenses: ${formatCurrency(data.expenses, 'USD')}`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{data.month}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {chartData.length > 0 && (
                <>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(chartData.reduce((sum, d) => sum + d.revenue, 0), 'USD')}
                    </div>
                    <div className="text-xs text-green-600">Total Revenue</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-red-600">
                      {formatCurrency(chartData.reduce((sum, d) => sum + d.expenses, 0), 'USD')}
                    </div>
                    <div className="text-xs text-red-600">Total Expenses</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-blue-600">
                      {formatCurrency(chartData.reduce((sum, d) => sum + d.profit, 0), 'USD')}
                    </div>
                    <div className="text-xs text-blue-600">Net Profit</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="h-80">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Monthly Revenue vs Expenses</h3>
            <div className="h-64 flex items-end justify-between bg-gray-50 rounded-lg p-4">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                  <div className="relative h-48 w-full max-w-20 flex items-end justify-center space-x-1">
                    {/* Revenue Bar */}
                    <div 
                      className="w-6 bg-green-500 rounded-t"
                      style={{ 
                        height: maxValue > 0 ? `${(data.revenue / maxValue) * 180}px` : '2px',
                        minHeight: '2px'
                      }}
                      title={`Revenue: ${formatCurrency(data.revenue, 'USD')}`}
                    ></div>
                    {/* Expenses Bar */}
                    <div 
                      className="w-6 bg-red-500 rounded-t"
                      style={{ 
                        height: maxValue > 0 ? `${(data.expenses / maxValue) * 180}px` : '2px',
                        minHeight: '2px'
                      }}
                      title={`Expenses: ${formatCurrency(data.expenses, 'USD')}`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="distribution" className="h-80">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Transaction Category Distribution</h3>
            
            {categoryData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No transaction data available</p>
                <p className="text-sm text-gray-400">Add some transactions to see the distribution</p>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="w-full max-w-lg space-y-3">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(category.amount, 'USD')}
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              backgroundColor: category.color,
                              width: `${category.percentage}%`
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {category.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}