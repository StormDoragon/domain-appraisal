"use strict";

const { DICTIONARY, KEYWORD_TIERS, MARKET_COMPS } = require("./market-data");

// TLD price multipliers relative to .com (the model is calibrated to .com).
const TLD_MULTIPLIERS = {
  ".com": 1.0,
  ".ai": 0.85,
  ".io": 0.6,
  ".co": 0.45,
  ".app": 0.42,
  ".dev": 0.38,
  ".net": 0.32,
  ".org": 0.32,
  ".xyz": 0.18,
  ".info": 0.14,
  ".biz": 0.14
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function domainParts(domain) {
  const cleaned = String(domain || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
  const parts = cleaned.split(".");
  const tld = parts.length > 1 ? `.${parts.slice(1).join(".")}` : ".com";
  const label = parts[0] || "";
  return { full: cleaned || label, label, tld };
}

// Split a label into words by maximizing dictionary-recognized character
// coverage (preferring fewer pieces on ties). Lets the engine tell real-word
// domains apart from random strings.
function segment(label) {
  const n = label.length;
  if (!n) {
    return [];
  }
  const dp = new Array(n + 1);
  dp[n] = { coverage: 0, pieces: 0, words: [] };
  for (let i = n - 1; i >= 0; i -= 1) {
    let best = null;
    for (let j = i + 1; j <= n; j += 1) {
      const sub = label.slice(i, j);
      const known = DICTIONARY.has(sub) && sub.length > 1;
      const rest = dp[j];
      const coverage = rest.coverage + (known ? sub.length : 0);
      const pieces = rest.pieces + 1;
      if (
        !best ||
        coverage > best.coverage ||
        (coverage === best.coverage && pieces < best.pieces)
      ) {
        best = { coverage, pieces, words: [{ word: sub, known }, ...rest.words] };
      }
    }
    dp[i] = best;
  }
  return dp[0].words;
}

function pronounceability(label) {
  if (!label) {
    return 0;
  }
  const letters = label.replace(/[^a-z]/g, "");
  if (!letters) {
    return 25;
  }
  const vowelCount = [...letters].filter((ch) => VOWELS.has(ch)).length;
  const vowelRatio = vowelCount / letters.length;
  let longestConsonantRun = 0;
  let run = 0;
  for (const ch of letters) {
    if (VOWELS.has(ch)) {
      run = 0;
    } else {
      run += 1;
      longestConsonantRun = Math.max(longestConsonantRun, run);
    }
  }
  const clusterPenalty = Math.max(0, longestConsonantRun - 3) * 20;
  const vowelPenalty = Math.abs(0.42 - vowelRatio) * 150;
  return clamp(100 - vowelPenalty - clusterPenalty, 8, 100);
}

function keywordTier(words, label) {
  let bestTier = 0; // 0 = none, else 1 (best) .. 3
  const consider = (token) => {
    const tier = KEYWORD_TIERS[token];
    if (tier && (bestTier === 0 || tier < bestTier)) {
      bestTier = tier;
    }
  };
  words.forEach((w) => consider(w.word));
  // Also catch embedded keywords inside brandables (e.g. "payflow").
  Object.keys(KEYWORD_TIERS).forEach((kw) => {
    if (kw.length >= 3 && label.includes(kw)) {
      consider(kw);
    }
  });
  return bestTier;
}

function lengthScore(length) {
  if (length <= 2) return 100;
  if (length <= 3) return 98;
  if (length <= 4) return 94;
  if (length <= 5) return 88;
  if (length <= 6) return 82;
  if (length <= 8) return 72;
  if (length <= 10) return 62;
  if (length <= 12) return 52;
  if (length <= 15) return 40;
  if (length <= 18) return 30;
  return 20;
}

function analyzeDomain(domain) {
  const { full, label, tld } = domainParts(domain);
  const length = label.length;
  const hasHyphen = label.includes("-");
  const hasNumber = /\d/.test(label);
  const words = segment(label);
  const knownWords = words.filter((w) => w.known);
  const coveredChars = knownWords.reduce((sum, w) => sum + w.word.length, 0);
  const coverageRatio = length ? coveredChars / length : 0;
  const isSingleWord = knownWords.length === 1 && coverageRatio >= 0.95;
  const isTwoWords = knownWords.length === 2 && coverageRatio >= 0.9;
  const pronounce = pronounceability(label);
  const tier = keywordTier(words, label);

  return {
    full,
    label,
    tld,
    length,
    hasHyphen,
    hasNumber,
    words,
    knownWords: knownWords.map((w) => w.word),
    coverageRatio,
    isSingleWord,
    isTwoWords,
    pronounce,
    keywordTier: tier
  };
}

function scoreDomain(f) {
  const lenScore = lengthScore(f.length);

  let wordScore;
  if (f.isSingleWord) {
    wordScore = 100;
  } else if (f.isTwoWords) {
    wordScore = 86;
  } else if (f.coverageRatio >= 0.5) {
    wordScore = clamp(52 + f.coverageRatio * 42, 40, 92);
  } else {
    // Brandable / coined word: lean on pronounceability.
    wordScore = clamp(28 + f.pronounce * 0.55, 25, 82);
  }

  const keywordScore =
    f.keywordTier === 1 ? 100 : f.keywordTier === 2 ? 80 : f.keywordTier === 3 ? 64 : 42;

  let penalty = 0;
  if (f.hasHyphen) penalty += 22;
  if (f.hasNumber) penalty += 16;
  if (f.length > 18) penalty += 8;

  const quality = clamp(
    0.32 * lenScore + 0.3 * wordScore + 0.14 * f.pronounce + 0.24 * keywordScore - penalty,
    5,
    99
  );

  return {
    quality: Math.round(quality),
    components: {
      Length: Math.round(lenScore),
      Memorability: Math.round(wordScore * 0.6 + f.pronounce * 0.4),
      Keywords: Math.round(keywordScore),
      TLD: Math.round((TLD_MULTIPLIERS[f.tld] || 0.25) * 100)
    }
  };
}

// Map a quality score to a baseline .com dollar value, then apply structural
// premiums (short length, real words, premium keywords) and the TLD multiplier.
function baseEstimate(quality, f) {
  let dollars = 110 * Math.pow(10, (quality - 15) / 30);

  // Short, memorable strings carry a steep scarcity premium.
  if (f.length <= 3) dollars *= 18;
  else if (f.length === 4) dollars *= 6;
  else if (f.length === 5) dollars *= 2.6;
  else if (f.length === 6) dollars *= 1.5;

  // Real dictionary words sell far above coined strings of the same length.
  if (f.isSingleWord) dollars *= 2.6;
  else if (f.isTwoWords) dollars *= 1.35;

  if (f.keywordTier === 1) dollars *= 1.5;
  else if (f.keywordTier === 2) dollars *= 1.2;

  dollars *= TLD_MULTIPLIERS[f.tld] || 0.25;

  if (f.hasHyphen) dollars *= 0.55;
  if (f.hasNumber) dollars *= 0.65;

  return Math.max(Math.round(dollars), 25);
}

// ---- Comparable matching -------------------------------------------------

function trigrams(value) {
  const padded = `  ${String(value || "").toLowerCase()}  `;
  const grams = new Set();
  for (let i = 0; i < padded.length - 2; i += 1) {
    grams.add(padded.slice(i, i + 3));
  }
  return grams;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  let intersection = 0;
  a.forEach((item) => {
    if (b.has(item)) intersection += 1;
  });
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

function tldAffinity(a, b) {
  if (a === b) return 1;
  const premium = new Set([".com", ".ai", ".io", ".co"]);
  if (premium.has(a) && premium.has(b)) return 0.6;
  return 0.3;
}

function matchComps(f, comps, limit = 6) {
  const targetTrigrams = trigrams(f.label);
  const targetWords = new Set(f.knownWords);

  return comps
    .filter((comp) => domainParts(comp.domain).full !== f.full)
    .map((comp) => {
      const compParts = domainParts(comp.domain);
      const labelSim = jaccard(targetTrigrams, trigrams(compParts.label));
      const lengthSim = clamp(1 - Math.abs(f.length - compParts.label.length) / 12, 0.2, 1);
      const tldSim = tldAffinity(f.tld, compParts.tld);
      const compWords = new Set(segment(compParts.label).filter((w) => w.known).map((w) => w.word));
      let sharedWords = 0;
      targetWords.forEach((w) => {
        if (compWords.has(w)) sharedWords += 1;
      });
      const wordSim = targetWords.size ? sharedWords / targetWords.size : 0;

      const similarity =
        labelSim * 0.4 + wordSim * 0.28 + lengthSim * 0.2 + tldSim * 0.12;

      return { ...comp, label: compParts.label, tld: compParts.tld, similarity: Number(similarity.toFixed(4)) };
    })
    .filter((c) => c.similarity >= 0.28)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

function weightedMedian(items, getValue, getWeight) {
  const weighted = items
    .map((item) => ({ value: getValue(item), weight: Math.max(getWeight(item), 0.0001) }))
    .filter((item) => Number.isFinite(item.value) && item.value > 0)
    .sort((a, b) => a.value - b.value);
  if (!weighted.length) return null;
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let running = 0;
  for (const item of weighted) {
    running += item.weight;
    if (running >= total / 2) return item.value;
  }
  return weighted[weighted.length - 1].value;
}

function asMoney(amount) {
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

// ---- Main entry point ----------------------------------------------------

function appraise(domain, importedComps = []) {
  if (!String(domain || "").trim()) {
    throw new Error("Domain is required");
  }

  const f = analyzeDomain(domain);
  const { quality, components } = scoreDomain(f);
  const modelEstimate = baseEstimate(quality, f);

  const pool = [...MARKET_COMPS, ...(Array.isArray(importedComps) ? importedComps : [])];
  const comps = matchComps(f, pool, 6);

  const compMedian = comps.length
    ? weightedMedian(comps, (c) => c.price, (c) => c.similarity)
    : null;
  const avgSimilarity = comps.length
    ? comps.reduce((sum, c) => sum + c.similarity, 0) / comps.length
    : 0;

  // Blend the model estimate toward comparable sales, weighted by how similar
  // and how many comps we found. Only meaningfully similar comps move the
  // number, so a random string can't inherit the price of an unrelated
  // mega-sale that happens to share a couple of letters.
  let estimate = modelEstimate;
  if (compMedian && comps.length >= 2 && avgSimilarity >= 0.42) {
    const blend = clamp((avgSimilarity - 0.3) * (comps.length >= 4 ? 1.3 : 0.9), 0.1, 0.65);
    estimate = Math.round(modelEstimate * (1 - blend) + compMedian * blend);
  }

  // Coined/random strings shouldn't drift far above what the structural model
  // supports, even after blending.
  if (!f.isSingleWord && !f.isTwoWords) {
    estimate = Math.min(estimate, modelEstimate * 6);
  }

  // Confidence rises with comp support and falls for thin evidence.
  const confidence = Math.round(
    clamp(
      40 + comps.length * 5 + avgSimilarity * 35 + (f.isSingleWord || f.isTwoWords ? 8 : 0),
      35,
      96
    )
  );
  const confidenceLabel =
    confidence >= 80 ? "High" : confidence >= 62 ? "Medium" : "Low";

  // Wider range when confidence is low.
  const spread = clamp(0.5 - confidence / 260, 0.16, 0.42);
  const low = Math.round(estimate * (1 - spread));
  const high = Math.round(estimate * (1 + spread * 1.4));

  const reasons = [];
  if (f.isSingleWord) reasons.push(`"${f.label}" is a recognized dictionary word, which buyers pay a premium for.`);
  else if (f.isTwoWords) reasons.push(`Reads as two clear words (${f.knownWords.join(" + ")}), keeping it brandable and memorable.`);
  else if (f.pronounce >= 70) reasons.push("Short, pronounceable coined name that works well as a brand.");
  if (f.length <= 6) reasons.push(`Only ${f.length} characters — short names are scarce and command higher prices.`);
  else if (f.length >= 16) reasons.push(`At ${f.length} characters it's on the long side, which limits resale value.`);
  if (f.keywordTier === 1) reasons.push("Contains a top-tier commercial keyword with strong end-user demand.");
  else if (f.keywordTier === 2) reasons.push("Includes an in-demand category keyword.");
  if (f.tld === ".com") reasons.push(".com is the most trusted and liquid extension.");
  else reasons.push(`${f.tld} typically resells below an equivalent .com.`);
  if (f.hasHyphen) reasons.push("Hyphen reduces type-in traffic and perceived quality.");
  if (f.hasNumber) reasons.push("Numbers add ambiguity when the name is spoken aloud.");
  if (comps.length) reasons.push(`Anchored to ${comps.length} comparable sale${comps.length > 1 ? "s" : ""} of similar domains.`);

  return {
    domain: f.full,
    label: f.label,
    tld: f.tld,
    estimate,
    low,
    high,
    estimateFormatted: asMoney(estimate),
    rangeFormatted: `${asMoney(low)} – ${asMoney(high)}`,
    qualityScore: quality,
    confidence,
    confidenceLabel,
    modelEstimate,
    components,
    attributes: {
      length: f.length,
      words: f.knownWords,
      isDictionaryWord: f.isSingleWord,
      hasHyphen: f.hasHyphen,
      hasNumber: f.hasNumber,
      keywordTier: f.keywordTier,
      pronounceability: Math.round(f.pronounce)
    },
    comparableSales: comps.map((c) => ({
      domain: c.domain,
      price: c.price,
      priceFormatted: asMoney(c.price),
      date: c.date,
      venue: c.venue,
      vertical: c.vertical,
      similarity: c.similarity,
      matchPercent: Math.round(c.similarity * 100)
    })),
    compsSummary: {
      matched: comps.length,
      medianPrice: compMedian ? Math.round(compMedian) : null,
      averageSimilarity: Number(avgSimilarity.toFixed(3))
    },
    reasons,
    modelVersion: "2026.06-govalue-style"
  };
}

module.exports = { appraise, analyzeDomain, scoreDomain, matchComps, asMoney, TLD_MULTIPLIERS };
