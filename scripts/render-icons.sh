#!/usr/bin/env bash
# Rasterise the SVG sources into the PNGs the pages reference.
# macOS only: uses the Swift toolchain (Xcode or Command Line Tools). Run from anywhere.
set -euo pipefail
cd "$(dirname "$0")/.."
render() { swift scripts/render-svg.swift "$1" "$2" "$3" "$4"; }
render site/favicon.svg 32 32 site/favicon.png
render site/favicon.svg 180 180 site/apple-touch-icon.png
render site/assets/og.svg 1200 630 site/assets/og.png
echo "rendered site/favicon.png site/apple-touch-icon.png site/assets/og.png"
