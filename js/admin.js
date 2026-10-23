document.addEventListener("DOMContentLoaded", () => {
  // Initialize Default Main Admin Credentials
  if (!localStorage.getItem("admin_user")) {
    localStorage.setItem("admin_user", "admin");
    localStorage.setItem("admin_pass", "admin123");
  }

  // Toggle Password Visibility
  document.getElementById("toggleAdminPass")?.addEventListener("click", function() {
    const p = document.getElementById("adminPasswordInput");
    if (p) {
      p.type = p.type === "password" ? "text" : "password";
      this.textContent = p.type === "password" ? "👁️" : "🙈";
    }
  });

  // Admin Log In Handler
  document.getElementById("adminLoginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("adminLoginUsername").value.trim().toLowerCase();
    const pass = document.getElementById("adminPasswordInput").value.trim();
    const errorMsg = document.getElementById("adminLoginError");

    const correctUser = localStorage.getItem("admin_user") || "admin";
    const correctPass = localStorage.getItem("admin_pass") || "admin123";

    if (user === correctUser && pass === correctPass) {
      sessionStorage.setItem("admin_logged_in", "true");
      showAdminDashboard();
    } else {
      if (errorMsg) {
        errorMsg.textContent = "Invalid Username or Password. (Use: admin / admin123)";
        errorMsg.style.display = "block";
      }
    }
  });

  // Logout Handler
  document.getElementById("adminLogoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem("admin_logged_in");
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
  if (sessionStorage.getItem("admin_logged_in") === "true") {
    showAdminDashboard();
  }

  setupUploadHandler();
});

function showAdminDashboard() {
  const authSec = document.getElementById("adminAuthSection");
  const dashSec = document.getElementById("adminDashboardSection");
  
  if (authSec) authSec.style.display = "none";
  if (dashSec) dashSec.style.display = "block";

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
