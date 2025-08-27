import { exec, execAsync } from "ags/process";
import GObject, { register, getter, setter } from "gnim/gobject";
import { clamp } from "../utils";
import { monitorFile, readFileAsync } from "ags/file";

const hasDependencies = exec("bash -c 'command -v brightnessctl &>/dev/null && echo yes || echo false'") === "yes";
const brightnessctl = (args: string) => Number(hasDependencies ? exec(`bash -c "brightnessctl ${args} || echo 0"`) : 0);
const screen = exec(`bash -c "ls -w1 /sys/class/backlight | head -1"`)

// mostly taken from, but adapted for my needs.
// https://github.com/Aylur/astal-legacy-docs/blob/main/examples/gtk3/js/osd/osd/brightness.ts
@register({ GTypeName: "Brightness" })
export class Brightness extends GObject.Object {
  static instance: Brightness
  static get_default() {
    return this.instance || (this.instance = new Brightness());
  }

  #screenMax = brightnessctl("max");
  #screen = brightnessctl("get") / (brightnessctl("max") || 1);
  #available = hasDependencies && screen.length > 0;

  @getter(Boolean)
  get available() { return this.#available };

  @getter(Number)
  get screen() { return this.#screen };

  @setter(Number)
  set screen(percent: number) {
    if (!this.#available) {
      console.warn("Brightness is not available, either brightnessctl is not installed or no screen supports brightness control");
      return;
    }
    percent = clamp(percent, 0, 1);
    execAsync(`brightnessctl set ${Math.floor(percent * 100)}% -q`).then(() => {
      this.#screen = percent;
      this.notify("screen");
    });
  }

  constructor() {
    super();
    monitorFile(`/sys/class/backlight/${screen}/brightness`, async (f) => {
      const v = await readFileAsync(f);
      this.#screen = Number(v) / this.#screenMax;
      this.notify("screen");
    })
  }
}
