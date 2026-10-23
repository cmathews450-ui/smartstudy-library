document.addEventListener("DOMContentLoaded", () => {
  // Initialize Default Main Admin Account if none exists
  if (!localStorage.getItem("registered_admins")) {
    const admins = [{ username: "admin", password: "admin123", name: "Main Administrator" }];
    localStorage.setItem("registered_admins", JSON.stringify(admins));
  }

  // Toggle between Sign In and Register views
  const showRegisterLink = document.getElementById("showRegisterLink");
  const showLoginLink = document.getElementById("showLoginLink");
  const loginFormContainer = document.getElementById("loginFormContainer");
  const registerFormContainer = document.getElementById("registerFormContainer");

  showRegisterLink?.addEventListener("click", (e) => {
    e.preventDefault();
    if (loginFormContainer) loginFormContainer.style.display = "none";
    if (registerFormContainer) registerFormContainer.style.display = "block";
  });

  showLoginLink?.addEventListener("click", (e) => {
    e.preventDefault();
    if (registerFormContainer) registerFormContainer.style.display = "none";
    if (loginFormContainer) loginFormContainer.style.display = "block";
  });

  // Toggle Password Visibility
  document.getElementById("toggleAdminPass")?.addEventListener("click", function() {
    const p = document.getElementById("adminPasswordInput");
    if (p) {
      p.type = p.type === "password" ? "text" : "password";
      this.textContent = p.type === "password" ? "👁️" : "🙈";
    }
  });

  // Admin Login
  document.getElementById("adminLoginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("adminLoginUsername").value.trim().toLowerCase();
    const pass = document.getElementById("adminPasswordInput").value.trim();
    const errorMsg = document.getElementById("adminLoginError");

    const savedAdmins = JSON.parse(localStorage.getItem("registered_admins")) || [];
    const matchedAdmin = savedAdmins.find(a => a.username.toLowerCase() === user && a.password === pass);

    if (matchedAdmin) {
      sessionStorage.setItem("active_admin", JSON.stringify(matchedAdmin));
      showAdminDashboard();
    } else {
      if (errorMsg) {
        errorMsg.textContent = "Invalid Admin Username or Password.";
        errorMsg.style.display = "block";
      }
    }
  });

  // Admin Registration
  document.getElementById("adminRegisterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("regAdminName").value.trim();
    const user = document.getElementById("regAdminUsername").value.trim();
    const pass = document.getElementById("regAdminPassword").value.trim();

    let savedAdmins = JSON.parse(localStorage.getItem("registered_admins")) || [];
    if (savedAdmins.some(a => a.username.toLowerCase() === user.toLowerCase())) {
      alert("An admin with this username already exists!");
      return;
    }

    savedAdmins.push({ username: user, password: pass, name: name });
    localStorage.setItem("registered_admins", JSON.stringify(savedAdmins));
    alert(`Admin account created for ${name}! You can now sign in.`);
    showLoginLink?.click();
  });

  // Logout
  document.getElementById("adminLogoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem("active_admin");
    location.reload();
  });

  // Clear All Files Button
  document.getElementById("clearAllExamplesBtn")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete ALL uploaded files?")) {
      localStorage.setItem("library_resources", JSON.stringify([]));
      renderAdminResources();
    }
  });

  // Auto-Check Active Login Session
  if (sessionStorage.getItem("active_admin")) {
    showAdminDashboard();
  }

  setupUploadHandler();
});

function showAdminDashboard() {
  const activeAdmin = JSON.parse(sessionStorage.getItem("active_admin"));
  const authSec = document.getElementById("adminAuthSection");
  const dashSec = document.getElementById("adminDashboardSection");
  
  if (authSec) authSec.style.display = "none";
  if (dashSec) dashSec.style.display = "block";

  const nameDisplay = document.getElementById("activeAdminDisplay");
  if (nameDisplay && activeAdmin) {
    nameDisplay.textContent = activeAdmin.name || activeAdmin.username;
  }

  renderAdminResources();
}

function setupUploadHandler() {
  const uploadForm = document.getElementById("addResourceForm");
  if (!uploadForm) return;

  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("resTitle").value.trim();
    const level = document.getElementById("resLevel").value;
    const subject = document.getElementById("resSubject").value.trim();
    const year = document.getElementById("resYear").value.trim();
    const fileInput = document.getElementById("resLocalFile");

    if (!fileInput || fileInput.files.length === 0) {
      alert("Please select a PDF file from your device!");
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
      const fileDataUrl = event.target.result;
      let resources = JSON.parse(localStorage.getItem("library_resources")) || [];

      const newRes = {
        id: Date.now(),
        title: title,
        level: level,
        subject: subject,
        year: year,
        fileUrl: fileDataUrl
      };

      resources.unshift(newRes);
      localStorage.setItem("library_resources", JSON.stringify(resources));
      
      uploadForm.reset();
      alert(`Success! "${title}" has been uploaded to the live site.`);
      renderAdminResources();
    };

    reader.readAsDataURL(file);
  });
}

function renderAdminResources() {
  const listContainer = document.getElementById("adminResourceList");
  if (!listContainer) return;

  let resources = JSON.parse(localStorage.getItem("library_resources")) || [];

  if (resources.length === 0) {
    listContainer.innerHTML = "<p style='color: #64748b; font-size: 0.88rem; text-align: center; padding: 1rem;'>No files in library yet. Fill out the form above to upload your first paper!</p>";
    return;
  }

  let html = "";
  resources.forEach(res => {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 8px;">
        <div>
          <strong style="color: #0f172a; font-size: 0.9rem;">${res.title}</strong><br>
          <small style="color: #64748b;">Level: ${res.level.toUpperCase()} | Subject: ${res.subject} | Year: ${res.year}</small>
        </div>
        <button onclick="deleteSingleResource(${res.id})" class="danger-btn" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">Delete</button>
      </div>
    `;
  });
  listContainer.innerHTML = html;
}

window.deleteSingleResource = function(id) {
  if (confirm("Delete this file from your library?")) {
    let resources = JSON.parse(localStorage.getItem("library_resources")) || [];
    resources = resources.filter(r => r.id !== id);
    localStorage.setItem("library_resources", JSON.stringify(resources));
    renderAdminResources();
  }
};
