/**
 * Email service using Resend API for weekly reports.
 * Falls back gracefully if RESEND_API_KEY is not set.
 */

let resend = null;
try {
  const { Resend } = require('resend');
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch {}

async function sendWeeklyStudentReport(student, reportData) {
  if (!resend) { console.log(`📧 [MOCK] Weekly report for ${student.name} (${student.email})`); return { id: 'mock' }; }

  const { aiSummary, cgpa, attendancePct, streak, completedTasks, prediction, topSubject, weakSubject } = reportData;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const html = `<!DOCTYPE html><html><head><style>
body{background:#0A0F0D;color:#fff;font-family:'DM Sans',Arial,sans-serif;margin:0;padding:0}
.c{max-width:580px;margin:0 auto;padding:40px 24px}
.logo{font-size:28px;font-weight:700;color:#F5A623;margin-bottom:40px}
.stat{background:#141F1A;border-radius:8px;padding:16px;border-left:3px solid #F5A623;display:inline-block;width:30%;margin-right:2%;text-align:center}
.sn{font-size:28px;font-weight:700;color:#F5A623}
.sl{font-size:12px;color:#7A9A88;margin-top:4px;text-transform:uppercase}
.ai{background:#141F1A;border-radius:8px;padding:20px;border:1px solid #1C2E25;font-size:15px;line-height:1.7;color:#B0C4B8;margin:24px 0}
.cta{display:inline-block;background:#F5A623;color:#000;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:600;font-size:14px;margin:24px 0}
.ft{margin-top:48px;padding-top:24px;border-top:1px solid #1C2E25;color:#7A9A88;font-size:12px}
</style></head><body><div class="c">
<div class="logo">नींव NEEV</div>
<p style="font-size:22px;font-weight:600;margin-bottom:8px">Hey ${student.name} 👋</p>
<p style="color:#7A9A88;font-size:15px;margin-bottom:32px">Your weekly performance snapshot.</p>
<div><div class="stat"><div class="sn">${cgpa}</div><div class="sl">CGPA</div></div>
<div class="stat"><div class="sn">${attendancePct}%</div><div class="sl">Attendance</div></div>
<div class="stat"><div class="sn">🔥 ${streak}</div><div class="sl">Streak</div></div></div>
<div class="ai"><strong>Saarthi says:</strong><br>${aiSummary || 'Keep going! Every step counts.'}</div>
<p style="color:#B0C4B8;font-size:15px">Tasks done: <strong>${completedTasks}</strong> · Top: <strong style="color:#4ADE80">${topSubject}</strong> · Weak: <strong style="color:#F87171">${weakSubject}</strong></p>
${prediction ? `<p style="font-size:28px;font-weight:700;color:#F5A623;margin:16px 0">Predicted: ${prediction.predicted_cgpa || prediction.predictedCGPA || '—'}</p>` : ''}
<a href="${frontendUrl}/dashboard" class="cta">Open NEEV Dashboard →</a>
<div class="ft"><p>NEEV — AI-Powered Engineering Growth Platform</p></div>
</div></body></html>`;

  return await resend.emails.send({
    from: 'NEEV Reports <reports@neev.app>',
    to: student.email,
    subject: `📊 Weekly NEEV Report — ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
    html
  });
}

async function sendTeacherDigest(teacher, batchData) {
  if (!resend) { console.log(`📧 [MOCK] Teacher digest for ${teacher.name}`); return { id: 'mock' }; }

  const { totalStudents, atRisk, avgCgpa, avgAttendance } = batchData;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const rows = (atRisk || []).map(s => `<tr><td style="padding:10px;color:#fff">${s.name}</td><td style="padding:10px;color:#F87171">${s.cgpa}</td><td style="padding:10px;color:#F5A623">${s.risk_level || 'high'}</td></tr>`).join('');

  const html = `<!DOCTYPE html><html><head><style>
body{background:#0A0F0D;color:#fff;font-family:Arial,sans-serif;padding:40px 24px}
table{width:100%;border-collapse:collapse;background:#141F1A;border-radius:8px}
th{background:#1C2E25;padding:10px;color:#7A9A88;font-size:11px;text-transform:uppercase;text-align:left}
.cta{display:inline-block;background:#F5A623;color:#000;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:600;margin-top:24px}
</style></head><body>
<div style="font-size:24px;font-weight:700;color:#F5A623;margin-bottom:32px">NEEV — Teacher Digest</div>
<p style="color:#7A9A88">Hello ${teacher.name},</p>
<p style="color:#B0C4B8;margin-bottom:24px">Batch summary: <strong>${totalStudents}</strong> students · <strong style="color:#F87171">${(atRisk || []).length}</strong> at risk · Avg CGPA <strong style="color:#4ADE80">${avgCgpa}</strong> · Avg Attendance <strong>${avgAttendance}%</strong></p>
${rows ? `<table><thead><tr><th>Name</th><th>CGPA</th><th>Risk</th></tr></thead><tbody>${rows}</tbody></table>` : '<p style="color:#7A9A88">No at-risk students this week 🎉</p>'}
<a href="${frontendUrl}/teacher/dashboard" class="cta">Open Dashboard →</a>
</body></html>`;

  return await resend.emails.send({
    from: 'NEEV Reports <reports@neev.app>',
    to: teacher.email,
    subject: `📋 NEEV Batch Digest — ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
    html
  });
}

module.exports = { sendWeeklyStudentReport, sendTeacherDigest };
