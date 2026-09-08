#!/usr/bin/env python3
"""Fetch the pinned Literata italic webfonts used by the site.

The binary files are build artifacts, not source-controlled blobs. Each download
is pinned to an archived upstream commit and verified using the exact Git blob
SHA-1 published by GitHub before it is written into static/fonts.
"""
from __future__ import annotations

import argparse
import hashlib
import os
from pathlib import Path
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request

UPSTREAM_REPOSITORY = "https://github.com/googlefonts/literata"
UPSTREAM_COMMIT = "0c2761b727a1b3a7cffd313c37f0f5163dfc7a63"
DESTINATION = Path(__file__).resolve().parents[1] / "static" / "fonts"

ASSETS = (
    {
        "name": "literata-italic.woff2",
        "upstream": "fonts/webfonts/Literata-Italic.woff2",
        "size": 98_312,
        "git_blob": "840da65b0fd95c107c5b18f7cf86cefb2b30a621",
    },
    {
        "name": "literata-medium-italic.woff2",
        "upstream": "fonts/webfonts/Literata-MediumItalic.woff2",
        "size": 107_300,
        "git_blob": "3b9844d4235a176365312379d70f03bd6bc010a5",
    },
    {
        "name": "literata-semibold-italic.woff2",
        "upstream": "fonts/webfonts/Literata-SemiBoldItalic.woff2",
        "size": 108_232,
        "git_blob": "fc086e08aff57f9ad7d085ffa7a9e1c30db0cd85",
    },
)


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def validate(data: bytes, asset: dict[str, object]) -> tuple[bool, str]:
    if len(data) != asset["size"]:
        return False, f"size {len(data)} != {asset['size']}"
    if not data.startswith(b"wOF2"):
        return False, "missing WOFF2 signature"
    actual = git_blob_sha(data)
    if actual != asset["git_blob"]:
        return False, f"Git blob {actual} != {asset['git_blob']}"
    return True, "ok"


def read_valid(path: Path, asset: dict[str, object]) -> bool:
    if not path.is_file():
        return False
    try:
        data = path.read_bytes()
    except OSError as error:
        print(f"font sync: cannot read {path}: {error}", file=sys.stderr)
        return False
    valid, _ = validate(data, asset)
    return valid


def source_url(asset: dict[str, object]) -> str:
    encoded = "/".join(urllib.parse.quote(part, safe="") for part in str(asset["upstream"]).split("/"))
    return f"https://raw.githubusercontent.com/googlefonts/literata/{UPSTREAM_COMMIT}/{encoded}"


def download(asset: dict[str, object]) -> bytes:
    request = urllib.request.Request(
        source_url(asset),
        headers={"User-Agent": "varyvoda.com-font-sync/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = response.read()
    except (urllib.error.URLError, TimeoutError) as error:
        raise RuntimeError(f"failed to download {asset['name']}: {error}") from error
    valid, reason = validate(data, asset)
    if not valid:
        raise RuntimeError(f"refusing unverified {asset['name']}: {reason}")
    return data


def install(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="verify local generated assets without accessing the network",
    )
    args = parser.parse_args()

    failures: list[str] = []
    for asset in ASSETS:
        path = DESTINATION / str(asset["name"])
        if read_valid(path, asset):
            print(f"font sync: verified {path.relative_to(DESTINATION.parent.parent)}")
            continue
        if args.check:
            failures.append(f"missing or invalid {path.relative_to(DESTINATION.parent.parent)}")
            continue
        try:
            data = download(asset)
            install(path, data)
            print(f"font sync: installed {path.relative_to(DESTINATION.parent.parent)}")
        except RuntimeError as error:
            failures.append(str(error))

    if failures:
        for failure in failures:
            print(f"font sync: ERROR: {failure}", file=sys.stderr)
        print(
            f"font sync: upstream is pinned to {UPSTREAM_REPOSITORY}@{UPSTREAM_COMMIT}",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
