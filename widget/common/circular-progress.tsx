import { Gdk, Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";
import { Accessor } from "gnim";

const RADIUS = 13;
const LINE_WIDTH = 2;
const SIZE = (RADIUS + LINE_WIDTH) * 2;

function Arc({ percent, activeLookupColor }: { percent: Accessor<number>, activeLookupColor: string }) {
  function getRGBArray(color: Gdk.RGBA): [number, number, number] {
    return [color.red, color.green, color.blue];
  }

  function setup(self: Gtk.DrawingArea) {
    percent.subscribe(() => self.queue_draw());
    self.set_draw_func((_area, cr, width, height) => {
      const context = self.get_style_context();

      const [successTrough, troughColor] = context.lookup_color("ags-trough-color");
      const [successActive, activeColor] = context.lookup_color(activeLookupColor);

      const defaultTrough = [0.2, 0.2, 0.2];
      const defaultActive = [0.8, 0.3, 0.5];

      const troughRGB = successTrough ? getRGBArray(troughColor) : defaultTrough;
      const activeRGB = successActive ? getRGBArray(activeColor) : defaultActive;

      const centerX = width / 2;
      const centerY = height / 2;
      const value = percent.get();

      cr.setSourceRGB(troughRGB[0], troughRGB[1], troughRGB[2]);
      cr.setLineWidth(LINE_WIDTH);
      cr.arc(centerX, centerY, RADIUS, 0, 2 * Math.PI);
      cr.stroke();

      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (value / 100) * (2 * Math.PI);

      cr.setSourceRGB(activeRGB[0], activeRGB[1], activeRGB[2]);
      cr.arc(centerX, centerY, RADIUS, startAngle, endAngle);
      cr.stroke();
    });
  }

  return (
    <drawingarea
      widthRequest={SIZE}
      heightRequest={SIZE}
      valign={Gtk.Align.CENTER}
      halign={Gtk.Align.CENTER}
      class="CircularProgress"
      $={setup}
    />  
  )
}

type CircularProgressProps = {
  percent: Accessor<number>;
  activeLookupColor?: string;
  children: JSX.Element | JSX.Element[];
};

export function CircularProgress({
  activeLookupColor = "ags-cprgs-default-active-color",
  percent,
  children
}: CircularProgressProps) {
  return (
    <box>
      <overlay>
        <Arc
          activeLookupColor={activeLookupColor}
          percent={percent}
        />
        <box $type="overlay">
          {children}
        </box>
      </overlay>
    </box>
  )
}