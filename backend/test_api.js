const assert = require('node:assert');

async function runTests() {
  const BASE_URL = 'http://127.0.0.1:5000/api';
  console.log('--- Starting Full System Verification ---');

  // Helper fetch
  async function request(url, options = {}) {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const body = await res.json();
    return { status: res.status, body };
  }

  // 1. Health check
  console.log('1. Testing Health endpoint...');
  const health = await request('/health');
  assert.strictEqual(health.status, 200);
  assert.strictEqual(health.body.status, 'online');
  console.log('   ✓ Health check passed');

  // 2. Student login
  console.log('2. Testing Student Authentication...');
  const studentLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'student1', password: 'student123', expectedRole: 'student' })
  });
  assert.strictEqual(studentLogin.status, 200);
  assert.ok(studentLogin.body.token);
  assert.strictEqual(studentLogin.body.user.role, 'student');
  const studentToken = studentLogin.body.token;
  const studentUser = studentLogin.body.user;
  console.log(`   ✓ Logged in as student: ${studentUser.name} (${studentUser.id})`);

  // 3. Admin login
  console.log('3. Testing Admin Authentication...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'admin123', expectedRole: 'admin' })
  });
  assert.strictEqual(adminLogin.status, 200);
  assert.ok(adminLogin.body.token);
  assert.strictEqual(adminLogin.body.user.role, 'admin');
  const adminToken = adminLogin.body.token;
  const adminUser = adminLogin.body.user;
  console.log(`   ✓ Logged in as admin: ${adminUser.name} (${adminUser.id})`);

  // 4. Student raises an issue
  console.log('4. Testing Student Issue Submission...');
  const newIssueRes = await request('/issues', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      title: 'Automated Test: Projector bulb failure in Seminar Hall',
      category: 'Classroom',
      priority: 'High',
      description: 'The ceiling projector lamp blew out during physics tutorial. Screen is totally dark and error light is blinking red.'
    })
  });
  assert.strictEqual(newIssueRes.status, 201);
  const createdIssue = newIssueRes.body.issue;
  assert.strictEqual(createdIssue.status, 'Pending');
  assert.strictEqual(createdIssue.priority, 'High');
  console.log(`   ✓ Issue created successfully: ${createdIssue.id} (Status: ${createdIssue.status})`);

  // 5. Admin updates status to Under Review with an official reply note
  console.log('5. Testing Admin Status Update -> Under Review...');
  const statusUpdate1 = await request(`/issues/${createdIssue.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'Under Review',
      note: 'Issue forwarded to AV Maintenance. Technician assigned with replacement bulb.'
    })
  });
  assert.strictEqual(statusUpdate1.status, 200);
  assert.strictEqual(statusUpdate1.body.issue.status, 'Under Review');
  console.log('   ✓ Status updated to Under Review and official note posted');

  // 6. Student adds a follow-up message
  console.log('6. Testing Student Reply...');
  const replyRes = await request(`/issues/${createdIssue.id}/replies`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      message: 'Thank you Dr. Jenkins. Please note the next presentation begins at 2:00 PM.'
    })
  });
  assert.strictEqual(replyRes.status, 201);
  console.log('   ✓ Student follow-up message posted');

  // 7. Admin resolves the issue
  console.log('7. Testing Admin Status Update -> Resolved...');
  const statusUpdate2 = await request(`/issues/${createdIssue.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'Resolved',
      note: 'The projector lamp has been replaced with a brand new OEM unit and tested successfully.'
    })
  });
  assert.strictEqual(statusUpdate2.status, 200);
  assert.strictEqual(statusUpdate2.body.issue.status, 'Resolved');
  console.log('   ✓ Issue marked as Resolved');

  // 8. Student submits 5-star resolution feedback
  console.log('8. Testing Student Feedback Submission...');
  const feedbackRes = await request(`/issues/${createdIssue.id}/feedback`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      rating: 5,
      comment: 'Super fast replacement before our afternoon presentation! Excellent service.'
    })
  });
  assert.strictEqual(feedbackRes.status, 200);
  assert.strictEqual(feedbackRes.body.feedback.rating, 5);
  console.log('   ✓ Feedback recorded: 5 Stars with positive student review');

  // 9. Fetch issue details and verify complete thread
  console.log('9. Testing Issue Details & Thread Retrieval...');
  const detailRes = await request(`/issues/${createdIssue.id}`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.strictEqual(detailRes.status, 200);
  assert.strictEqual(detailRes.body.issue.status, 'Resolved');
  assert.strictEqual(detailRes.body.feedback.rating, 5);
  assert.ok(detailRes.body.replies.length >= 2);
  console.log(`   ✓ Issue details validated with ${detailRes.body.replies.length} replies and verified feedback`);

  // 10. Notifications check
  console.log('10. Testing Notification System...');
  const notifs = await request('/notifications', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.strictEqual(notifs.status, 200);
  assert.ok(Array.isArray(notifs.body.notifications));
  console.log(`   ✓ Student has ${notifs.body.notifications.length} notifications (${notifs.body.unreadCount} unread)`);

  console.log('\n>>> ALL 10 TESTS PASSED SUCCESSFULLY! FULL WORKFLOW VERIFIED! <<<');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
