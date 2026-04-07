import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserSettings, Milestone } from "../types";

const SETTINGS_KEY = "memento_settings";

const DEFAULT_SETTINGS: UserSettings = {
  birthday: null,
  milestones: [],
  lifeExpectancy: 80,
  favoriteQuotes: [],
  dailyQuoteEnabled: false,
};

export async function loadSettings(): Promise<UserSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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

export async function toggleFavoriteQuote(quoteText: string): Promise<boolean> {
  const settings = await loadSettings();
  const favorites = settings.favoriteQuotes || [];
  const index = favorites.indexOf(quoteText);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(quoteText);
  }
  settings.favoriteQuotes = favorites;
  await saveSettings(settings);
  return index < 0; // returns true if now favorited
}

export async function getFavoriteQuotes(): Promise<string[]> {
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
