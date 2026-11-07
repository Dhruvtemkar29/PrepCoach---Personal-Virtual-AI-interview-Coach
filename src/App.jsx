
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/auth/AuthPage";

import AppLayout from "./components/app/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import InterviewPage from "./pages/InterviewPage";
import HistoryPage from "./pages/HistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ResumeManagerPage from "./pages/ResumeManagerPage";
import RoadmapPage from "./pages/RoadmapPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ResumeBuilderPage from "./pages/ResumeBuilderPage";

export default function App() {
  return (
    <Routes>
      {/* Public Website */}
      <Route path="/" element={<LandingPage />} />

      {/* Authentication */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Software Application */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="interview" element={<InterviewPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="resumes" element={<ResumeManagerPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="resume-builder" element={<ResumeBuilderPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
