import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteNodeModules } from "../services/marundaApi";
import { makeEntry } from "../test/fixtures";
import { useNodeModulesDeletion } from "./useNodeModulesDeletion";

vi.mock("../services/marundaApi", () => ({ deleteNodeModules: vi.fn() }));
const deleteMock = vi.mocked(deleteNodeModules);

const web = makeEntry({ projectName: "web", sizeBytes: 300 });
const api = makeEntry({ projectName: "api", sizeBytes: 700 });

describe("useNodeModulesDeletion", () => {
  beforeEach(() => {
    deleteMock.mockReset();
  });

  it("reports freed space and only hands back paths that were really deleted", async () => {
    deleteMock.mockResolvedValue([
      { path: web.path, success: true, error: null },
      { path: api.path, success: false, error: "Permission denied" },
    ]);
    const onDeleted = vi.fn();
    const { result } = renderHook(() => useNodeModulesDeletion(onDeleted));

    await act(() => result.current.deleteEntries([web, api]));

    expect(onDeleted).toHaveBeenCalledWith([web.path]);
    expect(result.current.report).toEqual({
      deletedCount: 1,
      freedBytes: 300,
      failures: [{ path: api.path, success: false, error: "Permission denied" }],
    });
    expect(result.current.isDeleting).toBe(false);
  });

  it("marks every entry as failed when the backend call itself fails", async () => {
    deleteMock.mockRejectedValue("Background task failed");
    const onDeleted = vi.fn();
    const { result } = renderHook(() => useNodeModulesDeletion(onDeleted));

    await act(() => result.current.deleteEntries([web]));

    expect(onDeleted).not.toHaveBeenCalled();
    expect(result.current.report?.failures).toEqual([
      { path: web.path, success: false, error: "Background task failed" },
    ]);
  });
});
