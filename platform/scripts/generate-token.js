const jwt = require('jsonwebtoken');
const { prisma } = require('../infra/db/src/client');

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRES_IN = "30d"; // Long lived for testing

async function main() {
    const email = process.argv[2] || "fred@vayva.ng";

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            memberships: {
                include: {
                    store: true
                }
            }
        }
    });

    if (!user) {
        console.error(`User ${email} not found.`);
        process.exit(1);
    }

    if (user.memberships.length === 0) {
        console.error(`User ${email} has no store memberships.`);
        process.exit(1);
    }

    const membership = user.memberships[0];

    const payload = {
        userId: user.id,
        email: user.email,
        storeId: membership.storeId,
        storeName: membership.store.name,
        role: membership.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });

    console.log("\n✅ Test Token Generated:\n");
    console.log(token);
    console.log("\nUsage:");
    console.log(`export TEST_AUTH_TOKEN="${token}"`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
