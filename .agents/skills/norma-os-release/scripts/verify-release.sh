#!/usr/bin/env bash

set -u

usage() {
  echo "Usage: verify-release.sh <version> <path-to-dmg>" >&2
}

if [[ $# -ne 2 ]]; then
  usage
  exit 64
fi

version=$1
dmg_path=$2

if [[ ! $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid version: expected three numeric components such as 0.1.36" >&2
  exit 65
fi

if [[ ! -f $dmg_path ]]; then
  echo "DMG not found: $dmg_path" >&2
  exit 66
fi

required_commands=(awk codesign shasum spctl stat xcrun)
for required_command in "${required_commands[@]}"; do
  if ! command -v "$required_command" >/dev/null 2>&1; then
    echo "Required command not found: $required_command" >&2
    exit 69
  fi
done

size_bytes=$(stat -f '%z' "$dmg_path") || exit 70

# GitHub Releases accepts individual assets smaller than 2 GiB.
# 2 GiB = 2 * 1024 * 1024 * 1024 = 2147483648 bytes.
if (( size_bytes >= 2147483648 )); then
  echo "DMG is too large for GitHub Releases: $size_bytes bytes" >&2
  exit 65
fi

codesign --verify --strict --verbose=2 "$dmg_path" || exit 70
xcrun stapler validate "$dmg_path" || exit 70
spctl -a -vv -t install "$dmg_path" || exit 70

sha256=$(shasum -a 256 "$dmg_path" | awk '{print $1}') || exit 70

printf 'status=verified\n'
printf 'version=%s\n' "$version"
printf 'path=%s\n' "$dmg_path"
printf 'size_bytes=%s\n' "$size_bytes"
printf 'sha256=%s\n' "$sha256"
