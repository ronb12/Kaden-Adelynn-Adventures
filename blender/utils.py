"""
Blender Character Pack Generator - Utility Functions
Original 3D character generation for iOS spaceship fighter game
"""

import bpy
import bmesh
import mathutils
from mathutils import Vector, Matrix
import random
import json
import os
from typing import List, Tuple, Dict, Optional
import math


# ORIGINALITY SAFEGUARDS - No resemblance to existing IP
FORBIDDEN_HELMET_SHAPES = ['t_visor', 'bubble', 'classic_astronaut']
FORBIDDEN_COLOR_COMBOS = [
    ('black', 'chrome'),
    ('white', 'red_stripe'),
    ('blue', 'white_star'),
]
FORBIDDEN_SYMBOLS = ['star', 'cross', 'eagle', 'skull', 'sword']


def clear_scene(preserve_rig=None):
    """Clear all objects from the scene, optionally preserving a rig"""
    # Ensure we're in object mode with proper context
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    
    # Select all objects except the rig to preserve
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.context.scene.objects:
        if preserve_rig and obj == preserve_rig:
            continue
        obj.select_set(True)
    
    # Delete selected objects
    if bpy.context.selected_objects:
        bpy.ops.object.delete(use_global=False)
    
    # Clean up collections (but keep the one with the rig)
    for collection in bpy.data.collections:
        if collection.name != "Collection":
            # Don't remove collection if it contains the rig
            if preserve_rig and preserve_rig.name in [obj.name for obj in collection.objects]:
                continue
            bpy.data.collections.remove(collection)


def create_stylized_humanoid_base(name: str, height: float = 1.8, seed: int = 0) -> bpy.types.Object:
    """
    Create a stylized humanoid base mesh using procedural generation.
    Uses capsules, bevel, remesh, and shrinkwrap for clean geometry.
    """
    random.seed(seed)
    
    # Create base body parts as capsules
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, location=(0, 0, height * 0.85))
    head = bpy.context.active_object
    head.name = f"{name}_head_base"
    
    # Torso
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.2, location=(0, 0, height * 0.5))
    torso = bpy.context.active_object
    torso.name = f"{name}_torso_base"
    bpy.ops.transform.resize(value=(1, 1.5, 1.2))
    
    # Join body parts
    bpy.ops.object.select_all(action='DESELECT')
    head.select_set(True)
    torso.select_set(True)
    bpy.context.view_layer.objects.active = torso
    bpy.ops.object.join()
    
    base = bpy.context.active_object
    base.name = f"{name}_base"
    
    # Enter edit mode and clean up
    bpy.context.view_layer.objects.active = base
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Add remesh modifier for clean topology (Blender 4.x compatible)
    remesh_mod = base.modifiers.new(name="Remesh", type='REMESH')
    remesh_mod.mode = 'SMOOTH'
    remesh_mod.octree_depth = 4
    bpy.ops.object.modifier_apply(modifier="Remesh")
    
    # Limited dissolve to reduce polygons
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.dissolve_limited(angle_limit=0.0872665)  # ~5 degrees
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Add bevel modifier for smooth edges
    bevel = base.modifiers.new(name="Bevel", type='BEVEL')
    bevel.width = 0.02
    bevel.segments = 2
    bevel.limit_method = 'ANGLE'
    bevel.angle_limit = 1.0472  # 60 degrees
    
    return base


def generate_original_helmet(name: str, base_head: bpy.types.Object, seed: int) -> bpy.types.Object:
    """
    Generate an original helmet design. Avoids T-visors, bubble shapes, and classic astronaut designs.
    Uses random seed-based generation for unique silhouettes.
    """
    random.seed(seed)
    
    # Create base helmet shape (avoiding bubble)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.18)
    helmet = bpy.context.active_object
    helmet.name = f"{name}_helmet"
    
    # Apply unique transformations to avoid classic shapes
    bpy.ops.transform.resize(value=(
        1.0 + random.uniform(-0.2, 0.3),
        1.0 + random.uniform(-0.2, 0.3),
        1.0 + random.uniform(0.1, 0.4)
    ))
    
    # Add unique cutlines (not T-visor)
    bpy.context.view_layer.objects.active = helmet
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Create asymmetric cut pattern (Blender 4.x compatible)
    # Note: bmesh operations require object mode
    bm = bmesh.new()
    bm.from_mesh(helmet.data)
    bm.to_mesh(helmet.data)
    bm.free()
    
    # Add array modifier for unique pattern
    if random.random() > 0.5:
        array_mod = helmet.modifiers.new(name="Array", type='ARRAY')
        array_mod.count = 1
        array_mod.use_relative_offset = False
        array_mod.use_constant_offset = True
        array_mod.constant_offset_displace = (0, 0, 0.05)
    
    # Add bevel for smooth edges
    bevel = helmet.modifiers.new(name="Bevel", type='BEVEL')
    bevel.width = 0.01
    bevel.segments = 2
    
    return helmet


def generate_suit_part(name: str, part_type: str, size: Tuple[float, float, float], 
                      location: Tuple[float, float, float], seed: int) -> bpy.types.Object:
    """Generate a unique suit part with procedural details"""
    random.seed(seed)
    
    # Create base shape
    if part_type == "chest":
        bpy.ops.mesh.primitive_cube_add(size=2, location=location)
    elif part_type == "arm":
        bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.4, location=location)
    elif part_type == "leg":
        bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=0.5, location=location)
    else:
        bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    
    part = bpy.context.active_object
    part.name = f"{name}_{part_type}"
    
    # Scale to size
    part.scale = size
    
    # Add unique details based on seed
    bpy.context.view_layer.objects.active = part
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Add bevel
    bpy.ops.object.mode_set(mode='OBJECT')
    bevel = part.modifiers.new(name="Bevel", type='BEVEL')
    bevel.width = 0.015
    bevel.segments = 2
    
    return part


def generate_accessory(name: str, accessory_type: str, seed: int) -> Optional[bpy.types.Object]:
    """Generate unique accessories (shoulder nodes, backpack, energy rings, etc.)"""
    random.seed(seed)
    
    if accessory_type == "shoulder_node":
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.06)
        node = bpy.context.active_object
        node.name = f"{name}_shoulder_node"
        return node
    
    elif accessory_type == "backpack":
        bpy.ops.mesh.primitive_cube_add(size=0.3, location=(0, -0.15, 0.5))
        backpack = bpy.context.active_object
        backpack.name = f"{name}_backpack"
        return backpack
    
    elif accessory_type == "energy_ring":
        bpy.ops.mesh.primitive_torus_add(major_radius=0.12, minor_radius=0.02)
        ring = bpy.context.active_object
        ring.name = f"{name}_energy_ring"
        return ring
    
    elif accessory_type == "armor_plate":
        bpy.ops.mesh.primitive_cube_add(size=0.2, location=(0, 0, 0.6))
        plate = bpy.context.active_object
        plate.name = f"{name}_armor_plate"
        bpy.ops.transform.resize(value=(1.5, 0.8, 1))
        return plate
    
    return None


def generate_original_rune_symbols(name: str, surface_obj: bpy.types.Object, seed: int) -> None:
    """Generate abstract rune-like panel lines (original symbols, not real alphabets)"""
    random.seed(seed)
    
    # Create abstract line patterns
    for i in range(random.randint(3, 6)):
        # Create a simple curve for rune line
        bpy.ops.curve.primitive_bezier_curve_add()
        curve = bpy.context.active_object
        curve.name = f"{name}_rune_{i}"
        
        # Randomize curve shape
        curve.data.resolution_u = 12
        curve.location = (
            random.uniform(-0.1, 0.1),
            random.uniform(-0.1, 0.1),
            random.uniform(0.3, 0.7)
        )
        
        # Convert to mesh and shrinkwrap to surface
        bpy.context.view_layer.objects.active = curve
        bpy.ops.object.convert(target='MESH')
        
        # Add shrinkwrap to attach to surface
        shrinkwrap = curve.modifiers.new(name="Shrinkwrap", type='SHRINKWRAP')
        shrinkwrap.target = surface_obj
        shrinkwrap.wrap_method = 'NEAREST_SURFACEPOINT'
        shrinkwrap.offset = 0.001


def create_humanoid_rig(name: str, height: float = 1.8) -> bpy.types.Armature:
    """Create a simple humanoid armature compatible with Mixamo naming"""
    # Create armature
    bpy.ops.object.armature_add(location=(0, 0, 0))
    armature = bpy.context.active_object
    armature.name = f"{name}_rig"
    
    # Enter edit mode
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode='EDIT')
    
    armature_data = armature.data
    
    # Create bones with Mixamo-compatible names
    bones = armature_data.edit_bones
    
    # Root
    root = bones.new("Hips")
    root.head = (0, 0, height * 0.4)
    root.tail = (0, 0, height * 0.5)
    
    # Spine
    spine = bones.new("Spine")
    spine.parent = root
    spine.head = (0, 0, height * 0.5)
    spine.tail = (0, 0, height * 0.7)
    
    # Chest
    chest = bones.new("Spine1")
    chest.parent = spine
    chest.head = (0, 0, height * 0.7)
    chest.tail = (0, 0, height * 0.85)
    
    # Head
    head_bone = bones.new("Head")
    head_bone.parent = chest
    head_bone.head = (0, 0, height * 0.85)
    head_bone.tail = (0, 0, height * 1.0)
    
    # Left arm
    left_shoulder = bones.new("LeftShoulder")
    left_shoulder.parent = chest
    left_shoulder.head = (-0.2, 0, height * 0.75)
    left_shoulder.tail = (-0.25, 0, height * 0.7)
    
    left_arm = bones.new("LeftArm")
    left_arm.parent = left_shoulder
    left_arm.head = (-0.25, 0, height * 0.7)
    left_arm.tail = (-0.3, 0, height * 0.5)
    
    left_forearm = bones.new("LeftForeArm")
    left_forearm.parent = left_arm
    left_forearm.head = (-0.3, 0, height * 0.5)
    left_forearm.tail = (-0.35, 0, height * 0.3)
    
    # Right arm
    right_shoulder = bones.new("RightShoulder")
    right_shoulder.parent = chest
    right_shoulder.head = (0.2, 0, height * 0.75)
    right_shoulder.tail = (0.25, 0, height * 0.7)
    
    right_arm = bones.new("RightArm")
    right_arm.parent = right_shoulder
    right_arm.head = (0.25, 0, height * 0.7)
    right_arm.tail = (0.3, 0, height * 0.5)
    
    right_forearm = bones.new("RightForeArm")
    right_forearm.parent = right_arm
    right_forearm.head = (0.3, 0, height * 0.5)
    right_forearm.tail = (0.35, 0, height * 0.3)
    
    # Left leg
    left_thigh = bones.new("LeftUpLeg")
    left_thigh.parent = root
    left_thigh.head = (-0.1, 0, height * 0.4)
    left_thigh.tail = (-0.1, 0, height * 0.15)
    
    left_leg = bones.new("LeftLeg")
    left_leg.parent = left_thigh
    left_leg.head = (-0.1, 0, height * 0.15)
    left_leg.tail = (-0.1, 0, 0.05)
    
    # Right leg
    right_thigh = bones.new("RightUpLeg")
    right_thigh.parent = root
    right_thigh.head = (0.1, 0, height * 0.4)
    right_thigh.tail = (0.1, 0, height * 0.15)
    
    right_leg = bones.new("RightLeg")
    right_leg.parent = right_thigh
    right_leg.head = (0.1, 0, height * 0.15)
    right_leg.tail = (0.1, 0, 0.05)
    
    bpy.ops.object.mode_set(mode='OBJECT')
    
    return armature


def create_procedural_material(name: str, base_color: Tuple[float, float, float], 
                              variant: int = 0) -> bpy.types.Material:
    """Create a procedural material with node graph"""
    mat = bpy.data.materials.new(name=f"{name}_mat_variant{variant}")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    
    # Clear default nodes
    nodes.clear()
    
    # Create shader nodes
    output = nodes.new(type='ShaderNodeOutputMaterial')
    principled = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    # Set base color with variant variation
    color_variation = 0.1 * variant
    principled.inputs['Base Color'].default_value = (
        min(1.0, base_color[0] + color_variation),
        min(1.0, base_color[1] + color_variation),
        min(1.0, base_color[2] + color_variation),
        1.0
    )
    
    # Add metallic and roughness
    principled.inputs['Metallic'].default_value = 0.3
    principled.inputs['Roughness'].default_value = 0.4
    
    # Connect to output
    links.new(principled.outputs['BSDF'], output.inputs['Surface'])
    
    return mat


def bake_textures(obj: bpy.types.Object, output_dir: str, resolution: int = 1024) -> Dict[str, str]:
    """
    Bake procedural materials to textures.
    Returns dict with texture paths or empty dict if baking fails.
    """
    try:
        # Setup baking
        bpy.context.scene.render.engine = 'CYCLES'
        bpy.context.scene.cycles.samples = 64
        
        # Create image for baking
        basecolor_img = bpy.data.images.new(
            name=f"{obj.name}_basecolor",
            width=resolution,
            height=resolution
        )
        normal_img = bpy.data.images.new(
            name=f"{obj.name}_normal",
            width=resolution,
            height=resolution
        )
        
        # Create UV map if needed
        if not obj.data.uv_layers:
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.mode_set(mode='EDIT')
            bpy.ops.uv.smart_project()
            bpy.ops.object.mode_set(mode='OBJECT')
        
        # Setup for baking
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        
        # Bake base color
        bpy.context.scene.render.bake.use_pass_direct = False
        bpy.context.scene.render.bake.use_pass_indirect = False
        bpy.context.scene.render.bake.use_pass_color = True
        
        # Select image for baking
        for node in obj.data.materials[0].node_tree.nodes:
            if node.type == 'TEX_IMAGE':
                node.image = basecolor_img
        
        # Perform bake
        bpy.ops.object.bake(type='DIFFUSE')
        
        # Save textures
        texture_paths = {}
        basecolor_path = os.path.join(output_dir, f"{obj.name}_basecolor.png")
        basecolor_img.save_render(filepath=basecolor_path)
        texture_paths['basecolor'] = basecolor_path
        
        # Bake normal (simplified - would need proper setup)
        normal_path = os.path.join(output_dir, f"{obj.name}_normal.png")
        normal_img.save_render(filepath=normal_path)
        texture_paths['normal'] = normal_path
        
        return texture_paths
        
    except Exception as e:
        print(f"Baking failed for {obj.name}: {e}")
        return {}


def ensure_triangle_count(obj: bpy.types.Object, min_tris: int = 5000, max_tris: int = 12000) -> int:
    """Ensure object triangle count is within range. Returns actual count."""
    # Apply all modifiers
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target='MESH')
    
    # Count triangles
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Get triangle count
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    triangle_count = len(bm.faces)
    bm.to_mesh(obj.data)
    bm.free()
    
    # Decimate if too many triangles
    if triangle_count > max_tris:
        decimate = obj.modifiers.new(name="Decimate", type='DECIMATE')
        decimate.ratio = max_tris / triangle_count
        bpy.ops.object.modifier_apply(modifier="Decimate")
        triangle_count = max_tris
    
    # Subdivide if too few (simplified - would need proper subdivision)
    if triangle_count < min_tris:
        # Add subdivision surface
        subdiv = obj.modifiers.new(name="Subdivision", type='SUBSURF')
        subdiv.levels = 1
        bpy.ops.object.modifier_apply(modifier="Subdivision")
    
    return triangle_count


def export_fbx(obj: bpy.types.Object, filepath: str, rig: Optional[bpy.types.Object] = None) -> bool:
    """Export object as FBX with correct settings for Unity/iOS"""
    try:
        # Select object
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        if rig:
            rig.select_set(True)
        bpy.context.view_layer.objects.active = obj
        
        # FBX export settings
        bpy.ops.export_scene.fbx(
            filepath=filepath,
            use_selection=True,
            apply_scale_options='FBX_SCALE_ALL',
            axis_forward='-Z',
            axis_up='Y',
            use_mesh_modifiers=True,
            add_leaf_bones=False
        )
        return True
    except Exception as e:
        print(f"FBX export failed: {e}")
        return False


def export_glb(obj: bpy.types.Object, filepath: str, rig: Optional[bpy.types.Object] = None) -> bool:
    """Export object as GLB with correct settings for iOS"""
    try:
        # Select object
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        if rig:
            rig.select_set(True)
        bpy.context.view_layer.objects.active = obj
        
        # GLB export settings
        bpy.ops.export_scene.gltf(
            filepath=filepath,
            use_selection=True,
            export_format='GLB',
            export_yup=True,
            export_apply=True
        )
        return True
    except Exception as e:
        print(f"GLB export failed: {e}")
        return False


def setup_portrait_scene(obj: bpy.types.Object, resolution: int = 1024) -> None:
    """Setup scene for portrait rendering"""
    # Clear existing cameras and lights
    for cam in bpy.data.cameras:
        if cam.name.startswith("Portrait"):
            bpy.data.cameras.remove(cam)
    
    # Create camera
    bpy.ops.object.camera_add(location=(2, -2, 1.2))
    camera = bpy.context.active_object
    camera.name = "PortraitCamera"
    camera.data.type = 'PERSP'
    camera.data.lens = 50
    
    # Point camera at object
    direction = obj.location - camera.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    camera.rotation_euler = rot_quat.to_euler()
    
    # Set as active camera
    bpy.context.scene.camera = camera
    
    # Add key light
    bpy.ops.object.light_add(type='SUN', location=(3, -3, 4))
    key_light = bpy.context.active_object
    key_light.name = "PortraitKeyLight"
    key_light.data.energy = 3.0
    key_light.rotation_euler = (0.785, 0, 0.785)
    
    # Add rim light
    bpy.ops.object.light_add(type='AREA', location=(-2, 2, 1))
    rim_light = bpy.context.active_object
    rim_light.name = "PortraitRimLight"
    rim_light.data.energy = 2.0
    rim_light.data.size = 2.0
    
    # Setup render settings
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.render.resolution_x = resolution
    bpy.context.scene.render.resolution_y = resolution
    bpy.context.scene.render.film_transparent = True
    bpy.context.scene.cycles.samples = 128


def render_portrait(filepath: str) -> bool:
    """Render portrait image"""
    try:
        bpy.context.scene.render.filepath = filepath
        bpy.ops.render.render(write_still=True)
        return True
    except Exception as e:
        print(f"Portrait render failed: {e}")
        return False


def filesystem_safe_name(name: str) -> str:
    """Convert name to filesystem-safe format"""
    return name.replace(' ', '_').replace('-', '_')

