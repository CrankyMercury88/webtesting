console.log('Script loaded successfully');
console.log('🚨 NEW VERSION 3 LOADED 🚨');
console.log('Timestamp:', new Date().toISOString());

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    if (!themeToggle) {
        console.error('Theme toggle button not found!');
    } else {
        console.log('Theme toggle button found');
        
        // Check for saved theme preference or default to 'dark'
        const currentTheme = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', currentTheme);
        console.log('Initial theme:', currentTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            console.log('Theme changed to:', newTheme);
        });
    }

    // Horizontal Scroll System WITH Freeze Zones
    const horizontalContainer = document.querySelector('.horizontal-scroll-container');
    const horizontalWrapper = document.querySelector('.horizontal-scroll-wrapper');
    const horizontalSections = document.querySelectorAll('.horizontal-section');
    
    // Detect mobile
    const isMobile = window.innerWidth <= 768;

    // Freeze zone configuration
    const FREEZE_SCROLL_AMOUNT = window.innerHeight * 0.75; // 0.75vh total: 0.5vh line animation + 0.25vh post-freeze
    const numSections = horizontalSections.length;
    
    // Calculate scroll zones
    // Each section gets: travel distance + freeze distance
    const travelDistancePerSection = window.innerWidth * 0.5; // 50% less distance to travel
    const totalDistancePerSection = travelDistancePerSection + FREEZE_SCROLL_AMOUNT;
    const totalHorizontalScroll = numSections * totalDistancePerSection;
    
    // Update wrapper height
    if (!isMobile && horizontalWrapper) {
        horizontalWrapper.style.minHeight = `${window.innerHeight + totalHorizontalScroll}px`;
    }

    // Cache target heights for each section at initialization
    const sectionTargetHeights = new Map();
    
    function initializeSectionHeights() {
        horizontalSections.forEach((section, idx) => {
            const prefix = section.querySelector('.section-prefix');
            const content = section.querySelector('.section-content');
            if (!prefix || !content) return;
            
            const sectionRect = section.getBoundingClientRect();
            const prefixRect = prefix.getBoundingClientRect();
            const contentRect = content.getBoundingClientRect();
            
            const prefixTop = prefixRect.top - sectionRect.top;
            const contentBottom = contentRect.bottom - sectionRect.top;
            const targetHeight = contentBottom - prefixTop;
            
            // Debug logging
            console.log(`Section ${idx} (${section.id}):`, {
                prefixTop: prefixTop.toFixed(2),
                contentBottom: contentBottom.toFixed(2),
                targetHeight: targetHeight.toFixed(2),
                contentRectHeight: contentRect.height.toFixed(2)
            });
            
            sectionTargetHeights.set(section, {
                prefixTop: prefixTop,
                targetHeight: targetHeight
            });
        });
    }

    function positionProgressLine(section) {
        const progressLine = section.querySelector('.section-progress-line');
        if (!progressLine) return;
        
        const heights = sectionTargetHeights.get(section);
        if (!heights) return;
        
        progressLine.style.top = `${heights.prefixTop}px`;
        progressLine.style.bottom = 'auto';
    }
    
    function getContentBoxHeight(section) {
        const heights = sectionTargetHeights.get(section);
        return heights ? heights.targetHeight : 0;
    }

    // Initialize section heights after a brief delay to ensure fonts and layout are complete
    setTimeout(() => {
        initializeSectionHeights();
        
        // Position all progress lines on load
        horizontalSections.forEach(section => {
            positionProgressLine(section);
        });
    }, 100);

    function updateScroll() {
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        // Handle navigation dots visibility (works on all viewports)
        const navDotsContainer = document.querySelector('.section-nav-dots');
        if (navDotsContainer) {
            // Show dots only while in horizontal sections area (on desktop only)
            const inHorizontalArea = !isMobile && scrollY >= windowHeight && scrollY < (windowHeight + totalHorizontalScroll);
            
            if (inHorizontalArea) {
                navDotsContainer.classList.add('show');
            } else {
                navDotsContainer.classList.remove('show');
            }
        }
        
        // Skip horizontal scroll logic on mobile
        if (isMobile) {
            return;
        }
        
        // Hero section scrolls normally until 100vh
        if (scrollY < windowHeight) {
            if (horizontalContainer) {
                horizontalContainer.style.transform = `translateX(0)`;
            }
            // Clear all progress lines
            horizontalSections.forEach(section => {
                const progressLine = section.querySelector('.section-progress-line');
                if (progressLine) progressLine.style.height = '0';
            });
            return;
        }
        
        // Calculate progress in horizontal scroll area
        const horizontalScrollProgress = scrollY - windowHeight;
        
        // Check if we've scrolled past all horizontal sections
        if (horizontalScrollProgress >= totalHorizontalScroll) {
            // Past all horizontal sections - keep last section's line at full height
            horizontalSections.forEach((section, idx) => {
                const progressLine = section.querySelector('.section-progress-line');
                if (!progressLine) return;
                
                if (idx === numSections - 1) {
                    // Last section: keep line at full height
                    const contentHeight = getContentBoxHeight(section);
                    progressLine.style.height = `${contentHeight}px`;
                } else {
                    // Other sections: clear lines
                    progressLine.style.height = '0';
                }
            });
            
            // Keep horizontal container at final position
            if (horizontalContainer) {
                horizontalContainer.style.transform = `translateX(${(numSections - 1) * -window.innerWidth}px)`;
            }
            return;
        }
        
        // Determine current section and phase
        const overallProgress = horizontalScrollProgress / totalHorizontalScroll;
        const sectionProgress = overallProgress * numSections; // 0 to numSections
        const currentSectionIndex = Math.min(Math.floor(sectionProgress), numSections - 1);
        const progressWithinSection = sectionProgress - currentSectionIndex; // 0 to 1
        
        // Each section has two phases:
        // 0.0 - 0.5: Travel phase (section moving into reading position)
        // 0.5 - 1.0: Freeze phase (section locked, progress line shows)
        
        let translateX = 0;
        
        if (currentSectionIndex === 0) {
            // SECTION 0: Always stays at translateX = 0
            translateX = 0;
            
            // Line animates during first half (0 to 0.5), stays complete during second half (0.5 to 1)
            const lineProgress = Math.min(progressWithinSection * 2, 1); // Maps 0-0.5 to 0-1, then stays at 1
            const section = horizontalSections[0];
            const progressLine = section.querySelector('.section-progress-line');
            if (progressLine) {
                const contentHeight = getContentBoxHeight(section);
                progressLine.style.height = `${contentHeight * lineProgress}px`;
            }
            
            // Clear all other progress lines
            for (let i = 1; i < horizontalSections.length; i++) {
                const progressLine = horizontalSections[i].querySelector('.section-progress-line');
                if (progressLine) progressLine.style.height = '0';
            }
            
        } else if (progressWithinSection < 0.5) {
            // SECTIONS 1+: TRAVEL PHASE
            const travelProgress = progressWithinSection / 0.5;
            const startX = (currentSectionIndex - 1) * -window.innerWidth;
            const endX = currentSectionIndex * -window.innerWidth;
            translateX = startX + (endX - startX) * travelProgress;
            
            // Clear progress lines during travel
            horizontalSections.forEach(section => {
                const progressLine = section.querySelector('.section-progress-line');
                if (progressLine) progressLine.style.height = '0';
            });
            
        } else {
            // SECTIONS 1+: FREEZE PHASE - starts immediately at 0.5
            const freezeProgress = (progressWithinSection - 0.5) / 0.5; // 0 to 1 within freeze
            translateX = currentSectionIndex * -window.innerWidth;
            
            // Line animates during first half of freeze, stays complete during second half
            const lineProgress = Math.min(freezeProgress * 2, 1); // Maps 0-0.5 to 0-1, then stays at 1
            
            // Show progress line on current section
            horizontalSections.forEach((section, idx) => {
                const progressLine = section.querySelector('.section-progress-line');
                if (!progressLine) return;
                
                if (idx === currentSectionIndex) {
                    const contentHeight = getContentBoxHeight(section);
                    progressLine.style.height = `${contentHeight * lineProgress}px`;
                } else {
                    progressLine.style.height = '0';
                }
            });
        }
        
        // Apply translation
        if (horizontalContainer) {
            horizontalContainer.style.transform = `translateX(${translateX}px)`;
        }
        
        // Update active navigation dot
        const navDots = document.querySelectorAll('.nav-dot');
        navDots.forEach((dot, idx) => {
            if (idx === currentSectionIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Only set up scroll listener on desktop
    if (!isMobile) {
        let ticking = false;
        
        function requestTick() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick);
        
        // Recalculate heights when fonts are loaded
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                console.log('Fonts loaded, recalculating heights');
                initializeSectionHeights();
                horizontalSections.forEach(section => {
                    positionProgressLine(section);
                });
            });
        }
        
        // Reposition progress lines on window resize
        window.addEventListener('resize', () => {
            // Recalculate heights as text may reflow
            initializeSectionHeights();
            
            horizontalSections.forEach(section => {
                positionProgressLine(section);
            });
        });
        
        // Initial update
        updateScroll();
    }

    // Navigation click handlers
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').replace('#', '');
            
            if (isMobile) {
                // On mobile, just scroll to the section normally
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } else {
                // On desktop, use horizontal scroll logic
                const sections = ['thesis', 'hardware', 'software', 'team'];
                const sectionIndex = sections.indexOf(targetId);
                
                if (sectionIndex !== -1) {
                    const windowHeight = window.innerHeight;
                    const horizontalStart = windowHeight;
                    
                    // Jump to the freeze zone of target section (midpoint of its total zone)
                    const sectionZoneStart = sectionIndex * totalDistancePerSection;
                    const freezeZoneStart = sectionZoneStart + travelDistancePerSection;
                    const scrollTarget = horizontalStart + freezeZoneStart;
                    
                    window.scrollTo({
                        top: scrollTarget,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Navigation dot click handlers
    const navDots = document.querySelectorAll('.nav-dot');
    
    navDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            
            const sectionIndex = parseInt(dot.getAttribute('data-section'));
            
            if (!isMobile && horizontalWrapper) {
                // On desktop, calculate scroll position to target section's freeze zone START
                const windowHeight = window.innerHeight;
                const horizontalStart = windowHeight;
                
                // Jump to the START of freeze zone (where content is OUR-aligned)
                // Freeze zone starts at 0.5 progress through each section
                const freezeZoneStart = (sectionIndex + 0.5) * totalDistancePerSection;
                const scrollTarget = horizontalStart + freezeZoneStart;
                
                // Instant jump (no animation)
                window.scrollTo({
                    top: scrollTarget,
                    behavior: 'auto'
                });
            }
        });
    });

    // Mission Rotator with Typewriter Effect
    const missionTexts = [
        'Save 30M lives each year',
        'Manage 2B cases of chronic inflammation',
        'Extend the average healthspan past 100 years',
        'Save $2T in healthcare costs',
        'Stop Chronic Inflammation'
    ];

    const missionRotator = document.getElementById('missionRotator');
    
    if (!missionRotator) {
        console.error('Mission rotator element not found!');
        return;
    }
    
    console.log('Mission rotator found');
    let currentMissionIndex = 0;
    let isTyping = false;
    let isDeleting = false;
    let currentText = '';
    let charIndex = 0;

    // Create a single display element for the typewriter effect
    missionRotator.innerHTML = '<div class="mission-item active typewriter"></div>';
    const displayElement = missionRotator.querySelector('.typewriter');

    // Create cursor element
    const cursor = document.createElement('span');
    cursor.className = 'cursor';

    function typeWriter() {
        if (currentMissionIndex >= missionTexts.length) {
            console.log('Typewriter complete - showing final message');
            cursor.remove(); // Remove cursor from final message
            return; // Stop on last mission
        }

        const fullText = missionTexts[currentMissionIndex];
        
        if (!isDeleting && charIndex <= fullText.length) {
            // Typing
            currentText = fullText.substring(0, charIndex);
            displayElement.textContent = currentText;
            displayElement.appendChild(cursor); // Add cursor after text
            charIndex++;
            
            if (charIndex > fullText.length) {
                // Finished typing, wait 3 seconds
                console.log('Finished typing:', fullText);
                setTimeout(() => {
                    if (currentMissionIndex < missionTexts.length - 1) {
                        isDeleting = true;
                        typeWriter();
                    }
                    // If it's the last mission, don't delete
                }, 3000);
            } else {
                setTimeout(typeWriter, 90); // Typing speed
            }
        } else if (isDeleting && charIndex > 0) {
            // Deleting
            charIndex--;
            currentText = fullText.substring(0, charIndex);
            displayElement.textContent = currentText;
            displayElement.appendChild(cursor); // Keep cursor during deletion
            
            if (charIndex === 0) {
                // Finished deleting, move to next mission
                isDeleting = false;
                currentMissionIndex++;
                console.log('Moving to mission index:', currentMissionIndex);
                setTimeout(typeWriter, 200); // Pause before next message
            } else {
                setTimeout(typeWriter, 50); // Deleting speed
            }
        }
    }

    // Start typewriter after initial delay
    setTimeout(() => {
        console.log('Starting typewriter animation...');
        typeWriter();
    }, 1500);

    console.log('Script execution complete');
});
