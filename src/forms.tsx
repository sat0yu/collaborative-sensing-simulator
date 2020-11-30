import React, {
  ChangeEvent,
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Sensor } from "./sensor";

export const useCanvas = (initW: number, initH: number) => {
  const [canvasSize, setCanvasSize] = useState([initW, initH]);
  const setCanvasWidth = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      setCanvasSize((prev) => [+target.value, prev[1]]),
    [setCanvasSize]
  );
  const setCanvasHeight = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      setCanvasSize((prev) => [prev[0], +target.value]),
    [setCanvasSize]
  );
  return [canvasSize, setCanvasWidth, setCanvasHeight] as const;
};

export const useRoom = (
  initL: number,
  initT: number,
  initW: number,
  initH: number
) => {
  const [roomPosSize, serRoomPosSize] = useState([initL, initT, initW, initH]);
  const setRoomLeft = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      serRoomPosSize((prev) => [+target.value, prev[1], prev[2], prev[3]]),
    [serRoomPosSize]
  );
  const setRoomTop = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      serRoomPosSize((prev) => [prev[0], +target.value, prev[2], prev[3]]),
    [serRoomPosSize]
  );
  const setRoomWidth = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      serRoomPosSize((prev) => [prev[0], prev[1], +target.value, prev[3]]),
    [serRoomPosSize]
  );
  const setRoomHeight = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      serRoomPosSize((prev) => [prev[0], prev[1], prev[2], +target.value]),
    [serRoomPosSize]
  );
  return [
    roomPosSize,
    setRoomLeft,
    setRoomTop,
    setRoomWidth,
    setRoomHeight,
  ] as const;
};

export const useSensors = (initSensors: Sensor[]) => {
  const [sensors, setSensors] = useState(initSensors);
  const [attr, setAttr] = useState(["", 100, 100, 50] as [
    string,
    number,
    number,
    number
  ]);
  const isValidAttr = useMemo(
    () =>
      !!attr[0] &&
      sensors.every((s) => s.id != attr[0]) &&
      attr[1] > 0 &&
      attr[2] > 0 &&
      attr[3] > 0,
    [attr, sensors]
  );
  const setSensorId = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      setAttr((prev) => [target.value, prev[1], prev[2], prev[3]]),
    [setAttr]
  );
  const setSensorX = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      setAttr((prev) => [prev[0], +target.value, prev[2], prev[3]]),
    [setAttr]
  );
  const setSensorY = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      setAttr((prev) => [prev[0], prev[1], +target.value, prev[3]]),
    [setAttr]
  );
  const setSensorR = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      setAttr((prev) => [prev[0], prev[1], prev[2], +target.value]),
    [setAttr]
  );
  const addSensor = useCallback(
    () =>
      setSensors((prev) => [
        ...prev,
        new Sensor({
          id: attr[0],
          x: attr[1],
          y: attr[2],
          r: attr[3],
          color: "red",
        }),
      ]),
    [attr, setSensors]
  );
  const removeSensor = useCallback(
    (id: string) => setSensors((prev) => prev.filter((s) => s.id != id)),
    [setSensors]
  );

  return [
    sensors,
    attr,
    setSensorId,
    setSensorX,
    setSensorY,
    setSensorR,
    isValidAttr,
    addSensor,
    removeSensor,
  ] as const;
};

interface CanvasFormProps {
  width: number;
  height: number;
  setWidth(event: ChangeEvent<HTMLInputElement>): void;
  setHeight(event: ChangeEvent<HTMLInputElement>): void;
}
export const CanvasForm: FunctionComponent<CanvasFormProps> = ({
  width,
  height,
  setWidth,
  setHeight,
}) => (
  <section>
    <h2>Canvas</h2>
    <p>
      <label htmlFor="cvsW">width: </label>
      <input name="cvsW" type="number" value={width} onChange={setWidth} />
    </p>
    <p>
      <label htmlFor="cvsH">height: </label>
      <input name="cvsH" type="number" value={height} onChange={setHeight} />
    </p>
  </section>
);

interface RoomFormProps {
  left: number;
  top: number;
  width: number;
  height: number;
  setLeft(event: ChangeEvent<HTMLInputElement>): void;
  setTop(event: ChangeEvent<HTMLInputElement>): void;
  setWidth(event: ChangeEvent<HTMLInputElement>): void;
  setHeight(event: ChangeEvent<HTMLInputElement>): void;
}
export const RoomForm: FunctionComponent<RoomFormProps> = ({
  left,
  top,
  width,
  height,
  setLeft,
  setTop,
  setWidth,
  setHeight,
}) => (
  <section>
    <h2>Room</h2>
    <p>
      <label htmlFor="roomL">left: </label>
      <input name="roomL" type="number" value={left} onChange={setLeft} />
    </p>
    <p>
      <label htmlFor="roomT">top: </label>
      <input name="roomT" type="number" value={top} onChange={setTop} />
    </p>
    <p>
      <label htmlFor="roomW">width: </label>
      <input name="roomW" type="number" value={width} onChange={setWidth} />
    </p>
    <p>
      <label htmlFor="roomH">height: </label>
      <input name="roomH" type="number" value={height} onChange={setHeight} />
    </p>
  </section>
);

interface SensorsFormProps {
  sensors: Sensor[];
  sensorAttr: [string, number, number, number];
  setSensorId(event: ChangeEvent<HTMLInputElement>): void;
  setSensorX(event: ChangeEvent<HTMLInputElement>): void;
  setSensorY(event: ChangeEvent<HTMLInputElement>): void;
  setSensorR(event: ChangeEvent<HTMLInputElement>): void;
  isValidAttr: boolean;
  addSensor(): void;
  removeSensor(id: string): void;
  canvasWidth: number;
  canvasHeight: number;
}
export const SensorsForm: FunctionComponent<SensorsFormProps> = ({
  sensors,
  sensorAttr,
  setSensorId,
  setSensorX,
  setSensorY,
  setSensorR,
  isValidAttr,
  addSensor,
  removeSensor,
  canvasWidth,
  canvasHeight,
}) => (
  <section>
    <h2>Sensors</h2>
    <ul>
      {sensors.map(({ id, x, y, r }) => (
        <li key={id}>
          {id}:{JSON.stringify({ x, y, r })}{" "}
          <input
            type="button"
            value="remove"
            onClick={() => removeSensor(id)}
          />
        </li>
      ))}
    </ul>
    <p>
      <label htmlFor="sensorId">id: </label>
      <input
        name="sensorId"
        type="text"
        maxLength={16}
        value={sensorAttr[0]}
        onChange={setSensorId}
      />
      <label htmlFor="sensorX">x: </label>
      <input
        name="sensorX"
        type="number"
        min={0}
        max={canvasWidth}
        value={sensorAttr[1]}
        onChange={setSensorX}
      />
      <label htmlFor="sensorY">y: </label>
      <input
        name="sensorY"
        type="number"
        min={0}
        max={canvasHeight}
        value={sensorAttr[2]}
        onChange={setSensorY}
      />
      <label htmlFor="sensorR">r: </label>
      <input
        name="sensorR"
        type="number"
        min={0}
        max={canvasHeight}
        value={sensorAttr[3]}
        onChange={setSensorR}
      />
      <input
        type="button"
        value="add"
        disabled={!isValidAttr}
        onClick={addSensor}
      />
    </p>
  </section>
);
