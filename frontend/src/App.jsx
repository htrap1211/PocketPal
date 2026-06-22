import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import Onboarding from "./components/Onboarding.jsx";
import CheckIn from "./pages/CheckIn.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Insights from "./pages/Insights.jsx";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("pp_onboarded"),
  );

  return (
    <div className="flex min-h-screen flex-col bg-paper-white">
      {showOnboarding && (
        <Onboarding onDone={() => setShowOnboarding(false)} />
      )}
      <Nav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<CheckIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
