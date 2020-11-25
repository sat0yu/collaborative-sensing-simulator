export interface Object {
  draw(ctx: CanvasRenderingContext2D): void;
}

export interface Point {
  x: number;
  y: number;
}

export interface BoundingCircle {
  center: Point;
  radius: number;
}
