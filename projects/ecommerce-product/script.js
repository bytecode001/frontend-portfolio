// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger);

    // DOM Elements
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');
    const colorOptions = document.querySelectorAll('.color-option');
    const selectedColorText = document.querySelector('.selected-color');
    const quantityInput = document.querySelector('.quantity-input');
    const quantityBtns = document.querySelectorAll('.quantity-btn');
    const addToCartBtn = document.querySelector('.add-to-cart');
    const cartCount = document.querySelector('.cart-count');
    const cartNotification = document.querySelector('.cart-notification');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const zoomContainer = document.querySelector('.image-zoom-container');
    const zoomLens = document.querySelector('.zoom-lens');
    const zoomResult = document.querySelector('.zoom-result');

    // State
    let currentQuantity = 1;
    let cartItems = 0;

    // Initial Animations
    gsap.from('.navbar', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.from('.product-images', {
        x: -50,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out'
    });

    gsap.from('.product-info > *', {
        x: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        delay: 0.3,
        ease: 'power3.out'
    });

    // Thumbnail Gallery
    if (thumbnails.length > 0) {
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', function() {
                // Update active state
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Change main image with fade effect
                gsap.to(mainImage, {
                    opacity: 0,
                    duration: 0.2,
                    onComplete: () => {
                        mainImage.src = this.dataset.full;
                        gsap.to(mainImage, {
                            opacity: 1,
                            duration: 0.2
                        });
                    }
                });
            });

            // Animate thumbnails on load
            gsap.from(thumb, {
                scale: 0,
                opacity: 0,
                duration: 0.5,
                delay: 0.5 + (index * 0.1),
                ease: 'back.out(1.7)'
            });
        });
    }

    // Image Zoom Functionality - Simple lens effect
    let zoomActive = false;

    if (zoomContainer && mainImage) {
        zoomContainer.addEventListener('mouseenter', function() {
            if (window.innerWidth > 1024) { // Only on desktop
                zoomActive = true;
                zoomContainer.classList.add('zoom-active');
            }
        });

        zoomContainer.addEventListener('mouseleave', function() {
            zoomActive = false;
            zoomContainer.classList.remove('zoom-active');
        });

        zoomContainer.addEventListener('mousemove', function(e) {
            if (!zoomActive || window.innerWidth <= 1024) return;

            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Position lens
            const lensHalfWidth = zoomLens.offsetWidth / 2;
            const lensHalfHeight = zoomLens.offsetHeight / 2;
            let lensX = x - lensHalfWidth;
            let lensY = y - lensHalfHeight;
            
            // Keep lens within bounds
            const maxX = rect.width - zoomLens.offsetWidth;
            const maxY = rect.height - zoomLens.offsetHeight;
            
            lensX = Math.max(0, Math.min(lensX, maxX));
            lensY = Math.max(0, Math.min(lensY, maxY));
            
            zoomLens.style.left = lensX + 'px';
            zoomLens.style.top = lensY + 'px';
        });
    }

    // Color Selection with Image Change
    if (colorOptions.length > 0) {
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                selectedColorText.textContent = this.dataset.color;
                
                // Change main image with fade effect
                const newImage = this.dataset.image;
                gsap.to(mainImage, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        mainImage.src = newImage;
                        // Update thumbnail to match selected color
                        thumbnails.forEach(thumb => thumb.classList.remove('active'));
                        const matchingThumb = Array.from(thumbnails).find(thumb => 
                            thumb.dataset.full === newImage
                        );
                        if (matchingThumb) {
                            matchingThumb.classList.add('active');
                        }
                        gsap.to(mainImage, {
                            opacity: 1,
                            duration: 0.3
                        });
                    }
                });
                
                // Animate selection
                gsap.fromTo(this, {
                    scale: 1.2
                }, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'back.out(1.7)'
                });
            });
        });
    }

    // Quantity Selector
    if (quantityBtns.length > 0) {
        quantityBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('minus')) {
                    if (currentQuantity > 1) {
                        currentQuantity--;
                    }
                } else {
                    if (currentQuantity < 10) {
                        currentQuantity++;
                    }
                }
                
                quantityInput.value = currentQuantity;
                
                // Animate button press
                gsap.to(this, {
                    scale: 0.9,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1
                });
            });
        });
    }

    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            const value = parseInt(this.value);
            if (value >= 1 && value <= 10) {
                currentQuantity = value;
            } else {
                this.value = currentQuantity;
            }
        });
    }

    // Add to Cart Animation
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const btnText = this.querySelector('.btn-text');
            const btnLoader = this.querySelector('.btn-loader');
            
            // Add loading state
            this.classList.add('loading');
            
            // Simulate API call
            setTimeout(() => {
                this.classList.remove('loading');
                
                // Update cart count
                cartItems += currentQuantity;
                cartCount.textContent = cartItems;
                
                // Animate cart icon
                gsap.timeline()
                    .to('.cart-icon', {
                        scale: 1.2,
                        duration: 0.3,
                        ease: 'back.out(1.7)'
                    })
                    .to('.cart-icon', {
                        scale: 1,
                        duration: 0.2
                    })
                    .to('.cart-count', {
                        scale: 1.5,
                        duration: 0.2
                    }, '-=0.2')
                    .to('.cart-count', {
                        scale: 1,
                        duration: 0.2
                    });
                
                // Show notification
                showNotification();
                
                // Reset quantity
                currentQuantity = 1;
                quantityInput.value = 1;
            }, 1500);
        });
    }

    // Notification
    function showNotification() {
        cartNotification.classList.add('show');
        
        gsap.fromTo(cartNotification, {
            scale: 0.8,
            opacity: 0
        }, {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            ease: 'back.out(1.7)'
        });
        
        setTimeout(() => {
            cartNotification.classList.remove('show');
        }, 3000);
    }

    // Mobile Menu Toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            if (navMenu.classList.contains('active')) {
                gsap.fromTo('.nav-link', {
                    x: 50,
                    opacity: 0
                }, {
                    x: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'power3.out'
                });
            }
        });
    }

    // Scroll Animations
    gsap.utils.toArray('.feature-item').forEach((item, index) => {
        gsap.from(item, {
            x: -30,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.1,
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Reviews Animation
    if (document.querySelector('.rating-bar-fill')) {
        gsap.from('.rating-bar-fill', {
            width: 0,
            duration: 1.5,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.reviews-summary',
                start: 'top 70%'
            }
        });
    }

    if (document.querySelector('.review-card')) {
        gsap.from('.review-card', {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
                trigger: '.reviews-list',
                start: 'top 80%'
            }
        });
    }

    // Parallax Effect on Product Image - REMOVED
    // Removed to avoid unwanted scroll animation

    // Hover Effects
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            gsap.to(this, {
                scale: 1.05,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        btn.addEventListener('mouseleave', function() {
            gsap.to(this, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });

    // Price Animation on Load
    if (document.querySelector('.price-current')) {
        const priceElement = document.querySelector('.price-current');
        const finalPrice = 299;
        
        gsap.from(priceElement, {
            textContent: 0,
            duration: 2,
            ease: 'power3.out',
            snap: { textContent: 1 },
            onUpdate: function() {
                priceElement.textContent = '$' + Math.floor(priceElement.textContent);
            },
            onComplete: function() {
                priceElement.textContent = '$' + finalPrice;
            }
        });
    }

    // Star Rating Animation
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        gsap.from(star, {
            scale: 0,
            rotation: 360,
            duration: 0.5,
            delay: 0.7 + (index * 0.1),
            ease: 'back.out(1.7)'
        });
    });

    // Footer Animation
    if (document.querySelector('.footer-content')) {
        gsap.from('.footer-content > *', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 80%'
            }
        });
    }

    // Social Links Hover
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('mouseenter', function() {
            gsap.to(this, {
                rotation: 360,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
        
        link.addEventListener('mouseleave', function() {
            gsap.to(this, {
                rotation: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });

    // Performance Optimization: Lazy Loading for Images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img').forEach(img => {
            imageObserver.observe(img);
        });
    }
});