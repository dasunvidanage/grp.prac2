const db = require('./database');
const bcrypt = require('bcryptjs');

db.serialize(() => {
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
    `CREATE TABLE settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`
  ];

  tables.forEach(sql => db.run(sql));

  const salt = bcrypt.genSaltSync(10);
  const users = [
    { id: '2026CS001', name: 'CS Admin One', pass: '20050528', role: 'admin' },
    { id: '2026CS002', name: 'CS Admin Two', pass: '20040531', role: 'admin' },
    { id: '2026IS001', name: 'IS Admin One', pass: '20050528', role: 'admin' },
    { id: '2026IS002', name: 'IS Admin Two', pass: '20040531', role: 'admin' },
    { id: '2026CS003', name: 'Student CS One', pass: '123abc', role: 'student' },
    { id: '2026IS003', name: 'Student IS One', pass: '123abc', role: 'student' }
  ];

  const userStmt = db.prepare(`INSERT INTO students (student_id, name, password_hash, role) VALUES (?, ?, ?, ?)`);
  users.forEach(u => userStmt.run(u.id, u.name, bcrypt.hashSync(u.pass, salt), u.role));
  userStmt.finalize();

  const settings = [
    ['voting_open', '1'],
    ['voting_deadline', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()]
  ];

  const setStmt = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`);
  settings.forEach(s => setStmt.run(s));
  setStmt.finalize(() => {
    console.log('Database optimized and initialized.');
    process.exit(0);
  });
});
