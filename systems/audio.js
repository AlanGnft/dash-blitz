// ==================== AUDIO SYSTEM ====================
// Music and sound effects using HTML5 Audio
// No dependencies required!

// Make audio functions globally accessible
window.AudioSystem = {
    initializeAudio,
    playCoinSound,
    playRareCoinSound,
    playJumpSound,
    playCrashSound,
    playPowerUpSound,
    startBackgroundMusic,
    stopBackgroundMusic,
    updateBackgroundMusic
};

// Audio elements
let backgroundMusic = null;
let currentTrackName = 'medieval'; // Track this separately from game's currentTrack
let audioInitialized = false;
let musicPlaying = false;

// Sound effect audio pool for better performance
const soundPool = {
    coin: [],
    jump: [],
    crash: [],
    powerup: [],
    rareCoin: []
};

// Initialize audio system
function initializeAudio() {
    audioInitialized = true;
    
    // Create audio pools for sound effects (3 instances each for overlap)
    // Note: ../assets because we're in the systems folder
    for (let i = 0; i < 3; i++) {
        soundPool.coin.push(new Audio('assets/audio/coin.mp3'));
        soundPool.jump.push(new Audio('assets/audio/jump.mp3'));
        soundPool.crash.push(new Audio('assets/audio/crash.mp3'));
        soundPool.powerup.push(new Audio('assets/audio/powerup.mp3'));
        soundPool.rareCoin.push(new Audio('assets/audio/rare-coin.mp3'));
    }
    
    // Set volumes for sound effects
    Object.values(soundPool).flat().forEach(audio => {
        audio.volume = 0.3; // Adjust as needed
    });
    
    debug('✅ Audio system initialized');
}

// Helper to play sound from pool
function playFromPool(pool) {
    if (!audioInitialized || !soundEffectsEnabled) return;
    
    // Find an audio instance that's not currently playing
    const audio = pool.find(a => a.paused) || pool[0];
    audio.currentTime = 0;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// Sound effect functions
function playCoinSound() {
    playFromPool(soundPool.coin);
}

function playRareCoinSound() {
    playFromPool(soundPool.rareCoin);
}

function playJumpSound() {
    playFromPool(soundPool.jump);
}

function playCrashSound() {
    playFromPool(soundPool.crash);
}

function playPowerUpSound() {
    playFromPool(soundPool.powerup);
}

// Background music functions
function startBackgroundMusic() {
    if (!audioInitialized || musicPlaying || !backgroundMusicEnabled) return;
    
    // Stop existing music if any
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic = null;
    }
    
    // Create new audio element for the current track
    // Note: ../assets because we're in the systems folder
    backgroundMusic = new Audio(`assets/audio/${currentTrack}-track.mp3`);
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5; // Adjust as needed
    
    // Play the music
    backgroundMusic.play().then(() => {
        musicPlaying = true;
        debug('✅ Background music started:', currentTrack);
    }).catch(e => {
        console.log('Music play failed:', e);
        musicPlaying = false;
    });
}

function stopBackgroundMusic() {
    if (!backgroundMusic || !musicPlaying) return;
    
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    musicPlaying = false;
    debug('✅ Background music stopped');
}

function updateBackgroundMusic() {
    if (!backgroundMusic || !musicPlaying) return;
    
    // Check if track changed
    if (currentTrack !== currentTrackName) {
        currentTrackName = currentTrack;
        stopBackgroundMusic();
        startBackgroundMusic();
        return;
    }
    
    // Adjust volume based on game speed (optional)
    const speedProgress = Math.min(currentSpeedLevel / 4, 1);
    const baseVolume = 0.5;
    const maxVolume = 0.7;
    backgroundMusic.volume = baseVolume + (speedProgress * (maxVolume - baseVolume));
    
    // You can also adjust playback rate for tempo changes (optional)
    // backgroundMusic.playbackRate = 1.0 + (speedProgress * 0.2); // Up to 20% faster
}

// Create placeholder sound effects using Web Audio API
// (These are temporary until you create proper MP3s)
function createPlaceholderSounds() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Helper to create simple beep sounds
    function createBeep(frequency, duration, type = 'sine') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    // Override the pool functions temporarily
    window.playCoinSound = () => {
        if (!audioInitialized || !soundEffectsEnabled) return;
        createBeep(800, 0.1, 'square');
    };
    
    window.playJumpSound = () => {
        if (!audioInitialized || !soundEffectsEnabled) return;
        createBeep(400, 0.2, 'sine');
    };
    
    window.playCrashSound = () => {
        if (!audioInitialized || !soundEffectsEnabled) return;
        createBeep(150, 0.3, 'sawtooth');
    };
    
    window.playPowerUpSound = () => {
        if (!audioInitialized || !soundEffectsEnabled) return;
        createBeep(600, 0.3, 'triangle');
    };
    
    window.playRareCoinSound = () => {
        if (!audioInitialized || !soundEffectsEnabled) return;
        createBeep(600, 0.1, 'triangle');
        setTimeout(() => createBeep(800, 0.1, 'triangle'), 100);
        setTimeout(() => createBeep(1000, 0.1, 'triangle'), 200);
    };
    
    debug('✅ Placeholder sounds created');
}

// Initialize placeholder sounds on first user interaction
document.addEventListener('click', () => {
    if (!window.tempSounds) {
        createPlaceholderSounds();
    }
}, { once: true });