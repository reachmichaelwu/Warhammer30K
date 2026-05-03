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
    { name: "Tyrant Rocket Launcher", shots: 2, s: 8, ap: "3", damage: 1, type: "Heavy", rules: { breaching5: true } },
    { name: "Combi-Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
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
    { name: "Combi-Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
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
    { name: "Alchem Flamer", shots: 1, s: 4, ap: "4", damage: 1, type: "Assault", rules: { template: true, poisoned2: true } },
  ],
  grave_warden: [
    { name: "Assault Grenade Launcher", shots: 1, s: 4, ap: "4", damage: 1, type: "Assault", rules: { blast: true, poisoned: true } },
  ],
  // XV Thousand Sons
  sekhmet: [
    { name: "Inferno Bolter", shots: 2, s: 4, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true } },
  ],
  // XVI Sons of Horus
  justaerin: [
    { name: "Combi-Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Plasma Blaster (Sustained)", shots: 2, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true } },
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
    { name: "Combi-Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
  ],
  // XX Alpha Legion
  lernaean: [
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true } },
  ],
  headhunter: [
    { name: "Combi-Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Disintegrator Blaster", shots: 2, s: 5, ap: "3", damage: 1, type: "Assault", rules: { getshot: true } },
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

