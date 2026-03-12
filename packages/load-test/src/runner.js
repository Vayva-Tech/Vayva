
const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000";
const CONCURRENCY = process.env.CONCURRENCY ? parseInt(process.env.CONCURRENCY) : 50;
const DURATION_SEC = process.env.DURATION_SEC ? parseInt(process.env.DURATION_SEC) : 30;

// Metrics
const stats = {
    requests: 0,
    success: 0,
    failures: 0,
    codes: {},
    totalLatency: 0,
    minLatency: Infinity,
    maxLatency: 0,
    latencies: [] // Store sample latencies for p95
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(workerId, scenarioFn) {
    const start = performance.now();
    try {
        const res = await scenarioFn(TARGET_URL, workerId);
        const duration = performance.now() - start;

        stats.requests++;
        stats.codes[res.status] = (stats.codes[res.status] || 0) + 1;

        if (res.ok) {
            stats.success++;
        } else {
            stats.failures++;
        }

        stats.totalLatency += duration;
        stats.minLatency = Math.min(stats.minLatency, duration);
        stats.maxLatency = Math.max(stats.maxLatency, duration);
        stats.latencies.push(duration);

    } catch (error) {
        stats.failures++;
        console.error(`Worker ${workerId} failed:`, error.message);
    }
}

async function runLoadTest(scenarioPath) {
    console.log(`🚀 Starting Load Test`);
    console.log(`Target: ${TARGET_URL}`);
    console.log(`Concurrency: ${CONCURRENCY} workers`);
    console.log(`Duration: ${DURATION_SEC}s`);

    // Load Scenario
    const scenario = require(scenarioPath);
    if (!scenario.run) {
        throw new Error("Scenario must export a 'run' function");
    }

    const startTime = Date.now();
    const endTime = startTime + (DURATION_SEC * 1000);
    const workers = [];

    // Worker Loop
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push((async () => {
            while (Date.now() < endTime) {
                await makeRequest(i, scenario.run);
                // random jitter to avoid thundering herd
                await sleep(Math.random() * 100);
            }
        })());
    }

    await Promise.all(workers);

    printReport(startTime);
}

function printReport(startTime) {
    const totalTime = (Date.now() - startTime) / 1000;
    const rps = stats.requests / totalTime;
    const avgLatency = stats.requests > 0 ? stats.totalLatency / stats.requests : 0;

    // Calculate p95
    stats.latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(stats.latencies.length * 0.95);
    const p95 = stats.latencies[p95Index] || 0;

    console.log("\n📊 Load Test Results");
    console.log("===================================");
    console.log(`Total Requests:  ${stats.requests}`);
    console.log(`Successful:      ${stats.success}`);
    console.log(`Failed:          ${stats.failures}`);
    console.log(`RPS:             ${rps.toFixed(2)} req/s`);
    console.log(`Avg Latency:     ${avgLatency.toFixed(2)}ms`);
    console.log(`p95 Latency:     ${p95.toFixed(2)}ms`);
    console.log(`Min/Max Latency: ${stats.minLatency.toFixed(2)}ms / ${stats.maxLatency.toFixed(2)}ms`);
    console.log("\nStatus Codes:");
    Object.keys(stats.codes).forEach(code => {
        console.log(`  ${code}: ${stats.codes[code]}`);
    });
    console.log("===================================");
}

// CLI Entry
const scenarioFile = process.argv[2];
if (!scenarioFile) {
    console.error("Usage: node runner.js <scenario-file>");
    process.exit(1);
}

runLoadTest(path.resolve(scenarioFile)).catch(console.error);
