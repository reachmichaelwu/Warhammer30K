// ─────────────────────────────────────────────────────────────────────────
// 21-tutorial.js — Guided Tutorial page
//
// Step-by-step battle primer that walks a new player through the five
// stages of a game (Army → Deploy → Shooting → Assault → End) using the
// shipped preset armies (Dark Angels vs Sons of Horus).  The tutorial
// renders its OWN tactical map — visually matching the Tactical page map —
// so each step can be explained with scripted unit positions and
// annotations without touching the live game state.
//
// Exposes a single global: HHTutorialPage (React component).
// Props:
//   goToTactical(modeId)  — jump to the Tactical page in a given mode
//   goToPhase(phaseId)    — jump to any toolkit tab (e.g. "army_builder")
// ─────────────────────────────────────────────────────────────────────────

var HHTutorialPage = (function () {
  var h = React.createElement;

  // Board matches the real tactical map: 72" × 48"
  var BOARD_W = 72;
  var BOARD_H = 48;

  var OBJECTIVES = [
    { id: "obj1", x: 18, y: 24 },
    { id: "obj2", x: 36, y: 24 },
    { id: "obj3", x: 54, y: 24 },
  ];

  // Same palette as the Tactical page map / TAC_PHASE_META
  var P1_COL = "#e05555";
  var P1_BG = "rgba(200,60,60,0.85)";
  var P2_COL = "#5599dd";
  var P2_BG = "rgba(50,120,200,0.85)";

  var STEP_META = {
    army: { color: "#8fcf91", rgb: "143,207,145", icon: "📋", title: "MUSTER YOUR ARMY" },
    deployment: { color: "#9b8ace", rgb: "155,138,206", icon: "📍", title: "DEPLOYMENT" },
    shooting: { color: "#d8a82b", rgb: "216,168,43", icon: "⚔", title: "SHOOTING PHASE" },
    assault: { color: "#d05050", rgb: "208,80,80", icon: "🗡", title: "ASSAULT PHASE" },
    end: { color: "#5ea76e", rgb: "94,167,110", icon: "🏛", title: "END PHASE" },
  };

  // ── Tutorial roster — hand-picked units from the two shipped presets.
  //    Each unit carries a scripted position for every step so the map
  //    tells a little story as you click Next.
  //    pos: { army:[x,y], deployment:[x,y], shooting:[x,y], assault:[x,y], end:[x,y] }
  var TUT_UNITS = [
    // Loyalist — Dark Angels (red, deploys south)
    { id: "lion", label: "LION", name: "Lion El'Jonson", side: "p1", kind: "char",
      pos: { army: [24, 46], deployment: [30, 43], shooting: [30, 33], assault: [33.2, 25.6], end: [33.2, 25.6] } },
    { id: "da_tac", label: "TACTICAL", name: "Tactical Squad (10)", side: "p1", kind: "inf",
      pos: { army: [14, 46], deployment: [16, 44], shooting: [17, 36], assault: [18, 28], end: [18, 26] } },
    { id: "da_breacher", label: "BREACHERS", name: "Breacher Squad (10)", side: "p1", kind: "inf",
      pos: { army: [34, 46], deployment: [24, 45], shooting: [25, 38], assault: [26, 32], end: [26, 30] } },
    { id: "da_spartan", label: "SPARTAN", name: "Spartan", side: "p1", kind: "tank",
      pos: { army: [44, 46], deployment: [40, 44], shooting: [40, 38], assault: [40, 34], end: [40, 32] } },
    { id: "da_levi", label: "LEVIATHAN", name: "Leviathan Dreadnought", side: "p1", kind: "walker",
      pos: { army: [54, 46], deployment: [52, 43], shooting: [52, 36], assault: [52, 33], end: [52, 29] } },
    // Traitor — Sons of Horus (blue, deploys north)
    { id: "lw_praetor", label: "PRAETOR", name: "Praetor (Saturnine)", side: "p2", kind: "char",
      pos: { army: [24, 2], deployment: [34, 5], shooting: [34, 14], assault: [34, 24], end: [34, 24] } },
    { id: "lw_vet", label: "VETERANS", name: "Veteran Tactical Squad (10)", side: "p2", kind: "inf",
      pos: { army: [14, 2], deployment: [20, 4], shooting: [20, 12], assault: [20, 16], end: [20, 16] } },
    { id: "lw_term", label: "TERMINATORS", name: "Saturnine Terminators (3)", side: "p2", kind: "inf",
      pos: { army: [34, 2], deployment: [40, 4], shooting: [40, 13], assault: [38, 21], end: [38, 21] } },
    { id: "lw_kratos", label: "KRATOS", name: "Kratos Assault Tank", side: "p2", kind: "tank",
      pos: { army: [44, 2], deployment: [48, 4], shooting: [48, 14], assault: [48, 14], end: [48, 14] } },
    { id: "lw_tac", label: "TACTICAL", name: "Tactical Squad (10)", side: "p2", kind: "inf",
      pos: { army: [54, 2], deployment: [54, 5], shooting: [54, 12], assault: [54, 16], end: [54, 21.5] } },
  ];

  // Per-step token highlights: { unitId: "attacker"|"target"|"mover" }
  var STEP_HIGHLIGHTS = {
    army: {},
    deployment: {},
    shooting: { da_levi: "attacker", lw_kratos: "target" },
    assault: { lion: "attacker", lw_praetor: "target" },
    end: {},
  };

  // ── Step copy ──────────────────────────────────────────────────────────
  var STEPS = [
    {
      id: "army",
      label: "ARMY",
      tagline: "Build a Crusade Force Organisation before the first die is rolled.",
      sections: [
        {
          head: "WHAT HAPPENS",
          body: "Both players agree a points limit (3,000pts here) and build an army on the Crusade Force Organisation chart — a Primary detachment of High Command, Command, Troops and supporting slots, expanded with Auxiliary, Apex and Warlord detachments. Every unit, weapon swap and piece of wargear costs points.",
        },
        {
          head: "THE PRESET ARMIES",
          body: "This tutorial fields two armies shipped with the toolkit: the loyalist Dark Angels led by Lion El'Jonson against the traitor Sons of Horus. Their full rosters are shown beside the map — these exact lists can be loaded any time from the Army tab via LOAD PRESET.",
        },
        {
          head: "IN THE TOOLKIT",
          body: "Open the ARMY tab, choose allegiance and faction, then add units slot by slot — or load a preset and tweak it. The builder validates detachment slots and tracks your points total as you go.",
        },
      ],
      mapCaption: "The muster — loyalist Dark Angels (red, bottom) face the traitor Sons of Horus (blue, top). Click NEXT to deploy them.",
      tryLabel: "OPEN ARMY BUILDER ▸",
      tryAction: "army",
    },
    {
      id: "deployment",
      label: "DEPLOY",
      tagline: "Claim your table edge and get your forces onto the battlefield.",
      sections: [
        {
          head: "WHAT HAPPENS",
          body: "Players roll off, pick table edges and place 3+ objective markers. Deployment zones extend 12\" from each long edge — the shaded bands on the map. Players then alternate deploying one unit at a time. Units may instead be held in Reserve or arrive later by Deep Strike or Drop Pod.",
        },
        {
          head: "READ THE MAP",
          body: "The Dark Angels hold the southern zone, the Sons of Horus the northern. Three objectives (gold diamonds) sit along the centre line — they decide the game in the End phase, so deploy with them in mind.",
        },
        {
          head: "IN THE TOOLKIT",
          body: "On the TACTICAL page, switch to Deploy mode: Select Unit arms a unit to place, the Loyalist/Traitor buttons choose the side, then click the map to drop models. Place Objective and Place Terrain add markers, and Show Zones overlays the deployment bands exactly as drawn here.",
        },
      ],
      mapCaption: "Both armies deployed inside their 12\" zones. Objectives (gold) hold the centre line.",
      tryLabel: "TRY IT ON THE TACTICAL PAGE ▸",
      tryAction: "deployment",
    },
    {
      id: "shooting",
      label: "SHOOTING",
      tagline: "Pick a shooter, pick a target, check range — then let the dice decide.",
      sections: [
        {
          head: "WHAT HAPPENS",
          body: "Each of your units may shoot at an enemy unit it can see within weapon range. Roll to hit using the firer's Ballistic Skill, roll to wound comparing weapon Strength against the target's Toughness, then the target takes Armour, Invulnerable or Feel No Pain saves. Heavy casualties can Pin a unit, and the target may React with Return Fire.",
        },
        {
          head: "READ THE MAP",
          body: "The Leviathan Dreadnought (gold ring) targets the Kratos Assault Tank (red ring). The dashed circle is its storm cannon's range; the target line shows the measured distance — inside the ring means the shot is legal.",
        },
        {
          head: "IN THE TOOLKIT",
          body: "On the TACTICAL page in Shoot mode: click your attacker, click the target, pick a weapon, then RESOLVE. The full dice sequence — hits, wounds, saves, damage — is rolled and reported, with Return Fire one click away.",
        },
      ],
      mapCaption: "Leviathan (gold) draws line of sight to the Kratos (red) at 22\" — within the 24\" dashed range ring.",
      tryLabel: "TRY IT ON THE TACTICAL PAGE ▸",
      tryAction: "shooting",
    },
    {
      id: "assault",
      label: "ASSAULT",
      tagline: "Declare a charge, weather the overwatch, and fight blade to blade.",
      sections: [
        {
          head: "WHAT HAPPENS",
          body: "A unit declares a charge against an enemy within reach and rolls 2D6 for charge distance — fail and it stalls in the open. The defender may React with Overwatch. Once in combat, models fight in Initiative order: compare Weapon Skill to hit, Strength versus Toughness to wound, then saves. The loser of the combat takes a Morale check and may Fall Back.",
        },
        {
          head: "READ THE MAP",
          body: "Lion El'Jonson (gold ring) hurls himself at the Saturnine Praetor (red ring) — the dashed arrow marks his 2D6 charge. Characters in base contact may issue a Challenge to settle it one-on-one.",
        },
        {
          head: "IN THE TOOLKIT",
          body: "On the TACTICAL page in Assault mode: click the charger, click the target, then PREP CHARGE — the measured distance pre-fills the charge roll. The resolver walks Initiative steps, per-weapon dice and combat result, and the Challenge sub-phase handles duels and gambits.",
        },
      ],
      mapCaption: "Lion El'Jonson charges the Praetor — 2D6 charge distance, then Initiative-order combat.",
      tryLabel: "TRY IT ON THE TACTICAL PAGE ▸",
      tryAction: "assault",
    },
    {
      id: "end",
      label: "END",
      tagline: "Rally, recover, and count who actually holds the field.",
      sections: [
        {
          head: "WHAT HAPPENS",
          body: "At the end of the round units attempt to rally — clearing Pinned, Suppressed and Falling Back states — and ongoing effects expire. Then score: a unit controls an objective if it is within 3\" with no enemy contesting. Primary and secondary objectives convert to Victory Points, and after the final round the higher VP total wins.",
        },
        {
          head: "READ THE MAP",
          body: "The Dark Angels Tactical Squad holds the western objective (red ring) and the Sons of Horus hold the east (blue ring) — one VP apiece. The centre objective sits beside the Lion–Praetor melee and is CONTESTED, scoring no one.",
        },
        {
          head: "IN THE TOOLKIT",
          body: "On the TACTICAL page, End mode shows recovery and per-unit status chips, while the END tab tracks primary and secondary VP round by round. That's the full loop — Deploy, Move, Shoot, Assault, End — repeated each round. You're ready for the TACTICAL page.",
        },
      ],
      mapCaption: "Scoring: Loyalists hold west (+1 VP), Traitors hold east (+1 VP), centre contested. 1–1 after round one.",
      tryLabel: "OPEN THE TACTICAL PAGE ▸",
      tryAction: "end",
    },
  ];

  // ── Preset CSV → roster rows (for the ARMY step tables) ────────────────
  function parsePreset(preset) {
    var rows = [];
    var total = "";
    if (!preset || !preset.csv) return { rows: rows, total: total };
    var lines = preset.csv.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      var cells = line.split('","').map(function (c) {
        return c.replace(/^"+|"+$/g, "");
      });
      if (cells.length < 12) continue;
      if (/^\d+$/.test(cells[0])) {
        rows.push({
          name: cells[1],
          models: cells[7],
          points: cells[11],
          warlord: cells[12] === "YES",
        });
      } else if (cells[10] === "TOTAL:") {
        total = cells[11];
      }
    }
    return { rows: rows, total: total };
  }

  function getPresets() {
    if (typeof ARMY_PRESETS === "undefined") return { loyalist: null, traitor: null };
    var loyal = null;
    var traitor = null;
    for (var i = 0; i < ARMY_PRESETS.length; i++) {
      var p = ARMY_PRESETS[i];
      if (!loyal && p.faction === "dark_angels") loyal = p;
      if (!traitor && p.faction === "sons_of_horus") traitor = p;
    }
    return { loyalist: loyal, traitor: traitor };
  }

  // ── Map pieces ─────────────────────────────────────────────────────────
  function pct(v, max) {
    return (v / max) * 100 + "%";
  }

  function renderToken(unit, stepId, color) {
    var p = unit.pos[stepId] || unit.pos.deployment;
    var isP1 = unit.side === "p1";
    var col = isP1 ? P1_COL : P2_COL;
    var bg = isP1 ? P1_BG : P2_BG;
    var role = STEP_HIGHLIGHTS[stepId][unit.id];
    var ringCol = role === "attacker" ? "#ffd700" : role === "target" ? "#ff4444" : null;
    var sz = unit.kind === "tank" ? 30 : unit.kind === "walker" ? 26 : unit.kind === "char" ? 24 : 22;
    var shape = unit.kind === "tank" ? 3 : unit.kind === "char" ? "50%" : 4;
    var facing = isP1 ? 0 : 180;

    return h(
      "div",
      {
        key: unit.id,
        title: unit.name,
        style: {
          position: "absolute",
          left: pct(p[0], BOARD_W),
          top: pct(p[1], BOARD_H),
          transform: "translate(-50%, -50%)",
          width: sz,
          height: sz,
          zIndex: role ? 12 : 10,
          transition: "left 0.6s ease, top 0.6s ease",
        },
      },
      // facing chevron
      h("div", {
        style: {
          position: "absolute",
          left: "50%",
          top: -4,
          width: 0,
          height: 0,
          transform: "translate(-50%, -100%) rotate(" + facing + "deg)",
          transformOrigin: "50% " + (sz / 2 + 4) + "px",
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderBottom: "8px solid " + (ringCol || "rgba(255,255,255,0.3)"),
          pointerEvents: "none",
        },
      }),
      // body
      h(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
            borderRadius: shape,
            background: bg,
            border: "2px solid " + (ringCol || col),
            boxShadow: ringCol
              ? "0 0 10px " + ringCol + ", 0 0 18px " + ringCol + "55"
              : "0 1px 4px rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: sz * 0.5,
            lineHeight: 1,
          },
        },
        unit.kind === "tank" ? "🜲" : unit.kind === "walker" ? "🜨" : unit.kind === "char" ? "★" : "▮",
      ),
      // label
      h(
        "div",
        {
          style: {
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: 2,
            fontSize: 8,
            fontFamily: "'Share Tech Mono', monospace",
            fontWeight: 700,
            letterSpacing: 1,
            color: ringCol || col,
            textShadow: "0 0 4px rgba(0,0,0,0.9)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          },
        },
        unit.label,
      ),
    );
  }

  function svgEl(tag, props) {
    var children = Array.prototype.slice.call(arguments, 2);
    return h.apply(null, [tag, props].concat(children));
  }

  // SVG annotation layer, drawn in board-inch coordinates (viewBox 72×48)
  function renderAnnotations(stepId) {
    var kids = [];

    // Objectives (every step after army)
    if (stepId !== "army") {
      OBJECTIVES.forEach(function (o) {
        kids.push(
          svgEl("rect", {
            key: o.id,
            x: o.x - 1.1,
            y: o.y - 1.1,
            width: 2.2,
            height: 2.2,
            transform: "rotate(45 " + o.x + " " + o.y + ")",
            fill: "rgba(218,165,32,0.85)",
            stroke: "#ffd700",
            strokeWidth: 0.18,
          }),
        );
      });
    }

    if (stepId === "deployment") {
      kids.push(
        svgEl("rect", { key: "z2", x: 0, y: 0, width: 72, height: 12, fill: "rgba(50,120,200,0.13)" }),
        svgEl("rect", { key: "z1", x: 0, y: 36, width: 72, height: 12, fill: "rgba(200,60,60,0.13)" }),
        svgEl("line", { key: "l2", x1: 0, y1: 12, x2: 72, y2: 12, stroke: P2_COL, strokeWidth: 0.16, strokeDasharray: "1.2 0.8" }),
        svgEl("line", { key: "l1", x1: 0, y1: 36, x2: 72, y2: 36, stroke: P1_COL, strokeWidth: 0.16, strokeDasharray: "1.2 0.8" }),
        svgEl("text", { key: "t2", x: 1.2, y: 10.6, fill: P2_COL, fontSize: 1.7, fontFamily: "'Share Tech Mono', monospace", letterSpacing: 0.3 }, "TRAITOR DEPLOYMENT ZONE — 12\""),
        svgEl("text", { key: "t1", x: 1.2, y: 38.3, fill: P1_COL, fontSize: 1.7, fontFamily: "'Share Tech Mono', monospace", letterSpacing: 0.3 }, "LOYALIST DEPLOYMENT ZONE — 12\""),
      );
    }

    if (stepId === "shooting") {
      var atk = [52, 36];
      var tgt = [48, 14];
      kids.push(
        // range ring (storm cannon 24")
        svgEl("circle", { key: "rng", cx: atk[0], cy: atk[1], r: 24, fill: "rgba(216,168,43,0.05)", stroke: "#d8a82b", strokeWidth: 0.18, strokeDasharray: "1.4 1" }),
        // target line
        svgEl("line", { key: "los", x1: atk[0], y1: atk[1], x2: tgt[0], y2: tgt[1], stroke: "#ffd700", strokeWidth: 0.25 }),
        svgEl("circle", { key: "losdot", cx: tgt[0], cy: tgt[1], r: 0.7, fill: "none", stroke: "#ff4444", strokeWidth: 0.22 }),
        svgEl("text", { key: "dist", x: (atk[0] + tgt[0]) / 2 + 1.4, y: (atk[1] + tgt[1]) / 2, fill: "#ffd700", fontSize: 2, fontFamily: "'Share Tech Mono', monospace" }, "22\" — IN RANGE"),
      );
    }

    if (stepId === "assault") {
      var from = [30, 33];
      var to = [33.2, 25.6];
      kids.push(
        svgEl("defs", { key: "defs" },
          svgEl("marker", { id: "tutArrow", markerWidth: 6, markerHeight: 6, refX: 4.5, refY: 3, orient: "auto" },
            svgEl("path", { d: "M0,0 L6,3 L0,6 Z", fill: "#ff6666" }),
          ),
        ),
        svgEl("line", { key: "chg", x1: from[0], y1: from[1], x2: to[0] - 0.6, y2: to[1] + 1.4, stroke: "#ff6666", strokeWidth: 0.3, strokeDasharray: "1 0.7", markerEnd: "url(#tutArrow)" }),
        svgEl("text", { key: "chgt", x: from[0] - 11.5, y: (from[1] + to[1]) / 2, fill: "#ff8888", fontSize: 2, fontFamily: "'Share Tech Mono', monospace" }, "CHARGE: 2D6\""),
        svgEl("text", { key: "clash", x: 35.4, y: 23.4, fontSize: 2.6 }, "💥"),
      );
    }

    if (stepId === "end") {
      // control rings: west = loyalist, east = traitor, centre contested
      kids.push(
        svgEl("circle", { key: "c1", cx: 18, cy: 24, r: 3, fill: "rgba(200,60,60,0.12)", stroke: P1_COL, strokeWidth: 0.22 }),
        svgEl("circle", { key: "c3", cx: 54, cy: 24, r: 3, fill: "rgba(50,120,200,0.12)", stroke: P2_COL, strokeWidth: 0.22 }),
        svgEl("circle", { key: "c2", cx: 36, cy: 24, r: 3, fill: "none", stroke: "#cccccc", strokeWidth: 0.18, strokeDasharray: "0.8 0.6" }),
        svgEl("text", { key: "v1", x: 13.4, y: 19.6, fill: P1_COL, fontSize: 1.8, fontFamily: "'Share Tech Mono', monospace" }, "LOYALIST +1 VP"),
        svgEl("text", { key: "v3", x: 49.6, y: 19.6, fill: P2_COL, fontSize: 1.8, fontFamily: "'Share Tech Mono', monospace" }, "TRAITOR +1 VP"),
        svgEl("text", { key: "v2", x: 31.6, y: 19.6, fill: "#cccccc", fontSize: 1.8, fontFamily: "'Share Tech Mono', monospace" }, "CONTESTED"),
      );
    }

    return svgEl(
      "svg",
      {
        viewBox: "0 0 " + BOARD_W + " " + BOARD_H,
        style: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 },
      },
      kids,
    );
  }

  function renderTutorialMap(step) {
    var meta = STEP_META[step.id];
    return h(
      "div",
      {
        style: {
          background: "rgba(3,8,3,0.92)",
          border: "1.5px solid " + meta.color,
          borderRadius: 8,
          boxShadow: "0 0 18px rgba(" + meta.rgb + ",0.25)",
          overflow: "hidden",
        },
      },
      // map header
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderBottom: "1px solid rgba(" + meta.rgb + ",0.4)",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 12,
            letterSpacing: 2,
            color: meta.color,
            textTransform: "uppercase",
          },
        },
        h("span", { style: { fontSize: 15 } }, "🗺"),
        "TUTORIAL TACTICAL MAP · " + meta.icon + " " + meta.title,
        h("span", { style: { marginLeft: "auto", fontSize: 10, color: "#9fd69b" } }, BOARD_W + "\" × " + BOARD_H + "\""),
      ),
      // board
      h(
        "div",
        {
          style: {
            position: "relative",
            width: "100%",
            aspectRatio: "3 / 2",
            background:
              "repeating-linear-gradient(0deg, rgba(0,255,65,0.05) 0, rgba(0,255,65,0.05) 1px, transparent 1px, transparent 12.5%)," +
              "repeating-linear-gradient(90deg, rgba(0,255,65,0.05) 0, rgba(0,255,65,0.05) 1px, transparent 1px, transparent 8.333%)," +
              "radial-gradient(ellipse at center, #0a1a0a 0%, #050f05 80%)",
          },
        },
        renderAnnotations(step.id),
        TUT_UNITS.map(function (u) {
          return renderToken(u, step.id);
        }),
      ),
      // caption
      h(
        "div",
        {
          style: {
            padding: "8px 12px",
            borderTop: "1px solid rgba(" + meta.rgb + ",0.4)",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            lineHeight: 1.5,
            color: "#9fd69b",
          },
        },
        "▸ " + step.mapCaption,
      ),
    );
  }

  // ── ARMY step roster tables ────────────────────────────────────────────
  function renderRoster(preset, sideCol, fallbackTitle) {
    var data = parsePreset(preset);
    var title = preset ? preset.name : fallbackTitle;
    return h(
      "div",
      {
        style: {
          flex: "1 1 260px",
          minWidth: 240,
          background: "rgba(3,8,3,0.92)",
          border: "1px solid " + sideCol,
          borderRadius: 8,
          overflow: "hidden",
        },
      },
      h(
        "div",
        {
          style: {
            padding: "7px 10px",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            color: sideCol,
            borderBottom: "1px solid " + sideCol,
            textTransform: "uppercase",
          },
        },
        title,
      ),
      h(
        "div",
        { style: { maxHeight: 190, overflowY: "auto" } },
        data.rows.length === 0
          ? h("div", { style: { padding: 10, fontSize: 11, color: "#9fd69b", fontFamily: "'Share Tech Mono', monospace" } }, "Preset data unavailable.")
          : data.rows.map(function (r, i) {
              return h(
                "div",
                {
                  key: i,
                  style: {
                    display: "flex",
                    gap: 6,
                    padding: "3px 10px",
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 10.5,
                    color: "#d8f7c8",
                    background: i % 2 ? "rgba(255,255,255,0.03)" : "transparent",
                  },
                },
                h("span", { style: { flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
                  (r.warlord ? "★ " : "") + r.name),
                h("span", { style: { width: 28, textAlign: "right", color: "#9fd69b" } }, "×" + r.models),
                h("span", { style: { width: 44, textAlign: "right", color: "#ffd966" } }, r.points + "pt"),
              );
            }),
      ),
      data.total &&
        h(
          "div",
          {
            style: {
              padding: "6px 10px",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 11,
              fontWeight: 700,
              color: "#ffd966",
              textAlign: "right",
              letterSpacing: 1,
            },
          },
          "TOTAL: " + data.total + " PTS",
        ),
    );
  }

  // ── Main component ─────────────────────────────────────────────────────
  return function HHTutorialPageComponent(props) {
    var stepState = React.useState(0);
    var stepIdx = stepState[0];
    var setStepIdx = stepState[1];
    var step = STEPS[stepIdx];
    var meta = STEP_META[step.id];
    var presets = getPresets();

    var goTry = function () {
      if (step.tryAction === "army") {
        if (props.goToPhase) props.goToPhase("army_builder");
      } else if (props.goToTactical) {
        props.goToTactical(step.tryAction === "end" ? "end" : step.tryAction);
      }
    };

    var navBtn = function (label, onClick, disabled, accent) {
      return h(
        "button",
        {
          onClick: onClick,
          disabled: disabled,
          style: {
            padding: "9px 16px",
            background: disabled ? "rgba(255,255,255,0.04)" : accent ? meta.color : "rgba(255,255,255,0.06)",
            border: "1.5px solid " + (disabled ? "rgba(255,255,255,0.15)" : meta.color),
            borderRadius: 5,
            color: disabled ? "rgba(255,255,255,0.25)" : accent ? "#06120a" : meta.color,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            cursor: disabled ? "default" : "pointer",
            textTransform: "uppercase",
          },
        },
        label,
      );
    };

    return h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 12 } },
      // ── Header: title + step chips
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            padding: "10px 14px",
            background: "rgba(3,8,3,0.92)",
            border: "1px solid rgba(0,255,65,0.35)",
            borderRadius: 8,
          },
        },
        h(
          "span",
          {
            style: {
              fontFamily: "'VT323', 'Share Tech Mono', monospace",
              fontSize: 24,
              letterSpacing: 3,
              color: "#00ff41",
              textShadow: "0 0 10px rgba(0,255,65,0.5)",
            },
          },
          "🎓 BATTLE PRIMER",
        ),
        h("span", { style: { fontSize: 11, color: "#9fd69b", fontFamily: "'Share Tech Mono', monospace", letterSpacing: 1 } },
          "A GUIDED TOUR OF ONE GAME ROUND"),
        h("span", { style: { flex: 1 } }),
        STEPS.map(function (s, i) {
          var active = i === stepIdx;
          var done = i < stepIdx;
          var c = STEP_META[s.id].color;
          return h(
            "button",
            {
              key: s.id,
              onClick: function () { setStepIdx(i); },
              style: {
                padding: "6px 10px",
                background: active ? c : "transparent",
                border: "1.5px solid " + (active || done ? c : "rgba(255,255,255,0.25)"),
                borderRadius: 4,
                color: active ? "#06120a" : done ? c : "rgba(255,255,255,0.55)",
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                cursor: "pointer",
              },
            },
            (done ? "✓ " : i + 1 + ". ") + s.label,
          );
        }),
      ),
      // ── Body: explainer panel + tutorial map
      h(
        "div",
        { style: { display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" } },
        // left — explainer
        h(
          "div",
          {
            style: {
              flex: "0 1 340px",
              minWidth: 280,
              background: "rgba(3,8,3,0.92)",
              border: "1.5px solid " + meta.color,
              borderRadius: 8,
              boxShadow: "0 0 18px rgba(" + meta.rgb + ",0.2)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            },
          },
          h(
            "div",
            {
              style: {
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                letterSpacing: 2,
                color: meta.color,
              },
            },
            "STEP " + (stepIdx + 1) + " OF " + STEPS.length,
          ),
          h(
            "div",
            {
              style: {
                fontFamily: "'VT323', 'Share Tech Mono', monospace",
                fontSize: 28,
                letterSpacing: 2,
                color: meta.color,
                textShadow: "0 0 10px rgba(" + meta.rgb + ",0.6)",
                lineHeight: 1,
              },
            },
            meta.icon + " " + meta.title,
          ),
          h(
            "div",
            { style: { fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: "#d8f7c8", lineHeight: 1.5, fontStyle: "italic" } },
            step.tagline,
          ),
          step.sections.map(function (sec, i) {
            return h(
              "div",
              { key: i },
              h(
                "div",
                {
                  style: {
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 2,
                    color: meta.color,
                    borderBottom: "1px solid rgba(" + meta.rgb + ",0.4)",
                    paddingBottom: 3,
                    marginBottom: 5,
                  },
                },
                sec.head,
              ),
              h(
                "div",
                { style: { fontFamily: "'Share Tech Mono', monospace", fontSize: 11.5, color: "#c8e8c0", lineHeight: 1.55 } },
                sec.body,
              ),
            );
          }),
          h(
            "button",
            {
              onClick: goTry,
              style: {
                padding: "10px 14px",
                background: "rgba(" + meta.rgb + ",0.12)",
                border: "1.5px solid " + meta.color,
                borderRadius: 5,
                color: meta.color,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                cursor: "pointer",
                textShadow: "0 0 6px rgba(" + meta.rgb + ",0.6)",
              },
            },
            step.tryLabel,
          ),
          h(
            "div",
            { style: { display: "flex", gap: 8, justifyContent: "space-between", marginTop: 2 } },
            navBtn("◂ BACK", function () { setStepIdx(Math.max(0, stepIdx - 1)); }, stepIdx === 0, false),
            stepIdx < STEPS.length - 1
              ? navBtn("NEXT ▸", function () { setStepIdx(stepIdx + 1); }, false, true)
              : navBtn("TO BATTLE ▸", function () { if (props.goToTactical) props.goToTactical("deployment"); }, false, true),
          ),
        ),
        // right — map (+ rosters on the ARMY step)
        h(
          "div",
          { style: { flex: "1 1 460px", minWidth: 320, display: "flex", flexDirection: "column", gap: 12 } },
          step.id === "army" &&
            h(
              "div",
              { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
              renderRoster(presets.loyalist, P1_COL, "Dark Angels (Loyalist)"),
              renderRoster(presets.traitor, P2_COL, "Sons of Horus (Traitor)"),
            ),
          renderTutorialMap(step),
        ),
      ),
    );
  };
})();
