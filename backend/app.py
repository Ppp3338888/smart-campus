from flask import Flask, jsonify,request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import uuid
from datetime import datetime
cred = credentials.Certificate("firebase-key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)
CORS(app)  # allows React (localhost:5173) to talk to Flask


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
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    issue = {
        "title": data["title"],
        "description": data["description"],
        "locationName": data["locationName"],
        "lat": data["lat"],
        "lng": data["lng"],
        "category": data["category"],
        "priority": data["priority"],
        "status": "In Progress",
        "createdAt": datetime.utcnow().isoformat()
    }

    db.collection("issues").add(issue)
    return jsonify({"message": "Issue created"}), 201

@app.route("/api/issues/<issue_id>", methods=["DELETE"])
def delete_issue(issue_id):
    try:
        db.collection("issues").document(issue_id).delete()
        return jsonify({"message": "Issue deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/health")
def health():
    return jsonify({"status": "Backend running"})

if __name__ == "__main__":
    app.run(debug=True, port=5001)

