/**
 * Parse hh:mm:ss format to decimal hours
 */
export function parseHHMMSS(timeString: string): number {
  const parts = timeString.split(':').map(p => parseInt(p, 10) || 0);
  
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours + minutes / 60 + seconds / 3600;
  } else if (parts.length === 2) {
    const [hours, minutes] = parts;
    return hours + minutes / 60;
  } else if (parts.length === 1) {
    return parts[0];
  }
  
  return 0;
}

/**
 * Parse decimal hours string to number
 */
export function parseDecimal(decimalString: string): number {
  const parsed = parseFloat(decimalString);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Convert decimal hours to hh:mm:ss format
 */
export function decimalToHHMMSS(decimalHours: number): string {
  const totalSeconds = Math.round(decimalHours * 3600);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format decimal hours to display string
 */
export function formatDecimalHours(hours: number): string {
  return hours.toFixed(2);
}

/**
 * Validate hh:mm:ss format
 */
export function isValidHHMMSS(timeString: string): boolean {
  const regex = /^(\d{1,3}):([0-5]?\d):([0-5]?\d)$|^(\d{1,3}):([0-5]?\d)$|^(\d+)$/;
  return regex.test(timeString);
}

/**
 * Validate decimal format
 */
export function isValidDecimal(decimalString: string): boolean {
  const regex = /^\d*\.?\d*$/;
  return regex.test(decimalString) && decimalString !== '' && !isNaN(parseFloat(decimalString));
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currencySymbol: string): string {
  return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
