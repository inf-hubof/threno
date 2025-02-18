// src/triangle.ts
import { SceneObject } from './sceneObject';
import { Vector3 } from './vector';
import { Intersection, Color } from './types';
import { Ray } from './ray';

export class Triangle extends SceneObject {
  public normal: Vector3;

  constructor(
    public v0: Vector3,
    public v1: Vector3,
    public v2: Vector3,
    public color: Color
  ) {
    super();
    this.normal = v1.subtract(v0).cross(v2.subtract(v0)).normalize();
  }

  intersect(ray: Ray): Intersection | null {
    const EPSILON = 1e-6;
    const edge1 = this.v1.subtract(this.v0);
    const edge2 = this.v2.subtract(this.v0);
    const h = ray.direction.cross(edge2);
    const a = edge1.dot(h);
    if (a > -EPSILON && a < EPSILON) return null; // 평행한 경우
    const f = 1 / a;
    const s = ray.origin.subtract(this.v0);
    const u = f * s.dot(h);
    if (u < 0 || u > 1) return null;
    const q = s.cross(edge1);
    const v = f * ray.direction.dot(q);
    if (v < 0 || u + v > 1) return null;
    const t = f * edge2.dot(q);
    if (t > EPSILON) {
      const point = ray.origin.add(ray.direction.multiply(t));
      return { hit: true, dist: t, point, normal: this.normal, color: this.color, object: this };
    }
    return null;
  }
}
