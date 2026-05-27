const entryForm = document.getElementById("entry-form");
const messageEl = document.getElementById("message");
const entriesTableBody = document.querySelector("#entries-table tbody");
const summaryTableBody = document.querySelector("#summary-table tbody");
const filterCategory = document.getElementById("filter-category");
const loadEntriesButton = document.getElementById("load-entries");
const loadSummaryButton = document.getElementById("load-summary");

function showMessage(text, type = "success") {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

function clearMessage() {
  messageEl.textContent = "";
  messageEl.className = "message";
}

function formatEntryRow(entry) {
  const row = document.createElement("tr");
  row.innerHTML = `
        <td>${entry.id}</td>
        <td>${entry.warehouse_id}</td>
        <td>${entry.category}</td>
        <td>${entry.item_name}</td>
        <td>${entry.week_number}</td>
        <td>${entry.quantity}</td>
        <td>${entry.unit}</td>
        <td>${entry.recorded_by}</td>
        <td><button class="delete-button" data-id="${entry.id}">Delete</button></td>
    `;
  return row;
}

function formatSummaryRow(item) {
  const row = document.createElement("tr");
  row.innerHTML = `
        <td>${item.category}</td>
        <td>${item.week_number}</td>
        <td>${item.total_quantity}</td>
        <td>${item.entry_count}</td>
    `;
  return row;
}

async function loadEntries() {
  clearMessage();
  const category = filterCategory.value;
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const response = await fetch(`/entries${query}`);
  const data = await response.json();

  entriesTableBody.innerHTML = "";

  if (!Array.isArray(data.entries) || data.entries.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="9">No entries found.</td>`;
    entriesTableBody.appendChild(emptyRow);
    return;
  }

  data.entries.forEach((entry) => {
    const row = formatEntryRow(entry);
    entriesTableBody.appendChild(row);
  });
}

async function loadSummary() {
  clearMessage();
  const response = await fetch("/summary");
  const data = await response.json();

  summaryTableBody.innerHTML = "";

  if (!Array.isArray(data.summary) || data.summary.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="4">No summary data available.</td>`;
    summaryTableBody.appendChild(emptyRow);
    return;
  }

  data.summary.forEach((item) => {
    const row = formatSummaryRow(item);
    summaryTableBody.appendChild(row);
  });
}

async function deleteEntry(id) {
  const response = await fetch(`/entries/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unable to delete entry." }));
    showMessage(error.message || "Could not delete entry.", "error");
    return;
  }

  showMessage(`Deleted entry ${id}.`, "success");
  loadEntries();
  loadSummary();
}

entryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const formData = new FormData(entryForm);
  const payload = Object.fromEntries(formData.entries());
  payload.week_number = Number(payload.week_number);
  payload.quantity = Number(payload.quantity);

  const response = await fetch("/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.detail
      ? data.detail.map((item) => `${item.field}: ${item.message}`).join(" \n")
      : data.message || data.error;
    showMessage(errorMessage, "error");
    return;
  }

  showMessage("Entry recorded successfully.");
  entryForm.reset();
  loadEntries();
  loadSummary();
});

entriesTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  deleteEntry(button.dataset.id);
});

loadEntriesButton.addEventListener("click", loadEntries);
loadSummaryButton.addEventListener("click", loadSummary);
window.addEventListener("load", () => {
  loadEntries();
  loadSummary();
});
