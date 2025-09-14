"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  FileText, 
  Folder, 
  Home, 
  Receipt, 
  Calculator, 
  Settings,
  TrendingUp,
  Users,
  CreditCard
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview & Analytics'
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: CreditCard,
    description: 'All Transactions'
  },
  {
    name: 'Invoices',
    href: '/invoices',
    icon: Receipt,
    description: 'Invoice Management'
  },
  {
    name: 'Folders',
    href: '/folders',
    icon: Folder,
    description: 'Bank, Expenses, Suspense',
    submenu: [
      { name: 'Bank', href: '/folders/bank' },
      { name: 'Expenses', href: '/folders/expenses' },
      { name: 'Suspense', href: '/folders/suspense' }
    ]
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    description: 'Financial Reports',
    submenu: [
      { name: 'Balance Sheet', href: '/reports/balance-sheet' },
      { name: 'Profit & Loss', href: '/reports/profit-loss' }
    ]
  },
  {
    name: 'Tax Management',
    href: '/taxes',
    icon: Calculator,
    description: 'VAT & Corporate Tax',
    submenu: [
      { name: 'VAT Returns', href: '/taxes/vat' },
      { name: 'Corporate Tax', href: '/taxes/corporate' }
    ]
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    description: 'Customer Management'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Company & Preferences'
  }
];

export function NavigationSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        {/* Logo and Company Name */}
        <div className="flex items-center flex-shrink-0 px-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">Global</h1>
              <p className="text-xs text-gray-500">Accounting Pro</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
                        isActive
                          ? 'text-blue-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={cn(
                        'text-xs transition-colors',
                        isActive
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      )}>
                        {item.description}
                      </div>
                    </div>
                  </Link>

                  {/* Submenu */}
                  {item.submenu && isActive && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subitem) => {
                        const isSubActive = pathname === subitem.href;
                        return (
                          <Link
                            key={subitem.name}
                            href={subitem.href}
                            className={cn(
                              'block px-3 py-1 text-sm rounded-md transition-colors',
                              isSubActive
                                ? 'text-blue-700 bg-blue-50 font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            )}
                          >
                            {subitem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Quick Actions */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/transactions/add"
              className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Add Transaction</span>
            </Link>
            <Link
              href="/invoices/create"
              className="flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>New Invoice</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Global Accounting Pro v1.0
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Worldwide Financial Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}