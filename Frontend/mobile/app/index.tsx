import React from "react";
import { View, Text , useColorScheme } from "react-native";
import { router } from "expo-router";
import { getAuthToken } from "./lib/auth";
import VayvaBackground from "./components/VayvaBackground";
import VayvaLogo from "./components/VayvaLogo";

export default function Home(): React.JSX.Element {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [status, setStatus] = React.useState<"checking" | "done">("checking");

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const token = await getAuthToken();
        if (!mounted) return;
        router.replace(token ? "/(tabs)" : "/(auth)/login");
      } finally {
        if (mounted) setStatus("done");
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <VayvaBackground>
      <View className="flex-1 items-center justify-center px-6">
        <VayvaLogo sizeClassName="w-16" />
        <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-xl mt-6`}>
          Vayva Merchant
        </Text>
        <Text className={`${isDark ? "text-white/60" : "text-black/60"} text-sm mt-2 text-center`}>
          {status === "checking" ? "Preparing your dashboard…" : "Opening…"}
        </Text>
      </View>
    </VayvaBackground>
  );
}
