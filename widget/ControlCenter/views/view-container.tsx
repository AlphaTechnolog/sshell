import { Gtk } from "ags/gtk4";
import { useShowable } from "./use-showable";

export type ViewContainerProps = Record<string, any> & {
  extraClass?: string;
  children: JSX.Element | JSX.Element[];
};

export function ViewContainer({ children, extraClass, ...args }: ViewContainerProps) {
  const { showable, showableClassname } = useShowable();

  return (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      vexpand
      hexpand
      class={showable(s => `ViewContainer ${extraClass ?? ""} ${showableClassname(s)}`)}
      {...args}
    >
      {children}
    </box>
  );
}
