// ─────────────────────────────────────────────────────────────────────────
// 22-photo-id.js — Photo Identification page
//
// Lets the player upload OR take a photo of a unit on the tabletop. A vision
// AI (wired in at the single integration point below) identifies the unit and
// counts the models. The player reviews / corrects the match, sets the model
// count, then loads it into the unit selectors used by all phases — choosing
// whether it becomes the Attacker or the Target each time.
//
// Exposes a single global: HHPhotoIdPage (React component).
// Props:
//   onLoadUnit(unit, count, slot)  — load a UNIT_PRESETS unit into the
//                                     selectors. slot is "attacker" | "target".
//   goToPhase(phaseId)             — jump to any toolkit tab afterwards.
// ─────────────────────────────────────────────────────────────────────────

// ===========================================================================
//  ⚙  AI INTEGRATION — OpenAI Vision (gpt-4o)
//
//  identifyUnitFromPhoto() sends the photo to OpenAI's vision model, asks it
//  to name the Horus Heresy unit + count the models, then fuzzy-matches the
//  returned name against the local unit list.
//
//  The API key is NOT stored in this file. The user pastes it into the
//  "AI Settings" panel in the Photo ID tab; it is saved only in the browser's
//  localStorage (key: HH_OPENAI_KEY_STORAGE) and sent directly to OpenAI.
//
//  Resolves to:
//    {
//      aiConfigured : boolean,        // false when no key is saved
//      count        : number | null,  // models counted by the AI
//      guesses      : [{ unitId, name, score }],  // local matches, best first
//      aiName       : string,         // raw name the AI returned (for display)
//      error        : string          // present on API/parse failure
//    }
//
//  Swapping providers (Claude / Gemini) means changing only the fetch below.
// ===========================================================================
var HH_OPENAI_KEY_STORAGE = "hh-openai-key";
var HH_OPENAI_MODEL = "gpt-4o";

function getStoredApiKey() {
  try { return localStorage.getItem(HH_OPENAI_KEY_STORAGE) || ""; } catch (e) { return ""; }
}
function setStoredApiKey(k) {
  try {
    if (k) localStorage.setItem(HH_OPENAI_KEY_STORAGE, k);
    else localStorage.removeItem(HH_OPENAI_KEY_STORAGE);
  } catch (e) {}
}

async function identifyUnitFromPhoto(imageDataUrl, flatUnits) {
  var key = getStoredApiKey();
  if (!key) return { aiConfigured: false, count: null, guesses: [], needKey: true };

  try {
    var resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key,
      },
      body: JSON.stringify({
        model: HH_OPENAI_MODEL,
        max_tokens: 300,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You identify Warhammer: The Horus Heresy (Age of Darkness, 3rd edition) miniatures from a photo. " +
              "Determine the single most likely unit type shown, and count how many individual models (miniatures) of that unit are visible. " +
              "Reply with ONLY a JSON object: {\"unit_name\": string, \"model_count\": integer, \"confidence\": number between 0 and 1}. " +
              "If unsure of the exact unit, give your best guess for unit_name.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify the unit and count the models in this photo." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      var errTxt = "";
      try { errTxt = await resp.text(); } catch (e) {}
      var msg = "OpenAI error " + resp.status;
      if (resp.status === 401) msg = "Invalid or revoked API key (401).";
      else if (resp.status === 429) msg = "Rate limit or quota exceeded (429).";
      else if (errTxt) msg += ": " + errTxt.slice(0, 180);
      return { aiConfigured: true, count: null, guesses: [], error: msg };
    }

    var data = await resp.json();
    var content =
      (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "{}";
    var parsed = {};
    try { parsed = JSON.parse(content); } catch (e) { parsed = {}; }

    var aiName = parsed.unit_name || "";
    var cnt = parseInt(parsed.model_count, 10);
    return {
      aiConfigured: true,
      count: isNaN(cnt) ? null : cnt,
      guesses: fuzzyMatchUnits(aiName, flatUnits).slice(0, 5),
      aiName: aiName,
    };
  } catch (e) {
    return {
      aiConfigured: true,
      count: null,
      guesses: [],
      error: "Request failed (" + String((e && e.message) || e) + "). If this is a CORS block, a small local proxy is needed.",
    };
  }
}

// Count-only OpenAI call — used when the custom in-browser model already
// recognized the unit, so we only need the model count. Returns { count, error }.
async function countModelsFromPhoto(imageDataUrl) {
  var key = getStoredApiKey();
  if (!key) return { count: null, error: "" };
  try {
    var resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
      body: JSON.stringify({
        model: HH_OPENAI_MODEL,
        max_tokens: 60,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Count how many individual miniatures (models) belonging to the single main unit are visible in the photo. Reply with ONLY JSON: {\"model_count\": integer}." },
          { role: "user", content: [
            { type: "text", text: "Count the models in this photo." },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ] },
        ],
      }),
    });
    if (!resp.ok) {
      var msg = "Count failed (OpenAI " + resp.status + ")";
      if (resp.status === 401) msg = "Count skipped — invalid API key (401).";
      return { count: null, error: msg };
    }
    var data = await resp.json();
    var content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "{}";
    var parsed = {};
    try { parsed = JSON.parse(content); } catch (e) {}
    var c = parseInt(parsed.model_count, 10);
    return { count: isNaN(c) ? null : c, error: "" };
  } catch (e) {
    return { count: null, error: "Count request failed (" + String((e && e.message) || e) + ")." };
  }
}

// Lightweight name → unit fuzzy matcher. Returned by the AI integration point
// once a real model name comes back; also powers the manual search box.
function fuzzyMatchUnits(query, flatUnits) {
  var q = String(query || "").toLowerCase().trim();
  if (!q) return [];
  var terms = q.split(/\s+/).filter(Boolean);
  var scored = flatUnits.map(function (u) {
    var name = String(u.name || "").toLowerCase();
    var cat = String(u.category || "").toLowerCase();
    var hay = name + " " + cat;
    var score = 0;
    if (name === q) score = 1;
    else if (name.indexOf(q) !== -1) score = 0.9;
    else {
      var hits = terms.filter(function (t) { return hay.indexOf(t) !== -1; }).length;
      score = terms.length ? (hits / terms.length) * 0.8 : 0;
    }
    return { unitId: u.id, name: u.name, category: u.category, score: score, _unit: u };
  });
  return scored
    .filter(function (s) { return s.score > 0; })
    .sort(function (a, b) { return b.score - a.score; });
}

var HHPhotoIdPage = (function () {
  var h = React.createElement;

  // ── theme tokens (match the CRT-terminal palette used app-wide) ──
  var GREEN = "#00ff41";
  var GREEN_DIM = "#00cc33";
  var GREEN_LINE = "#00aa2a";
  var BG = "#020802";
  var BG2 = "#041204";
  var AMBER = "#ccaa00";
  var RED = "#cc3a3a";
  var MONO = "'Share Tech Mono', monospace";

  function flattenUnits() {
    var out = [];
    if (typeof UNIT_PRESETS === "undefined" || !Array.isArray(UNIT_PRESETS)) return out;
    UNIT_PRESETS.forEach(function (cat) {
      (cat.units || []).forEach(function (u) {
        out.push(Object.assign({}, u, { category: cat.category }));
      });
    });
    return out;
  }

  function panel(children, extra) {
    return h("div", {
      style: Object.assign({
        background: BG2,
        border: "1px solid " + GREEN_LINE,
        borderRadius: 4,
        padding: 16,
        marginBottom: 16,
      }, extra || {}),
    }, children);
  }

  function sectionTitle(txt) {
    return h("div", {
      style: {
        fontFamily: MONO, color: GREEN, fontSize: 13, letterSpacing: 2,
        textTransform: "uppercase", marginBottom: 10,
        textShadow: "0 0 6px " + GREEN,
      },
    }, txt);
  }

  function btn(label, onClick, opts) {
    opts = opts || {};
    return h("button", {
      onClick: onClick,
      disabled: !!opts.disabled,
      style: {
        padding: opts.small ? "6px 10px" : "10px 16px",
        background: opts.primary ? "rgba(0,255,65,0.10)" : "transparent",
        border: "1px solid " + (opts.danger ? RED : GREEN_LINE),
        color: opts.disabled ? "#0a5" : (opts.danger ? RED : GREEN),
        opacity: opts.disabled ? 0.4 : 1,
        fontFamily: MONO, fontSize: opts.small ? 11 : 13, letterSpacing: 1,
        cursor: opts.disabled ? "not-allowed" : "pointer",
        borderRadius: 3, whiteSpace: "nowrap",
        transition: "all 0.08s ease",
      },
    }, label);
  }

  function countBtnStyle() {
    return {
      width: 30, height: 30, background: "transparent",
      border: "1px solid " + GREEN_LINE, color: GREEN,
      fontFamily: MONO, fontSize: 16, cursor: "pointer", borderRadius: 3,
    };
  }

  // ───────────────────────────────────────────────────────────────────────
  // SlotPanel — one self-contained capture → identify → load flow bound to a
  // single slot ("attacker" or "target"). Two of these are rendered side by
  // side so the player can photograph each combatant independently.
  //   props: { slot, slotLabel, slotIcon, accent, flatUnits, onLoadUnit, goToPhase }
  // ───────────────────────────────────────────────────────────────────────
  function SlotPanel(props) {
    var slot = props.slot;                 // "attacker" | "target"
    var slotLabel = props.slotLabel;       // "ATTACKER" | "TARGET"
    var slotIcon = props.slotIcon;         // "⚔" | "🎯"
    var accent = props.accent || GREEN;
    var flatUnits = props.flatUnits || [];
    var onLoadUnit = props.onLoadUnit || function () {};
    var goToPhase = props.goToPhase || function () {};

    var imgState = useState(null);            var imageData = imgState[0], setImageData = imgState[1];
    var camState = useState(false);           var cameraOn = camState[0], setCameraOn = camState[1];
    var busyState = useState(false);          var analysing = busyState[0], setAnalysing = busyState[1];
    var resState = useState(null);            var aiResult = resState[0], setAiResult = resState[1];
    var qState = useState("");                var query = qState[0], setQuery = qState[1];
    var pickState = useState(null);           var picked = pickState[0], setPicked = pickState[1];
    var countState = useState(1);             var count = countState[0], setCount = countState[1];
    var loadedState = useState(false);        var loaded = loadedState[0], setLoaded = loadedState[1];
    var errState = useState("");              var camError = errState[0], setCamError = errState[1];

    var videoRef = useRef(null);
    var streamRef = useRef(null);
    var fileRef = useRef(null);

    // ── stop the camera stream on unmount ──
    useEffect(function () {
      return function () { stopCamera(); };
    }, []);

    function stopCamera() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(function (t) { t.stop(); });
        streamRef.current = null;
      }
      setCameraOn(false);
    }

    function resetAll() {
      setImageData(null); setAiResult(null); setPicked(null);
      setQuery(""); setCount(1); setLoaded(false);
    }

    function onFile(file) {
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        stopCamera();
        resetAll();
        setImageData(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    async function startCamera() {
      setCamError("");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCamError("Camera not available — use Upload / Take Photo instead.");
        return;
      }
      try {
        var stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } }, audio: false,
        });
        streamRef.current = stream;
        setCameraOn(true);
        setTimeout(function () {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(function () {});
          }
        }, 50);
      } catch (err) {
        setCamError("Camera access denied or unavailable. Use Upload / Take Photo instead.");
      }
    }

    function captureFrame() {
      var v = videoRef.current;
      if (!v) return;
      var w = v.videoWidth || 640, ht = v.videoHeight || 480;
      var canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = ht;
      canvas.getContext("2d").drawImage(v, 0, 0, w, ht);
      var data = canvas.toDataURL("image/jpeg", 0.9);
      stopCamera();
      resetAll();
      setImageData(data);
    }

    var CUSTOM_CONFIDENCE_MIN = 0.6;

    async function runIdentify() {
      if (!imageData) return;
      setAnalysing(true);
      setAiResult(null);
      try {
        // ── 1. Try the custom in-browser model first ──
        var customMatch = null, customConf = 0;
        var hasCustom = typeof HHUnitRecognizer !== "undefined" && HHUnitRecognizer.totalExamples() > 0;
        if (!hasCustom && typeof HHUnitRecognizer !== "undefined") {
          // model not loaded into memory yet — check the saved mirror
          try { var saved = await HHUnitRecognizer.savedClassCounts(); hasCustom = Object.keys(saved || {}).length > 0; } catch (e) {}
        }
        if (hasCustom) {
          try {
            var c = await HHUnitRecognizer.classifyDataUrl(imageData);
            if (c) {
              customConf = c.confidence || 0;
              var u = flatUnits.find(function (x) { return x.id === c.label; });
              if (u && customConf >= CUSTOM_CONFIDENCE_MIN) customMatch = { unit: u, conf: customConf };
            }
          } catch (e) { /* fall through to OpenAI */ }
        }

        var key = getStoredApiKey();

        if (customMatch) {
          // Recognized locally. Use OpenAI only to count (if a key is saved).
          setPicked(customMatch.unit);
          setQuery(customMatch.unit.name);
          var count1 = customMatch.unit.models || 1, countErr = "";
          if (key) {
            var cr = await countModelsFromPhoto(imageData);
            if (cr.count != null) count1 = cr.count;
            if (cr.error) countErr = cr.error;
          }
          setCount(count1);
          setAiResult({
            aiConfigured: true, source: "custom",
            count: count1, guesses: [{ unitId: customMatch.unit.id, name: customMatch.unit.name, score: customMatch.conf }],
            aiName: customMatch.unit.name, error: countErr,
          });
        } else {
          // ── 2. Fall back to OpenAI vision for recognition (returns count too) ──
          var res = await identifyUnitFromPhoto(imageData, flatUnits);
          res.source = res.aiConfigured ? "openai" : "none";
          if (hasCustom && res.source === "none") {
            res = { aiConfigured: true, source: "custom-lowconf", count: null, guesses: [], aiName: "", error: "" };
          }
          setAiResult(res);
          if (res && res.count != null) setCount(res.count);
          if (res && res.guesses && res.guesses.length) {
            var top = res.guesses[0];
            var match = flatUnits.find(function (uu) { return uu.id === top.unitId; });
            if (match) { setPicked(match); setQuery(match.name); }
          }
        }
      } catch (e) {
        setAiResult({ aiConfigured: false, count: null, guesses: [], error: String(e && e.message || e) });
      } finally {
        setAnalysing(false);
      }
    }

    function doLoad() {
      if (!picked) return;
      var n = Math.max(1, parseInt(count, 10) || 1);
      onLoadUnit(picked, n, slot);
      setLoaded(true);
    }

    // ── search results for the manual picker ──
    var searchResults = useMemo(function () {
      if (!query.trim()) return [];
      return fuzzyMatchUnits(query, flatUnits).slice(0, 8);
    }, [query, flatUnits]);

    var rows = [];

    // ── slot header ──
    rows.push(h("div", {
      key: "slothead",
      style: {
        fontFamily: "'VT323', monospace", fontSize: 22, color: accent,
        letterSpacing: 2, textShadow: "0 0 8px " + accent, marginBottom: 12,
        borderBottom: "1px solid " + accent, paddingBottom: 8,
      },
    }, slotIcon + " " + slotLabel));

    // ── 1. Capture ──
    var captureInner = [];
    captureInner.push(sectionTitle("1 · Capture"));

    if (cameraOn) {
      captureInner.push(h("video", {
        key: "vid", ref: videoRef, autoPlay: true, playsInline: true, muted: true,
        style: { width: "100%", maxWidth: 480, borderRadius: 4, border: "1px solid " + GREEN_LINE, background: "#000", display: "block" },
      }));
      captureInner.push(h("div", { key: "vidbtns", style: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" } },
        btn("📸 Snap Photo", captureFrame, { primary: true }),
        btn("✕ Cancel", stopCamera, {})
      ));
    } else if (imageData) {
      captureInner.push(h("img", {
        key: "preview", src: imageData,
        style: { width: "100%", maxWidth: 480, borderRadius: 4, border: "1px solid " + GREEN_LINE, display: "block" },
      }));
      captureInner.push(h("div", { key: "imgbtns", style: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" } },
        btn(analysing ? "⌛ Analysing…" : "🔍 Identify Unit", runIdentify, { primary: true, disabled: analysing }),
        btn("↺ Clear", function () { resetAll(); }, { danger: true })
      ));
    } else {
      captureInner.push(h("div", {
        key: "drop",
        onDragOver: function (e) { e.preventDefault(); },
        onDrop: function (e) {
          e.preventDefault();
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
        },
        style: {
          border: "1px dashed " + GREEN_LINE, borderRadius: 4, padding: "28px 16px",
          textAlign: "center", color: GREEN_DIM, fontFamily: MONO, fontSize: 12, marginBottom: 12,
        },
      }, "Drag a photo of the " + slotLabel.toLowerCase() + " here, or use the buttons below."));
      captureInner.push(h("div", { key: "capbtns", style: { display: "flex", gap: 8, flexWrap: "wrap" } },
        btn("📁 Upload / Take Photo", function () { if (fileRef.current) fileRef.current.click(); }, { primary: true }),
        btn("🎥 Use Camera", startCamera, {})
      ));
      captureInner.push(h("input", {
        key: "file", ref: fileRef, type: "file", accept: "image/*", capture: "environment",
        style: { display: "none" },
        onChange: function (e) { onFile(e.target.files && e.target.files[0]); },
      }));
      if (camError) captureInner.push(h("div", {
        key: "camerr", style: { color: AMBER, fontFamily: MONO, fontSize: 11, marginTop: 8 },
      }, "⚠ " + camError));
    }
    rows.push(h("div", { key: "cap" }, panel(captureInner)));

    // ── 2. Identify / manual select (only after a photo exists) ──
    if (imageData) {
      var idInner = [];
      idInner.push(sectionTitle("2 · Identify & Confirm"));

      if (aiResult && !aiResult.aiConfigured) {
        idInner.push(h("div", {
          key: "stub",
          style: {
            background: "rgba(204,170,0,0.08)", border: "1px solid " + AMBER, borderRadius: 3,
            padding: "10px 12px", color: AMBER, fontFamily: MONO, fontSize: 11.5, lineHeight: 1.5, marginBottom: 12,
          },
        }, "⚙ No OpenAI key saved — open AI Settings above to add one, or select the unit manually below."));
      }

      if (aiResult && aiResult.error) {
        idInner.push(h("div", {
          key: "aierr",
          style: {
            background: "rgba(204,58,58,0.10)", border: "1px solid " + RED, borderRadius: 3,
            padding: "10px 12px", color: RED, fontFamily: MONO, fontSize: 11.5, lineHeight: 1.5, marginBottom: 12,
          },
        }, "⚠ " + aiResult.error + " — you can still select the unit manually below."));
      }

      if (aiResult && aiResult.source === "custom-lowconf") {
        idInner.push(h("div", {
          key: "lowconf",
          style: {
            background: "rgba(204,170,0,0.08)", border: "1px solid " + AMBER, borderRadius: 3,
            padding: "10px 12px", color: AMBER, fontFamily: MONO, fontSize: 11.5, lineHeight: 1.5, marginBottom: 12,
          },
        }, "🧠 Your trained model wasn't confident, and OpenAI recognition isn't available. Select the unit manually below — or add more training photos for this unit in the TRAIN AI tab."));
      }

      if (aiResult && aiResult.aiConfigured && !aiResult.error && aiResult.aiName) {
        var srcTag = aiResult.source === "custom" ? "🧠 trained model" : "☁ OpenAI";
        idInner.push(h("div", {
          key: "ainame",
          style: { fontFamily: MONO, fontSize: 11.5, color: GREEN_DIM, marginBottom: 10 },
        }, srcTag + " read: \"" + aiResult.aiName + "\"" + (aiResult.count != null ? (" · " + aiResult.count + " model(s)") : "")));
      }

      if (aiResult && aiResult.aiConfigured && aiResult.guesses && aiResult.guesses.length) {
        idInner.push(h("div", { key: "aig", style: { marginBottom: 12 } },
          h("div", { style: { fontFamily: MONO, fontSize: 11, color: GREEN_DIM, marginBottom: 6 } }, "AI matches:"),
          h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
            aiResult.guesses.map(function (g) {
              return btn(g.name + " (" + Math.round(g.score * 100) + "%)", function () {
                var u = flatUnits.find(function (x) { return x.id === g.unitId; });
                if (u) { setPicked(u); setQuery(u.name); }
              }, { small: true, primary: picked && picked.id === g.unitId });
            })
          )
        ));
      }

      // Manual search box
      idInner.push(h("input", {
        key: "search", type: "text", value: query,
        placeholder: "Search units by name…",
        onChange: function (e) { setQuery(e.target.value); setPicked(null); },
        style: {
          width: "100%", boxSizing: "border-box", padding: "9px 10px",
          background: BG, border: "1px solid " + GREEN_LINE, color: GREEN,
          fontFamily: MONO, fontSize: 13, borderRadius: 3, marginBottom: 8,
        },
      }));

      if (!picked && searchResults.length) {
        idInner.push(h("div", {
          key: "results",
          style: { border: "1px solid " + GREEN_LINE, borderRadius: 3, maxHeight: 220, overflowY: "auto", marginBottom: 12 },
        }, searchResults.map(function (r, i) {
          var u = r._unit;
          return h("div", {
            key: r.unitId || i,
            onClick: function () { setPicked(u); setQuery(u.name); if (u.models) setCount(u.models); },
            style: {
              padding: "8px 10px", cursor: "pointer", fontFamily: MONO, fontSize: 12.5,
              color: GREEN, borderBottom: i < searchResults.length - 1 ? "1px solid rgba(0,170,42,0.3)" : "none",
              display: "flex", justifyContent: "space-between", gap: 10,
            },
          },
            h("span", null, u.name),
            h("span", { style: { color: GREEN_DIM, fontSize: 10.5 } }, u.category)
          );
        })));
      }

      if (picked) {
        idInner.push(h("div", {
          key: "picked",
          style: {
            background: "rgba(0,255,65,0.06)", border: "1px solid " + GREEN_LINE, borderRadius: 3,
            padding: "10px 12px", marginBottom: 12,
          },
        },
          h("div", { style: { fontFamily: MONO, fontSize: 13, color: GREEN, marginBottom: 8 } },
            "✓ " + picked.name,
            h("span", { style: { color: GREEN_DIM, fontSize: 10.5, marginLeft: 8 } }, picked.category)
          ),
          h("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
            h("label", { style: { fontFamily: MONO, fontSize: 11.5, color: GREEN_DIM } }, "Model count:"),
            h("button", { onClick: function () { setCount(Math.max(1, (parseInt(count, 10) || 1) - 1)); }, style: countBtnStyle() }, "−"),
            h("input", {
              type: "number", min: 1, value: count,
              onChange: function (e) { setCount(e.target.value); },
              style: {
                width: 64, padding: "6px 8px", textAlign: "center",
                background: BG, border: "1px solid " + GREEN_LINE, color: GREEN,
                fontFamily: MONO, fontSize: 14, borderRadius: 3,
              },
            }),
            h("button", { onClick: function () { setCount((parseInt(count, 10) || 1) + 1); }, style: countBtnStyle() }, "+")
          )
        ));
      }
      rows.push(h("div", { key: "idp" }, panel(idInner)));

      // ── 3. Load into this slot ──
      if (picked) {
        var loadInner = [];
        loadInner.push(sectionTitle("3 · Load As " + slotLabel));
        loadInner.push(h("div", {
          key: "loadhint",
          style: { fontFamily: MONO, fontSize: 11.5, color: GREEN_DIM, marginBottom: 10, lineHeight: 1.5 },
        }, "Load this unit into the " + slotLabel + " slot. It stays loaded across the Shooting, Assault, Charge and other phases."));
        loadInner.push(h("div", { key: "loadbtns", style: { display: "flex", gap: 10, flexWrap: "wrap" } },
          btn(slotIcon + " Load as " + slotLabel, doLoad, { primary: true })
        ));

        if (loaded) {
          loadInner.push(h("div", {
            key: "loaded",
            style: {
              marginTop: 12, padding: "10px 12px", borderRadius: 3,
              background: "rgba(0,255,65,0.06)", border: "1px solid " + GREEN_LINE,
              fontFamily: MONO, fontSize: 12, color: GREEN,
            },
          },
            h("div", { style: { marginBottom: 8 } },
              "✓ Loaded " + count + "× " + picked.name + " as " + slotLabel + ". Jump to a phase:"),
            h("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
              btn("Shooting", function () { goToPhase("shooting"); }, { small: true }),
              btn("Assault", function () { goToPhase("assault"); }, { small: true }),
              btn("Movement", function () { goToPhase("movement"); }, { small: true }),
              btn("Army", function () { goToPhase("army_builder"); }, { small: true })
            )
          ));
        }
        rows.push(h("div", { key: "loadp" }, panel(loadInner)));
      }
    }

    return h("div", {
      style: {
        flex: "1 1 380px", minWidth: 300,
        border: "1px solid " + accent, borderRadius: 4, padding: 14,
        background: "rgba(0,0,0,0.15)",
      },
    }, rows);
  }

  return function HHPhotoIdPage(props) {
    var onLoadUnit = props.onLoadUnit || function () {};
    var goToPhase = props.goToPhase || function () {};

    var flatUnits = useMemo(flattenUnits, []);

    var keyState = useState(getStoredApiKey());        var savedKey = keyState[0], setSavedKey = keyState[1];
    var keyInputState = useState("");                  var keyInput = keyInputState[0], setKeyInput = keyInputState[1];
    var keyOpenState = useState(!getStoredApiKey());   var keyOpen = keyOpenState[0], setKeyOpen = keyOpenState[1];

    // ════════════════════════════ RENDER ════════════════════════════
    var children = [];

    // Header / intro
    children.push(h("div", { key: "intro", style: { marginBottom: 16 } },
      h("div", {
        style: {
          fontFamily: "'VT323', monospace", fontSize: 30, color: GREEN,
          letterSpacing: 3, textShadow: "0 0 10px " + GREEN, lineHeight: 1.1,
        },
      }, "📷 UNIT RECOGNITION"),
      h("div", {
        style: { fontFamily: MONO, fontSize: 12, color: GREEN_DIM, marginTop: 6, maxWidth: 720, lineHeight: 1.5 },
      }, "Photograph each combatant separately — one picture for the Attacker, one for the Target. Your trained on-device model recognizes the unit first; OpenAI is the recognition fallback and handles model counting. Each result loads into the selectors used by every phase."),
      h("div", { style: { marginTop: 10 } },
        btn("🧠 Teach the AI a new unit", function () { goToPhase("train_ai"); }, { small: true }))
    ));

    // ── AI Settings (API key) — shared by both slots ──
    function maskKey(k) {
      if (!k) return "";
      if (k.length <= 12) return k.slice(0, 4) + "…";
      return k.slice(0, 8) + "…" + k.slice(-4);
    }
    var keyInner = [];
    keyInner.push(h("div", {
      key: "khead",
      onClick: function () { setKeyOpen(!keyOpen); },
      style: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        cursor: "pointer",
      },
    },
      h("span", { style: { fontFamily: MONO, color: GREEN, fontSize: 13, letterSpacing: 2, textTransform: "uppercase" } },
        "⚙ AI Settings"),
      h("span", { style: { fontFamily: MONO, fontSize: 11, color: savedKey ? GREEN_DIM : AMBER } },
        savedKey ? ("Key saved · " + maskKey(savedKey) + "  ▾") : "No key — click to add  ▾")
    ));
    if (keyOpen) {
      keyInner.push(h("div", { key: "kbody", style: { marginTop: 12 } },
        h("div", { style: { fontFamily: MONO, fontSize: 11.5, color: GREEN_DIM, lineHeight: 1.5, marginBottom: 8 } },
          "Paste your OpenAI API key (model gpt-4o). It is stored only in this browser and sent directly to OpenAI — never saved in the app's files. Set a spend cap on the key in your OpenAI dashboard."),
        h("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" } },
          h("input", {
            type: "password", value: keyInput, placeholder: savedKey ? "Replace saved key…" : "sk-…",
            onChange: function (e) { setKeyInput(e.target.value); },
            style: {
              flex: "1 1 320px", minWidth: 200, padding: "9px 10px",
              background: BG, border: "1px solid " + GREEN_LINE, color: GREEN,
              fontFamily: MONO, fontSize: 12, borderRadius: 3,
            },
          }),
          btn("Save Key", function () {
            var k = (keyInput || "").trim();
            if (!k) return;
            setStoredApiKey(k); setSavedKey(k); setKeyInput(""); setKeyOpen(false);
          }, { primary: true, disabled: !keyInput.trim() }),
          savedKey && btn("Remove", function () {
            setStoredApiKey(""); setSavedKey(""); setKeyInput("");
          }, { danger: true })
        )
      ));
    }
    children.push(h("div", { key: "keyp" }, panel(keyInner)));

    // ── Two independent capture flows, side by side ──
    children.push(h("div", {
      key: "slots",
      style: { display: "flex", flexDirection: "column", gap: 16, alignItems: "stretch" },
    },
      h(SlotPanel, {
        key: "attacker", slot: "attacker", slotLabel: "ATTACKER", slotIcon: "⚔",
        accent: GREEN, flatUnits: flatUnits, onLoadUnit: onLoadUnit, goToPhase: goToPhase,
      }),
      h(SlotPanel, {
        key: "target", slot: "target", slotLabel: "TARGET", slotIcon: "🎯",
        accent: AMBER, flatUnits: flatUnits, onLoadUnit: onLoadUnit, goToPhase: goToPhase,
      })
    ));

    return h("div", { style: { fontFamily: MONO } }, children);
  };
})();
