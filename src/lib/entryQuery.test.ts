import { describe, expect, it } from "vitest";

import { makeEntry } from "../test/fixtures";
import { filterEntries, nextSortOrder, sortEntries, totalSize } from "./entryQuery";

const small = makeEntry({ projectName: "beta", sizeBytes: 10, lastModifiedMs: 300 });
const large = makeEntry({ projectName: "Alpha", sizeBytes: 500, lastModifiedMs: 100 });
const medium = makeEntry({ projectName: "gamma", sizeBytes: 200, lastModifiedMs: null });
const entries = [small, large, medium];

const names = (list: { projectName: string }[]) => list.map((entry) => entry.projectName);

describe("sortEntries", () => {
  it("sorts by size, largest first", () => {
    expect(names(sortEntries(entries, { key: "size", direction: "desc" }))).toEqual(["Alpha", "gamma", "beta"]);
  });

  it("sorts by name case-insensitively", () => {
    expect(names(sortEntries(entries, { key: "name", direction: "asc" }))).toEqual(["Alpha", "beta", "gamma"]);
  });

  it("treats unknown dates as the oldest", () => {
    expect(names(sortEntries(entries, { key: "lastModified", direction: "asc" }))).toEqual([
      "gamma",
      "Alpha",
      "beta",
    ]);
  });

  it("does not mutate its input", () => {
    const input = [...entries];
    sortEntries(input, { key: "size", direction: "asc" });
    expect(input).toEqual(entries);
  });
});

describe("filterEntries", () => {
  it("matches project name and path, ignoring case", () => {
    expect(names(filterEntries(entries, "ALP"))).toEqual(["Alpha"]);
    expect(filterEntries(entries, "/home/me/code/")).toHaveLength(3);
  });

  it("returns everything for a blank query", () => {
    expect(filterEntries(entries, "   ")).toHaveLength(3);
  });
});

describe("nextSortOrder", () => {
  it("flips direction when the same column is clicked", () => {
    expect(nextSortOrder({ key: "size", direction: "desc" }, "size")).toEqual({ key: "size", direction: "asc" });
  });

  it("starts names ascending and numbers descending", () => {
    expect(nextSortOrder({ key: "size", direction: "desc" }, "name")).toEqual({ key: "name", direction: "asc" });
    expect(nextSortOrder({ key: "name", direction: "asc" }, "lastModified")).toEqual({
      key: "lastModified",
      direction: "desc",
    });
  });
});

describe("totalSize", () => {
  it("sums sizes", () => {
    expect(totalSize(entries)).toBe(710);
    expect(totalSize([])).toBe(0);
  });
});
