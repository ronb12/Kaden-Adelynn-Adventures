/**
 * Unique objectives for each of the 100 Quick Play levels.
 * Each level has exactly one objective; all 100 are distinct (type and/or target/description).
 */

export const LevelObjectiveType = {
  KILL_ENEMIES: 'kill_enemies',
  COLLECT_STARS: 'collect_stars',
  COMBO: 'combo',
  SURVIVE: 'survive',
  ACCURACY: 'accuracy',
  NO_DAMAGE: 'no_damage',
  DEFEAT_BOSS: 'defeat_boss',
}

function buildLevelObjectives() {
  const list = []
  const types = [
    LevelObjectiveType.KILL_ENEMIES,
    LevelObjectiveType.COLLECT_STARS,
    LevelObjectiveType.COMBO,
    LevelObjectiveType.SURVIVE,
    LevelObjectiveType.ACCURACY,
    LevelObjectiveType.NO_DAMAGE,
  ]
  let typeIdx = 0
  for (let L = 1; L <= 100; L++) {
    const isBoss = L >= 3 && L % 3 === 0
    if (isBoss) {
      list.push({
        type: LevelObjectiveType.DEFEAT_BOSS,
        target: 1,
        description: `Defeat the Level ${L} boss`,
      })
      continue
    }
    const t = types[typeIdx % types.length]
    const u = typeIdx % 11 // unique within same type (0..10)
    typeIdx += 1
    let target
    let description
    switch (t) {
      case LevelObjectiveType.KILL_ENEMIES:
        target = Math.min(85, 3 + typeIdx)
        description = `Kill ${target} enemies this level`
        break
      case LevelObjectiveType.COLLECT_STARS:
        target = Math.min(200, 5 + typeIdx * 2)
        description = `Collect ${target} stars this level`
        break
      case LevelObjectiveType.COMBO:
        target = Math.min(25, 2 + u)
        description = `Achieve a ${target}x combo this level`
        break
      case LevelObjectiveType.SURVIVE:
        target = Math.min(120, 20 + typeIdx)
        description = `Survive ${target} seconds this level`
        break
      case LevelObjectiveType.ACCURACY:
        target = Math.min(95, 50 + u + (typeIdx % 5) * 9)
        description = `Maintain ${target}% accuracy this level`
        break
      case LevelObjectiveType.NO_DAMAGE:
        target = Math.min(45, 8 + u + (typeIdx % 3) * 4)
        description = `Avoid damage for ${target} seconds this level`
        break
      default:
        target = 5 + (typeIdx % 10)
        description = `Kill ${target} enemies this level`
    }
    list.push({ type: t, target, description })
  }
  return list
}

const LEVEL_OBJECTIVES = buildLevelObjectives()

export function getLevelObjective(level) {
  const L = Math.max(1, Math.min(100, Math.floor(level)))
  const obj = LEVEL_OBJECTIVES[L - 1]
  return obj ? { ...obj } : null
}

export function getAllLevelObjectives() {
  return LEVEL_OBJECTIVES.map((o) => ({ ...o }))
}
