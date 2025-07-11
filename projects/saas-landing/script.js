// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.classList.contains('active') ? 'hidden' : '';
    });
    
    // Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (hamburger.classList.contains('active')) {
                    hamburger.click();
                }
            }
        });
    });
    
    // Navbar Background on Scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.9)';
            navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }
    });
    
    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Add stagger effect for grid items
                if (entry.target.closest('.features-grid') || 
                    entry.target.closest('.pricing-grid') || 
                    entry.target.closest('.testimonials-grid')) {
                    const siblings = entry.target.parentElement.children;
                    Array.from(siblings).forEach((sibling, index) => {
                        setTimeout(() => {
                            sibling.classList.add('animated');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);
    
    // Add animation class to elements
    const animateElements = document.querySelectorAll('.section-header, .feature-card, .pricing-card, .testimonial-card');
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
    
    // Counter Animation for Stats
    const stats = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = entry.target;
                target.classList.add('counted');
                
                const finalValue = target.textContent;
                const isPercentage = finalValue.includes('%');
                const isRating = finalValue.includes('/');
                const hasK = finalValue.includes('K');
                
                let numericValue = parseFloat(finalValue.replace(/[^0-9.]/g, ''));
                let currentValue = 0;
                const increment = numericValue / 50;
                
                const counter = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= numericValue) {
                        currentValue = numericValue;
                        clearInterval(counter);
                    }
                    
                    let displayValue = currentValue.toFixed(currentValue < 10 ? 1 : 0);
                    if (isPercentage) displayValue += '%';
                    if (isRating) displayValue += '/5';
                    if (hasK) displayValue += 'K+';
                    
                    target.textContent = displayValue;
                }, 30);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => statsObserver.observe(stat));
    
    // Parallax Effect for Hero Section
    const heroImage = document.querySelector('.dashboard-image');
    const floatingCards = document.querySelectorAll('.floating-card');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        
        if (heroImage) {
            heroImage.style.transform = `translateY(${scrolled * parallaxSpeed * 0.3}px)`;
        }
        
        floatingCards.forEach((card, index) => {
            const speed = 0.2 * (index + 1);
            card.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    
    // Fade in effect for Hero Title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        // Add initial styles
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(20px)';
        
        // Trigger animation after a short delay
        setTimeout(() => {
            heroTitle.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
            
            // Add glow effect to gradient text after fade in
            setTimeout(() => {
                const gradientText = heroTitle.querySelector('.gradient-text');
                if (gradientText) {
                    gradientText.style.animation = 'glow 2s ease-in-out infinite';
                }
            }, 1000);
        }, 300);
    }
    
    // Add Ripple Effect to Buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Form Validation (if you add a contact form later)
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Lazy Loading for Images
    const images = document.querySelectorAll('img[data-src]');
    const imageOptions = {
        threshold: 0,
        rootMargin: '0px 0px 300px 0px'
    };
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    }, imageOptions);
    
    images.forEach(img => imageObserver.observe(img));
    
    // Add CSS for mobile menu - REMOVED as it's now in the CSS file
    
    // Performance Optimization - Debounce Scroll Events
    let scrollTimeout;
    function debounce(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(scrollTimeout);
                func(...args);
            };
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(later, wait);
        };
    }
    
    // Apply debounce to scroll events
    const debouncedScroll = debounce(() => {
        // Add your scroll-based animations here
    }, 10);
    
    window.addEventListener('scroll', debouncedScroll);
    
    // Preload critical images
    const criticalImages = [
        'https://via.placeholder.com/600x400/6366F1/FFFFFF?text=Dashboard+Preview'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // Console Easter Egg
    console.log('%c🚀 Welcome to SaaSPro!', 'font-size: 24px; font-weight: bold; color: #6366F1;');
    console.log('%cBuilt with ❤️ by Francesco Saviano', 'font-size: 14px; color: #666;');
    console.log('%cHire me on Upwork!', 'font-size: 16px; font-weight: bold; color: #14B8A6;');
});