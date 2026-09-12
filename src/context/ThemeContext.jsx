import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 1. Check saved theme preference in localStorage
    const saved = localStorage.getItem('kweshun_theme') || localStorage.getItem('theme');
    if (saved !== null && saved !== undefined) {
      return saved === 'dark';
    }
    // 2. Default to Dark Mode on first visit (per project requirements)
    return true;
  });

  useEffect(() => {
    const themeName = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('kweshun_theme', themeName);
    localStorage.setItem('theme', themeName);

    const root = document.documentElement;
    const body = document.body;

    if (isDarkMode) {
      root.classList.remove('light');
      root.classList.add('dark');
      body.classList.remove('light');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark');
      body.classList.add('light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const setDarkMode = (val) => setIsDarkMode(Boolean(val));
  const setTheme = (themeName) => setIsDarkMode(themeName === 'dark');

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        theme: isDarkMode ? 'dark' : 'light',
        toggleTheme,
        setDarkMode,
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
