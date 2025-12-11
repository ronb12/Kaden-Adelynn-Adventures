# Enemy Attack Formation System

## Overview

Enemy ships can now spawn and move in coordinated attack formations, making the game more challenging and visually interesting. Formations appear more frequently as waves progress.

## Formation Types

### 1. **V-Formation** (`v`)
- **Description**: Classic V-shaped attack pattern
- **Size**: 3 enemies (early waves) or 5 enemies (wave 3+)
- **Layout**: Leader at front, wingmen spread behind in V shape
- **Movement**: Leader can zigzag slightly; wingmen maintain relative positions

### 2. **Line Formation** (`line`)
- **Description**: Horizontal line of enemies
- **Size**: 3 enemies (early waves) or 5 enemies (wave 3+)
- **Layout**: All enemies at same Y position, spread horizontally
- **Movement**: Moves as a unit maintaining spacing

### 3. **Diamond Formation** (`diamond`)
- **Description**: Diamond-shaped pattern
- **Size**: Always 5 enemies
- **Layout**: One at top, one at bottom, one at center, one on each side
- **Movement**: Maintains diamond shape as it moves

### 4. **Circle Formation** (`circle`)
- **Description**: Circular pattern of enemies
- **Size**: 5 enemies (early waves) or 7 enemies (wave 4+)
- **Layout**: Enemies arranged in a circle around center point
- **Movement**: Maintains circular formation

### 5. **Arrow Formation** (`arrow`)
- **Description**: Arrow/chevron pointing forward
- **Size**: 4 enemies (early waves) or 6 enemies (wave 3+)
- **Layout**: Leader at front, others spread behind in arrow shape
- **Movement**: Maintains arrow shape

## Spawn Mechanics

### Formation Spawn Chance
- **Wave 1**: 10% chance
- **Wave 2**: 20% chance
- **Wave 3+**: 35% chance

### Formation Selection
- Randomly selected from available formation types
- Formation types unlock as waves progress
- All 5 formation types available from wave 2+

### Formation Positioning
- Formations spawn centered horizontally on screen
- Random X position within safe bounds (100px from edges)
- Start Y position: -50 (above screen)

## Formation Behavior

### Leader System
- First enemy in formation is the **leader**
- Leader uses normal movement patterns
- Other enemies maintain relative positions to leader

### Position Maintenance
- Wingmen calculate target position based on leader's position + offset
- Smooth movement toward formation position
- If leader is destroyed, wingmen continue normal movement

### Formation Properties
Each enemy in a formation has:
- `formationId`: Unique ID linking enemies in same formation
- `formationType`: Type of formation ('v', 'line', 'diamond', 'circle', 'arrow')
- `formationIndex`: Position in formation (0 = leader)
- `isFormationLeader`: Boolean indicating if this is the leader
- `formationOffsetX`: Horizontal offset from leader
- `formationOffsetY`: Vertical offset from leader

## Difficulty Scaling

Formations respect difficulty settings:
- **Enemy Speed**: Scales with difficulty (Easy 1x, Medium 1.5x, Hard 2x)
- **Enemy Health**: Same as individual enemies
- **Enemy Shooting**: Scales with difficulty (Easy 1%, Medium 1.5%, Hard 2%)

## Visual Impact

- Formations create more dynamic and challenging gameplay
- Players must adapt strategy to handle grouped enemies
- Formations can create "walls" of enemies that are harder to dodge
- More enemies on screen simultaneously increases difficulty

## Technical Details

### Formation Tracking
- `nextFormationId` counter in gameState ensures unique formation IDs
- Enemies grouped by `formationId` for coordinated movement
- Formation groups recalculated each frame

### Performance
- Formation logic is efficient (O(n) per frame)
- Maximum 50 enemies on screen (includes formation members)
- Formation calculations only run for enemies in formations

## Future Enhancements

Potential improvements:
- Formation-specific attack patterns (e.g., circle formation fires in all directions)
- Formation splitting (formation breaks apart when leader destroyed)
- More complex formations (e.g., double V, cross pattern)
- Formation-specific bonuses (e.g., shield when in formation)
