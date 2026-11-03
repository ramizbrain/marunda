import { describe, expect, it } from "vitest";

import { makeEntry } from "../test/fixtures";
import { initialScanState, scanReducer } from "./scanReducer";
import type { ScanState } from "./scanReducer";

const scanning: ScanState = { ...initialScanState, status: "scanning" };

describe("scanReducer", () => {
  it("resets previous results when a scan starts", () => {
    const previous: ScanState = { ...initialScanState, status: "finished", entries: [makeEntry()] };
    expect(scanReducer(previous, { type: "started" })).toEqual(scanning);
  });

  it("appends found entries", () => {
    const entry = makeEntry();
    const next = scanReducer(scanning, { type: "eventReceived", event: { event: "found", data: { entry } } });
    expect(next.entries).toEqual([entry]);
  });

  it("tracks progress", () => {
    const next = scanReducer(scanning, {
      type: "eventReceived",
      event: { event: "progress", data: { directoriesVisited: 250, currentPath: "/a/b" } },
    });
    expect(next.directoriesVisited).toBe(250);
    expect(next.currentPath).toBe("/a/b");
  });

  it("stores the summary when the scan finishes", () => {
    const summary = { totalFound: 0, totalBytes: 0, directoriesVisited: 9, cancelled: false, durationMs: 5 };
    const next = scanReducer(scanning, { type: "eventReceived", event: { event: "finished", data: summary } });
    expect(next.status).toBe("finished");
    expect(next.summary).toEqual(summary);
  });

  it("records failures", () => {
    const next = scanReducer(scanning, { type: "failed", message: "Folder not found" });
    expect(next.status).toBe("error");
    expect(next.error).toBe("Folder not found");
  });

  it("removes deleted entries by path", () => {
    const keep = makeEntry({ projectName: "keep" });
    const drop = makeEntry({ projectName: "drop" });
    const state: ScanState = { ...initialScanState, entries: [keep, drop] };
    expect(scanReducer(state, { type: "entriesRemoved", paths: [drop.path] }).entries).toEqual([keep]);
  });
});
