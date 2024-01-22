import { app } from '../index.js'; // @WORKAROUND: not a fan of doing this.
import * as ProjectilesManager from './projectiles_manager.js';


const SPEED = 3.0;


/**
 * Creates the projectile.
 * @returns {Object} the projectile.
 */
const create = () => {
    return {
        animSprite: null,
        verticalDirection: 0,
        fromPlayer: false,
        // Events
        onHit: {},
        outOfBounds: undefined
    };
}


/**
 * @param {Object} projectile
 * @param {{x, y}} initialPosition
 */
const ready = (projectile, initialPosition) => {
    projectile.animSprite.position.set(initialPosition.x, initialPosition.y);
    
    if (projectile.animSprite.textures.length > 1) {
        projectile.animSprite.animationSpeed = 1 / SPEED;
        projectile.animSprite.play();
    }
};


/**
 * Handles the projectile collision.
 * @param {Object} projectile 
 */
const hit = (projectile) => {
    app.stage.removeChild(projectile.animSprite);

    projectile.onHit();
    ProjectilesManager.removeProjectile(projectile);
};


/**
 * Moves the projectile sprite at the scene.
 * @param {Object} projectile 
 * @param {Float} dt 
 */
const move = (projectile, dt) => {
    projectile.animSprite.y += projectile.verticalDirection * SPEED * dt;

    // Check if out of bounds.
    const bot = projectile.animSprite.y + projectile.animSprite.height;
    if (bot < .0 || bot > 480) {
        app.stage.removeChild(projectile.animSprite);
        ProjectilesManager.removeProjectile(projectile);

        if (projectile.outOfBounds) {
            projectile.outOfBounds();
        }
    }
};


export { create, hit, move, ready };