import { describe, expect, it } from "vitest";

import { formatAge, formatBytes, formatDuration, pluralize, shortenPath } from "./format";

describe("formatBytes", () => {
  it.each([
    [0, "0 B"],
    [-5, "0 B"],
    [512, "512 B"],
    [1536, "1.5 KB"],
    [250 * 1024 * 1024, "250 MB"],
    [3.25 * 1024 ** 3, "3.3 GB"],
    [2 * 1024 ** 5, "2048 TB"],
  ])("formats %d as %s", (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
  // Regression: animated counters pass fractions while easing to 0, which used to render "30.5 undefined".
  it.each([
    [0.0298, "0 B"],
    [0.4, "0 B"],
    [0.6, "1 B"],
    [1023.6, "1.0 KB"],
    [Number.NaN, "0 B"],
  ])("never produces an unknown unit for fractional input %d", (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});

describe("formatAge", () => {
  const day = 24 * 60 * 60 * 1000;
  const now = 1000 * day;

  it.each([
    [null, "—"],
    [now - 1000, "today"],
    [now - 1 * day, "1 day ago"],
    [now - 3 * day, "3 days ago"],
    [now - 40 * day, "1 month ago"],
    [now - 65 * day, "2 months ago"],
    [now - 400 * day, "1 year ago"],
    [now - 800 * day, "2 years ago"],
  ])("describes %s", (timestamp, expected) => {
    expect(formatAge(timestamp, now)).toBe(expected);
  });
});

describe("shortenPath", () => {
  it("replaces the home directory with ~", () => {
    expect(shortenPath("/Users/me/code/app", "/Users/me")).toBe("~/code/app");
    expect(shortenPath("/Users/me", "/Users/me/")).toBe("~");
  });

  it("leaves other paths and look-alike prefixes untouched", () => {
    expect(shortenPath("/opt/app", "/Users/me")).toBe("/opt/app");
    expect(shortenPath("/Users/meow/app", "/Users/me")).toBe("/Users/meow/app");
  });

  it("supports Windows separators", () => {
    expect(shortenPath("C:\\Users\\me\\code", "C:\\Users\\me")).toBe("~\\code");
  });
});

describe("pluralize", () => {
  it("adds an s for anything but exactly one", () => {
    expect(pluralize(0, "folder")).toBe("0 folders");
    expect(pluralize(1, "folder")).toBe("1 folder");
    expect(pluralize(1500, "folder")).toBe("1,500 folders");
  });
});

describe("formatDuration", () => {
  it("uses ms below one second and seconds above", () => {
    expect(formatDuration(420)).toBe("420 ms");
    expect(formatDuration(2500)).toBe("2.5 s");
  });
});
