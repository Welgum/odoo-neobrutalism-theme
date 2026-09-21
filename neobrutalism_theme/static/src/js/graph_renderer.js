/** @odoo-module **/
// SPDX-License-Identifier: LGPL-3.0-or-later

import { GraphRenderer } from "@web/views/graph/graph_renderer";
import { patch } from "@web/core/utils/patch";
import { useBus } from "@web/core/utils/hooks";

// Odoo 16 uses the named patch API and Chart.js 2's axes/legend options.
patch(GraphRenderer.prototype, "neobrutalism_theme.graph", {
    setup() {
        this._super(...arguments);
        useBus(this.env.bus, "NEO:APPEARANCE_CHANGED", () => {
            if (this.chart) this.renderChart();
        });
    },
    getChartConfig() {
        const config = this._super(...arguments);
        if (!document.body.classList.contains("o_neo_theme")) return config;
        const style = getComputedStyle(document.body);
        const ink = style.getPropertyValue("--neo-ink").trim();
        const line = style.getPropertyValue("--neo-line").trim();
        for (const axes of Object.values(config.options.scales || {})) {
            for (const axis of axes) {
                if (axis.ticks) axis.ticks.fontColor = ink;
                if (axis.scaleLabel) axis.scaleLabel.fontColor = ink;
                axis.gridLines = { ...axis.gridLines, color: line, zeroLineColor: line };
            }
        }
        config.options.legend.labels.fontColor = ink;
        return config;
    },
});
