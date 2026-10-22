function getAdminPassword() {
  return localStorage.getItem("admin_custom_password") || "admin123";
}

function getResources() {
  const stored = localStorage.getItem("library_resources");
  return stored ? JSON.parse(stored) : [];
}

function saveResources(resources) {
  localStorage.setItem("library_resources", JSON.stringify(resources));
}

window.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("isAdminLoggedIn") === "true") {
    showDashboard();
  }
});

document.getElementById("toggleLoginPassword")?.addEventListener("click", function() {
  const p = document.getElementById("adminPasswordInput");
  p.type = p.type === "password" ? "text" : "password";
  this.textContent = p.type === "password" ? "👁️" : "🙈";
});

document.querySelectorAll(".toggle-pass-field").forEach(btn => {
  btn.addEventListener("click", function() {
    const p = this.previousElementSibling;
    p.type = p.type === "password" ? "text" : "password";
    this.textContent = p.type === "password" ? "👁️" : "🙈";
  });
});

document.getElementById("forgotPasswordBtn")?.addEventListener("click", function() {
  if (confirm("Reset admin password back to 'admin123'?")) {
    localStorage.removeItem("admin_custom_password");
    alert("Password reset to admin123");
  }
});

document.getElementById("loginForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const pass = document.getElementById("adminPasswordInput").value;
  if (pass === getAdminPassword()) {
    sessionStorage.setItem("isAdminLoggedIn", "true");
    showDashboard();
  } else {
    document.getElementById("loginError").style.display = "block";
  }
});

const handleAdminLogout = function() {
  sessionStorage.removeItem("isAdminLoggedIn");
  document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("headerAdminLogoutBtn").style.display = "none";
  document.getElementById("adminPasswordInput").value = "";
};

document.getElementById("headerAdminLogoutBtn")?.addEventListener("click", handleAdminLogout);

document.getElementById("changePasswordForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const cur = document.getElementById("currentPassInput").value;
  const neu = document.getElementById("newPassInput").value;
  if (cur === getAdminPassword()) {
    localStorage.setItem("admin_custom_password", neu);
    alert("Password updated successfully!");
    this.reset();
  } else {
    alert("Incorrect current password.");
  }
});

function showDashboard() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("dashboardSection").style.display = "block";
  document.getElementById("headerAdminLogoutBtn").style.display = "inline-block";
  renderAdminList();
}

// Handling local file picker from any PC using FileReader
document.getElementById("uploadForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const title = document.getElementById("titleInput").value;
  const level = document.getElementById("levelInput").value;
  const subject = document.getElementById("subjectInput").value;
  const fileInput = document.getElementById("pdfFileInput");

  if (fileInput.files.length === 0) {
    alert("Please select a PDF file from your local PC.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const base64PdfUrl = event.target.result;

    const resources = getResources();
    resources.push({
      id: Date.now(),
      title,
      level,
      subject,
      fileUrl: base64PdfUrl
    });

    saveResources(resources);
    alert("Material successfully loaded from your PC and added to the library!");
    document.getElementById("uploadForm").reset();
    renderAdminList();
  };

  reader.readAsDataURL(file);
});

function renderAdminList() {
  const list = document.getElementById("adminResourceList");
  const resources = getResources();
  if (resources.length === 0) {
    list.innerHTML = "<p style='color:#64748b;'>No library resources uploaded yet.</p>";
    return;
  }

  list.innerHTML = "";
  resources.forEach(res => {
    const item = document.createElement("div");
    item.style.cssText = "background:#fff; border:1px solid #e2e8f0; padding:1rem; border-radius:8px; margin-bottom:0.8rem; display:flex; justify-content:space-between; align-items:center;";
    item.innerHTML = `
      <div>
        <strong>${res.title}</strong><br>
        <span class="tag" style="margin-top:0.3rem; display:inline-block;">${res.subject} (${res.level.toUpperCase()})</span>
      </div>
      <button onclick="deleteResource(${res.id})" class="danger-btn">Delete</button>
    `;
    list.appendChild(item);
  });
}

window.deleteResource = function(id) {
  if (confirm("Delete this resource?")) {
    let resources = getResources().filter(r => r.id !== id);
    saveResources(resources);
    renderAdminList();
  }
};