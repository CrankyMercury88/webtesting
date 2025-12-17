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
    // Logo Click Handler - Scroll to Top
    // ==========================================
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==========================================
    // Side Navigation Visibility and Active States
    // ==========================================
    const sideNav = document.getElementById('sideNav');
    const navSections = ['thesis', 'hardware', 'software', 'team'];
    const sideNavDots = document.querySelectorAll('.side-nav-dot');
    
    // Show/hide side nav based on whether we're in content sections
    const navVisibilityObserver = new IntersectionObserver((entries) => {
        let inContentSection = false;
        
        entries.forEach(entry => {
            const sectionId = entry.target.id;
            if (navSections.includes(sectionId) && entry.isIntersecting) {
                inContentSection = true;
            }
        });
        
        if (inContentSection) {
            sideNav.classList.add('visible');
        } else {
            // Check if any content section is currently visible
            const anyVisible = navSections.some(id => {
                const section = document.getElementById(id);
                if (!section) return false;
                const rect = section.getBoundingClientRect();
                return rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2;
            });
            
            if (!anyVisible) {
                sideNav.classList.remove('visible');
            }
        }
    }, {
        threshold: 0.3,
        rootMargin: '-20% 0px -20% 0px'
    });
    
    // Track active section for highlighting
    const activeNavObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const sectionId = entry.target.id;
            const navDot = document.querySelector(`.side-nav-dot[data-section="${sectionId}"]`);
            
            if (entry.isIntersecting && navDot) {
                // Remove active from all dots
                sideNavDots.forEach(dot => dot.classList.remove('active'));
                // Add active to current
                navDot.classList.add('active');
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
    });
    
    // Observe all content sections
    navSections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            navVisibilityObserver.observe(section);
            activeNavObserver.observe(section);
        }
    });
    
    // Handle side nav dot clicks
    sideNavDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = dot.getAttribute('href').replace('#', '');
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
    // Fade-In Animations for Sections
    // ==========================================
    const sectionContainers = document.querySelectorAll('.section-container');
    const deviceContainer = document.querySelector('.device-image-container');
    
    const animatedElements = new Set();
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animatedElements.has(entry.target)) {
                entry.target.classList.add('visible');
                
                // Also add visible to child elements for staggered reveals
                const header = entry.target.querySelector('.section-header');
                const content = entry.target.querySelector('.section-content');
                
                if (header) {
                    header.classList.add('visible');
                }
                if (content) {
                    content.classList.add('visible');
                }
                
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
    // Scroll-Based Opacity Fade (Spotlight Effect)
    // ==========================================
    function updateScrollOpacity() {
        const viewportHeight = window.innerHeight;
        const viewportCenter = viewportHeight / 2;
        const fadeRange = viewportHeight * 0.35; // Fade zone is 35% from top/bottom
        
        sectionContainers.forEach(container => {
            const rect = container.getBoundingClientRect();
            const elementCenter = rect.top + (rect.height / 2);
            
            // Calculate distance from viewport center
            const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
            
            // Calculate opacity (1.0 at center, fades to 0.3 at edges)
            let opacity;
            if (distanceFromCenter < fadeRange) {
                opacity = 1.0;
            } else {
                const fadeProgress = (distanceFromCenter - fadeRange) / (viewportHeight - fadeRange);
                opacity = Math.max(0.3, 1.0 - (fadeProgress * 0.7));
            }
            
            container.style.opacity = opacity;
        });
    }
    
    // Throttle scroll events for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(updateScrollOpacity);
    });
    
    // Initial opacity update
    updateScrollOpacity();

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

    // ==========================================
    // Hero Text Fade on Scroll
    // ==========================================
    function updateHeroFade() {
        const leftText = document.querySelector('.left-content');
        const rightText = document.querySelector('.right-content');
        
        if (!leftText || !rightText) {
            console.warn('Hero text elements not found');
            return;
        }
        
        const elements = [leftText, rightText];
        const vh = window.innerHeight;
        
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const top = rect.top;
            
            // Early fade zone: start at 70vh, end at 8vh
            // Text completely disappears well before reaching header
            const fadeStart = vh * 0.70;
            const fadeEnd = vh * 0.08;
            
            let opacity = 1;
            
            if (top <= fadeEnd) {
                // Above fade end - invisible
                opacity = 0;
            } else if (top < fadeStart) {
                // In fade zone - use quartic ease-out for smooth transition
                const range = fadeStart - fadeEnd;
                const distance = top - fadeEnd;
                const progress = distance / range;
                
                // Quartic ease-out: extremely smooth, no visible threshold
                opacity = 1 - Math.pow(1 - progress, 4);
            }
            // Below fade start - fully visible (opacity = 1)
            
            el.style.opacity = opacity.toString();
        });
    }
    
    // Attach scroll listener
    window.addEventListener('scroll', updateHeroFade, { passive: true });
    
    // Initial call after animations complete (right-content finishes at 2s)
    setTimeout(() => {
        // Remove animation fill so JavaScript can control opacity
        const leftText = document.querySelector('.left-content');
        const rightText = document.querySelector('.right-content');
        
        if (leftText) {
            leftText.style.animation = 'none';
            leftText.style.transform = 'translateX(0)';
        }
        if (rightText) {
            rightText.style.animation = 'none';
            rightText.style.transform = 'translateX(0)';
        }
        
        updateHeroFade();
        console.log('Hero fade initialized');
    }, 2100);

    console.log('Script initialization complete');
});

// Handle hash navigation from external pages
window.addEventListener('load', function() {
    if (window.location.hash) {
        // Small delay to ensure page is fully loaded
        setTimeout(function() {
            const target = document.querySelector(window.location.hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
});

