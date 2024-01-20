import * as PIXI from '../node_modules/pixi.js/dist/pixi.min.mjs';


const GameState = {
    OK: 0,
    PLAYER_DESTROYED: 1,
    PLAYER_FAIL: 2,
    PLAYER_WIN: 3
};
Object.freeze(GameState);

let cur_game_state = GameState.OK;

// App
const app = new PIXI.Application({
    width: 640,
    height: 480,
});

document.body.appendChild(app.view);


// Floor
const floor = new PIXI.Graphics();
floor.x = 50;
floor.y = 425;
floor.lineStyle(5, 0x00ff00);
floor.lineTo(540, 0);


// Player
const player = {
    sprite_sheet: null,
    sprite: null,
    projectile: {
        sprite: null,

        v_move_dir: -1,
        active: false
    },

    move_input: {
        right: false,
        left: false
    },
    move_speed: 2.0,
    lives: 3,
    score: 0,

    input: (e) => {
        switch (e.code) {
            case 'KeyD':
            case 'ArrowRight':
                player.move_input.right = e.type === "keydown";
                break;

            case 'KeyA':
            case 'ArrowLeft':
                player.move_input.left = e.type === "keydown";
                break;

            case 'KeyW':
            case 'ArrowUp':
            case 'Space':
                if (e.type !== "keydown" || player.projectile.active) {
                    break;
                }

                player.projectile.sprite.x = player.sprite.getGlobalPosition().x + 24;
                player.projectile.sprite.y = player.sprite.getGlobalPosition().y;
                projectiles.push(player.projectile);
                player.projectile.active = true;

                app.stage.addChild(player.projectile.sprite);

                break;
        }
    },
    onHit: () => {
        cur_game_state = GameState.PLAYER_DESTROYED;

        player.lives--;
        hud.updateLives(player.lives);
        
        projectile.clear_projectiles();

        player.sprite.textures = player.sprite_sheet.animations.destroy;
        player.sprite.animationSpeed = .01;
        player.sprite.loop = false;
        
        player.sprite.onComplete = () => {
            player.sprite.textures = player.sprite_sheet.animations.idle;
            player.sprite.loop = true;

            if (player.lives == 0) {
                console.log("Game Over");
                cur_game_state = GameState.PLAYER_FAIL;
            } else {
                cur_game_state = GameState.OK;
            }
        };
        
        player.sprite.play();
    }
};


// Enemies
const enemies_group = {
    container: new PIXI.Container(),
    destroy_animation: [],

    move_dir: 1,
    h_step_distance: 48,
    v_step_distance: 24,
    max_move_elapsed_time: 75,
    move_elapsed_time: 75,

    shot_elapsed_time: 2.5,

    onHit: (enemy) => {
        enemy.textures = enemies_group.destroy_animation;
        enemy.loop = false;
        enemy.animationSpeed = .01;

        enemy.onComplete = () => {
            enemies_group.container.removeChild(enemy);
            app.stage.removeChild(enemy);
        };

        enemy.play();
    },
    shoot: () => {
        const id = Math.floor(Math.random() * enemies_group.container.children.length);
        const e = enemies_group.container.getChildAt(id);
        const e_gp = e.getGlobalPosition();
        projectile.instanciate_enemy_projectile({
            x: e_gp.x + e.width / 2.0,
            y: e_gp.y + e.height
        });

        enemies_group.shot_elapsed_time = Math.random() * 150.0 + 20;
    },
};


// Projectiles
const projectile = {
    sheet: null,

    max_speed: 3.0,
    v_move_dir: 1.0,

    clear_projectiles: () => {
        projectiles.map((p) => {
            if (p.sprite) {
                app.stage.removeChild(p.sprite);
            } else {
                app.stage.removeChild(p);
            }
        });

        projectiles.length = 0;
    },
    instanciate_enemy_projectile: (initial_position) => {
        const anim = Math.floor(Math.random() * 3 + 1);
        const p = new PIXI.AnimatedSprite(projectile.sheet.animations[`proj_${anim}`]);
        p.x = initial_position.x;
        p.y = initial_position.y;
        p.animationSpeed = 1 / projectile.max_speed;
        p.play();

        projectiles.push(p);
        app.stage.addChild(p);
    }
};
const projectiles = [];


// HUD
const hud = {
    score: new PIXI.Text( 'score: 0', {
        fontFamily: ['Helvetica', 'Arial', 'sans-serif'],
        fontSize: 36,
        fill: 0xffffff,
    }),
    lives: [],

    reset: () => {
        hud.score.text = 'score: 0';
        hud.lives.map((sprite) => { sprite.visible = true; });
    },
    updateLives: (value) => {
        hud.lives[2].visible = value > 2;
        hud.lives[1].visible = value > 1;
        hud.lives[0].visible = value > 0;
    },
    updateScore: (value) => {
        hud.score.text = `score: ${value}`;
    },
};


// GAME
const setup = async () => {
    // Floor
    app.stage.addChild(floor);
    
    // HUD
    app.stage.addChild(hud.score);
    hud.score.x = 10;
    hud.score.y = 10;
    

    const assets_promises = [
        PIXI.Assets.load('game/player/player_sheet.json'),
        PIXI.Assets.load('game/enemies/enemies_sheet.json'),
        PIXI.Assets.load('game/projectile/projectiles_sheet.json')
    ];

    // Player
    document.addEventListener('keydown', player.input);
    document.addEventListener('keyup', player.input);
    await assets_promises[0].then((spritesheet) => {
        player.sprite_sheet = spritesheet;

        player.sprite = new PIXI.AnimatedSprite(player.sprite_sheet.animations.idle);
        player.sprite.anchor.y = .5;
        player.sprite.x = app.renderer.width / 2.0;
        player.sprite.y = floor.position.y - 25;
        player.sprite.tint = 0x00ff00;

        app.stage.addChild(player.sprite);

        
        // HUD - Lives
        for (let i = 0; i < 3; i++) {
            const sprite = new PIXI.Sprite(player.sprite_sheet.animations.idle[0]);
            hud.lives.push(sprite);
            app.stage.addChild(sprite);

            hud.lives[i].y = 10;
            hud.lives[i].x = i > 0 ? hud.lives[i-1].x - 48 : 592 - 48;
            hud.lives[i].tint = 0x00ff00;
        }
    });

    // Enemies    
    await assets_promises[1].then((spritesheet) => {
        enemies_group.destroy_animation = spritesheet.animations.destroy

        const n_enemies = 10;
        let cur_l = 0;
        let cur_c = 0;

        for (let i = 0; i < n_enemies; i++) {
            const enemy = new PIXI.AnimatedSprite(spritesheet.animations.alien_1);
            enemy.position.set(50 * cur_l, 50 * cur_c);
            enemies_group.container.addChild(enemy);

            cur_l++;
            if (cur_l >= n_enemies / 2) {
                cur_l = 0;
                cur_c++;
            }
        }

        app.stage.addChild(enemies_group.container);
    });

    // Projectiles
    await assets_promises[2].then((spritesheet) => {
        projectile.sheet = spritesheet;

        player.projectile.sprite = new PIXI.Sprite(projectile.sheet.animations.player_proj[0]);
        player.projectile.sprite.tint = 0x00ff00;
    });

    //
    Promise.allSettled(assets_promises).then(() => {
        ticker.start();
    });
}


const mainLoop = (dt) => {
    if (cur_game_state !== GameState.OK) {
        return;
    }

    // Player
    player.sprite.x += (player.move_input.right - player.move_input.left) * player.move_speed * dt;

    if (player.x < 50) {
        player.x = 50;
    }
    else if (player.x > 540) {
        player.x = 540;
    }

    if (enemies_group.container.children.length == 0) {
        console.log("Game End!");
        return;
    }

    // Enemies
    enemies_group.move_elapsed_time -= dt;

    if (enemies_group.move_elapsed_time < .0) {
        enemies_group.container.x += enemies_group.move_dir * enemies_group.h_step_distance;
        enemies_group.move_elapsed_time = enemies_group.max_move_elapsed_time;

        enemies_group.container.children.map((e) => {
            e.texture = e.textures[e.texture === e.textures[0] ? 1 : 0];
        });
    }

    if (enemies_group.container.x < 50) {
        enemies_group.container.x = 50;
        enemies_group.move_dir = 1;
        enemies_group.container.y += enemies_group.v_step_distance;
    }
    else if (enemies_group.container.x + enemies_group.container.width > 540) {
        enemies_group.container.x = 540 - enemies_group.container.width;
        enemies_group.move_dir = -1;
        enemies_group.container.y += enemies_group.v_step_distance;
    }

    enemies_group.shot_elapsed_time -= dt;

    if (enemies_group.shot_elapsed_time < .0) {
        enemies_group.shoot();
    }


    // Projectiles
    projectiles.map((p) => {
        if (p.sprite) {
            p.sprite.y += p.v_move_dir * projectile.max_speed * dt;
        } else {
            p.y += projectile.v_move_dir * projectile.max_speed * dt;
        }
    });

    // Collision
    projectiles.map((p, id) => {

        if (p.sprite) {

            // Out of Bounds
            if (p.sprite.y < .0 || p.sprite.y > floor.y) {
                app.stage.removeChild(p.sprite);
    
                player.projectile.active = false;
                projectiles.splice(id, 1);
                return;
            }

            // Against Enemies
            for (let j = 0; j < enemies_group.container.children.length; j++) {
                const e = enemies_group.container.children[j];
                const e_gp = e.getGlobalPosition();
                const e_end_bounds = {
                    x: e_gp.x + e.width,
                    y: e_gp.y + e.height,
                };

                if (p.sprite.y > e_gp.y && p.sprite.y < e_end_bounds.y &&
                    p.sprite.x > e_gp.x && p.sprite.x < e_end_bounds.x
                ) {
                    app.stage.removeChild(p.sprite);
                    enemies_group.onHit(e);

                    player.score += 10;
                    hud.updateScore(player.score);

                    player.projectile.active = false;
                    projectiles.splice(id, 1);
                    return;
                }
            };
        
        } else {
            // Out of Bounds
            if (p.y < .0 || p.y + p.height > floor.y) {
                app.stage.removeChild(p);
                projectiles.splice(id, 1);

                return;
            }

            // Against Player
            const p_end_bounds = {
                x: player.sprite.x + player.sprite.width,
                y: player.sprite.y + player.sprite.height
            }
            
            if (p.y > player.sprite.y && p.y < p_end_bounds.y &&
                p.x > player.sprite.x && p.x < p_end_bounds.x
            ) {
                player.onHit();
                app.stage.removeChild(p);
                projectiles.splice(id, 1);
            }
            return;
        }
    });
}

const ticker = new PIXI.Ticker();
ticker.add(mainLoop);

setup();