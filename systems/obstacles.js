// ==================== OBSTACLE SYSTEM ====================
// Obstacle spawning, collision detection, and obstacle management
// Dependencies: World System, Game Loop, Audio System
// Functions: spawnObstacle(), createObstacle(), handleCollision(), etc.

// Make functions globally accessible
window.ObstacleSystem = {
    spawnObstacle,
    spawnWaterStream,
    createMeteor,
    createMeteorImpact
};

// Make individual obstacle creators globally accessible
window.createRock = createRock;
window.createTreeStump = createTreeStump;
window.createLog = createLog;
window.createBush = createBush;
window.createSpikes = createSpikes;
window.createFallenTree = createFallenTree;

// Spawn obstacles with improved balancing
function spawnObstacle() {
    // Check if there are water streams nearby to ensure a clear path
    for (const stream of waterStreams) {
        const streamDistZ = stream.position.z;
        // Don't spawn obstacles too close to streams
        if (streamDistZ < -30 && streamDistZ > -70) {
            return; // Don't spawn obstacles near stream
        }
    }
    
    // Dynamic obstacle count based on current speed level - more aggressive scaling
    let maxObstacles = 1;
    let doubleObstacleChance = 0;

    if (currentSpeedLevel === 1) {
        doubleObstacleChance = 0.2; // 20% chance
    } else if (currentSpeedLevel === 2) {
        doubleObstacleChance = 0.4; // 40% chance
    } else if (currentSpeedLevel === 3) {
        doubleObstacleChance = 0.6; // 60% chance - BLAZING level
    } else if (currentSpeedLevel >= 4) {
        doubleObstacleChance = 0.75; // 75% chance - MAXIMUM CHAOS
    }

    if (Math.random() < doubleObstacleChance) {
        maxObstacles = 2;
    }
    
    // Generate random lanes, but ensure at least one lane is always clear
    let laneIndices = [];
    const numObstacles = Math.floor(Math.random() * maxObstacles) + 1;
    
    // More challenging patterns at higher speeds
    if (numObstacles === 2) {
        if (currentSpeedLevel >= 3) {
            // At BLAZING and CHAOS levels, allow more challenging patterns
            const patterns = [
                [0, 2], // Left and right (leave center)
                [0, 1], // Left and center (leave right) - more challenging
                [1, 2]  // Center and right (leave left) - more challenging
            ];
            laneIndices = patterns[Math.floor(Math.random() * patterns.length)];
        } else {
            // Lower speeds: only use the safe pattern
            laneIndices = [0, 2]; // Only left and right, leave center clear
        }
    } else {
        // Single obstacle in random lane
        laneIndices = [Math.floor(Math.random() * 3)];
    }
    
    // Spawn obstacles in the selected lanes
    for (const laneIndex of laneIndices) {
        let obstacle;
        
        // 5% chance of spawning fallen tree (spans 2 lanes) - check this BEFORE determining obstacle count
        if (Math.random() < 0.05) {
            // Spawn fallen tree across 2 adjacent lanes
            const startLane = Math.floor(Math.random() * 2); // 0 or 1 (so we can span to 1 or 2)
            
            const fallenTree = createFallenTree();
            fallenTree.position.x = lanes[startLane] + 1; // Position between the two lanes
            fallenTree.position.z = -50;
            scene.add(fallenTree);
            obstacles.push(fallenTree);
            
            debug('🌳 Fallen tree spawned at position:', fallenTree.position);
            
            // Skip the normal obstacle spawning since we spawned a fallen tree
            return;
        }

        // Check current world for unique obstacles
        if (currentWorld === 'forest' && window.ForestWorld) {
            // Forest-specific obstacles
            const forestObstacles = window.ForestWorld.createObstacles();
            const randomIndex = Math.floor(Math.random() * forestObstacles.length);
            const forestType = forestObstacles[randomIndex];

            switch (forestType) {
                case 'treeRoot':
                    obstacle = window.createTreeRoot();
                    break;
                case 'thornBush':
                    obstacle = window.createThornBush();
                    break;
                case 'fallenBranch':
                    obstacle = window.createFallenBranch();
                    break;
                case 'mushroomRing':
                    obstacle = window.createMushroomRing();
                    break;
                case 'puddlePatch':
                    obstacle = window.createPuddlePatch();
                    break;
                default:
                    obstacle = createRock(); // Fallback
                    break;
            }
        } else if (currentWorld === 'desert' && window.DesertWorld) {
            // Desert-specific obstacles
            const desertObstacles = ['cactus', 'sandDune', 'quicksand', 'ancientRuin'];
            const desertType = desertObstacles[Math.floor(Math.random() * desertObstacles.length)];
            
            switch (desertType) {
                case 'cactus':
                    obstacle = window.createCactus();
                    break;
                case 'sandDune':
                    obstacle = window.createSandDune();
                    break;
                case 'quicksand':
                    obstacle = window.createQuicksand();
                    break;
                case 'ancientRuin':
                    obstacle = window.createAncientRuin();
                    break;
                default:
                    obstacle = createRock(); // Fallback
                    break;
            }
        } else {
            // Classic world obstacles
            const obstacleType = Math.floor(Math.random() * 5);
            switch (obstacleType) {
                case 0: // Rock
                    obstacle = createRock();
                    break;
                case 1: // Tree stump
                    obstacle = createTreeStump();
                    break;
                case 2: // Log
                    obstacle = createLog();
                    break;
                case 3: // Bush
                    obstacle = createBush();
                    break;
                case 4: // Spikes
                    obstacle = createSpikes();
                    break;
            }
        }
        
        obstacle.position.x = lanes[laneIndex];
        obstacle.position.z = -50; // Spawn far away
        scene.add(obstacle);
        obstacles.push(obstacle);
        debug('🏗️ Spawned obstacle at lane', laneIndex, 'position:', obstacle.position, 'type: normal obstacle');
    }
}

// Spawn a stream across the track with better control
function spawnWaterStream() {
    // Only spawn if we haven't spawned one recently and it's been long enough
    if (streamSpawnCounter < currentStreamSpawnRate) {
        return null;
    }
    
    // Don't spawn stream if there are obstacles or other streams nearby
    for (const obstacle of obstacles) {
        if (obstacle.position.z < -30 && obstacle.position.z > -70) {
            return null;
        }
    }
    
    for (const stream of waterStreams) {
        if (stream.position.z < -20 && stream.position.z > -80) {
            return null;
        }
    }
    
    // Create and position the stream
    const stream = createWaterStream();
    // Reset counter when a stream is successfully spawned
    streamSpawnCounter = 0;
    streamCreated = true;
    return stream;
}

function createRock() {
    const rockGroup = new THREE.Group();
    
    // Create a more detailed rock
    const rockGeometry = new THREE.DodecahedronGeometry(0.5, 1); // More polygons for rougher look
    const rockMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x808080, // Gray
        roughness: 0.8,
        flatShading: true
    });
    
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.scale.set(1, 0.7, 1); // Flatten slightly
    rock.position.y = 0.35;
    rock.rotation.y = Math.random() * Math.PI * 2; // Random rotation
    rockGroup.add(rock);
    
    // Add some smaller rocks around it
    for (let i = 0; i < 3; i++) {
        const smallRockGeometry = new THREE.DodecahedronGeometry(0.2, 1);
        const smallRock = new THREE.Mesh(smallRockGeometry, rockMaterial);
        
        // Position randomly around the main rock
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 0.3 + 0.3;
        smallRock.position.set(
            Math.cos(angle) * distance,
            0.2,
            Math.sin(angle) * distance
        );
        smallRock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rockGroup.add(smallRock);
    }
    
    return rockGroup;
}

function createTreeStump() {
    const stumpGroup = new THREE.Group();
    const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.8, 12);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, // Brown
        roughness: 0.7
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.4;
    stumpGroup.add(trunk);
    
    // Add wood grain texture to the sides of the trunk
    const grainGeometry = new THREE.CylinderGeometry(0.41, 0.51, 0.81, 12, 1, true);
    const grainMaterial = new THREE.MeshStandardMaterial({
        color: 0x6B4513,
        roughness: 0.9,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const grain = new THREE.Mesh(grainGeometry, grainMaterial);
    grain.position.y = 0.4;
    stumpGroup.add(grain);
    
    // Add tree rings
    const ringGeometry = new THREE.CircleGeometry(0.4, 24);
    const ringMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xA0522D,
        roughness: 0.6
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.801;
    stumpGroup.add(ring);
    
    // Add a smaller inner ring
    const innerRingGeometry = new THREE.RingGeometry(0.1, 0.3, 24);
    const innerRingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        side: THREE.DoubleSide
    });
    const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.802;
    stumpGroup.add(innerRing);
    
    // Add the smallest inner ring
    const centerRingGeometry = new THREE.CircleGeometry(0.1, 16);
    const centerRingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x6B3E0D
    });
    const centerRing = new THREE.Mesh(centerRingGeometry, centerRingMaterial);
    centerRing.rotation.x = -Math.PI / 2;
    centerRing.position.y = 0.803;
    stumpGroup.add(centerRing);
    
    return stumpGroup;
}

function createLog() {
    const logGroup = new THREE.Group();
    const logGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 12);
    const logMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, // Brown
        roughness: 0.7
    });
    const log = new THREE.Mesh(logGeometry, logMaterial);
    log.rotation.z = Math.PI / 2;
    log.position.y = 0.3;
    logGroup.add(log);
    
    // Add wood grain texture
    const grainGeometry = new THREE.CylinderGeometry(0.31, 0.31, 1.51, 12, 1, true);
    const grainMaterial = new THREE.MeshStandardMaterial({
        color: 0x6B4513,
        roughness: 0.9,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const grain = new THREE.Mesh(grainGeometry, grainMaterial);
    grain.rotation.z = Math.PI / 2;
    grain.position.y = 0.3;
    logGroup.add(grain);
    
    // Add end caps with rings
    const capGeometry = new THREE.CircleGeometry(0.3, 24);
    const capMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xA0522D,
        roughness: 0.6
    });
    
    const cap1 = new THREE.Mesh(capGeometry, capMaterial);
    cap1.position.set(0.751, 0.3, 0);
    cap1.rotation.y = Math.PI / 2;
    logGroup.add(cap1);
    
    const cap2 = new THREE.Mesh(capGeometry, capMaterial);
    cap2.position.set(-0.751, 0.3, 0);
    cap2.rotation.y = -Math.PI / 2;
    logGroup.add(cap2);
    
    // Add rings to end caps
    const ringGeometry1 = new THREE.RingGeometry(0.1, 0.25, 24);
    const ringMaterial1 = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        side: THREE.DoubleSide
    });
    
    const ring1 = new THREE.Mesh(ringGeometry1, ringMaterial1);
    ring1.position.set(0.752, 0.3, 0);
    ring1.rotation.y = Math.PI / 2;
    logGroup.add(ring1);
    
    const ring2 = new THREE.Mesh(ringGeometry1, ringMaterial1);
    ring2.position.set(-0.752, 0.3, 0);
    ring2.rotation.y = -Math.PI / 2;
    logGroup.add(ring2);
    
    // Add some moss to the log
    const mossGeometry = new THREE.SphereGeometry(0.1, 8, 4);
    const mossMaterial = new THREE.MeshStandardMaterial({
        color: 0x3A5F0B,
        roughness: 1
    });
    
    for (let i = 0; i < 5; i++) {
        const moss = new THREE.Mesh(mossGeometry, mossMaterial);
        const angle = Math.random() * Math.PI; // Only on top half
        const xPos = (Math.random() * 1.2 - 0.6);
        moss.position.set(
            xPos,
            0.3 + Math.sin(angle) * 0.3,
            Math.cos(angle) * 0.3
        );
        moss.scale.set(0.6, 0.3, 0.6);
        moss.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        logGroup.add(moss);
    }
    
    return logGroup;
}

function createBush() {
    const bushGroup = new THREE.Group();
    
    // Create several spheres for a bush look
    const sphereGeometry = new THREE.SphereGeometry(0.4, 12, 12);
    const bushMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x228B22, // Forest green
        roughness: 0.8
    });
    
    const mainSphere = new THREE.Mesh(sphereGeometry, bushMaterial);
    mainSphere.position.y = 0.4;
    bushGroup.add(mainSphere);
    
    // Add smaller spheres around it for a more natural bush shape
    for (let i = 0; i < 8; i++) {
        const smallerSphere = new THREE.Mesh(sphereGeometry, bushMaterial);
        const angle = (i / 8) * Math.PI * 2;
        smallerSphere.position.set(
            Math.sin(angle) * 0.3,
            0.4 + (Math.random() * 0.4 - 0.2),
            Math.cos(angle) * 0.3
        );
        smallerSphere.scale.set(0.7, 0.7, 0.7);
        bushGroup.add(smallerSphere);
    }
    
    // Add some berries or flowers
    const berryGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const berryMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF0000, // Red
        roughness: 0.2,
        emissive: 0x330000,
        emissiveIntensity: 0.2
    });
    
    for (let i = 0; i < 12; i++) {
        const berry = new THREE.Mesh(berryGeometry, berryMaterial);
        // Distribute berries randomly over the surface
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 0.45;
        
        berry.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            0.4 + radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
        
        bushGroup.add(berry);
    }
    
    return bushGroup;
}

function createSpikes() {
    const spikeGroup = new THREE.Group();
    
    // Create base
    const baseGeometry = new THREE.BoxGeometry(1.5, 0.2, 0.5);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, // Brown
        roughness: 0.6
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.1;
    spikeGroup.add(base);
    
    // Add wood grain texture to the base
    const grainGeometry = new THREE.BoxGeometry(1.51, 0.21, 0.51);
    const grainMaterial = new THREE.MeshStandardMaterial({
        color: 0x6B4513,
        roughness: 0.9,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const grain = new THREE.Mesh(grainGeometry, grainMaterial);
    grain.position.y = 0.1;
    spikeGroup.add(grain);
    
    // Add spikes
    const spikeGeometry = new THREE.ConeGeometry(0.08, 0.5, 8);
    const spikeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xA9A9A9, // Dark gray
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x333333,
        emissiveIntensity: 0.2
    });
    
    for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        spike.position.set(-0.6 + i * 0.3, 0.35, 0);
        spikeGroup.add(spike);
    }
    
    return spikeGroup;
}

function createFallenTree() {
    const fallenTreeGroup = new THREE.Group();
    
    // Main tree trunk (lying horizontally)
    const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.3, 4, 12);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, // Brown
        roughness: 0.8
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.rotation.z = Math.PI / 2; // Rotate to lay horizontally
    trunk.position.y = 0.4;
    trunk.userData.isMainTrunk = true; // Mark this as the collision target
    fallenTreeGroup.add(trunk);
    
    // Add bark texture to the trunk
    const barkGeometry = new THREE.CylinderGeometry(0.41, 0.31, 4.1, 12, 1, true);
    const barkMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321, // Darker brown
        roughness: 0.9,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });
    const bark = new THREE.Mesh(barkGeometry, barkMaterial);
    bark.rotation.z = Math.PI / 2;
    bark.position.y = 0.4;
    fallenTreeGroup.add(bark);
    
    // Add some dead branches sticking out
    for (let i = 0; i < 6; i++) {
        const branchGeometry = new THREE.CylinderGeometry(0.05, 0.02, 0.6, 8);
        const branchMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9
        });
        const branch = new THREE.Mesh(branchGeometry, branchMaterial);
        
        // Position branches randomly along the trunk
        const xPos = (Math.random() - 0.5) * 3;
        const angle = Math.random() * Math.PI * 2;
        
        branch.position.set(xPos, 0.4, 0);
        branch.rotation.set(
            Math.random() * 0.5 - 0.25,
            angle,
            Math.random() * 0.3 - 0.15
        );
        
        fallenTreeGroup.add(branch);
    }
    
    // Add lots of dead leaves scattered around (more realistic)
    const deadLeafColors = [0x8B4513, 0xA0522D, 0x654321, 0x5D4037, 0x704214, 0x6B4226]; // More brown shades

    // Create main leaf clusters around the tree
    for (let i = 0; i < 40; i++) {
        const leafGeometry = new THREE.CircleGeometry(0.08 + Math.random() * 0.05, 6);
        const leafMaterial = new THREE.MeshStandardMaterial({
            color: deadLeafColors[Math.floor(Math.random() * deadLeafColors.length)],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7 + Math.random() * 0.3
        });
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        
        // Concentrate leaves more around the tree
        const distance = Math.random() * 3 + 0.5; // 0.5 to 3.5 units from center
        const angle = Math.random() * Math.PI * 2;
        
        leaf.position.set(
            Math.cos(angle) * distance,
            0.02 + Math.random() * 0.06, // Slightly varied height
            Math.sin(angle) * distance
        );
        leaf.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.3; // Mostly flat with slight variation
        leaf.rotation.z = Math.random() * Math.PI * 2;
        
        // Make some leaves slightly bigger for variety
        const scale = 0.8 + Math.random() * 0.6;
        leaf.scale.set(scale, scale, 1);
        
        fallenTreeGroup.add(leaf);
    }

    // Add leaf piles (concentrated clusters)
    for (let i = 0; i < 6; i++) {
        const pileX = (Math.random() - 0.5) * 4;
        const pileZ = (Math.random() - 0.5) * 2;
        
        // Create a small pile of leaves
        for (let j = 0; j < 8; j++) {
            const leafGeometry = new THREE.CircleGeometry(0.06 + Math.random() * 0.04, 5);
            const leafMaterial = new THREE.MeshStandardMaterial({
                color: deadLeafColors[Math.floor(Math.random() * deadLeafColors.length)],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.6 + Math.random() * 0.4
            });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            // Cluster leaves in the pile
            leaf.position.set(
                pileX + (Math.random() - 0.5) * 0.4,
                0.01 + j * 0.02, // Stack leaves slightly
                pileZ + (Math.random() - 0.5) * 0.4
            );
            leaf.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
            leaf.rotation.z = Math.random() * Math.PI * 2;
            
            fallenTreeGroup.add(leaf);
        }
    }

    // Add some twigs and small branches in the leaf piles
    for (let i = 0; i < 12; i++) {
        const twigGeometry = new THREE.CylinderGeometry(0.01, 0.02, 0.3, 6);
        const twigMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.9
        });
        const twig = new THREE.Mesh(twigGeometry, twigMaterial);
        
        twig.position.set(
            (Math.random() - 0.5) * 4,
            0.05,
            (Math.random() - 0.5) * 2
        );
        twig.rotation.set(
            Math.random() * 0.5,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI
        );
        
        fallenTreeGroup.add(twig);
    }
    
    // Add some moss patches on the trunk (shows it's been there a while)
    for (let i = 0; i < 4; i++) {
        const mossGeometry = new THREE.SphereGeometry(0.08, 8, 4);
        const mossMaterial = new THREE.MeshStandardMaterial({
            color: 0x3A5F0B, // Dark green moss
            roughness: 1
        });
        const moss = new THREE.Mesh(mossGeometry, mossMaterial);
        
        moss.position.set(
            (Math.random() - 0.5) * 3,
            0.4 + (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.6
        );
        moss.scale.set(0.8, 0.4, 0.8); // Flatten it against the trunk
        
        fallenTreeGroup.add(moss);
    }
    
    return fallenTreeGroup;
}

// Create falling meteor - exclusive to Maximum Chaos level
function createMeteor() {
    debug("createMeteor function called!");
    const meteorGroup = new THREE.Group();
    
    // Main meteor body - rough, rocky appearance (bigger and brighter)
    const meteorGeometry = new THREE.DodecahedronGeometry(0.8, 2);
    const meteorMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF6600, // Brighter orange/rock color
        roughness: 0.7,
        metalness: 0.2,
        emissive: 0xFF4500, // Fiery glow
        emissiveIntensity: 0.8 // Much brighter glow
    });
    
    const meteorCore = new THREE.Mesh(meteorGeometry, meteorMaterial);
    meteorGroup.add(meteorCore);

    // Add a bright glowing aura around the meteor to make it super visible
    const auraGeometry = new THREE.SphereGeometry(1.2, 16, 16);
    const auraMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF4500,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    meteorGroup.add(aura);
    
    // Add some smaller rock chunks around it
    for (let i = 0; i < 8; i++) {
        const chunkSize = Math.random() * 0.15 + 0.05;
        const chunkGeometry = new THREE.OctahedronGeometry(chunkSize, 1);
        const chunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321, // Darker brown
            roughness: 1.0,
            emissive: 0xFF6600,
            emissiveIntensity: 0.2
        });
        
        const chunk = new THREE.Mesh(chunkGeometry, chunkMaterial);
        
        // Position chunks randomly around the meteor
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 0.3 + 0.2;
        chunk.position.set(
            Math.cos(angle) * distance,
            (Math.random() - 0.5) * 0.4,
            Math.sin(angle) * distance
        );
        
        // Animation properties for floating chunks
        chunk.userData = {
            orbitSpeed: Math.random() * 0.02 + 0.01,
            orbitAngle: angle,
            orbitRadius: distance
        };
        
        meteorGroup.add(chunk);
    }

    // Add fire trail particles
   for (let i = 0; i < 12; i++) {
       const trailGeometry = new THREE.SphereGeometry(0.08, 8, 8);
       const trailMaterial = new THREE.MeshStandardMaterial({
           color: i < 6 ? 0xFF4500 : 0xFFFF00, // Mix of orange and yellow
           emissive: i < 6 ? 0xFF4500 : 0xFFFF00,
           emissiveIntensity: 0.5,
           transparent: true,
           opacity: 0.7 - (i * 0.05) // Fade out towards the back
       });
       
       const trailParticle = new THREE.Mesh(trailGeometry, trailMaterial);
       trailParticle.position.set(
           (Math.random() - 0.5) * 0.3,
           i * 0.15 + 0.5, // Trail going upward behind the meteor
           (Math.random() - 0.5) * 0.3
       );
       
       // Animation properties
       trailParticle.userData = {
           flickerSpeed: Math.random() * 0.1 + 0.05,
           originalOpacity: trailParticle.material.opacity
       };
       
       meteorGroup.add(trailParticle);
   }
   
   // Choose a random lane to target
   const targetLane = Math.floor(Math.random() * 3);

   // Start high above and ahead of the player so they can see it coming
   meteorGroup.position.set(
       lanes[targetLane], // Exact lane position
       20 + Math.random() * 5, // High in the sky but not too high
       player.position.z - 40 // Start ahead of player (visible in distance)
   );

   // Add meteor properties
   meteorGroup.userData = {
       targetLane: targetLane,
       fallSpeed: 0.3 + Math.random() * 0.1, // Faster fall speed so they're more dramatic
       rotationSpeed: Math.random() * 0.1 + 0.05,
       targetX: lanes[targetLane],
       chunks: meteorGroup.children.filter(child => child.userData.orbitSpeed),
       trailParticles: meteorGroup.children.filter(child => child.userData.flickerSpeed)
   };
   
   scene.add(meteorGroup);
   meteors.push(meteorGroup);
   debug(`Meteor created at position: ${meteorGroup.position.x}, ${meteorGroup.position.y}, ${meteorGroup.position.z}`);
   debug(`Total meteors: ${meteors.length}`);
}

// Create impact effect when meteor hits ground
function createMeteorImpact(position) {
   // Create explosion particles
   for (let i = 0; i < 15; i++) {
       const impactGeometry = new THREE.SphereGeometry(0.1, 8, 8);
       const impactMaterial = new THREE.MeshBasicMaterial({
           color: i < 8 ? 0xFF4500 : 0xFFFF00, // Orange and yellow
           transparent: true,
           opacity: 0.8
       });
       
       const impactParticle = new THREE.Mesh(impactGeometry, impactMaterial);
       impactParticle.position.copy(position);
       impactParticle.position.y = 0; // At ground level
       
       // Random velocity
       impactParticle.userData.velocity = new THREE.Vector3(
           (Math.random() - 0.5) * 0.2,
           Math.random() * 0.15,
           (Math.random() - 0.5) * 0.2
       );
       
       scene.add(impactParticle);
       explosionParticles.push(impactParticle);
   }
}