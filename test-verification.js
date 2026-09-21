/**
 * Test suite verifying all 10 requirements and edge cases for membersearch
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

(async function runTests() {
  console.log("--- Starting Member Search Improvement Verification ---");

  // Read files
  const htmlContent = fs.readFileSync(path.join(__dirname, "membersearch", "index.html"), "utf8");
  const cssContent = fs.readFileSync(path.join(__dirname, "membersearch", "styles.css"), "utf8");
  const jsContent = fs.readFileSync(path.join(__dirname, "membersearch", "wine-club.js"), "utf8");

  // Mock browser environment for wine-club.js testing
  const storage = {};
  global.localStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { for (let k in storage) delete storage[k]; }
  };

  const domElements = {};
  function createMockElement(id, tag = "div") {
    return {
      id,
      tagName: tag.toUpperCase(),
      value: "",
      textContent: "",
      innerHTML: "",
      style: {},
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        toggle(c, force) {
          if (force === undefined) {
            if (this._classes.has(c)) this._classes.delete(c);
            else this._classes.add(c);
          } else if (force) {
            this._classes.add(c);
          } else {
            this._classes.delete(c);
          }
        },
        contains(c) { return this._classes.has(c); }
      },
      querySelectorAll() { return []; },
      querySelector() { return null; },
      focus() { this._focused = true; }
    };
  }

  global.document = {
    getElementById: (id) => {
      if (!domElements[id]) domElements[id] = createMockElement(id);
      return domElements[id];
    },
    querySelectorAll: (selector) => [],
    querySelector: (selector) => null,
    addEventListener: () => {}
  };

  global.window = {
    location: { search: "" }
  };

  // Mock fetch for Google Sheets sync
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ success: true, members: [] })
  });

  const vm = require("vm");
  // Evaluate wine-club.js in global context
  vm.runInThisContext(jsContent);

  // Test 1: Search UX (Backspace Ejection Fix & Focus Retention)
  console.log("Checking Requirement 1: Backspace ejection fix...");
  state.viewMode = "results";
  state.searchQuery = "smith";
  handleResultsSearch("");
  assert.strictEqual(state.viewMode, "results", "Empty results search must NOT change viewMode back to landing");
  assert.strictEqual(state.searchQuery, "", "Empty results search must clear searchQuery");
  assert.ok(domElements["memberSearchInput2"]._focused, "Empty results search must keep input focused");

  clearResultsSearch();
  assert.strictEqual(state.viewMode, "results", "clearResultsSearch must NOT change viewMode back to landing");
  assert.strictEqual(state.searchQuery, "", "clearResultsSearch must clear searchQuery");
  assert.ok(domElements["memberSearchInput2"]._focused, "clearResultsSearch must keep input focused");

  handleResultsKeydown({ key: "Escape" });
  assert.strictEqual(state.viewMode, "results", "Escape keydown must keep viewMode on results");
  assert.strictEqual(state.searchQuery, "", "Escape keydown must clear search query");

  console.log("✓ Requirement 1 PASSED: Backspace ejection fixed, stays on results view with focus maintained");

  // Test 2: Server Attribution & Active Shift Switcher + Staff Chips
  console.log("Checking Requirement 2: Server attribution & active shift switcher...");
  localStorage.clear();
  const defaultServer = getInitialActiveServer();
  assert.strictEqual(defaultServer, "Haines S.", "Default active server should be Haines S.");
  assert.strictEqual(localStorage.getItem("vwm_active_server"), "Haines S.");

  setActiveServer("Nancy J.");
  assert.strictEqual(state.activeServer, "Nancy J.");
  assert.strictEqual(localStorage.getItem("vwm_active_server"), "Nancy J.");

  const chipsHtml = renderStaffChips("testChips", "Nancy J.");
  assert.ok(chipsHtml.includes("Haines S."), "Chips must include Haines S.");
  assert.ok(chipsHtml.includes("Harry F."), "Chips must include Harry F.");
  assert.ok(chipsHtml.includes("John M."), "Chips must include John M.");
  assert.ok(chipsHtml.includes("Nancy J."), "Chips must include Nancy J.");
  assert.ok(chipsHtml.includes("Julie S."), "Chips must include Julie S.");
  assert.ok(chipsHtml.includes("Matt G."), "Chips must include Matt G.");
  assert.ok(chipsHtml.includes('data-staff="Nancy J."') && chipsHtml.includes('staff-chip selected'), "Active server chip must be selected");
  assert.ok(chipsHtml.includes("this.getAttribute('data-staff')"), "Chips must use safe attribute extraction to prevent quote escaping bugs");

  selectStaffChip("testChips", "Julie S.");
  assert.strictEqual(state.selectedStaff, "Julie S.", "selectStaffChip must update selectedStaff");
  assert.strictEqual(state.activeServer, "Julie S.", "selectStaffChip must update activeServer");
  assert.strictEqual(localStorage.getItem("vwm_active_server"), "Julie S.", "selectStaffChip must persist to localStorage");

  assert.ok(htmlContent.includes('id="topbarActiveServer"'), "index.html must have topbar active server select");
  console.log("✓ Requirement 2 PASSED: Server attribution & active shift switcher + 1-tap chips working");

  // Test 3: Credit Verification / Prevent Blind Redemptions
  console.log("Checking Requirement 3: Credit verification in modal...");
  const member1 = INITIAL_DEMO_MEMBERS.find(m => m.id === "MBR-1001");
  const member2 = INITIAL_DEMO_MEMBERS.find(m => m.id === "MBR-1088");
  state.members = [normalizeMember(member1), normalizeMember(member2)];

  promptRedeem("MBR-1001");
  const modalBody1 = domElements["confirmModalBody"].innerHTML;
  assert.ok(modalBody1.includes("MBR-1001"), "Redeem modal must display member ID");
  assert.ok(modalBody1.includes("555-0101"), "Redeem modal must display phone");
  assert.ok(modalBody1.includes("john.smith@example.com"), "Redeem modal must display email");

  promptRedeem("MBR-1088");
  const modalBody2 = domElements["confirmModalBody"].innerHTML;
  assert.ok(modalBody2.includes("MBR-1088"), "Redeem modal must display duplicate member's distinct ID");
  assert.ok(modalBody2.includes("555-0988"), "Redeem modal must display duplicate member's phone");
  assert.ok(modalBody2.includes("jsmith.vintage@gmail.com"), "Redeem modal must display duplicate member's email");
  console.log("✓ Requirement 3 PASSED: Member ID, phone, and email clearly verified in modal");

  // Test 4: Toast POS Instructions in Modal
  console.log("Checking Requirement 4: Toast POS instructions in modal...");
  promptRedeem("MBR-1001"); // Grand Cru ($40)
  assert.ok(domElements["confirmModalBody"].innerHTML.includes('Wine Club: Grand Cru ($40)'), "Grand Cru modal must guide to Toast POS Grand Cru ($40)");
  assert.ok(domElements["confirmModalBody"].innerHTML.includes('toast-pos-guidance'), "Modal must include high-contrast guidance box");

  promptRedeem("MBR-1088"); // Value ($15)
  assert.ok(domElements["confirmModalBody"].innerHTML.includes('Wine Club: Value ($15)'), "Value modal must guide to Toast POS Value ($15)");
  console.log("✓ Requirement 4 PASSED: Toast POS instructions displayed with exact button names");

  // Test 5: Apple HIG Touch Target Ergonomics
  console.log("Checking Requirement 5: Apple HIG touch targets in styles.css...");
  assert.ok(cssContent.includes(".topbar-icon-btn") && cssContent.includes("min-width: 48px") && cssContent.includes("min-height: 48px"), "topbar-icon-btn must be at least 48x48px");
  assert.ok(cssContent.includes(".modal-x") && cssContent.includes("min-width: 48px") && cssContent.includes("min-height: 48px"), "modal-x must be at least 48x48px");
  assert.ok(cssContent.includes(".action-btn") && cssContent.includes("height: 48px") && cssContent.includes("min-height: 48px"), "action-btn must be height 48px");
  assert.ok(cssContent.includes(".pill") && cssContent.includes("min-height: 44px"), "pill must have min-height 44px");
  assert.ok(cssContent.includes(".topbar-server-select") && cssContent.includes("min-height: 44px"), "topbar-server-select must have min-height 44px");
  assert.ok(cssContent.includes(".search-clear-btn") && cssContent.includes("min-width: 44px") && cssContent.includes("min-height: 44px"), "search-clear-btn must be at least 44x44px");
  assert.ok(cssContent.includes(".chatgpt-pill-btn") && cssContent.includes("min-height: 44px"), "chatgpt-pill-btn must have min-height 44px");
  assert.ok(cssContent.includes(".btn-toggle-all") && cssContent.includes("min-height: 44px"), "btn-toggle-all must have min-height 44px");
  assert.ok(cssContent.includes(".snackbar-close") && cssContent.includes("min-width: 44px") && cssContent.includes("min-height: 44px"), "snackbar-close must be at least 44x44px");
  console.log("✓ Requirement 5 PASSED: All touch targets meet Apple HIG 48px/44px minimums");

  // Test 6: Search Tokenization & Member ID Indexing
  console.log("Checking Requirement 6: Search tokenization & Member ID indexing...");
  const testMember = {
    id: "MBR-1001",
    name: "John Smith",
    phone: "555-0101",
    email: "john.smith@example.com",
    tier: "Grand Cru Club"
  };

  const sarahMember = {
    id: "MBR-1002",
    name: "Sarah Johnson",
    phone: "555-0102",
    email: "sarah.j@example.com",
    tier: "Value Club"
  };

  assert.ok(matchMember(testMember, "smith john"), "'smith john' multi-word query must match 'John Smith'");
  assert.ok(matchMember(testMember, "john"), "'john' must match 'John Smith'");
  assert.ok(matchMember(testMember, "1001"), "'1001' must match 'MBR-1001'");
  assert.ok(matchMember(testMember, "MBR-1001"), "'MBR-1001' must match 'MBR-1001'");
  assert.ok(matchMember(testMember, "mbr 1001"), "'mbr 1001' must match 'MBR-1001'");
  assert.ok(matchMember(testMember, "5550101"), "Raw phone digits '5550101' must match '555-0101'");
  assert.ok(matchMember(testMember, "john grand"), "'john grand' must match John Smith Grand Cru");
  assert.ok(!matchMember(testMember, "smith 1088"), "'smith 1088' must NOT match MBR-1001");

  // Critical Regression Test for Prior Attempt Bug:
  // "smith 1002" contains the ID of Sarah Johnson ("1002"), but Sarah's name is NOT smith.
  assert.ok(!matchMember(sarahMember, "smith 1002"), "Sarah Johnson must NOT match 'smith 1002'");
  assert.ok(!matchMember(testMember, "smith 1002"), "John Smith (1001) must NOT match 'smith 1002'");
  assert.ok(matchMember(sarahMember, "sarah 1002"), "Sarah Johnson must match 'sarah 1002'");
  console.log("✓ Requirement 6 PASSED: Search tokenization & member ID indexing verified without cross-member digit leaks");

  // Test 7: Reverted Tablet Breakpoint (Spacious 2-column on desktop, 1-column below 820px)
  console.log("Checking Requirement 7: Spacious layout breakpoint in styles.css...");
  assert.ok(cssContent.includes("@media(max-width: 820px)"), "Breakpoint must be max-width: 820px to prevent squished cards");
  assert.ok(cssContent.includes("minmax(420px, 1fr)"), "Card grid minmax must be 420px for spacious layout");
  console.log("✓ Requirement 7 PASSED: 820px breakpoint & 420px minmax set for spacious unsquished cards");

  // Test 8: Action Button Vector Iconography
  console.log("Checking Requirement 8: Action button vector SVG icons in cardHtml...");
  const cardOutput = cardHtml(normalizeMember(member1));
  assert.ok(cardOutput.includes("<svg") && cardOutput.includes("action-btn-svg"), "Card actions must have action-btn-svg vector icons");
  assert.ok(cardOutput.includes("M9 2h6v3a4 4 0 0 1 1 2.5V20"), "Bottle pickup button must include wine bottle SVG path");
  assert.ok(cardOutput.includes('rect width="20" height="14"'), "Credit button must include credit card SVG");
  console.log("✓ Requirement 8 PASSED: Crisp vector SVG icons rendered in action buttons");

  // Test 9: Safari WebKit Timestamp Sanitization
  console.log("Checking Requirement 9: Safari WebKit timestamp sanitization...");
  const testTs = "2026-09-08 14:15:00";
  const formatted = fmtTs(testTs);
  assert.ok(!formatted.includes("Invalid Date"), `Formatted date must NOT be 'Invalid Date': got '${formatted}'`);
  assert.ok(formatted.includes("Sep 8"), `Formatted date should include 'Sep 8': got '${formatted}'`);

  const dateObjFormatted = fmtTs(new Date());
  assert.ok(!dateObjFormatted.includes("Invalid Date"), "Date instance must format safely");

  const numTsFormatted = fmtTs(Date.now());
  assert.ok(!numTsFormatted.includes("Invalid Date"), "Numeric millisecond timestamp must format safely");

  const localTs = getLocalTimestamp();
  assert.ok(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(localTs), `getLocalTimestamp should produce 'YYYY-MM-DD HH:mm:ss', got '${localTs}'`);
  console.log("✓ Requirement 9 PASSED: fmtTs handles strings, Date objects, and ms numbers safely without 'Invalid Date'");

  // Test 10: Data Sync Overwrite Protection (Deep Verification with real fetchFromGoogleSheets)
  console.log("Checking Requirement 10: Deep Data sync overwrite protection via fetchFromGoogleSheets...");
  state.scriptUrl = "https://script.google.com/test";
  state.members = [
    {
      id: "MBR-1001",
      name: "John Smith",
      tier: "Grand Cru Club",
      creditAmount: 40,
      status: "REDEEMED",
      redeemedAt: "2026-09-20 18:30:00",
      redeemedBy: "Nancy J.",
      pickupHistory: [
        { month: "2026-09", status: "PICKED_UP", pickedUpAt: "2026-09-20 18:30:00", pickedUpBy: "Nancy J." }
      ]
    },
    {
      id: "MBR-LOCAL-ONLY",
      name: "Local Offline VIP",
      tier: "Value Club",
      status: "AVAILABLE"
    }
  ];
  state.selectedMember = state.members[0];

  // Incoming sheet data lacks the local-only member and has stale AVAILABLE status for MBR-1001
  const mockSheetData = {
    success: true,
    members: [{
      id: "MBR-1001",
      name: "John Smith",
      tier: "Grand Cru Club",
      creditAmount: 40,
      status: "AVAILABLE",
      redeemedAt: "",
      redeemedBy: "",
      pickupHistory: [
        { month: "2026-09", status: "PENDING", pickedUpAt: "", pickedUpBy: "" }
      ]
    }]
  };

  global.fetch = async () => ({
    ok: true,
    json: async () => mockSheetData
  });

  // Call the REAL fetchFromGoogleSheets implementation
  await fetchFromGoogleSheets();

  assert.strictEqual(state.members[0].status, "REDEEMED", "Real fetchFromGoogleSheets: Local redemption must NOT be overwritten by incoming AVAILABLE");
  assert.strictEqual(state.members[0].redeemedBy, "Nancy J.", "Real fetchFromGoogleSheets: Local server attribution must be preserved");
  assert.strictEqual(state.members[0].pickupHistory[0].status, "PICKED_UP", "Real fetchFromGoogleSheets: Local bottle pickup must NOT be reverted to PENDING");
  assert.ok(state.members.some(m => m.id === "MBR-LOCAL-ONLY"), "Real fetchFromGoogleSheets: Local members not in sheet must NOT be dropped");
  assert.strictEqual(state.selectedMember.status, "REDEEMED", "Real fetchFromGoogleSheets: selectedMember reference must remain synced");
  console.log("✓ Requirement 10 PASSED: Deep data sync overwrite protection verified via actual fetchFromGoogleSheets call");

  // Edge Cases Explicit Verification
  console.log("\nChecking Edge Cases Explicitly...");
  // Edge Case 1: Member with missing/null phone and email
  const sparseMember = { id: "MBR-9999", name: "Anonymous VIP", tier: "Value Club" };
  assert.ok(matchMember(sparseMember, "anonymous"), "Should match name even with no phone/email");
  assert.ok(matchMember(sparseMember, "9999"), "Should match ID digits");
  assert.ok(matchMember(sparseMember, "value"), "Should match tier");
  assert.ok(!matchMember(sparseMember, "555"), "Should not match missing phone");

  // Edge Case 2: Whitespace only query
  assert.ok(matchMember(sparseMember, "   "), "Whitespace only query should match all members");

  // Edge Case 3: Case insensitivity & special characters
  assert.ok(matchMember(testMember, "JOHN SMITH"), "Uppercase query should match");
  assert.ok(matchMember(testMember, "  smith   john  "), "Irregular whitespace query should match");
  assert.ok(matchMember(testMember, "(555) 0101"), "Formatted phone query should match");

  // Edge Case 4: Safari date edge cases
  assert.strictEqual(fmtTs(""), "earlier this month", "Empty timestamp fallback");
  assert.strictEqual(fmtTs(null), "earlier this month", "Null timestamp fallback");
  assert.strictEqual(fmtTs("invalid-ts-format-xyz"), "invalid-ts-format-xyz", "Unparseable timestamp returns original string, not Invalid Date");

  console.log("✓ All Edge Cases PASSED");

  console.log("\n==============================================");
  console.log("ALL 10 REQUIREMENTS + EDGE CASES PASSED!");
  console.log("==============================================\n");
})();
