// Initialize IndexedDB Database for Unlimited PDF Files
function openLibraryDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SmartStudyLibraryDB", 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("resources")) {
        db.createObjectStore("resources", { keyPath: "id" });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderAdminResources();

  const form = document.getElementById("addResourceForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
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
      const reader = new FileReader();

      reader.onload = async function(event) {
        try {
          const fileDataUrl = event.target.result;
          const db = await openLibraryDB();
          const tx = db.transaction("resources", "readwrite");
          const store = tx.objectStore("resources");

          const newRes = {
            id: Date.now(),
            title: title || file.name,
            category: category,
            level: level,
            subject: subject,
            year: year,
            fileUrl: fileDataUrl
          };

          store.put(newRes);

          tx.oncomplete = () => {
            form.reset();
            alert(`Success! "${title || file.name}" uploaded to live website.`);
            renderAdminResources();
            resetBtn();
          };

          tx.onerror = (err) => {
            alert("Error saving file to database.");
            resetBtn();
          };
        } catch (err) {
          alert("Database Error: " + err.message);
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

async function renderAdminResources() {
  const listContainer = document.getElementById("adminResourceList");
  if (!listContainer) return;

  try {
    const db = await openLibraryDB();
    const tx = db.transaction("resources", "readonly");
    const store = tx.objectStore("resources");
    const request = store.getAll();

    request.onsuccess = () => {
      const resources = request.result || [];

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
    };
  } catch (err) {
    listContainer.innerHTML = "<p style='color: #ef4444;'>Error loading database.</p>";
  }
}

window.deleteSingleResource = async function(id) {
  if (confirm("Delete this file from your library?")) {
    const db = await openLibraryDB();
    const tx = db.transaction("resources", "readwrite");
    const store = tx.objectStore("resources");
    store.delete(id);
    tx.oncomplete = () => renderAdminResources();
  }
};

window.clearAllFiles = async function() {
  if (confirm("Are you sure you want to delete ALL uploaded files from your library?")) {
    const db = await openLibraryDB();
    const tx = db.transaction("resources", "readwrite");
    const store = tx.objectStore("resources");
    store.clear();
    tx.oncomplete = () => renderAdminResources();
  }
};
