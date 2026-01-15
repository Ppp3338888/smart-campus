from flask import Flask, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os, json
from dotenv import load_dotenv

load_dotenv()

firebase_key = json.loads(os.environ["FIREBASE_KEY"])
cred = credentials.Certificate(firebase_key)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)
CORS(app)



@app.route("/api/issues", methods=["GET"])
def get_issues():
    issues_ref = db.collection("issues").stream()
    issues = []

    for doc in issues_ref:
        issue = doc.to_dict()
        issue["id"] = doc.id
        issues.append(issue)

    return jsonify(issues)


@app.route("/api/issues", methods=["POST"])
def create_issue():
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


@app.route("/api/issues/<issue_id>", methods=["DELETE"])
def delete_issue(issue_id):
    db.collection("issues").document(issue_id).delete()
    return jsonify({"message": "Issue deleted"}), 200


@app.route("/api/health/report", methods=["POST"])
def report_health():
    data = request.get_json()

    report = {
        "illnessType": data["illnessType"],        # string
        "symptoms": data.get("symptoms", []),      # array<string>
        "severity": data.get("severity", "Mild"), # string
        "location": data.get("location", "Unknown"),
        "reportedAt": firestore.SERVER_TIMESTAMP 
    }

    db.collection("health_reports").add(report)
    return jsonify({"message": "Health report submitted"}), 201


@app.route("/api/health/summary", methods=["GET"])
def health_summary():
    reports = list(db.collection("health_reports").stream())

    TOTAL_CAMPUS_POPULATION = 1200  
    illness_count = {}
    total_reports = len(reports)

    for doc in reports:
        illness = doc.to_dict().get("illnessType", "Other")
        illness_count[illness] = illness_count.get(illness, 0) + 1

    ill_percentage = round(
        (total_reports / TOTAL_CAMPUS_POPULATION) * 100, 2
    ) if TOTAL_CAMPUS_POPULATION else 0

    outbreak = None
    for illness, count in illness_count.items():
        if illness == "Viral" and count >= 15:
            outbreak = "Viral"
        if illness == "Vector-borne" and count >= 5:
            outbreak = "Vector-borne"

    return jsonify({
        "totalReported": total_reports,
        "illPercentage": ill_percentage,
        "distribution": illness_count,
        "outbreakAlert": outbreak
    })


@app.route("/api/health")
def health():
    return jsonify({"status": "Backend running"})


if __name__ == "__main__":
    app.run(debug=True, port=5001)
