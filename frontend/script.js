/* ============================================================
   AI Resume Analyzer — Frontend Logic
   ============================================================ */
const API_ENDPOINT =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000/analyze-resume"
    : "https://YOUR_RENDER_BACKEND_URL/analyze-resume";
/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
const els = {
  form: $("resumeForm"),
  name: $("name"),
  email: $("email"),
  resume: $("resume"),
  dropZone: $("dropZone"),
  fileText: document.querySelector(".file-text"),
  analyzeBtn: $("analyzeBtn"),
  hero: $("heroSection"),
  loading: $("loadingSection"),
  error: $("errorSection"),
  errorMessage: $("errorMessage"),
  errorRetry: $("errorRetry"),
  dashboard: $("dashboard"),
  analyzeAnother: $("analyzeAnother"),
  downloadReport: $("downloadReport"),
  themeToggle: $("themeToggle"),
  strengths: $("strengthsList"),
  weaknesses: $("weaknessesList"),
  missing: $("missingList"),
  suggestions: $("suggestionsList"),
  roles: $("rolesChips"),
  summary: $("improvedSummary"),
  toast: $("toast"),
  year: $("year"),
};
let lastReport = null;
let lastUser = { name: "", email: "" };
/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  els.year.textContent = new Date().getFullYear();
  initTheme();
  els.form.addEventListener("submit", submitResume);
  els.themeToggle.addEventListener("click", toggleTheme);
  els.analyzeAnother.addEventListener("click", resetDashboard);
  els.downloadReport.addEventListener("click", downloadPdfReport);
  els.errorRetry.addEventListener("click", resetToForm);
  els.resume.addEventListener("change", handleFileChange);
});
/* ---------- Theme ---------- */
function initTheme() {
  const saved = localStorage.getItem("resumeiq-theme");
  const theme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("resumeiq-theme", next);
}
/* ---------- File input ---------- */
function handleFileChange() {
  const file = els.resume.files[0];
  if (file) {
    els.dropZone.classList.add("has-file");
    els.fileText.textContent = file.name;
  } else {
    els.dropZone.classList.remove("has-file");
    els.fileText.textContent = "Click or drop your PDF here";
  }
}
/* ---------- Submit ---------- */
async function submitResume(e) {
  e.preventDefault();
  const name = els.name.value.trim();
  const email = els.email.value.trim();
  const file = els.resume.files[0];
  if (!name || !email || !file) {
    showToast("Please fill in all fields");
    return;
  }
  if (file.type !== "application/pdf") {
    showToast("Please upload a PDF file");
    return;
  }
  els.analyzeBtn.disabled = true;
  els.hero.classList.add("hidden");
  els.error.classList.add("hidden");
  els.loading.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("resume", file);
  try {
    const res = await fetch(API_ENDPOINT, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    const data = await res.json();
    if (!data || typeof data !== "object") throw new Error("Invalid response");
    lastReport = data;
    lastUser = { name, email };
    showReport(data);
  } catch (err) {
    console.error(err);
    showError(err.message || "Unable to analyze your resume.");
  } finally {
    els.analyzeBtn.disabled = false;
  }
}
/* ---------- Show report ---------- */
function showReport(data) {
  els.loading.classList.add("hidden");
  els.error.classList.add("hidden");
  els.dashboard.classList.remove("hidden");
  const scores = {
    overall: safeNum(data.overall_score),
    ats: safeNum(data.ats_score),
    technical: safeNum(data.technical_score),
    communication: safeNum(data.communication_score),
  };
  Object.entries(scores).forEach(([key, value]) => {
    const card = document.querySelector(`.score-card[data-score="${key}"]`);
    if (!card) return;
    const numEl = card.querySelector(".num");
    const bar = card.querySelector(".progress-bar");
    card.classList.remove("good", "mid", "bad");
    card.classList.add(scoreClass(value));
    animateScore(numEl, value);
    animateProgress(bar, value);
  });
  renderList(els.strengths, data.strengths);
  renderList(els.weaknesses, data.weaknesses);
  renderList(els.missing, data.missing_skills);
  renderList(els.suggestions, data.suggestions);
  renderRoles(els.roles, data.recommended_roles);
  els.summary.textContent =
    typeof data.improved_summary === "string" && data.improved_summary.trim()
      ? data.improved_summary
      : "No improved summary available.";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function safeNum(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
function scoreClass(v) {
  if (v >= 75) return "good";
  if (v >= 50) return "mid";
  return "bad";
}
/* ---------- Renderers ---------- */
function renderList(container, items) {
  container.innerHTML = "";
  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    const li = document.createElement("li");
    li.textContent = "No items available.";
    li.style.opacity = "0.6";
    container.appendChild(li);
    return;
  }
  list.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = String(text);
    container.appendChild(li);
  });
}
function renderRoles(container, roles) {
  container.innerHTML = "";
  const list = Array.isArray(roles) ? roles : [];
  if (!list.length) {
    const span = document.createElement("span");
    span.className = "muted";
    span.textContent = "No recommended roles.";
    container.appendChild(span);
    return;
  }
  list.forEach((role) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = String(role);
    container.appendChild(chip);
  });
}
/* ---------- Animations ---------- */
function animateScore(el, target) {
  const duration = 1200;
  const start = performance.now();
  const from = 0;
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function animateProgress(el, target) {
  el.style.width = "0%";
  requestAnimationFrame(() => {
    el.style.width = target + "%";
  });
}
/* ---------- Errors / Reset ---------- */
function showError(msg) {
  els.loading.classList.add("hidden");
  els.dashboard.classList.add("hidden");
  els.hero.classList.add("hidden");
  els.error.classList.remove("hidden");
  els.errorMessage.textContent = msg;
}
function resetToForm() {
  els.error.classList.add("hidden");
  els.loading.classList.add("hidden");
  els.dashboard.classList.add("hidden");
  els.hero.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function resetDashboard() {
  els.dashboard.classList.add("hidden");
  els.form.reset();
  els.dropZone.classList.remove("has-file");
  els.fileText.textContent = "Click or drop your PDF here";
  els.hero.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.add("hidden"), 2600);
}
/* ---------- PDF Report ---------- */
function downloadPdfReport() {
  if (!lastReport) {
    showToast("Analyze a resume first");
    return;
  }
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast("PDF library failed to load");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;
  const ensureSpace = (needed) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };
  const addTitle = (text) => {
    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 30, 40);
    doc.text(text, margin, y);
    y += 28;
  };
  const addSectionHeading = (text, color = [90, 70, 220]) => {
    ensureSpace(30);
    y += 6;
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(3);
    doc.line(margin, y - 10, margin + 24, y - 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, margin + 32, y - 6);
    y += 14;
  };
  const addParagraph = (text, opts = {}) => {
    const size = opts.size || 11;
    const color = opts.color || [55, 55, 70];
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(String(text), maxW);
    lines.forEach((line) => {
      ensureSpace(size + 4);
      doc.text(line, margin, y);
      y += size + 4;
    });
  };
  const addKeyValue = (k, v) => {
    ensureSpace(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(70, 70, 90);
    doc.text(`${k}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 55);
    doc.text(String(v || "—"), margin + 70, y);
    y += 16;
  };
  const addBulletList = (items) => {
    const list = Array.isArray(items) && items.length ? items : ["No items available."];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(55, 55, 70);
    list.forEach((item) => {
      const lines = doc.splitTextToSize(`• ${String(item)}`, maxW - 12);
      lines.forEach((line, i) => {
        ensureSpace(15);
        doc.text(line, margin + (i === 0 ? 0 : 12), y);
        y += 15;
      });
    });
    y += 4;
  };
  const scoreColor = (v) => {
    if (v >= 75) return [34, 160, 90];
    if (v >= 50) return [220, 160, 40];
    return [210, 70, 70];
  };
  const addScoreBar = (label, value) => {
    ensureSpace(38);
    const v = safeNum(value);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(55, 55, 70);
    doc.text(label, margin, y);
    doc.setTextColor(...scoreColor(v));
    doc.text(`${v}/100`, pageW - margin, y, { align: "right" });
    y += 8;
    doc.setFillColor(230, 230, 240);
    doc.roundedRect(margin, y, maxW, 8, 4, 4, "F");
    doc.setFillColor(...scoreColor(v));
    doc.roundedRect(margin, y, (maxW * v) / 100, 8, 4, 4, "F");
    y += 22;
  };
  // Header
  addTitle("Resume Analysis Report");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 135);
  doc.text(
    `Generated ${new Date().toLocaleString()}`,
    margin,
    y
  );
  y += 22;
  addKeyValue("Name", lastUser.name);
  addKeyValue("Email", lastUser.email);
  y += 8;
  addSectionHeading("Scores");
  addScoreBar("Overall Score", lastReport.overall_score);
  addScoreBar("ATS Score", lastReport.ats_score);
  addScoreBar("Technical Score", lastReport.technical_score);
  addScoreBar("Communication Score", lastReport.communication_score);
  addSectionHeading("Strengths", [34, 160, 90]);
  addBulletList(lastReport.strengths);
  addSectionHeading("Weaknesses", [210, 90, 90]);
  addBulletList(lastReport.weaknesses);
  addSectionHeading("Missing Skills", [220, 140, 40]);
  addBulletList(lastReport.missing_skills);
  addSectionHeading("Suggestions", [70, 120, 220]);
  addBulletList(lastReport.suggestions);
  addSectionHeading("Recommended Roles", [140, 70, 220]);
  const roles = Array.isArray(lastReport.recommended_roles) && lastReport.recommended_roles.length
    ? lastReport.recommended_roles.join(", ")
    : "No recommended roles.";
  addParagraph(roles);
  addSectionHeading("Improved Summary", [90, 70, 220]);
  addParagraph(
    typeof lastReport.improved_summary === "string" && lastReport.improved_summary.trim()
      ? lastReport.improved_summary
      : "No improved summary available."
  );
  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 160);
    doc.text("ResumeIQ · AI Resume Analyzer", margin, pageH - 20);
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin, pageH - 20, { align: "right" });
  }
  const safeName = (lastUser.name || "resume").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  doc.save(`resume_report_${safeName}.pdf`);
  showToast("Report downloaded");
}