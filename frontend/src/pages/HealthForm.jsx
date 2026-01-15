import { useState, useEffect, useRef } from "react";

const SYMPTOMS = [
    "Fever",
    "Cold",
    "Cough",
    "Headache",
    "Body Pain",
    "Sore Throat",
    "Fatigue",
    "Vomiting",
    "Diarrhea",
    "Rash"
];
import Navbar from "../components/Navbar";
export default function HealthReportForm() {
    const [chat, setChat] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        illnessType: "Viral",
        severity: "Mild",
        location: "",
        symptoms: []
    });

    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat, loading]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const newChat = [...chat, { role: "user", text: input }];
        setChat(newChat);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE}/api/health/chat`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: input,
                        chatHistory: newChat,
                        formContext: form
                    })
                }
            );

            const data = await res.json();
            setChat(prev => [...prev, { role: "bot", text: data.reply }]);
        } catch {
            setChat(prev => [...prev, { role: "bot", text: "⚠️ Something went wrong." }]);
        }

        setLoading(false);
    };

    const submit = async e => {
        e.preventDefault();

        await fetch(`${import.meta.env.VITE_API_BASE}/api/health/report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        alert("✅ Health report submitted anonymously");

        setForm({
            illnessType: "Viral",
            severity: "Mild",
            location: "",
            symptoms: []
        });
    };

    return (
        <>
            <Navbar />
            <style>{`
                @media (max-width: 768px) {
                    .health-wrap {
                        grid-template-columns: 1fr !important;
                    }
                    .chat-box {
                        height: 420px !important;
                    }
                }
            `}</style>

            <div className="health-wrap" style={styles.centerWrap}>
                {/* FORM */}
                <div style={styles.card}>
                    <h3 style={styles.heading}>🏥 Anonymous Health Report</h3>
                    <p style={styles.subtext}>
                        Help us monitor campus health trends. No personal data is collected.
                    </p>

                    <form onSubmit={submit} style={styles.form}>
                        <div style={styles.field}>
                            <label style={styles.label}>Illness Type</label>
                            <select
                                value={form.illnessType}
                                onChange={e =>
                                    setForm({ ...form, illnessType: e.target.value })
                                }
                                style={styles.select}
                            >
                                <option>Viral</option>
                                <option>Respiratory</option>
                                <option>Vector-borne</option>
                                <option>Gastrointestinal</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label style={styles.label}>Symptoms</label>
                            <div style={styles.symptomGrid}>
                                {SYMPTOMS.map(symptom => (
                                    <button
                                        key={symptom}
                                        type="button"
                                        onClick={() =>
                                            setForm(prev => ({
                                                ...prev,
                                                symptoms: prev.symptoms.includes(symptom)
                                                    ? prev.symptoms.filter(s => s !== symptom)
                                                    : [...prev.symptoms, symptom]
                                            }))
                                        }
                                        style={{
                                            ...styles.symptomChip,
                                            ...(form.symptoms.includes(symptom)
                                                ? styles.symptomChipActive
                                                : {})
                                        }}
                                    >
                                        {symptom}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Severity</label>
                            <select
                                value={form.severity}
                                onChange={e =>
                                    setForm({ ...form, severity: e.target.value })
                                }
                                style={styles.select}
                            >
                                <option>Mild</option>
                                <option>Moderate</option>
                                <option>Severe</option>
                            </select>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Location (optional)</label>
                            <input
                                value={form.location}
                                onChange={e =>
                                    setForm({ ...form, location: e.target.value })
                                }
                                placeholder="Hostel / Block / Area"
                                style={styles.input}
                            />
                        </div>

                        <button type="submit" style={styles.button}>
                            Submit Report
                        </button>
                    </form>

                    <div style={styles.footer}>
                        🔒 Data is aggregated and used only for campus-wide analysis.
                    </div>
                </div>

                {/* CHAT */}
                <div className="chat-box" style={styles.chatBox}>
                    <h3>🤖 Health Assistant</h3>

                    <div style={styles.chatMessages}>
                        {chat.map((m, i) => (
                            <div
                                key={i}
                                style={m.role === "user" ? styles.userMsg : styles.botMsg}
                            >
                                {m.text}
                            </div>
                        ))}
                        {loading && <p>Thinking…</p>}
                        <div ref={chatEndRef} />
                    </div>

                    <div style={styles.chatInput}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && sendMessage()}
                            placeholder="Describe your symptoms…"
                            disabled={loading}
                            style={styles.input}
                        />
                        <button onClick={sendMessage} disabled={loading}>
                            {loading ? "…" : "Send"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    centerWrap: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        padding: "16px",
        maxWidth: "960px",
        margin: "0 auto"
    },
    card: {
        background: "white",
        borderRadius: "14px",
        padding: "22px",
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
    },
    chatBox: {
        background: "white",
        borderRadius: "14px",
        padding: "16px",
        height: "520px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
    },
    chatMessages: {
        flex: 1,
        overflowY: "auto",
        marginBottom: "10px"
    },
    chatInput: {
        display: "flex",
        gap: "8px"
    },
    symptomGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginTop: "8px"
    },
    symptomChip: {
        padding: "6px 12px",
        borderRadius: "20px",
        border: "1px solid #ccc",
        background: "white",
        cursor: "pointer",
        fontSize: "13px",
        color: "#333",          // 👈 THIS WAS MISSING
        outline: "none"
    },

    symptomChipActive: {
        background: "#e8f0fe",
        borderColor: "#1a73e8",
        color: "#1a73e8"
    },
    userMsg: {
        alignSelf: "flex-end",
        background: "#e8f0fe",
        padding: "8px 12px",
        borderRadius: "12px",
        marginBottom: "6px",
        maxWidth: "80%"
    },
    botMsg: {
        alignSelf: "flex-start",
        background: "#f1f3f4",
        padding: "8px 12px",
        borderRadius: "12px",
        marginBottom: "6px",
        maxWidth: "80%"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "14px"
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },
    label: {
        fontSize: "13px",
        color: "#555"
    },
    select: {
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #ddd"
    },
    input: {
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #ddd"
    },
    button: {
        marginTop: "10px",
        padding: "12px",
        borderRadius: "12px",
        border: "none",
        background: "#1a73e8",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer"
    },
    footer: {
        marginTop: "14px",
        fontSize: "12px",
        color: "#777",
        textAlign: "center"
    },
    heading: { marginBottom: "6px" },
    subtext: { fontSize: "14px", color: "#666", marginBottom: "18px" }
};
