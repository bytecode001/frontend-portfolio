// ===============================
// WEATHER APP - JavaScript
// Author: Francesco Saviano
// ===============================

// API Configuration
const API_KEY = '1eb3040523506a5f265edd35a035948c'; // Replace with your OpenWeatherMap API key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Application State
const AppState = {
    isMetric: true,
    currentWeatherData: null,
    forecastData: null,
    isLoading: false
};

// DOM Elements Cache
const DOM = {
    // Inputs & Buttons
    cityInput: null,
    searchBtn: null,
    locationBtn: null,
    unitToggle: null,
    unitC: null,
    unitF: null,
    autocompleteDropdown: null,
    
    // States
    loadingState: null,
    errorState: null,
    weatherContent: null,
    errorMessage: null,
    
    // Weather Display
    cityName: null,
    currentDate: null,
    temperature: null,
    tempUnit: null,
    weatherIcon: null,
    weatherDescription: null,
    feelsLike: null,
    humidity: null,
    windSpeed: null,
    forecastContainer: null
};

// Autocomplete variables
let autocompleteTimeout = null;
let selectedSuggestionIndex = -1;

// Weather Emoji Mapping (simplified for forecast)
const WeatherEmoji = {
    '01': '☀️',  // clear sky
    '02': '⛅',  // few clouds
    '03': '☁️',  // scattered clouds
    '04': '☁️',  // broken clouds
    '09': '🌧️',  // shower rain
    '10': '🌦️',  // rain
    '11': '⛈️',  // thunderstorm
    '13': '🌨️',  // snow
    '50': '🌫️'   // mist
};

// Weather Icon Templates
const WeatherIcons = {
    '01d': `<div class="weather-icon">
                <div class="sun-icon"></div>
            </div>`,
    '01n': `<div class="weather-icon">
                <div class="moon-icon"></div>
            </div>`,
    '02d': `<div class="weather-icon">
                <div class="sun-icon" style="width: 60px; height: 60px; position: absolute; top: -10px; right: -10px;"></div>
                <div class="cloud-icon"></div>
            </div>`,
    '02n': `<div class="weather-icon">
                <div class="moon-icon" style="width: 50px; height: 50px; position: absolute; top: -10px; right: -10px;"></div>
                <div class="cloud-icon"></div>
            </div>`,
    '03d': `<div class="weather-icon">
                <div class="cloud-icon"></div>
            </div>`,
    '03n': `<div class="weather-icon">
                <div class="cloud-icon"></div>
            </div>`,
    '04d': `<div class="weather-icon">
                <div class="cloud-icon"></div>
                <div class="cloud-icon" style="position: absolute; top: 10px; left: 20px; opacity: 0.8;"></div>
            </div>`,
    '04n': `<div class="weather-icon">
                <div class="cloud-icon"></div>
                <div class="cloud-icon" style="position: absolute; top: 10px; left: 20px; opacity: 0.8;"></div>
            </div>`,
    '09d': `<div class="weather-icon">
                <div class="rain-icon">
                    <div class="cloud-icon"></div>
                    <div class="rain-drops">
                        <span class="rain-drop"></span>
                        <span class="rain-drop"></span>
                        <span class="rain-drop"></span>
                    </div>
                </div>
            </div>`,
    '09n': `<div class="weather-icon">
                <div class="rain-icon">
                    <div class="cloud-icon"></div>
                    <div class="rain-drops">
                        <span class="rain-drop"></span>
                        <span class="rain-drop"></span>
                        <span class="rain-drop"></span>
                    </div>
                </div>
            </div>`,
    '10d': `<div class="weather-icon">
                <div class="rain-icon">
                    <div class="sun-icon" style="width: 40px; height: 40px; position: absolute; top: -20px; right: 10px; z-index: -1;"></div>
                    <div class="cloud-icon"></div>
                    <div class="rain-drops">
                        <span class="rain-drop"></span>
                        <span class="rain-drop"></span>
                        <span class="rain-drop"></span>
                    </div>
                </div>
            </div>`,
    '10n': `<div class="weather-icon">
                <div class="rain-icon">
                    <div class="cloud-icon"></div>
                    <div class="rain-drops">
                        <span class="rain-drop"></span>
                        <span class="rain-drop"></span>
                        <span class="rain-drop"></span>
                    </div>
                </div>
            </div>`,
    '11d': `<div class="weather-icon">
                <div class="rain-icon">
                    <div class="cloud-icon" style="background: #808080;"></div>
                    <div class="rain-drops">
                        <span class="rain-drop"></span>
                        <span class="rain-drop" style="background: #FFD700; box-shadow: 0 0 10px #FFD700;"></span>
                        <span class="rain-drop"></span>
                    </div>
                </div>
            </div>`,
    '11n': `<div class="weather-icon">
                <div class="rain-icon">
                    <div class="cloud-icon" style="background: #606060;"></div>
                    <div class="rain-drops">
                        <span class="rain-drop"></span>
                        <span class="rain-drop" style="background: #FFD700; box-shadow: 0 0 10px #FFD700;"></span>
                        <span class="rain-drop"></span>
                    </div>
                </div>
            </div>`,
    '13d': `<div class="weather-icon">
                <div class="snow-icon">
                    <div class="cloud-icon"></div>
                    <div class="snow-flakes">
                        <span class="snow-flake">❄</span>
                        <span class="snow-flake">❄</span>
                        <span class="snow-flake">❄</span>
                    </div>
                </div>
            </div>`,
    '13n': `<div class="weather-icon">
                <div class="snow-icon">
                    <div class="cloud-icon"></div>
                    <div class="snow-flakes">
                        <span class="snow-flake">❄</span>
                        <span class="snow-flake">❄</span>
                        <span class="snow-flake">❄</span>
                    </div>
                </div>
            </div>`,
    '50d': `<div class="weather-icon">
                <div style="width: 100px; height: 60px; position: relative;">
                    <div style="position: absolute; width: 100%; height: 3px; background: rgba(200,200,200,0.7); top: 20px;"></div>
                    <div style="position: absolute; width: 80%; height: 3px; background: rgba(200,200,200,0.5); top: 30px; left: 10%;"></div>
                    <div style="position: absolute; width: 90%; height: 3px; background: rgba(200,200,200,0.6); top: 40px; left: 5%;"></div>
                </div>
            </div>`,
    '50n': `<div class="weather-icon">
                <div style="width: 100px; height: 60px; position: relative;">
                    <div style="position: absolute; width: 100%; height: 3px; background: rgba(200,200,200,0.7); top: 20px;"></div>
                    <div style="position: absolute; width: 80%; height: 3px; background: rgba(200,200,200,0.5); top: 30px; left: 10%;"></div>
                    <div style="position: absolute; width: 90%; height: 3px; background: rgba(200,200,200,0.6); top: 40px; left: 5%;"></div>
                </div>
            </div>`
};

// ===============================
// INITIALIZATION
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌤️ Weather App Initializing...');
    initializeApp();
});

function initializeApp() {
    // Check API Key
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('❌ API Key not configured!');
        showError('Please add your OpenWeatherMap API key to app.js');
        return;
    }
    
    // Cache DOM Elements
    cacheDOM();
    
    // Setup Event Listeners
    setupEventListeners();
    
    // Try to get user location on startup
    getUserLocation();
    
    console.log('✅ Weather App Ready!');
}

function cacheDOM() {
    // Inputs & Buttons
    DOM.cityInput = document.getElementById('cityInput');
    DOM.searchBtn = document.getElementById('searchBtn');
    DOM.locationBtn = document.getElementById('locationBtn');
    DOM.unitToggle = document.getElementById('unitToggle');
    DOM.unitC = document.querySelector('.unit-c');
    DOM.unitF = document.querySelector('.unit-f');
    DOM.autocompleteDropdown = document.getElementById('autocompleteDropdown');
    
    // States
    DOM.loadingState = document.getElementById('loadingState');
    DOM.errorState = document.getElementById('errorState');
    DOM.weatherContent = document.getElementById('weatherContent');
    DOM.errorMessage = document.getElementById('errorMessage');
    
    // Weather Display
    DOM.cityName = document.getElementById('cityName');
    DOM.currentDate = document.getElementById('currentDate');
    DOM.temperature = document.getElementById('temperature');
    DOM.tempUnit = document.getElementById('tempUnit');
    DOM.weatherIcon = document.getElementById('weatherIcon');
    DOM.weatherDescription = document.getElementById('weatherDescription');
    DOM.feelsLike = document.getElementById('feelsLike');
    DOM.humidity = document.getElementById('humidity');
    DOM.windSpeed = document.getElementById('windSpeed');
    DOM.forecastContainer = document.getElementById('forecastContainer');
}

function setupEventListeners() {
    // Search functionality
    DOM.searchBtn.addEventListener('click', handleSearch);
    DOM.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
            hideAutocomplete();
        }
    });
    
    // Autocomplete functionality
    DOM.cityInput.addEventListener('input', handleAutocompleteInput);
    DOM.cityInput.addEventListener('keydown', handleAutocompleteNavigation);
    DOM.cityInput.addEventListener('focus', () => {
        if (DOM.cityInput.value.length >= 2) {
            showAutocomplete();
        }
    });
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-input-wrapper')) {
            hideAutocomplete();
        }
    });
    
    // Location button
    DOM.locationBtn.addEventListener('click', getUserLocation);
    
    // Temperature unit toggle
    DOM.unitToggle.addEventListener('click', toggleTemperatureUnit);
    
    // Input validation
    DOM.cityInput.addEventListener('input', (e) => {
        // Limit input length
        if (e.target.value.length > 50) {
            e.target.value = e.target.value.substring(0, 50);
        }
        // Clear error when user starts typing
        if (DOM.errorState.classList.contains('active')) {
            hideError();
        }
    });
}

// ===============================
// AUTOCOMPLETE FUNCTIONALITY
// ===============================

// City database for autocomplete (expandable)
const CITY_DATABASE = [
    { name: 'Rome', country: 'IT' },
    { name: 'Milan', country: 'IT' },
    { name: 'Naples', country: 'IT' },
    { name: 'Turin', country: 'IT' },
    { name: 'Florence', country: 'IT' },
    { name: 'Venice', country: 'IT' },
    { name: 'Bologna', country: 'IT' },
    { name: 'Palermo', country: 'IT' },
    { name: 'Genoa', country: 'IT' },
    { name: 'Verona', country: 'IT' },
    { name: 'London', country: 'GB' },
    { name: 'Paris', country: 'FR' },
    { name: 'Berlin', country: 'DE' },
    { name: 'Madrid', country: 'ES' },
    { name: 'Barcelona', country: 'ES' },
    { name: 'Amsterdam', country: 'NL' },
    { name: 'Vienna', country: 'AT' },
    { name: 'Prague', country: 'CZ' },
    { name: 'Brussels', country: 'BE' },
    { name: 'Lisbon', country: 'PT' },
    { name: 'Stockholm', country: 'SE' },
    { name: 'Copenhagen', country: 'DK' },
    { name: 'Oslo', country: 'NO' },
    { name: 'Helsinki', country: 'FI' },
    { name: 'Athens', country: 'GR' },
    { name: 'Dublin', country: 'IE' },
    { name: 'Warsaw', country: 'PL' },
    { name: 'Budapest', country: 'HU' },
    { name: 'Bucharest', country: 'RO' },
    { name: 'Zagreb', country: 'HR' },
    { name: 'New York', country: 'US' },
    { name: 'Los Angeles', country: 'US' },
    { name: 'Chicago', country: 'US' },
    { name: 'Houston', country: 'US' },
    { name: 'Phoenix', country: 'US' },
    { name: 'Philadelphia', country: 'US' },
    { name: 'San Antonio', country: 'US' },
    { name: 'San Diego', country: 'US' },
    { name: 'Dallas', country: 'US' },
    { name: 'San Jose', country: 'US' },
    { name: 'San Francisco', country: 'US' },
    { name: 'Boston', country: 'US' },
    { name: 'Seattle', country: 'US' },
    { name: 'Denver', country: 'US' },
    { name: 'Miami', country: 'US' },
    { name: 'Atlanta', country: 'US' },
    { name: 'Las Vegas', country: 'US' },
    { name: 'Portland', country: 'US' },
    { name: 'Detroit', country: 'US' },
    { name: 'Washington', country: 'US' },
    { name: 'Toronto', country: 'CA' },
    { name: 'Montreal', country: 'CA' },
    { name: 'Vancouver', country: 'CA' },
    { name: 'Tokyo', country: 'JP' },
    { name: 'Shanghai', country: 'CN' },
    { name: 'Beijing', country: 'CN' },
    { name: 'Mumbai', country: 'IN' },
    { name: 'Delhi', country: 'IN' },
    { name: 'Sydney', country: 'AU' },
    { name: 'Melbourne', country: 'AU' },
    { name: 'Dubai', country: 'AE' },
    { name: 'Singapore', country: 'SG' },
    { name: 'Hong Kong', country: 'HK' },
    { name: 'Seoul', country: 'KR' },
    { name: 'Bangkok', country: 'TH' },
    { name: 'Istanbul', country: 'TR' },
    { name: 'Moscow', country: 'RU' },
    { name: 'São Paulo', country: 'BR' },
    { name: 'Rio de Janeiro', country: 'BR' },
    { name: 'Buenos Aires', country: 'AR' },
    { name: 'Mexico City', country: 'MX' },
    { name: 'Cairo', country: 'EG' },
    { name: 'Cape Town', country: 'ZA' },
    { name: 'Johannesburg', country: 'ZA' }
];

function handleAutocompleteInput(e) {
    const query = e.target.value.trim().toLowerCase();
    
    // Clear previous timeout
    clearTimeout(autocompleteTimeout);
    
    // Reset selection
    selectedSuggestionIndex = -1;
    
    if (query.length < 2) {
        hideAutocomplete();
        return;
    }
    
    // Debounce autocomplete
    autocompleteTimeout = setTimeout(() => {
        const suggestions = CITY_DATABASE
            .filter(city => city.name.toLowerCase().startsWith(query))
            .slice(0, 8); // Limit to 8 suggestions
        
        displayAutocompleteSuggestions(suggestions, query);
    }, 150);
}

function displayAutocompleteSuggestions(suggestions, query) {
    if (suggestions.length === 0) {
        hideAutocomplete();
        return;
    }
    
    DOM.autocompleteDropdown.innerHTML = suggestions
        .map((city, index) => {
            const regex = new RegExp(`^(${query})`, 'i');
            const highlightedName = city.name.replace(regex, '<strong>$1</strong>');
            
            return `
                <div class="autocomplete-item" data-index="${index}" data-city="${city.name}">
                    ${highlightedName}<small>${city.country}</small>
                </div>
            `;
        })
        .join('');
    
    // Add click handlers to suggestions
    DOM.autocompleteDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            const cityName = item.getAttribute('data-city');
            DOM.cityInput.value = cityName;
            hideAutocomplete();
            handleSearch();
        });
    });
    
    showAutocomplete();
}

function handleAutocompleteNavigation(e) {
    const items = DOM.autocompleteDropdown.querySelectorAll('.autocomplete-item');
    
    if (!DOM.autocompleteDropdown.classList.contains('active') || items.length === 0) {
        return;
    }
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, items.length - 1);
            updateSelectedSuggestion(items);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
            updateSelectedSuggestion(items);
            break;
            
        case 'Enter':
            e.preventDefault();
            if (selectedSuggestionIndex >= 0 && items[selectedSuggestionIndex]) {
                const cityName = items[selectedSuggestionIndex].getAttribute('data-city');
                DOM.cityInput.value = cityName;
                hideAutocomplete();
                handleSearch();
            }
            break;
            
        case 'Escape':
            hideAutocomplete();
            break;
    }
}

function updateSelectedSuggestion(items) {
    items.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add('selected');
            // Update input with selected city
            DOM.cityInput.value = item.getAttribute('data-city');
        } else {
            item.classList.remove('selected');
        }
    });
}

function showAutocomplete() {
    DOM.autocompleteDropdown.classList.add('active');
}

function hideAutocomplete() {
    DOM.autocompleteDropdown.classList.remove('active');
    DOM.autocompleteDropdown.innerHTML = '';
    selectedSuggestionIndex = -1;
}

// ===============================
// EVENT HANDLERS
// =============================== 

function handleSearch() {
    const city = DOM.cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    if (AppState.isLoading) {
        console.log('⏳ Search already in progress...');
        return;
    }
    
    console.log(`🔍 Searching for: ${city}`);
    fetchWeatherByCity(city);
}

function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    if (AppState.isLoading) {
        console.log('⏳ Request already in progress...');
        return;
    }
    
    console.log('📍 Getting user location...');
    showLoading(true);
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`📍 Location found: ${latitude}, ${longitude}`);
            fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
            console.error('📍 Location error:', error);
            showLoading(false);
            showError('Unable to get your location. Please search for a city instead.');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function toggleTemperatureUnit() {
    AppState.isMetric = !AppState.isMetric;
    
    // Update UI
    DOM.unitC.classList.toggle('active');
    DOM.unitF.classList.toggle('active');
    
    // Re-render if we have data
    if (AppState.currentWeatherData) {
        updateCurrentWeather(AppState.currentWeatherData);
    }
    if (AppState.forecastData) {
        updateForecast(AppState.forecastData);
    }
    
    console.log(`🌡️ Switched to ${AppState.isMetric ? 'Celsius' : 'Fahrenheit'}`);
}

// ===============================
// API CALLS
// ===============================

async function fetchWeatherByCity(city) {
    AppState.isLoading = true;
    showLoading(true);
    hideError();
    
    try {
        // Current Weather
        const weatherUrl = `${API_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            if (weatherResponse.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            }
            throw new Error('Failed to fetch weather data');
        }
        
        const weatherData = await weatherResponse.json();
        console.log('☁️ Weather data received:', weatherData);
        
        // Forecast
        const forecastUrl = `${API_BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        const forecastData = await forecastResponse.json();
        console.log('📅 Forecast data received');
        
        // Store data
        AppState.currentWeatherData = weatherData;
        AppState.forecastData = forecastData;
        
        // Update UI
        updateCurrentWeather(weatherData);
        updateForecast(forecastData);
        updateBackground(weatherData.weather[0].id);
        
        // Clear input
        DOM.cityInput.value = '';
        
    } catch (error) {
        console.error('❌ Error:', error);
        showError(error.message);
    } finally {
        AppState.isLoading = false;
        showLoading(false);
    }
}

async function fetchWeatherByCoords(lat, lon) {
    AppState.isLoading = true;
    showLoading(true);
    hideError();
    
    try {
        // Current Weather
        const weatherUrl = `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const weatherData = await weatherResponse.json();
        console.log('☁️ Weather data received:', weatherData);
        
        // Forecast
        const forecastUrl = `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        const forecastData = await forecastResponse.json();
        console.log('📅 Forecast data received');
        
        // Store data
        AppState.currentWeatherData = weatherData;
        AppState.forecastData = forecastData;
        
        // Update UI
        updateCurrentWeather(weatherData);
        updateForecast(forecastData);
        updateBackground(weatherData.weather[0].id);
        
    } catch (error) {
        console.error('❌ Error:', error);
        showError(error.message);
    } finally {
        AppState.isLoading = false;
        showLoading(false);
    }
}

// ===============================
// UI UPDATES
// ===============================

function updateCurrentWeather(data) {
    // Temperature conversions
    const temp = AppState.isMetric ? 
        Math.round(data.main.temp) : 
        Math.round((data.main.temp * 9/5) + 32);
    
    const feelsLike = AppState.isMetric ? 
        Math.round(data.main.feels_like) : 
        Math.round((data.main.feels_like * 9/5) + 32);
    
    const unit = AppState.isMetric ? '°C' : '°F';
    
    // Wind speed conversion
    const windSpeed = AppState.isMetric ? 
        Math.round(data.wind.speed * 3.6) : // m/s to km/h
        Math.round(data.wind.speed * 2.237); // m/s to mph
    
    const windUnit = AppState.isMetric ? 'km/h' : 'mph';
    
    // Update DOM
    DOM.cityName.textContent = data.name;
    DOM.currentDate.textContent = formatDate(new Date());
    DOM.temperature.textContent = temp;
    DOM.tempUnit.textContent = unit;
    DOM.weatherDescription.textContent = data.weather[0].description;
    DOM.feelsLike.textContent = `${feelsLike}${unit}`;
    DOM.humidity.textContent = `${data.main.humidity}%`;
    DOM.windSpeed.textContent = `${windSpeed} ${windUnit}`;
    
    // Weather Icon
    const iconCode = data.weather[0].icon;
    DOM.weatherIcon.innerHTML = WeatherIcons[iconCode] || WeatherIcons['01d'];
    
    // Show weather content
    showWeatherContent();
}

function updateForecast(data) {
    DOM.forecastContainer.innerHTML = '';
    
    // Group forecast by day
    const dailyData = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Take the forecast around midday (12:00 PM) for better representation
        const hour = date.getHours();
        if (!dailyData[day] || (hour >= 11 && hour <= 13)) {
            dailyData[day] = {
                temp: item.main.temp,
                icon: item.weather[0].icon,
                date: date
            };
        }
    });
    
    // Get next 5 days
    const days = Object.keys(dailyData).slice(0, 5);
    
    days.forEach((day, index) => {
        const dayData = dailyData[day];
        const temp = AppState.isMetric ? 
            Math.round(dayData.temp) : 
            Math.round((dayData.temp * 9/5) + 32);
        
        const unit = AppState.isMetric ? '°C' : '°F';
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.style.animationDelay = `${index * 0.1}s`;
        
        // Get weather emoji - use only the first 2 characters to ignore day/night
        const iconCode = dayData.icon.substring(0, 2);
        const weatherEmoji = WeatherEmoji[iconCode] || '🌡️';
        
        forecastItem.innerHTML = `
            <div class="forecast-day">${day}</div>
            <div class="forecast-weather">${weatherEmoji}</div>
            <div class="forecast-temp">${temp}${unit}</div>
        `;
        
        DOM.forecastContainer.appendChild(forecastItem);
    });
}

function updateBackground(weatherCode) {
    // Remove all weather classes
    document.body.className = document.body.className.replace(/weather-\w+/g, '');
    
    // Add appropriate weather class
    if (weatherCode >= 200 && weatherCode < 300) {
        document.body.classList.add('weather-thunderstorm');
    } else if (weatherCode >= 300 && weatherCode < 600) {
        document.body.classList.add('weather-rain');
    } else if (weatherCode >= 600 && weatherCode < 700) {
        document.body.classList.add('weather-snow');
    } else if (weatherCode >= 700 && weatherCode < 800) {
        document.body.classList.add('weather-mist');
    } else if (weatherCode === 800) {
        document.body.classList.add('weather-clear');
    } else {
        document.body.classList.add('weather-clouds');
    }
}

// ===============================
// UI STATE MANAGEMENT
// ===============================

function showLoading(show) {
    if (show) {
        DOM.loadingState.classList.add('active');
        DOM.weatherContent.classList.remove('active');
        DOM.errorState.classList.remove('active');
    } else {
        DOM.loadingState.classList.remove('active');
    }
}

function showError(message) {
    DOM.errorMessage.textContent = message;
    DOM.errorState.classList.add('active');
    DOM.weatherContent.classList.remove('active');
    DOM.loadingState.classList.remove('active');
}

function hideError() {
    DOM.errorState.classList.remove('active');
}

function showWeatherContent() {
    DOM.weatherContent.classList.add('active');
    DOM.loadingState.classList.remove('active');
    DOM.errorState.classList.remove('active');
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

function formatDate(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
}

// ===============================
// INITIALIZATION MESSAGE & API KEY WARNING
// ===============================

console.log(`
%c🌤️ Weather App by Francesco Saviano 
%c⚡ Remember to add your OpenWeatherMap API key!
%c📍 Get your free key at: https://openweathermap.org/api

%c⚠️  SECURITY WARNING:
%cNever expose your API key on GitHub Pages or public repositories!
Consider using environment variables or a backend service for production.
`, 
'color: #667eea; font-size: 16px; font-weight: bold;',
'color: #FFD700; font-size: 14px;',
'color: #4CAF50; font-size: 14px;',
'color: #FF0000; font-size: 16px; font-weight: bold; margin-top: 10px;',
'color: #FF6B6B; font-size: 12px;'
);