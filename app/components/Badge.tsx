import React from 'react';

type BadgeType = 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  type?: BadgeType;
  className?: string;
}

export default function Badge({
  children,
  type = 'info',
  className = '',
}: BadgeProps) {
  const typeClass = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
  }[type];

  return <span className={`badge ${typeClass} ${className}`}>{children}</span>;
}
