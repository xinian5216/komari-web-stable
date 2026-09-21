import assert from "node:assert/strict";
import test from "node:test";

import { SERVER_RELEASES_API } from "../src/lib/repoSources.ts";
import {
  isNewerStableRelease,
  parseInstalledServerVersion,
  parseStableReleaseTag,
  selectNewerStableReleases,
  type GithubReleaseInfo,
} from "../src/lib/serverRelease.ts";

test("checks releases from the maintained server mirror", () => {
  assert.equal(
    SERVER_RELEASES_API,
    "https://api.github.com/repos/xinian5216/komari-stable/releases?per_page=100",
  );
});

test("orders the stable maintenance revision", () => {
  assert.deepEqual(parseInstalledServerVersion("1.5.0-stable.3"), [1, 5, 0, 3]);
  assert.deepEqual(parseInstalledServerVersion("v1.5.0-stable.5"), [1, 5, 0, 5]);
  assert.deepEqual(parseInstalledServerVersion("1.5.0"), [1, 5, 0, 0]);
  assert.equal(parseStableReleaseTag("v1.5.0"), null);
  assert.equal(parseStableReleaseTag("v1.5.0-beta.1"), null);
});

test("detects a newer stable revision with the same base version", () => {
  assert.equal(
    isNewerStableRelease("v1.5.0-stable.5", "1.5.0-stable.3"),
    true,
  );
  assert.equal(
    isNewerStableRelease("v1.5.0-stable.3", "1.5.0-stable.3"),
    false,
  );
  assert.equal(
    isNewerStableRelease("v1.6.0-stable.0", "v1.5.9-stable.99"),
    true,
  );
});

test("filters and orders only newer production stable releases", () => {
  const release = (
    tag_name: string,
    overrides: Partial<GithubReleaseInfo> = {},
  ): GithubReleaseInfo => ({
    tag_name,
    html_url: `https://example.invalid/${tag_name}`,
    ...overrides,
  });

  const result = selectNewerStableReleases(
    [
      release("v1.5.0-stable.4"),
      release("v1.5.0-stable.5"),
      release("v1.5.0-stable.6", { draft: true }),
      release("v1.6.0-stable.0", { prerelease: true }),
      release("v1.5.1"),
      release("v1.5.0-stable.2"),
    ],
    "1.5.0-stable.3",
  );

  assert.deepEqual(
    result.map((item) => item.tag_name),
    ["v1.5.0-stable.5", "v1.5.0-stable.4"],
  );
});
