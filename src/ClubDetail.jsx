import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "./assets/LOGO.png";
import { getInitialData } from "./ssrData";

const STORAGE = "/storage";

const domaineColor = {
  Scientifique:    { light: "#dde8f7", dark: "#2a5ba5",  grad: "135deg, #2a5ba5, #1a4a8a" },
  Culturel:        { light: "#fde8ce", dark: "#e07b20",  grad: "135deg, #e07b20, #c96a10" },
  Entrepreneuriat: { light: "#d1fae5", dark: "#059669",  grad: "135deg, #059669, #047857" },
  Humanitaire:     { light: "#fce7f3", dark: "#be185d",  grad: "135deg, #be185d, #9d174d" },
  Sport:           { light: "#e0f2fe", dark: "#0369a1",  grad: "135deg, #0369a1, #075985" },
};

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function ClubDetail() {
  const initialData = getInitialData().clubDetail || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const hasInitial = String(initialData.id) === String(id) && initialData.club;
  const [club, setClub] = useState(hasInitial ? initialData.club : null);
  const [loading, setLoading] = useState(!hasInitial);
  const [notFound, setNotFound] = useState(false);
  const [evenements, setEvenements] = useState(hasInitial ? (initialData.evenements || []) : []);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("apropos");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nom: "", prenom: "", email: "", telephone: "", filiere: "", codeApogee: "", message: "" });
  const [carteEtudiant, setCarteEtudiant] = useState(null);
  const [cartePreview, setCartePreview] = useState(null);
  const carteRef = useRef();
  const [formStatus, setFormStatus] = useState(null);
  const [msgForm, setMsgForm] = useState({ nom: "", email: "", message: "" });
  const [msgStatus, setMsgStatus] = useState(null);

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
    fetch(`/api/clubs/${id}`)
      .then(res => { if (!res.ok) { setNotFound(true); setLoading(false); return null; } return res.json(); })
      .then(data => { if (data) { setClub(data); setLoading(false); } })
      .catch(() => { setNotFound(true); setLoading(false); });

    fetch(`/api/evenements`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.data || [];
        setEvenements(list.filter(e => String(e.club_id) === String(id) && e.statut === "valide"));
      })
      .catch(() => setEvenements([]));
  }, [id, hasInitial]);

  const handleJoindre = async (e) => {
    e.preventDefault();
    setFormStatus("loading");
    try {
      const fd = new FormData();
      fd.append("nom", formData.nom);
      fd.append("prenom", formData.prenom);
      fd.append("email", formData.email);
      fd.append("telephone", formData.telephone);
      fd.append("filiere", formData.filiere);
      fd.append("code_apogee", formData.codeApogee);
      fd.append("message", formData.message);
      fd.append("club_id", id);
      if (carteEtudiant) fd.append("carte_etudiant", carteEtudiant);

      const res = await fetch(`/api/demandes-adhesion`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error();
      setFormStatus("success");
    } catch { setFormStatus("error"); }
  };

  const openModal = () => {
    setFormData({ nom: "", prenom: "", email: "", telephone: "", filiere: "", codeApogee: "", message: "" });
    setCarteEtudiant(null);
    setCartePreview(null);
    setFormStatus(null);
    setShowModal(true);
  };

  const handleMessage = async (e) => {
    e.preventDefault();
    setMsgStatus("loading");
    try {
      const res = await fetch(`/api/messages-club`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...msgForm, club_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      setMsgStatus("success");
      setMsgForm({ nom: "", email: "", message: "" });
    } catch { setMsgStatus("error"); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f8fafd" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "4px solid #dde8f7", borderTop: "4px solid #0d2d5e", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}></div>
        <p style={{ color: "#94a3b8", fontWeight: 600 }}>Chargement...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f8fafd" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
      <p style={{ color: "#e07b20", fontSize: "20px", fontWeight: "700" }}>Club introuvable</p>
      <button onClick={() => navigate("/clubs")} style={{ marginTop: "16px", backgroundColor: "#0d2d5e", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>
        Retour aux clubs
      </button>
    </div>
  );

  const clubLogo = club.logo ? (club.logo.startsWith('http') ? club.logo : `${STORAGE}/${club.logo}`) : null;
  const couleur = domaineColor[club.domaine] || { light: "#dde8f7", dark: "#0d2d5e", grad: "135deg, #0d2d5e, #1a4a8a" };

  let membres = [];
  try {
    membres = club.membres_bureau
      ? (typeof club.membres_bureau === "string" ? JSON.parse(club.membres_bureau) : club.membres_bureau)
      : [];
    if (!Array.isArray(membres)) membres = [];
  } catch { membres = []; }

  const getEventImage = (ev) => {
    if (!ev.image) return null;
    if (ev.image.startsWith("http")) return ev.image;
    return `${STORAGE}/${ev.image}`;
  };

  const tabs = [
    { id: "apropos",    label: "À propos" },
    { id: "bureau",     label: "Bureau" },
    { id: "evenements", label: `Événements (${evenements.length})` },
    { id: "contact",    label: "Contact" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f8fafd", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <header style={{ position: "sticky", top: 0, zIndex: 1000, backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" style={{ width: "150px", height: "60px", objectFit: "contain" }} />
            <div className="club-navbar-text" style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
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

      {/* HERO */}
      <div style={{ position: "relative", minHeight: 420, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: clubLogo ? `url(${clubLogo}) center/cover no-repeat` : `linear-gradient(${couleur.grad})`, filter: "blur(2px) brightness(0.25)", transform: "scale(1.05)" }}></div>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, rgba(10,22,40,0.85) 0%, rgba(13,45,94,0.75) 60%, rgba(26,74,138,0.6) 100%)` }}></div>
        <div className="club-hero-grid" style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "52px 8% 48px", display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer" }} onClick={() => navigate("/")}>Accueil</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer" }} onClick={() => navigate("/clubs")}>Nos Clubs</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{club.nom}</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `linear-gradient(${couleur.grad})`, borderRadius: 30, padding: "6px 16px", marginBottom: 16, boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "white", opacity: 0.8 }}></span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "white", letterSpacing: "0.08em", textTransform: "uppercase" }}>{club.domaine}</span>
            </div>
            <h1 style={{ color: "#ffffff", fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900, margin: "0 0 14px 0", lineHeight: 1.1 }}>{club.nom}</h1>
            {club.description && (
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.7, margin: "0 0 28px 0", maxWidth: 560 }}>
                {club.description.length > 160 ? club.description.substring(0, 160) + "..." : club.description}
              </p>
            )}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              {club.anneeCreation && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 16px" }}>
                  <svg width="16" height="16" fill="none" stroke="#e07b20" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  <div><div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Créé en {club.anneeCreation}</div><div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Année de fondation</div></div>
                </div>
              )}
              {club.nb_membres && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 16px" }}>
                  <svg width="16" height="16" fill="none" stroke="#e07b20" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                  <div><div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{club.nb_membres} membres</div><div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Communauté active</div></div>
                </div>
              )}
              {club.statut && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(5,150,105,0.2)", border: "1px solid rgba(5,150,105,0.4)", borderRadius: 12, padding: "10px 16px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,0.3)" }}></div>
                  <span style={{ color: "#6ee7b7", fontWeight: 700, fontSize: 14 }}>{club.statut}</span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={openModal}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 10, background: "linear-gradient(135deg, #e07b20, #f59e0b)", color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 6px 20px rgba(224,123,32,0.4)", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                Rejoindre le club
              </button>
              <button onClick={() => setActiveTab("contact")}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 10, background: "rgba(255,255,255,0.1)", color: "white", border: "2px solid rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Nous contacter
              </button>
            </div>
          </div>
          <div className="club-hero-logo" style={{ flexShrink: 0 }}>
            <div style={{ width: 200, height: 200, borderRadius: 24, background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              {clubLogo
                ? <img src={clubLogo} alt={club.nom} style={{ width: 160, height: 160, objectFit: "contain", borderRadius: 16 }} />
                : <span style={{ fontSize: 80, fontWeight: 900, color: "white", opacity: 0.8 }}>{club.nom.charAt(0)}</span>
              }
            </div>
            {club.parrain && (
              <div style={{ marginTop: 14, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 3 }}>Professeur accompagnant</div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>{club.parrain}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ backgroundColor: "#ffffff", borderBottom: "2px solid #f0f4f8", position: "sticky", top: 72, zIndex: 99, boxShadow: "0 2px 8px rgba(13,45,94,0.06)", overflowX: "auto" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 8%", display: "flex", gap: 4, minWidth: "max-content" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: "16px 22px", border: "none", borderBottom: activeTab === tab.id ? `3px solid ${couleur.dark}` : "3px solid transparent", backgroundColor: "transparent", color: activeTab === tab.id ? couleur.dark : "#64748b", fontWeight: activeTab === tab.id ? 700 : 500, fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENU TABS */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 8%" }}>

        {/* À PROPOS */}
        {activeTab === "apropos" && (
          <div className="club-apropos-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 28 }}>
            <div style={{ background: "white", borderRadius: 20, padding: 36, border: "1px solid #f0f4f8", boxShadow: "0 4px 20px rgba(13,45,94,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 5, height: 36, background: `linear-gradient(${couleur.grad})`, borderRadius: 3 }}></div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0d2d5e" }}>À propos du club</h2>
              </div>
              <p style={{ color: "#4a6080", fontSize: 16, lineHeight: 1.9, margin: "0 0 28px 0" }}>
                {club.description || "Informations sur ce club bientôt disponibles."}
              </p>
              {club.mot_president && (
                <div style={{ background: couleur.light, borderLeft: `4px solid ${couleur.dark}`, borderRadius: "0 14px 14px 0", padding: "18px 22px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: couleur.dark, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Mot du Président</div>
                  <p style={{ margin: 0, color: "#374151", fontSize: 15, lineHeight: 1.8, fontStyle: "italic" }}>"{club.mot_president}"</p>
                  {club.president_nom && <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: couleur.dark }}>— {club.president_nom}</div>}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24, paddingTop: 20, borderTop: "1px solid #f0f4f8" }}>
                {club.nb_membres && <span style={{ background: "#eef4ff", color: "#0d2d5e", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20 }}>👥 {club.nb_membres} membres</span>}
                {club.anneeCreation && <span style={{ background: "#fff3e0", color: "#a05a00", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20 }}>📅 Depuis {club.anneeCreation}</span>}
                {club.statut && <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20 }}>✓ {club.statut}</span>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #f0f4f8", boxShadow: "0 4px 20px rgba(13,45,94,0.06)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Informations</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
                    { label: "Domaine",   val: club.domaine },
                    { label: "Catégorie", val: club.categorie },
                    { label: "Parrain",   val: club.parrain },
                    { label: "Email",     val: club.email },
                    { label: "Instagram", val: club.instagram },
                    { label: "Statut",    val: club.statut },
                  ].filter(r => r.val).map((row, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f8fafc" }}>
                      <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>{row.label}</span>
                      <span style={{ color: "#0d2d5e", fontSize: 13, fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={openModal}
                style={{ width: "100%", padding: "14px", borderRadius: 14, background: `linear-gradient(${couleur.grad})`, color: "white", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: `0 6px 20px ${couleur.dark}40`, transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                Rejoindre ce club →
              </button>
            </div>
          </div>
        )}

        {/* BUREAU */}
        {activeTab === "bureau" && (
          <div>
            <h2 style={{ color: "#0d2d5e", fontSize: 24, fontWeight: 900, margin: "0 0 8px 0" }}>Équipe du bureau</h2>
            <div style={{ width: 60, height: 4, background: `linear-gradient(${couleur.grad})`, borderRadius: 2, marginBottom: 32 }}></div>
            {(!club.president_nom && membres.length === 0) ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", background: "white", borderRadius: 20, border: "1px dashed #e2e8f0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                <p style={{ fontWeight: 600 }}>Informations du bureau bientôt disponibles.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
                {club.president_nom && (
                  <div style={{ background: `linear-gradient(${couleur.grad})`, borderRadius: 20, padding: "28px 20px", textAlign: "center", boxShadow: `0 8px 28px ${couleur.dark}30` }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                      <svg width="36" height="36" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 20c1.3-3.5 4-5 7-5s5.7 1.5 7 5"/></svg>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Président(e)</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "white", lineHeight: 1.3, marginBottom: 8 }}>{club.president_nom}</div>
                    {club.president_email && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{club.president_email}</div>}
                  </div>
                )}
                {membres.filter(m => m.est_bureau).map((m, i) => (
                  <div key={i} style={{ background: "white", borderRadius: 20, padding: "28px 20px", textAlign: "center", border: "1px solid #f0f4f8", boxShadow: "0 4px 16px rgba(13,45,94,0.07)", transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(13,45,94,0.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(13,45,94,0.07)"; }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: couleur.light, border: `3px solid ${couleur.dark}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                      <svg width="36" height="36" fill="none" stroke={couleur.dark} strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 20c1.3-3.5 4-5 7-5s5.7 1.5 7 5"/></svg>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: couleur.dark, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{m.role}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0d2d5e", lineHeight: 1.3 }}>{m.nom} {m.prenom}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ÉVÉNEMENTS */}
        {activeTab === "evenements" && (
          <div>
            <h2 style={{ color: "#0d2d5e", fontSize: 24, fontWeight: 900, margin: "0 0 8px 0" }}>Événements du club</h2>
            <div style={{ width: 60, height: 4, background: `linear-gradient(${couleur.grad})`, borderRadius: 2, marginBottom: 32 }}></div>
            {evenements.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", background: "white", borderRadius: 20, border: "1px dashed #e2e8f0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                <p style={{ fontWeight: 600 }}>Aucun événement pour le moment.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                {evenements.map((ev, i) => {
                  const imgSrc = getEventImage(ev);
                  return (
                    <div key={i} style={{ background: "white", borderRadius: 18, overflow: "hidden", border: "1px solid #f0f4f8", boxShadow: "0 4px 16px rgba(13,45,94,0.07)", transition: "transform 0.2s, box-shadow 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(13,45,94,0.12)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(13,45,94,0.07)"; }}>
                      <div style={{ height: 180, overflow: "hidden", background: `linear-gradient(${couleur.grad})`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                        {imgSrc
                          ? <img src={imgSrc} alt={ev.titre} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                          : <svg width="48" height="48" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        }
                      </div>
                      <div style={{ padding: 20 }}>
                        <div style={{ fontSize: 12, color: couleur.dark, fontWeight: 700, marginBottom: 8 }}>📅 {ev.date}{ev.heure && ` · ${ev.heure}`}</div>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 800, color: "#0d2d5e" }}>{ev.titre}</h3>
                        {ev.contenu && <p style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: 13.5, lineHeight: 1.6 }}>{ev.contenu.substring(0, 100)}{ev.contenu.length > 100 && "..."}</p>}
                        {ev.lieu && <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>📍 {ev.lieu}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONTACT */}
        {activeTab === "contact" && (
          <div className="club-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: "white", borderRadius: 20, padding: 32, border: "1px solid #f0f4f8", boxShadow: "0 4px 20px rgba(13,45,94,0.06)" }}>
              <h3 style={{ margin: "0 0 24px 0", fontSize: 20, fontWeight: 900, color: "#0d2d5e" }}>Informations de contact</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {club.email && (
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 0", borderBottom: "1px solid #f0f4f8" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: couleur.light, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="20" height="20" fill="none" stroke={couleur.dark} strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 3 }}>EMAIL</div>
                      <a href={`mailto:${club.email}`} style={{ color: "#0d2d5e", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>{club.email}</a>
                    </div>
                  </div>
                )}
                {club.instagram && (
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 0", borderBottom: "1px solid #f0f4f8" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: couleur.light, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="20" height="20" fill="none" stroke={couleur.dark} strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill={couleur.dark} stroke="none"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 3 }}>INSTAGRAM</div>
                      <a href={`https://instagram.com/${club.instagram.replace("@","")}`} target="_blank" rel="noreferrer"
                        style={{ color: couleur.dark, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                        {club.instagram}
                      </a>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 0", borderBottom: "1px solid #f0f4f8" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: couleur.light, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" fill="none" stroke={couleur.dark} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 3 }}>LOCALISATION</div>
                    <div style={{ color: "#0d2d5e", fontWeight: 700, fontSize: 14 }}>Faculté des Sciences Ben M'Sik</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 0" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: couleur.light, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" fill="none" stroke={couleur.dark} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 3 }}>DOMAINE</div>
                    <div style={{ color: "#0d2d5e", fontWeight: 700, fontSize: 14 }}>{club.domaine}</div>
                  </div>
                </div>
              </div>
              <button onClick={openModal}
                style={{ marginTop: 24, width: "100%", padding: 14, borderRadius: 12, background: `linear-gradient(${couleur.grad})`, color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Rejoindre ce club →
              </button>
            </div>

            <div style={{ background: "white", borderRadius: 20, padding: 32, border: "1px solid #f0f4f8", boxShadow: "0 4px 20px rgba(13,45,94,0.06)" }}>
              <h3 style={{ margin: "0 0 24px 0", fontSize: 20, fontWeight: 900, color: "#0d2d5e" }}>Envoyer un message</h3>
              {msgStatus === "success" ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <p style={{ color: "#065f46", fontWeight: 700, fontSize: 16, margin: "0 0 8px" }}>Message envoyé !</p>
                  <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 20px" }}>Le club vous répondra bientôt.</p>
                  <button onClick={() => setMsgStatus(null)}
                    style={{ padding: "9px 24px", background: "#0d2d5e", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMessage}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nom *</label>
                    <input required type="text" value={msgForm.nom} onChange={e => setMsgForm({ ...msgForm, nom: e.target.value })} placeholder="Votre nom"
                      style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", background: "#f8fafc", color: "#0d2d5e", boxSizing: "border-box" }}
                      onFocus={e => e.currentTarget.style.borderColor = couleur.dark}
                      onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email *</label>
                    <input required type="email" value={msgForm.email} onChange={e => setMsgForm({ ...msgForm, email: e.target.value })} placeholder="Votre email"
                      style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", background: "#f8fafc", color: "#0d2d5e", boxSizing: "border-box" }}
                      onFocus={e => e.currentTarget.style.borderColor = couleur.dark}
                      onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Message *</label>
                    <textarea required value={msgForm.message} onChange={e => setMsgForm({ ...msgForm, message: e.target.value })} placeholder="Votre message..." rows={4}
                      style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", background: "#f8fafc", color: "#0d2d5e", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                      onFocus={e => e.currentTarget.style.borderColor = couleur.dark}
                      onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"} />
                  </div>
                  {msgStatus === "error" && <p style={{ color: "#dc2626", fontSize: 13, margin: "-8px 0 12px" }}>Erreur lors de l'envoi. Réessayez.</p>}
                  {!club.email && <p style={{ color: "#d97706", fontSize: 13, margin: "-8px 0 12px" }}>⚠️ Ce club n'a pas encore d'email configuré.</p>}
                  <button type="submit" disabled={msgStatus === "loading" || !club.email}
                    style={{ width: "100%", padding: 14, borderRadius: 12, background: "#0d2d5e", color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: club.email ? "pointer" : "not-allowed", opacity: (msgStatus === "loading" || !club.email) ? 0.7 : 1 }}
                    onMouseEnter={e => { if (club.email) e.currentTarget.style.background = "#1a4a8a"; }}
                    onMouseLeave={e => e.currentTarget.style.background = "#0d2d5e"}>
                    {msgStatus === "loading" ? "Envoi en cours..." : "Envoyer le message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL REJOINDRE */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: "white", borderRadius: 20, padding: 32, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h2 style={{ margin: 0, color: "#0d2d5e", fontSize: 20, fontWeight: 900 }}>Rejoindre {club.nom}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#94a3b8" }}>×</button>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: "4px 0 24px" }}>Remplissez ce formulaire — le responsable examinera votre demande.</p>

            {formStatus === "success" ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
                <p style={{ color: "#065f46", fontWeight: 700, fontSize: 17, margin: "0 0 8px" }}>Demande envoyée avec succès !</p>
                <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 20px" }}>Le responsable du club vous contactera bientôt.</p>
                <button style={{ padding: "10px 28px", background: "#0d2d5e", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}
                  onClick={() => { setShowModal(false); setFormStatus(null); }}>Fermer</button>
              </div>
            ) : (
              <form onSubmit={handleJoindre}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {[{ label: "Nom *", key: "nom", ph: "Votre nom" }, { label: "Prénom *", key: "prenom", ph: "Votre prénom" }].map(f => (
                    <div key={f.key}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
                      <input required value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} placeholder={f.ph}
                        style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fafafa" }} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="votre@email.com"
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fafafa" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {[
                    { label: "Téléphone", key: "telephone", ph: "06XXXXXXXX" },
                    { label: "Filière", key: "filiere", ph: "Ex: Informatique" },
                    { label: "Code Apogée", key: "codeApogee", ph: "Ex: 12345678" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
                      <input value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} placeholder={f.ph}
                        style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fafafa" }} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Photo carte étudiant
                    <span style={{ marginLeft: 6, fontSize: 10, color: "#cbd5e1", fontWeight: 500, textTransform: "none" }}>(JPG, PNG — max 5 Mo)</span>
                  </label>
                  <div onClick={() => carteRef.current.click()}
                    style={{ border: "2px dashed #dde8f7", borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, background: "#fafcff", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = couleur.dark}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#dde8f7"}>
                    {cartePreview ? (
                      <>
                        <img src={cartePreview} alt="Carte étudiant" style={{ width: 72, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0d2d5e" }}>{carteEtudiant.name}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Cliquer pour changer</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: couleur.light, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="22" height="22" fill="none" stroke={couleur.dark} strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/><circle cx="16" cy="15" r="1" fill={couleur.dark}/></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0d2d5e" }}>Ajouter la photo de la carte d'étudiants</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Cliquer pour sélectionner</div>
                        </div>
                      </>
                    )}
                    <input ref={carteRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => {
                        const f = e.target.files[0];
                        if (f) { setCarteEtudiant(f); setCartePreview(URL.createObjectURL(f)); }
                      }} />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Message</label>
                  <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="Pourquoi voulez-vous rejoindre ce club ?" rows={3}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", background: "#fafafa" }} />
                </div>
                {formStatus === "error" && <p style={{ color: "#dc2626", fontSize: 13, margin: "-8px 0 12px" }}>Une erreur est survenue. Réessayez.</p>}
                <button type="submit" disabled={formStatus === "loading"}
                  style={{ width: "100%", padding: 13, background: `linear-gradient(${couleur.grad})`, color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: formStatus === "loading" ? 0.7 : 1 }}>
                  {formStatus === "loading" ? "Envoi en cours..." : "Envoyer ma demande"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropFade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .club-navbar-text { display: none !important; }
        }
        @media (max-width: 768px) {
          nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .club-navbar-text { display: none !important; }
          .club-hero-grid { grid-template-columns: 1fr !important; padding: 32px 20px !important; }
          .club-hero-logo { display: none !important; }
          .club-apropos-grid { grid-template-columns: 1fr !important; }
          .club-contact-grid { grid-template-columns: 1fr !important; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
