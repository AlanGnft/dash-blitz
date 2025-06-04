// TEMPORARY: Disable menu particle system to test
console.log('🚫 Disabling menu particle system for testing');

// Override ParticleSystem to do nothing
window.ParticleSystem = class {
    constructor() {
        console.log('🚫 ParticleSystem disabled');
    }
    createParticles() { }
    animate() { }
    burst() { }
    init() { }
    resize() { }
};

// Disable particle creation functions
window.createParticle = function() {
    console.log('🚫 createParticle disabled');
};

// Test data for standalone menu system
let gameData = {
    totalCoins: 1250,
    currentCharacter: 'apple',
    currentWorld: 'classic',
    unlockedCharacters: {
        apple: true,
        carrot: false,
        pumpkin: false,
        happyface: false,
        monster: false,
        atom: false,
        slime: false,
        ufo: false,
        robot: false,
        dragon: false,
        ghost: false,
        creature: false
    },
    unlockedWorlds: {
        classic: true,
        forest: false,
        desert: false
    }
};

// Character data based on your actual game structure
const characters = {
    apple: {
        name: 'Apple',
        price: 0,
        icon: '🍎',
        color: '#ff0000',
        description: 'Classic runner'
    },
    carrot: {
        name: 'Carrot',
        price: 200,
        icon: '🥕',
        color: '#ff8c00',
        description: 'Fast lane changes'
    },
    pumpkin: {
        name: 'Pumpkin',
        price: 500,
        icon: '🎃',
        color: '#ff6600',
        description: 'Higher jumps'
    },
    happyface: {
        name: 'Happy Face',
        price: 1000,
        icon: '😊',
        color: '#ffff00',
        description: 'Bouncy and cheerful'
    },
    monster: {
        name: 'Monster',
        price: 5000,
        icon: '👹',
        color: '#8b0000',
        description: 'Ominous and fast'
    },
    // Add other characters as needed...
};

// World data based on your actual game structure
const worlds = {
    classic: {
        name: 'Classic Plains',
        price: 0,
        icon: '🌱',
        theme: 'Rolling green hills and peaceful meadows',
        color: '#43cbff'
    },
    forest: {
        name: 'Enchanted Forest',
        price: 5000,
        icon: '🌳',
        theme: 'Mystical woodland with towering trees',
        color: '#228b22'
    },
    desert: {
        name: 'Desert Mirage',
        price: 10000,
        icon: '🏜️',
        theme: 'Scorching sand dunes with mysterious mirages',
        color: '#deb887'
    }
};

// Audio system
class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicVolume = 0.5;
        this.sfxVolume = 0.5;
        this.currentTrack = null;
        
        // Create audio context for sound effects
        this.audioContext = null;
        this.initAudio();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    // Generate sound effects using Web Audio API
    playSound(type) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch (type) {
            case 'click':
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1 * this.sfxVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;
                
            case 'hover':
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.05 * this.sfxVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.05);
                break;
                
            case 'purchase':
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2 * this.sfxVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;
                
            case 'select':
                oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.15 * this.sfxVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.15);
                break;
        }
    }
    
    playTrack(trackName) {
        console.log(`Playing track: ${trackName}`);
        // In a real implementation, you'd load and play actual audio files
        // For now, we'll just simulate with console log
    }
}

// Particle system
class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        const container = document.getElementById('particle-canvas');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        container.appendChild(this.canvas);
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        this.createParticles();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.4 + 0.1,
                color: `hsl(${Math.random() * 40 + 200}, 80%, 65%)`
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((particle, index) => {
            // Move particles
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx += dx * force * 0.001;
                particle.vy += dy * force * 0.001;
            }
            
            // Boundary wrapping
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            
            // Add glow effect for burst particles
            if (particle.glow) {
                this.ctx.shadowColor = particle.color;
                this.ctx.shadowBlur = particle.size * 3;
            }
            
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Connect nearby particles
            this.particles.slice(index + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = particle.color;
                    this.ctx.globalAlpha = (100 - distance) / 100 * 0.3;
                    this.ctx.stroke();
                }
            });
        });
        
        this.ctx.globalAlpha = 1;
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    burst(x, y, color = '#43cbff') {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 4 + 2,
                opacity: 1,
                color: color,
                life: 80,
                glow: true
            });
        }
    }
}

// 3D Character Preview System
class Character3DPreview {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.character = null;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        this.camera.position.z = 5;
    }
    
    loadCharacter(characterKey) {
        // Clear existing character
        if (this.character) {
            this.scene.remove(this.character);
        }
        
        const character = characters[characterKey];
        
        // Create a simple 3D representation
        const group = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.8, 2, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: character.color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: character.color });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        group.add(head);
        
        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ color: character.color });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-1, 0.5, 0);
        leftArm.rotation.z = Math.PI / 6;
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(1, 0.5, 0);
        rightArm.rotation.z = -Math.PI / 6;
        group.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1.5, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ color: character.color });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.4, -1.5, 0);
        group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.4, -1.5, 0);
        group.add(rightLeg);
        
        this.character = group;
        this.scene.add(this.character);
        
        this.animate();
    }
    
    animate() {
        if (this.character) {
            this.character.rotation.y += 0.01;
            this.character.position.y = Math.sin(Date.now() * 0.003) * 0.1;
        }
        
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer && this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Global instances
let audioManager;
let particleSystem;
let character3DPreview;
let currentPreviewCharacter = null;

// Achievement System
class AchievementSystem {
    constructor() {
        this.achievements = [
            {
                id: 'first_purchase',
                title: 'Shopaholic',
                description: 'Make your first purchase',
                icon: '🛍️',
                unlocked: false,
                progress: 0,
                target: 1
            },
            {
                id: 'character_collector',
                title: 'Character Collector',
                description: 'Unlock 3 characters',
                icon: '👥',
                unlocked: false,
                progress: 0,
                target: 3
            },
            {
                id: 'world_explorer',
                title: 'World Explorer',
                description: 'Unlock all worlds',
                icon: '🌍',
                unlocked: false,
                progress: 0,
                target: 5
            },
            {
                id: 'coin_master',
                title: 'Coin Master',
                description: 'Collect 5000 coins total',
                icon: '💰',
                unlocked: false,
                progress: 0,
                target: 5000
            }
        ];
        
        this.loadAchievements();
    }
    
    updateProgress(achievementId, progress) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.progress = Math.max(achievement.progress, progress);
            
            if (achievement.progress >= achievement.target) {
                this.unlockAchievement(achievement);
            }
            
            this.saveAchievements();
        }
    }
    
    unlockAchievement(achievement) {
        achievement.unlocked = true;
        
        // Show achievement notification
        this.showAchievementUnlocked(achievement);
        
        // Reward coins
        gameData.totalCoins += 100;
        updateCoinDisplays();
        
        audioManager.playSound('purchase');
    }
    
    showAchievementUnlocked(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-title">ACHIEVEMENT UNLOCKED!</div>
                    <div class="achievement-name">${achievement.title}</div>
                    <div class="achievement-reward">+100 🪙</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 4000);
        
        particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, '#e74c3c');
    }
    
    saveAchievements() {
        localStorage.setItem('blitzAchievements', JSON.stringify(this.achievements));
    }
    
    loadAchievements() {
        const saved = localStorage.getItem('blitzAchievements');
        if (saved) {
            const savedAchievements = JSON.parse(saved);
            savedAchievements.forEach(saved => {
                const achievement = this.achievements.find(a => a.id === saved.id);
                if (achievement) {
                    Object.assign(achievement, saved);
                }
            });
        }
    }
}

let achievementSystem;

// Daily Challenges System
class DailyChallenges {
    constructor() {
        this.challenges = [];
        this.completedToday = [];
        this.lastResetDate = null;
        
        this.challengeTypes = [
            {
                type: 'distance',
                title: 'Distance Runner',
                description: 'Run {target} meters in a single run',
                rewards: { coins: 100, xp: 50 },
                targets: [1000, 2000, 5000, 10000]
            },
            {
                type: 'coins',
                title: 'Coin Collector',
                description: 'Collect {target} coins in a single run',
                rewards: { coins: 150, xp: 75 },
                targets: [50, 100, 200, 500]
            },
            {
                type: 'jumps',
                title: 'Jumping Jack',
                description: 'Jump {target} times in a single run',
                rewards: { coins: 75, xp: 40 },
                targets: [20, 50, 100, 200]
            },
            {
                type: 'powerups',
                title: 'Power Player',
                description: 'Collect {target} power-ups in a single run',
                rewards: { coins: 125, xp: 60 },
                targets: [5, 10, 20, 30]
            },
            {
                type: 'perfectRun',
                title: 'Perfect Runner',
                description: 'Complete a run without hitting any obstacles',
                rewards: { coins: 200, xp: 100 },
                targets: [1]
            }
        ];
        
        this.generateDailyChallenges();
    }

    generateDailyChallenges() {
        const today = new Date().toDateString();
        
        // Check if we need to reset challenges
        if (this.lastResetDate !== today) {
            this.challenges = [];
            this.completedToday = [];
            this.lastResetDate = today;
            
            // Generate 3 random challenges
            const shuffledTypes = [...this.challengeTypes].sort(() => Math.random() - 0.5);
            
            for (let i = 0; i < 3; i++) {
                const challengeType = shuffledTypes[i];
                const targetIndex = Math.floor(Math.random() * challengeType.targets.length);
                
                this.challenges.push({
                    id: `daily_${i}_${Date.now()}`,
                    type: challengeType.type,
                    title: challengeType.title,
                    description: challengeType.description.replace('{target}', challengeType.targets[targetIndex]),
                    target: challengeType.targets[targetIndex],
                    progress: 0,
                    completed: false,
                    rewards: challengeType.rewards
                });
            }
            
            this.saveChallenges();
        }
    }

    updateProgress(type, value) {
        this.challenges.forEach(challenge => {
            if (challenge.type === type && !challenge.completed) {
                if (type === 'perfectRun') {
                    challenge.progress = value ? 1 : 0;
                } else {
                    challenge.progress = Math.max(challenge.progress, value);
                }
                
                if (challenge.progress >= challenge.target) {
                    this.completeChallenge(challenge);
                }
            }
        });
        
        this.updateChallengeDisplay();
    }

    completeChallenge(challenge) {
        challenge.completed = true;
        this.completedToday.push(challenge.id);
        
        // Award rewards
        gameData.totalCoins += challenge.rewards.coins;
        
        // Show completion notification
        this.showChallengeComplete(challenge);
        
        // Play success sound
        audioManager.playSound('purchase');
        
        this.saveChallenges();
        updateCoinDisplays();
        
        // Update challenge button
        updateChallengeButton();
    }

    showChallengeComplete(challenge) {
        const notification = document.createElement('div');
        notification.className = 'challenge-complete-notification';
        notification.innerHTML = `
            <div class="challenge-complete-content">
                <div class="challenge-complete-icon">🏆</div>
                <div class="challenge-complete-text">
                    <div class="challenge-complete-title">CHALLENGE COMPLETED!</div>
                    <div class="challenge-complete-name">${challenge.title}</div>
                    <div class="challenge-complete-reward">+${challenge.rewards.coins} 🪙</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 4000);
        
        // Particle effect
        particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, '#43cbff');
    }

    getChallenges() {
        return this.challenges;
    }

    updateChallengeDisplay() {
        const container = document.getElementById('daily-challenges-container');
        if (!container) {
            console.log('Daily challenges container not found');
            return;
        }
        
        container.innerHTML = '';
        
        this.challenges.forEach(challenge => {
            const div = document.createElement('div');
            div.className = `challenge-item ${challenge.completed ? 'completed' : ''}`;
            
            const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);
            
            div.innerHTML = `
                <div class="challenge-header">
                    <div class="challenge-title">${challenge.title}</div>
                    <div class="challenge-reward">🪙 ${challenge.rewards.coins}</div>
                </div>
                <div class="challenge-description">${challenge.description}</div>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">${challenge.progress}/${challenge.target}</div>
                </div>
                ${challenge.completed ? '<div class="challenge-complete-badge">✓ COMPLETED</div>' : ''}
            `;
            
            // Add hover effects
            div.addEventListener('mouseenter', () => {
                if (audioManager) audioManager.playSound('hover');
            });
            
            // Add click interaction for completed challenges
            if (challenge.completed) {
                div.addEventListener('click', () => {
                    if (audioManager) audioManager.playSound('click');
                });
            }
            
            container.appendChild(div);
        });
    }

    saveChallenges() {
        const data = {
            challenges: this.challenges,
            completedToday: this.completedToday,
            lastResetDate: this.lastResetDate
        };
        localStorage.setItem('dashBlitzDailyChallenges', JSON.stringify(data));
    }

    loadChallenges() {
        const saved = localStorage.getItem('dashBlitzDailyChallenges');
        if (saved) {
            const data = JSON.parse(saved);
            this.challenges = data.challenges || [];
            this.completedToday = data.completedToday || [];
            this.lastResetDate = data.lastResetDate;
        }
        
        this.generateDailyChallenges(); // This will reset if needed
    }
}

// Daily Challenges Modal Functions
function showDailyChallenges() {
    const modal = document.getElementById('daily-challenges-modal');
    modal.classList.add('active');
    
    // Update challenges display when modal opens
    if (dailyChallenges) {
        dailyChallenges.updateChallengeDisplay();
    }
    
    audioManager.playSound('select');
}

function closeDailyChallenges() {
    const modal = document.getElementById('daily-challenges-modal');
    modal.classList.remove('active');
    
    audioManager.playSound('click');
}

// Update challenge button display
function updateChallengeButton() {
    if (!dailyChallenges) return;
    
    const challenges = dailyChallenges.getChallenges();
    const completedCount = challenges.filter(c => c.completed).length;
    const totalCount = challenges.length;
    
    const progressText = document.getElementById('challenges-progress-text');
    const completionBadge = document.getElementById('challenges-completion-badge');
    const completedCountSpan = document.getElementById('completed-count');
    
    if (progressText) {
        if (completedCount === totalCount) {
            progressText.textContent = 'All challenges completed!';
            progressText.style.color = '#00f2fe';
        } else {
            progressText.textContent = `${totalCount - completedCount} challenges remaining`;
            progressText.style.color = '#b3c7e6';
        }
    }
    
    if (completionBadge && completedCountSpan) {
        completedCountSpan.textContent = completedCount;
        
        if (completedCount > 0) {
            completionBadge.style.display = 'block';
            
            if (completedCount === totalCount) {
                completionBadge.style.background = 'linear-gradient(135deg, #00f2fe, #43cbff)';
                completionBadge.style.animation = 'challengeComplete 2s ease-in-out infinite alternate';
            }
        } else {
            completionBadge.style.display = 'none';
        }
    }
}

// Add completion animation
const style = document.createElement('style');
style.textContent = `
    @keyframes challengeComplete {
        0% { box-shadow: 0 0 10px rgba(0, 242, 254, 0.5); }
        100% { box-shadow: 0 0 20px rgba(0, 242, 254, 0.8), 0 0 30px rgba(0, 242, 254, 0.3); }
    }
`;
document.head.appendChild(style);

// Test functions to manually update challenge progress (for demo purposes)
function testChallengeProgress() {
    if (dailyChallenges) {
        // Simulate some progress for testing
        dailyChallenges.updateProgress('distance', Math.floor(Math.random() * 2000) + 500);
        dailyChallenges.updateProgress('coins', Math.floor(Math.random() * 100) + 25);
        dailyChallenges.updateProgress('jumps', Math.floor(Math.random() * 50) + 10);
        dailyChallenges.updateProgress('powerups', Math.floor(Math.random() * 15) + 3);
        
        console.log('🎯 Challenge progress updated for testing!');
    }
}

// Function to complete a random challenge (for testing)
function testCompleteChallenge() {
    if (dailyChallenges && dailyChallenges.challenges.length > 0) {
        const incompleteChallenges = dailyChallenges.challenges.filter(c => !c.completed);
        if (incompleteChallenges.length > 0) {
            const randomChallenge = incompleteChallenges[Math.floor(Math.random() * incompleteChallenges.length)];
            dailyChallenges.updateProgress(randomChallenge.type, randomChallenge.target);
        }
    }
}

// Google Authentication Management
class GoogleAuthManager {
    constructor() {
        this.isSignedIn = false;
        this.currentUser = null;
        this.gapi = null;
    }

    async initializeGoogleAuth() {
        try {
            // Load Google API
            await this.loadGoogleAPI();
            
            // Initialize Google Auth
            await this.gapi.load('auth2', () => {
                this.gapi.auth2.init({
                    client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual client ID
cookiepolicy: 'single_host_origin',
                    scope: 'profile email'
                }).then(() => {
                    console.log('Google Auth initialized');
                    this.checkExistingAuth();
                });
            });
        } catch (error) {
            console.error('Failed to initialize Google Auth:', error);
        }
    }

    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                this.gapi = window.gapi;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                this.gapi = window.gapi;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    checkExistingAuth() {
        if (this.gapi && this.gapi.auth2) {
            const authInstance = this.gapi.auth2.getAuthInstance();
            if (authInstance.isSignedIn.get()) {
                const user = authInstance.currentUser.get();
                this.handleSignInSuccess(user);
            }
        }
    }

    async signIn() {
        try {
            if (!this.gapi || !this.gapi.auth2) {
                throw new Error('Google Auth not initialized');
            }

            const authInstance = this.gapi.auth2.getAuthInstance();
            const user = await authInstance.signIn();
            this.handleSignInSuccess(user);
            
        } catch (error) {
            console.error('Google Sign-In failed:', error);
            this.showAuthError('Failed to sign in with Google');
        }
    }

    async signOut() {
        try {
            if (this.gapi && this.gapi.auth2) {
                const authInstance = this.gapi.auth2.getAuthInstance();
                await authInstance.signOut();
                this.handleSignOut();
            }
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    }

    handleSignInSuccess(user) {
        this.isSignedIn = true;
        this.currentUser = user;
        
        const profile = user.getBasicProfile();
        const userData = {
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            imageUrl: profile.getImageUrl()
        };

        this.updateAuthUI(userData);
        this.syncCloudData(userData);
        
        audioManager.playSound('select');
    }

    handleSignOut() {
        this.isSignedIn = false;
        this.currentUser = null;
        this.hideAuthStatus();
        
        console.log('User signed out successfully');
    }

updateAuthUI(userData) {
        const authStatus = document.getElementById('auth-status');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userAvatar = document.getElementById('user-avatar');
        const googleContainer = document.querySelector('.google-signin-container');

        userName.textContent = userData.name;
        userEmail.textContent = userData.email;
        
        if (userData.imageUrl) {
            userAvatar.innerHTML = `<img src="${userData.imageUrl}" alt="Profile">`;
        } else {
            userAvatar.textContent = userData.name.charAt(0).toUpperCase();
        }

        authStatus.style.display = 'block';
        googleContainer.style.display = 'none';
    }

hideAuthStatus() {
        const authStatus = document.getElementById('auth-status');
        const googleContainer = document.querySelector('.google-signin-container');
        
        authStatus.style.display = 'none';
        googleContainer.style.display = 'flex';
    }

    showAuthError(message) {
        // You can implement a toast notification or modal here
        console.error('Auth Error:', message);
        alert(message); // Simple fallback
    }

    async syncCloudData(userData) {
        try {
            // Here you would implement your cloud save/load logic
            console.log('Syncing cloud data for user:', userData.name);
            
            // Example: Load user's game data from cloud
            // const cloudData = await this.loadCloudGameData(userData.id);
            // if (cloudData) {
            //     gameData = { ...gameData, ...cloudData };
            //     updateCoinDisplays();
            //     populateCharacterSelect();
            //     populateWorldSelect();
            //     populateShop();
            // }
            
        } catch (error) {
            console.error('Failed to sync cloud data:', error);
        }
    }
}

let googleAuthManager;
let dailyChallenges;

// Save Code System (adapted from your main game)
const SAVE_VERSION = "1.0";

class SaveCodeManager {
    constructor() {
        this.currentProfile = null;
        this.playerId = null;
        this.currentProfileName = "Player";
        this.initializeProfile();
    }

    initializeProfile() {
        // Create a profile from current gameData
        this.currentProfile = {
            totalCoins: gameData.totalCoins,
            currentCharacter: gameData.currentCharacter,
            currentWorld: gameData.currentWorld,
            unlockedCharacters: { ...gameData.unlockedCharacters },
            unlockedWorlds: { ...gameData.unlockedWorlds },
            timestamp: Date.now()
        };
        this.playerId = this.generatePlayerId();
    }

    generatePlayerId() {
        // Generate a unique player ID if not exists
        let playerId = localStorage.getItem('dashBlitzPlayerId');
        if (!playerId) {
            playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('dashBlitzPlayerId', playerId);
        }
        return playerId;
    }

    updateProfile() {
        // Sync current game state to profile
        this.currentProfile = {
            totalCoins: gameData.totalCoins,
            currentCharacter: gameData.currentCharacter,
            currentWorld: gameData.currentWorld,
            unlockedCharacters: { ...gameData.unlockedCharacters },
            unlockedWorlds: { ...gameData.unlockedWorlds },
            timestamp: Date.now()
        };
    }

    generateSaveCode() {
        if (!this.currentProfile || !this.playerId) {
            alert('❌ No save data available to export!');
            return null;
        }
        
        try {
            this.updateProfile(); // Sync latest game state
            
            const exportData = {
                version: SAVE_VERSION,
                playerId: this.playerId,
                profileName: this.currentProfileName,
                profile: this.currentProfile,
                timestamp: Date.now(),
                deviceInfo: navigator.userAgent.substring(0, 50)
            };
            
            const compressed = JSON.stringify(exportData);
            const encoded = btoa(compressed);
            
            // Create readable save code (format: DASH-XXXX-XXXX-XXXX)
            const codeBase = encoded.substring(0, 12).toUpperCase();
            const saveCode = `DASH-${codeBase.substring(0, 4)}-${codeBase.substring(4, 8)}-${codeBase.substring(8, 12)}`;
            
            console.log('💾 Save code generated:', saveCode);
            return { code: saveCode, fullData: encoded };
            
        } catch (error) {
            console.error('❌ Failed to generate save code:', error);
            alert('❌ Failed to generate save code!');
            return null;
        }
    }

    useSaveCode(saveCode, fullData) {
        try {
            if (!fullData) {
                alert('❌ Save codes need the full export data!');
                return false;
            }
            
            const decodedData = JSON.parse(atob(fullData));
            
            if (decodedData.version !== SAVE_VERSION) {
                console.log('⚠️ Save code is from different version, attempting to use anyway...');
            }
            
            if (!decodedData.profile || !decodedData.playerId) {
                throw new Error('Invalid save code data');
            }
            
            console.log('📥 Restoring save from code...');
            console.log(`💰 Restoring ${decodedData.profile.totalCoins} coins`);
            console.log(`👤 Restoring character: ${decodedData.profile.currentCharacter}`);
            
            // Apply the restored profile to game state
            gameData.totalCoins = decodedData.profile.totalCoins || 0;
            gameData.currentCharacter = decodedData.profile.currentCharacter || 'apple';
            gameData.currentWorld = decodedData.profile.currentWorld || 'city';
            gameData.unlockedCharacters = decodedData.profile.unlockedCharacters || { apple: true };
            gameData.unlockedWorlds = decodedData.profile.unlockedWorlds || { city: true };
            
            // Update our profile
            this.currentProfile = decodedData.profile;
            this.currentProfileName = decodedData.profileName || "Restored";
            
            // Update UI
            updateCoinDisplays();
            populateCharacterSelect();
            populateWorldSelect();
            populateShop();
            
            // Save locally
            localStorage.setItem('dashBlitzGameData', JSON.stringify(gameData));
            
            alert(`✅ Progress restored!\n💰 ${gameData.totalCoins} coins\n👤 Character: ${gameData.currentCharacter}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to use save code:', error);
            alert('❌ Invalid save code data!');
            return false;
        }
    }
}

let saveCodeManager;

// Global functions for save code system
function showSaveCode() {
    if (!saveCodeManager) {
        saveCodeManager = new SaveCodeManager();
    }
    
    const result = saveCodeManager.generateSaveCode();
    if (!result) return;
    
    const modal = document.createElement('div');
    modal.className = 'save-code-modal';
    
    modal.innerHTML = `
        <div class="save-code-content">
            <h2>📱 Transfer Your Progress</h2>
            <p>Use this code to restore your progress on any device:</p>
            
            <div class="save-code-display">
                <h3>Save Code:</h3>
                <div class="save-code-text">${result.code}</div>
            </div>
            
            <textarea readonly class="save-data-textarea" onclick="this.select()">${result.fullData}</textarea>
            <div class="save-code-hint">Copy both the code AND the text above</div>
            
            <div class="save-code-buttons">
                <button class="modal-btn primary" onclick="copySaveData('${result.fullData}')">
                    Copy Data
                </button>
                <button class="modal-btn secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                    Done
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    audioManager.playSound('select');
}

function showRestoreCode() {
    const modal = document.createElement('div');
    modal.className = 'save-code-modal';
    
    modal.innerHTML = `
        <div class="save-code-content">
            <h2>📥 Restore Your Progress</h2>
            <p>Enter your save code and data:</p>
            
            <input type="text" id="saveCodeInput" class="save-code-input" placeholder="DASH-XXXX-XXXX-XXXX">
            
            <textarea id="saveDataInput" class="save-data-textarea" placeholder="Paste the full save data here..."></textarea>
            
            <div class="save-code-buttons">
                <button class="modal-btn primary" onclick="restoreFromInputs()">
                    Restore Progress
                </button>
                <button class="modal-btn secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    audioManager.playSound('select');
}

function restoreFromInputs() {
    const code = document.getElementById('saveCodeInput').value.trim();
    const data = document.getElementById('saveDataInput').value.trim();
    
    if (!code || !data) {
        alert('❌ Please enter both the save code and data!');
        return;
    }
    
    if (!saveCodeManager) {
        saveCodeManager = new SaveCodeManager();
    }
    
    if (saveCodeManager.useSaveCode(code, data)) {
        document.querySelector('.save-code-modal').remove();
        audioManager.playSound('purchase');
    }
}

function copySaveData(data) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(data).then(() => {
            // Visual feedback
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.background = 'linear-gradient(135deg, #34C759, #32D74B)';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 2000);
        }).catch(() => {
            // Fallback for older browsers
            alert('Please manually copy the save data from the text area above.');
        });
    } else {
        // Fallback for older browsers
        alert('Please manually copy the save data from the text area above.');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    dailyChallenges = new DailyChallenges();
    dailyChallenges.loadChallenges();
    
    // Make sure challenges display after a short delay
    setTimeout(() => {
        if (dailyChallenges) {
            dailyChallenges.updateChallengeDisplay();
        }
    }, 500);
});

// Global functions for button handlers
function handleGoogleSignIn() {
    const button = document.querySelector('.google-signin-button');
    button.classList.add('loading');
    
    if (googleAuthManager) {
        googleAuthManager.signIn().finally(() => {
            button.classList.remove('loading');
        });
    } else {
        console.error('Google Auth Manager not initialized');
        button.classList.remove('loading');
    }
}

function handleSignOut() {
    if (googleAuthManager) {
        googleAuthManager.signOut();
    }
}

// Initialize systems
document.addEventListener('DOMContentLoaded', () => {
    audioManager = new AudioManager();
    particleSystem = new ParticleSystem();
    
    // Initialize daily challenges
    dailyChallenges = new DailyChallenges();
    dailyChallenges.loadChallenges();
    
    // Initialize achievement system
    achievementSystem = new AchievementSystem();
    
    // Initialize Google Auth
    googleAuthManager = new GoogleAuthManager();
    googleAuthManager.initializeGoogleAuth();
    
    // Update challenge button after a short delay
    setTimeout(() => {
        if (dailyChallenges) {
            updateChallengeButton();
        }
    }, 500);
    
    // Add sound effects to all buttons
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            audioManager.playSound('click');
            
            // Create particle burst at click location
            const rect = e.target.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            particleSystem.burst(x, y);
        }
    });
    
    // Add hover effects
    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('menu-card') || 
            e.target.classList.contains('character-item') ||
            e.target.classList.contains('world-item') ||
            e.target.classList.contains('shop-item')) {
            audioManager.playSound('hover');
        }
    });
    
    updateCoinDisplays();
    populateCharacterSelect();
    populateWorldSelect();
    populateShop();
});

// Screen navigation functions
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
}

function showMainMenu() {
    showScreen('main-menu');
    updateCoinDisplays();
    
    // Update challenge button
    if (dailyChallenges) {
        updateChallengeButton();
    }
}

function showCharacterSelect() {
    showScreen('character-select');
    populateCharacterSelect();
}

function showWorldSelect() {
    showScreen('world-select');
    populateWorldSelect();
}

function showShop() {
    showScreen('shop');
    populateShop();
    updateCoinDisplays();
}

function showSettings() {
    showScreen('settings');
}

function startGame() {
    console.log('Starting game with:', {
        character: gameData.currentCharacter,
        world: gameData.currentWorld
    });
    
    // Save selected character and world to localStorage for main game to read
    localStorage.setItem('selectedCharacter', gameData.currentCharacter);
    localStorage.setItem('selectedWorld', gameData.currentWorld);
    localStorage.setItem('gameCoins', gameData.totalCoins);
    
    // Return to main game
    window.location.href = '../index (before UI overhaul).html?startGame=true';
}

// Character system
function populateCharacterSelect() {
    const grid = document.getElementById('character-grid');
    grid.innerHTML = '';
    
    Object.keys(characters).forEach(key => {
        const character = characters[key];
        const isUnlocked = gameData.unlockedCharacters[key];
        const isSelected = gameData.currentCharacter === key;
        
        const div = document.createElement('div');
        div.className = `character-item ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
        div.onclick = () => isUnlocked && selectCharacterInMenu(key);
        
        div.innerHTML = `
            <div class="character-icon" style="font-size: 3rem;">${character.icon}</div>
            <div class="character-name">${character.name}</div>
            <div class="character-description">${character.description}</div>
            ${!isUnlocked ? '<div class="lock-overlay">🔒</div>' : ''}
        `;
        
        grid.appendChild(div);
    });
}

function selectCharacterInMenu(characterKey) {
    gameData.currentCharacter = characterKey;
    audioManager.playSound('select');
    populateCharacterSelect();
    
    // Create particle burst
    const characterElement = document.querySelector(`.character-item.selected`);
    if (characterElement) {
        const rect = characterElement.getBoundingClientRect();
        particleSystem.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, characters[characterKey].color);
    }
}

// World system
function populateWorldSelect() {
    const grid = document.getElementById('world-grid');
    grid.innerHTML = '';
    
    Object.keys(worlds).forEach(key => {
        const world = worlds[key];
        const isUnlocked = gameData.unlockedWorlds[key];
        const isSelected = gameData.currentWorld === key;
        
        const div = document.createElement('div');
        div.className = `world-item ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
        div.onclick = () => isUnlocked && selectWorld(key);
        
        div.innerHTML = `
            <div class="world-icon" style="font-size: 3rem;">${world.icon}</div>
            <div class="world-name">${world.name}</div>
            <div class="world-theme">${world.theme}</div>
            ${!isUnlocked ? '<div class="lock-overlay">🔒</div>' : ''}
        `;
        
        grid.appendChild(div);
    });
}

function selectWorld(worldKey) {
    gameData.currentWorld = worldKey;
    audioManager.playSound('select');
    populateWorldSelect();
    
    // Create particle burst
    const worldElement = document.querySelector(`.world-item.selected`);
    if (worldElement) {
        const rect = worldElement.getBoundingClientRect();
        particleSystem.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, worlds[worldKey].color);
    }
}

// Shop system
function switchShopTab(tab) {
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.shop-tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`.shop-tab:nth-child(${tab === 'characters' ? '1' : '2'})`).classList.add('active');
    document.getElementById(`shop-${tab}`).classList.add('active');
    
    audioManager.playSound('click');
}

function populateShop() {
    populateCharacterShop();
    populateWorldShop();
}

function populateCharacterShop() {
    const grid = document.getElementById('shop-characters-grid');
    grid.innerHTML = '';
    
    Object.keys(characters).forEach(key => {
        const character = characters[key];
        const isUnlocked = gameData.unlockedCharacters[key];
        
        if (character.price === 0) return; // Skip free characters
        
        const div = document.createElement('div');
        div.className = `shop-item ${isUnlocked ? 'owned' : ''}`;
        div.onclick = () => !isUnlocked && showCharacterPreview(key);
        
        div.innerHTML = `
            <div class="character-icon" style="font-size: 3rem;">${character.icon}</div>
            <div class="character-name">${character.name}</div>
            <div class="character-description">${character.description}</div>
            ${isUnlocked ? 
                '<div class="owned-badge" style="background: #4ecdc4; color: white; padding: 0.5rem; border-radius: 10px; margin-top: 0.5rem;">OWNED</div>' :
                `<div class="price-tag">${character.price} 🪙</div>`
            }
        `;
        
        grid.appendChild(div);
    });
}

function populateWorldShop() {
    const grid = document.getElementById('shop-worlds-grid');
    grid.innerHTML = '';
    
    Object.keys(worlds).forEach(key => {
        const world = worlds[key];
        const isUnlocked = gameData.unlockedWorlds[key];
        
        if (world.price === 0) return; // Skip free worlds
        
        const div = document.createElement('div');
        div.className = `shop-item ${isUnlocked ? 'owned' : ''}`;
        div.onclick = () => !isUnlocked && buyWorld(key);
        
        div.innerHTML = `
            <div class="world-icon" style="font-size: 3rem;">${world.icon}</div>
            <div class="world-name">${world.name}</div>
            <div class="world-theme">${world.theme}</div>
            ${isUnlocked ? 
                '<div class="owned-badge" style="background: linear-gradient(135deg, #43cbff, #00f2fe); color: #0f1419; padding: 0.5rem; border-radius: 10px; margin-top: 0.5rem; font-weight: bold;">OWNED</div>' :
                `<div class="price-tag">${world.price} 🪙</div>`
            }
        `;
        
        grid.appendChild(div);
    });
}

// Character preview modal
function showCharacterPreview(characterKey) {
    currentPreviewCharacter = characterKey;
    const character = characters[characterKey];
    const modal = document.getElementById('character-preview-modal');
    
    document.getElementById('preview-character-name').textContent = character.name;
    document.getElementById('preview-character-description').textContent = character.description;
    document.getElementById('character-price').textContent = character.price;
    
    // Show/hide buttons based on ownership
    const selectBtn = document.querySelector('.select-btn');
    const buyBtn = document.getElementById('buy-character-btn');
    
    if (gameData.unlockedCharacters[characterKey]) {
        selectBtn.style.display = 'block';
        buyBtn.style.display = 'none';
    } else {
        selectBtn.style.display = 'none';
        buyBtn.style.display = 'block';
        buyBtn.disabled = gameData.totalCoins < character.price;
    }
    
    modal.classList.add('active');
    
    // Initialize 3D preview
    const previewContainer = document.getElementById('character-3d-preview');
    previewContainer.innerHTML = '';
    character3DPreview = new Character3DPreview(previewContainer);
    character3DPreview.loadCharacter(characterKey);
}

function closeCharacterPreview() {
    const modal = document.getElementById('character-preview-modal');
    modal.classList.remove('active');
    
    if (character3DPreview) {
        character3DPreview.destroy();
        character3DPreview = null;
    }
}

function selectCharacter() {
    if (currentPreviewCharacter) {
        selectCharacterInMenu(currentPreviewCharacter);
        closeCharacterPreview();
    }
}

function buyCharacter() {
    if (!currentPreviewCharacter) return;
    
    const character = characters[currentPreviewCharacter];
    
    if (gameData.totalCoins >= character.price) {
        gameData.totalCoins -= character.price;
        gameData.unlockedCharacters[currentPreviewCharacter] = true;
        
        audioManager.playSound('purchase');
        updateCoinDisplays();
        populateShop();
        
        // Show success animation
        const modal = document.querySelector('.modal-content');
        const rect = modal.getBoundingClientRect();
        particleSystem.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#feca57');
        
        setTimeout(() => {
            closeCharacterPreview();
        }, 1000);
    }
}

function buyWorld(worldKey) {
    const world = worlds[worldKey];
    
    if (gameData.totalCoins >= world.price) {
        gameData.totalCoins -= world.price;
        gameData.unlockedWorlds[worldKey] = true;
        
        audioManager.playSound('purchase');
        updateCoinDisplays();
        populateShop();
        
        // Show success animation
        const worldElement = document.querySelector(`[onclick*="${worldKey}"]`);
        if (worldElement) {
            const rect = worldElement.getBoundingClientRect();
            particleSystem.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#feca57');
        }
    }
}

// Settings
function playTrack(trackName) {
    audioManager.playTrack(trackName);
}

// Utility functions
function updateCoinDisplays() {
    document.getElementById('coin-count').textContent = gameData.totalCoins;
    document.getElementById('shop-coin-count').textContent = gameData.totalCoins;
}

// Save system (for integration)
function saveGameData() {
    localStorage.setItem('blitzGameData', JSON.stringify(gameData));
}

function loadGameData() {
    const saved = localStorage.getItem('blitzGameData');
    if (saved) {
        gameData = { ...gameData, ...JSON.parse(saved) };
        updateCoinDisplays();
    }
}

// Modal click outside to close
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeCharacterPreview();
    }
});

// Initialize with title screen
showScreen('title-screen');

