import GObject, { register, getter, setter } from "gnim/gobject";

@register({ GTypeName: "LockScreen" })
export class LockScreen extends GObject.Object {
  static instance: LockScreen;
  static get_default() {
    return this.instance ||= new LockScreen();
  }

  #visible = false;

  @getter(Boolean)
  get visible() { return this.#visible; }

  @setter(Boolean)
  set visible(value: boolean) {
    this.#visible = value;
    this.notify("visible");
  }

  open() { this.visible = true; }
  close() { this.visible = false; }
  toggle() { this.visible = !this.#visible; }
}
