document.addEventListener("DOMContentLoaded", () => {
  // Initialize Default Main Admin Account
  if (!localStorage.getItem("registered_admins")) {
    const admins = [{ username: "admin", password: "admin123", name: "Main Administrator" }];
    localStorage.setItem("registered_admins", JSON.stringify(admins));
  }

  // Auth Tabs
  const tabLoginBtn = document.getElementById("tabLoginBtn");
  const tabRegisterBtn = document.getElementById("tabRegisterBtn");
  const loginFormContainer = document.getElementById("loginFormContainer");
  const registerFormContainer = document.getElementById("registerFormContainer");

  if (tabLoginBtn && tabRegisterBtn) {
    tabLoginBtn.addEventListener("click", () => {
      tabLoginBtn.style.background = "#ea580c";
      tabLoginBtn.style.color = "#ffffff";
      tabRegisterBtn.style.background = "transparent";
      tabRegisterBtn.style.color = "#475569";
      if (loginFormContainer) loginFormContainer.style.display = "block";
      if (registerFormContainer) registerFormContainer.style.display = "none";
    });

    tabRegisterBtn.addEventListener("click", () => {
      tabRegisterBtn.style.background = "#10b981";
      tabRegisterBtn.style.color = "#ffffff";
      tabLoginBtn.style.background = "transparent";
      tabLoginBtn.style.color = "#475569";
      if (registerFormContainer) registerFormContainer.style.display = "block";
      if (loginFormContainer) loginFormContainer.style.display = "none";
    });
  }

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
    tabLoginBtn?.click();
  });

  // Top Section Switcher Buttons (Upload Files vs Manage Admins)
  const btnUpload = document.getElementById("btnSectionUpload");
  const btnAdmins = document.getElementById("btnSectionAdmins");
  const boxUpload = document.getElementById("sectionUploadBox");
  const boxAdmins = document.getElementById("sectionAdminsBox");

  if (btnUpload && btnAdmins) {
    btnUpload.addEventListener("click", (e) => {
      e.preventDefault();
      btnUpload.style.background = "#ea580c";
      btnUpload.style.color = "#ffffff";
      btnAdmins.style.background = "#64748b";
      btnAdmins.style.color = "#ffffff";
      if (boxUpload) boxUpload.style.display = "block";
      if (boxAdmins) boxAdmins.style.display = "none";
    });

    btnAdmins.addEventListener("click", (e) => {
      e.preventDefault();
      btnAdmins.style.background = "#ea580c";
      btnAdmins.style.color = "#ffffff";
      btnUpload.style.background = "#64748b";
      btnUpload.style.color = "#ffffff";
      if (boxAdmins) boxAdmins.style.display = "block";
      if (boxUpload) boxUpload.style.display = "none";
      renderAdminAccounts();
    });
  }

  // Logout
  document.getElementById("adminLogoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem("active_admin");
    location.reload();
  });

  // Password Change
  document.getElementById("changePasswordForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const newPass = document.getElementById("newAdminPasswordInput").value.trim();
    const activeAdmin = JSON.parse(sessionStorage.getItem("active_admin"));

    if (activeAdmin) {
      let savedAdmins = JSON.parse(localStorage.getItem("registered_admins")) || [];
      savedAdmins = savedAdmins.map(a => {
        if (a.username.toLowerCase() === activeAdmin.username.toLowerCase()) {
          a.password = newPass;
        }
        return a;
      });
      localStorage.setItem("registered_admins", JSON.stringify(savedAdmins));
      alert("Password updated successfully!");
    }
  });

  // Clear Example Data Button
  document.getElementById("clearAllExamplesBtn")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete ALL uploaded files? The library will be completely empty.")) {
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

function renderAdminAccounts() {
  const listContainer = document.getElementById("adminAccountsList");
  if (!listContainer) return;

  const savedAdmins = JSON.parse(localStorage.getItem("registered_admins")) || [];
  let html = "";
  savedAdmins.forEach(admin => {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 8px;">
        <div>
          <strong style="color: #0f172a;">${admin.name}</strong> (@${admin.username})
        </div>
        ${admin.username !== 'admin' ? `<button onclick="removeAdminAccount('${admin.username}')" class="danger-btn" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">Remove Admin</button>` : '<span style="font-size: 0.75rem; color: #10b981; font-weight: bold;">Main Admin</span>'}
      </div>
    `;
  });
  listContainer.innerHTML = html;
}

window.removeAdminAccount = function(username) {
  if (confirm(`Remove admin privileges for @${username}?`)) {
    let savedAdmins = JSON.parse(localStorage.getItem("registered_admins")) || [];
    savedAdmins = savedAdmins.filter(a => a.username !== username);
    localStorage.setItem("registered_admins", JSON.stringify(savedAdmins));
    renderAdminAccounts();
  }
};
