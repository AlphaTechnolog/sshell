import GObject, { register, getter, setter } from "gnim/gobject";

export type Action = {
  label: string;
  style?: "Primary" | "Regular" | "Error" | "Warning" | "Success";
  onClicked?(close: () => void): void;
};

export type ConfirmData = {
  icon: string;
  iconStyle?: string;
  title: string;
  summary: string;
  actions: Action[];
};

@register({ GTypeName: "Confirm" })
export class Confirm extends GObject.Object {
  static instance: Confirm;
  static get_default(): Confirm {
    return this.instance ||= new Confirm();
  }

  #opened = false;
  #icon = "";
  #iconStyle = "";
  #title = "Title";
  #summary = "Summary";
  #actions: Action[] = [];

  @getter(Boolean)
  get visible() { return this.#opened; }

  @getter(String)
  get icon() { return this.#icon; }

  @getter(String)
  get icon_style() { return this.#iconStyle; }

  @getter(String)
  get title() { return this.#title; }

  @getter(String)
  get summary() { return this.#summary; }

  @getter(Array)
  get actions() { return this.#actions; }

  @setter(String)
  set icon(value: string) {
    this.#icon = value;
    this.notify("icon");
  }

  @setter(String)
  set icon_style(style: string) {
    this.#iconStyle = style;
    this.notify("icon_style");
  }

  @setter(String)
  set title(value: string) {
    this.#title = value;
    this.notify("title");
  }

  @setter(String)
  set summary(value: string) {
    this.#summary = value;
    this.notify("summary");
  }

  @setter(Array)
  set actions(value: Action[]) {
    this.#actions = value;
    this.notify("actions");
  }

  @setter(Boolean)
  set visible(value: boolean) {
    this.#opened = value;
    this.notify("visible");
  }

  startConfirm(confirmData: ConfirmData) {
    this.icon = confirmData.icon;
    this.icon_style = confirmData.iconStyle ?? "";
    this.title = confirmData.title;
    this.summary = confirmData.summary;
    this.actions = confirmData.actions;
    this.visible = true;
  }

  closeConfirm() {
    this.visible = false;
  }
}
