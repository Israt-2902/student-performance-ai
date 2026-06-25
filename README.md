# 🎓 Student Performance AI

An AI-powered student performance prediction system that uses Machine Learning to predict academic grades and Google Gemini AI to provide personalized study recommendations.

## 📸 Preview

<img width="1338" height="618" alt="image" src="https://github.com/user-attachments/assets/1c61135e-3b54-42d9-bcec-17a461b0b44b" />


## 🚀 Features

* Predicts grades (A, B, C, D, F)
* AI-powered academic advisor (Gemini 2.5 Flash)
* Prediction history with MongoDB Atlas
* FastAPI backend
* React + Tailwind CSS frontend

## 🛠️ Tech Stack

* React.js
* FastAPI
* Python
* Scikit-learn
* MongoDB Atlas
* Google Gemini 2.5 Flash

## ⚙️ Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Environment Variables

Create a `.env` file inside the `backend` folder:

```env
GEMINI_API_KEY=YOUR_API_KEY
MONGO_URI=YOUR_MONGODB_URI
```

## 📌 Note

The trained model (`student_grade_predictor.pkl`) is not included in this repository because it exceeds GitHub's file size limit.

To run the project, place the trained model inside the `backend` folder.

## 👨‍💻 Author

**Israt Jahan**

