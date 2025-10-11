import { monitorFile, readFile, readFileAsync, writeFile, writeFileAsync } from "ags/file";
import GLib from "gi://GLib";
import GObject, { register, getter, setter } from "gnim/gobject";

@register({ GTypeName: "Dnd" })
export class Dnd extends GObject.Object {
  static instance: Dnd;
  static get_default() {
    return this.instance ||= new Dnd();
  }

  private static CACHE_FILE = GLib.get_user_cache_dir() + "/dnd.status";
  private static YES = "yes";
  private static NO = "no";

  #enabled = readFile(Dnd.CACHE_FILE) === Dnd.YES;

  @getter(Boolean)
  get enabled() { return this.#enabled; }

  @setter(Boolean)
  set enabled(value: boolean) {
    this.#enabled = value;
    this.notify("enabled");
    writeFileAsync(Dnd.CACHE_FILE, value ? Dnd.YES : Dnd.NO);
  }

  constructor() {
    super();
    this.checkCache();
    // disable monitor since we're not really needing to check for file content update atm.
    // this.startMonitor();
  }

  private async checkCache() {
    if (!GLib.file_test(Dnd.CACHE_FILE, GLib.FileTest.IS_REGULAR)) {
      await writeFileAsync(Dnd.CACHE_FILE, Dnd.NO);
    }
  }

  private async startMonitor() {
    monitorFile(Dnd.CACHE_FILE, async (_) => {
      this.#enabled = await readFileAsync(Dnd.CACHE_FILE) === Dnd.YES;
      this.notify("enabled");
    });
  }
}
