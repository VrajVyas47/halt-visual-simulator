import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

interface ThemeToggleProps {
  variant?: 'header' | 'sidebar' | 'standalone';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggleTheme}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer group border ${
          isDark
            ? 'bg-surface-low border-surface-highest/40 text-cream-dim hover:text-white hover:bg-surface hover:border-surface-highest'
            : 'bg-surface-low border-surface-highest/50 text-cream-dim hover:text-cream-light hover:bg-surface-high hover:border-surface-highest'
        } ${className}`}
        title={
          isDark
            ? 'Theme: DARK // Switch to Academic Light Mode [Alt+T]'
            : 'Theme: LIGHT // Switch to Cyber-Obsidian Dark Mode [Alt+T]'
        }
        aria-label="Toggle dark/light theme"
        type="button"
      >
        <span className="relative flex items-center justify-center">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-300 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-cream-light group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          )}
        </span>
      </button>
    );
  }

  // Header / default variant (w-8 h-8 rounded-full)
  return (
    <button
      onClick={toggleTheme}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer group border ${
        isDark
          ? 'bg-surface-low border-surface-highest/50 text-cream-dim hover:text-white hover:bg-surface hover:border-amber-400/40'
          : 'bg-surface-low border-surface-highest/60 text-cream-dim hover:text-cream-light hover:bg-surface-high hover:border-surface-highest'
      } ${className}`}
      title={
        isDark
          ? 'Theme: DARK // Switch to Academic Light Mode [Alt+T]'
          : 'Theme: LIGHT // Switch to Cyber-Obsidian Dark Mode [Alt+T]'
      }
      aria-label="Toggle dark/light theme"
      type="button"
    >
      <span className="relative flex items-center justify-center">
        {isDark ? (
          <Sun className="w-3.5 h-3.5 text-amber-300/90 group-hover:text-amber-300 group-hover:rotate-45 group-hover:scale-110 transition-all duration-300" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-cream-light group-hover:-rotate-12 group-hover:scale-110 transition-all duration-300" />
        )}
      </span>
    </button>
  );
};
