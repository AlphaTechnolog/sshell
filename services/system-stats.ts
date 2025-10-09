import { readFileAsync } from "ags/file";
import GObject, { register, getter } from "gnim/gobject";

const POLL_INTERVAL = 2000; // ms
const CPU_FILE = "/proc/stat";
const MEM_FILE = "/proc/meminfo";

@register({ GTypeName: "SystemStats" })
export class SystemStats extends GObject.Object {
  static instance: SystemStats;
  static get_default() {
    return this.instance || (this.instance = new SystemStats());
  }

  #cpuUsage = 0;
  #ramUsed = 0;
//   #ramTotal = 1;
//   #ramUsedKB = 0;

  #prevCpuTotal = 0;
  #prevCpuIdle = 0;

  @getter(Number)
  get cpu() { return this.#cpuUsage; }

  @getter(Number)
  get ram() { return this.#ramUsed; }

  constructor() {
    super();
    this.#initCpuMetrics();
    this.startPolling();
  }

  async #updateCpu() {
    try {
      const contents = await readFileAsync(CPU_FILE);
      const parts = contents.trim().split("\n")[0].split(/\s+/).slice(1);

      const user = parseInt(parts[0]);
      const nice = parseInt(parts[1]);
      const system = parseInt(parts[2]);
      const idle = parseInt(parts[3]);

      const currentTotal = user + nice + system + idle;
      const currentIdle = idle;

      const diffIdle = currentIdle - this.#prevCpuIdle;
      const diffTotal = currentTotal - this.#prevCpuTotal;

      let usage = 0;

      if (diffTotal > 0) {
        usage = 100 * (1 - diffIdle / diffTotal);
      }

      this.#prevCpuTotal = currentTotal;
      this.#prevCpuIdle = currentIdle;

      if (!isNaN(usage) && Math.round(usage) !== this.#cpuUsage) {
        this.#cpuUsage = Math.round(usage);
        this.notify("cpu");
      }
    } catch (err) {
      console.error("error reading cpu stats from /proc/stat:", err);
    }
  }

  async #initCpuMetrics() {
    try {
      const contents = await readFileAsync(CPU_FILE);
      const parts = contents.trim().split("\n")[0].split(/\s+/).slice(1);
      const user = parseInt(parts[0]);
      const nice = parseInt(parts[1]);
      const system = parseInt(parts[2]);
      const idle = parseInt(parts[3]);

      this.#prevCpuTotal = user + nice + system + idle;
      this.#prevCpuIdle = idle;
    } catch (err) {
      console.error("Couldn't initialise CPU metrics from /proc/stat.", err);
    }
  }

  async #updateRam() {
    try {
      const contents = await readFileAsync(MEM_FILE);

      let total = 0;
      let available = 0;

      for (const line of contents.split("\n")) {
        if (line.startsWith("MemTotal:")) {
          total = parseInt(line.split(/\s+/)[1]);
        } else if (line.startsWith("MemAvailable:")) {
          available = parseInt(line.split(/\s+/)[1]);
        }
      }

      if (total > 0) {
        const used = total - available;
//         this.#ramTotal = total;
//         this.#ramUsedKB = used;
        this.#ramUsed = Math.round((used / total) * 100);
        this.notify("ram");
//         this.notify("ramTotalKB");
//         this.notify("ramUsedKB");
      }
    } catch (err) {
      console.error("error reading ram stats from /proc/meminfo:", err);
    }
  }

  startPolling() {
    const poll = () => {
      this.#updateCpu();
      this.#updateRam();
      setTimeout(poll, POLL_INTERVAL);
    };

    poll();
  }
}
