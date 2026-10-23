document.addEventListener("DOMContentLoaded", () => {
  // Ensure default admin password is set
  if (!localStorage.getItem("admin_password")) {
    localStorage.setItem("admin_password", "admin123");
  }

  const adminLoginForm = document.getElementById("adminLoginForm");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  const forgotPassBtn = document.getElementById("adminForgotPassBtn");
  const togglePassBtn = document.getElementById("toggleAdminPass");

  // Toggle Password Eye Icon
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

  // Admin Login Handler
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
          errorMsg.textContent = "Invalid password. Default is admin123";
          errorMsg.style.display = "block";
        }
      }
    });
  }

  // Admin Logout Handler
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("admin_logged_in");
      location.reload();
    });
  }

  // Working Forgot Password Handler
  if (forgotPassBtn) {
    forgotPassBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const currentPass = localStorage.getItem("admin_password") || "admin123";
      const userChoice = confirm(`ADMIN RECOVERY:\n\nYour current password is: ${currentPass}\n\nWould you like to reset your password to "admin123"?`);
      if (userChoice) {
        localStorage.setItem("admin_password", "admin123");
        alert("Password successfully reset to: admin123");
      }
    });
  }

  // Auto Login check
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
      const level = document.getElementById("resLevel").value;
      const subject = document.getElementById("resSubject").value.trim();
      const fileUrl = document.getElementById("resUrl").value.trim();

      let resources = JSON.parse(localStorage.getItem("library_resources")) || [
        { id: 1, title: "Grade 12 Mathematics Paper 1 (2025)", level: "senior", subject: "Mathematics", fileUrl: "#" },
        { id: 2, title: "Grade 12 Biology Paper 2 (2025)", level: "senior", subject: "Biology", fileUrl: "#" },
        { id: 3, title: "Grade 9 Science Past Paper (2024)", level: "junior", subject: "Science", fileUrl: "#" }
      ];

      const newRes = { id: Date.now(), title, level, subject, fileUrl };
      resources.push(newRes);
      localStorage.setItem("library_resources", JSON.stringify(resources));
      form.reset();
      alert("Resource added successfully!");
      renderAdminResources();
    });
  }
}

function renderAdminResources() {
  const listContainer = document.getElementById("adminResourceList");
  if (!listContainer) return;

  let resources = JSON.parse(localStorage.getItem("library_resources")) || [
    { id: 1, title: "Grade 12 Mathematics Paper 1 (2025)", level: "senior", subject: "Mathematics", fileUrl: "#" },
    { id: 2, title: "Grade 12 Biology Paper 2 (2025)", level: "senior", subject: "Biology", fileUrl: "#" },
    { id: 3, title: "Grade 9 Science Past Paper (2024)", level: "junior", subject: "Science", fileUrl: "#" }
  ];

  if (resources.length === 0) {
    listContainer.innerHTML = "<p style='color: #64748b;'>No resources uploaded yet.</p>";
    return;
  }

  let html = "";
  resources.forEach(res => {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div>
          <strong>${res.title}</strong><br>
          <small style="color: #64748b;">Level: ${res.level} | Subject: ${res.subject}</small>
        </div>
        <button onclick="deleteResource(${res.id})" class="danger-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Delete</button>
      </div>
    `;
  });
  listContainer.innerHTML = html;
}

window.deleteResource = function(id) {
  let resources = JSON.parse(localStorage.getItem("library_resources")) || [];
  resources = resources.filter(r => r.id !== id);
  localStorage.setItem("library_resources", JSON.stringify(resources));
  renderAdminResources();
};
