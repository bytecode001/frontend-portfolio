// Global variables
let oscarData = [];
let searchIndex = [];
let charts = {};
let currentCeremony = 97;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeEventListeners();
    hideLoading();
});

// Load and parse data
async function loadData() {
    try {
        const response = await fetch('data/full_data.csv');
        const csvText = await response.text();
        
        const parsed = Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            delimiter: '\t'
        });
        
        oscarData = parsed.data;
        
        // Build search index
        buildSearchIndex();
        
        // Initialize components
        updateStats();
        createTopFilmsChart();
        createMostWinsChart();
        createCategoryCards();
        updateTimeline(currentCeremony);
        
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Please ensure the file is in data/full_data.csv');
    }
}

// Build search index for autocomplete
function buildSearchIndex() {
    const uniqueEntries = new Map();
    
    oscarData.forEach(entry => {
        // Index films
        if (entry.Film && entry.Film !== 'null') {
            const film = entry.Film.toString();
            const key = `film_${film}`;
            if (!uniqueEntries.has(key)) {
                uniqueEntries.set(key, {
                    type: 'Film',
                    title: film,
                    searchText: film.toLowerCase()
                });
            }
        }
        
        // Index people
        if (entry.Name && entry.Name !== 'null') {
            const name = entry.Name.toString();
            const key = `person_${name}`;
            if (!uniqueEntries.has(key)) {
                uniqueEntries.set(key, {
                    type: 'Person',
                    title: name,
                    searchText: name.toLowerCase()
                });
            }
        }
    });
    
    searchIndex = Array.from(uniqueEntries.values());
}

// Update statistics
function updateStats() {
    // Total ceremonies
    const ceremonies = [...new Set(oscarData.map(d => d.Ceremony))].length;
    animateNumber('total-ceremonies', ceremonies);
    
    // Total winners
    const winners = oscarData.filter(d => d.Winner === true || d.Winner === "True").length;
    animateNumber('total-winners', winners);
    
    // Total nominations
    animateNumber('total-nominations', oscarData.length);
    
    // Most Oscars for a single film
    const filmWins = {};
    oscarData.forEach(d => {
        if ((d.Winner === true || d.Winner === "True") && d.Film && d.Film !== 'null') {
            filmWins[d.Film] = (filmWins[d.Film] || 0) + 1;
        }
    });
    const maxWins = Math.max(...Object.values(filmWins));
    animateNumber('most-oscars', maxWins);
}

// Animate numbers
function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    const duration = 1500;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Create top films chart
function createTopFilmsChart() {
    const ctx = document.getElementById('topFilmsChart').getContext('2d');
    
    // Count nominations per film
    const filmCounts = {};
    oscarData.forEach(d => {
        if (d.Film && d.Film !== 'null') {
            filmCounts[d.Film] = (filmCounts[d.Film] || 0) + 1;
        }
    });
    
    // Get top 25 films
    const topFilms = Object.entries(filmCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 25);
    
    // Create chart
    charts.topFilms = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topFilms.map(f => f[0]),
            datasets: [{
                label: 'Nominations',
                data: topFilms.map(f => f[1]),
                backgroundColor: '#FFD700',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const film = topFilms[context.dataIndex][0];
                            const wins = oscarData.filter(d => 
                                d.Film === film && (d.Winner === true || d.Winner === "True")
                            ).length;
                            return `Wins: ${wins}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b0b0b0'
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#b0b0b0',
                        font: {
                            size: 11
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const film = topFilms[elements[0].index][0];
                    showFilmDetails(film);
                }
            }
        }
    });
    
    // Show details for top 5 films
    showTopFilmDetails(topFilms.slice(0, 5));
}

// Show film details below chart
function showTopFilmDetails(topFilms) {
    const container = document.getElementById('film-details');
    
    container.innerHTML = topFilms.map(([film, nominations]) => {
        const wins = oscarData.filter(d => 
            d.Film === film && (d.Winner === true || d.Winner === "True")
        ).length;
        
        return `
            <div class="film-detail-card">
                <div class="film-detail-title">${film}</div>
                <div class="film-detail-stats">
                    <span>${nominations} Nominations</span>
                    <span class="gold-text">${wins} Wins</span>
                </div>
            </div>
        `;
    }).join('');
}

// Create most wins chart
function createMostWinsChart() {
    const ctx = document.getElementById('mostWinsChart').getContext('2d');
    
    // Count wins per film
    const filmWins = {};
    oscarData.forEach(d => {
        if ((d.Winner === true || d.Winner === "True") && d.Film && d.Film !== 'null') {
            filmWins[d.Film] = (filmWins[d.Film] || 0) + 1;
        }
    });
    
    // Get top 25 films by wins
    const topWins = Object.entries(filmWins)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 25);
    
    // Create chart
    charts.mostWins = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topWins.map(f => f[0]),
            datasets: [{
                label: 'Oscar Wins',
                data: topWins.map(f => f[1]),
                backgroundColor: '#DAA520',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const film = topWins[context.dataIndex][0];
                            const nominations = oscarData.filter(d => d.Film === film).length;
                            return `Total Nominations: ${nominations}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b0b0b0'
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#b0b0b0',
                        font: {
                            size: 11
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const film = topWins[elements[0].index][0];
                    showFilmDetails(film);
                }
            }
        }
    });
    
    // Show details for top 5 films with most wins
    showTopWinsDetails(topWins.slice(0, 5));
}

// Show top wins details
function showTopWinsDetails(topWins) {
    const container = document.getElementById('wins-details');
    
    container.innerHTML = topWins.map(([film, wins]) => {
        const nominations = oscarData.filter(d => d.Film === film).length;
        
        return `
            <div class="film-detail-card">
                <div class="film-detail-title">${film}</div>
                <div class="film-detail-stats">
                    <span class="gold-text">${wins} Oscars</span>
                    <span>from ${nominations} Nominations</span>
                </div>
            </div>
        `;
    }).join('');
}
function createCategoryCards() {
    const categoryData = {};
    const categoryIcons = {
        'Acting': '🎭',
        'Directing': '🎬',
        'Writing': '✍️',
        'Music': '🎵',
        'Production': '🎨',
        'SciTech': '🔬',
        'Special': '⭐',
        'Title': '📝'
    };
    
    oscarData.forEach(d => {
        if (d.Winner === true || d.Winner === "True") {
            const category = d.Class || 'Other';
            categoryData[category] = (categoryData[category] || 0) + 1;
        }
    });
    
    const container = document.getElementById('category-grid');
    container.innerHTML = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => `
            <div class="category-card" data-category="${category}">
                <div class="category-icon">${categoryIcons[category] || '🏆'}</div>
                <div class="category-name">${category}</div>
                <div class="category-count">${count}</div>
            </div>
        `).join('');
}

// Update timeline
function updateTimeline(ceremony) {
    currentCeremony = ceremony;
    
    // Update year display
    // First ceremony was in 1929, so year = 1928 + ceremony number
    const year = 1928 + ceremony;
    document.getElementById('current-year').textContent = year;
    document.getElementById('ceremony-number').textContent = ceremony;
    
    // Get data for this ceremony
    const ceremonyData = oscarData.filter(d => d.Ceremony === ceremony);
    const winners = ceremonyData.filter(d => d.Winner === true || d.Winner === "True");
    
    // Main categories to show
    const mainCategories = [
        { key: 'BEST PICTURE', icon: '🎬', label: 'Best Picture' },
        { key: 'ACTOR IN A LEADING ROLE', icon: '🎭', label: 'Best Actor' },
        { key: 'ACTRESS IN A LEADING ROLE', icon: '👑', label: 'Best Actress' },
        { key: 'DIRECTING', icon: '🎥', label: 'Best Director' },
        { key: 'WRITING', icon: '✍️', label: 'Best Screenplay' },
        { key: 'CINEMATOGRAPHY', icon: '📷', label: 'Cinematography' }
    ];
    
    const container = document.getElementById('timeline-content');
    let html = '';
    
    mainCategories.forEach(category => {
        const winner = winners.find(w => 
            w.CanonicalCategory?.includes(category.key) || 
            w.Category?.includes(category.key.split(' ')[0])
        );
        
        if (winner) {
            html += `
                <div class="winner-card animate-in" onclick="showDetails('${winner.NomId}')">
                    <div class="winner-category">${category.icon} ${category.label}</div>
                    <div class="winner-name">${winner.Name || winner.Nominees || 'N/A'}</div>
                    <div class="winner-film">${winner.Film || 'N/A'}</div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html || '<p style="text-align: center; color: var(--text-secondary);">No data available for this ceremony</p>';
}

// Initialize event listeners
function initializeEventListeners() {
    // Year slider
    const yearSlider = document.getElementById('year-slider');
    yearSlider.addEventListener('input', (e) => {
        updateTimeline(parseInt(e.target.value));
    });
    
    // Decade buttons
    document.querySelectorAll('.decade-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.decade-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const decade = e.target.dataset.decade;
            if (decade === 'all') {
                yearSlider.value = currentCeremony;
            } else {
                // Correct calculation: First ceremony (1) was in 1929 for 1927/28 films
                const targetYear = parseInt(decade);
                const ceremony = targetYear - 1928; // 1929 = ceremony 1, so year - 1928
                
                // Ensure we're within valid range
                const validCeremony = Math.max(1, Math.min(97, ceremony));
                yearSlider.value = validCeremony;
                updateTimeline(validCeremony);
            }
        });
    });
    
    // Search with autocomplete
    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('search-suggestions');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) {
            suggestionsBox.classList.remove('active');
            return;
        }
        
        const matches = searchIndex
            .filter(item => item.searchText.includes(query))
            .slice(0, 10);
        
        if (matches.length > 0) {
            suggestionsBox.innerHTML = matches.map(item => `
                <div class="suggestion-item" onclick="searchFor('${item.title}', '${item.type}')">
                    <div class="suggestion-category">${item.type}</div>
                    <div class="suggestion-title">${item.title}</div>
                </div>
            `).join('');
            suggestionsBox.classList.add('active');
        } else {
            suggestionsBox.classList.remove('active');
        }
    });
    
    // Click outside to close suggestions
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            suggestionsBox.classList.remove('active');
        }
    });
    
    // Modal close
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('detail-modal').classList.add('hidden');
    });
    
    // Click outside modal to close
    document.getElementById('detail-modal').addEventListener('click', (e) => {
        if (e.target.id === 'detail-modal') {
            document.getElementById('detail-modal').classList.add('hidden');
        }
    });
    
    // Category cards
    document.addEventListener('click', (e) => {
        if (e.target.closest('.category-card')) {
            const category = e.target.closest('.category-card').dataset.category;
            showCategoryDetails(category);
        }
    });
}

// Search for specific item
function searchFor(query, type) {
    const searchInput = document.getElementById('search-input');
    searchInput.value = query;
    document.getElementById('search-suggestions').classList.remove('active');
    
    performSearch(query, type);
}

// Perform search
function performSearch(query, type) {
    const searchTerm = query.toLowerCase();
    
    const results = oscarData.filter(d => {
        const film = (d.Film || '').toString().toLowerCase();
        const name = (d.Name || '').toString().toLowerCase();
        const nominees = (d.Nominees || '').toString().toLowerCase();
        
        if (type === 'Film') {
            return film === searchTerm;
        } else if (type === 'Person') {
            return name === searchTerm || nominees === searchTerm;
        } else {
            return film.includes(searchTerm) || 
                   name.includes(searchTerm) || 
                   nominees.includes(searchTerm);
        }
    });
    
    displayResults(results, query);
}

// Display search results
function displayResults(results, query) {
    const container = document.getElementById('results-container');
    const section = document.getElementById('search-results');
    
    if (results.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No results found</p>';
    } else {
        // Group by film or person
        const grouped = {};
        results.forEach(r => {
            const key = r.Film || r.Name || 'Unknown';
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(r);
        });
        
        container.innerHTML = Object.entries(grouped).slice(0, 20).map(([key, entries]) => {
            const wins = entries.filter(e => e.Winner === true || e.Winner === "True").length;
            const nominations = entries.length;
            
            return `
                <div class="result-card animate-in" onclick="showGroupDetails('${key.replace(/'/g, "\\'")}')">
                    <div class="result-type">${entries[0].Film ? 'Film' : 'Person'}</div>
                    <div class="result-title">${key}</div>
                    <div class="result-info">
                        ${nominations} Nomination${nominations > 1 ? 's' : ''}
                        ${wins > 0 ? `<span class="gold-text"> • ${wins} Win${wins > 1 ? 's' : ''}</span>` : ''}
                    </div>
                    ${wins > 0 ? '<span class="winner-badge">🏆 Winner</span>' : ''}
                </div>
            `;
        }).join('');
    }
    
    section.classList.remove('hidden');
}

// Show details modal
function showDetails(nomId) {
    const entry = oscarData.find(d => d.NomId === nomId);
    if (!entry) return;
    
    const modal = document.getElementById('detail-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>${entry.Film || entry.Name || 'Details'}</h2>
        <div class="modal-details">
            <p><strong>Category:</strong> ${entry.Category || entry.CanonicalCategory}</p>
            <p><strong>Year:</strong> ${entry.Year}</p>
            <p><strong>Ceremony:</strong> #${entry.Ceremony}</p>
            ${entry.Name ? `<p><strong>Nominee:</strong> ${entry.Name}</p>` : ''}
            ${entry.Film ? `<p><strong>Film:</strong> ${entry.Film}</p>` : ''}
            ${entry.Detail ? `<p><strong>Role/Detail:</strong> ${entry.Detail}</p>` : ''}
            ${(entry.Winner === true || entry.Winner === "True") ? '<p class="winner-badge">🏆 WINNER</p>' : ''}
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Show film details
function showFilmDetails(filmName) {
    const entries = oscarData.filter(d => d.Film === filmName);
    const wins = entries.filter(e => e.Winner === true || e.Winner === "True");
    
    const modal = document.getElementById('detail-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>${filmName}</h2>
        <div class="modal-stats">
            <span>${entries.length} Nominations</span>
            <span class="gold-text">${wins.length} Wins</span>
        </div>
        <div class="modal-categories">
            <h3>Nominations:</h3>
            ${entries.map(e => `
                <div class="modal-entry">
                    <strong>${e.Category || e.CanonicalCategory}</strong>
                    ${e.Name ? ` - ${e.Name}` : ''}
                    ${(e.Winner === true || e.Winner === "True") ? '<span class="winner-badge">Won</span>' : ''}
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Show category details
function showCategoryDetails(category) {
    const entries = oscarData.filter(d => 
        d.Class === category && (d.Winner === true || d.Winner === "True")
    );
    
    const modal = document.getElementById('detail-modal');
    const modalBody = document.getElementById('modal-body');
    
    // Group by year
    const byYear = {};
    entries.forEach(e => {
        const year = e.Year || 'Unknown';
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(e);
    });
    
    // Sort years and show all results
    const sortedYears = Object.entries(byYear)
        .sort((a, b) => b[0].localeCompare(a[0]));
    
    modalBody.innerHTML = `
        <h2>${category} Winners</h2>
        <p class="modal-subtitle">Total: ${entries.length} winners across ${sortedYears.length} years</p>
        <div class="modal-categories" style="max-height: 60vh; overflow-y: auto;">
            ${sortedYears.map(([year, winners]) => `
                <div class="year-group">
                    <h3>${year}</h3>
                    ${winners.map(w => `
                        <div class="modal-entry">
                            <strong>${w.Name || w.Film}</strong>
                            ${w.Film && w.Name ? ` - ${w.Film}` : ''}
                            ${w.Category ? ` (${w.Category})` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Show group details (for search results)
function showGroupDetails(key) {
    const entries = oscarData.filter(d => d.Film === key || d.Name === key);
    
    if (entries[0].Film === key) {
        showFilmDetails(key);
    } else {
        // Person details
        const modal = document.getElementById('detail-modal');
        const modalBody = document.getElementById('modal-body');
        
        const wins = entries.filter(e => e.Winner === true || e.Winner === "True");
        
        modalBody.innerHTML = `
            <h2>${key}</h2>
            <div class="modal-stats">
                <span>${entries.length} Nominations</span>
                <span class="gold-text">${wins.length} Wins</span>
            </div>
            <div class="modal-categories">
                ${entries.map(e => `
                    <div class="modal-entry">
                        <strong>${e.Year}</strong> - ${e.Category || e.CanonicalCategory}
                        ${e.Film ? ` for "${e.Film}"` : ''}
                        ${(e.Winner === true || e.Winner === "True") ? '<span class="winner-badge">Won</span>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        modal.classList.remove('hidden');
    }
}

// Hide loading screen
function hideLoading() {
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 500);
}

// Add some CSS for modal details
const style = document.createElement('style');
style.textContent = `
    .modal-details { margin: 1.5rem 0; }
    .modal-details p { margin: 0.5rem 0; }
    .modal-subtitle { 
        color: var(--text-secondary); 
        font-size: 1rem;
        margin: 1rem 0;
    }
    .modal-stats { 
        display: flex; 
        gap: 2rem; 
        margin: 1rem 0;
        font-size: 1.2rem;
    }
    .modal-categories { margin-top: 2rem; }
    .modal-categories h3 { 
        margin: 1rem 0 0.5rem; 
        color: var(--gold);
    }
    .modal-entry { 
        padding: 0.5rem 0; 
        border-bottom: 1px solid var(--gray-medium);
    }
    .year-group { margin-bottom: 1.5rem; }
    .film-detail-title { 
        font-weight: 600; 
        margin-bottom: 0.5rem;
    }
    .film-detail-stats { 
        font-size: 0.9rem; 
        color: var(--text-secondary);
    }
`;
document.head.appendChild(style);
    