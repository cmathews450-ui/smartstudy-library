const defaultResources = [
  {
    id: 1,
    title: "Grade 12 Mathematics Paper 1 (2025)",
    level: "senior",
    subject: "Mathematics",
    fileUrl: "#"
  },
  {
    id: 2,
    title: "Grade 12 Biology Paper 2 (2025)",
    level: "senior",
    subject: "Biology",
    fileUrl: "#"
  },
  {
    id: 3,
    title: "Grade 9 Science Past Paper (2024)",
    level: "junior",
    subject: "Science",
    fileUrl: "#"
  }
];

let activeLevel = "senior"; // default Grade 12
let selectedSubject = "all";

window.addEventListener("DOMContentLoaded", () => {
  // Grade Tab Switching Listeners
  document.querySelectorAll(".grade-tab[data-level]").forEach(tab => {
    tab.addEventListener("click", function(e) {
      e.preventDefault();
      document.querySelectorAll(".grade-tab[data-level]").forEach(t => t.classList.remove("active"));
      this.classList.add("active");
      activeLevel = this.getAttribute("data-level");
      selectedSubject = "all";
      updateHeroBanner();
      renderSubjectPills();
      renderResources();
    });
  });

  // Top Search & Main Search Event Listeners
  document.getElementById("searchInput")?.addEventListener("input", renderResources);
  document.getElementById("topSearchInput")?.addEventListener("input", function() {
    const mainSearch = document.getElementById("searchInput");
    if (mainSearch) {
      mainSearch.value = this.value;
      renderResources();
    }
  });

  updateHeroBanner();
  renderSubjectPills();
  renderResources();
});

function updateHeroBanner() {
  const titles = {
    senior: "Grade 12 ECZ Past Paper Solutions",
    junior: "Grade 9 ECZ Past Paper Solutions",
    primary: "Grade 7 ECZ Past Paper Solutions"
  };
  const titleEl = document.getElementById("heroTitle");
  if (titleEl) titleEl.textContent = titles[activeLevel] || titles.senior;
  
  const resources = getResources().filter(r => r.level === activeLevel);
  const subjects = [...new Set(resources.map(r => r.subject))];
  
  const solEl = document.getElementById("statSolutions");
  const subjEl = document.getElementById("statSubjects");
  const yearEl = document.getElementById("statYears");

  if (solEl) solEl.textContent = `${resources.length} solutions`;
  if (subjEl) subjEl.textContent = `${subjects.length} subjects`;
  if (yearEl) yearEl.textContent = `2016–2026`;
}

function getResources() {
  const stored = localStorage.getItem("library_resources");
  return stored ? JSON.parse(stored) : defaultResources;
}

function renderSubjectPills() {
  const container = document.getElementById("subjectPillsContainer");
  if (!container) return;

  const resources = getResources().filter(r => r.level === activeLevel);
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

function renderResources() {
  const grid = document.getElementById("resourceGrid");
  if (!grid) return;

  const searchVal = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const resources = getResources();

  const filtered = resources.filter(res => {
    const matchesLevel = res.level === activeLevel;
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
  updateHeroBanner();
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
