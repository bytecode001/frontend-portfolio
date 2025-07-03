// Timer State
let timer = {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    isPaused: false,
    mode: 'pomodoro',
    interval: null,
    sessionsCompleted: 0
};

// Timer Settings
let settings = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: false,
    soundEnabled: true
};

// DOM Elements
const timerDisplay = document.getElementById('timerDisplay');
const timerLabel = document.getElementById('timerLabel');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionCount = document.getElementById('sessionCount');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const saveSettings = document.getElementById('saveSettings');
const tabBtns = document.querySelectorAll('.tab-btn');
const progressCircle = document.querySelector('.progress-ring__circle');
const notificationSound = document.getElementById('notificationSound');

// Progress ring setup
const radius = progressCircle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

// Initialize
loadSettings();
updateDisplay();

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
settingsBtn.addEventListener('click', openSettings);
closeModal.addEventListener('click', closeSettings);
saveSettings.addEventListener('click', saveSettingsHandler);

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !settingsModal.classList.contains('hidden')) {
        e.preventDefault();
        timer.isRunning ? pauseTimer() : startTimer();
    }
    if (e.code === 'KeyR' && !settingsModal.classList.contains('hidden')) {
        resetTimer();
    }
    if (e.code === 'Escape' && !settingsModal.classList.contains('hidden')) {
        closeSettings();
    }
});

// Timer Functions
function startTimer() {
    if (timer.isRunning) return;
    
    timer.isRunning = true;
    timer.isPaused = false;
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    
    // Add pulse animation to timer
    document.querySelector('.timer-ring').style.animation = 'pulse 2s ease-in-out infinite';
    
    timer.interval = setInterval(() => {
        if (timer.seconds === 0) {
            if (timer.minutes === 0) {
                completeSession();
                return;
            }
            timer.minutes--;
            timer.seconds = 59;
        } else {
            timer.seconds--;
        }
        updateDisplay();
        updateProgress();
    }, 1000);
}

function pauseTimer() {
    if (!timer.isRunning) return;
    
    timer.isRunning = false;
    timer.isPaused = true;
    clearInterval(timer.interval);
    
    pauseBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
    
    // Remove pulse animation
    document.querySelector('.timer-ring').style.animation = 'none';
}

function resetTimer() {
    clearInterval(timer.interval);
    timer.isRunning = false;
    timer.isPaused = false;
    timer.minutes = settings[timer.mode];
    timer.seconds = 0;
    
    pauseBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
    
    updateDisplay();
    updateProgress();
    
    // Remove pulse animation
    document.querySelector('.timer-ring').style.animation = 'none';
    
    // Add a subtle fade animation on reset
    document.querySelector('.timer-display').style.opacity = '0';
    setTimeout(() => {
        document.querySelector('.timer-display').style.transition = 'opacity 0.3s ease-in-out';
        document.querySelector('.timer-display').style.opacity = '1';
    }, 100);
}

function completeSession() {
    clearInterval(timer.interval);
    timer.isRunning = false;
    
    // Play notification sound
    if (settings.soundEnabled) {
        playNotification();
    }
    
    // Show notification
    showNotification();
    
    // Update session count for pomodoro sessions
    if (timer.mode === 'pomodoro') {
        timer.sessionsCompleted++;
        sessionCount.textContent = timer.sessionsCompleted;
        animateSessionCount();
    }
    
    // Auto-switch to next mode
    if (timer.mode === 'pomodoro') {
        // Every 4th pomodoro, take a long break
        if (timer.sessionsCompleted % 4 === 0) {
            switchMode('longBreak');
        } else {
            switchMode('shortBreak');
        }
    } else {
        // After break, go back to pomodoro
        switchMode('pomodoro');
    }
    
    // Auto-start if enabled
    if (settings.autoStartBreaks && timer.mode !== 'pomodoro') {
        setTimeout(() => startTimer(), 1000);
    }
}

function switchMode(mode) {
    timer.mode = mode;
    timer.minutes = settings[mode];
    timer.seconds = 0;
    
    // Update active tab
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Update timer label
    const labels = {
        pomodoro: 'Focus Time',
        shortBreak: 'Short Break',
        longBreak: 'Long Break'
    };
    timerLabel.textContent = labels[mode];
    
    // Update progress ring color
    const colors = {
        pomodoro: '#FF6B6B',
        shortBreak: '#4ECDC4',
        longBreak: '#45B7D1'
    };
    progressCircle.style.stroke = colors[mode];
    
    // Reset timer if it was running
    if (timer.isRunning) {
        resetTimer();
    } else {
        updateDisplay();
        updateProgress();
    }
}

// Display Functions
function updateDisplay() {
    const minutes = timer.minutes.toString().padStart(2, '0');
    const seconds = timer.seconds.toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
    
    // Update page title
    document.title = `${minutes}:${seconds} - Pomodoro Timer`;
}

function updateProgress() {
    const totalSeconds = settings[timer.mode] * 60;
    const currentSeconds = timer.minutes * 60 + timer.seconds;
    const progress = 1 - (currentSeconds / totalSeconds);
    const offset = circumference - (progress * circumference);
    
    progressCircle.style.strokeDashoffset = offset;
}

// Settings Functions
function openSettings() {
    settingsModal.classList.remove('hidden');
    
    // Load current settings into inputs
    document.getElementById('pomodoroTime').value = settings.pomodoro;
    document.getElementById('shortBreakTime').value = settings.shortBreak;
    document.getElementById('longBreakTime').value = settings.longBreak;
    document.getElementById('autoStartBreaks').checked = settings.autoStartBreaks;
    document.getElementById('soundEnabled').checked = settings.soundEnabled;
}

function closeSettings() {
    settingsModal.classList.add('hidden');
}

function saveSettingsHandler() {
    // Get values from inputs
    settings.pomodoro = parseInt(document.getElementById('pomodoroTime').value);
    settings.shortBreak = parseInt(document.getElementById('shortBreakTime').value);
    settings.longBreak = parseInt(document.getElementById('longBreakTime').value);
    settings.autoStartBreaks = document.getElementById('autoStartBreaks').checked;
    settings.soundEnabled = document.getElementById('soundEnabled').checked;
    
    // Save to localStorage
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    
    // Update current timer if not running
    if (!timer.isRunning) {
        timer.minutes = settings[timer.mode];
        timer.seconds = 0;
        updateDisplay();
        updateProgress();
    }
    
    closeSettings();
    
    // Show save confirmation
    showToast('Settings saved!');
}

function loadSettings() {
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
        settings = JSON.parse(saved);
    }
}

// Notification Functions
function playNotification() {
    // Create a simple beep sound using Web Audio API as fallback
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function showNotification() {
    // Browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('Pomodoro Timer', {
            body: timer.mode === 'pomodoro' ? 'Time for a break!' : 'Ready to focus!',
            icon: '🍅',
            badge: '🍅'
        });
        
        setTimeout(() => notification.close(), 5000);
    }
    
    // Visual notification
    document.querySelector('.timer-ring').style.animation = 'glow 1s ease-in-out 3';
    setTimeout(() => {
        document.querySelector('.timer-ring').style.animation = 'none';
    }, 3000);
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Animation Functions
function animateSessionCount() {
    sessionCount.style.animation = 'pulse 0.5s ease-in-out';
    setTimeout(() => {
        sessionCount.style.animation = 'none';
    }, 500);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        animation: slideUp 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translate(-50%, 100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
    
    @keyframes slideDown {
        from {
            transform: translate(-50%, 0);
            opacity: 1;
        }
        to {
            transform: translate(-50%, 100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Visibility change handling
document.addEventListener('visibilitychange', () => {
    if (document.hidden && timer.isRunning) {
        document.title = '⏰ Timer Running!';
    }
});

// Prevent accidental page close when timer is running
window.addEventListener('beforeunload', (e) => {
    if (timer.isRunning) {
        e.preventDefault();
        e.returnValue = '';
    }
});