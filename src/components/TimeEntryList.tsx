import { TimeEntry } from '@/types/freelancer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Clock, FolderOpen } from 'lucide-react';
import { decimalToHHMMSS } from '@/utils/timeUtils';

interface TimeEntryListProps {
  entries: TimeEntry[];
  format?: string; // kept for compatibility but not used
  onRemove: (id: string) => void;
}

export function TimeEntryList({ entries, onRemove }: TimeEntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-muted-foreground">
        <Clock className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 opacity-50" />
        <p className="text-sm sm:text-base">No time entries yet</p>
        <p className="text-xs sm:text-sm">Add your first entry above</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className="flex items-center justify-between p-2.5 sm:p-3 bg-secondary/50 rounded-lg group animate-scale-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <span className="text-muted-foreground text-xs sm:text-sm font-mono w-5 sm:w-6 flex-shrink-0">
              #{entries.length - index}
            </span>
            <div className="flex flex-col min-w-0 gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground text-sm sm:text-base truncate font-mono">
                  {decimalToHHMMSS(entry.decimalHours)}
                </span>
                {entry.project && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs gap-1 py-0 h-5">
                    <FolderOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="max-w-[60px] sm:max-w-[100px] truncate">{entry.project}</span>
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {entry.value}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(entry.id)}
            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}