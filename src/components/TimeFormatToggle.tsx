import { TimeFormat } from "@/types/freelancer";
import { cn } from "@/lib/utils";
import { Clock, Hash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TimeFormatToggleProps {
  value: TimeFormat;
  onChange: (format: TimeFormat) => void;
}

export function TimeFormatToggle({ value, onChange }: TimeFormatToggleProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1 bg-secondary rounded-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onChange("hh:mm:ss")}
              className={cn(
                "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200",
                value === "hh:mm:ss"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">hh:mm:ss</span>
              <span className="xs:hidden">H:M:S</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>02:23:30</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onChange("decimal")}
              className={cn(
                "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200",
                value === "decimal"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Decimal</span>
              <span className="xs:hidden">Dec</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>2.39</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
