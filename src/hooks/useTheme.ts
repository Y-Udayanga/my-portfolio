import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check if user has previously saved a theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Default to dark theme — the 2030 futuristic look is designed for dark mode
    return 'dark';
  });

  useEffect(() => {
    // Apply theme to document element
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    // Save to local storage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}
