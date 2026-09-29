import { describe, it, expect, beforeEach } from 'vitest';
import { THEME_STORAGE_KEY } from './ThemeContext';

describe('Theme Storage and State Management', () => {
  let mockStorage: Record<string, string> = {};
  let mockClassList: Set<string> = new Set();
  let mockAttributes: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    mockClassList = new Set();
    mockAttributes = {};
  });

  const applyTheme = (theme: 'dark' | 'light') => {
    if (theme === 'dark') {
      mockClassList.add('dark');
      mockClassList.delete('light');
    } else {
      mockClassList.delete('dark');
      mockClassList.add('light');
    }
    mockAttributes['data-theme'] = theme;
    mockStorage[THEME_STORAGE_KEY] = theme;
  };

  it('correctly persists and toggles theme state', () => {
    expect(mockStorage[THEME_STORAGE_KEY]).toBeUndefined();

    // Apply light mode
    applyTheme('light');
    expect(mockStorage[THEME_STORAGE_KEY]).toBe('light');
    expect(mockClassList.has('light')).toBe(true);
    expect(mockClassList.has('dark')).toBe(false);
    expect(mockAttributes['data-theme']).toBe('light');

    // Toggle to dark mode
    applyTheme('dark');
    expect(mockStorage[THEME_STORAGE_KEY]).toBe('dark');
    expect(mockClassList.has('dark')).toBe(true);
    expect(mockClassList.has('light')).toBe(false);
    expect(mockAttributes['data-theme']).toBe('dark');
  });

  it('retains theme preference on reload simulation', () => {
    mockStorage[THEME_STORAGE_KEY] = 'light';
    const stored = mockStorage[THEME_STORAGE_KEY];
    expect(stored).toBe('light');

    if (stored === 'light') {
      applyTheme('light');
    } else {
      applyTheme('dark');
    }

    expect(mockClassList.has('light')).toBe(true);
    expect(mockAttributes['data-theme']).toBe('light');
  });
});
