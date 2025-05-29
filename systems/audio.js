// ==================== AUDIO SYSTEM ====================
// Music, sound effects, and audio management
// Dependencies: Tone.js
// Functions: initializeAudio(), playSound(), playMusic(), stopMusic(), etc.

// Make audio functions globally accessible
window.AudioSystem = {
    initializeAudio,
    playCoinSound,
    playRareCoinSound,
    playJumpSound,
    playCrashSound,
    playPowerUpSound,
    createBackgroundMusic,
    startBackgroundMusic,
    stopBackgroundMusic,
    updateBackgroundMusic
};

// Initialize audio system
let audioInitialized = false;

// Background music system
let backgroundMusic = null;
let musicPlaying = false;
let musicLayers = [];
let currentMusicIntensity = 0;
let targetMusicIntensity = 0;

function initializeAudio() {
    // Audio initialization
    
    // Check if Tone.js is loaded
    if (typeof Tone === 'undefined') {
        // Tone.js library not loaded
        updateAudioStatus();
        return;
    }
    
    // Function to start audio
    const startAudio = async () => {
        if (!audioInitialized) {
            try {
                await Tone.start();
                audioInitialized = true;
                console.log('✅ Audio context started successfully!');
                console.log('✅ Audio system ready');
            } catch (error) {
                console.error('❌ Failed to start audio:', error);
                console.log('❌ Audio system not ready');
            }
        }
    };
    
    // Add multiple event listeners for maximum compatibility
    document.addEventListener('click', startAudio);
    document.addEventListener('touchstart', startAudio);
    document.addEventListener('keydown', startAudio);
    
    // Also try to start on title screen button clicks
    setTimeout(() => {
        const titleButton = document.getElementById('titleStartButton');
        if (titleButton) {
            titleButton.addEventListener('click', startAudio);
        }
        
        const startButton = document.getElementById('startGameButton');
        if (startButton) {
            startButton.addEventListener('click', startAudio);
        }
    }, 1000);
}

// Sound effect functions
function playCoinSound() {
    if (!audioInitialized || !soundEffectsEnabled) {
        if (!soundEffectsEnabled) {
            console.log('🔇 Sound effects disabled - coin sound skipped');
        } else {
            console.log('🔇 Audio not ready - coin sound skipped');
        }
        return;
    }
    
    try {
        console.log('🎵 Playing coin sound...');

        // Create a crisp, Sonic-style ring collection sound
        const synth = new Tone.Synth({
            oscillator: { type: "square" }, // Square wave for crisp, digital sound
            envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 } // Sharp attack, quick decay
        }).toDestination();
        
        // Set volume and use a bright, high note
        synth.volume.value = -12; // Same quiet volume
        synth.triggerAttackRelease("E5", "16n"); // Higher, brighter note with short duration
        
        // Dispose after use to prevent memory leaks
        setTimeout(() => synth.dispose(), 500);
    } catch (error) {
        console.error('❌ Error playing coin sound:', error);
    }
}

function playRareCoinSound() {
    if (!audioInitialized || !soundEffectsEnabled) return;
    
    // Magical rare coin sound - ascending notes
    const synth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.3 }
    }).toDestination();
    
    // Play ascending notes quickly
    synth.triggerAttackRelease("C5", "32n");
    setTimeout(() => synth.triggerAttackRelease("E5", "32n"), 100);
    setTimeout(() => synth.triggerAttackRelease("G5", "32n"), 200);
    
    setTimeout(() => synth.dispose(), 1000);
}

function playJumpSound() {
    if (!audioInitialized || !soundEffectsEnabled) return;
    
    try {
        console.log('🎵 Playing jump sound...'); // Debug log
        
        // Soft, bouncy jump sound
        const synth = new Tone.Synth({
            oscillator: { type: "sine" }, // Smooth sine wave
            envelope: { attack: 0.02, decay: 0.2, sustain: 0.1, release: 0.25 } // Bouncy envelope
        }).toDestination();
        
        // Set volume louder than coin sound
        synth.volume.value = -6; // Much louder than coin sound
        
        // Create a bouncy "boing" effect with pitch sweep
        synth.triggerAttackRelease("D3", "4n"); // Longer duration, mid-range note
        
        // Add a subtle higher note for bounce effect
        setTimeout(() => {
            const bounceSynth = new Tone.Synth({
                oscillator: { type: "sine" },
                envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.2 }
            }).toDestination();
            bounceSynth.volume.value = -9; // Louder second note too
            bounceSynth.triggerAttackRelease("G3", "8n");
            setTimeout(() => bounceSynth.dispose(), 400);
        }, 80);
        
        setTimeout(() => synth.dispose(), 600);
        
    } catch (error) {
        console.error('❌ Error playing jump sound:', error);
    }
}

function playCrashSound() {
    if (!audioInitialized || !soundEffectsEnabled) return;
    
    // Harsh crash sound
    const noise = new Tone.Noise({
        type: "brown",
        volume: -10
    }).toDestination();
    
    const filter = new Tone.Filter({
        frequency: 200,
        type: "lowpass"
    }).toDestination();
    
    noise.connect(filter);
    noise.start();
    noise.stop("+0.3");
    
    setTimeout(() => {
        noise.dispose();
        filter.dispose();
    }, 1000);
}

function playPowerUpSound() {
    if (!audioInitialized || !soundEffectsEnabled) return;
    
    // Ascending power-up sound
    const synth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 }
    }).toDestination();
    
    // Set lower volume to match coin sound
    synth.volume.value = -12; // Much quieter (same as coin sound)
    
    synth.triggerAttackRelease("C4", "16n");
    setTimeout(() => synth.triggerAttackRelease("E4", "16n"), 80);
    setTimeout(() => synth.triggerAttackRelease("G4", "16n"), 160);
    setTimeout(() => synth.triggerAttackRelease("C5", "8n"), 240);
    
    setTimeout(() => synth.dispose(), 1000);
}

// Background Music System
function createBackgroundMusic() {
    if (!audioInitialized) return;
    
    try {
        console.log(`🎵 Creating ${currentTrack} background music...`);
        
        // SET CORRECT TEMPO IMMEDIATELY - before creating patterns!
        let baseTempo;
        if (currentTrack === 'medieval') {
            baseTempo = 100;
        } else if (currentTrack === 'electronic') {
            baseTempo = 120;
        } else if (currentTrack === 'ambient') {
            baseTempo = 90; // Set ambient tempo right away!
        }
        
        // Apply tempo immediately
        Tone.Transport.bpm.value = baseTempo;
        console.log(`🎵 Set initial tempo to ${baseTempo} BPM for ${currentTrack}`);
        
        // Create different music based on selected track
        musicLayers = [];
        
        if (currentTrack === 'medieval') {
            createMedievalMusic();
        } else if (currentTrack === 'electronic') {
            createElectronicMusic();
        } else if (currentTrack === 'ambient') {
            createAmbientMusic();
        }
        
        console.log(`✅ ${currentTrack} music layers created with correct tempo!`);
        
    } catch (error) {
        console.error(`❌ Error creating ${currentTrack} music:`, error);
    }
}

// Original medieval/fantasy music
function createMedievalMusic() {
    console.log('🎵 Creating extended medieval/fantasy music...');
    
    // Layer 1: Deep war drums with varied rhythm
    const drumSynth = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 12,
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.6, sustain: 0.1, release: 2.0 }
    }).toDestination();
    
    const drumPattern = new Tone.Pattern((time, note) => {
        drumSynth.triggerAttackRelease(note, "4n", time);
    }, [
        "C1", "C1", "G1", "C1", "F1", "C1", "G1", "G1",
        "C1", "F1", "C1", "C1", "G1", "F1", "C1", "G1"
    ], "up"); // 16-beat war rhythm instead of 6
    
    drumPattern.interval = "2n";
    drumSynth.volume.value = -10;
    musicLayers.push({ name: "drums", pattern: drumPattern, synth: drumSynth, volume: 0.4 });
    
    // Layer 2: Medieval lute/harp with extended melody
    const luteSynth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.3, release: 0.8 }
    }).toDestination();
    
    const lutePattern = new Tone.Pattern((time, note) => {
        luteSynth.triggerAttackRelease(note, "8n", time);
    }, [
        "D3", "F3", "A3", "D4", "A3", "F3", "G3", "A3",
        "F3", "A3", "C4", "F4", "C4", "A3", "G3", "F3",
        "A3", "C4", "E4", "A4", "E4", "C4", "D4", "C4",
        "G3", "B3", "D4", "G4", "D4", "B3", "A3", "G3"
    ], "up"); // 32-note medieval melody
    
    lutePattern.interval = "4n";
    luteSynth.volume.value = -15;
    musicLayers.push({ name: "lute", pattern: lutePattern, synth: luteSynth, volume: 0.5 });
    
    // Layer 3: Horn section with epic progression
    const hornSynth = new Tone.Synth({
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 1.2 }
    }).toDestination();
    
    const hornPattern = new Tone.Pattern((time, note) => {
        hornSynth.triggerAttackRelease(note, "2n", time);
    }, [
        "D2", "A2", "F2", "G2", "C3", "G2", "F2", "D2",
        "F2", "C3", "A2", "B2", "G2", "F2", "E2", "D2"
    ], "up"); // 16-note horn fanfare
    
    hornPattern.interval = "1n";
    hornSynth.volume.value = -25;
    musicLayers.push({ name: "horn", pattern: hornPattern, synth: hornSynth, volume: 0.6 });
    
    // Layer 4: Epic strings with soaring melody
    const stringSynth = new Tone.Synth({
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.3, decay: 0.2, sustain: 0.8, release: 1.5 }
    }).toDestination();
    
    const stringPattern = new Tone.Pattern((time, note) => {
        stringSynth.triggerAttackRelease(note, "1n", time);
    }, [
        "D4", "F4", "A4", "C5", "A4", "F4", "D4", "A4",
        "F4", "A4", "C5", "F5", "C5", "A4", "G4", "F4",
        "A4", "D5", "F5", "A5", "F5", "D5", "C5", "A4",
        "C5", "E5", "G5", "C6", "G5", "E5", "D5", "C5"
    ], "up"); // 32-note epic string melody
    
    stringPattern.interval = "2n";
    stringSynth.volume.value = -30;
    musicLayers.push({ name: "strings", pattern: stringPattern, synth: stringSynth, volume: 0.5 });
    
    // Layer 5: Battle choir with extended harmonies
    const choirSynth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.5, decay: 0.3, sustain: 0.9, release: 2.0 }
    }).toDestination();
    
    const choirPattern = new Tone.Pattern((time, note) => {
        choirSynth.triggerAttackRelease(note, "1n", time);
    }, [
        "D5", "F5", "A5", "D6", "A5", "F5", "G5", "A5",
        "F5", "A5", "C6", "F6", "C6", "A5", "G5", "F5"
    ], "up"); // 16-note ethereal choir
    
    choirPattern.interval = "1n";
    choirSynth.volume.value = -35;
    musicLayers.push({ name: "choir", pattern: choirPattern, synth: choirSynth, volume: 0.4 });
    
    // Layer 6: Epic finale with triumphant rhythm
    const epicSynth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 1.0 }
    }).toDestination();
    
    const epicPattern = new Tone.Pattern((time, note) => {
        epicSynth.triggerAttackRelease(note, "4n", time);
    }, [
        "D3", "D3", "A3", "A3", "F3", "G3", "A3", "D3",
        "F3", "F3", "C4", "C4", "A3", "B3", "C4", "F3",
        "G3", "G3", "D4", "D4", "B3", "C4", "D4", "G3",
        "A3", "A3", "E4", "E4", "C4", "D4", "E4", "A3"
    ], "up"); // 32-note finale rhythm
    
    epicPattern.interval = "8n";
    epicSynth.volume.value = -40;
    musicLayers.push({ name: "epic", pattern: epicPattern, synth: epicSynth, volume: 0.6 });
    
    console.log('✅ Extended medieval music created with longer, more epic patterns!');
}

function createElectronicMusic() {
    console.log('🌈 Creating extended neon synthwave music...');
    
    // Layer 1: Kick drum with varied pattern
    const kickSynth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    }).toDestination();
    
    const kickPattern = new Tone.Pattern((time, note) => {
        kickSynth.triggerAttackRelease(note, "8n", time);
    }, ["C1", "C1", "C1", "C1"], "up");
    
    kickPattern.interval = "4n";
    kickSynth.volume.value = -8;
    musicLayers.push({ name: "kick", pattern: kickPattern, synth: kickSynth, volume: 0.8 });
    
    // Layer 2: Bass with longer progression
    const bassSynth = new Tone.Synth({
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.8 }
    }).toDestination();
    
    const bassPattern = new Tone.Pattern((time, note) => {
        bassSynth.triggerAttackRelease(note, "4n", time);
    }, [
        "A1", "A1", "F1", "G1", 
        "C2", "C2", "G1", "F1",
        "A1", "F1", "C2", "G1",
        "F1", "G1", "A1", "A1"
    ], "up");
    
    bassPattern.interval = "2n";
    bassSynth.volume.value = -15;
    musicLayers.push({ name: "bass", pattern: bassPattern, synth: bassSynth, volume: 0.6 });
    
    // Layer 3: Lead with extended melody
    const leadSynth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 1.0 }
    }).toDestination();
    
    const leadPattern = new Tone.Pattern((time, note) => {
        leadSynth.triggerAttackRelease(note, "8n", time);
    }, [
        "A4", "C5", "E5", "G5", "F5", "D5", "C5", "A4",
        "F4", "A4", "C5", "F5", "E5", "C5", "G4", "A4"
    ], "up");
    
    leadPattern.interval = "8n";
    leadSynth.volume.value = -20;
    musicLayers.push({ name: "lead", pattern: leadPattern, synth: leadSynth, volume: 0.5 });
    
    // Layer 4: Arps with longer sequence
    const arpSynth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 }
    }).toDestination();
    
    const arpPattern = new Tone.Pattern((time, note) => {
        arpSynth.triggerAttackRelease(note, "16n", time);
    }, [
        "A3", "C4", "E4", "G4", "A4", "G4", "E4", "C4",
        "F3", "A3", "C4", "F4", "A4", "F4", "C4", "A3"
    ], "up");
    
    arpPattern.interval = "16n";
    arpSynth.volume.value = -25;
    musicLayers.push({ name: "arp", pattern: arpPattern, synth: arpSynth, volume: 0.4 });
    
    // Layer 5: Pad with chord progression
    const padSynth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 1.0, decay: 0.5, sustain: 0.8, release: 2.0 }
    }).toDestination();
    
    const padPattern = new Tone.Pattern((time, note) => {
        padSynth.triggerAttackRelease(note, "1n", time);
    }, ["A2", "F2", "C3", "G2", "F2", "G2", "A2", "E2"], "up");
    
    padPattern.interval = "1n";
    padSynth.volume.value = -30;
    musicLayers.push({ name: "pad", pattern: padPattern, synth: padSynth, volume: 0.3 });
    
    console.log('✅ Extended electronic music created with longer patterns!');
}

// NEW: Ethereal lofi ambient music - dreamy and atmospheric
function createAmbientMusic() {
    console.log('🌌 Creating ethereal lofi ambient music...');
    
    // Layer 1: Soft ambient pad (foundation layer)
    const padSynth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 2.0, decay: 0.1, sustain: 0.8, release: 4.0 }
    }).toDestination();
    
    const padPattern = new Tone.Pattern((time, note) => {
        padSynth.triggerAttackRelease(note, "1n", time);
    }, [
        "C3", "Eb3", "G3", "Bb3", "C4", "Bb3", "G3", "Eb3"
    ], "up");
    
    padPattern.interval = "2n"; // Slow and dreamy
    padSynth.volume.value = -18;
    musicLayers.push({ name: "pad", pattern: padPattern, synth: padSynth, volume: 0.3 });
    
    // Layer 2: Dreamy bell/chime melody
    const bellSynth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.1, decay: 1.0, sustain: 0.2, release: 2.0 }
    }).toDestination();
    
    const bellPattern = new Tone.Pattern((time, note) => {
        bellSynth.triggerAttackRelease(note, "4n", time);
    }, [
        "G4", "Bb4", "C5", "D5", "C5", "Bb4", "G4", "F4",
        "Eb4", "F4", "G4", "Bb4", "C5", "Bb4", "G4", "Eb4"
    ], "up");
    
    bellPattern.interval = "2n";
    bellSynth.volume.value = -22;
    musicLayers.push({ name: "bells", pattern: bellPattern, synth: bellSynth, volume: 0.4 });
    
    // Layer 3: Soft bass foundation
    const bassSynth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.3, decay: 0.5, sustain: 0.7, release: 1.5 }
    }).toDestination();
    
    const bassPattern = new Tone.Pattern((time, note) => {
        bassSynth.triggerAttackRelease(note, "2n", time);
    }, [
        "C2", "Eb2", "G2", "Bb2", "C3", "Bb2", "G2", "Eb2"
    ], "up");
    
    bassPattern.interval = "1n";
    bassSynth.volume.value = -25;
    musicLayers.push({ name: "bass", pattern: bassPattern, synth: bassSynth, volume: 0.5 });
    
    // Layer 4: Ethereal arpeggios
    const arpSynth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.1, release: 0.8 }
    }).toDestination();
    
    const arpPattern = new Tone.Pattern((time, note) => {
        arpSynth.triggerAttackRelease(note, "8n", time);
    }, [
        "C5", "Eb5", "G5", "Bb5", "D6", "Bb5", "G5", "Eb5",
        "F5", "Ab5", "C6", "Eb6", "F6", "Eb6", "C6", "Ab5"
    ], "up");
    
    arpPattern.interval = "8n";
    arpSynth.volume.value = -28;
    musicLayers.push({ name: "arp", pattern: arpPattern, synth: arpSynth, volume: 0.6 });
    
    // Layer 5: High atmospheric pad
    const highPadSynth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 3.0, decay: 0.1, sustain: 0.9, release: 5.0 }
    }).toDestination();
    
    const highPadPattern = new Tone.Pattern((time, note) => {
        highPadSynth.triggerAttackRelease(note, "1n", time);
    }, [
        "G5", "Bb5", "D6", "F6", "Eb6", "D6", "Bb5", "G5"
    ], "up");
    
    highPadPattern.interval = "2n";
    highPadSynth.volume.value = -32;
    musicLayers.push({ name: "highpad", pattern: highPadPattern, synth: highPadSynth, volume: 0.4 });
    
    console.log('✅ Ethereal lofi ambient music created! 🌌🎵');
}

function startBackgroundMusic() {
    console.log('🎵 startBackgroundMusic called - Audio:', audioInitialized, 'Playing:', musicPlaying, 'Enabled:', backgroundMusicEnabled);
    
    if (!audioInitialized) {
        console.log('❌ Audio not initialized - cannot start music');
        return;
    }
    
    if (musicPlaying) {
        console.log('🎵 Music already playing');
        return;
    }
    
    if (!backgroundMusicEnabled) {
        console.log('🎵 Background music disabled in settings');
        return;
    }
    
    if (!musicLayers || musicLayers.length === 0) {
        console.log('❌ No music layers available - recreating...');
        createBackgroundMusic();
    }
    
    try {
        console.log('🎵 Starting background music...');
        
        // Start transport
        Tone.Transport.start();
        
        // Start all patterns
        musicLayers.forEach((layer, index) => {
            console.log(`🎵 Starting layer ${index}:`, layer.name);
            layer.pattern.start(0);
        });
        
        musicPlaying = true;
        console.log('✅ Background music started successfully!');
        
    } catch (error) {
        console.error('❌ Error starting background music:', error);
        console.error('❌ Error details:', error.message, error.stack);
    }
}

function stopBackgroundMusic() {
    if (!musicPlaying) return;
    
    try {
        console.log('🎵 Stopping background music...');
        
        // Stop all patterns
        musicLayers.forEach(layer => {
            layer.pattern.stop();
        });
        
        // Stop transport
        Tone.Transport.stop();
        
        musicPlaying = false;
        console.log('✅ Background music stopped!');
        
    } catch (error) {
        console.error('❌ Error stopping background music:', error);
    }
}

function updateBackgroundMusic() {
    if (!musicPlaying || musicLayers.length === 0) return;
    
    // Music update - debug logs removed for performance
    
    // Update tempo based on speed level for each track type
    let baseTempo, maxTempo;
    
    if (currentTrack === 'medieval') {
        baseTempo = 100; // Moderate epic tempo
        maxTempo = 140;  // Battle tempo at max speed
    } else if (currentTrack === 'electronic') {
        baseTempo = 120; // Standard electronic tempo
        maxTempo = 160;  // High energy electronic
    } else if (currentTrack === 'ambient') {
        baseTempo = 65;  // Even more chill lofi tempo
        maxTempo = 85;   // Keeps it perfectly chill but still responsive
    }
    
    // Calculate target tempo based on speed level (0-4)
    const speedProgress = Math.min(currentSpeedLevel / 4, 1); // Normalize to 0-1
    const targetTempo = baseTempo + (speedProgress * (maxTempo - baseTempo));
    
    // Smooth tempo transitions
    const currentTempo = Tone.Transport.bpm.value;
    const newTempo = currentTempo + (targetTempo - currentTempo) * 0.02;
    Tone.Transport.bpm.value = newTempo;
    
    // Optional: Add slight volume boost at higher speeds for intensity
    musicLayers.forEach((layer, index) => {
        if (layer.synth) {
            // Calculate volume based on speed level - all layers play from start
            let baseVolume;
            
            if (currentTrack === 'medieval') {
                const baseVolumes = [-10, -15, -25, -30, -35, -40]; // Medieval layer volumes
                baseVolume = baseVolumes[index] || -20;
            } else if (currentTrack === 'electronic') {
                const baseVolumes = [-8, -15, -20, -25, -30]; // Electronic layer volumes
                baseVolume = baseVolumes[index] || -18;
            } else if (currentTrack === 'ambient') {
                const baseVolumes = [-12, -18, -22, -25, -28]; // Ambient layer volumes
                baseVolume = baseVolumes[index] || -20;
            }
            
            // Add slight volume boost at higher speeds (max +3dB)
            const volumeBoost = speedProgress * 3;
            const targetVolume = baseVolume + volumeBoost;
            
            // Smooth volume transitions
            const currentVolume = layer.synth.volume.value;
            const newVolume = currentVolume + (targetVolume - currentVolume) * 0.05;
            layer.synth.volume.value = newVolume;
            
            // Layer volume updates - debug logs removed for performance
        }
    });
}
