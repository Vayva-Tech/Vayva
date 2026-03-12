import React from "react";
import { View, Text, ScrollView, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  ChevronRight,
  TrendingUp,
  Package,
  AlertTriangle,
  LucideIcon,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
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
  if (!Component) return null;
  const C = Component as React.ElementType;
  return <C size={size} color={color} />;
};

const METRICS = [
  {
    label: "Today's Revenue",
    value: "₦ 450,000",
    change: "+12%",
    icon: TrendingUp,
    color: "#46EC13",
    bg: "bg-[#46EC13]/10",
  },
  {
    label: "New Orders",
    value: "24",
    change: "+5",
    icon: Package,
    color: "#60a5fa",
    bg: "bg-blue-400/10",
  },
];

const ALERTS = [
  {
    id: 1,
    title: "Approval Needed",
    desc: "WhatsApp AI suggests refund for Order #8821",
    type: "warning",
  },
  {
    id: 2,
    title: "Payout Failed",
    desc: "Bank rejected transfer of ₦150k",
    type: "danger",
  },
];

const RECENT_ORDERS = [
  {
    id: "8824",
    customer: "Amaka O.",
    items: "2 items",
    total: "₦ 45,000",
    status: "Paid",
    time: "10 min ago",
  },
  {
    id: "8823",
    customer: "John D.",
    items: "1 item",
    total: "₦ 12,500",
    status: "Pending",
    time: "1 hour ago",
  },
  {
    id: "8822",
    customer: "Sarah K.",
    items: "3 items",
    total: "₦ 85,000",
    status: "Processing",
    time: "2 hours ago",
  },
];

export default function HomeScreen(): React.JSX.Element {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <VayvaBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 py-4">
            <View className="flex-row items-center gap-3">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center border ${
                  isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"
                }`}
              >
                <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-lg`}>
                  T
                </Text>
              </View>
              <View>
                <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-lg`}>
                  TechDepot
                </Text>
                <Text className={`${isDark ? "text-white/50" : "text-black/50"} text-xs`}>
                  Lagos, NG
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className={`w-10 h-10 rounded-full items-center justify-center border ${
                isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/10"
              }`}
            >
              <Icon name={Bell} size={24} color={isDark ? "#FF6347" : "#ef4444"} />
              <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </TouchableOpacity>
          </View>

        {/* Metrics Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          className="mt-4"
        >
          {METRICS.map((m, i) => (
            <View
              key={i}
              className={`w-[160px] h-[100px] rounded-2xl p-4 border justify-between ${
                isDark ? "bg-[#0b141a]/40 border-white/5" : "bg-white/55 border-black/10"
              }`}
            >
              <View className="flex-row justify-between items-start">
                <View
                  className={`w-8 h-8 rounded-full ${m.bg} items-center justify-center`}
                >
                  <Icon name={m.icon} size={16} color={m.color} />
                </View>
                <View className={`${isDark ? "bg-white/5" : "bg-black/5"} px-2 py-0.5 rounded-full`}>
                  <Text className="text-[#46EC13] text-[10px] font-bold">
                    {m.change}
                  </Text>
                </View>
              </View>
              <View>
                <Text
                  className={`${isDark ? "text-white/40" : "text-black/45"} text-[10px] uppercase tracking-wider font-bold`}
                >
                  {m.label}
                </Text>
                <Text className={`${isDark ? "text-white" : "text-black"} text-lg font-bold`}>
                  {m.value}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Alerts */}
        <View className="px-6 mt-8">
          <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-lg mb-4`}>
            Action Required
          </Text>
          {ALERTS.map((alert) => (
            <BlurView
              key={alert.id}
              intensity={10}
              tint={isDark ? "dark" : "light"}
              className="flex-row items-center gap-4 p-4 rounded-2xl border border-white/10 mb-3 overflow-hidden"
            >
              <View
                className={`w-10 h-10 rounded-full ${alert.type === "danger" ? "bg-red-500/10" : "bg-orange-500/10"} items-center justify-center`}
              >
                <Icon
                  name={AlertTriangle}
                  size={20}
                  color={alert.type === "danger" ? "#ef4444" : "#f97316"}
                />
              </View>
              <View className="flex-1">
                <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-sm`}>
                  {alert.title}
                </Text>
                <Text className={`${isDark ? "text-white/60" : "text-black/60"} text-xs`} numberOfLines={1}>
                  {alert.desc}
                </Text>
              </View>
              <Icon
                name={ChevronRight}
                size={16}
                color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"}
              />
            </BlurView>
          ))}
        </View>

        {/* Recent Orders */}
        <View className="px-6 mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-lg`}>
              Recent Orders
            </Text>
            <TouchableOpacity>
              <Text className="text-[#46EC13] text-sm font-bold">View All</Text>
            </TouchableOpacity>
          </View>

          {RECENT_ORDERS.map((order) => (
            <View
              key={order.id}
              className={`border rounded-2xl p-4 mb-3 flex-row justify-between items-center ${
                isDark ? "bg-[#0b141a]/40 border-white/5" : "bg-white/55 border-black/10"
              }`}
            >
              <View className="flex-row gap-4 items-center">
                <View
                  className={`w-12 h-12 rounded-xl items-center justify-center ${
                    isDark ? "bg-white/5" : "bg-black/5"
                  }`}
                >
                  <Icon
                    name={Package}
                    size={20}
                    color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)"}
                  />
                </View>
                <View>
                  <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-base`}>
                    #{order.id} • {order.customer}
                  </Text>
                  <Text className={`${isDark ? "text-white/50" : "text-black/50"} text-xs`}>
                    {order.items} • {order.time}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-base`}>
                  {order.total}
                </Text>
                <View
                  className={`px-2 py-0.5 rounded-full mt-1 ${
                    order.status === "Paid"
                      ? "bg-green-500/10"
                      : order.status === "Pending"
                        ? "bg-yellow-500/10"
                        : "bg-blue-500/10"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      order.status === "Paid"
                        ? "text-green-400"
                        : order.status === "Pending"
                          ? "text-yellow-400"
                          : "text-blue-400"
                    }`}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        </ScrollView>
      </SafeAreaView>
    </VayvaBackground>
  );
}
