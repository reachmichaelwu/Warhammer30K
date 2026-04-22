// UI sub-components (modals, selectors, inputs, die icons)
// Lines 5952-6228 from shooting-resolver165.jsx

// ━━━ UNIT SELECTOR MODAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function UnitSelectorModal({ presets, onSelect, selectedId, onClose, accentColor = "#b8860b", title, isTarget = false, faction }) {
  // Faction category prefix helpers (also match legacy unprefixed category names)
  const isSACat            = (cat) => cat && (cat.startsWith("SA: ") || cat === "SOLAR AUXILIA");
  const isMechCat          = (cat) => cat && cat.startsWith("MECH:");
  const isCustodesCat      = (cat) => cat && (cat.startsWith("CUSTODES:") || cat === "CUSTODES");
  // Legion-specific categories follow the pattern "NUMERAL: NAME" (e.g. "I: DARK ANGELS")
  const isLegionSpecificCat = (cat) => cat && /^[IVX]+: /.test(cat);

  // For a specific legion faction (not legiones_astartes/SA/MECH/CUSTODES), look up
  // the Roman numeral so we can match its own category (e.g. "I: " for dark_angels).
  const factionNumeral = (typeof LEGION_FACTION_BY_ID !== "undefined")
    ? ((LEGION_FACTION_BY_ID[faction] || {}).numeral || null)
    : null;
  // A "specific legion" means a named legion (not the generic catch-all).
  const isSpecificLegion = faction
    && faction !== "legiones_astartes"
    && faction !== "sol_auxilia"
    && faction !== "mechanicum"
    && faction !== "custodes";

  // Filter preset categories based on selected faction:
  //   sol_auxilia        → only "SA: *" categories
  //   mechanicum         → only "MECH: *" categories
  //   custodes           → only "CUSTODES: *" categories
  //   specific legion    → generic categories + own legion category (e.g. "I: DARK ANGELS"),
  //                        then also strip faction-specific units from generic categories
  //   legiones_astartes  → all legion categories (exclude SA, MECH, CUSTODES)
  const visiblePresets = useMemo(() => {
    if (!faction) return presets;
    if (faction === "sol_auxilia") return presets.filter(c => isSACat(c.category));
    if (faction === "mechanicum")  return presets.filter(c => isMechCat(c.category));
    if (faction === "custodes")    return presets.filter(c => isCustodesCat(c.category));

    // Build the category list for any legion faction
    let categories = presets.filter(c => {
      if (isSACat(c.category) || isMechCat(c.category) || isCustodesCat(c.category)) return false;
      if (isLegionSpecificCat(c.category)) {
        // For a specific legion show only its own category; for legiones_astartes show all
        if (isSpecificLegion && factionNumeral && factionNumeral !== "-") {
          return c.category.startsWith(factionNumeral + ": ");
        }
        return true;
      }
      return true; // Generic category — always include
    });

    // For a specific legion, remove units that belong to a different faction
    // (e.g. hide non-matching Primarchs from the WARLORD categories)
    if (isSpecificLegion && typeof UNIT_SPECIFIC_FACTION !== "undefined") {
      categories = categories
        .map(c => ({
          ...c,
          units: c.units.filter(u => {
            const unitFaction = UNIT_SPECIFIC_FACTION[u.id];
            // If the unit is tied to a specific faction it must match; generic units always pass
            return !unitFaction || unitFaction === faction;
          }),
        }))
        .filter(c => c.units.length > 0); // Drop now-empty categories
    }

    return categories;
  }, [presets, faction]);

  const [activeCategory, setActiveCategory] = useState(visiblePresets[0]?.category || "");
  const [searchTerm, setSearchTerm] = useState("");

  // Keep activeCategory valid when faction filter changes
  useEffect(() => {
    if (!visiblePresets.find(c => c.category === activeCategory)) {
      setActiveCategory(visiblePresets[0]?.category || "");
    }
  }, [visiblePresets]);

  const filteredUnits = useMemo(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return visiblePresets.flatMap(c => c.units).filter(u => u.name.toLowerCase().includes(term));
    }
    const activePreset = visiblePresets.find(c => c.category === activeCategory);
    return activePreset ? activePreset.units : [];
  }, [activeCategory, searchTerm, visiblePresets]);

  return (
    React.createElement("div", {"style": {
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.15s ease", padding: 16
    }, "onClick": onClose}, React.createElement("div", {"style": {
        background: "#ffffff", borderRadius: 12, width: "100%", maxWidth: 700,
        maxHeight: "80vh", display: "flex", flexDirection: "column",
        border: `2px solid ${accentColor}`, boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        overflow: "hidden"
      }, "onClick": e => e.stopPropagation()}, React.createElement("div", {"style": {
          padding: "14px 18px", borderBottom: "1px solid #d0c4aa",
          background: `linear-gradient(180deg, rgba(${accentColor === "#b8860b" ? "184,134,11" : "42,111,180"},0.08) 0%, transparent 100%)`,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}, React.createElement("div", {"style": { fontFamily: "'Share Tech Mono', serif", fontWeight: 700, fontSize: 14, color: accentColor, letterSpacing: 2 }}, title), React.createElement("button", {"onClick": onClose, "style": {
            background: "none", border: "none", fontSize: 20, color: "#8a7e6e", cursor: "pointer", padding: "2px 6px"
          }}, "✕")), React.createElement("div", {"style": { padding: "10px 18px", borderBottom: "1px solid #050705" }}, React.createElement("input", {"type": "text", "placeholder": "Search units...", "value": searchTerm, "onChange": e => setSearchTerm(e.target.value), "style": {
              width: "100%", padding: "8px 12px", borderRadius: 6, fontSize: 13,
              border: "1px solid #d0c4aa", background: "#f9f6f0", color: "#2a2418",
              fontFamily: "'Share Tech Mono', serif"
            }})), !searchTerm && (
          React.createElement("div", {"style": {
            display: "flex", gap: 0, borderBottom: "1px solid #d0c4aa",
            overflowX: "auto", flexShrink: 0
          }}, visiblePresets.map(cat => (
              React.createElement("button", {"key": cat.category, "onClick": () => setActiveCategory(cat.category), "style": {
                padding: "10px 16px", fontSize: 11, cursor: "pointer",
                fontFamily: "'Share Tech Mono', serif", fontWeight: activeCategory === cat.category ? 700 : 400,
                letterSpacing: 1, whiteSpace: "nowrap", border: "none", borderBottom: activeCategory === cat.category ? `2px solid ${accentColor}` : "2px solid transparent",
                background: activeCategory === cat.category ? `rgba(${accentColor === "#b8860b" ? "184,134,11" : "42,111,180"},0.08)` : "transparent",
                color: activeCategory === cat.category ? accentColor : "#8a7e6e",
                transition: "all 0.15s ease"
              }}, cat.category)
            )))
        ), React.createElement("div", {"style": {
          padding: 14, overflowY: "auto", flex: 1,
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 8, alignContent: "start"
        }}, filteredUnits.map(u => {
            const iconType = getUnitIconType(u.name);
            const uid = u.id || u.name;
            const isSelected = selectedId === uid;
            return (
              React.createElement("button", {"key": uid, "onClick": () => onSelect(u), "style": {
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "8px 8px 8px", borderRadius: 8, cursor: "pointer", width: "100%",
                background: isSelected ? `rgba(${accentColor === "#b8860b" ? "184,134,11" : "42,111,180"},0.12)` : "#f9f6f0",
                border: `1.5px solid ${isSelected ? accentColor : "#e0dbd0"}`,
                transition: "all 0.15s ease", textAlign: "center", overflow: "hidden",
                boxShadow: isSelected ? `0 2px 8px rgba(${accentColor === "#b8860b" ? "184,134,11" : "42,111,180"},0.15)` : "none"
              }}, typeof getUnitArtwork === "function" && getUnitArtwork(u.id, faction) ? React.createElement("img", { src: getUnitArtwork(u.id, faction), alt: "", style: { width: "100%", height: 80, objectFit: "contain", background: "#1e1a14", borderRadius: 5, marginBottom: 4, border: `1px solid ${isSelected ? accentColor : "#e0dbd0"}` }, onError: function(e) { e.currentTarget.style.display = "none"; } }) : React.createElement(UnitIcon, {"type": iconType, "size": 32, "color": isSelected ? accentColor : "#8a7e6e"}), React.createElement("div", {"style": {
                  fontSize: 15, fontFamily: "'Share Tech Mono', serif", fontWeight: 600,
                  color: isSelected ? "#2a2418" : "#4a4030", marginTop: 4, lineHeight: 1.2,
                  minHeight: 26, display: "flex", alignItems: "center"
                }}, u.name), React.createElement("div", {"style": {
                  fontSize: 14, color: "#6a5e4e", fontFamily: "'Share Tech Mono', serif",
                  marginTop: 4, letterSpacing: 0.5
                }}, isTarget
                    ? `T${u.t} ${u.w}W Sv${u.sv}+ ${u.inv !== "-" ? `Inv${u.inv}+` : ""} ${u.fnp !== "-" ? `FNP${u.fnp}+` : ""} Ld${u.ld || "?"}`
                    : `${u.models} model${u.models > 1 ? "s" : ""} · BS${u.bs}`))
            );
          }))))
  );
}

// ━━━ WEAPON SELECTOR (inline, shown after unit is picked) ━━━━━━━━━━━━━━━━━━━

function WeaponSelector({ weapons, selectedWeaponName, onSelect }) {
  if (!weapons || weapons.length === 0) return null;
  const baseWeapons = weapons.filter(w => !w.isLegion);
  const legionWeapons = weapons.filter(w => w.isLegion);
  const renderBtn = (w) => {
    const active = selectedWeaponName === w.name;
    return (
      React.createElement("button", {"key": w.name, "onClick": () => onSelect(w), "style": {
        padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
        fontFamily: "'Share Tech Mono', serif", fontWeight: active ? 700 : 400,
        background: active ? (w.isLegion ? "rgba(120,90,154,0.18)" : "rgba(184,134,11,0.18)") : "#f0ebe2",
        border: `1.5px solid ${active ? (w.isLegion ? "#7a5a9a" : "#b8860b") : "#d0c4aa"}`,
        color: active ? (w.isLegion ? "#7a5a9a" : "#b8860b") : "#6a5e4e",
        transition: "all 0.15s ease", textAlign: "left",
        display: "flex", flexDirection: "column", gap: 2, minWidth: 120,
      }}, React.createElement("div", {"style": { fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}, w.name, w.isLegion && React.createElement("span", {"style": { fontSize: 7, padding: "1px 4px", borderRadius: 3, background: "rgba(120,90,154,0.15)", color: "#7a5a9a", fontFamily: "'Share Tech Mono',serif", letterSpacing: 0.5, fontWeight: 700 }}, "LEGION")), React.createElement("div", {"style": { fontSize: 11, color: active ? (w.isLegion ? "#6a4a8a" : "#8b6508") : "#8a7e6e", letterSpacing: 0.5 }}, w.type, w.shots, "· S", w.s, "AP", w.ap, "D", w.damage))
    );
  };
  return (
    React.createElement("div", {"style": { display: "flex", flexDirection: "column", gap: 4 }}, React.createElement("label", {"style": { fontSize: 13, color: "#6a5e4e", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Share Tech Mono', serif" }}, "Weapon Loadout"), React.createElement("div", {"style": { display: "flex", gap: 6, flexWrap: "wrap" }}, baseWeapons.map(renderBtn)), legionWeapons.length > 0 && (
        React.createElement(React.Fragment, null, React.createElement("div", {"style": { fontSize: 11, color: "#7a5a9a", fontFamily: "'Share Tech Mono',serif", letterSpacing: 1, marginTop: 4, paddingTop: 4, borderTop: "1px solid rgba(120,90,154,0.2)" }}, "⚜ LEGION WEAPONS"), React.createElement("div", {"style": { display: "flex", gap: 6, flexWrap: "wrap" }}, legionWeapons.map(renderBtn)))
      ))
  );
}

// ━━━ UI COMPONENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

var phaseColors = {
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

var phaseIcons = {
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

function DieIcon({ value, success, reroll, small }) {
  const sz = small ? 22 : 28;
  const faces = {
    1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅"
  };
  return (
    React.createElement("span", {"style": {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: sz, height: sz, fontSize: sz - 6,
      borderRadius: 4, margin: 1,
      background: success ? "rgba(46,125,50,0.15)" : "rgba(200,50,50,0.1)",
      border: `1px solid ${success ? "#2e7d32" : "#c74040"}`,
      color: success ? "#2e7d32" : "#c74040",
      opacity: reroll ? 0.7 : 1,
      position: "relative"
    }, "title": `${value}${reroll ? " (re-roll)" : ""}`}, faces[value], reroll && React.createElement("span", {"style": { position: "absolute", top: -3, right: -3, fontSize: 8, color: "#b8860b" }}, "↻"))
  );
}

function NumberInput({ label, value, onChange, min = 0, max = 20, step = 1 }) {
  return (
    React.createElement("div", {"style": { display: "flex", flexDirection: "column", gap: 4 }}, React.createElement("label", {"style": { fontSize: 13, color: "#6a5e4e", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Share Tech Mono', serif" }}, label), React.createElement("div", {"style": { display: "flex", alignItems: "center", gap: 4 }}, React.createElement("button", {"onClick": () => onChange(Math.max(min, value - step)), "style": stepBtnStyle}, "−"), React.createElement("input", {"type": "number", "value": value, "onChange": e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min))), "style": { width: 48, textAlign: "center", background: "#f0ebe2", border: "1px solid #c0b498", borderRadius: 4, color: "#2a2418", padding: "6px 4px", fontSize: 17, fontFamily: "'Share Tech Mono', serif" }}), React.createElement("button", {"onClick": () => onChange(Math.min(max, value + step)), "style": stepBtnStyle}, "+")))
  );
}

var stepBtnStyle = {
  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
  background: "#050705", border: "1px solid #d0c4aa", borderRadius: 4, color: "#8b6508",
  cursor: "pointer", fontSize: 17, fontFamily: "'Share Tech Mono', serif"
};

function SelectInput({ label, value, onChange, options }) {
  return (
    React.createElement("div", {"style": { display: "flex", flexDirection: "column", gap: 4 }}, React.createElement("label", {"style": { fontSize: 13, color: "#6a5e4e", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Share Tech Mono', serif" }}, label), React.createElement("select", {"value": value, "onChange": e => onChange(e.target.value), "style": { background: "#f0ebe2", border: "1px solid #c0b498", borderRadius: 4, color: "#2a2418", padding: "6px 8px", fontSize: 13, fontFamily: "'Share Tech Mono', serif" }}, options.map(o => React.createElement("option", {"key": o.value, "value": o.value}, o.label))))
  );
}

function ToggleChip({ active, label, desc, onClick }) {
  return (
    React.createElement("button", {"onClick": onClick, "title": desc, "style": {
      padding: "5px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
      background: active ? "rgba(184,134,11,0.2)" : "#f0ebe2",
      border: `1px solid ${active ? "#b8860b" : "#d0c4aa"}`,
      color: active ? "#b8860b" : "#8a7e6e",
      transition: "all 0.15s ease",
      fontFamily: "'Share Tech Mono', serif"
    }}, label)
  );
}

function CheckToggle({ checked, label, onChange }) {
  return (
    React.createElement("label", {"style": { display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "#4a4030", fontFamily: "'Share Tech Mono', serif" }}, React.createElement("input", {"type": "checkbox", "checked": checked, "onChange": e => onChange(e.target.checked), "style": { accentColor: "#b8860b" }}), label)
  );
}

// ━━━ MAIN APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
