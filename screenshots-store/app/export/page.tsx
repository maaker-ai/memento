"use client";

const LOCALES = [
  "en", "zh-Hans", "zh-Hant", "ja", "ko", "de", "fr", "es", "ru", "it", "ar", "id",
] as const;

type Locale = (typeof LOCALES)[number];

const SLIDES = ["life", "wisdom", "settings", "paywall"] as const;
type Slide = (typeof SLIDES)[number];

const HEADLINES: Record<Slide, Record<Locale, string>> = {
  life: {
    en: "Visualize Your Life",
    "zh-Hans": "可视化你的人生",
    "zh-Hant": "可視化你的人生",
    ja: "人生を可視化する",
    ko: "당신의 삶을 시각화하세요",
    de: "Visualisiere dein Leben",
    fr: "Visualisez votre vie",
    es: "Visualiza tu vida",
    ru: "Визуализируйте свою жизнь",
    it: "Visualizza la tua vita",
    ar: "تصور حياتك",
    id: "Visualisasikan Hidupmu",
  },
  wisdom: {
    en: "Daily Stoic Wisdom",
    "zh-Hans": "每日斯多葛智慧",
    "zh-Hant": "每日斯多葛智慧",
    ja: "毎日のストア哲学",
    ko: "매일의 스토아 철학",
    de: "Tägliche stoische Weisheit",
    fr: "Sagesse stoïque quotidienne",
    es: "Sabiduría estoica diaria",
    ru: "Ежедневная мудрость стоиков",
    it: "Saggezza stoica quotidiana",
    ar: "حكمة رواقية يومية",
    id: "Kebijaksanaan Stoa Harian",
  },
  settings: {
    en: "Personalize Your Journey",
    "zh-Hans": "定制你的旅程",
    "zh-Hant": "定製你的旅程",
    ja: "旅をカスタマイズ",
    ko: "여정을 맞춤 설정하세요",
    de: "Personalisiere deine Reise",
    fr: "Personnalisez votre parcours",
    es: "Personaliza tu camino",
    ru: "Настройте свой путь",
    it: "Personalizza il tuo percorso",
    ar: "خصص رحلتك",
    id: "Personalisasi Perjalananmu",
  },
  paywall: {
    en: "Unlock Full Experience",
    "zh-Hans": "解锁完整体验",
    "zh-Hant": "解鎖完整體驗",
    ja: "フル体験をアンロック",
    ko: "전체 경험 잠금 해제",
    de: "Volles Erlebnis freischalten",
    fr: "Débloquez l'expérience complète",
    es: "Desbloquea la experiencia completa",
    ru: "Откройте полный доступ",
    it: "Sblocca l'esperienza completa",
    ar: "افتح التجربة الكاملة",
    id: "Buka Pengalaman Penuh",
  },
};

// iPhone 16 Pro device frame dimensions
const SCREEN_W = 1290;
const SCREEN_H = 2796;
const DEVICE_W = 940;
const DEVICE_H = 2040;
const DEVICE_RADIUS = 130;
const SCREEN_INSET = 16;
const INNER_RADIUS = DEVICE_RADIUS - SCREEN_INSET;

export default function ExportPage() {
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const locale = (searchParams?.get("locale") ?? "en") as Locale;
  const slide = (searchParams?.get("slide") ?? "life") as Slide;

  const headline = HEADLINES[slide][locale];
  const imgSrc = `/app-captures/${locale}/${slide}.png`;

  return (
    <div
      style={{
        width: SCREEN_W,
        height: SCREEN_H,
        background: "linear-gradient(170deg, #1A1510 0%, #0C0C0C 40%, #0A0A0F 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Cormorant Garamond', 'Georgia', serif",
      }}
    >
      {/* Subtle gold accent glow */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,165,116,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Headline */}
      <div
        style={{
          marginTop: 140,
          marginBottom: 60,
          textAlign: "center",
          paddingInline: 100,
        }}
      >
        <h1
          style={{
            fontSize: 108,
            fontWeight: 400,
            color: "#D4A574",
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: 2,
          }}
        >
          {headline}
        </h1>
      </div>

      {/* Device frame */}
      <div
        style={{
          width: DEVICE_W,
          height: DEVICE_H,
          borderRadius: DEVICE_RADIUS,
          background: "#1A1A1A",
          padding: SCREEN_INSET,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: INNER_RADIUS,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={`${slide} screenshot`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      </div>
    </div>
  );
}
