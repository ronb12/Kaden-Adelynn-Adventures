"""
Blender script to create and render boss ship designs for Kaden & Adelynn Space Adventures
Run this script in Blender's Scripting workspace or via command line:
    blender --background --python create_boss_ships.py
"""

import bpy
import bmesh
from mathutils import Vector
import os

# Clear existing mesh objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Set up rendering
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
# Resolution will be set per-boss, but set defaults
scene.render.resolution_x = 512
scene.render.resolution_y = 512
scene.render.resolution_percentage = 100
scene.render.film_transparent = True  # Transparent background
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
# Use viewport denoising for faster renders
scene.cycles.use_denoising = True
scene.cycles.samples = 128  # Reduced for faster rendering

# Set up camera and lighting (will be repositioned for each boss)
bpy.ops.object.camera_add(location=(0, -8, 0), rotation=(1.5708, 0, 0))
camera = bpy.context.object
camera.data.type = 'ORTHO'
scene.camera = camera

# Add lights
bpy.ops.object.light_add(type='SUN', location=(5, -5, 10))
sun = bpy.context.object
sun.data.energy = 3

bpy.ops.object.light_add(type='AREA', location=(-3, -3, 5))
area = bpy.context.object
area.data.energy = 50
area.data.size = 5

def create_boss1_asteroid_king():
    """Create Asteroid King - rocky, organic, brown/orange"""
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, location=(0, 0, 0))
    boss = bpy.context.object
    boss.name = "AsteroidKing"
    
    # Enter edit mode and add detail
    bpy.context.view_layer.objects.active = boss
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Add some random deformation for rocky look
    bpy.ops.mesh.subdivide(number_cuts=1)
    # Use randomize operator for Blender 4.x
    bpy.ops.transform.vertex_random(offset=0.3, uniform=0.1, normal=0.1)
    
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Scale to appropriate size
    boss.scale = (1.5, 1.2, 1.0)
    
    # Add material - rocky brown
    mat = bpy.data.materials.new(name="AsteroidMaterial")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.55, 0.27, 0.07, 1.0)  # Brown
    bsdf.inputs["Roughness"].default_value = 0.9
    bsdf.inputs["Metallic"].default_value = 0.1
    boss.data.materials.append(mat)
    
    return boss

def create_boss2_alien_mothership():
    """Create Alien Mothership - organic, green, sleek"""
    # Main body - elongated teardrop
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(0, 0, 0))
    boss = bpy.context.object
    boss.name = "AlienMothership"
    
    bpy.context.view_layer.objects.active = boss
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.transform.resize(value=(1.2, 1.2, 0.8))
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Add tentacles/wings
    for i in range(4):
        angle = (i * 2 * 3.14159) / 4
        x = 1.5 * (1 if i % 2 == 0 else -1)
        z = 0.3 * (1 if i < 2 else -1)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=1.5, location=(x, 0, z))
        tentacle = bpy.context.object
        tentacle.rotation_euler = (0, angle, 0)
        tentacle.parent = boss
    
    # Material - alien green
    mat = bpy.data.materials.new(name="AlienMaterial")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.48, 1.0, 0.0, 1.0)  # Bright green
    # Blender 4.x uses Emission Color and Emission Strength
    if "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (0.2, 0.5, 0.0, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 0.5
    bsdf.inputs["Roughness"].default_value = 0.3
    boss.data.materials.append(mat)
    
    return boss

def create_boss3_mechanical_overlord():
    """Create Mechanical Overlord - angular, industrial, purple/magenta"""
    # Main hexagonal body
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=1.2, depth=0.8, location=(0, 0, 0))
    boss = bpy.context.object
    boss.name = "MechanicalOverlord"
    
    bpy.context.view_layer.objects.active = boss
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.extrude_region_move(TRANSFORM_OT_translate={"value": (0, 0, 0.3)})
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Add turrets
    for i in range(6):
        angle = (i * 2 * 3.14159) / 6
        x = 1.5 * (1 if i % 2 == 0 else -1)
        y = 1.5 * (1 if i < 3 else -1)
        bpy.ops.mesh.primitive_cube_add(size=0.4, location=(x * 0.7, y * 0.7, 0.5))
        turret = bpy.context.object
        turret.scale = (1, 1, 1.5)
        turret.parent = boss
    
    # Material - mechanical purple
    mat = bpy.data.materials.new(name="MechanicalMaterial")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (1.0, 0.0, 1.0, 1.0)  # Magenta
    bsdf.inputs["Metallic"].default_value = 0.8
    bsdf.inputs["Roughness"].default_value = 0.3
    # Blender 4.x uses Emission Color and Emission Strength
    if "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (0.5, 0.0, 0.5, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 0.3
    boss.data.materials.append(mat)
    
    return boss

def create_boss4_space_dragon():
    """Create Space Dragon - serpentine, elongated, red"""
    # Main body - elongated
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.8, location=(0, 0, 0))
    boss = bpy.context.object
    boss.name = "SpaceDragon"
    
    bpy.context.view_layer.objects.active = boss
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.transform.resize(value=(1.5, 0.6, 0.6))
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Add segments for serpentine look
    for i in range(3):
        offset = (i - 1) * 0.8
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.6, location=(offset, 0, 0))
        segment = bpy.context.object
        segment.scale = (0.8, 0.8, 0.8)
        segment.parent = boss
    
    # Add wings
    bpy.ops.mesh.primitive_plane_add(size=1.5, location=(0, 0.5, 0))
    wing1 = bpy.context.object
    wing1.rotation_euler = (1.57, 0, 0.3)
    wing1.parent = boss
    
    bpy.ops.mesh.primitive_plane_add(size=1.5, location=(0, -0.5, 0))
    wing2 = bpy.context.object
    wing2.rotation_euler = (1.57, 0, -0.3)
    wing2.parent = boss
    
    # Material - dragon red
    mat = bpy.data.materials.new(name="DragonMaterial")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (1.0, 0.0, 0.0, 1.0)  # Red
    # Blender 4.x uses Emission Color and Emission Strength
    if "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (0.8, 0.2, 0.0, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 0.6
    bsdf.inputs["Roughness"].default_value = 0.4
    boss.data.materials.append(mat)
    
    return boss

def render_boss(boss_name, output_path, size=(150, 150)):
    """Render a boss ship to PNG"""
    # Find the boss object
    boss = bpy.data.objects.get(boss_name)
    if not boss:
        print(f"Boss {boss_name} not found!")
        return
    
    # Calculate bounding box to frame the boss
    bbox_corners = [boss.matrix_world @ Vector(corner) for corner in boss.bound_box]
    min_x = min(corner.x for corner in bbox_corners)
    max_x = max(corner.x for corner in bbox_corners)
    min_y = min(corner.y for corner in bbox_corners)
    max_y = max(corner.y for corner in bbox_corners)
    min_z = min(corner.z for corner in bbox_corners)
    max_z = max(corner.z for corner in bbox_corners)
    
    # Include children in bounding box
    for child in boss.children:
        child_bbox = [child.matrix_world @ Vector(corner) for corner in child.bound_box]
        min_x = min(min_x, min(corner.x for corner in child_bbox))
        max_x = max(max_x, max(corner.x for corner in child_bbox))
        min_y = min(min_y, min(corner.y for corner in child_bbox))
        max_y = max(max_y, max(corner.y for corner in child_bbox))
        min_z = min(min_z, min(corner.z for corner in child_bbox))
        max_z = max(max_z, max(corner.z for corner in child_bbox))
    
    # Calculate center and size
    center_x = (min_x + max_x) / 2
    center_y = (min_y + max_y) / 2
    center_z = (min_z + max_z) / 2
    size_x = max_x - min_x
    size_y = max_y - min_y
    size_z = max_z - min_z
    max_size = max(size_x, size_y, size_z)
    
    # Position camera to frame the object
    # Camera looks along Y axis (from negative Y)
    distance = max_size * 2.5  # Adjust distance to fit
    camera.location = (center_x, center_y - distance, center_z)
    camera.rotation_euler = (1.5708, 0, 0)  # Look along Y axis
    
    # Set camera orthographic scale to fit
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = max_size * 1.5
    
    # Set render size (must be done before render)
    scene.render.resolution_x = size[0]
    scene.render.resolution_y = size[1]
    scene.render.resolution_percentage = 100
    # Ensure square pixels
    scene.render.pixel_aspect_x = 1.0
    scene.render.pixel_aspect_y = 1.0
    
    # Render using render context to ensure settings are applied
    scene.render.filepath = output_path
    # Use bpy.ops.render.render with explicit context
    override = bpy.context.copy()
    override['scene'] = scene
    bpy.ops.render.render(override, write_still=True)
    print(f"Rendered {boss_name} to {output_path} ({size[0]}x{size[1]})")

# Create output directory
output_dir = os.path.join(os.path.dirname(__file__), "..", "public", "boss-ships")
os.makedirs(output_dir, exist_ok=True)

# Create and render each boss
print("Creating boss ships...")

# Boss 1: Asteroid King (150x150)
boss1 = create_boss1_asteroid_king()
render_boss("AsteroidKing", os.path.join(output_dir, "boss1.png"), (150, 150))
# Delete all objects except camera and lights
for obj in list(bpy.data.objects):
    if obj.type not in ['CAMERA', 'LIGHT']:
        bpy.data.objects.remove(obj, do_unlink=True)

# Boss 2: Alien Mothership (180x180)
boss2 = create_boss2_alien_mothership()
render_boss("AlienMothership", os.path.join(output_dir, "boss2.png"), (180, 180))
# Delete all objects except camera and lights
for obj in list(bpy.data.objects):
    if obj.type not in ['CAMERA', 'LIGHT']:
        bpy.data.objects.remove(obj, do_unlink=True)

# Boss 3: Mechanical Overlord (200x200)
boss3 = create_boss3_mechanical_overlord()
render_boss("MechanicalOverlord", os.path.join(output_dir, "boss3.png"), (200, 200))
# Delete all objects except camera and lights
for obj in list(bpy.data.objects):
    if obj.type not in ['CAMERA', 'LIGHT']:
        bpy.data.objects.remove(obj, do_unlink=True)

# Boss 4: Space Dragon (220x220) - optional
boss4 = create_boss4_space_dragon()
render_boss("SpaceDragon", os.path.join(output_dir, "boss4.png"), (220, 220))

print("All boss ships created and rendered!")
