import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Point } from "./interfaces";
import { Resident } from "./resident";
import { Room } from "./room";
import { Sensor } from "./sensor";

interface Message {
  id: string;
  body: any;
}

interface Record {
  point: Point;
  messages: Message[];
}
export type RecordList = Record[];

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

interface RecorderProps {
  width: number;
  height: number;
  room: Room;
  sensors: Sensor[];
  addRecordList(recordList: RecordList): void;
  recordLists: RecordList[];
}

export const Recorder: React.FunctionComponent<RecorderProps> = ({
  height,
  width,
  room,
  sensors,
  addRecordList,
  recordLists,
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [bcRect, setBCRect] = useState({
    left: 0,
    top: 0,
    width,
    height,
  });

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
    setBCRect(ctx.canvas.getBoundingClientRect());
    ctx.canvas.height = height;
    ctx.canvas.width = width;
    resetCanvas(ctx);
  }, [ref, height, width, resetCanvas, setBCRect]);

  const onMouseMove = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      if (!recordMode) {
        return;
      }
      const ctx = useContext(ref);
      resetCanvas(ctx);
      const resident = new Resident({
        center: {
          x: event.clientX - bcRect.left,
          y: event.clientY - bcRect.top,
        },
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
    [ref, bcRect, recordMode, onMouseMoveMC, sensors, resetCanvas]
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
