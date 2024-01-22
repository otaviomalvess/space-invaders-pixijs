import { Assets, Container, Sprite, Text } from '../../node_modules/pixi.js/dist/pixi.min.mjs';
import { app } from '../index.js'; // @WORKAROUND: not a fan of doing this.


const score = new Text( 'score: 0', {
    fontFamily: ['Helvetica', 'Arial', 'sans-serif'],
    fontSize: 24,
    fill: 0xffffff,
});
const livesContainer = new Container();
const gameOverText = new Text( 'Game Over', {
    fontFamily: ['Helvetica', 'Arial', 'sans-serif'],
    fontSize: 64,
    fill: 0xffffff,
});


/**
 * @returns `Assets.load` promise.
 */
const load = async () => {
    
    const promise = Assets.load('game/player/player_sheet.json'); 
    await promise.then((spritesheet) => {
        app.stage.addChild(score);

        for (let i = 0; i < 3; i++) {
            const liveSprite = new Sprite(spritesheet.textures["idle.png"]);
            livesContainer.addChild(liveSprite);
            
            liveSprite.x = 48 * i;
            liveSprite.tint = 0x00ff00;
        }

        app.stage.addChild(livesContainer);
    });
    
    return promise;
};


const ready = () => {
    score.position.set(10, 10);
    livesContainer.position.set(630 - livesContainer.width, 10)
    
    gameOverText.x = app.screen.width / 2 - gameOverText.width / 2;
    gameOverText.y = app.screen.height / 2 - gameOverText.height / 2;
};


const reset = () => {
    score.text = 'score: 0';
    livesContainer.children.forEach( (sprite) => sprite.visible = true );
    app.stage.removeChild(gameOverText);
};


const showGameOverText = () => {
    app.stage.addChild(gameOverText);
};


const updateLives = (value) => {
    livesContainer.getChildAt(0).visible = value > 2;
    livesContainer.getChildAt(1).visible = value > 1;
    livesContainer.getChildAt(2).visible = value > 0;
};


const updateScore = (value) => {
    score.text = `score: ${value}`;
};


export { load, ready, reset, showGameOverText, updateLives, updateScore };