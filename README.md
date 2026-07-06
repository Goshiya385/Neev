## Docker Setup (Local Development)

This project is fully containerized using Docker and Docker Compose, running three services:
- Frontend (Next.js) - port 3000
- Backend (Node.js/Express) - port 5000
- ML Service (FastAPI/Python) - port 8000

### Run locally
docker-compose up --build

Then visit:
- Frontend: http://localhost:3000
- Backend health check: http://localhost:5000/api/health
- ML service docs: http://localhost:8000/docs

# 🌱 NEEV — AI-Powered Engineering Student Growth Ecosystem

> **"Academic comeback starts here 💀"**

NEEV (नींव) is an intelligent engineering growth companion that tracks academic performance, technical skills, placement readiness, and provides AI mentorship from Semester 1 to Semester 6.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Next.js 14    │◄──►│  Express.js API   │◄──►│  Python FastAPI   │
│   Frontend      │    │  Backend          │    │  ML Service       │
│   Port 3000     │    │  Port 5000        │    │  Port 8000        │
└─────────────────┘    └──────┬───────────┘    └──────────────────┘
                              │
                       ┌──────▼───────┐
                       │  MongoDB     │
                       │  Atlas       │
                       └──────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account
- Groq API key (free at console.groq.com)

### 1. Backend
```bash
cd backend
npm install
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 2. ML Service
```bash
cd ml-service
pip install -r requirements.txt
# Set GROQ_API_KEY environment variable
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000** 🎉

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0A0F0D` | Main background |
| `--surface` | `#141F1A` | Card surfaces |
| `--accent` | `#F5A623` | Primary saffron amber |
| `--accent2` | `#4ADE80` | Success green |
| `--danger` | `#F87171` | Risk/error red |
| `--info` | `#60A5FA` | Info blue |

**Fonts:** Syne (headings) + DM Sans (body)

## 📱 Features

- **📊 Dashboard** — CGPA trends, insights, placement readiness
- **📚 Academics** — Subject tracking, attendance heatmap, weak area detection
- **🛠️ Skills** — Visual progress tracker across 5 categories
- **🗺️ Roadmap** — Semester milestones personalized to career goal
- **📋 Planner** — Weekly tasks with micro-task breakdown
- **💻 Projects** — Lab with AI-generated resume bullet points
- **🎯 Placement** — Readiness score, company packs, mock test tracking
- **🎤 Interview** — Company-specific prep (TCS, Infosys, Amazon, Google)
- **📄 Resume** — Auto-generated from your NEEV data
- **🤖 Saarthi AI** — RAG-powered mentor chat (Groq + ChromaDB)
- **🔮 What-If** — Simulate academic decisions
- **📈 Report** — Spotify Wrapped-style semester summary
- **👨‍🏫 Teacher** — Batch analytics, risk alerts, student management

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts |
| Backend | Express.js, Mongoose, JWT, bcrypt |
| ML Service | FastAPI, scikit-learn, ChromaDB |
| LLM | Groq API (llama3-70b-8192) |
| Database | MongoDB Atlas |
| Deployment | Vercel + Railway + MongoDB Atlas |

## 📁 Project Structure

```
neev/
├── frontend/          # Next.js 14 App Router
│   ├── app/           # 15+ pages
│   ├── components/    # Shared + feature components
│   ├── hooks/         # Custom React hooks
│   └── lib/           # API clients, auth, types
├── backend/           # Express.js REST API
│   ├── models/        # 10 Mongoose schemas
│   ├── routes/        # 12 route modules
│   ├── services/      # Business logic engines
│   └── middleware/     # Auth + role check
├── ml-service/        # Python FastAPI
│   ├── routers/       # Prediction, What-If, Patterns, Saarthi
│   └── services/      # ML models, LLM, RAG
└── docker-compose.yml
```

## 🔐 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
GROQ_API_KEY=your_key
ML_SERVICE_URL=http://localhost:8000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ML_URL=http://localhost:8000
```

## 🐳 Docker

```bash
docker-compose up --build
```

---

Built with 💛 for engineering students who refuse to give up.
