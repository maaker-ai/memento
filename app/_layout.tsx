import { useEffect, useState, useRef } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Animated, Text, Image, Platform, Easing } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { COLORS } from "../src/utils/constants";
import { initPurchases, checkProStatus } from "../src/utils/purchases";
import "../src/i18n";

// Prevent native splash from auto-hiding
if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    "Cormorant Garamond": require("@expo-google-fonts/cormorant-garamond/400Regular/CormorantGaramond_400Regular.ttf"),
    "CormorantGaramond-Light": require("@expo-google-fonts/cormorant-garamond/300Light/CormorantGaramond_300Light.ttf"),
    "CormorantGaramond-Medium": require("@expo-google-fonts/cormorant-garamond/500Medium/CormorantGaramond_500Medium.ttf"),
  });

  useEffect(() => {
    initPurchases()
      .then(() => checkProStatus())
      .catch((e) => {
        console.warn("RevenueCat init failed:", e.message);
      });
  }, []);

  // When fonts loaded, hide native splash and mark app ready
  useEffect(() => {
    if (fontsLoaded) {
      if (Platform.OS !== "web") {
        SplashScreen.hideAsync().catch(() => {});
      }
      setAppReady(true);
    }
  }, [fontsLoaded]);

  // Animate custom splash when app is ready
  useEffect(() => {
    if (appReady) {
      // Fade in + scale up logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // After a moment, fade out splash
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSplashDone(true);
      });
    }
  }, [appReady]);

  // Show nothing until fonts load (native splash covers this)
  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="favorites"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>

      {/* Custom animated splash overlay */}
      {!splashDone && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.background,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
            opacity: splashOpacity,
          }}
          pointerEvents={splashDone ? "none" : "auto"}
        >
          <Animated.View
            style={{
              alignItems: "center",
              gap: 20,
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
          >
            <Image
              source={require("../assets/icon.png")}
              style={{
                width: 88,
                height: 88,
                borderRadius: 22,
              }}
            />
            <Text
              style={{
                fontSize: 40,
                color: COLORS.milestone,
                fontFamily: "Cormorant Garamond",
                letterSpacing: 4,
              }}
            >
              MEMENTO
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </>
  );
}
