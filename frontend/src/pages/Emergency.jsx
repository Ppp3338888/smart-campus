import Navbar from "../components/Navbar";
import {
  GoogleMap,
  Circle,
  useLoadScript
} from "@react-google-maps/api";

const CAMPUS_CENTER = { lat: 26.0812, lng: 91.5620 };

export default function Emergency() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY
  });

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.grid}>

          {/* 🚨 LIVE DANGER ZONE */}
          <div style={styles.dangerCard}>
            <div style={styles.dangerHeader}>
              <h3>📍 Live Danger Zone</h3>
              <span style={styles.liveBadge}>LIVE FEED</span>
            </div>

            <div style={styles.mapWrapper}>
              {isLoaded && (
                <GoogleMap
                  zoom={16}
                  center={CAMPUS_CENTER}
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                >
                  <Circle
                    center={CAMPUS_CENTER}
                    radius={150}
                    options={{
                      fillColor: "#d93025",
                      fillOpacity: 0.25,
                      strokeColor: "#d93025",
                      strokeOpacity: 0.6,
                      strokeWeight: 2
                    }}
                  />
                </GoogleMap>
              )}
            </div>

            <div style={styles.alertInfo}>
<<<<<<< HEAD
              <strong>⚠️ Avoid Block A - North Wing</strong>
=======
              <strong>⚠️ Avoid SAC</strong>
>>>>>>> vercel/main
              <p>
                Fire alarm triggered 3 minutes ago. Automated sprinkler system active.
              </p>
            </div>
          </div>


          <div style={styles.sideCard}>
            <h3>📞 Quick Dial</h3>

            <QuickCall title="Campus Security" number="+91 98765 43210" />
            <QuickCall title="Medical Center" number="+91 98765 43211" />
            <QuickCall title="Fire Station" number="101" />
            <QuickCall title="Admin Office" number="+91 361 1234 567" />


          </div>
        </div>

        {/* 🛡️ SAFETY PROTOCOLS */}
        <div style={styles.protocolCard}>
          <h3>🛡️ Safety Protocols</h3>

          <div style={styles.protocolGrid}>
            <Protocol
              title="Fire Safety"
              desc="Use stairs, not elevators. Assemble at Point 4."
            />
            <Protocol
              title="Medical"
              desc="First aid kits available at all floor desks."
            />
            <Protocol
              title="Security"
              desc="Stay indoors if lockdown alarm sounds."
            />
            <Protocol
              title="Evacuation"
              desc="Follow illuminated green exit signs."
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* 🔹 Components */

function QuickCall({ title, number }) {
  return (
    <div style={styles.callItem}>
      <div>
        <strong>{title}</strong>
        <p>{number}</p>
      </div>
      <a href={`tel:${number}`} style={styles.callBtn}>📞</a>
    </div>
  );
}

function Protocol({ title, desc }) {
  return (
    <div style={styles.protocol}>
      <strong>{title}</strong>
      <p>{desc}</p>
    </div>
  );
}

/* 🎨 Styles */

const styles = {
  page: {
    background: "#f6f8fc",
    minHeight: "100vh",
    padding: "24px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px"
  },

  dangerCard: {
    background: "#fff5f5",
    borderRadius: "14px",
    padding: "16px"
  },

  dangerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  liveBadge: {
    background: "#ffd6d6",
    color: "#d93025",
    padding: "4px 10px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "bold"
  },

  mapWrapper: {
    height: "300px",
    borderRadius: "12px",
    overflow: "hidden",
    marginTop: "12px"
  },

  alertInfo: {
    marginTop: "12px",
    fontSize: "14px"
  },

  sideCard: {
    background: "white",
    borderRadius: "14px",
    padding: "20px"
  },

  callItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "10px",
    marginBottom: "10px"
  },

  callBtn: {
    textDecoration: "none",
    fontSize: "20px"
  },

  panicBtn: {
    width: "100%",
    marginTop: "16px",
    padding: "12px",
    background: "#fdecea",
    color: "#d93025",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer"
  },

  protocolCard: {
    background: "white",
    marginTop: "24px",
    borderRadius: "14px",
    padding: "20px"
  },

  protocolGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginTop: "12px"
  },

  protocol: {
    background: "#f8fafc",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "14px"
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> vercel/main
