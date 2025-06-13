// Underwater World - Deep sea adventure
const UnderwaterWorld = {
    id: 'underwater',
    name: 'Ocean Depths',
    description: 'Explore the mysterious underwater realm with coral reefs and sea creatures',
    cost: 15000, // Make it a premium world
    
    colors: {
        sky: 0x03111a,      // Deep ocean blue
        fog: 0x003355,      // Darker blue fog for depth
        ground: 0x334455    // Ocean floor color
    },
    
    lighting: {
        ambient: { color: 0x224466, intensity: 0.5 },      // Bluish ambient light
        directional: { color: 0x88BBDD, intensity: 0.4 }   // Filtered sunlight from above
    },
    
    // Unique obstacles for underwater world
    createObstacles: function() {
        return ['coralReef', 'giantClam', 'seaweedTangle', 'sunkenAnchor', 'rockFormation'];
    },
    
    // Underwater-specific scenery
    createScenery: function() {
        return ['kelpForest', 'schoolOfFish', 'bubbleStream', 'sunkenShip', 'glowingJellyfish'];
    },
    
    // Weather options for underwater
    weatherOptions: ['bubbles', 'current', 'particleDebris'],
    
    // Ambient sounds (for future)
    ambientSounds: ['underwater', 'bubbles', 'whale']
};

// Make it available globally
window.UnderwaterWorld = UnderwaterWorld;


console.log('🌊 Underwater World loaded successfully!');
