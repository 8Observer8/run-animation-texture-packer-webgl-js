import { mat4 } from "gl-matrix";
import { gl, initWebGLContext } from "./webgl-context.js";
import createProgram from "./shader-program.js";
import getSpriteInfo from "./get-sprite-info.js";
import loadTexture from "./load-texture.js";
import Sprite from "./sprite.js";

async function init() {
    if (!initWebGLContext("renderCanvas")) {
        return;
    }
    gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
    gl.clearColor(0.94, 0.78, 0.95, 1);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const program = await createProgram("assets/shaders/",
        "default.vert", "default.frag");

    const aPositionLocation = gl.getAttribLocation(program, "aPosition");
    const aTexCoordLocation = gl.getAttribLocation(program, "aTexCoord");
    const uMvpMatrixLocation = gl.getUniformLocation(program, "uMvpMatrix");

    const characterTexturePath = "assets/spritesheets/character.png";
    const characterTexture = await loadTexture(characterTexturePath);
    const characterJSONPath = "assets/spritesheets/character.json";
    const characterResponse = await fetch(characterJSONPath);
    const characterContent = await characterResponse.text();
    const atlasJson = JSON.parse(characterContent);

    const spriteNames = ["RunRight01.png", "RunRight02.png",
        "RunRight03.png", "RunRight04.png"
    ];
    const spriteInfo = getSpriteInfo(atlasJson, spriteNames);
    const sprite = new Sprite(program, spriteNames, spriteInfo,
        aPositionLocation, aTexCoordLocation, uMvpMatrixLocation, characterTexture);

    const projMatrix = mat4.create();
    mat4.ortho(projMatrix, -100, 100, -100, 100, 50, -50);
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0, 0, 50], [0, 0, 0], [0, 1, 0]);
    const projViewMatrix = mat4.create();
    mat4.mul(projViewMatrix, projMatrix, viewMatrix);

    let currentTime, dt;
    let lastTime = Date.now();
    let currentAnimTime = 0;
    const animInterval = 0.1;

    let playerAnimationIndex = 0;
    const playerRunAnimations = ["RunRight01.png", "RunRight02.png",
        "RunRight03.png", "RunRight04.png"
    ];

    function animationLoop() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        requestAnimationFrame(animationLoop);

        currentTime = Date.now();
        dt = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        currentAnimTime += dt;
        if (currentAnimTime >= animInterval) {
            currentAnimTime = 0;
            playerAnimationIndex++;
            if (playerAnimationIndex >= playerRunAnimations.length) {
                playerAnimationIndex = 0;
            }
        }        
        sprite.setTextureRect(playerRunAnimations[playerAnimationIndex]);
        sprite.draw(projViewMatrix);
    }

    animationLoop();
}

init();
