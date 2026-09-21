/** @odoo-module **/
// SPDX-License-Identifier: LGPL-3.0-or-later

import { Component, useState } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

export class NeoAppearanceDialog extends Component {
    static template = "neobrutalism_theme.AppearanceDialog";
    static components = { Dialog };
    static props = { close: Function };

    setup() {
        this.theme = useService("neobrutalism_theme");
        this.state = useState(this.theme.state);
        this.status = useState(this.theme.status);
        this.title = _t("Appearance");
    }

    setDensity(event) {
        this.theme.set({ density: event.target.value });
    }

    toggle(event) {
        this.theme.set({ enabled: event.target.checked });
    }

    reset() {
        this.theme.reset();
    }
}

registry.category("user_menuitems").add("neobrutalism_theme.appearance", (env) => ({
    type: "item",
    id: "neobrutalism_theme_appearance",
    description: _t("Appearance"),
    sequence: 55,
    callback: () => env.services.dialog.add(NeoAppearanceDialog),
}));
