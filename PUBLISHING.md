# Odoo Apps publication — RivetFox

Publisher: **RivetFox** · Website: **https://rivetfox.pro** · Technical module: **`neobrutalism_theme`** · License: **LGPL-3**.

The repository contains the complete add-on in `neobrutalism_theme/`. It can be discovered from the repository root without renaming folders or running a build step. The four version branches use the same module name and the corresponding Odoo version in the manifest.

## Register the version branches

Use these repository URLs in the publisher account's [Submit your Apps and Themes](https://apps.odoo.com/apps/upload) form:

| Odoo version | Git branch | Repository registration URL |
| --- | --- | --- |
| 16 | `16.0` | `ssh://git@github.com/Welgum/odoo-neobrutalism-theme.git#16.0` |
| 17 | `17.0` | `ssh://git@github.com/Welgum/odoo-neobrutalism-theme.git#17.0` |
| 18 | `18.0` | `ssh://git@github.com/Welgum/odoo-neobrutalism-theme.git#18.0` |
| 19 | `19.0` | `ssh://git@github.com/Welgum/odoo-neobrutalism-theme.git#19.0` |

The SSH URL plus `#branch` format follows the [Odoo Apps FAQ](https://apps.odoo.com/apps/faq). The repository is public. If it becomes private, authorize Odoo's scanner as described in the current FAQ before rescanning. `main` follows Odoo 19; use the four version branches for publication.

1. Sign in with the RivetFox publisher account and register all four version URLs.
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
- A 256 × 256 PNG icon, 1120 × 560 animated cover, a 1000 × 1210 animated theme-card thumbnail, and actual screenshots from that Odoo version.
- User documentation, license/attribution, tests and a validation record inside the add-on.

The description claims Odoo Community backend support. It does not claim verified Enterprise, Odoo.sh, POS, website/portal or custom third-party theme compatibility.

### Theme card versus app cover

Odoo's theme catalog selects the first manifest image whose filename stem ends in `_screenshot`, as documented in the [Apps FAQ](https://apps.odoo.com/apps/faq). This is separate from the regular cover. Our only matching entry is `static/description/theme_screenshot.gif`; its portrait composition fits the catalog's tall, center-cropped card. The regular cover stays `cover.gif`. Raw Contacts screenshots use `backend-list.png` so they cannot take over the theme thumbnail.

After pushing a thumbnail change, rescan every registered version branch in Odoo Apps. Updating the description or refreshing the browser does not change which image the scanner selected. The builder produces `dist/thumbnail-preview.html` for reviewing the catalog card alongside `dist/listing-preview.html` for the description.

## Build and validate a release

From any version branch:

```bash
node neobrutalism_theme/tests/test_preferences.mjs
python3 tools/build_release.py
```

The builder checks the manifest, declared assets, Python/XML syntax, English listing markup, local images and ZIP integrity. The archive contains one `neobrutalism_theme/` folder and excludes build tools, output, publisher-only notes and caches. Results and runtime test commands are in `neobrutalism_theme/VALIDATION.md`.

To regenerate the listing images, install Contacts, CRM, Calendar and Project in a disposable database, then run the Playwright capture tool from a development environment:

```bash
NEO_TEST_URL=http://127.0.0.1:8069 NEO_TEST_DB=DISPOSABLE_DATABASE NEO_ALLOW_TEST_WRITES=1 node tools/capture_screenshots.cjs
```

This uses the disposable database's `admin` / `admin` credentials, disables onboarding tips for the capture user, creates fictional contacts, a channel conversation and an action, and captures all seven real accent presets before restoring Yellow. Set `NEO_CHROME_PATH` to use system Chrome. Playwright is a development dependency only.

Render the marketplace animations from those screenshots with Playwright and FFmpeg installed in the development environment:

```bash
node tools/render_marketplace.cjs
python3 tools/build_release.py
```

The renderer creates `cover.gif` and `theme_screenshot.gif` (3 seconds each), `day-night-demo.gif` (about 2.67 seconds), `accent-demo.gif` (about 4.67 seconds), and PNG posters. The thumbnail's poster is named `theme-preview.png` to keep the animated file as the only `_screenshot` candidate. Pass job names to render a subset, for example `node tools/render_marketplace.cjs theme_screenshot`.

Scenes play at three times the original speed, rendered at 30 fps with a subtle title lift and settle. GIF timing is rounded to centiseconds. The source layouts are `tools/cover.html` and `tools/marketplace/motion.html`; real preset captures are kept under `tools/marketplace/screens/`. All published images are local to the module. The listing itself contains no JavaScript. The release builder validates PNG/GIF headers and dimensions, checks the thumbnail selector, and embeds the correct image MIME type in its standalone previews.

For updates, increase the version on the applicable branch, rerun validation, commit and push the branch, then rescan it in Odoo Apps. A local ZIP does not register or publish a marketplace listing.

Official references checked for this preparation: [Vendor guidelines](https://apps.odoo.com/apps/vendor-guidelines), [Odoo Apps FAQ](https://apps.odoo.com/apps/faq), and [repository submission](https://apps.odoo.com/apps/upload).

## Shared RivetFox identity — 2026-09-22

`tools/branding/` contains the publisher’s website fox mark, a shared wordmark treatment and the locally bundled Space Grotesk font with its SIL OFL notice. These are renderer inputs only. All four promotional GIFs bake in the publisher identity; the listing stays static and local-only. Backend styles and theme-specific app icons are unchanged.

Use the checkout’s own source screenshots. `render_marketplace.cjs` passes the manifest’s Odoo version to every composition; do not relabel newer-version screenshots for an older branch. Run `node tools/check_marketplace.cjs` after rendering and building to decode every GIF frame, verify dimensions/timing, exercise scene/loop rendering, check brand/font loading without network requests and inspect both preview widths.

After pushing this artwork release, rescan each registered version branch in Odoo Apps to refresh the marketplace assets. A Git push alone does not confirm that the marketplace has imported the new images.
