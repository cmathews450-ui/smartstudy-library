document.addEventListener("DOMContentLoaded", () => {
  renderAdminResources();

  const form = document.getElementById("addResourceForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const btn = document.getElementById("uploadSubmitBtn");
      if (btn) {
        btn.textContent = "Uploading... Please wait";
        btn.disabled = true;
      }

      const title = document.getElementById("resTitle").value.trim();
      const category = document.getElementById("resCategory").value;
      const level = document.getElementById("resLevel").value;
      const subject = document.getElementById("resSubject").value.trim();
      const year = document.getElementById("resYear").value.trim();
      const fileInput = document.getElementById("resLocalFile");

      if (!fileInput || fileInput.files.length === 0) {
        alert("Please select a PDF file from your device!");
        resetBtn();
        return;
      }

      const file = fileInput.files[0];

      // File size check: Warn if PDF exceeds 4.5MB for browser storage
      if (file.size > 4.5 * 1024 * 1024) {
        alert("This PDF file is too large for direct browser storage! Please choose a file smaller than 4.5MB.");
        resetBtn();
        return;
      }

      const reader = new FileReader();

      reader.onload = function(event) {
        try {
          const fileDataUrl = event.target.result;
          let resources = JSON.parse(localStorage.getItem("library_resources")) || [];

          const newRes = {
            id: Date.now(),
            title: title || file.name,
            category: category,
            level: level,
            subject: subject,
            year: year,
            fileUrl: fileDataUrl
          };

          resources.unshift(newRes);
          localStorage.setItem("library_resources", JSON.stringify(resources));

          form.reset();
          alert(`Success! "${title || file.name}" uploaded to live website.`);
          renderAdminResources();
        } catch (err) {
          alert("Storage Limit Exceeded! Browser local storage is full. Please delete older files before uploading new ones.");
        } finally {
          resetBtn();
        }
      };

      reader.onerror = function() {
        alert("Failed to read the file from your device.");
        resetBtn();
      };

      reader.readAsDataURL(file);
    });
  }
});

function resetBtn() {
  const btn = document.getElementById("uploadSubmitBtn");
  if (btn) {
    btn.textContent = "Upload to Live Website";
    btn.disabled = false;
  }
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
          <small style="color: #64748b;">Category: ${(res.category || 'past_paper').toUpperCase()} | Level: ${res.level.toUpperCase()} | Subject: ${res.subject} (${res.year})</small>
        </div>
        <button type="button" onclick="deleteSingleResource(${res.id})" style="padding: 0.35rem 0.65rem; font-size: 0.78rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">Delete</button>
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

window.clearAllFiles = function() {
  if (confirm("Are you sure you want to delete ALL uploaded files from your library?")) {
    localStorage.setItem("library_resources", JSON.stringify([]));
    renderAdminResources();
  }
};
