import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/LOGO.png";

const STORAGE = "https://inspiring-creation-production-8d2c.up.railway.app/api";
const IMG = "https://inspiring-creation-production-8d2c.up.railway.app/storage";

const CATEGORIES = ["Toutes", "Formation", "Culturel", "Caravane", "Sport", "Workshops", "Événement", "Scientifique"];
const PER_PAGE = 6;

const categorieColor = {
  Formation:    "#e07b20",
  Culturel:     "#2a5ba5",
  Caravane:     "#16a34a",
  Sport:        "#dc2626",
  Workshops:    "#7c3aed",
  Événement:    "#0891b2",
  Scientifique: "#33c9ea",
};

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function ActualitesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [categorie, setCategorie] = useState("Toutes");
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Accueil",
      dropdown: [
        { label: "Actualités",        id: "actualites" },
        { label: "Chiffres clés",     id: "chiffres-cles" },
        { label: "Mot de la Direction", id: "mot-du-doyen" },
        { label: "Organigramme",      id: "organigramme" },
        { label: "Objectifs",         id: "objectifs" },
      ],
    },
    { label: "Actualités",    path: "/actualites" },
    { label: "Nos Clubs",     path: "/clubs" },
    { label: "Contactez-nous", path: "/contact" },
  ];

  const handleNavClick = (e, item) => {
    e.preventDefault();
    if (item.path) navigate(item.path);
  };

  useEffect(() => {
    fetch(`${STORAGE}/actualites`)
      .then(res => res.json())
      .then(data => {
        setActualites(Array.isArray(data) ? data : data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getImage = (actu) => {
    if (!actu.image) return null;
    if (actu.image.startsWith("http")) return actu.image;
    return `${IMG}/${actu.image}`;
  };

  const filtered = categorie === "Toutes"
    ? actualites
    : actualites.filter(a => a.categorie === categorie);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCategorie = (cat) => { setCategorie(cat); setPage(1); };

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f8fafd", minHeight: "100vh" }}>

      {/* ===== NAVBAR (identique à HomePage) ===== */}
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
                  style={{ color: item.path === "/actualites" ? "#0d2d5e" : "#1a2a4a", textDecoration: "none", padding: "8px 14px", borderRadius: "4px", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", backgroundColor: item.path === "/actualites" ? "#eef4ff" : "transparent", transition: "color 0.2s, background 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#0d2d5e"; e.currentTarget.style.backgroundColor = "#eef4ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = item.path === "/actualites" ? "#0d2d5e" : "#1a2a4a"; e.currentTarget.style.backgroundColor = item.path === "/actualites" ? "#eef4ff" : "transparent"; }}>
                  {item.label}
                  {item.dropdown && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4l4 4 4-4" strokeLinecap="round"/></svg>
                  )}
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
        <div style={{ position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.04)", fontSize: "clamp(80px,14vw,180px)", fontWeight: "900", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>FSBM</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", cursor: "pointer" }} onClick={() => navigate("/")}>Accueil</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
            <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: "600" }}>Actualités</span>
          </div>
          <h1 style={{ color: "#ffffff", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "900", margin: "0 0 12px 0", letterSpacing: "-0.5px" }}>
            Actualités & Annonces
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", margin: "0 0 20px 0" }}>
            Restez informé des dernières nouvelles et événements de la FSBM
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: "60px", height: "4px", background: "linear-gradient(90deg, #e07b20, #f59e0b)", borderRadius: "2px" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{actualites.length} actualités publiées</span>
          </div>
        </div>
      </div>

      {/* ===== FILTRES ===== */}
      <div style={{ backgroundColor: "#ffffff", borderBottom: "2px solid #f0f4f8", padding: "0 8%", display: "flex", gap: "4px", overflowX: "auto", position: "sticky", top: "72px", zIndex: 99, boxShadow: "0 2px 8px rgba(13,45,94,0.06)" }}>
        {CATEGORIES.map(cat => {
          const count = cat === "Toutes" ? actualites.length : actualites.filter(a => a.categorie === cat).length;
          return (
            <button key={cat} onClick={() => handleCategorie(cat)}
              style={{
                padding: "16px 18px", border: "none",
                borderBottom: categorie === cat ? "3px solid #0d2d5e" : "3px solid transparent",
                backgroundColor: "transparent",
                color: categorie === cat ? "#0d2d5e" : "#64748b",
                fontWeight: categorie === cat ? "700" : "500",
                fontSize: "13.5px", cursor: "pointer", whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 6,
                transition: "color 0.15s",
              }}>
              {cat}
              {count > 0 && (
                <span style={{ background: categorie === cat ? "#0d2d5e" : "#f0f4f8", color: categorie === cat ? "white" : "#64748b", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===== GRILLE ===== */}
      <div style={{ padding: "48px 8%" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Chargement des actualités...</div>
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
            <p style={{ fontSize: "16px", fontWeight: "600" }}>Aucune actualité pour cette catégorie.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px" }}>
            {paginated.map((actu) => {
              const imgSrc = getImage(actu);
              const couleur = categorieColor[actu.categorie] || "#0d2d5e";
              return (
                <div key={actu.id}
                  style={{ backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(13,45,94,0.07)", overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow 0.25s, transform 0.25s", cursor: "pointer", border: "1px solid #f0f4f8" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 36px rgba(13,45,94,0.14)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(13,45,94,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>

                  {/* Image */}
                  <div style={{ height: "200px", backgroundColor: "#eef4ff", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                    {imgSrc ? (
                      <img src={imgSrc} alt={actu.titre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #dde8f7, #eef4ff)" }}>
                        <div style={{ fontSize: "38px", fontWeight: "900", color: "#b8cde0" }}>Actualités</div>
                        <div style={{ fontSize: "24px", fontWeight: "900", color: "#a0bcd8" }}>FSBM</div>
                      </div>
                    )}
                    {/* Catégorie badge overlay */}
                    {actu.categorie && (
                      <div style={{ position: "absolute", top: 14, left: 14 }}>
                        <span style={{ backgroundColor: couleur, color: "#fff", fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                          {actu.categorie}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                    {/* Date + Club */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      {actu.date && (
                        <span style={{ color: "#94a3b8", fontSize: "12px", display: "flex", alignItems: "center", gap: 5 }}>
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                          {actu.date}
                        </span>
                      )}
                      {actu.club && (
                        <span style={{ background: "#f0f4ff", color: "#0d2d5e", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {actu.club?.nom || actu.club}
                        </span>
                      )}
                    </div>

                    <h3 style={{ color: "#0d2d5e", fontSize: "16px", fontWeight: "800", lineHeight: "1.45", margin: 0 }}>
                      {actu.titre}
                    </h3>

                    <p style={{ color: "#64748b", fontSize: "13.5px", lineHeight: "1.65", margin: 0, flex: 1 }}>
                      {actu.contenu && actu.contenu.length > 110
                        ? actu.contenu.substring(0, 110) + "..."
                        : actu.contenu}
                    </p>

                    {/* Bouton Lire Plus */}
                    <button
                      onClick={() => navigate(`/actualites/${actu.id}`)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", marginTop: "4px", width: "fit-content", transition: "opacity 0.2s, transform 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateX(3px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateX(0)"; }}>
                      Lire Plus
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "56px" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: "9px 18px", border: "1.5px solid #dde6f0", borderRadius: "8px", backgroundColor: "#fff", color: page === 1 ? "#b0c4de" : "#0d2d5e", fontWeight: "600", fontSize: "13px", cursor: page === 1 ? "not-allowed" : "pointer" }}>
              ‹ Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ width: "38px", height: "38px", border: "1.5px solid", borderColor: page === n ? "#0d2d5e" : "#dde6f0", borderRadius: "8px", backgroundColor: page === n ? "#0d2d5e" : "#fff", color: page === n ? "#fff" : "#0d2d5e", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: "9px 18px", border: "1.5px solid #dde6f0", borderRadius: "8px", backgroundColor: "#fff", color: page === totalPages ? "#b0c4de" : "#0d2d5e", fontWeight: "600", fontSize: "13px", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
              Suivant ›
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dropFade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) { nav { display: none !important; } .hamburger-btn { display: flex !important; } }
        * { box-sizing: border-box; } body { margin: 0; }
      `}</style>
    </div>
  );
}
