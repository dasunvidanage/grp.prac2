
## 🛠 Project Audit: Student Committee Voting App

### 1. Version Control & Management (The "Branch Drift")

* **The Issue:** 5–6 active branches with divergent logic and UI and an dated `main` branch.
* **The "Bad" Thing:** No single source of truth. Features are being developed in silos that are currently incompatible.
* **The Risk:** "Merge Hell." Attempting to combine these before the deadline will likely result in a broken, non-functional application.

### 2. Infrastructure & Portability (The "Binary Error")

* **The Issue:** `node_modules` folder was committed to GitHub.
* **The "Bad" Thing:** The repository contains platform-specific binaries (SQLite) compiled for a different OS.
* **The Impact:** The app is **unbuildable** on new machines. Anyone cloning the repo (including the grader) will encounter a fatal `ERR_DLOPEN_FAILED` error immediately.
* **Correction Required:** Immediate removal of `node_modules` and creation of a `.gitignore` file.

### 3. Development Workflow (The "Manual Labor" Problem)

* **The Issue:** Missing `dev` script in `package.json` and zero test coverage.
* **The "Bad" Thing:** The team is using `npm start` for development with no hot-reloading.
* **The Impact:** Massive opportunity cost. Developers are wasting minutes every hour manually restarting servers instead of coding logic.

### 4. Architectural Fragility

* **The Issue:** Mixed paradigms (Next.js framework vs. raw HTML pages).
* **The "Bad" Thing:** Conflicting routing logic. Next.js expects a specific file structure; raw HTML files in the wrong directory will either be ignored or cause routing collisions.
* **The Impact:** The UI is fragmented and inconsistent across different branches.

---
