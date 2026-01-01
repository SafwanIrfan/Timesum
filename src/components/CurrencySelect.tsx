import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Currency, CURRENCIES } from '@/types/freelancer';

interface CurrencySelectProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

export function CurrencySelect({ value, onChange }: CurrencySelectProps) {
  return (
    <Select
      value={value.code}
      onValueChange={(code) => {
        const currency = CURRENCIES.find(c => c.code === code);
        if (currency) onChange(currency);
      }}
    >
      <SelectTrigger className="w-full bg-card border-border">
        <SelectValue placeholder="Select currency">
          <span className="flex items-center gap-2">
            <span className="font-medium">{value.symbol}</span>
            <span>{value.code}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {CURRENCIES.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <span className="flex items-center gap-2">
              <span className="font-medium w-8">{currency.symbol}</span>
              <span>{currency.code}</span>
              <span className="text-muted-foreground">- {currency.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
