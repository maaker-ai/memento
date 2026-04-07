import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Share, Platform, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { getDailyQuote, getRandomQuote } from "../../src/data/quotes";
import { COLORS } from "../../src/utils/constants";
import { Quote } from "../../src/types";
import { toggleFavoriteQuote, getFavoriteQuotes } from "../../src/utils/storage";

function ShareIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        stroke={filled ? COLORS.milestone : "#6E6E70"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? COLORS.milestone : "none"}
      />
    </Svg>
  );
}

function NextIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BookmarkIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
        stroke="#6E6E70"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export default function WisdomScreen() {
  const [quote, setQuote] = useState<Quote>(getDailyQuote);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { t } = useTranslation();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getFavoriteQuotes().then(setFavorites).catch(() => {});
  }, []);

  const isFavorited = favorites.includes(quote.text);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `"${quote.text}"\n${t("wisdom.authorPrefix")} ${quote.author}\n\n${t("wisdom.via")}`,
      });
    } catch {}
  }, [quote, t]);

  const handleFavorite = useCallback(async () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await toggleFavoriteQuote(quote.text);
    const updated = await getFavoriteQuotes();
    setFavorites(updated);
  }, [quote]);

  const handleNext = useCallback(() => {
    // Fade out -> switch quote -> fade in
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setQuote(getRandomQuote());
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      edges={["top"]}
    >
      {/* Header with bookmark button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingHorizontal: 20,
          paddingTop: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/favorites")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BookmarkIcon />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
          paddingBottom: 100,
          gap: 24,
        }}
      >
        <Animated.View
          style={{
            alignItems: "center",
            gap: 24,
            opacity: fadeAnim,
          }}
        >
          <Text
            style={{
              fontSize: 72,
              color: COLORS.milestone,
              fontFamily: "CormorantGaramond-Light",
              lineHeight: 80,
              height: 56,
              textAlign: "center",
            }}
          >
            {"\u201C"}
          </Text>

          <Text
            style={{
              fontSize: 26,
              color: "#E5E5E5",
              fontFamily: "Cormorant Garamond",
              lineHeight: 39,
              textAlign: "center",
            }}
          >
            {quote.text}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: "#6E6E70",
              textAlign: "center",
              fontFamily: "Cormorant Garamond",
            }}
          >
            {t("wisdom.authorPrefix")} {quote.author}
          </Text>
        </Animated.View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 32,
            marginTop: 8,
          }}
        >
          <TouchableOpacity
            onPress={handleShare}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShareIcon />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleFavorite}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: isFavorited ? COLORS.milestone : "#2A2A2A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HeartIcon filled={isFavorited} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NextIcon />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
