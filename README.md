# 🍷 Wine Club Benefit Verifier for Store iPads & Toast POS

A high-speed, touch-first iPad tool built for two store locations. It eliminates Google Sheets confusion at the bar, speeds up customer lookups to under 3 seconds, clearly displays monthly dollar credits ($15 Value Club / $40 Grand Cru Club), and locks out double-redemptions in real time across both stores.

---

## What's in this Project

```
c:\Users\haine\Desktop\CRV\
├── index.html                   # High-contrast, iPad touch interface (huge buttons)
├── styles.css                   # Touch-first stylesheet (64px+ targets, iOS safe-area)
├── app.js                       # 0ms fuzzy search, double-dip lockout, Google Sheets sync
├── server.js                    # Zero-dependency local Node.js server for iPad network access
├── package.json                 # NPM configuration
├── GLIDE_SETUP_GUIDE.md         # Click-by-click instructions to build this directly in Glide
├── README.md                    # This documentation file
└── google-sheets/
    ├── wine_club_members_template.csv  # Ready-to-import master member template
    └── Code.gs                  # Google Apps Script API & automated 1st-of-month reset
```

---

## 🚀 Quick Start (Running the Custom Web App on iPads)

### 1. Start the Local Server
Open a terminal in this directory and run:
```bash
npm start
# OR: node server.js
```

The terminal will display your local network addresses:
```
🍷 Wine Club Benefit Verifier is running!
- Local browser:   http://localhost:3000
- Store iPad URL:  http://192.168.1.X:3000
```

### 2. Open on the Store iPads
1. Connect the iPad to the same Wi-Fi network as the server (or deploy to Vercel/Netlify/Cloudflare for public cloud access).
2. Open Safari on the iPad and go to `http://192.168.1.X:3000`.
3. Tap the **Share icon** in Safari $\rightarrow$ tap **"Add to Home Screen"**.
4. The app now opens full-screen like a native iPad app without browser address bars!

---

## ⚡ How the Bartender Uses It (3 Seconds Total)

1. Member walks up to the bar: *"I'm a wine club member."*
2. Bartender types 2–3 letters of their name or phone number into the **huge search bar**.
3. Member card pops up instantly:
   * **John Smith** (555-0101)
   * **⭐ Grand Cru Club ($40.00 Bar Tab)**
   * **🟢 AVAILABLE FOR SEPTEMBER 2026**
4. Bartender taps the giant green **[ ✅ REDEEM $40.00 CREDIT ]** button.
5. Status turns **🔴 ALREADY REDEEMED (Sep 12, Store 1 by Sarah)**:
   * Both Store 1 and Store 2 are instantly updated in real time.
   * If the member visits Store 2 later, the button is greyed out: **[ 🔒 BENEFIT ALREADY USED ]**.
6. The screen prompts the bartender with the Toast discount:
   * *"Next step in Toast: Apply discount **Wine Club: Grand Cru ($40)** on the check."*

---

## 🔗 Connecting Live Google Sheets (Two-Way Sync)

1. In your Google Sheet, open **Extensions $\rightarrow$ Apps Script**.
2. Copy and paste the code from [`google-sheets/Code.gs`](./google-sheets/Code.gs).
3. Click **Deploy $\rightarrow$ New Deployment $\rightarrow$ Web App**.
   * Execute as: **Me**
   * Who has access: **Anyone**
4. Copy the Web App URL (starts with `https://script.google.com/macros/s/...`).
5. Open the iPad app, tap the **⚙️ Settings icon**, and paste the URL.
6. All iPads will now read and write directly to the master Google Sheet!

---

## ⏰ Automated 1st-of-Month Reset

You never have to manually reset member statuses or make new sheets each month:
1. In Google Sheets, click the custom menu: **🍷 Wine Club Admin $\rightarrow$ Install Automatic 1st-of-Month Trigger**.
2. Every month on the 1st at 1:00 AM, all member credits reset back to `AVAILABLE`.
3. A permanent, timestamped record of every redemption is kept in the `Audit_Log` tab.

---

## 📱 Prefer Native Glide?

If you prefer building and hosting this on [Glide](https://www.glideapps.com/), open [`GLIDE_SETUP_GUIDE.md`](./GLIDE_SETUP_GUIDE.md) for step-by-step instructions on setting up Glide tables, buttons, and conditional visibility rules with the included CSV template.
