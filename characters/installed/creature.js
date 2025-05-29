// ==================== CREATURE CHARACTER ====================
console.log('👾 Loading Creature character...');

function createCreatureCharacter() {
    const creatureGroup = new THREE.Group();

    const bodyGeometry = new THREE.SphereGeometry(0.45, 24, 24);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a0d2e,
        transparent: true,
        opacity: 0.85,
        emissive: 0x0d001a,
        emissiveIntensity: 0.3,
        roughness: 0.8,
        metalness: 0.1
    });

    const mainBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    mainBody.scale.set(1.1, 0.9, 1.1);
    creatureGroup.add(mainBody);

    const coreGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.7,
        emissive: 0x00ffff,
        emissiveIntensity: 1.2
    });

    const neonCore = new THREE.Mesh(coreGeometry, coreMaterial);
    neonCore.position.y = 0.1;
    creatureGroup.add(neonCore);

    // Multiple glowing eyes
    const eyePositions = [
        { x: -0.2, y: 0.25, z: 0.35, color: 0xff0080, size: 0.08 },
        { x: 0.15, y: 0.3, z: 0.4, color: 0x00ff80, size: 0.06 },
        { x: 0, y: 0.1, z: 0.42, color: 0x8000ff, size: 0.05 },
        { x: -0.35, y: 0.05, z: 0.25, color: 0xff4000, size: 0.04 },
        { x: 0.3, y: 0.15, z: 0.3, color: 0x00ffff, size: 0.07 }
    ];

    const eyes = [];
    eyePositions.forEach((eyeData, index) => {
        const eyeGeometry = new THREE.SphereGeometry(eyeData.size, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: eyeData.color,
            transparent: true,
            opacity: 0.9,
            emissive: eyeData.color,
            emissiveIntensity: 1.5
        });
        
        const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye.position.set(eyeData.x, eyeData.y, eyeData.z);
        
        eye.userData = {
            originalColor: eyeData.color,
            blinkSpeed: 0.03 + Math.random() * 0.02,
            blinkOffset: Math.random() * Math.PI * 2,
            pulseSpeed: 0.05 + Math.random() * 0.03,
            pulsePhase: Math.random() * Math.PI * 2
        };
        
        creatureGroup.add(eye);
        eyes.push(eye);
    });

    // ADD MISSING FLOATING NEON TENTACLES
    for (let i = 0; i < 8; i++) {
        const tentacleGroup = new THREE.Group();
        
        // Create tentacle segments
        for (let j = 0; j < 4; j++) {
            const segmentGeometry = new THREE.SphereGeometry(0.08 - j * 0.015, 8, 8);
            const neonColors = [0x00ffff, 0xff0080, 0x00ff80, 0x8000ff, 0xff4000];
            const segmentColor = neonColors[i % neonColors.length];
            
            const segmentMaterial = new THREE.MeshStandardMaterial({
                color: segmentColor,
                transparent: true,
                opacity: 0.8 - j * 0.1,
                emissive: segmentColor,
                emissiveIntensity: 0.8,
                roughness: 0.2
            });
            
            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            segment.position.y = -j * 0.12;
            
            segment.userData = {
                segmentIndex: j,
                waveSpeed: 0.04 + Math.random() * 0.02,
                waveOffset: Math.random() * Math.PI * 2
            };
            
            tentacleGroup.add(segment);
        }
        
        // Position tentacles around the creature
        const angle = (i / 8) * Math.PI * 2;
        tentacleGroup.position.set(
            Math.cos(angle) * 0.4,
            -0.3,
            Math.sin(angle) * 0.4
        );
        
        tentacleGroup.userData = {
            baseAngle: angle,
            swaySpeed: 0.02 + Math.random() * 0.01,
            swayAmount: 0.3 + Math.random() * 0.2
        };
        
        creatureGroup.add(tentacleGroup);
    }

    // ADD MISSING ETHEREAL ENERGY WISPS
    const wisps = [];
    for (let i = 0; i < 15; i++) {
        const wispGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const wispColors = [0x00ffff, 0xff0080, 0x00ff80, 0x8000ff, 0xffffff];
        const wispColor = wispColors[Math.floor(Math.random() * wispColors.length)];
        
        const wispMaterial = new THREE.MeshBasicMaterial({
            color: wispColor,
            transparent: true,
            opacity: 0.6,
            emissive: wispColor,
            emissiveIntensity: 1.0
        });
        
        const wisp = new THREE.Mesh(wispGeometry, wispMaterial);
        
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.7 + Math.random() * 0.4;
        const height = (Math.random() - 0.5) * 1.2;
        
        wisp.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        
        wisp.userData = {
            orbitSpeed: 0.01 + Math.random() * 0.02,
            orbitRadius: radius,
            orbitAngle: angle,
            verticalSpeed: 0.015 + Math.random() * 0.01,
            verticalOffset: Math.random() * Math.PI * 2,
            pulseSpeed: 0.08 + Math.random() * 0.04,
            pulsePhase: Math.random() * Math.PI * 2,
            colorChangeSpeed: 0.005 + Math.random() * 0.003,
            originalColor: wispColor
        };
        
        creatureGroup.add(wisp);
        wisps.push(wisp);
    }

    creatureGroup.userData = {
        mainBody: mainBody,
        neonCore: neonCore,
        eyes: eyes,
        tentacles: creatureGroup.children.filter(child => child.userData && child.userData.baseAngle !== undefined),
        wisps: wisps,
        corePhase: Math.random() * Math.PI * 2,
        bodyPulseSpeed: 0.03,
        morphSpeed: 0.02
    };

    return creatureGroup;
}

if (typeof window !== 'undefined') window.createCreatureCharacter = createCreatureCharacter;
console.log('👾 Creature character loaded successfully!');