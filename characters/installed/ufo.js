// ==================== UFO CHARACTER ====================
console.log('🛸 Loading UFO character...');

function createUFOCharacter() {
    const ufoGroup = new THREE.Group();
    
    // Main saucer body - much flatter and wider
    const saucerGeometry = new THREE.SphereGeometry(0.6, 32, 32, 0, Math.PI * 2, 0, Math.PI / 4);
    const saucerMaterial = new THREE.MeshStandardMaterial({
        color: 0xC0C0C0, // Silver
        roughness: 0.1,
        metalness: 0.9,
        emissive: 0x004466,
        emissiveIntensity: 0.3
    });

    const saucerTop = new THREE.Mesh(saucerGeometry, saucerMaterial);
    saucerTop.position.y = 0.02;
    saucerTop.scale.set(0.92, 0.25, 0.92);
    ufoGroup.add(saucerTop);

    // Bottom saucer (inverted and flatter)
    const saucerBottom = new THREE.Mesh(saucerGeometry, saucerMaterial);
    saucerBottom.rotation.x = Math.PI;
    saucerBottom.position.y = -0.02;
    saucerBottom.scale.set(0.92, 0.25, 0.92);
    ufoGroup.add(saucerBottom);
    
    // Central command dome
    const domeGeometry = new THREE.SphereGeometry(0.2, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({
        color: 0x4444FF, // Blue tint
        roughness: 0.05,
        metalness: 0.8,
        emissive: 0x2222AA,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7
    });

    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 0.2;
    dome.scale.set(1, 0.6, 1);
    ufoGroup.add(dome);
    
    // Rotating outer ring with details
    const ringGroup = new THREE.Group();
    
    const ringGeometry = new THREE.TorusGeometry(0.55, 0.06, 8, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x222222,
        emissiveIntensity: 0.2
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ringGroup.add(ring);
    
    // Add detail panels around the ring
    for (let i = 0; i < 8; i++) {
        const panelGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.15);
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.3,
            metalness: 0.7
        });
        
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        const angle = (i / 8) * Math.PI * 2;
        panel.position.set(
            Math.cos(angle) * 0.45,
            0,
            Math.sin(angle) * 0.45
        );
        panel.rotation.y = angle;
        
        ringGroup.add(panel);
    }
    
    ringGroup.position.y = 0;
    ufoGroup.add(ringGroup);
    
    // Pulsing lights around the perimeter
    const lightsGroup = new THREE.Group();
    
    for (let i = 0; i < 12; i++) {
        const lightGeometry = new THREE.SphereGeometry(0.06, 16, 16);
        
        const lightColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
        const lightColor = lightColors[i % lightColors.length];
        
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: lightColor,
            emissive: lightColor,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.9
        });
        
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        const angle = (i / 12) * Math.PI * 2;
        light.position.set(
            Math.cos(angle) * 0.58,
            0.02,
            Math.sin(angle) * 0.58
        );
        
        light.userData = {
            pulseSpeed: 0.05 + Math.random() * 0.05,
            pulsePhase: Math.random() * Math.PI * 2,
            originalIntensity: 0.8,
            originalColor: lightColor
        };
        
        lightsGroup.add(light);
    }
    
    ufoGroup.add(lightsGroup);
    
    // Tractor beam effect
    const beamGeometry = new THREE.ConeGeometry(0.3, 0.8, 8, 1, true);
    const beamMaterial = new THREE.MeshBasicMaterial({
        color: 0x00FFAA,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.y = -0.6;
    beam.rotation.x = Math.PI;
    ufoGroup.add(beam);
    
    // Energy particles floating around
    for (let i = 0; i < 15; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.7
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 0.7 + Math.random() * 0.3;
        
        particle.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
        
        particle.userData = {
            orbitSpeed: 0.01 + Math.random() * 0.02,
            orbitRadius: radius,
            orbitAngle: theta,
            floatSpeed: 0.02 + Math.random() * 0.02,
            floatOffset: Math.random() * Math.PI * 2
        };
        
        ufoGroup.add(particle);
    }
    
    // Store animation components
    ufoGroup.userData = {
        ring: ringGroup,
        lights: lightsGroup,
        dome: dome,
        beam: beam,
        particles: ufoGroup.children.filter(child => 
            child.userData && child.userData.orbitSpeed
        )
    };
    
    return ufoGroup;
}

const ufoCharacterData = {
    id: 'ufo',
    name: 'UFO',
    description: 'An alien spacecraft with pulsing lights and mysterious tractor beam technology!',
    creator: 'Running BlitZ Team',
    version: '1.0.0',
    abilities: ['Tractor Beam', 'Hover', 'Light Show'],
    tags: ['alien', 'sci-fi', 'mysterious'],
    createFunction: 'createUFOCharacter',
    previewRotation: { x: 0, y: 0.02, z: 0 }
};

if (typeof window !== 'undefined') {
    window.createUFOCharacter = createUFOCharacter;
    window.ufoCharacterData = ufoCharacterData;
}

console.log('🛸 UFO character loaded successfully!');