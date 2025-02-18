import { SceneObject } from "./sceneObject";
import { Sphere } from "./sphere";
import { Mesh } from "./mesh";
import { Vector3 } from "./vector";

export interface BoundingSphere {
    center: Vector3;
    radius: number;
}

export function getBoundingSphere(obj: SceneObject): BoundingSphere {
    if (obj instanceof Sphere) {
        return { center: obj.center, radius: obj.radius };
    } else if (obj instanceof Mesh) {
        const vertices: Vector3[] = [];
        for (const tri of obj.triangles) {
            vertices.push(tri.v0, tri.v1, tri.v2);
        }

        let sum = new Vector3(0, 0, 0);
        for (const v of vertices) {
            sum = sum.add(v);
        }
        const center = sum.multiply(1 / vertices.length);

        let maxDist = 0;
        for (const v of vertices) {
            const dist = v.subtract(center).length();
            if (dist > maxDist) {
                maxDist = dist;
            }
        }
        return { center, radius: maxDist };
    }

    return { center: new Vector3(0, 0, 0), radius: 0 };
}

export function checkCollision(obj1: SceneObject, obj2: SceneObject): boolean {
    const bs1 = getBoundingSphere(obj1);
    const bs2 = getBoundingSphere(obj2);
    const distance = bs1.center.subtract(bs2.center).length();

    return distance <= bs1.radius + bs2.radius;
}
