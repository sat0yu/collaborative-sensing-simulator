import { Object, Point } from "./interfaces";

interface RoomProps {
  topLeft: Point;
  bottomRight: Point;
  color: string;
}

export class Room implements Object {
  public topLeft: RoomProps["topLeft"];
  public bottomRight: RoomProps["bottomRight"];

  private color: RoomProps["color"];

  public constructor({ topLeft, bottomRight, color }: RoomProps) {
    this.topLeft = topLeft;
    this.bottomRight = bottomRight;
    this.color = color;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.strokeRect(
      this.topLeft.x,
      this.topLeft.y,
      this.bottomRight.x - this.topLeft.x,
      this.bottomRight.y - this.topLeft.y
    );
    ctx.restore();
  }

  public cover({ center: { x, y } }: BoundingCircle) {
    return (
      this.topLeft.x < x &&
      x < this.bottomRight.x &&
      this.bottomRight.y < y &&
      y < this.topLeft.y
    );
  }
}
