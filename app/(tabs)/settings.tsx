import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActionSheetIOS,
  Platform,
  Switch,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
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
  const [editingBirthday, setEditingBirthday] = useState(false);
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState(80);
  const [restoringPurchase, setRestoringPurchase] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [dailyQuoteEnabled, setDailyQuoteEnabled] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSettings().then((settings) => {
        setBirthday(settings.birthday);
        setMilestones(settings.milestones);
        setLifeExpectancy(settings.lifeExpectancy ?? 80);
        setDailyQuoteEnabled(settings.dailyQuoteEnabled ?? false);
        if (settings.birthday) {
          const parts = settings.birthday.split("-");
          setBirthYear(parts[0]);
          setBirthMonth(parts[1]);
          setBirthDay(parts[2]);
        }
      });
      checkProStatus().then(setIsPro).catch(() => {});
    }, [])
  );

  const formatBirthday = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSaveBirthday = async () => {
    const y = parseInt(birthYear);
    const m = parseInt(birthMonth);
    const d = parseInt(birthDay);
    if (
      isNaN(y) ||
      isNaN(m) ||
      isNaN(d) ||
      y < 1920 ||
      m < 1 ||
      m > 12 ||
      d < 1 ||
      d > 31
    ) {
      Alert.alert(t("birthday.invalidDate"), t("birthday.invalidDateMessage"));
      return;
    }
    const dateStr = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;
    await saveBirthday(dateStr);
    setBirthday(dateStr);
    setEditingBirthday(false);
  };

  const handleAddMilestone = (template: (typeof MILESTONE_TEMPLATES)[0]) => {
    if (Platform.OS === "ios") {
      Alert.prompt(
        `${template.emoji} ${template.name}`,
        t("settings.enterDate"),
        async (dateStr) => {
          if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            Alert.alert(t("birthday.invalidDate"), t("settings.invalidDateFormat"));
            return;
          }
          const newMilestone: Milestone = {
            id: Date.now().toString(),
            name: template.name,
            emoji: template.emoji,
            date: dateStr,
          };
          const updated = [...milestones, newMilestone];
          await saveMilestones(updated);
          setMilestones(updated);
        },
        "plain-text"
      );
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
          {!editingBirthday ? (
            <TouchableOpacity
              onPress={() => setEditingBirthday(true)}
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
          ) : (
            <View
              style={{
                backgroundColor: "#1A1A1A",
                borderRadius: 12,
                padding: 16,
                gap: 12,
              }}
            >
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: "#6E6E70", textAlign: "center", marginBottom: 6, letterSpacing: 2, fontFamily: "Cormorant Garamond" }}>
                    YYYY
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: COLORS.background,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      fontSize: 20,
                      color: "#E5E5E5",
                      textAlign: "center",
                      borderWidth: 1,
                      borderColor: birthYear ? COLORS.milestone : "#2A2A2A",
                    }}
                    placeholder="1992"
                    placeholderTextColor="#4A4A4A"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={birthYear}
                    onChangeText={(text) => setBirthYear(text.replace(/[^0-9]/g, ""))}
                    returnKeyType="next"
                    autoCorrect={false}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: "#6E6E70", textAlign: "center", marginBottom: 6, letterSpacing: 2, fontFamily: "Cormorant Garamond" }}>
                    MM
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: COLORS.background,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      fontSize: 20,
                      color: "#E5E5E5",
                      textAlign: "center",
                      borderWidth: 1,
                      borderColor: birthMonth ? COLORS.milestone : "#2A2A2A",
                    }}
                    placeholder="03"
                    placeholderTextColor="#4A4A4A"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={birthMonth}
                    onChangeText={(text) => setBirthMonth(text.replace(/[^0-9]/g, ""))}
                    returnKeyType="next"
                    autoCorrect={false}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: "#6E6E70", textAlign: "center", marginBottom: 6, letterSpacing: 2, fontFamily: "Cormorant Garamond" }}>
                    DD
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: COLORS.background,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      fontSize: 20,
                      color: "#E5E5E5",
                      textAlign: "center",
                      borderWidth: 1,
                      borderColor: birthDay ? COLORS.milestone : "#2A2A2A",
                    }}
                    placeholder="15"
                    placeholderTextColor="#4A4A4A"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={birthDay}
                    onChangeText={(text) => setBirthDay(text.replace(/[^0-9]/g, ""))}
                    returnKeyType="done"
                    onSubmitEditing={handleSaveBirthday}
                    autoCorrect={false}
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setEditingBirthday(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    alignItems: "center",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#2A2A2A",
                  }}
                >
                  <Text style={{ color: "#6E6E70", fontFamily: "Cormorant Garamond", fontSize: 16 }}>
                    {t("settings.cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveBirthday}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    alignItems: "center",
                    borderRadius: 8,
                    backgroundColor: "#E5E5E5",
                  }}
                >
                  <Text
                    style={{ color: COLORS.background, fontFamily: "Cormorant Garamond", fontSize: 16 }}
                  >
                    {t("settings.save")}
                  </Text>
                </TouchableOpacity>
              </View>
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
            <TouchableOpacity
              onPress={() => router.push("/paywall")}
              style={{ overflow: "hidden", borderRadius: 12 }}
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
              <Text style={{ fontSize: 11, color: "#6E6E70", textAlign: "center", marginTop: 6, fontFamily: "Cormorant Garamond" }}>
                {t("settings.upgradeSubtitle")}
              </Text>
            </TouchableOpacity>
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
              height: 52,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ fontSize: 15, color: "#E5E5E5", fontFamily: "Cormorant Garamond" }}>
              {t("settings.dailyQuote")}
            </Text>
            <Switch
              value={dailyQuoteEnabled}
              onValueChange={handleToggleDailyQuote}
              trackColor={{ false: "#2A2A2A", true: COLORS.milestone }}
              thumbColor="#FFFFFF"
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
