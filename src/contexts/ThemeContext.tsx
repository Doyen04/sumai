import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { ThemeContext } from './themeContextDef';

type Theme = 'light' | 'dark';

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Check localStorage first
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') {
            return stored;
        }
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setThemeState(prev => prev === 'light' ? 'dark' : 'light');
    }, []);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
