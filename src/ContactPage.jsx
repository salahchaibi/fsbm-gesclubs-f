import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/LOGO.png";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", sujet: "", message: "" });
  const [sent, setSent] = useState(false);
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async () => {
  if (!form.prenom || !form.nom || !form.email || !form.message) return;
  try {
    await fetch("https://inspiring-creation-production-8d2c.up.railway.app/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSent(true);
  } catch (e) {
    alert("Erreur lors de l'envoi. Réessayez.");
  }
  };

  const iStyle = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0",
    borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box",
    color: "#1a2a4a", fontFamily: "inherit", background: "#f8fafc",
    transition: "border-color 0.2s",
  };

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
                  style={{ color: item.path === "/contact" ? "#0d2d5e" : "#1a2a4a", textDecoration: "none", padding: "8px 14px", borderRadius: "4px", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", backgroundColor: item.path === "/contact" ? "#eef4ff" : "transparent", transition: "color 0.2s, background 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#0d2d5e"; e.currentTarget.style.backgroundColor = "#eef4ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = item.path === "/contact" ? "#0d2d5e" : "#1a2a4a"; e.currentTarget.style.backgroundColor = item.path === "/contact" ? "#eef4ff" : "transparent"; }}>
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
        <div style={{ position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.04)", fontSize: "clamp(80px,14vw,180px)", fontWeight: "900", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>CONTACT</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", cursor: "pointer" }} onClick={() => navigate("/")}>Accueil</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
            <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: "600" }}>Contactez-nous</span>
          </div>
          <h1 style={{ color: "#ffffff", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "900", margin: "0 0 12px 0", letterSpacing: "-0.5px" }}>
            Contactez-nous
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", margin: "0 0 20px 0", maxWidth: 560 }}>
            Besoin d'informations ? Notre équipe est à votre disposition pour répondre à vos questions.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: "60px", height: "4px", background: "linear-gradient(90deg, #e07b20, #f59e0b)", borderRadius: "2px" }} />
          </div>
        </div>
      </div>

      {/* ===== INFOS RAPIDES ===== */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #f0f4f8", padding: "0 8%" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
          {[
            { icon: <svg width="20" height="20" fill="none" stroke="#0d2d5e" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: "Adresse", val: "Ben M'Sik, Casablanca" },
            { icon: <svg width="20" height="20" fill="none" stroke="#0d2d5e" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 4.18 2 2 0 015.09 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006.99 6.99l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>, label: "Téléphone", val: "(+212) 6 61 44 24 27" },
            { icon: <svg width="20" height="20" fill="none" stroke="#0d2d5e" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>, label: "Email", val: "fsbm.contact@univh2c.ma" },
            { icon: <svg width="20" height="20" fill="none" stroke="#0d2d5e" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: "Horaires", val: "Lun – Ven : 8h30 – 16h30" },
          ].map((info, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", borderRight: i < 3 ? "1px solid #f0f4f8" : "none" }}>
              <div style={{ width: 42, height: 42, background: "#eef4ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {info.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{info.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0d2d5e" }}>{info.val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 8%", display: "grid", gridTemplateColumns: "1fr 400px", gap: 32 }}>

        {/* ── Formulaire ── */}
        <div style={{ background: "white", borderRadius: 20, padding: 40, boxShadow: "0 4px 24px rgba(13,45,94,0.07)", border: "1px solid #f0f4f8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ width: 5, height: 36, background: "linear-gradient(180deg, #0d2d5e, #e07b20)", borderRadius: 3 }}></div>
            <div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0d2d5e" }}>Envoyez-nous un message</h3>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, marginTop: 2 }}>Nous vous répondrons dans les plus brefs délais</p>
            </div>
          </div>

          {sent ? (
            <div style={{ textAlign: "center", padding: "52px 0" }}>
              <div style={{ width: 80, height: 80, background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="36" height="36" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h4 style={{ fontSize: 22, fontWeight: 900, color: "#0d2d5e", margin: "0 0 10px 0" }}>Message envoyé !</h4>
              <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 28px 0" }}>Nous vous répondrons dans les plus brefs délais.</p>
              <button onClick={() => setSent(false)}
                style={{ background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", color: "#fff", border: "none", padding: "12px 32px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[{ name: "prenom", label: "Prénom *", ph: "Votre prénom" }, { name: "nom", label: "Nom *", ph: "Votre nom" }].map(f => (
                  <div key={f.name}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
                    <input name={f.name} type="text" placeholder={f.ph} value={form[f.name]} onChange={handleChange}
                      style={iStyle}
                      onFocus={e => e.currentTarget.style.borderColor = "#0d2d5e"}
                      onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"} />
                  </div>
                ))}
              </div>

              {[
                { name: "email", label: "Email *", ph: "votre.email@exemple.com", type: "email" },
                { name: "sujet", label: "Sujet", ph: "Sujet de votre message" },
              ].map(f => (
                <div key={f.name} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
                  <input name={f.name} type={f.type || "text"} placeholder={f.ph} value={form[f.name]} onChange={handleChange}
                    style={iStyle}
                    onFocus={e => e.currentTarget.style.borderColor = "#0d2d5e"}
                    onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"} />
                </div>
              ))}

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Message *</label>
                <textarea name="message" placeholder="Votre message..." rows={6} value={form.message} onChange={handleChange}
                  style={{ ...iStyle, resize: "vertical" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#0d2d5e"}
                  onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"} />
              </div>

              <button onClick={handleSubmit}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", color: "#ffffff", border: "none", padding: "13px 32px", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "opacity 0.2s, transform 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Envoyer le message
              </button>
            </>
          )}
        </div>

        {/* ── Sidebar infos ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Carte infos détaillées */}
          <div style={{ background: "linear-gradient(135deg, #0a1628, #0d2d5e)", borderRadius: 20, padding: 28, boxShadow: "0 8px 32px rgba(13,45,94,0.2)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }}></div>
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(224,123,32,0.08)" }}></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>Nos coordonnées</div>
              {[
                { icon: <svg width="16" height="16" fill="none" stroke="#e07b20" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: "Adresse", val: "Faculté des Sciences Ben M'Sik, Bd Driss El Harti, Casablanca" },
                { icon: <svg width="16" height="16" fill="none" stroke="#e07b20" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 4.18 2 2 0 015.09 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006.99 6.99l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>, label: "Téléphone", val: "(+212) 6 61 44 24 27" },
                { icon: <svg width="16" height="16" fill="none" stroke="#e07b20" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>, label: "Email", val: "fsbm.contact@univh2c.ma" },
                { icon: <svg width="16" height="16" fill="none" stroke="#e07b20" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: "Horaires", val: "Lun – Ven : 8h30 – 16h30" },
              ].map((info, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 16, marginBottom: i < 3 ? 16 : 0, borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {info.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 3 }}>{info.label}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 600, lineHeight: 1.5 }}>{info.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #f0f4f8", boxShadow: "0 4px 20px rgba(13,45,94,0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Suivez-nous</div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { href: "https://www.facebook.com/FSBMUH2C", color: "#1877f2", icon: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/> },
                { href: "https://x.com/uh2c_fsbm", color: "#000", icon: <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.43.36a9 9 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.6 1.64.9a4.52 4.52 0 00-.61 2.27c0 1.57.8 2.95 2.01 3.76a4.5 4.5 0 01-2.05-.57v.06c0 2.19 1.56 4.02 3.63 4.43a4.55 4.55 0 01-2.04.08 4.53 4.53 0 004.23 3.14A9.07 9.07 0 010 19.54a12.8 12.8 0 006.92 2.03c8.3 0 12.85-6.88 12.85-12.85l-.01-.59A9.17 9.17 0 0023 3z"/> },
                { href: "https://www.linkedin.com/showcase/fsbmunivh2c/", color: "#0a66c2", icon: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></> },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer"
                  style={{ width: 44, height: 44, borderRadius: 12, background: "#f0f4ff", border: "1.5px solid #dde8f7", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s, transform 0.2s", textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.background = s.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f0f4ff"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <svg width="18" height="18" fill="#0d2d5e" viewBox="0 0 24 24">{s.icon}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Carte FAQ rapide */}
          <div style={{ background: "linear-gradient(135deg, #f0f4ff, #eef4ff)", borderRadius: 20, padding: 24, border: "1px solid #dde8f7" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0d2d5e", marginBottom: 8 }}>💡 Besoin d'aide rapide ?</div>
            <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.7, margin: "0 0 16px 0" }}>
              Pour rejoindre un club, consultez la page <strong>Nos Clubs</strong>. Pour les actualités, visitez la section <strong>Actualités</strong>.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/clubs")}
                style={{ padding: "7px 14px", background: "#0d2d5e", color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Nos Clubs →
              </button>
              <button onClick={() => navigate("/actualites")}
                style={{ padding: "7px 14px", background: "white", color: "#0d2d5e", border: "1.5px solid #dde8f7", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Actualités →
              </button>
            </div>
          </div>

        </div>
      </div>
<style>{`
        @keyframes dropFade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
          div[style*="grid-template-columns: 1fr 400px"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        * { box-sizing: border-box; } body { margin: 0; }
      `}</style>
    </div>
  );
}
