import { useRef } from 'react';
import { TimeEntry, Currency } from '@/types/freelancer';
import { decimalToHHMMSS, formatDecimalHours, formatCurrency } from '@/utils/timeUtils';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InvoiceDownloadProps {
  entries: TimeEntry[];
  hourlyRate: string;
  currency: Currency;
  totalDecimalHours: number;
  totalEarnings: number;
  userName?: string;
}

export function InvoiceDownload({
  entries,
  hourlyRate,
  currency,
  totalDecimalHours,
  totalEarnings,
  userName,
}: InvoiceDownloadProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!invoiceRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              color: #1a1a2e;
              background: #fff;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #0d9488;
            }
            .invoice-title {
              font-size: 32px;
              font-weight: 700;
              color: #0d9488;
            }
            .invoice-meta {
              text-align: right;
            }
            .invoice-meta p {
              margin: 4px 0;
              color: #64748b;
            }
            .invoice-number {
              font-weight: 600;
              color: #1a1a2e !important;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background: #f1f5f9;
              padding: 12px 16px;
              text-align: left;
              font-weight: 600;
              color: #475569;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            td {
              padding: 12px 16px;
              border-bottom: 1px solid #e2e8f0;
              color: #334155;
            }
            .text-right {
              text-align: right;
            }
            .summary-table {
              width: 300px;
              margin-left: auto;
            }
            .summary-table td {
              padding: 8px 16px;
            }
            .summary-total {
              font-size: 18px;
              font-weight: 700;
              color: #0d9488;
              border-top: 2px solid #0d9488;
            }
            .footer {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              color: #94a3b8;
              font-size: 13px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div>
              <h1 class="invoice-title">INVOICE</h1>
              ${userName ? `<p style="margin-top: 8px; font-size: 16px; color: #334155;"><strong>From:</strong> ${userName}</p>` : ''}
            </div>
            <div class="invoice-meta">
              <p class="invoice-number">${invoiceNumber}</p>
              <p>Date: ${invoiceDate}</p>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Time Entries</h2>
            <table>
              <thead>
                <tr>
                  <th>Date Added</th>
                  <th>Time Entry</th>
                  <th class="text-right">Hours (Decimal)</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${entries.map(entry => `
                  <tr>
                    <td>${entry.createdAt.toLocaleDateString()}</td>
                    <td>${entry.value}</td>
                    <td class="text-right">${formatDecimalHours(entry.decimalHours)}</td>
                    <td class="text-right">${formatCurrency(entry.decimalHours * (parseFloat(hourlyRate) || 0), currency.symbol)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <table class="summary-table">
              <tr>
                <td>Total Hours</td>
                <td class="text-right">${decimalToHHMMSS(totalDecimalHours)}</td>
              </tr>
              <tr>
                <td>Decimal Hours</td>
                <td class="text-right">${formatDecimalHours(totalDecimalHours)} hrs</td>
              </tr>
              <tr>
                <td>Hourly Rate</td>
                <td class="text-right">${formatCurrency(parseFloat(hourlyRate) || 0, currency.symbol)}</td>
              </tr>
              <tr class="summary-total">
                <td><strong>Total Due</strong></td>
                <td class="text-right"><strong>${formatCurrency(totalEarnings, currency.symbol)}</strong></td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated with FreelanceCalc</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const isDisabled = entries.length === 0 || !hourlyRate;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={isDisabled}
          className="gap-2"
        >
          <FileDown className="w-4 h-4" />
          Download Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Invoice</DialogTitle>
        </DialogHeader>
        <div ref={invoiceRef} className="p-4 border border-border rounded-lg bg-background">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-primary">Invoice Preview</h3>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Time Entries</span>
                <span className="font-medium">{entries.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Total Hours</span>
                <span className="font-medium">{decimalToHHMMSS(totalDecimalHours)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Hourly Rate</span>
                <span className="font-medium">{formatCurrency(parseFloat(hourlyRate) || 0, currency.symbol)}</span>
              </div>
              <div className="flex justify-between py-2 text-base">
                <span className="font-semibold">Total Earnings</span>
                <span className="font-bold text-primary">{formatCurrency(totalEarnings, currency.symbol)}</span>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={handleDownload} className="w-full gap-2">
          <FileDown className="w-4 h-4" />
          Download as PDF
        </Button>
      </DialogContent>
    </Dialog>
  );
}
