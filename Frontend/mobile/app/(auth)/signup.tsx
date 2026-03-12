import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, useColorScheme } from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import VayvaBackground from "../components/VayvaBackground";
import VayvaLogo from "../components/VayvaLogo";

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default function SignupScreen(): React.JSX.Element {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const apiOrigin = useMemo(() => {
    const raw = process.env.EXPO_PUBLIC_API_URL;
    return typeof raw === "string" ? raw.replace(/\/$/, "") : "";
  }, []);

  const handleSignup = async () => {
    if (!apiOrigin) {
      setError("Missing EXPO_PUBLIC_API_URL.");
      return;
    }
    if (!firstName || !lastName || !email || !password) {
      setError("Fill all fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      const res = await fetch(`${apiOrigin}/api/auth/merchant/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vayva-client": "mobile",
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        setError(getString(payload?.error) || "Sign up failed");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Sign up failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VayvaBackground>
      <SafeAreaView className="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <VayvaLogo sizeClassName="w-16" />
          <Text className={`${isDark ? "text-white" : "text-black"} text-3xl font-bold mt-4`}>
            Create your account
          </Text>
          <Text className={`${isDark ? "text-white/60" : "text-black/60"} mt-2 text-base`}>
            Start managing your store on the go
          </Text>
        </View>

        <BlurView
          intensity={30}
          tint={isDark ? "dark" : "light"}
          className="overflow-hidden rounded-3xl border border-white/10 p-6"
        >
          <View className="gap-4">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className={`text-xs ${isDark ? "text-white/70" : "text-black/70"} uppercase font-bold mb-2 ml-1`}>
                  First name
                </Text>
                <TextInput
                  placeholder="Amina"
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                  value={firstName}
                  onChangeText={setFirstName}
                  className={`${isDark ? "bg-white/5 border-white/10 text-white" : "bg-black/5 border-black/10 text-black"} border rounded-xl px-4 py-4 text-base`}
                />
              </View>
              <View className="flex-1">
                <Text className={`text-xs ${isDark ? "text-white/70" : "text-black/70"} uppercase font-bold mb-2 ml-1`}>
                  Last name
                </Text>
                <TextInput
                  placeholder="Okafor"
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                  value={lastName}
                  onChangeText={setLastName}
                  className={`${isDark ? "bg-white/5 border-white/10 text-white" : "bg-black/5 border-black/10 text-black"} border rounded-xl px-4 py-4 text-base`}
                />
              </View>
            </View>

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

            {success && (
              <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <Text className="text-emerald-200 text-sm">
                  Account created. Check your email for the OTP, then sign in.
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSignup}
              disabled={isSubmitting}
              className="bg-[#46EC13] rounded-full py-4 items-center mt-2 active:opacity-90 shadow-lg shadow-green-500/20"
            >
              <Text className="text-black font-bold text-lg">
                {isSubmitting ? "Creating…" : "Create Account"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              className="items-center mt-2"
            >
              <Text className={`${isDark ? "text-white/60" : "text-black/60"} text-sm`}>
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </SafeAreaView>
    </VayvaBackground>
  );
}
