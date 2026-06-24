import { useState, useRef } from "react";
import axios from "axios";
 
const API = `${BACKEND_URL}/api`;
 
const iStyle = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
  borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none",
  background: "#fafafa", color: "#1e293b", fontFamily: "inherit", transition: "border-color 0.2s"
};
 
const BESOINS = ["Salle", "Vidéoprojecteur", "Internet", "Sonorisation", "Captation Vidéo", "Impression"];
 
// ── Composants EN DEHORS du composant principal ──
const Section = ({ title, children }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ fontSize: 13, fontWeight: 800, color: "#0d2d5e", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 4, height: 16, background: "#e07b20", borderRadius: 2 }}></div>
      {title}
    </div>
    {children}
  </div>
);
 
const Field = ({ label, required, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
    </label>
    {children}
  </div>
);
 
// ── Composant principal ──
export default function DemandeEvenementForm({ utilisateur, club }) {
  const [form, setForm] = useState({
    nom: `${utilisateur?.prenom || ""} ${utilisateur?.nom || ""}`.trim(),
    email: utilisateur?.email || "",
    telephone: "",
    club: club?.nom || "",
    titre: "",
    type_evenement: "",
    date: "",
    heure: "",
    lieu: "",
    participants: "",
    description: "",
    besoins: [],
    confirme: false,
  });
 
  const [affiche, setAffiche] = useState(null);
  const [programme, setProgramme] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
 
  const afficheRef = useRef();
  const programmeRef = useRef();
 
  const token = localStorage.getItem("token");
 
  const toggleBesoin = (b) => {
    setForm(prev => ({
      ...prev,
      besoins: prev.besoins.includes(b)
        ? prev.besoins.filter(x => x !== b)
        : [...prev.besoins, b]
    }));
  };
 
  const handleSubmit = async () => {
    if (!form.nom || !form.email || !form.titre) {
      setMsg({ text: "Veuillez remplir les champs obligatoires (nom, email, titre).", type: "warning" });
      return;
    }
    if (!form.confirme) {
      setMsg({ text: "Veuillez confirmer que les informations sont exactes.", type: "warning" });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "besoins") formData.append("besoins_logistiques", v.join(", "));
        else if (k !== "confirme") formData.append(k, v);
      });
      formData.append("club_id", utilisateur?.club_id || "");
      if (affiche) formData.append("affiche", affiche);
      if (programme) formData.append("programme", programme);
 
      await axios.post(`${API}/demandes-evenement`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
    } catch (e) {
      setMsg({ text: "Erreur lors de l'envoi. Réessayez.", type: "error" });
    }
    setLoading(false);
  };
 
  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", padding: "60px 20px" }}>
        <div style={{ width: 72, height: 72, background: "#d1fae5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="36" height="36" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#065f46", marginBottom: 10 }}>Demande envoyée avec succès !</div>
        <div style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>Votre demande sera étudiée par l'administration universitaire.</div>
        <button onClick={() => {
          setSubmitted(false);
          setForm(prev => ({ ...prev, titre: "", type_evenement: "", date: "", heure: "", lieu: "", participants: "", description: "", besoins: [], confirme: false }));
          setAffiche(null);
          setProgramme(null);
        }}
          style={{ background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", color: "white", border: "none", padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
          Nouvelle demande
        </button>
      </div>
    );
  }
 
  return (
    <div style={{ maxWidth: "100%", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
 
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0d2d5e, #1a4a8a)", borderRadius: 16, padding: "24px 28px", marginBottom: 24, color: "white" }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Demande d'Organisation d'Événement</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Plateforme officielle de gestion des événements universitaires de la Faculté des Sciences Ben M'Sik.</div>
      </div>
 
      {msg.text && (
        <div style={{ background: msg.type === "warning" ? "#fffbeb" : "#fef2f2", color: msg.type === "warning" ? "#92400e" : "#991b1b", border: `1px solid ${msg.type === "warning" ? "#fcd34d" : "#fca5a5"}`, padding: "12px 18px", borderRadius: 10, marginBottom: 20, fontWeight: 500, fontSize: 14 }}>
          {msg.text}
        </div>
      )}
 
      <div style={{ background: "white", borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9" }}>
 
        {/* Informations Générales */}
        <Section title="Informations Générales">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Nom complet" required>
              <input value={form.nom} onChange={e => setForm(prev => ({ ...prev, nom: e.target.value }))} style={iStyle} placeholder="Nom complet" />
            </Field>
            <Field label="Email institutionnel" required>
              <input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} style={iStyle} placeholder="email@fsbm.ma" />
            </Field>
            <Field label="Téléphone">
              <input value={form.telephone} onChange={e => setForm(prev => ({ ...prev, telephone: e.target.value }))} style={iStyle} placeholder="06XXXXXXXX" />
            </Field>
            <Field label="Club / Département">
              <input value={form.club} onChange={e => setForm(prev => ({ ...prev, club: e.target.value }))} style={iStyle} placeholder="Nom du club" />
            </Field>
          </div>
        </Section>
 
        {/* Informations sur l'Événement */}
        <Section title="Informations sur l'Événement">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Titre de l'événement" required>
                <input value={form.titre} onChange={e => setForm(prev => ({ ...prev, titre: e.target.value }))} style={iStyle} placeholder="Titre de l'événement" />
              </Field>
            </div>
            <Field label="Type d'événement">
              <select value={form.type_evenement} onChange={e => setForm(prev => ({ ...prev, type_evenement: e.target.value }))} style={{ ...iStyle, cursor: "pointer" }}>
                <option value="">Sélectionner</option>
                <option value="Conférence">Conférence</option>
                <option value="Atelier">Atelier</option>
                <option value="Formation">Formation</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Compétition">Compétition</option>
                <option value="Autre">Autre</option>
              </select>
            </Field>
            <Field label="Date">
              <input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} style={iStyle} />
            </Field>
            <Field label="Heure">
              <input type="time" value={form.heure} onChange={e => setForm(prev => ({ ...prev, heure: e.target.value }))} style={iStyle} />
            </Field>
            <Field label="Lieu">
              <input value={form.lieu} onChange={e => setForm(prev => ({ ...prev, lieu: e.target.value }))} style={iStyle} placeholder="Lieu de l'événement" />
            </Field>
            <Field label="Participants estimés">
              <input type="number" value={form.participants} onChange={e => setForm(prev => ({ ...prev, participants: e.target.value }))} style={iStyle} placeholder="Ex: 100" />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Description">
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={4} style={{ ...iStyle, resize: "vertical" }} placeholder="Description détaillée de l'événement" />
              </Field>
            </div>
          </div>
        </Section>
 
        {/* Documents */}
        <Section title="Documents">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Affiche">
              <div onClick={() => afficheRef.current.click()}
                style={{ border: "2px dashed #cbd5e1", borderRadius: 10, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "#64748b", fontSize: 13, fontWeight: 600, background: "#f8fafc" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {affiche ? affiche.name : "Choisir une affiche"}
              </div>
              <input ref={afficheRef} type="file" accept="image/*,.pdf" onChange={e => setAffiche(e.target.files[0])} style={{ display: "none" }} />
            </Field>
            <Field label="Programme">
              <div onClick={() => programmeRef.current.click()}
                style={{ border: "2px dashed #cbd5e1", borderRadius: 10, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "#64748b", fontSize: 13, fontWeight: 600, background: "#f8fafc" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {programme ? programme.name : "Choisir un programme"}
              </div>
              <input ref={programmeRef} type="file" accept=".pdf,.doc,.docx" onChange={e => setProgramme(e.target.files[0])} style={{ display: "none" }} />
            </Field>
          </div>
        </Section>
 
        {/* Besoins Logistiques */}
        <Section title="Besoins Logistiques">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {BESOINS.map(b => (
              <div key={b} onClick={() => toggleBesoin(b)}
                style={{ padding: "8px 18px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600, border: `2px solid ${form.besoins.includes(b) ? "#0d2d5e" : "#e2e8f0"}`, background: form.besoins.includes(b) ? "#f0f7ff" : "white", color: form.besoins.includes(b) ? "#0d2d5e" : "#64748b", transition: "all 0.15s", userSelect: "none" }}>
                {form.besoins.includes(b) && <span style={{ marginRight: 6 }}>✓</span>}
                {b}
              </div>
            ))}
          </div>
        </Section>
 
        {/* Confirmation */}
        <div style={{ padding: "16px 20px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <input type="checkbox" id="confirme" checked={form.confirme} onChange={e => setForm(prev => ({ ...prev, confirme: e.target.checked }))} style={{ width: 18, height: 18, cursor: "pointer" }} />
          <label htmlFor="confirme" style={{ fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer" }}>
            Je confirme que les informations sont exactes.
          </label>
        </div>
 
        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", background: loading ? "#94a3b8" : "linear-gradient(135deg, #0d2d5e, #1a4a8a)", color: "white", border: "none", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? "Envoi en cours..." : (
            <>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Envoyer la Demande
            </>
          )}
        </button>
        <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 12 }}>
          Votre demande sera étudiée par l'administration universitaire.
        </div>
      </div>
 
      <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 16 }}>
        © 2026 Faculté des Sciences Ben M'Sik — Plateforme Événementielle
      </div>
    </div>
  );
}
