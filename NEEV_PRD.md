# नींव NEEV — Product Requirements Document (PRD)
### AI-Driven Personalized Academic Growth Ecosystem
**Version:** 3.0 | **Date:** May 2026

---

## 1. Executive Summary

**NEEV (नींव — Foundation)** is a full-stack, AI-powered academic intelligence platform for Indian engineering students. It transforms raw academic data into **actionable, personalized insights** using Machine Learning and Large Language Models.

> *"What if every engineering student had a personal AI mentor who knew their marks, tracked their growth, and guided them in Hinglish?"*

---

## 2. Problem Statement

| Problem | Impact |
|---------|--------|
| Students don't know which skills to focus on | Wasted effort on irrelevant topics |
| No early warning for academic failure | Students realize too late they're at risk |
| Generic career advice doesn't work | Every student's path is different |
| Placement prep is scattered | No unified platform connecting academics → placements |
| Mental health is ignored | Stress goes unaddressed until crisis |
| Language barrier with AI tools | ChatGPT speaks formal English, not relatable Hinglish |

---

## 3. Architecture

```
┌─────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│  🖥️ FRONTEND            │   │  ⚙️ BACKEND              │   │  🤖 ML SERVICE           │
│  Next.js 14 + TS        │──▶│  Express.js + MongoDB    │──▶│  FastAPI + Python        │
│  Port 3000              │   │  Port 5000               │   │  Port 8000               │
│  Framer Motion          │   │  JWT Auth + Mongoose     │   │  scikit-learn + Groq     │
│  Recharts               │   │  Resend Email            │   │  ChromaDB RAG            │
└─────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘
```

---

## 4. Complete Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with SSR, file-based routing |
| **TypeScript** | Type-safe JavaScript |
| **Framer Motion** | Premium micro-animations |
| **Recharts** | CGPA trend charts, progress rings |
| **Axios** | HTTP client with interceptors |
| **js-cookie** | JWT token persistence |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Express.js** | Node.js web framework |
| **MongoDB Atlas** | Cloud NoSQL database |
| **Mongoose** | MongoDB ODM with schema validation |
| **JWT** | Stateless authentication (7-day tokens) |
| **bcryptjs** | Password hashing (12 salt rounds) |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | 200 req/15min rate limiting |
| **Resend** | Email delivery for weekly reports |
| **Nodemon** | Hot reload dev server |

### ML / AI Service
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | Async Python API framework |
| **scikit-learn** | ML algorithms (RF, KMeans, IsolationForest) |
| **NumPy** | Numerical computing |
| **Groq API** | Ultra-fast LLM inference (< 500ms) |
| **LLaMA 3.3 70B** | Open-source Large Language Model |
| **ChromaDB** | Vector database for RAG |

### DevOps
| Technology | Purpose |
|-----------|---------|
| **Docker + docker-compose** | Container orchestration |
| **n8n** | Workflow automation (weekly reports) |

---

## 5. All 22 Features — Detailed

### 5.1 🏠 Landing Page
- Cinematic SVG plant growth animation (नींव = foundation → plant)
- Dark forest green premium agency design
- Staggered Framer Motion entrance animations

### 5.2 🔐 Authentication
- Student login: Roll number + password
- Teacher login: Email + password
- JWT token (7-day expiry) in HTTP cookie
- bcryptjs password hashing (12 rounds)

### 5.3 📋 Onboarding (4-Step Wizard)
1. Personal Info (name, email, phone)
2. Academic Info (branch, semester, college)
3. Career Goal (12 options)
4. Tech Profile (languages, frameworks, tools, GitHub/LinkedIn)
- Data indexed into ChromaDB for RAG

### 5.4 📊 Dashboard
- Time-based greeting ("Good morning, Rahul")
- **Daily Check-in Card** — mood emoji, study hours, worked-on input
- 4 Key Metrics — CGPA, Placement%, Backlogs, Streak
- Growth Circles — Animated SVG rings
- CGPA Trend Chart — Recharts line graph
- AI Predictions — Next CGPA, backlog risk, placement timeline
- Rotating Insights — Auto-cycling tips every 30s
- Saarthi Quick Insight — AI Hinglish tip
- Roadmap Progress + Weekly Tasks

### 5.5 📚 Academics
- Add marks: Subject, semester, internal/external/practical
- Add attendance: Subject, total/attended classes
- AI pattern detection — weak subjects flagged
- ML: Random Forest CGPA prediction + backlog risk

### 5.6 🛠️ Skills
- Log skills with category, proficiency%, confidence
- **AI Skill Gap Analysis:** readiness%, months-to-ready, missing/weak skills
- **🔥 Trending Technologies Section:**
  - 15 skills with demand levels (Critical/Very High/High)
  - HOT badges on trending skills
  - Click-to-expand resource panels:
    - 📺 YouTube channels (Striver, TraversyMedia, NeetCode...)
    - 📖 Documentation links
    - 🎓 Free course links
  - Mapped to career goals

### 5.7 🗺️ Roadmap
- Input career goal + weekly hours
- AI generates phased roadmap with milestones
- Progress tracking per milestone

### 5.8 📋 Planner
- Weekly task management with categories + priorities
- AI-generated weekly plan
- Streak tracking (consecutive active days)
- GitHub-style activity heatmap

### 5.9 💻 Projects
- CRUD: Title, description, tech stack, status, URLs
- **AI Resume Points:** Groq generates 3-4 ATS bullet points

### 5.10 🎯 Placement
- Multi-factor Placement Score:
  - DSA (30%) + Projects (25%) + Communication (20%) + CGPA (15%) + Certs (10%)
- Company eligibility: TCS, Infosys, Amazon, Google
- Mock test history tracking
- AI Placement Survival Probability

### 5.11 🎤 Interview Prep (NEW)
- **Web Speech API** — real-time speech capture (Chrome/Edge)
- Company-specific questions: TCS, Infosys, Amazon, Google, General
- **AI Communication Judge (Groq LLM):**
  - Grammar (0-10), Clarity (0-10), Confidence (0-10), Relevance (0-10)
  - Filler word count (um, uh, like, basically...)
  - Words per minute + pace assessment
  - Vocabulary level (basic/intermediate/advanced)
  - Strengths, weaknesses, improvement tips
  - Sample better answer
  - **Gen Z verdict** ("Main character energy detected ✨")
- Animated SVG score rings
- Fallback: text input if speech unavailable

### 5.12 📄 Resume
- Auto-generated ATS-ready resume from student data
- AI bullet points from project descriptions

### 5.13 🤖 Saarthi AI (Core Feature)
- **Hinglish AI Chatbot** — speaks like a supportive senior
- **SSE Streaming** — token-by-token real-time response
- **RAG-Powered** — knows student's actual marks, skills, projects
- **Persistent History** — MongoDB ChatHistory model
- **Context-Aware** — last 10 messages + student profile + ChromaDB
- **Fallback** — rule-based responses when Groq unavailable

### 5.14 💚 Safe Space
- Mood tracker
- Guided box breathing animation
- AI mental health support (Groq)
- Stress keyword recognition

### 5.15 🚀 Career AI
- Higher Studies vs Job path comparison
- Trending technology analysis
- AI career path intelligence
- Weekly career reflection

### 5.16 🔮 What-If Simulator
- Scenario 1: Improve marks → projected CGPA increase
- Scenario 2: Fail subject → CGPA drop + backlog impact
- Scenario 3: Change goal → new roadmap generation

### 5.17 👤 Profile (NEW)
- Profile picture upload (base64 localStorage)
- Editable: name, email, phone, branch, semester, college, goal
- Tech stack tags (languages, frameworks, tools)
- Soft skills SVG rings (English, Communication, Aptitude, Interview)
- **Gen Z Titles:**

| Performance | Title |
|------------|-------|
| CGPA ≥ 9.0 | Absolute Slayer 💅 |
| CGPA ≥ 8.0 | Main Character Energy ✨ |
| Streak ≥ 20 | No Cap Grinder 🔥 |
| CGPA ≥ 7.0 | Slay Mode: ON 💫 |
| Placement ≥ 70% | Corporate Girlie Era 💼 |
| CGPA ≥ 6.0 | Lowkey Goated 🐐 |
| CGPA ≥ 5.0 | Redemption Arc Loading 🎬 |
| Default | Origin Story Phase 🌱 |

- Vibe Check section with Gen Z slangs

### 5.18 🔔 Notifications Hub (NEW)
- Tabs: All | Reminders | Weekly | AI Nudges | Teacher
- Unread badge in sidebar
- Mark all read
- Smart reminders

### 5.19 💬 Feedback (Enhanced)
- Submit: content, target type, rating, anonymous toggle
- **AI Sentiment Analysis (Groq):**
  - Label: positive/negative/neutral/mixed
  - Emotion emoji: 😊 😤 😰 💪 😕 😌 😞
  - Confidence score %
  - Keywords extracted
  - AI summary
- History tab with sentiment badges

### 5.20 📈 Report
- Spotify Wrapped-style semester report
- Visual stats, achievements, improvement areas

### 5.21 ✅ Daily Check-in (NEW)
- Emoji mood selector: 😄😊😐😰😞
- Study hours + "worked on" input
- Smart time-based prompts (morning/afternoon/evening)
- One check-in per day (upsert)
- Stats: weekly hours, avg mood, productivity

### 5.22 👨‍🏫 Teacher Dashboard
- Student list with CGPA, semester
- AI risk alerts (Isolation Forest anomaly detection)
- Individual student deep-dive
- Teacher → Student notifications
- Aggregate sentiment dashboard

---

## 6. ML/AI Algorithms — Deep Dive

### 6.1 Linear Regression + Ridge (CGPA Trend)
- **Input:** Semester-wise SGPA [6.5, 7.0, 7.3, 7.8]
- **Model:** `LinearRegression()` + `Ridge(alpha=1.0)` backup
- **Output:** Next semester SGPA + trend direction
- **File:** `ml-service/services/linear_model.py`

### 6.2 Random Forest + Gradient Boosting (CGPA Prediction)
- **Input:** Marks matrix, attendance, skills, projects, streaks
- **Model:** `RandomForestRegressor(n_estimators=100)` + `GradientBoostingRegressor`
- **Output:** Predicted CGPA (60% RF + 40% GBR weighted ensemble)
- **File:** `ml-service/services/rf_model.py`

### 6.3 K-Means Clustering (Student Grouping)
- **Input:** [CGPA, attendance%, skill_count, backlog_count]
- **Model:** `KMeans(n_clusters=4)`
- **Output:** "high-risk" | "below-average" | "average" | "top-performer"
- **File:** `ml-service/services/clustering.py`

### 6.4 Isolation Forest (Anomaly Detection)
- **Input:** Student feature vector
- **Model:** `IsolationForest(contamination=0.1)`
- **Output:** is_anomaly + anomaly_score (at-risk student detection)
- **File:** `ml-service/services/anomaly.py`

### 6.5 RAG (Retrieval-Augmented Generation)
```
1. Student data (marks, skills, projects) → text documents
2. Documents → ChromaDB vector embeddings (persistent SQLite)
3. Query → ChromaDB similarity search → top 6 relevant docs
4. System prompt + profile + RAG context → Groq LLaMA 3.3 70B
5. Personalized response (knows YOUR actual data)
```
- **File:** `ml-service/services/rag_service.py`
- **Database:** `ml-service/vectorstore/chroma_db/chroma.sqlite3`

### 6.6 Groq LLaMA 3.3 70B (LLM)
- **Used in:** Chat, sentiment, career, interview, strategy, reflections
- **Config:** temperature=0.7, max_tokens=1024
- **Speed:** < 500ms (Groq custom LPU hardware)
- **File:** `ml-service/services/llm_service.py`

---

## 7. Database Schemas (MongoDB)

**13 Mongoose Models:**
`Student`, `Marks`, `Attendance`, `SkillProgress`, `Project`, `WeeklyTask`, `Notification`, `ChatHistory`, `Feedback`, `MockTest`, `RoadmapProgress`, `Teacher`, `CheckIn`

### Key Schema: Student
```
rollNumber, password(hashed), name, email, branch, semester,
careerGoal, cgpa, backlogs, placementReadiness, currentStreak,
techProfile{languages, frameworks, tools, github, linkedin},
softSkills{english, communication, aptitude, interview}
```

---

## 8. API Count: 50+ Endpoints

| Service | Routes | Endpoints |
|---------|--------|-----------|
| Backend | 15 route files | 35+ REST APIs |
| ML Service | 9 routers | 20+ ML/AI APIs |

---

## 9. Security

| Layer | Implementation |
|-------|---------------|
| Passwords | bcryptjs (12 salt rounds) |
| Auth | JWT tokens (7-day expiry) |
| HTTP | Helmet.js security headers |
| Rate Limit | 200 req/15min per IP |
| CORS | Frontend-only origin |
| Roles | student vs teacher middleware |
| API Keys | Environment variables only |

---

## 10. Design System

| Element | Specification |
|---------|--------------|
| Theme | Dark forest green (#0A1F11) |
| Primary | Gold/Amber (#F5A623) |
| Typography | Syne (headings) + DM Sans (body) |
| Borders | 2px, sharp corners |
| Animations | Framer Motion staggered entrance |
| Style | Premium agency aesthetic |

---

## 11. USPs (Hackathon Pitch Points)

1. 🗣️ **Hinglish AI Mentor** — First academic AI that talks like an Indian senior
2. 🎤 **Speech Interview Prep** — Real-time speech → AI communication scoring
3. 🧠 **6 ML Algorithms** — RF, GBR, KMeans, IsolationForest, Linear, Ridge
4. 📚 **RAG Context** — Saarthi knows YOUR actual marks, not generic advice
5. 💅 **Gen Z Personality** — "Absolute Slayer" titles, vibe checks, relatable
6. 📊 **3-Service Microservices** — Production-grade architecture
7. 🔥 **SSE Streaming Chat** — Token-by-token, not wait-and-display
8. 🤖 **Anomaly Detection** — AI auto-flags at-risk students
9. 💚 **Mental Health** — Safe Space with breathing + AI support
10. 📧 **Auto Reports** — Weekly AI email reports (n8n + Resend)

---

## 12. System Stats

| Metric | Count |
|--------|-------|
| Frontend Pages | 22 |
| Backend Routes | 15 |
| Database Models | 13 |
| ML Service Files | 22 |
| API Endpoints | 50+ |
| ML Algorithms | 6 |
| External APIs | 3 (Groq, Resend, ChromaDB) |
| Lines of Code | ~8,000+ |
| RAG Documents | 46 indexed |
| Seeded Students | 50 |

---

## 13. Future Scope

- 📱 React Native mobile app
- 🎮 Gamification (XP, levels, leaderboards)
- 👥 Peer study group matching
- 📹 Video interview recording + analysis
- 🏫 Multi-college deployment
- 🔗 LMS integration (Google Classroom)
- 🌐 Multi-language (Hindi, Tamil, Telugu)
