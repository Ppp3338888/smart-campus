import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  GoogleMap,
  Marker,
  useLoadScript
} from "@react-google-maps/api";

/* 📍 Campus center */
const CAMPUS_CENTER = { lat: 26.0812, lng: 91.5620 };

/* 🎨 Theme Constants */
const COLORS = {
  primary: "#4f46e5", // Indigo
  bg: "#f8fafc",
  card: "#ffffff",
  textMain: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  emergency: "#be123c",
  high: "#e11d48",
  medium: "#f59e0b",
  low: "#10b981",
  resolved: "#059669",
  progress: "#6366f1",
  submitted: "#3b82f6",
};

/* 🎯 Marker icons */
const priorityIcon = (priority) => {
  const base = "http://maps.google.com/mapfiles/ms/icons/";
  const map = {
    Low: "green-dot.png",
    Medium: "yellow-dot.png",
    High: "red-dot.png",
    Emergency: "purple-dot.png"
  };
  return { url: base + (map[priority] || "blue-dot.png") };
};

/* ⚙️ Helpers */
const getPriorityStyles = (p) => ({
  High: { bg: "#fff1f2", text: "#e11d48", dot: "#e11d48" },
  Medium: { bg: "#fffbeb", text: "#d97706", dot: "#fbbf24" },
  Low: { bg: "#f0fdf4", text: "#16a34a", dot: "#4ade80" },
  Emergency: { bg: "#fff1f2", text: "#be123c", dot: "#f43f5e" }
}[p] || { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" });

const getStatusStyles = (s) => ({
  Submitted: { bg: "#eff6ff", text: "#1d4ed8" },
  "In Progress": { bg: "#f5f3ff", text: "#6d28d9" },
  Resolved: { bg: "#ecfdf5", text: "#047857" }
}[s] || { bg: "#f8fafc", text: "#64748b" });

const MOCK_HEALTH = {
  recentReported: 12,
  illPercentage: 50,
  distribution: { Viral: 5, Respiratory: 2, "Vector-borne": 1 },
  outbreakAlert: "Viral",
  outbreakStats: { cases: 5, dominance: 62.5 },
  windowDays: 3
};

export default function Dashboard() {
  const USE_MOCK_HEALTH = true;
  const [health, setHealth] = useState(null);
  const [issues, setIssues] = useState([]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY
  });

  useEffect(() => {
    if (USE_MOCK_HEALTH) {
      setHealth(MOCK_HEALTH);
    } else {
      fetch(`${import.meta.env.VITE_API_BASE}/api/health/summary`)
        .then(res => res.json())
        .then(setHealth)
        .catch(err => console.error("HEALTH FETCH ERROR:", err));
    }
  }, [USE_MOCK_HEALTH]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/api/issues`)
      .then(res => res.json())
      .then(setIssues)
      .catch(err => console.error("FETCH ERROR:", err));
  }, []);

  const deleteIssue = async (id) => {
    if (!window.confirm("Permanentally delete this report?")) return;
    await fetch(`${import.meta.env.VITE_API_BASE}/api/issues/${id}`, { method: "DELETE" });
    setIssues(prev => prev.filter(issue => issue.id !== id));
  };

  const stats = {
    ongoing: issues.filter(i => i.status !== "Resolved").length,
    resolved: issues.filter(i => i.status === "Resolved").length,
    high: issues.filter(i => i.priority === "High" || i.priority === "Emergency").length,
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.container}>
        {/* --- HEADER SECTION --- */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Campus Overview</h1>
            <p style={styles.subtitle}>Insights and incident tracking for today</p>
          </div>
          <div style={styles.dateBadge}>
            📅 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        {/* --- HEALTH HERO CARD --- */}
        {health && (
          <section style={styles.healthHero}>
            <div style={styles.healthInfo}>
              <div style={styles.healthTag}>LIVE HEALTH SIGNAL</div>
              <h2 style={styles.healthHeading}>Campus Wellness Index</h2>
              <div style={styles.healthGrid}>
                <div style={styles.healthStatItem}>
                  <span style={styles.healthStatValue}>{health.illPercentage}%</span>
                  <span style={styles.healthStatLabel}>Infection Rate</span>
                </div>
                <div style={styles.divider} />
                <div style={styles.healthStatItem}>
                  <span style={styles.healthStatValue}>{health.recentReported}</span>
                  <span style={styles.healthStatLabel}>New Cases (72h)</span>
                </div>
              </div>
            </div>
            {health.outbreakAlert && (
              <div style={styles.healthAlertCard}>
                <div style={styles.alertHeader}>
                  <span style={styles.alertIcon}>⚠️</span>
                  <span>Trend Alert</span>
                </div>
                <p style={styles.alertText}>
                  Increased <strong>{health.outbreakAlert}</strong> activity detected.
                  {health.outbreakStats.cases} cases reported recently.
                </p>
              </div>
            )}
          </section>
        )}

        {/* --- STATS ROW --- */}
        <section style={styles.statsRow}>
          <StatCard icon="📋" label="Active Issues" value={stats.ongoing} color={COLORS.primary} />
          <StatCard icon="✅" label="Resolved" value={stats.resolved} color={COLORS.resolved} />
          <StatCard icon="🔥" label="Urgent" value={stats.high} color={COLORS.high} />
          <StatCard icon="📍" label="Map Markers" value={issues.length} color={COLORS.textMain} />
        </section>

        {/* --- MAIN CONTENT GRID --- */}
        <div style={styles.contentGrid}>
          {/* LEFT: ISSUES LIST */}
          <div style={styles.listContainer}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Recent Incident Reports</h3>
              <button style={styles.viewAllBtn}>View All</button>
            </div>

            <div style={styles.scrollArea}>
              {issues.length === 0 ? (
                <div style={styles.emptyState}>No issues reported yet.</div>
              ) : (
                issues.map(issue => (
                  <IssueItem
                    key={issue.id}
                    issue={issue}
                    onDelete={() => deleteIssue(issue.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* RIGHT: MAP */}
          <div style={styles.mapContainer}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Geospatial Analysis</h3>
            </div>
            <div style={styles.mapWrapper}>
              {isLoaded && (
                <GoogleMap
                  zoom={15.5}
                  center={CAMPUS_CENTER}
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  options={{ disableDefaultUI: true, styles: mapMinimalStyle }}
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
              <div style={styles.mapLegend}>
                <LegendItem color={COLORS.low} label="Low" />
                <LegendItem color={COLORS.medium} label="Med" />
                <LegendItem color={COLORS.high} label="High" />
                <LegendItem color="#a855f7" label="Emergency" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* 🧱 Sub-Components */

function StatCard({ icon, label, value, color }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, backgroundColor: `${color}10`, color }}>{icon}</div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

function IssueItem({ issue, onDelete }) {
  const pStyle = getPriorityStyles(issue.priority);
  const sStyle = getStatusStyles(issue.status);

  return (
    <div style={styles.issueCard}>
      <div style={styles.issueMain}>
        <div style={styles.issueTopLine}>
          <span style={{ ...styles.priorityBadge, backgroundColor: pStyle.bg, color: pStyle.text }}>
            <span style={{ ...styles.dot, backgroundColor: pStyle.dot }} />
            {issue.priority}
          </span>
          <span style={styles.issueTime}>{new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <h4 style={styles.issueTitle}>{issue.title}</h4>
        <p style={styles.issueMeta}>📍 {issue.locationName} • {issue.category}</p>
        <div style={styles.issueFooter}>
          <span style={{ ...styles.statusBadge, backgroundColor: sStyle.bg, color: sStyle.text }}>
            {issue.status}
          </span>
          <button onClick={onDelete} style={styles.deleteBtn} title="Delete report">🗑️</button>
        </div>
      </div>
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
    background: COLORS.bg,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: COLORS.textMain,
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "32px",
  },
  title: { fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px", margin: 0 },
  subtitle: { color: COLORS.textMuted, marginTop: "4px" },
  dateBadge: { background: "white", padding: "8px 16px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", border: `1px solid ${COLORS.border}` },

  healthHero: {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    borderRadius: "24px",
    padding: "32px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "32px",
    marginBottom: "32px",
    boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.2)",
    color: "white",
  },
  healthTag: { fontSize: "12px", fontWeight: "700", opacity: 0.8, letterSpacing: "1px" },
  healthHeading: { fontSize: "24px", margin: "8px 0 24px 0" },
  healthGrid: { display: "flex", gap: "40px" },
  healthStatValue: { fontSize: "36px", fontWeight: "800", display: "block" },
  healthStatLabel: { fontSize: "14px", opacity: 0.8 },
  divider: { width: "1px", background: "rgba(255,255,255,0.2)" },
  healthAlertCard: {
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderRadius: "20px",
    maxWidth: "300px",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  alertHeader: { display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", marginBottom: "8px" },
  alertText: { fontSize: "14px", lineHeight: "1.5", margin: 0 },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  statCard: {
    background: "white",
    padding: "20px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    border: `1px solid ${COLORS.border}`,
  },
  statIcon: { width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" },
  statValue: { fontSize: "20px", fontWeight: "800" },
  statLabel: { fontSize: "13px", color: COLORS.textMuted },

  contentGrid: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px", alignItems: "start" },
  listContainer: { background: "white", borderRadius: "24px", border: `1px solid ${COLORS.border}`, overflow: "hidden" },
  sectionHeader: { padding: "24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: "18px", fontWeight: "700", margin: 0 },
  viewAllBtn: { background: "none", border: "none", color: COLORS.primary, fontWeight: "600", cursor: "pointer" },
  scrollArea: { maxHeight: "600px", overflowY: "auto", padding: "12px" },

  issueCard: {
    padding: "16px",
    borderRadius: "16px",
    marginBottom: "12px",
    transition: "transform 0.2s, background 0.2s",
    border: "1px solid transparent",
    ":hover": { background: "#f8fafc", transform: "translateY(-2px)" }
  },
  issueTopLine: { display: "flex", justifyContent: "space-between", marginBottom: "12px" },
  priorityBadge: { padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" },
  dot: { width: "6px", height: "6px", borderRadius: "50%" },
  issueTitle: { margin: "0 0 6px 0", fontSize: "16px", fontWeight: "600" },
  issueMeta: { fontSize: "13px", color: COLORS.textMuted, margin: "0 0 16px 0" },
  issueFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  statusBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", opacity: 0.3, transition: "opacity 0.2s" },

  mapContainer: { background: "white", borderRadius: "24px", border: `1px solid ${COLORS.border}`, padding: "12px" },
  mapWrapper: { height: "540px", borderRadius: "18px", overflow: "hidden", position: "relative" },
  mapLegend: {
    position: "absolute",
    bottom: "20px",
    left: "20px",
    background: "white",
    padding: "12px",
    borderRadius: "12px",
    display: "flex",
    gap: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  legendItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700" },
  legendDot: { width: "8px", height: "8px", borderRadius: "50%" },
  emptyState: { padding: "40px", textAlign: "center", color: COLORS.textMuted }
};

const mapMinimalStyle = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
];