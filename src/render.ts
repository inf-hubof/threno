import chalk from "chalk";
import { Vector3 } from "./vector";
import { Ray } from "./ray";
import { SceneObject } from "./sceneObject";
import { Intersection } from "./types";
import { rotationY, rotationX, multiplyMatrix, applyMatrix } from "./matrix";

let prevFrame: { r: number; g: number; b: number }[][] = [];

export interface RenderSettings {
    width: number;
    height: number;
    fov: number;
    cameraPos: Vector3;
    cameraYaw: number;
    cameraPitch: number;
    skyTop: { r: number; g: number; b: number };
    skyBottom: { r: number; g: number; b: number };
    ambient: number;
    lightDir: Vector3;

    aaSampleSqrt: number;
}

function inShadow(
    point: Vector3,
    currentHit: Intersection,
    objects: SceneObject[],
): boolean {
    const offset = currentHit.normal.multiply(1e-4);
    const shadowRay = new Ray(
        point.add(offset),
        currentHit.normal.multiply(-1),
    );
    for (const obj of objects) {
        if (obj === currentHit.object) continue;
        const hit = obj.intersect(shadowRay);
        if (hit) return true;
    }
    return false;
}

export function render(scene: SceneObject[], settings: RenderSettings): void {
    const {
        width,
        height,
        fov,
        cameraPos,
        cameraYaw,
        cameraPitch,
        skyTop,
        skyBottom,
        ambient,
        lightDir,
        aaSampleSqrt,
    } = settings;
    const aspectRatio = width / height;

    const sampleSqrt = aaSampleSqrt > 0 ? aaSampleSqrt : 1;
    const totalSamples = sampleSqrt * sampleSqrt;

    const camRotY = rotationY(cameraYaw);
    const camRotX = rotationX(cameraPitch);
    const cameraRotation = multiplyMatrix(camRotY, camRotX);

    const newFrame: { r: number; g: number; b: number }[][] = [];

    for (let j = 0; j < height; j++) {
        newFrame[j] = [];
        for (let i = 0; i < width; i++) {
            const accumulatedColor = { r: 0, g: 0, b: 0 };

            for (let sy = 0; sy < sampleSqrt; sy++) {
                for (let sx = 0; sx < sampleSqrt; sx++) {
                    const subI = i + (sx + 0.5) / sampleSqrt;
                    const subJ = j + (sy + 0.5) / sampleSqrt;

                    const x =
                        ((2 * subI) / width - 1) *
                        aspectRatio *
                        Math.tan(fov / 2);
                    const y = (1 - (2 * subJ) / height) * Math.tan(fov / 2);

                    const initialRayDir = new Vector3(x, y, 1).normalize();
                    const orientedRayDir = applyMatrix(
                        initialRayDir,
                        cameraRotation,
                    ).normalize();
                    const ray = new Ray(cameraPos, orientedRayDir);

                    let closestHit: Intersection | null = null;

                    for (const obj of scene) {
                        const hit = obj.intersect(ray);
                        if (
                            hit &&
                            (!closestHit || hit.dist < closestHit.dist)
                        ) {
                            closestHit = hit;
                        }
                    }

                    let sampleColor;
                    if (closestHit) {
                        let lightIntensity = Math.max(
                            0,
                            closestHit.normal.dot(lightDir.multiply(-1)),
                        );
                        if (inShadow(closestHit.point, closestHit, scene)) {
                            lightIntensity *= 0.3;
                        }
                        lightIntensity =
                            ambient + (1 - ambient) * lightIntensity;
                        sampleColor = {
                            r: Math.min(
                                255,
                                closestHit.color.r * lightIntensity,
                            ),
                            g: Math.min(
                                255,
                                closestHit.color.g * lightIntensity,
                            ),
                            b: Math.min(
                                255,
                                closestHit.color.b * lightIntensity,
                            ),
                        };
                    } else {
                        const t = (ray.direction.y + 1) / 2;
                        sampleColor = {
                            r: skyBottom.r * (1 - t) + skyTop.r * t,
                            g: skyBottom.g * (1 - t) + skyTop.g * t,
                            b: skyBottom.b * (1 - t) + skyTop.b * t,
                        };
                    }

                    accumulatedColor.r += sampleColor.r;
                    accumulatedColor.g += sampleColor.g;
                    accumulatedColor.b += sampleColor.b;
                }
            }

            accumulatedColor.r = Math.floor(accumulatedColor.r / totalSamples);
            accumulatedColor.g = Math.floor(accumulatedColor.g / totalSamples);
            accumulatedColor.b = Math.floor(accumulatedColor.b / totalSamples);

            newFrame[j][i] = accumulatedColor;
        }
    }

    for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
            const newPixel = newFrame[j][i];
            const oldPixel = (prevFrame[j] && prevFrame[j][i]) || {
                r: -1,
                g: -1,
                b: -1,
            };
            if (
                oldPixel.r !== newPixel.r ||
                oldPixel.g !== newPixel.g ||
                oldPixel.b !== newPixel.b
            ) {
                process.stdout.write(`\x1b[${j + 1};${i + 1}H`);
                process.stdout.write(
                    chalk.bgRgb(newPixel.r, newPixel.g, newPixel.b)(" "),
                );
            }
        }
    }

    prevFrame = newFrame;
}
