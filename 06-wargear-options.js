// Unit wargear options data
// Lines 1165-1722 from shooting-resolver165.jsx

// ━━━ UNIT WARGEAR OPTIONS (from Liber Astartes 3rd Edition PDF) ━━━━━━━━━━━━
// Each unit lists available upgrade options as checkboxes in the army builder.
// format: { label, cost, perModel(bool), exclusive(group name) }
var UNIT_WARGEAR_OPTIONS = {
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

