const db = require('./database');
const bcrypt = require('bcryptjs');

db.serialize(() => {
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
    manifesto_full TEXT,
    campaign_points TEXT,
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

  // Insert candidates with more details
  const candidates = [
    ['Jane Smith', 'Vote for better education!', 'Full manifesto for Jane Smith: Improving library facilities, enhancing student support, and more.', 'Library access, Student support, Online resources', '../assets/images/jane.jpg'],
    ['Mark Taylor', 'Leading the future of campus technology.', 'Full manifesto for Mark Taylor: Upgrading Wi-Fi, new tech labs, and tech-driven solutions.', 'Faster Wi-Fi, Tech Labs, Smart ID cards', '../assets/images/mark.jpg'],
    ['Sara Connor', 'Inclusivity and diversity for all.', 'Full manifesto for Sara Connor: Ensuring all voices are heard and creating a more inclusive environment.', 'Diversity events, Inclusive spaces, Student representation', '../assets/images/sara.jpg']
  ];

  const candStmt = db.prepare(`INSERT INTO candidates (name, manifesto, manifesto_full, campaign_points, photo) VALUES (?, ?, ?, ?, ?)`);
  candidates.forEach(cand => {
    candStmt.run(cand);
  });
  candStmt.finalize();

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
    console.log('Database initialized successfully.');
    process.exit(0);
  });
});
