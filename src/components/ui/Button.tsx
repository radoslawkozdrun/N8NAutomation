import React from 'react';
import Icon from '../AppIcon';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconName?: string;
  children?: React.ReactNode;
}

function Button({
  className,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled,
  iconName,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  const sizes = {
    xs: 'h-7 rounded px-2 text-xs',
    sm: 'h-8 rounded-md px-3 text-sm',
    md: 'h-9 px-4 py-2 text-sm',
    lg: 'h-10 rounded-md px-8 text-base',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {iconName && !loading && (
        <Icon name={iconName} size={16} className={children ? 'mr-2' : ''} />
      )}
      {children}
    </button>
  );
}

export default Button;