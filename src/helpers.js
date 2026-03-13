export function StatBox({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 13, color: "#5a4e3e", fontFamily: "'Share Tech Mono', serif", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 22, color, fontFamily: "'Share Tech Mono', serif", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export function MiniStat({ label, value, color = "#2a2418" }) {
  return (
    <div style={{ padding: "6px 12px", background: "#ede8df", borderRadius: 6, textAlign: "center", minWidth: 44 }}>
      <div style={{ fontSize: 12, color: "#6a5e4e", fontFamily: "'Share Tech Mono', serif", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 17, color, fontWeight: 700, fontFamily: "'Share Tech Mono', serif", lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}

export const panelStyle = {
  background: "#faf7f2",
  border: "1.5px solid #c8b898",
  borderRadius: 10,
  padding: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
};

export const panelHeaderStyle = {
  display: "flex", alignItems: "center", gap: 10,
  fontSize: 13, fontFamily: "'Share Tech Mono', serif", fontWeight: 700,
  color: "#4a3e2e", letterSpacing: 2, textTransform: "uppercase",
  marginBottom: 16, paddingBottom: 10,
  borderBottom: "1px solid #d8cdb8",
};

export const refCellStyle = {
  padding: "5px 6px", textAlign: "center",
  fontFamily: "'Share Tech Mono', serif", fontSize: 12
};
