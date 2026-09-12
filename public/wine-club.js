/**
 * Wine Club Benefit Verifier — ChatGPT-Style iPad Interface
 */

const INITIAL_DEMO_MEMBERS = [
  { id: "MBR-1001", name: "John Smith", phone: "555-0101", email: "john.smith@example.com", tier: "Grand Cru Club", creditAmount: 40, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1088", name: "John Smith", phone: "555-0988", email: "jsmith.vintage@gmail.com", tier: "Value Club", creditAmount: 15, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1002", name: "Sarah Johnson", phone: "555-0102", email: "sarah.j@example.com", tier: "Value Club", creditAmount: 15, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1003", name: "Michael Davis", phone: "555-0103", email: "mdavis@example.com", tier: "Grand Cru Club", creditAmount: 40, status: "REDEEMED", redeemedAt: "2026-09-04 18:22:15", redeemedStore: "Store 1", redeemedBy: "Haines S" },
  { id: "MBR-1004", name: "Emily Wilson", phone: "555-0104", email: "emily.w@example.com", tier: "Value Club", creditAmount: 15, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1005", name: "Robert Martinez", phone: "555-0105", email: "robert.m@example.com", tier: "Grand Cru Club", creditAmount: 40, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1006", name: "Jessica Taylor", phone: "555-0106", email: "jtaylor@example.com", tier: "Grand Cru Club", creditAmount: 40, status: "REDEEMED", redeemedAt: "2026-09-08 19:45:00", redeemedStore: "Store 2", redeemedBy: "Harry F" },
  { id: "MBR-1007", name: "David Anderson", phone: "555-0107", email: "dave.anderson@example.com", tier: "Value Club", creditAmount: 15, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1008", name: "Amanda Thomas", phone: "555-0108", email: "amanda.t@example.com", tier: "Grand Cru Club", creditAmount: 40, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1009", name: "James Jackson", phone: "555-0109", email: "jjackson@example.com", tier: "Value Club", creditAmount: 15, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1010", name: "Jennifer White", phone: "555-0110", email: "jennifer.w@example.com", tier: "Grand Cru Club", creditAmount: 40, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1011", name: "Christopher Harris", phone: "555-0111", email: "charris@example.com", tier: "Value Club", creditAmount: 15, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1012", name: "Lisa Martin", phone: "555-0112", email: "lisa.m@example.com", tier: "Grand Cru Club", creditAmount: 40, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1013", name: "Matthew Clark", phone: "555-0113", email: "mclark@example.com", tier: "Value Club", creditAmount: 15, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1014", name: "Ashley Lewis", phone: "555-0114", email: "alewis@example.com", tier: "Grand Cru Club", creditAmount: 40, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" },
  { id: "MBR-1015", name: "Daniel Robinson", phone: "555-0115", email: "drobinson@example.com", tier: "Grand Cru Club", creditAmount: 40, status: "AVAILABLE", redeemedAt: "", redeemedStore: "", redeemedBy: "" }
];

const SERVER_NAMES = [
  "Haines S.",
  "Harry F.",
  "John M.",
  "Nancy J.",
  "Julie S.",
  "Matt G."
];

function getInitialStaff() {
  localStorage.setItem("wine_club_staff_list", JSON.stringify(SERVER_NAMES));
  return [...SERVER_NAMES];
}

// ---------------------------------------------------------------------------
// App State
// ---------------------------------------------------------------------------
let state = {
  members: [],
  scriptUrl: localStorage.getItem("wine_club_script_url") || "",
  staffList: getInitialStaff(),
  activeFilter: "all",
  searchQuery: "",
  selectedMember: null,
  isSyncing: false,
  viewMode: "landing" // "landing" | "results"
};

// ---------------------------------------------------------------------------
// Lifecycle & Initialization
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initDateDisplay();
  loadData();

  // Background Google Sheets polling
  setInterval(() => {
    if (state.scriptUrl && !state.isSyncing) fetchFromGoogleSheets(true);
  }, 45000);
});

function initDateDisplay() {
  const el = document.getElementById("currentMonthText");
  if (el) {
    el.textContent = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
}

// ---------------------------------------------------------------------------
// Data Management
// ---------------------------------------------------------------------------
function loadData() {
  const cached = localStorage.getItem("wine_club_members_cache");
  if (cached) {
    try {
      state.members = JSON.parse(cached);
    } catch (e) {
      state.members = [...INITIAL_DEMO_MEMBERS];
    }
  } else {
    state.members = [...INITIAL_DEMO_MEMBERS];
    saveLocalMembers();
  }

  // Handle URL query parameters (for deep links, testing, screenshots)
  const p = new URLSearchParams(window.location.search);
  const q = p.get("q") || p.get("search");
  const modalId = p.get("modal");
  const redeemedId = p.get("redeemed");
  const showList = p.get("list") || p.get("all");

  if (q) {
    state.searchQuery = q;
    switchToResults();
    const input2 = document.getElementById("memberSearchInput2");
    if (input2) input2.value = q;
    renderMembers();
  } else if (showList) {
    listMembersAlphabetically();
  } else if (modalId) {
    switchToResults();
    renderMembers();
    promptRedeem(modalId);
  } else if (redeemedId) {
    const m = state.members.find(x => x.id === redeemedId);
    if (m) {
      m.status = "REDEEMED";
      m.redeemedAt = "2026-09-12 18:45:00";
      m.redeemedBy = "Haines S";
      saveLocalMembers();
    }
    switchToResults();
    renderMembers();
    if (m) showToastPosAlert(m);
  } else {
    returnToLanding();
  }

  if (state.scriptUrl) fetchFromGoogleSheets();
}

function saveLocalMembers() {
  localStorage.setItem("wine_club_members_cache", JSON.stringify(state.members));
}

async function fetchFromGoogleSheets(isBackground = false) {
  if (!state.scriptUrl) return;
  state.isSyncing = true;
  try {
    const res = await fetch(state.scriptUrl);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    if (data.success && Array.isArray(data.members)) {
      state.members = data.members;
      saveLocalMembers();
      if (state.viewMode === "results") renderMembers();
    }
  } catch (err) {
    console.warn("Sheets sync failed:", err);
  } finally {
    state.isSyncing = false;
  }
}

// ---------------------------------------------------------------------------
// Views & Navigation (ChatGPT-Style)
// ---------------------------------------------------------------------------
function switchToResults() {
  state.viewMode = "results";
  const lv = document.getElementById("landingView");
  const rv = document.getElementById("resultsView");
  if (lv) lv.style.display = "none";
  if (rv) {
    rv.style.display = "flex";
    rv.style.animation = "none";
    rv.offsetHeight;
    rv.style.animation = "smoothFadeIn .22s cubic-bezier(0.16, 1, 0.3, 1) forwards";
  }
}

function returnToLanding() {
  state.viewMode = "landing";
  state.searchQuery = "";
  const lv = document.getElementById("landingView");
  const rv = document.getElementById("resultsView");
  if (rv) rv.style.display = "none";
  if (lv) {
    lv.style.display = "flex";
    lv.style.animation = "none";
    lv.offsetHeight;
    lv.style.animation = "smoothFadeIn .22s cubic-bezier(0.16, 1, 0.3, 1) forwards";
  }

  const input1 = document.getElementById("memberSearchInput");
  const input2 = document.getElementById("memberSearchInput2");
  if (input1) input1.value = "";
  if (input2) input2.value = "";

  const clearBtn2 = document.getElementById("clearSearchBtn2");
  if (clearBtn2) clearBtn2.style.display = "none";
}

function handleLandingSearch(query) {
  const trimmed = (query || "").trim();
  if (trimmed) {
    state.searchQuery = trimmed;
    switchToResults();
    const input2 = document.getElementById("memberSearchInput2");
    if (input2) {
      input2.value = query;
      input2.focus();
    }
    const clearBtn2 = document.getElementById("clearSearchBtn2");
    if (clearBtn2) clearBtn2.style.display = "flex";
    renderMembers();
  } else {
    state.searchQuery = "";
    const input1 = document.getElementById("memberSearchInput");
    if (input1) input1.value = "";
  }
}

function handleLandingKeydown(event) {
  if (event.key === "Enter") {
    const val = event.target.value;
    handleLandingSearch(val);
  }
}

function triggerSearchFromLanding() {
  const input1 = document.getElementById("memberSearchInput");
  if (input1 && input1.value.trim()) {
    handleLandingSearch(input1.value);
  } else {
    listMembersAlphabetically();
  }
}

function listMembersAlphabetically() {
  state.searchQuery = "";
  state.activeFilter = "all";
  switchToResults();

  const input1 = document.getElementById("memberSearchInput");
  const input2 = document.getElementById("memberSearchInput2");
  if (input1) input1.value = "";
  if (input2) input2.value = "";

  const clearBtn2 = document.getElementById("clearSearchBtn2");
  if (clearBtn2) clearBtn2.style.display = "none";

  document.querySelectorAll(".pills .pill").forEach(el => el.classList.remove("active"));
  const firstPill = document.querySelector(".pills .pill");
  if (firstPill) firstPill.classList.add("active");

  renderMembers();
}

let searchDebounceTimer = null;

function handleResultsSearch(query) {
  const trimmed = (query || "").trim();
  const clearBtn2 = document.getElementById("clearSearchBtn2");
  if (clearBtn2) clearBtn2.style.display = trimmed ? "flex" : "none";

  if (!trimmed) {
    clearTimeout(searchDebounceTimer);
    returnToLanding();
    return;
  }

  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    state.searchQuery = trimmed;
    renderMembers();
  }, 40);
}

function clearResultsSearch() {
  returnToLanding();
}

function clearSearch() {
  returnToLanding();
}

function setFilter(filterType, btn) {
  state.activeFilter = filterType;
  document.querySelectorAll(".pills .pill").forEach(el => el.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderMembers();
}

// ---------------------------------------------------------------------------
// Filtering & Alphabetical Sorting
// ---------------------------------------------------------------------------
function filterMembers() {
  let list = [...state.members];

  // 1. Text Query Filter
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    const digits = q.replace(/[^0-9]/g, "");
    list = list.filter(m => {
      if (m.name && m.name.toLowerCase().includes(q)) return true;
      if (m.email && m.email.toLowerCase().includes(q)) return true;
      if (m.tier && m.tier.toLowerCase().includes(q)) return true;
      if (m.phone) {
        const pd = m.phone.replace(/[^0-9]/g, "");
        if (digits ? pd.includes(digits) : m.phone.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }

  // 2. Status Filter
  if (state.activeFilter === "available") {
    list = list.filter(m => m.status === "AVAILABLE");
  } else if (state.activeFilter === "redeemed") {
    list = list.filter(m => m.status === "REDEEMED");
  }

  // 3. Always sort alphabetically by name A-Z
  list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return list;
}

// ---------------------------------------------------------------------------
// Rendering Members & Cards
// ---------------------------------------------------------------------------
function renderMembers() {
  const container = document.getElementById("membersListContainer");
  const countEl = document.getElementById("resultsCount");
  if (!container) return;

  const list = filterMembers();
  if (countEl) countEl.textContent = `${list.length} of ${state.members.length} members`;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <h3>No members found</h3>
        <p>Try searching for a different name or phone number.</p>
      </div>`;
    return;
  }

  container.innerHTML = list.map(m => cardHtml(m)).join("");
}

function cardHtml(m) {
  const isGrandCru = (m.tier || "").toLowerCase().includes("grand");
  const amt = `$${Number(m.creditAmount || (isGrandCru ? 40 : 15)).toFixed(0)}`;
  const isAvail = m.status === "AVAILABLE";

  return `
    <div class="card" id="card-${m.id}">
      <div class="card-top">
        <div>
          <div class="card-name">${esc(m.name)}</div>
          <div class="card-phone">${esc(m.phone || "—")}</div>
          ${m.email ? `<div class="card-email">${esc(m.email)}</div>` : ""}
        </div>
        <span class="tag ${isGrandCru ? 'tag-gold' : 'tag-purple'}">${esc(m.tier)} &middot; ${amt}</span>
      </div>

      <div class="status-strip ${isAvail ? 'available' : 'redeemed'}">
        <div>
          <div style="display:flex;align-items:center;">
            <span class="status-dot ${isAvail ? 'available' : 'redeemed'}"></span>
            <span>${isAvail ? 'Available' : 'Redeemed'}</span>
          </div>
          ${!isAvail ? `<div class="status-detail">${fmtTs(m.redeemedAt)} by ${esc(m.redeemedBy || "staff")}</div>` : ""}
        </div>
        <div class="status-amount">${amt}</div>
      </div>

      ${isAvail
        ? `<button class="action-btn active" onclick="promptRedeem('${m.id}')">Redeem ${amt} bar credit</button>`
        : `<button class="action-btn locked" disabled>Already redeemed this month</button>`}
    </div>`;
}

// ---------------------------------------------------------------------------
// Redemption Modal Flow (Server Name selection at the end)
// ---------------------------------------------------------------------------
function promptRedeem(id) {
  const m = state.members.find(x => x.id === id);
  if (!m || m.status === "REDEEMED") return;

  state.selectedMember = m;
  const amt = `$${Number(m.creditAmount).toFixed(0)}`;

  // Haines S is guaranteed first, Harry F is present
  const serverOptions = state.staffList.map(s => 
    `<option value="${esc(s)}">${esc(s)}</option>`
  ).join("");

  document.getElementById("confirmModalBody").innerHTML = `
    <div class="confirm-member">
      <div class="confirm-name">${esc(m.name)}</div>
      <div class="confirm-tier">${esc(m.tier)} &mdash; ${amt} bar credit</div>
    </div>

    <div class="confirm-row">
      <span class="confirm-label">Date</span>
      <span class="confirm-value">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
    </div>
    <div class="confirm-row">
      <span class="confirm-label">Credit amount</span>
      <span class="confirm-value">${amt}</span>
    </div>

    <label class="field-label" style="margin-top:20px;">Server Name:</label>
    <select id="confirmStaffSelect" class="confirm-staff-select">
      ${serverOptions}
    </select>

    <p class="confirm-note">This locks the member's monthly credit across all stores until next month.</p>
  `;

  document.getElementById("confirmModal").style.display = "flex";
}

function closeConfirmModal() {
  const modal = document.getElementById("confirmModal");
  if (modal) modal.style.display = "none";
  state.selectedMember = null;
}

async function executeRedemption() {
  const m = state.selectedMember;
  if (!m) return;

  const staffSelect = document.getElementById("confirmStaffSelect");
  const serverName = staffSelect ? staffSelect.value : (state.staffList[0] || "Haines S.");
  const ts = new Date().toISOString().replace("T", " ").substring(0, 19);

  const btn = document.getElementById("confirmRedeemBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Processing...";
  }

  // 1. Google Sheets sync if connected
  if (state.scriptUrl) {
    try {
      const res = await fetch(state.scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "redeem", memberId: m.id, staff: serverName, notes: "iPad Verifier" })
      });
      const data = await res.json();
      if (!data.success) {
        if (data.alreadyRedeemed) {
          alert(`⚠️ Already redeemed!\n${data.error}`);
          closeConfirmModal();
          fetchFromGoogleSheets();
          return;
        }
        throw new Error(data.error);
      }
    } catch (err) {
      console.warn("Server sync error (saved locally):", err);
    }
  }

  // 2. Update local state
  m.status = "REDEEMED";
  m.redeemedAt = ts;
  m.redeemedBy = serverName;

  saveLocalMembers();
  closeConfirmModal();
  renderMembers();

  // 3. Show Toast POS Reminder Notification
  showToastPosAlert(m);

  if (btn) {
    btn.disabled = false;
    btn.textContent = "Redeem credit";
  }
}

// ---------------------------------------------------------------------------
// Toast POS Alert Banner
// ---------------------------------------------------------------------------
function showToastPosAlert(m) {
  const el = document.getElementById("toastPromptAlert");
  if (!el) return;

  const isGrandCru = (m.tier || "").toLowerCase().includes("grand");
  const discount = isGrandCru ? "Wine Club: Grand Cru ($40)" : "Wine Club: Value ($15)";

  document.getElementById("toastAlertTitle").textContent = `${m.name} — ${m.tier}`;
  document.getElementById("toastAlertMessage").textContent = `Apply "${discount}" discount in Toast POS`;

  el.style.display = "flex";
  setTimeout(dismissToastAlert, 8000);
}

function dismissToastAlert() {
  const el = document.getElementById("toastPromptAlert");
  if (el) el.style.display = "none";
}

// ---------------------------------------------------------------------------
// Settings Modal
// ---------------------------------------------------------------------------
function openSettingsModal() {
  const si = document.getElementById("scriptUrlInput");
  const ci = document.getElementById("customStaffInput");
  if (si) si.value = state.scriptUrl;
  if (ci) ci.value = state.staffList.join(", ");
  updateConnectionStatusText();
  document.getElementById("settingsModal").style.display = "flex";
}

function closeSettingsModal() {
  document.getElementById("settingsModal").style.display = "none";
}

function saveSettings() {
  const si = document.getElementById("scriptUrlInput");
  const ci = document.getElementById("customStaffInput");

  if (si) {
    state.scriptUrl = si.value.trim();
    localStorage.setItem("wine_club_script_url", state.scriptUrl);
  }

  if (ci) {
    const raw = ci.value.trim();
    if (raw) {
      const names = raw.split(",").map(s => s.trim()).filter(Boolean);
      if (names.length) {
        state.staffList = names;
        localStorage.setItem("wine_club_staff_list", JSON.stringify(state.staffList));
      }
    }
  }

  closeSettingsModal();
  if (state.scriptUrl) fetchFromGoogleSheets();
}

async function testConnection() {
  const url = (document.getElementById("scriptUrlInput") || {}).value || "";
  const el = document.getElementById("connectionStatusText");
  if (!url) {
    alert("Please enter a Google Apps Script URL first.");
    return;
  }
  if (el) el.textContent = "Testing connection...";
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (el) el.textContent = data.success ? `Connected — ${data.count} members loaded from Google Sheets` : `Error: ${data.error}`;
  } catch (err) {
    if (el) el.textContent = `Connection failed: ${err.message}`;
  }
}

function loadSampleData() {
  if (!confirm("Reset to demo data? (Unsaved local changes will be replaced)")) return;
  state.members = [...INITIAL_DEMO_MEMBERS];
  saveLocalMembers();
  renderMembers();
  closeSettingsModal();
}

function resetMonthDemo() {
  if (!confirm("Reset all members back to AVAILABLE for testing?")) return;
  state.members.forEach(m => {
    m.status = "AVAILABLE";
    m.redeemedAt = "";
    m.redeemedStore = "";
    m.redeemedBy = "";
  });
  saveLocalMembers();
  renderMembers();
  closeSettingsModal();
}

function updateConnectionStatusText() {
  const el = document.getElementById("connectionStatusText");
  if (!el) return;
  el.textContent = state.scriptUrl ? `Connected: ${state.scriptUrl}` : "Local demo mode (no Google Sheet linked)";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function esc(s) {
  if (!s) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function fmtTs(ts) {
  if (!ts) return "earlier this month";
  try {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " at " +
           d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch (e) {
    return ts;
  }
}
