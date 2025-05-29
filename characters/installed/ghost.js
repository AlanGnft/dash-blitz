// ==================== GHOST CHARACTER ====================
// Adorable classic ghost character for Running BlitZ
// Dependencies: THREE.js and shared.js must be loaded before this file

console.log('👻 Loading Ghost character...');

function createGhostCharacter() {
    const ghostGroup = new THREE.Group();

    // Main ghost body - classic rounded top, wavy bottom
    const ghostShape = new THREE.Shape();

    // Draw classic ghost silhouette
    ghostShape.moveTo(-0.4, -0.5); // Start at bottom left
    ghostShape.lineTo(-0.4, 0.1);  // Up the left side
    ghostShape.quadraticCurveTo(-0.4, 0.5, 0, 0.5); // Rounded top left
    ghostShape.quadraticCurveTo(0.4, 0.5, 0.4, 0.1); // Rounded top right
    ghostShape.lineTo(0.4, -0.5); // Down the right side

    // Create wavy bottom with triangular points
    ghostShape.lineTo(0.3, -0.3);  // First wave peak
    ghostShape.lineTo(0.2, -0.5);  // First wave valley
    ghostShape.lineTo(0.1, -0.3);  // Second wave peak
    ghostShape.lineTo(0, -0.5);    // Second wave valley
    ghostShape.lineTo(-0.1, -0.3); // Third wave peak
    ghostShape.lineTo(-0.2, -0.5); // Third wave valley
    ghostShape.lineTo(-0.3, -0.3); // Fourth wave peak
    ghostShape.lineTo(-0.4, -0.5); // Back to start

    // Extrude the shape to create 3D ghost
    const extrudeSettings = {
        depth: 0.3,
        bevelEnabled: true,
        bevelSegments: 8,
        steps: 1,
        bevelSize: 0.05,
        bevelThickness: 0.05
    };

    const ghostGeometry = new THREE.ExtrudeGeometry(ghostShape, extrudeSettings);
    const ghostMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF, // Pure white ghost
        transparent: true,
        opacity: 0.85,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.15,
        roughness: 0.2,
        metalness: 0.1
    });

    const ghostBody = new THREE.Mesh(ghostGeometry, ghostMaterial);
    ghostBody.position.z = -0.15; // Center the extruded shape
    ghostGroup.add(ghostBody);

    // Big adorable eyes - larger and more expressive
    const eyeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.1,
        metalness: 0.1
    });

    // Left eye white
    const leftEyeWhite = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
    leftEyeWhite.position.set(-0.15, 0.15, 0.2);
    leftEyeWhite.scale.set(1, 1.2, 1); // Slightly oval
    ghostGroup.add(leftEyeWhite);

    // Right eye white
    const rightEyeWhite = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
    rightEyeWhite.position.set(0.15, 0.15, 0.2);
    rightEyeWhite.scale.set(1, 1.2, 1); // Slightly oval
    ghostGroup.add(rightEyeWhite);

    // Eye pupils - cute black dots
    const pupilGeometry = new THREE.SphereGeometry(0.06, 12, 12);
    const pupilMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.8
    });

    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.15, 0.18, 0.25);
    ghostGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.15, 0.18, 0.25);
    ghostGroup.add(rightPupil);

    // Cute little mouth - small "o" shape when surprised/happy
    const mouthGeometry = new THREE.SphereGeometry(0.04, 12, 12);
    const mouthMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.8
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 0.02, 0.25);
    mouth.scale.set(1, 0.6, 0.8); // Flatten to make "o" shape
    ghostGroup.add(mouth);

    // Add subtle blush for extra cuteness
    const blushGeometry = new THREE.SphereGeometry(0.06, 12, 12);
    const blushMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFB6C1, // Light pink
        transparent: true,
        opacity: 0.6,
        emissive: 0xFFB6C1,
        emissiveIntensity: 0.2
    });

    const leftBlush = new THREE.Mesh(blushGeometry, blushMaterial);
    leftBlush.position.set(-0.25, 0.08, 0.22);
    leftBlush.scale.set(0.8, 0.6, 0.5);
    ghostGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeometry, blushMaterial);
    rightBlush.position.set(0.25, 0.08, 0.22);
    rightBlush.scale.set(0.8, 0.6, 0.5);
    ghostGroup.add(rightBlush);



    // Store references for ability system and animations (no particles needed)
ghostGroup.userData = {
    body: ghostBody,
    eyes: [leftEyeWhite, rightEyeWhite, leftPupil, rightPupil],
    mouth: mouth,
    blush: [leftBlush, rightBlush],
    phaseActive: false,
    originalOpacity: ghostMaterial.opacity,
    floatOffset: Math.random() * Math.PI * 2
};

    return ghostGroup;
}

// Character metadata for the package manager
const ghostCharacterData = {
    id: 'ghost',
    name: 'Ghost',
    description: 'An adorable floating spirit with magical sparkles and a cute smile!',
    creator: 'Running BlitZ Team',
    version: '1.0.0',
    abilities: ['Phase', 'Float', 'Sparkle'],
    tags: ['cute', 'magical', 'floating'],
    createFunction: 'createGhostCharacter',
    previewRotation: { x: 0, y: 0.01, z: 0 }
};

// Export for package manager
if (typeof window !== 'undefined') {
    window.createGhostCharacter = createGhostCharacter;
    window.ghostCharacterData = ghostCharacterData;
}

console.log('👻 Ghost character loaded successfully!');