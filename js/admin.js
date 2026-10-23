document.addEventListener("DOMContentLoaded", () => {
  renderAdminResources();
});

window.handleDirectUpload = function() {
  const title = document.getElementById("resTitle").value.trim();
  const category = document.getElementById("resCategory").value;
  const level = document.getElementById("resLevel").value;
  const subject = document.getElementById("resSubject").value.trim();
  const year = document.getElementById("resYear").value.trim();
  const fileInput = document.getElementById("resLocalFile");

  if (!title) {
    alert("Please enter a Resource Title!");
    return;
  }

  if (!subject) {
    alert("Please enter a Subject!");
    return;
  }

  if (!fileInput || fileInput.files.length === 0) {
    alert("Please select a file from your device!");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    try {
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

      // Clear input fields
      document.getElementById("resTitle").value = "";
      document.getElementById("resSubject").value = "";
      document.getElementById("resLocalFile").value = "";

      alert(`Success! "${title}" uploaded to live website.`);
      renderAdminResources();
    } catch (err) {
      alert("Storage limit reached! Try uploading a smaller PDF file.");
    }
  };

  reader.onerror = function() {
    alert("Failed to read file from local device.");
  };

  reader.readAsDataURL(file);
};

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
        <button onclick="deleteSingleResource(${res.id})" style="padding: 0.35rem 0.65rem; font-size: 0.78rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">Delete</button>
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
