class CharacterPackageManager {
    constructor() {
        this.gameHtmlPath = '../index.html';
        this.charactersPath = '../characters/';
        this.activeCharacters = [];
        this.availableCharacters = [];
        this.characterStats = {};
        this.htmlContent = '';
        
        this.init();
    }

async init() {
    this.updateStatus('Initializing Character Manager...');
    
    // Bind event listeners
    this.bindEvents();

    // Initialize 3D preview system
    this.init3DPreview();
    
    // Create file selection UI
    this.createFileSelectionUI();
    
    // Initialize with default data (don't load file automatically)
    this.initializeDefaultData();
    await this.scanAvailableCharacters();
    
// Render interface
this.renderActiveCharacters();
this.renderAvailableCharacters();
    
    this.updateStatus('Click "📁 Select Game File" to load your game!');
}

initializeDefaultData() {
    // Initialize with empty/default data until file is loaded
    this.activeCharacters = [];
    this.htmlContent = '';
}

    bindEvents() {
        // Header buttons
        document.getElementById('saveChanges').addEventListener('click', () => this.saveChangesToGame());
        document.getElementById('refreshData').addEventListener('click', () => this.refreshAll());
        
        // Character swapper controls
        document.getElementById('randomizeOrder').addEventListener('click', () => this.randomizeCharacterOrder());
        document.getElementById('reverseOrder').addEventListener('click', () => this.reverseCharacterOrder());
        
        // Filters
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterAvailableCharacters());
        document.getElementById('searchFilter').addEventListener('input', () => this.filterAvailableCharacters());
        
        // Make active characters sortable
        this.initSortable();
    }

async loadGameData() {
    this.updateStatus('Loading game data...');
    
    try {
        this.htmlContent = await this.readGameFile();
        
        // Extract active characters from the HTML
        this.activeCharacters = this.extractActiveCharacters();
        
        // Re-render everything with the new data
        this.renderActiveCharacters();
        this.renderAvailableCharacters();
        
        this.updateStatus(`✅ Game file loaded! Found ${this.activeCharacters.length} active characters.`);
        
    } catch (error) {
        console.error('Error loading game data:', error);
        if (error.message === 'File selection cancelled') {
            this.updateStatus('File selection cancelled');
        } else {
            this.updateStatus(`Error loading game data: ${error.message}`, 'error');
        }
    }
}

async readGameFile() {
    try {
        // Try to read the file using File System Access API (modern browsers)
        if ('showOpenFilePicker' in window) {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'HTML files',
                    accept: {'text/html': ['.html']}
                }]
            });
            
            this.gameFileHandle = fileHandle; // Store for writing later
            const file = await fileHandle.getFile();
            return await file.text();
        } else {
            // Fallback: Use traditional file input
            return await this.readFileWithInput();
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('File selection cancelled');
        }
        console.error('Error reading file:', error);
        throw new Error('Could not read game file');
    }
}

async readFileWithInput() {
    return new Promise((resolve, reject) => {
        // Create a hidden file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html';
        input.style.display = 'none';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }
            
            try {
                const text = await file.text();
                resolve(text);
            } catch (error) {
                reject(error);
            }
            
            // Clean up
            document.body.removeChild(input);
        };
        
        input.oncancel = () => {
            reject(new Error('File selection cancelled'));
            document.body.removeChild(input);
        };
        
        document.body.appendChild(input);
        input.click();
    });
}

extractActiveCharacters() {
    // Look for the character roster with multiple patterns
    const patterns = [
        // Look for injection point comments
        /\/\/ CHARACTER ROSTER INJECTION POINT[\s\S]*?\/\/ END CHARACTER ROSTER INJECTION POINT/,
        // Look for let characterNames array
        /let\s+characterNames\s*=\s*\[([\s\S]*?)\]/,
        // Look for characterNames assignment
        /characterNames\s*=\s*\[([\s\S]*?)\]/,
        // Look for any array with character names
        /\[\s*["'](?:happyface|ghost|robot|dragon)["'][\s\S]*?\]/
    ];
    
    for (const pattern of patterns) {
        const match = this.htmlContent.match(pattern);
        if (match) {
            // Extract all quoted strings from the matched content
            const quotedStrings = match[0].match(/"([^"]+)"/g);
            
            if (quotedStrings && quotedStrings.length > 0) {
                const characters = quotedStrings.map(str => str.replace(/"/g, ''));
                return characters;
            }
        }
    }
    
    // If no patterns worked, let's search for individual character names
    const knownCharacters = ["happyface", "ghost", "robot", "dragon", "ufo", "atom", "slime", "apple", "carrot", "pumpkin", "monster", "creature"];
    const foundCharacters = [];
    
    for (const char of knownCharacters) {
        if (this.htmlContent.includes(`"${char}"`)) {
            foundCharacters.push(char);
        }
    }
    
    if (foundCharacters.length > 0) {
        this.updateStatus(`⚠️ Found ${foundCharacters.length} characters via fallback method`);
        return foundCharacters;
    }
    
    this.updateStatus('⚠️ Could not find any character roster in HTML file!', 'error');
    return [];
}

async scanAvailableCharacters() {
    this.updateStatus('Scanning available characters...');
    
    // Use hardcoded characters for now (file scanning happens on button click)
    await this.loadHardcodedCharacters();
}



    renderActiveCharacters() {
        const container = document.getElementById('activeCharacters');
        container.innerHTML = '';
        
        this.activeCharacters.forEach((charId, index) => {
            const charData = this.getCharacterData(charId);
            const card = this.createCharacterCard(charData, true, index);
            container.appendChild(card);
        });
        
        this.updateCharacterCount();
        this.renderDeactivatedCharacters();

        // Enable drag and drop after rendering
        if (this.makeDraggable) {
            this.makeDraggable();
        }
    }

    renderAvailableCharacters() {
        const container = document.getElementById('availableCharacters');
        container.innerHTML = '';
        
        this.availableCharacters.forEach(charData => {
            const card = this.createCharacterCard(charData, false);
            container.appendChild(card);
        });
        
        this.updateCharacterCount();
    }

    createCharacterCard(charData, isActive, index = null) {
        const card = document.createElement('div');
        card.className = `character-card ${isActive ? 'active' : ''}`;
        card.dataset.characterId = charData.id;
        
        const emoji = charData.emoji || this.getCharacterEmoji(charData.id);
        const name = charData.name || this.formatCharacterName(charData.id);
        const category = charData.category || 'misc';
        
        card.innerHTML = `
            <div class="character-emoji">${emoji}</div>
            <div class="character-name">${name}</div>
            <div class="character-category">${category}</div>
            ${isActive ? `<div class="character-order">#${index + 1}</div>` : ''}
        `;
        
        // Add click handlers
        if (isActive) {
            card.addEventListener('click', () => this.showCharacterPreview(charData));
            card.addEventListener('dblclick', () => this.removeCharacter(charData.id));
        } else {
            card.addEventListener('click', () => this.showCharacterPreview(charData));
            card.addEventListener('dblclick', () => this.installCharacter(charData));
        }
        
        return card;
    }

    getCharacterData(charId) {
        // Map character IDs to display data
        const characterMap = {
            'happyface': { id: 'happyface', name: 'Happy Face', emoji: '😊', category: 'cute' },
            'ghost': { id: 'ghost', name: 'Ghost', emoji: '👻', category: 'scary' },
            'robot': { id: 'robot', name: 'Robot', emoji: '🤖', category: 'scifi' },
            'dragon': { id: 'dragon', name: 'Dragon', emoji: '🐉', category: 'mythical' },
            'ufo': { id: 'ufo', name: 'UFO', emoji: '🛸', category: 'scifi' },
            'atom': { id: 'atom', name: 'Atom', emoji: '⚛️', category: 'science' },
            'slime': { id: 'slime', name: 'Slime', emoji: '🟢', category: 'cute' },
            'apple': { id: 'apple', name: 'Apple', emoji: '🍎', category: 'nature' },
            'carrot': { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'nature' },
            'pumpkin': { id: 'pumpkin', name: 'Pumpkin', emoji: '🎃', category: 'nature' },
            'monster': { id: 'monster', name: 'Monster', emoji: '👾', category: 'scary' },
            'creature': { id: 'creature', name: 'Creature', emoji: '🐙', category: 'scary' }
        };
        
        return characterMap[charId] || { id: charId, name: this.formatCharacterName(charId), emoji: '❓', category: 'misc' };
    }

    getCharacterEmoji(charId) {
        const emojiMap = {
            'happyface': '😊', 'ghost': '👻', 'robot': '🤖', 'dragon': '🐉',
            'ufo': '🛸', 'atom': '⚛️', 'slime': '🟢', 'apple': '🍎',
            'carrot': '🥕', 'pumpkin': '🎃', 'monster': '👾', 'creature': '🐙'
        };
        return emojiMap[charId] || '❓';
    }

    formatCharacterName(charId) {
        return charId.charAt(0).toUpperCase() + charId.slice(1);
    }


    // Character Management Functions
    randomizeCharacterOrder() {
        this.updateStatus('🎲 Randomizing character order...');
        
        // Fisher-Yates shuffle
        for (let i = this.activeCharacters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.activeCharacters[i], this.activeCharacters[j]] = [this.activeCharacters[j], this.activeCharacters[i]];
        }
        
        this.renderActiveCharacters();
        this.updateStatus('Character order randomized! Don\'t forget to save changes.');
    }

    reverseCharacterOrder() {
        this.updateStatus('↕️ Reversing character order...');
        this.activeCharacters.reverse();
        this.renderActiveCharacters();
        this.updateStatus('Character order reversed! Don\'t forget to save changes.');
    }

installCharacter(charData) {
    // Check if already installed
    if (this.activeCharacters.includes(charData.id)) {
        this.updateStatus(`${charData.name} is already installed!`, 'error');
        return;
    }
    
    this.updateStatus(`Installing ${charData.name}...`);
    
    // Add to active characters
    this.activeCharacters.push(charData.id);
    
    // Mark as installed
    charData.installed = true;
    
    // Re-render both panels
    this.renderActiveCharacters();
    this.renderAvailableCharacters();
    
    this.updateStatus(`${charData.name} installed! Don't forget to save changes.`);
}

removeCharacter(charId) {
    if (this.activeCharacters.length <= 1) {
        this.updateStatus('Cannot remove - at least one character must remain active!', 'error');
        return;
    }
    
    const charData = this.getCharacterData(charId);
    this.updateStatus(`Removing ${charData.name}...`);
    
    // Remove from active characters
    this.activeCharacters = this.activeCharacters.filter(id => id !== charId);
    
    // Check if this character should be added back to available characters
    // (if it's not one of the original 12 characters from the game)
    const originalCharacters = ["happyface", "ghost", "robot", "dragon", "ufo", "atom", "slime", "apple", "carrot", "pumpkin", "monster", "creature"];
    
    if (!originalCharacters.includes(charId)) {
        // Add back to available characters if it's not already there
        const existingChar = this.availableCharacters.find(char => char.id === charId);
        if (!existingChar) {
            this.availableCharacters.push({
                id: charId,
                name: charData.name,
                emoji: charData.emoji,
                category: charData.category || 'misc',
                description: `${charData.name} character`,
                abilities: ['Special Move', 'Unique Ability'],
                installed: false
            });
        } else {
            existingChar.installed = false;
        }
    }
    
    // Re-render both panels
    this.renderActiveCharacters();
    this.renderAvailableCharacters();
    
    this.updateStatus(`${charData.name} removed! Don't forget to save changes.`);
}

showCharacterPreview(charData) {
    const previewArea = document.getElementById('previewArea');
    
    // Store existing canvas if it exists
    const existingCanvas = previewArea.querySelector('.preview-3d-canvas');
    
    // Create a 3D-focused layout
    previewArea.innerHTML = `
        <div class="preview-3d-container">
            <!-- 3D canvas will be inserted here -->
        </div>
        <div class="preview-character-info-compact">
            <h3>${charData.name || this.formatCharacterName(charData.id)}</h3>
            <div class="preview-category-compact">${charData.category || 'misc'}</div>
            <div class="preview-status-compact">
                <strong>Status:</strong> ${this.activeCharacters.includes(charData.id) ? 'Active in game' : 'Available to install'}
            </div>
        </div>
    `;
    
    // Add 3D canvas (reuse existing if possible)
    let canvas;
    if (existingCanvas && this.previewRenderer) {
        canvas = existingCanvas;
        console.log('♻️ Reusing existing canvas and renderer');
    } else {
        canvas = this.create3DCanvas();
        console.log('🆕 Created new canvas and renderer');
    }
    
    // Insert canvas into the 3D container
    const container = previewArea.querySelector('.preview-3d-container');
    container.appendChild(canvas);
    
    // Load the 3D character model
    console.log('🎬 About to load 3D character preview...');
    this.load3DCharacterPreview(charData);
}
    filterAvailableCharacters() {
        const category = document.getElementById('categoryFilter').value;
        const search = document.getElementById('searchFilter').value.toLowerCase();
        
        const cards = document.querySelectorAll('.available-panel .character-card');
        
        cards.forEach(card => {
            const charId = card.dataset.characterId;
            const charData = this.availableCharacters.find(char => char.id === charId);
            
            let show = true;
            
            // Category filter
            if (category !== 'all' && charData.category !== category) {
                show = false;
            }
            
            // Search filter
            if (search && !charData.name.toLowerCase().includes(search) && !charData.id.toLowerCase().includes(search)) {
                show = false;
            }
            
            card.style.display = show ? 'block' : 'none';
        });
    }

initSortable() {
    const activeContainer = document.getElementById('activeCharacters');
    let draggedElement = null;
    let draggedIndex = -1;
    
    // Make character cards draggable when they're rendered
    this.makeDraggable = () => {
        const cards = activeContainer.querySelectorAll('.character-card');
        cards.forEach((card, index) => {
            card.draggable = true;
            card.dataset.index = index;
            
            // Drag start
            card.addEventListener('dragstart', (e) => {
                draggedElement = card;
                draggedIndex = parseInt(card.dataset.index);
                card.classList.add('dragging');
                
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', card.outerHTML);
                
                this.updateStatus(`Dragging ${card.querySelector('.character-name').textContent}...`);
            });
            
            // Drag end
            card.addEventListener('dragend', (e) => {
                card.classList.remove('dragging');
                this.clearDragTargets();
            });
            
            // Drag over other cards
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (card !== draggedElement) {
                    card.classList.add('drag-target');
                }
            });
            
            // Drag leave
            card.addEventListener('dragleave', (e) => {
                card.classList.remove('drag-target');
            });
            
            // Drop on other cards
            card.addEventListener('drop', (e) => {
                e.preventDefault();
                
                if (card !== draggedElement) {
                    const dropIndex = parseInt(card.dataset.index);
                    this.reorderCharacters(draggedIndex, dropIndex);
                }
                
                this.clearDragTargets();
            });
        });
    };
    
    // Container drag events
    activeContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        activeContainer.classList.add('drag-over');
    });
    
    activeContainer.addEventListener('dragleave', (e) => {
        if (!activeContainer.contains(e.relatedTarget)) {
            activeContainer.classList.remove('drag-over');
        }
    });
    
    activeContainer.addEventListener('drop', (e) => {
        activeContainer.classList.remove('drag-over');
    });
}

clearDragTargets() {
    const targets = document.querySelectorAll('.drag-target');
    targets.forEach(target => target.classList.remove('drag-target'));
    
    const container = document.getElementById('activeCharacters');
    container.classList.remove('drag-over');
}

reorderCharacters(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    
    const fromChar = this.activeCharacters[fromIndex];
    const toChar = this.activeCharacters[toIndex];
    
    // Remove the dragged character from its original position
    this.activeCharacters.splice(fromIndex, 1);
    
    // Insert it at the new position
    this.activeCharacters.splice(toIndex, 0, fromChar);
    
    // Re-render the active characters
    this.renderActiveCharacters();
    
    this.updateStatus(`Moved ${this.formatCharacterName(fromChar)} to position ${toIndex + 1}! Don't forget to save.`);
}

async saveChangesToGame() {
    this.updateStatus('💾 Saving changes to game...');
    
    try {
        console.log('=== DEBUGGING SAVE PROCESS ===');
        console.log('Active characters to save:', this.activeCharacters);
        console.log('Original HTML length:', this.htmlContent.length);
        
        // Create the updated HTML content
        let updatedHtml = this.htmlContent;
        
        // 1. Update CHARACTER ROSTER INJECTION POINT
        console.log('Updating character roster...');
        updatedHtml = this.updateCharacterRoster(updatedHtml);
        console.log('After roster update, HTML length:', updatedHtml.length);
        
        // 2. Update CHARACTER SELECTION SWITCH INJECTION POINT
        console.log('Updating character selection switch...');
        updatedHtml = this.updateCharacterSelectionSwitch(updatedHtml);
        console.log('After selection switch update, HTML length:', updatedHtml.length);
        
        // 3. Update CREATE PLAYER SWITCH INJECTION POINT
        console.log('Updating create player switch...');
        updatedHtml = this.updateCreatePlayerSwitch(updatedHtml);
        console.log('After create player switch update, HTML length:', updatedHtml.length);
        
        // 4. Update CHARACTER SCRIPT LOADING INJECTION POINT
        console.log('Updating character scripts...');
        updatedHtml = this.updateCharacterScripts(updatedHtml);
        console.log('After script update, HTML length:', updatedHtml.length);
        
        // Check if anything actually changed
        if (updatedHtml === this.htmlContent) {
            console.warn('⚠️ No changes detected in HTML content!');
        } else {
            console.log('✅ HTML content has been modified');
        }
        
        // Save the updated HTML
        console.log('Attempting to write file...');
        await this.writeGameFile(updatedHtml);
        console.log('=== END SAVE DEBUGGING ===');
        
        this.updateStatus('✅ Changes saved successfully! Your game is updated.');
        
    } catch (error) {
        console.error('Error saving changes:', error);
        this.updateStatus(`❌ Error saving changes: ${error.message}`, 'error');
    }
}

async writeGameFile(content) {
    console.log('=== WRITE FILE DEBUG ===');
    console.log('Has file handle:', !!this.gameFileHandle);
    console.log('Has createWritable:', this.gameFileHandle && 'createWritable' in this.gameFileHandle);
    console.log('Content length to write:', content.length);
    
    try {
        if (this.gameFileHandle && 'createWritable' in this.gameFileHandle) {
            console.log('Attempting direct file write...');
            const writable = await this.gameFileHandle.createWritable();
            await writable.write(content);
            await writable.close();
            console.log('✅ Direct file write successful!');
        } else {
            console.log('Using download fallback...');
            this.downloadUpdatedFile(content);
        }
    } catch (error) {
        console.error('Error writing file:', error);
        console.log('Falling back to download...');
        this.downloadUpdatedFile(content);
    }
    console.log('=== END WRITE FILE DEBUG ===');
}

downloadUpdatedFile(content) {
    console.log('=== DOWNLOAD FILE DEBUG ===');
    console.log('Creating download for file of length:', content.length);
    
    // Create a download link for the updated HTML
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index_updated.html';
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    console.log('✅ Download initiated for index_updated.html');
    this.updateStatus('📥 Updated file downloaded! Replace your original index.html');
    console.log('=== END DOWNLOAD DEBUG ===');
}

updateCharacterRoster(html) {
    const newRoster = this.activeCharacters.map(id => `"${id}"`).join(', ');
    const newRosterSection = `// CHARACTER ROSTER INJECTION POINT - Package manager will modify this array
    ${newRoster}
    // END CHARACTER ROSTER INJECTION POINT`;
    
    // Replace the roster section
    const rosterPattern = /\/\/ CHARACTER ROSTER INJECTION POINT[\s\S]*?\/\/ END CHARACTER ROSTER INJECTION POINT/;
    
    if (html.match(rosterPattern)) {
        return html.replace(rosterPattern, newRosterSection);
    } else {
        this.updateStatus('⚠️ Character roster injection point not found!', 'error');
        return html;
    }
}

updateCreatePlayerSwitch(html) {
    // Generate switch cases for createPlayer
    const switchCases = this.activeCharacters.map(charId => 
        `    case "${charId}": player = ${this.getCharacterFunctionName(charId)}(); break;`
    ).join('\n');
    
    const newSwitchSection = `// CREATE PLAYER SWITCH INJECTION POINT - Package manager will add cases here
${switchCases}
    // END CREATE PLAYER SWITCH INJECTION POINT`;
    
    const switchPattern = /\/\/ CREATE PLAYER SWITCH INJECTION POINT[\s\S]*?\/\/ END CREATE PLAYER SWITCH INJECTION POINT/g;
    
    const matches = html.match(switchPattern);
    console.log('Found CREATE PLAYER SWITCH injection points:', matches ? matches.length : 0);
    
    if (matches && matches.length > 0) {
        const updatedHtml = html.replace(switchPattern, newSwitchSection);
        console.log('✅ Updated CREATE PLAYER SWITCH injection points');
        return updatedHtml;
    } else {
        this.updateStatus('⚠️ Create player switch injection point not found!', 'error');
        return html;
    }
}

updateCharacterSelectionSwitch(html) {
    // Generate switch cases for character selection
    const switchCases = this.activeCharacters.map(charId => 
        `    case "${charId}": charModel = ${this.getCharacterFunctionName(charId)}(); break;`
    ).join('\n');
    
    const newSwitchSection = `// CHARACTER SELECTION SWITCH INJECTION POINT - Package manager will add cases here
${switchCases}
    // END CHARACTER SELECTION SWITCH INJECTION POINT`;
    
    // Since you have multiple CHARACTER SELECTION SWITCH injection points, replace ALL of them
    const switchPattern = /\/\/ CHARACTER SELECTION SWITCH INJECTION POINT[\s\S]*?\/\/ END CHARACTER SELECTION SWITCH INJECTION POINT/g;
    
    const matches = html.match(switchPattern);
    console.log('Found CHARACTER SELECTION SWITCH injection points:', matches ? matches.length : 0);
    
    if (matches && matches.length > 0) {
        // Replace all instances
        const updatedHtml = html.replace(switchPattern, newSwitchSection);
        console.log('✅ Updated CHARACTER SELECTION SWITCH injection points');
        return updatedHtml;
    } else {
        this.updateStatus('⚠️ Character selection switch injection point not found!', 'error');
        return html;
    }
}

updateCreatePlayerSwitch(html) {
    // Generate switch cases for createPlayer
    const switchCases = this.activeCharacters.map(charId => 
        `    case "${charId}": player = ${this.getCharacterFunctionName(charId)}(); break;`
    ).join('\n');
    
    const newSwitchSection = `// CREATE PLAYER SWITCH INJECTION POINT - Package manager will add cases here
${switchCases}
    // END CREATE PLAYER SWITCH INJECTION POINT`;
    
    const switchPattern = /\/\/ CREATE PLAYER SWITCH INJECTION POINT[\s\S]*?\/\/ END CREATE PLAYER SWITCH INJECTION POINT/;
    
    if (html.match(switchPattern)) {
        return html.replace(switchPattern, newSwitchSection);
    } else {
        this.updateStatus('⚠️ Create player switch injection point not found!', 'error');
        return html;
    }
}

updateCharacterScripts(html) {
    // Generate script tags for active characters
    const scriptTags = this.activeCharacters.map(charId => 
        `    <script src="characters/installed/${charId}.js"></script>`
    ).join('\n');
    
    const newScriptSection = `<!-- CHARACTER INJECTION POINT - Additional characters will be loaded here -->
${scriptTags}
    <!-- END CHARACTER INJECTION POINT -->`;
    
    const scriptPattern = /<!-- CHARACTER INJECTION POINT[\s\S]*?<!-- END CHARACTER INJECTION POINT -->/;
    
    if (html.match(scriptPattern)) {
        return html.replace(scriptPattern, newScriptSection);
    } else {
        this.updateStatus('⚠️ Character script injection point not found!', 'error');
        return html;
    }
}

getCharacterFunctionName(charId) {
    // Map character IDs to their exact function names based on your HTML
    const functionNames = {
        'happyface': 'createHappyFaceCharacter',
        'ghost': 'createGhostCharacter',
        'robot': 'createRobotCharacter', 
        'dragon': 'createDragonCharacter',
        'ufo': 'createUFOCharacter',  // Using the uppercase version
        'atom': 'createAtomCharacter',
        'slime': 'createSlimeCharacter',
        'apple': 'createAppleCharacter',
        'carrot': 'createCarrotCharacter',
        'pumpkin': 'createPumpkinCharacter',
        'monster': 'createMonsterCharacter',
        'creature': 'createCreatureCharacter'
    };
    
    return functionNames[charId] || `create${charId.charAt(0).toUpperCase() + charId.slice(1)}Character`;
}

downloadUpdatedFile(content) {
    // Create a download link for the updated HTML
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index_updated.html';
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    this.updateStatus('📥 Updated file downloaded! Replace your original index.html');
}

    async refreshAll() {
        this.updateStatus('🔄 Refreshing data...');
        await this.loadGameData();
        await this.scanAvailableCharacters();
        this.renderActiveCharacters();
        this.renderAvailableCharacters();
        this.renderStats();
        this.updateStatus('Data refreshed!');
    }

    updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = type;
        
        // Auto-clear status after 5 seconds
        setTimeout(() => {
            if (statusElement.textContent === message) {
                statusElement.textContent = 'Ready';
                statusElement.className = '';
            }
        }, 5000);
    }

    updateCharacterCount() {
        const countElement = document.getElementById('characterCount');
        countElement.textContent = `Active: ${this.activeCharacters.length} | Available: ${this.availableCharacters.length}`;
    }

    // Add file selection button to the interface
createFileSelectionUI() {
    const headerActions = document.querySelector('.header-actions');
    
    const selectFileBtn = document.createElement('button');
    selectFileBtn.className = 'btn-secondary';
    selectFileBtn.innerHTML = '📁 Select Game File';
    selectFileBtn.onclick = () => this.loadGameData();
    
    const scanCharsBtn = document.createElement('button');
    scanCharsBtn.className = 'btn-fun';
    scanCharsBtn.innerHTML = '🔍 Scan Characters';
    scanCharsBtn.onclick = () => this.rescanCharacters();
    
    // Insert before the refresh button
    headerActions.insertBefore(selectFileBtn, document.getElementById('refreshData'));
    headerActions.insertBefore(scanCharsBtn, document.getElementById('refreshData'));
}


renderDeactivatedCharacters() {
    const allOriginalCharacters = ["happyface", "ghost", "robot", "dragon", "ufo", "atom", "slime", "apple", "carrot", "pumpkin", "monster", "creature"];
    const deactivatedCharacters = allOriginalCharacters.filter(charId => !this.activeCharacters.includes(charId));
    
    const deactivatedSection = document.getElementById('deactivatedSection');
    const container = document.getElementById('deactivatedCharacters');
    
    if (deactivatedCharacters.length === 0) {
        deactivatedSection.style.display = 'none';
        return;
    }
    
    deactivatedSection.style.display = 'block';
    container.innerHTML = '';
    
    deactivatedCharacters.forEach(charId => {
        const charData = this.getCharacterData(charId);
        const card = this.createDeactivatedCharacterCard(charData);
        
        container.appendChild(card);
    });
}

reactivateCharacter(charId) {
    const charData = this.getCharacterData(charId);
    this.updateStatus(`Reactivating ${charData.name}...`);
    
    // Add back to active characters
    this.activeCharacters.push(charId);
    
    // Re-render everything
    this.renderActiveCharacters();
    this.renderDeactivatedCharacters();
    
    this.updateStatus(`${charData.name} reactivated! Don't forget to save changes.`);
}

createDeactivatedCharacterCard(charData) {
    const card = document.createElement('div');
    card.className = 'character-card deactivated';
    card.dataset.characterId = charData.id;
    
    const emoji = charData.emoji || this.getCharacterEmoji(charData.id);
    const name = charData.name || this.formatCharacterName(charData.id);
    const category = charData.category || 'misc';
    
    card.innerHTML = `
        <div class="character-emoji">${emoji}</div>
        <div class="character-name">${name}</div>
        <div class="character-category">${category}</div>
    `;
    
    // Only add single-click for preview and double-click for reactivation
    card.addEventListener('click', () => this.showCharacterPreview(charData));
    card.addEventListener('dblclick', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        this.reactivateCharacter(charData.id);
    });
    
    return card;
}

async scanCharacterFiles() {
    this.updateStatus('🔍 Scanning for character files...');
    
    try {
        // Scan the characters/available/ directory for character files
        const availableChars = await this.scanDirectory('characters/available/');
        
        // Scan the characters/installed/ directory to see what's actually installed
        const installedChars = await this.scanDirectory('characters/installed/');
        
        // Parse each character file to extract metadata
        const scannedCharacters = [];
        
        for (const charFile of availableChars) {
            try {
                const charData = await this.parseCharacterFile(charFile);
                if (charData) {
                    charData.installed = installedChars.some(installed => 
                        installed.name === charFile.name
                    );
                    scannedCharacters.push(charData);
                }
            } catch (error) {
                console.warn(`Could not parse character file: ${charFile.name}`, error);
            }
        }
        
        // Update available characters with scanned data
        this.availableCharacters = scannedCharacters;
        
        this.updateStatus(`✅ Found ${scannedCharacters.length} available characters!`);
        
    } catch (error) {
        console.error('Error scanning character files:', error);
        // Fallback to hardcoded characters if scanning fails
        await this.loadHardcodedCharacters();
        this.updateStatus('⚠️ Using fallback character list - file scanning not available');
    }
}

async scanDirectory(directoryPath) {
    // Check if File System Access API is available
    if ('showDirectoryPicker' in window) {
        return await this.scanDirectoryWithAPI(directoryPath);
    } else {
        // Fallback: Use file input for multiple files
        return await this.scanDirectoryWithInput(directoryPath);
    }
}

async scanDirectoryWithAPI(directoryPath) {
    try {
        // Show directory picker for the characters folder
        const dirHandle = await window.showDirectoryPicker({
            id: 'character-scanner',
            mode: 'read'
        });
        
        const files = [];
        
        // Look for .js files in the directory
        for await (const [name, handle] of dirHandle.entries()) {
            if (handle.kind === 'file' && name.endsWith('.js')) {
                const file = await handle.getFile();
                files.push({
                    name: name,
                    handle: handle,
                    file: file,
                    content: await file.text()
                });
            }
        }
        
        return files;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Directory selection cancelled');
        }
        throw error;
    }
}

async scanDirectoryWithInput(directoryPath) {
    return new Promise((resolve, reject) => {
        // Create a file input that accepts multiple .js files
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.js';
        input.multiple = true;
        input.webkitdirectory = false; // We'll ask for individual files as fallback
        input.style.display = 'none';
        
        // Create a custom dialog
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 500px;">
                    <h3>📁 Select Character Files</h3>
                    <p>Please select all .js character files from your characters/available/ folder</p>
                    <button id="selectFiles" style="background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 8px; margin: 10px; cursor: pointer;">Select Files</button>
                    <button id="cancelScan" style="background: #f44336; color: white; border: none; padding: 12px 24px; border-radius: 8px; margin: 10px; cursor: pointer;">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('#selectFiles').onclick = () => {
            input.click();
        };
        
        dialog.querySelector('#cancelScan').onclick = () => {
            document.body.removeChild(dialog);
            reject(new Error('File selection cancelled'));
        };
        
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            const processedFiles = [];
            
            for (const file of files) {
                if (file.name.endsWith('.js')) {
                    processedFiles.push({
                        name: file.name,
                        file: file,
                        content: await file.text()
                    });
                }
            }
            
            document.body.removeChild(dialog);
            document.body.removeChild(input);
            resolve(processedFiles);
        };
        
        document.body.appendChild(input);
    });
}

async parseCharacterFile(fileData) {
    try {
        // Extract character metadata from the JavaScript file
        const content = fileData.content;
        
        // Look for characterData object or similar patterns
        const metadataPatterns = [
            /const\s+characterData\s*=\s*({[\s\S]*?});/,
            /let\s+characterData\s*=\s*({[\s\S]*?});/,
            /var\s+characterData\s*=\s*({[\s\S]*?});/,
            /export\s+const\s+characterData\s*=\s*({[\s\S]*?});/
        ];
        
        let metadata = null;
        
        for (const pattern of metadataPatterns) {
            const match = content.match(pattern);
            if (match) {
                try {
                    // Safely evaluate the metadata object
                    metadata = this.safeEvalMetadata(match[1]);
                    break;
                } catch (error) {
                    console.warn('Could not parse metadata from', fileData.name, error);
                }
            }
        }
        
        // If no metadata found, create basic info from filename
        if (!metadata) {
            const baseName = fileData.name.replace('.js', '');
            metadata = {
                id: baseName,
                name: this.formatCharacterName(baseName),
                description: `${this.formatCharacterName(baseName)} character`,
                category: 'misc',
                abilities: ['Special Move']
            };
        }
        
        // Ensure required fields
        metadata.id = metadata.id || fileData.name.replace('.js', '');
        metadata.name = metadata.name || this.formatCharacterName(metadata.id);
        metadata.emoji = metadata.emoji || this.generateEmojiForCharacter(metadata);
        metadata.category = metadata.category || 'misc';
        metadata.installed = false;
        
        return metadata;
        
    } catch (error) {
        console.error('Error parsing character file:', fileData.name, error);
        return null;
    }
}

safeEvalMetadata(metadataString) {
    // Create a safe evaluation context
    // This is a simplified parser - in production you'd want a proper JS parser
    try {
        // Remove comments and clean up the string
        const cleaned = metadataString
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/\/\/.*$/gm, '') // Remove line comments
            .trim();
        
        // Use Function constructor for safer evaluation than eval()
        const func = new Function('return ' + cleaned);
        return func();
    } catch (error) {
        // Fallback: try to extract basic info with regex
        const id = this.extractStringValue(metadataString, 'id');
        const name = this.extractStringValue(metadataString, 'name');
        const description = this.extractStringValue(metadataString, 'description');
        
        return {
            id: id || 'unknown',
            name: name || 'Unknown Character',
            description: description || 'A mysterious character'
        };
    }
}

extractStringValue(text, key) {
    const pattern = new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`);
    const match = text.match(pattern);
    return match ? match[1] : null;
}

generateEmojiForCharacter(metadata) {
    // Generate emoji based on character attributes
    const name = (metadata.name || '').toLowerCase();
    const category = (metadata.category || '').toLowerCase();
    
    // Category-based emojis
    const categoryEmojis = {
        'cute': ['😊', '🥰', '😍', '🤗', '😌'],
        'scary': ['👻', '👾', '🎃', '💀', '👹'],
        'scifi': ['🤖', '🛸', '⚛️', '🔬', '🚀'],
        'nature': ['🍎', '🥕', '🌱', '🍃', '🌸'],
        'magic': ['🧙‍♂️', '🔮', '✨', '🎭', '🌟'],
        'action': ['🥷', '⚔️', '🏹', '💥', '⚡'],
        'adventure': ['🏴‍☠️', '🗺️', '🧭', '⛵', '🏝️']
    };
    
    // Name-based emojis
    const nameEmojis = {
        'ninja': '🥷', 'wizard': '🧙‍♂️', 'alien': '👽', 'pirate': '🏴‍☠️',
        'knight': '⚔️', 'robot': '🤖', 'ghost': '👻', 'dragon': '🐉'
    };
    
    // Check name first
    for (const [keyword, emoji] of Object.entries(nameEmojis)) {
        if (name.includes(keyword)) {
            return emoji;
        }
    }
    
    // Check category
    if (categoryEmojis[category]) {
        const emojis = categoryEmojis[category];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }
    
    // Default random emoji
    const defaultEmojis = ['🎮', '⭐', '🎯', '🎪', '🎨', '🎭'];
    return defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)];
}

async loadHardcodedCharacters() {
    // Fallback to the original hardcoded character list
    this.availableCharacters = [
        {
            id: 'ninja', name: 'Ninja', emoji: '🥷', category: 'action',
            description: 'Swift and stealthy warrior', abilities: ['Double Jump', 'Shadow Dash'], installed: false
        },
        {
            id: 'wizard', name: 'Wizard', emoji: '🧙‍♂️', category: 'magic',
            description: 'Master of arcane magic', abilities: ['Teleport', 'Magic Shield'], installed: false
        },
        {
            id: 'alien', name: 'Alien', emoji: '👽', category: 'scifi',
            description: 'Visitor from outer space', abilities: ['Anti-Gravity', 'Energy Beam'], installed: false
        },
        {
            id: 'pirate', name: 'Pirate', emoji: '🏴‍☠️', category: 'adventure',
            description: 'Seafaring treasure hunter', abilities: ['Hook Swing', 'Cannon Blast'], installed: false
        },
        {
            id: 'knight', name: 'Knight', emoji: '⚔️', category: 'medieval',
            description: 'Noble armored warrior', abilities: ['Shield Block', 'Sword Slash'], installed: false
        }
    ];
}

async rescanCharacters() {
    await this.scanAvailableCharacters();
    this.renderAvailableCharacters();
}

init3DPreview() {
    // Create 3D preview scene
    this.previewScene = new THREE.Scene();
    this.previewCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.previewRenderer = null;
    this.previewCharacterModel = null;
    this.animationId = null;
    
    // For MAXIMUM size - get really close and look at the lowered character!
this.previewCamera.position.set(0.9, 0.9, 0.9);
this.previewCamera.lookAt(0, -0.5, 0);
        
    // Add lighting to the preview scene
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.previewScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.previewScene.add(directionalLight);
    
    // Add a subtle background
    this.previewScene.background = new THREE.Color(0x87CEEB);
}

create3DCanvas() {
    // Create canvas element with larger size
    const canvas = document.createElement('canvas');
    canvas.className = 'preview-3d-canvas';
    canvas.width = 400;
    canvas.height = 400;
    
    // Dispose of old renderer if it exists
    if (this.previewRenderer) {
        this.previewRenderer.dispose();
        console.log('🗑️ Old renderer disposed');
    }
    
    // Create new renderer with larger size
    this.previewRenderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    this.previewRenderer.setSize(400, 400);
    this.previewRenderer.shadowMap.enabled = true;
    this.previewRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    console.log('✅ New larger renderer created (400x400)');
    
    return canvas;
}

async load3DCharacterPreview(charData) {
    console.log('🔄 load3DCharacterPreview START with:', charData.id);
    
    if (!this.previewRenderer) {
        console.log('⚠️ No renderer, initializing 3D preview...');
        this.init3DPreview();
    }
    
    try {
        // Remove existing character model
        if (this.previewCharacterModel) {
            console.log('🗑️ Removing existing character model');
            this.previewScene.remove(this.previewCharacterModel);
        }
        
        // Stop existing animation
        if (this.animationId) {
            console.log('⏹️ Stopping existing animation');
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        console.log(`📥 Loading script for ${charData.id}...`);
        
        // Load character script if needed
        await this.loadCharacterScript(charData.id);
        
        console.log('⏳ Waiting for script to fully load...');
        // Wait a moment for script to fully load
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Check if function exists after loading
        const functionName = this.getCharacterFunctionName(charData.id);
        const characterFunction = window[functionName];
        
        console.log(`🔍 Looking for function: ${functionName}`);
        console.log(`✅ Function exists: ${typeof characterFunction === 'function'}`);
        
        if (typeof characterFunction === 'function') {
            // Create the character model
            console.log(`🏗️ Creating character model for ${charData.id}...`);
            this.previewCharacterModel = characterFunction();
            console.log('📦 Character model created:', this.previewCharacterModel);
            
            this.previewScene.add(this.previewCharacterModel);
console.log('➕ Character added to scene');

// Position the character lower for better centering in the frame
this.previewCharacterModel.position.set(0, -0.5, 0);
console.log('📍 Character positioned for optimal viewing');

console.log('👀 Scene children after adding:', this.previewScene.children.length);
            
            // Start rotation animation
            console.log('🎬 Starting animation...');
            this.animate3DPreview();
            
            // Force an immediate render
            console.log('🖼️ Forcing immediate render...');
            this.previewRenderer.render(this.previewScene, this.previewCamera);
            
            console.log(`✅ Completed 3D preview for ${charData.name}`);
        } else {
            console.error(`❌ Character function not found: ${functionName}`);
            this.show3DPreviewError(`Character model not available`);
        }
        
    } catch (error) {
        console.error('💥 Error in load3DCharacterPreview:', error);
        this.show3DPreviewError(`Error loading ${charData.name}: ${error.message}`);
    }
    
    console.log('🏁 load3DCharacterPreview END');
}

animate3DPreview() {
    if (!this.previewRenderer || !this.previewCharacterModel) return;
    
    // Rotate the character
    this.previewCharacterModel.rotation.y += 0.01;
    
    // Render the scene
    this.previewRenderer.render(this.previewScene, this.previewCamera);
    
    // Continue animation
    this.animationId = requestAnimationFrame(() => this.animate3DPreview());
}

show3DPreviewError(message) {
    const previewArea = document.getElementById('previewArea');
    previewArea.innerHTML = `
        <div class="preview-placeholder">
            <div style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
            <div>${message}</div>
        </div>
    `;
}



async loadCharacterScript(charId) {
    return new Promise((resolve, reject) => {
        const functionName = this.getCharacterFunctionName(charId);
        
        // Check if already loaded
        if (window[functionName.replace('create', '').replace('Character', '')] || window[functionName]) {
            console.log(`✅ ${functionName} already loaded`);
            resolve();
            return;
        }
        
        console.log(`Loading script for ${charId}...`);
        
        // Create script tag
        const script = document.createElement('script');
        script.src = `../characters/installed/${charId}.js`;
        script.onload = () => {
            console.log(`✅ Script loaded: ${script.src}`);
            // Wait a brief moment for the script to execute
            setTimeout(() => {
                console.log(`Function available: ${typeof window[functionName] === 'function'}`);
                resolve();
            }, 100);
        };
        script.onerror = (error) => {
            console.error(`❌ Failed to load script: ${script.src}`, error);
            reject(error);
        };
        
        document.head.appendChild(script);
    });
}

}

// Initialize the Character Package Manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.characterManager = new CharacterPackageManager();
});