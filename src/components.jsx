import { useState, useCallback, useMemo, useRef } from 'react';
export function getUnitIconType(name) {
  const n = name.toLowerCase();
  if (n.includes("primarch") || n.includes("lion el") || n.includes("jaghatai") || n.includes("leman russ") || n.includes("rogal dorn") || n.includes("sanguinius") || n.includes("ferrus") || n.includes("guilliman") || n.includes("vulkan") || n.includes("corax") || n.includes("fulgrim") || n.includes("perturabo") || n.includes("curze") || n.includes("angron") || n.includes("lorgar") || n.includes("mortarion") || n.includes("magnus") || n.includes("horus") || n.includes("alpharius")) return "primarch";
  if (n.includes("daemon")) return "daemon";
  if (n.includes("saturnine") && n.includes("dread")) return "dreadnought";
  // HQ characters - must check before terminator matching
  if (n.includes("praetor") || n.includes("centurion") || n.includes("magos") || n.includes("commander") || n.includes("champion") || n.includes("chaplain") || n.includes("librarian") || n.includes("moritat") || n.includes("herald") || n.includes("vigilator") || n.includes("forge lord") || n.includes("siege breaker") || n.includes("master of signal") || n.includes("apothecary")) return "commander";
  if (n.includes("cataphractii") || n.includes("tartaros") || n.includes("fulmentarus") || n.includes("aquilon") || n.includes("saturnine") || n.includes("terminator")) return "terminator";
  if (n.includes("contemptor") || n.includes("leviathan") || n.includes("deredeo") || n.includes("castra ferrum")) return "dreadnought";
  if (n.includes("predator") || n.includes("sicaran") || n.includes("land raider") || n.includes("spartan") || n.includes("proteus") || n.includes("leman russ") || n.includes("malcador") || n.includes("vindicator") || n.includes("araknae")) return "tank";
  if (n.includes("whirlwind") || n.includes("basilisk") || n.includes("medusa") || n.includes("rapier") || n.includes("thanatar")) return "artillery";
  if (n.includes("caladius") || n.includes("pallas")) return "grav_tank";
  if (n.includes("agamatus") || n.includes("jetbike") || n.includes("scimitar")) return "jetbike";
  if (n.includes("xiphon") || n.includes("storm eagle") || n.includes("fire raptor")) return "flyer";
  if (n.includes("javelin") || n.includes("land speeder")) return "grav_tank";
  if (n.includes("telemon")) return "heavy_dread";
  if (n.includes("castellax") || n.includes("vorax") || n.includes("thallax") || n.includes("krios") || n.includes("scyllax") || n.includes("automata")) return "automata";
  if (n.includes("myrmidon") || n.includes("ursarax")) return "tech_elite";
  if (n.includes("tech-thrall") || n.includes("adsecularis")) return "thrall";
  if (n.includes("custodian") || n.includes("sagittarum") || n.includes("sentinel guard") || n.includes("tribune")) return "custodes";
  if (n.includes("ogryn") || n.includes("charonite")) return "ogryn";
  if (n.includes("destroyer")) return "destroyer";
  if (n.includes("recon")) return "recon";
  if (n.includes("seeker")) return "seeker";
  if (n.includes("breacher")) return "breacher";
  if (n.includes("assault") || n.includes("despoiler")) return "assault";
  return "infantry";
}

export function UnitIcon({ type, size = 36, color = "#8b6508" }) {
  const s = size;
  const icons = {
    infantry: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4" fill={color} opacity="0.9"/>
        <rect x="14" y="12" width="8" height="12" rx="2" fill={color} opacity="0.8"/>
        <rect x="11" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="22" y="13" width="10" height="3" rx="1" fill={color} opacity="0.6" transform="rotate(-15 27 14)"/>
        <rect x="7" y="14" width="7" height="5" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    terminator: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="6" r="4.5" fill={color} opacity="0.9"/>
        <path d="M10 11 H26 L28 14 V26 L24 28 H12 L8 26 V14 Z" fill={color} opacity="0.8"/>
        <rect x="10" y="28" width="6" height="7" rx="2" fill={color} opacity="0.7"/>
        <rect x="20" y="28" width="6" height="7" rx="2" fill={color} opacity="0.7"/>
        <rect x="4" y="12" width="6" height="8" rx="2" fill={color} opacity="0.6"/>
        <rect x="26" y="12" width="6" height="8" rx="2" fill={color} opacity="0.6"/>
        <rect x="28" y="11" width="8" height="3" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    dreadnought: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <rect x="12" y="2" width="12" height="8" rx="2" fill={color} opacity="0.9"/>
        <rect x="8" y="10" width="20" height="16" rx="3" fill={color} opacity="0.85"/>
        <circle cx="18" cy="17" r="4" fill={color} opacity="0.5"/>
        <rect x="3" y="11" width="5" height="14" rx="2" fill={color} opacity="0.7"/>
        <rect x="28" y="11" width="5" height="14" rx="2" fill={color} opacity="0.7"/>
        <rect x="0" y="12" width="5" height="3" rx="1" fill={color} opacity="0.55"/>
        <rect x="10" y="26" width="6" height="8" rx="2" fill={color} opacity="0.7"/>
        <rect x="20" y="26" width="6" height="8" rx="2" fill={color} opacity="0.7"/>
      </svg>
    ),
    heavy_dread: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <rect x="11" y="1" width="14" height="9" rx="2" fill={color} opacity="0.9"/>
        <rect x="6" y="10" width="24" height="17" rx="3" fill={color} opacity="0.85"/>
        <circle cx="18" cy="17" r="5" fill={color} opacity="0.5"/>
        <rect x="1" y="10" width="5" height="16" rx="2" fill={color} opacity="0.7"/>
        <rect x="30" y="10" width="5" height="16" rx="2" fill={color} opacity="0.7"/>
        <rect x="8" y="27" width="8" height="8" rx="2" fill={color} opacity="0.7"/>
        <rect x="20" y="27" width="8" height="8" rx="2" fill={color} opacity="0.7"/>
      </svg>
    ),
    tank: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <rect x="4" y="16" width="28" height="12" rx="3" fill={color} opacity="0.85"/>
        <rect x="10" y="8" width="16" height="10" rx="2" fill={color} opacity="0.8"/>
        <rect x="22" y="4" width="14" height="4" rx="1" fill={color} opacity="0.65"/>
        <ellipse cx="8" cy="30" rx="4" ry="3" fill={color} opacity="0.6"/>
        <ellipse cx="18" cy="30" rx="4" ry="3" fill={color} opacity="0.6"/>
        <ellipse cx="28" cy="30" rx="4" ry="3" fill={color} opacity="0.6"/>
        <rect x="4" y="28" width="28" height="4" rx="2" fill={color} opacity="0.5"/>
      </svg>
    ),
    artillery: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <rect x="6" y="14" width="24" height="10" rx="3" fill={color} opacity="0.8"/>
        <rect x="14" y="6" width="12" height="10" rx="2" fill={color} opacity="0.75"/>
        <rect x="20" y="1" width="16" height="5" rx="1.5" fill={color} opacity="0.6" transform="rotate(10 28 3)"/>
        <ellipse cx="10" cy="28" rx="5" ry="4" fill={color} opacity="0.6"/>
        <ellipse cx="26" cy="28" rx="5" ry="4" fill={color} opacity="0.6"/>
        <rect x="6" y="24" width="24" height="5" rx="2" fill={color} opacity="0.5"/>
      </svg>
    ),
    grav_tank: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <ellipse cx="18" cy="22" rx="16" ry="7" fill={color} opacity="0.75"/>
        <rect x="10" y="10" width="16" height="12" rx="4" fill={color} opacity="0.85"/>
        <rect x="22" y="6" width="12" height="4" rx="1" fill={color} opacity="0.6"/>
        <ellipse cx="18" cy="32" rx="12" ry="2" fill={color} opacity="0.3"/>
      </svg>
    ),
    jetbike: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="8" r="3.5" fill={color} opacity="0.9"/>
        <path d="M12 12 H24 L28 18 L24 22 H12 L4 18 Z" fill={color} opacity="0.75"/>
        <ellipse cx="18" cy="28" rx="14" ry="4" fill={color} opacity="0.5"/>
        <rect x="6" y="22" width="24" height="6" rx="3" fill={color} opacity="0.65"/>
        <rect x="24" y="13" width="8" height="3" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    automata: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <rect x="12" y="2" width="12" height="8" rx="1" fill={color} opacity="0.9"/>
        <circle cx="15" cy="6" r="2" fill={color} opacity="0.4"/>
        <circle cx="21" cy="6" r="2" fill={color} opacity="0.4"/>
        <rect x="9" y="10" width="18" height="14" rx="2" fill={color} opacity="0.8"/>
        <rect x="4" y="11" width="5" height="12" rx="1" fill={color} opacity="0.65"/>
        <rect x="27" y="11" width="5" height="12" rx="1" fill={color} opacity="0.65"/>
        <rect x="11" y="24" width="6" height="10" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="19" y="24" width="6" height="10" rx="1.5" fill={color} opacity="0.7"/>
      </svg>
    ),
    tech_elite: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4" fill={color} opacity="0.9"/>
        <rect x="13" y="12" width="10" height="12" rx="2" fill={color} opacity="0.8"/>
        <circle cx="18" cy="17" r="3" fill={color} opacity="0.4"/>
        <rect x="11" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="5" y="10" width="8" height="4" rx="1" fill={color} opacity="0.5"/>
        <rect x="23" y="10" width="8" height="4" rx="1" fill={color} opacity="0.5"/>
        <circle cx="9" cy="12" r="2" fill={color} opacity="0.6"/>
        <circle cx="27" cy="12" r="2" fill={color} opacity="0.6"/>
      </svg>
    ),
    custodes: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="6" r="4" fill={color} opacity="0.9"/>
        <path d="M18 1 L20 4 L18 3 L16 4 Z" fill={color} opacity="0.7"/>
        <rect x="13" y="11" width="10" height="13" rx="2" fill={color} opacity="0.85"/>
        <rect x="11" y="24" width="5" height="9" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="9" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="22" y="12" width="10" height="2.5" rx="1" fill={color} opacity="0.6"/>
        <rect x="6" y="8" width="3" height="18" rx="1" fill={color} opacity="0.5"/>
        <polygon points="7.5,4 9,8 6,8" fill={color} opacity="0.6"/>
      </svg>
    ),
    commander: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4.5" fill={color} opacity="0.9"/>
        <path d="M14 2 L18 0 L22 2 L20 5 H16 Z" fill={color} opacity="0.65"/>
        <rect x="13" y="12" width="10" height="13" rx="2" fill={color} opacity="0.85"/>
        <rect x="11" y="25" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="25" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="23" y="14" width="9" height="3" rx="1" fill={color} opacity="0.6"/>
        <rect x="4" y="13" width="9" height="6" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    primarch: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="5" r="4.5" fill={color} opacity="0.95"/>
        <path d="M12 0 L18 -2 L24 0 L21 4 H15 Z" fill={color} opacity="0.7"/>
        <rect x="11" y="10" width="14" height="15" rx="2" fill={color} opacity="0.9"/>
        <rect x="10" y="25" width="6" height="10" rx="2" fill={color} opacity="0.75"/>
        <rect x="20" y="25" width="6" height="10" rx="2" fill={color} opacity="0.75"/>
        <rect x="4" y="10" width="7" height="10" rx="2" fill={color} opacity="0.6"/>
        <rect x="25" y="10" width="7" height="10" rx="2" fill={color} opacity="0.6"/>
        <rect x="28" y="8" width="8" height="3" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    daemon: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="8" r="5" fill={color} opacity="0.9"/>
        <path d="M12 4 L10 0 L14 5 Z" fill={color} opacity="0.7"/>
        <path d="M24 4 L26 0 L22 5 Z" fill={color} opacity="0.7"/>
        <rect x="12" y="13" width="12" height="13" rx="2" fill={color} opacity="0.8"/>
        <rect x="10" y="26" width="6" height="9" rx="2" fill={color} opacity="0.7"/>
        <rect x="20" y="26" width="6" height="9" rx="2" fill={color} opacity="0.7"/>
        <path d="M6 14 Q4 20 6 26" stroke={color} strokeWidth="2" fill="none" opacity="0.5"/>
        <path d="M30 14 Q32 20 30 26" stroke={color} strokeWidth="2" fill="none" opacity="0.5"/>
      </svg>
    ),
    ogryn: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="6" r="5" fill={color} opacity="0.9"/>
        <rect x="10" y="11" width="16" height="14" rx="3" fill={color} opacity="0.85"/>
        <rect x="9" y="25" width="7" height="10" rx="2" fill={color} opacity="0.7"/>
        <rect x="20" y="25" width="7" height="10" rx="2" fill={color} opacity="0.7"/>
        <rect x="4" y="12" width="6" height="10" rx="2" fill={color} opacity="0.6"/>
        <rect x="26" y="12" width="6" height="10" rx="2" fill={color} opacity="0.6"/>
      </svg>
    ),
    thrall: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="8" r="3.5" fill={color} opacity="0.7"/>
        <rect x="14" y="12" width="8" height="11" rx="1.5" fill={color} opacity="0.6"/>
        <rect x="12" y="23" width="5" height="8" rx="1" fill={color} opacity="0.5"/>
        <rect x="19" y="23" width="5" height="8" rx="1" fill={color} opacity="0.5"/>
        <rect x="22" y="14" width="8" height="2" rx="1" fill={color} opacity="0.4"/>
      </svg>
    ),
    destroyer: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4" fill={color} opacity="0.9"/>
        <rect x="14" y="12" width="8" height="12" rx="2" fill={color} opacity="0.8"/>
        <rect x="11" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <circle cx="18" cy="18" r="2" fill={color} opacity="0.4"/>
        <rect x="22" y="11" width="12" height="4" rx="1" fill={color} opacity="0.6"/>
        <circle cx="33" cy="13" r="2" fill={color} opacity="0.5"/>
      </svg>
    ),
    recon: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="3.5" fill={color} opacity="0.85"/>
        <rect x="14" y="11" width="8" height="11" rx="2" fill={color} opacity="0.7"/>
        <rect x="12" y="22" width="5" height="9" rx="1.5" fill={color} opacity="0.6"/>
        <rect x="19" y="22" width="5" height="9" rx="1.5" fill={color} opacity="0.6"/>
        <rect x="20" y="8" width="14" height="2.5" rx="1" fill={color} opacity="0.5"/>
        <circle cx="14" cy="5" r="2" fill={color} opacity="0.4"/>
      </svg>
    ),
    seeker: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4" fill={color} opacity="0.9"/>
        <rect x="14" y="12" width="8" height="12" rx="2" fill={color} opacity="0.8"/>
        <rect x="11" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="22" y="10" width="13" height="3" rx="1" fill={color} opacity="0.6"/>
        <circle cx="34" cy="11.5" r="1.5" fill={color} opacity="0.4"/>
        <path d="M16 3 L18 1 L20 3" stroke={color} strokeWidth="1" fill="none" opacity="0.5"/>
      </svg>
    ),
    breacher: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4" fill={color} opacity="0.9"/>
        <rect x="14" y="12" width="8" height="12" rx="2" fill={color} opacity="0.8"/>
        <rect x="11" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="4" y="8" width="10" height="16" rx="2" fill={color} opacity="0.55"/>
        <rect x="23" y="14" width="8" height="2.5" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    assault: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4" fill={color} opacity="0.9"/>
        <rect x="14" y="12" width="8" height="12" rx="2" fill={color} opacity="0.8"/>
        <rect x="11" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="8" y="6" width="4" height="14" rx="1" fill={color} opacity="0.5" transform="rotate(-20 10 13)"/>
        <rect x="22" y="14" width="8" height="2.5" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
  };
  return icons[type] || icons.infantry;
}

// ━━━ UNIT SELECTOR MODAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function UnitSelectorModal({ presets, onSelect, selectedId, onClose, accentColor = "#b8860b", title, isTarget = false }) {
  const [activeCategory, setActiveCategory] = useState(presets[0]?.category || "");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUnits = useMemo(() => {
    if (!searchTerm) {
      return presets.find(c => c.category === activeCategory)?.units || [];
    }
    const term = searchTerm.toLowerCase();
    return presets.flatMap(c => c.units).filter(u => u.name.toLowerCase().includes(term));
  }, [activeCategory, searchTerm, presets]);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.15s ease", padding: 16
    }} onClick={onClose}>
      <div style={{
        background: "#ffffff", borderRadius: 12, width: "100%", maxWidth: 700,
        maxHeight: "80vh", display: "flex", flexDirection: "column",
        border: `2px solid ${accentColor}`, boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        overflow: "hidden"
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: "14px 18px", borderBottom: "1px solid #d0c4aa",
          background: `linear-gradient(180deg, rgba(${accentColor === "#b8860b" ? "184,134,11" : "42,111,180"},0.08) 0%, transparent 100%)`,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ fontFamily: "'Share Tech Mono', serif", fontWeight: 700, fontSize: 14, color: accentColor, letterSpacing: 2 }}>
            {title}
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 20, color: "#8a7e6e", cursor: "pointer", padding: "2px 6px"
          }}>✕</button>
        </div>

        <div style={{ padding: "10px 18px", borderBottom: "1px solid #050705" }}>
          <input
            type="text" placeholder="Search units..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px", borderRadius: 6, fontSize: 13,
              border: "1px solid #d0c4aa", background: "#f9f6f0", color: "#2a2418",
              fontFamily: "'Share Tech Mono', serif"
            }}
          />
        </div>

        {!searchTerm && (
          <div style={{
            display: "flex", gap: 0, borderBottom: "1px solid #d0c4aa",
            overflowX: "auto", flexShrink: 0
          }}>
            {presets.map(cat => (
              <button key={cat.category} onClick={() => setActiveCategory(cat.category)} style={{
                padding: "10px 16px", fontSize: 11, cursor: "pointer",
                fontFamily: "'Share Tech Mono', serif", fontWeight: activeCategory === cat.category ? 700 : 400,
                letterSpacing: 1, whiteSpace: "nowrap", border: "none", borderBottom: activeCategory === cat.category ? `2px solid ${accentColor}` : "2px solid transparent",
                background: activeCategory === cat.category ? `rgba(${accentColor === "#b8860b" ? "184,134,11" : "42,111,180"},0.08)` : "transparent",
                color: activeCategory === cat.category ? accentColor : "#8a7e6e",
                transition: "all 0.15s ease"
              }}>{cat.category}</button>
            ))}
          </div>
        )}

        <div style={{
          padding: 14, overflowY: "auto", flex: 1,
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 8, alignContent: "start"
        }}>
          {filteredUnits.map(u => {
            const iconType = getUnitIconType(u.name);
            const uid = u.id || u.name;
            const isSelected = selectedId === uid;
            return (
              <button key={uid} onClick={() => onSelect(u)} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "10px 8px 8px", borderRadius: 8, cursor: "pointer",
                background: isSelected ? `rgba(${accentColor === "#b8860b" ? "184,134,11" : "42,111,180"},0.12)` : "#f9f6f0",
                border: `1.5px solid ${isSelected ? accentColor : "#e0dbd0"}`,
                transition: "all 0.15s ease", textAlign: "center",
                boxShadow: isSelected ? `0 2px 8px rgba(${accentColor === "#b8860b" ? "184,134,11" : "42,111,180"},0.15)` : "none"
              }}>
                <UnitIcon type={iconType} size={32} color={isSelected ? accentColor : "#8a7e6e"} />
                <div style={{
                  fontSize: 13, fontFamily: "'Share Tech Mono', serif", fontWeight: 600,
                  color: isSelected ? "#2a2418" : "#4a4030", marginTop: 4, lineHeight: 1.2,
                  minHeight: 26, display: "flex", alignItems: "center"
                }}>{u.name}</div>
                <div style={{
                  fontSize: 13, color: "#6a5e4e", fontFamily: "'Share Tech Mono', serif",
                  marginTop: 4, letterSpacing: 0.5
                }}>
                  {isTarget
                    ? `T${u.t} ${u.w}W Sv${u.sv}+ ${u.inv !== "-" ? `Inv${u.inv}+` : ""} ${u.fnp !== "-" ? `FNP${u.fnp}+` : ""} Ld${u.ld || "?"}`
                    : `${u.models} model${u.models > 1 ? "s" : ""} · BS${u.bs}`
                  }
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ━━━ WEAPON SELECTOR (inline, shown after unit is picked) ━━━━━━━━━━━━━━━━━━━

export function WeaponSelector({ weapons, selectedWeaponName, onSelect }) {
  if (!weapons || weapons.length === 0) return null;
  const baseWeapons = weapons.filter(w => !w.isLegion);
  const legionWeapons = weapons.filter(w => w.isLegion);
  const renderBtn = (w) => {
    const active = selectedWeaponName === w.name;
    return (
      <button key={w.name} onClick={() => onSelect(w)} style={{
        padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
        fontFamily: "'Share Tech Mono', serif", fontWeight: active ? 700 : 400,
        background: active ? (w.isLegion ? "rgba(120,90,154,0.18)" : "rgba(184,134,11,0.18)") : "#f0ebe2",
        border: `1.5px solid ${active ? (w.isLegion ? "#7a5a9a" : "#b8860b") : "#d0c4aa"}`,
        color: active ? (w.isLegion ? "#7a5a9a" : "#b8860b") : "#6a5e4e",
        transition: "all 0.15s ease", textAlign: "left",
        display: "flex", flexDirection: "column", gap: 2, minWidth: 120,
      }}>
        <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          {w.name}
          {w.isLegion && <span style={{ fontSize: 7, padding: "1px 4px", borderRadius: 3, background: "rgba(120,90,154,0.15)", color: "#7a5a9a", fontFamily: "'Share Tech Mono',serif", letterSpacing: 0.5, fontWeight: 700 }}>LEGION</span>}
        </div>
        <div style={{ fontSize: 11, color: active ? (w.isLegion ? "#6a4a8a" : "#8b6508") : "#8a7e6e", letterSpacing: 0.5 }}>
          {w.type} {w.shots} · S{w.s} AP{w.ap} D{w.damage}
        </div>
      </button>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 13, color: "#6a5e4e", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Share Tech Mono', serif" }}>Weapon Loadout</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {baseWeapons.map(renderBtn)}
      </div>
      {legionWeapons.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: "#7a5a9a", fontFamily: "'Share Tech Mono',serif", letterSpacing: 1, marginTop: 4, paddingTop: 4, borderTop: "1px solid rgba(120,90,154,0.2)" }}>⚜ LEGION WEAPONS</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {legionWeapons.map(renderBtn)}
          </div>
        </>
      )}
    </div>
  );
}

// ━━━ UI COMPONENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const phaseColors = {
  "Setup": "#6a6a6a",
  "To Hit": "#b8860b",
  "To Wound": "#b83030",
  "Saves": "#2a6fb4",
  "FNP": "#6b3fa0",
  "Special": "#c46a1b",
  "Sergeant": "#6b3f8a",
  "Checks": "#8b5a2b",
  "Result": "#2e7d32",
  "Charge": "#9b2d2d",
  "Volley Fire": "#6b8e23",
  "Def Volley": "#2a6fb4",
  "Return Fire": "#8b4513",
  "Overwatch": "#c46a1b",
  "Melee": "#7a1e1e",
  "Combat Res": "#4a148c"
};

export const phaseIcons = {
  "Setup": "⚙",
  "To Hit": "🎯",
  "To Wound": "⚔",
  "Saves": "🛡",
  "FNP": "💜",
  "Special": "✦",
  "Sergeant": "⚔",
  "Checks": "📋",
  "Result": "☠",
  "Charge": "🏃",
  "Volley Fire": "🔫",
  "Def Volley": "🔫",
  "Return Fire": "🎯",
  "Overwatch": "🔥",
  "Melee": "⚔",
  "Combat Res": "⚖"
};

export function DieIcon({ value, success, reroll, small }) {
  const sz = small ? 22 : 28;
  const faces = {
    1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅"
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: sz, height: sz, fontSize: sz - 6,
      borderRadius: 4, margin: 1,
      background: success ? "rgba(46,125,50,0.15)" : "rgba(200,50,50,0.1)",
      border: `1px solid ${success ? "#2e7d32" : "#c74040"}`,
      color: success ? "#2e7d32" : "#c74040",
      opacity: reroll ? 0.7 : 1,
      position: "relative"
    }} title={`${value}${reroll ? " (re-roll)" : ""}`}>
      {faces[value]}
      {reroll && <span style={{ position: "absolute", top: -3, right: -3, fontSize: 8, color: "#b8860b" }}>↻</span>}
    </span>
  );
}

export function NumberInput({ label, value, onChange, min = 0, max = 20, step = 1 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 13, color: "#6a5e4e", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Share Tech Mono', serif" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={() => onChange(Math.max(min, value - step))} style={stepBtnStyle}>−</button>
        <input type="number" value={value} onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
          style={{ width: 48, textAlign: "center", background: "#f0ebe2", border: "1px solid #c0b498", borderRadius: 4, color: "#2a2418", padding: "6px 4px", fontSize: 17, fontFamily: "'Share Tech Mono', serif" }} />
        <button onClick={() => onChange(Math.min(max, value + step))} style={stepBtnStyle}>+</button>
      </div>
    </div>
  );
}

export const stepBtnStyle = {
  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
  background: "#050705", border: "1px solid #d0c4aa", borderRadius: 4, color: "#8b6508",
  cursor: "pointer", fontSize: 17, fontFamily: "'Share Tech Mono', serif"
};

export function SelectInput({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 13, color: "#6a5e4e", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Share Tech Mono', serif" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ background: "#f0ebe2", border: "1px solid #c0b498", borderRadius: 4, color: "#2a2418", padding: "6px 8px", fontSize: 13, fontFamily: "'Share Tech Mono', serif" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function ToggleChip({ active, label, desc, onClick }) {
  return (
    <button onClick={onClick} title={desc} style={{
      padding: "5px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
      background: active ? "rgba(184,134,11,0.2)" : "#f0ebe2",
      border: `1px solid ${active ? "#b8860b" : "#d0c4aa"}`,
      color: active ? "#b8860b" : "#8a7e6e",
      transition: "all 0.15s ease",
      fontFamily: "'Share Tech Mono', serif"
    }}>{label}</button>
  );
}

export function CheckToggle({ checked, label, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "#4a4030", fontFamily: "'Share Tech Mono', serif" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ accentColor: "#b8860b" }} />
      {label}
    </label>
  );
}

// ━━━ MAIN APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
