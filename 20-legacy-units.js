// Legacy units and rules from Legacies of the Age of Darkness v1.1 (2025).
// Loaded after the core army-builder data so it can extend the existing tables.

var UNIT_LEGACY_RULES = typeof UNIT_LEGACY_RULES !== "undefined" ? UNIT_LEGACY_RULES : {};

(function installLegacyUnits() {
  if (typeof UNIT_PRESETS === "undefined" || typeof POINTS_DATA === "undefined") return;

  function stats(bs, t, w, sv, inv, ld, extras) {
    return Object.assign({ bs: bs, t: t, w: w, sv: String(sv), inv: inv ? String(inv) : "-", ld: ld }, extras || {});
  }

  function def(id, name, category, role, base, perModel, minModels, maxModels, unitStats, rules, faction, allegiance) {
    return {
      id: id,
      name: name,
      category: category,
      role: role,
      base: base,
      perModel: perModel || 0,
      minModels: minModels || 1,
      maxModels: maxModels || minModels || 1,
      stats: unitStats,
      rules: rules || [],
      faction: faction || null,
      allegiance: allegiance || null,
    };
  }

  var C = {
    hc: "LEGACY: HIGH COMMAND",
    cmd: "LEGACY: COMMAND",
    ret: "LEGACY: RETINUE",
    el: "LEGACY: ELITES",
    tr: "LEGACY: TROOPS",
    ha: "LEGACY: HEAVY ASSAULT",
    sup: "LEGACY: SUPPORT",
    we: "LEGACY: WAR ENGINE",
    trans: "LEGACY: TRANSPORT",
    htrans: "LEGACY: HEAVY TRANSPORT",
    arm: "LEGACY: ARMOUR",
    rec: "LEGACY: RECON",
    fa: "LEGACY: FAST ATTACK",
    low: "LEGACY: LORD OF WAR",
    fort: "LEGACY: FORTIFICATIONS",
    ke: "LEGACY: KNIGHTS-ERRANT",
    cult: "LEGACY: CULTS ABOMINATIO",
    da: "I: DARK ANGELS LEGACY",
    ec: "III: EMPEROR'S CHILDREN LEGACY",
    iw: "IV: IRON WARRIORS LEGACY",
    ws: "V: WHITE SCARS LEGACY",
    sw: "VI: SPACE WOLVES LEGACY",
    iff: "VII: IMPERIAL FISTS LEGACY",
    nl: "VIII: NIGHT LORDS LEGACY",
    ba: "IX: BLOOD ANGELS LEGACY",
    ih: "X: IRON HANDS LEGACY",
    weat: "XII: WORLD EATERS LEGACY",
    um: "XIII: ULTRAMARINES LEGACY",
    dg: "XIV: DEATH GUARD LEGACY",
    ts: "XV: THOUSAND SONS LEGACY",
    soh: "XVI: SONS OF HORUS LEGACY",
    wb: "XVII: WORD BEARERS LEGACY",
    sal: "XVIII: SALAMANDERS LEGACY",
    rg: "XIX: RAVEN GUARD LEGACY",
    al: "XX: ALPHA LEGION LEGACY",
  };

  var LEGACY_UNIT_DEFS = [
    def("mounted_praetor_legacy", "Mounted Praetor", C.hc, "high_command", 160, 0, 1, 1, stats(5, 4, 5, "2", "4", 10), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike", "Master of the Legion"]),

    def("mounted_centurion_legacy", "Mounted Centurion", C.cmd, "command", 110, 0, 1, 1, stats(5, 4, 4, "2", "5", 9), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike", "Officer of the Line (2)"]),
    def("librarian_jump_legacy", "Librarian with Jump Pack", C.cmd, "command", 115, 0, 1, 1, stats(5, 4, 3, "2", "5", 8), ["Bulky (2)", "Deep Strike", "Psyker"]),
    def("mounted_librarian_legacy", "Mounted Librarian", C.cmd, "command", 125, 0, 1, 1, stats(5, 4, 4, "2", "5", 8), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike", "Psyker"]),
    def("librarian_term_legacy", "Librarian in Terminator Armour", C.cmd, "command", 115, 0, 1, 1, stats(5, 5, 4, "2", "4", 8), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Psyker"]),
    def("esoterist_jump_legacy", "Esoterist with Jump Pack", C.cmd, "command", 125, 0, 1, 1, stats(5, 4, 3, "2", "5", 7), ["Anathemata Discipline", "Bulky (2)", "Deep Strike", "Psyker"]),
    def("mounted_esoterist_legacy", "Mounted Esoterist", C.cmd, "command", 135, 0, 1, 1, stats(5, 4, 4, "2", "5", 7), ["Anathemata Discipline", "Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike", "Psyker"]),
    def("esoterist_term_legacy", "Esoterist in Terminator Armour", C.cmd, "command", 125, 0, 1, 1, stats(5, 5, 4, "2", "4", 7), ["Anathemata Discipline", "Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Psyker"]),
    def("champion_jump_legacy", "Legion Champion with Jump Pack", C.cmd, "command", 135, 0, 1, 1, stats(5, 4, 3, "2", "5", 8), ["Bulky (2)", "Deep Strike", "Never Back Down"]),
    def("mounted_champion_legacy", "Mounted Legion Champion", C.cmd, "command", 145, 0, 1, 1, stats(5, 4, 4, "2", "5", 8), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike", "Never Back Down"]),
    def("champion_term_legacy", "Legion Champion in Terminator Armour", C.cmd, "command", 135, 0, 1, 1, stats(5, 5, 4, "2", "4", 8), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Never Back Down"]),
    def("chaplain_jump_legacy", "Chaplain with Jump Pack", C.cmd, "command", 100, 0, 1, 1, stats(4, 4, 3, "2", "5", 9), ["Bulky (2)", "Deep Strike"]),
    def("mounted_chaplain_legacy", "Mounted Chaplain", C.cmd, "command", 110, 0, 1, 1, stats(4, 4, 4, "2", "5", 9), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike"]),
    def("chaplain_term_legacy", "Chaplain in Terminator Armour", C.cmd, "command", 110, 0, 1, 1, stats(4, 5, 4, "2", "4", 9), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful"]),
    def("herald_jump_legacy", "Herald with Jump Pack", C.cmd, "command", 130, 0, 1, 1, stats(5, 4, 3, "2", "5", 9), ["Bulky (2)", "Deep Strike", "Fear (1)"]),
    def("mounted_herald_legacy", "Mounted Herald", C.cmd, "command", 140, 0, 1, 1, stats(5, 4, 4, "2", "5", 9), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike", "Fear (1)"]),
    def("herald_term_legacy", "Herald in Terminator Armour", C.cmd, "command", 130, 0, 1, 1, stats(5, 5, 4, "2", "4", 9), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Fear (1)"]),
    def("siege_breaker_jump_legacy", "Siege Breaker with Jump Pack", C.cmd, "command", 135, 0, 1, 1, stats(5, 4, 3, "2", "5", 9), ["Bulky (2)", "Deep Strike"]),
    def("mounted_siege_breaker_legacy", "Mounted Siege Breaker", C.cmd, "command", 145, 0, 1, 1, stats(5, 4, 4, "2", "5", 9), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike"]),
    def("siege_breaker_term_legacy", "Siege Breaker in Terminator Armour", C.cmd, "command", 130, 0, 1, 1, stats(5, 5, 4, "2", "4", 9), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful"]),
    def("master_signals_jump_legacy", "Master of Signals with Jump Pack", C.cmd, "command", 135, 0, 1, 1, stats(5, 4, 3, "2", "5", 8), ["Bulky (2)", "Deep Strike"]),
    def("mounted_master_signals_legacy", "Mounted Master of Signals", C.cmd, "command", 145, 0, 1, 1, stats(5, 4, 4, "2", "5", 8), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike"]),
    def("moritat_mortalis_legacy", "Moritat Mortalis", C.cmd, "command", 85, 0, 1, 1, stats(6, 4, 3, "2", "5", 8), ["Firestorm", "Bitter Duty"]),
    def("forge_lord_mounted_legacy", "Mounted Forge Lord", C.cmd, "command", 140, 0, 1, 1, stats(5, 4, 4, "2", "5", 9), ["Battlesmith (2)", "Bulky", "Firestorm", "Implacable Advance", "Legiones Thallaxes", "Outflank / Deep Strike"]),
    def("forge_lord_term_legacy", "Forge Lord in Terminator Armour", C.cmd, "command", 130, 0, 1, 1, stats(5, 5, 4, "2", "4", 9), ["Battlesmith (2)", "Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Legiones Thallaxes"]),
    def("primus_medicae_legacy", "Primus Medicae", C.cmd, "command", 100, 0, 1, 1, stats(5, 4, 3, "2", "5", 8), ["Medic (4+)"]),
    def("mounted_primus_medicae_legacy", "Mounted Primus Medicae", C.cmd, "command", 130, 0, 1, 1, stats(5, 4, 4, "2", "5", 8), ["Medic (4+)", "Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike"]),
    def("primus_medicae_term_legacy", "Primus Medicae in Terminator Armour", C.cmd, "command", 120, 0, 1, 1, stats(5, 5, 4, "2", "4", 8), ["Medic (4+)", "Bulky (2)", "Implacable Advance", "Slow and Purposeful"]),
    def("delegatus_legacy", "Delegatus", C.cmd, "command", 100, 0, 1, 1, stats(5, 4, 3, "2", "5", 9), ["Consul-Delegatus"]),
    def("mounted_delegatus_legacy", "Mounted Delegatus", C.cmd, "command", 130, 0, 1, 1, stats(5, 4, 4, "2", "5", 9), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike", "Consul-Delegatus"]),
    def("delegatus_term_legacy", "Delegatus in Terminator Armour", C.cmd, "command", 120, 0, 1, 1, stats(5, 5, 4, "2", "4", 9), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Consul-Delegatus"]),
    def("mortificator_legacy", "Mortificator", C.cmd, "command", 100, 0, 1, 1, stats(5, 4, 3, "2", "5", 8), ["Battlesmith (2)"]),
    def("mortificator_term_legacy", "Mortificator in Terminator Armour", C.cmd, "command", 120, 0, 1, 1, stats(5, 5, 4, "2", "4", 8), ["Battlesmith (2)", "Bulky (2)", "Implacable Advance", "Slow and Purposeful"]),
    def("warmonger_legacy", "Warmonger", C.cmd, "command", 130, 0, 1, 1, stats(5, 4, 3, "2", "5", 9), []),
    def("warmonger_term_legacy", "Warmonger in Terminator Armour", C.cmd, "command", 150, 0, 1, 1, stats(5, 5, 4, "2", "4", 9), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful"]),
    def("pathfinder_legacy", "Pathfinder", C.cmd, "command", 60, 0, 1, 1, stats(5, 4, 3, "4", "5", 9), ["Infiltrate (9)", "Move Through Cover"]),
    def("armistos_legacy", "Armistos", C.cmd, "command", 70, 0, 1, 1, stats(5, 4, 3, "2", "5", 9), ["Implacable Advance"]),

    def("praetorian_cmd_scimitar_legacy", "Praetorian Command Squad on Scimitar Jetbikes", C.ret, "retinue", 170, 45, 3, 10, stats(4, 4, 3, "2", "-", 8), ["Bulky (3)", "Deep Strike"]),
    def("outrider_praetorian_cmd_legacy", "Outrider Praetorian Command Squad", C.ret, "retinue", 150, 40, 3, 10, stats(4, 4, 3, "2", "-", 8), ["Bulky (2)", "Firestorm", "Implacable Advance", "Outflank"]),

    def("veteran_breacher_legacy", "Veteran Breacher Squad", C.el, "elites", 115, 20, 5, 10, stats(4, 4, 2, "3", "5", 8), ["Vanguard (3)"]),
    def("veteran_heavy_support_legacy", "Veteran Heavy Support Squad", C.el, "elites", 115, 20, 5, 10, stats(4, 4, 2, "3", "-", 8), ["Implacable Advance", "Support Unit (1)"]),
    def("mortalis_destroyer_legacy", "Mortalis Destroyer Squad", C.ha, "heavy_assault", 85, 15, 5, 10, stats(4, 4, 1, "3", "-", 7), ["Firestorm", "Vanguard (2)", "Bitter Duty"]),
    def("destroyer_assault_legacy", "Destroyer Assault Squad", C.ha, "heavy_assault", 100, 18, 5, 10, stats(4, 4, 1, "3", "-", 7), ["Bulky (2)", "Firestorm", "Deep Strike", "Vanguard (2)", "Bitter Duty"]),
    def("tartaros_siege_legacy", "Tartaros Terminator Siege Squad", C.ha, "heavy_assault", 160, 30, 5, 10, stats(4, 5, 2, "2", "5", 8), ["Bulky (2)", "Implacable Advance", "Vanguard (3)"]),
    def("indomitus_terminator_legacy", "Indomitus Terminator Squad", C.ha, "heavy_assault", 175, 35, 5, 10, stats(4, 5, 2, "2", "5", 8), ["Bulky (2)", "Implacable Advance", "Vanguard (3)"]),
    def("castra_ferrum_legacy", "Castra Ferrum Dreadnought", C.we, "war_engine", 115, 0, 1, 1, stats(4, 6, 5, "2", "5", 12), ["Bulky (5)", "Implacable Advance"]),
    def("land_raider_achilles_legacy", "Land Raider Achilles", C.htrans, "heavy_transport", 280, 0, 1, 1, stats(4, 8, 10, 2, "-", 8, { isVehicle: true, avF: 14, avS: 14, avR: 14, hp: 10 }), ["Auto-repair (5+)"]),
    def("caestus_assault_ram_legacy", "Caestus Assault Ram", C.htrans, "heavy_transport", 290, 0, 1, 1, stats(4, 8, 7, 2, "-", 8, { isVehicle: true, avF: 13, avS: 13, avR: 13, hp: 7 }), ["Assault Vehicle", "Flyer"]),
    def("attack_bike_squadron_legacy", "Attack Bike Squadron", C.fa, "fast_attack", 45, 45, 1, 5, stats(4, 4, 3, "3", "-", 7), ["Bulky (3)", "Firestorm", "Firing Protocols (2)", "Implacable Advance"]),
    def("scout_squad_legacy", "Scout Squad", C.rec, "recon", 70, 12, 5, 10, stats(4, 4, 1, "4", "-", 7), ["Infiltrate (9)", "Move Through Cover", "Support Unit (2)"]),
    def("legion_basilisk_legacy", "Legion Basilisk", C.sup, "support", 140, 0, 1, 1, stats(4, 7, 4, 3, "-", 8, { isVehicle: true, avF: 12, avS: 12, avR: 10, hp: 4 }), []),
    def("legion_medusa_legacy", "Legion Medusa", C.sup, "support", 150, 0, 1, 1, stats(4, 7, 4, 3, "-", 8, { isVehicle: true, avF: 12, avS: 12, avR: 10, hp: 4 }), []),
    def("thunderhawk_transporter_legacy", "Thunderhawk Transporter", C.low, "lord_of_war", 500, 0, 1, 1, stats(4, 9, 16, 2, "-", 8, { isVehicle: true, avF: 13, avS: 13, avR: 13, hp: 16 }), ["Auxiliary Vehicle Bays", "Flyer"]),

    def("da_cataphractii_deathwing_comp_legacy", "Cataphractii Deathwing Companions", C.da, "retinue", 240, 0, 5, 5, stats(4, 5, 2, "2", "4", 8), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Eternal Warrior (1)", "Companions"], "dark_angels"),
    def("da_tartaros_deathwing_comp_legacy", "Tartaros Deathwing Companions", C.da, "retinue", 240, 0, 5, 5, stats(4, 5, 2, "2", "5", 8), ["Bulky (2)", "Implacable Advance", "Eternal Warrior (1)", "Companions"], "dark_angels"),
    def("da_broken_claws_legacy", "Inner Circle Knights Cenobium - Broken Claws", C.da, "heavy_assault", 285, 55, 5, 10, stats(4, 5, 2, "2", "4", 8), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Order of the Broken Claws"], "dark_angels"),
    def("da_excindio_legacy", "Excindio Battle-automata", C.da, "war_engine", 180, 0, 1, 1, stats(5, 7, 8, "3", "5", 10), ["Bulky (6)", "Explodes (5+)", "Firing Protocols (3)", "Eternal Warrior (1)", "Hatred", "Vengeful Rage"], "dark_angels"),
    def("da_firewing_enigmatus_legacy", "Firewing Enigmatus Cabal", C.da, "elites", 90, 0, 3, 3, stats(4, 4, 2, "3", "-", 8), ["Outflank", "Bulky (2)", "Deep Strike", "Vanguard (2)", "Marked For Death (1)"], "dark_angels"),
    def("ec_palatine_aquilae_legacy", "Palatine Blade Aquilae Squad", C.ec, "elites", 165, 33, 5, 10, stats(4, 4, 2, "2", "-", 8), ["Vanguard (3)", "Bulky (2)", "Deep Strike"], "emperors_children"),
    def("rylanor_legacy", "Rylanor the Unyielding", C.ec, "war_engine", 180, 0, 1, 1, stats(4, 7, 6, "2", "5", 12), ["Bulky (6)", "Explodes (5+)", "Implacable Advance", "Vengeful Hate"], "emperors_children", "loyalist"),
    def("ec_sun_killers_legacy", "Sun Killer Squad", C.ec, "support", 65, 10, 5, 20, stats(4, 4, 1, "3", "-", 8), ["Heedless", "Designated Quarry"], "emperors_children"),
    def("iw_warsmith_artificer_legacy", "Warsmith in Artificer Armour", C.iw, "high_command", 140, 0, 1, 1, stats(5, 4, 4, "2", "4", 10), ["Battlesmith (2)"], "iron_warriors"),
    def("narik_dreygur_legacy", "Narik Dreygur", C.iw, "command", 115, 0, 1, 1, stats(5, 4, 3, "2", "5", 9), ["Battlesmith (1)", "Feel No Pain (5+)", "Master of Automata"], "iron_warriors", "loyalist"),
    def("iw_dominator_cohort_legacy", "Dominator Cohort", C.iw, "heavy_assault", 255, 45, 5, 10, stats(4, 5, 2, "2", "4", 9), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Expendable (1)", "Hatred (Automata)", "Those Once Honoured"], "iron_warriors"),
    def("iw_iron_havocs_legacy", "Iron Havocs", C.iw, "support", 135, 25, 5, 10, stats(4, 4, 1, "3", "-", 7), ["Support Unit (1)", "Ferrum Occularis"], "iron_warriors"),
    def("the_tormentor_legacy", "The Tormentor", C.iw, "lord_of_war", 700, 0, 1, 1, stats(4, 9, 16, 2, "-", 10, { isVehicle: true, avF: 14, avS: 13, avR: 12, hp: 16 }), ["Lair of the Iron Tyrant", "Macro-auspex", "Void Shields (1)"], "iron_warriors", "traitor"),
    def("ws_stormseer_jump_legacy", "Stormseer with Jump Pack", C.ws, "command", 115, 0, 1, 1, stats(5, 4, 3, "2", "5", 8), ["Bulky (2)", "Deep Strike", "Psyker"], "white_scars"),
    def("ws_mounted_stormseer_legacy", "Mounted Stormseer", C.ws, "command", 125, 0, 1, 1, stats(5, 4, 4, "2", "5", 8), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike", "Psyker"], "white_scars"),
    def("ws_stormseer_term_legacy", "Stormseer in Terminator Armour", C.ws, "command", 115, 0, 1, 1, stats(5, 5, 4, "2", "4", 8), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Psyker"], "white_scars"),
    def("ws_falcons_claws_legacy", "Falcon's Claws", C.ws, "elites", 110, 18, 5, 10, stats(4, 4, 1, "4", "-", 7), ["Outflank", "Precision (6+)"], "white_scars"),
    def("ws_dark_sons_death_legacy", "Dark Sons of Death", C.ws, "heavy_assault", 125, 20, 5, 15, stats(4, 4, 1, "3", "-", 8), ["Bulky (2)", "Deep Strike", "Impact (A)", "Invocation of the Razing Tempest"], "white_scars"),
    def("sw_caster_jump_legacy", "Caster of Runes with Jump Pack", C.sw, "command", 140, 0, 1, 1, stats(5, 4, 3, "2", "5", 8), ["Bulky (2)", "Deep Strike", "Psyker"], "space_wolves"),
    def("sw_mounted_caster_legacy", "Mounted Caster of Runes", C.sw, "command", 150, 0, 1, 1, stats(5, 4, 4, "2", "5", 8), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike", "Psyker"], "space_wolves"),
    def("sw_caster_term_legacy", "Caster of Runes in Terminator Armour", C.sw, "command", 130, 0, 1, 1, stats(5, 5, 2, "2", "4", 8), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Psyker"], "space_wolves"),
    def("sw_speaker_dead_legacy", "Speaker of the Dead", C.sw, "command", 100, 0, 1, 1, stats(4, 4, 3, "2", "5", 9), ["Medic (5+)"], "space_wolves"),
    def("sw_mounted_speaker_dead_legacy", "Mounted Speaker of the Dead", C.sw, "command", 130, 0, 1, 1, stats(4, 4, 4, "2", "5", 9), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike", "Medic (5+)"], "space_wolves"),
    def("sw_speaker_dead_term_legacy", "Speaker of the Dead in Terminator Armour", C.sw, "command", 120, 0, 1, 1, stats(4, 5, 4, "2", "4", 9), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Medic (5+)"], "space_wolves"),
    def("sw_jorlund_hunters_legacy", "Jorlund Hunter Pack", C.sw, "troops", 95, 17, 5, 10, stats(4, 4, 1, "3", "-", 7), ["Firestorm", "Move Through Cover", "Vanguard (3)", "Scouring Tempest"], "space_wolves"),
    def("sw_fenrisian_wolves_legacy", "Fenrisian Wolf Pack", C.sw, "fast_attack", 10, 9, 1, 5, stats(0, 4, 1, "6", "-", 5), ["Heedless"], "space_wolves"),
    def("if_huscarl_retinue_legacy", "Huscarl Terminator Retinue", C.iff, "retinue", 250, 50, 5, 10, stats(4, 5, 2, "2", "4", 8), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Eternal Warrior (1)", "Deep Strike"], "imperial_fists"),
    def("aetos_dios_legacy", "Aetos Dios", C.iff, "lord_of_war", 700, 0, 1, 1, stats(4, 9, 18, 2, "-", 10, { isVehicle: true, avF: 13, avS: 13, avR: 13, hp: 18 }), ["Thunderhawk Transport Bay", "Void Shields (1)", "Aetos Praetoria"], "imperial_fists", "loyalist"),
    def("nl_atramentar_flay_clade_legacy", "Atramentar Flay-clade", C.nl, "heavy_assault", 170, 35, 5, 20, stats(4, 5, 2, "2", "5", 8), ["Bulky (2)", "Implacable Advance", "Impact (I)", "Vanguard (3)", "Sworn Loyalty", "Cloaked in Murder", "Deep Strike"], "night_lords"),
    def("ba_sanguinary_guard_legacy", "Sanguinary Guard", C.ba, "elites", 205, 40, 5, 10, stats(4, 4, 2, "2", "-", 8), ["Bulky (2)", "Deep Strike"], "blood_angels"),
    def("ba_ofanim_court_legacy", "Ofanim Court", C.ba, "elites", 130, 40, 3, 5, stats(4, 4, 2, "2", "-", 9), ["Shadows of Judgement"], "blood_angels"),
    def("ba_ofanim_jump_legacy", "Ofanim Court with Jump Packs", C.ba, "elites", 160, 50, 3, 5, stats(4, 4, 2, "2", "-", 9), ["Bulky (2)", "Deep Strike", "Shadows of Judgement"], "blood_angels"),
    def("ih_iron_father_artificer_legacy", "Iron Father in Artificer Armour", C.ih, "high_command", 150, 0, 1, 1, stats(5, 4, 4, "2", "4", 10), ["Battlesmith (2)", "Feel No Pain (5+)", "Lord of Automata"], "iron_hands"),
    def("ih_morlock_terminators_legacy", "Morlock Terminator Squad", C.ih, "heavy_assault", 165, 50, 3, 5, stats(4, 5, 2, "2", "4", 9), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Eternal Warrior (1)", "Fate of the Gorgon"], "iron_hands"),
    def("we_red_hand_mortalis_legacy", "Red Hand Destroyer Mortalis Squad", C.weat, "heavy_assault", 85, 15, 5, 15, stats(4, 4, 1, "3", "-", 7), ["Firestorm", "Bearers of the Blood Hand", "Bitter Duty"], "world_eaters"),
    def("we_red_hand_assault_legacy", "Red Hand Destroyer Assault Squad", C.weat, "heavy_assault", 110, 20, 5, 15, stats(4, 4, 1, "3", "-", 7), ["Bulky (2)", "Deep Strike", "Firestorm", "Bearers of the Blood Hand", "Bitter Duty"], "world_eaters"),
    def("um_locutarus_legacy", "Locutarus Storm Squad", C.um, "elites", 200, 38, 5, 10, stats(4, 4, 2, "2", "-", 8), ["Bulky (2)", "Deep Strike", "Precision (6+)", "The Blade of Wisdom"], "ultramarines"),
    def("um_fulmentarus_legacy", "Fulmentarus Terminator Squad", C.um, "heavy_assault", 290, 55, 5, 10, stats(4, 5, 2, "2", "4", 8), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Firing Protocols (2)", "Support Unit (1)"], "ultramarines"),
    def("um_nemesis_destroyers_legacy", "Nemesis Destroyer Squad", C.um, "heavy_assault", 165, 15, 10, 20, stats(4, 4, 1, "3", "-", 8), [], "ultramarines"),
    def("honoured_telemechrus_legacy", "Honoured Telemechrus", C.um, "war_engine", 170, 0, 1, 1, stats(4, 7, 6, "2", "5", 12), ["Bulky (6)", "Explodes (5+)", "Implacable Advance", "Hatred (Word Bearers)"], "ultramarines", "loyalist"),
    def("dg_mortus_poisoners_legacy", "Mortus Poisoner Squad", C.dg, "elites", 70, 12, 5, 15, stats(4, 4, 1, "3", "-", 7), ["Bitter Duty"], "death_guard"),
    def("ts_numerologist_cabal_legacy", "Numerologist Cabal", C.ts, "elites", 130, 15, 5, 10, stats(4, 4, 1, "3", "-", 7), ["Numerologist Order", "Battlesmith (2)", "Life Wards"], "thousand_sons"),
    def("ts_ammitara_cabal_legacy", "Ammitara Occult Intercession Cabal", C.ts, "recon", 145, 27, 5, 10, stats(5, 4, 2, "4", "-", 8), ["Infiltrate (9)", "Move Through Cover", "Support Unit (2)"], "thousand_sons"),
    def("soh_dark_emissary_term_legacy", "Dark Emissary in Terminator Armour", C.soh, "command", 120, 0, 1, 1, stats(5, 5, 5, "2", "4", 10), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Eyes of the Warmaster"], "sons_of_horus"),
    def("soh_chieftains_legacy", "Chieftain Squad", C.soh, "elites", 155, 25, 5, 10, stats(4, 4, 2, "2", "5", 8), ["Honour Above All"], "sons_of_horus"),
    def("soh_reaver_aggressors_legacy", "Reaver Aggressor Squad", C.soh, "heavy_assault", 145, 27, 5, 20, stats(4, 4, 2, "3", "-", 8), ["Precision (6+)", "Vanguard (3)", "Bulky (2)", "Deep Strike"], "sons_of_horus"),
    def("wb_diabolist_legacy", "Diabolist", C.wb, "command", 105, 0, 1, 1, stats(5, 4, 3, "2", "5", 7), ["Diabolism Discipline", "Damned", "Psyker"], "word_bearers", "traitor"),
    def("wb_diabolist_term_legacy", "Diabolist in Terminator Armour", C.wb, "command", 135, 0, 1, 1, stats(5, 5, 4, "2", "4", 7), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Diabolism Discipline", "Damned", "Psyker"], "word_bearers", "traitor"),
    def("wb_mounted_diabolist_legacy", "Mounted Diabolist", C.wb, "command", 145, 0, 1, 1, stats(5, 4, 4, "2", "5", 7), ["Bulky", "Firestorm", "Implacable Advance", "Outflank / Deep Strike", "Diabolism Discipline", "Damned", "Psyker"], "word_bearers", "traitor"),
    def("wb_procurators_legacy", "Procurators", C.wb, "elites", 100, 15, 5, 15, stats(4, 4, 1, "3", "-", 7), ["Support Unit (1)", "Bitter Duty", "Flesh Harvester", "Medic (4+)"], "word_bearers", "traitor"),
    def("wb_procurators_jump_legacy", "Procurators with Jump Packs", C.wb, "elites", 130, 20, 5, 15, stats(4, 4, 1, "3", "-", 7), ["Bulky (2)", "Support Unit (1)", "Bitter Duty", "Deep Strike", "Flesh Harvester", "Medic (4+)"], "word_bearers", "traitor"),
    def("cassian_dracos_legacy", "Cassian Dracos Reborn", C.sal, "war_engine", 220, 0, 1, 1, stats(5, 7, 8, "2", "5", 12), ["Bulky (6)", "Explodes (5+)", "Implacable Advance", "Battlesmith (1)", "Drakenscale Armour", "Whispers of Isstvan"], "salamanders", "loyalist"),
    def("sal_adherents_legacy", "Adherents Squad", C.sal, "troops", 85, 15, 5, 10, stats(4, 4, 1, "3", "-", 8), ["Vanguard (2)", "Creed of Flame"], "salamanders"),
    def("sal_sanctifiers_legacy", "Sanctifier Squad", C.sal, "elites", 90, 16, 5, 10, stats(4, 4, 2, "3", "-", 8), ["Firestorm", "Vanguard (3)"], "salamanders"),
    def("rg_deliverers_legacy", "Deliverers Squad", C.rg, "heavy_assault", 215, 40, 5, 15, stats(4, 5, 2, "2", "4", 9), ["Bulky (2)", "Implacable Advance", "Slow and Purposeful", "Vanguard (3)", "Deep Strike", "Corax's Shame"], "raven_guard"),
    def("autilon_skorr_legacy", "Autilon Skorr", C.al, "command", 135, 0, 1, 1, stats(5, 4, 3, "2", "5", 9), ["Consul-Delegatus"], "alpha_legion", "traitor"),
    def("al_effrit_legacy", "Effrit Disruption Cadre", C.al, "elites", 145, 25, 5, 10, stats(5, 4, 2, "3", "-", 8), ["Infiltrate (8)", "Hydra's Wail"], "alpha_legion"),
    def("nathaniel_garro_legacy", "Nathaniel Garro", C.ke, "command", 160, 0, 1, 1, stats(5, 4, 4, "2", "4", 10), ["Eternal Warrior (1)"], null, "loyalist"),
    def("tylos_rubio_legacy", "Tylos Rubio", C.ke, "command", 130, 0, 1, 1, stats(5, 4, 3, "2", "5", 10), ["Eternal Warrior (1)", "Echoes of Fate"], null, "loyalist"),

    def("aevos_jovan_legacy", "Surgeon-Primus Aevos Jovan", "SA: LEGACY COMMAND", "command", 50, 10, 2, 4, stats(2, 3, 2, "4", "5", 8), ["Medic (4+)", "Surgical Suite", "Triage"], null, "loyalist"),
    def("expeditionary_navigator_legacy", "Expeditionary Navigator", "SA: LEGACY COMMAND", "command", 65, 0, 1, 1, stats(2, 3, 1, "6", "5", 7), ["The Lidless Stare", "Navis Astrologian", "Navigator's Arts"]),
    def("davinite_lodge_priest_legacy", "Davinite Lodge Priest", "SA: LEGACY COMMAND", "command", 60, 0, 1, 1, stats(3, 3, 2, "5", "6", 7), ["Ritual Healing"], null, "traitor"),
    def("companion_section_legacy", "Companion Section", "SA: LEGACY ELITES", "elites", 80, 12, 5, 10, stats(4, 3, 2, "4", "5", 8), ["Support Unit (1)"]),
    def("medicae_section_legacy", "Medicae Section", "SA: LEGACY SUPPORT", "support", 15, 15, 1, 6, stats(3, 3, 1, "4", "-", 6), ["Medic (5+)", "Medicae Support"]),
    def("cyclops_demolition_legacy", "Cyclops Demolition Vehicle", "SA: LEGACY SUPPORT", "support", 50, 0, 1, 1, stats("-", 6, 2, 4, "-", 6, { isVehicle: true, avF: 10, avS: 10, avR: 10, hp: 2 }), ["Expendable (3)", "Explodes (2+)", "Compact", "Demolition Vehicle"]),
    def("aurox_transport_legacy", "Aurox Transport", "SA: LEGACY TRANSPORT", "transport", 50, 0, 1, 1, stats(3, 6, 3, 4, "-", 7, { isVehicle: true, avF: 12, avS: 11, avR: 10, hp: 4 }), ["Light Transport"]),
    def("sa_tarantula_section_legacy", "Tarantula Section", "SA: LEGACY SUPPORT", "support", 35, 0, 2, 2, stats(3, 6, 2, 4, "-", 6, { isVehicle: true, avF: 10, avS: 10, avR: 10, hp: 2 }), ["Expendable (3)", "Automated Fire Protocols", "Independent Sentries"]),
    def("carnodon_legacy", "Carnodon Strike Tank", "SA: LEGACY ARMOUR", "armour", 80, 0, 1, 1, stats(3, 7, 4, 3, "-", 7, { isVehicle: true, avF: 12, avS: 11, avR: 10, hp: 4 }), []),
    def("avenger_strike_fighter_legacy", "Avenger Strike Fighter", "SA: LEGACY FAST ATTACK", "fast_attack", 100, 0, 1, 1, stats(3, 7, 4, 3, "-", 7, { isVehicle: true, avF: 12, avS: 12, avR: 12, hp: 4 }), ["Flyer"]),
    def("destroyer_tank_hunter_legacy", "Destroyer Tank Hunter", "SA: LEGACY ARMOUR", "armour", 130, 0, 1, 1, stats(3, 8, 5, 2, "-", 7, { isVehicle: true, avF: 14, avS: 13, avR: 10, hp: 6 }), []),
    def("thunderer_siege_tank_legacy", "Thunderer Siege Tank", "SA: LEGACY ARMOUR", "armour", 155, 0, 1, 1, stats(3, 8, 5, 2, "-", 7, { isVehicle: true, avF: 14, avS: 13, avR: 10, hp: 6 }), []),
    def("minotaur_artillery_tank_legacy", "Minotaur Artillery Tank", "SA: LEGACY SUPPORT", "support", 205, 0, 1, 1, stats(3, 8, 6, 2, "-", 7, { isVehicle: true, avF: 13, avS: 13, avR: 13, hp: 7 }), []),
    def("macharius_legacy", "Macharius Heavy Tank", "SA: LEGACY LORD OF WAR", "lord_of_war", 300, 0, 1, 1, stats(3, 8, 8, 2, "-", 8, { isVehicle: true, avF: 14, avS: 13, avR: 12, hp: 12 }), []),
    def("praetor_launcher_legacy", "Praetor Armoured Assault Launcher", "SA: LEGACY ARMOUR", "armour", 300, 0, 1, 1, stats(3, 8, 6, 2, "-", 7, { isVehicle: true, avF: 14, avS: 13, avR: 12, hp: 12 }), []),
    def("crassus_transport_legacy", "Crassus Armoured Assault Transport", "SA: LEGACY HEAVY TRANSPORT", "heavy_transport", 350, 0, 1, 1, stats(3, 8, 8, 2, "-", 7, { isVehicle: true, avF: 14, avS: 13, avR: 12, hp: 12 }), []),
    def("baneblade_legacy", "Baneblade", "SA: LEGACY LORD OF WAR", "lord_of_war", 520, 0, 1, 1, stats(3, 9, 12, 2, "-", 8, { isVehicle: true, avF: 14, avS: 13, avR: 12, hp: 16 }), []),
    def("hellhammer_legacy", "Hellhammer", "SA: LEGACY LORD OF WAR", "lord_of_war", 520, 0, 1, 1, stats(3, 9, 12, 2, "-", 8, { isVehicle: true, avF: 14, avS: 13, avR: 12, hp: 16 }), []),
    def("banehammer_legacy", "Banehammer", "SA: LEGACY LORD OF WAR", "lord_of_war", 450, 0, 1, 1, stats(3, 9, 12, 2, "-", 8, { isVehicle: true, avF: 14, avS: 13, avR: 12, hp: 16 }), []),
    def("stormlord_legacy", "Stormlord", "SA: LEGACY LORD OF WAR", "lord_of_war", 500, 0, 1, 1, stats(3, 9, 12, 2, "-", 8, { isVehicle: true, avF: 14, avS: 13, avR: 12, hp: 16 }), ["Light Transport"]),
    def("stormblade_legacy", "Stormblade", "SA: LEGACY LORD OF WAR", "lord_of_war", 500, 0, 1, 1, stats(3, 9, 12, 2, "-", 8, { isVehicle: true, avF: 14, avS: 13, avR: 12, hp: 16 }), []),
    def("shadowsword_legacy", "Shadowsword", "SA: LEGACY LORD OF WAR", "lord_of_war", 475, 0, 1, 1, stats(3, 9, 12, 2, "-", 8, { isVehicle: true, avF: 14, avS: 13, avR: 12, hp: 16 }), []),
    def("stormsword_legacy", "Stormsword", "SA: LEGACY LORD OF WAR", "lord_of_war", 475, 0, 1, 1, stats(3, 9, 12, 2, "-", 8, { isVehicle: true, avF: 14, avS: 13, avR: 12, hp: 16 }), []),
    def("marauder_bomber_legacy", "Marauder Bomber", "SA: LEGACY FAST ATTACK", "fast_attack", 225, 0, 1, 1, stats(3, 8, 8, 2, "-", 7, { isVehicle: true, avF: 12, avS: 12, avR: 12, hp: 10 }), ["Flyer"]),
    def("marauder_destroyer_legacy", "Marauder Destroyer", "SA: LEGACY FAST ATTACK", "fast_attack", 245, 0, 1, 1, stats(3, 8, 8, 2, "-", 7, { isVehicle: true, avF: 12, avS: 12, avR: 12, hp: 10 }), ["Flyer"]),

    def("tech_thrall_defence_legacy", "Tech-thrall Defence Covenant", "MECH: LEGACY TROOPS", "troops", 100, 10, 10, 40, stats(2, 5, 1, "6", "-", 4), ["Expendable (2)", "Rite of Pure Thought", "Feel No Pain (6+)", "Tech-thralls"]),
    def("arlatax_maniple_legacy", "Arlatax Battle Maniple", "MECH: LEGACY WAR ENGINE", "war_engine", 120, 120, 1, 4, stats(4, 7, 4, "2", "5", 8), ["Bulky (6)", "Deep Strike", "Explodes (6+)", "Implacable Advance", "Impact (A)", "Vanguard (2)", "Firing Protocols (2)", "Firestorm"]),
    def("mechanicum_termite_legacy", "Mechanicum Termite", "MECH: LEGACY TRANSPORT", "transport", 80, 0, 1, 1, stats(4, 7, 3, 3, "-", 7, { isVehicle: true, avF: 12, avS: 12, avR: 10, hp: 5 }), ["Light Transport", "Deep Strike"]),
    def("mechanicum_tarantula_legacy", "Mechanicum Tarantula Battery", "MECH: LEGACY SUPPORT", "support", 45, 0, 2, 2, stats(4, 6, 2, 4, "-", 6, { isVehicle: true, avF: 10, avS: 10, avR: 10, hp: 2 }), ["Expendable (3)", "Infiltrate (9)", "Automated Fire Protocols", "Independent Sentries"]),
    def("macrocarid_explorator_legacy", "Macrocarid Explorator", "MECH: LEGACY TRANSPORT", "transport", 200, 0, 1, 1, stats(4, 8, 6, 2, 5, 8, { isVehicle: true, avF: 14, avS: 14, avR: 14, hp: 9 }), ["Auto-repair (3+)", "Move Through Cover", "Anbaric Claw"]),
    def("ordinatus_ulator_legacy", "Ordinatus Ulator", "MECH: LEGACY LORD OF WAR", "lord_of_war", 750, 0, 1, 1, stats(4, 9, 14, 2, 5, 10, { isVehicle: true, avF: 14, avS: 10, avR: 14, hp: 12 }), ["Repair Crew (D3)", "Dispersal Field"]),
    def("ordinatus_sagittar_legacy", "Ordinatus Sagittar", "MECH: LEGACY LORD OF WAR", "lord_of_war", 800, 0, 1, 1, stats(4, 9, 14, 2, 5, 10, { isVehicle: true, avF: 14, avS: 10, avR: 14, hp: 12 }), ["Repair Crew (D3)", "Dispersal Field"]),
    def("ordinatus_aktaeus_legacy", "Ordinatus Aktaeus", "MECH: LEGACY LORD OF WAR", "lord_of_war", 900, 0, 1, 1, stats(4, 9, 14, 2, 5, 10, { isVehicle: true, avF: 14, avS: 10, avR: 14, hp: 12 }), ["Repair Crew (D3)", "Dispersal Field", "Macro-drill Transport Bay"]),

    def("vengeance_weapon_battery_legacy", "Vengeance Weapon Battery", C.fort, "fortification", 100, 0, 1, 1, stats(2, 7, 6, 3, "-", 6, { isVehicle: true, avF: 11, avS: 11, avR: 11, hp: 6 }), ["Fortification", "Emplacement"]),
    def("hammerfall_bunker_legacy", "Hammerfall Bunker", C.fort, "fortification", 150, 0, 1, 1, stats(2, 8, 8, 3, "-", 6, { isVehicle: true, avF: 12, avS: 12, avR: 12, hp: 6 }), ["Fortification", "Bunker", "Forward Deployment"]),
    def("void_shield_generator_legacy", "Void Shield Generator", C.fort, "fortification", 120, 0, 1, 1, stats("-", 7, 6, 3, "-", 6, { isVehicle: true, avF: 11, avS: 11, avR: 11, hp: 8 }), ["Fortification", "Structure", "Void Shield"]),
    def("skyshield_landing_pad_legacy", "Skyshield Landing Pad", C.fort, "fortification", 100, 0, 1, 1, stats("-", 7, 6, 3, "-", 6, { isVehicle: true, avF: 11, avS: 11, avR: 11, hp: 6 }), ["Fortification", "Platform", "Landing Pad", "Forward Deployment"]),
    def("aegis_defence_line_legacy", "Aegis Defence Line", C.fort, "fortification", 70, 0, 1, 1, stats("-", 6, 6, 4, "-", 6, { isVehicle: true, avF: 10, avS: 10, avR: 10, hp: 3 }), ["Fortification", "Armoured Platform", "Aegis Barricades"]),
    def("firestorm_redoubt_legacy", "Firestorm Redoubt", C.fort, "fortification", 200, 0, 1, 1, stats(2, 8, 10, 3, "-", 6, { isVehicle: true, avF: 12, avS: 12, avR: 12, hp: 8 }), ["Fortification", "Bunker", "Firing Point (3)"]),
    def("fortress_redemption_legacy", "Fortress of Redemption", C.fort, "fortification", 300, 0, 1, 1, stats(2, 9, 12, 2, "-", 6, { isVehicle: true, avF: 14, avS: 14, avR: 14, hp: 10 }), ["Fortification", "Bunker", "Orbital Defence"]),
    def("aquila_strongpoint_legacy", "Aquila Strongpoint", C.fort, "fortification", 100, 0, 1, 1, stats(2, 8, 10, 3, "-", 6, { isVehicle: true, avF: 12, avS: 12, avR: 12, hp: 8 }), ["Fortification", "Bunker", "Firing Point (3)"]),
    def("primus_redoubt_legacy", "Primus Redoubt", C.fort, "fortification", 400, 0, 1, 1, stats(3, 9, 14, 2, "-", 6, { isVehicle: true, avF: 14, avS: 14, avR: 14, hp: 8 }), ["Fortification", "Bunker", "Macro-auspex"]),
    def("infernus_abomination_legacy", "Infernus Abomination", C.cult, "heavy_assault", 120, 0, 1, 1, stats(5, 5, 3, "4", "4", 10), ["Infiltrate (9)", "Heedless", "Move Through Cover", "Shrouded (4+)", "Fear (1)", "Osmeotic Regeneration"], null, "traitor"),
  ];

  function firstFnp(rules) {
    var joined = (rules || []).join(" ");
    var m = joined.match(/Feel No Pain \((\d)\+\)/);
    return m ? m[1] : "-";
  }

  function unitFromDef(d) {
    var s = d.stats || stats(4, 4, 1, 3, "-", 8);
    return Object.assign({
      id: d.id,
      name: d.name + " [Legacy]",
      models: d.minModels,
      bs: s.bs,
      t: s.t,
      w: s.w,
      sv: s.sv,
      inv: s.inv,
      fnp: firstFnp(d.rules),
      ld: s.ld,
      hasSgt: d.minModels > 1 && !s.isVehicle,
      legacy: true,
      legacyRules: d.rules,
    }, s);
  }

  function ensureCategory(name) {
    var cat = UNIT_PRESETS.find(function (c) { return c.category === name; });
    if (!cat) {
      cat = { category: name, units: [] };
      UNIT_PRESETS.push(cat);
    }
    return cat;
  }

  function addRole(unitId, role) {
    UNIT_BATTLEFIELD_ROLE[unitId] = role;
    if (!ROLE_TO_UNIT_IDS[role]) ROLE_TO_UNIT_IDS[role] = [];
    if (!ROLE_TO_UNIT_IDS[role].includes(unitId)) ROLE_TO_UNIT_IDS[role].push(unitId);
  }

  function addAllegiance(unitId, allegiance) {
    if (!allegiance || !ALLEGIANCE_UNITS || !ALLEGIANCE_UNITS[allegiance]) return;
    if (!ALLEGIANCE_UNITS[allegiance].includes(unitId)) ALLEGIANCE_UNITS[allegiance].push(unitId);
  }

  function addUnit(d) {
    var unit = unitFromDef(d);
    var existing = typeof UNIT_PRESET_BY_ID !== "undefined" ? UNIT_PRESET_BY_ID[d.id] : null;
    if (!existing) {
      var cat = ensureCategory(d.category);
      cat.units.push(unit);
      if (typeof UNIT_PRESETS_ALL_UNITS !== "undefined") UNIT_PRESETS_ALL_UNITS.push(unit);
    } else {
      existing.legacy = true;
      existing.legacyRules = d.rules;
      unit = existing;
    }

    if (typeof UNIT_PRESET_BY_ID !== "undefined") UNIT_PRESET_BY_ID[d.id] = unit;
    if (typeof UNIT_CATEGORY_BY_ID !== "undefined") UNIT_CATEGORY_BY_ID[d.id] = d.category;
    POINTS_DATA[d.id] = { base: d.base, perModel: d.perModel, minModels: d.minModels };
    if (typeof MAX_UNIT_SIZE !== "undefined") MAX_UNIT_SIZE[d.id] = d.maxModels;
    if (typeof UNIT_LEGACY_RULES !== "undefined") UNIT_LEGACY_RULES[d.id] = d.rules;
    addRole(d.id, d.role);
    if (d.faction && typeof UNIT_SPECIFIC_FACTION !== "undefined") UNIT_SPECIFIC_FACTION[d.id] = d.faction;
    var inferredAllegiance = d.allegiance;
    if (!inferredAllegiance && d.faction && typeof LEGION_FACTION_BY_ID !== "undefined") {
      var factionDef = LEGION_FACTION_BY_ID[d.faction];
      if (factionDef && factionDef.allegiance && factionDef.allegiance !== "any") {
        inferredAllegiance = factionDef.allegiance;
      }
    }
    addAllegiance(d.id, inferredAllegiance);
  }

  if (typeof BATTLEFIELD_ROLES !== "undefined" && !BATTLEFIELD_ROLES.fortification) {
    BATTLEFIELD_ROLES.fortification = {
      label: "Fortification",
      icon: "▣",
      color: "#57606a",
      desc: "Battlefield Fortifications selected through a Battlefield Fortifications Additional Detachment.",
    };
  }

  if (typeof ADDITIONAL_DETACHMENTS !== "undefined" && !ADDITIONAL_DETACHMENTS.battlefield_fortifications) {
    ADDITIONAL_DETACHMENTS.battlefield_fortifications = {
      name: "Battlefield Fortifications",
      desc: "Additional Detachment for Fortification Battlefield Role units. Fortifications can be selected by armies of any Faction or Allegiance.",
      icon: "▣",
      color: "#57606a",
      slots: [{ role: "fortification", count: 4 }],
    };
  }

  LEGACY_UNIT_DEFS.forEach(addUnit);

  // The core app already has a Forge Lord profile but was missing its battlefield role.
  if (typeof UNIT_PRESET_BY_ID !== "undefined" && UNIT_PRESET_BY_ID.forge_lord && !UNIT_BATTLEFIELD_ROLE.forge_lord) {
    addRole("forge_lord", "command");
  }
})();
