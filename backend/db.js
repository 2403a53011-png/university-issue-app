const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new DatabaseSync(dbPath);

// Initialize schema
function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'admin')),
      department TEXT NOT NULL,
      year TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High')),
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Under Review', 'Resolved', 'Rejected')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS replies (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL CHECK(sender_role IN ('student', 'admin')),
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      issue_id TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      issue_id TEXT UNIQUE NOT NULL,
      student_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id)
    );
  `);

  // Check if seed data already exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  console.log('Seeding initial university database with realistic students and admin...');
  const studentPwd = bcrypt.hashSync('student123', 10);
  const adminPwd = bcrypt.hashSync('admin123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, username, password, email, role, department, year, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const dateStr = (offsetMinutes = 0) => new Date(now.getTime() - offsetMinutes * 60000).toISOString();

  // Insert Users
  insertUser.run('STU-2024-001', 'Rahul Kumar', 'student1', studentPwd, 'rahul.kumar@university.edu', 'student', 'Computer Science & Engineering', 'Year 3', dateStr(5000));
  insertUser.run('STU-2024-002', 'Priya Sharma', 'student2', studentPwd, 'priya.sharma@university.edu', 'student', 'Electrical Engineering', 'Year 2', dateStr(5000));
  insertUser.run('STU-2024-003', 'Arjun Reddy', 'student3', studentPwd, 'arjun.reddy@university.edu', 'student', 'Mechanical Engineering', 'Year 4', dateStr(5000));
  insertUser.run('ADM-2024-001', 'Dr. Sarah Jenkins', 'admin', adminPwd, 'admin@university.edu', 'admin', 'Dean of Student Affairs', null, dateStr(5000));

  // Insert Issues
  const insertIssue = db.prepare(`
    INSERT INTO issues (id, student_id, student_name, title, description, category, priority, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Issue 1: High priority Under Review
  insertIssue.run(
    'ISS-2026-001',
    'STU-2024-001',
    'Rahul Kumar',
    'Wi-Fi connectivity failure in Hostel Block B',
    'The wireless access points on the 2nd and 3rd floors of Hostel Block B have been flashing red and disconnecting every 2 minutes since yesterday evening. Students cannot submit online lab assignments or access the university intranet portal.',
    'Internet / Wi-Fi',
    'High',
    'Under Review',
    dateStr(180),
    dateStr(90)
  );

  // Issue 2: Pending
  insertIssue.run(
    'ISS-2026-002',
    'STU-2024-002',
    'Priya Sharma',
    'Ceiling projector not displaying in Classroom 204',
    'The HDMI input cable for the ceiling-mounted projector in Classroom 204 is damaged, producing distorted purple lines on the screen during morning lectures.',
    'Classroom',
    'Medium',
    'Pending',
    dateStr(120),
    dateStr(120)
  );

  // Issue 3: Resolved with 5-star feedback
  insertIssue.run(
    'ISS-2026-003',
    'STU-2024-001',
    'Rahul Kumar',
    'Examination schedule clash between CS301 and MA302',
    'Both CS301 (Advanced Algorithms) and MA302 (Discrete Mathematics) end-semester examinations are currently scheduled on Monday at 09:30 AM in Hall C. Kindly review the timetable conflict.',
    'Examination',
    'High',
    'Resolved',
    dateStr(1440),
    dateStr(720)
  );

  // Issue 4: Resolved with 4-star feedback
  insertIssue.run(
    'ISS-2026-004',
    'STU-2024-003',
    'Arjun Reddy',
    'Hostel Block C 4th Floor water supply pressure issue',
    'There has been low water pressure in the morning between 6 AM and 8 AM on the 4th floor of Hostel Block C. Hot water geysers cannot trip on due to low inlet pressure.',
    'Hostel',
    'High',
    'Resolved',
    dateStr(2880),
    dateStr(1200)
  );

  // Issue 5: Pending
  insertIssue.run(
    'ISS-2026-005',
    'STU-2024-001',
    'Rahul Kumar',
    'Request for extended central library opening hours during midterms',
    'During the upcoming midterm exam week, students would appreciate if the Central Library reading halls could remain open until 2:00 AM instead of closing at 10:00 PM.',
    'Library',
    'Low',
    'Pending',
    dateStr(60),
    dateStr(60)
  );

  // Insert Replies
  const insertReply = db.prepare(`
    INSERT INTO replies (id, issue_id, sender_id, sender_name, sender_role, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertReply.run(
    'REP-001',
    'ISS-2026-001',
    'ADM-2024-001',
    'Dr. Sarah Jenkins',
    'admin',
    'Your issue has been acknowledged and forwarded to the campus IT Network Operations team. An engineer (Mr. Sharma) has been dispatched with replacement POE switches.',
    dateStr(90)
  );

  insertReply.run(
    'REP-002',
    'ISS-2026-001',
    'STU-2024-001',
    'Rahul Kumar',
    'student',
    'Thank you Dr. Jenkins. The engineer just arrived at Block B and is currently testing the switch rack.',
    dateStr(45)
  );

  insertReply.run(
    'REP-003',
    'ISS-2026-003',
    'ADM-2024-001',
    'Dr. Sarah Jenkins',
    'admin',
    'The examination committee met today and resolved the clash. MA302 has been rescheduled to Tuesday 02:00 PM in Hall A. The revised timetable has been published on the notice board.',
    dateStr(720)
  );

  insertReply.run(
    'REP-004',
    'ISS-2026-004',
    'ADM-2024-001',
    'Dr. Sarah Jenkins',
    'admin',
    'The campus estate maintenance crew replaced the secondary booster pressure pump this morning. Water pressure is restored to 3.2 bar.',
    dateStr(1200)
  );

  // Insert Feedback for resolved issues
  const insertFeedback = db.prepare(`
    INSERT INTO feedback (id, issue_id, student_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertFeedback.run(
    'FB-001',
    'ISS-2026-003',
    'STU-2024-001',
    5,
    'Timetable conflict resolved remarkably fast before the revision week started. Thank you so much!',
    dateStr(700)
  );

  insertFeedback.run(
    'FB-002',
    'ISS-2026-004',
    'STU-2024-003',
    4,
    'Water pressure is back to normal now. Good quick response from the maintenance department.',
    dateStr(1100)
  );

  // Insert Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, issue_id, message, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Notifications for Rahul Kumar (STU-2024-001)
  insertNotif.run('NOTIF-001', 'STU-2024-001', 'ISS-2026-001', 'Admin Dr. Sarah Jenkins replied to your issue ISS-2026-001 ("Wi-Fi connectivity failure in Hostel Block B")', 0, dateStr(90));
  insertNotif.run('NOTIF-002', 'STU-2024-001', 'ISS-2026-001', 'The status of your issue ISS-2026-001 changed to "Under Review"', 1, dateStr(90));
  insertNotif.run('NOTIF-003', 'STU-2024-001', 'ISS-2026-003', 'Your issue ISS-2026-003 has been marked as Resolved. Please provide your feedback.', 1, dateStr(720));

  // Notifications for Admin (ADM-2024-001)
  insertNotif.run('NOTIF-004', 'ADM-2024-001', 'ISS-2026-005', 'New issue submitted by Rahul Kumar: "Request for extended central library opening hours during midterms"', 0, dateStr(60));
  insertNotif.run('NOTIF-005', 'ADM-2024-001', 'ISS-2026-002', 'New issue submitted by Priya Sharma: "Ceiling projector not displaying in Classroom 204"', 0, dateStr(120));
  insertNotif.run('NOTIF-006', 'ADM-2024-001', 'ISS-2026-003', 'Rahul Kumar submitted 5-star feedback on resolved issue ISS-2026-003', 1, dateStr(700));

  console.log('Database seeded successfully.');
}

initDB();

module.exports = db;
