# Third-party design attribution

The visual design is inspired by [ekmas/neobrutalism-components](https://github.com/ekmas/neobrutalism-components), by Samuel Breznjak. Its 2px borders, 4px hard shadows, 5px corner radius, and yellow/blue accent values informed this adaptation.

This add-on uses native Odoo assets and Owl components. It does not bundle the upstream React components, Tailwind, shadcn/ui, or any third-party JavaScript runtime. The Odoo-specific implementation is licensed under LGPL-3.0-or-later; the referenced upstream design/component source is MIT. Its notice is retained below.

```text
MIT License

Copyright (c) 2023 Samuel Breznjak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Marketplace publisher artwork and render font

The fox mark and wordmark treatment come from the publisher’s own [RivetFox website](https://rivetfox.pro/) and were added at the publisher’s request. The source is retained under `tools/branding/`. Space Grotesk is used only to rasterize promotional artwork; its SIL Open Font License is included at `tools/branding/OFL-Space-Grotesk.txt`. Neither the font nor a new font request is added to Odoo runtime assets.
