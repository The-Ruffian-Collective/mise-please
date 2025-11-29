import React from 'react';

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export default function FilterPill({ label, active, onClick, icon }: FilterPillProps) {
  return (
    <button
      className={`filter-pill ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
}
