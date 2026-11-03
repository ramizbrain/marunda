import { describe, expect, it } from "vitest";

import { radarPointFor, toCartesianPercent } from "./radar";

describe("radarPointFor", () => {
  it("is stable for the same path", () => {
    expect(radarPointFor("/a/node_modules")).toEqual(radarPointFor("/a/node_modules"));
  });

  it("stays inside the radar, away from the center logo", () => {
    for (let index = 0; index < 200; index++) {
      const { angle, distance } = radarPointFor(`/projects/p${index}/node_modules`);
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThan(360);
      expect(distance).toBeGreaterThanOrEqual(0.38);
      expect(distance).toBeLessThanOrEqual(1);
    }
  });

  it("spreads different paths around the circle", () => {
    const angles = new Set(
      Array.from({ length: 50 }, (_, index) => Math.floor(radarPointFor(`/p${index}`).angle / 45)),
    );
    expect(angles.size).toBeGreaterThanOrEqual(6);
  });
});

describe("toCartesianPercent", () => {
  it("maps polar coordinates into a 0–100 box", () => {
    expect(toCartesianPercent({ angle: 0, distance: 1 })).toEqual({ x: 100, y: 50 });
    const bottom = toCartesianPercent({ angle: 90, distance: 0.5 });
    expect(bottom.x).toBeCloseTo(50);
    expect(bottom.y).toBeCloseTo(75);
  });
});
