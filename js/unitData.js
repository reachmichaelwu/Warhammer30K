(function() {
window.HH = window.HH || {};

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
        { label: "Inferno Pistol (+5pts) [BA]", cost: 5, perModel: true, legion: true },
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

const EQUIPMENT_OPTIONS = {
  vexilla:      { label: "Vexilla",        cost: 10, perModel: false, desc: "Re-roll failed Morale checks (Shooting & Assault)", icon: "⚑" },
  noxVox:       { label: "Nox-Vox",        cost: 10, perModel: false, desc: "+1 Ld to Leadership & Cooldown checks", icon: "📡" },
  metaBomb:     { label: "Melta Bombs",    cost: 25, perModel: false, desc: "S8 AP1 Armourbane in assault vs vehicles", icon: "💣" },
  bayonet:      { label: "Bayonets",       cost: 1,  perModel: true,  desc: "Bayonet melee weapon (+1 pt/model)", icon: "🔪" },
  chainBayonet: { label: "Chain Bayonets", cost: 2,  perModel: true,  desc: "Chain Bayonet — AP5 melee weapon (+2 pts/model)", icon: "⛓" },
};

// Which units can take which equipment
const UNIT_EQUIPMENT_ACCESS = {
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

// ━━━ POINTS COSTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// base: starting cost (includes minimum models per PDF)
// perModel: cost per additional model beyond minimum
// minModels: minimum unit size included in base cost
// weapons: upgrade costs by weapon name (above free/default gear)

const POINTS_DATA = {
  // ── WARLORD (Primarchs) ──
  lion:             { base: 460, perModel: 0,  minModels: 1  },
  khan:             { base: 425, perModel: 0,  minModels: 1  },
  russ:             { base: 440, perModel: 0,  minModels: 1  },
  dorn:             { base: 430, perModel: 0,  minModels: 1  },
  sanguinius:       { base: 450, perModel: 0,  minModels: 1  },
  ferrus:           { base: 435, perModel: 0,  minModels: 1  },
  guilliman:        { base: 445, perModel: 0,  minModels: 1  },
  vulkan:           { base: 450, perModel: 0,  minModels: 1  },
  corax:            { base: 440, perModel: 0,  minModels: 1  },
  fulgrim:          { base: 425, perModel: 0,  minModels: 1  },
  perturabo:        { base: 425, perModel: 0,  minModels: 1  },
  curze:            { base: 450, perModel: 0,  minModels: 1  },
  angron:           { base: 440, perModel: 0,  minModels: 1  },
  lorgar:           { base: 415, perModel: 0,  minModels: 1  },
  mortarion:        { base: 425, perModel: 0,  minModels: 1  },
  magnus:           { base: 445, perModel: 0,  minModels: 1  },
  horus:            { base: 455, perModel: 0,  minModels: 1  },
  alpharius:        { base: 465, perModel: 0,  minModels: 1  },
  // ── HIGH COMMAND ──
  praetor_pa:       { base: 120, perModel: 0,  minModels: 1  },
  praetor_ta:       { base: 145, perModel: 0,  minModels: 1  },
  praetor_sat:      { base: 200, perModel: 0,  minModels: 1  },
  // ── COMMAND ──
  centurion:        { base: 80,  perModel: 0,  minModels: 1  },
  centurion_ta:     { base: 100, perModel: 0,  minModels: 1  },
  optae:            { base: 50,  perModel: 0,  minModels: 1  },
  champion:         { base: 105, perModel: 0,  minModels: 1  },
  master_signals:   { base: 115, perModel: 0,  minModels: 1  },
  vigilator:        { base: 95,  perModel: 0,  minModels: 1  },
  forge_lord:       { base: 95,  perModel: 0,  minModels: 1  },
  chaplain:         { base: 80,  perModel: 0,  minModels: 1  },
  librarian:        { base: 85,  perModel: 0,  minModels: 1  },
  herald:           { base: 100, perModel: 0,  minModels: 1  },
  moritat:          { base: 95,  perModel: 0,  minModels: 1  },
  siege_breaker:    { base: 115, perModel: 0,  minModels: 1  },
  esoterist:        { base: 95,  perModel: 0,  minModels: 1  },
  praevian:         { base: 95,  perModel: 0,  minModels: 1  },
  overseer:         { base: 85,  perModel: 0,  minModels: 1  },
  damocles_rhino:   { base: 120, perModel: 0,  minModels: 1  },
  // ── TROOPS ──
  tactical:         { base: 100, perModel: 10, minModels: 10 },
  despoiler:        { base: 100, perModel: 10, minModels: 10 },
  breacher:         { base: 140, perModel: 12, minModels: 10 },
  assault:          { base: 140, perModel: 12, minModels: 10 },
  tactical_support: { base: 40,  perModel: 8,  minModels: 5  },
  // ── HEAVY ASSAULT ──
  cataphractii:     { base: 150, perModel: 30, minModels: 5  },
  tartaros:         { base: 150, perModel: 30, minModels: 5  },
  saturnine:        { base: 200, perModel: 60, minModels: 3  },
  // ── SUPPORT ──
  heavy_support:    { base: 50,  perModel: 10, minModels: 5  },
  rapier_la:        { base: 40,  perModel: 40, minModels: 1  },
  apothecary:       { base: 30,  perModel: 0,  minModels: 1  },
  techmarine:       { base: 50,  perModel: 0,  minModels: 1  },
  araknae:          { base: 125, perModel: 0,  minModels: 1  },
  // ── WAR ENGINE ──
  contemptor:       { base: 150, perModel: 0,  minModels: 1  },
  leviathan:        { base: 220, perModel: 0,  minModels: 1  },
  deredeo:          { base: 190, perModel: 0,  minModels: 1  },
  saturnine_dread:  { base: 340, perModel: 0,  minModels: 1  },
  // ── TRANSPORT ──
  rhino:            { base: 60,  perModel: 0,  minModels: 1  },
  termite:          { base: 80,  perModel: 0,  minModels: 1  },
  drop_pod:         { base: 50,  perModel: 0,  minModels: 1  },
  // ── HEAVY TRANSPORT ──
  land_raider:      { base: 265, perModel: 0,  minModels: 1  },
  spartan:          { base: 400, perModel: 0,  minModels: 1  },
  dreadnought_drop_pod: { base: 100, perModel: 0, minModels: 1 },
  dreadclaw:        { base: 115, perModel: 0,  minModels: 1  },
  kharybdis:        { base: 235, perModel: 0,  minModels: 1  },
  // ── ARMOUR ──
  predator:         { base: 100, perModel: 0,  minModels: 1  },
  sicaran:          { base: 160, perModel: 0,  minModels: 1  },
  sicaran_venator:  { base: 170, perModel: 0,  minModels: 1  },
  vindicator:       { base: 140, perModel: 0,  minModels: 1  },
  kratos:           { base: 280, perModel: 0,  minModels: 1  },
  scorpius:         { base: 120, perModel: 0,  minModels: 1  },
  arquitor:         { base: 150, perModel: 0,  minModels: 1  },
  // ── RECON ──
  recon:            { base: 110, perModel: 17, minModels: 5  },
  seeker:           { base: 105, perModel: 18, minModels: 5  },
  sabre:            { base: 80,  perModel: 0,  minModels: 1  },
  outrider:         { base: 85,  perModel: 20, minModels: 3  },
  land_raider_exp:  { base: 220, perModel: 0,  minModels: 1  },
  tarantula:        { base: 45,  perModel: 0,  minModels: 2  },
  // ── FAST ATTACK ──
  xiphon:           { base: 120, perModel: 0,  minModels: 1  },
  storm_eagle:      { base: 200, perModel: 0,  minModels: 1  },
  fire_raptor:      { base: 220, perModel: 0,  minModels: 1  },
  scimitar_jetbike: { base: 95,  perModel: 30, minModels: 3  },
  javelin:          { base: 75,  perModel: 75, minModels: 1  },
  land_speeder:     { base: 50,  perModel: 50, minModels: 1  },
  // ── LORD OF WAR ──
  cerberus:         { base: 400, perModel: 0,  minModels: 1  },
  typhon:           { base: 400, perModel: 0,  minModels: 1  },
  glaive:           { base: 650, perModel: 0,  minModels: 1  },
  fellblade:        { base: 650, perModel: 0,  minModels: 1  },
  falchion:         { base: 650, perModel: 0,  minModels: 1  },
  thunderhawk:      { base: 685, perModel: 0,  minModels: 1  },
  // ── RETINUE (Command Squads) ──
  praetorian_cmd_jp: { base: 160, perModel: 25, minModels: 5  },
  praetorian_cmd:    { base: 130, perModel: 20, minModels: 5  },
  tartaros_cmd:      { base: 140, perModel: 40, minModels: 3  },
  centurion_cmd:     { base: 85,  perModel: 15, minModels: 5  },
  cataphractii_cmd:  { base: 140, perModel: 40, minModels: 3  },
  // ── RETINUE (Veterans/Command Squads) ──
  veteran:          { base: 85,  perModel: 15, minModels: 5  },
  veteran_assault:  { base: 120, perModel: 22, minModels: 5  },
  // ── OTHERS ──
  destroyer:        { base: 110, perModel: 20, minModels: 5  },
  daemon_lesser:    { base: 80,  perModel: 8,  minModels: 10 },
  daemon_greater:   { base: 200, perModel: 0,  minModels: 1  },
  // ── SOLAR AUXILIA ──
  lasrifle:         { base: 60,  perModel: 3,  minModels: 20 },
  veletaris:        { base: 80,  perModel: 7,  minModels: 10 },
  rapier:           { base: 40,  perModel: 40, minModels: 1  },
  ogryn:            { base: 100, perModel: 20, minModels: 5  },
  // ── MECHANICUM ──
  thallax:          { base: 100, perModel: 30, minModels: 3  },
  myrmidon_dest:    { base: 130, perModel: 40, minModels: 3  },
  castellax:        { base: 75,  perModel: 0,  minModels: 1  },
  thanatar:         { base: 200, perModel: 0,  minModels: 1  },
  vorax:            { base: 65,  perModel: 0,  minModels: 1  },
  tech_thrall:      { base: 40,  perModel: 2,  minModels: 20 },
  // ── CUSTODES ──
  custodian_guard:  { base: 130, perModel: 40, minModels: 3  },
  sagittarum:       { base: 140, perModel: 45, minModels: 3  },
  caladius:         { base: 220, perModel: 0,  minModels: 1  },
  aquilon:          { base: 165, perModel: 50, minModels: 3  },
  // ── DARK ANGELS (I) ──
  corswain:         { base: 200, perModel: 0,  minModels: 1  },
  marduk_sedras:    { base: 185, perModel: 0,  minModels: 1  },
  deathwing_comp:   { base: 175, perModel: 35, minModels: 5  },
  dreadwing_inter:  { base: 100, perModel: 12, minModels: 5  },
  inner_circle_knight: { base: 150, perModel: 30, minModels: 5 },
  // ── EMPEROR'S CHILDREN (III) ──
  eidolon:          { base: 210, perModel: 0,  minModels: 1  },
  lucius:           { base: 165, perModel: 0,  minModels: 1  },
  saul_tarvitz:     { base: 155, perModel: 0,  minModels: 1  },
  phoenix_term:     { base: 275, perModel: 45, minModels: 5  },
  palatine_blade:   { base: 140, perModel: 25, minModels: 5  },
  kakophoni:        { base: 135, perModel: 22, minModels: 5  },
  // ── IRON WARRIORS (IV) ──
  warsmith:         { base: 185, perModel: 0,  minModels: 1  },
  tyrant_siege_term:{ base: 300, perModel: 50, minModels: 5  },
  domitar_ferrum:   { base: 175, perModel: 0,  minModels: 1  },
  // ── WHITE SCARS (V) ──
  qin_xa:           { base: 200, perModel: 0,  minModels: 1  },
  hibou_khan:       { base: 160, perModel: 0,  minModels: 1  },
  stormseer:        { base: 130, perModel: 0,  minModels: 1  },
  keshig_rider:     { base: 160, perModel: 30, minModels: 5  },
  kharash:          { base: 175, perModel: 35, minModels: 5  },
  kyzagan:          { base: 100, perModel: 0,  minModels: 1  },
  // ── SPACE WOLVES (VI) ──
  hvarl:            { base: 195, perModel: 0,  minModels: 1  },
  geigor:           { base: 145, perModel: 0,  minModels: 1  },
  caster_of_runes:  { base: 130, perModel: 0,  minModels: 1  },
  varagyr:          { base: 200, perModel: 40, minModels: 5  },
  deathsworn:       { base: 155, perModel: 30, minModels: 5  },
  grey_slayer:      { base: 100, perModel: 10, minModels: 10 },
  // ── IMPERIAL FISTS (VII) ──
  sigismund:        { base: 250, perModel: 0,  minModels: 1  },
  fafnir_rann:      { base: 180, perModel: 0,  minModels: 1  },
  evander_garrius:  { base: 185, perModel: 0,  minModels: 1  },
  camba_diaz:       { base: 155, perModel: 0,  minModels: 1  },
  alexis_polux:     { base: 140, perModel: 0,  minModels: 1  },
  templar_brethren: { base: 160, perModel: 25, minModels: 5  },
  phalanx_warder:   { base: 200, perModel: 12, minModels: 10 },
  // ── NIGHT LORDS (VIII) ──
  sevatar:          { base: 220, perModel: 0,  minModels: 1  },
  contekar:         { base: 185, perModel: 35, minModels: 5  },
  executioner_nl:   { base: 100, perModel: 10, minModels: 10 },
  night_raptor:     { base: 175, perModel: 25, minModels: 5  },
  // ── BLOOD ANGELS (IX) ──
  raldoron:         { base: 205, perModel: 0,  minModels: 1  },
  dom_zephon:       { base: 190, perModel: 0,  minModels: 1  },
  aster_crohne:     { base: 140, perModel: 0,  minModels: 1  },
  crimson_paladin:  { base: 175, perModel: 35, minModels: 5  },
  dawnbreaker:      { base: 160, perModel: 30, minModels: 5  },
  erelim:           { base: 100, perModel: 10, minModels: 10 },
  contemp_incaendius: { base: 195, perModel: 0, minModels: 1 },
  // ── IRON HANDS (X) ──
  shadrak_meduson:  { base: 190, perModel: 0,  minModels: 1  },
  iron_father:      { base: 195, perModel: 0,  minModels: 1  },
  gorgon_term:      { base: 185, perModel: 35, minModels: 5  },
  immortal_ih:      { base: 100, perModel: 10, minModels: 10 },
  // ── WORLD EATERS (XII) ──
  kharn:            { base: 175, perModel: 0,  minModels: 1  },
  lotara_sarrin:    { base: 100, perModel: 0,  minModels: 1  },
  red_butcher:      { base: 250, perModel: 45, minModels: 5  },
  rampager:         { base: 155, perModel: 25, minModels: 5  },
  // ── ULTRAMARINES (XIII) ──
  remus_ventanus:   { base: 175, perModel: 0,  minModels: 1  },
  invictarus_suz:   { base: 175, perModel: 35, minModels: 5  },
  praetorian_um:    { base: 200, perModel: 12, minModels: 10 },
  // ── DEATH GUARD (XIV) ──
  calas_typhon:     { base: 195, perModel: 0,  minModels: 1  },
  deathshroud:      { base: 100, perModel: 45, minModels: 2  },
  grave_warden:     { base: 225, perModel: 45, minModels: 5  },
  // ── THOUSAND SONS (XV) ──
  ahriman:          { base: 210, perModel: 0,  minModels: 1  },
  magistus_amon:    { base: 170, perModel: 0,  minModels: 1  },
  prosperine_sorc:  { base: 130, perModel: 0,  minModels: 1  },
  sekhmet:          { base: 175, perModel: 35, minModels: 5  },
  khenetai_blade:   { base: 145, perModel: 28, minModels: 5  },
  castellax_achea:  { base: 125, perModel: 0,  minModels: 1  },
  contemp_osiron:   { base: 175, perModel: 0,  minModels: 1  },
  // ── SONS OF HORUS (XVI) ──
  ezekyle_abaddon:  { base: 215, perModel: 0,  minModels: 1  },
  little_horus:     { base: 185, perModel: 0,  minModels: 1  },
  tybalt_marr:      { base: 155, perModel: 0,  minModels: 1  },
  vheren_ash:       { base: 160, perModel: 0,  minModels: 1  },
  garviel_loken:    { base: 155, perModel: 0,  minModels: 1  },
  maloghurst:       { base: 145, perModel: 0,  minModels: 1  },
  dark_emissary:    { base: 150, perModel: 0,  minModels: 1  },
  justaerin:        { base: 200, perModel: 40, minModels: 5  },
  reaver_soh:       { base: 150, perModel: 25, minModels: 5  },
  // ── WORD BEARERS (XVII) ──
  kor_phaeron:      { base: 145, perModel: 0,  minModels: 1  },
  erebus:           { base: 155, perModel: 0,  minModels: 1  },
  argel_tal:        { base: 175, perModel: 0,  minModels: 1  },
  zardu_layak:      { base: 170, perModel: 0,  minModels: 1  },
  dark_brethren:    { base: 175, perModel: 35, minModels: 5  },
  anakatis_kul:     { base: 150, perModel: 30, minModels: 5  },
  mhara_gal:        { base: 195, perModel: 0,  minModels: 1  },
  incendiary_wb:    { base: 100, perModel: 10, minModels: 10 },
  // ── SALAMANDERS (XVIII) ──
  firedrake:        { base: 185, perModel: 37, minModels: 5  },
  pyroclast:        { base: 120, perModel: 22, minModels: 5  },
  // ── RAVEN GUARD (XIX) ──
  kaedes_nex:       { base: 130, perModel: 0,  minModels: 1  },
  mor_deythan:      { base: 130, perModel: 22, minModels: 5  },
  dark_fury_rg:     { base: 175, perModel: 30, minModels: 5  },
  // ── ALPHA LEGION (XX) ──
  armillus_dynat:   { base: 195, perModel: 0,  minModels: 1  },
  saboteur:         { base: 140, perModel: 0,  minModels: 1  },
  exodus_al:        { base: 145, perModel: 0,  minModels: 1  },
  headhunter:       { base: 110, perModel: 18, minModels: 5  },
  lernaean:         { base: 225, perModel: 40, minModels: 5  },
};

// Weapon upgrade costs (above free/default wargear) — from Legion Wargear PDF
const WEAPON_UPGRADE_COSTS = {
  // Legion Special Weapons (per model)
  "Flamer": 5, "Plasma Gun (Sustained)": 10, "Plasma Gun (Maximal)": 10,
  "Melta Gun": 15, "Volkite Charger": 5, "Volkite Caliver": 10, "Rotor Cannon": 10,
  // Legion Heavy Weapons (per model)
  "Heavy Bolter": 10, "Heavy Flamer": 10, "Autocannon": 20,
  "Missile Launcher": 15, "Missile L. (Krak)": 15, "Missile L. (Frag)": 15,
  "Multi-Melta": 25, "Plasma Cannon (Sustained)": 20, "Plasma Cannon (Maximal)": 20,
  "Volkite Culverin": 15, "Lascannon": 25,
  // Legion Combi-weapons (per model)
  "Combi-Bolter": 0, "Combi-Flamer": 10, "Combi-Melta": 10,
  "Combi-Plasma (Sustained)": 10, "Combi-Plasma (Maximal)": 10,
  "Combi-Volkite": 10, "Combi-Disintegrator": 10,
  "Combi-Grenade L. (Frag)": 10, "Combi-Grenade L. (Krak)": 10,
  "Combi-Grav": 10,
  // Legion Pistols
  "Plasma Pistol (Sustained)": 5, "Plasma Pistol (Maximal)": 5,
  "Volkite Serpenta": 5, "Disintegrator Pistol": 5,
  "Archaeotech Pistol": 10, "Hand Flamer": 5,
  // Terminator weapons
  "Reaper Autocannon": 15, "Plasma Blaster (Sustained)": 10, "Plasma Blaster (Maximal)": 10,
  "Heavy Disintegrator": 10, "Twin Heavy Disintegrator": 10,
  "Plasma Bombard (Sustained)": 0, "Plasma Bombard (Maximal)": 0,
  // Disintegrator weapons (Veteran/Seeker specials)
  "Disintegrator Rifle": 5, "Disintegrator Blaster": 10,
  // Veteran alternate weapons
  "Astartes Shotgun (Solid)": 2, "Astartes Shotgun (Scatter)": 2,
  // Breacher specials
  "Graviton Gun": 10, "Lascutter": 10,
  // Vehicle sponson weapons
  "Heavy Bolter Sponsons": 0, "Lascannon Sponsons": 20,
  // Sergeant melee upgrades (from Legion Sergeant Melee Weapons list)
  "Chainsword": 0, "Chainaxe": 0, "Charnabal Sabre": 5,
  "Power Weapon": 10, "Power Fist": 15, "Thunder Hammer": 15, "Lightning Claw": 10,
  // Officer Wargear / Paragon
  "Paragon Blade": 15, "Archaeotech Pistol": 10,
  // Terminator Melee Weapons
  "Chainfist": 5, "Pair Lightning Claws": 5,
  // Saturnine-specific
  "Saturnine Concussion Hammer": 10, "Plasma Blaster": 10,
  "Saturnine Teleportation Transponder": 60,
  "Twin Heavy Disintegrator": 10,
  // Psychic Disciplines
  "Biomancy": 20, "Pyromancy": 10, "Telekinesis": 20, "Divination": 20, "Thaumaturgy": 0, "Telepathy": 10,
  // Moritat
  "Overcharged Plasma Pistols (pair)": 10,
  // Herald
  "Herald Power Fist": 10,
  // Misc
  "Melta Bombs": 5, "Cyber-Familiar": 10, "Searchlights": 5, "Dozer Blade": 5,
  "Hunter-Killer Missile": 5, "Augury Scanner": 10,
  "Combat Shield": 2, "Vexilla": 10,
  // Rapier upgrades
  "Laser Destroyer": 25, "Graviton Cannon": 20, "Quad Launcher": 20,
  // Dreadnought arms
  "Gravis Power Fist + Combi-Bolter": 5, "Gravis Chainfist + Combi-Bolter": 5,
  "Gravis Bolt Cannon": 0, "Gravis Melta Cannon": 15, "Gravis Autocannon": 10,
  "Gravis Plasma Cannon": 15, "Gravis Volkite Culverin": 5,
  // Leviathan arms
  "Leviathan Siege Claw + Meltagun": 0, "Leviathan Siege Drill + Meltagun": 5,
  "Grav-Flux Bombard": 10, "Leviathan Storm Cannon": 15, "Cyclonic Melta Lance": 20,
  // Deredeo upgrades
  "Hellfire Plasma Cannonade": 15, "Arachnus Heavy Lascannon Battery": 25, "Volkite Falconet": 0,
  // Saturnine Dread
  "Saturnine Dread Disintegrator Cannon": 10, "Inversion Beamer": 10, "Graviton Pulveriser": 10,
  // Predator turrets
  "Flamestorm Cannon": 0, "Executioner Plasma Destroyer": 25,
  "Heavy Conversion Beam Cannon": 30, "Magna-Melta Cannon": 20, "Graviton Cannon (Turret)": 20,
  // Sicaran turrets
  "Arcus Missile Launcher": 40, "Punisher Rotary Cannon": 10, "Omega Plasma Array": 25,
  // Kratos turrets
  "Flashburn Shells": 10, "Volkite Cardanelle": 0, "Melta Blast-Gun": 30,
  // Vindicator
  "Magna Laser Destroyer": 20,
  // Vehicle sponsons
  "Heavy Bolter Sponsons": 0, "Lascannon Sponsons": 20,
  "Volkite Culverin Sponsons": 10, "Heavy Flamer Sponsons": 5,
  // Sabre
  "Neutron Blaster": 10, "Volkite Saker": 0,
  // Land Speeder
  "Havoc Launcher": 5,
  // Javelin
  "Two Lascannon": 5, "Two Volkite Culverin": 5,
  // Tarantula
  "Twin Lascannon (Tarantula)": 20, "Twin Volkite Culverin (Tarantula)": 15,
  "Sentry Melta Array": 25, "Hyperios Missile Launcher": 15,
  // Storm Eagle
  "Twin Multi-Melta": 15, "Cyclone Missile Launcher": 10,
  // Fire Raptor
  "Gravis Autocannon Batteries": 15, "Hellstrike Missiles": 20,
  // Land Raider
  "Hull Twin Heavy Flamer": 0, "Hull Twin Lascannon": 10,
  // Spartan
  "Laser Destroyers (Sponson pair)": 0, "Gravis Heavy Bolter Battery (Sponson pair)": 0,
  // Drop Pod
  "Twin Volkite Chargers (Pintle pair)": 10, "Heavy Flamers (Pintle pair)": 5,
  // Default/free weapons (no extra cost)
  "Bolter": 0, "Bolt Pistol": 0, "Volkite Charger (Cataphractii)": 0,
  "Combi-Bolter (Tartaros)": 0, "Volkite Charger (default)": 0,
  // Additional costs
  "Nemesis Bolter": 5, "Astartes Shotgun": 2,
  "Twin Bolter": 0, "Twin Plasma Gun (Sustained)": 15, "Twin Plasma Gun (Maximal)": 15,
  "Kraken Bolter": 0,
  "Combi-Bolter": 5, "Combi-Flamer": 10, "Combi-Plasma": 10,
  "Combi-Melta": 10, "Combi-Volkite": 10, "Combi-Grenade": 10,
  "Combi-Disintegrator": 10, "Combi-Grav": 10,
  "Bayonet": 1, "Chain Bayonet": 2,
  "Particle Shredder": 5,
  "Grenade Harness": 5,
  "Legion Standard": 20, "Company Standard": 20,
  "Boarding Shield": 5,
  // Saturnine Dread photonic/concussive swaps
  "Concussive Resonator": 10, "Heavy Particle Shredder": 10,
  // Phosphex
  "Phosphex Discharger": 20,
  // ── Legion-specific weapons (Liber Loyalist / Hereticus) ──
  "Calibanite Warblade": 5, "Terranic Greatsword": 0,
  "Power Glaive": 10,
  "Fenrisian Axe": 2, "Frost Sword": 5, "Frost Axe": 5, "Frost Claw": 5, "Great Frost Blade": 10,
  "Solarite Power Gauntlet": 5,
  "Blade of Perdition": 5, "Axe of Perdition": 5, "Maul of Perdition": 5, "Spear of Perdition": 5,
  "Inferno Pistol": 5,
  "Legatine Axe": 5,
  "Raven's Talon": 0, "Pair of Raven's Talons": 0,
  "Phoenix Power Spear": 10,
  "Sonic Lance": 10,
  "Graviton Crusher": 0,
  "Chainglaive": 5, "Headsman's Axe": 10,
  "Meteor Hammer": 5, "Excoriator Chainaxe": 0, "Paired Falax Blades": 0, "Barb-Hook Lash": 0,
  "Power Scythe": 10,
  "Achea Pattern Force Sword": 5,
  "Carsoran Power Axe": 5, "Carsoran Power Tabar": 10,
  "Power Dagger": 0,
  "Banestrike Bolter": 5, "Banestrike Combi-Bolter": 5, "Banestrike Bolt Cannon": 0,
  "Venom Spheres": 5,
  "Artificer Power Axe": 0, "Graviton Pistol": 5,
  "Forge-crafted Power Sword": 5, "Forge-crafted Power Axe": 5,
  "Forge-crafted Power Maul": 5, "Forge-crafted Power Lance": 5,
  "Forge-crafted Power Fist": 10, "Forge-crafted Thunder Hammer": 10,
  "Forge-crafted Hand Flamer": 5, "Forge-crafted Flamer": 10, "Forge-crafted Heavy Flamer": 10,
  "Plasma Burner (Sustained)": 0, "Plasma Burner (Maximal)": 0,
  "Plasma Incinerator (Sustained)": 0, "Plasma Incinerator (Maximal)": 0,
};

// ━━━ LEGION-SPECIFIC SHOOTING WEAPON PROFILES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Added for Liber Astartes unit shooting weapons
const LEGION_WEAPON_PROFILES = {
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

// ━━━ UNIT WARGEAR OPTIONS (from Liber Astartes 3rd Edition PDF) ━━━━━━━━━━━━
// Each unit lists available upgrade options as checkboxes in the army builder.
// format: { label, cost, perModel(bool), exclusive(group name) }
const UNIT_WARGEAR_OPTIONS = {
  // ── HIGH COMMAND ──
  praetor_pa: [
    { label: "Jump Pack (+20pts)", cost: 20, perModel: false, exclusive: "variant" },
    { label: "Paragon Blade (+15pts)", cost: 15, perModel: false },
    { label: "Archaeotech Pistol (+15pts)", cost: 15, perModel: false },
    { label: "Pair Lightning Claws (+20pts)", cost: 20, perModel: false },
    // Officer Wargear (replace bolter/pistol)
    { label: "Power Weapon (+10pts)", cost: 10, perModel: false },
    { label: "Power Fist (+15pts)", cost: 15, perModel: false },
    { label: "Thunder Hammer (+15pts)", cost: 15, perModel: false },
    { label: "Lightning Claw (+10pts)", cost: 10, perModel: false },
    { label: "Charnabal Sabre (+5pts)", cost: 5, perModel: false },
    { label: "Volkite Serpenta (+5pts)", cost: 5, perModel: false },
    { label: "Plasma Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Disintegrator Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Hand Flamer (+5pts)", cost: 5, perModel: false },
    { label: "Combat Shield (free)", cost: 0, perModel: false },
    { label: "Boarding Shield (+5pts)", cost: 5, perModel: false },
    // Combi-weapons (replace bolter)
    { label: "Combi-Bolter (+5pts)", cost: 5, perModel: false },
    { label: "Combi-Flamer (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Melta (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Plasma (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Volkite (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Grenade (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Disintegrator (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Grav (+10pts)", cost: 10, perModel: false },
    { label: "Astartes Shotgun (+2pts)", cost: 2, perModel: false },
    { label: "Volkite Charger (+2pts)", cost: 2, perModel: false },
    // Other
    { label: "Melta Bombs (+5pts)", cost: 5, perModel: false },
    { label: "Bayonet (+1pt)", cost: 1, perModel: false },
    { label: "Chain Bayonet (+2pts)", cost: 2, perModel: false },
    { label: "Cyber-Familiar (+10pts)", cost: 10, perModel: false },
  ],
  praetor_ta: [
    { label: "Tartaros Armour (+10pts)", cost: 10, perModel: false, exclusive: "variant" },
    { label: "Paragon Blade (+15pts)", cost: 15, perModel: false },
    { label: "Pair Lightning Claws (+5pts)", cost: 5, perModel: false },
    // Terminator Melee (replace power weapon)
    { label: "Lightning Claw (+5pts)", cost: 5, perModel: false },
    { label: "Power Fist (+10pts)", cost: 10, perModel: false },
    { label: "Chainfist (+10pts)", cost: 10, perModel: false },
    { label: "Thunder Hammer (+10pts)", cost: 10, perModel: false },
    // Ranged (replace combi-bolter)
    { label: "Volkite Charger (free)", cost: 0, perModel: false },
    { label: "Combi-Flamer (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Melta (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Plasma (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Volkite (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Grenade (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Disintegrator (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Grav (+10pts)", cost: 10, perModel: false },
  ],
  praetor_sat: [
    { label: "Saturnine Concussion Hammer (+10pts)", cost: 10, perModel: false },
    { label: "Plasma Blaster (+10pts)", cost: 10, perModel: false },
    { label: "Saturnine Teleportation Transponder (+60pts)", cost: 60, perModel: false },
  ],
  // ── COMMAND ──
  centurion: [
    { label: "Jump Pack (+20pts)", cost: 20, perModel: false, exclusive: "variant" },
    // Officer Wargear (replace bolter/pistol)
    { label: "Power Weapon (+10pts)", cost: 10, perModel: false },
    { label: "Power Fist (+15pts)", cost: 15, perModel: false },
    { label: "Thunder Hammer (+15pts)", cost: 15, perModel: false },
    { label: "Lightning Claw (+10pts)", cost: 10, perModel: false },
    { label: "Charnabal Sabre (+5pts)", cost: 5, perModel: false },
    { label: "Volkite Serpenta (+5pts)", cost: 5, perModel: false },
    { label: "Plasma Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Disintegrator Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Hand Flamer (+5pts)", cost: 5, perModel: false },
    { label: "Combat Shield (free)", cost: 0, perModel: false },
    { label: "Boarding Shield (+5pts)", cost: 5, perModel: false },
    { label: "Pair Lightning Claws (+20pts)", cost: 20, perModel: false },
    // Combi-weapons
    { label: "Combi-Bolter (+5pts)", cost: 5, perModel: false },
    { label: "Combi-Flamer (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Melta (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Plasma (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Volkite (+10pts)", cost: 10, perModel: false },
    { label: "Astartes Shotgun (+2pts)", cost: 2, perModel: false },
    { label: "Volkite Charger (+2pts)", cost: 2, perModel: false },
    // Other
    { label: "Melta Bombs (+5pts)", cost: 5, perModel: false },
    { label: "Bayonet (+1pt)", cost: 1, perModel: false },
    { label: "Chain Bayonet (+2pts)", cost: 2, perModel: false },
    { label: "Vexilla (+10pts)", cost: 10, perModel: false },
    { label: "Cyber-Familiar (+10pts)", cost: 10, perModel: false },
  ],
  centurion_ta: [
    // Ranged (replace combi-bolter)
    { label: "Volkite Charger (free)", cost: 0, perModel: false },
    { label: "Combi-Flamer (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Melta (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Plasma (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Volkite (+10pts)", cost: 10, perModel: false },
    // Terminator Melee (replace power weapon)
    { label: "Pair Lightning Claws (+5pts)", cost: 5, perModel: false },
    { label: "Lightning Claw (+5pts)", cost: 5, perModel: false },
    { label: "Power Fist (+10pts)", cost: 10, perModel: false },
    { label: "Chainfist (+10pts)", cost: 10, perModel: false },
    { label: "Thunder Hammer (+10pts)", cost: 10, perModel: false },
  ],
  optae: [
    { label: "Jump Pack (+20pts)", cost: 20, perModel: false, exclusive: "variant" },
    // Sergeant Melee (replace bolter/pistol)
    { label: "Chainsword (free)", cost: 0, perModel: false },
    { label: "Chainaxe (free)", cost: 0, perModel: false },
    { label: "Charnabal Sabre (+5pts)", cost: 5, perModel: false },
    { label: "Power Weapon (+10pts)", cost: 10, perModel: false },
    { label: "Power Fist (+15pts)", cost: 15, perModel: false },
    { label: "Thunder Hammer (+15pts)", cost: 15, perModel: false },
    { label: "Lightning Claw (+10pts)", cost: 10, perModel: false },
    { label: "Pair Lightning Claws (+20pts)", cost: 20, perModel: false },
    // Pistols (replace bolt pistol)
    { label: "Disintegrator Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Plasma Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Hand Flamer (+5pts)", cost: 5, perModel: false },
    { label: "Volkite Serpenta (+5pts)", cost: 5, perModel: false },
    // Combi-weapons (replace bolter)
    { label: "Combi-Bolter (+5pts)", cost: 5, perModel: false },
    { label: "Combi-Melta (+10pts)", cost: 10, perModel: false },
    { label: "Combi-Plasma (+10pts)", cost: 10, perModel: false },
    { label: "Astartes Shotgun (+2pts)", cost: 2, perModel: false },
    { label: "Volkite Charger (+2pts)", cost: 2, perModel: false },
    // Other
    { label: "Melta Bombs (+5pts)", cost: 5, perModel: false },
    { label: "Bayonet (+1pt)", cost: 1, perModel: false },
    { label: "Chain Bayonet (+2pts)", cost: 2, perModel: false },
  ],
  librarian: [
    // Pistols (replace bolt pistol)
    { label: "Plasma Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Hand Flamer (+5pts)", cost: 5, perModel: false },
    { label: "Volkite Serpenta (+5pts)", cost: 5, perModel: false },
    // Psychic Disciplines
    { label: "Biomancy (+20pts)", cost: 20, perModel: false },
    { label: "Pyromancy (+10pts)", cost: 10, perModel: false },
    { label: "Telekinesis (+20pts)", cost: 20, perModel: false },
    { label: "Divination (+20pts)", cost: 20, perModel: false },
    { label: "Thaumaturgy (free)", cost: 0, perModel: false },
    { label: "Telepathy (+10pts)", cost: 10, perModel: false },
  ],
  vigilator: [],
  champion: [
    { label: "Combi-Melta (replace serpenta, +10pts)", cost: 10, perModel: false },
    { label: "Melta Bombs (+5pts)", cost: 5, perModel: false },
  ],
  esoterist: [],
  praevian: [
    // Pistols (replace bolt pistol)
    { label: "Plasma Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Hand Flamer (+5pts)", cost: 5, perModel: false },
    { label: "Volkite Serpenta (+5pts)", cost: 5, perModel: false },
    { label: "Melta Bombs (+5pts)", cost: 5, perModel: false },
  ],
  master_signals: [
    // Pistols (replace bolt pistol)
    { label: "Plasma Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Hand Flamer (+5pts)", cost: 5, perModel: false },
    { label: "Volkite Serpenta (+5pts)", cost: 5, perModel: false },
  ],
  siege_breaker: [
    { label: "Disintegrator Pistol (+5pts)", cost: 5, perModel: false },
    // Pistols (replace bolt pistol)
    { label: "Plasma Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Hand Flamer (+5pts)", cost: 5, perModel: false },
    { label: "Volkite Serpenta (+5pts)", cost: 5, perModel: false },
    { label: "Melta Bombs (+5pts)", cost: 5, perModel: false },
  ],
  moritat: [
    { label: "Overcharged Plasma Pistols (replace volkite, +10pts)", cost: 10, perModel: false },
    { label: "Melta Bombs (+5pts)", cost: 5, perModel: false },
  ],
  herald: [
    { label: "Power Fist (replace weapon, +10pts)", cost: 10, perModel: false },
    { label: "Melta Bombs (+5pts)", cost: 5, perModel: false },
  ],
  overseer: [
    { label: "Power Maul (replace lash, free)", cost: 0, perModel: false },
    // Pistols (replace bolt pistol)
    { label: "Plasma Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Hand Flamer (+5pts)", cost: 5, perModel: false },
    { label: "Volkite Serpenta (+5pts)", cost: 5, perModel: false },
    { label: "Vexilla (+10pts)", cost: 10, perModel: false },
    { label: "Melta Bombs (+5pts)", cost: 5, perModel: false },
  ],
  chaplain: [
    // Pistols (replace bolt pistol)
    { label: "Plasma Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Hand Flamer (+5pts)", cost: 5, perModel: false },
    { label: "Volkite Serpenta (+5pts)", cost: 5, perModel: false },
    { label: "Melta Bombs (+5pts)", cost: 5, perModel: false },
  ],
  forge_lord: [
    { label: "Melta Bombs (+10pts)", cost: 10, perModel: false },
    { label: "Cyber-Familiar (+10pts)", cost: 10, perModel: false },
  ],
  damocles_rhino: [
    { label: "Combi-Bolters (replace bolters, +10pts)", cost: 10, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
    { label: "Hunter-Killer Missile (+10pts)", cost: 10, perModel: false },
  ],
  // ── TROOPS ──
  tactical: [
    { label: "Vexilla (+10pts)", cost: 10, perModel: false },
    { label: "Bayonet (+1pt/mdl)", cost: 1, perModel: true },
    { label: "Chain Bayonet (+2pts/mdl)", cost: 2, perModel: true },
    { label: "Melta Bombs (Sgt, +10pts)", cost: 10, perModel: false },
  ],
  despoiler: [
    { label: "Vexilla (+10pts)", cost: 10, perModel: false },
    { label: "Melta Bombs (Sgt, +10pts)", cost: 10, perModel: false },
  ],
  breacher: [
    { label: "Vexilla (+10pts)", cost: 10, perModel: false },
    { label: "Melta Bombs (Sgt, +10pts)", cost: 10, perModel: false },
  ],
  assault: [
    { label: "Combat Shields (+2pts/mdl)", cost: 2, perModel: true },
    { label: "Melta Bombs (Sgt, +10pts)", cost: 10, perModel: false },
  ],
  tactical_support: [
    { label: "Vexilla (+10pts)", cost: 10, perModel: false },
    { label: "Melta Bombs (Sgt, +10pts)", cost: 10, perModel: false },
  ],
  // ── ELITES ──
  veteran: [
    { label: "Vexilla (+10pts)", cost: 10, perModel: false },
    { label: "Bayonet (+1pt/mdl)", cost: 1, perModel: true },
    { label: "Chain Bayonet (+2pts/mdl)", cost: 2, perModel: true },
  ],
  veteran_assault: [
    { label: "Melta Bombs (Sgt, +10pts)", cost: 10, perModel: false },
  ],
  seeker: [
    { label: "Bayonet (+1pt/mdl)", cost: 1, perModel: true },
    { label: "Chain Bayonet (+2pts/mdl)", cost: 2, perModel: true },
    { label: "Melta Bombs (Sgt, +10pts)", cost: 10, perModel: false },
  ],
  // ── HEAVY ASSAULT ──
  cataphractii: [
    { label: "Pair Lightning Claws (+10pts/mdl)", cost: 10, perModel: true },
    { label: "Grenade Harness (Sgt, +5pts)", cost: 5, perModel: false },
  ],
  tartaros: [
    { label: "Lightning Claw (+5pts/mdl)", cost: 5, perModel: true },
    { label: "Pair Lightning Claws (+10pts/mdl)", cost: 10, perModel: true },
    { label: "Grenade Harness (Sgt, +5pts)", cost: 5, perModel: false },
  ],
  saturnine: [
    { label: "Twin Heavy Disintegrator (+10pts/mdl)", cost: 10, perModel: true },
    { label: "Particle Shredder (+5pts/mdl)", cost: 5, perModel: true },
  ],
  // ── SUPPORT ──
  heavy_support: [
    { label: "Vexilla (+10pts)", cost: 10, perModel: false },
  ],
  rapier_la: [
    { label: "Laser Destroyer (+25pts/crew)", cost: 25, perModel: true, exclusive: "main" },
    { label: "Graviton Cannon (+20pts/crew)", cost: 20, perModel: true, exclusive: "main" },
    { label: "Quad Launcher (+20pts/crew)", cost: 20, perModel: true, exclusive: "main" },
  ],
  techmarine: [
    // Pistols (replace bolt pistol)
    { label: "Plasma Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Hand Flamer (+5pts)", cost: 5, perModel: false },
    { label: "Volkite Serpenta (+5pts)", cost: 5, perModel: false },
    { label: "Melta Bombs (+10pts)", cost: 10, perModel: false },
    { label: "Cyber-Familiar (+10pts)", cost: 10, perModel: false },
  ],
  apothecary: [
    // Pistols (replace bolt pistol)
    { label: "Plasma Pistol (+5pts)", cost: 5, perModel: false },
    { label: "Hand Flamer (+5pts)", cost: 5, perModel: false },
    { label: "Volkite Serpenta (+5pts)", cost: 5, perModel: false },
  ],
  araknae: [],
  // ── WAR ENGINE ──
  contemptor: [
    { label: "Gravis Power Fist + Combi-Bolter (×2, +10pts)", cost: 10, perModel: false, exclusive: "arms" },
    { label: "Gravis Chainfist + Combi-Bolter (×2, +10pts)", cost: 10, perModel: false, exclusive: "arms" },
    { label: "Two Gravis Bolt Cannons (free)", cost: 0, perModel: false, exclusive: "arms" },
    { label: "Two Gravis Melta Cannons (+30pts)", cost: 30, perModel: false, exclusive: "arms" },
    { label: "Two Gravis Autocannons (+20pts)", cost: 20, perModel: false, exclusive: "arms" },
    { label: "Two Gravis Plasma Cannons (+20pts)", cost: 20, perModel: false, exclusive: "arms" },
    { label: "Two Conversion Beam Cannons (+40pts)", cost: 40, perModel: false, exclusive: "arms" },
    { label: "Two Twin Volkite Culverins (+30pts)", cost: 30, perModel: false, exclusive: "arms" },
    { label: "Two Kheres Assault Cannons (+30pts)", cost: 30, perModel: false, exclusive: "arms" },
    { label: "Two Twin Lascannon (+30pts)", cost: 30, perModel: false, exclusive: "arms" },
    { label: "Paired Gravis Power Fists (+5pts)", cost: 5, perModel: false, exclusive: "arms" },
    { label: "Paired Gravis Chainfists (+5pts)", cost: 5, perModel: false, exclusive: "arms" },
    { label: "Fist + Bolt Cannon (mixed, +5pts)", cost: 5, perModel: false, exclusive: "arms" },
    { label: "Fist + Melta Cannon (mixed, +20pts)", cost: 20, perModel: false, exclusive: "arms" },
    { label: "Fist + Autocannon (mixed, +15pts)", cost: 15, perModel: false, exclusive: "arms" },
    { label: "Havoc Launcher (+5pts)", cost: 5, perModel: false },
  ],
  leviathan: [
    { label: "Two Siege Claws + Meltaguns (free)", cost: 0, perModel: false, exclusive: "arms" },
    { label: "Two Siege Drills + Meltaguns (+10pts)", cost: 10, perModel: false, exclusive: "arms" },
    { label: "Two Grav-Flux Bombards (+20pts)", cost: 20, perModel: false, exclusive: "arms" },
    { label: "Two Storm Cannons (+30pts)", cost: 30, perModel: false, exclusive: "arms" },
    { label: "Two Cyclonic Melta Lances (+40pts)", cost: 40, perModel: false, exclusive: "arms" },
    { label: "Paired Siege Claws (+5pts)", cost: 5, perModel: false, exclusive: "arms" },
    { label: "Paired Siege Drills (+5pts)", cost: 5, perModel: false, exclusive: "arms" },
    { label: "Siege Claw + Storm Cannon (+15pts)", cost: 15, perModel: false, exclusive: "arms" },
    { label: "Siege Claw + Grav-Flux (+10pts)", cost: 10, perModel: false, exclusive: "arms" },
    { label: "Twin Volkite Calivers (replace flamers, +15pts)", cost: 15, perModel: false },
    { label: "Phosphex Discharger (+20pts)", cost: 20, perModel: false },
  ],
  deredeo: [
    { label: "Hellfire Plasma Cannonade (+15pts)", cost: 15, perModel: false, exclusive: "main" },
    { label: "Arachnus Heavy Lascannon Battery (+25pts)", cost: 25, perModel: false, exclusive: "main" },
    { label: "Volkite Falconet (free)", cost: 0, perModel: false, exclusive: "main" },
    { label: "Boreas Air Defence Missiles (free)", cost: 0, perModel: false },
    { label: "Twin Heavy Flamer (replace twin HB, free)", cost: 0, perModel: false },
  ],
  saturnine_dread: [
    { label: "Disintegrator Cannon (replace plasma bombard, +10pts)", cost: 10, perModel: false, exclusive: "left" },
    { label: "Inversion Beamer (replace plasma bombard, +10pts)", cost: 10, perModel: false, exclusive: "left" },
    { label: "Graviton Pulveriser (replace plasma bombard, +10pts)", cost: 10, perModel: false, exclusive: "left" },
    { label: "Heavy Plasma Bombard (replace disintegrator, free)", cost: 0, perModel: false, exclusive: "right" },
    { label: "Inversion Beamer (replace disintegrator, free)", cost: 0, perModel: false, exclusive: "right" },
    { label: "Graviton Pulveriser (replace disintegrator, free)", cost: 0, perModel: false, exclusive: "right" },
    { label: "Two Concussive Resonators (+10pts)", cost: 10, perModel: false },
    { label: "Two Heavy Particle Shredders (+10pts)", cost: 10, perModel: false },
  ],
  // ── TRANSPORT ──
  rhino: [],
  termite: [
    { label: "Combi-Bolters (replace bolters, +10pts)", cost: 10, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
    { label: "Hunter-Killer Missile (+10pts)", cost: 10, perModel: false },
    { label: "Dozer Blade (+5pts)", cost: 5, perModel: false },
  ],
  drop_pod: [
    { label: "Twin Volkite Chargers (+10pts)", cost: 10, perModel: false, exclusive: "pintle" },
    { label: "Two Heavy Flamers (+5pts)", cost: 5, perModel: false, exclusive: "pintle" },
  ],
  // ── HEAVY TRANSPORT ──
  land_raider: [
    { label: "Hull Twin Heavy Flamer (free)", cost: 0, perModel: false, exclusive: "hull" },
    { label: "Hull Twin Lascannon (+10pts)", cost: 10, perModel: false, exclusive: "hull" },
    { label: "Hunter-Killer Missile (+5pts)", cost: 5, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
  ],
  spartan: [
    { label: "Laser Destroyers (replace lascannon arrays, free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Gravis Heavy Bolter Battery (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Hull Twin Heavy Flamer (free)", cost: 0, perModel: false, exclusive: "hull" },
    { label: "Hull Twin Lascannon (+10pts)", cost: 10, perModel: false, exclusive: "hull" },
    { label: "Hunter-Killer Missile (+5pts)", cost: 5, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
  ],
  dreadnought_drop_pod: [],
  dreadclaw: [],
  kharybdis: [],
  // ── ARMOUR ──
  predator: [
    { label: "Flamestorm Cannon (free)", cost: 0, perModel: false, exclusive: "turret" },
    { label: "Executioner Plasma Destroyer (+25pts)", cost: 25, perModel: false, exclusive: "turret" },
    { label: "Heavy Conversion Beam Cannon (+30pts)", cost: 30, perModel: false, exclusive: "turret" },
    { label: "Magna-Melta Cannon (+20pts)", cost: 20, perModel: false, exclusive: "turret" },
    { label: "Graviton Cannon (+20pts)", cost: 20, perModel: false, exclusive: "turret" },
    { label: "Volkite Macro-Saker (+5pts)", cost: 5, perModel: false, exclusive: "turret" },
    { label: "Neutron Blaster (+15pts)", cost: 15, perModel: false, exclusive: "turret" },
    { label: "Twin Lascannon (+10pts)", cost: 10, perModel: false, exclusive: "turret" },
    { label: "Lascannon Sponsons (+20pts)", cost: 20, perModel: false, exclusive: "sponson" },
    { label: "Volkite Culverin Sponsons (+10pts)", cost: 10, perModel: false, exclusive: "sponson" },
    { label: "Heavy Flamer Sponsons (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Hunter-Killer Missile (+5pts)", cost: 5, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
    { label: "Dozer Blade (+5pts)", cost: 5, perModel: false },
  ],
  sicaran: [
    { label: "Arcus Missile Launcher (+40pts)", cost: 40, perModel: false, exclusive: "turret" },
    { label: "Punisher Rotary Cannon (+10pts)", cost: 10, perModel: false, exclusive: "turret" },
    { label: "Omega Plasma Array (+25pts)", cost: 25, perModel: false, exclusive: "turret" },
    { label: "Lascannon Sponsons (+20pts)", cost: 20, perModel: false, exclusive: "sponson" },
    { label: "Volkite Culverin Sponsons (+10pts)", cost: 10, perModel: false, exclusive: "sponson" },
    { label: "Heavy Flamer Sponsons (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Hunter-Killer Missile (+5pts)", cost: 5, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
  ],
  sicaran_venator: [
    { label: "Lascannon Sponsons (+20pts)", cost: 20, perModel: false, exclusive: "sponson" },
    { label: "Volkite Culverin Sponsons (+10pts)", cost: 10, perModel: false, exclusive: "sponson" },
    { label: "Heavy Flamer Sponsons (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Hunter-Killer Missile (+5pts)", cost: 5, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
  ],
  kratos: [
    { label: "Flashburn Shells (+10pts)", cost: 10, perModel: false },
    { label: "Volkite Cardanelle (free)", cost: 0, perModel: false, exclusive: "turret" },
    { label: "Melta Blast-Gun (+30pts)", cost: 30, perModel: false, exclusive: "turret" },
    { label: "Hull Volkite Calivers (+5pts)", cost: 5, perModel: false, exclusive: "hullgun" },
    { label: "Hull Autocannons (+10pts)", cost: 10, perModel: false, exclusive: "hullgun" },
    { label: "Hull Lascannons (+25pts)", cost: 25, perModel: false, exclusive: "hullgun" },
    { label: "Lascannon Sponsons (+20pts)", cost: 20, perModel: false, exclusive: "sponson" },
    { label: "Volkite Culverin Sponsons (+10pts)", cost: 10, perModel: false, exclusive: "sponson" },
    { label: "Heavy Flamer Sponsons (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Hunter-Killer Missile (+5pts)", cost: 5, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
    { label: "Dozer Blade (+5pts)", cost: 5, perModel: false },
  ],
  vindicator: [
    { label: "Magna Laser Destroyer (+20pts)", cost: 20, perModel: false, exclusive: "main" },
    { label: "Hunter-Killer Missile (+5pts)", cost: 5, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
    { label: "Dozer Blade (+5pts)", cost: 5, perModel: false },
  ],
  scorpius: [
    { label: "Hunter-Killer Missile (+5pts)", cost: 5, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
    { label: "Dozer Blade (+5pts)", cost: 5, perModel: false },
  ],
  arquitor: [
    { label: "Graviton-Charge Cannon (+15pts)", cost: 15, perModel: false, exclusive: "main" },
    { label: "Spicula Rocket System (+15pts)", cost: 15, perModel: false, exclusive: "main" },
    { label: "Sponson Autocannons (+10pts)", cost: 10, perModel: false, exclusive: "sponson" },
    { label: "Lascannon Sponsons (+20pts)", cost: 20, perModel: false, exclusive: "sponson" },
    { label: "Volkite Culverin Sponsons (+10pts)", cost: 10, perModel: false, exclusive: "sponson" },
    { label: "Heavy Flamer Sponsons (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Hunter-Killer Missile (+5pts)", cost: 5, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
  ],
  // ── RECON ──
  recon: [
    { label: "Nemesis Bolters (+5pts/mdl)", cost: 5, perModel: true },
    { label: "Melta Bombs (Sgt, +10pts)", cost: 10, perModel: false },
  ],
  seeker: [],
  sabre: [
    { label: "Neutron Blaster (+10pts)", cost: 10, perModel: false, exclusive: "main" },
    { label: "Volkite Saker (free)", cost: 0, perModel: false, exclusive: "main" },
    { label: "Hull Multi-Melta (+25pts)", cost: 25, perModel: false, exclusive: "hull" },
    { label: "Hull Volkite Culverin (+15pts)", cost: 15, perModel: false, exclusive: "hull" },
    { label: "Hull Heavy Flamer (free)", cost: 0, perModel: false, exclusive: "hull" },
    { label: "Sabre Missiles (+5pts each, up to 4)", cost: 5, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
  ],
  outrider: [
    { label: "Twin Plasma Guns (+15pts/mdl)", cost: 15, perModel: true },
  ],
  land_raider_exp: [
    { label: "Hull Twin Lascannon (+20pts)", cost: 20, perModel: false, exclusive: "hull" },
    { label: "Hull Twin Heavy Bolter (+10pts)", cost: 10, perModel: false, exclusive: "hull" },
    { label: "Hull Twin Heavy Flamer (+10pts)", cost: 10, perModel: false, exclusive: "hull" },
    { label: "Hunter-Killer Missile (+5pts)", cost: 5, perModel: false },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
  ],
  tarantula: [
    { label: "Twin Lascannon (+20pts/mdl)", cost: 20, perModel: true, exclusive: "turret" },
    { label: "Twin Volkite Culverin (+15pts/mdl)", cost: 15, perModel: true, exclusive: "turret" },
    { label: "Sentry Melta Array (+25pts/mdl)", cost: 25, perModel: true, exclusive: "turret" },
    { label: "Hyperios Missile Launcher (+15pts/mdl)", cost: 15, perModel: true, exclusive: "turret" },
    { label: "Orias Frag Missiles (+15pts/mdl)", cost: 15, perModel: true, exclusive: "turret" },
  ],
  // ── FAST ATTACK ──
  xiphon: [],
  storm_eagle: [
    { label: "Twin Multi-Melta (+15pts)", cost: 15, perModel: false, exclusive: "nose" },
    { label: "Cyclone Missile Launcher (+10pts)", cost: 10, perModel: false, exclusive: "nose" },
    { label: "Hunter-Killer Missiles (+15pts)", cost: 15, perModel: false, exclusive: "rockets" },
    { label: "Twin Lascannon (+30pts)", cost: 30, perModel: false, exclusive: "rockets" },
  ],
  fire_raptor: [
    { label: "Gravis Autocannon Batteries (+15pts)", cost: 15, perModel: false, exclusive: "sponson" },
    { label: "Hellstrike Missiles (+20pts)", cost: 20, perModel: false },
  ],
  scimitar_jetbike: [
    { label: "Volkite Culverin (+5pts/mdl)", cost: 5, perModel: true, exclusive: "weapon" },
    { label: "Multi-Melta (+15pts/mdl)", cost: 15, perModel: true, exclusive: "weapon" },
    { label: "Plasma Cannon (+10pts/mdl)", cost: 10, perModel: true, exclusive: "weapon" },
    { label: "Augury Scanner (+10pts)", cost: 10, perModel: false },
  ],
  javelin: [
    { label: "Two Lascannon (+5pts/mdl)", cost: 5, perModel: true, exclusive: "missile" },
    { label: "Two Volkite Culverin (+5pts/mdl)", cost: 5, perModel: true, exclusive: "missile" },
    { label: "Two Heavy Flamers (free)", cost: 0, perModel: true, exclusive: "missile" },
    { label: "Two Heavy Bolters (free)", cost: 0, perModel: true, exclusive: "missile" },
  ],
  land_speeder: [
    { label: "Havoc Launcher (+5pts/mdl)", cost: 5, perModel: true, exclusive: "weapon" },
    { label: "Multi-Melta (+20pts/mdl)", cost: 20, perModel: true, exclusive: "weapon" },
    { label: "Volkite Culverin (+5pts/mdl)", cost: 5, perModel: true, exclusive: "weapon" },
    { label: "Plasma Cannon (+10pts/mdl)", cost: 10, perModel: true, exclusive: "weapon" },
    { label: "Graviton Gun (+10pts/mdl)", cost: 10, perModel: true, exclusive: "weapon" },
    { label: "Heavy Flamer (free)", cost: 0, perModel: true, exclusive: "weapon" },
  ],
  // ── LORD OF WAR ──
  cerberus: [
    { label: "Lascannon Sponsons (+20pts)", cost: 20, perModel: false, exclusive: "sponson" },
    { label: "Volkite Culverin Sponsons (+10pts)", cost: 10, perModel: false, exclusive: "sponson" },
    { label: "Heavy Flamer Sponsons (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
  ],
  typhon: [
    { label: "Lascannon Sponsons (+20pts)", cost: 20, perModel: false, exclusive: "sponson" },
    { label: "Volkite Culverin Sponsons (+10pts)", cost: 10, perModel: false, exclusive: "sponson" },
    { label: "Heavy Flamer Sponsons (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
  ],
  glaive: [
    { label: "Hull Twin Heavy Flamer (free)", cost: 0, perModel: false, exclusive: "hull" },
    { label: "Laser Destroyers (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Gravis Heavy Bolter Battery (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
  ],
  fellblade: [
    { label: "Hull Twin Heavy Flamer (free)", cost: 0, perModel: false, exclusive: "hull" },
    { label: "Laser Destroyers (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Gravis Heavy Bolter Battery (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
  ],
  falchion: [
    { label: "Laser Destroyers (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Gravis Heavy Bolter Battery (free)", cost: 0, perModel: false, exclusive: "sponson" },
    { label: "Searchlights (+5pts)", cost: 5, perModel: false },
  ],
  thunderhawk: [],
  // ── RETINUE ──
  praetorian_cmd: [
    { label: "Pair Lightning Claws (+10pts/mdl)", cost: 10, perModel: true },
    { label: "Legion Standard (+20pts)", cost: 20, perModel: false },
    { label: "Bayonet (+1pt/mdl)", cost: 1, perModel: true },
    { label: "Chain Bayonet (+2pts/mdl)", cost: 2, perModel: true },
  ],
  praetorian_cmd_jp: [
    { label: "Pair Lightning Claws (+10pts/mdl)", cost: 10, perModel: true },
    { label: "Legion Standard (+20pts)", cost: 20, perModel: false },
    { label: "Bayonet (+1pt/mdl)", cost: 1, perModel: true },
    { label: "Chain Bayonet (+2pts/mdl)", cost: 2, perModel: true },
  ],
  tartaros_cmd: [
    { label: "Pair Lightning Claws (+10pts/mdl)", cost: 10, perModel: true },
    { label: "Legion Standard (+20pts)", cost: 20, perModel: false },
    { label: "Grenade Harness (Sgt, +5pts)", cost: 5, perModel: false },
  ],
  centurion_cmd: [
    { label: "Pair Lightning Claws (+10pts/mdl)", cost: 10, perModel: true },
    { label: "Vexilla (+10pts)", cost: 10, perModel: false, exclusive: "banner" },
    { label: "Company Standard (+20pts)", cost: 20, perModel: false, exclusive: "banner" },
    { label: "Bayonet (+1pt/mdl)", cost: 1, perModel: true },
    { label: "Chain Bayonet (+2pts/mdl)", cost: 2, perModel: true },
  ],
  cataphractii_cmd: [
    { label: "Pair Lightning Claws (+10pts/mdl)", cost: 10, perModel: true },
    { label: "Legion Standard (+20pts)", cost: 20, perModel: false },
    { label: "Grenade Harness (Sgt, +5pts)", cost: 5, perModel: false },
  ],
};

// ━━━ ARMY BUILDER: CRUSADE FORCE ORGANISATION (3rd Edition PDF) ━━━━━━━━━━━━━

// 15 Battlefield Roles from the Crusade Army Selection process (p.285)


Object.assign(window.HH, { getLegionWargearOptions, getWargearOptions, EQUIPMENT_OPTIONS, UNIT_EQUIPMENT_ACCESS, canTakeEquipment, POINTS_DATA, WEAPON_UPGRADE_COSTS, LEGION_WEAPON_PROFILES, getRangedWeapons, MELEE_getRangedWeapons, UNIT_WARGEAR_OPTIONS });
})();
