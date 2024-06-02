import React, { useEffect } from 'react';

const ThemeToggle = () => {
    const toggleTheme = () => {
        const theme = localStorage.getItem('color-theme') === 'dark' || (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('color-theme', theme);
    };

    useEffect(() => {
        const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
        const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

        if (localStorage.getItem('color-theme') === 'dark' || (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            themeToggleLightIcon.classList.remove('hidden');
        } else {
            themeToggleDarkIcon.classList.remove('hidden');
        }
    }, []);

    return (
        <button id="theme-toggle" onClick={toggleTheme}>
            <span id="theme-toggle-dark-icon" className="hidden">🌙</span>
            <span id="theme-toggle-light-icon" className="hidden">☀️</span>
        </button>
    );
};

export default ThemeToggle;
