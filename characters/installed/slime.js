// ==================== SLIME CHARACTER ====================
console.log('🟢 Loading Slime character...');

function createSlimeCharacter() {
    const slimeGroup = new THREE.Group();
    
    // Create the main blob body - flattened sphere for ooze effect
    const bodyGeometry = new THREE.SphereGeometry(0.4, 24, 24);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x32CD32, // Lime green
        roughness: 0.1,
        metalness: 0.3,
        emissive: 0x006400,
        emissiveIntensity: 0.2
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1.2, 0.6, 1.2); // Flattened and wider for blob effect
    body.position.y = -0.1; // Slightly lower to look like it's sitting
    slimeGroup.add(body);
    
    // Create the head - round blob on top
    const headGeometry = new THREE.SphereGeometry(0.35, 24, 24);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0x32CD32, // Same lime green
        roughness: 0.1,
        metalness: 0.3,
        emissive: 0x006400,
        emissiveIntensity: 0.2
    });
    
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.25; // On top of the body
    head.scale.set(1.1, 1.0, 1.1); // Slightly wider
    slimeGroup.add(head);
    
    // Create creepy glowing eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF0000, // Red eyes
        emissive: 0xFF0000,
        emissiveIntensity: 1.5,
        roughness: 0.1
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 0.3, 0.25);
    slimeGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 0.3, 0.25);
    slimeGroup.add(rightEye);
    
    // Create an evil grin - curved line
    const smileCurve = new THREE.CurvePath();
    const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.15, 0.1, 0.3),
        new THREE.Vector3(0, 0.05, 0.35),
        new THREE.Vector3(0.15, 0.1, 0.3)
    );
    smileCurve.add(curve);
    
    const smileGeometry = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
    const smileMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000, // Black
        roughness: 0.2
    });
    const smile = new THREE.Mesh(smileGeometry, smileMaterial);
    slimeGroup.add(smile);
    
    // Add some ooze drips around the base
    for (let i = 0; i < 6; i++) {
        const dripGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const dripMaterial = new THREE.MeshStandardMaterial({
            color: 0x228B22, // Darker green for drips
            roughness: 0.2,
            metalness: 0.2,
            emissive: 0x004400,
            emissiveIntensity: 0.1
        });
        
        const drip = new THREE.Mesh(dripGeometry, dripMaterial);
        const angle = (i / 6) * Math.PI * 2;
        const radius = 0.4 + Math.random() * 0.2;
        
        drip.position.set(
            Math.cos(angle) * radius,
            -0.25 - Math.random() * 0.1, // Below the main body
            Math.sin(angle) * radius
        );
        drip.scale.set(1, 0.5 + Math.random() * 0.5, 1); // Flattened drips
        
        slimeGroup.add(drip);
    }
    
    // Add bubbling effect - small spheres that will animate
    for (let i = 0; i < 8; i++) {
        const bubbleGeometry = new THREE.SphereGeometry(0.03 + Math.random() * 0.02, 8, 8);
        const bubbleMaterial = new THREE.MeshStandardMaterial({
            color: 0x90EE90, // Light green
            transparent: true,
            opacity: 0.6,
            emissive: 0x32CD32,
            emissiveIntensity: 0.3
        });
        
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.7; // Only on upper surface
        const radius = 0.4;
        
        bubble.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
        
        bubble.userData = {
            pulseSpeed: Math.random() * 0.05 + 0.02,
            pulsePhase: Math.random() * Math.PI * 2,
            originalScale: bubble.scale.clone()
        };
        
        slimeGroup.add(bubble);
    }
    
    // Animation properties for the slime
    slimeGroup.userData = {
        wobbleSpeed: 0.03,
        wobbleIntensity: 0.05,
        bubbles: slimeGroup.children.filter(child => child.userData.pulseSpeed)
    };
    
    return slimeGroup;
}

const slimeCharacterData = {
    id: 'slime',
    name: 'Slime',
    description: 'A gooey, bubbling creature that oozes with mysterious green energy!',
    creator: 'Running BlitZ Team',
    version: '1.0.0',
    abilities: ['Ooze Trail', 'Bubble Pop', 'Acid Spit'],
    tags: ['gooey', 'creepy', 'green'],
    createFunction: 'createSlimeCharacter',
    previewRotation: { x: 0, y: 0.02, z: 0 }
};

if (typeof window !== 'undefined') {
    window.createSlimeCharacter = createSlimeCharacter;
    window.slimeCharacterData = slimeCharacterData;
}

console.log('🟢 Slime character loaded successfully!');