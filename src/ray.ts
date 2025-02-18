import { Vector3 } from "./vector";

export class Ray {
    constructor(
        public origin: Vector3,
        public direction: Vector3,
    ) {}
}
