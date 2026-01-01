import { TimeEntry, TimeFormat } from '@/types/freelancer';
import { Button } from '@/components/ui/button';
import { Trash2, Clock } from 'lucide-react';
import { decimalToHHMMSS, formatDecimalHours } from '@/utils/timeUtils';

interface TimeEntryListProps {
  entries: TimeEntry[];
  format: TimeFormat;
  onRemove: (id: string) => void;
}

export function TimeEntryList({ entries, format, onRemove }: TimeEntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Clock className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-base">No time entries yet</p>
        <p className="text-sm">Add your first entry above</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg group animate-scale-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm font-mono w-6">
              #{entries.length - index}
            </span>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {format === 'hh:mm:ss' 
                  ? decimalToHHMMSS(entry.decimalHours)
                  : `${formatDecimalHours(entry.decimalHours)} hrs`
                }
              </span>
              <span className="text-xs text-muted-foreground">
                {format === 'hh:mm:ss' 
                  ? `${formatDecimalHours(entry.decimalHours)} decimal hours`
                  : decimalToHHMMSS(entry.decimalHours)
                }
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(entry.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
