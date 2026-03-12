import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import Groq from "groq-sdk";
const groq = new Groq({
    apiKey: process.env.GROQ_ADMIN_KEY || "",
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: any) {
    // Basic auth check for cron (e.g., Vercel Cron Secret)
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const now = new Date();
        const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const startOfWindow = new Date(fortyEightHoursFromNow.setHours(0, 0, 0, 0));
        const endOfWindow = new Date(fortyEightHoursFromNow.setHours(23, 59, 59, 999));
        // 1. Find target merchants
        const targetSubscriptions = await prisma.merchantAiSubscription.findMany({
            where: {
                trialExpiresAt: {
                    gte: startOfWindow,
                    lte: endOfWindow
                },
                store: {
                    plan: "FREE"
                }
            },
            include: {
                store: {
                    include: {
                        _count: {
                            select: {
                                products: true,
                                customers: true,
                                conversations: true
                            }
                        },
                        memberships: {
                            where: { role_enum: "OWNER" },
                            include: { user: true }
                        }
                    }
                }
            }
        });
        const results = [];
        for (const sub of targetSubscriptions) {
            const store = sub.store;
            const owner = store.memberships[0]?.user;
            if (!owner || !owner.phone)
                continue;
            const stats = {
                leads: store._count.customers,
                products: store._count.products,
                conversations: store._count.conversations
            };
            // 2. Generate Personalized Message via Groq
            const prompt = `You are a helpful business assistant for Vayva. Write a short, professional WhatsApp message to ${owner.firstName || 'Merchant'}. 
            Mention they have 48 hours left on their trial. 
            Highlight that they have already ${stats.products} products live and the AI has handled ${stats.conversations} conversations. 
            Emphasize that to keep their store live and not lose their progress or their ${stats.leads} customer leads, they should upgrade now.
            Keep it under 60 words. No emojis except one at the end.`;
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.1-70b-versatile",
            });
            const messageText = completion.choices[0]?.message?.content ||
                `Hi ${owner.firstName}, your Vayva trial ends in 48 hours. You have ${stats.products} products and ${stats.conversations} AI chats live. Upgrade now to keep your progress safe!`;
            // 3. Dispatch via Evolution API
            const dispatchResult = await dispatchWhatsApp(owner.phone, messageText);
            results.push({ storeId: store.id, success: dispatchResult.success });
        }
        return NextResponse.json({
            processed: targetSubscriptions.length,
            results
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[TRIAL_REMINDERS] Trial reminder job failed", error);
        return NextResponse.json({ error: "Trial reminder job failed" }, { status: 500 });
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function dispatchWhatsApp(phone: any, text: any) {
    const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
    const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME || "vayva_global";
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
        logger.warn("[TRIAL_REMINDERS] Trial reminder skipped: WhatsApp API not configured");
        return { success: false, skipped: true, reason: "WhatsApp API not configured" };
    }
    try {
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                number: phone,
                options: { delay: 1200, presence: "composing" },
                textMessage: { text }
            })
        });
        return { success: response.ok };
    }
    catch (e) {
        logger.error("[TRIAL_REMINDERS] Evolution API Error", e);
        return { success: false };
    }
}
