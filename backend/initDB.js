const db = require('./database');
const bcrypt = require('bcryptjs');

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function init() {
  console.log('--- Initializing Database (Synchronous Logic) ---');

  const salt = bcrypt.genSaltSync(10);
  const studentPass = bcrypt.hashSync('student123', salt);
  const adminPass = bcrypt.hashSync('admin123', salt);

  try {
    const dropTables = ['votes', 'candidates', 'students', 'settings', 'nominations', 'elections', 'voter_participation'];
    for (const table of dropTables) {
      await runAsync(`DROP TABLE IF EXISTS ${table}`);
    }

    await runAsync(`CREATE TABLE students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      academic_year INTEGER,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      status TEXT DEFAULT 'pending',
      id_photo TEXT
    )`);

    await runAsync(`CREATE TABLE elections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'upcoming',
      start_time DATETIME,
      end_time DATETIME,
      has_nominations BOOLEAN DEFAULT 0,
      nomination_type TEXT DEFAULT '3-person',
      nomination_start DATETIME,
      nomination_end DATETIME,
      positions TEXT,
      allowed_years TEXT,
      cs_vote_limit INTEGER DEFAULT 1,
      is_vote_limit INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await runAsync(`CREATE TABLE voter_participation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      election_id INTEGER NOT NULL,
      student_id TEXT NOT NULL,
      voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (election_id) REFERENCES elections(id),
      FOREIGN KEY (student_id) REFERENCES students(student_id),
      UNIQUE(election_id, student_id)
    )`);

    await runAsync(`CREATE TABLE candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      election_id INTEGER NOT NULL,
      student_id TEXT NOT NULL,
      name TEXT NOT NULL,
      manifesto TEXT NOT NULL,
      language_proficiency TEXT NOT NULL,
      category TEXT NOT NULL,
      position TEXT NOT NULL,
      photo TEXT,
      FOREIGN KEY (election_id) REFERENCES elections(id),
      FOREIGN KEY (student_id) REFERENCES students(student_id)
    )`);

    await runAsync(`CREATE TABLE votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      election_id INTEGER NOT NULL,
      student_id TEXT NOT NULL,
      candidate_id INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (election_id) REFERENCES elections(id),
      FOREIGN KEY (student_id) REFERENCES students(student_id),
      FOREIGN KEY (candidate_id) REFERENCES candidates(id)
    )`);

    await runAsync(`CREATE TABLE nominations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      election_id INTEGER NOT NULL,
      candidate_id TEXT NOT NULL,
      proposer_id TEXT NOT NULL,
      seconder_id TEXT NOT NULL,
      manifesto TEXT NOT NULL,
      language_proficiency TEXT NOT NULL,
      category TEXT NOT NULL,
      position TEXT NOT NULL,
      photo TEXT,
      candidate_consent TEXT DEFAULT 'pending',
      proposer_consent TEXT DEFAULT 'pending',
      seconder_consent TEXT DEFAULT 'pending',
      admin_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (election_id) REFERENCES elections(id),
      FOREIGN KEY (candidate_id) REFERENCES students(student_id),
      FOREIGN KEY (proposer_id) REFERENCES students(student_id),
      FOREIGN KEY (seconder_id) REFERENCES students(student_id)
    )`);

    await runAsync(`CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT)`);

    await runAsync("BEGIN TRANSACTION");

    // Admins
    for (let i = 1; i <= 5; i++) {
      await runAsync(`INSERT INTO students (student_id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, 'approved')`,
        [`ADM${String(i).padStart(3, '0')}`, `Admin User ${i}`, `admin${i}@ucsc.cmb.ac.lk`, adminPass, 'admin']);
    }

    // Students
    const currentYear = 2026;
    const years = [2025, 2024, 2023, 2022];
    
    for (const yearPrefix of years) {
      const academicYear = currentYear - yearPrefix;
      
      // 180 CS Students
      for (let i = 1; i <= 180; i++) {
        const sId = `${yearPrefix}CS${String(i).padStart(3, '0')}`;
        const email = `${sId.toLowerCase()}@stu.ucsc.cmb.ac.lk`;
        await runAsync(`INSERT INTO students (student_id, name, email, academic_year, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, 'approved')`,
          [sId, `Student CS ${yearPrefix}-${i}`, email, academicYear, studentPass, 'student']);
      }

      // 120 IS Students
      for (let i = 1; i <= 120; i++) {
        const sId = `${yearPrefix}IS${String(i).padStart(3, '0')}`;
        const email = `${sId.toLowerCase()}@stu.ucsc.cmb.ac.lk`;
        await runAsync(`INSERT INTO students (student_id, name, email, academic_year, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, 'approved')`,
          [sId, `Student IS ${yearPrefix}-${i}`, email, academicYear, studentPass, 'student']);
      }
    }

    // Special First Year Election
    const fyElectionStart = new Date().toISOString();
    const fyElectionEnd = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    const fyPositions = JSON.stringify(['CS Representative', 'IS Representative']);
    const fyAllowedYears = JSON.stringify(['1']);
    const fyElectionResult = await runAsync(`INSERT INTO elections (title, status, start_time, end_time, has_nominations, nomination_type, positions, allowed_years, cs_vote_limit, is_vote_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['First Year Student Union Representative Election', 'active', fyElectionStart, fyElectionEnd, 1, 'self', fyPositions, fyAllowedYears, 2, 2]);
    const fyElectionId = fyElectionResult.lastID;

    // Candidates for FY Election (Year 1 - 2025)
    const csCandidatesFY = [];
    const isCandidatesFY = [];
    for (let i = 1; i <= 5; i++) {
      const sIdCS = `2025CS${String(i).padStart(3, '0')}`;
      const csCand = await runAsync(`INSERT INTO candidates (election_id, student_id, name, manifesto, language_proficiency, category, position, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [fyElectionId, sIdCS, `CS Candidate ${i} (Y1)`, `Manifesto for CS Rep ${i}`, 'English', 'CS', 'CS Representative', '../assets/images/candidate_pfp.png']);
      csCandidatesFY.push(csCand.lastID);
      
      const sIdIS = `2025IS${String(i).padStart(3, '0')}`;
      const isCand = await runAsync(`INSERT INTO candidates (election_id, student_id, name, manifesto, language_proficiency, category, position, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [fyElectionId, sIdIS, `IS Candidate ${i} (Y1)`, `Manifesto for IS Rep ${i}`, 'English', 'IS', 'IS Representative', '../assets/images/candidate_pfp.png']);
      isCandidatesFY.push(isCand.lastID);
    }

    // Special Second Year Election
    const syPositions = JSON.stringify(['CS Representative', 'IS Representative']);
    const syAllowedYears = JSON.stringify(['2']);
    const syElectionResult = await runAsync(`INSERT INTO elections (title, status, start_time, end_time, has_nominations, nomination_type, positions, allowed_years, cs_vote_limit, is_vote_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['Second Year Student Union Batch Representatives', 'active', fyElectionStart, fyElectionEnd, 1, 'self', syPositions, syAllowedYears, 4, 4]);
    const syElectionId = syElectionResult.lastID;

    // Candidates for SY Election (Year 2 - 2024)
    const csCandidatesSY = [];
    const isCandidatesSY = [];
    for (let i = 1; i <= 5; i++) {
      const sIdCS = `2024CS${String(i).padStart(3, '0')}`;
      const csCand = await runAsync(`INSERT INTO candidates (election_id, student_id, name, manifesto, language_proficiency, category, position, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [syElectionId, sIdCS, `CS Candidate ${i} (Y2)`, `Manifesto for CS Rep ${i}`, 'English', 'CS', 'CS Representative', '../assets/images/candidate_pfp.png']);
      csCandidatesSY.push(csCand.lastID);
      
      const sIdIS = `2024IS${String(i).padStart(3, '0')}`;
      const isCand = await runAsync(`INSERT INTO candidates (election_id, student_id, name, manifesto, language_proficiency, category, position, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [syElectionId, sIdIS, `IS Candidate ${i} (Y2)`, `Manifesto for IS Rep ${i}`, 'English', 'IS', 'IS Representative', '../assets/images/candidate_pfp.png']);
      isCandidatesSY.push(isCand.lastID);
    }

    // Simulate Votes for Both Elections
    console.log('--- Simulating Votes ---');
    
    // FY Votes
    const votingStudentsFY = [];
    for (let i = 10; i <= 60; i++) votingStudentsFY.push(`2025CS${String(i).padStart(3, '0')}`);
    for (let i = 10; i <= 50; i++) votingStudentsFY.push(`2025IS${String(i).padStart(3, '0')}`);

    for (const studentId of votingStudentsFY) {
      await runAsync(`INSERT INTO voter_participation (election_id, student_id) VALUES (?, ?)`, [fyElectionId, studentId]);
      const shuffledCS = [...csCandidatesFY].sort(() => 0.5 - Math.random());
      // Vote for 2 CS candidates (Limit is 2)
      for (let i = 0; i < 2; i++) await runAsync(`INSERT INTO votes (election_id, student_id, candidate_id) VALUES (?, ?, ?)`, [fyElectionId, studentId, shuffledCS[i]]);
      const shuffledIS = [...isCandidatesFY].sort(() => 0.5 - Math.random());
      // Vote for 2 IS candidates (Limit is 2)
      for (let i = 0; i < 2; i++) await runAsync(`INSERT INTO votes (election_id, student_id, candidate_id) VALUES (?, ?, ?)`, [fyElectionId, studentId, shuffledIS[i]]);
    }

    // SY Votes
    const votingStudentsSY = [];
    for (let i = 10; i <= 55; i++) votingStudentsSY.push(`2024CS${String(i).padStart(3, '0')}`);
    for (let i = 10; i <= 45; i++) votingStudentsSY.push(`2024IS${String(i).padStart(3, '0')}`);

    for (const studentId of votingStudentsSY) {
      await runAsync(`INSERT INTO voter_participation (election_id, student_id) VALUES (?, ?)`, [syElectionId, studentId]);
      const shuffledCS = [...csCandidatesSY].sort(() => 0.5 - Math.random());
      // Vote for 4 CS candidates (Limit is 4)
      for (let i = 0; i < 4; i++) await runAsync(`INSERT INTO votes (election_id, student_id, candidate_id) VALUES (?, ?, ?)`, [syElectionId, studentId, shuffledCS[i]]);
      const shuffledIS = [...isCandidatesSY].sort(() => 0.5 - Math.random());
      // Vote for 4 IS candidates (Limit is 4)
      for (let i = 0; i < 4; i++) await runAsync(`INSERT INTO votes (election_id, student_id, candidate_id) VALUES (?, ?, ?)`, [syElectionId, studentId, shuffledIS[i]]);
    }

    await runAsync("COMMIT");
    await runAsync(`INSERT INTO settings (key, value) VALUES ('voting_open', '1')`);
    await runAsync(`INSERT INTO settings (key, value) VALUES ('nominationsOpen', '1')`);

    console.log('--- Database Initialized Successfully (1200+ Students Created) ---');
    process.exit(0);
  } catch (err) {
    console.error('Initialization Error:', err);
    await runAsync("ROLLBACK").catch(() => {});
    process.exit(1);
  }
}

init();