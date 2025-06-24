// Portfolio Gallery JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // DOM Elements
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxTitle = document.querySelector('.lightbox-title');
    const lightboxCategory = document.querySelector('.lightbox-category');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const creditsModal = document.getElementById('creditsModal');
    const creditsLink = document.getElementById('creditsLink');
    const creditsClose = document.querySelector('.credits-close');
    
    let currentImageIndex = 0;
    let filteredImages = [...galleryItems];
    
    // Initialize
    init();
    
    function init() {
        setupFilterButtons();
        setupGalleryItems();
        setupLightbox();
        setupLazyLoading();
        setupCreditsModal();
        addAnimationDelays();
    }
    
    // Setup category filters
    function setupFilterButtons() {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.dataset.filter;
                
                // Update active button state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter elements
                filterGallery(filter);
            });
        });
    }
    
    // Filter gallery with animations
    function filterGallery(filter) {
        let visibleIndex = 0;
        
        galleryItems.forEach((item, index) => {
            const category = item.dataset.category;
            
            if (filter === 'all' || category === filter) {
                // Show element with progressive delay
                setTimeout(() => {
                    item.classList.remove('hide');
                    item.classList.add('show');
                    item.style.display = 'block';
                }, visibleIndex * 50);
                visibleIndex++;
            } else {
                // Hide element
                item.classList.add('hide');
                item.classList.remove('show');
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
        
        // Update filtered images array for lightbox
        updateFilteredImages(filter);
    }
    
    // Update filtered images array
    function updateFilteredImages(filter) {
        if (filter === 'all') {
            filteredImages = [...galleryItems];
        } else {
            filteredImages = Array.from(galleryItems).filter(item => 
                item.dataset.category === filter
            );
        }
    }
    
    // Setup gallery items click events
    function setupGalleryItems() {
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', function() {
                openLightbox(index);
            });
        });
    }
    
    // Setup lightbox functionality
    function setupLightbox() {
        // Close lightbox
        lightboxClose.addEventListener('click', closeLightbox);
        
        // Close by clicking outside the image
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Navigation
        lightboxPrev.addEventListener('click', showPreviousImage);
        lightboxNext.addEventListener('click', showNextImage);
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    showPreviousImage();
                    break;
                case 'ArrowRight':
                    showNextImage();
                    break;
            }
        });
        
        // Touch gestures for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                showNextImage();
            }
            if (touchEndX > touchStartX + 50) {
                showPreviousImage();
            }
        }
    }
    
    // Open lightbox
    function openLightbox(index) {
        // Find index in filtered array
        const galleryItem = galleryItems[index];
        currentImageIndex = filteredImages.indexOf(galleryItem);
        
        if (currentImageIndex === -1) {
            currentImageIndex = 0;
        }
        
        updateLightboxContent();
        
        // Show lightbox with animation
        lightbox.style.display = 'flex';
        setTimeout(() => {
            lightbox.classList.add('active');
        }, 10);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightbox.style.display = 'none';
        }, 300);
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    // Show previous image
    function showPreviousImage() {
        currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
        updateLightboxContent();
        animateLightboxImage('prev');
    }
    
    // Show next image
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
        updateLightboxContent();
        animateLightboxImage('next');
    }
    
    // Update lightbox content
    function updateLightboxContent() {
        const currentItem = filteredImages[currentImageIndex];
        const img = currentItem.querySelector('.gallery-img');
        const title = currentItem.querySelector('.overlay-title').textContent;
        const category = currentItem.querySelector('.overlay-category').textContent;
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxTitle.textContent = title;
        lightboxCategory.textContent = category;
    }
    
    // Animate lightbox image change
    function animateLightboxImage(direction) {
        const lightboxContent = document.querySelector('.lightbox-content');
        
        // Remove previous animation
        lightboxContent.style.animation = 'none';
        
        // Force reflow
        void lightboxContent.offsetWidth;
        
        // Apply new animation
        if (direction === 'next') {
            lightboxContent.style.animation = 'slideInRight 0.3s ease-out';
        } else {
            lightboxContent.style.animation = 'slideInLeft 0.3s ease-out';
        }
    }
    
    // Lazy Loading with Intersection Observer
    function setupLazyLoading() {
        const images = document.querySelectorAll('.gallery-img.lazy');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Simulate image loading
                    img.addEventListener('load', function() {
                        img.classList.add('loaded');
                    });
                    
                    // If image is already cached, add loaded class
                    if (img.complete) {
                        img.classList.add('loaded');
                    }
                    
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        }, {
            root: null,
            rootMargin: '50px',
            threshold: 0.01
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Add progressive delay to initial animations
    function addAnimationDelays() {
        galleryItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    // Setup credits modal
    function setupCreditsModal() {
        // Open credits modal
        creditsLink.addEventListener('click', function(e) {
            e.preventDefault();
            openCreditsModal();
        });
        
        // Close credits modal
        creditsClose.addEventListener('click', closeCreditsModal);
        
        // Close by clicking outside
        creditsModal.addEventListener('click', function(e) {
            if (e.target === creditsModal) {
                closeCreditsModal();
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && creditsModal.classList.contains('active')) {
                closeCreditsModal();
            }
        });
    }
    
    // Open credits modal
    function openCreditsModal() {
        creditsModal.style.display = 'flex';
        setTimeout(() => {
            creditsModal.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
    }
    
    // Close credits modal
    function closeCreditsModal() {
        creditsModal.classList.remove('active');
        setTimeout(() => {
            creditsModal.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    }
    
    // Smooth scroll for anchor links (if added in the future)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
});

// Add dynamic CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(30px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideInLeft {
        from {
            transform: translateX(-30px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Debug log
console.log('Portfolio Gallery initialized successfully! 🎨');