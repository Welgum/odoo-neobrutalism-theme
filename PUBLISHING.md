# Odoo Apps publication — RivetFox

Publisher: **RivetFox** · Website: **https://rivetfox.pro** · Technical module: **`neobrutalism_theme`** · License: **LGPL-3**.

The repository contains the complete add-on in `neobrutalism_theme/`. It can be discovered from the repository root without renaming folders or running a build step. The two version branches use the same module name and the corresponding Odoo version in the manifest.

## Register the version branches

Use these repository URLs in the publisher account's [Submit your Apps and Themes](https://apps.odoo.com/apps/upload) form:

| Odoo version | Git branch | Repository registration URL |
| --- | --- | --- |
| 18 | `18.0` | `ssh://git@github.com/Welgum/odoo-neobrutalism-theme#18.0` |
| 19 | `19.0` | `ssh://git@github.com/Welgum/odoo-neobrutalism-theme#19.0` |

The SSH URL plus `#branch` format follows the [Odoo Apps FAQ](https://apps.odoo.com/apps/faq). The repository is public. If it becomes private, authorize Odoo's scanner as described in the current FAQ before rescanning. `main` follows Odoo 19; use the two version branches for publication.

1. Sign in with the RivetFox publisher account and register both version URLs.
2. Run the Apps scanner for each branch.
3. Inspect each resulting listing: author, name, matching version, license, features, screenshots, and free/paid status.
4. Resolve any scanner feedback and publish through the account workflow.

No publisher account login, repository registration or Odoo scanner approval has been performed by this preparation. Only Odoo's scanner/review can confirm acceptance.

## Listing configuration

The current release is **free**: no `price` is set. Odoo's guidelines make the `support` email optional and do not require support services for free apps. No unconfirmed address is included. If a support email is supplied, put it in the manifest's `support` field before rescanning.

A paid release needs an explicit supported currency and price meeting Odoo's current minimum, plus an agreed support policy. Do not add a paid price unless the publisher has chosen one.

Each branch includes:

- A manifest with a short explicit name, RivetFox author/website, version, LGPL-3 license, dependencies, theme category and image declarations.
- An English `static/description/index.html` using local images and permitted static markup; no JavaScript or external advertising links.
- A 256 × 256 PNG icon, 1120 × 560 cover, an image ending in `_screenshot.png`, and actual screenshots from that Odoo version.
- User documentation, license/attribution, tests and a validation record inside the add-on.

The description claims Odoo Community backend support. It does not claim verified Enterprise, Odoo.sh, POS, website/portal or custom third-party theme compatibility.

## Build and validate a release

From either version branch:

```bash
node neobrutalism_theme/tests/test_preferences.mjs
python3 tools/build_release.py
```

The builder checks the manifest, declared assets, Python/XML syntax, English listing markup, local images and ZIP integrity. The archive contains one `neobrutalism_theme/` folder and excludes build tools, output, publisher-only notes and caches. Results and runtime test commands are in `neobrutalism_theme/VALIDATION.md`.

For updates, increase the version on the applicable branch, rerun validation, commit and push the branch, then rescan it in Odoo Apps. A local ZIP does not register or publish a marketplace listing.

Official references checked for this preparation: [Vendor guidelines](https://apps.odoo.com/apps/vendor-guidelines), [Odoo Apps FAQ](https://apps.odoo.com/apps/faq), and [repository submission](https://apps.odoo.com/apps/upload).
