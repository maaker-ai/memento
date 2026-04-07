import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { COLORS } from "../src/utils/constants";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from "../src/utils/purchases";

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

function CheckCircleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 11.08V12a10 10 0 11-5.93-9.14"
        stroke={COLORS.milestone}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 4L12 14.01l-3-3"
        stroke={COLORS.milestone}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [lifetimePackage, setLifetimePackage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const purchasingRef = useRef(false);

  const FEATURES = [
    t("paywall.featureFavorites"),
    t("paywall.featureMilestones"),
    t("paywall.featureSupport"),
  ];

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offering = await getOfferings();
      if (offering) {
        const lifetime = offering.lifetime;
        setLifetimePackage(lifetime ?? null);
      }
    } catch (e: any) {
      console.warn("Failed to load offerings:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (purchasingRef.current || !lifetimePackage) return;
    purchasingRef.current = true;
    setPurchasing(true);
    try {
      const success = await purchasePackage(lifetimePackage);
      if (success) {
        Alert.alert(t("paywall.purchaseSuccess"), t("paywall.purchaseSuccessMessage"), [
          { text: t("paywall.ok"), onPress: () => router.back() },
        ]);
      }
    } catch (e: any) {
      Alert.alert(t("paywall.purchaseFailed"), e.message || t("paywall.somethingWrong"));
    } finally {
      setPurchasing(false);
      purchasingRef.current = false;
    }
  };

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert(t("paywall.restored"), t("paywall.restoredMessage"), [
          { text: t("paywall.ok"), onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(t("paywall.noPurchase"), t("paywall.noPurchaseMessage"));
      }
    } catch (e: any) {
      Alert.alert(t("paywall.error"), e.message || t("paywall.failedRestore"));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Close Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: 60,
          right: 20,
          zIndex: 10,
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

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        {/* App Icon */}
        <Image
          source={require("../assets/icon.png")}
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            marginBottom: 24,
          }}
        />

        {/* Title */}
        <Text
          style={{
            fontSize: 36,
            color: "#E5E5E5",
            fontFamily: "Cormorant Garamond",
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          {t("paywall.title")}
        </Text>

        {/* Subtitle */}
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
          {t("paywall.subtitle")}
        </Text>

        {/* Features */}
        <View style={{ width: "100%", gap: 16, marginBottom: 48 }}>
          {FEATURES.map((feature, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <CheckCircleIcon />
              <Text
                style={{
                  fontSize: 16,
                  color: "#E5E5E5",
                  fontFamily: "Cormorant Garamond",
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Purchase Button - Gold Gradient */}
        {loading ? (
          <ActivityIndicator color={COLORS.milestone} />
        ) : (
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={purchasing || !lifetimePackage}
            style={{
              width: "100%",
              opacity: purchasing ? 0.6 : 1,
            }}
          >
            <LinearGradient
              colors={["#D4A574", "#C49464"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 56,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#D4A574",
              }}
            >
              {purchasing ? (
                <ActivityIndicator color="#0C0C0C" />
              ) : (
                <Text
                  style={{
                    fontSize: 22,
                    color: "#0C0C0C",
                    fontFamily: "CormorantGaramond-Light",
                  }}
                >
                  {lifetimePackage
                    ? t("paywall.unlockFor", { price: lifetimePackage.product.priceString })
                    : t("paywall.unlockDefault")}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Restore */}
        <TouchableOpacity
          onPress={handleRestore}
          disabled={restoring}
          style={{ marginTop: 16, paddingVertical: 8 }}
        >
          <Text
            style={{
              fontSize: 14,
              color: "#6E6E70",
              fontFamily: "Cormorant Garamond",
              textDecorationLine: "underline",
            }}
          >
            {restoring ? t("paywall.restoring") : t("paywall.restorePurchase")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
