import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "./assets/LOGO.png";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
 
  const handleLogin = async () => {
    setLoading(true);
    setErreur("");
    try {
      const res = await axios.post(`${BACKEND_URL}/api/login`, { email, motDePasse });
      const { token, utilisateur } = res.data;
      localStorage.setItem("token", token);
      onLogin(utilisateur);
      if (utilisateur.role === "administrateur") navigate("/dashboard-admin");
      else navigate("/dashboard");
    } catch {
      setErreur("Email ou mot de passe incorrect !");
    }
    setLoading(false);
  };
 
  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };
 
  const iStyle = {
    width: "100%", border: "1.5px solid #e2e8f0", padding: "13px 14px 13px 44px",
    borderRadius: 12, fontSize: 14, outline: "none", color: "#1a2a4a",
    boxSizing: "border-box", background: "#f8fafc", fontFamily: "inherit",
    transition: "border-color 0.2s, background 0.2s",
  };
 
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", display: "flex", margin: 0 }}>
 
      {/* ── Panneau gauche décoratif ── */}
      <div style={{ flex: 1, background: "linear-gradient(160deg, #0a1628 0%, #0d2d5e 50%, #1a4a8a 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 56px", position: "relative", overflow: "hidden", minHeight: "100vh" }} className="login-left">
 
        {/* Cercles décoratifs */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }}></div>
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(224,123,32,0.08)", pointerEvents: "none" }}></div>
        <div style={{ position: "absolute", top: "40%", left: "60%", width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }}></div>
 
        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" style={{ height: 52, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 15 }}>Découvrez les clubs</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Faculté des Sciences Ben M'Sik</div>
            </div>
          </div>
        </div>
 
        {/* Contenu central */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(224,123,32,0.2)", border: "1px solid rgba(224,123,32,0.4)", borderRadius: 30, padding: "6px 16px", marginBottom: 24 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#e07b20" }}></div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase" }}>Espace Administration</span>
          </div>
          <h1 style={{ color: "white", fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 900, lineHeight: 1.2, margin: "0 0 20px 0" }}>
            Bienvenue sur<br />
            <span style={{ color: "#e07b20" }}>CLUB-FSBM</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.8, margin: "0 0 40px 0", maxWidth: 380 }}>
            Gérez les clubs, événements et actualités de la Faculté des Sciences Ben M'Sik depuis votre espace dédié.
          </p>
 
          {/* Stats */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { val: "19+", label: "Clubs actifs" },
              { val: "100+", label: "Événements" },
              { val: "5000+", label: "Étudiants" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "14px 20px", minWidth: 90 }}>
                <div style={{ color: "white", fontWeight: 900, fontSize: 22 }}>{s.val}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Footer gauche */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            {[
              { href: "https://www.facebook.com/FSBMUH2C", d: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/> },
              { href: "https://x.com/uh2c_fsbm", d: <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.43.36a9 9 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.6 1.64.9a4.52 4.52 0 00-.61 2.27c0 1.57.8 2.95 2.01 3.76a4.5 4.5 0 01-2.05-.57v.06c0 2.19 1.56 4.02 3.63 4.43a4.55 4.55 0 01-2.04.08 4.53 4.53 0 004.23 3.14A9.07 9.07 0 010 19.54a12.8 12.8 0 006.92 2.03c8.3 0 12.85-6.88 12.85-12.85l-.01-.59A9.17 9.17 0 0023 3z"/> },
              { href: "https://www.linkedin.com/showcase/fsbmunivh2c/", d: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></> },
            ].map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noreferrer"
                style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
                <svg width="15" height="15" fill="rgba(255,255,255,0.7)" viewBox="0 0 24 24">{s.d}</svg>
              </a>
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>© {new Date().getFullYear()} FSBM — Tous droits réservés</div>
        </div>
      </div>
 
      {/* ── Panneau droit formulaire ── */}
      <div style={{ width: 480, background: "#f8fafd", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 48px", position: "relative" }} className="login-right">
 
        {/* Bouton retour */}
        <button onClick={() => navigate("/")}
          style={{ position: "absolute", top: 24, left: 24, display: "flex", alignItems: "center", gap: 6, background: "white", border: "1.5px solid #e2e8f0", color: "#64748b", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#0d2d5e"; e.currentTarget.style.color = "#0d2d5e"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Accueil
        </button>
 
        <div style={{ width: "100%", maxWidth: 380 }}>
 
          {/* Titre */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(13,45,94,0.25)" }}>
              <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <h2 style={{ color: "#0d2d5e", fontSize: 26, fontWeight: 900, margin: "0 0 8px 0" }}>Connexion</h2>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Accédez à votre espace CLUB-FSBM</p>
          </div>
 
          {/* Erreur */}
          {erreur && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, padding: "12px 16px", borderRadius: 10, marginBottom: 24, display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {erreur}
            </div>
          )}
 
          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.07em" }}>Adresse Email</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
              </span>
              <input type="email" placeholder="exemple@fsbm.ma" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
                style={iStyle}
                onFocus={e => { e.currentTarget.style.borderColor = "#0d2d5e"; e.currentTarget.style.background = "#fff"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }} />
            </div>
          </div>
 
          {/* Mot de passe */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.07em" }}>Mot de passe</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </span>
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={motDePasse}
                onChange={e => setMotDePasse(e.target.value)} onKeyDown={handleKeyDown}
                style={{ ...iStyle, paddingRight: 44 }}
                onFocus={e => { e.currentTarget.style.borderColor = "#0d2d5e"; e.currentTarget.style.background = "#fff"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }} />
              <button onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>
                {showPassword
                  ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>
 
          {/* Bouton connexion */}
          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", background: loading ? "#94a3b8" : "linear-gradient(135deg, #0d2d5e, #1a4a8a)", color: "white", border: "none", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: loading ? "none" : "0 6px 20px rgba(13,45,94,0.3)", transition: "all 0.2s" }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
            {loading ? (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ animation: "spin 0.8s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                Connexion en cours...
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                Se connecter
              </>
            )}
          </button>
 
          {/* Séparateur info */}
          <div style={{ marginTop: 28, padding: 18, background: "white", borderRadius: 14, border: "1px solid #f0f4f8", boxShadow: "0 2px 8px rgba(13,45,94,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "#eef4ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="#0d2d5e" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: "#64748b", lineHeight: 1.6 }}>
                Cet espace est réservé aux <strong style={{ color: "#0d2d5e" }}>administrateurs et responsables</strong> de clubs de la FSBM.
              </p>
            </div>
          </div>
 
          <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 24 }}>
            © {new Date().getFullYear()} Faculté des Sciences Ben M'Sik
          </p>
        </div>
      </div>
 
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; } body { margin: 0; }
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-right { width: 100% !important; min-height: 100vh; }
        }
      `}</style>
    </div>
  );
}
