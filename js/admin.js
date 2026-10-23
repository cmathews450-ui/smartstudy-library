document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("admin_user")) {
    localStorage.setItem("admin_user", "admin");
    localStorage.setItem("admin_pass", "admin123");
  }

  document.getElementById("toggleAdminPass")?.addEventListener("click", function() {
    const p = document.getElementById("adminPasswordInput");
    if (p) {
      p.type = p.type === "password" ? "text" : "password";
      this.textContent = p.type === "password" ? "👁️" : "🙈";
    }
  });

  document.getElementById("adminLoginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("adminLoginUsername").value.trim().toLowerCase();
    const pass = document.getElementById("adminPasswordInput").value.trim();
    const errorMsg = document.getElementById("adminLoginError");

    if (user === (localStorage.getItem("admin_user") || "admin") && pass === (localStorage.getItem("admin_pass") || "admin123")) {
      sessionStorage.setItem("admin_logged_in", "true");
      showAdminDashboard();
    } else {
      if (errorMsg) {
        errorMsg.textContent = "Invalid Username or Password. (Use: admin / admin123)";
        errorMsg.style.display = "block";
      }
    }
  });

  document.getElementById("adminLogoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem("admin_logged_in");
    location.reload();
  });

  document.getElementById("clearAllExamplesBtn")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete ALL uploaded files?")) {
      localStorage.setItem("library_resources", JSON.stringify([]));
      renderAdminResources();
    }
  });

  if (sessionStorage.getItem("admin_logged_in") === "true") {
    showAdminDashboard();
  }

  setupUploadHandler();
});

function showAdminDashboard() {
  document.getElementById("adminAuthSection").style.display = "none";
  document.getElementById("adminDashboardSection").style.display = "block";
  renderAdminResources();
}

function setupUploadHandler() {
  const uploadForm = document.getElementById("addResourceForm");
  if (!uploadForm) return;

  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("resTitle").value.trim();
    const category = document.getElementById("resCategory").value; // past_paper, notes, timetable
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
        category: category,
        level: level,
        subject: subject,
        year: year,
        fileUrl: fileDataUrl
      };

      resources.unshift(newRes);
      localStorage.setItem("library_resources", JSON.stringify(resources));
      
      uploadForm.reset();
      alert(`Success! "${title}" has been uploaded.`);
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
    listContainer.innerHTML = "<p style='color: #64748b; font-size: 0.88rem; text-align: center; padding: 1rem;'>No files in library yet.</p>";
    return;
  }

  let html = "";
  resources.forEach(res => {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 8px;">
        <div>
          <strong style="color: #0f172a; font-size: 0.9rem;">${res.title}</strong><br>
          <small style="color: #64748b;">Category: ${res.category.toUpperCase()} | Level: ${res.level.toUpperCase()} | Subject: ${res.subject} (${res.year})</small>
        </div>
        <button onclick="deleteSingleResource(${res.id})" class="danger-btn" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">Delete</button>
      </div>
    `;
  });
  listContainer.innerHTML = html;
}

window.deleteSingleResource = function(id) {
  if (confirm("Delete this file?")) {
    let resources = JSON.parse(localStorage.getItem("library_resources")) || [];
    resources = resources.filter(r => r.id !== id);
    localStorage.setItem("library_resources", JSON.stringify(resources));
    renderAdminResources();
  }
};
