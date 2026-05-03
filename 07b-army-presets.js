// Army List presets — these are shipped with the toolkit and can be
// loaded directly from the Army Builder UI.  Each preset is a literal
// copy of a CSV that the Export feature would have produced, so it is
// imported via the same `importArmyCsv` path (guaranteeing detachments
// round-trip correctly).
//
// To add a new preset:
//   1) Build the army in the Army Builder and click EXPORT.
//   2) Open the downloaded .csv in a text editor.
//   3) Add a new entry to ARMY_PRESETS with the CSV text as a backtick
//      template string.  Make sure the CSV contains no backticks or
//      ${...} sequences (real-world exports don't).

var ARMY_PRESETS = [
  {
    id: "dark_angels_v2",
    name: "Dark Angels — Lion El'Jonson (3000pt)",
    allegiance: "loyalist",
    faction: "dark_angels",
    pointsLimit: 3000,
    csv: `"Army List","LOYALIST","Faction:","dark_angels","Points Limit:","3000"

"#","Unit Name","Unit ID","Battlefield Role","Detachment","Detachment Type","Detachment Name","Models","Primary Weapon","Sgt Weapon","Equipment","Points","Warlord"
"1","Praetor (Power Armour)","praetor_pa","high_command","primary","primary","Crusade Primary","1","Bolt Pistol","—","—","120",""
"2","Lion El'Jonson (I)","lion","warlord","add_1776836072665","warlord_det","Warlord Detachment","1","Fusil Actinaeus (Plasma)","—","—","460","YES"
"3","Praetorian Command Squad","praetorian_cmd","retinue","add_1776836072665","warlord_det","Warlord Detachment","5","Bolter","—","—","130",""
"4","Spartan","spartan","heavy_transport","add_1776836072665","warlord_det","Warlord Detachment","1","Lascannon Array x2","—","—","400",""
"5","Centurion","centurion","command","primary","primary","Crusade Primary","1","Bolt Pistol","—","—","80",""
"6","Tactical Squad","tactical","troops","primary","primary","Crusade Primary","10","Bolter","Plasma Pistol (Sustained)","noxVox, bayonet","135",""
"7","Rhino","rhino","transport","primary","primary","Crusade Primary","1","Pintle Combi-Bolter","—","—","60",""
"8","Rhino","rhino","transport","primary","primary","Crusade Primary","1","Pintle Combi-Bolter","—","—","60",""
"9","Drop Pod","drop_pod","transport","primary","primary","Crusade Primary","1","Two Pintle Combi-Bolters","—","—","50",""
"10","Drop Pod","drop_pod","transport","primary","primary","Crusade Primary","1","Two Pintle Combi-Bolters","—","—","50",""
"11","Leviathan Dreadnought","leviathan","war_engine","logistical_1776836092881.587","","","1","Leviathan Storm Cannon","—","—","250",""
"12","Saturnine Terminator Command Squad","saturnine_cmd","retinue","legion_1776836107215","deathwing_conclave","Deathwing Conclave","2","Plasma Bombard (Sustained)","—","—","220",""
"13","Veteran Assault Squad","veteran_assault","elites","legion_1776836107215","deathwing_conclave","Deathwing Conclave","5","Plasma Pistol (Sustained)","Plasma Pistol (Sustained)","noxVox","165",""
"14","Saturnine Terminators","saturnine","heavy_assault","legion_1776836107215","deathwing_conclave","Deathwing Conclave","3","Plasma Bombard (Sustained)","—","—","215",""
"15","Legion Champion","champion","command","primary","primary","Crusade Primary","1","Bolt Pistol","—","—","105",""
"16","Breacher Squad","breacher","troops","primary","primary","Crusade Primary","10","Graviton Gun","Plasma Pistol (Sustained)","noxVox","245",""
"17","Tactical Squad","tactical","troops","primary","primary","Crusade Primary","10","Bolter","Plasma Pistol (Sustained)","noxVox, chainBayonet","145",""
"18","Tactical Squad","tactical","troops","primary","primary","Crusade Primary","10","Bolter","—","—","100",""

"","","","","","","","","","","TOTAL:","2990",""
`,
  },
  {
    id: "blood_angels_v1",
    name: "Blood Angels — Dominion Zephon (3000pt)",
    allegiance: "loyalist",
    faction: "blood_angels",
    pointsLimit: 3000,
    csv: `"Army List","LOYALIST","Faction:","blood_angels","Points Limit:","3000"

"#","Unit Name","Unit ID","Battlefield Role","Detachment","Detachment Type","Detachment Name","Models","Primary Weapon","Sgt Weapon","Equipment","Points","Warlord"
"1","Dominion Zephon (IX - Cmd)","dom_zephon","command","primary","primary","Crusade Primary","1","—","—","—","190",""
"2","Centurion (Terminator)","centurion_ta","command","primary","primary","Crusade Primary","1","Combi-Bolter","—","—","105",""
"3","Tactical Squad","tactical","troops","primary","primary","Crusade Primary","10","Bolter","—","—","100",""
"4","Assault Squad","assault","troops","primary","primary","Crusade Primary","10","Bolt Pistol","—","—","140",""
"5","Fellblade Super-Heavy","fellblade","lord_of_war","add_1777782416542","lord_of_war_det","Lord of War Detachment","1","Fellblade Accelerator Cannon (HE)","—","—","650",""
"6","Land Raider Carrier","land_raider","heavy_transport","aux_1777782416543","armoured_fist","Armoured Fist","1","Twin Lascannon x2 (sponsons)","—","—","265",""
"7","Praetor (Saturnine)","praetor_sat","high_command","primary","primary","Crusade Primary","1","Plasma Blaster (Sustained)","—","—","210",""
"8","Spartan","spartan","heavy_transport","aux_1777782416543","armoured_fist","Armoured Fist","1","Lascannon Array x2","—","—","400",""
"9","Saturnine Dreadnought","saturnine_dread","war_engine","aux_1777782416545","heavy_support","Heavy Support","1","Heavy Plasma Bombard (Sustained)","—","—","340",""
"10","Heavy Support Squad","heavy_support","support","aux_1777782416546","tactical_support","Tactical Support","5","Lascannon","—","—","175",""
"11","Dawnbreaker Cohort (IX - Elite)","dawnbreaker_cohort","elites","aux_1777782416544","revelation_host","Revelation Host","5","Grenade Discharger (Frag)","—","—","150",""

"","","","","","","","","","","TOTAL:","2725",""
`,
  },
  {
    id: "luna_wolves_v3",
    name: "Sons of Horus — Luna Wolves (3000pt)",
    allegiance: "traitor",
    faction: "sons_of_horus",
    pointsLimit: 3000,
    csv: `"Army List","TRAITOR","Faction:","sons_of_horus","Points Limit:","3000"

"#","Unit Name","Unit ID","Battlefield Role","Detachment","Detachment Type","Detachment Name","Models","Primary Weapon","Sgt Weapon","Equipment","Points","Warlord"
"1","Praetor (Saturnine)","praetor_sat","high_command","primary","primary","Crusade Primary","1","Plasma Blaster (Sustained)","—","—","210",""
"2","Centurion (Saturnine Terminator)","centurion_sat","command","primary","primary","Crusade Primary","1","Plasma Bombard (Sustained)","—","—","150",""
"3","Tactical Squad","tactical","troops","aux_1776837027414","supremacy_cadre","Supremacy Cadre","10","Bolter","—","noxVox","110",""
"4","Tactical Squad","tactical","troops","aux_1776837027414","supremacy_cadre","Supremacy Cadre","10","Bolter","Plasma Pistol (Sustained)","noxVox, chainBayonet","135",""
"5","Veteran Tactical Squad","veteran","elites","aux_1776837027414","supremacy_cadre","Supremacy Cadre","10","Disintegrator Rifle","Combi-Disintegrator","noxVox, bayonet","235",""
"6","Saturnine Terminators","saturnine","heavy_assault","aux_1776837027414","supremacy_cadre","Supremacy Cadre","3","Plasma Bombard (Sustained)","—","—","200",""
"7","Master of Signals","master_signals","command","primary","primary","Crusade Primary","1","Bolt Pistol","—","—","115",""
"8","Rhino","rhino","transport","primary","primary","Crusade Primary","1","Pintle Combi-Bolter","—","—","60",""
"9","Rhino","rhino","transport","primary","primary","Crusade Primary","1","Pintle Combi-Bolter","—","—","60",""
"10","Tactical Squad","tactical","troops","primary","primary","Crusade Primary","10","Bolter","—","noxVox","110",""
"11","Tactical Squad","tactical","troops","primary","primary","Crusade Primary","10","Bolter","Plasma Pistol (Sustained)","noxVox, metaBomb","140",""
"12","Tactical Squad","tactical","troops","primary","primary","Crusade Primary","10","Bolter","Plasma Pistol (Sustained)","noxVox","115",""
"13","Siege Breaker","siege_breaker","command","primary","primary","Crusade Primary","1","Bolt Pistol","—","—","115",""
"14","Kratos Assault Tank","kratos","armour","aux_1776837027415","armoured_support","Armoured Support","1","Kratos Battlecannon (HE)","—","—","280",""
"15","Kratos Assault Tank","kratos","armour","aux_1776837027415","armoured_support","Armoured Support","1","Kratos Battlecannon (HE)","—","—","280",""
"16","Rapier Battery (Legiones)","rapier_la","support","aux_1776837027416","tactical_support","Tactical Support","1","Laser Destroyer","—","—","65",""
"17","Rapier Battery (Legiones)","rapier_la","support","aux_1776837027416","tactical_support","Tactical Support","1","Quad Launcher (Frag)","—","—","40",""
"18","Veteran Tactical Squad","veteran","elites","apex_1776837027417","army_vanguard","Army Vanguard","10","Bolter","Plasma Pistol (Sustained)","noxVox, bayonet","185",""
"19","Veteran Tactical Squad","veteran","elites","apex_1776837027417","army_vanguard","Army Vanguard","10","Bolter","Plasma Pistol (Sustained)","noxVox","245",""
"20","Drop Pod","drop_pod","transport","primary","primary","Crusade Primary","1","Two Pintle Combi-Bolters","—","—","50",""
"21","Drop Pod","drop_pod","transport","primary","primary","Crusade Primary","1","Two Pintle Combi-Bolters","—","—","50",""

"","","","","","","","","","","TOTAL:","2950",""
`,
  },
];
