import { Ray } from "./ray";
import { Intersection } from "./types";
import { Vector3 } from "./vector";

export abstract class SceneObject {
    public gravity: boolean = false;
    public velocity: Vector3 = new Vector3(0, 0, 0);

    abstract intersect(ray: Ray): Intersection | null;

    update?(dt: number, gravity: number, groundLevel: number): void;
}
