import Zombie from '../entities/Zombie.js';
import Weapon from '../entities/Weapon.js';
import WeaponPickup from '../entities/WeaponPickup.js';
import Chest from '../entities/Chest.js';
import Powerup from '../entities/Powerup.js';
import Boss from '../entities/Boss.js';
import Skeleton from '../entities/Skeleton.js';
import Gargoyle from '../entities/Gargoyle.js';
import Demon from '../entities/Demon.js';
import AudioManager from '../utils/AudioManager.js';
import AudioControls from '../ui/AudioControls.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Variables de estado del juego
        this.score = 0;
        this.lives = 3;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.pointsMultiplier = 1;
        this.zombiesKilled = 0;
        
        // Variables del jugador
        this.isDead = false;
        this.isJumping = false;
        this.isThrowingWeapon = false;
        this.facingLeft = false;
        this.walkSoundPlaying = false;
        this.doubleJumping = false;
        
        // Variables para salto múltiple
        this.jumpCount = 0;
        this.maxJumps = 3; // Asegurar que se permiten hasta 3 saltos consecutivos
        this.hasDoubleJump = true;
        this.canDoubleJump = false;
        this.isFalling = false;
        
        // Sistema de daño
        this.hasArmor = true;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 2000; // 2 segundos de invulnerabilidad después de ser golpeado
        
        // Sistema de armas
        this.currentWeapon = 'Spear'; // Arma inicial
        this.weaponCooldown = 500; // ms entre disparos
        this.canThrow = true;
        this.weaponTypes = ['spear', 'dagger', 'torch', 'axe'];
        
        // Tamaño del nivel
        this.levelWidth = 3200; // El doble del ancho del fondo
        
        // Modo de depuración
        this.debugMode = false;
        
        // Inicializar variables para el juego
        this.score = 0;
        this.lives = 3;
        this.hasArmor = true;
        this.currentWeapon = 'Spear'; // Arma inicial
        this.isJumping = false;
        this.isFalling = false;
        this.isThrowingWeapon = false;
        this.isInvulnerable = false;
        this.isDead = false;
        this.walkSoundPlaying = false;
        this.facingLeft = false;
        this.canDoubleJump = false;
        this.doubleJumping = false;
        this.hasDoubleJump = true; // Habilidad de doble salto activada por defecto
        this.jumpCount = 0; // Contador para saltos múltiples
        this.maxJumps = 3; // Asegurar que se permiten hasta 3 saltos consecutivos
        this.jumpForce = -400; // Incrementar la fuerza de salto para mayor altura
        this.pointsMultiplier = 1;
        
        // Temporizadores
        this.timers = {};
    }

    create() {
        // Configurar mundo físico para el nivel más grande
        this.physics.world.setBounds(0, 0, this.levelWidth, 600);
        
        // Fondo del cementerio
        this.background = this.add.tileSprite(0, 0, 1600, 600, 'stage1-background')
            .setOrigin(0, 0)
            .setScrollFactor(0.2); // Parallax scrolling
        
        // Variables del juego
        this.score = 0;
        this.lives = 3;
        
        // Crear grupos para los elementos del escenario
        this.platforms = this.physics.add.staticGroup();
        this.decorations = this.add.group();
        
        // Crear el nivel
        this.createLevel();
        
        // Crear UI
        this.createUI();
        
        // Crear al jugador con el nuevo sprite
        this.player = this.physics.add.sprite(100, 450, 'arthur-idle');
        
        // Verificar si el sprite se cargó correctamente
        if (!this.textures.exists('arthur-idle')) {
            console.error('Error: No se pudo cargar la textura "arthur-idle"');
            return; // Evitar continuar si no existe la textura
        }
        
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        
        // Ajustar el tamaño del cuerpo de colisión para que se ajuste mejor al sprite
        this.player.body.setSize(30, 44);
        this.player.body.setOffset(5, 8);
        
        // Colisión entre el jugador y las plataformas
        this.physics.add.collider(this.player, this.platforms);
        
        // Configurar cámara para seguir al jugador
        this.cameras.main.setBounds(0, 0, this.levelWidth, 600);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setDeadzone(100, 200); // Zona muerta para evitar movimientos pequeños
        
        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Tecla para lanzar arma (tecla espaciadora)
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Instrucciones para el doble salto
        const jumpInstructions = this.add.text(this.cameras.main.width / 2, 50, 
            'Pulsa ↑ dos veces para hacer doble salto', {
            fontSize: '16px',
            fill: '#ffff00',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0).setOrigin(0.5);
        
        // Hacer que las instrucciones desaparezcan después de un tiempo
        this.time.delayedCall(8000, () => {
            this.tweens.add({
                targets: jumpInstructions,
                alpha: 0,
                duration: 1000,
                ease: 'Power2'
            });
        });
        
        // Inicializar AudioManager
        this.audioManager = new AudioManager(this);
        
        // Crear controles de audio
        this.audioControls = new AudioControls(this, this.audioManager);
        
        // Reproducir música del juego
        this.audioManager.playMusic('game-music', { volume: 0.5, loop: true });
        
        // Definir animaciones del jugador con los nuevos sprites
        
        console.log('Configurando animaciones del jugador...');
        
        // Verificar que las texturas estén cargadas
        const requiredTextures = ['arthur-idle', 'arthur-run', 'arthur-jump', 'arthur-throw', 'arthur-death', 'arthur-armor'];
        requiredTextures.forEach(texture => {
            if (this.textures.exists(texture)) {
                console.log(`Textura '${texture}' cargada correctamente`);
        } else {
                console.warn(`¡Textura '${texture}' no encontrada!`);
        }
        });
        
        // Animación de estado quieto (idle)
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('arthur-idle', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        console.log('Animación "idle" creada');
        
        // Animación de correr hacia la derecha
        this.anims.create({
            key: 'run-right',
            frames: this.anims.generateFrameNumbers('arthur-run', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        console.log('Animación "run-right" creada');
        
        // Animación de correr hacia la izquierda (mismos frames pero volteados)
        this.anims.create({
            key: 'run-left',
            frames: this.anims.generateFrameNumbers('arthur-run', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        console.log('Animación "run-left" creada');
        
        // Animación de salto
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('arthur-jump', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        console.log('Animación "jump" creada');
        
        // Animación de lanzar arma
        this.anims.create({
            key: 'throw',
            frames: this.anims.generateFrameNumbers('arthur-throw', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });
        console.log('Animación "throw" creada');
        
        // Animación de muerte
        this.anims.create({
            key: 'player_death',
            frames: this.anims.generateFrameNumbers('arthur-death', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: 0
        });
        console.log('Animación "player_death" creada');
        
        // Animación de pérdida de armadura
        this.anims.create({
            key: 'armor-break',
            frames: this.anims.generateFrameNumbers('arthur-armor', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });
        console.log('Animación "armor-break" creada');
        
        // Iniciar con la animación idle
        this.player.anims.play('idle', true);
        console.log('Primera animación "idle" iniciada');
        
        // Eventos para las animaciones - versión mejorada
        // Cada evento de animación completa tiene su nombre exacto como está definido
        
        // Evento para cuando termina la animación de lanzar arma
        this.player.on('animationcomplete-throw', () => {
            console.log('Animación de lanzamiento completada');
            this.isThrowingWeapon = false;
            
            // Volver a la animación apropiada
            if (this.player.body.touching.down) {
                if (this.player.body.velocity.x !== 0) {
                    this.player.anims.play(this.facingLeft ? 'run-left' : 'run-right', true);
                } else {
                    this.player.anims.play('idle', true);
                }
            } else {
                this.player.anims.play('jump', true);
            }
        });
        
        // Evento para cuando termina la animación de muerte
        this.player.on('animationcomplete-player_death', () => {
            console.log('Animación de muerte completada');
            // Detener en el último frame
            if (this.player.anims.currentAnim) {
                this.player.anims.pause();
            }
        });
        
        // Evento para cuando termina la animación de ruptura de armadura
        this.player.on('animationcomplete-armor-break', () => {
            console.log('Animación de ruptura de armadura completada');
            // Volver a la animación apropiada
            if (this.player.body.touching.down) {
                this.player.anims.play('idle', true);
            } else {
                this.player.anims.play('jump', true);
            }
        });
        
        // Crear sistema de partículas mejorado para el doble salto
        this.createJumpParticleEffects();
        
        // Añadir efectos de sonido
        this.jumpSound = null;
        if (this.cache.audio.exists('double-jump')) {
            this.jumpSound = this.sound.add('double-jump', { volume: 0.4 });
        }
        
        // Grupo de zombies
        this.zombies = this.add.group({
            classType: Zombie,
            runChildUpdate: true // Esto llamará automáticamente al método update de cada zombie
        });
        
        // Grupo de esqueletos
        this.skeletons = this.add.group({
            classType: Skeleton,
            runChildUpdate: true // Esto llamará automáticamente al método update de cada esqueleto
        });
        
        // Grupo de gárgolas
        this.gargoyles = this.add.group({
            classType: Gargoyle,
            runChildUpdate: true // Esto llamará automáticamente al método update de cada gárgola
        });
        
        // Grupo de demonios
        this.demons = this.add.group({
            classType: Demon,
            runChildUpdate: true // Esto llamará automáticamente al método update de cada demonio
        });
        
        // Grupos para el sistema de armas
        this.weapons = this.physics.add.group({
            classType: Weapon,
            runChildUpdate: true
        });
        
        this.weaponPickups = this.physics.add.group({
            classType: WeaponPickup
        });
        
        // Configurar spawns de zombies
        this.zombieSpawnPoints = [
            { x: 400, y: 450 },
            { x: 800, y: 450 },
            { x: 1200, y: 450 },
            { x: 1600, y: 450 },
            { x: 2000, y: 450 },
            { x: 2400, y: 450 },
            { x: 2800, y: 450 }
        ];
        
        // Configurar spawns de esqueletos (diferentes a los de los zombies)
        this.skeletonSpawnPoints = [
            { x: 600, y: 450 },
            { x: 1000, y: 450 },
            { x: 1400, y: 450 },
            { x: 1800, y: 450 },
            { x: 2200, y: 450 },
            { x: 2600, y: 450 },
            { x: 3000, y: 450 }
        ];
        
        // Configurar spawns de gárgolas (posiciones elevadas)
        this.gargoyleSpawnPoints = [
            { x: 500, y: 350 },  // Más alto que otros enemigos
            { x: 900, y: 350 },
            { x: 1300, y: 350 },
            { x: 1700, y: 350 },
            { x: 2100, y: 350 },
            { x: 2500, y: 350 },
            { x: 2900, y: 350 }
        ];
        
        // Configurar spawns de demonios
        this.demonSpawnPoints = [
            { x: 700, y: 450 },
            { x: 1100, y: 450 },
            { x: 1500, y: 450 },
            { x: 1900, y: 450 },
            { x: 2300, y: 450 },
            { x: 2700, y: 450 },
            { x: 3100, y: 450 }
        ];
        
        // Timer para spawn de zombies (más frecuente para pruebas)
        this.time.addEvent({
            delay: 2000, // Cada 2 segundos en lugar de 5
            callback: this.spawnZombie,
            callbackScope: this,
            loop: true
        });
        
        // Timer para spawn de esqueletos (menos frecuente que los zombies)
        this.time.addEvent({
            delay: 4000, // Cada 4 segundos
            callback: this.spawnSkeleton,
            callbackScope: this,
            loop: true
        });

        // Timer para spawn de gárgolas (menos frecuente que los zombies)
        this.time.addEvent({
            delay: 5000, // Cada 5 segundos
            callback: this.spawnGargoyle,
            callbackScope: this,
            loop: true
        });
        
        // Spawnear un zombie inicial para pruebas
        this.spawnZombie();
        
        // Spawnear un esqueleto inicial para pruebas
        this.spawnSkeleton();
        
        // Spawnear una gárgola inicial para pruebas
        this.spawnGargoyle();
        
        // Colisiones entre zombies y plataformas
        this.physics.add.collider(this.zombies, this.platforms);
        
        // Colisión entre jugador y zombies
        this.physics.add.overlap(
            this.player,
            this.zombies,
            this.handlePlayerZombieCollision,
            null,
            this
        );
        
        // Colisión entre esqueletos y plataformas
        this.physics.add.collider(this.skeletons, this.platforms);
        
        // Colisión entre jugador y esqueletos
        this.physics.add.overlap(
            this.player,
            this.skeletons,
            this.handlePlayerSkeletonCollision,
            null,
            this
        );
        
        // Colisión entre armas y zombies
        this.physics.add.overlap(
            this.weapons,
            this.zombies,
            this.handleWeaponZombieCollision,
            null,
            this
        );
        
        // Colisión entre armas y esqueletos
        this.physics.add.overlap(
            this.weapons,
            this.skeletons,
            this.handleWeaponSkeletonCollision,
            null,
            this
        );
        
        // Colisión entre gárgolas y plataformas
        this.physics.add.collider(this.gargoyles, this.platforms);
        
        // Colisión entre jugador y gárgolas
        this.physics.add.overlap(
            this.player,
            this.gargoyles,
            this.handlePlayerGargoyleCollision,
            null,
            this
        );
        
        // Colisión entre armas y gárgolas
        this.physics.add.overlap(
            this.weapons,
            this.gargoyles,
            this.handleWeaponGargoyleCollision,
            null,
            this
        );
        
        // Colisión entre demonios y plataformas
        // this.physics.add.collider(this.demons, this.platforms);
        
        // Colisión entre jugador y demonios
        // this.physics.add.overlap(
        //    this.player,
        //    this.demons,
        //    this.handlePlayerDemonCollision,
        //    null,
        //    this
        // );
        
        // Colisión entre armas y demonios
        // this.physics.add.overlap(
        //    this.weapons,
        //    this.demons,
        //    this.handleWeaponDemonCollision,
        //    null,
        //    this
        // );
        
        // Colisión entre armas y plataformas
        this.physics.add.collider(
            this.weapons,
            this.platforms,
            this.handleWeaponPlatformCollision,
            null,
            this
        );
        
        // Colisión entre jugador y pickups de armas
        this.physics.add.overlap(
            this.player,
            this.weaponPickups,
            this.handlePlayerPickupCollision,
            null,
            this
        );
        
        // Añadir sprite de armadura
        this.armorSprite = this.add.sprite(this.player.x, this.player.y, 'arthur-armor');
        this.armorSprite.setVisible(false);
        
        // Crear pickup inicial de arma para pruebas
        this.spawnWeaponPickup(300, 450, 'dagger');
        
        // Pickups adicionales para pruebas - uno de cada tipo
        this.spawnWeaponPickup(350, 450, 'spear');
        this.spawnWeaponPickup(400, 450, 'torch');
        this.spawnWeaponPickup(450, 450, 'axe');
        
        console.log('Pickups de armas creados para pruebas');
        
        // Test de armas - crear una para probar
        const testWeapon = new Weapon(this, 250, 450, 'spear');
        testWeapon.fire(250, 450, 1); // Lanzarla hacia la derecha
        this.weapons.add(testWeapon);
        console.log('Arma de prueba creada');
        
        // Grupos para el sistema de cofres y power-ups
        this.chests = this.physics.add.staticGroup({
            classType: Chest,
            runChildUpdate: false
        });
        
        this.powerups = this.physics.add.group({
            classType: Powerup,
            runChildUpdate: true
        });
        
        // Colisión entre power-ups y plataformas
        this.physics.add.collider(this.powerups, this.platforms);
        
        // Colisión entre jugador y power-ups
        this.physics.add.overlap(
            this.player,
            this.powerups,
            this.handlePlayerPowerupCollision,
            null,
            this
        );
        
        // Colisión entre armas y cofres
        this.physics.add.collider(
            this.weapons,
            this.chests,
            this.handleWeaponChestCollision,
            null,
            this
        );
        
        // Añadir cofres al nivel
        this.spawnChests();
        
        console.log('Verificando texturas del jefe...');
        // Eliminar la llamada a verifyBossTextures ya que esta función no existe
        // this.verifyBossTextures();
        
        console.log('Creando jefe final...');
        // Crear el jefe final al final del nivel
        this.createBoss();
        console.log('Jefe final creado, estado:', this.boss ? `activo=${this.boss.active}, estado=${this.boss.state}` : 'null');
        
        // Inicializar modo de depuración - activar para ver información y efectos de depuración
        this.debugMode = false;
        
        // Crear gráficos de depuración para trazado de líneas, etc.
        if (this.debugMode) {
            this.debugGraphics = this.add.graphics();
            this.debugGraphics.setDepth(100); // Por encima de todo
            
            // Texto de depuración para mostrar información durante el juego
            this.debugText = this.add.text(16, 150, '', {
                fontSize: '18px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 5, y: 5 }
            });
            this.debugText.setScrollFactor(0); // Fijo en la cámara
            this.debugText.setDepth(100);
        }

        // Asegurar que el audio está correctamente inicializado
        try {
            // Inicializar AudioManager si no existe
            if (!this.audioManager) {
                console.log('Inicializando AudioManager...');
                this.audioManager = new AudioManager(this);
                
                // Verificar si se cargaron los sonidos
                const soundsToCheck = ['jump', 'double-jump', 'throw', 'player-hurt', 'pickup', 'powerup'];
                soundsToCheck.forEach(sound => {
                    if (this.cache.audio.exists(sound)) {
                        console.log(`Sonido '${sound}' cargado correctamente`);
                    } else {
                        console.warn(`Sonido '${sound}' no encontrado en cache`);
                    }
                });
            }
            
            // Crear controles de audio
            this.audioControls = new AudioControls(this, this.audioManager);
            
            // Reproducir música del juego
            if (this.audioManager) {
                this.audioManager.playMusic('game-music', { volume: 0.5, loop: true });
                console.log('Música del juego iniciada');
            }
        } catch (error) {
            console.error('Error inicializando audio:', error);
        }

        // Inicializar grupos de decoraciones
        this.trees = this.add.group();
        this.graves = this.add.group();
        this.crosses = this.add.group();

        // Añadir elementos a los grupos
        this.trees.add(this.add.image(300, 520, 'dead-tree').setOrigin(0.5, 1));
        this.graves.add(this.add.image(150, 520, 'tombstone1').setOrigin(0.5, 1));
        this.crosses.add(this.add.image(400, 520, 'cross').setOrigin(0.5, 1));

        // Ajustar posición de elementos para alinearlos con el suelo
        this.trees.getChildren().forEach(tree => {
            tree.setY(this.cameras.main.height - tree.height);
        });
        this.graves.getChildren().forEach(grave => {
            grave.setY(this.cameras.main.height - grave.height);
        });
        this.crosses.getChildren().forEach(cross => {
            cross.setY(this.cameras.main.height - cross.height);
        });

        // Inicializar sistema de puntuación
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'SCORE: 0', { fontSize: '32px', fill: '#FFF' });
    }

    // Método para crear el nivel
    createLevel() {
        // Piso principal - plataformas extendidas a lo largo del nivel
        for (let x = 0; x < this.levelWidth; x += 256) {
            // Piso base con tierra
            this.platforms.create(x, this.cameras.main.height, 'extended-ground').setOrigin(0, 1).refreshBody();
        }
        
        // Plataformas elevadas
        // Primera sección (0-800px)
        this.platforms.create(200, 450, 'platform');
        this.platforms.create(350, 350, 'platform');
        this.platforms.create(600, 380, 'platform');
        
        // Segunda sección (800-1600px)
        this.platforms.create(900, 450, 'platform');
        this.platforms.create(1100, 350, 'platform');
        this.platforms.create(1300, 300, 'platform');
        this.platforms.create(1500, 400, 'platform');
        
        // Tercera sección (1600-2400px)
        this.platforms.create(1800, 450, 'platform');
        this.platforms.create(2000, 350, 'platform');
        this.platforms.create(2200, 400, 'platform');
        this.platforms.create(2400, 300, 'platform');
        
        // Cuarta sección (2400-3200px)
        this.platforms.create(2600, 350, 'platform');
        this.platforms.create(2800, 400, 'platform');
        this.platforms.create(3000, 300, 'platform');
        
        // Añadir más plataformas para los cofres
        this.platforms.create(500, 350, 'platform');
        this.platforms.create(1000, 300, 'platform');
        this.platforms.create(1700, 350, 'platform');
        this.platforms.create(2300, 350, 'platform');
        this.platforms.create(2900, 350, 'platform');
        
        // Añadir decoraciones: lápidas y árboles muertos
        // Primera sección
        this.addTombstone(150, 520, 1);
        this.addTombstone(400, 520, 2);
        this.addTombstone(650, 520, 3);
        this.addDeadTree(300, 520);
        
        // Segunda sección
        this.addTombstone(950, 520, 3);
        this.addTombstone(1150, 520, 1);
        this.addDeadTree(1400, 520);
        this.addTombstone(1550, 520, 2);
        
        // Tercera sección
        this.addDeadTree(1750, 520);
        this.addTombstone(1900, 520, 1);
        this.addTombstone(2100, 520, 3);
        this.addTombstone(2300, 520, 2);
        
        // Cuarta sección
        this.addDeadTree(2500, 520);
        this.addTombstone(2700, 520, 3);
        this.addTombstone(2900, 520, 1);
        this.addDeadTree(3050, 520);
    }
    
    // Métodos para añadir decoraciones
    addTombstone(x, y, type) {
        this.decorations.add(
            this.add.image(x, y, `tombstone${type}`).setOrigin(0.5, 1)
        );
    }
    
    addDeadTree(x, y) {
        this.decorations.add(
            this.add.image(x, y, 'dead-tree').setOrigin(0.5, 1)
        );
    }

    // Método para crear efectos de partículas de salto
    createJumpParticleEffects() {
        try {
            // Crear un único grupo de partículas para todas las animaciones de salto
            this.jumpParticles = this.add.particles('particle');
            
            // Emisor principal para saltos (configuración simple para evitar errores)
            this.jumpEmitter = this.jumpParticles.createEmitter({
                x: 0,
                y: 0,
                speed: { min: 40, max: 100 },
                angle: { min: 230, max: 310 },
                scale: { start: 0.4, end: 0 },
                lifespan: 500,
                quantity: 10,
                blendMode: 'ADD',
                on: false
            });
            
            // Emisor para aterrizajes (configuración simple para evitar errores)
            this.landingEmitter = this.jumpParticles.createEmitter({
                x: 0,
                y: 0,
                speed: { min: 20, max: 60 },
                angle: { min: 230, max: 310 },
                scale: { start: 0.2, end: 0 },
                lifespan: 400,
                quantity: 5,
                on: false
            });
            
            console.log('Sistema básico de partículas creado');
        } catch (error) {
            console.error('Error al crear efectos de partículas de salto:', error);
        }
    }
    
    // Método para mostrar partículas básicas de salto
    showJumpParticles() {
        if (!this.jumpParticles || !this.jumpEmitter) return;
        
        try {
            // Configurar la posición del emisor en el jugador
            this.jumpEmitter.setPosition(this.player.x, this.player.y + 20);
            
            // Emitir partículas
            this.jumpEmitter.explode();
            
            console.log('Mostrando partículas de salto básicas');
        } catch (error) {
            console.error('Error al mostrar partículas de salto:', error);
        }
    }
    
    // Método para mostrar partículas intensas para salto alto
    showJumpParticlesWithIntensity(intensity) {
        if (!this.jumpParticles || !this.jumpEmitter) return;
        
        try {
            // Configurar el emisor con mayor cantidad según la intensidad
            const quantity = Math.floor(10 * intensity);
            this.jumpEmitter.setQuantity(quantity);
            this.jumpEmitter.setPosition(this.player.x, this.player.y + 20);
            
            // Emitir partículas con más velocidad para saltos intensos
            this.jumpEmitter.setSpeed({ min: 40 * intensity, max: 100 * intensity });
            this.jumpEmitter.explode();
            
            // Restaurar cantidad predeterminada
            this.jumpEmitter.setQuantity(10);
            this.jumpEmitter.setSpeed({ min: 40, max: 100 });
            
            console.log(`Mostrando partículas de salto con intensidad ${intensity}`);
        } catch (error) {
            console.error('Error al mostrar partículas de salto con intensidad:', error);
        }
    }
    
    // Método para mostrar partículas al aterrizar
    showLandingParticles() {
        if (!this.jumpParticles || !this.landingEmitter) return;
        
        try {
            // Configurar y emitir partículas de aterrizaje
            this.landingEmitter.setPosition(this.player.x, this.player.y + 25);
            this.landingEmitter.explode();
            
            console.log('Mostrando partículas de aterrizaje');
        } catch (error) {
            console.error('Error al mostrar partículas de aterrizaje:', error);
        }
    }

    spawnZombie() {
        // Seleccionar un punto de spawn aleatorio
        const spawnPoint = Phaser.Utils.Array.GetRandom(this.zombieSpawnPoints);
        
        // Verificar si hay un jugador cerca (para no spawnear zombies muy cerca del jugador)
        const distanceToPlayer = Phaser.Math.Distance.Between(
            spawnPoint.x, spawnPoint.y,
            this.player.x, this.player.y
        );
        
        console.log('Intentando spawnear zombie. Distancia al jugador:', distanceToPlayer);
        
        if (distanceToPlayer > 300) { // Solo spawnear si el jugador está lejos
            console.log('Spawneando zombie en:', spawnPoint.x, spawnPoint.y);
            const zombie = new Zombie(this, spawnPoint.x, spawnPoint.y);
            this.zombies.add(zombie);
            zombie.emerge();
        } else {
            console.log('Zombie demasiado cerca del jugador, no spawneando');
        }
    }
    
    spawnSkeleton() {
        try {
            // Seleccionar un punto de spawn aleatorio
            const spawnPoint = Phaser.Utils.Array.GetRandom(this.skeletonSpawnPoints);
            
            // Verificar si hay un jugador cerca (para no spawnear esqueletos muy cerca del jugador)
            const distanceToPlayer = Phaser.Math.Distance.Between(
                spawnPoint.x, spawnPoint.y,
                this.player.x, this.player.y
            );
            
            console.log('Intentando spawnear esqueleto. Distancia al jugador:', distanceToPlayer);
            
            if (distanceToPlayer > 300) { // Solo spawnear si el jugador está lejos
                console.log('Spawneando esqueleto en:', spawnPoint.x, spawnPoint.y);
                const skeleton = new Skeleton(this, spawnPoint.x, spawnPoint.y);
                this.skeletons.add(skeleton);
                
                // Los esqueletos no emergen automáticamente como los zombies
                // Se activan cuando el jugador se acerca a ellos
            } else {
                console.log('Esqueleto demasiado cerca del jugador, no spawneando');
            }
        } catch (error) {
            console.error('Error al spawnear esqueleto:', error);
        }
    }
    
    spawnGargoyle() {
        try {
            // Seleccionar un punto de spawn aleatorio
            const spawnPoint = Phaser.Utils.Array.GetRandom(this.gargoyleSpawnPoints);
            
            // Verificar si hay un jugador cerca (para no spawnear gárgolas muy cerca del jugador)
            const distanceToPlayer = Phaser.Math.Distance.Between(
                spawnPoint.x, spawnPoint.y,
                this.player.x, this.player.y
            );
            
            console.log('Intentando spawnear gárgola. Distancia al jugador:', distanceToPlayer);
            
            if (distanceToPlayer > 300) { // Solo spawnear si el jugador está lejos
                console.log('Spawneando gárgola en:', spawnPoint.x, spawnPoint.y);
                const gargoyle = new Gargoyle(this, spawnPoint.x, spawnPoint.y);
                this.gargoyles.add(gargoyle);
                
                // Las gárgolas no emergen automáticamente como los zombies
                // Se activan cuando el jugador se acerca a ellas
            } else {
                console.log('Gárgola demasiado cerca del jugador, no spawneando');
            }
        } catch (error) {
            console.error('Error al spawnear gárgola:', error);
        }
    }
    
    spawnDemon() {
        try {
        // Seleccionar un punto de spawn aleatorio
            const spawnPoint = Phaser.Utils.Array.GetRandom(this.demonSpawnPoints);
        
            // Verificar si hay un jugador cerca (para no spawnear demonios muy cerca del jugador)
        const distanceToPlayer = Phaser.Math.Distance.Between(
            spawnPoint.x, spawnPoint.y,
            this.player.x, this.player.y
        );
        
            console.log('Intentando spawnear demonio. Distancia al jugador:', distanceToPlayer);
        
        if (distanceToPlayer > 300) { // Solo spawnear si el jugador está lejos
                console.log('Spawneando demonio en:', spawnPoint.x, spawnPoint.y);
                const demon = new Demon(this, spawnPoint.x, spawnPoint.y);
                this.demons.add(demon);
                
                // Los demonios no emergen automáticamente como los zombies
                // Se activan cuando el jugador se acerca a ellos
        } else {
                console.log('Demonio demasiado cerca del jugador, no spawneando');
            }
        } catch (error) {
            console.error('Error al spawnear demonio:', error);
        }
    }
    
    // Métodos de colisión entre jugador y enemigos - versión simplificada
    handlePlayerZombieCollision(player, zombie) {
        console.log('¡Colisión con zombie!');
        if (zombie.active && !this.isInvulnerable && !this.isDead) {
            this.applyPlayerDamage();
        }
    }
    
    handlePlayerSkeletonCollision(player, skeleton) {
        console.log('¡Colisión con esqueleto!');
        if (skeleton.active && !this.isInvulnerable && !this.isDead) {
            this.applyPlayerDamage();
        }
    }
    
    handlePlayerGargoyleCollision(player, gargoyle) {
        console.log('¡Colisión con gárgola!');
        if (gargoyle.active && !this.isInvulnerable && !this.isDead) {
            this.applyPlayerDamage();
        }
    }
    
    handlePlayerDemonCollision(player, demon) {
        console.log('¡Colisión con demonio!');
        if (demon.active && !this.isInvulnerable && !this.isDead) {
            this.applyPlayerDamage();
        }
    }
    
    // Método centralizado para aplicar daño
    applyPlayerDamage() {
        console.log('Aplicando daño al jugador');
        // Establecer invulnerabilidad para evitar daño múltiple
        this.isInvulnerable = true;
        
        // Reproducir sonido de daño
        if (this.audioManager) {
            this.audioManager.playSfx('hit', { volume: 0.6 });
        }
        
        // Efecto visual de daño (parpadeo)
        this.tweens.add({
            targets: this.player,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.player.alpha = 1;
            }
        });
        
        // Si tiene armadura, perderla
        if (this.hasArmor) {
            this.hasArmor = false;
            
            console.log('Armadura perdida');
            
            // En lugar de reproducir la animación que causa error, 
            // simplemente cambiamos la textura directamente
            this.player.setTexture('arthur-underwear-idle');
            
            // Reproducir el sonido de ruptura de armadura si está disponible
            if (this.audioManager) {
                this.audioManager.playSfx('armor-break', { volume: 0.6 });
            }
            
            // Volver a la animación apropiada
            if (this.player.body.touching.down) {
                this.player.anims.play('idle', true);
            } else {
                this.player.anims.play('jump', true);
            }
            
            // Mostrar el efecto de ruptura de armadura
            this.showArmorBreakEffect();
        } else {
            // Restar una vida
            this.lives--;
            this.updateLivesText();
            console.log('Vida perdida. Vidas restantes:', this.lives);
            
            // Si no quedan vidas, game over
            if (this.lives <= 0) {
                this.isDead = true;
                this.playerDeath();
                return;
            }
        }
        
        // Restablecer invulnerabilidad después de un tiempo
        this.time.delayedCall(1500, () => {
            if (!this.isDead) {
                this.isInvulnerable = false;
                console.log('Invulnerabilidad terminada');
            }
        });
    }
    
    handleWeaponZombieCollision(weapon, zombie) {
        try {
            // Verificar que tanto el arma como el zombie estén activos
            if (!weapon || !zombie || !weapon.active || !zombie.active) return;
            
            // Solo procesar si el zombie está activo y el arma no está ya impactando
            if (zombie.isActive && !weapon.isImpacting) {
                console.log('Impacto de arma detectado con zombie');
                
                // Aplicar daño al zombie
                const zombieMuerto = zombie.takeDamage(weapon.damage);
                
                // Hacer que el arma impacte
                weapon.impact();
                
                // Si el zombie murió, añadir puntos y posible drop
                if (zombieMuerto) {
                    // Añadir puntos con multiplicador
                    const pointsEarned = 100 * this.pointsMultiplier;
                    this.score += pointsEarned;
                    this.updateScoreText();
                    
                    // Incrementar contador de zombies eliminados
                    this.zombiesKilled++;
                    
                    // Mostrar texto de puntos
                    this.showFloatingText(
                        zombie.x, 
                        zombie.y - 30, 
                        `+${pointsEarned}`, 
                        0xFFD700
                    );
                    
                    // Probabilidad de soltar un pickup
                    const rand = Math.random();
                    if (rand < 0.1) { // 10% de probabilidad de cofre
                        this.spawnRandomChest(zombie.x, zombie.y);
                    } else if (rand < 0.3) { // 20% de probabilidad de arma
                        this.spawnWeaponPickup(zombie.x, zombie.y);
                    }
                }
            }
        } catch (error) {
            console.error('Error en handleWeaponZombieCollision:', error);
        }
    }

    // Método para mostrar el efecto de ruptura de armadura
    showArmorBreakEffect() {
        try {
            // Crear partículas para el efecto de ruptura
            const particles = this.add.particles('particle');
            
            // Configurar el emisor de partículas
            const emitter = particles.createEmitter({
                x: this.player.x,
                y: this.player.y,
                speed: { min: 50, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 0 },
                lifespan: 500,
                quantity: 20,
                blendMode: 'ADD'
            });
            
            // Emitir las partículas de una vez
            emitter.explode();
            
            // Destruir el emisor después de un tiempo
            this.time.delayedCall(800, () => {
                particles.destroy();
            });
        } catch (error) {
            console.error('Error en showArmorBreakEffect:', error);
        }
    }

    // Método para manejar colisión entre armas y esqueletos
    handleWeaponSkeletonCollision(weapon, skeleton) {
        try {
            // Verificar que tanto el arma como el esqueleto estén activos
            if (!weapon || !skeleton || !weapon.active || !skeleton.active) return;
            
            // Solo procesar si el esqueleto está activo y el arma no está ya impactando
            if (skeleton.isActive && !weapon.isImpacting) {
                console.log('Impacto de arma detectado con esqueleto');
                
                // Aplicar daño al esqueleto
                const skeletonMuerto = skeleton.takeDamage(weapon.damage);
                
                // Hacer que el armaimpacte
                weapon.impact();
                
                // Si el esqueleto murió, añadir puntos y posible drop
                if (skeletonMuerto) {
                    // Añadir puntos con multiplicador (esqueletos valen más que zombies)
                    const pointsEarned = 200 * this.pointsMultiplier;
                    this.score += pointsEarned;
                    this.updateScoreText();
                    
                    // Incrementar contador de zombies eliminados (usamos el mismo contador)
                    this.zombiesKilled++;
                    
                    // Mostrar texto de puntos
                    this.showFloatingText(
                        skeleton.x, 
                        skeleton.y - 30, 
                        `+${pointsEarned}`, 
                        0xFFD700
                    );
                    
                    // Probabilidad de soltar un pickup de arma o generar un cofre (esqueletos tienen mejor loot)
                    const rand = Math.random();
                    if (rand < 0.15) { // 15% de probabilidad de cofre
                        this.spawnRandomChest(skeleton.x, skeleton.y);
                    } else if (rand < 0.4) { // 25% de probabilidad de arma
                        this.spawnWeaponPickup(skeleton.x, skeleton.y);
                    }
                    
                    // Cada 10 enemigos eliminados, aumentar el multiplicador de puntos
                    if (this.zombiesKilled % 10 === 0) {
                        this.increasePointsMultiplier();
                    }
                }
            }
        } catch (error) {
            console.error('Error en handleWeaponSkeletonCollision:', error);
        }
    }

    handleWeaponGargoyleCollision(weapon, gargoyle) {
        try {
            if (gargoyle.isPetrified && gargoyle.isImmortal) {
                // Si está petrificada e inmortal, la arma simplemente rebota
                weapon.deflect();
                return;
            }
            
            console.log('Arma golpea a gárgola');
            
            // Aplicar daño a la gárgola
            if (gargoyle.takeDamage) {
                gargoyle.takeDamage(weapon.damage);
            }
            
            // Si el arma no es penetrante, destruirla al impactar
            if (!weapon.isPenetrating) {
                weapon.handleImpact();
            }
            
            // Actualizar puntuación
            this.addPoints(50);
        } catch (error) {
            console.error('Error en handleWeaponGargoyleCollision:', error);
        }
    }
    
    handleWeaponDemonCollision(weapon, demon) {
        try {
            if (demon.isImmortal) {
                // Si está en estado inmortal, el arma simplemente rebota
                weapon.deflect();
                return;
            }
            
            console.log('Arma golpea a demonio');
            
            // Aplicar daño al demonio
            if (demon.takeDamage) {
                demon.takeDamage(weapon.damage);
            }
            
            // Si el arma no es penetrante, destruirla al impactar
            if (!weapon.isPenetrating) {
                weapon.handleImpact();
            }
            
            // Actualizar puntuación
            this.addPoints(100);
        } catch (error) {
            console.error('Error en handleWeaponDemonCollision:', error);
        }
    }
    
    playerDeath() {
        try {
            console.log('El jugador ha muerto');
            
            // Asegurar que se establezca el estado de muerte
            this.isDead = true;
            
            // Detener al jugador y reproducir animación de muerte
            this.player.setVelocity(0, 0);
            this.player.play('player_death');
            
            // Detener cualquier sonido que se esté reproduciendo
            if (this.audioManager) {
                console.log('Deteniendo todos los sonidos');
                this.audioManager.stopAllSounds();
                // Reproducir sonido de muerte
                this.audioManager.playSound('death', { volume: 0.7 });
            }
            
            // Pausar la física del juego
            this.physics.pause();
            
            // Mostrar texto de game over centrado en la cámara
            const gameOverText = this.add.text(
                this.cameras.main.worldView.centerX,
                this.cameras.main.worldView.centerY - 50,
                'GAME OVER',
                {
                    fontSize: '64px',
                    fontFamily: 'Arial',
                    color: '#FF0000',
                    stroke: '#000000',
                    strokeThickness: 6,
                    align: 'center'
                }
            ).setOrigin(0.5).setScrollFactor(0);
            
            // Agregar texto para reiniciar
            const restartText = this.add.text(
                this.cameras.main.worldView.centerX,
                this.cameras.main.worldView.centerY + 50,
                'Presiona SPACE para reintentar',
                {
                    fontSize: '24px',
                    fontFamily: 'Arial',
                    color: '#FFFFFF',
                    stroke: '#000000',
                    strokeThickness: 4,
                    align: 'center'
                }
            ).setOrigin(0.5).setScrollFactor(0);
            
            // Agregar evento para reiniciar el juego
            this.input.keyboard.once('keydown-SPACE', () => {
                console.log('Reiniciando juego');
                this.scene.restart();
            });
            
            // Efectos visuales de muerte
            this.cameras.main.shake(500, 0.02);
            this.cameras.main.flash(300, 255, 0, 0);
        } catch (error) {
            console.error('Error en playerDeath:', error);
        }
    }

    // Método para crear la interfaz de usuario
    createUI() {
        try {
            // Crear el contador de vidas
            this.livesText = this.add.text(20, 20, `Vidas: ${this.lives}`, {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 4
            }).setScrollFactor(0);
            
            // Crear el contador de puntuación
            this.scoreText = this.add.text(20, 60, `Puntos: ${this.score}`, {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 4
            }).setScrollFactor(0);
            
            // Crear texto para la puntuación más alta
            this.highScoreText = this.add.text(20, 100, `Récord: ${this.highScore}`, {
                fontSize: '20px',
                fill: '#ffff00',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 3
            }).setScrollFactor(0);
            
            // Crear indicador del arma actual
            this.weaponIndicator = this.add.text(this.cameras.main.width - 20, 20, 
                `Arma: ${this.currentWeapon.toUpperCase()}`, {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'right'
            }).setScrollFactor(0).setOrigin(1, 0);
            
            // Crear indicador de multiplicador de puntos
            this.multiplierText = this.add.text(this.cameras.main.width - 20, 60,
                `Multiplicador: x${this.pointsMultiplier}`, {
                fontSize: '20px',
                fill: '#00ffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'right'
            }).setScrollFactor(0).setOrigin(1, 0);
        } catch (error) {
            console.error('Error en createUI:', error);
        }
    }
    
    // Método para actualizar el texto de puntuación
    updateScoreText() {
        if (this.scoreText) {
            this.scoreText.setText(`Puntos: ${this.score}`);
            
            // Actualizar puntuación más alta si es necesario
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('highScore', this.highScore);
                this.highScoreText.setText(`Récord: ${this.highScore}`);
            }
        }
    }
    
    // Método para actualizar el texto de vidas
    updateLivesText() {
        if (this.livesText) {
            this.livesText.setText(`Vidas: ${this.lives}`);
        }
    }
    
    // Método para actualizar el indicador de arma
    updateWeaponIndicator() {
        try {
            if (this.weaponIndicator) {
                const weaponName = this.currentWeapon ? this.currentWeapon.toUpperCase() : 'NINGUNA';
                this.weaponIndicator.setText(`Arma: ${weaponName}`);
                console.log('Indicador de arma actualizado:', weaponName);
            } else {
                console.warn('weaponIndicator no está definido');
            }
        } catch (error) {
            console.error('Error en updateWeaponIndicator:', error);
        }
    }
    
    // Método para actualizar el multiplicador de puntos
    increasePointsMultiplier() {
        this.pointsMultiplier += 0.1;
        if (this.multiplierText) {
            this.multiplierText.setText(`Multiplicador: x${this.pointsMultiplier.toFixed(1)}`);
        }
        
        // Mostrar un texto flotante para indicar el aumento
        this.showFloatingText(
            this.player.x,
            this.player.y - 50,
            `¡Multiplicador x${this.pointsMultiplier.toFixed(1)}!`,
            0x00FFFF
        );
    }
    
    // Método para agregar puntos
    addPoints(points) {
        // Aplicar el multiplicador de puntos actual
        const pointsToAdd = Math.floor(points * this.pointsMultiplier);
        this.score += pointsToAdd;
        this.updateScoreText();
        return pointsToAdd;
    }
    
    // Método para mostrar texto flotante (puntos, etc.)
    showFloatingText(x, y, text, color = 0xFFFFFF) {
        try {
            const floatingText = this.add.text(x, y, text, {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: `#${color.toString(16).padStart(6, '0')}`,
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            
            // Animar el texto para que suba y desaparezca
            this.tweens.add({
                targets: floatingText,
                y: y - 50,
                alpha: 0,
                duration: 1500,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    floatingText.destroy();
                }
            });
        } catch (error) {
            console.error('Error en showFloatingText:', error);
        }
    }

    // Método para crear el jefe final
    createBoss() {
        try {
            // Crear el jefe al final del nivel
            this.boss = new Boss(this, this.levelWidth - 400, 450);
            
            // Añadir colisión con plataformas
            this.physics.add.collider(this.boss, this.platforms);
            
            // Añadir colisión con el jugador
            this.physics.add.overlap(
                this.player,
                this.boss,
                this.handlePlayerBossCollision,
                null,
                this
            );
            
            // Añadir colisión con armas
            this.physics.add.overlap(
                this.weapons,
                this.boss,
                this.handleWeaponBossCollision,
                null,
                this
            );
            
            console.log('Jefe creado en posición:', this.levelWidth - 400, 450);
        } catch (error) {
            console.error('Error al crear el jefe:', error);
        }
    }
    
    // Método para manejar colisión entre el jugador y el jefe
    handlePlayerBossCollision(player, boss) {
        try {
            if (!this.isInvulnerable && boss.isActive && !boss.isDefeated) {
                console.log('Jugador colisiona con jefe');
                this.handlePlayerTakeDamage();
            }
        } catch (error) {
            console.error('Error en handlePlayerBossCollision:', error);
        }
    }
    
    // Método para manejar colisión entre armas y el jefe
    handleWeaponBossCollision(weapon, boss) {
        try {
            // Verificar que tanto el arma como el jefe estén activos
            if (!weapon || !boss || !weapon.active || !boss.active) return;
            
            if (boss.isVulnerable && !weapon.isImpacting) {
                console.log('Impacto de arma detectado con jefe');
                
                // Aplicar daño al jefe
                const bossDefeated = boss.takeDamage(weapon.damage);
                
                // Hacer que el arma impacte
                weapon.impact();
                
                // Si el jefe fue derrotado
                if (bossDefeated) {
                    // Añadir puntos con multiplicador (el jefe vale muchos puntos)
                    const pointsEarned = 5000 * this.pointsMultiplier;
                    this.score += pointsEarned;
                    this.updateScoreText();
                    
                    // Mostrar texto de puntos
                    this.showFloatingText(
                        boss.x, 
                        boss.y - 50, 
                        `+${pointsEarned}`, 
                        0xFFD700
                    );
                    
                    // Generar powerups especiales
                    this.spawnSpecialPowerup(boss.x, boss.y);
                    
                    // Mostrar mensaje de victoria
                    this.showVictoryMessage();
                }
            }
        } catch (error) {
            console.error('Error en handleWeaponBossCollision:', error);
        }
    }
    
    // Método para mostrar mensaje de victoria
    showVictoryMessage() {
        try {
            // Texto de victoria
            const victoryText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 50,
                '¡VICTORIA!',
                {
                    fontSize: '64px',
                    fontFamily: 'Arial',
                    color: '#FFFF00',
                    stroke: '#000000',
                    strokeThickness: 6,
                    align: 'center'
                }
            ).setScrollFactor(0).setOrigin(0.5);
            
            // Texto de puntuación final
            const finalScoreText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 20,
                `Puntuación final: ${this.score}`,
                {
                    fontSize: '32px',
                    fontFamily: 'Arial',
                    color: '#FFFFFF',
                    stroke: '#000000',
                    strokeThickness: 4,
                    align: 'center'
                }
            ).setScrollFactor(0).setOrigin(0.5);
            
            // Texto para continuar
            const continueText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 80,
                'Presiona SPACE para continuar',
                {
                    fontSize: '24px',
                    fontFamily: 'Arial',
                    color: '#FFFF00',
                    stroke: '#000000',
                    strokeThickness: 3,
                    align: 'center'
                }
            ).setScrollFactor(0).setOrigin(0.5);
            
            // Hacer parpadear el texto de continuar
            this.tweens.add({
                targets: continueText,
                alpha: 0.2,
                duration: 500,
                ease: 'Power2',
                yoyo: true,
                repeat: -1
            });
            
            // Evento para volver al menú principal
            this.input.keyboard.once('keydown-SPACE', () => {
                this.scene.start('MainMenuScene');
            });
        } catch (error) {
            console.error('Error en showVictoryMessage:', error);
        }
    }
    
    // Método para generar power-ups especiales al derrotar al jefe
    spawnSpecialPowerup(x, y) {
        try {
            // Crear varios power-ups alrededor de la posición del jefe
            const types = ['health', 'invincibility', 'doubleScore'];
            
            // Distribuir power-ups en círculo
            for (let i = 0; i < types.length; i++) {
                const angle = (i / types.length) * Math.PI * 2;
                const distance = 100;
                const powerupX = x + Math.cos(angle) * distance;
                const powerupY = y + Math.sin(angle) * distance - 50; // Ajustar altura
                
                const powerup = new Powerup(this, powerupX, powerupY, types[i]);
                this.powerups.add(powerup);
                
                // Animación de aparición
                powerup.setAlpha(0);
                this.tweens.add({
                    targets: powerup,
                    alpha: 1,
                    y: powerupY - 20,
                    duration: 800,
                    ease: 'Bounce.easeOut',
                    delay: i * 200
                });
            }
        } catch (error) {
            console.error('Error en spawnSpecialPowerup:', error);
        }
    }
    
    // Método para generar cofres en el nivel
    spawnChests() {
        try {
            // Posiciones de los cofres en el nivel
            const chestPositions = [
                { x: 500, y: 320 },   // Sobre plataforma
                { x: 1000, y: 270 },  // Sobre plataforma
                { x: 1700, y: 320 },  // Sobre plataforma
                { x: 2300, y: 320 },  // Sobre plataforma
                { x: 2900, y: 320 }   // Sobre plataforma
            ];
            
            // Crear los cofres
            chestPositions.forEach(pos => {
                const chest = new Chest(this, pos.x, pos.y);
                this.chests.add(chest);
            });
        } catch (error) {
            console.error('Error en spawnChests:', error);
        }
    }
    
    // Método para generar un cofre aleatorio cuando se mata a un enemigo
    spawnRandomChest(x, y) {
        try {
            const chest = new Chest(this, x, y - 10);
            this.chests.add(chest);
            
            // Añadir animación de aparición
            chest.setScale(0);
            this.tweens.add({
                targets: chest,
                scale: 1,
                duration: 300,
                ease: 'Back.easeOut'
            });
        } catch (error) {
            console.error('Error en spawnRandomChest:', error);
        }
    }
    
    // Método para manejar colisión entre armas y cofres
    handleWeaponChestCollision(weapon, chest) {
        try {
            if (!chest.isOpen && !chest.isOpening) {
                console.log('Cofre golpeado por arma');
                
                // Llamar al método hit en vez de open
                const wasHit = chest.hit();
                
                // Si el cofre fue golpeado y el arma no es penetrante, destruirla
                if (wasHit && !weapon.isPenetrating) {
                    weapon.handleImpact();
                }
            }
        } catch (error) {
            console.error('Error en handleWeaponChestCollision:', error);
        }
    }
    
    // Método para generar pickup de arma
    spawnWeaponPickup(x, y, type = null) {
        try {
            // Si no se especifica un tipo, seleccionar uno aleatorio
            if (!type) {
                // Excluir el arma actual del jugador para obtener una diferente
                const availableWeapons = this.weaponTypes.filter(weapon => weapon !== this.currentWeapon);
                type = Phaser.Utils.Array.GetRandom(availableWeapons);
            }
            
            console.log('Creando pickup de arma:', type, 'en posición:', x, y);
            
            // Verificar que la textura existe
            const textureName = `${type}-pickup`;
            if (!this.textures.exists(textureName)) {
                console.error(`Textura ${textureName} no encontrada. Texturas disponibles:`, 
                    Array.from(this.textures.keys()));
                return null;
            }
            
            // Crear el pickup
            try {
                const pickup = new WeaponPickup(this, x, y, type);
                this.weaponPickups.add(pickup);
                
                // Aplicar una pequeña física para que el pickup "salte" al ser creado
                pickup.setVelocity(Phaser.Math.Between(-50, 50), -200);
                
                console.log('Pickup creado exitosamente');
                return pickup;
            } catch (innerError) {
                console.error('Error al crear WeaponPickup:', innerError);
                // Crear un sprite básico como fallback
                const fallbackPickup = this.physics.add.sprite(x, y, textureName);
                fallbackPickup.type = type;
                fallbackPickup.weaponType = type;
                this.weaponPickups.add(fallbackPickup);
                return fallbackPickup;
            }
        } catch (error) {
            console.error('Error en spawnWeaponPickup:', error);
            return null;
        }
    }
    
    // Método para manejar la colisión entre el jugador y los pickups de armas
    handlePlayerPickupCollision(player, pickup) {
        try {
            // Obtener el tipo de arma del pickup
            const weaponType = pickup.type || pickup.weaponType || 'spear';
            
            console.log('Pickup recogido:', weaponType);
            
            // Cambiar el arma actual del jugador
            this.currentWeapon = weaponType;
            
            // Actualizar el texto del arma
            this.updateWeaponIndicator();
            
            // Reproducir sonido de recoger arma
            if (this.audioManager) {
                this.audioManager.playSfx('pickup', { volume: 0.5 });
                console.log('Sonido de pickup reproducido');
            }
            
            // Mostrar texto flotante
            this.showFloatingText(
                pickup.x,
                pickup.y - 30,
                `Arma: ${weaponType.toUpperCase()}`,
                0x00FFFF
            );
            
            // Ejecutar método collect del pickup si existe
            if (pickup.collect && typeof pickup.collect === 'function') {
                pickup.collect();
            } else {
                // Si no tiene método collect, destruirlo directamente
                pickup.destroy();
            }
        } catch (error) {
            console.error('Error en handlePlayerPickupCollision:', error);
            // En caso de error, destruir el pickup
            if (pickup && pickup.active) {
                pickup.destroy();
            }
        }
    }
    
    // Método para manejar colisión entre las armas y las plataformas
    handleWeaponPlatformCollision(weapon, platform) {
        try {
            // Solo procesar si el arma no es penetrante
            if (!weapon.isPenetrating) {
                weapon.handleImpact();
            }
        } catch (error) {
            console.error('Error en handleWeaponPlatformCollision:', error);
        }
    }
    
    // Método para manejar cuando el jugador recibe daño
    handlePlayerTakeDamage() {
        try {
            // Si el jugador ya está invulnerable o muerto, no procesar
            if (this.isInvulnerable || this.lives <= 0) {
                console.log('Jugador invulnerable o muerto, ignorando daño');
            return;
        }
        
            console.log('Jugador recibe daño. Vidas antes:', this.lives, 'Armadura:', this.hasArmor);
            
            // Aplicar daño y establecer invulnerabilidad temporal
            this.isInvulnerable = true;
            
            // Reproducir sonido de daño
            if (this.audioManager) {
                // Usar 'hit' en lugar de 'player-hurt', que podría ser el nombre correcto en la carga de recursos
                this.audioManager.playSound('hit', { volume: 0.6 });
                console.log('Reproduciendo sonido de daño (hit)');
            } else {
                console.warn('AudioManager no disponible para reproducir sonido de daño');
            }
            
            // Efecto visual de daño (parpadeo)
            this.tweens.add({
                targets: this.player,
                alpha: 0.5,
                duration: 100,
                ease: 'Linear',
                yoyo: true,
                repeat: 10,
                onComplete: () => {
                    this.player.alpha = 1;
                }
            });
            
            // Si tiene armadura, perderla en lugar de una vida
            if (this.hasArmor) {
                this.hasArmor = false;
                
                // Cambiar el aspecto del jugador (sin armadura)
                this.player.setTexture('arthur-underwear-idle');
                
                // Mostrar el efecto de ruptura de armadura
                this.showArmorBreakEffect();
                
                // Reproducir sonido de ruptura de armadura
                if (this.audioManager) {
                    this.audioManager.playSound('armor-break', { volume: 0.6 });
                }
                
                // Mostrar texto flotante
                this.showFloatingText(
                    this.player.x,
                    this.player.y - 50,
                    '¡Armadura perdida!',
                    0xFF0000
                );
            } else {
                // Restar una vida
                this.lives--;
                this.updateLivesText();
                
                // Mostrar texto flotante
                this.showFloatingText(
                    this.player.x,
                    this.player.y - 50,
                    '-1 Vida',
                    0xFF0000
                );
                
                // Si no quedan vidas, game over
                if (this.lives <= 0) {
                    console.log('Jugador sin vidas, iniciando secuencia de muerte');
                    this.playerDeath();
            return;
                }
            }
            
            // Timer para quitar la invulnerabilidad
            this.time.delayedCall(this.invulnerabilityTime, () => {
                this.isInvulnerable = false;
                console.log('Invulnerabilidad terminada');
            });
            
            console.log('Jugador dañado. Vidas después:', this.lives, 'Armadura:', this.hasArmor);
        } catch (error) {
            console.error('Error en handlePlayerTakeDamage:', error);
        }
    }
    
    // Método para manejar colisión entre el jugador y los power-ups
    handlePlayerPowerupCollision(player, powerup) {
        try {
            // Comprobar que el powerup tenga el método collect
            if (powerup && powerup.active && typeof powerup.collect === 'function') {
                // Llamar al método collect del power-up que contiene toda la lógica
                powerup.collect();
            } else {
                // Fallback para powerups antiguos que no tienen el método collect
                
                // Obtener el tipo de power-up
                const powerupType = powerup.powerupType || powerup.type || 'points';
                
                // Aplicar efecto según el tipo
                switch (powerupType) {
                    case 'armor':
                    case 'health':
                        // Restaurar armadura si no la tiene
                        if (!this.hasArmor) {
                            this.hasArmor = true;
                            this.player.setTexture('arthur-idle');
                            this.showFloatingText(
                                powerup.x,
                                powerup.y - 30,
                                '¡Armadura restaurada!',
                                0x00FF00
                            );
                        } else {
                            // Sino, dar una vida extra
                            this.lives++;
                            this.updateLivesText();
                            this.showFloatingText(
                                powerup.x,
                                powerup.y - 30,
                                '+1 Vida',
                                0x00FF00
                            );
                        }
                        break;
                        
                    case 'invincible':
                    case 'invincibility':
                        // Dar invulnerabilidad temporal extendida
                        this.isInvulnerable = true;
                        
                        // Efecto visual de invencibilidad
                        const invincibilityEffect = this.tweens.add({
                            targets: this.player,
                            alpha: 0.7,
                            duration: 100,
                            ease: 'Linear',
                            yoyo: true,
                            repeat: -1
                        });
                        
                        this.showFloatingText(
                            powerup.x,
                            powerup.y - 30,
                            '¡Invencibilidad!',
                            0xFFFF00
                        );
                        
                        // Terminar después de 10 segundos
                        this.time.delayedCall(10000, () => {
                            this.isInvulnerable = false;
                            invincibilityEffect.stop();
                            this.player.alpha = 1;
                        });
                        break;
                        
                    case 'points':
                    case 'doubleScore':
                        // Añadir puntos o duplicar el multiplicador
                        const oldMultiplier = this.pointsMultiplier || 1;
                        this.pointsMultiplier = (this.pointsMultiplier || 1) * 2;
                        
                        if (this.multiplierText) {
                            this.multiplierText.setText(`Multiplicador: x${this.pointsMultiplier.toFixed(1)}`);
                        }
                        
                        // Añadir puntos base
                        if (this.score !== undefined) {
                            this.score += 300;
                            if (typeof this.updateScoreText === 'function') {
                                this.updateScoreText();
                            }
                        }
                        
                        this.showFloatingText(
                            powerup.x,
                            powerup.y - 30,
                            '¡Puntos x2!',
                            0x00FFFF
                        );
                        
                        // Volver al multiplicador normal después de 20 segundos
                        this.time.delayedCall(20000, () => {
                            this.pointsMultiplier = oldMultiplier;
                            if (this.multiplierText) {
                                this.multiplierText.setText(`Multiplicador: x${this.pointsMultiplier.toFixed(1)}`);
                            }
                        });
                        break;
                        
                    case 'magic':
                        // Recuperar vida
                        if (this.lives !== undefined && this.lives < 5) {
                            this.lives++;
                            if (typeof this.updateLivesText === 'function') {
                                this.updateLivesText();
                            }
                            
                            this.showFloatingText(
                                powerup.x,
                                powerup.y - 30,
                                '¡Vida Extra!',
                                0x00FF00
                            );
                        }
                        break;
                }
                
                // Reproducir sonido de power-up
                if (this.audioManager && typeof this.audioManager.playSound === 'function') {
                    this.audioManager.playSound('powerup');
                } else if (this.sound && this.sound.play) {
                    // Fallback si no existe audioManager
                    this.sound.play('powerup-collect', { volume: 0.5 });
                }
                
                // Destruir el power-up
                powerup.destroy();
            }
        } catch (error) {
            console.error('Error en handlePlayerPowerupCollision:', error);
        }
    }
    
    // Método para generar powerups modernos
    spawnPowerup(x, y, type) {
        try {
            console.log(`Generando powerup de tipo ${type} en (${x}, ${y})`);
            
            // Verificar que el tipo sea válido
            const validTypes = ['armor', 'points', 'magic', 'invincible', 'spear', 'dagger', 'torch', 'axe'];
            if (!validTypes.includes(type)) {
                console.warn(`Tipo de powerup no válido: ${type}, usando 'points' como fallback`);
                type = 'points';
            }
            
            // Verificar que la textura exista
            const textureName = `powerup_${type}`;
            if (!this.textures.exists(textureName)) {
                console.error(`La textura ${textureName} no existe. Creando respaldo...`);
                
                // Crear textura de respaldo
                this.createPowerupTexture(textureName, type);
            }
            
            // Crear el powerup utilizando la clase Powerup
            const powerup = new Powerup(this, x, y, type);
            
            // Asegurarse de que el powerup sea visible
            powerup.setVisible(true);
            powerup.setAlpha(1);
            powerup.setScale(1.5); // Hacer el powerup más grande
            powerup.setDepth(10);  // Asegurar que se dibuje por encima de otros elementos
            
            // Añadir el powerup al grupo
            this.powerups.add(powerup);
            
            // Loggear información para depuración
            console.log(`Powerup creado: Tipo=${type}, Textura=${powerup.texture.key}, ` +
                      `Posición=(${powerup.x}, ${powerup.y}), ` + 
                      `Visible=${powerup.visible}, Alpha=${powerup.alpha}, ` +
                      `Escala=${powerup.scaleX}x${powerup.scaleY}`);
            
            return powerup;
        } catch (error) {
            console.error('Error al generar powerup:', error);
            return null;
        }
    }
    
    // Método para crear textura de powerup si no existe
    createPowerupTexture(textureName, type) {
        try {
            // Determinar color y forma según el tipo
            let color, shape;
            
            switch(type) {
                case 'armor':
                    color = 0x3498db; // Azul
                    shape = 'circle';
                    break;
                case 'points':
                    color = 0xf1c40f; // Amarillo
                    shape = 'star';
                    break;
                case 'magic':
                    color = 0x2ecc71; // Verde
                    shape = 'diamond';
                    break;
                case 'invincible':
                    color = 0xe74c3c; // Rojo
                    shape = 'hexagon';
                    break;
                case 'spear':
                    color = 0x95a5a6; // Plateado
                    shape = 'rect';
                    break;
                case 'dagger':
                    color = 0xbdc3c7; // Plateado claro
                    shape = 'triangle';
                    break;
                case 'torch':
                    color = 0xe67e22; // Naranja
                    shape = 'flame';
                    break;
                case 'axe':
                    color = 0x7f8c8d; // Gris
                    shape = 'square';
                    break;
                default:
                    color = 0xffffff; // Blanco
                    shape = 'circle';
            }
            
            // Crear gráfico
            const graphics = this.add.graphics();
            const size = 32;
            
            // Dibujar forma
            graphics.fillStyle(color, 1);
            
            switch(shape) {
                case 'circle':
                    graphics.fillCircle(size/2, size/2, size/2);
                    break;
                case 'star':
                    this.drawStar(graphics, size/2, size/2, 5, size/2, size/4);
                    break;
                case 'diamond':
                    graphics.fillPoints([
                        { x: size/2, y: 0 },
                        { x: size, y: size/2 },
                        { x: size/2, y: size },
                        { x: 0, y: size/2 }
                    ], true);
                    break;
                case 'hexagon':
                    this.drawHexagon(graphics, size/2, size/2, size/2);
                    break;
                case 'rect':
                    graphics.fillRect(size/4, size/4, size/2, size);
                    break;
                case 'triangle':
                    graphics.fillPoints([
                        { x: size/2, y: 0 },
                        { x: size, y: size },
                        { x: 0, y: size }
                    ], true);
                    break;
                case 'flame':
                    this.drawFlame(graphics, size/2, size/2, size/2);
                    break;
                case 'square':
                    graphics.fillRect(0, 0, size, size);
                    break;
            }
            
            // Añadir brillo
            graphics.lineStyle(2, 0xffffff, 0.8);
            graphics.strokeCircle(size/2, size/2, size/2 - 2);
            
            // Generar textura
            graphics.generateTexture(textureName, size, size);
            
            // Limpiar y destruir gráfico
            graphics.clear();
            graphics.destroy();
            
            console.log(`Textura de respaldo ${textureName} creada correctamente`);
            return true;
        } catch (error) {
            console.error(`Error al crear textura de respaldo ${textureName}:`, error);
            return false;
        }
    }
    
    // Método para dibujar una estrella
    drawStar(graphics, x, y, points, outerRadius, innerRadius) {
        const angleStep = Math.PI * 2 / points;
        const halfStep = angleStep / 2;
        
        const vertices = [];
        
        for (let i = 0; i < points; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const nextAngle = angle + halfStep;
            
            vertices.push({ x: x + Math.cos(angle) * outerRadius, y: y + Math.sin(angle) * outerRadius });
            vertices.push({ x: x + Math.cos(nextAngle) * innerRadius, y: y + Math.sin(nextAngle) * innerRadius });
        }
        
        graphics.fillPoints(vertices, true);
    }
    
    // Método para dibujar un hexágono
    drawHexagon(graphics, x, y, radius) {
        const vertices = [];
        
        for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            vertices.push({ x: x + radius * Math.cos(angle), y: y + radius * Math.sin(angle) });
        }
        
        graphics.fillPoints(vertices, true);
    }
    
    // Método para dibujar una llama
    drawFlame(graphics, x, y, radius) {
        // Puntos base para una forma de llama
        const vertices = [
            { x: x, y: y - radius },
            { x: x + radius / 2, y: y - radius / 2 },
            { x: x + radius / 3, y: y },
            { x: x + radius / 2, y: y + radius / 3 },
            { x: x, y: y + radius / 2 },
            { x: x - radius / 2, y: y + radius / 3 },
            { x: x - radius / 3, y: y },
            { x: x - radius / 2, y: y - radius / 2 }
        ];
        
        graphics.fillPoints(vertices, true);
    }

    // Método principal de actualización del juego - se ejecuta en cada frame
    update(time, delta) {
        // Mostrar en pantalla la información de juego (vidas, puntuación)
        if (this.scoreText && this.livesText) {
            this.scoreText.setText(`SCORE: ${this.score}`);
            this.livesText.setText(`LIVES: ${this.lives}`);
        }
        
        try {
            // Si el juego no está en curso, no actualizar
            if (!this.player || !this.player.active) return;
            
            // Actualizar movimiento del jugador
            this.handlePlayerMovement();
            
            // Actualizar lanzamiento de armas
            this.handleWeaponThrow();
            
            // Si está habilitado, mostrar información de depuración
            if (this.debugMode && this.debugText) {
                this.updateDebugInfo();
            }
            
            // Verificar si el jugador ha caído al vacío
            if (this.player.y > this.cameras.main.height + 50) {
                this.handlePlayerTakeDamage();
                this.player.setPosition(100, 450); // Reposicionar en punto seguro
            }
        } catch (error) {
            console.error('Error en update:', error);
        }
    }
    
    // Método para manejar el movimiento del jugador - versión mejorada 
    handlePlayerMovement() {
        try {
            // Verificar si el personaje existe
            if (!this.player || !this.cursors) return;
            
            // No permitir movimiento si está muerto
            if (this.isDead) {
                // Detener cualquier sonido de caminar
                if (this.walkSoundPlaying && this.audioManager) {
                    this.audioManager.playSfx('walk', { stop: true });
                    this.walkSoundPlaying = false;
                }
                return;
            }
            
            // No permitir movimiento durante el lanzamiento de armas
            if (this.isThrowingWeapon) return;
            
            // Variables para seguimiento de cambios
            const wasOnGround = this.player.body.onFloor();
            const wasMovingHorizontally = Math.abs(this.player.body.velocity.x) > 10;
            
            // Movimiento horizontal
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-160);
                this.facingLeft = true;
                
                if (this.player.body.touching.down) {
                    this.player.anims.play('run-left', true);
                    
                    // Sonido de pasos al caminar solo si no se estaba reproduciendo ya
                    if (this.audioManager && !this.walkSoundPlaying) {
                        this.walkSoundPlaying = true;
                        this.audioManager.playSfx('walk', { volume: 0.3, loop: true });
                        console.log('Reproduciendo sonido de caminar');
                    }
                }
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(160);
                this.facingLeft = false;
                
                if (this.player.body.touching.down) {
                    this.player.anims.play('run-right', true);
                    
                    // Sonido de pasos al caminar solo si no se estaba reproduciendo ya
                    if (this.audioManager && !this.walkSoundPlaying) {
                        this.walkSoundPlaying = true;
                        this.audioManager.playSfx('walk', { volume: 0.3, loop: true });
                        console.log('Reproduciendo sonido de caminar');
                    }
                }
            } else {
                // Detener movimiento horizontal
                this.player.setVelocityX(0);
                
                // Detener sonido de caminar
                if (this.walkSoundPlaying) {
                    if (this.audioManager) {
                        this.audioManager.playSfx('walk', { stop: true });
                    }
                    this.walkSoundPlaying = false;
                }
                
                // Animación idle si está en el suelo y no está saltando o lanzando
                if (this.player.body.touching.down && !this.isJumping && !this.isThrowingWeapon) {
                    this.player.anims.play('idle', true);
                }
            }
            
            // Verificar si debemos detener el sonido de caminar por estar en el aire
            if (this.walkSoundPlaying && !this.player.body.touching.down) {
                if (this.audioManager) {
                    this.audioManager.playSfx('walk', { stop: true });
                }
                this.walkSoundPlaying = false;
            }
            
            // Salto cuando se presiona la tecla de flecha arriba y está en el suelo
            if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                if (this.player.body.touching.down || this.jumpCount < this.maxJumps) {
                    this.player.setVelocityY(this.jumpForce);
                    this.isJumping = true;
                    this.jumpCount++;
                    this.player.anims.play('jump', true);
                    if (this.walkSoundPlaying) {
                        if (this.audioManager) {
                            this.audioManager.playSfx('walk', { stop: true });
                        }
                        this.walkSoundPlaying = false;
                    }
                    if (this.audioManager) {
                        this.audioManager.playSfx('jump', { volume: 0.5 });
                    }
                    if (this.jumpCount > 1) {
                        this.audioManager.playSfx('double-jump', { volume: 0.7 });
                        this.showJumpParticles();
                        // Configurar y mostrar partículas para salto múltiple
                        const particleIndex = Phaser.Math.Between(8, 11);
                        const alphaIndex = Phaser.Math.Between(2, 8);
                        const textureName = `jump_particle_${particleIndex}_${alphaIndex}`;
                        this.jumpEmitter.setTexture(textureName);
                        this.jumpEmitter.setPosition(this.player.x, this.player.y + 20);
                        this.jumpEmitter.explode();
                    }
                }
            }
            
            // Detectar cuando está cayendo (para cambiar animación)
            if (this.player.body.velocity.y > 0 && !this.player.body.touching.down) {
                this.isFalling = true;
                
                // Mantener la animación de salto mientras cae
                if (!this.isThrowingWeapon) {
                    this.player.anims.play('jump', true);
                }
            } else if (this.player.body.touching.down) {
                // Si acaba de aterrizar
                if (this.isFalling) {
                    this.isFalling = false;
                    this.doubleJumping = false;
                    
                    // Efecto visual de aterrizaje
                    this.showLandingParticles();
                }
                
                this.isJumping = false;
                
                // Resetear contadores de salto al tocar el suelo
                this.jumpCount = 0;
            }
            
            // Voltear el sprite según la dirección 
            if (this.facingLeft) {
                this.player.setFlipX(true);
            } else {
                this.player.setFlipX(false);
            }
            
            // Verificar animaciones
            if (!this.player.anims.isPlaying && !this.isDead) {
                console.log('No hay animación activa, forzando idle');
                this.player.anims.play('idle', true);
            }
        } catch (error) {
            console.error('Error en handlePlayerMovement:', error);
        }
    }
    
    // Método para mostrar efecto de aterrizaje
    showLandingEffect() {
        // Partículas pequeñas de polvo
        if (this.jumpParticlesBright) {
            this.jumpParticlesBright.setPosition(this.player.x, this.player.y + 25);
            this.jumpParticlesBright.setSpeed({ min: 50, max: 100 });
            this.jumpParticlesBright.setScale({ start: 0.2, end: 0 });
            this.jumpParticlesBright.explode(5, this.player.x, this.player.y + 25);
        }
    }
    
    // Método para manejar el lanzamiento de armas - versión corregida
    handleWeaponThrow() {
        // No permitir lanzamiento si está muerto
        if (this.isDead) return;
        
        // Verificar si se presionó la tecla de espacio y si el jugador puede lanzar
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.isThrowingWeapon) {
            console.log('Lanzando arma:', this.currentWeapon);
            
            // Marcar que estamos lanzando
            this.isThrowingWeapon = true;
            
            // Obtener dirección y posición
            const direction = this.facingLeft ? -1 : 1;
            const posX = this.player.x + (direction * 20);
            const posY = this.player.y - 10; // Ajuste para que salga a altura adecuada
            
            try {
                // Crear el arma y añadirla al grupo
                const weapon = new Weapon(this, posX, posY, this.currentWeapon);
                this.weapons.add(weapon);
                
                // Iniciar el movimiento del arma
                weapon.fire(posX, posY, direction);
                
                console.log('Arma creada y lanzada:', this.currentWeapon, 'en dirección:', direction);
                
                // Reproducir animación de lanzamiento
                this.player.anims.play('throw', true);
                
                // Reproducir sonido de lanzamiento
                if (this.audioManager) {
                    this.audioManager.playSfx('throw', { volume: 0.4 });
                    console.log('Sonido de lanzamiento reproducido');
                }
            } catch (error) {
                console.error('Error al crear arma:', error);
                // En caso de error, resetear el estado
                this.isThrowingWeapon = false;
            }
            
            // La animación 'throw' tiene un evento de finalización que resetea isThrowingWeapon
            // Pero añadimos un temporizador por seguridad
            this.time.delayedCall(500, () => {
                if (this.isThrowingWeapon && !this.isDead) {
                    console.log('Restaurando estado de lanzamiento por timeout');
                    this.isThrowingWeapon = false;
                }
            });
        }
    }
    
    // Método para actualizar información de depuración
    updateDebugInfo() {
        try {
            if (!this.debugText) return;
            
            // Recopilar información del jugador
            const playerInfo = {
                x: Math.round(this.player.x),
                y: Math.round(this.player.y),
                vx: Math.round(this.player.body.velocity.x),
                vy: Math.round(this.player.body.velocity.y),
                onGround: this.player.body.touching.down,
                isJumping: this.isJumping,
                jumpCount: this.jumpCount,
                weapon: this.currentWeapon,
                health: this.hasArmor ? 'Armored' : `Lives: ${this.lives}`,
                enemies: this.zombies.countActive() + this.skeletons.countActive() + 
                         this.gargoyles.countActive() // Demonios desactivados: + this.demons.countActive()
            };
            
            // Actualizar el texto de depuración
            this.debugText.setText([
                `Pos: (${playerInfo.x}, ${playerInfo.y})`,
                `Vel: (${playerInfo.vx}, ${playerInfo.vy})`,
                `Grounded: ${playerInfo.onGround}`,
                `Jump: ${playerInfo.isJumping} (#${playerInfo.jumpCount})`,
                `Weapon: ${playerInfo.weapon}`,
                `Health: ${playerInfo.health}`,
                `Enemies: ${playerInfo.enemies}`
            ]);
        } catch (error) {
            console.error('Error en updateDebugInfo:', error);
        }
    }

    showJumpParticles() {
        if (!this.jumpParticles || !this.jumpEmitter) return;
        try {
            // Alternar entre diferentes texturas para variedad
            const particleIndex = Phaser.Math.Between(8, 11);
            const alphaIndex = Phaser.Math.Between(2, 8);
            const textureName = `jump_particle_${particleIndex}_${alphaIndex}`;
            console.log(`Usando textura de partícula: ${textureName}`);
            // Actualizar textura y posición
            this.jumpEmitter.setTexture(textureName);
            this.jumpEmitter.setPosition(this.player.x, this.player.y + 20);
            this.jumpEmitter.setSpeed({ min: 50, max: 200 });
            // Explotar partículas
            this.jumpEmitter.explode(10);
            console.log('Mostrando partículas de salto básicas');
        } catch (error) {
            console.error('Error al mostrar partículas de salto:', error);
        }
    }

    // Método para actualizar la puntuación
    updateScore(points) {
        this.score += points;
        this.scoreText.setText(`SCORE: ${this.score}`);
    }

    // Método para mostrar texto flotante en cualquier punto del juego
    showFloatingText(x, y, text, color = 0xFFFFFF) {
        try {
            // Crear texto con estilo adecuado
            const floatingText = this.add.text(x, y, text, {
                fontFamily: 'Arial',
                fontSize: '20px',
                fontStyle: 'bold',
                color: `#${color.toString(16).padStart(6, '0')}`,
                stroke: '#000',
                strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5).setDepth(10);
            
            // Animación de elevación y desaparición
            this.tweens.add({
                targets: floatingText,
                y: y - 50,
                alpha: 0,
                duration: 1500,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    floatingText.destroy();
                }
            });
            
            return floatingText;
        } catch (error) {
            console.error('Error al mostrar texto flotante:', error);
            return null;
        }
    }
}

export default GameScene;
