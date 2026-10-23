document.addEventListener("DOMContentLoaded", () => {
  // Initialize Default Main Admin Account
  let admins = JSON.parse(localStorage.getItem("registered_admins")) || [
    { username: "admin", password: "admin123", name: "Main Administrator" }
  ];
  localStorage.setItem("registered_admins", JSON.stringify(admins));

  // UI Tabs (Sign In vs Register)
  const tabLoginBtn = document.getElementById("tabLoginBtn");
  const tabRegisterBtn = document.getElementById("tabRegisterBtn");
  const loginFormContainer = document.getElementById("loginFormContainer");
  const registerFormContainer = document.getElementById("registerFormContainer");

  tabLoginBtn?.addEventListener("click", () => {
    tabLoginBtn.style.background = "#ea580c";
    tabLoginBtn.style.color = "#ffffff";
    tabRegisterBtn.style.background = "transparent";
    tabRegisterBtn.style.color = "#475569";
    loginFormContainer.style.display = "block";
    registerFormContainer.style.display = "none";
  });

  tabRegisterBtn?.addEventListener("click", () => {
    tabRegisterBtn.style.background = "#10b981";
    tabRegisterBtn.style.color = "#ffffff";
    tabLoginBtn.style.background = "transparent";
    tabLoginBtn.style.color = "#475569";
    registerFormContainer.style.display = "block";
    loginFormContainer.style.display = "none";
  });

  // Toggle Password View
  document.getElementById("toggleAdminPass")?.addEventListener("click", function() {
    const p = document.getElementById("adminPasswordInput");
    p.type = p.type === "password" ? "text" : "password";
    this.textContent = p.type === "password" ? "👁️" : "🙈";
  });

  // Admin Login Form
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
      errorMsg.textContent = "Invalid Admin Username or Password.";
      errorMsg.style.display = "block";
    }
  });

  // Admin Registration Form
  document.getElementById("adminRegisterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("regAdminName").value.trim();
    const user = document.getElementById("regAdminUsername").value.trim();
    const pass = document.getElementById("regAdminPassword").value.trim();

    let savedAdmins = JSON.parse(localStorage.getItem("registered_admins")) || [];
    if (savedAdmins.some(a => a.username.toLowerCase() === user.toLowerCase())) {
      alert("An admin account with this username already exists!");
      return;
    }

    const newAdmin = { username: user, password: pass, name: name };
    savedAdmins.push(newAdmin);
    localStorage.setItem("registered_admins", JSON.stringify(savedAdmins));
    alert(`Admin account created for ${name}! You can now sign in.`);
    tabLoginBtn.click();
  });

  // Dashboard Navigation Tabs
  const btnUpload = document.getElementById("btnSectionUpload");
  const btnAdmins = document.getElementById("btnSectionAdmins");
  const boxUpload = document.getElementById("sectionUploadBox");
  const boxAdmins = document.getElementById("sectionAdminsBox");

  btnUpload?.addEventListener("click", () => {
    btnUpload.style.background = "#ea580c";
    btnAdmins.style.background = "#64748b";
    boxUpload.style.display = "block";
    boxAdmins.style.display = "none";
  });

  btnAdmins?.addEventListener("click", () => {
    btnAdmins.style.background = "#ea580c";
    btnUpload.style.background = "#64748b";
    boxAdmins.style.display = "block";
    boxUpload.style.display = "none";
    renderAdminAccounts();
  });

  // Admin Logout
  document.getElementById("adminLogoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem("active_admin");
    location.reload();
  });

  // Change Password
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
    if (confirm("Are you sure you want to delete ALL example files? You can then upload your real files.")) {
      localStorage.setItem("library_resources", JSON.stringify([]));
      renderAdminResources();
    }
  });

  // Check Session
  if (sessionStorage.getItem("active_admin")) {
    showAdminDashboard();
  }

  setupUploadHandler();
});

function showAdminDashboard() {
  const activeAdmin = JSON.parse(sessionStorage.getItem("active_admin"));
  document.getElementById("adminAuthSection").style.display = "none";
  document.getElementById("adminDashboardSection").style.display = "block";
  document.getElementById("activeAdminDisplay").textContent = activeAdmin.name || activeAdmin.username;
  renderAdminResources();
}

function setupUploadHandler() {
  document.getElementById("addResourceForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("resTitle").value.trim();
    const level = document.getElementById("resLevel").value;
    const subject = document.getElementById("resSubject").value.trim();
    const year = document.getElementById("resYear").value.trim();
    const fileInput = document.getElementById("resLocalFile");

    if (fileInput.files.length === 0) {
      alert("Please select a file!");
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
      alert(`Uploaded "${title}" successfully!`);
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
    listContainer.innerHTML = "<p style='color: #64748b; font-size: 0.88rem; text-align: center;'>No custom files in library. Upload your real files above!</p>";
    return;
  }

  let html = "";
  resources.forEach(res => {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 8px;">
        <div>
          <strong style="color: #0f172a; font-size: 0.9rem;">${res.title}</strong><br>
          <small style="color: #64748b;">Level: ${res.level.toUpperCase()} | Subject: ${res.subject} (${res.year})</small>
        </div>
        <button onclick="deleteSingleResource(${res.id})" class="danger-btn" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">Delete</button>
      </div>
    `;
  });
  listContainer.innerHTML = html;
}

window.deleteSingleResource = function(id) {
  if (confirm("Delete this file from website?")) {
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
