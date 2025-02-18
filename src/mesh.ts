import { SceneObject } from "./sceneObject";
import { Triangle } from "./triangle";
import { Vector3 } from "./vector";
import { Ray } from "./ray";

export class Mesh extends SceneObject {
    public triangles: Triangle[];
    public position: Vector3;

    constructor(triangles: Triangle[], position: Vector3) {
        super();
        this.triangles = triangles;
        this.position = position;
    }

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

    translate(delta: Vector3) {
        this.position = this.position.add(delta);
        this.triangles.forEach((tri) => {
            tri.v0 = tri.v0.add(delta);
            tri.v1 = tri.v1.add(delta);
            tri.v2 = tri.v2.add(delta);

            tri.normal = tri.v1
                .subtract(tri.v0)
                .cross(tri.v2.subtract(tri.v0))
                .normalize();
        });
    }

    update(dt: number, gravity: number, groundLevel: number) {
        if (this.gravity) {
            this.velocity = new Vector3(
                this.velocity.x,
                this.velocity.y + gravity * dt,
                this.velocity.z,
            );

            const delta = this.velocity.multiply(dt);
            this.translate(delta);

            if (this.position.y < groundLevel) {
                const dy = groundLevel - this.position.y;
                this.translate(new Vector3(0, dy, 0));
                this.velocity.y = 0;
            }
        }
    }
}
