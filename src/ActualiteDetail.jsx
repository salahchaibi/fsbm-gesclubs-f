import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "./assets/LOGO.png";
import { getInitialData } from "./ssrData";

const API = "/api";
const STORAGE = "/storage";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const categorieColor = {
  Formation:    "#e07b20",
  Culturel:     "#2a5ba5",
  Caravane:     "#16a34a",
  Sport:        "#dc2626",
  Workshops:    "#7c3aed",
  Événement:    "#0891b2",
  Scientifique: "#33c9ea",
};

export default function ActualiteDetail() {
  const initialData = getInitialData().actualiteDetail || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const hasInitial = String(initialData.id) === String(id) && initialData.actu;
  const [actu, setActu] = useState(hasInitial ? initialData.actu : null);
  const [autresActus, setAutresActus] = useState(hasInitial ? (initialData.autresActus || []) : []);
  const [loading, setLoading] = useState(!hasInitial);
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
    if (hasInitial) return;
    setLoading(true);
    fetch(`${API}/actualites/${id}`)
      .then(r => r.json())
      .then(data => { setActu(data); setLoading(false); })
      .catch(() => setLoading(false));

    fetch(`${API}/actualites`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.data || [];
        setAutresActus(list.filter(a => String(a.id) !== String(id)).slice(0, 3));
      })
      .catch(() => {});
  }, [id, hasInitial]);

  const getImage = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${STORAGE}/${img}`;
  };

  const getClubLogo = (club) => {
    if (!club || !club.logo) return null;
    if (club.logo.startsWith("http")) return club.logo;
    return `${STORAGE}/${club.logo}`;
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "4px solid #dde8f7", borderTop: "4px solid #0d2d5e", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}></div>
        <p style={{ color: "#94a3b8", fontWeight: 600 }}>Chargement...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!actu) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📰</div>
        <p style={{ color: "#64748b", fontSize: 16, fontWeight: 600 }}>Actualité introuvable.</p>
        <button onClick={() => navigate("/actualites")} style={{ marginTop: 16, padding: "10px 24px", background: "#0d2d5e", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
          Retour aux actualités
        </button>
      </div>
    </div>
  );

  const imgSrc = getImage(actu.image);
  const club = actu.club || null;
  const clubLogo = getClubLogo(club);
  const couleur = categorieColor[actu.categorie] || "#0d2d5e";

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f8fafd", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <header style={{ position: "sticky", top: 0, zIndex: 1000, backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" style={{ width: "150px", height: "60px", objectFit: "contain" }} />
            <div className="actu-navbar-text" style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
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
                  style={{ color: "#1a2a4a", textDecoration: "none", padding: "8px 14px", borderRadius: "4px", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", transition: "color 0.2s, background 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#0d2d5e"; e.currentTarget.style.backgroundColor = "#eef4ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#1a2a4a"; e.currentTarget.style.backgroundColor = "transparent"; }}>
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

      {/* BREADCRUMB */}
      <div style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #f0f4f8", padding: "14px 8%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, flexWrap: "wrap" }}>
          <span style={{ color: "#94a3b8", cursor: "pointer" }} onClick={() => navigate("/")}>Accueil</span>
          <span style={{ color: "#cbd5e1" }}>›</span>
          <span style={{ color: "#94a3b8", cursor: "pointer" }} onClick={() => navigate("/actualites")}>Actualités</span>
          <span style={{ color: "#cbd5e1" }}>›</span>
          <span style={{ color: "#0d2d5e", fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{actu.titre}</span>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="actu-main-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 8%", display: "grid", gridTemplateColumns: "1fr 360px", gap: 40, alignItems: "start" }}>

        {/* Colonne gauche : article */}
        <div>
          {imgSrc && (
            <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 36, boxShadow: "0 8px 32px rgba(13,45,94,0.12)", height: 320 }}>
              <img src={imgSrc} alt={actu.titre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            {actu.categorie && (
              <span style={{ background: couleur, color: "white", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20 }}>
                {actu.categorie}
              </span>
            )}
            {actu.date && (
              <span style={{ color: "#94a3b8", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                {actu.date}
              </span>
            )}
          </div>

          <h1 style={{ color: "#0d2d5e", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 900, lineHeight: 1.3, margin: "0 0 24px 0" }}>
            {actu.titre}
          </h1>

          <div style={{ width: 60, height: 4, background: "linear-gradient(90deg, #0d2d5e, #e07b20)", borderRadius: 2, marginBottom: 32 }}></div>

          <div style={{ color: "#374151", fontSize: 16, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
            {actu.contenu}
          </div>

          {/* CARTE CLUB */}
          {club && (
            <div style={{ marginTop: 48 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                À propos du club
              </div>
              <div style={{ background: "linear-gradient(135deg, #f8fafd, #eef4ff)", border: "1.5px solid #dde8f7", borderRadius: 20, padding: 28, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(13,45,94,0.04)", pointerEvents: "none" }}></div>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ width: 80, height: 80, borderRadius: 16, overflow: "hidden", border: "3px solid #dde8f7", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(13,45,94,0.1)" }}>
                    {clubLogo
                      ? <img src={clubLogo} alt={club.nom} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      : <span style={{ fontSize: 28, fontWeight: 900, color: "#0d2d5e" }}>{(club.nom || "C")[0].toUpperCase()}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <h3 style={{ color: "#0d2d5e", fontSize: 20, fontWeight: 900, margin: 0 }}>{club.nom}</h3>
                      {club.domaine && (
                        <span style={{ background: "#0d2d5e", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {club.domaine}
                        </span>
                      )}
                    </div>
                    {club.description && (
                      <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, margin: "0 0 16px 0" }}>
                        {club.description.length > 180 ? club.description.substring(0, 180) + "..." : club.description}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {club.instagram && (
                        <a href={club.instagram.startsWith("http") ? club.instagram : `https://www.instagram.com/${club.instagram.replace("@","")}`}
                          target="_blank" rel="noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 13, background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)", color: "white", boxShadow: "0 4px 14px rgba(131,58,180,0.3)", transition: "opacity 0.2s, transform 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                          Instagram
                        </a>
                      )}
                      <button onClick={() => navigate(`/clubs/${club.id}`)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10, fontWeight: 700, fontSize: 13, background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", color: "white", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(13,45,94,0.25)", transition: "opacity 0.2s, transform 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                        Voir la page du club
                      </button>
                    </div>
                    {club.email && (
                      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
                        <a href={`mailto:${club.email}`} style={{ color: "#0d2d5e", fontWeight: 600, textDecoration: "none" }}>{club.email}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid #f0f4f8" }}>
            <button onClick={() => navigate("/actualites")}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 10, background: "#f0f4ff", color: "#0d2d5e", border: "1.5px solid #dde8f7", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#dde8f7"}
              onMouseLeave={e => e.currentTarget.style.background = "#f0f4ff"}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Retour aux actualités
            </button>
          </div>
        </div>

        {/* Colonne droite : sidebar */}
        <div className="actu-sidebar" style={{ position: "sticky", top: 96 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f0f4f8", boxShadow: "0 2px 12px rgba(13,45,94,0.06)", marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Informations</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {actu.date && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: "#f0f4ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" fill="none" stroke="#0d2d5e" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Date</div>
                    <div style={{ fontSize: 14, color: "#0d2d5e", fontWeight: 700 }}>{actu.date}</div>
                  </div>
                </div>
              )}
              {actu.categorie && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: "#f0f4ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" fill="none" stroke="#0d2d5e" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Catégorie</div>
                    <span style={{ background: couleur, color: "white", fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20, display: "inline-block", marginTop: 2 }}>{actu.categorie}</span>
                  </div>
                </div>
              )}
              {club && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: "#f0f4ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" fill="none" stroke="#0d2d5e" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Club organisateur</div>
                    <div style={{ fontSize: 14, color: "#0d2d5e", fontWeight: 700 }}>{club.nom}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {autresActus.length > 0 && (
            <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f0f4f8", boxShadow: "0 2px 12px rgba(13,45,94,0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Autres actualités</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {autresActus.map(a => (
                  <div key={a.id}
                    style={{ display: "flex", gap: 12, cursor: "pointer", padding: "10px", borderRadius: 10, transition: "background 0.15s" }}
                    onClick={() => navigate(`/actualites/${a.id}`)}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafd"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ width: 56, height: 48, borderRadius: 8, overflow: "hidden", background: "#eef4ff", flexShrink: 0 }}>
                      {a.image
                        ? <img src={getImage(a.image)} alt={a.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 10, fontWeight: 700 }}>FSBM</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0d2d5e", lineHeight: 1.4, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {a.titre}
                      </div>
                      {a.date && <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.date}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/actualites")}
                style={{ marginTop: 16, width: "100%", padding: "10px", background: "#f0f4ff", border: "1.5px solid #dde8f7", borderRadius: 10, color: "#0d2d5e", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Voir toutes les actualités →
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dropFade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .actu-navbar-text { display: none !important; }
          .actu-main-grid { grid-template-columns: 1fr !important; }
          .actu-sidebar { position: static !important; }
        }
        @media (max-width: 768px) {
          nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .actu-navbar-text { display: none !important; }
          .actu-main-grid { grid-template-columns: 1fr !important; padding: 24px 20px !important; }
          .actu-sidebar { position: static !important; }
        }
        * { box-sizing: border-box; } body { margin: 0; }
      `}</style>
    </div>
  );
}
