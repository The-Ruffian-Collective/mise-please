import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
  gradientType?: 'primary' | 'success' | 'warning' | 'danger' | 'vibrant' | 'cool';
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  size = 'md',
  gradient = false,
  gradientType = 'primary',
  onClick,
}: CardProps) {
  const sizeClass = {
    sm: 'card-sm',
    md: 'card',
    lg: 'card-lg',
  }[size];

  const gradientClass = gradient
    ? `bg-gradient-to-br ${
        {
          primary: 'from-purple-400 to-purple-700',
          success: 'from-green-400 to-green-700',
          warning: 'from-amber-400 to-orange-700',
          danger: 'from-red-400 to-red-700',
          vibrant: 'from-red-400 via-pink-500 to-pink-600',
          cool: 'from-cyan-400 to-cyan-700',
        }[gradientType]
      } text-white border-0`
    : '';

  return (
    <div
      className={`${sizeClass} ${gradientClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}
