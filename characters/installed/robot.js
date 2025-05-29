// ==================== ROBOT CHARACTER ====================
// Metallic humanoid robot with electromagnetic effects for Running BlitZ
// Dependencies: THREE.js and shared.js must be loaded before this file

console.log('🤖 Loading Robot character...');

function createRobotCharacter() {
    const robotGroup = new THREE.Group();
    
    // Main body - metallic torso
    const bodyGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.3);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x708090, // Steel blue
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x001122,
        emissiveIntensity: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    robotGroup.add(body);
    
    // Head - cubic robot head
    const headGeometry = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0x778899,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x001133,
        emissiveIntensity: 0.2
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.45;
    robotGroup.add(head);
    
    // Glowing blue eyes
    const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x00CCFF,
        emissive: 0x00AAFF,
        emissiveIntensity: 1.0
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 0.5, 0.15);
    robotGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.1, 0.5, 0.15);
    robotGroup.add(rightEye);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
    
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.3, 0, 0);
    robotGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.3, 0, 0);
    robotGroup.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(0.12, 0.4, 0.15);
    
    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.1, -0.5, 0);
    robotGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.1, -0.5, 0);
    robotGroup.add(rightLeg);
    
    // Antenna with electromagnetic field indicator
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
    const antennaMaterial = new THREE.MeshStandardMaterial({
        color: 0x00FFFF,
        emissive: 0x00CCCC,
        emissiveIntensity: 0.5
    });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.y = 0.75;
    robotGroup.add(antenna);
    
    // Simple shield barrier (only visible when active)
    const shieldGeometry = new THREE.SphereGeometry(1.2, 16, 16);
    const shieldMaterial = new THREE.MeshBasicMaterial({
        color: 0x00DDFF,
        transparent: true,
        opacity: 0.0, // Invisible by default
        side: THREE.DoubleSide
    });
    const shieldBarrier = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shieldBarrier.visible = false; // Hidden by default
    robotGroup.add(shieldBarrier);
    
    // Store references for ability system
    robotGroup.userData = {
        shieldBarrier: shieldBarrier,
        shieldActive: false
    };

    return robotGroup;
}

// Character metadata for the package manager
const robotCharacterData = {
    id: 'robot',
    name: 'Robot',
    description: 'A high-tech metallic robot with electromagnetic shield capabilities!',
    creator: 'Running BlitZ Team',
    version: '1.0.0',
    abilities: ['Shield', 'Electromagnetic Field', 'Boost'],
    tags: ['sci-fi', 'metallic', 'high-tech'],
    createFunction: 'createRobotCharacter',
    previewRotation: { x: 0, y: 0.02, z: 0 }
};

// Export for package manager
if (typeof window !== 'undefined') {
    window.createRobotCharacter = createRobotCharacter;
    window.robotCharacterData = robotCharacterData;
}

console.log('🤖 Robot character loaded successfully!');