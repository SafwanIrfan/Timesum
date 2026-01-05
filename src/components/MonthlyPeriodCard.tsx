import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeEntry, Currency, TimeFormat } from '@/types/freelancer';
import { TimeEntryList } from './TimeEntryList';
import { TimeEntryInput } from './TimeEntryInput';
import { decimalToHHMMSS, formatDecimalHours, formatCurrency } from '@/utils/timeUtils';

interface MonthlyPeriod {
  id: string;
  name: string;
  month: number;
  year: number;
  isClosed: boolean;
}

interface MonthlyPeriodCardProps {
  period: MonthlyPeriod;
  entries: TimeEntry[];
  hourlyRate: string;
  currency: Currency;
  timeFormat: TimeFormat;
  onAddEntry: (value: string, decimalHours: number) => void;
  onRemoveEntry: (id: string) => void;
  onDeletePeriod: (id: string) => void;
}

export function MonthlyPeriodCard({
  period,
  entries,
  hourlyRate,
  currency,
  timeFormat,
  onAddEntry,
  onRemoveEntry,
  onDeletePeriod,
}: MonthlyPeriodCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalDecimalHours = entries.reduce((sum, entry) => sum + entry.decimalHours, 0);
  const totalEarnings = totalDecimalHours * (parseFloat(hourlyRate) || 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <div className="text-left">
            <h3 className="font-display font-semibold text-foreground">
              {period.name || `${monthNames[period.month - 1]} ${period.year}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {entries.length} entries • {formatDecimalHours(totalDecimalHours)} hrs • {formatCurrency(totalEarnings, currency.symbol)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDeletePeriod(period.id);
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border/50 animate-fade-in">
          <div className="space-y-4 mt-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 p-3 bg-accent/30 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Hours</p>
                <p className="font-semibold text-foreground">{decimalToHHMMSS(totalDecimalHours)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Rate</p>
                <p className="font-semibold text-foreground">
                  {hourlyRate ? formatCurrency(parseFloat(hourlyRate), currency.symbol) : '—'}/hr
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Earnings</p>
                <p className="font-semibold text-primary">{formatCurrency(totalEarnings, currency.symbol)}</p>
              </div>
            </div>

            {/* Add Entry */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Add Entry</p>
              <TimeEntryInput format={timeFormat} onAdd={onAddEntry} />
            </div>

            {/* Entries List */}
            {entries.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Entries</p>
                <TimeEntryList
                  entries={entries}
                  format={timeFormat}
                  onRemove={onRemoveEntry}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
