// Game State
const GameState = {
    MENU: 'menu',
    WAITING: 'waiting', 
    READY: 'ready',
    FINISHED: 'finished'
};

let currentState = GameState.MENU;
let canvas, ctx, particles = [], clickParticles = [];
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
const instruction = document.getElementById('instruction');
const timer = document.getElementById('timer');
const readyIndicator = document.getElementById('ready-indicator');
const resultTime = document.getElementById('result-time');
const rating = document.getElementById('rating');
const bestTimeDisplay = document.getElementById('best-time');
const gamesPlayedDisplay = document.getElementById('games-played');

// New UI elements
const statsDisplay = document.getElementById('stats-display');
const timerDisplay = document.getElementById('timer-display');
const instructionDisplay = document.getElementById('instruction-display');
const bestTimeCorner = document.getElementById('best-time-corner');
const gamesPlayedCorner = document.getElementById('games-played-corner');

// Initialize Canvas for Particles
function initCanvas() {
    canvas = document.getElementById('particles-canvas');
    ctx = canvas.getContext('2d');
    targetElement = document.getElementById('target');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create background particles
    for (let i = 0; i < 150; i++) {
        particles.push(createBackgroundParticle());
    }
    
    // Add click event for target
    targetElement.addEventListener('click', handleTargetClick);
    
    // Add additional debugging
    targetElement.addEventListener('mousedown', (e) => {
        console.log('Target mousedown detected!');
    });
    
    targetElement.addEventListener('touchstart', (e) => {
        console.log('Target touchstart detected!');
        handleTargetClick(e);
    });
    
    // Start animation loop
    animate();
}

function createBackgroundParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.4 + 0.2,
        hue: Math.random() * 60 + 180, // Cyan-blue range
        life: 1
    };
}

function createClickParticle(x, y, color = '#00ffff') {
    const count = 20 + Math.random() * 30; // 20-50 particles per click
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 2 + Math.random() * 8;
        clickParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 4,
            life: 1,
            decay: 0.015 + Math.random() * 0.01,
            color: color,
            hue: currentState === GameState.READY ? 180 : (Math.random() * 60 + 300), // Cyan for success, magenta for early
            gravity: 0.1
        });
    }
}

function resizeCanvas() {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reposition background particles proportionally
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
    
    // Draw background particles
    particles.forEach(particle => {
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
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
        
        // Subtle breathing effect
        particle.opacity += (Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.1) * 0.1;
    });
    
    // Draw click particles with physics
    for (let i = clickParticles.length - 1; i >= 0; i--) {
        const particle = clickParticles[i];
        
        // Apply physics
        particle.vy += particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= particle.decay;
        
        // Draw particle with glow effect
        const alpha = particle.life;
        const size = particle.size * particle.life;
        
        // Outer glow
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner particle
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 70%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Remove dead particles
        if (particle.life <= 0) {
            clickParticles.splice(i, 1);
        }
    }
    
    animationId = requestAnimationFrame(animate);
}

// Game Logic
function startGame() {
    currentState = GameState.WAITING;
    showScreen('game');
    
    // Update corner UI
    updateCornerUI();
    
    instruction.textContent = 'Wait for CYAN...';
    instruction.style.color = '#ffff00';
    timer.textContent = '0ms';
    readyIndicator.classList.add('hidden');
    
    targetElement.classList.remove('hidden', 'cyan');
    
    const delay = 2000 + Math.random() * 3000;
    
    setTimeout(() => {
        if (currentState === GameState.WAITING) {
            currentState = GameState.READY;
            instruction.classList.add('hidden');
            readyIndicator.classList.remove('hidden');
            targetElement.classList.add('cyan');
            startTime = Date.now();
            updateTimer(); // Start timer updates
        }
    }, delay);
}

function updateCornerUI() {
    if (bestTimeCorner) bestTimeCorner.textContent = bestTime ? bestTime + 'ms' : '-';
    if (gamesPlayedCorner) gamesPlayedCorner.textContent = gamesPlayed;
}

function updateTimer() {
    if (currentState === GameState.READY) {
        const elapsed = Date.now() - startTime;
        timer.textContent = elapsed + 'ms';
        
        // Continue timer only if still in READY state
        if (currentState === GameState.READY) {
            requestAnimationFrame(updateTimer);
        }
    }
}

function handleTargetClick(event) {
    console.log('Target clicked! Current state:', currentState); // Debug log
    
    // Prevent event bubbling
    event.stopPropagation();
    
    // Get click position for particle effect
    const rect = targetElement.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;
    
    if (currentState === GameState.READY) {
        // Successful click
        reactionTime = Date.now() - startTime;
        currentState = GameState.FINISHED;
        
        console.log('Success! Reaction time:', reactionTime); // Debug log
        
        // Create success particle explosion
        createClickParticle(clickX, clickY, '#00ffff');
        
        finishGame();
    } else if (currentState === GameState.WAITING) {
        // Too early - create error particle effect
        console.log('Too early click!'); // Debug log
        createClickParticle(clickX, clickY, '#ff00ff');
        showError();
    }
}

function showError() {
    instruction.textContent = '❌ Too early! Wait for CYAN!';
    instruction.style.color = '#ff0000';
    
    // Shake effect
    targetElement.style.animation = 'none';
    targetElement.offsetHeight; // Trigger reflow
    targetElement.style.animation = 'rotate 4s linear infinite, targetPulse 2s ease-in-out infinite, shake 0.5s ease-in-out';
    
    setTimeout(() => {
        targetElement.style.animation = 'rotate 4s linear infinite, targetPulse 2s ease-in-out infinite';
        setTimeout(startGame, 1000);
    }, 500);
}

function finishGame() {
    gamesPlayed++;
    localStorage.setItem('gamesPlayed', gamesPlayed);
    
    if (!bestTime || reactionTime < bestTime) {
        bestTime = reactionTime;
        localStorage.setItem('bestTime', bestTime);
    }
    
    showScreen('results');
    resultTime.textContent = reactionTime + 'ms';
    rating.textContent = getRating(reactionTime);
    
    // Update corner stats
    updateCornerUI();
    
    // Celebration particle effect
    setTimeout(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        createClickParticle(centerX, centerY, '#ffff00');
    }, 200);
}

function getRating(time) {
    if (time < 200) return '🚀 LIGHTNING FAST!';
    if (time < 300) return '⚡ INCREDIBLE!';
    if (time < 400) return '🔥 EXCELLENT!';
    if (time < 500) return '✨ GREAT!';
    if (time < 700) return '👍 GOOD!';
    return '😊 NICE TRY!';
}

function showScreen(screen) {
    // Hide all screens
    menuScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    targetElement.classList.add('hidden');
    
    // Hide corner UI by default
    if (statsDisplay) statsDisplay.classList.add('hidden');
    if (timerDisplay) timerDisplay.classList.add('hidden');
    if (instructionDisplay) instructionDisplay.classList.add('hidden');
    
    if (screen === 'menu') {
        menuScreen.classList.remove('hidden');
        bestTimeDisplay.textContent = bestTime ? bestTime + 'ms' : '-';
        gamesPlayedDisplay.textContent = gamesPlayed;
    } else if (screen === 'game') {
        // Minimal central UI, show corner elements
        if (statsDisplay) statsDisplay.classList.remove('hidden');
        if (timerDisplay) timerDisplay.classList.remove('hidden');
        if (instructionDisplay) instructionDisplay.classList.remove('hidden');
        targetElement.classList.remove('hidden');
    } else if (screen === 'results') {
        resultsScreen.classList.remove('hidden');
        // Hide target element to prevent layer conflicts with buttons
        targetElement.classList.add('hidden');
        // Hide corner UI elements for cleaner results view
        if (statsDisplay) statsDisplay.classList.add('hidden');
        if (timerDisplay) timerDisplay.classList.add('hidden');
        if (instructionDisplay) instructionDisplay.classList.add('hidden');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    showScreen('menu');
    
    startBtn.addEventListener('click', startGame);
    playAgainBtn.addEventListener('click', startGame);
    menuBtn.addEventListener('click', () => showScreen('menu'));
    
    // Additional click handling to ensure it works
    document.addEventListener('click', (event) => {
        if (currentState === GameState.READY || currentState === GameState.WAITING) {
            // Check if click is on or near the target
            const targetRect = targetElement.getBoundingClientRect();
            const clickX = event.clientX;
            const clickY = event.clientY;
            
            if (clickX >= targetRect.left && clickX <= targetRect.right &&
                clickY >= targetRect.top && clickY <= targetRect.bottom) {
                handleTargetClick(event);
            }
        }
    });
});