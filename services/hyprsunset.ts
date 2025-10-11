import { writeFileAsync } from "ags/file";
import { interval } from "ags/time";
import GLib from "gi://GLib?version=2.0";
import GObject, { register, getter } from "gnim/gobject";
import { MIN_PER_MS } from "../constants";
import { execAsync } from "ags/process";
import { readFileCreate } from "../utils";

const HYPRSUNSET_STATUS = GLib.get_user_cache_dir() + "/hyprsunset.status";
const HYPRSUNSET_TEMPERATURE = "4700";

@register({ GTypeName: "Hyprsunset" })
export class Hyprsunset extends GObject.Object {
  static instance: Hyprsunset;
  static get_default() {
    return this.instance ||= new Hyprsunset();
  }

  #isRunning = readFileCreate(HYPRSUNSET_STATUS) === "yes";

  @getter(Boolean)
  get is_running() { return this.#isRunning; }

  constructor() {
    super();
    this.monitorProcess();
  }

  toggle() {
    if (this.#isRunning) return this.kill();
    else return this.spawn();
  }

  async kill() {
    await execAsync(["killall", "-9", "hyprsunset"]);
    this.#setIsRunning(false);
  }

  spawn() {
    execAsync(["hyprsunset", "--temperature", HYPRSUNSET_TEMPERATURE]);
    this.#setIsRunning(true);
  }

  async #isRunningProcess() {
    const res = await execAsync(["bash", "-c", "ps uax | grep hyprsunset | grep -v grep | wc -l"]);
    return Number(res) > 0;
  }

  #setIsRunning(value: boolean) {
    this.#isRunning = value;
    this.notify("is_running");
    writeFileAsync(HYPRSUNSET_STATUS, value ? "yes" : "no");
  }

  monitorProcess() {
    const update = async () => {
      const running = await this.#isRunningProcess();
      if (running !== this.#isRunning) {
        this.#setIsRunning(running);
      }
    }
    update();
    interval(5 * MIN_PER_MS, update);
  }
}
