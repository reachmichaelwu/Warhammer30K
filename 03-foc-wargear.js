// FOC slot classification, wargear options
// Lines 348-658 from shooting-resolver165.jsx

// ━━━ FOC SLOT CLASSIFICATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Determines which units can take equipment (Vexilla, Nox-Vox, Melta Bombs)
var UNIT_FOC_SLOT = {
  // TROOPS
  tactical: "troops", despoiler: "troops", tactical_support: "troops",
  breacher: "troops", assault: "troops", lasrifle: "troops",
  veletaris: "troops", tech_thrall: "troops",
  // ELITES
  veteran: "elites", veteran_assault: "elites",
  cataphractii: "elites", tartaros: "elites", saturnine: "elites",
  apothecary: "elites", techmarine: "elites",
  custodian_guard: "elites", sagittarum: "elites", aquilon: "elites",
  thallax: "elites", castellax: "elites", myrmidon_dest: "elites",
  ogryn: "elites",
  praetorian_cmd_jp: "elites", praetorian_cmd: "elites",
  tartaros_cmd: "elites", centurion_cmd: "elites", cataphractii_cmd: "elites", saturnine_cmd: "elites",
  // HEAVY SUPPORT
  heavy_support: "heavy", contemptor: "heavy", leviathan: "heavy",
  deredeo: "heavy", predator: "heavy", sicaran: "heavy",
  sicaran_venator: "heavy", vindicator: "heavy", land_raider: "heavy",
  spartan: "heavy", araknae: "heavy", rapier_la: "heavy",
  saturnine_dread: "heavy", thanatar: "heavy", rapier: "heavy",
  // FAST ATTACK
  scimitar_jetbike: "fast", javelin: "fast", land_speeder: "fast",
  xiphon: "fast", storm_eagle: "fast", fire_raptor: "fast",
  seeker: "fast", recon: "fast", destroyer: "fast", vorax: "fast",
  // HQ
  praetor_pa: "hq", praetor_ta: "hq", praetor_sat: "hq",
  centurion: "hq", centurion_ta: "hq", centurion_sat: "hq", champion: "hq", master_signals: "hq",
  vigilator: "hq", forge_lord: "hq", chaplain: "hq",
  librarian: "hq", herald: "hq", moritat: "hq", siege_breaker: "hq",
  // ── I Dark Angels ──
  corswain: "hq", marduk_sedras: "hq",          // High Command → hq
  deathwing_comp: "elites", inner_circle_knight: "elites",  // Elite
  dreadwing_inter: "troops",                     // Troops
  // ── III Emperor's Children ──
  eidolon: "hq", lucius: "hq", saul_tarvitz: "hq",  // High Cmd / Command → hq
  phoenix_term: "heavy_assault",                 // Heavy Assault
  palatine_blade: "elites",                      // Elite
  kakophoni: "support",                          // Support
  // ── IV Iron Warriors ──
  warsmith: "hq",                                // High Command → hq
  tyrant_siege_term: "heavy_assault",            // Heavy Assault
  domitar_ferrum: "war_engine",                  // War Engine
  // ── V White Scars ──
  qin_xa: "hq", hibou_khan: "hq", stormseer: "hq",  // High Cmd / Command → hq
  keshig_rider: "fast",                          // Fast Attack
  kharash: "elites",                             // Elite
  kyzagan: "recon",                              // Recon
  // ── VI Space Wolves ──
  hvarl: "hq", geigor: "hq", caster_of_runes: "hq",  // High Cmd / Command → hq
  varagyr: "heavy_assault",                      // Heavy Assault
  deathsworn: "elites",                          // Elite
  grey_slayer: "troops",                         // Troops
  // ── VII Imperial Fists ──
  sigismund: "hq", fafnir_rann: "hq", evander_garrius: "hq",  // High Command → hq
  camba_diaz: "hq", alexis_polux: "hq",          // Command → hq
  templar_brethren: "elites",                    // Elite
  phalanx_warder: "troops",                      // Troops
  // ── VIII Night Lords ──
  sevatar: "hq",                                 // High Command → hq
  contekar: "heavy_assault",                     // Heavy Assault
  executioner_nl: "troops",                      // Troops
  night_raptor: "fast",                          // Fast Attack
  // ── IX Blood Angels ──
  raldoron: "hq", dom_zephon: "hq", aster_crohne: "hq",  // High Cmd / Command → hq
  crimson_paladin: "elites",                     // Elite
  dawnbreaker: "fast",                           // Fast Attack
  dawnbreaker_cohort: "elites",                  // Elite (Dawnbreaker Cohort, p.219)
  erelim: "troops",                              // Troops
  contemp_incaendius: "war_engine",              // War Engine
  // ── X Iron Hands ──
  shadrak_meduson: "hq", iron_father: "hq",      // High Command → hq
  gorgon_term: "heavy_assault",                  // Heavy Assault
  immortal_ih: "troops",                         // Troops
  // ── XII World Eaters ──
  kharn: "hq", lotara_sarrin: "hq",              // High Cmd / Command → hq
  red_butcher: "heavy_assault",                  // Heavy Assault
  rampager: "elites",                            // Elite
  // ── XIII Ultramarines ──
  remus_ventanus: "hq",                          // High Command → hq
  invictarus_suz: "elites",                      // Elite
  praetorian_um: "troops",                       // Troops
  // ── XIV Death Guard ──
  calas_typhon: "hq",                            // High Command → hq
  deathshroud: "heavy_assault", grave_warden: "heavy_assault",  // Heavy Assault
  // ── XV Thousand Sons ──
  ahriman: "hq", magistus_amon: "hq", prosperine_sorc: "hq",  // High Cmd / Command → hq
  sekhmet: "heavy_assault",                      // Heavy Assault
  khenetai_blade: "elites",                      // Elite
  castellax_achea: "war_engine", contemp_osiron: "war_engine",  // War Engine
  // ── XVI Sons of Horus ──
  ezekyle_abaddon: "hq", little_horus: "hq",     // High Command → hq
  tybalt_marr: "hq", vheren_ash: "hq", garviel_loken: "hq",   // Command → hq
  maloghurst: "hq", dark_emissary: "hq",         // Command → hq
  justaerin: "heavy_assault",                    // Heavy Assault
  reaver_soh: "elites",                          // Elite
  // ── XVII Word Bearers ──
  kor_phaeron: "hq",                             // High Command → hq
  erebus: "hq", argel_tal: "hq", zardu_layak: "hq",  // Command → hq
  dark_brethren: "elites", anakatis_kul: "elites", phraetus_conclave: "elites",   // Elite
  mhara_gal: "war_engine",                       // War Engine
  incendiary_wb: "troops",                       // Troops
  // ── XVIII Salamanders ──
  firedrake: "heavy_assault",                    // Heavy Assault
  pyroclast: "support",                          // Support
  // ── XIX Raven Guard ──
  kaedes_nex: "hq",                              // Command → hq
  mor_deythan: "recon",                          // Recon
  dark_fury_rg: "fast",                          // Fast Attack
  // ── XX Alpha Legion ──
  armillus_dynat: "hq", saboteur: "hq", exodus_al: "hq",  // High Cmd / Command → hq
  headhunter: "recon",                           // Recon
  lernaean: "heavy_assault",                     // Heavy Assault
  // ── SOLAR AUXILIA ──
  // Command / HQ
  legate_cmd_sa: "hq", tactical_cmd_sa: "hq", line_cmd_sa: "hq",
  veletaris_cmd_sa: "hq", hermes_cmd_sa: "hq",
  artillery_cmd_sa: "hq", armoured_cmd_sa: "hq",
  // Troops (already in map, kept for completeness)
  // lasrifle: "troops", veletaris: "troops", rapier: "heavy" — already defined above
  // Elites
  veletaris_vanguard_sa: "elites",
  // Heavy Assault
  charonite_sa: "heavy_assault",
  // Support
  basilisk_sa: "support", medusa_sa: "support", aethon_sa: "support",
  // Recon
  hermes_light_sa: "recon",
  // Fast Attack
  hermes_vel_sa: "fast", primaris_lightning_sa: "fast", thunderbolt_sa: "fast",
  // Transports
  arvus_sa: "transport", dracosan_sa: "transport",
  // Armour
  leman_russ_strike_sa: "heavy", leman_russ_assault_sa: "heavy",
  // Lord of War
  malcador_sa: "lord_of_war", malcador_infernus_sa: "lord_of_war",
  valdor_sa: "lord_of_war", stormhammer_sa: "lord_of_war",
  // ── LEGIO CUSTODES ──
  // High Command / Command → hq
  valdor_c: "hq", tribune_c: "hq", shield_captain_c: "hq",
  // Troops
  custodian_guard_c: "troops", sentinel_guard_c: "troops",
  // Heavy Assault
  aquilon_c: "heavy_assault",
  // War Engines (walkers)
  contemptor_achillus_c: "war_engine", contemptor_galatus_c: "war_engine",
  // Fast Attack
  venatari_c: "fast", gyrfalcon_c: "fast", pallas_c: "fast",
  // Transport
  coronus_c: "transport",
  // Armour
  caladius_c: "heavy",
  // Lord of War
  telemon_c: "lord_of_war", orion_c: "lord_of_war", ares_c: "lord_of_war",
};

// Equipment available to Troops and Elites
// ── Legion-specific wargear options per faction ──
// Returns additional wargear options for a unit based on army faction
function getLegionWargearOptions(unitId, faction) {
  const isCmd    = ["praetor_pa","praetor_ta","praetor_sat","centurion"].includes(unitId);
  const isCmdChp = [...["praetor_pa","praetor_ta","praetor_sat","centurion"], "champion"].includes(unitId);
  const isCmdChpSgt = [...["praetor_pa","praetor_ta","praetor_sat","centurion","champion"], "herald"].includes(unitId);
  const map = {
    dark_angels: [
      ...(isCmdChpSgt ? [
        { label: "Calibanite Warblade (+5pts) [DA]", cost: 5, perModel: false, legion: true },
      ] : []),
      ...(isCmdChp ? [
        { label: "Terranic Greatsword (free) [DA]", cost: 0, perModel: false, legion: true },
        { label: "Plasma Burner - Sustained (free) [DA]", cost: 0, perModel: false, legion: true },
        { label: "Plasma Burner - Maximal (free) [DA]", cost: 0, perModel: false, legion: true },
        { label: "Plasma Incinerator - Sustained (free) [DA]", cost: 0, perModel: false, legion: true },
        { label: "Plasma Incinerator - Maximal (free) [DA]", cost: 0, perModel: false, legion: true },
      ] : []),
    ],
    white_scars: [
      ...(isCmd ? [
        { label: "Power Glaive (+10pts) [WS]", cost: 10, perModel: false, legion: true },
      ] : []),
    ],
    space_wolves: [
      ...(["praetor_pa","praetor_ta","centurion","champion","herald","veteran","assault","tactical"].includes(unitId) ? [
        { label: "Fenrisian Axe (+2pts) [SW]", cost: 2, perModel: false, legion: true },
      ] : []),
      ...(isCmdChp ? [
        { label: "Frost Sword (+5pts) [SW]", cost: 5, perModel: false, legion: true },
        { label: "Frost Axe (+5pts) [SW]", cost: 5, perModel: false, legion: true },
        { label: "Frost Claw (+5pts) [SW]", cost: 5, perModel: false, legion: true },
        { label: "Great Frost Blade (+10pts) [SW]", cost: 10, perModel: false, legion: true },
      ] : []),
    ],
    imperial_fists: [
      ...(isCmdChpSgt ? [
        { label: "Solarite Power Gauntlet (+5pts) [IF]", cost: 5, perModel: false, legion: true },
      ] : []),
    ],
    blood_angels: [
      ...(isCmdChpSgt ? [
        { label: "Blade of Perdition (+5pts) [BA]", cost: 5, perModel: false, legion: true },
        { label: "Axe of Perdition (+5pts) [BA]", cost: 5, perModel: false, legion: true },
        { label: "Maul of Perdition (+5pts) [BA]", cost: 5, perModel: false, legion: true },
        { label: "Spear of Perdition (+5pts) [BA]", cost: 5, perModel: false, legion: true },
        { label: "Inferno Pistol (+5pts) [BA]", cost: 5, perModel: false, legion: true },
      ] : []),
      ...(["assault"].includes(unitId) ? [
        { label: "Inferno Pistol (+5pts/mdl) [BA]", cost: 5, perModel: true, legion: true },
      ] : []),
    ],
    ultramarines: [
      ...(isCmdChpSgt ? [
        { label: "Legatine Axe (+5pts) [UM]", cost: 5, perModel: false, legion: true },
      ] : []),
    ],
    raven_guard: [
      ...(isCmdChp ? [
        { label: "Raven's Talon (free) [RG]", cost: 0, perModel: false, legion: true },
        { label: "Pair of Raven's Talons (free) [RG]", cost: 0, perModel: false, legion: true },
      ] : []),
    ],
    emperors_children: [
      ...(isCmdChpSgt ? [
        { label: "Phoenix Power Spear (+10pts) [EC]", cost: 10, perModel: false, legion: true },
        { label: "Sonic Lance (+10pts) [EC]", cost: 10, perModel: false, legion: true },
      ] : []),
    ],
    iron_warriors: [
      ...(isCmdChp ? [
        { label: "Graviton Crusher (free) [IW]", cost: 0, perModel: false, legion: true },
      ] : []),
    ],
    night_lords: [
      ...(isCmdChpSgt ? [
        { label: "Chainglaive (+5pts) [NL]", cost: 5, perModel: false, legion: true },
      ] : []),
      ...(isCmd ? [
        { label: "Headsman's Axe (+10pts) [NL]", cost: 10, perModel: false, legion: true },
      ] : []),
    ],
    world_eaters: [
      ...(isCmdChpSgt ? [
        { label: "Meteor Hammer (+5pts) [WE]", cost: 5, perModel: false, legion: true },
        { label: "Excoriator Chainaxe (free) [WE]", cost: 0, perModel: false, legion: true },
        { label: "Paired Falax Blades (free) [WE]", cost: 0, perModel: false, legion: true },
        { label: "Barb-Hook Lash (free) [WE]", cost: 0, perModel: false, legion: true },
      ] : []),
    ],
    death_guard: [
      ...(isCmdChpSgt ? [
        { label: "Power Scythe (+10pts) [DG]", cost: 10, perModel: false, legion: true },
      ] : []),
    ],
    thousand_sons: [
      ...(isCmdChp ? [
        { label: "Achea Pattern Force Sword (+5pts) [TS]", cost: 5, perModel: false, legion: true },
      ] : []),
    ],
    sons_of_horus: [
      ...(isCmdChpSgt ? [
        { label: "Carsoran Power Axe (+5pts) [SoH]", cost: 5, perModel: false, legion: true },
        { label: "Carsoran Power Tabar (+10pts) [SoH]", cost: 10, perModel: false, legion: true },
        { label: "Banestrike Bolter (+5pts) [SoH]", cost: 5, perModel: false, legion: true },
        { label: "Banestrike Combi-Bolter (+5pts) [SoH]", cost: 5, perModel: false, legion: true },
      ] : []),
      ...(["veteran","assault"].includes(unitId) ? [
        { label: "Carsoran Power Axe (+5pts/mdl) [SoH]", cost: 5, perModel: true, legion: true },
        { label: "Carsoran Power Tabar (+10pts/mdl) [SoH]", cost: 10, perModel: true, legion: true },
        { label: "Banestrike Bolter (+5pts/mdl) [SoH]", cost: 5, perModel: true, legion: true },
      ] : []),
      ...(unitId === "seeker" ? [
        { label: "Banestrike Bolter (free) [SoH]", cost: 0, perModel: true, legion: true },
      ] : []),
      ...(unitId === "predator" ? [
        { label: "Decurion Lanius — Banestrike Bolt Cannon (+25pts) [SoH]", cost: 25, perModel: false, legion: true },
      ] : []),
      ...(unitId === "kratos" ? [
        { label: "Decurion Lanius — Banestrike Bolt Cannon (+30pts) [SoH]", cost: 30, perModel: false, legion: true },
      ] : []),
      ...(unitId === "sicaran" ? [
        { label: "Decurion Lanius — Banestrike Bolt Cannon (+25pts, twin autocannon/punisher only) [SoH]", cost: 25, perModel: false, legion: true },
      ] : []),
    ],
    alpha_legion: [
      ...(isCmdChpSgt ? [
        { label: "Power Dagger (free) [AL]", cost: 0, perModel: false, legion: true },
        { label: "Venom Spheres (+5pts) [AL]", cost: 5, perModel: false, legion: true },
      ] : []),
    ],
    iron_hands: [
      ...(isCmdChp ? [
        { label: "Artificer Power Axe (free) [IH]", cost: 0, perModel: false, legion: true },
        { label: "Graviton Pistol (+5pts) [IH]", cost: 5, perModel: false, legion: true },
      ] : []),
    ],
    salamanders: [
      ...(isCmdChpSgt ? [
        { label: "Forge-crafted Power Sword (+5pts) [SAL]", cost: 5, perModel: false, legion: true },
        { label: "Forge-crafted Power Axe (+5pts) [SAL]", cost: 5, perModel: false, legion: true },
        { label: "Forge-crafted Power Maul (+5pts) [SAL]", cost: 5, perModel: false, legion: true },
        { label: "Forge-crafted Power Lance (+5pts) [SAL]", cost: 5, perModel: false, legion: true },
        { label: "Forge-crafted Power Fist (+10pts) [SAL]", cost: 10, perModel: false, legion: true },
        { label: "Forge-crafted Thunder Hammer (+10pts) [SAL]", cost: 10, perModel: false, legion: true },
        { label: "Forge-crafted Hand Flamer (+5pts) [SAL]", cost: 5, perModel: false, legion: true },
        { label: "Forge-crafted Flamer (+10pts) [SAL]", cost: 10, perModel: false, legion: true },
        { label: "Forge-crafted Heavy Flamer (+10pts) [SAL]", cost: 10, perModel: false, legion: true },
      ] : []),
    ],
  };
  return (map[faction] || []);
}

// Combined wargear options: base unit options + legion-specific options
function getWargearOptions(unitId, faction) {
  const base = UNIT_WARGEAR_OPTIONS[unitId] || [];
  const legion = faction && faction !== "legiones_astartes" ? getLegionWargearOptions(unitId, faction) : [];
  return [...base, ...legion];
}

var EQUIPMENT_OPTIONS = {
  vexilla:      { label: "Vexilla",        cost: 10, perModel: false, desc: "Re-roll failed Morale checks (Shooting & Assault)", icon: "⚑" },
  noxVox:       { label: "Nox-Vox",        cost: 10, perModel: false, desc: "+1 Ld to Leadership & Cooldown checks", icon: "📡" },
  metaBomb:     { label: "Melta Bombs",    cost: 25, perModel: false, desc: "S8 AP1 Armourbane in assault vs vehicles", icon: "💣" },
  bayonet:      { label: "Bayonets",       cost: 1,  perModel: true,  desc: "Bayonet melee weapon (+1 pt/model)", icon: "🔪" },
  chainBayonet: { label: "Chain Bayonets", cost: 2,  perModel: true,  desc: "Chain Bayonet — AP5 melee weapon (+2 pts/model)", icon: "⛓" },
};

// Which units can take which equipment
var UNIT_EQUIPMENT_ACCESS = {
  // Bayonets & Chain Bayonets — units with bolters that can mount bayonets
  bayonet:      ["tactical", "veteran", "breacher", "heavy_support", "tactical_support", "seeker", "recon"],
  chainBayonet: ["tactical", "veteran", "breacher", "heavy_support", "tactical_support", "seeker", "recon", "destroyer"],
  // Standard equipment — all Troops and Elites
  vexilla:  null, // null = use FOC check (troops/elites)
  noxVox:   null,
  metaBomb: null,
};

function canTakeEquipment(unitId, equipKey) {
  if (!equipKey) {
    // Legacy check: can this unit take any equipment at all?
    const slot = UNIT_FOC_SLOT[unitId];
    return slot === "troops" || slot === "elites";
  }
  const access = UNIT_EQUIPMENT_ACCESS[equipKey];
  if (access === null || access === undefined) {
    // Default: troops and elites
    const slot = UNIT_FOC_SLOT[unitId];
    return slot === "troops" || slot === "elites";
  }
  return access.includes(unitId);
}

