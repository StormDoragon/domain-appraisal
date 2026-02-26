const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");
const COMPS_FILE = path.join(DATA_DIR, "comps.json");

const tldMultipliers = {
  ".com": 1.45,
  ".ai": 1.35,
  ".io": 1.22,
  ".org": 1.1,
  ".co": 1.03,
  ".net": 0.95
};

const verticalMultipliers = {
  AI: 1.33,
  FinTech: 1.28,
  Cybersecurity: 1.26,
  Healthcare: 1.18,
  Travel: 1.07,
  Ecommerce: 1.12
};

const personasByVertical = {
  AI: ["LLM Startup", "Creative SaaS", "AI Studio", "VC-backed Rebrand"],
  FinTech: ["Payments App", "Trading Platform", "Embedded Finance API", "Crypto Custody"],
  Cybersecurity: ["SOC Automation", "Identity Security", "Threat Intel", "Compliance SaaS"],
  Healthcare: ["Digital Clinic", "Patient Data Platform", "Health Marketplace", "Remote Care"],
  Travel: ["Booking Engine", "Travel Community", "Geo Discovery App", "Airline Tooling"],
  Ecommerce: ["DTC Brand", "Conversion Suite", "Checkout SaaS", "Retail Analytics"]
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function asMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function seedFromDomain(domain) {
  return [...domain].reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

function noise(seed, index) {
  const x = Math.sin(seed * 0.17 + index * 12.99) * 10000;
  return x - Math.floor(x);
}

function domainCore(domain) {
  const cleaned = String(domain || "").trim().toLowerCase();
  const parts = cleaned.split(".");
  return {
    full: cleaned,
    label: parts[0] || "",
    tld: `.${parts[parts.length - 1] || "com"}`
  };
}

function syllableCount(word) {
  return (word.toLowerCase().match(/[aeiouy]+/g) || []).length || 1;
}

function scoreDomainBrandability(label) {
  const lengthScore = clamp(100 - Math.abs(9 - label.length) * 8, 35, 100);
  const vowelRatio = (label.match(/[aeiou]/g) || []).length / Math.max(label.length, 1);
  const vowelScore = clamp(100 - Math.abs(0.42 - vowelRatio) * 190, 20, 100);
  const hyphenPenalty = label.includes("-") ? 26 : 0;
  const digitPenalty = /\d/.test(label) ? 20 : 0;
  const syllables = syllableCount(label);
  const speakScore = clamp(100 - Math.abs(3 - syllables) * 23, 30, 100);
  const raw = 0.4 * lengthScore + 0.24 * vowelScore + 0.36 * speakScore - hyphenPenalty - digitPenalty;
  return clamp(raw, 15, 100);
}

function tokenizeKeywords(keywordText) {
  return String(keywordText || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeComparable(record) {
  const domain = String(record?.domain || "").trim().toLowerCase();
  if (!domain) {
    return null;
  }

  const core = domainCore(domain);
  const date = record?.date ? new Date(record.date) : null;
  const price = parseNumber(record?.price, 0);
  if (price <= 0) {
    return null;
  }

  return {
    domain,
    label: core.label,
    tld: core.tld,
    price: Math.round(price),
    vertical: String(record?.vertical || "").trim() || null,
    source: String(record?.source || "Imported").trim() || "Imported",
    date: date && !Number.isNaN(date.valueOf()) ? date.toISOString() : null,
    traffic: parseNumber(record?.traffic, 0),
    cpc: parseNumber(record?.cpc, 0),
    age: parseNumber(record?.age, 0),
    keywords: tokenizeKeywords(record?.keywords)
  };
}

function parseCsvRows(csvText) {
  const rows = String(csvText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    return [];
  }

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

function trigrams(value) {
  const normalized = `  ${String(value || "").toLowerCase()}  `;
  const grams = new Set();
  for (let index = 0; index < normalized.length - 2; index += 1) {
    grams.add(normalized.slice(index, index + 3));
  }
  return grams;
}

function jaccard(setA, setB) {
  if (!setA.size && !setB.size) {
    return 1;
  }
  let intersection = 0;
  setA.forEach((item) => {
    if (setB.has(item)) {
      intersection += 1;
    }
  });
  const union = new Set([...setA, ...setB]).size;
  return union ? intersection / union : 0;
}

function keywordSimilarity(inputKeywords, compKeywords) {
  const a = new Set(inputKeywords);
  const b = new Set(compKeywords);
  return jaccard(a, b);
}

function tldSimilarity(targetTld, compTld) {
  if (targetTld === compTld) {
    return 1;
  }
  const premium = new Set([".com", ".ai", ".io"]);
  if (premium.has(targetTld) && premium.has(compTld)) {
    return 0.65;
  }
  return 0.3;
}

function recencyScore(dateIso) {
  if (!dateIso) {
    return 0.6;
  }
  const ageMs = Date.now() - new Date(dateIso).valueOf();
  const ageDays = ageMs / 86400000;
  return clamp(1 - ageDays / 1460, 0.28, 1);
}

function findComparableMatches(input, comparables, limit = 4) {
  const inputCore = domainCore(input.domain);
  const inputTrigrams = trigrams(inputCore.label);
  const inputKeywords = tokenizeKeywords(input.keywords);

  const scored = comparables
    .map((comp) => {
      const labelSimilarity = jaccard(inputTrigrams, trigrams(comp.label));
      const lengthSimilarity = clamp(1 - Math.abs(inputCore.label.length - comp.label.length) / 14, 0.25, 1);
      const tldScore = tldSimilarity(input.tld, comp.tld);
      const verticalScore = !comp.vertical ? 0.62 : comp.vertical === input.vertical ? 1 : 0.45;
      const kwScore = keywordSimilarity(inputKeywords, comp.keywords || []);
      const recency = recencyScore(comp.date);

      const similarity =
        labelSimilarity * 0.34 +
        lengthSimilarity * 0.18 +
        tldScore * 0.18 +
        verticalScore * 0.14 +
        kwScore * 0.1 +
        recency * 0.06;

      return {
        ...comp,
        similarity: Number(similarity.toFixed(4))
      };
    })
    .filter((comp) => comp.similarity >= 0.35)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return scored;
}

function normalizeInput(input) {
  const domain = String(input?.domain || "").trim().toLowerCase();
  const keywordText = String(input?.keywords || "").trim();
  if (!domain) {
    throw new Error("Domain is required");
  }

  const tld = String(input?.tld || ".com");
  const vertical = String(input?.vertical || "AI");

  return {
    domain,
    vertical,
    tld,
    traffic: Number(input?.traffic || 0),
    cpc: Number(input?.cpc || 0),
    age: Number(input?.age || 0),
    intent: Number(input?.intent || 1),
    keywords: keywordText
  };
}

function runAppraisal(inputRaw, options = {}) {
  const input = normalizeInput(inputRaw);
  const core = domainCore(input.domain);
  const keywordList = tokenizeKeywords(input.keywords);

  const seed = seedFromDomain(core.full || "domain.com");
  const trafficScore = clamp(Math.log10(input.traffic + 1) * 24, 8, 100);
  const cpcScore = clamp(Math.sqrt(input.cpc + 0.1) * 31, 6, 100);
  const ageScore = clamp(Math.log(input.age + 1) * 26, 8, 100);
  const brandScore = scoreDomainBrandability(core.label);
  const keywordDepth = clamp(keywordList.length * 17 + keywordList.join("").length * 0.85, 10, 100);

  const tldBoost = tldMultipliers[input.tld] || 1;
  const verticalBoost = verticalMultipliers[input.vertical] || 1;

  const composite = clamp(
    0.31 * brandScore + 0.22 * trafficScore + 0.15 * cpcScore + 0.12 * ageScore + 0.2 * keywordDepth,
    20,
    98
  );

  const qualityScore = Math.round(clamp(composite * tldBoost * 0.75, 12, 100));

  const baseValue =
    (trafficScore * 120 + cpcScore * 170 + brandScore * 90 + keywordDepth * 70 + ageScore * 60) *
    tldBoost *
    verticalBoost *
    input.intent;

  const premiumNoise = 0.84 + noise(seed, 1) * 0.34;
  const estimated = Math.round(baseValue * premiumNoise);
  const low = Math.round(estimated * 0.82);
  const high = Math.round(estimated * 1.3);

  const liquidityScore = clamp((qualityScore * 0.54 + trafficScore * 0.26 + cpcScore * 0.2) / 1.1, 0, 100);
  const liquidityLabel = liquidityScore > 74 ? "High" : liquidityScore > 52 ? "Medium" : "Niche";

  const confidence = clamp(55 + (ageScore + keywordDepth + Math.min(input.traffic / 700, 30)) * 0.35, 45, 97);
  const confidenceLabel = confidence > 84 ? "Very High" : confidence > 70 ? "High" : confidence > 58 ? "Moderate" : "Early Data";

  const personaPool = personasByVertical[input.vertical] || ["Strategic Buyer", "Domain Investor", "Startup"];
  const personas = [
    personaPool[Math.floor(noise(seed, 3) * personaPool.length)],
    personaPool[Math.floor(noise(seed, 4) * personaPool.length)],
    "Global Domain Fund"
  ].filter((item, index, arr) => arr.indexOf(item) === index);

  const syntheticComps = Array.from({ length: 4 }, (_, index) => {
    const comparablePrice = Math.round(estimated * (0.61 + noise(seed, index + 8) * 0.72));
    const suffixes = ["labs", "stack", "forge", "grid", "mint", "pilot", "verse"];
    const stem = core.label.slice(0, Math.max(4, Math.min(core.label.length, 7))) || "prime";
    const compName = `${stem}${suffixes[Math.floor(noise(seed, index + 21) * suffixes.length)]}${input.tld}`;
    return { domain: compName, price: comparablePrice, similarity: null, source: "Synthetic" };
  }).sort((a, b) => b.price - a.price);

  const importedComps = Array.isArray(options.comparables) ? options.comparables : [];
  const matchedRealComps = importedComps.length ? findComparableMatches(input, importedComps, 4) : [];

  let blendedEstimated = estimated;
  if (matchedRealComps.length) {
    const weighted = matchedRealComps.reduce(
      (acc, item) => {
        const weight = item.similarity || 0.4;
        return {
          numerator: acc.numerator + item.price * weight,
          denominator: acc.denominator + weight
        };
      },
      { numerator: 0, denominator: 0 }
    );
    const matchedAverage = weighted.denominator ? weighted.numerator / weighted.denominator : estimated;
    blendedEstimated = Math.round(estimated * 0.56 + matchedAverage * 0.44);
  }

  const blendedLow = Math.round(blendedEstimated * 0.82);
  const blendedHigh = Math.round(blendedEstimated * 1.3);
  const comps = matchedRealComps.length
    ? matchedRealComps.map((comp) => ({
        domain: comp.domain,
        price: comp.price,
        similarity: comp.similarity,
        source: comp.source || "Imported"
      }))
    : syntheticComps;

  const opportunities = [];
  const risks = [];

  if (brandScore > 74) {
    opportunities.push("Pronounceable and compact brand pattern supports inbound buyer memory.");
  }
  if (keywordDepth > 65) {
    opportunities.push("Multi-intent semantic coverage broadens buyer universe across sub-verticals.");
  }
  if (liquidityScore > 70) {
    opportunities.push("Liquidity profile suggests healthy investor resale probability.");
  }
  if (core.label.length > 13) {
    risks.push("Long label can reduce direct navigation and verbal recall.");
  }
  if (input.age < 2) {
    risks.push("Young domain age may lower trust for premium strategic buyers.");
  }
  if (input.cpc < 1.6) {
    risks.push("Low CPC signal can compress buyer urgency in paid acquisition-heavy sectors.");
  }
  if (risks.length === 0) {
    risks.push("No major structural risk flagged; main variable is negotiation execution speed.");
  }

  const components = {
    Brand: Math.round(brandScore),
    Demand: Math.round(trafficScore * 0.55 + cpcScore * 0.45),
    Longevity: Math.round(ageScore),
    Semantic: Math.round(keywordDepth),
    TLD: Math.round((tldBoost / 1.45) * 100)
  };

  const strategy = `Launch at ${asMoney(blendedHigh)} with a floor near ${asMoney(blendedLow)}. Prioritize ${personas[0]} and ${personas[1]} outreach. Position ${core.full} as a category-defining digital asset with ${Math.round(confidence)}% confidence and ${liquidityLabel.toLowerCase()}-to-${liquidityLabel === "High" ? "high" : "medium"} liquidity. Offer a 7-day decision window and anchor using top comparable ${comps[0].domain} at ${asMoney(comps[0].price)}.`;

  return {
    core,
    estimated: blendedEstimated,
    low: blendedLow,
    high: blendedHigh,
    modelOnlyEstimated: estimated,
    qualityScore,
    liquidityLabel,
    confidenceLabel,
    confidence: Math.round(confidence),
    components,
    personas,
    comps,
    compsSource: matchedRealComps.length ? "Imported" : "Synthetic",
    matchedCompsCount: matchedRealComps.length,
    opportunities,
    risks,
    strategy
  };
}

async function ensureDataFiles() {
  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.promises.access(HISTORY_FILE);
  } catch {
    await fs.promises.writeFile(HISTORY_FILE, "[]\n", "utf8");
  }
  try {
    await fs.promises.access(COMPS_FILE);
  } catch {
    await fs.promises.writeFile(COMPS_FILE, "[]\n", "utf8");
  }
}

async function readHistory() {
  await ensureDataFiles();
  const content = await fs.promises.readFile(HISTORY_FILE, "utf8");
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeHistory(entries) {
  await ensureDataFiles();
  await fs.promises.writeFile(HISTORY_FILE, JSON.stringify(entries, null, 2) + "\n", "utf8");
}

async function readComps() {
  await ensureDataFiles();
  const content = await fs.promises.readFile(COMPS_FILE, "utf8");
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeComps(entries) {
  await ensureDataFiles();
  await fs.promises.writeFile(COMPS_FILE, JSON.stringify(entries, null, 2) + "\n", "utf8");
}

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
  normalized.forEach((entry) => {
    byDomain.set(entry.domain, entry);
  });

  const merged = [...byDomain.values()].slice(0, 5000);
  await writeComps(merged);

  return {
    imported: normalized.length,
    total: merged.length
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) {
    return {};
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(text);
}

function sendFile(res, filePath, contentType = "text/plain; charset=utf-8") {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, { ok: true, service: "domain-appraisal-api" });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/appraise") {
      const body = await parseBody(req);
      const comps = await readComps();
      const result = runAppraisal(body, { comparables: comps });
      sendJson(res, 200, { result });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/comps") {
      const comps = await readComps();
      const limit = clamp(Number(url.searchParams.get("limit") || 25), 1, 100);
      sendJson(res, 200, { total: comps.length, items: comps.slice(0, limit) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/comps/import") {
      const body = await parseBody(req);
      const summary = await importComparables(body);
      sendJson(res, 201, { ok: true, ...summary });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/comps/match") {
      const body = await parseBody(req);
      const input = normalizeInput(body);
      const comps = await readComps();
      const items = findComparableMatches(input, comps, 6);
      sendJson(res, 200, { items, totalPool: comps.length });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/history") {
      const history = await readHistory();
      const limit = clamp(Number(url.searchParams.get("limit") || 20), 1, 200);
      sendJson(res, 200, { items: history.slice(0, limit) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/history") {
      const body = await parseBody(req);
      const input = normalizeInput(body?.input || body);
      const result = body?.result || runAppraisal(input);
      const history = await readHistory();

      const entry = {
        generatedAt: new Date().toISOString(),
        input,
        result
      };

      const updated = [entry, ...history].slice(0, 200);
      await writeHistory(updated);
      sendJson(res, 201, { ok: true, entry });
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
