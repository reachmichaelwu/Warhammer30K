// Shooting phase resolver
// Lines 2977-3563 from shooting-resolver165.jsx

// ━━━ PHASE RESOLVER ENGINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
    if (bsVal <= 1) return 7; // BS 1 cannot snap shot (treated as impossible)
    if (bsVal <= 3) return 6;
    if (bsVal <= 5) return 5;
    if (bsVal <= 7) return 4;
    if (bsVal <= 9) return 3;
    return 2; // BS 10+
  };

  let snapShooting = false;

  const snapRollLabel = (threshold) => threshold >= 7 ? "FAIL (BS1 cannot snap fire)" : `${threshold}+`;

  // Manual Snap Shots toggle (e.g. firing at Flyers, reacting, etc.)
  if (snapShots) {
    snapShooting = true;
    toHitNeeded = getSnapThreshold(bs);
    hitMods.push(`Snap Shots: ${snapRollLabel(toHitNeeded)} (BS${bs} snap fire)`);
  }
  // Snap Shots for Heavy weapons that moved - 3rd edition: scales with BS
  if (!snapShooting && weaponType === "Heavy" && moved) {
    snapShooting = true;
    toHitNeeded = getSnapThreshold(bs);
    hitMods.push(`Snap Shots (moved with Heavy weapon): ${snapRollLabel(toHitNeeded)} (scales with BS)`);
  }
  // Barrage indirect fire
  if (!snapShooting && weaponType === "Barrage" && indirect) {
    snapShooting = true;
    toHitNeeded = getSnapThreshold(bs);
    hitMods.push(`Barrage (Indirect Fire): firing without LoS, ${snapRollLabel(toHitNeeded)}`);
  }
  // Barrage moved (Ordnance-type, cannot fire if moved unless specified)
  if (!snapShooting && weaponType === "Barrage" && moved && !indirect) {
    snapShooting = true;
    toHitNeeded = getSnapThreshold(bs);
    hitMods.push(`Snap Shots (moved with Barrage weapon): ${snapRollLabel(toHitNeeded)}`);
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

