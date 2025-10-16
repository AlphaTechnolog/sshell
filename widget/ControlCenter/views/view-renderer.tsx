import { With, type Accessor } from "gnim"
import { Views, type ViewContentProps, type ViewId } from "./types";

import { Main, BluetoothConfig } from "./views";

// register of views
const mappedViews = {
  [Views.Main]: Main,
  [Views.BluetoothConfig]: BluetoothConfig,
}

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

    if (value in mappedViews) {
      const Component = mappedViews[value];
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
