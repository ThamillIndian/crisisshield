# 🚨 CrisisShield — AI-Powered Crisis Coordination System

> An AI-powered multi-agent emergency response system for hospitality venues, built for the Google Solution Challenge 2026.

---

## 🎯 Problem Statement

In hospitality venues (hotels), emergencies like fire, medical, and security threats lead to chaos due to fragmented communication. CrisisShield solves this with real-time AI-powered coordination..

---

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14, TailwindCSS, shadcn/ui, Leaflet.js |
| Backend | FastAPI, Python 3.11, Pydantic |
| AI | Gemini 3 Flash (Google), Sarvam AI (STT/TTS) |
| Database | Firebase Firestore, Firebase Auth, FCM |
| Deployment | Vercel (frontend), Google Cloud Run (backend) |

---

## 📁 Project Structure

```
crisis-shield/
├── frontend/       # Next.js app (Guest, Staff, Admin portals)
├── backend/        # FastAPI app (AI agents, API routes)
├── firebase/       # Firestore rules and indexes
└── .github/        # CI/CD workflows
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Firebase project
- Gemini API key
- Sarvam AI API key

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

---

## 🌍 SDG Alignment

- **SDG 11** — Sustainable Cities and Communities
- **SDG 3** — Good Health and Well-Being

---

## 🔑 Environment Variables

See `.env.example` for all required environment variables.

---

## 👥 User Roles

| Role | Access |
|---|---|
| Guest | Report emergency, receive evacuation route |
| Staff | Receive task assignments, update task status |
| Admin | Full command center dashboard |

---

## 🏆 Google Solution Challenge 2026
