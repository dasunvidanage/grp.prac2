const db = require('./database');
const bcrypt = require('bcryptjs');

db.serialize(() => {
  console.log('Starting database initialization...');

  // Drop and recreate Students table
  db.run(`DROP TABLE IF EXISTS students`);
  db.run(`CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    has_voted BOOLEAN DEFAULT 0,
    voted_at DATETIME
  )`);

  // Create Candidates table
  db.run(`DROP TABLE IF EXISTS candidates`);
  db.run(`CREATE TABLE candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    manifesto TEXT NOT NULL,
    language_proficiency TEXT,
    category TEXT NOT NULL, -- 'CS' or 'IS'
    photo TEXT
  )`);

  // Create Votes table
  db.run(`DROP TABLE IF EXISTS votes`);
  db.run(`CREATE TABLE votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    candidate_id INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
  )`);

  // Create Audit Log table
  db.run(`DROP TABLE IF EXISTS audit_log`);
  db.run(`CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT,
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create Settings table
  db.run(`DROP TABLE IF EXISTS settings`);
  db.run(`CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);

  console.log('Tables created successfully.');

  // Helper to hash and insert users
  const salt = bcrypt.genSaltSync(10);
  
  const users = [
    // CS Admins
    { id: '2026CS001', name: 'CS Admin One', pass: '20050528', role: 'admin' },
    { id: '2026CS002', name: 'CS Admin Two', pass: '20040531', role: 'admin' },
    // IS Admins
    { id: '2026IS001', name: 'IS Admin One', pass: '20050528', role: 'admin' },
    { id: '2026IS002', name: 'IS Admin Two', pass: '20040531', role: 'admin' },
    // Sample Students
    { id: '2026CS003', name: 'Student CS One', pass: '123abc', role: 'student' },
    { id: '2026IS003', name: 'Student IS One', pass: '123abc', role: 'student' }
  ];

  const userStmt = db.prepare(`INSERT INTO students (student_id, name, password_hash, role) VALUES (?, ?, ?, ?)`);
  users.forEach(user => {
    const hash = bcrypt.hashSync(user.pass, salt);
    userStmt.run(user.id, user.name, hash, user.role);
    console.log(`User ${user.id} (${user.role}) seeded.`);
  });
  userStmt.finalize();

  console.log('Candidate table ready (empty).');

  // Initial settings
  const settings = [
    ['voting_open', '1'],
    ['voting_deadline', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()] // 24 hours from now
  ];

  const setStmt = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`);
  settings.forEach(set => {
    setStmt.run(set);
  });
  setStmt.finalize(() => {
    console.log('Database initialized successfully with CS and IS admin credentials.');
    process.exit(0);
  });
});
