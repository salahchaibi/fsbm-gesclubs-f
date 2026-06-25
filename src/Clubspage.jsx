import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/LOGO.png";
import { getInitialData } from "./ssrData";
 
const STORAGE = `${APP_URL}/storage`;
 
const DOMAINES = ["Tous", "Scientifique", "Culturel", "Entrepreneuriat", "Humanitaire", "Sport"];
 
const domaineColor = {
  Scientifique:    { bg: "#dde8f7", text: "#2a5ba5",  badge: "#2a5ba5" },
  Culturel:        { bg: "#fde8ce", text: "#e07b20",  badge: "#e07b20" },
  Entrepreneuriat: { bg: "#d1fae5", text: "#065f46",  badge: "#059669" },
  Humanitaire:     { bg: "#fce7f3", text: "#be185d",  badge: "#be185d" },
  Sport:           { bg: "#e0f2fe", text: "#0369a1",  badge: "#0369a1" },
};
 
const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};
 
export default function ClubsPage() {
  const initialData = getInitialData().clubsPage || {};
  const navigate = useNavigate();
  const [clubs, setClubs] = useState(Array.isArray(initialData.clubs) ? initialData.clubs : []);
  const [loading, setLoading] = useState(!Array.isArray(initialData.clubs));
  const [domaine, setDomaine] = useState("Tous");
  const [search, setSearch] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
 
  const navItems = [
    {
      label: "Accueil",
      dropdown: [
        { label: "Actualités",          id: "actualites" },
        { label: "Chiffres clés",       id: "chiffres-cles" },
        { label: "Mot de la Direction", id: "mot-du-doyen" },
        { label: "Organigramme",        id: "organigramme" },
        { label: "Objectifs",           id: "objectifs" },
      ],
    },
    { label: "Actualités",     path: "/actualites" },
    { label: "Nos Clubs",      path: "/clubs" },
    { label: "Contactez-nous", path: "/contact" },
  ];
 
  const handleNavClick = (e, item) => {
    e.preventDefault();
    if (item.path) navigate(item.path);
  };
 
  useEffect(() => {
    if (Array.isArray(initialData.clubs)) return;
    fetch(`/api/clubs`)
      .then(res => res.json())
      .then(data => { setClubs(Array.isArray(data) ? data : data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
 
  const filtered = clubs
    .filter(c => domaine === "Tous" || c.domaine === domaine)
    .filter(c => c.nom.toLowerCase().includes(search.toLowerCase()));
 
  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f8fafd", minHeight: "100vh" }}>
 
      {/* ===== NAVBAR ===== */}
      <header style={{ position: "sticky", top: 0, zIndex: 1000, backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" style={{ width: "150px", height: "60px", objectFit: "contain" }} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#2a5ba5" }}>Découvrez les clubs</span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#9fc0f1" }}>de la Faculté des Sciences Ben M'Sik</span>
            </div>
          </div>
 
          <nav style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {navItems.map((item) => (
              <div key={item.label} style={{ position: "relative" }}
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}>
                <a href="#" onClick={(e) => handleNavClick(e, item)}
                  style={{ color: item.path === "/clubs" ? "#0d2d5e" : "#1a2a4a", textDecoration: "none", padding: "8px 14px", borderRadius: "4px", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", backgroundColor: item.path === "/clubs" ? "#eef4ff" : "transparent", transition: "color 0.2s, background 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#0d2d5e"; e.currentTarget.style.backgroundColor = "#eef4ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = item.path === "/clubs" ? "#0d2d5e" : "#1a2a4a"; e.currentTarget.style.backgroundColor = item.path === "/clubs" ? "#eef4ff" : "transparent"; }}>
                  {item.label}
                  {item.dropdown && <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4l4 4 4-4" strokeLinecap="round"/></svg>}
                </a>
                {item.dropdown && activeDropdown === item.label && (
                  <div style={{ position: "absolute", top: "calc(100% + 2px)", left: 0, backgroundColor: "#ffffff", borderRadius: "6px", boxShadow: "0 8px 28px rgba(0,0,0,0.14)", minWidth: "260px", overflow: "hidden", border: "1px solid #dde6f0", animation: "dropFade 0.18s ease" }}>
                    {item.dropdown.map((sub, i) => (
                      <a key={sub.label} href="#"
                        onClick={(e) => { e.preventDefault(); navigate("/"); setTimeout(() => scrollTo(sub.id), 300); setActiveDropdown(null); }}
                        style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 18px", color: "#1a2a4a", textDecoration: "none", fontSize: "13.5px", fontWeight: "500", borderBottom: i < item.dropdown.length - 1 ? "1px solid #f0f4f8" : "none", transition: "background 0.15s, color 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#eef4ff"; e.currentTarget.style.color = "#0d2d5e"; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1a2a4a"; }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#0d2d5e", flexShrink: 0 }} />
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
 
          <button onClick={() => navigate("/login")}
            style={{ backgroundColor: "#0d2d5e", color: "#ffffff", border: "none", padding: "9px 22px", borderRadius: "6px", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1a4a8a"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#0d2d5e"}>
            Connexion
          </button>
 
          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger-btn"
            style={{ display: "none", background: "transparent", border: "none", cursor: "pointer", color: "#0d2d5e", padding: "8px" }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
 
        {menuOpen && (
          <div style={{ backgroundColor: "#fff", borderTop: "1px solid #e2e8f0", padding: "8px 0" }}>
            {navItems.map((item) => (
              <div key={item.label}>
                <a href="#" onClick={(e) => { handleNavClick(e, item); setMenuOpen(false); }}
                  style={{ display: "block", padding: "12px 24px", color: "#1a2a4a", textDecoration: "none", fontSize: "14px", fontWeight: "600", borderBottom: "1px solid #f0f4f8" }}>
                  {item.label}
                </a>
              </div>
            ))}
          </div>
        )}
      </header>
 
      {/* ===== HERO HEADER ===== */}
      <div style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2d5e 60%, #1a4a8a 100%)", padding: "56px 8% 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.04)", fontSize: "clamp(80px,14vw,180px)", fontWeight: "900", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>CLUBS</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", cursor: "pointer" }} onClick={() => navigate("/")}>Accueil</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
            <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: "600" }}>Nos Clubs</span>
          </div>
          <h1 style={{ color: "#ffffff", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "900", margin: "0 0 12px 0", letterSpacing: "-0.5px" }}>
            Nos Clubs Étudiants
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", margin: "0 0 20px 0" }}>
            Rejoignez une communauté active et enrichissez votre expérience universitaire
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: "60px", height: "4px", background: "linear-gradient(90deg, #e07b20, #f59e0b)", borderRadius: "2px" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{clubs.length} clubs actifs à la FSBM</span>
          </div>
        </div>
      </div>
 
      {/* ===== FILTRES + RECHERCHE ===== */}
      <div style={{ backgroundColor: "#ffffff", borderBottom: "2px solid #f0f4f8", padding: "0 8%", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", position: "sticky", top: "72px", zIndex: 99, boxShadow: "0 2px 8px rgba(13,45,94,0.06)" }}>
        <div style={{ display: "flex", gap: "4px", overflowX: "auto" }}>
          {DOMAINES.map(d => {
            const count = d === "Tous" ? clubs.length : clubs.filter(c => c.domaine === d).length;
            return (
              <button key={d} onClick={() => setDomaine(d)}
                style={{ padding: "16px 18px", border: "none", borderBottom: domaine === d ? "3px solid #0d2d5e" : "3px solid transparent", backgroundColor: "transparent", color: domaine === d ? "#0d2d5e" : "#64748b", fontWeight: domaine === d ? "700" : "500", fontSize: "13.5px", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s" }}>
                {d}
                {count > 0 && (
                  <span style={{ background: domaine === d ? "#0d2d5e" : "#f0f4f8", color: domaine === d ? "white" : "#64748b", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
 
        {/* Recherche */}
        <div style={{ position: "relative", padding: "12px 0" }}>
          <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Rechercher un club..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "9px 14px 9px 36px", fontSize: "13px", outline: "none", width: "230px", color: "#1a2a4a", background: "#f8fafc", transition: "border-color 0.2s" }}
            onFocus={e => e.currentTarget.style.borderColor = "#0d2d5e"}
            onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"} />
        </div>
      </div>
 
      {/* ===== GRILLE CLUBS ===== */}
      <div style={{ padding: "48px 8%" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Chargement des clubs...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: "16px", fontWeight: "600" }}>Aucun club trouvé</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "24px" }}>
            {filtered.map((club) => {
              const couleur = domaineColor[club.domaine] || { bg: "#eef4ff", text: "#2a5ba5", badge: "#2a5ba5" };
              return (
                <div key={club.id}
                  style={{ backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(13,45,94,0.07)", overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow 0.25s, transform 0.25s", cursor: "pointer", border: "1px solid #f0f4f8" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 36px rgba(13,45,94,0.14)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(13,45,94,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>
 
                  {/* Bande couleur domaine */}
                  <div style={{ height: 6, background: `linear-gradient(90deg, ${couleur.badge}, ${couleur.badge}99)` }}></div>
 
                  <div style={{ padding: "28px 20px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", flex: 1 }}>
 
                    {/* Logo */}
                    <div style={{ width: "96px", height: "96px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#f0f4ff", border: `3px solid ${couleur.bg}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(13,45,94,0.08)" }}>
                      {club.logo ? (
                    <img src={club.logo.startsWith('http') ? club.logo : `${STORAGE}/${club.logo}`} alt={club.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />) : (
                     <span style={{ fontSize: "36px", fontWeight: "900", color: "#2a5ba5" }}>{club.nom.charAt(0)}</span>
                        )}
                    </div>
 
                    {/* Badge domaine */}
                    <span style={{ backgroundColor: couleur.bg, color: couleur.text, fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", letterSpacing: "0.04em" }}>
                      {club.domaine}
                    </span>
 
                    {/* Nom */}
                    <div style={{ fontSize: "15px", fontWeight: "800", color: "#0d2d5e", textAlign: "center", lineHeight: "1.4" }}>
                      {club.nom}
                    </div>
 
                    {/* Description courte */}
                    {club.description && (
                      <p style={{ fontSize: "12.5px", color: "#64748b", textAlign: "center", lineHeight: "1.6", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {club.description}
                      </p>
                    )}
 
                    {/* Parrain */}
                    {club.parrain && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: "12px" }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 20c1.3-3.5 4-5 7-5s5.7 1.5 7 5"/></svg>
                        {club.parrain}
                      </div>
                    )}
 
                    {/* Bouton */}
                    <button onClick={() => navigate(`/clubs/${club.id}`)}
                      style={{ backgroundColor: "#0d2d5e", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", width: "100%", marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1a4a8a"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#0d2d5e"}>
                      Voir le club
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
 
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", marginTop: "40px" }}>
          {filtered.length} club{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
        </p>
      </div>
 
      <style>{`
        @keyframes dropFade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) { nav { display: none !important; } .hamburger-btn { display: flex !important; } }
        @media (max-width: 600px) { div[style*="minmax(220px"] { grid-template-columns: repeat(2, 1fr) !important; } }
        * { box-sizing: border-box; } body { margin: 0; }
      `}</style>
    </div>
  );
}
