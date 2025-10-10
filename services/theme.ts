import { readFileAsync, writeFileAsync } from "ags/file";
import Gio20 from "gi://Gio";
import GLib from "gi://GLib";
import GObject, { register, getter, setter } from "gnim/gobject";

export const ActiveThemes = {
  dark: 0,
  light: 1,
} as const;

export type ActiveTheme = typeof ActiveThemes[keyof typeof ActiveThemes];

// TODO: Maybe define this somewhere else, anyways this will be bundled
// in the code because this service will generate sass files anyways so yeah.
const palettes = {
  [ActiveThemes.dark]: {
    ["light_mode"]: "false",
    ["background"]: "#0a0a0a",
    ["solid-bg"]: "#0a0a0a",
    ["foreground"]: "#cdcdcd",
    ["black"]: "#242424",
    ["red"]: "#d8647e",
    ["green"]: "#7fa563",
    ["yellow"]: "#f3be7c",
    ["blue"]: "#6e94b2",
    ["magenta"]: "#bb9dbd",
    ["cyan"]: "#aeaed1",
    ["white"]: "#cdcdcd",
    ["light_black"]: "#424242",
    ["light_red"]: "#e08398",
    ["light_green"]: "#99b782",
    ["light_yellow"]: "#f5cb96",
    ["light_blue"]: "#8ba9c1",
    ["light_magenta"]: "#c9b1ca",
    ["light_cyan"]: "#bebeda",
    ["light_white"]: "#d7d7d7",
    ["general-opacity"]: "1",
    ["contrast1"]: "rgba(#ffffff, 0.05)",
    ["contrast2"]: "rgba(#ffffff, 0.1)",
    ["contrastfg"]: "rgba(#ffffff, 0.35)",
    ["font-regular"]: "Inter",
    ["font-icons"]: "Phosphor",
    ["font-nf"]: "JetBrainsMono Nerd Font",
    ["accent"]: "$light_blue",
    ["accent2"]: "$light_yellow",
    ["tinted-white"]: "color.mix($accent, $white, 50%)",
    ["tinted-white-2"]: "color.mix($accent, $white, 75%)",
  },
  [ActiveThemes.light]: {
    ["light_mode"]: "true",
    ["background"]: "#dee1e6",
    ["solid-bg"]: "#dee1e6",
    ["foreground"]: "#2e2c2f",
    ["black"]: "#c5c8cd",
    ["red"]: "#BA5860",
    ["green"]: "#728B79",
    ["yellow"]: "#c8a360",
    ["blue"]: "#5292C6",
    ["magenta"]: "#8C6AA8",
    ["cyan"]: "#489CA5",
    ["white"]: "#101419",
    ["light_black"]: "#989ba0",
    ["light_red"]: "#9d4b53",
    ["light_green"]: "#59795f",
    ["light_yellow"]: "#a78a58",
    ["light_blue"]: "#40739a",
    ["light_magenta"]: "#715688",
    ["light_cyan"]: "#3b8187",
    ["light_white"]: "#1f2328",
    ["general-opacity"]: "1",
    ["contrast1"]: "rgba(#000000, 0.05)",
    ["contrast2"]: "rgba(#000000, 0.1)",
    ["contrastfg"]: "rgba(#000000, 0.35)",
    ["font-regular"]: "Inter",
    ["font-icons"]: "Phosphor",
    ["font-nf"]: "JetBrainsMono Nerd Font",
    ["accent"]: "$light_red",
    ["accent2"]: "$light_cyan",
    ["tinted-white"]: "color.mix($accent, $black, 50%)",
    ["tinted-white-2"]: "color.mix($accent, $black, 75%)",
  }
}

@register({ GTypeName: "Theme" })
export class Theme extends GObject.Object {
  static instance: Theme;
  static get_default() {
    return this.instance ||= new Theme();
  }

  // TODO: Maybe in a future i will like the config not to be reliant on
  // .config/ags because, per example, nixos could be an issue.
  private static STYLE_FILE = GLib.get_user_config_dir() + "/ags/theme.scss";

  #activeTheme: ActiveTheme = ActiveThemes.dark;
  #stylesCache: undefined | Map<string, string> = undefined;

  @getter(Number)
  get colorscheme() { return this.#activeTheme; }

  @setter(Number)
  set colorscheme(newValue: number) {
    if (!Object.values(ActiveThemes).includes(newValue as ActiveTheme)) {
      console.error("cannot set active theme to value", newValue, "because it is not a valid identifier");
      return;
    }
    this.#dumpNewTheme(newValue as ActiveTheme);
  }

  constructor() {
    super();
    this.#getActiveTheme();
  }

  #booleanString(value: "true" | "false" | string) {
    return value === "true";
  }

  async #getActiveTheme() {
    const style = await this.#parseStyles();
    const lightMode = this.#booleanString(style.get("light_mode") ?? "false");
    this.#activeTheme = lightMode ? ActiveThemes.light : ActiveThemes.dark;
    this.notify("colorscheme");
  }

  async #parseStyles(): Promise<Map<string, string>> {
    if (this.#stylesCache === undefined) this.#stylesCache = new Map();
    const contents = await readFileAsync(Theme.STYLE_FILE);
    for (const line of contents.split("\n")) {
      if (line.startsWith("$")) {
        const [varName, varValue] = line.split(":").map(x => {
          return x.trim().replaceAll(";", "").replaceAll("$", "");
        });
        this.#stylesCache.set(varName, varValue);
      }
    }
    return this.#stylesCache;
  }

  async #dumpNewTheme(newTheme: ActiveTheme) {
    if (newTheme === this.#activeTheme) return;

    const newPalette = palettes[newTheme];
    this.#activeTheme = this.#booleanString(newPalette.light_mode) ? ActiveThemes.light : ActiveThemes.dark;
    this.notify("colorscheme");

    const newSassContent = this.#compileNewTheme(newPalette);
    await writeFileAsync(Theme.STYLE_FILE, newSassContent);
    this.#rebuildShell();
  }

  // TODO: This part will be really problematic in nixos if you
  // get too purist about immutability, the correct way would be to
  // have some arbitrary compiled css file somewhere, load it
  // from the shell, rebuild it here, and use that in app.js so
  // even a bundled sshell will be able to reload, but idk first arch.
  async #rebuildShell() {
    const reloadCommand = `( sleep 0.5 && killall -9 gjs && cd $HOME/.config/ags && nohup ags run . > /dev/null 2>&1 & ) &`;
    Gio20.Subprocess.new(
      ['bash', '-c', reloadCommand],
      Gio20.SubprocessFlags.NONE,
    );
  }

  #compileNewTheme(palette: typeof palettes[keyof typeof palettes]): string {
    let base = "@use \"sass:color\";\n\n";
    for (const [key, value] of Object.entries(palette)) {
      base += `$${key}: ${value};\n`;
    }
    return base
  }

  #refreshStylesCache() {
    if (this.#stylesCache) {
      this.#stylesCache.clear();
      this.#stylesCache = undefined;
    }
  }
}
