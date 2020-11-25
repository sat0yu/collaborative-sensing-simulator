import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const useMouseCapture = (addRecordList: (recordList: RecordList) => void) => {
  const [recordMode, setRecordMode] = useState(false);
  const [seq, setSeq] = useState([] as RecordList);

  const onMouseDown = useCallback(() => {
    setRecordMode(true);
    setSeq([]);
  }, [setRecordMode, setSeq]);

  const onMouseMove = useCallback(
    (
      { clientX: x, clientY: y }: MouseEvent<HTMLCanvasElement>,
      messages: Message[] = []
    ) => {
      if (!recordMode) {
        return;
      }
      setSeq((prev) => [...prev, { point: { x, y }, messages }]);
    },
    [recordMode, setSeq]
  );

  const onMouseUp = useCallback(() => {
    if (seq.length > 0) {
      // ignore paths which consists of a single point
      seq.length > 1 && addRecordList(seq);
      setSeq([]);
    }
    setRecordMode(false);
  }, [seq, addRecordList, setRecordMode]);

  return [recordMode, onMouseDown, onMouseMove, onMouseUp] as const;
};

const useContext = (ref: React.MutableRefObject<HTMLCanvasElement | null>) => {
  const canvas = ref.current;
  if (canvas == null) {
    throw new Error("canvas not found");
  }
  const ctx = canvas.getContext("2d");
  if (ctx == null) {
    throw new Error("context not found");
  }
  return ctx;
};

interface CanvasProps {
  width: number;
  height: number;
  room: Room;
  sensors: Sensor[];
  addRecordList(recordList: RecordList): void;
  recordLists: RecordList[];
}

const Canvas: React.FunctionComponent<CanvasProps> = ({
  height,
  width,
  room,
  sensors,
  addRecordList,
  recordLists,
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [
    recordMode,
    onMouseDownMC,
    onMouseMoveMC,
    onMouseUpMC,
  ] = useMouseCapture(addRecordList);

  const resetCanvas = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, width, height);
      room.draw(ctx);
      sensors.forEach((s) => s.draw(ctx));
    },
    [width, height, room, sensors]
  );

  useEffect(() => {
    const ctx = useContext(ref);
    ctx.canvas.height = height;
    ctx.canvas.width = width;
    resetCanvas(ctx);
  }, [ref, height, width, resetCanvas]);

  const onMouseMove = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      if (!recordMode) {
        return;
      }
      const ctx = useContext(ref);
      resetCanvas(ctx);
      const resident = new Resident({
        center: { x: event.clientX, y: event.clientY },
        radius: 20,
        color: "blue",
      });
      resident.draw(ctx);
      const messages = sensors.reduce((acc, s) => {
        const result = s.probe(resident);
        return result == null ? acc : [...acc, { id: s.id, body: result }];
      }, [] as Message[]);
      onMouseMoveMC(event, messages);
    },
    [ref, recordMode, onMouseMoveMC, sensors, resetCanvas]
  );

  const onMouseUp = useCallback(() => {
    onMouseUpMC();
    const ctx = useContext(ref);
    resetCanvas(ctx);
  }, [ref, onMouseUpMC, resetCanvas]);

  return (
    <>
      <canvas
        onMouseUp={onMouseUp}
        onMouseDown={onMouseDownMC}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseUp}
        style={{ border: "solid 1px black" }}
        ref={ref}
      />
      {recordLists.map((recordList, i) => (
        <RecordList key={i} value={recordList} />
      ))}
    </>
  );
};

interface Object {
  draw(ctx: CanvasRenderingContext2D): void;
}

interface Message {
  id: string;
  body: any;
}

interface Record {
  point: Point;
  messages: Message[];
}
type RecordList = Record[];

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
  id: string;
  x: number;
  y: number;
  r: number;
  color: string;
}
class Sensor implements Object {
  public id: SensorProps["id"];
  private x: SensorProps["x"];
  private y: SensorProps["y"];
  private r: SensorProps["r"];
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
    console.log(this.id, result);
    if (this.lastState == result) {
      return null;
    }
    return (this.lastState = result);
  }
}

const RecordList: FunctionComponent<{ value: RecordList }> = ({ value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((current) => !current), [
    setIsOpen,
  ]);
  return (
    <div>
      <p onClick={toggle}>
        {isOpen ? "▼" : "▶"} records length: {value.length}
      </p>
      {isOpen && <p>{JSON.stringify(value)}</p>}
    </div>
  );
};

export const App = () => {
  const [recordLists, setRecordLists] = useState([] as RecordList[]);
  const addRecordList = useCallback(
    (recordList: RecordList) => setRecordLists((prev) => [...prev, recordList]),
    [setRecordLists]
  );
  const room = new Room({
    topLeft: { x: 100, y: 100 },
    bottomRight: { x: 400, y: 400 },
    color: "gray",
  });
  const sensors = [
    new Sensor({ id: "s0", x: 175, y: 175, r: 80, color: "red" }),
    new Sensor({ id: "s1", x: 325, y: 175, r: 80, color: "red" }),
    new Sensor({ id: "s2", x: 175, y: 325, r: 80, color: "red" }),
    new Sensor({ id: "s3", x: 325, y: 325, r: 80, color: "red" }),
  ];

  return (
    <Canvas
      width={500}
      height={500}
      room={room}
      sensors={sensors}
      addRecordList={addRecordList}
      recordLists={recordLists}
    />
  );
};
