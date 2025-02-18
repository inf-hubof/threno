// src/matrix.ts
import { Vector3 } from './vector';

export function applyMatrix(v: Vector3, m: number[][]): Vector3 {
  const x = v.x * m[0][0] + v.y * m[0][1] + v.z * m[0][2];
  const y = v.x * m[1][0] + v.y * m[1][1] + v.z * m[1][2];
  const z = v.x * m[2][0] + v.y * m[2][1] + v.z * m[2][2];
  return new Vector3(x, y, z);
}

export function rotationY(angle: number): number[][] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    [cos, 0, sin],
    [0,   1, 0],
    [-sin, 0, cos]
  ];
}

export function rotationX(angle: number): number[][] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    [1, 0,    0],
    [0, cos, -sin],
    [0, sin, cos]
  ];
}

export function multiplyMatrix(a: number[][], b: number[][]): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < 3; i++) {
    result[i] = [];
    for (let j = 0; j < 3; j++) {
      result[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j];
    }
  }
  return result;
}
