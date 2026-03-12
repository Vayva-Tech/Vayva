"use client";

import React, { useState, Suspense } from "react";
import { Button } from "@vayva/ui";
import { useSearchParams, useRouter } from "next/navigation";
import { reportError } from "@/lib/error";

function PaystackTestContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const amount = searchParams.get("amount");
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (status: "success" | "failed") => {
    setLoading(true);
    // Simulate webhook call to backend (Gateway -> Payments Service)
    try {
      if (status === "success") {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(
          /\/v1$/,
          "",
        );
        await fetch(`${apiBase}/webhooks/paystack`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "charge.success",
            data: {
              reference,
              status: "success",
              amount: Number(amount),
              id: Math.floor(Math.random() * 1000000000),
            },
          }),
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: unknown) {
      reportError(e, {
        scope: "PaystackTest.simulateWebhook",
        app: "storefront",
        status,
      });
    }

    // Redirect back to confirmation
    router.push(`/order/confirmation?reference=${reference}&store=demo`);
  };

  return (
    <div className="min-h-screen bg-background/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-background/70 backdrop-blur-xl max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#011b33] p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold italic tracking-tighter">
              paystack
            </h1>
            <p className="text-[10px] opacity-70 uppercase tracking-widest mt-1">
              Checkout Simulation
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Pay</p>
            <p className="text-xl font-bold">
              ₦{(Number(amount) / 100).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">P</span>
            </div>
            <h2 className="text-lg font-bold">Transaction Reference</h2>
            <code className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-600 mt-2 inline-block font-mono">
              {reference || "N/A"}
            </code>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleSimulate("success")}
              disabled={loading}
              className="w-full bg-[#3bb75e] text-white py-4 rounded-lg font-bold hover:bg-[#34a353] transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : "Simulate Successful Payment"}
            </Button>
            <Button
              onClick={() => handleSimulate("failed")}
              disabled={loading}
              className="w-full bg-background/70 backdrop-blur-xl text-red-500 border border-red-100 py-4 rounded-lg font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Simulate Payment Failure
            </Button>
          </div>

          <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest leading-loose">
            Securely processed by Paystack Test
            <br />
            This is a simulated environment
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaystackTestClient(): React.JSX.Element {
  return (
    <Suspense fallback={<div>Loading simulation...</div>}>
      <PaystackTestContent />
    </Suspense>
  );
}
