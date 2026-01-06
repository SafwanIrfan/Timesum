import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success';
  className?: string;
}

export function SummaryCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  variant = 'default',
  className 
}: SummaryCardProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-lg",
        variant === 'default' && "bg-card border border-border",
        variant === 'primary' && "bg-gradient-primary text-primary-foreground shadow-glow",
        variant === 'success' && "bg-success text-success-foreground",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <p className={cn(
            "text-sm font-medium",
            variant === 'default' ? "text-muted-foreground" : "opacity-90"
          )}>
            {title}
          </p>
          <p className="text-2xl md:text-3xl font-display font-bold tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-sm",
              variant === 'default' ? "text-muted-foreground" : "opacity-75"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-lg flex-shrink-0",
          variant === 'default' && "bg-accent text-accent-foreground",
          variant === 'primary' && "bg-primary-foreground/20",
          variant === 'success' && "bg-success-foreground/20"
        )}>
          <div className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
