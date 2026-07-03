import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://inspiring-creation-production-8d2c.up.railway.app/api";
const STORAGE = "https://inspiring-creation-production-8d2c.up.railway.app/storage";

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
    actif:      { bg: "#d1fae5", color: "#059669", label: "Actif" },
    inactif:    { bg: "#fee2e2", color: "#dc2626", label: "Inactif" },
  };
  const s = map[statut] || { bg: "#f3f4f6", color: "#6b7280", label: statut || "—" };
  return <span style={{ background: s.bg, color: s.color, padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{s.label}</span>;
};

const Alert = ({ msg }) => {
  if (!msg.text) return null;
  const c = { success: ["#ecfdf5","#065f46","#6ee7b7"], error: ["#fef2f2","#991b1b","#fca5a5"], warning: ["#fffbeb","#92400e","#fcd34d"] }[msg.type] || ["#ecfdf5","#065f46","#6ee7b7"];
  return <div style={{ background: c[0], color: c[1], border: `1px solid ${c[2]}`, padding: "12px 18px", borderRadius: 10, marginBottom: 20, fontWeight: 500, fontSize: 14 }}>{msg.text}</div>;
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", ...style }}>
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

const Btn = ({ children, onClick, variant = "primary", style = {}, disabled = false }) => {
  const variants = {
    primary: { background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", color: "white", border: "none" },
    orange:  { background: "linear-gradient(135deg, #e07b20, #f59e0b)", color: "white", border: "none" },
    ghost:   { background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" },
    danger:  { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
    success: { background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" },
    green:   { background: "linear-gradient(135deg, #059669, #10b981)", color: "white", border: "none" },
    csv:     { background: "linear-gradient(135deg, #059669, #10b981)", color: "white", border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...variants[variant], padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 6, opacity: disabled ? 0.6 : 1, transition: "opacity 0.15s", ...style }}>
      {children}
    </button>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}>
    <div style={{ background: "white", borderRadius: 20, padding: 32, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{title}</div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const PhotoUpload = ({ label, preview, onFileChange, size = 80 }) => {
  const ref = useRef();
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: "3px solid #dde8f7", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {preview ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <svg width="28" height="28" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 20c1.3-3.5 4-5 7-5s5.7 1.5 7 5"/></svg>}
        </div>
        <div onClick={() => ref.current.click()} style={{ border: "2px dashed #cbd5e1", borderRadius: 10, padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13, fontWeight: 600, background: "#f8fafc" }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          Choisir une photo
        </div>
        <input ref={ref} type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRE CSV
// ─────────────────────────────────────────────────────────────────────────────
const exportCSV = (filename, headers, rows) => {
  const escape = (val) => {
    if (val === null || val === undefined) return "";
    const str = String(val).replace(/"/g, '""');
    return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
  };
  const csv = [
    headers.join(","),
    ...rows.map(row => row.map(escape).join(","))
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────────────────────
// ONGLET EXPORTS CSV
// ─────────────────────────────────────────────────────────────────────────────
function TabExports({ clubs, evenements, comptes, demandesEvt, actualites }) {
  const [lastExport, setLastExport] = useState({});

  const doExport = (key, filename, headers, rows) => {
    exportCSV(filename, headers, rows);
    setLastExport(prev => ({ ...prev, [key]: new Date().toLocaleTimeString() }));
  };

 const exports = [
    {
      key: "clubs",
      label: "Clubs",
      description: "Liste de tous les clubs avec leurs informations",
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      color: "#1d4ed8",
      bg: "#dbeafe",
      count: clubs.length,
      action: () => doExport(
        "clubs",
        `clubs_${new Date().toISOString().slice(0,10)}.csv`,
        ["ID", "Nom", "Domaine", "Catégorie", "Email", "Parrain", "Année création", "Nb membres", "Statut"],
        clubs.map(c => [c.id, c.nom, c.domaine, c.categorie, c.email, c.parrain, c.anneeCreation, c.nb_membres, c.statut || "actif"])
      )
    },
    {
      key: "evenements",
      label: "Événements",
      description: "Tous les événements avec leur statut de validation",
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
      color: "#d97706",
      bg: "#fef3c7",
      count: evenements.length,
      action: () => doExport(
        "evenements",
        `evenements_${new Date().toISOString().slice(0,10)}.csv`,
        ["ID", "Titre", "Date", "Heure", "Lieu", "Statut", "Club ID"],
        evenements.map(e => [e.id, e.titre, e.date, e.heure, e.lieu, e.statut, e.club_id])
      )
    },
    {
      key: "comptes",
      label: "Comptes",
      description: "Liste des responsables et comptes utilisateurs",
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      color: "#7c3aed",
      bg: "#ede9fe",
      count: comptes.length,
      action: () => doExport(
        "comptes",
        `comptes_${new Date().toISOString().slice(0,10)}.csv`,
        ["ID", "Nom", "Prénom", "Email", "Rôle", "Club ID", "Statut"],
        comptes.map(u => [u.id, u.nom, u.prenom, u.email, u.role, u.club_id, u.statut || "actif"])
      )
    },
    {
      key: "demandes_evt",
      label: "Demandes événements",
      description: "Demandes d'organisation d'événements des clubs",
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
      color: "#dc2626",
      bg: "#fee2e2",
      count: demandesEvt.length,
      action: () => doExport(
        "demandes_evt",
        `demandes_evenements_${new Date().toISOString().slice(0,10)}.csv`,
        ["ID", "Titre", "Club", "Demandeur", "Email", "Date", "Lieu", "Type", "Participants", "Statut"],
        demandesEvt.map(d => [d.id, d.titre, d.club, d.nom, d.email, d.date, d.lieu, d.type_evenement, d.participants, d.statut || "en_attente"])
      )
    },
    {
      key: "actualites",
      label: "Actualités",
      description: "Toutes les actualités publiées sur la plateforme",
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>,
      color: "#059669",
      bg: "#d1fae5",
      count: actualites.length,
      action: () => doExport(
        "actualites",
        `actualites_${new Date().toISOString().slice(0,10)}.csv`,
        ["ID", "Titre", "Catégorie", "Date", "Club ID"],
        actualites.map(a => [a.id, a.titre, a.categorie, a.date, a.club_id])
      )
    },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Exports CSV</h2>
        <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>Téléchargez les données de la plateforme au format CSV (compatible Excel)</p>
      </div>

      {/* Bouton tout exporter */}
      <Card style={{ marginBottom: 24, background: "linear-gradient(135deg, #f0f7ff, #e8f4ff)", border: "1px solid #dde8ff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0d2d5e", marginBottom: 4 }}>📦 Tout exporter</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Télécharge les 5 fichiers CSV en une seule fois
            </div>
          </div>
          <Btn variant="primary" onClick={() => exports.forEach(e => setTimeout(() => e.action(), 300))}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Tout télécharger
          </Btn>
        </div>
      </Card>

      {/* Cards individuelles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {exports.map(exp => (
          <Card key={exp.key} style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 52, height: 52, background: exp.bg, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                  {exp.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 3 }}>
                    {exp.label}
                    <span style={{ marginLeft: 10, background: exp.bg, color: exp.color, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      {exp.count} entrées
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{exp.description}</div>
                  {lastExport[exp.key] && (
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                      ✅ Dernier export à {lastExport[exp.key]}
                    </div>
                  )}
                </div>
              </div>
              <Btn variant="csv" onClick={exp.action} style={{ flexShrink: 0 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Télécharger CSV
              </Btn>
            </div>
          </Card>
        ))}
      </div>

      {/* Info */}
      <div style={{ marginTop: 24, padding: "14px 18px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, color: "#64748b" }}>
        💡 Les fichiers CSV sont encodés en UTF-8 avec BOM pour une compatibilité optimale avec Excel. Le nom du fichier inclut la date du jour.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ONGLET PAGE D'ACCUEIL
// ─────────────────────────────────────────────────────────────────────────────
function TabPageAccueil({ headers }) {
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("doyen");

  const [doyenForm, setDoyenForm] = useState({ nom: "Pr. ABDESSLAM EL BOUARI", titre: "DOYEN DE LA FSBM", texte: "Les clubs étudiants représentent un pilier essentiel de la vie universitaire." });
  const [doyenPhoto, setDoyenPhoto] = useState(null);
  const [doyenPhotoPreview, setDoyenPhotoPreview] = useState(null);

  const [viceDoyenForm, setViceDoyenForm] = useState({ nom: "Pr. RADID MOHAMMED", titre: "VICE-DOYEN CHARGÉ DE LA VIE ÉTUDIANTE", texte: "Notre mission est de créer un environnement propice à l'épanouissement des étudiants." });
  const [viceDoyenPhoto, setViceDoyenPhoto] = useState(null);
  const [viceDoyenPhotoPreview, setViceDoyenPhotoPreview] = useState(null);

  const [orgForm, setOrgForm] = useState({
    direction:    [{ nom: "Pr. Abdesslam El Bouari", role: "Doyen de la FSBM" }],
    vice_doyens:  [{ nom: "Pr. Radid Mohammed", role: "Vice-Doyen chargé des Affaires Pédagogiques" }, { nom: "Pr. Mordane Soumia", role: "Vice-Doyenne chargée de la Vie Étudiante" }],
    responsables: [{ nom: "Mr. Chaibi Said", role: "Chargé de la vie universitaire et de la communication" }, { nom: "Mr. Najih Hassan", role: "Responsable Activités culturelles, sportives et Vie estudiantine" }],
  });
  const [orgPhotos, setOrgPhotos] = useState({ doyen: null, doyen_preview: null, vd1: null, vd1_preview: null, vd2: null, vd2_preview: null, resp1: null, resp1_preview: null, resp2: null, resp2_preview: null });

  const [chiffresForm, setChiffresForm] = useState([
    { label: "Scientifiques & Techniques", valeur: "6", desc: "Clubs de sciences et de technologies" },
    { label: "Culturels & Artistiques", valeur: "4", desc: "Clubs Culturels & Artistiques" },
    { label: "Entrepreneuriaux & Compétences", valeur: "6", desc: "Club d'Entrepreneuriat" },
    { label: "Humanitaires & Sociaux", valeur: "3", desc: "Clubs d'Actions Humanitaires & Sociales" },
    { label: "Sportifs & Santé", valeur: "4", desc: "Clubs de Sport, Santé et Environnement" },
  ]);

  const [objectifsForm, setObjectifsForm] = useState([
    { title: "Développement Personnel", text: "Les clubs offrent aux étudiants l'occasion de renforcer leurs compétences transversales." },
    { title: "Rayonnement Scientifique et Culturel", text: "À travers conférences, ateliers et projets innovants, les clubs contribuent à promouvoir le savoir." },
    { title: "Animation de la Vie Universitaire", text: "Les activités des clubs enrichissent la vie étudiante par des événements artistiques, sportifs et sociaux." },
  ]);
  useEffect(() => {
    fetch(`${API}/page-accueil`, { headers })
      .then(r => r.json())
      .then(data => {
        if (!data) return;
        if (data.doyen) setDoyenForm(data.doyen);
        if (data.vice_doyen) setViceDoyenForm(data.vice_doyen);
        if (data.organigramme) setOrgForm(data.organigramme);
        if (data.chiffres) setChiffresForm(data.chiffres);
        if (data.objectifs) setObjectifsForm(data.objectifs);
        const toUrl = (p) => p?.startsWith('http') ? p : `${STORAGE}/${p}`;
        if (data.doyen?.photo) setDoyenPhotoPreview(toUrl(data.doyen.photo));
        if (data.vice_doyen?.photo) setViceDoyenPhotoPreview(toUrl(data.vice_doyen.photo));
        if (data.organigramme) {
          const op = {};
          if (data.organigramme.direction?.[0]?.photo) op.doyen_preview = toUrl(data.organigramme.direction[0].photo);
          if (data.organigramme.vice_doyens?.[0]?.photo) op.vd1_preview = toUrl(data.organigramme.vice_doyens[0].photo);
          if (data.organigramme.vice_doyens?.[1]?.photo) op.vd2_preview = toUrl(data.organigramme.vice_doyens[1].photo);
          if (data.organigramme.responsables?.[0]?.photo) op.resp1_preview = toUrl(data.organigramme.responsables[0].photo);
          if (data.organigramme.responsables?.[1]?.photo) op.resp2_preview = toUrl(data.organigramme.responsables[1].photo);
          setOrgPhotos(prev => ({ ...prev, ...op }));
        }
      }).catch(() => {});
  }, []);


  const handleOrgPhotoChange = (key, file) => {
    if (!file) return;
    setOrgPhotos(prev => ({ ...prev, [key]: file, [`${key}_preview`]: URL.createObjectURL(file) }));
  };

  const saveSection = async (section) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("section", section);
      if (section === "doyen") { formData.append("data", JSON.stringify(doyenForm)); if (doyenPhoto) formData.append("photo", doyenPhoto); }
      else if (section === "vice_doyen") { formData.append("data", JSON.stringify(viceDoyenForm)); if (viceDoyenPhoto) formData.append("photo", viceDoyenPhoto); }
      else if (section === "organigramme") {
        formData.append("data", JSON.stringify(orgForm));
        if (orgPhotos.doyen) formData.append("photo_doyen", orgPhotos.doyen);
        if (orgPhotos.vd1) formData.append("photo_vd1", orgPhotos.vd1);
        if (orgPhotos.vd2) formData.append("photo_vd2", orgPhotos.vd2);
        if (orgPhotos.resp1) formData.append("photo_resp1", orgPhotos.resp1);
        if (orgPhotos.resp2) formData.append("photo_resp2", orgPhotos.resp2);
      }
      else if (section === "chiffres") formData.append("data", JSON.stringify(chiffresForm));
      else if (section === "objectifs") formData.append("data", JSON.stringify(objectifsForm));
      await axios.post(`${API}/page-accueil`, formData, { headers: { ...headers, "Content-Type": "multipart/form-data" } });
      setMsg({ text: "Section sauvegardée avec succès !", type: "success" });
    } catch {
      setMsg({ text: "Sauvegardé localement (backend non connecté).", type: "warning" });
    }
    setSaving(false);
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  const sectionNav = [
    { id: "doyen", label: "Mot du Doyen", color: "#0d2d5e" },
    { id: "vice_doyen", label: "Mot du Vice-Doyen", color: "#1d4ed8" },
    { id: "organigramme", label: "Organigramme", color: "#7c3aed" },
    { id: "chiffres", label: "Chiffres clés", color: "#d97706" },
    { id: "objectifs", label: "Objectifs", color: "#059669" },
  ];

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Gestion de la page d'accueil</h2>
        <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>Modifiez le contenu affiché sur la page d'accueil publique</p>
      </div>
      <Alert msg={msg} />
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {sectionNav.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{ padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", border: activeSection === s.id ? "none" : "1.5px solid #e2e8f0", background: activeSection === s.id ? s.color : "white", color: activeSection === s.id ? "white" : "#64748b", transition: "all 0.15s" }}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "doyen" && (
        <div className="pa-section">
          <div className="pa-section-title"><div style={{ width: 4, height: 20, background: "#0d2d5e", borderRadius: 2 }}></div>Mot du Doyen</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="pa-grid">
            <Input label="Nom complet" value={doyenForm.nom} onChange={e => setDoyenForm({ ...doyenForm, nom: e.target.value })} />
            <Input label="Titre / Fonction" value={doyenForm.titre} onChange={e => setDoyenForm({ ...doyenForm, titre: e.target.value })} />
            <div style={{ gridColumn: "1 / -1" }}><Input label="Texte du message" value={doyenForm.texte} onChange={e => setDoyenForm({ ...doyenForm, texte: e.target.value })} textarea rows={5} full /></div>
            <div style={{ gridColumn: "1 / -1" }}><PhotoUpload label="Photo du Doyen" preview={doyenPhotoPreview} onFileChange={e => { const f = e.target.files[0]; if (f) { setDoyenPhoto(f); setDoyenPhotoPreview(URL.createObjectURL(f)); } }} size={100} /></div>
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9", textAlign: "right" }}>
            <Btn onClick={() => saveSection("doyen")} variant="primary" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Btn>
          </div>
        </div>
      )}

      {activeSection === "vice_doyen" && (
        <div className="pa-section">
          <div className="pa-section-title"><div style={{ width: 4, height: 20, background: "#1d4ed8", borderRadius: 2 }}></div>Mot du Vice-Doyen</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="pa-grid">
            <Input label="Nom complet" value={viceDoyenForm.nom} onChange={e => setViceDoyenForm({ ...viceDoyenForm, nom: e.target.value })} />
            <Input label="Titre / Fonction" value={viceDoyenForm.titre} onChange={e => setViceDoyenForm({ ...viceDoyenForm, titre: e.target.value })} />
            <div style={{ gridColumn: "1 / -1" }}><Input label="Texte du message" value={viceDoyenForm.texte} onChange={e => setViceDoyenForm({ ...viceDoyenForm, texte: e.target.value })} textarea rows={5} full /></div>
            <div style={{ gridColumn: "1 / -1" }}><PhotoUpload label="Photo du Vice-Doyen" preview={viceDoyenPhotoPreview} onFileChange={e => { const f = e.target.files[0]; if (f) { setViceDoyenPhoto(f); setViceDoyenPhotoPreview(URL.createObjectURL(f)); } }} size={100} /></div>
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9", textAlign: "right" }}>
            <Btn onClick={() => saveSection("vice_doyen")} variant="primary" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Btn>
          </div>
        </div>
      )}

      {activeSection === "organigramme" && (
        <div>
          <div className="pa-section">
            <div className="pa-section-title"><div style={{ width: 4, height: 20, background: "#e07b20", borderRadius: 2 }}></div>Niveau 1 — Doyen</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="pa-grid">
              <Input label="Nom" value={orgForm.direction[0]?.nom || ""} onChange={e => setOrgForm({ ...orgForm, direction: [{ ...orgForm.direction[0], nom: e.target.value }] })} />
              <Input label="Rôle" value={orgForm.direction[0]?.role || ""} onChange={e => setOrgForm({ ...orgForm, direction: [{ ...orgForm.direction[0], role: e.target.value }] })} />
              <div style={{ gridColumn: "1 / -1" }}><PhotoUpload label="Photo" preview={orgPhotos.doyen_preview} onFileChange={e => { const f = e.target.files[0]; if (f) handleOrgPhotoChange("doyen", f); }} size={80} /></div>
            </div>
          </div>
          <div className="pa-section">
            <div className="pa-section-title"><div style={{ width: 4, height: 20, background: "#1d4ed8", borderRadius: 2 }}></div>Niveau 2 — Vice-Doyens</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="pa-grid">
              {[0, 1].map(i => (
                <div key={i} style={{ background: "#f8fafd", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? "#1d4ed8" : "#7c3aed", marginBottom: 12, textTransform: "uppercase" }}>Vice-Doyen {i + 1}</div>
                  <Input label="Nom" value={orgForm.vice_doyens[i]?.nom || ""} onChange={e => { const vd = [...orgForm.vice_doyens]; vd[i] = { ...vd[i], nom: e.target.value }; setOrgForm({ ...orgForm, vice_doyens: vd }); }} />
                  <div style={{ marginTop: 12 }}><Input label="Rôle" value={orgForm.vice_doyens[i]?.role || ""} onChange={e => { const vd = [...orgForm.vice_doyens]; vd[i] = { ...vd[i], role: e.target.value }; setOrgForm({ ...orgForm, vice_doyens: vd }); }} /></div>
                  <div style={{ marginTop: 12 }}><PhotoUpload label="Photo" preview={orgPhotos[`vd${i + 1}_preview`]} onFileChange={e => { const f = e.target.files[0]; if (f) handleOrgPhotoChange(`vd${i + 1}`, f); }} size={70} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="pa-section">
            <div className="pa-section-title"><div style={{ width: 4, height: 20, background: "#059669", borderRadius: 2 }}></div>Niveau 3 — Responsables</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="pa-grid">
              {[0, 1].map(i => (
                <div key={i} style={{ background: "#f8fafd", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 12, textTransform: "uppercase" }}>Responsable {i + 1}</div>
                  <Input label="Nom" value={orgForm.responsables[i]?.nom || ""} onChange={e => { const r = [...orgForm.responsables]; r[i] = { ...r[i], nom: e.target.value }; setOrgForm({ ...orgForm, responsables: r }); }} />
                  <div style={{ marginTop: 12 }}><Input label="Rôle" value={orgForm.responsables[i]?.role || ""} onChange={e => { const r = [...orgForm.responsables]; r[i] = { ...r[i], role: e.target.value }; setOrgForm({ ...orgForm, responsables: r }); }} /></div>
                  <div style={{ marginTop: 12 }}><PhotoUpload label="Photo" preview={orgPhotos[`resp${i + 1}_preview`]} onFileChange={e => { const f = e.target.files[0]; if (f) handleOrgPhotoChange(`resp${i + 1}`, f); }} size={70} /></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <Btn onClick={() => saveSection("organigramme")} variant="green" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer l'Organigramme"}</Btn>
          </div>
        </div>
      )}

      {activeSection === "chiffres" && (
        <div className="pa-section">
          <div className="pa-section-title"><div style={{ width: 4, height: 20, background: "#d97706", borderRadius: 2 }}></div>Chiffres clés</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {chiffresForm.map((c, i) => (
              <div key={i} style={{ background: "#f8fafd", borderRadius: 12, padding: "16px 20px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>Valeur</label>
                    <input type="number" value={c.valeur} onChange={e => { const arr = [...chiffresForm]; arr[i] = { ...arr[i], valeur: e.target.value }; setChiffresForm(arr); }} style={{ ...iStyle, textAlign: "center", fontWeight: 800, fontSize: 18, color: "#0d2d5e" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>Catégorie</label>
                    <input type="text" value={c.label} onChange={e => { const arr = [...chiffresForm]; arr[i] = { ...arr[i], label: e.target.value }; setChiffresForm(arr); }} style={iStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>Description</label>
                    <input type="text" value={c.desc} onChange={e => { const arr = [...chiffresForm]; arr[i] = { ...arr[i], desc: e.target.value }; setChiffresForm(arr); }} style={iStyle} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9", textAlign: "right" }}>
            <Btn onClick={() => saveSection("chiffres")} variant="orange" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Btn>
          </div>
        </div>
      )}

      {activeSection === "objectifs" && (
        <div className="pa-section">
          <div className="pa-section-title"><div style={{ width: 4, height: 20, background: "#059669", borderRadius: 2 }}></div>Objectifs</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {objectifsForm.map((obj, i) => (
              <div key={i} style={{ background: "#f8fafd", borderRadius: 12, padding: "16px 20px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 10, textTransform: "uppercase" }}>Objectif {i + 1}</div>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>Titre</label>
                    <input type="text" value={obj.title} onChange={e => { const arr = [...objectifsForm]; arr[i] = { ...arr[i], title: e.target.value }; setObjectifsForm(arr); }} style={iStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>Description</label>
                    <textarea value={obj.text} onChange={e => { const arr = [...objectifsForm]; arr[i] = { ...arr[i], text: e.target.value }; setObjectifsForm(arr); }} rows={3} style={iStyle} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9", textAlign: "right" }}>
            <Btn onClick={() => saveSection("objectifs")} variant="green" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const responsiveCSS = `
  .sa-layout { display: flex; min-height: calc(100vh - 64px); }
  .sa-sidebar { width: 240px; background: white; border-right: 1px solid #f1f5f9; padding-top: 20px; flex-shrink: 0; }
  .sa-main { flex: 1; padding: 32px 36px; overflow: auto; }
  .sa-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .sa-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .sa-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .sa-grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .pa-section { background: white; border-radius: 16px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; margin-bottom: 20px; }
  .pa-section-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px; }
  .pa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @keyframes pulse { 0%, 100% { opacity: 1; box-shadow: 0 0 0 3px rgba(220,38,38,0.2); } 50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(220,38,38,0.1); } }
  @keyframes bell { 0%, 100% { transform: rotate(0deg); } 20% { transform: rotate(-15deg); } 40% { transform: rotate(15deg); } 60% { transform: rotate(-10deg); } 80% { transform: rotate(10deg); } }
  @media (max-width: 1024px) { .sa-grid-4 { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 900px) {
    .sa-layout { flex-direction: column; }
    .sa-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #f1f5f9; padding-top: 0; }
    .sa-sidebar-menu { display: flex; flex-direction: row; overflow-x: auto; padding: 8px 12px; gap: 4px; }
    .sa-sidebar-menu button { white-space: nowrap; border-right: none !important; border-radius: 8px !important; }
    .sa-sidebar-stats { display: none; }
    .sa-main { padding: 20px 16px; }
    .sa-grid-2 { grid-template-columns: 1fr; }
    .sa-grid-3 { grid-template-columns: 1fr 1fr; }
    .pa-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .sa-grid-form { grid-template-columns: 1fr; }
    .sa-grid-form > * { grid-column: auto !important; }
    .sa-grid-3 { grid-template-columns: 1fr; }
    .sa-grid-4 { grid-template-columns: 1fr 1fr; }
    .sa-main { padding: 16px 12px; }
    .pa-grid { grid-template-columns: 1fr; }
  }
`;

const TABS = [
  { id: "dashboard",    label: "Tableau de bord",     icon: "home"   },
  { id: "page_accueil", label: "Page d'accueil",      icon: "page"   },
  { id: "evenements",   label: "Événements",          icon: "evt"    },
  { id: "clubs",        label: "Clubs",               icon: "club"   },
  { id: "actualites",   label: "Actualités",          icon: "news"   },
  { id: "comptes",      label: "Comptes",             icon: "users"  },
  { id: "profil",       label: "Mon profil",          icon: "profil" },
  { id: "demandes_evt", label: "Demandes événements", icon: "bell"   },
  { id: "exports",      label: "Exports CSV",         icon: "csv"    },
];

const TabIcon = ({ icon }) => {
  const icons = {
    home:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
    page:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
    evt:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    club:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    news:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>,
    users: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    profil:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 20c1.3-3.5 4-5 7-5s5.7 1.5 7 5"/></svg>,
    bell:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
    csv:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  };
  return icons[icon] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardSuperAdmin({ utilisateur, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const [clubs, setClubs] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [actualites, setActualites] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [demandesEvt, setDemandesEvt] = useState([]);

  const [evtMsg, setEvtMsg] = useState({ text: "", type: "" });
  const [clubMsg, setClubMsg] = useState({ text: "", type: "" });
  const [actMsg, setActMsg] = useState({ text: "", type: "" });
  const [compteMsg, setCompteMsg] = useState({ text: "", type: "" });
  const [demandesEvtMsg, setDemandesEvtMsg] = useState({ text: "", type: "" });

  const [modalClub, setModalClub] = useState(null);
  const [modalActualite, setModalActualite] = useState(null);
  const [modalCompte, setModalCompte] = useState(null);

  const [clubForm, setClubForm] = useState({ nom: "", domaine: "", categorie: "", description: "", email: "", parrain: "", anneeCreation: "", statut: "actif" });
  const [clubEditId, setClubEditId] = useState(null);
  const [actForm, setActForm] = useState({ titre: "", contenu: "", date: "", categorie: "", club_id: "", instagram: "" });
  const [actEditId, setActEditId] = useState(null);
  const [compteForm, setCompteForm] = useState({ nom: "", prenom: "", email: "", motDePasse: "", role: "responsable_club", club_id: "", statut: "actif" });
  const [compteEditId, setCompteEditId] = useState(null);
  const [showMdp, setShowMdp] = useState(false);
  const [profilForm, setProfilForm] = useState({ nom: "", prenom: "", email: "", motDePasse: "" });
  const [profilMsg, setProfilMsg] = useState({ text: "", type: "" });
  const [showProfilMdp, setShowProfilMdp] = useState(false);

  const [actImage, setActImage] = useState(null);
  const [actImagePreview, setActImagePreview] = useState(null);
  const actImageRef = useRef();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!utilisateur) { navigate("/login"); return; }
    fetchAll();
    setProfilForm({ nom: utilisateur?.nom || "", prenom: utilisateur?.prenom || "", email: utilisateur?.email || "", motDePasse: "" });
  }, [utilisateur]);

  const fetchAll = () => { fetchClubs(); fetchEvenements(); fetchActualites(); fetchComptes(); fetchDemandesEvt(); };
  const fetchClubs = async () => { try { const res = await axios.get(`${API}/clubs`, { headers }); setClubs(Array.isArray(res.data) ? res.data : res.data.data || []); } catch {} };
  const fetchEvenements = async () => { try { const res = await axios.get(`${API}/evenements`, { headers }); setEvenements(Array.isArray(res.data) ? res.data : res.data.data || []); } catch {} };
  const fetchActualites = async () => { try { const res = await axios.get(`${API}/actualites`, { headers }); setActualites(Array.isArray(res.data) ? res.data : res.data.data || []); } catch {} };
  const fetchComptes = async () => { try { const res = await axios.get(`${API}/utilisateurs`, { headers }); const data = Array.isArray(res.data) ? res.data : res.data.data || []; setComptes(data.filter(u => u.role !== "administrateur")); } catch {} };
  const fetchDemandesEvt = async () => { try { const res = await axios.get(`${API}/demandes-evenement`, { headers }); setDemandesEvt(Array.isArray(res.data) ? res.data : res.data.data || []); } catch {} };

  const validerEvenement = async (id, statut) => {
    try { await axios.put(`${API}/evenements/${id}`, { statut }, { headers }); setEvtMsg({ text: `Événement ${statut === "valide" ? "validé" : "refusé"} !`, type: statut === "valide" ? "success" : "error" }); fetchEvenements(); }
    catch { setEvtMsg({ text: "Erreur.", type: "error" }); }
    setTimeout(() => setEvtMsg({ text: "", type: "" }), 3000);
  };
  const supprimerEvenement = async (id) => { if (!window.confirm("Supprimer ?")) return; try { await axios.delete(`${API}/evenements/${id}`, { headers }); fetchEvenements(); } catch { alert("Erreur."); } };

  const saveClub = async () => {
    try {
      if (clubEditId) { await axios.put(`${API}/clubs/${clubEditId}`, clubForm, { headers }); setClubMsg({ text: "Club modifié !", type: "success" }); }
      else { await axios.post(`${API}/clubs`, clubForm, { headers }); setClubMsg({ text: "Club ajouté !", type: "success" }); }
      setModalClub(null); setClubForm({ nom: "", domaine: "", categorie: "", description: "", email: "", parrain: "", anneeCreation: "", statut: "actif" }); setClubEditId(null); fetchClubs();
    } catch { setClubMsg({ text: "Erreur.", type: "error" }); }
    setTimeout(() => setClubMsg({ text: "", type: "" }), 3000);
  };
  const supprimerClub = async (id) => { if (!window.confirm("Supprimer ?")) return; try { await axios.delete(`${API}/clubs/${id}`, { headers }); fetchClubs(); } catch { alert("Erreur."); } };
  const editClub = (c) => { setClubForm({ nom: c.nom || "", domaine: c.domaine || "", categorie: c.categorie || "", description: c.description || "", email: c.email || "", parrain: c.parrain || "", anneeCreation: c.anneeCreation || "", statut: c.statut || "actif" }); setClubEditId(c.id); setModalClub("edit"); };

  const saveActualite = async () => {
    try {
      let imageUrl = null;
      if (actImage) {
        const imgData = new FormData();
        imgData.append('key', '8c20242510156f5d610357aed4d8f893');
        imgData.append('image', actImage);
        const imgRes = await axios.post('https://api.imgbb.com/1/upload', imgData);
        imageUrl = imgRes.data?.data?.url || null;
      }
      const payload = { ...actForm };
      if (imageUrl) payload.image = imageUrl;
      if (actEditId) { await axios.put(`${API}/actualites/${actEditId}`, payload, { headers }); setActMsg({ text: "Actualité modifiée !", type: "success" }); }
      else { await axios.post(`${API}/actualites`, payload, { headers }); setActMsg({ text: "Actualité ajoutée !", type: "success" }); }
      setModalActualite(null); setActForm({ titre: "", contenu: "", date: "", categorie: "", club_id: "", instagram: "" }); setActEditId(null); setActImage(null); setActImagePreview(null); fetchActualites();
    } catch (e) { setActMsg({ text: "Erreur: " + e.message, type: "error" }); }
    setTimeout(() => setActMsg({ text: "", type: "" }), 3000);
  };
  const supprimerActualite = async (id) => { if (!window.confirm("Supprimer ?")) return; try { await axios.delete(`${API}/actualites/${id}`, { headers }); fetchActualites(); } catch { alert("Erreur."); } };
  const editActualite = (act) => { setActForm({ titre: act.titre || "", contenu: act.contenu || "", date: act.date || "", categorie: act.categorie || "", club_id: act.club_id || "", instagram: act.instagram || "" }); setActEditId(act.id);setActImagePreview(act.image ? (act.image.startsWith('http') ? act.image : `${STORAGE}/${act.image}`) : null); setModalActualite("edit"); };

  const saveCompte = async () => {
    try {
      if (compteEditId) { const data = { ...compteForm }; if (!data.motDePasse) delete data.motDePasse; await axios.put(`${API}/utilisateurs/${compteEditId}`, data, { headers }); setCompteMsg({ text: "Compte modifié !", type: "success" }); }
      else { await axios.post(`${API}/register`, compteForm, { headers }); setCompteMsg({ text: "Compte créé !", type: "success" }); }
      setModalCompte(null); setCompteForm({ nom: "", prenom: "", email: "", motDePasse: "", role: "responsable_club", club_id: "", statut: "actif" }); setCompteEditId(null); fetchComptes();
    } catch { setCompteMsg({ text: "Erreur.", type: "error" }); }
    setTimeout(() => setCompteMsg({ text: "", type: "" }), 3000);
  };
  const supprimerCompte = async (id) => { if (!window.confirm("Supprimer ?")) return; try { await axios.delete(`${API}/utilisateurs/${id}`, { headers }); fetchComptes(); } catch { alert("Erreur."); } };
  const editCompte = (u) => { setCompteForm({ nom: u.nom || "", prenom: u.prenom || "", email: u.email || "", motDePasse: "", role: u.role || "responsable_club", club_id: u.club_id || "", statut: u.statut || "actif" }); setCompteEditId(u.id); setModalCompte("edit"); };

  const saveProfil = async () => {
    try { const data = { nom: profilForm.nom, prenom: profilForm.prenom, email: profilForm.email }; if (profilForm.motDePasse) data.motDePasse = profilForm.motDePasse; await axios.put(`${API}/utilisateurs/${utilisateur.id}`, data, { headers }); setProfilMsg({ text: "Profil mis à jour !", type: "success" }); setProfilForm(prev => ({ ...prev, motDePasse: "" })); }
    catch { setProfilMsg({ text: "Erreur.", type: "error" }); }
    setTimeout(() => setProfilMsg({ text: "", type: "" }), 3000);
  };

  const traiterDemandeEvt = async (id, statut) => {
    try { await axios.put(`${API}/demandes-evenement/${id}`, { statut }, { headers }); setDemandesEvtMsg({ text: `Demande ${statut === "accepte" ? "acceptée" : "refusée"} !`, type: statut === "accepte" ? "success" : "error" }); setDemandesEvt(prev => prev.map(d => d.id === id ? { ...d, statut } : d)); }
    catch { setDemandesEvtMsg({ text: "Erreur.", type: "error" }); }
    setTimeout(() => setDemandesEvtMsg({ text: "", type: "" }), 3000);
  };
  const supprimerDemandeEvt = async (id) => { if (!window.confirm("Supprimer ?")) return; try { await axios.delete(`${API}/demandes-evenement/${id}`, { headers }); setDemandesEvt(prev => prev.filter(d => d.id !== id)); } catch { alert("Erreur."); } };

  const handleLogout = () => { localStorage.removeItem("token"); onLogout && onLogout(); navigate("/login"); };

  const evtEnAttente = evenements.filter(e => e.statut === "en_attente").length;
  const evtValides = evenements.filter(e => e.statut === "valide").length;
  const demandesEnAttente = demandesEvt.filter(d => !d.statut || d.statut === "en_attente").length;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{responsiveCSS}</style>

      {/* HEADER */}
      <header style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2d5e 100%)", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 24px rgba(13,45,94,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #e07b20, #f59e0b)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "white" }}>A</div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Administrateur</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>FSBM · Panneau de contrôle</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {demandesEnAttente > 0 && (
            <button onClick={() => setActiveTab("demandes_evt")}
              style={{ position: "relative", background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)", borderRadius: 10, padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24" style={{ animation: "bell 2s ease infinite" }}>
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#ef4444" }}>{demandesEnAttente} nouvelle{demandesEnAttente > 1 ? "s" : ""}</span>
              <span style={{ position: "absolute", top: -4, right: -4, width: 10, height: 10, background: "#dc2626", borderRadius: "50%", border: "2px solid #0d2d5e", animation: "pulse 1.5s infinite" }}></span>
            </button>
          )}
          <button onClick={() => navigate("/")} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Voir le site</button>
          <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.75)", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Déconnexion</button>
        </div>
      </header>

      <div className="sa-layout">
        {/* SIDEBAR */}
        <aside className="sa-sidebar">
          <div className="sa-sidebar-menu" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "0 16px 12px", color: "#cbd5e1", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>Navigation</div>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ width: "100%", padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, background: activeTab === tab.id ? (tab.id === "exports" ? "#f0fdf4" : "#f0f7ff") : "transparent", border: "none", borderRight: activeTab === tab.id ? `3px solid ${tab.id === "exports" ? "#059669" : "#0d2d5e"}` : "3px solid transparent", color: activeTab === tab.id ? (tab.id === "exports" ? "#059669" : "#0d2d5e") : "#64748b", fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500, cursor: "pointer", textAlign: "left", transition: "all 0.15s", marginBottom: 2 }}>
                <TabIcon icon={tab.icon} />
                {tab.label}
                {tab.id === "evenements" && evtEnAttente > 0 && (
                  <span style={{ marginLeft: "auto", background: "#e07b20", color: "white", borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{evtEnAttente}</span>
                )}
                {tab.id === "demandes_evt" && demandesEnAttente > 0 && (
                  <span style={{ marginLeft: "auto", background: "#dc2626", color: "white", borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 700, animation: "pulse 1.5s infinite" }}>{demandesEnAttente}</span>
                )}
              </button>
            ))}
          </div>

          <div className="sa-sidebar-stats" style={{ margin: "20px 12px 0", padding: 16, background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", borderRadius: 14 }}>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Aperçu rapide</div>
            {[
              { label: "Clubs", val: clubs.length },
              { label: "Événements en attente", val: evtEnAttente },
              { label: "Demandes en attente", val: demandesEnAttente },
              { label: "Comptes", val: comptes.length },
              { label: "Actualités", val: actualites.length },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>{s.label}</span>
                <span style={{ color: s.label.includes("attente") && s.val > 0 ? "#fca5a5" : "white", fontWeight: 700, fontSize: 14 }}>{s.val}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main className="sa-main">

          {/* ══ TABLEAU DE BORD ══ */}
          {activeTab === "dashboard" && (
            <div style={{ maxWidth: 1000 }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Tableau de bord</h2>
                <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>Vue d'ensemble de la plateforme CLUB-FSBM</p>
              </div>

              <div className="sa-grid-4" style={{ marginBottom: 28 }}>
                {[
                  { label: "Clubs actifs", val: clubs.length, color: "#1d4ed8", bg: "#dbeafe" },
                  { label: "Événements en attente", val: evtEnAttente, color: "#d97706", bg: "#fef3c7" },
                  { label: "Événements validés", val: evtValides, color: "#059669", bg: "#d1fae5" },
                  { label: "Comptes responsables", val: comptes.length, color: "#7c3aed", bg: "#ede9fe" },
                ].map(s => (
                  <Card key={s.label} style={{ padding: "20px 22px" }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{s.label}</div>
                  </Card>
                ))}
              </div>

              {demandesEnAttente > 0 && (
                <div style={{ background: "linear-gradient(135deg, #fef2f2, #fff5f5)", border: "1.5px solid #fecaca", borderRadius: 16, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, background: "#fee2e2", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="22" height="22" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" style={{ animation: "bell 2s ease infinite" }}>
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#991b1b" }}>{demandesEnAttente} demande{demandesEnAttente > 1 ? "s" : ""} d'événement en attente !</div>
                      <div style={{ fontSize: 13, color: "#dc2626", marginTop: 2 }}>Des clubs attendent votre validation.</div>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("demandes_evt")} style={{ background: "#dc2626", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Voir les demandes →</button>
                </div>
              )}

              <Card style={{ marginBottom: 20, background: "linear-gradient(135deg, #f0f7ff, #e8f4ff)", border: "1px solid #dde8ff" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0d2d5e", marginBottom: 4 }}>🏠 Gérer la page d'accueil</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>Modifiez les mots du Doyen/Vice-Doyen, l'organigramme, les chiffres clés et les objectifs.</div>
                  </div>
                  <Btn onClick={() => setActiveTab("page_accueil")} variant="primary">Accéder →</Btn>
                </div>
              </Card>

              {/* Accès rapide exports */}
              <Card style={{ marginBottom: 20, background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid #bbf7d0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#065f46", marginBottom: 4 }}>📥 Exporter les données CSV</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>Téléchargez les clubs, événements, comptes et demandes au format CSV.</div>
                  </div>
                  <Btn onClick={() => setActiveTab("exports")} variant="green">Accéder →</Btn>
                </div>
              </Card>

              {evtEnAttente > 0 && (
                <Card style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 4, height: 18, background: "#e07b20", borderRadius: 2 }}></div>
                    Événements en attente ({evtEnAttente})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {evenements.filter(e => e.statut === "en_attente").slice(0, 3).map(evt => (
                      <div key={evt.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: 12, gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{evt.titre}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{evt.date}{evt.lieu && ` · ${evt.lieu}`}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn onClick={() => validerEvenement(evt.id, "valide")} variant="success" style={{ fontSize: 12, padding: "7px 14px" }}>Valider</Btn>
                          <Btn onClick={() => validerEvenement(evt.id, "refuse")} variant="danger" style={{ fontSize: 12, padding: "7px 14px" }}>Refuser</Btn>
                        </div>
                      </div>
                    ))}
                    {evtEnAttente > 3 && <button onClick={() => setActiveTab("evenements")} style={{ background: "none", border: "none", color: "#0d2d5e", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", padding: "4px 0" }}>Voir tous les {evtEnAttente} événements →</button>}
                  </div>
                </Card>
              )}

              <Card>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 4, height: 18, background: "#0d2d5e", borderRadius: 2 }}></div>
                  Clubs récents
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {clubs.slice(0, 5).map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 14 }}>{c.nom?.[0]?.toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{c.nom}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{c.domaine}</div>
                        </div>
                      </div>
                      <Badge statut={c.statut || "actif"} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "page_accueil" && <TabPageAccueil headers={headers} />}

          {/* ══ EXPORTS CSV ══ */}
          {activeTab === "exports" && (
            <TabExports
              clubs={clubs}
              evenements={evenements}
              comptes={comptes}
              demandesEvt={demandesEvt}
              actualites={actualites}
            />
          )}

          {/* ══ ÉVÉNEMENTS ══ */}
          {activeTab === "evenements" && (
            <div style={{ maxWidth: 1000 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Gestion des événements</h2>
                <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>Validez ou refusez les événements soumis</p>
              </div>
              <Alert msg={evtMsg} />
              <div className="sa-grid-3" style={{ marginBottom: 24 }}>
                {[
                  { label: "En attente", count: evenements.filter(e => e.statut === "en_attente").length, color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
                  { label: "Validés", count: evenements.filter(e => e.statut === "valide").length, color: "#059669", bg: "#d1fae5", border: "#6ee7b7" },
                  { label: "Refusés", count: evenements.filter(e => e.statut === "refuse").length, color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "16px 18px", border: `1px solid ${s.border}` }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.count}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {evenements.length === 0 ? <Card style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Aucun événement</Card>
                  : evenements.map(evt => {
                    const imgSrc = evt.image ? (evt.image.includes("/") ? `${STORAGE}/${evt.image}` : `${STORAGE}/evenements/${evt.image}`) : null;
                    return (
                      <Card key={evt.id} style={{ padding: "18px 22px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                          {imgSrc && <img src={imgSrc} alt={evt.titre} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{evt.titre}</div>
                              <Badge statut={evt.statut || "en_attente"} />
                            </div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>{evt.date}{evt.heure && ` · ${evt.heure}`}{evt.lieu && ` · ${evt.lieu}`}</div>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                            {evt.statut === "en_attente" && <>
                              <Btn onClick={() => validerEvenement(evt.id, "valide")} variant="success" style={{ fontSize: 12, padding: "7px 14px" }}>✓ Valider</Btn>
                              <Btn onClick={() => validerEvenement(evt.id, "refuse")} variant="danger" style={{ fontSize: 12, padding: "7px 14px" }}>✕ Refuser</Btn>
                            </>}
                            <Btn onClick={() => supprimerEvenement(evt.id)} variant="ghost" style={{ fontSize: 12, padding: "7px 12px" }}>🗑</Btn>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ══ CLUBS ══ */}
          {activeTab === "clubs" && (
            <div style={{ maxWidth: 1000 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Gestion des clubs</h2>
                  <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>{clubs.length} clubs enregistrés</p>
                </div>
                <Btn onClick={() => { setClubForm({ nom: "", domaine: "", categorie: "", description: "", email: "", parrain: "", anneeCreation: "", statut: "actif" }); setClubEditId(null); setModalClub("add"); }} variant="primary">+ Nouveau club</Btn>
              </div>
              <Alert msg={clubMsg} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {clubs.map(c => (
                  <Card key={c.id} style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 46, height: 46, background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18, flexShrink: 0, overflow: "hidden" }}>
                        {c.logo ? <img src={c.logo.includes("/") ? `${STORAGE}/${c.logo}` : c.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => e.target.style.display = "none"} /> : c.nom?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{c.nom}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{c.domaine}{c.categorie && ` · ${c.categorie}`}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <Badge statut={c.statut || "actif"} />
                      <Btn onClick={() => editClub(c)} variant="ghost" style={{ fontSize: 12, padding: "7px 14px" }}>✏️ Modifier</Btn>
                      <Btn onClick={() => supprimerClub(c.id)} variant="danger" style={{ fontSize: 12, padding: "7px 12px" }}>🗑</Btn>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ══ ACTUALITÉS ══ */}
          {activeTab === "actualites" && (
            <div style={{ maxWidth: 1000 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Gestion des actualités</h2>
                  <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>{actualites.length} actualités publiées</p>
                </div>
                <Btn onClick={() => { setActForm({ titre: "", contenu: "", date: "", categorie: "", club_id: "", instagram: "" }); setActEditId(null); setActImage(null); setActImagePreview(null); setModalActualite("add"); }} variant="orange">+ Nouvelle actualité</Btn>
              </div>
              <Alert msg={actMsg} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {actualites.length === 0 ? <Card style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Aucune actualité</Card>
                  : actualites.map(act => (
                    <Card key={act.id} style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                     <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                   {act.image && <img src={act.image.startsWith('http') ? act.image : `${STORAGE}/${act.image}`} alt={act.titre} style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} onError={e => e.target.style.display = "none"} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 2 }}>{act.titre}</div>
                     <div style={{ fontSize: 12, color: "#94a3b8" }}>{act.date}{act.categorie && ` · ${act.categorie}`}</div>
                     </div>
                     </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <Btn onClick={() => editActualite(act)} variant="ghost" style={{ fontSize: 12, padding: "7px 14px" }}>✏️ Modifier</Btn>
                        <Btn onClick={() => supprimerActualite(act.id)} variant="danger" style={{ fontSize: 12, padding: "7px 12px" }}>🗑</Btn>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* ══ COMPTES ══ */}
          {activeTab === "comptes" && (
            <div style={{ maxWidth: 1000 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Gestion des comptes</h2>
                  <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>{comptes.length} comptes enregistrés</p>
                </div>
                <Btn onClick={() => { setCompteForm({ nom: "", prenom: "", email: "", motDePasse: "", role: "responsable_club", club_id: "", statut: "actif" }); setCompteEditId(null); setModalCompte("add"); }} variant="primary">+ Nouveau compte</Btn>
              </div>
              <Alert msg={compteMsg} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {comptes.length === 0 ? <Card style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Aucun compte</Card>
                  : comptes.map(u => (
                    <Card key={u.id} style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                          {u.prenom?.[0]?.toUpperCase()}{u.nom?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{u.prenom} {u.nom}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{u.email} · {u.role}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <Badge statut={u.statut || "actif"} />
                        <Btn onClick={() => editCompte(u)} variant="ghost" style={{ fontSize: 12, padding: "7px 14px" }}>✏️ Modifier</Btn>
                        <Btn onClick={() => supprimerCompte(u.id)} variant="danger" style={{ fontSize: 12, padding: "7px 12px" }}>🗑</Btn>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* ══ PROFIL ══ */}
          {activeTab === "profil" && (
            <div style={{ maxWidth: 600 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Mon profil</h2>
                <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>Modifier vos informations personnelles</p>
              </div>
              <Alert msg={profilMsg} />
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #e07b20, #f59e0b)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 24 }}>A</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>{utilisateur?.prenom} {utilisateur?.nom}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{utilisateur?.email}</div>
                    <div style={{ fontSize: 12, color: "#e07b20", fontWeight: 700, marginTop: 4, textTransform: "uppercase" }}>Administrateur</div>
                  </div>
                </div>
                <div className="sa-grid-form">
                  <Input label="Nom" value={profilForm.nom} onChange={e => setProfilForm({ ...profilForm, nom: e.target.value })} />
                  <Input label="Prénom" value={profilForm.prenom} onChange={e => setProfilForm({ ...profilForm, prenom: e.target.value })} />
                  <Input label="Email" value={profilForm.email} onChange={e => setProfilForm({ ...profilForm, email: e.target.value })} type="email" full />
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nouveau mot de passe (optionnel)</label>
                    <div style={{ position: "relative" }}>
                      <input type={showProfilMdp ? "text" : "password"} value={profilForm.motDePasse} onChange={e => setProfilForm({ ...profilForm, motDePasse: e.target.value })} placeholder="Laisser vide pour ne pas changer" style={{ ...iStyle, paddingRight: 42 }} />
                      <button onClick={() => setShowProfilMdp(!showProfilMdp)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>{showProfilMdp ? "🙈" : "👁"}</button>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right", marginTop: 24, paddingTop: 18, borderTop: "1px solid #f1f5f9" }}>
                  <Btn onClick={saveProfil} variant="primary">💾 Enregistrer</Btn>
                </div>
              </Card>
            </div>
          )}

          {/* ══ DEMANDES ÉVÉNEMENTS ══ */}
          {activeTab === "demandes_evt" && (
            <div style={{ maxWidth: 1000 }}>
              <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>Demandes d'organisation d'événements</h2>
                  <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>{demandesEvt.length} demande{demandesEvt.length > 1 ? "s" : ""} reçue{demandesEvt.length > 1 ? "s" : ""}</p>
                </div>
                {demandesEnAttente > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 18px" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#dc2626", animation: "pulse 1.5s infinite" }}></div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>{demandesEnAttente} en attente</span>
                  </div>
                )}
              </div>
              <Alert msg={demandesEvtMsg} />
              {demandesEvt.length === 0 ? (
                <Card style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                  <div style={{ fontWeight: 600 }}>Aucune demande pour le moment</div>
                </Card>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {demandesEvt.map(d => (
                    <Card key={d.id} style={{ padding: "20px 24px", borderLeft: (!d.statut || d.statut === "en_attente") ? "4px solid #dc2626" : "4px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{d.titre}</div>
                            <Badge statut={d.statut || "en_attente"} />
                            {d.type_evenement && <span style={{ background: "#f1f5f9", color: "#64748b", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{d.type_evenement}</span>}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px 20px", marginBottom: 10 }}>
                            {d.nom && <div style={{ fontSize: 13, color: "#64748b" }}><span style={{ fontWeight: 600, color: "#94a3b8" }}>Demandeur : </span>{d.nom}</div>}
                            {d.email && <div style={{ fontSize: 13, color: "#64748b" }}><span style={{ fontWeight: 600, color: "#94a3b8" }}>Email : </span>{d.email}</div>}
                            {d.club && <div style={{ fontSize: 13, color: "#64748b" }}><span style={{ fontWeight: 600, color: "#94a3b8" }}>Club : </span>{d.club}</div>}
                            {d.date && <div style={{ fontSize: 13, color: "#64748b" }}><span style={{ fontWeight: 600, color: "#94a3b8" }}>Date : </span>{d.date}{d.heure && ` à ${d.heure}`}</div>}
                            {d.lieu && <div style={{ fontSize: 13, color: "#64748b" }}><span style={{ fontWeight: 600, color: "#94a3b8" }}>Lieu : </span>{d.lieu}</div>}
                            {d.participants && <div style={{ fontSize: 13, color: "#64748b" }}><span style={{ fontWeight: 600, color: "#94a3b8" }}>Participants : </span>{d.participants}</div>}
                          </div>
                          {d.description && <div style={{ fontSize: 13, color: "#64748b", fontStyle: "italic", background: "#f8fafc", padding: "8px 12px", borderRadius: 8, borderLeft: "3px solid #e2e8f0" }}>"{d.description}"</div>}
                        </div>
                        {(!d.statut || d.statut === "en_attente") && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                            <Btn onClick={() => traiterDemandeEvt(d.id, "accepte")} variant="success" style={{ fontSize: 12, padding: "8px 16px" }}>✓ Accepter</Btn>
                            <Btn onClick={() => traiterDemandeEvt(d.id, "refuse")} variant="danger" style={{ fontSize: 12, padding: "8px 16px" }}>✕ Refuser</Btn>
                            <Btn onClick={() => supprimerDemandeEvt(d.id)} variant="ghost" style={{ fontSize: 12, padding: "8px 12px" }}>🗑</Btn>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ══ MODAL CLUB ══ */}
      {modalClub && (
        <Modal title={modalClub === "add" ? "Nouveau club" : "Modifier le club"} onClose={() => setModalClub(null)}>
          <div className="sa-grid-form">
            <Input label="Nom du club *" value={clubForm.nom} onChange={e => setClubForm({ ...clubForm, nom: e.target.value })} />
            <Input label="Domaine" value={clubForm.domaine} onChange={e => setClubForm({ ...clubForm, domaine: e.target.value })} />
            <Input label="Catégorie" value={clubForm.categorie} onChange={e => setClubForm({ ...clubForm, categorie: e.target.value })} />
            <Input label="Email" value={clubForm.email} onChange={e => setClubForm({ ...clubForm, email: e.target.value })} type="email" />
            <Input label="Parrain" value={clubForm.parrain} onChange={e => setClubForm({ ...clubForm, parrain: e.target.value })} />
            <Input label="Année de création" value={clubForm.anneeCreation} onChange={e => setClubForm({ ...clubForm, anneeCreation: e.target.value })} />
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Statut</label>
              <select value={clubForm.statut} onChange={e => setClubForm({ ...clubForm, statut: e.target.value })} style={{ ...iStyle, cursor: "pointer" }}>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            <Input label="Description" value={clubForm.description} onChange={e => setClubForm({ ...clubForm, description: e.target.value })} full textarea rows={3} />
          </div>
          <div style={{ textAlign: "right", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
            <Btn onClick={saveClub} variant="primary">{modalClub === "add" ? "Créer le club" : "Enregistrer"}</Btn>
          </div>
        </Modal>
      )}

      {/* ══ MODAL ACTUALITÉ ══ */}
      {modalActualite && (
        <Modal title={modalActualite === "add" ? "Nouvelle actualité" : "Modifier l'actualité"} onClose={() => setModalActualite(null)}>
          <div className="sa-grid-form">
            <Input label="Titre *" value={actForm.titre} onChange={e => setActForm({ ...actForm, titre: e.target.value })} full />
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Catégorie</label>
              <select value={actForm.categorie} onChange={e => setActForm({ ...actForm, categorie: e.target.value })} style={{ ...iStyle, cursor: "pointer" }}>
                <option value="">-- Choisir --</option>
                {["Formation","Culturel","Caravane","Sport","Workshops","Événement","Scientifique"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Date" value={actForm.date} onChange={e => setActForm({ ...actForm, date: e.target.value })} type="date" />
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Club organisateur</label>
              <select value={actForm.club_id || ""} onChange={e => setActForm({ ...actForm, club_id: e.target.value })} style={{ ...iStyle, cursor: "pointer" }}>
                <option value="">-- Aucun --</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            {actForm.club_id && <Input label="Instagram du club" value={actForm.instagram || ""} onChange={e => setActForm({ ...actForm, instagram: e.target.value })} full />}
            <Input label="Contenu *" value={actForm.contenu} onChange={e => setActForm({ ...actForm, contenu: e.target.value })} full textarea rows={4} />
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Image</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                {actImagePreview && <img src={actImagePreview} alt="preview" style={{ width: 80, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />}
                <div onClick={() => actImageRef.current.click()} style={{ border: "2px dashed #cbd5e1", borderRadius: 10, padding: "10px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13, fontWeight: 600, background: "#f8fafc" }}>
                  🖼️ {actImage ? actImage.name : "Choisir une image"}
                </div>
                <input ref={actImageRef} type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setActImage(f); setActImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
            <Btn onClick={saveActualite} variant="orange">{modalActualite === "add" ? "Publier" : "Enregistrer"}</Btn>
          </div>
        </Modal>
      )}

      {/* ══ MODAL COMPTE ══ */}
      {modalCompte && (
        <Modal title={modalCompte === "add" ? "Nouveau compte" : "Modifier le compte"} onClose={() => setModalCompte(null)}>
          <div className="sa-grid-form">
            <Input label="Nom *" value={compteForm.nom} onChange={e => setCompteForm({ ...compteForm, nom: e.target.value })} />
            <Input label="Prénom *" value={compteForm.prenom} onChange={e => setCompteForm({ ...compteForm, prenom: e.target.value })} />
            <Input label="Email *" value={compteForm.email} onChange={e => setCompteForm({ ...compteForm, email: e.target.value })} type="email" full />
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{modalCompte === "add" ? "Mot de passe *" : "Nouveau mot de passe (optionnel)"}</label>
              <div style={{ position: "relative" }}>
                <input type={showMdp ? "text" : "password"} value={compteForm.motDePasse} onChange={e => setCompteForm({ ...compteForm, motDePasse: e.target.value })} placeholder="••••••••" style={{ ...iStyle, paddingRight: 42 }} />
                <button onClick={() => setShowMdp(!showMdp)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>{showMdp ? "🙈" : "👁"}</button>
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rôle</label>
              <select value={compteForm.role} onChange={e => setCompteForm({ ...compteForm, role: e.target.value })} style={{ ...iStyle, cursor: "pointer" }}>
                <option value="responsable_club">Responsable club</option>
                <option value="responsable_vie_estudiantine">Responsable vie estudiantine</option>
                <option value="membre_autorise">Membre autorisé</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Club associé</label>
              <select value={compteForm.club_id} onChange={e => setCompteForm({ ...compteForm, club_id: e.target.value })} style={{ ...iStyle, cursor: "pointer" }}>
                <option value="">-- Aucun --</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Statut</label>
              <select value={compteForm.statut} onChange={e => setCompteForm({ ...compteForm, statut: e.target.value })} style={{ ...iStyle, cursor: "pointer" }}>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>
          <div style={{ textAlign: "right", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
            <Btn onClick={saveCompte} variant="primary">{modalCompte === "add" ? "Créer le compte" : "Enregistrer"}</Btn>
          </div>
        </Modal>
      )}

    </div>
  );
}