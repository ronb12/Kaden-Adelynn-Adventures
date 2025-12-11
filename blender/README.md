# Blender Boss Ship Generator

This directory contains scripts to create 3D boss ship designs in Blender and render them as 2D PNG images for the game.

## Requirements

- Blender 3.0 or later
- Python 3.x (comes with Blender)

## Usage

### Method 1: Run from Blender GUI

1. Open Blender
2. Switch to the **Scripting** workspace (top menu)
3. Click **File > Open** and select `create_boss_ships.py`
4. Click **Run Script** (play button) or press **Alt+P**
5. The boss ship images will be generated in `public/boss-ships/`

### Method 2: Run from Command Line

```bash
# On macOS/Linux
blender --background --python blender/create_boss_ships.py

# On Windows
blender.exe --background --python blender\create_boss_ships.py
```

## What It Creates

The script generates 4 boss ship designs:

1. **boss1.png** (150x150) - Asteroid King
   - Rocky, organic design
   - Brown/orange colors
   - For the "asteroid" boss type

2. **boss2.png** (180x180) - Alien Mothership
   - Organic, sleek design
   - Bright green with glow
   - For the "alien" boss type

3. **boss3.png** (200x200) - Mechanical Overlord
   - Angular, industrial design
   - Purple/magenta with metallic finish
   - For the "robot" boss type

4. **boss4.png** (220x220) - Space Dragon (optional)
   - Serpentine, elongated design
   - Red with fiery glow
   - For the "dragon" boss type

## Customizing Boss Designs

You can modify the functions in `create_boss_ships.py` to create custom designs:

- `create_boss1_asteroid_king()` - Modify for rocky/organic designs
- `create_boss2_alien_mothership()` - Modify for organic/alien designs
- `create_boss3_mechanical_overlord()` - Modify for mechanical/industrial designs
- `create_boss4_space_dragon()` - Modify for dragon/serpentine designs

### Tips for Customization

1. **Geometry**: Use Blender's mesh primitives (spheres, cubes, cylinders)
2. **Materials**: Adjust colors, metallic, roughness, and emission
3. **Size**: Boss ships are rendered at specific sizes (150-220px)
4. **Transparency**: Background is transparent (PNG with alpha)

## After Rendering

1. The PNG files will be in `public/boss-ships/`
2. Rebuild the project: `npm run build`
3. Deploy: `firebase deploy --only hosting`

## Advanced: Manual Editing in Blender

If you want to manually edit the designs:

1. Run the script once to create the base models
2. Save the `.blend` file
3. Edit the models in Blender's 3D Viewport
4. Re-render using the render function or Blender's render panel

## Troubleshooting

- **Script won't run**: Make sure you're using Blender 3.0+
- **Images not transparent**: Check that `film_transparent = True` is set
- **Boss too small/large**: Adjust the camera distance or boss scale
- **Colors look wrong**: Check material node settings
