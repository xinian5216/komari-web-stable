export interface GithubReleaseInfo {
  tag_name: string;
  name?: string;
  body?: string;
  html_url: string;
  published_at?: string;
  draft?: boolean;
  prerelease?: boolean;
}

type ServerVersion = [number, number, number, number];

/**
 * Parse an installed Komari Stable version.
 *
 * The fork's `stable.N` suffix is a maintenance revision, not a SemVer
 * prerelease identifier, so it must participate in version ordering.
 */
export function parseInstalledServerVersion(
  input?: string | null,
): ServerVersion | null {
  if (!input) return null;

  const match = String(input)
    .trim()
    .match(/^v?(\d+)\.(\d+)\.(\d+)(?:-stable\.(\d+))?$/i);
  if (!match) return null;

  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4] ?? 0),
  ];
}

/** Parse only release tags that follow the fork's stable release scheme. */
export function parseStableReleaseTag(
  input?: string | null,
): ServerVersion | null {
  if (!input || !/^v?\d+\.\d+\.\d+-stable\.\d+$/i.test(input.trim())) {
    return null;
  }
  return parseInstalledServerVersion(input);
}

function compareVersions(left: ServerVersion, right: ServerVersion): number {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] > right[index]) return 1;
    if (left[index] < right[index]) return -1;
  }
  return 0;
}

export function isNewerStableRelease(
  releaseTag?: string | null,
  currentVersion?: string | null,
): boolean {
  const release = parseStableReleaseTag(releaseTag);
  const current = parseInstalledServerVersion(currentVersion);
  return Boolean(release && current && compareVersions(release, current) > 0);
}

export function selectNewerStableReleases(
  releases: GithubReleaseInfo[],
  currentVersion: string,
): GithubReleaseInfo[] {
  return releases
    .filter((release) => !release.draft && !release.prerelease)
    .filter((release) =>
      isNewerStableRelease(release.tag_name, currentVersion),
    )
    .sort((left, right) => {
      const a = parseStableReleaseTag(left.tag_name);
      const b = parseStableReleaseTag(right.tag_name);
      return a && b ? compareVersions(b, a) : 0;
    });
}
