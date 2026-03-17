// Main ShootingResolver component + StatBox, MiniStat, styles
// Lines 6229-14593 from shooting-resolver165.jsx

var ShootingResolver = function () {
  // ━━ PHASE SELECTOR ━━
  const [activePhase, setActivePhase] = useState("army_builder");

  // ━━ ARMY BUILDER STATE (Crusade Force Organisation) ━━
  // Each army is a structure: { allegiance, faction, pointsLimit, primary: {slots}, detachments: [], entries: [] }
  const emptyArmy = () => ({
    allegiance: "loyalist",
    faction: "legiones_astartes",
    pointsLimit: 3000,
    entries: [], // [{id, unitId, unitName, models, weaponName, sgtWeaponName, secondaryWeapons, equipment, detachmentId, slotRole, isWarlord}]
    detachments: [], // [{id, type, name, parentSlot}] — auxiliary & apex detachments unlocked
  });
  const [loyalistArmy, setLoyalistArmy] = useState(emptyArmy());
  const [traitorArmy, setTraitorArmy] = useState({
    ...emptyArmy(),
    allegiance: "traitor",
  });
  const [armyBuilderSide, setArmyBuilderSide] = useState("loyalist");
  const [abAddModalOpen, setAbAddModalOpen] = useState(false);
  const [abEditIdx, setAbEditIdx] = useState(null);
  const [abEditEntry, setAbEditEntry] = useState(null);
  const [abAddSlotRole, setAbAddSlotRole] = useState(null); // which role slot we're adding to
  const [abAddDetId, setAbAddDetId] = useState("primary"); // which detachment we're adding to
  const [abShowAuxPicker, setAbShowAuxPicker] = useState(null); // command entry id to show aux picker for
  const [abShowApexPicker, setAbShowApexPicker] = useState(null); // high command entry id
  const abFileInputRef = useRef(null);

  const getArmy = () =>
    armyBuilderSide === "loyalist" ? loyalistArmy : traitorArmy;
  const setArmy = (fn) => {
    if (armyBuilderSide === "loyalist")
      setLoyalistArmy(typeof fn === "function" ? fn : () => fn);
    else setTraitorArmy(typeof fn === "function" ? fn : () => fn);
  };

  // Count entries per role across all detachments
  const armyRoleCounts = useMemo(() => {
    const army = getArmy();
    const counts = {};
    Object.keys(BATTLEFIELD_ROLES).forEach((r) => (counts[r] = 0));
    army.entries.forEach((e) => {
      const role = e.slotRole || UNIT_BATTLEFIELD_ROLE[e.unitId] || "troops";
      counts[role] = (counts[role] || 0) + 1;
    });
    return counts;
  }, [loyalistArmy, traitorArmy, armyBuilderSide]);

  // Count entries per role within a specific detachment
  const getDetachmentRoleCounts = useCallback(
    (detId) => {
      const army = getArmy();
      const counts = {};
      army.entries
        .filter((e) => e.detachmentId === detId)
        .forEach((e) => {
          const role =
            e.slotRole || UNIT_BATTLEFIELD_ROLE[e.unitId] || "troops";
          counts[role] = (counts[role] || 0) + 1;
        });
      return counts;
    },
    [loyalistArmy, traitorArmy, armyBuilderSide],
  );

  const armyTotalPoints = useMemo(() => {
    return getArmy().entries.reduce(
      (sum, e) => sum + calcArmyEntryPoints(e),
      0,
    );
  }, [loyalistArmy, traitorArmy, armyBuilderSide]);

  // How many High Command slots are filled (unlocks Apex detachments)
  const highCommandCount = useMemo(() => {
    return getArmy().entries.filter(
      (e) =>
        (e.slotRole || UNIT_BATTLEFIELD_ROLE[e.unitId]) === "high_command" &&
        e.detachmentId === "primary",
    ).length;
  }, [loyalistArmy, traitorArmy, armyBuilderSide]);

  // How many Command slots are filled (unlocks Auxiliary detachments)
  const commandCount = useMemo(() => {
    return getArmy().entries.filter(
      (e) =>
        (e.slotRole || UNIT_BATTLEFIELD_ROLE[e.unitId]) === "command" &&
        e.detachmentId === "primary",
    ).length;
  }, [loyalistArmy, traitorArmy, armyBuilderSide]);

  // Validation
  const armyValidation = useMemo(() => {
    const army = getArmy();
    const errors = [];
    const pts = army.entries.reduce((s, e) => s + calcArmyEntryPoints(e), 0);
    if (pts > army.pointsLimit)
      errors.push(`Over points limit (${pts}/${army.pointsLimit})`);
    // Warlord/LoW 25% check
    const warlordLoWPts = army.entries
      .filter((e) => {
        const r = e.slotRole || UNIT_BATTLEFIELD_ROLE[e.unitId];
        return r === "warlord" || r === "lord_of_war";
      })
      .reduce((s, e) => s + calcArmyEntryPoints(e), 0);
    if (warlordLoWPts > army.pointsLimit * 0.25)
      errors.push(
        `Warlord/Lord of War exceeds 25% (${warlordLoWPts}/${Math.floor(army.pointsLimit * 0.25)})`,
      );
    // Primary detachment slot limits
    const primaryCounts = {};
    army.entries
      .filter((e) => e.detachmentId === "primary")
      .forEach((e) => {
        const role = e.slotRole || UNIT_BATTLEFIELD_ROLE[e.unitId];
        primaryCounts[role] = (primaryCounts[role] || 0) + 1;
      });
    CRUSADE_PRIMARY.slots.forEach((s) => {
      if ((primaryCounts[s.role] || 0) > s.count) {
        errors.push(
          `Primary: ${BATTLEFIELD_ROLES[s.role]?.label} exceeds ${s.count} slots (have ${primaryCounts[s.role]})`,
        );
      }
    });
    // Check each auxiliary/apex/additional detachment slot limits
    army.detachments.forEach((det) => {
      let detDef =
        AUXILIARY_DETACHMENTS[det.type] ||
        APEX_DETACHMENTS[det.type] ||
        ADDITIONAL_DETACHMENTS[det.type];
      // Check legion-specific detachments
      if (!detDef) {
        const legionDets = LEGION_DETACHMENTS[army.faction];
        if (legionDets) {
          const allLDets = [
            ...(legionDets.auxiliary || []),
            ...(legionDets.apex || []),
          ];
          detDef = allLDets.find((d) => d.id === det.type);
        }
      }
      if (!detDef) return;
      const detCounts = {};
      army.entries
        .filter((e) => e.detachmentId === det.id)
        .forEach((e) => {
          const role = e.slotRole || UNIT_BATTLEFIELD_ROLE[e.unitId];
          detCounts[role] = (detCounts[role] || 0) + 1;
        });
      detDef.slots.forEach((s) => {
        if ((detCounts[s.role] || 0) > s.count) {
          errors.push(
            `${detDef.name}: ${BATTLEFIELD_ROLES[s.role]?.label} exceeds ${s.count} slots`,
          );
        }
      });
    });
    return { valid: errors.length === 0, errors };
  }, [loyalistArmy, traitorArmy, armyBuilderSide]);

  // Get available units for a given role, filtered by allegiance and detachment type
  const getAvailableUnitsForRole = useCallback(
    (role, detachmentId) => {
      const army = getArmy();
      const validIds = getUnitsForRole(role);
      const allUnits = UNIT_PRESETS.flatMap((c) => c.units);

      // Check if this is an Allied Detachment — only non-Legion factions allowed
      const det = army.detachments.find((d) => d.id === detachmentId);
      const detDef = det ? ADDITIONAL_DETACHMENTS[det.type] : null;
      const isAllied = detDef?.isAllied || false;

      return allUnits.filter((u) => {
        if (!validIds.includes(u.id)) return false;
        // Allied Detachment: only allow Solar Auxilia, Mechanicum, Custodes
        if (isAllied) {
          const unitCat = UNIT_PRESETS.find((c) =>
            c.units.some((uu) => uu.id === u.id),
          )?.category;
          return ALLIED_FACTION_CATEGORIES.includes(unitCat);
        }
        const loyalistOnly = ALLEGIANCE_UNITS.loyalist.includes(u.id);
        const traitorOnly = ALLEGIANCE_UNITS.traitor.includes(u.id);
        if (army.allegiance === "loyalist" && traitorOnly) return false;
        if (army.allegiance === "traitor" && loyalistOnly) return false;
        return true;
      });
    },
    [loyalistArmy, traitorArmy, armyBuilderSide],
  );

  const createArmyEntry = (unit, detachmentId, slotRole) => {
    const weapons = getRangedWeapons(unit.id);
    const pd = POINTS_DATA[unit.id];
    return {
      id: Date.now() + Math.random(),
      unitId: unit.id,
      unitName: unit.name,
      models: pd?.minModels || unit.models || 1,
      weaponName: weapons[0]?.name || null,
      sgtWeaponName: null,
      secondaryWeapons: [],
      equipment: {
        vexilla: false,
        noxVox: false,
        metaBomb: false,
        bayonet: false,
        chainBayonet: false,
      },
      wargearOptions: {},
      faction: getArmy().faction,
      isPrime: false,
      primeAdvantage: null, // id of the selected prime advantage
      detachmentId: detachmentId || "primary",
      slotRole: slotRole || UNIT_BATTLEFIELD_ROLE[unit.id] || "troops",
    };
  };

  // Add an Auxiliary Detachment (unlocked by Command slots)
  const addAuxiliaryDetachment = useCallback(
    (auxType, parentEntryId) => {
      const def = AUXILIARY_DETACHMENTS[auxType];
      if (!def) return;
      setArmy((prev) => ({
        ...prev,
        detachments: [
          ...prev.detachments,
          {
            id: `aux_${Date.now()}`,
            type: auxType,
            name: def.name,
            parentSlot: parentEntryId,
          },
        ],
      }));
      setAbShowAuxPicker(null);
    },
    [armyBuilderSide],
  );

  // Add an Apex Detachment (unlocked by High Command slots)
  const addApexDetachment = useCallback(
    (apexType, parentEntryId) => {
      const def = APEX_DETACHMENTS[apexType];
      if (!def) return;
      setArmy((prev) => ({
        ...prev,
        detachments: [
          ...prev.detachments,
          {
            id: `apex_${Date.now()}`,
            type: apexType,
            name: def.name,
            parentSlot: parentEntryId,
          },
        ],
      }));
      setAbShowApexPicker(null);
    },
    [armyBuilderSide],
  );

  // Add an Additional Detachment (Warlord, Lord of War, Allied — unlocked by High Command)
  const addAdditionalDetachment = useCallback(
    (addType, parentEntryId) => {
      const def = ADDITIONAL_DETACHMENTS[addType];
      if (!def) return;
      setArmy((prev) => ({
        ...prev,
        detachments: [
          ...prev.detachments,
          {
            id: `add_${Date.now()}`,
            type: addType,
            name: def.name,
            parentSlot: parentEntryId,
            isAdditional: true,
          },
        ],
      }));
      setAbShowApexPicker(null);
    },
    [armyBuilderSide],
  );

  // Remove a detachment and its entries
  const removeDetachment = useCallback(
    (detId) => {
      setArmy((prev) => ({
        ...prev,
        detachments: prev.detachments.filter((d) => d.id !== detId),
        entries: prev.entries.filter((e) => e.detachmentId !== detId),
      }));
    },
    [armyBuilderSide],
  );

  // Check if a specific entry index within a slot is prime-eligible
  // primeCount means "first N entries in this role are prime", prime: true means "all are prime"
  const isSlotPrimeForEntry = useCallback(
    (detId, slotRole, entryIndex) => {
      const getSlots = (detId) => {
        if (detId === "primary") return CRUSADE_PRIMARY.slots;
        const army = getArmy();
        const det = army.detachments.find((d) => d.id === detId);
        if (!det) return [];
        // Check standard detachments
        const detDef =
          AUXILIARY_DETACHMENTS[det.type] || APEX_DETACHMENTS[det.type];
        if (detDef) return detDef.slots;
        // Check legion-specific detachments
        const legionDets = LEGION_DETACHMENTS[army.faction];
        if (legionDets) {
          const allLegionDets = [
            ...(legionDets.auxiliary || []),
            ...(legionDets.apex || []),
          ];
          const ld = allLegionDets.find((d) => d.id === det.type);
          if (ld) return ld.slots;
        }
        return [];
      };
      const slots = getSlots(detId);
      const slot = slots.find((s) => s.role === slotRole);
      if (!slot) return false;
      if (slot.prime === true) return true; // all slots of this role are prime
      if (slot.primeCount && entryIndex < slot.primeCount) return true; // first N are prime
      return false;
    },
    [loyalistArmy, traitorArmy, armyBuilderSide],
  );

  // Simpler check: does this slot have ANY prime positions?
  const isSlotPrime = useCallback(
    (detId, slotRole) => {
      return isSlotPrimeForEntry(detId, slotRole, 0);
    },
    [isSlotPrimeForEntry],
  );

  // Check if a filled entry is in a prime-eligible position
  const isEntryPrimeEligible = useCallback(
    (entry) => {
      const army = getArmy();
      const entryRole = entry.slotRole || UNIT_BATTLEFIELD_ROLE[entry.unitId];
      // Find how many entries before this one share the same detachment & role
      const sameDetRoleEntries = army.entries.filter(
        (e) =>
          e.detachmentId === entry.detachmentId &&
          (e.slotRole || UNIT_BATTLEFIELD_ROLE[e.unitId]) === entryRole,
      );
      const idx = sameDetRoleEntries.findIndex((e) => e.id === entry.id);
      return isSlotPrimeForEntry(
        entry.detachmentId,
        entryRole,
        idx >= 0 ? idx : 0,
      );
    },
    [loyalistArmy, traitorArmy, armyBuilderSide, isSlotPrimeForEntry],
  );

  // Get available prime advantages for a given entry
  const getAvailablePrimeAdvantages = useCallback(
    (entry) => {
      const army = getArmy();
      const faction = army.faction;
      const allegiance = army.allegiance;
      const entryRole = entry.slotRole || UNIT_BATTLEFIELD_ROLE[entry.unitId];
      const hasUnique = false; // TODO: check for Unique Sub-Type

      // If unit has Unique Sub-Type, only Logistical Benefit is available
      const advantages = [];

      // Core Prime Advantages
      PRIME_ADVANTAGES.forEach((pa) => {
        // Check once-per-detachment limits
        if (pa.oncePerDet) {
          const sameDetEntries = army.entries.filter(
            (e) => e.detachmentId === entry.detachmentId && e.id !== entry.id,
          );
          if (sameDetEntries.some((e) => e.primeAdvantage === pa.id)) return;
        }
        // Special Assignment: only for Command slots
        if (pa.commandOnly && entryRole !== "command") return;
        // Paragon of Battle: needs Command Sub-Type
        if (pa.requiresCommand) {
          // Command sub-type is generally HQ/Command units
        }
        // Sergeant requirement
        if (pa.requiresSgt) {
          const up = UNIT_PRESETS.flatMap((c) => c.units).find(
            (u) => u.id === entry.unitId,
          );
          if (!up?.hasSgt) return;
        }
        advantages.push({ ...pa, source: "core" });
      });

      // Allegiance-Specific
      ALLEGIANCE_PRIME_ADVANTAGES.forEach((pa) => {
        if (pa.allegiance === allegiance) {
          advantages.push({ ...pa, source: "allegiance" });
        }
      });

      // Legion-Specific
      const legionPAs = LEGION_PRIME_ADVANTAGES[faction] || [];
      legionPAs.forEach((pa) => {
        // Check unit restrictions
        if (pa.requiresUnit && !pa.requiresUnit.includes(entry.unitId)) return;
        if (pa.requiresInfantry) {
          // Infantry check: most non-vehicle units
          const vehicleIds = [
            "rhino",
            "termite",
            "drop_pod",
            "land_raider",
            "spartan",
            "predator",
            "sicaran",
            "sicaran_venator",
            "vindicator",
            "kratos",
            "scorpius",
            "arquitor",
            "xiphon",
            "storm_eagle",
            "fire_raptor",
            "javelin",
            "land_speeder",
            "sabre",
            "cerberus",
            "typhon",
            "glaive",
            "fellblade",
            "falchion",
            "thunderhawk",
            "damocles_rhino",
            "dreadnought_drop_pod",
            "dreadclaw",
            "kharybdis",
            "land_raider_exp",
            "caladius",
            "contemptor",
            "leviathan",
            "deredeo",
            "saturnine_dread",
            "castellax",
            "thanatar",
            "vorax",
            "araknae",
          ];
          if (vehicleIds.includes(entry.unitId)) return;
        }
        if (pa.requiresTroops && entryRole !== "troops") return;
        if (pa.requiresElites && entryRole !== "elites") return;
        if (pa.commandOnly && entryRole !== "command") return;
        advantages.push({ ...pa, source: "legion" });
      });

      return advantages;
    },
    [loyalistArmy, traitorArmy, armyBuilderSide],
  );

  // Add a Logistical Benefit extra slot to a detachment
  const [logisticalSlots, setLogisticalSlots] = useState({}); // { entryId: { role: "troops" } }

  // Get legion-specific detachments for the current faction
  const getLegionDetachments = useCallback(() => {
    const army = getArmy();
    const faction = army.faction;
    return LEGION_DETACHMENTS[faction] || {};
  }, [loyalistArmy, traitorArmy, armyBuilderSide]);

  // Add a Legion-specific auxiliary detachment
  const addLegionAuxDetachment = useCallback(
    (legionDetType, parentEntryId) => {
      // Use functional update to read current state correctly
      const doAdd = (prev) => {
        const legionDets = LEGION_DETACHMENTS[prev.faction];
        if (!legionDets) return prev;
        const allDets = [
          ...(legionDets.auxiliary || []),
          ...(legionDets.apex || []),
        ];
        const det = allDets.find((d) => d.id === legionDetType);
        if (!det) return prev;
        return {
          ...prev,
          detachments: [
            ...prev.detachments,
            {
              id: `legion_${Date.now()}`,
              type: legionDetType,
              name: det.name,
              parentSlot: parentEntryId,
              isLegion: true,
            },
          ],
        };
      };
      if (armyBuilderSide === "loyalist") setLoyalistArmy(doAdd);
      else setTraitorArmy(doAdd);
      setAbShowAuxPicker(null);
      setAbShowApexPicker(null);
    },
    [armyBuilderSide],
  );

  // Deploy army to the deployment phase
  const deployArmyToBoard = useCallback(
    (side) => {
      const army = side === "loyalist" ? loyalistArmy : traitorArmy;
      const player = side === "loyalist" ? "p1" : "p2";
      const newUnits = army.entries
        .map((entry, i) => {
          const unitPreset = UNIT_PRESETS.flatMap((c) => c.units).find(
            (u) => u.id === entry.unitId,
          );
          if (!unitPreset) return null;
          const weapons = getRangedWeapons(entry.unitId);
          const rangedWeapon =
            weapons.find((w) => w.name === entry.weaponName) ||
            weapons[0] ||
            null;
          return {
            id: `${side}_${entry.unitId}_${i}_${Date.now()}`,
            name: entry.unitName,
            player,
            x: player === "p1" ? 6 + (i % 8) * 4 : 66 - (i % 8) * 4,
            y:
              player === "p1"
                ? 6 + Math.floor(i / 8) * 4
                : 42 - Math.floor(i / 8) * 4,
            unitData: { ...unitPreset, models: entry.models },
            rangedWeapon,
            secondaryWeapons:
              entry.secondaryWeapons && entry.secondaryWeapons.length > 0
                ? entry.secondaryWeapons
                    .map((sw) => ({
                      weapon:
                        weapons.find((w) => w.name === sw.weaponName) ||
                        weapons[0],
                      models: sw.models || 1,
                    }))
                    .filter((sw) => sw.weapon)
                : null,
            sgtEnabled: !!entry.sgtWeaponName,
            sgtWeapon: entry.sgtWeaponName
              ? (SERGEANT_WEAPONS[getSgtCategory(entry.unitId)] || []).find(
                  (w) => w.name === entry.sgtWeaponName,
                )
              : null,
            equipment: entry.equipment || {},
            isWarlord: entry.isWarlord || false,
            armyEntryId: entry.id,
          };
        })
        .filter(Boolean);
      setDeployedUnits((prev) => [
        ...prev.filter((u) => u.player !== player),
        ...newUnits,
      ]);
    },
    [loyalistArmy, traitorArmy],
  );

  // Export army CSV
  const exportArmyXlsx = useCallback(
    (side) => {
      const army = side === "loyalist" ? loyalistArmy : traitorArmy;
      const rows = [
        [
          "Army List",
          army.allegiance.toUpperCase(),
          "Faction:",
          army.faction,
          "Points Limit:",
          army.pointsLimit,
        ],
        [],
        [
          "#",
          "Unit Name",
          "Unit ID",
          "Battlefield Role",
          "Detachment",
          "Models",
          "Primary Weapon",
          "Sgt Weapon",
          "Equipment",
          "Points",
          "Warlord",
        ],
      ];
      army.entries.forEach((entry, i) => {
        const role =
          entry.slotRole || UNIT_BATTLEFIELD_ROLE[entry.unitId] || "—";
        const equip = Object.entries(entry.equipment || {})
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(", ");
        rows.push([
          i + 1,
          entry.unitName,
          entry.unitId,
          role,
          entry.detachmentId,
          entry.models,
          entry.weaponName || "—",
          entry.sgtWeaponName || "—",
          equip || "—",
          calcArmyEntryPoints(entry),
          entry.isWarlord ? "YES" : "",
        ]);
      });
      const total = army.entries.reduce(
        (s, e) => s + calcArmyEntryPoints(e),
        0,
      );
      rows.push([]);
      rows.push(["", "", "", "", "", "", "", "", "TOTAL:", total, ""]);
      const csv = rows
        .map((r) =>
          r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${side}_army_list.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [loyalistArmy, traitorArmy],
  );

  // Import army CSV
  const importArmyCsv = useCallback((text, side) => {
    try {
      const lines = text
        .split("\n")
        .map((l) => l.split(",").map((c) => c.replace(/^"|"$/g, "").trim()));
      const startIdx = lines.findIndex((l) => l[0] === "#") + 1 || 3;
      const entries = [];
      const allUnits = UNIT_PRESETS.flatMap((c) => c.units);
      for (let i = startIdx; i < lines.length; i++) {
        const row = lines[i];
        if (!row[2] || row[2] === "" || row[0] === "") continue;
        if (row[8] === "TOTAL:" || row[9] === "TOTAL:") break;
        const unitId = row[2];
        const unit = allUnits.find((u) => u.id === unitId);
        if (!unit) continue;
        const entry = createArmyEntry(
          unit,
          row[4] || "primary",
          row[3] || UNIT_BATTLEFIELD_ROLE[unitId],
        );
        entry.models = parseInt(row[5]) || entry.models;
        entry.weaponName = row[6] !== "—" ? row[6] : entry.weaponName;
        entry.sgtWeaponName = row[7] !== "—" ? row[7] : null;
        entry.isWarlord = (row[10] || "").toUpperCase() === "YES";
        if (row[8] && row[8] !== "—") {
          row[8]
            .split(",")
            .map((s) => s.trim())
            .forEach((eq) => {
              if (entry.equipment.hasOwnProperty(eq))
                entry.equipment[eq] = true;
            });
        }
        entries.push(entry);
      }
      const headerLine = lines.find((l) => l[0] === "Army List");
      const newArmy = emptyArmy();
      newArmy.allegiance = side;
      if (headerLine) {
        newArmy.faction = headerLine[3] || "legiones_astartes";
        newArmy.pointsLimit = parseInt(headerLine[5]) || 3000;
      }
      newArmy.entries = entries;
      if (side === "loyalist") setLoyalistArmy(newArmy);
      else setTraitorArmy(newArmy);
      return true;
    } catch (err) {
      console.error("Import error:", err);
      return false;
    }
  }, []);

  const handleFileImport = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const ok = importArmyCsv(ev.target.result, armyBuilderSide);
        if (!ok) alert("Failed to import army list.");
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [armyBuilderSide, importArmyCsv],
  );

  // ━━ TACTICAL MAP STATE (shared across shooting/assault) ━━
  const [mapAttackerId, setMapAttackerId] = useState(null);
  const [mapTargetId, setMapTargetId] = useState(null);
  const [showTacticalMap, setShowTacticalMap] = useState(true);
  const [unitFacings, setUnitFacings] = useState({}); // { unitId: degrees }
  const [routedUnits, setRoutedUnits] = useState(new Set());
  const shootMapRef = useRef(null);
  const assaultMapRef = useRef(null);

  // Initialize facing based on player (P1 faces down, P2 faces up)
  const getUnitFacing = (unit) =>
    unitFacings[unit.id] ?? (unit.player === "p1" ? 180 : 0);

  const setUnitFacing = (id, deg) =>
    setUnitFacings((prev) => ({ ...prev, [id]: deg }));

  // Calculate distance between two deployed units
  const getDistanceBetween = (u1, u2) => {
    if (!u1 || !u2) return null;
    return (
      Math.round(Math.sqrt((u2.x - u1.x) ** 2 + (u2.y - u1.y) ** 2) * 10) / 10
    );
  };

  // Get angle from u1 to u2 in degrees
  const getAngleBetween = (u1, u2) => {
    if (!u1 || !u2) return 0;
    return (Math.atan2(u2.y - u1.y, u2.x - u1.x) * 180) / Math.PI;
  };

  // Select attacker from map for shooting phase
  const handleMapAttackerSelect = (unit) => {
    setMapAttackerId(unit.id);
    // Auto-populate shooting stats from deployed unit data
    if (unit.unitData) {
      const ud = unit.unitData;
      // Shooting phase: use applyUnitPreset for full integration
      applyUnitPreset(ud);
      setNumModels(ud.models || 1);
      setBs(ud.bs || 4);
      if (unit.rangedWeapon) {
        applyWeaponPreset(unit.rangedWeapon);
      }
      if (unit.sgtEnabled && unit.sgtWeapon) {
        setSgtEnabled(true);
        setSgtWeapon(unit.sgtWeapon);
      }
      // Load secondary weapons from deployed unit
      if (unit.secondaryWeapons && unit.secondaryWeapons.length > 0) {
        setSecondaryWeapons(unit.secondaryWeapons.map((sw) => ({ ...sw })));
      } else {
        setSecondaryWeapons([]);
      }
      // Assault phase: set attacker melee stats
      setAUnit(ud);
      setAModels(ud.models || 1);
      setAT(ud.t || 4);
      setAW(ud.w || 1);
      setASv(ud.sv || "3");
      setAInv(ud.inv || "-");
      setAFnp(ud.fnp || "-");
      setALd(ud.ld || 8);
      if (unit.meleeWeapon) {
        setAWS(unit.meleeWeapon.ws);
        setAS(unit.meleeWeapon.s);
        setAAP(unit.meleeWeapon.ap);
        setAI(unit.meleeWeapon.i);
        setAA(unit.meleeWeapon.a);
      }
    }
  };

  // Select target from map
  const handleMapTargetSelect = (unit) => {
    setMapTargetId(unit.id);
    if (unit.unitData) {
      const ud = unit.unitData;
      // Shooting target
      applyTargetPreset(ud);
      // Equipment flags for target
      setTargetHasVexilla(unit.equipment?.vexilla || false);
      setTargetHasNoxVox(unit.equipment?.noxVox || false);
      // Assault defender
      setDUnit(ud);
      setDModels(ud.models || 1);
      setDT(ud.t || 4);
      setDW(ud.w || 1);
      setDSv(ud.sv || "3");
      setDInv(ud.inv || "-");
      setDFnp(ud.fnp || "-");
      setDLd(ud.ld || 8);
      if (unit.meleeWeapon) {
        setDWS(unit.meleeWeapon.ws);
        setDS(unit.meleeWeapon.s);
        setDAP(unit.meleeWeapon.ap);
        setDI(unit.meleeWeapon.i);
        setDA(unit.meleeWeapon.a);
      }
    }
    // Auto-set charge distance from map
    const atkUnit = deployedUnits.find((u) => u.id === mapAttackerId);
    if (atkUnit) {
      const dist = getDistanceBetween(atkUnit, unit);
      if (dist !== null) {
        setChargeDistance(Math.ceil(dist));
      }
      const angle = getAngleBetween(atkUnit, unit);
      setUnitFacing(atkUnit.id, angle + 90);
    }
  };

  // After charge resolves, move the charger toward the target
  const applyChargeMovement = (chargeRes) => {
    const atkUnit = deployedUnits.find((u) => u.id === mapAttackerId);
    const defUnit = deployedUnits.find((u) => u.id === mapTargetId);
    if (!atkUnit || !defUnit) return;

    const dist = getDistanceBetween(atkUnit, defUnit);
    if (dist <= 0.5) return;

    // Determine final position:
    // Success → stop 1" from defender (base contact)
    // Fail    → move chargeRoll inches toward defender
    let finalX, finalY, targetDist;

    if (chargeRes && chargeRes.chargeSucceeded) {
      const stopDist = Math.max(0, dist - 1);
      const ratio = stopDist / dist;
      finalX =
        Math.round((atkUnit.x + (defUnit.x - atkUnit.x) * ratio) * 2) / 2;
      finalY =
        Math.round((atkUnit.y + (defUnit.y - atkUnit.y) * ratio) * 2) / 2;
      targetDist = stopDist;
    } else if (chargeRes && chargeRes.chargeRoll > 0) {
      const moveDist = Math.min(chargeRes.chargeRoll, dist - 0.5);
      const ratio = moveDist / dist;
      finalX =
        Math.round((atkUnit.x + (defUnit.x - atkUnit.x) * ratio) * 2) / 2;
      finalY =
        Math.round((atkUnit.y + (defUnit.y - atkUnit.y) * ratio) * 2) / 2;
      targetDist = moveDist;
    } else {
      return;
    }

    if (targetDist < 0.1) return;

    // Face toward defender immediately
    const angle = getAngleBetween(atkUnit, defUnit);
    setUnitFacing(atkUnit.id, angle + 90);

    // Animated move: 30 steps over 600ms, ease-out quad
    const STEPS = 30;
    const DURATION = 600;
    const startX = atkUnit.x;
    const startY = atkUnit.y;
    setChargeAnimating(true);
    setChargeAnimProgress(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const t = step / STEPS;
      const eased = 1 - Math.pow(1 - t, 2);
      const curX = Math.round((startX + (finalX - startX) * eased) * 4) / 4;
      const curY = Math.round((startY + (finalY - startY) * eased) * 4) / 4;
      setDeployedUnits((prev) =>
        prev.map((u) => (u.id === atkUnit.id ? { ...u, x: curX, y: curY } : u)),
      );
      setChargeAnimProgress(eased);
      if (step >= STEPS) {
        clearInterval(interval);
        setDeployedUnits((prev) =>
          prev.map((u) =>
            u.id === atkUnit.id ? { ...u, x: finalX, y: finalY } : u,
          ),
        );
        setChargeAnimating(false);
        setChargeAnimProgress(0);
      }
    }, DURATION / STEPS);
  };

  // Rout: move unit toward their deployment zone edge
  const routUnit = (unitId) => {
    setRoutedUnits((prev) => new Set([...prev, unitId]));
    const unit = deployedUnits.find((u) => u.id === unitId);
    if (!unit) return;
    // Move toward own deployment zone edge (P1=top y=0, P2=bottom y=48)
    const retreatY =
      unit.player === "p1"
        ? Math.max(0, unit.y - 6)
        : Math.min(BOARD_H, unit.y + 6);
    setDeployedUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, y: retreatY } : u)),
    );
    // Face away from enemy
    setUnitFacing(unitId, unit.player === "p1" ? 0 : 180);
  };

  // Get weapon max range for display
  const getWeaponRange = (weapon) => {
    if (!weapon) return 0;
    const t = weapon.type || "";
    if (t === "Pistol") return 12;
    if (t === "Assault") return 12;
    if (t === "Rapid Fire") return 24;
    if (t === "Heavy") return 36;
    if (t === "Salvo") return 24;
    if (t === "Ordnance") return 48;
    if (t === "Barrage") return 48;
    return 24;
  };

  // Shared tactical map for shooting/assault
  const renderTacticalMap = ({ refObj, phase, onUnitClick }) => {
    const atkUnit = deployedUnits.find((u) => u.id === mapAttackerId);
    const defUnit = deployedUnits.find((u) => u.id === mapTargetId);
    const weaponRange =
      phase === "shooting" && atkUnit?.rangedWeapon
        ? getWeaponRange(atkUnit.rangedWeapon)
        : 0;
    const distance = getDistanceBetween(atkUnit, defUnit);

    return React.createElement(
      "div",
      { style: { ...panelStyle, marginBottom: 12 } },
      React.createElement(
        "div",
        { style: { ...panelHeaderStyle, justifyContent: "space-between" } },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          React.createElement(
            "span",
            {
              style: {
                color: phase === "shooting" ? "#b8860b" : "#9b2d2d",
                fontSize: 16,
              },
            },
            "🗺",
          ),
          React.createElement(
            "span",
            { style: { color: phase === "shooting" ? "#b8860b" : "#9b2d2d" } },
            "TACTICAL MAP",
          ),
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 8, alignItems: "center" } },
          distance !== null &&
            atkUnit &&
            defUnit &&
            React.createElement(
              "span",
              {
                style: {
                  fontSize: 12,
                  fontFamily: "'Share Tech Mono', serif",
                  color: "#6a5e4e",
                },
              },
              "Range:",
              React.createElement(
                "strong",
                {
                  style: {
                    color: phase === "shooting" ? "#b8860b" : "#9b2d2d",
                  },
                },
                distance,
                '"',
              ),
              phase === "shooting" &&
                weaponRange > 0 &&
                React.createElement(
                  "span",
                  {
                    style: {
                      color: distance <= weaponRange ? "#2e7d32" : "#c74040",
                      marginLeft: 4,
                    },
                  },
                  distance <= weaponRange ? "✓ IN RANGE" : "✗ OUT OF RANGE",
                ),
            ),
          React.createElement(
            "span",
            {
              style: {
                fontSize: 11,
                fontFamily: "'Share Tech Mono', serif",
                color: "#8a7e6e",
              },
            },
            "Zoom:",
          ),
          [6, 8, 10, 12].map((z) =>
            React.createElement(
              "button",
              {
                key: z,
                onClick: () => setDeployScale(z),
                style: {
                  padding: "2px 6px",
                  borderRadius: 3,
                  fontSize: 8,
                  cursor: "pointer",
                  fontFamily: "'Share Tech Mono', serif",
                  fontWeight: deployScale === z ? 700 : 400,
                  background:
                    deployScale === z ? "rgba(0,0,0,0.08)" : "#f0ebe2",
                  border: `1px solid ${deployScale === z ? "#8a7e6e" : "#d0c4aa"}`,
                  color: deployScale === z ? "#2a2418" : "#8a7e6e",
                },
              },
              z,
              "px",
            ),
          ),
        ),
      ),
      deployedUnits.length === 0
        ? React.createElement(
            "div",
            {
              style: {
                textAlign: "center",
                padding: "20px 0",
                fontSize: 13,
                color: "#a09888",
                fontFamily: "'Share Tech Mono', serif",
                fontStyle: "italic",
              },
            },
            "No units on board. Deploy units in the Deployment Phase first.",
          )
        : React.createElement(
            "div",
            {
              style: {
                overflow: "auto",
                maxHeight: "50vh",
                background: "#2a2a20",
                borderRadius: 4,
              },
            },
            React.createElement(
              "div",
              {
                ref: refObj,
                onClick: (e) => {
                  if (
                    phase === "shooting" &&
                    activeRules &&
                    activeRules.barrage
                  ) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const bx = (e.clientX - rect.left) / deployScale;
                    const by = (e.clientY - rect.top) / deployScale;
                    setBarrageBlastPos({
                      x: Math.max(0, Math.min(BOARD_W, bx)),
                      y: Math.max(0, Math.min(BOARD_H, by)),
                    });
                    setBarrageScatterDir(null);
                    setBarrageScatterDist(null);
                    setBarrageScatterDice(null);
                  }
                },
                style: {
                  position: "relative",
                  width: BOARD_W * deployScale,
                  height: BOARD_H * deployScale,
                  background: "#3a3a2e",
                  margin: "0 auto",
                  cursor:
                    phase === "shooting" && activeRules && activeRules.barrage
                      ? "crosshair"
                      : "default",
                },
              },
              React.createElement("div", {
                style: {
                  position: "absolute",
                  inset: 0,
                  opacity: 0.06,
                  backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${deployScale - 1}px, rgba(255,255,255,0.1) ${deployScale}px), repeating-linear-gradient(90deg, transparent, transparent ${deployScale - 1}px, rgba(255,255,255,0.1) ${deployScale}px)`,
                  pointerEvents: "none",
                },
              }),
              deployShowGrid &&
                Array.from({ length: Math.floor(BOARD_W / 6) + 1 }, (_, i) =>
                  React.createElement("div", {
                    key: `gv${i}`,
                    style: {
                      position: "absolute",
                      left: i * 6 * deployScale,
                      top: 0,
                      width: 1,
                      height: BOARD_H * deployScale,
                      background: "rgba(255,255,255,0.06)",
                      pointerEvents: "none",
                    },
                  }),
                ),
              deployShowGrid &&
                Array.from({ length: Math.floor(BOARD_H / 6) + 1 }, (_, i) =>
                  React.createElement("div", {
                    key: `gh${i}`,
                    style: {
                      position: "absolute",
                      top: i * 6 * deployScale,
                      left: 0,
                      height: 1,
                      width: BOARD_W * deployScale,
                      background: "rgba(255,255,255,0.06)",
                      pointerEvents: "none",
                    },
                  }),
                ),
              phase === "shooting" &&
                atkUnit &&
                weaponRange > 0 &&
                React.createElement("div", {
                  style: {
                    position: "absolute",
                    left: atkUnit.x * deployScale - weaponRange * deployScale,
                    top: atkUnit.y * deployScale - weaponRange * deployScale,
                    width: weaponRange * 2 * deployScale,
                    height: weaponRange * 2 * deployScale,
                    borderRadius: "50%",
                    border: "1.5px dashed rgba(184,134,11,0.35)",
                    background: "rgba(184,134,11,0.04)",
                    pointerEvents: "none",
                  },
                }),
              phase === "shooting" &&
                barrageBlastPos &&
                React.createElement(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      left:
                        barrageBlastPos.x * deployScale -
                        barrageBlastRadius * deployScale,
                      top:
                        barrageBlastPos.y * deployScale -
                        barrageBlastRadius * deployScale,
                      width: barrageBlastRadius * 2 * deployScale,
                      height: barrageBlastRadius * 2 * deployScale,
                      borderRadius: "50%",
                      border: "2px dashed rgba(255,80,0,0.9)",
                      background: "rgba(255,80,0,0.18)",
                      pointerEvents: "none",
                      zIndex: 18,
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                        fontSize: Math.max(
                          8,
                          barrageBlastRadius * deployScale * 0.5,
                        ),
                        color: "rgba(255,120,0,0.9)",
                        pointerEvents: "none",
                      },
                    },
                    "💣",
                  ),
                ),
              phase === "assault" &&
                atkUnit &&
                React.createElement("div", {
                  style: {
                    position: "absolute",
                    left: atkUnit.x * deployScale - 9 * deployScale,
                    top: atkUnit.y * deployScale - 9 * deployScale,
                    width: 18 * deployScale,
                    height: 18 * deployScale,
                    borderRadius: "50%",
                    border: "1.5px dashed rgba(155,45,45,0.35)",
                    background: "rgba(155,45,45,0.03)",
                    pointerEvents: "none",
                  },
                }),
              atkUnit &&
                defUnit &&
                React.createElement(
                  "svg",
                  {
                    style: {
                      position: "absolute",
                      inset: 0,
                      width: BOARD_W * deployScale,
                      height: BOARD_H * deployScale,
                      pointerEvents: "none",
                    },
                  },
                  React.createElement("line", {
                    x1: atkUnit.x * deployScale,
                    y1: atkUnit.y * deployScale,
                    x2: defUnit.x * deployScale,
                    y2: defUnit.y * deployScale,
                    stroke:
                      phase === "shooting"
                        ? "rgba(184,134,11,0.5)"
                        : chargeAnimating
                          ? "rgba(220,60,60,0.9)"
                          : "rgba(155,45,45,0.5)",
                    strokeWidth: chargeAnimating ? 3 : 2,
                    strokeDasharray: chargeAnimating ? "none" : "6,4",
                  }),
                  chargeAnimating &&
                    phase === "assault" &&
                    (() => {
                      const dx = defUnit.x - atkUnit.x;
                      const dy = defUnit.y - atkUnit.y;
                      const totalDist = Math.sqrt(dx * dx + dy * dy);
                      const chevrons = [];
                      for (
                        let i = 0.15;
                        i < chargeAnimProgress - 0.05;
                        i += 0.2
                      ) {
                        const cx =
                          atkUnit.x * deployScale +
                          (defUnit.x - atkUnit.x) * i * deployScale;
                        const cy =
                          atkUnit.y * deployScale +
                          (defUnit.y - atkUnit.y) * i * deployScale;
                        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                        chevrons.push(
                          React.createElement(
                            "text",
                            {
                              key: i,
                              x: cx,
                              y: cy,
                              fill: "rgba(220,80,80,0.7)",
                              fontSize: "10",
                              textAnchor: "middle",
                              dominantBaseline: "middle",
                              transform: `rotate(${angle}, ${cx}, ${cy})`,
                            },
                            "›",
                          ),
                        );
                      }
                      return chevrons;
                    })(),
                  distance &&
                    React.createElement(
                      "text",
                      {
                        x: ((atkUnit.x + defUnit.x) / 2) * deployScale,
                        y: ((atkUnit.y + defUnit.y) / 2) * deployScale - 6,
                        fill: chargeAnimating ? "#ff6060" : "#ffd700",
                        fontSize: "10",
                        fontFamily: "Cinzel",
                        textAnchor: "middle",
                      },
                      distance,
                      '"',
                    ),
                ),
              chargeAnimating &&
                phase === "assault" &&
                React.createElement(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      top: 6,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(180,20,20,0.85)",
                      color: "#fff",
                      fontFamily: "'Share Tech Mono', serif",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 2,
                      padding: "3px 12px",
                      borderRadius: 0,
                      border: "1px solid #ff4444",
                      pointerEvents: "none",
                      zIndex: 20,
                      textShadow: "0 0 8px rgba(255,100,100,0.8)",
                    },
                  },
                  "⚔ CHARGING...",
                ),
              terrainPieces.map((terrain) => {
                const ttype = TERRAIN_TYPES.find((t) => t.id === terrain.type);
                return React.createElement(
                  "div",
                  {
                    key: terrain.id,
                    style: {
                      position: "absolute",
                      left: terrain.x * deployScale,
                      top: terrain.y * deployScale,
                      width: terrain.w * deployScale,
                      height: terrain.h * deployScale,
                      background: terrain.bg,
                      border: `2px solid ${terrain.border}`,
                      borderRadius: terrain.type === "fortification" ? 3 : 6,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                      zIndex: 2,
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: Math.max(terrain.w * deployScale * 0.22, 8),
                        color: terrain.color,
                        lineHeight: 1,
                      },
                    },
                    ttype?.symbol,
                  ),
                  terrain.w * deployScale > 40 &&
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 6,
                          color: terrain.color,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          textAlign: "center",
                          textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                        },
                      },
                      terrain.w,
                      "″×",
                      terrain.h,
                      "″",
                    ),
                );
              }),
              deployedUnits.map((unit) => {
                const isP1 = unit.player === "p1";
                const col = isP1 ? "#e05555" : "#5599dd";
                const bgCol = isP1
                  ? "rgba(200,60,60,0.85)"
                  : "rgba(50,120,200,0.85)";
                const sz = getUnitMapSize(unit);
                const isAtk = unit.id === mapAttackerId;
                const isDef = unit.id === mapTargetId;
                const isRouted = routedUnits.has(unit.id);
                const facing = getUnitFacing(unit);

                return React.createElement(
                  "div",
                  {
                    key: unit.id,
                    style: {
                      position: "absolute",
                      left: unit.x * deployScale - sz / 2,
                      top: unit.y * deployScale - sz / 2,
                    },
                  },
                  React.createElement("div", {
                    style: {
                      position: "absolute",
                      left: sz / 2,
                      top: -4,
                      width: 0,
                      height: 0,
                      transform: `translate(-50%, -100%) rotate(${facing}deg)`,
                      transformOrigin: `50% ${sz / 2 + 4}px`,
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      borderBottom: `8px solid ${isRouted ? "#ff6600" : isAtk ? "#ffd700" : isDef ? "#ff4444" : "rgba(255,255,255,0.3)"}`,
                      pointerEvents: "none",
                      zIndex: 15,
                    },
                  }),
                  React.createElement(
                    "div",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        onUnitClick && onUnitClick(unit);
                      },
                      title: `${unit.label} (${unit.player.toUpperCase()}) ${unit.x}",${unit.y}"${isRouted ? " — ROUTED" : ""}`,
                      style: {
                        width: sz,
                        height: sz,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius:
                          unit.type === "tank" || unit.type === "transport"
                            ? 3
                            : unit.type === "objective"
                              ? "50%"
                              : 4,
                        background: isRouted
                          ? "rgba(255,102,0,0.85)"
                          : unit.type === "objective"
                            ? "rgba(255,215,0,0.85)"
                            : bgCol,
                        border: isAtk
                          ? "2.5px solid #ffd700"
                          : isDef
                            ? "2.5px solid #ff4444"
                            : `1.5px solid ${unit.type === "objective" ? "#ffd700" : col}`,
                        color: unit.type === "objective" ? "#2a2418" : "#fff",
                        fontSize: Math.max(sz * 0.55, 10),
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: isAtk
                          ? "0 0 12px rgba(255,215,0,0.6)"
                          : isDef
                            ? "0 0 12px rgba(255,68,68,0.6)"
                            : "0 1px 4px rgba(0,0,0,0.4)",
                        zIndex: isAtk || isDef ? 20 : 10,
                        lineHeight: 1,
                        opacity: isRouted ? 0.7 : 1,
                      },
                    },
                    unit.symbol,
                  ),
                );
              }),
              React.createElement("div", {
                style: {
                  position: "absolute",
                  inset: 0,
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderRadius: 2,
                  pointerEvents: "none",
                },
              }),
            ),
          ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" } },
        React.createElement(
          "div",
          {
            style: {
              flex: 1,
              padding: "6px 10px",
              borderRadius: 4,
              fontSize: 12,
              background: mapAttackerId
                ? "rgba(255,215,0,0.08)"
                : "rgba(0,0,0,0.02)",
              border: `1px solid ${mapAttackerId ? "rgba(255,215,0,0.3)" : "#e0d8c8"}`,
            },
          },
          React.createElement(
            "span",
            {
              style: {
                fontFamily: "'Share Tech Mono', serif",
                fontSize: 8,
                color: "#b8860b",
                letterSpacing: 1,
              },
            },
            "⚔ ATTACKER:",
          ),
          React.createElement(
            "span",
            {
              style: {
                fontFamily: "'Share Tech Mono', serif",
                fontWeight: 700,
                fontSize: 12,
                color: mapAttackerId ? "#2a2418" : "#a09888",
              },
            },
            atkUnit?.label || "Click a unit on the map",
          ),
        ),
        React.createElement(
          "div",
          {
            style: {
              flex: 1,
              padding: "6px 10px",
              borderRadius: 4,
              fontSize: 12,
              background: mapTargetId
                ? "rgba(255,68,68,0.08)"
                : "rgba(0,0,0,0.02)",
              border: `1px solid ${mapTargetId ? "rgba(255,68,68,0.3)" : "#e0d8c8"}`,
            },
          },
          React.createElement(
            "span",
            {
              style: {
                fontFamily: "'Share Tech Mono', serif",
                fontSize: 8,
                color: "#c74040",
                letterSpacing: 1,
              },
            },
            "🎯 TARGET:",
          ),
          React.createElement(
            "span",
            {
              style: {
                fontFamily: "'Share Tech Mono', serif",
                fontWeight: 700,
                fontSize: 12,
                color: mapTargetId ? "#2a2418" : "#a09888",
              },
            },
            defUnit?.label || "Click another unit",
          ),
        ),
        React.createElement(
          "button",
          {
            onClick: () => {
              setMapAttackerId(null);
              setMapTargetId(null);
            },
            style: {
              padding: "4px 10px",
              borderRadius: 4,
              fontSize: 8,
              cursor: "pointer",
              fontFamily: "'Share Tech Mono', serif",
              fontWeight: 600,
              background: "#f0ebe2",
              border: "1px solid #d0c4aa",
              color: "#8a7e6e",
            },
          },
          "CLEAR",
        ),
      ),
    );
  };

  // ━━ ASSAULT PHASE STATE ━━
  const [assaultResult, setAssaultResult] = useState(null);
  const [atkCombatChoice, setAtkCombatChoice] = useState(null);
  // ━━ TARGET UNIT ID (for artwork) ━━
  const [targetPresetId, setTargetPresetId] = useState(null);
  const [showFiringVideo, setShowFiringVideo] = useState(false);
  const [defCombatChoice, setDefCombatChoice] = useState(null);
  // Attacker
  const [aUnit, setAUnit] = useState(null);
  const [aShowPresets, setAShowPresets] = useState(false);
  const [aFaction, setAFaction] = useState("legiones_astartes");
  const [dFaction, setDFaction] = useState("legiones_astartes");
  const [aSelectedMelee, setASelectedMelee] = useState(null);
  const [aModels, setAModels] = useState(10);
  const [aWS, setAWS] = useState(4);
  const [aS, setAS] = useState(4);
  const [aAP, setAAP] = useState("-");
  const [aI, setAI] = useState(4);
  const [aMove, setAMove] = useState(6);
  const [aA, setAA] = useState(1);
  const [aW, setAW] = useState(1);
  const [aT, setAT] = useState(4);
  const [aSv, setASv] = useState("3");
  const [aInv, setAInv] = useState("-");
  const [aFnp, setAFnp] = useState("-");
  const [aRules, setARules] = useState({});
  const [aLd, setALd] = useState(8);
  // Defender
  const [dUnit, setDUnit] = useState(null);
  const [dShowPresets, setDShowPresets] = useState(false);
  const [dSelectedMelee, setDSelectedMelee] = useState(null);
  const [dModels, setDModels] = useState(10);
  const [dWS, setDWS] = useState(4);
  const [dS, setDS] = useState(4);
  const [dAP, setDAP] = useState("-");
  const [dI, setDI] = useState(4);
  const [dMove, setDMove] = useState(6);
  const [dA, setDA] = useState(1);
  const [dW, setDW] = useState(1);
  const [dT, setDT] = useState(4);
  const [dSv, setDSv] = useState("3");
  const [dInv, setDInv] = useState("-");
  const [dFnp, setDFnp] = useState("-");
  const [dRules, setDRules] = useState({});
  const [dLd, setDLd] = useState(8);
  // Options
  const [assaultCharging, setAssaultCharging] = useState(false);
  const [assaultDisordered, setAssaultDisordered] = useState(false);

  // Secondary Melee Weapons (multi-weapon assault for mixed-loadout units)
  // Each entry: { weapon: meleeProfile, models: number }
  const [aSecondaryMelee, setASecondaryMelee] = useState([]);
  const [dSecondaryMelee, setDSecondaryMelee] = useState([]);
  // Ranged weapons for assault units (for volley fire / overwatch)
  const [aSelectedRanged, setASelectedRanged] = useState(null);
  const [dSelectedRanged, setDSelectedRanged] = useState(null);
  const [aSecondaryRanged, setASecondaryRanged] = useState([]);
  const [dSecondaryRanged, setDSecondaryRanged] = useState([]);

  // Assault sergeant state
  const [aAssaultSgtEnabled, setAAssaultSgtEnabled] = useState(false);
  const [dAssaultSgtEnabled, setDAssaultSgtEnabled] = useState(false);
  const [aAssaultSgtMelee, setAAssaultSgtMelee] = useState(null);
  const [dAssaultSgtMelee, setDAssaultSgtMelee] = useState(null);

  // Volley fire / overwatch model counts (how many models fire)
  const [aVolleyModels, setAVolleyModels] = useState(10);
  const [dVolleyModels, setDVolleyModels] = useState(10);
  const [dOverwatchModels, setDOverwatchModels] = useState(10);

  // Overwatch uses separate weapon selection (any ranged weapon, not just Assault)
  const [dOverwatchWeapon, setDOverwatchWeapon] = useState(null);
  const [dOverwatchSecondary, setDOverwatchSecondary] = useState([]);

  // Sergeant volley fire weapon selection (Assault trait + Pistol type)
  const [aSgtVolleyWeapon, setASgtVolleyWeapon] = useState(null);
  const [dSgtVolleyWeapon, setDSgtVolleyWeapon] = useState(null);
  const [dSgtOverwatchWeapon, setDSgtOverwatchWeapon] = useState(null);

  const aAssaultSgtWeapons = useMemo(() => {
    if (!aUnit || !aUnit.hasSgt) return [];
    const cat = getSgtCategory(aUnit.id);
    return cat ? SERGEANT_MELEE_WEAPONS[cat] || [] : [];
  }, [aUnit]);
  const dAssaultSgtWeapons = useMemo(() => {
    if (!dUnit || !dUnit.hasSgt) return [];
    const cat = getSgtCategory(dUnit.id);
    return cat ? SERGEANT_MELEE_WEAPONS[cat] || [] : [];
  }, [dUnit]);

  const addSecondaryMelee = (side) => {
    const meleeWeapons = side === "attacker" ? aMeleeWeapons : dMeleeWeapons;
    const primary = side === "attacker" ? aSelectedMelee : dSelectedMelee;
    if (meleeWeapons.length === 0) return;
    const alt =
      meleeWeapons.find((w) => w.name !== primary?.name) || meleeWeapons[0];
    const setter =
      side === "attacker" ? setASecondaryMelee : setDSecondaryMelee;
    setter((prev) => [...prev, { weapon: alt, models: 1 }]);
  };

  const updateSecondaryMelee = (side, idx, field, val) => {
    const setter =
      side === "attacker" ? setASecondaryMelee : setDSecondaryMelee;
    setter((prev) =>
      prev.map((sw, i) => (i === idx ? { ...sw, [field]: val } : sw)),
    );
  };

  const removeSecondaryMelee = (side, idx) => {
    const setter =
      side === "attacker" ? setASecondaryMelee : setDSecondaryMelee;
    setter((prev) => prev.filter((_, i) => i !== idx));
  };

  // Challenge sub-phase
  const [challengeEnabled, setChallengeEnabled] = useState(false);
  const [challengeResult, setChallengeResult] = useState(null);
  const [atkGambit, setAtkGambit] = useState("none");
  const [defGambit, setDefGambit] = useState("none");
  const [atkSupport, setAtkSupport] = useState(0);
  const [defSupport, setDefSupport] = useState(0);

  const handleChallengeResolve = () => {
    const res = resolveChallenge({
      atkWS: aWS,
      atkS: aS,
      atkAP: aAP,
      atkI: aI,
      atkA: aA,
      atkW: aW,
      atkT: aT,
      atkSv: aSv,
      atkInv: aInv,
      atkFnp: aFnp,
      atkRules: aRules,
      atkGambit,
      atkName: aUnit?.name || "Attacker Champion",
      defWS: dWS,
      defS: dS,
      defAP: dAP,
      defI: dI,
      defA: dA,
      defW: dW,
      defT: dT,
      defSv: dSv,
      defInv: dInv,
      defFnp: dFnp,
      defRules: dRules,
      defGambit,
      defName: dUnit?.name || "Defender Champion",
      atkSupport,
      defSupport,
      isCharging: assaultCharging,
    });
    setChallengeResult(res);
    // Track kills
    const chAtkName = aUnit?.name || "Attacker Champion";
    const chDefName = dUnit?.name || "Defender Champion";
    const challengeKills = [];
    if (res.atkWoundsDealt > 0) {
      challengeKills.push({
        phase: "Challenge",
        attacker: chAtkName,
        target: chDefName,
        casualties: res.atkWoundsDealt,
        detail: `Challenge: ${chAtkName} → ${chDefName}: ${res.atkWoundsDealt} wound(s)${res.defSlain ? " — SLAIN!" : ""}`,
      });
    }
    if (res.defWoundsDealt > 0) {
      challengeKills.push({
        phase: "Challenge",
        attacker: chDefName,
        target: chAtkName,
        casualties: res.defWoundsDealt,
        detail: `Challenge: ${chDefName} → ${chAtkName}: ${res.defWoundsDealt} wound(s)${res.atkSlain ? " — SLAIN!" : ""}`,
      });
    }
    if (challengeKills.length > 0)
      setRoundKills((prev) => [...prev, ...challengeKills]);
  };

  const [currentRound, setCurrentRound] = useState(1);
  const [vpLog, setVpLog] = useState([]);
  const [p1TotalVP, setP1TotalVP] = useState(0);
  const [p2TotalVP, setP2TotalVP] = useState(0);
  // Objectives: up to 6, each has value 1-3, controlled by "none"/"p1"/"p2", line bonus
  const [objectives, setObjectives] = useState([
    { id: 1, value: 1, controller: "none", line: 0 },
    { id: 2, value: 1, controller: "none", line: 0 },
    { id: 3, value: 2, controller: "none", line: 0 },
  ]);
  const [numObjectives, setNumObjectives] = useState(3);
  // Secondaries
  const [p1Secondaries, setP1Secondaries] = useState({
    slayWarlord: false,
    giantKiller: false,
    firstStrike: false,
    lastManStanding: false,
  });
  const [p2Secondaries, setP2Secondaries] = useState({
    slayWarlord: false,
    giantKiller: false,
    firstStrike: false,
    lastManStanding: false,
  });
  const [secondaryValues, setSecondaryValues] = useState({
    slayWarlord: 3,
    giantKiller: 3,
    firstStrike: 3,
    lastManStanding: 3,
  });
  // Status Recovery
  const [statusRecoveries, setStatusRecoveries] = useState([]);
  // Kill Tracker
  const [roundKills, setRoundKills] = useState([]);

  // ━━ RESULTS TRACKER ━━
  // Logs every resolve, return fire, charge, volley, and assault result across rounds 1-4
  const [trackerRound, setTrackerRound] = useState(1);
  const [combatLog, setCombatLog] = useState([]); // { round, type, timestamp, attacker, target, summary, detail }

  const addCombatLogEntry = (entry) => {
    setCombatLog((prev) => [
      ...prev,
      { ...entry, round: trackerRound, timestamp: Date.now() },
    ]);
  };

  const clearCombatLogRound = (round) => {
    setCombatLog((prev) => prev.filter((e) => e.round !== round));
  };

  const clearAllCombatLog = () => setCombatLog([]);

  const updateObjective = (idx, field, val) => {
    setObjectives((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, [field]: val } : o)),
    );
  };

  const handleNumObjectivesChange = (n) => {
    setNumObjectives(n);
    setObjectives((prev) => {
      if (n > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: n - prev.length }, (_, i) => ({
            id: prev.length + i + 1,
            value: 1,
            controller: "none",
            line: 0,
          })),
        ];
      }
      return prev.slice(0, n);
    });
  };

  const scoreRound = () => {
    let p1Round = 0,
      p2Round = 0;
    const roundLog = [];

    // Primary objectives
    objectives.forEach((obj, i) => {
      if (obj.controller === "p1") {
        const vp = obj.value + obj.line;
        p1Round += vp;
        roundLog.push(
          `Obj ${i + 1}: Loyalist scores ${vp} VP${obj.line > 0 ? ` (${obj.value} + Line ${obj.line})` : ""}`,
        );
      } else if (obj.controller === "p2") {
        const vp = obj.value + obj.line;
        p2Round += vp;
        roundLog.push(
          `Obj ${i + 1}: Traitors scores ${vp} VP${obj.line > 0 ? ` (${obj.value} + Line ${obj.line})` : ""}`,
        );
      }
    });

    const entry = {
      round: currentRound,
      p1: p1Round,
      p2: p2Round,
      log: roundLog,
    };
    setVpLog((prev) => [...prev, entry]);
    setP1TotalVP((prev) => prev + p1Round);
    setP2TotalVP((prev) => prev + p2Round);
    setCurrentRound((prev) => prev + 1);
  };

  const rollStatusRecovery = (unitName, stat, statValue, hasNox) => {
    const effectiveValue = hasNox ? Math.min(statValue + 1, 12) : statValue;
    const dice = rollD6s(2);
    const total = dice[0] + dice[1];
    const passed = total <= effectiveValue;
    setStatusRecoveries((prev) => [
      ...prev,
      {
        round: currentRound,
        unitName,
        stat,
        statValue: effectiveValue,
        baseValue: statValue,
        hasNox,
        dice,
        total,
        passed,
      },
    ]);
  };

  const calcSecondaryVP = (secondaries) => {
    let vp = 0;
    if (secondaries.slayWarlord) vp += secondaryValues.slayWarlord;
    if (secondaries.giantKiller) vp += secondaryValues.giantKiller;
    if (secondaries.firstStrike) vp += secondaryValues.firstStrike;
    if (secondaries.lastManStanding) vp += secondaryValues.lastManStanding;
    return vp;
  };

  // ━━ DEPLOYMENT STATE ━━
  const BOARD_W = 72; // inches
  const BOARD_H = 48; // inches
  const [deployScale, setDeployScale] = useState(10); // px per inch
  const [deployedUnits, setDeployedUnits] = useState([]);
  const [deploySelectedUnit, setDeploySelectedUnit] = useState(null);
  const [deployPlayer, setDeployPlayer] = useState("p1"); // p1 or p2
  const [deployBrushUnit, setDeployBrushUnit] = useState(null); // full unit from UNIT_PRESETS
  const [deployBrushModels, setDeployBrushModels] = useState(1); // adjustable squad size
  const [deployBrushRangedWeapon, setDeployBrushRangedWeapon] = useState(null);
  const [deployBrushMeleeWeapon, setDeployBrushMeleeWeapon] = useState(null);
  const [deployFaction, setDeployFaction] = useState("legiones_astartes");
  const [deployBrushSecondaryWeapons, setDeployBrushSecondaryWeapons] =
    useState([]); // [{weapon, models}]
  const [deployBrushSgtEnabled, setDeployBrushSgtEnabled] = useState(false);
  const [deployBrushSgtWeapon, setDeployBrushSgtWeapon] = useState(null);
  const [deployBrushEquipment, setDeployBrushEquipment] = useState({
    vexilla: false,
    noxVox: false,
    metaBomb: false,
    bayonet: false,
    chainBayonet: false,
  });
  const [deployBrushArmyEntryId, setDeployBrushArmyEntryId] = useState(null); // tracks which army builder entry is being placed
  const [deployModalOpen, setDeployModalOpen] = useState(false);

  const deployRangedWeapons = useMemo(() => {
    const base = deployBrushUnit ? getRangedWeapons(deployBrushUnit.id) : [];
    const legion =
      deployFaction && deployFaction !== "legiones_astartes"
        ? LEGION_RANGED_WEAPONS[deployFaction] || []
        : [];
    return [...base, ...legion];
  }, [deployBrushUnit, deployFaction]);
  const deployMeleeWeapons = useMemo(() => {
    const base = deployBrushUnit
      ? MELEE_getRangedWeapons(deployBrushUnit.id)
      : [];
    const legion =
      deployFaction && deployFaction !== "legiones_astartes"
        ? LEGION_MELEE_WEAPONS[deployFaction] || []
        : [];
    return [...base, ...legion];
  }, [deployBrushUnit, deployFaction]);
  const deploySgtCategory = useMemo(
    () => (deployBrushUnit ? getSgtCategory(deployBrushUnit.id) : null),
    [deployBrushUnit],
  );
  const deploySgtWeapons = useMemo(
    () => (deploySgtCategory ? SERGEANT_WEAPONS[deploySgtCategory] || [] : []),
    [deploySgtCategory],
  );
  const [deployShowGrid, setDeployShowGrid] = useState(true);
  const [deployShowZones, setDeployShowZones] = useState(true);
  const [deployZoneDepth, setDeployZoneDepth] = useState(12); // deployment zone depth in inches
  const [missionType, setMissionType] = useState("search"); // "search" | "hammer" | "dawn" | "zm"
  const [zmMission, setZmMission] = useState("sector_sweep"); // "sector_sweep" | "terminal_control" | "signal_influx"
  const [zmSections, setZmSections] = useState(() => {
    // 16 sections (4×4 grid), each 12"×12" on a 48"×48" ZM board
    // type: "alpha" | "beta" | "deployA" | "deployB" | "normal"
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      status: "normal",
      abyssal: false,
      confinedX: null,
    }));
  });
  const [zmRollLog, setZmRollLog] = useState(null); // { type, rolls: [{sec, roll, result}] }
  const boardRef = useRef(null);

  // Mission definitions
  const MISSIONS = {
    search: {
      id: "search",
      name: "Search and Destroy",
      desc: 'Diagonal deployment. Side A deploys in the top-left corner (36"×24"), Side B in the bottom-right corner (36"×24"). Units cannot deploy within 18" of the board centre.',
      renderZones: (scale) => [
        // Side A: top-left rectangle 36" wide, 24" tall
        {
          left: 0,
          top: 0,
          width: 36 * scale,
          height: 24 * scale,
          color: "rgba(155,45,45,0.15)",
          border: "2px dashed rgba(155,45,45,0.5)",
          label: 'P1 ZONE (36"×24")',
          labelStyle: { top: 4, left: 8, color: "rgba(155,45,45,0.7)" },
        },
        // Side B: bottom-right rectangle 36" wide, 24" tall
        {
          left: (BOARD_W - 36) * scale,
          top: (BOARD_H - 24) * scale,
          width: 36 * scale,
          height: 24 * scale,
          color: "rgba(42,111,180,0.15)",
          border: "2px dashed rgba(42,111,180,0.5)",
          label: 'P2 ZONE (36"×24")',
          labelStyle: { bottom: 4, right: 8, color: "rgba(42,111,180,0.7)" },
        },
      ],
      exclusionCircle: true, // 18" diameter = 9" radius from centre
    },
    hammer: {
      id: "hammer",
      name: "Hammer and Anvil",
      desc: 'Side deployment. Each player deploys in a 24"×48" zone on opposite long edges.',
      renderZones: (scale) => [
        {
          left: 0,
          top: 0,
          width: 24 * scale,
          height: BOARD_H * scale,
          color: "rgba(155,45,45,0.15)",
          border: "2px dashed rgba(155,45,45,0.5)",
          label: 'P1 ZONE (24")',
          labelStyle: {
            top: "50%",
            left: 4,
            transform: "translateY(-50%)",
            color: "rgba(155,45,45,0.7)",
          },
        },
        {
          left: (BOARD_W - 24) * scale,
          top: 0,
          width: 24 * scale,
          height: BOARD_H * scale,
          color: "rgba(42,111,180,0.15)",
          border: "2px dashed rgba(42,111,180,0.5)",
          label: 'P2 ZONE (24")',
          labelStyle: {
            top: "50%",
            right: 4,
            transform: "translateY(-50%)",
            color: "rgba(42,111,180,0.7)",
          },
        },
      ],
    },
    dawn: {
      id: "dawn",
      name: "Dawn of War",
      desc: 'Long-edge deployment. Each player deploys in a 12"×72" strip along opposite long edges.',
      renderZones: (scale) => [
        {
          left: 0,
          top: 0,
          width: BOARD_W * scale,
          height: 12 * scale,
          color: "rgba(155,45,45,0.15)",
          border: "2px dashed rgba(155,45,45,0.5)",
          label: 'P1 ZONE (12")',
          labelStyle: { top: 4, left: 8, color: "rgba(155,45,45,0.7)" },
        },
        {
          left: 0,
          top: (BOARD_H - 12) * scale,
          width: BOARD_W * scale,
          height: 12 * scale,
          color: "rgba(42,111,180,0.15)",
          border: "2px dashed rgba(42,111,180,0.5)",
          label: 'P2 ZONE (12")',
          labelStyle: { bottom: 4, right: 8, color: "rgba(42,111,180,0.7)" },
        },
      ],
    },
    zm: {
      id: "zm",
      name: "Zone Mortalis",
      desc: "4'×4' enclosed battlefield divided into 16 sections (12\"×12\" each). Select a Zone Mortalis mission below.",
      renderZones: () => [], // ZM zones rendered separately
    },
  };

  // ── Zone Mortalis helpers ──
  const ZM_BOARD = 48; // ZM board is 48"×48"
  const ZM_SECTION = 12; // each section is 12"×12"
  const ZM_COLS = 4;
  const ZM_ROWS = 4;

  // Section layout per mission
  // Sections indexed row-major: [row][col] = row*4+col
  // Primus (Sector Sweep): diagonal deployment zones, alpha/beta sections
  // Row 0 (top)=deployA, Row 3 (bottom)=deployB, columns 0,3=alpha, 1,2=beta middle rows
  const ZM_SECTION_TYPES = {
    sector_sweep: [
      // row0: all alpha, deployA
      { type: "alpha", zone: "A" },
      { type: "alpha", zone: "A" },
      { type: "alpha", zone: "A" },
      { type: "alpha", zone: "A" },
      // row1: alpha, beta, beta, alpha
      { type: "alpha", zone: null },
      { type: "beta", zone: null },
      { type: "beta", zone: null },
      { type: "alpha", zone: null },
      // row2: alpha, beta, beta, alpha
      { type: "alpha", zone: null },
      { type: "beta", zone: null },
      { type: "beta", zone: null },
      { type: "alpha", zone: null },
      // row3: all alpha, deployB
      { type: "alpha", zone: "B" },
      { type: "alpha", zone: "B" },
      { type: "alpha", zone: "B" },
      { type: "alpha", zone: "B" },
    ],
    terminal_control: [
      // Config Secundus: top row 12" deep = deployA, bottom row = deployB, outer=alpha, inner=beta
      { type: "alpha", zone: "A" },
      { type: "alpha", zone: "A" },
      { type: "alpha", zone: "A" },
      { type: "alpha", zone: "A" },
      { type: "alpha", zone: null },
      { type: "beta", zone: null },
      { type: "beta", zone: null },
      { type: "alpha", zone: null },
      { type: "alpha", zone: null },
      { type: "beta", zone: null },
      { type: "beta", zone: null },
      { type: "alpha", zone: null },
      { type: "alpha", zone: "B" },
      { type: "alpha", zone: "B" },
      { type: "alpha", zone: "B" },
      { type: "alpha", zone: "B" },
    ],
    signal_influx: [
      // Config Tertius: corner deployment zones 18" deep diagonal corners
      { type: "normal", zone: "A" },
      { type: "normal", zone: null },
      { type: "normal", zone: null },
      { type: "normal", zone: "A" },
      { type: "normal", zone: null },
      { type: "normal", zone: null },
      { type: "normal", zone: null },
      { type: "normal", zone: null },
      { type: "normal", zone: null },
      { type: "normal", zone: null },
      { type: "normal", zone: null },
      { type: "normal", zone: null },
      { type: "normal", zone: "B" },
      { type: "normal", zone: null },
      { type: "normal", zone: null },
      { type: "normal", zone: "B" },
    ],
  };

  // Fixed objective positions (in ZM 48"×48" coordinate space, measured in inches from top-left)
  // objectives are at section centres or section intersections
  const ZM_OBJECTIVES = {
    sector_sweep: [
      // 4 objectives at section centres of rows 1-2, col 0 and col 3
      { x: 6, y: 18, value: 2, label: "Obj A" },
      { x: 42, y: 18, value: 2, label: "Obj B" },
      { x: 18, y: 42, value: 2, label: "Obj C" },
      { x: 42, y: 42, value: 2, label: "Obj D" },
    ],
    terminal_control: [
      // 5 objectives at section intersections (grid intersections)
      { x: 24, y: 12, value: 0, label: "Term 1", interfaced: false },
      { x: 12, y: 24, value: 0, label: "Term 2", interfaced: false },
      { x: 24, y: 24, value: 0, label: "Term 3", interfaced: false },
      { x: 36, y: 24, value: 0, label: "Term 4", interfaced: false },
      { x: 24, y: 36, value: 0, label: "Term 5", interfaced: false },
    ],
    signal_influx: [
      // 3 objectives placed randomly each turn; shown as grid intersections (3×3 inner grid)
      { x: 12, y: 18, value: 2, label: "Beacon 1" },
      { x: 24, y: 30, value: 2, label: "Beacon 2" },
      { x: 36, y: 18, value: 2, label: "Beacon 3" },
    ],
  };

  const ZM_MISSIONS_INFO = {
    sector_sweep: {
      name: "Sector Sweep",
      config: "Configuration Primus",
      desc: 'Capture as many Objective Markers as possible. 4 fixed objectives worth 2VP each. Diagonal 24" deployment zones.',
      special: [
        "Failing Power Conduits (roll per section each turn; on 1 = Abyssal Darkness)",
        "Impenetrable Area (no Deep Strike)",
        "Reserves",
        "Seize the Initiative",
      ],
      secondary: [
        "Slay the Warlord (2VP)",
        "First Strike (2VP)",
        "Last Man Standing (1VP)",
      ],
      turns: 5,
    },
    terminal_control: {
      name: "Terminal Control",
      config: "Configuration Secundus",
      desc: 'Interface cogitator terminals to retrieve data. 5 objectives with variable values (0–3VP). 12" opposite-edge deployment.',
      special: [
        "Impenetrable Area (no Deep Strike)",
        "Reserves",
        "Seize the Initiative",
        'Interface mechanic: Int check within 3", pass by X = VP value (max 3)',
      ],
      secondary: [
        "Slay the Warlord (2VP)",
        "First Strike (2VP)",
        "Last Man Standing (1VP)",
      ],
      turns: 5,
    },
    signal_influx: {
      name: "Signal Influx",
      config: "Configuration Tertius",
      desc: "Investigate distress beacons that appear at random positions each turn. 3 objectives (2VP each), positions reset each Battle Turn.",
      special: [
        "Crumbling Superstructure (roll per empty section: 2+ = Confined Space X, 1 = Abyssal Darkness)",
        "Impenetrable Area (no Deep Strike)",
        "Reserves",
        "Seize the Initiative",
      ],
      secondary: [
        "Slay the Warlord (2VP)",
        "First Strike (2VP)",
        "Last Man Standing (1VP)",
      ],
      turns: 5,
    },
  };

  // Objective markers state: { id, x, y, value (2 or 3), label }
  const [objectiveMarkers, setObjectiveMarkers] = useState([]);
  const [placingObjective, setPlacingObjective] = useState(false);
  const [objValue, setObjValue] = useState(2); // 2 or 3 VP
  const [objCounter, setObjCounter] = useState(1);

  const DEPLOY_UNIT_TYPES = [
    {
      id: "infantry",
      label: "Infantry",
      symbol: "╬",
      desc: "Tactical, Despoiler, etc.",
    },
    {
      id: "assault",
      label: "Assault",
      symbol: "⚔",
      desc: "Assault Marines, Rampagers",
    },
    { id: "breacher", label: "Breacher", symbol: "▣", desc: "Breacher Squads" },
    {
      id: "terminator",
      label: "Terminator",
      symbol: "◆",
      desc: "Cataphractii, Tartaros, etc.",
    },
    {
      id: "commander",
      label: "HQ / Command",
      symbol: "★",
      desc: "Praetor, Centurion, Consul",
    },
    {
      id: "primarch",
      label: "Primarch",
      symbol: "✦",
      desc: "Primarch / Paragon",
    },
    {
      id: "recon",
      label: "Recon / Scout",
      symbol: "◎",
      desc: "Recon, Seekers, Pathfinders",
    },
    {
      id: "heavy_support",
      label: "Heavy Support",
      symbol: "▲",
      desc: "Heavy Squads, Havocs",
    },
    {
      id: "dreadnought",
      label: "Dreadnought",
      symbol: "⬡",
      desc: "Contemptor, Leviathan, etc.",
    },
    {
      id: "tank",
      label: "Vehicle / Tank",
      symbol: "▬",
      desc: "Predator, Sicaran, Land Raider",
    },
    {
      id: "artillery",
      label: "Artillery",
      symbol: "▽",
      desc: "Rapier, Whirlwind, Basilisk",
    },
    {
      id: "flyer",
      label: "Flyer",
      symbol: "✈",
      desc: "Storm Eagle, Fire Raptor",
    },
    {
      id: "transport",
      label: "Transport",
      symbol: "◻",
      desc: "Rhino, Drop Pod, Spartan",
    },
    {
      id: "custodes",
      label: "Custodes",
      symbol: "⛊",
      desc: "Custodian Guard, Sentinel",
    },
    {
      id: "automata",
      label: "Automata",
      symbol: "⬢",
      desc: "Castellax, Vorax, Thanatar",
    },
    {
      id: "objective",
      label: "Objective",
      symbol: "⊕",
      desc: "Objective Marker",
    },
    { id: "daemon", label: "Daemon", symbol: "⁂", desc: "Daemon units" },
    { id: "seeker", label: "Seeker", symbol: "◉", desc: "Seeker Squads" },
    {
      id: "destroyer",
      label: "Destroyer",
      symbol: "☢",
      desc: "Destroyer Squads",
    },
    {
      id: "tech_elite",
      label: "Tech-Elite",
      symbol: "⚙",
      desc: "Myrmidon, Ursarax",
    },
    {
      id: "thrall",
      label: "Thrall",
      symbol: "†",
      desc: "Tech-Thralls, Adsecularis",
    },
    { id: "ogryn", label: "Ogryn", symbol: "◈", desc: "Ogryn Charonite" },
    {
      id: "heavy_dread",
      label: "Heavy Dread",
      symbol: "⬣",
      desc: "Telemon, Leviathan",
    },
    { id: "jetbike", label: "Jetbike", symbol: "»", desc: "Jetbike, Agamatus" },
    {
      id: "grav_tank",
      label: "Grav-Tank",
      symbol: "◇",
      desc: "Caladius, Pallas",
    },
  ];

  const getSymbolForType = (typeId) => {
    return DEPLOY_UNIT_TYPES.find((t) => t.id === typeId)?.symbol || "╬";
  };

  // ━━ BASE SIZE DATA (from official Warhammer 30K Base Size Chart) ━━
  // Base sizes in mm. For oval bases, use the long dimension.
  const UNIT_BASE_SIZE_MM = {
    // HQ / Primarchs — 40mm
    praetor: 40,
    praetor_ta: 40,
    centurion: 32,
    centurion_ta: 40,
    delegatus: 32,
    herald: 32,
    vigilator: 32,
    siege_breaker: 32,
    champion: 32,
    moritat: 32,
    praevian: 32,
    primus_medicae: 32,
    chaplain: 32,
    librarian: 32,
    esoterist: 32,
    master_of_signal: 32,
    warsmith: 40,
    forge_lord: 32,
    armistos: 32,
    optae: 32,
    // Troops — 32mm
    tactical: 32,
    tactical_support: 32,
    assault: 32,
    breacher: 32,
    despoiler: 32,
    heavy_support: 32,
    recon: 32,
    seeker: 32,
    destroyer: 32,
    veteran: 32,
    // Terminators — 40mm
    cataphractii: 40,
    tartaros: 40,
    cataphractii_cmd: 40,
    tartaros_cmd: 40,
    firedrake: 40,
    deathshroud: 40,
    justaerin: 40,
    phoenix_term: 40,
    // Jump Pack Infantry — 32mm
    assault_jump: 32,
    dark_fury: 32,
    rampager: 32,
    night_raptor: 32,
    // Dreadnoughts — 60mm
    contemptor: 60,
    castraferrum: 60,
    // Heavy Dreadnoughts — 80mm / 100mm
    leviathan: 80,
    deredeo: 80,
    saturnine: 100,
    // Bikes — 75mm (oval long dimension)
    outrider: 75,
    // Jetbikes — 60mm (oval)
    jetbike: 60,
    scimitar: 60,
    // Vehicles / Tanks — 1 model, large footprint (use hull length ~130mm equivalent)
    predator: 130,
    sicaran: 130,
    sicaran_venator: 130,
    vindicator: 130,
    kratos: 140,
    scorpius: 130,
    arquitor: 100,
    // Transports
    rhino: 120,
    land_raider: 160,
    spartan: 180,
    termite: 100,
    // War Engines
    cerberus: 200,
    typhon: 200,
    falchion: 200,
    glaive: 200,
    fellblade: 200,
    // Flyers
    xiphon: 120,
    storm_eagle: 160,
    fire_raptor: 160,
    // Speeders
    javelin: 75,
    land_speeder: 60,
    sabre: 75,
    // Solar Auxilia — 25mm
    solar_aux_lasrifle: 25,
    solar_aux_veletaris: 25,
    solar_aux_ogryns: 40,
    // Mechanicum
    castellax: 60,
    vorax: 60,
    thanatar: 80,
    thallax: 32,
    myrmidon: 40,
    ursarax: 40,
    tech_thrall: 25,
    // Custodes — 40mm
    custodian_guard: 40,
    sentinel_guard: 40,
    hetaeron_guard: 40,
    sagittarum: 40,
    aquilon: 50,
    agamatus: 75,
    // Lords of War / Knights — 170mm (oval long dimension)
    questoris_knight: 170,
    cerastus_knight: 170,
    // Rapier Battery — 60mm
    rapier: 60,
    // Drop Pod — 120mm
    drop_pod: 120,
  };

  // Default base sizes by unit type (icon type) for units not in the lookup
  const TYPE_BASE_SIZE_MM = {
    infantry: 32,
    assault: 32,
    breacher: 32,
    heavy_support: 32,
    recon: 32,
    seeker: 32,
    destroyer: 32,
    terminator: 40,
    commander: 40,
    primarch: 40,
    dreadnought: 60,
    heavy_dread: 80,
    tank: 130,
    transport: 120,
    artillery: 60,
    flyer: 140,
    grav_tank: 100,
    custodes: 40,
    automata: 60,
    thrall: 25,
    tech_elite: 40,
    jetbike: 60,
    ogryn: 40,
    daemon: 32,
    objective: 40,
  };

  // Calculate map pixel size for a unit based on base size, model count, and scale
  // Models are arranged in a roughly square block. E.g. 10 models → 4×3 or 5×2 grid
  const getUnitMapSize = (unit) => {
    const models = unit.unitData?.models || 1;
    const unitId = unit.unitData?.id;
    const baseMM =
      (unitId && UNIT_BASE_SIZE_MM[unitId]) ||
      TYPE_BASE_SIZE_MM[unit.type] ||
      32;
    const baseInches = baseMM / 25.4;

    if (models <= 1) {
      // Single model: full base size
      return Math.max(baseInches * deployScale, 14);
    }

    // Multi-model: arrange in block then halve
    const cols = Math.ceil(Math.sqrt(models));
    const rows = Math.ceil(models / cols);
    const widthInches = cols * baseInches;
    const heightInches = rows * baseInches;
    const sizeInches = Math.max(widthInches, heightInches);
    return Math.max((sizeInches * deployScale) / 2, 14);
  };

  const handleBoardClick = (e) => {
    // Objective placement mode
    if (placingObjective) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / deployScale;
      const y = (e.clientY - rect.top) / deployScale;
      if (x < 0 || x > BOARD_W || y < 0 || y > BOARD_H) return;
      const snapX = Math.round(x * 2) / 2;
      const snapY = Math.round(y * 2) / 2;
      setObjectiveMarkers((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: snapX,
          y: snapY,
          value: objValue,
          label: `Obj ${objCounter}`,
        },
      ]);
      setObjCounter((c) => c + 1);
      return;
    }
    // Terrain placement mode
    if (placingTerrain) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / deployScale;
      const y = (e.clientY - rect.top) / deployScale;
      if (x < 0 || x > BOARD_W || y < 0 || y > BOARD_H) return;
      const snapX = Math.round(x * 2) / 2;
      const snapY = Math.round(y * 2) / 2;
      addTerrainPiece(snapX, snapY);
      return;
    }
    // Need either a roster unit or a quick-type selected
    if (!deployBrushUnit && !deploySelectedUnit) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / deployScale;
    const y = (e.clientY - rect.top) / deployScale;
    if (x < 0 || x > BOARD_W || y < 0 || y > BOARD_H) return;
    const snapX = Math.round(x * 2) / 2;
    const snapY = Math.round(y * 2) / 2;

    if (deployBrushUnit) {
      // Place a roster unit
      const iconType = getUnitIconType(deployBrushUnit.name);
      const symbol = getSymbolForType(iconType);
      setDeployedUnits((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: iconType,
          x: snapX,
          y: snapY,
          player: deployPlayer,
          label: deployBrushUnit.name,
          symbol,
          name: deployBrushUnit.name,
          unitData: { ...deployBrushUnit, models: deployBrushModels },
          rangedWeapon: deployBrushRangedWeapon,
          meleeWeapon: deployBrushMeleeWeapon,
          secondaryWeapons:
            deployBrushSecondaryWeapons.length > 0
              ? [...deployBrushSecondaryWeapons]
              : null,
          sgtEnabled: deployBrushSgtEnabled,
          sgtWeapon: deployBrushSgtWeapon,
          equipment: canTakeEquipment(deployBrushUnit.id)
            ? { ...deployBrushEquipment }
            : null,
          armyEntryId: deployBrushArmyEntryId || null,
        },
      ]);
      // If this was from army roster, clear the brush so they pick the next unit
      if (deployBrushArmyEntryId) {
        setDeployBrushArmyEntryId(null);
        setDeployBrushUnit(null);
      }
    } else {
      // Quick-place generic type
      const unitType = DEPLOY_UNIT_TYPES.find(
        (u) => u.id === deploySelectedUnit,
      );
      setDeployedUnits((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: deploySelectedUnit,
          x: snapX,
          y: snapY,
          player: deployPlayer,
          label: unitType?.label || deploySelectedUnit,
          symbol: unitType?.symbol || "●",
          name: "",
        },
      ]);
    }
  };

  const removeDeployedUnit = (id) => {
    setDeployedUnits((prev) => prev.filter((u) => u.id !== id));
  };

  // ━━ TERRAIN SYSTEM ━━
  const TERRAIN_TYPES = [
    {
      id: "difficult",
      label: "Difficult Terrain",
      symbol: "≋",
      color: "#5a8a3a",
      bg: "rgba(90,138,58,0.25)",
      border: "rgba(90,138,58,0.8)",
      desc: "Halves movement. Models in difficult terrain count as moving through terrain.",
    },
    {
      id: "dangerous",
      label: "Dangerous Terrain",
      symbol: "⚠",
      color: "#c07a10",
      bg: "rgba(192,122,16,0.25)",
      border: "rgba(192,122,16,0.8)",
      desc: "Models moving through take an Initiative test or suffer a Wound (no armour).",
    },
    {
      id: "impassable",
      label: "Impassable Terrain",
      symbol: "✖",
      color: "#8a2020",
      bg: "rgba(138,32,32,0.30)",
      border: "rgba(138,32,32,0.8)",
      desc: "No model may move through or be placed in impassable terrain.",
    },
    {
      id: "cover",
      label: "Covered Terrain",
      symbol: "⛨",
      color: "#3a6a8a",
      bg: "rgba(58,106,138,0.25)",
      border: "rgba(58,106,138,0.8)",
      desc: "Models wholly or partially behind gain a 5+ Cover Save (or improve existing by 1).",
    },
    {
      id: "fortification",
      label: "Fortification",
      symbol: "▩",
      color: "#7a6a2a",
      bg: "rgba(122,106,42,0.35)",
      border: "rgba(122,106,42,0.9)",
      desc: "Solid structure. Models inside gain 3+ Cover Save and the Battlements benefit.",
    },
  ];

  const [terrainPieces, setTerrainPieces] = useState([]);
  const [placingTerrain, setPlacingTerrain] = useState(false);
  const [selectedTerrainType, setSelectedTerrainType] = useState("difficult");
  const [terrainSize, setTerrainSize] = useState({ w: 6, h: 4 }); // in inches
  const [terrainCounter, setTerrainCounter] = useState(1);
  const [terrainSizing, setTerrainSizing] = useState(false); // toggle between small/medium/large presets

  const TERRAIN_SIZES = [
    { label: 'Small (4"×4")', w: 4, h: 4 },
    { label: 'Medium (6"×6")', w: 6, h: 6 },
    { label: 'Large (8"×6")', w: 8, h: 6 },
    { label: 'Huge (12"×8")', w: 12, h: 8 },
    { label: 'Tower (3"×3")', w: 3, h: 3 },
    { label: 'Wall (10"×2")', w: 10, h: 2 },
  ];

  const addTerrainPiece = (x, y) => {
    const ttype = TERRAIN_TYPES.find((t) => t.id === selectedTerrainType);
    setTerrainPieces((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: selectedTerrainType,
        x: Math.max(
          0,
          Math.min(x - terrainSize.w / 2, BOARD_W - terrainSize.w),
        ),
        y: Math.max(
          0,
          Math.min(y - terrainSize.h / 2, BOARD_H - terrainSize.h),
        ),
        w: terrainSize.w,
        h: terrainSize.h,
        label: `${ttype.label} ${terrainCounter}`,
        color: ttype.color,
        bg: ttype.bg,
        border: ttype.border,
        symbol: ttype.symbol,
      },
    ]);
    setTerrainCounter((c) => c + 1);
  };

  const removeTerrainPiece = (id) => {
    setTerrainPieces((prev) => prev.filter((t) => t.id !== id));
  };

  // ━━ MOVEMENT PHASE STATE ━━
  const MOVE_VALUES = {
    infantry: 7,
    assault: 7,
    breacher: 6,
    terminator: 5,
    commander: 7,
    primarch: 8,
    recon: 7,
    heavy_support: 6,
    dreadnought: 8,
    tank: 10,
    artillery: 0,
    flyer: 20,
    transport: 12,
    custodes: 7,
    automata: 6,
    objective: 0,
    daemon: 6,
    seeker: 7,
    destroyer: 7,
    tech_elite: 6,
    thrall: 6,
    ogryn: 6,
    heavy_dread: 6,
    jetbike: 14,
    grav_tank: 12,
  };
  const [moveSelectedId, setMoveSelectedId] = useState(null);
  const [moveLog, setMoveLog] = useState([]);
  const [movedUnitIds, setMovedUnitIds] = useState(new Set());
  const moveBoardRef = useRef(null);

  const handleMoveMapClick = (e) => {
    if (!moveSelectedId) return;
    const rect = moveBoardRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / deployScale;
    const ny = (e.clientY - rect.top) / deployScale;
    if (nx < 0 || nx > BOARD_W || ny < 0 || ny > BOARD_H) return;
    const snapX = Math.round(nx * 2) / 2;
    const snapY = Math.round(ny * 2) / 2;

    const unit = deployedUnits.find((u) => u.id === moveSelectedId);
    if (!unit) return;
    const maxMove = MOVE_VALUES[unit.type] || 7;
    const dist = Math.sqrt((snapX - unit.x) ** 2 + (snapY - unit.y) ** 2);
    if (dist > maxMove + 0.5) return; // tolerance for snapping

    const clampDist = Math.min(dist, maxMove);
    const fromX = unit.x,
      fromY = unit.y;

    setDeployedUnits((prev) =>
      prev.map((u) =>
        u.id === moveSelectedId ? { ...u, x: snapX, y: snapY } : u,
      ),
    );
    setMovedUnitIds((prev) => new Set([...prev, moveSelectedId]));
    setMoveLog((prev) => [
      ...prev,
      {
        id: moveSelectedId,
        label: unit.label,
        player: unit.player,
        symbol: unit.symbol,
        fromX,
        fromY,
        toX: snapX,
        toY: snapY,
        distance: Math.round(dist * 10) / 10,
        maxMove,
      },
    ]);
    setMoveSelectedId(null);
  };

  const undoLastMove = () => {
    if (moveLog.length === 0) return;
    const last = moveLog[moveLog.length - 1];
    setDeployedUnits((prev) =>
      prev.map((u) =>
        u.id === last.id ? { ...u, x: last.fromX, y: last.fromY } : u,
      ),
    );
    setMovedUnitIds((prev) => {
      const s = new Set(prev);
      s.delete(last.id);
      return s;
    });
    setMoveLog((prev) => prev.slice(0, -1));
  };

  const resetAllMoves = () => {
    // Undo all moves in reverse order
    const reversed = [...moveLog].reverse();
    let units = [...deployedUnits];
    for (const m of reversed) {
      units = units.map((u) =>
        u.id === m.id ? { ...u, x: m.fromX, y: m.fromY } : u,
      );
    }
    setDeployedUnits(units);
    setMovedUnitIds(new Set());
    setMoveLog([]);
  };

  // ━━ SHARED BOARD RENDERER ━━
  const renderBoard = ({
    refObj,
    onClick,
    cursorMode,
    showZones,
    showMoveRange,
    moveRangeUnit,
    extraOverlays,
    unitOnClick,
    weaponRange,
    weaponRangeUnit,
    highlightAttacker,
    highlightTarget,
  }) => {
    const selectedMoveUnit = moveRangeUnit
      ? deployedUnits.find((u) => u.id === moveRangeUnit)
      : null;
    const moveMax = selectedMoveUnit
      ? MOVE_VALUES[selectedMoveUnit.type] || 7
      : 0;
    const weaponUnit = weaponRangeUnit
      ? deployedUnits.find((u) => u.id === weaponRangeUnit)
      : null;
    return React.createElement(
      "div",
      {
        style: {
          ...panelStyle,
          marginBottom: 12,
          padding: 0,
          overflow: "hidden",
        },
      },
      React.createElement(
        "div",
        {
          style: { overflow: "auto", maxHeight: "70vh", background: "#2a2a20" },
        },
        React.createElement(
          "div",
          {
            ref: refObj,
            onClick: onClick,
            style: {
              position: "relative",
              width: BOARD_W * deployScale,
              height: BOARD_H * deployScale,
              background: "#3a3a2e",
              cursor: cursorMode || "default",
              margin: "0 auto",
            },
          },
          React.createElement("div", {
            style: {
              position: "absolute",
              inset: 0,
              opacity: 0.08,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${deployScale - 1}px, rgba(255,255,255,0.1) ${deployScale}px), repeating-linear-gradient(90deg, transparent, transparent ${deployScale - 1}px, rgba(255,255,255,0.1) ${deployScale}px)`,
              pointerEvents: "none",
            },
          }),
          deployShowGrid &&
            Array.from({ length: Math.floor(BOARD_W / 6) + 1 }, (_, i) =>
              React.createElement("div", {
                key: `gv${i}`,
                style: {
                  position: "absolute",
                  left: i * 6 * deployScale,
                  top: 0,
                  width: 1,
                  height: BOARD_H * deployScale,
                  background:
                    i % 2 === 0
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.06)",
                  pointerEvents: "none",
                },
              }),
            ),
          deployShowGrid &&
            Array.from({ length: Math.floor(BOARD_H / 6) + 1 }, (_, i) =>
              React.createElement("div", {
                key: `gh${i}`,
                style: {
                  position: "absolute",
                  top: i * 6 * deployScale,
                  left: 0,
                  height: 1,
                  width: BOARD_W * deployScale,
                  background:
                    i % 2 === 0
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.06)",
                  pointerEvents: "none",
                },
              }),
            ),
          deployShowGrid &&
            Array.from({ length: Math.floor(BOARD_W / 12) + 1 }, (_, i) =>
              React.createElement(
                "div",
                {
                  key: `lv${i}`,
                  style: {
                    position: "absolute",
                    left: i * 12 * deployScale - 6,
                    top: 2,
                    fontSize: 8,
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "'Share Tech Mono', serif",
                    pointerEvents: "none",
                  },
                },
                i * 12,
                '"',
              ),
            ),
          deployShowGrid &&
            Array.from({ length: Math.floor(BOARD_H / 12) + 1 }, (_, i) =>
              React.createElement(
                "div",
                {
                  key: `lh${i}`,
                  style: {
                    position: "absolute",
                    top: i * 12 * deployScale - 4,
                    left: 3,
                    fontSize: 8,
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "'Share Tech Mono', serif",
                    pointerEvents: "none",
                  },
                },
                i * 12,
                '"',
              ),
            ),
          showZones &&
            (() => {
              const mission = MISSIONS[missionType];
              if (!mission) return null;
              const zones = mission.renderZones(deployScale);
              return React.createElement(
                React.Fragment,
                null,
                zones.map((z, i) =>
                  React.createElement(
                    "div",
                    {
                      key: i,
                      style: {
                        position: "absolute",
                        left: z.left,
                        top: z.top,
                        width: z.width,
                        height: z.height,
                        background: z.color,
                        border: z.border,
                        pointerEvents: "none",
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          position: "absolute",
                          fontSize: 11,
                          fontFamily: "'Share Tech Mono', serif",
                          letterSpacing: 1,
                          ...z.labelStyle,
                        },
                      },
                      z.label,
                    ),
                  ),
                ),
                mission.exclusionCircle &&
                  React.createElement(
                    "svg",
                    {
                      style: {
                        position: "absolute",
                        inset: 0,
                        width: BOARD_W * deployScale,
                        height: BOARD_H * deployScale,
                        pointerEvents: "none",
                      },
                    },
                    React.createElement("circle", {
                      cx: (BOARD_W / 2) * deployScale,
                      cy: (BOARD_H / 2) * deployScale,
                      r: 9 * deployScale,
                      fill: "none",
                      stroke: "rgba(255,255,255,0.18)",
                      strokeWidth: 1.5,
                      strokeDasharray: "6,4",
                    }),
                    React.createElement(
                      "text",
                      {
                        x: (BOARD_W / 2) * deployScale,
                        y: (BOARD_H / 2) * deployScale - 2,
                        textAnchor: "middle",
                        fontSize: 8,
                        fill: "rgba(255,255,255,0.18)",
                        fontFamily: "'Share Tech Mono', serif",
                      },
                      '18" EXCLUSION ZONE',
                    ),
                  ),
                React.createElement("div", {
                  style: {
                    position: "absolute",
                    left: 0,
                    top: (BOARD_H / 2) * deployScale - 0.5,
                    width: BOARD_W * deployScale,
                    height: 1,
                    background: "rgba(255,255,255,0.08)",
                    pointerEvents: "none",
                  },
                }),
                missionType === "hammer" &&
                  React.createElement("div", {
                    style: {
                      position: "absolute",
                      left: (BOARD_W / 2) * deployScale - 0.5,
                      top: 0,
                      width: 1,
                      height: BOARD_H * deployScale,
                      background: "rgba(255,255,255,0.08)",
                      pointerEvents: "none",
                    },
                  }),
                React.createElement(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.15)",
                      fontFamily: "'Share Tech Mono', serif",
                      letterSpacing: 4,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                    },
                  },
                  "NO MAN'S LAND",
                ),
              );
            })(),
          missionType === "zm" &&
            showZones &&
            (() => {
              const zm =
                ZM_SECTION_TYPES[zmMission] || ZM_SECTION_TYPES.sector_sweep;
              const zmObjs = ZM_OBJECTIVES[zmMission] || [];
              // ZM board is 48"×48", offset within the 72"×48" board (centre it horizontally)
              const zmOffX = (BOARD_W - ZM_BOARD) / 2; // 12" offset on each side
              const zmOffY = 0;
              const S = ZM_SECTION * deployScale;
              const OX = zmOffX * deployScale;
              const OY = zmOffY * deployScale;

              const sectionColors = {
                alpha: {
                  bg: "rgba(120,80,200,0.12)",
                  border: "rgba(150,100,220,0.5)",
                  label: "α CS(8)",
                },
                beta: {
                  bg: "rgba(60,140,200,0.12)",
                  border: "rgba(80,160,220,0.5)",
                  label: "β CS(6)",
                },
                normal: {
                  bg: "rgba(80,180,80,0.1)",
                  border: "rgba(100,200,100,0.4)",
                  label: "",
                },
              };
              const deployZoneColors = {
                A: "rgba(155,45,45,0.2)",
                B: "rgba(42,111,180,0.2)",
              };

              return React.createElement(
                "svg",
                {
                  style: {
                    position: "absolute",
                    inset: 0,
                    width: BOARD_W * deployScale,
                    height: BOARD_H * deployScale,
                    pointerEvents: "none",
                  },
                },
                React.createElement("rect", {
                  x: OX,
                  y: OY,
                  width: ZM_BOARD * deployScale,
                  height: ZM_BOARD * deployScale,
                  fill: "none",
                  stroke: "rgba(180,140,255,0.7)",
                  strokeWidth: 2,
                }),
                React.createElement(
                  "text",
                  {
                    x: OX + (ZM_BOARD * deployScale) / 2,
                    y: OY - 6,
                    textAnchor: "middle",
                    fontSize: 9,
                    fill: "rgba(180,140,255,0.8)",
                    fontFamily: "'Share Tech Mono', serif",
                    letterSpacing: 2,
                  },
                  "ZONE MORTALIS —",
                  (ZM_MISSIONS_INFO[zmMission] || {}).config || "",
                ),
                zm.map((sec, idx) => {
                  const col = idx % ZM_COLS;
                  const row = Math.floor(idx / ZM_COLS);
                  const sx = OX + col * S;
                  const sy = OY + row * S;
                  const colors =
                    sectionColors[sec.type] || sectionColors.normal;
                  const deployFill = sec.zone
                    ? deployZoneColors[sec.zone]
                    : null;
                  const secStatus = zmSections[idx];
                  const isAbyssal = secStatus && secStatus.abyssal;
                  const dynConf = secStatus && secStatus.confinedX;
                  return React.createElement(
                    "g",
                    { key: idx },
                    deployFill &&
                      React.createElement("rect", {
                        x: sx,
                        y: sy,
                        width: S,
                        height: S,
                        fill: deployFill,
                      }),
                    React.createElement("rect", {
                      x: sx,
                      y: sy,
                      width: S,
                      height: S,
                      fill: isAbyssal ? "rgba(20,10,40,0.55)" : colors.bg,
                      stroke: colors.border,
                      strokeWidth: 1.2,
                    }),
                    sec.type !== "normal" &&
                      React.createElement(
                        "text",
                        {
                          x: sx + S / 2,
                          y: sy + S / 2 - 4,
                          textAnchor: "middle",
                          fontSize: 10,
                          fill: isAbyssal
                            ? "rgba(180,80,255,0.9)"
                            : "rgba(200,180,255,0.7)",
                          fontFamily: "'Share Tech Mono', serif",
                        },
                        isAbyssal ? "DARK" : colors.label,
                      ),
                    dynConf &&
                      React.createElement(
                        "text",
                        {
                          x: sx + S / 2,
                          y: sy + S / 2 + 8,
                          textAnchor: "middle",
                          fontSize: 8,
                          fill: "rgba(255,200,80,0.8)",
                          fontFamily: "'Share Tech Mono', serif",
                        },
                        "CS(",
                        dynConf,
                        ")",
                      ),
                    sec.zone &&
                      React.createElement(
                        "text",
                        {
                          x: sx + 4,
                          y: sy + 10,
                          fontSize: 8,
                          fill:
                            sec.zone === "A"
                              ? "rgba(255,140,140,0.9)"
                              : "rgba(120,180,255,0.9)",
                          fontFamily: "'Share Tech Mono', serif",
                        },
                        "ZONE",
                        sec.zone,
                      ),
                    React.createElement(
                      "text",
                      {
                        x: sx + S - 4,
                        y: sy + S - 3,
                        textAnchor: "end",
                        fontSize: 7,
                        fill: "rgba(255,255,255,0.2)",
                        fontFamily: "'Share Tech Mono', serif",
                      },
                      idx + 1,
                    ),
                  );
                }),
                zmObjs.map((obj, i) => {
                  const ox = OX + obj.x * deployScale;
                  const oy = OY + obj.y * deployScale;
                  return React.createElement(
                    "g",
                    { key: i },
                    React.createElement("circle", {
                      cx: ox,
                      cy: oy,
                      r: 7,
                      fill: "rgba(255,215,0,0.25)",
                      stroke: "rgba(255,215,0,0.8)",
                      strokeWidth: 1.5,
                    }),
                    React.createElement(
                      "text",
                      {
                        x: ox,
                        y: oy + 1,
                        textAnchor: "middle",
                        dominantBaseline: "middle",
                        fontSize: 8,
                        fill: "rgba(255,215,0,1)",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: "bold",
                      },
                      "⊕",
                    ),
                    React.createElement(
                      "text",
                      {
                        x: ox,
                        y: oy + 13,
                        textAnchor: "middle",
                        fontSize: 7,
                        fill: "rgba(255,215,0,0.85)",
                        fontFamily: "'Share Tech Mono', serif",
                      },
                      obj.label,
                      obj.value > 0 ? " " + obj.value + "VP" : " ?VP",
                    ),
                  );
                }),
                Array.from({ length: ZM_COLS + 1 }, (_, i) =>
                  React.createElement("line", {
                    key: "v" + i,
                    x1: OX + i * S,
                    y1: OY,
                    x2: OX + i * S,
                    y2: OY + ZM_BOARD * deployScale,
                    stroke: "rgba(180,140,255,0.3)",
                    strokeWidth: 0.5,
                  }),
                ),
                Array.from({ length: ZM_ROWS + 1 }, (_, i) =>
                  React.createElement("line", {
                    key: "h" + i,
                    x1: OX,
                    y1: OY + i * S,
                    x2: OX + ZM_BOARD * deployScale,
                    y2: OY + i * S,
                    stroke: "rgba(180,140,255,0.3)",
                    strokeWidth: 0.5,
                  }),
                ),
                Array.from({ length: ZM_COLS + 1 }, (_, i) =>
                  React.createElement(
                    "text",
                    {
                      key: "rl" + i,
                      x: OX + i * S,
                      y: OY + ZM_BOARD * deployScale + 10,
                      textAnchor: "middle",
                      fontSize: 7,
                      fill: "rgba(180,140,255,0.5)",
                      fontFamily: "'Share Tech Mono', serif",
                    },
                    i * 12,
                    '"',
                  ),
                ),
              );
            })(),
          showMoveRange &&
            selectedMoveUnit &&
            React.createElement("div", {
              style: {
                position: "absolute",
                left: selectedMoveUnit.x * deployScale - moveMax * deployScale,
                top: selectedMoveUnit.y * deployScale - moveMax * deployScale,
                width: moveMax * 2 * deployScale,
                height: moveMax * 2 * deployScale,
                borderRadius: "50%",
                border: "2px dashed rgba(255,220,80,0.5)",
                background: "rgba(255,220,80,0.06)",
                pointerEvents: "none",
              },
            }),
          moveLog.length > 0 &&
            React.createElement(
              "svg",
              {
                style: {
                  position: "absolute",
                  inset: 0,
                  width: BOARD_W * deployScale,
                  height: BOARD_H * deployScale,
                  pointerEvents: "none",
                },
              },
              moveLog.map((m, i) =>
                React.createElement(
                  "g",
                  { key: i },
                  React.createElement("line", {
                    x1: m.fromX * deployScale,
                    y1: m.fromY * deployScale,
                    x2: m.toX * deployScale,
                    y2: m.toY * deployScale,
                    stroke:
                      m.player === "p1"
                        ? "rgba(255,100,100,0.4)"
                        : "rgba(100,160,255,0.4)",
                    strokeWidth: 2,
                    strokeDasharray: "4,3",
                  }),
                  React.createElement("circle", {
                    cx: m.fromX * deployScale,
                    cy: m.fromY * deployScale,
                    r: 3,
                    fill:
                      m.player === "p1"
                        ? "rgba(255,100,100,0.3)"
                        : "rgba(100,160,255,0.3)",
                  }),
                ),
              ),
            ),
          extraOverlays,
          weaponRange > 0 &&
            weaponUnit &&
            React.createElement("div", {
              style: {
                position: "absolute",
                left: weaponUnit.x * deployScale - weaponRange * deployScale,
                top: weaponUnit.y * deployScale - weaponRange * deployScale,
                width: weaponRange * 2 * deployScale,
                height: weaponRange * 2 * deployScale,
                borderRadius: "50%",
                border: "2px dashed rgba(255,140,40,0.5)",
                background: "rgba(255,140,40,0.04)",
                pointerEvents: "none",
              },
            }),
          highlightAttacker &&
            highlightTarget &&
            (() => {
              const au = deployedUnits.find((u) => u.id === highlightAttacker);
              const tu = deployedUnits.find((u) => u.id === highlightTarget);
              if (!au || !tu) return null;
              const dist =
                Math.round(
                  Math.sqrt((au.x - tu.x) ** 2 + (au.y - tu.y) ** 2) * 10,
                ) / 10;
              const inRange = weaponRange > 0 ? dist <= weaponRange : true;
              return React.createElement(
                "svg",
                {
                  style: {
                    position: "absolute",
                    inset: 0,
                    width: BOARD_W * deployScale,
                    height: BOARD_H * deployScale,
                    pointerEvents: "none",
                  },
                },
                React.createElement("line", {
                  x1: au.x * deployScale,
                  y1: au.y * deployScale,
                  x2: tu.x * deployScale,
                  y2: tu.y * deployScale,
                  stroke: inRange
                    ? "rgba(255,200,40,0.6)"
                    : "rgba(255,60,60,0.5)",
                  strokeWidth: 2,
                  strokeDasharray: inRange ? "6,3" : "3,3",
                }),
                React.createElement(
                  "text",
                  {
                    x: ((au.x + tu.x) / 2) * deployScale,
                    y: ((au.y + tu.y) / 2) * deployScale - 6,
                    fill: inRange
                      ? "rgba(255,220,80,0.8)"
                      : "rgba(255,80,80,0.8)",
                    fontSize: 9,
                    fontFamily: "'Share Tech Mono', serif",
                    textAnchor: "middle",
                  },
                  dist,
                  '"',
                  !inRange ? "(OUT OF RANGE)" : "",
                ),
              );
            })(),
          terrainPieces.map((terrain) => {
            const ttype = TERRAIN_TYPES.find((t) => t.id === terrain.type);
            return React.createElement(
              "div",
              {
                key: terrain.id,
                title: `${terrain.label} — ${ttype?.desc || ""}`,
                style: {
                  position: "absolute",
                  left: terrain.x * deployScale,
                  top: terrain.y * deployScale,
                  width: terrain.w * deployScale,
                  height: terrain.h * deployScale,
                  background: terrain.bg,
                  border: `2px solid ${terrain.border}`,
                  borderRadius: terrain.type === "fortification" ? 3 : 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 2,
                  boxShadow:
                    terrain.type === "fortification"
                      ? `inset 0 0 8px rgba(0,0,0,0.3), 0 0 4px ${terrain.border}`
                      : "none",
                },
              },
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: Math.max(terrain.w * deployScale * 0.22, 10),
                    color: terrain.color,
                    lineHeight: 1,
                  },
                },
                terrain.symbol,
              ),
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: Math.max(
                      Math.min(terrain.w * deployScale * 0.09, 9),
                      6,
                    ),
                    color: terrain.color,
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    textAlign: "center",
                    lineHeight: 1.2,
                    marginTop: 2,
                    textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                  },
                },
                terrain.w * deployScale > 50 ? terrain.label : "",
              ),
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: 7,
                    color: terrain.color,
                    opacity: 0.7,
                    fontFamily: "'Share Tech Mono', serif",
                  },
                },
                terrain.w * deployScale > 40
                  ? `${terrain.w}″×${terrain.h}″`
                  : "",
              ),
            );
          }),
          objectiveMarkers.map((obj) => {
            const sz = Math.max(deployScale * 2, 18);
            const canInteract = activePhase === "deployment";
            return React.createElement(
              "div",
              {
                key: obj.id,
                onClick: (e) => {
                  e.stopPropagation();
                  if (canInteract)
                    setObjectiveMarkers((prev) =>
                      prev.filter((o) => o.id !== obj.id),
                    );
                },
                title: canInteract
                  ? `${obj.label} — ${obj.value} VP (click to remove)`
                  : `${obj.label} — ${obj.value} VP`,
                style: {
                  position: "absolute",
                  left: obj.x * deployScale - sz / 2,
                  top: obj.y * deployScale - sz / 2,
                  width: sz,
                  height: sz,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  borderRadius: "50%",
                  background: "rgba(255,215,0,0.9)",
                  border: "2.5px solid #ffd700",
                  boxShadow: "0 0 8px rgba(255,215,0,0.6)",
                  color: "#2a2418",
                  fontSize: Math.max(sz * 0.4, 8),
                  fontWeight: 900,
                  fontFamily: "'Share Tech Mono', serif",
                  cursor: canInteract ? "pointer" : "default",
                  zIndex: 5,
                  pointerEvents: canInteract ? "auto" : "none",
                },
              },
              "⊕",
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: Math.max(sz * 0.28, 6),
                    lineHeight: 1,
                    color: "#6b4508",
                  },
                },
                obj.value,
                "VP",
              ),
            );
          }),
          deployedUnits.map((unit) => {
            const isP1 = unit.player === "p1";
            const col = isP1 ? "#e05555" : "#5599dd";
            const bgCol = isP1
              ? "rgba(200,60,60,0.85)"
              : "rgba(50,120,200,0.85)";
            const sz = getUnitMapSize(unit);
            const isSelected = unit.id === moveRangeUnit;
            const isAttacker = unit.id === highlightAttacker;
            const isTarget = unit.id === highlightTarget;
            const isRouted = routedUnits.has(unit.id);
            const hasMoved = movedUnitIds.has(unit.id);
            const facing = unitFacings[unit.id];
            return React.createElement(
              "div",
              {
                key: unit.id,
                onClick: (e) => {
                  e.stopPropagation();
                  unitOnClick && unitOnClick(unit, e);
                },
                title: `${unit.label} (${unit.player.toUpperCase()}) — ${unit.x}", ${unit.y}"${isRouted ? " — ROUTED" : ""}${hasMoved ? " (moved)" : ""}`,
                style: {
                  position: "absolute",
                  left: unit.x * deployScale - sz / 2,
                  top: unit.y * deployScale - sz / 2,
                  width: sz,
                  height: sz,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius:
                    unit.type === "tank" || unit.type === "transport"
                      ? 3
                      : unit.type === "objective"
                        ? "50%"
                        : 4,
                  background: isRouted
                    ? "rgba(100,100,100,0.7)"
                    : unit.type === "objective"
                      ? "rgba(255,215,0,0.85)"
                      : bgCol,
                  border: isAttacker
                    ? "2.5px solid #ffd700"
                    : isTarget
                      ? "2.5px solid #ff4444"
                      : isSelected
                        ? "2px solid #ffd700"
                        : `1.5px solid ${unit.type === "objective" ? "#ffd700" : col}`,
                  color: unit.type === "objective" ? "#2a2418" : "#fff",
                  fontSize: Math.max(sz * 0.55, 10),
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: isAttacker
                    ? "0 0 14px rgba(255,215,0,0.6)"
                    : isTarget
                      ? "0 0 14px rgba(255,60,60,0.6)"
                      : isSelected
                        ? "0 0 12px rgba(255,215,0,0.5)"
                        : hasMoved
                          ? `0 0 6px rgba(${isP1 ? "255,100,100" : "100,160,255"},0.4)`
                          : "0 1px 4px rgba(0,0,0,0.4)",
                  transition: "all 0.15s ease",
                  zIndex: isAttacker || isTarget ? 25 : isSelected ? 20 : 10,
                  lineHeight: 1,
                  opacity: isRouted ? 0.5 : hasMoved && !isSelected ? 0.7 : 1,
                },
              },
              unit.symbol,
              facing !== undefined &&
                React.createElement("div", {
                  style: {
                    position: "absolute",
                    left:
                      sz / 2 +
                      Math.cos((facing * Math.PI) / 180) * (sz / 2 + 4) -
                      3,
                    top:
                      sz / 2 +
                      Math.sin((facing * Math.PI) / 180) * (sz / 2 + 4) -
                      3,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isRouted
                      ? "#888"
                      : isP1
                        ? "#ff8888"
                        : "#88bbff",
                    border: "1px solid rgba(255,255,255,0.5)",
                    pointerEvents: "none",
                  },
                }),
              isRouted &&
                React.createElement(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      top: -8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: 8,
                      color: "#ff6666",
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                    },
                  },
                  "ROUTED",
                ),
            );
          }),
          React.createElement("div", {
            style: {
              position: "absolute",
              inset: 0,
              border: "2px solid rgba(255,255,255,0.2)",
              borderRadius: 2,
              pointerEvents: "none",
            },
          }),
        ),
      ),
    );
  };

  // Melee weapons for assault phase
  const aMeleeWeapons = useMemo(() => {
    const base = aUnit ? MELEE_getRangedWeapons(aUnit.id) : [];
    const legion =
      aFaction && aFaction !== "legiones_astartes"
        ? LEGION_MELEE_WEAPONS[aFaction] || []
        : [];
    return [...base, ...legion.map((w) => ({ ...w, isLegion: true }))];
  }, [aUnit, aFaction]);
  const dMeleeWeapons = useMemo(() => {
    const base = dUnit ? MELEE_getRangedWeapons(dUnit.id) : [];
    const legion =
      dFaction && dFaction !== "legiones_astartes"
        ? LEGION_MELEE_WEAPONS[dFaction] || []
        : [];
    return [...base, ...legion.map((w) => ({ ...w, isLegion: true }))];
  }, [dUnit, dFaction]);
  // Ranged weapons for assault units (for volley fire / overwatch)
  const aRangedWeapons = useMemo(() => {
    const base = aUnit ? getRangedWeapons(aUnit.id) : [];
    const legion =
      aFaction && aFaction !== "legiones_astartes"
        ? LEGION_RANGED_WEAPONS[aFaction] || []
        : [];
    return [...base, ...legion];
  }, [aUnit, aFaction]);
  const dRangedWeapons = useMemo(() => {
    const base = dUnit ? getRangedWeapons(dUnit.id) : [];
    const legion =
      dFaction && dFaction !== "legiones_astartes"
        ? LEGION_RANGED_WEAPONS[dFaction] || []
        : [];
    return [...base, ...legion];
  }, [dUnit, dFaction]);

  const meleeUnitRoster = useMemo(() => {
    return UNIT_PRESETS.map((cat) => ({
      ...cat,
      units: cat.units.filter(
        (u) =>
          MELEE_WEAPON_PROFILES[u.id]?.length > 0 ||
          LEGION_WEAPON_PROFILES[u.id]?.length > 0 ||
          WEAPON_PROFILES[u.id]?.length > 0,
      ),
    })).filter((cat) => cat.units.length > 0);
  }, []);

  const applyAssaultUnit = useCallback((unit, side) => {
    const meleeWeapons = MELEE_getRangedWeapons(unit.id);
    const rangedWeapons = getRangedWeapons(unit.id);
    const w0 = meleeWeapons[0];
    const r0 =
      rangedWeapons.find(
        (w) =>
          (w.traits || "").toLowerCase().includes("assault") ||
          (w.type || "").toLowerCase() === "pistol",
      ) || null;
    if (side === "attacker") {
      setAUnit(unit);
      setAShowPresets(false);
      setAModels(unit.models);
      setASecondaryMelee([]);
      setASecondaryRanged([]);
      setAAssaultSgtEnabled(false);
      setAAssaultSgtMelee(null);
      setAVolleyModels(unit.models);
      if (w0) {
        setASelectedMelee(w0);
        setAWS(w0.ws);
        setAS(w0.s);
        setAAP(w0.ap);
        setAI(w0.i);
        setAA(w0.a);
        setAW(w0.w);
        setAT(w0.t);
        setASv(w0.sv);
        setAInv(w0.inv);
        setAFnp(w0.fnp);
        setARules(w0.rules || {});
        setALd(w0.ld || 8);
      }
      // Default movement: 6 for most infantry, 8 for cavalry/bikes, 4 for terminators/heavy
      const nm = unit.name?.toLowerCase() || "";
      const defaultMove =
        nm.includes("terminator") ||
        nm.includes("dreadnought") ||
        nm.includes("automata")
          ? 4
          : nm.includes("cavalry") ||
              nm.includes("bike") ||
              nm.includes("rider") ||
              nm.includes("keshig") ||
              nm.includes("varagyr")
            ? 8
            : 6;
      setAMove(defaultMove);
      setASelectedRanged(r0);
      // Wire to volley fire
      if (r0) {
        setVolleyFireShots(r0.shots);
        setVolleyFireS(r0.s);
        setVolleyFireAP(r0.ap);
      }
    } else {
      setDUnit(unit);
      setDShowPresets(false);
      setDModels(unit.models);
      setDSecondaryMelee([]);
      setDSecondaryRanged([]);
      setDAssaultSgtEnabled(false);
      setDAssaultSgtMelee(null);
      setDVolleyModels(unit.models);
      setDOverwatchModels(unit.models);
      setDOverwatchWeapon(rangedWeapons[0] || null);
      setDOverwatchSecondary([]);
      if (w0) {
        setDSelectedMelee(w0);
        setDWS(w0.ws);
        setDS(w0.s);
        setDAP(w0.ap);
        setDI(w0.i);
        setDA(w0.a);
        setDW(w0.w);
        setDT(w0.t);
        setDSv(w0.sv);
        setDInv(w0.inv);
        setDFnp(w0.fnp);
        setDRules(w0.rules || {});
        setDLd(w0.ld || 8);
      }
      setDSelectedRanged(r0);
      // Wire to defender volley fire + overwatch
      if (r0) {
        setDefVolleyFireShots(r0.shots);
        setDefVolleyFireS(r0.s);
        setDefVolleyFireAP(r0.ap);
        setOverwatchShots(r0.shots);
        setOverwatchS(r0.s);
        setOverwatchAP(r0.ap);
      }
      if (unit.bs) setOverwatchBS(unit.bs);
    }
  }, []);

  const applyAssaultMelee = useCallback((w, side) => {
    if (side === "attacker") {
      setASelectedMelee(w);
      setAWS(w.ws);
      setAS(w.s);
      setAAP(w.ap);
      setAI(w.i);
      setAA(w.a);
      setAW(w.w);
      setAT(w.t);
      setASv(w.sv);
      setAInv(w.inv);
      setAFnp(w.fnp);
      setARules(w.rules || {});
    } else {
      setDSelectedMelee(w);
      setDWS(w.ws);
      setDS(w.s);
      setDAP(w.ap);
      setDI(w.i);
      setDA(w.a);
      setDW(w.w);
      setDT(w.t);
      setDSv(w.sv);
      setDInv(w.inv);
      setDFnp(w.fnp);
      setDRules(w.rules || {});
    }
  }, []);

  // Apply selected ranged weapon and wire to volley/overwatch
  const applyAssaultRanged = useCallback((w, side) => {
    if (side === "attacker") {
      setASelectedRanged(w);
      setVolleyFireShots(w.shots);
      setVolleyFireS(w.s);
      setVolleyFireAP(w.ap);
    } else {
      setDSelectedRanged(w);
      setDefVolleyFireShots(w.shots);
      setDefVolleyFireS(w.s);
      setDefVolleyFireAP(w.ap);
      setOverwatchShots(w.shots);
      setOverwatchS(w.s);
      setOverwatchAP(w.ap);
    }
  }, []);

  // Secondary ranged weapon helpers
  const addSecondaryRanged = useCallback(
    (side) => {
      const weapons = side === "attacker" ? aRangedWeapons : dRangedWeapons;
      if (weapons.length === 0) return;
      const entry = { weapon: weapons[0], models: 1 };
      if (side === "attacker") setASecondaryRanged((prev) => [...prev, entry]);
      else setDSecondaryRanged((prev) => [...prev, entry]);
    },
    [aRangedWeapons, dRangedWeapons],
  );

  const updateSecondaryRanged = useCallback((side, idx, field, val) => {
    const setter =
      side === "attacker" ? setASecondaryRanged : setDSecondaryRanged;
    setter((prev) =>
      prev.map((sw, i) => (i === idx ? { ...sw, [field]: val } : sw)),
    );
  }, []);

  const removeSecondaryRanged = useCallback((side, idx) => {
    const setter =
      side === "attacker" ? setASecondaryRanged : setDSecondaryRanged;
    setter((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleAssaultResolve = () => {
    setShowFiringVideo(true);
    // ━━ BUILD ATTACKER WEAPON GROUPS ━━
    let atkBaseAttacks = aA;
    const setupLog = [];
    if (assaultCharging && !assaultDisordered) {
      atkBaseAttacks += 1;
      setupLog.push({
        phase: "Setup",
        text: `Attacker +1A for charging (${aA} + 1 = ${atkBaseAttacks})`,
      });
    } else if (assaultCharging && assaultDisordered) {
      setupLog.push({
        phase: "Setup",
        text: `Disordered Charge: no +1A bonus`,
      });
    }
    if (aRules?.m_rampage && dModels > aModels) {
      const rb = Math.ceil(Math.random() * 3);
      atkBaseAttacks += rb;
      setupLog.push({
        phase: "Setup",
        text: `Rampage: +${rb} attacks (now ${atkBaseAttacks})`,
      });
    }

    const atkSgtActive = aAssaultSgtEnabled && aAssaultSgtMelee;
    const atkSquadModels = atkSgtActive ? Math.max(1, aModels - 1) : aModels;
    const atkPrimaryI = aRules?.m_unwieldy ? 1 : aI;
    const atkWeaponGroups = [
      {
        weaponName: aSelectedMelee?.name || "Primary",
        models: atkSquadModels,
        attacks: atkBaseAttacks,
        i: atkPrimaryI,
        ws: aWS,
        s: aS,
        ap: aAP,
        w: aW,
        rules: aRules,
      },
    ];
    if (atkSgtActive) {
      const sw = aAssaultSgtMelee;
      const sgtI = sw.rules?.m_unwieldy ? 1 : sw.i || aI;
      atkWeaponGroups.push({
        weaponName: `★ Sgt: ${sw.name}`,
        models: 1,
        attacks: sw.a || 1,
        i: sgtI,
        ws: sw.ws || aWS,
        s: sw.s,
        ap: sw.ap,
        w: aW,
        rules: sw.rules || {},
      });
      setupLog.push({
        phase: "Setup",
        text: `Attacker Sergeant: ${sw.name} (WS${sw.ws || aWS} S${sw.s} AP${sw.ap} I${sgtI} A${sw.a || 1})`,
      });
    }
    for (const sec of aSecondaryMelee) {
      const w = sec.weapon;
      const effI = w.rules?.m_unwieldy ? 1 : w.i || aI;
      atkWeaponGroups.push({
        weaponName: w.name,
        models: sec.models,
        attacks: w.a || 1,
        i: effI,
        ws: w.ws || aWS,
        s: w.s,
        ap: w.ap,
        w: w.w || aW,
        rules: w.rules || {},
      });
    }

    // ━━ BUILD DEFENDER WEAPON GROUPS ━━
    const defSgtActive = dAssaultSgtEnabled && dAssaultSgtMelee;
    const defSquadModels = defSgtActive ? Math.max(1, dModels - 1) : dModels;
    const defPrimaryI = dRules?.m_unwieldy ? 1 : dI;
    const defWeaponGroups = [
      {
        weaponName: dSelectedMelee?.name || "Primary",
        models: defSquadModels,
        attacks: dA,
        i: defPrimaryI,
        ws: dWS,
        s: dS,
        ap: dAP,
        w: dW,
        rules: dRules,
      },
    ];
    if (defSgtActive) {
      const sw = dAssaultSgtMelee;
      const sgtI = sw.rules?.m_unwieldy ? 1 : sw.i || dI;
      defWeaponGroups.push({
        weaponName: `★ Sgt: ${sw.name}`,
        models: 1,
        attacks: sw.a || 1,
        i: sgtI,
        ws: sw.ws || dWS,
        s: sw.s,
        ap: sw.ap,
        w: dW,
        rules: sw.rules || {},
      });
      setupLog.push({
        phase: "Setup",
        text: `Defender Sergeant: ${sw.name} (WS${sw.ws || dWS} S${sw.s} AP${sw.ap} I${sgtI} A${sw.a || 1})`,
      });
    }
    for (const sec of dSecondaryMelee) {
      const w = sec.weapon;
      const effI = w.rules?.m_unwieldy ? 1 : w.i || dI;
      defWeaponGroups.push({
        weaponName: w.name,
        models: sec.models,
        attacks: w.a || 1,
        i: effI,
        ws: w.ws || dWS,
        s: w.s,
        ap: w.ap,
        w: w.w || dW,
        rules: w.rules || {},
      });
    }

    const allI = [
      ...new Set([
        ...atkWeaponGroups.map((g) => g.i),
        ...defWeaponGroups.map((g) => g.i),
      ]),
    ].sort((a, b) => b - a);
    setupLog.push({
      phase: "Setup",
      text: `Attacker: ${atkWeaponGroups.map((g) => `${g.weaponName} I${g.i} (${g.models}x${g.attacks}A)`).join(", ")}`,
    });
    setupLog.push({
      phase: "Setup",
      text: `Defender: ${defWeaponGroups.map((g) => `${g.weaponName} I${g.i} (${g.models}x${g.attacks}A)`).join(", ")}`,
    });
    setupLog.push({
      phase: "Setup",
      text: `Initiative order: ${allI.join(" -> ")}`,
    });

    const combined = resolveAssaultPhase({
      attackerModels: aModels,
      attackerWS: aWS,
      attackerI: aI,
      attackerA: aA,
      attackerW: aW,
      attackerSv: aSv,
      attackerInv: aInv,
      attackerFnp: aFnp,
      attackerT: aT,
      attackerS: aS,
      attackerAP: aAP,
      attackerRules: aRules,
      defenderModels: dModels,
      defenderWS: dWS,
      defenderI: dI,
      defenderA: dA,
      defenderW: dW,
      defenderSv: dSv,
      defenderInv: dInv,
      defenderFnp: dFnp,
      defenderT: dT,
      defenderS: dS,
      defenderAP: dAP,
      defenderRules: dRules,
      isCharging: assaultCharging,
      disordered: assaultDisordered,
      atkWeaponGroups,
      defWeaponGroups,
    });
    combined.log = [...setupLog, ...combined.log];

    // Per-group dice display (ordered: attacker groups first, then defender)
    combined.rollsByGroup = [
      ...atkWeaponGroups.map(
        (g) =>
          combined.groupRollsMap["atk:" + g.weaponName] || {
            side: "Attacker",
            name: g.weaponName,
            models: g.models,
            i: g.i,
            rolls: { hit: [], wound: [], save: [], fnp: [] },
          },
      ),
      ...defWeaponGroups.map(
        (g) =>
          combined.groupRollsMap["def:" + g.weaponName] || {
            side: "Defender",
            name: g.weaponName,
            models: g.models,
            i: g.i,
            rolls: { hit: [], wound: [], save: [], fnp: [] },
          },
      ),
    ];

    // meleeBreakdown for weapon summary
    combined.meleeBreakdown = [
      ...atkWeaponGroups.map((g) => ({
        side: "Attacker",
        name: g.weaponName,
        models: g.models,
        i: g.i,
      })),
      ...defWeaponGroups.map((g) => ({
        side: "Defender",
        name: g.weaponName,
        models: g.models,
        i: g.i,
      })),
    ];

    // ━━ LEADERSHIP / ROUT CHECK ━━
    const cr = combined.combatResult;
    if (cr && cr.winner !== "Draw") {
      const loserIsAtk = cr.winner === "Defender";
      const loserLd = loserIsAtk ? aLd : dLd;
      const loserName = loserIsAtk
        ? aUnit?.name || "Attacker"
        : dUnit?.name || "Defender";
      const loserSide = loserIsAtk ? "Attacker" : "Defender";
      const winnerScore =
        cr.winner === "Attacker" ? cr.attackerScore : cr.defenderScore;
      const loserScore =
        cr.winner === "Attacker" ? cr.defenderScore : cr.attackerScore;
      const modifiedLd = Math.max(0, loserLd - cr.diff);
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const ldRoll = d1 + d2;
      const passed = ldRoll <= modifiedLd;
      combined.routCheck = {
        loser: loserSide,
        loserName,
        baseLd: loserLd,
        modifier: cr.diff,
        modifiedLd,
        roll: [d1, d2],
        total: ldRoll,
        passed,
        routed: !passed,
        winnerScore,
        loserScore,
      };
      combined.log.push({
        phase: "Rout Check",
        text: `🏳 ${loserSide} (${loserName}) lost combat resolution (${loserScore} vs ${winnerScore}) — Ld ${loserLd} - ${cr.diff} = ${modifiedLd}, rolled ${d1}+${d2}=${ldRoll} -> ${passed ? "PASSED — holds!" : "FAILED — ROUTED!"}`,
      });
    }

    setAssaultResult(combined);
    setAtkCombatChoice(null);
    setDefCombatChoice(null);
    // Track kills
    const atkName = aUnit?.name || "Attacker";
    const defName = dUnit?.name || "Defender";
    const kills = [];
    if (combined.defenderCasualties > 0)
      kills.push({
        phase: "Assault",
        attacker: atkName,
        target: defName,
        casualties: combined.defenderCasualties,
        detail: `${atkName} -> ${defName}: ${combined.defenderCasualties} killed`,
      });
    if (combined.attackerCasualties > 0)
      kills.push({
        phase: "Assault",
        attacker: defName,
        target: atkName,
        casualties: combined.attackerCasualties,
        detail: `${defName} -> ${atkName}: ${combined.attackerCasualties} killed`,
      });
    if (kills.length > 0) setRoundKills((prev) => [...prev, ...kills]);
    const hasMulti =
      aSecondaryMelee.length > 0 ||
      dSecondaryMelee.length > 0 ||
      atkSgtActive ||
      defSgtActive;
    addCombatLogEntry({
      type: "assault",
      attacker: atkName,
      target: defName,
      defKills: combined.defenderCasualties || 0,
      atkKills: combined.attackerCasualties || 0,
      remainAtk: combined.remainingAttackers || 0,
      remainDef: combined.remainingDefenders || 0,
      combatWinner: combined.combatResult?.winner || "Draw",
      combatDiff: combined.combatResult?.diff || 0,
      icon: "🗡",
      label: hasMulti ? "ASSAULT (MULTI)" : "ASSAULT",
    });
  };

  // Attacker
  const [numModels, setNumModels] = useState(10);
  const [numShots, setNumShots] = useState(1);
  const [bs, setBs] = useState(4);
  const [strength, setStrength] = useState(4);
  const [ap, setAp] = useState("5");
  const [weaponType, setWeaponType] = useState("Rapid Fire");
  const [halfRange, setHalfRange] = useState(false);
  const [moved, setMoved] = useState(false);
  const [indirect, setIndirect] = useState(false);
  const [snapShots, setSnapShots] = useState(false);

  // Barrage blast marker
  const [barrageBlastPos, setBarrageBlastPos] = useState(null); // { x, y } in board inches
  const [barrageBlastRadius, setBarrageBlastRadius] = useState(3); // 3" small, 5" medium, 7" large blast
  const [barrageScatterDir, setBarrageScatterDir] = useState(null); // "hit" | "n"|"ne"|"e"|"se"|"s"|"sw"|"w"|"nw"
  const [barrageScatterDist, setBarrageScatterDist] = useState(null); // 2D6 total
  const [barrageScatterDice, setBarrageScatterDice] = useState(null); // [d1, d2]

  // Defender
  const [toughness, setToughness] = useState(4);
  const [armourSave, setArmourSave] = useState("3");
  const [invulnSave, setInvulnSave] = useState("-");
  const [coverSave, setCoverSave] = useState("-");
  const [fnp, setFnp] = useState("-");
  const [leadership, setLeadership] = useState(8);
  const [targetModels, setTargetModels] = useState(10);

  // Special Rules
  const [activeRules, setActiveRules] = useState({});

  // Sergeant
  const [sgtEnabled, setSgtEnabled] = useState(false);
  const [sgtWeapon, setSgtWeapon] = useState(null);

  // Secondary Weapons (multi-weapon firing for Terminators, Vehicles, etc.)
  // Each entry: { weapon: weaponProfile, models: number }
  const [secondaryWeapons, setSecondaryWeapons] = useState([]);

  const addSecondaryWeapon = () => {
    if (!selectedUnit) return;
    const weapons = availableWeapons;
    if (weapons.length === 0) return;
    const alt =
      weapons.find((w) => w.name !== selectedWeapon?.name) || weapons[0];
    setSecondaryWeapons((prev) => [
      ...prev,
      { weapon: alt, models: alt.defaultModels || 1 },
    ]);
  };

  const updateSecondaryWeapon = (idx, field, val) => {
    setSecondaryWeapons((prev) =>
      prev.map((sw, i) => (i === idx ? { ...sw, [field]: val } : sw)),
    );
  };

  const removeSecondaryWeapon = (idx) => {
    setSecondaryWeapons((prev) => prev.filter((_, i) => i !== idx));
  };

  // Target Equipment (applied from map selection or manual toggle)
  const [targetHasVexilla, setTargetHasVexilla] = useState(false);
  const [targetHasNoxVox, setTargetHasNoxVox] = useState(false);

  // Target secondary weapons (for Return Fire with multiple weapons)
  const [targetSecondaryWeapons, setTargetSecondaryWeapons] = useState([]);

  const addTargetSecondaryWeapon = () => {
    if (targetAvailableWeapons.length === 0) return;
    const alt =
      targetAvailableWeapons.find(
        (w) => w.name !== targetSelectedWeapon?.name,
      ) || targetAvailableWeapons[0];
    setTargetSecondaryWeapons((prev) => [...prev, { weapon: alt, models: 1 }]);
  };

  const updateTargetSecondaryWeapon = (idx, field, val) => {
    setTargetSecondaryWeapons((prev) =>
      prev.map((sw, i) => (i === idx ? { ...sw, [field]: val } : sw)),
    );
  };

  const removeTargetSecondaryWeapon = (idx) => {
    setTargetSecondaryWeapons((prev) => prev.filter((_, i) => i !== idx));
  };

  // Presets — unit and weapon are now separate
  const [showAttackerPresets, setShowAttackerPresets] = useState(false);
  const [shootFaction, setShootFaction] = useState("legiones_astartes");
  const [targetFaction, setTargetFaction] = useState("legiones_astartes");
  const [showTargetPresets, setShowTargetPresets] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null); // { id, name, models, bs }
  const [selectedWeapon, setSelectedWeapon] = useState(null); // weapon profile object
  const [targetPresetName, setTargetPresetName] = useState(null);
  const [targetSelectedWeapon, setTargetSelectedWeapon] = useState(null);
  const [targetSgtEnabled, setTargetSgtEnabled] = useState(false);
  const [targetSgtWeapon, setTargetSgtWeapon] = useState(null);
  const [targetBS, setTargetBS] = useState(4);

  // Derived: available weapons for selected unit (base + all legion ranged for faction)
  const availableWeapons = useMemo(() => {
    const base = selectedUnit ? getRangedWeapons(selectedUnit.id) : [];
    const legion =
      shootFaction && shootFaction !== "legiones_astartes"
        ? LEGION_RANGED_WEAPONS[shootFaction] || []
        : [];
    return [...base, ...legion];
  }, [selectedUnit, shootFaction]);

  // Derived: available sergeant weapons
  const availableSgtWeapons = useMemo(() => {
    if (!selectedUnit || !selectedUnit.hasSgt) return [];
    const cat = getSgtCategory(selectedUnit.id);
    return cat ? SERGEANT_WEAPONS[cat] || [] : [];
  }, [selectedUnit]);

  // Derived: target unit's available ranged weapons (base + all legion ranged for faction)
  const targetAvailableWeapons = useMemo(() => {
    let base = [];
    if (targetPresetName) {
      for (const cat of UNIT_PRESETS) {
        const found = cat.units.find((u) => u.name === targetPresetName);
        if (found && found.id) {
          base = getRangedWeapons(found.id);
          break;
        }
      }
    }
    const legion =
      targetFaction && targetFaction !== "legiones_astartes"
        ? LEGION_RANGED_WEAPONS[targetFaction] || []
        : [];
    return [...base, ...legion];
  }, [targetPresetName, targetFaction]);

  // Derived: target unit object (for hasSgt, id, bs)
  const targetUnit = useMemo(() => {
    if (!targetPresetName) return null;
    for (const cat of UNIT_PRESETS) {
      const found = cat.units.find((u) => u.name === targetPresetName);
      if (found) return found;
    }
    return null;
  }, [targetPresetName]);

  // Derived: target sergeant weapons
  const targetAvailableSgtWeapons = useMemo(() => {
    if (!targetUnit || !targetUnit.hasSgt) return [];
    const cat = getSgtCategory(targetUnit.id);
    return cat ? SERGEANT_WEAPONS[cat] || [] : [];
  }, [targetUnit]);

  const applyUnitPreset = useCallback((unit) => {
    setSelectedUnit(unit);
    setNumModels(unit.models);
    setBs(unit.bs);
    setShowAttackerPresets(false);
    setSecondaryWeapons([]); // Clear secondary weapons on unit change
    // Reset sergeant
    if (unit.hasSgt) {
      setSgtEnabled(false);
      const cat = getSgtCategory(unit.id);
      const sgtWeapons = cat ? SERGEANT_WEAPONS[cat] || [] : [];
      setSgtWeapon(sgtWeapons.length > 0 ? sgtWeapons[0] : null);
    } else {
      setSgtEnabled(false);
      setSgtWeapon(null);
    }
    // Auto-select first weapon if unit changes
    const weapons = getRangedWeapons(unit.id);
    if (weapons.length > 0) {
      const w = weapons[0];
      setSelectedWeapon(w);
      setNumShots(w.shots);
      setStrength(w.s);
      setAp(w.ap);
      setWeaponType(w.type);
      setActiveRules(w.rules || {});
      if (w.defaultModels) setNumModels(w.defaultModels);
    } else {
      setSelectedWeapon(null);
    }
  }, []);

  const applyWeaponPreset = useCallback(
    (weapon) => {
      setSelectedWeapon(weapon);
      setNumShots(weapon.shots);
      setStrength(weapon.s);
      setAp(weapon.ap);
      setWeaponType(weapon.type);
      setActiveRules(weapon.rules || {});
      // Reset models to unit default, unless weapon overrides
      if (weapon.defaultModels) {
        setNumModels(weapon.defaultModels);
      } else if (selectedUnit) {
        setNumModels(selectedUnit.models);
      }
    },
    [selectedUnit],
  );

  const applyTargetPreset = useCallback((preset) => {
    setToughness(preset.t);
    setArmourSave(preset.sv);
    setInvulnSave(preset.inv);
    setCoverSave(preset.cover || "-");
    setFnp(preset.fnp);
    setLeadership(preset.ld || 8);
    setTargetModels(preset.models || preset.unitSize || 10);
    setTargetPresetName(preset.name);
    setTargetPresetId(preset.id || null);
    setTargetBS(preset.bs || 4);
    setShowTargetPresets(false);
    setTargetSecondaryWeapons([]); // Clear secondary weapons on unit change
    const weapons = getRangedWeapons(preset.id);
    if (weapons.length > 0) {
      setTargetSelectedWeapon(weapons[0]);
      setReturnFireShots(weapons[0].shots);
      setReturnFireS(weapons[0].s);
      setReturnFireAP(weapons[0].ap);
      setSelectedReturnWeapon(weapons[0]);
    } else {
      setTargetSelectedWeapon(null);
      setSelectedReturnWeapon(null);
    }
    // Sergeant setup
    if (preset.hasSgt) {
      setTargetSgtEnabled(false);
      const cat = getSgtCategory(preset.id);
      const sgtWeapons = cat ? SERGEANT_WEAPONS[cat] || [] : [];
      setTargetSgtWeapon(sgtWeapons.length > 0 ? sgtWeapons[0] : null);
    } else {
      setTargetSgtEnabled(false);
      setTargetSgtWeapon(null);
    }
  }, []);

  // Results
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Charge Phase
  const [showCharge, setShowCharge] = useState(false);
  const [chargeDistance, setChargeDistance] = useState(8);
  const [chargeTerrain, setChargeTerrain] = useState(false);
  const [chargeDisordered, setChargeDisordered] = useState(false);
  const [doOverwatch, setDoOverwatch] = useState(false);
  const [overwatchShots, setOverwatchShots] = useState(1);
  const [overwatchS, setOverwatchS] = useState(4);
  const [overwatchAP, setOverwatchAP] = useState("5");
  const [overwatchFullBS, setOverwatchFullBS] = useState(true); // true = normal BS, false = snap shots 6+
  const [overwatchBS, setOverwatchBS] = useState(4);
  const [selectedOverwatchWeapon, setSelectedOverwatchWeapon] = useState(null);
  // Volley Fire (charger fires Assault weapons at snap shot before charging)
  const [doVolleyFire, setDoVolleyFire] = useState(false);
  const [volleyFireShots, setVolleyFireShots] = useState(1);
  const [volleyFireS, setVolleyFireS] = useState(4);
  const [volleyFireAP, setVolleyFireAP] = useState("5");
  const [selectedVolleyWeapon, setSelectedVolleyWeapon] = useState(null);
  // Defender Volley Fire (defender fires Assault weapons at snap shot)
  const [doDefVolleyFire, setDoDefVolleyFire] = useState(false);
  const [defVolleyFireShots, setDefVolleyFireShots] = useState(1);
  const [defVolleyFireS, setDefVolleyFireS] = useState(4);
  const [defVolleyFireAP, setDefVolleyFireAP] = useState("5");
  const [selectedDefVolleyWeapon, setSelectedDefVolleyWeapon] = useState(null);
  // Return Fire (defender reaction — fires ranged weapons at snap shot)
  const [doReturnFire, setDoReturnFire] = useState(false);
  const [returnFireShots, setReturnFireShots] = useState(1);
  const [returnFireS, setReturnFireS] = useState(4);
  const [returnFireAP, setReturnFireAP] = useState("5");
  const [selectedReturnWeapon, setSelectedReturnWeapon] = useState(null);
  // Charger melee stats
  const [chargerWS, setChargerWS] = useState(4);
  const [chargerS_melee, setChargerS_melee] = useState(4);
  const [chargerAP_melee, setChargerAP_melee] = useState("-");
  const [chargerI, setChargerI] = useState(4);
  const [chargerA, setChargerA] = useState(1);
  const [chargerW_melee, setChargerW_melee] = useState(1);
  // Charger saves (for overwatch)
  const [chargerSv, setChargerSv] = useState("3");
  const [chargerInvSv, setChargerInvSv] = useState("-");
  const [chargerFnpSv, setChargerFnpSv] = useState("-");
  const [chargerT_melee, setChargerT_melee] = useState(4);
  // Defender melee stats
  const [defenderWS, setDefenderWS] = useState(4);
  const [defenderS_melee, setDefenderS_melee] = useState(4);
  const [defenderAP_melee, setDefenderAP_melee] = useState("-");
  const [defenderI, setDefenderI] = useState(4);
  const [defenderA, setDefenderA] = useState(1);
  const [defenderW_melee, setDefenderW_melee] = useState(1);
  // Melee special rules
  const [chargerMeleeRules, setChargerMeleeRules] = useState({});
  const [defenderMeleeRules, setDefenderMeleeRules] = useState({});
  // Selected melee weapons
  const [selectedChargerMelee, setSelectedChargerMelee] = useState(null);
  const [selectedDefenderMelee, setSelectedDefenderMelee] = useState(null);
  // Charge result
  const [chargeResult, setChargeResult] = useState(null);
  const [chargeAnimating, setChargeAnimating] = useState(false);
  const [chargeAnimProgress, setChargeAnimProgress] = useState(0); // 0→1

  // Available melee weapons based on selected units
  const chargerMeleeWeapons = useMemo(() => {
    if (!aUnit) return [];
    return MELEE_getRangedWeapons(aUnit.id);
  }, [aUnit]);

  // Assault weapons available for Volley Fire (charger fires before charging) — uses assault attacker unit
  // Charger's ranged weapons for Volley Fire — all ranged weapons from aRangedWeapons
  const chargerAssaultWeapons = aRangedWeapons;

  const applyVolleyWeapon = useCallback((weapon) => {
    setSelectedVolleyWeapon(weapon);
    setVolleyFireShots(weapon.shots);
    setVolleyFireS(weapon.s);
    setVolleyFireAP(weapon.ap);
  }, []);

  // Defender's ranged weapons for Defender Volley Fire — all ranged weapons from dRangedWeapons
  const defenderAssaultWeapons = dRangedWeapons;

  const applyDefVolleyWeapon = useCallback((weapon) => {
    setSelectedDefVolleyWeapon(weapon);
    setDefVolleyFireShots(weapon.shots);
    setDefVolleyFireS(weapon.s);
    setDefVolleyFireAP(weapon.ap);
  }, []);

  // Defender's ALL ranged weapons for Overwatch (full BS) — from dRangedWeapons
  const defenderAllRangedWeapons = dRangedWeapons;

  const applyOverwatchWeapon = useCallback((weapon) => {
    setSelectedOverwatchWeapon(weapon);
    setOverwatchShots(weapon.shots);
    setOverwatchS(weapon.s);
    setOverwatchAP(weapon.ap);
  }, []);

  // Defender's ranged weapons for Return Fire reaction
  const defenderRangedWeapons = useMemo(() => {
    if (!targetPresetName) return [];
    for (const cat of UNIT_PRESETS) {
      const found = cat.units.find((u) => u.name === targetPresetName);
      if (found && found.id) return getRangedWeapons(found.id);
    }
    return [];
  }, [targetPresetName]);

  const applyReturnWeapon = useCallback((weapon) => {
    setSelectedReturnWeapon(weapon);
    setTargetSelectedWeapon(weapon);
    setReturnFireShots(weapon.shots);
    setReturnFireS(weapon.s);
    setReturnFireAP(weapon.ap);
  }, []);

  const defenderMeleeWeapons = useMemo(() => {
    if (!dUnit) return [];
    return MELEE_getRangedWeapons(dUnit.id);
  }, [dUnit]);

  const applyChargerMelee = useCallback((weapon) => {
    setSelectedChargerMelee(weapon);
    setChargerWS(weapon.ws);
    setChargerS_melee(weapon.s);
    setChargerAP_melee(weapon.ap);
    setChargerI(weapon.i);
    setChargerA(weapon.a);
    setChargerW_melee(weapon.w);
    setChargerT_melee(weapon.t);
    setChargerSv(weapon.sv);
    setChargerInvSv(weapon.inv);
    setChargerFnpSv(weapon.fnp || "-");
    setChargerMeleeRules(weapon.rules || {});
  }, []);

  const applyDefenderMelee = useCallback((weapon) => {
    setSelectedDefenderMelee(weapon);
    setDefenderWS(weapon.ws);
    setDefenderS_melee(weapon.s);
    setDefenderAP_melee(weapon.ap);
    setDefenderI(weapon.i);
    setDefenderA(weapon.a);
    setDefenderW_melee(weapon.w);
    setDefenderMeleeRules(weapon.rules || {});
  }, []);

  const toggleRule = useCallback((id) => {
    setActiveRules((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const saveOptions = [
    { value: "-", label: "None" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
    { value: "5", label: "5+" },
    { value: "6", label: "6+" },
  ];

  const apOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "-", label: "—" },
  ];

  const params = useMemo(
    () => ({
      numModels,
      numShots,
      bs,
      strength,
      ap,
      toughness,
      armourSave,
      invulnSave,
      coverSave,
      fnp,
      specialRules: activeRules,
      halfRange,
      moved,
      indirect,
      weaponType,
      leadership,
      targetModels,
      sgtEnabled,
      sgtWeapon,
      hasVexilla: targetHasVexilla,
      hasNoxVox: targetHasNoxVox,
      snapShots,
    }),
    [
      numModels,
      numShots,
      bs,
      strength,
      ap,
      toughness,
      armourSave,
      invulnSave,
      coverSave,
      fnp,
      activeRules,
      halfRange,
      moved,
      indirect,
      weaponType,
      leadership,
      targetModels,
      sgtEnabled,
      sgtWeapon,
      targetHasVexilla,
      targetHasNoxVox,
      snapShots,
    ],
  );

  const expected = useMemo(() => calculateExpected(params), [params]);

  const handleResolve = () => {
    setShowFiringVideo(true);
    // ━━ PRIMARY WEAPON ━━
    // Secondary weapons replace primary for those models
    const secModelCount = secondaryWeapons.reduce(
      (s, sw) => s + (sw.models || 0),
      0,
    );
    const primaryModels = Math.max(0, numModels - secModelCount);
    const primaryParams = { ...params, numModels: primaryModels };
    const primaryRes = resolveShootingPhase(primaryParams);

    // ━━ SECONDARY WEAPONS ━━
    const secondaryResults = secondaryWeapons.map((sw) => {
      const secParams = {
        numModels: sw.models,
        numShots: sw.weapon.shots,
        bs,
        strength: sw.weapon.s,
        ap: sw.weapon.ap,
        toughness,
        armourSave: invulnSave !== "-" ? armourSave : armourSave,
        invulnSave,
        coverSave,
        fnp,
        specialRules: sw.weapon.rules || {},
        halfRange,
        moved,
        indirect,
        weaponType: sw.weapon.type,
        leadership,
        targetModels,
        sgtEnabled: false,
        sgtWeapon: null,
        hasVexilla: targetHasVexilla,
        hasNoxVox: targetHasNoxVox,
        snapShots,
      };
      return {
        name: sw.weapon.name,
        models: sw.models,
        result: resolveShootingPhase(secParams),
      };
    });

    // ━━ COMBINE RESULTS ━━
    let combined;
    if (secondaryResults.length === 0) {
      combined = primaryRes;
      // Build rollsByWeapon for single weapon (with sergeant split)
      const squadRolls = {
        hit: (primaryRes.rolls?.hit || []).filter((r) => !r.sergeant),
        wound: (primaryRes.rolls?.wound || []).filter((r) => !r.sergeant),
        save: (primaryRes.rolls?.save || []).filter((r) => !r.sergeant),
        fnpRolls: (primaryRes.rolls?.fnpRolls || []).filter((r) => !r.sergeant),
      };
      const sgtRolls = {
        hit: (primaryRes.rolls?.hit || []).filter((r) => r.sergeant),
        wound: (primaryRes.rolls?.wound || []).filter((r) => r.sergeant),
        save: (primaryRes.rolls?.save || []).filter((r) => r.sergeant),
        fnpRolls: (primaryRes.rolls?.fnpRolls || []).filter((r) => r.sergeant),
      };
      combined.rollsByWeapon = [
        {
          name: selectedWeapon?.name || "Primary",
          models: primaryModels,
          rolls: squadRolls,
        },
      ];
      if (sgtRolls.hit.length > 0 || sgtRolls.wound.length > 0) {
        combined.rollsByWeapon.push({
          name: `★ Sgt: ${sgtWeapon?.name || "Sergeant"}`,
          models: 1,
          rolls: sgtRolls,
        });
      }
    } else {
      // Merge all results into one combined object
      combined = { ...primaryRes };
      combined.log = [...primaryRes.log];
      combined.rolls = {
        hit: [...(primaryRes.rolls?.hit || [])],
        wound: [...(primaryRes.rolls?.wound || [])],
        save: [...(primaryRes.rolls?.save || [])],
        fnpRolls: [...(primaryRes.rolls?.fnpRolls || [])],
      };
      // Build rollsByWeapon for multi-weapon
      const primarySquadRolls = {
        hit: (primaryRes.rolls?.hit || []).filter((r) => !r.sergeant),
        wound: (primaryRes.rolls?.wound || []).filter((r) => !r.sergeant),
        save: (primaryRes.rolls?.save || []).filter((r) => !r.sergeant),
        fnpRolls: (primaryRes.rolls?.fnpRolls || []).filter((r) => !r.sergeant),
      };
      const primarySgtRolls = {
        hit: (primaryRes.rolls?.hit || []).filter((r) => r.sergeant),
        wound: (primaryRes.rolls?.wound || []).filter((r) => r.sergeant),
        save: (primaryRes.rolls?.save || []).filter((r) => r.sergeant),
        fnpRolls: (primaryRes.rolls?.fnpRolls || []).filter((r) => r.sergeant),
      };
      combined.rollsByWeapon = [
        {
          name: selectedWeapon?.name || "Primary",
          models: primaryModels,
          rolls: primarySquadRolls,
        },
      ];
      if (primarySgtRolls.hit.length > 0 || primarySgtRolls.wound.length > 0) {
        combined.rollsByWeapon.push({
          name: `★ Sgt: ${sgtWeapon?.name || "Sergeant"}`,
          models: 1,
          rolls: primarySgtRolls,
        });
      }
      combined.weaponBreakdown = [
        {
          name: selectedWeapon?.name || "Primary",
          models: primaryModels,
          shots: primaryRes.totalShots,
          hits: primaryRes.hits,
          wounds: primaryRes.wounds,
          casualties: primaryRes.casualties,
        },
      ];
      for (const sec of secondaryResults) {
        const sr = sec.result;
        combined.log.push({
          phase: "Secondary",
          text: `━━━ ${sec.name} (${sec.models} model${sec.models !== 1 ? "s" : ""}) ━━━`,
        });
        combined.log = combined.log.concat(sr.log);
        combined.rolls.hit = combined.rolls.hit.concat(sr.rolls?.hit || []);
        combined.rolls.wound = combined.rolls.wound.concat(
          sr.rolls?.wound || [],
        );
        combined.rolls.save = combined.rolls.save.concat(sr.rolls?.save || []);
        combined.rolls.fnpRolls = combined.rolls.fnpRolls.concat(
          sr.rolls?.fnpRolls || [],
        );
        combined.totalShots += sr.totalShots;
        combined.hits += sr.hits;
        combined.wounds += sr.wounds;
        combined.unsaved += sr.unsaved;
        combined.casualties += sr.casualties;
        combined.getsHotWounds =
          (combined.getsHotWounds || 0) + (sr.getsHotWounds || 0);
        combined.deflagrateHits =
          (combined.deflagrateHits || 0) + (sr.deflagrateHits || 0);
        combined.weaponBreakdown.push({
          name: sec.name,
          models: sec.models,
          shots: sr.totalShots,
          hits: sr.hits,
          wounds: sr.wounds,
          casualties: sr.casualties,
        });
        // Add secondary weapon rolls to rollsByWeapon
        combined.rollsByWeapon.push({
          name: sec.name,
          models: sec.models,
          rolls: {
            hit: sr.rolls?.hit || [],
            wound: sr.rolls?.wound || [],
            save: sr.rolls?.save || [],
            fnpRolls: sr.rolls?.fnpRolls || [],
          },
        });
      }
    }

    setResult(combined);
    setHistory((prev) =>
      [{ ...combined, timestamp: Date.now() }, ...prev].slice(0, 20),
    );
    setChargeResult(null);
    setReturnFireResult(null);
    // Track kills
    const atkName = selectedUnit?.name || "Shooting Unit";
    const tgtName = targetPresetName || "Target Unit";
    if (combined.casualties > 0) {
      setRoundKills((prev) => [
        ...prev,
        {
          phase: "Shooting",
          attacker: atkName,
          target: tgtName,
          casualties: combined.casualties,
          detail: `${atkName} → ${tgtName}: ${combined.casualties} killed`,
        },
      ]);
    }
    // Log to Results Tracker
    addCombatLogEntry({
      type: "shooting",
      attacker: atkName,
      target: tgtName,
      shots: combined.totalShots,
      hits: combined.hits,
      wounds: combined.wounds,
      casualties: combined.casualties,
      getsHot: combined.getsHotWounds || 0,
      statusEffects: combined.statusEffects || [],
      icon: "🔫",
      label: secondaryResults.length > 0 ? "SHOOTING (MULTI)" : "SHOOTING",
    });
  };

  // Return Fire state
  const [returnFireResult, setReturnFireResult] = useState(null);

  const handleReturnFire = () => {
    // Use attacker's defensive stats from the selected unit
    const attackerUnit = selectedUnit || {};
    const atkDefStats = {
      attackerT: attackerUnit.t || toughness || 4,
      attackerSv: attackerUnit.sv || "3",
      attackerInv: attackerUnit.inv || "-",
      attackerFnp: attackerUnit.fnp || "-",
      attackerW: attackerUnit.w || 1,
    };

    // Calculate primary models (subtract sgt and secondary models)
    const secModelCount = targetSecondaryWeapons.reduce(
      (s, sw) => s + (sw.models || 0),
      0,
    );
    const primaryModels = Math.max(
      0,
      targetModels - (targetSgtEnabled ? 1 : 0) - secModelCount,
    );

    // Primary weapon resolve
    const primaryRes = resolveReturnFire({
      defenderModels: primaryModels + (targetSgtEnabled ? 1 : 0), // sgt handled inside
      returnFireShots,
      returnFireS,
      returnFireAP,
      ...atkDefStats,
      bs: targetBS,
      sgtEnabled: targetSgtEnabled,
      sgtWeapon: targetSgtWeapon,
    });

    // Secondary weapons resolve
    const secondaryResults = targetSecondaryWeapons.map((sw) => {
      const secRes = resolveReturnFire({
        defenderModels: sw.models,
        returnFireShots: sw.weapon.shots,
        returnFireS: sw.weapon.s,
        returnFireAP: sw.weapon.ap,
        ...atkDefStats,
        bs: targetBS,
        sgtEnabled: false,
        sgtWeapon: null,
      });
      return { name: sw.weapon.name, models: sw.models, result: secRes };
    });

    // Combine results
    let combined;
    if (secondaryResults.length === 0) {
      combined = primaryRes;
    } else {
      combined = { ...primaryRes };
      combined.log = [...primaryRes.log];
      combined.rolls = {
        hit: [...(primaryRes.rolls?.hit || [])],
        wound: [...(primaryRes.rolls?.wound || [])],
        save: [...(primaryRes.rolls?.save || [])],
        fnp: [...(primaryRes.rolls?.fnp || [])],
      };
      combined.rollsByWeapon = [...(primaryRes.rollsByWeapon || [])];

      for (const sec of secondaryResults) {
        const sr = sec.result;
        combined.log.push({
          phase: "Secondary",
          text: `━━━ ${sec.name} (${sec.models} model${sec.models !== 1 ? "s" : ""}) ━━━`,
        });
        combined.log = combined.log.concat(sr.log);
        combined.rolls.hit = combined.rolls.hit.concat(sr.rolls?.hit || []);
        combined.rolls.wound = combined.rolls.wound.concat(
          sr.rolls?.wound || [],
        );
        combined.rolls.save = combined.rolls.save.concat(sr.rolls?.save || []);
        combined.rolls.fnp = (combined.rolls.fnp || []).concat(
          sr.rolls?.fnp || [],
        );
        combined.casualties += sr.casualties;
        // Add secondary weapon rolls to rollsByWeapon
        if (sr.rollsByWeapon) {
          for (const wg of sr.rollsByWeapon) {
            combined.rollsByWeapon.push({
              name: `${sec.name}`,
              models: wg.models,
              rolls: wg.rolls,
            });
          }
        }
      }
    }

    setReturnFireResult(combined);
    // Log to Results Tracker
    const tgtName = targetPresetName || "Target Unit";
    const atkName = selectedUnit?.name || "Shooting Unit";
    addCombatLogEntry({
      type: "returnFire",
      attacker: tgtName,
      target: atkName,
      shots: combined.totalShots || returnFireShots * targetModels,
      hits: combined.hits || 0,
      wounds: combined.wounds || 0,
      casualties: combined.casualties || 0,
      icon: "↩",
      label:
        secondaryResults.length > 0 ? "RETURN FIRE (MULTI)" : "RETURN FIRE",
    });
  };

  const handleChargeResolve = () => {
    // Get sergeant ranged weapons (Assault trait only for volley, any for overwatch)
    const aSgtCat = aUnit ? getSgtCategory(aUnit.id) : null;
    const aSgtRangedWeapons = aSgtCat ? SERGEANT_WEAPONS[aSgtCat] || [] : [];
    const aSgtAssaultRanged =
      aSgtVolleyWeapon ||
      aSgtRangedWeapons.find(
        (w) =>
          (w.traits || "").toLowerCase().includes("assault") ||
          (w.type || "").toLowerCase() === "pistol",
      ) ||
      null;
    const dSgtCat = dUnit ? getSgtCategory(dUnit.id) : null;
    const dSgtRangedWeapons = dSgtCat ? SERGEANT_WEAPONS[dSgtCat] || [] : [];
    const dSgtAssaultRanged =
      dSgtVolleyWeapon ||
      dSgtRangedWeapons.find(
        (w) =>
          (w.traits || "").toLowerCase().includes("assault") ||
          (w.type || "").toLowerCase() === "pistol",
      ) ||
      null;
    const dSgtAnyRanged = dSgtOverwatchWeapon || dSgtRangedWeapons[0] || null;

    const chargeParams = {
      chargeDistance,
      chargingModels: aModels,
      terrain: chargeTerrain,
      disordered: chargeDisordered,
      // Charger volley fire
      doVolleyFire,
      aSelectedRanged,
      volleyFireShots,
      volleyFireS,
      volleyFireAP,
      aVolleyModels,
      aSecondaryRanged,
      aAssaultSgtEnabled: !!aSgtVolleyWeapon && aUnit?.hasSgt,
      aAssaultSgtRanged: aSgtAssaultRanged,
      // Defender stats (target of charger volley fire)
      defenderT: dT,
      defenderSv: dSv,
      defenderInv: dInv,
      defenderFnp: dFnp,
      defenderW: parseInt(dW) || 1,
      defenderModels: dModels,
      dModels,
      // Defender volley fire
      doDefVolleyFire,
      dSelectedRanged,
      defVolleyFireShots,
      defVolleyFireS,
      defVolleyFireAP,
      dVolleyModels,
      dSecondaryRanged_volley: dSecondaryRanged,
      dAssaultSgtEnabled_volley: !!dSgtVolleyWeapon && dUnit?.hasSgt,
      dAssaultSgtRanged: dSgtAssaultRanged,
      // Charger stats (target of defender fire)
      chargerT: aT,
      chargerSv: aSv,
      chargerInv: aInv,
      chargerFnp: aFnp,
      chargerW: parseInt(aW) || 1,
      chargerI: parseInt(aI) || 4,
      chargerMov: parseInt(aMove) || 6,
      // Defender overwatch (any ranged weapon, normal BS)
      doOverwatch,
      overwatchBS,
      dOverwatchWeapon,
      dOverwatchSecondary,
      dOverwatchModels,
      dAssaultSgtEnabled_ow: !!dSgtOverwatchWeapon && dUnit?.hasSgt,
      dSgtRanged_ow: dSgtAnyRanged,
    };
    const res = resolveChargePhase(chargeParams);
    setChargeResult(res);
    if (res.chargeSucceeded) {
      setAssaultCharging(true);
      if (chargeDisordered) setAssaultDisordered(true);
    }
    // Track kills
    const chgAtkName = aUnit?.name || "Charging Unit";
    const chgDefName = dUnit?.name || "Target Unit";
    const chargeKills = [];
    if (res.overwatchCasualties > 0)
      chargeKills.push({
        phase: "Charge",
        attacker: chgDefName,
        target: chgAtkName,
        casualties: res.overwatchCasualties,
        detail: `Overwatch: ${chgDefName} → ${chgAtkName}: ${res.overwatchCasualties} killed`,
      });
    if (res.volleyCasualties > 0)
      chargeKills.push({
        phase: "Charge",
        attacker: chgAtkName,
        target: chgDefName,
        casualties: res.volleyCasualties,
        detail: `Volley Fire: ${chgAtkName} → ${chgDefName}: ${res.volleyCasualties} killed`,
      });
    if (res.defVolleyCasualties > 0)
      chargeKills.push({
        phase: "Charge",
        attacker: chgDefName,
        target: chgAtkName,
        casualties: res.defVolleyCasualties,
        detail: `Def Volley: ${chgDefName} → ${chgAtkName}: ${res.defVolleyCasualties} killed`,
      });
    if (chargeKills.length > 0)
      setRoundKills((prev) => [...prev, ...chargeKills]);
    addCombatLogEntry({
      type: "charge",
      attacker: chgAtkName,
      target: chgDefName,
      chargeSucceeded: res.chargeSucceeded,
      chargeRoll: res.chargeRoll,
      chargeNeeded: chargeDistance,
      volleyCasualties: res.volleyCasualties || 0,
      defVolleyCasualties: res.defVolleyCasualties || 0,
      overwatchCasualties: res.overwatchCasualties || 0,
      icon: "⚔",
      label: "CHARGE",
    });
    applyChargeMovement(res);
  };

  // ━━ RESULTS TRACKER RENDERER ━━
  const TRACKER_TYPE_COLORS = {
    shooting: {
      bg: "rgba(184,134,11,0.08)",
      border: "#b8860b",
      text: "#8b6508",
      icon: "🔫",
    },
    returnFire: {
      bg: "rgba(139,69,19,0.08)",
      border: "#8b4513",
      text: "#8b4513",
      icon: "↩",
    },
    charge: {
      bg: "rgba(196,106,27,0.08)",
      border: "#c46a1b",
      text: "#c46a1b",
      icon: "⚔",
    },
    assault: {
      bg: "rgba(155,45,45,0.08)",
      border: "#9b2d2d",
      text: "#9b2d2d",
      icon: "🗡",
    },
  };

  const renderResultsTracker = (filterTypes) => {
    const roundEntries = combatLog.filter(
      (e) =>
        e.round === trackerRound &&
        (!filterTypes || filterTypes.includes(e.type)),
    );
    const allRoundEntries = combatLog.filter((e) => e.round === trackerRound);
    const totalKillsThisRound = allRoundEntries.reduce((s, e) => {
      if (e.type === "shooting" || e.type === "returnFire")
        return s + (e.casualties || 0);
      if (e.type === "charge")
        return (
          s +
          (e.volleyCasualties || 0) +
          (e.overwatchCasualties || 0) +
          (e.meleeDefKills || 0) +
          (e.meleeAtkKills || 0)
        );
      if (e.type === "assault")
        return s + (e.defKills || 0) + (e.atkKills || 0);
      return s;
    }, 0);

    return React.createElement(
      "div",
      { style: { ...panelStyle, marginBottom: 16 } },
      React.createElement(
        "div",
        { style: { ...panelHeaderStyle, justifyContent: "space-between" } },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          React.createElement(
            "span",
            { style: { color: "#5b4a8a", fontSize: 16 } },
            "📋",
          ),
          React.createElement(
            "span",
            { style: { color: "#5b4a8a" } },
            "RESULTS TRACKER",
          ),
        ),
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 4 } },
          combatLog.length > 0 &&
            React.createElement(
              "button",
              {
                onClick: clearAllCombatLog,
                title: "Clear all rounds",
                style: {
                  padding: "2px 8px",
                  borderRadius: 3,
                  cursor: "pointer",
                  fontSize: 8,
                  fontFamily: "'Share Tech Mono', serif",
                  background: "rgba(199,64,64,0.08)",
                  border: "1px solid rgba(199,64,64,0.2)",
                  color: "#c74040",
                },
              },
              "CLEAR ALL",
            ),
        ),
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 0,
            marginBottom: 12,
            borderRadius: 6,
            overflow: "hidden",
            border: "1.5px solid #d0c4aa",
          },
        },
        [1, 2, 3, 4].map((r) => {
          const active = trackerRound === r;
          const roundCount = combatLog.filter((e) => e.round === r).length;
          return React.createElement(
            "button",
            {
              key: r,
              onClick: () => setTrackerRound(r),
              style: {
                flex: 1,
                padding: "8px 0",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "'Share Tech Mono', serif",
                fontWeight: active ? 700 : 400,
                letterSpacing: 1,
                border: "none",
                borderRight: r < 4 ? "1px solid #d0c4aa" : "none",
                background: active ? "rgba(91,74,138,0.12)" : "#f9f6f0",
                color: active ? "#5b4a8a" : "#8a7e6e",
                transition: "all 0.12s ease",
              },
            },
            React.createElement("div", null, "ROUND", r),
            roundCount > 0 &&
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: 8,
                    marginTop: 2,
                    color: active ? "#5b4a8a" : "#a09888",
                  },
                },
                roundCount,
                "action",
                roundCount !== 1 ? "s" : "",
              ),
          );
        }),
      ),
      allRoundEntries.length > 0 &&
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              gap: 8,
              marginBottom: 10,
              padding: "6px 10px",
              borderRadius: 4,
              background: "rgba(91,74,138,0.04)",
              border: "1px solid rgba(91,74,138,0.1)",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            },
          },
          React.createElement(
            "div",
            { style: { display: "flex", gap: 10, flexWrap: "wrap" } },
            React.createElement(
              "div",
              { style: { textAlign: "center" } },
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: 8,
                    fontFamily: "'Share Tech Mono', serif",
                    color: "#8a7e6e",
                    letterSpacing: 0.5,
                  },
                },
                "ACTIONS",
              ),
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: 15,
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 700,
                    color: "#5b4a8a",
                  },
                },
                allRoundEntries.length,
              ),
            ),
            React.createElement(
              "div",
              { style: { textAlign: "center" } },
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: 8,
                    fontFamily: "'Share Tech Mono', serif",
                    color: "#8a7e6e",
                    letterSpacing: 0.5,
                  },
                },
                "TOTAL KILLS",
              ),
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: 15,
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 700,
                    color: totalKillsThisRound > 0 ? "#c74040" : "#8a7e6e",
                  },
                },
                totalKillsThisRound,
              ),
            ),
            ["shooting", "returnFire", "charge", "assault"].map((t) => {
              const count = allRoundEntries.filter((e) => e.type === t).length;
              if (count === 0) return null;
              const tc = TRACKER_TYPE_COLORS[t];
              return React.createElement(
                "div",
                { key: t, style: { textAlign: "center" } },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 8,
                      fontFamily: "'Share Tech Mono', serif",
                      color: tc.text,
                      letterSpacing: 0.5,
                    },
                  },
                  tc.icon,
                  t === "returnFire" ? "RET. FIRE" : t.toUpperCase(),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 15,
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      color: tc.text,
                    },
                  },
                  count,
                ),
              );
            }),
          ),
          React.createElement(
            "button",
            {
              onClick: () => clearCombatLogRound(trackerRound),
              title: `Clear Round ${trackerRound}`,
              style: {
                padding: "3px 8px",
                borderRadius: 3,
                cursor: "pointer",
                fontSize: 8,
                fontFamily: "'Share Tech Mono', serif",
                background: "rgba(199,64,64,0.06)",
                border: "1px solid rgba(199,64,64,0.15)",
                color: "#c74040",
              },
            },
            "CLEAR R",
            trackerRound,
          ),
        ),
      roundEntries.length === 0
        ? React.createElement(
            "div",
            {
              style: {
                textAlign: "center",
                padding: "16px 0",
                fontSize: 13,
                color: "#a09888",
                fontFamily: "'Share Tech Mono', serif",
                fontStyle: "italic",
              },
            },
            "No results logged for Round",
            trackerRound,
            ".",
            filterTypes ? " Resolve actions to populate." : "",
          )
        : React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            roundEntries.map((e, i) => {
              const tc =
                TRACKER_TYPE_COLORS[e.type] || TRACKER_TYPE_COLORS.shooting;
              return React.createElement(
                "div",
                {
                  key: e.timestamp + i,
                  style: {
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: tc.bg,
                    border: `1.5px solid ${tc.border}`,
                    animation: "fadeIn 0.2s ease-out",
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    },
                  },
                  React.createElement(
                    "span",
                    { style: { fontSize: 14 } },
                    tc.icon,
                  ),
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 12,
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        color: tc.text,
                        letterSpacing: 1.5,
                      },
                    },
                    e.label,
                  ),
                  React.createElement("span", { style: { flex: 1 } }),
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#8a7e6e",
                      },
                    },
                    new Date(e.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#2a2418",
                      marginBottom: 4,
                    },
                  },
                  React.createElement(
                    "strong",
                    { style: { color: tc.text } },
                    e.attacker,
                  ),
                  React.createElement(
                    "span",
                    { style: { color: "#8a7e6e" } },
                    "→",
                  ),
                  React.createElement("strong", null, e.target),
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
                  (e.type === "shooting" || e.type === "returnFire") &&
                    React.createElement(
                      React.Fragment,
                      null,
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 3,
                            background: "rgba(0,0,0,0.04)",
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#6a5e4e",
                          },
                        },
                        e.shots,
                        "shots →",
                        e.hits,
                        "hits →",
                        e.wounds,
                        "wounds",
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 12,
                            padding: "2px 7px",
                            borderRadius: 3,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            background:
                              e.casualties > 0
                                ? "rgba(199,48,48,0.1)"
                                : "rgba(46,125,50,0.1)",
                            color: e.casualties > 0 ? "#c74040" : "#2e7d32",
                          },
                        },
                        e.casualties > 0 ? `${e.casualties} ☠` : "0 ☠",
                      ),
                      e.getsHot > 0 &&
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              padding: "2px 6px",
                              borderRadius: 3,
                              background: "rgba(255,140,0,0.1)",
                              color: "#c46a1b",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "⚠",
                          e.getsHot,
                          "Gets Hot",
                        ),
                      e.statusEffects &&
                        e.statusEffects.length > 0 &&
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              padding: "2px 6px",
                              borderRadius: 3,
                              background: "rgba(91,74,138,0.1)",
                              color: "#5b4a8a",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          e.statusEffects.join(", "),
                        ),
                    ),
                  e.type === "charge" &&
                    React.createElement(
                      React.Fragment,
                      null,
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 12,
                            padding: "2px 7px",
                            borderRadius: 3,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            background: e.chargeSucceeded
                              ? "rgba(46,125,50,0.1)"
                              : "rgba(199,48,48,0.1)",
                            color: e.chargeSucceeded ? "#2e7d32" : "#c74040",
                          },
                        },
                        e.chargeSucceeded ? "CHARGE ✓" : "CHARGE ✗",
                        "(",
                        e.chargeRoll,
                        '" /',
                        e.chargeNeeded,
                        '")',
                      ),
                      e.volleyCasualties > 0 &&
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              padding: "2px 6px",
                              borderRadius: 3,
                              background: "rgba(107,142,35,0.1)",
                              color: "#6b8e23",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "Volley:",
                          e.volleyCasualties,
                          "☠",
                        ),
                      e.overwatchCasualties > 0 &&
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              padding: "2px 6px",
                              borderRadius: 3,
                              background: "rgba(196,106,27,0.1)",
                              color: "#c46a1b",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "Overwatch:",
                          e.overwatchCasualties,
                          "☠",
                        ),
                      e.chargeSucceeded &&
                        (e.meleeDefKills > 0 || e.meleeAtkKills > 0) &&
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              padding: "2px 6px",
                              borderRadius: 3,
                              background: "rgba(155,45,45,0.1)",
                              color: "#9b2d2d",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "Melee:",
                          e.meleeDefKills,
                          "def ☠ /",
                          e.meleeAtkKills,
                          "atk ☠",
                        ),
                      e.combatWinner &&
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              padding: "2px 6px",
                              borderRadius: 3,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 600,
                              background:
                                e.combatWinner === "Charger"
                                  ? "rgba(155,45,45,0.1)"
                                  : e.combatWinner === "Defender"
                                    ? "rgba(42,111,180,0.1)"
                                    : "rgba(0,0,0,0.04)",
                              color:
                                e.combatWinner === "Charger"
                                  ? "#9b2d2d"
                                  : e.combatWinner === "Defender"
                                    ? "#2a6fb4"
                                    : "#8a7e6e",
                            },
                          },
                          "⚖",
                          e.combatWinner,
                        ),
                    ),
                  e.type === "assault" &&
                    React.createElement(
                      React.Fragment,
                      null,
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 3,
                            background: "rgba(155,45,45,0.1)",
                            color: "#9b2d2d",
                            fontFamily: "'Share Tech Mono', serif",
                          },
                        },
                        "Atk kills:",
                        e.defKills,
                        "☠",
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 3,
                            background: "rgba(42,111,180,0.1)",
                            color: "#2a6fb4",
                            fontFamily: "'Share Tech Mono', serif",
                          },
                        },
                        "Def kills:",
                        e.atkKills,
                        "☠",
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 3,
                            background: "rgba(0,0,0,0.04)",
                            color: "#6a5e4e",
                            fontFamily: "'Share Tech Mono', serif",
                          },
                        },
                        "Survive:",
                        e.remainAtk,
                        "atk /",
                        e.remainDef,
                        "def",
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 3,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 600,
                            background:
                              e.combatWinner === "Attacker"
                                ? "rgba(155,45,45,0.1)"
                                : e.combatWinner === "Defender"
                                  ? "rgba(42,111,180,0.1)"
                                  : "rgba(0,0,0,0.04)",
                            color:
                              e.combatWinner === "Attacker"
                                ? "#9b2d2d"
                                : e.combatWinner === "Defender"
                                  ? "#2a6fb4"
                                  : "#8a7e6e",
                          },
                        },
                        "⚖",
                        e.combatWinner === "Draw"
                          ? "DRAW"
                          : `${e.combatWinner} +${e.combatDiff}`,
                      ),
                    ),
                ),
              );
            }),
          ),
    );
  };

  return React.createElement(
    "div",
    {
      style: {
        minHeight: "100vh",
        background: "#f0ebe0",
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, rgba(184,134,11,0.10) 0%, transparent 55%)",
        color: "#1e1a12",
        fontFamily: "'Share Tech Mono', 'Georgia', serif",
        fontSize: "15px",
      },
    },
    React.createElement(
      "div",
      {
        style: {
          borderBottom: "1px solid #d0c4aa",
          padding: "20px 24px",
          background:
            "linear-gradient(180deg, rgba(184,134,11,0.08) 0%, transparent 100%)",
        },
      },
      React.createElement(
        "div",
        { style: { maxWidth: 960, margin: "0 auto" } },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 12 } },
          React.createElement(
            "div",
            { style: { fontSize: 28, color: "#b8860b" } },
            "⚔",
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "h1",
              {
                style: {
                  margin: 0,
                  fontSize: 26,
                  fontFamily: "'Share Tech Mono', serif",
                  fontWeight: 700,
                  color: "#7a5800",
                  letterSpacing: 2,
                },
              },
              "COMBAT PHASE RESOLVER",
            ),
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 13,
                  color: "#7a6e5e",
                  fontFamily: "'Share Tech Mono', serif",
                  letterSpacing: 3,
                },
              },
              "THE HORUS HERESY · AGE OF DARKNESS · 3RD EDITION · v1.74",
            ),
          ),
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 0, marginTop: 14 } },
          [
            { id: "army_builder", label: "📋 ARMY", color: "#4a6741" },
            { id: "deployment", label: "📍 DEPLOY", color: "#5b4a8a" },
            { id: "movement", label: "🚶 MOVE", color: "#6b5b2e" },
            { id: "shooting", label: "⚔ SHOOTING", color: "#b8860b" },
            { id: "assault", label: "🗡 ASSAULT", color: "#9b2d2d" },
            { id: "end", label: "🏛 END", color: "#2e5e3e" },
          ].map((phase) => {
            const active = activePhase === phase.id;
            return React.createElement(
              "button",
              {
                key: phase.id,
                onClick: () => setActivePhase(phase.id),
                style: {
                  flex: 1,
                  padding: "12px 16px",
                  fontSize: 13,
                  fontFamily: "'Share Tech Mono', serif",
                  fontWeight: 700,
                  letterSpacing: 1,
                  cursor: "pointer",
                  border: "none",
                  borderBottom: active
                    ? `3px solid ${phase.color}`
                    : "3px solid transparent",
                  background: active ? "rgba(255,255,255,0.6)" : "transparent",
                  color: active ? phase.color : "#8a7e6e",
                  transition: "all 0.2s ease",
                },
              },
              phase.label,
            );
          }),
        ),
      ),
    ),
    React.createElement(
      "div",
      { style: { maxWidth: 960, margin: "0 auto", padding: "20px 16px" } },
      activePhase === "army_builder" &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 12 } },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                React.createElement("span", { style: { fontSize: 16 } }, "📋"),
                React.createElement(
                  "span",
                  {
                    style: {
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#4a6741",
                      letterSpacing: 2,
                    },
                  },
                  "CRUSADE ARMY BUILDER",
                ),
              ),
              React.createElement(
                "div",
                { style: { display: "flex", gap: 4 } },
                ["loyalist", "traitor"].map((side) =>
                  React.createElement(
                    "button",
                    {
                      key: side,
                      onClick: () => setArmyBuilderSide(side),
                      style: {
                        padding: "6px 16px",
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        letterSpacing: 1,
                        background:
                          armyBuilderSide === side
                            ? side === "loyalist"
                              ? "rgba(42,111,180,0.15)"
                              : "rgba(155,45,45,0.15)"
                            : "#f0ebe2",
                        border: `1px solid ${armyBuilderSide === side ? (side === "loyalist" ? "#2a6fb4" : "#9b2d2d") : "#d0c4aa"}`,
                        color:
                          armyBuilderSide === side
                            ? side === "loyalist"
                              ? "#2a6fb4"
                              : "#9b2d2d"
                            : "#8a7e6e",
                      },
                    },
                    side === "loyalist" ? "🦅 LOYALIST" : "🔥 TRAITOR",
                  ),
                ),
              ),
            ),
          ),
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 12 } },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  alignItems: "center",
                },
              },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 11,
                      color: "#8a7e6e",
                      fontFamily: "'Share Tech Mono', serif",
                      letterSpacing: 1,
                      marginBottom: 3,
                    },
                  },
                  "FACTION",
                ),
                React.createElement(
                  "select",
                  {
                    value: getArmy().faction,
                    onChange: (e) =>
                      setArmy((prev) => ({ ...prev, faction: e.target.value })),
                    style: {
                      padding: "5px 8px",
                      borderRadius: 4,
                      border: "1px solid #d0c4aa",
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      background: "#faf8f4",
                      color: "#2a2418",
                      maxWidth: 200,
                    },
                  },
                  LEGION_FACTIONS.filter(
                    (f) =>
                      f.allegiance === "any" ||
                      f.allegiance === getArmy().allegiance,
                  ).map((f) =>
                    React.createElement(
                      "option",
                      { key: f.id, value: f.id },
                      f.name,
                    ),
                  ),
                ),
              ),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 11,
                      color: "#8a7e6e",
                      fontFamily: "'Share Tech Mono', serif",
                      letterSpacing: 1,
                      marginBottom: 3,
                    },
                  },
                  "POINTS LIMIT",
                ),
                React.createElement("input", {
                  type: "number",
                  value: getArmy().pointsLimit,
                  onChange: (e) =>
                    setArmy((prev) => ({
                      ...prev,
                      pointsLimit: parseInt(e.target.value) || 0,
                    })),
                  style: {
                    padding: "5px 8px",
                    borderRadius: 4,
                    border: "1px solid #d0c4aa",
                    fontSize: 13,
                    fontFamily: "'Share Tech Mono', serif",
                    background: "#faf8f4",
                    color: "#2a2418",
                    width: 80,
                    fontWeight: 700,
                  },
                }),
              ),
              React.createElement(
                "div",
                { style: { marginLeft: "auto", display: "flex", gap: 4 } },
                React.createElement(
                  "button",
                  {
                    onClick: () => exportArmyXlsx(armyBuilderSide),
                    style: {
                      padding: "5px 10px",
                      borderRadius: 4,
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 600,
                      background: "#f0ebe2",
                      border: "1px solid #d0c4aa",
                      color: "#4a6741",
                    },
                  },
                  "📥 EXPORT",
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => abFileInputRef.current?.click(),
                    style: {
                      padding: "5px 10px",
                      borderRadius: 4,
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 600,
                      background: "#f0ebe2",
                      border: "1px solid #d0c4aa",
                      color: "#5b4a8a",
                    },
                  },
                  "📤 IMPORT",
                ),
                React.createElement("input", {
                  ref: abFileInputRef,
                  type: "file",
                  accept: ".csv,.txt",
                  style: { display: "none" },
                  onChange: handleFileImport,
                }),
              ),
            ),
            React.createElement(
              "div",
              {
                style: {
                  marginTop: 10,
                  height: 22,
                  borderRadius: 4,
                  background: "#050705",
                  overflow: "hidden",
                  position: "relative",
                },
              },
              React.createElement("div", {
                style: {
                  height: "100%",
                  borderRadius: 4,
                  transition: "width 0.3s ease",
                  width: `${Math.min(100, (armyTotalPoints / Math.max(1, getArmy().pointsLimit)) * 100)}%`,
                  background:
                    armyTotalPoints > getArmy().pointsLimit
                      ? "linear-gradient(90deg,#9b2d2d,#c0392b)"
                      : armyBuilderSide === "loyalist"
                        ? "linear-gradient(90deg,#2a6fb4,#3498db)"
                        : "linear-gradient(90deg,#9b2d2d,#e74c3c)",
                },
              }),
              React.createElement(
                "div",
                {
                  style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 700,
                    color:
                      armyTotalPoints > getArmy().pointsLimit * 0.5
                        ? "#fff"
                        : "#2a2418",
                  },
                },
                armyTotalPoints,
                "/",
                getArmy().pointsLimit,
                "pts",
              ),
            ),
            armyValidation.errors.length > 0 &&
              React.createElement(
                "div",
                { style: { marginTop: 6 } },
                armyValidation.errors.map((err, i) =>
                  React.createElement(
                    "div",
                    {
                      key: i,
                      style: {
                        fontSize: 11,
                        color: "#9b2d2d",
                        fontFamily: "'Share Tech Mono', serif",
                        padding: "1px 0",
                      },
                    },
                    "⚠",
                    err,
                  ),
                ),
              ),
            armyValidation.valid &&
              getArmy().entries.length > 0 &&
              React.createElement(
                "div",
                {
                  style: {
                    marginTop: 6,
                    fontSize: 11,
                    color: "#4a6741",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 700,
                  },
                },
                "✓ Army list valid",
              ),
          ),
          React.createElement(
            "div",
            {
              style: {
                ...panelStyle,
                marginBottom: 12,
                borderLeft: "3px solid #8b6508",
              },
            },
            React.createElement(
              "div",
              { style: { ...panelHeaderStyle, marginBottom: 8 } },
              React.createElement(
                "span",
                { style: { color: "#8b6508", fontSize: 14 } },
                "⚜",
              ),
              React.createElement("span", null, "CRUSADE PRIMARY DETACHMENT"),
            ),
            CRUSADE_PRIMARY.slots.map((slot, si) => {
              const role = BATTLEFIELD_ROLES[slot.role];
              const filledEntries = getArmy().entries.filter(
                (e) =>
                  e.detachmentId === "primary" &&
                  (e.slotRole || UNIT_BATTLEFIELD_ROLE[e.unitId]) === slot.role,
              );
              const remaining = slot.count - filledEntries.length;
              return React.createElement(
                "div",
                { key: si, style: { marginBottom: 10 } },
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                    },
                  },
                  React.createElement(
                    "span",
                    {
                      style: { fontSize: 13, color: role?.color || "#8a7e6e" },
                    },
                    role?.icon,
                  ),
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: role?.color || "#6a5e4e",
                        letterSpacing: 1,
                      },
                    },
                    role?.label?.toUpperCase(),
                    "×",
                    slot.count,
                  ),
                  (slot.prime || slot.primeCount) &&
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontSize: 8,
                          color: "#d4af37",
                          fontWeight: 600,
                          border: "1px solid #d4af37",
                          borderRadius: 3,
                          padding: "1px 4px",
                        },
                      },
                      "PRIME",
                      slot.primeCount
                        ? ` (${slot.primeCount}/${slot.count})`
                        : "",
                    ),
                  React.createElement(
                    "span",
                    {
                      style: { fontSize: 11, color: "#8a7e6e", marginLeft: 4 },
                    },
                    "(",
                    filledEntries.length,
                    "/",
                    slot.count,
                    "filled)",
                  ),
                ),
                filledEntries.map((entry, ei) => {
                  const pts = calcArmyEntryPoints(entry);
                  const entryRole =
                    entry.slotRole || UNIT_BATTLEFIELD_ROLE[entry.unitId];
                  return React.createElement(
                    "div",
                    {
                      key: entry.id,
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        marginBottom: 3,
                        borderRadius: 5,
                        background: entry.isPrime
                          ? "rgba(212,175,55,0.08)"
                          : ei % 2 === 0
                            ? "#faf8f4"
                            : "#f5f0e8",
                        border: entry.isWarlord
                          ? "1.5px solid #d4af37"
                          : entry.isPrime
                            ? "1.5px solid rgba(212,175,55,0.4)"
                            : "1px solid #050705",
                      },
                    },
                    typeof getUnitArtwork === "function" &&
                      getUnitArtwork(entry.unitId, getArmy().faction)
                      ? React.createElement("img", {
                          src: getUnitArtwork(entry.unitId, getArmy().faction),
                          alt: "",
                          style: {
                            width: 120,
                            height: 120,
                            objectFit: "contain",
                            background: "#1e1a14",
                            borderRadius: 4,
                            flexShrink: 0,
                            border: "1px solid rgba(184,134,11,0.2)",
                          },
                          onError: function (e) {
                            e.currentTarget.style.display = "none";
                          },
                        })
                      : null,
                    React.createElement(
                      "div",
                      { style: { flex: 1, minWidth: 0 } },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 15,
                            color: "#2a2418",
                            display: "flex",
                            gap: 6,
                            alignItems: "center",
                            flexWrap: "wrap",
                          },
                        },
                        entry.unitName,
                        entry.isWarlord &&
                          React.createElement(
                            "span",
                            { style: { fontSize: 8, color: "#d4af37" } },
                            "👑",
                          ),
                        entry.isPrime &&
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 7,
                                color: "#d4af37",
                                fontWeight: 700,
                                border: "1px solid #d4af37",
                                borderRadius: 2,
                                padding: "0 3px",
                              },
                            },
                            "★PRIME",
                          ),
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 12,
                            color: "#8a7e6e",
                            fontFamily: "'Share Tech Mono', serif",
                          },
                        },
                        entry.models,
                        "mdl",
                        entry.weaponName ? ` · ${entry.weaponName}` : "",
                        entry.secondaryWeapons &&
                          entry.secondaryWeapons.length > 0
                          ? entry.secondaryWeapons
                              .map((sw) => ` · +${sw.models}× ${sw.weaponName}`)
                              .join("")
                          : "",
                        entry.sgtWeaponName
                          ? ` · Sgt:${entry.sgtWeaponName}`
                          : "",
                        formatWargear(entry),
                      ),
                      entry.primeAdvantage &&
                        (() => {
                          const allPAs = [
                            ...PRIME_ADVANTAGES,
                            ...ALLEGIANCE_PRIME_ADVANTAGES,
                            ...(LEGION_PRIME_ADVANTAGES[getArmy().faction] ||
                              []),
                          ];
                          const pa = allPAs.find(
                            (p) => p.id === entry.primeAdvantage,
                          );
                          return pa
                            ? React.createElement(
                                "div",
                                {
                                  style: {
                                    fontSize: 8,
                                    color: "#b8860b",
                                    fontStyle: "italic",
                                    marginTop: 1,
                                  },
                                },
                                "⭐",
                                pa.name,
                                ":",
                                pa.desc,
                              )
                            : null;
                        })(),
                    ),
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#4a6741",
                        },
                      },
                      pts,
                      "pts",
                    ),
                    entryRole === "high_command" &&
                      React.createElement(
                        "button",
                        {
                          onClick: () => setAbShowApexPicker(entry.id),
                          title: "Unlock Apex or Additional Detachment",
                          style: {
                            padding: "2px 6px",
                            borderRadius: 3,
                            fontSize: 8,
                            cursor: "pointer",
                            background: "rgba(212,175,55,0.12)",
                            border: "1px solid #d4af37",
                            color: "#b8860b",
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 600,
                          },
                        },
                        "+DET",
                      ),
                    entryRole === "command" &&
                      React.createElement(
                        "button",
                        {
                          onClick: () => setAbShowAuxPicker(entry.id),
                          title: "Unlock Auxiliary Detachment",
                          style: {
                            padding: "2px 6px",
                            borderRadius: 3,
                            fontSize: 11,
                            cursor: "pointer",
                            background: "rgba(74,103,65,0.1)",
                            border: "1px solid #4a6741",
                            color: "#4a6741",
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 600,
                          },
                        },
                        "+AUX",
                      ),
                    React.createElement(
                      "button",
                      {
                        onClick: () => {
                          setAbEditIdx(getArmy().entries.indexOf(entry));
                          setAbEditEntry({
                            ...entry,
                            faction: getArmy().faction,
                          });
                          setAbAddModalOpen(true);
                        },
                        style: {
                          padding: "2px 6px",
                          borderRadius: 3,
                          fontSize: 11,
                          cursor: "pointer",
                          background: "#f0ebe2",
                          border: "1px solid #d0c4aa",
                          color: "#6a5e4e",
                        },
                      },
                      "✎",
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: () =>
                          setArmy((prev) => ({
                            ...prev,
                            entries: prev.entries.filter(
                              (e) => e.id !== entry.id,
                            ),
                          })),
                        style: {
                          padding: "2px 6px",
                          borderRadius: 3,
                          fontSize: 11,
                          cursor: "pointer",
                          background: "rgba(155,45,45,0.08)",
                          border: "1px solid rgba(155,45,45,0.3)",
                          color: "#9b2d2d",
                        },
                      },
                      "✕",
                    ),
                  );
                }),
                remaining > 0 &&
                  React.createElement(
                    "button",
                    {
                      onClick: () => {
                        setAbAddSlotRole(slot.role);
                        setAbAddDetId("primary");
                        setAbEditIdx(null);
                        setAbEditEntry(null);
                        setAbAddModalOpen(true);
                      },
                      style: {
                        width: "100%",
                        padding: "6px 10px",
                        borderRadius: 4,
                        cursor: "pointer",
                        border: `1.5px dashed ${role?.color || "#d0c4aa"}`,
                        background: "transparent",
                        fontFamily: "'Share Tech Mono', serif",
                        fontSize: 12,
                        color: role?.color || "#8a7e6e",
                        fontWeight: 600,
                        letterSpacing: 1,
                        opacity: 0.7,
                      },
                    },
                    "+ ADD",
                    role?.label?.toUpperCase(),
                    "(",
                    remaining,
                    "slot",
                    remaining !== 1 ? "s" : "",
                    "remaining)",
                  ),
              );
            }),
            (() => {
              const bonusSlots = getArmy().entries.filter(
                (e) =>
                  e.detachmentId === "primary" &&
                  e.isPrime &&
                  e.primeAdvantage === "logistical_benefit" &&
                  e.logisticalRole,
              );
              if (bonusSlots.length === 0) return null;
              return bonusSlots.map((entry) => {
                const role = BATTLEFIELD_ROLES[entry.logisticalRole];
                const filledEntries = getArmy().entries.filter(
                  (e) =>
                    e.detachmentId === `logistical_${entry.id}` &&
                    (e.slotRole || UNIT_BATTLEFIELD_ROLE[e.unitId]) ===
                      entry.logisticalRole,
                );
                const remaining = 1 - filledEntries.length;
                return React.createElement(
                  "div",
                  {
                    key: `log_${entry.id}`,
                    style: {
                      marginBottom: 8,
                      padding: 6,
                      borderRadius: 5,
                      background: "rgba(74,103,65,0.04)",
                      border: "1px dashed rgba(74,103,65,0.3)",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 3,
                      },
                    },
                    React.createElement(
                      "span",
                      { style: { fontSize: 13, color: role?.color } },
                      role?.icon,
                    ),
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          fontSize: 11,
                          color: "#4a6741",
                          letterSpacing: 1,
                        },
                      },
                      "LOGISTICAL BENEFIT:",
                      role?.label?.toUpperCase(),
                      "× 1",
                    ),
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontSize: 7,
                          color: "#b8860b",
                          fontWeight: 600,
                          border: "1px solid #b8860b",
                          borderRadius: 2,
                          padding: "0 3px",
                        },
                      },
                      "BONUS",
                    ),
                  ),
                  filledEntries.map((be) => {
                    const pts = calcArmyEntryPoints(be);
                    return React.createElement(
                      "div",
                      {
                        key: be.id,
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 10px",
                          borderRadius: 4,
                          background: "#faf8f4",
                          border: "1px solid #050705",
                          marginBottom: 2,
                        },
                      },
                      typeof getUnitArtwork === "function" &&
                        getUnitArtwork(be.unitId, getArmy().faction)
                        ? React.createElement("img", {
                            src: getUnitArtwork(be.unitId, getArmy().faction),
                            alt: "",
                            style: {
                              width: 120,
                              height: 120,
                              objectFit: "contain",
                              background: "#1e1a14",
                              borderRadius: 4,
                              flexShrink: 0,
                              border: "1px solid rgba(184,134,11,0.2)",
                            },
                            onError: function (e) {
                              e.currentTarget.style.display = "none";
                            },
                          })
                        : null,
                      React.createElement(
                        "div",
                        { style: { flex: 1 } },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 600,
                              fontSize: 15,
                              color: "#2a2418",
                            },
                          },
                          be.unitName,
                        ),
                        React.createElement(
                          "div",
                          { style: { fontSize: 12, color: "#8a7e6e" } },
                          be.models,
                          "mdl",
                          be.weaponName ? ` · ${be.weaponName}` : "",
                        ),
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 15,
                            color: "#4a6741",
                          },
                        },
                        pts,
                        "pts",
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: () => {
                            setAbEditIdx(getArmy().entries.indexOf(be));
                            setAbEditEntry({
                              ...be,
                              faction: getArmy().faction,
                            });
                            setAbAddModalOpen(true);
                          },
                          style: {
                            padding: "4px 8px",
                            borderRadius: 3,
                            fontSize: 11,
                            cursor: "pointer",
                            background: "#f0ebe2",
                            border: "1px solid #d0c4aa",
                            color: "#6a5e4e",
                          },
                        },
                        "✎",
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: () =>
                            setArmy((prev) => ({
                              ...prev,
                              entries: prev.entries.filter(
                                (e) => e.id !== be.id,
                              ),
                            })),
                          style: {
                            padding: "4px 8px",
                            borderRadius: 3,
                            fontSize: 11,
                            cursor: "pointer",
                            background: "rgba(155,45,45,0.08)",
                            border: "1px solid rgba(155,45,45,0.3)",
                            color: "#9b2d2d",
                          },
                        },
                        "✕",
                      ),
                    );
                  }),
                  remaining > 0 &&
                    React.createElement(
                      "button",
                      {
                        onClick: () => {
                          setAbAddSlotRole(entry.logisticalRole);
                          setAbAddDetId(`logistical_${entry.id}`);
                          setAbEditIdx(null);
                          setAbEditEntry(null);
                          setAbAddModalOpen(true);
                        },
                        style: {
                          width: "100%",
                          padding: "5px 8px",
                          borderRadius: 4,
                          cursor: "pointer",
                          border: `1.5px dashed ${role?.color || "#d0c4aa"}`,
                          background: "transparent",
                          fontFamily: "'Share Tech Mono', serif",
                          fontSize: 11,
                          color: role?.color,
                          fontWeight: 600,
                          opacity: 0.7,
                        },
                      },
                      "+ ADD",
                      role?.label?.toUpperCase(),
                      "(1 slot)",
                    ),
                );
              });
            })(),
          ),
          getArmy().detachments.map((det) => {
            let detDef =
              AUXILIARY_DETACHMENTS[det.type] ||
              APEX_DETACHMENTS[det.type] ||
              ADDITIONAL_DETACHMENTS[det.type];
            let isLegionDet = false;
            let isAdditionalDet = !!ADDITIONAL_DETACHMENTS[det.type];
            // Check legion-specific detachments
            if (!detDef) {
              const legionDets = LEGION_DETACHMENTS[getArmy().faction];
              if (legionDets) {
                const allLDets = [
                  ...(legionDets.auxiliary || []),
                  ...(legionDets.apex || []),
                ];
                detDef = allLDets.find((d) => d.id === det.type);
                if (detDef) isLegionDet = true;
              }
            }
            if (!detDef) return null;
            const isApex =
              !!APEX_DETACHMENTS[det.type] ||
              (isLegionDet &&
                LEGION_DETACHMENTS[getArmy().faction]?.apex?.some(
                  (d) => d.id === det.type,
                ));
            const borderColor = isAdditionalDet
              ? detDef.color || "#5b7a9d"
              : isLegionDet
                ? "#8b5e3c"
                : isApex
                  ? "#d4af37"
                  : "#4a6741";
            return React.createElement(
              "div",
              {
                key: det.id,
                style: {
                  ...panelStyle,
                  marginBottom: 12,
                  borderLeft: `3px solid ${borderColor}`,
                },
              },
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  },
                },
                React.createElement(
                  "div",
                  { style: { ...panelHeaderStyle, marginBottom: 0 } },
                  React.createElement(
                    "span",
                    { style: { color: borderColor, fontSize: 13 } },
                    isAdditionalDet
                      ? detDef.icon || "📋"
                      : isLegionDet
                        ? "⚔"
                        : isApex
                          ? "🔱"
                          : "⚙",
                  ),
                  React.createElement("span", null, detDef.name.toUpperCase()),
                  React.createElement(
                    "span",
                    {
                      style: { fontSize: 8, color: "#8a7e6e", fontWeight: 400 },
                    },
                    isAdditionalDet
                      ? "Additional"
                      : isLegionDet
                        ? "Legion"
                        : isApex
                          ? "Apex"
                          : "Auxiliary",
                  ),
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => removeDetachment(det.id),
                    style: {
                      padding: "2px 8px",
                      borderRadius: 3,
                      fontSize: 11,
                      cursor: "pointer",
                      background: "rgba(155,45,45,0.08)",
                      border: "1px solid rgba(155,45,45,0.3)",
                      color: "#9b2d2d",
                    },
                  },
                  "Remove",
                ),
              ),
              detDef.desc &&
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 11,
                      color: "#8a7e6e",
                      fontFamily: "'Share Tech Mono', serif",
                      marginBottom: 8,
                      fontStyle: "italic",
                    },
                  },
                  detDef.desc,
                ),
              detDef.slots.map((slot, si) => {
                const role = BATTLEFIELD_ROLES[slot.role];
                const filledEntries = getArmy().entries.filter(
                  (e) =>
                    e.detachmentId === det.id &&
                    (e.slotRole || UNIT_BATTLEFIELD_ROLE[e.unitId]) ===
                      slot.role,
                );
                const remaining = slot.count - filledEntries.length;
                return React.createElement(
                  "div",
                  { key: si, style: { marginBottom: 8 } },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 3,
                      },
                    },
                    React.createElement(
                      "span",
                      { style: { fontSize: 13, color: role?.color } },
                      role?.icon,
                    ),
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          fontSize: 12,
                          color: role?.color,
                          letterSpacing: 1,
                        },
                      },
                      role?.label?.toUpperCase(),
                      "×",
                      slot.count,
                    ),
                    (slot.prime || slot.primeCount) &&
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 7,
                            color: "#d4af37",
                            fontWeight: 600,
                            border: "1px solid #d4af37",
                            borderRadius: 3,
                            padding: "0px 3px",
                          },
                        },
                        "PRIME",
                        slot.primeCount
                          ? ` (${slot.primeCount}/${slot.count})`
                          : "",
                      ),
                    React.createElement(
                      "span",
                      { style: { fontSize: 8, color: "#8a7e6e" } },
                      "(",
                      filledEntries.length,
                      "/",
                      slot.count,
                      ")",
                    ),
                  ),
                  filledEntries.map((entry) => {
                    const pts = calcArmyEntryPoints(entry);
                    return React.createElement(
                      "div",
                      {
                        key: entry.id,
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 10px",
                          marginBottom: 2,
                          borderRadius: 4,
                          background: entry.isPrime
                            ? "rgba(212,175,55,0.06)"
                            : "#faf8f4",
                          border: entry.isPrime
                            ? "1px solid rgba(212,175,55,0.3)"
                            : "1px solid #050705",
                        },
                      },
                      typeof getUnitArtwork === "function" &&
                        getUnitArtwork(entry.unitId, getArmy().faction)
                        ? React.createElement("img", {
                            src: getUnitArtwork(
                              entry.unitId,
                              getArmy().faction,
                            ),
                            alt: "",
                            style: {
                              width: 120,
                              height: 120,
                              objectFit: "contain",
                              background: "#1e1a14",
                              borderRadius: 4,
                              flexShrink: 0,
                              border: "1px solid rgba(184,134,11,0.2)",
                            },
                            onError: function (e) {
                              e.currentTarget.style.display = "none";
                            },
                          })
                        : null,
                      React.createElement(
                        "div",
                        { style: { flex: 1 } },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 600,
                              fontSize: 15,
                              color: "#2a2418",
                            },
                          },
                          entry.unitName,
                          entry.isPrime &&
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 9,
                                  color: "#d4af37",
                                  marginLeft: 4,
                                  fontWeight: 700,
                                  border: "1px solid #d4af37",
                                  borderRadius: 2,
                                  padding: "0 2px",
                                },
                              },
                              "★PRIME",
                            ),
                        ),
                        React.createElement(
                          "div",
                          { style: { fontSize: 12, color: "#8a7e6e" } },
                          entry.models,
                          "mdl",
                          entry.weaponName ? ` · ${entry.weaponName}` : "",
                          entry.secondaryWeapons &&
                            entry.secondaryWeapons.length > 0
                            ? entry.secondaryWeapons
                                .map(
                                  (sw) => ` · +${sw.models}× ${sw.weaponName}`,
                                )
                                .join("")
                            : "",
                          formatWargear(entry),
                        ),
                        entry.primeAdvantage &&
                          (() => {
                            const allPAs = [
                              ...PRIME_ADVANTAGES,
                              ...ALLEGIANCE_PRIME_ADVANTAGES,
                              ...(LEGION_PRIME_ADVANTAGES[getArmy().faction] ||
                                []),
                            ];
                            const pa = allPAs.find(
                              (p) => p.id === entry.primeAdvantage,
                            );
                            return pa
                              ? React.createElement(
                                  "div",
                                  {
                                    style: {
                                      fontSize: 11,
                                      color: "#b8860b",
                                      fontStyle: "italic",
                                      marginTop: 1,
                                    },
                                  },
                                  "⭐",
                                  pa.name,
                                  ":",
                                  pa.desc,
                                )
                              : null;
                          })(),
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 15,
                            color: "#4a6741",
                          },
                        },
                        pts,
                        "pts",
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: () => {
                            setAbEditIdx(getArmy().entries.indexOf(entry));
                            setAbEditEntry({
                              ...entry,
                              faction: getArmy().faction,
                            });
                            setAbAddModalOpen(true);
                          },
                          style: {
                            padding: "4px 8px",
                            borderRadius: 3,
                            fontSize: 11,
                            cursor: "pointer",
                            background: "#f0ebe2",
                            border: "1px solid #d0c4aa",
                            color: "#6a5e4e",
                          },
                        },
                        "✎",
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: () =>
                            setArmy((prev) => ({
                              ...prev,
                              entries: prev.entries.filter(
                                (e) => e.id !== entry.id,
                              ),
                            })),
                          style: {
                            padding: "4px 8px",
                            borderRadius: 3,
                            fontSize: 11,
                            cursor: "pointer",
                            background: "rgba(155,45,45,0.08)",
                            border: "1px solid rgba(155,45,45,0.3)",
                            color: "#9b2d2d",
                          },
                        },
                        "✕",
                      ),
                    );
                  }),
                  remaining > 0 &&
                    React.createElement(
                      "button",
                      {
                        onClick: () => {
                          setAbAddSlotRole(slot.role);
                          setAbAddDetId(det.id);
                          setAbEditIdx(null);
                          setAbEditEntry(null);
                          setAbAddModalOpen(true);
                        },
                        style: {
                          width: "100%",
                          padding: "5px 8px",
                          borderRadius: 4,
                          cursor: "pointer",
                          border: `1.5px dashed ${role?.color || "#d0c4aa"}`,
                          background: "transparent",
                          fontFamily: "'Share Tech Mono', serif",
                          fontSize: 11,
                          color: role?.color,
                          fontWeight: 600,
                          opacity: 0.7,
                        },
                      },
                      "+ ADD",
                      role?.label?.toUpperCase(),
                      "(",
                      remaining,
                      "left)",
                    ),
                );
              }),
            );
          }),
          (loyalistArmy.entries.length > 0 || traitorArmy.entries.length > 0) &&
            React.createElement(
              "div",
              { style: { ...panelStyle, marginBottom: 12 } },
              React.createElement(
                "div",
                { style: { ...panelHeaderStyle } },
                React.createElement(
                  "span",
                  { style: { color: "#5b4a8a", fontSize: 14 } },
                  "📍",
                ),
                React.createElement("span", null, "DEPLOY ARMIES"),
              ),
              React.createElement(
                "div",
                { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
                loyalistArmy.entries.length > 0 &&
                  React.createElement(
                    "button",
                    {
                      onClick: () => {
                        deployArmyToBoard("loyalist");
                        setActivePhase("deployment");
                      },
                      style: {
                        flex: 1,
                        padding: "8px 14px",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        fontSize: 11,
                        background: "rgba(42,111,180,0.1)",
                        border: "1.5px solid #2a6fb4",
                        color: "#2a6fb4",
                      },
                    },
                    "🦅 Deploy Loyalist (",
                    loyalistArmy.entries.length,
                    "units)",
                  ),
                traitorArmy.entries.length > 0 &&
                  React.createElement(
                    "button",
                    {
                      onClick: () => {
                        deployArmyToBoard("traitor");
                        setActivePhase("deployment");
                      },
                      style: {
                        flex: 1,
                        padding: "8px 14px",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        fontSize: 11,
                        background: "rgba(155,45,45,0.1)",
                        border: "1.5px solid #9b2d2d",
                        color: "#9b2d2d",
                      },
                    },
                    "🔥 Deploy Traitor (",
                    traitorArmy.entries.length,
                    "units)",
                  ),
                loyalistArmy.entries.length > 0 &&
                  traitorArmy.entries.length > 0 &&
                  React.createElement(
                    "button",
                    {
                      onClick: () => {
                        deployArmyToBoard("loyalist");
                        deployArmyToBoard("traitor");
                        setActivePhase("deployment");
                      },
                      style: {
                        flex: 1,
                        padding: "8px 14px",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        fontSize: 11,
                        background: "rgba(74,103,65,0.1)",
                        border: "1.5px solid #4a6741",
                        color: "#4a6741",
                      },
                    },
                    "⚔ Deploy Both",
                  ),
              ),
            ),
          typeof getUnitArtwork === "function" &&
            (() => {
              const artSrc = getUnitArtwork(
                null,
                getArmy().faction,
                getArmy().allegiance,
              );
              if (!artSrc) return null;
              return React.createElement(
                "div",
                {
                  style: {
                    borderRadius: 10,
                    overflow: "hidden",
                    marginBottom: 12,
                    border: "2px solid rgba(184,134,11,0.3)",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
                  },
                },
                React.createElement("img", {
                  src: artSrc,
                  alt: "",
                  style: { width: "100%", height: "auto", display: "block" },
                  onError: function (e) {
                    e.currentTarget.style.display = "none";
                  },
                }),
              );
            })(),
          abShowAuxPicker &&
            React.createElement(
              "div",
              {
                style: {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9999,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
                onClick: (e) => {
                  if (e.target === e.currentTarget) setAbShowAuxPicker(null);
                },
              },
              React.createElement(
                "div",
                {
                  style: {
                    background: "#faf8f4",
                    borderRadius: 12,
                    padding: 20,
                    width: "90%",
                    maxWidth: 520,
                    maxHeight: "85vh",
                    overflowY: "auto",
                    border: "2px solid #4a6741",
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#4a6741",
                      letterSpacing: 2,
                      marginBottom: 6,
                    },
                  },
                  "COMMAND SLOT UNLOCKED",
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      color: "#6a5e4e",
                      fontFamily: "'Share Tech Mono', serif",
                      marginBottom: 14,
                      lineHeight: 1.5,
                    },
                  },
                  "Each Command slot filled allows you to add",
                  React.createElement(
                    "strong",
                    null,
                    "one Auxiliary Detachment",
                  ),
                  "to your Army. You may also skip this selection.",
                ),
                (() => {
                  const legionDets = getLegionDetachments();
                  const auxDets = legionDets.auxiliary || [];
                  if (auxDets.length === 0) return null;
                  const factionName =
                    LEGION_FACTIONS.find((f) => f.id === getArmy().faction)
                      ?.name || "Legion";
                  return React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 12,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          color: "#8b5e3c",
                          letterSpacing: 1,
                          marginBottom: 6,
                        },
                      },
                      "⚔",
                      factionName.toUpperCase(),
                      "DETACHMENTS",
                    ),
                    auxDets.map((det) =>
                      React.createElement(
                        "button",
                        {
                          key: det.id,
                          onClick: () =>
                            addLegionAuxDetachment(det.id, abShowAuxPicker),
                          style: {
                            display: "block",
                            width: "100%",
                            padding: "10px 12px",
                            marginBottom: 4,
                            borderRadius: 6,
                            cursor: "pointer",
                            background: "rgba(139,94,60,0.04)",
                            border: "1.5px solid #8b5e3c",
                            textAlign: "left",
                          },
                        },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 700,
                              fontSize: 12,
                              color: "#8b5e3c",
                            },
                          },
                          det.name,
                        ),
                        React.createElement(
                          "div",
                          { style: { fontSize: 11, color: "#8a7e6e" } },
                          det.slots
                            .map(
                              (s) =>
                                `${BATTLEFIELD_ROLES[s.role]?.label} ×${s.count}${s.prime ? " ★" : s.primeCount ? " ★" + s.primeCount : ""}`,
                            )
                            .join(", "),
                        ),
                        det.desc &&
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 8,
                                color: "#6a5e4e",
                                fontStyle: "italic",
                                marginTop: 2,
                              },
                            },
                            det.desc,
                          ),
                      ),
                    ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 12,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          color: "#4a6741",
                          letterSpacing: 1,
                          marginBottom: 6,
                          marginTop: 12,
                        },
                      },
                      "⚙ STANDARD AUXILIARY",
                    ),
                  );
                })(),
                Object.entries(AUXILIARY_DETACHMENTS).map(([key, det]) =>
                  React.createElement(
                    "button",
                    {
                      key: key,
                      onClick: () =>
                        addAuxiliaryDetachment(key, abShowAuxPicker),
                      style: {
                        display: "block",
                        width: "100%",
                        padding: "10px 12px",
                        marginBottom: 4,
                        borderRadius: 6,
                        cursor: "pointer",
                        background: "#fff",
                        border: "1px solid #d0c4aa",
                        textAlign: "left",
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          fontSize: 12,
                          color: "#4a6741",
                        },
                      },
                      det.name,
                    ),
                    React.createElement(
                      "div",
                      { style: { fontSize: 11, color: "#8a7e6e" } },
                      det.slots
                        .map(
                          (s) =>
                            `${BATTLEFIELD_ROLES[s.role]?.label} ×${s.count}`,
                        )
                        .join(", "),
                    ),
                    det.desc &&
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 8,
                            color: "#6a5e4e",
                            fontStyle: "italic",
                            marginTop: 2,
                          },
                        },
                        det.desc,
                      ),
                  ),
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => setAbShowAuxPicker(null),
                    style: {
                      marginTop: 12,
                      padding: "8px 20px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontFamily: "'Share Tech Mono', serif",
                      fontSize: 11,
                      background: "#f0ebe2",
                      border: "1px solid #d0c4aa",
                      color: "#8a7e6e",
                      width: "100%",
                    },
                  },
                  "SKIP — No Detachment",
                ),
              ),
            ),
          abShowApexPicker &&
            React.createElement(
              "div",
              {
                style: {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9999,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
                onClick: (e) => {
                  if (e.target === e.currentTarget) setAbShowApexPicker(null);
                },
              },
              React.createElement(
                "div",
                {
                  style: {
                    background: "#faf8f4",
                    borderRadius: 12,
                    padding: 20,
                    width: "90%",
                    maxWidth: 520,
                    maxHeight: "85vh",
                    overflowY: "auto",
                    border: "2px solid #d4af37",
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#d4af37",
                      letterSpacing: 2,
                      marginBottom: 6,
                    },
                  },
                  "HIGH COMMAND UNLOCKED",
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      color: "#6a5e4e",
                      fontFamily: "'Share Tech Mono', serif",
                      marginBottom: 14,
                      lineHeight: 1.5,
                    },
                  },
                  "Each High Command slot allows you to add",
                  React.createElement("strong", null, "one Apex Detachment"),
                  "or",
                  React.createElement(
                    "strong",
                    null,
                    "one Additional Detachment",
                  ),
                  "(Warlord, Lord of War, Allied) to your Army.",
                ),
                (() => {
                  const legionDets = getLegionDetachments();
                  const apexDets = legionDets.apex || [];
                  if (apexDets.length === 0) return null;
                  const factionName =
                    LEGION_FACTIONS.find((f) => f.id === getArmy().faction)
                      ?.name || "Legion";
                  return React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 12,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          color: "#8b5e3c",
                          letterSpacing: 1,
                          marginBottom: 6,
                        },
                      },
                      "⚔",
                      factionName.toUpperCase(),
                      "APEX",
                    ),
                    apexDets.map((det) =>
                      React.createElement(
                        "button",
                        {
                          key: det.id,
                          onClick: () =>
                            addLegionAuxDetachment(det.id, abShowApexPicker),
                          style: {
                            display: "block",
                            width: "100%",
                            padding: "10px 12px",
                            marginBottom: 4,
                            borderRadius: 6,
                            cursor: "pointer",
                            background: "rgba(139,94,60,0.04)",
                            border: "1.5px solid #8b5e3c",
                            textAlign: "left",
                          },
                        },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 700,
                              fontSize: 12,
                              color: "#8b5e3c",
                            },
                          },
                          det.name,
                        ),
                        React.createElement(
                          "div",
                          { style: { fontSize: 11, color: "#8a7e6e" } },
                          det.slots
                            .map(
                              (s) =>
                                `${BATTLEFIELD_ROLES[s.role]?.label} ×${s.count}${s.prime ? " ★" : s.primeCount ? " ★" + s.primeCount : ""}`,
                            )
                            .join(", "),
                        ),
                        det.desc &&
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 8,
                                color: "#6a5e4e",
                                fontStyle: "italic",
                                marginTop: 2,
                              },
                            },
                            det.desc,
                          ),
                      ),
                    ),
                  );
                })(),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      color: "#d4af37",
                      letterSpacing: 1,
                      marginBottom: 6,
                      marginTop: 10,
                    },
                  },
                  "🔱 APEX DETACHMENTS",
                ),
                Object.entries(APEX_DETACHMENTS).map(([key, det]) =>
                  React.createElement(
                    "button",
                    {
                      key: key,
                      onClick: () => addApexDetachment(key, abShowApexPicker),
                      style: {
                        display: "block",
                        width: "100%",
                        padding: "10px 12px",
                        marginBottom: 4,
                        borderRadius: 6,
                        cursor: "pointer",
                        background: "#fff",
                        border: "1.5px solid #d4af37",
                        textAlign: "left",
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          fontSize: 12,
                          color: "#b8860b",
                        },
                      },
                      det.name,
                    ),
                    React.createElement(
                      "div",
                      { style: { fontSize: 11, color: "#8a7e6e" } },
                      det.slots
                        .map(
                          (s) =>
                            `${BATTLEFIELD_ROLES[s.role]?.label} ×${s.count}${s.primeCount ? " ★" + s.primeCount : ""}`,
                        )
                        .join(", "),
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      color: "#5b7a9d",
                      letterSpacing: 1,
                      marginBottom: 6,
                      marginTop: 14,
                    },
                  },
                  "📋 ADDITIONAL DETACHMENTS",
                ),
                Object.entries(ADDITIONAL_DETACHMENTS).map(([key, det]) =>
                  React.createElement(
                    "button",
                    {
                      key: key,
                      onClick: () =>
                        addAdditionalDetachment(key, abShowApexPicker),
                      style: {
                        display: "block",
                        width: "100%",
                        padding: "10px 12px",
                        marginBottom: 4,
                        borderRadius: 6,
                        cursor: "pointer",
                        background: "rgba(91,122,157,0.04)",
                        border: `1.5px solid ${det.color || "#5b7a9d"}`,
                        textAlign: "left",
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          fontSize: 12,
                          color: det.color || "#5b7a9d",
                        },
                      },
                      det.icon,
                      det.name,
                    ),
                    React.createElement(
                      "div",
                      { style: { fontSize: 11, color: "#8a7e6e" } },
                      det.slots
                        .map(
                          (s) =>
                            `${BATTLEFIELD_ROLES[s.role]?.label} ×${s.count}${s.prime ? " ★" : s.primeCount ? " ★" + s.primeCount : ""}`,
                        )
                        .join(", "),
                    ),
                    det.desc &&
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 8,
                            color: "#6a5e4e",
                            fontStyle: "italic",
                            marginTop: 2,
                          },
                        },
                        det.desc,
                      ),
                  ),
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => setAbShowApexPicker(null),
                    style: {
                      marginTop: 12,
                      padding: "8px 20px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontFamily: "'Share Tech Mono', serif",
                      fontSize: 11,
                      background: "#f0ebe2",
                      border: "1px solid #d0c4aa",
                      color: "#8a7e6e",
                      width: "100%",
                    },
                  },
                  "SKIP — No Detachment",
                ),
              ),
            ),
          abAddModalOpen &&
            React.createElement(
              "div",
              {
                style: {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9999,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
                onClick: (e) => {
                  if (e.target === e.currentTarget) setAbAddModalOpen(false);
                },
              },
              React.createElement(
                "div",
                {
                  style: {
                    background: "#faf8f4",
                    borderRadius: 12,
                    padding: 20,
                    width: "90%",
                    maxWidth: 600,
                    maxHeight: "85vh",
                    overflowY: "auto",
                    border: "2px solid #d0c4aa",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 14,
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#4a6741",
                        letterSpacing: 2,
                      },
                    },
                    abEditIdx !== null
                      ? "EDIT UNIT"
                      : `ADD ${(BATTLEFIELD_ROLES[abAddSlotRole]?.label || "UNIT").toUpperCase()}`,
                  ),
                  React.createElement(
                    "button",
                    {
                      onClick: () => setAbAddModalOpen(false),
                      style: {
                        background: "none",
                        border: "none",
                        fontSize: 18,
                        cursor: "pointer",
                        color: "#8a7e6e",
                      },
                    },
                    "✕",
                  ),
                ),
                !abEditEntry
                  ? /* Unit picker filtered by role */
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 12,
                            color: "#8a7e6e",
                            fontFamily: "'Share Tech Mono', serif",
                            marginBottom: 6,
                          },
                        },
                        "Select a unit for the",
                        React.createElement(
                          "strong",
                          {
                            style: {
                              color: BATTLEFIELD_ROLES[abAddSlotRole]?.color,
                            },
                          },
                          BATTLEFIELD_ROLES[abAddSlotRole]?.label,
                        ),
                        "slot",
                      ),
                      React.createElement(
                        "div",
                        { style: { maxHeight: 400, overflowY: "auto" } },
                        getAvailableUnitsForRole(abAddSlotRole, abAddDetId).map(
                          (unit) => {
                            const pd = POINTS_DATA[unit.id];
                            return React.createElement(
                              "button",
                              {
                                key: unit.id,
                                onClick: () =>
                                  setAbEditEntry(
                                    createArmyEntry(
                                      unit,
                                      abAddDetId,
                                      abAddSlotRole,
                                    ),
                                  ),
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  width: "100%",
                                  padding: "7px 10px",
                                  marginBottom: 2,
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  background: "#fff",
                                  border: "1px solid #050705",
                                  textAlign: "left",
                                },
                                onMouseEnter: (e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(74,103,65,0.06)"),
                                onMouseLeave: (e) =>
                                  (e.currentTarget.style.background = "#fff"),
                              },
                              typeof getUnitArtwork === "function" &&
                                getUnitArtwork(unit.id, getArmy().faction)
                                ? React.createElement("img", {
                                    src: getUnitArtwork(
                                      unit.id,
                                      getArmy().faction,
                                    ),
                                    alt: "",
                                    style: {
                                      width: 120,
                                      height: 120,
                                      objectFit: "contain",
                                      background: "#1e1a14",
                                      borderRadius: 5,
                                      flexShrink: 0,
                                      border: "1px solid rgba(184,134,11,0.25)",
                                    },
                                    onError: function (e) {
                                      e.currentTarget.style.display = "none";
                                    },
                                  })
                                : null,
                              React.createElement(
                                "span",
                                {
                                  style: {
                                    fontSize: 12,
                                    color:
                                      BATTLEFIELD_ROLES[abAddSlotRole]?.color,
                                    width: 20,
                                    textAlign: "center",
                                  },
                                },
                                BATTLEFIELD_ROLES[abAddSlotRole]?.icon,
                              ),
                              React.createElement(
                                "div",
                                { style: { flex: 1 } },
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      fontFamily: "'Share Tech Mono', serif",
                                      fontWeight: 600,
                                      fontSize: 15,
                                      color: "#2a2418",
                                    },
                                  },
                                  unit.name,
                                ),
                                React.createElement(
                                  "div",
                                  { style: { fontSize: 12, color: "#8a7e6e" } },
                                  unit.models,
                                  "model",
                                  unit.models !== 1 ? "s" : "",
                                  "· BS",
                                  unit.bs,
                                  "T",
                                  unit.t,
                                  "Sv",
                                  unit.sv,
                                  "+",
                                ),
                              ),
                              React.createElement(
                                "span",
                                {
                                  style: {
                                    fontSize: 15,
                                    fontFamily: "'Share Tech Mono', serif",
                                    fontWeight: 600,
                                    color: "#4a6741",
                                  },
                                },
                                pd?.base || "?",
                                "pts",
                              ),
                            );
                          },
                        ),
                        getAvailableUnitsForRole(abAddSlotRole, abAddDetId)
                          .length === 0 &&
                          React.createElement(
                            "div",
                            {
                              style: {
                                padding: 20,
                                textAlign: "center",
                                color: "#b0a898",
                                fontSize: 13,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "No units available for this role.",
                          ),
                      ),
                    )
                  : /* Unit editor */
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#1e1a12",
                            marginBottom: 10,
                          },
                        },
                        abEditEntry.unitName,
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              color:
                                BATTLEFIELD_ROLES[abEditEntry.slotRole]?.color,
                              marginLeft: 8,
                            },
                          },
                          BATTLEFIELD_ROLES[abEditEntry.slotRole]?.icon,
                          BATTLEFIELD_ROLES[abEditEntry.slotRole]?.label,
                        ),
                      ),
                      React.createElement(
                        "div",
                        { style: { marginBottom: 10 } },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 11,
                              color: "#8a7e6e",
                              fontFamily: "'Share Tech Mono', serif",
                              letterSpacing: 1,
                              marginBottom: 3,
                            },
                          },
                          "MODELS",
                        ),
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            },
                          },
                          React.createElement(
                            "button",
                            {
                              onClick: () =>
                                setAbEditEntry((p) => ({
                                  ...p,
                                  models: Math.max(
                                    POINTS_DATA[p.unitId]?.minModels || 1,
                                    p.models - 1,
                                  ),
                                })),
                              style: {
                                padding: "3px 8px",
                                borderRadius: 4,
                                border: "1px solid #d0c4aa",
                                background: "#f0ebe2",
                                cursor: "pointer",
                                fontSize: 13,
                              },
                            },
                            "−",
                          ),
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: 700,
                                fontSize: 15,
                                minWidth: 28,
                                textAlign: "center",
                              },
                            },
                            abEditEntry.models,
                          ),
                          React.createElement(
                            "button",
                            {
                              onClick: () =>
                                setAbEditEntry((p) => ({
                                  ...p,
                                  models: Math.min(
                                    MAX_UNIT_SIZE[p.unitId] || p.models,
                                    p.models + 1,
                                  ),
                                })),
                              style: {
                                padding: "3px 8px",
                                borderRadius: 4,
                                border: "1px solid #d0c4aa",
                                background: "#f0ebe2",
                                cursor: "pointer",
                                fontSize: 13,
                              },
                            },
                            "+",
                          ),
                          React.createElement(
                            "span",
                            { style: { fontSize: 8, color: "#8a7e6e" } },
                            "(min",
                            POINTS_DATA[abEditEntry.unitId]?.minModels || 1,
                            ", max",
                            MAX_UNIT_SIZE[abEditEntry.unitId] ||
                              abEditEntry.models,
                            ")",
                          ),
                        ),
                      ),
                      getRangedWeapons(abEditEntry.unitId).length > 0 &&
                        React.createElement(
                          "div",
                          { style: { marginBottom: 10 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "#8a7e6e",
                                fontFamily: "'Share Tech Mono', serif",
                                letterSpacing: 1,
                                marginBottom: 3,
                              },
                            },
                            "PRIMARY WEAPON",
                          ),
                          React.createElement(
                            "select",
                            {
                              value: abEditEntry.weaponName || "",
                              onChange: (e) =>
                                setAbEditEntry((p) => ({
                                  ...p,
                                  weaponName: e.target.value,
                                })),
                              style: {
                                width: "100%",
                                padding: "5px 8px",
                                borderRadius: 4,
                                border: "1px solid #d0c4aa",
                                fontSize: 12,
                                fontFamily: "'Share Tech Mono', serif",
                                background: "#fff",
                              },
                            },
                            getRangedWeapons(abEditEntry.unitId).map((w) =>
                              React.createElement(
                                "option",
                                { key: w.name, value: w.name },
                                w.name,
                                "(S",
                                w.s,
                                "AP",
                                w.ap,
                                w.shots,
                                "sh)",
                                WEAPON_UPGRADE_COSTS[w.name]
                                  ? `+${WEAPON_UPGRADE_COSTS[w.name]}pts/mdl`
                                  : "free",
                              ),
                            ),
                          ),
                        ),
                      (() => {
                        const availWeapons = getRangedWeapons(
                          abEditEntry.unitId,
                        );
                        if (
                          availWeapons.length <= 1 ||
                          (abEditEntry.models || 1) <= 1
                        )
                          return null;
                        const secWeapons = abEditEntry.secondaryWeapons || [];
                        const sgtSlot = abEditEntry.sgtWeaponName ? 1 : 0;
                        const secModelsUsed = secWeapons.reduce(
                          (s, sw) => s + (sw.models || 0),
                          0,
                        );
                        const maxRemaining = Math.max(
                          0,
                          (abEditEntry.models || 1) -
                            sgtSlot -
                            secModelsUsed -
                            1,
                        ); // at least 1 model keeps primary
                        return React.createElement(
                          "div",
                          {
                            style: {
                              marginBottom: 10,
                              padding: 8,
                              borderRadius: 6,
                              background: "rgba(196,106,27,0.04)",
                              border: "1px solid rgba(196,106,27,0.15)",
                            },
                          },
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: secWeapons.length > 0 ? 6 : 0,
                              },
                            },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 11,
                                  fontFamily: "'Share Tech Mono', serif",
                                  color: "#c46a1b",
                                  letterSpacing: 1,
                                },
                              },
                              "🔫 ADDITIONAL WEAPONS",
                            ),
                            React.createElement(
                              "button",
                              {
                                onClick: () => {
                                  if (
                                    maxRemaining <= 0 &&
                                    secWeapons.length === 0
                                  )
                                    return;
                                  const alt =
                                    availWeapons.find(
                                      (w) => w.name !== abEditEntry.weaponName,
                                    ) || availWeapons[0];
                                  setAbEditEntry((p) => ({
                                    ...p,
                                    secondaryWeapons: [
                                      ...(p.secondaryWeapons || []),
                                      { weaponName: alt.name, models: 1 },
                                    ],
                                  }));
                                },
                                style: {
                                  padding: "2px 8px",
                                  borderRadius: 3,
                                  cursor: "pointer",
                                  fontSize: 8,
                                  fontFamily: "'Share Tech Mono', serif",
                                  fontWeight: 600,
                                  background: "rgba(196,106,27,0.1)",
                                  border: "1px solid rgba(196,106,27,0.3)",
                                  color: "#c46a1b",
                                },
                              },
                              "+ ADD WEAPON",
                            ),
                          ),
                          secWeapons.length === 0 &&
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 8,
                                  color: "#8a7e6e",
                                  fontStyle: "italic",
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              "Assign some models in the squad to carry different weapons. Remaining models use the primary weapon.",
                            ),
                          secWeapons.map((sw, idx) => {
                            const swDef = availWeapons.find(
                              (w) => w.name === sw.weaponName,
                            );
                            const otherSecModels = secWeapons.reduce(
                              (s, x, i) => s + (i !== idx ? x.models || 0 : 0),
                              0,
                            );
                            const thisMax = Math.max(
                              1,
                              (abEditEntry.models || 1) -
                                sgtSlot -
                                otherSecModels -
                                1,
                            );
                            return React.createElement(
                              "div",
                              {
                                key: idx,
                                style: {
                                  marginTop: 4,
                                  padding: "5px 8px",
                                  borderRadius: 4,
                                  background: "rgba(196,106,27,0.06)",
                                  border: "1px solid rgba(196,106,27,0.15)",
                                  display: "flex",
                                  gap: 6,
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                },
                              },
                              React.createElement(
                                "select",
                                {
                                  value: sw.weaponName,
                                  onChange: (e) =>
                                    setAbEditEntry((p) => ({
                                      ...p,
                                      secondaryWeapons: p.secondaryWeapons.map(
                                        (s, i) =>
                                          i === idx
                                            ? {
                                                ...s,
                                                weaponName: e.target.value,
                                              }
                                            : s,
                                      ),
                                    })),
                                  style: {
                                    flex: 1,
                                    minWidth: 100,
                                    padding: "3px 6px",
                                    borderRadius: 3,
                                    fontSize: 11,
                                    fontFamily: "'Share Tech Mono', serif",
                                    border: "1px solid rgba(196,106,27,0.3)",
                                    background: "#fff",
                                    color: "#c46a1b",
                                  },
                                },
                                availWeapons.map((w) =>
                                  React.createElement(
                                    "option",
                                    { key: w.name, value: w.name },
                                    w.name,
                                    WEAPON_UPGRADE_COSTS[w.name]
                                      ? `+${WEAPON_UPGRADE_COSTS[w.name]}pts`
                                      : "free",
                                  ),
                                ),
                              ),
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                  },
                                },
                                React.createElement(
                                  "span",
                                  {
                                    style: {
                                      fontSize: 8,
                                      fontFamily: "'Share Tech Mono', serif",
                                      color: "#6a5e4e",
                                    },
                                  },
                                  "×",
                                ),
                                React.createElement(
                                  "button",
                                  {
                                    onClick: () =>
                                      setAbEditEntry((p) => ({
                                        ...p,
                                        secondaryWeapons:
                                          p.secondaryWeapons.map((s, i) =>
                                            i === idx
                                              ? {
                                                  ...s,
                                                  models: Math.max(
                                                    1,
                                                    s.models - 1,
                                                  ),
                                                }
                                              : s,
                                          ),
                                      })),
                                    style: {
                                      width: 18,
                                      height: 18,
                                      borderRadius: 2,
                                      border: "1px solid #d0c4aa",
                                      background: "#f0ebe2",
                                      cursor: "pointer",
                                      fontSize: 11,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    },
                                  },
                                  "−",
                                ),
                                React.createElement(
                                  "span",
                                  {
                                    style: {
                                      fontFamily: "'Share Tech Mono', serif",
                                      fontWeight: 700,
                                      fontSize: 11,
                                      minWidth: 16,
                                      textAlign: "center",
                                    },
                                  },
                                  sw.models,
                                ),
                                React.createElement(
                                  "button",
                                  {
                                    onClick: () =>
                                      setAbEditEntry((p) => ({
                                        ...p,
                                        secondaryWeapons:
                                          p.secondaryWeapons.map((s, i) =>
                                            i === idx
                                              ? {
                                                  ...s,
                                                  models: Math.min(
                                                    thisMax,
                                                    s.models + 1,
                                                  ),
                                                }
                                              : s,
                                          ),
                                      })),
                                    style: {
                                      width: 18,
                                      height: 18,
                                      borderRadius: 2,
                                      border: "1px solid #d0c4aa",
                                      background: "#f0ebe2",
                                      cursor: "pointer",
                                      fontSize: 11,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    },
                                  },
                                  "+",
                                ),
                                React.createElement(
                                  "span",
                                  { style: { fontSize: 7, color: "#8a7e6e" } },
                                  "mdl",
                                ),
                              ),
                              swDef &&
                                React.createElement(
                                  "span",
                                  {
                                    style: {
                                      fontSize: 8,
                                      color: "#6a5e4e",
                                      fontFamily: "'Share Tech Mono', serif",
                                    },
                                  },
                                  "S",
                                  swDef.s,
                                  "AP",
                                  swDef.ap,
                                  WEAPON_UPGRADE_COSTS[sw.weaponName]
                                    ? `= +${WEAPON_UPGRADE_COSTS[sw.weaponName] * sw.models}pts`
                                    : "",
                                ),
                              React.createElement(
                                "button",
                                {
                                  onClick: () =>
                                    setAbEditEntry((p) => ({
                                      ...p,
                                      secondaryWeapons:
                                        p.secondaryWeapons.filter(
                                          (_, i) => i !== idx,
                                        ),
                                    })),
                                  style: {
                                    padding: "1px 5px",
                                    borderRadius: 2,
                                    cursor: "pointer",
                                    fontSize: 8,
                                    background: "rgba(199,64,64,0.08)",
                                    border: "1px solid rgba(199,64,64,0.2)",
                                    color: "#c74040",
                                    marginLeft: "auto",
                                  },
                                },
                                "✕",
                              ),
                            );
                          }),
                          secWeapons.length > 0 &&
                            React.createElement(
                              "div",
                              {
                                style: {
                                  marginTop: 4,
                                  fontSize: 8,
                                  color: "#6a5e4e",
                                  fontStyle: "italic",
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              Math.max(
                                0,
                                (abEditEntry.models || 1) -
                                  sgtSlot -
                                  secModelsUsed,
                              ),
                              "model",
                              Math.max(
                                0,
                                (abEditEntry.models || 1) -
                                  sgtSlot -
                                  secModelsUsed,
                              ) !== 1
                                ? "s"
                                : "",
                              "with primary weapon",
                              abEditEntry.sgtWeaponName ? `, 1 Sergeant` : "",
                            ),
                        );
                      })(),
                      (() => {
                        const up = UNIT_PRESETS.flatMap((c) => c.units).find(
                          (u) => u.id === abEditEntry.unitId,
                        );
                        if (!up?.hasSgt) return null;
                        const sgtW =
                          SERGEANT_WEAPONS[
                            getSgtCategory(abEditEntry.unitId)
                          ] || [];
                        if (!sgtW.length) return null;
                        return React.createElement(
                          "div",
                          { style: { marginBottom: 10 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "#8a7e6e",
                                fontFamily: "'Share Tech Mono', serif",
                                letterSpacing: 1,
                                marginBottom: 3,
                              },
                            },
                            "SERGEANT WEAPON",
                          ),
                          React.createElement(
                            "select",
                            {
                              value: abEditEntry.sgtWeaponName || "",
                              onChange: (e) =>
                                setAbEditEntry((p) => ({
                                  ...p,
                                  sgtWeaponName: e.target.value || null,
                                })),
                              style: {
                                width: "100%",
                                padding: "5px 8px",
                                borderRadius: 4,
                                border: "1px solid #d0c4aa",
                                fontSize: 12,
                                fontFamily: "'Share Tech Mono', serif",
                                background: "#fff",
                              },
                            },
                            React.createElement(
                              "option",
                              { value: "" },
                              "— Default —",
                            ),
                            sgtW.map((w) =>
                              React.createElement(
                                "option",
                                { key: w.name, value: w.name },
                                w.name,
                                "(S",
                                w.s,
                                "AP",
                                w.ap,
                                ")",
                                WEAPON_UPGRADE_COSTS[w.name]
                                  ? `+${WEAPON_UPGRADE_COSTS[w.name]}pts`
                                  : "",
                              ),
                            ),
                          ),
                        );
                      })(),
                      canTakeEquipment(abEditEntry.unitId) &&
                        React.createElement(
                          "div",
                          { style: { marginBottom: 10 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "#8a7e6e",
                                fontFamily: "'Share Tech Mono', serif",
                                letterSpacing: 1,
                                marginBottom: 3,
                              },
                            },
                            "EQUIPMENT",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 4,
                              },
                            },
                            Object.entries(EQUIPMENT_OPTIONS).map(
                              ([key, eq]) => {
                                if (!canTakeEquipment(abEditEntry.unitId, key))
                                  return null;
                                const checked =
                                  abEditEntry.equipment?.[key] || false;
                                return React.createElement(
                                  "label",
                                  {
                                    key: key,
                                    style: {
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 3,
                                      padding: "3px 6px",
                                      borderRadius: 3,
                                      fontSize: 11,
                                      cursor: "pointer",
                                      background: checked
                                        ? "rgba(74,103,65,0.1)"
                                        : "#f0ebe2",
                                      border: `1px solid ${checked ? "#4a6741" : "#d0c4aa"}`,
                                      color: checked ? "#4a6741" : "#8a7e6e",
                                    },
                                  },
                                  React.createElement("input", {
                                    type: "checkbox",
                                    checked: checked,
                                    onChange: (e) =>
                                      setAbEditEntry((p) => ({
                                        ...p,
                                        equipment: {
                                          ...p.equipment,
                                          [key]: e.target.checked,
                                        },
                                      })),
                                    style: { marginRight: 1 },
                                  }),
                                  eq.icon,
                                  eq.label,
                                  React.createElement(
                                    "span",
                                    { style: { fontSize: 8, opacity: 0.8 } },
                                    "(",
                                    eq.perModel
                                      ? `${eq.cost}/mdl`
                                      : `${eq.cost}pts`,
                                    ")",
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                      (() => {
                        const armyFaction = getArmy().faction;
                        const opts = getWargearOptions(
                          abEditEntry.unitId,
                          armyFaction,
                        );
                        if (opts.length === 0) return null;
                        const wo = abEditEntry.wargearOptions || {};
                        return React.createElement(
                          "div",
                          {
                            style: {
                              marginBottom: 10,
                              padding: 8,
                              borderRadius: 6,
                              background: "rgba(139,101,8,0.04)",
                              border: "1px solid rgba(139,101,8,0.15)",
                            },
                          },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                fontFamily: "'Share Tech Mono', serif",
                                color: "#8b6508",
                                letterSpacing: 1,
                                marginBottom: 5,
                              },
                            },
                            "⚔ WARGEAR OPTIONS",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 3,
                              },
                            },
                            opts.map((opt, idx) => {
                              const checked = !!wo[idx];
                              // Handle exclusive groups: if this option belongs to an exclusive group, uncheck others in the group
                              const handleToggle = (e) => {
                                const newVal = e.target.checked;
                                setAbEditEntry((p) => {
                                  const newWo = { ...p.wargearOptions };
                                  if (newVal && opt.exclusive) {
                                    // Uncheck other options in the same exclusive group
                                    opts.forEach((o, i) => {
                                      if (
                                        o.exclusive === opt.exclusive &&
                                        i !== idx
                                      )
                                        newWo[i] = false;
                                    });
                                  }
                                  newWo[idx] = newVal;
                                  return { ...p, wargearOptions: newWo };
                                });
                              };
                              const costStr =
                                opt.cost === 0
                                  ? "free"
                                  : opt.perModel
                                    ? `+${opt.cost}pts/mdl`
                                    : `+${opt.cost}pts`;
                              const totalCost = opt.perModel
                                ? opt.cost * (abEditEntry.models || 1)
                                : opt.cost;
                              const isFirstLegion =
                                opt.legion &&
                                (idx === 0 || !opts[idx - 1]?.legion);
                              return React.createElement(
                                React.Fragment,
                                { key: idx },
                                isFirstLegion &&
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        fontSize: 8,
                                        fontFamily: "'Share Tech Mono', serif",
                                        color: "#7a5a9a",
                                        letterSpacing: 1,
                                        marginTop: 4,
                                        marginBottom: 2,
                                        borderTop:
                                          "1px solid rgba(120,90,154,0.25)",
                                        paddingTop: 4,
                                      },
                                    },
                                    "⚜ LEGION WARGEAR",
                                  ),
                                React.createElement(
                                  "label",
                                  {
                                    style: {
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                      padding: "3px 6px",
                                      borderRadius: 3,
                                      fontSize: 11,
                                      cursor: "pointer",
                                      background: checked
                                        ? opt.legion
                                          ? "rgba(120,90,154,0.10)"
                                          : "rgba(139,101,8,0.08)"
                                        : "#f8f4ec",
                                      border: `1px solid ${checked ? (opt.legion ? "#7a5a9a" : "#8b6508") : "#e0d8c8"}`,
                                      color: checked
                                        ? opt.legion
                                          ? "#7a5a9a"
                                          : "#8b6508"
                                        : "#6a5e4e",
                                    },
                                  },
                                  React.createElement("input", {
                                    type: "checkbox",
                                    checked: checked,
                                    onChange: handleToggle,
                                    style: { marginRight: 1 },
                                  }),
                                  React.createElement(
                                    "span",
                                    { style: { flex: 1 } },
                                    opt.label,
                                  ),
                                  React.createElement(
                                    "span",
                                    {
                                      style: {
                                        fontSize: 8,
                                        opacity: 0.7,
                                        whiteSpace: "nowrap",
                                      },
                                    },
                                    costStr,
                                    opt.perModel && checked
                                      ? ` = ${totalCost}pts`
                                      : "",
                                  ),
                                ),
                              );
                            }),
                          ),
                        );
                      })(),
                      (() => {
                        // Determine if this entry is in a prime-eligible position
                        const entryRole =
                          abEditEntry.slotRole ||
                          UNIT_BATTLEFIELD_ROLE[abEditEntry.unitId];
                        let slotIsPrime = false;
                        if (abEditIdx !== null) {
                          // Editing existing entry — check its position
                          slotIsPrime = isEntryPrimeEligible(abEditEntry);
                        } else {
                          // New entry — check how many already exist for this role in this det
                          const existingCount = getArmy().entries.filter(
                            (e) =>
                              e.detachmentId === abEditEntry.detachmentId &&
                              (e.slotRole ||
                                UNIT_BATTLEFIELD_ROLE[e.unitId]) === entryRole,
                          ).length;
                          slotIsPrime = isSlotPrimeForEntry(
                            abEditEntry.detachmentId,
                            entryRole,
                            existingCount,
                          );
                        }
                        if (!slotIsPrime) return null;
                        const availPAs =
                          getAvailablePrimeAdvantages(abEditEntry);
                        return React.createElement(
                          "div",
                          {
                            style: {
                              marginBottom: 10,
                              padding: 10,
                              borderRadius: 6,
                              background: "rgba(212,175,55,0.06)",
                              border: "1.5px solid rgba(212,175,55,0.3)",
                            },
                          },
                          React.createElement(
                            "label",
                            {
                              style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                cursor: "pointer",
                                fontFamily: "'Share Tech Mono', serif",
                                fontSize: 12,
                                color: "#b8860b",
                                fontWeight: 700,
                                marginBottom: 6,
                              },
                            },
                            React.createElement("input", {
                              type: "checkbox",
                              checked: abEditEntry.isPrime || false,
                              onChange: (e) =>
                                setAbEditEntry((p) => ({
                                  ...p,
                                  isPrime: e.target.checked,
                                  primeAdvantage: e.target.checked
                                    ? p.primeAdvantage
                                    : null,
                                  logisticalRole: e.target.checked
                                    ? p.logisticalRole
                                    : null,
                                })),
                            }),
                            "★ DESIGNATE AS PRIME",
                          ),
                          abEditEntry.isPrime &&
                            React.createElement(
                              React.Fragment,
                              null,
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    fontSize: 8,
                                    color: "#8a7e6e",
                                    fontFamily: "'Share Tech Mono', serif",
                                    marginBottom: 4,
                                    lineHeight: 1.4,
                                  },
                                },
                                "Select a Prime Advantage for this unit. Filling a Prime Slot unlocks powerful bonuses.",
                              ),
                              React.createElement(
                                "select",
                                {
                                  value: abEditEntry.primeAdvantage || "",
                                  onChange: (e) =>
                                    setAbEditEntry((p) => ({
                                      ...p,
                                      primeAdvantage: e.target.value || null,
                                      logisticalRole: null,
                                    })),
                                  style: {
                                    width: "100%",
                                    padding: "5px 8px",
                                    borderRadius: 4,
                                    border: "1px solid #d4af37",
                                    fontSize: 12,
                                    fontFamily: "'Share Tech Mono', serif",
                                    background: "#fff",
                                    color: "#2a2418",
                                  },
                                },
                                React.createElement(
                                  "option",
                                  { value: "" },
                                  "— Select Prime Advantage —",
                                ),
                                React.createElement(
                                  "optgroup",
                                  { label: "Core Advantages" },
                                  availPAs
                                    .filter((pa) => pa.source === "core")
                                    .map((pa) =>
                                      React.createElement(
                                        "option",
                                        { key: pa.id, value: pa.id },
                                        pa.name,
                                        "—",
                                        pa.desc,
                                      ),
                                    ),
                                ),
                                availPAs.some(
                                  (pa) => pa.source === "allegiance",
                                ) &&
                                  React.createElement(
                                    "optgroup",
                                    { label: "Allegiance Advantages" },
                                    availPAs
                                      .filter(
                                        (pa) => pa.source === "allegiance",
                                      )
                                      .map((pa) =>
                                        React.createElement(
                                          "option",
                                          { key: pa.id, value: pa.id },
                                          pa.name,
                                          "—",
                                          pa.desc,
                                        ),
                                      ),
                                  ),
                                availPAs.some((pa) => pa.source === "legion") &&
                                  React.createElement(
                                    "optgroup",
                                    {
                                      label: `${LEGION_FACTIONS.find((f) => f.id === getArmy().faction)?.name || "Legion"} Advantages`,
                                    },
                                    availPAs
                                      .filter((pa) => pa.source === "legion")
                                      .map((pa) =>
                                        React.createElement(
                                          "option",
                                          { key: pa.id, value: pa.id },
                                          pa.name,
                                          "—",
                                          pa.desc,
                                        ),
                                      ),
                                  ),
                              ),
                              abEditEntry.primeAdvantage &&
                                (() => {
                                  const allPAs = [
                                    ...PRIME_ADVANTAGES,
                                    ...ALLEGIANCE_PRIME_ADVANTAGES,
                                    ...(LEGION_PRIME_ADVANTAGES[
                                      getArmy().faction
                                    ] || []),
                                  ];
                                  const pa = allPAs.find(
                                    (p) => p.id === abEditEntry.primeAdvantage,
                                  );
                                  if (!pa) return null;
                                  return React.createElement(
                                    "div",
                                    {
                                      style: {
                                        marginTop: 6,
                                        padding: "5px 8px",
                                        borderRadius: 4,
                                        background: "rgba(212,175,55,0.08)",
                                        border:
                                          "1px solid rgba(212,175,55,0.2)",
                                      },
                                    },
                                    React.createElement(
                                      "div",
                                      {
                                        style: {
                                          fontFamily:
                                            "'Share Tech Mono', serif",
                                          fontWeight: 700,
                                          fontSize: 12,
                                          color: "#b8860b",
                                        },
                                      },
                                      "⭐",
                                      pa.name,
                                    ),
                                    React.createElement(
                                      "div",
                                      {
                                        style: {
                                          fontSize: 8,
                                          color: "#6a5e4e",
                                          fontStyle: "italic",
                                          lineHeight: 1.4,
                                        },
                                      },
                                      pa.desc,
                                    ),
                                    pa.addsSlot &&
                                      React.createElement(
                                        "div",
                                        { style: { marginTop: 4 } },
                                        React.createElement(
                                          "div",
                                          {
                                            style: {
                                              fontSize: 8,
                                              color: "#4a6741",
                                              fontWeight: 600,
                                              marginBottom: 2,
                                            },
                                          },
                                          "◆ Select the Battlefield Role for the extra slot:",
                                        ),
                                        React.createElement(
                                          "select",
                                          {
                                            value:
                                              abEditEntry.logisticalRole || "",
                                            onChange: (e) =>
                                              setAbEditEntry((p) => ({
                                                ...p,
                                                logisticalRole:
                                                  e.target.value || null,
                                              })),
                                            style: {
                                              width: "100%",
                                              padding: "4px 6px",
                                              borderRadius: 3,
                                              fontSize: 11,
                                              fontFamily:
                                                "'Share Tech Mono', serif",
                                              border: "1px solid #4a6741",
                                              background: "#fff",
                                            },
                                          },
                                          React.createElement(
                                            "option",
                                            { value: "" },
                                            "— Select Role —",
                                          ),
                                          Object.entries(BATTLEFIELD_ROLES)
                                            .filter(
                                              ([key]) =>
                                                !LOGISTICAL_EXCLUDED_ROLES.includes(
                                                  key,
                                                ),
                                            )
                                            .map(([key, role]) =>
                                              React.createElement(
                                                "option",
                                                { key: key, value: key },
                                                role.icon,
                                                role.label,
                                              ),
                                            ),
                                        ),
                                      ),
                                  );
                                })(),
                            ),
                        );
                      })(),
                      (abEditEntry.slotRole === "high_command" ||
                        abEditEntry.slotRole === "warlord") &&
                        React.createElement(
                          "label",
                          {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              cursor: "pointer",
                              padding: "5px 8px",
                              borderRadius: 4,
                              marginBottom: 10,
                              background: abEditEntry.isWarlord
                                ? "rgba(212,175,55,0.12)"
                                : "#f0ebe2",
                              border: `1px solid ${abEditEntry.isWarlord ? "#d4af37" : "#d0c4aa"}`,
                              fontFamily: "'Share Tech Mono', serif",
                              fontSize: 12,
                              color: abEditEntry.isWarlord
                                ? "#b8860b"
                                : "#8a7e6e",
                            },
                          },
                          React.createElement("input", {
                            type: "checkbox",
                            checked: abEditEntry.isWarlord,
                            onChange: (e) =>
                              setAbEditEntry((p) => ({
                                ...p,
                                isWarlord: e.target.checked,
                              })),
                          }),
                          "👑 Designate as Warlord",
                        ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            padding: "6px 10px",
                            borderRadius: 6,
                            background: "rgba(74,103,65,0.08)",
                            border: "1px solid rgba(74,103,65,0.2)",
                            marginBottom: 12,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#4a6741",
                            textAlign: "center",
                          },
                        },
                        calcArmyEntryPoints(abEditEntry),
                        "POINTS",
                      ),
                      React.createElement(
                        "div",
                        { style: { display: "flex", gap: 6 } },
                        abEditIdx === null &&
                          React.createElement(
                            "button",
                            {
                              onClick: () => setAbEditEntry(null),
                              style: {
                                padding: "6px 14px",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontFamily: "'Share Tech Mono', serif",
                                fontSize: 12,
                                background: "#f0ebe2",
                                border: "1px solid #d0c4aa",
                                color: "#8a7e6e",
                              },
                            },
                            "← BACK",
                          ),
                        React.createElement(
                          "button",
                          {
                            onClick: () => {
                              const entryToSave = { ...abEditEntry };
                              const isNewEntry = abEditIdx === null;
                              const entryRole =
                                entryToSave.slotRole ||
                                UNIT_BATTLEFIELD_ROLE[entryToSave.unitId];
                              if (abEditIdx !== null) {
                                setArmy((prev) => ({
                                  ...prev,
                                  entries: prev.entries.map((e, i) =>
                                    i === abEditIdx ? entryToSave : e,
                                  ),
                                }));
                              } else {
                                setArmy((prev) => ({
                                  ...prev,
                                  entries: [...prev.entries, entryToSave],
                                }));
                              }
                              setAbAddModalOpen(false);
                              setAbEditEntry(null);
                              setAbEditIdx(null);
                              // Auto-open detachment picker when adding new High Command or Command
                              if (isNewEntry && entryRole === "high_command") {
                                setTimeout(
                                  () => setAbShowApexPicker(entryToSave.id),
                                  100,
                                );
                              } else if (
                                isNewEntry &&
                                entryRole === "command"
                              ) {
                                setTimeout(
                                  () => setAbShowAuxPicker(entryToSave.id),
                                  100,
                                );
                              }
                            },
                            style: {
                              flex: 1,
                              padding: "6px 14px",
                              borderRadius: 6,
                              cursor: "pointer",
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 700,
                              fontSize: 11,
                              letterSpacing: 1,
                              background:
                                armyBuilderSide === "loyalist"
                                  ? "rgba(42,111,180,0.15)"
                                  : "rgba(155,45,45,0.15)",
                              border: `1.5px solid ${armyBuilderSide === "loyalist" ? "#2a6fb4" : "#9b2d2d"}`,
                              color:
                                armyBuilderSide === "loyalist"
                                  ? "#2a6fb4"
                                  : "#9b2d2d",
                            },
                          },
                          abEditIdx !== null ? "💾 SAVE" : "✓ ADD TO ARMY",
                        ),
                      ),
                    ),
              ),
            ),
        ),
      activePhase === "deployment" &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 12 } },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                React.createElement("span", { style: { fontSize: 16 } }, "📍"),
                React.createElement(
                  "span",
                  {
                    style: {
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#5b4a8a",
                      letterSpacing: 2,
                    },
                  },
                  "DEPLOYMENT — 6' × 4' TABLE",
                ),
              ),
              React.createElement(
                "div",
                { style: { display: "flex", gap: 6, alignItems: "center" } },
                React.createElement(
                  "span",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#8a7e6e",
                    },
                  },
                  "Zoom:",
                ),
                [6, 8, 10, 12, 14].map((z) =>
                  React.createElement(
                    "button",
                    {
                      key: z,
                      onClick: () => setDeployScale(z),
                      style: {
                        padding: "3px 7px",
                        borderRadius: 3,
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: deployScale === z ? 700 : 400,
                        background:
                          deployScale === z
                            ? "rgba(91,74,138,0.12)"
                            : "#f0ebe2",
                        border: `1px solid ${deployScale === z ? "#5b4a8a" : "#d0c4aa"}`,
                        color: deployScale === z ? "#5b4a8a" : "#8a7e6e",
                      },
                    },
                    z,
                    "px",
                  ),
                ),
              ),
            ),
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginTop: 8,
                  flexWrap: "wrap",
                },
              },
              React.createElement(CheckToggle, {
                checked: deployShowGrid,
                label: "Grid Lines",
                onChange: setDeployShowGrid,
              }),
              React.createElement(CheckToggle, {
                checked: deployShowZones,
                label: "Deploy Zones",
                onChange: setDeployShowZones,
              }),
            ),
            React.createElement(
              "div",
              {
                style: {
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: "1px solid #e8e0d0",
                },
              },
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: 11,
                    fontFamily: "'Share Tech Mono', serif",
                    color: "#8a7e6e",
                    letterSpacing: 2,
                    marginBottom: 6,
                  },
                },
                "MISSION TYPE",
              ),
              React.createElement(
                "div",
                { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
                Object.values(MISSIONS).map((m) => {
                  const active = missionType === m.id;
                  return React.createElement(
                    "button",
                    {
                      key: m.id,
                      onClick: () => setMissionType(m.id),
                      style: {
                        padding: "6px 14px",
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: active ? 700 : 400,
                        letterSpacing: 1,
                        background: active ? "rgba(91,74,138,0.15)" : "#f8f4ec",
                        border: `1.5px solid ${active ? "#5b4a8a" : "#d0c4aa"}`,
                        color: active ? "#5b4a8a" : "#6a5e4e",
                      },
                    },
                    m.name,
                  );
                }),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    marginTop: 6,
                    fontSize: 13,
                    color: "#6a5e4e",
                    fontFamily: "'Share Tech Mono', serif",
                    fontStyle: "italic",
                  },
                },
                MISSIONS[missionType]?.desc,
              ),
            ),
            missionType === "zm" &&
              (() => {
                const zmInfo = ZM_MISSIONS_INFO[zmMission];
                return React.createElement(
                  "div",
                  {
                    style: {
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: "1px solid #e8e0d0",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#7a5a9a",
                        letterSpacing: 2,
                        marginBottom: 6,
                      },
                    },
                    "⬡ ZONE MORTALIS MISSION",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginBottom: 8,
                      },
                    },
                    Object.entries(ZM_MISSIONS_INFO).map(([k, m]) => {
                      const active = zmMission === k;
                      return React.createElement(
                        "button",
                        {
                          key: k,
                          onClick: () => setZmMission(k),
                          style: {
                            padding: "6px 14px",
                            borderRadius: 6,
                            fontSize: 12,
                            cursor: "pointer",
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: active ? 700 : 400,
                            letterSpacing: 1,
                            background: active
                              ? "rgba(120,80,200,0.2)"
                              : "#f8f4ec",
                            border:
                              "1.5px solid " + (active ? "#7a5a9a" : "#d0c4aa"),
                            color: active ? "#5b3a8a" : "#6a5e4e",
                          },
                        },
                        m.name,
                      );
                    }),
                  ),
                  zmInfo &&
                    React.createElement(
                      "div",
                      {
                        style: {
                          background: "rgba(120,80,200,0.06)",
                          border: "1px solid rgba(120,80,200,0.2)",
                          borderRadius: 6,
                          padding: "10px 12px",
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#5b3a8a",
                            marginBottom: 3,
                          },
                        },
                        zmInfo.name,
                        "—",
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontWeight: 400,
                              fontSize: 12,
                              color: "#8a7060",
                            },
                          },
                          zmInfo.config,
                        ),
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            fontStyle: "italic",
                            color: "#5a4e3e",
                            marginBottom: 6,
                          },
                        },
                        zmInfo.desc,
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#8a7e6e",
                            letterSpacing: 1,
                            marginBottom: 3,
                          },
                        },
                        "MISSION SPECIAL RULES",
                      ),
                      zmInfo.special.map((r, i) =>
                        React.createElement(
                          "div",
                          {
                            key: i,
                            style: {
                              fontSize: 12,
                              fontFamily: "'Share Tech Mono', serif",
                              color: "#5a4e3e",
                              marginBottom: 2,
                            },
                          },
                          "•",
                          r,
                        ),
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#8a7e6e",
                            letterSpacing: 1,
                            marginTop: 6,
                            marginBottom: 3,
                          },
                        },
                        "SECONDARY OBJECTIVES",
                      ),
                      zmInfo.secondary.map((r, i) =>
                        React.createElement(
                          "div",
                          {
                            key: i,
                            style: {
                              fontSize: 12,
                              fontFamily: "'Share Tech Mono', serif",
                              color: "#5a4e3e",
                              marginBottom: 2,
                            },
                          },
                          "•",
                          r,
                        ),
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            marginTop: 8,
                            paddingTop: 6,
                            borderTop: "1px solid rgba(120,80,200,0.2)",
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#7a5a9a",
                            letterSpacing: 1,
                          },
                        },
                        "SECTION RULES —",
                        React.createElement(
                          "span",
                          { style: { color: "#6a5e4e", fontWeight: 400 } },
                          "α = Confined Space (8) · β = Confined Space (6)",
                        ),
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            marginTop: 6,
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#7a5a9a",
                            letterSpacing: 1,
                            marginBottom: 4,
                          },
                        },
                        "SECTION STATUS CONTROLS",
                      ),
                      React.createElement(
                        "div",
                        {
                          style: { display: "flex", gap: 4, flexWrap: "wrap" },
                        },
                        zmSections.map((sec, idx) => {
                          const col = idx % 4;
                          const row = Math.floor(idx / 4);
                          const secTypes = ZM_SECTION_TYPES[zmMission] || [];
                          const baseType = secTypes[idx]?.type || "normal";
                          return React.createElement(
                            "div",
                            {
                              key: idx,
                              style: {
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                                padding: "4px 6px",
                                borderRadius: 4,
                                minWidth: 44,
                                background: sec.abyssal
                                  ? "rgba(40,10,80,0.15)"
                                  : baseType === "alpha"
                                    ? "rgba(120,80,200,0.08)"
                                    : baseType === "beta"
                                      ? "rgba(60,140,200,0.08)"
                                      : "rgba(80,180,80,0.06)",
                                border:
                                  "1px solid " +
                                  (sec.abyssal
                                    ? "rgba(150,80,220,0.4)"
                                    : "rgba(180,160,220,0.3)"),
                              },
                            },
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 8,
                                  fontFamily: "'Share Tech Mono', serif",
                                  color: "#8a7e6e",
                                },
                              },
                              "S",
                              idx + 1,
                              "R",
                              row + 1,
                              "C",
                              col + 1,
                            ),
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 11,
                                  color:
                                    baseType === "alpha"
                                      ? "#7a5a9a"
                                      : baseType === "beta"
                                        ? "#4a7aaa"
                                        : "#5a8a5a",
                                  fontFamily: "'Share Tech Mono',serif",
                                },
                              },
                              baseType === "alpha"
                                ? "α"
                                : baseType === "beta"
                                  ? "β"
                                  : "○",
                            ),
                            React.createElement(
                              "button",
                              {
                                onClick: () =>
                                  setZmSections((prev) =>
                                    prev.map((s, i) =>
                                      i === idx
                                        ? { ...s, abyssal: !s.abyssal }
                                        : s,
                                    ),
                                  ),
                                style: {
                                  padding: "1px 4px",
                                  fontSize: 7,
                                  borderRadius: 2,
                                  cursor: "pointer",
                                  background: sec.abyssal
                                    ? "rgba(150,80,220,0.2)"
                                    : "rgba(200,200,200,0.2)",
                                  border:
                                    "1px solid " +
                                    (sec.abyssal ? "#9a50cc" : "#c0b4a0"),
                                  color: sec.abyssal ? "#9a50cc" : "#8a7e6e",
                                  fontFamily: "'Share Tech Mono',serif",
                                },
                              },
                              sec.abyssal ? "DARK" : "lit",
                            ),
                          );
                        }),
                      ),
                      React.createElement(
                        "div",
                        { style: { display: "flex", gap: 6, marginTop: 8 } },
                        React.createElement(
                          "button",
                          {
                            onClick: () =>
                              setZmSections((prev) =>
                                prev.map((s) => ({
                                  ...s,
                                  abyssal: false,
                                  confinedX: null,
                                })),
                              ),
                            style: {
                              padding: "4px 10px",
                              fontSize: 9,
                              borderRadius: 4,
                              cursor: "pointer",
                              fontFamily: "'Share Tech Mono',serif",
                              background: "rgba(200,50,50,0.08)",
                              border: "1px solid #c74040",
                              color: "#c74040",
                            },
                          },
                          "RESET ALL SECTIONS",
                        ),
                        zmMission === "sector_sweep" &&
                          React.createElement(
                            "button",
                            {
                              onClick: () => {
                                const rolls = Array.from(
                                  { length: 16 },
                                  (_, i) => {
                                    const roll = Math.ceil(Math.random() * 6);
                                    return {
                                      sec: i,
                                      roll,
                                      result: roll === 1 ? "DARK" : "lit",
                                    };
                                  },
                                );
                                setZmSections((prev) =>
                                  prev.map((s, i) => ({
                                    ...s,
                                    abyssal: rolls[i].roll === 1,
                                  })),
                                );
                                setZmRollLog({ type: "conduits", rolls });
                              },
                              style: {
                                padding: "4px 10px",
                                fontSize: 9,
                                borderRadius: 4,
                                cursor: "pointer",
                                fontFamily: "'Share Tech Mono',serif",
                                background: "rgba(120,80,200,0.1)",
                                border: "1px solid #7a5a9a",
                                color: "#7a5a9a",
                              },
                            },
                            "🎲 ROLL FAILING CONDUITS",
                          ),
                        zmMission === "signal_influx" &&
                          React.createElement(
                            "button",
                            {
                              onClick: () => {
                                const positions = [];
                                while (positions.length < 3) {
                                  const h = Math.ceil(Math.random() * 3);
                                  const v = Math.ceil(Math.random() * 3);
                                  const key = h + "," + v;
                                  if (!positions.find((p) => p.key === key))
                                    positions.push({ key, h, v });
                                }
                                const beaconRolls = positions.map((p, i) => ({
                                  sec: i,
                                  roll: p.h + "/" + p.v,
                                  result:
                                    "H" +
                                    p.h +
                                    " V" +
                                    p.v +
                                    " → (" +
                                    p.h * 12 +
                                    '", ' +
                                    p.v * 12 +
                                    '")',
                                }));
                                setZmRollLog({
                                  type: "beacons",
                                  rolls: beaconRolls,
                                });
                              },
                              style: {
                                padding: "4px 10px",
                                fontSize: 9,
                                borderRadius: 4,
                                cursor: "pointer",
                                fontFamily: "'Share Tech Mono',serif",
                                background: "rgba(60,140,200,0.1)",
                                border: "1px solid #4a7aaa",
                                color: "#4a7aaa",
                              },
                            },
                            "🎲 ROLL BEACON POSITIONS",
                          ),
                        zmMission === "signal_influx" &&
                          React.createElement(
                            "button",
                            {
                              onClick: () => {
                                const rolls = Array.from(
                                  { length: 16 },
                                  (_, i) => {
                                    const roll = Math.ceil(Math.random() * 6);
                                    let result;
                                    if (roll === 1) result = "DARK";
                                    else result = "CS(" + roll + ")";
                                    return { sec: i, roll, result };
                                  },
                                );
                                setZmSections((prev) =>
                                  prev.map((s, i) => ({
                                    ...s,
                                    abyssal: rolls[i].roll === 1,
                                    confinedX:
                                      rolls[i].roll >= 2 ? rolls[i].roll : null,
                                  })),
                                );
                                setZmRollLog({ type: "crumbling", rolls });
                              },
                              style: {
                                padding: "4px 10px",
                                fontSize: 9,
                                borderRadius: 4,
                                cursor: "pointer",
                                fontFamily: "'Share Tech Mono',serif",
                                background: "rgba(100,160,80,0.1)",
                                border: "1px solid #5a8a40",
                                color: "#5a8a40",
                              },
                            },
                            "🎲 ROLL CRUMBLING SUPERSTRUCTURE",
                          ),
                      ),
                      zmRollLog &&
                        (() => {
                          const isConduits = zmRollLog.type === "conduits";
                          const isCrumbling = zmRollLog.type === "crumbling";
                          const isBeacons = zmRollLog.type === "beacons";
                          const titles = {
                            conduits:
                              "⚡ FAILING POWER CONDUITS — ROLL RESULTS",
                            crumbling:
                              "🏚 CRUMBLING SUPERSTRUCTURE — ROLL RESULTS",
                            beacons: "📡 BEACON POSITIONS — D3 ROLLS",
                          };
                          return React.createElement(
                            "div",
                            {
                              style: {
                                marginTop: 10,
                                padding: "8px 10px",
                                background: "rgba(10,5,25,0.7)",
                                border: "1px solid rgba(150,120,220,0.4)",
                                borderRadius: 6,
                              },
                            },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: 6,
                                },
                              },
                              React.createElement(
                                "span",
                                {
                                  style: {
                                    fontSize: 9,
                                    fontFamily: "'Share Tech Mono',serif",
                                    color: "rgba(180,150,255,0.9)",
                                    letterSpacing: 2,
                                  },
                                },
                                titles[zmRollLog.type],
                              ),
                              React.createElement(
                                "button",
                                {
                                  onClick: () => setZmRollLog(null),
                                  style: {
                                    background: "none",
                                    border: "none",
                                    color: "rgba(180,150,255,0.5)",
                                    cursor: "pointer",
                                    fontSize: 10,
                                    padding: 0,
                                  },
                                },
                                "✕",
                              ),
                            ),
                            (isConduits || isCrumbling) &&
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4,1fr)",
                                    gap: 3,
                                  },
                                },
                                zmRollLog.rolls.map((r, i) => {
                                  const col = i % 4;
                                  const row = Math.floor(i / 4);
                                  const isDark = r.result === "DARK";
                                  const isCS =
                                    r.result && r.result.startsWith("CS");
                                  return React.createElement(
                                    "div",
                                    {
                                      key: i,
                                      style: {
                                        padding: "4px 5px",
                                        borderRadius: 4,
                                        textAlign: "center",
                                        background: isDark
                                          ? "rgba(100,20,180,0.35)"
                                          : isCS
                                            ? "rgba(80,180,80,0.15)"
                                            : "rgba(60,60,60,0.3)",
                                        border:
                                          "1px solid " +
                                          (isDark
                                            ? "rgba(150,80,220,0.6)"
                                            : isCS
                                              ? "rgba(80,180,80,0.4)"
                                              : "rgba(100,100,100,0.3)"),
                                      },
                                    },
                                    React.createElement(
                                      "div",
                                      {
                                        style: {
                                          fontSize: 7,
                                          fontFamily: "'Share Tech Mono',serif",
                                          color: "rgba(200,200,200,0.5)",
                                          marginBottom: 1,
                                        },
                                      },
                                      "S",
                                      i + 1,
                                      "R",
                                      row + 1,
                                      "C",
                                      col + 1,
                                    ),
                                    React.createElement(
                                      "div",
                                      {
                                        style: {
                                          fontSize: 14,
                                          fontFamily: "'Share Tech Mono',serif",
                                          fontWeight: 700,
                                          lineHeight: 1,
                                          color: isDark
                                            ? "rgba(200,100,255,1)"
                                            : isCS
                                              ? "rgba(120,220,120,1)"
                                              : "rgba(160,200,160,0.8)",
                                        },
                                      },
                                      r.roll,
                                    ),
                                    React.createElement(
                                      "div",
                                      {
                                        style: {
                                          fontSize: 8,
                                          fontFamily: "'Share Tech Mono',serif",
                                          marginTop: 1,
                                          color: isDark
                                            ? "rgba(200,100,255,0.9)"
                                            : isCS
                                              ? "rgba(120,220,120,0.8)"
                                              : "rgba(160,200,160,0.6)",
                                        },
                                      },
                                      r.result,
                                    ),
                                  );
                                }),
                              ),
                            isBeacons &&
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                  },
                                },
                                zmRollLog.rolls.map((r, i) =>
                                  React.createElement(
                                    "div",
                                    {
                                      key: i,
                                      style: {
                                        display: "flex",
                                        gap: 8,
                                        alignItems: "center",
                                        padding: "4px 8px",
                                        background: "rgba(60,140,200,0.15)",
                                        borderRadius: 4,
                                        border:
                                          "1px solid rgba(80,160,220,0.3)",
                                      },
                                    },
                                    React.createElement(
                                      "span",
                                      {
                                        style: {
                                          fontSize: 11,
                                          fontFamily: "'Share Tech Mono',serif",
                                          fontWeight: 700,
                                          color: "rgba(100,200,255,1)",
                                          minWidth: 28,
                                        },
                                      },
                                      "D3:",
                                      r.roll,
                                    ),
                                    React.createElement(
                                      "span",
                                      {
                                        style: {
                                          fontSize: 10,
                                          fontFamily: "'Share Tech Mono',serif",
                                          color: "rgba(180,220,255,0.9)",
                                        },
                                      },
                                      r.result,
                                    ),
                                  ),
                                ),
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      fontSize: 9,
                                      fontFamily: "'Share Tech Mono',serif",
                                      fontStyle: "italic",
                                      color: "rgba(150,200,255,0.7)",
                                      marginTop: 2,
                                    },
                                  },
                                  "Place one 2VP beacon at each intersection. Remove all at end of turn.",
                                ),
                              ),
                            (isConduits || isCrumbling) &&
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    marginTop: 5,
                                    fontSize: 9,
                                    fontFamily: "'Share Tech Mono',serif",
                                    fontStyle: "italic",
                                    color: "rgba(180,150,255,0.6)",
                                  },
                                },
                                isConduits
                                  ? "Roll 1 = Abyssal Darkness until end of next Player Turn."
                                  : "Roll 1 = Abyssal Darkness · Roll 2–6 = Confined Space (X) for battle duration.",
                              ),
                          );
                        })(),
                    ),
                );
              })(),
            React.createElement(
              "div",
              {
                style: {
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: "1px solid #e8e0d0",
                },
              },
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: 11,
                    fontFamily: "'Share Tech Mono', serif",
                    color: "#8a7e6e",
                    letterSpacing: 2,
                    marginBottom: 6,
                  },
                },
                "OBJECTIVE MARKERS",
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  },
                },
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, alignItems: "center" } },
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#8a7e6e",
                      },
                    },
                    "VP VALUE:",
                  ),
                  [2, 3].map((v) =>
                    React.createElement(
                      "button",
                      {
                        key: v,
                        onClick: () => setObjValue(v),
                        style: {
                          padding: "4px 10px",
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: "pointer",
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: objValue === v ? 700 : 400,
                          background:
                            objValue === v
                              ? "rgba(184,134,11,0.15)"
                              : "#f0ebe2",
                          border: `1.5px solid ${objValue === v ? "#b8860b" : "#d0c4aa"}`,
                          color: objValue === v ? "#b8860b" : "#6a5e4e",
                        },
                      },
                      v,
                      "VP",
                    ),
                  ),
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => setPlacingObjective(!placingObjective),
                    style: {
                      padding: "5px 14px",
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      letterSpacing: 1,
                      background: placingObjective
                        ? "rgba(184,134,11,0.2)"
                        : "rgba(184,134,11,0.08)",
                      border: `1.5px solid ${placingObjective ? "#b8860b" : "#d0c4aa"}`,
                      color: placingObjective ? "#b8860b" : "#6a5e4e",
                      animation: placingObjective
                        ? "pulseGold 1.5s ease-in-out infinite"
                        : "none",
                    },
                  },
                  placingObjective
                    ? "⊕ CLICK MAP TO PLACE..."
                    : "⊕ PLACE OBJECTIVE",
                ),
                objectiveMarkers.length > 0 &&
                  React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                      "div",
                      { style: { display: "flex", gap: 4, flexWrap: "wrap" } },
                      objectiveMarkers.map((o) =>
                        React.createElement(
                          "span",
                          {
                            key: o.id,
                            style: {
                              fontSize: 11,
                              fontFamily: "'Share Tech Mono', serif",
                              padding: "3px 7px",
                              borderRadius: 3,
                              background: "rgba(255,215,0,0.15)",
                              border: "1px solid rgba(184,134,11,0.3)",
                              color: "#8b6508",
                            },
                          },
                          o.label,
                          "(",
                          o.value,
                          "VP)",
                          React.createElement(
                            "button",
                            {
                              onClick: () =>
                                setObjectiveMarkers((prev) =>
                                  prev.filter((x) => x.id !== o.id),
                                ),
                              style: {
                                marginLeft: 4,
                                background: "none",
                                border: "none",
                                color: "#c74040",
                                cursor: "pointer",
                                fontSize: 11,
                                padding: 0,
                              },
                            },
                            "✕",
                          ),
                        ),
                      ),
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: () => {
                          setObjectiveMarkers([]);
                          setObjCounter(1);
                        },
                        style: {
                          padding: "3px 10px",
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: "pointer",
                          fontFamily: "'Share Tech Mono', serif",
                          background: "rgba(200,50,50,0.08)",
                          border: "1px solid #c74040",
                          color: "#c74040",
                        },
                      },
                      "CLEAR ALL ✕",
                    ),
                  ),
              ),
              placingObjective &&
                React.createElement(
                  "div",
                  {
                    style: {
                      marginTop: 4,
                      fontSize: 12,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#b8860b",
                      fontStyle: "italic",
                    },
                  },
                  "Click anywhere on the map to place a",
                  objValue,
                  'VP objective. Click on an existing marker to remove it. Press "Place Objective" again to cancel.',
                ),
            ),
            React.createElement(
              "div",
              {
                style: {
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: "1px solid #e8e0d0",
                },
              },
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: 11,
                    fontFamily: "'Share Tech Mono', serif",
                    color: "#4a7a3a",
                    letterSpacing: 2,
                    marginBottom: 6,
                  },
                },
                "TERRAIN",
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap",
                    marginBottom: 8,
                  },
                },
                TERRAIN_TYPES.map((tt) => {
                  const active = selectedTerrainType === tt.id;
                  return React.createElement(
                    "button",
                    {
                      key: tt.id,
                      onClick: () => {
                        setSelectedTerrainType(tt.id);
                      },
                      title: tt.desc,
                      style: {
                        padding: "5px 10px",
                        borderRadius: 5,
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: active ? 700 : 400,
                        letterSpacing: 0.5,
                        background: active ? tt.bg : "#f4f0e8",
                        border: `2px solid ${active ? tt.border : "#d0c4aa"}`,
                        color: active ? tt.color : "#6a5e4e",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        boxShadow: active ? `0 0 6px ${tt.bg}` : "none",
                      },
                    },
                    React.createElement(
                      "span",
                      { style: { fontSize: 12 } },
                      tt.symbol,
                    ),
                    tt.label,
                  );
                }),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginBottom: 8,
                  },
                },
                React.createElement(
                  "span",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#6a5e4e",
                    },
                  },
                  "SIZE:",
                ),
                TERRAIN_SIZES.map((sz) => {
                  const isActive =
                    terrainSize.w === sz.w && terrainSize.h === sz.h;
                  return React.createElement(
                    "button",
                    {
                      key: sz.label,
                      onClick: () => setTerrainSize({ w: sz.w, h: sz.h }),
                      style: {
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: isActive ? 700 : 400,
                        background: isActive
                          ? "rgba(74,122,58,0.15)"
                          : "#f0ebe2",
                        border: `1.5px solid ${isActive ? "#4a7a3a" : "#d0c4aa"}`,
                        color: isActive ? "#4a7a3a" : "#6a5e4e",
                      },
                    },
                    sz.label,
                  );
                }),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  },
                },
                React.createElement(
                  "button",
                  {
                    onClick: () => {
                      setPlacingTerrain(!placingTerrain);
                      setPlacingObjective(false);
                    },
                    style: {
                      padding: "5px 14px",
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      letterSpacing: 1,
                      background: placingTerrain
                        ? "rgba(74,122,58,0.2)"
                        : "rgba(74,122,58,0.08)",
                      border: `1.5px solid ${placingTerrain ? "#4a7a3a" : "#d0c4aa"}`,
                      color: placingTerrain ? "#4a7a3a" : "#6a5e4e",
                      animation: placingTerrain
                        ? "pulseGold 1.5s ease-in-out infinite"
                        : "none",
                    },
                  },
                  placingTerrain
                    ? `${TERRAIN_TYPES.find((t) => t.id === selectedTerrainType)?.symbol} CLICK MAP TO PLACE...`
                    : `${TERRAIN_TYPES.find((t) => t.id === selectedTerrainType)?.symbol} PLACE TERRAIN`,
                ),
                terrainPieces.length > 0 &&
                  React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                      "div",
                      { style: { display: "flex", gap: 4, flexWrap: "wrap" } },
                      terrainPieces.map((tp) => {
                        const ttype = TERRAIN_TYPES.find(
                          (t) => t.id === tp.type,
                        );
                        return React.createElement(
                          "span",
                          {
                            key: tp.id,
                            style: {
                              fontSize: 11,
                              fontFamily: "'Share Tech Mono', serif",
                              padding: "3px 7px",
                              borderRadius: 3,
                              background: tp.bg,
                              border: `1px solid ${tp.border}`,
                              color: tp.color,
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                            },
                          },
                          ttype?.symbol,
                          tp.label,
                          "(",
                          tp.w,
                          "″×",
                          tp.h,
                          "″)",
                          React.createElement(
                            "button",
                            {
                              onClick: () => removeTerrainPiece(tp.id),
                              style: {
                                background: "none",
                                border: "none",
                                color: "#c74040",
                                cursor: "pointer",
                                fontSize: 11,
                                padding: 0,
                              },
                            },
                            "✕",
                          ),
                        );
                      }),
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: () => {
                          setTerrainPieces([]);
                          setTerrainCounter(1);
                        },
                        style: {
                          padding: "3px 10px",
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: "pointer",
                          fontFamily: "'Share Tech Mono', serif",
                          background: "rgba(200,50,50,0.08)",
                          border: "1px solid #c74040",
                          color: "#c74040",
                        },
                      },
                      "CLEAR ALL ✕",
                    ),
                  ),
              ),
              placingTerrain &&
                React.createElement(
                  "div",
                  {
                    style: {
                      marginTop: 4,
                      fontSize: 12,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#4a7a3a",
                      fontStyle: "italic",
                    },
                  },
                  "Placing:",
                  React.createElement(
                    "strong",
                    null,
                    TERRAIN_TYPES.find((t) => t.id === selectedTerrainType)
                      ?.label,
                  ),
                  "(",
                  terrainSize.w,
                  "″×",
                  terrainSize.h,
                  "″) — click on the map. Click a placed terrain piece to remove it. Press the button again to cancel.",
                ),
              !placingTerrain &&
                React.createElement(
                  "div",
                  {
                    style: {
                      marginTop: 4,
                      fontSize: 12,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#8a7e6e",
                      fontStyle: "italic",
                    },
                  },
                  TERRAIN_TYPES.find((t) => t.id === selectedTerrainType)?.desc,
                ),
            ),
          ),
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 12 } },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 10,
                },
              },
              React.createElement(
                "span",
                {
                  style: {
                    fontSize: 11,
                    fontFamily: "'Share Tech Mono', serif",
                    color: "#8a7e6e",
                    letterSpacing: 1,
                  },
                },
                "PLACING FOR:",
              ),
              [
                { id: "p1", label: "LOYALIST", col: "#9b2d2d" },
                { id: "p2", label: "TRAITORS", col: "#2a6fb4" },
              ].map((p) =>
                React.createElement(
                  "button",
                  {
                    key: p.id,
                    onClick: () => setDeployPlayer(p.id),
                    style: {
                      padding: "5px 14px",
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      letterSpacing: 1,
                      background:
                        deployPlayer === p.id
                          ? p.id === "p1"
                            ? "rgba(155,45,45,0.12)"
                            : "rgba(42,111,180,0.12)"
                          : "#f0ebe2",
                      border: `1.5px solid ${deployPlayer === p.id ? p.col : "#d0c4aa"}`,
                      color: deployPlayer === p.id ? p.col : "#8a7e6e",
                    },
                  },
                  p.label,
                ),
              ),
              React.createElement("div", { style: { flex: 1 } }),
              React.createElement(
                "button",
                {
                  onClick: () => setDeployedUnits([]),
                  style: {
                    padding: "4px 12px",
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    background: "rgba(200,50,50,0.08)",
                    border: "1.5px solid #c74040",
                    color: "#c74040",
                  },
                },
                "CLEAR ALL ✕",
              ),
            ),
            (() => {
              const sideArmy =
                deployPlayer === "p1" ? loyalistArmy : traitorArmy;
              const hasArmyEntries =
                sideArmy.entries && sideArmy.entries.length > 0;
              // Track which army entries are already deployed
              const deployedIds = deployedUnits
                .filter((u) => u.player === deployPlayer)
                .map((u) => u.armyEntryId)
                .filter(Boolean);
              if (!hasArmyEntries) return null;
              return React.createElement(
                "div",
                {
                  style: {
                    marginBottom: 12,
                    padding: 10,
                    borderRadius: 8,
                    background: "rgba(74,103,65,0.04)",
                    border: "1.5px solid rgba(74,103,65,0.2)",
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#4a6741",
                      letterSpacing: 2,
                      marginBottom: 8,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    },
                  },
                  React.createElement("span", { style: { fontSize: 13 } }, "⚜"),
                  "ARMY ROSTER —",
                  sideArmy.allegiance?.toUpperCase(),
                  LEGION_FACTIONS.find((f) => f.id === sideArmy.faction)
                    ?.name || "",
                  React.createElement(
                    "span",
                    {
                      style: { fontSize: 8, color: "#8a7e6e", fontWeight: 400 },
                    },
                    "(",
                    sideArmy.entries.length,
                    "units ·",
                    sideArmy.entries.reduce(
                      (s, e) => s + calcArmyEntryPoints(e),
                      0,
                    ),
                    "pts)",
                  ),
                ),
                React.createElement(
                  "div",
                  { style: { marginBottom: 8 } },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 8,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#8b6508",
                        letterSpacing: 1,
                        marginBottom: 3,
                        fontWeight: 700,
                      },
                    },
                    "⚜ PRIMARY DETACHMENT",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      },
                    },
                    sideArmy.entries
                      .filter((e) => e.detachmentId === "primary")
                      .map((entry) => {
                        const isDeployed = deployedIds.includes(entry.id);
                        const role =
                          BATTLEFIELD_ROLES[
                            entry.slotRole ||
                              UNIT_BATTLEFIELD_ROLE[entry.unitId]
                          ];
                        const pts = calcArmyEntryPoints(entry);
                        const unitPreset = UNIT_PRESETS.flatMap(
                          (c) => c.units,
                        ).find((u) => u.id === entry.unitId);
                        return React.createElement(
                          "button",
                          {
                            key: entry.id,
                            disabled: isDeployed,
                            onClick: () => {
                              if (!unitPreset || isDeployed) return;
                              // Set brush unit from army entry with all configured weapons/equipment
                              setDeployBrushUnit(unitPreset);
                              setDeployBrushModels(entry.models);
                              const rw = getRangedWeapons(entry.unitId);
                              setDeployBrushRangedWeapon(
                                rw.find((w) => w.name === entry.weaponName) ||
                                  (rw.length > 0 ? rw[0] : null),
                              );
                              const mw = MELEE_getRangedWeapons(entry.unitId);
                              setDeployBrushMeleeWeapon(
                                mw.length > 0 ? mw[0] : null,
                              );
                              // Carry over secondary weapons from army entry
                              if (
                                entry.secondaryWeapons &&
                                entry.secondaryWeapons.length > 0
                              ) {
                                setDeployBrushSecondaryWeapons(
                                  entry.secondaryWeapons
                                    .map((sw) => {
                                      const wDef =
                                        rw.find(
                                          (w) => w.name === sw.weaponName,
                                        ) || rw[0];
                                      return {
                                        weapon: wDef,
                                        models: sw.models || 1,
                                      };
                                    })
                                    .filter((sw) => sw.weapon),
                                );
                              } else {
                                setDeployBrushSecondaryWeapons([]);
                              }
                              const sgtCat = getSgtCategory(entry.unitId);
                              setDeployBrushSgtEnabled(!!entry.sgtWeaponName);
                              const sgtW = sgtCat
                                ? SERGEANT_WEAPONS[sgtCat] || []
                                : [];
                              setDeployBrushSgtWeapon(
                                entry.sgtWeaponName
                                  ? sgtW.find(
                                      (w) => w.name === entry.sgtWeaponName,
                                    ) || (sgtW.length > 0 ? sgtW[0] : null)
                                  : sgtW.length > 0
                                    ? sgtW[0]
                                    : null,
                              );
                              setDeployBrushEquipment(
                                entry.equipment || {
                                  vexilla: false,
                                  noxVox: false,
                                  metaBomb: false,
                                  bayonet: false,
                                  chainBayonet: false,
                                },
                              );
                              // Tag the brush with the army entry id so we can mark it deployed
                              setDeployBrushArmyEntryId(entry.id);
                              setDeploySelectedUnit(null);
                            },
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "5px 8px",
                              borderRadius: 4,
                              cursor: isDeployed ? "default" : "pointer",
                              textAlign: "left",
                              background: isDeployed
                                ? "rgba(0,0,0,0.03)"
                                : deployBrushArmyEntryId === entry.id
                                  ? "rgba(74,103,65,0.1)"
                                  : "#fff",
                              border:
                                deployBrushArmyEntryId === entry.id
                                  ? "1.5px solid #4a6741"
                                  : "1px solid #050705",
                              opacity: isDeployed ? 0.45 : 1,
                            },
                          },
                          typeof getUnitArtwork === "function" &&
                            getUnitArtwork(entry.unitId, sideArmy.faction)
                            ? React.createElement("img", {
                                src: getUnitArtwork(
                                  entry.unitId,
                                  sideArmy.faction,
                                ),
                                alt: "",
                                style: {
                                  width: 120,
                                  height: 120,
                                  objectFit: "contain",
                                  background: "#1e1a14",
                                  borderRadius: 4,
                                  flexShrink: 0,
                                  border: "1px solid rgba(184,134,11,0.2)",
                                },
                                onError: function (e) {
                                  e.currentTarget.style.display = "none";
                                },
                              })
                            : null,
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 12,
                                color: role?.color,
                                width: 16,
                                textAlign: "center",
                              },
                            },
                            role?.icon,
                          ),
                          React.createElement(
                            "div",
                            { style: { flex: 1, minWidth: 0 } },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontFamily: "'Share Tech Mono', serif",
                                  fontWeight: 600,
                                  fontSize: 15,
                                  color: "#2a2418",
                                  display: "flex",
                                  gap: 4,
                                  alignItems: "center",
                                },
                              },
                              entry.unitName,
                              entry.isWarlord &&
                                React.createElement(
                                  "span",
                                  { style: { fontSize: 8 } },
                                  "👑",
                                ),
                              isDeployed &&
                                React.createElement(
                                  "span",
                                  {
                                    style: {
                                      fontSize: 7,
                                      color: "#4a6741",
                                      background: "rgba(74,103,65,0.1)",
                                      padding: "1px 4px",
                                      borderRadius: 2,
                                    },
                                  },
                                  "DEPLOYED",
                                ),
                            ),
                            React.createElement(
                              "div",
                              { style: { fontSize: 12, color: "#8a7e6e" } },
                              entry.models,
                              "mdl",
                              entry.weaponName ? ` · ${entry.weaponName}` : "",
                              entry.secondaryWeapons &&
                                entry.secondaryWeapons.length > 0
                                ? entry.secondaryWeapons
                                    .map(
                                      (sw) =>
                                        ` · +${sw.models}× ${sw.weaponName}`,
                                    )
                                    .join("")
                                : "",
                              entry.sgtWeaponName
                                ? ` · Sgt:${entry.sgtWeaponName}`
                                : "",
                              formatWargear(entry),
                            ),
                          ),
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: 700,
                                fontSize: 15,
                                color: "#4a6741",
                              },
                            },
                            pts,
                            "pts",
                          ),
                        );
                      }),
                  ),
                ),
                sideArmy.detachments &&
                  sideArmy.detachments.map((det) => {
                    const detDef =
                      AUXILIARY_DETACHMENTS[det.type] ||
                      APEX_DETACHMENTS[det.type];
                    if (!detDef) return null;
                    const detEntries = sideArmy.entries.filter(
                      (e) => e.detachmentId === det.id,
                    );
                    if (detEntries.length === 0) return null;
                    const isApex = !!APEX_DETACHMENTS[det.type];
                    const borderColor = isApex ? "#d4af37" : "#4a6741";
                    return React.createElement(
                      "div",
                      { key: det.id, style: { marginBottom: 8 } },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 8,
                            fontFamily: "'Share Tech Mono', serif",
                            color: borderColor,
                            letterSpacing: 1,
                            marginBottom: 3,
                            fontWeight: 700,
                          },
                        },
                        isApex ? "🔱" : "⚙",
                        detDef.name.toUpperCase(),
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          },
                        },
                        detEntries.map((entry) => {
                          const isDeployed = deployedIds.includes(entry.id);
                          const role =
                            BATTLEFIELD_ROLES[
                              entry.slotRole ||
                                UNIT_BATTLEFIELD_ROLE[entry.unitId]
                            ];
                          const pts = calcArmyEntryPoints(entry);
                          const unitPreset = UNIT_PRESETS.flatMap(
                            (c) => c.units,
                          ).find((u) => u.id === entry.unitId);
                          return React.createElement(
                            "button",
                            {
                              key: entry.id,
                              disabled: isDeployed,
                              onClick: () => {
                                if (!unitPreset || isDeployed) return;
                                setDeployBrushUnit(unitPreset);
                                setDeployBrushModels(entry.models);
                                const rw = getRangedWeapons(entry.unitId);
                                setDeployBrushRangedWeapon(
                                  rw.find((w) => w.name === entry.weaponName) ||
                                    (rw.length > 0 ? rw[0] : null),
                                );
                                const mw = MELEE_getRangedWeapons(entry.unitId);
                                setDeployBrushMeleeWeapon(
                                  mw.length > 0 ? mw[0] : null,
                                );
                                // Carry over secondary weapons from army entry
                                if (
                                  entry.secondaryWeapons &&
                                  entry.secondaryWeapons.length > 0
                                ) {
                                  setDeployBrushSecondaryWeapons(
                                    entry.secondaryWeapons
                                      .map((sw) => {
                                        const wDef =
                                          rw.find(
                                            (w) => w.name === sw.weaponName,
                                          ) || rw[0];
                                        return {
                                          weapon: wDef,
                                          models: sw.models || 1,
                                        };
                                      })
                                      .filter((sw) => sw.weapon),
                                  );
                                } else {
                                  setDeployBrushSecondaryWeapons([]);
                                }
                                const sgtCat = getSgtCategory(entry.unitId);
                                setDeployBrushSgtEnabled(!!entry.sgtWeaponName);
                                const sgtW = sgtCat
                                  ? SERGEANT_WEAPONS[sgtCat] || []
                                  : [];
                                setDeployBrushSgtWeapon(
                                  entry.sgtWeaponName
                                    ? sgtW.find(
                                        (w) => w.name === entry.sgtWeaponName,
                                      ) || (sgtW.length > 0 ? sgtW[0] : null)
                                    : sgtW.length > 0
                                      ? sgtW[0]
                                      : null,
                                );
                                setDeployBrushEquipment(
                                  entry.equipment || {
                                    vexilla: false,
                                    noxVox: false,
                                    metaBomb: false,
                                    bayonet: false,
                                    chainBayonet: false,
                                  },
                                );
                                setDeployBrushArmyEntryId(entry.id);
                                setDeploySelectedUnit(null);
                              },
                              style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "5px 8px",
                                borderRadius: 4,
                                cursor: isDeployed ? "default" : "pointer",
                                textAlign: "left",
                                background: isDeployed
                                  ? "rgba(0,0,0,0.03)"
                                  : deployBrushArmyEntryId === entry.id
                                    ? `rgba(${isApex ? "212,175,55" : "74,103,65"},0.1)`
                                    : "#fff",
                                border:
                                  deployBrushArmyEntryId === entry.id
                                    ? `1.5px solid ${borderColor}`
                                    : "1px solid #050705",
                                opacity: isDeployed ? 0.45 : 1,
                              },
                            },
                            typeof getUnitArtwork === "function" &&
                              getUnitArtwork(entry.unitId, sideArmy.faction)
                              ? React.createElement("img", {
                                  src: getUnitArtwork(
                                    entry.unitId,
                                    sideArmy.faction,
                                  ),
                                  alt: "",
                                  style: {
                                    width: 120,
                                    height: 120,
                                    objectFit: "contain",
                                    background: "#1e1a14",
                                    borderRadius: 4,
                                    flexShrink: 0,
                                    border: "1px solid rgba(184,134,11,0.2)",
                                  },
                                  onError: function (e) {
                                    e.currentTarget.style.display = "none";
                                  },
                                })
                              : null,
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 12,
                                  color: role?.color,
                                  width: 16,
                                  textAlign: "center",
                                },
                              },
                              role?.icon,
                            ),
                            React.createElement(
                              "div",
                              { style: { flex: 1, minWidth: 0 } },
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    fontFamily: "'Share Tech Mono', serif",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    color: "#2a2418",
                                    display: "flex",
                                    gap: 4,
                                    alignItems: "center",
                                  },
                                },
                                entry.unitName,
                                isDeployed &&
                                  React.createElement(
                                    "span",
                                    {
                                      style: {
                                        fontSize: 7,
                                        color: "#4a6741",
                                        background: "rgba(74,103,65,0.1)",
                                        padding: "1px 4px",
                                        borderRadius: 2,
                                      },
                                    },
                                    "DEPLOYED",
                                  ),
                              ),
                              React.createElement(
                                "div",
                                { style: { fontSize: 12, color: "#8a7e6e" } },
                                entry.models,
                                "mdl",
                                entry.weaponName
                                  ? ` · ${entry.weaponName}`
                                  : "",
                                entry.secondaryWeapons &&
                                  entry.secondaryWeapons.length > 0
                                  ? entry.secondaryWeapons
                                      .map(
                                        (sw) =>
                                          ` · +${sw.models}× ${sw.weaponName}`,
                                      )
                                      .join("")
                                  : "",
                                entry.sgtWeaponName
                                  ? ` · Sgt:${entry.sgtWeaponName}`
                                  : "",
                                formatWargear(entry),
                              ),
                            ),
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontFamily: "'Share Tech Mono', serif",
                                  fontWeight: 700,
                                  fontSize: 15,
                                  color: "#4a6741",
                                },
                              },
                              pts,
                              "pts",
                            ),
                          );
                        }),
                      ),
                    );
                  }),
              );
            })(),
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 11,
                  fontFamily: "'Share Tech Mono', serif",
                  color: "#8a7e6e",
                  letterSpacing: 1,
                  marginBottom: 6,
                },
              },
              "SELECT UNIT FROM ROSTER OR QUICK-PLACE BY TYPE",
            ),
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: 8,
                  alignItems: "stretch",
                  marginBottom: 10,
                },
              },
              React.createElement(
                "button",
                {
                  onClick: () => setDeployModalOpen(true),
                  style: {
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: deployBrushUnit
                      ? `rgba(${deployPlayer === "p1" ? "155,45,45" : "42,111,180"},0.06)`
                      : "#f8f4ec",
                    border: `2px dashed ${deployBrushUnit ? (deployPlayer === "p1" ? "#9b2d2d" : "#2a6fb4") : "#c0b498"}`,
                    transition: "all 0.15s ease",
                  },
                },
                deployBrushUnit
                  ? React.createElement(
                      React.Fragment,
                      null,
                      React.createElement(
                        "div",
                        {
                          style: {
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 4,
                            fontSize: 18,
                            background:
                              deployPlayer === "p1"
                                ? "rgba(200,60,60,0.85)"
                                : "rgba(50,120,200,0.85)",
                            color: "#fff",
                          },
                        },
                        DEPLOY_UNIT_TYPES.find(
                          (t) => t.id === getUnitIconType(deployBrushUnit.name),
                        )?.symbol || "╬",
                      ),
                      React.createElement(
                        "div",
                        { style: { textAlign: "left", flex: 1 } },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 700,
                              fontSize: 12,
                              color: "#2a2418",
                            },
                          },
                          deployBrushUnit.name,
                        ),
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 11,
                              color: "#8a7e6e",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "T",
                          deployBrushUnit.t,
                          "· W",
                          deployBrushUnit.w,
                          "· Sv",
                          deployBrushUnit.sv,
                          deployBrushUnit.inv && deployBrushUnit.inv !== "-"
                            ? ` · Inv${deployBrushUnit.inv}`
                            : "",
                        ),
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          },
                        },
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              fontFamily: "'Share Tech Mono', serif",
                              color: "#8a7e6e",
                            },
                          },
                          "Models:",
                        ),
                        React.createElement(
                          "button",
                          {
                            onClick: (e) => {
                              e.stopPropagation();
                              setDeployBrushModels((prev) =>
                                Math.max(1, prev - 1),
                              );
                            },
                            style: {
                              width: 22,
                              height: 22,
                              borderRadius: 3,
                              border: "1px solid #d0c4aa",
                              background: "#f0ebe2",
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#5b4a8a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            },
                          },
                          "−",
                        ),
                        React.createElement("input", {
                          type: "number",
                          value: deployBrushModels,
                          min: 1,
                          max: 40,
                          onClick: (e) => e.stopPropagation(),
                          onChange: (e) =>
                            setDeployBrushModels(
                              Math.max(
                                1,
                                Math.min(40, parseInt(e.target.value) || 1),
                              ),
                            ),
                          style: {
                            width: 38,
                            textAlign: "center",
                            padding: "2px 0",
                            borderRadius: 4,
                            border: "1.5px solid #5b4a8a",
                            fontSize: 13,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            color: "#5b4a8a",
                            background: "rgba(91,74,138,0.06)",
                          },
                        }),
                        React.createElement(
                          "button",
                          {
                            onClick: (e) => {
                              e.stopPropagation();
                              setDeployBrushModels((prev) =>
                                Math.min(40, prev + 1),
                              );
                            },
                            style: {
                              width: 22,
                              height: 22,
                              borderRadius: 3,
                              border: "1px solid #d0c4aa",
                              background: "#f0ebe2",
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#5b4a8a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            },
                          },
                          "+",
                        ),
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            marginLeft: 4,
                            fontFamily: "'Share Tech Mono', serif",
                            fontSize: 11,
                            color: "#5b4a8a",
                            letterSpacing: 1,
                          },
                        },
                        "CHANGE ▸",
                      ),
                    )
                  : React.createElement(
                      "div",
                      { style: { flex: 1, textAlign: "center" } },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#5b4a8a",
                            letterSpacing: 1,
                          },
                        },
                        "📋 OPEN UNIT ROSTER",
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 11,
                            color: "#a09888",
                            fontFamily: "'Share Tech Mono', serif",
                          },
                        },
                        "Choose from all HH 3rd Edition units",
                      ),
                    ),
              ),
              deployBrushUnit &&
                React.createElement(
                  "button",
                  {
                    onClick: () => setDeployBrushUnit(null),
                    style: {
                      padding: "6px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                      background: "#f0ebe2",
                      border: "1.5px solid #d0c4aa",
                      color: "#8a7e6e",
                      fontFamily: "'Share Tech Mono', serif",
                      fontSize: 11,
                    },
                  },
                  "✕",
                ),
            ),
            deployBrushUnit &&
              (deployRangedWeapons.length > 0 ||
                deployMeleeWeapons.length > 0 ||
                deploySgtCategory) &&
              React.createElement(
                "div",
                {
                  style: {
                    padding: 10,
                    borderRadius: 6,
                    marginBottom: 8,
                    background: "rgba(91,74,138,0.03)",
                    border: "1px solid rgba(91,74,138,0.12)",
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    },
                  },
                  React.createElement(
                    "label",
                    {
                      style: {
                        fontSize: 11,
                        color: "#7a5a9a",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily: "'Share Tech Mono', serif",
                        whiteSpace: "nowrap",
                      },
                    },
                    "⚜ Legion",
                  ),
                  React.createElement(
                    "select",
                    {
                      value: deployFaction,
                      onChange: (e) => setDeployFaction(e.target.value),
                      style: {
                        flex: 1,
                        padding: "4px 7px",
                        borderRadius: 5,
                        fontSize: 12,
                        fontFamily: "'Share Tech Mono', serif",
                        border: "1px solid rgba(120,90,154,0.5)",
                        background: "#faf8f4",
                        color: "#2a2418",
                        cursor: "pointer",
                      },
                    },
                    LEGION_FACTIONS.map((f) =>
                      React.createElement(
                        "option",
                        { key: f.id, value: f.id },
                        f.name,
                      ),
                    ),
                  ),
                ),
                deployRangedWeapons.length > 0 &&
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginBottom:
                          deployMeleeWeapons.length > 0 || deploySgtCategory
                            ? 8
                            : 0,
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 11,
                          fontFamily: "'Share Tech Mono', serif",
                          color: "#b8860b",
                          letterSpacing: 1,
                          marginBottom: 4,
                        },
                      },
                      "🔫 RANGED WEAPON",
                    ),
                    React.createElement(
                      "div",
                      { style: { display: "flex", gap: 3, flexWrap: "wrap" } },
                      deployRangedWeapons.map((w, i) => {
                        const active = deployBrushRangedWeapon?.name === w.name;
                        return React.createElement(
                          "button",
                          {
                            key: i,
                            onClick: () =>
                              setDeployBrushRangedWeapon(active ? null : w),
                            style: {
                              padding: "4px 8px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: 11,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: active ? 700 : 400,
                              background: active
                                ? w.isLegion
                                  ? "rgba(120,90,154,0.15)"
                                  : "rgba(184,134,11,0.12)"
                                : "#f8f4ec",
                              border: `1.5px solid ${active ? (w.isLegion ? "#7a5a9a" : "#b8860b") : "#e0d8c8"}`,
                              color: active
                                ? w.isLegion
                                  ? "#7a5a9a"
                                  : "#b8860b"
                                : "#6a5e4e",
                            },
                          },
                          w.name,
                          w.isLegion &&
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 7,
                                  marginLeft: 3,
                                  color: "#7a5a9a",
                                },
                              },
                              "⚜",
                            ),
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 8,
                                color: "#8a7e6e",
                                marginLeft: 3,
                              },
                            },
                            "S",
                            w.s,
                            "AP",
                            w.ap,
                          ),
                        );
                      }),
                    ),
                  ),
                deployMeleeWeapons.length > 0 &&
                  React.createElement(
                    "div",
                    { style: { marginBottom: deploySgtCategory ? 8 : 0 } },
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 11,
                          fontFamily: "'Share Tech Mono', serif",
                          color: "#9b2d2d",
                          letterSpacing: 1,
                          marginBottom: 4,
                        },
                      },
                      "🗡 MELEE WEAPON",
                    ),
                    React.createElement(
                      "div",
                      { style: { display: "flex", gap: 3, flexWrap: "wrap" } },
                      React.createElement(
                        "button",
                        {
                          onClick: () => setDeployBrushMeleeWeapon(null),
                          style: {
                            padding: "4px 8px",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: !deployBrushMeleeWeapon ? 700 : 400,
                            background: !deployBrushMeleeWeapon
                              ? "rgba(138,126,110,0.15)"
                              : "#f8f4ec",
                            border: `1.5px solid ${!deployBrushMeleeWeapon ? "#8a7e6e" : "#e0d8c8"}`,
                            color: !deployBrushMeleeWeapon
                              ? "#4a4030"
                              : "#8a7e6e",
                          },
                        },
                        "None",
                      ),
                      deployMeleeWeapons.map((w, i) => {
                        const active = deployBrushMeleeWeapon?.name === w.name;
                        return React.createElement(
                          "button",
                          {
                            key: i,
                            onClick: () => setDeployBrushMeleeWeapon(w),
                            style: {
                              padding: "4px 8px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: 11,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: active ? 700 : 400,
                              background: active
                                ? w.isLegion
                                  ? "rgba(120,90,154,0.15)"
                                  : "rgba(155,45,45,0.12)"
                                : "#f8f4ec",
                              border: `1.5px solid ${active ? (w.isLegion ? "#7a5a9a" : "#9b2d2d") : "#e0d8c8"}`,
                              color: active
                                ? w.isLegion
                                  ? "#7a5a9a"
                                  : "#9b2d2d"
                                : "#6a5e4e",
                            },
                          },
                          w.name,
                          w.isLegion &&
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 7,
                                  marginLeft: 3,
                                  color: "#7a5a9a",
                                },
                              },
                              "⚜",
                            ),
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 8,
                                color: "#8a7e6e",
                                marginLeft: 3,
                              },
                            },
                            "S",
                            w.s,
                            "AP",
                            w.ap,
                          ),
                        );
                      }),
                    ),
                  ),
                deployRangedWeapons.length > 1 &&
                  (deployBrushModels || 1) > 1 &&
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginBottom: deploySgtCategory ? 8 : 0,
                        paddingTop: 6,
                        borderTop: "1px solid rgba(196,106,27,0.1)",
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom:
                            deployBrushSecondaryWeapons.length > 0 ? 6 : 0,
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#c46a1b",
                            letterSpacing: 1,
                          },
                        },
                        "🔫 ADDITIONAL WEAPONS",
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: () => {
                            const alt =
                              deployRangedWeapons.find(
                                (w) => w.name !== deployBrushRangedWeapon?.name,
                              ) || deployRangedWeapons[0];
                            setDeployBrushSecondaryWeapons((prev) => [
                              ...prev,
                              { weapon: alt, models: alt.defaultModels || 1 },
                            ]);
                          },
                          style: {
                            padding: "2px 8px",
                            borderRadius: 3,
                            cursor: "pointer",
                            fontSize: 8,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 600,
                            background: "rgba(196,106,27,0.1)",
                            border: "1px solid rgba(196,106,27,0.3)",
                            color: "#c46a1b",
                          },
                        },
                        "+ ADD",
                      ),
                    ),
                    deployBrushSecondaryWeapons.map((sw, idx) =>
                      React.createElement(
                        "div",
                        {
                          key: idx,
                          style: {
                            marginTop: 4,
                            padding: "4px 8px",
                            borderRadius: 4,
                            background: "rgba(196,106,27,0.04)",
                            border: "1px solid rgba(196,106,27,0.12)",
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap",
                            alignItems: "center",
                          },
                        },
                        React.createElement(
                          "select",
                          {
                            value: sw.weapon.name,
                            onChange: (e) => {
                              const w = deployRangedWeapons.find(
                                (ww) => ww.name === e.target.value,
                              );
                              if (w)
                                setDeployBrushSecondaryWeapons((prev) =>
                                  prev.map((s, i) =>
                                    i === idx ? { ...s, weapon: w } : s,
                                  ),
                                );
                            },
                            style: {
                              padding: "2px 4px",
                              borderRadius: 3,
                              fontSize: 11,
                              fontFamily: "'Share Tech Mono', serif",
                              border: "1px solid rgba(196,106,27,0.3)",
                              background: "#fff",
                              color: "#c46a1b",
                              maxWidth: 140,
                            },
                          },
                          deployRangedWeapons.map((w) =>
                            React.createElement(
                              "option",
                              { key: w.name, value: w.name },
                              w.name,
                            ),
                          ),
                        ),
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            },
                          },
                          React.createElement(
                            "label",
                            {
                              style: {
                                fontSize: 8,
                                fontFamily: "'Share Tech Mono', serif",
                                color: "#6a5e4e",
                              },
                            },
                            "×",
                          ),
                          React.createElement("input", {
                            type: "number",
                            min: 1,
                            max: 20,
                            value: sw.models,
                            onChange: (e) =>
                              setDeployBrushSecondaryWeapons((prev) =>
                                prev.map((s, i) =>
                                  i === idx
                                    ? {
                                        ...s,
                                        models: Math.max(
                                          1,
                                          parseInt(e.target.value) || 1,
                                        ),
                                      }
                                    : s,
                                ),
                              ),
                            style: {
                              width: 32,
                              padding: "1px 3px",
                              borderRadius: 2,
                              border: "1px solid #d0c4aa",
                              fontSize: 11,
                              textAlign: "center",
                            },
                          }),
                        ),
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 8,
                              color: "#6a5e4e",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "S",
                          sw.weapon.s,
                          "AP",
                          sw.weapon.ap,
                          "D",
                          sw.weapon.damage || 1,
                        ),
                        React.createElement(
                          "button",
                          {
                            onClick: () =>
                              setDeployBrushSecondaryWeapons((prev) =>
                                prev.filter((_, i) => i !== idx),
                              ),
                            style: {
                              padding: "1px 5px",
                              borderRadius: 2,
                              cursor: "pointer",
                              fontSize: 7,
                              background: "rgba(199,64,64,0.08)",
                              border: "1px solid rgba(199,64,64,0.2)",
                              color: "#c74040",
                              marginLeft: "auto",
                            },
                          },
                          "✕",
                        ),
                      ),
                    ),
                  ),
                deploySgtCategory &&
                  React.createElement(
                    "div",
                    null,
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#5b4a8a",
                            letterSpacing: 1,
                          },
                        },
                        "★ SERGEANT",
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: () => {
                            const next = !deployBrushSgtEnabled;
                            setDeployBrushSgtEnabled(next);
                            if (!next) setDeployBrushSgtWeapon(null);
                            else if (
                              deploySgtWeapons.length > 0 &&
                              !deployBrushSgtWeapon
                            )
                              setDeployBrushSgtWeapon(deploySgtWeapons[0]);
                          },
                          style: {
                            padding: "2px 10px",
                            borderRadius: 3,
                            cursor: "pointer",
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: deployBrushSgtEnabled ? 700 : 400,
                            background: deployBrushSgtEnabled
                              ? "rgba(91,74,138,0.12)"
                              : "#f8f4ec",
                            border: `1.5px solid ${deployBrushSgtEnabled ? "#5b4a8a" : "#e0d8c8"}`,
                            color: deployBrushSgtEnabled
                              ? "#5b4a8a"
                              : "#8a7e6e",
                          },
                        },
                        deployBrushSgtEnabled ? "✓ ENABLED" : "ADD SGT",
                      ),
                    ),
                    deployBrushSgtEnabled &&
                      deploySgtWeapons.length > 0 &&
                      React.createElement(
                        "div",
                        {
                          style: { display: "flex", gap: 3, flexWrap: "wrap" },
                        },
                        deploySgtWeapons.map((w, i) => {
                          const active = deployBrushSgtWeapon?.name === w.name;
                          return React.createElement(
                            "button",
                            {
                              key: i,
                              onClick: () => setDeployBrushSgtWeapon(w),
                              style: {
                                padding: "4px 8px",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: 11,
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: active ? 700 : 400,
                                background: active
                                  ? "rgba(91,74,138,0.12)"
                                  : "#f8f4ec",
                                border: `1.5px solid ${active ? "#5b4a8a" : "#e0d8c8"}`,
                                color: active ? "#5b4a8a" : "#6a5e4e",
                              },
                            },
                            w.name,
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 8,
                                  color: "#8a7e6e",
                                  marginLeft: 3,
                                },
                              },
                              "S",
                              w.s,
                              "AP",
                              w.ap,
                            ),
                          );
                        }),
                      ),
                  ),
                deployBrushUnit &&
                  canTakeEquipment(deployBrushUnit.id) &&
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px solid rgba(91,74,138,0.08)",
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 11,
                          fontFamily: "'Share Tech Mono', serif",
                          color: "#2e5e3e",
                          letterSpacing: 1,
                          marginBottom: 5,
                        },
                      },
                      "⚑ EQUIPMENT",
                    ),
                    React.createElement(
                      "div",
                      { style: { display: "flex", gap: 4, flexWrap: "wrap" } },
                      Object.entries(EQUIPMENT_OPTIONS).map(([key, eq]) => {
                        // Hide bayonets/chain bayonets from deploy equipment (tracked via melee weapon selection)
                        if (key === "bayonet" || key === "chainBayonet")
                          return null;
                        // Check if this unit can take this specific equipment
                        if (!canTakeEquipment(deployBrushUnit.id, key))
                          return null;
                        const active = deployBrushEquipment[key];
                        const costLabel = eq.perModel
                          ? `+${eq.cost}pts/model`
                          : `+${eq.cost}pts`;
                        return React.createElement(
                          "button",
                          {
                            key: key,
                            onClick: () => {
                              setDeployBrushEquipment((prev) => ({
                                ...prev,
                                [key]: !prev[key],
                              }));
                            },
                            title: `${eq.desc} (${costLabel})`,
                            style: {
                              padding: "4px 9px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: 11,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: active ? 700 : 400,
                              background: active
                                ? "rgba(46,94,62,0.12)"
                                : "#f8f4ec",
                              border: `1.5px solid ${active ? "#2e5e3e" : "#e0d8c8"}`,
                              color: active ? "#2e5e3e" : "#6a5e4e",
                              transition: "all 0.12s ease",
                            },
                          },
                          eq.icon,
                          eq.label,
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 7,
                                color: active ? "#2e5e3e" : "#a09888",
                                marginLeft: 3,
                              },
                            },
                            costLabel,
                          ),
                        );
                      }),
                    ),
                  ),
              ),
            React.createElement(
              "details",
              { style: { marginTop: 2 } },
              React.createElement(
                "summary",
                {
                  style: {
                    fontSize: 11,
                    fontFamily: "'Share Tech Mono', serif",
                    color: "#8a7e6e",
                    letterSpacing: 1,
                    cursor: "pointer",
                    marginBottom: 6,
                  },
                },
                "▸ QUICK-PLACE BY TYPE (generic markers)",
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    paddingTop: 6,
                  },
                },
                DEPLOY_UNIT_TYPES.map((ut) => {
                  const active =
                    !deployBrushUnit && deploySelectedUnit === ut.id;
                  const playerCol =
                    deployPlayer === "p1" ? "#9b2d2d" : "#2a6fb4";
                  return React.createElement(
                    "button",
                    {
                      key: ut.id,
                      onClick: () => {
                        setDeploySelectedUnit(active ? null : ut.id);
                        setDeployBrushUnit(null);
                      },
                      title: ut.desc,
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 10px",
                        borderRadius: 5,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        background: active
                          ? `rgba(${deployPlayer === "p1" ? "155,45,45" : "42,111,180"},0.12)`
                          : "#f8f4ec",
                        border: `1.5px solid ${active ? playerCol : "#e0d8c8"}`,
                        boxShadow: active
                          ? `0 0 8px rgba(${deployPlayer === "p1" ? "155,45,45" : "42,111,180"},0.2)`
                          : "none",
                      },
                    },
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontSize: 16,
                          lineHeight: 1,
                          color: active ? playerCol : "#6a5e4e",
                        },
                      },
                      ut.symbol,
                    ),
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontSize: 11,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: active ? 700 : 400,
                          color: active ? playerCol : "#6a5e4e",
                        },
                      },
                      ut.label,
                    ),
                  );
                }),
              ),
            ),
          ),
          deployModalOpen &&
            React.createElement(UnitSelectorModal, {
              presets: UNIT_PRESETS,
              selectedId: deployBrushUnit?.name,
              onSelect: (unit) => {
                setDeployBrushUnit(unit);
                setDeployBrushModels(unit.models || 1);
                setDeploySelectedUnit(null);
                setDeployModalOpen(false);
                setDeployBrushArmyEntryId(null); // not from army roster
                // Auto-select first available weapons
                const rw = getRangedWeapons(unit.id);
                setDeployBrushRangedWeapon(rw.length > 0 ? rw[0] : null);
                const mw = MELEE_getRangedWeapons(unit.id);
                setDeployBrushMeleeWeapon(mw.length > 0 ? mw[0] : null);
                setDeployBrushSecondaryWeapons([]); // Reset secondary weapons
                // Sergeant
                const sgtCat = getSgtCategory(unit.id);
                const hasSgt = unit.hasSgt && sgtCat;
                setDeployBrushSgtEnabled(!!hasSgt);
                const sgtW = sgtCat ? SERGEANT_WEAPONS[sgtCat] || [] : [];
                setDeployBrushSgtWeapon(sgtW.length > 0 ? sgtW[0] : null);
                // Reset equipment
                setDeployBrushEquipment({
                  vexilla: false,
                  noxVox: false,
                  metaBomb: false,
                  bayonet: false,
                  chainBayonet: false,
                });
              },
              onClose: () => setDeployModalOpen(false),
              accentColor: "#5b4a8a",
              title: "SELECT UNIT TO DEPLOY",
            }),
          renderBoard({
            refObj: boardRef,
            onClick: handleBoardClick,
            cursorMode:
              deployBrushUnit || deploySelectedUnit ? "crosshair" : "default",
            showZones: deployShowZones,
            showMoveRange: false,
            moveRangeUnit: null,
            unitOnClick: (unit, e) => removeDeployedUnit(unit.id),
          }),
          deployBrushUnit &&
            React.createElement(
              "div",
              {
                style: {
                  padding: "8px 14px",
                  borderRadius: 6,
                  marginBottom: 12,
                  background: "rgba(91,74,138,0.06)",
                  border: "1.5px solid rgba(91,74,138,0.18)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                },
              },
              typeof getUnitArtwork === "function" &&
                getUnitArtwork(deployBrushUnit.id, deployFaction)
                ? React.createElement("img", {
                    src: getUnitArtwork(deployBrushUnit.id, deployFaction),
                    alt: "",
                    style: {
                      width: 120,
                      height: 120,
                      objectFit: "contain",
                      background: "#1e1a14",
                      borderRadius: 6,
                      flexShrink: 0,
                      border: "1.5px solid rgba(91,74,138,0.3)",
                    },
                    onError: function (e) {
                      e.currentTarget.style.display = "none";
                    },
                  })
                : null,
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: 14,
                    fontFamily: "'Share Tech Mono', serif",
                    color: "#5b4a8a",
                    fontStyle: "italic",
                  },
                },
                "✦ Click on the map to place:",
                React.createElement("strong", null, deployBrushUnit.name),
                "(",
                deployBrushModels,
                "model",
                deployBrushModels !== 1 ? "s" : "",
                ")",
                deployBrushRangedWeapon &&
                  React.createElement(
                    "span",
                    null,
                    "· 🔫",
                    deployBrushRangedWeapon.name,
                  ),
                deployBrushMeleeWeapon &&
                  React.createElement(
                    "span",
                    null,
                    "· 🗡",
                    deployBrushMeleeWeapon.name,
                  ),
                deployBrushSgtEnabled &&
                  deployBrushSgtWeapon &&
                  React.createElement(
                    "span",
                    null,
                    "· ★ Sgt:",
                    deployBrushSgtWeapon.name,
                  ),
                deployBrushSecondaryWeapons.length > 0 &&
                  deployBrushSecondaryWeapons.map((sw, i) =>
                    React.createElement(
                      "span",
                      { key: i, style: { color: "#c46a1b" } },
                      "· +",
                      sw.models,
                      "×",
                      sw.weapon.name,
                    ),
                  ),
              ),
            ),
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 16 } },
            React.createElement(
              "div",
              {
                style: { ...panelHeaderStyle, justifyContent: "space-between" },
              },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                React.createElement(
                  "span",
                  { style: { color: "#5b4a8a", fontSize: 16 } },
                  "📋",
                ),
                React.createElement(
                  "span",
                  { style: { color: "#5b4a8a" } },
                  "DEPLOYED UNITS (",
                  deployedUnits.length,
                  ")",
                ),
              ),
              React.createElement(
                "div",
                { style: { display: "flex", gap: 8, alignItems: "center" } },
                React.createElement(MiniStat, {
                  label: "LOY",
                  value: deployedUnits.filter((u) => u.player === "p1").length,
                  color: "#9b2d2d",
                }),
                React.createElement(MiniStat, {
                  label: "TRA",
                  value: deployedUnits.filter((u) => u.player === "p2").length,
                  color: "#2a6fb4",
                }),
              ),
            ),
            (() => {
              const p1pts = deployedUnits
                .filter((u) => u.player === "p1")
                .reduce((sum, u) => sum + (calcUnitPoints(u) ?? 0), 0);
              const p2pts = deployedUnits
                .filter((u) => u.player === "p2")
                .reduce((sum, u) => sum + (calcUnitPoints(u) ?? 0), 0);
              const hasAny = deployedUnits.some(
                (u) => calcUnitPoints(u) !== null,
              );
              if (!hasAny) return null;
              return React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 8,
                    marginBottom: 8,
                    padding: "6px 10px",
                    borderRadius: 4,
                    background: "#f4f0e8",
                    border: "1px solid #e0d8c8",
                  },
                },
                React.createElement(
                  "div",
                  { style: { flex: 1, textAlign: "center" } },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#9b2d2d",
                        letterSpacing: 1,
                      },
                    },
                    "LOYALIST",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 17,
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        color: "#9b2d2d",
                      },
                    },
                    p1pts,
                    React.createElement(
                      "span",
                      { style: { fontSize: 10 } },
                      "pts",
                    ),
                  ),
                ),
                React.createElement("div", {
                  style: { width: 1, background: "#d0c4aa" },
                }),
                React.createElement(
                  "div",
                  { style: { flex: 1, textAlign: "center" } },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#2a6fb4",
                        letterSpacing: 1,
                      },
                    },
                    "TRAITORS",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 17,
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        color: "#2a6fb4",
                      },
                    },
                    p2pts,
                    React.createElement(
                      "span",
                      { style: { fontSize: 10 } },
                      "pts",
                    ),
                  ),
                ),
                p1pts > 0 &&
                  p2pts > 0 &&
                  React.createElement(
                    React.Fragment,
                    null,
                    React.createElement("div", {
                      style: { width: 1, background: "#d0c4aa" },
                    }),
                    React.createElement(
                      "div",
                      { style: { flex: 1, textAlign: "center" } },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#6a5e4e",
                            letterSpacing: 1,
                          },
                        },
                        "DIFFERENCE",
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 17,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            color:
                              Math.abs(p1pts - p2pts) > 50
                                ? "#c74040"
                                : "#5a7a3a",
                          },
                        },
                        Math.abs(p1pts - p2pts) === 0
                          ? "—"
                          : `${Math.abs(p1pts - p2pts)}`,
                        React.createElement(
                          "span",
                          { style: { fontSize: 10 } },
                          Math.abs(p1pts - p2pts) > 0
                            ? ` (${p1pts > p2pts ? "LOY" : "TRA"} +)`
                            : "",
                        ),
                      ),
                    ),
                  ),
              );
            })(),
            deployedUnits.length === 0
              ? React.createElement(
                  "div",
                  {
                    style: {
                      textAlign: "center",
                      padding: "12px 0",
                      fontSize: 13,
                      color: "#a09888",
                      fontFamily: "'Share Tech Mono', serif",
                      fontStyle: "italic",
                    },
                  },
                  "No units deployed. Select a unit from the roster or quick-place palette above and click on the map.",
                )
              : React.createElement(
                  "div",
                  {
                    style: { display: "flex", flexDirection: "column", gap: 2 },
                  },
                  deployedUnits.map((unit) => {
                    const isP1 = unit.player === "p1";
                    const col = isP1 ? "#9b2d2d" : "#2a6fb4";
                    const ud = unit.unitData;
                    const pts = calcUnitPoints(unit);
                    const pd = ud ? POINTS_DATA[ud.id] : null;

                    // Build points breakdown tooltip
                    let ptsBreakdown = "";
                    if (pd && ud) {
                      const extraModels = Math.max(0, ud.models - pd.minModels);
                      const parts = [
                        `${pd.base}pts base (${pd.minModels} model${pd.minModels !== 1 ? "s" : ""})`,
                      ];
                      if (extraModels > 0)
                        parts.push(`+${extraModels}×${pd.perModel}pts models`);
                      if (unit.rangedWeapon) {
                        const wc =
                          WEAPON_UPGRADE_COSTS[unit.rangedWeapon.name] ?? 0;
                        const secModels = (unit.secondaryWeapons || []).reduce(
                          (s, sw) => s + (sw.models || 0),
                          0,
                        );
                        const nm = Math.max(
                          0,
                          ud.models - (unit.sgtEnabled ? 1 : 0) - secModels,
                        );
                        if (wc > 0 && nm > 0)
                          parts.push(
                            `+${nm}×${wc}pts ${unit.rangedWeapon.name}`,
                          );
                      }
                      if (unit.sgtEnabled && unit.sgtWeapon) {
                        const sc =
                          WEAPON_UPGRADE_COSTS[unit.sgtWeapon.name] ?? 0;
                        if (sc > 0)
                          parts.push(`+${sc}pts Sgt: ${unit.sgtWeapon.name}`);
                      }
                      if (
                        unit.secondaryWeapons &&
                        unit.secondaryWeapons.length > 0
                      ) {
                        for (const sw of unit.secondaryWeapons) {
                          const swc = WEAPON_UPGRADE_COSTS[sw.weapon.name] ?? 0;
                          if (swc > 0)
                            parts.push(
                              `+${sw.models}×${swc}pts ${sw.weapon.name}`,
                            );
                        }
                      }
                      if (unit.equipment) {
                        Object.entries(EQUIPMENT_OPTIONS).forEach(
                          ([key, eq]) => {
                            if (unit.equipment[key]) {
                              if (eq.perModel) {
                                parts.push(
                                  `+${ud.models}×${eq.cost}pts ${eq.label}`,
                                );
                              } else {
                                parts.push(`+${eq.cost}pts ${eq.label}`);
                              }
                            }
                          },
                        );
                      }
                      ptsBreakdown = parts.join(" | ");
                    }

                    return React.createElement(
                      "div",
                      {
                        key: unit.id,
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "5px 10px",
                          borderRadius: 4,
                          background: isP1
                            ? "rgba(155,45,45,0.04)"
                            : "rgba(42,111,180,0.04)",
                          border: `1px solid ${isP1 ? "rgba(155,45,45,0.1)" : "rgba(42,111,180,0.1)"}`,
                        },
                      },
                      React.createElement(
                        "span",
                        { style: { fontSize: 14, color: col } },
                        unit.symbol,
                      ),
                      React.createElement(
                        "div",
                        { style: { flex: 1, minWidth: 0 } },
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              alignItems: "baseline",
                              gap: 6,
                            },
                          },
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 13,
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: 600,
                                color: col,
                              },
                            },
                            unit.label,
                          ),
                          ud &&
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 11,
                                  color: "#8a7e6e",
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              ud.models,
                              "× · T",
                              ud.t,
                              "W",
                              ud.w,
                              "Sv",
                              ud.sv,
                              ud.inv && ud.inv !== "-" ? ` Inv${ud.inv}` : "",
                            ),
                        ),
                        (unit.rangedWeapon ||
                          unit.meleeWeapon ||
                          unit.sgtEnabled ||
                          (unit.secondaryWeapons &&
                            unit.secondaryWeapons.length > 0)) &&
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 8,
                                color: "#8a7e6e",
                                fontFamily: "'Share Tech Mono', serif",
                                marginTop: 1,
                              },
                            },
                            unit.rangedWeapon &&
                              React.createElement(
                                "span",
                                { style: { color: "#b8860b" } },
                                "🔫",
                                unit.rangedWeapon.name,
                              ),
                            unit.rangedWeapon &&
                              unit.meleeWeapon &&
                              React.createElement("span", null, "·"),
                            unit.meleeWeapon &&
                              React.createElement(
                                "span",
                                { style: { color: "#9b2d2d" } },
                                "🗡",
                                unit.meleeWeapon.name,
                              ),
                            unit.sgtEnabled &&
                              unit.sgtWeapon &&
                              React.createElement(
                                "span",
                                { style: { color: "#5b4a8a" } },
                                "· ★",
                                unit.sgtWeapon.name,
                              ),
                            unit.secondaryWeapons &&
                              unit.secondaryWeapons.map((sw, i) =>
                                React.createElement(
                                  "span",
                                  { key: i, style: { color: "#c46a1b" } },
                                  "· +",
                                  sw.models,
                                  "×",
                                  sw.weapon.name,
                                ),
                              ),
                          ),
                        unit.equipment &&
                          Object.entries(EQUIPMENT_OPTIONS).some(
                            ([k]) => unit.equipment[k],
                          ) &&
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 8,
                                color: "#2e5e3e",
                                fontFamily: "'Share Tech Mono', serif",
                                marginTop: 1,
                              },
                            },
                            Object.entries(EQUIPMENT_OPTIONS)
                              .filter(([k]) => unit.equipment[k])
                              .map(([k, eq], i, arr) =>
                                React.createElement(
                                  "span",
                                  { key: k },
                                  React.createElement(
                                    "span",
                                    { title: eq.desc },
                                    eq.icon,
                                    eq.label,
                                  ),
                                  i < arr.length - 1 &&
                                    React.createElement(
                                      "span",
                                      { style: { color: "#8a7e6e" } },
                                      "·",
                                    ),
                                ),
                              ),
                          ),
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#8a7e6e",
                          },
                        },
                        unit.x,
                        '" ,',
                        unit.y,
                        '"',
                      ),
                      pts !== null
                        ? React.createElement(
                            "div",
                            {
                              title: ptsBreakdown,
                              style: {
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                padding: "2px 7px",
                                borderRadius: 4,
                                minWidth: 38,
                                background: isP1
                                  ? "rgba(155,45,45,0.1)"
                                  : "rgba(42,111,180,0.1)",
                                border: `1px solid ${isP1 ? "rgba(155,45,45,0.25)" : "rgba(42,111,180,0.25)"}`,
                                cursor: "help",
                              },
                            },
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 13,
                                  fontFamily: "'Share Tech Mono', serif",
                                  fontWeight: 700,
                                  color: col,
                                  lineHeight: 1,
                                },
                              },
                              pts,
                            ),
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 7,
                                  fontFamily: "'Share Tech Mono', serif",
                                  color: col,
                                  opacity: 0.7,
                                  letterSpacing: 0.5,
                                },
                              },
                              "pts",
                            ),
                          )
                        : React.createElement(
                            "div",
                            {
                              style: {
                                width: 38,
                                textAlign: "center",
                                fontSize: 8,
                                color: "#c0b498",
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "—",
                          ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 8,
                            fontFamily: "'Share Tech Mono', serif",
                            color: col,
                            letterSpacing: 0.5,
                          },
                        },
                        unit.player.toUpperCase(),
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: () => removeDeployedUnit(unit.id),
                          style: {
                            background: "none",
                            border: "none",
                            color: "#c74040",
                            cursor: "pointer",
                            fontSize: 12,
                            padding: "0 4px",
                          },
                        },
                        "✕",
                      ),
                    );
                  }),
                ),
          ),
        ),
      activePhase === "movement" &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 12 } },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                React.createElement("span", { style: { fontSize: 16 } }, "🚶"),
                React.createElement(
                  "span",
                  {
                    style: {
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#6b5b2e",
                      letterSpacing: 2,
                    },
                  },
                  "MOVEMENT PHASE",
                ),
              ),
              React.createElement(
                "div",
                { style: { display: "flex", gap: 6, alignItems: "center" } },
                React.createElement(
                  "span",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#8a7e6e",
                    },
                  },
                  "Zoom:",
                ),
                [6, 8, 10, 12, 14].map((z) =>
                  React.createElement(
                    "button",
                    {
                      key: z,
                      onClick: () => setDeployScale(z),
                      style: {
                        padding: "3px 7px",
                        borderRadius: 3,
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: deployScale === z ? 700 : 400,
                        background:
                          deployScale === z
                            ? "rgba(107,91,46,0.12)"
                            : "#f0ebe2",
                        border: `1px solid ${deployScale === z ? "#6b5b2e" : "#d0c4aa"}`,
                        color: deployScale === z ? "#6b5b2e" : "#8a7e6e",
                      },
                    },
                    z,
                    "px",
                  ),
                ),
              ),
            ),
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 8,
                  flexWrap: "wrap",
                },
              },
              React.createElement(CheckToggle, {
                checked: deployShowGrid,
                label: "Grid Lines",
                onChange: setDeployShowGrid,
              }),
              React.createElement(CheckToggle, {
                checked: deployShowZones,
                label: "Deploy Zones",
                onChange: setDeployShowZones,
              }),
              React.createElement("div", { style: { flex: 1 } }),
              React.createElement(
                "button",
                {
                  onClick: undoLastMove,
                  disabled: moveLog.length === 0,
                  style: {
                    padding: "4px 12px",
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: moveLog.length ? "pointer" : "default",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    background: moveLog.length
                      ? "rgba(107,91,46,0.08)"
                      : "#f0ebe2",
                    border: `1.5px solid ${moveLog.length ? "#6b5b2e" : "#d0c4aa"}`,
                    color: moveLog.length ? "#6b5b2e" : "#c0b498",
                    opacity: moveLog.length ? 1 : 0.5,
                  },
                },
                "↩ UNDO",
              ),
              React.createElement(
                "button",
                {
                  onClick: resetAllMoves,
                  disabled: moveLog.length === 0,
                  style: {
                    padding: "4px 12px",
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: moveLog.length ? "pointer" : "default",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    background: moveLog.length
                      ? "rgba(200,50,50,0.08)"
                      : "#f0ebe2",
                    border: `1.5px solid ${moveLog.length ? "#c74040" : "#d0c4aa"}`,
                    color: moveLog.length ? "#c74040" : "#c0b498",
                    opacity: moveLog.length ? 1 : 0.5,
                  },
                },
                "RESET MOVES ✕",
              ),
            ),
          ),
          React.createElement(
            "div",
            {
              style: { ...panelStyle, marginBottom: 12, padding: "10px 14px" },
            },
            !moveSelectedId
              ? React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#6a5e4e",
                      textAlign: "center",
                    },
                  },
                  React.createElement(
                    "strong",
                    {
                      style: {
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#6b5b2e",
                      },
                    },
                    "SELECT A UNIT",
                  ),
                  "on the map to move it. Units highlighted with a gold ring can be clicked to begin movement.",
                )
              : (() => {
                  const su = deployedUnits.find((u) => u.id === moveSelectedId);
                  if (!su) return null;
                  const maxM = MOVE_VALUES[su.type] || 7;
                  const isP1 = su.player === "p1";
                  const pCol = isP1 ? "#9b2d2d" : "#2a6fb4";
                  return React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: `1.5px solid ${pCol}`,
                        background: "rgba(255,255,255,0.4)",
                      },
                    },
                    typeof getUnitArtwork === "function" &&
                      getUnitArtwork(
                        su.unitData && su.unitData.id,
                        null,
                        isP1 ? "loyalist" : "traitor",
                      )
                      ? React.createElement("img", {
                          src: getUnitArtwork(
                            su.unitData && su.unitData.id,
                            null,
                            isP1 ? "loyalist" : "traitor",
                          ),
                          alt: "",
                          style: {
                            width: 120,
                            height: 120,
                            objectFit: "contain",
                            background: "#1e1a14",
                            borderRadius: 6,
                            flexShrink: 0,
                            border: `1.5px solid ${pCol}`,
                          },
                          onError: function (e) {
                            e.currentTarget.style.display = "none";
                          },
                        })
                      : null,
                    React.createElement(
                      "div",
                      {
                        style: {
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 6,
                          fontSize: 20,
                          background: isP1
                            ? "rgba(200,60,60,0.85)"
                            : "rgba(50,120,200,0.85)",
                          color: "#fff",
                          border: "2px solid #ffd700",
                          boxShadow: "0 0 10px rgba(255,215,0,0.4)",
                        },
                      },
                      su.symbol,
                    ),
                    React.createElement(
                      "div",
                      { style: { flex: 1 } },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 15,
                            color: pCol,
                          },
                        },
                        su.label,
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 13,
                            color: "#8a7e6e",
                            fontFamily: "'Share Tech Mono', serif",
                          },
                        },
                        "Position:",
                        su.x,
                        '",',
                        su.y,
                        '" · Movement:',
                        React.createElement(
                          "strong",
                          { style: { color: "#6b5b2e" } },
                          maxM,
                          '"',
                        ),
                        movedUnitIds.has(su.id) &&
                          React.createElement(
                            "span",
                            { style: { color: "#c46a1b", marginLeft: 6 } },
                            "⚠ Already moved",
                          ),
                      ),
                    ),
                    React.createElement(
                      "div",
                      { style: { textAlign: "center" } },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 900,
                            fontSize: 24,
                            color: "#6b5b2e",
                          },
                        },
                        maxM,
                        '"',
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 8,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#8a7e6e",
                            letterSpacing: 1,
                          },
                        },
                        "MAX MOVE",
                      ),
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: () => setMoveSelectedId(null),
                        style: {
                          padding: "5px 12px",
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: "pointer",
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 600,
                          background: "#f0ebe2",
                          border: "1.5px solid #d0c4aa",
                          color: "#8a7e6e",
                        },
                      },
                      "CANCEL",
                    ),
                  );
                })(),
          ),
          renderBoard({
            refObj: moveBoardRef,
            onClick: handleMoveMapClick,
            cursorMode: moveSelectedId ? "crosshair" : "pointer",
            showZones: deployShowZones,
            showMoveRange: !!moveSelectedId,
            moveRangeUnit: moveSelectedId,
            unitOnClick: (unit, e) => {
              if (moveSelectedId) return; // already moving, let map click handle
              setMoveSelectedId(unit.id);
            },
          }),
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 12 } },
            React.createElement(
              "div",
              { style: { ...panelHeaderStyle } },
              React.createElement(
                "span",
                { style: { color: "#6b5b2e", fontSize: 16 } },
                "📏",
              ),
              React.createElement(
                "span",
                { style: { color: "#6b5b2e" } },
                "MOVEMENT VALUES",
              ),
            ),
            React.createElement(
              "div",
              { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
              DEPLOY_UNIT_TYPES.filter((u) => u.id !== "objective").map((ut) =>
                React.createElement(
                  "div",
                  {
                    key: ut.id,
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "rgba(107,91,46,0.04)",
                      border: "1px solid rgba(107,91,46,0.1)",
                    },
                  },
                  React.createElement(
                    "span",
                    { style: { fontSize: 12, lineHeight: 1 } },
                    ut.symbol,
                  ),
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#6a5e4e",
                      },
                    },
                    ut.label,
                  ),
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 12,
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        color: "#6b5b2e",
                      },
                    },
                    MOVE_VALUES[ut.id] || 0,
                    '"',
                  ),
                ),
              ),
            ),
          ),
          moveLog.length > 0 &&
            React.createElement(
              "div",
              { style: { ...panelStyle, marginBottom: 16 } },
              React.createElement(
                "div",
                {
                  style: {
                    ...panelHeaderStyle,
                    justifyContent: "space-between",
                  },
                },
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 8 } },
                  React.createElement(
                    "span",
                    { style: { color: "#6b5b2e", fontSize: 16 } },
                    "📋",
                  ),
                  React.createElement(
                    "span",
                    { style: { color: "#6b5b2e" } },
                    "MOVEMENT LOG (",
                    moveLog.length,
                    "moves)",
                  ),
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 8 } },
                  React.createElement(MiniStat, {
                    label: "LOY Moves",
                    value: moveLog.filter((m) => m.player === "p1").length,
                    color: "#9b2d2d",
                  }),
                  React.createElement(MiniStat, {
                    label: "TRA Moves",
                    value: moveLog.filter((m) => m.player === "p2").length,
                    color: "#2a6fb4",
                  }),
                ),
              ),
              React.createElement(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: 2 } },
                moveLog.map((m, i) => {
                  const isP1 = m.player === "p1";
                  const col = isP1 ? "#9b2d2d" : "#2a6fb4";
                  return React.createElement(
                    "div",
                    {
                      key: i,
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "4px 10px",
                        borderRadius: 4,
                        background: isP1
                          ? "rgba(155,45,45,0.04)"
                          : "rgba(42,111,180,0.04)",
                        border: `1px solid ${isP1 ? "rgba(155,45,45,0.1)" : "rgba(42,111,180,0.1)"}`,
                      },
                    },
                    React.createElement(
                      "span",
                      { style: { fontSize: 12, color: col } },
                      m.symbol,
                    ),
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontSize: 13,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 600,
                          color: col,
                        },
                      },
                      m.label,
                    ),
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontSize: 12,
                          fontFamily: "'Share Tech Mono', serif",
                          color: "#6a5e4e",
                          flex: 1,
                        },
                      },
                      "(",
                      m.fromX,
                      '",',
                      m.fromY,
                      '") → (',
                      m.toX,
                      '",',
                      m.toY,
                      '")',
                    ),
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          fontSize: 12,
                          color: "#6b5b2e",
                        },
                      },
                      m.distance,
                      '"',
                    ),
                    React.createElement(
                      "span",
                      { style: { fontSize: 8, color: "#a09888" } },
                      "/",
                      m.maxMove,
                      '"',
                    ),
                  );
                }),
              ),
            ),
        ),
      activePhase === "shooting" &&
        React.createElement(
          React.Fragment,
          null,
          deployedUnits.length > 0 &&
            renderTacticalMap({
              refObj: shootMapRef,
              phase: "shooting",
              onUnitClick: (unit) => {
                if (!mapAttackerId) {
                  handleMapAttackerSelect(unit);
                } else if (!mapTargetId && unit.id !== mapAttackerId) {
                  handleMapTargetSelect(unit);
                } else if (unit.id === mapAttackerId) {
                  setMapAttackerId(null);
                  setMapTargetId(null);
                } else {
                  handleMapTargetSelect(unit);
                }
              },
            }),
          mapAttackerId &&
            mapTargetId &&
            React.createElement(
              "div",
              {
                style: {
                  ...panelStyle,
                  marginBottom: 12,
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  padding: "8px 14px",
                  alignItems: "center",
                },
              },
              React.createElement(
                "button",
                {
                  onClick: () => {
                    const atkUnit = deployedUnits.find(
                      (u) => u.id === mapAttackerId,
                    );
                    const defUnit = deployedUnits.find(
                      (u) => u.id === mapTargetId,
                    );
                    if (!atkUnit || !defUnit) return;
                    const dist = getDistanceBetween(atkUnit, defUnit);
                    setShowCharge(true);
                    if (dist !== null) setChargeDistance(Math.ceil(dist));
                    if (atkUnit.meleeWeapon) {
                      setChargerWS(atkUnit.meleeWeapon.ws);
                      setChargerS_melee(atkUnit.meleeWeapon.s);
                      setChargerAP_melee(atkUnit.meleeWeapon.ap);
                      setChargerI(atkUnit.meleeWeapon.i);
                      setChargerA(atkUnit.meleeWeapon.a);
                    }
                    if (atkUnit.unitData) {
                      setChargerT_melee(atkUnit.unitData.t || 4);
                      setChargerSv(atkUnit.unitData.sv || "3");
                      setChargerInvSv(atkUnit.unitData.inv || "-");
                      setChargerFnpSv(atkUnit.unitData.fnp || "-");
                      setChargerW_melee(atkUnit.unitData.w || 1);
                    }
                    if (defUnit.meleeWeapon) {
                      setDefenderWS(defUnit.meleeWeapon.ws);
                      setDefenderS_melee(defUnit.meleeWeapon.s);
                      setDefenderAP_melee(defUnit.meleeWeapon.ap);
                      setDefenderI(defUnit.meleeWeapon.i);
                      setDefenderA(defUnit.meleeWeapon.a);
                    }
                    setActivePhase("assault"); // Switch to assault for charge
                  },
                  style: {
                    padding: "6px 14px",
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    background: "rgba(155,45,45,0.1)",
                    border: "1.5px solid #9b2d2d",
                    color: "#9b2d2d",
                  },
                },
                "⚔ CHARGE → ASSAULT",
              ),
              React.createElement(
                "button",
                {
                  onClick: () => routUnit(mapTargetId),
                  style: {
                    padding: "6px 14px",
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    background: "rgba(200,50,50,0.08)",
                    border: "1.5px solid #c74040",
                    color: "#c74040",
                  },
                },
                "💨 ROUTE TARGET",
              ),
              React.createElement("div", { style: { flex: 1 } }),
              React.createElement(
                "span",
                {
                  style: {
                    fontSize: 11,
                    fontFamily: "'Share Tech Mono', serif",
                    color: "#8a7e6e",
                    fontStyle: "italic",
                  },
                },
                "Map selection auto-fills attacker & target stats below",
              ),
            ),
          React.createElement(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 16,
                marginBottom: 16,
              },
            },
            React.createElement(
              "div",
              { style: panelStyle },
              React.createElement(
                "div",
                {
                  style: {
                    ...panelHeaderStyle,
                    justifyContent: "space-between",
                  },
                },
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 8 } },
                  React.createElement(
                    "span",
                    { style: { color: "#b8860b", fontSize: 16 } },
                    "⚔",
                  ),
                  React.createElement("span", null, "ATTACKING UNIT"),
                ),
              ),
              React.createElement(
                "div",
                { style: { marginBottom: 14 } },
                selectedUnit
                  ? React.createElement(
                      "button",
                      {
                        onClick: () => setShowAttackerPresets(true),
                        style: {
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          width: "100%",
                          padding: "8px 10px",
                          gap: 10,
                          borderRadius: 8,
                          cursor: "pointer",
                          background: "rgba(184,134,11,0.06)",
                          border: "1.5px solid #b8860b",
                          transition: "all 0.15s ease",
                          textAlign: "left",
                        },
                      },
                      typeof getUnitArtwork === "function" &&
                        getUnitArtwork(selectedUnit.id, shootFaction)
                        ? React.createElement("img", {
                            src: getUnitArtwork(selectedUnit.id, shootFaction),
                            alt: "",
                            style: {
                              width: 120,
                              height: 120,
                              objectFit: "contain",
                              background: "#1e1a14",
                              borderRadius: 6,
                              flexShrink: 0,
                              border: "1.5px solid rgba(184,134,11,0.3)",
                            },
                            onError: function (e) {
                              e.currentTarget.style.display = "none";
                            },
                          })
                        : null,
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flex: 1,
                          },
                        },
                        React.createElement(UnitIcon, {
                          type: getUnitIconType(selectedUnit.name),
                          size: 42,
                          color: "#b8860b",
                        }),
                        React.createElement(
                          "div",
                          { style: { flex: 1 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: 700,
                                fontSize: 16,
                                color: "#1e1a12",
                              },
                            },
                            selectedUnit.name,
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 14,
                                color: "#8a7e6e",
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            selectedUnit.models,
                            "model",
                            selectedUnit.models > 1 ? "s" : "",
                            "· BS",
                            selectedUnit.bs,
                          ),
                        ),
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 14,
                              color: "#b8860b",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "CHANGE ▸",
                        ),
                      ),
                    )
                  : React.createElement(
                      "button",
                      {
                        onClick: () => setShowAttackerPresets(true),
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          width: "100%",
                          padding: "14px",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: "#f9f6f0",
                          border: "1.5px dashed #c0b498",
                          color: "#8a7e6e",
                          fontFamily: "'Share Tech Mono', serif",
                          fontSize: 12,
                          letterSpacing: 1,
                          transition: "all 0.15s ease",
                        },
                      },
                      React.createElement(
                        "span",
                        { style: { fontSize: 18 } },
                        "+",
                      ),
                      "SELECT UNIT",
                    ),
              ),
              showAttackerPresets &&
                React.createElement(UnitSelectorModal, {
                  presets: UNIT_PRESETS,
                  selectedId: selectedUnit?.id,
                  title: "SELECT ATTACKING UNIT",
                  accentColor: "#b8860b",
                  onClose: () => setShowAttackerPresets(false),
                  onSelect: applyUnitPreset,
                }),
              selectedUnit &&
                React.createElement(
                  "div",
                  {
                    style: {
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    },
                  },
                  React.createElement(
                    "label",
                    {
                      style: {
                        fontSize: 12,
                        color: "#5a4e3e",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily: "'Share Tech Mono', serif",
                        whiteSpace: "nowrap",
                      },
                    },
                    "Legion",
                  ),
                  React.createElement(
                    "select",
                    {
                      value: shootFaction,
                      onChange: (e) => setShootFaction(e.target.value),
                      style: {
                        flex: 1,
                        padding: "5px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        border: "1px solid #b8860b",
                        background: "#faf8f4",
                        color: "#2a2418",
                        cursor: "pointer",
                      },
                    },
                    LEGION_FACTIONS.map((f) =>
                      React.createElement(
                        "option",
                        { key: f.id, value: f.id },
                        f.name,
                      ),
                    ),
                  ),
                ),
              selectedUnit &&
                availableWeapons.length > 0 &&
                React.createElement(
                  "div",
                  { style: { marginBottom: 14 } },
                  React.createElement(WeaponSelector, {
                    weapons: availableWeapons,
                    selectedWeaponName: selectedWeapon?.name,
                    onSelect: applyWeaponPreset,
                  }),
                ),
              selectedWeapon &&
                React.createElement(
                  "div",
                  {
                    style: {
                      marginBottom: 14,
                      padding: "8px 12px",
                      borderRadius: 6,
                      background: "rgba(184,134,11,0.06)",
                      border: "1px solid #e0dbd0",
                      fontSize: 12,
                      color: "#4a4030",
                      fontFamily: "'Share Tech Mono', serif",
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                      alignItems: "center",
                    },
                  },
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 600,
                        color: "#b8860b",
                      },
                    },
                    selectedWeapon.name,
                  ),
                  React.createElement(
                    "span",
                    null,
                    selectedWeapon.type,
                    selectedWeapon.shots,
                  ),
                  React.createElement("span", null, "S", selectedWeapon.s),
                  React.createElement("span", null, "AP", selectedWeapon.ap),
                  React.createElement("span", null, "D", selectedWeapon.damage),
                  Object.keys(selectedWeapon.rules || {})
                    .filter((k) => selectedWeapon.rules[k])
                    .map((k) => {
                      const rule = SPECIAL_RULES.find((r) => r.id === k);
                      return rule
                        ? React.createElement(
                            "span",
                            {
                              key: k,
                              style: { color: "#8b6508", fontSize: 11 },
                            },
                            rule.label,
                          )
                        : null;
                    }),
                ),
              selectedUnit &&
                selectedUnit.hasSgt &&
                availableSgtWeapons.length > 0 &&
                React.createElement(
                  "div",
                  {
                    style: {
                      marginBottom: 14,
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: sgtEnabled
                        ? "rgba(107,63,138,0.06)"
                        : "#f9f6f0",
                      border: `1.5px solid ${sgtEnabled ? "#6b3f8a" : "#e0dbd0"}`,
                      transition: "all 0.15s ease",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: sgtEnabled ? 10 : 0,
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        },
                      },
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 14,
                            color: sgtEnabled ? "#6b3f8a" : "#8a7e6e",
                          },
                        },
                        "⚔",
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 13,
                            color: sgtEnabled ? "#6b3f8a" : "#8a7e6e",
                            letterSpacing: 1,
                          },
                        },
                        "SERGEANT",
                      ),
                    ),
                    React.createElement(
                      "label",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          fontFamily: "'Share Tech Mono', serif",
                          color: sgtEnabled ? "#6b3f8a" : "#8a7e6e",
                        },
                      },
                      React.createElement("input", {
                        type: "checkbox",
                        checked: sgtEnabled,
                        onChange: (e) => setSgtEnabled(e.target.checked),
                        style: { accentColor: "#6b3f8a" },
                      }),
                      sgtEnabled ? "Included" : "Include Sergeant",
                    ),
                  ),
                  sgtEnabled &&
                    React.createElement(
                      React.Fragment,
                      null,
                      React.createElement(
                        "div",
                        {
                          style: { display: "flex", gap: 6, flexWrap: "wrap" },
                        },
                        availableSgtWeapons.map((w) => {
                          const active = sgtWeapon?.name === w.name;
                          return React.createElement(
                            "button",
                            {
                              key: w.name,
                              onClick: () => setSgtWeapon(w),
                              style: {
                                padding: "6px 12px",
                                borderRadius: 6,
                                fontSize: 11,
                                cursor: "pointer",
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: active ? 700 : 400,
                                background: active
                                  ? "rgba(107,63,138,0.18)"
                                  : "#f0ebe2",
                                border: `1.5px solid ${active ? "#6b3f8a" : "#d0c4aa"}`,
                                color: active ? "#6b3f8a" : "#6a5e4e",
                                transition: "all 0.15s ease",
                                textAlign: "left",
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                minWidth: 100,
                              },
                            },
                            React.createElement(
                              "div",
                              { style: { fontWeight: 600, fontSize: 11 } },
                              w.name,
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 8,
                                  color: active ? "#5a2e7a" : "#8a7e6e",
                                  letterSpacing: 0.5,
                                },
                              },
                              w.type,
                              w.shots,
                              "· S",
                              w.s,
                              "AP",
                              w.ap,
                            ),
                          );
                        }),
                      ),
                      sgtWeapon &&
                        React.createElement(
                          "div",
                          {
                            style: {
                              marginTop: 8,
                              padding: "6px 10px",
                              borderRadius: 4,
                              background: "rgba(107,63,138,0.06)",
                              fontSize: 11,
                              color: "#4a4030",
                              fontFamily: "'Share Tech Mono', serif",
                              display: "flex",
                              gap: 12,
                              flexWrap: "wrap",
                              alignItems: "center",
                            },
                          },
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: 600,
                                color: "#6b3f8a",
                                fontSize: 10,
                              },
                            },
                            "SGT WEAPON:",
                          ),
                          React.createElement("span", null, sgtWeapon.name),
                          React.createElement(
                            "span",
                            null,
                            sgtWeapon.type,
                            sgtWeapon.shots,
                          ),
                          React.createElement(
                            "span",
                            null,
                            "S",
                            sgtWeapon.s,
                            "AP",
                            sgtWeapon.ap,
                            "D",
                            sgtWeapon.damage || 1,
                          ),
                          Object.keys(sgtWeapon.rules || {})
                            .filter((k) => sgtWeapon.rules[k])
                            .map((k) => {
                              const rule = SPECIAL_RULES.find(
                                (r) => r.id === k,
                              );
                              return rule
                                ? React.createElement(
                                    "span",
                                    {
                                      key: k,
                                      style: { color: "#6b3f8a", fontSize: 10 },
                                    },
                                    rule.label,
                                  )
                                : null;
                            }),
                        ),
                    ),
                ),
              selectedUnit &&
                availableWeapons.length > 1 &&
                React.createElement(
                  "div",
                  {
                    style: {
                      marginBottom: 14,
                      padding: "10px 14px",
                      borderRadius: 8,
                      background:
                        secondaryWeapons.length > 0
                          ? "rgba(196,106,27,0.06)"
                          : "#f9f6f0",
                      border: `1.5px solid ${secondaryWeapons.length > 0 ? "#c46a1b" : "#e0dbd0"}`,
                      transition: "all 0.15s ease",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: secondaryWeapons.length > 0 ? 10 : 0,
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        },
                      },
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 14,
                            color:
                              secondaryWeapons.length > 0
                                ? "#c46a1b"
                                : "#8a7e6e",
                          },
                        },
                        "🔫",
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 13,
                            color:
                              secondaryWeapons.length > 0
                                ? "#c46a1b"
                                : "#8a7e6e",
                            letterSpacing: 1,
                          },
                        },
                        "ADDITIONAL WEAPONS",
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 11,
                            color: "#a09888",
                            fontFamily: "'Share Tech Mono', serif",
                            fontStyle: "italic",
                          },
                        },
                        "(Terminators, Vehicles, etc.)",
                      ),
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: addSecondaryWeapon,
                        style: {
                          padding: "3px 10px",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 11,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 600,
                          background: "rgba(196,106,27,0.1)",
                          border: "1px solid rgba(196,106,27,0.3)",
                          color: "#c46a1b",
                        },
                      },
                      "+ ADD WEAPON",
                    ),
                  ),
                  secondaryWeapons.map((sw, idx) =>
                    React.createElement(
                      "div",
                      {
                        key: idx,
                        style: {
                          marginTop: 8,
                          padding: "8px 10px",
                          borderRadius: 6,
                          background: "rgba(196,106,27,0.04)",
                          border: "1px solid rgba(196,106,27,0.15)",
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          },
                        },
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontFamily: "'Share Tech Mono', serif",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#c46a1b",
                              letterSpacing: 0.5,
                            },
                          },
                          "WEAPON",
                          idx + 2,
                        ),
                        React.createElement("span", { style: { flex: 1 } }),
                        React.createElement(
                          "button",
                          {
                            onClick: () => removeSecondaryWeapon(idx),
                            style: {
                              padding: "2px 6px",
                              borderRadius: 3,
                              cursor: "pointer",
                              fontSize: 8,
                              fontFamily: "'Share Tech Mono', serif",
                              background: "rgba(199,64,64,0.08)",
                              border: "1px solid rgba(199,64,64,0.2)",
                              color: "#c74040",
                            },
                          },
                          "✕",
                        ),
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap",
                            marginBottom: 6,
                          },
                        },
                        availableWeapons.map((w) => {
                          const active = sw.weapon.name === w.name;
                          return React.createElement(
                            "button",
                            {
                              key: w.name,
                              onClick: () =>
                                updateSecondaryWeapon(idx, "weapon", w),
                              style: {
                                padding: "4px 10px",
                                borderRadius: 5,
                                fontSize: 12,
                                cursor: "pointer",
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: active ? 700 : 400,
                                background: active
                                  ? "rgba(196,106,27,0.15)"
                                  : "#f8f4ec",
                                border: `1px solid ${active ? "#c46a1b" : "#e0dbd0"}`,
                                color: active ? "#c46a1b" : "#6a5e4e",
                                transition: "all 0.12s ease",
                              },
                            },
                            w.name,
                          );
                        }),
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flexWrap: "wrap",
                          },
                        },
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            },
                          },
                          React.createElement(
                            "label",
                            {
                              style: {
                                fontSize: 11,
                                fontFamily: "'Share Tech Mono', serif",
                                color: "#6a5e4e",
                              },
                            },
                            "Models:",
                          ),
                          React.createElement("input", {
                            type: "number",
                            min: 1,
                            max: 40,
                            value: sw.models,
                            onChange: (e) =>
                              updateSecondaryWeapon(
                                idx,
                                "models",
                                Math.max(1, parseInt(e.target.value) || 1),
                              ),
                            style: {
                              width: 42,
                              padding: "3px 6px",
                              borderRadius: 3,
                              border: "1px solid #d0c4aa",
                              fontSize: 11,
                              fontFamily: "'Share Tech Mono', serif",
                              textAlign: "center",
                              background: "#fff",
                            },
                          }),
                        ),
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 12,
                              color: "#6a5e4e",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          sw.weapon.type,
                          sw.weapon.shots,
                          "· S",
                          sw.weapon.s,
                          "· AP",
                          sw.weapon.ap,
                          "· D",
                          sw.weapon.damage || 1,
                        ),
                        Object.keys(sw.weapon.rules || {})
                          .filter((k) => sw.weapon.rules[k])
                          .map((k) => {
                            const rule = SPECIAL_RULES.find((r) => r.id === k);
                            return rule
                              ? React.createElement(
                                  "span",
                                  {
                                    key: k,
                                    style: { fontSize: 11, color: "#c46a1b" },
                                  },
                                  rule.label,
                                )
                              : null;
                          }),
                      ),
                    ),
                  ),
                ),
              React.createElement(
                "div",
                { style: { marginBottom: 12 } },
                React.createElement(
                  "label",
                  {
                    style: {
                      fontSize: 13,
                      color: "#6a5e4e",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontFamily: "'Share Tech Mono', serif",
                      display: "block",
                      marginBottom: 6,
                    },
                  },
                  "Weapon Type",
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
                  WEAPON_TYPES.map((t) =>
                    React.createElement(
                      "button",
                      {
                        key: t,
                        onClick: () => setWeaponType(t),
                        style: {
                          padding: "6px 14px",
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: weaponType === t ? 700 : 400,
                          background:
                            weaponType === t
                              ? "rgba(184,134,11,0.25)"
                              : "#f0ebe2",
                          border: `1px solid ${weaponType === t ? "#b8860b" : "#d0c4aa"}`,
                          color: weaponType === t ? "#b8860b" : "#8a7e6e",
                          transition: "all 0.15s ease",
                        },
                      },
                      t,
                    ),
                  ),
                ),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  },
                },
                React.createElement(NumberInput, {
                  label: "Models",
                  value: numModels,
                  onChange: setNumModels,
                  min: 1,
                  max: 40,
                }),
                React.createElement(NumberInput, {
                  label: "Shots/Model",
                  value: numShots,
                  onChange: setNumShots,
                  min: 1,
                  max: 20,
                }),
                React.createElement(NumberInput, {
                  label: "BS",
                  value: bs,
                  onChange: setBs,
                  min: 1,
                  max: 10,
                }),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  },
                },
                React.createElement(NumberInput, {
                  label: "Strength",
                  value: strength,
                  onChange: setStrength,
                  min: 1,
                  max: 20,
                }),
                React.createElement(SelectInput, {
                  label: "AP",
                  value: ap,
                  onChange: setAp,
                  options: apOptions,
                }),
              ),
              React.createElement(
                "div",
                { style: { display: "flex", gap: 16, flexWrap: "wrap" } },
                weaponType === "Rapid Fire" &&
                  React.createElement(CheckToggle, {
                    checked: halfRange,
                    label: "Half Range",
                    onChange: setHalfRange,
                  }),
                React.createElement(CheckToggle, {
                  checked: moved,
                  label: "Moved",
                  onChange: setMoved,
                }),
                weaponType === "Barrage" &&
                  React.createElement(CheckToggle, {
                    checked: indirect,
                    label: "Indirect Fire (no LoS)",
                    onChange: setIndirect,
                  }),
                React.createElement(CheckToggle, {
                  checked: snapShots,
                  label: "Snap Shots",
                  onChange: setSnapShots,
                }),
              ),
            ),
            React.createElement(
              "div",
              { style: panelStyle },
              React.createElement(
                "div",
                {
                  style: {
                    ...panelHeaderStyle,
                    justifyContent: "space-between",
                  },
                },
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 8 } },
                  React.createElement(
                    "span",
                    { style: { color: "#2a6fb4", fontSize: 16 } },
                    "🛡",
                  ),
                  React.createElement("span", null, "TARGET UNIT"),
                ),
              ),
              React.createElement(
                "div",
                { style: { marginBottom: 14 } },
                targetPresetName
                  ? React.createElement(
                      "button",
                      {
                        onClick: () => setShowTargetPresets(true),
                        style: {
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          width: "100%",
                          padding: "8px 10px",
                          gap: 10,
                          borderRadius: 8,
                          cursor: "pointer",
                          background: "rgba(42,111,180,0.06)",
                          border: "1.5px solid #2a6fb4",
                          transition: "all 0.15s ease",
                          textAlign: "left",
                        },
                      },
                      typeof getUnitArtwork === "function" &&
                        getUnitArtwork(targetPresetId, targetFaction)
                        ? React.createElement("img", {
                            src: getUnitArtwork(targetPresetId, targetFaction),
                            alt: "",
                            style: {
                              width: 120,
                              height: 120,
                              objectFit: "contain",
                              background: "#1e1a14",
                              borderRadius: 6,
                              flexShrink: 0,
                              border: "1.5px solid rgba(42,111,180,0.3)",
                            },
                            onError: function (e) {
                              e.currentTarget.style.display = "none";
                            },
                          })
                        : null,
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flex: 1,
                          },
                        },
                        React.createElement(UnitIcon, {
                          type: getUnitIconType(targetPresetName),
                          size: 42,
                          color: "#2a6fb4",
                        }),
                        React.createElement(
                          "div",
                          { style: { flex: 1 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: 700,
                                fontSize: 16,
                                color: "#1e1a12",
                              },
                            },
                            targetPresetName,
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 14,
                                color: "#8a7e6e",
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "T",
                            toughness,
                            "Sv",
                            armourSave,
                            "+",
                            invulnSave !== "-" ? `Inv${invulnSave}+` : "",
                            coverSave !== "-" ? `Cov${coverSave}+` : "",
                            fnp !== "-" ? `FNP${fnp}+` : "",
                            "Ld",
                            leadership,
                          ),
                        ),
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 14,
                              color: "#2a6fb4",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "CHANGE ▸",
                        ),
                      ),
                    )
                  : React.createElement(
                      "button",
                      {
                        onClick: () => setShowTargetPresets(true),
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          width: "100%",
                          padding: "14px",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: "#f5f8fc",
                          border: "1.5px dashed #a0bdd8",
                          color: "#6a8aaa",
                          fontFamily: "'Share Tech Mono', serif",
                          fontSize: 12,
                          letterSpacing: 1,
                          transition: "all 0.15s ease",
                        },
                      },
                      React.createElement(
                        "span",
                        { style: { fontSize: 18 } },
                        "+",
                      ),
                      "SELECT TARGET",
                    ),
              ),
              showTargetPresets &&
                React.createElement(UnitSelectorModal, {
                  presets: UNIT_PRESETS,
                  selectedId: targetPresetName,
                  title: "SELECT TARGET UNIT",
                  accentColor: "#2a6fb4",
                  onClose: () => setShowTargetPresets(false),
                  onSelect: applyTargetPreset,
                  isTarget: true,
                }),
              targetPresetName &&
                React.createElement(
                  "div",
                  {
                    style: {
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    },
                  },
                  React.createElement(
                    "label",
                    {
                      style: {
                        fontSize: 12,
                        color: "#5a4e3e",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily: "'Share Tech Mono', serif",
                        whiteSpace: "nowrap",
                      },
                    },
                    "Legion",
                  ),
                  React.createElement(
                    "select",
                    {
                      value: targetFaction,
                      onChange: (e) => setTargetFaction(e.target.value),
                      style: {
                        flex: 1,
                        padding: "5px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        border: "1px solid #2a6fb4",
                        background: "#faf8f4",
                        color: "#2a2418",
                        cursor: "pointer",
                      },
                    },
                    LEGION_FACTIONS.map((f) =>
                      React.createElement(
                        "option",
                        { key: f.id, value: f.id },
                        f.name,
                      ),
                    ),
                  ),
                ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  },
                },
                React.createElement(NumberInput, {
                  label: "Toughness",
                  value: toughness,
                  onChange: setToughness,
                  min: 1,
                  max: 20,
                }),
                React.createElement(SelectInput, {
                  label: "Armour Save",
                  value: armourSave,
                  onChange: setArmourSave,
                  options: saveOptions,
                }),
                React.createElement(NumberInput, {
                  label: "Leadership",
                  value: leadership,
                  onChange: setLeadership,
                  min: 1,
                  max: 10,
                }),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 12,
                  },
                },
                React.createElement(SelectInput, {
                  label: "Invuln Save",
                  value: invulnSave,
                  onChange: setInvulnSave,
                  options: saveOptions,
                }),
                React.createElement(SelectInput, {
                  label: "Cover Save",
                  value: coverSave,
                  onChange: setCoverSave,
                  options: saveOptions,
                }),
                React.createElement(SelectInput, {
                  label: "FNP",
                  value: fnp,
                  onChange: setFnp,
                  options: saveOptions,
                }),
                React.createElement(NumberInput, {
                  label: "Unit Size",
                  value: targetModels,
                  onChange: setTargetModels,
                  min: 1,
                  max: 40,
                }),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 6,
                    marginTop: 10,
                    flexWrap: "wrap",
                  },
                },
                React.createElement(
                  "button",
                  {
                    onClick: () => setTargetHasVexilla((v) => !v),
                    title: EQUIPMENT_OPTIONS.vexilla.desc,
                    style: {
                      padding: "4px 10px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: targetHasVexilla ? 700 : 400,
                      background: targetHasVexilla
                        ? "rgba(46,94,62,0.12)"
                        : "#f8f4ec",
                      border: `1.5px solid ${targetHasVexilla ? "#2e5e3e" : "#e0d8c8"}`,
                      color: targetHasVexilla ? "#2e5e3e" : "#8a7e6e",
                      transition: "all 0.12s ease",
                    },
                  },
                  "⚑ Vexilla",
                  targetHasVexilla ? "✓" : "",
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => setTargetHasNoxVox((v) => !v),
                    title: EQUIPMENT_OPTIONS.noxVox.desc,
                    style: {
                      padding: "4px 10px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: targetHasNoxVox ? 700 : 400,
                      background: targetHasNoxVox
                        ? "rgba(46,94,62,0.12)"
                        : "#f8f4ec",
                      border: `1.5px solid ${targetHasNoxVox ? "#2e5e3e" : "#e0d8c8"}`,
                      color: targetHasNoxVox ? "#2e5e3e" : "#8a7e6e",
                      transition: "all 0.12s ease",
                    },
                  },
                  "📡 Nox-Vox",
                  targetHasNoxVox ? "✓" : "",
                ),
                (targetHasVexilla || targetHasNoxVox) &&
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 8,
                        color: "#2e5e3e",
                        fontFamily: "'Share Tech Mono', serif",
                        alignSelf: "center",
                        fontStyle: "italic",
                      },
                    },
                    targetHasVexilla ? "Re-roll Morale" : "",
                    targetHasVexilla && targetHasNoxVox ? " · " : "",
                    targetHasNoxVox ? "+1 Ld checks" : "",
                  ),
              ),
              targetAvailableWeapons.length > 0 &&
                React.createElement(
                  "div",
                  {
                    style: {
                      marginTop: 12,
                      padding: "10px 12px",
                      borderRadius: 6,
                      background: "rgba(139,69,19,0.03)",
                      border: "1px solid rgba(139,69,19,0.12)",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 12,
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        color: "#8b4513",
                        letterSpacing: 1,
                        marginBottom: 6,
                      },
                    },
                    "🔫 TARGET WEAPONS (for Return Fire)",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: 4,
                        marginBottom: 8,
                      },
                    },
                    React.createElement(NumberInput, {
                      label: "Target BS",
                      value: targetBS,
                      onChange: setTargetBS,
                      min: 1,
                      max: 6,
                    }),
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                        marginBottom: 8,
                      },
                    },
                    targetAvailableWeapons.map((w) => {
                      const active = targetSelectedWeapon?.name === w.name;
                      return React.createElement(
                        "button",
                        {
                          key: w.name,
                          onClick: () => applyReturnWeapon(w),
                          style: {
                            padding: "5px 10px",
                            borderRadius: 5,
                            cursor: "pointer",
                            fontSize: 12,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: active ? 700 : 400,
                            background: active
                              ? "rgba(139,69,19,0.12)"
                              : "#f8f4ec",
                            border: `1.5px solid ${active ? "#8b4513" : "#e0d8c8"}`,
                            color: active ? "#6b3410" : "#6a5e4e",
                            transition: "all 0.12s ease",
                            textAlign: "left",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          },
                        },
                        React.createElement(
                          "div",
                          { style: { fontWeight: 600, fontSize: 10 } },
                          w.name,
                        ),
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 7,
                              color: active ? "#5a2a0c" : "#8a7e6e",
                              letterSpacing: 0.5,
                            },
                          },
                          w.shots,
                          "sh S",
                          w.s,
                          "AP",
                          w.ap,
                          w.type,
                        ),
                      );
                    }),
                  ),
                  targetUnit &&
                    targetUnit.hasSgt &&
                    React.createElement(
                      "div",
                      {
                        style: {
                          padding: "8px 10px",
                          borderRadius: 5,
                          background: "rgba(107,63,138,0.04)",
                          border: "1px solid rgba(107,63,138,0.12)",
                          marginTop: 6,
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: targetSgtEnabled ? 6 : 0,
                          },
                        },
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 12,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 700,
                              color: "#6b3f8a",
                              letterSpacing: 1,
                            },
                          },
                          "★ TARGET SERGEANT",
                        ),
                        React.createElement(
                          "button",
                          {
                            onClick: () =>
                              setTargetSgtEnabled(!targetSgtEnabled),
                            style: {
                              padding: "3px 10px",
                              borderRadius: 3,
                              cursor: "pointer",
                              fontSize: 11,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: targetSgtEnabled ? 700 : 400,
                              background: targetSgtEnabled
                                ? "rgba(107,63,138,0.12)"
                                : "#f8f4ec",
                              border: `1px solid ${targetSgtEnabled ? "#6b3f8a" : "#d0c4aa"}`,
                              color: targetSgtEnabled ? "#6b3f8a" : "#8a7e6e",
                            },
                          },
                          targetSgtEnabled ? "✓ ON" : "OFF",
                        ),
                      ),
                      targetSgtEnabled &&
                        targetAvailableSgtWeapons.length > 0 &&
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              gap: 4,
                              flexWrap: "wrap",
                              marginTop: 4,
                            },
                          },
                          targetAvailableSgtWeapons.map((w) => {
                            const active = targetSgtWeapon?.name === w.name;
                            return React.createElement(
                              "button",
                              {
                                key: w.name,
                                onClick: () => setTargetSgtWeapon(w),
                                style: {
                                  padding: "4px 8px",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontSize: 11,
                                  fontFamily: "'Share Tech Mono', serif",
                                  fontWeight: active ? 700 : 400,
                                  background: active
                                    ? "rgba(107,63,138,0.12)"
                                    : "#f8f4ec",
                                  border: `1.5px solid ${active ? "#6b3f8a" : "#e0d8c8"}`,
                                  color: active ? "#6b3f8a" : "#6a5e4e",
                                },
                              },
                              w.name,
                              React.createElement(
                                "span",
                                {
                                  style: {
                                    fontSize: 7,
                                    color: "#8a7e6e",
                                    marginLeft: 3,
                                  },
                                },
                                w.shots,
                                "sh S",
                                w.s,
                                "AP",
                                w.ap,
                              ),
                            );
                          }),
                        ),
                    ),
                  targetAvailableWeapons.length > 1 &&
                    React.createElement(
                      "div",
                      {
                        style: {
                          marginTop: 8,
                          padding: "8px 10px",
                          borderRadius: 6,
                          background:
                            targetSecondaryWeapons.length > 0
                              ? "rgba(196,106,27,0.05)"
                              : "rgba(139,69,19,0.02)",
                          border: `1px solid ${targetSecondaryWeapons.length > 0 ? "rgba(196,106,27,0.2)" : "rgba(139,69,19,0.08)"}`,
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom:
                              targetSecondaryWeapons.length > 0 ? 6 : 0,
                          },
                        },
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 700,
                              color: "#c46a1b",
                              letterSpacing: 1,
                            },
                          },
                          "🔫 ADDITIONAL WEAPONS",
                        ),
                        React.createElement(
                          "button",
                          {
                            onClick: addTargetSecondaryWeapon,
                            style: {
                              padding: "2px 8px",
                              borderRadius: 3,
                              cursor: "pointer",
                              fontSize: 8,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 600,
                              background: "rgba(196,106,27,0.1)",
                              border: "1px solid rgba(196,106,27,0.3)",
                              color: "#c46a1b",
                            },
                          },
                          "+ ADD",
                        ),
                      ),
                      targetSecondaryWeapons.map((sw, idx) =>
                        React.createElement(
                          "div",
                          {
                            key: idx,
                            style: {
                              marginTop: 6,
                              padding: "6px 8px",
                              borderRadius: 5,
                              background: "rgba(196,106,27,0.04)",
                              border: "1px solid rgba(196,106,27,0.12)",
                            },
                          },
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginBottom: 4,
                              },
                            },
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontFamily: "'Share Tech Mono', serif",
                                  fontSize: 8,
                                  fontWeight: 700,
                                  color: "#c46a1b",
                                },
                              },
                              "WEAPON",
                              idx + 2,
                            ),
                            React.createElement("span", { style: { flex: 1 } }),
                            React.createElement(
                              "button",
                              {
                                onClick: () => removeTargetSecondaryWeapon(idx),
                                style: {
                                  padding: "1px 5px",
                                  borderRadius: 3,
                                  cursor: "pointer",
                                  fontSize: 7,
                                  fontFamily: "'Share Tech Mono', serif",
                                  background: "rgba(199,64,64,0.08)",
                                  border: "1px solid rgba(199,64,64,0.2)",
                                  color: "#c74040",
                                },
                              },
                              "✕",
                            ),
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                gap: 3,
                                flexWrap: "wrap",
                                marginBottom: 4,
                              },
                            },
                            targetAvailableWeapons.map((w) => {
                              const active = sw.weapon.name === w.name;
                              return React.createElement(
                                "button",
                                {
                                  key: w.name,
                                  onClick: () =>
                                    updateTargetSecondaryWeapon(
                                      idx,
                                      "weapon",
                                      w,
                                    ),
                                  style: {
                                    padding: "3px 7px",
                                    borderRadius: 4,
                                    fontSize: 8,
                                    cursor: "pointer",
                                    fontFamily: "'Share Tech Mono', serif",
                                    fontWeight: active ? 700 : 400,
                                    background: active
                                      ? "rgba(196,106,27,0.15)"
                                      : "#f8f4ec",
                                    border: `1px solid ${active ? "#c46a1b" : "#e0dbd0"}`,
                                    color: active ? "#c46a1b" : "#6a5e4e",
                                  },
                                },
                                w.name,
                              );
                            }),
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              },
                            },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 3,
                                },
                              },
                              React.createElement(
                                "label",
                                {
                                  style: {
                                    fontSize: 8,
                                    fontFamily: "'Share Tech Mono', serif",
                                    color: "#6a5e4e",
                                  },
                                },
                                "Models:",
                              ),
                              React.createElement("input", {
                                type: "number",
                                min: 1,
                                max: 40,
                                value: sw.models,
                                onChange: (e) =>
                                  updateTargetSecondaryWeapon(
                                    idx,
                                    "models",
                                    Math.max(1, parseInt(e.target.value) || 1),
                                  ),
                                style: {
                                  width: 36,
                                  padding: "2px 4px",
                                  borderRadius: 3,
                                  border: "1px solid #d0c4aa",
                                  fontSize: 12,
                                  fontFamily: "'Share Tech Mono', serif",
                                  textAlign: "center",
                                  background: "#fff",
                                },
                              }),
                            ),
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 8,
                                  color: "#6a5e4e",
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              sw.weapon.type,
                              sw.weapon.shots,
                              "· S",
                              sw.weapon.s,
                              "· AP",
                              sw.weapon.ap,
                            ),
                          ),
                        ),
                      ),
                    ),
                ),
            ),
          ),
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 16 } },
            React.createElement(
              "div",
              { style: panelHeaderStyle },
              React.createElement(
                "span",
                { style: { color: "#c46a1b", fontSize: 16 } },
                "✦",
              ),
              React.createElement("span", null, "SPECIAL RULES"),
            ),
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 10,
                },
              },
              SPECIAL_RULES.map((r) =>
                React.createElement(ToggleChip, {
                  key: r.id,
                  active: activeRules[r.id],
                  label: r.label,
                  desc: r.desc,
                  onClick: () => toggleRule(r.id),
                }),
              ),
            ),
            (() => {
              const activeList = SPECIAL_RULES.filter((r) => activeRules[r.id]);
              if (activeList.length === 0) return null;
              return React.createElement(
                "div",
                {
                  style: {
                    marginTop: 6,
                    borderTop: "1px solid #e0dbd0",
                    paddingTop: 8,
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 9,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#c46a1b",
                      letterSpacing: 1,
                      marginBottom: 5,
                    },
                  },
                  "ACTIVE RULE REFERENCE",
                ),
                React.createElement(
                  "div",
                  {
                    style: { display: "flex", flexDirection: "column", gap: 4 },
                  },
                  activeList.map((r) =>
                    React.createElement(
                      "div",
                      {
                        key: r.id,
                        style: {
                          display: "flex",
                          gap: 6,
                          alignItems: "flex-start",
                        },
                      },
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 10,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            color: "#c46a1b",
                            minWidth: 120,
                            flexShrink: 0,
                          },
                        },
                        r.label,
                        ":",
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 10,
                            color: "#6a5e4e",
                            fontFamily: "'Share Tech Mono', serif",
                            lineHeight: 1.4,
                          },
                        },
                        r.desc,
                      ),
                    ),
                  ),
                ),
              );
            })(),
          ),
          activeRules.barrage &&
            (() => {
              var SCATTER_LABELS = {
                hit: "💥",
                n: "⬆",
                ne: "↗",
                e: "➡",
                se: "↘",
                s: "⬇",
                sw: "↙",
                w: "⬅",
                nw: "↖",
              };
              var DIR_VECS = {
                n: [0, -1],
                ne: [1, -1],
                e: [1, 0],
                se: [1, 1],
                s: [0, 1],
                sw: [-1, 1],
                w: [-1, 0],
                nw: [-1, -1],
              };
              var rollBarrageScatter = () => {
                var isHit = Math.random() < 0.25;
                var dir = isHit
                  ? "hit"
                  : ["n", "ne", "e", "se", "s", "sw", "w", "nw"][
                      Math.floor(Math.random() * 8)
                    ];
                var d1 = Math.floor(Math.random() * 6) + 1;
                var d2 = Math.floor(Math.random() * 6) + 1;
                var dist = d1 + d2;
                setBarrageScatterDir(dir);
                setBarrageScatterDist(dist);
                setBarrageScatterDice([d1, d2]);
                if (dir !== "hit" && barrageBlastPos) {
                  var vec = DIR_VECS[dir];
                  var len = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
                  setBarrageBlastPos({
                    x: Math.max(
                      0,
                      Math.min(
                        BOARD_W,
                        barrageBlastPos.x + (vec[0] / len) * dist,
                      ),
                    ),
                    y: Math.max(
                      0,
                      Math.min(
                        BOARD_H,
                        barrageBlastPos.y + (vec[1] / len) * dist,
                      ),
                    ),
                  });
                }
              };
              return React.createElement(
                "div",
                {
                  style: {
                    ...panelStyle,
                    marginBottom: 16,
                    borderColor: "rgba(255,80,0,0.35)",
                    background: "rgba(255,60,0,0.03)",
                  },
                },
                React.createElement(
                  "div",
                  { style: panelHeaderStyle },
                  React.createElement(
                    "span",
                    { style: { color: "#ff5000", fontSize: 16 } },
                    "💣",
                  ),
                  React.createElement(
                    "span",
                    { style: { color: "#c46a1b" } },
                    "BARRAGE BLAST MARKER",
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: 8,
                      marginBottom: 10,
                      alignItems: "center",
                      flexWrap: "wrap",
                    },
                  },
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 11,
                        color: "#6a5e4e",
                        fontFamily: "'Share Tech Mono', serif",
                        letterSpacing: 1,
                      },
                    },
                    "BLAST SIZE:",
                  ),
                  [3, 5, 7].map((r) =>
                    React.createElement(
                      "button",
                      {
                        key: r,
                        onClick: () => setBarrageBlastRadius(r),
                        style: {
                          padding: "5px 14px",
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: "pointer",
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: barrageBlastRadius === r ? 700 : 400,
                          background:
                            barrageBlastRadius === r
                              ? "rgba(255,80,0,0.18)"
                              : "#f0ebe2",
                          border: `1.5px solid ${barrageBlastRadius === r ? "#ff5000" : "#d0c4aa"}`,
                          color:
                            barrageBlastRadius === r ? "#ff5000" : "#6a5e4e",
                        },
                      },
                      r === 3
                        ? 'SMALL (3")'
                        : r === 5
                          ? 'MEDIUM (5")'
                          : 'LARGE (7")',
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 11,
                      color: "#e05500",
                      fontFamily: "'Share Tech Mono', serif",
                      marginBottom: 10,
                      padding: "6px 10px",
                      background: "rgba(255,80,0,0.06)",
                      borderRadius: 4,
                      border: "1px dashed rgba(255,80,0,0.3)",
                      letterSpacing: 0.5,
                    },
                  },
                  "🎯 CLICK THE TACTICAL MAP ABOVE TO PLACE THE BLAST MARKER",
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginBottom: barrageScatterDir ? 8 : 0,
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        flex: 1,
                        minWidth: 140,
                        padding: "6px 10px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        background: "#f0ebe2",
                        border: "1px solid #d0c4aa",
                        color: "#4a4030",
                      },
                    },
                    barrageBlastPos
                      ? `📍 ${barrageBlastPos.x.toFixed(1)}", ${barrageBlastPos.y.toFixed(1)}"`
                      : "📍 No blast placed",
                  ),
                  React.createElement(
                    "button",
                    {
                      onClick: rollBarrageScatter,
                      disabled: !barrageBlastPos,
                      style: {
                        padding: "6px 14px",
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: barrageBlastPos ? "pointer" : "not-allowed",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        letterSpacing: 1,
                        background: barrageBlastPos
                          ? "linear-gradient(180deg, #ff6020, #cc4010)"
                          : "#d0c4aa",
                        border: "none",
                        color: "#fff",
                        opacity: barrageBlastPos ? 1 : 0.55,
                      },
                    },
                    "🎲 ROLL SCATTER",
                  ),
                  React.createElement(
                    "button",
                    {
                      onClick: () => {
                        setBarrageBlastPos(null);
                        setBarrageScatterDir(null);
                        setBarrageScatterDist(null);
                        setBarrageScatterDice(null);
                      },
                      style: {
                        padding: "6px 10px",
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "'Share Tech Mono', serif",
                        background: "#f0ebe2",
                        border: "1px solid #d0c4aa",
                        color: "#8a7e6e",
                      },
                    },
                    "CLEAR",
                  ),
                ),
                barrageScatterDir &&
                  React.createElement(
                    "div",
                    {
                      style: {
                        padding: "8px 12px",
                        borderRadius: 4,
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        flexWrap: "wrap",
                        background:
                          barrageScatterDir === "hit"
                            ? "rgba(46,125,50,0.1)"
                            : "rgba(255,80,0,0.08)",
                        border: `1px solid ${barrageScatterDir === "hit" ? "#2e7d32" : "rgba(255,80,0,0.3)"}`,
                      },
                    },
                    React.createElement(
                      "span",
                      { style: { fontSize: 26 } },
                      SCATTER_LABELS[barrageScatterDir],
                    ),
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 13,
                            color:
                              barrageScatterDir === "hit"
                                ? "#2e7d32"
                                : "#ff5000",
                          },
                        },
                        barrageScatterDir === "hit"
                          ? "HIT! — No scatter"
                          : `SCATTER: ${barrageScatterDir.toUpperCase()} · ${barrageScatterDist}"`,
                      ),
                      barrageScatterDir !== "hit" &&
                        barrageScatterDice &&
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 11,
                              color: "#6a5e4e",
                              fontFamily: "'Share Tech Mono', serif",
                              marginTop: 2,
                            },
                          },
                          `Dice: ${barrageScatterDice[0]} + ${barrageScatterDice[1]} = ${barrageScatterDist}" · Blast moved on map`,
                        ),
                    ),
                  ),
              );
            })(),
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                gap: 16,
                marginBottom: 16,
                alignItems: "stretch",
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  ...panelStyle,
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                },
              },
              React.createElement(StatBox, {
                label: "Exp. Hits",
                value: expected.expHits,
                color: "#b8860b",
              }),
              React.createElement(StatBox, {
                label: "Exp. Wounds",
                value: expected.expWounds,
                color: "#c74040",
              }),
              React.createElement(StatBox, {
                label: "Exp. Unsaved",
                value: expected.expUnsaved,
                color: "#2a6fb4",
              }),
              React.createElement(StatBox, {
                label: "Exp. Casualties",
                value: expected.expCasualties,
                color: "#2e7d32",
              }),
            ),
            React.createElement(
              "button",
              {
                onClick: handleResolve,
                style: {
                  padding: "16px 36px",
                  fontSize: 17,
                  fontFamily: "'Share Tech Mono', serif",
                  fontWeight: 700,
                  letterSpacing: 2,
                  background:
                    "linear-gradient(180deg, #c9a020 0%, #a07a10 100%)",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 12px rgba(184,134,11,0.25)",
                },
              },
              "⚔ RESOLVE",
            ),
          ),
          showFiringVideo &&
            React.createElement(
              "div",
              {
                style: {
                  marginBottom: 16,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#050505",
                  border: "2px solid rgba(184,134,11,0.45)",
                  boxShadow:
                    "0 0 28px rgba(255,100,0,0.25), 0 0 8px rgba(184,134,11,0.2)",
                  animation: "fadeIn 0.3s ease",
                },
              },
              React.createElement("video", {
                src: "artwork/Firing.mp4",
                autoPlay: true,
                muted: true,
                playsInline: true,
                style: { width: "100%", display: "block", maxHeight: 360 },
                onEnded: () => setShowFiringVideo(false),
                onError: () => setShowFiringVideo(false),
              }),
            ),
          result &&
            React.createElement(
              "div",
              {
                style: {
                  ...panelStyle,
                  animation: "fadeIn 0.3s ease",
                  marginBottom: 16,
                },
              },
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  },
                },
                React.createElement(
                  "div",
                  { style: panelHeaderStyle },
                  React.createElement(
                    "span",
                    { style: { color: "#2e7d32", fontSize: 16 } },
                    "☠",
                  ),
                  React.createElement("span", null, "RESOLUTION LOG"),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      background:
                        result.casualties > 0
                          ? "rgba(199,48,48,0.1)"
                          : "rgba(46,125,50,0.1)",
                      border: `1px solid ${result.casualties > 0 ? "#c74040" : "#2e7d32"}`,
                      borderRadius: 6,
                      padding: "6px 16px",
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      fontSize: 20,
                      color: result.casualties > 0 ? "#c73030" : "#2e7d32",
                      animation:
                        result.casualties > 0
                          ? "pulseGold 2s infinite"
                          : "none",
                    },
                  },
                  result.casualties,
                  "CASUALT",
                  result.casualties === 1 ? "Y" : "IES",
                ),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  },
                },
                React.createElement(MiniStat, {
                  label: "Shots",
                  value: result.totalShots,
                }),
                React.createElement(MiniStat, {
                  label: "Hits",
                  value: result.hits,
                }),
                React.createElement(MiniStat, {
                  label: "Wounds",
                  value: result.wounds,
                }),
                React.createElement(MiniStat, {
                  label: "Unsaved",
                  value: result.unsaved,
                }),
                React.createElement(MiniStat, {
                  label: "Casualties",
                  value: result.casualties,
                  color: result.casualties > 0 ? "#c73030" : "#2e7d32",
                }),
                result.getsHotWounds > 0 &&
                  React.createElement(MiniStat, {
                    label: "Gets Hot! Wounds",
                    value: result.getsHotWounds,
                    color: "#c73030",
                  }),
                result.deflagrateHits > 0 &&
                  React.createElement(MiniStat, {
                    label: "Deflagrate Hits",
                    value: result.deflagrateHits,
                    color: "#c46a1b",
                  }),
              ),
              result.weaponBreakdown &&
                result.weaponBreakdown.length > 1 &&
                React.createElement(
                  "div",
                  {
                    style: {
                      marginBottom: 16,
                      borderRadius: 6,
                      overflow: "hidden",
                      border: "1px solid rgba(196,106,27,0.2)",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        padding: "6px 12px",
                        background: "rgba(196,106,27,0.08)",
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#c46a1b",
                        letterSpacing: 1,
                        fontWeight: 700,
                      },
                    },
                    "🔫 WEAPON BREAKDOWN",
                  ),
                  result.weaponBreakdown.map((wb, i) =>
                    React.createElement(
                      "div",
                      {
                        key: i,
                        style: {
                          display: "flex",
                          gap: 12,
                          padding: "6px 12px",
                          fontSize: 11,
                          fontFamily: "'Share Tech Mono', serif",
                          background:
                            i % 2 === 0
                              ? "rgba(196,106,27,0.03)"
                              : "transparent",
                          borderTop:
                            i > 0 ? "1px solid rgba(196,106,27,0.08)" : "none",
                          alignItems: "center",
                          flexWrap: "wrap",
                        },
                      },
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 600,
                            fontSize: 12,
                            color: "#c46a1b",
                            minWidth: 120,
                          },
                        },
                        wb.name,
                      ),
                      React.createElement(
                        "span",
                        { style: { color: "#6a5e4e" } },
                        wb.models,
                        "× models",
                      ),
                      React.createElement(
                        "span",
                        { style: { color: "#6a5e4e" } },
                        wb.shots,
                        "shots",
                      ),
                      React.createElement(
                        "span",
                        { style: { color: "#6a5e4e" } },
                        wb.hits,
                        "hits",
                      ),
                      React.createElement(
                        "span",
                        { style: { color: "#6a5e4e" } },
                        wb.wounds,
                        "wounds",
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontWeight: 600,
                            color: wb.casualties > 0 ? "#c73030" : "#2e7d32",
                          },
                        },
                        wb.casualties,
                        "☠",
                      ),
                    ),
                  ),
                ),
              result.statusEffects &&
                result.statusEffects.length > 0 &&
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: 8,
                      marginBottom: 16,
                      flexWrap: "wrap",
                    },
                  },
                  result.statusEffects.map((s, i) =>
                    React.createElement(
                      "div",
                      {
                        key: i,
                        style: {
                          padding: "6px 14px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          letterSpacing: 1,
                          background:
                            s === "Falling Back" || s === "Panicked"
                              ? "rgba(199,48,48,0.15)"
                              : "rgba(139,90,43,0.15)",
                          border: `1px solid ${s === "Falling Back" || s === "Panicked" ? "#c73030" : "#8b5a2b"}`,
                          color:
                            s === "Falling Back" || s === "Panicked"
                              ? "#c73030"
                              : "#8b5a2b",
                        },
                      },
                      s === "Pinned" && "📌 ",
                      s === "Suppressed" && "🔻 ",
                      s === "Stunned" && "⚡ ",
                      s === "Panicked" && "😱 ",
                      s === "Falling Back" && "🏳 ",
                      s,
                    ),
                  ),
                ),
              result.ldRolls &&
                result.ldRolls.length > 0 &&
                React.createElement(
                  "div",
                  { style: { marginBottom: 12 } },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 13,
                        color: "#6a5e4e",
                        marginBottom: 6,
                        fontFamily: "'Share Tech Mono', serif",
                      },
                    },
                    "LEADERSHIP CHECKS",
                  ),
                  React.createElement(
                    "div",
                    { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
                    result.ldRolls.map((lr, i) =>
                      React.createElement(
                        "div",
                        {
                          key: i,
                          style: {
                            padding: "5px 12px",
                            borderRadius: 4,
                            fontSize: 12,
                            fontFamily: "'Share Tech Mono', serif",
                            background: lr.passed
                              ? "rgba(46,125,50,0.1)"
                              : "rgba(199,48,48,0.1)",
                            border: `1px solid ${lr.passed ? "#2e7d32" : "#c74040"}`,
                            color: lr.passed ? "#2e7d32" : "#c74040",
                          },
                        },
                        lr.type,
                        ":",
                        lr.roll.join("+"),
                        "=",
                        lr.total,
                        "vs Ld",
                        lr.needed,
                        "→",
                        lr.passed ? "✓ Passed" : "✗ Failed",
                      ),
                    ),
                  ),
                ),
              result.rollsByWeapon && result.rollsByWeapon.length > 0
                ? result.rollsByWeapon.map((wg, wi) => {
                    const hasAny =
                      wg.rolls.hit.length > 0 ||
                      wg.rolls.wound.length > 0 ||
                      wg.rolls.save.length > 0 ||
                      (wg.rolls.fnpRolls || []).length > 0;
                    if (!hasAny) return null;
                    return React.createElement(
                      "div",
                      {
                        key: wi,
                        style: {
                          marginBottom: 10,
                          padding: "8px 10px",
                          borderRadius: 6,
                          background:
                            wi % 2 === 0
                              ? "rgba(184,134,11,0.03)"
                              : "rgba(196,106,27,0.03)",
                          border: `1px solid ${wi === 0 ? "rgba(184,134,11,0.15)" : "rgba(196,106,27,0.15)"}`,
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 12,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            letterSpacing: 1,
                            marginBottom: 6,
                            color: wg.name.startsWith("★")
                              ? "#6b3f8a"
                              : wi === 0
                                ? "#b8860b"
                                : "#c46a1b",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                        },
                        React.createElement("span", null, wg.name),
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 8,
                              fontWeight: 400,
                              color: "#8a7e6e",
                            },
                          },
                          "(",
                          wg.models,
                          "model",
                          wg.models !== 1 ? "s" : "",
                          ")",
                        ),
                      ),
                      wg.rolls.hit.length > 0 &&
                        React.createElement(
                          "div",
                          { style: { marginBottom: 5 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "#6a5e4e",
                                marginBottom: 2,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "TO HIT",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 2,
                              },
                            },
                            wg.rolls.hit.map((r, i) =>
                              React.createElement(DieIcon, {
                                key: i,
                                value: r.value,
                                success: r.success,
                                reroll: r.reroll,
                                small: true,
                              }),
                            ),
                          ),
                        ),
                      wg.rolls.wound.length > 0 &&
                        React.createElement(
                          "div",
                          { style: { marginBottom: 5 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "#6a5e4e",
                                marginBottom: 2,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "TO WOUND",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 2,
                              },
                            },
                            wg.rolls.wound.map((r, i) =>
                              React.createElement(DieIcon, {
                                key: i,
                                value: r.value,
                                success: r.success,
                                reroll: r.reroll,
                                small: true,
                              }),
                            ),
                          ),
                        ),
                      wg.rolls.save.length > 0 &&
                        React.createElement(
                          "div",
                          { style: { marginBottom: 5 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "#6a5e4e",
                                marginBottom: 2,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "SAVES",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 2,
                              },
                            },
                            wg.rolls.save.map((r, i) =>
                              React.createElement(DieIcon, {
                                key: i,
                                value: r.value,
                                success: r.success,
                                small: true,
                              }),
                            ),
                          ),
                        ),
                      wg.rolls.fnpRolls &&
                        wg.rolls.fnpRolls.length > 0 &&
                        React.createElement(
                          "div",
                          { style: { marginBottom: 2 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "#6a5e4e",
                                marginBottom: 2,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "FEEL NO PAIN",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 2,
                              },
                            },
                            wg.rolls.fnpRolls.map((r, i) =>
                              React.createElement(DieIcon, {
                                key: i,
                                value: r.value,
                                success: r.success,
                                small: true,
                              }),
                            ),
                          ),
                        ),
                    );
                  })
                : React.createElement(
                    React.Fragment,
                    null,
                    result.rolls.hit.length > 0 &&
                      React.createElement(
                        "div",
                        { style: { marginBottom: 8 } },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 13,
                              color: "#6a5e4e",
                              marginBottom: 4,
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "TO HIT ROLLS",
                        ),
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 2,
                            },
                          },
                          result.rolls.hit.map((r, i) =>
                            React.createElement(DieIcon, {
                              key: i,
                              value: r.value,
                              success: r.success,
                              reroll: r.reroll,
                              small: true,
                            }),
                          ),
                        ),
                      ),
                    result.rolls.wound.length > 0 &&
                      React.createElement(
                        "div",
                        { style: { marginBottom: 8 } },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 13,
                              color: "#6a5e4e",
                              marginBottom: 4,
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "TO WOUND ROLLS",
                        ),
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 2,
                            },
                          },
                          result.rolls.wound.map((r, i) =>
                            React.createElement(DieIcon, {
                              key: i,
                              value: r.value,
                              success: r.success,
                              reroll: r.reroll,
                              small: true,
                            }),
                          ),
                        ),
                      ),
                    result.rolls.save.length > 0 &&
                      React.createElement(
                        "div",
                        { style: { marginBottom: 8 } },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 13,
                              color: "#6a5e4e",
                              marginBottom: 4,
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "SAVING THROWS",
                        ),
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 2,
                            },
                          },
                          result.rolls.save.map((r, i) =>
                            React.createElement(DieIcon, {
                              key: i,
                              value: r.value,
                              success: r.success,
                              small: true,
                            }),
                          ),
                        ),
                      ),
                    result.rolls.fnpRolls &&
                      result.rolls.fnpRolls.length > 0 &&
                      React.createElement(
                        "div",
                        { style: { marginBottom: 8 } },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 13,
                              color: "#6a5e4e",
                              marginBottom: 4,
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "FEEL NO PAIN",
                        ),
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 2,
                            },
                          },
                          result.rolls.fnpRolls.map((r, i) =>
                            React.createElement(DieIcon, {
                              key: i,
                              value: r.value,
                              success: r.success,
                              small: true,
                            }),
                          ),
                        ),
                      ),
                  ),
              React.createElement(
                "div",
                {
                  style: {
                    marginTop: 12,
                    borderTop: "1px solid #d0c4aa",
                    paddingTop: 12,
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 13,
                      color: "#5a4e3e",
                      marginBottom: 8,
                      fontFamily: "'Share Tech Mono', serif",
                    },
                  },
                  "DETAILED LOG",
                ),
                result.log.map((entry, i) =>
                  React.createElement(
                    "div",
                    {
                      key: i,
                      style: {
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                        marginBottom: 4,
                        fontSize: 13,
                      },
                    },
                    React.createElement(
                      "span",
                      {
                        style: {
                          color: phaseColors[entry.phase],
                          minWidth: 16,
                          textAlign: "center",
                        },
                      },
                      phaseIcons[entry.phase],
                    ),
                    React.createElement(
                      "span",
                      {
                        style: {
                          color: phaseColors[entry.phase],
                          minWidth: 70,
                          fontFamily: "'Share Tech Mono', serif",
                          fontSize: 12,
                          lineHeight: "20px",
                          textTransform: "uppercase",
                        },
                      },
                      entry.phase,
                    ),
                    React.createElement(
                      "span",
                      { style: { color: "#4a4030" } },
                      entry.text,
                    ),
                  ),
                ),
              ),
            ),
          result &&
            React.createElement(
              "div",
              {
                style: {
                  ...panelStyle,
                  marginBottom: 16,
                  borderColor: doReturnFire ? "#8b4513" : "#d0c4aa",
                  transition: "border-color 0.3s ease",
                },
              },
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: doReturnFire ? 12 : 0,
                  },
                },
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 8 } },
                  React.createElement(
                    "span",
                    { style: { fontSize: 18, color: "#8b4513" } },
                    "🎯",
                  ),
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "#8b4513",
                        letterSpacing: 2,
                      },
                    },
                    "RETURN FIRE REACTION",
                  ),
                ),
                React.createElement(CheckToggle, {
                  checked: doReturnFire,
                  label: "Enabled",
                  onChange: (v) => {
                    setDoReturnFire(v);
                    if (!v) setReturnFireResult(null);
                  },
                }),
              ),
              doReturnFire &&
                React.createElement(
                  "div",
                  { style: { animation: "fadeIn 0.2s ease" } },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 12,
                        color: "#8a7e6e",
                        fontFamily: "'Share Tech Mono', serif",
                        marginBottom: 10,
                        fontStyle: "italic",
                      },
                    },
                    "Target unit fires back as a reaction using configured weapons — BS",
                    targetBS,
                    "(",
                    BS_TO_HIT[targetBS] || 4,
                    "+ to hit)",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginBottom: 12,
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: "rgba(139,69,19,0.03)",
                        border: "1px solid rgba(139,69,19,0.1)",
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 11,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          color: "#8b4513",
                          letterSpacing: 1,
                          marginBottom: 6,
                        },
                      },
                      "FIRING WEAPONS",
                    ),
                    targetSelectedWeapon &&
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 3,
                          },
                        },
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              color: "#8b4513",
                              fontWeight: 700,
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "Primary:",
                        ),
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 13,
                              color: "#2a2018",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          targetSelectedWeapon.name,
                          "—",
                          returnFireShots,
                          "sh S",
                          returnFireS,
                          "AP",
                          returnFireAP,
                          "×",
                          Math.max(
                            0,
                            targetModels -
                              (targetSgtEnabled ? 1 : 0) -
                              targetSecondaryWeapons.reduce(
                                (s, sw) => s + (sw.models || 0),
                                0,
                              ),
                          ),
                          "models",
                        ),
                      ),
                    targetSecondaryWeapons.map((sw, idx) =>
                      React.createElement(
                        "div",
                        {
                          key: idx,
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 3,
                          },
                        },
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              color: "#c46a1b",
                              fontWeight: 700,
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "Weapon",
                          idx + 2,
                          ":",
                        ),
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 13,
                              color: "#2a2018",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          sw.weapon.name,
                          "—",
                          sw.weapon.shots,
                          "sh S",
                          sw.weapon.s,
                          "AP",
                          sw.weapon.ap,
                          "×",
                          sw.models,
                          "model",
                          sw.models !== 1 ? "s" : "",
                        ),
                      ),
                    ),
                    targetSgtEnabled &&
                      targetSgtWeapon &&
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                        },
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              color: "#6b3f8a",
                              fontWeight: 700,
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          "★ Sergeant:",
                        ),
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 13,
                              color: "#2a2018",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          targetSgtWeapon.name,
                          "—",
                          targetSgtWeapon.shots,
                          "sh S",
                          targetSgtWeapon.s,
                          "AP",
                          targetSgtWeapon.ap,
                        ),
                      ),
                    !targetSelectedWeapon &&
                      targetSecondaryWeapons.length === 0 &&
                      !targetSgtEnabled &&
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 11,
                            color: "#8a7e6e",
                            fontStyle: "italic",
                            fontFamily: "'Share Tech Mono', serif",
                          },
                        },
                        "No weapons configured — select weapons on the Target Unit panel above",
                      ),
                  ),
                  React.createElement(
                    "button",
                    {
                      onClick: handleReturnFire,
                      style: {
                        width: "100%",
                        padding: "12px 24px",
                        fontSize: 17,
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 700,
                        letterSpacing: 2,
                        background:
                          "linear-gradient(180deg, #a0622a 0%, #7a4a1a 100%)",
                        border: "none",
                        borderRadius: 6,
                        color: "#fff",
                        cursor: "pointer",
                        textTransform: "uppercase",
                        boxShadow: "0 2px 12px rgba(139,69,19,0.25)",
                        marginBottom: returnFireResult ? 14 : 0,
                      },
                    },
                    "🎯 RESOLVE RETURN FIRE",
                  ),
                  returnFireResult &&
                    React.createElement(
                      "div",
                      {
                        style: { animation: "fadeIn 0.3s ease", marginTop: 12 },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "10px 16px",
                            borderRadius: 8,
                            marginBottom: 12,
                            background:
                              returnFireResult.casualties > 0
                                ? "rgba(139,69,19,0.08)"
                                : "rgba(100,100,100,0.05)",
                            border: `2px solid ${returnFireResult.casualties > 0 ? "#8b4513" : "#aaa"}`,
                          },
                        },
                        React.createElement(
                          "span",
                          { style: { fontSize: 24 } },
                          returnFireResult.casualties > 0 ? "🎯" : "✖",
                        ),
                        React.createElement(
                          "div",
                          { style: { textAlign: "center" } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: 900,
                                fontSize: 16,
                                letterSpacing: 2,
                                color:
                                  returnFireResult.casualties > 0
                                    ? "#8b4513"
                                    : "#8a7e6e",
                              },
                            },
                            returnFireResult.casualties > 0
                              ? `${returnFireResult.casualties} ATTACKER MODEL(S) SLAIN`
                              : "NO CASUALTIES",
                          ),
                        ),
                      ),
                      returnFireResult.rollsByWeapon &&
                        returnFireResult.rollsByWeapon.length > 0
                        ? returnFireResult.rollsByWeapon.map((wg, wi) => {
                            const r = wg.rolls || {};
                            const hasAny =
                              (r.hit || []).length > 0 ||
                              (r.wound || []).length > 0 ||
                              (r.save || []).length > 0 ||
                              (r.fnpRolls || []).length > 0;
                            if (!hasAny) return null;
                            const isSgt = wg.name.startsWith("★");
                            return React.createElement(
                              "div",
                              {
                                key: wi,
                                style: {
                                  marginBottom: 8,
                                  padding: "8px 10px",
                                  borderRadius: 6,
                                  background: isSgt
                                    ? "rgba(107,63,138,0.03)"
                                    : "rgba(139,69,19,0.03)",
                                  border: `1px solid ${isSgt ? "rgba(107,63,138,0.15)" : "rgba(139,69,19,0.12)"}`,
                                },
                              },
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    fontSize: 12,
                                    fontFamily: "'Share Tech Mono', serif",
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    marginBottom: 6,
                                    color: isSgt ? "#6b3f8a" : "#8b4513",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  },
                                },
                                React.createElement("span", null, "↩", wg.name),
                                React.createElement(
                                  "span",
                                  {
                                    style: {
                                      fontSize: 8,
                                      fontWeight: 400,
                                      color: "#8a7e6e",
                                    },
                                  },
                                  "(",
                                  wg.models,
                                  "model",
                                  wg.models !== 1 ? "s" : "",
                                  ")",
                                ),
                              ),
                              (r.hit || []).length > 0 &&
                                React.createElement(
                                  "div",
                                  { style: { marginBottom: 4 } },
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        fontSize: 11,
                                        color: isSgt ? "#6b3f8a" : "#8b4513",
                                        marginBottom: 2,
                                        fontFamily: "'Share Tech Mono', serif",
                                      },
                                    },
                                    "TO HIT",
                                  ),
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        display: "flex",
                                        gap: 2,
                                        flexWrap: "wrap",
                                      },
                                    },
                                    r.hit.map((d, i) =>
                                      React.createElement(DieIcon, {
                                        key: `rfh${wi}${i}`,
                                        value: d.value,
                                        success: d.success,
                                        small: true,
                                      }),
                                    ),
                                  ),
                                ),
                              (r.wound || []).length > 0 &&
                                React.createElement(
                                  "div",
                                  { style: { marginBottom: 4 } },
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        fontSize: 11,
                                        color: isSgt ? "#6b3f8a" : "#8b4513",
                                        marginBottom: 2,
                                        fontFamily: "'Share Tech Mono', serif",
                                      },
                                    },
                                    "TO WOUND",
                                  ),
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        display: "flex",
                                        gap: 2,
                                        flexWrap: "wrap",
                                      },
                                    },
                                    r.wound.map((d, i) =>
                                      React.createElement(DieIcon, {
                                        key: `rfw${wi}${i}`,
                                        value: d.value,
                                        success: d.success,
                                        small: true,
                                      }),
                                    ),
                                  ),
                                ),
                              (r.save || []).length > 0 &&
                                React.createElement(
                                  "div",
                                  { style: { marginBottom: 4 } },
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        fontSize: 11,
                                        color: isSgt ? "#6b3f8a" : "#8b4513",
                                        marginBottom: 2,
                                        fontFamily: "'Share Tech Mono', serif",
                                      },
                                    },
                                    "SAVES",
                                  ),
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        display: "flex",
                                        gap: 2,
                                        flexWrap: "wrap",
                                      },
                                    },
                                    r.save.map((d, i) =>
                                      React.createElement(DieIcon, {
                                        key: `rfs${wi}${i}`,
                                        value: d.value,
                                        success: d.success,
                                        small: true,
                                      }),
                                    ),
                                  ),
                                ),
                              (r.fnpRolls || []).length > 0 &&
                                React.createElement(
                                  "div",
                                  null,
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        fontSize: 11,
                                        color: isSgt ? "#6b3f8a" : "#8b4513",
                                        marginBottom: 2,
                                        fontFamily: "'Share Tech Mono', serif",
                                      },
                                    },
                                    "FNP",
                                  ),
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        display: "flex",
                                        gap: 2,
                                        flexWrap: "wrap",
                                      },
                                    },
                                    r.fnpRolls.map((d, i) =>
                                      React.createElement(DieIcon, {
                                        key: `rff${wi}${i}`,
                                        value: d.value,
                                        success: d.success,
                                        small: true,
                                      }),
                                    ),
                                  ),
                                ),
                            );
                          })
                        : React.createElement(
                            "div",
                            {
                              style: {
                                padding: "8px 10px",
                                borderRadius: 6,
                                marginBottom: 8,
                                background: "rgba(139,69,19,0.03)",
                                border: "1px solid rgba(139,69,19,0.12)",
                              },
                            },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 12,
                                  fontFamily: "'Share Tech Mono', serif",
                                  fontWeight: 700,
                                  letterSpacing: 1,
                                  marginBottom: 6,
                                  color: "#8b4513",
                                },
                              },
                              "↩ RETURN FIRE",
                            ),
                            returnFireResult.rolls.hit.length > 0 &&
                              React.createElement(
                                "div",
                                { style: { marginBottom: 4 } },
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      fontSize: 11,
                                      color: "#8b4513",
                                      marginBottom: 2,
                                      fontFamily: "'Share Tech Mono', serif",
                                    },
                                  },
                                  "TO HIT",
                                ),
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      display: "flex",
                                      gap: 2,
                                      flexWrap: "wrap",
                                    },
                                  },
                                  returnFireResult.rolls.hit.map((d, i) =>
                                    React.createElement(DieIcon, {
                                      key: `rfh${i}`,
                                      value: d.value,
                                      success: d.success,
                                      small: true,
                                    }),
                                  ),
                                ),
                              ),
                            returnFireResult.rolls.wound.length > 0 &&
                              React.createElement(
                                "div",
                                { style: { marginBottom: 4 } },
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      fontSize: 11,
                                      color: "#8b4513",
                                      marginBottom: 2,
                                      fontFamily: "'Share Tech Mono', serif",
                                    },
                                  },
                                  "TO WOUND",
                                ),
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      display: "flex",
                                      gap: 2,
                                      flexWrap: "wrap",
                                    },
                                  },
                                  returnFireResult.rolls.wound.map((d, i) =>
                                    React.createElement(DieIcon, {
                                      key: `rfw${i}`,
                                      value: d.value,
                                      success: d.success,
                                      small: true,
                                    }),
                                  ),
                                ),
                              ),
                            returnFireResult.rolls.save.length > 0 &&
                              React.createElement(
                                "div",
                                { style: { marginBottom: 4 } },
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      fontSize: 11,
                                      color: "#8b4513",
                                      marginBottom: 2,
                                      fontFamily: "'Share Tech Mono', serif",
                                    },
                                  },
                                  "SAVES",
                                ),
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      display: "flex",
                                      gap: 2,
                                      flexWrap: "wrap",
                                    },
                                  },
                                  returnFireResult.rolls.save.map((d, i) =>
                                    React.createElement(DieIcon, {
                                      key: `rfs${i}`,
                                      value: d.value,
                                      success: d.success,
                                      small: true,
                                    }),
                                  ),
                                ),
                              ),
                            returnFireResult.rolls.fnp &&
                              returnFireResult.rolls.fnp.length > 0 &&
                              React.createElement(
                                "div",
                                null,
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      fontSize: 11,
                                      color: "#8b4513",
                                      marginBottom: 2,
                                      fontFamily: "'Share Tech Mono', serif",
                                    },
                                  },
                                  "FNP",
                                ),
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      display: "flex",
                                      gap: 2,
                                      flexWrap: "wrap",
                                    },
                                  },
                                  returnFireResult.rolls.fnp.map((d, i) =>
                                    React.createElement(DieIcon, {
                                      key: `rff${i}`,
                                      value: d.value,
                                      success: d.success,
                                      small: true,
                                    }),
                                  ),
                                ),
                              ),
                          ),
                      React.createElement(
                        "div",
                        { style: { marginTop: 8 } },
                        returnFireResult.log.map((entry, i) =>
                          React.createElement(
                            "div",
                            {
                              key: i,
                              style: {
                                fontSize: 12,
                                padding: "3px 8px",
                                borderRadius: 4,
                                marginBottom: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                background: "rgba(139,69,19,0.04)",
                              },
                            },
                            React.createElement(
                              "span",
                              { style: { fontSize: 10 } },
                              phaseIcons[entry.phase] || "•",
                            ),
                            React.createElement(
                              "span",
                              {
                                style: {
                                  color: phaseColors[entry.phase] || "#6a5e4e",
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              entry.text,
                            ),
                          ),
                        ),
                      ),
                    ),
                ),
            ),
          renderResultsTracker(["shooting", "returnFire"]),
          history.length > 1 &&
            React.createElement(
              "div",
              { style: { ...panelStyle } },
              React.createElement(
                "div",
                { style: panelHeaderStyle },
                React.createElement(
                  "span",
                  { style: { color: "#8a7e6e", fontSize: 16 } },
                  "📜",
                ),
                React.createElement("span", null, "ROLL HISTORY"),
              ),
              React.createElement(
                "div",
                { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
                history.map((h, i) =>
                  React.createElement(
                    "div",
                    {
                      key: h.timestamp,
                      style: {
                        padding: "6px 12px",
                        borderRadius: 4,
                        fontSize: 12,
                        background:
                          i === 0 ? "rgba(184,134,11,0.1)" : "#f0ebe2",
                        border: `1px solid ${i === 0 ? "#c0b498" : "#f0ebe2"}`,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#6a5e4e",
                      },
                    },
                    h.totalShots,
                    "→",
                    h.hits,
                    "→",
                    h.wounds,
                    "→",
                    React.createElement(
                      "span",
                      {
                        style: {
                          color: h.casualties > 0 ? "#c73030" : "#2e7d32",
                          fontWeight: 600,
                        },
                      },
                      h.casualties,
                      "☠",
                    ),
                  ),
                ),
              ),
            ),
          React.createElement(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginTop: 16,
              },
            },
            React.createElement(
              "div",
              { style: panelStyle },
              React.createElement(
                "div",
                { style: panelHeaderStyle },
                React.createElement("span", null, "📊"),
                React.createElement("span", null, "TO HIT TABLE"),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 4,
                    fontSize: 12,
                  },
                },
                [1, 2, 3, 4, 5].map((bsVal) =>
                  React.createElement(
                    "div",
                    {
                      key: bsVal,
                      style: {
                        textAlign: "center",
                        padding: 4,
                        background:
                          bs === bsVal ? "rgba(184,134,11,0.2)" : "transparent",
                        borderRadius: 3,
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          color: "#8a7e6e",
                          fontSize: 12,
                          fontFamily: "'Share Tech Mono', serif",
                        },
                      },
                      "BS",
                      bsVal,
                    ),
                    React.createElement(
                      "div",
                      { style: { color: "#b8860b", fontWeight: 600 } },
                      BS_TO_HIT[bsVal],
                      "+",
                    ),
                  ),
                ),
              ),
            ),
            React.createElement(
              "div",
              { style: panelStyle },
              React.createElement(
                "div",
                { style: panelHeaderStyle },
                React.createElement("span", null, "📊"),
                React.createElement("span", null, "TO WOUND TABLE"),
              ),
              React.createElement(
                "table",
                {
                  style: {
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 11,
                  },
                },
                React.createElement(
                  "thead",
                  null,
                  React.createElement(
                    "tr",
                    null,
                    React.createElement("td", { style: refCellStyle }),
                    [1, 2, 3, 4, 5, 6, 7, 8].map((t2) =>
                      React.createElement(
                        "td",
                        {
                          key: t2,
                          style: {
                            ...refCellStyle,
                            color: toughness === t2 ? "#2a6fb4" : "#8a7e6e",
                          },
                        },
                        "T",
                        t2,
                      ),
                    ),
                  ),
                ),
                React.createElement(
                  "tbody",
                  null,
                  [1, 2, 3, 4, 5, 6, 7, 8].map((s2) =>
                    React.createElement(
                      "tr",
                      { key: s2 },
                      React.createElement(
                        "td",
                        {
                          style: {
                            ...refCellStyle,
                            color: strength === s2 ? "#b8860b" : "#8a7e6e",
                          },
                        },
                        "S",
                        s2,
                      ),
                      [1, 2, 3, 4, 5, 6, 7, 8].map((t2) => {
                        const wr = getWoundRoll(s2, t2);
                        const active = strength === s2 && toughness === t2;
                        return React.createElement(
                          "td",
                          {
                            key: t2,
                            style: {
                              ...refCellStyle,
                              background: active
                                ? "rgba(184,134,11,0.25)"
                                : "transparent",
                              color:
                                wr === null
                                  ? "#d0c0b0"
                                  : active
                                    ? "#2a2418"
                                    : "#8a7e6e",
                              fontWeight: active ? 700 : 400,
                            },
                          },
                          wr ? `${wr}+` : "–",
                        );
                      }),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      activePhase === "assault" &&
        React.createElement(
          React.Fragment,
          null,
          deployedUnits.length > 0 &&
            renderTacticalMap({
              refObj: assaultMapRef,
              phase: "assault",
              onUnitClick: (unit) => {
                if (!mapAttackerId) {
                  handleMapAttackerSelect(unit);
                } else if (!mapTargetId && unit.id !== mapAttackerId) {
                  handleMapTargetSelect(unit);
                } else if (unit.id === mapAttackerId) {
                  setMapAttackerId(null);
                  setMapTargetId(null);
                } else {
                  handleMapTargetSelect(unit);
                }
              },
            }),
          mapAttackerId &&
            mapTargetId &&
            React.createElement(
              "div",
              {
                style: {
                  ...panelStyle,
                  marginBottom: 12,
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  padding: "8px 14px",
                  alignItems: "center",
                },
              },
              React.createElement(
                "button",
                {
                  onClick: () => {
                    const atkU = deployedUnits.find(
                      (u) => u.id === mapAttackerId,
                    );
                    const defU = deployedUnits.find(
                      (u) => u.id === mapTargetId,
                    );
                    if (atkU && defU)
                      applyChargeMovement({ chargeSucceeded: true });
                  },
                  style: {
                    padding: "6px 14px",
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    background: "rgba(155,45,45,0.1)",
                    border: "1.5px solid #9b2d2d",
                    color: "#9b2d2d",
                  },
                },
                "⚔ CHARGE INTO CONTACT",
              ),
              React.createElement(
                "button",
                {
                  onClick: () => routUnit(mapTargetId),
                  style: {
                    padding: "6px 14px",
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    background: "rgba(200,50,50,0.08)",
                    border: "1.5px solid #c74040",
                    color: "#c74040",
                  },
                },
                "💨 ROUTE TARGET",
              ),
              React.createElement(
                "button",
                {
                  onClick: () => routUnit(mapAttackerId),
                  style: {
                    padding: "6px 14px",
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    background: "rgba(100,100,200,0.08)",
                    border: "1.5px solid #6666aa",
                    color: "#6666aa",
                  },
                },
                "💨 ROUTE CHARGER",
              ),
              routedUnits.size > 0 &&
                React.createElement(
                  "button",
                  {
                    onClick: () => setRoutedUnits(new Set()),
                    style: {
                      padding: "6px 14px",
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 600,
                      background: "#f0ebe2",
                      border: "1.5px solid #d0c4aa",
                      color: "#8a7e6e",
                    },
                  },
                  "CLEAR ROUTS",
                ),
              React.createElement("div", { style: { flex: 1 } }),
              React.createElement(
                "span",
                {
                  style: {
                    fontSize: 11,
                    fontFamily: "'Share Tech Mono', serif",
                    color: "#8a7e6e",
                    fontStyle: "italic",
                  },
                },
                "Map selection auto-fills attacker & defender stats below",
              ),
            ),
          React.createElement(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 16,
                marginBottom: 16,
              },
            },
            ["attacker", "defender"].map((side) => {
              const isAtk = side === "attacker";
              const unit = isAtk ? aUnit : dUnit;
              const showPresets = isAtk ? aShowPresets : dShowPresets;
              const setShowPresets = isAtk ? setAShowPresets : setDShowPresets;
              const meleeWeapons = isAtk ? aMeleeWeapons : dMeleeWeapons;
              const selectedMelee = isAtk ? aSelectedMelee : dSelectedMelee;
              const sColor = isAtk ? "#9b2d2d" : "#2a6fb4";
              const sIcon = isAtk ? "⚔" : "🛡";
              const sLabel = isAtk ? "ATTACKING UNIT" : "DEFENDING UNIT";
              const models = isAtk ? aModels : dModels;
              const setModelsF = isAtk ? setAModels : setDModels;
              const ws = isAtk ? aWS : dWS;
              const setWsF = isAtk ? setAWS : setDWS;
              const sV = isAtk ? aS : dS;
              const setSF = isAtk ? setAS : setDS;
              const apV = isAtk ? aAP : dAP;
              const setApF = isAtk ? setAAP : setDAP;
              const iV = isAtk ? aI : dI;
              const setIF = isAtk ? setAI : setDI;
              const aV = isAtk ? aA : dA;
              const setAF = isAtk ? setAA : setDA;
              const wV = isAtk ? aW : dW;
              const setWF = isAtk ? setAW : setDW;
              const tV = isAtk ? aT : dT;
              const setTF = isAtk ? setAT : setDT;
              const svV = isAtk ? aSv : dSv;
              const setSvF = isAtk ? setASv : setDSv;
              const invV = isAtk ? aInv : dInv;
              const setInvF = isAtk ? setAInv : setDInv;
              const fnpV = isAtk ? aFnp : dFnp;
              const setFnpF = isAtk ? setAFnp : setDFnp;
              const ldV = isAtk ? aLd : dLd;
              const setLdF = isAtk ? setALd : setDLd;
              const rules = isAtk ? aRules : dRules;
              const setRulesF = isAtk ? setARules : setDRules;
              const rgbAccent = isAtk ? "155,45,45" : "42,111,180";
              const factionV = isAtk ? aFaction : dFaction;
              const setFactionF = isAtk ? setAFaction : setDFaction;

              return React.createElement(
                "div",
                { key: side, style: panelStyle },
                React.createElement(
                  "div",
                  {
                    style: {
                      ...panelHeaderStyle,
                      justifyContent: "space-between",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: { display: "flex", alignItems: "center", gap: 8 },
                    },
                    React.createElement(
                      "span",
                      { style: { color: sColor, fontSize: 16 } },
                      sIcon,
                    ),
                    React.createElement(
                      "span",
                      { style: { color: sColor } },
                      sLabel,
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  { style: { marginBottom: 14 } },
                  unit
                    ? React.createElement(
                        "button",
                        {
                          onClick: () => setShowPresets(true),
                          style: {
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            width: "100%",
                            padding: "8px 10px",
                            gap: 10,
                            borderRadius: 8,
                            cursor: "pointer",
                            background: `rgba(${rgbAccent},0.06)`,
                            border: `1.5px solid ${sColor}`,
                            transition: "all 0.15s ease",
                            textAlign: "left",
                          },
                        },
                        typeof getUnitArtwork === "function" &&
                          getUnitArtwork(unit.id, factionV)
                          ? React.createElement("img", {
                              src: getUnitArtwork(unit.id, factionV),
                              alt: "",
                              style: {
                                width: 120,
                                height: 120,
                                objectFit: "contain",
                                background: "#1e1a14",
                                borderRadius: 6,
                                flexShrink: 0,
                                border: `1.5px solid rgba(${rgbAccent},0.3)`,
                              },
                              onError: function (e) {
                                e.currentTarget.style.display = "none";
                              },
                            })
                          : null,
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              flex: 1,
                            },
                          },
                          React.createElement(UnitIcon, {
                            type: getUnitIconType(unit.name),
                            size: 42,
                            color: sColor,
                          }),
                          React.createElement(
                            "div",
                            { style: { flex: 1 } },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontFamily: "'Share Tech Mono', serif",
                                  fontWeight: 700,
                                  fontSize: 16,
                                  color: "#1e1a12",
                                },
                              },
                              unit.name,
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 14,
                                  color: "#6a5e4e",
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              models,
                              "model",
                              models > 1 ? "s" : "",
                              "· WS",
                              ws,
                              "· I",
                              iV,
                              "· A",
                              aV,
                            ),
                          ),
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 14,
                                color: sColor,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "CHANGE ▸",
                          ),
                        ),
                      )
                    : React.createElement(
                        "button",
                        {
                          onClick: () => setShowPresets(true),
                          style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            width: "100%",
                            padding: "14px",
                            borderRadius: 8,
                            cursor: "pointer",
                            background: "#f9f6f0",
                            border: "1.5px dashed #c0b498",
                            color: "#6a5e4e",
                            fontFamily: "'Share Tech Mono', serif",
                            fontSize: 13,
                            letterSpacing: 1,
                            transition: "all 0.15s ease",
                          },
                        },
                        React.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          "+",
                        ),
                        "SELECT UNIT",
                      ),
                ),
                showPresets &&
                  React.createElement(UnitSelectorModal, {
                    presets: meleeUnitRoster,
                    selectedId: unit?.id,
                    title: `SELECT ${isAtk ? "ATTACKING" : "DEFENDING"} UNIT`,
                    accentColor: sColor,
                    onClose: () => setShowPresets(false),
                    onSelect: (u) => applyAssaultUnit(u, side),
                  }),
                unit &&
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      },
                    },
                    React.createElement(
                      "label",
                      {
                        style: {
                          fontSize: 12,
                          color: "#5a4e3e",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          fontFamily: "'Share Tech Mono', serif",
                          whiteSpace: "nowrap",
                        },
                      },
                      "Legion",
                    ),
                    React.createElement(
                      "select",
                      {
                        value: factionV,
                        onChange: (e) => setFactionF(e.target.value),
                        style: {
                          flex: 1,
                          padding: "7px 10px",
                          borderRadius: 6,
                          fontSize: 13,
                          fontFamily: "'Share Tech Mono', serif",
                          border: `1px solid ${sColor}`,
                          background: "#faf8f4",
                          color: "#2a2418",
                          cursor: "pointer",
                        },
                      },
                      LEGION_FACTIONS.map((f) =>
                        React.createElement(
                          "option",
                          { key: f.id, value: f.id },
                          f.name,
                        ),
                      ),
                    ),
                  ),
                unit &&
                  meleeWeapons.length > 0 &&
                  React.createElement(
                    "div",
                    { style: { marginBottom: 14 } },
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        },
                      },
                      React.createElement(
                        "label",
                        {
                          style: {
                            fontSize: 13,
                            color: "#6a5e4e",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            fontFamily: "'Share Tech Mono', serif",
                          },
                        },
                        "Melee Weapon",
                      ),
                      React.createElement(
                        "div",
                        {
                          style: { display: "flex", gap: 6, flexWrap: "wrap" },
                        },
                        React.createElement(
                          "button",
                          {
                            onClick: () => {
                              if (isAtk) {
                                setASelectedMelee(null);
                              } else {
                                setDSelectedMelee(null);
                              }
                            },
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "8px 14px",
                              borderRadius: 8,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              background: !selectedMelee
                                ? "rgba(138,126,110,0.12)"
                                : "#f9f6f0",
                              border: `1.5px solid ${!selectedMelee ? "#8a7e6e" : "#e0dbd0"}`,
                            },
                          },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 12,
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: 600,
                                color: !selectedMelee ? "#4a4030" : "#8a7e6e",
                              },
                            },
                            "None",
                          ),
                        ),
                        meleeWeapons.map((w) => {
                          const active = selectedMelee?.name === w.name;
                          return React.createElement(
                            "button",
                            {
                              key: w.name,
                              onClick: () => applyAssaultMelee(w, side),
                              style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 14px",
                                borderRadius: 8,
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                background: active
                                  ? `rgba(${rgbAccent},0.10)`
                                  : "#f9f6f0",
                                border: `1.5px solid ${active ? sColor : "#e0dbd0"}`,
                                boxShadow: active
                                  ? `0 2px 8px rgba(${rgbAccent},0.12)`
                                  : "none",
                              },
                            },
                            React.createElement(
                              "div",
                              { style: { textAlign: "left" } },
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    fontSize: 13,
                                    fontFamily: "'Share Tech Mono', serif",
                                    fontWeight: 600,
                                    color: active ? sColor : "#3a3020",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  },
                                },
                                w.name,
                                w.isLegion &&
                                  React.createElement(
                                    "span",
                                    {
                                      style: {
                                        fontSize: 8,
                                        padding: "1px 4px",
                                        borderRadius: 3,
                                        background: `rgba(${rgbAccent},0.15)`,
                                        color: sColor,
                                        fontFamily: "'Share Tech Mono', serif",
                                        letterSpacing: 0.5,
                                        fontWeight: 700,
                                      },
                                    },
                                    "LEGION",
                                  ),
                              ),
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    fontSize: 13,
                                    color: "#6a5e4e",
                                    fontFamily: "'Share Tech Mono', serif",
                                    marginTop: 2,
                                  },
                                },
                                "WS",
                                w.ws,
                                "S",
                                w.s,
                                "AP",
                                w.ap,
                                "I",
                                w.i,
                                "A",
                                w.a,
                                Object.keys(w.rules || {}).filter(
                                  (r) => w.rules[r],
                                ).length > 0 &&
                                  React.createElement(
                                    "span",
                                    { style: { color: sColor, marginLeft: 4 } },
                                    Object.keys(w.rules)
                                      .filter((r) => w.rules[r])
                                      .map(
                                        (r) =>
                                          MELEE_SPECIAL_RULES.find(
                                            (sr) => sr.id === r,
                                          )?.label || r,
                                      )
                                      .join(", "),
                                  ),
                              ),
                            ),
                          );
                        }),
                      ),
                    ),
                  ),
                selectedMelee &&
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginBottom: 14,
                        padding: "8px 12px",
                        borderRadius: 6,
                        background: `rgba(${rgbAccent},0.06)`,
                        border: "1px solid #e0dbd0",
                        fontSize: 12,
                        color: "#4a4030",
                        fontFamily: "'Share Tech Mono', serif",
                        display: "flex",
                        gap: 16,
                        flexWrap: "wrap",
                        alignItems: "center",
                      },
                    },
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 600,
                          color: sColor,
                        },
                      },
                      selectedMelee.name,
                    ),
                    React.createElement("span", null, "WS", ws),
                    React.createElement("span", null, "S", sV),
                    React.createElement("span", null, "AP", apV),
                    React.createElement("span", null, "I", iV),
                    React.createElement("span", null, "A", aV),
                  ),
                unit &&
                  meleeWeapons.length > 1 &&
                  (() => {
                    const secMelee = isAtk ? aSecondaryMelee : dSecondaryMelee;
                    return React.createElement(
                      "div",
                      {
                        style: {
                          marginBottom: 14,
                          padding: "10px 14px",
                          borderRadius: 8,
                          background:
                            secMelee.length > 0
                              ? `rgba(${rgbAccent},0.04)`
                              : "#f9f6f0",
                          border: `1.5px solid ${secMelee.length > 0 ? sColor : "#e0dbd0"}`,
                          transition: "all 0.15s ease",
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: secMelee.length > 0 ? 8 : 0,
                          },
                        },
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            },
                          },
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 12,
                                color: secMelee.length > 0 ? sColor : "#8a7e6e",
                              },
                            },
                            "🗡",
                          ),
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: 700,
                                fontSize: 11,
                                color: secMelee.length > 0 ? sColor : "#8a7e6e",
                                letterSpacing: 1,
                              },
                            },
                            "ADDITIONAL WEAPONS",
                          ),
                        ),
                        React.createElement(
                          "button",
                          {
                            onClick: () => addSecondaryMelee(side),
                            style: {
                              padding: "3px 10px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: 11,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 600,
                              background: `rgba(${rgbAccent},0.1)`,
                              border: `1px solid ${sColor}`,
                              color: sColor,
                            },
                          },
                          "+ ADD",
                        ),
                      ),
                      secMelee.map((sw, idx) =>
                        React.createElement(
                          "div",
                          {
                            key: idx,
                            style: {
                              marginTop: 6,
                              padding: "6px 10px",
                              borderRadius: 6,
                              background: `rgba(${rgbAccent},0.03)`,
                              border: `1px solid rgba(${rgbAccent},0.12)`,
                            },
                          },
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginBottom: 4,
                              },
                            },
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontFamily: "'Share Tech Mono', serif",
                                  fontSize: 8,
                                  fontWeight: 700,
                                  color: sColor,
                                },
                              },
                              "WEAPON",
                              idx + 2,
                            ),
                            React.createElement("span", { style: { flex: 1 } }),
                            React.createElement(
                              "button",
                              {
                                onClick: () => removeSecondaryMelee(side, idx),
                                style: {
                                  padding: "2px 6px",
                                  borderRadius: 3,
                                  cursor: "pointer",
                                  fontSize: 7,
                                  fontFamily: "'Share Tech Mono', serif",
                                  background: "rgba(199,64,64,0.08)",
                                  border: "1px solid rgba(199,64,64,0.2)",
                                  color: "#c74040",
                                },
                              },
                              "✕",
                            ),
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                gap: 4,
                                flexWrap: "wrap",
                                marginBottom: 4,
                              },
                            },
                            meleeWeapons.map((w) => {
                              const active = sw.weapon.name === w.name;
                              return React.createElement(
                                "button",
                                {
                                  key: w.name,
                                  onClick: () =>
                                    updateSecondaryMelee(
                                      side,
                                      idx,
                                      "weapon",
                                      w,
                                    ),
                                  style: {
                                    padding: "3px 8px",
                                    borderRadius: 4,
                                    fontSize: 11,
                                    cursor: "pointer",
                                    fontFamily: "'Share Tech Mono', serif",
                                    fontWeight: active ? 700 : 400,
                                    background: active
                                      ? `rgba(${rgbAccent},0.12)`
                                      : "#f8f4ec",
                                    border: `1px solid ${active ? sColor : "#e0dbd0"}`,
                                    color: active ? sColor : "#6a5e4e",
                                  },
                                },
                                w.name,
                              );
                            }),
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                flexWrap: "wrap",
                              },
                            },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                },
                              },
                              React.createElement(
                                "label",
                                {
                                  style: {
                                    fontSize: 8,
                                    fontFamily: "'Share Tech Mono', serif",
                                    color: "#6a5e4e",
                                  },
                                },
                                "Models:",
                              ),
                              React.createElement("input", {
                                type: "number",
                                min: 1,
                                max: 40,
                                value: sw.models,
                                onChange: (e) =>
                                  updateSecondaryMelee(
                                    side,
                                    idx,
                                    "models",
                                    Math.max(1, parseInt(e.target.value) || 1),
                                  ),
                                style: {
                                  width: 40,
                                  padding: "2px 4px",
                                  borderRadius: 3,
                                  border: "1px solid #d0c4aa",
                                  fontSize: 12,
                                  fontFamily: "'Share Tech Mono', serif",
                                  textAlign: "center",
                                  background: "#fff",
                                },
                              }),
                            ),
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 11,
                                  color: "#6a5e4e",
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              "WS",
                              sw.weapon.ws,
                              "S",
                              sw.weapon.s,
                              "AP",
                              sw.weapon.ap,
                              "I",
                              sw.weapon.i,
                              "A",
                              sw.weapon.a,
                            ),
                            Object.keys(sw.weapon.rules || {})
                              .filter((k) => sw.weapon.rules[k])
                              .map((k) => {
                                const rule = MELEE_SPECIAL_RULES.find(
                                  (r) => r.id === k,
                                );
                                return rule
                                  ? React.createElement(
                                      "span",
                                      {
                                        key: k,
                                        style: { fontSize: 8, color: sColor },
                                      },
                                      rule.label,
                                    )
                                  : null;
                              }),
                          ),
                        ),
                      ),
                    );
                  })(),
                unit &&
                  unit.hasSgt &&
                  (() => {
                    const sgtWeapons = isAtk
                      ? aAssaultSgtWeapons
                      : dAssaultSgtWeapons;
                    const sgtEnabled = isAtk
                      ? aAssaultSgtEnabled
                      : dAssaultSgtEnabled;
                    const setSgtEnabled = isAtk
                      ? setAAssaultSgtEnabled
                      : setDAssaultSgtEnabled;
                    const sgtMelee = isAtk
                      ? aAssaultSgtMelee
                      : dAssaultSgtMelee;
                    const setSgtMelee = isAtk
                      ? setAAssaultSgtMelee
                      : setDAssaultSgtMelee;
                    if (sgtWeapons.length === 0) return null;
                    return React.createElement(
                      "div",
                      {
                        style: {
                          marginBottom: 14,
                          padding: "10px 14px",
                          borderRadius: 8,
                          background: sgtEnabled
                            ? "rgba(107,63,138,0.06)"
                            : "#f9f6f0",
                          border: `1.5px solid ${sgtEnabled ? "#6b3f8a" : "#e0dbd0"}`,
                          transition: "all 0.15s ease",
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: sgtEnabled ? 10 : 0,
                          },
                        },
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            },
                          },
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 14,
                                color: sgtEnabled ? "#6b3f8a" : "#8a7e6e",
                              },
                            },
                            "⚔",
                          ),
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: 700,
                                fontSize: 13,
                                color: sgtEnabled ? "#6b3f8a" : "#8a7e6e",
                                letterSpacing: 1,
                              },
                            },
                            "SERGEANT",
                          ),
                        ),
                        React.createElement(
                          "label",
                          {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              cursor: "pointer",
                              fontSize: 12,
                              fontFamily: "'Share Tech Mono', serif",
                              color: sgtEnabled ? "#6b3f8a" : "#8a7e6e",
                            },
                          },
                          React.createElement("input", {
                            type: "checkbox",
                            checked: sgtEnabled,
                            onChange: (e) => setSgtEnabled(e.target.checked),
                            style: { accentColor: "#6b3f8a" },
                          }),
                          sgtEnabled ? "Included" : "Include Sergeant",
                        ),
                      ),
                      sgtEnabled &&
                        React.createElement(
                          React.Fragment,
                          null,
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                              },
                            },
                            sgtWeapons.map((w) => {
                              const active = sgtMelee?.name === w.name;
                              return React.createElement(
                                "button",
                                {
                                  key: w.name,
                                  onClick: () => setSgtMelee(w),
                                  style: {
                                    padding: "7px 14px",
                                    borderRadius: 6,
                                    fontSize: 12,
                                    cursor: "pointer",
                                    fontFamily: "'Share Tech Mono', serif",
                                    fontWeight: active ? 700 : 400,
                                    background: active
                                      ? "rgba(107,63,138,0.18)"
                                      : "#f0ebe2",
                                    border: `1.5px solid ${active ? "#6b3f8a" : "#d0c4aa"}`,
                                    color: active ? "#6b3f8a" : "#6a5e4e",
                                    transition: "all 0.15s ease",
                                    textAlign: "left",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    minWidth: 120,
                                  },
                                },
                                React.createElement(
                                  "div",
                                  { style: { fontWeight: 600 } },
                                  w.name,
                                ),
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      fontSize: 11,
                                      color: active ? "#5a2e7a" : "#8a7e6e",
                                      letterSpacing: 0.5,
                                    },
                                  },
                                  "WS",
                                  w.ws,
                                  "S",
                                  w.s,
                                  "AP",
                                  w.ap,
                                  "I",
                                  w.i,
                                  "A",
                                  w.a,
                                  w.traits ? ` · ${w.traits}` : "",
                                ),
                              );
                            }),
                          ),
                          sgtMelee &&
                            React.createElement(
                              "div",
                              {
                                style: {
                                  marginTop: 8,
                                  padding: "6px 10px",
                                  borderRadius: 5,
                                  background: "rgba(107,63,138,0.06)",
                                  border: "1px solid #e0dbd0",
                                  fontSize: 13,
                                  color: "#4a4030",
                                  fontFamily: "'Share Tech Mono', serif",
                                  display: "flex",
                                  gap: 14,
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                },
                              },
                              React.createElement(
                                "span",
                                {
                                  style: {
                                    fontFamily: "'Share Tech Mono', serif",
                                    fontWeight: 600,
                                    color: "#6b3f8a",
                                  },
                                },
                                sgtMelee.name,
                              ),
                              React.createElement(
                                "span",
                                null,
                                "WS",
                                sgtMelee.ws,
                              ),
                              React.createElement(
                                "span",
                                null,
                                "S",
                                sgtMelee.s,
                              ),
                              React.createElement(
                                "span",
                                null,
                                "AP",
                                sgtMelee.ap,
                              ),
                              React.createElement(
                                "span",
                                null,
                                "I",
                                sgtMelee.i,
                              ),
                              React.createElement(
                                "span",
                                null,
                                "A",
                                sgtMelee.a,
                              ),
                              Object.keys(sgtMelee.rules || {})
                                .filter((k) => sgtMelee.rules[k])
                                .map((k) => {
                                  const rule = MELEE_SPECIAL_RULES.find(
                                    (r) => r.id === k,
                                  );
                                  return rule
                                    ? React.createElement(
                                        "span",
                                        {
                                          key: k,
                                          style: {
                                            color: "#6b3f8a",
                                            fontSize: 10,
                                          },
                                        },
                                        rule.label,
                                      )
                                    : null;
                                }),
                            ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 8,
                                color: "#8a7e6e",
                                fontFamily: "'Share Tech Mono', serif",
                                fontStyle: "italic",
                                marginTop: 4,
                              },
                            },
                            "Sergeant fights separately with their own weapon profile (1 model)",
                          ),
                        ),
                    );
                  })(),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 12,
                      marginBottom: 12,
                    },
                  },
                  React.createElement(NumberInput, {
                    label: "Models",
                    value: models,
                    onChange: setModelsF,
                    min: 1,
                    max: 40,
                  }),
                  React.createElement(NumberInput, {
                    label: "WS",
                    value: ws,
                    onChange: setWsF,
                    min: 1,
                    max: 10,
                  }),
                  React.createElement(NumberInput, {
                    label: "S",
                    value: sV,
                    onChange: setSF,
                    min: 1,
                    max: 20,
                  }),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 12,
                      marginBottom: 12,
                    },
                  },
                  React.createElement(SelectInput, {
                    label: "AP",
                    value: apV,
                    onChange: setApF,
                    options: apOptions,
                  }),
                  React.createElement(NumberInput, {
                    label: "I",
                    value: iV,
                    onChange: setIF,
                    min: 1,
                    max: 10,
                  }),
                  React.createElement(NumberInput, {
                    label: "A",
                    value: aV,
                    onChange: setAF,
                    min: 1,
                    max: 10,
                  }),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginBottom: 12,
                    },
                  },
                  React.createElement(NumberInput, {
                    label: "W",
                    value: wV,
                    onChange: setWF,
                    min: 1,
                    max: 10,
                  }),
                  React.createElement(NumberInput, {
                    label: "T",
                    value: tV,
                    onChange: setTF,
                    min: 1,
                    max: 10,
                  }),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 12,
                      marginBottom: 12,
                    },
                  },
                  React.createElement(SelectInput, {
                    label: "Sv",
                    value: svV,
                    onChange: setSvF,
                    options: saveOptions,
                  }),
                  React.createElement(SelectInput, {
                    label: "Inv",
                    value: invV,
                    onChange: setInvF,
                    options: saveOptions,
                  }),
                  React.createElement(SelectInput, {
                    label: "FNP",
                    value: fnpV,
                    onChange: setFnpF,
                    options: saveOptions,
                  }),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 12,
                      marginBottom: 12,
                      maxWidth: "33%",
                    },
                  },
                  React.createElement(NumberInput, {
                    label: "Ld",
                    value: ldV,
                    onChange: setLdF,
                    min: 1,
                    max: 10,
                  }),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#8a7e6e",
                      letterSpacing: 1,
                      marginBottom: 4,
                    },
                  },
                  "SPECIAL RULES",
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                      marginBottom: 8,
                    },
                  },
                  MELEE_SPECIAL_RULES.map((rule) => {
                    const active = rules[rule.id];
                    return React.createElement(
                      "button",
                      {
                        key: rule.id,
                        onClick: () =>
                          setRulesF((prev) => ({
                            ...prev,
                            [rule.id]: !prev[rule.id],
                          })),
                        style: {
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: "pointer",
                          fontFamily: "'Share Tech Mono', serif",
                          background: active
                            ? `rgba(${rgbAccent},0.12)`
                            : "#f0ebe2",
                          border: `1px solid ${active ? sColor : "#d0c4aa"}`,
                          color: active ? sColor : "#8a7e6e",
                          fontWeight: active ? 700 : 400,
                        },
                      },
                      rule.label,
                    );
                  }),
                ),
                (() => {
                  const activeList = MELEE_SPECIAL_RULES.filter(
                    (r) => rules[r.id],
                  );
                  if (activeList.length === 0) return null;
                  return React.createElement(
                    "div",
                    {
                      style: { borderTop: "1px solid #e0dbd0", paddingTop: 6 },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 9,
                          fontFamily: "'Share Tech Mono', serif",
                          color: sColor,
                          letterSpacing: 1,
                          marginBottom: 4,
                        },
                      },
                      "ACTIVE RULE REFERENCE",
                    ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        },
                      },
                      activeList.map((r) =>
                        React.createElement(
                          "div",
                          {
                            key: r.id,
                            style: {
                              display: "flex",
                              gap: 6,
                              alignItems: "flex-start",
                            },
                          },
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 10,
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: 700,
                                color: sColor,
                                minWidth: 120,
                                flexShrink: 0,
                              },
                            },
                            r.label,
                            ":",
                          ),
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 10,
                                color: "#6a5e4e",
                                fontFamily: "'Share Tech Mono', serif",
                                lineHeight: 1.4,
                              },
                            },
                            r.desc,
                          ),
                        ),
                      ),
                    ),
                  );
                })(),
              );
            }),
          ),
          React.createElement(
            "div",
            {
              style: {
                ...panelStyle,
                marginBottom: 16,
                borderColor: showCharge ? "#9b2d2d" : "#d0c4aa",
                transition: "border-color 0.3s ease",
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: showCharge ? 16 : 0,
                },
              },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                React.createElement(
                  "span",
                  { style: { fontSize: 18, color: "#9b2d2d" } },
                  "🏃",
                ),
                React.createElement(
                  "span",
                  {
                    style: {
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#9b2d2d",
                      letterSpacing: 2,
                    },
                  },
                  "CHARGE PHASE",
                ),
              ),
              React.createElement(
                "button",
                {
                  onClick: () => setShowCharge(!showCharge),
                  style: {
                    padding: "6px 16px",
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    background: showCharge ? "rgba(155,45,45,0.1)" : "#f0ebe2",
                    border: `1.5px solid ${showCharge ? "#9b2d2d" : "#d0c4aa"}`,
                    color: showCharge ? "#9b2d2d" : "#8a7e6e",
                  },
                },
                showCharge ? "COLLAPSE ▴" : "DECLARE CHARGE ▾",
              ),
            ),
            showCharge &&
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  {
                    style: {
                      padding: "8px 10px",
                      marginBottom: 10,
                      background: "rgba(155,45,45,0.04)",
                      border: "1px solid rgba(155,45,45,0.2)",
                      borderRadius: 4,
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#9b2d2d",
                        fontWeight: 700,
                        letterSpacing: 1,
                        marginBottom: 6,
                      },
                    },
                    "SET-UP MOVE (p.253) — I + M → table → + D6 Charge Move",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto 1fr",
                        gap: 8,
                        alignItems: "end",
                      },
                    },
                    React.createElement(NumberInput, {
                      label: "Initiative (I)",
                      value: aI,
                      onChange: (v) => setAI(v),
                      min: 1,
                      max: 10,
                    }),
                    React.createElement(NumberInput, {
                      label: "Movement (M)",
                      value: aMove,
                      onChange: (v) => setAMove(v),
                      min: 1,
                      max: 12,
                    }),
                    React.createElement(
                      "div",
                      {
                        style: {
                          paddingBottom: 4,
                          fontSize: 16,
                          color: "#8a7e6e",
                          fontWeight: 700,
                          alignSelf: "end",
                        },
                      },
                      "→",
                    ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 11,
                            color: "#6a5e4e",
                            fontFamily: "'Share Tech Mono', serif",
                            letterSpacing: 1,
                          },
                        },
                        "SET-UP MOVE",
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            padding: "6px 10px",
                            background: "#f0ebe2",
                            border: "2px solid #9b2d2d",
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 16,
                            color: "#9b2d2d",
                            textAlign: "center",
                          },
                        },
                        getSetUpMove(aI, aMove),
                        '"',
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 10,
                              color: "#8a7e6e",
                              fontWeight: 400,
                              marginLeft: 4,
                            },
                          },
                          "(I+M=",
                          parseInt(aI || 0) + parseInt(aMove || 0),
                          ")",
                        ),
                      ),
                    ),
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 6,
                        fontSize: 11,
                        color: "#8a7e6e",
                        fontFamily: "'Share Tech Mono', serif",
                      },
                    },
                    "Charge total = Set-Up Move + D6 roll. Must equal or exceed distance to target (",
                    chargeDistance,
                    '").',
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 10,
                      marginBottom: 12,
                    },
                  },
                  React.createElement(NumberInput, {
                    label: "Target Distance (″)",
                    value: chargeDistance,
                    onChange: setChargeDistance,
                    min: 1,
                    max: 48,
                  }),
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      },
                    },
                    React.createElement(
                      "label",
                      {
                        style: {
                          fontSize: 12,
                          color: "#6a5e4e",
                          fontFamily: "'Share Tech Mono', serif",
                        },
                      },
                      "Difficult Terrain",
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: () => setChargeTerrain(!chargeTerrain),
                        style: {
                          padding: "6px 12px",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: chargeTerrain ? 700 : 400,
                          background: chargeTerrain
                            ? "rgba(155,45,45,0.1)"
                            : "#f8f4ec",
                          border: `1.5px solid ${chargeTerrain ? "#9b2d2d" : "#d0c4aa"}`,
                          color: chargeTerrain ? "#9b2d2d" : "#8a7e6e",
                        },
                      },
                      chargeTerrain ? "✓ YES" : "NO",
                    ),
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      },
                    },
                    React.createElement(
                      "label",
                      {
                        style: {
                          fontSize: 12,
                          color: "#6a5e4e",
                          fontFamily: "'Share Tech Mono', serif",
                        },
                      },
                      "Disordered",
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: () => setChargeDisordered(!chargeDisordered),
                        style: {
                          padding: "6px 12px",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: chargeDisordered ? 700 : 400,
                          background: chargeDisordered
                            ? "rgba(155,45,45,0.1)"
                            : "#f8f4ec",
                          border: `1.5px solid ${chargeDisordered ? "#9b2d2d" : "#d0c4aa"}`,
                          color: chargeDisordered ? "#9b2d2d" : "#8a7e6e",
                        },
                      },
                      chargeDisordered ? "✓ YES" : "NO",
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      padding: 10,
                      borderRadius: 6,
                      marginBottom: 10,
                      background: "rgba(107,142,35,0.04)",
                      border: "1px solid rgba(107,142,35,0.2)",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: doVolleyFire ? 8 : 0,
                      },
                    },
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontSize: 13,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          color: "#6b8e23",
                          letterSpacing: 1,
                        },
                      },
                      "🔫 CHARGER VOLLEY FIRE (Snap Shots 6+)",
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: () => setDoVolleyFire(!doVolleyFire),
                        style: {
                          padding: "3px 10px",
                          borderRadius: 3,
                          cursor: "pointer",
                          fontSize: 11,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: doVolleyFire ? 700 : 400,
                          background: doVolleyFire
                            ? "rgba(107,142,35,0.12)"
                            : "#f8f4ec",
                          border: `1px solid ${doVolleyFire ? "#6b8e23" : "#d0c4aa"}`,
                          color: doVolleyFire ? "#6b8e23" : "#8a7e6e",
                        },
                      },
                      doVolleyFire ? "✓ ON" : "OFF",
                    ),
                  ),
                  doVolleyFire &&
                    (() => {
                      const assaultWeapons = aRangedWeapons.filter(
                        (w) =>
                          (w.traits || "").toLowerCase().includes("assault") ||
                          (w.type || "").toLowerCase() === "pistol",
                      );
                      const sgtCat = aUnit?.hasSgt
                        ? getSgtCategory(aUnit.id)
                        : null;
                      const sgtWeapons = sgtCat
                        ? SERGEANT_WEAPONS[sgtCat] || []
                        : [];
                      const volleyEligible = sgtWeapons.filter(
                        (w) =>
                          (w.traits || "").toLowerCase().includes("assault") ||
                          (w.type || "").toLowerCase() === "pistol",
                      );
                      return React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 8,
                              color: "#8a7e6e",
                              fontFamily: "'Share Tech Mono', serif",
                              fontStyle: "italic",
                              marginBottom: 6,
                            },
                          },
                          React.createElement("strong", null, "Assault"),
                          "trait &amp;",
                          React.createElement("strong", null, "Pistol"),
                          "type weapons may fire Volley Fire",
                        ),
                        assaultWeapons.length > 0 &&
                          React.createElement(
                            React.Fragment,
                            null,
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 6,
                                  flexWrap: "wrap",
                                  marginBottom: 6,
                                },
                              },
                              assaultWeapons.map((w) => {
                                const active = aSelectedRanged?.name === w.name;
                                return React.createElement(
                                  "button",
                                  {
                                    key: w.name,
                                    onClick: () =>
                                      applyAssaultRanged(w, "attacker"),
                                    style: {
                                      padding: "7px 14px",
                                      borderRadius: 6,
                                      fontSize: 12,
                                      cursor: "pointer",
                                      fontFamily: "'Share Tech Mono', serif",
                                      fontWeight: active ? 700 : 400,
                                      background: active
                                        ? "rgba(107,142,35,0.18)"
                                        : "#f0ebe2",
                                      border: `1.5px solid ${active ? "#6b8e23" : "#d0c4aa"}`,
                                      color: active ? "#6b8e23" : "#6a5e4e",
                                      transition: "all 0.15s ease",
                                      textAlign: "left",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 2,
                                      minWidth: 120,
                                    },
                                  },
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                      },
                                    },
                                    w.name,
                                    w.isLegion &&
                                      React.createElement(
                                        "span",
                                        {
                                          style: {
                                            fontSize: 8,
                                            padding: "1px 4px",
                                            borderRadius: 3,
                                            background: "rgba(107,142,35,0.2)",
                                            color: "#4a6b14",
                                            fontFamily:
                                              "'Share Tech Mono', serif",
                                            letterSpacing: 0.5,
                                            fontWeight: 700,
                                          },
                                        },
                                        "LEGION",
                                      ),
                                  ),
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        fontSize: 11,
                                        color: active ? "#4a6b14" : "#8a7e6e",
                                        letterSpacing: 0.5,
                                      },
                                    },
                                    w.type,
                                    w.shots,
                                    "· S",
                                    w.s,
                                    "AP",
                                    w.ap,
                                    "D",
                                    w.damage,
                                    w.traits ? ` · ${w.traits}` : "",
                                  ),
                                );
                              }),
                            ),
                            aSelectedRanged &&
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    padding: "6px 10px",
                                    borderRadius: 5,
                                    background: "rgba(107,142,35,0.06)",
                                    border: "1px solid #e0dbd0",
                                    fontSize: 13,
                                    color: "#4a4030",
                                    fontFamily: "'Share Tech Mono', serif",
                                    display: "flex",
                                    gap: 14,
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                  },
                                },
                                React.createElement(
                                  "span",
                                  {
                                    style: {
                                      fontFamily: "'Share Tech Mono', serif",
                                      fontWeight: 600,
                                      color: "#6b8e23",
                                    },
                                  },
                                  aSelectedRanged.name,
                                ),
                                React.createElement(
                                  "span",
                                  null,
                                  volleyFireShots,
                                  "sh",
                                ),
                                React.createElement(
                                  "span",
                                  null,
                                  "S",
                                  volleyFireS,
                                ),
                                React.createElement(
                                  "span",
                                  null,
                                  "AP",
                                  volleyFireAP,
                                ),
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    },
                                  },
                                  React.createElement(
                                    "span",
                                    {
                                      style: { fontSize: 12, color: "#8a7e6e" },
                                    },
                                    "×",
                                  ),
                                  React.createElement("input", {
                                    type: "number",
                                    value: aVolleyModels,
                                    min: 1,
                                    max: 40,
                                    onChange: (e) =>
                                      setAVolleyModels(
                                        parseInt(e.target.value) || 1,
                                      ),
                                    style: {
                                      width: 38,
                                      padding: "2px 4px",
                                      fontSize: 12,
                                      borderRadius: 3,
                                      border: "1px solid #d0c4aa",
                                      background: "#f9f6f0",
                                      textAlign: "center",
                                      fontFamily: "'Share Tech Mono', serif",
                                    },
                                  }),
                                  React.createElement(
                                    "span",
                                    {
                                      style: { fontSize: 12, color: "#8a7e6e" },
                                    },
                                    "models",
                                  ),
                                ),
                                React.createElement(
                                  "span",
                                  { style: { color: "#8a7e6e", fontSize: 10 } },
                                  "(Snap Shots 6+)",
                                ),
                              ),
                            assaultWeapons.length > 1 &&
                              React.createElement(
                                "div",
                                { style: { marginTop: 6 } },
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      marginBottom:
                                        aSecondaryRanged.length > 0 ? 4 : 0,
                                    },
                                  },
                                  React.createElement(
                                    "span",
                                    {
                                      style: {
                                        fontSize: 11,
                                        fontFamily: "'Share Tech Mono', serif",
                                        color: "#8a7e6e",
                                        letterSpacing: 0.5,
                                        textTransform: "uppercase",
                                      },
                                    },
                                    "Additional Weapons",
                                  ),
                                  React.createElement(
                                    "button",
                                    {
                                      onClick: () =>
                                        addSecondaryRanged("attacker"),
                                      style: {
                                        padding: "2px 8px",
                                        borderRadius: 3,
                                        cursor: "pointer",
                                        fontSize: 8,
                                        fontFamily: "'Share Tech Mono', serif",
                                        fontWeight: 600,
                                        background: "rgba(107,142,35,0.08)",
                                        border:
                                          "1px solid rgba(107,142,35,0.2)",
                                        color: "#6b8e23",
                                      },
                                    },
                                    "+ ADD",
                                  ),
                                ),
                                aSecondaryRanged.map((sw, idx) =>
                                  React.createElement(
                                    "div",
                                    {
                                      key: idx,
                                      style: {
                                        marginTop: 4,
                                        padding: "5px 8px",
                                        borderRadius: 4,
                                        background: "rgba(107,142,35,0.03)",
                                        border:
                                          "1px solid rgba(107,142,35,0.08)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        flexWrap: "wrap",
                                      },
                                    },
                                    React.createElement(
                                      "select",
                                      {
                                        value: sw.weapon.name,
                                        onChange: (e) => {
                                          const w = assaultWeapons.find(
                                            (rw) => rw.name === e.target.value,
                                          );
                                          if (w)
                                            updateSecondaryRanged(
                                              "attacker",
                                              idx,
                                              "weapon",
                                              w,
                                            );
                                        },
                                        style: {
                                          flex: 1,
                                          minWidth: 100,
                                          padding: "3px 6px",
                                          fontSize: 12,
                                          borderRadius: 3,
                                          border: "1px solid #d0c4aa",
                                          background: "#f9f6f0",
                                          fontFamily:
                                            "'Share Tech Mono', serif",
                                        },
                                      },
                                      assaultWeapons.map((w) =>
                                        React.createElement(
                                          "option",
                                          { key: w.name, value: w.name },
                                          w.name,
                                          "(",
                                          w.shots,
                                          "sh S",
                                          w.s,
                                          "AP",
                                          w.ap,
                                          ")",
                                        ),
                                      ),
                                    ),
                                    React.createElement(
                                      "div",
                                      {
                                        style: {
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 4,
                                        },
                                      },
                                      React.createElement(
                                        "span",
                                        {
                                          style: {
                                            fontSize: 11,
                                            color: "#8a7e6e",
                                            fontFamily:
                                              "'Share Tech Mono', serif",
                                          },
                                        },
                                        "×",
                                      ),
                                      React.createElement("input", {
                                        type: "number",
                                        value: sw.models,
                                        min: 1,
                                        max: 20,
                                        onChange: (e) =>
                                          updateSecondaryRanged(
                                            "attacker",
                                            idx,
                                            "models",
                                            parseInt(e.target.value) || 1,
                                          ),
                                        style: {
                                          width: 38,
                                          padding: "3px 4px",
                                          fontSize: 12,
                                          borderRadius: 3,
                                          border: "1px solid #d0c4aa",
                                          background: "#f9f6f0",
                                          textAlign: "center",
                                        },
                                      }),
                                      React.createElement(
                                        "span",
                                        {
                                          style: {
                                            fontSize: 11,
                                            color: "#8a7e6e",
                                          },
                                        },
                                        "models",
                                      ),
                                    ),
                                    React.createElement(
                                      "button",
                                      {
                                        onClick: () =>
                                          removeSecondaryRanged(
                                            "attacker",
                                            idx,
                                          ),
                                        style: {
                                          padding: "2px 6px",
                                          borderRadius: 3,
                                          cursor: "pointer",
                                          fontSize: 11,
                                          background: "rgba(199,64,64,0.08)",
                                          border:
                                            "1px solid rgba(199,64,64,0.2)",
                                          color: "#c74040",
                                        },
                                      },
                                      "✕",
                                    ),
                                  ),
                                ),
                              ),
                          ),
                        assaultWeapons.length === 0 &&
                          volleyEligible.length === 0 &&
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "#8a7e6e",
                                fontStyle: "italic",
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "No Assault/Pistol weapons available",
                          ),
                        volleyEligible.length > 0 &&
                          React.createElement(
                            "div",
                            {
                              style: {
                                marginTop: 6,
                                padding: "6px 8px",
                                borderRadius: 5,
                                background: "rgba(107,63,138,0.04)",
                                border: "1px solid rgba(107,63,138,0.15)",
                              },
                            },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  marginBottom: aSgtVolleyWeapon ? 4 : 0,
                                },
                              },
                              React.createElement(
                                "span",
                                {
                                  style: {
                                    fontSize: 11,
                                    fontFamily: "'Share Tech Mono', serif",
                                    fontWeight: 700,
                                    color: "#6b3f8a",
                                    letterSpacing: 0.5,
                                  },
                                },
                                "⚜ SGT WEAPON",
                              ),
                              React.createElement(
                                "select",
                                {
                                  value: aSgtVolleyWeapon?.name || "",
                                  onChange: (e) => {
                                    const w = volleyEligible.find(
                                      (rw) => rw.name === e.target.value,
                                    );
                                    setASgtVolleyWeapon(w || null);
                                  },
                                  style: {
                                    flex: 1,
                                    padding: "3px 6px",
                                    fontSize: 12,
                                    borderRadius: 3,
                                    border: "1px solid rgba(107,63,138,0.3)",
                                    background: "#f9f6f0",
                                    fontFamily: "'Share Tech Mono', serif",
                                  },
                                },
                                React.createElement(
                                  "option",
                                  { value: "" },
                                  "— No Sgt volley fire —",
                                ),
                                volleyEligible.map((w) =>
                                  React.createElement(
                                    "option",
                                    { key: w.name, value: w.name },
                                    w.name,
                                    "(",
                                    w.type,
                                    w.shots,
                                    "sh S",
                                    w.s,
                                    "AP",
                                    w.ap,
                                    ")",
                                  ),
                                ),
                              ),
                            ),
                            aSgtVolleyWeapon &&
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    fontSize: 11,
                                    color: "#6b3f8a",
                                    fontFamily: "'Share Tech Mono', serif",
                                    fontStyle: "italic",
                                  },
                                },
                                "Sgt fires",
                                aSgtVolleyWeapon.name,
                                "at Snap Shots 6+ (1 model)",
                              ),
                          ),
                      );
                    })(),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      padding: 10,
                      borderRadius: 6,
                      marginBottom: 10,
                      background: "rgba(42,111,180,0.04)",
                      border: "1px solid rgba(42,111,180,0.2)",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: doDefVolleyFire ? 8 : 0,
                      },
                    },
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontSize: 13,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          color: "#2a6fb4",
                          letterSpacing: 1,
                        },
                      },
                      "🔫 DEFENDER VOLLEY FIRE (Snap Shots 6+)",
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: () => setDoDefVolleyFire(!doDefVolleyFire),
                        style: {
                          padding: "3px 10px",
                          borderRadius: 3,
                          cursor: "pointer",
                          fontSize: 11,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: doDefVolleyFire ? 700 : 400,
                          background: doDefVolleyFire
                            ? "rgba(42,111,180,0.12)"
                            : "#f8f4ec",
                          border: `1px solid ${doDefVolleyFire ? "#2a6fb4" : "#d0c4aa"}`,
                          color: doDefVolleyFire ? "#2a6fb4" : "#8a7e6e",
                        },
                      },
                      doDefVolleyFire ? "✓ ON" : "OFF",
                    ),
                  ),
                  doDefVolleyFire &&
                    (() => {
                      const assaultWeapons = dRangedWeapons.filter(
                        (w) =>
                          (w.traits || "").toLowerCase().includes("assault") ||
                          (w.type || "").toLowerCase() === "pistol",
                      );
                      const sgtCat = dUnit?.hasSgt
                        ? getSgtCategory(dUnit.id)
                        : null;
                      const sgtWeapons = sgtCat
                        ? SERGEANT_WEAPONS[sgtCat] || []
                        : [];
                      const volleyEligible = sgtWeapons.filter(
                        (w) =>
                          (w.traits || "").toLowerCase().includes("assault") ||
                          (w.type || "").toLowerCase() === "pistol",
                      );
                      return React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 8,
                              color: "#8a7e6e",
                              fontFamily: "'Share Tech Mono', serif",
                              fontStyle: "italic",
                              marginBottom: 6,
                            },
                          },
                          React.createElement("strong", null, "Assault"),
                          "trait &amp;",
                          React.createElement("strong", null, "Pistol"),
                          "type weapons may fire Volley Fire",
                        ),
                        assaultWeapons.length > 0 &&
                          React.createElement(
                            React.Fragment,
                            null,
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 6,
                                  flexWrap: "wrap",
                                  marginBottom: 6,
                                },
                              },
                              assaultWeapons.map((w) => {
                                const active = dSelectedRanged?.name === w.name;
                                return React.createElement(
                                  "button",
                                  {
                                    key: w.name,
                                    onClick: () =>
                                      applyAssaultRanged(w, "defender"),
                                    style: {
                                      padding: "7px 14px",
                                      borderRadius: 6,
                                      fontSize: 12,
                                      cursor: "pointer",
                                      fontFamily: "'Share Tech Mono', serif",
                                      fontWeight: active ? 700 : 400,
                                      background: active
                                        ? "rgba(42,111,180,0.18)"
                                        : "#f0ebe2",
                                      border: `1.5px solid ${active ? "#2a6fb4" : "#d0c4aa"}`,
                                      color: active ? "#2a6fb4" : "#6a5e4e",
                                      transition: "all 0.15s ease",
                                      textAlign: "left",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 2,
                                      minWidth: 120,
                                    },
                                  },
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                      },
                                    },
                                    w.name,
                                    w.isLegion &&
                                      React.createElement(
                                        "span",
                                        {
                                          style: {
                                            fontSize: 8,
                                            padding: "1px 4px",
                                            borderRadius: 3,
                                            background: "rgba(42,111,180,0.2)",
                                            color: "#1a5090",
                                            fontFamily:
                                              "'Share Tech Mono', serif",
                                            letterSpacing: 0.5,
                                            fontWeight: 700,
                                          },
                                        },
                                        "LEGION",
                                      ),
                                  ),
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        fontSize: 11,
                                        color: active ? "#1a5090" : "#8a7e6e",
                                        letterSpacing: 0.5,
                                      },
                                    },
                                    w.type,
                                    w.shots,
                                    "· S",
                                    w.s,
                                    "AP",
                                    w.ap,
                                    "D",
                                    w.damage,
                                    w.traits ? ` · ${w.traits}` : "",
                                  ),
                                );
                              }),
                            ),
                            dSelectedRanged &&
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    padding: "6px 10px",
                                    borderRadius: 5,
                                    background: "rgba(42,111,180,0.06)",
                                    border: "1px solid #e0dbd0",
                                    fontSize: 13,
                                    color: "#4a4030",
                                    fontFamily: "'Share Tech Mono', serif",
                                    display: "flex",
                                    gap: 14,
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                  },
                                },
                                React.createElement(
                                  "span",
                                  {
                                    style: {
                                      fontFamily: "'Share Tech Mono', serif",
                                      fontWeight: 600,
                                      color: "#2a6fb4",
                                    },
                                  },
                                  dSelectedRanged.name,
                                ),
                                React.createElement(
                                  "span",
                                  null,
                                  defVolleyFireShots,
                                  "sh",
                                ),
                                React.createElement(
                                  "span",
                                  null,
                                  "S",
                                  defVolleyFireS,
                                ),
                                React.createElement(
                                  "span",
                                  null,
                                  "AP",
                                  defVolleyFireAP,
                                ),
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    },
                                  },
                                  React.createElement(
                                    "span",
                                    {
                                      style: { fontSize: 12, color: "#8a7e6e" },
                                    },
                                    "×",
                                  ),
                                  React.createElement("input", {
                                    type: "number",
                                    value: dVolleyModels,
                                    min: 1,
                                    max: 40,
                                    onChange: (e) =>
                                      setDVolleyModels(
                                        parseInt(e.target.value) || 1,
                                      ),
                                    style: {
                                      width: 38,
                                      padding: "2px 4px",
                                      fontSize: 12,
                                      borderRadius: 3,
                                      border: "1px solid #d0c4aa",
                                      background: "#f9f6f0",
                                      textAlign: "center",
                                      fontFamily: "'Share Tech Mono', serif",
                                    },
                                  }),
                                  React.createElement(
                                    "span",
                                    {
                                      style: { fontSize: 12, color: "#8a7e6e" },
                                    },
                                    "models",
                                  ),
                                ),
                                React.createElement(
                                  "span",
                                  { style: { color: "#8a7e6e", fontSize: 10 } },
                                  "(Snap Shots 6+)",
                                ),
                              ),
                            assaultWeapons.length > 1 &&
                              React.createElement(
                                "div",
                                { style: { marginTop: 6 } },
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      marginBottom:
                                        dSecondaryRanged.length > 0 ? 4 : 0,
                                    },
                                  },
                                  React.createElement(
                                    "span",
                                    {
                                      style: {
                                        fontSize: 11,
                                        fontFamily: "'Share Tech Mono', serif",
                                        color: "#8a7e6e",
                                        letterSpacing: 0.5,
                                        textTransform: "uppercase",
                                      },
                                    },
                                    "Additional Weapons",
                                  ),
                                  React.createElement(
                                    "button",
                                    {
                                      onClick: () =>
                                        addSecondaryRanged("defender"),
                                      style: {
                                        padding: "2px 8px",
                                        borderRadius: 3,
                                        cursor: "pointer",
                                        fontSize: 8,
                                        fontFamily: "'Share Tech Mono', serif",
                                        fontWeight: 600,
                                        background: "rgba(42,111,180,0.08)",
                                        border:
                                          "1px solid rgba(42,111,180,0.2)",
                                        color: "#2a6fb4",
                                      },
                                    },
                                    "+ ADD",
                                  ),
                                ),
                                dSecondaryRanged.map((sw, idx) =>
                                  React.createElement(
                                    "div",
                                    {
                                      key: idx,
                                      style: {
                                        marginTop: 4,
                                        padding: "5px 8px",
                                        borderRadius: 4,
                                        background: "rgba(42,111,180,0.03)",
                                        border:
                                          "1px solid rgba(42,111,180,0.08)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        flexWrap: "wrap",
                                      },
                                    },
                                    React.createElement(
                                      "select",
                                      {
                                        value: sw.weapon.name,
                                        onChange: (e) => {
                                          const w = assaultWeapons.find(
                                            (rw) => rw.name === e.target.value,
                                          );
                                          if (w)
                                            updateSecondaryRanged(
                                              "defender",
                                              idx,
                                              "weapon",
                                              w,
                                            );
                                        },
                                        style: {
                                          flex: 1,
                                          minWidth: 100,
                                          padding: "3px 6px",
                                          fontSize: 12,
                                          borderRadius: 3,
                                          border: "1px solid #d0c4aa",
                                          background: "#f9f6f0",
                                          fontFamily:
                                            "'Share Tech Mono', serif",
                                        },
                                      },
                                      assaultWeapons.map((w) =>
                                        React.createElement(
                                          "option",
                                          { key: w.name, value: w.name },
                                          w.name,
                                          "(",
                                          w.shots,
                                          "sh S",
                                          w.s,
                                          "AP",
                                          w.ap,
                                          ")",
                                        ),
                                      ),
                                    ),
                                    React.createElement(
                                      "div",
                                      {
                                        style: {
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 4,
                                        },
                                      },
                                      React.createElement(
                                        "span",
                                        {
                                          style: {
                                            fontSize: 11,
                                            color: "#8a7e6e",
                                            fontFamily:
                                              "'Share Tech Mono', serif",
                                          },
                                        },
                                        "×",
                                      ),
                                      React.createElement("input", {
                                        type: "number",
                                        value: sw.models,
                                        min: 1,
                                        max: 20,
                                        onChange: (e) =>
                                          updateSecondaryRanged(
                                            "defender",
                                            idx,
                                            "models",
                                            parseInt(e.target.value) || 1,
                                          ),
                                        style: {
                                          width: 38,
                                          padding: "3px 4px",
                                          fontSize: 12,
                                          borderRadius: 3,
                                          border: "1px solid #d0c4aa",
                                          background: "#f9f6f0",
                                          textAlign: "center",
                                        },
                                      }),
                                      React.createElement(
                                        "span",
                                        {
                                          style: {
                                            fontSize: 11,
                                            color: "#8a7e6e",
                                          },
                                        },
                                        "models",
                                      ),
                                    ),
                                    React.createElement(
                                      "button",
                                      {
                                        onClick: () =>
                                          removeSecondaryRanged(
                                            "defender",
                                            idx,
                                          ),
                                        style: {
                                          padding: "2px 6px",
                                          borderRadius: 3,
                                          cursor: "pointer",
                                          fontSize: 11,
                                          background: "rgba(199,64,64,0.08)",
                                          border:
                                            "1px solid rgba(199,64,64,0.2)",
                                          color: "#c74040",
                                        },
                                      },
                                      "✕",
                                    ),
                                  ),
                                ),
                              ),
                          ),
                        assaultWeapons.length === 0 &&
                          volleyEligible.length === 0 &&
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "#8a7e6e",
                                fontStyle: "italic",
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "No Assault/Pistol weapons available",
                          ),
                        volleyEligible.length > 0 &&
                          React.createElement(
                            "div",
                            {
                              style: {
                                marginTop: 6,
                                padding: "6px 8px",
                                borderRadius: 5,
                                background: "rgba(107,63,138,0.04)",
                                border: "1px solid rgba(107,63,138,0.15)",
                              },
                            },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  marginBottom: dSgtVolleyWeapon ? 4 : 0,
                                },
                              },
                              React.createElement(
                                "span",
                                {
                                  style: {
                                    fontSize: 11,
                                    fontFamily: "'Share Tech Mono', serif",
                                    fontWeight: 700,
                                    color: "#6b3f8a",
                                    letterSpacing: 0.5,
                                  },
                                },
                                "⚜ SGT WEAPON",
                              ),
                              React.createElement(
                                "select",
                                {
                                  value: dSgtVolleyWeapon?.name || "",
                                  onChange: (e) => {
                                    const w = volleyEligible.find(
                                      (rw) => rw.name === e.target.value,
                                    );
                                    setDSgtVolleyWeapon(w || null);
                                  },
                                  style: {
                                    flex: 1,
                                    padding: "3px 6px",
                                    fontSize: 12,
                                    borderRadius: 3,
                                    border: "1px solid rgba(107,63,138,0.3)",
                                    background: "#f9f6f0",
                                    fontFamily: "'Share Tech Mono', serif",
                                  },
                                },
                                React.createElement(
                                  "option",
                                  { value: "" },
                                  "— No Sgt volley fire —",
                                ),
                                volleyEligible.map((w) =>
                                  React.createElement(
                                    "option",
                                    { key: w.name, value: w.name },
                                    w.name,
                                    "(",
                                    w.type,
                                    w.shots,
                                    "sh S",
                                    w.s,
                                    "AP",
                                    w.ap,
                                    ")",
                                  ),
                                ),
                              ),
                            ),
                            dSgtVolleyWeapon &&
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    fontSize: 11,
                                    color: "#6b3f8a",
                                    fontFamily: "'Share Tech Mono', serif",
                                    fontStyle: "italic",
                                  },
                                },
                                "Sgt fires",
                                dSgtVolleyWeapon.name,
                                "at Snap Shots 6+ (1 model)",
                              ),
                          ),
                      );
                    })(),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      padding: 10,
                      borderRadius: 6,
                      marginBottom: 10,
                      background: "rgba(196,106,27,0.04)",
                      border: "1px solid rgba(196,106,27,0.2)",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: doOverwatch ? 8 : 0,
                      },
                    },
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontSize: 13,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          color: "#c46a1b",
                          letterSpacing: 1,
                        },
                      },
                      "🔥 DEFENDER OVERWATCH (Normal BS)",
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: () => setDoOverwatch(!doOverwatch),
                        style: {
                          padding: "3px 10px",
                          borderRadius: 3,
                          cursor: "pointer",
                          fontSize: 11,
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: doOverwatch ? 700 : 400,
                          background: doOverwatch
                            ? "rgba(196,106,27,0.12)"
                            : "#f8f4ec",
                          border: `1px solid ${doOverwatch ? "#c46a1b" : "#d0c4aa"}`,
                          color: doOverwatch ? "#c46a1b" : "#8a7e6e",
                        },
                      },
                      doOverwatch ? "✓ ON" : "OFF",
                    ),
                  ),
                  doOverwatch &&
                    (() => {
                      const allWeapons = dRangedWeapons;
                      return React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 8,
                              color: "#8a7e6e",
                              fontFamily: "'Share Tech Mono', serif",
                              fontStyle: "italic",
                              marginBottom: 6,
                            },
                          },
                          React.createElement("strong", null, "Any"),
                          "ranged weapon may fire Overwatch · Uses normal BS",
                        ),
                        allWeapons.length === 0
                          ? React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 11,
                                  color: "#8a7e6e",
                                  fontStyle: "italic",
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              "No ranged weapons available",
                            )
                          : React.createElement(
                              React.Fragment,
                              null,
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    display: "flex",
                                    gap: 6,
                                    flexWrap: "wrap",
                                    marginBottom: 6,
                                  },
                                },
                                allWeapons.map((w) => {
                                  const active =
                                    dOverwatchWeapon?.name === w.name;
                                  return React.createElement(
                                    "button",
                                    {
                                      key: w.name,
                                      onClick: () => {
                                        setDOverwatchWeapon(w);
                                        setOverwatchShots(w.shots);
                                        setOverwatchS(w.s);
                                        setOverwatchAP(w.ap);
                                      },
                                      style: {
                                        padding: "7px 14px",
                                        borderRadius: 6,
                                        fontSize: 12,
                                        cursor: "pointer",
                                        fontFamily: "'Share Tech Mono', serif",
                                        fontWeight: active ? 700 : 400,
                                        background: active
                                          ? "rgba(196,106,27,0.18)"
                                          : "#f0ebe2",
                                        border: `1.5px solid ${active ? "#c46a1b" : "#d0c4aa"}`,
                                        color: active ? "#c46a1b" : "#6a5e4e",
                                        transition: "all 0.15s ease",
                                        textAlign: "left",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        minWidth: 120,
                                      },
                                    },
                                    React.createElement(
                                      "div",
                                      { style: { fontWeight: 600 } },
                                      w.name,
                                    ),
                                    React.createElement(
                                      "div",
                                      {
                                        style: {
                                          fontSize: 11,
                                          color: active ? "#9a4e10" : "#8a7e6e",
                                          letterSpacing: 0.5,
                                        },
                                      },
                                      w.type,
                                      w.shots,
                                      "· S",
                                      w.s,
                                      "AP",
                                      w.ap,
                                      "D",
                                      w.damage,
                                      w.traits ? ` · ${w.traits}` : "",
                                    ),
                                  );
                                }),
                              ),
                              dOverwatchWeapon &&
                                React.createElement(
                                  "div",
                                  {
                                    style: {
                                      padding: "6px 10px",
                                      borderRadius: 5,
                                      background: "rgba(196,106,27,0.06)",
                                      border: "1px solid #e0dbd0",
                                      fontSize: 13,
                                      color: "#4a4030",
                                      fontFamily: "'Share Tech Mono', serif",
                                      display: "flex",
                                      gap: 14,
                                      flexWrap: "wrap",
                                      alignItems: "center",
                                    },
                                  },
                                  React.createElement(
                                    "span",
                                    {
                                      style: {
                                        fontFamily: "'Share Tech Mono', serif",
                                        fontWeight: 600,
                                        color: "#c46a1b",
                                      },
                                    },
                                    dOverwatchWeapon.name,
                                  ),
                                  React.createElement(
                                    "span",
                                    null,
                                    "BS",
                                    overwatchBS,
                                    "(",
                                    BS_TO_HIT[overwatchBS] || 4,
                                    "+)",
                                  ),
                                  React.createElement(
                                    "span",
                                    null,
                                    dOverwatchWeapon.shots,
                                    "sh",
                                  ),
                                  React.createElement(
                                    "span",
                                    null,
                                    "S",
                                    dOverwatchWeapon.s,
                                  ),
                                  React.createElement(
                                    "span",
                                    null,
                                    "AP",
                                    dOverwatchWeapon.ap,
                                  ),
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                      },
                                    },
                                    React.createElement(
                                      "span",
                                      {
                                        style: {
                                          fontSize: 12,
                                          color: "#8a7e6e",
                                        },
                                      },
                                      "×",
                                    ),
                                    React.createElement("input", {
                                      type: "number",
                                      value: dOverwatchModels,
                                      min: 1,
                                      max: 40,
                                      onChange: (e) =>
                                        setDOverwatchModels(
                                          parseInt(e.target.value) || 1,
                                        ),
                                      style: {
                                        width: 38,
                                        padding: "2px 4px",
                                        fontSize: 12,
                                        borderRadius: 3,
                                        border: "1px solid #d0c4aa",
                                        background: "#f9f6f0",
                                        textAlign: "center",
                                        fontFamily: "'Share Tech Mono', serif",
                                      },
                                    }),
                                    React.createElement(
                                      "span",
                                      {
                                        style: {
                                          fontSize: 12,
                                          color: "#8a7e6e",
                                        },
                                      },
                                      "models",
                                    ),
                                  ),
                                ),
                              allWeapons.length > 1 &&
                                React.createElement(
                                  "div",
                                  { style: { marginTop: 6 } },
                                  React.createElement(
                                    "div",
                                    {
                                      style: {
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom:
                                          dOverwatchSecondary.length > 0
                                            ? 4
                                            : 0,
                                      },
                                    },
                                    React.createElement(
                                      "span",
                                      {
                                        style: {
                                          fontSize: 11,
                                          fontFamily:
                                            "'Share Tech Mono', serif",
                                          color: "#8a7e6e",
                                          letterSpacing: 0.5,
                                          textTransform: "uppercase",
                                        },
                                      },
                                      "Additional Weapons",
                                    ),
                                    React.createElement(
                                      "button",
                                      {
                                        onClick: () =>
                                          setDOverwatchSecondary((prev) => [
                                            ...prev,
                                            {
                                              weapon:
                                                allWeapons.find(
                                                  (w) =>
                                                    w.name !==
                                                    dOverwatchWeapon?.name,
                                                ) || allWeapons[0],
                                              models: 1,
                                            },
                                          ]),
                                        style: {
                                          padding: "2px 8px",
                                          borderRadius: 3,
                                          cursor: "pointer",
                                          fontSize: 8,
                                          fontFamily:
                                            "'Share Tech Mono', serif",
                                          fontWeight: 600,
                                          background: "rgba(196,106,27,0.08)",
                                          border:
                                            "1px solid rgba(196,106,27,0.2)",
                                          color: "#c46a1b",
                                        },
                                      },
                                      "+ ADD",
                                    ),
                                  ),
                                  dOverwatchSecondary.map((sw, idx) =>
                                    React.createElement(
                                      "div",
                                      {
                                        key: idx,
                                        style: {
                                          marginTop: 4,
                                          padding: "5px 8px",
                                          borderRadius: 4,
                                          background: "rgba(196,106,27,0.03)",
                                          border:
                                            "1px solid rgba(196,106,27,0.08)",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 8,
                                          flexWrap: "wrap",
                                        },
                                      },
                                      React.createElement(
                                        "select",
                                        {
                                          value: sw.weapon.name,
                                          onChange: (e) => {
                                            const w = allWeapons.find(
                                              (rw) =>
                                                rw.name === e.target.value,
                                            );
                                            if (w)
                                              setDOverwatchSecondary((prev) =>
                                                prev.map((s, i) =>
                                                  i === idx
                                                    ? { ...s, weapon: w }
                                                    : s,
                                                ),
                                              );
                                          },
                                          style: {
                                            flex: 1,
                                            minWidth: 100,
                                            padding: "3px 6px",
                                            fontSize: 12,
                                            borderRadius: 3,
                                            border: "1px solid #d0c4aa",
                                            background: "#f9f6f0",
                                            fontFamily:
                                              "'Share Tech Mono', serif",
                                          },
                                        },
                                        allWeapons.map((w) =>
                                          React.createElement(
                                            "option",
                                            { key: w.name, value: w.name },
                                            w.name,
                                            "(",
                                            w.shots,
                                            "sh S",
                                            w.s,
                                            "AP",
                                            w.ap,
                                            ")",
                                          ),
                                        ),
                                      ),
                                      React.createElement(
                                        "div",
                                        {
                                          style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                          },
                                        },
                                        React.createElement(
                                          "span",
                                          {
                                            style: {
                                              fontSize: 11,
                                              color: "#8a7e6e",
                                              fontFamily:
                                                "'Share Tech Mono', serif",
                                            },
                                          },
                                          "×",
                                        ),
                                        React.createElement("input", {
                                          type: "number",
                                          value: sw.models,
                                          min: 1,
                                          max: 20,
                                          onChange: (e) =>
                                            setDOverwatchSecondary((prev) =>
                                              prev.map((s, i) =>
                                                i === idx
                                                  ? {
                                                      ...s,
                                                      models:
                                                        parseInt(
                                                          e.target.value,
                                                        ) || 1,
                                                    }
                                                  : s,
                                              ),
                                            ),
                                          style: {
                                            width: 38,
                                            padding: "3px 4px",
                                            fontSize: 12,
                                            borderRadius: 3,
                                            border: "1px solid #d0c4aa",
                                            background: "#f9f6f0",
                                            textAlign: "center",
                                          },
                                        }),
                                        React.createElement(
                                          "span",
                                          {
                                            style: {
                                              fontSize: 11,
                                              color: "#8a7e6e",
                                            },
                                          },
                                          "models",
                                        ),
                                      ),
                                      React.createElement(
                                        "button",
                                        {
                                          onClick: () =>
                                            setDOverwatchSecondary((prev) =>
                                              prev.filter((_, i) => i !== idx),
                                            ),
                                          style: {
                                            padding: "2px 6px",
                                            borderRadius: 3,
                                            cursor: "pointer",
                                            fontSize: 11,
                                            background: "rgba(199,64,64,0.08)",
                                            border:
                                              "1px solid rgba(199,64,64,0.2)",
                                            color: "#c74040",
                                          },
                                        },
                                        "✕",
                                      ),
                                    ),
                                  ),
                                ),
                              dUnit?.hasSgt &&
                                (() => {
                                  const sgtCat = getSgtCategory(dUnit.id);
                                  const sgtWeapons = sgtCat
                                    ? SERGEANT_WEAPONS[sgtCat] || []
                                    : [];
                                  if (sgtWeapons.length === 0) return null;
                                  return React.createElement(
                                    "div",
                                    {
                                      style: {
                                        marginTop: 6,
                                        padding: "6px 8px",
                                        borderRadius: 5,
                                        background: "rgba(107,63,138,0.04)",
                                        border:
                                          "1px solid rgba(107,63,138,0.15)",
                                      },
                                    },
                                    React.createElement(
                                      "div",
                                      {
                                        style: {
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 8,
                                          marginBottom: dSgtOverwatchWeapon
                                            ? 4
                                            : 0,
                                        },
                                      },
                                      React.createElement(
                                        "span",
                                        {
                                          style: {
                                            fontSize: 11,
                                            fontFamily:
                                              "'Share Tech Mono', serif",
                                            fontWeight: 700,
                                            color: "#6b3f8a",
                                            letterSpacing: 0.5,
                                          },
                                        },
                                        "⚜ SGT WEAPON",
                                      ),
                                      React.createElement(
                                        "select",
                                        {
                                          value:
                                            dSgtOverwatchWeapon?.name || "",
                                          onChange: (e) => {
                                            const w = sgtWeapons.find(
                                              (rw) =>
                                                rw.name === e.target.value,
                                            );
                                            setDSgtOverwatchWeapon(w || null);
                                          },
                                          style: {
                                            flex: 1,
                                            padding: "3px 6px",
                                            fontSize: 12,
                                            borderRadius: 3,
                                            border:
                                              "1px solid rgba(107,63,138,0.3)",
                                            background: "#f9f6f0",
                                            fontFamily:
                                              "'Share Tech Mono', serif",
                                          },
                                        },
                                        React.createElement(
                                          "option",
                                          { value: "" },
                                          "— No Sgt overwatch —",
                                        ),
                                        sgtWeapons.map((w) =>
                                          React.createElement(
                                            "option",
                                            { key: w.name, value: w.name },
                                            w.name,
                                            "(",
                                            w.type,
                                            w.shots,
                                            "sh S",
                                            w.s,
                                            "AP",
                                            w.ap,
                                            ")",
                                          ),
                                        ),
                                      ),
                                    ),
                                    dSgtOverwatchWeapon &&
                                      React.createElement(
                                        "div",
                                        {
                                          style: {
                                            fontSize: 11,
                                            color: "#6b3f8a",
                                            fontFamily:
                                              "'Share Tech Mono', serif",
                                            fontStyle: "italic",
                                          },
                                        },
                                        "Sgt fires",
                                        dSgtOverwatchWeapon.name,
                                        "at normal BS (1 model)",
                                      ),
                                  );
                                })(),
                            ),
                      );
                    })(),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: 12,
                      marginBottom: 12,
                      padding: "8px 12px",
                      borderRadius: 6,
                      background: "rgba(155,45,45,0.03)",
                      border: "1px solid rgba(155,45,45,0.1)",
                    },
                  },
                  React.createElement(CheckToggle, {
                    checked: assaultCharging,
                    label: "Charging (+1A)",
                    onChange: setAssaultCharging,
                  }),
                  React.createElement(CheckToggle, {
                    checked: assaultDisordered,
                    label: "Disordered Charge",
                    onChange: (v) => {
                      setAssaultDisordered(v);
                      setChargeDisordered(v);
                    },
                  }),
                ),
                React.createElement(
                  "button",
                  {
                    onClick: handleChargeResolve,
                    style: {
                      width: "100%",
                      padding: "14px 24px",
                      fontSize: 17,
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      letterSpacing: 2,
                      background:
                        "linear-gradient(180deg, #9b2d2d 0%, #7a1a1a 100%)",
                      border: "none",
                      borderRadius: 6,
                      color: "#fff",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      boxShadow: "0 2px 12px rgba(155,45,45,0.25)",
                      marginBottom: chargeResult ? 14 : 0,
                    },
                  },
                  "🏃 RESOLVE CHARGE",
                ),
                chargeResult &&
                  React.createElement(
                    "div",
                    { style: { animation: "fadeIn 0.3s ease", marginTop: 12 } },
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "10px 16px",
                          borderRadius: 8,
                          marginBottom: 12,
                          background: chargeResult.chargeSucceeded
                            ? "rgba(46,125,50,0.08)"
                            : "rgba(200,60,60,0.08)",
                          border: `2px solid ${chargeResult.chargeSucceeded ? "#2e7d32" : "#c74040"}`,
                        },
                      },
                      React.createElement(
                        "span",
                        { style: { fontSize: 28 } },
                        chargeResult.chargeSucceeded ? "⚔" : "✗",
                      ),
                      React.createElement(
                        "div",
                        { style: { textAlign: "center" } },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 900,
                              fontSize: 16,
                              letterSpacing: 2,
                              color: chargeResult.chargeSucceeded
                                ? "#2e7d32"
                                : "#c74040",
                            },
                          },
                          chargeResult.chargeSucceeded
                            ? "CHARGE SUCCEEDED"
                            : "CHARGE FAILED",
                        ),
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 13,
                              color: "#6a5e4e",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          chargeResult.setUpMove !== undefined
                            ? `Set-Up: ${chargeResult.setUpMove}″ + D6(${chargeResult.chargeMoveDie}) = ${chargeResult.totalChargeMove}″ — Needed ${chargeDistance}″`
                            : `Rolled ${chargeResult.chargeRoll}″ — Needed ${chargeDistance}″`,
                        ),
                      ),
                    ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          gap: 10,
                          marginBottom: 12,
                          flexWrap: "wrap",
                          justifyContent: "center",
                        },
                      },
                      React.createElement(MiniStat, {
                        label: "Volley Kills",
                        value: chargeResult.volleyCasualties || 0,
                        color: "#6b8e23",
                      }),
                      React.createElement(MiniStat, {
                        label: "Def Volley Kills",
                        value: chargeResult.defVolleyCasualties || 0,
                        color: "#2a6fb4",
                      }),
                      React.createElement(MiniStat, {
                        label: "Overwatch Kills",
                        value: chargeResult.overwatchCasualties || 0,
                        color: "#c46a1b",
                      }),
                      React.createElement(MiniStat, {
                        label: "Survivors",
                        value: chargeResult.survivingChargers || 0,
                        color: "#9b2d2d",
                      }),
                    ),
                    chargeResult.rolls.volley &&
                      chargeResult.rolls.volley.hit &&
                      chargeResult.rolls.volley.hit.length > 0 &&
                      React.createElement(
                        "div",
                        {
                          style: {
                            marginBottom: 8,
                            padding: "8px 10px",
                            borderRadius: 6,
                            background: "rgba(107,142,35,0.04)",
                            border: "1px solid rgba(107,142,35,0.15)",
                          },
                        },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 12,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 700,
                              letterSpacing: 1,
                              marginBottom: 6,
                              color: "#6b8e23",
                            },
                          },
                          "🔫 CHARGER VOLLEY FIRE (6+)",
                        ),
                        React.createElement(
                          "div",
                          { style: { marginBottom: 4 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "#6b8e23",
                                marginBottom: 2,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "TO HIT",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                              },
                            },
                            chargeResult.rolls.volley.hit.map((d, i) =>
                              React.createElement(DieIcon, {
                                key: `vh${i}`,
                                value: d.value,
                                success: d.success,
                                small: true,
                              }),
                            ),
                          ),
                        ),
                        chargeResult.rolls.volley.wound.length > 0 &&
                          React.createElement(
                            "div",
                            { style: { marginBottom: 4 } },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 11,
                                  color: "#6b8e23",
                                  marginBottom: 2,
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              "TO WOUND",
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                },
                              },
                              chargeResult.rolls.volley.wound.map((d, i) =>
                                React.createElement(DieIcon, {
                                  key: `vw${i}`,
                                  value: d.value,
                                  success: d.success,
                                  small: true,
                                }),
                              ),
                            ),
                          ),
                        chargeResult.rolls.volley.save.length > 0 &&
                          React.createElement(
                            "div",
                            null,
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 11,
                                  color: "#6b8e23",
                                  marginBottom: 2,
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              "SAVES",
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                },
                              },
                              chargeResult.rolls.volley.save.map((d, i) =>
                                React.createElement(DieIcon, {
                                  key: `vs${i}`,
                                  value: d.value,
                                  success: d.success,
                                  small: true,
                                }),
                              ),
                            ),
                          ),
                      ),
                    chargeResult.rolls.defVolley &&
                      chargeResult.rolls.defVolley.hit &&
                      chargeResult.rolls.defVolley.hit.length > 0 &&
                      React.createElement(
                        "div",
                        {
                          style: {
                            marginBottom: 8,
                            padding: "8px 10px",
                            borderRadius: 6,
                            background: "rgba(42,111,180,0.04)",
                            border: "1px solid rgba(42,111,180,0.15)",
                          },
                        },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 12,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 700,
                              letterSpacing: 1,
                              marginBottom: 6,
                              color: "#2a6fb4",
                            },
                          },
                          "🔫 DEFENDER VOLLEY FIRE (6+)",
                        ),
                        React.createElement(
                          "div",
                          { style: { marginBottom: 4 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "#2a6fb4",
                                marginBottom: 2,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "TO HIT",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                              },
                            },
                            chargeResult.rolls.defVolley.hit.map((d, i) =>
                              React.createElement(DieIcon, {
                                key: `dvh${i}`,
                                value: d.value,
                                success: d.success,
                                small: true,
                              }),
                            ),
                          ),
                        ),
                        chargeResult.rolls.defVolley.wound.length > 0 &&
                          React.createElement(
                            "div",
                            { style: { marginBottom: 4 } },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 11,
                                  color: "#2a6fb4",
                                  marginBottom: 2,
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              "TO WOUND",
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                },
                              },
                              chargeResult.rolls.defVolley.wound.map((d, i) =>
                                React.createElement(DieIcon, {
                                  key: `dvw${i}`,
                                  value: d.value,
                                  success: d.success,
                                  small: true,
                                }),
                              ),
                            ),
                          ),
                        chargeResult.rolls.defVolley.save.length > 0 &&
                          React.createElement(
                            "div",
                            null,
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 11,
                                  color: "#2a6fb4",
                                  marginBottom: 2,
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              "SAVES",
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                },
                              },
                              chargeResult.rolls.defVolley.save.map((d, i) =>
                                React.createElement(DieIcon, {
                                  key: `dvs${i}`,
                                  value: d.value,
                                  success: d.success,
                                  small: true,
                                }),
                              ),
                            ),
                          ),
                      ),
                    chargeResult.rolls.overwatch &&
                      chargeResult.rolls.overwatch.hit &&
                      chargeResult.rolls.overwatch.hit.length > 0 &&
                      React.createElement(
                        "div",
                        {
                          style: {
                            marginBottom: 8,
                            padding: "8px 10px",
                            borderRadius: 6,
                            background: "rgba(196,106,27,0.04)",
                            border: "1px solid rgba(196,106,27,0.15)",
                          },
                        },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 12,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 700,
                              letterSpacing: 1,
                              marginBottom: 6,
                              color: "#c46a1b",
                            },
                          },
                          "🔥 OVERWATCH",
                        ),
                        React.createElement(
                          "div",
                          { style: { marginBottom: 4 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "#c46a1b",
                                marginBottom: 2,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "TO HIT",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                              },
                            },
                            chargeResult.rolls.overwatch.hit.map((r, i) =>
                              React.createElement(DieIcon, {
                                key: `oh${i}`,
                                value: r.value,
                                success: r.success,
                                small: true,
                              }),
                            ),
                          ),
                        ),
                        chargeResult.rolls.overwatch.wound.length > 0 &&
                          React.createElement(
                            "div",
                            { style: { marginBottom: 4 } },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 11,
                                  color: "#c46a1b",
                                  marginBottom: 2,
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              "TO WOUND",
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                },
                              },
                              chargeResult.rolls.overwatch.wound.map((r, i) =>
                                React.createElement(DieIcon, {
                                  key: `ow${i}`,
                                  value: r.value,
                                  success: r.success,
                                  small: true,
                                }),
                              ),
                            ),
                          ),
                        chargeResult.rolls.overwatch.save.length > 0 &&
                          React.createElement(
                            "div",
                            null,
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 11,
                                  color: "#c46a1b",
                                  marginBottom: 2,
                                  fontFamily: "'Share Tech Mono', serif",
                                },
                              },
                              "SAVES",
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                },
                              },
                              chargeResult.rolls.overwatch.save.map((r, i) =>
                                React.createElement(DieIcon, {
                                  key: `os${i}`,
                                  value: r.value,
                                  success: r.success,
                                  small: true,
                                }),
                              ),
                            ),
                          ),
                      ),
                    chargeResult.rolls.charge.length > 0 &&
                      React.createElement(
                        "div",
                        {
                          style: {
                            marginBottom: 8,
                            padding: "8px 10px",
                            borderRadius: 6,
                            background: "rgba(106,94,78,0.04)",
                            border: "1px solid rgba(106,94,78,0.15)",
                          },
                        },
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 12,
                              fontFamily: "'Share Tech Mono', serif",
                              fontWeight: 700,
                              letterSpacing: 1,
                              marginBottom: 6,
                              color: "#6a5e4e",
                            },
                          },
                          "🎲 CHARGE ROLL",
                        ),
                        React.createElement(
                          "div",
                          { style: { display: "flex", gap: 2 } },
                          chargeResult.rolls.charge.map((v, i) =>
                            React.createElement(DieIcon, {
                              key: i,
                              value: v,
                              success: true,
                              small: true,
                            }),
                          ),
                        ),
                      ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          borderTop: "1px solid #d0c4aa",
                          paddingTop: 12,
                          marginTop: 8,
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 13,
                            color: "#5a4e3e",
                            marginBottom: 8,
                            fontFamily: "'Share Tech Mono', serif",
                          },
                        },
                        "CHARGE LOG",
                      ),
                      chargeResult.log.map((entry, i) =>
                        React.createElement(
                          "div",
                          {
                            key: i,
                            style: {
                              display: "flex",
                              gap: 8,
                              alignItems: "flex-start",
                              marginBottom: 4,
                              fontSize: 13,
                            },
                          },
                          React.createElement(
                            "span",
                            {
                              style: {
                                color: phaseColors[entry.phase] || "#6a6a6a",
                                minWidth: 16,
                                textAlign: "center",
                              },
                            },
                            phaseIcons[entry.phase] || "•",
                          ),
                          React.createElement(
                            "span",
                            {
                              style: {
                                color: phaseColors[entry.phase] || "#6a6a6a",
                                minWidth: 80,
                                fontFamily: "'Share Tech Mono', serif",
                                fontSize: 12,
                                lineHeight: "20px",
                                textTransform: "uppercase",
                              },
                            },
                            entry.phase,
                          ),
                          React.createElement(
                            "span",
                            { style: { color: "#4a4030" } },
                            entry.text,
                          ),
                        ),
                      ),
                    ),
                  ),
              ),
          ),
          React.createElement(
            "div",
            {
              style: {
                ...panelStyle,
                marginBottom: 16,
                borderColor: challengeEnabled ? "#8b008b" : "#d0c4aa",
                transition: "border-color 0.3s ease",
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: challengeEnabled ? 14 : 0,
                },
              },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                React.createElement("span", { style: { fontSize: 18 } }, "👑"),
                React.createElement(
                  "span",
                  {
                    style: {
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#8b008b",
                      letterSpacing: 2,
                    },
                  },
                  "CHALLENGE SUB-PHASE",
                ),
              ),
              React.createElement(
                "button",
                {
                  onClick: () => {
                    setChallengeEnabled(!challengeEnabled);
                    setChallengeResult(null);
                  },
                  style: {
                    padding: "5px 14px",
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    background: challengeEnabled
                      ? "rgba(139,0,139,0.12)"
                      : "#f0ebe2",
                    border: `1.5px solid ${challengeEnabled ? "#8b008b" : "#d0c4aa"}`,
                    color: challengeEnabled ? "#8b008b" : "#8a7e6e",
                  },
                },
                challengeEnabled ? "COLLAPSE ▴" : "ISSUE CHALLENGE ▾",
              ),
            ),
            challengeEnabled &&
              React.createElement(
                "div",
                { style: { animation: "fadeIn 0.3s ease" } },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 13,
                      color: "#6a5e4e",
                      fontFamily: "'Share Tech Mono', serif",
                      marginBottom: 12,
                      fontStyle: "italic",
                    },
                  },
                  "Champions with Command or Champion sub-type step forward for a duel. Each selects a Gambit, then rolls for Focus to determine strike order.",
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginBottom: 12,
                    },
                  },
                  [
                    {
                      label: "ATTACKER GAMBIT",
                      val: atkGambit,
                      set: setAtkGambit,
                      col: "#9b2d2d",
                    },
                    {
                      label: "DEFENDER GAMBIT",
                      val: defGambit,
                      set: setDefGambit,
                      col: "#2a6fb4",
                    },
                  ].map((side) =>
                    React.createElement(
                      "div",
                      { key: side.label },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            color: side.col,
                            letterSpacing: 1,
                            marginBottom: 4,
                          },
                        },
                        side.label,
                      ),
                      React.createElement(
                        "div",
                        {
                          style: { display: "flex", gap: 3, flexWrap: "wrap" },
                        },
                        CHALLENGE_GAMBITS.map((g) => {
                          const active = side.val === g.id;
                          return React.createElement(
                            "button",
                            {
                              key: g.id,
                              onClick: () => side.set(g.id),
                              title: g.desc,
                              style: {
                                padding: "3px 7px",
                                borderRadius: 4,
                                fontSize: 11,
                                cursor: "pointer",
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight: active ? 700 : 400,
                                background: active
                                  ? "rgba(139,0,139,0.12)"
                                  : "#f8f4ec",
                                border: `1px solid ${active ? "#8b008b" : "#e0d8c8"}`,
                                color: active ? "#8b008b" : "#6a5e4e",
                              },
                            },
                            g.name,
                          );
                        }),
                      ),
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginBottom: 12,
                    },
                  },
                  [
                    {
                      g: CHALLENGE_GAMBITS.find((g) => g.id === atkGambit),
                      col: "#9b2d2d",
                    },
                    {
                      g: CHALLENGE_GAMBITS.find((g) => g.id === defGambit),
                      col: "#2a6fb4",
                    },
                  ].map((s, i) =>
                    s.g && s.g.id !== "none"
                      ? React.createElement(
                          "div",
                          {
                            key: i,
                            style: {
                              padding: "6px 10px",
                              borderRadius: 6,
                              background: "rgba(139,0,139,0.04)",
                              border: "1px solid rgba(139,0,139,0.15)",
                              fontSize: 12,
                              color: "#6a5e4e",
                              fontFamily: "'Share Tech Mono', serif",
                            },
                          },
                          React.createElement(
                            "span",
                            { style: { fontWeight: 700, color: "#8b008b" } },
                            s.g.name,
                            ":",
                          ),
                          s.g.desc,
                        )
                      : React.createElement("div", { key: i }),
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginBottom: 12,
                    },
                  },
                  React.createElement(NumberInput, {
                    label: "Atk Support Models",
                    value: atkSupport,
                    onChange: setAtkSupport,
                    min: 0,
                    max: 40,
                  }),
                  React.createElement(NumberInput, {
                    label: "Def Support Models",
                    value: defSupport,
                    onChange: setDefSupport,
                    min: 0,
                    max: 40,
                  }),
                ),
                React.createElement(
                  "button",
                  {
                    onClick: handleChallengeResolve,
                    style: {
                      width: "100%",
                      padding: "12px 20px",
                      fontSize: 17,
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      letterSpacing: 3,
                      background:
                        "linear-gradient(180deg, #a020a0 0%, #6b106b 100%)",
                      border: "none",
                      borderRadius: 8,
                      color: "#fff",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      boxShadow: "0 2px 12px rgba(139,0,139,0.3)",
                      marginBottom: 12,
                    },
                  },
                  "👑 RESOLVE CHALLENGE 👑",
                ),
                challengeResult &&
                  React.createElement(
                    "div",
                    { style: { animation: "fadeIn 0.3s ease" } },
                    React.createElement(
                      "div",
                      {
                        style: {
                          padding: "14px 20px",
                          borderRadius: 8,
                          marginBottom: 12,
                          textAlign: "center",
                          background:
                            challengeResult.result.winner === "Attacker"
                              ? "rgba(155,45,45,0.08)"
                              : challengeResult.result.winner === "Defender"
                                ? "rgba(42,111,180,0.08)"
                                : "rgba(139,0,139,0.06)",
                          border: `2px solid ${challengeResult.result.winner === "Attacker" ? "#9b2d2d" : challengeResult.result.winner === "Defender" ? "#2a6fb4" : "#8b008b"}`,
                        },
                      },
                      React.createElement(
                        "div",
                        { style: { fontSize: 24, marginBottom: 4 } },
                        challengeResult.atkSlain && challengeResult.defSlain
                          ? "💀💀"
                          : challengeResult.defSlain
                            ? "⚔"
                            : challengeResult.atkSlain
                              ? "🛡"
                              : "👑",
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 900,
                            fontSize: 16,
                            letterSpacing: 2,
                            color: "#8b008b",
                          },
                        },
                        challengeResult.result.winner === "Mutual Kill"
                          ? "MUTUAL DESTRUCTION"
                          : challengeResult.defSlain || challengeResult.atkSlain
                            ? `${challengeResult.result.slain || ""} SLAIN!`
                            : `ROUND: ${challengeResult.result.winner} AHEAD`,
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 13,
                            color: "#6a5e4e",
                            fontFamily: "'Share Tech Mono', serif",
                            marginTop: 4,
                          },
                        },
                        "Focus:",
                        challengeResult.focusWinner,
                        "struck first •\n                        Gambits:",
                        challengeResult.atkGambitData.name,
                        "vs",
                        challengeResult.defGambitData.name,
                      ),
                    ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          gap: 8,
                          justifyContent: "center",
                          flexWrap: "wrap",
                          marginBottom: 12,
                        },
                      },
                      React.createElement(MiniStat, {
                        label: "Atk Wounds",
                        value: `${challengeResult.atkWoundsRemaining}/${aW}`,
                        color: challengeResult.atkSlain ? "#c74040" : "#2a5e2a",
                      }),
                      React.createElement(MiniStat, {
                        label: "Def Wounds",
                        value: `${challengeResult.defWoundsRemaining}/${dW}`,
                        color: challengeResult.defSlain ? "#c74040" : "#2a5e2a",
                      }),
                      React.createElement(MiniStat, {
                        label: "Atk Dealt",
                        value: challengeResult.atkWoundsDealt,
                        color: "#9b2d2d",
                      }),
                      React.createElement(MiniStat, {
                        label: "Def Dealt",
                        value: challengeResult.defWoundsDealt,
                        color: "#2a6fb4",
                      }),
                    ),
                    ["attacker", "defender"].map((rk) => {
                      const r = challengeResult.rolls[rk];
                      const label = rk === "attacker" ? "ATTACKER" : "DEFENDER";
                      const col = rk === "attacker" ? "#9b2d2d" : "#2a6fb4";
                      return React.createElement(
                        "div",
                        { key: rk, style: { marginBottom: 8 } },
                        r.focus.length > 0 &&
                          React.createElement(
                            "div",
                            { style: { marginBottom: 4 } },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 12,
                                  color: "#8b008b",
                                  marginBottom: 2,
                                  fontFamily: "'Share Tech Mono', serif",
                                  letterSpacing: 1,
                                },
                              },
                              label,
                              "— FOCUS",
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                },
                              },
                              r.focus.map((d, i) =>
                                React.createElement(DieIcon, {
                                  key: `${rk}fo${i}`,
                                  value: d.value,
                                  success: d.success,
                                  small: true,
                                }),
                              ),
                            ),
                          ),
                        r.hit.length > 0 &&
                          React.createElement(
                            "div",
                            { style: { marginBottom: 4 } },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 12,
                                  color: col,
                                  marginBottom: 2,
                                  fontFamily: "'Share Tech Mono', serif",
                                  letterSpacing: 1,
                                },
                              },
                              label,
                              "— TO HIT",
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                },
                              },
                              r.hit.map((d, i) =>
                                React.createElement(DieIcon, {
                                  key: `${rk}ch${i}`,
                                  value: d.value,
                                  success: d.success,
                                  small: true,
                                }),
                              ),
                            ),
                          ),
                        r.wound.length > 0 &&
                          React.createElement(
                            "div",
                            { style: { marginBottom: 4 } },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 12,
                                  color: col,
                                  marginBottom: 2,
                                  fontFamily: "'Share Tech Mono', serif",
                                  letterSpacing: 1,
                                },
                              },
                              label,
                              "— TO WOUND",
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                },
                              },
                              r.wound.map((d, i) =>
                                React.createElement(DieIcon, {
                                  key: `${rk}cw${i}`,
                                  value: d.value,
                                  success: d.success,
                                  small: true,
                                }),
                              ),
                            ),
                          ),
                        r.save.length > 0 &&
                          React.createElement(
                            "div",
                            { style: { marginBottom: 4 } },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 12,
                                  color: col,
                                  marginBottom: 2,
                                  fontFamily: "'Share Tech Mono', serif",
                                  letterSpacing: 1,
                                },
                              },
                              label,
                              "— SAVES",
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                },
                              },
                              r.save.map((d, i) =>
                                React.createElement(DieIcon, {
                                  key: `${rk}cs${i}`,
                                  value: d.value,
                                  success: d.success,
                                  small: true,
                                }),
                              ),
                            ),
                          ),
                        r.fnp.length > 0 &&
                          React.createElement(
                            "div",
                            { style: { marginBottom: 4 } },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 12,
                                  color: col,
                                  marginBottom: 2,
                                  fontFamily: "'Share Tech Mono', serif",
                                  letterSpacing: 1,
                                },
                              },
                              label,
                              "— FNP",
                            ),
                            React.createElement(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                },
                              },
                              r.fnp.map((d, i) =>
                                React.createElement(DieIcon, {
                                  key: `${rk}cf${i}`,
                                  value: d.value,
                                  success: d.success,
                                  small: true,
                                }),
                              ),
                            ),
                          ),
                      );
                    }),
                    React.createElement(
                      "div",
                      { style: { marginTop: 6 } },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 12,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#8b008b",
                            letterSpacing: 1,
                            marginBottom: 4,
                          },
                        },
                        "CHALLENGE LOG",
                      ),
                      challengeResult.log.map((entry, i) =>
                        React.createElement(
                          "div",
                          {
                            key: i,
                            style: {
                              fontSize: 11,
                              padding: "3px 8px",
                              borderRadius: 4,
                              marginBottom: 2,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              background:
                                entry.phase === "Challenge"
                                  ? "rgba(139,0,139,0.06)"
                                  : entry.phase === "Gambit"
                                    ? "rgba(139,0,139,0.04)"
                                    : entry.phase === "Focus"
                                      ? "rgba(184,134,11,0.05)"
                                      : entry.phase === "Strike"
                                        ? "rgba(155,45,45,0.04)"
                                        : "rgba(0,0,0,0.02)",
                            },
                          },
                          React.createElement(
                            "span",
                            { style: { fontSize: 10 } },
                            entry.phase === "Challenge"
                              ? "👑"
                              : entry.phase === "Gambit"
                                ? "🎭"
                                : entry.phase === "Focus"
                                  ? "🎯"
                                  : entry.phase === "Strike"
                                    ? "🗡"
                                    : "⚖",
                          ),
                          React.createElement(
                            "span",
                            {
                              style: {
                                color:
                                  entry.phase === "Result"
                                    ? "#8b008b"
                                    : "#6a5e4e",
                                fontFamily: "'Share Tech Mono', serif",
                                fontWeight:
                                  entry.phase === "Result" ? 600 : 400,
                              },
                            },
                            entry.text,
                          ),
                        ),
                      ),
                    ),
                  ),
              ),
          ),
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 16 } },
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 12,
                  fontFamily: "'Share Tech Mono', serif",
                  fontWeight: 700,
                  color: "#7a1e1e",
                  letterSpacing: 1,
                  marginBottom: 10,
                  textAlign: "center",
                },
              },
              "📊 MELEE COMBAT REFERENCE",
            ),
            React.createElement(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                },
              },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      color: "#6a5e4e",
                      letterSpacing: 1,
                      marginBottom: 4,
                      textAlign: "center",
                    },
                  },
                  "TO HIT (WS vs WS)",
                ),
                React.createElement(
                  "table",
                  {
                    style: {
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                    },
                  },
                  React.createElement(
                    "thead",
                    null,
                    React.createElement(
                      "tr",
                      { style: { background: "rgba(122,30,30,0.08)" } },
                      React.createElement(
                        "th",
                        {
                          style: {
                            padding: "3px 4px",
                            border: "1px solid #d0c4aa",
                            fontSize: 8,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#7a1e1e",
                          },
                        },
                        "Atk\\Def",
                      ),
                      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) =>
                        React.createElement(
                          "th",
                          {
                            key: d,
                            style: {
                              padding: "3px 2px",
                              border: "1px solid #d0c4aa",
                              fontWeight: 700,
                              color: "#7a1e1e",
                            },
                          },
                          d,
                        ),
                      ),
                    ),
                  ),
                  React.createElement(
                    "tbody",
                    null,
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((a) =>
                      React.createElement(
                        "tr",
                        { key: a },
                        React.createElement(
                          "td",
                          {
                            style: {
                              padding: "2px 4px",
                              border: "1px solid #d0c4aa",
                              fontWeight: 700,
                              background: "rgba(122,30,30,0.04)",
                              color: "#7a1e1e",
                              textAlign: "center",
                            },
                          },
                          a,
                        ),
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => {
                          let need;
                          if (a >= d * 2) need = 2;
                          else if (a > d) need = 3;
                          else if (a === d) need = 4;
                          else if (d >= a * 2) need = 5;
                          else need = 5;
                          const bg =
                            need <= 2
                              ? "rgba(46,125,50,0.15)"
                              : need <= 3
                                ? "rgba(107,142,35,0.1)"
                                : need >= 5
                                  ? "rgba(200,60,60,0.08)"
                                  : "transparent";
                          return React.createElement(
                            "td",
                            {
                              key: d,
                              style: {
                                padding: "2px",
                                border: "1px solid #d0c4aa",
                                textAlign: "center",
                                background: bg,
                                fontWeight: need <= 3 ? 700 : 400,
                              },
                            },
                            need,
                            "+",
                          );
                        }),
                      ),
                    ),
                  ),
                ),
              ),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      color: "#6a5e4e",
                      letterSpacing: 1,
                      marginBottom: 4,
                      textAlign: "center",
                    },
                  },
                  "TO WOUND (S vs T)",
                ),
                React.createElement(
                  "table",
                  {
                    style: {
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                    },
                  },
                  React.createElement(
                    "thead",
                    null,
                    React.createElement(
                      "tr",
                      { style: { background: "rgba(122,30,30,0.08)" } },
                      React.createElement(
                        "th",
                        {
                          style: {
                            padding: "3px 4px",
                            border: "1px solid #d0c4aa",
                            fontSize: 8,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#b83030",
                          },
                        },
                        "S\\T",
                      ),
                      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) =>
                        React.createElement(
                          "th",
                          {
                            key: t,
                            style: {
                              padding: "3px 2px",
                              border: "1px solid #d0c4aa",
                              fontWeight: 700,
                              color: "#b83030",
                            },
                          },
                          t,
                        ),
                      ),
                    ),
                  ),
                  React.createElement(
                    "tbody",
                    null,
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) =>
                      React.createElement(
                        "tr",
                        { key: s },
                        React.createElement(
                          "td",
                          {
                            style: {
                              padding: "2px 4px",
                              border: "1px solid #d0c4aa",
                              fontWeight: 700,
                              background: "rgba(184,48,48,0.04)",
                              color: "#b83030",
                              textAlign: "center",
                            },
                          },
                          s,
                        ),
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => {
                          let need;
                          if (s >= t * 2) need = 2;
                          else if (s > t) need = 3;
                          else if (s === t) need = 4;
                          else if (t >= s * 2) need = 6;
                          else need = 5;
                          const label = need > 6 ? "—" : `${need}+`;
                          const bg =
                            need <= 2
                              ? "rgba(46,125,50,0.15)"
                              : need <= 3
                                ? "rgba(107,142,35,0.1)"
                                : need >= 6
                                  ? "rgba(200,60,60,0.1)"
                                  : need >= 5
                                    ? "rgba(200,60,60,0.04)"
                                    : "transparent";
                          return React.createElement(
                            "td",
                            {
                              key: t,
                              style: {
                                padding: "2px",
                                border: "1px solid #d0c4aa",
                                textAlign: "center",
                                background: bg,
                                fontWeight: need <= 3 ? 700 : 400,
                              },
                            },
                            label,
                          );
                        }),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          React.createElement(
            "button",
            {
              onClick: handleAssaultResolve,
              style: {
                width: "100%",
                padding: "16px 24px",
                fontSize: 17,
                fontFamily: "'Share Tech Mono', serif",
                fontWeight: 700,
                letterSpacing: 3,
                background: "linear-gradient(180deg, #a02020 0%, #7a1515 100%)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                cursor: "pointer",
                textTransform: "uppercase",
                boxShadow: "0 2px 16px rgba(155,45,45,0.3)",
                marginBottom: 16,
              },
            },
            "🗡 RESOLVE ASSAULT PHASE 🗡",
          ),
          showFiringVideo &&
            React.createElement(
              "div",
              {
                style: {
                  marginBottom: 16,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#050505",
                  border: "2px solid rgba(155,45,45,0.55)",
                  boxShadow:
                    "0 0 28px rgba(200,30,30,0.25), 0 0 8px rgba(155,45,45,0.2)",
                  animation: "fadeIn 0.3s ease",
                },
              },
              React.createElement("video", {
                src: "artwork/Firing.mp4",
                autoPlay: true,
                muted: true,
                playsInline: true,
                style: { width: "100%", display: "block", maxHeight: 360 },
                onEnded: () => setShowFiringVideo(false),
                onError: () => setShowFiringVideo(false),
              }),
            ),
          assaultResult &&
            React.createElement(
              "div",
              { style: { ...panelStyle, animation: "fadeIn 0.3s ease" } },
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px 20px",
                    borderRadius: 8,
                    marginBottom: 14,
                    background:
                      assaultResult.combatResult.winner === "Attacker"
                        ? "rgba(155,45,45,0.08)"
                        : assaultResult.combatResult.winner === "Defender"
                          ? "rgba(42,111,180,0.08)"
                          : "rgba(100,100,100,0.05)",
                    border: `2px solid ${assaultResult.combatResult.winner === "Attacker" ? "#9b2d2d" : assaultResult.combatResult.winner === "Defender" ? "#2a6fb4" : "#aaa"}`,
                  },
                },
                React.createElement(
                  "span",
                  { style: { fontSize: 28 } },
                  assaultResult.combatResult.winner === "Attacker"
                    ? "⚔"
                    : assaultResult.combatResult.winner === "Defender"
                      ? "🛡"
                      : "⚖",
                ),
                React.createElement(
                  "div",
                  { style: { textAlign: "center" } },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 900,
                        fontSize: 18,
                        letterSpacing: 2,
                        color:
                          assaultResult.combatResult.winner === "Attacker"
                            ? "#9b2d2d"
                            : assaultResult.combatResult.winner === "Defender"
                              ? "#2a6fb4"
                              : "#6a5e4e",
                      },
                    },
                    assaultResult.combatResult.winner === "Draw"
                      ? "COMBAT DRAW"
                      : `${assaultResult.combatResult.winner.toUpperCase()} WINS BY ${assaultResult.combatResult.diff}`,
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 12,
                        color: "#8a7e6e",
                        fontFamily: "'Share Tech Mono', serif",
                      },
                    },
                    "CR: Attacker",
                    assaultResult.combatResult.attackerScore,
                    "— Defender",
                    assaultResult.combatResult.defenderScore,
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 13,
                        color: "#5a4e3e",
                        fontFamily: "'Share Tech Mono', serif",
                      },
                    },
                    assaultResult.remainingAttackers,
                    "attacker(s) /",
                    assaultResult.remainingDefenders,
                    "defender(s) survive",
                  ),
                ),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginBottom: 14,
                  },
                },
                React.createElement(MiniStat, {
                  label: "Atk Killed",
                  value: assaultResult.defenderCasualties,
                  color: "#9b2d2d",
                }),
                React.createElement(MiniStat, {
                  label: "Def Killed",
                  value: assaultResult.attackerCasualties,
                  color: "#2a6fb4",
                }),
                React.createElement(MiniStat, {
                  label: "Atk Survive",
                  value: assaultResult.remainingAttackers,
                  color: "#2a5e2a",
                }),
                React.createElement(MiniStat, {
                  label: "Def Survive",
                  value: assaultResult.remainingDefenders,
                  color: "#2a5e2a",
                }),
              ),
              assaultResult.routCheck &&
                React.createElement(
                  "div",
                  {
                    style: {
                      padding: "10px 14px",
                      borderRadius: 8,
                      marginBottom: 14,
                      background: assaultResult.routCheck.routed
                        ? "rgba(255,102,0,0.08)"
                        : "rgba(42,160,42,0.06)",
                      border: `2px solid ${assaultResult.routCheck.routed ? "#ff6600" : "#2a8a2a"}`,
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      },
                    },
                    React.createElement(
                      "span",
                      { style: { fontSize: 20 } },
                      assaultResult.routCheck.routed ? "💨" : "🛡",
                    ),
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 900,
                            fontSize: 13,
                            letterSpacing: 1,
                            color: assaultResult.routCheck.routed
                              ? "#ff6600"
                              : "#2a8a2a",
                          },
                        },
                        assaultResult.routCheck.loser.toUpperCase(),
                        "(",
                        assaultResult.routCheck.loserName,
                        ") —",
                        assaultResult.routCheck.routed ? "ROUTED!" : "HOLDS!",
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 12,
                            color: "#6a5e4e",
                            fontFamily: "'Share Tech Mono', serif",
                          },
                        },
                        "Lost CR",
                        assaultResult.routCheck.loserScore,
                        "vs",
                        assaultResult.routCheck.winnerScore,
                        "· Ld",
                        assaultResult.routCheck.baseLd,
                        "−",
                        assaultResult.routCheck.modifier,
                        "=",
                        assaultResult.routCheck.modifiedLd,
                        "· Rolled",
                        assaultResult.routCheck.roll[0],
                        "+",
                        assaultResult.routCheck.roll[1],
                        "=",
                        assaultResult.routCheck.total,
                      ),
                    ),
                  ),
                  assaultResult.routCheck.routed &&
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 11,
                          color: "#ff6600",
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 600,
                          marginTop: 2,
                        },
                      },
                      "The",
                      assaultResult.routCheck.loser.toLowerCase(),
                      "unit is Routed — must Fall Back next Movement Phase.",
                    ),
                ),
              (() => {
                const cr = assaultResult.combatResult;
                const atkRouted =
                  assaultResult.routCheck?.loser === "Attacker" &&
                  assaultResult.routCheck?.routed;
                const defRouted =
                  assaultResult.routCheck?.loser === "Defender" &&
                  assaultResult.routCheck?.routed;
                const atkWon = cr.winner === "Attacker";
                const defWon = cr.winner === "Defender";
                const isDraw = cr.winner === "Draw";

                // Available choices per side
                const atkChoices = atkRouted
                  ? [
                      {
                        id: "fallback",
                        label: "Fall Back",
                        icon: "💨",
                        desc: "Unit is Routed — must Fall Back",
                      },
                    ]
                  : [
                      {
                        id: "hold",
                        label: "Hold",
                        icon: "🛡",
                        desc: "Remain in place, locked in combat",
                      },
                      {
                        id: "disengage",
                        label: "Disengage",
                        icon: "↩",
                        desc: "Only available if this unit lost combat",
                        disabled: atkWon || isDraw,
                      },
                      {
                        id: "fallback",
                        label: "Fall Back",
                        icon: "💨",
                        desc: "Voluntarily withdraw",
                      },
                    ];
                const defChoices = defRouted
                  ? [
                      {
                        id: "fallback",
                        label: "Fall Back",
                        icon: "💨",
                        desc: "Unit is Routed — must Fall Back",
                      },
                    ]
                  : [
                      {
                        id: "hold",
                        label: "Hold",
                        icon: "🛡",
                        desc: "Remain in place, locked in combat",
                      },
                      {
                        id: "disengage",
                        label: "Disengage",
                        icon: "↩",
                        desc: "Only available if this unit lost combat",
                        disabled: defWon || isDraw,
                      },
                      {
                        id: "fallback",
                        label: "Fall Back",
                        icon: "💨",
                        desc: "Voluntarily withdraw",
                      },
                    ];

                // Winner always gets pursuit options; loser gets hold/disengage/fallback
                const pursuitChoices = [
                  {
                    id: "pursue",
                    label: "Pursue",
                    icon: "⚔",
                    desc: "Chase the fleeing enemy",
                  },
                  {
                    id: "gundown",
                    label: "Gun Down",
                    icon: "🎯",
                    desc: "Fire on the fleeing unit",
                  },
                  {
                    id: "consolidate",
                    label: "Consolidate",
                    icon: "📍",
                    desc: "Hold position and regroup",
                  },
                ];
                const atkFinalChoices = atkRouted
                  ? atkChoices
                  : atkWon
                    ? pursuitChoices
                    : atkChoices;
                const defFinalChoices = defRouted
                  ? defChoices
                  : defWon
                    ? pursuitChoices
                    : defChoices;

                return React.createElement(
                  "div",
                  { style: { marginBottom: 14 } },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 12,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#6a5e4e",
                        letterSpacing: 1,
                        marginBottom: 8,
                        fontWeight: 700,
                      },
                    },
                    "⚔ POST-COMBAT CHOICES",
                  ),
                  React.createElement(
                    "div",
                    { style: { display: "flex", gap: 10, flexWrap: "wrap" } },
                    React.createElement(
                      "div",
                      {
                        style: {
                          flex: 1,
                          minWidth: 160,
                          padding: "10px 12px",
                          borderRadius: 6,
                          background: "rgba(155,45,45,0.04)",
                          border: "1px solid rgba(155,45,45,0.15)",
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 12,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#9b2d2d",
                            fontWeight: 700,
                            marginBottom: 6,
                          },
                        },
                        "⚔ ATTACKER —",
                        aUnit?.name || "Attacker",
                        atkWon &&
                          !atkRouted &&
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 11,
                                fontWeight: 400,
                                color: "#8a7e6e",
                                marginLeft: 6,
                              },
                            },
                            "(WINNER)",
                          ),
                      ),
                      atkFinalChoices.map((c) =>
                        React.createElement(
                          "button",
                          {
                            key: c.id,
                            disabled: c.disabled,
                            onClick: () =>
                              setAtkCombatChoice(c.disabled ? null : c.id),
                            style: {
                              display: "block",
                              width: "100%",
                              marginBottom: 4,
                              padding: "6px 10px",
                              borderRadius: 5,
                              border: `1.5px solid ${atkCombatChoice === c.id ? "#9b2d2d" : c.disabled ? "#ddd" : "#d0c4aa"}`,
                              background:
                                atkCombatChoice === c.id
                                  ? "rgba(155,45,45,0.12)"
                                  : c.disabled
                                    ? "#f5f5f5"
                                    : "#faf8f4",
                              color: c.disabled
                                ? "#bbb"
                                : atkCombatChoice === c.id
                                  ? "#9b2d2d"
                                  : "#4a4030",
                              fontFamily: "'Share Tech Mono', serif",
                              fontSize: 11,
                              fontWeight: atkCombatChoice === c.id ? 700 : 400,
                              cursor: c.disabled ? "not-allowed" : "pointer",
                              textAlign: "left",
                            },
                          },
                          c.icon,
                          c.label,
                          c.disabled &&
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 11,
                                  marginLeft: 6,
                                  color: "#bbb",
                                },
                              },
                              "(n/a)",
                            ),
                        ),
                      ),
                    ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          flex: 1,
                          minWidth: 160,
                          padding: "10px 12px",
                          borderRadius: 6,
                          background: "rgba(42,111,180,0.04)",
                          border: "1px solid rgba(42,111,180,0.15)",
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 12,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#2a6fb4",
                            fontWeight: 700,
                            marginBottom: 6,
                          },
                        },
                        "🛡 DEFENDER —",
                        dUnit?.name || "Defender",
                        defWon &&
                          !defRouted &&
                          React.createElement(
                            "span",
                            {
                              style: {
                                fontSize: 11,
                                fontWeight: 400,
                                color: "#8a7e6e",
                                marginLeft: 6,
                              },
                            },
                            "(WINNER)",
                          ),
                      ),
                      defFinalChoices.map((c) =>
                        React.createElement(
                          "button",
                          {
                            key: c.id,
                            disabled: c.disabled,
                            onClick: () =>
                              setDefCombatChoice(c.disabled ? null : c.id),
                            style: {
                              display: "block",
                              width: "100%",
                              marginBottom: 4,
                              padding: "6px 10px",
                              borderRadius: 5,
                              border: `1.5px solid ${defCombatChoice === c.id ? "#2a6fb4" : c.disabled ? "#ddd" : "#d0c4aa"}`,
                              background:
                                defCombatChoice === c.id
                                  ? "rgba(42,111,180,0.12)"
                                  : c.disabled
                                    ? "#f5f5f5"
                                    : "#faf8f4",
                              color: c.disabled
                                ? "#bbb"
                                : defCombatChoice === c.id
                                  ? "#2a6fb4"
                                  : "#4a4030",
                              fontFamily: "'Share Tech Mono', serif",
                              fontSize: 11,
                              fontWeight: defCombatChoice === c.id ? 700 : 400,
                              cursor: c.disabled ? "not-allowed" : "pointer",
                              textAlign: "left",
                            },
                          },
                          c.icon,
                          c.label,
                          c.disabled &&
                            React.createElement(
                              "span",
                              {
                                style: {
                                  fontSize: 11,
                                  marginLeft: 6,
                                  color: "#bbb",
                                },
                              },
                              "(n/a)",
                            ),
                        ),
                      ),
                    ),
                  ),
                  (atkCombatChoice || defCombatChoice) &&
                    React.createElement(
                      "div",
                      {
                        style: {
                          marginTop: 8,
                          padding: "8px 12px",
                          borderRadius: 6,
                          background: "rgba(184,134,11,0.06)",
                          border: "1px solid rgba(184,134,11,0.2)",
                          fontSize: 11,
                          fontFamily: "'Share Tech Mono', serif",
                          color: "#6a5030",
                        },
                      },
                      atkCombatChoice &&
                        React.createElement(
                          "div",
                          null,
                          "⚔ Attacker —",
                          atkCombatChoice
                            .replace("gundown", "Gun Down")
                            .replace("pursue", "Pursue")
                            .replace("consolidate", "Consolidate")
                            .replace("hold", "Hold")
                            .replace("disengage", "Disengage")
                            .replace("fallback", "Fall Back"),
                        ),
                      defCombatChoice &&
                        React.createElement(
                          "div",
                          null,
                          "🛡 Defender —",
                          defCombatChoice
                            .replace("gundown", "Gun Down")
                            .replace("pursue", "Pursue")
                            .replace("consolidate", "Consolidate")
                            .replace("hold", "Hold")
                            .replace("disengage", "Disengage")
                            .replace("fallback", "Fall Back"),
                        ),
                    ),
                );
              })(),
              assaultResult.rollsByGroup &&
                assaultResult.rollsByGroup.length > 0 &&
                React.createElement(
                  "div",
                  { style: { marginBottom: 14 } },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 12,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#6a5e4e",
                        letterSpacing: 1,
                        marginBottom: 6,
                        fontWeight: 700,
                      },
                    },
                    "DICE ROLLS BY GROUP",
                  ),
                  assaultResult.rollsByGroup.map((wg, wi) => {
                    const r = wg.rolls || {
                      hit: [],
                      wound: [],
                      save: [],
                      fnp: [],
                    };
                    const hasAny =
                      r.hit.length > 0 ||
                      r.wound.length > 0 ||
                      r.save.length > 0 ||
                      r.fnp.length > 0;
                    if (!hasAny) return null;
                    const isAtk = wg.side === "Attacker";
                    const col = isAtk ? "#9b2d2d" : "#2a6fb4";
                    const rgb = isAtk ? "155,45,45" : "42,111,180";
                    return React.createElement(
                      "div",
                      {
                        key: wi,
                        style: {
                          marginBottom: 8,
                          padding: "8px 10px",
                          borderRadius: 6,
                          background: `rgba(${rgb},0.03)`,
                          border: `1px solid rgba(${rgb},0.15)`,
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 12,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            letterSpacing: 1,
                            marginBottom: 6,
                            color: col,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                        },
                        React.createElement(
                          "span",
                          null,
                          isAtk ? "⚔" : "🛡",
                          wg.side,
                          ":",
                          wg.name,
                        ),
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              fontWeight: 400,
                              color: "#8a7e6e",
                            },
                          },
                          "I",
                          wg.i,
                          "·",
                          wg.models,
                          "model",
                          wg.models !== 1 ? "s" : "",
                        ),
                      ),
                      r.hit.length > 0 &&
                        React.createElement(
                          "div",
                          { style: { marginBottom: 5 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: col,
                                marginBottom: 2,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "TO HIT",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                              },
                            },
                            r.hit.map((d, i) =>
                              React.createElement(DieIcon, {
                                key: `${wi}h${i}`,
                                value: d.value,
                                success: d.success,
                                small: true,
                              }),
                            ),
                          ),
                        ),
                      r.wound.length > 0 &&
                        React.createElement(
                          "div",
                          { style: { marginBottom: 5 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: col,
                                marginBottom: 2,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "TO WOUND",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                              },
                            },
                            r.wound.map((d, i) =>
                              React.createElement(DieIcon, {
                                key: `${wi}w${i}`,
                                value: d.value,
                                success: d.success,
                                small: true,
                              }),
                            ),
                          ),
                        ),
                      r.save.length > 0 &&
                        React.createElement(
                          "div",
                          { style: { marginBottom: 5 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: col,
                                marginBottom: 2,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "SAVES",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                              },
                            },
                            r.save.map((d, i) =>
                              React.createElement(DieIcon, {
                                key: `${wi}s${i}`,
                                value: d.value,
                                success: d.success,
                                small: true,
                              }),
                            ),
                          ),
                        ),
                      r.fnp.length > 0 &&
                        React.createElement(
                          "div",
                          null,
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: col,
                                marginBottom: 2,
                                fontFamily: "'Share Tech Mono', serif",
                              },
                            },
                            "FNP",
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                              },
                            },
                            r.fnp.map((d, i) =>
                              React.createElement(DieIcon, {
                                key: `${wi}f${i}`,
                                value: d.value,
                                success: d.success,
                                small: true,
                              }),
                            ),
                          ),
                        ),
                    );
                  }),
                ),
              React.createElement(
                "div",
                { style: { marginTop: 8 } },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#6a5e4e",
                      letterSpacing: 1,
                      marginBottom: 6,
                    },
                  },
                  "COMBAT LOG",
                ),
                assaultResult.log.map((entry, i) =>
                  React.createElement(
                    "div",
                    {
                      key: i,
                      style: {
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 4,
                        marginBottom: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background:
                          entry.phase === "Initiative"
                            ? "rgba(155,45,45,0.04)"
                            : entry.phase === "Combat Res"
                              ? "rgba(184,134,11,0.06)"
                              : entry.phase === "Rout Check"
                                ? "rgba(255,102,0,0.04)"
                                : "rgba(0,0,0,0.02)",
                      },
                    },
                    React.createElement(
                      "span",
                      { style: { fontSize: 10 } },
                      entry.phase === "Initiative"
                        ? "🗡"
                        : entry.phase === "Combat Res"
                          ? "⚖"
                          : entry.phase === "Rout Check"
                            ? "🏳"
                            : "•",
                    ),
                    React.createElement(
                      "span",
                      {
                        style: {
                          color:
                            entry.phase === "Combat Res"
                              ? "#8b6508"
                              : entry.phase === "Rout Check"
                                ? "#cc5500"
                                : "#6a5e4e",
                          fontFamily: "'Share Tech Mono', serif",
                        },
                      },
                      entry.text,
                    ),
                  ),
                ),
              ),
            ),
          renderResultsTracker(["charge", "assault"]),
        ),
      activePhase === "end" &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 16, textAlign: "center" } },
            React.createElement(
              "div",
              {
                style: {
                  fontFamily: "'Share Tech Mono', serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#2e5e3e",
                  letterSpacing: 2,
                  marginBottom: 12,
                },
              },
              "🏛 ROUND",
              currentRound,
              "— VICTORY SUB-PHASE",
            ),
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "center",
                  gap: 32,
                  marginBottom: 12,
                },
              },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#9b2d2d",
                      letterSpacing: 1,
                    },
                  },
                  "LOYALIST",
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 36,
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 900,
                      color: "#9b2d2d",
                    },
                  },
                  p1TotalVP + calcSecondaryVP(p1Secondaries),
                ),
                React.createElement(
                  "div",
                  { style: { fontSize: 11, color: "#8a7e6e" } },
                  "Primary",
                  p1TotalVP,
                  "+ Secondary",
                  calcSecondaryVP(p1Secondaries),
                ),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    fontSize: 20,
                    color: "#c0b498",
                  },
                },
                "vs",
              ),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#2a6fb4",
                      letterSpacing: 1,
                    },
                  },
                  "TRAITORS",
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 36,
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 900,
                      color: "#2a6fb4",
                    },
                  },
                  p2TotalVP + calcSecondaryVP(p2Secondaries),
                ),
                React.createElement(
                  "div",
                  { style: { fontSize: 11, color: "#8a7e6e" } },
                  "Primary",
                  p2TotalVP,
                  "+ Secondary",
                  calcSecondaryVP(p2Secondaries),
                ),
              ),
            ),
          ),
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 16 } },
            React.createElement(
              "div",
              {
                style: { ...panelHeaderStyle, justifyContent: "space-between" },
              },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                React.createElement(
                  "span",
                  { style: { color: "#2e5e3e", fontSize: 16 } },
                  "💀",
                ),
                React.createElement(
                  "span",
                  { style: { color: "#2e5e3e" } },
                  "CASUALTIES THIS ROUND",
                ),
              ),
              React.createElement(
                "button",
                {
                  onClick: () => setRoundKills([]),
                  style: {
                    padding: "4px 12px",
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    background: "rgba(200,50,50,0.08)",
                    border: "1.5px solid #c74040",
                    color: "#c74040",
                  },
                },
                "RESET ✕",
              ),
            ),
            roundKills.length === 0
              ? React.createElement(
                  "div",
                  {
                    style: {
                      textAlign: "center",
                      padding: "16px 0",
                      fontSize: 13,
                      color: "#a09888",
                      fontFamily: "'Share Tech Mono', serif",
                      fontStyle: "italic",
                    },
                  },
                  "No casualties recorded. Resolve combats in Shooting or Assault phase to track kills here.",
                )
              : React.createElement(
                  React.Fragment,
                  null,
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        gap: 8,
                        justifyContent: "center",
                        flexWrap: "wrap",
                        marginBottom: 12,
                      },
                    },
                    React.createElement(MiniStat, {
                      label: "Total Killed",
                      value: roundKills.reduce((s, k) => s + k.casualties, 0),
                      color: "#c74040",
                    }),
                    React.createElement(MiniStat, {
                      label: "Shooting",
                      value: roundKills
                        .filter((k) => k.phase === "Shooting")
                        .reduce((s, k) => s + k.casualties, 0),
                      color: "#b8860b",
                    }),
                    React.createElement(MiniStat, {
                      label: "Charge",
                      value: roundKills
                        .filter((k) => k.phase === "Charge")
                        .reduce((s, k) => s + k.casualties, 0),
                      color: "#c46a1b",
                    }),
                    React.createElement(MiniStat, {
                      label: "Challenge",
                      value: roundKills
                        .filter((k) => k.phase === "Challenge")
                        .reduce((s, k) => s + k.casualties, 0),
                      color: "#8b008b",
                    }),
                    React.createElement(MiniStat, {
                      label: "Assault",
                      value: roundKills
                        .filter((k) => k.phase === "Assault")
                        .reduce((s, k) => s + k.casualties, 0),
                      color: "#9b2d2d",
                    }),
                  ),
                  roundKills.map((kill, i) =>
                    React.createElement(
                      "div",
                      {
                        key: i,
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 10px",
                          borderRadius: 4,
                          marginBottom: 3,
                          background:
                            kill.phase === "Shooting"
                              ? "rgba(184,134,11,0.04)"
                              : kill.phase === "Charge"
                                ? "rgba(196,106,27,0.04)"
                                : kill.phase === "Challenge"
                                  ? "rgba(139,0,139,0.04)"
                                  : "rgba(155,45,45,0.04)",
                          border: `1px solid ${kill.phase === "Shooting" ? "rgba(184,134,11,0.15)" : kill.phase === "Charge" ? "rgba(196,106,27,0.15)" : kill.phase === "Challenge" ? "rgba(139,0,139,0.15)" : "rgba(155,45,45,0.15)"}`,
                        },
                      },
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 8,
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            letterSpacing: 1,
                            padding: "2px 6px",
                            borderRadius: 3,
                            color: "#fff",
                            background:
                              kill.phase === "Shooting"
                                ? "#b8860b"
                                : kill.phase === "Charge"
                                  ? "#c46a1b"
                                  : kill.phase === "Challenge"
                                    ? "#8b008b"
                                    : "#9b2d2d",
                          },
                        },
                        kill.phase === "Shooting"
                          ? "SHOOT"
                          : kill.phase === "Charge"
                            ? "CHARGE"
                            : kill.phase === "Challenge"
                              ? "DUEL"
                              : "MELEE",
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 11,
                            fontFamily: "'Share Tech Mono', serif",
                            color: "#4a4030",
                            flex: 1,
                          },
                        },
                        kill.detail,
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#c74040",
                          },
                        },
                        kill.casualties,
                      ),
                    ),
                  ),
                ),
          ),
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 16 } },
            React.createElement(
              "div",
              {
                style: { ...panelHeaderStyle, justifyContent: "space-between" },
              },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                React.createElement(
                  "span",
                  { style: { color: "#2e5e3e", fontSize: 16 } },
                  "🎯",
                ),
                React.createElement(
                  "span",
                  { style: { color: "#2e5e3e" } },
                  "PRIMARY OBJECTIVES",
                ),
                React.createElement(
                  "span",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#5b4a8a",
                      letterSpacing: 1,
                      padding: "2px 8px",
                      borderRadius: 3,
                      background: "rgba(91,74,138,0.1)",
                      border: "1px solid rgba(91,74,138,0.25)",
                    },
                  },
                  MISSIONS[missionType]?.name,
                ),
              ),
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6 } },
                objectiveMarkers.length > 0 &&
                  React.createElement(
                    "button",
                    {
                      onClick: () => {
                        // Sync objectives from placed markers
                        const sorted = [...objectiveMarkers].sort(
                          (a, b) => a.id - b.id,
                        );
                        setObjectives(
                          sorted.map((m, i) => ({
                            id: i + 1,
                            value: m.value,
                            controller: "none",
                            line: 0,
                          })),
                        );
                      },
                      style: {
                        padding: "3px 10px",
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: 600,
                        letterSpacing: 1,
                        background: "rgba(91,74,138,0.10)",
                        border: "1.5px solid #5b4a8a",
                        color: "#5b4a8a",
                      },
                      title:
                        "Sync objective count and VP values from markers placed on the map",
                    },
                    "↓ SYNC FROM MAP (",
                    objectiveMarkers.length,
                    ")",
                  ),
                React.createElement(
                  "span",
                  {
                    style: {
                      fontSize: 12,
                      color: "#8a7e6e",
                      fontFamily: "'Share Tech Mono', serif",
                    },
                  },
                  "Objectives:",
                ),
                [2, 3, 4, 5, 6].map((n) =>
                  React.createElement(
                    "button",
                    {
                      key: n,
                      onClick: () => handleNumObjectivesChange(n),
                      style: {
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "'Share Tech Mono', serif",
                        fontWeight: numObjectives === n ? 700 : 400,
                        background:
                          numObjectives === n
                            ? "rgba(46,94,62,0.12)"
                            : "#f0ebe2",
                        border: `1px solid ${numObjectives === n ? "#2e5e3e" : "#d0c4aa"}`,
                        color: numObjectives === n ? "#2e5e3e" : "#8a7e6e",
                      },
                    },
                    n,
                  ),
                ),
              ),
            ),
            objectives.map((obj, idx) =>
              React.createElement(
                "div",
                {
                  key: obj.id,
                  style: {
                    display: "grid",
                    gridTemplateColumns: "auto 1fr 1fr 1fr",
                    gap: 10,
                    alignItems: "center",
                    padding: "8px 10px",
                    marginBottom: 4,
                    borderRadius: 6,
                    background:
                      obj.controller === "p1"
                        ? "rgba(155,45,45,0.05)"
                        : obj.controller === "p2"
                          ? "rgba(42,111,180,0.05)"
                          : "rgba(0,0,0,0.02)",
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#2e5e3e",
                      minWidth: 50,
                    },
                  },
                  "OBJ",
                  idx + 1,
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 4 } },
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#8a7e6e",
                      },
                    },
                    "Value:",
                  ),
                  [2, 3].map((v) =>
                    React.createElement(
                      "button",
                      {
                        key: v,
                        onClick: () => updateObjective(idx, "value", v),
                        style: {
                          padding: "2px 8px",
                          borderRadius: 3,
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: obj.value === v ? 700 : 400,
                          background:
                            obj.value === v ? "rgba(46,94,62,0.15)" : "#f8f4ec",
                          border: `1px solid ${obj.value === v ? "#2e5e3e" : "#e0d8c8"}`,
                          color: obj.value === v ? "#2e5e3e" : "#8a7e6e",
                        },
                      },
                      v,
                      "VP",
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 3 } },
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#8a7e6e",
                      },
                    },
                    "Control:",
                  ),
                  [
                    { val: "none", label: "—", col: "#8a7e6e" },
                    { val: "p1", label: "LOY", col: "#9b2d2d" },
                    { val: "p2", label: "TRA", col: "#2a6fb4" },
                  ].map((c) =>
                    React.createElement(
                      "button",
                      {
                        key: c.val,
                        onClick: () =>
                          updateObjective(idx, "controller", c.val),
                        style: {
                          padding: "2px 8px",
                          borderRadius: 3,
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: obj.controller === c.val ? 700 : 400,
                          background:
                            obj.controller === c.val
                              ? c.val === "p1"
                                ? "rgba(155,45,45,0.12)"
                                : c.val === "p2"
                                  ? "rgba(42,111,180,0.12)"
                                  : "#f8f4ec"
                              : "#f8f4ec",
                          border: `1px solid ${obj.controller === c.val ? c.col : "#e0d8c8"}`,
                          color: obj.controller === c.val ? c.col : "#8a7e6e",
                        },
                      },
                      c.label,
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 4 } },
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#8a7e6e",
                      },
                    },
                    "Line:",
                  ),
                  [0, 1, 2, 3].map((l) =>
                    React.createElement(
                      "button",
                      {
                        key: l,
                        onClick: () => updateObjective(idx, "line", l),
                        style: {
                          padding: "2px 6px",
                          borderRadius: 3,
                          fontSize: 11,
                          cursor: "pointer",
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: obj.line === l ? 700 : 400,
                          background:
                            obj.line === l ? "rgba(46,94,62,0.12)" : "#f8f4ec",
                          border: `1px solid ${obj.line === l ? "#2e5e3e" : "#e0d8c8"}`,
                          color: obj.line === l ? "#2e5e3e" : "#8a7e6e",
                        },
                      },
                      l === 0 ? "—" : `+${l}`,
                    ),
                  ),
                ),
              ),
            ),
            React.createElement(
              "button",
              {
                onClick: scoreRound,
                style: {
                  width: "100%",
                  padding: "12px 20px",
                  fontSize: 17,
                  fontFamily: "'Share Tech Mono', serif",
                  fontWeight: 700,
                  letterSpacing: 3,
                  background:
                    "linear-gradient(180deg, #3a7a4a 0%, #2e5e3e 100%)",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  boxShadow: "0 2px 12px rgba(46,94,62,0.3)",
                  marginTop: 12,
                },
              },
              "🏛 SCORE ROUND",
              currentRound,
            ),
          ),
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 16 } },
            React.createElement(
              "div",
              { style: { ...panelHeaderStyle } },
              React.createElement(
                "span",
                { style: { color: "#2e5e3e", fontSize: 16 } },
                "🎖",
              ),
              React.createElement(
                "span",
                { style: { color: "#2e5e3e" } },
                "SECONDARY OBJECTIVES",
              ),
            ),
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 12,
                  color: "#6a5e4e",
                  fontFamily: "'Share Tech Mono', serif",
                  marginBottom: 10,
                  fontStyle: "italic",
                },
              },
              "Set VP values per mission, then check off achieved secondaries for each player.",
            ),
            React.createElement(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: 8,
                  marginBottom: 12,
                },
              },
              [
                { id: "slayWarlord", label: "Slay the Warlord" },
                { id: "giantKiller", label: "Giant Killer" },
                { id: "firstStrike", label: "First Strike" },
                { id: "lastManStanding", label: "Last Man Standing" },
              ].map((sec) =>
                React.createElement(
                  "div",
                  { key: sec.id, style: { textAlign: "center" } },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: "#6a5e4e",
                        letterSpacing: 0.5,
                        marginBottom: 3,
                      },
                    },
                    sec.label,
                  ),
                  React.createElement("input", {
                    type: "number",
                    value: secondaryValues[sec.id],
                    min: 0,
                    max: 10,
                    onChange: (e) =>
                      setSecondaryValues((prev) => ({
                        ...prev,
                        [sec.id]: parseInt(e.target.value) || 0,
                      })),
                    style: {
                      width: 40,
                      padding: "4px",
                      textAlign: "center",
                      borderRadius: 4,
                      border: "1px solid #d0c4aa",
                      fontSize: 13,
                      fontFamily: "'Share Tech Mono', serif",
                      fontWeight: 700,
                      color: "#2e5e3e",
                    },
                  }),
                  React.createElement(
                    "div",
                    { style: { fontSize: 8, color: "#a09888" } },
                    "VP",
                  ),
                ),
              ),
            ),
            [
              {
                label: "LOYALIST",
                secondaries: p1Secondaries,
                set: setP1Secondaries,
                col: "#9b2d2d",
              },
              {
                label: "TRAITORS",
                secondaries: p2Secondaries,
                set: setP2Secondaries,
                col: "#2a6fb4",
              },
            ].map((player) =>
              React.createElement(
                "div",
                { key: player.label, style: { marginBottom: 8 } },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      fontFamily: "'Share Tech Mono', serif",
                      color: player.col,
                      letterSpacing: 1,
                      marginBottom: 4,
                    },
                  },
                  player.label,
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
                  [
                    { id: "slayWarlord", label: "Slay Warlord" },
                    { id: "giantKiller", label: "Giant Killer" },
                    { id: "firstStrike", label: "First Strike" },
                    { id: "lastManStanding", label: "Last Man" },
                  ].map((sec) => {
                    const active = player.secondaries[sec.id];
                    return React.createElement(
                      "button",
                      {
                        key: sec.id,
                        onClick: () =>
                          player.set((prev) => ({
                            ...prev,
                            [sec.id]: !prev[sec.id],
                          })),
                        style: {
                          padding: "4px 10px",
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: active ? 700 : 400,
                          background: active
                            ? `rgba(${player.col === "#9b2d2d" ? "155,45,45" : "42,111,180"},0.15)`
                            : "#f8f4ec",
                          border: `1.5px solid ${active ? player.col : "#e0d8c8"}`,
                          color: active ? player.col : "#8a7e6e",
                        },
                      },
                      active ? "✓ " : "",
                      sec.label,
                      active ? ` (+${secondaryValues[sec.id]})` : "",
                    );
                  }),
                ),
              ),
            ),
          ),
          React.createElement(
            "div",
            { style: { ...panelStyle, marginBottom: 16 } },
            React.createElement(
              "div",
              { style: { ...panelHeaderStyle } },
              React.createElement(
                "span",
                { style: { color: "#2e5e3e", fontSize: 16 } },
                "🔄",
              ),
              React.createElement(
                "span",
                { style: { color: "#2e5e3e" } },
                "STATUS RECOVERY",
              ),
            ),
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 12,
                  color: "#6a5e4e",
                  fontFamily: "'Share Tech Mono', serif",
                  marginBottom: 10,
                  fontStyle: "italic",
                },
              },
              "Units with Tactical Statuses roll 2D6 ≤ Cool/Leadership to recover before scoring.",
            ),
            React.createElement(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto auto",
                  gap: 8,
                  alignItems: "end",
                  marginBottom: 10,
                },
              },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "label",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#8a7e6e",
                      letterSpacing: 1,
                    },
                  },
                  "UNIT NAME",
                ),
                React.createElement("input", {
                  id: "statusUnitName",
                  type: "text",
                  placeholder: "e.g. Tactical Squad",
                  style: {
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 4,
                    border: "1px solid #d0c4aa",
                    fontSize: 12,
                    fontFamily: "'Share Tech Mono', serif",
                    background: "#f9f6f0",
                  },
                }),
              ),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "label",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#8a7e6e",
                      letterSpacing: 1,
                    },
                  },
                  "STAT",
                ),
                React.createElement(
                  "select",
                  {
                    id: "statusStat",
                    style: {
                      padding: "6px 8px",
                      borderRadius: 4,
                      border: "1px solid #d0c4aa",
                      fontSize: 13,
                      fontFamily: "'Share Tech Mono', serif",
                      background: "#f9f6f0",
                    },
                  },
                  React.createElement("option", { value: "Cool" }, "Cool"),
                  React.createElement("option", { value: "Ld" }, "Leadership"),
                ),
              ),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "label",
                  {
                    style: {
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#8a7e6e",
                      letterSpacing: 1,
                    },
                  },
                  "VALUE",
                ),
                React.createElement("input", {
                  id: "statusStatValue",
                  type: "number",
                  defaultValue: 8,
                  min: 1,
                  max: 14,
                  style: {
                    width: 50,
                    padding: "6px",
                    textAlign: "center",
                    borderRadius: 4,
                    border: "1px solid #d0c4aa",
                    fontSize: 12,
                    fontFamily: "'Share Tech Mono', serif",
                    background: "#f9f6f0",
                  },
                }),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    paddingBottom: 2,
                  },
                },
                React.createElement("input", {
                  id: "statusNoxVox",
                  type: "checkbox",
                  style: { accentColor: "#2e5e3e" },
                }),
                React.createElement(
                  "label",
                  {
                    htmlFor: "statusNoxVox",
                    style: {
                      fontSize: 8,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#2e5e3e",
                      letterSpacing: 0.5,
                      cursor: "pointer",
                    },
                  },
                  "📡 Nox-Vox",
                ),
              ),
              React.createElement(
                "button",
                {
                  onClick: () => {
                    const name =
                      document.getElementById("statusUnitName")?.value ||
                      "Unit";
                    const stat =
                      document.getElementById("statusStat")?.value || "Cool";
                    const val =
                      parseInt(
                        document.getElementById("statusStatValue")?.value,
                      ) || 8;
                    const hasNox =
                      document.getElementById("statusNoxVox")?.checked || false;
                    rollStatusRecovery(name, stat, val, hasNox);
                  },
                  style: {
                    padding: "6px 14px",
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Share Tech Mono', serif",
                    fontWeight: 700,
                    letterSpacing: 1,
                    background: "rgba(46,94,62,0.12)",
                    border: "1.5px solid #2e5e3e",
                    color: "#2e5e3e",
                  },
                },
                "ROLL 🎲",
              ),
            ),
            statusRecoveries
              .filter((r) => r.round === currentRound)
              .map((r, i) =>
                React.createElement(
                  "div",
                  {
                    key: i,
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: 4,
                      marginBottom: 3,
                      background: r.passed
                        ? "rgba(46,94,62,0.06)"
                        : "rgba(200,50,50,0.06)",
                      border: `1px solid ${r.passed ? "rgba(46,94,62,0.2)" : "rgba(200,50,50,0.2)"}`,
                    },
                  },
                  React.createElement(
                    "div",
                    { style: { display: "flex", gap: 2 } },
                    r.dice.map((d, j) =>
                      React.createElement(DieIcon, {
                        key: j,
                        value: d,
                        success: r.passed,
                        small: true,
                      }),
                    ),
                  ),
                  React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 11,
                        fontFamily: "'Share Tech Mono', serif",
                        color: r.passed ? "#2e5e3e" : "#c74040",
                      },
                    },
                    r.unitName,
                    "—",
                    r.stat,
                    r.statValue,
                    r.hasNox ? " [Nox-Vox +1]" : "",
                    ": rolled",
                    r.total,
                    "→",
                    r.passed ? "RECOVERED ✓" : "STILL AFFLICTED ✗",
                  ),
                ),
              ),
          ),
          vpLog.length > 0 &&
            React.createElement(
              "div",
              { style: { ...panelStyle, marginBottom: 16 } },
              React.createElement(
                "div",
                { style: { ...panelHeaderStyle } },
                React.createElement(
                  "span",
                  { style: { color: "#2e5e3e", fontSize: 16 } },
                  "📜",
                ),
                React.createElement(
                  "span",
                  { style: { color: "#2e5e3e" } },
                  "VP HISTORY",
                ),
              ),
              vpLog.map((entry, i) =>
                React.createElement(
                  "div",
                  {
                    key: i,
                    style: {
                      padding: "8px 12px",
                      borderRadius: 6,
                      marginBottom: 4,
                      background: "rgba(46,94,62,0.03)",
                      border: "1px solid rgba(46,94,62,0.1)",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      },
                    },
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 700,
                          fontSize: 12,
                          color: "#2e5e3e",
                        },
                      },
                      "ROUND",
                      entry.round,
                    ),
                    React.createElement(
                      "div",
                      { style: { display: "flex", gap: 16 } },
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#9b2d2d",
                          },
                        },
                        "P1: +",
                        entry.p1,
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            fontFamily: "'Share Tech Mono', serif",
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#2a6fb4",
                          },
                        },
                        "P2: +",
                        entry.p2,
                      ),
                    ),
                  ),
                  entry.log.map((l, j) =>
                    React.createElement(
                      "div",
                      {
                        key: j,
                        style: {
                          fontSize: 12,
                          color: "#6a5e4e",
                          fontFamily: "'Share Tech Mono', serif",
                          paddingLeft: 8,
                        },
                      },
                      "•",
                      l,
                    ),
                  ),
                ),
              ),
              React.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    padding: "12px 16px",
                    borderRadius: 8,
                    textAlign: "center",
                    background: "rgba(46,94,62,0.06)",
                    border: "2px solid #2e5e3e",
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      fontFamily: "'Share Tech Mono', serif",
                      color: "#2e5e3e",
                      letterSpacing: 2,
                      marginBottom: 6,
                    },
                  },
                  "GRAND TOTAL (Primary + Secondary)",
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      justifyContent: "center",
                      gap: 40,
                    },
                  },
                  React.createElement(
                    "div",
                    null,
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 900,
                          fontSize: 28,
                          color: "#9b2d2d",
                        },
                      },
                      p1TotalVP + calcSecondaryVP(p1Secondaries),
                    ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 11,
                          color: "#9b2d2d",
                          fontFamily: "'Share Tech Mono', serif",
                        },
                      },
                      "LOYALIST",
                    ),
                  ),
                  React.createElement(
                    "div",
                    null,
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontFamily: "'Share Tech Mono', serif",
                          fontWeight: 900,
                          fontSize: 28,
                          color: "#2a6fb4",
                        },
                      },
                      p2TotalVP + calcSecondaryVP(p2Secondaries),
                    ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 11,
                          color: "#2a6fb4",
                          fontFamily: "'Share Tech Mono', serif",
                        },
                      },
                      "TRAITORS",
                    ),
                  ),
                ),
              ),
            ),
        ),
      React.createElement(
        "div",
        {
          style: {
            textAlign: "center",
            marginTop: 24,
            padding: 16,
            color: "#a09888",
            fontSize: 13,
            fontFamily: "'Share Tech Mono', serif",
          },
        },
        "Rules Reference: Warhammer — The Horus Heresy: Age of Darkness Rulebook (3rd Edition)",
        React.createElement("br", null),
        "All dice rolls are simulated. Use for quick resolution and statistical analysis.",
        React.createElement("br", null),
        "Version 1.74 — Artwork Thumbnails, Warlord Split, Army Phase Fixes",
      ),
    ),
  );
};

function StatBox({ label, value, color }) {
  return React.createElement(
    "div",
    { style: { textAlign: "center" } },
    React.createElement(
      "div",
      {
        style: {
          fontSize: 13,
          color: "#5a4e3e",
          fontFamily: "'Share Tech Mono', serif",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 2,
        },
      },
      label,
    ),
    React.createElement(
      "div",
      {
        style: {
          fontSize: 22,
          color,
          fontFamily: "'Share Tech Mono', serif",
          fontWeight: 700,
        },
      },
      value,
    ),
  );
}

function MiniStat({ label, value, color = "#2a2418" }) {
  return React.createElement(
    "div",
    {
      style: {
        padding: "6px 12px",
        background: "#ede8df",
        borderRadius: 6,
        textAlign: "center",
        minWidth: 44,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          fontSize: 12,
          color: "#6a5e4e",
          fontFamily: "'Share Tech Mono', serif",
          letterSpacing: 1,
          textTransform: "uppercase",
        },
      },
      label,
    ),
    React.createElement(
      "div",
      {
        style: {
          fontSize: 17,
          color,
          fontWeight: 700,
          fontFamily: "'Share Tech Mono', serif",
          lineHeight: 1.1,
        },
      },
      value,
    ),
  );
}

var panelStyle = {
  background: "#faf7f2",
  border: "1.5px solid #c8b898",
  borderRadius: 10,
  padding: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
};

var panelHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 13,
  fontFamily: "'Share Tech Mono', serif",
  fontWeight: 700,
  color: "#4a3e2e",
  letterSpacing: 2,
  textTransform: "uppercase",
  marginBottom: 16,
  paddingBottom: 10,
  borderBottom: "1px solid #d8cdb8",
};

var refCellStyle = {
  padding: "5px 6px",
  textAlign: "center",
  fontFamily: "'Share Tech Mono', serif",
  fontSize: 12,
};
