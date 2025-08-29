import { Gtk } from "ags/gtk4";
import { createState } from "gnim";
import { timeout } from "ags/time";

import { ViewId, Views } from "./types";
import { S_PER_MS } from "../../../constants";
import { ViewRenderer } from "./view-renderer";

const TRANSITION_DURATION = 0.35 * S_PER_MS;

export function Body() {
  const [activeView, setActiveView] = createState(Views.Main);
  const [showContent, setShowContent] = createState(true);

  const changeView = (newView: ViewId) => {
    setShowContent(false);
    timeout(TRANSITION_DURATION, () => {
      setActiveView(newView);
      timeout(TRANSITION_DURATION / 2, () => {
        setShowContent(true);
      });
    });
  }

  return (
    <revealer
      vexpand
      hexpand
      transitionType={Gtk.RevealerTransitionType.CROSSFADE}
      revealChild={showContent}
      class="BodyContainer"
    >
      <ViewRenderer
        id={activeView}
        changeView={changeView}
      />
    </revealer>
  );
}
