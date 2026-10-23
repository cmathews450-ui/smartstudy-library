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
let isRegisterMode = false;

window.addEventListener("DOMContentLoaded", () => {
  const savedUsername = localStorage.getItem("saved_student_username");
  const activeSession = sessionStorage.getItem("current_student_username");

  if (activeSession) {
    showLibrary(activeSession);
  } else if (savedUsername) {
    document.getElementById("fullAuthBox").style.display = "none";
    document.getElementById("savedUserLoginBox").style.display = "block";
    document.getElementById("savedUsernameDisplay").textContent = savedUsername;
  }

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

  updateHeroBanner();
});

function updateHeroBanner() {
  const titles = {
    senior: "Grade 12 ECZ Past Paper Solutions",
    junior: "Grade 9 ECZ Past Paper Solutions",
    primary: "Grade 7 ECZ Past Paper Solutions"
  };
  document.getElementById("heroTitle").textContent = titles[activeLevel];
  
  const resources = getResources().filter(r => r.level === activeLevel);
  const subjects = [...new Set(resources.map(r => r.subject))];
  
  document.getElementById("statSolutions").textContent = `${resources.length} solutions`;
  document.getElementById("statSubjects").textContent = `${subjects.length} subjects`;

  const startYear = 2016;
  const currentYear = new Date().getFullYear();
  document.getElementById("statYears").textContent = `${startYear}–${currentYear}`;
}

document.getElementById("toggleAuthPass")?.addEventListener("click", function() {
  const p = document.getElementById("studentPasswordInput");
  p.type = p.type === "password" ? "text" : "password";
  this.textContent = p.type === "password" ? "👁️" : "🙈";
});

document.getElementById("toggleSavedPass")?.addEventListener("click", function() {
  const p = document.getElementById("savedUserPasswordInput");
  p.type = p.type === "password" ? "text" : "password";
  this.textContent = p.type === "password" ? "👁️" : "🙈";
});

document.getElementById("switchAccountBtn")?.addEventListener("click", function() {
  localStorage.removeItem("saved_student_username");
  document.getElementById("savedUserLoginBox").style.display = "none";
  document.getElementById("fullAuthBox").style.display = "block";
});

document.getElementById("toggleAuthModeBtn")?.addEventListener("click", function() {
  isRegisterMode = !isRegisterMode;
  const nameG = document.getElementById("nameFieldGroup");
  const userG = document.getElementById("usernameFieldGroup");
  const sub = document.getElementById("authSubtitle");
  const btn = document.getElementById("authSubmitBtn");
  const toggleTxt = document.getElementById("authToggleText");
  const identifierLabel = document.getElementById("identifierLabel");
  
  if (isRegisterMode) {
    sub.textContent = "Create your account using your email or phone number.";
    nameG.style.display = "block";
    userG.style.display = "block";
    identifierLabel.textContent = "Email or Phone Number:";
    document.getElementById("studentNameInput").required = true;
    document.getElementById("studentUsernameInput").required = true;
    btn.textContent = "Register & Login";
    toggleTxt.textContent = "Already have an account? ";
    this.textContent = "Login here";
  } else {
    sub.textContent = "Log in using your Username or Email/Phone.";
    nameG.style.display = "none";
    userG.style.display = "none";
    identifierLabel.textContent = "Username, Email, or Phone Number:";
    document.getElementById("studentNameInput").required = false;
    document.getElementById("studentUsernameInput").required = false;
    btn.textContent = "Login";
    toggleTxt.textContent = "First time here? ";
    this.textContent = "Register an account";
  }
});

document.getElementById("savedUserForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const savedUsername = localStorage.getItem("saved_student_username");
  const pass = document.getElementById("savedUserPasswordInput").value;
  const students = JSON.parse(localStorage.getItem("registered_students")) || {};
  const err = document.getElementById("savedLoginError");

  if (students[savedUsername] && students[savedUsername].password === pass) {
    sessionStorage.setItem("current_student_username", savedUsername);
    showLibrary(savedUsername);
  } else {
    err.textContent = "Incorrect password.";
    err.style.display = "block";
  }
});

document.getElementById("studentAuthForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const identifier = document.getElementById("studentIdentifierInput").value.trim().toLowerCase();
  const password = document.getElementById("studentPasswordInput").value;
  const remember = document.getElementById("rememberMeCheck").checked;
  const msg = document.getElementById("authMessage");
  let students = JSON.parse(localStorage.getItem("registered_students")) || {};

  if (isRegisterMode) {
    const name = document.getElementById("studentNameInput").value.trim();
    const username = document.getElementById("studentUsernameInput").value.trim().toLowerCase();
    
    if (students[username] || students[identifier]) {
      msg.textContent = "Account already registered with this username/email/phone.";
      msg.style.display = "block";
      return;
    }
    
    const accountData = { name, username, contact: identifier, password };
    students[username] = accountData;
    students[identifier] = accountData; // Map contact for direct login lookup

    localStorage.setItem("registered_students", JSON.stringify(students));
    sessionStorage.setItem("current_student_username", username);
    if (remember) localStorage.setItem("saved_student_username", username);
    showLibrary(username);
  } else {
    let foundUser = students[identifier];
    
    if (!foundUser || foundUser.password !== password) {
      msg.textContent = "Invalid login credentials. Check username/password.";
      msg.style.display = "block";
      return;
    }
    
    const keyName = foundUser.username || identifier;
    sessionStorage.setItem("current_student_username", keyName);
    if (remember) localStorage.setItem("saved_student_username", keyName);
    showLibrary(keyName);
  }
});

const handleStudentLogout = function() {
  sessionStorage.removeItem("current_student_username");
  document.getElementById("studentLibrarySection").style.display = "none";
  document.getElementById("headerStudentLogoutBtn").style.display = "none";
  const saved = localStorage.getItem("saved_student_username");
  if (saved) {
    document.getElementById("fullAuthBox").style.display = "none";
    document.getElementById("savedUserLoginBox").style.display = "block";
    document.getElementById("savedUsernameDisplay").textContent = saved;
  } else {
    document.getElementById("savedUserLoginBox").style.display = "none";
    document.getElementById("fullAuthBox").style.display = "block";
  }
  document.getElementById("studentAuthSection").style.display = "block";
};

document.getElementById("studentLogoutBtn")?.addEventListener("click", handleStudentLogout);
document.getElementById("headerStudentLogoutBtn")?.addEventListener("click", handleStudentLogout);

function showLibrary(username) {
  document.getElementById("studentAuthSection").style.display = "none";
  document.getElementById("studentLibrarySection").style.display = "block";
  document.getElementById("headerStudentLogoutBtn").style.display = "inline-block";
  renderSubjectPills();
  renderResources();
}

function getResources() {
  const stored = localStorage.getItem("library_resources");
  return stored ? JSON.parse(stored) : defaultResources;
}

function renderSubjectPills() {
  const container = document.getElementById("subjectPillsContainer");
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
  const searchVal = document.getElementById("searchInput").value.toLowerCase();
  const resources = getResources();

  const filtered = resources.filter(res => {
    const matchesLevel = res.level === activeLevel;
    const matchesSubject = selectedSubject === "all" || res.subject === selectedSubject;
    const matchesSearch = res.title.toLowerCase().includes(searchVal);
    return matchesLevel && matchesSubject && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = "<p style='color: #64748b;'>No solutions found for this selection.</p>";
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

document.getElementById("searchInput")?.addEventListener("input", renderResources);
