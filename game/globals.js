const GameState = {
    OK: 0,
    GAME_OVER: 1,
    PLAYER_DESTROYED: 2,
    PLAYER_WIN: 3
};
Object.freeze(GameState);

let curGameState = GameState.OK;

let onGameOver;
let onGameWin;


/**
 * Sets the current game state.
 * @param {GameState} nextState 
 */
const setCurGameState = (nextState) => curGameState = nextState;


/**
 * Subscribes the given function to `onGameOver`.
 * @param {Function} func
 */
const setOnGameOver = (func) => onGameOver = func;


/**
 * Subscribes the given function to `onGameWin`.
 * @param {Function} func
 */
const setOnGameWin = (func) => onGameWin = func;


export { curGameState, GameState, onGameOver, onGameWin, setCurGameState, setOnGameOver, setOnGameWin};