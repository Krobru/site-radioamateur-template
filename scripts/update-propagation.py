#!/usr/bin/env python3
"""Fetch public HF propagation data and write propagation.json.

Primary source: N0NBH solar XML (https://www.hamqsl.com/solarxml.php),
which already includes calculated day/night band conditions plus solar
indices. NOAA SWPC JSON is used as a fallback for the indices only
(SFI, A, K, X-ray, and monthly SSN when available).

Stdlib only. Intended to run on GitHub Actions (hourly).
"""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

UA = "ham-site-propagation/1.0 (+https://on5ee.be)"
HAMQSL = "https://www.hamqsl.com/solarxml.php"
NOAA_FLUX = "https://services.swpc.noaa.gov/json/f107_cm_flux.json"
NOAA_KP = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
NOAA_XRAY = "https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json"
NOAA_SSN = "https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json"
BAND_NAMES = ("80m-40m", "30m-20m", "17m-15m", "12m-10m")
MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def fetch(url: str, timeout: int = 20) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        if getattr(resp, "status", 200) >= 400:
            raise RuntimeError(f"{url} HTTP {resp.status}")
        return resp.read()


def to_number(raw):
    if raw is None:
        return None
    s = str(raw).strip()
    if not s or s.lower() in {"no report", "norpt", "n/a", "na", "-", "null"}:
        return None
    try:
        if any(c in s for c in ".eE") and not s.lstrip("-").isdigit():
            val = float(s)
            return int(val) if val.is_integer() else val
        return int(s)
    except ValueError:
        return s


def parse_hamqsl_updated(text: str) -> str | None:
    if not text:
        return None
    parts = text.strip().replace(",", " ").split()
    # Expected: 11 Nov 2026 1115 GMT
    if len(parts) < 4:
        return None
    try:
        day = int(parts[0])
        month = MONTHS[parts[1][:3].lower()]
        year = int(parts[2])
        hm = parts[3]
        if hm.isdigit() and len(hm) <= 4:
            hm = hm.zfill(4)
            hour, minute = int(hm[:2]), int(hm[2:])
        else:
            return None
        dt = datetime(year, month, day, hour, minute, tzinfo=timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    except (KeyError, ValueError):
        return None


def from_hamqsl() -> dict:
    xml = fetch(HAMQSL)
    root = ET.fromstring(xml)
    sd = root.find("solardata")
    if sd is None:
        sd = root

    def text(tag: str) -> str | None:
        el = sd.find(tag)
        return el.text if el is not None else None

    bands: dict[str, dict[str, str]] = {name: {} for name in BAND_NAMES}
    cond = sd.find("calculatedconditions")
    if cond is not None:
        for band in cond.findall("band"):
            name = (band.get("name") or "").strip()
            when = (band.get("time") or "").strip().lower()
            if name in bands and when in {"day", "night"} and band.text:
                bands[name][when] = band.text.strip().lower()

    updated = parse_hamqsl_updated(text("updated") or "") or datetime.now(timezone.utc).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )
    return {
        "updated": updated,
        "source": "N0NBH / NOAA SWPC",
        "sfi": to_number(text("solarflux")),
        "ssn": to_number(text("sunspots")),
        "aindex": to_number(text("aindex")),
        "kindex": to_number(text("kindex")),
        "xray": (text("xray") or "").strip() or None,
        "bands": bands,
    }


def _latest(items, key="time_tag"):
    if not items:
        return None
    def k(it):
        return str(it.get(key) or it.get("time-tag") or "")
    return max(items, key=k)


def from_noaa() -> dict:
    data: dict = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "NOAA SWPC",
        "sfi": None,
        "ssn": None,
        "aindex": None,
        "kindex": None,
        "xray": None,
        "bands": {},
    }
    errors = []

    try:
        flux = json.loads(fetch(NOAA_FLUX).decode("utf-8"))
        latest = _latest(flux)
        if latest:
            data["sfi"] = to_number(latest.get("flux"))
            tag = latest.get("time_tag")
            if tag:
                data["updated"] = tag.replace(" ", "T")
                if not data["updated"].endswith("Z") and "+" not in data["updated"]:
                    data["updated"] += "Z"
    except Exception as exc:  # noqa: BLE001
        errors.append(f"flux: {exc}")

    try:
        kp = json.loads(fetch(NOAA_KP).decode("utf-8"))
        rows = kp
        if rows and isinstance(rows[0], list):
            # header + rows: time_tag, Kp, a_running, station_count
            header, *rest = rows
            mapped = [dict(zip(header, row)) for row in rest]
            rows = mapped
        latest = _latest(rows)
        if latest:
            data["kindex"] = to_number(latest.get("Kp") or latest.get("kp"))
            data["aindex"] = to_number(latest.get("a_running") or latest.get("A_running"))
    except Exception as exc:  # noqa: BLE001
        errors.append(f"kp: {exc}")

    try:
        flares = json.loads(fetch(NOAA_XRAY).decode("utf-8"))
        latest = flares[0] if flares else None
        if latest:
            data["xray"] = latest.get("current_class") or None
    except Exception as exc:  # noqa: BLE001
        errors.append(f"xray: {exc}")

    try:
        cycle = json.loads(fetch(NOAA_SSN).decode("utf-8"))
        latest = _latest(cycle, key="time-tag")
        if latest:
            ssn = latest.get("observed_swpc_ssn")
            if ssn in (None, -1, -1.0):
                ssn = latest.get("ssn")
            if ssn not in (None, -1, -1.0):
                data["ssn"] = to_number(ssn)
    except Exception as exc:  # noqa: BLE001
        errors.append(f"ssn: {exc}")

    if data["sfi"] is None and data["kindex"] is None and data["xray"] is None:
        raise RuntimeError("NOAA fallback produced no indices: " + "; ".join(errors))
    if errors:
        print("NOAA partial errors: " + "; ".join(errors), file=sys.stderr)
    return data


def main() -> int:
    out = Path("propagation.json")
    data = None
    try:
        data = from_hamqsl()
        print("Fetched N0NBH solar XML")
    except Exception as exc:  # noqa: BLE001
        print(f"hamqsl failed: {exc}", file=sys.stderr)
        try:
            data = from_noaa()
            print("Fetched NOAA SWPC fallback")
        except Exception as exc2:  # noqa: BLE001
            print(f"NOAA fallback failed: {exc2}", file=sys.stderr)
            return 1

    if data.get("bands"):
        # Drop empty band slots so the file stays compact, but keep known keys
        data["bands"] = {
            name: data["bands"].get(name, {})
            for name in BAND_NAMES
            if data["bands"].get(name)
        }

    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if out.exists() and out.read_text(encoding="utf-8") == text:
        print("propagation.json unchanged")
    else:
        out.write_text(text, encoding="utf-8")
        print(f"Wrote {out} ({data.get('source')}, {data.get('updated')})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
