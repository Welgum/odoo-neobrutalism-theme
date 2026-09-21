// SPDX-License-Identifier: LGPL-3.0-or-later
// Baked into GIF frames; no scripts are included in the marketplace listing.
// A small lift and settle, with a stationary first/last frame for seamless loops.
window.animateTitle = (element, time, duration, distance = 4, delay = 0) => {
    const phase = ((time % duration) / duration - delay) / 0.24;
    const lift = phase > 0 && phase < 1 ? Math.sin(Math.PI * phase) ** 2 : 0;
    element.style.transform = `translateY(${-distance * lift}px)`;
};
