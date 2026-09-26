import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { ProgressProvider } from "./state/ProgressContext";
import TodayPage from "./pages/TodayPage";
import RoadmapPage from "./pages/RoadmapPage";
import TopicPage from "./pages/TopicPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <nav className="app-nav">
          <span className="brand">DSA Tracker</span>
          <NavLink to="/" end>Hôm nay</NavLink>
          <NavLink to="/roadmap">Lộ trình</NavLink>
          <NavLink to="/settings">Cài đặt</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/topic/:id" element={<TopicPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  );
}
