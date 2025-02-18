// src/render.ts
import chalk from 'chalk';
import { Vector3 } from './vector';
import { Ray } from './ray';
import { SceneObject } from './sceneObject';
import { Intersection } from './types';
import { rotationY, rotationX, multiplyMatrix, applyMatrix } from './matrix';

// 이전 프레임의 색상 정보를 저장할 2차원 배열
let prevFrame: { r: number; g: number; b: number }[][] = [];

export interface RenderSettings {
  width: number;
  height: number;
  fov: number;
  cameraPos: Vector3;
  cameraYaw: number;
  cameraPitch: number;
  skyTop: { r: number; g: number; b: number };
  skyBottom: { r: number; g: number; b: number };
  ambient: number;
  lightDir: Vector3;
  // 안티에일리언싱: 픽셀당 서브샘플의 제곱근 값 (예: 2이면 2x2 샘플링)
  aaSampleSqrt: number;
}

// 그림자 검사 함수: 현재 픽셀의 hit point에서 약간 오프셋된 위치에서 광선을 쏴서 그림자 여부를 판단
function inShadow(point: Vector3, currentHit: Intersection, objects: SceneObject[]): boolean {
  const offset = currentHit.normal.multiply(1e-4);
  const shadowRay = new Ray(point.add(offset), currentHit.normal.multiply(-1));
  for (let obj of objects) {
    if (obj === currentHit.object) continue;
    const hit = obj.intersect(shadowRay);
    if (hit) return true;
  }
  return false;
}

export function render(scene: SceneObject[], settings: RenderSettings): void {
  const {
    width,
    height,
    fov,
    cameraPos,
    cameraYaw,
    cameraPitch,
    skyTop,
    skyBottom,
    ambient,
    lightDir,
    aaSampleSqrt,
  } = settings;
  const aspectRatio = width / height;
  
  // 안티에일리언싱: 픽셀당 서브샘플 수 계산 (aaSampleSqrt x aaSampleSqrt)
  const sampleSqrt = aaSampleSqrt > 0 ? aaSampleSqrt : 1;
  const totalSamples = sampleSqrt * sampleSqrt;

  // 카메라 회전 행렬 계산 (yaw, pitch 적용)
  const camRotY = rotationY(cameraYaw);
  const camRotX = rotationX(cameraPitch);
  const cameraRotation = multiplyMatrix(camRotY, camRotX);

  // 새 프레임 버퍼 생성 (각 셀은 {r, g, b} 객체)
  const newFrame: { r: number; g: number; b: number }[][] = [];
  
  for (let j = 0; j < height; j++) {
    newFrame[j] = [];
    for (let i = 0; i < width; i++) {
      let accumulatedColor = { r: 0, g: 0, b: 0 };

      // 각 픽셀에서 서브샘플링 수행
      for (let sy = 0; sy < sampleSqrt; sy++) {
        for (let sx = 0; sx < sampleSqrt; sx++) {
          // 픽셀 내 서브픽셀 좌표 계산 (0~1 사이 오프셋)
          const subI = i + (sx + 0.5) / sampleSqrt;
          const subJ = j + (sy + 0.5) / sampleSqrt;
          
          // 서브샘플에 대한 뷰포트 좌표 변환
          const x = (2 * subI / width - 1) * aspectRatio * Math.tan(fov / 2);
          const y = (1 - 2 * subJ / height) * Math.tan(fov / 2);
          
          // 기본 광선 방향 계산 및 카메라 회전 적용
          const initialRayDir = new Vector3(x, y, 1).normalize();
          const orientedRayDir = applyMatrix(initialRayDir, cameraRotation).normalize();
          const ray = new Ray(cameraPos, orientedRayDir);
          
          let closestHit: Intersection | null = null;
          // scene의 모든 객체와의 교차 판정
          for (let obj of scene) {
            const hit = obj.intersect(ray);
            if (hit && (!closestHit || hit.dist < closestHit.dist)) {
              closestHit = hit;
            }
          }

          let sampleColor;
          if (closestHit) {
            let lightIntensity = Math.max(0, closestHit.normal.dot(lightDir.multiply(-1)));
            if (inShadow(closestHit.point, closestHit, scene)) {
              lightIntensity *= 0.3;
            }
            lightIntensity = ambient + (1 - ambient) * lightIntensity;
            sampleColor = {
              r: Math.min(255, closestHit.color.r * lightIntensity),
              g: Math.min(255, closestHit.color.g * lightIntensity),
              b: Math.min(255, closestHit.color.b * lightIntensity),
            };
          } else {
            // 배경: 하늘 그라데이션
            const t = (ray.direction.y + 1) / 2;
            sampleColor = {
              r: skyBottom.r * (1 - t) + skyTop.r * t,
              g: skyBottom.g * (1 - t) + skyTop.g * t,
              b: skyBottom.b * (1 - t) + skyTop.b * t,
            };
          }
          
          accumulatedColor.r += sampleColor.r;
          accumulatedColor.g += sampleColor.g;
          accumulatedColor.b += sampleColor.b;
        }
      }
      
      // 서브샘플들의 평균 색상 계산
      accumulatedColor.r = Math.floor(accumulatedColor.r / totalSamples);
      accumulatedColor.g = Math.floor(accumulatedColor.g / totalSamples);
      accumulatedColor.b = Math.floor(accumulatedColor.b / totalSamples);
      
      newFrame[j][i] = accumulatedColor;
    }
  }
  
  // 이전 프레임과 비교하여 변경된 픽셀만 업데이트 (부분 갱신)
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const newPixel = newFrame[j][i];
      const oldPixel = (prevFrame[j] && prevFrame[j][i]) || { r: -1, g: -1, b: -1 };
      if (oldPixel.r !== newPixel.r || oldPixel.g !== newPixel.g || oldPixel.b !== newPixel.b) {
        // ANSI escape code로 커서를 해당 위치로 이동 (터미널은 1부터 시작)
        process.stdout.write(`\x1b[${j + 1};${i + 1}H`);
        process.stdout.write(chalk.bgRgb(newPixel.r, newPixel.g, newPixel.b)(' '));
      }
    }
  }
  
  // 현재 프레임을 이전 프레임으로 저장
  prevFrame = newFrame;
}
