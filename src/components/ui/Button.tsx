import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-[#166534] hover:bg-[#14532d] text-white focus:ring-[#166534] shadow-sm hover:shadow active:scale-[0.99]';
      break;
    case 'accent':
      variantClasses =
        'bg-[#22c55e] hover:bg-[#16a34a] text-white focus:ring-[#22c55e] shadow-sm hover:shadow active:scale-[0.99]';
      break;
    case 'secondary':
      variantClasses =
        'bg-emerald-50 hover:bg-emerald-100 text-[#166534] border border-emerald-200 focus:ring-[#166534]';
      break;
    case 'outline':
      variantClasses =
        'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-slate-400';
      break;
    case 'ghost':
      variantClasses =
        'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300';
      break;
    case 'danger':
      variantClasses =
        'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm';
      break;
  }

  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'text-xs px-3 py-1.5 gap-1.5';
      break;
    case 'md':
      sizeClasses = 'text-sm px-4 py-2 gap-2';
      break;
    case 'lg':
      sizeClasses = 'text-base px-5 py-2.5 gap-2.5';
      break;
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
