/** @odoo-module **/
// SPDX-License-Identifier: LGPL-3.0-or-later

import { reactive } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { user } from "@web/core/user";
import { session } from "@web/session";
import {
    DEFAULTS, applyPreferences, normalizePreferences, normalizeThemeSettings,
    readPreferences, resolveColorScheme, storageKey, writePreferences,
} from "./preferences";

export const neoThemeService = {
    start() {
        const key = storageKey(session.db, user.userId);
        let storage;
        try {
            storage = window.localStorage;
        } catch {
            // Browsers can throw even when reading the localStorage property.
            storage = null;
        }
        const state = reactive(readPreferences(storage, key));
        const status = reactive({ persistent: Boolean(storage) });
        const settings = normalizeThemeSettings(session.neobrutalism_theme);
        // Follow Odoo until this user explicitly chooses day or night mode.
        const colorScheme = document.querySelector('link[href*="web.assets_web_dark"]')
            ? "dark" : "light";
        const apply = () => applyPreferences(document.body, state, colorScheme, settings);
        apply();

        // Services live for the web client's lifetime, so one listener per client.
        window.addEventListener("storage", (event) => {
            if (event.storageArea === storage && (event.key === key || event.key === null)) {
                Object.assign(state, readPreferences(storage, key));
                apply();
            }
        });

        return {
            state,
            status,
            settings,
            colorScheme,
            set(patch) {
                Object.assign(state, normalizePreferences({ ...state, ...patch }));
                apply();
                status.persistent = writePreferences(storage, key, state);
            },
            reset() {
                this.set(DEFAULTS);
            },
            toggleMode() {
                const current = state.enabled ? resolveColorScheme(state.mode, colorScheme) : colorScheme;
                this.set({ enabled: true, mode: current === "dark" ? "light" : "dark" });
            },
        };
    },
};

registry.category("services").add("neobrutalism_theme", neoThemeService);
