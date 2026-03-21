import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ShoppingBag,
  Check,
  X,
  MessageCircle,
  LucideIcon,
} from "lucide-react-native";
import { getAuthToken } from "../lib/auth";
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

type RiskTier = "High" | "Medium" | "Low";

type EscalationItem = {
  id: string;
  storeId: string;
  storeName: string;
  type: string;
  category: string;
  status: string;
  priority: string;
  risk: RiskTier;
  subject: string;
  summary: string | null;
  lastMessageAt: string;
  triggerType: string | null;
  conversationId: string | null;
};

type EscalationsResponse = {
  data: EscalationItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function mapToCard(item: EscalationItem) {
  const trigger = (item.triggerType || "").toUpperCase();
  const type = trigger.includes("FRAUD")
    ? "fraud"
    : trigger.includes("PAYMENT") || trigger.includes("BILLING")
      ? "refund"
      : "other";

  const title =
    item.subject || (trigger ? `AI Escalation: ${trigger}` : "AI Escalation");
  const desc =
    item.summary || "AI escalated this conversation for human review.";
  const customer = item.storeName || "Store";
  const chatSnippet = (item.summary || "").trim() || "Needs review";

  return {
    id: item.id,
    type,
    title,
    desc,
    risk: item.risk,
    amount: trigger ? trigger.replaceAll("_", " ") : "Needs Review",
    chatSnippet,
    customer,
  };
}

export default function ApprovalsScreen(): React.JSX.Element {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [items, setItems] = useState<EscalationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const apiOrigin = useMemo(() => {
    const raw = process.env.EXPO_PUBLIC_API_URL;
    return typeof raw === "string" ? raw.replace(/\/$/, "") : "";
  }, []);

  const listUrl = useMemo(() => {
    if (!apiOrigin) return "";
    return `${apiOrigin}/api/merchant/support/escalations?status=open&limit=20&page=1`;
  }, [apiOrigin]);

  const load = useCallback(async () => {
    if (!listUrl) {
      setIsLoading(false);
      setError(
        "Missing EXPO_PUBLIC_API_URL. Set it to your merchant origin (e.g. https://merchant.yourdomain.com).",
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const token = await getAuthToken();
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(listUrl, {
        method: "GET",
        headers: {
          ...headers,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed (${res.status})`);
      }

      const payload = (await res.json()) as EscalationsResponse;
      setItems(Array.isArray(payload?.data) ? payload.data : []);
    } catch {
      setError(
        "Could not load approvals. Please ensure you are signed in and the API is reachable.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [listUrl]);

  const updateTicket = useCallback(
    async (
      id: string,
      status: "RESOLVED" | "OPEN",
      resolution?: "approved" | "rejected",
    ) => {
      if (!apiOrigin) {
        setError("Missing EXPO_PUBLIC_API_URL.");
        return;
      }

      setUpdatingIds((prev) => ({ ...prev, [id]: true }));
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        const token = await getAuthToken();
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(
          `${apiOrigin}/api/merchant/support/tickets/${id}`,
          {
            method: "PATCH",
            headers: {
              ...headers,
            },
            body: JSON.stringify({
              status,
              metadata: resolution ? { resolution } : undefined,
            }),
          },
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed (${res.status})`);
        }

        await load();
      } catch {
        setError(
          "Could not update ticket. Please ensure you are signed in and have access.",
        );
      } finally {
        setUpdatingIds((prev) => ({ ...prev, [id]: false }));
      }
    },
    [apiOrigin, load],
  );

  useEffect(() => {
    load();
  }, [load]);

  const cards = useMemo(() => items.map(mapToCard), [items]);

  return (
    <VayvaBackground>
      <SafeAreaView className="flex-1">
        <View className="px-6 py-4">
          <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-2xl mb-2`}>
            Pending Approvals
          </Text>
          <Text className={`${isDark ? "text-white/50" : "text-black/55"} text-sm mb-6`}>
            WhatsApp AI requires your input on these items.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        >
        {isLoading && (
          <View
            className={`border rounded-3xl overflow-hidden mb-6 p-6 ${
              isDark ? "bg-[#0b141a]/40 border-white/10" : "bg-white/60 border-black/10"
            }`}
          >
            <Text className={`${isDark ? "text-white/80" : "text-black/70"}`}>
              Loading approvals…
            </Text>
          </View>
        )}

        {!isLoading && error && (
          <View
            className={`border rounded-3xl overflow-hidden mb-6 p-6 ${
              isDark ? "bg-[#0b141a]/40 border-white/10" : "bg-white/60 border-black/10"
            }`}
          >
            <Text className={`${isDark ? "text-white" : "text-black"} font-bold mb-2`}>
              Couldn’t load approvals
            </Text>
            <Text className={`${isDark ? "text-white/70" : "text-black/60"} text-sm`}>
              {error}
            </Text>
          </View>
        )}

        {!isLoading && !error && cards.length === 0 && (
          <View
            className={`border rounded-3xl overflow-hidden mb-6 p-6 ${
              isDark ? "bg-[#0b141a]/40 border-white/10" : "bg-white/60 border-black/10"
            }`}
          >
            <Text className={`${isDark ? "text-white" : "text-black"} font-bold mb-2`}>
              No pending approvals
            </Text>
            <Text className={`${isDark ? "text-white/70" : "text-black/60"} text-sm`}>
              Your AI hasn’t escalated anything that needs review yet.
            </Text>
          </View>
        )}

        {cards.map((item) => (
          <View
            key={item.id}
            className={`border rounded-3xl overflow-hidden mb-6 shadow-xl shadow-black/10 ${
              isDark ? "bg-[#0b141a]/45 border-white/10" : "bg-white/60 border-black/10"
            }`}
          >
            {/* Header */}
            <View
              className={`p-4 flex-row justify-between items-start ${
                isDark ? "border-b border-white/5 bg-white/5" : "border-b border-black/10 bg-black/5"
              }`}
            >
              <View className="flex-row gap-3">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${item.type === "refund" ? "bg-red-500/20" : "bg-blue-500/20"}`}
                >
                  <Icon
                    name={ShoppingBag}
                    size={18}
                    color={item.type === "refund" ? "#ef4444" : "#3b82f6"}
                  />
                </View>
                <View>
                  <Text className={`${isDark ? "text-white" : "text-black"} font-bold text-base`}>
                    {item.title}
                  </Text>
                  <Text className={`${isDark ? "text-white/50" : "text-black/50"} text-xs`}>
                    {item.customer}
                  </Text>
                </View>
              </View>
              <View
                className={`px-2 py-1 rounded border ${
                  item.risk === "High"
                    ? "bg-red-500/10 border-red-500/20"
                    : item.risk === "Medium"
                      ? "bg-orange-500/10 border-orange-500/20"
                      : "bg-green-500/10 border-green-500/20"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase ${
                    item.risk === "High"
                      ? "text-red-400"
                      : item.risk === "Medium"
                        ? "text-orange-400"
                        : "text-green-400"
                  }`}
                >
                  {item.risk} Risk
                </Text>
              </View>
            </View>

            {/* Content */}
            <View className="p-6">
              <Text className={`${isDark ? "text-white" : "text-black"} text-lg font-bold mb-4`}>
                {item.amount}
              </Text>

              <View
                className={`rounded-xl p-4 mb-6 border ${
                  isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/10"
                }`}
              >
                <View className="flex-row items-center gap-2 mb-2">
                  <Icon
                    name={MessageCircle}
                    size={14}
                    color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)"}
                  />

                  <Text className={`${isDark ? "text-white/50" : "text-black/50"} text-xs uppercase font-bold`}>
                    Latest Message
                  </Text>
                </View>
                <Text className={`${isDark ? "text-white/80" : "text-black/70"} italic`}>
                  "{item.chatSnippet}"
                </Text>
              </View>

              <Text className={`${isDark ? "text-white/60" : "text-black/60"} text-sm mb-6 leading-5`}>
                {item.desc}
              </Text>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  disabled={!!updatingIds[item.id]}
                  accessibilityRole="button"
                  accessibilityLabel={`Reject approval: ${item.title}`}
                  onPress={() => updateTicket(item.id, "RESOLVED", "rejected")}
                  className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                  } ${updatingIds[item.id] ? "opacity-60" : ""}`}
                >
                  <Icon name={X} size={18} color="#ef4444" />
                  <Text className={`${isDark ? "text-white" : "text-black"} font-bold`}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={!!updatingIds[item.id]}
                  accessibilityRole="button"
                  accessibilityLabel={`Approve approval: ${item.title}`}
                  onPress={() => updateTicket(item.id, "RESOLVED", "approved")}
                  className={`flex-1 bg-[#46EC13] py-3 rounded-xl items-center flex-row justify-center gap-2 shadow-lg shadow-green-500/20 ${updatingIds[item.id] ? "opacity-60" : ""}`}
                >
                  <Icon name={Check} size={18} color="#000" />
                  <Text className="text-black font-bold">Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        </ScrollView>
      </SafeAreaView>
    </VayvaBackground>
  );
}
