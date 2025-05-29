// ==================== SHARED CHARACTER UTILITIES ====================
// Common utilities and dependencies for all characters
// Dependencies: THREE.js must be loaded before this file

console.log('🔧 Loading shared character utilities...');

// Character animation utilities
const CharacterAnimationUtils = {
    // Common animation helpers that multiple characters use
    createFloatingParticles: function(count, colors, radius) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
            const particleColor = colors[Math.floor(Math.random() * colors.length)];
            
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: particleColor,
                transparent: true,
                opacity: 0.7,
                emissive: particleColor,
                emissiveIntensity: 0.5
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            const angle = (i / count) * Math.PI * 2;
            const particleRadius = radius + Math.random() * 0.2;
            particle.position.set(
                Math.cos(angle) * particleRadius,
                Math.sin(angle * 0.7) * 0.3,
                Math.sin(angle) * particleRadius
            );
            
            particle.userData = {
                orbitSpeed: 0.015 + Math.random() * 0.01,
                orbitRadius: particleRadius,
                orbitAngle: angle,
                floatSpeed: 0.02 + Math.random() * 0.02,
                floatOffset: Math.random() * Math.PI * 2,
                pulseSpeed: 0.05 + Math.random() * 0.05,
                pulsePhase: Math.random() * Math.PI * 2
            };
            
            particles.push(particle);
        }
        return particles;
    },
    
    // Standard material presets
    materials: {
        glow: function(color, intensity = 0.5) {
            return new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: intensity,
                roughness: 0.1,
                metalness: 0.1
            });
        },
        
        metal: function(color, roughness = 0.1, metalness = 0.9) {
            return new THREE.MeshStandardMaterial({
                color: color,
                roughness: roughness,
                metalness: metalness
            });
        }
    }
};

// Export for use by character files
window.CharacterAnimationUtils = CharacterAnimationUtils;

console.log('🔧 Shared character utilities loaded successfully!');