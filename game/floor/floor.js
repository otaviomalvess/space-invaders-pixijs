import { Graphics } from '../../pixi/pixi.mjs';
import { app } from '../application/application.js';


const floor = new Graphics();


const ready = () => {
    floor.position.set(50, 425);
    floor.lineStyle(5, 0x00ff00);
    floor.lineTo(540, 0);

    app.stage.addChild(floor);
};


const getYPosition = () => {
    return floor.position.y;
};


export { getYPosition, ready };