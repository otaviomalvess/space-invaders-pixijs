import { AnimatedSprite, Assets } from '../../pixi/pixi.mjs';
import { app } from '../application/application.js';
import * as Projectile from './projectile.js';


const projectiles = [];

let spritesheet;


/**
 * @returns `Assets.load` promise.
 */
const load = async () => {
    const promise = Assets.load('game/projectile/projectiles_sheet.json');
    await promise.then((projectilesSheet) => {
        spritesheet = projectilesSheet;
    });

    return promise;
};


const ready = () => {
    Projectile.setOnDestroyed(removeProjectile);
};


/**
 * @param {Float} dt 
 */
const physicsTick = (dt) => {
    projectiles.forEach((p) => {
        const isOutOfBounds = Projectile.move(p, dt);
        
        if (!isOutOfBounds) {
            return;
        }
        
        app.stage.removeChild(p.animSprite);
        removeProjectile(p);

        if (p.outOfBounds) {
            p.outOfBounds();
        }
    });
};


/**
 * Adds the projectile to the array and to the stage.
 * @param {Object} projectile 
 */
const addProjectile = (projectile) => {
    projectiles.push(projectile);
    app.stage.addChild(projectile.animSprite);
};


/**
 * @returns {Array} the player projectile animation from the spritesheet.
 */
const getPlayerProjectileSprite = () => {
    return spritesheet.animations.player_proj;
};


/**
 * Instantiates a projectile at the given initial position.
 * The projectile animation is chosen randomly.
 * @param {Object} initialPosition 
 */
const instantiateProjectile = (initialPosition) => {
    const anim = Math.floor(Math.random() * 3 + 1);
    const p = Projectile.create();
    p.animSprite = new AnimatedSprite(spritesheet.animations[`proj_${anim}`]);
    p.verticalDirection = 1;
    Projectile.ready(p, initialPosition);
    
    addProjectile(p);
};


/**
 * Removes the given projectile from the array of projectiles.
 * @param {Object} projectile.
 */
const removeProjectile = (projectile) => {
    const id = projectiles.findIndex((value) => projectile === value);
    projectiles.splice(id, 1);
};


/**
 * Removes all projectiles from stage and clears the array of projectiles.
 */
const reset = () => {
    projectiles.forEach((p) => {
        app.stage.removeChild(p.animSprite)
        
        // @TODO: this shouldn't be here.
        if (p.fromPlayer) {
            p.shot = false;
        }
    });
    projectiles.length = 0;
    
};


export {
    addProjectile,
    getPlayerProjectileSprite,
    instantiateProjectile,
    load,
    physicsTick,
    projectiles,
    ready,
    removeProjectile,
    reset
};