const defaultResources = [
  { id: 1, title: "2025 Mathematics Paper 1", level: "senior", subject: "Mathematics", fileUrl: "#" },
  { id: 2, title: "2025 Biology Paper 2", level: "senior", subject: "Biology", fileUrl: "#" },
  { id: 3, title: "2024 Civic Education GCE", level: "gce", subject: "Civic Education", fileUrl: "#" },
  { id: 4, title: "2024 Integrated Science", level: "junior", subject: "Science", fileUrl: "#" }
];

let activeLevel = "all";
let selectedSubject = "all";

window.addEventListener("DOMContentLoaded", () => {
  renderSubjectPills();
  renderResources();

  document.getElementById("topSearchInput")?.addEventListener("input", function() {
    renderResources(this.value);
  });
});

function getResources() {
  const stored = localStorage.getItem("library_resources");
  return stored ? JSON.parse(stored) : defaultResources;
}

window.selectGradeLevel = function(level) {
  activeLevel = level;
  renderSubjectPills();
  renderResources();
  document.getElementById("resources")?.scrollIntoView({ behavior: "smooth" });
};

function renderSubjectPills() {
  const container = document.getElementById("subjectPillsContainer");
  if (!container) return;

  const resources = getResources().filter(r => activeLevel === "all" || r.level === activeLevel);
  const subjectCounts = {};
  resources.forEach(r => {
    subjectCounts[r.subject] = (subjectCounts[r.subject] || 0) + 1;
  });

  let html = `<button class="pill ${selectedSubject === 'all' ? 'active' : ''}" onclick="filterSubject('all')">All</button>`;
  for (let subj in subjectCounts) {
    html += `<button class="pill ${selectedSubject === subj ? 'active' : ''}" onclick="filterSubject('${subj}')">${subj} (${subjectCounts[subj]})</button>`;
  }
  container.innerHTML = html;
}

window.filterSubject = function(subj) {
  selectedSubject = subj;
  renderSubjectPills();
  renderResources();
};

function renderResources(searchQuery = "") {
  const grid = document.getElementById("resourceGrid");
  if (!grid) return;

  const searchVal = searchQuery.toLowerCase();
  const resources = getResources();

  const filtered = resources.filter(res => {
    const matchesLevel = activeLevel === "all" || res.level === activeLevel;
    const matchesSubject = selectedSubject === "all" || res.subject === selectedSubject;
    const matchesSearch = res.title.toLowerCase().includes(searchVal);
    return matchesLevel && matchesSubject && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = "<p style='color: #64748b; padding: 1rem;'>No solutions found for this selection.</p>";
    return;
  }

  grid.innerHTML = "";
  filtered.forEach(res => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div>
        <span class="tag">${res.subject}</span>
        <h3>${res.title}</h3>
      </div>
      <div class="card-actions">
        <button onclick="previewPDF('${res.fileUrl}', '${res.title}')" class="primary-btn" style="flex:1;">Preview</button>
        <a href="${res.fileUrl}" class="download-btn" style="flex:1;" download="${res.title}.pdf">Download</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

window.previewPDF = function(url, title) {
  document.getElementById("modalPdfTitle").textContent = title;
  document.getElementById("pdfFrame").src = url;
  document.getElementById("pdfModal").style.display = "flex";
};

document.getElementById("closeModalBtn")?.addEventListener("click", function() {
  document.getElementById("pdfFrame").src = "";
  document.getElementById("pdfModal").style.display = "none";
});

window.bookmarkSite = function() {
  alert("Press Ctrl+D (or Cmd+D on Mac) to bookmark Mathew's SmartStudy Library!");
};
