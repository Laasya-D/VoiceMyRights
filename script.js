// VoiceMyRights — frontend ↔ backend bridge
const BACKEND_URL = "https://voicemyrights.onrender.com/";

// ── Sample document presets ───────────────────────────────────────────────────
const PRESETS = {
  "Spotify ToS": `By using Spotify you grant us a worldwide, non-exclusive, royalty-free, sublicensable and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the content. We may share your information with trusted third-party partners for analytics and advertising purposes. Your subscription will automatically renew at the end of each billing period unless cancelled. Spotify reserves the right to terminate your account without notice at any time.`,

  "Instagram ToS": `You grant Instagram a non-exclusive, royalty-free, transferable, sub-licensable, worldwide license to host, use, distribute, modify, run, copy, publicly perform or display, translate, and create derivative works of your content. We collect personal data including device identifiers, cookies, location data, and usage information. This data may be shared with third parties. You waive any class action rights and agree to binding arbitration for all disputes.`,

  "Standard Job Offer": `This offer of employment is contingent upon successful background check. You agree to keep company information confidential. Any inventions created using company resources become company property. The company reserves the right to modify compensation and benefits. Employment is at-will and may be terminated by either party at any time. You agree to non-compete restrictions for 12 months following termination.`,
};

// ── DOM refs ──────────────────────────────────────────────────────────────────
const textarea   = document.querySelector("textarea");
const analyzeBtn = document.getElementById("analyzeBtn");
const fileInput  = document.getElementById("pdfUpload");
const presetBtns = document.querySelectorAll("button:not(#analyzeBtn)");

// ── Preset buttons ────────────────────────────────────────────────────────────
presetBtns.forEach(btn => {
  const label = btn.textContent.trim();
  if (PRESETS[label]) {
    btn.addEventListener("click", () => {
      textarea.value = PRESETS[label];
      textarea.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
});

// ── File upload (TXT only — PDF/DOCX need server-side parsing) ────────────────
fileInput?.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  if (file.name.endsWith(".txt")) {
    const reader = new FileReader();
    reader.onload = e => { textarea.value = e.target.result; };
    reader.readAsText(file);
  } else {
    alert("PDF and DOCX parsing requires a server-side library.\nFor now, copy-paste the text directly or use a .txt file.");
  }
});

// ── Analyze button ────────────────────────────────────────────────────────────
analyzeBtn?.addEventListener("click", async (e) => {
  e.preventDefault(); // stop the <a> navigation until we store results

  const text = textarea.value.trim();
  if (!text) {

    textarea.classList.add("shake");

    setTimeout(()=>{
        textarea.classList.remove("shake");
    },400);

    alert("Please paste some legal text or pick a preset first.");

    return;
}

  // Visual feedback
  analyzeBtn.textContent = "Analyzing…";
  analyzeBtn.disabled    = true;

  try {
    const res  = await fetch(`${BACKEND_URL}/analyze`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ text }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${res.status}`);
    }

    const data = await res.json();

    // Persist to sessionStorage so results.html can read it
    sessionStorage.setItem("vmrResults", JSON.stringify(data));

    // Navigate to results page
    // Save results
    sessionStorage.setItem("vmrResults", JSON.stringify(data));

    // Nice success feedback
    analyzeBtn.innerHTML = "✓ Analysis Complete";
    analyzeBtn.style.background = "#22c55e";

// Wait a moment before redirecting
setTimeout(() => {
    window.location.href = "results.html";
}, 600);

  } catch (err) {
    console.error("Analysis failed:", err);
    alert(`Analysis failed: ${err.message}\n\nMake sure the backend is running on https://voicemyrights.onrender.com/`);
    analyzeBtn.innerHTML = `
  <span class="spinner"></span>
  Analyzing...
  `;
    analyzeBtn.disabled    = false;
  }
});
