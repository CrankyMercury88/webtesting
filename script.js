console.log('Evergreen Health - Scroll Snap Version');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');

    // ==========================================
    // Theme Toggle
    // ==========================================
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', currentTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // ==========================================
    // Fade-In Animations for Sections
    // ==========================================
    const sectionContainers = document.querySelectorAll('.section-container');
    const deviceContainer = document.querySelector('.device-image-container');
    
    const animatedElements = new Set();
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animatedElements.has(entry.target)) {
                entry.target.classList.add('visible');
                animatedElements.add(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px'
    });

    sectionContainers.forEach(container => {
        fadeInObserver.observe(container);
    });
    
    if (deviceContainer) {
        fadeInObserver.observe(deviceContainer);
    }

    // ==========================================
    // Smooth Scroll for Navigation Links
    // ==========================================
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').replace('#', '');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ==========================================
    // Mission Rotator with Typewriter Effect
    // ==========================================
    const missionTexts = [
        'Save 30M lives each year',
        'Manage 2B cases of chronic inflammation',
        'Extend the average healthspan past 100 years',
        'Save $2T in healthcare costs',
        'Stop Chronic Inflammation'
    ];

    const missionRotator = document.getElementById('missionRotator');
    
    if (!missionRotator) {
        console.error('Mission rotator element not found');
        return;
    }
    
    let currentMissionIndex = 0;
    let currentText = '';
    let charIndex = 0;
    let isDeleting = false;

    missionRotator.innerHTML = '<div class="mission-item active typewriter"></div>';
    const displayElement = missionRotator.querySelector('.typewriter');

    const cursor = document.createElement('span');
    cursor.className = 'cursor';

    function typeWriter() {
        if (currentMissionIndex >= missionTexts.length) {
            cursor.remove();
            return;
        }

        const fullText = missionTexts[currentMissionIndex];
        
        if (!isDeleting && charIndex <= fullText.length) {
            currentText = fullText.substring(0, charIndex);
            displayElement.textContent = currentText;
            displayElement.appendChild(cursor);
            charIndex++;
            
            if (charIndex > fullText.length) {
                setTimeout(() => {
                    if (currentMissionIndex < missionTexts.length - 1) {
                        isDeleting = true;
                        typeWriter();
                    }
                }, 3000);
            } else {
                setTimeout(typeWriter, 90);
            }
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            currentText = fullText.substring(0, charIndex);
            displayElement.textContent = currentText;
            displayElement.appendChild(cursor);
            
            if (charIndex === 0) {
                isDeleting = false;
                currentMissionIndex++;
                setTimeout(typeWriter, 200);
            } else {
                setTimeout(typeWriter, 50);
            }
        }
    }

    setTimeout(() => {
        console.log('Starting typewriter animation');
        typeWriter();
    }, 1500);

    console.log('Script initialization complete');
});
