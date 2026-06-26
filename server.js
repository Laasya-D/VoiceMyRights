const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// ── Risk keyword definitions ──────────────────────────────────────────────────
const RISK_KEYWORDS = [
  { word: "perpetual",        score: 15, flag: "Perpetual license granted — you can't revoke their right to use your content." },
  { word: "irrevocable",      score: 15, flag: "Irrevocable clause detected — changes may not be undoable even if you leave." },
  { word: "third party",      score: 12, flag: "Third-party data sharing mentioned — your data may reach unknown companies." },
  { word: "third-party",      score: 12, flag: "Third-party data sharing mentioned — your data may reach unknown companies." },
  { word: "data sharing",     score: 12, flag: "Explicit data sharing clause found." },
  { word: "sell your data",   score: 20, flag: "Document may permit selling your personal data." },
  { word: "terminate",        score:  8, flag: "Termination clause present — they can end service on their terms." },
  { word: "terminate without notice", score: 12, flag: "Termination without notice allowed." },
  { word: "license",          score:  5, flag: "Broad license grant found — check what rights you're giving away." },
  { word: "sublicense",       score: 10, flag: "Sub-licensing allowed — your content could be resold or redistributed." },
  { word: "waive",            score: 10, flag: "Rights waiver detected — you may be giving up legal protections." },
  { word: "arbitration",      score: 10, flag: "Mandatory arbitration clause — limits your right to sue in court." },
  { word: "class action",     score: 12, flag: "Class-action waiver found — you can't join group lawsuits." },
  { word: "auto-renew",       score:  8, flag: "Subscription auto-renews — set a calendar reminder to cancel." },
  { word: "automatically renew", score: 8, flag: "Subscription automatically renews each period." },
  { word: "non-refundable",   score:  8, flag: "Non-refundable payment terms detected." },
  { word: "indemnify",        score: 10, flag: "Indemnification clause — you may be liable for their legal costs." },
  { word: "worldwide",        score:  5, flag: "Worldwide rights granted — no geographic limitation on use." },
  { word: "modify",           score:  4, flag: "They can modify terms without prior notice." },
  { word: "surveillance",     score: 18, flag: "Potential surveillance or monitoring language detected." },
  { word: "track",            score:  6, flag: "Tracking of behaviour or usage mentioned." },
  { word: "cookies",          score:  4, flag: "Cookie/tracking technology disclosed." },
];

const PRIVACY_KEYWORDS = [
  "personal data", "personal information", "collect", "store", "retain",
  "share", "sell", "transfer", "third party", "third-party", "analytics",
  "advertising", "profiling", "cookies", "tracking", "location", "device id",
  "email address", "phone number", "biometric",
];

const SUGGESTION_MAP = [
  { trigger: "perpetual",     tip: "Ask for a clause that lets you revoke the license when you stop using the service." },
  { trigger: "irrevocable",   tip: "Request a reversibility clause tied to account deletion." },
  { trigger: "arbitration",   tip: "Try to negotiate out of mandatory arbitration or ensure a small-claims carve-out." },
  { trigger: "class action",  tip: "Seek legal advice — class-action waivers significantly limit your recourse." },
  { trigger: "auto-renew",    tip: "Set a calendar reminder 7 days before each renewal date." },
  { trigger: "automatically renew", tip: "Check the cancellation window; most platforms require 24–48 hours notice." },
  { trigger: "indemnify",     tip: "Cap your indemnification liability to the amount you've paid the service." },
  { trigger: "sublicense",    tip: "Request that sub-licensing be limited to service-delivery purposes only." },
  { trigger: "sell your data",tip: "Do not accept without consulting a privacy lawyer." },
  { trigger: "track",         tip: "Review the privacy policy section and opt out of non-essential tracking where possible." },
];

// ── Analysis logic ────────────────────────────────────────────────────────────
function analyzeText(text) {
  const lower = text.toLowerCase();
  let riskScore = 0;
  const seenFlags = new Set();
  const redFlags = [];
  const suggestions = [];
  const dataPrivacyConcerns = [];
  const summaryPoints = [];

  // Score risky keywords
  for (const { word, score, flag } of RISK_KEYWORDS) {
    if (lower.includes(word) && !seenFlags.has(flag)) {
      seenFlags.add(flag);
      riskScore += score;
      redFlags.push(flag);
    }
  }

  // Data privacy concerns
  for (const kw of PRIVACY_KEYWORDS) {
    if (lower.includes(kw) && !dataPrivacyConcerns.includes(kw)) {
      dataPrivacyConcerns.push(`Mentions "${kw}" — review how this data is used.`);
    }
  }

  // Suggestions
  for (const { trigger, tip } of SUGGESTION_MAP) {
    if (lower.includes(trigger)) {
      suggestions.push(tip);
    }
  }

  // Default suggestion
  if (suggestions.length === 0) {
    suggestions.push("This document appears relatively standard. Always keep a copy for your records.");
  }

  // Clamp score to 0–100
  riskScore = Math.min(riskScore, 100);

  // Build summary
  const wordCount = text.trim().split(/\s+/).length;
  summaryPoints.push(`Document is approximately ${wordCount} words long.`);

  if (riskScore >= 70) {
    summaryPoints.push("This agreement contains multiple high-risk clauses — you should review carefully before signing.");
  } else if (riskScore >= 40) {
    summaryPoints.push("This agreement has moderate risk. A few clauses are worth discussing with a lawyer.");
  } else if (riskScore >= 15) {
    summaryPoints.push("This agreement is fairly standard with a few items to keep an eye on.");
  } else {
    summaryPoints.push("No major red flags found. This looks like a routine agreement.");
  }

  if (redFlags.length > 0) {
    summaryPoints.push(`${redFlags.length} concern(s) flagged: ${redFlags.length <= 3 ? redFlags.map(f => f.split("—")[0].trim()).join("; ") : "see full list below"}.`);
  }

  if (dataPrivacyConcerns.length > 0) {
    summaryPoints.push(`${dataPrivacyConcerns.length} data-privacy reference(s) detected.`);
  }

  return {
    riskScore,
    summary: summaryPoints.join(" "),
    redFlags: redFlags.length > 0 ? redFlags : ["No significant red flags detected."],
    dataPrivacyConcerns: dataPrivacyConcerns.length > 0 ? dataPrivacyConcerns : ["No explicit privacy concerns found."],
    suggestions,
  };
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.post("/analyze", (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Request body must include a non-empty `text` string." });
  }

  if (text.length > 100_000) {
    return res.status(413).json({ error: "Text exceeds 100,000 character limit." });
  }

  const result = analyzeText(text);
  res.json(result);
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`VoiceMyRights backend running → http://localhost:${PORT}`);
});
