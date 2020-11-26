import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import { RecordList } from "./interfaces";
import {
  DebounceFunc,
  Majorityfunc,
  MajorityWithCachefunc,
  MaxFunc,
  MaxWithCacheAndDebounceFunc,
  MaxWithCacheFunc,
} from "./methods";
import { Recorder } from "./recorder";
import { Room } from "./room";
import { Sensor } from "./sensor";
import { Simulator } from "./simulator";

const useCanvas = (initW: number, initH: number) => {
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
const useRoom = (
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

const useSensors = (initSensors: Sensor[]) => {
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

export const App = () => {
  const [recordLists, setRecordLists] = useState([] as RecordList[]);
  const addRecordList = useCallback(
    (recordList: RecordList) => setRecordLists((prev) => [...prev, recordList]),
    [setRecordLists]
  );
  const [canvasSize, setCanvasWidth, setCanvasHeight] = useCanvas(500, 500);
  const [
    roomPosSize,
    setRoomLeft,
    setRoomTop,
    setRoomWidth,
    setRoomHeight,
  ] = useRoom(100, 100, 300, 300);
  const [
    sensors,
    sensorAttr,
    setSensorId,
    setSensorX,
    setSensorY,
    setSensorR,
    isValidAttr,
    addSensor,
    removeSensor,
  ] = useSensors([
    new Sensor({ id: "s0", x: 175, y: 175, r: 80, color: "red" }),
    new Sensor({ id: "s1", x: 325, y: 175, r: 80, color: "red" }),
    new Sensor({ id: "s2", x: 250, y: 325, r: 90, color: "red" }),
  ]);

  const room = new Room({
    topLeft: { x: roomPosSize[0], y: roomPosSize[1] },
    bottomRight: {
      x: roomPosSize[0] + roomPosSize[2],
      y: roomPosSize[1] + roomPosSize[3],
    },
    color: "gray",
  });
  const sensorIds = sensors.map((s) => s.id);
  const methods = [
    new MaxFunc("Max"),
    new Majorityfunc("Majority"),
    new DebounceFunc("Debounce(10) Function", 10),
    new MaxWithCacheFunc(`MaxWithCache(${sensorIds})`, sensorIds),
    new MajorityWithCachefunc(`MajorityWithCache(${sensorIds})`, sensorIds),
    new MaxWithCacheAndDebounceFunc(
      `MaxWithCacheAndDebounce(${sensorIds}, 10)`,
      sensorIds,
      10
    ),
  ];

  return (
    <>
      <section>
        <h1>Configuration</h1>
        <section>
          <h2>Canvas</h2>
          <p>
            <label htmlFor="cvsW">width: </label>
            <input
              name="cvsW"
              type="number"
              value={canvasSize[0]}
              onChange={setCanvasWidth}
            />
          </p>
          <p>
            <label htmlFor="cvsH">height: </label>
            <input
              name="cvsH"
              type="number"
              value={canvasSize[1]}
              onChange={setCanvasHeight}
            />
          </p>
        </section>
        <section>
          <h2>Room</h2>
          <p>
            <label htmlFor="roomL">left: </label>
            <input
              name="roomL"
              type="number"
              value={roomPosSize[0]}
              onChange={setRoomLeft}
            />
          </p>
          <p>
            <label htmlFor="roomH">top: </label>
            <input
              name="roomH"
              type="number"
              value={roomPosSize[1]}
              onChange={setRoomTop}
            />
          </p>
          <p>
            <label htmlFor="roomW">width: </label>
            <input
              name="roomW"
              type="number"
              value={roomPosSize[2]}
              onChange={setRoomWidth}
            />
          </p>
          <p>
            <label htmlFor="roomH">height: </label>
            <input
              name="roomH"
              type="number"
              value={roomPosSize[3]}
              onChange={setRoomHeight}
            />
          </p>
        </section>
        <section>
          <h2>Sensors</h2>
          <ul>
            {sensors.map((s) => (
              <li key={s.id}>
                {s.id}{" "}
                <input
                  type="button"
                  value="remove"
                  onClick={() => removeSensor(s.id)}
                />
              </li>
            ))}
          </ul>
          <p>
            <label htmlFor="sensorId">id: </label>
            <input
              name="sensorId"
              type="text"
              value={sensorAttr[0]}
              onChange={setSensorId}
            />
            <label htmlFor="sensorX">x: </label>
            <input
              name="sensorX"
              type="number"
              value={sensorAttr[1]}
              onChange={setSensorX}
            />
            <label htmlFor="sensorY">y: </label>
            <input
              name="sensorY"
              type="number"
              value={sensorAttr[2]}
              onChange={setSensorY}
            />
            <label htmlFor="sensorR">r: </label>
            <input
              name="sensorR"
              type="number"
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
      </section>
      <section>
        <h1>Recorder</h1>
        <Recorder
          width={canvasSize[0]}
          height={canvasSize[1]}
          room={room}
          sensors={sensors}
          addRecordList={addRecordList}
          recordLists={recordLists}
        />
      </section>
      <section>
        <h1>Simulator</h1>
        <Simulator
          width={canvasSize[0]}
          height={canvasSize[1]}
          room={room}
          sensors={sensors}
          recordLists={recordLists}
          methods={methods}
        />
      </section>
    </>
  );
};
