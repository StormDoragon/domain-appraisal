"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const { appraise } = require("./appraisal");
const { MARKET_COMPS } = require("./market-data");

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");
const COMPS_FILE = path.join(DATA_DIR, "comps.json");

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function tokenizeKeywords(keywordText) {
  return String(keywordText || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

// ---- Comparable import normalisation ------------------------------------

function normalizeComparable(record) {
  const domain = String(record?.domain || "").trim().toLowerCase();
  if (!domain) return null;
  const price = parseNumber(record?.price, 0);
  if (price <= 0) return null;
  const dateValue = record?.saleDate || record?.date;
  const date = dateValue ? new Date(dateValue) : null;
  return {
    domain,
    price: Math.round(price),
    date: date && !Number.isNaN(date.valueOf()) ? date.toISOString().slice(0, 10) : null,
    vertical: String(record?.vertical || "").trim() || null,
    venue: String(record?.venue || record?.source || "Imported").trim() || "Imported",
    source: String(record?.source || record?.venue || "Imported").trim() || "Imported",
    saleType: String(record?.saleType || "aftermarket").trim().toLowerCase(),
    verificationStatus: String(record?.verificationStatus || "imported").trim()
  };
}

function parseCsvRows(csvText) {
  const rows = String(csvText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (rows.length < 2) return [];
  const headers = rows[0].split(",").map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((line) => {
    const cells = line.split(",").map((cell) => cell.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });
    return row;
  });
}

// ---- Persistence ---------------------------------------------------------

async function ensureDataFiles() {
  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  for (const file of [HISTORY_FILE, COMPS_FILE]) {
    try {
      await fs.promises.access(file);
    } catch {
      await fs.promises.writeFile(file, "[]\n", "utf8");
    }
  }
}

async function readJsonArray(file) {
  await ensureDataFiles();
  try {
    const parsed = JSON.parse(await fs.promises.readFile(file, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonArray(file, entries) {
  await ensureDataFiles();
  await fs.promises.writeFile(file, JSON.stringify(entries, null, 2) + "\n", "utf8");
}

const readHistory = () => readJsonArray(HISTORY_FILE);
const writeHistory = (entries) => writeJsonArray(HISTORY_FILE, entries);
const readComps = () => readJsonArray(COMPS_FILE);
const writeComps = (entries) => writeJsonArray(COMPS_FILE, entries);

async function importComparables(payload) {
  const format = String(payload?.format || "json").toLowerCase();
  const source = String(payload?.source || "Imported").trim() || "Imported";
  let rows;
  if (format === "csv") {
    rows = parseCsvRows(payload?.data || "");
  } else {
    rows = Array.isArray(payload?.data) ? payload.data : JSON.parse(String(payload?.data || "[]"));
  }
  const normalized = rows
    .map((row) => normalizeComparable({ ...row, source: row?.source || source }))
    .filter(Boolean);

  const existing = await readComps();
  const byDomain = new Map(existing.map((item) => [item.domain, item]));
  normalized.forEach((entry) => byDomain.set(entry.domain, entry));
  const merged = [...byDomain.values()].slice(0, 5000);
  await writeComps(merged);
  return { imported: normalized.length, total: merged.length };
}

// ---- HTTP helpers --------------------------------------------------------

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

// ---- Server --------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, { ok: true, service: "domain-appraisal-api" });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/appraise") {
      const body = await parseBody(req);
      const domain = body?.domain;
      const imported = await readComps();
      const result = appraise(domain, imported);

      // Auto-save every appraisal to history (GoDaddy-style recent lookups).
      try {
        const history = await readHistory();
        const entry = { generatedAt: new Date().toISOString(), domain: result.domain, result };
        await writeHistory([entry, ...history.filter((h) => h.domain !== result.domain)].slice(0, 50));
      } catch {
        // History is best-effort; never block an appraisal on it.
      }

      sendJson(res, 200, { result });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/history") {
      const history = await readHistory();
      const limit = clamp(parseNumber(url.searchParams.get("limit"), 10), 1, 50);
      sendJson(res, 200, { items: history.slice(0, limit) });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/comps") {
      const imported = await readComps();
      const limit = clamp(parseNumber(url.searchParams.get("limit"), 25), 1, 100);
      sendJson(res, 200, {
        total: MARKET_COMPS.length + imported.length,
        builtIn: MARKET_COMPS.length,
        imported: imported.length,
        items: [...MARKET_COMPS, ...imported].slice(0, limit)
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/comps/import") {
      const body = await parseBody(req);
      const summary = await importComparables(body);
      sendJson(res, 201, { ok: true, ...summary });
      return;
    }

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/public.html")) {
      sendFile(res, path.join(ROOT, "public.html"), "text/html; charset=utf-8");
      return;
    }

    sendJson(res, 404, { error: "Route not found" });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Request failed" });
  }
});

server.listen(PORT, HOST, async () => {
  await ensureDataFiles();
  console.log(`Domain Appraisal API running on http://${HOST}:${PORT}`);
});

module.exports = { server };
