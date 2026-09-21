# Validation — 19.0.1.6.1

## Marketplace presentation update — 2026-09-21

The marketplace-only patch adds a version-specific animated cover, a day/night comparison and seven real preset captures. Loops run for 3.00, 2.67 and 4.67 seconds at a nominal 30 fps, with subtle title motion baked into GIF frames. The listing has no JavaScript. PNG posters remain available.

Validation for this patch covers GIF decoding, dimensions and timing, all local listing images, Odoo HTML sanitization, desktop/mobile preview layout, and reproducible ZIP packaging. Theme runtime source and dependencies are unchanged; the runtime checks below describe the preceding functional release.

Validated on **2026-09-21** with official Docker image **Odoo 19.0-20260908 Community**, PostgreSQL 17, and headless Google Chrome. Tests used disposable databases only.

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
- Captured fresh, actual Odoo 19 listing screenshots with fictional contacts and reviewed the day/night views, settings, forms, kanban, Appearance and versioned cover.

## Repeat the checks

From the repository root:

```bash
node neobrutalism_theme/tests/test_preferences.mjs
python3 tools/build_release.py
```

With the add-on on the Odoo 19 add-ons path and a disposable database:

```bash
odoo -d TEST_DATABASE -i neobrutalism_theme --without-demo --test-enable --test-tags=/neobrutalism_theme --stop-after-init
```

Use `-u` instead of `-i` for an installed module. The Playwright suites require Playwright 1.62+ and Chromium or Chrome in the development environment, not in the installed add-on:

```bash
node neobrutalism_theme/tests/test_stylesheets.cjs
NEO_TEST_URL=http://127.0.0.1:18069 NEO_TEST_DB=DISPOSABLE_DATABASE NEO_ALLOW_TEST_WRITES=1 node neobrutalism_theme/tests/test_browser.cjs
NEO_TEST_URL=http://127.0.0.1:18069 NEO_TEST_DB=DISPOSABLE_DATABASE NEO_ALLOW_TEST_WRITES=1 node neobrutalism_theme/tests/test_night_mode.cjs
```

The browser suites use `admin` / `admin` and write settings, users, contacts, tasks, opportunities and actions. `test_browser.cjs` needs Contacts; `test_night_mode.cjs` additionally needs CRM, Calendar and Project. Run them sequentially against the same database. Set `NEO_CHROME_PATH` for a system Chrome executable.

## Publication and limits

The manifest lists **RivetFox**, **https://rivetfox.pro**, LGPL-3 and no price (free). An unconfirmed support email is not included. The English listing uses local assets and static markup. Official [vendor guidelines](https://apps.odoo.com/apps/vendor-guidelines), [FAQ](https://apps.odoo.com/apps/faq) and [submission instructions](https://apps.odoo.com/apps/upload) were checked on 2026-09-21. No publisher account registration, marketplace upload, scanner acceptance or publication has been performed.

These checks cover Odoo Community, not Enterprise-only screens, Odoo.sh deployment, RTL layouts, Studio, spreadsheets, specialized editors or third-party themes/custom charts. Public websites, portals, POS, login screens and PDF reports are outside the backend theme's scope. Verify the apps installed in your own staging database. Shared accent changes apply when users reload; they are not pushed into open pages.

Source references: [Odoo 19 web manifest](https://github.com/odoo/odoo/blob/19.0/addons/web/__manifest__.py), [settings view](https://github.com/odoo/odoo/blob/19.0/addons/base_setup/views/res_config_settings_views.xml), and [web client templates](https://github.com/odoo/odoo/blob/19.0/addons/web/views/webclient_templates.xml).
