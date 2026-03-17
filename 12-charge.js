// Charge phase resolver, melee special rules, melee weapon profiles
// Lines 4393-5688 from shooting-resolver165.jsx

// ━━━ CHARGE PHASE RESOLVER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// WS comparison chart for melee To Hit
var WS_TO_HIT_CHART = {
  higher: 3,    // Attacker WS > Defender WS
  equal: 4,     // Attacker WS == Defender WS
  lower: 5,     // Attacker WS < Defender WS (but not half or less)
  halfOrLess: 5 // Attacker WS <= Defender WS / 2 (still 5+ in HH)
};

function getMeleeToHit(attackerWS, defenderWS) {
  if (attackerWS > defenderWS) return 3;
  if (attackerWS === defenderWS) return 4;
  return 5;
}

var MELEE_SPECIAL_RULES = [
  { id: "m_shred", label: "Shred", desc: "Re-roll failed To Wound rolls in melee" },
  { id: "m_rending", label: "Rending", desc: "To Wound of 6 is AP2 in melee" },
  { id: "m_murderous", label: "Murderous Strike", desc: "To Wound of 6 causes Instant Death" },
  { id: "m_unwieldy", label: "Unwieldy", desc: "Always strikes at Initiative 1" },
  { id: "m_specialist", label: "Specialist Weapon", desc: "+1A if paired with another Specialist Weapon" },
  { id: "m_brutal", label: "Brutal (X)", desc: "+1 to wound roll" },
  { id: "m_reaping", label: "Reaping Blow", desc: "Each model makes 1 extra attack against all models in base contact" },
  { id: "m_duelist", label: "Duelist's Edge", desc: "+1 Initiative in challenges" },
  { id: "m_rampage", label: "Rampage", desc: "+D3 attacks when outnumbered" },
  // ── Additional rules from rulebook ──
  { id: "m_aflame", label: "Aflame", desc: "Unsaved wounds force a Leadership check; model is 'Aflame' until End Phase, -X to Ld" },
  { id: "m_armourbane", label: "Armourbane", desc: "Glancing hits are treated as Penetrating hits against Vehicles" },
  { id: "m_breaching", label: "Breaching (4+)", desc: "To Wound of 4+ — if a wound is inflicted it becomes a Breaching Wound (AP 2, ignores saves)" },
  { id: "m_criticalHit", label: "Critical Hit (6+)", desc: "To Hit roll of 6 = auto-wound (no Wound roll) and inflicts +1 Damage" },
  { id: "m_deflagrate", label: "Deflagrate", desc: "Unsaved wounds generate additional hits equal to the number of unsaved wounds (S equal to Deflagrate X, AP '-', D1)" },
  { id: "m_eternalWarrior", label: "Eternal Warrior (X)", desc: "Reduces the Damage of each Unsaved Wound allocated to this model by X (minimum 1)" },
  { id: "m_fear", label: "Fear (X)", desc: "Enemy units within 12\" reduce Ld, Willpower, Cool, and Intelligence by X" },
  { id: "m_force", label: "Force", desc: "Willpower check before attacking — success doubles listed Characteristic; failure causes Perils of the Warp" },
  { id: "m_hatred", label: "Hatred (X)", desc: "+1 to all Wound Tests against the specified Faction, Type or Trait" },
  { id: "m_impact", label: "Impact (X)", desc: "On a successful Charge, +X to a Characteristic for all Melee Attacks that Assault Phase" },
  { id: "m_poisoned", label: "Poisoned (4+)", desc: "Wounds automatically on a 4+ regardless of Toughness (re-roll if S ≥ T)" },
  { id: "m_precision", label: "Precision Strikes", desc: "To Wound of 6 — attacker chooses which model in the target unit takes the wound" },
];

// Melee weapons keyed by unit id
// ws/i/a/w/t/sv/inv/fnp are the MODEL's base stats that get auto-filled
// s/ap/rules are the WEAPON stats
var MELEE_WEAPON_PROFILES = {
  // LEGIONES ASTARTES
  tactical: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Bayonet, Chain" },
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
    { name: "Combat Blade", ws: 4, s: 4, ap: "6", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Bayonet (Bolt)", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {  }, traits: "Bayonet" },
  ],
  tactical_support: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Bayonet, Chain" },
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
    { name: "Combat Blade", ws: 4, s: 4, ap: "6", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
  heavy_support: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Bayonet, Chain" },
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
  ],
  breacher: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Bayonet, Chain" },
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
    { name: "Boarding Shield + Blade", ws: 4, s: 4, ap: "-", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "6", fnp: "-", rules: {} },
  ],
  assault: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Bayonet, Chain" },
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Lightning Claw", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true, m_rending: true }, traits: "Power" },
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {  }, traits: "Power" },
  ],
  seeker: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Bayonet, Chain" },
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
  ],
  recon: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "4", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Bayonet, Chain" },
    { name: "Combat Blade", ws: 4, s: 4, ap: "6", i: 4, a: 1, w: 1, t: 4, sv: "4", inv: "-", fnp: "-", rules: {} },
  ],
  destroyer: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "5", rules: { m_shred: true }, traits: "Bayonet, Chain" },
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "5", rules: { m_shred: true }, traits: "Chain" },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "5", rules: { m_breaching6: true }, traits: "Power" },
  ],
  // ELITES
  veteran: [
    { name: "Chain Bayonet", ws: 5, s: 4, ap: "5", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Bayonet, Chain" },
    { name: "Bayonet (Bolt)", ws: 5, s: 4, ap: "5", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {  }, traits: "Bayonet" },
    { name: "Chainsword", ws: 5, s: 4, ap: "5", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Lightning Claw", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true, m_rending: true }, traits: "Power" },
    { name: "Power Axe", ws: 5, s: 5, ap: "2", i: 3, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching5: true }, traits: "Power" },
  ],
  praetor_pa: [
    { name: "Paragon Blade", ws: 6, s: 5, ap: "2", i: 5, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_criticalHit: true } },
    { name: "Power Fist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Thunder Hammer", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Chainfist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_armourbane: true, m_shred: true }, traits: "Chain" },
    { name: "Power Weapon", ws: 6, s: 4, ap: "3", i: 5, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Lightning Claw (pair)", ws: 6, s: 4, ap: "3", i: 5, a: 5, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_breaching6: true, m_rending: true }, traits: "Power" },
    { name: "Power Axe", ws: 6, s: 5, ap: "2", i: 4, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_breaching5: true }, traits: "Power" },
  ],
  praetor_ta: [
    { name: "Paragon Blade", ws: 6, s: 5, ap: "2", i: 5, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_criticalHit: true } },
    { name: "Power Fist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Chainfist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_armourbane: true, m_shred: true }, traits: "Chain" },
    { name: "Lightning Claw (pair)", ws: 6, s: 4, ap: "3", i: 5, a: 5, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_breaching6: true, m_rending: true }, traits: "Power" },
    { name: "Thunder Hammer", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Power Weapon", ws: 6, s: 4, ap: "3", i: 5, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
  ],
  praetor_sat: [
    { name: "Saturnine War Axe", ws: 6, s: 7, ap: "2", i: 4, a: 4, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_reapingBlow: true }, traits: "Power" },
    { name: "Saturnine Disruption Fist", ws: 6, s: 7, ap: "2", i: 2, a: 4, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Saturnine Concussion Hammer", ws: 6, s: 10, ap: "2", i: 1, a: 4, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_criticalHit: true }, traits: "Power" },
  ],
  champion: [
    { name: "Paragon Blade", ws: 6, s: 5, ap: "2", i: 5, a: 4, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_criticalHit: true } },
    { name: "Power Weapon", ws: 6, s: 4, ap: "3", i: 5, a: 4, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Fist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: {  }, traits: "Power" },
  ],
  master_signals: [
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: {  }, traits: "Power" },
  ],
  vigilator: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 3, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Dagger", ws: 5, s: 4, ap: "3", i: 5, a: 3, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: {} },
  ],
  forge_lord: [
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Power Axe", ws: 4, s: 5, ap: "2", i: 3, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_breaching5: true }, traits: "Power" },
    { name: "Servo-Arm", ws: 4, s: 8, ap: "1", i: 1, a: 1, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_unwieldy: true } },
  ],
  chaplain: [
    { name: "Crozius Arcanum", ws: 5, s: 6, ap: "3", i: 5, a: 3, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
  ],
  librarian: [
    { name: "Force Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Force Axe", ws: 4, s: 5, ap: "2", i: 3, a: 2, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_force: true }, traits: "Psychic" },
    { name: "Force Staff", ws: 4, s: 5, ap: "4", i: 4, a: 3, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_force: true }, traits: "Psychic" },
  ],
  herald: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 3, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: {  }, traits: "Power" },
  ],
  moritat: [
    { name: "Chain Glaive", ws: 5, s: 5, ap: "3", i: 4, a: 4, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_rending: true } },
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 4, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
  ],
  siege_breaker: [
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
  ],
  centurion: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 3, w: 3, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 3, t: 4, sv: "2", inv: "-", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Power Axe", ws: 5, s: 5, ap: "2", i: 3, a: 3, w: 3, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_breaching5: true }, traits: "Power" },
  ],
  apothecary: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "5", rules: { m_shred: true }, traits: "Bayonet, Chain" },
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "5", rules: { m_shred: true }, traits: "Chain" },
  ],
  // TERMINATORS
  cataphractii: [
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Chainfist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_armourbane: true, m_shred: true }, traits: "Chain" },
    { name: "Lightning Claw (pair)", ws: 4, s: 4, ap: "3", i: 4, a: 3, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_breaching6: true, m_rending: true }, traits: "Power" },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: {  }, traits: "Power" },
  ],
  tartaros: [
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Chainfist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_armourbane: true, m_shred: true }, traits: "Chain" },
    { name: "Lightning Claw (pair)", ws: 4, s: 4, ap: "3", i: 4, a: 3, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_breaching6: true, m_rending: true }, traits: "Power" },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: {  }, traits: "Power" },
  ],
  saturnine: [
    { name: "Saturnine Concussion Hammer", ws: 4, s: 10, ap: "2", i: 1, a: 2, w: 3, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_criticalHit: true }, traits: "Power" },
    { name: "Saturnine War Axe", ws: 4, s: 7, ap: "2", i: 4, a: 2, w: 3, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_reapingBlow: true }, traits: "Power" },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 3, t: 5, sv: "2", inv: "5", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Chainfist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 3, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_armourbane: true, m_shred: true }, traits: "Chain" },
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 3, t: 5, sv: "2", inv: "5", fnp: "-", rules: {  }, traits: "Power" },
  ],
  // VEHICLES & DREADS
  contemptor: [
    { name: "Dreadnought Close Combat Weapon", ws: 5, s: 7, ap: "2", i: 4, a: 4, w: 7, t: 7, sv: "2", inv: "5", fnp: "-", rules: {} },
    { name: "Chainfist", ws: 5, s: 7, ap: "2", i: 4, a: 4, w: 7, t: 7, sv: "2", inv: "5", fnp: "-", rules: { m_armourbane: true, m_shred: true }, traits: "Chain" },
    { name: "Graviton Ram", ws: 5, s: 8, ap: "1", i: 4, a: 4, w: 7, t: 7, sv: "2", inv: "5", fnp: "-", rules: {} },
  ],
  saturnine_dread: [
    { name: "Dreadnought Power Fist", ws: 5, s: 8, ap: "2", i: 4, a: 4, w: 9, t: 8, sv: "2", inv: "5", fnp: "-", rules: {} },
  ],
  leviathan: [
    { name: "Leviathan Siege Drill", ws: 5, s: 10, ap: "2", i: 4, a: 4, w: 8, t: 8, sv: "2", inv: "4", fnp: "-", rules: { m_armourbane: true } },
    { name: "Leviathan Siege Claw", ws: 5, s: 8, ap: "2", i: 4, a: 4, w: 8, t: 8, sv: "2", inv: "4", fnp: "-", rules: {  } },
  ],
  // SOLAR AUXILIA
  lasrifle: [
    { name: "Close Combat Weapon", ws: 2, s: 3, ap: "-", i: 3, a: 1, w: 1, t: 3, sv: "4", inv: "-", fnp: "-", rules: {} },
  ],
  veletaris: [
    { name: "Power Axe", ws: 3, s: 4, ap: "2", i: 2, a: 1, w: 1, t: 3, sv: "4", inv: "-", fnp: "-", rules: { m_breaching5: true }, traits: "Power" },
    { name: "Close Combat Weapon", ws: 3, s: 3, ap: "-", i: 3, a: 1, w: 1, t: 3, sv: "4", inv: "-", fnp: "-", rules: {} },
  ],
  ogryn: [
    { name: "Ogryn Charonite Claws", ws: 4, s: 6, ap: "3", i: 3, a: 3, w: 3, t: 5, sv: "4", inv: "-", fnp: "5", rules: { m_shred: true } },
  ],
  // MECHANICUM
  thallax: [
    { name: "Lightning Claws", ws: 3, s: 5, ap: "5", i: 3, a: 2, w: 2, t: 5, sv: "4", inv: "-", fnp: "5", rules: { m_rending: true } },
  ],
  castellax: [
    { name: "Shock Chargers (pair)", ws: 4, s: 6, ap: "3", i: 3, a: 3, w: 4, t: 7, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Siege Wrecker", ws: 4, s: 8, ap: "2", i: 3, a: 2, w: 4, t: 7, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Power Blade Array", ws: 4, s: 6, ap: "3", i: 3, a: 4, w: 4, t: 7, sv: "3", inv: "-", fnp: "-", rules: { m_rending: true } },
  ],
  thanatar: [
    { name: "Thanatar Fists", ws: 3, s: 8, ap: "2", i: 2, a: 2, w: 6, t: 8, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
  tech_thrall: [
    { name: "Close Combat Weapon", ws: 2, s: 3, ap: "-", i: 3, a: 1, w: 1, t: 3, sv: "5", inv: "-", fnp: "6", rules: {} },
  ],
  myrmidon_dest: [
    { name: "Power Weapon", ws: 4, s: 5, ap: "3", i: 3, a: 2, w: 3, t: 5, sv: "2", inv: "-", fnp: "5", rules: { m_breaching6: true }, traits: "Power" },
  ],
  vorax: [
    { name: "Vorax Power Blades", ws: 4, s: 5, ap: "3", i: 4, a: 4, w: 4, t: 6, sv: "3", inv: "-", fnp: "-", rules: { m_rending: true } },
  ],
  // CUSTODES
  custodian_guard: [
    { name: "Guardian Spear", ws: 5, s: 6, ap: "2", i: 5, a: 3, w: 3, t: 5, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Sentinel Blade + Shield", ws: 5, s: 5, ap: "3", i: 5, a: 3, w: 3, t: 5, sv: "2", inv: "3", fnp: "-", rules: {} },
  ],
  sagittarum: [
    { name: "Guardian Spear", ws: 5, s: 6, ap: "2", i: 5, a: 3, w: 3, t: 5, sv: "2", inv: "5", fnp: "-", rules: {} },
  ],
  aquilon: [
    { name: "Solerite Power Gauntlet", ws: 5, s: 10, ap: "1", i: 5, a: 4, w: 4, t: 6, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Solerite Power Talon", ws: 5, s: 6, ap: "2", i: 5, a: 5, w: 4, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true } },
  ],
  // PRIMARCHS (LOYALIST)
  lion: [
    { name: "Lion Sword", ws: 9, s: 7, ap: "2", i: 7, a: 6, w: 8, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
    { name: "Wolf Blade", ws: 9, s: 6, ap: "2", i: 7, a: 6, w: 8, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true, m_rending: true } },
  ],
  khan: [
    { name: "White Tiger Dao", ws: 8, s: 7, ap: "2", i: 7, a: 6, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
  ],
  russ: [
    { name: "Sword of Balenight", ws: 8, s: 7, ap: "2", i: 6, a: 7, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
    { name: "The Axe of Helwinter", ws: 8, s: 8, ap: "2", i: 5, a: 7, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true } },
  ],
  dorn: [
    { name: "Storm's Teeth (Chainsword)", ws: 8, s: 8, ap: "2", i: 5, a: 6, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true } },
    { name: "Auric Fist (Power Fist)", ws: 8, s: 10, ap: "1", i: 1, a: 6, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true } },
  ],
  sanguinius: [
    { name: "The Blade Encarmine", ws: 9, s: 7, ap: "2", i: 7, a: 7, w: 8, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
    { name: "The Spear of Telesto", ws: 9, s: 8, ap: "1", i: 6, a: 6, w: 8, t: 6, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Moonsilver Blade", ws: 9, s: 6, ap: "2", i: 7, a: 7, w: 8, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
  ],
  ferrus: [
    { name: "Forgebreaker", ws: 7, s: 10, ap: "1", i: 5, a: 5, w: 8, t: 7, sv: "2", inv: "3", fnp: "-", rules: { m_murderous: true } },
    { name: "Medusan Fists", ws: 7, s: 8, ap: "2", i: 5, a: 5, w: 8, t: 7, sv: "2", inv: "3", fnp: "-", rules: {} },
  ],
  guilliman: [
    { name: "The Gladius Incandor", ws: 7, s: 6, ap: "2", i: 6, a: 6, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
    { name: "Hand of Dominion (Fist)", ws: 7, s: 10, ap: "1", i: 1, a: 6, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true } },
  ],
  vulkan: [
    { name: "Dawnbringer", ws: 7, s: 10, ap: "1", i: 5, a: 5, w: 9, t: 7, sv: "2", inv: "3", fnp: "-", rules: { m_murderous: true } },
  ],
  corax: [
    { name: "Raven's Talons (pair)", ws: 8, s: 6, ap: "2", i: 7, a: 7, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true, m_rending: true } },
    { name: "Sable's Edge", ws: 8, s: 7, ap: "2", i: 6, a: 6, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
  ],
  // PRIMARCHS (TRAITOR)
  fulgrim: [
    { name: "Fireblade (Sword)", ws: 9, s: 6, ap: "2", i: 8, a: 7, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
    { name: "Laer Blade", ws: 9, s: 7, ap: "2", i: 8, a: 7, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_rending: true } },
  ],
  perturabo: [
    { name: "Forgebreaker", ws: 7, s: 10, ap: "1", i: 5, a: 5, w: 8, t: 7, sv: "2", inv: "3", fnp: "-", rules: { m_murderous: true } },
    { name: "Logos (Melee)", ws: 7, s: 8, ap: "2", i: 5, a: 5, w: 8, t: 7, sv: "2", inv: "3", fnp: "-", rules: {} },
  ],
  curze: [
    { name: "Mercy & Forgiveness (Claws)", ws: 8, s: 6, ap: "2", i: 7, a: 7, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true, m_rending: true } },
  ],
  angron: [
    { name: "Gorefather & Gorechild", ws: 9, s: 8, ap: "2", i: 6, a: 8, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true } },
    { name: "Spite Furnace (Fists)", ws: 9, s: 7, ap: "2", i: 6, a: 8, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: {} },
  ],
  lorgar: [
    { name: "Illuminarum (Crozius)", ws: 7, s: 7, ap: "2", i: 6, a: 5, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Illuminarum (Force)", ws: 7, s: 7, ap: "2", i: 6, a: 5, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
  ],
  mortarion: [
    { name: "Silence (Scythe)", ws: 7, s: 8, ap: "2", i: 5, a: 5, w: 9, t: 7, sv: "2", inv: "4", fnp: "5", rules: { m_murderous: true } },
    { name: "The Lantern (Melee)", ws: 7, s: 7, ap: "2", i: 5, a: 5, w: 9, t: 7, sv: "2", inv: "4", fnp: "5", rules: {} },
  ],
  magnus: [
    { name: "Akhenteru (Force Staff)", ws: 7, s: 8, ap: "1", i: 6, a: 5, w: 7, t: 6, sv: "2", inv: "3", fnp: "-", rules: { m_murderous: true } },
    { name: "Psychic Blades", ws: 7, s: 6, ap: "2", i: 6, a: 6, w: 7, t: 6, sv: "2", inv: "3", fnp: "-", rules: {} },
  ],
  horus: [
    { name: "Worldbreaker (Mace)", ws: 8, s: 10, ap: "1", i: 6, a: 6, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
    { name: "Talon of Horus (Claw)", ws: 8, s: 7, ap: "2", i: 7, a: 7, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true } },
  ],
  alpharius: [
    { name: "The Pale Spear", ws: 7, s: 7, ap: "1", i: 6, a: 6, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
  ],
  daemon_lesser: [
    { name: "Warp Claws", ws: 3, s: 4, ap: "-", i: 4, a: 2, w: 1, t: 4, sv: "-", inv: "5", fnp: "-", rules: {} },
  ],
  daemon_greater: [
    { name: "Daemon Weapon", ws: 6, s: 7, ap: "2", i: 6, a: 5, w: 6, t: 6, sv: "-", inv: "4", fnp: "-", rules: { m_murderous: true } },
  ],
  // FAST ATTACK
  scimitar_jetbike: [
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
  ],
  javelin: [
    { name: "Close Combat Attack", ws: 4, s: 4, ap: "-", i: 4, a: 2, w: 4, t: 6, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
  land_speeder: [
    { name: "Close Combat Attack", ws: 4, s: 4, ap: "-", i: 4, a: 2, w: 3, t: 5, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
  // ── COMMAND (missing melee) ──
  optae: [
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", rules: {  }, traits: "Power" },
  ],
  centurion_ta: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 3, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Lightning Claw (pair)", ws: 5, s: 4, ap: "3", i: 4, a: 3, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_rending: true, m_breaching6: true }, traits: "Power" },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Chainfist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_armourbane: true, m_shred: true }, traits: "Chain" },
    { name: "Thunder Hammer", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: {  }, traits: "Power" },
  ],
  esoterist: [
    { name: "Force Weapon", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", rules: {  }, traits: "Psychic" },
  ],
  praevian: [
    { name: "Close Combat Weapon", ws: 4, s: 4, ap: "-", i: 4, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "5", rules: {  } },
  ],
  overseer: [
    { name: "Power Lash", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Power Maul", ws: 4, s: 6, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
  ],
  techmarine: [
    { name: "Power Axe", ws: 4, s: 5, ap: "2", i: 3, a: 2, w: 1, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_breaching5: true }, traits: "Power" },
    { name: "Servo-arm", ws: 4, s: 8, ap: "2", i: 1, a: 1, w: 1, t: 4, sv: "2", inv: "-", fnp: "-", rules: {  }, traits: "" },
  ],
  despoiler: [
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
    { name: "Heavy Chainsword", ws: 4, s: 6, ap: "4", i: 3, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain", defaultModels: 2 },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power", defaultModels: 2 },
    { name: "Charnabal Sabre", ws: 4, s: 4, ap: "-", i: 5, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Charnabal", defaultModels: 2 },
  ],
  veteran_assault: [
    { name: "Chainsword", ws: 5, s: 4, ap: "5", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Heavy Chainaxe", ws: 5, s: 7, ap: "4", i: 3, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain", defaultModels: 2 },
    { name: "Heavy Chainsword", ws: 5, s: 6, ap: "4", i: 3, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain", defaultModels: 2 },
    { name: "Lightning Claw (pair)", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_rending: true, m_breaching6: true }, traits: "Power" },
  ],
  // ── RETINUE (Command Squads) ──
  praetorian_cmd: [
    { name: "Close Combat Weapon", ws: 5, s: 4, ap: "-", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {  } },
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Lightning Claw (pair)", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_rending: true, m_breaching6: true }, traits: "Power" },
  ],
  praetorian_cmd_jp: [
    { name: "Close Combat Weapon", ws: 5, s: 4, ap: "-", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {  } },
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Lightning Claw (pair)", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_rending: true, m_breaching6: true }, traits: "Power" },
  ],
  centurion_cmd: [
    { name: "Close Combat Weapon", ws: 5, s: 4, ap: "-", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {  } },
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Lightning Claw (pair)", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_rending: true, m_breaching6: true }, traits: "Power" },
  ],
  tartaros_cmd: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Lightning Claw", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_rending: true, m_breaching6: true }, traits: "Power" },
    { name: "Lightning Claw (pair)", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_rending: true, m_breaching6: true }, traits: "Power" },
  ],
  cataphractii_cmd: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_breaching6: true }, traits: "Power" },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Chainfist", ws: 5, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_armourbane: true, m_shred: true }, traits: "Chain" },
    { name: "Thunder Hammer", ws: 5, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: {  }, traits: "Power" },
    { name: "Lightning Claw (pair)", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_rending: true, m_breaching6: true }, traits: "Power" },
  ],
  // ── RECON ──
  outrider: [
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true }, traits: "Chain" },
    { name: "Astartes Shotgun (melee)", ws: 4, s: 4, ap: "-", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { stun: true } },
  ],
  // ─── LEGION NAMED CHARACTERS ───
  // I: Dark Angels
  corswain: [
    { name: "Power Sword", ws: 5, s: 4, ap: "3", i: 5, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  marduk_sedras: [
    { name: "Power Sword", ws: 5, s: 4, ap: "3", i: 5, a: 4, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 5, s: 9, ap: "2", i: 1, a: 4, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  // I: Dark Angels Squads
  deathsworn: [
    { name: "Power Scythe", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", ld: 8, rules: { m_shred: true } },
  ],
  inner_circle_knight: [
    { name: "Power Sword", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 8, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 8, rules: {} },
  ],
  // III: Emperor's Children
  eidolon: [
    { name: "Thunder Hammer", ws: 6, s: 9, ap: "2", i: 1, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_concussive: true } },
    { name: "Power Fist", ws: 6, s: 8, ap: "2", i: 1, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
    { name: "Sonic Shrieker (melee)", ws: 6, s: 5, ap: "3", i: 6, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  lucius: [
    { name: "Laeran Blade", ws: 7, s: 4, ap: "2", i: 7, a: 3, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_rending: true, m_shred: true } },
  ],
  saul_tarvitz: [
    { name: "Power Sword", ws: 5, s: 4, ap: "3", i: 5, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_breaching6: true } },
  ],
  palatine_blade: [
    { name: "Blades of the Palatine", ws: 5, s: 4, ap: "3", i: 5, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", ld: 8, rules: { m_shred: true, m_rending: true } },
    { name: "Power Sword", ws: 5, s: 4, ap: "3", i: 5, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", ld: 8, rules: { m_breaching6: true } },
  ],
  pyroclast: [
    { name: "Pyroclast Nozzle", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", ld: 8, rules: {} },
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", ld: 8, rules: { m_shred: true } },
  ],
  // IV: Iron Warriors
  warsmith: [
    { name: "Chainfist", ws: 5, s: 9, ap: "2", i: 1, a: 4, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_armourbane: true } },
    { name: "Power Fist", ws: 5, s: 9, ap: "2", i: 1, a: 4, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
    { name: "Power Weapon", ws: 5, s: 5, ap: "3", i: 5, a: 4, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_breaching6: true } },
  ],
  // V: White Scars
  qin_xa: [
    { name: "Master-Crafted Dao (Lance on charge)", ws: 5, s: 5, ap: "3", i: 5, a: 3, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true } },
    { name: "Power Fist", ws: 5, s: 9, ap: "2", i: 1, a: 3, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  hibou_khan: [
    { name: "Tulwar Blade", ws: 5, s: 4, ap: "3", i: 5, a: 3, w: 3, t: 4, sv: "2", inv: "5", fnp: "-", ld: 10, rules: { m_shred: true } },
  ],
  stormseer: [
    { name: "Force Staff", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 3, t: 4, sv: "2", inv: "5", fnp: "-", ld: 8, rules: {} },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 3, t: 4, sv: "2", inv: "5", fnp: "-", ld: 8, rules: { m_breaching6: true } },
  ],
  keshig_rider: [
    { name: "Power Lance (charge)", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", ld: 8, rules: {} },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", ld: 8, rules: { m_breaching6: true } },
  ],
  kharash: [
    { name: "Keshig Pole-Arm", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", ld: 10, rules: {} },
    { name: "Power Fist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", ld: 10, rules: {} },
  ],
  // VI: Space Wolves
  hvarl: [
    { name: "Relic Axe", ws: 6, s: 7, ap: "2", i: 4, a: 4, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true } },
    { name: "Power Fist", ws: 6, s: 9, ap: "2", i: 1, a: 4, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  geigor: [
    { name: "Power Axe", ws: 5, s: 5, ap: "3", i: 4, a: 3, w: 3, t: 4, sv: "2", inv: "5", fnp: "-", ld: 10, rules: {} },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 3, t: 4, sv: "2", inv: "5", fnp: "-", ld: 10, rules: {} },
  ],
  caster_of_runes: [
    { name: "Runic Axe", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 3, t: 4, sv: "2", inv: "5", fnp: "-", ld: 8, rules: {} },
    { name: "Force Sword", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 3, t: 4, sv: "2", inv: "5", fnp: "-", ld: 8, rules: { m_breaching6: true } },
  ],
  varagyr: [
    { name: "Two-Handed Axe", ws: 4, s: 6, ap: "2", i: 3, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_shred: true } },
    { name: "Power Fist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 9, rules: {} },
    { name: "Lightning Claw (pair)", ws: 4, s: 5, ap: "3", i: 4, a: 3, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_rending: true, m_shred: true } },
  ],
  // VII: Imperial Fists
  sigismund: [
    { name: "Black Sword", ws: 6, s: 5, ap: "2", i: 5, a: 4, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true, m_breaching4: true } },
    { name: "Power Fist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  fafnir_rann: [
    { name: "Twin Seax Blades", ws: 6, s: 5, ap: "3", i: 5, a: 4, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_shred: true, m_rending: true } },
  ],
  evander_garrius: [
    { name: "Power Weapon", ws: 5, s: 5, ap: "3", i: 5, a: 3, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 5, s: 9, ap: "2", i: 1, a: 3, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  camba_diaz: [
    { name: "Power Sword", ws: 5, s: 4, ap: "3", i: 5, a: 2, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 2, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: {} },
  ],
  alexis_polux: [
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: {} },
    { name: "Power Sword", ws: 5, s: 4, ap: "3", i: 5, a: 3, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_breaching6: true } },
  ],
  templar_brethren: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 5, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", ld: 8, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", ld: 8, rules: {} },
  ],
  phalanx_warder: [
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "5", fnp: "-", ld: 7, rules: { m_breaching6: true } },
    { name: "Combat Blade", ws: 4, s: 4, ap: "6", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "5", fnp: "-", ld: 7, rules: {} },
  ],
  // VIII: Night Lords
  sevatar: [
    { name: "Paragon Blade", ws: 6, s: 4, ap: "2", i: 6, a: 4, w: 5, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true, m_rending: true } },
    { name: "Chainglaive", ws: 6, s: 5, ap: "3", i: 5, a: 4, w: 5, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true } },
  ],
  contekar: [
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", ld: 8, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", ld: 8, rules: {} },
    { name: "Lightning Claw (pair)", ws: 4, s: 5, ap: "3", i: 4, a: 3, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", ld: 8, rules: { m_rending: true, m_shred: true } },
  ],
  executioner_nl: [
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_shred: true } },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_breaching6: true } },
  ],
  night_raptor: [
    { name: "Lightning Claws (pair)", ws: 4, s: 4, ap: "3", i: 5, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_rending: true, m_shred: true } },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 5, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_breaching6: true } },
  ],
  // IX: Blood Angels
  raldoron: [
    { name: "Chapter Master Blade", ws: 6, s: 5, ap: "2", i: 5, a: 4, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true } },
    { name: "Power Fist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  dom_zephon: [
    { name: "Two Power Glaives", ws: 6, s: 5, ap: "3", i: 6, a: 4, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true } },
    { name: "Power Fist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  aster_crohne: [
    { name: "Power Sword", ws: 5, s: 4, ap: "3", i: 5, a: 2, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_breaching6: true } },
  ],
  crimson_paladin: [
    { name: "Power Spear (charge: AP2)", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 8, rules: { m_shred: true } },
    { name: "Power Fist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 8, rules: {} },
  ],
  dawnbreaker: [
    { name: "Power Axe", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", ld: 8, rules: {} },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", ld: 8, rules: {} },
  ],
  erelim: [
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", ld: 7, rules: { m_shred: true } },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", ld: 7, rules: { m_breaching6: true } },
  ],
  // X: Iron Hands
  shadrak_meduson: [
    { name: "Power Axe", ws: 5, s: 5, ap: "3", i: 4, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  iron_father: [
    { name: "Power Axe", ws: 5, s: 5, ap: "3", i: 4, a: 4, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
    { name: "Power Fist", ws: 5, s: 9, ap: "2", i: 1, a: 4, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
    { name: "Mechadendrite (bonus attack)", ws: 5, s: 5, ap: "4", i: 3, a: 2, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  gorgon_term: [
    { name: "Power Fist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", ld: 8, rules: {} },
    { name: "Lightning Claw (pair)", ws: 4, s: 5, ap: "3", i: 4, a: 3, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", ld: 8, rules: { m_rending: true, m_shred: true } },
    { name: "Chainfist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", ld: 8, rules: { m_armourbane: true } },
  ],
  immortal_ih: [
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "5", fnp: "-", ld: 8, rules: { m_shred: true } },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "5", fnp: "-", ld: 8, rules: { m_breaching6: true } },
  ],
  // XII: World Eaters
  kharn: [
    { name: "Gorechild (Chainaxe)", ws: 7, s: 5, ap: "3", i: 5, a: 4, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true, m_rending: true } },
    { name: "Power Fist", ws: 7, s: 8, ap: "2", i: 1, a: 4, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  lotara_sarrin: [
    { name: "Boarding Pistol", ws: 3, s: 3, ap: "6", i: 3, a: 1, w: 2, t: 3, sv: "6", inv: "5", fnp: "-", ld: 9, rules: {} },
  ],
  red_butcher: [
    { name: "Chainaxe (pair)", ws: 4, s: 5, ap: "4", i: 4, a: 3, w: 2, t: 5, sv: "2", inv: "4", fnp: "5", ld: 12, rules: { m_shred: true, m_rending: true } },
    { name: "Power Fist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "5", ld: 12, rules: {} },
    { name: "Lightning Claws (pair)", ws: 4, s: 5, ap: "3", i: 4, a: 3, w: 2, t: 5, sv: "2", inv: "4", fnp: "5", ld: 12, rules: { m_rending: true, m_shred: true } },
  ],
  rampager: [
    { name: "Chainaxe", ws: 4, s: 5, ap: "4", i: 4, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_shred: true } },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: {} },
  ],
  // XIII: Ultramarines
  remus_ventanus: [
    { name: "Power Sword", ws: 5, s: 4, ap: "3", i: 5, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  invictarus_suz: [
    { name: "Suzerain Blade", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "2", inv: "5", fnp: "-", ld: 9, rules: { m_breaching6: true, m_shred: true } },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 4, sv: "2", inv: "5", fnp: "-", ld: 9, rules: {} },
  ],
  praetorian_um: [
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 1, w: 2, t: 4, sv: "3", inv: "5", fnp: "-", ld: 7, rules: { m_breaching6: true } },
    { name: "Combat Blade", ws: 4, s: 4, ap: "6", i: 4, a: 1, w: 2, t: 4, sv: "3", inv: "5", fnp: "-", ld: 7, rules: {} },
  ],
  // XIV: Death Guard
  calas_typhon: [
    { name: "Scythe of Silence", ws: 6, s: 6, ap: "2", i: 4, a: 4, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true, m_poisoned2: true } },
    { name: "Force Sword", ws: 6, s: 5, ap: "3", i: 4, a: 4, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_breaching6: true } },
  ],
  deathshroud: [
    { name: "Silence (Great Scythe)", ws: 4, s: 6, ap: "2", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", ld: 10, rules: { m_shred: true, m_poisoned2: true } },
  ],
  grave_warden: [
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 8, rules: { m_breaching6: true } },
    { name: "Chainfist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 8, rules: { m_armourbane: true } },
  ],
  // XV: Thousand Sons
  ahriman: [
    { name: "Black Staff of Ahriman", ws: 5, s: 6, ap: "2", i: 5, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true, m_force: true } },
    { name: "Force Sword", ws: 5, s: 5, ap: "3", i: 5, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_breaching6: true, m_force: true } },
  ],
  magistus_amon: [
    { name: "Force Sword", ws: 5, s: 5, ap: "3", i: 5, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_breaching6: true, m_force: true } },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: {} },
  ],
  prosperine_sorc: [
    { name: "Force Sword", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 3, t: 4, sv: "2", inv: "5", fnp: "-", ld: 8, rules: { m_breaching6: true, m_force: true } },
  ],
  sekhmet: [
    { name: "Khopesh Blade", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 8, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 8, rules: {} },
  ],
  khenetai_blade: [
    { name: "Khenetai Blade (pair)", ws: 5, s: 4, ap: "3", i: 6, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_shred: true, m_rending: true } },
  ],
  // XVI: Sons of Horus
  ezekyle_abaddon: [
    { name: "Talon of Horus", ws: 6, s: 5, ap: "2", i: 5, a: 5, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true, m_rending: true } },
    { name: "Power Fist (Talon)", ws: 6, s: 9, ap: "2", i: 1, a: 5, w: 5, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  little_horus: [
    { name: "Power Sword", ws: 6, s: 5, ap: "2", i: 5, a: 4, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true } },
    { name: "Power Fist", ws: 6, s: 9, ap: "2", i: 1, a: 4, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  tybalt_marr: [
    { name: "Power Sword", ws: 5, s: 4, ap: "3", i: 5, a: 3, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_breaching6: true } },
  ],
  vheren_ash: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 5, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: {} },
  ],
  garviel_loken: [
    { name: "Power Sword", ws: 5, s: 4, ap: "3", i: 5, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 9, rules: {} },
  ],
  maloghurst: [
    { name: "Power Maul", ws: 5, s: 5, ap: "4", i: 4, a: 4, w: 5, t: 4, sv: "2", inv: "5", fnp: "-", ld: 10, rules: { m_concussive: true } },
    { name: "Power Sword", ws: 5, s: 4, ap: "3", i: 5, a: 4, w: 5, t: 4, sv: "2", inv: "5", fnp: "-", ld: 10, rules: { m_breaching6: true } },
  ],
  dark_emissary: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 5, a: 3, w: 4, t: 4, sv: "2", inv: "5", fnp: "-", ld: 10, rules: { m_breaching6: true } },
  ],
  justaerin: [
    { name: "Power Axe", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
    { name: "Power Fist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
    { name: "Lightning Claw (pair)", ws: 4, s: 5, ap: "3", i: 4, a: 3, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_rending: true, m_shred: true } },
  ],
  reaver_soh: [
    { name: "Chainaxe", ws: 4, s: 5, ap: "4", i: 4, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_shred: true } },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_breaching6: true } },
  ],
  // XVII: Word Bearers
  kor_phaeron: [
    { name: "Black Crozius", ws: 4, s: 5, ap: "4", i: 3, a: 2, w: 3, t: 3, sv: "2", inv: "5", fnp: "-", ld: 10, rules: { m_concussive: true, m_shred: true } },
    { name: "Power Fist", ws: 4, s: 7, ap: "2", i: 1, a: 2, w: 3, t: 3, sv: "2", inv: "5", fnp: "-", ld: 10, rules: {} },
  ],
  erebus: [
    { name: "Mhara Sorcerous Staff", ws: 5, s: 5, ap: "3", i: 5, a: 2, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_force: true } },
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 5, a: 2, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_breaching6: true } },
  ],
  argel_tal: [
    { name: "Crimson Sabre", ws: 6, s: 6, ap: "2", i: 6, a: 5, w: 6, t: 5, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_shred: true, m_rending: true } },
    { name: "Power Fist", ws: 6, s: 10, ap: "2", i: 1, a: 5, w: 6, t: 5, sv: "2", inv: "4", fnp: "-", ld: 9, rules: {} },
  ],
  zardu_layak: [
    { name: "Anakatis Blades (pair)", ws: 5, s: 5, ap: "3", i: 5, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 11, rules: { m_shred: true } },
    { name: "Force Sword", ws: 5, s: 5, ap: "3", i: 5, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 11, rules: { m_breaching6: true, m_force: true } },
  ],
  dark_brethren: [
    { name: "Corrupted Power Weapon", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 3, t: 5, sv: "3", inv: "-", fnp: "-", ld: 9, rules: { m_shred: true } },
    { name: "Power Fist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 3, t: 5, sv: "3", inv: "-", fnp: "-", ld: 9, rules: {} },
  ],
  anakatis_kul: [
    { name: "Daemon Blade", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 3, t: 5, sv: "3", inv: "-", fnp: "-", ld: 10, rules: { m_shred: true, m_rending: true } },
  ],
  incendiary_wb: [
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_shred: true } },
    { name: "Combat Blade", ws: 4, s: 4, ap: "6", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: {} },
  ],
  // XVIII: Salamanders
  firedrake: [
    { name: "Thunder Hammer", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_concussive: true } },
    { name: "Power Fist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 9, rules: {} },
    { name: "Lightning Claw (pair)", ws: 4, s: 5, ap: "3", i: 4, a: 3, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 9, rules: { m_rending: true, m_shred: true } },
  ],
  // XIX: Raven Guard
  kaedes_nex: [
    { name: "Whispering Blades (pair)", ws: 6, s: 4, ap: "3", i: 7, a: 2, w: 3, t: 4, sv: "3", inv: "5", fnp: "-", ld: 9, rules: { m_shred: true, m_rending: true } },
  ],
  mor_deythan: [
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_breaching6: true } },
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_shred: true } },
  ],
  dark_fury_rg: [
    { name: "Rending Claws (pair)", ws: 4, s: 4, ap: "3", i: 5, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_rending: true } },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 5, a: 2, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_breaching6: true } },
  ],
  // XX: Alpha Legion
  armillus_dynat: [
    { name: "Master-Crafted Power Weapon", ws: 5, s: 5, ap: "3", i: 5, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: { m_shred: true, m_breaching6: true } },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 4, t: 4, sv: "2", inv: "4", fnp: "-", ld: 10, rules: {} },
  ],
  saboteur: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 5, a: 2, w: 3, t: 4, sv: "2", inv: "5", fnp: "-", ld: 8, rules: { m_breaching6: true } },
    { name: "Chainsword", ws: 5, s: 4, ap: "5", i: 5, a: 2, w: 3, t: 4, sv: "2", inv: "5", fnp: "-", ld: 8, rules: { m_shred: true } },
  ],
  exodus_al: [
    { name: "Combat Blade", ws: 5, s: 4, ap: "5", i: 5, a: 2, w: 3, t: 4, sv: "3", inv: "5", fnp: "-", ld: 9, rules: {} },
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 5, a: 2, w: 3, t: 4, sv: "3", inv: "5", fnp: "-", ld: 9, rules: { m_breaching6: true } },
  ],
  headhunter: [
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_breaching6: true } },
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", ld: 8, rules: { m_shred: true } },
  ],
  lernaean: [
    { name: "Power Weapon", ws: 4, s: 5, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 8, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", ld: 8, rules: {} },
  ],
  phoenix_term: [
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", ld: 8, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 4, s: 9, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", ld: 8, rules: {} },
    { name: "Lightning Claw (pair)", ws: 4, s: 5, ap: "3", i: 4, a: 3, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", ld: 8, rules: { m_rending: true, m_shred: true } },
  ],
  grey_slayer: [
    { name: "Chainsword", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", ld: 7, rules: { m_shred: true } },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", ld: 7, rules: { m_breaching6: true } },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", ld: 7, rules: {} },
  ],
  // War Engines / Vehicles (Walker melee)
  contemp_incaendius: [
    { name: "Dreadnought Close Combat Weapon", ws: 4, s: 7, ap: "2", i: 4, a: 4, w: 7, t: 7, sv: "2", inv: "5", fnp: "-", ld: 10, rules: {} },
    { name: "Chainfist", ws: 4, s: 7, ap: "2", i: 1, a: 4, w: 7, t: 7, sv: "2", inv: "5", fnp: "-", ld: 10, rules: { m_armourbane: true, m_shred: true } },
  ],
  contemp_osiron: [
    { name: "Dreadnought Close Combat Weapon", ws: 4, s: 7, ap: "2", i: 4, a: 4, w: 6, t: 7, sv: "2", inv: "5", fnp: "-", ld: 10, rules: {} },
    { name: "Chainfist", ws: 4, s: 7, ap: "2", i: 1, a: 4, w: 6, t: 7, sv: "2", inv: "5", fnp: "-", ld: 10, rules: { m_armourbane: true } },
  ],
  domitar_ferrum: [
    { name: "Power Maul", ws: 4, s: 8, ap: "3", i: 3, a: 3, w: 4, t: 7, sv: "2", inv: "5", fnp: "-", ld: 8, rules: { m_concussive: true } },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 3, w: 4, t: 7, sv: "2", inv: "5", fnp: "-", ld: 8, rules: {} },
  ],
  castellax_achea: [
    { name: "Power Fist", ws: 3, s: 6, ap: "2", i: 3, a: 2, w: 3, t: 6, sv: "3", inv: "5", fnp: "-", ld: 12, rules: {} },
  ],
  mhara_gal: [
    { name: "Warp-corrupted Fist", ws: 5, s: 8, ap: "2", i: 4, a: 4, w: 7, t: 7, sv: "2", inv: "5", fnp: "-", ld: 12, rules: { m_shred: true, m_rending: true } },
    { name: "Chainfist", ws: 5, s: 8, ap: "2", i: 1, a: 4, w: 7, t: 7, sv: "2", inv: "5", fnp: "-", ld: 12, rules: { m_armourbane: true } },
  ],
  kyzagan: [
    { name: "Hull Strike", ws: 3, s: 6, ap: "4", i: 3, a: 1, w: 4, t: 7, sv: "3", inv: "-", fnp: "-", ld: 8, rules: {} },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEGION-SPECIFIC MELEE WEAPONS (from Liber Loyalist / Liber Hereticus Armoury)
// Keys match LEGION_FACTIONS ids. Each entry lists units that can take the weapon
// and the weapon profile. Units: command/champion/sergeant/centurion eligible per rules.
// Stats: ws/s/ap/i/a/w/t/sv/inv/fnp/rules/traits — base stats filled from unit profile.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var LEGION_MELEE_WEAPONS = {
  dark_angels: [
    // Calibanite warblade: Command/Champion/Sergeant, IM+0, AM:A, SM:+1, AP:3, D:1, Breaching(5+), Sword of the Order
    { name: "Calibanite Warblade", sm: 1, ap: "3", d: 1, rules: { m_breaching5: true }, traits: "Power, Sword of the Order",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald","moritat","vigilator"],
      note: "Command/Champion/Sergeant Sub-Type. Replaces power sword. +5pts." },
    // Terranic greatsword: Command/Champion, IM:-1, AM:A, SM:+2, AP:3, D:2, Breaching(5+), Sword of the Order
    { name: "Terranic Greatsword", im: -1, sm: 2, ap: "3", d: 2, rules: { m_breaching5: true }, traits: "Power, Sword of the Order",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "Command/Champion Sub-Type only. Replaces power fist. Free." },
  ],
  white_scars: [
    // Power glaive: Command, IM:+1, AM:A, SM:+1, AP:3, D:1, Impact(AP), Breaching(5+)
    { name: "Power Glaive", im: 1, sm: 1, ap: "3", d: 1, rules: { m_breaching5: true, m_impact: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion"],
      note: "Command Sub-Type only. Replaces power weapon. +10pts." },
  ],
  space_wolves: [
    // Fenrisian axe: Any model with chainsword, IM:+1, AM:A, SM:+1, AP:-, D:1, Reaping Blow(1)
    { name: "Fenrisian Axe", im: 1, sm: 1, ap: "-", d: 1, rules: { m_reapingBlow: true }, traits: "None",
      eligibleUnits: ["tactical","assault","veteran","praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Any model with Space Wolves Trait. Replaces chainsword. +2pts." },
    // Frost sword: Command/Champion, IM:+0, AM:A, SM:S, AP:3, D:1, Breaching(5+), Reaping Blow(1)
    { name: "Frost Sword", im: 1, sm: 0, ap: "3", d: 1, rules: { m_breaching5: true, m_reapingBlow: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "Command/Champion. Replaces power weapon. +5pts." },
    // Frost axe: Command/Champion, IM:-1, AM:A, SM:+1, AP:3, D:1, Breaching(4+), Reaping Blow(1)
    { name: "Frost Axe", im: -1, sm: 1, ap: "3", d: 1, rules: { m_breaching4: true, m_reapingBlow: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "Command/Champion. Replaces power weapon. +5pts." },
    // Frost claw: Command/Champion, IM:+0, AM:A, SM:S, AP:3, D:1, Breaching(4+), Reaping Blow(1), Shred(6+)
    { name: "Frost Claw", im: 1, sm: 0, ap: "3", d: 1, rules: { m_breaching4: true, m_reapingBlow: true, m_shred: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "Command/Champion. Replaces lightning claw. +5pts." },
    // Great frost blade: Command/Champion, IM:-2, AM:A, SM:+3, AP:2, D:2, Reaping Blow(1)
    { name: "Great Frost Blade", im: -2, sm: 3, ap: "2", d: 2, rules: { m_reapingBlow: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "Command/Champion Sub-Type only. Replaces power weapon. +10pts." },
  ],
  imperial_fists: [
    // Solarite power gauntlet: Command/Champion/Sergeant, IM:-3, AM:A, SM:+4, AP:2, D:2, Critical Hit(6+)
    { name: "Solarite Power Gauntlet", im: -3, sm: 4, ap: "2", d: 2, rules: { m_criticalHit: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Command/Champion/Sergeant. Replaces power fist. +5pts." },
  ],
  blood_angels: [
    // Blade of Perdition: Command/Champion/Sergeant, IM:+1, AM:A, SM:S, AP:3, D:1, Breaching(6+), Aflame(1)
    { name: "Blade of Perdition", im: 1, sm: 0, ap: "3", d: 1, rules: { m_breaching6: true, m_aflame: true }, traits: "Power, Flame",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Command/Champion/Sergeant. Replaces power sword/axe/spear/maul. +5pts." },
    // Axe of Perdition: IM:-1, AM:A, SM:+1, AP:3, D:1, Breaching(5+), Aflame(1)
    { name: "Axe of Perdition", im: -1, sm: 1, ap: "3", d: 1, rules: { m_breaching5: true, m_aflame: true }, traits: "Power, Flame",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Command/Champion/Sergeant. Replaces power sword/axe/spear/maul. +5pts." },
    // Maul of Perdition: IM:-1, AM:A, SM:+2, AP:3, D:1, Breaching(6+), Aflame(1)
    { name: "Maul of Perdition", im: -1, sm: 2, ap: "3", d: 1, rules: { m_breaching6: true, m_aflame: true }, traits: "Power, Flame",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Command/Champion/Sergeant. Replaces power sword/axe/spear/maul. +5pts." },
    // Spear of Perdition: IM:+1, AM:A, SM:S, AP:3, D:1, Precision(6+), Aflame(1)
    { name: "Spear of Perdition", im: 1, sm: 0, ap: "3", d: 1, rules: { m_precision: true, m_aflame: true }, traits: "Power, Flame",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Command/Champion/Sergeant. Replaces power sword/axe/spear/maul. +5pts." },
  ],
  ultramarines: [
    // Legatine axe: Command/Champion/Sergeant, IM:+1, AM:A, SM:+1, AP:3, D:1, Breaching(4+)
    { name: "Legatine Axe", im: 1, sm: 1, ap: "3", d: 1, rules: { m_breaching4: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Command/Champion/Sergeant. Replaces power axe. +5pts." },
  ],
  raven_guard: [
    // Raven's Talon: Command, IM:+1, AM:A, SM:S, AP:3, D:1, Impact(IM), Rending(6+), Breaching(6+)
    { name: "Raven's Talon", im: 1, sm: 0, ap: "3", d: 1, rules: { m_impact: true, m_rending: true, m_breaching6: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "Command. Replaces lightning claw. Free." },
    // Pair of Raven's Talons: Command, IM:+1, AM:+2, SM:S, AP:3, D:1, Impact(IM), Rending(6+), Breaching(6+)
    { name: "Pair of Raven's Talons", im: 1, amBonus: 2, sm: 0, ap: "3", d: 1, rules: { m_impact: true, m_rending: true, m_breaching6: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "Command (pair of lightning claws). Free." },
  ],
  emperors_children: [
    // Phoenix power spear: Command/Champion/Sergeant, IM:+1, AM:A, SM:+1, AP:3, D:1, Impact(D), Breaching(6+)
    { name: "Phoenix Power Spear", im: 1, sm: 1, ap: "3", d: 1, rules: { m_impact: true, m_breaching6: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Command/Champion/Sergeant. Replaces power weapon. +10pts." },
  ],
  iron_warriors: [
    // Graviton crusher: Command/Champion, IM:-2, AM:A, SM:+4, AP:2, D:2, Armourbane, Shock(Pinned)
    { name: "Graviton Crusher", im: -2, sm: 4, ap: "2", d: 2, rules: { m_armourbane: true, m_shock: true }, traits: "Graviton",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "Command/Champion. Replaces thunder hammer. Free." },
  ],
  night_lords: [
    // Chainglaive: Command/Champion/Sergeant, IM:+1, AM:A, SM:+1, AP:3, D:1, Breaching(6+), Shred(6+)
    { name: "Chainglaive", im: 1, sm: 1, ap: "3", d: 1, rules: { m_breaching6: true, m_shred: true }, traits: "Chain",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Command/Champion/Sergeant. Replaces power weapon. +5pts." },
    // Headsman's axe: Command only, IM:-2, AM:A, SM:+2, AP:2, D:2, Critical Hit(6+)
    { name: "Headsman's Axe", im: -2, sm: 2, ap: "2", d: 2, rules: { m_criticalHit: true }, traits: "Chain",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion"],
      note: "Command Sub-Type only. Replaces power weapon. +10pts." },
  ],
  world_eaters: [
    // Meteor hammer: IM:+1, AM:-1, SM:+2, AP:3, D:2, Impact(IM)
    { name: "Meteor Hammer", im: 1, amPenalty: -1, sm: 2, ap: "3", d: 2, rules: { m_impact: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Caedere weapon. +5pts (if model has Caedere weapon option)." },
    // Excoriator chainaxe: IM:-2, AM:A, SM:+2, AP:3, D:1, Breaching(6+), Shred(6+)
    { name: "Excoriator Chainaxe", im: -2, sm: 2, ap: "3", d: 1, rules: { m_breaching6: true, m_shred: true }, traits: "Chain",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Caedere weapon." },
    // Paired falax blades: IM:+1, AM:+2, SM:S, AP:3, D:1, —
    { name: "Paired Falax Blades", im: 1, amBonus: 2, sm: 0, ap: "3", d: 1, rules: {}, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Caedere weapon." },
    // Barb-hook lash: IM:+1, AM:A, SM:S, AP:3, D:1, Critical Hit(6+), Phage(S)
    { name: "Barb-Hook Lash", im: 1, sm: 0, ap: "3", d: 1, rules: { m_criticalHit: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Caedere weapon. Phage(S) special rule." },
  ],
  death_guard: [
    // Power scythe: Command/Champion/Specialist/Sergeant, IM:-1, AM:A, SM:+1, AP:3, D:1, Reaping Blow(2), Breaching(5+)
    { name: "Power Scythe", im: -1, sm: 1, ap: "3", d: 1, rules: { m_reapingBlow: true, m_breaching5: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Command/Champion/Specialist/Sergeant. Replaces power weapon (+10pts) or power fist (+5pts)." },
  ],
  thousand_sons: [
    // Achea pattern force sword: Command/Champion, IM:+1, AM:A, SM:+1, AP:3, D:1, Breaching(5+)
    { name: "Achea Pattern Force Sword", im: 1, sm: 1, ap: "3", d: 1, rules: { m_breaching5: true }, traits: "Psychic",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "Command/Champion. Replaces power weapon. +5pts." },
  ],
  sons_of_horus: [
    // Carsoran power axe: Any model, IM:-1, AM:A, SM:+1, AP:3, D:1, Breaching(5+), Shred(6+)
    { name: "Carsoran Power Axe", im: -1, sm: 1, ap: "3", d: 1, rules: { m_breaching5: true, m_shred: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","veteran","assault","herald"],
      note: "Any model with SoH Trait. Replaces power axe. +5pts." },
    // Carsoran power tabar: Any model, IM:-2, AM:A, SM:+2, AP:3, D:1, Breaching(5+), Shred(5+)
    { name: "Carsoran Power Tabar", im: -2, sm: 2, ap: "3", d: 1, rules: { m_breaching5: true, m_shred: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","veteran","assault","herald"],
      note: "Any model with SoH Trait. Replaces power axe. +10pts." },
  ],
  alpha_legion: [
    // Power dagger: Command/Champion/Sergeant, IM:+2, AM:A, SM:-1, AP:3, D:1, Breaching(5+)
    { name: "Power Dagger", im: 2, sm: -1, ap: "3", d: 1, rules: { m_breaching5: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "Command/Champion/Sergeant. Replaces power weapon. Free." },
  ],
  iron_hands: [
    // Artificer power axe: Command/Champion, IM:-1, AM:A, SM:+1, AP:3, D:1, Breaching(5+), Shred(5+)
    { name: "Artificer Power Axe", im: -1, sm: 1, ap: "3", d: 1, rules: { m_breaching5: true, m_shred5: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "IH Trait. Any model. Power axe upgrade." },
  ],
  salamanders: [
    // Forge-crafted power sword: IM:+1, AM:A, SM:S, AP:3, D:1, Breaching(6+)
    { name: "Forge-crafted Power Sword", im: 1, sm: 0, ap: "3", d: 1, rules: { m_breaching6: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "SAL Trait Cmd/Champ/Spec/Sgt. Replaces power weapon. +5pts." },
    // Forge-crafted power axe: IM:-1, AM:A, SM:+1, AP:3, D:1, Breaching(5+)
    { name: "Forge-crafted Power Axe", im: -1, sm: 1, ap: "3", d: 1, rules: { m_breaching5: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "SAL Trait Cmd/Champ/Spec/Sgt. Replaces power weapon. +5pts." },
    // Forge-crafted power maul: IM:-1, AM:A, SM:+2, AP:3, D:1, Breaching(6+)
    { name: "Forge-crafted Power Maul", im: -1, sm: 2, ap: "3", d: 1, rules: { m_breaching6: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "SAL Trait Cmd/Champ/Spec/Sgt. Replaces power weapon. +5pts." },
    // Forge-crafted power lance: IM:+1, AM:A, SM:S, AP:3, D:1, Precision(6+)
    { name: "Forge-crafted Power Lance", im: 1, sm: 0, ap: "3", d: 1, rules: { m_precision: true }, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "SAL Trait Cmd/Champ/Spec/Sgt. Replaces power weapon. +5pts." },
    // Forge-crafted power fist: IM:-3, AM:A, SM:+4, AP:2, D:3
    { name: "Forge-crafted Power Fist", im: -3, sm: 4, ap: "2", d: 3, rules: {}, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "SAL Trait Cmd/Champ/Spec/Sgt. Replaces power fist. +10pts." },
    // Forge-crafted thunder hammer: IM:-2, AM:A, SM:+3, AP:2, D:2
    { name: "Forge-crafted Thunder Hammer", im: -2, sm: 3, ap: "2", d: 2, rules: {}, traits: "Power",
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "SAL Trait Cmd/Champ/Spec/Sgt. Replaces thunder hammer. +10pts." },
  ],
};

// Legion-specific RANGED weapons (field format matches WEAPON_PROFILES: shots/s/ap/damage/type/traits/rules)
var LEGION_RANGED_WEAPONS = {
  dark_angels: [
    { name: "Plasma Burner (Sustained)", shots: 1, s: 5, ap: "4", damage: 1, type: "Assault", traits: "Plasma",
      rules: { template: true, breaching6: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "DA Trait. Template weapon." },
    { name: "Plasma Burner (Maximal)", shots: 1, s: 6, ap: "4", damage: 1, type: "Assault", traits: "Plasma",
      rules: { template: true, breaching5: true, overload: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "DA Trait. Template weapon." },
    { name: "Plasma Incinerator (Sustained)", shots: 1, s: 5, ap: "4", damage: 2, type: "Assault", traits: "Plasma",
      rules: { template: true, breaching6: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "DA Trait. Template weapon." },
    { name: "Plasma Incinerator (Maximal)", shots: 1, s: 6, ap: "4", damage: 2, type: "Assault", traits: "Plasma",
      rules: { template: true, breaching5: true, overload: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "DA Trait. Template weapon." },
  ],
  blood_angels: [
    { name: "Inferno Pistol", shots: 1, s: 8, ap: "2", damage: 1, type: "Pistol", traits: "Assault, Melta",
      rules: { melta: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","assault","herald"],
      note: "BA Trait. Replaces plasma pistol. +5pts." },
  ],
  emperors_children: [
    { name: "Sonic Lance", shots: 1, s: 2, ap: "5", damage: 1, type: "Assault", traits: "Sonic, Assault",
      rules: { template: true, breaching6: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "EC Trait Command/Champion. Sonic lance wargear. +10pts." },
  ],
  sons_of_horus: [
    { name: "Banestrike Bolter", shots: 2, s: 4, ap: "4", damage: 1, type: "Rapid Fire", traits: "Bolt",
      rules: { breaching6: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","veteran","seeker"],
      note: "SoH Trait. Command/Champion (+5pts), Veterans (+5pts/mdl), Seekers (free)." },
    { name: "Banestrike Combi-Bolter", shots: 4, s: 4, ap: "4", damage: 1, type: "Rapid Fire", traits: "Bolt",
      rules: { breaching6: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "SoH Trait Command/Champion. Replaces combi-bolter. +5pts." },
    // Banestrike Bolt Cannon: Decurion Lanius upgrade — pintle mounted on Predator/Kratos/Sicaran
    { name: "Banestrike Bolt Cannon", shots: 4, s: 6, ap: "4", damage: 2, type: "Heavy", traits: "Bolt",
      rules: { breaching6: true }, isLegion: true,
      eligibleUnits: ["predator","kratos","sicaran"],
      note: "SoH Trait. Decurion Lanius upgrade. Pintle mounted. Predator +25pts, Kratos +30pts, Sicaran +25pts." },
  ],
  alpha_legion: [
    { name: "Venom Spheres", shots: 1, s: 1, ap: "-", damage: 1, type: "Assault", traits: "Assault",
      rules: { blast: true, poisoned4: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "AL Trait Command/Champion. Blast (3in). +5pts." },
  ],
  iron_hands: [
    // Graviton pistol: R:12, FP:2, RS:6, AP:4, D:1, Pistol+Breaching(6+)+Shock(Pinned)+Pinning(1)
    { name: "Graviton Pistol", shots: 2, s: 6, ap: "4", damage: 1, type: "Pistol", traits: "Assault, Graviton",
      rules: { breaching6: true, shock: true, pinning: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion"],
      note: "IH Trait Command/Champion. Replaces plasma pistol. +5pts." },
  ],
  salamanders: [
    // Forge-crafted hand flamer: Template, FP:1, RS:3, AP:-, D:2, Template+Pistol, Flame+Assault
    { name: "Forge-crafted Hand Flamer", shots: 1, s: 3, ap: "-", damage: 2, type: "Pistol", traits: "Flame, Assault",
      rules: { template: true, pistol: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "SAL Trait Sergeant Sub-Type. Replaces hand flamer. +5pts." },
    // Forge-crafted flamer: Template, FP:1, RS:4, AP:5, D:2, Template+Panic(1), Flame
    { name: "Forge-crafted Flamer", shots: 1, s: 4, ap: "5", damage: 2, type: "Assault", traits: "Flame",
      rules: { template: true, panic1: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "SAL Trait Sergeant Sub-Type. Replaces flamer. +10pts." },
    // Forge-crafted heavy flamer: Template, FP:1, RS:5, AP:5, D:2, Template+Panic(2), Flame
    { name: "Forge-crafted Heavy Flamer", shots: 1, s: 5, ap: "5", damage: 2, type: "Assault", traits: "Flame",
      rules: { template: true, panic2: true }, isLegion: true,
      eligibleUnits: ["praetor_pa","praetor_ta","centurion","champion","herald"],
      note: "SAL Trait Sergeant Sub-Type. Replaces heavy flamer. +10pts." },
  ],
};


// ━━━ SET-UP MOVE DISTANCE TABLE (Reference Card p.253) ━━━━━━━━━━━━━━━━━━━━━━━
// Add Initiative + Movement, look up the table for Set-Up Move distance
function getSetUpMove(initiative, movement) {
  const iM = (parseInt(initiative) || 0) + (parseInt(movement) || 0);
  if (iM <= 6)  return 1;
  if (iM <= 9)  return 2;
  if (iM <= 11) return 3;
  if (iM <= 13) return 4;
  if (iM <= 19) return 5;
  return 6; // 20+
}

function resolveChargePhase(params) {
  const {
    chargeDistance, chargingModels,
    terrain, disordered,
    // Charger volley fire (Assault weapons, snap shots 6+)
    doVolleyFire, aSelectedRanged, volleyFireShots, volleyFireS, volleyFireAP,
    aVolleyModels, aSecondaryRanged,
    aAssaultSgtEnabled, aAssaultSgtRanged, // sergeant ranged weapon (assault trait)
    // Target for volley fire
    defenderT, defenderSv, defenderInv, defenderFnp, defenderW,
    // Defender volley fire (Assault weapons, snap shots 6+)
    doDefVolleyFire, dSelectedRanged, defVolleyFireShots, defVolleyFireS, defVolleyFireAP,
    dVolleyModels, dSecondaryRanged_volley,
    dAssaultSgtEnabled_volley, dAssaultSgtRanged, // defender sgt ranged (assault trait)
    // Charger stats for incoming fire saves
    chargerT, chargerSv, chargerInv, chargerFnp, chargerW,
    // Defender overwatch (ANY ranged weapon, normal BS)
    doOverwatch, overwatchBS, dOverwatchWeapon, dOverwatchSecondary,
    dOverwatchModels,
    dAssaultSgtEnabled_ow, dSgtRanged_ow, // defender sgt ranged for overwatch (any weapon)
  } = params;

  const log = [];
  const rolls = { charge: [], volley: { hit: [], wound: [], save: [] }, defVolley: { hit: [], wound: [], save: [] }, overwatch: { hit: [], wound: [], save: [] } };

  // Helper: resolve a shooting group → { casualties, log entries, rolls }
  function resolveFireGroup(label, phase, weaponGroups, targetT, targetSv, targetInv, targetFnp, targetW, hitNeeded, useBSHit) {
    // weaponGroups: [{ name, shots, s, ap, damage, models, rules }]
    let totalCasualties = 0;
    const groupLog = [];
    const groupRolls = { hit: [], wound: [], save: [] };

    weaponGroups.forEach(g => {
      if (!g || g.models <= 0 || g.shots <= 0) return;
      const totalShots = g.models * g.shots;
      const hitThreshold = useBSHit || hitNeeded;
      groupLog.push({ phase, text: `${g.name}: ${g.models} model(s) × ${g.shots} shot(s) = ${totalShots} shots (hit on ${hitThreshold}+)` });

      const hitRolls = rollD6s(totalShots);
      const hitResults = hitRolls.map(r => ({ value: r, success: r >= hitThreshold }));
      groupRolls.hit.push(...hitResults);
      const hits = hitRolls.filter(r => r >= hitThreshold).length;
      groupLog.push({ phase, text: `→ ${hits} hit(s) from ${totalShots} shots` });

      if (hits > 0) {
        const woundNeeded = getWoundRoll(g.s, targetT);
        if (woundNeeded !== null) {
          const woundRolls = rollD6s(hits);
          const woundResults = woundRolls.map(r => ({ value: r, success: r >= woundNeeded }));
          groupRolls.wound.push(...woundResults);
          let wounds = woundRolls.filter(r => r >= woundNeeded).length;

          // Breaching: improve AP on qualifying wound rolls
          const bReach = g.rules?.breaching3 ? 3 : g.rules?.breaching ? 4 : g.rules?.breaching5 ? 5 : g.rules?.breaching6 ? 6 : 0;
          let breachedWounds = 0;
          if (bReach > 0) {
            breachedWounds = woundRolls.filter(r => r >= bReach && r >= woundNeeded).length;
          }

          groupLog.push({ phase, text: `→ S${g.s} vs T${targetT} (${woundNeeded}+): ${wounds} wound(s)${breachedWounds > 0 ? ` (${breachedWounds} Breaching)` : ""}` });

          if (wounds > 0) {
            // Determine save: AP negates armour, check inv
            const svN = targetSv !== "-" ? parseInt(targetSv) : null;
            const invN = targetInv !== "-" ? parseInt(targetInv) : null;
            const apNum = g.ap !== "-" ? parseInt(g.ap) : null;
            // Breaching AP improvement: -2 AP (min 2)
            let effectiveAP = apNum;
            if (breachedWounds > 0 && effectiveAP !== null) {
              effectiveAP = Math.max(effectiveAP - 2, 2);
            }

            // Resolve breached and non-breached wounds separately if different APs
            const woundBatches = [];
            if (breachedWounds > 0 && breachedWounds < wounds) {
              woundBatches.push({ count: wounds - breachedWounds, ap: apNum, label: "normal" });
              woundBatches.push({ count: breachedWounds, ap: effectiveAP, label: "breaching" });
            } else if (breachedWounds > 0) {
              woundBatches.push({ count: wounds, ap: effectiveAP, label: "breaching" });
            } else {
              woundBatches.push({ count: wounds, ap: apNum, label: "normal" });
            }

            let batchUnsaved = 0;
            woundBatches.forEach(batch => {
              let bestSave = null;
              const armNeg = batch.ap !== null && svN !== null && batch.ap <= svN;
              if (!armNeg && svN) bestSave = svN;
              if (invN) bestSave = bestSave ? Math.min(bestSave, invN) : invN;

              if (bestSave && bestSave <= 6) {
                const saveRolls = rollD6s(batch.count);
                const saveResults = saveRolls.map(r => ({ value: r, success: r >= bestSave }));
                groupRolls.save.push(...saveResults);
                const saved = saveRolls.filter(r => r >= bestSave).length;
                batchUnsaved += batch.count - saved;
                groupLog.push({ phase, text: `→ ${batch.label !== "normal" ? "Breaching " : ""}Save ${bestSave}+: ${saved} saved, ${batch.count - saved} unsaved` });
              } else {
                batchUnsaved += batch.count;
                groupRolls.save.push(...Array(batch.count).fill({ value: 0, success: false }));
                groupLog.push({ phase, text: `→ ${batch.label !== "normal" ? "Breaching " : ""}No save — ${batch.count} unsaved` });
              }
            });

            // FNP
            if (targetFnp && targetFnp !== "-" && batchUnsaved > 0) {
              const fnpN = parseInt(targetFnp);
              if (fnpN <= 6) {
                const fnpRolls = rollD6s(batchUnsaved);
                const fnpSaved = fnpRolls.filter(r => r >= fnpN).length;
                batchUnsaved -= fnpSaved;
                groupLog.push({ phase, text: `→ FNP ${fnpN}+: ${fnpSaved} saved → ${batchUnsaved} final wound(s)` });
              }
            }

            const tw = targetW || 1;
            const killed = tw > 1 ? Math.floor(batchUnsaved / tw) : batchUnsaved;
            totalCasualties += killed;
            if (tw > 1 && batchUnsaved > 0) {
              groupLog.push({ phase, text: `→ ${batchUnsaved} wound(s) vs ${tw}W → ${killed} model(s) slain` });
            }
          }
        } else {
          groupLog.push({ phase, text: `→ S${g.s} cannot wound T${targetT}!` });
        }
      }
    });

    return { casualties: totalCasualties, log: groupLog, rolls: groupRolls };
  }

  // ━━ STEP 1: Declare Charge ━━
  log.push({ phase: "Charge", text: `Declaring charge against target ${chargeDistance}" away` });
  if (terrain) log.push({ phase: "Charge", text: `⚠ Charging through Difficult Terrain — subtract 2" from charge roll` });
  if (disordered) log.push({ phase: "Charge", text: `⚠ Disordered Charge — charging unit loses +1A bonus` });

  // ━━ STEP 2: Charger Volley Fire (Assault weapons, snap shots 6+) ━━
  let volleyCasualties = 0;
  if (doVolleyFire && (aSelectedRanged || (aAssaultSgtEnabled && aAssaultSgtRanged))) {
    log.push({ phase: "Volley Fire", text: `🔫 Charger Volley Fire! (Assault weapons — Snap Shots 6+)` });
    const groups = [];
    const primaryModels = aVolleyModels || chargingModels;
    const sgtModels = (aAssaultSgtEnabled && aAssaultSgtRanged) ? 1 : 0;
    if (aSelectedRanged) {
      groups.push({ name: aSelectedRanged.name, shots: volleyFireShots, s: parseInt(volleyFireS), ap: volleyFireAP, damage: aSelectedRanged.damage || 1, models: Math.max(primaryModels - sgtModels, 0), rules: aSelectedRanged.rules || {} });
    }
    // Sergeant
    if (sgtModels > 0 && aAssaultSgtRanged) {
      groups.push({ name: `Sgt: ${aAssaultSgtRanged.name}`, shots: aAssaultSgtRanged.shots, s: aAssaultSgtRanged.s, ap: aAssaultSgtRanged.ap, damage: aAssaultSgtRanged.damage || 1, models: 1, rules: aAssaultSgtRanged.rules || {} });
    }
    // Additional weapons
    if (aSecondaryRanged) {
      aSecondaryRanged.forEach(sw => {
        if (sw.weapon) groups.push({ name: sw.weapon.name, shots: sw.weapon.shots, s: sw.weapon.s, ap: sw.weapon.ap, damage: sw.weapon.damage || 1, models: sw.models, rules: sw.weapon.rules || {} });
      });
    }
    const vfResult = resolveFireGroup("Charger Volley", "Volley Fire", groups, defenderT, defenderSv, defenderInv, defenderFnp, defenderW, 6, null);
    volleyCasualties = vfResult.casualties;
    log.push(...vfResult.log);
    rolls.volley = vfResult.rolls;
    log.push({ phase: "Volley Fire", text: volleyCasualties > 0 ? `🔫 ${volleyCasualties} model(s) slain by Charger Volley Fire!` : `Charger Volley Fire inflicts no casualties.` });
  }

  const remainingDefenders = Math.max((params.defenderModels || params.dModels || 10) - volleyCasualties, 0);

  // ━━ STEP 3: Defender Volley Fire (Assault weapons, snap shots 6+) ━━
  let defVolleyCasualties = 0;
  if (doDefVolleyFire && (dSelectedRanged || (dAssaultSgtEnabled_volley && dAssaultSgtRanged)) && remainingDefenders > 0) {
    log.push({ phase: "Def Volley", text: `🔫 Defender Volley Fire! (Assault weapons — Snap Shots 6+)` });
    const groups = [];
    const primaryModels = Math.min(dVolleyModels || remainingDefenders, remainingDefenders);
    const sgtModels = (dAssaultSgtEnabled_volley && dAssaultSgtRanged) ? 1 : 0;
    if (dSelectedRanged) {
      groups.push({ name: dSelectedRanged.name, shots: defVolleyFireShots, s: parseInt(defVolleyFireS), ap: defVolleyFireAP, damage: dSelectedRanged.damage || 1, models: Math.max(primaryModels - sgtModels, 0), rules: dSelectedRanged.rules || {} });
    }
    // Sergeant
    if (sgtModels > 0 && dAssaultSgtRanged) {
      groups.push({ name: `Sgt: ${dAssaultSgtRanged.name}`, shots: dAssaultSgtRanged.shots, s: dAssaultSgtRanged.s, ap: dAssaultSgtRanged.ap, damage: dAssaultSgtRanged.damage || 1, models: 1, rules: dAssaultSgtRanged.rules || {} });
    }
    // Additional weapons
    if (dSecondaryRanged_volley) {
      dSecondaryRanged_volley.forEach(sw => {
        if (sw.weapon) groups.push({ name: sw.weapon.name, shots: sw.weapon.shots, s: sw.weapon.s, ap: sw.weapon.ap, damage: sw.weapon.damage || 1, models: sw.models, rules: sw.weapon.rules || {} });
      });
    }
    const dvResult = resolveFireGroup("Def Volley", "Def Volley", groups, chargerT, chargerSv, chargerInv, chargerFnp, chargerW, 6, null);
    defVolleyCasualties = dvResult.casualties;
    log.push(...dvResult.log);
    rolls.defVolley = dvResult.rolls;
    log.push({ phase: "Def Volley", text: defVolleyCasualties > 0 ? `🔫 ${defVolleyCasualties} charger(s) slain by Defender Volley Fire!` : `Defender Volley Fire inflicts no casualties.` });
  }

  const remainingChargers = Math.max(chargingModels - defVolleyCasualties, 0);

  // ━━ STEP 4: Defender Overwatch (ANY ranged weapon, normal BS) ━━
  let overwatchCasualties = 0;
  if (doOverwatch && (dOverwatchWeapon || (dAssaultSgtEnabled_ow && dSgtRanged_ow)) && remainingDefenders > 0) {
    const owHitNeeded = BS_TO_HIT[overwatchBS] || 4;
    log.push({ phase: "Overwatch", text: `🔥 Defender Overwatch! (Normal BS${overwatchBS} → ${owHitNeeded}+)` });
    const groups = [];
    const primaryModels = Math.min(dOverwatchModels || remainingDefenders, remainingDefenders);
    const sgtModels = (dAssaultSgtEnabled_ow && dSgtRanged_ow) ? 1 : 0;
    if (dOverwatchWeapon) {
      groups.push({ name: dOverwatchWeapon.name, shots: dOverwatchWeapon.shots, s: dOverwatchWeapon.s, ap: dOverwatchWeapon.ap, damage: dOverwatchWeapon.damage || 1, models: Math.max(primaryModels - sgtModels, 0), rules: dOverwatchWeapon.rules || {} });
    }
    // Sergeant
    if (sgtModels > 0 && dSgtRanged_ow) {
      groups.push({ name: `Sgt: ${dSgtRanged_ow.name}`, shots: dSgtRanged_ow.shots, s: dSgtRanged_ow.s, ap: dSgtRanged_ow.ap, damage: dSgtRanged_ow.damage || 1, models: 1, rules: dSgtRanged_ow.rules || {} });
    }
    // Additional weapons
    if (dOverwatchSecondary) {
      dOverwatchSecondary.forEach(sw => {
        if (sw.weapon) groups.push({ name: sw.weapon.name, shots: sw.weapon.shots, s: sw.weapon.s, ap: sw.weapon.ap, damage: sw.weapon.damage || 1, models: sw.models, rules: sw.weapon.rules || {} });
      });
    }
    const owResult = resolveFireGroup("Overwatch", "Overwatch", groups, chargerT, chargerSv, chargerInv, chargerFnp, chargerW, owHitNeeded, null);
    overwatchCasualties = owResult.casualties;
    log.push(...owResult.log);
    rolls.overwatch = owResult.rolls;
    log.push({ phase: "Overwatch", text: overwatchCasualties > 0 ? `☠ ${overwatchCasualties} charger(s) slain by Overwatch!` : `Overwatch inflicts no casualties.` });
  }

  const survivingChargers = Math.max(remainingChargers - overwatchCasualties, 0);
  if (survivingChargers === 0 && (doVolleyFire || doDefVolleyFire || doOverwatch)) {
    log.push({ phase: "Charge", text: `All charging models slain! Charge fails.` });
    return { log, rolls, chargeSucceeded: false, chargeRoll: 0, overwatchCasualties, volleyCasualties, defVolleyCasualties, survivingChargers: 0 };
  }

  // ━━ STEP 5: Set-Up Move + Charge Move Roll ━━
  // Set-Up Move = look up I+M on the table (p.253)
  const setUpMove = getSetUpMove(params.chargerI || 4, params.chargerMov || 6);
  // Charge Move = roll a D6
  const chargeDice = rollD6s(1);
  const chargeMoveDie = chargeDice[0];
  rolls.charge = chargeDice;
  const totalChargeMove = setUpMove + chargeMoveDie;
  let effectiveCharge = totalChargeMove;
  if (terrain) effectiveCharge = Math.max(totalChargeMove - 2, 0);
  log.push({ phase: "Charge", text: `I(${params.chargerI||4}) + M(${params.chargerMov||6}) = ${(params.chargerI||4)+(params.chargerMov||6)} → Set-Up Move: ${setUpMove}"` });
  log.push({ phase: "Charge", text: `Charge Move die: ${chargeMoveDie}" → Total: ${setUpMove}" + ${chargeMoveDie}" = ${totalChargeMove}"${terrain ? ` - 2" (terrain) = ${effectiveCharge}"` : ""}` });
  const chargeSucceeded = effectiveCharge >= chargeDistance;

  if (!chargeSucceeded) {
    log.push({ phase: "Charge", text: `❌ Charge FAILED! Needed ${chargeDistance}", moved ${effectiveCharge}". Unit advances ${effectiveCharge}" toward target.` });
    return { log, rolls, chargeSucceeded: false, chargeRoll: effectiveCharge, setUpMove, chargeMoveDie, totalChargeMove, overwatchCasualties, volleyCasualties, defVolleyCasualties, survivingChargers };
  }

  log.push({ phase: "Charge", text: `✅ Charge SUCCEEDED! ${effectiveCharge}" ≥ ${chargeDistance}" needed.` });
  log.push({ phase: "Charge", text: `${survivingChargers} charger(s) reach combat against ${remainingDefenders} defender(s).` });

  return { log, rolls, chargeSucceeded: true, chargeRoll: effectiveCharge, overwatchCasualties, volleyCasualties, defVolleyCasualties, survivingChargers, remainingDefenders };
}
  
