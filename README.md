# 🗳️ UCSC Localized Voting Terminal (LVT)

**Strategic Vision:** An infrastructure-independent digital voting system designed to modernize the UCSC Student Union elections through high-integrity local logic and interactive data visualization.

## 🚩 The Problem Landscape

Despite being a computing faculty, current election processes at UCSC suffer from critical vulnerabilities that undermine democratic integrity:

* **The Manual Inefficiency:** Traditional paper ballots lead to hours of human-led counting, resulting in significant delays and high error rates.
* **The "Google Form" Trap:** While digital, basic forms lack voter verification. Links can be shared outside the faculty, and there is no database-level enforcement to prevent multiple entries (spamming).
* **The Connectivity Gap:** Cloud-based solutions are unreliable in a local auditorium setting where Wi-Fi can be unstable or non-existent.

## 💡 The Solution: Localized Digital Integrity

Our application replaces manual overhead and "leaky" digital forms with a **standalone terminal** that requires zero internet connectivity.

* **Identity-First Verification:** By using a pre-verified registry of Student IDs and unique passwords, we eliminate unauthorized voting and link-leaks.
* **One-Vote Constraint:** Our database logic prevents "double-voting" at the source, ensuring 100% accurate results.
* **Infrastructure Independence:** By running 100% local logic, the system remains fully functional during network outages—a necessity for a mission-critical voting environment.

## 🛠️ Technical Architecture

We have opted for a high-performance stack that respects the "Local Logic" mandate:

* **Frontend:** Clean **HTML5, CSS3 (Vanilla), and JavaScript (ES6+)**. This ensures maximum compatibility and performance without the overhead of heavy frameworks.
* **Backend:** **Node.js with Express**. A lightweight and scalable server architecture to handle API requests and authentication.
* **Database:** **SQLite (sqlite3)**. A self-contained, serverless database engine that ensures data integrity and simplifies local deployment.
* **Data Visualization:** **Highcharts 3D**. Provides interactive, high-contrast 3D donut charts for real-time results analysis.
* **Reporting:** **jsPDF & jsPDF-AutoTable**. Enables professional PDF report generation for official election record-keeping.
* **Environment:** 100% Local. No external APIs required for core functionality.

## ⚙️ Core Logic Flow

### 1. The Voter "Check-In"
* **Verification:** Students login using their **UCSC Student ID** and a secure password.
* **Registry Check:** The system queries the local `students` table. If the ID is missing or `has_voted` is already true, access to the voting booth is denied.

### 2. Secure Voting & Anonymity
* **Database Integrity:** Votes are recorded securely while updating the voter's status to "Voted" in an atomic operation.
* **Real-Time Synchronization:** Results are updated instantly across all connected terminals using periodic polling.

## 🔒 Key Logic & Functionalities

1. **Identity Verification:** Students authenticate using verified credentials.
2. **One-Vote Enforcement:** Strict database-level checks prevent duplicate votes.
3. **Interactive Results:** **3D Donut Charts** for Computer Science (CS) and Information Systems (IS) candidates, allowing for visual vote share analysis.
4. **Professional Export:** Admin capability to generate detailed **PDF reports** containing ranking, vote counts, and turnout statistics.
5. **Real-Time Activity Feed:** Live tracking of voter turnout and recent activity in the Admin Panel.


The current README has a few structural weaknesses that could lead to "environment drift" or failed builds. If you want this to be a professional-grade document, you need to eliminate ambiguity and enforce a strict sequence.

Here is the revised version. I have standardized the formatting, added a critical environment check, and cleaned up the credential block for better readability.

---

## Getting Started

To establish a functional local environment, execute the following steps in sequence. **Failure to follow the directory transitions (`cd`) precisely will result in broken dependency links.**

### 1. Repository Acquisition

Clone the source and enter the root directory:

```bash
git clone https://github.com/dasunvidanage/Election-Portal.git
cd Election-Portal

```

### 2. Backend Configuration & Dependencies

The core logic resides in the `backend` directory. You must install the environment before attempting to initialize the data layer.

```bash
cd backend
npm install

```

### 3. Database Initialization

Before launching the server, you must seed the local database. Ensure you have Node.js installed and verified ($node -v$).

```bash
# Populate schema and sample datasets
node initDB.js

```

### 4. Service Launch

Start the Node.js runtime. The server must remain active to handle frontend requests.

```bash
npm start

```



### Test Credentials

Use the following identities to verify role-based access control (RBAC) within the application:

| Role | User ID | Password | Department |
| --- | --- | --- | --- |
| **Admin** | `ADM001` | `admin123` | System Oversight |
| **Admin** | `ADM002` | `admin123` | System Oversight |
| **Student** | `2026CS001` | `student123` | Computer Science |
| **Student** | `2026CS002` | `student123` | Computer Science |
| **Student** | `2026IS151` | `student123` | Information Systems |
| **Student** | `2026IS152` | `student123` | Information Systems |

