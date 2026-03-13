(function() {
const { BS_TO_HIT, CRITICAL_HIT_THRESHOLD, getWoundRoll, rollD6, rollD6s, WEAPON_TYPES, SPECIAL_RULES, UNIT_PRESETS, UNIT_FOC_SLOT, getLegionWargearOptions, getWargearOptions, EQUIPMENT_OPTIONS, UNIT_EQUIPMENT_ACCESS, canTakeEquipment, POINTS_DATA, WEAPON_UPGRADE_COSTS, LEGION_WEAPON_PROFILES, getRangedWeapons, MELEE_getRangedWeapons, UNIT_WARGEAR_OPTIONS, BATTLEFIELD_ROLES, UNIT_BATTLEFIELD_ROLE, CRUSADE_PRIMARY, ADDITIONAL_DETACHMENTS, ALLIED_FACTION_CATEGORIES, AUXILIARY_DETACHMENTS, APEX_DETACHMENTS, PRIME_ADVANTAGES, ALLEGIANCE_PRIME_ADVANTAGES, LEGION_PRIME_ADVANTAGES, LEGION_DETACHMENTS, LOGISTICAL_EXCLUDED_ROLES, ALLEGIANCE_UNITS, LEGION_FACTIONS, MAX_UNIT_SIZE, formatWargear, calcArmyEntryPoints, getUnitsForRole, calcUnitPoints, WEAPON_PROFILES, SERGEANT_WEAPONS, SERGEANT_MELEE_WEAPONS, getSgtCategory } = window.HH;

window.HH = window.HH || {};



function resolveShootingPhase(params) {
  const {
    numModels, numShots, bs, strength, ap, toughness,
    armourSave, invulnSave, coverSave, fnp,
    specialRules, halfRange, moved, indirect, weaponType,
    leadership, targetModels,
    sgtEnabled, sgtWeapon,
    hasVexilla, hasNoxVox,
    snapShots, // Manual snap shots toggle
  } = params;

  const log = [];
  const rolls = { hit: [], wound: [], save: [], fnpRolls: [] };
  let getsHotWounds = 0;
  let precisionHits = 0;
  let deflagrateHits = 0;
  let criticalHitWounds = 0;

  // ━━ STEP 0: Calculate total shots ━━
  const hasSgt = sgtEnabled && sgtWeapon;
  const squadModels = hasSgt ? Math.max(numModels - 1, 0) : numModels;
  let totalShots = squadModels * numShots;
  
  if (hasSgt) {
    log.push({ phase: "Setup", text: `${squadModels} squad model(s) firing ${numShots} shot(s) each + 1 Sergeant with ${sgtWeapon.name}` });
  } else {
    log.push({ phase: "Setup", text: `${numModels} model(s) firing ${numShots} shot(s) each = ${totalShots} total shots` });
  }

  // Rapid Fire at half range doubles shots
  if (weaponType === "Rapid Fire" && halfRange) {
    totalShots = squadModels * numShots * 2;
    log.push({ phase: "Setup", text: `Rapid Fire at half range: doubled to ${totalShots} shots` });
  }

  // ━━ STEP 1: Roll to Hit ━━
  let toHitNeeded = BS_TO_HIT[bs] || 6;
  log.push({ phase: "To Hit", text: `BS ${bs} → needs ${toHitNeeded}+ to hit` });

  // Modifiers
  let hitMods = [];
  // Helper: 3rd Edition Snap Shot threshold based on BS
  const getSnapThreshold = (bsVal) => {
    if (bsVal <= 3) return 6;
    if (bsVal <= 5) return 5;
    if (bsVal <= 7) return 4;
    return 3;
  };

  let snapShooting = false;

  // Manual Snap Shots toggle (e.g. firing at Flyers, reacting, etc.)
  if (snapShots) {
    snapShooting = true;
    toHitNeeded = getSnapThreshold(bs);
    hitMods.push(`Snap Shots: hits on ${toHitNeeded}+ (BS${bs} snap fire)`);
  }
  // Snap Shots for Heavy weapons that moved - 3rd edition: scales with BS
  if (!snapShooting && weaponType === "Heavy" && moved) {
    snapShooting = true;
    toHitNeeded = getSnapThreshold(bs);
    hitMods.push(`Snap Shots (moved with Heavy weapon): hits on ${toHitNeeded}+ (scales with BS)`);
  }
  // Barrage indirect fire
  if (!snapShooting && weaponType === "Barrage" && indirect) {
    snapShooting = true;
    toHitNeeded = getSnapThreshold(bs);
    hitMods.push(`Barrage (Indirect Fire): firing without LoS, hits on ${toHitNeeded}+`);
  }
  // Barrage moved (Ordnance-type, cannot fire if moved unless specified)
  if (!snapShooting && weaponType === "Barrage" && moved && !indirect) {
    snapShooting = true;
    toHitNeeded = getSnapThreshold(bs);
    hitMods.push(`Snap Shots (moved with Barrage weapon): hits on ${toHitNeeded}+`);
  }
  if (hitMods.length > 0) {
    log.push({ phase: "To Hit", text: `Modifiers: ${hitMods.join(", ")}` });
  }
  // Barrage inherently has Pinning
  if (weaponType === "Barrage") {
    log.push({ phase: "Setup", text: `Barrage: weapon has inherent Pinning` });
  }

  let hitRolls = rollD6s(totalShots);
  rolls.hit = hitRolls.map(r => ({ value: r, success: r >= toHitNeeded }));

  // 3rd Edition Critical Hits - BS6+ can score critical hits that auto-wound
  let criticalHits = 0;
  if (bs >= 6 && !snapShooting && CRITICAL_HIT_THRESHOLD[bs]) {
    const critThreshold = CRITICAL_HIT_THRESHOLD[bs];
    criticalHits = hitRolls.filter(r => r >= critThreshold).length;
    if (criticalHits > 0) {
      log.push({ phase: "To Hit", text: `⚡ Critical Hits (BS${bs}): ${criticalHits} roll(s) of ${critThreshold}+ auto-wound and bypass wound roll!` });
    }
  }

  // Gets Hot check
  if (specialRules.getshot) {
    const onesCount = hitRolls.filter(r => r === 1).length;
    if (onesCount > 0) {
      getsHotWounds = onesCount;
      log.push({ phase: "To Hit", text: `⚠ Gets Hot! ${onesCount} roll(s) of 1 → ${onesCount} wound(s) on the firing unit!` });
    }
  }

  let hits = hitRolls.filter(r => r >= toHitNeeded).length;

  // Precision Shots
  if (specialRules.precision && !snapShooting) {
    precisionHits = hitRolls.filter(r => r === 6).length;
    if (precisionHits > 0) {
      log.push({ phase: "To Hit", text: `🎯 Precision Shots: ${precisionHits} hit(s) rolled 6 → can be allocated by shooter` });
    }
  }

  // Twin-linked re-rolls
  let rerollHits = 0;
  if (specialRules.twinLinked) {
    const misses = hitRolls.filter(r => r < toHitNeeded);
    const rerolls = rollD6s(misses.length);
    rerollHits = rerolls.filter(r => r >= toHitNeeded).length;
    hits += rerollHits;
    rolls.hit.push(...rerolls.map(r => ({ value: r, success: r >= toHitNeeded, reroll: true })));
    log.push({ phase: "To Hit", text: `Twin-linked: re-rolled ${misses.length} miss(es) → ${rerollHits} additional hit(s)` });
  }

  log.push({ phase: "To Hit", text: `Result: ${hits} hit(s) from ${totalShots} shot(s)` });

  if (hits === 0) {
    log.push({ phase: "Result", text: "No hits scored. Shooting resolved." });
    return { log, rolls, casualties: 0, getsHotWounds, precisionHits, totalShots, hits, wounds: 0, unsaved: 0, deflagrateHits: 0, criticalHitWounds: 0, statusEffects: [], ldRolls: [] };
  }

  // ━━ STEP 2: Roll to Wound ━━
  let toWoundNeeded;
  let poisonedValue = null;

  if (specialRules.fleshbane) {
    toWoundNeeded = 2;
    log.push({ phase: "To Wound", text: `Fleshbane: always wounds on 2+` });
  } else if (specialRules.poisoned) {
    poisonedValue = 4;
    toWoundNeeded = 4;
    log.push({ phase: "To Wound", text: `Poisoned (4+): wounds on 4+ (S${strength} vs T${toughness})` });
  } else if (specialRules.poisoned3) {
    poisonedValue = 3;
    toWoundNeeded = 3;
    log.push({ phase: "To Wound", text: `Poisoned (3+): wounds on 3+ (S${strength} vs T${toughness})` });
  } else if (specialRules.poisoned2) {
    poisonedValue = 2;
    toWoundNeeded = 2;
    log.push({ phase: "To Wound", text: `Poisoned (2+): wounds on 2+ (S${strength} vs T${toughness})` });
  } else {
    toWoundNeeded = getWoundRoll(strength, toughness);
    if (toWoundNeeded === null) {
      log.push({ phase: "To Wound", text: `S${strength} vs T${toughness}: Cannot wound! (would need 7+)` });
      log.push({ phase: "Result", text: "No wounds possible. Shooting resolved." });
      return { log, rolls, casualties: 0, getsHotWounds, precisionHits, totalShots, hits, wounds: 0, unsaved: 0, deflagrateHits: 0, criticalHitWounds: 0, statusEffects: [], ldRolls: [] };
    }
    log.push({ phase: "To Wound", text: `S${strength} vs T${toughness} → needs ${toWoundNeeded}+ to wound` });
  }

  // 3rd Edition: Critical hits auto-wound, only roll for regular hits
  let regularHitsToWound = hits - criticalHits;
  criticalHitWounds = criticalHits;
  
  let woundRolls = regularHitsToWound > 0 ? rollD6s(regularHitsToWound) : [];
  let wounds = criticalHits; // Start with auto-wounds from critical hits
  let rendingWounds = 0;
  let breachingWounds = 0;
  let normalWounds = 0;
  let criticalWounds = criticalHits;

  // Track each wound roll
  const woundResults = woundRolls.map(r => {
    const success = r >= toWoundNeeded;
    let rending = false;
    let breaching = false;

    if (success) {
      if (specialRules.rending && r === 6) {
        rending = true;
        rendingWounds++;
      } else if ((specialRules.breaching3 && r >= 3) || (specialRules.breaching && r >= 4) || (specialRules.breaching5 && r >= 5) || (specialRules.breaching6 && r === 6)) {
        breaching = true;
        breachingWounds++;
      } else {
        normalWounds++;
      }
    }

    return { value: r, success, rending, breaching };
  });

  wounds = woundResults.filter(r => r.success).length;
  rolls.wound = woundResults;

  // Shred re-rolls
  let rerollWounds = 0;
  if (specialRules.shred && regularHitsToWound > 0) {
    const woundMisses = woundResults.filter(r => !r.success);
    const rerolls = rollD6s(woundMisses.length);
    rerolls.forEach(r => {
      const success = r >= toWoundNeeded;
      if (success) {
        rerollWounds++;
        wounds++;
        if (specialRules.rending && r === 6) rendingWounds++;
        else if ((specialRules.breaching3 && r >= 3) || (specialRules.breaching && r >= 4) || (specialRules.breaching5 && r >= 5) || (specialRules.breaching6 && r === 6)) breachingWounds++;
        else normalWounds++;
      }
      rolls.wound.push({ value: r, success, reroll: true });
    });
    log.push({ phase: "To Wound", text: `Shred: re-rolled ${woundMisses.length} failed wound(s) → ${rerollWounds} additional wound(s)` });
  }

  // Poisoned re-rolls (if S >= T)
  if (poisonedValue && strength >= toughness && regularHitsToWound > 0) {
    const woundMisses = woundResults.filter(r => !r.success);
    const rerolls = rollD6s(woundMisses.length);
    let poisonRerolls = 0;
    rerolls.forEach(r => {
      if (r >= poisonedValue) { poisonRerolls++; wounds++; normalWounds++; }
      rolls.wound.push({ value: r, success: r >= poisonedValue, reroll: true });
    });
    if (poisonRerolls > 0) {
      log.push({ phase: "To Wound", text: `Poison re-roll (S≥T): ${poisonRerolls} additional wound(s)` });
    }
  }

  if (specialRules.rending && rendingWounds > 0) {
    log.push({ phase: "To Wound", text: `🗡 Rending: ${rendingWounds} wound(s) at AP2 (rolled 6)` });
    normalWounds = wounds - rendingWounds - breachingWounds;
  }
  if (breachingWounds > 0) {
    const bLabel = specialRules.breaching3 ? "3+" : specialRules.breaching ? "4+" : specialRules.breaching5 ? "5+" : "6+";
    log.push({ phase: "To Wound", text: `💥 Breaching (${bLabel}): ${breachingWounds} wound(s) at AP2` });
    normalWounds = wounds - rendingWounds - breachingWounds;
  }

  log.push({ phase: "To Wound", text: `Result: ${wounds} wound(s) from ${hits} hit(s)` });

  if (wounds === 0) {
    log.push({ phase: "Result", text: "No wounds scored. Shooting resolved." });
    return { log, rolls, casualties: 0, getsHotWounds, precisionHits, totalShots, hits, wounds, unsaved: 0, deflagrateHits: 0, statusEffects: [], ldRolls: [] };
  }

  // ━━ STEP 3: Saving Throws ━━
  // Determine effective save for each wound type
  let unsavedWounds = 0;

  function resolveSaves(count, effectiveAP, label) {
    if (count === 0) return 0;

    // Determine best save
    let bestSave = null;
    let saveType = "";

    // Armour save (negated if AP <= save value)
    const armourNegated = effectiveAP !== "-" && effectiveAP !== null && parseInt(effectiveAP) <= parseInt(armourSave);
    if (!armourNegated && armourSave && armourSave !== "-" && armourSave !== "0") {
      bestSave = parseInt(armourSave);
      saveType = `${armourSave}+ Armour`;
    }

    // Cover save (if not ignoring cover)
    if (!specialRules.ignoresCover && coverSave && coverSave !== "-" && coverSave !== "0") {
      const cv = parseInt(coverSave);
      if (bestSave === null || cv < bestSave) {
        bestSave = cv;
        saveType = `${cv}+ Cover`;
      }
    }

    // Invulnerable save (never negated by AP)
    if (invulnSave && invulnSave !== "-" && invulnSave !== "0") {
      const iv = parseInt(invulnSave);
      if (bestSave === null || iv < bestSave) {
        bestSave = iv;
        saveType = `${iv}+ Invulnerable`;
      }
    }

    if (bestSave === null) {
      log.push({ phase: "Saves", text: `${label}: ${count} wound(s) — No save available! All wounds unsaved.` });
      return count;
    }

    log.push({ phase: "Saves", text: `${label}: ${count} wound(s) — saving on ${saveType} (AP ${effectiveAP || "-"})` });

    const saveRolls = rollD6s(count);
    const saved = saveRolls.filter(r => r >= bestSave).length;
    const unsaved = count - saved;
    rolls.save.push(...saveRolls.map(r => ({ value: r, success: r >= bestSave, needed: bestSave })));
    log.push({ phase: "Saves", text: `  Rolled: [${saveRolls.join(", ")}] → ${saved} saved, ${unsaved} unsaved` });
    return unsaved;
  }

  // Normal wounds at weapon AP
  normalWounds = wounds - rendingWounds - breachingWounds;
  unsavedWounds += resolveSaves(normalWounds, ap, "Normal wounds");

  // Rending wounds at AP2
  if (rendingWounds > 0) {
    unsavedWounds += resolveSaves(rendingWounds, "2", "Rending wounds (AP2)");
  }

  // Breaching wounds at AP2
  if (breachingWounds > 0) {
    unsavedWounds += resolveSaves(breachingWounds, "2", "Breaching wounds (AP2)");
  }

  log.push({ phase: "Saves", text: `Result: ${unsavedWounds} unsaved wound(s)` });

  if (unsavedWounds === 0) {
    log.push({ phase: "Result", text: "All wounds saved. No casualties." });
    return { log, rolls, casualties: 0, getsHotWounds, precisionHits, totalShots, hits, wounds, unsaved: 0, deflagrateHits: 0, statusEffects: [], ldRolls: [] };
  }

  // ━━ STEP 4: Feel No Pain ━━
  let casualties = unsavedWounds;
  if (fnp && fnp !== "-" && fnp !== "0") {
    const fnpNeeded = parseInt(fnp);
    // FNP doesn't work against Instant Death (S >= 2x Toughness) or AP1/AP2 in some editions
    // In HH 3rd ed, FNP works against everything except Instant Death and Destroyer
    const instantDeath = strength >= toughness * 2; // 3rd Ed: No "Instant Death" rule, just high damage
    if (instantDeath) {
      log.push({ phase: "FNP", text: `Instant Death — Feel No Pain cannot be used!` });
    } else {
      log.push({ phase: "FNP", text: `Feel No Pain (${fnpNeeded}+): rolling for ${unsavedWounds} unsaved wound(s)` });
      const fnpRolls = rollD6s(unsavedWounds);
      const fnpSaved = fnpRolls.filter(r => r >= fnpNeeded).length;
      casualties = unsavedWounds - fnpSaved;
      rolls.fnpRolls = fnpRolls.map(r => ({ value: r, success: r >= fnpNeeded }));
      log.push({ phase: "FNP", text: `Rolled: [${fnpRolls.join(", ")}] → ${fnpSaved} saved, ${casualties} casualties` });
    }
  }

  // ━━ STEP 5: Deflagrate ━━
  if (specialRules.deflagrate && casualties > 0) {
    deflagrateHits = casualties;
    log.push({ phase: "Special", text: `🔥 Deflagrate: ${casualties} unsaved wound(s) generate ${casualties} additional automatic hit(s)!` });
    log.push({ phase: "Special", text: `(Resolve Deflagrate hits separately with the same weapon profile)` });
  }

  // ━━ STEP 5b: Sergeant's Weapon ━━
  let sgtHits = 0, sgtWounds = 0, sgtUnsaved = 0, sgtCasualties = 0;
  if (hasSgt) {
    log.push({ phase: "Sergeant", text: `⚔ Sergeant fires ${sgtWeapon.name} (${sgtWeapon.type} ${sgtWeapon.shots}, S${sgtWeapon.s} AP${sgtWeapon.ap} D${sgtWeapon.damage || 1})` });
    
    // Sergeant shots
    let sgtTotalShots = sgtWeapon.shots;
    if (sgtWeapon.type === "Rapid Fire" && halfRange) {
      sgtTotalShots *= 2;
      log.push({ phase: "Sergeant", text: `  Rapid Fire half range: ${sgtTotalShots} shots` });
    }
    
    // Sergeant To Hit (same BS as squad)
    let sgtHitNeeded = BS_TO_HIT[bs] || 6;
    let sgtSnapShooting = false;
    if (sgtWeapon.type === "Heavy" && moved) {
      sgtSnapShooting = true;
      if (bs <= 3) sgtHitNeeded = 6;
      else if (bs <= 5) sgtHitNeeded = 5;
      else if (bs <= 7) sgtHitNeeded = 4;
      else sgtHitNeeded = 3;
    }
    if (sgtWeapon.type === "Pistol" && moved) {
      // Pistols can fire normally even if moved
    }
    
    const sgtHitRolls = rollD6s(sgtTotalShots);
    rolls.hit.push(...sgtHitRolls.map(r => ({ value: r, success: r >= sgtHitNeeded, sergeant: true })));
    
    // Gets Hot for sergeant
    if (sgtWeapon.rules?.getshot) {
      const sgtOnes = sgtHitRolls.filter(r => r === 1).length;
      if (sgtOnes > 0) {
        getsHotWounds += sgtOnes;
        log.push({ phase: "Sergeant", text: `  ⚠ Gets Hot! ${sgtOnes} roll(s) of 1 → wound(s) on sergeant!` });
      }
    }
    
    sgtHits = sgtHitRolls.filter(r => r >= sgtHitNeeded).length;
    
    // Twin-linked for sgt
    if (sgtWeapon.rules?.twinLinked) {
      const sgtMisses = sgtHitRolls.filter(r => r < sgtHitNeeded);
      const sgtRerolls = rollD6s(sgtMisses.length);
      const sgtRerollHits = sgtRerolls.filter(r => r >= sgtHitNeeded).length;
      sgtHits += sgtRerollHits;
      rolls.hit.push(...sgtRerolls.map(r => ({ value: r, success: r >= sgtHitNeeded, reroll: true, sergeant: true })));
      if (sgtRerollHits > 0) log.push({ phase: "Sergeant", text: `  Twin-linked: +${sgtRerollHits} hit(s)` });
    }
    
    log.push({ phase: "Sergeant", text: `  To Hit: ${sgtHits} hit(s) from ${sgtTotalShots} shot(s) (needs ${sgtHitNeeded}+)` });
    
    if (sgtHits > 0) {
      // Sergeant To Wound
      const sgtS = sgtWeapon.s;
      let sgtWoundNeeded;
      if (sgtWeapon.rules?.fleshbane) sgtWoundNeeded = 2;
      else if (sgtWeapon.rules?.poisoned) sgtWoundNeeded = 4;
      else if (sgtWeapon.rules?.poisoned3) sgtWoundNeeded = 3;
      else if (sgtWeapon.rules?.poisoned2) sgtWoundNeeded = 2;
      else sgtWoundNeeded = getWoundRoll(sgtS, toughness);
      
      if (sgtWoundNeeded === null) {
        log.push({ phase: "Sergeant", text: `  S${sgtS} vs T${toughness}: Cannot wound!` });
      } else {
        const sgtWoundRolls = rollD6s(sgtHits);
        let sgtRendingW = 0, sgtBreachingW = 0, sgtNormalW = 0;
        
        sgtWoundRolls.forEach(r => {
          const success = r >= sgtWoundNeeded;
          if (success) {
            sgtWounds++;
            if (sgtWeapon.rules?.rending && r === 6) sgtRendingW++;
            else if ((sgtWeapon.rules?.breaching && r >= 4) || (sgtWeapon.rules?.breaching5 && r >= 5) || (sgtWeapon.rules?.breaching6 && r === 6)) sgtBreachingW++;
            else sgtNormalW++;
          }
          rolls.wound.push({ value: r, success, sergeant: true });
        });
        
        // Shred re-rolls for sgt
        if (sgtWeapon.rules?.shred) {
          const sgtMisses = sgtWoundRolls.filter(r => r < sgtWoundNeeded);
          const sgtRerolls = rollD6s(sgtMisses.length);
          sgtRerolls.forEach(r => {
            if (r >= sgtWoundNeeded) { sgtWounds++; sgtNormalW++; }
            rolls.wound.push({ value: r, success: r >= sgtWoundNeeded, reroll: true, sergeant: true });
          });
        }
        
        if (sgtRendingW > 0) log.push({ phase: "Sergeant", text: `  🗡 Rending: ${sgtRendingW} wound(s) at AP2` });
        if (sgtBreachingW > 0) log.push({ phase: "Sergeant", text: `  💥 Breaching: ${sgtBreachingW} wound(s) at AP2` });
        log.push({ phase: "Sergeant", text: `  To Wound: ${sgtWounds} wound(s) (needs ${sgtWoundNeeded}+)` });
        
        if (sgtWounds > 0) {
          // Sergeant saves — same target
          const sgtAP = sgtWeapon.ap;
          
          function sgtResolveSaves(count, effAP, label) {
            if (count === 0) return 0;
            let bestSave = null;
            let saveType = "";
            const armNeg = effAP !== "-" && effAP !== null && parseInt(effAP) <= parseInt(armourSave);
            if (!armNeg && armourSave && armourSave !== "-" && armourSave !== "0") { bestSave = parseInt(armourSave); saveType = `${armourSave}+ Armour`; }
            if (!(sgtWeapon.rules?.ignoresCover) && coverSave && coverSave !== "-" && coverSave !== "0") { const cv = parseInt(coverSave); if (bestSave === null || cv < bestSave) { bestSave = cv; saveType = `${cv}+ Cover`; } }
            if (invulnSave && invulnSave !== "-" && invulnSave !== "0") { const iv = parseInt(invulnSave); if (bestSave === null || iv < bestSave) { bestSave = iv; saveType = `${iv}+ Invulnerable`; } }
            if (bestSave === null) { log.push({ phase: "Sergeant", text: `  ${label}: ${count} wound(s) — No save!` }); return count; }
            const sRolls = rollD6s(count);
            const saved = sRolls.filter(r => r >= bestSave).length;
            rolls.save.push(...sRolls.map(r => ({ value: r, success: r >= bestSave, needed: bestSave, sergeant: true })));
            log.push({ phase: "Sergeant", text: `  ${label}: [${sRolls.join(",")}] → ${saved} saved, ${count - saved} unsaved (${saveType}, AP${effAP})` });
            return count - saved;
          }
          
          sgtNormalW = sgtWounds - sgtRendingW - sgtBreachingW;
          sgtUnsaved += sgtResolveSaves(sgtNormalW, sgtAP, "Normal");
          if (sgtRendingW > 0) sgtUnsaved += sgtResolveSaves(sgtRendingW, "2", "Rending (AP2)");
          if (sgtBreachingW > 0) sgtUnsaved += sgtResolveSaves(sgtBreachingW, "2", "Breaching (AP2)");
          
          // FNP for sgt wounds
          sgtCasualties = sgtUnsaved;
          if (fnp && fnp !== "-" && fnp !== "0") {
            const fnpN = parseInt(fnp);
            const sgtInstantDeath = sgtS >= toughness * 2;
            if (!sgtInstantDeath) {
              const sgtFnpRolls = rollD6s(sgtUnsaved);
              const sgtFnpSaved = sgtFnpRolls.filter(r => r >= fnpN).length;
              sgtCasualties = sgtUnsaved - sgtFnpSaved;
              rolls.fnpRolls.push(...sgtFnpRolls.map(r => ({ value: r, success: r >= fnpN, sergeant: true })));
              if (sgtFnpSaved > 0) log.push({ phase: "Sergeant", text: `  FNP: ${sgtFnpSaved} saved → ${sgtCasualties} casualties` });
            }
          }
          
          // Deflagrate from sergeant
          if (sgtWeapon.rules?.deflagrate && sgtCasualties > 0) {
            deflagrateHits += sgtCasualties;
            log.push({ phase: "Sergeant", text: `  🔥 Deflagrate: +${sgtCasualties} auto-hit(s)` });
          }
        }
      }
    }
    
    log.push({ phase: "Sergeant", text: `Sergeant result: ${sgtCasualties} casualt${sgtCasualties === 1 ? "y" : "ies"}` });
    
    // Accumulate into totals
    hits += sgtHits;
    wounds += sgtWounds;
    unsavedWounds += sgtUnsaved;
    casualties += sgtCasualties;
    totalShots += hasSgt ? (sgtWeapon.type === "Rapid Fire" && halfRange ? sgtWeapon.shots * 2 : sgtWeapon.shots) : 0;
  }

  // ━━ FINAL RESULT ━━
  log.push({ phase: "Result", text: `Final: ${casualties} casualt${casualties === 1 ? 'y' : 'ies'} inflicted${hasSgt ? ` (squad: ${casualties - sgtCasualties}, sergeant: ${sgtCasualties})` : ""}` });
  if (specialRules.instant || strength >= toughness * 2) {
    log.push({ phase: "Result", text: `☠ Instant Death: Each unsaved wound removes a model regardless of remaining wounds` });
  }

  // ━━ STEP 6: Leadership & Status Checks ━━
  const statusEffects = [];
  const ldRolls = [];
  const effectiveLd = leadership || 8;
  const ldMod = (specialRules.shellShock ? -1 : 0) + (hasNoxVox ? 1 : 0);
  const modLd = Math.max(effectiveLd + ldMod, 2);
  const ldModDesc = [];
  if (specialRules.shellShock) ldModDesc.push("Shell Shock -1");
  if (hasNoxVox) ldModDesc.push("Nox-Vox +1");

  // Pinning Test (from Pinning rule or Barrage)
  if ((specialRules.pinning || weaponType === "Barrage") && casualties > 0) {
    const pinRoll = rollD6s(2);
    const pinTotal = pinRoll[0] + pinRoll[1];
    const pinPassed = pinTotal <= modLd;
    ldRolls.push({ type: "Pinning", roll: pinRoll, total: pinTotal, needed: modLd, passed: pinPassed });
    log.push({ phase: "Checks", text: `📌 Pinning Test (Ld${modLd}${ldModDesc.length ? ` [${effectiveLd}${ldModDesc.join(",")}]` : ""}): rolled ${pinRoll.join("+")}=${pinTotal} → ${pinPassed ? "PASSED" : "FAILED — unit is Pinned!"}` });
    if (!pinPassed) statusEffects.push("Pinned");
  }

  // Suppressive Check (from hits, not wounds) — Cool check
  if (specialRules.suppressive && hits > 0) {
    const supRoll = rollD6s(2);
    const supTotal = supRoll[0] + supRoll[1];
    const supPassed = supTotal <= modLd;
    ldRolls.push({ type: "Suppressive", roll: supRoll, total: supTotal, needed: modLd, passed: supPassed });
    log.push({ phase: "Checks", text: `🔻 Suppressive (Ld${modLd}${hasNoxVox ? " [Nox-Vox +1]" : ""}): rolled ${supRoll.join("+")}=${supTotal} → ${supPassed ? "PASSED" : "FAILED — unit is Suppressed!"}` });
    if (!supPassed) statusEffects.push("Suppressed");
  }

  // Stun Check (from hits) — Cool check
  if (specialRules.stun && hits > 0) {
    const stunRoll = rollD6s(2);
    const stunTotal = stunRoll[0] + stunRoll[1];
    const stunPassed = stunTotal <= modLd;
    ldRolls.push({ type: "Stun", roll: stunRoll, total: stunTotal, needed: modLd, passed: stunPassed });
    log.push({ phase: "Checks", text: `⚡ Stun (Ld${modLd}${hasNoxVox ? " [Nox-Vox +1]" : ""}): rolled ${stunRoll.join("+")}=${stunTotal} → ${stunPassed ? "PASSED" : "FAILED — unit is Stunned!"}` });
    if (!stunPassed) statusEffects.push("Stunned");
  }

  // Panic Check (from wounds) — Cool check
  if (specialRules.panic && casualties > 0) {
    const panicRoll = rollD6s(2);
    const panicTotal = panicRoll[0] + panicRoll[1];
    const panicPassed = panicTotal <= modLd;
    ldRolls.push({ type: "Panic", roll: panicRoll, total: panicTotal, needed: modLd, passed: panicPassed });
    log.push({ phase: "Checks", text: `😱 Panic (Ld${modLd}${hasNoxVox ? " [Nox-Vox +1]" : ""}): rolled ${panicRoll.join("+")}=${panicTotal} → ${panicPassed ? "PASSED" : "FAILED — unit Panics and Falls Back!"}` });
    if (!panicPassed) statusEffects.push("Panicked");
  }

  // Morale / Rout Check (25%+ casualties in a single phase)
  if (targetModels > 0 && casualties > 0) {
    const casualtyPercent = casualties / targetModels;
    if (casualtyPercent >= 0.25) {
      const moraleRoll = rollD6s(2);
      const moraleTotal = moraleRoll[0] + moraleRoll[1];
      let moralePassed = moraleTotal <= modLd;
      
      // Vexilla: re-roll failed Morale checks
      if (!moralePassed && hasVexilla) {
        const reroll = rollD6s(2);
        const rerollTotal = reroll[0] + reroll[1];
        const rerollPassed = rerollTotal <= modLd;
        log.push({ phase: "Checks", text: `🏳 Morale Check (25%+ casualties: ${casualties}/${targetModels}, Ld${modLd}): rolled ${moraleRoll.join("+")}=${moraleTotal} → FAILED` });
        log.push({ phase: "Checks", text: `⚑ Vexilla: re-rolling Morale → rolled ${reroll.join("+")}=${rerollTotal} → ${rerollPassed ? "PASSED — unit holds!" : "FAILED — unit Falls Back!"}` });
        ldRolls.push({ type: "Morale", roll: moraleRoll, total: moraleTotal, needed: modLd, passed: false });
        ldRolls.push({ type: "Morale (Vexilla Re-roll)", roll: reroll, total: rerollTotal, needed: modLd, passed: rerollPassed });
        moralePassed = rerollPassed;
      } else {
        ldRolls.push({ type: "Morale", roll: moraleRoll, total: moraleTotal, needed: modLd, passed: moralePassed });
        log.push({ phase: "Checks", text: `🏳 Morale Check (25%+ casualties: ${casualties}/${targetModels}, Ld${modLd}): rolled ${moraleRoll.join("+")}=${moraleTotal} → ${moralePassed ? "PASSED — unit holds!" : "FAILED — unit Falls Back!"}` });
      }
      if (!moralePassed) statusEffects.push("Falling Back");
    }
  }

  if (statusEffects.length > 0) {
    log.push({ phase: "Checks", text: `Status: ${statusEffects.join(", ")}` });
  }

  return { log, rolls, casualties, getsHotWounds, precisionHits, totalShots, hits, wounds, unsaved: unsavedWounds, deflagrateHits, criticalHitWounds, statusEffects, ldRolls };
}

// ━━━ STATISTICAL CALCULATOR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━ RETURN FIRE RESOLVER (Shooting Phase Reaction) ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Defender fires back as a reaction during the shooting phase
function resolveReturnFire(params) {
  const {
    defenderModels, returnFireShots, returnFireS, returnFireAP,
    attackerT, attackerSv, attackerInv, attackerFnp, attackerW,
    bs, // defender's BS — if provided, use BS_TO_HIT; if not, snap shots 6+
    sgtEnabled, sgtWeapon, // optional sergeant with different weapon
  } = params;

  const log = [];
  const rolls = { hit: [], wound: [], save: [], fnp: [] };
  const rollsByWeapon = [];

  const hitNeeded = bs ? (BS_TO_HIT[bs] || 4) : 6;
  const isSnapShot = !bs;
  const hasSgt = sgtEnabled && sgtWeapon;
  const squadModels = hasSgt ? Math.max(defenderModels - 1, 0) : defenderModels;

  log.push({ phase: "Return Fire", text: `🎯 Defender fires Return Fire! (${isSnapShot ? "Snap Shots 6+" : `BS${bs} — ${hitNeeded}+`})` });

  // ━━ SQUAD FIRE ━━
  const totalShots = squadModels * returnFireShots;
  log.push({ phase: "Return Fire", text: `${squadModels} model(s) × ${returnFireShots} shot(s) = ${totalShots} total shots` });

  const hitRolls = rollD6s(totalShots);
  rolls.hit = hitRolls.map(r => ({ value: r, success: r >= hitNeeded }));
  const hits = hitRolls.filter(r => r >= hitNeeded).length;
  log.push({ phase: "Return Fire", text: `To Hit (${hitNeeded}+): ${hits} hit(s) from ${totalShots} shots` });

  let totalCasualties = 0;
  let squadCasualties = 0;

  if (hits > 0) {
    const woundNeeded = getWoundRoll(returnFireS, attackerT);
    if (woundNeeded !== null) {
      log.push({ phase: "Return Fire", text: `To Wound: S${returnFireS} vs T${attackerT} → needs ${woundNeeded}+` });
      const woundRolls = rollD6s(hits);
      rolls.wound = woundRolls.map(r => ({ value: r, success: r >= woundNeeded }));
      const wounds = woundRolls.filter(r => r >= woundNeeded).length;
      log.push({ phase: "Return Fire", text: `${wounds} wound(s) from ${hits} hit(s)` });

      if (wounds > 0) {
        const svN = attackerSv !== "-" ? parseInt(attackerSv) : null;
        const invN = attackerInv !== "-" ? parseInt(attackerInv) : null;
        const apNum = returnFireAP !== "-" ? parseInt(returnFireAP) : null;
        let bestSave = null;
        if (invN) bestSave = invN;
        if (svN && apNum && svN < apNum) { bestSave = bestSave ? Math.min(bestSave, svN) : svN; }
        else if (svN && !apNum) { bestSave = bestSave ? Math.min(bestSave, svN) : svN; }

        let unsaved = wounds;
        if (bestSave && bestSave <= 6) {
          const saveRolls = rollD6s(wounds);
          rolls.save = saveRolls.map(r => ({ value: r, success: r >= bestSave }));
          const saved = saveRolls.filter(r => r >= bestSave).length;
          unsaved = wounds - saved;
          log.push({ phase: "Return Fire", text: `Saves (${bestSave}+): ${saved} saved, ${unsaved} unsaved wound(s)` });
        } else {
          log.push({ phase: "Return Fire", text: `No save available — ${unsaved} unsaved wound(s)` });
        }

        // FNP
        const fnpN = attackerFnp !== "-" ? parseInt(attackerFnp) : null;
        if (fnpN && unsaved > 0) {
          const fnpRolls = rollD6s(unsaved);
          rolls.fnp = fnpRolls.map(r => ({ value: r, success: r >= fnpN }));
          const fnpSaved = fnpRolls.filter(r => r >= fnpN).length;
          unsaved -= fnpSaved;
          log.push({ phase: "Return Fire", text: `FNP (${fnpN}+): ${fnpSaved} saved → ${unsaved} unsaved` });
        }

        const w = attackerW || 1;
        squadCasualties = w > 1 ? Math.floor(unsaved / w) : unsaved;
        if (w > 1 && unsaved > 0) {
          log.push({ phase: "Return Fire", text: `${unsaved} unsaved vs ${w}W → ${squadCasualties} slain` });
        }
      }
    } else {
      log.push({ phase: "Return Fire", text: `S${returnFireS} vs T${attackerT}: Cannot wound!` });
    }
  }

  // Add squad rolls to rollsByWeapon
  rollsByWeapon.push({
    name: "Squad", models: squadModels,
    rolls: { hit: [...rolls.hit], wound: [...rolls.wound], save: [...rolls.save], fnpRolls: [...rolls.fnp] },
  });

  totalCasualties = squadCasualties;

  // ━━ SERGEANT FIRE ━━
  if (hasSgt) {
    const sgtHitNeeded = bs ? (BS_TO_HIT[bs] || 4) : 6;
    const sgtTotalShots = sgtWeapon.shots || 1;
    log.push({ phase: "Sergeant", text: `★ Sergeant fires ${sgtWeapon.name} (${sgtTotalShots} shots, S${sgtWeapon.s} AP${sgtWeapon.ap})` });

    const sgtHitRolls = rollD6s(sgtTotalShots);
    const sgtHitResults = sgtHitRolls.map(r => ({ value: r, success: r >= sgtHitNeeded, sergeant: true }));
    rolls.hit.push(...sgtHitResults);
    const sgtHits = sgtHitRolls.filter(r => r >= sgtHitNeeded).length;
    log.push({ phase: "Sergeant", text: `To Hit (${sgtHitNeeded}+): ${sgtHits} hit(s)` });

    let sgtCasualties = 0;
    const sgtRolls = { hit: [...sgtHitResults], wound: [], save: [], fnpRolls: [] };

    if (sgtHits > 0) {
      const sgtWoundNeeded = getWoundRoll(sgtWeapon.s, attackerT);
      if (sgtWoundNeeded !== null) {
        const sgtWoundRolls = rollD6s(sgtHits);
        const sgtWoundResults = sgtWoundRolls.map(r => ({ value: r, success: r >= sgtWoundNeeded, sergeant: true }));
        rolls.wound.push(...sgtWoundResults);
        sgtRolls.wound = sgtWoundResults;
        const sgtWounds = sgtWoundRolls.filter(r => r >= sgtWoundNeeded).length;
        log.push({ phase: "Sergeant", text: `S${sgtWeapon.s} vs T${attackerT} → ${sgtWounds} wound(s)` });

        if (sgtWounds > 0) {
          const svN = attackerSv !== "-" ? parseInt(attackerSv) : null;
          const invN = attackerInv !== "-" ? parseInt(attackerInv) : null;
          const sgtApNum = sgtWeapon.ap !== "-" ? parseInt(sgtWeapon.ap) : null;
          let sgtBestSave = null;
          if (invN) sgtBestSave = invN;
          if (svN && sgtApNum && svN < sgtApNum) { sgtBestSave = sgtBestSave ? Math.min(sgtBestSave, svN) : svN; }
          else if (svN && !sgtApNum) { sgtBestSave = sgtBestSave ? Math.min(sgtBestSave, svN) : svN; }

          let sgtUnsaved = sgtWounds;
          if (sgtBestSave && sgtBestSave <= 6) {
            const sgtSaveRolls = rollD6s(sgtWounds);
            const sgtSaveResults = sgtSaveRolls.map(r => ({ value: r, success: r >= sgtBestSave, sergeant: true }));
            rolls.save.push(...sgtSaveResults);
            sgtRolls.save = sgtSaveResults;
            const sgtSaved = sgtSaveRolls.filter(r => r >= sgtBestSave).length;
            sgtUnsaved = sgtWounds - sgtSaved;
            log.push({ phase: "Sergeant", text: `Save (${sgtBestSave}+): ${sgtSaved} saved, ${sgtUnsaved} unsaved` });
          }
          const w = attackerW || 1;
          sgtCasualties = w > 1 ? Math.floor(sgtUnsaved / w) : sgtUnsaved;
        }
      }
    }
    rollsByWeapon.push({ name: `★ Sgt: ${sgtWeapon.name}`, models: 1, rolls: sgtRolls });
    totalCasualties += sgtCasualties;
  }

  if (totalCasualties > 0) {
    log.push({ phase: "Return Fire", text: `☠ ${totalCasualties} attacker model(s) slain by Return Fire!` });
  } else {
    log.push({ phase: "Return Fire", text: `Return Fire inflicts no casualties.` });
  }

  return { log, rolls, rollsByWeapon, casualties: totalCasualties, hits, totalShots };
}

function calculateExpected(params) {
  const { numModels, numShots, bs, strength, ap, toughness, armourSave, invulnSave, coverSave, fnp, specialRules, halfRange, indirect, weaponType, sgtEnabled, sgtWeapon } = params;

  const hasSgt = sgtEnabled && sgtWeapon;
  const squadModels = hasSgt ? Math.max(numModels - 1, 0) : numModels;
  let totalShots = squadModels * numShots;
  if (weaponType === "Rapid Fire" && halfRange) totalShots = squadModels * numShots * 2;

  // Hit probability
  let hitNeeded = BS_TO_HIT[bs] || 6;
  if (weaponType === "Heavy" && params.moved) hitNeeded = 6;
  if (weaponType === "Barrage" && (indirect || params.moved)) hitNeeded = 6;
  let pHit = (7 - hitNeeded) / 6;
  if (specialRules.twinLinked) pHit = pHit + (1 - pHit) * pHit;

  // Wound probability
  let woundNeeded;
  if (specialRules.fleshbane) woundNeeded = 2;
  else if (specialRules.poisoned) woundNeeded = 4;
  else if (specialRules.poisoned3) woundNeeded = 3;
  else if (specialRules.poisoned2) woundNeeded = 2;
  else woundNeeded = getWoundRoll(strength, toughness);

  if (woundNeeded === null) return { expHits: totalShots * pHit, expWounds: 0, expUnsaved: 0, expCasualties: 0 };

  let pWound = (7 - woundNeeded) / 6;
  if (specialRules.shred) pWound = pWound + (1 - pWound) * pWound;

  // Save probability (simplified — uses best available save)
  function getBestSave(effectiveAP) {
    let best = null;
    const armourNegated = effectiveAP !== "-" && effectiveAP !== null && parseInt(effectiveAP) <= parseInt(armourSave);
    if (!armourNegated && armourSave && armourSave !== "-" && armourSave !== "0") best = parseInt(armourSave);
    if (!specialRules.ignoresCover && coverSave && coverSave !== "-" && coverSave !== "0") {
      const cv = parseInt(coverSave);
      if (best === null || cv < best) best = cv;
    }
    if (invulnSave && invulnSave !== "-" && invulnSave !== "0") {
      const iv = parseInt(invulnSave);
      if (best === null || iv < best) best = iv;
    }
    return best;
  }

  const normalSave = getBestSave(ap);
  const pNormalFail = normalSave ? (normalSave - 1) / 6 : 1;

  // FNP
  let pFnpFail = 1;
  const instantDeath = strength >= toughness * 2; // 3rd Ed: No "Instant Death" rule, just high damage
  if (fnp && fnp !== "-" && fnp !== "0" && !instantDeath) {
    pFnpFail = (parseInt(fnp) - 1) / 6;
  }

  const expHits = totalShots * pHit;
  const expWounds = expHits * pWound;
  const expUnsaved = expWounds * pNormalFail;
  const expCasualties = expUnsaved * pFnpFail;

  // Sergeant contribution
  let sgtExpCas = 0;
  if (hasSgt) {
    let sgtShots = sgtWeapon.shots;
    if (sgtWeapon.type === "Rapid Fire" && halfRange) sgtShots *= 2;
    
    let sgtHitNeeded = BS_TO_HIT[bs] || 6;
    if (sgtWeapon.type === "Heavy" && params.moved) {
      if (bs <= 3) sgtHitNeeded = 6;
      else if (bs <= 5) sgtHitNeeded = 5;
      else sgtHitNeeded = 4;
    }
    let sgtPHit = (7 - sgtHitNeeded) / 6;
    if (sgtWeapon.rules?.twinLinked) sgtPHit = sgtPHit + (1 - sgtPHit) * sgtPHit;
    
    let sgtWoundNeeded;
    if (sgtWeapon.rules?.fleshbane) sgtWoundNeeded = 2;
    else if (sgtWeapon.rules?.poisoned) sgtWoundNeeded = 4;
    else if (sgtWeapon.rules?.poisoned3) sgtWoundNeeded = 3;
    else sgtWoundNeeded = getWoundRoll(sgtWeapon.s, toughness);
    
    if (sgtWoundNeeded !== null) {
      let sgtPWound = (7 - sgtWoundNeeded) / 6;
      if (sgtWeapon.rules?.shred) sgtPWound = sgtPWound + (1 - sgtPWound) * sgtPWound;
      
      const sgtSave = getBestSave(sgtWeapon.ap);
      const sgtPFail = sgtSave ? (sgtSave - 1) / 6 : 1;
      
      sgtExpCas = sgtShots * sgtPHit * sgtPWound * sgtPFail * pFnpFail;
    }
  }

  const totalExpCas = expCasualties + sgtExpCas;

  return { expHits: (expHits + (hasSgt ? sgtWeapon.shots * ((7 - (BS_TO_HIT[bs] || 6)) / 6) : 0)).toFixed(1), expWounds: (expWounds + sgtExpCas / (pNormalFail * pFnpFail || 1)).toFixed(1), expUnsaved: (expUnsaved + sgtExpCas / (pFnpFail || 1)).toFixed(1), expCasualties: totalExpCas.toFixed(1) };
}

// ━━━ CHALLENGE SUB-PHASE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CHALLENGE_GAMBITS = [
  { id: "none", name: "No Gambit", desc: "No special effect", focusMod: 0, effect: null },
  { id: "seize", name: "Seize the Initiative", desc: "Roll extra Focus die, discard lowest", focusMod: 0, effect: "extraFocusDie" },
  { id: "flurry", name: "Flurry of Blows", desc: "+D3 Attacks, but Damage set to 1", focusMod: 0, effect: "flurry" },
  { id: "finishing", name: "Finishing Blow", desc: "Roll extra Focus die discard highest; +1 S & Damage", focusMod: 0, effect: "finishing" },
  { id: "feint", name: "Feint and Riposte", desc: "Deny opponent one Gambit (first picker only)", focusMod: 0, effect: "feint" },
  { id: "guard", name: "Guard Up", desc: "Reduce your attacks to 1; opponent gets -1 to hit", focusMod: 0, effect: "guard" },
  { id: "press", name: "Press the Attack", desc: "+1 to Focus Roll; +1 Attack", focusMod: 1, effect: "press" },
  { id: "measured", name: "Measured Strike", desc: "+1 AP improvement (min AP1)", focusMod: 0, effect: "measured" },
  { id: "taunt", name: "Taunt and Bait", desc: "If you lose Focus, opponent must re-roll one hit", focusMod: -1, effect: "taunt" },
];

function resolveChallenge(params) {
  const {
    // Attacker champion
    atkWS, atkS, atkAP, atkI, atkA, atkW, atkT, atkSv, atkInv, atkFnp, atkRules,
    atkGambit, atkName,
    // Defender champion
    defWS, defS, defAP, defI, defA, defW, defT, defSv, defInv, defFnp, defRules,
    defGambit, defName,
    // Context
    atkSupport, defSupport, // number of supporting models (per 5 = +2 Focus)
    isCharging,
  } = params;

  const log = [];
  const rolls = {
    attacker: { focus: [], hit: [], wound: [], save: [], fnp: [] },
    defender: { focus: [], hit: [], wound: [], save: [], fnp: [] },
  };

  const atkGambitData = CHALLENGE_GAMBITS.find(g => g.id === atkGambit) || CHALLENGE_GAMBITS[0];
  const defGambitData = CHALLENGE_GAMBITS.find(g => g.id === defGambit) || CHALLENGE_GAMBITS[0];

  log.push({ phase: "Challenge", text: `⚔ CHALLENGE DECLARED!` });
  log.push({ phase: "Challenge", text: `${atkName || "Attacker Champion"} vs ${defName || "Defender Champion"}` });
  log.push({ phase: "Gambit", text: `Attacker Gambit: ${atkGambitData.name} — ${atkGambitData.desc}` });
  log.push({ phase: "Gambit", text: `Defender Gambit: ${defGambitData.name} — ${defGambitData.desc}` });

  // ━━ STEP 1: Focus Roll ━━
  // D6 + Initiative + Gambit modifiers + Support
  function rollFocus(baseI, gambitData, support, label, rollKey) {
    let dice;
    if (gambitData.effect === "extraFocusDie") {
      // Seize: roll 2, discard lowest
      dice = rollD6s(2);
      rolls[rollKey].focus.push(...dice.map(d => ({ value: d, success: true })));
      const best = Math.max(...dice);
      log.push({ phase: "Focus", text: `${label} Seize the Initiative: rolled ${dice.join(", ")} → keeps ${best}` });
      return best + baseI + gambitData.focusMod + support;
    } else if (gambitData.effect === "finishing") {
      // Finishing Blow: roll 2, discard highest
      dice = rollD6s(2);
      rolls[rollKey].focus.push(...dice.map(d => ({ value: d, success: true })));
      const worst = Math.min(...dice);
      log.push({ phase: "Focus", text: `${label} Finishing Blow: rolled ${dice.join(", ")} → keeps ${worst} (discards highest)` });
      return worst + baseI + gambitData.focusMod + support;
    } else {
      dice = rollD6s(1);
      rolls[rollKey].focus.push({ value: dice[0], success: true });
      return dice[0] + baseI + gambitData.focusMod + support;
    }
  }

  const atkSupportBonus = Math.floor((atkSupport || 0) / 5) * 2;
  const defSupportBonus = Math.floor((defSupport || 0) / 5) * 2;

  let atkFocus = rollFocus(atkI, atkGambitData, atkSupportBonus, "Attacker", "attacker");
  let defFocus = rollFocus(defI, defGambitData, defSupportBonus, "Defender", "defender");

  // Duelist's Edge
  if (atkRules?.m_duelist) { atkFocus += 1; log.push({ phase: "Focus", text: `Attacker: Duelist's Edge +1 Focus` }); }
  if (defRules?.m_duelist) { defFocus += 1; log.push({ phase: "Focus", text: `Defender: Duelist's Edge +1 Focus` }); }

  log.push({ phase: "Focus", text: `Focus Totals: Attacker ${atkFocus} vs Defender ${defFocus}` });

  // Tie-breaker
  while (atkFocus === defFocus) {
    const a = rollD6(); const d = rollD6();
    log.push({ phase: "Focus", text: `Tied! Re-roll: Attacker ${a} vs Defender ${d}` });
    atkFocus = a; defFocus = d;
  }

  const atkWinsFocus = atkFocus > defFocus;
  const focusWinner = atkWinsFocus ? "Attacker" : "Defender";
  log.push({ phase: "Focus", text: `🏆 ${focusWinner} wins Focus! Strikes first & gains +1 Attack.` });

  // ━━ STEP 2: Apply Gambit Effects to stats ━━
  let effAtkA = atkA, effAtkS = atkS, effAtkAP = atkAP;
  let effDefA = defA, effDefS = defS, effDefAP = defAP;
  let atkHitPenalty = 0, defHitPenalty = 0;
  let atkDamageCap = null, defDamageCap = null;
  let tauntAtk = false, tauntDef = false;

  // Focus winner gets +1A
  if (atkWinsFocus) effAtkA += 1; else effDefA += 1;

  // Attacker gambit
  if (atkGambitData.effect === "flurry") {
    const bonus = Math.ceil(Math.random() * 3);
    effAtkA += bonus; atkDamageCap = 1;
    log.push({ phase: "Gambit", text: `Attacker Flurry: +${bonus} Attacks (Damage capped to 1)` });
  }
  if (atkGambitData.effect === "finishing") {
    effAtkS += 1;
    log.push({ phase: "Gambit", text: `Attacker Finishing Blow: +1 Strength (now S${effAtkS}), +1 Damage` });
  }
  if (atkGambitData.effect === "guard") {
    effAtkA = 1; defHitPenalty += 1;
    log.push({ phase: "Gambit", text: `Attacker Guard Up: 1 attack only; Defender -1 to hit` });
  }
  if (atkGambitData.effect === "press") {
    effAtkA += 1;
    log.push({ phase: "Gambit", text: `Attacker Press the Attack: +1 Attack` });
  }
  if (atkGambitData.effect === "measured") {
    const curAP = effAtkAP === "-" ? 7 : parseInt(effAtkAP);
    effAtkAP = String(Math.max(curAP - 1, 1));
    log.push({ phase: "Gambit", text: `Attacker Measured Strike: AP improved to ${effAtkAP}` });
  }
  if (atkGambitData.effect === "taunt") { tauntAtk = true; }

  // Defender gambit
  if (defGambitData.effect === "flurry") {
    const bonus = Math.ceil(Math.random() * 3);
    effDefA += bonus; defDamageCap = 1;
    log.push({ phase: "Gambit", text: `Defender Flurry: +${bonus} Attacks (Damage capped to 1)` });
  }
  if (defGambitData.effect === "finishing") {
    effDefS += 1;
    log.push({ phase: "Gambit", text: `Defender Finishing Blow: +1 Strength (now S${effDefS}), +1 Damage` });
  }
  if (defGambitData.effect === "guard") {
    effDefA = 1; atkHitPenalty += 1;
    log.push({ phase: "Gambit", text: `Defender Guard Up: 1 attack only; Attacker -1 to hit` });
  }
  if (defGambitData.effect === "press") {
    effDefA += 1;
    log.push({ phase: "Gambit", text: `Defender Press the Attack: +1 Attack` });
  }
  if (defGambitData.effect === "measured") {
    const curAP = effDefAP === "-" ? 7 : parseInt(effDefAP);
    effDefAP = String(Math.max(curAP - 1, 1));
    log.push({ phase: "Gambit", text: `Defender Measured Strike: AP improved to ${effDefAP}` });
  }
  if (defGambitData.effect === "taunt") { tauntDef = true; }

  // ━━ STEP 3: Resolve strikes in Focus order ━━
  function resolveStrike(label, numA, aWS, dWS, aS, dT, aAP, dSv, dInv, dFnp, dW, rules, hitPen, damageCap, tauntOpp, rollKey) {
    const strikeLog = [];
    const toHitBase = getMeleeToHit(aWS, dWS);
    const toHit = Math.min(Math.max(toHitBase + hitPen, 2), 6);
    strikeLog.push(`${label}: ${numA} attack(s), needs ${toHit}+ (WS${aWS} vs WS${dWS}${hitPen ? `, ${hitPen > 0 ? "+" : ""}${hitPen} penalty` : ""})`);

    const hitRolls = rollD6s(numA);
    rolls[rollKey].hit.push(...hitRolls.map(r => ({ value: r, success: r >= toHit })));
    let hits = hitRolls.filter(r => r >= toHit).length;

    // Taunt: opponent must re-roll one successful hit
    if (tauntOpp && hits > 0) {
      const reroll = rollD6();
      if (reroll < toHit) { hits -= 1; strikeLog.push(`Taunt & Bait: forced re-roll → ${reroll} (miss!) — ${hits} hit(s)`); }
      else { strikeLog.push(`Taunt & Bait: forced re-roll → ${reroll} (still hits)`); }
    }

    strikeLog.push(`To Hit: ${hits} hit(s) from ${numA} attack(s)`);
    if (hits === 0) { strikeLog.forEach(t => log.push({ phase: "Strike", text: t })); return { wounds: 0 }; }

    // Wound
    const toWoundNeeded = getWoundRoll(aS, dT);
    if (toWoundNeeded === null) {
      strikeLog.push(`S${aS} vs T${dT}: Cannot wound!`);
      strikeLog.forEach(t => log.push({ phase: "Strike", text: t })); return { wounds: 0 };
    }

    const woundRolls = rollD6s(hits);
    let wounds = 0, rendingW = 0, murderousW = 0, normalW = 0;
    woundRolls.forEach(r => {
      if (r >= toWoundNeeded) {
        wounds++;
        if (rules?.m_rending && r === 6) rendingW++;
        else if (rules?.m_murderous && r === 6) murderousW++;
        else normalW++;
      }
      rolls[rollKey].wound.push({ value: r, success: r >= toWoundNeeded });
    });

    // Shred
    if (rules?.m_shred) {
      const misses = woundRolls.filter(r => r < toWoundNeeded);
      const rerolls = rollD6s(misses.length);
      rerolls.forEach(r => {
        if (r >= toWoundNeeded) { wounds++; if (rules?.m_rending && r === 6) rendingW++; else normalW++; }
        rolls[rollKey].wound.push({ value: r, success: r >= toWoundNeeded, reroll: true });
      });
      strikeLog.push(`Shred: re-rolled ${misses.length} → ${rerolls.filter(r => r >= toWoundNeeded).length} extra`);
    }

    normalW = wounds - rendingW - murderousW;
    if (rendingW > 0) strikeLog.push(`🗡 Rending: ${rendingW} at AP2`);
    if (murderousW > 0) strikeLog.push(`💀 Murderous Strike: ${murderousW} — Instant Death`);
    strikeLog.push(`Wounds: ${wounds} from ${hits} hit(s)`);
    if (wounds === 0) { strikeLog.forEach(t => log.push({ phase: "Strike", text: t })); return { wounds: 0 }; }

    // Saves
    let unsaved = 0;
    function doSave(count, effAP, saveLabel) {
      if (count === 0) return 0;
      let best = null;
      const armNeg = effAP !== "-" && parseInt(effAP) <= parseInt(dSv);
      if (!armNeg && dSv && dSv !== "-" && dSv !== "0") best = parseInt(dSv);
      if (dInv && dInv !== "-" && dInv !== "0") { const iv = parseInt(dInv); if (best === null || iv < best) best = iv; }
      if (best === null) return count;
      const saveRolls = rollD6s(count);
      rolls[rollKey].save.push(...saveRolls.map(r => ({ value: r, success: r >= best })));
      const saved = saveRolls.filter(r => r >= best).length;
      strikeLog.push(`${saveLabel} (${best}+, AP${effAP}): ${saved} saved, ${count - saved} unsaved`);
      return count - saved;
    }

    unsaved += doSave(normalW, aAP, "Normal saves");
    if (rendingW > 0) unsaved += doSave(rendingW, "2", "Rending saves");
    if (murderousW > 0) unsaved += doSave(murderousW, aAP, "Murderous saves");

    // FNP
    let totalWounds = unsaved;
    if (dFnp && dFnp !== "-" && dFnp !== "0" && unsaved > 0) {
      const fnpN = parseInt(dFnp);
      const instantDeath = aS >= dT * 2 || murderousW > 0;
      if (!instantDeath) {
        const fnpRolls = rollD6s(unsaved);
        const fnpSaved = fnpRolls.filter(r => r >= fnpN).length;
        totalWounds = unsaved - fnpSaved;
        rolls[rollKey].fnp.push(...fnpRolls.map(r => ({ value: r, success: r >= fnpN })));
        strikeLog.push(`FNP (${fnpN}+): ${fnpSaved} saved → ${totalWounds} unsaved`);
      } else { strikeLog.push(`Instant Death — FNP cannot be used!`); }
    }

    // Damage cap from Flurry
    if (damageCap) {
      strikeLog.push(`Flurry: Damage capped to ${damageCap} per wound`);
    }

    strikeLog.forEach(t => log.push({ phase: "Strike", text: t }));
    return { wounds: totalWounds };
  }

  let atkWoundsRemaining = atkW;
  let defWoundsRemaining = defW;
  let atkWoundsDealt = 0, defWoundsDealt = 0;

  if (atkWinsFocus) {
    // Attacker strikes first
    const atkResult = resolveStrike(`⚔ ${atkName || "Attacker"} (Focus winner)`, effAtkA, atkWS, defWS, effAtkS, defT, effAtkAP, defSv, defInv, defFnp, defW, atkRules, 0, atkDamageCap, tauntDef, "attacker");
    defWoundsRemaining -= atkResult.wounds;
    atkWoundsDealt = atkResult.wounds;

    if (defWoundsRemaining > 0) {
      const defResult = resolveStrike(`🛡 ${defName || "Defender"} strikes back`, effDefA, defWS, atkWS, effDefS, atkT, effDefAP, atkSv, atkInv, atkFnp, atkW, defRules, 0, defDamageCap, tauntAtk, "defender");
      atkWoundsRemaining -= defResult.wounds;
      defWoundsDealt = defResult.wounds;
    } else {
      log.push({ phase: "Strike", text: `💀 ${defName || "Defender"} is SLAIN! No strike back.` });
    }
  } else {
    // Defender strikes first
    const defResult = resolveStrike(`🛡 ${defName || "Defender"} (Focus winner)`, effDefA, defWS, atkWS, effDefS, atkT, effDefAP, atkSv, atkInv, atkFnp, atkW, defRules, 0, defDamageCap, tauntAtk, "defender");
    atkWoundsRemaining -= defResult.wounds;
    defWoundsDealt = defResult.wounds;

    if (atkWoundsRemaining > 0) {
      const atkResult = resolveStrike(`⚔ ${atkName || "Attacker"} strikes back`, effAtkA, atkWS, defWS, effAtkS, defT, effAtkAP, defSv, defInv, defFnp, defW, atkRules, 0, atkDamageCap, tauntDef, "attacker");
      defWoundsRemaining -= atkResult.wounds;
      atkWoundsDealt = atkResult.wounds;
    } else {
      log.push({ phase: "Strike", text: `💀 ${atkName || "Attacker"} is SLAIN! No strike back.` });
    }
  }

  // ━━ STEP 4: Challenge Result ━━
  const atkSlain = atkWoundsRemaining <= 0;
  const defSlain = defWoundsRemaining <= 0;

  let result;
  if (atkSlain && defSlain) {
    result = { winner: "Mutual Kill", glory: 0 };
    log.push({ phase: "Result", text: `💀 Both champions fall! Mutual destruction.` });
  } else if (defSlain) {
    const glory = atkWoundsDealt;
    result = { winner: "Attacker", glory, slain: defName || "Defender" };
    log.push({ phase: "Result", text: `⚔ ${atkName || "Attacker"} SLAYS ${defName || "Defender"}! (+${glory} to Combat Resolution)` });
  } else if (atkSlain) {
    const glory = defWoundsDealt;
    result = { winner: "Defender", glory, slain: atkName || "Attacker" };
    log.push({ phase: "Result", text: `🛡 ${defName || "Defender"} SLAYS ${atkName || "Attacker"}! (+${glory} to Combat Resolution)` });
  } else {
    const diff = atkWoundsDealt - defWoundsDealt;
    result = { winner: diff > 0 ? "Attacker" : diff < 0 ? "Defender" : "Draw", glory: Math.abs(diff) };
    log.push({ phase: "Result", text: `Challenge ongoing — ${atkName || "Attacker"}: ${Math.max(atkWoundsRemaining, 0)}W remaining, ${defName || "Defender"}: ${Math.max(defWoundsRemaining, 0)}W remaining` });
    log.push({ phase: "Result", text: `Round result: ${diff > 0 ? "Attacker" : diff < 0 ? "Defender" : "Draw"} by ${Math.abs(diff)} wound(s)` });
  }

  return {
    log, rolls, result, focusWinner,
    atkWoundsDealt, defWoundsDealt,
    atkWoundsRemaining: Math.max(atkWoundsRemaining, 0),
    defWoundsRemaining: Math.max(defWoundsRemaining, 0),
    atkSlain, defSlain, atkGambitData, defGambitData,
  };
}

// ━━━ ASSAULT PHASE RESOLVER (Initiative-step based, per-group roll tracking) ━━
// resolveWeaponGroup: resolves one weapon group's attacks, returns casualties + per-group roll arrays.
function resolveWeaponGroup(group, remainTarget, log) {
  const { label, models, attacks, ws, s, ap, w: modelW, rules, rollKey,
          targetWS, targetT, targetSv, targetInv, targetFnp, targetW } = group;
  const groupRolls = { hit: [], wound: [], save: [], fnp: [] };

  if (remainTarget <= 0) {
    log.push({ phase: "Initiative", text: label + ": no targets remaining — skipped." });
    return { casualties: 0, unsavedWounds: 0, groupRolls };
  }
  const numAttacks = models * attacks;
  if (numAttacks <= 0) return { casualties: 0, unsavedWounds: 0, groupRolls };

  const sideLog = [];
  const toHitNeeded = getMeleeToHit(ws, targetWS);
  sideLog.push(label + ": " + models + " model(s) x " + attacks + " att = " + numAttacks + " attacks, hits on " + toHitNeeded + "+ (WS" + ws + " vs WS" + targetWS + ")");

  const hitRolls = rollD6s(numAttacks);
  groupRolls.hit.push(...hitRolls.map(r => ({ value: r, success: r >= toHitNeeded })));
  let hits = hitRolls.filter(r => r >= toHitNeeded).length;
  sideLog.push("To Hit: [" + hitRolls.join(", ") + "] -> " + hits + " hit(s)");
  if (hits === 0) { sideLog.forEach(t => log.push({ phase: "Initiative", text: t })); return { casualties: 0, unsavedWounds: 0, groupRolls }; }

  const toWoundNeeded = getWoundRoll(s, targetT);
  if (toWoundNeeded === null) {
    sideLog.push("S" + s + " vs T" + targetT + ": Cannot wound!");
    sideLog.forEach(t => log.push({ phase: "Initiative", text: t }));
    return { casualties: 0, unsavedWounds: 0, groupRolls };
  }
  sideLog.push("To Wound: S" + s + " vs T" + targetT + " -> needs " + toWoundNeeded + "+");

  const woundRolls = rollD6s(hits);
  let wounds = 0, rendingW = 0, murderousW = 0, normalW = 0;
  woundRolls.forEach(r => {
    const success = r >= toWoundNeeded;
    if (success) {
      wounds++;
      if (rules && rules.m_rending && r === 6) rendingW++;
      else if (rules && rules.m_murderous && r === 6) murderousW++;
      else normalW++;
    }
    groupRolls.wound.push({ value: r, success });
  });

  if (rules && rules.m_shred) {
    const misses = woundRolls.filter(r => r < toWoundNeeded);
    if (misses.length > 0) {
      const rerolls = rollD6s(misses.length);
      rerolls.forEach(r => {
        if (r >= toWoundNeeded) { wounds++; if (rules.m_rending && r === 6) rendingW++; else normalW++; }
        groupRolls.wound.push({ value: r, success: r >= toWoundNeeded, reroll: true });
      });
      sideLog.push("Shred: re-rolled " + misses.length + " -> " + rerolls.filter(r => r >= toWoundNeeded).length + " extra wound(s)");
    }
  }

  if (rendingW > 0) sideLog.push("Rending: " + rendingW + " wound(s) at AP2");
  if (murderousW > 0) sideLog.push("Murderous Strike: " + murderousW + " wound(s) cause Instant Death");
  normalW = wounds - rendingW - murderousW;
  sideLog.push("Wounds: [" + woundRolls.join(", ") + "] -> " + wounds + " wound(s)");
  if (wounds === 0) { sideLog.forEach(t => log.push({ phase: "Initiative", text: t })); return { casualties: 0, unsavedWounds: 0, groupRolls }; }

  let unsaved = 0;
  function doSaves(count, effAP, saveLabel) {
    if (count === 0) return 0;
    let best = null;
    const armNeg = effAP !== "-" && parseInt(effAP) <= parseInt(targetSv);
    if (!armNeg && targetSv && targetSv !== "-" && targetSv !== "0") best = parseInt(targetSv);
    if (targetInv && targetInv !== "-" && targetInv !== "0") { const iv = parseInt(targetInv); if (best === null || iv < best) best = iv; }
    if (best === null) { sideLog.push(saveLabel + ": no save - " + count + " unsaved"); return count; }
    const saveRolls = rollD6s(count);
    groupRolls.save.push(...saveRolls.map(r => ({ value: r, success: r >= best })));
    const saved = saveRolls.filter(r => r >= best).length;
    sideLog.push(saveLabel + " saves (" + best + "+, AP" + effAP + "): [" + saveRolls.join(", ") + "] -> " + saved + " saved, " + (count - saved) + " unsaved");
    return count - saved;
  }
  unsaved += doSaves(normalW, ap, "Normal");
  if (rendingW > 0) unsaved += doSaves(rendingW, "2", "Rending AP2");
  if (murderousW > 0) unsaved += doSaves(murderousW, ap, "Murderous Strike");

  let casualties = unsaved;
  if (targetFnp && targetFnp !== "-" && targetFnp !== "0" && unsaved > 0) {
    const fnpN = parseInt(targetFnp);
    const instantDeath = s >= targetT * 2 || murderousW > 0;
    if (!instantDeath) {
      const fnpRolls = rollD6s(unsaved);
      const fnpSaved = fnpRolls.filter(r => r >= fnpN).length;
      casualties = unsaved - fnpSaved;
      groupRolls.fnp.push(...fnpRolls.map(r => ({ value: r, success: r >= fnpN })));
      sideLog.push("FNP (" + fnpN + "+): [" + fnpRolls.join(", ") + "] -> " + fnpSaved + " saved, " + casualties + " unsaved");
    } else { sideLog.push("Instant Death - FNP cannot be used!"); }
  }

  const modelCas = targetW > 1 ? Math.floor(casualties / targetW) : casualties;
  if (targetW > 1 && casualties > 0) {
    const rem = casualties % targetW;
    sideLog.push(casualties + " unsaved vs " + targetW + "W models -> " + modelCas + " slain" + (rem > 0 ? ", " + rem + "W carry" : ""));
  }

  sideLog.forEach(t => log.push({ phase: "Initiative", text: t }));
  return { casualties: modelCas, unsavedWounds: casualties, groupRolls };
}

// resolveAssaultPhase: builds initiative steps from pre-supplied weapon group lists,
// resolves highest→lowest with casualty carry-through. Returns per-group roll data.
function resolveAssaultPhase(params) {
  const {
    attackerModels, attackerWS, attackerI, attackerA, attackerW,
    attackerSv, attackerInv, attackerFnp, attackerT, attackerS, attackerAP, attackerRules,
    defenderModels, defenderWS, defenderI, defenderA, defenderW,
    defenderSv, defenderInv, defenderFnp, defenderT, defenderS, defenderAP, defenderRules,
    isCharging, disordered,
    atkWeaponGroups: preAtkGroups, defWeaponGroups: preDefGroups,
  } = params;

  const log = [];
  // Legacy combined rolls accumulator (for fallback display)
  const rolls = { attacker: { hit: [], wound: [], save: [], fnp: [] }, defender: { hit: [], wound: [], save: [], fnp: [] } };

  let atkGroups = preAtkGroups;
  let defGroups = preDefGroups;

  if (!atkGroups) {
    let atkA = attackerA;
    if (isCharging && !disordered) { atkA += 1; log.push({ phase: "Setup", text: "Attacker +1A for charging (" + attackerA + " + 1 = " + atkA + ")" }); }
    if (attackerRules && attackerRules.m_rampage && defenderModels > attackerModels) {
      const rb = Math.ceil(Math.random() * 3); atkA += rb;
      log.push({ phase: "Setup", text: "Rampage: +" + rb + " attacks (now " + atkA + ")" });
    }
    const ei = attackerRules && attackerRules.m_unwieldy ? 1 : attackerI;
    atkGroups = [{ weaponName: "Primary", models: attackerModels, attacks: atkA, i: ei, ws: attackerWS, s: attackerS, ap: attackerAP, w: attackerW, rules: attackerRules }];
  }
  if (!defGroups) {
    const ei = defenderRules && defenderRules.m_unwieldy ? 1 : defenderI;
    defGroups = [{ weaponName: "Primary", models: defenderModels, attacks: defenderA, i: ei, ws: defenderWS, s: defenderS, ap: defenderAP, w: defenderW, rules: defenderRules }];
  }

  const allSteps = [];
  for (const g of atkGroups) allSteps.push({ iValue: g.i, side: "attacker", group: g });
  for (const g of defGroups) allSteps.push({ iValue: g.i, side: "defender", group: g });
  const iValues = [...new Set(allSteps.map(s => s.iValue))].sort((a, b) => b - a);
  log.push({ phase: "Setup", text: "Initiative Steps: " + iValues.join(" -> ") });

  // Per-group roll storage keyed by "side:weaponName"
  const groupRollsMap = {};

  let totalAtkCas = 0, totalDefCas = 0;
  let remainAtk = atkGroups.reduce((s, g) => s + g.models, 0);
  let remainDef = defGroups.reduce((s, g) => s + g.models, 0);

  for (const iVal of iValues) {
    const atkAtI = allSteps.filter(s => s.side === "attacker" && s.iValue === iVal);
    const defAtI = allSteps.filter(s => s.side === "defender" && s.iValue === iVal);
    const hasAtk = atkAtI.length > 0, hasDef = defAtI.length > 0;
    log.push({ phase: "Initiative", text: "=== Initiative Step " + iVal + " ===" });

    if (hasAtk && hasDef) {
      log.push({ phase: "Initiative", text: "I" + iVal + ": Simultaneous" });
      let stepDefCas = 0, stepAtkCas = 0;
      for (const s of atkAtI) {
        const g = s.group;
        const res = resolveWeaponGroup({
          label: "Attacker " + g.weaponName + " (I" + iVal + ")", models: Math.min(g.models, remainAtk), attacks: g.attacks,
          ws: g.ws, s: g.s, ap: g.ap, w: g.w, rules: g.rules,
          targetWS: defenderWS, targetT: defenderT, targetSv: defenderSv, targetInv: defenderInv, targetFnp: defenderFnp, targetW: defenderW,
        }, remainDef, log);
        stepDefCas += res.casualties;
        const key = "atk:" + g.weaponName;
        if (!groupRollsMap[key]) groupRollsMap[key] = { side: "Attacker", name: g.weaponName, models: g.models, i: iVal, rolls: { hit: [], wound: [], save: [], fnp: [] } };
        const gr = groupRollsMap[key].rolls;
        gr.hit.push(...res.groupRolls.hit); gr.wound.push(...res.groupRolls.wound); gr.save.push(...res.groupRolls.save); gr.fnp.push(...res.groupRolls.fnp);
        rolls.attacker.hit.push(...res.groupRolls.hit); rolls.attacker.wound.push(...res.groupRolls.wound); rolls.attacker.save.push(...res.groupRolls.save); rolls.attacker.fnp.push(...res.groupRolls.fnp);
      }
      for (const s of defAtI) {
        const g = s.group;
        const res = resolveWeaponGroup({
          label: "Defender " + g.weaponName + " (I" + iVal + ")", models: Math.min(g.models, remainDef), attacks: g.attacks,
          ws: g.ws, s: g.s, ap: g.ap, w: g.w, rules: g.rules,
          targetWS: attackerWS, targetT: attackerT, targetSv: attackerSv, targetInv: attackerInv, targetFnp: attackerFnp, targetW: attackerW,
        }, remainAtk, log);
        stepAtkCas += res.casualties;
        const key = "def:" + g.weaponName;
        if (!groupRollsMap[key]) groupRollsMap[key] = { side: "Defender", name: g.weaponName, models: g.models, i: iVal, rolls: { hit: [], wound: [], save: [], fnp: [] } };
        const gr = groupRollsMap[key].rolls;
        gr.hit.push(...res.groupRolls.hit); gr.wound.push(...res.groupRolls.wound); gr.save.push(...res.groupRolls.save); gr.fnp.push(...res.groupRolls.fnp);
        rolls.defender.hit.push(...res.groupRolls.hit); rolls.defender.wound.push(...res.groupRolls.wound); rolls.defender.save.push(...res.groupRolls.save); rolls.defender.fnp.push(...res.groupRolls.fnp);
      }
      remainDef = Math.max(0, remainDef - stepDefCas);
      remainAtk = Math.max(0, remainAtk - stepAtkCas);
      totalDefCas += stepDefCas; totalAtkCas += stepAtkCas;
      log.push({ phase: "Initiative", text: "I" + iVal + ": " + stepDefCas + " def slain, " + stepAtkCas + " atk slain -> " + remainAtk + " atk / " + remainDef + " def remain" });
    } else if (hasAtk) {
      log.push({ phase: "Initiative", text: "I" + iVal + ": Attacker strikes" });
      let stepDefCas = 0;
      for (const s of atkAtI) {
        const g = s.group;
        const res = resolveWeaponGroup({
          label: "Attacker " + g.weaponName + " (I" + iVal + ")", models: Math.min(g.models, remainAtk), attacks: g.attacks,
          ws: g.ws, s: g.s, ap: g.ap, w: g.w, rules: g.rules,
          targetWS: defenderWS, targetT: defenderT, targetSv: defenderSv, targetInv: defenderInv, targetFnp: defenderFnp, targetW: defenderW,
        }, remainDef, log);
        stepDefCas += res.casualties;
        const key = "atk:" + g.weaponName;
        if (!groupRollsMap[key]) groupRollsMap[key] = { side: "Attacker", name: g.weaponName, models: g.models, i: iVal, rolls: { hit: [], wound: [], save: [], fnp: [] } };
        const gr = groupRollsMap[key].rolls;
        gr.hit.push(...res.groupRolls.hit); gr.wound.push(...res.groupRolls.wound); gr.save.push(...res.groupRolls.save); gr.fnp.push(...res.groupRolls.fnp);
        rolls.attacker.hit.push(...res.groupRolls.hit); rolls.attacker.wound.push(...res.groupRolls.wound); rolls.attacker.save.push(...res.groupRolls.save); rolls.attacker.fnp.push(...res.groupRolls.fnp);
      }
      remainDef = Math.max(0, remainDef - stepDefCas); totalDefCas += stepDefCas;
      if (stepDefCas > 0) log.push({ phase: "Initiative", text: "I" + iVal + ": " + stepDefCas + " def slain -> " + remainDef + " remain" });
    } else if (hasDef) {
      log.push({ phase: "Initiative", text: "I" + iVal + ": Defender strikes" });
      let stepAtkCas = 0;
      for (const s of defAtI) {
        const g = s.group;
        const res = resolveWeaponGroup({
          label: "Defender " + g.weaponName + " (I" + iVal + ")", models: Math.min(g.models, remainDef), attacks: g.attacks,
          ws: g.ws, s: g.s, ap: g.ap, w: g.w, rules: g.rules,
          targetWS: attackerWS, targetT: attackerT, targetSv: attackerSv, targetInv: attackerInv, targetFnp: attackerFnp, targetW: attackerW,
        }, remainAtk, log);
        stepAtkCas += res.casualties;
        const key = "def:" + g.weaponName;
        if (!groupRollsMap[key]) groupRollsMap[key] = { side: "Defender", name: g.weaponName, models: g.models, i: iVal, rolls: { hit: [], wound: [], save: [], fnp: [] } };
        const gr = groupRollsMap[key].rolls;
        gr.hit.push(...res.groupRolls.hit); gr.wound.push(...res.groupRolls.wound); gr.save.push(...res.groupRolls.save); gr.fnp.push(...res.groupRolls.fnp);
        rolls.defender.hit.push(...res.groupRolls.hit); rolls.defender.wound.push(...res.groupRolls.wound); rolls.defender.save.push(...res.groupRolls.save); rolls.defender.fnp.push(...res.groupRolls.fnp);
      }
      remainAtk = Math.max(0, remainAtk - stepAtkCas); totalAtkCas += stepAtkCas;
      if (stepAtkCas > 0) log.push({ phase: "Initiative", text: "I" + iVal + ": " + stepAtkCas + " atk slain -> " + remainAtk + " remain" });
    }
  }

  const chargingBonus = isCharging ? 1 : 0;
  const atkScore = totalDefCas + chargingBonus;
  const defScore = totalAtkCas;
  const diff = atkScore - defScore;
  let combatResult;
  if (diff > 0) {
    combatResult = { winner: "Attacker", diff, attackerScore: atkScore, defenderScore: defScore };
    log.push({ phase: "Combat Res", text: "Attacker wins combat resolution " + atkScore + " vs " + defScore + " (margin: " + diff + ")" });
    log.push({ phase: "Combat Res", text: "Defender must take Morale check at Ld -" + diff });
  } else if (diff < 0) {
    combatResult = { winner: "Defender", diff: Math.abs(diff), attackerScore: atkScore, defenderScore: defScore };
    log.push({ phase: "Combat Res", text: "Defender wins combat resolution " + defScore + " vs " + atkScore + " (margin: " + Math.abs(diff) + ")" });
    log.push({ phase: "Combat Res", text: "Attacker must take Morale check at Ld -" + Math.abs(diff) });
  } else {
    combatResult = { winner: "Draw", diff: 0, attackerScore: atkScore, defenderScore: defScore };
    log.push({ phase: "Combat Res", text: "Draw! (" + atkScore + " vs " + defScore + ") — combat continues." });
  }
  log.push({ phase: "Combat Res", text: "Survivors: " + remainAtk + " attacker(s), " + remainDef + " defender(s)" });

  return {
    log, rolls, combatResult, groupRollsMap,
    attackerCasualties: totalAtkCas, defenderCasualties: totalDefCas,
    remainingAttackers: remainAtk, remainingDefenders: remainDef, isCharging,
  };
}

// ━━━ MERGED WEAPON PROFILE LOOKUP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Returns shooting weapon profiles, checking core and legion tables
function getRangedWeapons(unitId) {
  return WEAPON_PROFILES[unitId] || LEGION_WEAPON_PROFILES[unitId] || [];
}

// ━━━ CHARGE PHASE RESOLVER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// WS comparison chart for melee To Hit
const WS_TO_HIT_CHART = {
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

const MELEE_SPECIAL_RULES = [
  { id: "m_shred", label: "Shred", desc: "Re-roll failed To Wound rolls in melee" },
  { id: "m_rending", label: "Rending", desc: "To Wound of 6 is AP2 in melee" },
  { id: "m_murderous", label: "Murderous Strike", desc: "To Wound of 6 causes Instant Death" },
  { id: "m_unwieldy", label: "Unwieldy", desc: "Always strikes at Initiative 1" },
  { id: "m_specialist", label: "Specialist Weapon", desc: "+1A if paired with another Specialist Weapon" },
  { id: "m_brutal", label: "Brutal (X)", desc: "+1 to wound roll" },
  { id: "m_reaping", label: "Reaping Blow", desc: "Each model makes 1 extra attack against all models in base contact" },
  { id: "m_duelist", label: "Duelist's Edge", desc: "+1 Initiative in challenges" },
  { id: "m_rampage", label: "Rampage", desc: "+D3 attacks when outnumbered" },
];

// Melee weapons keyed by unit id
// ws/i/a/w/t/sv/inv/fnp are the MODEL's base stats that get auto-filled
// s/ap/rules are the WEAPON stats
const MELEE_WEAPON_PROFILES = {
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
const LEGION_MELEE_WEAPONS = {
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
const LEGION_RANGED_WEAPONS = {
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
  
// ━━━ UNIT ICON SYSTEM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Object.assign(window.HH, { resolveShootingPhase, resolveReturnFire, calculateExpected, CHALLENGE_GAMBITS, resolveChallenge, resolveWeaponGroup, resolveAssaultPhase, getRangedWeapons, WS_TO_HIT_CHART, getMeleeToHit, MELEE_SPECIAL_RULES, MELEE_WEAPON_PROFILES, LEGION_MELEE_WEAPONS, LEGION_RANGED_WEAPONS, getSetUpMove, resolveChargePhase });
})();
