// Modal Component Class
class ModalComponent {
    constructor() {
        this.modals = new Map();
        this.activeModal = null;
        this.init();
    }

    init() {
        // Register all modals
        this.registerModals();
        
        // Setup event listeners
        this.setupTriggers();
        this.setupClosers();
        this.setupKeyboardNavigation();
        this.setupBackdropClick();
        
        // Initialize animations on scroll
        this.initScrollAnimations();
    }

    registerModals() {
        // Find all modals in the DOM
        const modalElements = document.querySelectorAll('.modal');
        
        modalElements.forEach(modal => {
            const modalId = modal.id;
            this.modals.set(modalId, {
                element: modal,
                content: modal.querySelector('.modal-content'),
                backdrop: modal.querySelector('.modal-backdrop'),
                isOpen: false
            });
        });
    }

    setupTriggers() {
        // Find all elements with data-modal-trigger attribute
        const triggers = document.querySelectorAll('[data-modal-trigger]');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalType = trigger.getAttribute('data-modal-trigger');
                const modalId = `${modalType}-modal`;
                this.openModal(modalId);
            });
        });
    }

    setupClosers() {
        // Close buttons
        const closeButtons = document.querySelectorAll('.modal-close, [data-modal-close]');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeActiveModal();
            });
        });
    }

    setupBackdropClick() {
        // Close modal when clicking backdrop
        this.modals.forEach((modal, modalId) => {
            modal.backdrop.addEventListener('click', () => {
                this.closeModal(modalId);
            });
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Close modal on ESC key
            if (e.key === 'Escape' && this.activeModal) {
                this.closeActiveModal();
            }
            
            // Trap focus within modal when Tab is pressed
            if (e.key === 'Tab' && this.activeModal) {
                this.trapFocus(e);
            }
        });
    }

    openModal(modalId) {
        const modal = this.modals.get(modalId);
        
        if (!modal) {
            console.error(`Modal with id "${modalId}" not found`);
            return;
        }

        // Close any active modal first
        if (this.activeModal) {
            this.closeActiveModal();
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Add active class
        modal.element.classList.add('active');
        modal.isOpen = true;
        this.activeModal = modalId;

        // Animate entrance
        this.animateModalEntrance(modal);

        // Focus management
        this.setFocusToModal(modal);

        // Emit custom event
        this.emitEvent('modalOpen', { modalId });
    }

    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        
        if (!modal || !modal.isOpen) return;

        // Animate exit
        this.animateModalExit(modal).then(() => {
            // Remove active class
            modal.element.classList.remove('active');
            modal.isOpen = false;
            
            // Restore body scroll
            if (this.activeModal === modalId) {
                document.body.style.overflow = '';
                this.activeModal = null;
            }

            // Return focus to trigger element
            this.returnFocus();

            // Emit custom event
            this.emitEvent('modalClose', { modalId });
        });
    }

    closeActiveModal() {
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }
    }

    animateModalEntrance(modal) {
        // Reset animation
        modal.content.style.animation = 'none';
        
        // Force reflow
        void modal.content.offsetHeight;
        
        // Add entrance animation
        modal.content.style.animation = 'modalSlideIn 0.3s ease-out forwards';
    }

    animateModalExit(modal) {
        return new Promise((resolve) => {
            modal.content.style.animation = 'modalSlideOut 0.3s ease-out forwards';
            
            setTimeout(() => {
                modal.content.style.animation = '';
                resolve();
            }, 300);
        });
    }

    setFocusToModal(modal) {
        // Store the element that triggered the modal
        this.lastFocusedElement = document.activeElement;
        
        // Find first focusable element in modal
        const focusableElements = modal.content.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    returnFocus() {
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
        }
    }

    trapFocus(e) {
        const modal = this.modals.get(this.activeModal);
        if (!modal) return;
        
        const focusableElements = modal.content.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
        }
    }

    emitEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    // Scroll animations for page elements
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            card.classList.add('animate-on-scroll');
            observer.observe(card);
        });

        // Observe trigger buttons
        document.querySelectorAll('.triggers-grid .btn').forEach((btn, index) => {
            btn.classList.add('animate-on-scroll');
            btn.style.animationDelay = `${index * 0.1}s`;
            observer.observe(btn);
        });
    }
}

// Additional CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    @keyframes modalSlideOut {
        from {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        to {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
        }
    }
    
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
    }
    
    .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(styleSheet);

// Form handling
class FormHandler {
    constructor() {
        this.setupFormSubmission();
    }

    setupFormSubmission() {
        const form = document.querySelector('.modal-form');
        if (!form) return;

        const submitBtn = form.closest('.modal').querySelector('.btn-gradient');
        
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSubmit(form);
        });

        // Real-time validation
        form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearError(field));
        });
    }

    handleSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate all fields
        let isValid = true;
        form.querySelectorAll('input, textarea').forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (isValid) {
            // Show success animation
            this.showSuccessAnimation();
            
            // Log form data (in real app, send to server)
            console.log('Form submitted:', data);
            
            // Reset form after delay
            setTimeout(() => {
                form.reset();
                modalComponent.closeActiveModal();
            }, 2000);
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        if (field.hasAttribute('required') && !value) {
            errorMessage = 'This field is required';
            isValid = false;
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email';
                isValid = false;
            }
        }

        if (!isValid) {
            this.showError(field, errorMessage);
        } else {
            this.clearError(field);
        }

        return isValid;
    }

    showError(field, message) {
        const formGroup = field.closest('.form-group');
        
        // Remove existing error
        this.clearError(field);
        
        // Add error class
        field.classList.add('error');
        
        // Create error message
        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        errorEl.style.cssText = `
            color: #e53e3e;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
            animation: slideInUp 0.3s ease-out;
        `;
        
        formGroup.appendChild(errorEl);
        
        // Add error border
        field.style.borderColor = '#e53e3e';
    }

    clearError(field) {
        const formGroup = field.closest('.form-group');
        const errorEl = formGroup.querySelector('.error-message');
        
        if (errorEl) {
            errorEl.remove();
        }
        
        field.classList.remove('error');
        field.style.borderColor = '';
    }

    showSuccessAnimation() {
        const modal = document.querySelector('#form-modal .modal-content');
        const successOverlay = document.createElement('div');
        
        successOverlay.className = 'success-overlay';
        successOverlay.innerHTML = `
            <div class="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
            </div>
            <p>Message sent successfully!</p>
        `;
        
        successOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10;
            border-radius: 1rem;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const successIcon = successOverlay.querySelector('.success-icon');
        successIcon.style.cssText = `
            width: 80px;
            height: 80px;
            background: #48bb78;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            animation: scaleIn 0.5s ease-out 0.2s both;
        `;
        
        successIcon.querySelector('svg').style.cssText = `
            width: 40px;
            height: 40px;
            stroke: white;
        `;
        
        modal.appendChild(successOverlay);
    }
}

// Smooth scroll for anchor links
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize modal component
    window.modalComponent = new ModalComponent();
    
    // Initialize form handler
    new FormHandler();
    
    // Initialize smooth scroll
    new SmoothScroll();
    
    // Listen for custom events
    document.addEventListener('modalOpen', (e) => {
        console.log('Modal opened:', e.detail.modalId);
    });
    
    document.addEventListener('modalClose', (e) => {
        console.log('Modal closed:', e.detail.modalId);
    });
    
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: translate(${x}px, ${y}px);
                pointer-events: none;
                animation: rippleEffect 0.6s ease-out;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleEffect {
        from {
            transform: translate(var(--x, 0), var(--y, 0)) scale(0);
            opacity: 1;
        }
        to {
            transform: translate(var(--x, 0), var(--y, 0)) scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);