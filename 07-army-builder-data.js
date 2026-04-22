// Army builder data, detachments, legion factions, weapon profiles main table, melee sgt data
// Lines 1723-2976 from shooting-resolver165.jsx

// ━━━ ARMY BUILDER: CRUSADE FORCE ORGANISATION (3rd Edition PDF) ━━━━━━━━━━━━━

// 15 Battlefield Roles from the Crusade Army Selection process (p.285)
var BATTLEFIELD_ROLES = {
  warlord:        { label: "Warlord",         icon: "👑", color: "#d4af37", desc: "Primarchs and powerful warlords. Max 25% of army points on Warlord/LoW combined." },
  lord_of_war:    { label: "Lord of War",     icon: "⚡", color: "#b8860b", desc: "The largest and most powerful Units. Max 25% of army points on Warlord/LoW combined." },
  high_command:   { label: "High Command",    icon: "🎖", color: "#8b0000", desc: "Highest ranked officers. Each unlocks 1 Apex OR 1 Auxiliary Detachment." },
  command:        { label: "Command",         icon: "★", color: "#8b6508", desc: "Line officers. Each unlocks 1 Auxiliary Detachment." },
  retinue:        { label: "Retinue",         icon: "🛡", color: "#5b4a8a", desc: "Warriors guarding the Army's officers." },
  elites:         { label: "Elites",          icon: "◆", color: "#6b2fa0", desc: "The most deadly warriors available." },
  war_engine:     { label: "War-Engine",      icon: "⬡", color: "#4a4a4a", desc: "Dreadnoughts and similar war engines." },
  troops:         { label: "Troops",          icon: "╬", color: "#2a6fb4", desc: "Line troops that hold ground and claim victory." },
  support:        { label: "Support",         icon: "⚙", color: "#6a5e4e", desc: "Support troops that aid others." },
  transport:      { label: "Transport",       icon: "◻", color: "#607060", desc: "Dedicated to ferrying vulnerable Units." },
  heavy_assault:  { label: "Heavy Assault",   icon: "⛊", color: "#700000", desc: "Heavy assault Units to break enemy lines." },
  heavy_transport:{ label: "Heavy Transport", icon: "▰", color: "#505050", desc: "The heaviest and most well-protected transports." },
  armour:         { label: "Armour",          icon: "▬", color: "#3a5a3a", desc: "Armoured vehicles with the most powerful weapons." },
  recon:          { label: "Recon",           icon: "◎", color: "#2e8b57", desc: "Light infantry and cavalry to harass and track." },
  fast_attack:    { label: "Fast Attack",     icon: "»", color: "#1a7a3a", desc: "Fast Units capable of striking and withdrawing." },
};

// Unit -> Battlefield Role mapping (per spreadsheet & Legiones Astartes Army List)
var UNIT_BATTLEFIELD_ROLE = {};
function assignUnitRoles(role, unitIds) {
  unitIds.forEach(function (unitId) {
    UNIT_BATTLEFIELD_ROLE[unitId] = role;
  });
}

assignUnitRoles("warlord", ["lion", "khan", "russ", "dorn", "sanguinius", "ferrus", "guilliman", "vulkan", "corax", "fulgrim", "perturabo", "curze", "angron", "lorgar", "mortarion", "magnus", "horus", "alpharius", "valdor_c"]);
assignUnitRoles("high_command", ["praetor_pa", "praetor_ta", "praetor_sat", "corswain", "marduk_sedras", "eidolon", "warsmith", "qin_xa", "hvarl", "sigismund", "fafnir_rann", "evander_garrius", "sevatar", "raldoron", "shadrak_meduson", "iron_father", "kharn", "remus_ventanus", "calas_typhon", "ahriman", "ezekyle_abaddon", "little_horus", "kor_phaeron", "armillus_dynat", "legate_cmd_sa", "tribune_c", "archmagos_tm", "archmagos_abeyant_tm", "scoria_mm", "draykavac_mm"]);
assignUnitRoles("command", ["centurion", "centurion_ta", "centurion_sat", "optae", "champion", "master_signals", "vigilator", "chaplain", "librarian", "herald", "moritat", "siege_breaker", "esoterist", "praevian", "overseer", "damocles_rhino", "lucius", "saul_tarvitz", "hibou_khan", "stormseer", "geigor", "caster_of_runes", "camba_diaz", "alexis_polux", "dom_zephon", "aster_crohne", "lotara_sarrin", "magistus_amon", "prosperine_sorc", "tybalt_marr", "vheren_ash", "garviel_loken", "maloghurst", "dark_emissary", "erebus", "argel_tal", "zardu_layak", "kaedes_nex", "saboteur", "exodus_al", "tactical_cmd_sa", "line_cmd_sa", "veletaris_cmd_sa", "hermes_cmd_sa", "artillery_cmd_sa", "armoured_cmd_sa", "shield_captain_c", "magos_tm", "magos_abeyant_tm", "arcuitor_tm"]);
assignUnitRoles("retinue", ["praetorian_cmd_jp", "praetorian_cmd", "tartaros_cmd", "centurion_cmd", "cataphractii_cmd", "saturnine_cmd"]);
assignUnitRoles("elites", ["veteran", "veteran_assault", "seeker", "custodian_guard", "sagittarum", "aquilon", "deathwing_comp", "inner_circle_knight", "palatine_blade", "kharash", "deathsworn", "templar_brethren", "crimson_paladin", "rampager", "invictarus_suz", "khenetai_blade", "reaver_soh", "dark_brethren", "anakatis_kul", "phraetus_conclave", "veletaris_vanguard_sa", "scyllax_tm", "secutor_tm"]);
assignUnitRoles("troops", ["tactical", "despoiler", "breacher", "assault", "tactical_support", "lasrifle", "veletaris", "tech_thrall", "dreadwing_inter", "grey_slayer", "phalanx_warder", "executioner_nl", "erelim", "immortal_ih", "praetorian_um", "incendiary_wb", "daemon_lesser", "custodian_guard_c", "sentinel_guard_c", "tech_thrall_cov_tm", "thallax_full_tm"]);
assignUnitRoles("heavy_assault", ["cataphractii", "tartaros", "saturnine", "destroyer", "phoenix_term", "tyrant_siege_term", "varagyr", "contekar", "gorgon_term", "red_butcher", "deathshroud", "grave_warden", "sekhmet", "justaerin", "firedrake", "lernaean", "charonite_sa", "aquilon_c", "ursarax_tm"]);
assignUnitRoles("support", ["heavy_support", "rapier_la", "rapier", "apothecary", "techmarine", "araknae", "thallax", "myrmidon_dest", "ogryn", "kakophoni", "pyroclast", "basilisk_sa", "medusa_sa", "aethon_sa", "tech_priest_tm", "echidnax_tm", "destructor_tm"]);
assignUnitRoles("war_engine", ["contemptor", "leviathan", "deredeo", "saturnine_dread", "castellax", "thanatar", "domitar_ferrum", "contemp_incaendius", "castellax_achea", "contemp_osiron", "mhara_gal", "contemptor_achillus_c", "contemptor_galatus_c", "domitar_tm", "castellax_dest_tm", "castellax_battle_tm", "thanatar_siege_tm", "armiger_tm", "decimator_mm", "blood_slaughterer_mm"]);
assignUnitRoles("transport", ["rhino", "termite", "drop_pod", "arvus_sa", "coronus_c", "triaros_tm"]);
assignUnitRoles("heavy_transport", ["land_raider", "spartan", "dreadnought_drop_pod", "dreadclaw", "kharybdis", "dracosan_sa"]);
assignUnitRoles("armour", ["predator", "sicaran", "sicaran_venator", "vindicator", "kratos", "scorpius", "arquitor", "caladius", "leman_russ_strike_sa", "leman_russ_assault_sa", "caladius_c"]);
assignUnitRoles("recon", ["recon", "sabre", "outrider", "land_raider_exp", "tarantula", "vorax", "kyzagan", "mor_deythan", "headhunter", "hermes_light_sa"]);
assignUnitRoles("fast_attack", ["xiphon", "storm_eagle", "fire_raptor", "scimitar_jetbike", "javelin", "land_speeder", "keshig_rider", "night_raptor", "dawnbreaker", "dark_fury_rg", "hermes_vel_sa", "primaris_lightning_sa", "thunderbolt_sa", "venatari_c", "gyrfalcon_c", "pallas_c"]);
assignUnitRoles("lord_of_war", ["cerberus", "typhon", "glaive", "fellblade", "falchion", "thunderhawk", "daemon_greater", "malcador_sa", "malcador_infernus_sa", "valdor_sa", "stormhammer_sa", "telemon_c", "orion_c", "ares_c", "brass_scorpion_mm", "kytan_mm"]);

var ROLE_TO_UNIT_IDS = {};
Object.entries(UNIT_BATTLEFIELD_ROLE).forEach(function (entry) {
  var unitId = entry[0];
  var role = entry[1];
  if (!ROLE_TO_UNIT_IDS[role]) ROLE_TO_UNIT_IDS[role] = [];
  ROLE_TO_UNIT_IDS[role].push(unitId);
});

// ━━━ CRUSADE PRIMARY DETACHMENT (p.284) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// The Crusade Primary Detachment: 1 High Command, 3 Command (1st prime), 4 Troops (1st prime), 4 Transport
var CRUSADE_PRIMARY = {
  name: "Crusade Primary Detachment",
  slots: [
    { role: "high_command", count: 1, prime: false },
    { role: "command",      count: 3, primeCount: 1 },  // first slot is prime
    { role: "troops",       count: 4, primeCount: 1 },  // first slot is prime
    { role: "transport",    count: 4, prime: false },
  ],
};

// Additional Detachments — unlocked by High Command (p.284)
var ADDITIONAL_DETACHMENTS = {
  warlord_det: {
    name: "Warlord Detachment",
    desc: "Must be same Faction as Primary. Only in 3000+ pt armies.",
    icon: "👑",
    color: "#d4af37",
    slots: [
      { role: "warlord",         count: 1 },
      { role: "retinue",         count: 1 },
      { role: "heavy_transport", count: 1 },
    ],
  },
  lord_of_war_det: {
    name: "Lord of War Detachment",
    desc: "Total may not exceed 25% of Army points.",
    icon: "⚡",
    color: "#b8860b",
    slots: [
      { role: "lord_of_war", count: 2 },
    ],
  },
  allied_det: {
    name: "Allied Detachment",
    desc: "Command slots may be filled by any Legion Command unit and each unlocks one Auxiliary Detachment. Troop slots must be Solar Auxilia, Mechanicum, or Custodes.",
    icon: "🤝",
    color: "#5b7a9d",
    isAllied: true,
    slots: [
      { role: "command", count: 2, primeCount: 1 },
      { role: "troops",  count: 4 },
    ],
  },
};

// Allied faction unit filter — these categories are available in Allied Detachments
// "MECHANICUM" is now split into "MECH: *" sub-categories; the helper below is used instead.
var ALLIED_FACTION_CATEGORIES = ["SOLAR AUXILIA", "CUSTODES"];
function isMechCategory(cat) { return cat && cat.startsWith("MECH:"); }
function isSACategory(cat)   { return cat === "SOLAR AUXILIA" || (cat && cat.startsWith("SA: ")); }

// Auxiliary Detachments — each Command slot filled unlocks 1 (p.284)
var AUXILIARY_DETACHMENTS = {
  armoured_fist:    { name: "Armoured Fist",    slots: [{ role: "transport", count: 4 }, { role: "heavy_transport", count: 4 }] },
  tactical_support: { name: "Tactical Support",  slots: [{ role: "troops", count: 2 }, { role: "support", count: 2 }] },
  armoured_support: { name: "Armoured Support",  slots: [{ role: "armour", count: 4 }] },
  heavy_support:    { name: "Heavy Support",     slots: [{ role: "war_engine", count: 1 }] },
  combat_pioneer:   { name: "Combat Pioneer",    slots: [{ role: "recon", count: 2 }] },
  shock_assault:    { name: "Shock Assault",     slots: [{ role: "heavy_assault", count: 2 }] },
  first_strike:     { name: "First Strike",      slots: [{ role: "fast_attack", count: 2 }] },
  // Legion-specific Auxiliary Detachments (from p.16-17)
  daemonic_manifest:{ name: "Daemonic Manifestation", desc: "Traitor Esoterist in Command → unlock", slots: [{ role: "heavy_assault", count: 3 }] },
  veteran_cadre:    { name: "Veteran Cadre",     desc: "Legion Champion in Command → unlock", slots: [{ role: "elites", count: 3 }] },
  techmarine_cov:   { name: "Techmarine Covenant", desc: "Techmarine in Support → unlock", slots: [{ role: "support", count: 4 }] },
  storm_battery:    { name: "Storm Battery",     desc: "Siege Breaker in Command → unlock", slots: [{ role: "support", count: 3 }, { role: "armour", count: 1 }] },
  recon_demi:       { name: "Recon Demi-Company", desc: "Vigilator in Command → unlock", slots: [{ role: "recon", count: 4 }] },
  apoth_delegation:   { name: "Apothecarion Delegation", slots: [{ role: "support", count: 3 }] },
  maelstrom_sentry:   { name: "Maelstrom Sentry Battery", desc: "Master of Signals in Command → unlock. Support: Araknae Quad Accelerator Platform only. Recon: Tarantula Battery only.", slots: [{ role: "support", count: 2 }, { role: "recon", count: 3 }] },
};

// Apex Detachments — each High Command slot filled unlocks 1 (p.284)
var APEX_DETACHMENTS = {
  combat_retinue:      { name: "Combat Retinue",       slots: [{ role: "retinue", count: 3, primeCount: 1 }] },
  officer_cadre:       { name: "Officer Cadre",        slots: [{ role: "command", count: 2, primeCount: 1 }] },
  army_vanguard:       { name: "Army Vanguard",        slots: [{ role: "elites", count: 3, primeCount: 1 }] },
  linebreaker_echelon:       { name: "Linebreaker Echelon",       desc: "Select 'Saturnine', 'Cataphractii' or 'Tartaros'. Retinue and Heavy Assault Slots restricted to Units whose name includes the selected word.", slots: [{ role: "heavy_assault", count: 2, primeCount: 1 }, { role: "retinue", count: 1 }, { role: "war_engine", count: 1 }] },
  leviathan_armoured_fist:   { name: "Leviathan Armoured Fist",   desc: "Attacker Detachment (Leviathan Missions). Lord of War Units in this Detachment do NOT count towards the 25% of total Points Limit restriction that usually applies to Lord of War Units.", slots: [{ role: "lord_of_war", count: 3 }] },
  leviathan_bastion_of_fire: { name: "Leviathan Bastion of Fire", desc: "Defender Detachment (Leviathan Missions). Support units form a layered defensive firebase.", slots: [{ role: "support", count: 3, primeCount: 1 }] },
};

// Prime Advantages (p.283) — bonus for filling Prime slots
var PRIME_ADVANTAGES = [
  { id: "master_sergeant", name: "Master Sergeant", desc: "Sergeant gains +1 A, WS & Ld, and Champion Sub-Type. Once per Detachment.", oncePerDet: true, requiresSgt: true },
  { id: "combat_veterans", name: "Combat Veterans", desc: "All models gain +1 Ld, Cool, Int & WP (max 10)." },
  { id: "paragon_of_battle", name: "Paragon of Battle", desc: "One Command Sub-Type model gains +1 A, WS & BS.", requiresCommand: true },
  { id: "special_assignment", name: "Special Assignment", desc: "Command Slot may be filled by High Command unit. No additional Detachments from this Slot.", commandOnly: true },
  { id: "logistical_benefit", name: "Logistical Benefit", desc: "Add one extra FOC Slot (any role except High Command, Command, Warlord, Lord of War). Once per Detachment.", oncePerDet: true, addsSlot: true },
];

// Allegiance-Specific Prime Advantages
var ALLEGIANCE_PRIME_ADVANTAGES = [
  { id: "true_believers", name: "True Believers", desc: "All models in the Prime unit gain the Malefic Sub-Type.", allegiance: "traitor" },
];

// Legion-Specific Prime Advantages
var LEGION_PRIME_ADVANTAGES = {
  emperors_children: [
    { id: "phoenix_warden", name: "Phoenix Warden", desc: "Tartaros Centurion: replace combi-bolter & power weapon with Phoenix power spear (free). Gains Skill Unmatched.", requiresUnit: ["centurion_ta"] },
  ],
  iron_warriors: [
    { id: "the_unfavoured", name: "The Unfavoured", desc: "Infantry unit gains Expendable (1) Special Rule.", requiresInfantry: true },
  ],
  white_scars: [
    { id: "sagyar_mazan", name: "The Sagyar Mazan", desc: "Any Prime Slot unit gains Expendable (2) Special Rule." },
  ],
  night_lords: [
    { id: "atramentar", name: "Atramentar", desc: "Centurion in Terminator Armour or Terminator Squad gains Deep Strike and Impact (1).", requiresUnit: ["centurion_ta", "cataphractii_cmd", "tartaros_cmd", "cataphractii", "tartaros"] },
  ],
  blood_angels: [
    { id: "blood_angels_fear", name: "Wings of Wrath", desc: "Units gain Fear special rule when charging, capitalizing on shock-assault tactics." },
  ],
  iron_hands: [
    { id: "medusan_immortal", name: "Medusan Immortal", desc: "Bolsters durability of vehicles — vehicles and dreadnoughts gain unparalleled staying power." },
  ],
  world_eaters: [
    { id: "chain_bonded", name: "Chain-bonded", desc: "Command role unit: select another Command unit — one model each gains Chain-brothers (+1 to Hit in Assault when within coherency).", commandOnly: true },
  ],
  death_guard: [
    { id: "unnatural_resilience", name: "Unnatural Resilience", desc: "Centurion or Cataphractii Centurion gains +1 Wound and Eternal Warrior (2).", requiresUnit: ["centurion", "centurion_ta"] },
  ],
  thousand_sons: [
    { id: "telekine_shift", name: "Telekine Shift", desc: "Troops unit gains Telekine Shift (WP Check when Rushing → Antigrav + Move Through Cover).", requiresTroops: true },
  ],
  sons_of_horus: [
    { id: "martial_supremacy", name: "Martial Supremacy", desc: "Elites unit: one model gains Champion Sub-Type and Duellist's Edge (1).", requiresElites: true },
  ],
  word_bearers: [
    { id: "zealous_assault", name: "Zealous Assault", desc: "Troops unit gains Impact (S) Special Rule.", requiresTroops: true },
  ],
  alpha_legion: [
    { id: "rewards_of_treachery", name: "Rewards of Treachery", desc: "Command role unit: add one extra FOC Slot. Unit filling it must be from another Legion (Faction Trait replaced with Alpha Legion).", commandOnly: true, addsSlot: true },
  ],
};

// Legion-Specific Detachments
var LEGION_DETACHMENTS = {
  dark_angels: {
    auxiliary: [
      { id: "deathwing_conclave", name: "Deathwing Conclave", slots: [{ role: "retinue", count: 1, primeCount: 1 }, { role: "elites", count: 1 }, { role: "heavy_assault", count: 1 }] },
      { id: "ironwing_gauntlet", name: "Ironwing Gauntlet", slots: [{ role: "heavy_transport", count: 2 }, { role: "armour", count: 2 }] },
      { id: "dreadwing_cadre", name: "Dreadwing Cadre", desc: "Interemptor or Rapier Battery slots (up to 1 Prime)", slots: [{ role: "support", count: 3, primeCount: 1 }] },
      { id: "stormwing_muster", name: "Stormwing Muster", slots: [{ role: "troops", count: 2, prime: true }, { role: "transport", count: 2 }] },
      { id: "ravenwing_lance", name: "Ravenwing Lance", slots: [{ role: "fast_attack", count: 2, primeCount: 1 }, { role: "recon", count: 2 }] },
      { id: "firewing_echelon", name: "Firewing Echelon", slots: [{ role: "recon", count: 2, primeCount: 1 }, { role: "elites", count: 2 }] },
    ],
  },
  emperors_children: {
    auxiliary: [
      { id: "primacy_wing", name: "Primacy Wing", desc: "Specialized pursuit of martial perfection.", slots: [{ role: "retinue", count: 1 }, { role: "elites", count: 1 }, { role: "recon", count: 2 }] },
    ],
  },
  iron_warriors: {
    auxiliary: [
      { id: "ironfire_cohort", name: "Ironfire Cohort", desc: "Armour slots must be filled with Arquitor Bombard units.", slots: [{ role: "armour", count: 2, primeCount: 1 }, { role: "support", count: 2 }] },
    ],
    apex: [
      { id: "hammer_of_olympia", name: "Hammer of Olympia", desc: "Requires Warsmith or Perturabo in Army.", slots: [{ role: "heavy_transport", count: 1 }, { role: "troops", count: 2, primeCount: 1 }] },
    ],
  },
  white_scars: {
    auxiliary: [
      { id: "chogorian_warband", name: "Chogorian Warband", desc: "Fast Attack restricted to Scimitar Jetbike and Outrider units only.", slots: [{ role: "fast_attack", count: 2, primeCount: 1 }, { role: "recon", count: 2 }] },
    ],
  },
  space_wolves: {
    auxiliary: [
      { id: "bloodied_claws", name: "The Bloodied Claws", desc: "Troops can only select Grey Slayer Pack units.", slots: [{ role: "troops", count: 2, primeCount: 1 }, { role: "heavy_assault", count: 2 }] },
    ],
  },
  imperial_fists: {
    auxiliary: [
      { id: "siege_gauntlet", name: "Siege Gauntlet", slots: [{ role: "troops", count: 2, primeCount: 1 }, { role: "heavy_assault", count: 1 }, { role: "support", count: 1 }] },
    ],
  },
  night_lords: {
    auxiliary: [
      { id: "terror_assault", name: "Terror Assault", desc: "Troops must be Terror Squad units.", slots: [{ role: "troops", count: 2, primeCount: 1 }, { role: "recon", count: 2 }] },
    ],
    apex: [
      { id: "atramentar_hunt", name: "Atramentar Hunt", desc: "Retinue: Cataphractii/Tartaros Cmd Squads. Heavy Assault: Cataphractii/Tartaros Terminators. Prime Advantage must be Atramentar.", slots: [{ role: "retinue", count: 1, prime: true }, { role: "heavy_assault", count: 2, prime: true }] },
    ],
  },
  blood_angels: {
    auxiliary: [
      { id: "revelation_host", name: "Revelation Host", desc: "Troops: Assault Squads only. Elites: Dawnbreaker Cohort or Veteran Assault Squad only.", slots: [{ role: "troops", count: 2, primeCount: 1 }, { role: "elites", count: 2 }] },
    ],
  },
  iron_hands: {
    auxiliary: [
      { id: "medusan_vanguard", name: "Medusan Vanguard", desc: "Command: Praevian only. Requires Iron Father or Ferrus Manus in Army.", slots: [{ role: "command", count: 1, prime: true }, { role: "heavy_assault", count: 2 }, { role: "support", count: 1 }, { role: "war_engine", count: 1 }] },
      { id: "spearhead_phalanx", name: "Spearhead Phalanx", desc: "Heavy Transport: Spartan or Land Raider only.", slots: [{ role: "heavy_transport", count: 1 }, { role: "armour", count: 1 }, { role: "heavy_assault", count: 1 }] },
    ],
  },
  world_eaters: {
    auxiliary: [
      { id: "berserker_cadre", name: "Berserker Cadre", desc: "Heavy Assault slots may only select Rampager Squad units.", slots: [{ role: "troops", count: 1, primeCount: 1 }, { role: "heavy_assault", count: 2 }, { role: "elites", count: 1 }] },
    ],
  },
  ultramarines: {
    auxiliary: [
      { id: "primus_demi_company", name: "Primus Demi-Company", desc: "Command: Optae only.", slots: [{ role: "command", count: 1, prime: true }, { role: "troops", count: 2 }, { role: "support", count: 1 }, { role: "fast_attack", count: 1 }] },
    ],
  },
  death_guard: {
    auxiliary: [
      { id: "reaping_host", name: "Reaping Host", desc: "Troops may NOT select Assault Squads.", slots: [{ role: "troops", count: 2, primeCount: 1 }, { role: "support", count: 1 }, { role: "heavy_assault", count: 1 }] },
    ],
  },
  thousand_sons: {
    auxiliary: [
      { id: "prosperine_convocation", name: "Prosperine Convocation", desc: "Psychic covens and Cult units of the XV Legion.", slots: [{ role: "troops", count: 1, primeCount: 1 }, { role: "recon", count: 1 }, { role: "elites", count: 1 }, { role: "heavy_transport", count: 1 }] },
    ],
  },
  sons_of_horus: {
    auxiliary: [
      { id: "supremacy_cadre", name: "Supremacy Cadre", desc: "Spearhead assault forces to crush enemy command elements.", slots: [{ role: "troops", count: 2, prime: true }, { role: "elites", count: 1 }, { role: "heavy_assault", count: 1 }] },
    ],
  },
  word_bearers: {
    apex: [
      { id: "exalted_conclave", name: "Exalted Conclave", desc: "Traitor Allegiance only. Prime Advantage must be True Believers.", slots: [{ role: "troops", count: 2, prime: true }, { role: "elites", count: 2 }] },
    ],
  },
  salamanders: {
    auxiliary: [
      { id: "immolation_covenant", name: "Immolation Covenant", desc: "Armour slots: Predator or Vindicator units only.", slots: [{ role: "support", count: 2, primeCount: 1 }, { role: "armour", count: 2 }] },
    ],
  },
  raven_guard: {
    auxiliary: [
      { id: "decapitation_cadre", name: "Decapitation Cadre", desc: "Recon: Reconnaissance Squad only. Elites: Veteran Assault Squad or Dark Fury Squad only.", slots: [{ role: "recon", count: 2 }, { role: "elites", count: 2 }] },
    ],
  },
  alpha_legion: {
    auxiliary: [
      { id: "headhunter_leviathal", name: "Headhunter Leviathal", desc: "Elites: Seeker Squads or Headhunter Kill Teams only.", slots: [{ role: "recon", count: 2, prime: true }, { role: "elites", count: 2 }] },
    ],
  },
  mechanicum: {
    // ── Mechanicum Taghmata-specific Auxiliary Detachments (Taghmata Army List p.16) ──
    auxiliary: [
      {
        id: "taghmata_cohort",
        name: "Taghmata Cohort",
        desc: "Standard combined-arms detachment of the Taghmata.",
        slots: [
          { role: "command",   count: 1 },
          { role: "troops",    count: 1 },
          { role: "support",   count: 1 },
          { role: "transport", count: 1 },
        ],
      },
      {
        id: "apprentice_cadre",
        name: "Apprentice Cadre",
        desc: "Troops Slots in this Detachment may only be used to select Tech-Priest Units.",
        slots: [
          { role: "high_command", count: 1 },
          { role: "command",      count: 1 },
          { role: "support",      count: 1 },
          { role: "troops",       count: 1 },
        ],
      },
    ],
    // ── Apex Detachments (High Tech Arcana, unlocked by High Command + matching Trait) ──
    apex: [
      {
        id: "heart_of_power",
        name: "Heart of Power",
        desc: "Archimandrite Trait required. All Troops Slots must have Combat Veterans Prime Advantage selected.",
        slots: [
          { role: "high_command", count: 1 },
          { role: "command",      count: 2 },
          { role: "troops",       count: 3 },
        ],
      },
      {
        id: "command_maniple",
        name: "Command Maniple",
        desc: "Cybernetica Trait required. All Slots may only select Units that include Models with the Automata Type.",
        slots: [
          { role: "command",    count: 1 },
          { role: "war_engine", count: 2 },
        ],
      },
      {
        id: "panoply_of_cruelty",
        name: "Panoply of Cruelty",
        desc: "Lacrymaerta Trait required. Heavy Assault Slots may only select Ursarax Cohort Units.",
        slots: [
          { role: "heavy_assault", count: 3 },
        ],
      },
      {
        id: "host_of_destruction",
        name: "Host of Destruction",
        desc: "Myrmidax Trait required. Elite Slots may only select Units that include Models with the Myrmidax Trait.",
        slots: [
          { role: "command", count: 1 },
          { role: "elites",  count: 2 },
          { role: "troops",  count: 1 },
        ],
      },
      {
        id: "crux_of_judgement",
        name: "Crux of Judgement",
        desc: "Malagra Trait required. All Slots must be filled with Arcuitor Magisterium Units. Models form a single Unit before deployment.",
        slots: [
          { role: "command", count: 3 },
        ],
      },
      {
        id: "iron_phalanx",
        name: "Iron Phalanx",
        desc: "Macrotek Trait required. All Models must have the Vehicle Type and must have Prime Conveyor Prime Advantage selected.",
        slots: [
          { role: "transport", count: 3 },
          { role: "armour",    count: 3 },
        ],
      },
      {
        id: "thallax_command_cohort",
        name: "Thallax Command Cohort",
        desc: "Reductor Trait required. All Slots must be filled by Thallax Cohort Units with a Praetorian upgrade.",
        slots: [
          { role: "command", count: 1 },
          { role: "troops",  count: 2 },
        ],
      },
    ],
  },
  custodes: {
    auxiliary: [
      { id: "hykanatoi_c",     name: "Hykanatoi Convocation",    desc: "Troops slots: Custodian Guard or Sentinel Guard Sodalities only. Transport slot: Coronus Grav-carrier only.",                                                     slots: [{ role: "troops", count: 2, primeCount: 1 }, { role: "transport", count: 1 }] },
      { id: "tharanatoi_c",    name: "Tharanatoi Convocation",   desc: "Heavy Assault slots: Aquilon Terminator Sodalities only.",                                                                                                         slots: [{ role: "heavy_assault", count: 2, primeCount: 1 }] },
      { id: "ephoroi_c",       name: "Ephoroi Convocation",      desc: "Fast Attack slots: Venatari Sodalities only.",                                                                                                                    slots: [{ role: "fast_attack", count: 2, primeCount: 1 }] },
      { id: "kataphractoi_c",  name: "Kataphractoi Convocation", desc: "Fast Attack slot: Pallas Grav-attack or Gyrfalcon Jetbike Sodality only. Transport slot: Coronus Grav-carrier only. Armour slot: Caladius Grav-tank only.",       slots: [{ role: "fast_attack", count: 1, primeCount: 1 }, { role: "transport", count: 1 }, { role: "armour", count: 1 }] },
    ],
    apex: [
      { id: "moritoi_c",       name: "Moritoi Convocation",      desc: "War Engine slots: Contemptor-Achillus or Contemptor-Galatus Dreadnoughts only.",                                                                                  slots: [{ role: "war_engine", count: 2, primeCount: 1 }] },
    ],
  },
  sol_auxilia: {
    auxiliary: [
      { id: "infantry_tercio_sa",  name: "Infantry Tercio",         desc: "Troops slots: Lasrifle or Veletaris Sections only. Heavy Assault slot: Charonite Ogryn Section only.",  slots: [{ role: "troops", count: 3, primeCount: 1 }, { role: "heavy_assault", count: 1 }] },
      { id: "armour_company_sa",   name: "Armour Company",          desc: "Armour slots: Leman Russ variants only.",                                                               slots: [{ role: "armour", count: 3, primeCount: 1 }] },
      { id: "artillery_battery_sa",name: "Artillery Battery",       desc: "Support slots: Basilisk, Medusa, or Rapier Sections only.",                                             slots: [{ role: "support", count: 3, primeCount: 1 }] },
      { id: "recon_element_sa",    name: "Recon Element",           desc: "Recon slots: Hermes Light Sentinel Squadrons only. Fast Attack: Hermes Veletaris Squadrons only.",      slots: [{ role: "recon", count: 2, primeCount: 1 }, { role: "fast_attack", count: 2 }] },
      { id: "air_support_sa",      name: "Air Support Wing",        desc: "Fast Attack slots: Primaris-Lightning or Thunderbolt units only.",                                      slots: [{ role: "fast_attack", count: 2, primeCount: 1 }] },
      { id: "assault_company_sa",  name: "Assault Company",         desc: "Troops must be Veletaris sections. Heavy Assault: Charonite Ogryn Section only.",                      slots: [{ role: "troops", count: 2, primeCount: 1 }, { role: "heavy_assault", count: 2 }] },
    ],
    apex: [
      { id: "cohort_reserve_sa",   name: "Cohort Battle-Reserve",   desc: "Troops: Lasrifle or Veletaris only. Heavy Transport: Dracosan only.",                                   slots: [{ role: "troops", count: 2, primeCount: 1 }, { role: "heavy_transport", count: 1 }, { role: "armour", count: 1 }] },
      { id: "heavy_armour_grp_sa", name: "Heavy Armour Battle-Group",desc: "Lord of War slots: Malcador, Valdor or Stormhammer variants only.",                                    slots: [{ role: "lord_of_war", count: 2, primeCount: 1 }] },
    ],
  },
};

// Logistical Benefit allowed roles (cannot add these)
var LOGISTICAL_EXCLUDED_ROLES = ["high_command", "command", "warlord", "lord_of_war"];

var ALLEGIANCE_UNITS = {
  loyalist: [
    // Primarchs
    "lion", "khan", "russ", "dorn", "sanguinius", "ferrus", "guilliman", "vulkan", "corax",
    // I Dark Angels
    "corswain", "marduk_sedras", "deathwing_comp", "dreadwing_inter", "inner_circle_knight",
    // V White Scars
    "qin_xa", "hibou_khan", "stormseer", "keshig_rider", "kharash", "kyzagan",
    // VI Space Wolves
    "hvarl", "geigor", "caster_of_runes", "varagyr", "deathsworn", "grey_slayer",
    // VII Imperial Fists
    "sigismund", "fafnir_rann", "evander_garrius", "camba_diaz", "alexis_polux",
    "templar_brethren", "phalanx_warder",
    // IX Blood Angels
    "raldoron", "dom_zephon", "aster_crohne", "crimson_paladin", "dawnbreaker",
    "erelim", "contemp_incaendius",
    // X Iron Hands
    "shadrak_meduson", "iron_father", "gorgon_term", "immortal_ih",
    // XIII Ultramarines
    "remus_ventanus", "invictarus_suz", "praetorian_um",
    // XVIII Salamanders
    "firedrake", "pyroclast",
    // XIX Raven Guard
    "kaedes_nex", "mor_deythan", "dark_fury_rg",
  ],
  traitor: [
    // Primarchs
    "fulgrim", "perturabo", "curze", "angron", "lorgar", "mortarion", "magnus", "horus", "alpharius",
    "daemon_lesser", "daemon_greater",
    // III Emperor's Children
    "eidolon", "lucius", "saul_tarvitz", "phoenix_term", "palatine_blade", "kakophoni",
    // IV Iron Warriors
    "warsmith", "tyrant_siege_term", "domitar_ferrum",
    // VIII Night Lords
    "sevatar", "contekar", "executioner_nl", "night_raptor",
    // XII World Eaters
    "kharn", "lotara_sarrin", "red_butcher", "rampager",
    // XIV Death Guard
    "calas_typhon", "deathshroud", "grave_warden",
    // XV Thousand Sons
    "ahriman", "magistus_amon", "prosperine_sorc", "sekhmet", "khenetai_blade",
    "castellax_achea", "contemp_osiron",
    // XVI Sons of Horus
    "ezekyle_abaddon", "little_horus", "tybalt_marr", "vheren_ash", "garviel_loken",
    "maloghurst", "dark_emissary", "justaerin", "reaver_soh",
    // XVII Word Bearers
    "kor_phaeron", "erebus", "argel_tal", "zardu_layak", "dark_brethren", "anakatis_kul", "phraetus_conclave",
    "mhara_gal", "incendiary_wb",
    // XX Alpha Legion
    "armillus_dynat", "saboteur", "exodus_al", "headhunter", "lernaean",
    // ── MECHANICUM MACHINA MALEFICA & PERSONA SCINDIO (Traitor) ──
    "decimator_mm", "blood_slaughterer_mm", "brass_scorpion_mm", "kytan_mm",
    "scoria_mm", "draykavac_mm",
  ],
};

// Legion Faction Traits (p.15)
var LEGION_FACTIONS = [
  { id: "dark_angels",       name: "Dark Angels (I)",        allegiance: "loyalist", numeral: "I" },
  { id: "emperors_children",  name: "Emperor's Children (III)", allegiance: "traitor", numeral: "III" },
  { id: "iron_warriors",     name: "Iron Warriors (IV)",     allegiance: "traitor", numeral: "IV" },
  { id: "white_scars",       name: "White Scars (V)",        allegiance: "loyalist", numeral: "V" },
  { id: "space_wolves",      name: "Space Wolves (VI)",      allegiance: "loyalist", numeral: "VI" },
  { id: "imperial_fists",    name: "Imperial Fists (VII)",   allegiance: "loyalist", numeral: "VII" },
  { id: "night_lords",       name: "Night Lords (VIII)",     allegiance: "traitor", numeral: "VIII" },
  { id: "blood_angels",      name: "Blood Angels (IX)",      allegiance: "loyalist", numeral: "IX" },
  { id: "iron_hands",        name: "Iron Hands (X)",         allegiance: "loyalist", numeral: "X" },
  { id: "world_eaters",      name: "World Eaters (XII)",     allegiance: "traitor", numeral: "XII" },
  { id: "ultramarines",      name: "Ultramarines (XIII)",    allegiance: "loyalist", numeral: "XIII" },
  { id: "death_guard",       name: "Death Guard (XIV)",      allegiance: "traitor", numeral: "XIV" },
  { id: "thousand_sons",     name: "Thousand Sons (XV)",     allegiance: "traitor", numeral: "XV" },
  { id: "sons_of_horus",     name: "Luna Wolves (XVI)",    allegiance: "traitor", numeral: "XVI" },
  { id: "word_bearers",      name: "Word Bearers (XVII)",    allegiance: "traitor", numeral: "XVII" },
  { id: "salamanders",       name: "Salamanders (XVIII)",    allegiance: "loyalist", numeral: "XVIII" },
  { id: "raven_guard",       name: "Raven Guard (XIX)",      allegiance: "loyalist", numeral: "XIX" },
  { id: "alpha_legion",      name: "Alpha Legion (XX)",      allegiance: "traitor", numeral: "XX" },
  { id: "legiones_astartes",  name: "Legiones Astartes (Generic)", allegiance: "any",      numeral: "-" },
  { id: "sol_auxilia",        name: "Solar Auxilia",               allegiance: "any",      numeral: "-" },
  { id: "mechanicum",         name: "Mechanicum Taghmata",         allegiance: "any",      numeral: "-" },
  { id: "custodes",           name: "Legio Custodes",              allegiance: "loyalist", numeral: "-" },
];

var LEGION_FACTION_BY_ID = {};
LEGION_FACTIONS.forEach(function (faction) {
  LEGION_FACTION_BY_ID[faction.id] = faction;
});

// Maps unit IDs that are restricted to a specific faction (e.g. Primarchs).
// Units NOT listed here are considered generic and available to any faction.
var UNIT_SPECIFIC_FACTION = {
  // Loyalist Primarchs — WARLORD (L)
  "lion":       "dark_angels",
  "khan":       "white_scars",
  "russ":       "space_wolves",
  "dorn":       "imperial_fists",
  "sanguinius": "blood_angels",
  "ferrus":     "iron_hands",
  "guilliman":  "ultramarines",
  "vulkan":     "salamanders",
  "corax":      "raven_guard",
  // Traitor Primarchs — WARLORD (T)
  "fulgrim":    "emperors_children",
  "perturabo":  "iron_warriors",
  "curze":      "night_lords",
  "angron":     "world_eaters",
  "mortarion":  "death_guard",
  "magnus":     "thousand_sons",
  "horus":      "sons_of_horus",
  "lorgar":     "word_bearers",
  "alpharius":  "alpha_legion",
};

var MAX_UNIT_SIZE = {
  tactical: 20, despoiler: 20, breacher: 20, assault: 20,
  tactical_support: 10, heavy_support: 10,
  seeker: 10, recon: 10, destroyer: 10, outrider: 10,
  veteran: 10, veteran_assault: 10,
  praetorian_cmd_jp: 10, praetorian_cmd: 10, centurion_cmd: 10,
  tartaros_cmd: 10, cataphractii_cmd: 12,
  cataphractii: 12, tartaros: 10, saturnine: 6,
  lasrifle: 30, veletaris: 20,
  thallax: 9, ogryn: 10, tech_thrall: 30,
  custodian_guard: 10, sagittarum: 10, aquilon: 6,
  scimitar_jetbike: 10, javelin: 3, land_speeder: 5,
  rapier_la: 4, rapier: 4,
  daemon_lesser: 20, myrmidon_dest: 6,
  // Legion-specific unit max sizes
  deathwing_comp: 10, dreadwing_inter: 10, inner_circle_knight: 10,
  phoenix_term: 10, palatine_blade: 10, kakophoni: 10,
  tyrant_siege_term: 10,
  keshig_rider: 10, kharash: 10,
  varagyr: 10, deathsworn: 10, grey_slayer: 20,
  templar_brethren: 10, phalanx_warder: 20,
  contekar: 10, executioner_nl: 20, night_raptor: 15,
  crimson_paladin: 10, dawnbreaker: 10, erelim: 20,
  gorgon_term: 10, immortal_ih: 20,
  red_butcher: 10, rampager: 10,
  invictarus_suz: 10, praetorian_um: 20,
  deathshroud: 10, grave_warden: 10,
  sekhmet: 10, khenetai_blade: 10,
  justaerin: 10, reaver_soh: 10,
  dark_brethren: 10, anakatis_kul: 10, incendiary_wb: 20,
  firedrake: 10, pyroclast: 10,
  mor_deythan: 10, dark_fury_rg: 10,
  headhunter: 10, lernaean: 10,
  // ── SOL AUXILIA ──
  legate_cmd_sa: 10, tactical_cmd_sa: 10, line_cmd_sa: 10,
  veletaris_cmd_sa: 10, hermes_cmd_sa: 6, artillery_cmd_sa: 10,
  veletaris_vanguard_sa: 20,
  charonite_sa: 9,
  hermes_light_sa: 6, hermes_vel_sa: 6, aethon_sa: 3,
  // ── MECHANICUM TAGHMATA ──
  scyllax_tm: 16, echidnax_tm: 12, domitar_tm: 4,
  secutor_tm: 10, destructor_tm: 10,
  castellax_dest_tm: 6, castellax_battle_tm: 10,
  ursarax_tm: 9, tech_thrall_cov_tm: 40, thallax_full_tm: 9,
  // ── MACHINA MALEFICA ──
  blood_slaughterer_mm: 4,
};

// Helper: format wargear options for display
function formatWargear(entry, faction) {
  if (!entry.wargearOptions) return "";
  const opts = faction ? getWargearOptions(entry.unitId, faction) : (UNIT_WARGEAR_OPTIONS[entry.unitId] || []);
  const active = Object.entries(entry.wargearOptions).filter(([, v]) => v).map(([idx]) => {
    const o = opts[idx];
    return o ? o.label.replace(/\s*\([^)]*\)\s*$/, "").replace(/\s*\+\d+pts.*$/, "").trim() : null;
  }).filter(Boolean);
  return active.length > 0 ? " · " + active.join(", ") : "";
}

function calcArmyEntryPoints(entry) {
  const pd = POINTS_DATA[entry.unitId];
  if (!pd) return 0;
  let total = pd.base;
  const extraModels = Math.max(0, (entry.models || pd.minModels) - pd.minModels);
  total += extraModels * pd.perModel;
  if (entry.weaponName) {
    const wCost = WEAPON_UPGRADE_COSTS[entry.weaponName] ?? 0;
    const sgtSlot = entry.sgtWeaponName ? 1 : 0;
    const secModels = entry.secondaryWeapons ? entry.secondaryWeapons.reduce((s, sw) => s + (sw.models || 0), 0) : 0;
    total += wCost * Math.max(0, (entry.models || pd.minModels) - sgtSlot - secModels);
  }
  if (entry.sgtWeaponName) total += WEAPON_UPGRADE_COSTS[entry.sgtWeaponName] ?? 0;
  if (entry.secondaryWeapons) {
    for (const sw of entry.secondaryWeapons) total += (WEAPON_UPGRADE_COSTS[sw.weaponName] ?? 0) * (sw.models || 1);
  }
  if (entry.equipment) {
    Object.entries(EQUIPMENT_OPTIONS).forEach(([key, eq]) => {
      if (entry.equipment[key]) total += eq.perModel ? eq.cost * (entry.models || pd.minModels) : eq.cost;
    });
  }
  // Wargear options (base + legion)
  if (entry.wargearOptions) {
    const opts = entry.faction ? getWargearOptions(entry.unitId, entry.faction) : (UNIT_WARGEAR_OPTIONS[entry.unitId] || []);
    Object.entries(entry.wargearOptions).forEach(([idx, checked]) => {
      if (checked && opts[idx]) {
        total += opts[idx].perModel ? opts[idx].cost * (entry.models || pd.minModels) : opts[idx].cost;
      }
    });
  }
  return total;
}

// Helper: get units matching a given battlefield role
function getUnitsForRole(role) {
  return ROLE_TO_UNIT_IDS[role] || [];
}

// Calculate total points for a deployed unit
function calcUnitPoints(unit) {
  if (!unit.unitData) return null;
  const ud = unit.unitData;
  const pd = POINTS_DATA[ud.id];
  if (!pd) return null;

  // Base cost (includes minimum models)
  let total = pd.base;

  // Extra models beyond minimum
  const extraModels = Math.max(0, ud.models - pd.minModels);
  total += extraModels * pd.perModel;

  // Count models using secondary weapons (these replace the primary weapon)
  const secondaryModelsTotal = (unit.secondaryWeapons && unit.secondaryWeapons.length > 0)
    ? unit.secondaryWeapons.reduce((sum, sw) => sum + (sw.models || 0), 0)
    : 0;

  // Ranged weapon upgrade cost — only for models NOT using secondary weapons
  if (unit.rangedWeapon) {
    const wCost = WEAPON_UPGRADE_COSTS[unit.rangedWeapon.name] ?? 0;
    const sgtSlot = unit.sgtEnabled ? 1 : 0;
    const primaryModels = Math.max(0, ud.models - sgtSlot - secondaryModelsTotal);
    total += wCost * primaryModels;
  }

  // Sergeant weapon upgrade cost (single model)
  if (unit.sgtEnabled && unit.sgtWeapon) {
    const sCost = WEAPON_UPGRADE_COSTS[unit.sgtWeapon.name] ?? 0;
    total += sCost;
  }

  // Secondary weapon upgrade costs (replace primary for those models)
  if (unit.secondaryWeapons && unit.secondaryWeapons.length > 0) {
    for (const sw of unit.secondaryWeapons) {
      const swCost = WEAPON_UPGRADE_COSTS[sw.weapon.name] ?? 0;
      total += swCost * (sw.models || 1);
    }
  }

  // Equipment costs (Vexilla, Nox-Vox, Melta Bombs, Bayonets, Chain Bayonets)
  if (unit.equipment) {
    Object.entries(EQUIPMENT_OPTIONS).forEach(([key, eq]) => {
      if (unit.equipment[key]) {
        if (eq.perModel) {
          total += eq.cost * ud.models;
        } else {
          total += eq.cost;
        }
      }
    });
  }

  return total;
}

// Weapons keyed by unit id
var WEAPON_PROFILES = {
  // LEGIONES ASTARTES
  tactical: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Fury of the Legion", shots: 4, s: 4, ap: "5", damage: 1, type: "Heavy", rules: {}, traits: "Bolt" },
  ],
  tactical_support: [
    { name: "Plasma Gun (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Plasma Gun (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching5: true, getshot: true }, traits: "Plasma" },
    { name: "Melta Gun", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { melta: true }, traits: "Melta" },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Volkite Caliver", shots: 2, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Rotor Cannon", shots: 3, s: 3, ap: "4", damage: 1, type: "Heavy", rules: { suppressive: true }, traits: "Auto" },
    { name: "Flamer", shots: 1, s: 4, ap: "5", damage: 1, type: "Assault", rules: { panic: true, template: true }, traits: "Flame" },
    { name: "Heavy Flamer", shots: 1, s: 5, ap: "4", damage: 1, type: "Assault", rules: { panic: true, template: true }, traits: "Flame" },
  ],
  heavy_support: [
    { name: "Lascannon", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Autocannon", shots: 2, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true }, traits: "Auto" },
    { name: "Heavy Bolter", shots: 5, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {  }, traits: "Bolt" },
    { name: "Missile L. (Frag)", shots: 1, s: 4, ap: "6", damage: 1, type: "Heavy", rules: { blast: true }, traits: "Missile" },
    { name: "Missile L. (Krak)", shots: 1, s: 8, ap: "3", damage: 1, type: "Heavy", rules: {  }, traits: "Missile" },
    { name: "Volkite Culverin", shots: 3, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Plasma Cannon (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true, breaching6: true }, traits: "Plasma" },
    { name: "Plasma Cannon (Maximal)", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true, breaching5: true, getshot: true }, traits: "Plasma" },
    { name: "Multi-Melta", shots: 1, s: 8, ap: "1", damage: 3, type: "Heavy", rules: { melta: true }, traits: "Melta" },
  ],
  seeker: [
    { name: "Kraken Bolter", shots: 4, s: 4, ap: "4", damage: 1, type: "Rapid Fire", rules: { precision: true }, traits: "Bolt" },
    { name: "Nemesis Bolter", shots: 1, s: 4, ap: "5", damage: 1, type: "Heavy", rules: { breaching5: true, pinning: true, precision: true }, traits: "Bolt" },
  ],
  recon: [
    { name: "Nemesis Bolter", shots: 1, s: 4, ap: "5", damage: 1, type: "Heavy", rules: { breaching5: true, pinning: true, precision: true }, traits: "Bolt" },
    { name: "Sniper Rifle", shots: 1, s: 3, ap: "6", damage: 1, type: "Heavy", rules: { precision: true, pinning: true } },
  ],
  destroyer: [
    { name: "Rad Missile", shots: 1, s: 4, ap: "3", damage: 1, type: "Assault", rules: { blast: true, fleshbane: true, poisoned: true }, traits: "Assault" },
  ],
  breacher: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Graviton Gun", shots: 1, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { blast: true, breaching6: true, pinning: true }, traits: "Graviton", defaultModels: 2 },
  ],
  despoiler: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
  ],
  assault: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true }, traits: "Assault, Plasma", defaultModels: 2 },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma", defaultModels: 2 },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true }, traits: "Assault, Volkite", defaultModels: 2 },
  ],
  veteran_assault: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Disintegrator Pistol", shots: 1, s: 4, ap: "3", damage: 2, type: "Pistol", rules: { getshot: true }, traits: "Assault, Disintegrator", defaultModels: 2 },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true }, traits: "Assault, Plasma", defaultModels: 2 },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma", defaultModels: 2 },
  ],
  // ── COMMAND (missing) ──
  optae: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Disintegrator Pistol", shots: 1, s: 4, ap: "3", damage: 2, type: "Pistol", rules: { getshot: true }, traits: "Assault, Disintegrator" },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Astartes Shotgun", shots: 2, s: 4, ap: "-", damage: 1, type: "Assault", rules: { stun: true }, traits: "Assault, Auto" },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
  ],
  esoterist: [
    { name: "Archaeotech Pistol", shots: 1, s: 6, ap: "4", damage: 2, type: "Pistol", rules: { breaching3: true }, traits: "Assault" },
  ],
  praevian: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Hand Flamer", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: { template: true }, traits: "Assault, Flame" },
  ],
  overseer: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Hand Flamer", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: { template: true }, traits: "Assault, Flame" },
  ],
  damocles_rhino: [
    { name: "Two Pintle Bolters", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Two Pintle Combi-Bolters", shots: 8, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
  ],
  // ── RETINUE (Command Squads) ──
  praetorian_cmd: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Astartes Shotgun", shots: 2, s: 4, ap: "-", damage: 1, type: "Assault", rules: { stun: true }, traits: "Assault, Auto" },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Disintegrator Rifle", shots: 1, s: 4, ap: "3", damage: 2, type: "Rapid Fire", rules: { getshot: true }, traits: "Disintegrator" },
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
  ],
  praetorian_cmd_jp: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Astartes Shotgun", shots: 2, s: 4, ap: "-", damage: 1, type: "Assault", rules: { stun: true }, traits: "Assault, Auto" },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Disintegrator Rifle", shots: 1, s: 4, ap: "3", damage: 2, type: "Rapid Fire", rules: { getshot: true }, traits: "Disintegrator" },
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
  ],
  centurion_cmd: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Astartes Shotgun", shots: 2, s: 4, ap: "-", damage: 1, type: "Assault", rules: { stun: true }, traits: "Assault, Auto" },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Disintegrator Rifle", shots: 1, s: 4, ap: "3", damage: 2, type: "Rapid Fire", rules: { getshot: true }, traits: "Disintegrator" },
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Plasma Gun (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true }, traits: "Plasma", defaultModels: 1 },
    { name: "Melta Gun", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { melta: true }, traits: "Melta", defaultModels: 1 },
    { name: "Heavy Bolter", shots: 5, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {  }, traits: "Bolt", defaultModels: 1 },
    { name: "Lascannon", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las", defaultModels: 1 },
  ],
  tartaros_cmd: [
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { melta: true }, traits: "Melta" },
    { name: "Combi-Plasma", shots: 2, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Heavy Flamer", shots: 1, s: 5, ap: "4", damage: 1, type: "Assault", rules: { template: true, panic: true }, traits: "Flame", defaultModels: 1 },
    { name: "Reaper Autocannon", shots: 2, s: 6, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true }, traits: "Auto", defaultModels: 1 },
    { name: "Plasma Blaster (Sustained)", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching6: true }, traits: "Plasma", defaultModels: 1 },
  ],
  cataphractii_cmd: [
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { melta: true }, traits: "Melta" },
    { name: "Combi-Plasma", shots: 2, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Heavy Flamer", shots: 1, s: 5, ap: "4", damage: 1, type: "Assault", rules: { template: true, panic: true }, traits: "Flame", defaultModels: 1 },
    { name: "Reaper Autocannon", shots: 2, s: 6, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true }, traits: "Auto", defaultModels: 1 },
    { name: "Plasma Blaster (Sustained)", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching6: true }, traits: "Plasma", defaultModels: 1 },
  ],
  // ── RECON ──
  outrider: [
    { name: "Twin Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Twin Plasma Gun (Sustained)", shots: 2, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching5: true }, traits: "Plasma" },
    { name: "Twin Plasma Gun (Maximal)", shots: 2, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching4: true, getshot: true }, traits: "Plasma" },
  ],
  // ── VEHICLES (primary weapons for resolving) ──
  rhino: [
    { name: "Pintle Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
  ],
  termite: [
    { name: "Two Pintle Bolters", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
  ],
  drop_pod: [
    { name: "Two Pintle Combi-Bolters", shots: 8, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Melta Cutters", shots: 1, s: 8, ap: "2", damage: 3, type: "Heavy", rules: { blast: true, melta: true }, traits: "Melta" },
  ],
  sabre: [
    { name: "Anvilus Snub Autocannon", shots: 3, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching5: true }, traits: "Auto" },
    { name: "Neutron Blaster", shots: 1, s: 9, ap: "2", damage: 3, type: "Heavy", rules: { armourbane: true, getshot: true }, traits: "Las" },
    { name: "Volkite Saker", shots: 6, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite" },
  ],
  land_raider_exp: [
    { name: "Two Sponson Twin Lascannon", shots: 4, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
  ],
  tarantula: [
    { name: "Twin Heavy Bolter", shots: 6, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {  }, traits: "Bolt" },
    { name: "Twin Lascannon", shots: 2, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Twin Volkite Culverin", shots: 6, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Sentry Melta Array", shots: 2, s: 8, ap: "2", damage: 2, type: "Heavy", rules: { blast: true, melta: true }, traits: "Melta" },
    { name: "Hyperios Missile Launcher", shots: 3, s: 7, ap: "3", damage: 2, type: "Heavy", rules: { skyfire: true }, traits: "Missile" },
  ],
  kratos: [
    { name: "Kratos Battlecannon (HE)", shots: 1, s: 8, ap: "4", damage: 1, type: "Ordnance", rules: { blast: true, stun: true }, traits: "Auto" },
    { name: "Kratos Battlecannon (AP)", shots: 1, s: 8, ap: "2", damage: 2, type: "Ordnance", rules: { armourbane: true }, traits: "Auto" },
    { name: "Volkite Cardanelle", shots: 12, s: 7, ap: "5", damage: 2, type: "Heavy", rules: { deflagrate: true, suppressive: true }, traits: "Volkite" },
    { name: "Melta Blast-Gun", shots: 2, s: 9, ap: "2", damage: 4, type: "Heavy", rules: { melta: true }, traits: "Melta" },
  ],
  scorpius: [
    { name: "Scorpius Missile Launcher", shots: 1, s: 8, ap: "4", damage: 1, type: "Heavy", rules: { blast: true, breaching5: true }, traits: "Missile" },
  ],
  arquitor: [
    { name: "Morbus Bombard (HE)", shots: 1, s: 9, ap: "4", damage: 1, type: "Ordnance", rules: { blast: true, breaching6: true, pinning: true }, traits: "" },
    { name: "Graviton-Charge Cannon", shots: 1, s: 9, ap: "3", damage: 2, type: "Heavy", rules: { blast: true, pinning: true }, traits: "Graviton" },
    { name: "Spicula Rocket System", shots: 1, s: 7, ap: "4", damage: 1, type: "Heavy", rules: { blast: true, suppressive: true }, traits: "Missile" },
  ],
  cerberus: [
    { name: "Neutron Laser Battery", shots: 3, s: 10, ap: "2", damage: 3, type: "Ordnance", rules: { armourbane: true, getshot: true }, traits: "Las" },
  ],
  typhon: [
    { name: "Dreadhammer Siege Cannon", shots: 1, s: 12, ap: "3", damage: 3, type: "Ordnance", rules: { blast: true, breaching5: true, stun: true }, traits: "" },
  ],
  glaive: [
    { name: "Volkite Carronade", shots: 12, s: 8, ap: "3", damage: 2, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite" },
  ],
  fellblade: [
    { name: "Fellblade Accelerator Cannon (HE)", shots: 1, s: 8, ap: "3", damage: 2, type: "Heavy", rules: { blast: true, stun: true }, traits: "Auto" },
    { name: "Fellblade Accelerator Cannon (AE)", shots: 1, s: 12, ap: "2", damage: 3, type: "Ordnance", rules: { blast: true }, traits: "Auto" },
    { name: "Demolisher Cannon", shots: 1, s: 12, ap: "3", damage: 3, type: "Ordnance", rules: { blast: true, breaching5: true, stun: true }, traits: "" },
  ],
  falchion: [
    { name: "Neutron-Wave Cannon", shots: 2, s: 12, ap: "2", damage: 4, type: "Ordnance", rules: { armourbane: true }, traits: "Las" },
  ],
  thunderhawk: [
    { name: "Turbo-Laser Destructor", shots: 1, s: 12, ap: "2", damage: 6, type: "Heavy", rules: { blast: true, armourbane: true }, traits: "Las" },
    { name: "Twin Avenger Bolt Cannon", shots: 10, s: 6, ap: "3", damage: 1, type: "Heavy", rules: { suppressive: true }, traits: "Bolt" },
  ],
  kharybdis: [
    { name: "Kharybdis Missile Launcher", shots: 5, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { pinning: true }, traits: "Missile" },
  ],
  techmarine: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true }, traits: "Assault, Plasma" },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true }, traits: "Assault, Volkite" },
  ],
  // ELITES
  veteran: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Astartes Shotgun (Solid)", shots: 2, s: 4, ap: "-", damage: 1, type: "Assault", rules: { stun: true }, traits: "Assault, Auto" },
    { name: "Astartes Shotgun (Scatter)", shots: 3, s: 3, ap: "-", damage: 1, type: "Assault", rules: { stun: true }, traits: "Assault, Auto" },
    { name: "Plasma Gun (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Plasma Gun (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching5: true, getshot: true }, traits: "Plasma" },
    { name: "Melta Gun", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { melta: true }, traits: "Melta" },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Disintegrator Rifle", shots: 1, s: 4, ap: "3", damage: 2, type: "Rapid Fire", rules: { getshot: true }, traits: "Disintegrator" },
    { name: "Disintegrator Blaster", shots: 1, s: 5, ap: "2", damage: 2, type: "Assault", rules: { getshot: true }, traits: "Disintegrator", defaultModels: 2 },
    { name: "Heavy Disintegrator", shots: 1, s: 6, ap: "2", damage: 2, type: "Heavy", rules: { getshot: true }, traits: "Disintegrator", defaultModels: 2 },
    { name: "Heavy Bolter", shots: 5, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {  }, traits: "Bolt", defaultModels: 2 },
    { name: "Volkite Caliver", shots: 2, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite", defaultModels: 2 },
    { name: "Missile L. (Krak)", shots: 1, s: 8, ap: "3", damage: 1, type: "Heavy", rules: {  }, traits: "Missile", defaultModels: 2 },
    { name: "Lascannon", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las", defaultModels: 2 },
    { name: "Autocannon", shots: 2, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true }, traits: "Auto", defaultModels: 2 },
  ],
  praetor_pa: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true }, traits: "Assault, Plasma" },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Archaeotech Pistol", shots: 1, s: 6, ap: "4", damage: 2, type: "Pistol", rules: { breaching3: true }, traits: "Assault" },
    { name: "Disintegrator Pistol", shots: 1, s: 4, ap: "3", damage: 2, type: "Pistol", rules: { getshot: true }, traits: "Assault, Disintegrator" },
  ],
  praetor_ta: [
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Combi-Plasma (Maximal)", shots: 2, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { melta: true }, traits: "Melta" },
    { name: "Plasma Blaster (Maximal)", shots: 2, s: 8, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true, getshot: true }, traits: "Plasma" },
  ],
  praetor_sat: [
    { name: "Plasma Blaster (Sustained)", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Plasma Blaster (Maximal)", shots: 2, s: 8, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true, getshot: true }, traits: "Plasma" },
  ],
  centurion_sat: [
    { name: "Plasma Bombard (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Barrage", rules: { barrage: true, blast: true, breaching6: true }, traits: "Plasma" },
    { name: "Plasma Bombard (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Barrage", rules: { barrage: true, blast: true, breaching5: true, getshot: true }, traits: "Plasma" },
    { name: "Twin Heavy Disintegrator", shots: 2, s: 7, ap: "2", damage: 2, type: "Rapid Fire", rules: { getshot: true }, traits: "Disintegrator" },
    { name: "Particle Shredder", shots: 1, s: 6, ap: "3", damage: 1, type: "Assault", rules: { breaching6: true, getshot: true, template: true }, traits: "Assault, Particle" },
    { name: "Plasma Blaster (Sustained)", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Plasma Blaster (Maximal)", shots: 2, s: 8, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true, getshot: true }, traits: "Plasma" },
  ],
  champion: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
  ],
  master_signals: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Cognis-Signum (BS boost)", shots: 0, s: 0, ap: "-", damage: 0, type: "Heavy", rules: {} },
  ],
  vigilator: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Nemesis Bolter", shots: 1, s: 4, ap: "5", damage: 1, type: "Heavy", rules: { breaching5: true, pinning: true, precision: true }, traits: "Bolt" },
  ],
  forge_lord: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
    { name: "Graviton Gun", shots: 1, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { blast: true, breaching6: true, pinning: true }, traits: "Graviton" },
  ],
  chaplain: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
  ],
  librarian: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Force Bolt", shots: 1, s: 6, ap: "3", damage: 1, type: "Assault", rules: {}, traits: "Assault" },
  ],
  herald: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
  ],
  moritat: [
    { name: "Dual Bolt Pistols", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Dual Plasma Pistols", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
    { name: "Dual Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true }, traits: "Assault, Volkite" },
  ],
  siege_breaker: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
  ],
  // TERMINATORS
  cataphractii: [
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Combi-Plasma (Maximal)", shots: 2, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { melta: true }, traits: "Melta" },
    { name: "Combi-Flamer", shots: 1, s: 4, ap: "5", damage: 1, type: "Assault", rules: { panic: true, template: true }, traits: "Flame" },
    { name: "Heavy Flamer", shots: 1, s: 5, ap: "4", damage: 1, type: "Assault", rules: { panic: true, template: true }, traits: "Flame", defaultModels: 1 },
    { name: "Reaper Autocannon", shots: 2, s: 6, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true }, traits: "Auto", defaultModels: 1 },
    { name: "Plasma Blaster (Sustained)", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching6: true }, traits: "Plasma", defaultModels: 1 },
    { name: "Plasma Blaster (Maximal)", shots: 2, s: 8, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true, getshot: true }, traits: "Plasma", defaultModels: 1 },
  ],
  tartaros: [
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Plasma Blaster (Sustained)", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching6: true }, traits: "Plasma", defaultModels: 1 },
    { name: "Plasma Blaster (Maximal)", shots: 2, s: 8, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true, getshot: true }, traits: "Plasma", defaultModels: 1 },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { melta: true }, traits: "Melta" },
    { name: "Combi-Plasma (Maximal)", shots: 2, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true }, traits: "Plasma" },
  ],
  saturnine: [
    { name: "Plasma Bombard (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Barrage", rules: { barrage: true, blast: true, breaching6: true }, traits: "Plasma" },
    { name: "Plasma Bombard (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Barrage", rules: { barrage: true, blast: true, breaching5: true, getshot: true }, traits: "Plasma" },
    { name: "Twin Heavy Disintegrator", shots: 2, s: 7, ap: "2", damage: 2, type: "Rapid Fire", rules: { getshot: true }, traits: "Disintegrator", defaultModels: 1 },
    { name: "Particle Shredder", shots: 1, s: 6, ap: "3", damage: 1, type: "Assault", rules: { breaching6: true, getshot: true, template: true }, traits: "Assault, Particle", defaultModels: 1 },
  ],
  saturnine_cmd: [
    { name: "Plasma Bombard (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Barrage", rules: { barrage: true, blast: true, breaching6: true }, traits: "Plasma" },
    { name: "Plasma Bombard (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Barrage", rules: { barrage: true, blast: true, breaching5: true, getshot: true }, traits: "Plasma" },
    { name: "Twin Heavy Disintegrator", shots: 2, s: 7, ap: "2", damage: 2, type: "Rapid Fire", rules: { getshot: true }, traits: "Disintegrator" },
    { name: "Particle Shredder", shots: 1, s: 6, ap: "3", damage: 1, type: "Assault", rules: { breaching6: true, getshot: true, template: true }, traits: "Assault, Particle" },
    { name: "Plasma Blaster (Sustained)", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Plasma Blaster (Maximal)", shots: 2, s: 8, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true, getshot: true }, traits: "Plasma" },
  ],
  phraetus_conclave: [
    { name: "Plasma Bombard (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Barrage", rules: { barrage: true, blast: true, breaching6: true }, traits: "Plasma" },
    { name: "Plasma Bombard (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Barrage", rules: { barrage: true, blast: true, breaching5: true, getshot: true }, traits: "Plasma" },
    { name: "Twin Heavy Disintegrator", shots: 2, s: 7, ap: "2", damage: 2, type: "Rapid Fire", rules: { getshot: true }, traits: "Disintegrator" },
    { name: "Particle Shredder", shots: 1, s: 6, ap: "3", damage: 1, type: "Assault", rules: { breaching6: true, getshot: true, template: true }, traits: "Assault, Particle" },
  ],
  // VEHICLES & DREADS
  contemptor: [
    { name: "Kheres Assault Cannon", shots: 5, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { breaching6: true }, traits: "Auto" },
    { name: "Twin Lascannon", shots: 2, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Autocannon (Twin)", shots: 2, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true }, traits: "Auto" },
    { name: "Twin Heavy Bolter", shots: 6, s: 5, ap: "4", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Volkite Dual-Culverin", shots: 6, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Multi-Melta", shots: 1, s: 8, ap: "1", damage: 3, type: "Heavy", rules: { melta: true }, traits: "Melta" },
    { name: "Conversion Beam Cannon (<15\")", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true } },
    { name: "Conversion Beam Cannon (15-30\")", shots: 1, s: 7, ap: "3", damage: 2, type: "Heavy", rules: { blast: true } },
    { name: "Conversion Beam Cannon (>30\")", shots: 1, s: 8, ap: "2", damage: 3, type: "Heavy", rules: { blast: true } },
  ],
  saturnine_dread: [
    { name: "Heavy Plasma Bombard (Sustained)", shots: 1, s: 7, ap: "4", damage: 2, type: "Barrage", rules: { barrage: true, blast: true, breaching6: true }, traits: "Plasma" },
    { name: "Heavy Plasma Bombard (Maximal)", shots: 1, s: 8, ap: "4", damage: 2, type: "Barrage", rules: { barrage: true, blast: true, breaching5: true, getshot: true }, traits: "Plasma" },
    { name: "Disintegrator Cannon", shots: 2, s: 9, ap: "2", damage: 3, type: "Rapid Fire", rules: { getshot: true }, traits: "Disintegrator" },
    { name: "Photonic Incinerator", shots: 1, s: 6, ap: "4", damage: 1, type: "Assault", rules: { panic: true, template: true }, traits: "Assault, Flame" },
  ],
  leviathan: [
    { name: "Leviathan Storm Cannon", shots: 4, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching5: true }, traits: "Auto" },
    { name: "Cyclonic Melta Lance", shots: 3, s: 8, ap: "2", damage: 3, type: "Heavy", rules: { melta: true }, traits: "Melta" },
    { name: "Siege Claw (ranged)", shots: 1, s: 6, ap: "3", damage: 1, type: "Assault", rules: {}, traits: "Assault" },
  ],
  deredeo: [
    { name: "Anvilus Autocannon Battery", shots: 6, s: 8, ap: "4", damage: 2, type: "Rapid Fire", rules: { breaching5: true, skyfire: true }, traits: "Auto" },
    { name: "Arachnus Heavy Las Battery", shots: 2, s: 9, ap: "2", damage: 4, type: "Heavy", rules: { armourbane: true, skyfire: true }, traits: "Las" },
    { name: "Aiolos Missile Launcher", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true, barrage: true } },
  ],
  predator: [
    { name: "Predator Cannon (Autocannon)", shots: 3, s: 8, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true }, traits: "Auto" },
    { name: "Lascannon Turret (Twin)", shots: 2, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Lascannon Sponsons x2", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Heavy Bolter Sponsons x2", shots: 5, s: 3, ap: "4", damage: 1, type: "Heavy", rules: {  }, traits: "Bolt" },
  ],
  sicaran: [
    { name: "Twin Accelerator Autocannon", shots: 6, s: 7, ap: "4", damage: 2, type: "Ordnance", rules: { suppressive: true }, traits: "Auto" },
    { name: "Lascannon Sponsons x2", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Heavy Bolter Sponsons x2", shots: 5, s: 3, ap: "4", damage: 1, type: "Heavy", rules: {  }, traits: "Bolt" },
  ],
  sicaran_venator: [
    { name: "Neutron Laser Beam Cannon", shots: 2, s: 10, ap: "2", damage: 2, type: "Ordnance", rules: { armourbane: true }, traits: "Las" },
    { name: "Lascannon Sponsons x2", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
  ],
  vindicator: [
    { name: "Demolisher Cannon", shots: 1, s: 12, ap: "3", damage: 3, type: "Ordnance", rules: { blast: true, breaching5: true, stun: true } },
  ],
  land_raider: [
    { name: "Twin Lascannon x2 (sponsons)", shots: 2, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Hull Heavy Bolter", shots: 5, s: 3, ap: "4", damage: 1, type: "Heavy", rules: {  }, traits: "Bolt" },
  ],
  spartan: [
    { name: "Lascannon Array x2", shots: 2, s: 9, ap: "2", damage: 3, type: "Rapid Fire", rules: { armourbane: true }, traits: "Las" },
    { name: "Hull Heavy Bolter", shots: 5, s: 3, ap: "4", damage: 1, type: "Heavy", rules: {  }, traits: "Bolt" },
    { name: "Havoc Launcher (opt)", shots: 1, s: 5, ap: "5", damage: 1, type: "Rapid Fire", rules: { blast: true, stun: true }, traits: "Missile" },
  ],
  araknae: [
    { name: "Quad Accelerator Autocannon", shots: 10, s: 7, ap: "4", damage: 2, type: "Rapid Fire", rules: { breaching6: true, skyfire: true }, traits: "Auto" },
  ],
  rapier_la: [
    { name: "Gravis Heavy Bolter Battery", shots: 5, s: 8, ap: "4", damage: 1, type: "Rapid Fire", rules: { suppressive: true }, traits: "Bolt" },
    { name: "Laser Destroyer", shots: 2, s: 10, ap: "2", damage: 2, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Graviton Cannon", shots: 1, s: 8, ap: "3", damage: 1, type: "Heavy", rules: { blast: true, breaching6: true, pinning: true }, traits: "Graviton" },
    { name: "Quad Launcher (Frag)", shots: 1, s: 5, ap: "5", damage: 1, type: "Heavy", rules: { barrage: true, blast: true } },
    { name: "Quad Launcher (Shatter)", shots: 4, s: 7, ap: "4", damage: 1, type: "Heavy", rules: { armourbane: true } },
  ],
  // SOLAR AUXILIA
  lasrifle: [
    { name: "Lasrifle", shots: 1, s: 3, ap: "6", damage: 1, type: "Rapid Fire", rules: {}, traits: "Las" },
  ],
  veletaris: [
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
  ],
  rapier: [
    { name: "Laser Destroyer", shots: 2, s: 10, ap: "2", damage: 2, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Quad Launcher (Frag)", shots: 1, s: 5, ap: "5", damage: 1, type: "Heavy", rules: { blast: true, barrage: true } },
    { name: "Quad Launcher (Shatter)", shots: 4, s: 7, ap: "4", damage: 1, type: "Heavy", rules: { armourbane: true } },
  ],
  // ── SOL AUXILIA COMMAND SECTIONS ──
  legate_cmd_sa: [
    { name: "Lasrifle", shots: 1, s: 3, ap: "6", damage: 1, type: "Assault", rules: {}, traits: "Las" },
    { name: "Laspistol", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Las" },
    { name: "Charnabal Sabre (Legate)", shots: 0, s: "S", ap: "3", damage: 1, type: "Melee", rules: { breaching6: true }, traits: "Charnabal" },
    { name: "Power Sword (Legate)", shots: 0, s: "S", ap: "3", damage: 1, type: "Melee", rules: { breaching6: true }, traits: "Power" },
  ],
  tactical_cmd_sa: [
    { name: "Lasrifle", shots: 1, s: 3, ap: "6", damage: 1, type: "Assault", rules: {}, traits: "Las" },
    { name: "Laspistol", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Las" },
    { name: "Charnabal Sabre (Optio)", shots: 0, s: "S", ap: "3", damage: 1, type: "Melee", rules: { breaching6: true }, traits: "Charnabal" },
  ],
  line_cmd_sa: [
    { name: "Lasrifle", shots: 1, s: 3, ap: "6", damage: 1, type: "Assault", rules: {}, traits: "Las" },
    { name: "Laspistol", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Las" },
    { name: "Charnabal Sabre (Optio)", shots: 0, s: "S", ap: "3", damage: 1, type: "Melee", rules: { breaching6: true }, traits: "Charnabal" },
  ],
  veletaris_cmd_sa: [
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Laspistol", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Las" },
    { name: "Charnabal Sabre (Optio)", shots: 0, s: "S", ap: "3", damage: 1, type: "Melee", rules: { breaching6: true }, traits: "Charnabal" },
  ],
  hermes_cmd_sa: [
    { name: "Multi-laser", shots: 3, s: 6, ap: "6", damage: 1, type: "Heavy", rules: { suppressive: true }, traits: "Las" },
    { name: "Grenade Launcher (Frag)", shots: 1, s: 3, ap: "6", damage: 1, type: "Assault", rules: { blast: true, stun: true } },
    { name: "Grenade Launcher (Krak)", shots: 2, s: 7, ap: "4", damage: 2, type: "Assault", rules: {} },
    { name: "Laspistol", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Las" },
  ],
  artillery_cmd_sa: [
    { name: "Lasrifle", shots: 1, s: 3, ap: "6", damage: 1, type: "Assault", rules: {}, traits: "Las" },
    { name: "Laspistol", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Las" },
    { name: "Charnabal Sabre (Optio)", shots: 0, s: "S", ap: "3", damage: 1, type: "Melee", rules: { breaching6: true }, traits: "Charnabal" },
  ],
  armoured_cmd_sa: [
    { name: "Lasrifle", shots: 1, s: 3, ap: "6", damage: 1, type: "Assault", rules: {}, traits: "Las" },
    { name: "Laspistol", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Las" },
    { name: "Charnabal Sabre (Optio)", shots: 0, s: "S", ap: "3", damage: 1, type: "Melee", rules: { breaching6: true }, traits: "Charnabal" },
  ],
  // ── SOL AUXILIA ELITES / HEAVY ASSAULT ──
  veletaris_vanguard_sa: [
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Power Sword (Optio)", shots: 0, s: "S", ap: "3", damage: 1, type: "Melee", rules: { breaching6: true }, traits: "Power" },
  ],
  charonite_sa: [
    { name: "Laspistol", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Las" },
    { name: "Charonite Claws", shots: 0, s: 7, ap: "3", damage: 2, type: "Melee", rules: { breaching5: true }, traits: "Power" },
  ],
  // ── SOL AUXILIA SUPPORT / ARTILLERY ──
  basilisk_sa: [
    { name: "Earthshaker Cannon", shots: 1, s: 7, ap: "4", damage: 2, type: "Ordnance", rules: { barrage: true, blast: true, pinning: true, breaching6: true } },
    { name: "Hull Heavy Bolter", shots: 3, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Bolt" },
  ],
  medusa_sa: [
    { name: "Medusa Mortar", shots: 1, s: 5, ap: "4", damage: 2, type: "Ordnance", rules: { barrage: true, blast: true, pinning: true, breaching5: true } },
    { name: "Hull Heavy Bolter", shots: 3, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Bolt" },
  ],
  aethon_sa: [
    { name: "Aethon Missile Battery", shots: 1, s: 4, ap: "5", damage: 2, type: "Heavy", rules: { barrage: true, blast: true, stun: true }, traits: "Missile" },
    { name: "Multi-laser (alt)", shots: 3, s: 6, ap: "6", damage: 1, type: "Heavy", rules: { suppressive: true }, traits: "Las" },
    { name: "Lascannon (alt)", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
  ],
  // ── SOL AUXILIA RECON ──
  hermes_light_sa: [
    { name: "Multi-laser", shots: 3, s: 6, ap: "6", damage: 1, type: "Heavy", rules: { suppressive: true }, traits: "Las" },
    { name: "Grenade Launcher (Frag)", shots: 1, s: 3, ap: "6", damage: 1, type: "Assault", rules: { blast: true, stun: true } },
    { name: "Grenade Launcher (Krak)", shots: 2, s: 7, ap: "4", damage: 2, type: "Assault", rules: {} },
  ],
  // ── SOL AUXILIA FAST ATTACK ──
  hermes_vel_sa: [
    { name: "Volkite Culverin", shots: 3, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Grenade Launcher (Frag)", shots: 1, s: 3, ap: "6", damage: 1, type: "Assault", rules: { blast: true, stun: true } },
    { name: "Grenade Launcher (Krak)", shots: 2, s: 7, ap: "4", damage: 2, type: "Assault", rules: {} },
  ],
  primaris_lightning_sa: [
    { name: "Autocannon x2", shots: 4, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true }, traits: "Auto" },
    { name: "Hellstrike Missile", shots: 1, s: 9, ap: "3", damage: 3, type: "Heavy", rules: { armourbane: true, limited: true }, traits: "Missile" },
    { name: "Lascannon (opt)", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
  ],
  thunderbolt_sa: [
    { name: "Autocannon x2", shots: 4, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true }, traits: "Auto" },
    { name: "Hellstrike Missile", shots: 1, s: 9, ap: "3", damage: 3, type: "Heavy", rules: { armourbane: true, limited: true }, traits: "Missile" },
    { name: "Twin Lascannon (opt)", shots: 2, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
  ],
  // ── SOL AUXILIA TRANSPORTS ──
  arvus_sa: [
    { name: "Hull Heavy Bolter (opt)", shots: 3, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Bolt" },
  ],
  dracosan_sa: [
    { name: "Twin Lascannon", shots: 2, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Hull Multi-laser", shots: 3, s: 6, ap: "6", damage: 1, type: "Heavy", rules: { suppressive: true }, traits: "Las" },
    { name: "Hull Heavy Flamer (opt)", shots: 1, s: 5, ap: "4", damage: 1, type: "Template", rules: { panic: true }, traits: "Flame" },
  ],
  // ── SOL AUXILIA ARMOUR ──
  leman_russ_strike_sa: [
    { name: "Battlecannon", shots: 1, s: 8, ap: "4", damage: 2, type: "Heavy", rules: { blast: true, pinning: true }, traits: "Auto" },
    { name: "Hull Heavy Bolter", shots: 3, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Bolt" },
    { name: "Hull Lascannon (opt)", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
  ],
  leman_russ_assault_sa: [
    { name: "Demolisher Cannon", shots: 1, s: 12, ap: "3", damage: 3, type: "Ordnance", rules: { blast: true, breaching5: true, stun: true } },
    { name: "Hull Heavy Bolter", shots: 3, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Bolt" },
    { name: "Hull Lascannon (opt)", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
  ],
  // ── SOL AUXILIA LORD OF WAR ──
  malcador_sa: [
    { name: "Battlecannon", shots: 1, s: 8, ap: "4", damage: 2, type: "Heavy", rules: { blast: true, pinning: true }, traits: "Auto" },
    { name: "Twin Battlecannon (alt)", shots: 2, s: 10, ap: "2", damage: 3, type: "Heavy", rules: { criticalHit: true }, traits: "Auto" },
    { name: "Lascannon Sponsons x2 (opt)", shots: 2, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Hull Heavy Bolter", shots: 3, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Bolt" },
  ],
  malcador_infernus_sa: [
    { name: "Infernus Cannon", shots: 1, s: 6, ap: "4", damage: 2, type: "Template", rules: { hellstorm: true, panic: true }, traits: "Flame" },
    { name: "Hull Multi-laser", shots: 3, s: 6, ap: "6", damage: 1, type: "Heavy", rules: { suppressive: true }, traits: "Las" },
    { name: "Sponson Heavy Flamers x2 (opt)", shots: 1, s: 5, ap: "4", damage: 1, type: "Template", rules: { panic: true }, traits: "Flame" },
  ],
  valdor_sa: [
    { name: "Neutron Beam Laser", shots: 2, s: 10, ap: "2", damage: 2, type: "Ordnance", rules: { armourbane: true, shock: true }, traits: "Las" },
    { name: "Hull Lascannon", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
  ],
  stormhammer_sa: [
    { name: "Stormhammer Cannon", shots: 1, s: 9, ap: "3", damage: 3, type: "Heavy", rules: { blast: true, stun: true }, traits: "Auto" },
    { name: "Twin Battlecannon (sponson) x2", shots: 4, s: 10, ap: "2", damage: 3, type: "Heavy", rules: { criticalHit: true }, traits: "Auto" },
    { name: "Hull Multi-laser", shots: 3, s: 6, ap: "6", damage: 1, type: "Heavy", rules: { suppressive: true }, traits: "Las" },
    { name: "Pintle Heavy Bolter (opt)", shots: 3, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Bolt" },
  ],
  // MECHANICUM
  thallax: [
    { name: "Lightning Locks", shots: 3, s: 7, ap: "5", damage: 1, type: "Assault", rules: { rending: true, shred: true }, traits: "Assault" },
  ],
  castellax: [
    { name: "Mauler Bolt Cannon", shots: 3, s: 6, ap: "3", damage: 1, type: "Heavy", rules: { pinning: true }, traits: "Bolt" },
    { name: "Darkfire Cannon", shots: 2, s: 7, ap: "2", damage: 2, type: "Heavy", rules: { getshot: true } },
  ],
  thanatar: [
    { name: "Plasma Mortar", shots: 1, s: 8, ap: "2", damage: 2, type: "Barrage", rules: { blast: true, getshot: true, breaching: true }, traits: "Plasma" },
  ],
  // CUSTODES
  custodian_guard: [
    { name: "Guardian Spear (shooting)", shots: 2, s: 4, ap: "3", damage: 1, type: "Assault", rules: {}, traits: "Assault" },
  ],
  sagittarum: [
    { name: "Adrastus Bolt Caliver", shots: 3, s: 5, ap: "3", damage: 1, type: "Heavy", rules: { breaching6: true }, traits: "Bolt" },
  ],
  aquilon: [
    { name: "Twin Adrathic Destructor", shots: 2, s: 5, ap: "2", damage: 2, type: "Assault", rules: { twinLinked: true }, traits: "Assault" },
  ],
  caladius: [
    { name: "Iliastus Accelerator", shots: 3, s: 7, ap: "3", damage: 2, type: "Heavy", rules: { rending: true } },
  ],
  // New units (basic defaults)
  centurion: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Combi-Plasma", shots: 1, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { getshot: true, breaching: true }, traits: "Plasma" },
  ],
  centurion_ta: [
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Combi-Plasma (Maximal)", shots: 2, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { melta: true }, traits: "Melta" },
  ],
  apothecary: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true }, traits: "Assault, Plasma" },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true }, traits: "Assault, Volkite" },
  ],
  ogryn: [
    { name: "Laspistol", shots: 1, s: 3, ap: "6", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Las" },
  ],
  tech_thrall: [
    { name: "Laslock", shots: 1, s: 3, ap: "6", damage: 1, type: "Assault", rules: {}, traits: "Assault, Las" },
    { name: "Mitra-Lock", shots: 2, s: 3, ap: "6", damage: 1, type: "Assault", rules: {}, traits: "Assault, Las" },
  ],
  myrmidon_dest: [
    { name: "Volkite Culverin", shots: 3, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Irradiation Engine", shots: 1, s: 4, ap: "3", damage: 1, type: "Heavy", rules: { fleshbane: true, blast: true } },
    { name: "Photon Thruster", shots: 2, s: 6, ap: "2", damage: 2, type: "Heavy", rules: { getshot: true } },
  ],
  vorax: [
    { name: "Rotor Cannon x2", shots: 3, s: 3, ap: "4", damage: 1, type: "Heavy", rules: { suppressive: true }, traits: "Auto" },
    { name: "Lightning Gun", shots: 3, s: 7, ap: "5", damage: 1, type: "Assault", rules: { rending: true, shred: true }, traits: "Assault" },
  ],
  // ── MECHANICUM TAGHMATA ──
  archmagos_tm: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Bolt" },
    { name: "Phased Plasma-Fusil", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true }, traits: "Plasma" },
    { name: "Conversion Beamer (<15\")", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true } },
    { name: "Conversion Beamer (15-30\")", shots: 1, s: 7, ap: "3", damage: 2, type: "Heavy", rules: { blast: true } },
    { name: "Conversion Beamer (>30\")", shots: 1, s: 8, ap: "2", damage: 3, type: "Heavy", rules: { blast: true } },
    { name: "Irad-Cleanser", shots: 1, s: 5, ap: "1", damage: 1, type: "Assault", rules: { template: true, poisoned2: true }, traits: "Flame" },
  ],
  archmagos_abeyant_tm: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Bolt" },
    { name: "Phased Plasma-Fusil", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true }, traits: "Plasma" },
    { name: "Conversion Beamer (<15\")", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true } },
    { name: "Conversion Beamer (15-30\")", shots: 1, s: 7, ap: "3", damage: 2, type: "Heavy", rules: { blast: true } },
    { name: "Conversion Beamer (>30\")", shots: 1, s: 8, ap: "2", damage: 3, type: "Heavy", rules: { blast: true } },
    { name: "Irad-Cleanser", shots: 1, s: 5, ap: "1", damage: 1, type: "Assault", rules: { template: true, poisoned2: true }, traits: "Flame" },
  ],
  magos_tm: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Bolt" },
    { name: "Phased Plasma-Fusil", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true }, traits: "Plasma" },
    { name: "Conversion Beamer (<15\")", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true } },
    { name: "Conversion Beamer (15-30\")", shots: 1, s: 7, ap: "3", damage: 2, type: "Heavy", rules: { blast: true } },
    { name: "Conversion Beamer (>30\")", shots: 1, s: 8, ap: "2", damage: 3, type: "Heavy", rules: { blast: true } },
    { name: "Irad-Cleanser", shots: 1, s: 5, ap: "1", damage: 1, type: "Assault", rules: { template: true, poisoned2: true }, traits: "Flame" },
  ],
  magos_abeyant_tm: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Bolt" },
    { name: "Phased Plasma-Fusil", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true }, traits: "Plasma" },
    { name: "Conversion Beamer (<15\")", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true } },
    { name: "Conversion Beamer (15-30\")", shots: 1, s: 7, ap: "3", damage: 2, type: "Heavy", rules: { blast: true } },
    { name: "Conversion Beamer (>30\")", shots: 1, s: 8, ap: "2", damage: 3, type: "Heavy", rules: { blast: true } },
    { name: "Irad-Cleanser", shots: 1, s: 5, ap: "1", damage: 1, type: "Assault", rules: { template: true, poisoned2: true }, traits: "Flame" },
  ],
  arcuitor_tm: [
    { name: "Archaeotech Pistol", shots: 1, s: 6, ap: "4", damage: 2, type: "Pistol", rules: { breaching3: true }, traits: "Assault" },
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Bolt" },
  ],
  tech_priest_tm: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Bolt" },
  ],
  scyllax_tm: [
    // Scyllax have no ranged weapons; melee-only unit
  ],
  secutor_tm: [
    { name: "Twin Maxima Bolters", shots: 5, s: 4, ap: "5", damage: 1, type: "Assault", rules: {}, traits: "Bolt" },
    { name: "Phased Plasma-Fusil", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true }, traits: "Plasma" },
    { name: "Volkite Caliver", shots: 2, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite" },
  ],
  tech_thrall_cov_tm: [
    { name: "Las-Lock", shots: 1, s: 4, ap: "6", damage: 1, type: "Assault", rules: {}, traits: "Las" },
  ],
  thallax_full_tm: [
    { name: "Lightning Gun", shots: 3, s: 5, ap: "5", damage: 1, type: "Assault", rules: { rending: true }, traits: "Assault" },
  ],
  ursarax_tm: [
    { name: "Volkite Incinerator", shots: 2, s: 5, ap: "6", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Volkite" },
  ],
  echidnax_tm: [
    // Echidnax are maintenance automata — no dedicated ranged weapons
  ],
  destructor_tm: [
    { name: "Volkite Culverin", shots: 3, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Irradiation Engine", shots: 1, s: 4, ap: "3", damage: 1, type: "Heavy", rules: { fleshbane: true, blast: true } },
    { name: "Photon Thruster", shots: 2, s: 6, ap: "2", damage: 2, type: "Heavy", rules: { getshot: true } },
  ],
  domitar_tm: [
    { name: "Cyclone ML (Frag)", shots: 1, s: 4, ap: "6", damage: 1, type: "Heavy", rules: { blast: true }, traits: "Missile" },
    { name: "Cyclone ML (Krak)", shots: 1, s: 8, ap: "3", damage: 1, type: "Heavy", rules: {}, traits: "Missile" },
    { name: "Cyclone ML (Flak)", shots: 2, s: 7, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Missile" },
  ],
  castellax_dest_tm: [
    { name: "Twin Bolters", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {}, traits: "Bolt" },
    { name: "Mauler Bolt Cannon", shots: 4, s: 6, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Bolt" },
  ],
  castellax_battle_tm: [
    { name: "Twin Bolters", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {}, traits: "Bolt" },
    { name: "Mauler Bolt Cannon", shots: 4, s: 6, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Bolt" },
    { name: "Darkfire Cannon", shots: 2, s: 7, ap: "2", damage: 2, type: "Heavy", rules: { getshot: true } },
  ],
  thanatar_siege_tm: [
    { name: "Twin Mauler Bolt Cannon", shots: 8, s: 6, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Bolt" },
    { name: "Plasma Mortar (Sustained)", shots: 1, s: 8, ap: "2", damage: 2, type: "Barrage", rules: { blast: true, breaching6: true, barrage: true }, traits: "Plasma" },
    { name: "Plasma Mortar (Maximal)", shots: 1, s: 9, ap: "2", damage: 3, type: "Barrage", rules: { blast: true, breaching5: true, getshot: true, barrage: true }, traits: "Plasma" },
    { name: "Sollex Heavy-Las", shots: 2, s: 10, ap: "2", damage: 3, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
  ],
  armiger_tm: [
    { name: "Irad-Cleanser", shots: 1, s: 5, ap: "1", damage: 1, type: "Assault", rules: { template: true, poisoned2: true }, traits: "Flame" },
    { name: "Volkite Veuglaire", shots: 3, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Lightning Lock", shots: 3, s: 7, ap: "5", damage: 1, type: "Assault", rules: { rending: true }, traits: "Assault" },
  ],
  triaros_tm: [
    { name: "Volkite Calivers (x2)", shots: 4, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Mauler Bolt Cannon", shots: 4, s: 6, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Bolt" },
  ],
  // ── MACHINA MALEFICA ──
  decimator_mm: [
    { name: "Two Heavy Flamers", shots: 1, s: 5, ap: "4", damage: 1, type: "Assault", rules: { template: true, panic: true }, traits: "Flame" },
  ],
  blood_slaughterer_mm: [
    // Blood Slaughterer is a melee-only daemon engine — no ranged weapons
  ],
  brass_scorpion_mm: [
    { name: "Scorpion Cannon", shots: 4, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching5: true }, traits: "Auto" },
    { name: "Despoiler Cannon (HE)", shots: 1, s: 8, ap: "4", damage: 2, type: "Ordnance", rules: { blast: true } },
    { name: "Twin Hellmaw Cannon", shots: 1, s: 6, ap: "4", damage: 1, type: "Assault", rules: { template: true, panic: true }, traits: "Flame" },
  ],
  kytan_mm: [
    { name: "Kytan Gatling Cannon", shots: 12, s: 6, ap: "4", damage: 1, type: "Heavy", rules: {}, traits: "Auto" },
  ],
  scoria_mm: [
    { name: "Twin Archaeotech Pistols", shots: 2, s: 6, ap: "4", damage: 2, type: "Pistol", rules: { breaching3: true }, traits: "Assault" },
  ],
  draykavac_mm: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Bolt" },
    { name: "Graviton Gun", shots: 1, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { blast: true, breaching6: true, pinning: true }, traits: "Graviton" },
  ],
  // PRIMARCHS (LOYALIST)
  lion: [
    { name: "Fusil Actinaeus (Plasma)", shots: 2, s: 7, ap: "2", damage: 2, type: "Pistol", rules: { breaching: true } },
  ],
  khan: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
  ],
  russ: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
  ],
  dorn: [
    { name: "Voice of Terra", shots: 4, s: 6, ap: "3", damage: 2, type: "Assault", rules: { pinning: true } },
  ],
  sanguinius: [
    { name: "Infernus Pistol", shots: 1, s: 8, ap: "1", damage: 2, type: "Pistol", rules: {}, traits: "Assault, Melta" },
  ],
  ferrus: [
    { name: "Graviton Imploder", shots: 1, s: 8, ap: "2", damage: 2, type: "Assault", rules: {} },
    { name: "Plasma Imploder", shots: 2, s: 7, ap: "2", damage: 2, type: "Assault", rules: { breaching: true, getshot: true }, traits: "Plasma" },
  ],
  guilliman: [
    { name: "Arbitrator (Combi)", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
  ],
  vulkan: [
    { name: "Furnace's Heart (Beam)", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { panic: true } },
    { name: "Furnace's Heart (Flame)", shots: 1, s: 6, ap: "3", damage: 1, type: "Assault", rules: { panic: true } },
  ],
  corax: [
    { name: "Panoply of the Raven (Archeotech)", shots: 2, s: 6, ap: "3", damage: 1, type: "Assault", rules: {} },
  ],
  // PRIMARCHS (TRAITOR)
  fulgrim: [
    { name: "Fireblade (Volkite)", shots: 4, s: 6, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true } },
  ],
  perturabo: [
    { name: "Logos (Wrist Guns)", shots: 4, s: 7, ap: "3", damage: 2, type: "Assault", rules: {} },
    { name: "Logos (Missile)", shots: 1, s: 8, ap: "2", damage: 2, type: "Heavy", rules: { blast: true } },
  ],
  curze: [
    { name: "Mercy & Forgiveness (Thrown)", shots: 2, s: 5, ap: "3", damage: 1, type: "Assault", rules: {} },
  ],
  angron: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
  ],
  lorgar: [
    { name: "Archaeotech Pistol", shots: 1, s: 6, ap: "4", damage: 2, type: "Pistol", rules: { breaching3: true }, traits: "Assault" },
  ],
  mortarion: [
    { name: "The Lantern (Beam)", shots: 2, s: 8, ap: "2", damage: 2, type: "Assault", rules: { sunder: true } },
  ],
  magnus: [
    { name: "Psychic Bolt", shots: 3, s: 8, ap: "2", damage: 2, type: "Assault", rules: {} },
  ],
  horus: [
    { name: "Warmaster's Combi (Bolter)", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Warmaster's Combi (Disintegrator)", shots: 1, s: 5, ap: "2", damage: 2, type: "Assault", rules: { getshot: true } },
  ],
  alpharius: [
    { name: "Pale Spear (Ranged)", shots: 2, s: 6, ap: "2", damage: 2, type: "Assault", rules: {} },
  ],
  daemon_lesser: [
    { name: "Warp Bolt", shots: 1, s: 4, ap: "5", damage: 1, type: "Assault", rules: {} },
  ],
  daemon_greater: [
    { name: "Warp Flame", shots: 3, s: 6, ap: "3", damage: 2, type: "Assault", rules: {} },
  ],
  // FAST ATTACK
  xiphon: [
    { name: "Twin Lascannon x2", shots: 4, s: 9, ap: "2", damage: 2, type: "Heavy", rules: { twinLinked: true }, traits: "Las" },
    { name: "Rotary Missile Launcher", shots: 3, s: 8, ap: "2", damage: 2, type: "Rapid Fire", rules: {  }, traits: "Missile" },
  ],
  storm_eagle: [
    { name: "Twin Heavy Bolter", shots: 6, s: 5, ap: "4", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Vengeance Launcher", shots: 1, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { blast: true }, traits: "Missile" },
    { name: "Tempest Rockets x4", shots: 1, s: 7, ap: "4", damage: 3, type: "Rapid Fire", rules: { armourbane: true }, traits: "Guided Missile" },
    { name: "Twin Multi-Melta (opt)", shots: 2, s: 8, ap: "1", damage: 3, type: "Heavy", rules: { melta: true }, traits: "Melta" },
    { name: "Cyclone Missile L. (opt)", shots: 2, s: 8, ap: "3", damage: 1, type: "Heavy", rules: {} },
    { name: "Hunter-Killer Missiles x4 (opt)", shots: 4, s: 8, ap: "3", damage: 1, type: "Heavy", rules: {} },
    { name: "Twin Lascannon x2 (opt)", shots: 4, s: 9, ap: "2", damage: 2, type: "Heavy", rules: { twinLinked: true } },
  ],
  fire_raptor: [
    { name: "Twin Avenger Bolt Cannon", shots: 10, s: 6, ap: "3", damage: 1, type: "Rapid Fire", rules: { suppressive: true }, traits: "Bolt" },
    { name: "Gravis Heavy Bolter Sponsons x2", shots: 8, s: 5, ap: "4", damage: 1, type: "Heavy", rules: { suppressive: true } },
    { name: "Tempest Rockets x4", shots: 1, s: 7, ap: "4", damage: 3, type: "Rapid Fire", rules: { armourbane: true }, traits: "Guided Missile" },
    { name: "Gravis Autocannon Sponsons (opt)", shots: 4, s: 7, ap: "4", damage: 1, type: "Heavy", rules: {} },
    { name: "Hellstrike Missiles x4 (opt)", shots: 4, s: 8, ap: "2", damage: 2, type: "Heavy", rules: {} },
  ],
  scimitar_jetbike: [
    { name: "Heavy Bolter", shots: 5, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {  }, traits: "Bolt" },
    { name: "Volkite Culverin (opt)", shots: 4, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true } },
    { name: "Multi-Melta (opt)", shots: 1, s: 8, ap: "1", damage: 3, type: "Heavy", rules: {} },
    { name: "Plasma Cannon (opt)", shots: 1, s: 7, ap: "4", damage: 1, type: "Heavy", rules: { getshot: true, breaching: true, blast: true } },
  ],
  javelin: [
    { name: "Heavy Bolter", shots: 5, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {  }, traits: "Bolt" },
    { name: "Cyclone Missile L.", shots: 2, s: 8, ap: "3", damage: 1, type: "Heavy", rules: {} },
    { name: "Two Heavy Flamers (opt)", shots: 2, s: 5, ap: "4", damage: 1, type: "Assault", rules: { panic: true } },
    { name: "Two Heavy Bolters (opt)", shots: 8, s: 5, ap: "4", damage: 1, type: "Heavy", rules: { suppressive: true } },
    { name: "Two Lascannon (opt)", shots: 2, s: 9, ap: "2", damage: 2, type: "Heavy", rules: {} },
    { name: "Two Volkite Culverin (opt)", shots: 8, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true } },
  ],
  land_speeder: [
    { name: "Heavy Bolter", shots: 5, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {  }, traits: "Bolt" },
    { name: "Heavy Flamer (opt)", shots: 1, s: 5, ap: "4", damage: 1, type: "Assault", rules: { panic: true } },
    { name: "Havoc Launcher (opt)", shots: 1, s: 5, ap: "5", damage: 1, type: "Rapid Fire", rules: { blast: true, stun: true }, traits: "Missile" },
    { name: "Multi-Melta (opt)", shots: 1, s: 8, ap: "1", damage: 3, type: "Heavy", rules: {} },
    { name: "Volkite Culverin (opt)", shots: 4, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true } },
    { name: "Plasma Cannon (opt)", shots: 1, s: 7, ap: "4", damage: 1, type: "Heavy", rules: { getshot: true, breaching: true, blast: true } },
    { name: "Graviton Gun (opt)", shots: 1, s: "-", ap: "4", damage: 1, type: "Heavy", rules: { blast: true } },
  ],
  // ── LEGIO CUSTODES ──
  // High Command
  valdor_c: [
    { name: "Apollonian Spear (Ranged)", shots: 2, s: 5, ap: "2", damage: 2, type: "Assault", rules: { suppressive: true }, traits: "Assault, Bolt" },
  ],
  // Command
  tribune_c: [
    { name: "Eternity Spear (Ranged)", shots: 2, s: 4, ap: "3", damage: 1, type: "Assault", rules: { shred: true }, traits: "Assault, Bolt" },
  ],
  shield_captain_c: [
    { name: "Eternity Spear (Ranged, opt)", shots: 2, s: 4, ap: "3", damage: 1, type: "Assault", rules: { shred: true }, traits: "Assault, Bolt" },
    { name: "Eternity Blade (Melee only)", shots: 0, s: 5, ap: "2", damage: 2, type: "Melee", rules: {} },
  ],
  // Troops
  custodian_guard_c: [
    { name: "Guardian Spear (Ranged)", shots: 2, s: 4, ap: "4", damage: 1, type: "Assault", rules: { shred: true }, traits: "Assault, Bolt" },
  ],
  sentinel_guard_c: [
    { name: "Sentinel Warblade (Ranged)", shots: 3, s: 4, ap: "4", damage: 1, type: "Assault", rules: { shred: true }, traits: "Assault, Bolt" },
  ],
  // Heavy Assault
  aquilon_c: [
    { name: "Infernus Firepike", shots: 1, s: 6, ap: "4", damage: 1, type: "Template", rules: { panic: true }, traits: "Flame" },
    { name: "Lastrum Storm Bolter (free opt)", shots: 4, s: 5, ap: "4", damage: 1, type: "Rapid Fire", rules: { shred: true }, traits: "Bolt" },
    { name: "Adrathic Combi-Destructor (+5pts opt)", shots: 2, s: 5, ap: "2", damage: 2, type: "Assault", rules: { rending: true, disintegrator: true } },
  ],
  // War Engines
  contemptor_achillus_c: [
    { name: "Achillus Dreadspear (Ranged)", shots: 1, s: 10, ap: "3", damage: 2, type: "Heavy", rules: { armourbane: true, breaching4: true }, traits: "Las" },
    { name: "Infernus Incinerator x2", shots: 1, s: 6, ap: "4", damage: 1, type: "Template", rules: {}, traits: "Flame" },
    { name: "Lastrum Storm Bolter (free opt, each)", shots: 4, s: 5, ap: "4", damage: 1, type: "Rapid Fire", rules: { shred: true }, traits: "Bolt" },
    { name: "Adrathic Combi-Destructor (+5pts opt, each)", shots: 2, s: 5, ap: "2", damage: 2, type: "Assault", rules: { rending: true, disintegrator: true } },
  ],
  contemptor_galatus_c: [
    { name: "Galatus Warblade (Ranged)", shots: 1, s: 6, ap: "4", damage: 2, type: "Template", rules: { panic: true }, traits: "Flame" },
  ],
  // Fast Attack
  venatari_c: [
    { name: "Kinetic Destroyer", shots: 3, s: 7, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true }, traits: "Assault" },
    { name: "Verutum Lance (Ranged, free opt)", shots: 1, s: 5, ap: "4", damage: 1, type: "Assault", rules: { stun: true }, traits: "Assault" },
  ],
  gyrfalcon_c: [
    { name: "Lastrum Bolt Cannon", shots: 3, s: 6, ap: "4", damage: 2, type: "Heavy", rules: {}, traits: "Bolt" },
    { name: "Adrathic Devastator (+10pts opt)", shots: 1, s: 6, ap: "2", damage: 4, type: "Heavy", rules: { rending: true, disintegrator: true } },
    { name: "Twin Corvae Las-Pulser (+10pts opt)", shots: 1, s: 10, ap: "3", damage: 3, type: "Heavy", rules: { armourbane: true, breaching4: true }, traits: "Las" },
  ],
  pallas_c: [
    { name: "Twin Iliastus Accelerator Fusil", shots: 4, s: 7, ap: "3", damage: 2, type: "Heavy", rules: { breaching6: true, rapidTracking: true }, traits: "Auto" },
    { name: "Twin Arachnus Blaze Cannon — Concentrated (+25pts opt)", shots: 2, s: 9, ap: "2", damage: 2, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Twin Arachnus Blaze Cannon — Burst (+25pts opt)", shots: 5, s: 6, ap: "3", damage: 1, type: "Heavy", rules: {}, traits: "Las" },
  ],
  // Transport
  coronus_c: [
    { name: "Twin Arachnus Blaze Cannon — Concentrated", shots: 2, s: 9, ap: "2", damage: 2, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Twin Arachnus Blaze Cannon — Burst Fire", shots: 5, s: 6, ap: "3", damage: 1, type: "Heavy", rules: {}, traits: "Las" },
    { name: "Hull Twin Lastrum Bolt Cannon", shots: 6, s: 6, ap: "4", damage: 2, type: "Heavy", rules: {}, traits: "Bolt" },
    { name: "Hull Twin Neutronium Cascade Projector (+15pts opt)", shots: 1, s: 7, ap: "3", damage: 2, type: "Template", rules: { breaching6: true }, traits: "Assault" },
  ],
  // Armour
  caladius_c: [
    { name: "Twin Iliastus Accelerator Cannon", shots: 6, s: 8, ap: "3", damage: 2, type: "Heavy", rules: { breaching6: true, rapidTracking: true }, traits: "Auto" },
    { name: "Twin Arachnus Blaze Carronade — Concentrated (Annihilator opt)", shots: 2, s: 10, ap: "2", damage: 2, type: "Ordnance", rules: { armourbane: true }, traits: "Las" },
    { name: "Twin Arachnus Blaze Carronade — Burst (Annihilator opt)", shots: 6, s: 7, ap: "3", damage: 2, type: "Heavy", rules: {}, traits: "Las" },
    { name: "Hull Twin Lastrum Bolt Cannon", shots: 6, s: 6, ap: "4", damage: 2, type: "Heavy", rules: {}, traits: "Bolt" },
    { name: "Hull Twin Neutronium Cascade Projector (+15pts opt)", shots: 1, s: 7, ap: "3", damage: 2, type: "Template", rules: { breaching6: true }, traits: "Assault" },
  ],
  // Lord of War
  telemon_c: [
    { name: "Spiculus Missile Launcher", shots: 6, s: 5, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true, suppressive: true }, traits: "Missile" },
    { name: "Arachnus Storm Cannon — Concentrated (opt)", shots: 2, s: 9, ap: "2", damage: 3, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Arachnus Storm Cannon — Burst (opt)", shots: 4, s: 6, ap: "3", damage: 2, type: "Heavy", rules: {}, traits: "Las" },
    { name: "Adrathic Desolator (opt)", shots: 2, s: 7, ap: "2", damage: 4, type: "Heavy", rules: { rending: true, disintegrator: true } },
    { name: "Iliastus Accelerator Culverin (opt)", shots: 4, s: 9, ap: "3", damage: 2, type: "Heavy", rules: { breaching5: true, rapidTracking: true }, traits: "Auto" },
  ],
  orion_c: [
    { name: "Twin Arachnus Blaze Carronade — Concentrated", shots: 2, s: 10, ap: "2", damage: 2, type: "Ordnance", rules: { armourbane: true }, traits: "Las" },
    { name: "Twin Arachnus Blaze Carronade — Burst Fire", shots: 6, s: 7, ap: "3", damage: 2, type: "Heavy", rules: {}, traits: "Las" },
    { name: "Twin Lastrum Bolt Cannon x2", shots: 6, s: 6, ap: "4", damage: 2, type: "Heavy", rules: {}, traits: "Bolt" },
    { name: "Spiculus Heavy Missile Pod x2", shots: 4, s: 6, ap: "4", damage: 2, type: "Heavy", rules: { breaching5: true, suppressive: true }, traits: "Missile" },
  ],
  ares_c: [
    { name: "Twin Arachnus Storm Carronade — Concentrated", shots: 2, s: 10, ap: "2", damage: 2, type: "Heavy", rules: { armourbane: true }, traits: "Las" },
    { name: "Twin Arachnus Storm Carronade — Burst Fire", shots: 6, s: 7, ap: "3", damage: 2, type: "Heavy", rules: {}, traits: "Las" },
    { name: "Neutronium Magna-Cascade Cannon", shots: 1, s: 10, ap: "3", damage: 3, type: "Template", rules: { hellstorm: true, breaching4: true }, traits: "Assault" },
    { name: "Infernus Firebomb Clusters x2", shots: 1, s: 6, ap: "4", damage: 2, type: "Assault", rules: { blast: true, panic: true }, traits: "Flame" },
  ],
};

// Sergeant weapon options keyed by unit category
// The sergeant replaces 1 model from the squad and fires a different weapon
var SERGEANT_WEAPONS = {
  // Standard Astartes sergeants — Legion Combi-Weapons + Pistols list
  astartes: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true }, traits: "Assault, Plasma" },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Hand Flamer", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: { template: true }, traits: "Assault, Flame" },
    { name: "Archaeotech Pistol", shots: 1, s: 6, ap: "4", damage: 2, type: "Pistol", rules: { breaching3: true }, traits: "Assault" },
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Combi-Plasma (Maximal)", shots: 2, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { melta: true }, traits: "Melta" },
    { name: "Combi-Volkite", shots: 2, s: 5, ap: "5", damage: 1, type: "Rapid Fire", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Combi-Flamer", shots: 1, s: 4, ap: "5", damage: 1, type: "Assault", rules: { panic: true, template: true }, traits: "Flame" },
    { name: "Combi-Disintegrator", shots: 1, s: 4, ap: "3", damage: 2, type: "Rapid Fire", rules: { getshot: true } },
    { name: "Combi-Grenade L. (Frag)", shots: 1, s: 3, ap: "6", damage: 1, type: "Assault", rules: { blast: true } },
    { name: "Combi-Grenade L. (Krak)", shots: 1, s: 6, ap: "4", damage: 1, type: "Assault", rules: {} },
    { name: "Combi-Grav", shots: 1, s: 5, ap: "3", damage: 1, type: "Heavy", rules: { concussion: true } },
  ],
  // Terminator sergeants
  terminator: [
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Combi-Plasma (Maximal)", shots: 2, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { melta: true }, traits: "Melta" },
    { name: "Combi-Volkite", shots: 2, s: 5, ap: "5", damage: 1, type: "Rapid Fire", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Plasma Blaster (Maximal)", shots: 2, s: 8, ap: "4", damage: 1, type: "Assault", rules: { breaching5: true, getshot: true }, traits: "Plasma" },
  ],
  // Solar Auxilia sergeants (Troop Commanders)
  auxilia: [
    { name: "Laspistol", shots: 1, s: 3, ap: "6", damage: 1, type: "Pistol", rules: {}, traits: "Assault, Las" },
    { name: "Blast Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: { getshot: true } },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
  ],
  // Veteran sergeants — full Combi-Weapons + Pistols list
  veteran: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {  }, traits: "Assault, Bolt" },
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true }, traits: "Assault, Plasma" },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { breaching5: true, getshot: true }, traits: "Assault, Plasma" },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true }, traits: "Assault, Volkite" },
    { name: "Hand Flamer", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: { template: true }, traits: "Assault, Flame" },
    { name: "Disintegrator Pistol", shots: 1, s: 4, ap: "3", damage: 2, type: "Pistol", rules: { getshot: true }, traits: "Assault, Disintegrator" },
    { name: "Archaeotech Pistol", shots: 1, s: 6, ap: "4", damage: 2, type: "Pistol", rules: { breaching3: true }, traits: "Assault" },
    { name: "Combi-Bolter", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {  }, traits: "Bolt" },
    { name: "Combi-Plasma (Maximal)", shots: 2, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true }, traits: "Plasma" },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { melta: true }, traits: "Melta" },
    { name: "Combi-Volkite", shots: 2, s: 5, ap: "5", damage: 1, type: "Rapid Fire", rules: { deflagrate: true }, traits: "Volkite" },
    { name: "Combi-Flamer", shots: 1, s: 4, ap: "5", damage: 1, type: "Assault", rules: { panic: true, template: true }, traits: "Flame" },
    { name: "Combi-Disintegrator", shots: 1, s: 4, ap: "3", damage: 2, type: "Rapid Fire", rules: { getshot: true } },
    { name: "Combi-Grenade L. (Frag)", shots: 1, s: 3, ap: "6", damage: 1, type: "Assault", rules: { blast: true } },
    { name: "Combi-Grenade L. (Krak)", shots: 1, s: 6, ap: "4", damage: 1, type: "Assault", rules: {} },
    { name: "Combi-Grav", shots: 1, s: 5, ap: "3", damage: 1, type: "Heavy", rules: { concussion: true } },
  ],
};

// Sergeant melee weapon options for assault phase
var SERGEANT_MELEE_WEAPONS = {
  astartes: [
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
    { name: "Power Sword", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Axe", ws: 4, s: 5, ap: "2", i: 3, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching5: true }, traits: "Power" },
    { name: "Power Maul", ws: 4, s: 6, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {}, traits: "Power" },
    { name: "Lightning Claw", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_rending: true, m_breaching6: true }, traits: "Power" },
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {}, traits: "Power" },
    { name: "Charnabal Sabre", ws: 4, s: 4, ap: "-", i: 5, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true, m_duellist: true }, traits: "Charnabal" },
  ],
  terminator: [
    { name: "Power Sword", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: {}, traits: "Power" },
    { name: "Chainfist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_armourbane: true, m_shred: true }, traits: "Chain" },
    { name: "Lightning Claw", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_rending: true, m_breaching6: true }, traits: "Power" },
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: {}, traits: "Power" },
  ],
  auxilia: [
    { name: "Chainsword", ws: 3, s: 3, ap: "5", i: 3, a: 1, w: 1, t: 3, sv: "4", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
    { name: "Power Sword", ws: 3, s: 3, ap: "3", i: 3, a: 1, w: 1, t: 3, sv: "4", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
  ],
  veteran: [
    { name: "Chainsword", ws: 5, s: 4, ap: "5", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
    { name: "Power Sword", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Axe", ws: 5, s: 5, ap: "2", i: 3, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching5: true }, traits: "Power" },
    { name: "Power Maul", ws: 5, s: 6, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {}, traits: "Power" },
    { name: "Lightning Claw", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_rending: true, m_breaching6: true }, traits: "Power" },
    { name: "Thunder Hammer", ws: 5, s: 8, ap: "2", i: 1, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {}, traits: "Power" },
    { name: "Paragon Blade", ws: 5, s: 5, ap: "2", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_criticalHit: true }, traits: "" },
  ],
};
function getSgtCategory(unitId) {
  if (!unitId) return null;
  if (["cataphractii","tartaros","saturnine","cataphractii_cmd","tartaros_cmd","centurion_ta"].includes(unitId)) return "terminator";
  if (["lasrifle","veletaris"].includes(unitId)) return "auxilia";
  if (["veteran","centurion_cmd"].includes(unitId)) return "veteran";
  if (["praetorian_cmd","praetorian_cmd_jp"].includes(unitId)) return "veteran";
  if (["tactical","tactical_support","heavy_support","seeker","recon","destroyer","breacher","assault","despoiler","veteran_assault","scimitar_jetbike","outrider"].includes(unitId)) return "astartes";
  return null;
}

// Target presets now use the same UNIT_PRESETS — no separate list needed.
// The UnitSelectorModal shows defensive stats when isTarget=true.
