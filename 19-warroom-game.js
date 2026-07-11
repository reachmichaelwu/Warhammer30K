(function () {
  var BOARD_W = 50;
  var BOARD_H = 50;
  var BOARD_CENTER = Math.floor(BOARD_W / 2);
  var MAX_UNITS = 24;
  var MAX_ROUNDS = 10;
  var WIN_SCORE = 20;
  var OBJECTIVE_CONTROL_RADIUS = 2;
  var DEFAULT_TILE_SIZE = 14;
  var MIN_TILE_SIZE = 6;
  var MAX_TILE_SIZE = 44;
  var GAME_MODE_SOLO = "solo";
  var GAME_MODE_HOTSEAT = "hotseat";
  var SAVE_KEY = "hh-warroom-save-v1";
  var SAVE_VERSION = 2;
  var MAX_UNDO = 12;

  var OBJECTIVES = [
    { id: "A", x: 10, y: 15, value: 2, label: "North Relay" },
    { id: "B", x: 40, y: 15, value: 2, label: "East Bastion" },
    { id: "C", x: 25, y: 25, value: 3, label: "Central Manifold" },
    { id: "D", x: 10, y: 35, value: 2, label: "West Redoubt" },
    { id: "E", x: 40, y: 35, value: 2, label: "South Gate" },
  ];

  var DEFAULT_LOYALIST = [
    { unitId: "praetor_pa", unitName: "Praetor", models: 1, faction: "imperial_fists" },
    { unitId: "tactical", unitName: "Tactical Squad", models: 10, faction: "imperial_fists" },
    { unitId: "breacher", unitName: "Breacher Squad", models: 10, faction: "imperial_fists" },
    { unitId: "contemptor", unitName: "Contemptor Dreadnought", models: 1, faction: "imperial_fists" },
    { unitId: "sicaran", unitName: "Sicaran Battle Tank", models: 1, faction: "imperial_fists" },
  ];

  var DEFAULT_TRAITOR = [
    { unitId: "praetor_ta", unitName: "Traitor Praetor", models: 1, faction: "sons_of_horus" },
    { unitId: "despoiler", unitName: "Despoiler Squad", models: 10, faction: "sons_of_horus" },
    { unitId: "assault", unitName: "Assault Squad", models: 10, faction: "sons_of_horus" },
    { unitId: "leviathan", unitName: "Leviathan Dreadnought", models: 1, faction: "sons_of_horus" },
    { unitId: "predator", unitName: "Predator Squadron", models: 1, faction: "sons_of_horus" },
  ];

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function rollD6() {
    return Math.floor(Math.random() * 6) + 1;
  }

  function keyFor(x, y) {
    return x + "," + y;
  }

  function objectiveAt(x, y) {
    return OBJECTIVES.find(function (obj) {
      return obj.x === x && obj.y === y;
    }) || null;
  }

  function getTerrainAt(x, y) {
    if (objectiveAt(x, y)) return "objective";
    if (x === BOARD_CENTER || y === BOARD_CENTER || x === y || x + y === BOARD_W - 1) return "road";
    if ((x > 20 && x < 30 && y > 20 && y < 30) || ((x * 17 + y * 11) % 43 === 0)) return "ruins";
    if ((x * 7 + y * 13) % 67 === 0 || (x > 4 && x < 10 && y > 20 && y < 30) || (x > 40 && x < 46 && y > 20 && y < 30)) return "rad";
    if ((x * 19 + y * 5) % 71 === 0) return "relay";
    return "open";
  }

  function tileDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  function cleanName(name) {
    return String(name || "Unknown Unit").replace(/\s+\([^)]+\)$/g, "");
  }

  function shortName(name) {
    var cleaned = cleanName(name);
    var parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length <= 2) return cleaned;
    return parts.slice(0, 2).join(" ");
  }

  function initialsFor(name) {
    return cleanName(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (part) { return part.charAt(0).toUpperCase(); })
      .join("");
  }

  function allUnits() {
    return typeof UNIT_PRESETS_ALL_UNITS !== "undefined" ? UNIT_PRESETS_ALL_UNITS : [];
  }

  function presetCategories() {
    return typeof UNIT_PRESETS !== "undefined" ? UNIT_PRESETS : [];
  }

  function allArmyPresets() {
    return typeof ARMY_PRESETS !== "undefined" ? ARMY_PRESETS : [];
  }

  function armyPresetsFor(side) {
    return allArmyPresets().filter(function (preset) {
      return !preset.allegiance || preset.allegiance === side;
    });
  }

  function defaultArmyPresetId(side) {
    var preset = armyPresetsFor(side)[0];
    return preset ? preset.id : "";
  }

  function hasArmyEntries(army) {
    return !!(army && army.entries && army.entries.length);
  }

  function armySignature(army) {
    if (!hasArmyEntries(army)) return "empty";
    return [
      army.allegiance || "",
      army.faction || "",
      army.pointsLimit || "",
      army.entries.map(function (entry) {
        return [
          entry.unitId || "",
          entry.models || "",
          entry.weaponName || "",
          entry.sgtWeaponName || "",
          entry.isWarlord ? "w" : "",
        ].join(":");
      }).join("|"),
    ].join("#");
  }

  function getPreset(unitId) {
    return allUnits().find(function (u) { return u.id === unitId; }) || null;
  }

  function getRole(unitId, entry) {
    if (entry && entry.slotRole) return entry.slotRole;
    if (typeof UNIT_BATTLEFIELD_ROLE !== "undefined" && UNIT_BATTLEFIELD_ROLE[unitId]) {
      return UNIT_BATTLEFIELD_ROLE[unitId];
    }
    return "troops";
  }

  function getPoints(entry) {
    if (entry && typeof calcArmyEntryPoints === "function") {
      var calculated = calcArmyEntryPoints(entry);
      if (calculated > 0) return calculated;
    }
    var pd = typeof POINTS_DATA !== "undefined" ? POINTS_DATA[entry.unitId] : null;
    if (!pd) return 100;
    var models = entry.models || pd.minModels || 1;
    return pd.base + Math.max(0, models - pd.minModels) * pd.perModel;
  }

  function parseSave(value) {
    if (value === null || value === undefined || value === "-") return null;
    var n = parseInt(value, 10);
    return Number.isFinite(n) ? n : null;
  }

  function parseAp(value) {
    if (value === null || value === undefined || value === "-") return 99;
    var n = parseInt(value, 10);
    return Number.isFinite(n) ? n : 99;
  }

  function isVehicleRole(role) {
    return [
      "war_engine",
      "transport",
      "heavy_transport",
      "armour",
      "lord_of_war",
      "fast_attack",
    ].includes(role);
  }

  function movementFor(role, unitId) {
    if (role === "fast_attack") return 12;
    if (role === "recon") return 10;
    if (role === "heavy_assault") return 5;
    if (role === "war_engine" || role === "armour" || role === "lord_of_war") return 8;
    if (/assault|jetbike|speeder|xiphon|raptor/i.test(unitId || "")) return 10;
    return 6;
  }

  function fallbackWeapon(role) {
    if (role === "war_engine" || role === "armour" || role === "lord_of_war") {
      return { name: "Main Armament", shots: 3, s: 7, ap: "3", damage: 2, type: "Heavy", rules: {} };
    }
    if (role === "assault" || role === "heavy_assault") {
      return { name: "Close Assault", shots: 3, s: 5, ap: "4", damage: 1, type: "Assault", rules: {} };
    }
    return { name: "Bolter Fire", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} };
  }

  function getWeapon(unitId, entry, role) {
    var weapons = typeof getRangedWeapons === "function" ? getRangedWeapons(unitId) : [];
    if (weapons && weapons.length) {
      if (entry && entry.weaponName) {
        var selected = weapons.find(function (w) { return w.name === entry.weaponName; });
        if (selected) return selected;
      }
      return weapons[0];
    }
    return fallbackWeapon(role);
  }

  function inferRange(weapon, role) {
    var type = String((weapon && weapon.type) || "").toLowerCase();
    if (role === "recon" || role === "support" || role === "armour" || role === "war_engine" || role === "lord_of_war") return 18;
    if (type.includes("heavy")) return 18;
    if (type.includes("rapid")) return 12;
    if (type.includes("assault")) return 8;
    if (type.includes("pistol") || (weapon.rules && weapon.rules.template)) return 5;
    return 12;
  }

  function strToInt(value, fallback) {
    var n = parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  // Save value -> string form the resolvers expect ("3", "-").
  function saveString(value) {
    if (value === null || value === undefined || value === "-" || value === 0) return "-";
    var n = parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? String(n) : "-";
  }

  // Pull the model's melee profile (WS / I / A / melee S / AP / rules) from the
  // shared MELEE_WEAPON_PROFILES table so the real assault resolver can be fed.
  function getMeleeProfile(unitId, role) {
    var table = (typeof MELEE_WEAPON_PROFILES !== "undefined") ? MELEE_WEAPON_PROFILES[unitId] : null;
    if (table && table.length) return table[0];
    if (isVehicleRole(role)) {
      return { name: "Crushing Hull", ws: 4, s: 6, ap: "4", i: 3, a: 2, rules: {} };
    }
    if (role === "warlord" || role === "command") {
      return { name: "Combat Weapons", ws: 5, s: 4, ap: "5", i: 4, a: 3, rules: {} };
    }
    return { name: "Combat Weapons", ws: 4, s: 4, ap: "5", i: 4, a: 1, rules: {} };
  }

  // Normalize a board unit's ranged weapon type into one of the strings the
  // shooting resolver branches on.
  function normalizeWeaponType(weapon) {
    var t = String((weapon && weapon.type) || "").toLowerCase();
    if (t.indexOf("rapid") >= 0) return "Rapid Fire";
    if (t.indexOf("heavy") >= 0) return "Heavy";
    if (t.indexOf("assault") >= 0) return "Assault";
    if (t.indexOf("pistol") >= 0) return "Pistol";
    if (t.indexOf("barrage") >= 0) return "Barrage";
    if (t.indexOf("ordnance") >= 0) return "Ordnance";
    return "Rapid Fire";
  }

  function woundTarget(strength, toughness) {
    if (strength >= toughness * 2) return 2;
    if (strength > toughness) return 3;
    if (strength === toughness) return 4;
    if (strength * 2 <= toughness) return 6;
    return 5;
  }

  function sideLabel(side) {
    return side === "loyalist" ? "Loyalist" : "Traitor";
  }

  function sideColor(side) {
    return side === "loyalist" ? "#4da3ff" : "#e35a52";
  }

  function makeLog(text, type) {
    return {
      id: Date.now() + Math.random(),
      text: text,
      type: type || "info",
    };
  }

  function cloneGame(game) {
    return {
      ...game,
      vp: { ...game.vp },
      units: game.units.map(function (u) { return { ...u }; }),
      log: game.log.slice(),
      fx: game.fx ? game.fx.slice() : [],
      lastReport: game.lastReport ? { ...game.lastReport } : null,
    };
  }

  function snapshotGame(game) {
    var copy = cloneGame(game);
    copy.fx = [];
    return copy;
  }

  function savePayload(game, gameMode) {
    return {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      gameMode: gameMode || GAME_MODE_SOLO,
      game: snapshotGame(game),
    };
  }

  function readSavedPayload() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== SAVE_VERSION || !parsed.game) return null;
      if (!Array.isArray(parsed.game.units) || !parsed.game.units.length) return null;
      parsed.game.fx = [];
      parsed.game.log = Array.isArray(parsed.game.log) ? parsed.game.log : [];
      parsed.game.vp = parsed.game.vp || { loyalist: 0, traitor: 0 };
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function writeSavedPayload(game, gameMode) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(savePayload(game, gameMode)));
    } catch (e) {}
  }

  function clearSavedPayload() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {}
  }

  function makeEntryFromPreset(unitId, side, faction) {
    var preset = getPreset(unitId);
    if (!preset) return null;
    var pd = typeof POINTS_DATA !== "undefined" ? POINTS_DATA[unitId] : null;
    var weapons = typeof getRangedWeapons === "function" ? getRangedWeapons(unitId) : [];
    return {
      id: "warroom_preset_" + side + "_" + unitId + "_" + Date.now() + "_" + Math.random(),
      unitId: unitId,
      unitName: preset.name,
      models: pd?.minModels || preset.models || 1,
      weaponName: weapons[0]?.name || null,
      secondaryWeapons: [],
      equipment: {},
      wargearOptions: {},
      faction: faction || (side === "loyalist" ? "imperial_fists" : "sons_of_horus"),
      detachmentId: "warroom_preset",
      slotRole: getRole(unitId, null),
    };
  }

  function normalizeEntries(army, side, rosterOverride) {
    var defaults = side === "loyalist" ? DEFAULT_LOYALIST : DEFAULT_TRAITOR;
    var hasOverride = !!(rosterOverride && rosterOverride[side] && rosterOverride[side].length);
    var overrideEntries = hasOverride
      ? rosterOverride[side].slice()
      : null;
    var entries = overrideEntries || (army && army.entries && army.entries.length ? army.entries.slice() : []);
    var used = new Set(entries.map(function (e) { return e.unitId; }));
    if (hasOverride || !entries.length) {
      defaults.forEach(function (fallback) {
        if (entries.length < MAX_UNITS && !used.has(fallback.unitId)) {
          entries.push({ ...fallback, detachmentId: "quick_start" });
        }
      });
    }
    return entries.slice(0, MAX_UNITS);
  }

  function initialCamera(tileSize) {
    return { x: 0, y: 0, tileSize: tileSize || DEFAULT_TILE_SIZE };
  }

  // On phones, start zoomed out enough that the full board width fits the
  // screen instead of showing a cropped corner of the 50x50 sector.
  function defaultCameraForDevice() {
    var mobile = typeof window !== "undefined" && window.HHMobile && window.HHMobile.isMobile;
    if (mobile) {
      var vw = (window.innerWidth || 390) - 24;
      var vh = Math.max(300, (window.innerHeight || 700) * 0.66);
      var size = clamp(Math.floor(Math.min(vw / BOARD_W, vh / BOARD_H)), MIN_TILE_SIZE, DEFAULT_TILE_SIZE);
      return { x: 0, y: 0, tileSize: size };
    }
    return initialCamera();
  }

  function centerCamera(tileSize) {
    return {
      x: Math.max(0, BOARD_CENTER - 16),
      y: Math.max(0, BOARD_CENTER - 16),
      tileSize: tileSize || DEFAULT_TILE_SIZE,
    };
  }

  function deploymentCameraFor(side, tileSize) {
    return {
      x: 0,
      y: side === "loyalist" ? Math.max(0, BOARD_H - 32) : 0,
      tileSize: tileSize || DEFAULT_TILE_SIZE,
    };
  }

  function formationColumns(slotCount) {
    return clamp(Math.ceil(Math.sqrt(Math.max(1, slotCount) * 2)), 1, 8);
  }

  function deploymentPositionFor(side, index, slotCount) {
    var cols = formationColumns(slotCount);
    var row = Math.floor(index / cols);
    var col = index % cols;
    var rowCount = Math.min(cols, slotCount - row * cols);
    var x = rowCount <= 1
      ? BOARD_CENTER
      : Math.round(5 + ((col + 1) / (rowCount + 1)) * (BOARD_W - 10));
    var y = side === "loyalist" ? BOARD_H - 3 - row * 3 : 2 + row * 3;
    return {
      x: clamp(x, 1, BOARD_W - 2),
      y: clamp(y, 1, BOARD_H - 2),
    };
  }

  function makeUnit(entry, side, index, army, slotCount) {
    var unitId = entry.unitId;
    var preset = getPreset(unitId) || {};
    var role = getRole(unitId, entry);
    var points = getPoints(entry);
    var weapon = getWeapon(unitId, entry, role);
    var models = entry.models || preset.models || 1;
    var wounds = parseInt(preset.w, 10) || (isVehicleRole(role) ? 5 : 1);
    var toughness = parseInt(preset.t, 10) || (isVehicleRole(role) ? 7 : 4);
    var bs = parseInt(preset.bs, 10) || 4;
    var save = parseSave(preset.sv) || (isVehicleRole(role) ? 3 : 4);
    var inv = parseSave(preset.inv);
    var fnp = parseSave(preset.fnp);
    var leadership = parseInt(preset.ld, 10) || (role === "warlord" ? 10 : 8);
    // Health is tracked as a true wound pool: models * wounds-per-model. The
    // integrity / maxIntegrity field names are preserved (the renderer, AI and
    // scoring read them as a ratio) so this stays a drop-in upgrade.
    var maxIntegrity = Math.max(isVehicleRole(role) || role === "warlord" ? 4 : 1, models * wounds);
    var melee = getMeleeProfile(unitId, role);
    var deployment = deploymentPositionFor(side, index, slotCount);
    var x = deployment.x;
    var y = deployment.y;
    var faction = entry.faction || (army && army.faction) || (side === "loyalist" ? "imperial_fists" : "sons_of_horus");
    var artSrc = typeof getUnitArtwork === "function" ? getUnitArtwork(unitId, faction, side) : null;
    var name = entry.unitName || preset.name || entry.name || unitId;
    var weaponStrength = parseInt(weapon.s, 10) || 4;
    var weaponShots = parseInt(weapon.shots, 10) || 1;

    return {
      id: side + "_" + index + "_" + unitId,
      side: side,
      unitId: unitId,
      name: cleanName(name),
      shortName: shortName(name),
      role: role,
      faction: faction,
      x: x,
      y: y,
      models: models,
      modelsMax: models,
      wounds: wounds,
      maxIntegrity: maxIntegrity,
      integrity: maxIntegrity,
      bs: bs,
      toughness: toughness,
      save: save,
      inv: inv,
      fnp: fnp,
      leadership: leadership,
      ws: strToInt(melee.ws, 4),
      initiative: strToInt(melee.i, 4),
      attacks: strToInt(melee.a, 1),
      meleeName: melee.name || "Combat Weapons",
      meleeStrength: strToInt(melee.s, 4),
      meleeAp: melee.ap != null ? String(melee.ap) : "-",
      meleeRules: melee.rules || {},
      points: points,
      weapon: weapon,
      attackRating: clamp(bs + Math.ceil(weaponStrength / 2) + Math.ceil(weaponShots / 2), 4, 13),
      defense: clamp(toughness + Math.ceil((8 - save) / 2) + (inv ? 1 : 0), 4, 12),
      range: inferRange(weapon, role),
      move: movementFor(role, unitId),
      ap: 2,
      activated: false,
      guarded: false,
      status: null,
      artSrc: artSrc,
    };
  }

  function createGame(loyalistArmy, traitorArmy, rosterOverride) {
    var loyalistEntries = normalizeEntries(loyalistArmy, "loyalist", rosterOverride);
    var traitorEntries = normalizeEntries(traitorArmy, "traitor", rosterOverride);
    var units = loyalistEntries.map(function (entry, index) {
      return makeUnit(entry, "loyalist", index, loyalistArmy, loyalistEntries.length);
    }).concat(traitorEntries.map(function (entry, index) {
      return makeUnit(entry, "traitor", index, traitorArmy, traitorEntries.length);
    }));
    var fromDraft = !!(
      rosterOverride &&
      ((rosterOverride.loyalist && rosterOverride.loyalist.length) ||
        (rosterOverride.traitor && rosterOverride.traitor.length))
    );
    var fromBuilder = !fromDraft && !!(
      loyalistArmy &&
      traitorArmy &&
      loyalistArmy.entries &&
      traitorArmy.entries &&
      (loyalistArmy.entries.length || traitorArmy.entries.length)
    );

    return {
      round: 1,
      currentSide: "loyalist",
      vp: { loyalist: 0, traitor: 0 },
      units: units,
      source: fromDraft ? "Preset unit draft + quick fill" : fromBuilder ? "Army Builder deployment" : "Quick warbands",
      fx: [],
      log: [
        makeLog("War Room online. Select a unit, then run its Move, Shoot, and Assault phases right on the tactical map. Every attack is resolved by the full dice engine.", "system"),
      ],
      lastReport: {
        type: "system",
        title: "First Orders",
        summary: "Pick a unit, then choose Move, Shoot, or Assault. Shooting and assault roll the full resolver and post the dice log here. Hold objectives to score VP.",
      },
      winner: null,
    };
  }

  function aliveUnits(game, side) {
    return game.units.filter(function (u) {
      return u.integrity > 0 && (!side || u.side === side);
    });
  }

  function unitAt(game, x, y) {
    return aliveUnits(game).find(function (u) { return u.x === x && u.y === y; }) || null;
  }

  function findUnit(game, id) {
    return game.units.find(function (u) { return u.id === id; }) || null;
  }

  function controlledObjectives(game) {
    var controls = {};
    OBJECTIVES.forEach(function (obj) {
      var occupants = aliveUnits(game).filter(function (u) {
        return tileDistance(u, obj) <= OBJECTIVE_CONTROL_RADIUS;
      });
      var sides = Array.from(new Set(occupants.map(function (u) { return u.side; })));
      controls[obj.id] = sides.length === 1 ? sides[0] : null;
    });
    return controls;
  }

  function scoreSide(game, side) {
    var g = cloneGame(game);
    var controls = controlledObjectives(g);
    var gained = OBJECTIVES.reduce(function (sum, obj) {
      return sum + (controls[obj.id] === side ? obj.value : 0);
    }, 0);
    if (gained > 0) {
      g.vp[side] += gained;
      g.log.unshift(makeLog(sideLabel(side) + " controls objectives for +" + gained + " VP.", "score"));
      g.lastReport = {
        type: "score",
        title: sideLabel(side) + " Objective Control",
        summary: "+" + gained + " VP from controlled objectives.",
      };
    }
    if (g.vp[side] >= WIN_SCORE) {
      g.winner = side;
      g.log.unshift(makeLog(sideLabel(side) + " force achieves tactical supremacy.", "score"));
    }
    return g;
  }

  function beginSide(game, side) {
    var g = cloneGame(game);
    g.currentSide = side;
    g.units.forEach(function (u) {
      if (u.side === side && u.integrity > 0) {
        u.ap = 2;
        u.activated = false;
        u.guarded = false;
        u.movedThisActivation = false;
      }
    });
    return g;
  }

  function checkBattleEnd(game) {
    var g = cloneGame(game);
    var loyalists = aliveUnits(g, "loyalist").length;
    var traitors = aliveUnits(g, "traitor").length;
    if (!loyalists || !traitors) {
      g.winner = loyalists ? "loyalist" : traitors ? "traitor" : "draw";
      g.log.unshift(makeLog(g.winner === "draw" ? "Both forces are combat ineffective." : sideLabel(g.winner) + " force holds the field.", "score"));
    }
    if (!g.winner && g.round > MAX_ROUNDS) {
      if (g.vp.loyalist === g.vp.traitor) g.winner = "draw";
      else g.winner = g.vp.loyalist > g.vp.traitor ? "loyalist" : "traitor";
      g.log.unshift(makeLog(g.winner === "draw" ? "The sector ends contested." : sideLabel(g.winner) + " wins on victory points.", "score"));
    }
    return g;
  }

  function finishUnit(unit) {
    if (unit.ap <= 0) {
      unit.ap = 0;
      unit.activated = true;
    }
  }

  function canMoveTo(game, unit, x, y) {
    if (!unit || unit.integrity <= 0 || unit.ap <= 0 || unit.activated) return false;
    if (x < 0 || y < 0 || x >= BOARD_W || y >= BOARD_H) return false;
    if (unitAt(game, x, y)) return false;
    return tileDistance(unit, { x: x, y: y }) <= unit.move;
  }

  function moveUnit(game, unitId, x, y) {
    var g = cloneGame(game);
    var unit = findUnit(g, unitId);
    if (!canMoveTo(g, unit, x, y)) return game;
    unit.x = x;
    unit.y = y;
    unit.ap -= 1;
    unit.status = null;
    unit.movedThisActivation = true;
    var terrain = getTerrainAt(x, y);
    if (terrain === "rad" && !isVehicleRole(unit.role)) {
      unit.integrity = Math.max(1, unit.integrity - 1);
      unit.status = "Rad-burn";
      g.log.unshift(makeLog(unit.shortName + " crosses rad-scoured ground and loses 1 integrity.", "warning"));
      g.lastReport = {
        type: "move",
        title: unit.shortName + " Advances",
        summary: "Moved to " + x + "." + y + " through rad-scoured ground and lost 1 integrity.",
      };
    } else {
      g.log.unshift(makeLog(unit.shortName + " advances to grid " + x + "." + y + ".", "move"));
      g.lastReport = {
        type: "move",
        title: unit.shortName + " Advances",
        summary: "Moved to grid " + x + "." + y + ".",
      };
    }
    finishUnit(unit);
    return g;
  }

  // Reduce a unit's wound pool and resync its model count / status.
  function applyWoundDamage(unit, woundsLost) {
    if (!unit || woundsLost <= 0) return 0;
    var before = unit.integrity;
    unit.integrity = Math.max(0, unit.integrity - woundsLost);
    unit.models = Math.max(0, Math.ceil(unit.integrity / Math.max(1, unit.wounds)));
    return before - unit.integrity;
  }

  // Convert a resolver's structured {phase,text} log into display strings.
  function logLinesFrom(resolverLog) {
    return (resolverLog || []).map(function (entry) {
      return (entry.phase ? "[" + entry.phase + "] " : "") + entry.text;
    });
  }

  function canShoot(game, attacker, target) {
    if (!attacker || !target) return false;
    if (attacker.integrity <= 0 || target.integrity <= 0) return false;
    if (attacker.side === target.side) return false;
    if (attacker.ap <= 0 || attacker.activated) return false;
    return tileDistance(attacker, target) <= attacker.range;
  }
  // Find a free tile in base contact with the target, reachable within the
  // attacker's movement allowance (its charge reach).
  function chargeLanding(game, attacker, target) {
    var best = null;
    var bestDist = Infinity;
    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        var x = target.x + dx;
        var y = target.y + dy;
        if (x < 0 || y < 0 || x >= BOARD_W || y >= BOARD_H) continue;
        if (x === attacker.x && y === attacker.y) { return { x: x, y: y }; }
        if (unitAt(game, x, y)) continue;
        var d = tileDistance(attacker, { x: x, y: y });
        if (d <= attacker.move && d < bestDist) { bestDist = d; best = { x: x, y: y }; }
      }
    }
    return best;
  }

  function canAssault(game, attacker, target) {
    if (!attacker || !target) return false;
    if (attacker.integrity <= 0 || target.integrity <= 0) return false;
    if (attacker.side === target.side) return false;
    if (attacker.ap <= 0 || attacker.activated) return false;
    return !!chargeLanding(game, attacker, target);
  }

  // Map a board unit + its ranged weapon onto resolveShootingPhase params.
  function buildShootingParams(attacker, target) {
    var weapon = attacker.weapon || fallbackWeapon(attacker.role);
    var terrain = getTerrainAt(target.x, target.y);
    var inCover = terrain === "ruins" || terrain === "relay" || terrain === "objective";
    var coverSave = "-";
    if (inCover) coverSave = target.guarded ? "4" : "5";
    else if (target.guarded) coverSave = "5";
    var halfRange = tileDistance(attacker, target) <= Math.ceil(attacker.range / 2);
    return {
      numModels: Math.max(1, attacker.models),
      numShots: strToInt(weapon.shots, 1),
      bs: attacker.bs,
      strength: strToInt(weapon.s, 4),
      ap: weapon.ap != null ? String(weapon.ap) : "-",
      toughness: target.toughness,
      armourSave: saveString(target.save),
      invulnSave: saveString(target.inv),
      coverSave: coverSave,
      fnp: saveString(target.fnp),
      specialRules: weapon.rules || {},
      halfRange: halfRange,
      moved: !!attacker.movedThisActivation,
      indirect: false,
      weaponType: normalizeWeaponType(weapon),
      leadership: target.leadership || 8,
      targetModels: Math.max(1, target.models),
      sgtEnabled: false,
      sgtWeapon: null,
      hasVexilla: false,
      hasNoxVox: false,
      snapShots: false,
    };
  }

  // Map two board units onto resolveAssaultPhase params (single primary group
  // per side — the resolver fills attacks/initiative from these).
  function buildAssaultParams(attacker, target, isCharging) {
    return {
      attackerModels: Math.max(1, attacker.models),
      attackerWS: attacker.ws,
      attackerI: attacker.initiative,
      attackerA: attacker.attacks,
      attackerW: attacker.wounds,
      attackerSv: saveString(attacker.save),
      attackerInv: saveString(attacker.inv),
      attackerFnp: saveString(attacker.fnp),
      attackerT: attacker.toughness,
      attackerS: attacker.meleeStrength,
      attackerAP: attacker.meleeAp,
      attackerRules: attacker.meleeRules || {},
      defenderModels: Math.max(1, target.models),
      defenderWS: target.ws,
      defenderI: target.initiative,
      defenderA: target.attacks,
      defenderW: target.wounds,
      defenderSv: saveString(target.save),
      defenderInv: saveString(target.inv),
      defenderFnp: saveString(target.fnp),
      defenderT: target.toughness,
      defenderS: target.meleeStrength,
      defenderAP: target.meleeAp,
      defenderRules: target.meleeRules || {},
      isCharging: !!isCharging,
      disordered: false,
    };
  }

  // ── RANGED FIRE — full shooting resolver on the map ──
  function attackUnit(game, attackerId, targetId) {
    var g = cloneGame(game);
    var attacker = findUnit(g, attackerId);
    var target = findUnit(g, targetId);
    if (!canShoot(g, attacker, target)) return game;
    if (typeof resolveShootingPhase !== "function") return game;

    var weaponName = (attacker.weapon && attacker.weapon.name) || "Ranged Weapon";
    var res = resolveShootingPhase(buildShootingParams(attacker, target));
    var woundsLost = res.casualties || 0; // post-FNP unsaved wounds = wound-pool loss
    var dealt = applyWoundDamage(target, woundsLost);

    g.fx = (g.fx || []).concat({
      id: Date.now() + Math.random(),
      type: "shot",
      side: attacker.side,
      from: { x: attacker.x, y: attacker.y },
      to: { x: target.x, y: target.y },
      damage: dealt,
      weaponName: weaponName,
      createdAt: Date.now(),
    }).slice(-10);

    attacker.ap -= 1;
    attacker.movedThisActivation = false;

    var destroyed = target.integrity <= 0;
    if (destroyed) {
      target.status = "Destroyed";
      g.vp[attacker.side] += 1;
      g.log.unshift(makeLog(attacker.shortName + " annihilates " + target.shortName + " with " + weaponName + ". +1 VP", "attack"));
    } else if (dealt > 0) {
      target.status = "Suppressed";
      g.log.unshift(makeLog(attacker.shortName + " fires " + weaponName + ": " + res.hits + " hits, " + res.unsaved + " unsaved, " + dealt + " wounds inflicted.", "attack"));
    } else {
      g.log.unshift(makeLog(attacker.shortName + " fires " + weaponName + ": " + res.hits + " hits, no wounds landed.", "info"));
    }

    g.lastReport = {
      type: "attack",
      kind: "shooting",
      title: attacker.shortName + " → " + target.shortName,
      summary: weaponName + ": " + (res.totalShots || 0) + " shots · " + (res.hits || 0) + " hits · " + (res.unsaved || 0) + " unsaved · " + dealt + " wounds.",
      logLines: logLinesFrom(res.log),
      stats: [
        { label: "Shots", value: res.totalShots || 0 },
        { label: "Hits", value: res.hits || 0 },
        { label: "Wounds", value: res.wounds || 0 },
        { label: "Unsaved", value: res.unsaved || 0 },
        { label: "Wounds Dealt", value: dealt },
      ],
      attackerId: attacker.id,
      targetId: target.id,
      attackerName: attacker.name,
      targetName: target.name,
    };
    finishUnit(attacker);
    return checkBattleEnd(g);
  }

  // ── ASSAULT — charge into base contact, then full assault resolver ──
  function assaultUnit(game, attackerId, targetId) {
    var g = cloneGame(game);
    var attacker = findUnit(g, attackerId);
    var target = findUnit(g, targetId);
    if (!canAssault(g, attacker, target)) return game;
    if (typeof resolveAssaultPhase !== "function") return game;

    var landing = chargeLanding(g, attacker, target);
    if (landing) { attacker.x = landing.x; attacker.y = landing.y; }

    var res = resolveAssaultPhase(buildAssaultParams(attacker, target, true));
    var defDealt = applyWoundDamage(target, (res.defenderCasualties || 0) * Math.max(1, target.wounds));
    var atkDealt = applyWoundDamage(attacker, (res.attackerCasualties || 0) * Math.max(1, attacker.wounds));

    g.fx = (g.fx || []).concat({
      id: Date.now() + Math.random(),
      type: "melee",
      side: attacker.side,
      from: { x: attacker.x, y: attacker.y },
      to: { x: target.x, y: target.y },
      damage: defDealt,
      createdAt: Date.now(),
    }).slice(-10);

    attacker.ap = 0;
    attacker.activated = true;
    attacker.movedThisActivation = false;

    var winner = res.combatResult ? res.combatResult.winner : "Draw";
    if (target.integrity <= 0) {
      target.status = "Destroyed";
      g.vp[attacker.side] += 1;
      g.log.unshift(makeLog(attacker.shortName + " overruns " + target.shortName + " in melee. +1 VP", "attack"));
    } else if (attacker.integrity <= 0) {
      attacker.status = "Destroyed";
      g.vp[target.side] += 1;
      g.log.unshift(makeLog(attacker.shortName + " is cut down assaulting " + target.shortName + ".", "attack"));
    } else {
      if (defDealt > 0) target.status = "Engaged";
      g.log.unshift(makeLog(attacker.shortName + " charges " + target.shortName + ": " + winner + " holds the line (" + defDealt + " / " + atkDealt + " wounds).", "attack"));
    }

    g.lastReport = {
      type: "attack",
      kind: "assault",
      title: attacker.shortName + " ⚔ " + target.shortName,
      summary: "Charge resolved — " + winner + ". " + defDealt + " wounds to " + target.shortName + ", " + atkDealt + " back to " + attacker.shortName + ".",
      logLines: logLinesFrom(res.log),
      stats: [
        { label: "Result", value: winner },
        { label: "Atk Score", value: res.combatResult ? res.combatResult.attackerScore : 0 },
        { label: "Def Score", value: res.combatResult ? res.combatResult.defenderScore : 0 },
        { label: "Foe Wounds", value: defDealt },
        { label: "Self Wounds", value: atkDealt },
      ],
      attackerId: attacker.id,
      targetId: target.id,
      attackerName: attacker.name,
      targetName: target.name,
    };
    return checkBattleEnd(g);
  }

  function braceUnit(game, unitId) {
    var g = cloneGame(game);
    var unit = findUnit(g, unitId);
    if (!unit || unit.side !== g.currentSide || unit.integrity <= 0 || unit.activated) return game;
    unit.guarded = true;
    unit.ap = 0;
    unit.activated = true;
    unit.status = "Braced";
    g.log.unshift(makeLog(unit.shortName + " braces behind cover.", "move"));
    g.lastReport = {
      type: "brace",
      title: unit.shortName + " Braces",
      summary: "Guarded until its next activation. Incoming damage is reduced by 1.",
    };
    return g;
  }

  function stepToward(game, unit, target) {
    var candidates = [];
    for (var dx = -unit.move; dx <= unit.move; dx++) {
      for (var dy = -unit.move; dy <= unit.move; dy++) {
        var x = unit.x + dx;
        var y = unit.y + dy;
        if (dx === 0 && dy === 0) continue;
        if (Math.abs(dx) + Math.abs(dy) > unit.move) continue;
        if (canMoveTo(game, unit, x, y)) candidates.push({ x: x, y: y });
      }
    }
    candidates.sort(function (a, b) {
      var delta = tileDistance(a, target) - tileDistance(b, target);
      if (delta !== 0) return delta;
      return (getTerrainAt(a.x, a.y) === "road" ? -1 : 0) - (getTerrainAt(b.x, b.y) === "road" ? -1 : 0);
    });
    return candidates[0] || null;
  }

  function aiTargetFor(game, unit) {
    var enemies = aliveUnits(game, "loyalist");
    var inRange = enemies.filter(function (enemy) {
      return tileDistance(unit, enemy) <= unit.range;
    });
    if (inRange.length) {
      inRange.sort(function (a, b) { return a.integrity - b.integrity; });
      return inRange[0];
    }
    var objectives = OBJECTIVES.slice().sort(function (a, b) {
      return tileDistance(unit, a) - tileDistance(unit, b);
    });
    return objectives[0] || enemies[0] || unit;
  }

  function runTraitorAi(game) {
    var g = beginSide(game, "traitor");
    var units = aliveUnits(g, "traitor").slice();
    for (var i = 0; i < units.length; i++) {
      var current = findUnit(g, units[i].id);
      if (!current || current.integrity <= 0) continue;
      var firstTarget = aiTargetFor(g, current);
      if (firstTarget && firstTarget.side === "loyalist" && canShoot(g, current, firstTarget)) {
        g = attackUnit(g, current.id, firstTarget.id);
        current = findUnit(g, units[i].id);
      }
      if (g.winner || !current || current.integrity <= 0 || current.ap <= 0) continue;
      var moveTarget = aiTargetFor(g, current);
      var step = stepToward(g, current, moveTarget);
      if (step) {
        g = moveUnit(g, current.id, step.x, step.y);
        current = findUnit(g, units[i].id);
      }
      if (g.winner || !current || current.integrity <= 0 || current.ap <= 0) continue;
      var secondTarget = aiTargetFor(g, current);
      if (secondTarget && secondTarget.side === "loyalist" && canAssault(g, current, secondTarget)) {
        g = assaultUnit(g, current.id, secondTarget.id);
      } else if (secondTarget && secondTarget.side === "loyalist" && canShoot(g, current, secondTarget)) {
        g = attackUnit(g, current.id, secondTarget.id);
      } else {
        g = braceUnit(g, current.id);
      }
      if (g.winner) break;
    }
    g = scoreSide(g, "traitor");
    if (!g.winner) {
      g.round += 1;
      g = checkBattleEnd(g);
      if (!g.winner) g = beginSide(g, "loyalist");
    }
    return g;
  }

  function endLoyalistOrders(game) {
    var g = scoreSide(game, "loyalist");
    if (g.winner) return g;
    g.log.unshift(makeLog("Traitor counter-orders executing.", "system"));
    return runTraitorAi(g);
  }

  function endHotseatOrders(game) {
    var side = game.currentSide;
    var nextSide = side === "loyalist" ? "traitor" : "loyalist";
    var g = scoreSide(game, side);
    if (g.winner) return g;
    if (side === "traitor") {
      g.round += 1;
      g = checkBattleEnd(g);
      if (g.winner) return g;
    }
    g = beginSide(g, nextSide);
    g.log.unshift(makeLog(sideLabel(side) + " orders complete. " + sideLabel(nextSide) + " command phase opened.", "system"));
    return g;
  }

  function endOrders(game, gameMode) {
    if (gameMode === GAME_MODE_HOTSEAT) return endHotseatOrders(game);
    if (game.currentSide !== "loyalist") return game;
    return endLoyalistOrders(game);
  }

  function getCanvasLayout(canvas, camera) {
    var width = canvas.clientWidth || 900;
    var height = canvas.clientHeight || 620;
    var cell = clamp((camera && camera.tileSize) || DEFAULT_TILE_SIZE, MIN_TILE_SIZE, MAX_TILE_SIZE);
    var visibleCols = Math.ceil(width / cell) + 1;
    var visibleRows = Math.ceil(height / cell) + 1;
    var startX = clamp(Math.floor((camera && camera.x) || 0), 0, Math.max(0, BOARD_W - visibleCols + 1));
    var startY = clamp(Math.floor((camera && camera.y) || 0), 0, Math.max(0, BOARD_H - visibleRows + 1));
    return {
      width: width,
      height: height,
      cell: cell,
      ox: -((camera && camera.fracX) || 0) * cell,
      oy: -((camera && camera.fracY) || 0) * cell,
      startX: startX,
      startY: startY,
      visibleCols: visibleCols,
      visibleRows: visibleRows,
    };
  }

  function tileCenter(layout, pos) {
    return {
      x: layout.ox + (pos.x - layout.startX) * layout.cell + layout.cell / 2,
      y: layout.oy + (pos.y - layout.startY) * layout.cell + layout.cell / 2,
    };
  }

  function drawShotFx(ctx, layout, fx) {
    if (!fx || fx.type !== "shot") return false;
    var age = Date.now() - fx.createdAt;
    var duration = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 260 : 620;
    if (age < 0 || age > duration) return false;
    var t = clamp(age / duration, 0, 1);
    var ease = 1 - Math.pow(1 - t, 3);
    var from = tileCenter(layout, fx.from);
    var to = tileCenter(layout, fx.to);
    var x = from.x + (to.x - from.x) * ease;
    var y = from.y + (to.y - from.y) * ease;
    var color = fx.side === "loyalist" ? "#64b6ff" : "#ff756e";
    var core = fx.damage > 0 ? "#fff1b8" : color;
    var fade = Math.max(0, 1 - t);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.26 + fade * 0.34;
    ctx.lineWidth = Math.max(5, layout.cell * 0.08);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.strokeStyle = core;
    ctx.globalAlpha = 0.72;
    ctx.lineWidth = Math.max(2, layout.cell * 0.025);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.fillStyle = core;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(4, layout.cell * 0.055), 0, Math.PI * 2);
    ctx.fill();

    if (t > 0.58) {
      var pulse = (t - 0.58) / 0.42;
      ctx.strokeStyle = fx.damage > 0 ? "#ffd84a" : color;
      ctx.globalAlpha = Math.max(0, 0.8 - pulse * 0.8);
      ctx.lineWidth = Math.max(2, layout.cell * 0.035);
      ctx.beginPath();
      ctx.arc(to.x, to.y, layout.cell * (0.12 + pulse * 0.28), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  // Melee clash burst at the point of contact between two units.
  function drawMeleeFx(ctx, layout, fx) {
    if (!fx || fx.type !== "melee") return false;
    var age = Date.now() - fx.createdAt;
    var duration = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 280 : 640;
    if (age < 0 || age > duration) return false;
    var t = clamp(age / duration, 0, 1);
    var from = tileCenter(layout, fx.from);
    var to = tileCenter(layout, fx.to);
    var cx = (from.x + to.x) / 2;
    var cy = (from.y + to.y) / 2;
    var color = fx.side === "loyalist" ? "#64b6ff" : "#ff756e";
    var spark = fx.damage > 0 ? "#fff1b8" : color;
    var fade = Math.max(0, 1 - t);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    // expanding clash ring
    ctx.strokeStyle = fx.damage > 0 ? "#ffd84a" : color;
    ctx.globalAlpha = 0.7 * fade;
    ctx.lineWidth = Math.max(2, layout.cell * 0.05);
    ctx.beginPath();
    ctx.arc(cx, cy, layout.cell * (0.2 + t * 0.5), 0, Math.PI * 2);
    ctx.stroke();
    // crossing blade sparks
    var n = 6;
    ctx.strokeStyle = spark;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.85 * fade;
    ctx.lineWidth = Math.max(1.5, layout.cell * 0.03);
    for (var i = 0; i < n; i++) {
      var ang = (Math.PI * 2 * i) / n + t * 1.4;
      var r0 = layout.cell * 0.12;
      var r1 = layout.cell * (0.3 + t * 0.45);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
      ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
      ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  function drawWarroom(canvas, game, selectedId, targetLockId, mode, hover, imageCache, camera) {
    if (!canvas) return;
    var dpr = window.devicePixelRatio || 1;
    var layout = getCanvasLayout(canvas, camera);
    if (canvas.width !== Math.round(layout.width * dpr) || canvas.height !== Math.round(layout.height * dpr)) {
      canvas.width = Math.round(layout.width * dpr);
      canvas.height = Math.round(layout.height * dpr);
    }
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, layout.width, layout.height);
    ctx.fillStyle = "#040904";
    ctx.fillRect(0, 0, layout.width, layout.height);

    var selected = selectedId ? findUnit(game, selectedId) : null;
    var targetLock = targetLockId ? findUnit(game, targetLockId) : null;
    // Precompute per-draw lookups: occupancy by tile (instead of an O(units)
    // scan per visible tile) and objective control (instead of recomputing it
    // once per objective marker).
    var alive = aliveUnits(game);
    var occupiedByTile = {};
    alive.forEach(function (u) { occupiedByTile[keyFor(u.x, u.y)] = u; });
    var controls = controlledObjectives(game);
    for (var vy = 0; vy < layout.visibleRows; vy++) {
      var y = layout.startY + vy;
      if (y < 0 || y >= BOARD_H) continue;
      for (var vx = 0; vx < layout.visibleCols; vx++) {
        var x = layout.startX + vx;
        if (x < 0 || x >= BOARD_W) continue;
        var px = layout.ox + vx * layout.cell;
        var py = layout.oy + vy * layout.cell;
        var terrain = getTerrainAt(x, y);
        ctx.fillStyle =
          terrain === "objective" ? "#18220d" :
          terrain === "ruins" ? "#162315" :
          terrain === "rad" ? "#241b10" :
          terrain === "relay" ? "#101f24" :
          terrain === "road" ? "#111910" :
          "#071107";
        ctx.fillRect(px + 1, py + 1, layout.cell - 2, layout.cell - 2);
        ctx.strokeStyle = layout.cell <= 18 ? "rgba(0, 255, 65, 0.08)" : "rgba(0, 255, 65, 0.18)";
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, layout.cell - 1, layout.cell - 1);

        if (selected && selected.side === game.currentSide && selected.integrity > 0 && selected.ap > 0 && !game.winner) {
          var dist = tileDistance(selected, { x: x, y: y });
          if (mode === "move" && canMoveTo(game, selected, x, y)) {
            ctx.fillStyle = "rgba(0, 255, 65, 0.11)";
            ctx.fillRect(px + 3, py + 3, layout.cell - 6, layout.cell - 6);
          }
          if (mode === "assault" && dist <= selected.move + 1) {
            ctx.fillStyle = "rgba(227, 90, 82, 0.10)";
            ctx.fillRect(px + 3, py + 3, layout.cell - 6, layout.cell - 6);
          }
          if (dist <= selected.range && (mode === "shoot" || occupiedByTile[keyFor(x, y)])) {
            ctx.strokeStyle = "rgba(227, 90, 82, 0.62)";
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 5, py + 5, layout.cell - 10, layout.cell - 10);
          }
        }
        if (hover && hover.x === x && hover.y === y) {
          ctx.strokeStyle = "rgba(255, 216, 74, 0.8)";
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 7, py + 7, layout.cell - 14, layout.cell - 14);
        }
      }
    }

    OBJECTIVES.forEach(function (obj) {
      if (obj.x < layout.startX - 1 || obj.x > layout.startX + layout.visibleCols || obj.y < layout.startY - 1 || obj.y > layout.startY + layout.visibleRows) return;
      var objCenter = tileCenter(layout, obj);
      var px = objCenter.x;
      var py = objCenter.y;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = controls[obj.id] ? sideColor(controls[obj.id]) : "#ccaa00";
      ctx.globalAlpha = 0.22;
      ctx.fillRect(-layout.cell * 0.22, -layout.cell * 0.22, layout.cell * 0.44, layout.cell * 0.44);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = controls[obj.id] ? sideColor(controls[obj.id]) : "#ffd84a";
      ctx.lineWidth = 2;
      ctx.strokeRect(-layout.cell * 0.22, -layout.cell * 0.22, layout.cell * 0.44, layout.cell * 0.44);
      ctx.restore();
      ctx.fillStyle = "#fff1b8";
      ctx.font = "700 12px 'Share Tech Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(obj.id, px, py + 4);
    });

    alive.slice().sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (unit) {
      if (unit.x < layout.startX - 1 || unit.x > layout.startX + layout.visibleCols || unit.y < layout.startY - 1 || unit.y > layout.startY + layout.visibleRows) return;
      var center = tileCenter(layout, unit);
      var cx = center.x;
      var cy = center.y;
      var radius = layout.cell * 0.29;
      var cache = unit.artSrc ? imageCache[unit.artSrc] : null;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      if (cache && cache.loaded) {
        ctx.drawImage(cache.img, cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.fillStyle = unit.side === "loyalist" ? "rgba(15, 44, 72, 0.35)" : "rgba(72, 18, 15, 0.38)";
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      } else {
        ctx.fillStyle = unit.side === "loyalist" ? "#193a5a" : "#5a1b18";
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      }
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle =
        unit.id === selectedId ? "#ffd84a" :
        targetLock && unit.id === targetLock.id ? "#ff756e" :
        sideColor(unit.side);
      ctx.lineWidth = unit.id === selectedId || (targetLock && unit.id === targetLock.id) ? 4 : 2;
      ctx.stroke();
      if (selected && unit.side !== selected.side && tileDistance(selected, unit) <= selected.range) {
        ctx.strokeStyle = "rgba(255, 117, 110, 0.52)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (unit.activated) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      if (layout.cell < 112) {
        ctx.fillStyle = "#fff1b8";
        ctx.font = "900 11px 'Share Tech Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(initialsFor(unit.shortName), cx, cy + 1);
        ctx.textBaseline = "alphabetic";
      }
      var hpW = radius * 1.6;
      var hpX = cx - hpW / 2;
      var hpY = cy + radius + 7;
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(hpX, hpY, hpW, 5);
      ctx.fillStyle = unit.integrity / unit.maxIntegrity > 0.5 ? "#00ff41" : unit.integrity / unit.maxIntegrity > 0.25 ? "#ffd84a" : "#ff4444";
      ctx.fillRect(hpX, hpY, hpW * (unit.integrity / unit.maxIntegrity), 5);
      if (layout.cell >= 112) {
        ctx.fillStyle = "#d8f7c8";
        ctx.font = "700 10px 'Share Tech Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(unit.shortName, cx, cy + radius + 22);
      }
    });
    (game.fx || []).forEach(function (fx) {
      drawShotFx(ctx, layout, fx);
      drawMeleeFx(ctx, layout, fx);
    });
  }

  function tileFromEvent(canvas, event, camera) {
    var rect = canvas.getBoundingClientRect();
    var layout = getCanvasLayout(canvas, camera);
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var tx = Math.floor((x - layout.ox) / layout.cell) + layout.startX;
    var ty = Math.floor((y - layout.oy) / layout.cell) + layout.startY;
    if (tx < 0 || ty < 0 || tx >= BOARD_W || ty >= BOARD_H) return null;
    return { x: tx, y: ty };
  }

  function StatPill(props) {
    return React.createElement("div", { className: "hh-game-stat" },
      React.createElement("span", null, props.label),
      React.createElement("strong", { style: props.color ? { color: props.color } : null }, props.value),
    );
  }

  function UnitButton(props) {
    var unit = props.unit;
    var active = props.active;
    return React.createElement("button", {
      type: "button",
      className: "hh-game-unit" + (active ? " is-active" : "") + (unit.activated ? " is-done" : ""),
      onClick: props.onClick,
      disabled: props.disabled,
    },
      React.createElement("span", {
        className: "hh-game-unit-thumb",
        style: unit.artSrc ? { backgroundImage: "url('" + unit.artSrc.replace(/'/g, "%27") + "')" } : null,
      }),
      React.createElement("span", { className: "hh-game-unit-main" },
        React.createElement("strong", null, unit.shortName),
        React.createElement("span", null, unit.weapon.name),
      ),
      React.createElement("span", { className: "hh-game-unit-hp" }, unit.integrity, "/", unit.maxIntegrity),
    );
  }

  function HeresyWarroomGame(props) {
    var loyalistArmy = props.loyalistArmy;
    var traitorArmy = props.traitorArmy;
    var setActivePhase = props.setActivePhase;
    var importArmyCsv = props.importArmyCsv;
    var applyUnitPreset = props.applyUnitPreset;
    var applyTargetPreset = props.applyTargetPreset;
    var applyWeaponPreset = props.applyWeaponPreset;
    var canvasRef = useRef(null);
    var wheelHandlerRef = useRef(null);
    var touchHandlersRef = useRef({});
    var touchStateRef = useRef(null);
    var imageCacheRef = useRef({});
    var autoPresetLoadedRef = useRef(false);
    var savedPayloadRef = useRef(null);
    if (!savedPayloadRef.current) savedPayloadRef.current = { value: readSavedPayload() };
    var resumedSavedGameRef = useRef(!!(savedPayloadRef.current && savedPayloadRef.current.value));
    var draftState = useState({ loyalist: [], traitor: [] });
    var draftRosters = draftState[0];
    var setDraftRosters = draftState[1];
    var pickState = useState({ loyalist: "tactical", traitor: "despoiler" });
    var presetPick = pickState[0];
    var setPresetPick = pickState[1];
    var armyPresetState = useState(function () {
      return {
        loyalist: defaultArmyPresetId("loyalist"),
        traitor: defaultArmyPresetId("traitor"),
      };
    });
    var armyPresetPick = armyPresetState[0];
    var setArmyPresetPick = armyPresetState[1];
    var pendingArmyLoadState = useState(null);
    var pendingArmyLoad = pendingArmyLoadState[0];
    var setPendingArmyLoad = pendingArmyLoadState[1];
    var gameModeState = useState(
      (savedPayloadRef.current.value && savedPayloadRef.current.value.gameMode) || GAME_MODE_SOLO,
    );
    var gameMode = gameModeState[0];
    var setGameMode = gameModeState[1];
    var gameState = useState(function () {
      return (savedPayloadRef.current.value && savedPayloadRef.current.value.game) ||
        createGame(loyalistArmy, traitorArmy);
    });
    var game = gameState[0];
    var setGame = gameState[1];
    var latestSaveRef = useRef({ game: game, gameMode: gameMode });
    var undoStackState = useState([]);
    var undoStack = undoStackState[0];
    var setUndoStack = undoStackState[1];
    var setupOpenState = useState(false);
    var setupOpen = setupOpenState[0];
    var setSetupOpen = setupOpenState[1];
    var selectedState = useState(null);
    var selectedId = selectedState[0];
    var setSelectedId = selectedState[1];
    var modeState = useState("move");
    var mode = modeState[0];
    var setMode = modeState[1];
    var cameraState = useState(function () { return defaultCameraForDevice(); });
    var camera = cameraState[0];
    var setCamera = cameraState[1];
    var hoverState = useState(null);
    var hover = hoverState[0];
    var setHover = hoverState[1];
    var targetLockState = useState(null);
    var targetLockId = targetLockState[0];
    var setTargetLockId = targetLockState[1];
    var boardLogOpenState = useState(function () {
      return !(typeof window !== "undefined" && window.HHMobile && window.HHMobile.isMobile);
    });
    var boardLogOpen = boardLogOpenState[0];
    var setBoardLogOpen = boardLogOpenState[1];
    var drawTickState = useState(0);
    var drawTick = drawTickState[0];
    var setDrawTick = drawTickState[1];
    var selected = selectedId ? findUnit(game, selectedId) : null;
    var controls = controlledObjectives(game);
    var loyalistAlive = aliveUnits(game, "loyalist");
    var traitorAlive = aliveUnits(game, "traitor");
    var currentArmySignature = armySignature(loyalistArmy) + "::" + armySignature(traitorArmy);

    useEffect(function () {
      var cache = imageCacheRef.current;
      game.units.forEach(function (unit) {
        if (!unit.artSrc || cache[unit.artSrc]) return;
        var img = new Image();
        cache[unit.artSrc] = { img: img, loaded: false };
        img.onload = function () {
          cache[unit.artSrc].loaded = true;
          setDrawTick(function (n) { return n + 1; });
        };
        img.onerror = function () {
          cache[unit.artSrc].failed = true;
        };
        img.src = unit.artSrc;
      });
    }, [game.units]);

    useEffect(function () {
      drawWarroom(canvasRef.current, game, selectedId, targetLockId, mode, hover, imageCacheRef.current, camera);
    }, [game, selectedId, targetLockId, mode, hover, drawTick, camera]);

    useEffect(function () {
      latestSaveRef.current = { game: game, gameMode: gameMode };
    }, [game, gameMode]);

    useEffect(function () {
      function flushLatestSave() {
        var latest = latestSaveRef.current;
        if (latest) writeSavedPayload(latest.game, latest.gameMode);
      }
      window.addEventListener("pagehide", flushLatestSave);
      return function () {
        window.removeEventListener("pagehide", flushLatestSave);
      };
    }, []);

    useEffect(function () {
      var cancelled = false;
      var hasIdleCallback =
        typeof window !== "undefined" &&
        typeof window.requestIdleCallback === "function";
      var write = function () {
        if (!cancelled) writeSavedPayload(game, gameMode);
      };
      var handle = hasIdleCallback
        ? window.requestIdleCallback(write, { timeout: 500 })
        : setTimeout(write, 120);
      return function () {
        cancelled = true;
        if (hasIdleCallback && typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(handle);
        } else {
          clearTimeout(handle);
        }
      };
    }, [game, gameMode]);

    useEffect(function () {
      var fx = game.fx || [];
      if (!fx.length) return;
      var rafId = null;
      function tickFx() {
        var now = Date.now();
        var active = fx.some(function (entry) {
          return now - entry.createdAt < 700;
        });
        if (!active) return;
        setDrawTick(function (n) { return n + 1; });
        rafId = requestAnimationFrame(tickFx);
      }
      rafId = requestAnimationFrame(tickFx);
      return function () {
        if (rafId) cancelAnimationFrame(rafId);
      };
    }, [game.fx]);

    useEffect(function () {
      function onResize() {
        setDrawTick(function (n) { return n + 1; });
      }
      window.addEventListener("resize", onResize);
      return function () { window.removeEventListener("resize", onResize); };
    }, []);

    useEffect(function () {
      var canvas = canvasRef.current;
      if (!canvas) return;
      function onWheel(event) {
        if (wheelHandlerRef.current) wheelHandlerRef.current(event);
      }
      canvas.addEventListener("wheel", onWheel, { passive: false });
      return function () { canvas.removeEventListener("wheel", onWheel); };
    }, []);

    // Touch controls (iPhone / iPad / Android): one-finger drag pans the
    // camera, pinch zooms, and a quick tap acts like a click. Listeners must
    // be native + non-passive so preventDefault can stop page scroll/zoom.
    useEffect(function () {
      var canvas = canvasRef.current;
      if (!canvas) return;
      function onTouchStart(e) { if (touchHandlersRef.current.start) touchHandlersRef.current.start(e); }
      function onTouchMove(e) { if (touchHandlersRef.current.move) touchHandlersRef.current.move(e); }
      function onTouchEnd(e) { if (touchHandlersRef.current.end) touchHandlersRef.current.end(e); }
      canvas.addEventListener("touchstart", onTouchStart, { passive: false });
      canvas.addEventListener("touchmove", onTouchMove, { passive: false });
      canvas.addEventListener("touchend", onTouchEnd, { passive: false });
      canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });
      return function () {
        canvas.removeEventListener("touchstart", onTouchStart);
        canvas.removeEventListener("touchmove", onTouchMove);
        canvas.removeEventListener("touchend", onTouchEnd);
        canvas.removeEventListener("touchcancel", onTouchEnd);
      };
    }, []);

    useEffect(function () {
      function onKeyDown(event) {
        var target = event.target;
        var tag = target && target.tagName ? target.tagName.toLowerCase() : "";
        if (tag === "input" || tag === "select" || tag === "textarea" || (target && target.isContentEditable)) return;

        if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
          event.preventDefault();
          panCamera(0, -8);
        } else if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
          event.preventDefault();
          panCamera(0, 8);
        } else if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
          event.preventDefault();
          panCamera(-8, 0);
        } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
          event.preventDefault();
          panCamera(8, 0);
        } else if (event.key === "+" || event.key === "=" || event.key === "PageUp") {
          event.preventDefault();
          zoomCamera(4);
        } else if (event.key === "-" || event.key === "_" || event.key === "PageDown") {
          event.preventDefault();
          zoomCamera(-4);
        }
      }
      window.addEventListener("keydown", onKeyDown);
      return function () { window.removeEventListener("keydown", onKeyDown); };
    }, []);

    useEffect(function () {
      if (resumedSavedGameRef.current) return;
      if (autoPresetLoadedRef.current || typeof importArmyCsv !== "function") return;
      var needsLoyalist = !hasArmyEntries(loyalistArmy);
      var needsTraitor = !hasArmyEntries(traitorArmy);
      if (!needsLoyalist && !needsTraitor) return;

      var loadedSides = [];
      var loyalistPreset = needsLoyalist ? armyPresetsFor("loyalist")[0] : null;
      var traitorPreset = needsTraitor ? armyPresetsFor("traitor")[0] : null;
      if (!loyalistPreset && !traitorPreset) return;
      autoPresetLoadedRef.current = true;
      if (loyalistPreset && importArmyCsv(loyalistPreset.csv, "loyalist")) {
        loadedSides.push("loyalist");
      }
      if (traitorPreset && importArmyCsv(traitorPreset.csv, "traitor")) {
        loadedSides.push("traitor");
      }
      if (loadedSides.length) {
        setPendingArmyLoad(loadedSides.length > 1 ? "both" : loadedSides[0]);
      }
    }, [loyalistArmy, traitorArmy, importArmyCsv]);

    useEffect(function () {
      if (!pendingArmyLoad) return;
      var needsLoyalist = pendingArmyLoad === "loyalist" || pendingArmyLoad === "both";
      var needsTraitor = pendingArmyLoad === "traitor" || pendingArmyLoad === "both";
      if ((needsLoyalist && !hasArmyEntries(loyalistArmy)) || (needsTraitor && !hasArmyEntries(traitorArmy))) return;

      var emptyDraft = { loyalist: [], traitor: [] };
      setDraftRosters(emptyDraft);
      restartWithGame(createGame(loyalistArmy, traitorArmy, emptyDraft));
      setPendingArmyLoad(null);
    }, [currentArmySignature, pendingArmyLoad]);

    useEffect(function () {
      if (selectedId) {
        var unit = findUnit(game, selectedId);
        if (!unit || unit.integrity <= 0 || unit.side !== game.currentSide || unit.activated) {
          setSelectedId(null);
        }
      }
      if (targetLockId) {
        var target = findUnit(game, targetLockId);
        if (!target || target.integrity <= 0) setTargetLockId(null);
      }
    }, [game, selectedId, targetLockId]);

    function commitGame(transform) {
      var next = typeof transform === "function" ? transform(game) : transform;
      if (next === game) return;
      setUndoStack(function (stack) {
        return [snapshotGame(game)].concat(stack).slice(0, MAX_UNDO);
      });
      setGame(next);
    }

    function undoLastOrder() {
      if (!undoStack.length) return;
      var previous = undoStack[0];
      setUndoStack(undoStack.slice(1));
      setSelectedId(null);
      setTargetLockId(null);
      setMode("move");
      setGame(previous);
    }

    function restartWithGame(nextGame) {
      resumedSavedGameRef.current = false;
      clearSavedPayload();
      setUndoStack([]);
      setGame(nextGame);
      setSelectedId(null);
      setTargetLockId(null);
      setMode("move");
      setCamera(defaultCameraForDevice());
    }

    function resetGame() {
      restartWithGame(createGame(loyalistArmy, traitorArmy, draftRosters));
    }

    function useBuilderRosters() {
      var emptyDraft = { loyalist: [], traitor: [] };
      setDraftRosters(emptyDraft);
      restartWithGame(createGame(loyalistArmy, traitorArmy, emptyDraft));
    }

    function clearDraftRosters() {
      var emptyDraft = { loyalist: [], traitor: [] };
      setDraftRosters(emptyDraft);
      restartWithGame(createGame(loyalistArmy, traitorArmy, emptyDraft));
    }

    function addPresetUnit(side) {
      var unitId = presetPick[side];
      var army = side === "loyalist" ? loyalistArmy : traitorArmy;
      var entry = makeEntryFromPreset(unitId, side, army && army.faction);
      if (!entry) return;
      var next = {
        loyalist: draftRosters.loyalist.slice(),
        traitor: draftRosters.traitor.slice(),
      };
      if (next[side].length >= MAX_UNITS) return;
      next[side].push(entry);
      setDraftRosters(next);
      restartWithGame(createGame(loyalistArmy, traitorArmy, next));
      setCamera(deploymentCameraFor(side, camera.tileSize));
    }

    function removeDraftUnit(side, idx) {
      var next = {
        loyalist: draftRosters.loyalist.slice(),
        traitor: draftRosters.traitor.slice(),
      };
      next[side].splice(idx, 1);
      setDraftRosters(next);
      restartWithGame(createGame(loyalistArmy, traitorArmy, next));
    }

    function clampCamera(next) {
      var canvas = canvasRef.current;
      var tileSize = clamp(next.tileSize || camera.tileSize, MIN_TILE_SIZE, MAX_TILE_SIZE);
      var width = canvas?.clientWidth || 900;
      var height = canvas?.clientHeight || 620;
      var visibleCols = Math.ceil(width / tileSize) + 1;
      var visibleRows = Math.ceil(height / tileSize) + 1;
      return {
        x: clamp(Math.round(next.x), 0, Math.max(0, BOARD_W - visibleCols + 1)),
        y: clamp(Math.round(next.y), 0, Math.max(0, BOARD_H - visibleRows + 1)),
        tileSize: tileSize,
      };
    }

    function panCamera(dx, dy) {
      setCamera(function (prev) {
        return clampCamera({ ...prev, x: prev.x + dx, y: prev.y + dy });
      });
    }

    function zoomCamera(delta) {
      setCamera(function (prev) {
        var nextSize = clamp(prev.tileSize + delta, MIN_TILE_SIZE, MAX_TILE_SIZE);
        return clampCamera({ ...prev, tileSize: nextSize });
      });
    }

    function fitCameraToBoard() {
      var canvas = canvasRef.current;
      var width = canvas?.clientWidth || 900;
      var height = canvas?.clientHeight || 620;
      var size = clamp(Math.floor(Math.min(width / BOARD_W, height / BOARD_H)), MIN_TILE_SIZE, MAX_TILE_SIZE);
      setCamera({ x: 0, y: 0, tileSize: size });
    }

    function focusCameraOn(unit) {
      if (!unit) return;
      var canvas = canvasRef.current;
      var width = canvas?.clientWidth || 900;
      var height = canvas?.clientHeight || 620;
      var visibleCols = Math.ceil(width / camera.tileSize);
      var visibleRows = Math.ceil(height / camera.tileSize);
      setCamera(function (prev) {
        return clampCamera({
          ...prev,
          x: unit.x - Math.floor(visibleCols / 2),
          y: unit.y - Math.floor(visibleRows / 2),
        });
      });
    }

    function warnGame(text) {
      var g = cloneGame(game);
      g.log.unshift(makeLog(text, "warning"));
      g.lastReport = { type: "warning", title: "Order Rejected", summary: text };
      commitGame(g);
    }

    function handleCanvasClick(event) {
      if (game.winner) return;
      var tile = tileFromEvent(canvasRef.current, event, camera);
      if (!tile) return;
      var clickedUnit = unitAt(game, tile.x, tile.y);
      if (clickedUnit && clickedUnit.side === game.currentSide) {
        if (!clickedUnit.activated) {
          setSelectedId(clickedUnit.id);
          setTargetLockId(null);
        }
        return;
      }
      if (!selected || selected.side !== game.currentSide) return;
      if (clickedUnit && clickedUnit.side !== selected.side) {
        setTargetLockId(clickedUnit.id);
        if (mode === "assault") {
          if (!canAssault(game, selected, clickedUnit)) {
            warnGame(clickedUnit.shortName + " is beyond " + selected.shortName + "'s charge reach.");
            return;
          }
          commitGame(function (prev) { return assaultUnit(prev, selected.id, clickedUnit.id); });
          setMode("move");
          return;
        }
        if (!canShoot(game, selected, clickedUnit)) {
          warnGame(clickedUnit.shortName + " is outside " + selected.shortName + "'s firing range.");
          return;
        }
        commitGame(function (prev) { return attackUnit(prev, selected.id, clickedUnit.id); });
        setMode("move");
        return;
      }
      if (!clickedUnit && mode === "move") {
        if (!canMoveTo(game, selected, tile.x, tile.y)) {
          warnGame("Grid " + tile.x + "." + tile.y + " is outside " + selected.shortName + "'s movement allowance.");
          return;
        }
        commitGame(function (prev) { return moveUnit(prev, selected.id, tile.x, tile.y); });
      }
    }

    function handleCanvasMove(event) {
      var tile = tileFromEvent(canvasRef.current, event, camera);
      setHover(function (prev) {
        if (!prev && !tile) return prev;
        if (prev && tile && prev.x === tile.x && prev.y === tile.y) return prev;
        return tile;
      });
    }

    function handleCanvasWheel(event) {
      event.preventDefault();
      zoomCamera(event.deltaY < 0 ? 4 : -4);
    }

    // React (17+) registers onWheel as a PASSIVE listener on its root, so
    // event.preventDefault() inside a React onWheel prop cannot stop the page
    // from scrolling while the player zooms the map (and logs a console
    // error). Attach a native non-passive wheel listener to the canvas
    // instead; the ref always points at the latest handler closure.
    wheelHandlerRef.current = handleCanvasWheel;

    function handleTouchStart(event) {
      if (event.touches.length === 2) {
        event.preventDefault();
        var a = event.touches[0];
        var b = event.touches[1];
        touchStateRef.current = {
          kind: "pinch",
          startDist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1,
          startSize: camera.tileSize,
        };
        return;
      }
      if (event.touches.length === 1) {
        var t = event.touches[0];
        touchStateRef.current = {
          kind: "pan",
          startX: t.clientX,
          startY: t.clientY,
          lastX: t.clientX,
          lastY: t.clientY,
          camX: camera.x,
          camY: camera.y,
          moved: false,
        };
      }
    }

    function handleTouchMove(event) {
      var state = touchStateRef.current;
      if (!state) return;
      event.preventDefault();
      if (state.kind === "pinch" && event.touches.length >= 2) {
        var a = event.touches[0];
        var b = event.touches[1];
        var dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1;
        var nextSize = clamp(Math.round(state.startSize * (dist / state.startDist)), MIN_TILE_SIZE, MAX_TILE_SIZE);
        setCamera(function (prev) {
          return clampCamera({ ...prev, tileSize: nextSize });
        });
        return;
      }
      if (state.kind === "pan" && event.touches.length === 1) {
        var t = event.touches[0];
        state.lastX = t.clientX;
        state.lastY = t.clientY;
        var dxPx = t.clientX - state.startX;
        var dyPx = t.clientY - state.startY;
        if (!state.moved && Math.hypot(dxPx, dyPx) > 8) state.moved = true;
        if (!state.moved) return;
        setCamera(function (prev) {
          return clampCamera({
            ...prev,
            x: state.camX - dxPx / prev.tileSize,
            y: state.camY - dyPx / prev.tileSize,
          });
        });
      }
    }

    function handleTouchEnd(event) {
      var state = touchStateRef.current;
      if (!state) return;
      if (event.touches.length > 0) {
        // Went from pinch to one finger: restart as a pan so the map
        // doesn't jump, and never treat the remaining finger as a tap.
        var t = event.touches[0];
        touchStateRef.current = {
          kind: "pan",
          startX: t.clientX,
          startY: t.clientY,
          lastX: t.clientX,
          lastY: t.clientY,
          camX: camera.x,
          camY: camera.y,
          moved: true,
        };
        return;
      }
      event.preventDefault(); // suppress the browser's synthetic click
      touchStateRef.current = null;
      if (state.kind === "pan" && !state.moved) {
        handleCanvasClick({ clientX: state.lastX, clientY: state.lastY });
      }
    }

    touchHandlersRef.current = {
      start: handleTouchStart,
      move: handleTouchMove,
      end: handleTouchEnd,
    };

    function handleEndOrders() {
      setSelectedId(null);
      setTargetLockId(null);
      setMode("move");
      commitGame(function (prev) { return endOrders(prev, gameMode); });
    }

    function handleBrace() {
      if (!selected) return;
      commitGame(function (prev) { return braceUnit(prev, selected.id); });
    }

    function nearestEnemyFor(unit) {
      if (!unit) return null;
      var enemies = aliveUnits(game).filter(function (candidate) {
        return candidate.side !== unit.side;
      });
      enemies.sort(function (a, b) {
        var inRangeA = tileDistance(unit, a) <= unit.range ? 0 : 1;
        var inRangeB = tileDistance(unit, b) <= unit.range ? 0 : 1;
        if (inRangeA !== inRangeB) return inRangeA - inRangeB;
        return tileDistance(unit, a) - tileDistance(unit, b);
      });
      return enemies[0] || null;
    }

    function currentTargetForResolver() {
      var locked = targetLockId ? findUnit(game, targetLockId) : null;
      if (locked && locked.integrity > 0 && selected && locked.side !== selected.side) return locked;
      return nearestEnemyFor(selected);
    }

    function openDetailedShooting() {
      if (!selected) return;
      var target = currentTargetForResolver();
      var attackerPreset = getPreset(selected.unitId) || {
        id: selected.unitId,
        name: selected.name,
        models: selected.models,
        bs: selected.bs,
      };
      var targetPreset = target ? (getPreset(target.unitId) || {
        id: target.unitId,
        name: target.name,
        models: target.models,
        t: target.toughness,
        sv: String(target.save),
        inv: target.inv ? String(target.inv) : "-",
      }) : null;

      if (typeof applyUnitPreset === "function") {
        applyUnitPreset({ ...attackerPreset, models: selected.models, bs: selected.bs });
      }
      if (typeof applyWeaponPreset === "function" && selected.weapon) {
        applyWeaponPreset(selected.weapon);
      }
      if (targetPreset && typeof applyTargetPreset === "function") {
        applyTargetPreset({
          ...targetPreset,
          models: target.models,
          t: target.toughness,
          sv: String(target.save),
          inv: target.inv ? String(target.inv) : "-",
        });
      }
      if (typeof setActivePhase === "function") setActivePhase("shooting");
    }

    function renderActionPrompt() {
      var hoveredUnit = hover ? unitAt(game, hover.x, hover.y) : null;
      var title = "Awaiting Orders";
      var detail = "Select a " + sideLabel(game.currentSide) + " unit from the roster or battlefield.";
      var tone = "info";

      if (game.winner) {
        title = "Battle Complete";
        detail = game.winner === "draw" ? "The sector is contested." : sideLabel(game.winner) + " controls the field.";
        tone = "score";
      } else if (selected) {
        var phaseLabel = mode === "assault" ? "ASSAULT" : mode === "shoot" ? "SHOOTING" : "MOVE";
        title = selected.shortName + " · " + phaseLabel;
        detail = "AP " + selected.ap + " · move " + selected.move + " · range " + selected.range + " · " + selected.meleeName + ".";
        if (hoveredUnit && hoveredUnit.side !== selected.side) {
          var dist = tileDistance(selected, hoveredUnit);
          if (mode === "assault") {
            var legalCharge = canAssault(game, selected, hoveredUnit);
            title = legalCharge ? "Charge Lane Clear" : "Beyond Charge Reach";
            detail = hoveredUnit.shortName + " at range " + dist + ". " + (legalCharge ? "Click to charge and fight melee (" + selected.meleeName + ")." : "Move closer to reach base contact.");
            tone = legalCharge ? "attack" : "warning";
          } else {
            var legalShot = canShoot(game, selected, hoveredUnit);
            title = legalShot ? "Target Acquired" : "Target Out Of Range";
            detail = hoveredUnit.shortName + " at range " + dist + ". " + (legalShot ? "Click to fire " + selected.weapon.name + "." : "Close distance or charge instead.");
            tone = legalShot ? "attack" : "warning";
          }
        } else if (hover && !hoveredUnit && mode === "move") {
          var legalMove = canMoveTo(game, selected, hover.x, hover.y);
          title = legalMove ? "Legal Move" : "Illegal Move";
          detail = "Grid " + hover.x + "." + hover.y + " is " + tileDistance(selected, hover) + " away. " + (legalMove ? "Click to spend 1 AP and advance." : "Outside movement allowance or occupied.");
          tone = legalMove ? "move" : "warning";
        }
      }

      return React.createElement("div", { className: "hh-game-action-prompt " + tone },
        React.createElement("strong", null, title),
        React.createElement("span", null, detail),
      );
    }

    function renderReport() {
      var report = game.lastReport;
      if (!report) return null;
      var stats = report.stats || null;
      var logLines = report.logLines || null;
      var kindLabel = report.kind === "assault" ? "ASSAULT RESOLVER"
        : report.kind === "shooting" ? "SHOOTING RESOLVER"
        : "Resolution Feed";
      return React.createElement("div", { className: "hh-game-report " + (report.type || "info") },
        React.createElement("div", { className: "hh-game-panel-title" }, kindLabel),
        React.createElement("strong", null, report.title || "Last Order"),
        React.createElement("p", null, report.summary || ""),
        stats && React.createElement("div", { className: "hh-game-report-grid" },
          stats.map(function (pill, idx) {
            return React.createElement(StatPill, { key: idx, label: pill.label, value: pill.value });
          }),
        ),
        logLines && logLines.length > 0 && React.createElement("div", { className: "hh-game-resolver-log" },
          logLines.map(function (line, idx) {
            var cls = "hh-game-resolver-line";
            if (/slain|casualt|destroy|annihilat|overrun|MODEL SLAIN/i.test(line)) cls += " kill";
            else if (/wins combat|unsaved|hit\(s\)|wound\(s\)/i.test(line)) cls += " hit";
            else if (/no save|saved|miss|cannot/i.test(line)) cls += " miss";
            return React.createElement("div", { key: idx, className: cls }, line);
          }),
        ),
      );
    }

    function renderSetupPanel() {
      return React.createElement("details", {
        className: "hh-game-setup",
        open: setupOpen,
        onToggle: function (event) { setSetupOpen(event.currentTarget.open); },
      },
        React.createElement("summary", null,
          React.createElement("span", null, "Scenario Setup"),
          React.createElement("strong", null, setupOpen ? "Hide" : "Open"),
        ),
        React.createElement("div", { className: "hh-game-setup-body" },
          renderGameModePanel(),
          renderArmyPresetPanel(),
          renderPresetDraftPanel(),
        ),
      );
    }

    function renderSideList(side, units) {
      return React.createElement("div", { className: "hh-game-roster" },
        React.createElement("div", { className: "hh-game-roster-title", style: { color: sideColor(side) } },
          sideLabel(side),
          side === game.currentSide ? " Orders" : "",
        ),
        units.map(function (unit) {
          return React.createElement(UnitButton, {
            key: unit.id,
            unit: unit,
            active: selectedId === unit.id,
            disabled: side !== game.currentSide || unit.activated || game.winner,
            onClick: function () {
              if (side === game.currentSide && !unit.activated && !game.winner) {
                setSelectedId(unit.id);
                focusCameraOn(unit);
              }
            },
          });
        }),
      );
    }

    function renderPresetOptions() {
      var categories = presetCategories();
      if (!categories.length) {
        return allUnits().map(function (unit) {
          return React.createElement("option", { key: unit.id, value: unit.id }, unit.name);
        });
      }
      return categories.map(function (category) {
        return React.createElement("optgroup", { key: category.category, label: category.category },
          category.units.map(function (unit) {
            return React.createElement("option", { key: category.category + "_" + unit.id, value: unit.id }, unit.name);
          }),
        );
      });
    }

    function renderDraftSide(side) {
      var draft = draftRosters[side] || [];
      return React.createElement("div", { className: "hh-game-draft-side" },
        React.createElement("div", { className: "hh-game-roster-title", style: { color: sideColor(side) } },
          sideLabel(side),
          " Presets ",
          draft.length,
          "/",
          MAX_UNITS,
        ),
        React.createElement("div", { className: "hh-game-draft-pick" },
          React.createElement("select", {
            value: presetPick[side],
            onChange: function (e) {
              var value = e.target.value;
              setPresetPick(function (prev) {
                return { ...prev, [side]: value };
              });
            },
            className: "hh-game-draft-select",
            title: sideLabel(side) + " preset unit",
          }, renderPresetOptions()),
          React.createElement("button", {
            type: "button",
            onClick: function () { addPresetUnit(side); },
            disabled: draft.length >= MAX_UNITS,
          }, "Add"),
        ),
        draft.length > 0 &&
          React.createElement("div", { className: "hh-game-draft-list" },
            draft.map(function (entry, idx) {
              return React.createElement("button", {
                key: entry.id,
                type: "button",
                onClick: function () { removeDraftUnit(side, idx); },
                title: "Remove " + entry.unitName,
              }, entry.unitName);
            }),
          ),
      );
    }

    function importArmyPreset(side) {
      if (typeof importArmyCsv !== "function") return;
      var preset = allArmyPresets().find(function (candidate) {
        return candidate.id === armyPresetPick[side];
      });
      if (!preset) return;

      var currentArmy = side === "loyalist" ? loyalistArmy : traitorArmy;
      if (
        hasArmyEntries(currentArmy) &&
        typeof window.confirm === "function" &&
        !window.confirm("Replace the current " + sideLabel(side) + " army with " + preset.name + "?")
      ) {
        return;
      }

      var ok = importArmyCsv(preset.csv, side);
      if (!ok) {
        if (typeof window.alert === "function") window.alert("Failed to load army preset.");
        return;
      }
      setPendingArmyLoad(side);
    }

    function changeGameMode(nextMode) {
      if (nextMode === gameMode) return;
      setGameMode(nextMode);
      restartWithGame(createGame(loyalistArmy, traitorArmy, draftRosters));
    }

    function renderGameModePanel() {
      return React.createElement("div", { className: "hh-game-mode" },
        React.createElement("div", { className: "hh-game-panel-title" }, "Game Mode"),
        React.createElement("div", { className: "hh-game-mode-toggle" },
          React.createElement("button", {
            type: "button",
            className: gameMode === GAME_MODE_SOLO ? "is-active" : "",
            onClick: function () { changeGameMode(GAME_MODE_SOLO); },
          }, "Solo: AI"),
          React.createElement("button", {
            type: "button",
            className: gameMode === GAME_MODE_HOTSEAT ? "is-active" : "",
            onClick: function () { changeGameMode(GAME_MODE_HOTSEAT); },
          }, "Two Player"),
        ),
      );
    }

    function renderArmyPresetOptions(side) {
      var presets = armyPresetsFor(side);
      if (!presets.length) {
        return React.createElement("option", { value: "" }, "No presets available");
      }
      return presets.map(function (preset) {
        return React.createElement("option", { key: preset.id, value: preset.id }, preset.name);
      });
    }

    function renderArmyPresetSide(side) {
      var presets = armyPresetsFor(side);
      return React.createElement("div", { className: "hh-game-army-preset-side" },
        React.createElement("div", { className: "hh-game-roster-title", style: { color: sideColor(side) } },
          sideLabel(side),
          " Army",
        ),
        React.createElement("div", { className: "hh-game-army-preset-pick" },
          React.createElement("select", {
            value: armyPresetPick[side],
            onChange: function (event) {
              var value = event.target.value;
              setArmyPresetPick(function (prev) {
                return { ...prev, [side]: value };
              });
            },
            disabled: !presets.length,
            className: "hh-game-army-preset-select",
            title: sideLabel(side) + " army preset",
          }, renderArmyPresetOptions(side)),
          React.createElement("button", {
            type: "button",
            onClick: function () { importArmyPreset(side); },
            disabled: typeof importArmyCsv !== "function" || !armyPresetPick[side],
          }, "Import"),
        ),
      );
    }

    function renderArmyPresetPanel() {
      return React.createElement("div", { className: "hh-game-army-presets" },
        React.createElement("div", { className: "hh-game-panel-title" }, "Army Preset Import"),
        renderArmyPresetSide("loyalist"),
        renderArmyPresetSide("traitor"),
      );
    }

    function renderPresetDraftPanel() {
      return React.createElement("div", { className: "hh-game-draft" },
        React.createElement("div", { className: "hh-game-panel-title" }, "Preset Unit Draft"),
        React.createElement("div", { className: "hh-game-draft-actions" },
          React.createElement("button", { type: "button", onClick: useBuilderRosters }, "Use Builder"),
          React.createElement("button", { type: "button", onClick: clearDraftRosters }, "Clear Draft"),
        ),
        renderDraftSide("loyalist"),
        renderDraftSide("traitor"),
      );
    }

    function renderBoardLog() {
      return React.createElement("div", { className: "hh-game-board-log" + (boardLogOpen ? "" : " is-collapsed"), "aria-live": "polite" },
        React.createElement("button", {
          type: "button",
          className: "hh-game-board-log-title",
          onClick: function () { setBoardLogOpen(!boardLogOpen); },
          "aria-expanded": boardLogOpen,
        }, "Battle Log ", boardLogOpen ? "▾" : "▸"),
        boardLogOpen && game.log.slice(0, 4).map(function (entry) {
          return React.createElement("div", { key: entry.id, className: "hh-game-board-log-entry " + entry.type }, entry.text);
        }),
      );
    }

    function renderMapControls() {
      return React.createElement("div", { className: "hh-game-map-controls" },
        React.createElement("div", { className: "hh-game-map-readout" },
          "50x50 Sector",
          React.createElement("span", null, "View ", camera.x, ".", camera.y, " / Z", camera.tileSize),
        ),
        React.createElement("div", { className: "hh-game-pan-pad" },
          React.createElement("button", { type: "button", onClick: function () { panCamera(0, -8); }, title: "Pan north" }, "N"),
          React.createElement("button", { type: "button", onClick: function () { panCamera(-8, 0); }, title: "Pan west" }, "W"),
          React.createElement("button", { type: "button", onClick: function () { panCamera(8, 0); }, title: "Pan east" }, "E"),
          React.createElement("button", { type: "button", onClick: function () { panCamera(0, 8); }, title: "Pan south" }, "S"),
        ),
        React.createElement("div", { className: "hh-game-zoom-pad" },
          React.createElement("button", { type: "button", onClick: function () { zoomCamera(4); }, title: "Zoom in", "aria-keyshortcuts": "+ PageUp" }, "Zoom In"),
          React.createElement("button", { type: "button", onClick: function () { zoomCamera(-4); }, title: "Zoom out", "aria-keyshortcuts": "- PageDown" }, "Zoom Out"),
          React.createElement("button", { type: "button", onClick: function () { setCamera(deploymentCameraFor(game.currentSide, camera.tileSize)); }, title: "Focus deployment" }, "DEP"),
          React.createElement("button", { type: "button", onClick: function () { setCamera(centerCamera(camera.tileSize)); }, title: "Focus center" }, "CTR"),
          React.createElement("button", { type: "button", onClick: fitCameraToBoard, title: "Fit the whole 50x50 board on screen" }, "FIT"),
        ),
      );
    }

    function renderSelectedPanel() {
      if (!selected) {
        return React.createElement("div", { className: "hh-game-selected empty" },
          React.createElement("div", { className: "hh-game-panel-title" }, "Command Uplink"),
          React.createElement("div", { className: "hh-game-empty-state" }, game.winner ? "Simulation closed." : "Select a unit on the map or roster."),
        );
      }
      var resolverTarget = currentTargetForResolver();
      return React.createElement("div", { className: "hh-game-selected" },
        React.createElement("div", { className: "hh-game-panel-title" }, "Selected Unit"),
        React.createElement("div", { className: "hh-game-selected-head" },
          React.createElement("span", {
            className: "hh-game-selected-art",
            style: selected.artSrc ? { backgroundImage: "url('" + selected.artSrc.replace(/'/g, "%27") + "')" } : null,
          }),
          React.createElement("div", null,
            React.createElement("strong", null, selected.name),
            React.createElement("span", null, selected.weapon.name),
          ),
        ),
        React.createElement("div", { className: "hh-game-mini-grid" },
          React.createElement(StatPill, { label: "Wounds", value: selected.integrity + "/" + selected.maxIntegrity }),
          React.createElement(StatPill, { label: "Models", value: selected.models + "/" + (selected.modelsMax || selected.models) }),
          React.createElement(StatPill, { label: "AP", value: selected.ap }),
          React.createElement(StatPill, { label: "Move", value: selected.move }),
          React.createElement(StatPill, { label: "Range", value: selected.range }),
          React.createElement(StatPill, { label: "Melee", value: "WS" + selected.ws + " A" + selected.attacks }),
        ),
        React.createElement("div", { className: "hh-game-target-line" },
          React.createElement("span", null, "Detailed target"),
          React.createElement("strong", null, resolverTarget ? resolverTarget.shortName : "none in auspex"),
        ),
        React.createElement("div", { className: "hh-game-actions" },
          React.createElement("button", {
            type: "button",
            className: mode === "move" ? "is-active" : "",
            onClick: function () { setMode("move"); },
            disabled: selected.side !== game.currentSide || selected.activated || game.winner,
            title: "Move phase — click a green tile to advance",
          }, "Move"),
          React.createElement("button", {
            type: "button",
            className: mode === "shoot" ? "is-active" : "",
            onClick: function () { setMode("shoot"); },
            disabled: selected.side !== game.currentSide || selected.activated || game.winner,
            title: "Shooting phase — click an enemy in range to fire the full resolver",
          }, "Shoot"),
          React.createElement("button", {
            type: "button",
            className: mode === "assault" ? "is-active" : "",
            onClick: function () { setMode("assault"); },
            disabled: selected.side !== game.currentSide || selected.activated || game.winner,
            title: "Assault phase — click an enemy in charge reach to charge and fight melee",
          }, "Assault"),
          React.createElement("button", {
            type: "button",
            onClick: handleBrace,
            disabled: selected.side !== game.currentSide || selected.activated || game.winner,
            title: "Brace",
          }, "Brace"),
          React.createElement("button", {
            type: "button",
            onClick: openDetailedShooting,
            disabled: !resolverTarget,
            title: "Open the full Shooting resolver tab with this unit and nearest target",
          }, "Resolver"),
        ),
      );
    }

    return React.createElement("div", { className: "hh-game-shell" },
      React.createElement("section", { className: "hh-game-stage" },
        React.createElement("div", { className: "hh-game-topline" },
          React.createElement("div", null,
            React.createElement("div", { className: "hh-game-kicker" }, "M31 WARROOM SIMULATION"),
            React.createElement("h1", null, "Calth Sector Clash"),
          ),
          React.createElement("div", { className: "hh-game-score" },
            React.createElement(StatPill, { label: "Round", value: game.round + "/" + MAX_ROUNDS }),
            React.createElement(StatPill, { label: "Orders", value: sideLabel(game.currentSide), color: sideColor(game.currentSide) }),
            React.createElement(StatPill, { label: "Loyalist", value: game.vp.loyalist, color: sideColor("loyalist") }),
            React.createElement(StatPill, { label: "Traitor", value: game.vp.traitor, color: sideColor("traitor") }),
          ),
        ),
        React.createElement("div", { className: "hh-game-canvas-wrap" },
          React.createElement("canvas", {
            ref: canvasRef,
            className: "hh-game-canvas",
            onClick: handleCanvasClick,
            onMouseMove: handleCanvasMove,
            onMouseLeave: function () {
              setHover(function (prev) { return prev ? null : prev; });
            },
            role: "img",
            "aria-label": "Horus Heresy tactical warroom battlefield",
          }),
          renderMapControls(),
          renderActionPrompt(),
          renderBoardLog(),
          game.winner && React.createElement("div", { className: "hh-game-victory" },
            React.createElement("span", null, game.winner === "draw" ? "DRAW" : sideLabel(game.winner).toUpperCase() + " VICTORY"),
            React.createElement("button", { type: "button", onClick: resetGame }, "Run Again"),
          ),
        ),
        React.createElement("div", { className: "hh-game-objectives" },
          OBJECTIVES.map(function (obj) {
            var owner = controls[obj.id];
            return React.createElement("div", { key: obj.id, className: "hh-game-objective " + (owner || "neutral") },
              React.createElement("strong", null, obj.id),
              React.createElement("span", null, owner ? sideLabel(owner) : obj.x + "." + obj.y),
            );
          }),
        ),
      ),
      React.createElement("aside", { className: "hh-game-command" },
        React.createElement("div", { className: "hh-game-command-row" },
          React.createElement("button", { type: "button", onClick: resetGame }, "New Simulation"),
          React.createElement("button", {
            type: "button",
            onClick: undoLastOrder,
            disabled: !undoStack.length,
            title: "Undo the last Warroom order",
          }, "Undo"),
          React.createElement("button", { type: "button", onClick: function () { setActivePhase("army_builder"); } }, "Army Builder"),
        ),
        React.createElement("div", { className: "hh-game-source" },
          game.source,
          " · ",
          resumedSavedGameRef.current ? "Autosave resumed" : "Autosave active",
        ),
        renderSelectedPanel(),
        React.createElement("button", {
          type: "button",
          className: "hh-game-end-turn",
          onClick: handleEndOrders,
          disabled: game.winner || (gameMode === GAME_MODE_SOLO && game.currentSide !== "loyalist"),
        }, "End ", sideLabel(game.currentSide), " Orders"),
        renderReport(),
        renderSideList("loyalist", loyalistAlive),
        renderSideList("traitor", traitorAlive),
        renderSetupPanel(),
        React.createElement("div", { className: "hh-game-log" },
          React.createElement("div", { className: "hh-game-panel-title" }, "Battle Log"),
          game.log.slice(0, 8).map(function (entry) {
            return React.createElement("div", { key: entry.id, className: "hh-game-log-entry " + entry.type }, entry.text);
          }),
        ),
      ),
    );
  }

  window.HeresyWarroomGame = HeresyWarroomGame;
})();
