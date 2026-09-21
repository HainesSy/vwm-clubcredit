/**
 * Wine Club Benefit Verifier - Google Apps Script Backend
 * 
 * This script serves as the API backend for your iPad Benefit Verifier web app.
 * It also includes automated monthly resets and custom Google Sheets menus.
 * 
 * SETUP INSTRUCTIONS:
 * 1. In your Google Sheet, click Extensions > Apps Script.
 * 2. Delete any existing code in Code.gs and paste this entire file.
 * 3. Click "Deploy" (top right) > "New deployment".
 * 4. Select type: "Web app".
 * 5. Configuration:
 *    - Description: "Wine Club API v1"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (allows store iPads to read/write without complex login)
 * 6. Click "Deploy", authorize permissions, and copy the Web App URL!
 */

const SHEET_MEMBERS = "Members";
const SHEET_AUDIT_LOG = "Audit_Log";

/**
 * Handle GET requests: Fetch all member data for the iPad app
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_MEMBERS);
    
    if (!sheet) {
      // Auto-setup if sheet doesn't exist yet
      setupSheets();
      sheet = ss.getSheetByName(SHEET_MEMBERS);
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ success: true, members: [], count: 0 });
    }
    
    const headers = data[0];
    const members = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] && !row[1]) continue; // Skip empty rows
      
      const member = {
        rowIndex: i + 1,
        id: String(row[0] || ""),
        name: String(row[1] || ""),
        phone: String(row[2] || ""),
        email: String(row[3] || ""),
        tier: String(row[4] || "Value Club"),
        creditAmount: Number(row[5] || (String(row[4]).toLowerCase().includes("grand") ? 40 : 15)),
        status: String(row[6] || "AVAILABLE").toUpperCase().trim(),
        redeemedAt: row[7] ? Utilities.formatDate(new Date(row[7]), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss") : "",
        redeemedStore: String(row[8] || ""),
        redeemedBy: String(row[9] || ""),
        notes: String(row[10] || "")
      };
      
      members.push(member);
    }
    
    const now = new Date();
    const currentMonth = Utilities.formatDate(now, Session.getScriptTimeZone(), "MMMM yyyy");
    
    return createJsonResponse({
      success: true,
      currentMonth: currentMonth,
      count: members.length,
      members: members
    });
    
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Handle POST requests: Process redemption from iPad
 */
function doPost(e) {
  try {
    let payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    } else {
      throw new Error("Missing payload data");
    }
    
    const action = payload.action || "redeem";
    
    if (action === "redeem") {
      return handleRedemption(payload);
    } else if (action === "bulk_pickup" || action === "pickup") {
      return handlePickup(payload);
    } else if (action === "reset_month") {
      return handleManualMonthlyReset();
    } else {
      throw new Error("Invalid action: " + action);
    }
    
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Process a member bottle pickup (single or bulk month hand-off)
 */
function handlePickup(payload) {
  const memberId = String(payload.memberId || "").trim();
  const store = String(payload.store || "Store 1").trim();
  const staff = String(payload.staff || "Staff").trim();
  const notes = String(payload.notes || "iPad Bottle Pickup").trim();
  const bottlesCount = Number(payload.bottlesCount || 0);
  const months = Array.isArray(payload.months) ? payload.months.join(", ") : String(payload.month || "Current Month");
  
  if (!memberId) {
    return createJsonResponse({ success: false, error: "Missing memberId" });
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_MEMBERS);
  let memberData = null;
  
  if (sheet) {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const rowId = String(data[i][0]).trim();
      if (rowId.toLowerCase() === memberId.toLowerCase()) {
        memberData = data[i];
        break;
      }
    }
  }
  
  const now = new Date();
  const timestampStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  
  // Append to permanent Audit Log
  let auditSheet = ss.getSheetByName(SHEET_AUDIT_LOG);
  if (!auditSheet) {
    auditSheet = ss.insertSheet(SHEET_AUDIT_LOG);
    auditSheet.appendRow(["Timestamp", "Member_ID", "Full_Name", "Tier", "Credit_Amount", "Store", "Staff", "Notes"]);
    auditSheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#e8f0fe");
  }
  
  const memberName = memberData ? memberData[1] : ("Member " + memberId);
  const memberTier = memberData ? memberData[4] : "Wine Club";
  
  auditSheet.appendRow([
    timestampStr,
    memberId,
    memberName,
    memberTier,
    bottlesCount + " bottles",
    store,
    staff,
    `Pickup months: [${months}] | ${notes}`
  ]);
  
  return createJsonResponse({
    success: true,
    message: "Bottle pickup recorded successfully!",
    memberId: memberId,
    bottlesCount: bottlesCount,
    months: months,
    staff: staff,
    timestamp: timestampStr
  });
}

/**
 * Process a member benefit redemption
 */
function handleRedemption(payload) {
  const memberId = String(payload.memberId || "").trim();
  const store = String(payload.store || "Store 1").trim();
  const staff = String(payload.staff || "Staff").trim();
  const notes = String(payload.notes || "").trim();
  
  if (!memberId) {
    return createJsonResponse({ success: false, error: "Missing memberId" });
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_MEMBERS);
  const data = sheet.getDataRange().getValues();
  
  let targetRow = -1;
  let memberData = null;
  
  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][0]).trim();
    if (rowId.toLowerCase() === memberId.toLowerCase()) {
      targetRow = i + 1; // 1-indexed sheet row
      memberData = data[i];
      break;
    }
  }
  
  if (targetRow === -1) {
    return createJsonResponse({ success: false, error: "Member not found with ID: " + memberId });
  }
  
  // Double-redemption check
  const currentStatus = String(memberData[6] || "").toUpperCase().trim();
  if (currentStatus === "REDEEMED") {
    const prevDate = memberData[7] ? Utilities.formatDate(new Date(memberData[7]), Session.getScriptTimeZone(), "MMM d, h:mm a") : "earlier";
    const prevStore = memberData[8] || "another store";
    const prevStaff = memberData[9] || "staff";
    
    return createJsonResponse({
      success: false,
      alreadyRedeemed: true,
      error: `Already redeemed on ${prevDate} at ${prevStore} by ${prevStaff}.`
    });
  }
  
  // Update the row
  const now = new Date();
  const timestampStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  
  sheet.getRange(targetRow, 7).setValue("REDEEMED"); // Column G: Status_Current_Month
  sheet.getRange(targetRow, 8).setValue(timestampStr); // Column H: Redeemed_At
  sheet.getRange(targetRow, 9).setValue(store);        // Column I: Redeemed_Store
  sheet.getRange(targetRow, 10).setValue(staff);       // Column J: Redeemed_By_Staff
  
  // Append to permanent Audit Log
  let auditSheet = ss.getSheetByName(SHEET_AUDIT_LOG);
  if (!auditSheet) {
    auditSheet = ss.insertSheet(SHEET_AUDIT_LOG);
    auditSheet.appendRow(["Timestamp", "Member_ID", "Full_Name", "Tier", "Credit_Amount", "Store", "Staff", "Notes"]);
    auditSheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#e8f0fe");
  }
  
  auditSheet.appendRow([
    timestampStr,
    memberData[0], // ID
    memberData[1], // Name
    memberData[4], // Tier
    memberData[5], // Credit
    store,
    staff,
    notes
  ]);
  
  return createJsonResponse({
    success: true,
    message: "Benefit redeemed successfully!",
    member: {
      id: memberData[0],
      name: memberData[1],
      tier: memberData[4],
      credit: memberData[5],
      status: "REDEEMED",
      redeemedAt: timestampStr,
      store: store,
      staff: staff
    }
  });
}

/**
 * Monthly Reset Function: Resets all member statuses on the 1st of every month
 */
function monthlyReset() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_MEMBERS);
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  let resetCount = 0;
  
  for (let i = 1; i < data.length; i++) {
    const rowNum = i + 1;
    const currentStatus = String(data[i][6] || "").toUpperCase().trim();
    
    if (currentStatus === "REDEEMED") {
      sheet.getRange(rowNum, 7).setValue("AVAILABLE");
      sheet.getRange(rowNum, 8).setValue("");
      sheet.getRange(rowNum, 9).setValue("");
      sheet.getRange(rowNum, 10).setValue("");
      resetCount++;
    }
  }
  
  // Log reset to Audit Log
  let auditSheet = ss.getSheetByName(SHEET_AUDIT_LOG);
  if (auditSheet) {
    const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    auditSheet.appendRow([nowStr, "SYSTEM", "Automated Monthly Reset", "All Tiers", 0, "All Stores", "Cron Trigger", `Reset ${resetCount} members`]);
  }
  
  Logger.log(`Reset completed for ${resetCount} members.`);
  return resetCount;
}

function handleManualMonthlyReset() {
  const count = monthlyReset();
  return createJsonResponse({
    success: true,
    message: `Monthly reset complete. ${count} members updated to AVAILABLE.`
  });
}

/**
 * Creates custom spreadsheet menu on open
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🍷 Wine Club Admin")
    .addItem("📋 Initialize / Verify Sheet Headers", "setupSheets")
    .addItem("🔄 Run Monthly Reset Now (Reset to AVAILABLE)", "manualResetPrompt")
    .addItem("⏰ Install Automatic 1st-of-Month Trigger", "installMonthlyTrigger")
    .addToUi();
}

function manualResetPrompt() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    "Confirm Monthly Reset",
    "Are you sure you want to reset all members to AVAILABLE for the new month? (All previous redemptions remain safe in the Audit_Log sheet).",
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    const count = monthlyReset();
    ui.alert(`Reset complete! ${count} members are now AVAILABLE.`);
  }
}

/**
 * Set up automated trigger to run monthlyReset() on the 1st of every month at midnight
 */
function installMonthlyTrigger() {
  // Clear any existing reset triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "monthlyReset") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Create a monthly trigger on the 1st of each month at 1:00 AM
  ScriptApp.newTrigger("monthlyReset")
    .timeBased()
    .onMonthDay(1)
    .atHour(1)
    .create();
    
  SpreadsheetApp.getUi().alert("✅ Automatic trigger successfully installed! Member statuses will automatically reset to AVAILABLE on the 1st of every month at 1:00 AM.");
}

/**
 * Initial sheet structure setup helper
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Members Sheet
  let sheet = ss.getSheetByName(SHEET_MEMBERS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_MEMBERS);
  }
  
  const memberHeaders = [
    "Member_ID", "Full_Name", "Phone", "Email", "Tier",
    "Credit_Amount", "Status_Current_Month", "Redeemed_At",
    "Redeemed_Store", "Redeemed_By_Staff", "Notes"
  ];
  
  sheet.getRange(1, 1, 1, memberHeaders.length).setValues([memberHeaders]);
  sheet.getRange(1, 1, 1, memberHeaders.length).setFontWeight("bold").setBackground("#1a365d").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  
  // 2. Audit Log Sheet
  let auditSheet = ss.getSheetByName(SHEET_AUDIT_LOG);
  if (!auditSheet) {
    auditSheet = ss.insertSheet(SHEET_AUDIT_LOG);
  }
  
  const auditHeaders = ["Timestamp", "Member_ID", "Full_Name", "Tier", "Credit_Amount", "Store", "Staff", "Notes"];
  auditSheet.getRange(1, 1, 1, auditHeaders.length).setValues([auditHeaders]);
  auditSheet.getRange(1, 1, 1, auditHeaders.length).setFontWeight("bold").setBackground("#2c5282").setFontColor("#ffffff");
  auditSheet.setFrozenRows(1);
}

/**
 * Helper to return formatted JSON responses with CORS headers
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
