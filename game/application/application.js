import { Application } from '../../node_modules/pixi.js/dist/pixi.min.mjs';


const app = new Application({
    width: 640,
    height: 480,
});


const createApplication = () => {
    document.body.appendChild(app.view);
};


export { app, createApplication };