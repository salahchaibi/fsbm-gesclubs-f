import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/LOGO.png";
import { getInitialData } from "./ssrData";

const API = "/api";
const STORAGE = `${APP_URL}/storage`;

const chiffresDefaut = [
  { valeur: 6, label: "Scientifiques & Techniques", desc: "Clubs de sciences et technologies", icon: "🔬" },
  { valeur: 4, label: "Culturels & Artistiques",    desc: "Clubs culturels & artistiques",    icon: "🎨" },
  { valeur: 6, label: "Entrepreneuriat",             desc: "Clubs d'entrepreneuriat",          icon: "🚀" },
  { valeur: 3, label: "Humanitaires & Sociaux",      desc: "Actions humanitaires & sociales",  icon: "❤️" },
  { valeur: 4, label: "Sportifs & Santé",            desc: "Sport, santé et environnement",    icon: "⚽" },
];

const objectifsDefaut = [
  { title: "Développement Personnel", text: "Les clubs offrent aux étudiants l'occasion de renforcer leurs compétences transversales : communication, leadership, organisation et créativité.", icon: (<svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>) },
  { title: "Rayonnement Scientifique et Culturel", text: "À travers conférences, ateliers et projets innovants, les clubs contribuent à promouvoir le savoir scientifique et l'ouverture sur le monde.", icon: (<svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20"/></svg>) },
  { title: "Animation de la Vie Universitaire", text: "Les activités des clubs enrichissent la vie étudiante par des événements artistiques, sportifs et sociaux, renforçant l'esprit de communauté à la FSBM.", icon: (<svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>) },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Avatar = ({ nom, photo, size = 120, borderColor = "#fff", fontSize }) => {
  const STORAGE_URL = `${APP_URL}/storage`;
  const fs = fontSize || Math.round(size * 0.36);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: `4px solid ${borderColor}`, background: "linear-gradient(135deg, #1a4a8a, #0d2d5e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {photo
        ? <img src={photo.startsWith("http") ? photo : `${STORAGE_URL}/${photo}`} alt={nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontSize: fs, fontWeight: 800, color: "#ffffff", letterSpacing: -1 }}>{nom?.charAt(0) || "?"}</span>
      }
    </div>
  );
};

export default function HomePage() {
  const initialData = getInitialData().home || {};
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [counts, setCounts] = useState({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 });
  const [scrolled, setScrolled] = useState(false);
  const chiffresRef = useRef(null);
  const intervalRef = useRef(null);

  const [actualites, setActualites] = useState(Array.isArray(initialData.actualites) ? initialData.actualites : []);
  const [loadingActu, setLoadingActu] = useState(!Array.isArray(initialData.actualites));
  const [pageContent, setPageContent] = useState(initialData.pageContent ?? null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (Array.isArray(initialData.actualites)) return;
    fetch(`${API}/actualites`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.data || [];
        const recent = list.slice(-5).reverse();
        setActualites(recent.map(a => ({
         id: a.id, titre: a.titre, resume: a.contenu,
         image: a.image || null,
         categorie: a.categorie || "",
      })));
      })
      .catch(() => {})
      .finally(() => setLoadingActu(false));
  }, []);

  useEffect(() => {
    if (initialData.pageContent !== undefined) return;
    fetch(`${API}/page-accueil`)
      .then(r => r.json())
      .then(data => { if (data) setPageContent(data); })
      .catch(() => {});
  }, []);

  const navItems = [
    { label: "Accueil", dropdown: [
      { label: "Actualités", id: "actualites" },
      { label: "Chiffres clés", id: "chiffres-cles" },
      { label: "Mot de la Direction", id: "mot-du-doyen" },
      { label: "Organigramme", id: "organigramme" },
      { label: "Objectifs", id: "objectifs" },
    ]},
    { label: "Actualités", path: "/actualites" },
    { label: "Nos Clubs", path: "/clubs" },
    { label: "Contactez-nous", path: "/contact" },
  ];

  const goToSlide = (index) => {
    setFade(false);
    setTimeout(() => { setCurrentSlide(index); setFade(true); }, 300);
  };

  const startInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => { setCurrentSlide(prev => (prev + 1) % actualites.length); setFade(true); }, 300);
    }, 6000);
  };

  useEffect(() => {
    if (actualites.length > 0) startInterval();
    return () => clearInterval(intervalRef.current);
  }, [actualites.length]);

  useEffect(() => {
    const targets = chiffresDefaut.map(c => c.valeur);
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        targets.forEach((target, i) => {
          let val = 0;
          const timer = setInterval(() => {
            val += 1;
            if (val >= target) { val = target; clearInterval(timer); }
            setCounts(prev => ({ ...prev, [i]: val }));
          }, 300 / target);
        });
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    if (chiffresRef.current) observer.observe(chiffresRef.current);
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e, item) => {
    e.preventDefault();
    if (item.path) { navigate(item.path); setMenuOpen(false); }
    else if (!item.dropdown && item.id) { scrollTo(item.id); setMenuOpen(false); }
  };

  const slide = actualites[currentSlide] || null;

  const doyen = pageContent?.doyen || { nom: "Pr. Abdesslam El Bouari", titre: "Doyen de la FSBM", texte: "Les clubs étudiants représentent un pilier essentiel de la vie universitaire. Ils offrent aux étudiants une opportunité unique d'acquérir des compétences transversales : leadership, communication, esprit d'équipe, organisation et responsabilité.", photo: null };
  const viceDoyen = pageContent?.vice_doyen || { nom: "Pr. Radid Mohammed", titre: "Vice-Doyen chargé de la Vie Étudiante", texte: "Notre mission est de créer un environnement propice à l'épanouissement des étudiants, en encourageant les initiatives associatives, culturelles, sportives et scientifiques.", photo: null };
  const objectifs = pageContent?.objectifs || objectifsDefaut;
  const chiffres = chiffresDefaut;

  const organigramme = pageContent?.organigramme || {
    direction:    [{ nom: "Pr. Abdesslam El Bouari", role: "Doyen de la FSBM", photo: null }],
    vice_doyens:  [
      { nom: "Pr. Radid Mohammed",  role: "Vice-Doyen chargé des Affaires Pédagogiques", photo: null },
      { nom: "Pr. Mordane Soumia",  role: "Vice-Doyenne chargée de la Vie Étudiante", photo: null },
    ],
    responsables: [
      { nom: "Mr. Chaibi Said",  role: "Chargé de la vie universitaire et de la communication", photo: null },
      { nom: "Mr. Najih Hassan", role: "Responsable Activités culturelles, sportives et Vie estudiantine", photo: null },
    ],
  };

  const catColors = { Formation:"#3b82f6", Culturel:"#a855f7", Sport:"#22c55e", Scientifique:"#06b6d4", Événement:"#f59e0b", default:"#0d2d5e" };
  const slideColor = catColors[slide?.categorie] || catColors.default;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", margin: 0, padding: 0, background: "#fff" }}>

      {/* ── NAVBAR ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 1000, backgroundColor: scrolled ? "rgba(255,255,255,0.97)" : "#fff", borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent", backdropFilter: "blur(12px)", transition: "all 0.3s", boxShadow: scrolled ? "0 4px 24px rgba(13,45,94,0.10)" : "none" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src={logo} alt="Logo FSBM" style={{ height: 54, objectFit: "contain" }} />
            
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {navItems.map(item => (
              <div key={item.label} style={{ position: "relative" }}
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}>
                <a href="#" onClick={e => handleNavClick(e, item)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#334155", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#f0f6ff"; e.currentTarget.style.color = "#0d2d5e"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#334155"; }}>
                  {item.label}
                  {item.dropdown && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4l4 4 4-4" strokeLinecap="round"/></svg>}
                </a>
                {item.dropdown && activeDropdown === item.label && (
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#fff", borderRadius: 12, boxShadow: "0 16px 48px rgba(13,45,94,0.15)", border: "1px solid #e8f0fb", minWidth: 240, overflow: "hidden", animation: "ddFade 0.15s ease" }}>
                    {item.dropdown.map((sub, si) => (
                      <a key={sub.label} href="#" onClick={e => { e.preventDefault(); scrollTo(sub.id); setActiveDropdown(null); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", color: "#334155", textDecoration: "none", fontSize: 13.5, fontWeight: 500, borderBottom: si < item.dropdown.length - 1 ? "1px solid #f1f5f9" : "none", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f0f6ff"; e.currentTarget.style.color = "#0d2d5e"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#334155"; }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0d2d5e", flexShrink: 0 }} />
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <button onClick={() => navigate("/login")}
            style={{ background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em", transition: "opacity 0.2s, transform 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
            Connexion
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger-btn"
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "#0d2d5e", padding: 8 }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div style={{ background: "#fff", borderTop: "1px solid #e2e8f0" }}>
            {navItems.map(item => (
              <div key={item.label}>
                <a href="#" onClick={e => handleNavClick(e, item)} style={{ display: "block", padding: "13px 24px", color: "#0d2d5e", textDecoration: "none", fontSize: 14, fontWeight: 700, borderBottom: "1px solid #f1f5f9" }}>{item.label}</a>
                {item.dropdown?.map(sub => (
                  <a key={sub.label} href="#" onClick={e => { e.preventDefault(); scrollTo(sub.id); setMenuOpen(false); }}
                    style={{ display: "block", padding: "10px 40px", color: "#64748b", textDecoration: "none", fontSize: 13, borderBottom: "1px solid #f8fafc", background: "#fafbff" }}>
                    — {sub.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* ── HERO SLIDER ── */}
      <section id="actualites" style={{ position: "relative", minHeight: 520, background: "linear-gradient(160deg, #f8faff 0%, #eef4ff 50%, #f0f7ff 100%)", overflow: "hidden" }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(13,45,94,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, left: -60, width: 340, height: 340, borderRadius: "50%", background: "rgba(224,123,32,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "10%", left: "2%", width: 160, height: 160, borderRadius: "50%", background: "rgba(13,45,94,0.03)", pointerEvents: "none" }} />

        {/* Watermark */}
        <div style={{ position: "absolute", right: "-2%", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", userSelect: "none", lineHeight: 0.85 }}>
          <div style={{ fontSize: "clamp(70px, 9vw, 130px)", fontWeight: 900, color: "rgba(13,45,94,0.05)", letterSpacing: -4 }}>FSBM</div>
          <div style={{ fontSize: "clamp(40px, 5vw, 80px)", fontWeight: 900, color: "rgba(13,45,94,0.04)", letterSpacing: -2 }}>CLUBS</div>
        </div>

        {loadingActu ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 520, gap: 16, flexDirection: "column" }}>
            <div style={{ width: 44, height: 44, border: "3px solid #dde8f7", borderTop: "3px solid #0d2d5e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ color: "#64748b", fontWeight: 600 }}>Chargement…</span>
          </div>
        ) : actualites.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 520, gap: 12, flexDirection: "column" }}>
            <svg width="48" height="48" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            <span style={{ color: "#94a3b8", fontWeight: 600 }}>Aucune actualité pour le moment</span>
          </div>
        ) : (
          <>
            <div className="hero-grid" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 64px", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", minHeight: 520, gap: 64, position: "relative", zIndex: 2 }}>
              {/* Text side */}
              <div style={{ padding: "60px 0", opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(12px)", transition: "all 0.35s ease" }}>
                {slide?.categorie && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${slideColor}15`, border: `1px solid ${slideColor}30`, borderRadius: 20, padding: "4px 14px", marginBottom: 16 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: slideColor }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: slideColor, letterSpacing: "0.08em", textTransform: "uppercase" }}>{slide.categorie}</span>
                  </div>
                )}
                <h1 style={{ fontSize: "clamp(24px, 3.2vw, 44px)", fontWeight: 900, color: "#0d2d5e", lineHeight: 1.2, margin: "0 0 18px", letterSpacing: -0.5 }}>{slide?.titre}</h1>
                <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.8, margin: "0 0 36px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{slide?.resume}</p>
                <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                  <button onClick={() => navigate(`/actualites/${slide?.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 8, background: "#0d2d5e", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.02em" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#1a4a8a"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#0d2d5e"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    Lire l'article
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                  <button onClick={() => navigate("/actualites")}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", color: "#0d2d5e", border: "1.5px solid #cbd5e1", padding: "11px 22px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#0d2d5e"; e.currentTarget.style.background = "#f0f6ff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "transparent"; }}>
                    Toutes les actualités
                  </button>
                </div>
              </div>
              {/* Image side */}
              <div className="hero-image" style={{ opacity: fade ? 1 : 0, transform: fade ? "scale(1)" : "scale(0.97)", transition: "all 0.35s ease", padding: "48px 0" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", inset: -8, borderRadius: 20, background: "linear-gradient(135deg, rgba(13,45,94,0.1), rgba(224,123,32,0.08))", zIndex: 0 }} />
                  <div style={{ borderRadius: 16, overflow: "hidden", height: 340, position: "relative", zIndex: 1, background: "#dde8f7" }}>
                    {slide?.image
                      ? <img src={slide.image} alt={slide.titre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #dde8f7, #c8d9ef)" }}>
                          <svg width="64" height="64" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                    }
                    {/* Slide counter badge */}
                    <div style={{ position: "absolute", bottom: 16, right: 16, background: "rgba(13,45,94,0.85)", borderRadius: 20, padding: "4px 12px", backdropFilter: "blur(8px)" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{currentSlide + 1} / {actualites.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nav arrows */}
            {[{ dir: "prev", action: () => { goToSlide((currentSlide - 1 + actualites.length) % actualites.length); startInterval(); }, style: { left: 16 }, path: "M15 18l-6-6 6-6" },
              { dir: "next", action: () => { goToSlide((currentSlide + 1) % actualites.length); startInterval(); }, style: { right: 16 }, path: "M9 18l6-6-6-6" }
            ].map(({ dir, action, style: s, path }) => (
              <button key={dir} onClick={action} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "#fff", border: "1.5px solid #e2e8f0", color: "#0d2d5e", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transition: "all 0.2s", ...s }}
                onMouseEnter={e => { e.currentTarget.style.background = "#0d2d5e"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#0d2d5e"; }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d={path}/></svg>
              </button>
            ))}

            {/* Dots */}
            <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 10 }}>
              {actualites.map((_, i) => (
                <button key={i} onClick={() => { goToSlide(i); startInterval(); }}
                  style={{ width: i === currentSlide ? 28 : 8, height: 8, borderRadius: 4, border: "none", background: i === currentSlide ? "#0d2d5e" : "#b0c4de", padding: 0, cursor: "pointer", transition: "all 0.3s ease" }} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── CHIFFRES CLÉS ── */}
      <section id="chiffres-cles" ref={chiffresRef} style={{ background: "#0d2d5e", padding: "80px 5%", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(224,123,32,0.08)", pointerEvents: "none" }} />
        <div style={{ textAlign: "center", marginBottom: 56, position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 30, padding: "5px 18px", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#e07b20", letterSpacing: "0.1em", textTransform: "uppercase" }}>En chiffres</span>
          </div>
          <h2 style={{ fontSize: 34, fontWeight: 900, color: "#fff", margin: 0 }}>Nos Clubs par Domaine</h2>
          <div style={{ width: 60, height: 4, background: "linear-gradient(90deg, #e07b20, #f59e0b)", margin: "16px auto 0", borderRadius: 2 }} />
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 2, position: "relative", zIndex: 1 }}>
          {chiffres.map((c, i) => {
            const val = pageContent?.chiffres ? (pageContent.chiffres[i]?.valeur ?? c.valeur) : counts[i];
            const lbl = pageContent?.chiffres ? (pageContent.chiffres[i]?.label || c.label) : c.label;
            const dsc = pageContent?.chiffres ? (pageContent.chiffres[i]?.desc || c.desc) : c.desc;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "32px 16px", borderRight: i < 4 ? "1px solid rgba(255,255,255,0.08)" : "none", transition: "background 0.2s", borderRadius: i === 0 ? "12px 0 0 12px" : i === 4 ? "0 12px 12px 0" : 0, cursor: "default" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ fontSize: 36 }}>{c.icon}</div>
                <div style={{ fontSize: "clamp(40px, 4vw, 58px)", fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: -2 }}>{val}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#e07b20", letterSpacing: "0.07em", textAlign: "center", textTransform: "uppercase", lineHeight: 1.3 }}>{lbl}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.5 }}>{dsc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── MOT DE LA DIRECTION ── */}
      <section id="mot-du-doyen" style={{ background: "#fff", padding: "96px 8%" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0f6ff", border: "1px solid #dde8ff", borderRadius: 30, padding: "5px 18px", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0d2d5e", letterSpacing: "0.1em", textTransform: "uppercase" }}>Direction de la Faculté</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "#0d2d5e", margin: 0 }}>Mot de la Direction</h2>
          <div style={{ width: 70, height: 4, background: "linear-gradient(90deg, #0d2d5e, #e07b20)", margin: "16px auto 0", borderRadius: 2 }} />
        </div>

        {/* Doyen card */}
        <div style={{ background: "linear-gradient(135deg, #0a2548 0%, #0d2d5e 40%, #163d78 100%)", borderRadius: 24, padding: "56px 60px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: "linear-gradient(90deg, #e07b20, #f59e0b, #e07b20)" }} />
          <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, left: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(224,123,32,0.06)", pointerEvents: "none" }} />
          <div style={{ display: "flex", gap: 56, alignItems: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, flexShrink: 0 }}>
              <Avatar nom={doyen.nom} photo={doyen.photo} size={180} borderColor="rgba(255,255,255,0.25)" />
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(224,123,32,0.2)", border: "1px solid rgba(224,123,32,0.35)", borderRadius: 20, padding: "5px 16px" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase" }}>✦ Doyen</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 4px" }}>{doyen.nom}</h3>
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1.5px", margin: "0 0 24px", textTransform: "uppercase" }}>{doyen.titre}</p>
              <div style={{ width: 40, height: 3, background: "#e07b20", borderRadius: 2, marginBottom: 24 }} />
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", top: -16, left: -8, fontSize: 72, color: "rgba(255,255,255,0.07)", fontFamily: "Georgia, serif", lineHeight: 1 }}>"</span>
                <p style={{ fontSize: 17, color: "rgba(255,255,255,0.82)", lineHeight: 1.9, margin: 0, paddingLeft: 16 }}>{doyen.texte}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vice-Doyen card */}
        <div style={{ background: "#f8fafd", borderRadius: 20, padding: "44px 56px", border: "1.5px solid #e2eaf4", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 5, background: "linear-gradient(180deg, #0d2d5e, #e07b20)", borderRadius: "4px 0 0 4px" }} />
          <div style={{ display: "flex", gap: 44, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <Avatar nom={viceDoyen.nom} photo={viceDoyen.photo} size={140} borderColor="#dde8f7" />
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#eef4ff", border: "1px solid #dde8ff", borderRadius: 20, padding: "4px 14px" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#0d2d5e", letterSpacing: "0.08em", textTransform: "uppercase" }}>Vice-Doyen</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: "#0d2d5e", margin: "0 0 4px" }}>{viceDoyen.nom}</h3>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "1.2px", margin: "0 0 20px", textTransform: "uppercase" }}>{viceDoyen.titre}</p>
              <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.9, margin: 0 }}>{viceDoyen.texte}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ORGANIGRAMME ── */}
      <section id="organigramme" style={{ background: "linear-gradient(180deg, #f8fafd 0%, #eef4ff 100%)", padding: "96px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 30, padding: "5px 18px", marginBottom: 16, boxShadow: "0 2px 8px rgba(13,45,94,0.06)" }}>
            <svg width="14" height="14" fill="none" stroke="#0d2d5e" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0d2d5e", letterSpacing: "0.1em", textTransform: "uppercase" }}>Structure</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "#0d2d5e", margin: 0 }}>Organigramme</h2>
          <div style={{ width: 70, height: 4, background: "linear-gradient(90deg, #0d2d5e, #e07b20)", margin: "16px auto 0", borderRadius: 2 }} />
          <p style={{ color: "#64748b", marginTop: 12, fontSize: 15 }}>Direction et responsables de la vie universitaire — FSBM</p>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          {/* Niveau 1 — Doyen */}
          <OrgCard person={organigramme.direction[0]} badge="Doyen" badgeColor="#e07b20" niveau="top" />
          <Connector />

          {/* Niveau 2 — Vice-Doyens */}
          <div style={{ display: "flex", justifyContent: "center", width: "100%", position: "relative", alignItems: "flex-start" }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "45%", height: 0, borderTop: "2px solid #cbd5e1" }} />
            <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", paddingTop: 0 }}>
              <OrgCard person={organigramme.vice_doyens[0]} badge="Vice-Doyen" badgeColor="#1d4ed8" niveau="mid" />
              <OrgCard person={organigramme.vice_doyens[1]} badge="Vice-Doyenne" badgeColor="#7c3aed" niveau="mid" />
            </div>
          </div>
          <Connector />

          {/* Niveau 3 — Responsables */}
          <div style={{ display: "flex", justifyContent: "center", width: "100%", position: "relative", alignItems: "flex-start" }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "36%", height: 0, borderTop: "2px solid #e2e8f0" }} />
            <div style={{ display: "flex", gap: 36, justifyContent: "center", flexWrap: "wrap" }}>
              {organigramme.responsables.map((p, i) => (
                <OrgCard key={i} person={p} badge="Responsable" badgeColor="#059669" niveau="low" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OBJECTIFS ── */}
      <section id="objectifs" style={{ background: "#fff", padding: "96px 8%" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0f6ff", border: "1px solid #dde8ff", borderRadius: 30, padding: "5px 18px", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0d2d5e", letterSpacing: "0.1em", textTransform: "uppercase" }}>Nos missions</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "#0d2d5e", margin: 0 }}>Objectifs des Clubs Étudiants</h2>
          <div style={{ width: 70, height: 4, background: "linear-gradient(90deg, #0d2d5e, #e07b20)", margin: "16px auto 0", borderRadius: 2 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28, maxWidth: 1100, margin: "0 auto" }}>
          {objectifs.map((obj, i) => {
            const accents = ["#0d2d5e", "#e07b20", "#2a5ba5"];
            const lightBgs = ["#dde8f7", "#fde8ce", "#dde8f7"];
            return (
              <div key={i} style={{ background: "#f8fafd", borderRadius: 20, padding: "40px 32px", borderTop: `5px solid ${accents[i % 3]}`, position: "relative", overflow: "hidden", transition: "transform 0.25s, box-shadow 0.25s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 20px 48px rgba(13,45,94,0.13)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `${accents[i % 3]}08`, pointerEvents: "none" }} />
                <div style={{ width: 60, height: 60, background: lightBgs[i % 3], borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, color: accents[i % 3] }}>
                  {obj.icon || <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: "#0d2d5e", margin: "0 0 14px" }}>{obj.title}</h3>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.8, margin: 0 }}>{obj.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER ── */}
     <footer style={{ background: "#0a2548", color: "#94a3b8", padding: "64px 8% 0" }}>

  {/* Top section: logo + nav + contact */}
  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 48, paddingBottom: 40 }}>
    <div>
      <img src={logo} alt="FSBM" style={{ height: 48, objectFit: "contain", filter: "brightness(0) invert(1)", marginBottom: 16 }} />
      <p style={{ fontSize: 14, lineHeight: 1.8, color: "#64748b", margin: "0 0 24px", maxWidth: 320 }}>La FSBM, une faculté qui valorise le talent, la créativité et l'engagement de ses étudiants.</p>
      <div style={{ display: "flex", gap: 12 }}>
        {[
          { href: "https://www.facebook.com/FSBMUH2C", path: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/> },
          { href: "https://x.com/uh2c_fsbm", path: <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.43.36a9 9 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.6 1.64.9a4.52 4.52 0 00-.61 2.27c0 1.57.8 2.95 2.01 3.76a4.5 4.5 0 01-2.05-.57v.06c0 2.19 1.56 4.02 3.63 4.43a4.55 4.55 0 01-2.04.08 4.53 4.53 0 004.23 3.14A9.07 9.07 0 010 19.54a12.8 12.8 0 006.92 2.03c8.3 0 12.85-6.88 12.85-12.85l-.01-.59A9.17 9.17 0 0023 3z"/> },
          { href: "https://www.linkedin.com/showcase/fsbmunivh2c/", path: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></> },
        ].map((s, i) => (
          <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
            style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "all 0.2s", textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,123,32,0.15)"; e.currentTarget.style.color = "#e07b20"; e.currentTarget.style.borderColor = "rgba(224,123,32,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">{s.path}</svg>
          </a>
        ))}
      </div>
    </div>

    <div>
      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 20px" }}>Navigation</h4>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {[{ label: "Actualités", path: "/actualites" }, { label: "Nos Clubs", path: "/clubs" }, { label: "Contactez-nous", path: "/contact" }].map(item => (
          <li key={item.label}>
            <a href="#" onClick={e => { e.preventDefault(); navigate(item.path); }}
              style={{ color: "#64748b", textDecoration: "none", fontSize: 14, display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#e07b20"}
              onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
              <span style={{ color: "#e07b20", fontSize: 8 }}>▶</span>{item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 20px" }}>Contact</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { icon: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>, extra: <circle cx="12" cy="10" r="3"/>, text: "Bd Driss El Harti, Ben M'Sik, Casablanca" },
          { icon: <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 4.18 2 2 0 015.09 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006.99 6.99l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>, text: "(+212) 6 61 44 24 27" },
          { icon: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></>, text: "fsbm.contact@univh2c.ma" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ color: "#e07b20", flexShrink: 0, marginTop: 2 }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{item.icon}{item.extra}</svg>
            </span>
            <span style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6 }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Knowledge / credits strip — compact single line */}
  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 0", fontSize: 12.5, color: "#64748b", lineHeight: 1.8 }}>
    <span style={{ color: "#e07b20", fontWeight: 700 }}>Réaliser par</span>{" "}
    Douaa Naggour et Hania M'lissa, étudiantes en 3ème année Dev. Info
    <span style={{ margin: "0 10px", color: "#334155" }}>—</span>
    <span style={{ color: "#e07b20", fontWeight: 700 }}>Sous direction de </span>{" "}
    Pr. Hafsa Ouchra et Pr. Mohamed Ait Daoud et Mr. Said Chaibi
  </div>

  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "18px 0", textAlign: "center" }}>
    <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>© {new Date().getFullYear()} Faculté des Sciences Ben M'Sick</p>
  </div>
  {/* ✅ RESPONSIVE — Media query via style tag */}
  <style>{`
    @media (max-width: 768px) {
      footer > div:first-child {
        grid-template-columns: 1fr !important;
      }
    }
  `}</style>
</footer>
      <style>{`
  @keyframes ddFade { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @media (max-width: 900px) {
    nav { display: none !important; }
    .hamburger-btn { display: flex !important; }
  }
  @media (max-width: 768px) {
    .hero-grid { grid-template-columns: 1fr !important; padding: 0 20px !important; gap: 24px !important; }
    .hero-image { display: none !important; }
    .navbar-subtitle { display: none !important; }
    .connexion-btn { padding: 8px 14px !important; font-size: 12px !important; }
    .chiffres-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .doyen-flex { flex-direction: column !important; gap: 24px !important; padding: 28px 20px !important; }
    .org-row { flex-direction: column !important; align-items: center !important; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; }
`}</style>
  </div>
 );
}

function Connector() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "0" }}>
      <div style={{ width: 2, height: 40, background: "linear-gradient(180deg, #0d2d5e40, #cbd5e1)" }} />
    </div>
  );
}

function OrgCard({ person, badge, badgeColor, niveau }) {
  const STORAGE_URL = `${APP_URL}/storage`;
  const sizes = { top: 120, mid: 100, low: 80 };
  const cardWidths = { top: 300, mid: 270, low: 250 };
  const size = sizes[niveau];
  const isTop = niveau === "top";

  return (
    <div style={{ width: cardWidths[niveau], background: isTop ? "linear-gradient(135deg, #0a2548, #0d2d5e)" : "#fff", border: isTop ? "none" : "1.5px solid #e2eaf4", borderRadius: 20, padding: "32px 24px 24px", textAlign: "center", position: "relative", boxShadow: isTop ? "0 20px 56px rgba(13,45,94,0.28)" : "0 4px 20px rgba(13,45,94,0.07)", transition: "transform 0.2s, box-shadow 0.2s", cursor: "default" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = isTop ? "0 28px 64px rgba(13,45,94,0.38)" : "0 12px 36px rgba(13,45,94,0.14)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isTop ? "0 20px 56px rgba(13,45,94,0.28)" : "0 4px 20px rgba(13,45,94,0.07)"; }}>
      {isTop && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #e07b20, #f59e0b)", borderRadius: "20px 20px 0 0" }} />}
      <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: badgeColor, borderRadius: 20, padding: "4px 14px", border: "2.5px solid #fff", boxShadow: `0 4px 12px ${badgeColor}50` }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{badge}</span>
      </div>
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", margin: "8px auto 16px", border: isTop ? "4px solid rgba(255,255,255,0.2)" : "3px solid #dde8f7", background: "linear-gradient(135deg, #1a4a8a, #0d2d5e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isTop ? "0 8px 24px rgba(0,0,0,0.25)" : "0 4px 12px rgba(13,45,94,0.12)" }}>
        {person?.photo
          ? <img src={person.photo.startsWith("http") ? person.photo : `${STORAGE_URL}/${person.photo}`} alt={person?.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: Math.round(size * 0.36), fontWeight: 900, color: "#ffffff" }}>{person?.nom?.charAt(0) || "?"}</span>
        }
      </div>
      <div style={{ fontSize: isTop ? 16 : 14, fontWeight: 800, color: isTop ? "#fff" : "#0d2d5e", marginBottom: 6, lineHeight: 1.3 }}>{person?.nom}</div>
      <div style={{ fontSize: 12, color: isTop ? "rgba(255,255,255,0.55)" : "#64748b", lineHeight: 1.5, fontStyle: "italic" }}>{person?.role}</div>
    </div>
  );
  
}
