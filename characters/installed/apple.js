console.log('🍎 Loading Apple character...');

function createAppleCharacter() {
    const appleGroup = new THREE.Group();
    
    const appleGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const appleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        roughness: 0.3,
        metalness: 0
    });
    const appleBody = new THREE.Mesh(appleGeometry, appleMaterial);
    appleGroup.add(appleBody);
    
    const indentGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const indentMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xdd0000,
        roughness: 0.3
    });
    const indent = new THREE.Mesh(indentGeometry, indentMaterial);
    indent.position.y = 0.45;
    appleGroup.add(indent);
    
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.6;
    appleGroup.add(stem);
    
    const leafGeometry = new THREE.BoxGeometry(0.25, 0.05, 0.25);
    const leafMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x228B22,
        roughness: 0.5
    });
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.set(0.15, 0.6, 0.1);
    leaf.rotation.z = Math.PI / 6;
    appleGroup.add(leaf);
    
    return appleGroup;
}

if (typeof window !== 'undefined') window.createAppleCharacter = createAppleCharacter;
console.log('🍎 Apple character loaded successfully!');