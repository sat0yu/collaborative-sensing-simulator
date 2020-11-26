import React, { ChangeEvent, useCallback, useState } from "react";
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

  const room = new Room({
    topLeft: { x: roomPosSize[0], y: roomPosSize[1] },
    bottomRight: {
      x: roomPosSize[0] + roomPosSize[2],
      y: roomPosSize[1] + roomPosSize[3],
    },
    color: "gray",
  });
  const sensors = [
    new Sensor({ id: "s0", x: 175, y: 175, r: 80, color: "red" }),
    new Sensor({ id: "s1", x: 325, y: 175, r: 80, color: "red" }),
    new Sensor({ id: "s2", x: 175, y: 325, r: 80, color: "red" }),
    new Sensor({ id: "s3", x: 325, y: 325, r: 80, color: "red" }),
  ];
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
      <p>
        <label htmlFor="cvsW">Canvas width: </label>
        <input
          name="cvsW"
          type="number"
          value={canvasSize[0]}
          onChange={setCanvasWidth}
        />
      </p>
      <p>
        <label htmlFor="cvsH">Canvas height: </label>
        <input
          name="cvsH"
          type="number"
          value={canvasSize[1]}
          onChange={setCanvasHeight}
        />
      </p>
      <p>
        <label htmlFor="roomL">Room left: </label>
        <input
          name="roomL"
          type="number"
          value={roomPosSize[0]}
          onChange={setRoomLeft}
        />
      </p>
      <p>
        <label htmlFor="roomH">Room top: </label>
        <input
          name="roomH"
          type="number"
          value={roomPosSize[1]}
          onChange={setRoomTop}
        />
      </p>
      <p>
        <label htmlFor="roomW">Room width: </label>
        <input
          name="roomW"
          type="number"
          value={roomPosSize[2]}
          onChange={setRoomWidth}
        />
      </p>
      <p>
        <label htmlFor="roomH">Room height: </label>
        <input
          name="roomH"
          type="number"
          value={roomPosSize[3]}
          onChange={setRoomHeight}
        />
      </p>
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
