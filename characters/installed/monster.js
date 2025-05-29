// ==================== MONSTER CHARACTER ====================
console.log('👹 Loading Monster character...');

function createMonsterCharacter() {
    const monsterGroup = new THREE.Group();

    const bodyGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.05,
        metalness: 0.9,
        emissive: 0x110000,
        emissiveIntensity: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.userData.isMainBody = true;
    monsterGroup.add(body);

    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 1.0,
        roughness: 0.1
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.1, 0.4);
    monsterGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.1, 0.4);
    monsterGroup.add(rightEye);

    // Evil grin - properly inset into the sphere
    const mouthGeometry = new THREE.RingGeometry(0.05, 0.2, 16, 1, 0, Math.PI);
    const mouthMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        side: THREE.DoubleSide,
        emissive: 0x330000,
        emissiveIntensity: 0.3
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.rotation.x = -Math.PI / 2;
    mouth.rotation.z = Math.PI;
    mouth.position.set(0, -0.15, 0.48);
    monsterGroup.add(mouth);

    // Add depth to the mouth
    const mouthDepthGeometry = new THREE.CircleGeometry(0.15, 16);
    const mouthDepthMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0x110000,
        emissiveIntensity: 0.8
    });
    const mouthDepth = new THREE.Mesh(mouthDepthGeometry, mouthDepthMaterial);
    mouthDepth.rotation.x = -Math.PI / 2;
    mouthDepth.position.set(0, -0.15, 0.47);
    monsterGroup.add(mouthDepth);

    // Add sharp teeth
    const teethGeometry = new THREE.ConeGeometry(0.025, 0.12, 4);
    const teethMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.1,
        metalness: 0.2
    });

    // Top teeth
    for (let i = 0; i < 6; i++) {
        const angle = (i / 5) * Math.PI - Math.PI;
        const tooth = new THREE.Mesh(teethGeometry, teethMaterial);
        
        const radius = 0.18;
        tooth.position.set(
            Math.cos(angle) * radius,
            -0.1,
            0.485 + Math.sin(angle) * radius * 0.1
        );
        
        tooth.rotation.x = Math.PI;
        tooth.rotation.y = -angle;
        
        monsterGroup.add(tooth);
    }

    // Bottom teeth
    for (let i = 0; i < 4; i++) {
        const angle = (i / 3) * Math.PI - Math.PI;
        const tooth = new THREE.Mesh(teethGeometry, teethMaterial);
        
        const radius = 0.15;
        tooth.position.set(
            Math.cos(angle) * radius,
            -0.2,
            0.485 + Math.sin(angle) * radius * 0.1
        );
        
        tooth.scale.set(0.8, 0.8, 0.8);
        tooth.rotation.x = 0;
        tooth.rotation.y = -angle;
        
        monsterGroup.add(tooth);
    }

    // ADD MISSING SMOKY AURA PARTICLES
    for (let i = 0; i < 20; i++) {
        const particleSize = Math.random() * 0.15 + 0.05;
        const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
        const particleMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0x330000,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        const radius = 0.6 + Math.random() * 0.3;
        
        particle.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
        
        // Store initial position and animation properties
        particle.userData = {
            rotationSpeed: Math.random() * 0.02 - 0.01,
            oscillationSpeed: Math.random() * 0.02 + 0.01,
            oscillationDistance: Math.random() * 0.1 + 0.05,
            initialPosition: particle.position.clone(),
            angle: Math.random() * Math.PI * 2
        };
        
        monsterGroup.add(particle);
    }

    monsterGroup.userData = {
        bobSpeed: 0.03 + Math.random() * 0.02,
        bobAngle: Math.random() * Math.PI * 2,
        rotateSpeed: 0.02
    };

    return monsterGroup;
}

if (typeof window !== 'undefined') window.createMonsterCharacter = createMonsterCharacter;
console.log('👹 Monster character loaded successfully!');