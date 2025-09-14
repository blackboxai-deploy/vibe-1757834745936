"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardKPIs } from "@/lib/accounting-types";
import { formatCurrency } from "@/lib/currency-utils";

interface DashboardCardsProps {
  kpis: DashboardKPIs;
}

export function DashboardCards({ kpis }: DashboardCardsProps) {
  const kpiCards = [
    {
      title: "Total Revenue",
      value: kpis.totalRevenue,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: "📈",
      description: "This period"
    },
    {
      title: "Total Expenses", 
      value: kpis.totalExpenses,
      change: "+5.2%",
      changeType: "negative" as const,
      icon: "💸",
      description: "This period"
    },
    {
      title: "Net Profit",
      value: kpis.netProfit,
      change: kpis.netProfit >= 0 ? "+18.3%" : "-8.7%",
      changeType: kpis.netProfit >= 0 ? "positive" as const : "negative" as const,
      icon: kpis.netProfit >= 0 ? "💰" : "📉",
      description: "This period"
    },
    {
      title: "Cash Balance",
      value: kpis.cashBalance,
      change: "+2.1%",
      changeType: "positive" as const,
      icon: "🏦",
      description: "Current"
    },
    {
      title: "Accounts Receivable",
      value: kpis.accountsReceivable,
      change: "-3.4%",
      changeType: "positive" as const,
      icon: "📋",
      description: "Outstanding"
    },
    {
      title: "Accounts Payable",
      value: kpis.accountsPayable,
      change: "+7.8%",
      changeType: "neutral" as const,
      icon: "📄",
      description: "Due"
    },
    {
      title: "Current Ratio",
      value: kpis.currentRatio,
      change: kpis.currentRatio > 1 ? "Healthy" : "Attention",
      changeType: kpis.currentRatio > 1 ? "positive" as const : "negative" as const,
      icon: "⚖️",
      description: "Liquidity",
      isRatio: true
    },
    {
      title: "Tax Liability",
      value: kpis.totalRevenue * 0.15, // Estimated 15% tax
      change: "+4.2%",
      changeType: "neutral" as const,
      icon: "🧾",
      description: "Estimated"
    }
  ];

  const getChangeColor = (changeType: "positive" | "negative" | "neutral") => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      case "neutral":
        return "text-gray-600";
    }
  };

  const getChangeBackground = (changeType: "positive" | "negative" | "neutral") => {
    switch (changeType) {
      case "positive":
        return "bg-green-50";
      case "negative":
        return "bg-red-50";
      case "neutral":
        return "bg-gray-50";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className="text-2xl">{card.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {card.isRatio 
                  ? card.value.toFixed(2)
                  : formatCurrency(card.value, kpis.currency)
                }
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {card.description}
                </p>
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChangeBackground(card.changeType)}`}>
                  <span className={getChangeColor(card.changeType)}>
                    {card.change}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}