import { With, type Accessor } from "gnim"
import { Views, type ViewContentProps, type ViewId } from "./types";

import { Main } from "./views";

export type ViewRendererProps = Record<string, any> & {
  id: Accessor<ViewId>,
  changeView(viewId: ViewId): void;
}

export function ViewRenderer({ id, changeView }: ViewRendererProps) {
  const getView = (value: ViewId) => {
    const props: ViewContentProps = {
      viewId: value,
      changeView,
    };

    const mapped = {
      [Views.Main]: Main,
    };

    if (value in mapped) {
      const Component = mapped[value];
      return <Component {...props} />
    }

    throw new Error("Unable to find view by id " + String(value));
  }

  return (
    <box vexpand hexpand>
      <With value={id}>
        {getView}
      </With>
    </box>
  );
}
