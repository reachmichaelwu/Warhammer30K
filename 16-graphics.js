// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 16-graphics.js — Visual effects layer for HH Toolkit
//
// Loads after all other scripts and safely overrides / extends:
//   • DieIcon          — animated roll-to-settle dice (replaces 14-ui-components)
//   • GlowUnitIcon     — hover-glow wrapper around the existing UnitIcon SVGs
//   • CombatFlash      — brief full-screen tint overlay on big combat results
//   • WoundBadge       — skull × count badge with optional pulse
//   • SaveBadge        — shield × count badge with optional pulse
//   • SplashText       — floating "HIT / MISS / SAVED" pop-up label
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


// ─── ANIMATED DIE ICON ───────────────────────────────────────────────────────
// Replaces the static DieIcon in 14-ui-components.js.
// Each die rolls through random faces (with eased slow-down) then snaps to its
// real value with a bouncy settle.  A small random stagger (0–120 ms) means
// dice in a row don't all move in perfect lock-step.

DieIcon = function AnimatedDieIcon({ value, success, reroll, small }) {
  const sz    = small ? 22 : 28;
  const FACES = { 1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅" };

  // Random stagger so dice within a roll group feel organic
  const stagger = React.useRef(Math.floor(Math.random() * 120));

  // `display` is initialised to `value` so the first paint already matches
  // the real roll — preventing a brief frame of the wrong face when the dice
  // first mount.  The roll animation below then drives it through a few
  // random faces before snapping back to `value`.
  const [display, setDisplay] = React.useState(value);
  const [phase,   setPhase  ] = React.useState("pre"); // pre | rolling | settle | done

  // Re-animate whenever `value` changes (e.g. user clicks RESOLVE again).
  // Previously the effect had `[]` deps, so a re-render with a new roll left
  // the dice frozen on the OLD value — that's the cause of "dice graphics
  // don't match the results."  Now we tear down any in-flight timer and
  // re-roll from scratch every time the underlying value changes.
  React.useEffect(() => {
    let step  = 0;
    const steps = 7 + Math.floor(Math.random() * 4); // 7–10 random ticks
    let timer;
    let settleTimer;

    const tick = () => {
      step++;
      if (step < steps) {
        setDisplay(Math.ceil(Math.random() * 6));
        setPhase("rolling");
        // Ease out: each step a bit longer than the last
        timer = setTimeout(tick, 38 + step * 13);
      } else {
        setDisplay(value);                                // ← snap to real value
        setPhase("settle");
        settleTimer = setTimeout(() => setPhase("done"), 420);
      }
    };

    timer = setTimeout(tick, stagger.current);
    return () => {
      clearTimeout(timer);
      clearTimeout(settleTimer);
      // Safety: if the component unmounts mid-roll, ensure no future tick
      // leaves a stale face on screen by syncing display to current value.
      setDisplay(value);
    };
  }, [value]);

  const rolling  = phase === "rolling";
  const settling = phase === "settle";

  // Colour: amber while rolling → green (hit) or red (miss) once settled
  const bg     = rolling ? "rgba(184,134,11,0.12)"
               : success ? "rgba(46,125,50,0.15)"
               :            "rgba(200,50,50,0.10)";
  const border = rolling ? "#b8860b" : success ? "#2e7d32" : "#c74040";

  return React.createElement("span", {
    className: rolling ? "die-rolling" : settling ? "die-settle" : "",
    style: {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: sz, height: sz, fontSize: sz - 6,
      borderRadius: 4, margin: 1, position: "relative",
      background: bg,
      border: `1px solid ${border}`,
      color: border,
      opacity: reroll ? 0.65 : 1,
      transition: "background 0.12s ease, border-color 0.12s ease, color 0.12s ease"
    },
    title: `${value}${reroll ? " (re-roll)" : ""}`
  },
  FACES[display] || "⚀",
  reroll ? React.createElement("span", {
    style: { position: "absolute", top: -3, right: -3, fontSize: 8, color: "#b8860b" }
  }, "↻") : null);
};


// ─── GLOW UNIT ICON ──────────────────────────────────────────────────────────
// Optional enhanced wrapper around the existing UnitIcon SVGs.
// Adds a hover glow ring and optional faction-colour accent.
//
// Usage:
//   React.createElement(GlowUnitIcon, { type: "terminator", size: 36,
//                                       color: "#b8860b", factionColor: "#5577ff" })

function GlowUnitIcon({ type, size = 36, color = "#8b6508", factionColor = null }) {
  const [hovered, setHovered] = React.useState(false);
  const ring = factionColor || color;

  return React.createElement("span", {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      borderRadius: "50%",
      padding: 3,
      border: `1.5px solid ${hovered ? ring : "transparent"}`,
      boxShadow: hovered
        ? `0 0 10px ${ring}88, 0 0 22px ${ring}33`
        : "none",
      transition: "border-color 0.18s ease, box-shadow 0.18s ease",
      cursor: "default"
    }
  }, React.createElement(UnitIcon, { type, size, color: hovered ? ring : color }));
}


// ─── COMBAT FLASH OVERLAY ────────────────────────────────────────────────────
// Full-screen tinted flash to punctuate big combat moments.
// Trigger by toggling the `trigger` prop (false → true).
//
// Usage:
//   const [flash, setFlash] = useState(false);
//   // call setFlash(true) then setFlash(false) in quick succession, or just
//   // pass a new unique key each time you want a flash.
//   React.createElement(CombatFlash, { trigger: flash, type: "wound" })
//
// type: "wound" (red) | "save" (blue) | "hit" (gold)

function CombatFlash({ trigger, type = "hit" }) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!trigger) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 450);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!visible) return null;

  const tints = {
    wound: "rgba(170, 25, 25, 0.20)",
    save:  "rgba(25,  70, 170, 0.18)",
    hit:   "rgba(184, 134, 11, 0.18)"
  };

  return React.createElement("div", {
    style: {
      position: "fixed", inset: 0, zIndex: 99998,
      background: tints[type] || tints.hit,
      pointerEvents: "none",
      animation: "combatFlashFade 0.45s ease both"
    }
  });
}


// ─── WOUND BADGE ─────────────────────────────────────────────────────────────
// Compact skull × count badge.  Pass animate=true for the infinite red pulse.
//
// Usage:
//   React.createElement(WoundBadge, { count: 3, animate: true })

function WoundBadge({ count, animate = false }) {
  if (!count || count <= 0) return null;
  return React.createElement("span", {
    className: animate ? "wound-glow" : "",
    style: {
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 8px", borderRadius: 3,
      background: "rgba(180,30,30,0.15)",
      border: "1px solid #c74040",
      color: "#e05050",
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: 12, fontWeight: 700, letterSpacing: 1
    }
  }, `☠ ×${count}`);
}


// ─── SAVE BADGE ──────────────────────────────────────────────────────────────
// Compact shield × count badge.  Pass animate=true for the infinite blue pulse.
//
// Usage:
//   React.createElement(SaveBadge, { count: 2, animate: true })

function SaveBadge({ count, animate = false }) {
  if (!count || count <= 0) return null;
  return React.createElement("span", {
    className: animate ? "save-glow" : "",
    style: {
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 8px", borderRadius: 3,
      background: "rgba(30,80,180,0.12)",
      border: "1px solid #2a6fb4",
      color: "#5599ee",
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: 12, fontWeight: 700, letterSpacing: 1
    }
  }, `🛡 ×${count}`);
}


// ─── SPLASH TEXT ─────────────────────────────────────────────────────────────
// Floating label that pops in and fades out — good for summary lines.
// Wrap any string in this to give it the hit-burst entrance animation.
//
// Usage:
//   React.createElement(SplashText, { text: "6 WOUNDS DEALT", color: "#e05050" })

function SplashText({ text, color = "#b8860b", fontSize = 13 }) {
  return React.createElement("span", {
    className: "hit-burst-text",
    style: {
      display: "inline-block",
      fontFamily: "'Share Tech Mono', monospace",
      fontWeight: 700,
      fontSize,
      letterSpacing: 2,
      color,
      textShadow: `0 0 10px ${color}88`
    }
  }, text);
}


// ─── FACTION COLOURS ─────────────────────────────────────────────────────────
// Convenience lookup for the 18 Legions + select Mechanicum / Custodes.
// Use with GlowUnitIcon's factionColor prop or anywhere you need a Legion tint.

var FACTION_COLORS = {
  // Loyalist
  "I   Dark Angels":         "#1a6b1a",
  "V   White Scars":         "#e8e8e8",
  "VI  Space Wolves":        "#4a6a8a",
  "VII Imperial Fists":      "#c8a800",
  "IX  Blood Angels":        "#aa1010",
  "X   Iron Hands":          "#505050",
  "XIII Ultramarines":       "#1a3aaa",
  "XVIII Salamanders":       "#1a6b1a",
  "XIX Raven Guard":         "#111111",

  // Traitor
  "III Emperor's Children":  "#9933aa",
  "IV  Iron Warriors":       "#7a7a7a",
  "VIII Night Lords":         "#1a1a66",
  "XII World Eaters":        "#aa1010",
  "XIV Death Guard":         "#556b2f",
  "XV  Thousand Sons":       "#cc6600",
  "XVI Sons of Horus":       "#2a6b4a",
  "XVII Word Bearers":       "#880000",
  "XX  Alpha Legion":        "#336666",

  // Mechanicum / Custodes
  "Mechanicum":              "#aa3300",
  "Custodes":                "#cc9900",
  "Solar Auxilia":           "#8b6914"
};
