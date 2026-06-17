// ─────────────────────────────────────────────────────────────────────────
// 23-unit-trainer.js — Custom in-browser unit recognizer + training UI
//
// Trains a unit-recognition model entirely in the browser using transfer
// learning: MobileNet (pretrained feature extractor) + a KNN classifier on
// top — the "Teachable Machine" approach. The player adds labeled photos of
// each unit; recognition then runs offline with no API and no cost.
//
// TensorFlow.js + the model are LAZY-LOADED on first use so they never slow
// the app's normal boot.
//
// Exposes two globals:
//   HHUnitRecognizer — the model/persistence engine (plain object).
//   HHTrainerPanel   — React component for the "TRAIN AI" tab.
//                      Props: goToPhase(phaseId)
//
// The trained dataset is saved in IndexedDB (db: "hh-unit-trainer"), so it
// survives reloads and is never written into the app's source files.
// ─────────────────────────────────────────────────────────────────────────

// ============================== Recognizer ===============================
var HHUnitRecognizer = (function () {
  var TFJS_URL = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
  var MOBILENET_URL = "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js";
  var KNN_URL = "https://cdn.jsdelivr.net/npm/@tensorflow-models/knn-classifier@1.2.4/dist/knn-classifier.min.js";

  var DB_NAME = "hh-unit-trainer";
  var STORE = "kv";
  var DATA_KEY = "knn-dataset";
  var COUNT_KEY = "knn-counts"; // mirror of per-label counts, for fast UI before TF loads

  var _mnet = null;
  var _classifier = null;
  var _loaded = false;
  var _loadingPromise = null;
  var _statusCb = null;

  // ---- tiny IndexedDB key/value helpers ----
  function openDB() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        req.result.createObjectStore(STORE);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function idbGet(key) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readonly");
        var r = tx.objectStore(STORE).get(key);
        r.onsuccess = function () { resolve(r.result); };
        r.onerror = function () { reject(r.error); };
      });
    });
  }
  function idbSet(key, val) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(val, key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function setStatus(s) { if (_statusCb) _statusCb(s); }
  function onStatus(cb) { _statusCb = cb; }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error("Failed to load " + src)); };
      document.head.appendChild(s);
    });
  }

  function loadImage(dataUrl) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error("Bad image data")); };
      img.src = dataUrl;
    });
  }

  function ensureLoaded() {
    if (_loaded) return Promise.resolve();
    if (_loadingPromise) return _loadingPromise;
    _loadingPromise = (async function () {
      setStatus("Loading TensorFlow.js…");
      if (!window.tf) await loadScript(TFJS_URL);
      setStatus("Loading MobileNet model…");
      if (!window.mobilenet) await loadScript(MOBILENET_URL);
      if (!window.knnClassifier) await loadScript(KNN_URL);
      _mnet = await window.mobilenet.load();
      _classifier = window.knnClassifier.create();
      setStatus("Restoring saved training…");
      await restore();
      _loaded = true;
      setStatus("Ready.");
    })();
    return _loadingPromise;
  }

  async function restore() {
    try {
      var obj = await idbGet(DATA_KEY);
      if (obj && _classifier) {
        var dataset = {};
        Object.keys(obj).forEach(function (label) {
          dataset[label] = window.tf.tensor(obj[label].data, obj[label].shape);
        });
        _classifier.setClassifierDataset(dataset);
      }
    } catch (e) { /* no saved data yet */ }
  }

  async function save() {
    if (!_classifier) return;
    var dataset = _classifier.getClassifierDataset();
    var obj = {};
    var counts = {};
    Object.keys(dataset).forEach(function (label) {
      var t = dataset[label];
      obj[label] = { data: Array.from(t.dataSync()), shape: t.shape };
      counts[label] = t.shape[0];
    });
    await idbSet(DATA_KEY, obj);
    await idbSet(COUNT_KEY, counts);
  }

  // Per-label example counts (works only once TF is loaded).
  function classCounts() {
    if (!_classifier) return {};
    return _classifier.getClassExampleCount();
  }
  function totalExamples() {
    var c = classCounts();
    return Object.keys(c).reduce(function (n, k) { return n + c[k]; }, 0);
  }
  // Fast count read from IndexedDB mirror (before TF is loaded), for the
  // Photo ID tab to decide whether a custom model exists.
  async function savedClassCounts() {
    try { return (await idbGet(COUNT_KEY)) || {}; } catch (e) { return {}; }
  }

  async function addExampleFromDataUrl(dataUrl, label) {
    await ensureLoaded();
    var img = await loadImage(dataUrl);
    var embedding = _mnet.infer(img, true);
    _classifier.addExample(embedding, label);
    embedding.dispose();
  }

  async function classifyDataUrl(dataUrl) {
    await ensureLoaded();
    if (totalExamples() === 0) return null;
    var img = await loadImage(dataUrl);
    var embedding = _mnet.infer(img, true);
    var res = await _classifier.predictClass(embedding, 5);
    embedding.dispose();
    return {
      label: res.label,
      confidence: res.confidences[res.label],
      confidences: res.confidences,
    };
  }

  async function removeClass(label) {
    await ensureLoaded();
    if (_classifier.getClassExampleCount()[label]) {
      _classifier.clearClass(label);
      await save();
    }
  }

  async function clearAll() {
    await ensureLoaded();
    _classifier.clearAllClasses();
    await idbSet(DATA_KEY, {});
    await idbSet(COUNT_KEY, {});
  }

  return {
    ensureLoaded: ensureLoaded,
    isLoaded: function () { return _loaded; },
    onStatus: onStatus,
    classCounts: classCounts,
    totalExamples: totalExamples,
    savedClassCounts: savedClassCounts,
    addExampleFromDataUrl: addExampleFromDataUrl,
    classifyDataUrl: classifyDataUrl,
    removeClass: removeClass,
    clearAll: clearAll,
    save: save,
  };
})();

// ============================== Trainer UI ===============================
var HHTrainerPanel = (function () {
  var h = React.createElement;
  var GREEN = "#00ff41", GREEN_DIM = "#00cc33", GREEN_LINE = "#00aa2a";
  var BG = "#020802", BG2 = "#041204", AMBER = "#ccaa00", RED = "#cc3a3a";
  var MONO = "'Share Tech Mono', monospace";

  function flattenUnits() {
    var out = [];
    if (typeof UNIT_PRESETS === "undefined" || !Array.isArray(UNIT_PRESETS)) return out;
    UNIT_PRESETS.forEach(function (cat) {
      (cat.units || []).forEach(function (u) { out.push(Object.assign({}, u, { category: cat.category })); });
    });
    return out;
  }
  function panel(children, extra) {
    return h("div", { style: Object.assign({ background: BG2, border: "1px solid " + GREEN_LINE, borderRadius: 4, padding: 16, marginBottom: 16 }, extra || {}) }, children);
  }
  function sectionTitle(t) {
    return h("div", { style: { fontFamily: MONO, color: GREEN, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, textShadow: "0 0 6px " + GREEN } }, t);
  }
  function btn(label, onClick, opts) {
    opts = opts || {};
    return h("button", {
      onClick: onClick, disabled: !!opts.disabled,
      style: {
        padding: opts.small ? "6px 10px" : "10px 16px",
        background: opts.primary ? "rgba(0,255,65,0.10)" : "transparent",
        border: "1px solid " + (opts.danger ? RED : GREEN_LINE),
        color: opts.disabled ? "#0a5" : (opts.danger ? RED : GREEN),
        opacity: opts.disabled ? 0.4 : 1, fontFamily: MONO, fontSize: opts.small ? 11 : 13,
        letterSpacing: 1, cursor: opts.disabled ? "not-allowed" : "pointer", borderRadius: 3, whiteSpace: "nowrap",
      },
    }, label);
  }

  return function HHTrainerPanel(props) {
    var goToPhase = props.goToPhase || function () {};
    var flatUnits = useMemo(flattenUnits, []);

    var st = useState("Idle.");                 var status = st[0], setStatus = st[1];
    var ld = useState(false);                    var ready = ld[0], setReady = ld[1];
    var qs = useState("");                       var query = qs[0], setQuery = qs[1];
    var pk = useState(null);                      var activeUnit = pk[0], setActiveUnit = pk[1];
    var cc = useState({});                        var counts = cc[0], setCounts = cc[1];
    var busy = useState(false);                   var working = busy[0], setWorking = busy[1];
    var cam = useState(false);                    var cameraOn = cam[0], setCameraOn = cam[1];
    var camErr = useState("");                    var cameraErr = camErr[0], setCameraErr = camErr[1];
    var lastN = useState(0);                      var lastAdded = lastN[0], setLastAdded = lastN[1];

    var videoRef = useRef(null);
    var streamRef = useRef(null);
    var fileRef = useRef(null);

    function refreshCounts() { setCounts(Object.assign({}, HHUnitRecognizer.classCounts())); }

    useEffect(function () {
      HHUnitRecognizer.onStatus(setStatus);
      HHUnitRecognizer.ensureLoaded().then(function () {
        setReady(true);
        refreshCounts();
      }).catch(function (e) { setStatus("Load failed: " + (e && e.message || e)); });
      return function () { stopCamera(); };
    }, []);

    function stopCamera() {
      if (streamRef.current) { streamRef.current.getTracks().forEach(function (t) { t.stop(); }); streamRef.current = null; }
      setCameraOn(false);
    }

    function readFileDataUrl(file) {
      return new Promise(function (resolve) {
        var r = new FileReader();
        r.onload = function (e) { resolve(e.target.result); };
        r.readAsDataURL(file);
      });
    }

    async function addFiles(fileList) {
      if (!activeUnit) { setStatus("Pick a unit first."); return; }
      if (!fileList || !fileList.length) return;
      setWorking(true);
      var added = 0;
      for (var i = 0; i < fileList.length; i++) {
        try {
          var url = await readFileDataUrl(fileList[i]);
          await HHUnitRecognizer.addExampleFromDataUrl(url, activeUnit.id);
          added++;
          setStatus("Added " + added + "/" + fileList.length + " photo(s) for " + activeUnit.name + "…");
        } catch (e) { /* skip bad file */ }
      }
      await HHUnitRecognizer.save();
      refreshCounts();
      setLastAdded(added);
      setStatus("Saved. " + added + " photo(s) added for " + activeUnit.name + ".");
      setWorking(false);
    }

    async function startCamera() {
      setCameraErr("");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setCameraErr("Camera unavailable — use Upload."); return; }
      try {
        var stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        streamRef.current = stream; setCameraOn(true);
        setTimeout(function () { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(function () {}); } }, 50);
      } catch (e) { setCameraErr("Camera access denied. Use Upload."); }
    }

    async function snap() {
      if (!activeUnit) { setStatus("Pick a unit first."); return; }
      var v = videoRef.current; if (!v) return;
      var w = v.videoWidth || 640, ht = v.videoHeight || 480;
      var canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = ht;
      canvas.getContext("2d").drawImage(v, 0, 0, w, ht);
      var url = canvas.toDataURL("image/jpeg", 0.9);
      setWorking(true);
      try {
        await HHUnitRecognizer.addExampleFromDataUrl(url, activeUnit.id);
        await HHUnitRecognizer.save();
        refreshCounts();
        setStatus("Snapped & saved a photo for " + activeUnit.name + ".");
      } catch (e) { setStatus("Failed: " + (e && e.message || e)); }
      setWorking(false);
    }

    async function removeClass(label) {
      setWorking(true);
      await HHUnitRecognizer.removeClass(label);
      refreshCounts();
      setWorking(false);
    }
    async function clearAll() {
      setWorking(true);
      await HHUnitRecognizer.clearAll();
      refreshCounts();
      setStatus("All training data cleared.");
      setWorking(false);
    }

    var searchResults = useMemo(function () {
      var q = query.toLowerCase().trim();
      if (!q) return [];
      return flatUnits.filter(function (u) {
        return (u.name || "").toLowerCase().indexOf(q) !== -1 || (u.category || "").toLowerCase().indexOf(q) !== -1;
      }).slice(0, 8);
    }, [query, flatUnits]);

    var classLabels = Object.keys(counts);
    var totalSamples = classLabels.reduce(function (n, k) { return n + counts[k]; }, 0);
    function unitName(id) { var u = flatUnits.find(function (x) { return x.id === id; }); return u ? u.name : id; }

    var children = [];

    // intro
    children.push(h("div", { key: "intro", style: { marginBottom: 16 } },
      h("div", { style: { fontFamily: "'VT323', monospace", fontSize: 30, color: GREEN, letterSpacing: 3, textShadow: "0 0 10px " + GREEN, lineHeight: 1.1 } }, "🧠 TEACH THE COGITATOR"),
      h("div", { style: { fontFamily: MONO, fontSize: 12, color: GREEN_DIM, marginTop: 6, maxWidth: 660, lineHeight: 1.5 } },
        "Add labeled photos of your units and the app learns to recognize them — running entirely on your device, no API, no cost. Aim for 15–30 photos per unit from different angles, distances and lighting. Training is saved automatically.")
    ));

    // status
    children.push(h("div", { key: "status", style: { fontFamily: MONO, fontSize: 11.5, color: ready ? GREEN_DIM : AMBER, marginBottom: 12 } },
      (ready ? "● Model ready · " : "◌ ") + status + (totalSamples ? ("  ·  " + totalSamples + " sample(s), " + classLabels.length + " unit(s)") : "")));

    // 1. pick unit
    var pickInner = [sectionTitle("1 · Choose the unit to teach")];
    pickInner.push(h("input", {
      key: "search", type: "text", value: query, placeholder: "Search units by name…",
      onChange: function (e) { setQuery(e.target.value); setActiveUnit(null); },
      style: { width: "100%", boxSizing: "border-box", padding: "9px 10px", background: BG, border: "1px solid " + GREEN_LINE, color: GREEN, fontFamily: MONO, fontSize: 13, borderRadius: 3, marginBottom: 8 },
    }));
    if (!activeUnit && searchResults.length) {
      pickInner.push(h("div", { key: "res", style: { border: "1px solid " + GREEN_LINE, borderRadius: 3, maxHeight: 200, overflowY: "auto" } },
        searchResults.map(function (u, i) {
          return h("div", {
            key: u.id || i,
            onClick: function () { setActiveUnit(u); setQuery(u.name); },
            style: { padding: "8px 10px", cursor: "pointer", fontFamily: MONO, fontSize: 12.5, color: GREEN, borderBottom: i < searchResults.length - 1 ? "1px solid rgba(0,170,42,0.3)" : "none", display: "flex", justifyContent: "space-between", gap: 10 },
          }, h("span", null, u.name), h("span", { style: { color: GREEN_DIM, fontSize: 10.5 } }, u.category));
        })));
    }
    if (activeUnit) {
      pickInner.push(h("div", { key: "active", style: { fontFamily: MONO, fontSize: 13, color: GREEN, marginTop: 4 } },
        "✓ Teaching: " + activeUnit.name,
        h("span", { style: { color: GREEN_DIM, fontSize: 11, marginLeft: 8 } }, "(" + (counts[activeUnit.id] || 0) + " samples so far)")));
    }
    children.push(h("div", { key: "pick" }, panel(pickInner)));

    // 2. add photos
    var addInner = [sectionTitle("2 · Add photos")];
    if (cameraOn) {
      addInner.push(h("video", { key: "vid", ref: videoRef, autoPlay: true, playsInline: true, muted: true, style: { width: "100%", maxWidth: 420, borderRadius: 4, border: "1px solid " + GREEN_LINE, background: "#000", display: "block" } }));
      addInner.push(h("div", { key: "vb", style: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" } },
        btn(working ? "…" : "📸 Snap & Add", snap, { primary: true, disabled: working || !activeUnit }),
        btn("✕ Stop Camera", stopCamera, {})));
    } else {
      addInner.push(h("div", { key: "b", style: { display: "flex", gap: 8, flexWrap: "wrap" } },
        btn("📁 Upload Photos", function () { if (fileRef.current) fileRef.current.click(); }, { primary: true, disabled: !activeUnit || working }),
        btn("🎥 Use Camera", startCamera, { disabled: !activeUnit || working })));
      addInner.push(h("input", { key: "f", ref: fileRef, type: "file", accept: "image/*", multiple: true, capture: "environment", style: { display: "none" }, onChange: function (e) { addFiles(e.target.files); e.target.value = ""; } }));
    }
    if (!activeUnit) addInner.push(h("div", { key: "hint", style: { fontFamily: MONO, fontSize: 11, color: AMBER, marginTop: 8 } }, "Pick a unit above first."));
    if (cameraErr) addInner.push(h("div", { key: "ce", style: { fontFamily: MONO, fontSize: 11, color: AMBER, marginTop: 8 } }, "⚠ " + cameraErr));
    children.push(h("div", { key: "add" }, panel(addInner)));

    // 3. trained units
    var listInner = [sectionTitle("3 · Trained units")];
    if (!classLabels.length) {
      listInner.push(h("div", { key: "empty", style: { fontFamily: MONO, fontSize: 12, color: GREEN_DIM } }, "No units trained yet. The recognizer needs at least 2 different units (with several photos each) before it can tell them apart."));
    } else {
      listInner.push(h("div", { key: "rows" }, classLabels.map(function (lbl) {
        return h("div", { key: lbl, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderBottom: "1px solid rgba(0,170,42,0.25)", fontFamily: MONO, fontSize: 12.5, color: GREEN } },
          h("span", null, unitName(lbl), h("span", { style: { color: GREEN_DIM, marginLeft: 8, fontSize: 11 } }, counts[lbl] + " photos")),
          btn("Remove", function () { removeClass(lbl); }, { small: true, danger: true }));
      })));
      listInner.push(h("div", { key: "tools", style: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" } },
        btn("🎯 Go Identify", function () { goToPhase("photo_id"); }, { primary: true }),
        btn("🗑 Clear All Training", clearAll, { danger: true })));
      if (classLabels.length < 2) listInner.push(h("div", { key: "warn", style: { fontFamily: MONO, fontSize: 11, color: AMBER, marginTop: 10 } }, "⚠ Add at least one more unit — a classifier needs 2+ classes to compare."));
    }
    children.push(h("div", { key: "list" }, panel(listInner)));

    return h("div", { style: { fontFamily: MONO } }, children);
  };
})();
