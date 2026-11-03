import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSelection } from "./useSelection";

const keys = (set: ReadonlySet<string>) => [...set].sort();

describe("useSelection", () => {
  it("toggles a key on and off", () => {
    const { result } = renderHook(() => useSelection());

    act(() => result.current.toggle("a"));
    expect(keys(result.current.selected)).toEqual(["a"]);

    act(() => result.current.toggle("a"));
    expect(keys(result.current.selected)).toEqual([]);
  });

  it("selects, deselects and clears groups of keys", () => {
    const { result } = renderHook(() => useSelection());

    act(() => result.current.select(["a", "b", "c"]));
    act(() => result.current.deselect(["b"]));
    expect(keys(result.current.selected)).toEqual(["a", "c"]);

    act(() => result.current.clear());
    expect(result.current.selected.size).toBe(0);
  });
});
