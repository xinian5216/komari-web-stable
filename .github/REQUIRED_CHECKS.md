# Stable branch checks

Rulesets must target `stable`, the default and release branch.

Required contexts: `required-gate`, `security-gate`, `secret-gate`,
`browser smoke (production build)`.
Each aggregation job runs with `always()` and accepts only `success` from every
dependency. Failure, cancellation, or skipped dependencies must block merging.
Security scanning runs on every PR to stable, including documentation changes.
Use GitHub Actions as the required check source.

The first three contexts cover the existing CI, dependency/CodeQL analysis and
secret scans. `browser smoke (production build)` comes from
`.github/workflows/browser-smoke.yml`, which runs the Playwright smoke suite
against a production build served by `vite preview`; frontend dependency
upgrades are therefore gated by real Chromium interaction coverage, not only by
the build and the dependency audit.
Release provenance validation and additional installation rehearsals are tracked
separately in xinian5216/komari-stable#3; this file does not claim they are complete.

Configure an active branch ruleset with no bypass actors: require PRs (zero
approving reviews for the solo maintainer), resolve conversations, require the
checks above with an up-to-date branch, linear history, and block deletion and
force pushes. Configure immutable release tags separately.

Changing these check names requires updating the ruleset before removing a name.
The `browser smoke (production build)` context was added together with the
ruleset update; keep both in sync when renaming or retiring it.
Keep release tags and existing assets immutable.
