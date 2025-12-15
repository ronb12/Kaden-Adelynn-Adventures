import os
from PIL import Image, ImageDraw, ImageFilter

base_size = 1024

# Create base image with dark blue background
bg_top = (10, 14, 39)
bg_bottom = (18, 25, 70)

img = Image.new('RGB', (base_size, base_size))
draw = ImageDraw.Draw(img)

# Draw gradient background
for y in range(base_size):
    t = y / (base_size - 1)
    color = tuple(int(bg_top[i] * (1 - t) + bg_bottom[i] * t) for i in range(3))
    draw.line([(0, y), (base_size, y)], fill=color)

center = base_size // 2
ship_height = int(base_size * 0.5)
ship_width = int(base_size * 0.35)

# Blue triangle player ship pointing upward
# Top point (nose)
top_point = (center, center - int(ship_height * 0.4))
# Bottom left
left_point = (center - ship_width // 2, center + int(ship_height * 0.3))
# Bottom right
right_point = (center + ship_width // 2, center + int(ship_height * 0.3))

# Draw ship body (solid bright blue)
ship_blue = (65, 150, 255)  # Bright blue for ship
triangle_points = [top_point, left_point, right_point]
draw.polygon(triangle_points, fill=ship_blue)

# Add accent color (bright cyan) to enhance the ship
accent_color = (78, 205, 196)
# Draw cockpit window (small circle at top)
cockpit_r = int(base_size * 0.05)
cockpit_bbox = [
    center - cockpit_r, 
    center - int(ship_height * 0.25) - cockpit_r,
    center + cockpit_r,
    center - int(ship_height * 0.25) + cockpit_r
]
draw.ellipse(cockpit_bbox, fill=accent_color)

# Add glow effect around ship
glow = Image.new('RGBA', (base_size, base_size), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
# Glow around ship body
glow_draw.polygon(triangle_points, fill=(ship_blue[0], ship_blue[1], ship_blue[2], 100))
# Glow around cockpit
glow_draw.ellipse(cockpit_bbox, fill=(accent_color[0], accent_color[1], accent_color[2], 80))
glow = glow.filter(ImageFilter.GaussianBlur(radius=int(base_size * 0.04)))
img = Image.alpha_composite(img.convert('RGBA'), glow)

# Add engine flame effect at bottom
flame = Image.new('RGBA', (base_size, base_size), (0, 0, 0, 0))
flame_draw = ImageDraw.Draw(flame)
flame_w = int(ship_width * 0.3)
flame_h = int(ship_height * 0.25)
flame_color = (255, 165, 0)  # Orange flame

# Flame triangle (pointing down)
flame_top_left = (center - flame_w // 2, center + int(ship_height * 0.3))
flame_top_right = (center + flame_w // 2, center + int(ship_height * 0.3))
flame_bottom = (center, center + int(ship_height * 0.3) + flame_h)
flame_draw.polygon([flame_top_left, flame_top_right, flame_bottom], fill=(flame_color[0], flame_color[1], flame_color[2], 150))

flame = flame.filter(ImageFilter.GaussianBlur(radius=int(base_size * 0.03)))
img = Image.alpha_composite(img, flame)

# Add stars in background
stars = Image.new('RGBA', (base_size, base_size), (0, 0, 0, 0))
stars_draw = ImageDraw.Draw(stars)
import random
random.seed(42)  # For consistent star positions
for _ in range(15):
    star_x = random.randint(0, base_size)
    star_y = random.randint(0, base_size)
    star_size = random.randint(2, 6)
    stars_draw.ellipse([star_x - star_size, star_y - star_size, star_x + star_size, star_y + star_size], 
                       fill=(255, 255, 255, 100))
stars = stars.filter(ImageFilter.GaussianBlur(radius=1))
img = Image.alpha_composite(img, stars)

final = img.convert('RGBA')

sizes = {
    'icon-20@2x.png': 40,
    'icon-20@3x.png': 60,
    'icon-20~ipad.png': 20,
    'icon-20@2x~ipad.png': 40,
    'icon-29@2x.png': 58,
    'icon-29@3x.png': 87,
    'icon-29~ipad.png': 29,
    'icon-29@2x~ipad.png': 58,
    'icon-40@2x.png': 80,
    'icon-40@3x.png': 120,
    'icon-40~ipad.png': 40,
    'icon-40@2x~ipad.png': 80,
    'icon-60@2x.png': 120,
    'icon-60@3x.png': 180,
    'icon-76~ipad.png': 76,
    'icon-76@2x~ipad.png': 152,
    'icon-83.5@2x~ipad.png': 167,
    'icon-1024.png': 1024,
}

dst = os.path.join('ios', 'KadenAdelynnAdventures', 'KadenAdelynnAdventures', 'Assets.xcassets', 'AppIcon.appiconset')
os.makedirs(dst, exist_ok=True)

for name, size in sizes.items():
    out = os.path.join(dst, name)
    final.resize((size, size), Image.LANCZOS).save(out, format='PNG')

print('generated icons:', len(sizes))
