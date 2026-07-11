// Points costs data
// Lines 659-1052 from shooting-resolver165.jsx

// ━━━ POINTS COSTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// base: starting cost (includes minimum models per PDF)
// perModel: cost per additional model beyond minimum
// minModels: minimum unit size included in base cost
// weapons: upgrade costs by weapon name (above free/default gear)

var POINTS_DATA = {
  // ── WARLORD (Primarchs) ──
  lion: { base: 460, perModel: 0, minModels: 1 },
  khan: { base: 440, perModel: 0, minModels: 1 },
  russ: { base: 450, perModel: 0, minModels: 1 },
  dorn: { base: 435, perModel: 0, minModels: 1 },
  sanguinius: { base: 485, perModel: 0, minModels: 1 },
  ferrus: { base: 465, perModel: 0, minModels: 1 },
  guilliman: { base: 465, perModel: 0, minModels: 1 },
  vulkan: { base: 465, perModel: 0, minModels: 1 },
  corax: { base: 440, perModel: 0, minModels: 1 },
  fulgrim: { base: 425, perModel: 0, minModels: 1 },
  perturabo: { base: 425, perModel: 0, minModels: 1 },
  curze: { base: 450, perModel: 0, minModels: 1 },
  angron: { base: 450, perModel: 0, minModels: 1 },
  lorgar: { base: 445, perModel: 0, minModels: 1 },
  mortarion: { base: 425, perModel: 0, minModels: 1 },
  magnus: { base: 470, perModel: 0, minModels: 1 },
  horus: { base: 530, perModel: 0, minModels: 1 },
  alpharius: { base: 465, perModel: 0, minModels: 1 },
  // ── HIGH COMMAND ──
  praetor_pa: { base: 120, perModel: 0, minModels: 1 },
  praetor_ta: { base: 145, perModel: 0, minModels: 1 },
  praetor_sat: { base: 200, perModel: 0, minModels: 1 },
  // ── COMMAND ──
  centurion: { base: 80, perModel: 0, minModels: 1 },
  centurion_ta: { base: 100, perModel: 0, minModels: 1 },
  centurion_sat: { base: 150, perModel: 0, minModels: 1 },
  optae: { base: 50, perModel: 0, minModels: 1 },
  champion: { base: 105, perModel: 0, minModels: 1 },
  master_signals: { base: 115, perModel: 0, minModels: 1 },
  vigilator: { base: 95, perModel: 0, minModels: 1 },
  forge_lord: { base: 95, perModel: 0, minModels: 1 },
  chaplain: { base: 80, perModel: 0, minModels: 1 },
  librarian: { base: 85, perModel: 0, minModels: 1 },
  herald: { base: 100, perModel: 0, minModels: 1 },
  moritat: { base: 95, perModel: 0, minModels: 1 },
  siege_breaker: { base: 115, perModel: 0, minModels: 1 },
  esoterist: { base: 95, perModel: 0, minModels: 1 },
  praevian: { base: 95, perModel: 0, minModels: 1 },
  overseer: { base: 85, perModel: 0, minModels: 1 },
  damocles_rhino: { base: 120, perModel: 0, minModels: 1 },
  // ── TROOPS ──
  tactical: { base: 100, perModel: 10, minModels: 10 },
  despoiler: { base: 100, perModel: 10, minModels: 10 },
  breacher: { base: 140, perModel: 12, minModels: 10 },
  assault: { base: 140, perModel: 12, minModels: 10 },
  tactical_support: { base: 40, perModel: 8, minModels: 5 },
  // ── HEAVY ASSAULT ──
  cataphractii: { base: 150, perModel: 30, minModels: 5 },
  tartaros: { base: 150, perModel: 30, minModels: 5 },
  saturnine: { base: 200, perModel: 60, minModels: 3 },
  // ── SUPPORT ──
  heavy_support: { base: 50, perModel: 10, minModels: 5 },
  rapier_la: { base: 40, perModel: 40, minModels: 1 },
  apothecary: { base: 30, perModel: 0, minModels: 1 },
  techmarine: { base: 50, perModel: 0, minModels: 1 },
  araknae: { base: 125, perModel: 0, minModels: 1 },
  // ── WAR ENGINE ──
  contemptor: { base: 150, perModel: 0, minModels: 1 },
  leviathan: { base: 220, perModel: 0, minModels: 1 },
  deredeo: { base: 190, perModel: 0, minModels: 1 },
  saturnine_dread: { base: 340, perModel: 0, minModels: 1 },
  // ── TRANSPORT ──
  rhino: { base: 60, perModel: 0, minModels: 1 },
  termite: { base: 80, perModel: 0, minModels: 1 },
  drop_pod: { base: 50, perModel: 0, minModels: 1 },
  // ── HEAVY TRANSPORT ──
  land_raider: { base: 265, perModel: 0, minModels: 1 },
  spartan: { base: 400, perModel: 0, minModels: 1 },
  dreadnought_drop_pod: { base: 100, perModel: 0, minModels: 1 },
  dreadclaw: { base: 115, perModel: 0, minModels: 1 },
  kharybdis: { base: 235, perModel: 0, minModels: 1 },
  // ── ARMOUR ──
  predator: { base: 100, perModel: 0, minModels: 1 },
  sicaran: { base: 160, perModel: 0, minModels: 1 },
  sicaran_venator: { base: 170, perModel: 0, minModels: 1 },
  vindicator: { base: 140, perModel: 0, minModels: 1 },
  kratos: { base: 280, perModel: 0, minModels: 1 },
  scorpius: { base: 120, perModel: 0, minModels: 1 },
  arquitor: { base: 150, perModel: 0, minModels: 1 },
  // ── RECON ──
  recon: { base: 110, perModel: 17, minModels: 5 },
  seeker: { base: 105, perModel: 18, minModels: 5 },
  sabre: { base: 80, perModel: 0, minModels: 1 },
  outrider: { base: 85, perModel: 20, minModels: 3 },
  land_raider_exp: { base: 220, perModel: 0, minModels: 1 },
  tarantula: { base: 45, perModel: 0, minModels: 2 },
  // ── FAST ATTACK ──
  xiphon: { base: 120, perModel: 0, minModels: 1 },
  storm_eagle: { base: 200, perModel: 0, minModels: 1 },
  fire_raptor: { base: 220, perModel: 0, minModels: 1 },
  scimitar_jetbike: { base: 95, perModel: 30, minModels: 3 },
  javelin: { base: 75, perModel: 75, minModels: 1 },
  land_speeder: { base: 50, perModel: 50, minModels: 1 },
  // ── LORD OF WAR ──
  cerberus: { base: 400, perModel: 0, minModels: 1 },
  typhon: { base: 400, perModel: 0, minModels: 1 },
  glaive: { base: 650, perModel: 0, minModels: 1 },
  fellblade: { base: 650, perModel: 0, minModels: 1 },
  falchion: { base: 650, perModel: 0, minModels: 1 },
  thunderhawk: { base: 685, perModel: 0, minModels: 1 },
  // ── RETINUE (Command Squads) ──
  praetorian_cmd_jp: { base: 160, perModel: 25, minModels: 5 },
  praetorian_cmd: { base: 130, perModel: 20, minModels: 5 },
  tartaros_cmd: { base: 140, perModel: 40, minModels: 3 },
  centurion_cmd: { base: 85, perModel: 15, minModels: 5 },
  cataphractii_cmd: { base: 140, perModel: 40, minModels: 3 },
  saturnine_cmd: { base: 160, perModel: 60, minModels: 2 },
  // ── RETINUE (Veterans/Command Squads) ──
  veteran: { base: 85, perModel: 15, minModels: 5 },
  veteran_assault: { base: 120, perModel: 22, minModels: 5 },
  // ── OTHERS ──
  destroyer: { base: 110, perModel: 20, minModels: 5 },
  daemon_lesser: { base: 80, perModel: 8, minModels: 10 },
  daemon_greater: { base: 200, perModel: 0, minModels: 1 },
  // ── SOLAR AUXILIA ──
  // High Command
  legate_cmd_sa:        { base: 125, perModel: 14, minModels: 5 },
  // Command
  tactical_cmd_sa:      { base: 100, perModel: 12, minModels: 5 },
  line_cmd_sa:          { base: 65,  perModel: 7,  minModels: 5 },
  veletaris_cmd_sa:     { base: 75,  perModel: 8,  minModels: 5 },
  hermes_cmd_sa:        { base: 75,  perModel: 18, minModels: 2 },
  artillery_cmd_sa:     { base: 65,  perModel: 7,  minModels: 5 },
  armoured_cmd_sa:      { base: 150, perModel: 0,  minModels: 1 },
  // Troops
  lasrifle:             { base: 50,  perModel: 4,  minModels: 10 },
  veletaris:            { base: 90,  perModel: 8,  minModels: 10 },
  // Elites
  veletaris_vanguard_sa:{ base: 100, perModel: 9,  minModels: 10 },
  // Heavy Assault
  charonite_sa:         { base: 120, perModel: 40, minModels: 3 },
  // Support
  rapier:               { base: 30,  perModel: 30, minModels: 1 },
  basilisk_sa:          { base: 120, perModel: 0,  minModels: 1 },
  medusa_sa:            { base: 140, perModel: 0,  minModels: 1 },
  aethon_sa:            { base: 60,  perModel: 60, minModels: 1 },
  // Recon
  hermes_light_sa:      { base: 32,  perModel: 16, minModels: 2 },
  // Fast Attack
  hermes_vel_sa:        { base: 40,  perModel: 20, minModels: 2 },
  primaris_lightning_sa:{ base: 160, perModel: 0,  minModels: 1 },
  thunderbolt_sa:       { base: 120, perModel: 0,  minModels: 1 },
  // Transport
  arvus_sa:             { base: 75,  perModel: 0,  minModels: 1 },
  // Heavy Transport
  dracosan_sa:          { base: 140, perModel: 0,  minModels: 1 },
  // Armour
  leman_russ_strike_sa: { base: 140, perModel: 0,  minModels: 1 },
  leman_russ_assault_sa:{ base: 140, perModel: 0,  minModels: 1 },
  // Lord of War
  malcador_sa:          { base: 215, perModel: 0,  minModels: 1 },
  malcador_infernus_sa: { base: 240, perModel: 0,  minModels: 1 },
  valdor_sa:            { base: 225, perModel: 0,  minModels: 1 },
  stormhammer_sa:       { base: 500, perModel: 0,  minModels: 1 },
  // Legacy allied entry
  ogryn:                { base: 100, perModel: 20, minModels: 5 },
  // ── MECHANICUM (legacy allied entries) ──
  thallax: { base: 100, perModel: 30, minModels: 3 },
  myrmidon_dest: { base: 130, perModel: 40, minModels: 3 },
  castellax: { base: 75, perModel: 0, minModels: 1 },
  thanatar: { base: 200, perModel: 0, minModels: 1 },
  vorax: { base: 65, perModel: 0, minModels: 1 },
  tech_thrall: { base: 40, perModel: 2, minModels: 20 },
  // ── MECHANICUM TAGHMATA ARMY LIST ──
  // High Command
  archmagos_tm:         { base: 120, perModel: 0,   minModels: 1 },
  archmagos_abeyant_tm: { base: 150, perModel: 0,   minModels: 1 },
  // Command
  magos_tm:             { base: 100, perModel: 0,   minModels: 1 },
  magos_abeyant_tm:     { base: 130, perModel: 0,   minModels: 1 },
  arcuitor_tm:          { base: 115, perModel: 0,   minModels: 1 },
  // Support
  tech_priest_tm:       { base: 30,  perModel: 0,   minModels: 1 },
  // Elites
  scyllax_tm:           { base: 100, perModel: 25,  minModels: 4 },
  secutor_tm:           { base: 150, perModel: 45,  minModels: 3 },
  // Troops
  tech_thrall_cov_tm:   { base: 100, perModel: 10,  minModels: 10 },
  thallax_full_tm:      { base: 120, perModel: 20,  minModels: 6 },
  // Heavy Assault
  ursarax_tm:           { base: 150, perModel: 25,  minModels: 6 },
  // Support (automata/heavy)
  echidnax_tm:          { base: 40,  perModel: 10,  minModels: 4 },
  destructor_tm:        { base: 150, perModel: 45,  minModels: 3 },
  // War Engine
  domitar_tm:           { base: 100, perModel: 100, minModels: 1 },
  castellax_dest_tm:    { base: 100, perModel: 50,  minModels: 2 },
  castellax_battle_tm:  { base: 100, perModel: 50,  minModels: 2 },
  thanatar_siege_tm:    { base: 225, perModel: 0,   minModels: 1 },
  armiger_tm:           { base: 165, perModel: 0,   minModels: 1 },
  // Transport
  triaros_tm:           { base: 200, perModel: 0,   minModels: 1 },
  // ── MACHINA MALEFICA (Traitor) ──
  decimator_mm:         { base: 125, perModel: 0,   minModels: 1 },
  blood_slaughterer_mm: { base: 165, perModel: 50,  minModels: 2 },
  brass_scorpion_mm:    { base: 600, perModel: 0,   minModels: 1 },
  kytan_mm:             { base: 450, perModel: 0,   minModels: 1 },
  // ── PERSONA SCINDIO (Named Traitor Characters) ──
  scoria_mm:            { base: 410, perModel: 0,   minModels: 1 },
  draykavac_mm:         { base: 200, perModel: 0,   minModels: 1 },
  // ── CUSTODES (legacy stubs) ──
  custodian_guard: { base: 130, perModel: 40, minModels: 3 },
  sagittarum: { base: 140, perModel: 45, minModels: 3 },
  caladius: { base: 220, perModel: 0, minModels: 1 },
  aquilon: { base: 165, perModel: 50, minModels: 3 },
  // ── LEGIO CUSTODES (full army list) ──
  // High Command
  valdor_c:               { base: 400, perModel: 0,   minModels: 1 },
  // Command
  tribune_c:              { base: 250, perModel: 0,   minModels: 1 },
  shield_captain_c:       { base: 175, perModel: 0,   minModels: 1 },
  // Troops
  custodian_guard_c:      { base: 270, perModel: 45,  minModels: 6 },
  sentinel_guard_c:       { base: 240, perModel: 40,  minModels: 6 },
  // Heavy Assault
  aquilon_c:              { base: 255, perModel: 85,  minModels: 3 },
  // War Engines
  contemptor_achillus_c:  { base: 250, perModel: 0,   minModels: 1 },
  contemptor_galatus_c:   { base: 225, perModel: 0,   minModels: 1 },
  // Fast Attack
  venatari_c:             { base: 165, perModel: 55,  minModels: 3 },
  gyrfalcon_c:            { base: 140, perModel: 70,  minModels: 2 },
  pallas_c:               { base: 105, perModel: 0,   minModels: 1 },
  // Transport
  coronus_c:              { base: 180, perModel: 0,   minModels: 1 },
  // Armour
  caladius_c:             { base: 225, perModel: 0,   minModels: 1 },
  // Lord of War
  telemon_c:              { base: 360, perModel: 0,   minModels: 1 },
  orion_c:                { base: 600, perModel: 0,   minModels: 1 },
  ares_c:                 { base: 650, perModel: 0,   minModels: 1 },
  // ── DARK ANGELS (I) ──
  corswain: { base: 200, perModel: 0, minModels: 1 },
  marduk_sedras: { base: 185, perModel: 0, minModels: 1 },
  deathwing_comp: { base: 175, perModel: 35, minModels: 5 },
  dreadwing_inter: { base: 100, perModel: 12, minModels: 5 },
  inner_circle_knight: { base: 150, perModel: 30, minModels: 5 },
  // ── EMPEROR'S CHILDREN (III) ──
  eidolon: { base: 210, perModel: 0, minModels: 1 },
  lucius: { base: 165, perModel: 0, minModels: 1 },
  saul_tarvitz: { base: 155, perModel: 0, minModels: 1 },
  phoenix_term: { base: 275, perModel: 45, minModels: 5 },
  palatine_blade: { base: 140, perModel: 25, minModels: 5 },
  kakophoni: { base: 135, perModel: 22, minModels: 5 },
  // ── IRON WARRIORS (IV) ──
  warsmith: { base: 185, perModel: 0, minModels: 1 },
  tyrant_siege_term: { base: 300, perModel: 50, minModels: 5 },
  domitar_ferrum: { base: 175, perModel: 0, minModels: 1 },
  // ── WHITE SCARS (V) ──
  qin_xa: { base: 200, perModel: 0, minModels: 1 },
  hibou_khan: { base: 160, perModel: 0, minModels: 1 },
  stormseer: { base: 130, perModel: 0, minModels: 1 },
  keshig_rider: { base: 160, perModel: 30, minModels: 5 },
  kharash: { base: 175, perModel: 35, minModels: 5 },
  kyzagan: { base: 100, perModel: 0, minModels: 1 },
  // ── SPACE WOLVES (VI) ──
  hvarl: { base: 195, perModel: 0, minModels: 1 },
  geigor: { base: 145, perModel: 0, minModels: 1 },
  caster_of_runes: { base: 130, perModel: 0, minModels: 1 },
  varagyr: { base: 200, perModel: 40, minModels: 5 },
  deathsworn: { base: 155, perModel: 30, minModels: 5 },
  grey_slayer: { base: 100, perModel: 10, minModels: 10 },
  // ── IMPERIAL FISTS (VII) ──
  sigismund: { base: 250, perModel: 0, minModels: 1 },
  fafnir_rann: { base: 180, perModel: 0, minModels: 1 },
  evander_garrius: { base: 185, perModel: 0, minModels: 1 },
  camba_diaz: { base: 155, perModel: 0, minModels: 1 },
  alexis_polux: { base: 140, perModel: 0, minModels: 1 },
  templar_brethren: { base: 160, perModel: 25, minModels: 5 },
  phalanx_warder: { base: 200, perModel: 12, minModels: 10 },
  // ── NIGHT LORDS (VIII) ──
  sevatar: { base: 220, perModel: 0, minModels: 1 },
  contekar: { base: 185, perModel: 35, minModels: 5 },
  executioner_nl: { base: 100, perModel: 10, minModels: 10 },
  night_raptor: { base: 175, perModel: 25, minModels: 5 },
  // ── BLOOD ANGELS (IX) ──
  raldoron: { base: 205, perModel: 0, minModels: 1 },
  dom_zephon: { base: 190, perModel: 0, minModels: 1 },
  aster_crohne: { base: 140, perModel: 0, minModels: 1 },
  crimson_paladin: { base: 175, perModel: 35, minModels: 5 },
  dawnbreaker: { base: 160, perModel: 30, minModels: 5 },
  dawnbreaker_cohort: { base: 150, perModel: 25, minModels: 5 },
  erelim: { base: 100, perModel: 10, minModels: 10 },
  contemp_incaendius: { base: 195, perModel: 0, minModels: 1 },
  // ── IRON HANDS (X) ──
  shadrak_meduson: { base: 190, perModel: 0, minModels: 1 },
  iron_father: { base: 195, perModel: 0, minModels: 1 },
  gorgon_term: { base: 185, perModel: 35, minModels: 5 },
  immortal_ih: { base: 100, perModel: 10, minModels: 10 },
  // ── WORLD EATERS (XII) ──
  kharn: { base: 175, perModel: 0, minModels: 1 },
  lotara_sarrin: { base: 100, perModel: 0, minModels: 1 },
  red_butcher: { base: 250, perModel: 45, minModels: 5 },
  rampager: { base: 155, perModel: 25, minModels: 5 },
  // ── ULTRAMARINES (XIII) ──
  remus_ventanus: { base: 175, perModel: 0, minModels: 1 },
  invictarus_suz: { base: 175, perModel: 35, minModels: 5 },
  praetorian_um: { base: 200, perModel: 12, minModels: 10 },
  // ── DEATH GUARD (XIV) ──
  calas_typhon: { base: 195, perModel: 0, minModels: 1 },
  deathshroud: { base: 100, perModel: 45, minModels: 2 },
  grave_warden: { base: 225, perModel: 45, minModels: 5 },
  // ── THOUSAND SONS (XV) ──
  ahriman: { base: 210, perModel: 0, minModels: 1 },
  magistus_amon: { base: 170, perModel: 0, minModels: 1 },
  prosperine_sorc: { base: 130, perModel: 0, minModels: 1 },
  sekhmet: { base: 175, perModel: 35, minModels: 5 },
  khenetai_blade: { base: 145, perModel: 28, minModels: 5 },
  castellax_achea: { base: 125, perModel: 0, minModels: 1 },
  contemp_osiron: { base: 175, perModel: 0, minModels: 1 },
  // ── SONS OF HORUS (XVI) ──
  ezekyle_abaddon: { base: 215, perModel: 0, minModels: 1 },
  little_horus: { base: 185, perModel: 0, minModels: 1 },
  tybalt_marr: { base: 155, perModel: 0, minModels: 1 },
  vheren_ash: { base: 160, perModel: 0, minModels: 1 },
  garviel_loken: { base: 155, perModel: 0, minModels: 1 },
  maloghurst: { base: 145, perModel: 0, minModels: 1 },
  dark_emissary: { base: 150, perModel: 0, minModels: 1 },
  justaerin: { base: 200, perModel: 40, minModels: 5 },
  reaver_soh: { base: 150, perModel: 25, minModels: 5 },
  // ── WORD BEARERS (XVII) ──
  kor_phaeron: { base: 145, perModel: 0, minModels: 1 },
  erebus: { base: 155, perModel: 0, minModels: 1 },
  argel_tal: { base: 175, perModel: 0, minModels: 1 },
  zardu_layak: { base: 170, perModel: 0, minModels: 1 },
  dark_brethren: { base: 175, perModel: 35, minModels: 5 },
  anakatis_kul: { base: 150, perModel: 30, minModels: 5 },
  phraetus_conclave: { base: 240, perModel: 65, minModels: 3 },
  mhara_gal: { base: 195, perModel: 0, minModels: 1 },
  incendiary_wb: { base: 100, perModel: 10, minModels: 10 },
  // ── SALAMANDERS (XVIII) ──
  firedrake: { base: 185, perModel: 37, minModels: 5 },
  pyroclast: { base: 120, perModel: 22, minModels: 5 },
  // ── RAVEN GUARD (XIX) ──
  kaedes_nex: { base: 130, perModel: 0, minModels: 1 },
  mor_deythan: { base: 130, perModel: 22, minModels: 5 },
  dark_fury_rg: { base: 175, perModel: 30, minModels: 5 },
  // ── ALPHA LEGION (XX) ──
  armillus_dynat: { base: 195, perModel: 0, minModels: 1 },
  saboteur: { base: 140, perModel: 0, minModels: 1 },
  exodus_al: { base: 145, perModel: 0, minModels: 1 },
  headhunter: { base: 110, perModel: 18, minModels: 5 },
  lernaean: { base: 225, perModel: 40, minModels: 5 },
};

// Weapon upgrade costs (above free/default wargear) — from Legion Wargear PDF
var WEAPON_UPGRADE_COSTS = {
  // Legion Special Weapons (per model)
  Flamer: 5,
  "Plasma Gun (Sustained)": 10,
  "Plasma Gun (Maximal)": 10,
  "Melta Gun": 15,
  "Volkite Charger": 5,
  "Volkite Caliver": 10,
  "Rotor Cannon": 10,
  // Legion Heavy Weapons (per model)
  "Heavy Bolter": 10,
  "Heavy Flamer": 10,
  Autocannon: 20,
  "Missile Launcher": 15,
  "Missile L. (Krak)": 15,
  "Missile L. (Frag)": 15,
  "Multi-Melta": 25,
  "Plasma Cannon (Sustained)": 20,
  "Plasma Cannon (Maximal)": 20,
  "Volkite Culverin": 15,
  Lascannon: 25,
  // Legion Combi-weapons (per model)
  // NOTE: Combi-Bolter/Flamer/Melta/Volkite/Disintegrator/Grav are priced in
  // the "Additional costs" block further down (duplicate keys removed — the
  // later entries were silently winning at runtime).
  "Combi-Plasma (Sustained)": 10,
  "Combi-Plasma (Maximal)": 10,
  "Combi-Grenade L. (Frag)": 10,
  "Combi-Grenade L. (Krak)": 10,
  // Legion Pistols
  "Plasma Pistol (Sustained)": 5,
  "Plasma Pistol (Maximal)": 5,
  "Volkite Serpenta": 5,
  "Disintegrator Pistol": 5,
  "Archaeotech Pistol": 10,
  "Hand Flamer": 5,
  // Terminator weapons
  "Reaper Autocannon": 15,
  "Plasma Blaster (Sustained)": 10,
  "Plasma Blaster (Maximal)": 10,
  "Heavy Disintegrator": 10,
  "Twin Heavy Disintegrator": 10,
  "Plasma Bombard (Sustained)": 0,
  "Plasma Bombard (Maximal)": 0,
  // Disintegrator weapons (Veteran/Seeker specials)
  "Disintegrator Rifle": 5,
  "Disintegrator Blaster": 10,
  // Veteran alternate weapons
  "Astartes Shotgun (Solid)": 2,
  "Astartes Shotgun (Scatter)": 2,
  // Breacher specials
  "Graviton Gun": 10,
  Lascutter: 10,
  // Vehicle sponson weapons — see "Vehicle sponsons" block below
  // Sergeant melee upgrades (from Legion Sergeant Melee Weapons list)
  Chainsword: 0,
  Chainaxe: 0,
  "Charnabal Sabre": 5,
  "Power Weapon": 10,
  "Power Fist": 15,
  "Thunder Hammer": 15,
  "Lightning Claw": 10,
  // Officer Wargear / Paragon
  "Paragon Blade": 15,
  // (Archaeotech Pistol priced above under Legion Pistols)
  // Terminator Melee Weapons
  Chainfist: 5,
  "Pair Lightning Claws": 5,
  // Saturnine-specific
  "Saturnine Concussion Hammer": 10,
  "Plasma Blaster": 10,
  "Saturnine Teleportation Transponder": 60,
  // (Twin Heavy Disintegrator priced above under Terminator weapons)
  // Psychic Disciplines
  Biomancy: 20,
  Pyromancy: 10,
  Telekinesis: 20,
  Divination: 20,
  Thaumaturgy: 0,
  Telepathy: 10,
  // Moritat
  "Overcharged Plasma Pistols (pair)": 10,
  // Herald
  "Herald Power Fist": 10,
  // Misc
  "Melta Bombs": 5,
  "Cyber-Familiar": 10,
  Searchlights: 5,
  "Dozer Blade": 5,
  "Hunter-Killer Missile": 5,
  "Augury Scanner": 10,
  "Combat Shield": 2,
  Vexilla: 10,
  // Rapier upgrades
  "Laser Destroyer": 25,
  "Graviton Cannon": 20,
  "Quad Launcher": 20,
  // Dreadnought arms
  "Gravis Power Fist + Combi-Bolter": 5,
  "Gravis Chainfist + Combi-Bolter": 5,
  "Gravis Bolt Cannon": 0,
  "Gravis Melta Cannon": 15,
  "Gravis Autocannon": 10,
  "Gravis Plasma Cannon": 15,
  "Gravis Volkite Culverin": 5,
  // Leviathan arms
  "Leviathan Siege Claw + Meltagun": 0,
  "Leviathan Siege Drill + Meltagun": 5,
  "Grav-Flux Bombard": 10,
  "Leviathan Storm Cannon": 15,
  "Cyclonic Melta Lance": 20,
  // Deredeo upgrades
  "Hellfire Plasma Cannonade": 15,
  "Arachnus Heavy Lascannon Battery": 25,
  "Volkite Falconet": 0,
  // Saturnine Dread
  "Saturnine Dread Disintegrator Cannon": 10,
  "Inversion Beamer": 10,
  "Graviton Pulveriser": 10,
  // Predator turrets
  "Flamestorm Cannon": 0,
  "Executioner Plasma Destroyer": 25,
  "Heavy Conversion Beam Cannon": 30,
  "Magna-Melta Cannon": 20,
  "Graviton Cannon (Turret)": 20,
  // Sicaran turrets
  "Arcus Missile Launcher": 40,
  "Punisher Rotary Cannon": 10,
  "Omega Plasma Array": 25,
  // Kratos turrets
  "Flashburn Shells": 10,
  "Volkite Cardanelle": 0,
  "Melta Blast-Gun": 30,
  // Vindicator
  "Magna Laser Destroyer": 20,
  // Vehicle sponsons
  "Heavy Bolter Sponsons": 0,
  "Lascannon Sponsons": 20,
  "Volkite Culverin Sponsons": 10,
  "Heavy Flamer Sponsons": 5,
  // Sabre
  "Neutron Blaster": 10,
  "Volkite Saker": 0,
  // Land Speeder
  "Havoc Launcher": 5,
  // Javelin
  "Two Lascannon": 5,
  "Two Volkite Culverin": 5,
  // Tarantula
  "Twin Lascannon (Tarantula)": 20,
  "Twin Volkite Culverin (Tarantula)": 15,
  "Sentry Melta Array": 25,
  "Hyperios Missile Launcher": 15,
  // Storm Eagle
  "Twin Multi-Melta": 15,
  "Cyclone Missile Launcher": 10,
  // Fire Raptor
  "Gravis Autocannon Batteries": 15,
  "Hellstrike Missiles": 20,
  // Land Raider
  "Hull Twin Heavy Flamer": 0,
  "Hull Twin Lascannon": 10,
  // Spartan
  "Laser Destroyers (Sponson pair)": 0,
  "Gravis Heavy Bolter Battery (Sponson pair)": 0,
  // Drop Pod
  "Twin Volkite Chargers (Pintle pair)": 10,
  "Heavy Flamers (Pintle pair)": 5,
  // Default/free weapons (no extra cost)
  Bolter: 0,
  "Bolt Pistol": 0,
  "Volkite Charger (Cataphractii)": 0,
  "Combi-Bolter (Tartaros)": 0,
  "Volkite Charger (default)": 0,
  // Additional costs
  "Nemesis Bolter": 5,
  "Astartes Shotgun": 2,
  "Twin Bolter": 0,
  "Twin Plasma Gun (Sustained)": 15,
  "Twin Plasma Gun (Maximal)": 15,
  "Kraken Bolter": 0,
  "Combi-Bolter": 5,
  "Combi-Flamer": 10,
  "Combi-Plasma": 10,
  "Combi-Melta": 10,
  "Combi-Volkite": 10,
  "Combi-Grenade": 10,
  "Combi-Disintegrator": 10,
  "Combi-Grav": 10,
  Bayonet: 1,
  "Chain Bayonet": 2,
  "Particle Shredder": 5,
  "Grenade Harness": 5,
  "Legion Standard": 20,
  "Company Standard": 20,
  "Boarding Shield": 5,
  // Saturnine Dread photonic/concussive swaps
  "Concussive Resonator": 10,
  "Heavy Particle Shredder": 10,
  // Phosphex
  "Phosphex Discharger": 20,
  // ── Legion-specific weapons (Liber Loyalist / Hereticus) ──
  "Calibanite Warblade": 5,
  "Terranic Greatsword": 0,
  "Power Glaive": 10,
  "Fenrisian Axe": 2,
  "Frost Sword": 5,
  "Frost Axe": 5,
  "Frost Claw": 5,
  "Great Frost Blade": 10,
  "Solarite Power Gauntlet": 5,
  "Blade of Perdition": 5,
  "Axe of Perdition": 5,
  "Maul of Perdition": 5,
  "Spear of Perdition": 5,
  "Inferno Pistol": 5,
  "Legatine Axe": 5,
  "Raven's Talon": 0,
  "Pair of Raven's Talons": 0,
  "Phoenix Power Spear": 10,
  "Sonic Lance": 10,
  "Graviton Crusher": 0,
  Chainglaive: 5,
  "Headsman's Axe": 10,
  "Meteor Hammer": 5,
  "Excoriator Chainaxe": 0,
  "Paired Falax Blades": 0,
  "Barb-Hook Lash": 0,
  "Power Scythe": 10,
  "Achea Pattern Force Sword": 5,
  "Carsoran Power Axe": 5,
  "Carsoran Power Tabar": 10,
  "Power Dagger": 0,
  "Banestrike Bolter": 5,
  "Banestrike Combi-Bolter": 5,
  "Banestrike Bolt Cannon": 0,
  "Venom Spheres": 5,
  "Artificer Power Axe": 0,
  "Graviton Pistol": 5,
  "Forge-crafted Power Sword": 5,
  "Forge-crafted Power Axe": 5,
  "Forge-crafted Power Maul": 5,
  "Forge-crafted Power Lance": 5,
  "Forge-crafted Power Fist": 10,
  "Forge-crafted Thunder Hammer": 10,
  "Forge-crafted Hand Flamer": 5,
  "Forge-crafted Flamer": 10,
  "Forge-crafted Heavy Flamer": 10,
  "Plasma Burner (Sustained)": 0,
  "Plasma Burner (Maximal)": 0,
  "Plasma Incinerator (Sustained)": 0,
  "Plasma Incinerator (Maximal)": 0,
};
