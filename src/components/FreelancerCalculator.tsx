import { useState } from 'react';
import { TimeFormat, TimeEntry, Currency, CURRENCIES } from '@/types/freelancer';
import { decimalToHHMMSS, formatDecimalHours, formatCurrency } from '@/utils/timeUtils';
import { TimeFormatToggle } from './TimeFormatToggle';
import { TimeEntryInput } from './TimeEntryInput';
import { TimeEntryList } from './TimeEntryList';
import { CurrencySelect } from './CurrencySelect';
import { HourlyRateInput } from './HourlyRateInput';
import { SummaryCard } from './SummaryCard';
import { InvoiceDownload } from './InvoiceDownload';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Calculator, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function FreelancerCalculator() {
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('hh:mm:ss');
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);

  const totalDecimalHours = entries.reduce((sum, entry) => sum + entry.decimalHours, 0);
  const totalEarnings = totalDecimalHours * (parseFloat(hourlyRate) || 0);

  const handleAddEntry = (value: string, decimalHours: number) => {
    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      value,
      decimalHours,
      createdAt: new Date(),
    };
    setEntries(prev => [newEntry, ...prev]);
    toast({
      title: "Entry added",
      description: `Added ${formatDecimalHours(decimalHours)} hours`,
    });
  };

  const handleRemoveEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleClearAll = () => {
    setEntries([]);
    toast({
      title: "All entries cleared",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Calculator className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">FreelanceCalc</h1>
                <p className="text-xs text-muted-foreground">Track hours, calculate earnings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <InvoiceDownload
                entries={entries}
                hourlyRate={hourlyRate}
                currency={currency}
                totalDecimalHours={totalDecimalHours}
                totalEarnings={totalEarnings}
              />
              <TimeFormatToggle value={timeFormat} onChange={setTimeFormat} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <SummaryCard
              title="Total Hours"
              value={decimalToHHMMSS(totalDecimalHours)}
              subtitle={`${formatDecimalHours(totalDecimalHours)} decimal hours`}
              icon={<Clock className="w-6 h-6" />}
              variant="default"
            />
            <SummaryCard
              title="Hourly Rate"
              value={hourlyRate ? formatCurrency(parseFloat(hourlyRate), currency.symbol) : '—'}
              subtitle={`per hour in ${currency.code}`}
              icon={<DollarSign className="w-6 h-6" />}
              variant="default"
            />
            <SummaryCard
              title="Total Earnings"
              value={formatCurrency(totalEarnings, currency.symbol)}
              subtitle={`${entries.length} entries logged`}
              icon={<Calculator className="w-6 h-6" />}
              variant="primary"
            />
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Entries Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold text-foreground">
                  Add Time Entry
                </h2>
                {entries.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearAll}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                <TimeEntryInput format={timeFormat} onAdd={handleAddEntry} />
                <TimeEntryList 
                  entries={entries} 
                  format={timeFormat} 
                  onRemove={handleRemoveEntry} 
                />
              </div>
            </div>

            {/* Rate & Currency Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Rate & Currency
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Hourly Rate
                  </label>
                  <HourlyRateInput 
                    value={hourlyRate} 
                    onChange={setHourlyRate}
                    currency={currency}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Currency
                  </label>
                  <CurrencySelect value={currency} onChange={setCurrency} />
                </div>

                {/* Quick calculation breakdown */}
                {totalDecimalHours > 0 && hourlyRate && (
                  <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-accent animate-scale-in">
                    <h3 className="text-sm font-medium text-foreground mb-3">Calculation Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours worked</span>
                        <span className="font-medium">{formatDecimalHours(totalDecimalHours)} hrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="font-medium">{formatCurrency(parseFloat(hourlyRate), currency.symbol)}/hr</span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">Total</span>
                          <span className="font-bold text-primary">{formatCurrency(totalEarnings, currency.symbol)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Track your freelance hours and calculate earnings effortlessly</p>
        </div>
      </footer>
    </div>
  );
}
