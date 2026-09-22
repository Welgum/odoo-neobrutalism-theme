# Validation — 18.0.1.0.3

## RivetFox marketplace artwork — 2026-09-22

This release updates promotional assets, rendering tools and package metadata. The runtime implementation and Odoo-version adapters are unchanged; the application tests documented below describe the preceding functional release and were not rerun for this artwork update.

- All four GIFs decode completely with FFmpeg. Checked 1120 × 560 covers, 1000 × 1210 portrait cards and 1120 × 760 feature animations; encoded durations remain 3.00, 3.00, 2.67 and 4.67 seconds.
- Playwright checks cover every scene, the composition at loop reset (allowing only tiny antialiased-edge rounding differences), correct Odoo 18 labels, and locally decoded RivetFox artwork and fonts. Renderer pages make no external requests and report no JavaScript errors.
- Listing and thumbnail previews load all images without horizontal overflow at 1440px and 390px. The shared theme-family preview was also reviewed at catalog-card size.
- The release builder validates manifest/image selection, static listing markup, asset paths, Python/XML syntax and ZIP integrity. Two builds of the final source produce identical SHA-256 checksums.
- The shared fox and local render-font license are retained under `tools/branding/`. Only raster promotional assets enter the add-on; no additional runtime font, script or dependency is introduced.

The original Odoo screenshot inputs are unchanged.

Reproduce with `node tools/render_marketplace.cjs`, `python3 tools/build_release.py`, then `node tools/check_marketplace.cjs`. Logs and review PNGs are under ignored `dist/`. These checks validate the repository artwork. The registered Odoo Apps branch must be rescanned after the Git push; marketplace scan and publication status are separate from local validation.

## Theme-card thumbnail fix — 2026-09-21

The public catalog was selecting the PNG `backend_screenshot.png` while the app detail page already used the animated cover. The manifest now declares one `_screenshot` image, `theme_screenshot.gif`, with a 1000 × 1210 portrait composition and a 3-second animated loop. The raw Contacts image is renamed to `backend-list.png`.

This patch validates the selected image, GIF frames/timing, renamed image references and release packaging. The Odoo 19 image is also previewed in the actual public catalog DOM using a local response override; this is a local rendering check, not a marketplace rescan. Runtime code is unchanged.

## Marketplace presentation update — 2026-09-21

The marketplace-only patch adds a version-specific animated cover, a day/night comparison and seven real preset captures. Loops run for 3.00, 2.67 and 4.67 seconds at a nominal 30 fps, with subtle title motion baked into GIF frames. The listing has no JavaScript. PNG posters remain available.

Validation for this patch covers GIF decoding, dimensions and timing, all local listing images, Odoo HTML sanitization, desktop/mobile preview layout, and reproducible ZIP packaging. Theme runtime source and dependencies are unchanged; the runtime checks below describe the preceding functional release.

Validated on **2026-09-21** with official Docker image **Odoo 18.0-20260908 Community**, PostgreSQL 17, and headless Google Chrome. Tests used disposable databases only.

## Server and packaging

- Odoo discovers the add-on directly inside the repository's `neobrutalism_theme/` directory. The technical module name stays the same on `18.0` and `19.0`.
- Installed the extracted release ZIP in a fresh database with only the manifest's dependencies (`web` and `base_setup`). All **five Python integration tests passed**: seven presets persist, arbitrary colors are rejected, legacy values fall back, shared night mode stays absent, and regular users cannot change shared settings.
- Verified main and lazy dark CSS compile/load with only those dependencies, night mode survives reload, and day mode restores the original styles without browser errors.
- Upgraded the extracted package with all five integration tests passing again. Verified the saved Blue preset and an unrelated contact survive upgrade. Uninstalled through Odoo's module manager; the module became `uninstalled` and its external IDs were removed while the unrelated contact remained.
- Release builder passed manifest metadata, declared assets, PNGs, listing markup, Python/XML syntax, and ZIP integrity checks. Repeated builds with unchanged inputs produced identical checksums.
- Rendered `doc/index.rst` without warnings and checked the description with Odoo's HTML sanitizer. All listing images survived sanitization. Local listing previews at 1440px and 390px loaded every image without horizontal overflow.

## Browser checks

A separate database included Contacts, Discuss, CRM, Calendar and Project to exercise their real views. These optional apps and fictional records are not installed by the theme.

- Saved all **seven accent presets through the actual Settings form** and checked all **14 day/night combinations**. Primary buttons, active tabs and tested table highlights meet 4.5:1 text contrast; navbar focus indicators meet 3:1. Success/warning/error styles stay independent of the accent.
- Confirmed administrator-only shared colors, ordinary-user access to personal night mode, mode persistence, 390px settings layout, readable Contacts list/form/chatter and unsaved form edits surviving a toggle.
- Checked Discuss channel names, message text, authors, timestamps, date separators, composer placeholders and the emoji picker against composed backgrounds and opacity. Tested elements meet 4.5:1; unsent drafts survive mode switches.
- Checked success/info/warning/danger notices, Calendar headers, CRM titles, Project task cards, shared Settings and Appearance dialogs. Tested dark surfaces and text contrast.
- Verified standard graph axes/legends update while switching modes; bar, line and pie views render, and pivot headings remain readable.
- Interrupted the first dark-CSS load: the previous appearance remained readable, a notification appeared, and retry succeeded. Disabling/re-enabling restored the expected styles. Odoo's global `color_scheme` cookie was unchanged. No uncaught JavaScript/Owl errors occurred in the successful suites.
- Node regression checks passed for seven presets, contrast, async changes, failed/out-of-order loads, user/database isolation, storage failures and retired palette cleanup.
- Standalone Playwright lifecycle checks passed for inert CSS staging, atomic activation, later lazy styles, exact media restoration, print media, native-dark baselines, no duplicate JavaScript, timeout/failure and retry.
- Captured fresh, actual Odoo 18 listing screenshots with fictional contacts and reviewed the day/night views, settings, forms, kanban, Appearance and versioned cover.

## Odoo 18 compatibility changes

- Use Odoo 18 metadata, user-facing labels, screenshots and version `18.0.1.0.0`.
- Adapt the retired-global-mode regression to Odoo 18, which has no `ir.http.color_scheme()` API. Browser tests still verify that personal mode changes leave the global cookie unchanged.
- Use Odoo 18's `Emojis` accessible button label in the Discuss regression.
- Mix contextual dark text toward the brightest ink token. Odoo 18's main-text token is dimmer than Odoo 19's and produced only 4.37:1 contrast in an error notice; the corrected semantic notices pass the 4.5:1 check.

## Repeat the checks

From the repository root:

```bash
node neobrutalism_theme/tests/test_preferences.mjs
python3 tools/build_release.py
```

With the add-on on the Odoo 18 add-ons path and a disposable database:

```bash
odoo -d TEST_DATABASE -i neobrutalism_theme --without-demo=all --test-enable --test-tags=/neobrutalism_theme --stop-after-init
```

Use `-u` instead of `-i` for an installed module. The Playwright suites require Playwright 1.62+ and Chromium or Chrome in the development environment, not in the installed add-on:

```bash
node neobrutalism_theme/tests/test_stylesheets.cjs
NEO_TEST_URL=http://127.0.0.1:18068 NEO_TEST_DB=DISPOSABLE_DATABASE NEO_ALLOW_TEST_WRITES=1 node neobrutalism_theme/tests/test_browser.cjs
NEO_TEST_URL=http://127.0.0.1:18068 NEO_TEST_DB=DISPOSABLE_DATABASE NEO_ALLOW_TEST_WRITES=1 node neobrutalism_theme/tests/test_night_mode.cjs
```

The browser suites use `admin` / `admin` and write settings, users, contacts, tasks, opportunities and actions. `test_browser.cjs` needs Contacts; `test_night_mode.cjs` additionally needs CRM, Calendar and Project. Run them sequentially against the same database. Set `NEO_CHROME_PATH` for a system Chrome executable.

## Publication and limits

The manifest lists **RivetFox**, **https://rivetfox.pro**, LGPL-3 and no price (free). An unconfirmed support email is not included. The English listing uses local assets and static markup. Official [vendor guidelines](https://apps.odoo.com/apps/vendor-guidelines), [FAQ](https://apps.odoo.com/apps/faq) and [submission instructions](https://apps.odoo.com/apps/upload) were checked on 2026-09-21. No publisher account registration, marketplace upload, scanner acceptance or publication has been performed.

These checks cover Odoo Community, not Enterprise-only screens, Odoo.sh deployment, RTL layouts, Studio, spreadsheets, specialized editors or third-party themes/custom charts. Public websites, portals, POS, login screens and PDF reports are outside the backend theme's scope. Verify the apps installed in your own staging database. Shared accent changes apply when users reload; they are not pushed into open pages.

Source references: [Odoo 18 web manifest](https://github.com/odoo/odoo/blob/18.0/addons/web/__manifest__.py), [settings view](https://github.com/odoo/odoo/blob/18.0/addons/base_setup/views/res_config_settings_views.xml), and [web client templates](https://github.com/odoo/odoo/blob/18.0/addons/web/views/webclient_templates.xml).
