import { BoundingCircle } from "./interfaces";

interface ResidentProps extends BoundingCircle {
  color: string;
}
export class Resident implements Object {
  public center: ResidentProps["center"];
  public radius: ResidentProps["radius"];
  private color: ResidentProps["color"];

  public constructor({ center, radius, color }: ResidentProps) {
    this.center = center;
    this.radius = radius;
    this.color = color;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  }
}
