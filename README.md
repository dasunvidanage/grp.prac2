# 🗳️ UCSC Localized Voting Terminal (LVT)

**Strategic Vision:** An infrastructure-independent digital voting system designed to modernize the UCSC Student Union elections through high-integrity local logic.


## 🚩 The Problem Landscape

Despite being a computing faculty, current election processes at UCSC suffer from critical vulnerabilities that undermine democratic integrity:

* **The Manual Inefficiency:** Traditional paper ballots lead to hours of human-led counting, resulting in significant delays and high error rates.
* **The "Google Form" Trap:** While digital, basic forms lack voter verification. Links can be shared outside the faculty, and there is no database-level enforcement to prevent multiple entries (spamming).
* **The Connectivity Gap:** Cloud-based solutions are unreliable in a local auditorium setting where Wi-Fi can be unstable or non-existent.

## 💡 The Solution: Localized Digital Integrity

Our application replaces manual overhead and "leaky" digital forms with a **standalone terminal** that requires zero internet connectivity.

* **Identity-First Verification:** By using a pre-verified registry of Student IDs and unique tokens (NIC/Index), we eliminate unauthorized voting and link-leaks.
* **One-Vote Constraint:** Our database logic prevents "double-voting" at the source, ensuring 100% accurate results.
* **Infrastructure Independence:** By running 100% local logic, the system remains fully functional during network outages—a necessity for a mission-critical voting environment.


## 🛠️ Technical Architecture

We have opted for a high-performance stack that respects the "Local Logic" mandate:

* **Next.js (App Router):** Provides a professional, fast-loading UI that handles complex state transitions without page reloads.
* **better-sqlite3:** A strategic choice over standard `sqlite3`. Its **Synchronous API** and **Atomic Transactions** ensure that votes are either fully recorded or rolled back if a crash occurs—zero data corruption.
* **Tailwind CSS (Auditorium-Ready):** Hard-coded **High-Contrast Dark Mode** specifically optimized for large-scale auditorium projectors.
* **Environment:** 100% Local. No external APIs. No Cloud. No AI.
* **Architecture:** Serverless local logic – No external APIs or cloud dependencies.


## ⚙️ Core Logic Flow

### 1. The Voter "Check-In"

* **Verification:** Students enter their ID (e.g., `2022/CS/001`) and NIC.
* **Registry Check:** The system queries the local `users` table. If the ID is missing or `has_voted` is already true, the session is terminated immediately.

### 2. Secure Voting & Anonymity

* **Database Transaction:** Every vote is wrapped in a `better-sqlite3` transaction block.
* **Privacy:** After verification, the vote is recorded in a decoupled table to maintain ballot secrecy while updating the voter's status to "Voted."


## 🔒 Key Logic & Functionalities

1. **Identity Verification:** Students "login" using their **UCSC Student ID** and a **Unique Token** (NIC/Index Number).
2. **One-Vote Enforcement:** The system checks the local registry to ensure the ID is valid and has not already cast a vote (`has_voted` flag).
3. **Nomination Management:** A secure Admin panel to approve candidates and manifestos.
4. **Real-Time Analytics:** An automated dashboard that tallies results instantly—no manual CSV processing required.


## 🎭 Presentation & Demo Strategy

A presentation in a large hall requires high-level coordination. We will avoid "amateur" mistakes by following those:


### 1. Presentation Roles: The "No Dead Air" Rule

To keep the audience engaged, we operate in two distinct roles:

* **The Driver:** Navigates the UI and executes the demo. Movements must be deliberate and slow enough for the audience to follow.
* **The Speaker:** Provides the technical narrative. **Mandate:** If the Driver is typing or a page is loading, the Speaker must be explaining the "Engineering Why" (e.g., explaining the SQL transaction logic or the `better-sqlite3` execution).

### 2. High-Impact Demo Script (The "Happy & Sad" Paths)

We will demonstrate the system's robustness through three specific phases:

1. **Phase 1: The Happy Path:** Cast a successful vote using a valid UCSC Student ID format to show the seamless user experience.
2. **Phase 2: The Security Test (The "Sad" Path):** Attempt to vote again with the same ID. This proves our "Local Logic" handles identity integrity and prevents double-voting.
3. **Phase 3: The Big Reveal:** Switch to the Admin Dashboard. Use high-contrast **Bar charts** to show real-time analytics, proving the manual counting era is over.

### 3. Visual & Technical Standards

* **Auditorium Visibility:** The app is hardcoded in **High-Contrast Dark Mode**. Text and charts must be bold and oversized to ensure legibility for the back row.
* **Real-Time Analytics:** The Admin panel must reflect data changes instantly to demonstrate the efficiency of our local database triggers without refreshing the page.


### 4. Final Pre-Demo Checklist (The "No-Fail" Protocol)

* ✅ **The "Seed" Data:** The database must be pre-populated with **20+ test votes**. A chart with only 1 or 2 votes looks like a prototype; 20+ votes look like a production-ready system.
* ✅ **Infrastructure Proof:** **Wi-Fi must be turned OFF** before the presentation starts. This is our physical proof that the "Local Logic" mandate has been met 100%.
* ✅ **Display Calibration:** Zoom the browser to 125% or 150% so the UI elements are "Auditorium-Scale."



## Getting Started

To get this project running locally, follow these steps exactly. High-level execution requires attention to detail; skipping a dependency check or running commands in the wrong directory will result in immediate build failures.

#### **A. Clone the Repository**

Download the project files to your local machine:

```bash
git clone <repo-url>
cd <repository-name>

```

#### **B. Initialize the Backend**

The server logic and API reside in the `backend` directory. You must install the necessary dependencies for the frontend to communicate with the system.

```bash
cd backend
npm install

```

#### **C. Database Initialization & Launch**

Prepare the database and start the service:

```bash
# Initialize the database schema and sample data
node initDB.js

# Start the Node.js server
npm start

```


#### **D. Accessing the Application**

Once the server is running, the portal is accessible via your web browser
