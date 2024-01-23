import { Ticker } from '../node_modules/pixi.js/dist/pixi.min.mjs';
import { createApplication } from './application/application.js';
import * as Floor from '../game/floor/floor.js';
import * as Player from '../game/player/player.js';
import * as Enemies from '../game/enemies/enemies.js';
import * as ProjectilesManager from './projectile/projectiles_manager.js';
import * as Projectile from '../game/projectile/projectile.js';
import * as HUD from '../game/ui/hud.js';
import { curGameState, GameState, setCurGameState, setOnGameRestart } from '../game/globals.js';


// Game Win Transition
const MAX_GAME_WIN_TRANSITION_TIME = 20.0;
let gameWinTransitionElapsedTime;


/**
 * Makes sure that all game assets are loaded before running the game.
 */
const setup = async () => {
    createApplication();

    setOnGameRestart(gameRestart);
    Player.setOnDied(gameOver);
    Enemies.setOnSteppedDown(checkEnemiesReachedFloor);
    Enemies.setOnEnemyDestroyed(checkLevelCompleted);

    const loadPromises = [
        Player.load(),
        Enemies.load(),
        ProjectilesManager.load(),
        HUD.load()
    ];

    Promise.allSettled(loadPromises).then(() => {
        Floor.ready();
        Player.ready();
        Enemies.ready();
        ProjectilesManager.ready();
        HUD.ready();

        ticker.start();
    });
}


/**
 * @param {Float} dt
 */
const mainLoop = (dt) => {
    if (curGameState === GameState.PLAYER_WIN) {
        gameWinTransitionElapsedTime -= dt;
        if (gameWinTransitionElapsedTime <= .0) {
            loadNextLevel();
        }

        return;
    }

    if (curGameState !== GameState.OK) {
        return;
    }

    Player.physicsTick(dt);
    Enemies.physicsTick(dt);
    ProjectilesManager.physicsTick(dt);

    // Collision
    ProjectilesManager.projectiles.forEach((proj) => {
        const projBounds = { 
            ax: proj.animSprite.x,
            ay: proj.animSprite.y,
            bx: proj.animSprite.x + proj.animSprite.width,
            by: proj.animSprite.y + proj.animSprite.height
        };

        if (proj.fromPlayer) {
            // Collision against Enemies
            for (let j = 0; j < Enemies.container.children.length; j++) {
                const en = Enemies.container.getChildAt(j);
                if (!en.alive) {
                    continue;
                }

                const enBounds = {
                    ax: en.getGlobalPosition().x,
                    ay: en.getGlobalPosition().y,
                    bx: en.getGlobalPosition().x + en.width,
                    by: en.getGlobalPosition().y + en.height,
                };

                if (!(projBounds.ax >= enBounds.ax && projBounds.bx <= enBounds.bx &&
                    projBounds.ay >= enBounds.ay && projBounds.by <= enBounds.by)
                ) {
                    continue;
                }
                
                Enemies.hit(en);
                Projectile.hit(proj);

                return;
            };
        
        } else {
            // Collision against Player
            const plBounds = Player.getBounds();
            
            if (!(projBounds.ay >= plBounds.ay && projBounds.by <= plBounds.by &&
                projBounds.ax >= plBounds.ax && projBounds.bx <= plBounds.bx)
            ) {
                return;
            }

            Player.hit();
            Projectile.hit(proj);
        }
    });
}


/**
 * Checks if the game is over.
 */
const checkEnemiesReachedFloor = () => {
    if (Math.abs(Enemies.getContainerBottomY() - Floor.getYPosition()) < 32) {
        gameOver();
    }
};


const checkLevelCompleted = () => {
    if (Enemies.totalEnemiesAlive === 0) {
        levelCompleted();
    }
};


/**
 * Changes the state of the game and starts level transition.
 */
const levelCompleted = () => {
    setCurGameState(GameState.PLAYER_WIN);
    ProjectilesManager.reset();

    gameWinTransitionElapsedTime = MAX_GAME_WIN_TRANSITION_TIME;
};


/**
 * Resets the actors and the game state.
 */
const loadNextLevel = () => {
    Player.onLevelReset();
    Enemies.reset();

    setCurGameState(GameState.OK);
};


/**
 * Ends the game.
 */
const gameOver = () => {
    ticker.stop();
    setCurGameState(GameState.GAME_OVER);

    HUD.showGameOverText();
    ProjectilesManager.reset();
};


export const gameRestart = () => {
    Player.reset();
    Enemies.reset();
    ProjectilesManager.reset();
    HUD.reset();

    setCurGameState(GameState.OK);
    ticker.start();
};


const ticker = new Ticker();
ticker.add(mainLoop);

setup();