import { SceneObject } from "./sceneObject";
import { Vector3 } from "./vector";
import { Intersection, Color } from "./types";
import { Ray } from "./ray";

export class Sphere extends SceneObject {
    constructor(
        public center: Vector3,
        public radius: number,
        public color: Color,
    ) {
        super();
    }

    intersect(ray: Ray): Intersection | null {
        const oc = ray.origin.subtract(this.center);
        const a = ray.direction.dot(ray.direction);
        const b = 2 * oc.dot(ray.direction);
        const c = oc.dot(oc) - this.radius * this.radius;
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) return null;
        const sqrtD = Math.sqrt(discriminant);
        let t = (-b - sqrtD) / (2 * a);
        if (t < 0) t = (-b + sqrtD) / (2 * a);
        if (t < 0) return null;
        const point = ray.origin.add(ray.direction.multiply(t));
        const normal = point.subtract(this.center).normalize();
        return {
            hit: true,
            dist: t,
            point,
            normal,
            color: this.color,
            object: this,
        };
    }
}
