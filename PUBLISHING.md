# Odoo Apps publishing handoff

The module and listing materials are prepared locally. Nothing has been uploaded, registered, or approved by Odoo Apps.

## Publisher decisions still needed

- Confirm the publisher name. The existing manifest author is **alx-projects**; it has been retained.
- Provide a support email and, if desired, the publisher's website. Neither is invented or present in the manifest yet.
- Choose free or paid. The current manifest has **no price**, which Odoo Apps treats as free. The existing LGPL-3 license is retained. A paid release needs an explicit `price` and `currency` (EUR or USD) and a reviewed support policy before submission.
- Register the publisher account and repository with Odoo Apps. Source is tracked at https://github.com/Welgum/odoo-neobrutalism-theme on `main`; an Apps-compatible branch/layout and scanner registration still need to be arranged.

The support address can be added as the manifest's `support` field. Do not add a store link or external advertising to the marketplace description. Rebuild the release after changing metadata so the archive and checksum agree.

## Included materials

| Material | Path |
| --- | --- |
| Manifest | `__manifest__.py` |
| English marketplace description | `static/description/index.html` |
| Icon | `static/description/icon.png` |
| Cover (1120 × 560) | `static/description/cover.png` |
| Large theme screenshot | `static/description/backend_screenshot.png` |
| Supporting screenshots | Other PNGs in `static/description/` |
| User documentation | `doc/index.rst` |
| License and attribution | `LICENSE`, `THIRD_PARTY_NOTICES.md` |
| Validation record | `VALIDATION.md` |
| Reproducible release builder | `tools/build_release.py` |

The screenshots were captured from actual Odoo 19 Community views with fictional records in a disposable database. Contacts was installed for the screenshots only; the theme's dependencies remain `web` and `base_setup`.

## Build and inspect

```bash
node tests/test_preferences.mjs
python3 tools/build_release.py
```

The builder creates the versioned ZIP, SHA-256 checksum and local listing preview in `dist/`. It validates local assets, manifest paths, XML and Python syntax, marketplace HTML, and single-module archive structure. It uses only Python's standard library. The preview includes lightweight layout styles for local review; Odoo Apps supplies its own styles when rendering the actual description.

The ZIP's top level is `neobrutalism_theme/`. The archive excludes `.DS_Store`, bytecode, secrets, release output, build tools, and publisher-only notes. User docs, runtime assets, tests, README and licensing are included. Keep the complete source repository for future releases.

## Repository submission

1. Put the module in a publisher-controlled Git repository on a **19.0** branch. A typical layout is `repository/neobrutalism_theme/__manifest__.py`.
2. If private, grant the Odoo Apps scanner access following the current official FAQ. Confirm the scanner identity there before granting access.
3. Sign in to Odoo Apps with the publisher account and register the repository with its 19.0 branch. The repository scanner discovers the module and listing assets; a ZIP alone does not create a marketplace listing.
4. Scan the repository, inspect the resulting draft/listing, and resolve any scanner feedback. Confirm name, author, support, price, license, screenshots and technical version before publication.
5. For later releases, increment the manifest version, rebuild and test the package, commit the release, and rescan the registered repository.

Only Odoo's scanner and review process can confirm marketplace acceptance. Local validation is not marketplace certification. This release claims testing on self-hosted Odoo 19 Community; it does not claim verified Enterprise or Odoo.sh compatibility.

Official references checked on 2026-09-21: [Vendor guidelines](https://apps.odoo.com/apps/vendor-guidelines) and [Odoo Apps FAQ](https://apps.odoo.com/apps/faq).
