import { Vector3 } from "./vector";
import { applyMatrix } from "./matrix";

export function rotateAroundPoint(
    v: Vector3,
    pivot: Vector3,
    matrix: number[][],
): Vector3 {
    const translated = v.subtract(pivot);
    const rotated = applyMatrix(translated, matrix);
    return rotated.add(pivot);
}
