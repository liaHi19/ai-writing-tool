import { useSyncExternalStore } from "react";

export function useHint() {
  const subscribe = () => () => {};
  const getHintSnapshot = () =>
    /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "⌘↵" : "Ctrl+↵";
  const getHintServerSnapshot = () => "Ctrl+↵";

  const hint = useSyncExternalStore(
    subscribe,
    getHintSnapshot,
    getHintServerSnapshot,
  );

  return hint;
}
