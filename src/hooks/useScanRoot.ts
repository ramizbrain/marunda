import { useCallback, useEffect, useState } from "react";

import { getHomeDirectory, pickDirectory } from "../services/marundaApi";

/** The folder to scan. Defaults to the user's home directory. */
export function useScanRoot() {
  const [homeDirectory, setHomeDirectory] = useState("");
  const [root, setRoot] = useState("");

  useEffect(() => {
    getHomeDirectory()
      .then((home) => {
        setHomeDirectory(home);
        setRoot((current) => current || home);
      })
      .catch(() => {
        // Outside Tauri (e.g. plain `vite dev`) there is no home dir; the user can still pick one.
      });
  }, []);

  const chooseRoot = useCallback(async () => {
    const picked = await pickDirectory(root || homeDirectory);
    if (picked) setRoot(picked);
  }, [root, homeDirectory]);

  return { root, homeDirectory, chooseRoot };
}
