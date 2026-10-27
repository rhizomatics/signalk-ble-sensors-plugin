# signalk-ble-sensors-plugin Development

## Release

Releases are published to npm by [.github/workflows/release.yml](.github/workflows/release.yml) using npm
trusted publishing (OIDC, with provenance) - there is no npm token to manage.

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry, then commit and push to `main`.
2. Create a GitHub release whose tag is `v<version>` (e.g. `v0.1.5`):

   ```bash
   gh release create v0.1.5 --target main --title v0.1.5 --notes-file <(sed -n '/^# \[0.1.5\]/,/^# \[/p' CHANGELOG.md | sed '1d;$d')
   ```

   The workflow fails if the tag doesn't match `package.json`. Marking the release as a pre-release
   publishes under the `next` dist-tag instead of `latest`.

### One-off setup

- npmjs.com → package **Settings** → **Trusted Publisher** → GitHub Actions: org `rhizomatics`, repo
  `signalk-ble-sensors-plugin`, workflow `release.yml`, environment `npm`.
- Then, under **Publishing access**, choose "Require two-factor authentication and disallow tokens" so
  only the workflow can publish.
- GitHub repo → **Settings** → **Environments** → create `npm`; optionally add yourself as a required
  reviewer and restrict deployment to `v*` tags.
