import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserSettings, Milestone } from "../types";
import { QUOTE_TEXTS_FOR_MIGRATION } from "../data/quotes";

const SETTINGS_KEY = "memento_settings";
const MIGRATION_KEY = "memento_favorites_migrated";

const DEFAULT_SETTINGS: UserSettings = {
  birthday: null,
  milestones: [],
  lifeExpectancy: 80,
  favoriteQuotes: [],
  dailyQuoteEnabled: false,
};

/**
 * Migrate old text-based favoriteQuotes to id-based.
 * Runs once, then sets a flag so it never runs again.
 */
async function migrateFavoritesIfNeeded(settings: UserSettings): Promise<UserSettings> {
  const migrated = await AsyncStorage.getItem(MIGRATION_KEY);
  if (migrated === "true") return settings;

  // favorites may be string[] (old format) or number[] (new format) from raw JSON
  const favorites = settings.favoriteQuotes as unknown[];
  if (!favorites || favorites.length === 0) {
    await AsyncStorage.setItem(MIGRATION_KEY, "true");
    return settings;
  }

  // Check if already migrated (all numbers)
  if (favorites.every((item) => typeof item === "number")) {
    await AsyncStorage.setItem(MIGRATION_KEY, "true");
    return settings;
  }

  // Build reverse lookup: text -> id
  const textToId = new Map<string, number>();
  for (const [idStr, text] of Object.entries(QUOTE_TEXTS_FOR_MIGRATION)) {
    textToId.set(text, Number(idStr));
  }

  // Convert text-based favorites to id-based
  const newFavorites: number[] = [];
  for (const item of favorites) {
    if (typeof item === "number") {
      newFavorites.push(item);
    } else if (typeof item === "string") {
      const id = textToId.get(item);
      if (id !== undefined) {
        newFavorites.push(id);
      }
      // If text doesn't match any known quote, silently drop it
    }
  }

  settings.favoriteQuotes = newFavorites;
  await saveSettings(settings);
  await AsyncStorage.setItem(MIGRATION_KEY, "true");
  return settings;
}

export async function loadSettings(): Promise<UserSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  return migrateFavoritesIfNeeded(settings);
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function saveBirthday(birthday: string): Promise<void> {
  const settings = await loadSettings();
  settings.birthday = birthday;
  await saveSettings(settings);
}

export async function saveMilestones(milestones: Milestone[]): Promise<void> {
  const settings = await loadSettings();
  settings.milestones = milestones;
  await saveSettings(settings);
}

export async function saveLifeExpectancy(lifeExpectancy: number): Promise<void> {
  const settings = await loadSettings();
  settings.lifeExpectancy = lifeExpectancy;
  await saveSettings(settings);
}

export async function toggleFavoriteQuote(quoteId: number): Promise<boolean> {
  const settings = await loadSettings();
  const favorites = settings.favoriteQuotes || [];
  const index = favorites.indexOf(quoteId);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(quoteId);
  }
  settings.favoriteQuotes = favorites;
  await saveSettings(settings);
  return index < 0; // returns true if now favorited
}

export async function getFavoriteQuotes(): Promise<number[]> {
  const settings = await loadSettings();
  return settings.favoriteQuotes || [];
}

export async function saveDailyQuoteEnabled(enabled: boolean): Promise<void> {
  const settings = await loadSettings();
  settings.dailyQuoteEnabled = enabled;
  await saveSettings(settings);
}

export async function getDailyQuoteEnabled(): Promise<boolean> {
  const settings = await loadSettings();
  return settings.dailyQuoteEnabled ?? false;
}
