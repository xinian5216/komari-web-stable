import type { Page, Route, WebSocketRoute } from "@playwright/test";

/**
 * Shared mocks for the browser smoke tests.
 *
 * The tests run against a production build served by `vite preview` with no
 * Komari backend. Everything the public pages need is mocked here, following
 * the contracts implemented by the app:
 *
 * - `GET /api/public`                       -> PublicInfoContext
 * - `GET /api/me`                           -> AccountContext (logged out)
 * - `ws://<host>/api/rpc2` (JSON-RPC 2.0)   -> RPC2Client preferred transport
 * - `POST /api/rpc2` (JSON-RPC 2.0)         -> RPC2Client HTTP fallback
 *
 * RPC methods used by the public pages:
 * - `common:getNodes`            -> { [uuid]: node }
 * - `common:getNodesLatestStatus` -> { [uuid]: live status }
 */

const ONLINE_UUID = "11111111-1111-4111-8111-111111111111";
const OFFLINE_UUID = "22222222-2222-4222-8222-222222222222";

const publicInfo = {
  sitename: "Komari Smoke",
  description: "browser smoke test",
  cors_origin_check_enabled: true,
  custom_body: "",
  custom_head: "",
  disable_password_login: false,
  oauth_provider: "",
  oauth_enable: false,
  metric_retention_days: 30,
  private_site: false,
  theme: "default",
  theme_settings: {},
};

const loggedOutAccount = {
  logged_in: false,
  sso_id: "",
  sso_type: "",
  username: "",
  uuid: "",
  "2fa_enabled": false,
};

const nodes: Record<string, unknown> = {
  [ONLINE_UUID]: {
    uuid: ONLINE_UUID,
    name: "tokyo-1",
    cpu_name: "AMD EPYC 9354P",
    virtualization: "kvm",
    arch: "x86_64",
    cpu_cores: 8,
    os: "Debian 12",
    kernel_version: "6.1.0-18-amd64",
    gpu_name: "",
    region: "JP",
    mem_total: 8 * 1024 * 1024 * 1024,
    swap_total: 0,
    disk_total: 100 * 1024 * 1024 * 1024,
    version: "1.0.0",
    weight: 0,
    price: 10,
    tags: "",
    billing_cycle: 0,
    currency: "CNY",
    group: "prod",
    traffic_limit: 0,
    traffic_limit_type: undefined,
    expired_at: "",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ipv4: "203.0.113.10",
    ipv6: "",
  },
  [OFFLINE_UUID]: {
    uuid: OFFLINE_UUID,
    name: "frankfurt-1",
    cpu_name: "Intel Xeon Gold 5418N",
    virtualization: "kvm",
    arch: "x86_64",
    cpu_cores: 4,
    os: "Ubuntu 24.04",
    kernel_version: "6.8.0-45-generic",
    gpu_name: "",
    region: "DE",
    mem_total: 4 * 1024 * 1024 * 1024,
    swap_total: 1024 * 1024 * 1024,
    disk_total: 50 * 1024 * 1024 * 1024,
    version: "1.0.0",
    weight: 0,
    price: 5,
    tags: "",
    billing_cycle: 0,
    currency: "CNY",
    group: "lab",
    traffic_limit: 0,
    traffic_limit_type: undefined,
    expired_at: "",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ipv4: "198.51.100.20",
    ipv6: "",
  },
};

const latestStatus: Record<string, unknown> = {
  [ONLINE_UUID]: {
    online: true,
    client: ONLINE_UUID,
    cpu: 12.5,
    ram: 4 * 1024 * 1024 * 1024,
    swap: 0,
    load: 0.52,
    load5: 0.41,
    load15: 0.33,
    disk: 40 * 1024 * 1024 * 1024,
    net_in: 1024,
    net_out: 2048,
    net_total_in: 1048576,
    net_total_out: 2097152,
    connections: 10,
    connections_udp: 2,
    gpu: undefined,
    uptime: 86400,
    process: 120,
    time: 1760000000,
  },
  [OFFLINE_UUID]: {
    online: false,
    client: OFFLINE_UUID,
    cpu: 0,
    ram: 0,
    swap: 0,
    load: 0,
    load5: 0,
    load15: 0,
    disk: 0,
    net_in: 0,
    net_out: 0,
    net_total_in: 0,
    net_total_out: 0,
    connections: 0,
    connections_udp: 0,
    gpu: undefined,
    uptime: 0,
    process: 0,
    time: 1760000000,
  },
};

/** Transport counters, reset by {@link installMocks}; used by specs to prove
 *  both JSON-RPC transports (WebSocket preferred, HTTP fallback) are live. */
export const mockTransport = { wsMessages: 0, httpPosts: 0 };

function respondToRpcRequest(request: unknown): unknown {
  const rpc = request as { method?: string; id?: number | string | null };
  const id = rpc?.id;
  if (id === undefined || id === null) {
    return undefined; // notification (e.g. rpc.ping), nothing to answer
  }
  const result =
    rpc.method === "common:getNodes"
      ? nodes
      : rpc.method === "common:getNodesLatestStatus"
        ? latestStatus
        : rpc.method === "common:getVersion"
          ? { version: "1.0.0-smoke" }
          : undefined;
  if (result === undefined) {
    return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } };
  }
  return { jsonrpc: "2.0", id, result };
}

function rpcResponseBody(body: unknown): string {
  const response = Array.isArray(body)
    ? body.map((request) => respondToRpcRequest(request))
    : respondToRpcRequest(body);
  return JSON.stringify(response);
}

async function fulfillJson(route: Route, body: unknown): Promise<void> {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

/** Install every mock the public pages need. Call before `page.goto`. */
export async function installMocks(page: Page): Promise<void> {
  mockTransport.wsMessages = 0;
  mockTransport.httpPosts = 0;
  await page.route("**/api/public", (route) =>
    fulfillJson(route, { status: "success", message: "", data: publicInfo }),
  );
  await page.route("**/api/me", (route) => fulfillJson(route, loggedOutAccount));

  // HTTP fallback transport for JSON-RPC (used when the socket is down).
  await page.route("**/api/rpc2", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    let body: unknown;
    try {
      body = route.request().postDataJSON();
    } catch {
      body = undefined;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: rpcResponseBody(body),
    });
    mockTransport.httpPosts += 1;
  });

  // Preferred transport: answer JSON-RPC requests over the intercepted socket.
  await page.routeWebSocket("**/api/rpc2", (ws: WebSocketRoute) => {
    ws.onMessage((message) => {
      mockTransport.wsMessages += 1;
      let request: unknown;
      try {
        request = JSON.parse(String(message));
      } catch {
        return;
      }
      const response = respondToRpcRequest(request);
      if (response !== undefined) {
        ws.send(JSON.stringify(response));
      }
    });
  });
}

/**
 * Collect uncaught exceptions and console errors for the lifetime of `page`.
 * Every spec asserts this list is empty, so a regression surfaces as a test
 * failure instead of being hidden behind a green build.
 */
export function collectUnexpectedErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.name}: ${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    errors.push(`console.error: ${message.text()}`);
  });
  return errors;
}
