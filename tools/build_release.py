#!/usr/bin/env python3
"""Validate and package this Odoo add-on using only the Python standard library."""

import ast
import base64
import hashlib
import re
import struct
import zipfile
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
MODULE = "neobrutalism_theme"
DESCRIPTION = ROOT / "static" / "description"
FILES = (
    "__init__.py", "__manifest__.py", "LICENSE", "THIRD_PARTY_NOTICES.md",
    "README.md", "CHANGELOG.md", "VALIDATION.md",
)
DIRECTORIES = ("models", "views", "static", "doc", "tests")
SUFFIXES = {".py", ".xml", ".css", ".scss", ".js", ".mjs", ".cjs", ".png", ".html", ".rst", ".md"}
STYLE_PROPERTIES = {
    "color", "background-color", "font-family", "font-size", "font-weight",
    "border", "border-radius", "margin", "padding",
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def local_file(path, base=ROOT):
    target = base / path
    require(not target.is_symlink(), f"Symlink is not a release asset: {path}")
    require(target.resolve().is_relative_to(base.resolve()), f"Path escapes its directory: {path}")
    require(target.is_file(), f"Missing file: {target}")
    return target


def png_size(path):
    data = path.read_bytes()
    require(data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR", f"Invalid PNG: {path}")
    return struct.unpack(">II", data[16:24])


class ListingValidator(HTMLParser):
    """Enforce the deliberately static, local-only subset used by our listing."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.images = set()
        self.stack = []

    def handle_starttag(self, tag, attrs):
        require(tag in {"section", "div", "p", "h2", "h3", "strong", "img", "ol", "ul", "li", "a", "br"}, f"Unsupported listing tag: {tag}")
        values = dict(attrs)
        for key, value in attrs:
            require(key in {"class", "style", "src", "alt", "loading", "href", "title"}, f"Unsupported listing attribute: {key}")
            if key in {"src", "href"}:
                parsed = urlsplit(value or "")
                require(not parsed.scheme and not parsed.netloc and not parsed.query, f"External or dynamic listing resource: {value}")
                if parsed.path:
                    local_file(parsed.path, DESCRIPTION)
            elif key == "style":
                for declaration in value.split(";"):
                    if declaration.strip():
                        prop, _, content = declaration.partition(":")
                        require(prop.strip() in STYLE_PROPERTIES, f"Unsupported listing style: {prop}")
                        require(not re.search(r"url|expression|@|\\", content, re.I), f"Dynamic listing style: {content}")
        if tag == "img":
            require(values.get("alt", "").strip(), "Every listing image needs alt text")
            require(values.get("src"), "Listing image missing source")
            png_size(local_file(values["src"], DESCRIPTION))
            self.images.add(values["src"])
        if tag not in {"img", "br"}:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in {"img", "br"}:
            return
        require(self.stack and self.stack[-1] == tag, f"Mismatched listing tag: {tag}")
        self.stack.pop()


def validate():
    manifest = ast.literal_eval(local_file("__manifest__.py").read_text())
    require(0 < len(manifest["name"]) <= 25, "Marketplace name must be at most 25 characters")
    require(re.fullmatch(r"19\.0\.\d+\.\d+\.\d+", manifest["version"]), "Expected an Odoo 19 five-part version")
    require(manifest.get("author") and manifest.get("summary") and manifest.get("description"), "Incomplete listing metadata")
    require(manifest["license"] == "LGPL-3", "Review licensing before changing the release license")
    require("theme" in manifest["category"].lower(), "Theme category missing")
    require(manifest["depends"] == ["web", "base_setup"], "Review dependency changes before release")
    require(manifest["installable"] and not manifest["auto_install"], "Unexpected installation flags")
    if "price" in manifest:
        require(manifest["price"] > 0 and manifest.get("currency") in {"EUR", "USD"}, "Paid release requires a positive price and EUR/USD currency")
    for filename in manifest["data"]:
        local_file(filename)
    for bundle in manifest["assets"].values():
        for filename in bundle:
            if isinstance(filename, tuple):
                directive = filename
                if len(directive) == 2 and directive[0] == "include":
                    require(directive[1] in {"web.assets_web_dark", "web.assets_backend_lazy_dark"}, f"Review included bundle: {directive}")
                    continue
                require(len(directive) == 3 and directive[:2] in {
                    ("before", "web/static/src/scss/primary_variables.scss"),
                    ("before", "web/static/src/scss/bootstrap_overridden.scss"),
                    ("after", "web/static/lib/bootstrap/scss/_functions.scss"),
                }, f"Review asset directive: {directive}")
                filename = directive[2]
            require(isinstance(filename, str) and filename.startswith(MODULE + "/"), f"Review asset declaration: {filename}")
            local_file(filename.removeprefix(MODULE + "/"))
    require(len(manifest["images"]) > 1, "Include a cover and theme screenshot")
    for filename in manifest["images"]:
        png_size(local_file(filename))
    require(any(Path(p).stem.endswith("_screenshot") for p in manifest["images"]), "Theme gallery needs an _screenshot image")
    require(png_size(local_file("static/description/icon.png")) == (256, 256), "Expected the square app icon")
    require(png_size(local_file(manifest["images"][0])) == (1120, 560), "Expected this release's 2:1 cover")
    local_file("doc/index.rst")
    html = local_file("static/description/index.html").read_text()
    parser = ListingValidator()
    parser.feed(html)
    parser.close()
    require(not parser.stack, "Unclosed listing HTML tags")
    require(len(parser.images) >= 6, "Expected all feature screenshots in the listing")
    paths = [local_file(name) for name in FILES]
    for directory in DIRECTORIES:
        for path in sorted((ROOT / directory).rglob("*")):
            relative = path.relative_to(ROOT)
            if any(part.startswith(".") or part == "__pycache__" for part in relative.parts):
                continue
            require(not path.is_symlink(), f"Release cannot include symlinks: {relative}")
            if path.is_file():
                require(path.suffix in SUFFIXES, f"Unexpected file in release directory: {relative}")
                paths.append(path)
                if path.suffix == ".py":
                    ast.parse(path.read_text(), filename=str(relative))
                elif path.suffix == ".xml":
                    ElementTree.parse(path)
    return manifest, sorted(paths), html, parser.images


def preview(html, images, name):
    for filename in images:
        encoded = base64.b64encode((DESCRIPTION / filename).read_bytes()).decode()
        html = html.replace(f'src="{filename}"', f'src="data:image/png;base64,{encoded}"')
    css = """*{box-sizing:border-box}body{margin:0;background:#fff;font:16px/1.5 Arial,sans-serif}
h2,h3{line-height:1.2;margin:0 0 16px}p{margin:0 0 16px}.container{max-width:1140px;margin:auto;padding:0 15px}
.row{display:flex;flex-wrap:wrap;margin:0 -12px}.row>[class*=col]{padding:0 12px;width:100%}.col-6{flex:0 0 50%}
.my-4{margin-top:24px;margin-bottom:24px}.py-4{padding-top:24px;padding-bottom:24px}.py-3{padding-top:16px;padding-bottom:16px}
.pb-4{padding-bottom:24px}.p-4{padding:24px}.p-3{padding:16px}.pl-4{padding-left:24px}.mt-2{margin-top:8px}
.mb-0{margin-bottom:0}.mb-2{margin-bottom:8px}.mb-3{margin-bottom:16px}.mb-4{margin-bottom:24px}
.h-100{height:100%}.w-100{width:100%}.img-fluid{max-width:100%;height:auto;vertical-align:middle}.text-center{text-align:center}
@media(min-width:768px){.row>.col-md-4{width:33.333%}.row>.col-md{flex:1 0 0}}
@media(min-width:992px){.row>.col-lg-4{width:33.333%}.row>.col-lg-6{width:50%}.row>.col-lg-8{width:66.667%}}
"""
    return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{escape(name)} — listing preview</title><style>{css}</style></head><body>{html}</body></html>\n'


def main():
    manifest, paths, html, images = validate()
    destination = ROOT / "dist"
    destination.mkdir(exist_ok=True)
    archive = destination / f'{MODULE}-{manifest["version"]}.zip'
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as release:
        for path in paths:
            info = zipfile.ZipInfo(f"{MODULE}/{path.relative_to(ROOT).as_posix()}", date_time=(2026, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            release.writestr(info, path.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    with zipfile.ZipFile(archive) as release:
        require(release.testzip() is None, "Archive integrity check failed")
        require(all(n.startswith(MODULE + "/") for n in release.namelist()), "Invalid module archive structure")
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    archive.with_suffix(".zip.sha256").write_text(f"{digest}  {archive.name}\n")
    (destination / "listing-preview.html").write_text(preview(html, images, manifest["name"]))
    print(f'PASS: manifest, listing, {len(images)} images, Python/XML syntax, and archive integrity')
    print(f'{archive}\n{len(paths)} files; {archive.stat().st_size:,} bytes\nSHA-256: {digest}')
    print(destination / "listing-preview.html")


if __name__ == "__main__":
    main()
