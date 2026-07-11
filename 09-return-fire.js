// Return fire resolver, statistical calculator
// Lines 3564-3814 from shooting-resolver165.jsx

// ━━━ STATISTICAL CALCULATOR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━ RETURN FIRE RESOLVER (Shooting Phase Reaction) ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Defender fires back as a reaction during the shooting phase
function resolveReturnFire(params) {
  const {
    defenderModels, returnFireShots, returnFireS, returnFireAP,
    attackerT, attackerSv, attackerInv, attackerFnp, attackerW,
    attackerModels, // used to detect single-model attacker units
    bs, // defender's BS — if provided, use BS_TO_HIT; if not, snap shots 6+
    sgtEnabled, sgtWeapon, // optional sergeant with different weapon
  } = params;

  const log = [];
  const rolls = { hit: [], wound: [], save: [], fnp: [] };
  const rollsByWeapon = [];

  const hitNeeded = bs ? (BS_TO_HIT[bs] || 6) : 6;
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
        const isSingleAtk = attackerModels === 1;
        if (isSingleAtk) {
          // Single-model attacker — no division; track wounds directly
          squadCasualties = w > 1 ? (unsaved >= w ? 1 : 0) : unsaved;
          if (w > 1 && unsaved > 0) {
            log.push({ phase: "Return Fire", text: `${unsaved} wound(s) on single W${w} model → ${unsaved >= w ? "MODEL SLAIN" : unsaved + "/" + w + " wounds — model survives"}` });
          }
        } else {
          squadCasualties = w > 1 ? Math.floor(unsaved / w) : unsaved;
          if (w > 1 && unsaved > 0) {
            log.push({ phase: "Return Fire", text: `${unsaved} unsaved vs ${w}W → ${squadCasualties} slain` });
          }
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
    const sgtHitNeeded = bs ? (BS_TO_HIT[bs] || 6) : 6;
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

          // FNP (same as squad fire)
          const sgtFnpN = attackerFnp !== "-" ? parseInt(attackerFnp) : null;
          if (sgtFnpN && sgtUnsaved > 0) {
            const sgtFnpRolls = rollD6s(sgtUnsaved);
            const sgtFnpResults = sgtFnpRolls.map(r => ({ value: r, success: r >= sgtFnpN, sergeant: true }));
            rolls.fnp.push(...sgtFnpResults);
            sgtRolls.fnpRolls = sgtFnpResults;
            const sgtFnpSaved = sgtFnpRolls.filter(r => r >= sgtFnpN).length;
            sgtUnsaved -= sgtFnpSaved;
            log.push({ phase: "Sergeant", text: `FNP (${sgtFnpN}+): ${sgtFnpSaved} saved → ${sgtUnsaved} unsaved` });
          }
          const w = attackerW || 1;
          const isSingleAtk = attackerModels === 1;
          sgtCasualties = isSingleAtk
            ? (w > 1 ? (sgtUnsaved >= w ? 1 : 0) : sgtUnsaved)
            : (w > 1 ? Math.floor(sgtUnsaved / w) : sgtUnsaved);
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
  // 3rd Edition snap-shot threshold scales with BS (matches resolveShootingPhase)
  const snapNeeded = bs <= 1 ? 7 : bs <= 3 ? 6 : bs <= 5 ? 5 : bs <= 7 ? 4 : bs <= 9 ? 3 : 2;
  if (params.snapShots) hitNeeded = snapNeeded; // manual Snap Shots toggle (matches resolveShootingPhase)
  if (weaponType === "Heavy" && params.moved) hitNeeded = snapNeeded;
  if (weaponType === "Barrage" && (indirect || params.moved)) hitNeeded = snapNeeded;
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
    if (params.snapShots || (sgtWeapon.type === "Heavy" && params.moved)) sgtHitNeeded = snapNeeded;
    let sgtPHit = (7 - sgtHitNeeded) / 6;
    if (sgtWeapon.rules?.twinLinked) sgtPHit = sgtPHit + (1 - sgtPHit) * sgtPHit;
    
    let sgtWoundNeeded;
    if (sgtWeapon.rules?.fleshbane) sgtWoundNeeded = 2;
    else if (sgtWeapon.rules?.poisoned) sgtWoundNeeded = 4;
    else if (sgtWeapon.rules?.poisoned3) sgtWoundNeeded = 3;
    else if (sgtWeapon.rules?.poisoned2) sgtWoundNeeded = 2;
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

