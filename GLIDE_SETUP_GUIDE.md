# Complete Glide App Setup Guide (Click-by-Click)

This guide walks you through building your **Wine Club Benefit Verifier** directly in [Glide](https://www.glideapps.com/) using your Google Spreadsheet. It takes about **15 minutes** and produces a native-feeling iPad app with huge buttons and zero double-dipping.

---

## Step 1: Prepare Your Google Sheet

1. Open your Google Drive and create a new Google Sheet named **`Wine Club Master`**.
2. Create two tabs:
   * **Tab 1: `Members`**
   * **Tab 2: `Audit_Log`**
3. In the **`Members`** tab, paste the columns from [`google-sheets/wine_club_members_template.csv`](./google-sheets/wine_club_members_template.csv):
   * `Member_ID`
   * `Full_Name`
   * `Phone`
   * `Email`
   * `Tier` (e.g. "Grand Cru Club" or "Value Club")
   * `Credit_Amount` (e.g. 40.00 or 15.00)
   * `Status_Current_Month` (put `AVAILABLE` or `REDEEMED`)
   * `Redeemed_At`
   * `Redeemed_Store`
   * `Redeemed_By_Staff`
   * `Notes`
4. In the **`Audit_Log`** tab, create these headers in Row 1:
   * `Timestamp`, `Member_ID`, `Full_Name`, `Tier`, `Credit_Amount`, `Store`, `Staff`, `Notes`

---

## Step 2: Connect Google Sheet to Glide

1. Go to [glideapps.com](https://www.glideapps.com/) and log in (free account).
2. Click **+ New App**.
3. Select **Google Sheets** as your source and choose your **`Wine Club Master`** spreadsheet.
4. Click **Create App**.

---

## Step 3: Configure the Main Screen (Search & Cards)

1. In the Glide layout editor, select the **Members** screen.
2. Under **Layout**, choose **Card** or **List**:
   * **Title:** `Full_Name`
   * **Subtitle:** `Phone`
   * **Details:** `Tier`
   * **Tag / Badge:** `Status_Current_Month` (Glide will color-code it).
3. In the right panel, enable **In-App Search**:
   * Set search fields to: `Full_Name`, `Phone`, `Member_ID`.
   * This gives your staff an instantaneous search bar at the top of the iPad screen.

---

## Step 4: Build the iPad Detail Screen (Huge Buttons)

When an employee taps on a member's name, configure the detail view:

### 1. Title Block
* Add a **Title Component**:
  * Title: `Full_Name`
  * Subtitle: `Phone` & `Email`
  * Description: `Tier` (e.g., *Grand Cru Club — $40.00 Monthly Bar Tab*)

### 2. Status Callout Box
* Add a **Callout Component** (or Text Block with rich markdown):
  * Set it to show: `Status_Current_Month`.
  * **Option A (When Available):** 
    * Set condition: Only show when `Status_Current_Month` is `AVAILABLE`.
    * Background color: **Green**.
    * Text: *"🟢 AVAILABLE FOR CURRENT MONTH ($40 Credit)"*
  * **Option B (When Redeemed):**
    * Set condition: Only show when `Status_Current_Month` is `REDEEMED`.
    * Background color: **Red**.
    * Text: *"🔴 ALREADY REDEEMED — Used at [Redeemed_Store] on [Redeemed_At] by [Redeemed_By_Staff]"*

### 3. Store & Staff Selector (Top of Detail Screen)
* Add a **Choice Component** for Store Location:
  * Options: `Store 1`, `Store 2`
* Add a **Choice Component** for Staff Name:
  * Options: List of your staff members

---

## Step 5: Configure the "Huge Redeem Button" & Actions

This is the magic that locks out double-dipping across both stores:

1. Add a **Button Component** to the screen.
2. In the Button settings:
   * **Title:** `✅ REDEEM $40 BAR CREDIT` (or use the dynamic column: `Credit_Amount`)
   * **Size:** Set to **Large / Extra Large**.
   * **Color:** **Green / Accent**.
3. **Set Conditional Visibility (Crucial!):**
   * In the right panel, scroll down to **Options $\rightarrow$ Visibility**.
   * Add condition: **Show only when `Status_Current_Month` is equal to `AVAILABLE`**.
   * *(Once tapped, the button disappears instantly so it can never be clicked twice).*
4. **Configure the Action (Compound Action):**
   * Change Action from "None" to **Create New Action** (name it `Process Wine Redemption`).
   * Add Step 1: **Set Column Values**
     * `Status_Current_Month` $\rightarrow$ set to `REDEEMED`
     * `Redeemed_At` $\rightarrow$ set to `Current date/time`
     * `Redeemed_Store` $\rightarrow$ set to `[Selected Store]`
     * `Redeemed_By_Staff` $\rightarrow$ set to `[Selected Staff]`
   * Add Step 2: **Add Row**
     * Target Table: `Audit_Log`
     * Fill in `Timestamp`, `Member_ID`, `Full_Name`, `Credit_Amount`, `Store`, `Staff`.
   * Add Step 3: **Show Notification**
     * Title: *"Benefit Redeemed!"*
     * Message: *"Apply discount on Toast POS now."*

### 4. Locked Button State
* Below the Green button, add a second button:
  * Title: `🔒 BENEFIT ALREADY USED THIS MONTH`
  * Color: **Grey / Disabled**
  * Visibility Condition: **Show only when `Status_Current_Month` is equal to `REDEEMED`**.

---

## Step 6: Install on the Store iPads

1. In Glide, click **Publish** (top right).
2. Copy the published web app link (or scan the QR code).
3. On each store iPad:
   * Open the link in **Safari**.
   * Tap the **Share icon** (the box with an upward arrow at the top right of Safari).
   * Scroll down and tap **"Add to Home Screen"**.
   * Name it **Wine Club**.
4. Tap the new icon on the iPad home screen:
   * It opens full-screen without Safari browser bars, looking and feeling like a native iPad app!

---

## Step 7: Automated 1st-of-Month Reset

To make the sheet automatically reset all members to `AVAILABLE` on the 1st of every month at midnight:

1. In your Google Sheet, click **Extensions $\rightarrow$ Apps Script**.
2. Paste the script from [`google-sheets/Code.gs`](./google-sheets/Code.gs).
3. Click **Run $\rightarrow$ installMonthlyTrigger**.
4. Grant Google authorization.
5. That's it! Every month on the 1st at 1:00 AM, all `Status_Current_Month` fields reset to `AVAILABLE`, while past redemptions remain safely archived in the `Audit_Log` tab.
