import { render, RenderSettings } from "./render";
import { createCube, createPyramid, createGround } from "./scene";
import { Vector3 } from "./vector";

const GRAVITY = -9.8;
const JUMP_SPEED = 5;
const GROUND_LEVEL = 0;
const EYE_HEIGHT = 1.6;

const player = {
    position: new Vector3(0, 0, -5),
    velocity: new Vector3(0, 0, 0),
    yaw: 0,
    pitch: 0,
};

const ground = createGround(new Vector3(0, GROUND_LEVEL, 0), 100, 100, {
    r: 255,
    g: 255,
    b: 255,
});
const cube = createCube(
    new Vector3(-1.5, 5, 3),
    2,
    { r: 50, g: 220, b: 50 },
    { gravity: true },
);
const pyramid = createPyramid(
    new Vector3(3, 5, 4),
    2,
    2,
    { r: 50, g: 50, b: 220 },
    { gravity: true },
);
const sceneObjects = [ground, cube, pyramid];

const settings: RenderSettings = {
    width: 90,
    height: 45,
    fov: Math.PI / 3,
    cameraPos: player.position.add(new Vector3(0, EYE_HEIGHT, 0)),
    cameraYaw: player.yaw,
    cameraPitch: player.pitch,
    skyTop: { r: 135, g: 206, b: 250 },
    skyBottom: { r: 115, g: 186, b: 230 },
    ambient: 0.2,
    lightDir: new Vector3(5, 10, 5).normalize(),
    aaSampleSqrt: 2,
};

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

const moveSpeed = 0.5;
const turnSpeed = 0.05;

process.stdin.on("data", (key: string | Buffer) => {
    const strKey = typeof key === "string" ? key : key.toString();
    if (strKey === "\u0003") {
        process.exit();
    }

    const forward = new Vector3(Math.sin(player.yaw), 0, Math.cos(player.yaw));
    const right = new Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));

    if (strKey === "w") {
        player.position = player.position.add(forward.multiply(moveSpeed));
    } else if (strKey === "s") {
        player.position = player.position.subtract(forward.multiply(moveSpeed));
    } else if (strKey === "a") {
        player.position = player.position.subtract(right.multiply(moveSpeed));
    } else if (strKey === "d") {
        player.position = player.position.add(right.multiply(moveSpeed));
    } else if (strKey === "\x1b[A") {
        player.pitch = Math.max(player.pitch - turnSpeed, -Math.PI / 2);
    } else if (strKey === "\x1b[B") {
        player.pitch = Math.min(player.pitch + turnSpeed, Math.PI / 2);
    } else if (strKey === "\x1b[C") {
        player.yaw += turnSpeed;
    } else if (strKey === "\x1b[D") {
        player.yaw -= turnSpeed;
    } else if (strKey === " ") {
        if (player.position.y <= GROUND_LEVEL + 0.001) {
            player.velocity = new Vector3(
                player.velocity.x,
                JUMP_SPEED,
                player.velocity.z,
            );
        }
    }
});

setInterval(() => {
    const dt = 0.05;

    player.velocity = new Vector3(
        player.velocity.x,
        player.velocity.y + GRAVITY * dt,
        player.velocity.z,
    );
    player.position = new Vector3(
        player.position.x + player.velocity.x * dt,
        player.position.y + player.velocity.y * dt,
        player.position.z + player.velocity.z * dt,
    );

    if (player.position.y < GROUND_LEVEL) {
        player.position = new Vector3(
            player.position.x,
            GROUND_LEVEL,
            player.position.z,
        );
        player.velocity = new Vector3(player.velocity.x, 0, player.velocity.z);
    }

    sceneObjects.forEach((obj) => {
        if (obj.update) {
            obj.update(dt, GRAVITY, GROUND_LEVEL);
        }
    });

    settings.cameraPos = player.position.add(new Vector3(0, EYE_HEIGHT, 0));
    settings.cameraYaw = player.yaw;
    settings.cameraPitch = player.pitch;

    render(sceneObjects, settings);
}, 50);
