import { useRef, useMemo } from 'react';
import { TimeEntry, Currency } from '@/types/freelancer';
import { decimalToHHMMSS, formatCurrency } from '@/utils/timeUtils';
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

interface ProjectGroup {
  project: string;
  entries: TimeEntry[];
  totalHours: number;
  totalAmount: number;
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

  // Group entries by project
  const projectGroups = useMemo((): ProjectGroup[] => {
    const groups: Record<string, TimeEntry[]> = {};
    const rate = parseFloat(hourlyRate) || 0;
    
    entries.forEach(entry => {
      const projectKey = entry.project || 'No Project';
      if (!groups[projectKey]) {
        groups[projectKey] = [];
      }
      groups[projectKey].push(entry);
    });

    return Object.entries(groups)
      .map(([project, projectEntries]) => {
        const totalHours = projectEntries.reduce((sum, e) => sum + e.decimalHours, 0);
        return {
          project,
          entries: projectEntries,
          totalHours,
          totalAmount: totalHours * rate,
        };
      })
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [entries, hourlyRate]);

  const handleDownload = () => {
    if (!invoiceRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const now = new Date();
    const invoiceMonth = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
    const invoiceDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    const rate = parseFloat(hourlyRate) || 0;

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
            .invoice-period {
              font-size: 18px;
              color: #475569;
              margin-top: 8px;
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
            .project-group {
              margin-bottom: 24px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              overflow: hidden;
            }
            .project-header {
              background: #f8fafc;
              padding: 12px 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #e2e8f0;
            }
            .project-name {
              font-weight: 600;
              color: #334155;
              font-size: 15px;
            }
            .project-total {
              font-weight: 600;
              color: #0d9488;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              background: #f1f5f9;
              padding: 10px 16px;
              text-align: left;
              font-weight: 600;
              color: #475569;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            td {
              padding: 10px 16px;
              border-bottom: 1px solid #e2e8f0;
              color: #334155;
              font-size: 13px;
            }
            tr:last-child td {
              border-bottom: none;
            }
            .text-right {
              text-align: right;
            }
            .summary-table {
              width: 320px;
              margin-left: auto;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              overflow: hidden;
            }
            .summary-table td {
              padding: 10px 16px;
              background: #f8fafc;
            }
            .summary-total {
              font-size: 16px;
              font-weight: 700;
              color: #0d9488;
              border-top: 2px solid #0d9488;
            }
            .summary-total td {
              background: #fff;
              padding: 14px 16px;
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
              <p class="invoice-period">${invoiceMonth}</p>
              ${userName ? `<p style="margin-top: 8px; font-size: 14px; color: #334155;"><strong>From:</strong> ${userName}</p>` : ''}
            </div>
            <div class="invoice-meta">
              <p class="invoice-number">${invoiceNumber}</p>
              <p>Date: ${invoiceDate}</p>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Time Entries by Project</h2>
            ${projectGroups.map(group => `
              <div class="project-group">
                <div class="project-header">
                  <span class="project-name">${group.project}</span>
                  <span class="project-total">${decimalToHHMMSS(group.totalHours)} • ${formatCurrency(group.totalAmount, currency.symbol)}</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time Entry</th>
                      <th class="text-right">Hours</th>
                      <th class="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${group.entries.map(entry => `
                      <tr>
                        <td>${entry.createdAt.toLocaleDateString()}</td>
                        <td>${entry.value}</td>
                        <td class="text-right">${decimalToHHMMSS(entry.decimalHours)}</td>
                        <td class="text-right">${formatCurrency(entry.decimalHours * rate, currency.symbol)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <table class="summary-table">
              <tr>
                <td>Total Hours</td>
                <td class="text-right">${decimalToHHMMSS(totalDecimalHours)}</td>
              </tr>
              <tr>
                <td>Hourly Rate</td>
                <td class="text-right">${formatCurrency(rate, currency.symbol)}</td>
              </tr>
              <tr class="summary-total">
                <td><strong>Total Due</strong></td>
                <td class="text-right"><strong>${formatCurrency(totalEarnings, currency.symbol)}</strong></td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated with Timesum</p>
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
          className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
        >
          <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Download Invoice</span>
          <span className="xs:hidden">Invoice</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Invoice</DialogTitle>
        </DialogHeader>
        <div ref={invoiceRef} className="p-4 border border-border rounded-lg bg-background">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-primary">Invoice Preview</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            
            {/* Project breakdown preview */}
            {projectGroups.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">By Project</p>
                {projectGroups.map(group => (
                  <div key={group.project} className="flex justify-between py-1 text-sm border-b border-border/50">
                    <span className="text-muted-foreground truncate max-w-[60%]">{group.project}</span>
                    <span className="font-medium font-mono">{decimalToHHMMSS(group.totalHours)}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2 text-sm pt-2 border-t border-border">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Total Hours</span>
                <span className="font-medium">{decimalToHHMMSS(totalDecimalHours)}</span>
              </div>
              <div className="flex justify-between py-1">
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