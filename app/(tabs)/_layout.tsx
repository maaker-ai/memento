import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { COLORS } from "../../src/utils/constants";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

function LifeIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.5 12.572l-7.5 7.428-7.5-7.428a5.034 5.034 0 010-7.144 5.034 5.034 0 017.144 0l.356.356.356-.356a5.034 5.034 0 017.144 0 5.034 5.034 0 010 7.144z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M3 12h3l2-4 3 8 2-4h3"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function WisdomIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 19.5A2.5 2.5 0 016.5 17H20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} />
      <Path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
    </Svg>
  );
}

const TAB_ICONS: Record<string, React.FC<{ color: string }>> = {
  index: LifeIcon,
  wisdom: WisdomIcon,
  settings: SettingsIcon,
};

const TAB_LABEL_KEYS: Record<string, string> = {
  index: "tabs.life",
  wisdom: "tabs.wisdom",
  settings: "tabs.settings",
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);
  const { t } = useTranslation();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: bottomPadding,
        paddingHorizontal: 16,
        paddingTop: 8,
        backgroundColor: COLORS.background,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#1A1A1A",
          borderRadius: 32,
          borderWidth: 0.5,
          borderColor: "#2A2A2A",
          padding: 4,
          height: 56,
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const IconComponent = TAB_ICONS[route.name];
          const labelKey = TAB_LABEL_KEYS[route.name];
          const label = labelKey ? t(labelKey) : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 28,
                backgroundColor: isFocused ? "#FFFFFF" : "transparent",
                gap: 6,
                paddingHorizontal: 12,
              }}
            >
              {IconComponent && (
                <IconComponent
                  color={isFocused ? "#0C0C0C" : "#6E6E70"}
                />
              )}
              <Text
                style={{
                  fontSize: 11,
                  color: isFocused ? "#0C0C0C" : "#6E6E70",
                  letterSpacing: 1,
                  fontFamily: "Cormorant Garamond",
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="wisdom" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
