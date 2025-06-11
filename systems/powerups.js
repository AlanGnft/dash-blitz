// ==================== POWER-UP SYSTEM ====================
// Power-up spawning, collection, and effects management
// Dependencies: Game Loop, Audio System, Player Controls
// Functions: spawnPowerUp(), collectPowerUp(), handlePowerUp(), etc.

// Make power-up functions globally accessible
window.PowerUpSystem = {
    spawnShieldPowerUpInLane,
    spawnCoinMultiplierPowerUpInLane,
    spawnMagnetPowerUpInLane,
    activatePowerUp,
    updatePowerUpStatusBar,
    initializePowerUpStatusBar,
    initializeAbilityStatusBar,
    updateAbilityStatusBar,
    createShieldEffect,
    createSparkle,
    updateSparkles
};

// Create Shield Power-up - blue glowing orb
function spawnShieldPowerUpInLane(availableLanes) {
    const laneIndex = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    const shieldGroup = new THREE.Group();
    
    // Main orb
    const orbGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const orbMaterial = new THREE.MeshStandardMaterial({
        color: 0x00AAFF,
        transparent: true,
        opacity: 0.8,
        emissive: 0x0088DD,
        emissiveIntensity: 0.6,
        metalness: 0.3,
        roughness: 0.2
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    shieldGroup.add(orb);
    
    // Outer glow ring
    const ringGeometry = new THREE.TorusGeometry(0.35, 0.05, 8, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x44CCFF,
        transparent: true,
        opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    shieldGroup.add(ring);
    
    // Add floating particles around the orb
    for (let i = 0; i < 8; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0x88DDFF,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        const angle = (i / 8) * Math.PI * 2;
        particle.position.set(
            Math.cos(angle) * 0.4,
            Math.sin(angle) * 0.4,
            0
        );
        
        particle.userData = {
            orbitSpeed: 0.05 + Math.random() * 0.03,
            orbitRadius: 0.4 + Math.random() * 0.1,
            orbitAngle: angle
        };
        
        shieldGroup.add(particle);
    }
    
    // Position and add to scene
    shieldGroup.position.x = lanes[laneIndex];
    shieldGroup.position.y = 1.2;
    shieldGroup.position.z = -50;
    
    // Mark as shield power-up
    shieldGroup.userData.type = 'shield';
    shieldGroup.userData.particles = shieldGroup.children.slice(2); // Store particles for animation
    
    scene.add(shieldGroup);
    powerUps.push(shieldGroup);
}

// Create Coin Multiplier Power-up - mini coin with x2
function spawnCoinMultiplierPowerUpInLane(availableLanes) {
    const laneIndex = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    const multiplierGroup = new THREE.Group();
    
    // Mini coin base (smaller version of regular coin)
    const coinGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.03, 24);
    const coinMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        metalness: 1.0,
        roughness: 0.1,
        emissive: 0xFFAA00,
        emissiveIntensity: 0.4
    });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.rotation.x = Math.PI / 2;
    multiplierGroup.add(coin);
    
    // Edge of mini coin
    const edgeGeometry = new THREE.TorusGeometry(0.2, 0.02, 8, 24);
    const edgeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFCC00,
        metalness: 1.0,
        roughness: 0.2
    });
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.rotation.x = Math.PI / 2;
    multiplierGroup.add(edge);
    
    // Create "x2" text using simple geometry
    const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF6600,
        emissive: 0xFF4400,
        emissiveIntensity: 0.8,
        metalness: 1.0,
        roughness: 0.1
    });
    
    // "x" symbol using crossed boxes
    const crossGeometry1 = new THREE.BoxGeometry(0.15, 0.03, 0.01);
    const cross1 = new THREE.Mesh(crossGeometry1, textMaterial);
    cross1.rotation.z = Math.PI / 4;
    cross1.position.set(-0.08, 0, 0.02);
    multiplierGroup.add(cross1);
    
    const cross2 = new THREE.Mesh(crossGeometry1, textMaterial);
    cross2.rotation.z = -Math.PI / 4;
    cross2.position.set(-0.08, 0, 0.02);
    multiplierGroup.add(cross2);
    
    // "2" symbol using boxes
    const twoGeometry = new THREE.BoxGeometry(0.08, 0.03, 0.01);
    
    // Top horizontal line
    const twoTop = new THREE.Mesh(twoGeometry, textMaterial);
    twoTop.position.set(0.06, 0.06, 0.02);
    multiplierGroup.add(twoTop);
    
    // Middle horizontal line
    const twoMiddle = new THREE.Mesh(twoGeometry, textMaterial);
    twoMiddle.position.set(0.06, 0, 0.02);
    multiplierGroup.add(twoMiddle);
    
    // Bottom horizontal line
    const twoBottom = new THREE.Mesh(twoGeometry, textMaterial);
    twoBottom.position.set(0.06, -0.06, 0.02);
    multiplierGroup.add(twoBottom);
    
    // Right vertical line (top)
    const twoVertical1 = new THREE.BoxGeometry(0.03, 0.06, 0.01);
    const twoRight1 = new THREE.Mesh(twoVertical1, textMaterial);
    twoRight1.position.set(0.08, 0.03, 0.02);
    multiplierGroup.add(twoRight1);
    
    // Left vertical line (bottom)
    const twoLeft = new THREE.Mesh(twoVertical1, textMaterial);
    twoLeft.position.set(0.04, -0.03, 0.02);
    multiplierGroup.add(twoLeft);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFDD00,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    multiplierGroup.add(glow);
    
    // Position and add to scene
    multiplierGroup.position.x = lanes[laneIndex];
    multiplierGroup.position.y = 1.2;
    multiplierGroup.position.z = -50;
    
    // Mark as coin multiplier power-up
    multiplierGroup.userData.type = 'coinMultiplier';
    multiplierGroup.userData.rotationSpeed = 0.03;
    
    scene.add(multiplierGroup);
    powerUps.push(multiplierGroup);
}

// Create Magnet Power-up - classic horseshoe magnet
function spawnMagnetPowerUpInLane(availableLanes) {
    const laneIndex = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    const magnetGroup = new THREE.Group();
    
    // Create a classic horseshoe magnet using simple shapes
    // Main magnet body - U shape using cylinders
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xC0C0C0, // Silver
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x666666,
        emissiveIntensity: 0.2
    });

    // Curved bottom part
    const curveGeometry = new THREE.TorusGeometry(0.2, 0.06, 8, 16, Math.PI);
    const curveBody = new THREE.Mesh(curveGeometry, bodyMaterial);
    curveBody.rotation.z = Math.PI;
    magnetGroup.add(curveBody);

    // Left arm
    const leftArmGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12);
    const leftArm = new THREE.Mesh(leftArmGeometry, bodyMaterial);
    leftArm.position.set(-0.2, 0.125, 0);
    magnetGroup.add(leftArm);

    // Right arm
    const rightArmGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12);
    const rightArm = new THREE.Mesh(rightArmGeometry, bodyMaterial);
    rightArm.position.set(0.2, 0.125, 0);
    magnetGroup.add(rightArm);

    // North pole (red) - larger and more visible
    const northPoleGeometry = new THREE.BoxGeometry(0.15, 0.12, 0.15);
    const northPoleMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF4444,
        emissive: 0xFF2222,
        emissiveIntensity: 0.6,
        metalness: 0.7,
        roughness: 0.3
    });
    const northPole = new THREE.Mesh(northPoleGeometry, northPoleMaterial);
    northPole.position.set(-0.2, 0.21, 0);
    magnetGroup.add(northPole);

    // South pole (blue) - larger and more visible
    const southPoleGeometry = new THREE.BoxGeometry(0.15, 0.12, 0.15);
    const southPoleMaterial = new THREE.MeshStandardMaterial({
        color: 0x4444FF,
        emissive: 0x2222FF,
        emissiveIntensity: 0.6,
        metalness: 0.7,
        roughness: 0.3
    });
    const southPole = new THREE.Mesh(southPoleGeometry, southPoleMaterial);
    southPole.position.set(0.2, 0.21, 0);
    magnetGroup.add(southPole);
    
    // Add "N" and "S" labels using simple geometry
    const labelMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.8
    });
    
    // "N" label - simple lines
    const nGeometry = new THREE.BoxGeometry(0.04, 0.08, 0.01);
    const nLeft = new THREE.Mesh(nGeometry, labelMaterial);
    nLeft.position.set(-0.28, 0, 0.05);
    magnetGroup.add(nLeft);
    
    const nRight = new THREE.Mesh(nGeometry, labelMaterial);
    nRight.position.set(-0.22, 0, 0.05);
    magnetGroup.add(nRight);
    
    const nDiagonal = new THREE.Mesh(nGeometry, labelMaterial);
    nDiagonal.rotation.z = Math.PI / 4;
    nDiagonal.position.set(-0.25, 0, 0.05);
    magnetGroup.add(nDiagonal);
    
    // "S" label - curved using multiple small boxes
    const sGeometry = new THREE.BoxGeometry(0.06, 0.02, 0.01);
    const sTop = new THREE.Mesh(sGeometry, labelMaterial);
    sTop.position.set(0.25, 0.03, 0.05);
    magnetGroup.add(sTop);
    
    const sMiddle = new THREE.Mesh(sGeometry, labelMaterial);
    sMiddle.position.set(0.25, 0, 0.05);
    magnetGroup.add(sMiddle);
    
    const sBottom = new THREE.Mesh(sGeometry, labelMaterial);
    sBottom.position.set(0.25, -0.03, 0.05);
    magnetGroup.add(sBottom);
    
    // Add magnetic field effect particles
    for (let i = 0; i < 12; i++) {
        const fieldGeometry = new THREE.SphereGeometry(0.02, 6, 6);
        const fieldMaterial = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0xFF6666 : 0x6666FF,
            transparent: true,
            opacity: 0.6
        });
        const fieldParticle = new THREE.Mesh(fieldGeometry, fieldMaterial);
        
        const angle = (i / 12) * Math.PI * 2;
        fieldParticle.position.set(
            Math.cos(angle) * 0.4,
            Math.sin(angle) * 0.4,
            0
        );
        
        fieldParticle.userData = {
            orbitSpeed: 0.08 + Math.random() * 0.04,
            orbitRadius: 0.4 + Math.random() * 0.1,
            orbitAngle: angle
        };
        
        magnetGroup.add(fieldParticle);
    }
    
    // Position and add to scene
    magnetGroup.position.x = lanes[laneIndex];
    magnetGroup.position.y = 1.2;
    magnetGroup.position.z = -50;
    
    // Mark as magnet power-up
    magnetGroup.userData.type = 'magnet';
    magnetGroup.userData.fieldParticles = magnetGroup.children.slice(8); // Store field particles for animation
    
    scene.add(magnetGroup);
    powerUps.push(magnetGroup);
    debug('Magnet power-up created and added to scene at position:', magnetGroup.position);
}

// Activate power-up effects
function activatePowerUp(type) {
    window.AudioSystem.playPowerUpSound()
    switch (type) {
        case 'shield':
            shieldActive = true;
            powerUpTimers.shield = 600; // 10 seconds at 60fps
            createShieldEffect();
            debug('Shield activated for 10 seconds!');
            break;
            
        case 'coinMultiplier':
            coinMultiplierActive = true;
            powerUpTimers.coinMultiplier = 600; // 10 seconds at 60fps
            debug('Coin multiplier activated for 10 seconds! Coins worth 2x!');
            break;
            
        case 'magnet':
            magnetActive = true;
            powerUpTimers.magnet = 600; // 10 seconds at 60fps
            debug('Magnet activated for 10 seconds! Coins will be attracted!');
            break;
    }
}

// Update power-up status bar
function updatePowerUpStatusBar() {
    // Shield status
    const shieldIcon = document.getElementById('shieldIcon');
    const shieldFill = shieldIcon.querySelector('.powerup-fill');
    
    if (shieldActive) {
        shieldIcon.classList.remove('inactive');
        shieldIcon.classList.add('active');
        const progress = (powerUpTimers.shield / 600) * 100; // 600 = 10 seconds
        shieldFill.style.height = `${progress}%`;
    } else {
        shieldIcon.classList.remove('active');
        shieldIcon.classList.add('inactive');
        shieldFill.style.height = '0%';
    }
    
    // Coin Multiplier status
    const multiplierIcon = document.getElementById('multiplierIcon');
    const multiplierFill = multiplierIcon.querySelector('.powerup-fill');
    
    if (coinMultiplierActive) {
        multiplierIcon.classList.remove('inactive');
        multiplierIcon.classList.add('active');
        const progress = (powerUpTimers.coinMultiplier / 600) * 100;
        multiplierFill.style.height = `${progress}%`;
    } else {
        multiplierIcon.classList.remove('active');
        multiplierIcon.classList.add('inactive');
        multiplierFill.style.height = '0%';
    }
    
    // Magnet status
    const magnetIcon = document.getElementById('magnetIcon');
    const magnetFill = magnetIcon.querySelector('.powerup-fill');
    
    if (magnetActive) {
        magnetIcon.classList.remove('inactive');
        magnetIcon.classList.add('active');
        const progress = (powerUpTimers.magnet / 600) * 100;
        magnetFill.style.height = `${progress}%`;
    } else {
        magnetIcon.classList.remove('active');
        magnetIcon.classList.add('inactive');
        magnetFill.style.height = '0%';
    }
}

// Initialize status bar
function initializePowerUpStatusBar() {
    document.getElementById('shieldIcon').classList.add('inactive');
    document.getElementById('multiplierIcon').classList.add('inactive');
    document.getElementById('magnetIcon').classList.add('inactive');
}

// Initialize character ability status bar
function initializeAbilityStatusBar() {
    const abilityIcon = document.getElementById('characterAbilityIcon');
    const abilitySymbol = abilityIcon.querySelector('.ability-symbol');
    
    // Show/hide based on character
    if (currentCharacter === 'robot' || currentCharacter === 'dragon' || currentCharacter === 'ghost') {
        abilityIcon.style.display = 'flex';
        
        // Set icon based on character
        if (currentCharacter === 'robot') {
            abilitySymbol.textContent = '🤖';
        } else if (currentCharacter === 'dragon') {
            abilitySymbol.textContent = '🔥';
        } else if (currentCharacter === 'ghost') {
            abilitySymbol.textContent = '👻';
        }
        
        // Start in ready state
        abilityIcon.classList.add('ready');
        abilityIcon.classList.remove('cooldown');
        abilityIcon.querySelector('.ability-fill').style.height = '0%';
    } else {
        abilityIcon.style.display = 'none';
    }
}

// Update character ability status bar
function updateAbilityStatusBar() {
    const abilityIcon = document.getElementById('characterAbilityIcon');
    const abilityFill = abilityIcon.querySelector('.ability-fill');
    
    if (currentCharacter === 'robot') {
        if (robotShieldActive) {
            // Shield is active - show as used
            abilityIcon.classList.remove('ready');
            abilityIcon.classList.add('cooldown');
            abilityFill.style.height = '0%';
        } else if (robotShieldCooldown > 0) {
            // On cooldown - show fill progress
            abilityIcon.classList.remove('ready');
            abilityIcon.classList.add('cooldown');
            const progress = ((600 - robotShieldCooldown) / 600) * 100;
            abilityFill.style.height = `${progress}%`;
        } else {
            // Ready to use
            abilityIcon.classList.add('ready');
            abilityIcon.classList.remove('cooldown');
            abilityFill.style.height = '0%';
        }
    } else if (currentCharacter === 'dragon') {
        if (dragonFireActive) {
            // Fire is active - show as used
            abilityIcon.classList.remove('ready');
            abilityIcon.classList.add('cooldown');
            abilityFill.style.height = '0%';
        } else if (dragonFireCooldown > 0) {
            // On cooldown - show fill progress
            abilityIcon.classList.remove('ready');
            abilityIcon.classList.add('cooldown');
            const progress = ((240 - dragonFireCooldown) / 240) * 100;
            abilityFill.style.height = `${progress}%`;
        } else {
            // Ready to use
            abilityIcon.classList.add('ready');
            abilityIcon.classList.remove('cooldown');
            abilityFill.style.height = '0%';
        }
    } else if (currentCharacter === 'ghost') {
        if (ghostPhaseActive) {
            // Phase is active - show as used
            abilityIcon.classList.remove('ready');
            abilityIcon.classList.add('cooldown');
            abilityFill.style.height = '0%';
        } else if (ghostPhaseCharges < 3) {
            // Charges restoring - show fill progress
            abilityIcon.classList.remove('ready');
            abilityIcon.classList.add('cooldown');
            const progress = ((300 - ghostPhaseCooldown) / 300) * 100;
            abilityFill.style.height = `${progress}%`;
        } else {
            // Ready to use (has charges)
            abilityIcon.classList.add('ready');
            abilityIcon.classList.remove('cooldown');
            abilityFill.style.height = '0%';
        }
    }
}

// Create shield visual effect around player
function createShieldEffect() {
    // Remove existing shield if any
    if (player.userData.shieldEffect) {
        player.remove(player.userData.shieldEffect);
    }
    
    // Create shield bubble
    const shieldGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const shieldMaterial = new THREE.MeshStandardMaterial({
        color: 0x00AAFF,
        transparent: true,
        opacity: 0.3,
        emissive: 0x0088DD,
        emissiveIntensity: 0.4,
        side: THREE.DoubleSide
    });
    
    const shieldBubble = new THREE.Mesh(shieldGeometry, shieldMaterial);
    player.add(shieldBubble);
    player.userData.shieldEffect = shieldBubble;
}

// Create sparkle effect when collecting a coin
function createSparkle(position) {
    const sparkleCount = mobileSparkleCount;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = getSparkleFromPool();
        if (!sparkle) continue; // Pool exhausted
        
        // Set color
        sparkle.material.color.setHex(Math.random() > 0.7 ? 0xFFFFFF : 0xFFD700);
        
        // Set initial position at the coin location
        sparkle.position.copy(position);
        sparkle.visible = true;
        sparkle.material.opacity = 1;
        
        // Give random velocity in all directions (but mostly upward)
        sparkle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            Math.random() * 0.2 + 0.1, // Mostly upward
            (Math.random() - 0.5) * 0.2
        );
        
        // Set lifespan for the sparkle
        sparkle.userData.lifespan = Math.random() * 30 + 20;
        sparkle.userData.age = 0;
        
        // Add to scene and array only if not already there
        if (!sparkle.parent) {
            scene.add(sparkle);
        }
        if (!sparkleParticles.includes(sparkle)) {
            sparkleParticles.push(sparkle);
        }
    }
}

// Update sparkle particles
function updateSparkles() {
    for (let i = sparkleParticles.length - 1; i >= 0; i--) {
        const sparkle = sparkleParticles[i];
        
        // Update position
        sparkle.position.add(sparkle.userData.velocity);
        
        // Add slight gravity effect
        sparkle.userData.velocity.y -= 0.005;
        
        // Make the sparkle spin
        sparkle.rotation.x += 0.1;
        sparkle.rotation.y += 0.1;
        
        // Increment age
        sparkle.userData.age++;
        
        // Fade out as it gets older
        if (sparkle.userData.age < sparkle.userData.lifespan) {
            const opacity = 1 - (sparkle.userData.age / sparkle.userData.lifespan);
            sparkle.material.opacity = opacity;
            sparkle.scale.set(opacity, opacity, opacity);
        }
        
        // Remove if it's past its lifespan
        if (sparkle.userData.age >= sparkle.userData.lifespan) {
            returnSparkleToPool(sparkle);
            sparkleParticles.splice(i, 1);
        }
    }
}