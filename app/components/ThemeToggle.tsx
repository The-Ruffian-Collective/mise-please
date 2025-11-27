'use client'

import { useTheme } from '@/lib/theme-context'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300 group"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-7 h-7">
        {/* Burner base - always visible */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute inset-0 w-full h-full"
        >
          {/* Burner ring */}
          <circle
            cx="12"
            cy="16"
            r="8"
            stroke="currentColor"
            strokeWidth="1.5"
            className="opacity-40"
          />
          <circle
            cx="12"
            cy="16"
            r="5"
            stroke="currentColor"
            strokeWidth="1.5"
            className="opacity-40"
          />
        </svg>

        {/* Flame - animated */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`absolute inset-0 w-full h-full transition-all duration-500 ${
            isDark
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-50 -rotate-90'
          }`}
        >
          {/* Outer flame */}
          <path
            d="M12 3C12 3 9 6 9 9C9 11 10 12 11 13C10 13.5 9 14 9 16C9 18.5 10.5 20 12 20C13.5 20 15 18.5 15 16C15 14 14 13.5 13 13C14 12 15 11 15 9C15 6 12 3 12 3Z"
            fill="currentColor"
            className="text-orange-400 opacity-60"
          />
          {/* Inner flame */}
          <path
            d="M12 6C12 6 10.5 8 10.5 9.5C10.5 10.5 11 11 11.5 11.5C11 11.8 10.5 12.2 10.5 13.5C10.5 15 11.5 16 12 16C12.5 16 13.5 15 13.5 13.5C13.5 12.2 13 11.8 12.5 11.5C13 11 13.5 10.5 13.5 9.5C13.5 8 12 6 12 6Z"
            fill="currentColor"
            className="text-orange-300"
          />
          {/* Core flame */}
          <path
            d="M12 9C12 9 11.5 10 11.5 11C11.5 11.8 12 12.5 12 12.5C12 12.5 12.5 11.8 12.5 11C12.5 10 12 9 12 9Z"
            fill="currentColor"
            className="text-yellow-200"
          />
        </svg>

        {/* Light rays - shown in light mode */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`absolute inset-0 w-full h-full transition-all duration-500 ${
            !isDark
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-50 rotate-90'
          }`}
        >
          {/* Center circle */}
          <circle
            cx="12"
            cy="12"
            r="3"
            fill="currentColor"
            className="text-amber-500"
          />
          {/* Rays */}
          <g className="text-amber-500">
            <line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="20" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="1" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* Subtle hover effect */}
      <div className="absolute inset-0 rounded-lg group-hover:ring-1 group-hover:ring-[var(--border)] transition-all" />
    </button>
  )
}
