"use client"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"

function PendingScreen({ email, onSignOut }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center", padding: "24px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <a href="/" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, letterSpacing: "0.2em", color: "#fff", textDecoration: "none" }}>THRESHOLD</a>
        <div />
        <div style={{ textAlign: "right" }}>
          <button onClick={onSignOut} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 40, padding: "8px 20px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#888", cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#c9a96e", marginBottom: 20, textTransform: "uppercase" }}>
            Application Received
          </div>
          <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 48, color: "#fff", lineHeight: 1.1, marginBottom: 24 }}>
            Your application<br />is under review.
          </div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 40 }}>
            We review all applications within 48 hours. Once approved, you'll have full access to property details, agent contacts, and tour scheduling.
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "20px 24px" }}>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "#555", textTransform: "uppercase", marginBottom: 8 }}>
              Signed in as
            </div>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#888" }}>
              {email}
            </div>
          </div>
          <div style={{ marginTop: 32 }}>
            <a href="/" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#444", textDecoration: "none", letterSpacing: "0.05em" }}>
              ← Return to collection
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function VerifiedDashboard({ user, profile, saved, tours, onSignOut }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", color: "#fff" }}>
      {/* Nav */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center", padding: "24px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <a href="/" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, letterSpacing: "0.2em", color: "#fff", textDecoration: "none" }}>THRESHOLD</a>
        <div style={{ textAlign: "center", fontFamily: "var(--font-cormorant), serif", fontSize: 18, color: "rgba(255,255,255,0.3)" }}>
          Member Portal
        </div>
        <div style={{ textAlign: "right" }}>
          <button onClick={onSignOut} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 40, padding: "8px 20px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#888", cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 48px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#c9a96e", marginBottom: 12, textTransform: "uppercase" }}>
            Threshold Verified
          </div>
          <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 48, lineHeight: 1.1 }}>
            Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
          </div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#555", marginTop: 12 }}>
            {user?.email}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden", marginBottom: 60 }}>
          {[
            { label: "Saved Estates", value: saved.length },
            { label: "Tour Requests", value: tours.length },
            { label: "Budget", value: profile?.budget || "—" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "#0c0c0c", padding: "32px 28px" }}>
              <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 36, marginBottom: 6 }}>{stat.value}</div>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "#555", textTransform: "uppercase" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Saved Estates */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: 24 }}>
            Saved Estates
          </div>
          {saved.length === 0 ? (
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 22, color: "rgba(255,255,255,0.2)", padding: "40px 0" }}>
              No saved estates yet. Explore the collection to save properties.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {saved.map(s => (
                <div key={s.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "20px 24px" }}>
                  <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20 }}>{s.property_id}</div>
                  <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#555", marginTop: 6 }}>
                    Saved {new Date(s.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tour Requests */}
        <div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: 24 }}>
            Tour Requests
          </div>
          {tours.length === 0 ? (
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 22, color: "rgba(255,255,255,0.2)", padding: "40px 0" }}>
              No tour requests yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tours.map(t => (
                <div key={t.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20 }}>{t.property_name}</div>
                    <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#555", marginTop: 4 }}>
                      {t.preferred_date} · {t.preferred_time}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: t.status === "confirmed" ? "#c9a96e" : t.status === "cancelled" ? "#e05555" : "#555",
                    border: `1px solid ${t.status === "confirmed" ? "#c9a96e" : t.status === "cancelled" ? "#e05555" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 40, padding: "6px 14px",
                  }}>
                    {t.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [saved, setSaved] = useState([])
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push("/"); return }
      setUser(session.user)

      const { data: prof } = await supabase
        .from("profiles").select("*").eq("id", session.user.id).single()
      setProfile(prof)

      if (prof?.verified) {
        const { data: savedData } = await supabase
          .from("saved_estates").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false })
        setSaved(savedData || [])

        const { data: tourData } = await supabase
          .from("tour_requests").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false })
        setTours(tourData || [])
      }

      setLoading(false)
    }
    init()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 24, color: "#fff", opacity: 0.4 }}>Loading…</div>
    </div>
  )

  if (!profile?.verified) {
    return <PendingScreen email={user?.email} onSignOut={signOut} />
  }

  return <VerifiedDashboard user={user} profile={profile} saved={saved} tours={tours} onSignOut={signOut} />
}