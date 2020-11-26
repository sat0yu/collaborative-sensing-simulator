import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { RecordList } from "./interfaces";
import { Resident } from "./resident";
import { Room } from "./room";
import { Sensor } from "./sensor";

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

interface Method {
  name: string;
  probe(record: RecordList[number]): boolean;
}

interface SimulatorProps {
  width: number;
  height: number;
  room: Room;
  sensors: Sensor[];
  recordLists: RecordList[];
  methods: Method[];
}

export const Simulator: React.FunctionComponent<SimulatorProps> = ({
  height,
  width,
  room,
  sensors,
  recordLists,
  methods,
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [isPresent, setIsPresent] = useState(false);
  const [recordIdx, setRecordIdx] = useState(0);
  const [selectedRecordListIdx, setSelectedRecordListIdx] = useState(0);
  const [selectedMethodIdx, setSelectedMethodIdx] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const resetCanvas = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, width, height);
      room.draw(ctx);
      sensors.forEach((s) => s.draw(ctx));
    },
    [width, height, room, sensors]
  );

  const onClickStart = useCallback(() => {
    setIsSimulating(true);
    setRecordIdx(0);
  }, [setIsSimulating, setRecordIdx]);

  useEffect(() => {
    const ctx = useContext(ref);
    ctx.canvas.height = height;
    ctx.canvas.width = width;
    resetCanvas(ctx);
  }, [ref, height, width, resetCanvas]);

  const currentRecordList = recordLists[selectedRecordListIdx] || [];
  const currentMethod = methods[selectedMethodIdx];

  useEffect(() => {
    if (!isSimulating) {
      return;
    }
    const ctx = useContext(ref);
    resetCanvas(ctx);
    const currentRecord = currentRecordList[recordIdx];
    if (
      currentRecord ==
      null /** recordIdx runs over the end of currentRecordList */
    ) {
      return setIsSimulating(false);
    }
    const resident = new Resident({
      center: currentRecord.point,
      radius: 20,
      color: "blue",
    });
    resident.draw(ctx);
    setIsPresent(currentMethod.probe(currentRecord));
    setTimeout(() => setRecordIdx((prev) => prev + 1), 100);
  }, [
    isSimulating,
    recordIdx,
    currentRecordList,
    currentMethod,
    resetCanvas,
    setRecordIdx,
    setIsSimulating,
  ]);

  const isUnavailable = isSimulating || currentRecordList.length == 0;

  return (
    <>
      <div>
        <select
          disabled={isUnavailable}
          onChange={({ target }: ChangeEvent<HTMLSelectElement>) =>
            setSelectedRecordListIdx(+target.value)
          }
          value={selectedRecordListIdx}
        >
          {recordLists.map((recordList, i) => (
            <option
              key={i}
              value={i}
            >{`records length: ${recordList.length}`}</option>
          ))}
        </select>
        <select
          disabled={isUnavailable}
          onChange={({ target }: ChangeEvent<HTMLSelectElement>) =>
            setSelectedMethodIdx(+target.value)
          }
          value={selectedMethodIdx}
        >
          {methods.map((method, i) => (
            <option key={i} value={i}>
              {method.name}
            </option>
          ))}
        </select>
        <button onClick={onClickStart} disabled={isUnavailable}>
          start
        </button>
      </div>
      <canvas style={{ border: "solid 1px black" }} ref={ref} />
      <>
        <p>presence: {isPresent ? "🈵" : "🈳"}</p>
        <p>current index: {recordIdx}</p>
        <div>
          currentRecord:{" "}
          <pre style={{ height: "11rem" }}>
            {JSON.stringify(currentRecordList[recordIdx], null, 2)}
          </pre>
        </div>
      </>
    </>
  );
};
