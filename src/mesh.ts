// src/mesh.ts
import { SceneObject } from './sceneObject';
import { Triangle } from './triangle';
import { Vector3 } from './vector';
import { Ray } from './ray';

export class Mesh extends SceneObject {
  public triangles: Triangle[];
  public position: Vector3;

  constructor(triangles: Triangle[], position: Vector3) {
    super();
    this.triangles = triangles;
    this.position = position;
  }

  // 모든 삼각형에 대해 교차 판정을 수행
  intersect(ray: Ray) {
    let closestHit = null;
    for (const tri of this.triangles) {
      const hit = tri.intersect(ray);
      if (hit && (!closestHit || hit.dist < closestHit.dist)) {
        closestHit = hit;
      }
    }
    return closestHit;
  }

  // 오브젝트 전체를 delta만큼 평행 이동
  translate(delta: Vector3) {
    this.position = this.position.add(delta);
    this.triangles.forEach(tri => {
      tri.v0 = tri.v0.add(delta);
      tri.v1 = tri.v1.add(delta);
      tri.v2 = tri.v2.add(delta);
      // 회전 후 노멀도 재계산
      tri.normal = tri.v1
        .subtract(tri.v0)
        .cross(tri.v2.subtract(tri.v0))
        .normalize();
    });
  }

  // 중력이 켜진 경우, 속도를 중력에 따라 갱신하고 위치를 업데이트합니다.
  update(dt: number, gravity: number, groundLevel: number) {
    if (this.gravity) {
      // y 방향 속도 업데이트
      this.velocity = new Vector3(
        this.velocity.x,
        this.velocity.y + gravity * dt,
        this.velocity.z
      );
      // 속도에 따른 위치 변화 적용
      const delta = this.velocity.multiply(dt);
      this.translate(delta);

      // 바닥과 충돌 처리: y좌표가 groundLevel보다 낮으면 고정하고 y속도 0
      if (this.position.y < groundLevel) {
        const dy = groundLevel - this.position.y;
        this.translate(new Vector3(0, dy, 0));
        this.velocity.y = 0;
      }
    }
  }
}
