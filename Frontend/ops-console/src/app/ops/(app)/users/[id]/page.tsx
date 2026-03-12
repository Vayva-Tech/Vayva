import { prisma } from "@vayva/db";
import { notFound } from "next/navigation";
import { UserDetailClient } from "./UserDetailClient";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      memberships: {
        include: {
          store: {
            include: {
              merchantCosts: {
                orderBy: { date: "desc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const serializedMemberships = await Promise.all(
    user.memberships.map(async (membership) => {
      const store = membership.store;

      // Analytics Aggregation (Last 30 Days)
      const trafficCount = await prisma.telemetryEvent.count({
        where: {
          merchantId: store.id,
          eventName: "PAGE_VIEW",
          createdAt: { gte: thirtyDaysAgo },
        },
      });

      return {
        store: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          plan: store.plan,
          isLive: store.isLive,
          industrySlug: store.industrySlug,
          verificationLevel: store.verificationLevel,
          createdAt: store.createdAt.toISOString(),
        },
        trafficCount,
      };
    }),
  );

  return (
    <UserDetailClient
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }}
      memberships={serializedMemberships}
    />
  );
}
