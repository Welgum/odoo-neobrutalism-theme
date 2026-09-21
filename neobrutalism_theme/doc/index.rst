Neo Brutal Backend Theme
========================

Neo Brutal gives the Odoo 16 backend bold outlines, solid shadows, seven
shared accent presets, and personal day/night mode. It uses native Odoo
components and requires no external services or additional Python packages.

Compatibility
-------------

* Tested with Odoo 16 Community, installed on a self-hosted server.
* Dependencies: ``web`` and ``base_setup`` (standard Odoo modules).
* A filesystem Python add-on: it cannot be installed on Odoo Online.
* Source deployment through Odoo.sh is possible, but Enterprise-specific
  screens and an Odoo.sh deployment have not been verified.
* Styles the backend navigation, buttons, lists, forms, kanban cards and
  dialogs. It does not theme public websites, portals, POS, login pages,
  email templates, or PDF reports.
* Discuss, Calendar, CRM, Project and standard graph/pivot views are checked
  on Odoo 16 Community. Specialized editors, Studio, spreadsheets, custom charts and
  third-party themes require testing on your own staging database.

Installation
------------

1. Extract the release into a directory on the server's existing
   ``addons_path``. The resulting path must end with
   ``neobrutalism_theme/__manifest__.py``.
2. Restart Odoo and activate developer mode as a Settings administrator.
3. Open Apps, run Update Apps List, then remove the default Apps filter.
4. Search for ``Neo Brutal`` and install the module.
5. Reload the backend. No pip, npm, activation key, or external account is needed.

For Docker, mount the parent add-ons directory into the Odoo container and
include that location in the existing ``addons_path``. Preserve the server's
other add-ons paths, configuration, and data volumes. Installation uses
Odoo's normal add-on loader; this is not a ZIP imported through the UI.

Shared accent colors
--------------------

Only Settings administrators can change the accent in
**Settings > Neo Brutal > Accent color**. Select a preset and save.
Users receive the updated accent when they next reload Odoo or sign in.
The selection applies to all companies and users in that database.

The seven presets are Yellow (default), Blue, Green, Purple, Pink, Orange,
and Red. A swatch beside each option demonstrates its actual accent color.
Each supplies an accent, contrasting labels, and matching day/night
highlights. Neutral surfaces, body text, and success/warning/error colors
keep their own values. There is no arbitrary color picker or personal palette.

Personal day/night mode
-----------------------

Click the moon in the top bar to enter night mode, or the sun to return to
day mode. The first switch loads styles from your Odoo server and may show a
brief spinner. Open forms and message drafts survive the switch. Each user
chooses independently; there is no administrator switch forcing night mode
for everyone. Clicking the toggle also enables the theme if it was disabled.

Until a user chooses a mode, the theme follows Odoo's loaded color scheme.
Preferences use browser localStorage, scoped to the browser origin, database,
and user. They persist on that browser and synchronize between its tabs, but
do not synchronize between devices. When storage is unavailable, changes
apply only for the current page.

Appearance and spacing
----------------------

Open the user avatar menu and choose **Appearance** to:

* Enable or disable the theme for yourself.
* Choose Comfortable or Compact table spacing.
* Reset your preferences to defaults.

Resetting personal preferences does not change the shared accent.

Upgrade and removal
-------------------

Replace the module files with the new release, restart Odoo, and use Upgrade
on the module's Apps entry. Reload the browser after the assets rebuild.
Always validate an upgrade against a staging copy of your database first.

Any legacy custom colors or global night-mode parameters are ignored. The accent defaults to Yellow until
an administrator selects a preset. Existing browser palette values are also
ignored; other valid personal preferences remain available.

To remove the theme for everyone, uninstall it in Apps and reload all open
clients. Remove the module directory only after uninstalling. The module
does not own business records. Browser preferences remain locally and can
be reset after reinstalling.

Troubleshooting
---------------

**Module missing in Apps:** verify the directory name, ``addons_path`` and
read permissions; update the Apps list and remove the Apps filter.

**No visible change:** check Appearance > Use Neobrutalism theme, upgrade the
module after replacing files, and refresh the browser. Check Odoo logs for
asset errors. The login screen and public pages are outside the theme's scope.

**Night mode cannot load:** the previous appearance stays active. Retry the
toggle, and check Odoo logs for asset errors if it continues to fail. Upgrade
the module and refresh the browser after replacing its files.

**Inconsistent custom screens:** test without other backend themes. Custom
widgets may need additional scoped styles. The theme does not replace their
business logic or permissions.

**Shared accent not updated:** save the administrator setting and reload
each browser tab. Shared changes are not pushed into already-open pages.

Privacy and licensing
---------------------

The module makes no external network requests, adds no analytics, and
requires no activation server. Shared settings stay in Odoo's database;
personal preferences stay in the browser. Normal Odoo network activity
continues unchanged.

Odoo-specific code is LGPL-3.0-or-later. The distribution includes ``LICENSE``
and ``THIRD_PARTY_NOTICES.md`` with design attribution and the upstream MIT
notice. Marketplace screenshots use fictional records in a disposable Odoo
Community database; those records are not installed by this module.
