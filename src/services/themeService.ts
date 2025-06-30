/**
 * Theme Service
 * 
 * This module provides theme management functionality for dark/light mode toggle.
 * It handles theme persistence and system preference detection.
 */

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'password-generator-theme';

/**
 * Gets the current theme from localStorage or defaults to system preference
 */
export function getCurrentTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
  return stored || 'system';
}

/**
 * Sets the theme and persists it to localStorage
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

/**
 * Applies the theme to the document
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    // Use system preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

/**
 * Toggles between light and dark themes
 */
export function toggleTheme(): Theme {
  const current = getCurrentTheme();
  let newTheme: Theme;
  
  if (current === 'light') {
    newTheme = 'dark';
  } else if (current === 'dark') {
    newTheme = 'system';
  } else {
    newTheme = 'light';
  }
  
  setTheme(newTheme);
  return newTheme;
}

/**
 * Initializes theme on page load
 */
export function initializeTheme(): void {
  if (typeof window === 'undefined') return;
  
  const theme = getCurrentTheme();
  applyTheme(theme);
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const currentTheme = getCurrentTheme();
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  });
}

/**
 * Gets the display name for a theme
 */
export function getThemeDisplayName(theme: Theme): string {
  switch (theme) {
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    case 'system':
      return 'System';
    default:
      return 'System';
  }
}