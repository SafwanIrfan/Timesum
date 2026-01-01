import { TimeFormat } from '@/types/freelancer';
import { cn } from '@/lib/utils';
import { Clock, Hash } from 'lucide-react';

interface TimeFormatToggleProps {
  value: TimeFormat;
  onChange: (format: TimeFormat) => void;
}

export function TimeFormatToggle({ value, onChange }: TimeFormatToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
      <button
        onClick={() => onChange('hh:mm:ss')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
          value === 'hh:mm:ss'
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Clock className="w-4 h-4" />
        <span>hh:mm:ss</span>
      </button>
      <button
        onClick={() => onChange('decimal')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
          value === 'decimal'
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Hash className="w-4 h-4" />
        <span>Decimal</span>
      </button>
    </div>
  );
}
