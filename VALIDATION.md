# Validation — 19.0.1.4.1

## Current release: color swatches

Validated on 2026-09-21 with a fresh disposable Odoo 19.0-20260908 Community database and Chrome.

- Installed 19.0.1.4.1; all five existing Odoo integration tests passed, including administrator-only color changes.
- The existing Node preference/contrast regression suite passed.
- Verified the rendered swatch colors against the actual JavaScript preset values for all seven options in day mode, night mode, at 390px width, and with the personal theme disabled.
- Checked clicking a swatch, accessible radio names, arrow-key selection, and persistence after Save/reload. No uncaught browser errors occurred.
- Visually reviewed desktop, mobile, night and theme-disabled settings; updated the marketplace settings screenshot.

## Previous release validation

The remaining sections record the broader marketplace and lifecycle checks performed for **19.0.1.4.0**. This patch changes only settings presentation, documentation and the version number.


## Marketplace preparation

- Checked Odoo Apps' official vendor guidelines and FAQ on 2026-09-21; updated the manifest name/version and image declarations.
- Captured actual Odoo 19 Community Contacts list, kanban, form, settings and Appearance views with fictional data. The release does not install the screenshot records or Contacts.
- Validated the English listing as static HTML with local resources only. Odoo's HTML sanitizer retained all seven listing images.
- Rendered `doc/index.rst` using Odoo's bundled docutils with warnings treated as errors; no warnings remained.
- Checked the local listing preview at 1440px and 390px: every embedded image loaded and there was no horizontal page overflow. The actual Odoo Apps renderer may apply different surrounding styles.
- The reproducible ZIP builder validates manifest paths, PNG assets, Python/XML syntax, HTML structure and ZIP integrity. It excludes local caches, publisher-only notes and build output.
- Installed the extracted release ZIP into a fresh database using only the manifest's dependencies: all five integration tests passed. Upgraded the existing 19.0.1.3.0 database with the extracted ZIP to 19.0.1.4.0: all five tests passed again, and the stored module version was verified.
- Ran the complete browser suite against the extracted package after upgrade; every check passed with no uncaught browser errors.
- Uninstalled the extracted package through Odoo's module manager. The module state became `uninstalled`, its external IDs were removed, and an unrelated test contact remained present.
- Verified identical ZIP checksums on two builds with unchanged inputs. Final packaged runtime files match the extracted files used for the install, upgrade and browser checks.
- Publisher contact, repository and free/paid decisions are not supplied. The existing author and LGPL-3 license remain; the manifest has no price, so it currently describes a free release.
- No upload or Odoo Apps scanner review has been performed.

## Passed locally

Validated on 2026-09-21 using a temporary Odoo **19.0-20260908 Community** database, PostgreSQL 17 and headless Google Chrome. No production database was used.

- Installed the module through Odoo's actual module loader, including the settings model, inherited view, menu and assets.
- All **5 Odoo integration tests** passed: all seven presets persist correctly, arbitrary colors are rejected, invalid/retired parameters fall back safely, retired global night mode stays ignored, and ordinary users cannot change settings or their underlying parameters.
- The Node regression suite passed: all seven preset definitions, text/highlight contrast in both modes, neutral-color isolation, invalid preset rejection, personal mode persistence, tab/user isolation, blocked storage and cleanup of retired custom colors.
- Selected and saved **all seven presets through the real Odoo settings form**. The settings form has seven choices and no free-form color inputs.
- Tested **14 preset/mode combinations** in Chrome using Odoo's actual CSS and theme assets. Checked primary buttons, active tabs, secondary-button hover, striped/hovered/active table rows and navigation focus indicators.
- Accent and highlight text meet **4.5:1 contrast** in every preset/mode combination; navigation focus indicators meet **3:1**. Removed background-color fading that could briefly produce unreadable text during day/night switches.
- Compared rendered success/warning/error buttons, alerts and a danger badge between presets: their colors remain unchanged. These checks use isolated test fixtures styled by the live Odoo assets, not every installed business view.
- Confirmed normal users receive the shared preset, cannot change it, and can still switch night mode independently with their saved choice surviving reloads.
- Visually inspected the settings page in night mode and at a **390px viewport**, with no full-page horizontal overflow. Desktop/mobile navigation labels use the preset's contrasting text color.
- No uncaught JavaScript/Owl errors in the browser checks.
- Extended the browser suite to actual standard Contacts views: night-mode form labels, breadcrumb/contact links, list action/activity icons, notebook tabs, chatter controls and timestamps have readable contrast. Verified that switching mode preserves an unsaved name edit. These checks exposed and fixed neutral-color issues from Odoo's light asset bundle.
- Python/XML syntax validated; every manifest asset and data path exists.

## Repeatable regression checks

From the module directory, with Node 18+:

```bash
node tests/test_preferences.mjs
```

With this module on an Odoo 19 add-ons path, using a disposable test database:

```bash
odoo -d TEST_DATABASE -i neobrutalism_theme --without-demo --test-enable --test-tags=/neobrutalism_theme --stop-after-init
```

Use `-u neobrutalism_theme` instead of `-i` when the module is already installed.

The browser suite `tests/test_browser.cjs` requires Playwright 1.62+ with Chromium or Chrome and a disposable Odoo 19 database with the theme and Contacts installed. It uses the disposable database's default `admin` / `admin` login and writes shared settings, users, partners and a test action. These test dependencies are not runtime dependencies of the add-on. Run it from a development environment where `require('playwright')` is available:

```bash
NEO_TEST_URL=http://127.0.0.1:18069 NEO_TEST_DB=DISPOSABLE_DATABASE NEO_ALLOW_TEST_WRITES=1 node tests/test_browser.cjs
```

Set `NEO_CHROME_PATH` if using a system Chrome executable instead of Playwright's Chromium. Do not run this write-enabled suite against a production database.

## Remaining deployment checks

The module has not been tested on your VPS/database or with your installed third-party modules. Enterprise-only screens, RTL layouts, specialized editors, Discuss, Studio, spreadsheets, POS and custom chart renderers have not been verified. Public websites and portals are outside the backend theme's scope.

After upgrading on your test database, check the settings page, a list, an editable form and many2one dropdown, a kanban board, a modal, mobile navigation and a report. Shared settings take effect when users reload Odoo; existing open pages do not receive a live push update.

Compatibility references: Odoo's public `19.0` branch, particularly [settings views](https://github.com/odoo/odoo/blob/19.0/addons/base_setup/views/res_config_settings_views.xml), [session information](https://github.com/odoo/odoo/blob/19.0/addons/web/models/ir_http.py), and [web-client asset selection](https://github.com/odoo/odoo/blob/19.0/addons/web/views/webclient_templates.xml).
