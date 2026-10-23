document.addEventListener("DOMContentLoaded", () => {
  // Set default admin password
  if (!localStorage.getItem("admin_password")) {
    localStorage.setItem("admin_password", "admin123");
  }

  const adminLoginForm = document.getElementById("adminLoginForm");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  const forgotPassBtn = document.getElementById("adminForgotPassBtn");
  const togglePassBtn = document.getElementById("toggleAdminPass");

  // Eye Icon Password Toggle
  if (togglePassBtn) {
    togglePassBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const p = document.getElementById("adminPasswordInput");
      if (p.type === "password") {
        p.type = "text";
        togglePassBtn.textContent = "🙈";
      } else {
        p.type = "password";
        togglePassBtn.textContent = "👁️";
      }
    });
  }

  // Admin Login Event
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const enteredPass = document.getElementById("adminPasswordInput").value.trim();
      const currentPass = localStorage.getItem("admin_password") || "admin123";
      const errorMsg = document.getElementById("adminLoginError");

      if (enteredPass === currentPass) {
        sessionStorage.setItem("admin_logged_in", "true");
        showAdminDashboard();
      } else {
        if (errorMsg) {
          errorMsg.textContent = "Invalid Password! Default password is: admin123";
          errorMsg.style.display = "block";
        }
      }
    });
  }

  // Admin Logout Event
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("admin_logged_in");
      location.reload();
    });
  }

  // Password Recovery Event
  if (forgotPassBtn) {
    forgotPassBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const currentPass = localStorage.getItem("admin_password") || "admin123";
      const resetConfirm = confirm(`ADMIN RECOVERY:\n\nYour current password is: ${currentPass}\n\nDo you want to reset password back to "admin123"?`);
      if (resetConfirm) {
        localStorage.setItem("admin_password", "admin123");
        alert("Password reset to: admin123");
      }
    });
  }

  // Check login state
  if (sessionStorage.getItem("admin_logged_in") === "true") {
    showAdminDashboard();
  }

  setupAdminResourceManagement();
});

function showAdminDashboard() {
  const authSec = document.getElementById("adminAuthSection");
  const dashSec = document.getElementById("adminDashboardSection");
  if (authSec) authSec.style.display = "none";
  if (dashSec) dashSec.style.display = "block";
  renderAdminResources();
}

function setupAdminResourceManagement() {
  const form = document.getElementById("addResourceForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const title = document.getElementById("resTitle").value.trim();
      const category = document.getElementById("resCategory").value;
      const level = document.getElementById("resLevel").value;
      const subject = document.getElementById("resSubject").value.trim();
      const year = document.getElementById("resYear").value.trim();
      const fileInput = document.getElementById("resLocalFile");

      if (fileInput.files.length === 0) {
        alert("Please select a file from your phone or computer!");
        return;
      }

      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = function(event) {
        const fileDataUrl = event.target.result; // Base64 data string of local file

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
        form.reset();
        alert(`Successfully uploaded "${title}" to your library!`);
        renderAdminResources();
      };

      reader.readAsDataURL(file);
    });
  }
}

function renderAdminResources() {
  const listContainer = document.getElementById("adminResourceList");
  if (!listContainer) return;

  let resources = JSON.parse(localStorage.getItem("library_resources")) || [];

  if (resources.length === 0) {
    listContainer.innerHTML = "<p style='color: #64748b; font-size: 0.88rem;'>No custom resources uploaded yet.</p>";
    return;
  }

  let html = "";
  resources.forEach(res => {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div>
          <strong style="color: #0f172a; font-size: 0.9rem;">${res.title}</strong><br>
          <small style="color: #64748b;">Level: ${res.level.toUpperCase()} | Subject: ${res.subject} (${res.year})</small>
        </div>
        <button onclick="deleteResource(${res.id})" class="danger-btn" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">Delete</button>
      </div>
    `;
  });
  listContainer.innerHTML = html;
}

window.deleteResource = function(id) {
  if (confirm("Are you sure you want to delete this resource?")) {
    let resources = JSON.parse(localStorage.getItem("library_resources")) || [];
    resources = resources.filter(r => r.id !== id);
    localStorage.setItem("library_resources", JSON.stringify(resources));
    renderAdminResources();
  }
};
