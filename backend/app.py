import os
import json
import fitz
import requests

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Environment Variables
# -----------------------------
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")

if not N8N_WEBHOOK_URL:
    raise RuntimeError(
        "N8N_WEBHOOK_URL environment variable is not set."
    )

# -----------------------------
# Home
# -----------------------------
@app.get("/")
def home():
    return {
        "message": "AI Resume Analyzer Backend Running 🚀"
    }


# -----------------------------
# Analyze Resume
# -----------------------------
@app.post("/analyze-resume")
async def analyze_resume(

    name: str = Form(...),
    email: str = Form(...),
    resume: UploadFile = File(...)

):

    try:

        # Read PDF
        pdf_bytes = await resume.read()

        # Extract Text
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        resume_text = ""

        for page in doc:
            resume_text += page.get_text()

        doc.close()

        payload = {

            "name": name,
            "email": email,
            "resume_text": resume_text

        }

        # Send to n8n
        response = requests.post(

            N8N_WEBHOOK_URL,

            json=payload,

            timeout=120

        )

        response.raise_for_status()

        result = response.json()

        # If AI Agent returns JSON string
        if "output" in result:

            try:

                result = json.loads(result["output"])

            except:

                pass

        return result

    except requests.exceptions.RequestException as e:

        return {

            "success": False,

            "message": "Unable to connect to AI Workflow.",

            "error": str(e)

        }

    except Exception as e:

        return {

            "success": False,

            "message": "Something went wrong while analyzing resume.",

            "error": str(e)

        }