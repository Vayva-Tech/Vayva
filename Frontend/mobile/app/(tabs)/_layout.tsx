import React from "react";
import { Tabs, router } from "expo-router";
import { View, Text, useColorScheme, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home,
  ShoppingBag,
  Bell,
  Menu,
  Package,
  Users,
  Wallet,
  MessageCircle,
  LucideIcon,
} from "lucide-react-native";

import { fetchMobileNav, type MobileNavTab } from "../lib/api";
import VayvaBackground from "../components/VayvaBackground";

const TabsAny = Tabs as unknown as React.ComponentType<
  Record<string, unknown>
> & {
  Screen: React.ComponentType<Record<string, unknown>>;
};

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

function iconFromKey(icon: string): LucideIcon {
  switch (icon) {
    case "Home":
      return Home;
    case "ShoppingBag":
      return ShoppingBag;
    case "Bell":
      return Bell;
    case "Menu":
      return Menu;
    case "Package":
      return Package;
    case "Users":
      return Users;
    case "Wallet":
      return Wallet;
    case "MessageCircle":
      return MessageCircle;
    default:
      return Home;
  }
}

function screenNameFromHref(href: string): string {
  const clean = href.replace(/^\/(\(tabs\))?\/?/, "");
  if (clean === "" || clean === "(tabs)" || clean === "(tabs)/") return "index";
  const parts = clean.split("/").filter(Boolean);
  const last = parts[parts.length - 1] || "index";
  return last === "(tabs)" ? "index" : last;
}

const MVP_ORDER = ["index", "orders", "finance", "inbox", "menu"] as const;

const MVP_FALLBACK_TABS: MobileNavTab[] = [
  { key: "home", title: "Home", href: "/(tabs)", icon: "Home" },
  { key: "orders", title: "Orders", href: "/(tabs)/orders", icon: "ShoppingBag" },
  { key: "finance", title: "Finance", href: "/(tabs)/finance", icon: "Wallet" },
  { key: "inbox", title: "Inbox", href: "/(tabs)/inbox", icon: "MessageCircle" },
  { key: "menu", title: "Menu", href: "/(tabs)/menu", icon: "Menu" },
];

function toMvpTabs(input: MobileNavTab[] | null): MobileNavTab[] {
  const list = Array.isArray(input) && input.length ? input : MVP_FALLBACK_TABS;
  const filtered = list.filter((t) => MVP_ORDER.includes(screenNameFromHref(t.href) as unknown));
  const byName = new Map(filtered.map((t) => [screenNameFromHref(t.href), t] as const));
  return MVP_ORDER.map((name) => byName.get(name)).filter(Boolean) as MobileNavTab[];
}

export default function TabLayout(): React.JSX.Element {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();
  const [tabs, setTabs] = React.useState<MobileNavTab[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const mvpTabs = React.useMemo(() => toMvpTabs(tabs), [tabs]);

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      const res = await fetchMobileNav();
      if (!mounted) return;

      if (!res.success || !res.data?.tabs) {
        setError(res.error || "Failed to load navigation");
        setTabs(null);
        return;
      }

      setError(null);
      setTabs(res.data.tabs);
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  if (!tabs && !error) {
    return (
      <VayvaBackground>
        <View className="flex-1 items-center justify-center">
          <Text className={`${isDark ? "text-white/70" : "text-black/60"}`}>Loading…</Text>
        </View>
      </VayvaBackground>
    );
  }

  if (error) {
    return (
      <VayvaBackground>
        <View className="flex-1 items-center justify-center px-6">
          <Text className={`${isDark ? "text-white" : "text-black"} font-bold mb-2`}>
            Couldn’t load navigation
          </Text>
          <Text className={`${isDark ? "text-white/70" : "text-black/60"} text-center`}>
            {error}
          </Text>
        </View>
      </VayvaBackground>
    );
  }

  return (
    <TabsAny
      tabBar={(props: unknown) => {
        const bottom = Math.max(insets.bottom, 8) + 10;
        const state = props?.state;
        const descriptors = props?.descriptors;
        const navigation = props?.navigation;

        const routes = Array.isArray(state?.routes) ? state.routes : [];
        const activeIndex = typeof state?.index === "number" ? state.index : 0;

        const activeColor = "#46EC13";
        const inactiveColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";

        const leftRoutes = routes.slice(0, 2);
        const rightRoutes = routes.slice(2);

        const renderTab = (route: unknown) => {
          const key = route?.key;
          const name = route?.name;
          const descriptor = descriptors?.[key];
          const options = descriptor?.options || {};
          const label = options?.title ?? name;
          const isFocused = routes[activeIndex]?.key === key;

          const onPress = () => {
            const event = navigation?.emit?.({
              type: "tabPress",
              target: key,
              canPreventDefault: true,
            });
            if (!isFocused && !event?.defaultPrevented) {
              navigation?.navigate?.(name);
            }
          };

          const icon =
            typeof options?.tabBarIcon === "function"
              ? options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? activeColor : inactiveColor,
                  size: 24,
                })
              : null;

          return (
            <TouchableOpacity
              key={key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel}
              testID={options?.tabBarTestID}
              onPress={onPress}
              activeOpacity={0.85}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  fontWeight: "600",
                  color: isFocused ? activeColor : inactiveColor,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        };

        return (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              paddingBottom: bottom,
              paddingHorizontal: 16,
            }}
          >
            <View style={{ height: 74 }}>
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 74,
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <BlurView
                  tint={isDark ? "dark" : "light"}
                  intensity={90}
                  style={{ position: "absolute", inset: 0 }}
                />
                <View
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: isDark
                      ? "rgba(0,0,0,0.30)"
                      : "rgba(255,255,255,0.35)",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderWidth: 1,
                    borderColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                    borderRadius: 999,
                  }}
                />
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingHorizontal: 6,
                }}
              >
                {leftRoutes.map(renderTab)}
                <View style={{ width: 64 }} />
                {rightRoutes.map(renderTab)}
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Create Order"
                onPress={() => router.push("/(flows)/create-order")}
                activeOpacity={0.9}
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 18,
                  transform: [{ translateX: -28 }, { translateY: -20 }],
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#46EC13",
                    shadowColor: "#46EC13",
                    shadowOpacity: 0.35,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 10 },
                  }}
                >
                  <Icon name={Package} size={24} color="#000" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: Math.max(insets.bottom, 8) + 10,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 74,
          paddingTop: 10,
          paddingBottom: 10,
          borderRadius: 999,
          overflow: "hidden",
        },
        tabBarActiveTintColor: "#46EC13",
        tabBarInactiveTintColor: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarBackground: () => null,
      }}
    >
      {mvpTabs.map((t) => (
        <TabsAny.Screen
          key={t.key}
          name={screenNameFromHref(t.href)}
          options={{
            title: t.title,
            tabBarIcon: ({ color }: { color: string }) => (
              <Icon name={iconFromKey(t.icon)} size={24} color={color} />
            ),
          }}
        />
      ))}
    </TabsAny>
  );
}
