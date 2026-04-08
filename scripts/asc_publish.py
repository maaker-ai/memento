#!/usr/bin/env python3
"""
ASC Publisher for Memento
- Updates all 12 locale metadata (appInfoLocalizations + appStoreVersionLocalizations)
- Uploads screenshots per locale
- Sets pricing (free), copyright, content rights, territories, age rating
"""

import jwt
import time
import requests
import json
import os
import hashlib
import sys

# ── Config ──────────────────────────────────────────────────────────────────
KEY_ID = "L57984QZY8"
ISSUER_ID = "69a6de7e-fe42-47e3-e053-5b8c7c11a4d1"
KEY_PATH = "/Users/martin/.appstoreconnect/private_keys/AuthKey_L57984QZY8.p8"
ASC_APP_ID = "6761762165"
SCREENSHOTS_BASE = "/Users/martin/OpenSource/Memento/app-store/screenshots"
ASO_METADATA_PATH = "/Users/martin/OpenSource/Memento/aso-metadata.json"
PRIVACY_POLICY_URL = "https://maaker-ai.github.io/memento/privacy-policy.html"

# Locale mapping: project locale → Apple locale code
LOCALE_MAP = {
    "en": "en-US",
    "zh-Hans": "zh-Hans",
    "zh-Hant": "zh-Hant",
    "ja": "ja",
    "ko": "ko",
    "de": "de-DE",
    "fr": "fr-FR",
    "es": "es-ES",
    "ru": "ru",
    "it": "it",
    "ar": "ar-SA",
    "id": "id",
}

# Screenshot directory name → Apple locale
SCREENSHOT_DIR_MAP = {
    "en-US": "en",
    "zh-Hans": "zh-Hans",
    "zh-Hant": "zh-Hant",
    "ja": "ja",
    "ko": "ko",
    "de-DE": "de",
    "fr-FR": "fr",
    "es-ES": "es",
    "ru": "ru",
    "it": "it",
    "ar-SA": "ar",
    "id": "id",
}

ALL_APPLE_LOCALES = list(LOCALE_MAP.values())
DISPLAY_TYPE = "APP_IPHONE_67"

# ── JWT ─────────────────────────────────────────────────────────────────────
def get_headers():
    with open(KEY_PATH) as f:
        private_key = f.read()
    now = int(time.time())
    token = jwt.encode(
        {"iss": ISSUER_ID, "iat": now, "exp": now + 1200, "aud": "appstoreconnect-v1"},
        private_key,
        algorithm="ES256",
        headers={"kid": KEY_ID},
    )
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

def md5(path):
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

# ── Load metadata ────────────────────────────────────────────────────────────
with open(ASO_METADATA_PATH) as f:
    aso = json.load(f)

def get_aso_for_locale(apple_locale):
    if apple_locale == "en-US":
        return {
            "title": aso["title"],
            "subtitle": aso["subtitle"],
            "keywords": aso["keywords"],
            "promotional_text": aso["promotional_text"],
            "description": aso["description"],
            "whats_new": aso["whats_new"],
        }
    project_locale = {v: k for k, v in LOCALE_MAP.items()}.get(apple_locale)
    if project_locale and project_locale in aso.get("localizations", {}):
        loc_data = aso["localizations"][project_locale]
        return {
            "title": loc_data.get("title", aso["title"]),
            "subtitle": loc_data.get("subtitle", aso["subtitle"]),
            "keywords": loc_data.get("keywords", aso["keywords"]),
            "promotional_text": loc_data.get("promotional_text", aso["promotional_text"]),
            "description": loc_data.get("description", aso["description"]),
            "whats_new": aso["whats_new"],
        }
    return None

# ── Step 1: Get App Store Version ────────────────────────────────────────────
print("\n=== Step 1: Get App Store Version ===")
r = requests.get(
    f"https://api.appstoreconnect.apple.com/v1/apps/{ASC_APP_ID}/appStoreVersions",
    headers=get_headers(),
    params={"filter[platform]": "IOS", "limit": 5},
)
r.raise_for_status()
versions = r.json()["data"]

version = None
for v in versions:
    state = v["attributes"]["appStoreState"]
    if state in ("PREPARE_FOR_SUBMISSION", "DEVELOPER_REJECTED", "WAITING_FOR_REVIEW",
                 "IN_REVIEW", "PENDING_DEVELOPER_RELEASE"):
        version = v
        break
if not version and versions:
    version = versions[0]

if not version:
    print("ERROR: No app store version found!")
    sys.exit(1)

version_id = version["id"]
version_state = version["attributes"]["appStoreState"]
version_string = version["attributes"]["versionString"]
print(f"Version ID: {version_id} | Version: {version_string} | State: {version_state}")

# ── Step 2: Get App Info ──────────────────────────────────────────────────────
print("\n=== Step 2: Get App Info ===")
r = requests.get(
    f"https://api.appstoreconnect.apple.com/v1/apps/{ASC_APP_ID}/appInfos",
    headers=get_headers(),
)
r.raise_for_status()
app_infos = r.json()["data"]
# Pick PREPARE_FOR_SUBMISSION or first
app_info = None
for ai in app_infos:
    if ai["attributes"]["appStoreState"] == "PREPARE_FOR_SUBMISSION":
        app_info = ai
        break
if not app_info and app_infos:
    app_info = app_infos[0]
app_info_id = app_info["id"]
print(f"App Info ID: {app_info_id} | State: {app_info['attributes']['appStoreState']}")

# ── Step 3: Get existing localizations (both types) ───────────────────────────
print("\n=== Step 3: Gather Existing Localizations ===")

# appInfoLocalizations
r = requests.get(
    f"https://api.appstoreconnect.apple.com/v1/appInfos/{app_info_id}/appInfoLocalizations",
    headers=get_headers(),
)
r.raise_for_status()
existing_info_locs = {loc["attributes"]["locale"]: loc for loc in r.json()["data"]}
print(f"Existing appInfoLocalizations: {list(existing_info_locs.keys())}")

# appStoreVersionLocalizations
r = requests.get(
    f"https://api.appstoreconnect.apple.com/v1/appStoreVersions/{version_id}/appStoreVersionLocalizations",
    headers=get_headers(),
)
r.raise_for_status()
existing_ver_locs = {loc["attributes"]["locale"]: loc for loc in r.json()["data"]}
print(f"Existing appStoreVersionLocalizations: {list(existing_ver_locs.keys())}")

# ── Step 4: Update/Create all locales ─────────────────────────────────────────
print("\n=== Step 4: Upsert Locale Metadata ===")

ver_loc_ids = {}  # apple_locale → version loc id (for screenshots)

for apple_locale in ALL_APPLE_LOCALES:
    aso_data = get_aso_for_locale(apple_locale)
    if not aso_data:
        print(f"  SKIP {apple_locale}: no ASO data")
        continue

    # --- 4a: appInfoLocalizations (title, subtitle, privacyPolicyUrl) ---
    info_attrs = {
        "name": aso_data["title"],
        "subtitle": aso_data["subtitle"],
        "privacyPolicyUrl": PRIVACY_POLICY_URL,
    }
    if apple_locale in existing_info_locs:
        info_loc_id = existing_info_locs[apple_locale]["id"]
        r = requests.patch(
            f"https://api.appstoreconnect.apple.com/v1/appInfoLocalizations/{info_loc_id}",
            headers=get_headers(),
            json={"data": {"type": "appInfoLocalizations", "id": info_loc_id, "attributes": info_attrs}},
        )
        info_status = f"UPDATE {r.status_code}"
    else:
        r = requests.post(
            "https://api.appstoreconnect.apple.com/v1/appInfoLocalizations",
            headers=get_headers(),
            json={
                "data": {
                    "type": "appInfoLocalizations",
                    "attributes": {**info_attrs, "locale": apple_locale},
                    "relationships": {
                        "appInfo": {"data": {"type": "appInfos", "id": app_info_id}}
                    },
                }
            },
        )
        info_status = f"CREATE {r.status_code}"
        if r.status_code != 201:
            print(f"  {apple_locale} appInfoLoc {info_status}: {r.text[:150]}")

    # --- 4b: appStoreVersionLocalizations (description, keywords, promotionalText, whatsNew) ---
    ver_attrs = {
        "description": aso_data["description"],
        "keywords": aso_data["keywords"],
        "promotionalText": aso_data["promotional_text"],
        "whatsNew": aso_data["whats_new"],
        "supportUrl": PRIVACY_POLICY_URL,
    }
    if apple_locale in existing_ver_locs:
        ver_loc_id = existing_ver_locs[apple_locale]["id"]
        r = requests.patch(
            f"https://api.appstoreconnect.apple.com/v1/appStoreVersionLocalizations/{ver_loc_id}",
            headers=get_headers(),
            json={"data": {"type": "appStoreVersionLocalizations", "id": ver_loc_id, "attributes": ver_attrs}},
        )
        ver_status = f"UPDATE {r.status_code}"
        if r.status_code not in (200, 204):
            print(f"  {apple_locale} verLoc {ver_status}: {r.text[:150]}")
    else:
        r = requests.post(
            "https://api.appstoreconnect.apple.com/v1/appStoreVersionLocalizations",
            headers=get_headers(),
            json={
                "data": {
                    "type": "appStoreVersionLocalizations",
                    "attributes": {**ver_attrs, "locale": apple_locale},
                    "relationships": {
                        "appStoreVersion": {"data": {"type": "appStoreVersions", "id": version_id}}
                    },
                }
            },
        )
        ver_status = f"CREATE {r.status_code}"
        if r.status_code == 201:
            ver_loc_id = r.json()["data"]["id"]
        else:
            print(f"  {apple_locale} verLoc {ver_status}: {r.text[:150]}")
            ver_loc_id = None

    if apple_locale in existing_ver_locs:
        ver_loc_ids[apple_locale] = existing_ver_locs[apple_locale]["id"]
    elif ver_loc_id:
        ver_loc_ids[apple_locale] = ver_loc_id

    print(f"  {apple_locale}: infoLoc={info_status}, verLoc={ver_status}")

# Refresh ver locs
r = requests.get(
    f"https://api.appstoreconnect.apple.com/v1/appStoreVersions/{version_id}/appStoreVersionLocalizations",
    headers=get_headers(),
)
r.raise_for_status()
for loc in r.json()["data"]:
    apple_locale = loc["attributes"]["locale"]
    if apple_locale not in ver_loc_ids:
        ver_loc_ids[apple_locale] = loc["id"]
print(f"\nVersion locale IDs: {len(ver_loc_ids)}")

# ── Step 5: Upload Screenshots per locale ────────────────────────────────────
print("\n=== Step 5: Upload Screenshots ===")

def upload_screenshot(ss_set_id, png_path):
    file_size = os.path.getsize(png_path)
    file_name = os.path.basename(png_path)
    checksum = md5(png_path)

    r = requests.post(
        "https://api.appstoreconnect.apple.com/v1/appScreenshots",
        headers=get_headers(),
        json={
            "data": {
                "type": "appScreenshots",
                "attributes": {"fileName": file_name, "fileSize": file_size},
                "relationships": {
                    "appScreenshotSet": {"data": {"type": "appScreenshotSets", "id": ss_set_id}}
                },
            }
        },
    )
    if r.status_code != 201:
        print(f"    Reserve failed: {r.status_code} {r.text[:150]}")
        return False

    screenshot = r.json()["data"]
    screenshot_id = screenshot["id"]
    upload_ops = screenshot["attributes"]["uploadOperations"]

    with open(png_path, "rb") as f:
        for op in upload_ops:
            f.seek(op["offset"])
            chunk = f.read(op["length"])
            upload_headers = {h["name"]: h["value"] for h in op["requestHeaders"]}
            put_r = requests.put(op["url"], headers=upload_headers, data=chunk)
            if put_r.status_code not in (200, 204):
                print(f"    Upload part failed: {put_r.status_code}")
                return False

    r = requests.patch(
        f"https://api.appstoreconnect.apple.com/v1/appScreenshots/{screenshot_id}",
        headers=get_headers(),
        json={
            "data": {
                "type": "appScreenshots",
                "id": screenshot_id,
                "attributes": {"uploaded": True, "sourceFileChecksum": checksum},
            }
        },
    )
    if r.status_code in (200, 204):
        return True
    else:
        print(f"    Confirm failed: {r.status_code} {r.text[:100]}")
        return False

for apple_locale, ver_loc_id in ver_loc_ids.items():
    screenshot_dir_name = SCREENSHOT_DIR_MAP.get(apple_locale)
    if not screenshot_dir_name:
        print(f"  SKIP {apple_locale}: no screenshot dir mapping")
        continue

    ss_dir = os.path.join(SCREENSHOTS_BASE, screenshot_dir_name, "iphone-67")
    if not os.path.isdir(ss_dir):
        print(f"  SKIP {apple_locale}: dir not found: {ss_dir}")
        continue

    png_files = sorted([f for f in os.listdir(ss_dir) if f.endswith(".png")])
    if not png_files:
        print(f"  SKIP {apple_locale}: no PNG files")
        continue

    print(f"\n  {apple_locale} ({len(png_files)} screenshots)...")

    # Get or create screenshot set
    r = requests.get(
        f"https://api.appstoreconnect.apple.com/v1/appStoreVersionLocalizations/{ver_loc_id}/appScreenshotSets",
        headers=get_headers(),
    )
    r.raise_for_status()
    ss_sets = r.json()["data"]
    ss_set = next((s for s in ss_sets if s["attributes"]["screenshotDisplayType"] == DISPLAY_TYPE), None)

    if ss_set:
        ss_set_id = ss_set["id"]
        # Clear existing screenshots
        r2 = requests.get(
            f"https://api.appstoreconnect.apple.com/v1/appScreenshotSets/{ss_set_id}/appScreenshots",
            headers=get_headers(),
        )
        if r2.status_code == 200:
            existing_ss = r2.json().get("data", [])
            for ess in existing_ss:
                requests.delete(
                    f"https://api.appstoreconnect.apple.com/v1/appScreenshots/{ess['id']}",
                    headers=get_headers(),
                )
            if existing_ss:
                print(f"    Cleared {len(existing_ss)} existing screenshots")
        print(f"    Reusing screenshot set: {ss_set_id}")
    else:
        r = requests.post(
            "https://api.appstoreconnect.apple.com/v1/appScreenshotSets",
            headers=get_headers(),
            json={
                "data": {
                    "type": "appScreenshotSets",
                    "attributes": {"screenshotDisplayType": DISPLAY_TYPE},
                    "relationships": {
                        "appStoreVersionLocalization": {
                            "data": {"type": "appStoreVersionLocalizations", "id": ver_loc_id}
                        }
                    },
                }
            },
        )
        if r.status_code != 201:
            print(f"    Create screenshot set failed: {r.status_code} {r.text[:150]}")
            continue
        ss_set_id = r.json()["data"]["id"]
        print(f"    Created screenshot set: {ss_set_id}")

    success_count = 0
    for fname in png_files:
        png_path = os.path.join(ss_dir, fname)
        ok = upload_screenshot(ss_set_id, png_path)
        if ok:
            success_count += 1
            print(f"    OK: {fname} (1290x2796)")
        else:
            print(f"    FAIL: {fname}")

    print(f"  {apple_locale}: {success_count}/{len(png_files)} uploaded")

# ── Step 6: Set Copyright ────────────────────────────────────────────────────
print("\n=== Step 6: Set Copyright ===")
r = requests.patch(
    f"https://api.appstoreconnect.apple.com/v1/appStoreVersions/{version_id}",
    headers=get_headers(),
    json={
        "data": {
            "type": "appStoreVersions",
            "id": version_id,
            "attributes": {"copyright": "2026 maaker.ai"},
        }
    },
)
print(f"Copyright: {r.status_code}")

# ── Step 7: Content Rights Declaration ──────────────────────────────────────
print("\n=== Step 7: Content Rights Declaration ===")
r = requests.patch(
    f"https://api.appstoreconnect.apple.com/v1/apps/{ASC_APP_ID}",
    headers=get_headers(),
    json={
        "data": {
            "type": "apps",
            "id": ASC_APP_ID,
            "attributes": {"contentRightsDeclaration": "DOES_NOT_USE_THIRD_PARTY_CONTENT"},
        }
    },
)
print(f"contentRightsDeclaration: {r.status_code}")
if r.status_code not in (200, 204):
    print(f"  Response: {r.text[:200]}")

# ── Step 8: Territory Availability (exclude CHN) ─────────────────────────────
print("\n=== Step 8: Territory Availability ===")
r = requests.get(
    "https://api.appstoreconnect.apple.com/v1/territories?limit=200",
    headers=get_headers(),
)
r.raise_for_status()
all_terrs = r.json()["data"]
all_ids = [t["id"] for t in all_terrs]
print(f"Total territories: {len(all_ids)}")

excluded = {"CHN"}
included = []
relationship_data = []
for tid in all_ids:
    local_id = "${" + tid + "}"
    included.append({
        "type": "territoryAvailabilities",
        "id": local_id,
        "attributes": {"available": tid not in excluded},
        "relationships": {"territory": {"data": {"type": "territories", "id": tid}}},
    })
    relationship_data.append({"type": "territoryAvailabilities", "id": local_id})

r = requests.post(
    "https://api.appstoreconnect.apple.com/v2/appAvailabilities",
    headers=get_headers(),
    json={
        "data": {
            "type": "appAvailabilities",
            "attributes": {"availableInNewTerritories": True},
            "relationships": {
                "app": {"data": {"type": "apps", "id": ASC_APP_ID}},
                "territoryAvailabilities": {"data": relationship_data},
            },
        },
        "included": included,
    },
)
print(f"Territories: {r.status_code}")
if r.status_code not in (200, 201, 204):
    print(f"  Response: {r.text[:300]}")

# ── Step 9: Set Pricing (Free) ────────────────────────────────────────────────
print("\n=== Step 9: Set Pricing (Free) ===")
url = f"https://api.appstoreconnect.apple.com/v1/apps/{ASC_APP_ID}/appPricePoints?filter[territory]=USA&limit=200"
all_pts = []
while url:
    r = requests.get(url, headers=get_headers())
    r.raise_for_status()
    data = r.json()
    all_pts.extend(data.get("data", []))
    url = data.get("links", {}).get("next")

print(f"Price points loaded: {len(all_pts)}")
found = next((pt for pt in all_pts if str(pt["attributes"]["customerPrice"]) == "0.0"), None)

if found:
    price_point_id = found["id"]
    r = requests.post(
        "https://api.appstoreconnect.apple.com/v1/appPriceSchedules",
        headers=get_headers(),
        json={
            "data": {
                "type": "appPriceSchedules",
                "relationships": {
                    "app": {"data": {"type": "apps", "id": ASC_APP_ID}},
                    "baseTerritory": {"data": {"type": "territories", "id": "USA"}},
                    "manualPrices": {"data": [{"type": "appPrices", "id": "${price1}"}]},
                },
            },
            "included": [
                {
                    "type": "appPrices",
                    "id": "${price1}",
                    "attributes": {"startDate": None},
                    "relationships": {
                        "appPricePoint": {"data": {"type": "appPricePoints", "id": price_point_id}}
                    },
                }
            ],
        },
    )
    print(f"Set price free: {r.status_code}")
    if r.status_code not in (200, 201, 204):
        print(f"  Response: {r.text[:300]}")
else:
    print("  ERROR: Free price point not found!")

# ── Step 10: Age Rating ────────────────────────────────────────────────────────
print("\n=== Step 10: Age Rating ===")
# ageRatingDeclaration is on the appStoreVersion resource
r = requests.get(
    f"https://api.appstoreconnect.apple.com/v1/appStoreVersions/{version_id}?include=ageRatingDeclaration",
    headers=get_headers(),
)
r.raise_for_status()
included_data = r.json().get("included", [])
age_dec = next((x for x in included_data if x["type"] == "ageRatingDeclarations"), None)

if age_dec:
    rating_id = age_dec["id"]
    r = requests.patch(
        f"https://api.appstoreconnect.apple.com/v1/ageRatingDeclarations/{rating_id}",
        headers=get_headers(),
        json={
            "data": {
                "type": "ageRatingDeclarations",
                "id": rating_id,
                "attributes": {
                    "alcoholTobaccoOrDrugUseOrReferences": "NONE",
                    "contests": "NONE",
                    "gambling": False,
                    "gamblingSimulated": "NONE",
                    "horrorOrFearThemes": "NONE",
                    "matureOrSuggestiveThemes": "NONE",
                    "medicalOrTreatmentInformation": "NONE",
                    "profanityOrCrudeHumor": "NONE",
                    "sexualContentGraphicAndNudity": "NONE",
                    "sexualContentOrNudity": "NONE",
                    "violenceCartoonOrFantasy": "NONE",
                    "violenceRealistic": "NONE",
                    "violenceRealisticProlonged": "NONE",
                    "ageRatingOverride": None,
                    "koreaAgeRatingOverride": None,
                    "seventeenPlus": False,
                    "unrestrictedWebAccess": False,
                },
            }
        },
    )
    print(f"Age rating (4+): {r.status_code}")
    if r.status_code not in (200, 204):
        print(f"  Response: {r.text[:200]}")
else:
    print("  ageRatingDeclaration not found in included. Trying direct endpoint...")
    r = requests.get(
        f"https://api.appstoreconnect.apple.com/v1/appStoreVersions/{version_id}/relationships/ageRatingDeclaration",
        headers=get_headers(),
    )
    print(f"  relationships/ageRatingDeclaration: {r.status_code} {r.text[:200]}")

# ── Step 11: Associate Build ──────────────────────────────────────────────────
print("\n=== Step 11: Find and Associate Latest Build ===")
r = requests.get(
    f"https://api.appstoreconnect.apple.com/v1/apps/{ASC_APP_ID}/builds?limit=10",
    headers=get_headers(),
)
r.raise_for_status()
builds = r.json()["data"]
print(f"Builds found: {len(builds)}")
for b in builds:
    attrs = b["attributes"]
    print(f"  Build {attrs.get('version')} | state: {attrs.get('processingState')} | uploaded: {attrs.get('uploadedDate', '')[:10]}")

valid_build = None
for b in builds:
    if b["attributes"].get("processingState") == "VALID":
        valid_build = b
        break

target_build = valid_build or (builds[0] if builds else None)
if target_build:
    build_id = target_build["id"]
    build_version = target_build["attributes"]["version"]
    build_state = target_build["attributes"].get("processingState")
    print(f"\nAssociating build {build_version} (state={build_state}, id={build_id})...")
    r = requests.patch(
        f"https://api.appstoreconnect.apple.com/v1/appStoreVersions/{version_id}",
        headers=get_headers(),
        json={
            "data": {
                "type": "appStoreVersions",
                "id": version_id,
                "relationships": {
                    "build": {"data": {"type": "builds", "id": build_id}}
                },
            }
        },
    )
    print(f"Build association: {r.status_code}")
    if r.status_code not in (200, 204):
        print(f"  Response: {r.text[:200]}")
else:
    print("  No builds found!")

print("\n=== DONE ===")
print(f"App: Memento | ASC ID: {ASC_APP_ID}")
print(f"Version: {version_string} (id={version_id})")
print("All steps completed.")
