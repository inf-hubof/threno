// src/collision.ts
import { SceneObject } from './sceneObject';
import { Sphere } from './sphere';
import { Mesh } from './mesh';
import { Vector3 } from './vector';

export interface BoundingSphere {
  center: Vector3;
  radius: number;
}

export function getBoundingSphere(obj: SceneObject): BoundingSphere {
  if (obj instanceof Sphere) {
    // Sphere는 중심과 반지름을 그대로 사용
    return { center: obj.center, radius: obj.radius };
  } else if (obj instanceof Mesh) {
    // Mesh의 경우, 모든 삼각형의 정점을 모아서 바운딩 스피어를 계산합니다.
    const vertices: Vector3[] = [];
    for (const tri of obj.triangles) {
      vertices.push(tri.v0, tri.v1, tri.v2);
    }
    // 정점들의 평균을 중심으로 사용
    let sum = new Vector3(0, 0, 0);
    for (const v of vertices) {
      sum = sum.add(v);
    }
    const center = sum.multiply(1 / vertices.length);
    // 중심으로부터 가장 먼 정점까지의 거리를 반지름으로 사용
    let maxDist = 0;
    for (const v of vertices) {
      const dist = v.subtract(center).length();
      if (dist > maxDist) {
        maxDist = dist;
      }
    }
    return { center, radius: maxDist };
  }
  // 다른 유형의 오브젝트는 기본값을 사용합니다.
  return { center: new Vector3(0, 0, 0), radius: 0 };
}

export function checkCollision(obj1: SceneObject, obj2: SceneObject): boolean {
  const bs1 = getBoundingSphere(obj1);
  const bs2 = getBoundingSphere(obj2);
  const distance = bs1.center.subtract(bs2.center).length();
  // 두 바운딩 스피어가 겹치면 충돌한 것으로 판단합니다.
  return distance <= (bs1.radius + bs2.radius);
}
