
// import { PrismaClient } from "@prisma/client";
import { prisma } from "../infra/db/src/client";

async function main() {
    console.log("🚀 Seeding App Registry...");

    // 1. Create Developer User
    const devEmail = "developer@vayva.com";
    let developer = await prisma.user.findUnique({ where: { email: devEmail } });
    if (!developer) {
        developer = await prisma.user.create({
            data: {
                email: devEmail,
                password: "dummy",
                firstName: "App",
                lastName: "Developer",
                isEmailVerified: true,
            }
        });
        console.log("  - Created Developer User:", devEmail);
    } else {
        console.log("  - Found Developer User:", devEmail);
    }

    const apps = [
        {
            extensionId: "app_google_analytics",
            developerId: developer.id,
            status: "ACTIVE",
            manifestUrl: "https://apps.vayva.com/google-analytics/manifest.json",
            cachedManifest: { name: "Google Analytics 4", version: "1.0.0", description: "Track traffic and events." }
        },
        {
            extensionId: "app_mailchimp",
            developerId: developer.id,
            status: "ACTIVE",
            manifestUrl: "https://apps.vayva.com/mailchimp/manifest.json",
            cachedManifest: { name: "Mailchimp Sync", version: "2.1.0", description: "Sync contacts to Mailchimp." }
        },
        {
            extensionId: "app_printful",
            developerId: developer.id,
            status: "PENDING",
            manifestUrl: "https://apps.vayva.com/printful/manifest.json",
            cachedManifest: { name: "Printful Dropshipping", version: "0.9.0", description: "Print on demand." }
        }
    ];

    for (const app of apps) {
        await prisma.appRegistry.upsert({
            where: { extensionId: app.extensionId },
            update: {},
            create: app
        });
        console.log(`  - Upserted ${app.extensionId}`);
    }

    console.log("✅ Seeded App Registry.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
