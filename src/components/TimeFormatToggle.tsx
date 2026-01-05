import { TimeFormat } from '@/types/freelancer';
import { cn } from '@/lib/utils';
import { Clock, Hash } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TimeFormatToggleProps {
  value: TimeFormat;
  onChange: (format: TimeFormat) => void;
}

export function TimeFormatToggle({ value, onChange }: TimeFormatToggleProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Example: 02:34:10</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Example: 10.34</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}