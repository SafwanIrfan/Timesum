import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeEntry, Currency } from '@/types/freelancer';
import { decimalToHHMMSS, formatCurrency } from '@/utils/timeUtils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileDown, CheckSquare, Sparkles, Heart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InvoiceDownloadProps {
  entries: TimeEntry[];
  hourlyRate: string;
  currency: Currency;
  userName?: string;
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
}: InvoiceDownloadProps) {
  const navigate = useNavigate();
  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const rate = parseFloat(hourlyRate) || 0;

  // When dialog opens, select all entries by default
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSelectedEntryIds(new Set(entries.map(e => e.id)));
    }
  };

  // Selected entries for invoice
  const selectedEntries = useMemo(() => {
    return entries.filter(e => selectedEntryIds.has(e.id));
  }, [entries, selectedEntryIds]);

  // Calculate totals for selected entries
  const selectedTotalHours = useMemo(() => {
    return selectedEntries.reduce((sum, e) => sum + e.decimalHours, 0);
  }, [selectedEntries]);

  const selectedTotalEarnings = selectedTotalHours * rate;

  // Group selected entries by tag
  const tagGroups = useMemo((): TagGroup[] => {
    const groups: Record<string, TimeEntry[]> = {};
    
    selectedEntries.forEach(entry => {
      const tagKey = entry.tag || 'No Tag';
      if (!groups[tagKey]) {
        groups[tagKey] = [];
      }
      groups[tagKey].push(entry);
    });

    return Object.entries(groups)
      .map(([tag, tagEntries]) => {
        const totalHours = tagEntries.reduce((sum, e) => sum + e.decimalHours, 0);
        return {
          tag,
          entries: tagEntries,
          totalHours,
          totalAmount: totalHours * rate,
        };
      })
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [selectedEntries, rate]);

  const toggleEntry = (id: string) => {
    setSelectedEntryIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedEntryIds(new Set(entries.map(e => e.id)));
  };

  const deselectAll = () => {
    setSelectedEntryIds(new Set());
  };

  const handleDownload = () => {
    if (selectedEntries.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const now = new Date();
    const invoiceDate = now.toLocaleDateString('en-US', {
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
              ${userName ? `<p style="margin-top: 8px; font-size: 14px; color: #334155;"><strong>From:</strong> ${userName}</p>` : ''}
            </div>
            <div class="invoice-meta">
              <p class="invoice-number">${invoiceNumber}</p>
              <p>Date: ${invoiceDate}</p>
              <p>Entries: ${selectedEntries.length}</p>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Time Entries${tagGroups.length > 1 ? ' by Tag' : ''}</h2>
            ${tagGroups.map(group => `
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
                <td class="text-right">${decimalToHHMMSS(selectedTotalHours)}</td>
              </tr>
              <tr>
                <td>Hourly Rate</td>
                <td class="text-right">${formatCurrency(rate, currency.symbol)}</td>
              </tr>
              <tr class="summary-total">
                <td><strong>Total Due</strong></td>
                <td class="text-right"><strong>${formatCurrency(selectedTotalEarnings, currency.symbol)}</strong></td>
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={isDisabled}
          className="gap-2 text-sm h-9"
        >
          <FileDown className="w-4 h-4" />
          <span className="hidden sm:inline">Download Invoice</span>
          <span className="sm:hidden">Invoice</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        
        {/* Entry Selection */}
        <div className="flex-1 min-h-0 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Select entries to include ({selectedEntryIds.size} of {entries.length})
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} className="text-xs h-7">
                <CheckSquare className="w-3 h-3 mr-1" />
                All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll} className="text-xs h-7">
                None
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[200px] border rounded-lg">
            <div className="p-2 space-y-1">
              {entries.map((entry) => (
                <label
                  key={entry.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selectedEntryIds.has(entry.id)}
                    onCheckedChange={() => toggleEntry(entry.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {decimalToHHMMSS(entry.decimalHours)}
                      </span>
                      {entry.tag && (
                        <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {entry.tag}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {entry.createdAt.toLocaleDateString()} • {entry.value}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>

          {/* Preview Summary */}
          {selectedEntries.length > 0 && (
            <div className="p-4 border border-border rounded-lg bg-accent/30 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Invoice Summary</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedEntries.length} entries selected
                  </p>
                </div>
              </div>
              
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Hours</span>
                  <span className="font-medium font-mono">{decimalToHHMMSS(selectedTotalHours)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">{formatCurrency(rate, currency.symbol)}/hr</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">{formatCurrency(selectedTotalEarnings, currency.symbol)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Support Reminder */}
        <div className="p-3 bg-gradient-to-r from-primary/10 to-accent/20 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Enjoying Timesum?</p>
              <p className="text-xs text-muted-foreground">Your support helps keep this tool free!</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsOpen(false);
                navigate('/support');
              }}
              className="flex-shrink-0 gap-1.5 border-primary/30 hover:bg-primary/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Support
            </Button>
          </div>
        </div>

        <Button 
          onClick={handleDownload} 
          className="w-full gap-2"
          disabled={selectedEntries.length === 0}
        >
          <FileDown className="w-4 h-4" />
          Download Invoice ({selectedEntries.length} entries)
        </Button>
      </DialogContent>
    </Dialog>
  );
}
