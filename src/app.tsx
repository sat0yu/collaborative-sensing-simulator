import React, { useEffect, useRef } from "react";

interface CanvasProps {
  width: number;
  height: number;
  objects: Object[];
}

const Canvas: React.FunctionComponent<CanvasProps> = ({
  height,
  width,
  objects,
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (canvas == null) {
      throw new Error("canvas not found");
    }
    const ctx = canvas.getContext("2d");
    if (ctx == null) {
      throw new Error("context not found");
    }
    ctx.canvas.height = height;
    ctx.canvas.width = width;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
  }, [ref, height, width]);

  useEffect(() => {
    const canvas = ref.current;
    if (canvas == null) {
      throw new Error("canvas not found");
    }
    const ctx = canvas.getContext("2d");
    if (ctx == null) {
      throw new Error("context not found");
    }
    objects.forEach((obj) => obj.draw(ctx));
  }, [ref, objects]);

  return <canvas ref={ref} />;
};

interface Object {
  draw(ctx: CanvasRenderingContext2D): void;
}

interface SensorProps {
  x: number;
  y: number;
  r: number;
  color: string;
}
class Sensor implements Object {
  private x: SensorProps["x"];
  private y: SensorProps["y"];
  private r: SensorProps["r"];
  private color: SensorProps["color"];

  public constructor({ x, y, r, color }: SensorProps) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  }
}

export const App = () => {
  return (
    <>
      <h1>Hello world</h1>
      <Canvas
        width={500}
        height={500}
        objects={[
          new Sensor({ x: 50, y: 50, r: 20, color: "red" }),
          new Sensor({ x: 350, y: 350, r: 100, color: "red" }),
        ]}
      />
    </>
  );
};
