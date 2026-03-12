#!/usr/bin/env node
/**
 * Schema Validation Script
 * 
 * Validates that test setup files only use fields that exist in Prisma models.
 * Run this before committing changes to catch schema mismatches early.
 * 
 * Usage: node scripts/validate-test-schema.mjs
 */

import { PrismaClient } from '@vayva/db';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function validateTestSetup() {
    console.log('🔍 Validating test setup schema...\n');

    const setupFile = join(__dirname, '../tests/e2e/setup.ts');
    const setupContent = readFileSync(setupFile, 'utf-8');

    let errors = 0;

    // Check for common mistakes
    const invalidPatterns = [
        { pattern: /businessName:/g, correct: 'name:', model: 'Store' },
        { pattern: /subscriptionPlan:/g, correct: 'plan:', model: 'Store' },
        { pattern: /\bname:/g, correct: 'firstName: / lastName:', model: 'User', context: 'user.create' },
    ];

    for (const { pattern, correct, model, context } of invalidPatterns) {
        const matches = setupContent.match(pattern);
        if (matches && (!context || setupContent.includes(context))) {
            console.error(`❌ Invalid field in ${model} model: ${pattern.source}`);
            console.error(`   Use ${correct} instead\n`);
            errors++;
        }
    }

    // Try to actually create test data to validate
    try {
        console.log('✓ Attempting to create test user...');
        await prisma.user.create({
            data: {
                id: 'validation-test-user',
                email: 'validation@test.com',
                password: 'test',
                firstName: 'Test',
                lastName: 'User',
            },
        });
        await prisma.user.delete({ where: { id: 'validation-test-user' } });
        console.log('✓ User model validation passed\n');
    } catch (error) {
        console.error('❌ User model validation failed:', error.message, '\n');
        errors++;
    }

    try {
        console.log('✓ Attempting to create test store...');
        await prisma.store.create({
            data: {
                id: 'validation-test-store',
                name: 'Test Store',
                slug: 'validation-test-store',
                plan: 'STARTER',
            },
        });
        await prisma.store.delete({ where: { id: 'validation-test-store' } });
        console.log('✓ Store model validation passed\n');
    } catch (error) {
        console.error('❌ Store model validation failed:', error.message, '\n');
        errors++;
    }

    await prisma.$disconnect();

    if (errors > 0) {
        console.error(`\n❌ Validation failed with ${errors} error(s)`);
        process.exit(1);
    } else {
        console.log('\n✅ All validations passed!');
        process.exit(0);
    }
}

validateTestSetup().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
