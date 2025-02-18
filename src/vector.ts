// src/vector.ts
export class Vector3 {
    constructor(public x: number, public y: number, public z: number) {}
  
    add(v: Vector3): Vector3 {
      return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
  
    subtract(v: Vector3): Vector3 {
      return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
  
    multiply(scalar: number): Vector3 {
      return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
  
    dot(v: Vector3): number {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }
  
    cross(v: Vector3): Vector3 {
      return new Vector3(
        this.y * v.z - this.z * v.y,
        this.z * v.x - this.x * v.z,
        this.x * v.y - this.y * v.x
      );
    }
  
    length(): number {
      return Math.sqrt(this.dot(this));
    }
  
    normalize(): Vector3 {
      const len = this.length();
      return len === 0 ? new Vector3(0, 0, 0) : this.multiply(1 / len);
    }
  }
  