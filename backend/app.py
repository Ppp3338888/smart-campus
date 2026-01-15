from flask import Flask, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta, timezone
import os, json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# 🔐 Firebase init
firebase_key = json.loads(os.environ["FIREBASE_KEY"])
cred = credentials.Certificate(firebase_key)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)

# ✅ FIXED CORS CONFIGURATION
CORS(app, 
     resources={r"/api/*": {
         "origins": ["https://smart-campusproject.vercel.app", "http://localhost:5173"],
         "methods": ["GET", "POST", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "supports_credentials": False,
         "max_age": 3600
     }})

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
model = genai.GenerativeModel("gemini-2.5-flash-lite")

# ✅ ADD EXPLICIT OPTIONS HANDLER FOR ALL ROUTES
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route("/api/issues", methods=["GET", "OPTIONS"])
def get_issues():
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    issues_ref = db.collection("issues").stream()
    issues = []

    for doc in issues_ref:
        issue = doc.to_dict()
        issue["id"] = doc.id
        issue["createdAt"] = issue["createdAt"].isoformat()
        issues.append(issue)

    return jsonify(issues)


@app.route("/api/issues", methods=["POST", "OPTIONS"])
def create_issue():
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    data = request.get_json()

    issue = {
        "title": data["title"],
        "description": data["description"],
        "locationName": data["locationName"],
        "lat": data["lat"],
        "lng": data["lng"],
        "category": data["category"],
        "priority": data["priority"],
        "status": "In Progress",
        "createdAt": firestore.SERVER_TIMESTAMP
    }

    db.collection("issues").add(issue)
    return jsonify({"message": "Issue created"}), 201


@app.route("/api/issues/<issue_id>", methods=["DELETE", "OPTIONS"])
def delete_issue(issue_id):
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    db.collection("issues").document(issue_id).delete()
    return jsonify({"message": "Issue deleted"}), 200


@app.route("/api/health/report", methods=["POST", "OPTIONS"])
def report_health():
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    data = request.get_json()

    report = {
        "illnessType": data["illnessType"],     
        "symptoms": data.get("symptoms", []),      
        "severity": data.get("severity", "Mild"), 
        "location": data.get("location", "Unknown"),
        "reportedAt": firestore.SERVER_TIMESTAMP  
    }

    db.collection("health_reports").add(report)
    return jsonify({"message": "Health report submitted"}), 201


@app.route("/api/health/summary", methods=["GET", "OPTIONS"])
def health_summary():
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    TOTAL_CAMPUS_POPULATION = 1000

    now = datetime.now(timezone.utc)
    three_days_ago = now - timedelta(days=3)

    reports_ref = (
        db.collection("health_reports")
        .where("reportedAt", ">=", three_days_ago)
        .stream()
    )

    illness_count = {}
    recent_reports = 0

    for doc in reports_ref:
        data = doc.to_dict()
        recent_reports += 1

        illness = data.get("illnessType", "Other")
        illness_count[illness] = illness_count.get(illness, 0) + 1

    ill_percentage = round(
        (recent_reports / TOTAL_CAMPUS_POPULATION) * 100, 2
    ) if TOTAL_CAMPUS_POPULATION else 0

    MIN_CASES = 3

    DOMINANCE_THRESHOLDS = {
        "Viral": 0.4,
        "Vector-borne": 0.25,
        "Respiratory": 0.4,
        "Gastrointestinal": 0.3,
        "Other": 0.5
    }

    outbreak = None
    outbreak_stats = None

    for illness, count in illness_count.items():
        if count < MIN_CASES:
            continue

        dominance = count / recent_reports if recent_reports else 0
        threshold = DOMINANCE_THRESHOLDS.get(illness, 0.5)

        if dominance >= threshold:
            outbreak = illness
            outbreak_stats = {
                "cases": count,
                "dominance": round(dominance * 100, 1)
            }
            break

    return jsonify({
        "recentReported": recent_reports,
        "illPercentage": ill_percentage,
        "distribution": illness_count,
        "outbreakAlert": outbreak,
        "outbreakStats": outbreak_stats,
        "windowDays": 3
    })


@app.route("/api/health/chat", methods=["POST", "OPTIONS"])
def health_chat():
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    data = request.json

    user_message = data.get("message", "")
    chat_history = data.get("chatHistory", [])
    form_context = data.get("formContext", {})

    system_prompt = """
You are a world class doctor specializing in health and safety. Provide empathetic, accurate, and concise advice based on user inputs about their health symptoms and conditions. 
Use the provided form context to tailor your responses.
Keep responses under 100 words.
Anything outside health advice is out of scope—politely decline such requests.
"""

    form_prompt = f"""
Current form state:
- Illness type: {form_context.get("illnessType", "Not selected")}
- Severity: {form_context.get("severity", "Not selected")}
- Symptoms: {", ".join(form_context.get("symptoms", [])) or "None"}
- Location: {form_context.get("location", "Not specified")}
"""

    history_prompt = ""
    for msg in chat_history[-6:]:
        role = "User" if msg["role"] == "user" else "Assistant"
        history_prompt += f"{role}: {msg['text']}\n"

    final_prompt = f"""
{system_prompt}

{form_prompt}

Conversation so far:
{history_prompt}

User: {user_message}
Assistant:
"""

    try:
        response = model.generate_content(final_prompt)
        return jsonify({"reply": response.text.strip()})
    except Exception as e:
        return jsonify({"reply": "Sorry, I encountered an error. Please try again."}), 500


@app.route("/api/health", methods=["GET", "OPTIONS"])
def health():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    return jsonify({"status": "Backend running"})


if __name__ == "__main__":
    app.run(debug=True, port=5001)