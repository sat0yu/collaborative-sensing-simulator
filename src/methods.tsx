import { RecordList } from "./interfaces";

export class MaxFunc {
  public name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public probe({ messages }: RecordList[number]) {
    return messages.reduce((acc, { body }) => acc || body, false);
  }
}

export class Majorityfunc {
  public name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public probe({ messages }: RecordList[number]) {
    const count = messages.reduce((acc, { body }) => (body ? acc + 1 : acc), 0);
    return count > 0 && count >= Math.ceil(messages.length / 2);
  }
}

export class DebounceFunc {
  public name: string;
  private duration: number;
  private _count: number;
  private _latest: boolean;
  private _probe: boolean;

  public constructor(name: string, duration: number) {
    this.name = name;
    this.duration = duration;
    this._count = 0;
    this._latest = false;
    this._probe = false;
  }

  public probe({ messages }: RecordList[number]) {
    messages.forEach((msg) => (this._latest = msg.body));
    if (++this._count > this.duration) {
      this._probe = this._latest;
      this._count = 0;
    }
    return this._probe;
  }
}

export class MaxWithCacheFunc {
  public name: string;
  public states: Map<string, boolean>;

  public constructor(name: string, sensorIds: string[]) {
    this.name = name;
    this.states = new Map(sensorIds.map((id) => [id, false]));
  }

  public probe({ messages }: RecordList[number]) {
    messages.forEach(({ id, body }) => {
      if (!this.states.has(id)) {
        return;
      }
      this.states.set(id, body);
    });
    return [...this.states.values()].some((v) => v);
  }
}

export class MajorityWithCachefunc {
  public name: string;
  public states: Map<string, boolean>;

  public constructor(name: string, sensorIds: string[]) {
    this.name = name;
    this.states = new Map(sensorIds.map((id) => [id, false]));
  }

  public probe({ messages }: RecordList[number]) {
    messages.forEach(({ id, body }) => {
      if (!this.states.has(id)) {
        return;
      }
      this.states.set(id, body);
    });
    return (
      [...this.states.values()].reduce((acc, v) => (v ? acc + 1 : acc), 0) >=
      Math.ceil(this.states.size / 2)
    );
  }
}

export class MaxWithCacheAndDebounceFunc {
  public name: string;
  public states: Map<string, boolean>;
  private duration: number;
  private _count: number;
  private _latest: boolean;
  private _probe: boolean;

  public constructor(name: string, sensorIds: string[], duration: number) {
    this.name = name;
    this.states = new Map(sensorIds.map((id) => [id, false]));
    this.duration = duration;
    this._count = 0;
    this._latest = false;
    this._probe = false;
  }

  public probe({ messages }: RecordList[number]) {
    messages.forEach(({ id, body }) => {
      if (!this.states.has(id)) {
        return;
      }
      this.states.set(id, body);
    });
    this._latest = [...this.states.values()].some((v) => v);
    if (++this._count > this.duration) {
      this._probe = this._latest;
      this._count = 0;
    }
    return this._probe;
  }
}
