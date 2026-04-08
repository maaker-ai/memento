# What to Test — Memento v1.0.0 Build 9

## Changes Since Build 8

### Quotes Internationalization
- All 99 Stoic quotes now translated into 12 languages (en, zh-Hans, zh-Hant, ja, ko, de, fr, es, ru, it, ar, id)
- Author names use culturally appropriate transliterations
- Latin phrases (Memento mori, Amor fati) preserved as-is
- Favorites migrated from text-based to ID-based storage (backward compatible)

### IAP Configuration Fix
- Fixed RevenueCat iOS app bundle ID (was `top.dramavision.memento`, now `ai.maaker.memento`)
- Configured ASC API Key and Subscription Key on RevenueCat
- Created iOS product mapping (was only on Test Store)
- Apple IAP now `READY_TO_SUBMIT` with review screenshot and availability set

### Build Config
- Added `ITSAppUsesNonExemptEncryption=false` to skip export compliance prompt

## Test Focus

### Priority 1: Quote Internationalization
- [ ] Switch device to Chinese → Wisdom tab shows Chinese quotes and author names
- [ ] Switch to Japanese → quotes in Japanese
- [ ] Switch to Arabic → quotes in Arabic (RTL layout)
- [ ] Switch back to English → quotes in English
- [ ] Tap next arrow → new quote with fade animation, in current language
- [ ] Share quote → shared text is in current language

### Priority 2: Favorites After Migration
- [ ] Previously saved favorites still appear (migrated from text to ID)
- [ ] Save new quote → appears in Favorites page
- [ ] Switch language → same favorites still shown (by ID, not text)
- [ ] Long press to unfavorite → works

### Priority 3: Purchase Flow
- [ ] Settings > Upgrade to Pro → opens Paywall
- [ ] Paywall shows price from RevenueCat (not hardcoded)
- [ ] Tap purchase → Apple payment sheet appears (sandbox)
- [ ] Restore Purchase works

### Regression
- [ ] Life screen percentage and grid display correctly
- [ ] Birthday / Life Expectancy / Milestones editing works
- [ ] All milestone icons are vector SVG
