"""
Blender Character Pack Generator - Main Script
Generates 10 original 3D characters for iOS spaceship fighter game
Matches game character IDs: kaden, adelynn, hero3-hero10
"""

import bpy
import sys
import os
import argparse
import json
from typing import Dict, List
from mathutils import Vector

# Add utils to path
sys.path.append(os.path.dirname(__file__))
from utils import (
    clear_scene, create_stylized_humanoid_base, generate_original_helmet,
    generate_suit_part, generate_accessory, generate_original_rune_symbols,
    create_humanoid_rig, create_procedural_material, bake_textures,
    ensure_triangle_count, export_fbx, export_glb, setup_portrait_scene,
    render_portrait, filesystem_safe_name
)


# Character definitions with unique features
# Matching the 10 characters in the iOS game: kaden, adelynn, hero3-hero10
CHARACTER_DEFINITIONS = [
    {
        "name": "Kaden",
        "id": "kaden",
        "height": 1.75,
        "seed": 1001,
        "base_color": (0.0, 0.6, 1.0),  # Blue (matching game)
        "features": ["balanced_build", "angular_helmet"],
        "accessories": []
    },
    {
        "name": "Adelynn",
        "id": "adelynn",
        "height": 1.70,
        "seed": 1002,
        "base_color": (1.0, 0.4, 0.8),  # Pink (matching game)
        "features": ["rounded_helmet", "soft_glow_seams"],
        "accessories": []
    },
    {
        "name": "Orion",
        "id": "hero3",
        "height": 1.80,
        "seed": 1003,
        "base_color": (1.0, 0.84, 0.0),  # Gold/Yellow (matching game)
        "features": ["angular_chest_core", "color_shift_panels"],
        "accessories": []
    },
    {
        "name": "Lyra",
        "id": "hero4",
        "height": 1.72,
        "seed": 1004,
        "base_color": (0.2, 0.9, 0.3),  # Green (matching game)
        "features": ["split_visor_helmet", "hud_line_style"],
        "accessories": []
    },
    {
        "name": "Jax",
        "id": "hero5",
        "height": 1.50,
        "seed": 1005,
        "base_color": (0.4, 0.4, 0.4),  # Gray (matching game)
        "features": ["short_build", "oversized_gloves", "tank_armor"],
        "accessories": ["armor_plate", "armor_plate"]
    },
    {
        "name": "Vega",
        "id": "hero6",
        "height": 1.75,
        "seed": 1006,
        "base_color": (0.2, 0.6, 1.0),  # Blue (matching game)
        "features": ["balanced_build", "floating_shoulder_nodes"],
        "accessories": ["shoulder_node", "shoulder_node"]
    },
    {
        "name": "Kael",
        "id": "hero7",
        "height": 1.80,
        "seed": 1007,
        "base_color": (1.0, 0.65, 0.0),  # Orange (matching game)
        "features": ["angular_helmet", "heavy_armor"],
        "accessories": ["armor_plate"]
    },
    {
        "name": "Nova",
        "id": "hero8",
        "height": 1.68,
        "seed": 1008,
        "base_color": (0.5, 0.0, 1.0),  # Purple (matching game)
        "features": ["rounded_helmet", "energy_core"],
        "accessories": []
    },
    {
        "name": "Rio",
        "id": "hero9",
        "height": 1.75,
        "seed": 1009,
        "base_color": (0.2, 0.4, 1.0),  # Blue-Indigo (matching game)
        "features": ["backpack", "rotating_energy_rings"],
        "accessories": ["backpack", "energy_ring", "energy_ring"]
    },
    {
        "name": "Mira",
        "id": "hero10",
        "height": 1.72,
        "seed": 1010,
        "base_color": (1.0, 0.5, 0.2),  # Orange-Red (matching game)
        "features": ["rune_panel_lines", "layered_armor"],
        "accessories": ["armor_plate"]
    }
]


def generate_character(char_def: Dict, output_dir: str, bake_resolution: int, 
                      num_variants: int, shared_rig: bpy.types.Object) -> Dict:
    """Generate a single character with all exports and variants"""
    name = char_def["name"]
    char_id = char_def.get("id", filesystem_safe_name(name))
    safe_name = filesystem_safe_name(char_id)  # Use ID for folder name to match game
    char_dir = os.path.join(output_dir, safe_name)
    os.makedirs(char_dir, exist_ok=True)
    variants_dir = os.path.join(char_dir, "variants")
    os.makedirs(variants_dir, exist_ok=True)
    
    print(f"\n=== Generating {name} ===")
    
    # Clear scene but preserve the shared rig
    clear_scene(preserve_rig=shared_rig)
    
    # Create base mesh
    base = create_stylized_humanoid_base(safe_name, char_def["height"], char_def["seed"])
    
    # Generate helmet
    helmet = generate_original_helmet(safe_name, base, char_def["seed"] + 1)
    helmet.location = (0, 0, char_def["height"] * 0.85)
    
    # Generate suit parts
    chest = generate_suit_part(safe_name, "chest", (0.4, 0.3, 0.5), 
                               (0, 0, char_def["height"] * 0.5), char_def["seed"] + 2)
    
    left_arm = generate_suit_part(safe_name, "arm", (1, 1, 1), 
                                  (-0.25, 0, char_def["height"] * 0.6), char_def["seed"] + 3)
    right_arm = generate_suit_part(safe_name, "arm", (1, 1, 1), 
                                   (0.25, 0, char_def["height"] * 0.6), char_def["seed"] + 4)
    
    left_leg = generate_suit_part(safe_name, "leg", (1, 1, 1), 
                                  (-0.1, 0, char_def["height"] * 0.2), char_def["seed"] + 5)
    right_leg = generate_suit_part(safe_name, "leg", (1, 1, 1), 
                                   (0.1, 0, char_def["height"] * 0.2), char_def["seed"] + 6)
    
    # Handle special features
    if "oversized_gloves" in char_def["features"]:
        # Make gloves larger
        left_arm.scale = (1.3, 1.3, 1.3)
        right_arm.scale = (1.3, 1.3, 1.3)
    
    if "short_build" in char_def["features"]:
        # Scale down entire character
        for obj in [base, helmet, chest, left_arm, right_arm, left_leg, right_leg]:
            obj.scale = (0.9, 0.9, 0.85)
    
    if "tall_silhouette" in char_def["features"]:
        # Scale up
        for obj in [base, helmet, chest, left_arm, right_arm, left_leg, right_leg]:
            obj.scale = (1.1, 1.1, 1.15)
    
    # Generate accessories
    accessories = []
    for i, acc_type in enumerate(char_def.get("accessories", [])):
        acc = generate_accessory(safe_name, acc_type, char_def["seed"] + 10 + i)
        if acc:
            accessories.append(acc)
            # Position accessories
            if acc_type == "shoulder_node":
                acc.location = (-0.3 + i * 0.1, 0, char_def["height"] * 0.75)
            elif acc_type == "backpack":
                acc.location = (0, -0.15, char_def["height"] * 0.5)
            elif acc_type == "energy_ring":
                acc.location = (0, -0.15, char_def["height"] * 0.5 + i * 0.1)
                acc.rotation_euler = (1.57, 0, 0)  # Rotate for ring
            elif acc_type == "armor_plate":
                acc.location = (0, 0, char_def["height"] * 0.6 + i * 0.05)
    
    # Generate rune symbols if needed
    if "rune_panel_lines" in char_def["features"]:
        generate_original_rune_symbols(safe_name, chest, char_def["seed"] + 20)
    
    # Join all parts into single mesh
    bpy.ops.object.select_all(action='DESELECT')
    all_objects = [base, helmet, chest, left_arm, right_arm, left_leg, right_leg] + accessories
    for obj in all_objects:
        if obj:
            obj.select_set(True)
    bpy.context.view_layer.objects.active = base
    bpy.ops.object.join()
    
    character = bpy.context.active_object
    character.name = safe_name
    
    # Ensure triangle count
    triangle_count = ensure_triangle_count(character, min_tris=5000, max_tris=12000)
    print(f"  Triangle count: {triangle_count}")
    
    # Create and assign materials
    materials = []
    texture_paths = {}
    
    for variant in range(num_variants):
        mat = create_procedural_material(safe_name, char_def["base_color"], variant)
        materials.append(mat)
        character.data.materials.append(mat)
    
    # Try to bake textures (fallback to procedural if fails)
    if bake_resolution > 0:
        baked = bake_textures(character, char_dir, bake_resolution)
        if baked:
            texture_paths = baked
            print(f"  Textures baked: {list(baked.keys())}")
        else:
            print(f"  Baking failed, using procedural materials")
    
    # Duplicate rig for this character
    # Re-fetch shared_rig from data to avoid stale references
    if shared_rig.name not in bpy.data.objects:
        raise RuntimeError(f"Shared rig '{shared_rig.name}' not found in scene")
    
    rig_obj = bpy.data.objects[shared_rig.name]
    bpy.ops.object.select_all(action='DESELECT')
    rig_obj.select_set(True)
    bpy.context.view_layer.objects.active = rig_obj
    bpy.ops.object.duplicate()
    char_rig = bpy.context.active_object
    char_rig.name = f"{safe_name}_rig"
    char_rig.location = character.location
    
    # Parent character to rig (avoid circular parenting)
    bpy.context.view_layer.objects.active = character
    character.select_set(True)
    char_rig.select_set(True)
    bpy.context.view_layer.objects.active = char_rig
    bpy.ops.object.parent_set(type='ARMATURE', keep_transform=True)
    
    # Export main character
    export_paths = {}
    
    fbx_path = os.path.join(char_dir, f"{safe_name}.fbx")
    if export_fbx(character, fbx_path, char_rig):
        export_paths['fbx'] = fbx_path
        print(f"  Exported FBX: {fbx_path}")
    
    glb_path = os.path.join(char_dir, f"{safe_name}.glb")
    if export_glb(character, glb_path, char_rig):
        export_paths['glb'] = glb_path
        print(f"  Exported GLB: {glb_path}")
    
    # Export variants
    variant_paths = []
    for variant in range(num_variants):
        # Assign variant material
        character.data.materials.clear()
        character.data.materials.append(materials[variant])
        
        variant_glb = os.path.join(variants_dir, f"{safe_name}_variant{variant + 1}.glb")
        if export_glb(character, variant_glb, char_rig):
            variant_paths.append(variant_glb)
            print(f"  Exported variant {variant + 1}: {variant_glb}")
    
    # Render portrait
    setup_portrait_scene(character, resolution=1024)
    portrait_path = os.path.join(char_dir, f"{safe_name}_portrait.png")
    if render_portrait(portrait_path):
        print(f"  Rendered portrait: {portrait_path}")
        export_paths['portrait'] = portrait_path
    
    # Create manifest entry
    manifest = {
        "name": name,
        "id": char_id,
        "safe_name": safe_name,
        "triangle_count": triangle_count,
        "texture_paths": texture_paths,
        "export_paths": export_paths,
        "variant_paths": variant_paths,
        "features": char_def["features"]
    }
    
    return manifest


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Generate 3D character pack')
    parser.add_argument('--outdir', type=str, default='./export',
                       help='Output directory (default: ./export)')
    parser.add_argument('--engine', type=str, default='cycles',
                       choices=['cycles', 'eevee', 'eevee_next'],
                       help='Render engine (default: cycles)')
    parser.add_argument('--bake', type=int, default=1024,
                       help='Texture bake resolution (0 to disable, default: 1024)')
    parser.add_argument('--variants', type=int, default=3,
                       help='Number of color variants per character (default: 3)')
    
    # Parse arguments (handle Blender's -- separator)
    if '--' in sys.argv:
        args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
    else:
        args = parser.parse_args()
    
    output_dir = os.path.abspath(args.outdir)
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 60)
    print("3D Character Pack Generator")
    print("=" * 60)
    print(f"Output directory: {output_dir}")
    print(f"Render engine: {args.engine}")
    print(f"Bake resolution: {args.bake}")
    print(f"Color variants: {args.variants}")
    print("=" * 60)
    
    # Set render engine (Blender 4.5+ uses BLENDER_EEVEE_NEXT instead of EEVEE)
    engine_map = {
        'cycles': 'CYCLES',
        'eevee': 'BLENDER_EEVEE_NEXT',
        'eevee_next': 'BLENDER_EEVEE_NEXT'
    }
    bpy.context.scene.render.engine = engine_map.get(args.engine.lower(), 'CYCLES')
    
    # Create shared rig once
    print("\nCreating shared humanoid rig...")
    clear_scene()
    shared_rig = create_humanoid_rig("shared", height=1.75)
    
    # Save rig reference
    shared_dir = os.path.join(output_dir, "_shared")
    os.makedirs(shared_dir, exist_ok=True)
    rig_ref_path = os.path.join(shared_dir, "rig_reference.blend")
    bpy.ops.wm.save_as_mainfile(filepath=rig_ref_path)
    print(f"Saved rig reference: {rig_ref_path}")
    
    # Generate palette
    palette = {}
    for char_def in CHARACTER_DEFINITIONS:
        palette[char_def["name"]] = {
            "base_color": char_def["base_color"],
            "variants": []
        }
        for v in range(args.variants):
            color_variation = 0.1 * v
            variant_color = (
                min(1.0, char_def["base_color"][0] + color_variation),
                min(1.0, char_def["base_color"][1] + color_variation),
                min(1.0, char_def["base_color"][2] + color_variation)
            )
            palette[char_def["name"]]["variants"].append(variant_color)
    
    palette_path = os.path.join(shared_dir, "palette.json")
    with open(palette_path, 'w') as f:
        json.dump(palette, f, indent=2)
    print(f"Saved palette: {palette_path}")
    
    # Generate all characters
    manifests = []
    for char_def in CHARACTER_DEFINITIONS:
        try:
            manifest = generate_character(
                char_def, output_dir, args.bake, args.variants, shared_rig
            )
            manifests.append(manifest)
        except Exception as e:
            print(f"ERROR generating {char_def['name']}: {e}")
            import traceback
            traceback.print_exc()
    
    # Save master manifest
    master_manifest = {
        "version": "1.0",
        "characters": manifests,
        "total_characters": len(manifests),
        "settings": {
            "bake_resolution": args.bake,
            "num_variants": args.variants,
            "render_engine": args.engine
        }
    }
    
    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, 'w') as f:
        json.dump(master_manifest, f, indent=2)
    print(f"\nSaved master manifest: {manifest_path}")
    
    print("\n" + "=" * 60)
    print("Generation complete!")
    print(f"Generated {len(manifests)} characters")
    print("=" * 60)


if __name__ == "__main__":
    main()

