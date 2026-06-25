import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./HomePage";
import ActualitesPage from "./ActualitesPage";
import ActualiteDetail from "./ActualiteDetail";
import LoginPage from "./LoginPage";
import DashboardAdmin from "./DashboardAdmin";
import DashboardSuperAdmin from "./DashboardSuperAdmin";
import ContactPage from "./ContactPage";
import Clubspage from "./Clubspage";
import ClubDetail from "./ClubDetail";
import { getInitialData } from "./ssrData";

export default function App() {
  const initialUser = getInitialData().auth?.user;
  const [utilisateur, setUtilisateur] = useState(initialUser ?? undefined);
  const location = useLocation();
  const isProtectedRoute = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!isProtectedRoute) {
        if (active && utilisateur === undefined) setUtilisateur(null);
        return;
      }

      if (initialUser) return;
      try {
        const res = await fetch("/api/profil", { credentials: "same-origin" });
        if (!active) return;
        if (res.ok) {
          const data = await res.json();
          setUtilisateur(data);
        } else {
          setUtilisateur(null);
        }
      } catch {
        if (active) setUtilisateur(null);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [initialUser, isProtectedRoute]);

  const handleLogin = (user) => {
    setUtilisateur(user);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      // Ignore network failures and clear local state anyway.
    }
    setUtilisateur(null);
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/actualites" element={<ActualitesPage />} />
      <Route path="/actualites/:id" element={<ActualiteDetail />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/dashboard" element={<DashboardAdmin utilisateur={utilisateur} onLogout={handleLogout} />} />
      <Route path="/dashboard-admin" element={<DashboardSuperAdmin utilisateur={utilisateur} onLogout={handleLogout} />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/clubs" element={<Clubspage />} />
      <Route path="/clubs/:id" element={<ClubDetail />} />
    </Routes>
  );
}
