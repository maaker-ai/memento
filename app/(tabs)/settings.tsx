import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
  Switch,
  Pressable,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import i18n from "../../src/i18n";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import Svg, { Path, Rect } from "react-native-svg";
import {
  loadSettings,
  saveBirthday,
  saveMilestones,
  saveLifeExpectancy,
  saveDailyQuoteEnabled,
} from "../../src/utils/storage";
import { COLORS } from "../../src/utils/constants";
import { Milestone } from "../../src/types";
import { MILESTONE_TEMPLATES } from "../../src/data/milestones";
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


function GraduationIcon() {
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

function RingIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke="#6E6E70"
        strokeWidth={2}
        fill="none"
      />
      <Path
        d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        stroke="#6E6E70"
        strokeWidth={2}
        fill="none"
      />
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

const MILESTONE_ICON_MAP: Record<string, React.FC> = {
  Graduation: GraduationIcon,
  Married: RingIcon,
  "First Home": HomeIcon,
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
  const [dailyQuoteEnabled, setDailyQuoteEnabled] = useState(false);
  const [pendingMilestoneTemplate, setPendingMilestoneTemplate] = useState<(typeof MILESTONE_TEMPLATES)[0] | null>(null);
  const [showMilestoneDatePicker, setShowMilestoneDatePicker] = useState(false);
  const [milestonePickerDate, setMilestonePickerDate] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      loadSettings().then((settings) => {
        setBirthday(settings.birthday);
        setMilestones(settings.milestones);
        setLifeExpectancy(settings.lifeExpectancy ?? 80);
        setDailyQuoteEnabled(settings.dailyQuoteEnabled ?? false);
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

  const handleAddMilestone = (template: (typeof MILESTONE_TEMPLATES)[0]) => {
    setPendingMilestoneTemplate(template);
    setMilestonePickerDate(new Date());
    setShowMilestoneDatePicker(true);
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
        name: pendingMilestoneTemplate.name,
        emoji: pendingMilestoneTemplate.emoji,
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

  const handleToggleDailyQuote = async (value: boolean) => {
    setDailyQuoteEnabled(value);
    await saveDailyQuoteEnabled(value);
  };

  const renderMilestoneIcon = (milestone: Milestone) => {
    const IconComp = MILESTONE_ICON_MAP[milestone.name];
    if (IconComp) {
      return (
        <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
          <IconComp />
        </View>
      );
    }
    return (
      <Text style={{ fontSize: 20, marginRight: 12 }}>{milestone.emoji}</Text>
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
            {milestones.map((m, idx) => (
              <TouchableOpacity
                key={m.id}
                onLongPress={() => confirmRemoveMilestone(m.id, m.name)}
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
                <Text style={{ flex: 1, fontSize: 15, color: "#E5E5E5", fontFamily: "Cormorant Garamond" }}>
                  {m.name}
                </Text>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: COLORS.milestone,
                  }}
                />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === "ios") {
                  const options = [
                    ...MILESTONE_TEMPLATES.map((tmpl) => `${tmpl.emoji} ${tmpl.name}`),
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
                        text: `${tmpl.emoji} ${tmpl.name}`,
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
                {pendingMilestoneTemplate.emoji} {pendingMilestoneTemplate.name}
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
            /* Pro Active Card - warm gradient with gold border */
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
            /* Upgrade Button - gold gradient */
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

        {/* Notifications */}
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 11,
              color: COLORS.milestone,
              letterSpacing: 3,
              fontFamily: "Cormorant Garamond",
            }}
          >
            {t("settings.notifications")}
          </Text>
          <View
            style={{
              backgroundColor: "#1A1A1A",
              borderRadius: 12,
              minHeight: 52,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text style={{ fontSize: 15, color: "#E5E5E5", fontFamily: "Cormorant Garamond", flex: 1 }}>
              {t("settings.dailyQuote")}
            </Text>
            <Switch
              value={dailyQuoteEnabled}
              onValueChange={handleToggleDailyQuote}
              trackColor={{ false: "#2A2A2A", true: COLORS.milestone }}
              thumbColor="#FFFFFF"
              style={{ marginLeft: 12 }}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={{ gap: 8, paddingTop: 4 }}>
          {/* About */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Memento", "Version 1.0.0\nA life in weeks.\n\nMade with care.");
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
