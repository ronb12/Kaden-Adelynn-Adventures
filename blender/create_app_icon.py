"""
Blender script to create an app icon for Kaden & Adelynn Space Adventures
- Blue triangle spaceship
- Full game name on icon
- Black background
- Rendered as 1024x1024 PNG (app icon standard)

Run in Blender:
  blender --background --python create_app_icon.py
"""

import bpy
import bmesh
from mathutils import Vector
import os

# Clear existing mesh objects
def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for block in bpy.data.lights:
        bpy.data.lights.remove(block)
    for block in bpy.data.cameras:
        bpy.data.cameras.remove(block)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block)

clear_scene()

# Set up rendering
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
# Set background to black
scene.world.use_nodes = True
bg_nodes = scene.world.node_tree.nodes
bg_nodes.clear()
bg_output = bg_nodes.new(type='ShaderNodeOutputWorld')
bg_background = bg_nodes.new(type='ShaderNodeBackground')
bg_background.inputs[0].default_value = (0, 0, 0, 1)
scene.world.node_tree.links.new(bg_background.outputs[0], bg_output.inputs[0])
scene.cycles.samples = 256


# Blue gradient background using shader nodes
scene.world.use_nodes = True
nt = scene.world.node_tree
nt.nodes.clear()
bg = nt.nodes.new('ShaderNodeBackground')
output = nt.nodes.new('ShaderNodeOutputWorld')
grad = nt.nodes.new('ShaderNodeTexGradient')
coord = nt.nodes.new('ShaderNodeTexCoord')
colramp = nt.nodes.new('ShaderNodeValToRGB')
colramp.color_ramp.elements[0].color = (0.05, 0.1, 0.3, 1)
colramp.color_ramp.elements[1].color = (0.1, 0.4, 1.0, 1)
nt.links.new(coord.outputs['Generated'], grad.inputs['Vector'])
nt.links.new(grad.outputs['Color'], colramp.inputs['Fac'])
nt.links.new(colramp.outputs['Color'], bg.inputs['Color'])
nt.links.new(bg.outputs['Background'], output.inputs['Surface'])

# Camera
bpy.ops.object.camera_add(location=(0, -6, 0), rotation=(1.5708, 0, 0))
camera = bpy.context.object
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 4
scene.camera = camera

# Lighting
bpy.ops.object.light_add(type='AREA', location=(0, -2, 4))
light = bpy.context.object
light.data.energy = 1000
light.data.size = 4


# Create blue triangle spaceship (equilateral triangle, extruded)
mesh = bpy.data.meshes.new('TriangleShip')
obj = bpy.data.objects.new('TriangleShip', mesh)
bpy.context.collection.objects.link(obj)
verts = [
    (0, 0, 1.2),   # Top
    (-1, 0, -1),    # Bottom left
    (1, 0, -1)      # Bottom right
]
faces = [(0, 1, 2)]
mesh.from_pydata(verts, [], faces)
mesh.update()

# Extrude for 3D effect
bpy.context.view_layer.objects.active = obj
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(mesh)
bmesh.ops.extrude_face_region(bm, geom=bm.faces)
bmesh.ops.translate(bm, verts=[v for v in bm.verts if v.co.y == 0], vec=Vector((0, 0.3, 0)))
bmesh.update_edit_mesh(mesh)
bpy.ops.object.mode_set(mode='OBJECT')
# Ship body (blue)
mat = bpy.data.materials.new(name='BlueMat')
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links
bsdf = nodes['Principled BSDF']
bsdf.inputs['Base Color'].default_value = (0.1, 0.4, 1.0, 1)
bsdf.inputs['Roughness'].default_value = 0.2
obj.data.materials.append(mat)

# Add cockpit dome (glass sphere near top center)
# Cockpit dome (contrasting color, larger, more forward)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.32, location=(0, 0.38, 0.82), segments=32, ring_count=16)
cockpit = bpy.context.object
cockpit_mat = bpy.data.materials.new(name='CockpitMat')
cockpit_mat.use_nodes = True
nodes = cockpit_mat.node_tree.nodes
links = cockpit_mat.node_tree.links
for n in nodes:
    nodes.remove(n)
# Cockpit dome (solid, centered, visible)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.23, location=(0, 0.15, 0.45), segments=32, ring_count=16)
cockpit = bpy.context.object
cockpit_mat = bpy.data.materials.new(name='CockpitMat')
cockpit_mat.use_nodes = True
nodes = cockpit_mat.node_tree.nodes
links = cockpit_mat.node_tree.links
bsdf = nodes['Principled BSDF']
bsdf.inputs['Base Color'].default_value = (0.98, 0.95, 0.2, 1)  # Bright yellow/gold
bsdf.inputs['Roughness'].default_value = 0.18
cockpit.data.materials.append(cockpit_mat)


# Add engines (cylinders with blue flame cones at base corners)
engine_positions = [(-0.7, 0.15, -1.1), (0.7, 0.15, -1.1), (0, -0.05, -1.05)]
for i, pos in enumerate(engine_positions):
    # Engine body (dark cylinder)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.09, depth=0.22, location=(pos[0], pos[1], pos[2]))
    engine = bpy.context.object
    engine_mat = bpy.data.materials.new(name=f'EngineMat{i}')
    engine_mat.use_nodes = True
    nodes = engine_mat.node_tree.nodes
    links = engine_mat.node_tree.links
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (0.08, 0.12, 0.18, 1)
    bsdf.inputs['Roughness'].default_value = 0.5
    engine.data.materials.append(engine_mat)
    # Engine flame (blue cone)
    bpy.ops.mesh.primitive_cone_add(radius1=0.07, radius2=0.01, depth=0.32, location=(pos[0], pos[1]-0.18, pos[2]-0.18))
    flame = bpy.context.object
    flame_mat = bpy.data.materials.new(name=f'FlameMat{i}')
    flame_mat.use_nodes = True
    nodes = flame_mat.node_tree.nodes
    links = flame_mat.node_tree.links
    emission = nodes.new('ShaderNodeEmission')
    emission.inputs['Color'].default_value = (0.2, 0.7, 1.0, 1)
    emission.inputs['Strength'].default_value = 18.0
    links.new(emission.outputs['Emission'], nodes['Material Output'].inputs['Surface'])
    flame.data.materials.append(flame_mat)

# Add cockpit highlight (small white sphere inside dome)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, location=(0, 0.55, 1.01), segments=16, ring_count=10)
highlight = bpy.context.object
highlight_mat = bpy.data.materials.new(name='HighlightMat')
highlight_mat.use_nodes = True
nodes = highlight_mat.node_tree.nodes
links = highlight_mat.node_tree.links
emission = nodes.new('ShaderNodeEmission')
emission.inputs['Color'].default_value = (1, 1, 1, 1)
emission.inputs['Strength'].default_value = 5.0
links.new(emission.outputs['Emission'], nodes['Material Output'].inputs['Surface'])
highlight.data.materials.append(highlight_mat)



# Blue material with strong emission and blue glow
mat = bpy.data.materials.new(name='BlueMat')
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links
bsdf = nodes['Principled BSDF']
bsdf.inputs['Base Color'].default_value = (0.1, 0.4, 1.0, 1)
bsdf.inputs['Roughness'].default_value = 0.2
emission = nodes.new('ShaderNodeEmission')
emission.inputs['Color'].default_value = (0.2, 0.6, 1.0, 1)
emission.inputs['Strength'].default_value = 4.0
glow = nodes.new('ShaderNodeEmission')
glow.inputs['Color'].default_value = (0.1, 0.4, 1.0, 1)
glow.inputs['Strength'].default_value = 10.0
mix = nodes.new('ShaderNodeAddShader')
links.new(bsdf.outputs['BSDF'], mix.inputs[0])
links.new(emission.outputs['Emission'], mix.inputs[1])
links.new(mix.outputs[0], nodes['Material Output'].inputs['Surface'])
obj.data.materials.append(mat)





# Add short game name text (minimal, centered, large)
bpy.ops.object.text_add(location=(0, 0, -2.8), rotation=(0, 0, 0))
text_obj = bpy.context.object
text_obj.data.body = "K&A"
text_obj.data.align_x = 'CENTER'
text_obj.data.size = 1.0
text_obj.data.extrude = 0.18
text_obj.data.bevel_depth = 0.06
text_obj.data.bevel_resolution = 4

# Try to use Arial or fallback to Blender default
import sys
import platform
font_loaded = False
font_paths = []
if platform.system() == 'Darwin':
    font_paths.append('/Library/Fonts/Arial.ttf')
    font_paths.append('/System/Library/Fonts/Supplemental/Arial.ttf')
elif platform.system() == 'Windows':
    font_paths.append('C:/Windows/Fonts/arial.ttf')
elif platform.system() == 'Linux':
    font_paths.append('/usr/share/fonts/truetype/arial.ttf')
    font_paths.append('/usr/share/fonts/truetype/msttcorefonts/Arial.ttf')
for font_path in font_paths:
    if os.path.exists(font_path):
        text_obj.data.font = bpy.data.fonts.load(font_path)
        font_loaded = True
        break
# If no system font found, use Blender's default (do not set font)

# Center text (already centered by location above)



# White text material with strong emission for glow
text_mat = bpy.data.materials.new(name='TextMat')
text_mat.use_nodes = True
nodes = text_mat.node_tree.nodes
links = text_mat.node_tree.links
bsdf = nodes['Principled BSDF']
bsdf.inputs['Base Color'].default_value = (1, 1, 1, 1)
emission = nodes.new('ShaderNodeEmission')
emission.inputs['Color'].default_value = (1, 1, 1, 1)
emission.inputs['Strength'].default_value = 6.0
mix = nodes.new('ShaderNodeAddShader')
links.new(bsdf.outputs['BSDF'], mix.inputs[0])
links.new(emission.outputs['Emission'], mix.inputs[1])
links.new(mix.outputs[0], nodes['Material Output'].inputs['Surface'])
text_obj.data.materials.append(text_mat)

# Render
output_path = os.path.join(bpy.path.abspath('//'), 'appicon.png')
scene.render.filepath = output_path
bpy.ops.render.render(write_still=True)
print(f"App icon rendered to {output_path}")
