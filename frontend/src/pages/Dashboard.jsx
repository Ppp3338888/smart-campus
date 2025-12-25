import { Link } from "react-router-dom";

export default function Dashboard() {
  const issues = [
    { title: "Broken Light in Hostel B", priority: "Medium" },
    { title: "Water Leakage near Mess", priority: "Low" }
  ];

  return (
    <>
      {/* Navbar */}
      <nav>
        <h3>Smart Campus</h3>
        <div>
          <Link to="/report">Report</Link>
          <Link to="/emergency" className="danger">
            Emergency
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="container">
        <h2 style={{ marginBottom: "20px" }}>My Issues</h2>

        {issues.map((i, idx) => (
          <div className="card" key={idx}>
            <h4 style={{ marginBottom: "10px" }}>{i.title}</h4>

            {/* Priority badge */}
            <span className={`badge ${i.priority}`}>
              {i.priority}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
