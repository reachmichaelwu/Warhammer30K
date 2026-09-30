// Apply the pinned New Recruit HH3 characteristics after core and legacy data.
// Model characteristics and weapon modifiers are intentionally separate.
function newRecruitModifiedStat(base, modifier) {
  if (modifier === "I" || modifier === "A" || modifier === "S") return base;
  if (/^[+-]\d+$/.test(modifier)) return Math.max(0, base + Number(modifier));
  if (/^\d+$/.test(modifier)) return Number(modifier);
  return null;
}

function newRecruitMeleeProfile(unit, weapon) {
  var result = Object.assign({}, weapon);
  ["ws", "w", "t", "sv", "inv", "fnp", "ld", "cl", "wp", "int", "move"].forEach(function (key) {
    if (unit[key] !== undefined) result[key] = unit[key];
  });
  result.baseI = unit.i;
  result.baseA = unit.a;
  result.baseS = unit.s;
  var source = NEW_RECRUIT_MELEE_STATS[unit.id + ":" + weapon.name] || NEW_RECRUIT_MELEE_STATS[weapon.name];
  if (!source) {
    // Bespoke/combined weapon entries require their own mapping. Do not invent
    // modifiers by subtracting the old (often incorrect) model characteristics.
    result.sourceWeaponVerified = false;
    return result;
  }
  [["i", "IM"], ["a", "AM"], ["s", "SM"]].forEach(function (pair) {
    var value = newRecruitModifiedStat(unit[pair[0]], source[pair[1]]);
    if (value !== null && Number.isFinite(value)) result[pair[0]] = value;
  });
  result.ap = source.AP;
  result.d = /^\d+$/.test(source.D) ? Number(source.D) : source.D;
  result.damage = result.d;
  result.traits = source.Traits;
  result.sourceWeaponVerified = true;
  result.sourceWeaponProfileId = source.sourceProfileId;
  result.sourceSpecialRules = source["Special Rules"];
  result.weaponModifiers = { i: source.IM, a: source.AM, s: source.SM };
  result.rules = Object.assign({}, weapon.rules);
  // Old Unwieldy flags otherwise overwrite the verified HH3 IM with I1.
  delete result.rules.m_unwieldy;
  if (source.D === "*") result.variableDamage = true;
  return result;
}

(function applyNewRecruitUnitStats() {
  UNIT_PRESETS_ALL_UNITS.forEach(function (unit) {
    var stats = NEW_RECRUIT_UNIT_STATS[unit.id];
    if (!stats) throw new Error("Missing New Recruit unit mapping: " + unit.id);
    Object.assign(unit, stats);
    var leader = unit.modelProfiles.find(function (profile) {
      return /Sergeant|Champion|Command/.test(profile.stats.modelType) &&
        !/Master Sergeant|Petty Warlord|Paragon of Metal/.test(profile.name);
    });
    if (leader) unit.leaderProfile = leader;
    if (!unit.isVehicle && !MELEE_WEAPON_PROFILES[unit.id]) {
      MELEE_WEAPON_PROFILES[unit.id] = [Object.assign({ name: "Close Combat Weapon", ap: "-", rules: {} }, stats)];
    }
    // Each alternate model retains its actual characteristics (including squad
    // leaders and Ordinatus components), rather than averaging a mixed unit.
    if (typeof MELEE_WEAPON_PROFILES !== "undefined" && MELEE_WEAPON_PROFILES[unit.id]) {
      MELEE_WEAPON_PROFILES[unit.id] = MELEE_WEAPON_PROFILES[unit.id].map(function (weapon) {
        return newRecruitMeleeProfile(unit, weapon);
      });
    }
  });
})();

// Sergeant weapon categories describe equipment, not a universal model profile.
function getNewRecruitSergeantMeleeWeapons(unit) {
  if (!unit) return [];
  var category = getSgtCategory(unit.id);
  var weapons = category ? SERGEANT_MELEE_WEAPONS[category] || [] : [];
  if (!unit.leaderProfile) return weapons;
  var leader = Object.assign({ id: unit.id }, unit.leaderProfile.stats);
  return weapons.map(function (weapon) { return newRecruitMeleeProfile(leader, weapon); });
}

function formatNewRecruitUnitStats(unit) {
  function save(value) { return value && value !== "-" ? value + "+" : "-"; }
  if (unit.isVehicle) {
    var armour = unit.primaryArmour !== undefined
      ? "Primary " + unit.primaryArmour + " / Exposed " + unit.exposedArmour
      : unit.armour !== undefined ? "Armour " + unit.armour
      : "AV " + unit.avF + "/" + unit.avS + "/" + unit.avR;
    return "M" + unit.move + " · BS" + unit.bs + " · " + armour + " · HP" + unit.hp;
  }
  return [["M", "move"], ["WS", "ws"], ["BS", "bs"], ["S", "s"], ["T", "t"],
    ["W", "w"], ["I", "i"], ["A", "a"], ["LD", "ld"], ["CL", "cl"], ["WP", "wp"], ["IN", "int"]]
    .map(function (pair) { return pair[0] + (unit[pair[1]] === undefined ? "-" : unit[pair[1]]); }).join(" · ") +
    " · Sv" + save(unit.sv) + " · Inv" + save(unit.inv) + (unit.fnp !== "-" ? " · FNP" + save(unit.fnp) : "");
}
