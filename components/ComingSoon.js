export default function ComingSoon() {
  return (
    <div style={{
      background: "#131313",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
    }}>
      <img src="/threshold-logo.png" alt="Threshold" style={{ height: 44, width: "auto" }} />
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        letterSpacing: "0.18em",
        color: "rgba(255,255,255,0.32)",
        textTransform: "uppercase",
        margin: 0,
      }}>
        Coming soon
      </p>
    </div>
  )
}
