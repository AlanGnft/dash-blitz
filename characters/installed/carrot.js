console.log('🥕 Loading Carrot character...');

function createCarrotCharacter() {
    const carrotGroup = new THREE.Group();

    const carrotGeometry = new THREE.ConeGeometry(0.4, 1.2, 16);
    const carrotMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF8C00,
        roughness: 0.6
    });
    const carrotBody = new THREE.Mesh(carrotGeometry, carrotMaterial);
    carrotBody.rotation.x = Math.PI;
    carrotBody.position.y = -0.2;
    carrotGroup.add(carrotBody);

    const leavesGroup = new THREE.Group();
    leavesGroup.position.y = 0.4;

    for (let i = 0; i < 7; i++) {
        const leafGeometry = new THREE.CylinderGeometry(0.05, 0.1, 0.5, 8);
        const leafMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x228B22,
            roughness: 0.5
        });
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.rotation.x = Math.PI / 4;
        leaf.rotation.z = (i / 7) * Math.PI * 2;
        leaf.position.x = Math.sin((i / 7) * Math.PI * 2) * 0.2;
        leaf.position.z = Math.cos((i / 7) * Math.PI * 2) * 0.2;
        leavesGroup.add(leaf);
    }

    carrotGroup.add(leavesGroup);
    return carrotGroup;
}

if (typeof window !== 'undefined') window.createCarrotCharacter = createCarrotCharacter;
console.log('🥕 Carrot character loaded successfully!');