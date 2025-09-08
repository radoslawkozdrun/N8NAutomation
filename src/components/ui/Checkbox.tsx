import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  className,
  id
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          onClick={() => !disabled && onChange?.(!checked)}
          className={cn(
            "w-4 h-4 border-2 rounded cursor-pointer transition-colors",
            checked 
              ? "bg-blue-600 border-blue-600" 
              : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {checked && (
            <Check className="w-3 h-3 text-white absolute top-0 left-0" />
          )}
        </div>
      </div>
      {label && (
        <label 
          htmlFor={id}
          className={cn(
            "ml-2 text-sm text-gray-700 dark:text-gray-300",
            !disabled && "cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}

export default Checkbox;