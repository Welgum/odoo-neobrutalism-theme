/** @odoo-module **/
// SPDX-License-Identifier: LGPL-3.0-or-later

const NATIVE_BUNDLE = /\/(?:web\.(?:assets_(?:common|backend(?:_legacy_lazy)?)|dark_mode_assets_(?:common|backend)))(?:\.[^/]+)?\.css(?:\?|$)/;

/** Stage CSS before swapping it, without executing bundle JS or changing cookies.
 * Original media attributes are restored exactly (including lazy styles added later).
 * The injected document/getBundle arguments also allow lifecycle tests without Odoo.
 */
export class StylesheetSwitcher {
    constructor(doc, getBundle, baseline, timeout = 30000) {
        this.doc = doc;
        this.getBundle = getBundle;
        this.baseline = baseline;
        this.timeout = timeout;
        this.originals = new Map();
        this.prepared = new Map();
        this.active = null;
        this.observer = new doc.defaultView.MutationObserver(() => this.syncOriginals());
        this.observer.observe(doc.head, { childList: true, subtree: true });
        this.syncOriginals();
    }

    syncOriginals() {
        for (const link of this.doc.querySelectorAll('link[rel="stylesheet"]')) {
            if (!link.dataset.neoStylesheet && NATIVE_BUNDLE.test(link.href)) {
                if (!this.originals.has(link)) {
                    this.originals.set(link, link.getAttribute("media"));
                }
                if (this.active) {
                    // Keep any original print participation, without making
                    // screen-only styles suddenly apply to printed documents.
                    const media = this.originals.get(link);
                    link.media = !media || media === "all" || /\bprint\b/.test(media) ? "print" : "not all";
                }
            }
        }
    }

    async prepare(mode) {
        if (!mode || this.prepared.has(mode)) {
            return this.prepared.get(mode);
        }
        const links = [];
        const promise = (async () => {
            const bundles = mode === "dark"
                ? ["neobrutalism_theme.assets_common_dark", "neobrutalism_theme.assets_web_dark"]
                : ["web.assets_common", "neobrutalism_theme.assets_backend_light"];
            let timer;
            let descriptors;
            try {
                descriptors = await Promise.race([
                    Promise.all(bundles.map((name) => this.getBundle(name))),
                    new Promise((_, reject) => {
                        timer = setTimeout(() => reject(new Error("Appearance bundle timed out")), this.timeout);
                    }),
                ]);
            } finally {
                clearTimeout(timer);
            }
            for (const descriptor of descriptors) {
                if (!descriptor.cssLibs.length) {
                    throw new Error("Missing appearance stylesheet");
                }
            }
            await Promise.all([...new Set(descriptors.flatMap((d) => d.cssLibs))].map((url) =>
                new Promise((resolve, reject) => {
                    const link = this.doc.createElement("link");
                    links.push(link);
                    link.rel = "stylesheet";
                    link.href = url;
                    link.media = "not all";
                    link.dataset.neoStylesheet = mode;
                    const timer = setTimeout(() => finish(new Error("Appearance stylesheet timed out")), this.timeout);
                    const finish = (error) => {
                        clearTimeout(timer);
                        link.onload = link.onerror = null;
                        error ? reject(error) : resolve();
                    };
                    link.onload = () => finish();
                    link.onerror = () => finish(new Error("Could not load appearance stylesheet"));
                    this.doc.head.appendChild(link);
                })
            ));
            return links;
        })().catch((error) => {
            links.forEach((link) => link.remove());
            this.prepared.delete(mode);
            throw error;
        });
        this.prepared.set(mode, promise);
        return promise;
    }

    target(enabled, mode) {
        // A disabled theme always restores exactly the user's original Odoo bundle.
        return enabled && (mode === "dark" || mode !== this.baseline) ? mode : null;
    }

    activate(mode, links = []) {
        this.active = mode;
        this.syncOriginals();
        for (const link of this.doc.querySelectorAll("link[data-neo-stylesheet]")) {
            link.media = links.includes(link) ? "screen" : "not all";
        }
        if (!mode) {
            for (const [link, media] of this.originals) {
                media === null ? link.removeAttribute("media") : link.setAttribute("media", media);
            }
        }
    }
}
