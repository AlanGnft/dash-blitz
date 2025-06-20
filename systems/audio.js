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

// Shuffle mode variables
let shuffleMode = true; // Default to shuffle mode
let shuffleQueue = [];
let currentShuffleIndex = 0;
let trackTransitioning = false;

// Make shuffle mode accessible globally
window.shuffleMode = true; // Default to shuffle mode

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
        soundPool.coin.push(new Audio('assets/audio/sounds/coin.mp3'));
        soundPool.jump.push(new Audio('assets/audio/sounds/jump.mp3'));
        soundPool.crash.push(new Audio('assets/audio/sounds/crash.mp3'));
        soundPool.powerup.push(new Audio('assets/audio/sounds/powerup.mp3'));
        soundPool.rareCoin.push(new Audio('assets/audio/sounds/rare-coin.mp3'));
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

    
    // Stop any existing music first
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        backgroundMusic = null;
    }
    
    // Prevent multiple simultaneous calls
    if (window.startingMusic) {
        console.log('🎵 Already starting music, skipping...');
        return;
    }
    window.startingMusic = true;
    
    // Get the track to play (shuffle or current)
    let trackToPlay;
    if (shuffleMode) {
        // Use the current position in shuffle queue without advancing
        if (shuffleQueue.length === 0) {
            initializeShuffleQueue();
        }
        trackToPlay = shuffleQueue[currentShuffleIndex];
    } else {
        trackToPlay = currentTrack;
    }
    
    // Create new audio element for the current track
    backgroundMusic = new Audio(`assets/audio/tracks/${trackToPlay}-track.mp3`);
    
    // Set loop based on shuffle mode
    backgroundMusic.loop = !shuffleMode;
    backgroundMusic.volume = 0.5;
    
    // Add event listener for track end (for shuffle mode)
    if (shuffleMode) {
        backgroundMusic.addEventListener('ended', handleTrackEnd);
    }
    
    // Play the music
    backgroundMusic.play().then(() => {
        musicPlaying = true;
        currentTrackName = trackToPlay;
        window.startingMusic = false; // Clear the flag
        debug('✅ Background music started:', trackToPlay);
        
        // Show "Now Playing" notification if shuffle mode
        if (shuffleMode) {
            showNowPlayingNotification(trackToPlay);
        }
    }).catch(e => {
        console.log('Music play failed:', e);
        musicPlaying = false;
        window.startingMusic = false; // Clear the flag even on error
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
    // More aggressive throttling for mobile
    const throttleTime = window.innerWidth <= 768 ? 500 : 100; // 500ms on mobile vs 100ms desktop
    
    if (!window.lastMusicUpdate) window.lastMusicUpdate = 0;
    const now = Date.now();
    if (now - window.lastMusicUpdate < throttleTime) return;
    window.lastMusicUpdate = now;
    
    if (!backgroundMusic || !musicPlaying) return;
    
    // Only check for track changes in non-shuffle mode
    if (!shuffleMode && currentTrack !== currentTrackName) {
        currentTrackName = currentTrack;
        stopBackgroundMusic();
        startBackgroundMusic();
        return;
    }
    
    // Adjust volume based on game speed (optional)
    if (backgroundMusic && typeof currentSpeedLevel !== 'undefined') {
        const speedProgress = Math.min(currentSpeedLevel / 4, 1);
        const baseVolume = 0.5;
        const maxVolume = 0.7;
        backgroundMusic.volume = baseVolume + (speedProgress * (maxVolume - baseVolume));
    }
}

// ==================== SHUFFLE MODE FUNCTIONS ====================

// Initialize shuffle queue
function initializeShuffleQueue() {
    // Get availableTracks from global scope
    const tracks = window.availableTracks || [
        { id: 'medieval' },
        { id: 'electronic' }, 
        { id: 'ambient' }
    ];
    
    debug('🔀 Available tracks for shuffle:', tracks);
    shuffleQueue = [...tracks.map(track => track.id)];
    shuffleArray(shuffleQueue);
    currentShuffleIndex = 0;
    debug('🔀 Shuffle queue initialized:', shuffleQueue);
}

// Simpler shuffle for mobile
function shuffleArray(array) {
    // Simple swap-based shuffle (less intensive)
    for (let i = 0; i < array.length; i++) {
        const j = Math.floor(Math.random() * array.length);
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Get next track in shuffle queue
function getNextShuffleTrack() {
    if (shuffleQueue.length === 0) {
        initializeShuffleQueue();
    }
    
    const track = shuffleQueue[currentShuffleIndex];
    currentShuffleIndex = (currentShuffleIndex + 1) % shuffleQueue.length;
    
    // Re-shuffle when we've played all tracks
    if (currentShuffleIndex === 0) {
        shuffleArray(shuffleQueue);
        debug('🔀 Re-shuffled queue:', shuffleQueue);
    }
    
    return track;
}

// Handle track end (for shuffle mode)
function handleTrackEnd() {
    if (!shuffleMode || trackTransitioning || window.startingMusic) return;
    
    trackTransitioning = true;
    
    // Advance to next track
    currentShuffleIndex = (currentShuffleIndex + 1) % shuffleQueue.length;
    
    // Re-shuffle when we've played all tracks
    if (currentShuffleIndex === 0) {
        shuffleArray(shuffleQueue);
    }
    
    // Stop current track cleanly
    stopBackgroundMusic();
    
    // Start next track after a delay
    setTimeout(() => {
        trackTransitioning = false;
        if (shuffleMode && backgroundMusicEnabled && !gamePaused && !gameOver) {
            startBackgroundMusic();
        }
    }, 100);
}

// Smooth transition between tracks
function fadeOutAndSwitchTrack() {
    if (!backgroundMusic) return;
    
    const fadeInterval = setInterval(() => {
        if (backgroundMusic.volume > 0.1) {
            backgroundMusic.volume = Math.max(0, backgroundMusic.volume - 0.1);
        } else {
            clearInterval(fadeInterval);
            
            // Start next track
            stopBackgroundMusic();
            trackTransitioning = false;
            
            // Small delay before next track
            setTimeout(() => {
                if (shuffleMode && backgroundMusicEnabled) {
                    startBackgroundMusic();
                }
            }, 500);
        }
    }, 100);
}

// Toggle shuffle mode
function toggleShuffleMode() {
    shuffleMode = !shuffleMode;
    window.shuffleMode = shuffleMode; // Keep global in sync
    debug(shuffleMode ? '🔀 Shuffle mode enabled' : '🔀 Shuffle mode disabled');
    
    if (shuffleMode) {
        initializeShuffleQueue();
        // Restart music if currently playing
        if (musicPlaying) {
            stopBackgroundMusic();
            startBackgroundMusic();
        }
    } else {
        // Return to normal loop mode
        if (musicPlaying && backgroundMusic) {
            backgroundMusic.loop = true;
            backgroundMusic.removeEventListener('ended', handleTrackEnd);
        }
    }
    
    // Update UI
    updateShuffleUI();
    
    // Save preference
    if (typeof saveGameData === 'function') {
        saveGameData('settings_change');
    }
}

// Update shuffle UI
function updateShuffleUI() {
    const shuffleBtn = document.getElementById('shuffleToggleBtn');
    if (shuffleBtn) {
        shuffleBtn.textContent = shuffleMode ? '🔀 Shuffle: ON' : '🔀 Shuffle: OFF';
        shuffleBtn.style.background = shuffleMode ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)';
        
        // Update global variable to keep everything in sync
        window.shuffleMode = shuffleMode;
    }
}

// Mobile-optimized notification (keeps popup but lighter)
function showNowPlayingNotification(trackId) {
    const track = availableTracks.find(t => t.id === trackId);
    if (!track) return;
    
    // Remove any existing notification quickly
    const existing = document.getElementById('nowPlayingNotification');
    if (existing) existing.remove();
    
    // Simplified mobile detection
    const isMobile = window.innerWidth <= 768;
    
    // Create notification
    const notification = document.createElement('div');
    notification.id = 'nowPlayingNotification';
    
    if (isMobile) {
        // Simple mobile version
        notification.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9); color: white; padding: 8px 12px;
            border-radius: 20px; font-size: 12px; z-index: 10000;
            width: 280px; max-width: 90vw; text-align: center;
            border: 2px solid #4CAF50;
        `;
        notification.textContent = `♪ ${track.name} by ${track.artist || 'Unknown Artist'}`;
        setTimeout(() => notification.remove(), 3000);
        
    } else {
        // Full desktop version with scrolling animation
notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 16px;
    z-index: 10000;
    width: 420px;
    max-width: 80vw;
    height: 44px;
    border: 2px solid #4CAF50;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    transition: transform 0.4s ease;
    overflow: hidden;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
`;

// Create scrolling text for desktop
const scrollText = document.createElement('div');
scrollText.style.cssText = `
    animation: scrollTextOnce 6s linear forwards;
    font-weight: 500;
    text-align: center;
    width: 100%;
`;
        scrollText.textContent = `♪ Now Playing: ${track.name} by ${track.artist || 'Unknown Artist'}`;
        notification.appendChild(scrollText);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
        
        // Auto-hide after scroll completes
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(-100%)';
            setTimeout(() => notification.remove(), 500);
        }, 6500);
    }
    
    document.body.appendChild(notification);
}


// Mobile-optimized skip function
function skipToNextTrack() {
    if (!shuffleMode || !backgroundMusicEnabled) return;
    
    
    // Don't create new objects - just switch the source
    if (backgroundMusic) {
        // Get next track
        currentShuffleIndex = (currentShuffleIndex + 1) % shuffleQueue.length;
        if (currentShuffleIndex === 0) {
            shuffleArray(shuffleQueue);
        }
        
        const nextTrack = shuffleQueue[currentShuffleIndex];
        
        // Reuse existing audio element instead of creating new one
        backgroundMusic.src = `assets/audio/tracks/${nextTrack}-track.mp3`;
        backgroundMusic.currentTime = 0;
        
        // Update tracking
        currentTrackName = nextTrack;
        
        // Play immediately (no setTimeout delays)
        backgroundMusic.play().then(() => {
            showNowPlayingNotification(nextTrack);
        }).catch(e => console.log('Skip failed:', e));
    }
}

// Make shuffle functions globally accessible
window.AudioSystem.toggleShuffleMode = toggleShuffleMode;
window.AudioSystem.getShuffleMode = () => shuffleMode;
window.AudioSystem.initializeShuffleQueue = initializeShuffleQueue;
window.AudioSystem.skipToNextTrack = skipToNextTrack;
window.toggleShuffleMode = toggleShuffleMode; // Also make it directly accessible
window.skipToNextTrack = skipToNextTrack; // Also make it directly accessible

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