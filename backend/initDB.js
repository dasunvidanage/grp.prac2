const db = require('./database');
const bcrypt = require('bcryptjs');

db.serialize(() => {
  // 1. Schema Reset
  const tables = [
    `DROP TABLE IF EXISTS votes`,
    `DROP TABLE IF EXISTS audit_log`,
    `DROP TABLE IF EXISTS candidates`,
    `DROP TABLE IF EXISTS students`,
    `DROP TABLE IF EXISTS settings`,
    `CREATE TABLE students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      has_voted BOOLEAN DEFAULT 0,
      voted_at DATETIME
    )`,
    `CREATE TABLE candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      manifesto TEXT NOT NULL,
      language_proficiency TEXT NOT NULL,
      category TEXT NOT NULL,
      photo TEXT
    )`,
    `CREATE TABLE votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      candidate_id INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(student_id),
      FOREIGN KEY (candidate_id) REFERENCES candidates(id)
    )`,
    `CREATE TABLE audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT,
      action TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT)`
  ];

  tables.forEach(sql => db.run(sql));

  // 2. Data Generation Config
  // DEVELOPERS: You can modify the following parameters to change the initial data set
  const salt = bcrypt.genSaltSync(10);
  const studentPass = bcrypt.hashSync('student123', salt); // Default password for all students
  const adminPass = bcrypt.hashSync('admin123', salt);     // Default password for all admins

  db.run("BEGIN TRANSACTION");

  // --- Insert Admins ---
  // Change the loop limit to add more or fewer initial admin accounts
  const userStmt = db.prepare(`INSERT INTO students (student_id, name, password_hash, role) VALUES (?, ?, ?, ?)`);
  for (let i = 1; i <= 5; i++) {
    userStmt.run(`ADM${String(i).padStart(3, '0')}`, `Admin User ${i}`, adminPass, 'admin');
  }

  // --- Insert Students ---
  // Change the loop limit (currently 300) to adjust the total student population
  // The 'dept' logic can also be modified to balance CS vs IS students
  for (let i = 1; i <= 300; i++) {
    const dept = i <= 150 ? 'CS' : 'IS';
    const sId = `2026${dept}${String(i).padStart(3, '0')}`;
    userStmt.run(sId, `Student ${dept} ${i}`, studentPass, 'student');
  }
  userStmt.finalize();

  // --- Insert Candidates ---
  // Modify the 'categories' array to add/remove subject streams
  // Change the loop limit (currently 10) to adjust total candidates
  const categories = ['CS', 'IS'];
  const candStmt = db.prepare(`INSERT INTO candidates (name, manifesto, language_proficiency, category, photo) VALUES (?, ?, ?, ?, ?)`);
  for (let i = 1; i <= 10; i++) {
    const cat = categories[i % categories.length];
    const catFullName = cat === 'CS' ? 'Computer Science' : 'Information Systems';
    candStmt.run(
      `Candidate ${i}`, 
      `Vote for me for a better future in ${catFullName}! My manifesto focuses on innovation and student welfare.`,
      'English, Sinhala, Tamil',
      cat,
      `../assets/images/candidate_pfp.png` // Default placeholder for all candidates
    );
  }
  candStmt.finalize();

  // --- Generate Random Votes (Sample Data) ---
  // Change the loop limit (currently 200) to simulate more or fewer initial votes
  const voteStmt = db.prepare(`INSERT INTO votes (student_id, candidate_id) VALUES (?, ?)`);
  const updateStudentStmt = db.prepare(`UPDATE students SET has_voted = 1, voted_at = CURRENT_TIMESTAMP WHERE student_id = ?`);

  for (let i = 1; i <= 200; i++) {
    const dept = i <= 100 ? 'CS' : 'IS';
    const sId = `2026${dept}${String(i).padStart(3, '0')}`;
    const randomCandId = Math.floor(Math.random() * 10) + 1;
    
    voteStmt.run(sId, randomCandId);
    updateStudentStmt.run(sId);
  }
  
  voteStmt.finalize();
  updateStudentStmt.finalize();

  db.run("COMMIT", () => {
    // 3. Settings Initialization
    const settings = [
      ['voting_open', '1'],
      ['voting_deadline', new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()]
    ];

    const setStmt = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`);
    settings.forEach(s => setStmt.run(s));
    setStmt.finalize(() => {
      console.log('--- Database Initialized ---');
      console.log('Admins: 5');
      console.log('Students: 300');
      console.log('Candidates: 10');
      console.log('Pre-loaded Votes: 200');
      
      console.log('\n--- Sample Credentials ---');
      console.log('Admin: ADM001 / admin123');
      console.log('Student (CS): 2026CS001 / student123');
      console.log('Student (IS): 2026IS151 / student123');
      
      process.exit(0);
    });
  });
});

/**
 * SAMPLE CREDENTIALS FOR TESTING:
 * 
 * ADMIN ACCOUNTS:
 * ID: ADM001, Password: admin123
 * ID: ADM002, Password: admin123
 * 
 * STUDENT ACCOUNTS:
 * ID: 2026CS001, Password: student123 (Computer Science)
 * ID: 2026IS151, Password: student123 (Information Systems)
 */