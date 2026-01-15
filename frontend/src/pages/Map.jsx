import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    GoogleMap,
    Marker,
    InfoWindow,
    useLoadScript
} from "@react-google-maps/api";

const center = { lat: 26.0812, lng: 91.5620 };

export default function MapPage() {
    const [issues, setIssues] = useState([]);
    const [selected, setSelected] = useState(null);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY
    });

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE}/api/issues`)
            .then(res => res.json())
            .then(setIssues);
    }, []);

    if (!isLoaded) return <p>Loading Map...</p>;

    return (
        <>
            <Navbar />

            <div style={styles.page}>
                <div style={styles.card}>
                    <h2 style={{ marginBottom: "12px" }}>🗺️ Campus Issues Map</h2>
                    <p>Click markers to see details</p>

                    <div style={styles.mapWrapper}>
                        <GoogleMap
                            zoom={17}
                            center={center}
                            mapContainerStyle={{ width: "100%", height: "100%" }}
                        >
                            {issues.map(issue => (
                                <Marker
                                    key={issue.id}
                                    position={{ lat: issue.lat, lng: issue.lng }}
                                    onClick={() => setSelected(issue)}
                                />
                            ))}

                            {selected && (
                                <InfoWindow
                                    position={{ lat: selected.lat, lng: selected.lng }}
                                    onCloseClick={() => setSelected(null)}
                                >
                                    <div style={{ maxWidth: 200 }}>
                                        <h4>{selected.title}</h4>
                                        <p>{selected.description}</p>
                                        <p>📍 {selected.locationName}</p>
                                        <p>Status: {selected.status}</p>
                                        <p>Priority: {selected.priority}</p>
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    page: {
        background: "#f6f8fc",
        minHeight: "100vh",
        padding: "30px"
    },
    card: {
        background: "white",
        maxWidth: "1000px",
        margin: "auto",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
    },
    mapWrapper: {
        width: "100%",
        height: "500px",
        borderRadius: "10px",
        overflow: "hidden"
    }
};
