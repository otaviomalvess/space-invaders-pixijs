import { Application } from '../../pixi/pixi.mjs';


const app = new Application({
    width: 640,
    height: 480,
});


const createApplication = () => {
    document.getElementById("center-container").appendChild(app.view);
};


export { app, createApplication };