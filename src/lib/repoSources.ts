// ---------------------------------------------------------------------------
// Fork-owned sources (single source of truth)
//
// Komari Stable is a community-maintained fork. All *functional* references to
// the agent / server repositories used by install commands, update checks and
// Docker instructions are defined here so that owner/repo never needs to be
// edited in more than one place.
//
// Credits and upstream links (About page, NavBar, theme metadata) intentionally
// keep pointing at the original project and are NOT routed through this file.
// ---------------------------------------------------------------------------

/** GitHub account (or organisation) that publishes this fork. */
export const FORK_OWNER = "xinian5216";

/** Server repository (this panel's own fork). */
export const SERVER_REPO = "komari-stable";

/** Agent repository used for install commands / binaries / container image. */
export const AGENT_REPO = "komari-agent-stable";

/** Branch of the agent repository that carries the install scripts. */
export const AGENT_REPO_BRANCH = "stable";

/** Raw base for the agent install scripts (install.sh / install.ps1). */
export const AGENT_INSTALL_RAW_BASE =
  `https://raw.githubusercontent.com/${FORK_OWNER}/${AGENT_REPO}/refs/heads/${AGENT_REPO_BRANCH}`;

/** Container image for the Docker install variant. */
export const AGENT_DOCKER_IMAGE = `ghcr.io/${FORK_OWNER}/${AGENT_REPO}:latest`;

/** Release feed used by the "new version available" check in the admin panel. */
export const SERVER_RELEASES_API =
  `https://api.github.com/repos/${FORK_OWNER}/${SERVER_REPO}/releases?per_page=100`;
