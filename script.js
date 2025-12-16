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
    // Momentum-Based Section Navigation
    // ==========================================
    const sections = ['hero', 'thesis', 'hardware', 'software', 'team'];
    let currentSectionIndex = 0;
    let isTransitioning = false;
    let scrollThreshold = 50; // Minimum delta to trigger section change
    let accumulatedDelta = 0;
    let lastScrollTime = Date.now();
    
    function getCurrentSection() {
        const scrollPos = window.pageYOffset + window.innerHeight / 2;
        
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section && scrollPos >= section.offsetTop) {
                return i;
            }
        }
        return 0;
    }
    
    function scrollToSection(index) {
        if (index < 0 || index >= sections.length || isTransitioning) return;
        
        const targetSection = document.getElementById(sections[index]);
        if (!targetSection) return;
        
        isTransitioning = true;
        currentSectionIndex = index;
        
        window.scrollTo({
            top: targetSection.offsetTop,
            behavior: 'smooth'
        });
        
        // Release lock after animation completes
        setTimeout(() => {
            isTransitioning = false;
            accumulatedDelta = 0;
        }, 1000);
    }
    
    function handleWheelScroll(event) {
        const scrollPos = window.pageYOffset;
        const heroSection = document.getElementById('hero');
        const teamSection = document.getElementById('team');
        const heroTop = heroSection ? heroSection.offsetTop : 0;
        const teamBottom = teamSection ? teamSection.offsetTop + teamSection.offsetHeight : 0;
        
        // Only apply scroll-jacking when within the hero-to-team range
        const inSectionRange = scrollPos >= heroTop && scrollPos <= teamBottom;
        
        if (!inSectionRange) {
            // Outside section range - allow natural scrolling
            accumulatedDelta = 0;
            return;
        }
        
        if (isTransitioning) {
            event.preventDefault();
            return;
        }
        
        const now = Date.now();
        const timeDelta = now - lastScrollTime;
        
        // Reset accumulation if too much time has passed (not a continuous gesture)
        if (timeDelta > 200) {
            accumulatedDelta = 0;
        }
        
        lastScrollTime = now;
        accumulatedDelta += event.deltaY;
        
        // Check if accumulated delta exceeds threshold
        if (Math.abs(accumulatedDelta) >= scrollThreshold) {
            currentSectionIndex = getCurrentSection();
            
            let targetIndex;
            if (accumulatedDelta > 0) {
                // Scrolling down
                targetIndex = currentSectionIndex + 1;
            } else {
                // Scrolling up
                targetIndex = currentSectionIndex - 1;
            }
            
            // Only prevent default and transition if target section exists
            if (targetIndex >= 0 && targetIndex < sections.length) {
                event.preventDefault();
                scrollToSection(targetIndex);
            } else {
                // Allow natural scrolling if trying to go beyond sections
                accumulatedDelta = 0;
            }
        }
    }
    
    // Add wheel event listener with passive: false for preventDefault
    window.addEventListener('wheel', handleWheelScroll, { passive: false });
    
    // Update current section on manual scroll (e.g., clicking side nav)
    window.addEventListener('scroll', () => {
        if (!isTransitioning) {
            currentSectionIndex = getCurrentSection();
        }
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
