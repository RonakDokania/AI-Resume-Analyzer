# 🚀 AI Resume Analyzer

An AI-powered Resume Analyzer that evaluates resumes, calculates ATS compatibility, identifies strengths and weaknesses, recommends improvements, and suggests suitable job roles using **FastAPI**, **n8n**, and **Google Gemini AI**.

---

## 📌 Features

- 📄 Upload Resume (PDF)
- 🤖 AI-powered Resume Analysis
- 📊 Overall Resume Score
- 🎯 ATS Compatibility Score
- 💻 Technical Skills Score
- 📝 Communication Score
- ✅ Resume Strengths
- ❌ Resume Weaknesses
- 🚀 Improvement Suggestions
- 🔍 Missing Skills Detection
- 💼 Recommended Job Roles
- ✨ AI Generated Professional Summary
- 🌙 Modern Responsive UI

---

# 🛠 Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- FastAPI
- Python
- Requests
- PyMuPDF

### Automation

- n8n

### AI

- Google Gemini AI

### Version Control

- Git
- GitHub

---

# 📂 Project Structure

```
AI-Resume-Analyzer/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│
├── n8n/
│   └── workflow.json
│
├── screenshots/
│
├── README.md
├── LICENSE
└── .gitignore
```

---

# ⚙️ Installation

## 1 Clone Repository

```bash
git clone https://github.com/RonakDokania/AI-Resume-Analyzer.git
```

---

## 2 Go inside project

```bash
cd AI-Resume-Analyzer
```

---

## 3 Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create `.env`

```env
N8N_WEBHOOK_URL=YOUR_N8N_WEBHOOK_URL
```

Run Backend

```bash
uvicorn app:app --reload
```

Backend runs on

```
http://127.0.0.1:8000
```

---

## 4 Frontend

Open

```
frontend/index.html
```

using Live Server.

---

# 🔄 Workflow

```
User Upload Resume
        │
        ▼
Frontend
        │
        ▼
FastAPI Backend
        │
        ▼
Extract Resume Text
        │
        ▼
n8n Workflow
        │
        ▼
Google Gemini AI
        │
        ▼
Resume Analysis
        │
        ▼
Frontend Dashboard
```

---

# 📊 Analysis Includes

- Overall Score
- ATS Score
- Technical Score
- Communication Score
- Strengths
- Weaknesses
- Missing Skills
- Suggestions
- Recommended Roles
- Improved Resume Summary

---

# 📸 Screenshots

## Home

> Add screenshot here

---

## Analysis Dashboard

> Add screenshot here

---

## Loading Screen

> Add screenshot here

---

# 🚀 Future Enhancements

- Resume vs Job Description Matching
- AI Cover Letter Generator
- Resume History
- Authentication
- Dark Mode
- Download PDF Report
- Multi-language Support
- Interview Question Generator
- Resume Templates
- LinkedIn Profile Analyzer

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Ronak Dokania**

GitHub

https://github.com/RonakDokania

---

# ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.