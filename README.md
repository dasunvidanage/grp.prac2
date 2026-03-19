# 🗳️ UCSC Universal Election Portal (UEP)

**Strategic Vision:** A high-integrity, flexible digital voting ecosystem designed to facilitate diverse student elections—from Student Union blocks to Faculty Clubs—through a robust administrative-approval workflow and multi-tier anonymity.

## 🚩 The Problem Landscape

Modern campus elections require more than just a digital ballot; they require a system that can adapt to varying constitutional requirements without compromising security:

* **The Verification Gap:** Standard forms cannot verify if a user is a legitimate student or a specific club member.
* **Rigid Election Logic:** Most systems are hardcoded for one specific election type, failing to account for varying "Proposer/Seconder" rules or multi-vote quotas.
* **The Privacy Paradox:** Balancing the need for auditability with the absolute necessity of voter anonymity, even from system administrators.

## 💡 The Solution: Dynamic Governance

Our application replaces static registries with a **Self-Service Registration & Approval Engine**, giving administrators granular control over every phase of the democratic process.

### 1. Robust Identity Management
* **Document-Backed Registration:** Students register with their Full Name, UCSC ID, and Email, supported by a **mandatory University ID image upload**.
* **Admin Gatekeeping:** A dedicated verification tier where admins manually approve or reject registrations based on the provided credentials and image proof.

### 2. Hyper-Flexible Election Configuration
Admins can customize the "Rules of Engagement" for every election:
* **Temporal Control:** Independent definitions for the **Nomination Period** and **Voting Period**.
* **Candidacy Models:** Support for both **Self-Nomination** and **Endorsed Nomination** (requiring a Proposer and Seconder).
* **Weighted Voting Quotas:** Admins define exactly how many votes a student can cast per department (e.g., *Allow 2 votes for CS candidates and 1 for IS candidates*).
* **Eligibility Filters:** Limit participation (both voting and running) to specific academic years or departments.

### 3. Absolute Anonymity
* **Application-Level Blindness:** The database is architected to ensure **zero-linkage** between a voter's identity and their specific ballot. Not even the System Administrator can de-anonymize a vote.
* **Aggregated Transparency:** Students view results in real-time, but only as aggregated, high-level data.

## 🛠️ Technical Architecture

* **Frontend:** Vanilla HTML5/CSS3 and ES6+ JavaScript.
* **Backend:** Node.js with Express.
* **Database:** SQLite (sqlite3) for atomic, reliable local transactions.
* **Security:** Cryptographic hashing for passwords and an isolated file-storage system for ID verification images.
* **Visualization:** Highcharts 3D for real-time, interactive turnout and result tracking.

## ⚙️ Core Logic Flow

### 1. The Onboarding Pipeline
* **Student Sign-up:** User submits details and uploads an ID photo.
* **Verification:** Admin reviews the "Pending Requests" dashboard to approve the student.
* **Credentialing:** Once approved, the student gains access to the portal.

### 2. The Nomination Lifecycle
* **Application:** Eligible students apply for positions during the Nomination Period.
* **Endorsement (Optional):** If required, candidates must secure digital approval from a Proposer and Seconder.
* **Vetting:** Admins perform a final check on candidates before they appear on the official ballot.

### 3. The Voting Phase

* **Dynamic Quota Enforcement**: The system strictly validates each ballot against the specific CS and IS vote limits configured by the administrator for that particular election.
* **Atomic Interaction**: To maintain high integrity, the system records the vote and updates the user's participation status in a single, inseparable operation, ensuring no student can submit multiple ballots.
* **Absolute Anonymization**: The connection between the student's identity and their specific choices is severed at the point of submission. Votes are cast into an encrypted, anonymized pool where they remain disconnected from the voter's credentials.
* **Real-time Aggregation**: While individual choices stay private, the system instantly updates the collective results, allowing students to monitor the election's progress through live, high-level data visualizations.

## Getting Started

### 1. Repository Acquisition
```bash
git clone https://github.com/dasunvidanage/Election-Portal.git
cd Election-Portal
```

### 2. Setup & Dependencies
```bash
cd backend
npm install
```

### 3. Database & Storage Initialization
Ensure you have a `uploads/` directory in your backend to handle the University ID images.
```bash
node initDB.js
```

### 4. Launch
```bash
npm start
```

---

### Future Roadmap: Club Integration
The system is built with **extensibility** at its core. While currently optimized for UCSC CS/IS departments, the "Eligibility Filter" logic can be expanded to verify **Club Membership lists**, allowing the platform to host elections for Special Clubs and other Union with minimal configuration changes.

---


### Test Credentials

Use the following identities to verify role-based access control (RBAC) within the application:

| Role | User ID | Password | Department |
| --- | --- | --- | --- |
| **Admin** | `ADM001` | `admin123` | System Oversight |
| **Admin** | `ADM002` | `admin123` | System Oversight |
| **Student** | `2025CS001` | `student123` | Computer Science |
| **Student** | `2025CS002` | `student123` | Computer Science |
| **Student** | `2023IS151` | `student123` | Information Systems |
| **Student** | `2023IS152` | `student123` | Information Systems |


