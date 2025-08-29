import Network from "gi://AstalNetwork";
import { createBinding, createComputed } from "gnim";

export const useNetworkIcon = () => {
  const net = Network.get_default();
  const state = createBinding(net, "state");
  const primary = createBinding(net, "primary");

  const ethernetIconsMap = {
    [Network.State.UNKNOWN]: "\uEDDC",
    [Network.State.ASLEEP]: "\uEDDA",
    [Network.State.DISCONNECTED]: "\uEDDC",
    [Network.State.DISCONNECTING]: "\uEDDC",
    [Network.State.CONNECTING]: "\uEDDE",
    [Network.State.CONNECTED_LOCAL]: "\uEDDE",
    [Network.State.CONNECTED_SITE]: "\uEDDE",
    [Network.State.CONNECTED_GLOBAL]: "\uEDDE",
  };

  const wirelessIconsMap = {
    [Network.State.UNKNOWN]: "\uE4F4",
    [Network.State.ASLEEP]: "\uE4F4",
    [Network.State.DISCONNECTED]: "\uE4F4",
    [Network.State.DISCONNECTING]: "\uE4F0",
    [Network.State.CONNECTING]: "\uE0F2",
    [Network.State.CONNECTED_LOCAL]: "\uE4F2",
    [Network.State.CONNECTED_SITE]: "\uEBAA",
    [Network.State.CONNECTED_GLOBAL]: "\uE4EA",
  };

  const icon = createComputed([primary, state], (p, s) => {
    const iconsMap = p === Network.Primary.WIRED ? ethernetIconsMap : wirelessIconsMap;
    if (s in iconsMap) {
      return iconsMap[s];
    }
    return iconsMap[Network.State.DISCONNECTED];
  });

  const active = createComputed([state], s => {
    const inactives = [
      Network.State.DISCONNECTED,
      Network.State.DISCONNECTING,
      Network.State.ASLEEP,
      Network.State.UNKNOWN,
    ];

    return !inactives.includes(s);
  })

  return { icon, primary, active };
}
