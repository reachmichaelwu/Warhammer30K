Warhammer 30K — Shoot Phase & Charge Resolver (README)

A lightweight “resolver” to walk you through The Horus Heresy (Warhammer 30,000) Shooting Phase and the Charge / Assault sequence step-by-step, so you don’t miss timing windows, reactions, or “once per phase” style rules.

This README describes the flow the resolver follows. It’s written to be system-agnostic where possible, but the structure matches how 30K games are typically played.

⸻

What this tool does
	•	Guides you through Shooting in the correct order (choose unit → declare targets → resolve attacks).
	•	Tracks “has acted / can act” state for units (advanced, pinned, falling back, etc. if you support it).
	•	Runs the Charge sequence cleanly (declare charges → reactions (if used) → roll distance → move chargers).
	•	Hands off into Fight/Sub-phase if you want to extend it.

⸻

Resolver flow overview

High-level order
	1.	Start of Shooting Phase
	2.	Select an eligible unit to shoot
	3.	Resolve that unit’s shooting
	4.	Repeat until no eligible units remain
	5.	Charge declarations (often part of the Assault Phase flow)
	6.	Resolve charges one at a time
	7.	End-of-phase wrap-up

⸻

Shooting Phase (detailed)

0. Start of Shooting Phase (setup / checks)

The resolver should:
	•	Refresh “once per Shooting Phase” toggles.
	•	Identify eligible shooting units (not locked in combat, not otherwise prohibited, etc.).
	•	Optionally prompt: Any start-of-phase rules? (buffs, stance changes, special orders, etc.)

Output: list of eligible units and any reminders.

⸻

1. Choose a unit to activate (shoot)

For each activation:
	•	Pick one friendly unit that is eligible to shoot.
	•	Confirm its current status that affects shooting:
	•	Stationary / moved / advanced (if you track)
	•	Pinned / falling back
	•	Line of sight constraints
	•	Range constraints

Output: active unit “locked in” for this resolution.

⸻

2. Declare targets (per weapon / firing group)

The resolver should prompt:
	•	Is the unit splitting fire? (some rules allow, otherwise keep to normal targeting)
	•	For each weapon or weapon group:
	•	Choose target unit
	•	Confirm range
	•	Confirm line of sight
	•	Note relevant target keywords (Infantry, Vehicle, Dreadnought, etc.) if your resolver uses them

Output: weapon → target mapping.

⸻

3. Choose firing mode & apply modifiers

For each weapon group:
	•	Select profile (if multiple) and any firing mode options.
	•	Apply modifiers and constraints:
	•	Movement penalties/limitations (if applicable to your ruleset)
	•	Night fighting / cover / shrouded (if you track)
	•	Pinning / concussive / rending / breaching, etc. flags (optional)

Output: final attack “packet” with a computed to-hit value and special rules list.

⸻

4. Roll To Hit

For each attack packet:
	•	Determine number of shots/attacks.
	•	Roll hit dice.
	•	Apply rerolls (if any).
	•	Resolve special hit effects (e.g., gets hot checks, twin-linked style rerolls, etc. if supported).

Output: number of hits + any side-effects.

⸻

5. Roll To Wound / Armour Penetration

Depends on target type:

5A. Against Infantry/Beasts/etc.
	•	Roll to wound from Strength vs Toughness.
	•	Apply wound rerolls/modifiers.
	•	Mark wound pool by AP / special rules if needed.

5B. Against Vehicles (or models using Armour Values)
	•	Roll armour penetration (and/or special penetration rules).
	•	Determine glances/pens if your ruleset uses them.
	•	Prepare results for damage resolution.

Output: wounds caused (by AP band) or vehicle penetration results.

⸻

6. Allocate & Take Saves

6A. Infantry-style saves
	•	Allocate wounds (respecting any allocation rules you’re implementing).
	•	Take armour saves / invulnerable saves / cover saves (as allowed).
	•	Apply “no save” wounds.
	•	Remove casualties and track morale/pinning triggers if desired.

6B. Vehicle damage resolution
	•	Apply damage table effects (if applicable).
	•	Track hull points/structure, weapon destroyed, immobilized, etc.

Output: casualties removed / vehicle damage applied.

⸻

7. Morale / Pinning / After-effects (optional but recommended)

The resolver can ask:
	•	Does the target need to take:
	•	Morale checks (25% casualties, etc.)
	•	Pinning checks
	•	Any “on damage” tests (crew shaken, etc.)

Output: updated target status.

⸻

8. End of this unit’s shooting activation
	•	Mark unit as has shot.
	•	Clear per-activation temporary modifiers.
	•	Return to step 1 until all shooting is complete.

⸻

Charge Resolver (detailed)

Many groups treat this as part of the Assault Phase flow; the tool can be used as the “Charge sub-phase” driver.

0. Start of Charge Sequence

The resolver should:
	•	Identify units eligible to declare a charge (not pinned/falling back/locked, etc. per rules you support).
	•	Remind: charges are usually declared one unit at a time.

⸻

1. Declare charge

For the active charging unit:
	•	Select charging unit.
	•	Select charge target (and any secondary targets if your rules support multi-charges).
	•	Validate:
	•	Is at least one model in the unit capable of reaching engagement range given expected distance rules?
	•	Any restrictions (terrain, line of sight requirements, special rules)?

Output: a declared charge record (charger → target(s)).

⸻

2. Reactions / Defensive fire / special responses (if your playgroup uses them)

If your ruleset or event pack includes reactions:
	•	Prompt defending player for any reaction choice and validate timing.
	•	If applicable: resolve Overwatch / defensive fire.
	•	Allocate casualties
	•	Check whether casualties affect charge feasibility

Output: casualties from reactions + updated charger state.

⸻

3. Roll charge distance
	•	Roll the charge distance (2D6 or whatever your rules module uses).
	•	Apply modifiers (terrain, special rules, difficult ground).
	•	Determine whether the charge is successful.

Output: final charge distance and success/fail.

⸻

4. Move charging unit

If successful:
	•	Move models following charge move rules:
	•	Closest model first (if you enforce)
	•	Maintain coherency
	•	Maximize engagement where possible
	•	Respect impassable terrain and unit spacing
	•	Confirm final engagement/contact.

If failed:
	•	Apply failed charge movement (if any in your rules module) and mark state.

Output: updated unit positions and engagement status.

⸻

5. Resolve charge effects
