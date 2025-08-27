import GObject, { getter, register } from "gnim/gobject";
import { readFile, readFileAsync } from "ags/file";
import { formatDateAsTimeAgo } from "../utils";
import { interval } from "ags/time";
import { S_PER_MS } from "../constants";

const UPDATE_MS = 10 * S_PER_MS;

@register({ GTypeName: "Uptime" })
export class Uptime extends GObject.Object {
  static instance: Uptime;
  static get_default() {
    return this.instance || (this.instance = new Uptime());
  }

  #seconds = Number(readFile("/proc/uptime").split(" ")[0]);

  @getter(Number)
  get seconds() { return this.#seconds; };

  @getter(String)
  get formatted() {
    const now = new Date();
    const pastDate = new Date(now.getTime() - this.#seconds * 1000);
    return formatDateAsTimeAgo(pastDate);
  }

  constructor() {
    super();
    interval(UPDATE_MS, async () => {
      const f = "/proc/uptime";
      this.#seconds = Number((await readFileAsync(f)).split(" ")[0]);
      this.notify("seconds");
      this.notify("formatted");
    });
  }
}
