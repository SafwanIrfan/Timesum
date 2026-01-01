import { Input } from '@/components/ui/input';
import { Currency } from '@/types/freelancer';

interface HourlyRateInputProps {
  value: string;
  onChange: (value: string) => void;
  currency: Currency;
}

export function HourlyRateInput({ value, onChange, currency }: HourlyRateInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
        {currency.symbol}
      </span>
      <Input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className="pl-10 bg-card border-border h-12 text-base"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
        /hour
      </span>
    </div>
  );
}
