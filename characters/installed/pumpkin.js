console.log('🎃 Loading Pumpkin character...');

function createPumpkinCharacter() {
    const pumpkinGroup = new THREE.Group();
    
    const pumpkinShape = new THREE.Group();
    const mainGeometry = new THREE.SphereGeometry(0.45, 24, 24);
    const pumpkinMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF6600,
        roughness: 0.4,
        metalness: 0.1
    });
    
    const centerBody = new THREE.Mesh(mainGeometry, pumpkinMaterial);
    centerBody.scale.set(1.0, 0.95, 1.0);
    pumpkinShape.add(centerBody);
    
    for (let i = 0; i < 8; i++) {
        const segmentGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const segmentMaterial = new THREE.MeshStandardMaterial({
            color: 0xE55500,
            roughness: 0.5,
            metalness: 0.05
        });

        const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.25;

        segment.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
        segment.scale.set(0.8, 0.95, 0.9);
        pumpkinShape.add(segment);
    }
    
    pumpkinGroup.add(pumpkinShape);
    
    const topIndentGeometry = new THREE.CircleGeometry(0.12, 16);
    const topIndentMaterial = new THREE.MeshStandardMaterial({
        color: 0xDD5500,
        roughness: 0.7,
        side: THREE.DoubleSide
    });
    const topIndent = new THREE.Mesh(topIndentGeometry, topIndentMaterial);
    topIndent.position.y = 0.43;
    topIndent.rotation.x = -Math.PI/2;
    pumpkinGroup.add(topIndent);
    
    const stemGeometry = new THREE.CylinderGeometry(0.04, 0.08, 0.3, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.9,
        metalness: 0.1
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.58;
    pumpkinGroup.add(stem);

    return pumpkinGroup;
}

if (typeof window !== 'undefined') window.createPumpkinCharacter = createPumpkinCharacter;
console.log('🎃 Pumpkin character loaded successfully!');