import React from 'react';
import { Package, Box, Coins, Wine, Sprout, Cpu, Layers, Sparkles } from 'lucide-react';

interface MaterialTagProps {
  categoryName: string;
  categoryId?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const MaterialTag: React.FC<MaterialTagProps> = ({
  categoryName,
  categoryId = '',
  size = 'md',
  className = '',
}) => {
  const getIcon = () => {
    switch (categoryId) {
      case 'pet_plastic':
      case 'other_plastic':
        return <Package className="w-3.5 h-3.5 text-sky-600" />;
      case 'cardboard':
        return <Box className="w-3.5 h-3.5 text-amber-700" />;
      case 'aluminum':
        return <Coins className="w-3.5 h-3.5 text-slate-700" />;
      case 'glass':
        return <Wine className="w-3.5 h-3.5 text-emerald-700" />;
      case 'organics':
        return <Sprout className="w-3.5 h-3.5 text-green-700" />;
      case 'e_waste':
        return <Cpu className="w-3.5 h-3.5 text-purple-700" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getStyle = () => {
    switch (categoryId) {
      case 'pet_plastic':
      case 'other_plastic':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'cardboard':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'aluminum':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'glass':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'organics':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'e_waste':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium ${getStyle()} ${sizeClasses} ${className}`}
    >
      {getIcon()}
      <span>{categoryName}</span>
    </span>
  );
};
