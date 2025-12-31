import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import Emergency from "./pages/Emergency";
import Map from "./pages/Map";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report" element={<Report />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </BrowserRouter>
  );
}
