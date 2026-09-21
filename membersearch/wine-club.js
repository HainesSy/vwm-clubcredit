/**
 * Wine Club Member Search — Featured Edition
 * Bar Credit + Accumulating Monthly Bottle Pickups + Tier Allocations
 */

const WINE_CATALOG = {
  "2026-09": {
    "Grand Cru Club": [
      "2020 Silver Oak Alexander Valley Cabernet Sauvignon",
      "2021 Caymus Vineyards Napa Valley Cabernet Sauvignon"
    ],
    "Value Club": [
      "2022 Duckhorn Vineyards Sauvignon Blanc",
      "2021 DAOU Discovery Cabernet Sauvignon"
    ]
  },
  "2026-08": {
    "Grand Cru Club": [
      "2023 Jordan Alexander Valley Cabernet Sauvignon",
      "2021 Opus One Napa Valley Red Blend"
    ],
    "Value Club": [
      "2022 La Crema Sonoma Coast Pinot Noir",
      "2022 Whispering Angel Côtes de Provence Rosé"
    ]
  },
  "2026-07": {
    "Grand Cru Club": [
      "2022 Stag's Leap Artemis Cabernet Sauvignon",
      "2020 Duckhorn Napa Valley Merlot"
    ],
    "Value Club": [
      "2021 Meiomi Pinot Noir",
      "2022 Kim Crawford Marlborough Sauvignon Blanc"
    ]
  },
  "2026-06": {
    "Grand Cru Club": [
      "2019 Far Niente Napa Valley Estate Cabernet Sauvignon",
      "2021 Rombauer Carneros Chardonnay"
    ],
    "Value Club": [
      "2022 Decoy Sonoma County Red Blend",
      "2023 Oyster Bay Marlborough Pinot Grigio"
    ]
  }
};

const SERVER_NAMES = [
  "Haines S.",
  "Harry F.",
  "John M.",
  "Nancy J.",
  "Julie S.",
  "Matt G."
];

const HISTORICAL_PICKUP_DATES = {
  "2026-06": { date: "2026-06-18 15:42:00", staff: "Nancy J." },
  "2026-07": { date: "2026-07-14 11:20:00", staff: "Harry F." },
  "2026-08": { date: "2026-08-11 16:35:00", staff: "John M." },
  "2026-09": { date: "2026-09-08 14:15:00", staff: "Haines S." }
};

function makePickupHistory(tier, pendingMonthList) {
  const months = ["2026-06", "2026-07", "2026-08", "2026-09"];
  const isGrand = (tier || "").toLowerCase().includes("grand");
  const tierKey = isGrand ? "Grand Cru Club" : "Value Club";

  return months.map(m => {
    const isPending = pendingMonthList.includes(m);
    const wines = (WINE_CATALOG[m] && WINE_CATALOG[m][tierKey]) ? [...WINE_CATALOG[m][tierKey]] : [];
    const defaultHist = HISTORICAL_PICKUP_DATES[m] || { date: "2026-09-02 14:30:00", staff: "Haines S." };
    return {
      month: m,
      status: isPending ? "PENDING" : "PICKED_UP",
      wines: wines,
      pickedUpAt: isPending ? "" : defaultHist.date,
      pickedUpBy: isPending ? "" : defaultHist.staff
    };
  });
}

const INITIAL_DEMO_MEMBERS = [
  {
    id: "MBR-1001",
    name: "John Smith",
    phone: "555-0101",
    email: "john.smith@example.com",
    tier: "Grand Cru Club",
    creditAmount: 40,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Grand Cru Club", ["2026-06", "2026-07", "2026-08", "2026-09"])
  },
  {
    id: "MBR-1088",
    name: "John Smith",
    phone: "555-0988",
    email: "jsmith.vintage@gmail.com",
    tier: "Value Club",
    creditAmount: 15,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Value Club", ["2026-08", "2026-09"])
  },
  {
    id: "MBR-1002",
    name: "Sarah Johnson",
    phone: "555-0102",
    email: "sarah.j@example.com",
    tier: "Value Club",
    creditAmount: 15,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "PICKED_UP",
    pickedUpAt: "2026-09-08 16:45:00",
    pickedUpBy: "Haines S.",
    pickupHistory: makePickupHistory("Value Club", [])
  },
  {
    id: "MBR-1003",
    name: "Michael Davis",
    phone: "555-0103",
    email: "mdavis@example.com",
    tier: "Grand Cru Club",
    creditAmount: 40,
    status: "REDEEMED",
    redeemedAt: "2026-09-04 18:22:15",
    redeemedBy: "Haines S.",
    pickupStatus: "PICKED_UP",
    pickedUpAt: "2026-09-04 18:22:15",
    pickedUpBy: "Haines S.",
    pickupHistory: makePickupHistory("Grand Cru Club", [])
  },
  {
    id: "MBR-1004",
    name: "Emily Wilson",
    phone: "555-0104",
    email: "emily.w@example.com",
    tier: "Value Club",
    creditAmount: 15,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Value Club", ["2026-07", "2026-08", "2026-09"])
  },
  {
    id: "MBR-1005",
    name: "Robert Martinez",
    phone: "555-0105",
    email: "robert.m@example.com",
    tier: "Grand Cru Club",
    creditAmount: 40,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Grand Cru Club", ["2026-09"])
  },
  {
    id: "MBR-1006",
    name: "Jessica Taylor",
    phone: "555-0106",
    email: "jtaylor@example.com",
    tier: "Grand Cru Club",
    creditAmount: 40,
    status: "REDEEMED",
    redeemedAt: "2026-09-08 19:45:00",
    redeemedBy: "Harry F.",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Grand Cru Club", ["2026-08", "2026-09"])
  },
  {
    id: "MBR-1007",
    name: "David Anderson",
    phone: "555-0107",
    email: "dave.anderson@example.com",
    tier: "Value Club",
    creditAmount: 15,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Value Club", ["2026-09"])
  },
  {
    id: "MBR-1008",
    name: "Amanda Thomas",
    phone: "555-0108",
    email: "amanda.t@example.com",
    tier: "Grand Cru Club",
    creditAmount: 40,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Grand Cru Club", ["2026-06", "2026-07", "2026-08", "2026-09"])
  },
  {
    id: "MBR-1009",
    name: "James Jackson",
    phone: "555-0109",
    email: "jjackson@example.com",
    tier: "Value Club",
    creditAmount: 15,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Value Club", ["2026-07", "2026-08", "2026-09"])
  },
  {
    id: "MBR-1010",
    name: "Jennifer White",
    phone: "555-0110",
    email: "jennifer.w@example.com",
    tier: "Grand Cru Club",
    creditAmount: 40,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Grand Cru Club", ["2026-08", "2026-09"])
  },
  {
    id: "MBR-1011",
    name: "Christopher Harris",
    phone: "555-0111",
    email: "charris@example.com",
    tier: "Value Club",
    creditAmount: 15,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "PICKED_UP",
    pickedUpAt: "2026-09-07 12:10:00",
    pickedUpBy: "Nancy J.",
    pickupHistory: makePickupHistory("Value Club", [])
  },
  {
    id: "MBR-1012",
    name: "Lisa Martin",
    phone: "555-0112",
    email: "lisa.m@example.com",
    tier: "Grand Cru Club",
    creditAmount: 40,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Grand Cru Club", ["2026-09"])
  },
  {
    id: "MBR-1013",
    name: "Matthew Clark",
    phone: "555-0113",
    email: "mclark@example.com",
    tier: "Value Club",
    creditAmount: 15,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Value Club", ["2026-08", "2026-09"])
  },
  {
    id: "MBR-1014",
    name: "Ashley Lewis",
    phone: "555-0114",
    email: "alewis@example.com",
    tier: "Grand Cru Club",
    creditAmount: 40,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Grand Cru Club", ["2026-07", "2026-08", "2026-09"])
  },
  {
    id: "MBR-1015",
    name: "Daniel Robinson",
    phone: "555-0115",
    email: "drobinson@example.com",
    tier: "Grand Cru Club",
    creditAmount: 40,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupStatus: "READY",
    pickedUpAt: "",
    pickedUpBy: "",
    pickupHistory: makePickupHistory("Grand Cru Club", ["2026-09"])
  }
];

function getInitialStaff() {
  const saved = localStorage.getItem("vwm_search_staff_list");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {}
  }
  localStorage.setItem("vwm_search_staff_list", JSON.stringify(SERVER_NAMES));
  return [...SERVER_NAMES];
}

function normalizeMember(m) {
  if (!m || typeof m !== "object") return m;
  const isGrand = (m.tier || "").toLowerCase().includes("grand");
  if (!m.creditAmount) {
    m.creditAmount = isGrand ? 40 : 15;
  }
  if (!m.status) {
    m.status = "AVAILABLE";
  }

  const tierKey = isGrand ? "Grand Cru Club" : "Value Club";

  if (!Array.isArray(m.pickupHistory) || m.pickupHistory.length === 0) {
    const isReady = (m.pickupStatus || "").toUpperCase() === "READY" || !m.pickupStatus;
    const pendingMonths = isReady ? ["2026-09"] : [];
    m.pickupHistory = makePickupHistory(m.tier, pendingMonths);
  } else {
    m.pickupHistory.forEach(h => {
      if (!h.wines || !h.wines.length) {
        h.wines = (WINE_CATALOG[h.month] && WINE_CATALOG[h.month][tierKey]) ? [...WINE_CATALOG[h.month][tierKey]] : [];
      }
      if (!h.status) {
        h.status = "PENDING";
      }
    });
  }

  const hasPending = m.pickupHistory.some(h => h.status === "PENDING");
  m.pickupStatus = hasPending ? "READY" : "PICKED_UP";

  return m;
}

// ---------------------------------------------------------------------------
// App State
// ---------------------------------------------------------------------------
let state = {
  members: [],
  scriptUrl: localStorage.getItem("vwm_search_script_url") || "",
  staffList: getInitialStaff(),
  activeFilter: "all",
  searchQuery: "",
  selectedMember: null,
  selectedPickupMonths: new Set(),
  isSyncing: false,
  viewMode: "landing"
};

// ---------------------------------------------------------------------------
// Lifecycle & Init
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initDateDisplay();
  loadData();

  setInterval(() => {
    if (state.scriptUrl && !state.isSyncing) fetchFromGoogleSheets(true);
  }, 45000);
});

function initDateDisplay() {
  const el = document.getElementById("currentMonthText");
  if (el) {
    el.textContent = getCurrentMonthName();
  }
}

function getCurrentMonthName() {
  return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Data Management
// ---------------------------------------------------------------------------
function loadData() {
  const cached = localStorage.getItem("vwm_search_members_cache");
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.members = parsed.map(m => normalizeMember(m));
      } else {
        state.members = JSON.parse(JSON.stringify(INITIAL_DEMO_MEMBERS)).map(m => normalizeMember(m));
        saveLocalMembers();
      }
    } catch (e) {
      state.members = JSON.parse(JSON.stringify(INITIAL_DEMO_MEMBERS)).map(m => normalizeMember(m));
      saveLocalMembers();
    }
  } else {
    state.members = JSON.parse(JSON.stringify(INITIAL_DEMO_MEMBERS)).map(m => normalizeMember(m));
    saveLocalMembers();
  }

  const p = new URLSearchParams(window.location.search);
  const q = p.get("q") || p.get("search");
  const modalId = p.get("modal");
  const pickupId = p.get("pickup");
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
  } else if (pickupId) {
    switchToResults();
    renderMembers();
    promptPickup(pickupId);
  } else {
    returnToLanding();
  }

  if (state.scriptUrl) fetchFromGoogleSheets();
}

function saveLocalMembers() {
  localStorage.setItem("vwm_search_members_cache", JSON.stringify(state.members));
}

async function fetchFromGoogleSheets(isBackground = false) {
  if (!state.scriptUrl) return;
  state.isSyncing = true;
  try {
    const res = await fetch(state.scriptUrl);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    if (data.success && Array.isArray(data.members)) {
      const existingMap = new Map(state.members.map(m => [m.id, m]));
      const merged = data.members.map(incoming => {
        const existing = existingMap.get(incoming.id);
        if (existing && existing.pickupHistory && existing.pickupHistory.length > 0) {
          if (!incoming.pickupHistory || !incoming.pickupHistory.length) {
            incoming.pickupHistory = existing.pickupHistory;
            incoming.pickupStatus = existing.pickupStatus;
            incoming.pickedUpAt = existing.pickedUpAt;
            incoming.pickedUpBy = existing.pickedUpBy;
          }
        }
        return normalizeMember(incoming);
      });
      state.members = merged;
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
// Views & Navigation
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

  // 2. Status Filter Pills
  if (state.activeFilter === "bottles-ready") {
    list = list.filter(m => {
      if (m.pickupHistory && Array.isArray(m.pickupHistory)) {
        return m.pickupHistory.some(h => h.status === "PENDING");
      }
      return m.pickupStatus === "READY";
    });
  } else if (state.activeFilter === "credit-available") {
    list = list.filter(m => m.status === "AVAILABLE");
  } else if (state.activeFilter === "completed") {
    list = list.filter(m => {
      const hasPendingBottles = m.pickupHistory && Array.isArray(m.pickupHistory)
        ? m.pickupHistory.some(h => h.status === "PENDING")
        : m.pickupStatus === "READY";
      return m.status === "REDEEMED" && !hasPendingBottles;
    });
  }

  // 3. Always sort alphabetically by name A-Z
  list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return list;
}

// ---------------------------------------------------------------------------
// Rendering Members & Decluttered Compact Cards
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
  const isCreditAvail = m.status === "AVAILABLE";

  // Accumulating bottle pickups
  const history = m.pickupHistory || [];
  const pendingItems = history.filter(h => h.status === "PENDING");
  const pendingCount = pendingItems.length;
  const pendingBottles = pendingItems.reduce((acc, h) => acc + (h.wines ? h.wines.length : 2), 0);

  return `
    <div class="card" id="card-${m.id}">
      <div class="card-top">
        <div class="card-info">
          <div class="card-name">${esc(m.name)}</div>
          <div class="card-meta">
            <span class="card-phone">${esc(m.phone || "—")}</span>
            ${m.email ? `<span class="card-meta-dot">&bull;</span><span class="card-email">${esc(m.email)}</span>` : ""}
          </div>
        </div>
        <span class="tag ${isGrandCru ? 'tag-champagne' : 'tag-slate'}">${esc(m.tier)}</span>
      </div>

      <div class="card-benefits">
        <!-- Wine Bottles Status Row -->
        <div class="benefit-row">
          <div class="benefit-label-group">
            <svg class="benefit-icon icon-wine" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 22h8"/>
              <path d="M7 10h10"/>
              <path d="M12 15v7"/>
              <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>
            </svg>
            <span class="benefit-label">Bottle Allocations</span>
          </div>
          <div class="benefit-status ${pendingCount > 0 ? 'status-wine' : 'status-muted'}">
            ${pendingCount > 0
              ? `<span class="benefit-badge badge-wine">${pendingBottles} bottle${pendingBottles > 1 ? 's' : ''} ready${pendingCount > 1 ? ` <span class="benefit-subcount">(${pendingCount} mos)</span>` : ''}</span>`
              : `<span class="benefit-done">All bottles picked up</span>`
            }
          </div>
        </div>

        <div class="benefit-divider"></div>

        <!-- Bar Credit Status Row -->
        <div class="benefit-row">
          <div class="benefit-label-group">
            <svg class="benefit-icon icon-credit" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2"/>
              <line x1="2" x2="22" y1="10" y2="10"/>
            </svg>
            <span class="benefit-label">Bar Tab Credit</span>
          </div>
          <div class="benefit-status ${isCreditAvail ? 'status-emerald' : 'status-muted'}">
            ${isCreditAvail
              ? `<span class="benefit-badge badge-emerald">${amt} available</span>`
              : `<span class="benefit-done">${amt} redeemed</span>`
            }
          </div>
        </div>
      </div>

      <div class="card-actions">
        <button 
          type="button" 
          class="action-btn ${pendingCount > 0 ? 'btn-wine' : 'btn-dim'}" 
          onclick="promptPickup('${m.id}')"
          title="${pendingCount > 0 ? `View ${pendingBottles} bottles ready for pickup` : 'View previous pickup history'}"
        >
          ${pendingCount > 0 ? `View Bottles (${pendingBottles})` : 'Bottle History'}
        </button>

        ${isCreditAvail
          ? `<button type="button" class="action-btn btn-credit" onclick="promptRedeem('${m.id}')" title="Redeem ${amt} bar tab credit">Redeem ${amt}</button>`
          : `<button type="button" class="action-btn btn-locked" disabled title="Bar tab credit already redeemed for this month">Credit Redeemed</button>`
        }
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Bottle Pickup Multi-Month Modal & Interaction
// ---------------------------------------------------------------------------
function promptPickup(id) {
  const m = state.members.find(x => x.id === id);
  if (!m) return;

  state.selectedMember = m;
  const history = m.pickupHistory || [];
  // Sort descending: newest / current month at top
  const pending = history
    .filter(h => h.status === "PENDING")
    .sort((a, b) => b.month.localeCompare(a.month));
  const pickedUp = history
    .filter(h => h.status === "PICKED_UP")
    .sort((a, b) => b.month.localeCompare(a.month));

  // Pre-check all pending months by default for easy bulk pickup
  state.selectedPickupMonths = new Set(pending.map(h => h.month));

  const serverOptions = state.staffList.map(s => 
    `<option value="${esc(s)}">${esc(s)}</option>`
  ).join("");

  const modalBody = document.getElementById("pickupModalBody");
  const modalFoot = document.getElementById("pickupModalFoot");
  const modalHead = document.getElementById("pickupModalHeading");
  if (modalHead) modalHead.textContent = `Bottle Pickup — ${m.name}`;

  if (pending.length === 0) {
    // All picked up view (History only)
    modalBody.innerHTML = `
      <div class="confirm-member">
        <div class="confirm-name">${esc(m.name)}</div>
        <div class="confirm-tier">${esc(m.tier)} &bull; ${esc(m.phone || 'No phone')}</div>
      </div>

      <div class="pickup-all-done-banner">
        <div class="done-check-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="done-title">All bottles are picked up</div>
        <div class="done-sub">This member has no pending wine allocations waiting for pickup.</div>
      </div>

      <div class="pickup-history-section">
        <div class="pickup-section-label">Pickup Record (${pickedUp.length} month${pickedUp.length > 1 ? 's' : ''})</div>
        <div class="history-items-list">
          ${pickedUp.map(h => `
            <div class="history-item">
              <div class="history-item-top">
                <span class="history-item-month">${formatMonthName(h.month)}</span>
                <span class="history-item-date">${fmtTs(h.pickedUpAt)} by ${esc(h.pickedUpBy || 'staff')}</span>
              </div>
              <div class="history-item-wines">
                ${(h.wines || []).map(w => `<div class="history-item-wine">• ${esc(w)}</div>`).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    if (modalFoot) {
      modalFoot.innerHTML = `
        <button class="btn-ghost" onclick="closePickupModal()">Close</button>
      `;
    }
  } else {
    // Active pickup with multi-month checkboxes
    const totalBottles = pending.reduce((sum, h) => sum + (h.wines ? h.wines.length : 2), 0);

    const pendingHtml = pending.map(h => {
      const wines = h.wines || [];
      const isChecked = state.selectedPickupMonths.has(h.month);
      return `
        <div class="pickup-month-card ${isChecked ? 'is-selected' : ''}" id="pickupCard_${h.month}" onclick="handlePickupCardClick('${h.month}', event)">
          <div class="pickup-month-top">
            <label class="pickup-checkbox-label">
              <input 
                type="checkbox" 
                class="pickup-checkbox" 
                id="pickupChk_${h.month}" 
                value="${h.month}" 
                ${isChecked ? 'checked' : ''} 
                onchange="togglePickupMonth('${h.month}', this.checked)"
              >
              <span class="pickup-month-name">${formatMonthName(h.month)}</span>
            </label>
            <span class="pickup-month-count">${wines.length} bottles</span>
          </div>
          <div class="pickup-month-wines">
            ${wines.map(w => `
              <div class="pickup-wine-item">
                <span class="pickup-wine-dot">•</span>
                <span class="pickup-wine-text">${esc(w)}</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }).join("");

    const pickedUpAccordionHtml = pickedUp.length > 0 ? `
      <div class="pickup-history-accordion">
        <button type="button" class="pickup-history-toggle" onclick="togglePickupHistory()">
          <span>Previously Picked Up (${pickedUp.length} month${pickedUp.length > 1 ? 's' : ''})</span>
          <svg id="historyAccordionArrow" class="accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="pickup-history-content" id="pickupHistoryContent" style="display:none;">
          ${pickedUp.map(h => `
            <div class="history-item">
              <div class="history-item-top">
                <span class="history-item-month">${formatMonthName(h.month)}</span>
                <span class="history-item-date">${fmtTs(h.pickedUpAt)} by ${esc(h.pickedUpBy || 'staff')}</span>
              </div>
              <div class="history-item-wines">
                ${(h.wines || []).map(w => `<div class="history-item-wine">• ${esc(w)}</div>`).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    ` : '';

    modalBody.innerHTML = `
      <div class="confirm-member">
        <div class="confirm-name">${esc(m.name)}</div>
        <div class="confirm-tier">${esc(m.tier)} &bull; ${esc(m.phone || 'No phone')}</div>
      </div>

      <div class="pickup-section-label">
        <span>Select Months for Pickup (${pending.length} month${pending.length > 1 ? 's' : ''} waiting)</span>
      </div>

      <div class="pickup-months-list">
        ${pendingHtml}
      </div>

      <!-- Live summary bar -->
      <div class="pickup-summary-bar" id="pickupSummaryBar">
        <div class="pickup-summary-info">
          <div class="pickup-summary-releasing">Releasing: <strong id="pickupSummaryCount">${totalBottles} bottle${totalBottles === 1 ? '' : 's'}</strong></div>
          <div class="pickup-summary-sub" id="pickupSummarySub">(${pending.length} of ${pending.length} months selected)</div>
        </div>
        <button type="button" class="btn-toggle-all" id="btnToggleAllMonths" onclick="toggleSelectAllPickupMonths()">Deselect all</button>
      </div>

      <div class="pickup-server-row">
        <label class="field-label" for="confirmPickupStaffSelect">Server Name:</label>
        <select id="confirmPickupStaffSelect" class="confirm-staff-select">
          ${serverOptions}
        </select>
      </div>

      ${pickedUpAccordionHtml}
    `;

    if (modalFoot) {
      modalFoot.innerHTML = `
        <button class="btn-ghost" onclick="closePickupModal()">Cancel</button>
        <button class="btn-wine" id="confirmPickupBtn" onclick="executePickup()">Confirm hand-off (${totalBottles} bottle${totalBottles === 1 ? '' : 's'})</button>
      `;
    }
  }

  document.getElementById("pickupModal").style.display = "flex";
}

function handlePickupCardClick(monthKey, event) {
  if (event.target.tagName === 'INPUT' || (event.target.closest && event.target.closest('label'))) return;
  const chk = document.getElementById(`pickupChk_${monthKey}`);
  if (chk) {
    chk.checked = !chk.checked;
    togglePickupMonth(monthKey, chk.checked);
  }
}

function togglePickupMonth(monthKey, isChecked) {
  if (isChecked) {
    state.selectedPickupMonths.add(monthKey);
  } else {
    state.selectedPickupMonths.delete(monthKey);
  }

  const card = document.getElementById(`pickupCard_${monthKey}`);
  if (card) {
    card.classList.toggle("is-selected", isChecked);
  }

  updatePickupSummary();
}

function toggleSelectAllPickupMonths() {
  const m = state.selectedMember;
  if (!m) return;
  const pending = (m.pickupHistory || []).filter(h => h.status === "PENDING");
  
  const allSelected = pending.every(h => state.selectedPickupMonths.has(h.month));

  pending.forEach(h => {
    if (allSelected) {
      state.selectedPickupMonths.delete(h.month);
    } else {
      state.selectedPickupMonths.add(h.month);
    }
    const chk = document.getElementById(`pickupChk_${h.month}`);
    if (chk) chk.checked = !allSelected;
    const card = document.getElementById(`pickupCard_${h.month}`);
    if (card) card.classList.toggle("is-selected", !allSelected);
  });

  updatePickupSummary();
}

function updatePickupSummary() {
  const m = state.selectedMember;
  if (!m) return;

  const pending = (m.pickupHistory || []).filter(h => h.status === "PENDING");
  const selectedMonths = Array.from(state.selectedPickupMonths);
  const selectedItems = pending.filter(h => selectedMonths.includes(h.month));
  const bottlesCount = selectedItems.reduce((sum, h) => sum + (h.wines ? h.wines.length : 2), 0);
  const monthsCount = selectedItems.length;

  const countEl = document.getElementById("pickupSummaryCount");
  const subEl = document.getElementById("pickupSummarySub");
  const toggleBtn = document.getElementById("btnToggleAllMonths");
  const confirmBtn = document.getElementById("confirmPickupBtn");

  if (countEl) countEl.textContent = `${bottlesCount} bottle${bottlesCount === 1 ? '' : 's'}`;
  if (subEl) subEl.textContent = `(${monthsCount} of ${pending.length} months selected)`;
  if (toggleBtn) toggleBtn.textContent = monthsCount === pending.length ? "Deselect all" : "Select all";

  if (confirmBtn) {
    if (bottlesCount === 0) {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Select at least 1 month";
      confirmBtn.classList.add("btn-disabled");
    } else {
      confirmBtn.disabled = false;
      confirmBtn.textContent = `Confirm hand-off (${bottlesCount} bottle${bottlesCount === 1 ? '' : 's'})`;
      confirmBtn.classList.remove("btn-disabled");
    }
  }
}

function togglePickupHistory() {
  const content = document.getElementById("pickupHistoryContent");
  const arrow = document.getElementById("historyAccordionArrow");
  if (!content) return;
  const isHidden = content.style.display === "none";
  content.style.display = isHidden ? "block" : "none";
  if (arrow) {
    arrow.classList.toggle("is-open", isHidden);
  }
}

function closePickupModal() {
  const modal = document.getElementById("pickupModal");
  if (modal) modal.style.display = "none";
  state.selectedMember = null;
  state.selectedPickupMonths.clear();
}

async function executePickup() {
  const m = state.selectedMember;
  if (!m || state.selectedPickupMonths.size === 0) return;

  const staffSelect = document.getElementById("confirmPickupStaffSelect");
  const serverName = staffSelect ? staffSelect.value : (state.staffList[0] || "Haines S.");
  const ts = new Date().toISOString().replace("T", " ").substring(0, 19);

  const btn = document.getElementById("confirmPickupBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Updating...";
  }

  const selectedMonths = Array.from(state.selectedPickupMonths);
  let releasedBottlesCount = 0;

  m.pickupHistory.forEach(h => {
    if (selectedMonths.includes(h.month)) {
      h.status = "PICKED_UP";
      h.pickedUpAt = ts;
      h.pickedUpBy = serverName;
      releasedBottlesCount += (h.wines ? h.wines.length : 2);
    }
  });

  const stillPending = m.pickupHistory.some(h => h.status === "PENDING");
  m.pickupStatus = stillPending ? "READY" : "PICKED_UP";
  m.pickedUpAt = ts;
  m.pickedUpBy = serverName;

  if (state.scriptUrl) {
    try {
      await fetch(state.scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "bulk_pickup",
          memberId: m.id,
          months: selectedMonths,
          staff: serverName,
          bottlesCount: releasedBottlesCount,
          notes: "iPad Bottle Pickup"
        })
      });
    } catch (err) {
      console.warn("Server sync error (saved locally):", err);
    }
  }

  saveLocalMembers();
  closePickupModal();
  renderMembers();

  showToastNotification(
    `${m.name} — Bottles Picked Up`,
    `${releasedBottlesCount} bottle${releasedBottlesCount === 1 ? '' : 's'} (${selectedMonths.length} month${selectedMonths.length === 1 ? '' : 's'}) handed off by ${serverName}`
  );

  if (btn) {
    btn.disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Bar Credit Redemption Flow
// ---------------------------------------------------------------------------
function promptRedeem(id) {
  const m = state.members.find(x => x.id === id);
  if (!m || m.status === "REDEEMED") return;

  state.selectedMember = m;
  const isGrandCru = (m.tier || "").toLowerCase().includes("grand");
  const amt = `$${Number(m.creditAmount || (isGrandCru ? 40 : 15)).toFixed(0)}`;

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

    <p class="confirm-note">This locks the member's monthly bar tab credit across all stores until next month.</p>
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

  if (state.scriptUrl) {
    try {
      const res = await fetch(state.scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "redeem", memberId: m.id, staff: serverName, notes: "iPad Verifier" })
      });
      const data = await res.json();
      if (!data.success && data.alreadyRedeemed) {
        alert(`Already redeemed!\n${data.error}`);
        closeConfirmModal();
        fetchFromGoogleSheets();
        return;
      }
    } catch (err) {
      console.warn("Server sync error (saved locally):", err);
    }
  }

  m.status = "REDEEMED";
  m.redeemedAt = ts;
  m.redeemedBy = serverName;

  saveLocalMembers();
  closeConfirmModal();
  renderMembers();

  showToastPosAlert(m);

  if (btn) {
    btn.disabled = false;
    btn.textContent = "Redeem credit";
  }
}

// ---------------------------------------------------------------------------
// Toast Alerts
// ---------------------------------------------------------------------------
function showToastPosAlert(m) {
  const isGrandCru = (m.tier || "").toLowerCase().includes("grand");
  const discount = isGrandCru ? "Wine Club: Grand Cru ($40)" : "Wine Club: Value ($15)";
  showToastNotification(`${m.name} — ${m.tier}`, `Apply "${discount}" discount in Toast POS`);
}

function showToastNotification(title, message) {
  const el = document.getElementById("toastPromptAlert");
  if (!el) return;

  document.getElementById("toastAlertTitle").textContent = title;
  document.getElementById("toastAlertMessage").textContent = message;

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
    localStorage.setItem("vwm_search_script_url", state.scriptUrl);
  }

  if (ci) {
    const raw = ci.value.trim();
    if (raw) {
      const names = raw.split(",").map(s => s.trim()).filter(Boolean);
      if (names.length) {
        state.staffList = names;
        localStorage.setItem("vwm_search_staff_list", JSON.stringify(state.staffList));
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
  state.members = JSON.parse(JSON.stringify(INITIAL_DEMO_MEMBERS)).map(m => normalizeMember(m));
  saveLocalMembers();
  renderMembers();
  closeSettingsModal();
  showToastNotification("Demo Data Restored", "Initial members and pickup histories reloaded");
}

function resetMonthDemo() {
  if (!confirm("Reset all members back to AVAILABLE credit and PENDING bottle pickups for testing?")) return;
  state.members.forEach(m => {
    m.status = "AVAILABLE";
    m.redeemedAt = "";
    m.redeemedBy = "";
    m.pickupStatus = "READY";
    m.pickedUpAt = "";
    m.pickedUpBy = "";
    if (m.pickupHistory && Array.isArray(m.pickupHistory)) {
      m.pickupHistory.forEach(h => {
        h.status = "PENDING";
        h.pickedUpAt = "";
        h.pickedUpBy = "";
      });
    }
  });
  saveLocalMembers();
  renderMembers();
  closeSettingsModal();
  showToastNotification("All Benefits Available", "All members reset to AVAILABLE credit and PENDING pickups");
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

function formatMonthName(monthStr) {
  if (!monthStr) return "";
  const parts = monthStr.split("-");
  if (parts.length < 2) return monthStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatMonthShort(monthStr) {
  if (!monthStr) return "";
  const parts = monthStr.split("-");
  if (parts.length < 2) return monthStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short" });
}
