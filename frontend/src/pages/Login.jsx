import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="center">
      <div className="card">
      <h2>Smart Campus Portal</h2>
<p style={{ opacity: 0.7, marginBottom: "20px" }}>
  Report campus issues instantly with AI assistance
</p>

        <input placeholder="College Email" />
        <input type="password" placeholder="Password" />
        <button onClick={() => navigate("/dashboard")}>
          Login
        </button>
      </div>
    </div>
  );
}
