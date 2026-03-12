"use client";

import React from "react";
import { Card, Badge, Button } from "@vayva/ui";
import { ArrowSquareOut as ExternalLink, CheckCircle, XCircle } from "@phosphor-icons/react/ssr";
import { urls } from "@vayva/shared";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface UserDetailClientProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  memberships: Array<{
    store: {
      id: string;
      name: string;
      slug: string;
      plan: string;
      isLive: boolean;
      industrySlug: string | null;
      verificationLevel: string;
      createdAt: string | Date;
    };
    trafficCount: number;
  }>;
}

export function UserDetailClient({ user, memberships }: UserDetailClientProps) {
  return (
    <OpsPageShell
      title="Merchant Health"
      description={`${user.firstName} ${user.lastName} (${user.email})`}
      headerActions={
        <Button
          className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors h-auto"
          onClick={() => alert("Blocking functionality coming soon")}
        >
          Block User
        </Button>
      }
    >
      <div className="space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memberships.map(({ store, trafficCount }) => {
          const storefrontUrl = urls.storefrontOrigin(store.slug);
          const storefrontHost = new URL(storefrontUrl).host;

          return (
            <Card key={store.id} className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{store.name}</h3>
                  <a
                    href={storefrontUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {storefrontHost}
                    <ExternalLink size={12} />
                  </a>
                </div>
                <Badge
                  className={
                    store.plan === "PRO"
                      ? "bg-purple-100 text-purple-700"
                      : store.plan === "STARTER"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                  }
                >
                  {store.plan}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium flex items-center gap-2">
                    {store.isLive ? (
                      <>
                        <CheckCircle size={14} className="text-green-500" />
                        Live
                      </>
                    ) : (
                      <>
                        <XCircle size={14} className="text-gray-400" />
                        Draft
                      </>
                    )}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Industry</span>
                  <span className="font-medium capitalize">
                    {store.industrySlug?.replace("_", " ") || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Verification</span>
                  <span className="font-medium">{store.verificationLevel}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium">
                    {new Date(store.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Growth Signals */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SEO Indexable</span>
                  <span className="font-bold text-green-600">Yes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Traffic (30d)</span>
                  <span className="font-bold text-gray-900">
                    {trafficCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}

        {memberships.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500">No stores linked to this user.</p>
          </div>
        )}
      </div>
      </div>
    </OpsPageShell>
  );
}
