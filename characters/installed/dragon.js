// ==================== DRAGON CHARACTER ====================
console.log('🐉 Loading Dragon character...');

function createDragonCharacter() {
    const dragonGroup = new THREE.Group();
    
    // Main body - elongated for dragon shape
    const bodyGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B0000, // Dark red
        roughness: 0.6,
        metalness: 0.2,
        emissive: 0x330000,
        emissiveIntensity: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1.2, 0.8, 1.5); // Elongated dragon body
    dragonGroup.add(body);
    
    // Dragon head - more elongated snout
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xA52A2A, // Brown-red
        roughness: 0.5,
        emissive: 0x441100,
        emissiveIntensity: 0.2
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.2, 0.6);
    head.scale.set(0.8, 0.7, 1.3); // Elongated snout
    dragonGroup.add(head);
    
    // Glowing orange dragon eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF4500,
        emissive: 0xFF4500,
        emissiveIntensity: 1.2
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 0.25, 0.85);
    dragonGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.12, 0.25, 0.85);
    dragonGroup.add(rightEye);
    
    // Dragon horns
    const hornGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
    const hornMaterial = new THREE.MeshStandardMaterial({
        color: 0x2F2F2F, // Dark gray
        roughness: 0.8
    });
    
    const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    leftHorn.position.set(-0.1, 0.45, 0.5);
    leftHorn.rotation.z = Math.PI / 6;
    dragonGroup.add(leftHorn);
    
    const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    rightHorn.position.set(0.1, 0.45, 0.5);
    rightHorn.rotation.z = -Math.PI / 6;
    dragonGroup.add(rightHorn);

    // Dragon wings
    const wingGeometry = new THREE.ConeGeometry(0.5, 0.8, 3);
    const wingMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321, // Brown
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-0.6, 0.3, -0.2);
    leftWing.rotation.set(0, Math.PI / 4, Math.PI / 3);
    dragonGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(0.6, 0.3, -0.2);
    rightWing.rotation.set(0, -Math.PI / 4, -Math.PI / 3);
    dragonGroup.add(rightWing);

    // Dragon tail
    const tailGeometry = new THREE.ConeGeometry(0.15, 0.8, 8);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(0, -0.1, -0.8);
    tail.rotation.x = Math.PI / 2;
    dragonGroup.add(tail);

    // Fire particles (for fire breath ability)
    for (let i = 0; i < 8; i++) {
        const fireGeometry = new THREE.SphereGeometry(0.04, 6, 6);
        const fireColors = [0xFF4500, 0xFF6600, 0xFF8800, 0xFFAA00];
        const fireColor = fireColors[i % fireColors.length];
        const fireMaterial = new THREE.MeshBasicMaterial({
            color: fireColor,
            transparent: true,
            opacity: 0.7
        });
        const fireParticle = new THREE.Mesh(fireGeometry, fireMaterial);

        fireParticle.position.set(
            (Math.random() - 0.5) * 0.2,
            0.1 + Math.random() * 0.1,
            0.7
        );
        fireParticle.visible = false; // Hidden until fire breath is active

        fireParticle.userData = {
            flickerSpeed: Math.random() * 0.1 + 0.05,
            originalOpacity: 0.7
        };

        dragonGroup.add(fireParticle);
    }
    
    // Store references for ability system
    dragonGroup.userData = {
        fireParticles: dragonGroup.children.slice(9), // Store fire particles
        wings: [leftWing, rightWing],
        fireActive: false
    };
    
    return dragonGroup;
}

const dragonCharacterData = {
    id: 'dragon',
    name: 'Dragon',
    description: 'A mighty fire-breathing dragon with powerful wings and ancient magic!',
    creator: 'Running BlitZ Team',
    version: '1.0.0',
    abilities: ['Fire Breath', 'Wing Flap', 'Roar'],
    tags: ['mythical', 'powerful', 'fire'],
    createFunction: 'createDragonCharacter',
    previewRotation: { x: 0, y: 0.015, z: 0 }
};

if (typeof window !== 'undefined') {
    window.createDragonCharacter = createDragonCharacter;
    window.dragonCharacterData = dragonCharacterData;
}

console.log('🐉 Dragon character loaded successfully!');