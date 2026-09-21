/** @odoo-module **/
// SPDX-License-Identifier: LGPL-3.0-or-later

import { Component, useState } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { resolveColorScheme } from "./preferences";

export class NeoModeToggle extends Component {
    static template = "neobrutalism_theme.ModeToggle";
    static props = {};

    setup() {
        this.theme = useService("neobrutalism_theme");
        this.state = useState(this.theme.state);
    }

    get isDark() {
        return (this.state.enabled
            ? resolveColorScheme(this.state.mode, this.theme.colorScheme)
            : this.theme.colorScheme) === "dark";
    }

    get label() {
        return this.isDark ? _t("Switch to day mode") : _t("Switch to night mode");
    }

    toggle() {
        this.theme.toggleMode();
    }
}

registry.category("systray").add("neobrutalism_theme.mode", { Component: NeoModeToggle }, { sequence: 35 });
