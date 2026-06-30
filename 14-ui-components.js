// UI sub-components (modals, selectors, inputs, die icons)
// Lines 5952-6228 from shooting-resolver165.jsx

// ━━━ ERROR BOUNDARY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Catches render-time exceptions in any descendant so a buggy modal/component
// no longer unmounts the entire React tree (which previously left the screen
// blank with no on-screen diagnostics). Shows the error message + stack so the
// real cause is visible to the user, instead of a silent white screen.
class HHErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { error: error };
  }
  componentDidCatch(error, info) {
    this.setState({ info: info });
    try { console.error("[HH-TOOLKIT] Render error:", error, info); } catch (e) {}
  }
  reset = () => this.setState({ error: null, info: null });
  render() {
    if (!this.state.error) return this.props.children;
    const err = this.state.error;
    const stack = (err && err.stack) ? String(err.stack) : "";
    const compStack = (this.state.info && this.state.info.componentStack) ? String(this.state.info.componentStack) : "";
    return React.createElement("div", {
      style: {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "#1a0808", color: "#ff8a8a", zIndex: 100000,
        padding: 20, overflow: "auto",
        fontFamily: "'Share Tech Mono', monospace", fontSize: 12,
      },
    },
      React.createElement("div", {
        style: { fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#ff5555" },
      }, "⚠ Render error caught"),
      React.createElement("div", { style: { marginBottom: 6 } },
        (err && err.message) || String(err)),
      React.createElement("pre", {
        style: { whiteSpace: "pre-wrap", fontSize: 10, color: "#cc8888", margin: 0 },
      }, stack),
      compStack ? React.createElement("pre", {
        style: { whiteSpace: "pre-wrap", fontSize: 10, color: "#aa6666", marginTop: 8 },
      }, compStack) : null,
      React.createElement("button", {
        onClick: this.reset,
        style: {
          marginTop: 14, padding: "8px 14px", background: "#330",
          color: "#ffcc00", border: "1px solid #aa8800", borderRadius: 4,
          fontFamily: "'Share Tech Mono', monospace", cursor: "pointer",
        },
      }, "↻ DISMISS & RETRY"),
    );
  }
}

// ━━━ UNIT SELECTOR MODAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// UnitSelectorModal — army-builder-style vertical list with a
// battlefield-role dropdown filter and a name search. Used by the shooting,
// assault, deploy, and return-fire panels. Rendered through a portal so it
// escapes the iOS-frame stacking context (see mobile.css `.hh-modal-overlay`).
function UnitSelectorModal({ presets, onSelect, selectedId, onClose, accentColor = "#b8860b", title, isTarget = false, faction }) {
  // Defensive: if the caller passed a non-array (undefined, null, or a single
  // category object), coerce so the .filter / .forEach chains below cannot
  // throw and unmount the tree.
  if (!Array.isArray(presets)) {
    try { console.warn("[HH] UnitSelectorModal: presets is not an array, got", typeof presets); } catch (e) {}
    presets = [];
  }
  // ── Faction filtering: same rules as before so callers don't need to change.
  //   sol_auxilia        → only "SA: *" categories
  //   mechanicum         → only "MECH: *" categories
  //   custodes           → only "CUSTODES: *" categories
  //   specific legion    → generic categories + own legion category,
  //                        then strip faction-mismatched units from generics
  //   legiones_astartes  → all legion categories (exclude SA, MECH, CUSTODES)
  const isSACat             = (cat) => cat && (cat.startsWith("SA: ") || cat === "SOLAR AUXILIA");
  const isMechCat           = (cat) => cat && cat.startsWith("MECH:");
  const isCustodesCat       = (cat) => cat && (cat.startsWith("CUSTODES:") || cat === "CUSTODES");
  const isLegionSpecificCat = (cat) => cat && /^[IVX]+: /.test(cat);

  const factionNumeral = (typeof LEGION_FACTION_BY_ID !== "undefined")
    ? ((LEGION_FACTION_BY_ID[faction] || {}).numeral || null)
    : null;
  const isSpecificLegion = faction
    && faction !== "legiones_astartes"
    && faction !== "sol_auxilia"
    && faction !== "mechanicum"
    && faction !== "custodes";

  const visiblePresets = useMemo(() => {
    if (!faction) return presets;
    if (faction === "sol_auxilia") return presets.filter(c => isSACat(c.category));
    if (faction === "mechanicum")  return presets.filter(c => isMechCat(c.category));
    if (faction === "custodes")    return presets.filter(c => isCustodesCat(c.category));

    let categories = presets.filter(c => {
      if (isSACat(c.category) || isMechCat(c.category) || isCustodesCat(c.category)) return false;
      if (isLegionSpecificCat(c.category)) {
        if (isSpecificLegion && factionNumeral && factionNumeral !== "-") {
          return c.category.startsWith(factionNumeral + ": ");
        }
        return true;
      }
      return true;
    });

    if (isSpecificLegion && typeof UNIT_SPECIFIC_FACTION !== "undefined") {
      categories = categories
        .map(c => ({
          ...c,
          units: c.units.filter(u => {
            const unitFaction = UNIT_SPECIFIC_FACTION[u.id];
            return !unitFaction || unitFaction === faction;
          }),
        }))
        .filter(c => c.units.length > 0);
    }
    return categories;
  }, [presets, faction]);

  // Flat list of all visible units, de-duplicated by id (a unit can appear in
  // more than one legacy category — keep only the first occurrence).
  const allUnits = useMemo(() => {
    const seen = new Set();
    const out  = [];
    visiblePresets.forEach(c => {
      if (!c || !Array.isArray(c.units)) return;          // skip malformed category
      c.units.forEach(u => {
        if (!u) return;                                    // skip null entry
        const key = u.id || u.name;
        if (key == null) return;                           // skip entry with no id/name
        if (!seen.has(key)) { seen.add(key); out.push(u); }
      });
    });
    return out;
  }, [visiblePresets]);

  // Roles that have at least one unit available — drives the dropdown options.
  const availableRoles = useMemo(() => {
    if (typeof BATTLEFIELD_ROLES === "undefined") return [];
    const present = new Set();
    allUnits.forEach(u => {
      const r = (typeof UNIT_BATTLEFIELD_ROLE !== "undefined") ? UNIT_BATTLEFIELD_ROLE[u.id] : null;
      if (r && BATTLEFIELD_ROLES[r]) present.add(r);
    });
    // Preserve BATTLEFIELD_ROLES key order (warlord → fast_attack)
    return Object.keys(BATTLEFIELD_ROLES).filter(k => present.has(k));
  }, [allUnits]);

  const [roleFilter, setRoleFilter] = useState("");   // "" = All Roles
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = React.useDeferredValue
    ? React.useDeferredValue(searchTerm)
    : searchTerm;

  // ── Photo-ID: take/upload a photo of the miniature on the table and let the
  //    vision AI pick the matching unit, then select it inline. Available on
  //    every phase that uses this modal (shooting, assault, deploy, return-fire).
  const [photoOpen, setPhotoOpen]       = useState(false);
  const [photoBusy, setPhotoBusy]       = useState(false);
  const [photoError, setPhotoError]     = useState("");
  const [photoNote, setPhotoNote]       = useState("");
  const [photoGuesses, setPhotoGuesses] = useState([]); // [{unitId,name,score}]
  const [cameraOn, setCameraOn]         = useState(false);
  const [camError, setCamError]         = useState("");
  const photoFileInputRef   = React.useRef(null);        // library / file picker
  const photoVideoRef       = React.useRef(null);        // live camera <video>
  const photoStreamRef      = React.useRef(null);        // active MediaStream

  // Resolve a guessed unitId back to a unit object this modal can actually
  // select. Prefer the faction-filtered list so we never select a hidden unit.
  const resolvePhotoUnit = (unitId) =>
    allUnits.find((u) => (u.id || u.name) === unitId) || null;

  // Run the captured/uploaded image through the identifier and select a match.
  const identifyFromDataUrl = (dataUrl) => {
    if (!dataUrl) return;
    if (typeof HHQuickIdentifyUnit === "undefined") {
      setPhotoError("Photo ID engine not loaded.");
      return;
    }
    setPhotoBusy(true);
    setPhotoError("");
    setPhotoNote("");
    setPhotoGuesses([]);
    Promise.resolve(HHQuickIdentifyUnit(dataUrl, allUnits))
      .then((res) => {
        res = res || {};
        if (res.needKey || res.aiConfigured === false) {
          setPhotoError("Photo ID needs setup — open the “📷 Photo ID” tab and add your AI key (or train the on-device model) first.");
          return;
        }
        if (res.error) { setPhotoError(res.error); return; }
        const guesses = (res.guesses || []).filter((g) => resolvePhotoUnit(g.unitId));
        if (!guesses.length) {
          setPhotoError(res.aiName
            ? `AI saw “${res.aiName}” but no matching unit is available in this list.`
            : "No matching unit recognized. Try a clearer photo.");
          return;
        }
        // Auto-select the top match; show the rest as alternatives to tap.
        const top = resolvePhotoUnit(guesses[0].unitId);
        setPhotoGuesses(guesses);
        setPhotoNote(
          (res.aiName ? `Identified: ${res.aiName}` : "Identified unit") +
          (res.count != null ? ` · ~${res.count} model${res.count === 1 ? "" : "s"}` : "") +
          ` → selecting “${top.name}”.`
        );
        onSelect(top);
      })
      .catch((err) => setPhotoError("Identify failed: " + String((err && err.message) || err)))
      .finally(() => setPhotoBusy(false));
  };

  const handlePhotoFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => setPhotoError("Could not read that image.");
    reader.onload = (e) => identifyFromDataUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  // ── Live camera (getUserMedia) — the file-input `capture` attribute is
  //    ignored on desktop and unreliable in the iOS wrapper, so use a real feed.
  const stopPhotoCamera = () => {
    const s = photoStreamRef.current;
    if (s) { try { s.getTracks().forEach((t) => t.stop()); } catch (e) {} }
    photoStreamRef.current = null;
    setCameraOn(false);
  };

  const startPhotoCamera = async () => {
    setCamError("");
    setPhotoError("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCamError("Live camera not available here — use Upload Photo instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }, audio: false,
      });
      photoStreamRef.current = stream;
      setCameraOn(true);
      setTimeout(() => {
        if (photoVideoRef.current) {
          photoVideoRef.current.srcObject = stream;
          photoVideoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err) {
      setCamError("Camera access denied or unavailable — use Upload Photo instead.");
    }
  };

  const capturePhotoFrame = () => {
    const v = photoVideoRef.current;
    if (!v) return;
    const w = v.videoWidth || 640, ht = v.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = ht;
    canvas.getContext("2d").drawImage(v, 0, 0, w, ht);
    let dataUrl = "";
    try { dataUrl = canvas.toDataURL("image/jpeg", 0.9); } catch (e) {}
    stopPhotoCamera();
    if (dataUrl) identifyFromDataUrl(dataUrl);
  };

  // Stop the camera when the panel closes or the modal unmounts.
  useEffect(() => { if (!photoOpen) stopPhotoCamera(); }, [photoOpen]);
  useEffect(() => () => stopPhotoCamera(), []);

  // Reset roleFilter if the active selection becomes empty after a faction change
  useEffect(() => {
    if (roleFilter && !availableRoles.includes(roleFilter)) setRoleFilter("");
  }, [availableRoles]);

  const filteredUnits = useMemo(() => {
    let list = allUnits;
    if (roleFilter) {
      list = list.filter(u => {
        const r = (typeof UNIT_BATTLEFIELD_ROLE !== "undefined") ? UNIT_BATTLEFIELD_ROLE[u.id] : null;
        return r === roleFilter;
      });
    }
    if (deferredSearchTerm) {
      const t = deferredSearchTerm.toLowerCase();
      list = list.filter(u => typeof u.name === "string" && u.name.toLowerCase().includes(t));
    }
    return list;
  }, [allUnits, roleFilter, deferredSearchTerm]);

  const accentRgb = accentColor === "#b8860b" ? "184,134,11" : "42,111,180";

  // Portal to document.body so the overlay escapes #root's stacking context.
  // The mobile.css iOS-frame preview adds `position:relative; z-index:1; overflow:auto`
  // to `#root > *`, which would otherwise trap a position:fixed modal beneath
  // the bezel's notch ::after (z-index 100) and clip its layout, breaking
  // both click targets and image placement.
  return ReactDOM.createPortal(
    React.createElement("div", {
      className: "hh-modal-overlay",
      style: {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        // 9600 keeps the selector above the full-size Tactical Map overlay
        // (zIndex 9000) so units can be armed without leaving the map.
        background: "rgba(0,0,0,0.5)", zIndex: 9600,
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.15s ease", padding: 16,
      },
      onClick: onClose,
    },
      React.createElement("div", {
        style: {
          background: "#faf8f4", borderRadius: 12, width: "100%", maxWidth: 600,
          maxHeight: "85vh", display: "flex", flexDirection: "column",
          border: `2px solid ${accentColor}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)", overflow: "hidden",
        },
        onClick: e => e.stopPropagation(),
      },
        // ── Header ─────────────────────────────────────────────────────────
        React.createElement("div", {
          style: {
            padding: "14px 18px", borderBottom: "1px solid #d0c4aa",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: `linear-gradient(180deg, rgba(${accentRgb},0.06) 0%, transparent 100%)`,
          },
        },
          React.createElement("div", {
            style: {
              fontFamily: "'Share Tech Mono', monospace", fontWeight: 700,
              fontSize: 13, color: accentColor, letterSpacing: 2, textTransform: "uppercase",
            },
          }, title),
          React.createElement("button", {
            onClick: onClose,
            style: {
              background: "none", border: "none", fontSize: 18, color: "#8a7e6e",
              cursor: "pointer", padding: "2px 6px", lineHeight: 1,
            },
          }, "✕"),
        ),
        // ── Filter row: role dropdown + search ────────────────────────────
        React.createElement("div", {
          className: "hh-modal-filter",
          style: {
            padding: "10px 18px", borderBottom: "1px solid #e0dbd0", background: "#fffdf9",
            display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
          },
        },
          React.createElement("label", {
            style: {
              fontSize: 11, color: "#8a7e6e", letterSpacing: 1,
              fontFamily: "'Share Tech Mono', serif",
            },
          }, "ROLE"),
          React.createElement("select", {
            value: roleFilter,
            onChange: e => setRoleFilter(e.target.value),
            style: {
              padding: "7px 10px", borderRadius: 4, border: "1px solid #d0c4aa",
              fontSize: 12, fontFamily: "'Share Tech Mono', serif",
              background: "#fff", color: "#2a2418",
              width: 180, flexShrink: 0,           // lock width; flex won't shrink past it
              whiteSpace: "nowrap",                // belt-and-braces: no line wrap
              cursor: "pointer",
            },
          },
            // Plain-text options only — native <select> renders emoji glyphs at
            // a taller metric than monospace text on macOS/Windows, which can
            // cause the displayed option to wrap onto two lines. The role icon
            // shows on each unit row's role badge instead.
            React.createElement("option", { value: "" }, "All Roles"),
            availableRoles.map(r => {
              const role = (typeof BATTLEFIELD_ROLES !== "undefined") ? BATTLEFIELD_ROLES[r] : null;
              return React.createElement("option", { key: r, value: r }, role?.label || r);
            }),
          ),
          React.createElement("input", {
            type: "text", placeholder: "Search units…", value: searchTerm,
            onChange: e => setSearchTerm(e.target.value),
            className: "hh-parchment-input",
            style: {
              flex: 1, minWidth: 140, padding: "7px 10px",
              fontSize: 12, fontFamily: "'Share Tech Mono', monospace",
              borderRadius: 4, border: "1px solid #d0c4aa", background: "#fff",
              color: "#2a2418",
            },
          }),
          // ── Photo-ID toggle — identify the unit from a tabletop photo ──────
          React.createElement("button", {
            type: "button",
            onClick: () => { setPhotoOpen(v => !v); setPhotoError(""); },
            title: "Identify the unit from a photo",
            style: {
              flexShrink: 0, padding: "7px 11px", borderRadius: 4,
              border: `1px solid ${photoOpen ? accentColor : "#d0c4aa"}`,
              background: photoOpen ? `rgba(${accentRgb},0.10)` : "#fff",
              color: photoOpen ? accentColor : "#6a5e4e",
              fontSize: 12, fontFamily: "'Share Tech Mono', monospace",
              letterSpacing: 1, cursor: "pointer", whiteSpace: "nowrap",
            },
          }, "📷 PHOTO"),
        ),
        // ── Photo-ID panel (collapsible) ──────────────────────────────────
        photoOpen && React.createElement("div", {
          style: {
            padding: "12px 18px", borderBottom: "1px solid #e0dbd0",
            background: "#fffdf9",
            display: "flex", flexDirection: "column", gap: 8,
          },
        },
          React.createElement("div", {
            style: {
              fontSize: 11, color: "#8a7e6e", letterSpacing: 0.5,
              fontFamily: "'Share Tech Mono', serif",
            },
          }, "Point your camera at the miniature, or upload a photo, and the AI will pick the matching unit."),
          // Hidden file input — library / file picker fallback.
          React.createElement("input", {
            ref: photoFileInputRef, type: "file", accept: "image/*",
            style: { display: "none" },
            onChange: e => { handlePhotoFile(e.target.files && e.target.files[0]); e.target.value = ""; },
          }),
          // Live camera preview (only while the stream is active).
          cameraOn && React.createElement("div", {
            style: {
              position: "relative", width: "100%", maxWidth: 360, alignSelf: "center",
              borderRadius: 6, overflow: "hidden", border: `1.5px solid ${accentColor}`,
              background: "#000",
            },
          },
            React.createElement("video", {
              ref: photoVideoRef, autoPlay: true, playsInline: true, muted: true,
              style: { width: "100%", display: "block" },
            }),
          ),
          React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
            cameraOn
              ? React.createElement("button", {
                  type: "button", disabled: photoBusy,
                  onClick: capturePhotoFrame,
                  style: {
                    padding: "8px 14px", borderRadius: 4,
                    border: `1.5px solid ${accentColor}`,
                    background: `rgba(${accentRgb},0.10)`, color: accentColor,
                    fontSize: 12, fontFamily: "'Share Tech Mono', monospace",
                    letterSpacing: 1, cursor: photoBusy ? "default" : "pointer",
                    opacity: photoBusy ? 0.5 : 1,
                  },
                }, "📸 Capture")
              : React.createElement("button", {
                  type: "button", disabled: photoBusy,
                  onClick: startPhotoCamera,
                  style: {
                    padding: "8px 14px", borderRadius: 4,
                    border: `1.5px solid ${accentColor}`,
                    background: `rgba(${accentRgb},0.10)`, color: accentColor,
                    fontSize: 12, fontFamily: "'Share Tech Mono', monospace",
                    letterSpacing: 1, cursor: photoBusy ? "default" : "pointer",
                    opacity: photoBusy ? 0.5 : 1,
                  },
                }, "📷 Take Photo"),
            cameraOn && React.createElement("button", {
              type: "button",
              onClick: stopPhotoCamera,
              style: {
                padding: "8px 14px", borderRadius: 4,
                border: "1.5px solid #d0c4aa", background: "#fff", color: "#6a5e4e",
                fontSize: 12, fontFamily: "'Share Tech Mono', monospace",
                letterSpacing: 1, cursor: "pointer",
              },
            }, "✕ Cancel"),
            !cameraOn && React.createElement("button", {
              type: "button", disabled: photoBusy,
              onClick: () => photoFileInputRef.current && photoFileInputRef.current.click(),
              style: {
                padding: "8px 14px", borderRadius: 4,
                border: "1.5px solid #d0c4aa", background: "#fff", color: "#6a5e4e",
                fontSize: 12, fontFamily: "'Share Tech Mono', monospace",
                letterSpacing: 1, cursor: photoBusy ? "default" : "pointer",
                opacity: photoBusy ? 0.5 : 1,
              },
            }, "🖼 Upload Photo"),
            photoBusy && React.createElement("span", {
              style: {
                alignSelf: "center", fontSize: 12, color: accentColor,
                fontFamily: "'Share Tech Mono', monospace", letterSpacing: 1,
              },
            }, "⏳ Identifying…"),
          ),
          camError && React.createElement("div", {
            style: {
              fontSize: 12, color: "#b03030",
              fontFamily: "'Share Tech Mono', serif", lineHeight: 1.4,
            },
          }, "⚠ " + camError),
          photoError && React.createElement("div", {
            style: {
              fontSize: 12, color: "#b03030",
              fontFamily: "'Share Tech Mono', serif", lineHeight: 1.4,
            },
          }, "⚠ " + photoError),
          photoNote && React.createElement("div", {
            style: {
              fontSize: 12, color: "#3a6a2a",
              fontFamily: "'Share Tech Mono', serif", lineHeight: 1.4,
            },
          }, "✓ " + photoNote),
          photoGuesses.length > 1 && React.createElement("div", {
            style: { display: "flex", flexDirection: "column", gap: 5 },
          },
            React.createElement("div", {
              style: {
                fontSize: 10, color: "#8a7e6e", letterSpacing: 1,
                fontFamily: "'Share Tech Mono', serif", textTransform: "uppercase",
              },
            }, "Other matches — tap to use instead"),
            React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
              photoGuesses.slice(1, 5).map((g) => {
                const gu = resolvePhotoUnit(g.unitId);
                if (!gu) return null;
                return React.createElement("button", {
                  key: g.unitId, type: "button",
                  onClick: () => { onSelect(gu); setPhotoNote(`Selected “${gu.name}”.`); },
                  style: {
                    padding: "5px 10px", borderRadius: 12,
                    border: "1px solid #d0c4aa", background: "#fff", color: "#2a2418",
                    fontSize: 11, fontFamily: "'Share Tech Mono', serif",
                    cursor: "pointer",
                  },
                }, gu.name);
              }),
            ),
          ),
        ),
        // ── Unit list (vertical, army-builder row style) ──────────────────
        React.createElement("div", {
          style: { padding: 14, overflowY: "auto", flex: 1 },
        },
          filteredUnits.length === 0 && React.createElement("div", {
            style: {
              padding: 24, textAlign: "center", color: "#b0a898",
              fontSize: 13, fontFamily: "'Share Tech Mono', serif",
            },
          }, "No units match the current filter."),
          filteredUnits.map(u => {
            const uid        = u.id || u.name;
            const isSelected = selectedId === uid;
            const roleId     = (typeof UNIT_BATTLEFIELD_ROLE !== "undefined") ? UNIT_BATTLEFIELD_ROLE[u.id] : null;
            const role       = (roleId && typeof BATTLEFIELD_ROLES !== "undefined") ? BATTLEFIELD_ROLES[roleId] : null;
            const pd         = (typeof POINTS_DATA !== "undefined") ? POINTS_DATA[u.id] : null;
            const artSrc     = (typeof getUnitArtwork === "function") ? getUnitArtwork(u.id, faction) : null;
            const iconType   = getUnitIconType(u.name);
            const legacyRules = u.legacyRules || ((typeof UNIT_LEGACY_RULES !== "undefined") ? UNIT_LEGACY_RULES[u.id] : null) || [];
            const rulesLine = legacyRules.slice(0, 4).join(" · ");
            const statsLine  = isTarget
              ? `T${u.t} ${u.w}W Sv${u.sv}+${u.inv !== "-" ? ` Inv${u.inv}+` : ""}${u.fnp !== "-" ? ` FNP${u.fnp}+` : ""} Ld${u.ld || "?"}`
              : `${u.models} model${u.models > 1 ? "s" : ""} · BS${u.bs} · T${u.t} · Sv${u.sv}+`;
            return React.createElement("button", {
              key: uid,
              onClick: () => onSelect(u),
              style: {
                display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                width: "100%", padding: "8px 10px", marginBottom: 4,
                borderRadius: 6, cursor: "pointer",
                background: isSelected ? `rgba(${accentRgb},0.10)` : "#fff",
                border: `1.5px solid ${isSelected ? accentColor : "#d0c4aa"}`,
                boxShadow: isSelected ? `0 2px 8px rgba(${accentRgb},0.15)` : "none",
                transition: "background 0.12s ease, border-color 0.12s ease",
                contentVisibility: "auto",
                containIntrinsicSize: "138px",
              },
              onMouseEnter: e => {
                if (!isSelected) e.currentTarget.style.background = `rgba(${accentRgb},0.05)`;
              },
              onMouseLeave: e => {
                if (!isSelected) e.currentTarget.style.background = "#fff";
              },
            },
              // ── Artwork plate (120×120) with UnitIcon fallback ───────────
              React.createElement("div", {
                style: {
                  position: "relative", width: 120, height: 120,
                  background: "#1e1a14", borderRadius: 5, flexShrink: 0,
                  border: `1px solid ${isSelected ? accentColor : "rgba(184,134,11,0.25)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                },
              },
                React.createElement(UnitIcon, {
                  type: iconType, size: 56,
                  color: isSelected ? accentColor : "#6a5040",
                }),
                artSrc ? React.createElement("img", {
                  src: artSrc, alt: "",
                  loading: "lazy",
                  decoding: "async",
                  style: {
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    objectFit: "cover", objectPosition: "top center",
                  },
                  onError: function(e) { e.currentTarget.style.display = "none"; },
                }) : null,
              ),
              // ── Centre column: role badge + name + stats ────────────────
              React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                role ? React.createElement("div", {
                  style: {
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "2px 6px", borderRadius: 3, marginBottom: 4,
                    background: "rgba(0,0,0,0.03)",
                    border: `1px solid ${role.color}`,
                    fontSize: 10, fontFamily: "'Share Tech Mono', serif",
                    color: role.color, letterSpacing: 0.5, fontWeight: 700,
                    textTransform: "uppercase",
                  },
                }, role.icon, " ", role.label) : null,
                React.createElement("div", {
                  style: {
                    fontFamily: "'Share Tech Mono', serif", fontWeight: 600,
                    fontSize: 15, color: isSelected ? "#2a2418" : "#1e1a12",
                    lineHeight: 1.2, marginBottom: 3,
                    overflow: "hidden", textOverflow: "ellipsis",
                  },
                }, u.name),
                React.createElement("div", {
                  style: {
                    fontSize: 12, color: "#6a5e4e",
                    fontFamily: "'Share Tech Mono', serif", letterSpacing: 0.3,
                  },
                }, statsLine),
                rulesLine ? React.createElement("div", {
                  style: {
                    fontSize: 11, color: "#7a6a52", marginTop: 3,
                    fontFamily: "'Share Tech Mono', serif", lineHeight: 1.25,
                    whiteSpace: "normal",
                  },
                }, rulesLine) : null,
              ),
              // ── Right column: points (if known) ─────────────────────────
              pd?.base ? React.createElement("div", {
                style: {
                  fontFamily: "'Share Tech Mono', serif", fontWeight: 700,
                  fontSize: 14, color: accentColor, flexShrink: 0,
                  textAlign: "right", minWidth: 50,
                },
              },
                pd.base,
                React.createElement("span", {
                  style: { fontSize: 10, color: "#8a7e6e", marginLeft: 2 },
                }, "pts"),
              ) : null,
            );
          }),
        ),
      ),
    ),
    document.body,
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

// ━━━ DICE ROLL LOG ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Renders a separate, numeric breakdown of every dice group in a resolver
// result.  The DieIcon row above is the visual; this is the *audit trail* —
// raw values like `[3, 5*, 1, 6, 4, 2]` (a `*` marks a re-roll), so the
// player can verify what the resolver did.  Pass any `rolls` object that
// matches `{ hit: [{value,success,reroll?}], wound: [...], save: [...],
// fnpRolls: [...] }`.  Categories with no rolls are skipped.
function DiceRollLog({ rolls, title }) {
  if (!rolls) return null;
  const groups = [
    { key: "hit",      label: "To Hit",       data: rolls.hit },
    { key: "wound",    label: "To Wound",     data: rolls.wound },
    { key: "save",     label: "Saves",        data: rolls.save },
    { key: "fnpRolls", label: "Feel No Pain", data: rolls.fnpRolls },
    // Assault/melee resolvers store these under different keys
    { key: "saves",    label: "Saves",        data: rolls.saves },
    { key: "fnp",      label: "Feel No Pain", data: rolls.fnp },
  ].filter(g => Array.isArray(g.data) && g.data.length > 0);
  if (groups.length === 0) return null;

  const formatGroup = (data) => {
    // Build "[3, 5*, 1, 6]" with green for success and red for fail.
    // Asterisk marks a re-roll so the player can audit Twin-linked / Shred.
    return data.map((r, i) => {
      const v = (typeof r === "object" && r !== null) ? r.value : r;
      const success = (typeof r === "object" && r !== null) ? r.success : null;
      const reroll  = (typeof r === "object" && r !== null) ? r.reroll  : false;
      const color   = success === true ? "#2e7d32" : success === false ? "#c74040" : "#4a4030";
      return React.createElement("span", {
        key: i,
        style: {
          color, fontWeight: reroll ? 700 : 500,
          marginRight: 6, fontFamily: "'Share Tech Mono', monospace",
        },
        title: reroll ? `${v} (re-roll)` : String(v),
      }, v, reroll ? "*" : "");
    });
  };

  return React.createElement("div", {
    style: {
      marginTop: 12, padding: "10px 14px",
      background: "#f9f6f0", border: "1px solid #d0c4aa", borderRadius: 6,
    },
  },
    React.createElement("div", {
      style: {
        fontSize: 13, color: "#5a4e3e", marginBottom: 8,
        fontFamily: "'Share Tech Mono', serif",
        letterSpacing: 1, textTransform: "uppercase",
      },
    }, "🎲 ", title || "Dice Rolls"),
    groups.map(g => {
      const successCount = g.data.filter(r => (typeof r === "object" && r !== null) ? r.success : false).length;
      return React.createElement("div", {
        key: g.key,
        style: {
          display: "flex", alignItems: "baseline", gap: 8,
          marginBottom: 4, fontSize: 12, flexWrap: "wrap",
        },
      },
        React.createElement("span", {
          style: {
            minWidth: 90, color: "#6a5e4e",
            fontFamily: "'Share Tech Mono', serif",
            fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5,
          },
        }, g.label),
        React.createElement("span", { style: { flex: 1, lineHeight: 1.6 } }, formatGroup(g.data)),
        React.createElement("span", {
          style: { color: "#8a7e6e", fontSize: 11, fontFamily: "'Share Tech Mono', serif" },
        }, `${successCount}/${g.data.length} ✓`),
      );
    }),
    React.createElement("div", {
      style: { fontSize: 10, color: "#9a8e7e", marginTop: 4, fontStyle: "italic" },
    }, "* = re-rolled die (Twin-linked, Shred, Poison, etc.)"),
  );
}

// ━━━ STAT EXPLANATIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Looked up by the input's `label` string (case-insensitive). `sub` renders
// as a small grey caption right under the label; `desc` is the full text shown
// in the native `title` tooltip when the player hovers the label.
// Add an entry here and every NumberInput/SelectInput across the app inherits it.
var STAT_EXPLANATIONS = {
  // ── Attacker / shooter ─────────────────────────────────────────────────
  "models":         { sub: "Models firing this volley",
                      desc: "Number of models in the firing unit. Each rolls Shots/Model to-hit dice." },
  "shots/model":    { sub: "Shots each model fires",
                      desc: "How many shots every model fires this turn (the weapon's Shots value, modified by Rapid Fire, Salvo, etc.)." },
  "bs":             { sub: "Ballistic Skill — ranged to-hit",
                      desc: "Ballistic Skill. Used for shooting to-hit rolls. Roll equal or over (7 − BS) on a d6 to hit. Higher BS = more accurate." },
  "ws":             { sub: "Weapon Skill — melee to-hit",
                      desc: "Weapon Skill. Used for melee to-hit rolls. Cross-reference attacker WS vs target WS on the to-hit chart." },
  "strength":       { sub: "Strength — vs Toughness to wound",
                      desc: "Attack Strength. Cross-reference with target Toughness on the to-wound chart: S = T wounds on 4+, S ≥ 2·T wounds on 2+, S < ½T cannot wound." },
  "s":              { sub: "Strength — vs Toughness",
                      desc: "Attack Strength. Cross-reference with target Toughness on the to-wound chart." },
  "range strength": { sub: "Ranged Strength — vs Toughness",
                      desc: "Ranged Strength of the firing weapon. Cross-reference with target Toughness on the to-wound chart." },
  "ap":             { sub: "Armour Penetration",
                      desc: "Armour Penetration. If AP ≤ target's armour save, the target gets NO armour save. AP1 ignores all armour saves; AP «−» allows the full save. Invulnerable & cover saves are never affected by AP." },
  "i":              { sub: "Initiative — strike order",
                      desc: "Initiative. The melee strike order — highest I strikes first; ties strike simultaneously. Charging models still strike at their own I (no bonus in HH 3rd Ed)." },
  "a":              { sub: "Attacks per model",
                      desc: "Base close-combat attacks per model. +1 for charging, +1 for two close-combat weapons. Sergeants/characters may have higher A." },
  "d":              { sub: "Damage per failed save",
                      desc: "Damage. Wounds inflicted on the target per unsaved hit." },

  // ── Target ─────────────────────────────────────────────────────────────
  "toughness":      { sub: "Toughness — wound resistance",
                      desc: "Toughness. Cross-referenced with attacker Strength on the to-wound chart. Higher T = harder to wound." },
  "t":              { sub: "Toughness",
                      desc: "Toughness. Cross-referenced with attacker Strength on the to-wound chart." },
  "w":              { sub: "Wounds per model",
                      desc: "Wounds. A model is removed as a casualty when its Wounds reach 0. Multi-wound models suffer Instant Death if Strength ≥ 2·T." },
  "w (wounds)":     { sub: "Wounds per model",
                      desc: "Wounds. A model is removed as a casualty when its Wounds reach 0. Instant Death if attack Strength ≥ 2·T." },
  "armour save":    { sub: "Save vs AP",
                      desc: "Armour Save. Roll equal or over this on a d6 to negate a wound. No save allowed if the weapon's AP ≤ this value. Lower (2+) is better than higher (5+)." },
  "sv":             { sub: "Armour Save",
                      desc: "Armour Save. Roll equal or over this on a d6 to negate a wound, unless the weapon's AP is equal or lower." },
  "invuln save":    { sub: "Invulnerable — ignores AP",
                      desc: "Invulnerable Save. Taken instead of an armour save and never modified by AP. Only one save per wound." },
  "inv":            { sub: "Invuln — ignores AP",
                      desc: "Invulnerable Save. Taken instead of an armour save and never modified by AP." },
  "cover save":     { sub: "Save from terrain",
                      desc: "Cover Save granted by intervening terrain or special rules. Never modified by AP. Only one save per wound." },
  "fnp":            { sub: "Feel No Pain — ignore the wound",
                      desc: "Feel No Pain. After a wound is suffered (and not saved), roll equal or over this on a d6 to ignore it. Disallowed against weapons with sufficient AP, Instant Death, or specific FNP-ignoring rules." },
  "leadership":     { sub: "Leadership — morale tests",
                      desc: "Leadership. Used for Morale, Pinning, Fear and Psychic tests. Roll 2d6 equal or under Ld to pass." },
  "ld":             { sub: "Leadership — morale tests",
                      desc: "Leadership. Used for Morale, Pinning, Fear and Psychic tests. Roll 2d6 equal or under Ld to pass." },
  "unit size":      { sub: "Models in the target unit",
                      desc: "Number of models currently in the target unit. Affects wound allocation, Morale tests and certain weapon effects (Blast hits, etc.)." },

  // ── Vehicles ───────────────────────────────────────────────────────────
  "av front":       { sub: "Front Armour Value",
                      desc: "Front Armour Value of the vehicle. Penetration roll = d6 + Strength vs AV. A roll equal to AV is a Glancing Hit; greater than AV is a Penetrating Hit." },
  "av side":        { sub: "Side Armour Value",
                      desc: "Side Armour Value of the vehicle. Penetration roll = d6 + Strength vs AV." },
  "av rear":        { sub: "Rear Armour Value",
                      desc: "Rear Armour Value of the vehicle. Penetration roll = d6 + Strength vs AV." },
  "hull pts":       { sub: "Hull Points",
                      desc: "Hull Points. Vehicles lose a Hull Point on every Glancing or Penetrating hit; reaching 0 wrecks the vehicle. Penetrating hits may also roll on the damage table." },

  // ── Overwatch / interceptor ────────────────────────────────────────────
  "target bs":      { sub: "Target's BS — for overwatch fire",
                      desc: "Ballistic Skill of the target unit when it fires back (overwatch / interceptor / return fire). Affects their to-hit rolls against you." },

  // ── Assault & charge ───────────────────────────────────────────────────
  "initiative (i)": { sub: "Initiative — strike order",
                      desc: "Initiative. Determines the order of strikes in melee — highest I strikes first; ties strike simultaneously." },
  "movement (m)":   { sub: "Move distance in inches",
                      desc: "Movement value in inches. Infantry typically 6\", Cavalry/Bikes 8–12\", Terminators 4\". Affects charge range and consolidation." },
  "target distance (″)": { sub: "Distance to target (inches)",
                      desc: "Straight-line distance from the closest charging model to the closest target model, in inches. Charge succeeds if 2d6 ≥ this distance." },
  "atk support models":  { sub: "Supporting attackers (rear ranks)",
                      desc: "Attacker models in supporting (rear) ranks that contribute attacks but aren't in base contact. In HH 3rd Ed, supporting models still strike at reduced effect per rules." },
  "def support models":  { sub: "Supporting defenders (rear ranks)",
                      desc: "Defender models in supporting (rear) ranks that contribute attacks but aren't in base contact." },
};

// Look up a help entry by an input's label (case-insensitive). Returns null
// when no entry exists, so the caller renders the label exactly as before.
function getStatHelp(label) {
  if (!label) return null;
  return STAT_EXPLANATIONS[String(label).toLowerCase()] || null;
}

// Shared label+subtitle renderer used by both NumberInput and SelectInput so
// they stay visually identical (and look right in the parchment modal).
function renderStatLabel(label) {
  var help = getStatHelp(label);
  return React.createElement(React.Fragment, null,
    React.createElement("label", {
      title: help ? help.desc : null,
      style: {
        fontSize: 13, color: "#6a5e4e", textTransform: "uppercase",
        letterSpacing: 1, fontFamily: "'Share Tech Mono', serif",
        cursor: help ? "help" : "default",
        display: "inline-flex", alignItems: "center", gap: 4,
      },
    },
      label,
      help && React.createElement("span", {
        "aria-hidden": "true",
        style: { fontSize: 10, opacity: 0.55, color: "#8b6508" },
      }, "ⓘ"),
    ),
    help && React.createElement("div", {
      style: {
        fontSize: 10, lineHeight: 1.25, color: "#8a7e6e",
        fontFamily: "'Share Tech Mono', serif", letterSpacing: 0.2,
        marginTop: -1, marginBottom: 1,
      },
    }, help.sub),
  );
}

function NumberInput({ label, value, onChange, min = 0, max = 20, step = 1 }) {
  return (
    React.createElement("div", {"style": { display: "flex", flexDirection: "column", gap: 4 }}, renderStatLabel(label), React.createElement("div", {"style": { display: "flex", alignItems: "center", gap: 4 }}, React.createElement("button", {"onClick": () => onChange(Math.max(min, value - step)), "style": stepBtnStyle}, "−"), React.createElement("input", {"type": "number", "value": value, "onChange": e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min))), "style": { width: 48, textAlign: "center", background: "#f0ebe2", border: "1px solid #c0b498", borderRadius: 4, color: "#2a2418", padding: "6px 4px", fontSize: 17, fontFamily: "'Share Tech Mono', serif" }}), React.createElement("button", {"onClick": () => onChange(Math.min(max, value + step)), "style": stepBtnStyle}, "+")))
  );
}

var stepBtnStyle = {
  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
  background: "#050705", border: "1px solid #d0c4aa", borderRadius: 4, color: "#8b6508",
  cursor: "pointer", fontSize: 17, fontFamily: "'Share Tech Mono', serif"
};

// Parchment surround for a grid of NumberInput/SelectInput stats — matches the
// preview mockup (cream fill, muted brown border, generous padding). Spread it
// into a grid's `style` before its grid-specific fields:
//   style: { ...STAT_GRID_STYLE, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }
var STAT_GRID_STYLE = {
  background:   "#faf8f4",
  border:       "1px solid #d0c4aa",
  borderRadius: 8,
  padding:      "14px 16px",
  marginBottom: 12,
};

function SelectInput({ label, value, onChange, options }) {
  return (
    React.createElement("div", {"style": { display: "flex", flexDirection: "column", gap: 4 }}, renderStatLabel(label), React.createElement("select", {"value": value, "onChange": e => onChange(e.target.value), "style": { background: "#f0ebe2", border: "1px solid #c0b498", borderRadius: 4, color: "#2a2418", padding: "6px 8px", fontSize: 13, fontFamily: "'Share Tech Mono', serif" }}, options.map(o => React.createElement("option", {"key": o.value, "value": o.value}, o.label))))
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
