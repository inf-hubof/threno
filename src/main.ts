// src/main.ts
import { render, RenderSettings } from './render';
import { createCube, createPyramid, createGround } from './scene';
import { Vector3 } from './vector';
import { rotationY, rotationX, multiplyMatrix } from './matrix';

// 상수 설정
const GRAVITY = -9.8;     // 중력 가속도 (units/sec^2)
const JUMP_SPEED = 5;     // 점프 초기 속도
const GROUND_LEVEL = 0;   // 땅 높이 (y 좌표)
const EYE_HEIGHT = 1.6;   // 카메라(눈) 높이

// 플레이어(물리) 객체: 실제 위치와 속도, 그리고 회전 값
const player = {
  position: new Vector3(0, 0, -5),
  velocity: new Vector3(0, 0, 0),
  yaw: 0,
  pitch: 0,
};

// 오브젝트 생성
const ground = createGround(new Vector3(0, GROUND_LEVEL, 0), 100, 100, { r: 255, g: 255, b: 255 });
const cube = createCube(new Vector3(-1.5, 5, 3), 2, { r: 50, g: 220, b: 50 }, { gravity: true });
const pyramid = createPyramid(new Vector3(3, 5, 4), 2, 2, { r: 50, g: 50, b: 220 }, { gravity: true });
const sceneObjects = [ground, cube, pyramid];

// 렌더링 설정 (카메라 위치에 EYE_HEIGHT 오프셋 적용)
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

// 키 입력 처리: 터미널 입력을 통해 플레이어 이동 및 회전
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

const moveSpeed = 0.5;
const turnSpeed = 0.05;

process.stdin.on('data', (key: string | Buffer) => {
  const strKey = typeof key === 'string' ? key : key.toString();
  if (strKey === '\u0003') { // Ctrl+C 종료
    process.exit();
  }

  // 플레이어의 yaw 값을 기반으로 forward, right 방향 계산
  const forward = new Vector3(Math.sin(player.yaw), 0, Math.cos(player.yaw));
  const right = new Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));

  if (strKey === 'w') {
    // forward 방향으로 이동
    player.position = player.position.add(forward.multiply(moveSpeed));
  } else if (strKey === 's') {
    // backward: forward의 반대 방향
    player.position = player.position.subtract(forward.multiply(moveSpeed));
  } else if (strKey === 'a') {
    // 왼쪽: right의 반대 방향
    player.position = player.position.subtract(right.multiply(moveSpeed));
  } else if (strKey === 'd') {
    // 오른쪽: right 방향으로 이동
    player.position = player.position.add(right.multiply(moveSpeed));
  } else if (strKey === '\x1b[A') { // 위쪽 화살표: pitch 감소 (위로 보기)
    player.pitch = Math.max(player.pitch - turnSpeed, -Math.PI / 2);
  } else if (strKey === '\x1b[B') { // 아래쪽 화살표: pitch 증가 (아래로 보기)
    player.pitch = Math.min(player.pitch + turnSpeed, Math.PI / 2);
  } else if (strKey === '\x1b[C') { // 오른쪽 화살표: yaw 증가
    player.yaw += turnSpeed;
  } else if (strKey === '\x1b[D') { // 왼쪽 화살표: yaw 감소
    player.yaw -= turnSpeed;
  } else if (strKey === ' ') { // 스페이스바: 점프 (플레이어)
    if (player.position.y <= GROUND_LEVEL + 0.001) {
      player.velocity = new Vector3(player.velocity.x, JUMP_SPEED, player.velocity.z);
    }
  }
});

// 메인 업데이트 루프 (50ms 간격)
setInterval(() => {
  const dt = 0.05;

  // 플레이어 중력 적용: y축 속도 업데이트 및 위치 변경
  player.velocity = new Vector3(
    player.velocity.x,
    player.velocity.y + GRAVITY * dt,
    player.velocity.z
  );
  player.position = new Vector3(
    player.position.x + player.velocity.x * dt,
    player.position.y + player.velocity.y * dt,
    player.position.z + player.velocity.z * dt
  );
  // 플레이어가 땅 아래로 내려가면 위치와 속도 조정
  if (player.position.y < GROUND_LEVEL) {
    player.position = new Vector3(player.position.x, GROUND_LEVEL, player.position.z);
    player.velocity = new Vector3(player.velocity.x, 0, player.velocity.z);
  }

  // 각 scene 오브젝트 업데이트 (중력 옵션이 켜진 경우 내부에서 처리)
  sceneObjects.forEach(obj => {
    if (obj.update) {
      obj.update(dt, GRAVITY, GROUND_LEVEL);
    }
  });

  // 렌더링 전 카메라 위치 업데이트 (플레이어 위치에 EYE_HEIGHT 오프셋 적용)
  settings.cameraPos = player.position.add(new Vector3(0, EYE_HEIGHT, 0));
  settings.cameraYaw = player.yaw;
  settings.cameraPitch = player.pitch;

  render(sceneObjects, settings);
}, 50);
