// Game State
const GameState = {
    MENU: 'menu',
    WAITING: 'waiting',
    READY: 'ready',
    FINISHED: 'finished'
};

let currentState = GameState.MENU;
let scene, camera, renderer, targetMesh, particles;
let startTime, reactionTime;
let bestTime = localStorage.getItem('bestTime') || null;
let gamesPlayed = parseInt(localStorage.getItem('gamesPlayed')) || 0;

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

// Initialize Three.js Scene
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 15;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a1a, 0);
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);
    
    // Create Target
    createTarget();
    
    // Create Particle System
    createParticles();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Start animation loop
    animate();
}

function createTarget() {
    // Create a futuristic target with glowing edges
    const geometry = new THREE.TorusGeometry(3, 0.5, 16, 100);
    const material = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
    });
    targetMesh = new THREE.Mesh(geometry, material);
    scene.add(targetMesh);
    
    // Add inner ring
    const innerGeometry = new THREE.TorusGeometry(2, 0.3, 16, 100);
    const innerMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.3,
        metalness: 0.8,
        roughness: 0.2
    });
    const innerRing = new THREE.Mesh(innerGeometry, innerMaterial);
    targetMesh.add(innerRing);
    innerRing.position.z = 0.2;
    targetMesh.userData.innerRing = innerRing;
}

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 50;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.1,
        transparent: true,
        opacity: 0.6
    });
    
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate target
    if (targetMesh) {
        targetMesh.rotation.z += 0.01;
        if (targetMesh.userData.innerRing) {
            targetMesh.userData.innerRing.rotation.z -= 0.02;
        }
    }
    
    // Animate particles
    if (particles) {
        particles.rotation.y += 0.001;
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Game Logic
function startGame() {
    currentState = GameState.WAITING;
    showScreen('game');
    
    instruction.textContent = 'Wait for GREEN...';
    instruction.style.color = '#ffff00';
    timer.textContent = '0ms';
    readyIndicator.classList.add('hidden');
    
    // Set target to red
    setTargetColor(0xff0000, 0xff0000);
    
    // Random delay before turning green (2-5 seconds)
    const delay = 2000 + Math.random() * 3000;
    
    setTimeout(() => {
        if (currentState === GameState.WAITING) {
            currentState = GameState.READY;
            instruction.classList.add('hidden');
            readyIndicator.classList.remove('hidden');
            setTargetColor(0x00ff00, 0x00ff00);
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
    instruction.textContent = 'Too early! Wait for GREEN!';
    instruction.style.color = '#ff0000';
    
    // Shake effect
    targetMesh.position.x = 0;
    let shakeCount = 0;
    const shakeInterval = setInterval(() => {
        targetMesh.position.x = Math.sin(shakeCount * 0.5) * 0.5;
        shakeCount++;
        if (shakeCount > 10) {
            clearInterval(shakeInterval);
            targetMesh.position.x = 0;
            // Restart game after error
            setTimeout(startGame, 1000);
        }
    }, 50);
}

function getRating(time) {
    if (time < 200) return '🚀 LIGHTNING FAST!';
    if (time < 300) return '⚡ INCREDIBLE!';
    if (time < 400) return '🔥 EXCELLENT!';
    if (time < 500) return '✨ GREAT!';
    if (time < 700) return '👍 GOOD!';
    return '😊 NICE TRY!';
}

function setTargetColor(color, emissive) {
    if (targetMesh) {
        targetMesh.material.color.setHex(color);
        targetMesh.material.emissive.setHex(emissive);
        
        if (targetMesh.userData.innerRing) {
            targetMesh.userData.innerRing.material.color.setHex(color);
            targetMesh.userData.innerRing.material.emissive.setHex(emissive);
        }
    }
}

function celebrateEffect() {
    // Pulse effect
    let scale = 1;
    let growing = true;
    const pulseInterval = setInterval(() => {
        if (growing) {
            scale += 0.05;
            if (scale >= 1.3) growing = false;
        } else {
            scale -= 0.05;
            if (scale <= 1) {
                clearInterval(pulseInterval);
                targetMesh.scale.set(1, 1, 1);
            }
        }
        targetMesh.scale.set(scale, scale, scale);
    }, 30);
    
    // Color change
    setTargetColor(0x00ffff, 0x00ffff);
}

function showScreen(screen) {
    menuScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    
    if (screen === 'menu') {
        menuScreen.classList.remove('hidden');
        bestTimeDisplay.textContent = bestTime ? bestTime + 'ms' : '-';
        gamesPlayedDisplay.textContent = gamesPlayed;
        setTargetColor(0x00ffff, 0x00ffff);
    } else if (screen === 'game') {
        gameScreen.classList.remove('hidden');
    } else if (screen === 'results') {
        resultsScreen.classList.remove('hidden');
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
initThreeJS();
showScreen('menu');
