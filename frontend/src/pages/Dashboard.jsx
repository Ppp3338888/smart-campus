import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  GoogleMap,
  Marker,
  useLoadScript
} from "@react-google-maps/api";

/* 📍 Campus center */
const CAMPUS_CENTER = { lat: 26.0812, lng: 91.5620 };
const deleteIssue = async id => {
  const ok = window.confirm("Are you sure you want to delete this issue?");
  if (!ok) return;

  await fetch(`http://localhost:5001/api/issues/${id}`, {
    method: "DELETE"
  });

  // remove from UI immediately
  setIssues(prev => prev.filter(issue => issue.id !== id));
};


/* 🎯 Marker icons by priority */
const priorityIcon = priority => {
  const base = "https://maps.google.com/mapfiles/ms/icons/";
  const map = {
    Low: "green-dot.png",
    Medium: "yellow-dot.png",
    High: "red-dot.png",
    Emergency: "purple-dot.png"
  };
  return { url: base + (map[priority] || "blue-dot.png") };
};

export default function Dashboard() {
  const [issues, setIssues] = useState([]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY
  });

  useEffect(() => {
    fetch("http://localhost:5001/api/issues")
      .then(res => res.json())
      .then(setIssues);
  }, []);

  /* 🔢 Summary counts */
  const ongoing = issues.filter(
    i => i.status === "Submitted" || i.status === "In Progress"
  ).length;

  const resolved = issues.filter(i => i.status === "Resolved").length;
  const high = issues.filter(i => i.priority === "High").length;
  const emergency = issues.filter(i => i.priority === "Emergency").length;

  return (
    <> <Navbar />
      <div style={styles.page}>


        {/* 🔢 SUMMARY */}
        <div style={styles.statsGrid}>
          <StatCard title="Ongoing Issues" value={ongoing} color="#1a73e8" />
          <StatCard title="Resolved" value={resolved} color="#137333" />
          <StatCard title="High Priority" value={high} color="#f29900" />
          <StatCard title="Emergency" value={emergency} color="#d93025" />
        </div>

        {/* 📋 LIST + 🗺️ MAP */}
        <div style={styles.mainGrid}>
          {/* LEFT */}
          <div style={styles.card}>
            <h2>Recent Campus Issues</h2>

            {issues.map(issue => (
              <div key={issue.id} style={styles.issue}>
                <div>
                  <h4>{issue.title}</h4>

                  <p style={styles.meta}>
                    {issue.locationName} • {issue.category}
                  </p>


                  <span style={{ ...styles.status, ...statusColor(issue.status) }}>
                    {issue.status}
                  </span>
                </div>

                <div style={styles.rightActions}>
                  <span style={{ ...styles.priority, ...priorityColor(issue.priority) }}>
                    {issue.priority}
                  </span>

                  <button
                    onClick={() => deleteIssue(issue.id)}
                    style={styles.deleteBtn}
                    title="Delete issue"
                  >
                    🗑️
                  </button>
                </div>
              </div>

            ))}
          </div>

          {/* RIGHT */}
          <div style={styles.mapCard}>
            <h2>Live Map</h2>

            <div style={styles.mapWrapper}>
              {isLoaded && (
                <GoogleMap
                  zoom={16}
                  center={CAMPUS_CENTER}
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                >
                  {issues.map(issue => (
                    <Marker
                      key={issue.id}
                      position={{ lat: issue.lat, lng: issue.lng }}
                      icon={priorityIcon(issue.priority)}
                    />
                  ))}
                </GoogleMap>
              )}
            </div>

            {/* 🗂️ Legend */}
            <div style={styles.legend}>
              <LegendItem color="green" label="Low" />
              <LegendItem color="gold" label="Medium" />
              <LegendItem color="red" label="High" />
              <LegendItem color="purple" label="Emergency" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* 🧱 Components */

function StatCard({ title, value, color }) {
  return (
    <div style={styles.statCard}>
      <h3 style={{ color }}>{value}</h3>
      <p>{title}</p>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={styles.legendItem}>
      <span style={{ ...styles.legendDot, background: color }} />
      {label}
    </div>
  );
}

/* 🎨 Styles */

const styles = {
  page: {
    background: "#f6f8fc",
    minHeight: "100vh",
    padding: "20px"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },

  statCard: {
    background: "white",
    padding: "18px",
    borderRadius: "12px",
    textAlign: "center"
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px"
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px"
  },

  issue: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 0",
    borderBottom: "1px solid #eee"
  },

  meta: {
    color: "#666",
    fontSize: "14px"
  },

  time: {
    fontSize: "12px",
    color: "#999",
    marginBottom: "6px"
  },

  status: {
    display: "inline-block",
    marginTop: "6px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px"
  },
  rightActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  deleteBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: "#d93025"
  },
  priority: {
    height: "fit-content",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px"
  },

  mapCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px"
  },

  mapWrapper: {
    height: "420px",
    borderRadius: "10px",
    overflow: "hidden",
    marginTop: "10px"
  },

  legend: {
    display: "flex",
    gap: "14px",
    marginTop: "12px",
    flexWrap: "wrap",
    fontSize: "13px"
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },

  legendDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%"
  }
};

/* 🎨 Helpers */

const priorityColor = p => ({
  High: { background: "#fdecea", color: "#d93025" },
  Medium: { background: "#fff4e5", color: "#f29900" },
  Low: { background: "#e6f4ea", color: "#137333" },
  Emergency: { background: "#fce8e6", color: "#b00020" }
}[p] || {});

const statusColor = s => ({
  Submitted: { background: "#e8f0fe", color: "#1a73e8" },
  "In Progress": { background: "#f3e8fd", color: "#9334e6" },
  Resolved: { background: "#e6f4ea", color: "#137333" }
}[s] || {});
