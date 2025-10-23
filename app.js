// Game State
const GameState = {
    MENU: 'menu',
    WAITING: 'waiting',
    READY: 'ready',
    FINISHED: 'finished'
};

let currentState = GameState.MENU;
let canvas, ctx, particles = [];
let targetElement;
let startTime, reactionTime;
let bestTime = localStorage.getItem('bestTime') || null;
let gamesPlayed = parseInt(localStorage.getItem('gamesPlayed')) || 0;
let animationId;

// DOM Elements
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const menuBtn = document.getElementById('menu-btn');
const clickZone = document.getElementById('click-zone');
const instruction = document.getElementById('instruction');
const timer = document.getElementById('timer');
const readyIndicator = document.getElementById('ready-indicator');
const resultTime = document.getElementById('result-time');
const rating = document.getElementById('rating');
const bestTimeDisplay = document.getElementById('best-time');
const gamesPlayedDisplay = document.getElementById('games-played');
const installPrompt = document.getElementById('install-prompt');

// Initialize Canvas for Particles
function initCanvas() {
    canvas = document.getElementById('particles-canvas');
    ctx = canvas.getContext('2d');
    targetElement = document.getElementById('target');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create particles
    for (let i = 0; i < 200; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
    
    // Start animation
    animate();
}

function resizeCanvas() {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reposition particles proportionally if canvas was resized
    if (oldWidth > 0 && oldHeight > 0) {
        const scaleX = canvas.width / oldWidth;
        const scaleY = canvas.height / oldHeight;
        particles.forEach(particle => {
            particle.x *= scaleX;
            particle.y *= scaleY;
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw and update particles
    particles.forEach(particle => {
        ctx.fillStyle = `rgba(0, 255, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
    });
    
    animationId = requestAnimationFrame(animate);
}

// Game Logic
function startGame() {
    currentState = GameState.WAITING;
    showScreen('game');
    
    instruction.textContent = 'Wait for GREEN...';
    instruction.style.color = '#ffff00';
    timer.textContent = '0ms';
    readyIndicator.classList.add('hidden');
    
    // Show target and set to red (default styling)
    targetElement.classList.remove('hidden', 'green', 'cyan');
    
    // Random delay before turning green (2-5 seconds)
    const delay = 2000 + Math.random() * 3000;
    
    setTimeout(() => {
        if (currentState === GameState.WAITING) {
            currentState = GameState.READY;
            instruction.classList.add('hidden');
            readyIndicator.classList.remove('hidden');
            targetElement.classList.remove('green');
            targetElement.classList.add('cyan');
            startTime = Date.now();
            
            // Start timer update
            updateTimer();
        }
    }, delay);
}

function updateTimer() {
    if (currentState === GameState.READY) {
        const elapsed = Date.now() - startTime;
        timer.textContent = elapsed + 'ms';
        requestAnimationFrame(updateTimer);
    }
}

function handleClick() {
    if (currentState === GameState.READY) {
        reactionTime = Date.now() - startTime;
        currentState = GameState.FINISHED;
        finishGame();
    } else if (currentState === GameState.WAITING) {
        // Too early!
        showError();
    }
}

function finishGame() {
    gamesPlayed++;
    localStorage.setItem('gamesPlayed', gamesPlayed);
    
    if (!bestTime || reactionTime < bestTime) {
        bestTime = reactionTime;
        localStorage.setItem('bestTime', bestTime);
    }
    
    // Show results
    showScreen('results');
    resultTime.textContent = reactionTime + 'ms';
    rating.textContent = getRating(reactionTime);
    
    // Celebrate animation
    celebrateEffect();
}

function showError() {
    instruction.textContent = '❌ Too early! Wait for GREEN!';
    instruction.style.color = '#ff0000';
    
    // Shake effect
    targetElement.classList.add('shake');
    setTimeout(() => {
        targetElement.classList.remove('shake');
        // Restart game after error
        setTimeout(startGame, 1000);
    }, 500);
}

function getRating(time) {
    if (time < 200) return '🚀 LIGHTNING FAST!';
    if (time < 300) return '⚡ INCREDIBLE!';
    if (time < 400) return '🔥 EXCELLENT!';
    if (time < 500) return '✨ GREAT!';
    if (time < 700) return '👍 GOOD!';
    return '😊 NICE TRY!';
}

function celebrateEffect() {
    targetElement.classList.remove('green');
    targetElement.classList.add('cyan');
}

function showScreen(screen) {
    menuScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    targetElement.classList.add('hidden');
    
    if (screen === 'menu') {
        menuScreen.classList.remove('hidden');
        bestTimeDisplay.textContent = bestTime ? bestTime + 'ms' : '-';
        gamesPlayedDisplay.textContent = gamesPlayed;
    } else if (screen === 'game') {
        gameScreen.classList.remove('hidden');
    } else if (screen === 'results') {
        resultsScreen.classList.remove('hidden');
        targetElement.classList.remove('hidden');
    }
}

// Event Listeners
startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => showScreen('menu'));
clickZone.addEventListener('click', handleClick);

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installPrompt.classList.remove('hidden');
});

installPrompt.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        installPrompt.classList.add('hidden');
    }
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installPrompt.classList.add('hidden');
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    showScreen('menu');
});
