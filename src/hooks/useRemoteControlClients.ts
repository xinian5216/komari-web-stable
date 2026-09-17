import { useEffect, useState } from "react";

import type { TerminalClient } from "../pages/terminal/terminalTypes";

const LIST_ENDPOINT = "/api/admin/client/list";

// The admin client list is fetched once and shared: several components need to
// know whether an agent accepts terminal / file manager requests, and a panel
// page can render many node rows at the same time.
let cachedClients: TerminalClient[] | null = null;
let inflight: Promise<TerminalClient[]> | null = null;

const loadClients = (): Promise<TerminalClient[]> => {
  if (cachedClients) {
    return Promise.resolve(cachedClients);
  }
  if (!inflight) {
    inflight = fetch(LIST_ENDPOINT)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load clients (${response.status})`);
        }
        return response.json();
      })
      .then((data: unknown) => {
        const list = Array.isArray(data) ? (data as TerminalClient[]) : [];
        cachedClients = list;
        return list;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

/**
 * What the agents reported about their remote control capabilities, keyed by
 * client uuid. Agents that reported nothing are absent, and callers must treat
 * "absent" as "unknown, keep the previous behaviour".
 */
export const useRemoteControlClients = (): {
  clients: Map<string, TerminalClient>;
  loading: boolean;
} => {
  const [clients, setClients] = useState<Map<string, TerminalClient>>(
    () =>
      new Map((cachedClients ?? []).map((client) => [client.uuid, client])),
  );
  const [loading, setLoading] = useState(!cachedClients);

  useEffect(() => {
    let mounted = true;
    if (cachedClients) {
      return undefined;
    }
    loadClients()
      .then((list) => {
        if (!mounted) {
          return;
        }
        setClients(new Map(list.map((client) => [client.uuid, client])));
      })
      .catch(() => {
        // A failed lookup must never block the panel: unknown means the panel
        // keeps its previous behaviour.
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { clients, loading };
};
