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
        "relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:shadow-lg",
        variant === 'default' && "bg-card border border-border",
        variant === 'primary' && "bg-gradient-primary text-primary-foreground shadow-glow",
        variant === 'success' && "bg-success text-success-foreground",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === 'default' ? "text-muted-foreground" : "opacity-90"
          )}>
            {title}
          </p>
          <p className="text-3xl font-display font-bold tracking-tight">
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
          "p-3 rounded-lg",
          variant === 'default' && "bg-accent text-accent-foreground",
          variant === 'primary' && "bg-primary-foreground/20",
          variant === 'success' && "bg-success-foreground/20"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
