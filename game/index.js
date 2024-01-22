import { Application, Ticker } from '../node_modules/pixi.js/dist/pixi.min.mjs';
import * as Floor from '../game/floor/floor.js';
import * as Player from '../game/player/player.js';
import * as Enemies from '../game/enemies/enemies.js';
import * as ProjectilesManager from './projectile/projectiles_manager.js';
import * as Projectile from '../game/projectile/projectile.js';
import * as HUD from '../game/ui/hud.js';
import * as Globals from '../game/globals.js';


// App
export const app = new Application({
    width: 640,
    height: 480,
});

document.body.appendChild(app.view);


// Game Win Transition
const MAX_GAME_WIN_TRANSITION_TIME = 20.0;
let gameWinTransitionElapsedTime;


/**
 * Makes sure that all game assets are loaded before running the game.
 */
const setup = async () => {
    Globals.setOnGameOver(gameOver);
    Globals.setOnGameWin(gameWin);

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
        HUD.ready();

        ticker.start();
    });
}


/**
 * 
 * @param {Float} dt
 */
const mainLoop = (dt) => {
    if (Globals.curGameState === Globals.GameState.PLAYER_WIN) {
        gameWinTransitionElapsedTime -= dt;
        if (gameWinTransitionElapsedTime <= .0) {
            loadNextLevel();
        }

        return;
    }

    if (Globals.curGameState !== Globals.GameState.OK) {
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
                const en = Enemies.container.children[j];
                if (!en.active) {
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

                Enemies.onHit(en);
                Projectile.hit(proj);

                if (proj.active) {
                    proj.active = false;
                }

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

            Projectile.hit(proj);
        }
    });
}


/**
 * Resets the actors and the game state.
 */
const loadNextLevel = () => {
    Player.onLevelReset();
    Enemies.reset();

    Globals.setCurGameState(Globals.GameState.OK);
};


/**
 * Ends the game.
 */
const gameOver = () => {
    ticker.stop();
    Globals.setCurGameState(Globals.GameState.GAME_OVER);

    HUD.showGameOverText();
    ProjectilesManager.reset();
};


export const gameRestart = () => {
    Player.reset();
    Enemies.reset();
    ProjectilesManager.reset();
    HUD.reset();

    Globals.setCurGameState(Globals.GameState.OK);
    ticker.start();
};


/**
 * Changes the state of the game and starts level transition.
 */
const gameWin = () => {
    Globals.setCurGameState(Globals.GameState.PLAYER_WIN);
    ProjectilesManager.reset();

    gameWinTransitionElapsedTime = MAX_GAME_WIN_TRANSITION_TIME;
};


const ticker = new Ticker();
ticker.add(mainLoop);

setup();