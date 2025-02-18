import type { Vector3 } from "./vector";
import type { SceneObject } from "./sceneObject";

export interface Color {
    r: number;
    g: number;
    b: number;
}

export interface Intersection {
    hit: boolean;
    dist: number;
    point: Vector3;
    normal: Vector3;
    color: Color;
    object: SceneObject;
}
