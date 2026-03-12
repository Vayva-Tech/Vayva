import React from "react";
import { View, Text, TextInput, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Package, LucideIcon } from "lucide-react-native";
import VayvaBackground from "../components/VayvaBackground";

const Icon = ({
  name: Component,
  size,
  color,
}: {
  name: LucideIcon;
  size: number;
  color: string;
}) => {
  const C = Component as React.ElementType;
  return <C size={size} color={color} />;
};

export default function CreateOrderScreen(): React.JSX.Element {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <VayvaBackground>
      <SafeAreaView className="flex-1">
        <View className="px-6 py-4 flex-row items-center justify-between">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            className={`w-10 h-10 rounded-full items-center justify-center border ${
              isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
            }`}
          >
            <Icon
              name={ArrowLeft}
              size={18}
              color={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"}
            />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-lg`}>
              Create Order
            </Text>
            <Text className={`${isDark ? "text-white/50" : "text-black/55"} text-xs`}>
              Quick capture — details later
            </Text>
          </View>

          <View className="w-10 h-10" />
        </View>

        <View className="px-6 mt-4">
          <View
            className={`border rounded-3xl p-5 ${
              isDark ? "bg-[#0b141a]/45 border-white/10" : "bg-white/60 border-black/10"
            }`}
          >
            <View className="flex-row items-center gap-3 mb-4">
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  isDark ? "bg-white/5" : "bg-black/5"
                }`}
              >
                <Icon
                  name={Package}
                  size={18}
                  color={isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)"}
                />
              </View>
              <View className="flex-1">
                <Text className={`${isDark ? "text-white" : "text-black"} font-bold`}>
                  Fast order
                </Text>
                <Text className={`${isDark ? "text-white/60" : "text-black/60"} text-xs`}>
                  Customer + amount is enough to get started.
                </Text>
              </View>
            </View>

            <Text className={`text-xs ${isDark ? "text-white/60" : "text-black/60"} uppercase font-bold mb-2`}>
              Customer
            </Text>
            <TextInput
              placeholder="Amaka O."
              placeholderTextColor={isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"}
              className={`border rounded-xl px-4 py-4 text-base mb-4 ${
                isDark
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-black/5 border-black/10 text-black"
              }`}
            />

            <Text className={`text-xs ${isDark ? "text-white/60" : "text-black/60"} uppercase font-bold mb-2`}>
              Amount
            </Text>
            <TextInput
              placeholder="₦ 45,000"
              keyboardType="numeric"
              placeholderTextColor={isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"}
              className={`border rounded-xl px-4 py-4 text-base ${
                isDark
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-black/5 border-black/10 text-black"
              }`}
            />

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Continue"
              className="bg-[#46EC13] rounded-full py-4 items-center mt-5 active:opacity-90 shadow-lg shadow-green-500/20"
            >
              <Text className="text-black font-bold text-lg">Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={() => router.back()}
              className="items-center mt-3"
            >
              <Text className={`${isDark ? "text-white/50" : "text-black/50"} text-sm`}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </VayvaBackground>
  );
}
