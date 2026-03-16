# Temperature Sharing — Intended Behavior

Temperature sharing was **not removed** in the Me tab cleanup. Only the **control** was moved: it now lives under **Me → Preferences & Data → Temperature visibility**. The feature itself is unchanged; this doc defines how it should behave so it stays safe and predictable.

---

## 1. Default state

**Temperature sharing is off by default.**

- **Temperature visibility:** Private  
- This prevents accidental sharing. Users must explicitly opt in.

---

## 2. When a user turns it on

When the user changes visibility from Private to any shared option, the app should show a **permission confirmation**:

**Title:** Allow others to see your temperature?

**Body:**  
Your temperature reflects how you're doing overall.  
You can change this anytime in Me → Preferences & Data.

**Actions:** [Cancel] · [Allow sharing]

After they tap **Allow sharing**, the state becomes the chosen scope (e.g. **Visible to Circle** or **Inner circle only**). If they tap **Cancel**, leave visibility as Private (or the previous value).

---

## 3. What other people see

People should **not** see raw internal metrics. They see a simple, emotionally safe summary, for example:

- **Alex**  
  Temperature: Warm  
  Last updated: Today  

or  

- **Alex**  
  Temperature: Cool  

Use friendly labels (Cool / Warm, or Doing well / Could use some love / Having a hard time / Really struggling) — not scores or raw data.

---

## 4. Where temperature appears

Temperature sharing should appear only in **specific places**:

- **People → Lights**
- **Circle / Mind Mail**
- Optional relationship views (when built)

**Not** everywhere. That keeps the feature meaningful and avoids clutter.

---

## 5. Where users control it

**Control location (correct after Me cleanup):**

**Me → Preferences & Data → Temperature visibility**

**Options (examples):**

- **Private** — no one sees your temperature  
- **Circle only** (or Inner circle only)  
- **Close friends**  
- **Everyone in Lights** (if product defines this scope)

The exact option labels may match the app’s `TemperatureVisibility` type (e.g. `private`, `inner_circle`, `close_friends`). Default is **Private**.

---

## 6. Permission reminders (when someone hasn’t shared)

If a user tries to view another person’s temperature and that person **has not** enabled sharing, the app should show a clear message, not a blank space:

**Example:**  
*"Alex hasn’t chosen to share their temperature."*

This respects privacy and avoids confusion.

---

## 7. Optional improvement (later)

You may add a **contextual permission prompt** the first time someone tries to share (or the first time they open the Temperature visibility control):

**Example:**  
Would you like your Circle to see your temperature?  
This helps close connections understand how you're doing.

[Keep private] · [Share with Circle]

This is optional; the main requirement is that sharing is off by default and that turning it on is confirmed (see §2).

---

## Bottom line

- **Feature:** Still exists. Sharing is intact.
- **Cleanup:** Only moved the control into **Preferences & Data → Temperature visibility**; made Me less cluttered.
- **Behavior:**  
  - Ask permission when enabling sharing.  
  - Default to private.  
  - Show clearly who can see it (visibility option label).  
  - Show friendly temperature labels to others; show a clear message when someone hasn’t chosen to share.
