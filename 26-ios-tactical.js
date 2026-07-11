/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   iOS TACTICAL MAP  (26-ios-tactical.js)

   Touch-first, phone-sized reimplementation of the Wargame Tactical Map.
   Pure VIEW component: all game state and rules live in 15-main-app.js,
   which passes data + callbacks in via props (see renderIOSTacticalSection).

   Gestures:  1 finger drag  = pan camera (or drag a unit in Deploy mode)
              2 finger pinch = zoom about the pinch midpoint
              tap            = select unit / act on board point
   Layout:    mode chip rail → full-bleed map viewport → bottom command
              sheet (collapsible) with stats, weapon pickers, actions.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function () {
  "use strict";

  var S0 = 10; // base board pixels per inch (before camera scale)
  var MIN_K = 0.22;
  var MAX_K = 5;

  function clampNum(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function tokenSizeIn(unit) {
    var t = (unit && unit.type) || "";
    if (t === "tank" || t === "transport" || t === "vehicle" || t === "superheavy") return 3.2;
    if (t === "dreadnought" || t === "walker") return 2.6;
    if (t === "objective") return 2.4;
    return 2.2;
  }

  function IOSTacticalMap(props) {
    var BW = (props.boardW || 72) * S0;
    var BH = (props.boardH || 48) * S0;

    var camState = useState(null); // {tx, ty, k} — null until first fit
    var cam = camState[0];
    var setCam = camState[1];
    var sheetState = useState(true);
    var sheetOpen = sheetState[0];
    var setSheetOpen = sheetState[1];

    var viewportRef = useRef(null);
    var gRef = useRef({ pointers: new Map(), mode: null });
    var camRef = useRef(cam);
    camRef.current = cam;
    var propsRef = useRef(props);
    propsRef.current = props;

    function clampCam(next) {
      var el = viewportRef.current;
      var vw = (el && el.clientWidth) || 390;
      var vh = (el && el.clientHeight) || 420;
      var k = clampNum(next.k, MIN_K, MAX_K);
      var loX = Math.min(24, vw - BW * k - 24);
      var hiX = Math.max(24, vw - BW * k - 24);
      var loY = Math.min(24, vh - BH * k - 24);
      var hiY = Math.max(24, vh - BH * k - 24);
      return {
        k: k,
        tx: clampNum(next.tx, loX, hiX),
        ty: clampNum(next.ty, loY, hiY),
      };
    }

    function fitCamera() {
      var el = viewportRef.current;
      if (!el) return;
      var vw = el.clientWidth || 390;
      var vh = el.clientHeight || 420;
      var k = clampNum(Math.min(vw / BW, vh / BH) * 0.97, MIN_K, MAX_K);
      setCam({ k: k, tx: (vw - BW * k) / 2, ty: (vh - BH * k) / 2 });
    }

    useEffect(function () {
      fitCamera();
      var t = null;
      function onResize() {
        if (t) clearTimeout(t);
        t = setTimeout(fitCamera, 120);
      }
      window.addEventListener("resize", onResize);
      window.addEventListener("orientationchange", onResize);
      return function () {
        if (t) clearTimeout(t);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("orientationchange", onResize);
      };
    }, []);

    function screenToBoard(clientX, clientY) {
      var el = viewportRef.current;
      var c = camRef.current;
      if (!el || !c) return null;
      var rect = el.getBoundingClientRect();
      return {
        x: (clientX - rect.left - c.tx) / (c.k * S0),
        y: (clientY - rect.top - c.ty) / (c.k * S0),
      };
    }

    function unitAtPoint(bx, by) {
      var c = camRef.current;
      var units = propsRef.current.units || [];
      var slack = Math.max(0.7, 16 / ((c ? c.k : 1) * S0));
      var best = null;
      var bestD = Infinity;
      for (var i = 0; i < units.length; i++) {
        var u = units[i];
        var d = Math.hypot(u.x - bx, u.y - by);
        if (d < tokenSizeIn(u) / 2 + slack && d < bestD) {
          best = u;
          bestD = d;
        }
      }
      return best;
    }

    function zoomBy(factor) {
      var el = viewportRef.current;
      setCam(function (prev) {
        if (!prev || !el) return prev;
        var vw = el.clientWidth, vh = el.clientHeight;
        var k = clampNum(prev.k * factor, MIN_K, MAX_K);
        var ratio = k / prev.k;
        return clampCam({
          k: k,
          tx: vw / 2 - (vw / 2 - prev.tx) * ratio,
          ty: vh / 2 - (vh / 2 - prev.ty) * ratio,
        });
      });
    }

    // ---------- Pointer gestures ------------------------------------------
    function onPointerDown(e) {
      var g = gRef.current;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
      g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (g.pointers.size === 1) {
        g.startTime = Date.now();
        g.moved = false;
        g.startX = e.clientX;
        g.startY = e.clientY;
        g.camStart = camRef.current ? { tx: camRef.current.tx, ty: camRef.current.ty, k: camRef.current.k } : null;
        g.mode = "pan";
        g.dragUnitId = null;
        var b = screenToBoard(e.clientX, e.clientY);
        if (b && propsRef.current.mode === "deployment" && propsRef.current.onUnitDrag) {
          var hit = unitAtPoint(b.x, b.y);
          if (hit && hit.type !== "objective") {
            g.mode = "unitdrag";
            g.dragUnitId = hit.id;
          }
        }
      } else if (g.pointers.size === 2) {
        var pts = Array.from(g.pointers.values());
        var el = viewportRef.current;
        var rect = el ? el.getBoundingClientRect() : { left: 0, top: 0 };
        g.mode = "pinch";
        g.startDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        g.startMid = {
          x: (pts[0].x + pts[1].x) / 2 - rect.left,
          y: (pts[0].y + pts[1].y) / 2 - rect.top,
        };
        g.camStart = camRef.current ? { tx: camRef.current.tx, ty: camRef.current.ty, k: camRef.current.k } : null;
        g.moved = true; // a pinch is never a tap
      }
    }

    function onPointerMove(e) {
      var g = gRef.current;
      if (!g.pointers.has(e.pointerId)) return;
      g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!g.camStart) return;

      if (g.mode === "pinch" && g.pointers.size >= 2) {
        var pts = Array.from(g.pointers.values());
        var el = viewportRef.current;
        var rect = el ? el.getBoundingClientRect() : { left: 0, top: 0 };
        var dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        var mid = {
          x: (pts[0].x + pts[1].x) / 2 - rect.left,
          y: (pts[0].y + pts[1].y) / 2 - rect.top,
        };
        var k = clampNum(g.camStart.k * (dist / g.startDist), MIN_K, MAX_K);
        var ratio = k / g.camStart.k;
        setCam(clampCam({
          k: k,
          tx: mid.x - (g.startMid.x - g.camStart.tx) * ratio,
          ty: mid.y - (g.startMid.y - g.camStart.ty) * ratio,
        }));
        return;
      }

      if (g.pointers.size !== 1) return;
      var dx = e.clientX - g.startX;
      var dy = e.clientY - g.startY;
      if (!g.moved && dx * dx + dy * dy > 64) g.moved = true;

      if (g.mode === "pan") {
        if (!g.moved) return;
        setCam(clampCam({
          k: g.camStart.k,
          tx: g.camStart.tx + dx,
          ty: g.camStart.ty + dy,
        }));
      } else if (g.mode === "unitdrag") {
        if (!g.moved) return;
        var b = screenToBoard(e.clientX, e.clientY);
        if (b && propsRef.current.onUnitDrag) {
          propsRef.current.onUnitDrag(g.dragUnitId, b.x, b.y);
        }
      }
    }

    function onPointerUp(e) {
      var g = gRef.current;
      if (!g.pointers.has(e.pointerId)) return;
      g.pointers.delete(e.pointerId);

      if (g.pointers.size === 1 && g.mode === "pinch") {
        // Pinch → single finger: restart as a pan so the map doesn't jump.
        var rest = Array.from(g.pointers.values())[0];
        g.mode = "pan";
        g.moved = true;
        g.startX = rest.x;
        g.startY = rest.y;
        g.camStart = camRef.current ? { tx: camRef.current.tx, ty: camRef.current.ty, k: camRef.current.k } : null;
        return;
      }
      if (g.pointers.size > 0) return;

      var wasDrag = g.mode === "unitdrag" && g.moved;
      var isTap = !g.moved && Date.now() - (g.startTime || 0) < 600;
      var mode = g.mode;
      var dragUnitId = g.dragUnitId;
      g.mode = null;

      if (wasDrag) {
        if (propsRef.current.onUnitDragEnd) propsRef.current.onUnitDragEnd();
        return;
      }
      if (!isTap) return;
      var b = screenToBoard(e.clientX, e.clientY);
      if (!b) return;
      if (mode === "unitdrag" && dragUnitId != null) {
        var u = (propsRef.current.units || []).find(function (x) { return x.id === dragUnitId; });
        if (u && propsRef.current.onUnitTap) propsRef.current.onUnitTap(u);
        return;
      }
      var hit = unitAtPoint(b.x, b.y);
      if (hit && propsRef.current.onUnitTap) propsRef.current.onUnitTap(hit);
      else if (propsRef.current.onBoardTap && b.x >= 0 && b.x <= (props.boardW || 72) && b.y >= 0 && b.y <= (props.boardH || 48)) {
        propsRef.current.onBoardTap(b.x, b.y);
      }
    }

    // ---------- Board content (rendered in board px, scaled by camera) ----
    function renderGrid() {
      var lines = [];
      var i;
      for (i = 0; i <= (props.boardW || 72) / 6; i++) {
        lines.push(React.createElement("div", {
          key: "v" + i,
          style: {
            position: "absolute",
            left: i * 6 * S0,
            top: 0,
            width: 1,
            height: BH,
            background: i % 2 === 0 ? "rgba(143,207,145,0.16)" : "rgba(143,207,145,0.08)",
          },
        }));
      }
      for (i = 0; i <= (props.boardH || 48) / 6; i++) {
        lines.push(React.createElement("div", {
          key: "h" + i,
          style: {
            position: "absolute",
            top: i * 6 * S0,
            left: 0,
            height: 1,
            width: BW,
            background: i % 2 === 0 ? "rgba(143,207,145,0.16)" : "rgba(143,207,145,0.08)",
          },
        }));
      }
      return lines;
    }

    function renderRing(ring, key) {
      if (!ring || !(ring.r > 0)) return null;
      return React.createElement("div", {
        key: key,
        style: {
          position: "absolute",
          left: (ring.x - ring.r) * S0,
          top: (ring.y - ring.r) * S0,
          width: ring.r * 2 * S0,
          height: ring.r * 2 * S0,
          borderRadius: "50%",
          border: "2px " + (ring.dashed ? "dashed" : "solid") + " " + (ring.color || "#ffd966"),
          background: (ring.fill || "rgba(255,217,102,0.07)"),
          pointerEvents: "none",
          boxSizing: "border-box",
        },
      });
    }

    function renderTerrain() {
      return (props.terrain || []).map(function (t) {
        var meta = t.meta || {};
        var szIn = t.sizeIn || 6;
        return React.createElement("div", {
          key: "t" + t.id,
          style: {
            position: "absolute",
            left: (t.x - szIn / 2) * S0,
            top: (t.y - szIn / 2) * S0,
            width: szIn * S0,
            height: szIn * S0,
            borderRadius: 8,
            background: meta.bg || "rgba(90,138,58,0.25)",
            border: "1.5px solid " + (meta.border || "rgba(90,138,58,0.8)"),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: meta.color || "#5a8a3a",
            pointerEvents: "none",
          },
        }, meta.symbol || "≋");
      });
    }

    function renderObjectives() {
      return (props.objectives || []).map(function (o) {
        return React.createElement("div", {
          key: "o" + o.id,
          style: {
            position: "absolute",
            left: (o.x - 1.2) * S0,
            top: (o.y - 1.2) * S0,
            width: 2.4 * S0,
            height: 2.4 * S0,
            borderRadius: "50%",
            background: "rgba(255,215,0,0.85)",
            border: "1.5px solid #ffd700",
            boxShadow: "0 0 8px rgba(255,215,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 900,
            color: "#2a2418",
            pointerEvents: "none",
          },
        }, o.label || "OBJ");
      });
    }

    function renderUnits() {
      var attackerId = props.attackerId;
      var targetId = props.targetId;
      var moveSelectedId = props.moveSelectedId;
      var movedIds = props.movedIds || [];
      var routedIds = props.routedIds || [];
      return (props.units || []).map(function (u) {
        var szIn = tokenSizeIn(u);
        var sz = szIn * S0;
        var isP1 = u.player === "p1";
        var isAttacker = u.id === attackerId;
        var isTarget = u.id === targetId;
        var isMoveSel = u.id === moveSelectedId;
        var hasMoved = movedIds.indexOf(u.id) !== -1;
        var isRouted = routedIds.indexOf(u.id) !== -1;
        var border = isAttacker
          ? "3px solid #ffd700"
          : isTarget
            ? "3px solid #ff4444"
            : isMoveSel
              ? "3px solid #ffd966"
              : "1.5px solid " + (isP1 ? "#ff9a9a" : "#9ec2ff");
        var glow = isAttacker
          ? "0 0 12px rgba(255,215,0,0.75)"
          : isTarget
            ? "0 0 12px rgba(255,68,68,0.75)"
            : isMoveSel
              ? "0 0 12px rgba(255,217,102,0.7)"
              : "0 1px 4px rgba(0,0,0,0.5)";
        return React.createElement(
          "div",
          {
            key: u.id,
            style: {
              position: "absolute",
              left: u.x * S0 - sz / 2,
              top: u.y * S0 - sz / 2,
              width: sz,
              height: sz,
              borderRadius: u.type === "tank" || u.type === "transport" ? 4 : 6,
              background: isRouted
                ? "rgba(110,110,110,0.8)"
                : isP1
                  ? "rgba(180,55,55,0.92)"
                  : "rgba(52,100,175,0.92)",
              border: border,
              boxShadow: glow,
              opacity: hasMoved && !isMoveSel ? 0.72 : 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              pointerEvents: "none",
              overflow: "visible",
            },
          },
          React.createElement("div", {
            style: {
              fontSize: Math.max(sz * 0.5, 10),
              fontWeight: 900,
              lineHeight: 1,
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
            },
          }, u.symbol || "●"),
          React.createElement("div", {
            style: {
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginTop: 1,
              fontSize: 6,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              color: "#e8f2e0",
              background: "rgba(3,8,3,0.72)",
              padding: "1px 3px",
              borderRadius: 2,
              maxWidth: 60,
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontFamily: "'Share Tech Mono', monospace",
            },
          }, u.label || u.name || ""),
        );
      });
    }

    // ---------- Chrome pieces ---------------------------------------------
    var modeMeta = (props.modes || []).find(function (m) { return m.id === props.mode; }) ||
      { color: "#8fcf91", icon: "🗺", label: "Map" };

    function chip(m) {
      var active = m.id === props.mode;
      return React.createElement("button", {
        key: m.id,
        onClick: function () { if (props.onModeChange) props.onModeChange(m.id); },
        style: {
          flexShrink: 0,
          padding: "9px 12px",
          borderRadius: 16,
          border: "1.5px solid " + (active ? m.color : "rgba(143,207,145,0.25)"),
          background: active ? m.color + "33" : "rgba(255,255,255,0.04)",
          color: active ? "#fff6d0" : "#9fd69b",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 11,
          fontWeight: active ? 900 : 600,
          letterSpacing: 1,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        },
      }, m.icon + " " + m.label);
    }

    function zoomButton(label, onPress, key) {
      return React.createElement("button", {
        key: key,
        onClick: onPress,
        style: {
          width: 40,
          height: 40,
          borderRadius: 8,
          border: "1.5px solid rgba(143,207,145,0.55)",
          background: "rgba(3,8,3,0.88)",
          color: "#8fcf91",
          fontSize: 17,
          fontWeight: 900,
          fontFamily: "'Share Tech Mono', monospace",
        },
      }, label);
    }

    function statBox(s, i) {
      return React.createElement("div", {
        key: "s" + i,
        style: {
          padding: "7px 9px",
          borderRadius: 6,
          background: "rgba(255,255,255,0.045)",
          border: "1px solid rgba(143,207,145,0.22)",
          minWidth: 0,
        },
      },
        React.createElement("div", {
          style: { fontSize: 8, color: "#8fcf91", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 },
        }, s.label),
        React.createElement("div", {
          style: {
            fontSize: 13,
            color: s.color || "#d8f7c8",
            fontWeight: 900,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
        }, s.value),
      );
    }

    function pickerBox(p, i) {
      return React.createElement("div", {
        key: "p" + i,
        style: {
          padding: "8px 9px",
          borderRadius: 6,
          background: "rgba(255,255,255,0.045)",
          border: "1px solid " + (p.color || "#8fcf91"),
        },
      },
        React.createElement("div", {
          style: { fontSize: 8, color: p.color || "#8fcf91", letterSpacing: 1, textTransform: "uppercase", marginBottom: 5, fontWeight: 900 },
        }, p.label),
        !p.weapons || p.weapons.length === 0
          ? React.createElement("div", { style: { fontSize: 10, color: "#9fd69b" } }, "Tap a unit on the map first")
          : React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" } },
              p.weapons.map(function (w) {
                var active = p.selectedName === w.name;
                return React.createElement("button", {
                  key: w.name,
                  onClick: function () { p.onSelect(w); },
                  style: {
                    padding: "7px 9px",
                    borderRadius: 5,
                    fontSize: 10,
                    fontFamily: "'Share Tech Mono', monospace",
                    fontWeight: active ? 900 : 600,
                    background: active ? (p.color || "#8fcf91") + "33" : "rgba(255,255,255,0.05)",
                    border: "1px solid " + (active ? (p.color || "#8fcf91") : "rgba(143,207,145,0.28)"),
                    color: active ? "#fff6d0" : "#9fd69b",
                  },
                }, w.name);
              }),
            ),
      );
    }

    function actionButton(a, i) {
      return React.createElement("button", {
        key: "a" + i,
        onClick: a.disabled ? undefined : a.onPress,
        disabled: !!a.disabled,
        style: {
          minHeight: 44,
          padding: "8px 10px",
          borderRadius: 8,
          fontSize: 11,
          fontFamily: "'Share Tech Mono', monospace",
          fontWeight: 900,
          letterSpacing: 1,
          textTransform: "uppercase",
          background: a.disabled ? "rgba(255,255,255,0.04)" : (a.color || "#8fcf91") + "22",
          border: "1.5px solid " + (a.disabled ? "rgba(216,247,200,0.20)" : (a.color || "#8fcf91")),
          color: a.disabled ? "rgba(216,247,200,0.38)" : "#fff6d0",
          opacity: a.disabled ? 0.6 : 1,
        },
      }, a.label);
    }

    // ---------- Layout -----------------------------------------------------
    return React.createElement(
      "div",
      {
        className: "hh-ios-map-shell", // height lives in warroom-game.css (dvh + vh fallback)
        style: {
          display: "flex",
          flexDirection: "column",
          margin: "-8px -4px 0",
          background: "#050f05",
          color: "#d8f7c8",
          fontFamily: "'Share Tech Mono', monospace",
          overflow: "hidden",
        },
      },
      // Mode chip rail
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 6,
            padding: "8px 10px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            borderBottom: "1px solid rgba(143,207,145,0.25)",
            flexShrink: 0,
          },
        },
        (props.modes || []).map(chip),
      ),
      // Map viewport
      React.createElement(
        "div",
        {
          ref: viewportRef,
          onPointerDown: onPointerDown,
          onPointerMove: onPointerMove,
          onPointerUp: onPointerUp,
          onPointerCancel: onPointerUp,
          style: {
            flex: 1,
            position: "relative",
            overflow: "hidden",
            minHeight: 0,
            background: "#0a120a",
            touchAction: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
            cursor: "grab",
          },
        },
        cam && React.createElement(
          "div",
          {
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: BW,
              height: BH,
              transform: "translate(" + cam.tx + "px," + cam.ty + "px) scale(" + cam.k + ")",
              transformOrigin: "0 0",
              background: "#242e1e",
              border: "2px solid rgba(143,207,145,0.5)",
              boxSizing: "border-box",
              willChange: "transform",
            },
          },
          renderGrid(),
          renderTerrain(),
          props.rangeRing && renderRing(props.rangeRing, "rr"),
          props.moveRange && renderRing({
            x: props.moveRange.x,
            y: props.moveRange.y,
            r: props.moveRange.r,
            color: "#9ee68f",
            fill: "rgba(158,230,143,0.08)",
            dashed: true,
          }, "mr"),
          renderObjectives(),
          renderUnits(),
        ),
        // Armed banner (what a board tap will do)
        props.banner && React.createElement("div", {
          style: {
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "86%",
            padding: "6px 12px",
            borderRadius: 14,
            background: "rgba(3,8,3,0.92)",
            border: "1.5px solid " + modeMeta.color,
            color: "#fff6d0",
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 1,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            pointerEvents: "none",
            boxShadow: "0 0 12px " + modeMeta.color + "44",
          },
        }, props.banner),
        // Zoom / fit controls
        React.createElement(
          "div",
          {
            style: {
              position: "absolute",
              right: 8,
              bottom: 12,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            },
          },
          zoomButton("+", function () { zoomBy(1.35); }, "z1"),
          zoomButton("−", function () { zoomBy(1 / 1.35); }, "z2"),
          zoomButton("⛶", fitCamera, "z3"),
        ),
      ),
      // Bottom command sheet
      React.createElement(
        "div",
        {
          style: {
            flexShrink: 0,
            background: "rgba(3,8,3,0.97)",
            borderTop: "2px solid " + modeMeta.color,
            boxShadow: "0 -4px 18px " + modeMeta.color + "33",
            paddingBottom: "env(safe-area-inset-bottom)",
          },
        },
        React.createElement(
          "button",
          {
            onClick: function () { setSheetOpen(!sheetOpen); },
            style: {
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "10px 12px",
              background: "transparent",
              border: 0,
              color: "#d8f7c8",
              fontFamily: "'Share Tech Mono', monospace",
              textAlign: "left",
            },
          },
          React.createElement("span", {
            style: { fontSize: 13, fontWeight: 900, color: modeMeta.color, letterSpacing: 1, textTransform: "uppercase", flexShrink: 0 },
          }, modeMeta.icon + " " + modeMeta.label),
          React.createElement("span", {
            style: {
              flex: 1,
              fontSize: 10,
              color: "#9fd69b",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
          }, props.summary || ""),
          React.createElement("span", { style: { fontSize: 12, color: "#8fcf91", flexShrink: 0 } }, sheetOpen ? "▼" : "▲"),
        ),
        sheetOpen && React.createElement(
          "div",
          {
            className: "hh-ios-sheet-body", // max-height in warroom-game.css (dvh + vh fallback)
            style: {
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              padding: "0 10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            },
          },
          props.stats && props.stats.length > 0 && React.createElement("div", {
            style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 },
          }, props.stats.map(statBox)),
          (props.pickers || []).map(pickerBox),
          props.actions && props.actions.length > 0 && React.createElement("div", {
            style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 },
          }, props.actions.map(actionButton)),
          props.hint && React.createElement("div", {
            style: {
              fontSize: 10,
              color: "#9fd69b",
              lineHeight: 1.45,
              paddingTop: 6,
              borderTop: "1px solid rgba(143,207,145,0.2)",
            },
          }, props.hint),
        ),
      ),
    );
  }

  window.IOSTacticalMap = IOSTacticalMap;
})();
