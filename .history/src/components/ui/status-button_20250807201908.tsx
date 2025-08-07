import React from 'react';
import { Clock, CheckCircle, XCircle, Play, Pause, AlertCircle, UserCheck, UserX, BookOpen } from 'lucide-react';

interface StatusButtonProps {
  status: 'Pending' | 'Completed' | 'Missed' | 'Active' | 'Scheduled' | 'Ongoing' | 'Cancelled' | 'Ready' | 'enrolled' | 'dropped';
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
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
        return {
          icon: Clock,
          bgColor: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30',
          textColor: 'text-amber-700 dark:text-amber-300',
          borderColor: 'border-amber-200 hover:border-amber-300 dark:border-amber-700 dark:hover:border-amber-600',
          ringColor: 'focus:ring-amber-200 dark:focus:ring-amber-700',
          iconColor: 'text-amber-600 dark:text-amber-400'
        };
      
      case 'scheduled':
        return {
          icon: Clock,
          bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
          textColor: 'text-blue-700 dark:text-blue-300',
          borderColor: 'border-blue-200 hover:border-blue-300 dark:border-blue-700 dark:hover:border-blue-600',
          ringColor: 'focus:ring-blue-200 dark:focus:ring-blue-700',
          iconColor: 'text-blue-600 dark:text-blue-400'
        };

      case 'ongoing':
        return {
          icon: Play,
          bgColor: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30',
          textColor: 'text-indigo-700 dark:text-indigo-300',
          borderColor: 'border-indigo-200 hover:border-indigo-300 dark:border-indigo-700 dark:hover:border-indigo-600',
          ringColor: 'focus:ring-indigo-200 dark:focus:ring-indigo-700',
          iconColor: 'text-indigo-600 dark:text-indigo-400'
        };

      case 'active':
        return {
          icon: CheckCircle,
          bgColor: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30',
          textColor: 'text-emerald-700 dark:text-emerald-300',
          borderColor: 'border-emerald-200 hover:border-emerald-300 dark:border-emerald-700 dark:hover:border-emerald-600',
          ringColor: 'focus:ring-emerald-200 dark:focus:ring-emerald-700',
          iconColor: 'text-emerald-600 dark:text-emerald-400'
        };

      case 'ready':
        return {
          icon: AlertCircle,
          bgColor: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30',
          textColor: 'text-green-700 dark:text-green-300',
          borderColor: 'border-green-200 hover:border-green-300 dark:border-green-700 dark:hover:border-green-600',
          ringColor: 'focus:ring-green-200 dark:focus:ring-green-700',
          iconColor: 'text-green-600 dark:text-green-400'
        };

      case 'completed':
        return {
          icon: CheckCircle,
          bgColor: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30',
          textColor: 'text-emerald-700 dark:text-emerald-300',
          borderColor: 'border-emerald-200 hover:border-emerald-300 dark:border-emerald-700 dark:hover:border-emerald-600',
          ringColor: 'focus:ring-emerald-200 dark:focus:ring-emerald-700',
          iconColor: 'text-emerald-600 dark:text-emerald-400'
        };

      case 'enrolled':
        return {
          icon: UserCheck,
          bgColor: 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/30',
          textColor: 'text-teal-700 dark:text-teal-300',
          borderColor: 'border-teal-200 hover:border-teal-300 dark:border-teal-700 dark:hover:border-teal-600',
          ringColor: 'focus:ring-teal-200 dark:focus:ring-teal-700',
          iconColor: 'text-teal-600 dark:text-teal-400'
        };

      case 'missed':
        return {
          icon: XCircle,
          bgColor: 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/30',
          textColor: 'text-rose-700 dark:text-rose-300',
          borderColor: 'border-rose-200 hover:border-rose-300 dark:border-rose-700 dark:hover:border-rose-600',
          ringColor: 'focus:ring-rose-200 dark:focus:ring-rose-700',
          iconColor: 'text-rose-600 dark:text-rose-400'
        };

      case 'cancelled':
        return {
          icon: Pause,
          bgColor: 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800/70',
          textColor: 'text-gray-700 dark:text-gray-300',
          borderColor: 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500',
          ringColor: 'focus:ring-gray-200 dark:focus:ring-gray-600',
          iconColor: 'text-gray-600 dark:text-gray-400'
        };

      case 'dropped':
        return {
          icon: UserX,
          bgColor: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30',
          textColor: 'text-orange-700 dark:text-orange-300',
          borderColor: 'border-orange-200 hover:border-orange-300 dark:border-orange-700 dark:hover:border-orange-600',
          ringColor: 'focus:ring-orange-200 dark:focus:ring-orange-700',
          iconColor: 'text-orange-600 dark:text-orange-400'
        };

      default:
        return {
          icon: Clock,
          bgColor: 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800/70',
          textColor: 'text-gray-700 dark:text-gray-300',
          borderColor: 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500',
          ringColor: 'focus:ring-gray-200 dark:focus:ring-gray-600',
          iconColor: 'text-gray-600 dark:text-gray-400'
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

  // Capitalize first letter for display
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

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
      <span className="font-semibold">{displayStatus}</span>
    </button>
  );
};