import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav style={styles.nav}>
            <h3>Smart Campus</h3>

            <div>
                {/* HOME BUTTON */}
                <Link to="/dashboard" style={styles.link}>Home</Link>
                <Link to="/emergency" style={styles.link}>Emergency</Link>
                <Link to="/report" style={styles.link}>＋ Report</Link>
                <Link to="/map" style={styles.link}>Map</Link>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#1a73e8",
        color: "white"
    },
    link: {
        color: "white",
        marginLeft: "18px",
        textDecoration: "none",
        fontWeight: "500"
    }
};
