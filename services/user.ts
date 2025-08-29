import GLib from "gi://GLib";
import GObject, { register, getter } from "gnim/gobject";
import Gio from "gi://Gio?version=2.0";

const home = () => GLib.get_home_dir();

@register({ GTypeName: "User" })
export class User extends GObject.Object {
  static instance: User;
  static get_default() {
    return this.instance || (this.instance = new User());
  }

  private static PFP_PATH = `${home()}/.face`;
  private static PFP_EXTS = [".png", ".jpg", ".jpeg"];

  @getter(Boolean)
  get hasPfp(): boolean {
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
