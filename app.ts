import app from "ags/gtk4/app"
import style from "./style.scss"

import Bar from "./widget/Bar"
import Dashboard from "./widget/Dashboard";
import OSD from "./widget/OSD";
import Notifications from "./widget/Notifications";
import ControlCenter from "./widget/ControlCenter";
import Confirm from "./widget/Confirm";
import KBDLayout from "./widget/KBDLayout";
import LockScreen from "./widget/LockScreen";

import { LockScreen as LockScreenService } from "./services";

import "./daemons";

app.start({
  css: style,
  requestHandler: (argv: string[], res: (response: string) => void): void => {
    const [action, ..._params] = argv;
    switch (action) {
      case "lock-screen-toggle": {
        LockScreenService.get_default().toggle();
        res("toggle");
      } break;
    }
  },
  main() {
    app.get_monitors().forEach((mon, idx) => {
      Bar(mon);
      Dashboard(mon);
      ControlCenter(mon);
      LockScreen(mon, idx === 0);
      if (idx === 0) {
        OSD(mon);
        KBDLayout(mon);
        Notifications(mon);
        Confirm(mon);
      }
    });
  },
})
