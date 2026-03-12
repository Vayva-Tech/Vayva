import React from "react";
import { View, Text, ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, CreditCard, Truck, LucideIcon } from "lucide-react-native";
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

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Payment Received",
    desc: "Order #8824 was paid successfully.",
    time: "10m",
    type: "payment",
  },
  {
    id: 2,
    title: "New Order",
    desc: "You have a new order from Amaka.",
    time: "1h",
    type: "order",
  },
  {
    id: 3,
    title: "Delivery Updated",
    desc: "Rider is on the way to pick up #8822.",
    time: "2h",
    type: "delivery",
  },
];

export default function NotificationsScreen(): React.JSX.Element {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <VayvaBackground>
      <SafeAreaView className="flex-1">
        <View className="px-6 py-4">
          <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-2xl mb-6`}>
            Alerts
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}>
          {NOTIFICATIONS.map((n) => (
            <View
              key={n.id}
              className={`flex-row gap-4 mb-6 pb-6 last:border-0 border-b ${
                isDark ? "border-white/5" : "border-black/10"
              }`}
            >
              <View
                className={`w-10 h-10 rounded-full items-center justify-center border ${
                  isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                }`}
              >
                {n.type === "payment" ? (
                  <Icon name={CreditCard} size={18} color="#46EC13" />
                ) : n.type === "delivery" ? (
                  <Icon name={Truck} size={18} color="#3b82f6" />
                ) : (
                  <Icon name={Bell} size={18} color="#f59e0b" />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between mb-1">
                  <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-base`}>
                    {n.title}
                  </Text>
                  <Text className={`${isDark ? "text-white/30" : "text-black/40"} text-xs`}>
                    {n.time}
                  </Text>
                </View>
                <Text className={`${isDark ? "text-white/60" : "text-black/60"} text-sm leading-5`}>
                  {n.desc}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </VayvaBackground>
  );
}
