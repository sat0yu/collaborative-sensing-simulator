import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface CanvasProps {
  width: number;
  height: number;
  room: Room;
  addPath(path: Point[]): void;
}

const Canvas: React.FunctionComponent<CanvasProps> = ({
  height,
  width,
  room,
  addPath,
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [recordMode, setRecordMode] = useState(false);
  const [seq, setSeq] = useState([] as Point[]);

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

    room.draw(ctx);
  }, [ref, height, width]);

  const onMouseDown = useCallback(() => {
    setRecordMode(true);
    setSeq([]);
  }, [setRecordMode, setSeq]);

  const onMouseMove = useCallback(
    ({ clientX: x, clientY: y }: MouseEvent<HTMLCanvasElement>) => {
      if (!recordMode) {
        // console.log("not record mode");
        return;
      }
      // console.log(recordMode, x, y);
      setSeq((prev) => [...prev, { x, y }]);
    },
    [recordMode, setSeq]
  );

  const onMouseUp = useCallback(() => {
    if (seq.length > 0) {
      // ignore paths which consists of a single point
      seq.length > 1 && addPath(seq);
      setSeq([]);
    }
    setRecordMode(false);
  }, [seq, addPath, setRecordMode]);

  return (
    <canvas
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseUp}
      style={{ border: "solid 1px black" }}
      ref={ref}
    />
  );
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
  const [paths, setPaths] = useState([] as Point[][]);
  const addPath = useCallback(
    (path: Point[]) => setPaths((prev) => [...prev, path]),
    [setPaths]
  );

  const room = new Room({
    topLeft: { x: 100, y: 100 },
    bottomRight: { x: 400, y: 400 },
    color: "gray",
  });

  return (
    <>
      <Canvas width={500} height={500} room={room} addPath={addPath} />
      {paths.map((path, i) => (
        <p key={i}>{JSON.stringify(path)}</p>
      ))}
    </>
  );
};
