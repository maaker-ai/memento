import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";

import en from "./locales/en.json";
import zhHans from "./locales/zh-Hans.json";
import zhHant from "./locales/zh-Hant.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import ru from "./locales/ru.json";
import it from "./locales/it.json";
import ar from "./locales/ar.json";
import id from "./locales/id.json";

const resources = {
  en: { translation: en },
  "zh-Hans": { translation: zhHans },
  "zh-Hant": { translation: zhHant },
  ja: { translation: ja },
  ko: { translation: ko },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  ru: { translation: ru },
  it: { translation: it },
  ar: { translation: ar },
  id: { translation: id },
};

function getDeviceLanguage(): string {
  try {
    const locales = getLocales();
    if (locales && locales.length > 0) {
      const locale = locales[0];
      const tag = locale.languageTag || "";
      // Handle Chinese variants
      if (locale.languageCode === "zh") {
        if (
          tag.includes("Hant") ||
          locale.regionCode === "TW" ||
          locale.regionCode === "HK"
        ) {
          return "zh-Hant";
        }
        return "zh-Hans";
      }
      // Check if we support the language
      if (locale.languageCode && locale.languageCode in resources) {
        return locale.languageCode;
      }
    }
  } catch (e) {
    console.warn("Failed to detect device language:", e);
  }
  return "en";
}

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
});

export default i18n;
