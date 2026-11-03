import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import * as api from "./services/marundaApi";
import { makeEntry } from "./test/fixtures";
import type { ScanEvent, ScanSummary } from "./types/nodeModules";

vi.mock("./services/marundaApi", () => ({
  scanNodeModules: vi.fn(),
  cancelScan: vi.fn(),
  deleteNodeModules: vi.fn(),
  getHomeDirectory: vi.fn(),
  pickDirectory: vi.fn(),
  revealInFileManager: vi.fn(),
}));

// Skip the minimum on-screen time of the scanning animation.
vi.mock("./lib/timing", () => ({ SCAN_SCREEN_MIN_MS: 0, SCAN_CELEBRATION_MS: 0 }));

const shop = makeEntry({ projectName: "shop", projectPath: "/Users/me/code/shop", sizeBytes: 300 * 1024 ** 2 });
const blog = makeEntry({ projectName: "blog", projectPath: "/Users/me/code/blog", sizeBytes: 100 * 1024 ** 2 });

function summary(overrides: Partial<ScanSummary> = {}): ScanSummary {
  return { totalFound: 2, totalBytes: 0, directoriesVisited: 42, cancelled: false, durationMs: 12, ...overrides };
}

function emitScanResults(_root: string, onEvent: (event: ScanEvent) => void) {
  onEvent({ event: "found", data: { entry: blog } });
  onEvent({ event: "found", data: { entry: shop } });
  onEvent({ event: "finished", data: summary() });
  return Promise.resolve();
}

async function startScanFromWelcome() {
  const scanButton = await screen.findByRole("button", { name: "Start scan" });
  await waitFor(() => expect(scanButton).toBeEnabled());
  await act(async () => fireEvent.click(scanButton));
}

const projectNames = () =>
  screen.getAllByRole("row").map((row) => within(row).getAllByRole("cell")[1].querySelector(".entry-row__name")?.textContent);

describe("App", () => {
  beforeEach(() => {
    vi.mocked(api.getHomeDirectory).mockResolvedValue("/Users/me");
    vi.mocked(api.scanNodeModules).mockImplementation(emitScanResults);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("goes from welcome to scanning to a dashboard sorted by size, then deletes a selection", async () => {
    vi.mocked(api.deleteNodeModules).mockResolvedValue([{ path: blog.path, success: true, error: null }]);
    render(<App />);

    expect(screen.getByRole("heading", { name: /Reclaim your disk/ })).toBeInTheDocument();
    await startScanFromWelcome();
    expect(api.scanNodeModules).toHaveBeenCalledWith("/Users/me", expect.any(Function));

    await screen.findByRole("table", { name: "node_modules folders" });
    expect(projectNames()).toEqual(["shop", "blog"]);
    expect(screen.getByText(/Scanned 42 folders/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select blog" }));
    const selectionBar = await screen.findByRole("region", { name: "Selection actions" });
    fireEvent.click(within(selectionBar).getByRole("button", { name: "Delete 1" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent("Delete 1 node_modules folder?");
    await act(async () => fireEvent.click(within(dialog).getByRole("button", { name: "Yes, delete" })));

    expect(api.deleteNodeModules).toHaveBeenCalledWith([blog.path]);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    await waitFor(() => expect(projectNames()).toEqual(["shop"]));
    expect(screen.getByText(/Deleted 1 folder/)).toHaveTextContent("Deleted 1 folder and freed 100 MB.");
  });

  it("sorts by name when the Name tab is chosen", async () => {
    render(<App />);
    await startScanFromWelcome();
    await screen.findByRole("table", { name: "node_modules folders" });

    fireEvent.click(screen.getByRole("button", { name: "Name" }));

    await waitFor(() => expect(projectNames()).toEqual(["blog", "shop"]));
  });

  it("returns to the welcome screen with the error when a scan cannot start", async () => {
    vi.mocked(api.scanNodeModules).mockRejectedValue("Folder not found: /nope");
    render(<App />);

    await startScanFromWelcome();

    expect(await screen.findByRole("alert")).toHaveTextContent("Scan failed: Folder not found: /nope");
    expect(screen.getByRole("button", { name: "Start scan" })).toBeInTheDocument();
  });

  it("returns to the welcome screen when a scan is cancelled before finding anything", async () => {
    vi.mocked(api.scanNodeModules).mockImplementation((_root, onEvent) => {
      onEvent({ event: "finished", data: summary({ totalFound: 0, cancelled: true }) });
      return Promise.resolve();
    });
    render(<App />);

    await startScanFromWelcome();

    await waitFor(() => expect(screen.getByRole("button", { name: "Start scan" })).toBeInTheDocument());
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
