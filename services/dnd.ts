import { monitorFile, readFile, writeFile, writeFileAsync } from "ags/file";
import GLib from "gi://GLib";
import GObject, { register, getter, setter } from "gnim/gobject";

@register({ GTypeName: "Dnd" })
export class Dnd extends GObject.Object {
  static instance: Dnd;
  static get_default() {
    return this.instance || (this.instance = new Dnd());
  }

  private static CACHE_FILE = GLib.get_user_cache_dir() + "/dnd.status";
  private static YES = "yes";
  private static NO = "no";

  @getter(Boolean)
  get enabled() {
    return readFile(Dnd.CACHE_FILE) === Dnd.YES;
  }

  @setter(Boolean)
  set enabled(value: boolean) {
    writeFile(Dnd.CACHE_FILE, value ? Dnd.YES : Dnd.NO);
  }

  constructor() {
    super();
    this.checkCache();
    this.startMonitor();
  }

  private async checkCache() {
    if (!GLib.file_test(Dnd.CACHE_FILE, GLib.FileTest.IS_REGULAR)) {
      await writeFileAsync(Dnd.CACHE_FILE, Dnd.NO);
    }
  }

  private async startMonitor() {
    monitorFile(Dnd.CACHE_FILE, (_) => {
      this.notify("enabled");
    });
  }
}
