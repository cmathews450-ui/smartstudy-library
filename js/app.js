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
  return stored ? JSON.parse(stored) : [];
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
    if (r.subject) {
      subjectCounts[r.subject] = (subjectCounts[r.subject] || 0) + 1;
    }
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
    const matchesSubject = selectedSubject === "all" || (res.subject && res.subject.toLowerCase() === selectedSubject.toLowerCase());
    const matchesYear = selectedYear === "all" || (res.year && res.year.toString() === selectedYear.toString());
    const matchesSearch = (res.title || "").toLowerCase().includes(searchVal);
    return matchesLevel && matchesSubject && matchesYear && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = "<div style='grid-column: 1/-1; text-align: center; padding: 2rem; color: #64748b; font-weight: 600;'>No past paper files uploaded yet. Upload papers from the Admin Portal to populate this section!</div>";
    return;
  }

  grid.innerHTML = "";
  filtered.forEach(res => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div>
        <span class="tag">${res.subject || 'General'}</span>
        <span class="tag" style="background:#fef3c7; color:#d97706;">${res.year || '2026'}</span>
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

window.openTimetableModal = function(title) {
  document.getElementById("modalPdfTitle").textContent = `${title} - ECZ Examination Timetable`;
  const resources = getResources().filter(r => r.category === "timetable" || r.title.toLowerCase().includes("timetable"));
  
  let timetableHtml = "";
  if (resources.length > 0) {
    resources.forEach(r => {
      timetableHtml += `
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 1rem; border-radius: 8px; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${r.title}</strong><br>
            <small style="color: #64748b;">Year: ${r.year || '2026'}</small>
          </div>
          <a href="${r.fileUrl}" class="download-btn" style="padding: 0.4rem 0.8rem; font-size: 0.82rem;" download="${r.title}.pdf">Download PDF</a>
        </div>
      `;
    });
  } else {
    timetableHtml = "<p style='color: #64748b;'>No official timetable PDF uploaded yet. Upload timetables in the Admin Portal.</p>";
  }

  document.getElementById("modalContentBox").innerHTML = `
    <div style="text-align: center; padding: 1rem;">
      <h2 style="color: #0f172a; margin-bottom: 0.5rem;">📅 ${title} Timetable</h2>
      <p style="color: #64748b; margin-bottom: 1.5rem;">Official Examinations Council of Zambia (ECZ) Timetables</p>
      ${timetableHtml}
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
