import GObject, { register, getter, setter } from "gnim/gobject";

@register({ GTypeName: "Launcher" })
export class Launcher extends GObject.Object {
  static instance: Launcher;
  static get_default() {
    return this.instance ||= new Launcher();
  }

  #visible = true;

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
