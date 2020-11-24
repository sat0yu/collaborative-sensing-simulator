import React, { useEffect, useMemo, useRef } from "react";

interface CanvasProps {
  width: number;
  height: number;
  resident: Resident;
  room: Room;
  sensors: Sensor[];
}

const Canvas: React.FunctionComponent<CanvasProps> = ({
  height,
  width,
  resident,
  room,
  sensors,
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [minPoint, maxPoint] = useMemo(
    () =>
      [
        { x: 0, y: 0 },
        { x: width, y: height },
      ] as const,
    [height, width]
  );

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

    room.draw(ctx);
    sensors.forEach((s) => s.draw(ctx));
  }, [ref, height, width, sensors]);

  useEffect(() => {
    const canvas = ref.current;
    if (canvas == null) {
      throw new Error("canvas not found");
    }
    const ctx = canvas.getContext("2d");
    if (ctx == null) {
      throw new Error("context not found");
    }
    const timer = setInterval(() => {
      resident.move(minPoint, maxPoint);
      resident.draw(ctx);
    }, 1000);
    return () => clearInterval(timer);
  }, [ref, resident, minPoint, maxPoint]);

  return <canvas ref={ref} />;
};

interface Object {
  draw(ctx: CanvasRenderingContext2D): void;
}

interface Point {
  x: number;
  y: number;
}

interface BoundingCircle {
  center: Point;
  radius: number;
}

interface ResidentProps extends BoundingCircle {
  color: string;
}
class Resident implements Object {
  static vectors = [
    [0, -1] as const,
    [0, +1] as const,
    [-1, 0] as const,
    [+1, 0] as const,
  ];

  private center: ResidentProps["center"];
  private radius: ResidentProps["radius"];
  private color: ResidentProps["color"];
  private lastDirection: number;

  public constructor({ center, radius, color }: ResidentProps) {
    this.center = center;
    this.radius = radius;
    this.color = color;
    this.lastDirection = 0;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  }

  public move({ x: minX, y: minY }: Point, { x: maxX, y: maxY }: Point) {
    const direction = Math.floor(Math.random() * (Resident.vectors.length + 1));
    const [dx, dy] = [
      ...Resident.vectors,
      Resident.vectors[this.lastDirection],
    ][direction];
    this.lastDirection =
      direction < Resident.vectors.length ? direction : this.lastDirection;
    const newX = this.center.x + dx;
    const newY = this.center.y + dy;
    console.log(dx, dy);
    if (minX < newX && newX < maxX) {
      this.center.x += dx;
    }
    if (minY < newY && newY < maxY) {
      this.center.y += dy;
    }
    console.log(this.center);
  }
}

interface RoomProps {
  topLeft: Point;
  bottomRight: Point;
  color: string;
}
class Room implements Object {
  private topLeft: RoomProps["topLeft"];
  private bottomRight: RoomProps["bottomRight"];
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
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.restore();
  }

  public probe({ center, radius }: BoundingCircle) {
    return (
      Math.pow(this.r - radius, 2) >=
      Math.pow(this.x - center.x, 2) + Math.pow(this.y - center.y, 2)
    );
  }
}

export const App = () => {
  const resident = new Resident({
    center: { x: 250, y: 250 },
    radius: 25,
    color: "blue",
  });
  const room = new Room({
    topLeft: { x: 100, y: 100 },
    bottomRight: { x: 400, y: 400 },
    color: "white",
  });
  const sensors = [
    new Sensor({ x: 175, y: 175, r: 80, color: "red" }),
    new Sensor({ x: 325, y: 175, r: 80, color: "red" }),
    new Sensor({ x: 175, y: 325, r: 80, color: "red" }),
    new Sensor({ x: 325, y: 325, r: 80, color: "red" }),
  ];

  return (
    <Canvas
      width={500}
      height={500}
      resident={resident}
      room={room}
      sensors={sensors}
    />
  );
};
