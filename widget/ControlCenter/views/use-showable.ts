import { timeout } from "ags/time";
import { createState } from "gnim";
import { S_PER_MS } from "../../../constants";

export const useShowable = () => {
  const [showable, setShowable] = createState(false);

  timeout(0.15 * S_PER_MS, () => {
    setShowable(true);
  });

  const showableClassname = (s: boolean) => {
    return s ? "Show" : "";
  }

  return {
    showable,
    showableClassname,
  };
}
