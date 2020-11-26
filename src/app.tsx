import React, { useCallback, useState } from "react";
import {
  CanvasForm,
  RoomForm,
  SensorsForm,
  useCanvas,
  useRoom,
  useSensors,
} from "./forms";
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

export const App = () => {
  const [showConfiguration, setShowConfiguration] = useState(false);
  const toggleShowConfiguration = useCallback(
    () => setShowConfiguration((prev) => !prev),
    [setShowConfiguration]
  );
  const [showSimulator, setShowSimulator] = useState(false);
  const toggleShowSimulator = useCallback(
    () => setShowSimulator((prev) => !prev),
    [setShowSimulator]
  );
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
        <h1 onClick={toggleShowConfiguration}>
          Configuration {showConfiguration ? "▼" : "▶"}
        </h1>
        {showConfiguration ? (
          <>
            <CanvasForm
              width={canvasSize[0]}
              height={canvasSize[1]}
              setWidth={setCanvasWidth}
              setHeight={setCanvasHeight}
            />
            <RoomForm
              left={roomPosSize[0]}
              top={roomPosSize[1]}
              width={roomPosSize[2]}
              height={roomPosSize[3]}
              setLeft={setRoomLeft}
              setTop={setRoomTop}
              setWidth={setRoomWidth}
              setHeight={setRoomHeight}
            />
            <SensorsForm
              sensors={sensors}
              sensorAttr={sensorAttr}
              setSensorId={setSensorId}
              setSensorX={setSensorX}
              setSensorY={setSensorY}
              setSensorR={setSensorR}
              isValidAttr={isValidAttr}
              addSensor={addSensor}
              removeSensor={removeSensor}
              canvasWidth={canvasSize[0]}
              canvasHeight={canvasSize[1]}
            />
          </>
        ) : null}
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
        <h1 onClick={toggleShowSimulator}>
          Simulator {showSimulator ? "▼" : "▶"}
        </h1>
        {showSimulator ? (
          <Simulator
            width={canvasSize[0]}
            height={canvasSize[1]}
            room={room}
            sensors={sensors}
            recordLists={recordLists}
            methods={methods}
          />
        ) : null}
      </section>
    </>
  );
};
