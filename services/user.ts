import GObject, { register, getter } from "gnim/gobject";
import GLib from "gi://GLib";
import { exec } from "ags/process";

const home = () => GLib.get_home_dir();

@register({ GTypeName: "User" })
export class User extends GObject.Object {
  static instance: User;
  static get_default() {
    return this.instance ||= new User();
  }

  private static PFP_PATH = `${home()}/.face`;
  private static PFP_EXTS = [".png", ".jpg", ".jpeg"];

  @getter(String)
  get whoami() {
    return GLib.getenv("USER") ?? exec("whoami");
  }

  @getter(Boolean)
  get has_pfp(): boolean {
    return this.pfp.length > 0;
  }

  @getter(String)
  get pfp(): string {
    for (const x of User.PFP_EXTS) {
      const v = User.PFP_PATH.concat(x);
      if (GLib.file_test(v, GLib.FileTest.IS_REGULAR)) {
        return v;
      }
    }
    return "";
  }
}
