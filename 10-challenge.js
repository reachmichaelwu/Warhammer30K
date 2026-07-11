// Challenge sub-phase resolver
// Lines 3815-4127 from shooting-resolver165.jsx

// ━━━ CHALLENGE SUB-PHASE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

var CHALLENGE_GAMBITS = [
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
    rolls.attacker.focus.push({ value: a, success: true, reroll: true });
    rolls.defender.focus.push({ value: d, success: true, reroll: true });
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
    const bonus = Math.floor(Math.random() * 3) + 1; // D3
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
    const bonus = Math.floor(Math.random() * 3) + 1; // D3
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
      rolls[rollKey].hit.push({ value: reroll, success: reroll >= toHit, reroll: true });
      if (reroll < toHit) { hits -= 1; strikeLog.push(`Taunt & Bait: forced re-roll → ${reroll} (miss!) — ${hits} hit(s)`); }
      else { strikeLog.push(`Taunt & Bait: forced re-roll → ${reroll} (still hits)`); }
    }

    strikeLog.push(`To Hit: ${hits} hit(s) from ${numA} attack(s)`);
    if (hits === 0) { strikeLog.forEach(t => log.push({ phase: "Strike", text: t })); return { wounds: 0 }; }

    // Wound
    let toWoundNeeded = getWoundRoll(aS, dT);
    // Poisoned (X+): wounds automatically on X+ regardless of Toughness (use better of the two)
    const poisonOn = rules?.m_poisoned2 ? 2 : rules?.m_poisoned ? 4 : 0;
    if (poisonOn) {
      toWoundNeeded = toWoundNeeded === null ? poisonOn : Math.min(toWoundNeeded, poisonOn);
      strikeLog.push(`Poisoned (${poisonOn}+): wounds on ${toWoundNeeded}+ regardless of Toughness`);
    }
    if (toWoundNeeded === null) {
      strikeLog.push(`S${aS} vs T${dT}: Cannot wound!`);
      strikeLog.forEach(t => log.push({ phase: "Strike", text: t })); return { wounds: 0 };
    }
    // Brutal: +1 to wound roll (a natural 1 always fails, so floor at 2+)
    if (rules?.m_brutal && toWoundNeeded > 2) {
      toWoundNeeded -= 1;
      strikeLog.push(`Brutal: +1 to wound → needs ${toWoundNeeded}+`);
    }

    const woundRolls = rollD6s(hits);
    // Breaching (X+): qualifying wounds are resolved at AP2
    const breachOn = (rules?.m_breaching || rules?.m_breaching4) ? 4 : rules?.m_breaching5 ? 5 : rules?.m_breaching6 ? 6 : 0;
    let wounds = 0, rendingW = 0, murderousW = 0, breachingW = 0, normalW = 0;
    woundRolls.forEach(r => {
      if (r >= toWoundNeeded) {
        wounds++;
        if (rules?.m_rending && r === 6) rendingW++;
        else if (rules?.m_murderous && r === 6) murderousW++;
        else if (breachOn && r >= breachOn) breachingW++;
        else normalW++;
      }
      rolls[rollKey].wound.push({ value: r, success: r >= toWoundNeeded });
    });

    // Shred
    if (rules?.m_shred) {
      const misses = woundRolls.filter(r => r < toWoundNeeded);
      const rerolls = rollD6s(misses.length);
      rerolls.forEach(r => {
        if (r >= toWoundNeeded) {
          wounds++;
          if (rules?.m_rending && r === 6) rendingW++;
          else if (rules?.m_murderous && r === 6) murderousW++;
          else if (breachOn && r >= breachOn) breachingW++;
          else normalW++;
        }
        rolls[rollKey].wound.push({ value: r, success: r >= toWoundNeeded, reroll: true });
      });
      strikeLog.push(`Shred: re-rolled ${misses.length} → ${rerolls.filter(r => r >= toWoundNeeded).length} extra`);
    }

    normalW = wounds - rendingW - murderousW - breachingW;
    if (rendingW > 0) strikeLog.push(`🗡 Rending: ${rendingW} at AP2`);
    if (breachingW > 0) strikeLog.push(`💥 Breaching (${breachOn}+): ${breachingW} at AP2`);
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
    if (breachingW > 0) unsaved += doSave(breachingW, "2", "Breaching saves");
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

  // Taunt & Bait only triggers if the taunting champion LOST the Focus roll
  const atkTauntActive = tauntAtk && atkWinsFocus === false;
  const defTauntActive = tauntDef && atkWinsFocus === true;

  if (atkWinsFocus) {
    // Attacker strikes first
    const atkResult = resolveStrike(`⚔ ${atkName || "Attacker"} (Focus winner)`, effAtkA, atkWS, defWS, effAtkS, defT, effAtkAP, defSv, defInv, defFnp, defW, atkRules, atkHitPenalty, atkDamageCap, defTauntActive, "attacker");
    defWoundsRemaining -= atkResult.wounds;
    atkWoundsDealt = atkResult.wounds;

    if (defWoundsRemaining > 0) {
      const defResult = resolveStrike(`🛡 ${defName || "Defender"} strikes back`, effDefA, defWS, atkWS, effDefS, atkT, effDefAP, atkSv, atkInv, atkFnp, atkW, defRules, defHitPenalty, defDamageCap, atkTauntActive, "defender");
      atkWoundsRemaining -= defResult.wounds;
      defWoundsDealt = defResult.wounds;
    } else {
      log.push({ phase: "Strike", text: `💀 ${defName || "Defender"} is SLAIN! No strike back.` });
    }
  } else {
    // Defender strikes first
    const defResult = resolveStrike(`🛡 ${defName || "Defender"} (Focus winner)`, effDefA, defWS, atkWS, effDefS, atkT, effDefAP, atkSv, atkInv, atkFnp, atkW, defRules, defHitPenalty, defDamageCap, atkTauntActive, "defender");
    atkWoundsRemaining -= defResult.wounds;
    defWoundsDealt = defResult.wounds;

    if (atkWoundsRemaining > 0) {
      const atkResult = resolveStrike(`⚔ ${atkName || "Attacker"} strikes back`, effAtkA, atkWS, defWS, effAtkS, defT, effAtkAP, defSv, defInv, defFnp, defW, atkRules, atkHitPenalty, atkDamageCap, defTauntActive, "attacker");
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

