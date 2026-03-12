import React from "react";
import { View, Text, ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VayvaBackground from "../components/VayvaBackground";

export default function InboxScreen(): React.JSX.Element {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <VayvaBackground>
      <SafeAreaView className="flex-1">
        <View className="px-6 py-4">
          <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-2xl mb-2`}>
            Inbox
          </Text>
          <Text className={`${isDark ? "text-white/50" : "text-black/55"} text-sm`}>
            Messages and customer conversations.
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}>
          <View
            className={`border rounded-2xl p-4 ${
              isDark ? "bg-[#0b141a]/40 border-white/10" : "bg-white/60 border-black/10"
            }`}
          >
            <Text className={`${isDark ? "text-white/70" : "text-black/65"}`}>
              Coming next: conversation list, chat view, quick replies, and offline
              message queue.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </VayvaBackground>
  );
}
