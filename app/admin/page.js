"use client"
import { useState, useEffect } from "react"

const ADMIN_PASSWORD = "threshold2024"

const IDEA_TAGS = ["Solitude", "Gathering", "Light as Material", "Garden as Architecture", "Indoors Dissolved", "Work and Make"]
const LANDSCAPE_TAGS = ["Coastal", "Desert", "Mountain", "Urban", "Agricultural"]

const COLLECTIONS = [
  { id: "architectural-icons", label: "Architectural Icons", subcategories: ["Masters of Form", "Brutalist Intimacy", "Mid-Century Resolved", "Contemporary Canon"] },
  { id: "california-modern", label: "California Modern", subcategories: ["Canyon", "Coast", "Desert Edge", "Valley Compounds"] },
  { id: "nature-within", label: "Nature Within", subcategories: ["Forest Dwellings", "Meadow Houses", "Waterside", "Garden as Room"] },
  { id: "spanish-revival", label: "Spanish Revival", subcategories: ["Hacienda", "Mission Style", "Mediterranean", "Contemporary Spanish"] },
  { id: "hillside-retreats", label: "Hillside Retreats", subcategories: ["Perched", "Terraced", "Cantilevered", "Hidden in the Hill"] },
  { id: "quiet-luxury", label: "Quiet Luxury", subcategories: ["Minimal", "Material-Led", "Wabi Sensibility", "Private Compounds"] },
]

const emptyProperty = {
  name: "", architect: "", year: "", location: "", price: "", price_value: "",
  significance: "", editorial: "", architect_context: "", site_context: "",
  idea_tags: [], landscape_tag: "", collection: "", subcategory: "", photos: [], hero_photo: "",
  full_address: "", agent_name: "", agent_phone: "", agent_email: "", agent_brokerage: "",
  bedrooms: "", bathrooms: "", sqft: "", lot_size: "", published: false,
  in_residence: [],
}

const emptyResidenceItem = { name: "", designer: "", year: "", category: "", reason: "", price: "", url: "", image: "" }

function Label({ children }) {
  return <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "#999", marginBottom: 6, textTransform: "uppercase" }}>{children}</div>
}

function Input({ value, onChange, placeholder, type = "text", multiline, rows = 3 }) {
  const style = { width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, padding: "10px 12px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#fff", outline: "none", resize: multiline ? "vertical" : "none" }
  if (multiline) return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={style} />
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={style} />
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState("")
  const [properties, setProperties] = useState([])
  const [view, setView] = useState("list") // list | edit | new
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProperty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState("")

  const headers = { "Content-Type": "application/json", "x-admin-password": ADMIN_PASSWORD }

  const load = async () => {
    const res = await fetch("/api/admin/properties", { headers })
    const data = await res.json()
    setProperties(Array.isArray(data) ? data : [])
  }

  useEffect(() => { if (authed) load() }, [authed])

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleNew = () => {
    setForm(emptyProperty)
    setEditing(null)
    setView("edit")
  }

  const handleEdit = (p) => {
    setForm({ ...emptyProperty, ...p, idea_tags: p.idea_tags || [], photos: p.photos || [], in_residence: p.in_residence || [] })
    setEditing(p.id)
    setView("edit")
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this property?")) return
    await fetch(`/api/admin/properties?id=${id}`, { method: "DELETE", headers })
    load()
  }

  const handleTogglePublish = async (p) => {
    await fetch("/api/admin/properties", {
      method: "PUT",
      headers,
      body: JSON.stringify({ id: p.id, published: !p.published }),
    })
    load()
  }

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    const urls = []
    for (const file of files) {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) urls.push(data.url)
    }
    setForm(f => ({
      ...f,
      photos: [...(f.photos || []), ...urls],
      hero_photo: f.hero_photo || urls[0] || "",
    }))
    setUploading(false)
    setMsg(`${urls.length} photo(s) uploaded`)
    setTimeout(() => setMsg(""), 3000)
  }

  const handleResidenceImageUpload = async (e, idx) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (data.url) {
      setForm(f => {
        const items = [...(f.in_residence || [])]
        items[idx] = { ...items[idx], image: data.url }
        return { ...f, in_residence: items }
      })
    }
    setUploading(false)
  }

  const setResidenceField = (idx, key, val) => {
    setForm(f => {
      const items = [...(f.in_residence || [])]
      items[idx] = { ...items[idx], [key]: val }
      return { ...f, in_residence: items }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      ...form,
      year: form.year ? parseInt(form.year) : null,
      price_value: form.price_value ? parseInt(form.price_value) : null,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null,
      sqft: form.sqft ? parseInt(form.sqft) : null,
    }
    const method = editing ? "PUT" : "POST"
    if (editing) payload.id = editing
    const res = await fetch("/api/admin/properties", { method, headers, body: JSON.stringify(payload) })
    const data = await res.json()
    if (data.error) {
      setMsg("Error: " + data.error)
    } else {
      setMsg("Saved!")
      load()
      setView("list")
    }
    setSaving(false)
    setTimeout(() => setMsg(""), 3000)
  }

  // Auth screen
  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 360, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 32, color: "#fff", marginBottom: 32 }}>Threshold Admin</div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && password === ADMIN_PASSWORD && setAuthed(true)}
          style={{ width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, padding: "12px 14px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#fff", outline: "none", marginBottom: 12 }}
        />
        <button
          onClick={() => password === ADMIN_PASSWORD ? setAuthed(true) : setMsg("Wrong password")}
          style={{ width: "100%", padding: "12px", background: "#fff", color: "#0c0c0c", border: "none", borderRadius: 40, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, cursor: "pointer" }}
        >Enter</button>
        {msg && <div style={{ marginTop: 12, color: "#e05555", fontSize: 13 }}>{msg}</div>}
      </div>
    </div>
  )

  // Property list
  if (view === "list") return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 28 }}>Properties</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {msg && <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#c9a96e" }}>{msg}</span>}
          <button onClick={handleNew} style={{ background: "#fff", color: "#0c0c0c", border: "none", borderRadius: 40, padding: "10px 24px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, cursor: "pointer" }}>+ New Property</button>
          <a href="/" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#555", textDecoration: "none" }}>← Site</a>
        </div>
      </div>

      <div style={{ padding: "40px 48px" }}>
        {properties.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", fontFamily: "var(--font-cormorant), serif", fontSize: 24, color: "rgba(255,255,255,0.2)" }}>
            No properties yet. Add your first one.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Property", "Architect", "Year", "Price", "Status", "Actions"].map(h => (
                  <th key={h} style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "#555", textTransform: "uppercase", textAlign: "left", padding: "0 0 12px", fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "16px 0", fontFamily: "var(--font-cormorant), serif", fontSize: 18 }}>
                    <div>{p.name}</div>
                    <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#555", marginTop: 2 }}>{p.location}</div>
                  </td>
                  <td style={{ padding: "16px 12px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#888" }}>{p.architect}</td>
                  <td style={{ padding: "16px 12px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#888" }}>{p.year}</td>
                  <td style={{ padding: "16px 12px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#888" }}>{p.price}</td>
                  <td style={{ padding: "16px 12px" }}>
                    <button
                      onClick={() => handleTogglePublish(p)}
                      style={{ background: p.published ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${p.published ? "#c9a96e" : "rgba(255,255,255,0.1)"}`, borderRadius: 40, padding: "4px 12px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: p.published ? "#c9a96e" : "#555", cursor: "pointer", letterSpacing: "0.05em" }}
                    >
                      {p.published ? "Live" : "Draft"}
                    </button>
                  </td>
                  <td style={{ padding: "16px 0", display: "flex", gap: 12 }}>
                    <button onClick={() => handleEdit(p)} style={{ background: "none", border: "none", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#fff", cursor: "pointer" }}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: "none", border: "none", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#e05555", cursor: "pointer" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )

  // Edit / New form
  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "#0c0c0c", zIndex: 10 }}>
        <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 24 }}>{editing ? "Edit Property" : "New Property"}</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {msg && <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: msg.includes("Error") ? "#e05555" : "#c9a96e" }}>{msg}</span>}
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#888", cursor: "pointer" }}>
            <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
            Publish
          </label>
          <button onClick={() => setView("list")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 40, padding: "9px 20px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#666", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ background: "#fff", color: "#0c0c0c", border: "none", borderRadius: 40, padding: "9px 24px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, cursor: saving ? "default" : "pointer" }}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px" }}>

        {/* Basic Info */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Basic Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div><Label>Property Name *</Label><Input value={form.name} onChange={set("name")} placeholder="Stahl House" /></div>
            <div><Label>Architect *</Label><Input value={form.architect} onChange={set("architect")} placeholder="Pierre Koenig" /></div>
            <div><Label>Year</Label><Input value={form.year} onChange={set("year")} type="number" placeholder="1960" /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={set("location")} placeholder="Hollywood Hills, Los Angeles" /></div>
            <div><Label>Price (display)</Label><Input value={form.price} onChange={set("price")} placeholder="$25M" /></div>
            <div><Label>Price (numeric, for filtering)</Label><Input value={form.price_value} onChange={set("price_value")} type="number" placeholder="25000000" /></div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Tags</div>
          <div style={{ marginBottom: 20 }}>
            <Label>Idea Tags</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {IDEA_TAGS.map(tag => (
                <button key={tag} onClick={() => setForm(f => ({ ...f, idea_tags: f.idea_tags.includes(tag) ? f.idea_tags.filter(t => t !== tag) : [...f.idea_tags, tag] }))}
                  style={{ background: form.idea_tags.includes(tag) ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.idea_tags.includes(tag) ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 40, padding: "6px 14px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: form.idea_tags.includes(tag) ? "#fff" : "#666", cursor: "pointer" }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Landscape Tag</Label>
            <div style={{ display: "flex", gap: 8 }}>
              {LANDSCAPE_TAGS.map(tag => (
                <button key={tag} onClick={() => setForm(f => ({ ...f, landscape_tag: f.landscape_tag === tag ? "" : tag }))}
                  style={{ background: form.landscape_tag === tag ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.landscape_tag === tag ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 40, padding: "6px 14px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: form.landscape_tag === tag ? "#fff" : "#666", cursor: "pointer" }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collection */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Collection</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <Label>Collection</Label>
              <select
                value={form.collection}
                onChange={e => setForm(f => ({ ...f, collection: e.target.value, subcategory: "" }))}
                style={{ width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, padding: "10px 12px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: form.collection ? "#fff" : "#555", outline: "none", cursor: "pointer" }}
              >
                <option value="">— None —</option>
                {COLLECTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Subcategory</Label>
              <select
                value={form.subcategory}
                onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                disabled={!form.collection}
                style={{ width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, padding: "10px 12px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: form.subcategory ? "#fff" : "#555", outline: "none", cursor: form.collection ? "pointer" : "default", opacity: form.collection ? 1 : 0.4 }}
              >
                <option value="">— None —</option>
                {(COLLECTIONS.find(c => c.id === form.collection)?.subcategories || []).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Editorial */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Editorial Content</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div><Label>Significance (one line summary)</Label><Input value={form.significance} onChange={set("significance")} placeholder="One of five surviving Koenig houses in Los Angeles" multiline rows={2} /></div>
            <div><Label>Editorial (main description)</Label><Input value={form.editorial} onChange={set("editorial")} placeholder="The house as argument..." multiline rows={5} /></div>
            <div><Label>Architect Context</Label><Input value={form.architect_context} onChange={set("architect_context")} placeholder="Pierre Koenig believed..." multiline rows={4} /></div>
            <div><Label>Site Context</Label><Input value={form.site_context} onChange={set("site_context")} placeholder="The lot sits at 1635 feet..." multiline rows={3} /></div>
          </div>
        </div>

        {/* Photos */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Photos</div>
          <label style={{ display: "block", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 4, padding: "32px", textAlign: "center", cursor: "pointer", marginBottom: 20 }}>
            <input type="file" multiple accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: uploading ? "#c9a96e" : "#555" }}>
              {uploading ? "Uploading..." : "Click to upload photos"}
            </div>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#333", marginTop: 6 }}>JPG, PNG — multiple files supported</div>
          </label>

          {form.photos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {form.photos.map((url, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={url} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 4, border: form.hero_photo === url ? "2px solid #c9a96e" : "2px solid transparent" }} />
                  <div style={{ position: "absolute", bottom: 6, left: 6, right: 6, display: "flex", gap: 6 }}>
                    <button onClick={() => setForm(f => ({ ...f, hero_photo: url }))} style={{ flex: 1, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 2, padding: "4px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, color: form.hero_photo === url ? "#c9a96e" : "#fff", cursor: "pointer" }}>
                      {form.hero_photo === url ? "Hero ★" : "Set Hero"}
                    </button>
                    <button onClick={() => setForm(f => ({ ...f, photos: f.photos.filter((_, j) => j !== i), hero_photo: f.hero_photo === url ? "" : f.hero_photo }))} style={{ background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 2, padding: "4px 8px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, color: "#e05555", cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* In Residence */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>In Residence</span>
            <button
              onClick={() => setForm(f => ({ ...f, in_residence: [...(f.in_residence || []), { ...emptyResidenceItem }] }))}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 40, padding: "4px 14px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#aaa", cursor: "pointer" }}
            >
              + Add Item
            </button>
          </div>

          {(!form.in_residence || form.in_residence.length === 0) && (
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#333", textAlign: "center", padding: "24px 0" }}>
              No items yet — AI will generate suggestions automatically.<br />Add items here to override with your own curation.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {(form.in_residence || []).map((item, idx) => (
              <div key={idx} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: 20 }}>
                <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
                  {/* Image */}
                  <label style={{ flexShrink: 0, width: 80, height: 80, borderRadius: 4, overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1a", border: "1px dashed rgba(255,255,255,0.12)", position: "relative" }}>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleResidenceImageUpload(e, idx)} />
                    {item.image
                      ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, color: "#444", textAlign: "center", lineHeight: 1.4 }}>Upload<br />image</span>
                    }
                  </label>
                  {/* Name + Designer row */}
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><Label>Object Name</Label><Input value={item.name} onChange={e => setResidenceField(idx, "name", e.target.value)} placeholder="Eames Lounge Chair" /></div>
                    <div><Label>Designer</Label><Input value={item.designer} onChange={e => setResidenceField(idx, "designer", e.target.value)} placeholder="Charles & Ray Eames" /></div>
                    <div><Label>Category</Label><Input value={item.category} onChange={e => setResidenceField(idx, "category", e.target.value)} placeholder="Seating" /></div>
                    <div><Label>Year</Label><Input value={item.year} onChange={e => setResidenceField(idx, "year", e.target.value)} placeholder="1956" /></div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div><Label>Why it belongs here</Label><Input value={item.reason} onChange={e => setResidenceField(idx, "reason", e.target.value)} placeholder="Designed the same year Koenig was sketching Case Study #21 — shares the same optimism about industrial materials." multiline rows={2} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><Label>Price</Label><Input value={item.price} onChange={e => setResidenceField(idx, "price", e.target.value)} placeholder="from $5,500" /></div>
                    <div><Label>Purchase URL</Label><Input value={item.url} onChange={e => setResidenceField(idx, "url", e.target.value)} placeholder="https://..." /></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setForm(f => ({ ...f, in_residence: f.in_residence.filter((_, i) => i !== idx) }))}
                      style={{ background: "none", border: "none", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#e05555", cursor: "pointer" }}
                    >Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent & Details (verified members only) */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: 8, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Agent & Details <span style={{ color: "#c9a96e" }}>(Verified Members Only)</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div><Label>Full Address</Label><Input value={form.full_address} onChange={set("full_address")} placeholder="1635 Woods Dr, Los Angeles" /></div>
            <div><Label>Agent Name</Label><Input value={form.agent_name} onChange={set("agent_name")} placeholder="William Baker" /></div>
            <div><Label>Agent Phone</Label><Input value={form.agent_phone} onChange={set("agent_phone")} placeholder="+1 310 555 0000" /></div>
            <div><Label>Agent Email</Label><Input value={form.agent_email} onChange={set("agent_email")} placeholder="agent@thebeverlyhillsagency.com" /></div>
            <div><Label>Brokerage</Label><Input value={form.agent_brokerage} onChange={set("agent_brokerage")} placeholder="The Agency" /></div>
            <div><Label>Bedrooms</Label><Input value={form.bedrooms} onChange={set("bedrooms")} type="number" placeholder="3" /></div>
            <div><Label>Bathrooms</Label><Input value={form.bathrooms} onChange={set("bathrooms")} type="number" placeholder="2.5" /></div>
            <div><Label>Square Feet</Label><Input value={form.sqft} onChange={set("sqft")} type="number" placeholder="2200" /></div>
            <div style={{ gridColumn: "span 2" }}><Label>Lot Size</Label><Input value={form.lot_size} onChange={set("lot_size")} placeholder="0.4 acres" /></div>
          </div>
        </div>

      </div>
    </div>
  )
}