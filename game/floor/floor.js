import { Graphics } from '../../node_modules/pixi.js/dist/pixi.min.mjs';
import { app } from '../index.js'; // @WORKAROUND: not a fan of doing this.


const floor = new Graphics();


const ready = () => {
    floor.position.set(50, 425);
    floor.lineStyle(5, 0x00ff00);
    floor.lineTo(540, 0);

    app.stage.addChild(floor);
};


export { ready };