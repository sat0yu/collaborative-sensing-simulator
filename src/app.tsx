import React, { useCallback, useState } from "react";
import { RecordList } from "./interfaces";
import { Recorder } from "./recorder";
import { Room } from "./room";
import { Sensor } from "./sensor";
import { Simulator } from "./simulator";

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
    <>
      <section>
        <h1>Recorder</h1>
        <Recorder
          width={500}
          height={500}
          room={room}
          sensors={sensors}
          addRecordList={addRecordList}
          recordLists={recordLists}
        />
      </section>
      <section>
        <h1>Simulator</h1>
        <Simulator
          width={500}
          height={500}
          room={room}
          sensors={sensors}
          recordLists={recordLists}
        />
      </section>
    </>
  );
};
