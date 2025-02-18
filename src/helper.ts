import { Vector3 } from './vector';
import { applyMatrix } from './matrix';

export function rotateAroundPoint(v: Vector3, pivot: Vector3, matrix: number[][]): Vector3 {
  const translated = v.subtract(pivot);         // 1. 평행이동
  const rotated = applyMatrix(translated, matrix); // 2. 회전
  return rotated.add(pivot);                      // 3. 원위치 복귀
}
