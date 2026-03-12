import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Filter, Package, LucideIcon } from "lucide-react-native";
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

const ORDERS = [
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
  {
    id: "8821",
    customer: "Mike B.",
    items: "1 item",
    total: "₦ 250,000",
    status: "Delivered",
    time: "1 day ago",
  },
  {
    id: "8820",
    customer: "Tola A.",
    items: "4 items",
    total: "₦ 120,000",
    status: "Paid",
    time: "1 day ago",
  },
];

const TABS = ["All", "Pending", "Paid", "Processing", "Delivered"];

export default function OrdersScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState("All");
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <VayvaBackground>
      <SafeAreaView className="flex-1">
        <View className="px-6 py-4">
          <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-2xl mb-4`}>
            Orders
          </Text>

        {/* Search */}
        <View className="flex-row gap-3 mb-6">
          <View
            className={`flex-1 h-12 border rounded-full flex-row items-center px-4 ${
              isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
            }`}
          >
            <Icon name={Search} size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />

            <TextInput
              placeholder="Search orders..."
              placeholderTextColor={
                isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)"
              }
              className={`flex-1 ml-2 ${isDark ? "text-white" : "text-black"}`}
            />
          </View>
          <TouchableOpacity
            className={`w-12 h-12 border rounded-full items-center justify-center ${
              isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
            }`}
          >
            <Icon name={Filter} size={20} color={isDark ? "rgba(255,255,255,0.6)" : "#1F2937"} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`mr-3 px-5 py-2 rounded-full border ${
                activeTab === tab
                  ? "bg-[#46EC13] border-[#46EC13]"
                  : isDark
                    ? "bg-transparent border-white/10"
                    : "bg-transparent border-black/10"
              }`}
            >
              <Text
                className={`font-bold text-sm ${
                  activeTab === tab ? "text-black" : isDark ? "text-white" : "text-black"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
      >
        {ORDERS.filter(
          (o) => activeTab === "All" || o.status === activeTab,
        ).map((order) => (
          <View
            key={order.id}
            className={`border rounded-2xl p-4 mb-3 flex-row justify-between items-start ${
              isDark ? "bg-[#0b141a]/40 border-white/5" : "bg-white/55 border-black/10"
            }`}
          >
            <View className="flex-row gap-4">
              <View
                className={`w-12 h-12 rounded-xl items-center justify-center ${
                  isDark ? "bg-white/5" : "bg-black/5"
                }`}
              >
                {/* The instruction seems to be for a different component or context,
                    as it refers to `tab.icon` and `tab.id` which are not present here.
                    Assuming the intent was to remove the ts-ignore for the Package icon
                    and potentially cast its name if it were a generic Icon component.
                    Since it's a direct import, the ts-ignore is removed. */}
                <Icon
                  name={Package}
                  size={20}
                  color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)"}
                />
              </View>
              <View>
                <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-base`}>
                  Order #{order.id}
                </Text>
                <Text className={`${isDark ? "text-white/70" : "text-black/70"} text-sm mt-0.5`}>
                  {order.customer}
                </Text>
                <View className="flex-row items-center mt-2 gap-2">
                  <View
                    className={`px-2 py-0.5 rounded-full ${
                      order.status === "Paid"
                        ? "bg-green-500/10"
                        : order.status === "Pending"
                          ? "bg-yellow-500/10"
                          : order.status === "Delivered"
                            ? "bg-blue-500/10"
                            : "bg-white/10"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        order.status === "Paid"
                          ? "text-green-400"
                          : order.status === "Pending"
                            ? "text-yellow-400"
                            : order.status === "Delivered"
                              ? "text-blue-400"
                              : "text-white"
                      }`}
                    >
                      {order.status}
                    </Text>
                  </View>
                  <Text className={`${isDark ? "text-white/30" : "text-black/40"} text-xs`}>
                    • {order.time}
                  </Text>
                </View>
              </View>
            </View>
            <View className="items-end">
              <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-base`}>
                {order.total}
              </Text>
              <Text className={`${isDark ? "text-white/30" : "text-black/40"} text-xs mt-1`}>
                {order.items}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      </SafeAreaView>
    </VayvaBackground>
  );
}
