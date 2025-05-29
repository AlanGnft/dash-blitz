// ==================== HAPPY FACE CHARACTER ====================
// Cheerful yellow smiley face character for Running BlitZ
// Dependencies: THREE.js and shared.js must be loaded before this file

console.log('😊 Loading Happy Face character...');

function createHappyFaceCharacter() {
    const happyFaceGroup = new THREE.Group();
    
    // Create the main sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFF00, // Bright yellow
        roughness: 0.2,
        metalness: 0.1
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    happyFaceGroup.add(sphere);

    // Create eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000000, // Black
        roughness: 0.2
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.1, 0.4);
    happyFaceGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.1, 0.4);
    happyFaceGroup.add(rightEye);

    // Create smile using a curved tube
    const smileCurve = new THREE.CurvePath();
    const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.2, -0.1, 0.4),
        new THREE.Vector3(0, -0.2, 0.48),
        new THREE.Vector3(0.2, -0.1, 0.4)
    );
    smileCurve.add(curve);

    const smileGeometry = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
    const smileMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000000, // Black
        roughness: 0.2
    });
    const smile = new THREE.Mesh(smileGeometry, smileMaterial);
    happyFaceGroup.add(smile);

    // Add rosy cheeks
    const cheekGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const cheekMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF9999, // Pink
        roughness: 0.4,
        transparent: true,
        opacity: 0.6
    });

    const leftCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
    leftCheek.position.set(-0.28, -0.05, 0.35);
    leftCheek.scale.set(1, 0.6, 0.5);
    happyFaceGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
    rightCheek.position.set(0.28, -0.05, 0.35);
    rightCheek.scale.set(1, 0.6, 0.5);
    happyFaceGroup.add(rightCheek);

    // Add a special bouncy animation to the happy face
    happyFaceGroup.userData = {
        bounceOffset: Math.random() * Math.PI * 2,
        bounceSpeed: 0.05
    };

    return happyFaceGroup;
}

// Character metadata for the package manager
const happyFaceCharacterData = {
    id: 'happyface',
    name: 'Happy Face',
    description: 'A cheerful yellow smiley face that spreads joy wherever it goes!',
    creator: 'Running BlitZ Team',
    version: '1.0.0',
    abilities: ['Bounce', 'Cheer'],
    tags: ['cute', 'simple', 'beginner-friendly'],
    createFunction: 'createHappyFaceCharacter',
    previewRotation: { x: 0, y: 0.02, z: 0 }
};

// Export for package manager
if (typeof window !== 'undefined') {
    window.createHappyFaceCharacter = createHappyFaceCharacter;
    window.happyFaceCharacterData = happyFaceCharacterData;
}

console.log('😊 Happy Face character loaded successfully!');