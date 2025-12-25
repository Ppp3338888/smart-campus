from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allows React (localhost:5173) to talk to Flask

# Dummy data (later replace with Firebase + Gemini)
issues = [
    {"id": 1, "title": "Broken Light in Hostel B", "status": "Ongoing", "priority": "Medium"},
    {"id": 2, "title": "Water Leakage near Mess", "status": "Resolved", "priority": "Low"}
]

@app.route("/api/issues", methods=["GET"])
def get_issues():
    return jsonify(issues)

@app.route("/api/report", methods=["POST"])
def report_issue():
    # later you will accept JSON from React
    return jsonify({"message": "Issue received"}), 201

@app.route("/api/health")
def health():
    return jsonify({"status": "Backend running"})

if __name__ == "__main__":
    app.run(debug=True, port=5001)

