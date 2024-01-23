import { AnimatedSprite, Assets } from '../../pixi/pixi.mjs';
import { app } from '../application/application.js';
import * as Projectile from '../projectile/projectile.js';
import * as ProjectilesManager from '../projectile/projectiles_manager.js';
import * as HUD from '../ui/hud.js';
import * as Globals from '../globals.js';


const MOVE_SPEED = 2.5;
const COLOR = 0x00ff00;

const inputMap = {
    move_left: {
        'KeyA': false,
        'ArrowLeft': false
    },
    move_right: {
        'KeyD': false,
        'ArrowRight': false
    },
    shoot: {
        'KeyW': false,
        'ArrowUp': false,
        'Space': false
    }
};

let lives = 3;
let score = 0;
let projectile;
let spritesheet;
let animSprite;
let moveInput = 0;

let onDied;


/**
 * @returns `Assets.load` promise.
 */
const load = async () => {
    
    const promise = Assets.load('game/player/player_sheet.json'); 
    await promise.then((playerSheet) => {
        spritesheet = playerSheet;
        
        animSprite = new AnimatedSprite(spritesheet.animations.idle);
        
        animSprite.anchor.y = .5;
        animSprite.tint = COLOR;
        
        app.stage.addChild(animSprite);
    });

    return promise;
};


/**
 * Instantiates and configures the player projectile.
 */
const loadProjectile = () => {
    projectile = Projectile.create();
    projectile.animSprite = new AnimatedSprite(ProjectilesManager.getPlayerProjectileSprite());
    projectile.animSprite.tint = COLOR;
    projectile.verticalDirection = -1;
    projectile.fromPlayer = true;

    projectile.onHit = () => {
        score += 10;
        projectile.shot = false;
        HUD.updateScore(score);
    };
    projectile.outOfBounds = () => projectile.shot = false;
    
    projectile["shot"] = false;
};


const ready = () => {
    document.addEventListener('keydown', input);
    document.addEventListener('keyup', input);

    animSprite.position.set(50, 380);

    loadProjectile();
};


/**
 * Handles all input from the player.
 * @param {InputEvent} e
 */
const input = (e) => {
    const isKeydown = e.type === 'keydown';
    inputMap.move_right[e.code] = isKeydown;
    inputMap.move_left[e.code] = isKeydown;
    inputMap.shoot[e.code] = isKeydown;
    
    const left = inputMap.move_left.KeyA || inputMap.move_left.ArrowLeft;
    const right = inputMap.move_right.KeyD || inputMap.move_right.ArrowRight;
    moveInput = right - left;

    switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
            if (e.type !== "keydown") {
                break;
            }
            
            if (Globals.curGameState === Globals.GameState.GAME_OVER) {
                Globals.onGameRestart();
                return;
            }

            shoot();
    }
};


/**
 * @param {Float} dt 
 */
const physicsTick = (dt) => {
    animSprite.x += moveInput * MOVE_SPEED * dt;

    if (animSprite.x < 50) {
        animSprite.x = 50;
    }
    else if (animSprite.x > 540) {
        animSprite.x = 540;
    }
};


/**
 * @returns this object bounds.
 */
const getBounds = () => {
    const gp = animSprite.getGlobalPosition();
    return {
        ax: gp.x,
        ay: gp.y,
        bx: gp.x + animSprite.width,
        by: gp.y + animSprite.height
    };
};


/**
 * Handler for when the player gets hit.
 */
const hit = () => {
    Globals.setCurGameState(Globals.GameState.PLAYER_DESTROYED);

    lives--;
    HUD.updateLives(lives);
    
    ProjectilesManager.reset();

    animSprite.textures = spritesheet.animations.destroy;
    animSprite.animationSpeed = .021;
    animSprite.loop = false;
    
    animSprite.onComplete = () => {
        if (lives === 0) {
            onDied();
            return;
        }

        animSprite.textures = spritesheet.animations.idle;
        Globals.setCurGameState(Globals.GameState.OK);
    };
    
    animSprite.play();
};


const onLevelReset = () => {
    animSprite.position.set(50, 380);
};


const reset = () => {
    animSprite.position.set(50, 380);
    score = 0;
    lives = 3;

    animSprite.textures = spritesheet.animations.idle;
};


const setOnDied = (func) => onDied = func; 


const shoot = () => {
    if (projectile.shot) {
        return;
    }
    
    projectile.shot = true;

    const pos = {
        x: animSprite.getGlobalPosition().x + animSprite.width / 2 - 2,
        y: animSprite.getGlobalPosition().y - animSprite.height / 2,
    };

    Projectile.ready(projectile, pos);
    ProjectilesManager.addProjectile(projectile);
};


export {
    getBounds,
    load,
    hit,
    onLevelReset,
    physicsTick,
    ready,
    reset,
    setOnDied
};