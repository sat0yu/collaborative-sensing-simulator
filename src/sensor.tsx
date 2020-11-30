import { Object, BoundingCircle } from "./interfaces";

interface SensorProps {
  id: string;
  x: number;
  y: number;
  r: number;
  color: string;
}

export class Sensor implements Object {
  public id: SensorProps["id"];
  public x: SensorProps["x"];
  public y: SensorProps["y"];
  public r: SensorProps["r"];
  private color: SensorProps["color"];
  private lastState: boolean;

  public constructor({ id, x, y, r, color }: SensorProps) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.lastState = false;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.font = "24px serif";
    ctx.fillText(this.id, this.x - 12, this.y + 12);
    ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.restore();
  }

  public probe({ center, radius }: BoundingCircle) {
    const result =
      Math.pow(this.r + radius, 2) >=
      Math.pow(this.x - center.x, 2) + Math.pow(this.y - center.y, 2);
    // console.log(this.id, result);
    if (this.lastState == result) {
      return null;
    }
    return (this.lastState = result);
  }
}
