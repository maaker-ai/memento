import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS } from "../utils/constants";

interface BirthdayPickerProps {
  onSave: (birthday: string) => void;
}

export default function BirthdayPicker({ onSave }: BirthdayPickerProps) {
  const { t } = useTranslation();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const isValid = () => {
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
    if (y < 1920 || y > new Date().getFullYear()) return false;
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    return true;
  };

  const handleSave = () => {
    if (!isValid()) return;
    const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    onSave(dateStr);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: "center" }}
    >
      <View style={{ paddingHorizontal: 32 }}>
        {/* MEMENTO MORI header */}
        <Text
          style={{
            fontSize: 11,
            color: "#4A4A4A",
            textAlign: "center",
            letterSpacing: 4,
            fontFamily: "Cormorant Garamond",
            marginBottom: 16,
          }}
        >
          MEMENTO MORI
        </Text>

        <Text
          style={{
            fontSize: 42,
            color: COLORS.text,
            textAlign: "center",
            marginBottom: 12,
            fontFamily: "CormorantGaramond-Light",
          }}
        >
          {t("birthday.title")}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#6E6E70",
            textAlign: "center",
            marginBottom: 40,
            lineHeight: 24,
            fontFamily: "Cormorant Garamond",
          }}
        >
          {t("birthday.subtitle")}
        </Text>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 11,
                color: "#6E6E70",
                marginBottom: 8,
                textAlign: "center",
                letterSpacing: 2,
                fontFamily: "Cormorant Garamond",
              }}
            >
              {t("birthday.year")}
            </Text>
            <TextInput
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 24,
                color: COLORS.text,
                textAlign: "center",
                borderWidth: 1,
                borderColor: COLORS.cardBorder,
                fontFamily: "CormorantGaramond-Light",
              }}
              placeholder="1990"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              value={year}
              onChangeText={setYear}
              returnKeyType="next"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 11,
                color: "#6E6E70",
                marginBottom: 8,
                textAlign: "center",
                letterSpacing: 2,
                fontFamily: "Cormorant Garamond",
              }}
            >
              {t("birthday.month")}
            </Text>
            <TextInput
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 24,
                color: COLORS.text,
                textAlign: "center",
                borderWidth: 1,
                borderColor: COLORS.cardBorder,
                fontFamily: "CormorantGaramond-Light",
              }}
              placeholder="06"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={2}
              value={month}
              onChangeText={setMonth}
              returnKeyType="next"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 11,
                color: "#6E6E70",
                marginBottom: 8,
                textAlign: "center",
                letterSpacing: 2,
                fontFamily: "Cormorant Garamond",
              }}
            >
              {t("birthday.day")}
            </Text>
            <TextInput
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 24,
                color: COLORS.text,
                textAlign: "center",
                borderWidth: 1,
                borderColor: COLORS.cardBorder,
                fontFamily: "CormorantGaramond-Light",
              }}
              placeholder="15"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={2}
              value={day}
              onChangeText={setDay}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#E5E5E5",
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: "center",
            opacity: isValid() ? 1 : 0.3,
          }}
          onPress={handleSave}
          disabled={!isValid()}
        >
          <Text
            style={{
              fontSize: 20,
              color: COLORS.background,
              fontFamily: "Cormorant Garamond",
            }}
          >
            {t("birthday.startJourney")}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
