/**
 * NEEV Database Seeder — 50 students + 2 teachers with rich varied data
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Marks = require('./models/Marks');
const Attendance = require('./models/Attendance');
const SkillProgress = require('./models/SkillProgress');
const Project = require('./models/Project');
const MockTest = require('./models/MockTest');

const names = [
  'Rahul Sharma','Priya Verma','Arjun Singh','Meera Patel','Dev Malhotra',
  'Ananya Reddy','Karthik Nair','Isha Gupta','Rohan Joshi','Sneha Das',
  'Vikram Kumar','Neha Agarwal','Aditya Tiwari','Kavya Menon','Harsh Saxena',
  'Divya Chauhan','Siddharth Rao','Riya Bhatt','Kunal Mehta','Pooja Iyer',
  'Amit Pandey','Shruti Mishra','Varun Kapoor','Tanvi Desai','Nikhil Sinha',
  'Anjali Dubey','Rajat Khanna','Sakshi Jain','Mohit Bansal','Deepika Negi',
  'Gaurav Thakur','Nidhi Sharma','Pranav Kulkarni','Megha Yadav','Tushar Goel',
  'Swati Rathore','Akash Chandra','Pallavi Sen','Manish Bhatia','Ritika Kaur',
  'Saurabh Gupta','Jyoti Kumari','Abhishek Rawat','Simran Oberoi','Vivek Parashar',
  'Komal Singh','Dhruv Ahuja','Nikita Saxena','Tarun Grover','Aparna Chatterjee'
];
const branches = ['CS','CS','CS','IT','CS','CS','IT','CS','CS','IT','CS','CS','CS','IT','CS','CS','CS','IT','CS','CS','CS','IT','CS','CS','CS','IT','CS','CS','IT','CS','CS','CS','IT','CS','CS','CS','IT','CS','CS','CS','IT','CS','CS','CS','IT','CS','CS','CS','IT','CS'];
const goals = ['Full Stack','AI/ML','Data Science','Full Stack','Full Stack','AI/ML','Cybersecurity','Full Stack','Data Science','AI/ML','Full Stack','Data Science','AI/ML','Full Stack','Web Development','UI/UX','Full Stack','AI/ML','Full Stack','Data Science','Full Stack','AI/ML','Full Stack','Data Science','Web Development','Full Stack','AI/ML','Full Stack','Data Science','Full Stack','Full Stack','AI/ML','Data Science','Full Stack','Startup','Full Stack','AI/ML','Full Stack','Data Science','Full Stack','AI/ML','Full Stack','Data Science','Full Stack','Higher Studies','Full Stack','AI/ML','Full Stack','Data Science','Full Stack'];

const subjectsBySem = {
  1: ['Engineering Mathematics I','Engineering Physics','Engineering Chemistry','Basic EE','Programming in C'],
  2: ['Engineering Mathematics II','Data Structures','Digital Logic','OOP with C++','Environmental Science'],
  3: ['Data Structures & Algorithms','DBMS','Operating Systems','Computer Networks','Mathematics III'],
  4: ['OOP with Java','Software Engineering','Design & Analysis of Algorithms','Web Technologies','Discrete Mathematics'],
  5: ['Machine Learning','Cloud Computing','Information Security','Compiler Design','Elective I'],
  6: ['Deep Learning','Distributed Systems','Mobile Computing','Big Data Analytics','Elective II']
};

const allSkills = [
  {n:'C',c:'language'},{n:'C++',c:'language'},{n:'Java',c:'language'},{n:'Python',c:'language'},
  {n:'JavaScript',c:'language'},{n:'TypeScript',c:'language'},{n:'SQL',c:'language'},{n:'R',c:'language'},
  {n:'React',c:'development'},{n:'Node.js',c:'development'},{n:'Express.js',c:'development'},
  {n:'Next.js',c:'development'},{n:'Django',c:'development'},{n:'Flask',c:'development'},
  {n:'MongoDB',c:'development'},{n:'PostgreSQL',c:'development'},{n:'TensorFlow',c:'development'},
  {n:'PyTorch',c:'development'},{n:'Pandas',c:'development'},{n:'NumPy',c:'development'},
  {n:'DSA',c:'cs-core'},{n:'DBMS',c:'cs-core'},{n:'OS Concepts',c:'cs-core'},{n:'CN',c:'cs-core'},
  {n:'OOP',c:'cs-core'},{n:'System Design',c:'cs-core'},
  {n:'Git',c:'tools'},{n:'Docker',c:'tools'},{n:'VS Code',c:'tools'},{n:'Linux',c:'tools'},
  {n:'AWS',c:'tools'},{n:'Figma',c:'tools'}
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding NEEV database with 50 students...\n');

  await Promise.all([
    Student.deleteMany({}), Teacher.deleteMany({}), Marks.deleteMany({}),
    SkillProgress.deleteMany({}), Project.deleteMany({}), MockTest.deleteMany({})
  ]);

  const password = await bcrypt.hash('neev123', 10);
  const studentDocs = [];

  for (let i = 0; i < 50; i++) {
    const sem = rand(2, 6);
    const cgpaBase = 4 + Math.random() * 5.5;
    const cgpa = Math.round(cgpaBase * 10) / 10;
    const backlogs = cgpa < 5 ? rand(1, 4) : cgpa < 6 ? rand(0, 2) : cgpa < 7 ? rand(0, 1) : 0;
    const streak = cgpa > 7 ? rand(5, 45) : cgpa > 5 ? rand(0, 15) : rand(0, 3);

    studentDocs.push({
      rollNumber: `NEEV2024${String(i + 1).padStart(3, '0')}`,
      name: names[i], email: `${names[i].split(' ')[0].toLowerCase()}${i}@neev.dev`,
      password, phone: `98765${String(43210 + i).slice(-5)}`,
      branch: branches[i], semester: sem,
      college: 'NEEV Institute of Technology',
      careerGoal: goals[i], cgpa, backlogs,
      placementReadiness: Math.min(Math.round(cgpa * 8 + streak * 0.5 + rand(-10, 15)), 100),
      profileComplete: true,
      techProfile: {
        languages: pick(['JavaScript','Python','Java','C++','C','TypeScript','SQL'], rand(2, 5)),
        frameworks: pick(['React','Node.js','Express','Django','Flask','Next.js'], rand(0, 3)),
        tools: pick(['Git','VS Code','Docker','Linux','AWS','Figma'], rand(1, 4)),
        githubUrl: cgpa > 6 ? `https://github.com/${names[i].split(' ')[0].toLowerCase()}${i}` : '',
        linkedinUrl: cgpa > 7 ? `https://linkedin.com/in/${names[i].split(' ')[0].toLowerCase()}${i}` : ''
      },
      softSkills: {
        englishFluency: rand(3, 9), communicationConfidence: rand(2, 9),
        aptitudeLevel: rand(2, 9), interviewConfidence: rand(2, 8)
      },
      currentStreak: streak, longestStreak: streak + rand(0, 20),
      lastActiveDate: new Date(Date.now() - rand(0, 30) * 86400000)
    });
  }

  const students = await Student.insertMany(studentDocs);
  console.log(`✅ ${students.length} students created`);

  // Teachers
  const teachers = await Teacher.insertMany([
    { email: 'teacher@neev.dev', name: 'Dr. Anil Kumar', password, department: 'Computer Science', role: 'admin', assignedStudents: students.slice(0, 25).map(s => s._id) },
    { email: 'teacher2@neev.dev', name: 'Prof. Sunita Rao', password, department: 'Information Technology', role: 'teacher', assignedStudents: students.slice(25).map(s => s._id) }
  ]);
  console.log(`✅ ${teachers.length} teachers created`);

  // Marks — multiple semesters per student
  const marksBulk = [];
  students.forEach(student => {
    for (let sem = 1; sem < student.semester; sem++) {
      const subs = subjectsBySem[sem] || subjectsBySem[3];
      subs.forEach((sub, si) => {
        const base = Math.round(student.cgpa * 9 + rand(-15, 15));
        const total = Math.max(25, Math.min(98, base));
        const internal = Math.round(total * 0.3);
        const external = Math.round(total * 0.55);
        const practical = total - internal - external;
        marksBulk.push({
          studentId: student._id, semester: sem, subject: sub,
          subjectCode: `${student.branch}${sem}0${si + 1}`,
          internalMarks: Math.min(internal, 30), externalMarks: Math.min(external, 70),
          practicalMarks: Math.min(Math.max(practical, 0), 25),
          maxInternal: 30, maxExternal: 70, maxPractical: 25, examType: 'external'
        });
      });
    }
  });
  await Marks.insertMany(marksBulk);
  console.log(`✅ ${marksBulk.length} marks records created`);

  // Skills — varied per student
  const skillsBulk = [];
  students.forEach(student => {
    const numSkills = rand(3, 10);
    const chosen = pick([...allSkills], numSkills);
    chosen.forEach(sk => {
      const prog = Math.round(student.cgpa * 8 + rand(-20, 25));
      skillsBulk.push({
        studentId: student._id, category: sk.c, skillName: sk.n,
        completionPercent: Math.max(5, Math.min(100, prog)),
        confidenceLevel: Math.ceil(Math.max(5, Math.min(100, prog)) / 20),
        streak: rand(0, 15)
      });
    });
  });
  await SkillProgress.insertMany(skillsBulk);
  console.log(`✅ ${skillsBulk.length} skill records created`);

  // Projects — top students get more
  const projectIdeas = [
    {t:'E-Commerce Platform',d:'Full-stack MERN e-commerce',ts:['React','Node.js','MongoDB']},
    {t:'AI Chatbot',d:'RAG-powered chatbot using LLMs',ts:['Python','FastAPI','ChromaDB']},
    {t:'Portfolio Website',d:'Personal portfolio with animations',ts:['Next.js','Framer Motion']},
    {t:'Social Dashboard',d:'Real-time analytics dashboard',ts:['React','Socket.io','Chart.js']},
    {t:'Task Manager API',d:'RESTful API with JWT auth',ts:['Express','MongoDB','JWT']},
    {t:'Weather App',d:'Weather forecast with API integration',ts:['React','OpenWeather API']},
    {t:'Blog Platform',d:'CMS with markdown support',ts:['Next.js','MongoDB','MDX']},
    {t:'ML Image Classifier',d:'CNN image classification model',ts:['Python','TensorFlow','Flask']},
    {t:'Chat Application',d:'Real-time chat with WebSockets',ts:['React','Node.js','Socket.io']},
    {t:'Expense Tracker',d:'Personal finance management app',ts:['React Native','Firebase']},
  ];
  const projectsBulk = [];
  students.forEach(student => {
    const numProjects = student.cgpa > 8 ? rand(2, 4) : student.cgpa > 6 ? rand(1, 2) : rand(0, 1);
    pick([...projectIdeas], numProjects).forEach(p => {
      projectsBulk.push({
        studentId: student._id, title: p.t, description: p.d,
        techStack: p.ts, status: Math.random() > 0.3 ? 'completed' : 'in-progress',
        semester: rand(2, student.semester),
        githubUrl: `https://github.com/${student.name.split(' ')[0].toLowerCase()}/${p.t.toLowerCase().replace(/ /g, '-')}`,
        aiResumePoints: Math.random() > 0.5 ? [`Built ${p.t.toLowerCase()} using ${p.ts.join(', ')} serving 100+ users`] : []
      });
    });
  });
  if (projectsBulk.length > 0) await Project.insertMany(projectsBulk);
  console.log(`✅ ${projectsBulk.length} projects created`);

  // Mock tests
  const mocksBulk = [];
  students.forEach(student => {
    if (student.cgpa > 6 && Math.random() > 0.4) {
      mocksBulk.push({
        studentId: student._id, testType: 'aptitude', subject: 'Quantitative',
        score: rand(40, 95), maxScore: 100, timeTaken: rand(30, 60), accuracy: rand(40, 95)
      });
    }
    if (student.cgpa > 7 && Math.random() > 0.5) {
      mocksBulk.push({
        studentId: student._id, testType: 'coding', subject: 'DSA',
        score: rand(50, 90), maxScore: 100, timeTaken: rand(45, 90), accuracy: rand(50, 90)
      });
    }
  });
  if (mocksBulk.length > 0) await MockTest.insertMany(mocksBulk);
  console.log(`✅ ${mocksBulk.length} mock tests created`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Demo Credentials:');
  console.log('  Students: NEEV2024001-050 / neev123');
  console.log('  Teacher:  teacher@neev.dev / neev123');
  process.exit(0);
};

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
