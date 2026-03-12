const db = require('./database');
const bcrypt = require('bcryptjs');

db.serialize(() => {
  // Drop and recreate Students table to include role
  db.run(`DROP TABLE IF EXISTS students`);
  db.run(`CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    has_voted BOOLEAN DEFAULT 0
  )`);

  // Create Candidates table (reset for clean state)
  db.run(`DROP TABLE IF EXISTS candidates`);
  db.run(`CREATE TABLE candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    manifesto TEXT NOT NULL,
    photo TEXT
  )`);

  // Create Votes table (reset for clean state)
  db.run(`DROP TABLE IF EXISTS votes`);
  db.run(`CREATE TABLE votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    candidate_id INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
  )`);

  console.log('Tables created successfully.');

  // Helper to hash and insert users
  const salt = bcrypt.genSaltSync(10);
  
  const users = [
    { id: '2026CS001', name: 'Admin One', pass: '20050528', role: 'admin' },
    { id: '2026CS002', name: 'Admin Two', pass: '20040531', role: 'admin' },
    { id: '2026CS003', name: 'Student One', pass: '123abc', role: 'student' },
    { id: '2026CS004', name: 'Student Two', pass: '456efg', role: 'student' },
    { id: '2026CS005', name: 'Student Three', pass: '789hij', role: 'student' }
  ];

  const userStmt = db.prepare(`INSERT INTO students (student_id, name, password_hash, role) VALUES (?, ?, ?, ?)`);
  users.forEach(user => {
    const hash = bcrypt.hashSync(user.pass, salt);
    userStmt.run(user.id, user.name, hash, user.role);
    console.log(`User ${user.id} (${user.role}) seeded.`);
  });
  userStmt.finalize();

  // Insert candidates
  const candidates = [
    ['Jane Smith', 'Vote for better education!', '/assets/images/jane.jpg'],
    ['Mark Taylor', 'Leading the future of campus technology.', '/assets/images/mark.jpg'],
    ['Sara Connor', 'Inclusivity and diversity for all.', '/assets/images/sara.jpg']
  ];

  const candStmt = db.prepare(`INSERT INTO candidates (name, manifesto, photo) VALUES (?, ?, ?)`);
  candidates.forEach(cand => {
    candStmt.run(cand);
  });
  candStmt.finalize(() => {
    console.log('Candidates seeded.');
    process.exit(0);
  });
});
