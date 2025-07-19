import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatusButtonProps {
  status: 'Pending' | 'Completed' | 'Missed';
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusButton: React.FC<StatusButtonProps> = ({ 
  status, 
  onClick, 
  disabled = false, 
  size = 'md' 
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pending':
        return {
          icon: Clock,
          bgColor: 'bg-amber-50 hover:bg-amber-100',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200 hover:border-amber-300',
          ringColor: 'focus:ring-amber-200',
          iconColor: 'text-amber-600'
        };
      case 'Completed':
        return {
          icon: CheckCircle,
          bgColor: 'bg-emerald-50 hover:bg-emerald-100',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200 hover:border-emerald-300',
          ringColor: 'focus:ring-emerald-200',
          iconColor: 'text-emerald-600'
        };
      case 'Missed':
        return {
          icon: XCircle,
          bgColor: 'bg-rose-50 hover:bg-rose-100',
          textColor: 'text-rose-700',
          borderColor: 'border-rose-200 hover:border-rose-300',
          ringColor: 'focus:ring-rose-200',
          iconColor: 'text-rose-600'
        };
      default:
        return {
          icon: Clock,
          bgColor: 'bg-gray-50 hover:bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200 hover:border-gray-300',
          ringColor: 'focus:ring-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const getSizeConfig = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          padding: 'px-2 py-1',
          textSize: 'text-xs',
          iconSize: 'w-3 h-3',
          gap: 'gap-1'
        };
      case 'lg':
        return {
          padding: 'px-4 py-2.5',
          textSize: 'text-base',
          iconSize: 'w-5 h-5',
          gap: 'gap-2'
        };
      default:
        return {
          padding: 'px-3 py-1.5',
          textSize: 'text-sm',
          iconSize: 'w-4 h-4',
          gap: 'gap-1.5'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeConfig = getSizeConfig(size);
  const Icon = config.icon;

  const baseClasses = `
    inline-flex items-center justify-center
    ${sizeConfig.padding} ${sizeConfig.gap}
    ${sizeConfig.textSize} font-medium
    rounded border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    ${config.bgColor} ${config.textColor} ${config.borderColor} ${config.ringColor}
    ${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer' : 'cursor-default'}
  `;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      type="button"
    >
      <Icon className={`${sizeConfig.iconSize} ${config.iconColor}`} />
      <span className="font-semibold">{status}</span>
    </button>
  );
};

 