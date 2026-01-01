import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const requirements: PasswordRequirement[] = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains a number', met: /[0-9]/.test(password) },
    { label: 'Contains special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (metCount === 0) return { level: 0, label: '', color: '' };
    if (metCount <= 2) return { level: 1, label: 'Weak', color: 'bg-destructive' };
    if (metCount <= 3) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (metCount <= 4) return { level: 3, label: 'Good', color: 'bg-blue-500' };
    return { level: 4, label: 'Strong', color: 'bg-green-500' };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2 animate-fade-in">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={`font-medium ${
            strength.level === 1 ? 'text-destructive' :
            strength.level === 2 ? 'text-yellow-500' :
            strength.level === 3 ? 'text-blue-500' :
            strength.level === 4 ? 'text-green-500' : ''
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                level <= strength.level ? strength.color : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 gap-1">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 text-xs transition-colors ${
              req.met ? 'text-green-500' : 'text-muted-foreground'
            }`}
          >
            {req.met ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function validatePasswordStrength(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain an uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain a lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain a number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must contain a special character' };
  }
  return { isValid: true, message: '' };
}