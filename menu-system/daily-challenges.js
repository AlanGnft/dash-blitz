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
        particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, '#feca57');
    }

    getChallenges() {
        return this.challenges;
    }

    updateChallengeDisplay() {
        const container = document.getElementById('daily-challenges-container');
        if (!container) return;
        
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
            
            container.appendChild(div);
        });
    }

    saveChallenges() {
        const data = {
            challenges: this.challenges,
            completedToday: this.completedToday,
            lastResetDate: this.lastResetDate
        };
        localStorage.setItem('blitzDailyChallenges', JSON.stringify(data));
    }

    loadChallenges() {
        const saved = localStorage.getItem('blitzDailyChallenges');
        if (saved) {
            const data = JSON.parse(saved);
            this.challenges = data.challenges || [];
            this.completedToday = data.completedToday || [];
            this.lastResetDate = data.lastResetDate;
        }
        
        this.generateDailyChallenges(); // This will reset if needed
    }
}



// Global daily challenges instance
let dailyChallenges;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    dailyChallenges = new DailyChallenges();
    dailyChallenges.loadChallenges();// Test functions to manually update challenge progress (for demo purposes)
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
});