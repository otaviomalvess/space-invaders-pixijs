import { AnimatedSprite, Assets, Container } from '../../node_modules/pixi.js/dist/pixi.min.mjs';
import { app } from '../index.js'; // @WORKAROUND: not a fan of doing this.
import * as ProjectilesManager from '../projectile/projectiles_manager.js';
import * as Globals from '../globals.js';


const container = new Container();

let destroyAnimation;

const H_STEP_DISTANCE = 16;
const V_STEP_DISTANCE = 36;
let moveDir = 1;

const MAX_MOVE_ELAPSED_TIME = 30;
let moveElapsedTime = MAX_MOVE_ELAPSED_TIME;

let shotElapsedTime = 2;

let totalEnemiesAlive;


/**
 * @returns `Assets.load` promise.
 */
const load = async () => {

    const promise = Assets.load('game/enemies/enemies_sheet.json');
    await promise.then((spritesheet) => {
        destroyAnimation = spritesheet.animations.destroy;

        // Create enemies
        const maxLines = 5;
        const maxColumns = 6;
        let curL = 0;
        let curC = 0;

        totalEnemiesAlive = maxLines * maxColumns;

        for (let i = 0; i < maxLines * maxColumns; i++) {
            let anim;
            if (curC < 2) {
                anim = spritesheet.animations.alien_1;
            }
            else if (curC < 4) {
                anim = spritesheet.animations.alien_2;
            }
            else {
                anim = spritesheet.animations.alien_3;
            }

            const enemy = new AnimatedSprite(anim);
            enemy.position.set(48 * curL, 36 * curC);
            enemy["idle_animation"] = anim;
            enemy["alive"] = true;

            container.addChild(enemy);

            curC++;
            if (curC >= maxLines) {
                curC = 0;
                curL++;
            }
        }

        app.stage.addChild(container);
    });

    return promise;
};


const ready = () => {
    container.set.position(50, 64);
};


/**
 * @param {Float} dt 
 */
const physicsTick = (dt) => {
    moveElapsedTime -= dt;
    
    if (moveElapsedTime < .0) {
        container.x += moveDir * H_STEP_DISTANCE * dt;
        moveElapsedTime = MAX_MOVE_ELAPSED_TIME;

        container.children.map((e) => {
            if (!e.alive) {
                return;
            }
            
            // @TODO: no idea why this wrap isn't working
            // curTexture = curTexture + 1 > 1 ? 0 : 1;
            e.texture = e.textures[e.texture === e.textures[0] ? 1 : 0];
        });
    }

    if (container.x < 50) {
        container.x = 50;
        moveDir = 1;
        container.y += V_STEP_DISTANCE;
    }
    else if (container.x + container.width > 590) {
        container.x = 590 - container.width;
        stepDown();
    }

    shotElapsedTime -= dt;

    if (shotElapsedTime < .0) {
        shoot();
        shotElapsedTime = Math.random() * 150.0 + 20;
    }
};


/**
 * Handler for when one of the enemies gets hit.
 * @param {Object} enemy
 */
const onHit = (enemy) => {
    totalEnemiesAlive -= 1;

    enemy.alive = false;
    enemy.textures = destroyAnimation;
    enemy.loop = false;
    enemy.animationSpeed = .01;

    enemy.onComplete = () => {
        enemy.visible = false;
        container.calculateBounds();

        if (totalEnemiesAlive === 0) {
            Globals.onGameWin();
        }
    };

    enemy.play();
};


const reset = () => {
    moveDir = 1;
    container.position.set(50, 64);
    
    container.children.forEach((e) => {
        e.textures = e.idle_animation;
        e.alive = true;
        e.visible = true;
    });

    container.calculateBounds();
    totalEnemiesAlive = container.children.length;
};


const shoot = () => {
    if (totalEnemiesAlive === 0) {
        return;
    }

    const enemiesAlive = container.children.filter((e) => e.alive);
    const id = Math.floor(Math.random() * enemiesAlive.length);
    const e = enemiesAlive[id];
    const gp = e.getGlobalPosition();
    
    ProjectilesManager.instantiateProjectile({
        x: gp.x + e.width / 2.0,
        y: gp.y + e.height
    });
};


/**
 * Handles moving the container down.
 */
const stepDown = () => {
    moveDir = -1;
    container.y += V_STEP_DISTANCE;
    
    const bot = container.y + container.height;
    if (Math.abs(bot - 425) < 32) {
        Globals.onGameOver();
    }
};


export { container, load, onHit, physicsTick, ready, reset };