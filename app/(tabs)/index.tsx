import React, { useCallback, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import LifeGrid from "../../src/components/LifeGrid";
import BirthdayPicker from "../../src/components/BirthdayPicker";
import { loadSettings, saveBirthday } from "../../src/utils/storage";
import { COLORS } from "../../src/utils/constants";
import { getLifeProgress, getRemainingWeeks } from "../../src/utils/date";
import { Milestone } from "../../src/types";

export default function LifeScreen() {
  const { t } = useTranslation();
  const [birthday, setBirthday] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const settings = await loadSettings();
    setBirthday(settings.birthday);
    setMilestones(settings.milestones);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleBirthdaySave = async (date: string) => {
    await saveBirthday(date);
    setBirthday(date);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: COLORS.textSecondary, fontSize: 16, fontFamily: "Cormorant Garamond" }}>
            {t("life.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!birthday) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <BirthdayPicker onSave={handleBirthdaySave} />
      </SafeAreaView>
    );
  }

  const progress = getLifeProgress(birthday);
  const remaining = getRemainingWeeks(birthday);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 28,
          paddingBottom: 100,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 11,
            color: "#4A4A4A",
            textAlign: "center",
            letterSpacing: 4,
            fontFamily: "Cormorant Garamond",
          }}
        >
          MEMENTO MORI
        </Text>

        <View style={{ alignItems: "center", gap: 4 }}>
          <Text
            style={{
              fontSize: 56,
              fontWeight: "300",
              color: "#E5E5E5",
              fontFamily: "Cormorant Garamond",
              lineHeight: 60,
            }}
          >
            {progress.toFixed(1)}%
          </Text>
          <Text style={{ fontSize: 14, color: "#6E6E70", fontFamily: "Cormorant Garamond" }}>
            {t("life.lived")}
          </Text>
        </View>

        <LifeGrid birthday={birthday} milestones={milestones} />

        <Text style={{ fontSize: 13, color: "#6E6E70", textAlign: "center", fontFamily: "Cormorant Garamond" }}>
          {t("life.weeksRemaining", { count: remaining.toLocaleString() })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
