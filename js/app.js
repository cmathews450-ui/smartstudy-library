const defaultResources = [
  { id: 1, title: "2026 Mathematics Paper 1", level: "senior", subject: "Mathematics", year: "2026", fileUrl: "#" },
  { id: 2, title: "2026 Chemistry Paper 2", level: "senior", subject: "Chemistry", year: "2026", fileUrl: "#" },
  { id: 3, title: "2025 English Paper 1", level: "senior", subject: "English", year: "2025", fileUrl: "#" },
  { id: 4, title: "2025 Science Paper 2 GCE", level: "gce", subject: "Science", year: "2025", fileUrl: "#" },
  { id: 5, title: "2024 Geography Paper 1", level: "junior", subject: "Geography", year: "2024", fileUrl: "#" }
];

let activeLevel = "all";
let selectedSubject = "all";
let selectedYear = "all";

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
  selectedSubject = "all";
  selectedYear = "all";
  renderSubjectPills();
  renderResources();
  document.getElementById("resources")?.scrollIntoView({ behavior: "smooth" });
};

window.filterByYear = function(year) {
  selectedYear = year;
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
  document.getElementById("resources")?.scrollIntoView({ behavior: "smooth" });
};

function renderResources(searchQuery = "") {
  const grid = document.getElementById("resourceGrid");
  if (!grid) return;

  const searchVal = searchQuery.toLowerCase();
  const resources = getResources();

  const filtered = resources.filter(res => {
    const matchesLevel = activeLevel === "all" || res.level === activeLevel;
    const matchesSubject = selectedSubject === "all" || res.subject === selectedSubject;
    const matchesYear = selectedYear === "all" || (res.year && res.year === selectedYear);
    const matchesSearch = res.title.toLowerCase().includes(searchVal);
    return matchesLevel && matchesSubject && matchesYear && matchesSearch;
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

// Interactive Timetable Modal Trigger
window.openTimetableModal = function(title) {
  document.getElementById("modalPdfTitle").textContent = `${title} - ECZ Examination Timetable 2026`;
  document.getElementById("pdfFrame").style.display = "none";
  document.getElementById("modalContentBox").innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <h2 style="color: #0f172a; margin-bottom: 1rem;">📅 ${title} Timetable 2026</h2>
      <p style="color: #64748b; margin-bottom: 1.5rem;">Official Examination Timetable scheduled by the Examinations Council of Zambia (ECZ).</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; display: inline-block; text-align: left;">
        <p><strong>• Session 1:</strong> Morning Papers starting at 08:00 AM</p>
        <p><strong>• Session 2:</strong> Afternoon Papers starting at 02:00 PM</p>
      </div>
      <div style="margin-top: 1.5rem;">
        <button onclick="alert('Downloading official ECZ Timetable PDF...')" class="primary-btn" style="padding: 0.75rem 1.5rem;">Download Timetable (PDF)</button>
      </div>
    </div>
  `;
  document.getElementById("pdfModal").style.display = "flex";
};

window.previewPDF = function(url, title) {
  document.getElementById("modalPdfTitle").textContent = title;
  document.getElementById("modalContentBox").innerHTML = `<iframe id="pdfFrame" style="width: 100%; height: 100%; border: none;" src="${url}"></iframe>`;
  document.getElementById("pdfModal").style.display = "flex";
};

document.getElementById("closeModalBtn")?.addEventListener("click", function() {
  document.getElementById("pdfModal").style.display = "none";
});

window.bookmarkSite = function() {
  alert("Press Ctrl+D (or Cmd+D on Mac) to bookmark Mathew's SmartStudy Library!");
};
