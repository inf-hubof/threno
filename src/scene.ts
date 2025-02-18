import { Vector3 } from "./vector";
import { Color } from "./types";
import { Mesh } from "./mesh";
import { Triangle } from "./triangle";

export function createCube(
    center: Vector3,
    size: number,
    color: Color,
    options?: { gravity?: boolean },
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
        new Vector3(center.x - d, center.y + d, center.z + d),
    ];
    const triangles: Triangle[] = [];

    triangles.push(new Triangle(v[0], v[1], v[2], color));
    triangles.push(new Triangle(v[0], v[2], v[3], color));

    triangles.push(new Triangle(v[5], v[4], v[7], color));
    triangles.push(new Triangle(v[5], v[7], v[6], color));

    triangles.push(new Triangle(v[3], v[2], v[6], color));
    triangles.push(new Triangle(v[3], v[6], v[7], color));

    triangles.push(new Triangle(v[0], v[5], v[1], color));
    triangles.push(new Triangle(v[0], v[4], v[5], color));

    triangles.push(new Triangle(v[1], v[5], v[6], color));
    triangles.push(new Triangle(v[1], v[6], v[2], color));

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
    options?: { gravity?: boolean },
): Mesh {
    const d = size;

    const v0 = new Vector3(center.x, center.y, center.z);
    const v1 = new Vector3(
        center.x - d / 2,
        center.y,
        center.z + (d * Math.sqrt(3)) / 2,
    );
    const v2 = new Vector3(
        center.x + d / 2,
        center.y,
        center.z + (d * Math.sqrt(3)) / 2,
    );
    const apex = new Vector3(center.x, center.y + height, center.z + d / 3);
    const triangles: Triangle[] = [];
    triangles.push(new Triangle(v0, v1, v2, color));

    triangles.push(new Triangle(v0, v1, apex, color));
    triangles.push(new Triangle(v1, v2, apex, color));
    triangles.push(new Triangle(v2, v0, apex, color));

    const mesh = new Mesh(triangles, center);
    if (options?.gravity) {
        mesh.gravity = true;
    }
    return mesh;
}

export function createGround(
    center: Vector3,
    width: number,
    depth: number,
    color: Color,
): Mesh {
    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    const v0 = new Vector3(
        center.x - halfWidth,
        center.y,
        center.z - halfDepth,
    );
    const v1 = new Vector3(
        center.x + halfWidth,
        center.y,
        center.z - halfDepth,
    );
    const v2 = new Vector3(
        center.x + halfWidth,
        center.y,
        center.z + halfDepth,
    );
    const v3 = new Vector3(
        center.x - halfWidth,
        center.y,
        center.z + halfDepth,
    );
    const triangles: Triangle[] = [];

    triangles.push(new Triangle(v0, v1, v2, color));
    triangles.push(new Triangle(v0, v2, v3, color));
    return new Mesh(triangles, center);
}
