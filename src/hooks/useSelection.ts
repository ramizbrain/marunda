import { useCallback, useState } from "react";

/** A set of selected keys (here: `node_modules` paths) with immutable updates. */
export function useSelection() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());

  const toggle = useCallback((key: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const select = useCallback((keys: readonly string[]) => {
    setSelected((current) => new Set([...current, ...keys]));
  }, []);

  const deselect = useCallback((keys: readonly string[]) => {
    const removed = new Set(keys);
    setSelected((current) => new Set([...current].filter((key) => !removed.has(key))));
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  return { selected, toggle, select, deselect, clear };
}
