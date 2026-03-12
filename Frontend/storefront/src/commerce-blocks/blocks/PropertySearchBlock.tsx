"use client";

import React, { useState } from "react";
import { Button, Input } from "@vayva/ui";

export default function PropertySearchBlock() {
  const [q, setQ] = useState("");

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="rounded-3xl border border-gray-200 bg-transparent p-6">
        <div className="text-xs font-black uppercase tracking-widest text-text-tertiary">Search</div>
        <div className="mt-1 text-2xl font-black tracking-tight">Find a property</div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try: Lekki, Abuja, 3 bedroom..." />
          <Button
            onClick={() => {
              const params = new URLSearchParams();
              if (q.trim()) params.set("q", q.trim());
              window.location.href = `?${params.toString()}#properties`;
            }}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
