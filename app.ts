import app from "ags/gtk4/app"
import style from "./style.scss"

import Bar from "./widget/Bar"
import Dashboard from "./widget/Dashboard";
import OSD from "./widget/OSD";
import Notifications from "./widget/Notifications";
import ControlCenter from "./widget/ControlCenter";

app.start({
  css: style,
  main() {
    app.get_monitors().forEach(mon => {
      Bar(mon);
      Dashboard(mon);
      OSD(mon);
      ControlCenter(mon);
      Notifications(mon);
    });
  },
})
