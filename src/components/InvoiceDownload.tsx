import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TimeEntry, Currency } from "@/types/freelancer";
import { decimalToHHMMSS, formatCurrency } from "@/utils/timeUtils";
import { Button } from "@/components/ui/button";
import { FileDown, Heart, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface InvoiceDownloadProps {
  entries: TimeEntry[];
  hourlyRate: string;
  currency: Currency;
  userName?: string;
  filterLabel?: string;
}

interface TagGroup {
  tag: string;
  entries: TimeEntry[];
  totalHours: number;
  totalAmount: number;
}

export function InvoiceDownload({
  entries,
  hourlyRate,
  currency,
  userName,
  filterLabel = "All Entries",
}: InvoiceDownloadProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const rate = parseFloat(hourlyRate) || 0;

  // Calculate totals for filtered entries
  const totalHours = useMemo(() => {
    return entries.reduce((sum, e) => sum + e.decimalHours, 0);
  }, [entries]);

  const totalEarnings = totalHours * rate;

  // Group entries by tag
  const tagGroups = useMemo((): TagGroup[] => {
    const groups: Record<string, TimeEntry[]> = {};

    entries.forEach((entry) => {
      const tagKey = entry.tag || "No Tag";
      if (!groups[tagKey]) {
        groups[tagKey] = [];
      }
      groups[tagKey].push(entry);
    });

    return Object.entries(groups)
      .map(([tag, tagEntries]) => {
        const groupTotalHours = tagEntries.reduce((sum, e) => sum + e.decimalHours, 0);
        return {
          tag,
          entries: tagEntries,
          totalHours: groupTotalHours,
          totalAmount: groupTotalHours * rate,
        };
      })
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [entries, rate]);

  const handleDownload = () => {
    if (entries.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const now = new Date();
    const invoiceDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
            .tag-group {
              margin-bottom: 24px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              overflow: hidden;
            }
            .tag-header {
              background: #f8fafc;
              padding: 12px 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #e2e8f0;
            }
            .tag-name {
              font-weight: 600;
              color: #334155;
              font-size: 15px;
            }
            .tag-total {
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
              ${userName ? `<p style="margin-top: 8px; font-size: 14px; color: #334155;"><strong>From:</strong> ${userName}</p>` : ""}
            </div>
            <div class="invoice-meta">
              <p class="invoice-number">${invoiceNumber}</p>
              <p>Date: ${invoiceDate}</p>
              <p>Entries: ${entries.length}</p>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Time Entries${tagGroups.length > 1 ? " by Tag" : ""}</h2>
            ${tagGroups
              .map(
                (group) => `
              <div class="tag-group">
                <div class="tag-header">
                  <span class="tag-name">${group.tag}</span>
                  <span class="tag-total">${decimalToHHMMSS(group.totalHours)} • ${formatCurrency(group.totalAmount, currency.symbol)}</span>
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
                    ${group.entries
                      .map(
                        (entry) => `
                      <tr>
                        <td>${entry.createdAt.toLocaleDateString()}</td>
                        <td>${entry.value}</td>
                        <td class="text-right">${decimalToHHMMSS(entry.decimalHours)}</td>
                        <td class="text-right">${formatCurrency(entry.decimalHours * rate, currency.symbol)}</td>
                      </tr>
                    `,
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            `,
              )
              .join("")}
          </div>

          <div class="section">
            <table class="summary-table">
              <tr>
                <td>Total Hours</td>
                <td class="text-right">${decimalToHHMMSS(totalHours)}</td>
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
    setIsOpen(false);
  };

  const isDisabled = entries.length === 0 || !hourlyRate;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isDisabled} className="gap-2 text-sm h-9 w-full sm:w-auto">
          <FileDown className="w-4 h-4" />
          <span>Invoice ({entries.length})</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Invoice Preview */}
          <div className="p-4 border border-border rounded-lg bg-accent/30 space-y-3">
            {filterTable !== Untagged && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tag</span>
                <span className="text-sm font-medium">{filterLabel}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Entries</span>
              <span className="text-sm font-medium">{entries.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Hours</span>
              <span className="text-sm font-medium font-mono">{decimalToHHMMSS(totalHours)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Rate</span>
              <span className="text-sm font-medium">{formatCurrency(rate, currency.symbol)}/hr</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="font-semibold">Total Due</span>
              <span className="font-bold text-primary text-lg">{formatCurrency(totalEarnings, currency.symbol)}</span>
            </div>
          </div>

          {/* Support Reminder */}
          <div className="p-3 bg-gradient-to-r from-primary/10 to-accent/20 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Enjoying Timesum?</p>
                <p className="text-xs text-muted-foreground">Your support keeps this tool free!</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/support");
                }}
                className="flex-shrink-0 gap-1.5 border-primary/30 hover:bg-primary/10 h-8 text-xs"
              >
                <Sparkles className="w-3 h-3" />
                Support
              </Button>
            </div>
          </div>
        </div>

        <Button onClick={handleDownload} className="w-full gap-2" disabled={entries.length === 0}>
          <FileDown className="w-4 h-4" />
          Download Invoice
        </Button>
      </DialogContent>
    </Dialog>
  );
}
