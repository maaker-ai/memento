# What to Test — Memento v1.0.0 Build 7

## Changes Since Last Build

### New Features
- **Favorites page**: Tap bookmark icon on Wisdom screen to view saved quotes
- **Milestone dates visible**: Each milestone now shows its date below the name
- **Quote animation**: Smooth fade transition when switching quotes

### Bug Fixes
- Life screen now updates when life expectancy is changed in Settings
- Birthday editing uses native iOS date picker (was text input)
- Milestone date selection uses native iOS date picker (was Alert.prompt)
- "Upgrade to Pro" button now works (was unresponsive)
- Daily Quote toggle removed (was non-functional)
- All milestone icons are now vector SVG (was emoji)
- About dialog properly localized in all 12 languages
- Purchase success shows confirmation alert before dismissing

### UX Improvements
- "Long press to remove" hint below milestones
- Life grid rows adjust to match life expectancy setting (60-100)

## Test Checklist

### Life Screen
- [ ] Set life expectancy to 100 in Settings → Life screen percentage and grid update
- [ ] Birthday onboarding flow with native date picker

### Wisdom Screen
- [ ] Tap heart to favorite → gold fill
- [ ] Tap bookmark icon (top right) → opens Favorites page
- [ ] Favorites page shows saved quotes
- [ ] Long press quote in Favorites to unfavorite
- [ ] Tap next arrow → smooth fade animation
- [ ] Share button works

### Settings
- [ ] Birthday: tap → native date spinner appears
- [ ] Life Expectancy: slider works without conflicts
- [ ] Milestones: each shows date below name
- [ ] Add Milestone → template list → date picker → saved
- [ ] Long press milestone → delete confirmation
- [ ] "Long press to remove" hint visible
- [ ] Upgrade to Pro → opens Paywall
- [ ] About → shows localized info
- [ ] Restore Purchase → proper response

### Paywall
- [ ] Purchase button shows price
- [ ] Purchase success → "Welcome to Pro!" alert
- [ ] Close button works

### i18n
- [ ] Switch device to Chinese/Japanese → all text localized
