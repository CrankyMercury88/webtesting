console.log('Evergreen Health - Legal Page');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - Legal page');

    // ==========================================
    // Theme Toggle
    // ==========================================
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    if (themeToggle) {
        // Apply saved theme or default to dark
        const currentTheme = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', currentTheme);
        console.log('Applied theme:', currentTheme);

        // Toggle theme on button click
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            console.log('Theme changed to:', newTheme);
        });
    } else {
        console.error('Theme toggle button not found');
    }
});
