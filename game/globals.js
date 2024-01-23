const GameState = {
    OK: 0,
    GAME_OVER: 1,
    PLAYER_DESTROYED: 2,
    PLAYER_WIN: 3
};
Object.freeze(GameState);

let curGameState = GameState.OK;

let onGameRestart;


/**
 * Sets the current game state.
 * @param {GameState} nextState 
 */
const setCurGameState = (nextState) => curGameState = nextState;


const setOnGameRestart = (func) => onGameRestart = func;


export { curGameState, GameState, onGameRestart, setCurGameState, setOnGameRestart};