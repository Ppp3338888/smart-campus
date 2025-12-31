import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  GoogleMap,
  Marker,
  useLoadScript
} from "@react-google-maps/api";
import { useRef } from "react";

export default function Report() {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const navigate = useNavigate();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.KEY
  });
  const CAMPUS_CENTER = {
    lat: 26.0812,
    lng: 91.5620
  };

  const [form, setForm] = useState({
    title: "",
    description: "",
    locationName: "",
    category: "Infrastructure",
    priority: "Low",
    lat: CAMPUS_CENTER.lat,
    lng: CAMPUS_CENTER.lng
  });


  const submit = async e => {
    e.preventDefault();

    await fetch("https://smart-campus-mo10.onrender.com/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    navigate("/dashboard");
  };

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.card}>
          <h2>📝 Report an Issue</h2>
          <p style={{ color: "#666" }}>
            AI will auto-categorize & prioritize later
          </p>

          <form onSubmit={submit}>
            <input placeholder="Issue title" required
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            <textarea placeholder="Describe the issue"
              onChange={e => setForm({ ...form, description: e.target.value })}
            />

            <input placeholder="Location name"
              onChange={e => setForm({ ...form, locationName: e.target.value })}
            />

            <input placeholder="Category"
              onChange={e => setForm({ ...form, category: e.target.value })}
            />

            <p>Priority: </p>
            <select onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Emergency</option>
            </select>

            <p style={{ fontSize: "15px", color: "#555" }}>
              Drag & Drop the marker
            </p>
            {isLoaded && (
              <GoogleMap
                zoom={16}
                center={CAMPUS_CENTER}   // 👈 always fixed
                mapContainerStyle={{
                  width: "100%",
                  height: "300px",
                  marginTop: "10px"
                }}
                onClick={e =>
                  setForm({
                    ...form,
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                  })
                }
              >
                <Marker
                  draggable
                  position={{ lat: form.lat, lng: form.lng }} // 👈 controlled
                  onDragEnd={e =>
                    setForm({
                      ...form,
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng()
                    })
                  }
                />
              </GoogleMap>
            )}


            <button type="submit" style={{ marginTop: "10px" }}>Submit Issue</button>
          </form>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: { background: "#f6f8fc", minHeight: "100vh", padding: "40px" },
  card: {
    background: "white",
    maxWidth: "600px",
    margin: "auto",
    padding: "24px",
    borderRadius: "12px"
  }
};
