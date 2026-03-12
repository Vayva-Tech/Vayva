
import { prisma, LedgerAccountType, TransactionType } from "@vayva/db";

export class WalletService {

    /**
     * Processes a financial transaction between a source (optional) and destination ledger account.
     * Ensures double-entry consistency and idempotency if referenceId is provided.
     */
    static async processTransaction(params: {
        ownerId: string | null;
        amount: bigint;
        type: TransactionType;
        accountType: LedgerAccountType;
        referenceId: string;
        description?: string;
    }): Promise<{ status: string; transaction: unknown; account: unknown }> {
        const ownerId = params.ownerId;
        const amount = params.amount;
        const type = params.type;
        const accountType = params.accountType;
        const referenceId = params.referenceId;
        const description = params.description;

        return prisma.$transaction(async (tx) => {
            const account = await tx.ledgerAccount?.upsert({
                where: {
                    ownerId_type_currency: {
                        ownerId: ownerId!, // Assert non-null as schema might require it for this composite key, or logic ensures it
                        type: accountType,
                        currency: "NGN",
                    }
                },
                update: {},
                create: {
                    ownerId,
                    type: accountType,
                    currency: "NGN",
                    balance: 0n, // BigInt literal
                }
            });

            // Idempotency: Check if transaction with refId already exists for this account
            const existingTx = await tx.ledgerTransaction?.findFirst({
                where: {
                    accountId: account.id,
                    referenceId
                }
            });

            if (existingTx) {
                return { status: 'SKIPPED', transaction: existingTx, account };
            }

            // Check Funds if DEBIT
            if (type === 'DEBIT') {
                if (account.balance < amount) {
                    throw new Error(`Insufficient funds in ${accountType} wallet. Balance: ${account.balance}, Required: ${amount}`);
                }
            }

            // Calculate new balance
            const newBalance = type === 'CREDIT'
                ? account.balance + amount
                : account.balance - amount;

            // Update Account
            const updatedAccount = await tx.ledgerAccount?.update({
                where: { id: account.id },
                data: { balance: newBalance }
            });

            // Create Transaction Record
            const transaction = await tx.ledgerTransaction?.create({
                data: {
                    accountId: account.id,
                    amount,
                    type,
                    referenceId,
                    balanceBefore: account.balance,
                    balanceAfter: newBalance,
                    description
                }
            });

            return { status: 'SUCCESS', transaction, account: updatedAccount };
        });
    }

    static async getBalance(ownerId: string, type: LedgerAccountType = 'MERCHANT_AVAILABLE'): Promise<bigint> {
        const account = await prisma.ledgerAccount?.findUnique({
            where: {
                ownerId_type_currency: {
                    ownerId,
                    type,
                    currency: "NGN"
                }
            }
        });
        return account?.balance || 0n;
    }

    static async getSystemBalance(type: LedgerAccountType): Promise<bigint> {
        if (!type.startsWith("SYSTEM")) throw new Error("Not a system account type");
        const account = await prisma.ledgerAccount?.findUnique({
            where: {
                ownerId_type_currency: {
                    ownerId: null as unknown as string,
                    type,
                    currency: "NGN"
                }
            }
        });
        return account?.balance || 0n;
    }
}
