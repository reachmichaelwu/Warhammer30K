// Unit wargear options data
// Lines 1165-1722 from shooting-resolver165.jsx

// ━━━ UNIT WARGEAR OPTIONS (from Liber Astartes 3rd Edition PDF) ━━━━━━━━━━━━
// Each unit lists available upgrade options as checkboxes in the army builder.
// format: { label, cost, perModel(bool), exclusive(group name) }
function wargearOption(label, cost, perModel, exclusive) {
  var option = { label: label, cost: cost, perModel: !!perModel };
  if (exclusive) option.exclusive = exclusive;
  return option;
}

var UNIT_WARGEAR_OPTIONS = {
  // ── HIGH COMMAND ──
  praetor_pa: [
    wargearOption("Jump Pack (+20pts)", 20, false, "variant"),
    wargearOption("Paragon Blade (+15pts)", 15, false),
    wargearOption("Archaeotech Pistol (+15pts)", 15, false),
    wargearOption("Pair Lightning Claws (+20pts)", 20, false),
    // Officer Wargear (replace bolter/pistol)
    wargearOption("Power Weapon (+10pts)", 10, false),
    wargearOption("Power Fist (+15pts)", 15, false),
    wargearOption("Thunder Hammer (+15pts)", 15, false),
    wargearOption("Lightning Claw (+10pts)", 10, false),
    wargearOption("Charnabal Sabre (+5pts)", 5, false),
    wargearOption("Volkite Serpenta (+5pts)", 5, false),
    wargearOption("Plasma Pistol (+5pts)", 5, false),
    wargearOption("Disintegrator Pistol (+5pts)", 5, false),
    wargearOption("Hand Flamer (+5pts)", 5, false),
    wargearOption("Combat Shield (free)", 0, false),
    wargearOption("Boarding Shield (+5pts)", 5, false),
    // Combi-weapons (replace bolter)
    wargearOption("Combi-Bolter (+5pts)", 5, false),
    wargearOption("Combi-Flamer (+10pts)", 10, false),
    wargearOption("Combi-Melta (+10pts)", 10, false),
    wargearOption("Combi-Plasma (+10pts)", 10, false),
    wargearOption("Combi-Volkite (+10pts)", 10, false),
    wargearOption("Combi-Grenade (+10pts)", 10, false),
    wargearOption("Combi-Disintegrator (+10pts)", 10, false),
    wargearOption("Combi-Grav (+10pts)", 10, false),
    wargearOption("Astartes Shotgun (+2pts)", 2, false),
    wargearOption("Volkite Charger (+2pts)", 2, false),
    // Other
    wargearOption("Melta Bombs (+5pts)", 5, false),
    wargearOption("Bayonet (+1pt)", 1, false),
    wargearOption("Chain Bayonet (+2pts)", 2, false),
    wargearOption("Cyber-Familiar (+10pts)", 10, false),
  ],
  praetor_ta: [
    wargearOption("Tartaros Armour (+10pts)", 10, false, "variant"),
    wargearOption("Paragon Blade (+15pts)", 15, false),
    wargearOption("Pair Lightning Claws (+5pts)", 5, false),
    // Terminator Melee (replace power weapon)
    wargearOption("Lightning Claw (+5pts)", 5, false),
    wargearOption("Power Fist (+10pts)", 10, false),
    wargearOption("Chainfist (+10pts)", 10, false),
    wargearOption("Thunder Hammer (+10pts)", 10, false),
    // Ranged (replace combi-bolter)
    wargearOption("Volkite Charger (free)", 0, false),
    wargearOption("Combi-Flamer (+10pts)", 10, false),
    wargearOption("Combi-Melta (+10pts)", 10, false),
    wargearOption("Combi-Plasma (+10pts)", 10, false),
    wargearOption("Combi-Volkite (+10pts)", 10, false),
    wargearOption("Combi-Grenade (+10pts)", 10, false),
    wargearOption("Combi-Disintegrator (+10pts)", 10, false),
    wargearOption("Combi-Grav (+10pts)", 10, false),
  ],
  praetor_sat: [
    wargearOption("Saturnine Concussion Hammer (+10pts)", 10, false),
    wargearOption("Plasma Blaster (+10pts)", 10, false),
    wargearOption("Saturnine Teleportation Transponder (+60pts)", 60, false),
  ],
  // ── COMMAND ──
  centurion: [
    wargearOption("Jump Pack (+20pts)", 20, false, "variant"),
    // Officer Wargear (replace bolter/pistol)
    wargearOption("Power Weapon (+10pts)", 10, false),
    wargearOption("Power Fist (+15pts)", 15, false),
    wargearOption("Thunder Hammer (+15pts)", 15, false),
    wargearOption("Lightning Claw (+10pts)", 10, false),
    wargearOption("Charnabal Sabre (+5pts)", 5, false),
    wargearOption("Volkite Serpenta (+5pts)", 5, false),
    wargearOption("Plasma Pistol (+5pts)", 5, false),
    wargearOption("Disintegrator Pistol (+5pts)", 5, false),
    wargearOption("Hand Flamer (+5pts)", 5, false),
    wargearOption("Combat Shield (free)", 0, false),
    wargearOption("Boarding Shield (+5pts)", 5, false),
    wargearOption("Pair Lightning Claws (+20pts)", 20, false),
    // Combi-weapons
    wargearOption("Combi-Bolter (+5pts)", 5, false),
    wargearOption("Combi-Flamer (+10pts)", 10, false),
    wargearOption("Combi-Melta (+10pts)", 10, false),
    wargearOption("Combi-Plasma (+10pts)", 10, false),
    wargearOption("Combi-Volkite (+10pts)", 10, false),
    wargearOption("Astartes Shotgun (+2pts)", 2, false),
    wargearOption("Volkite Charger (+2pts)", 2, false),
    // Other
    wargearOption("Melta Bombs (+5pts)", 5, false),
    wargearOption("Bayonet (+1pt)", 1, false),
    wargearOption("Chain Bayonet (+2pts)", 2, false),
    wargearOption("Vexilla (+10pts)", 10, false),
    wargearOption("Cyber-Familiar (+10pts)", 10, false),
  ],
  centurion_sat: [
    // Replace Saturnine disruption fist with ranged weapon
    wargearOption("Twin Heavy Disintegrator (replace disruption fist, +10pts)", 10, false),
    // Replace plasma bombard with ranged weapon
    wargearOption("Twin Heavy Disintegrator (replace plasma bombard, +10pts)", 10, false),
    // Secondary option if disruption fist is kept
    wargearOption("Particle Shredder (+5pts)", 5, false),
    wargearOption("Plasma Blaster (+10pts)", 10, false),
  ],
  centurion_ta: [
    // Ranged (replace combi-bolter)
    wargearOption("Volkite Charger (free)", 0, false),
    wargearOption("Combi-Flamer (+10pts)", 10, false),
    wargearOption("Combi-Melta (+10pts)", 10, false),
    wargearOption("Combi-Plasma (+10pts)", 10, false),
    wargearOption("Combi-Volkite (+10pts)", 10, false),
    // Terminator Melee (replace power weapon)
    wargearOption("Pair Lightning Claws (+5pts)", 5, false),
    wargearOption("Lightning Claw (+5pts)", 5, false),
    wargearOption("Power Fist (+10pts)", 10, false),
    wargearOption("Chainfist (+10pts)", 10, false),
    wargearOption("Thunder Hammer (+10pts)", 10, false),
  ],
  optae: [
    wargearOption("Jump Pack (+20pts)", 20, false, "variant"),
    // Sergeant Melee (replace bolter/pistol)
    wargearOption("Chainsword (free)", 0, false),
    wargearOption("Chainaxe (free)", 0, false),
    wargearOption("Charnabal Sabre (+5pts)", 5, false),
    wargearOption("Power Weapon (+10pts)", 10, false),
    wargearOption("Power Fist (+15pts)", 15, false),
    wargearOption("Thunder Hammer (+15pts)", 15, false),
    wargearOption("Lightning Claw (+10pts)", 10, false),
    wargearOption("Pair Lightning Claws (+20pts)", 20, false),
    // Pistols (replace bolt pistol)
    wargearOption("Disintegrator Pistol (+5pts)", 5, false),
    wargearOption("Plasma Pistol (+5pts)", 5, false),
    wargearOption("Hand Flamer (+5pts)", 5, false),
    wargearOption("Volkite Serpenta (+5pts)", 5, false),
    // Combi-weapons (replace bolter)
    wargearOption("Combi-Bolter (+5pts)", 5, false),
    wargearOption("Combi-Melta (+10pts)", 10, false),
    wargearOption("Combi-Plasma (+10pts)", 10, false),
    wargearOption("Astartes Shotgun (+2pts)", 2, false),
    wargearOption("Volkite Charger (+2pts)", 2, false),
    // Other
    wargearOption("Melta Bombs (+5pts)", 5, false),
    wargearOption("Bayonet (+1pt)", 1, false),
    wargearOption("Chain Bayonet (+2pts)", 2, false),
  ],
  librarian: [
    // Pistols (replace bolt pistol)
    wargearOption("Plasma Pistol (+5pts)", 5, false),
    wargearOption("Hand Flamer (+5pts)", 5, false),
    wargearOption("Volkite Serpenta (+5pts)", 5, false),
    // Psychic Disciplines
    wargearOption("Biomancy (+20pts)", 20, false),
    wargearOption("Pyromancy (+10pts)", 10, false),
    wargearOption("Telekinesis (+20pts)", 20, false),
    wargearOption("Divination (+20pts)", 20, false),
    wargearOption("Thaumaturgy (free)", 0, false),
    wargearOption("Telepathy (+10pts)", 10, false),
  ],
  vigilator: [],
  champion: [
    wargearOption("Combi-Melta (replace serpenta, +10pts)", 10, false),
    wargearOption("Melta Bombs (+5pts)", 5, false),
  ],
  esoterist: [],
  praevian: [
    // Pistols (replace bolt pistol)
    wargearOption("Plasma Pistol (+5pts)", 5, false),
    wargearOption("Hand Flamer (+5pts)", 5, false),
    wargearOption("Volkite Serpenta (+5pts)", 5, false),
    wargearOption("Melta Bombs (+5pts)", 5, false),
  ],
  master_signals: [
    // Pistols (replace bolt pistol)
    wargearOption("Plasma Pistol (+5pts)", 5, false),
    wargearOption("Hand Flamer (+5pts)", 5, false),
    wargearOption("Volkite Serpenta (+5pts)", 5, false),
  ],
  siege_breaker: [
    wargearOption("Disintegrator Pistol (+5pts)", 5, false),
    // Pistols (replace bolt pistol)
    wargearOption("Plasma Pistol (+5pts)", 5, false),
    wargearOption("Hand Flamer (+5pts)", 5, false),
    wargearOption("Volkite Serpenta (+5pts)", 5, false),
    wargearOption("Melta Bombs (+5pts)", 5, false),
  ],
  moritat: [
    wargearOption("Overcharged Plasma Pistols (replace volkite, +10pts)", 10, false),
    wargearOption("Melta Bombs (+5pts)", 5, false),
  ],
  herald: [
    wargearOption("Power Fist (replace weapon, +10pts)", 10, false),
    wargearOption("Melta Bombs (+5pts)", 5, false),
  ],
  overseer: [
    wargearOption("Power Maul (replace lash, free)", 0, false),
    // Pistols (replace bolt pistol)
    wargearOption("Plasma Pistol (+5pts)", 5, false),
    wargearOption("Hand Flamer (+5pts)", 5, false),
    wargearOption("Volkite Serpenta (+5pts)", 5, false),
    wargearOption("Vexilla (+10pts)", 10, false),
    wargearOption("Melta Bombs (+5pts)", 5, false),
  ],
  chaplain: [
    // Pistols (replace bolt pistol)
    wargearOption("Plasma Pistol (+5pts)", 5, false),
    wargearOption("Hand Flamer (+5pts)", 5, false),
    wargearOption("Volkite Serpenta (+5pts)", 5, false),
    wargearOption("Melta Bombs (+5pts)", 5, false),
  ],
  forge_lord: [
    wargearOption("Melta Bombs (+10pts)", 10, false),
    wargearOption("Cyber-Familiar (+10pts)", 10, false),
  ],
  damocles_rhino: [
    wargearOption("Combi-Bolters (replace bolters, +10pts)", 10, false),
    wargearOption("Searchlights (+5pts)", 5, false),
    wargearOption("Hunter-Killer Missile (+10pts)", 10, false),
  ],
  // ── TROOPS ──
  tactical: [
    wargearOption("Vexilla (+10pts)", 10, false),
    wargearOption("Bayonet (+1pt/mdl)", 1, true),
    wargearOption("Chain Bayonet (+2pts/mdl)", 2, true),
    wargearOption("Melta Bombs (Sgt, +10pts)", 10, false),
  ],
  despoiler: [
    wargearOption("Vexilla (+10pts)", 10, false),
    wargearOption("Melta Bombs (Sgt, +10pts)", 10, false),
  ],
  breacher: [
    wargearOption("Vexilla (+10pts)", 10, false),
    wargearOption("Melta Bombs (Sgt, +10pts)", 10, false),
  ],
  assault: [
    wargearOption("Combat Shields (+2pts/mdl)", 2, true),
    wargearOption("Melta Bombs (Sgt, +10pts)", 10, false),
  ],
  tactical_support: [
    wargearOption("Vexilla (+10pts)", 10, false),
    wargearOption("Melta Bombs (Sgt, +10pts)", 10, false),
  ],
  // ── ELITES ──
  veteran: [
    wargearOption("Vexilla (+10pts)", 10, false),
    wargearOption("Bayonet (+1pt/mdl)", 1, true),
    wargearOption("Chain Bayonet (+2pts/mdl)", 2, true),
  ],
  veteran_assault: [
    wargearOption("Melta Bombs (Sgt, +10pts)", 10, false),
  ],
  seeker: [
    wargearOption("Bayonet (+1pt/mdl)", 1, true),
    wargearOption("Chain Bayonet (+2pts/mdl)", 2, true),
    wargearOption("Melta Bombs (Sgt, +10pts)", 10, false),
  ],
  // ── HEAVY ASSAULT ──
  cataphractii: [
    wargearOption("Pair Lightning Claws (+10pts/mdl)", 10, true),
    wargearOption("Grenade Harness (Sgt, +5pts)", 5, false),
  ],
  tartaros: [
    wargearOption("Lightning Claw (+5pts/mdl)", 5, true),
    wargearOption("Pair Lightning Claws (+10pts/mdl)", 10, true),
    wargearOption("Grenade Harness (Sgt, +5pts)", 5, false),
  ],
  saturnine: [
    wargearOption("Twin Heavy Disintegrator (+10pts/mdl)", 10, true),
    wargearOption("Particle Shredder (+5pts/mdl)", 5, true),
  ],
  // ── SUPPORT ──
  heavy_support: [
    wargearOption("Vexilla (+10pts)", 10, false),
  ],
  rapier_la: [
    wargearOption("Laser Destroyer (+25pts/crew)", 25, true, "main"),
    wargearOption("Graviton Cannon (+20pts/crew)", 20, true, "main"),
    wargearOption("Quad Launcher (+20pts/crew)", 20, true, "main"),
  ],
  techmarine: [
    // Pistols (replace bolt pistol)
    wargearOption("Plasma Pistol (+5pts)", 5, false),
    wargearOption("Hand Flamer (+5pts)", 5, false),
    wargearOption("Volkite Serpenta (+5pts)", 5, false),
    wargearOption("Melta Bombs (+10pts)", 10, false),
    wargearOption("Cyber-Familiar (+10pts)", 10, false),
  ],
  apothecary: [
    // Pistols (replace bolt pistol)
    wargearOption("Plasma Pistol (+5pts)", 5, false),
    wargearOption("Hand Flamer (+5pts)", 5, false),
    wargearOption("Volkite Serpenta (+5pts)", 5, false),
  ],
  araknae: [],
  // ── WAR ENGINE ──
  contemptor: [
    wargearOption("Gravis Power Fist + Combi-Bolter (×2, +10pts)", 10, false, "arms"),
    wargearOption("Gravis Chainfist + Combi-Bolter (×2, +10pts)", 10, false, "arms"),
    wargearOption("Two Gravis Bolt Cannons (free)", 0, false, "arms"),
    wargearOption("Two Gravis Melta Cannons (+30pts)", 30, false, "arms"),
    wargearOption("Two Gravis Autocannons (+20pts)", 20, false, "arms"),
    wargearOption("Two Gravis Plasma Cannons (+20pts)", 20, false, "arms"),
    wargearOption("Two Conversion Beam Cannons (+40pts)", 40, false, "arms"),
    wargearOption("Two Twin Volkite Culverins (+30pts)", 30, false, "arms"),
    wargearOption("Two Kheres Assault Cannons (+30pts)", 30, false, "arms"),
    wargearOption("Two Twin Lascannon (+30pts)", 30, false, "arms"),
    wargearOption("Paired Gravis Power Fists (+5pts)", 5, false, "arms"),
    wargearOption("Paired Gravis Chainfists (+5pts)", 5, false, "arms"),
    wargearOption("Fist + Bolt Cannon (mixed, +5pts)", 5, false, "arms"),
    wargearOption("Fist + Melta Cannon (mixed, +20pts)", 20, false, "arms"),
    wargearOption("Fist + Autocannon (mixed, +15pts)", 15, false, "arms"),
    wargearOption("Havoc Launcher (+5pts)", 5, false),
  ],
  leviathan: [
    wargearOption("Two Siege Claws + Meltaguns (free)", 0, false, "arms"),
    wargearOption("Two Siege Drills + Meltaguns (+10pts)", 10, false, "arms"),
    wargearOption("Two Grav-Flux Bombards (+20pts)", 20, false, "arms"),
    wargearOption("Two Storm Cannons (+30pts)", 30, false, "arms"),
    wargearOption("Two Cyclonic Melta Lances (+40pts)", 40, false, "arms"),
    wargearOption("Paired Siege Claws (+5pts)", 5, false, "arms"),
    wargearOption("Paired Siege Drills (+5pts)", 5, false, "arms"),
    wargearOption("Siege Claw + Storm Cannon (+15pts)", 15, false, "arms"),
    wargearOption("Siege Claw + Grav-Flux (+10pts)", 10, false, "arms"),
    wargearOption("Twin Volkite Calivers (replace flamers, +15pts)", 15, false),
    wargearOption("Phosphex Discharger (+20pts)", 20, false),
  ],
  deredeo: [
    wargearOption("Hellfire Plasma Cannonade (+15pts)", 15, false, "main"),
    wargearOption("Arachnus Heavy Lascannon Battery (+25pts)", 25, false, "main"),
    wargearOption("Volkite Falconet (free)", 0, false, "main"),
    wargearOption("Boreas Air Defence Missiles (free)", 0, false),
    wargearOption("Twin Heavy Flamer (replace twin HB, free)", 0, false),
  ],
  saturnine_dread: [
    wargearOption("Disintegrator Cannon (replace plasma bombard, +10pts)", 10, false, "left"),
    wargearOption("Inversion Beamer (replace plasma bombard, +10pts)", 10, false, "left"),
    wargearOption("Graviton Pulveriser (replace plasma bombard, +10pts)", 10, false, "left"),
    wargearOption("Heavy Plasma Bombard (replace disintegrator, free)", 0, false, "right"),
    wargearOption("Inversion Beamer (replace disintegrator, free)", 0, false, "right"),
    wargearOption("Graviton Pulveriser (replace disintegrator, free)", 0, false, "right"),
    wargearOption("Two Concussive Resonators (+10pts)", 10, false),
    wargearOption("Two Heavy Particle Shredders (+10pts)", 10, false),
  ],
  // ── TRANSPORT ──
  rhino: [],
  termite: [
    wargearOption("Combi-Bolters (replace bolters, +10pts)", 10, false),
    wargearOption("Searchlights (+5pts)", 5, false),
    wargearOption("Hunter-Killer Missile (+10pts)", 10, false),
    wargearOption("Dozer Blade (+5pts)", 5, false),
  ],
  drop_pod: [
    wargearOption("Twin Volkite Chargers (+10pts)", 10, false, "pintle"),
    wargearOption("Two Heavy Flamers (+5pts)", 5, false, "pintle"),
  ],
  // ── HEAVY TRANSPORT ──
  land_raider: [
    wargearOption("Hull Twin Heavy Flamer (free)", 0, false, "hull"),
    wargearOption("Hull Twin Lascannon (+10pts)", 10, false, "hull"),
    wargearOption("Hunter-Killer Missile (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  spartan: [
    wargearOption("Laser Destroyers (replace lascannon arrays, free)", 0, false, "sponson"),
    wargearOption("Gravis Heavy Bolter Battery (free)", 0, false, "sponson"),
    wargearOption("Hull Twin Heavy Flamer (free)", 0, false, "hull"),
    wargearOption("Hull Twin Lascannon (+10pts)", 10, false, "hull"),
    wargearOption("Hunter-Killer Missile (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  dreadnought_drop_pod: [],
  dreadclaw: [],
  kharybdis: [],
  // ── ARMOUR ──
  predator: [
    wargearOption("Flamestorm Cannon (free)", 0, false, "turret"),
    wargearOption("Executioner Plasma Destroyer (+25pts)", 25, false, "turret"),
    wargearOption("Heavy Conversion Beam Cannon (+30pts)", 30, false, "turret"),
    wargearOption("Magna-Melta Cannon (+20pts)", 20, false, "turret"),
    wargearOption("Graviton Cannon (+20pts)", 20, false, "turret"),
    wargearOption("Volkite Macro-Saker (+5pts)", 5, false, "turret"),
    wargearOption("Neutron Blaster (+15pts)", 15, false, "turret"),
    wargearOption("Twin Lascannon (+10pts)", 10, false, "turret"),
    wargearOption("Lascannon Sponsons (+20pts)", 20, false, "sponson"),
    wargearOption("Volkite Culverin Sponsons (+10pts)", 10, false, "sponson"),
    wargearOption("Heavy Flamer Sponsons (free)", 0, false, "sponson"),
    wargearOption("Hunter-Killer Missile (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
    wargearOption("Dozer Blade (+5pts)", 5, false),
  ],
  sicaran: [
    wargearOption("Arcus Missile Launcher (+40pts)", 40, false, "turret"),
    wargearOption("Punisher Rotary Cannon (+10pts)", 10, false, "turret"),
    wargearOption("Omega Plasma Array (+25pts)", 25, false, "turret"),
    wargearOption("Lascannon Sponsons (+20pts)", 20, false, "sponson"),
    wargearOption("Volkite Culverin Sponsons (+10pts)", 10, false, "sponson"),
    wargearOption("Heavy Flamer Sponsons (free)", 0, false, "sponson"),
    wargearOption("Hunter-Killer Missile (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  sicaran_venator: [
    wargearOption("Lascannon Sponsons (+20pts)", 20, false, "sponson"),
    wargearOption("Volkite Culverin Sponsons (+10pts)", 10, false, "sponson"),
    wargearOption("Heavy Flamer Sponsons (free)", 0, false, "sponson"),
    wargearOption("Hunter-Killer Missile (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  kratos: [
    wargearOption("Flashburn Shells (+10pts)", 10, false),
    wargearOption("Volkite Cardanelle (free)", 0, false, "turret"),
    wargearOption("Melta Blast-Gun (+30pts)", 30, false, "turret"),
    wargearOption("Hull Volkite Calivers (+5pts)", 5, false, "hullgun"),
    wargearOption("Hull Autocannons (+10pts)", 10, false, "hullgun"),
    wargearOption("Hull Lascannons (+25pts)", 25, false, "hullgun"),
    wargearOption("Lascannon Sponsons (+20pts)", 20, false, "sponson"),
    wargearOption("Volkite Culverin Sponsons (+10pts)", 10, false, "sponson"),
    wargearOption("Heavy Flamer Sponsons (free)", 0, false, "sponson"),
    wargearOption("Hunter-Killer Missile (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
    wargearOption("Dozer Blade (+5pts)", 5, false),
  ],
  vindicator: [
    wargearOption("Magna Laser Destroyer (+20pts)", 20, false, "main"),
    wargearOption("Hunter-Killer Missile (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
    wargearOption("Dozer Blade (+5pts)", 5, false),
  ],
  scorpius: [
    wargearOption("Hunter-Killer Missile (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
    wargearOption("Dozer Blade (+5pts)", 5, false),
  ],
  arquitor: [
    wargearOption("Graviton-Charge Cannon (+15pts)", 15, false, "main"),
    wargearOption("Spicula Rocket System (+15pts)", 15, false, "main"),
    wargearOption("Sponson Autocannons (+10pts)", 10, false, "sponson"),
    wargearOption("Lascannon Sponsons (+20pts)", 20, false, "sponson"),
    wargearOption("Volkite Culverin Sponsons (+10pts)", 10, false, "sponson"),
    wargearOption("Heavy Flamer Sponsons (free)", 0, false, "sponson"),
    wargearOption("Hunter-Killer Missile (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  // ── RECON ──
  recon: [
    wargearOption("Nemesis Bolters (+5pts/mdl)", 5, true),
    wargearOption("Melta Bombs (Sgt, +10pts)", 10, false),
  ],
  sabre: [
    wargearOption("Neutron Blaster (+10pts)", 10, false, "main"),
    wargearOption("Volkite Saker (free)", 0, false, "main"),
    wargearOption("Hull Multi-Melta (+25pts)", 25, false, "hull"),
    wargearOption("Hull Volkite Culverin (+15pts)", 15, false, "hull"),
    wargearOption("Hull Heavy Flamer (free)", 0, false, "hull"),
    wargearOption("Sabre Missiles (+5pts each, up to 4)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  outrider: [
    wargearOption("Twin Plasma Guns (+15pts/mdl)", 15, true),
  ],
  land_raider_exp: [
    wargearOption("Hull Twin Lascannon (+20pts)", 20, false, "hull"),
    wargearOption("Hull Twin Heavy Bolter (+10pts)", 10, false, "hull"),
    wargearOption("Hull Twin Heavy Flamer (+10pts)", 10, false, "hull"),
    wargearOption("Hunter-Killer Missile (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  tarantula: [
    wargearOption("Twin Lascannon (+20pts/mdl)", 20, true, "turret"),
    wargearOption("Twin Volkite Culverin (+15pts/mdl)", 15, true, "turret"),
    wargearOption("Sentry Melta Array (+25pts/mdl)", 25, true, "turret"),
    wargearOption("Hyperios Missile Launcher (+15pts/mdl)", 15, true, "turret"),
    wargearOption("Orias Frag Missiles (+15pts/mdl)", 15, true, "turret"),
  ],
  // ── FAST ATTACK ──
  xiphon: [],
  storm_eagle: [
    wargearOption("Twin Multi-Melta (+15pts)", 15, false, "nose"),
    wargearOption("Cyclone Missile Launcher (+10pts)", 10, false, "nose"),
    wargearOption("Hunter-Killer Missiles (+15pts)", 15, false, "rockets"),
    wargearOption("Twin Lascannon (+30pts)", 30, false, "rockets"),
  ],
  fire_raptor: [
    wargearOption("Gravis Autocannon Batteries (+15pts)", 15, false, "sponson"),
    wargearOption("Hellstrike Missiles (+20pts)", 20, false),
  ],
  scimitar_jetbike: [
    wargearOption("Volkite Culverin (+5pts/mdl)", 5, true, "weapon"),
    wargearOption("Multi-Melta (+15pts/mdl)", 15, true, "weapon"),
    wargearOption("Plasma Cannon (+10pts/mdl)", 10, true, "weapon"),
    wargearOption("Augury Scanner (+10pts)", 10, false),
  ],
  javelin: [
    wargearOption("Two Lascannon (+5pts/mdl)", 5, true, "missile"),
    wargearOption("Two Volkite Culverin (+5pts/mdl)", 5, true, "missile"),
    wargearOption("Two Heavy Flamers (free)", 0, true, "missile"),
    wargearOption("Two Heavy Bolters (free)", 0, true, "missile"),
  ],
  land_speeder: [
    wargearOption("Havoc Launcher (+5pts/mdl)", 5, true, "weapon"),
    wargearOption("Multi-Melta (+20pts/mdl)", 20, true, "weapon"),
    wargearOption("Volkite Culverin (+5pts/mdl)", 5, true, "weapon"),
    wargearOption("Plasma Cannon (+10pts/mdl)", 10, true, "weapon"),
    wargearOption("Graviton Gun (+10pts/mdl)", 10, true, "weapon"),
    wargearOption("Heavy Flamer (free)", 0, true, "weapon"),
  ],
  // ── LORD OF WAR ──
  cerberus: [
    wargearOption("Lascannon Sponsons (+20pts)", 20, false, "sponson"),
    wargearOption("Volkite Culverin Sponsons (+10pts)", 10, false, "sponson"),
    wargearOption("Heavy Flamer Sponsons (free)", 0, false, "sponson"),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  typhon: [
    wargearOption("Lascannon Sponsons (+20pts)", 20, false, "sponson"),
    wargearOption("Volkite Culverin Sponsons (+10pts)", 10, false, "sponson"),
    wargearOption("Heavy Flamer Sponsons (free)", 0, false, "sponson"),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  glaive: [
    wargearOption("Hull Twin Heavy Flamer (free)", 0, false, "hull"),
    wargearOption("Laser Destroyers (free)", 0, false, "sponson"),
    wargearOption("Gravis Heavy Bolter Battery (free)", 0, false, "sponson"),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  fellblade: [
    wargearOption("Hull Twin Heavy Flamer (free)", 0, false, "hull"),
    wargearOption("Laser Destroyers (free)", 0, false, "sponson"),
    wargearOption("Gravis Heavy Bolter Battery (free)", 0, false, "sponson"),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  falchion: [
    wargearOption("Laser Destroyers (free)", 0, false, "sponson"),
    wargearOption("Gravis Heavy Bolter Battery (free)", 0, false, "sponson"),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  thunderhawk: [],
  // ── RETINUE ──
  praetorian_cmd: [
    wargearOption("Pair Lightning Claws (+10pts/mdl)", 10, true),
    wargearOption("Legion Standard (+20pts)", 20, false),
    wargearOption("Bayonet (+1pt/mdl)", 1, true),
    wargearOption("Chain Bayonet (+2pts/mdl)", 2, true),
  ],
  praetorian_cmd_jp: [
    wargearOption("Pair Lightning Claws (+10pts/mdl)", 10, true),
    wargearOption("Legion Standard (+20pts)", 20, false),
    wargearOption("Bayonet (+1pt/mdl)", 1, true),
    wargearOption("Chain Bayonet (+2pts/mdl)", 2, true),
  ],
  tartaros_cmd: [
    wargearOption("Pair Lightning Claws (+10pts/mdl)", 10, true),
    wargearOption("Legion Standard (+20pts)", 20, false),
    wargearOption("Grenade Harness (Sgt, +5pts)", 5, false),
  ],
  centurion_cmd: [
    wargearOption("Pair Lightning Claws (+10pts/mdl)", 10, true),
    wargearOption("Vexilla (+10pts)", 10, false, "banner"),
    wargearOption("Company Standard (+20pts)", 20, false, "banner"),
    wargearOption("Bayonet (+1pt/mdl)", 1, true),
    wargearOption("Chain Bayonet (+2pts/mdl)", 2, true),
  ],
  cataphractii_cmd: [
    wargearOption("Pair Lightning Claws (+10pts/mdl)", 10, true),
    wargearOption("Legion Standard (+20pts)", 20, false),
    wargearOption("Grenade Harness (Sgt, +5pts)", 5, false),
  ],
  saturnine_cmd: [
    // Replace paired disruption fists per model
    wargearOption("Plasma Bombard + Disruption Fist (+10pts/mdl)", 10, true),
    wargearOption("Twin Heavy Disintegrator + Disruption Fist (+20pts/mdl)", 20, true),
    wargearOption("Saturnine War Axe + Disruption Fist (+10pts/mdl)", 10, true),
    wargearOption("Saturnine Concussion Hammer + Disruption Fist (+20pts/mdl)", 20, true),
    // Secondary ranged option per model
    wargearOption("Particle Shredder (+5pts/mdl)", 5, true),
    wargearOption("Plasma Blaster (+10pts/mdl)", 10, true),
    // Banner
    wargearOption("Legion Standard (1 Chosen, +20pts)", 20, false),
  ],
  phraetus_conclave: [
    // Replace paired disruption fists per model
    wargearOption("Plasma Bombard + Disruption Fist (+10pts/mdl)", 10, true),
    wargearOption("Twin Heavy Disintegrator + Disruption Fist (+20pts/mdl)", 20, true),
    wargearOption("Saturnine War Axe + Disruption Fist (+10pts/mdl)", 10, true),
    // Secondary ranged option per model
    wargearOption("Particle Shredder (+5pts/mdl)", 5, true),
    // Phraetus Disciple transponder
    wargearOption("Saturnine Teleportation Transponder (Disciple, +60pts)", 60, false),
  ],

  // ════════════════════════════════════════════════════════════
  // SOLAR AUXILIA WARGEAR OPTIONS
  // ════════════════════════════════════════════════════════════

  // ── RAPIER BATTERY ──
  rapier: [
    wargearOption("Quad Launcher (replaces Laser Destroyer, free)", 0, false, "gun"),
    wargearOption("Autocannon (replaces Laser Destroyer, free)", 0, false, "gun"),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],

  // ── INFANTRY TROOPS ──
  lasrifle: [
    // Optio melee (Auxilia Melee Weapons list)
    wargearOption("Charnabal Sabre - Optio (+3pts)", 3, false, "optio_melee"),
    wargearOption("Power Sword - Optio (+5pts)", 5, false, "optio_melee"),
    wargearOption("Power Fist - Optio (+10pts)", 10, false, "optio_melee"),
    // Optio pistol (Auxilia Pistols list)
    wargearOption("Blast Pistol - Optio (+3pts)", 3, false, "optio_pistol"),
    wargearOption("Needle Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Volkite Serpenta - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Hand Flamer - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Plasma Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    // Section equipment
    wargearOption("Auxilia Vexilla (+10pts)", 10, false),
    wargearOption("Augury Scanner (+5pts)", 5, false),
    wargearOption("Command Vox (+5pts)", 5, false),
  ],
  veletaris: [
    // Optio melee
    wargearOption("Charnabal Sabre - Optio (+3pts)", 3, false, "optio_melee"),
    wargearOption("Power Sword - Optio (+5pts)", 5, false, "optio_melee"),
    wargearOption("Power Fist - Optio (+10pts)", 10, false, "optio_melee"),
    // Optio pistol
    wargearOption("Blast Pistol - Optio (+3pts)", 3, false, "optio_pistol"),
    wargearOption("Needle Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Volkite Serpenta - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Hand Flamer - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Plasma Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    // Section equipment
    wargearOption("Auxilia Vexilla (+10pts)", 10, false),
    wargearOption("Augury Scanner (+5pts)", 5, false),
  ],

  // ── SA COMMAND SECTIONS ──
  legate_cmd_sa: [
    // Legate melee (Auxilia Melee Weapons list)
    wargearOption("Charnabal Sabre - Legate (+3pts)", 3, false, "legate_melee"),
    wargearOption("Power Sword - Legate (+5pts)", 5, false, "legate_melee"),
    wargearOption("Power Fist - Legate (+10pts)", 10, false, "legate_melee"),
    // Legate pistol (Auxilia Pistols list)
    wargearOption("Blast Pistol - Legate (+3pts)", 3, false, "legate_pistol"),
    wargearOption("Needle Pistol - Legate (+5pts)", 5, false, "legate_pistol"),
    wargearOption("Volkite Serpenta - Legate (+5pts)", 5, false, "legate_pistol"),
    wargearOption("Hand Flamer - Legate (+5pts)", 5, false, "legate_pistol"),
    wargearOption("Plasma Pistol - Legate (+5pts)", 5, false, "legate_pistol"),
    // Section equipment
    wargearOption("Cohorts Vexilla (+15pts)", 15, false),
    wargearOption("Augury Scanner (+5pts)", 5, false),
    wargearOption("Command Vox (+10pts)", 10, false),
  ],
  tactical_cmd_sa: [
    // Optio melee
    wargearOption("Charnabal Sabre - Optio (+3pts)", 3, false, "optio_melee"),
    wargearOption("Power Sword - Optio (+5pts)", 5, false, "optio_melee"),
    wargearOption("Power Fist - Optio (+10pts)", 10, false, "optio_melee"),
    // Optio pistol
    wargearOption("Blast Pistol - Optio (+3pts)", 3, false, "optio_pistol"),
    wargearOption("Needle Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Volkite Serpenta - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Hand Flamer - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Plasma Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    // Section equipment
    wargearOption("Auxilia Vexilla (+10pts)", 10, false),
    wargearOption("Augury Scanner (+5pts)", 5, false),
    wargearOption("Command Vox (+10pts)", 10, false),
  ],
  line_cmd_sa: [
    // Optio melee
    wargearOption("Charnabal Sabre - Optio (+3pts)", 3, false, "optio_melee"),
    wargearOption("Power Sword - Optio (+5pts)", 5, false, "optio_melee"),
    wargearOption("Power Fist - Optio (+10pts)", 10, false, "optio_melee"),
    // Optio pistol
    wargearOption("Blast Pistol - Optio (+3pts)", 3, false, "optio_pistol"),
    wargearOption("Needle Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Volkite Serpenta - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Hand Flamer - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Plasma Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    // Section equipment
    wargearOption("Auxilia Vexilla (+10pts)", 10, false),
    wargearOption("Augury Scanner (+5pts)", 5, false),
    wargearOption("Command Vox (+10pts)", 10, false),
  ],
  veletaris_cmd_sa: [
    // Optio melee
    wargearOption("Charnabal Sabre - Optio (+3pts)", 3, false, "optio_melee"),
    wargearOption("Power Sword - Optio (+5pts)", 5, false, "optio_melee"),
    wargearOption("Power Fist - Optio (+10pts)", 10, false, "optio_melee"),
    // Optio pistol
    wargearOption("Blast Pistol - Optio (+3pts)", 3, false, "optio_pistol"),
    wargearOption("Needle Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Volkite Serpenta - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Hand Flamer - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Plasma Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    // Section equipment
    wargearOption("Auxilia Vexilla (+10pts)", 10, false),
    wargearOption("Augury Scanner (+5pts)", 5, false),
    wargearOption("Command Vox (+10pts)", 10, false),
  ],
  hermes_cmd_sa: [
    // Optio melee
    wargearOption("Charnabal Sabre - Optio (+3pts)", 3, false, "optio_melee"),
    wargearOption("Power Sword - Optio (+5pts)", 5, false, "optio_melee"),
    // Optio pistol
    wargearOption("Blast Pistol - Optio (+3pts)", 3, false, "optio_pistol"),
    wargearOption("Needle Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Volkite Serpenta - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Hand Flamer - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Plasma Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    // Section equipment
    wargearOption("Augury Scanner (+5pts)", 5, false),
    wargearOption("Command Vox (+10pts)", 10, false),
  ],
  artillery_cmd_sa: [
    // Optio melee
    wargearOption("Charnabal Sabre - Optio (+3pts)", 3, false, "optio_melee"),
    wargearOption("Power Sword - Optio (+5pts)", 5, false, "optio_melee"),
    // Optio pistol
    wargearOption("Blast Pistol - Optio (+3pts)", 3, false, "optio_pistol"),
    wargearOption("Needle Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Volkite Serpenta - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Hand Flamer - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Plasma Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    // Section equipment
    wargearOption("Augury Scanner (+5pts)", 5, false),
    wargearOption("Command Vox (+10pts)", 10, false),
  ],
  armoured_cmd_sa: [
    // Optio melee
    wargearOption("Charnabal Sabre - Optio (+3pts)", 3, false, "optio_melee"),
    wargearOption("Power Sword - Optio (+5pts)", 5, false, "optio_melee"),
    // Optio pistol
    wargearOption("Blast Pistol - Optio (+3pts)", 3, false, "optio_pistol"),
    wargearOption("Needle Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Volkite Serpenta - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Hand Flamer - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Plasma Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    // Section equipment
    wargearOption("Augury Scanner (+5pts)", 5, false),
    wargearOption("Command Vox (+10pts)", 10, false),
  ],

  // ── SA ELITES / HEAVY ASSAULT ──
  veletaris_vanguard_sa: [
    // Optio melee
    wargearOption("Charnabal Sabre - Optio (+3pts)", 3, false, "optio_melee"),
    wargearOption("Power Sword - Optio (+5pts)", 5, false, "optio_melee"),
    wargearOption("Power Fist - Optio (+10pts)", 10, false, "optio_melee"),
    // Optio pistol
    wargearOption("Blast Pistol - Optio (+3pts)", 3, false, "optio_pistol"),
    wargearOption("Volkite Serpenta - Optio (+5pts)", 5, false, "optio_pistol"),
    wargearOption("Plasma Pistol - Optio (+5pts)", 5, false, "optio_pistol"),
    // Section equipment
    wargearOption("Auxilia Vexilla (+10pts)", 10, false),
    wargearOption("Augury Scanner (+5pts)", 5, false),
  ],
  charonite_sa: [
    // No standard wargear options — equipment is fixed
    wargearOption("Augury Scanner (+5pts)", 5, false),
  ],

  // ── SA SUPPORT / ARTILLERY ──
  // Rapier Battery (already in file above as rapier)
  basilisk_sa: [
    // Hull weapon (Auxilia Hull Weapons list)
    wargearOption("Hull Heavy Flamer (free, replaces heavy bolter)", 0, false, "hull"),
    wargearOption("Hull Multi-laser (free, replaces heavy bolter)", 0, false, "hull"),
    wargearOption("Hull Autocannon (+5pts)", 5, false, "hull"),
    wargearOption("Hull Lascannon (+10pts)", 10, false, "hull"),
    // Pintle weapons (Auxilia Pintle Weapons list)
    wargearOption("Pintle Heavy Stubber (+5pts)", 5, false, "pintle"),
    wargearOption("Pintle Heavy Flamer (+10pts)", 10, false, "pintle"),
    wargearOption("Pintle Multi-laser (+10pts)", 10, false, "pintle"),
  ],
  medusa_sa: [
    // Hull weapon
    wargearOption("Hull Heavy Flamer (free, replaces heavy bolter)", 0, false, "hull"),
    wargearOption("Hull Multi-laser (free, replaces heavy bolter)", 0, false, "hull"),
    wargearOption("Hull Autocannon (+5pts)", 5, false, "hull"),
    wargearOption("Hull Lascannon (+10pts)", 10, false, "hull"),
    // Pintle weapons
    wargearOption("Pintle Heavy Stubber (+5pts)", 5, false, "pintle"),
    wargearOption("Pintle Heavy Flamer (+10pts)", 10, false, "pintle"),
    wargearOption("Pintle Multi-laser (+10pts)", 10, false, "pintle"),
  ],
  aethon_sa: [
    // Main weapon options (replaces Aethon missile battery)
    wargearOption("Multi-laser (free, replaces missile battery)", 0, false, "main"),
    wargearOption("Lascannon (+10pts, replaces missile battery)", 10, false, "main"),
  ],

  // ── SA RECON ──
  hermes_light_sa: [
    // Main weapon options (replaces multi-laser)
    wargearOption("Autocannon (+5pts, replaces multi-laser)", 5, false, "main"),
    wargearOption("Lascannon (+10pts, replaces multi-laser)", 10, false, "main"),
    // Additional weapons
    wargearOption("Flare Launchers (+5pts)", 5, false),
    wargearOption("Dozer Blade (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],

  // ── SA FAST ATTACK ──
  hermes_vel_sa: [
    // Additional weapons
    wargearOption("Flare Launchers (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  primaris_lightning_sa: [
    // Weapon loadout options
    wargearOption("2x Lascannon (replace autocannon, +10pts)", 10, false, "main_gun"),
    wargearOption("Hellstrike Missiles x2 (+10pts)", 10, false),
    wargearOption("Flare Launchers (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  thunderbolt_sa: [
    // Weapon loadout options
    wargearOption("Twin Lascannon (replace autocannon x2, +10pts)", 10, false, "main_gun"),
    wargearOption("Hellstrike Missiles x2 (+10pts)", 10, false),
    wargearOption("Flare Launchers (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],

  // ── SA TRANSPORTS ──
  arvus_sa: [
    // Optional weapon
    wargearOption("Hull Heavy Bolter (+5pts)", 5, false),
    wargearOption("Flare Launchers (+5pts)", 5, false),
  ],
  dracosan_sa: [
    // Hull weapon (Auxilia Hull Weapons list)
    wargearOption("Hull Heavy Flamer (free, replaces multi-laser)", 0, false, "hull"),
    wargearOption("Hull Heavy Bolter (free, replaces multi-laser)", 0, false, "hull"),
    wargearOption("Hull Autocannon (+5pts, replaces multi-laser)", 5, false, "hull"),
    wargearOption("Hull Lascannon (+10pts, replaces multi-laser)", 10, false, "hull"),
    // Pintle weapons
    wargearOption("Pintle Heavy Stubber (+5pts)", 5, false, "pintle"),
    wargearOption("Pintle Heavy Flamer (+10pts)", 10, false, "pintle"),
    wargearOption("Pintle Multi-laser (+10pts)", 10, false, "pintle"),
    // Other
    wargearOption("Flare Shield (+10pts)", 10, false),
    wargearOption("Dozer Blade (+5pts)", 5, false),
  ],

  // ── SA ARMOUR ──
  leman_russ_strike_sa: [
    // Hull weapon (Auxilia Hull Weapons list)
    wargearOption("Hull Heavy Flamer (free, replaces heavy bolter)", 0, false, "hull"),
    wargearOption("Hull Multi-laser (free, replaces heavy bolter)", 0, false, "hull"),
    wargearOption("Hull Autocannon (+5pts)", 5, false, "hull"),
    wargearOption("Hull Lascannon (+10pts)", 10, false, "hull"),
    // Sponson weapons (Auxilia Sponson Weapons list)
    wargearOption("Sponsons: 2x Heavy Bolters (free)", 0, false, "sponson"),
    wargearOption("Sponsons: 2x Heavy Flamers (free)", 0, false, "sponson"),
    wargearOption("Sponsons: 2x Multi-lasers (free)", 0, false, "sponson"),
    wargearOption("Sponsons: 2x Autocannon (+10pts)", 10, false, "sponson"),
    wargearOption("Sponsons: 2x Lascannon (+20pts)", 20, false, "sponson"),
    // Pintle weapons (Auxilia Pintle Weapons list)
    wargearOption("Pintle Heavy Stubber (+5pts)", 5, false, "pintle"),
    wargearOption("Pintle Heavy Flamer (+10pts)", 10, false, "pintle"),
    wargearOption("Pintle Multi-laser (+10pts)", 10, false, "pintle"),
    // Other
    wargearOption("Dozer Blade (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  leman_russ_assault_sa: [
    // Hull weapon
    wargearOption("Hull Heavy Flamer (free, replaces heavy bolter)", 0, false, "hull"),
    wargearOption("Hull Multi-laser (free, replaces heavy bolter)", 0, false, "hull"),
    wargearOption("Hull Autocannon (+5pts)", 5, false, "hull"),
    wargearOption("Hull Lascannon (+10pts)", 10, false, "hull"),
    // Sponson weapons
    wargearOption("Sponsons: 2x Heavy Bolters (free)", 0, false, "sponson"),
    wargearOption("Sponsons: 2x Heavy Flamers (free)", 0, false, "sponson"),
    wargearOption("Sponsons: 2x Multi-lasers (free)", 0, false, "sponson"),
    wargearOption("Sponsons: 2x Autocannon (+10pts)", 10, false, "sponson"),
    wargearOption("Sponsons: 2x Lascannon (+20pts)", 20, false, "sponson"),
    // Pintle weapons
    wargearOption("Pintle Heavy Stubber (+5pts)", 5, false, "pintle"),
    wargearOption("Pintle Heavy Flamer (+10pts)", 10, false, "pintle"),
    wargearOption("Pintle Multi-laser (+10pts)", 10, false, "pintle"),
    // Other
    wargearOption("Dozer Blade (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],

  // ── SA LORD OF WAR ──
  malcador_sa: [
    // Main gun option (Battlecannon vs Twin Battlecannon variant)
    wargearOption("Twin Battlecannon (replaces battlecannon, +20pts)", 20, false, "main"),
    // Hull weapon
    wargearOption("Hull Heavy Flamer (free, replaces heavy bolter)", 0, false, "hull"),
    wargearOption("Hull Multi-laser (free, replaces heavy bolter)", 0, false, "hull"),
    wargearOption("Hull Autocannon (+5pts)", 5, false, "hull"),
    wargearOption("Hull Lascannon (+10pts)", 10, false, "hull"),
    // Sponson weapons
    wargearOption("Sponsons: 2x Heavy Bolters (free)", 0, false, "sponson"),
    wargearOption("Sponsons: 2x Heavy Flamers (free)", 0, false, "sponson"),
    wargearOption("Sponsons: 2x Lascannon (+20pts)", 20, false, "sponson"),
    // Pintle weapons
    wargearOption("Pintle Heavy Stubber (+5pts)", 5, false, "pintle"),
    wargearOption("Pintle Heavy Flamer (+10pts)", 10, false, "pintle"),
    wargearOption("Pintle Multi-laser (+10pts)", 10, false, "pintle"),
    // Other
    wargearOption("Dozer Blade (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  malcador_infernus_sa: [
    // Sponson weapons
    wargearOption("Sponsons: 2x Heavy Flamers (free)", 0, false, "sponson"),
    wargearOption("Sponsons: 2x Heavy Bolters (free)", 0, false, "sponson"),
    wargearOption("Sponsons: 2x Multi-lasers (free)", 0, false, "sponson"),
    wargearOption("Sponsons: 2x Lascannon (+20pts)", 20, false, "sponson"),
    // Pintle weapons
    wargearOption("Pintle Heavy Stubber (+5pts)", 5, false, "pintle"),
    wargearOption("Pintle Heavy Flamer (+10pts)", 10, false, "pintle"),
    wargearOption("Pintle Multi-laser (+10pts)", 10, false, "pintle"),
    // Other
    wargearOption("Dozer Blade (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  valdor_sa: [
    // Hull weapon
    wargearOption("Hull Heavy Flamer (free, replaces lascannon)", 0, false, "hull"),
    wargearOption("Hull Multi-laser (free, replaces lascannon)", 0, false, "hull"),
    wargearOption("Hull Autocannon (+5pts, replaces lascannon)", 5, false, "hull"),
    // Pintle weapons
    wargearOption("Pintle Heavy Stubber (+5pts)", 5, false, "pintle"),
    wargearOption("Pintle Heavy Flamer (+10pts)", 10, false, "pintle"),
    wargearOption("Pintle Multi-laser (+10pts)", 10, false, "pintle"),
    // Other
    wargearOption("Dozer Blade (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
  stormhammer_sa: [
    // Pintle weapons (multiple possible)
    wargearOption("Pintle Heavy Stubber (+5pts)", 5, false, "pintle"),
    wargearOption("Pintle Heavy Flamer (+10pts)", 10, false, "pintle"),
    wargearOption("Pintle Multi-laser (+10pts)", 10, false, "pintle"),
    // Other
    wargearOption("Dozer Blade (+5pts)", 5, false),
    wargearOption("Searchlights (+5pts)", 5, false),
  ],
};

