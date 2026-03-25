#!/usr/bin/env node
/**
 * HTTP load/stress against all page routes (GET only).
 * Does not authenticate — expect 302/401 on protected paths unless you pass cookies.
 *
 * Usage (from Frontend/merchant):
 *   STRESS_BASE_URL=http://localhost:3000 STRESS_CONCURRENCY=25 node scripts/merchant-route-fetch-stress.mjs
 *   MERCHANT_STRESS_COOKIE='vayva_session=...' node scripts/merchant-route-fetch-stress.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const manifestPath = path.join(root, "e2e/merchant-routes.json");

const base = (process.env.STRESS_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);
const concurrency = Math.max(
  1,
  Number.parseInt(process.env.STRESS_CONCURRENCY || "20", 10),
);
const extraCookie = process.env.MERCHANT_STRESS_COOKIE || "";

const { routes } = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

async function fetchOne(route) {
  const url = `${base}${route}`;
  const headers = { Accept: "text/html,application/json" };
  if (extraCookie) headers.Cookie = extraCookie;
  const t0 = performance.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers,
    });
    const ms = Math.round(performance.now() - t0);
    return { route, status: res.status, ms, ok: res.ok || res.status === 302 };
  } catch (e) {
    const ms = Math.round(performance.now() - t0);
    return {
      route,
      status: 0,
      ms,
      ok: false,
      err: e instanceof Error ? e.message : String(e),
    };
  }
}

async function pool(items, limit, worker) {
  const results = [];
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

const tAll = performance.now();
const results = await pool(routes, concurrency, fetchOne);
const totalMs = Math.round(performance.now() - tAll);

const failed = results.filter((r) => !r.ok && r.status !== 302 && r.status !== 401);
const byTime = [...results].sort((a, b) => b.ms - a.ms);

console.log(
  JSON.stringify(
    {
      base,
      concurrency,
      routes: routes.length,
      wallClockMs: totalMs,
      failedCount: failed.length,
      slowest10: byTime.slice(0, 10),
      failuresSample: failed.slice(0, 25),
    },
    null,
    2,
  ),
);

if (failed.length > 0) process.exitCode = 1;
