# Custodes comparison with New Recruit — 25 September 2026

## Result and scope

The local Custodes list is not yet fully accurate. The earlier category patch fixes the established core/expanded roster, but this audit found additional omissions and combat-profile problems. This report records the remaining differences; it does not certify the combat resolver as compliant or claim that the additional findings are fixed.

Compared the [New Recruit HH3 Custodes catalogue](https://www.newrecruit.eu/wiki/horus-heresy-3rd-edition/horus-heresy-3rd-edition/legio-custodes) and its model pages with the latest [BSData HH3 Custodes catalogue](https://github.com/BSData/horus-heresy-3rd-edition/blob/main/Legio%20Custodes.json), revision 22. Exact downloaded file hashes, model characteristics and weapon characteristics are recorded in [the reference snapshot](custodes-reference-2026-09-25.json). The current BSData catalogue includes Adjutorum Sodality; the indexed New Recruit wiki catalogue does not yet list it, and its direct wiki page could not be fetched. Treat that addition as an upstream-data finding, not a verified live New Recruit UI entry.

New Recruit also imports Assassins, Mechanicum units and configuration entries. These are not additional native Custodes units and should not all be copied into the normal Custodes roster. Their availability depends on their own army-selection rules. Sisters of Silence are a separate army list.

## Missing units, variants and options

| Entry | Correct role / cost | Local status |
|---|---|---|
| Adrasite Guard Sodality | Elites; 6–12 models, 60 points each | Added by the preceding local category patch; absent before it. |
| Pyrithite Guard Sodality | Elites; 6–12 models, 60 points each | Added by the preceding local category patch; absent before it. |
| Sagittarum Guard Sodality | Support; 6–12 models, 40 points each | Previous generic-category stub was excluded by the Custodes army filter. Moved to CUSTODES: SUPPORT; minimum size and points corrected locally. |
| Adjutorum Sodality | Retinue; 275 points; one Vestarios, one Signifier, one Blade Champion; maximum one unit per roster | Missing. Present in latest BSData; indexed New Recruit wiki lags. Mixed model stats require explicit handling. |
| Caladius Annihilator Grav-Tank | Armour; 235 points | Its main gun appears as an option under the 225-point Caladius, but there is no separately priced variant. |
| Sentinel Vexillarius | Option within Sentinel Guard, 70 points replacing a 40-point model | Missing model option; has 6+ INV instead of the ordinary Sentinel’s 5+. Not a separate unit. |
| Neutronium cascade mine | Venatari option | Missing melee profile/option. |
| Twin neutronium cascade projector | Telemon caestus loadouts | Missing from Telemon’s ranged choices. Present on the tanks. |

## Categories

The preceding patch corrects Venatari → Recon, Telemon → War-Engine, Coronus → Heavy Transport and Sagittarum → Support. Troops are Custodian and Sentinel Guard. Fast Attack contains Gyrfalcon Jetbikes and Pallas. Aquilon is Heavy Assault; Caladius is Armour; Orion and Ares are Lords of War. Valdor is Warlord, Tribune High Command and Shield Captain Command. Adrasite/Pyrithite are Elites; upstream Adjutorum is Retinue.

## Unit-stat and points comparison

All 19 currently selectable local Custodes entries match the source on the overlapping main-preset BS/T/W/SAV/INV/LD fields (vehicles only have BS/armour/HP in the source). This does **not** make the complete profiles correct: model movement/WS/S/I/A/CL/WP/IN are generally absent from the main presets, melee tables have their own inconsistent copies, and vehicles lack explicit vehicle fields.

| Unit | Role | Source minimum / maximum | Source base points | Main preset findings |
|---|---|---|---|---|
| Constantin Valdor | Warlord | 1 / 1 | 400 | Stored shooting/defence fields match |
| Tribune | High Command | 1 / 1 | 250 | Stored shooting/defence fields match |
| Shield Captain | Command | 1 / 1 | 175 | Stored shooting/defence fields match |
| Aquilon Terminator Sodality | Heavy Assault | 3 / 9 | 255 | Stored shooting/defence fields match; missing explicit maximum size |
| Custodian Guard Sodality | Troops | 6 / 12 | 270 | Stored shooting/defence fields match; missing explicit maximum size |
| Sentinel Guard Sodality | Troops | 6 / 12 | 240 | Stored shooting/defence fields match; missing explicit maximum size |
| Contemptor-Achillus Dreadnought | War-engine | 1 / 1 | 250 | Stored shooting/defence fields match |
| Contemptor-Galatus Dreadnought | War-engine | 1 / 1 | 225 | Stored shooting/defence fields match |
| Telemon Heavy Dreadnought | War-engine | 1 / 1 | 360 | Stored shooting/defence fields match |
| Coronus Grav-Carrier | Heavy Transport | 1 / 1 | 180 | Missing isVehicle, avF/avS/avR and hp fields |
| Venatari Sodality | Recon | 3 / 6 | 165 | Stored shooting/defence fields match; missing explicit maximum size |
| Gyrfalcon Jetbike Sodality | Fast Attack | 2 / 10 | 140 | Stored shooting/defence fields match; missing explicit maximum size |
| Pallas Grav-Attack | Fast Attack | 1 / 1 | 105 | Missing isVehicle, avF/avS/avR and hp fields |
| Caladius Grav-Tank | Armour | 1 / 1 | 225 | Missing isVehicle, avF/avS/avR and hp fields |
| Orion Assault Dropship | Lord of War | 1 / 1 | 600 | Missing isVehicle, avF/avS/avR and hp fields |
| Ares Gunship | Lord of War | 1 / 1 | 650 | Missing isVehicle, avF/avS/avR and hp fields |
| Adrasite Guard Sodality | Elites | 6 / 12 | 360 | Stored shooting/defence fields match |
| Pyrithite Guard Sodality | Elites | 6 / 12 | 360 | Stored shooting/defence fields match |
| Sagittarum Guard Sodality | Support | 6 / 12 | 240 | Stored shooting/defence fields match |
| Adjutorum Sodality | Retinue | 1 / 1 | 275 | Missing |

The source defaults above are unmodified profiles, before optional wargear and Prime benefits. Caladius also has the 235-point Annihilator model option. Adjutorum is exactly three different models, despite the individual model constraints of one each. Existing base points for the 19 established entries match; upgrade costing and loadout legality do not.

### Specific melee-stat errors

| Unit / weapon | Local value | Source value |
|---|---|---|
| Valdor / Apollonian spear | Initiative 10; no damage field; Critical Hit flag defaults to 6+ | I6; D2; Critical Hit (5+); Duellist’s Edge (2) applies in challenges, not permanently to base Initiative |
| Shield Captain / eternity blade | W5, I7 | W3, I6 (base I5 plus blade modifier +1) |
| Shield Captain / eternity spear | W5, I6 | W3, I5 |
| Shield Captain / Misericordia | W5, I6, A4 | W3, base I5; Blade of Mercy is a special attack, not four ordinary attacks |
| Custodian Guard / guardian spear | I7 | I5 |
| Gyrfalcon / charging lance | I8, A2 | I9 (base 5 +4); AM0, with Impact (AM) applied only in the charging context; D3 |
| Gyrfalcon / defensive lance | I3 | I4 (base 5 −1) |
| Gyrfalcon / Misericordia | I4 | Base I5; special Blade of Mercy handling required |
| Aquilon / solarite gauntlet | Damage omitted | D2 |
| Achillus / dreadspear | Damage omitted | D3 |
| Galatus / warblade | Damage omitted | D2 |
| Telemon / caestus | Damage omitted | D3; paired caestus D4 |

All local Custodes melee profiles omit an explicit damage field, including weapons whose damage exceeds one. Some consumers default absent damage to one. The special Blade of Mercy profile has AM1 and variable damage equal to the applicable Misericordia model count; the ordinary local Misericordia attack entries do not represent that process. Sagittarum’s basic close-combat fallback also omits this special option.

### Vehicle armour

| Vehicle | Front / side / rear | HP | Movement |
|---|---|---|---|
| Coronus Grav-Carrier | 13 / 13 / 11 | 8 | 12 |
| Pallas Grav-Attack | 12 / 11 / 11 | 4 | 16 |
| Caladius Grav-Tank | 13 / 13 / 11 | 7 | 14 |
| Caladius Annihilator Grav-Tank | 13 / 13 / 11 | 7 | 14 |
| Orion Assault Dropship | 13 / 13 / 13 | 12 | 18 |
| Ares Gunship | 13 / 13 / 13 | 12 | 18 |

The local entries store front armour in `t` and hull points in `w`, but omit `isVehicle`, `avF`, `avS`, `avR` and `hp`. The target-selection code reads `preset.isVehicle`; these units therefore do not automatically select the vehicle resolution path.

## Weapon findings

Most existing ranged FP/Strength/AP/Damage numbers match their corresponding source weapon. However, every Custodes ranged entry omits range, and several rule names, thresholds, selectable weapons and weapon counts are incomplete.

| Weapon / option | Difference |
|---|---|
| Achillus dreadspear; Twin Corvae las-pulser | Local Breaching flag is incorrect. Source rule is Armour-breaker (4+), alongside Armourbane. |
| Adrathic devastator | Source Rending (5+); local generic Rending flag has no 5+ threshold. |
| Adrathic desolator | Source Rending (4+); local generic Rending flag has no 4+ threshold. |
| Guardian spear, Eternity Spear, Lastrum storm bolter | Shred (5+) is flattened to a boolean. |
| Sentinel warblade | Shred (6+) is flattened to a boolean. |
| Eternity Blade | Shred (4+), Aflame (2), Duellist’s Edge (1); local profile omits the latter two and the Shred threshold. |
| Eternity Spear, melee | Aflame (2) omitted. |
| Apollonian spear | Critical Hit (5+) and Duellist’s Edge (2) not encoded accurately. |
| Verutum lance, melee | Precision (5+) missing. |
| Solarite talon; Galatus warblade | Reaping Blow (2)/(3) flattened to a single flag; Galatus Aflame (2) also missing. |
| Telemon caestus, single/paired | Shock (Pinned) omitted; damage omitted. |
| Twin neutronium cascade projector; neutronium magna-cascade cannon | Annihilation Cascade (7)/(10) and Phage (T) omitted. |
| Infernus incinerator | Panic (1) omitted. The x2 label still carries one weapon’s FP, so model count alone does not represent both weapons. |
| Infernus firepike; Galatus flame attack; Ares firebombs | Panic (2) flattened; firebomb Blast (7-inch) and Limited (1) not represented accurately. |
| Orion twin bolt cannons and missile pods | Labels say x2 but FP values represent one weapon. Must resolve two weapons or encode an explicit count. |
| Sagittarum caliver | Bolt volley Heavy (FP), secondary Limited (1), and mutually related Combi modes need explicit handling. Type labels alone are insufficient. |
| Shield Captain shooting list | Includes Eternity Blade as a zero-shot ranged weapon; source has no ranged blade profile. |
| Lastrum storm bolter | Local Rapid Fire label is not a rule in its New Recruit profile. Source lists FP4 and Shred (5+). |
| Multi-mode Arachnus weapons | Heavy (FP), Heavy (D), and Ordnance (D) are collapsed into generic type labels. |

### Source ranged profiles

One weapon per row; repeated copies on a model must be accounted for separately. This table is the source profile, not a claim that each special rule is implemented.

| Weapon | Range | FP | Strength | AP | D | Special rules |
|---|---|---|---|---|---|---|
| The Apollonian Spear | 18 | 2 | 5 | 2 | 2 | Suppressive (1) |
| Adrathic devastator | 18 | 1 | 6 | 2 | 4 | Rending (5+) |
| Adrathic combi-destructor | 12 | 2 | 5 | 2 | 2 | Rending (6+) |
| Infernus firebomb clusters | 18 | 1 | 6 | 4 | 2 | Blast (7"), Panic (2), Limited (1) |
| Infernus incinerator | Template | 1 | 6 | 4 | 1 | Template, Panic (1) |
| Galatus warblade | Template | 1 | 6 | 4 | 2 | Template, Panic (2) |
| Iliastus accelerator culverin | 36 | 4 | 9 | 3 | 2 | Breaching (5+), Rapid Tracking |
| Twin Iliastus accelerator cannon | 60 | 6 | 8 | 3 | 2 | Breaching (6+), Rapid Tracking |
| Twin Lastrum bolt cannon | 36 | 6 | 6 | 4 | 2 | - |
| Adrastus bolt caliver - Bolt volley (Primary) | 36 | 2 | 6 | 4 | 2 | Heavy (FP), Combi |
| Adrastus bolt caliver -  Adrathic beam (Secondary | 24 | 1 | 6 | 2 | 2 | Rending (6+), Limited (1), Combi |
| Twin Corvae las-pulser | 18 | 1 | 10 | 3 | 3 | Armourbane, Armour-breaker (4+) |
| Twin Arachnus blaze carronade - Burst Fire | 48 | 6 | 7 | 3 | 2 | Heavy (FP) |
| Twin Arachnus blaze carronade - Concentrated fire | 72 | 2 | 10 | 2 | 2 | Ordnance (D), Armourbane |
| Twin Arachnus storm carronade - Burst Fire | 24 | 6 | 7 | 3 | 2 | Heavy (FP) |
| Twin Arachnus storm carronade - Concentrated fire | 30 | 2 | 10 | 2 | 2 | Heavy (D), Armourbane |
| Arachnus storm cannon - Burst Fire | 24 | 4 | 6 | 3 | 2 | Heavy (FP) |
| Arachnus storm cannon - Concentrated fire | 30 | 2 | 9 | 2 | 3 | Heavy (FP), Armourbane |
| Kinetic destroyer | 12 | 3 | 7 | 4 | 1 | Breaching (5+) |
| Lastrum storm bolter | 24 | 4 | 5 | 4 | 1 | Shred (5+) |
| Lastrum bolt cannon | 36 | 3 | 6 | 4 | 2 | - |
| Twin Arachnus blaze cannon - Burst Fire | 36 | 5 | 6 | 3 | 1 | Heavy (FP) |
| Twin Arachnus blaze cannon - Concentrated fire | 48 | 2 | 9 | 2 | 2 | Heavy (D), Armourbane |
| Spiculus missile launcher | 36 | 6 | 5 | 4 | 1 | Breaching (6+), Suppressive (2) |
| Spiculus heavy missile pod | 48 | 4 | 6 | 4 | 2 | Breaching (5+), Suppressive (1) |
| Achillus dreadspear | 18 | 1 | 10 | 3 | 2 | Armourbane, Armour-breaker (4+) |
| Sentinel warblade | 8 | 3 | 4 | 4 | 1 | Shred (6+) |
| Guardian spear | 18 | 2 | 4 | 4 | 1 | Shred (5+) |
| Adrasite spear  | 12 | 1 | 5 | 2 | 2 | Rending (6+) |
| Pyrithite spear | 6 | 1 | 8 | 2 | 2 | Melta (3) |
| Verutum lance | 8 | 1 | 5 | 4 | 1 | Stun (1) |
| Infernus firepike | Template | 1 | 6 | 4 | 1 | Template, Panic (2) |
| Eternity Spear | 18 | 2 | 4 | 3 | 1 | Shred (5+) |
| Twin Iliastus accelerator fusil | 24 | 4 | 7 | 3 | 2 | Breaching (6+), Rapid Tracking |
| Twin neutronium cascade projector | Template | 1 | 7 | 3 | 2 | Template, Breaching (6+), Annihilation Cascade (7), Phage (T) |
| Neutronium magna-cascade cannon | Template | 1 | 10 | 3 | 3 | Template (Hellstorm), Breaching (4+), Annihilation Cascade (10), Phage (T) |
| Adrathic desolator | 24 | 2 | 7 | 2 | 4 | Rending (4+) |

### Source melee profiles

IM/AM/SM are modifiers or substitutions applied to the model’s Initiative/Attacks/Strength. They must not be confused with permanent model stats.

| Weapon | IM | AM | SM | AP | D | Special rules |
|---|---|---|---|---|---|---|
| The Apollonian Spear | I | A | +2 | 2 | 2 | Critical Hit (5+), Duellist’s Edge (2), Impact (AM) |
| The Blade of Mercy | I | 1 | S | 3 | * | Precision (2+), Breaching (5+) |
| Galatus warblade | I | A | S | 2 | 2 | Aflame (2), Reaping Blow (3) |
| Solarite power lance - Defensive strike | -1 | A | S | 2 | 1 | Critical Hit (6+) |
| Solarite power lance - Charging strike | +4 | 0 | +5 | 2 | 3 | Impact (AM), Critical Hit (6+), Armourbane |
| Solarite power gauntlet | -3 | A | +4 | 2 | 2 | Critical Hit (6+) |
| Paired Telemon caestus | I | +1 | +3 | 2 | 4 | Critical Hit (6+), Shock (Pinned), Armourbane |
| Solarite power talon | I | A | S | 2 | 1 | Critical Hit (6+), Reaping Blow (2) |
| Telemon caestus | I | A | +3 | 2 | 3 | Critical Hit (6+), Shock (Pinned), Armourbane |
| Achillus dreadspear | I | A | +3 | 2 | 3 | Armourbane, Impact (AM) |
| Sentinel warblade | I | A | S | 2 | 1 | - |
| Guardian spear | I | A | +1 | 2 | 1 | Impact (AM) |
| Adrasite spear  | I | A | +1 | 2 | 1 | Impact (AM) |
| Pyrithite spear | I | A | +1 | 2 | 1 | Impact (AM) |
| Verutum lance | I | A | +1 | 2 | 1 | Precision (5+), Impact (AM |
| Eternity Spear | I | A | +1 | 2 | 1 | Aflame (2), Critical Hit (6+), Impact (AM), Shred (5+) |
| Eternity Blade | +1 | A | +1 | 2 | 1 | Aflame (2), Critical Hit (6+), Shred (4+), Duellist's Edge (1) |
| Neutronium cascade mine | -3 | 1 | 9 | 3 | 3 | Armourbane, Annihilation Cascade (9), Detonation |
| Vaultsword | +1 | +2 | S | 2 | 1 | Duellist's Edge (1), Precision (4+) |

## Upgrade costs and resolver limitations

The army builder looks up upgrade costs by exact displayed weapon name. Current Custodes option names such as “Adrathic Devastator (+10pts opt)” and “Twin Arachnus Blaze Cannon — Concentrated (+25pts opt)” have no corresponding key in `WEAPON_UPGRADE_COSTS`, so the stated upgrade cost is not charged. The Caladius Annihilator is another example: its gun selection does not add the 10-point variant difference. Telemon options likewise need explicit costs and two-arm selection constraints.

The application’s combat engines also contain generic rule simplifications: for example, ranged Rending is checked on wound rolls of six, and Shred rerolls all failures. Thus copying the correct rule labels alone will not produce correct HH3 outcomes. Fixing parameterized rule resolution, weapon multiplicities, mixed-model wounds, legal loadouts and Misericordia aftermath requires engine/UI work beyond a roster-data correction.

## Validation and files

- Loaded the actual data scripts in their browser order, including legacy extensions, using Node’s VM.
- `node --test tests/custodes-roster.test.cjs`: three tests pass for corrected roles, expanded-unit pricing and affected detachment slot categories.
- These tests cover the earlier category patch only. They do not validate the unresolved stats, weapons or combat behaviour listed above.
- Local data changes are not a deployment to the public website.
- Data inspected: `02-unit-presets.js`, `03-foc-wargear.js`, `04-points.js`, `07-army-builder-data.js`, `12-charge.js`; selection/price consumers in `15-main-app.js`; shooting/melee engines in `08-shooting-resolver.js` and `11-assault.js`.
