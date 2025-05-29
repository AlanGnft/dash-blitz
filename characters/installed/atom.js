// ==================== ATOM CHARACTER ====================
console.log('⚛️ Loading Atom character...');

function createAtomCharacter() {
    const atomGroup = new THREE.Group();
    
    // Create the nucleus (core)
    const nucleusGeometry = new THREE.SphereGeometry(0.25, 24, 24);
    const nucleusMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0088FF, // Blue core
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x0044AA,
        emissiveIntensity: 0.5
    });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    atomGroup.add(nucleus);
    
    // Add glowing effect around nucleus
    const glowGeometry = new THREE.SphereGeometry(0.28, 24, 24);
    const glowMaterial = new THREE.MeshStandardMaterial({
        color: 0x00AAFF,
        transparent: true,
        opacity: 0.3,
        emissive: 0x0088FF,
        emissiveIntensity: 1.0,
        side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    atomGroup.add(glow);
    
    // Create electron orbits (3 orbital rings at different angles)
    const orbitalColors = [0xFF4400, 0x00FF88, 0xFFCC00]; // Orange, Green, Yellow
    const orbitalRadii = [0.6, 0.5, 0.55];
    
    for (let i = 0; i < 3; i++) {
        const orbitalGeometry = new THREE.TorusGeometry(orbitalRadii[i], 0.02, 16, 64);
        const orbitalMaterial = new THREE.MeshStandardMaterial({
            color: orbitalColors[i],
            emissive: orbitalColors[i],
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        
        const orbital = new THREE.Mesh(orbitalGeometry, orbitalMaterial);
        
        // Rotate each orbital differently
        if (i === 0) {
            orbital.rotation.x = Math.PI / 2; // XZ plane
        } else if (i === 1) {
            orbital.rotation.y = Math.PI / 2; // YZ plane
        } else {
            orbital.rotation.x = Math.PI / 4; // Angled plane
            orbital.rotation.y = Math.PI / 4;
        }
        
        atomGroup.add(orbital);
        
        // Add electrons to each orbital
        const electronCount = i + 2; // 2, 3, and 4 electrons
        
        for (let j = 0; j < electronCount; j++) {
            const electronGeometry = new THREE.SphereGeometry(0.06, 16, 16);
            const electronMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                emissive: 0xFFFFFF,
                emissiveIntensity: 0.8
            });
            
            const electron = new THREE.Mesh(electronGeometry, electronMaterial);
            
            const angle = (j / electronCount) * Math.PI * 2;
            
            // Position based on orbital orientation
            if (i === 0) {
                electron.position.x = Math.cos(angle) * orbitalRadii[i];
                electron.position.z = Math.sin(angle) * orbitalRadii[i];
            } else if (i === 1) {
                electron.position.y = Math.cos(angle) * orbitalRadii[i];
                electron.position.z = Math.sin(angle) * orbitalRadii[i];
            } else {
                electron.position.x = Math.cos(angle) * orbitalRadii[i] * 0.7;
                electron.position.y = Math.cos(angle) * orbitalRadii[i] * 0.7;
                electron.position.z = Math.sin(angle) * orbitalRadii[i];
            }
            
            electron.userData = {
                orbitalIndex: i,
                orbitalRadius: orbitalRadii[i],
                electronIndex: j,
                electronCount: electronCount,
                angle: angle,
                speed: 0.02 + (i * 0.01)
            };
            
            atomGroup.add(electron);
        }
    }
    
    // Add sparkle particles around the nucleus
    for (let i = 0; i < 12; i++) {
        const sparkleGeometry = new THREE.SphereGeometry(0.02 + Math.random() * 0.03, 8, 8);
        const sparkleMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.7
        });
        
        const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = Math.random() * 0.15 + 0.1;
        
        sparkle.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
        
        sparkle.userData = {
            pulseSpeed: Math.random() * 0.1 + 0.05,
            pulsePhase: Math.random() * Math.PI * 2
        };
        
        nucleus.add(sparkle);
    }
    
    // Store animation properties
    atomGroup.userData = {
        glowPulseSpeed: 0.05,
        glowPhase: 0,
        orbitalSpeed: 0.01
    };
    
    return atomGroup;
}

const atomCharacterData = {
    id: 'atom',
    name: 'Atom',
    description: 'A scientific marvel with orbiting electrons and nuclear energy!',
    creator: 'Running BlitZ Team',
    version: '1.0.0',
    abilities: ['Nuclear Burst', 'Electron Shield', 'Energy Pulse'],
    tags: ['science', 'energy', 'glowing'],
    createFunction: 'createAtomCharacter',
    previewRotation: { x: 0, y: 0.01, z: 0 }
};

if (typeof window !== 'undefined') {
    window.createAtomCharacter = createAtomCharacter;
    window.atomCharacterData = atomCharacterData;
}

console.log('⚛️ Atom character loaded successfully!');