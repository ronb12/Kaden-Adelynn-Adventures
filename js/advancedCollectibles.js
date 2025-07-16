// advancedCollectibles.js
// Uses Paper.js to draw advanced collectibles and exports functions to get images for each type

function createCollectibleImage(drawFn, width = 40, height = 40) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const scope = new paper.PaperScope();
    scope.setup(canvas);
    drawFn(scope, width, height);
    scope.view.update();
    const img = new window.Image();
    img.src = canvas.toDataURL('image/png');
    return img;
}

// Health: glowing red heart
function drawHealth(scope, w, h) {
    const { Path, Point, Color, Group } = scope;
    const heart = new Path();
    heart.add(new Point(w/2, h*0.75));
    heart.cubicCurveTo(new Point(w*0.1, h*0.5), new Point(w*0.1, h*0.2), new Point(w/2, h*0.35));
    heart.cubicCurveTo(new Point(w*0.9, h*0.2), new Point(w*0.9, h*0.5), new Point(w/2, h*0.75));
    heart.closed = true;
    heart.fillColor = new Color('#ff4444');
    heart.shadowColor = new Color('#ff8888');
    heart.shadowBlur = 12;
    // Shine
    const shine = new Path.Circle({
        center: [w/2, h*0.45],
        radius: w*0.11,
        fillColor: new Color('#fff'),
        opacity: 0.18
    });
    new Group([heart, shine]);
}

// Weapon: glowing blue energy orb
function drawWeapon(scope, w, h) {
    const { Path, Color, Group, Shape } = scope;
    const orb = new Shape.Ellipse({
        center: [w/2, h/2],
        radius: [w*0.32, h*0.32],
        fillColor: new Color('#00eaff'),
        shadowColor: new Color('#00fff7'),
        shadowBlur: 14
    });
    // Inner core
    const core = new Shape.Ellipse({
        center: [w/2, h/2],
        radius: [w*0.16, h*0.16],
        fillColor: new Color('#fff'),
        opacity: 0.5
    });
    new Group([orb, core]);
}

// Rapid fire: yellow lightning bolt
function drawRapidFire(scope, w, h) {
    const { Path, Point, Color, Group } = scope;
    const bolt = new Path();
    bolt.add(new Point(w*0.3, h*0.15));
    bolt.lineTo(w*0.55, h*0.15);
    bolt.lineTo(w*0.45, h*0.5);
    bolt.lineTo(w*0.7, h*0.5);
    bolt.lineTo(w*0.25, h*0.85);
    bolt.lineTo(w*0.4, h*0.5);
    bolt.lineTo(w*0.3, h*0.5);
    bolt.closed = true;
    bolt.fillColor = new Color('#ffe066');
    bolt.shadowColor = new Color('#ffff00');
    bolt.shadowBlur = 10;
    new Group([bolt]);
}

// Shield: blue glowing shield
function drawShield(scope, w, h) {
    const { Path, Point, Color, Group } = scope;
    const shield = new Path();
    shield.add(new Point(w/2, h*0.15));
    shield.arcTo(new Point(w*0.85, h*0.4), new Point(w/2, h*0.85));
    shield.arcTo(new Point(w*0.15, h*0.4), new Point(w/2, h*0.15));
    shield.closed = true;
    shield.fillColor = new Color('#00eaff');
    shield.shadowColor = new Color('#00fff7');
    shield.shadowBlur = 10;
    // Shine
    const shine = new Path.Circle({
        center: [w/2, h*0.4],
        radius: w*0.13,
        fillColor: new Color('#fff'),
        opacity: 0.13
    });
    new Group([shield, shine]);
}

// Money: gold coin
function drawMoney(scope, w, h) {
    const { Path, Color, Shape, Group } = scope;
    const coin = new Shape.Ellipse({
        center: [w/2, h/2],
        radius: [w*0.38, h*0.38],
        fillColor: new Color('#ffd700'),
        shadowColor: new Color('#fff700'),
        shadowBlur: 10
    });
    // Inner ring
    const ring = new Shape.Ellipse({
        center: [w/2, h/2],
        radius: [w*0.28, h*0.28],
        fillColor: new Color('#fffde0'),
        opacity: 0.5
    });
    // Dollar sign
    const dollar = new Path({
        segments: [
            [w/2, h*0.28],
            [w/2, h*0.72]
        ],
        strokeColor: new Color('#bfa600'),
        strokeWidth: 3
    });
    new Group([coin, ring, dollar]);
}

// Export functions to get images
window.getAdvancedCollectibleImage = {
    health: () => createCollectibleImage(drawHealth, 40, 40),
    weapon: () => createCollectibleImage(drawWeapon, 40, 40),
    rapidfire: () => createCollectibleImage(drawRapidFire, 40, 40),
    shield: () => createCollectibleImage(drawShield, 40, 40),
    money: () => createCollectibleImage(drawMoney, 40, 40)
}; 