import { app } from '../application/application.js';


const SPEED = 3.0;

let onDestroyed;


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
        onHit: undefined,
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
    if (projectile.onHit) {
        projectile.onHit();
    }

    app.stage.removeChild(projectile.animSprite);
    onDestroyed(projectile);
};


/**
 * Moves the projectile sprite at the scene.
 * @param {Object} projectile 
 * @param {Float} dt 
 * @returns `true` if projectile is out of bounds. `false` if not.
 */
const move = (projectile, dt) => {
    projectile.animSprite.y += projectile.verticalDirection * SPEED * dt;

    // Check if out of bounds.
    const bot = projectile.animSprite.y + projectile.animSprite.height;
    return bot < .0 || bot > 480;
};


const setOnDestroyed = (func) => onDestroyed = func;


export { create, hit, move, ready, setOnDestroyed };