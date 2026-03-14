// Assault phase resolver
// Lines 4128-4392 from shooting-resolver165.jsx

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

// getRangedWeapons is defined in 05-weapon-profiles.js (shared global)

