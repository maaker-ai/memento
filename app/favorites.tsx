import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Svg, { Path } from "react-native-svg";
import { COLORS } from "../src/utils/constants";
import { getFavoriteQuotes, toggleFavoriteQuote } from "../src/utils/storage";
import { quotes } from "../src/data/quotes";

function CloseIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [favoriteTexts, setFavoriteTexts] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      getFavoriteQuotes().then(setFavoriteTexts).catch(() => {});
    }, [])
  );

  const handleRemoveFavorite = useCallback(
    async (quoteText: string) => {
      await toggleFavoriteQuote(quoteText);
      const updated = await getFavoriteQuotes();
      setFavoriteTexts(updated);
    },
    []
  );

  const confirmRemove = useCallback(
    (quoteText: string) => {
      Alert.alert(
        t("favorites.removeTitle"),
        t("favorites.removeConfirm"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: () => handleRemoveFavorite(quoteText),
          },
        ]
      );
    },
    [t, handleRemoveFavorite]
  );

  // Map favorite texts to full Quote objects
  const favoriteQuotes = favoriteTexts
    .map((text) => quotes.find((q) => q.text === text))
    .filter(Boolean);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            color: "#E5E5E5",
            fontFamily: "Cormorant Garamond",
          }}
        >
          {t("favorites.title")}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#1A1A1A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      {favoriteQuotes.length === 0 ? (
        /* Empty state */
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 100,
          }}
        >
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
              stroke="#2A2A2A"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
          <Text
            style={{
              fontSize: 18,
              color: "#4A4A4A",
              fontFamily: "Cormorant Garamond",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            {t("favorites.empty")}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          {favoriteQuotes.map((quote, idx) => (
            <TouchableOpacity
              key={idx}
              onLongPress={() => confirmRemove(quote!.text)}
              activeOpacity={0.7}
              style={{
                backgroundColor: "#1A1A1A",
                borderRadius: 12,
                padding: 20,
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  color: COLORS.milestone,
                  fontFamily: "CormorantGaramond-Light",
                  lineHeight: 36,
                  height: 28,
                }}
              >
                {"\u201C"}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  color: "#E5E5E5",
                  fontFamily: "Cormorant Garamond",
                  lineHeight: 28,
                }}
              >
                {quote!.text}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#6E6E70",
                  fontFamily: "Cormorant Garamond",
                  marginTop: 4,
                }}
              >
                {t("wisdom.authorPrefix")} {quote!.author}
              </Text>
            </TouchableOpacity>
          ))}
          <Text
            style={{
              fontSize: 10,
              color: "#4A4A4A",
              fontFamily: "Cormorant Garamond",
              textAlign: "center",
              marginTop: 4,
            }}
          >
            {t("favorites.longPressHint")}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
