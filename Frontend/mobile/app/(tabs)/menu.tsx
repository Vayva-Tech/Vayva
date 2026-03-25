/* eslint-disable */
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Settings,
  User,
  _LogOut,
  HelpCircle,
  FileText,
  LucideIcon,
} from "lucide-react-native";

import VayvaBackground from "../components/VayvaBackground";

const SUB_MENU = [
  { icon: User, label: "Profile" },
  { icon: Settings, label: "Store Settings" },
  { icon: FileText, label: "Policies" },
  { icon: HelpCircle, label: "Help & Support" },
];

import { router } from "expo-router";

const Icon = ({
  name: Component,
  size,
  color,
}: {
  name: LucideIcon;
  size: number;
  color: string;
}) => {
  return <Component size={size} color={color} />;
};

export default function MenuScreen(): React.JSX.Element {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <VayvaBackground>
      <SafeAreaView className="flex-1">
        <View className="px-6 py-4 mb-4">
          <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-2xl`}>
            Menu
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}>
          <View
            className={`rounded-2xl border overflow-hidden mb-6 ${
              isDark ? "bg-[#0b141a]/45 border-white/5" : "bg-white/60 border-black/10"
            }`}
          >
            <TouchableOpacity
              className={`flex-row items-center p-4 ${
                isDark ? "border-b border-white/5" : "border-b border-black/10"
              }`}
            >
              <View className="w-12 h-12 rounded-full bg-indigo-500 items-center justify-center mr-4">
                <Text className="text-white font-bold text-lg">JD</Text>
              </View>
              <View>
                <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-lg`}>
                  John Doe
                </Text>
                <Text className={`${isDark ? "text-white/50" : "text-black/55"} text-xs`}>
                  Admin • TechDepot
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View
            className={`rounded-2xl border overflow-hidden mb-6 ${
              isDark ? "bg-[#0b141a]/45 border-white/5" : "bg-white/60 border-black/10"
            }`}
          >
            {SUB_MENU.map((item, i) => (
              <TouchableOpacity
                key={i}
                className={`flex-row items-center p-4 last:border-0 ${
                  isDark
                    ? "border-b border-white/5 active:bg-white/5"
                    : "border-b border-black/10 active:bg-black/5"
                }`}
              >
                <Icon name={item.icon} size={24} color={isDark ? "#FFFFFF" : "#111827"} />
                <Text className={`${isDark ? "text-white" : "text-black"} ml-4 font-medium text-base`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            className={`flex-row items-center justify-center p-4 rounded-xl border ${
              isDark
                ? "border-red-500/20 bg-red-500/10 active:bg-red-500/20"
                : "border-red-500/20 bg-red-500/10 active:bg-red-500/20"
            }`}
          >
            <User size={20} color={isDark ? "#FFFFFF" : "#111827"} />

            <Text className="text-red-500 ml-2 font-bold">Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </VayvaBackground>
  );
}
