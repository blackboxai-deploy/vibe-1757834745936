// PDF generation utilities for invoices and reports

import { Invoice, BalanceSheetData, ProfitLossData, CompanySettings } from './accounting-types';
import { formatCurrency } from './currency-utils';

/**
 * Generate invoice PDF content as HTML string for browser printing
 */
export function generateInvoicePDF(
  invoice: Invoice,
  companySettings: CompanySettings
): string {
  const today = new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.number}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .invoice-details {
          text-align: right;
          flex: 1;
        }
        .invoice-title {
          font-size: 32px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .invoice-number {
          font-size: 18px;
          margin-bottom: 5px;
        }
        .billing-info {
          display: flex;
          justify-content: space-between;
          margin: 40px 0;
        }
        .bill-to, .bill-from {
          flex: 1;
        }
        .bill-to {
          margin-right: 40px;
        }
        .section-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
          color: #007bff;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .items-table th {
          background-color: #007bff;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        .items-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .items-table tr:hover {
          background-color: #f0f8ff;
        }
        .amount-column {
          text-align: right;
        }
        .totals {
          margin-left: auto;
          width: 300px;
          margin-top: 20px;
        }
        .totals table {
          width: 100%;
          border-collapse: collapse;
        }
        .totals td {
          padding: 8px 12px;
          border-bottom: 1px solid #eee;
        }
        .totals .total-row {
          font-weight: bold;
          font-size: 18px;
          background-color: #007bff;
          color: white;
        }
        .payment-terms {
          margin-top: 40px;
          padding: 20px;
          background-color: #f8f9fa;
          border-left: 4px solid #007bff;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-draft { background-color: #ffc107; color: #000; }
        .status-sent { background-color: #17a2b8; color: white; }
        .status-paid { background-color: #28a745; color: white; }
        .status-overdue { background-color: #dc3545; color: white; }
        .status-cancelled { background-color: #6c757d; color: white; }
        @media print {
          body { margin: 0; padding: 15px; }
          .header { page-break-after: avoid; }
          .items-table { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">${companySettings.name}</div>
          <div>${companySettings.address}</div>
          <div>Tax ID: ${companySettings.taxId}</div>
        </div>
        <div class="invoice-details">
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-number">${invoice.number}</div>
          <div class="status-badge status-${invoice.status}">${invoice.status}</div>
        </div>
      </div>

      <div class="billing-info">
        <div class="bill-to">
          <div class="section-title">Bill To:</div>
          <strong>${invoice.customerName}</strong><br>
          ${invoice.customerAddress}
        </div>
        <div class="bill-from">
          <div class="section-title">Invoice Details:</div>
          <strong>Date:</strong> ${invoice.date.toLocaleDateString()}<br>
          <strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}<br>
          <strong>Currency:</strong> ${invoice.currency}
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th class="amount-column">Unit Price</th>
            <th class="amount-column">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td class="amount-column">${formatCurrency(item.unitPrice, invoice.currency)}</td>
              <td class="amount-column">${formatCurrency(item.amount, invoice.currency)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <table>
          <tr>
            <td>Subtotal:</td>
            <td class="amount-column">${formatCurrency(invoice.subtotal, invoice.currency)}</td>
          </tr>
          <tr>
            <td>VAT (${invoice.vatRate}%):</td>
            <td class="amount-column">${formatCurrency(invoice.vatAmount, invoice.currency)}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td class="amount-column">${formatCurrency(invoice.totalAmount, invoice.currency)}</td>
          </tr>
        </table>
      </div>

      ${invoice.notes ? `
        <div class="payment-terms">
          <div class="section-title">Notes:</div>
          ${invoice.notes}
        </div>
      ` : ''}

      <div class="footer">
        <p>Generated on ${today} | ${companySettings.name}</p>
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate Balance Sheet PDF content
 */
export function generateBalanceSheetPDF(
  data: BalanceSheetData,
  companySettings: CompanySettings
): string {
  const today = new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Balance Sheet - ${data.period.name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .period {
          font-size: 16px;
          color: #666;
        }
        .financial-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .financial-table th {
          background-color: #f8f9fa;
          padding: 12px;
          text-align: left;
          border: 1px solid #dee2e6;
          font-weight: bold;
        }
        .financial-table td {
          padding: 10px 12px;
          border: 1px solid #dee2e6;
        }
        .section-header {
          background-color: #007bff;
          color: white;
          font-weight: bold;
          font-size: 16px;
        }
        .subsection-header {
          background-color: #e9ecef;
          font-weight: bold;
        }
        .total-row {
          font-weight: bold;
          background-color: #f8f9fa;
          border-top: 2px solid #007bff;
        }
        .amount-column {
          text-align: right;
          width: 150px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${companySettings.name}</div>
        <div class="report-title">Balance Sheet</div>
        <div class="period">As of ${data.period.endDate.toLocaleDateString()}</div>
        <div class="period">Currency: ${data.currency}</div>
      </div>

      <table class="financial-table">
        <thead>
          <tr>
            <th>ASSETS</th>
            <th class="amount-column">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr class="subsection-header">
            <td>Current Assets</td>
            <td class="amount-column"></td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Cash and Cash Equivalents</td>
            <td class="amount-column">${formatCurrency(data.assets.currentAssets.cash, data.currency)}</td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Accounts Receivable</td>
            <td class="amount-column">${formatCurrency(data.assets.currentAssets.accountsReceivable, data.currency)}</td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Inventory</td>
            <td class="amount-column">${formatCurrency(data.assets.currentAssets.inventory, data.currency)}</td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Other Current Assets</td>
            <td class="amount-column">${formatCurrency(data.assets.currentAssets.other, data.currency)}</td>
          </tr>
          <tr class="total-row">
            <td>Total Current Assets</td>
            <td class="amount-column">${formatCurrency(data.assets.currentAssets.total, data.currency)}</td>
          </tr>
          
          <tr class="subsection-header">
            <td>Fixed Assets</td>
            <td class="amount-column"></td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Property, Plant & Equipment</td>
            <td class="amount-column">${formatCurrency(data.assets.fixedAssets.propertyPlantEquipment, data.currency)}</td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Intangible Assets</td>
            <td class="amount-column">${formatCurrency(data.assets.fixedAssets.intangibleAssets, data.currency)}</td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Other Fixed Assets</td>
            <td class="amount-column">${formatCurrency(data.assets.fixedAssets.other, data.currency)}</td>
          </tr>
          <tr class="total-row">
            <td>Total Fixed Assets</td>
            <td class="amount-column">${formatCurrency(data.assets.fixedAssets.total, data.currency)}</td>
          </tr>
          
          <tr class="section-header">
            <td>TOTAL ASSETS</td>
            <td class="amount-column">${formatCurrency(data.assets.totalAssets, data.currency)}</td>
          </tr>
        </tbody>
      </table>

      <table class="financial-table">
        <thead>
          <tr>
            <th>LIABILITIES</th>
            <th class="amount-column">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr class="subsection-header">
            <td>Current Liabilities</td>
            <td class="amount-column"></td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Accounts Payable</td>
            <td class="amount-column">${formatCurrency(data.liabilities.currentLiabilities.accountsPayable, data.currency)}</td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Short-term Debt</td>
            <td class="amount-column">${formatCurrency(data.liabilities.currentLiabilities.shortTermDebt, data.currency)}</td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Accrued Expenses</td>
            <td class="amount-column">${formatCurrency(data.liabilities.currentLiabilities.accruedExpenses, data.currency)}</td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Other Current Liabilities</td>
            <td class="amount-column">${formatCurrency(data.liabilities.currentLiabilities.other, data.currency)}</td>
          </tr>
          <tr class="total-row">
            <td>Total Current Liabilities</td>
            <td class="amount-column">${formatCurrency(data.liabilities.currentLiabilities.total, data.currency)}</td>
          </tr>
          
          <tr class="subsection-header">
            <td>Long-term Liabilities</td>
            <td class="amount-column"></td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Long-term Debt</td>
            <td class="amount-column">${formatCurrency(data.liabilities.longTermLiabilities.longTermDebt, data.currency)}</td>
          </tr>
          <tr>
            <td style="padding-left: 20px;">Other Long-term Liabilities</td>
            <td class="amount-column">${formatCurrency(data.liabilities.longTermLiabilities.other, data.currency)}</td>
          </tr>
          <tr class="total-row">
            <td>Total Long-term Liabilities</td>
            <td class="amount-column">${formatCurrency(data.liabilities.longTermLiabilities.total, data.currency)}</td>
          </tr>
          
          <tr class="section-header">
            <td>TOTAL LIABILITIES</td>
            <td class="amount-column">${formatCurrency(data.liabilities.totalLiabilities, data.currency)}</td>
          </tr>
        </tbody>
      </table>

      <table class="financial-table">
        <thead>
          <tr>
            <th>EQUITY</th>
            <th class="amount-column">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Share Capital</td>
            <td class="amount-column">${formatCurrency(data.equity.shareCapital, data.currency)}</td>
          </tr>
          <tr>
            <td>Retained Earnings</td>
            <td class="amount-column">${formatCurrency(data.equity.retainedEarnings, data.currency)}</td>
          </tr>
          <tr>
            <td>Other Equity</td>
            <td class="amount-column">${formatCurrency(data.equity.other, data.currency)}</td>
          </tr>
          <tr class="section-header">
            <td>TOTAL EQUITY</td>
            <td class="amount-column">${formatCurrency(data.equity.total, data.currency)}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>Generated on ${today} | ${companySettings.name}</p>
        <p>Total Liabilities and Equity: ${formatCurrency(data.liabilities.totalLiabilities + data.equity.total, data.currency)}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate Profit & Loss PDF content
 */
export function generateProfitLossPDF(
  data: ProfitLossData,
  companySettings: CompanySettings
): string {
  const today = new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Profit & Loss Statement - ${data.period.name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .period {
          font-size: 16px;
          color: #666;
        }
        .financial-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .financial-table th {
          background-color: #f8f9fa;
          padding: 12px;
          text-align: left;
          border: 1px solid #dee2e6;
          font-weight: bold;
        }
        .financial-table td {
          padding: 10px 12px;
          border: 1px solid #dee2e6;
        }
        .section-header {
          background-color: #007bff;
          color: white;
          font-weight: bold;
          font-size: 16px;
        }
        .total-row {
          font-weight: bold;
          background-color: #f8f9fa;
          border-top: 2px solid #007bff;
        }
        .profit-row {
          font-weight: bold;
          background-color: #28a745;
          color: white;
          font-size: 18px;
        }
        .loss-row {
          font-weight: bold;
          background-color: #dc3545;
          color: white;
          font-size: 18px;
        }
        .amount-column {
          text-align: right;
          width: 150px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${companySettings.name}</div>
        <div class="report-title">Profit & Loss Statement</div>
        <div class="period">${data.period.startDate.toLocaleDateString()} - ${data.period.endDate.toLocaleDateString()}</div>
        <div class="period">Currency: ${data.currency}</div>
      </div>

      <table class="financial-table">
        <thead>
          <tr>
            <th>REVENUE</th>
            <th class="amount-column">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sales Revenue</td>
            <td class="amount-column">${formatCurrency(data.revenue.sales, data.currency)}</td>
          </tr>
          <tr>
            <td>Other Revenue</td>
            <td class="amount-column">${formatCurrency(data.revenue.other, data.currency)}</td>
          </tr>
          <tr class="section-header">
            <td>TOTAL REVENUE</td>
            <td class="amount-column">${formatCurrency(data.revenue.total, data.currency)}</td>
          </tr>
        </tbody>
      </table>

      <table class="financial-table">
        <thead>
          <tr>
            <th>EXPENSES</th>
            <th class="amount-column">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cost of Goods Sold</td>
            <td class="amount-column">${formatCurrency(data.expenses.costOfGoodsSold, data.currency)}</td>
          </tr>
          <tr>
            <td>Salaries & Benefits</td>
            <td class="amount-column">${formatCurrency(data.expenses.salaries, data.currency)}</td>
          </tr>
          <tr>
            <td>Rent</td>
            <td class="amount-column">${formatCurrency(data.expenses.rent, data.currency)}</td>
          </tr>
          <tr>
            <td>Utilities</td>
            <td class="amount-column">${formatCurrency(data.expenses.utilities, data.currency)}</td>
          </tr>
          <tr>
            <td>Other Expenses</td>
            <td class="amount-column">${formatCurrency(data.expenses.other, data.currency)}</td>
          </tr>
          <tr class="section-header">
            <td>TOTAL EXPENSES</td>
            <td class="amount-column">${formatCurrency(data.expenses.total, data.currency)}</td>
          </tr>
        </tbody>
      </table>

      <table class="financial-table">
        <thead>
          <tr>
            <th>FINANCIAL SUMMARY</th>
            <th class="amount-column">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr class="total-row">
            <td>Gross Profit</td>
            <td class="amount-column">${formatCurrency(data.grossProfit, data.currency)}</td>
          </tr>
          <tr>
            <td>Tax Expense</td>
            <td class="amount-column">${formatCurrency(data.taxExpense, data.currency)}</td>
          </tr>
          <tr class="total-row">
            <td>Profit Before Tax</td>
            <td class="amount-column">${formatCurrency(data.profitBeforeTax, data.currency)}</td>
          </tr>
          <tr class="${data.netProfit >= 0 ? 'profit-row' : 'loss-row'}">
            <td>NET ${data.netProfit >= 0 ? 'PROFIT' : 'LOSS'}</td>
            <td class="amount-column">${formatCurrency(Math.abs(data.netProfit), data.currency)}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>Generated on ${today} | ${companySettings.name}</p>
        <p>Profit Margin: ${data.revenue.total > 0 ? ((data.netProfit / data.revenue.total) * 100).toFixed(2) : 0}%</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Download HTML content as PDF using browser's print functionality
 */
export function downloadPDF(htmlContent: string, filename: string): void {
  // Create a new window with the HTML content
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to download the PDF');
    return;
  }
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
}

/**
 * Generate CSV content for data export
 */
export function generateCSVContent(
  data: Array<Record<string, any>>,
  headers: string[]
): string {
  const csvRows: string[] = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}