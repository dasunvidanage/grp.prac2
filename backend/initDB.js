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

    const electionStart = new Date().toISOString();
    const electionEnd = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const defaultPositions = JSON.stringify(['President', 'Vice-President', 'Secretary', 'Junior Treasurer', 'Editor', 'Committee Member']);
    const election = await runAsync(`INSERT INTO elections (title, status, start_time, end_time, has_nominations, positions) VALUES (?, ?, ?, ?, ?, ?)`, 
      ['Student Council Election 2026', 'active', electionStart, electionEnd, 1, defaultPositions]);
    const electionId = election.lastID;

    // Admins
    for (let i = 1; i <= 5; i++) {
      await runAsync(`INSERT INTO students (student_id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, 'approved')`,
        [`ADM${String(i).padStart(3, '0')}`, `Admin User ${i}`, `admin${i}@ucsc.cmb.ac.lk`, adminPass, 'admin']);
    }

    // Students
    for (let i = 1; i <= 300; i++) {
      const dept = i <= 150 ? 'CS' : 'IS';
      const sId = `2026${dept}${String(i).padStart(3, '0')}`;
      await runAsync(`INSERT INTO students (student_id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, 'approved')`,
        [sId, `Student ${dept} ${i}`, `${sId.toLowerCase()}@stu.ucsc.cmb.ac.lk`, studentPass, 'student']);
    }

    // Candidates
    const positions = ['President', 'Vice-President', 'Secretary', 'Junior Treasurer', 'Editor', 'Committee Member'];
    for (let i = 1; i <= 10; i++) {
      const cat = i % 2 === 0 ? 'CS' : 'IS';
      const pos = positions[i % positions.length];
      const dept = cat;
      const sId = `2026${dept}${String(i).padStart(3, '0')}`; // Pick an existing student
      await runAsync(`INSERT INTO candidates (election_id, student_id, name, manifesto, language_proficiency, category, position, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [electionId, sId, `Candidate ${i}`, `Manifesto for ${pos}`, 'English', cat, pos, '../assets/images/candidate_pfp.png']);
    }

    // Votes & Participation
    for (let i = 1; i <= 200; i++) {
      const dept = i <= 100 ? 'CS' : 'IS';
      const sId = `2026${dept}${String(i).padStart(3, '0')}`;
      const randomCandId = Math.floor(Math.random() * 10) + 1;
      await runAsync(`INSERT INTO voter_participation (election_id, student_id) VALUES (?, ?)`, [electionId, sId]);
      await runAsync(`INSERT INTO votes (election_id, student_id, candidate_id) VALUES (?, ?, ?)`, [electionId, sId, randomCandId]);
    }

    await runAsync("COMMIT");
    await runAsync(`INSERT INTO settings (key, value) VALUES ('voting_open', '1')`);
    await runAsync(`INSERT INTO settings (key, value) VALUES ('nominationsOpen', '1')`);

    console.log('--- Database Initialized Successfully (300+ Users Created) ---');
    process.exit(0);
  } catch (err) {
    console.error('Initialization Error:', err);
    await runAsync("ROLLBACK").catch(() => {});
    process.exit(1);
  }
}

init();