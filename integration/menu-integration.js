// Integration bridge between menu system and main game
class MenuIntegration {
    constructor() {
        this.gameDataKeys = [
            'totalCoins',
            'currentCharacter', 
            'currentWorld',
            'unlockedCharacters',
            'unlockedWorlds',
            'playerStats',
            'achievements'
        ];
        
        this.callbacks = {
            onCharacterSelect: null,
            onWorldSelect: null,
            onGameStart: null,
            onPurchase: null
        };
    }

    // Initialize integration with main game
    init(mainGameInstance) {
        this.mainGame = mainGameInstance;
        this.syncDataFromMainGame();
        this.setupEventListeners();
        
        console.log('Menu integration initialized');
    }

    // Sync data from main game to menu system
    syncDataFromMainGame() {
        if (!this.mainGame) return;

        // Map main game data to menu system format
        if (this.mainGame.totalCoins !== undefined) {
            gameData.totalCoins = this.mainGame.totalCoins;
        }
        
        if (this.mainGame.currentCharacter) {
            gameData.currentCharacter = this.mainGame.currentCharacter;
        }
        
        if (this.mainGame.currentWorld) {
            gameData.currentWorld = this.mainGame.currentWorld;
        }
        
        if (this.mainGame.unlockedCharacters) {
            gameData.unlockedCharacters = { ...this.mainGame.unlockedCharacters };
        }
        
        if (this.mainGame.unlockedWorlds) {
            gameData.unlockedWorlds = { ...this.mainGame.unlockedWorlds };
        }

        // Update displays
        updateCoinDisplays();
        populateCharacterSelect();
        populateWorldSelect();
        populateShop();
    }

    // Sync data from menu system back to main game
    syncDataToMainGame() {
        if (!this.mainGame) return;

        this.mainGame.totalCoins = gameData.totalCoins;
        this.mainGame.currentCharacter = gameData.currentCharacter;
        this.mainGame.currentWorld = gameData.currentWorld;
        this.mainGame.unlockedCharacters = { ...gameData.unlockedCharacters };
        this.mainGame.unlockedWorlds = { ...gameData.unlockedWorlds };
        
        // Trigger main game save
        if (this.mainGame.saveGameData) {
            this.mainGame.saveGameData();
        }
    }

    // Set up event listeners for menu actions
    setupEventListeners() {
        // Override menu functions to sync with main game
        const originalSelectCharacter = window.selectCharacterInMenu;
        window.selectCharacterInMenu = (characterKey) => {
            originalSelectCharacter(characterKey);
            this.syncDataToMainGame();
            
            if (this.callbacks.onCharacterSelect) {
                this.callbacks.onCharacterSelect(characterKey);
            }
        };

        const originalSelectWorld = window.selectWorld;
        window.selectWorld = (worldKey) => {
            originalSelectWorld(worldKey);
            this.syncDataToMainGame();
            
            if (this.callbacks.onWorldSelect) {
                this.callbacks.onWorldSelect(worldKey);
            }
        };

        const originalStartGame = window.startGame;
        window.startGame = () => {
            this.syncDataToMainGame();
            
            if (this.callbacks.onGameStart) {
                this.callbacks.onGameStart(gameData.currentCharacter, gameData.currentWorld);
            } else {
                originalStartGame();
            }
        };

        const originalBuyCharacter = window.buyCharacter;
        window.buyCharacter = () => {
            const characterKey = currentPreviewCharacter;
            const originalCoins = gameData.totalCoins;
            
            originalBuyCharacter();
            
            // Check if purchase was successful
            if (gameData.totalCoins < originalCoins) {
                this.syncDataToMainGame();
                
                if (this.callbacks.onPurchase) {
                    this.callbacks.onPurchase('character', characterKey, characters[characterKey].price);
                }
            }
        };

        const originalBuyWorld = window.buyWorld;
        window.buyWorld = (worldKey) => {
            const originalCoins = gameData.totalCoins;
            
            originalBuyWorld(worldKey);
            
            // Check if purchase was successful
            if (gameData.totalCoins < originalCoins) {
                this.syncDataToMainGame();
                
                if (this.callbacks.onPurchase) {
                    this.callbacks.onPurchase('world', worldKey, worlds[worldKey].price);
                }
            }
        };
    }

    // Register callbacks for main game events
    onCharacterSelect(callback) {
        this.callbacks.onCharacterSelect = callback;
    }

    onWorldSelect(callback) {
        this.callbacks.onWorldSelect = callback;
    }

    onGameStart(callback) {
        this.callbacks.onGameStart = callback;
    }

    onPurchase(callback) {
        this.callbacks.onPurchase = callback;
    }

    // Method to hide menu and show main game
    hideMenu() {
        document.getElementById('menu-system').style.display = 'none';
    }

    // Method to show menu and pause main game
    showMenu() {
        document.getElementById('menu-system').style.display = 'block';
        this.syncDataFromMainGame();
    }

    // Update coin count from main game (for real-time updates)
    updateCoins(newAmount) {
        gameData.totalCoins = newAmount;
        updateCoinDisplays();
    }

    // Unlock new content from main game
    unlockCharacter(characterKey) {
        gameData.unlockedCharacters[characterKey] = true;
        populateCharacterSelect();
        populateShop();
        
        // Show unlock notification
        this.showUnlockNotification('character', characters[characterKey].name, characters[characterKey].icon);
    }

    unlockWorld(worldKey) {
        gameData.unlockedWorlds[worldKey] = true;
        populateWorldSelect();
        populateShop();
        
        // Show unlock notification
        this.showUnlockNotification('world', worlds[worldKey].name, worlds[worldKey].icon);
    }

    // Show unlock notification
    showUnlockNotification(type, name, icon) {
        const notification = document.createElement('div');
        notification.className = 'unlock-notification';
        notification.innerHTML = `
            <div class="unlock-content">
                <div class="unlock-icon">${icon}</div>
                <div class="unlock-text">
                    <div class="unlock-title">NEW ${type.toUpperCase()} UNLOCKED!</div>
                    <div class="unlock-name">${name}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Animate out
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 3000);
        
        // Play unlock sound and particle effect
        audioManager.playSound('purchase');
        particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, '#feca57');
    }
}

// Global integration instance
let menuIntegration;

// Initialize integration when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    menuIntegration = new MenuIntegration();
});

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuIntegration;
}