import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () =>
  /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "⌘↵" : "Ctrl+↵";
const getServerSnapshot = () => "Ctrl+↵";

export function useHint() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
