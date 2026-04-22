import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
  Pressable,
  Modal,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import i18n from "../../src/i18n";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import Svg, { Path, Rect, Circle, Line } from "react-native-svg";
import {
  loadSettings,
  saveBirthday,
  saveMilestones,
  saveLifeExpectancy,
} from "../../src/utils/storage";
import { COLORS } from "../../src/utils/constants";
import { Milestone } from "../../src/types";
import { MILESTONE_TEMPLATES, MilestoneTemplate } from "../../src/data/milestones";
import { restorePurchases, checkProStatus } from "../../src/utils/purchases";

function CalendarIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke="#6E6E70"
        strokeWidth={2}
      />
      <Path
        d="M16 2v4M8 2v4M3 10h18"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// SVG icon components for milestone templates
function GraduationCapIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 10l-10-5-10 5 10 5 10-5zM6 12v5c0 0 3 3 6 3s6-3 6-3v-5"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BriefcaseIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="7" width="20" height="14" rx="2" stroke="#6E6E70" strokeWidth={2} />
      <Path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#6E6E70" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function HeartIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BabyIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#6E6E70" strokeWidth={2} />
      <Path d="M9 9h.01M15 9h.01M9.5 15a3.5 3.5 0 005 0" stroke="#6E6E70" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function HomeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M9 22V12h6v10"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlaneIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function RocketIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3M22 2l-1 1M22 2s-5 2-10 7l-1.5 1.5a2.88 2.88 0 000 4L13 17c1.1 1.1 2.9 1.1 4 0L18.5 15.5C23 10.5 22 2 22 2z"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SunsetIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M17 18a5 5 0 00-10 0" stroke="#6E6E70" strokeWidth={2} strokeLinecap="round" />
      <Line x1="12" y1="9" x2="12" y2="2" stroke="#6E6E70" strokeWidth={2} strokeLinecap="round" />
      <Line x1="4.22" y1="10.22" x2="5.64" y2="11.64" stroke="#6E6E70" strokeWidth={2} strokeLinecap="round" />
      <Line x1="1" y1="18" x2="3" y2="18" stroke="#6E6E70" strokeWidth={2} strokeLinecap="round" />
      <Line x1="21" y1="18" x2="23" y2="18" stroke="#6E6E70" strokeWidth={2} strokeLinecap="round" />
      <Line x1="18.36" y1="11.64" x2="19.78" y2="10.22" stroke="#6E6E70" strokeWidth={2} strokeLinecap="round" />
      <Line x1="1" y1="22" x2="23" y2="22" stroke="#6E6E70" strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 5l-4 4-4-4" stroke="#6E6E70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CarIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.42V16h2"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="6.5" cy="16.5" r="2.5" stroke="#6E6E70" strokeWidth={2} />
      <Circle cx="16.5" cy="16.5" r="2.5" stroke="#6E6E70" strokeWidth={2} />
    </Svg>
  );
}

function DogIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5M8 14v.5M16 14v.5"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.25 16.25h1.5L12 17l-.75-.75z"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.42 11.247A13.152 13.152 0 004 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0112 5c.78 0 1.5.108 2.161.306"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BookOpenIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TrophyIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0012 0V2z"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StarIcon({ color }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={color || COLORS.milestone}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// Map icon names to components
const MILESTONE_ICON_MAP: Record<string, React.FC> = {
  "graduation-cap": GraduationCapIcon,
  "briefcase": BriefcaseIcon,
  "heart": HeartIcon,
  "baby": BabyIcon,
  "home": HomeIcon,
  "plane": PlaneIcon,
  "rocket": RocketIcon,
  "sunset": SunsetIcon,
  "car": CarIcon,
  "dog": DogIcon,
  "book-open": BookOpenIcon,
  "trophy": TrophyIcon,
};

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [birthday, setBirthday] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);
  const [birthdayPickerDate, setBirthdayPickerDate] = useState(new Date(1992, 0, 1));
  const [lifeExpectancy, setLifeExpectancy] = useState(80);
  const [restoringPurchase, setRestoringPurchase] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [pendingMilestoneTemplate, setPendingMilestoneTemplate] = useState<MilestoneTemplate | null>(null);
  const [showMilestoneDatePicker, setShowMilestoneDatePicker] = useState(false);
  const [milestonePickerDate, setMilestonePickerDate] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      loadSettings().then((settings) => {
        setBirthday(settings.birthday);
        setMilestones(settings.milestones);
        setLifeExpectancy(settings.lifeExpectancy ?? 80);
        if (settings.birthday) {
          const d = new Date(settings.birthday + "T00:00:00");
          if (!isNaN(d.getTime())) {
            setBirthdayPickerDate(d);
          }
        }
      });
      checkProStatus().then(setIsPro).catch(() => {});
    }, [])
  );

  // Map i18n language to BCP-47 locale for DateTimePicker
  const getPickerLocale = (): string => {
    const lang = i18n.language;
    const localeMap: Record<string, string> = {
      "zh-Hans": "zh-CN",
      "zh-Hant": "zh-TW",
      ja: "ja-JP",
      ko: "ko-KR",
      de: "de-DE",
      fr: "fr-FR",
      es: "es-ES",
      ru: "ru-RU",
      it: "it-IT",
      ar: "ar-SA",
      id: "id-ID",
      en: "en-US",
    };
    return localeMap[lang] || "en-US";
  };

  const formatBirthday = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const locale = getPickerLocale();
    return d.toLocaleDateString(locale, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatMilestoneDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const locale = getPickerLocale();
    return d.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleBirthdayPickerChange = async (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowBirthdayPicker(false);
    }
    if (selectedDate) {
      setBirthdayPickerDate(selectedDate);
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const d = String(selectedDate.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      await saveBirthday(dateStr);
      setBirthday(dateStr);
    }
  };

  const handleAddMilestone = (template: MilestoneTemplate) => {
    setPendingMilestoneTemplate(template);
    setMilestonePickerDate(new Date());
    setShowMilestoneDatePicker(true);
  };

  // Translate a stored milestone.name back through template lookup.
  // New milestones are saved with the translated name in current language;
  // legacy entries created before i18n keys existed still carry their
  // English template name (e.g. "Graduation"), which we match against
  // MILESTONE_TEMPLATES to recover the key and translate on-the-fly.
  const translateMilestoneName = (storedName: string): string => {
    const template = MILESTONE_TEMPLATES.find((tmpl) => tmpl.name === storedName);
    if (template) {
      return t(`milestones.${template.key}`);
    }
    return storedName;
  };

  const handleMilestoneDateChange = async (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowMilestoneDatePicker(false);
    }
    if (selectedDate && pendingMilestoneTemplate) {
      setMilestonePickerDate(selectedDate);
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const d = String(selectedDate.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      const newMilestone: Milestone = {
        id: Date.now().toString(),
        // Persist the translated name in current language so list display
        // shows the user's current-language version immediately, and legacy
        // code that reads `milestone.name` directly still works.
        name: t(`milestones.${pendingMilestoneTemplate.key}`),
        emoji: pendingMilestoneTemplate.emoji,
        icon: pendingMilestoneTemplate.icon,
        date: dateStr,
      };
      const updated = [...milestones, newMilestone];
      await saveMilestones(updated);
      setMilestones(updated);
    }
  };

  const handleRemoveMilestone = async (id: string) => {
    const updated = milestones.filter((m) => m.id !== id);
    await saveMilestones(updated);
    setMilestones(updated);
  };

  const confirmRemoveMilestone = (id: string, name: string) => {
    Alert.alert(
      t("settings.deleteMilestone"),
      t("settings.deleteMilestoneConfirm", { name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.delete"), style: "destructive", onPress: () => handleRemoveMilestone(id) },
      ]
    );
  };

  const handleRestorePurchase = async () => {
    if (restoringPurchase) return;
    setRestoringPurchase(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        setIsPro(true);
        Alert.alert(t("alerts.restored"), t("alerts.restoredMessage"));
      } else {
        Alert.alert(t("alerts.noPurchase"), t("alerts.noPurchaseMessage"));
      }
    } catch (e: any) {
      Alert.alert(t("alerts.error"), e.message || t("alerts.failedRestore"));
    } finally {
      setRestoringPurchase(false);
    }
  };

  const renderMilestoneIcon = (milestone: Milestone) => {
    // Try icon name first, then fall back to template name matching
    const iconName = milestone.icon;
    const IconComp = iconName ? MILESTONE_ICON_MAP[iconName] : undefined;

    // Fall back: find template by name and use its icon
    const fallbackTemplate = !IconComp
      ? MILESTONE_TEMPLATES.find((t) => t.name === milestone.name)
      : undefined;
    const FallbackComp = fallbackTemplate?.icon
      ? MILESTONE_ICON_MAP[fallbackTemplate.icon]
      : undefined;

    const FinalIcon = IconComp || FallbackComp;

    if (FinalIcon) {
      return (
        <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
          <FinalIcon />
        </View>
      );
    }
    // Ultimate fallback: gold dot
    return (
      <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: COLORS.milestone,
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: 100,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            fontSize: 32,
            color: "#E5E5E5",
            fontFamily: "Cormorant Garamond",
          }}
        >
          {t("settings.title")}
        </Text>

        {/* Birthday */}
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 11,
              color: COLORS.milestone,
              letterSpacing: 3,
              fontFamily: "Cormorant Garamond",
            }}
          >
            {t("settings.birthday")}
          </Text>
          <TouchableOpacity
            onPress={() => setShowBirthdayPicker(!showBirthdayPicker)}
            style={{
              backgroundColor: "#1A1A1A",
              borderRadius: 12,
              height: 52,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ fontSize: 15, color: "#E5E5E5", fontFamily: "Cormorant Garamond" }}>
              {birthday ? formatBirthday(birthday) : t("birthday.setBirthday")}
            </Text>
            <CalendarIcon />
          </TouchableOpacity>
          {showBirthdayPicker && (
            <View
              style={{
                backgroundColor: "#1A1A1A",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <DateTimePicker
                value={birthdayPickerDate}
                mode="date"
                display="spinner"
                onChange={handleBirthdayPickerChange}
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                locale={getPickerLocale()}
                textColor="#E5E5E5"
                themeVariant="dark"
              />
            </View>
          )}
        </View>

        {/* Life Expectancy */}
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 11,
              color: COLORS.milestone,
              letterSpacing: 3,
              fontFamily: "Cormorant Garamond",
            }}
          >
            {t("settings.lifeExpectancy")}
          </Text>
          <View
            style={{
              backgroundColor: "#1A1A1A",
              borderRadius: 12,
              padding: 16,
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 13, color: "#6E6E70", fontFamily: "Cormorant Garamond" }}>
                {t("settings.lifeExpectancyRange")}
              </Text>
              <Text
                style={{ fontSize: 15, color: "#E5E5E5", fontFamily: "Cormorant Garamond" }}
              >
                {lifeExpectancy} {t("settings.years")}
              </Text>
            </View>
            <Slider
              value={lifeExpectancy}
              minimumValue={60}
              maximumValue={100}
              step={1}
              minimumTrackTintColor={COLORS.milestone}
              maximumTrackTintColor="#2A2A2A"
              thumbTintColor={COLORS.milestone}
              onValueChange={(val) => setLifeExpectancy(Math.round(val))}
              onSlidingComplete={(val) => saveLifeExpectancy(Math.round(val))}
              style={{ marginHorizontal: -4, height: 40 }}
            />
          </View>
        </View>

        {/* Milestones */}
        <View style={{ gap: 8, marginTop: 4 }}>
          <Text
            style={{
              fontSize: 11,
              color: COLORS.milestone,
              letterSpacing: 3,
              fontFamily: "Cormorant Garamond",
            }}
          >
            {t("settings.milestones")}
          </Text>
          <View
            style={{
              backgroundColor: "#1A1A1A",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {milestones.map((m, idx) => {
              const displayName = translateMilestoneName(m.name);
              return (
              <TouchableOpacity
                key={m.id}
                onLongPress={() => confirmRemoveMilestone(m.id, displayName)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth:
                    idx < milestones.length - 1 ? 0.5 : 0,
                  borderBottomColor: "#2A2A2A",
                }}
              >
                {renderMilestoneIcon(m)}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, color: "#E5E5E5", fontFamily: "Cormorant Garamond" }}>
                    {displayName}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6E6E70", fontFamily: "Cormorant Garamond", marginTop: 2 }}>
                    {formatMilestoneDate(m.date)}
                  </Text>
                </View>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: COLORS.milestone,
                  }}
                />
              </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === "ios") {
                  const options = [
                    ...MILESTONE_TEMPLATES.map((tmpl) => t(`milestones.${tmpl.key}`)),
                    t("common.cancel"),
                  ];
                  ActionSheetIOS.showActionSheetWithOptions(
                    {
                      options,
                      cancelButtonIndex: options.length - 1,
                      title: t("settings.chooseMilestone"),
                    },
                    (buttonIndex) => {
                      if (buttonIndex < MILESTONE_TEMPLATES.length) {
                        handleAddMilestone(MILESTONE_TEMPLATES[buttonIndex]);
                      }
                    }
                  );
                } else {
                  Alert.alert(
                    t("settings.addMilestoneTitle"),
                    t("settings.chooseMilestone"),
                    [
                      ...MILESTONE_TEMPLATES.map((tmpl) => ({
                        text: t(`milestones.${tmpl.key}`),
                        onPress: () => handleAddMilestone(tmpl),
                      })),
                      { text: t("common.cancel"), style: "cancel" as const },
                    ]
                  );
                }
              }}
              style={{
                paddingVertical: 14,
                alignItems: "center",
                borderTopWidth: milestones.length > 0 ? 0.5 : 0,
                borderTopColor: "#2A2A2A",
              }}
            >
              <Text style={{ fontSize: 14, color: "#6E6E70", fontFamily: "Cormorant Garamond" }}>
                {t("settings.addMilestone")}
              </Text>
            </TouchableOpacity>
          </View>
          {showMilestoneDatePicker && pendingMilestoneTemplate && (
            <View
              style={{
                backgroundColor: "#1A1A1A",
                borderRadius: 12,
                overflow: "hidden",
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#E5E5E5",
                  fontFamily: "Cormorant Garamond",
                  textAlign: "center",
                  paddingTop: 12,
                  paddingHorizontal: 16,
                }}
              >
                {pendingMilestoneTemplate.name}
              </Text>
              <DateTimePicker
                value={milestonePickerDate}
                mode="date"
                display="spinner"
                onChange={(_event, date) => {
                  if (date) setMilestonePickerDate(date);
                }}
                locale={getPickerLocale()}
                textColor="#E5E5E5"
                themeVariant="dark"
              />
              <View style={{ flexDirection: "row", borderTopWidth: 0.5, borderTopColor: "#2A2A2A" }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowMilestoneDatePicker(false);
                    setPendingMilestoneTemplate(null);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#6E6E70", fontFamily: "Cormorant Garamond" }}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleMilestoneDateChange(null as any, milestonePickerDate);
                    setShowMilestoneDatePicker(false);
                    setPendingMilestoneTemplate(null);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#E5E5E5", fontFamily: "Cormorant Garamond" }}>
                    {t("settings.save")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* Long press hint */}
          {milestones.length > 0 && (
            <Text
              style={{
                fontSize: 10,
                color: "#4A4A4A",
                fontFamily: "Cormorant Garamond",
                textAlign: "center",
                marginTop: 2,
              }}
            >
              {t("settings.longPressToRemove")}
            </Text>
          )}
        </View>

        {/* Pro Status */}
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 11,
              color: COLORS.milestone,
              letterSpacing: 3,
              fontFamily: "Cormorant Garamond",
            }}
          >
            {t("settings.pro")}
          </Text>
          {isPro ? (
            <LinearGradient
              colors={["#1A1A1A", "#1F1810", "#1A1A1A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderWidth: 0.5,
                borderColor: "rgba(212, 165, 116, 0.3)",
              }}
            >
              <StarIcon />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, color: COLORS.milestone, fontFamily: "Cormorant Garamond" }}>
                  {t("settings.proActive")}
                </Text>
                <Text style={{ fontSize: 12, color: "#6E6E70", fontFamily: "Cormorant Garamond", marginTop: 2 }}>
                  {t("settings.proActiveSubtitle")}
                </Text>
              </View>
            </LinearGradient>
          ) : (
            <View>
              <Pressable
                onPress={() => router.push("/paywall")}
              >
                <LinearGradient
                  colors={["#D4A574", "#C49464", "#D4A574"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 52,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 16,
                    gap: 8,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#D4A574",
                  }}
                >
                  <StarIcon color="#0C0C0C" />
                  <Text style={{ fontSize: 15, color: "#0C0C0C", fontFamily: "Cormorant Garamond" }}>
                    {t("settings.upgradeToPro")}
                  </Text>
                </LinearGradient>
              </Pressable>
              <Text style={{ fontSize: 11, color: "#6E6E70", textAlign: "center", marginTop: 6, fontFamily: "Cormorant Garamond" }}>
                {t("settings.upgradeSubtitle")}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={{ gap: 8, paddingTop: 4 }}>
          {/* About */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert(t("settings.aboutTitle"), t("settings.aboutMessage"));
            }}
            style={{
              backgroundColor: "#1A1A1A",
              borderRadius: 12,
              height: 48,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ fontSize: 15, color: "#E5E5E5", fontFamily: "Cormorant Garamond" }}>
              {t("settings.about")}
            </Text>
          </TouchableOpacity>

          {/* Restore Purchase */}
          <TouchableOpacity
            onPress={handleRestorePurchase}
            disabled={restoringPurchase}
            style={{
              backgroundColor: "#1A1A1A",
              borderRadius: 12,
              height: 48,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              opacity: restoringPurchase ? 0.5 : 1,
            }}
          >
            <Text style={{ fontSize: 15, color: "#E5E5E5", fontFamily: "Cormorant Garamond" }}>
              {restoringPurchase ? t("settings.restoring") : t("settings.restorePurchase")}
            </Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 12, color: "#4A4A4A", textAlign: "center", marginTop: 4, fontFamily: "Cormorant Garamond" }}>
            {t("settings.version")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
