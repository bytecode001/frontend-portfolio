// Project portfolio data
const projects = [
    {
        title: "Oscar Awards Dashboard",
        description: "Interactive data visualization dashboard showcasing Oscar Awards statistics with dynamic charts and filtering capabilities.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Chart.js"],
        image: "img/oscar-awards.jpg",
        link: "projects/oscar-awards/index.html",
        featured: false
    },
    {
        title: "E-commerce Product Page",
        description: "Modern product showcase with image gallery, zoom functionality, customer reviews, and add-to-cart animations.",
        techStack: ["HTML5", "CSS3", "JavaScript", "GSAP"],
        image: "img/placeholder.jpg",
        link: "projects/ecommerce-product/index.html",
        featured: false
    },
    {
        title: "Weather App",
        description: "Real-time weather application with geolocation, 5-day forecast, animated weather icons, and city search functionality.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Weather API"],
        image: "img/placeholder.jpg",
        link: "projects/weather-app/index.html",
        featured: false
    },
    {
        title: "Task Management Board",
        description: "Kanban-style task manager with drag-and-drop functionality, local storage persistence, and smooth animations.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Drag & Drop API"],
        image: "img/placeholder.jpg",
        link: "projects/task-board/index.html",
        featured: false
    },
    {
        title: "Interactive Portfolio Gallery",
        description: "Photography portfolio with category filtering, lightbox viewer, lazy loading, and masonry grid layout.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Intersection Observer"],
        image: "img/placeholder.jpg",
        link: "projects/photo-gallery/index.html",
        featured: false
    },
    {
        title: "Real-time Chat Interface",
        description: "Modern chat UI with typing indicators, message reactions, smooth scrolling, and responsive mobile design.",
        techStack: ["HTML5", "CSS3", "JavaScript", "WebSockets"],
        image: "img/placeholder.jpg",
        link: "projects/chat-interface/index.html",
        featured: false
    }
];

// Function to create a project card
function createProjectCard(project, index) {
    const card = document.createElement('article');
    card.className = `project-card ${project.featured ? 'featured' : ''}`;
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Create tech stack HTML
    const techStackHTML = project.techStack.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="card-image-container">
            <img src="${project.image}" alt="${project.title}" class="card-image" loading="lazy">
        </div>
        <div class="card-content">
            <h2 class="card-title">${project.title}</h2>
            <p class="card-description">${project.description}</p>
            <div class="tech-stack">${techStackHTML}</div>
            <a href="${project.link}" class="view-button" onclick="handleCardClick(event)">
                <span class="view-button-text">View Project</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </a>
        </div>
    `;
    
    // Click on entire card
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('view-button') && !e.target.closest('.view-button')) {
            window.location.href = project.link;
        }
    });
    
    return card;
}

// Handle click with ripple effect
function handleCardClick(event) {
    event.stopPropagation();
    const button = event.currentTarget;
    
    // Create ripple effect
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Initialize projects grid
function initializeProjects() {
    const grid = document.getElementById('projects');
    
    projects.forEach((project, index) => {
        const card = createProjectCard(project, index);
        grid.appendChild(card);
    });
}

// Smooth scroll for anchor links
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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
}

// Intersection Observer for scroll animations
function initializeScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.project-card').forEach(card => {
        card.style.animationPlayState = 'paused';
        observer.observe(card);
    });
}

// Theme management (light/dark mode)
function initializeThemeToggle() {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Listen for system preference changes
    prefersDarkScheme.addEventListener('change', (e) => {
        document.body.classList.toggle('dark-mode', e.matches);
    });
}

// Lazy loading for images with fallback
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'img/placeholder.jpg';
        });
    });
}

// Hero background animation on mouse movement
function initializeHeroAnimation() {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    hero.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { width, height } = hero.getBoundingClientRect();
        
        const xPos = (clientX / width - 0.5) * 20;
        const yPos = (clientY / height - 0.5) * 20;
        
        heroContent.style.transform = `translate(${xPos}px, ${yPos}px)`;
    });
    
    hero.addEventListener('mouseleave', () => {
        heroContent.style.transform = 'translate(0, 0)';
    });
}

// Add floating animation to tech tags on hover
function initializeTechTagAnimations() {
    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('tech-tag')) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.2)';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('tech-tag')) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeProjects();
    initializeSmoothScroll();
    initializeThemeToggle();
    initializeLazyLoading();
    initializeHeroAnimation();
    initializeTechTagAnimations();
    
    // Initialize scroll animations after a brief delay
    setTimeout(() => {
        initializeScrollAnimations();
    }, 100);
});

// Performance optimization: Debounce for resize events
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Re-initialize components that depend on window dimensions
        initializeHeroAnimation();
    }, 250);
});

// Add style for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .tech-tag {
        transition: all 0.3s ease;
        cursor: default;
    }
`;
document.head.appendChild(style);