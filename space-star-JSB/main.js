import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Game state variables
let gameActive = false;
let musicEnabled = true;
let shields = 100;
let distance = 0;
let speed = 50; // Increased from 30 to 50 for much faster initial speed
let enemiesKilled = 0;

// Three.js variables
let scene, camera, renderer;
let tunnel, spaceship, reticle;
let enemies = [];
let playerLasers = [];
let enemyLasers = [];
let clock = new THREE.Clock();
let lastFireTime = 0;
let lastEnemySpawnDistance = 0;
let spawnRate = 1000; // in meters

// Movement variables
let moveSpeed = 0.1; // Reduced from 0.2 for slower movement
let acceleration = 0.04; // Reduced from 0.08 for smoother acceleration
let deceleration = 0.03; // Reduced from 0.05 for smoother deceleration
let maxSpeed = 0.4; // Reduced from 0.6 for lower maximum speed
let currentVelocity = new THREE.Vector3(0, 0, 0); // Current movement velocity

// Add movement state variables at the top with other game state variables
let moveState = {
    up: false,
    down: false,
    left: false,
    right: false
};

// DOM Elements
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const controlsScreen = document.getElementById('controls-screen');
const rankingScreen = document.getElementById('ranking-screen');
const gameOverModal = document.getElementById('game-over-modal');
const quitModal = document.getElementById('quit-modal');
const damageOverlay = document.createElement('div');
damageOverlay.id = 'damage-overlay';
document.getElementById('game-container').appendChild(damageOverlay);

// Audio elements
const menuMusic = document.getElementById('menu-music');
const gameMusic = document.getElementById('game-music');
const laserSound = document.getElementById('laser-sound');
const explosionSound = document.getElementById('explosion-sound');
const hitSound = document.getElementById('hit-sound');
const gameOverSound = document.getElementById('game-over-sound');

// Game initialization
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupEventListeners();
    loadRankings();
    
    // Start menu music if enabled
    if (musicEnabled) {
        menuMusic.play();
    }
}

// Set up event listeners for buttons and controls
function setupEventListeners() {
    // Menu buttons
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('controls-button').addEventListener('click', showControlsScreen);
    document.getElementById('ranking-button').addEventListener('click', showRankingScreen);
    document.getElementById('toggle-music').addEventListener('click', toggleMusic);
    
    // Back buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', showMenuScreen);
    });
    
    // Game over modal
    document.getElementById('save-score').addEventListener('click', saveScore);
    
    // Quit modal
    document.getElementById('quit-cancel').addEventListener('click', hideQuitModal);
    document.getElementById('quit-confirm').addEventListener('click', quitGame);
    
    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', (event) => {
        if (!gameActive) return;
        
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
                moveState.up = false;
                break;
            case 'ArrowDown':
            case 's':
                moveState.down = false;
                break;
            case 'ArrowLeft':
            case 'a':
                moveState.left = false;
                break;
            case 'ArrowRight':
            case 'd':
                moveState.right = false;
                break;
        }
    });
}

// Game state management functions
function showMenuScreen() {
    hideAllScreens();
    menuScreen.classList.add('active');
    
    // Switch music
    if (gameMusic.played.length > 0) {
        gameMusic.pause();
        gameMusic.currentTime = 0;
    }
    
    if (musicEnabled) {
        menuMusic.play();
    }
}

function showControlsScreen() {
    hideAllScreens();
    controlsScreen.classList.add('active');
}

function showRankingScreen() {
    hideAllScreens();
    rankingScreen.classList.add('active');
}

function hideAllScreens() {
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    const musicToggle = document.getElementById('toggle-music');
    
    if (musicEnabled) {
        musicToggle.textContent = '🔊';
        if (menuScreen.classList.contains('active')) {
            menuMusic.play();
        } else if (gameScreen.classList.contains('active')) {
            gameMusic.play();
        }
    } else {
        musicToggle.textContent = '🔇';
        menuMusic.pause();
        gameMusic.pause();
    }
}

// Three.js setup function
function setupThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Add fog for depth effect
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 5);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.getElementById('game-canvas').appendChild(renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add stars background for the ceiling
    createStarsBackground();
    
    // Create the tunnel
    createTunnel();
    
    // Create the player's spaceship
    createSpaceship();
    
    // Create the aiming reticle
    createReticle();
}

// Function to start the game
function startGame() {
    // Clean up any existing scene
    cleanupScene();
    
    hideAllScreens();
    gameScreen.classList.add('active');
    
    // Stop menu music and start game music
    if (menuMusic.played.length > 0) {
        menuMusic.pause();
        menuMusic.currentTime = 0;
    }
    
    if (musicEnabled) {
        gameMusic.play();
    }
    
    // Set up Three.js environment
    setupThreeJS();
    
    // Start the game loop
    gameActive = true;
    animate();
}

// Function to clean up Three.js scene and objects
function cleanupScene() {
    if (renderer) {
        // Remove the renderer from the DOM
        renderer.domElement.remove();
        renderer.dispose();
        renderer = null;
    }

    if (scene) {
        // Remove all objects from scene
        while(scene.children.length > 0) { 
            const object = scene.children[0];
            if (object.type === 'Group') {
                // Remove all children of groups
                while(object.children.length > 0) {
                    const child = object.children[0];
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                    object.remove(child);
                }
            }
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
            scene.remove(object);
        }
        
        // Clear arrays
        enemies = [];
        playerLasers = [];
        enemyLasers = [];
        explosions = [];
        
        // Reset game state
        gameActive = false;
        shields = 100;
        distance = 0;
        speed = 50;
        enemiesKilled = 0;
        lastEnemySpawnDistance = 0;
        spawnRate = 1000;
        
        // Reset movement state
        moveState = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        currentVelocity = new THREE.Vector3(0, 0, 0);
        
        // Reset camera
        if (camera) {
            camera.position.set(0, 1.5, 5);
            camera.lookAt(0, 0, 0);
        }
    }
}

// Create stars for the background (ceiling open to space)
function createStarsBackground() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true
    });
    
    // Create star positions (1000 stars)
    const starsPositions = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 200;
        const y = Math.random() * 50 + 10; // Position stars above the tunnel
        const z = (Math.random() - 0.5) * 200;
        starsPositions.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Add a distant planet
    const planetGeometry = new THREE.SphereGeometry(30, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({
        color: 0x4444ff,
        emissive: 0x222244,
        shininess: 10,
        specular: 0x0077ff
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(-80, 60, -150);
    scene.add(planet);
}

// Create the U-shaped tunnel
function createTunnel() {
    tunnel = new THREE.Group();
    scene.add(tunnel);
    
    // Create a tunnel segment that will be repeated
    const tunnelSegmentLength = 20;
    const tunnelWidth = 8;
    const tunnelHeight = 8;
    
    // Tunnel materials
    const tunnelMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.3,
        emissive: 0x111111
    });
    
    // Floor
    const floorGeometry = new THREE.BoxGeometry(tunnelWidth, 0.5, tunnelSegmentLength);
    const floor = new THREE.Mesh(floorGeometry, tunnelMaterial);
    floor.position.set(0, -tunnelHeight/2, -tunnelSegmentLength/2);
    floor.receiveShadow = true;
    tunnel.add(floor);
    
    // Left wall
    const leftWallGeometry = new THREE.BoxGeometry(0.5, tunnelHeight, tunnelSegmentLength);
    const leftWall = new THREE.Mesh(leftWallGeometry, tunnelMaterial);
    leftWall.position.set(-tunnelWidth/2, 0, -tunnelSegmentLength/2);
    leftWall.receiveShadow = true;
    tunnel.add(leftWall);
    
    // Right wall
    const rightWallGeometry = new THREE.BoxGeometry(0.5, tunnelHeight, tunnelSegmentLength);
    const rightWall = new THREE.Mesh(rightWallGeometry, tunnelMaterial);
    rightWall.position.set(tunnelWidth/2, 0, -tunnelSegmentLength/2);
    rightWall.receiveShadow = true;
    tunnel.add(rightWall);
    
    // Add some detail to the tunnel
    addTunnelDetails(tunnel, tunnelWidth, tunnelHeight, tunnelSegmentLength);
    
    // Create multiple segments for the illusion of an endless tunnel
    for (let i = 1; i < 10; i++) {
        const segment = tunnel.clone();
        segment.position.z = -tunnelSegmentLength * i;
        scene.add(segment);
    }
}

// Add details to the tunnel for visual interest
function addTunnelDetails(tunnelSegment, width, height, length) {
    // Add ceiling lights
    const lightCount = 5;
    const lightSpacing = length / lightCount;
    
    for (let i = 0; i < lightCount; i++) {
        const lightGeometry = new THREE.BoxGeometry(width - 1, 0.1, 0.5);
        const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x66ffff });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(0, height/2 - 0.1, -i * lightSpacing);
        tunnelSegment.add(light);
    }
    
    // Add wall panels
    const panelCount = 8;
    const panelSpacing = length / panelCount;
    
    for (let i = 0; i < panelCount; i++) {
        // Left wall panels
        const leftPanelGeometry = new THREE.BoxGeometry(0.1, 2, 1);
        const leftPanelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            emissive: 0x111111,
            metalness: 0.9,
            roughness: 0.2
        });
        const leftPanel = new THREE.Mesh(leftPanelGeometry, leftPanelMaterial);
        leftPanel.position.set(-width/2 + 0.2, 0, -i * panelSpacing);
        tunnelSegment.add(leftPanel);
        
        // Right wall panels
        const rightPanel = leftPanel.clone();
        rightPanel.position.set(width/2 - 0.2, 0, -i * panelSpacing);
        tunnelSegment.add(rightPanel);
    }
}

// Create the player's spaceship
function createSpaceship() {
    // Simplified spaceship model using basic shapes
    spaceship = new THREE.Group();
    
    // Spaceship body
    const bodyGeometry = new THREE.ConeGeometry(0.5, 2, 8);
    bodyGeometry.rotateX(Math.PI / 2);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x3366cc, 
        shininess: 80,
        specular: 0x111111
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    spaceship.add(body);
    
    // Spaceship wings
    const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.8);
    const wingMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2255aa,
        shininess: 40,
        specular: 0x111111
    });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.set(0, -0.2, 0);
    wings.castShadow = true;
    spaceship.add(wings);
    
    // Spaceship engine glow
    const engineGlowGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.3, 8);
    engineGlowGeometry.rotateX(Math.PI / 2);
    const engineGlowMaterial = new THREE.MeshBasicMaterial({ color: 0x66aaff });
    const engineGlow = new THREE.Mesh(engineGlowGeometry, engineGlowMaterial);
    engineGlow.position.set(0, 0, 1);
    spaceship.add(engineGlow);
    
    // Position the spaceship
    spaceship.position.set(0, 0, 0);
    scene.add(spaceship);
    
    // Position camera relative to spaceship
    camera.position.set(0, 2, 5);
    camera.lookAt(spaceship.position);
}

// Create aiming reticle
function createReticle() {
    reticle = new THREE.Group();
    
    // Main reticle square
    const squareGeometry = new THREE.BoxGeometry(2.0, 2.0, 0.01);
    const squareMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        wireframe: true
    });
    const square = new THREE.Mesh(squareGeometry, squareMaterial);
    reticle.add(square);
    
    // Center dot
    const dotGeometry = new THREE.CircleGeometry(0.05, 16);
    const dotMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    reticle.add(dot);
    
    // Corner indicators
    const cornerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    
    // Create corner indicators
    const cornerLength = 0.3;
    const cornerWidth = 0.02;
    const cornerDistance = 1.0;
    
    // Top left corner
    const topLeftCorner = new THREE.Group();
    const topLeftVertical = new THREE.Mesh(
        new THREE.BoxGeometry(cornerWidth, cornerLength, 0.01),
        cornerMaterial
    );
    const topLeftHorizontal = new THREE.Mesh(
        new THREE.BoxGeometry(cornerLength, cornerWidth, 0.01),
        cornerMaterial
    );
    topLeftVertical.position.set(-cornerDistance, cornerDistance - cornerLength/2, 0);
    topLeftHorizontal.position.set(-cornerDistance + cornerLength/2, cornerDistance, 0);
    topLeftCorner.add(topLeftVertical);
    topLeftCorner.add(topLeftHorizontal);
    reticle.add(topLeftCorner);
    
    // Top right corner
    const topRightCorner = topLeftCorner.clone();
    topRightCorner.position.x = -topRightCorner.position.x;
    reticle.add(topRightCorner);
    
    // Bottom left corner
    const bottomLeftCorner = topLeftCorner.clone();
    bottomLeftCorner.position.y = -bottomLeftCorner.position.y;
    reticle.add(bottomLeftCorner);
    
    // Bottom right corner
    const bottomRightCorner = bottomLeftCorner.clone();
    bottomRightCorner.position.x = -bottomRightCorner.position.x;
    reticle.add(bottomRightCorner);
    
    // Position reticle far from the ship
    reticle.position.set(0, 0, -25);
    
    // Add to scene
    scene.add(reticle);
    
    // Add animation properties
    reticle.userData.animation = {
        pulseScale: 1,
        pulseSpeed: 2,
        rotationSpeed: 0.5,
        time: 0,
        lockedEnemy: null
    };
}

// Update the handleKeyDown function
function handleKeyDown(event) {
    if (!gameActive) return;
    
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            moveState.up = true;
            break;
        case 'ArrowDown':
        case 's':
            moveState.down = true;
            break;
        case 'ArrowLeft':
        case 'a':
            moveState.left = true;
            break;
        case 'ArrowRight':
        case 'd':
            moveState.right = true;
            break;
        case ' ':
            fireLaser();
            break;
        case 'Escape':
            showQuitModal();
            break;
    }
}

// Update the moveSpaceship function
function moveSpaceship() {
    if (!gameActive) return;

    // Calculate target velocity based on current move state
    const targetVelocity = new THREE.Vector3(0, 0, 0);
    if (moveState.left) targetVelocity.x = -maxSpeed;
    if (moveState.right) targetVelocity.x = maxSpeed;
    if (moveState.up) targetVelocity.y = maxSpeed;
    if (moveState.down) targetVelocity.y = -maxSpeed;

    // Smoothly interpolate current velocity towards target velocity
    currentVelocity.x += (targetVelocity.x - currentVelocity.x) * acceleration;
    currentVelocity.y += (targetVelocity.y - currentVelocity.y) * acceleration;

    // Apply deceleration when no input is given
    if (!moveState.left && !moveState.right) {
        currentVelocity.x *= (1 - deceleration);
    }
    if (!moveState.up && !moveState.down) {
        currentVelocity.y *= (1 - deceleration);
    }

    // Apply movement with reduced speed
    spaceship.position.x += currentVelocity.x * moveSpeed;
    spaceship.position.y += currentVelocity.y * moveSpeed;

    // Keep the ship within bounds
    spaceship.position.x = Math.max(-2, Math.min(2, spaceship.position.x));
    spaceship.position.y = Math.max(-2, Math.min(2, spaceship.position.y));

    // Update reticle position to follow spaceship
    reticle.position.x = spaceship.position.x;
    reticle.position.y = spaceship.position.y;
    reticle.position.z = spaceship.position.z - 25; // Keep reticle far from ship

    // Update reticle animation
    const animation = reticle.userData.animation;
    animation.time += 0.016; // Assuming 60fps

    // Pulse animation
    const pulseScale = 1 + Math.sin(animation.time * animation.pulseSpeed) * 0.1;
    reticle.scale.set(pulseScale, pulseScale, pulseScale);

    // Rotation animation
    reticle.rotation.z = Math.sin(animation.time * animation.rotationSpeed) * 0.1;

    // Slight spaceship rotation when moving for visual feedback
    if (moveState.left) {
        spaceship.rotation.z = Math.min(spaceship.rotation.z + 0.05, 0.2);
    } else if (moveState.right) {
        spaceship.rotation.z = Math.max(spaceship.rotation.z - 0.05, -0.2);
    } else {
        // Return to neutral rotation
        if (spaceship.rotation.z > 0) {
            spaceship.rotation.z -= 0.02;
        } else if (spaceship.rotation.z < 0) {
            spaceship.rotation.z += 0.02;
        }
    }

    // Update camera look-at without moving the camera
    camera.lookAt(spaceship.position);
}

// Fire a laser blast
function fireLaser() {
    const currentTime = clock.getElapsedTime();
    
    // Limit fire rate to 3 blasts per second (333ms between shots)
    if (currentTime - lastFireTime < 0.333) return;
    
    // Play laser sound
    laserSound.currentTime = 0;
    laserSound.play();
    
    // Create laser geometry
    const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    laserGeometry.rotateX(Math.PI / 2);
    
    const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);
    
    // Position laser at spaceship's position
    laser.position.set(
        spaceship.position.x,
        spaceship.position.y,
        spaceship.position.z - 1
    );
    
    scene.add(laser);
    playerLasers.push({
        mesh: laser,
        velocity: new THREE.Vector3(0, 0, -1), // Moving forward in negative z direction
        created: currentTime
    });
    
    lastFireTime = currentTime;
}

// Check if reticle is aligned with an enemy
function checkReticleAlignment() {
    let closestEnemy = null;
    let closestDistance = Infinity;
    
    // Find the closest enemy that's aligned with the reticle
    enemies.forEach(enemy => {
        // Calculate 2D distance (ignoring z) between reticle and enemy
        const dx = Math.abs(reticle.position.x - enemy.mesh.position.x);
        const dy = Math.abs(reticle.position.y - enemy.mesh.position.y);
        
        // Enemy is considered aligned if it's within a small radius of the reticle
        if (dx < 0.5 && dy < 0.5) { // Reduced from 0.8 to 0.5 for more precise targeting
            const distanceToEnemy = enemy.mesh.position.z - spaceship.position.z;
            
            // Only consider enemies in front of the ship
            if (distanceToEnemy < 0 && distanceToEnemy > -50 && distanceToEnemy < closestDistance) {
                closestDistance = distanceToEnemy;
                closestEnemy = enemy;
            }
        }
    });
    
    // Update reticle color and locked enemy
    const reticleMaterial = reticle.children[0].material;
    const animation = reticle.userData.animation;
    
    if (closestEnemy) {
        // Enemy aligned - change to green and lock onto enemy
        reticleMaterial.color.setHex(0x00ff00);
        animation.lockedEnemy = closestEnemy;
        
        // Immediately snap reticle to enemy position
        reticle.position.x = closestEnemy.mesh.position.x;
        reticle.position.y = closestEnemy.mesh.position.y;
        
        // Add lock-on effect
        const pulseScale = 1 + Math.sin(animation.time * 4) * 0.1;
        reticle.scale.set(pulseScale, pulseScale, pulseScale);
    } else {
        // No enemy aligned - change to red and reset position
        reticleMaterial.color.setHex(0xff0000);
        animation.lockedEnemy = null;
        
        // Return reticle to ship position
        reticle.position.x = spaceship.position.x;
        reticle.position.y = spaceship.position.y;
        
        // Normal pulse animation
        const pulseScale = 1 + Math.sin(animation.time * 2) * 0.1;
        reticle.scale.set(pulseScale, pulseScale, pulseScale);
    }
}

// Spawn a new enemy
function spawnEnemy() {
    // Create enemy ship
    const enemyGroup = new THREE.Group();
    
    // Enemy body
    const bodyGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    bodyGeometry.rotateX(-Math.PI / 2); // Facing the player
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xaa2222, 
        shininess: 40,
        specular: 0x111111
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    enemyGroup.add(body);
    
    // Enemy wings
    const wingGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.6);
    const wingMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x882222,
        shininess: 30
    });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.set(0, -0.1, 0);
    enemyGroup.add(wings);
    
    // Position the enemy at a random position in the tunnel
    const x = (Math.random() - 0.5) * 6; // Random X position
    const y = (Math.random() - 0.5) * 5; // Random Y position
    enemyGroup.position.set(x, y, -50); // Start far away
    
    scene.add(enemyGroup);
    
    // Add to enemies array
    enemies.push({
        mesh: enemyGroup,
        velocity: new THREE.Vector3(0, 0, 0.2 + Math.random() * 0.1), // Moving toward player
        lastFired: 0
    });
}

// Enemy fires a laser
function enemyFireLaser(enemy) {
    const currentTime = clock.getElapsedTime();
    
    // Create laser geometry
    const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    laserGeometry.rotateX(Math.PI / 2);
    
    const laserMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);
    
    // Position laser at enemy's position
    laser.position.copy(enemy.mesh.position);
    laser.position.z += 1;
    
    scene.add(laser);
    
    // Calculate direction toward player's current position
    const direction = new THREE.Vector3();
    direction.subVectors(spaceship.position, enemy.mesh.position).normalize();
    
    enemyLasers.push({
        mesh: laser,
        velocity: direction.multiplyScalar(0.5), // Speed of enemy laser
        created: currentTime
    });
}

// Update all game objects
function updateGameObjects(deltaTime) {
    if (!gameActive) return;
    
    // Update distance based on speed (100m/sec at speed 10)
    const distanceIncrement = (speed / 10) * 100 * deltaTime;
    distance += distanceIncrement;
    
    // Increase speed every 1500m (reduced from 2000m for more frequent speed increases)
    if (Math.floor(distance / 1500) > Math.floor((distance - distanceIncrement) / 1500)) {
        speed += 8; // Increased from 5 to 8 for faster speed progression
        // Also increase spawn rate
        spawnRate = Math.max(100, spawnRate - 40); // Reduced from 50 to 40 for more gradual spawn rate increase
    }
    
    // Update player lasers
    updatePlayerLasers(deltaTime);
    
    // Update enemies
    updateEnemies(deltaTime);
    
    // Update enemy lasers
    updateEnemyLasers(deltaTime);
    
    // Check for enemy spawning
    checkEnemySpawn();
    
    // Check if reticle is aligned with enemies
    checkReticleAlignment();
    
    // Update HUD elements
    updateHUD();
    
    // Update tunnel movement
    updateTunnel(deltaTime);
}

// Update the position of player lasers
function updatePlayerLasers(deltaTime) {
    for (let i = playerLasers.length - 1; i >= 0; i--) {
        const laser = playerLasers[i];
        
        // Move laser forward
        laser.mesh.position.add(laser.velocity.clone().multiplyScalar(deltaTime * 60));
        
        // Remove lasers that have traveled too far or hit enemies
        if (laser.mesh.position.z < -60 || checkLaserEnemyCollision(laser)) {
            scene.remove(laser.mesh);
            playerLasers.splice(i, 1);
        }
    }
}

// Update enemy positions and behaviors
function updateEnemies(deltaTime) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Move enemy toward player
        enemy.mesh.position.add(enemy.velocity.clone().multiplyScalar(deltaTime * 60));
        
        // Make the enemy fire at the player periodically
        const currentTime = clock.getElapsedTime();
        if (currentTime - enemy.lastFired > 1) { // Fire every second
            enemy.lastFired = currentTime;
            enemyFireLaser(enemy);
        }
        
        // Remove enemies that have passed the player
        if (enemy.mesh.position.z > 10) {
            scene.remove(enemy.mesh);
            enemies.splice(i, 1);
        }
        
        // Check for collision with player
        if (checkPlayerEnemyCollision(enemy)) {
            damagePlayer(10);
            createExplosion(enemy.mesh.position.clone());
            scene.remove(enemy.mesh);
            enemies.splice(i, 1);
        }
    }
}

// Update enemy lasers
function updateEnemyLasers(deltaTime) {
    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        const laser = enemyLasers[i];
        
        // Move laser
        laser.mesh.position.add(laser.velocity.clone().multiplyScalar(deltaTime * 60));
        
        // Remove lasers that have traveled too far
        if (laser.mesh.position.z > 10 || laser.mesh.position.z < -60 ||
            Math.abs(laser.mesh.position.x) > 10 || Math.abs(laser.mesh.position.y) > 10) {
            scene.remove(laser.mesh);
            enemyLasers.splice(i, 1);
        }
        
        // Check for collision with player
        if (checkLaserPlayerCollision(laser)) {
            damagePlayer(5);
            scene.remove(laser.mesh);
            enemyLasers.splice(i, 1);
        }
    }
}

// Check for collision between player laser and an enemy
function checkLaserEnemyCollision(laser) {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        
        // Simple distance-based collision detection
        const distance = laser.mesh.position.distanceTo(enemy.mesh.position);
        
        if (distance < 1) {
            // Create explosion effect
            createExplosion(enemy.mesh.position.clone());
            
            // Play explosion sound
            explosionSound.currentTime = 0;
            explosionSound.play();
            
            // Remove the enemy
            scene.remove(enemy.mesh);
            enemies.splice(i, 1);
            
            // Increment kill counter
            enemiesKilled++;
            
            return true;
        }
    }
    
    return false;
}

// Check for collision between player and an enemy
function checkPlayerEnemyCollision(enemy) {
    const distance = enemy.mesh.position.distanceTo(spaceship.position);
    return distance < 1.5;
}

// Check for collision between enemy laser and player
function checkLaserPlayerCollision(laser) {
    const distance = laser.mesh.position.distanceTo(spaceship.position);
    return distance < 1;
}

// Create explosion effect
function createExplosion(position) {
    // Create particle system for explosion
    const particleCount = 30;
    const particles = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        // Random positions in a sphere
        const x = (Math.random() - 0.5) * 2;
        const y = (Math.random() - 0.5) * 2;
        const z = (Math.random() - 0.5) * 2;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Orange/yellow colors for fire effect
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.5 * Math.random();
        colors[i * 3 + 2] = 0;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.position.copy(position);
    scene.add(particleSystem);
    
    // Create animation for explosion
    const explosionAnimation = {
        system: particleSystem,
        positions: positions,
        velocities: [],
        age: 0,
        maxAge: 1
    };
    
    // Initialize random velocities for particles
    for (let i = 0; i < particleCount; i++) {
        explosionAnimation.velocities.push({
            x: (Math.random() - 0.5) * 0.1,
            y: (Math.random() - 0.5) * 0.1,
            z: (Math.random() - 0.5) * 0.1
        });
    }
    
    // Update explosion function
    const updateExplosion = function(animation, deltaTime) {
        animation.age += deltaTime;
        
        if (animation.age >= animation.maxAge) {
            scene.remove(animation.system);
            return false;
        }
        
        // Update particle positions based on velocities
        for (let i = 0; i < particleCount; i++) {
            animation.positions[i * 3] += animation.velocities[i].x;
            animation.positions[i * 3 + 1] += animation.velocities[i].y;
            animation.positions[i * 3 + 2] += animation.velocities[i].z;
        }
        
        animation.system.geometry.attributes.position.needsUpdate = true;
        
        // Fade out particles as they age
        animation.system.material.opacity = 1 - (animation.age / animation.maxAge);
        
        return true;
    };
    
    // Add to list of active explosions
    explosions.push({
        animation: explosionAnimation,
        update: updateExplosion
    });
}

// Check if it's time to spawn a new enemy
function checkEnemySpawn() {
    if (distance - lastEnemySpawnDistance >= spawnRate) {
        spawnEnemy();
        lastEnemySpawnDistance = distance;
    }
}

// Update tunnel for infinite scrolling effect
function updateTunnel(deltaTime) {
    // Move all tunnel segments forward
    scene.children.forEach(child => {
        if (child.type === 'Group' && child !== spaceship && !enemies.find(e => e.mesh === child)) {
            child.position.z += speed * deltaTime * 0.3; // Increased from 0.2 to 0.3 for faster tunnel movement
            
            // If a segment has passed the player, reset it to the back
            if (child.position.z > 20) {
                child.position.z -= 20 * 10; // Reset to back of tunnel (10 segments * 20 length)
            }
        }
    });
}

// Update HUD elements with current game stats
function updateHUD() {
    document.getElementById('shields-value').style.width = `${shields}%`;
    document.getElementById('shields-percentage').textContent = `${Math.round(shields)}%`;
    document.getElementById('distance').textContent = `Distance: ${Math.floor(distance)}m`;
    document.getElementById('speed').textContent = `Speed: ${speed}`;
    document.getElementById('kills').textContent = `Enemies: ${enemiesKilled}`;
}

// Handle player damage
function damagePlayer(amount) {
    shields -= amount;
    
    // Play hit sound
    hitSound.currentTime = 0;
    hitSound.play();
    
    // Visual feedback for damage
    damageOverlay.style.opacity = '1';
    setTimeout(() => {
        damageOverlay.style.opacity = '0';
    }, 150);
    
    // Check for game over
    if (shields <= 0) {
        shields = 0;
        gameOver();
    }
}

// Game over function
function gameOver() {
    gameActive = false;
    
    // Play game over sound
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    
    // Pause game music
    gameMusic.pause();
    
    // Update final stats
    document.getElementById('final-distance').textContent = `${Math.floor(distance)}m`;
    document.getElementById('final-speed').textContent = speed;
    document.getElementById('final-kills').textContent = enemiesKilled;
    
    // Show game over modal
    gameOverModal.classList.add('active');
}

// Save player score
function saveScore() {
    const playerName = document.getElementById('player-name').value.trim() || 'Anonymous Pilot';
    
    // Save to localStorage
    const rankings = JSON.parse(localStorage.getItem('spaceStarRankings') || '[]');
    
    rankings.push({
        name: playerName,
        distance: Math.floor(distance),
        kills: enemiesKilled
    });
    
    // Sort by distance (highest first)
    rankings.sort((a, b) => b.distance - a.distance);
    
    // Keep only top 10
    const topRankings = rankings.slice(0, 10);
    
    localStorage.setItem('spaceStarRankings', JSON.stringify(topRankings));
    
    // Hide modal and return to menu
    gameOverModal.classList.remove('active');
    showMenuScreen();
    
    // Reload rankings
    loadRankings();
}

// Load rankings from localStorage
function loadRankings() {
    const rankings = JSON.parse(localStorage.getItem('spaceStarRankings') || '[]');
    const rankingList = document.getElementById('ranking-list');
    
    // Clear existing entries
    rankingList.innerHTML = '';
    
    if (rankings.length === 0) {
        rankingList.innerHTML = '<div class="ranking-item">No records yet</div>';
        return;
    }
    
    // Add each ranking entry
    rankings.forEach((ranking, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        
        rankingItem.innerHTML = `
            <span class="rank">${index + 1}</span>
            <span class="ranking-name">${ranking.name}</span>
            <span class="ranking-score">${ranking.distance}m</span>
        `;
        
        rankingList.appendChild(rankingItem);
    });
}

// Show quit confirmation modal
function showQuitModal() {
    if (!gameActive) return;
    
    quitModal.classList.add('active');
    gameActive = false; // Pause the game while modal is open
}

// Hide quit confirmation modal
function hideQuitModal() {
    quitModal.classList.remove('active');
    gameActive = true; // Resume the game
}

// Update the quitGame function
function quitGame() {
    quitModal.classList.remove('active');
    cleanupScene();
    showMenuScreen();
}

// Animation explosions array
let explosions = [];

// Main animation loop
function animate() {
    if (!gameActive) {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        return;
    }
    
    const deltaTime = Math.min(0.1, clock.getDelta()); // Cap to prevent large jumps
    
    // Update movement
    moveSpaceship();
    
    // Update all game objects
    updateGameObjects(deltaTime);
    
    // Update explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        const stillActive = explosion.update(explosion.animation, deltaTime);
        
        if (!stillActive) {
            explosions.splice(i, 1);
        }
    }
    
    // Render the scene
    renderer.render(scene, camera);
    
    // Continue animation loop
    requestAnimationFrame(animate);
}