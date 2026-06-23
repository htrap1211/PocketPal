import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import Onboarding from "./components/Onboarding.jsx";
import CheckIn from "./pages/CheckIn.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Insights from "./pages/Insights.jsx";
import Chapters from "./pages/Chapters.jsx";
import FutureMe from "./pages/FutureMe.jsx";
import MovieRecap from "./pages/MovieRecap.jsx";
import Wrapped from "./pages/Wrapped.jsx";
import AboutAI from "./pages/AboutAI.jsx";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("pp_onboarded"),
  );
  const location = useLocation();

  return (
    <div className="neo-app-bg flex min-h-screen flex-col">
      {showOnboarding && (
        <Onboarding onDone={() => setShowOnboarding(false)} />
      )}
      <Nav />
      <main key={location.pathname} className="flex-1 animate-page-enter">
        <Routes>
          <Route path="/" element={<CheckIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/chapters" element={<Chapters />} />
          <Route path="/future-me" element={<FutureMe />} />
          <Route path="/movie-recap" element={<MovieRecap />} />
          <Route path="/wrapped" element={<Wrapped />} />
          <Route path="/about-ai" element={<AboutAI />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
