import { describe, expect, it } from "vitest";

import { phaseAfterScan } from "./phase";

const summary = (cancelled: boolean) => ({
  totalFound: 0,
  totalBytes: 0,
  directoriesVisited: 10,
  cancelled,
  durationMs: 5,
});

describe("phaseAfterScan", () => {
  it("shows the dashboard after a completed scan, even an empty one", () => {
    expect(phaseAfterScan("finished", summary(false), 0)).toBe("dashboard");
    expect(phaseAfterScan("finished", summary(false), 3)).toBe("dashboard");
  });

  it("returns to the start after a failure", () => {
    expect(phaseAfterScan("error", null, 0)).toBe("welcome");
  });

  it("keeps partial results of a cancelled scan, but skips an empty one", () => {
    expect(phaseAfterScan("finished", summary(true), 2)).toBe("dashboard");
    expect(phaseAfterScan("finished", summary(true), 0)).toBe("welcome");
  });
});
