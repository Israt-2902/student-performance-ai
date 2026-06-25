from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os
import datetime
from pymongo import MongoClient
from google import genai
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. DATABASE CONFIGURATION

try:
    db_client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000
    )

    # Check if connection is successful
    db_client.server_info()

    db = db_client["student_performance_db"]

    logs_collection = db["prediction_logs"]

    db_online = True

    print("✅ MongoDB Connected Successfully!")

except Exception as e:
    logs_collection = None
    db_online = False

    print("❌ MongoDB Connection Failed!")
    print(e)

# 2. GENERATIVE AI CHATBOT LAYER CONFIGURATION

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

try:
    if GEMINI_API_KEY:

        client = genai.Client(api_key=GEMINI_API_KEY)

        SYSTEM_PROMPT = """
You are an expert university academic advisor.

Give encouraging, practical and personalized study advice.

Keep answers under 4 sentences.

If students feel stressed, motivate them positively.

Focus on study habits, attendance, participation and exam preparation.
"""

        ai_enabled = True
        print("🤖 Gemini Connected Successfully!")

    else:
        ai_enabled = False
        print("❌ GEMINI_API_KEY not found in .env")

except Exception as e:
    ai_enabled = False
    print("Gemini Initialization Error:")
    print(e)

# 3. LOAD RANDOM FOREST MODEL ATTRIBUTES
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "student_grade_predictor.pkl")
model = joblib.load(model_path)

class StudentData(BaseModel):
    weekly_self_study_hours: float
    attendance_percentage: float
    class_participation: float

class ChatInput(BaseModel):
    message: str

@app.get("/")
def home():
    return {"message": "All Engines Operational. ML Core + NoSQL Logs + Chatbot AI Active."}

# [ML PREDICTION ENGINE]
@app.post("/predict")
def predict_grade(data: StudentData):
    features = np.array([[data.weekly_self_study_hours, data.attendance_percentage, data.class_participation]])
    prediction = model.predict(features)[0]
    
    if logs_collection is not None:
        try:
            logs_collection.insert_one({
                "weekly_self_study_hours": data.weekly_self_study_hours,
                "attendance_percentage": data.attendance_percentage,
                "class_participation": data.class_participation,
                "predicted_grade": prediction,
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
        except Exception:
            pass
            
    return {"predicted_grade": prediction}

@app.get("/history")
def get_prediction_history():
    if logs_collection is None: return []
    try:
        return list(logs_collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(15))
    except Exception: return []

# 4. THE LIVE CHATBOT GATEWAY ROUTE
@app.post("/chat")
def chat_with_advisor(data: ChatInput):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"""
{SYSTEM_PROMPT}

Student:
{data.message}
"""
        )

        return {"reply": response.text}

    except Exception as e:
        return {
            "reply": f"AI service is temporarily unavailable.\n\nError: {e}"
        }
# connection 
@app.post("/predict-and-advise")
def predict_and_advise(data: StudentData):

    features = np.array([[
        data.weekly_self_study_hours,
        data.attendance_percentage,
        data.class_participation
    ]])

    prediction = model.predict(features)[0]

    advice = "AI service unavailable."

    if ai_enabled:
        try:

            prompt = f"""
You are an experienced university academic advisor.

A student's academic information is:

Weekly Study Hours: {data.weekly_self_study_hours}

Attendance: {data.attendance_percentage}%

Class Participation: {data.class_participation}/10

Predicted Grade: {prediction}

Provide:

1. Explain why the student probably received this grade.

2. Identify the biggest weakness.

3. Give 5 practical recommendations.

4. Estimate what improvements are needed to reach Grade B.

Keep the answer friendly and encouraging.
"""

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            advice = response.text

        except Exception as e:
            advice = str(e)

    return {
        "predicted_grade": prediction,
        "ai_advice": advice
    }