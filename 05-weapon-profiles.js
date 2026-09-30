// Legion weapon profiles, merged lookup
// Lines 1053-1164 from shooting-resolver165.jsx

// ━━━ LEGION-SPECIFIC SHOOTING WEAPON PROFILES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Added for Liber Astartes unit shooting weapons
var LEGION_WEAPON_PROFILES = {
  // I Dark Angels
  deathwing_comp: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  dreadwing_inter: [
    { name: "Phospex Bomb", shots: 1, s: 5, ap: "4", damage: 1, type: "Assault", rules: { blast: true } },
    { name: "Incinerator Pistol", shots: 1, s: 5, ap: "4", damage: 1, type: "Pistol", rules: { template: true } },
  ],
  // III Emperor's Children
  kakophoni: [
    { name: "Sonic Shrieker", shots: 3, s: 4, ap: "4", damage: 1, type: "Assault", rules: { pinning: true, stun: true } },
  ],
  // IV Iron Warriors
  tyrant_siege_term: [
    { name: "Tyrant Rocket Launcher", shots: 1, s: 9, ap: "3", damage: 1, type: "Heavy", rules: { breaching5: true } },
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
  ],
  // VI Space Wolves  
  grey_slayer: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  // VII Imperial Fists
  phalanx_warder: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
  ],
  templar_brethren: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  // VIII Night Lords
  night_raptor: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  executioner_nl: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
  ],
  contekar: [
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
  ],
  // IX Blood Angels
  dawnbreaker: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  dawnbreaker_cohort: [
    { name: "Grenade Discharger (Frag)", shots: 1, s: 4, ap: "6", damage: 1, type: "Assault", rules: { blast: true } },
    { name: "Grenade Discharger (Krak)", shots: 1, s: 6, ap: "4", damage: 1, type: "Assault", rules: {} },
  ],
  erelim: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  // XI: Ultramarines
  invictarus_suz: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  praetorian_um: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
  ],
  // XIV Death Guard
  deathshroud: [
    { name: "Alchem Flamer", shots: 1, s: 4, ap: "5", damage: 1, type: "Assault", rules: { template: true, poisoned2: true } },
  ],
  grave_warden: [
    { name: "Assault Grenade Launcher", shots: 2, s: 6, ap: "4", damage: 2, type: "Assault", rules: { blast: true, poisoned: true } },
  ],
  // XV Thousand Sons
  sekhmet: [
    { name: "Inferno Bolter", shots: 2, s: 4, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true } },
  ],
  // XVI Sons of Horus
  justaerin: [
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Plasma Blaster (Sustained)", shots: 2, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true } },
    { name: "Plasma Blaster (Maximal)", shots: 2, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true } },
  ],
  reaver_soh: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  // XVII Word Bearers
  dark_brethren: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  incendiary_wb: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
  ],
  // XIX Raven Guard
  dark_fury_rg: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  mor_deythan: [
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
  ],
  // XX Alpha Legion
  lernaean: [
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true } },
  ],
  headhunter: [
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Disintegrator Blaster", shots: 1, s: 5, ap: "2", damage: 2, type: "Assault", rules: { getshot: true } },
  ],
};

// ━━━ MERGED WEAPON PROFILE LOOKUP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Returns shooting weapon profiles for a unit, checking both the core and legion tables
function getRangedWeapons(unitId) {
  return WEAPON_PROFILES[unitId] || LEGION_WEAPON_PROFILES[unitId] || [];
}

// Returns melee weapon profiles for a unit from MELEE_WEAPON_PROFILES
function MELEE_getRangedWeapons(unitId) {
  return MELEE_WEAPON_PROFILES[unitId] || [];
}


// ━━━ WEAPON RANGE LOOKUP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Weapon profiles carry no range field, so ranges are resolved by name:
//   1. an explicit `range` on the weapon object (number or string) wins;
//   2. official 3rd-Ed ranges parsed from HELP_WEAPON_ARMOURY_ENTRIES
//      (15-main-app.js, read lazily on first call — load order is irrelevant);
//   3. WEAPON_RANGE_EXTRA below for names that armoury list lacks;
//   4. otherwise an estimate from the weapon type, flagged `estimated`.
// getWeaponRangeInfo(w) -> { label: '24"' | "T" | '15-45"', inches, template, estimated }
var WEAPON_RANGE_EXTRA = {
  "bolt pistol": "12", "hand flamer": "Template", "archaeotech pistol": "12",
  "plasma pistol": "12", "volkite serpenta": "10", "grav pistol": "12",
  "graviton pistol": "12", "needle pistol": "12", "flechette blaster": "12",
  "melta gun": "12", "meltagun": "12", "plasma gun": "24", "volkite charger": "15",
  "volkite caliver": "30", "volkite culverin": "45", "grav gun": "18",
  "grenade launcher": "24", "combi melta": "12", "combi plasma": "24",
  "combi flamer": "Template", "combi volkite": "15", "combi grav": "18",
  "combi disintegrator": "24", "combi grenade launcher": "24",
  "missile l": "48", "missile launcher": "48", "cyclone missile launcher": "48",
  "assault cannon": "24", "kheres assault cannon": "24", "iliastus assault cannon": "24",
  "heavy bolter": "36", "autocannon": "48", "lascannon": "48", "multi melta": "24",
  "plasma cannon": "36", "rotor cannon": "24", "conversion beamer": "15-45",
  "conversion beam cannon": "15-45", "heavy conversion beam cannon": "15-45",
  "sonic shrieker": "12", "phospex bomb": "6", "phosphex bomb": "6",
  "grenade discharger": "12", "assault grenade launcher": "24",
  "incinerator pistol": "Template", "alchem flamer": "Template",
  "flamer": "Template", "heavy flamer": "Template", "flamestorm cannon": "Template",
  "tyrant rocket launcher": "48", "nemesis bolter": "48", "kraken bolter": "30",
  "combi bolter": "24", "twin bolter": "24", "bolter": "24",
  "frag grenades": "8", "krak grenades": "8", "infernus firebomb clusters": "Template",
  "fury of the legion": "24", "disintegrator blaster": "18", "disintegrator rifle": "24",
  "disintegrator pistol": "12", "heavy disintegrator": "24",
  "demolisher cannon": "24", "battle cannon": "48", "kratos battlecannon": "36",
  "predator cannon": "48", "neutron laser": "72", "turbo laser destructor": "96",
  "volkite macro saker": "45", "volkite saker": "25", "volkite carronade": "45",
  "whirlwind launcher": "48", "hyperios missile launcher": "48", "scorpius missile launcher": "48",
  "hunter killer missile": "48", "hellstrike missile": "48", "havoc launcher": "48",
  "twin lascannon": "48", "twin autocannon": "48", "twin heavy bolter": "36",
  "graviton cannon": "36", "graviton gun": "18", "gravis autocannon": "48",
  "saturnine plasma bombard": "24", "saturnine plasma destroyer": "36",
  "adrasite spear": "12", "pyrithite spear": "12", "siege claw": "12",
  "battlecannon": "48", "battle cannon": "48", "earthshaker cannon": "240",
  "medusa mortar": "36", "multi laser": "36", "laspistol": "12", "lasrifle": "24",
  "las lock": "24", "laslock": "24", "sniper rifle": "36", "lightning gun": "36",
  "inferno pistol": "6", "kytan gatling cannon": "36", "kharybdis missile launcher": "18",
  "lastrum bolt cannon": "36", "lastrum storm bolter": "24", "mauler bolt cannon": "36",
  "guardian spear": "24", "sonic lance": "Template", "plasma burner": "Template",
  "plasma incinerator": "Template", "infernus incinerator": "Template",
  "irad cleanser": "Template", "grenade launcher frag": "24", "grenade launcher krak": "24",
};

function _wrNorm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\bmissile l\./g, "missile launcher")
    .replace(/\bgrenade l\./g, "grenade launcher")
    .replace(/\bml\b/g, "missile launcher")
    .replace(/\bmelta gun\b/g, "meltagun")
    .replace(/\bgrav gun\b/g, "graviton gun")
    .replace(/\s*\bx\s*\d+\b|\b\d+\s*x\b/g, " ")
    .replace(/[^a-z0-9<>]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

var _WEAPON_RANGE_INDEX = null;
function _buildWeaponRangeIndex() {
  var idx = {};
  var add = function (name, r) {
    var k = _wrNorm(name);
    if (k && idx[k] === undefined) idx[k] = r;
  };
  try {
    if (typeof HELP_WEAPON_ARMOURY_ENTRIES !== "undefined") {
      HELP_WEAPON_ARMOURY_ENTRIES.forEach(function (e) {
        var txt = e && e.text ? String(e.text) : "";
        // Ranged profiles only — melee entries reuse "Range" slot for IM
        if (!/Firepower/.test(txt) || /Firepower\s+A\b|Initiative Modifier/.test(txt)) return;
        var m = txt.match(/Range\s+([^,]+),/);
        if (!m) return;
        var r = m[1].trim();
        var title = String(e.title || "")
          .replace(/\s*\((Primary|Secondary)\)/i, " $1")
          .replace(/\*$/, "");
        add(title, r);
        // "Plasma gun - Sustained" also indexed as "Plasma gun"
        if (/ - /.test(title)) add(title.split(" - ")[0], r);
        (e.keywords || []).forEach(function (k) { add(k, r); });
      });
    }
  } catch (err) {}
  Object.keys(WEAPON_RANGE_EXTRA).forEach(function (k) { add(k, WEAPON_RANGE_EXTRA[k]); });
  return idx;
}

function _weaponRangeFromString(r, estimated) {
  var s = String(r).trim();
  if (/^t(emplate)?$/i.test(s)) {
    return { label: "T", inches: 8, template: true, estimated: !!estimated };
  }
  var nums = (s.match(/\d+(\.\d+)?/g) || []).map(Number);
  if (nums.length === 0) return null;
  var max = Math.max.apply(null, nums);
  var lbl = /^</.test(s) ? "<" + max + '"'
    : nums.length > 1 ? Math.min.apply(null, nums) + "-" + max + '"'
    : (/^>/.test(s) ? ">" : "") + max + '"';
  return { label: lbl, inches: max, template: false, estimated: !!estimated };
}

var _WEAPON_RANGE_CACHE = {};
function getWeaponRangeInfo(w) {
  if (!w) return null;
  if (w.range !== undefined && w.range !== null && w.range !== "") {
    var own = _weaponRangeFromString(w.range, false);
    if (own) return own;
  }
  var name = typeof w === "string" ? w : w.name;
  var cacheKey = (name || "") + "|" + (w.type || "") + "|" + (w.rules && w.rules.template ? "T" : "");
  if (_WEAPON_RANGE_CACHE[cacheKey]) return _WEAPON_RANGE_CACHE[cacheKey];
  if (!_WEAPON_RANGE_INDEX) {
    _WEAPON_RANGE_INDEX = _buildWeaponRangeIndex();
    // Only cache once the armoury list has loaded, else rebuild next call
    if (typeof HELP_WEAPON_ARMOURY_ENTRIES === "undefined") {
      var tmp = _WEAPON_RANGE_INDEX; _WEAPON_RANGE_INDEX = null;
      return _resolveWeaponRange(w, name, tmp);
    }
  }
  var res = _resolveWeaponRange(w, name, _WEAPON_RANGE_INDEX);
  _WEAPON_RANGE_CACHE[cacheKey] = res;
  return res;
}

function _resolveWeaponRange(w, name, idx) {
  var raw = String(name || "").split(/\s+[—–]\s+/)[0];
  var n = _wrNorm(name);
  var noParen = _wrNorm(raw.replace(/\([^)]*\)/g, " "));
  // Mount / count prefixes and plurals: "Hull Lascannon (opt)", "Two Heavy Flamers"
  var bare = noParen
    .replace(/^((hull|pintle|sponson|turret|two|dual|pair of|forge crafted)\s+)+/, "")
    .replace(/\s+(sponsons?|turret|battery)$/, "")
    .replace(/s$/, "");
  var parenIn = (String(name || "").match(/\(([^)]*)\)/) || [])[1];
  var combiKey = /combi/i.test(raw) && parenIn ? _wrNorm("combi " + parenIn) : "";
  // Range-band profiles, e.g. 'Conversion Beamer (15-30")' — the band is the range
  if (parenIn && /^[<>]?\s*\d+(\s*-\s*\d+)?\s*"?$/.test(parenIn.trim())) {
    var bandStr = parenIn.replace(/["\s]/g, "");
    // Conversion/inversion beam long band is ">30" in the data, 30-45" in the armoury
    if (/^>30$/.test(bandStr) && /conversion|inversion/i.test(raw)) bandStr = "30-45";
    var band = _weaponRangeFromString(bandStr, false);
    if (band) return band;
  }
  var candidates = [
    n,
    bare,
    combiKey,
    bare.replace(/^twin /, ""),
    n,
    n.replace(/^twin /, ""),
    n.replace(/^(twin|twin linked|heavy|gravis) /, ""),
    noParen,
    noParen.replace(/^twin /, ""),
    n.replace(/ (sustained|maximal|frag|krak|flak|primary|secondary|ranged)\b.*$/, ""),
    n.split(" ").slice(0, 3).join(" "),
    n.split(" ").slice(0, 2).join(" "),
  ];
  for (var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    if (c && idx[c] !== undefined) {
      var hit = _weaponRangeFromString(idx[c], false);
      if (hit) return hit;
    }
  }
  // Fallback: estimate from weapon type / template rule
  if (w && w.rules && (w.rules.template || w.rules.torrent)) {
    return { label: "T", inches: 8, template: true, estimated: true };
  }
  var t = (w && w.type) || "";
  var est = t === "Pistol" ? 12 : t === "Assault" ? 12 : t === "Rapid Fire" ? 24
    : t === "Heavy" ? 36 : t === "Salvo" ? 24 : (t === "Ordnance" || t === "Barrage") ? 48 : 24;
  return { label: est + '"', inches: est, template: false, estimated: true };
}

// Short label for UI: 'R24"', 'R T', '~R24"' (estimated)
function formatWeaponRange(w) {
  var info = getWeaponRangeInfo(w);
  if (!info) return "";
  return (info.estimated ? "~" : "") + "R" + (info.template ? " T" : info.label);
}
