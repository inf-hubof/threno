// src/sceneObject.ts
import { Ray } from './ray';
import { Intersection } from './types';
import { Vector3 } from './vector';

export abstract class SceneObject {
  // 중력 옵션 (기본 false)와 물리적 이동을 위한 속도 벡터
  public gravity: boolean = false;
  public velocity: Vector3 = new Vector3(0, 0, 0);
  
  abstract intersect(ray: Ray): Intersection | null;

  // dt: 경과 시간(초), gravity: 중력 가속도, groundLevel: 바닥 높이
  update?(dt: number, gravity: number, groundLevel: number): void;
}
