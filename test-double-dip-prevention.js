/**
 * Automated Test Suite for Double-Dip Prevention & Multi-Store Synchronization
 * Tests Google Apps Script LockService, live freshness checks in promptRedeem,
 * blocking offline redemptions, and 15s polling intervals in both V1 and V2.
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

console.log("========================================================");
console.log("--- Starting Double-Dip Prevention Verification Suite ---");
console.log("========================================================\n");

// -----------------------------------------------------------------------------
// Test Group 1: Google Apps Script Backend (Code.gs) LockService
// -----------------------------------------------------------------------------
console.log("Checking Requirement 1: Google Apps Script LockService in Code.gs...");
const codeGs = fs.readFileSync(path.join(__dirname, "google-sheets", "Code.gs"), "utf8");

// Validate JavaScript syntax of Code.gs
new vm.Script(codeGs);

assert.ok(codeGs.includes("LockService.getScriptLock()"), "Code.gs must call LockService.getScriptLock()");
assert.ok(codeGs.includes("lock.tryLock(30000)"), "Code.gs must use lock.tryLock with 30000ms timeout");
assert.ok(codeGs.includes("SpreadsheetApp.flush()"), "Code.gs must flush spreadsheet writes before releasing lock");
assert.ok(codeGs.includes("lock.releaseLock()"), "Code.gs must release lock in finally block");

// Check handleRedemption lock coverage
const handleRedemptionCode = codeGs.substring(
  codeGs.indexOf("function handleRedemption"),
  codeGs.indexOf("function monthlyReset")
);
assert.ok(handleRedemptionCode.includes("const lock = LockService.getScriptLock()"), "handleRedemption must acquire script lock");
assert.ok(handleRedemptionCode.includes("tryLock(30000)"), "handleRedemption must use 30s lock timeout");
assert.ok(handleRedemptionCode.includes("finally"), "handleRedemption must have finally block");
assert.ok(handleRedemptionCode.includes("lock.releaseLock()"), "handleRedemption must release lock in finally block");
assert.ok(handleRedemptionCode.includes("SpreadsheetApp.flush()"), "handleRedemption must flush before response/release");
assert.ok(handleRedemptionCode.indexOf("lock.tryLock") < handleRedemptionCode.indexOf("sheet.getDataRange().getValues()"), 
  "handleRedemption must read sheet data AFTER acquiring the lock to avoid stale reads");

// Check handlePickup lock coverage
const handlePickupCode = codeGs.substring(
  codeGs.indexOf("function handlePickup"),
  codeGs.indexOf("function handleRedemption")
);
assert.ok(handlePickupCode.includes("LockService.getScriptLock()"), "handlePickup must acquire script lock");
assert.ok(handlePickupCode.includes("lock.releaseLock()"), "handlePickup must release lock");

// Check monthlyReset lock coverage
const monthlyResetCode = codeGs.substring(
  codeGs.indexOf("function monthlyReset"),
  codeGs.indexOf("function handleManualMonthlyReset")
);
assert.ok(monthlyResetCode.includes("LockService.getScriptLock()"), "monthlyReset must acquire script lock");
assert.ok(monthlyResetCode.includes("lock.releaseLock()"), "monthlyReset must release lock");
assert.ok(monthlyResetCode.includes("setValues"), "monthlyReset must use batched setValues for fast execution under lock");

// Check setupSheets lock coverage
const setupSheetsCode = codeGs.substring(
  codeGs.indexOf("function setupSheets"),
  codeGs.indexOf("function createJsonResponse")
);
assert.ok(setupSheetsCode.includes("LockService.getScriptLock()"), "setupSheets must acquire script lock");
assert.ok(setupSheetsCode.includes("lock.releaseLock()"), "setupSheets must release lock");

// Check handleRedemption alreadyRedeemed contract and batched writes
assert.ok(handleRedemptionCode.includes("alreadyRedeemed: true"), "handleRedemption must flag alreadyRedeemed");
assert.ok(handleRedemptionCode.includes("member: {"), "handleRedemption must return member object on alreadyRedeemed");
assert.ok(handleRedemptionCode.includes("setValues"), "handleRedemption must use batched setValues across columns G-J");

console.log("✓ Requirement 1 PASSED: Code.gs atomic read-check-write wrapped in LockService with try...finally, flush, and batched writes.\n");


// -----------------------------------------------------------------------------
// Test Group 2: Polling Intervals (Requirement 4)
// -----------------------------------------------------------------------------
console.log("Checking Requirement 4: Faster polling interval (15000ms)...");

const v1Code = fs.readFileSync(path.join(__dirname, "wine-club.js"), "utf8");
const v1PublicCode = fs.readFileSync(path.join(__dirname, "public", "wine-club.js"), "utf8");
const v2Code = fs.readFileSync(path.join(__dirname, "membersearch", "wine-club.js"), "utf8");
const v2PublicCode = fs.readFileSync(path.join(__dirname, "public", "membersearch", "wine-club.js"), "utf8");

assert.ok(v1Code.includes("15000"), "wine-club.js must have 15000ms polling interval");
assert.ok(!v1Code.includes("45000"), "wine-club.js must not retain old 45000ms interval");
assert.strictEqual(v1Code, v1PublicCode, "public/wine-club.js must be identical to wine-club.js");

assert.ok(v2Code.includes("15000"), "membersearch/wine-club.js must have 15000ms polling interval");
assert.ok(!v2Code.includes("45000"), "membersearch/wine-club.js must not retain old 45000ms interval");
assert.strictEqual(v2Code, v2PublicCode, "public/membersearch/wine-club.js must be identical to membersearch/wine-club.js");

console.log("✓ Requirement 4 PASSED: 15-second polling interval verified across V1 and V2 root & public mirrors.\n");


// -----------------------------------------------------------------------------
// Helper to create sandbox environment for testing wine-club.js files
// -----------------------------------------------------------------------------
function createTestContext(fileCode) {
  const storage = {};
  const alerts = [];
  const domElements = {};

  function createMockEl(id, tag = "div") {
    return {
      id,
      tagName: tag.toUpperCase(),
      value: "",
      textContent: "",
      innerHTML: "",
      style: {},
      classList: {
        _set: new Set(),
        add(c) { this._set.add(c); },
        remove(c) { this._set.delete(c); },
        toggle(c, f) { if (f === undefined) f = !this._set.has(c); if (f) this._set.add(c); else this._set.delete(c); },
        contains(c) { return this._set.has(c); }
      },
      querySelectorAll() { return []; },
      querySelector() { return null; },
      focus() {}
    };
  }

  let customQuerySelector = null;

  const contextObj = {
    console: {
      log: () => {},
      warn: () => {},
      error: () => {}
    },
    localStorage: {
      getItem: (k) => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: (k) => { delete storage[k]; },
      clear: () => { for (let k in storage) delete storage[k]; }
    },
    document: {
      getElementById: (id) => {
        if (!domElements[id]) domElements[id] = createMockEl(id);
        return domElements[id];
      },
      querySelectorAll: () => [],
      querySelector: (sel) => {
        if (customQuerySelector) return customQuerySelector(sel);
        return null;
      },
      addEventListener: () => {}
    },
    window: {
      location: { search: "" }
    },
    alert: (msg) => { alerts.push(msg); },
    fetch: async () => ({ ok: true, json: async () => ({ success: true, members: [] }) }),
    setTimeout: (fn) => { fn(); return 1; },
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {}
  };

  // Convert top level `let state` to `var state` or export it to contextObj
  const adaptedCode = fileCode + "\nglobalThis.__getState = () => state;\nglobalThis.__setState = (s) => { state = s; };\nglobalThis.__promptRedeem = (id) => promptRedeem(id);\nglobalThis.__executeRedemption = () => executeRedemption();\nglobalThis.__fetchFromGoogleSheets = (bg) => fetchFromGoogleSheets(bg);";

  const context = vm.createContext(contextObj);
  vm.runInContext(adaptedCode, context);

  return {
    getState: () => contextObj.__getState(),
    setState: (s) => contextObj.__setState(s),
    promptRedeem: (id) => contextObj.__promptRedeem(id),
    executeRedemption: () => contextObj.__executeRedemption(),
    fetchFromGoogleSheets: (bg) => contextObj.__fetchFromGoogleSheets(bg),
    setFetch: (fn) => { contextObj.fetch = fn; },
    setQuerySelector: (fn) => { customQuerySelector = fn; },
    storage,
    alerts,
    domElements
  };
}


// -----------------------------------------------------------------------------
// Test Group 3: Live Freshness Check Before Modal (Requirement 2) - V2 (membersearch)
// -----------------------------------------------------------------------------
(async function runAllTests() {
  console.log("Checking Requirement 2: Freshness check before redemption modal (V2)...");

  const v2 = createTestContext(v2Code);
  const v2State = v2.getState();
  v2State.scriptUrl = "https://script.google.com/macros/s/test/exec";
  v2State.members = [
    {
      id: "MBR-1001",
      name: "John Smith",
      tier: "Grand Cru Club",
      creditAmount: 40,
      status: "AVAILABLE",
      redeemedAt: "",
      redeemedBy: "",
      pickupHistory: []
    }
  ];

  // Scenario A: Member is redeemed on Google Sheet by another store right before cashier clicks Redeem
  v2.setFetch(async () => ({
    ok: true,
    json: async () => ({
      success: true,
      members: [
        {
          id: "MBR-1001",
          name: "John Smith",
          tier: "Grand Cru Club",
          creditAmount: 40,
          status: "REDEEMED",
          redeemedAt: "2026-09-21 17:30:00",
          redeemedStore: "Store 2",
          redeemedBy: "Harry F.",
          pickupHistory: []
        }
      ]
    })
  }));

  // Call promptRedeem
  await v2.promptRedeem("MBR-1001");

  // Verify modal was NOT opened
  const modalEl = v2.domElements["confirmModal"];
  assert.ok(!modalEl || modalEl.style.display !== "flex", 
    "Modal must NOT be displayed if backend reports member already redeemed");
  
  // Verify local member was updated to REDEEMED
  const updatedMember = v2.getState().members.find(m => m.id === "MBR-1001");
  assert.strictEqual(updatedMember.status, "REDEEMED", "Local member status must be updated to REDEEMED");
  assert.strictEqual(updatedMember.redeemedBy, "Harry F.", "Local member redeemedBy must be updated from remote");
  
  // Verify staff was notified
  assert.ok(v2.alerts.some(a => a.includes("Already Redeemed")), "Staff must be alerted about remote redemption");

  console.log("✓ Requirement 2 (Scenario A) PASSED: Remote redemption detected during promptRedeem(), modal blocked, state synced.");

  // Scenario B: Member is still AVAILABLE on Google Sheet
  v2.alerts.length = 0;
  v2.getState().members = [
    {
      id: "MBR-1002",
      name: "Sarah Johnson",
      tier: "Value Club",
      creditAmount: 15,
      status: "AVAILABLE",
      redeemedAt: "",
      redeemedBy: "",
      pickupHistory: []
    }
  ];
  v2.setFetch(async () => ({
    ok: true,
    json: async () => ({
      success: true,
      members: [
        {
          id: "MBR-1002",
          name: "Sarah Johnson",
          tier: "Value Club",
          creditAmount: 15,
          status: "AVAILABLE",
          redeemedAt: "",
          redeemedBy: "",
          pickupHistory: []
        }
      ]
    })
  }));

  await v2.promptRedeem("MBR-1002");
  assert.strictEqual(v2.domElements["confirmModal"].style.display, "flex", 
    "Modal must be opened when member is verified AVAILABLE on backend");
  console.log("✓ Requirement 2 (Scenario B) PASSED: Verified AVAILABLE member successfully opens confirmation modal.\n");


  // -----------------------------------------------------------------------------
  // Test Group 4: Live Freshness Check Before Modal (Requirement 2) - V1 (wine-club.js)
  // -----------------------------------------------------------------------------
  console.log("Checking Requirement 2: Freshness check before redemption modal (V1)...");
  const v1 = createTestContext(v1Code);
  v1.getState().scriptUrl = "https://script.google.com/macros/s/test/exec";
  v1.getState().members = [
    {
      id: "MBR-1001",
      name: "John Smith",
      tier: "Grand Cru Club",
      creditAmount: 40,
      status: "AVAILABLE",
      redeemedAt: "",
      redeemedBy: ""
    }
  ];

  // Remote already redeemed
  v1.setFetch(async () => ({
    ok: true,
    json: async () => ({
      success: true,
      members: [
        {
          id: "MBR-1001",
          name: "John Smith",
          tier: "Grand Cru Club",
          creditAmount: 40,
          status: "REDEEMED",
          redeemedAt: "2026-09-21 17:30:00",
          redeemedStore: "Store 2",
          redeemedBy: "Harry F."
        }
      ]
    })
  }));

  await v1.promptRedeem("MBR-1001");
  const v1Modal = v1.domElements["confirmModal"];
  assert.ok(!v1Modal || v1Modal.style.display !== "flex", 
    "V1 modal must NOT open if backend reports member already redeemed");
  assert.strictEqual(v1.getState().members.find(m => m.id === "MBR-1001").status, "REDEEMED",
    "V1 member status must be updated to REDEEMED");
  assert.ok(v1.alerts.some(a => a.includes("Already Redeemed")), "V1 staff alerted on already redeemed");
  console.log("✓ Requirement 2 (V1) PASSED: V1 promptRedeem performs live check and prevents modal opening on already-redeemed member.\n");


  // -----------------------------------------------------------------------------
  // Test Group 5: Block Offline Redemption (Requirement 3) - V2 (membersearch)
  // -----------------------------------------------------------------------------
  console.log("Checking Requirement 3: Block offline redemption when Google Sheet sync is configured (V2)...");

  // Case 3A: Network fetch throws an error (e.g. Wi-Fi dropped / offline)
  const v2Offline = createTestContext(v2Code);
  v2Offline.getState().scriptUrl = "https://script.google.com/macros/s/test/exec";
  const offlineMember = {
    id: "MBR-1001",
    name: "John Smith",
    tier: "Grand Cru Club",
    creditAmount: 40,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupHistory: []
  };
  v2Offline.getState().members = [offlineMember];
  v2Offline.getState().selectedMember = offlineMember;

  // Mock network failure
  v2Offline.setFetch(async () => {
    throw new Error("Failed to fetch: Network unreachable (DNS failure / offline)");
  });

  await v2Offline.executeRedemption();

  // Check that member is NOT redeemed locally!
  assert.strictEqual(offlineMember.status, "AVAILABLE", 
    "executeRedemption must NOT fall back to local redemption when network fails with scriptUrl configured");
  assert.ok(v2Offline.alerts.some(a => a.includes("Redemption Blocked") || a.includes("Redemption Failed")), 
    "Staff must be alerted that redemption was blocked due to network error");

  console.log("✓ Requirement 3 (Case 3A) PASSED: Network failure blocks local redemption, member remains AVAILABLE.");

  // Case 3B: Server returns alreadyRedeemed race condition error from LockService
  const v2Race = createTestContext(v2Code);
  v2Race.getState().scriptUrl = "https://script.google.com/macros/s/test/exec";
  const raceMember = {
    id: "MBR-1001",
    name: "John Smith",
    tier: "Grand Cru Club",
    creditAmount: 40,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupHistory: []
  };
  v2Race.getState().members = [raceMember];
  v2Race.getState().selectedMember = raceMember;

  v2Race.setFetch(async () => ({
    ok: true,
    json: async () => ({
      success: false,
      alreadyRedeemed: true,
      error: "Already redeemed on Sep 21, 5:35 pm at Store 2 by Harry F.",
      member: {
        id: "MBR-1001",
        name: "John Smith",
        tier: "Grand Cru Club",
        credit: 40,
        status: "REDEEMED",
        redeemedAt: "2026-09-21 17:35:00",
        store: "Store 2",
        staff: "Harry F."
      }
    })
  }));

  await v2Race.executeRedemption();

  assert.strictEqual(raceMember.status, "REDEEMED", "Race condition response must lock member status to REDEEMED locally");
  assert.strictEqual(raceMember.redeemedBy, "Harry F.", "Staff attribution must be populated from backend alreadyRedeemed member payload");
  assert.strictEqual(raceMember.redeemedStore, "Store 2", "Store attribution must be populated from backend alreadyRedeemed member payload");
  assert.strictEqual(raceMember.redeemedAt, "2026-09-21 17:35:00", "Timestamp must be populated from backend alreadyRedeemed member payload");
  assert.ok(v2Race.alerts.some(a => a.includes("Already Redeemed")), "Staff alerted to concurrent redemption");

  console.log("✓ Requirement 3 (Case 3B) PASSED: Backend alreadyRedeemed response locks member locally and populates store/staff attribution.");

  // Case 3C: Pure standalone demo mode (!state.scriptUrl) allows local redemption
  const v2Demo = createTestContext(v2Code);
  v2Demo.getState().scriptUrl = ""; // No sheet configured
  const demoMember = {
    id: "MBR-DEMO",
    name: "Demo Member",
    tier: "Value Club",
    creditAmount: 15,
    status: "AVAILABLE",
    redeemedAt: "",
    redeemedBy: "",
    pickupHistory: []
  };
  v2Demo.getState().members = [demoMember];
  v2Demo.getState().selectedMember = demoMember;

  await v2Demo.executeRedemption();
  assert.strictEqual(demoMember.status, "REDEEMED", "Standalone demo mode without scriptUrl should proceed with local redemption");
  console.log("✓ Requirement 3 (Case 3C) PASSED: Standalone demo mode without scriptUrl functions as intended.\n");


  // -----------------------------------------------------------------------------
  // Test Group 6: Block Offline Redemption (Requirement 3) - V1 (wine-club.js)
  // -----------------------------------------------------------------------------
  console.log("Checking Requirement 3: Block offline redemption in V1 (wine-club.js)...");
  const v1Offline = createTestContext(v1Code);
  v1Offline.getState().scriptUrl = "https://script.google.com/macros/s/test/exec";
  const v1Member = {
    id: "MBR-1001",
    name: "John Smith",
    tier: "Grand Cru Club",
    creditAmount: 40,
    status: "AVAILABLE"
  };
  v1Offline.getState().members = [v1Member];
  v1Offline.getState().selectedMember = v1Member;

  v1Offline.setFetch(async () => {
    throw new Error("Network timeout");
  });

  await v1Offline.executeRedemption();
  assert.strictEqual(v1Member.status, "AVAILABLE", "V1 must NOT fall back to local redemption when offline");
  assert.ok(v1Offline.alerts.some(a => a.includes("Redemption Blocked")), "V1 staff alerted on offline block");
  console.log("✓ Requirement 3 (V1) PASSED: V1 offline redemption blocked properly.\n");


  // -----------------------------------------------------------------------------
  // Test Group 7: Edge Case - In-flight Sync Coalescing
  // -----------------------------------------------------------------------------
  console.log("Checking Edge Case: In-flight fetch coalescence...");
  const v2Coalesce = createTestContext(v2Code);
  v2Coalesce.getState().scriptUrl = "https://script.google.com/macros/s/test/exec";
  let fetchCount = 0;
  v2Coalesce.setFetch(async () => {
    fetchCount++;
    await new Promise(r => setTimeout(r, 10));
    return {
      ok: true,
      json: async () => ({
        success: true,
        members: [{ id: "MBR-1", name: "Coalesce Test", status: "AVAILABLE", tier: "Value Club" }]
      })
    };
  });

  // Trigger two concurrent fetchFromGoogleSheets calls
  const [res1, res2] = await Promise.all([
    v2Coalesce.fetchFromGoogleSheets(),
    v2Coalesce.fetchFromGoogleSheets()
  ]);

  assert.strictEqual(fetchCount, 1, "Concurrent sync calls must coalesce into a single fetch request");
  assert.strictEqual(res1.success, true, "First caller gets success");
  assert.strictEqual(res2.success, true, "Second caller gets success from coalesced promise");
  console.log("✓ Edge Case PASSED: In-flight sync coalescence prevents redundant network calls.\n");


  // -----------------------------------------------------------------------------
  // Test Group 8: Pre-flight status check in executeRedemption()
  // -----------------------------------------------------------------------------
  console.log("Checking Edge Case: Pre-flight check in executeRedemption() when member redeemed while modal open...");
  const v2Preflight = createTestContext(v2Code);
  v2Preflight.getState().scriptUrl = "https://script.google.com/macros/s/test/exec";
  const concurrentMember = {
    id: "MBR-CONCURRENT",
    name: "Concurrent Test",
    tier: "Grand Cru Club",
    status: "REDEEMED", // updated by background sync while modal was open
    redeemedAt: "2026-09-21 17:40:00",
    redeemedBy: "Jane D.",
    redeemedStore: "Store 2"
  };
  v2Preflight.getState().members = [concurrentMember];
  v2Preflight.getState().selectedMember = concurrentMember;
  let preflightFetchCalled = false;
  v2Preflight.setFetch(async () => {
    preflightFetchCalled = true;
    return { ok: true, json: async () => ({ success: true }) };
  });

  await v2Preflight.executeRedemption();
  assert.strictEqual(preflightFetchCalled, false, "executeRedemption must abort immediately without network request if member already redeemed");
  assert.ok(v2Preflight.alerts.some(a => a.includes("Already Redeemed")), "Staff alerted to concurrent redemption on confirm click");
  console.log("✓ Edge Case PASSED: Pre-flight check intercepts concurrently redeemed member without redundant network call.\n");


  // -----------------------------------------------------------------------------
  // Test Group 9: Distinct Server Busy Lock Contention Error Message
  // -----------------------------------------------------------------------------
  console.log("Checking Edge Case: Distinction between Server Busy lock error vs Network Offline...");
  const v2Busy = createTestContext(v2Code);
  v2Busy.getState().scriptUrl = "https://script.google.com/macros/s/test/exec";
  const busyMember = {
    id: "MBR-BUSY",
    name: "Busy Member",
    tier: "Value Club",
    status: "AVAILABLE"
  };
  v2Busy.getState().members = [busyMember];
  v2Busy.getState().selectedMember = busyMember;

  v2Busy.setFetch(async () => ({
    ok: true,
    json: async () => ({
      success: false,
      error: "Server busy processing another transaction. Please try again."
    })
  }));

  await v2Busy.executeRedemption();
  assert.strictEqual(busyMember.status, "AVAILABLE", "Member remains available on server busy");
  assert.ok(v2Busy.alerts.some(a => a.includes("Server Busy")), "Alert must specifically state Server Busy");
  assert.ok(!v2Busy.alerts.some(a => a.includes("Offline / Network Error")), "Alert must NOT falsely claim Offline / Network Error when server responded with busy");
  console.log("✓ Edge Case PASSED: Lock contention returns clean 'Server Busy' error without misleading offline claims.\n");


  // -----------------------------------------------------------------------------
  // Test Group 10: Vector SVG Icon Preservation in V2 Button
  // -----------------------------------------------------------------------------
  console.log("Checking Edge Case: Vector SVG icon preservation during promptRedeem in V2...");
  const v2Svg = createTestContext(v2Code);
  v2Svg.getState().scriptUrl = "https://script.google.com/macros/s/test/exec";
  v2Svg.getState().members = [{
    id: "MBR-SVG",
    name: "SVG Member",
    tier: "Grand Cru Club",
    status: "AVAILABLE"
  }];

  const initialButtonHtml = '<svg class="action-btn-svg"><rect width="20" height="14"/></svg><span>Redeem $40</span>';
  const mockButton = {
    disabled: false,
    innerHTML: initialButtonHtml,
    textContent: "Redeem $40",
    querySelector(sel) {
      if (sel === 'span') return { textContent: "Redeem $40" };
      return null;
    }
  };

  v2Svg.setQuerySelector((sel) => {
    if (sel.includes("MBR-SVG")) return mockButton;
    return null;
  });

  // Simulate network failure during freshness check
  v2Svg.setFetch(async () => {
    throw new Error("Network timeout");
  });

  await v2Svg.promptRedeem("MBR-SVG");

  // Verify button was re-enabled and SVG HTML was preserved
  assert.strictEqual(mockButton.disabled, false, "Card button must be re-enabled on verification error");
  assert.ok(mockButton.innerHTML.includes("<svg") && mockButton.innerHTML.includes("action-btn-svg"), 
    "Card button innerHTML must preserve vector SVG icon and not be replaced with flat text");
  console.log("✓ Edge Case PASSED: Vector SVG icon preserved intact after live freshness check.\n");


  // -----------------------------------------------------------------------------
  // Test Group 11: Data Sync Overwrite Protection Preserves redeemedStore in V2
  // -----------------------------------------------------------------------------
  console.log("Checking Edge Case: redeemedStore preservation in V2 fetchFromGoogleSheets...");
  const v2Store = createTestContext(v2Code);
  v2Store.getState().scriptUrl = "https://script.google.com/macros/s/test/exec";
  v2Store.getState().members = [{
    id: "MBR-STORE",
    name: "Store Member",
    tier: "Value Club",
    status: "REDEEMED",
    redeemedAt: "2026-09-21 15:00:00",
    redeemedBy: "Nancy J.",
    redeemedStore: "Store 1",
    pickupHistory: []
  }];

  v2Store.setFetch(async () => ({
    ok: true,
    json: async () => ({
      success: true,
      members: [{
        id: "MBR-STORE",
        name: "Store Member",
        tier: "Value Club",
        status: "AVAILABLE",
        redeemedAt: "",
        redeemedBy: "",
        redeemedStore: "",
        pickupHistory: []
      }]
    })
  }));

  await v2Store.fetchFromGoogleSheets();
  const syncedStoreMember = v2Store.getState().members.find(m => m.id === "MBR-STORE");
  assert.strictEqual(syncedStoreMember.status, "REDEEMED", "Status preserved as REDEEMED");
  assert.strictEqual(syncedStoreMember.redeemedStore, "Store 1", "redeemedStore must be preserved under overwrite protection");
  console.log("✓ Edge Case PASSED: Local redeemedStore attribution preserved across background syncs.\n");


  // -----------------------------------------------------------------------------
  // Test Group 12: Client-side Re-entrancy & Double-Click Protection
  // -----------------------------------------------------------------------------
  console.log("Checking Edge Case: Client-side double-click and re-entrancy protection...");
  const v2Reentrancy = createTestContext(v2Code);
  v2Reentrancy.getState().scriptUrl = "https://script.google.com/macros/s/test/exec";
  const reentrantMember = {
    id: "MBR-REENTRANT",
    name: "Reentrant Member",
    tier: "Value Club",
    status: "AVAILABLE"
  };
  v2Reentrancy.getState().members = [reentrantMember];
  v2Reentrancy.getState().selectedMember = reentrantMember;

  let executeFetchCount = 0;
  v2Reentrancy.setFetch(async () => {
    executeFetchCount++;
    await new Promise(r => setTimeout(r, 20));
    return {
      ok: true,
      json: async () => ({ success: true })
    };
  });

  // Call executeRedemption concurrently twice
  await Promise.all([
    v2Reentrancy.executeRedemption(),
    v2Reentrancy.executeRedemption()
  ]);

  assert.strictEqual(executeFetchCount, 1, "executeRedemption must ignore concurrent rapid second clicks");
  console.log("✓ Edge Case PASSED: Client-side re-entrancy guards prevent duplicate redemption submissions.\n");


  console.log("========================================================");
  console.log("ALL DOUBLE-DIP PREVENTION TESTS PASSED SUCCESSFULLY!");
  console.log("========================================================\n");
})();
