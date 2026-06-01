import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DemandeEvenementForm from "./DemandeEvenementForm";

const API = "https://inspiring-creation-production-8d2c.up.railway.app/api";
const STORAGE = "https://inspiring-creation-production-8d2c.up.railway.app/storage";

const ROLES_BUREAU = ["Président", "Vice-président", "Secrétaire", "Trésorier", "Responsable Communication", "Responsable Événements", "Membre"];

const iStyle = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
  borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none",
  background: "#fafafa", color: "#1e293b", resize: "vertical",
  fontFamily: "inherit", transition: "border-color 0.2s"
};

const Badge = ({ statut }) => {
  const map = {
    en_attente: { bg: "#fef3c7", color: "#d97706", label: "En attente" },
    valide:     { bg: "#d1fae5", color: "#059669", label: "Validé" },
    refuse:     { bg: "#fee2e2", color: "#dc2626", label: "Refusé" },
    accepte:    { bg: "#d1fae5", color: "#059669", label: "Accepté" },
    rejete:     { bg: "#fee2e2", color: "#dc2626", label: "Refusé" },
  };
  const s = map[statut] || { bg: "#f3f4f6", color: "#6b7280", label: statut || "—" };
  return <span style={{ background: s.bg, color: s.color, padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em" }}>{s.label}</span>;
};

const Alert = ({ msg }) => {
  if (!msg.text) return null;
  const c = { success: ["#ecfdf5","#065f46","#6ee7b7"], error: ["#fef2f2","#991b1b","#fca5a5"], warning: ["#fffbeb","#92400e","#fcd34d"] }[msg.type] || ["#ecfdf5","#065f46","#6ee7b7"];
  return <div style={{ background: c[0], color: c[1], border: `1px solid ${c[2]}`, padding: "12px 18px", borderRadius: 10, marginBottom: 20, fontWeight: 500, fontSize: 14 }}>{msg.text}</div>;
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: "white", borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", ...style }}>
    {children}
  </div>
);

const Input = ({ label, value, onChange, type = "text", full = false, textarea = false, rows = 3, placeholder = "" }) => (
  <div style={full ? { gridColumn: "1 / -1" } : {}}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
    {textarea
      ? <textarea value={value || ""} onChange={onChange} rows={rows} placeholder={placeholder} style={iStyle} />
      : <input type={type} value={value || ""} onChange={onChange} placeholder={placeholder} style={iStyle} />
    }
  </div>
);

const Btn = ({ children, onClick, variant = "primary", style = {} }) => {
  const variants = {
    primary: { background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", color: "white", border: "none" },
    orange:  { background: "linear-gradient(135deg, #e07b20, #f59e0b)", color: "white", border: "none" },
    ghost:   { background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" },
    danger:  { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
    success: { background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" },
  };
  return (
    <button onClick={onClick} style={{ ...variants[variant], padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity 0.15s", ...style }}>
      {children}
    </button>
  );
};

const TabIcon = ({ icon }) => {
  const icons = {
    club: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
    evt:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    mbr:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    dem:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
    demandeevt: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  };
  return icons[icon] || null;
};

const responsiveCSS = `
  .dash-layout { display: flex; min-height: calc(100vh - 64px); }
  .dash-sidebar { width: 230px; background: white; border-right: 1px solid #f1f5f9; padding-top: 20px; flex-shrink: 0; box-shadow: 2px 0 12px rgba(0,0,0,0.03); }
  .dash-main { flex: 1; padding: 32px 36px; overflow: auto; }
  .dash-header-btns { display: flex; align-items: center; gap: 10px; }
  .dash-header-club-btn { display: flex; }
  .dash-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .dash-grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .dash-grid-bureau { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .dash-grid-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
  .dash-club-header { display: flex; align-items: center; gap: 28px; }
  .dash-demande-card { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .dash-demande-actions { display: flex; gap: 8px; flex-shrink: 0; }

  @media (max-width: 900px) {
    .dash-layout { flex-direction: column; }
    .dash-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #f1f5f9; padding-top: 0; display: flex; flex-direction: column; }
    .dash-sidebar-stats { display: none; }
    .dash-sidebar-menu { display: flex; flex-direction: row; overflow-x: auto; padding: 8px 12px; gap: 4px; }
    .dash-sidebar-menu button { white-space: nowrap; border-right: none !important; border-bottom: 3px solid transparent; border-radius: 8px !important; }
    .dash-main { padding: 20px 16px; }
    .dash-grid-2 { grid-template-columns: 1fr; }
    .dash-grid-bureau { grid-template-columns: repeat(2, 1fr); }
    .dash-club-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  }

  @media (max-width: 600px) {
    .dash-grid-form { grid-template-columns: 1fr; }
    .dash-grid-form > * { grid-column: auto !important; }
    .dash-grid-bureau { grid-template-columns: 1fr 1fr; }
    .dash-grid-stats { grid-template-columns: 1fr; gap: 10px; }
    .dash-header-club-btn { display: none; }
    .dash-demande-card { flex-direction: column; align-items: flex-start; }
    .dash-demande-actions { width: 100%; justify-content: flex-end; margin-top: 8px; }
    .dash-main { padding: 16px 12px; }
  }

  @media (max-width: 400px) {
    .dash-grid-bureau { grid-template-columns: 1fr; }
  }
`;

export default function DashboardAdmin({ utilisateur, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("club");

  const [club, setClub] = useState(null);
  const [clubForm, setClubForm] = useState({});
  const [clubMsg, setClubMsg] = useState({ text: "", type: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoInputRef = useRef();

  const [programmeFichier, setProgrammeFichier] = useState(null);
  const programmeRef = useRef();

  const [evenements, setEvenements] = useState([]);
  const [evtForm, setEvtForm] = useState({ titre: "", contenu: "", date: "", lieu: "", heure: "" });
  const [evtPhoto, setEvtPhoto] = useState(null);
  const [evtPhotoPreview, setEvtPhotoPreview] = useState(null);
  const [evtMsg, setEvtMsg] = useState({ text: "", type: "" });
  const [showEvtForm, setShowEvtForm] = useState(false);
  const evtPhotoRef = useRef();

  const [demandes, setDemandes] = useState([]);
  const [demandesMsg, setDemandesMsg] = useState({ text: "", type: "" });
  const [loadingDemandes, setLoadingDemandes] = useState(false);

  const [membres, setMembres] = useState([]);
  const [membresMsg, setMembresMsg] = useState({ text: "", type: "" });
  const [showMembreForm, setShowMembreForm] = useState(false);
  const [membreForm, setMembreForm] = useState({ nom: "", prenom: "", email: "", role: "Membre actif", est_bureau: false });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!utilisateur) { navigate("/login"); return; }
    fetchClub();
    fetchEvenements();
    fetchDemandes();
  }, [utilisateur]);

  const fetchClub = async () => {
    if (!utilisateur?.club_id) return;
    try {
      const res = await axios.get(`${API}/clubs/${utilisateur.club_id}`, { headers });
      setClub(res.data);
      setClubForm(res.data);
      if (res.data.membres_bureau) {
        try {
          const m = typeof res.data.membres_bureau === "string"
            ? JSON.parse(res.data.membres_bureau)
            : res.data.membres_bureau;
          if (Array.isArray(m)) setMembres(m);
        } catch (e) { setMembres([]); }
      }
    } catch (e) { console.error(e); }
  };

  const fetchEvenements = async () => {
    try {
      const res = await axios.get(`${API}/evenements`, { headers });
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setEvenements(data.filter(e => String(e.club_id) === String(utilisateur.club_id)));
    } catch (e) { console.error(e); }
  };

  const fetchDemandes = async () => {
    setLoadingDemandes(true);
    try {
      const res = await axios.get(`${API}/demandes-adhesion?club_id=${utilisateur.club_id}`, { headers });
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      const enAttente = data.filter(d => !d.statut || d.statut === "en_attente");
      setDemandes(enAttente);
    } catch (e) {
      setDemandesMsg({ text: "Impossible de charger les demandes.", type: "error" });
    } finally { setLoadingDemandes(false); }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleProgrammeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProgrammeFichier(file);
  };

  const deleteProgramme = async () => {
    if (!window.confirm("Supprimer le programme annuel ?")) return;
    try {
      await axios.delete(`${API}/clubs/${utilisateur.club_id}/programme`, { headers });
      setClub({ ...club, programme_fichier: null });
      setClubForm({ ...clubForm, programme_fichier: null });
      setClubMsg({ text: "Programme supprimé !", type: "success" });
    } catch (e) {
      setClubMsg({ text: "Erreur lors de la suppression.", type: "error" });
    }
    setTimeout(() => setClubMsg({ text: "", type: "" }), 3000);
  };

  const saveClub = async (updatedMembres = null, nbTotal = undefined) => {
    try {
      const formData = new FormData();
      const data = { ...clubForm };
      if (updatedMembres !== null) {
        data.membres_bureau = JSON.stringify(updatedMembres);
        data.nb_membres = nbTotal !== undefined ? nbTotal : (parseInt(clubForm.nb_membres) || updatedMembres.length);
      }
      Object.entries(data).forEach(([k, v]) => {
        if (v !== null && v !== undefined) formData.append(k, v);
      });
      if (logoFile) formData.append("logo", logoFile);
      if (programmeFichier) formData.append("programme_fichier", programmeFichier);
      formData.append("_method", "PUT");
      const res = await axios.post(`${API}/clubs/${utilisateur.club_id}`, formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setClub(res.data);
      setClubForm(res.data);
      if (updatedMembres !== null) setMembres(updatedMembres);
      setClubMsg({ text: "Club mis à jour avec succès !", type: "success" });
      setLogoFile(null);
      setProgrammeFichier(null);
    } catch (e) {
      setClubMsg({ text: "Erreur lors de la mise à jour.", type: "error" });
    }
    setTimeout(() => setClubMsg({ text: "", type: "" }), 3000);
  };

  const handleEvtPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEvtPhoto(file);
    setEvtPhotoPreview(URL.createObjectURL(file));
  };

  const addEvenement = async () => {
    if (!evtForm.titre || !evtForm.date) {
      setEvtMsg({ text: "Le titre et la date sont obligatoires.", type: "warning" });
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(evtForm).forEach(([k, v]) => { if (v) formData.append(k, v); });
      formData.append("club_id", utilisateur.club_id);
      formData.append("statut", "en_attente");
      if (evtPhoto) formData.append("image", evtPhoto);
      await axios.post(`${API}/evenements`, formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setEvtMsg({ text: "Événement soumis pour validation !", type: "success" });
      setEvtForm({ titre: "", contenu: "", date: "", lieu: "", heure: "" });
      setEvtPhoto(null); setEvtPhotoPreview(null);
      setShowEvtForm(false);
      fetchEvenements();
    } catch (e) {
      setEvtMsg({ text: "Erreur lors de l'ajout.", type: "error" });
    }
    setTimeout(() => setEvtMsg({ text: "", type: "" }), 3000);
  };

  const deleteEvenement = async (id) => {
    if (!window.confirm("Supprimer cet événement ?")) return;
    try {
      await axios.delete(`${API}/evenements/${id}`, { headers });
      fetchEvenements();
    } catch (e) { alert("Erreur lors de la suppression."); }
  };

  const traiterDemande = async (id, action) => {
    try {
      await axios.put(`${API}/demandes-adhesion/${id}`, { statut: action }, { headers });
      setDemandesMsg({ text: `Demande ${action === "accepte" ? "acceptée" : "refusée"} — email envoyé !`, type: "success" });
      setDemandes(prev => prev.filter(d => String(d.id) !== String(id)));
    } catch (e) {
      setDemandesMsg({ text: "Erreur lors du traitement.", type: "error" });
    }
    setTimeout(() => setDemandesMsg({ text: "", type: "" }), 4000);
  };

  const addMembre = async () => {
    if (!membreForm.nom || !membreForm.prenom) {
      setMembresMsg({ text: "Nom et prénom obligatoires.", type: "warning" });
      return;
    }
    const newMembre = { ...membreForm, id: Date.now() };
    const updated = [...membres, newMembre];
    const nbActuel = parseInt(clubForm.nb_membres) || 0;
    setClubForm(prev => ({ ...prev, nb_membres: nbActuel + 1 }));
    await saveClub(updated, nbActuel + 1);
    setMembreForm({ nom: "", prenom: "", email: "", role: "Membre actif", est_bureau: false });
    setShowMembreForm(false);
    setMembresMsg({ text: "Membre ajouté avec succès !", type: "success" });
    setTimeout(() => setMembresMsg({ text: "", type: "" }), 3000);
  };

  const deleteMembre = async (id) => {
    if (!window.confirm("Supprimer ce membre ?")) return;
    const updated = membres.filter(m => m.id !== id);
    const nbActuel = parseInt(clubForm.nb_membres) || 0;
    const newNb = Math.max(0, nbActuel - 1);
    setClubForm(prev => ({ ...prev, nb_membres: newNb }));
    await saveClub(updated, newNb);
    setMembresMsg({ text: "Membre supprimé.", type: "success" });
    setTimeout(() => setMembresMsg({ text: "", type: "" }), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout && onLogout();
    navigate("/login");
  };

  const getProgrammeNom = () => {
    if (!club?.programme_fichier) return null;
    const parts = club.programme_fichier.split("/");
    return parts[parts.length - 1];
  };

  const getProgrammeIcon = (nom) => {
    if (!nom) return null;
    const ext = nom.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return { color: "#dc2626", bg: "#fee2e2", label: "PDF" };
    if (["doc","docx"].includes(ext)) return { color: "#1d4ed8", bg: "#dbeafe", label: "WORD" };
    return { color: "#64748b", bg: "#f1f5f9", label: ext?.toUpperCase() };
  };

  const tabs = [
    { id: "club",        label: "Mon Club",            icon: "club" },
    { id: "evenements",  label: "Événements",          icon: "evt",        count: evenements.length },
    { id: "membres",     label: "Membres",             icon: "mbr",        count: membres.length },
    { id: "demandes",    label: "Demandes",            icon: "dem",        count: demandes.length },
    { id: "demande_evt", label: "Demande événement",   icon: "demandeevt" },
  ];

  const logoSrc = logoPreview || (club?.logo ? (club.logo.includes("/") ? `${STORAGE}/${club.logo}` : null) : null);
  const membresBureau = membres.filter(m => m.est_bureau);
  const membresSimples = membres.filter(m => !m.est_bureau);
  const programmeNom = getProgrammeNom();
  const programmeIcon = getProgrammeIcon(programmeFichier?.name || programmeNom);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{responsiveCSS}</style>

      {/* HEADER */}
      <header style={{ background: "linear-gradient(135deg, #0a2040 0%, #0d2d5e 100%)", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 24px rgba(13,45,94,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#e07b20,#f59e0b)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "white", flexShrink: 0 }}>
            {utilisateur?.nom?.[0]?.toUpperCase() || "R"}
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{utilisateur?.prenom} {utilisateur?.nom}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 1 }}>Responsable · {club?.nom || "..."}</div>
          </div>
        </div>

        <div className="dash-header-btns">
          <button onClick={() => navigate(`/clubs/${utilisateur.club_id}`)} className="dash-header-club-btn"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Voir la page
          </button>
          <button onClick={handleLogout}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.75)", padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
            Déconnexion
          </button>
        </div>
      </header>

      <div className="dash-layout">
        {/* SIDEBAR */}
        <aside className="dash-sidebar">
          <div className="dash-sidebar-menu">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: activeTab === tab.id ? "#f0f7ff" : "transparent", border: "none", borderRight: activeTab === tab.id ? "3px solid #0d2d5e" : "3px solid transparent", color: activeTab === tab.id ? "#0d2d5e" : "#64748b", fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500, cursor: "pointer", textAlign: "left", transition: "all 0.15s", marginBottom: 2, borderRadius: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <TabIcon icon={tab.icon} />
                  {tab.label}
                </span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span style={{
                    background: activeTab === tab.id ? "#0d2d5e" : "#e2e8f0",
                    color: activeTab === tab.id ? "white" : "#64748b",
                    borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 700,
                  }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
          <div className="dash-sidebar-stats" style={{ margin: "20px 12px 0", padding: 16, background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", borderRadius: 14 }}>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Aperçu</div>
            {[
              { label: "Membres",     val: membres.length },
              { label: "Événements",  val: evenements.length },
              { label: "Demandes",    val: demandes.length },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>{s.label}</span>
                <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{s.val}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main className="dash-main">

          {/* ══════════ MON CLUB ══════════ */}
          {activeTab === "club" && (
            <div style={{ maxWidth: 900 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Mon Club</h2>
                <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>Gérez les informations publiques de votre club</p>
              </div>
              <Alert msg={clubMsg} />

              <Card style={{ marginBottom: 20 }}>
                <div className="dash-club-header">
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div onClick={() => logoInputRef.current.click()}
                      style={{ width: 100, height: 100, borderRadius: 18, border: "2px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", background: "#f8fafc" }}>
                      {logoSrc
                        ? <img src={logoSrc} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        : <div style={{ textAlign: "center", color: "#94a3b8" }}>
                            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            <div style={{ fontSize: 10, marginTop: 4, fontWeight: 600 }}>Logo</div>
                          </div>
                      }
                    </div>
                    <div onClick={() => logoInputRef.current.click()}
                      style={{ position: "absolute", bottom: -4, right: -4, width: 26, height: 26, background: "#0d2d5e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                      <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: "none" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{club?.nom || "..."}</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>{club?.domaine} · {club?.categorie}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        { label: `${clubForm.nb_membres || membres.length} membres`, bg: "#dbeafe", color: "#1d4ed8" },
                        { label: club?.statut || "Actif", bg: "#dcfce7", color: "#15803d" },
                        { label: `Depuis ${club?.anneeCreation || "—"}`, bg: "#fef3c7", color: "#d97706" },
                      ].map(t => (
                        <span key={t.label} style={{ background: t.bg, color: t.color, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{t.label}</span>
                      ))}
                    </div>
                    {logoFile && <div style={{ marginTop: 8, fontSize: 12, color: "#059669", fontWeight: 600 }}>Nouveau logo : {logoFile.name}</div>}
                  </div>
                </div>
              </Card>

              {club && (
                <Card style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #f1f5f9" }}>Informations du club</div>
                  <div className="dash-grid-form">
                    <Input label="Nom du club" value={clubForm.nom} onChange={e => setClubForm({ ...clubForm, nom: e.target.value })} />
                    <Input label="Email" value={clubForm.email} onChange={e => setClubForm({ ...clubForm, email: e.target.value })} type="email" />
                    <Input label="Instagram" value={clubForm.instagram} onChange={e => setClubForm({ ...clubForm, instagram: e.target.value })} placeholder="@nom_du_club" />
                    <Input label="Domaine" value={clubForm.domaine} onChange={e => setClubForm({ ...clubForm, domaine: e.target.value })} />
                    <Input label="Catégorie" value={clubForm.categorie} onChange={e => setClubForm({ ...clubForm, categorie: e.target.value })} />
                    <Input label="Parrain" value={clubForm.parrain} onChange={e => setClubForm({ ...clubForm, parrain: e.target.value })} />
                    <Input label="Année de création" value={clubForm.anneeCreation} onChange={e => setClubForm({ ...clubForm, anneeCreation: e.target.value })} />
                    <Input label="Nombre de membres" value={clubForm.nb_membres} onChange={e => setClubForm({ ...clubForm, nb_membres: e.target.value })} placeholder="Ex: 322" />
                    <Input label="Nom du président" value={clubForm.president_nom} onChange={e => setClubForm({ ...clubForm, president_nom: e.target.value })} />
                    <Input label="Email du président" value={clubForm.president_email} onChange={e => setClubForm({ ...clubForm, president_email: e.target.value })} type="email" />
                    <Input label="Description" value={clubForm.description} onChange={e => setClubForm({ ...clubForm, description: e.target.value })} full textarea rows={4} />
                    <Input label="Mot du président" value={clubForm.mot_president} onChange={e => setClubForm({ ...clubForm, mot_president: e.target.value })} full textarea rows={3} />
                  </div>
                  <div style={{ textAlign: "right", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <Btn onClick={() => saveClub()} variant="primary">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      Enregistrer
                    </Btn>
                  </div>
                </Card>
              )}

              <Card>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6, paddingBottom: 14, borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" fill="none" stroke="#0d2d5e" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Programme annuel
                </div>
                <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 16px" }}>Uploadez votre programme annuel au format PDF ou Word.</p>

                {programmeNom && !programmeFichier && (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, background: programmeIcon?.bg || "#f1f5f9", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: programmeIcon?.color || "#64748b" }}>{programmeIcon?.label}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{programmeNom}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Fichier actuel</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <a href={`${STORAGE}/${club.programme_fichier}`} target="_blank" rel="noreferrer"
                        style={{ background: "#dbeafe", color: "#1d4ed8", border: "none", padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Télécharger
                      </a>
                      <button onClick={deleteProgramme}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}

                {programmeFichier && (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "#ecfdf5", borderRadius: 12, border: "1px solid #6ee7b7", marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, background: getProgrammeIcon(programmeFichier.name)?.bg || "#f1f5f9", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: getProgrammeIcon(programmeFichier.name)?.color || "#64748b" }}>{getProgrammeIcon(programmeFichier.name)?.label}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#065f46" }}>{programmeFichier.name}</div>
                      <div style={{ fontSize: 12, color: "#059669", marginTop: 2 }}>Nouveau fichier prêt à être sauvegardé</div>
                    </div>
                    <button onClick={() => setProgrammeFichier(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div onClick={() => programmeRef.current.click()}
                    style={{ border: "2px dashed #cbd5e1", borderRadius: 12, padding: "14px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "#64748b", fontSize: 13, fontWeight: 600, background: "#f8fafc" }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    {programmeFichier ? "Changer le fichier" : (programmeNom ? "Remplacer le fichier" : "Choisir un fichier PDF ou Word")}
                  </div>
                  <input ref={programmeRef} type="file" accept=".pdf,.doc,.docx" onChange={handleProgrammeChange} style={{ display: "none" }} />
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>PDF, DOC, DOCX — Max 10MB</span>
                </div>

                {programmeFichier && (
                  <div style={{ textAlign: "right", marginTop: 16, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                    <Btn onClick={() => saveClub()} variant="primary">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      Sauvegarder le programme
                    </Btn>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ══════════ ÉVÉNEMENTS ══════════ */}
          {activeTab === "evenements" && (
            <div style={{ maxWidth: 900 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Événements</h2>
                  <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>Validés par l'administrateur avant publication</p>
                </div>
                <Btn onClick={() => setShowEvtForm(!showEvtForm)} variant={showEvtForm ? "ghost" : "orange"}>
                  {showEvtForm
                    ? <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Annuler</>
                    : <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Nouvel événement</>
                  }
                </Btn>
              </div>
              <Alert msg={evtMsg} />

              {showEvtForm && (
                <Card style={{ marginBottom: 24, border: "2px solid #e07b20" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Proposer un nouvel événement</div>
                  <div className="dash-grid-form">
                    <Input label="Titre *" value={evtForm.titre} onChange={e => setEvtForm({ ...evtForm, titre: e.target.value })} full placeholder="Titre de l'événement" />
                    <Input label="Date *" value={evtForm.date} onChange={e => setEvtForm({ ...evtForm, date: e.target.value })} type="date" />
                    <Input label="Heure" value={evtForm.heure} onChange={e => setEvtForm({ ...evtForm, heure: e.target.value })} type="time" />
                    <Input label="Lieu" value={evtForm.lieu} onChange={e => setEvtForm({ ...evtForm, lieu: e.target.value })} full placeholder="Lieu de l'événement" />
                    <Input label="Description" value={evtForm.contenu} onChange={e => setEvtForm({ ...evtForm, contenu: e.target.value })} full textarea rows={3} placeholder="Description de l'événement" />
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Photo de l'événement</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        {evtPhotoPreview && <img src={evtPhotoPreview} alt="preview" style={{ width: 90, height: 64, objectFit: "cover", borderRadius: 10, border: "1px solid #e2e8f0" }} />}
                        <div onClick={() => evtPhotoRef.current.click()}
                          style={{ border: "2px dashed #cbd5e1", borderRadius: 10, padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13, fontWeight: 600, background: "#f8fafc" }}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                          {evtPhoto ? evtPhoto.name : "Choisir une photo"}
                        </div>
                        <input ref={evtPhotoRef} type="file" accept="image/*" onChange={handleEvtPhotoChange} style={{ display: "none" }} />
                      </div>
                    </div>
                    <div style={{ gridColumn: "1 / -1", textAlign: "right", paddingTop: 8 }}>
                      <Btn onClick={addEvenement} variant="primary">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        Soumettre
                      </Btn>
                    </div>
                  </div>
                </Card>
              )}

              {evenements.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "60px 40px" }}>
                  <div style={{ width: 56, height: 56, background: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <svg width="24" height="24" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  </div>
                  <div style={{ color: "#64748b", fontWeight: 600, fontSize: 15 }}>Aucun événement pour votre club</div>
                </Card>
              ) : (
                <div className="dash-grid-2">
                  {evenements.map(evt => {
                    const imgSrc = evt.image ? (evt.image.includes("/") ? `${STORAGE}/${evt.image}` : `${STORAGE}/evenements/${evt.image}`) : null;
                    return (
                      <Card key={evt.id} style={{ padding: 0, overflow: "hidden" }}>
                        <div style={{ height: 140, background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", position: "relative", overflow: "hidden" }}>
                          {imgSrc
                            ? <img src={imgSrc} alt={evt.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                                <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                              </div>
                          }
                          <div style={{ position: "absolute", top: 12, right: 12 }}><Badge statut={evt.statut || "en_attente"} /></div>
                        </div>
                        <div style={{ padding: "16px 18px" }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>{evt.titre}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
                            {evt.date}{evt.heure && ` · ${evt.heure}`}{evt.lieu && ` · ${evt.lieu}`}
                          </div>
                          {evt.contenu && <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{evt.contenu}</div>}
                          {(evt.statut === "en_attente" || !evt.statut) && (
                            <Btn onClick={() => deleteEvenement(evt.id)} variant="danger" style={{ fontSize: 12, padding: "7px 14px" }}>
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                              Supprimer
                            </Btn>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════ MEMBRES ══════════ */}
          {activeTab === "membres" && (
            <div style={{ maxWidth: 900 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Gestion des membres</h2>
                  <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>{membres.length} membre{membres.length > 1 ? "s" : ""} · {membresBureau.length} au bureau</p>
                </div>
                <Btn onClick={() => setShowMembreForm(!showMembreForm)} variant={showMembreForm ? "ghost" : "primary"}>
                  {showMembreForm
                    ? <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Annuler</>
                    : <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Ajouter un membre</>
                  }
                </Btn>
              </div>
              <Alert msg={membresMsg} />

              {showMembreForm && (
                <Card style={{ marginBottom: 24, border: "2px solid #0d2d5e" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 18 }}>Nouveau membre</div>
                  <div className="dash-grid-form">
                    <Input label="Nom *" value={membreForm.nom} onChange={e => setMembreForm({ ...membreForm, nom: e.target.value })} placeholder="Nom" />
                    <Input label="Prénom *" value={membreForm.prenom} onChange={e => setMembreForm({ ...membreForm, prenom: e.target.value })} placeholder="Prénom" />
                    <Input label="Email" value={membreForm.email} onChange={e => setMembreForm({ ...membreForm, email: e.target.value })} type="email" placeholder="email@exemple.com" />
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rôle</label>
                      <select value={membreForm.role} onChange={e => setMembreForm({ ...membreForm, role: e.target.value })} style={{ ...iStyle, cursor: "pointer" }}>
                        {ROLES_BUREAU.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="checkbox" id="bureau" checked={membreForm.est_bureau} onChange={e => setMembreForm({ ...membreForm, est_bureau: e.target.checked })} style={{ width: 16, height: 16, cursor: "pointer" }} />
                      <label htmlFor="bureau" style={{ fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer" }}>Membre du bureau exécutif</label>
                    </div>
                    <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
                      <Btn onClick={addMembre} variant="primary">Ajouter le membre</Btn>
                    </div>
                  </div>
                </Card>
              )}

              {membresBureau.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 4, height: 18, background: "#e07b20", borderRadius: 2 }}></div>
                    Bureau exécutif
                  </div>
                  <div className="dash-grid-bureau">
                    {membresBureau.map(m => (
                      <Card key={m.id} style={{ padding: "20px 16px", textAlign: "center" }}>
                        <div style={{ width: 50, height: 50, background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "white", fontWeight: 800, fontSize: 17 }}>
                          {m.prenom?.[0]?.toUpperCase()}{m.nom?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 2 }}>{m.prenom} {m.nom}</div>
                        <div style={{ fontSize: 11, color: "#e07b20", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{m.role}</div>
                        {m.email && <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>{m.email}</div>}
                        <button onClick={() => deleteMembre(m.id)}
                          style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, margin: "0 auto" }}>
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                          Retirer
                        </button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 4, height: 18, background: "#0d2d5e", borderRadius: 2 }}></div>
                  Membres ({membresSimples.length})
                </div>
                {membresSimples.length === 0 ? (
                  <Card style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Aucun membre simple pour le moment</div>
                  </Card>
                ) : (
                  <Card style={{ padding: 0, overflow: "hidden" }}>
                    {membresSimples.map((m, i) => (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: i < membresSimples.length - 1 ? "1px solid #f1f5f9" : "none", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 38, height: 38, background: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#0d2d5e", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {m.prenom?.[0]?.toUpperCase()}{m.nom?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{m.prenom} {m.nom}</div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>{m.email || m.role}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ background: "#f1f5f9", color: "#64748b", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{m.role}</span>
                          <button onClick={() => deleteMembre(m.id)}
                            style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ══════════ DEMANDES ══════════ */}
          {activeTab === "demandes" && (
            <div style={{ maxWidth: 900 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Demandes d'adhésion</h2>
                <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>L'étudiant reçoit un email automatique lors de l'acceptation ou du refus</p>
              </div>
              <Alert msg={demandesMsg} />

              <div className="dash-grid-stats">
                {[
                  { label: "En attente", count: demandes.filter(d => !d.statut || d.statut === "en_attente").length, color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
                  { label: "Acceptées",  count: demandes.filter(d => d.statut === "accepte").length,                 color: "#059669", bg: "#d1fae5", border: "#6ee7b7" },
                  { label: "Refusées",   count: demandes.filter(d => d.statut === "rejete").length,                  color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "16px 18px", border: `1px solid ${s.border}` }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.count}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {loadingDemandes ? (
                <Card style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Chargement...</Card>
              ) : demandes.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "60px 40px" }}>
                  <div style={{ color: "#64748b", fontWeight: 600, fontSize: 15 }}>Aucune demande pour le moment</div>
                </Card>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {demandes.map(d => (
                    <Card key={d.id} style={{ padding: "16px 18px" }}>
                      <div className="dash-demande-card">
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 0 }}>
                          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                            {(d.prenom || d.nom || "?")[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 2 }}>{d.prenom} {d.nom}</div>
                            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {d.email}{d.filiere && ` · ${d.filiere}`}{d.telephone && ` · ${d.telephone}`}
                            </div>
                            {d.code_apogee && (
                              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                                Code Apogée : <strong>{d.code_apogee}</strong>
                              </div>
                            )}
                            {d.message && (
                              <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", background: "#f8fafc", padding: "8px 12px", borderRadius: 8, borderLeft: "3px solid #e2e8f0", marginBottom: 8 }}>
                                "{d.message}"
                              </div>
                            )}
                            {d.carte_etudiant && (
                              <div style={{ marginBottom: 8 }}>
                                <a href={`${STORAGE}/${d.carte_etudiant}`} target="_blank" rel="noreferrer"
                                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#dbeafe", color: "#1d4ed8", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/><circle cx="16" cy="15" r="1" fill="#1d4ed8"/></svg>
                                  Voir carte étudiant
                                </a>
                              </div>
                            )}
                            <div style={{ marginTop: 4 }}><Badge statut={d.statut || "en_attente"} /></div>
                          </div>
                        </div>
                        {(!d.statut || d.statut === "en_attente" || d.statut === "en_attente_validation") && (
                          <div className="dash-demande-actions">
                            <Btn onClick={() => traiterDemande(d.id, "accepte")} variant="success" style={{ fontSize: 12, padding: "8px 14px" }}>
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                              Accepter
                            </Btn>
                            <Btn onClick={() => traiterDemande(d.id, "rejete")} variant="danger" style={{ fontSize: 12, padding: "8px 14px" }}>
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              Refuser
                            </Btn>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "demande_evt" && (
            <DemandeEvenementForm utilisateur={utilisateur} club={club} />
          )}

        </main>
      </div>
    </div>
  );
}
