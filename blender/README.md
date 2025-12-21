# 3D Character Pack Generator

Automated Blender script system to generate 10 original 3D characters for iOS spaceship fighter game.
Matches game character IDs: kaden, adelynn, hero3-hero10

## Features

- **10 Original Characters**: Kaden, Adelynn, Orion, Lyra, Jax, Vega, Kael, Nova, Rio, Mira (matching iOS game character IDs)
- **Procedural Generation**: All characters generated from code, not hand-modeled
- **Mobile Optimized**: 5k-12k triangles per character
- **Multiple Exports**: FBX and GLB formats
- **Color Variants**: 3 material variants per character
- **Texture Baking**: Procedural materials baked to 1024x1024 textures (basecolor + normal)
- **Portrait Renders**: 1024x1024 PNG portraits for UI
- **Shared Rig**: Mixamo-compatible humanoid armature
- **Originality Safeguards**: No resemblance to existing IP

## Requirements

- **Blender 4.0+** (tested with 4.0+)
- **Python 3.10+** (included with Blender)
- **Cycles Render Engine** (for texture baking and portrait rendering)

## Installation

1. Ensure Blender 4.x is installed and accessible from command line
2. Place the `blender/` folder in your project root
3. Create an `export/` folder (or specify custom path)

## Usage

### Step 1: Generate Characters

From your project root directory:

```bash
blender -b -P blender/generate_pack.py -- --outdir ./export --bake 1024 --variants 3
```

This generates 10 characters matching your iOS game IDs: kaden, adelynn, hero3-hero10

### Step 2: Integrate Portraits into iOS App

After generation, run the integration script to copy portraits to iOS assets:

```bash
cd blender
./integrate_portraits.sh
```

This will:
- Copy all character portraits to `Assets.xcassets`
- Create proper image sets for each character
- Set up Contents.json files

### Step 3: Update iOS Code

Update `CharacterGraphics.swift` to use the portrait images:

```swift
// Instead of procedural generation, use:
if let image = UIImage(named: "\(characterId)_character") {
    let texture = SKTexture(image: image)
    let sprite = SKSpriteNode(texture: texture)
    sprite.size = finalSize
    character.addChild(sprite)
}
```

### Command Line Arguments

- `--outdir <path>`: Output directory (default: `./export`)
- `--engine <cycles|eevee>`: Render engine (default: `cycles`)
- `--bake <resolution>`: Texture bake resolution, 0 to disable (default: `1024`)
- `--variants <number>`: Number of color variants per character (default: `3`)

### Examples

**Generate with default settings:**
```bash
blender -b -P blender/generate_pack.py -- --outdir ./export
```

**Generate without texture baking (faster):**
```bash
blender -b -P blender/generate_pack.py -- --outdir ./export --bake 0
```

**Generate with 5 color variants:**
```bash
blender -b -P blender/generate_pack.py -- --outdir ./export --variants 5
```

**Use Eevee render engine:**
```bash
blender -b -P blender/generate_pack.py -- --outdir ./export --engine eevee
```

## Output Structure

```
export/
├── manifest.json                    # Master manifest with all metadata
├── _shared/
│   ├── rig_reference.blend         # Shared humanoid rig
│   └── palette.json                # Color palette definitions
├── kaden/
│   ├── kaden.fbx                   # FBX export
│   ├── kaden.glb                   # GLB export
│   ├── kaden_portrait.png          # Portrait render
│   ├── kaden_basecolor.png         # Baked basecolor texture
│   ├── kaden_normal.png            # Baked normal texture
│   └── variants/
│       ├── kaden_variant1.glb
│       ├── kaden_variant2.glb
│       └── kaden_variant3.glb
├── adelynn/
│   └── ... (same structure)
├── hero3/  # Orion
├── hero4/  # Lyra
├── hero5/  # Jax
├── hero6/  # Vega
├── hero7/  # Kael
├── hero8/  # Nova
├── hero9/  # Rio
└── hero10/ # Mira
```

## Character Features

Each character has unique design features matching the iOS game:

1. **Kaden** (kaden): Balanced build, angular helmet, blue suit
2. **Adelynn** (adelynn): Rounded helmet, soft glow seams, pink suit
3. **Orion** (hero3): Angular chest core, color-shift panels, gold/yellow suit
4. **Lyra** (hero4): Split-visor helmet, HUD line style, green suit
5. **Jax** (hero5): Short build, oversized gloves, tank armor, gray suit
6. **Vega** (hero6): Balanced build, floating shoulder nodes, blue suit
7. **Kael** (hero7): Angular helmet, heavy armor, orange suit
8. **Nova** (hero8): Rounded helmet, energy core, purple suit
9. **Rio** (hero9): Backpack with rotating energy rings, blue-indigo suit
10. **Mira** (hero10): Rune panel lines, layered armor, orange-red suit

## iOS Integration

### Using GLB in SceneKit

```swift
import SceneKit

let scene = SCNScene(named: "kaden.glb")
let characterNode = scene?.rootNode.childNodes.first
```

### Using GLB in RealityKit

```swift
import RealityKit

let characterEntity = try? Entity.load(named: "kaden.glb")
```

### Replacing Current 2D Characters

The generated portrait PNGs can be used to replace the current programmatic 2D characters:

1. Export portraits from Blender (1024x1024 PNG)
2. Add to iOS Assets.xcassets as character images
3. Update `CharacterGraphics.swift` to use the portrait images instead of procedural generation

### Using FBX in Unity

1. Import FBX into Unity project
2. Configure import settings for mobile
3. Use in game scene

## Troubleshooting

### "Cycles not available"

**Solution**: Install Blender with Cycles addon enabled, or use `--engine eevee` flag.

### "Baking failed"

**Solution**: 
- Check that Cycles is available
- Try reducing bake resolution: `--bake 512`
- Disable baking: `--bake 0` (uses procedural materials)

### "Permission denied" errors

**Solution**: 
- Check write permissions for export directory
- Run with appropriate permissions
- Ensure export directory exists

### "Triangle count too high/low"

**Solution**: The script automatically decimates or subdivides to fit 5k-12k range. If issues persist, check Blender version compatibility.

### "Export failed"

**Solution**:
- Ensure Blender has FBX/GLB export addons enabled
- Check file paths don't contain invalid characters
- Verify sufficient disk space

## Optimization Tips

1. **For Mobile**: Use GLB format (smaller file size)
2. **Texture Resolution**: Lower bake resolution (512) for faster generation
3. **Triangle Count**: Script automatically optimizes, but you can adjust min/max in `utils.py`
4. **Variants**: Generate fewer variants if storage is a concern

## Originality Safeguards

The script includes safeguards to ensure original designs:

- ✅ No T-visor helmets
- ✅ No classic astronaut bubble helmets
- ✅ No military rank insignia
- ✅ No recognizable symbols (stars, crosses, etc.)
- ✅ Random seed-based generation for unique shapes
- ✅ Abstract geometric designs only

## Customization

### Adding New Characters

Edit `CHARACTER_DEFINITIONS` in `generate_pack.py`:

```python
{
    "name": "Your Character",
    "height": 1.75,
    "seed": 2001,
    "base_color": (0.5, 0.5, 0.5),
    "features": ["your_feature"],
    "accessories": ["accessory_type"]
}
```

### Modifying Materials

Edit `create_procedural_material()` in `utils.py` to change material properties.

### Changing Triangle Limits

Edit `ensure_triangle_count()` in `utils.py` to adjust min/max triangle counts.

## License

Free for personal and commercial use. No credit required.

## Support

For issues or questions:
1. Check troubleshooting section
2. Verify Blender version (4.0+)
3. Check console output for error messages
4. Ensure all dependencies are installed

## Notes

- Generation time: ~6-12 minutes for all 10 characters (depending on hardware)
- File sizes: ~500KB-2MB per character (GLB format)
- Textures: ~1-2MB per character (if baked)
- Total export size: ~60-120MB for complete pack
- Character IDs match iOS game: kaden, adelynn, hero3-hero10
