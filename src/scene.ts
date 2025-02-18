// src/scene.ts
import { Vector3 } from './vector';
import { Color } from './types';
import { Mesh } from './mesh';
import { Triangle } from './triangle';

export function createCube(
  center: Vector3,
  size: number,
  color: Color,
  options?: { gravity?: boolean }
): Mesh {
  const d = size / 2;
  const v = [
    new Vector3(center.x - d, center.y - d, center.z - d),
    new Vector3(center.x + d, center.y - d, center.z - d),
    new Vector3(center.x + d, center.y + d, center.z - d),
    new Vector3(center.x - d, center.y + d, center.z - d),
    new Vector3(center.x - d, center.y - d, center.z + d),
    new Vector3(center.x + d, center.y - d, center.z + d),
    new Vector3(center.x + d, center.y + d, center.z + d),
    new Vector3(center.x - d, center.y + d, center.z + d)
  ];
  const triangles: Triangle[] = [];
  // 앞면
  triangles.push(new Triangle(v[0], v[1], v[2], color));
  triangles.push(new Triangle(v[0], v[2], v[3], color));
  // 뒷면
  triangles.push(new Triangle(v[5], v[4], v[7], color));
  triangles.push(new Triangle(v[5], v[7], v[6], color));
  // 윗면
  triangles.push(new Triangle(v[3], v[2], v[6], color));
  triangles.push(new Triangle(v[3], v[6], v[7], color));
  // 아랫면
  triangles.push(new Triangle(v[0], v[5], v[1], color));
  triangles.push(new Triangle(v[0], v[4], v[5], color));
  // 오른쪽 면
  triangles.push(new Triangle(v[1], v[5], v[6], color));
  triangles.push(new Triangle(v[1], v[6], v[2], color));
  // 왼쪽 면
  triangles.push(new Triangle(v[4], v[0], v[3], color));
  triangles.push(new Triangle(v[4], v[3], v[7], color));

  const mesh = new Mesh(triangles, center);
  if (options?.gravity) {
    mesh.gravity = true;
  }
  return mesh;
}

export function createPyramid(
  center: Vector3,
  size: number,
  height: number,
  color: Color,
  options?: { gravity?: boolean }
): Mesh {
  const d = size;
  // 밑면 삼각형
  const v0 = new Vector3(center.x, center.y, center.z);
  const v1 = new Vector3(center.x - d / 2, center.y, center.z + d * Math.sqrt(3) / 2);
  const v2 = new Vector3(center.x + d / 2, center.y, center.z + d * Math.sqrt(3) / 2);
  const apex = new Vector3(center.x, center.y + height, center.z + d / 3);
  const triangles: Triangle[] = [];
  triangles.push(new Triangle(v0, v1, v2, color)); // 밑면
  // 측면
  triangles.push(new Triangle(v0, v1, apex, color));
  triangles.push(new Triangle(v1, v2, apex, color));
  triangles.push(new Triangle(v2, v0, apex, color));

  const mesh = new Mesh(triangles, center);
  if (options?.gravity) {
    mesh.gravity = true;
  }
  return mesh;
}

// 새로 추가된 땅 생성 함수: center를 중심으로 width x depth 크기의 평면을 만듭니다.
export function createGround(
  center: Vector3,
  width: number,
  depth: number,
  color: Color
): Mesh {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  // 네 꼭짓점 좌표 (y는 고정: ground level)
  const v0 = new Vector3(center.x - halfWidth, center.y, center.z - halfDepth);
  const v1 = new Vector3(center.x + halfWidth, center.y, center.z - halfDepth);
  const v2 = new Vector3(center.x + halfWidth, center.y, center.z + halfDepth);
  const v3 = new Vector3(center.x - halfWidth, center.y, center.z + halfDepth);
  const triangles: Triangle[] = [];
  // 두 개의 삼각형으로 평면 구성
  triangles.push(new Triangle(v0, v1, v2, color));
  triangles.push(new Triangle(v0, v2, v3, color));
  return new Mesh(triangles, center);
}
