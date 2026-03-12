import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { setAuthToken } from "../lib/auth";
import VayvaBackground from "../components/VayvaBackground";
import VayvaLogo from "../components/VayvaLogo";

export default function LoginScreen(): React.JSX.Element {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiOrigin = useMemo(() => {
    const raw = process.env.EXPO_PUBLIC_API_URL;
    return typeof raw === "string" ? raw.replace(/\/$/, "") : "";
  }, []);

  const handleLogin = async () => {
    if (!apiOrigin) {
      setError("Missing EXPO_PUBLIC_API_URL.");
      return;
    }
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      headers["x-vayva-client"] = "mobile";

      const res = await fetch(`${apiOrigin}/api/auth/merchant/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email, password }),
      });
      // Use record for the JSON payload
      const payload = (await res.json().catch(() => ({}))) as Record<
        string,
        string
      >;
      if (!res.ok) {
        setError(payload?.error || "Login failed");
        return;
      }

      if (!payload?.token) {
        setError("Login succeeded but no token was returned.");
        return;
      }

      await setAuthToken(payload.token);
      router.replace("/(tabs)");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VayvaBackground>
      <SafeAreaView className="flex-1 justify-center px-6">
        <View className="items-center mb-10">
          <VayvaLogo sizeClassName="w-16" />
          <Text className={`${isDark ? "text-white" : "text-black"} text-3xl font-bold mt-4`}>
            Vayva Merchant
          </Text>
          <Text className={`${isDark ? "text-white/60" : "text-black/60"} mt-2 text-base`}>
            Manage your store on the go
          </Text>
        </View>

        <BlurView
          intensity={30}
          tint={isDark ? "dark" : "light"}
          className="overflow-hidden rounded-3xl border border-white/10 p-6"
        >
          <View className="gap-4">
            <View>
              <Text className={`text-xs ${isDark ? "text-white/70" : "text-black/70"} uppercase font-bold mb-2 ml-1`}>
                Email
              </Text>
              <TextInput
                placeholder="store@vayva.ng"
                placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                className={`${isDark ? "bg-white/5 border-white/10 text-white" : "bg-black/5 border-black/10 text-black"} border rounded-xl px-4 py-4 text-base`}
              />
            </View>
            <View>
              <Text className={`text-xs ${isDark ? "text-white/70" : "text-black/70"} uppercase font-bold mb-2 ml-1`}>
                Password
              </Text>
              <TextInput
                placeholder="••••••••"
                secureTextEntry
                placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                value={password}
                onChangeText={setPassword}
                className={`${isDark ? "bg-white/5 border-white/10 text-white" : "bg-black/5 border-black/10 text-black"} border rounded-xl px-4 py-4 text-base`}
              />
            </View>

            {!!error && (
              <View className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <Text className="text-red-300 text-sm">{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isSubmitting}
              className="bg-[#46EC13] rounded-full py-4 items-center mt-4 active:opacity-90 shadow-lg shadow-green-500/20"
            >
              <Text className="text-black font-bold text-lg">
                {isSubmitting ? "Signing in…" : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center mt-2">
              <Text className={`${isDark ? "text-white/50" : "text-black/50"} text-sm`}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/(auth)/signup")}
              className="items-center mt-2"
            >
              <Text className={`${isDark ? "text-white/60" : "text-black/60"} text-sm`}>
                New here? Create an account
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>

        <View className="mt-10 items-center">
          <Text className={`${isDark ? "text-white/30" : "text-black/40"} text-xs`}>
            Vayva Inc • Version 1.0.0
          </Text>
        </View>
      </SafeAreaView>
    </VayvaBackground>
  );
}
