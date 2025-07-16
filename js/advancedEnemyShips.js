// advancedEnemyShips.js
// Uses Paper.js to draw advanced sci-fi enemy ships and exports functions to get images for each type

function createEnemyShipImage(drawFn, width = 60, height = 60) {
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

// Basic enemy: angular red fighter
function drawBasicEnemy(scope, w, h) {
    const { Path, Point, Color, Group } = scope;
    const body = new Path();
    body.add(new Point(w/2, 8)); // Nose
    body.add(new Point(10, h-10)); // Left
    body.add(new Point(w-10, h-10)); // Right
    body.closed = true;
    body.fillColor = new Color('#DC143C');
    body.strokeColor = new Color('#fff');
    body.strokeWidth = 2;
    // Cockpit
    const cockpit = new Path.Circle({
        center: [w/2, h/2],
        radius: 7,
        fillColor: new Color('#00eaff'),
        opacity: 0.7
    });
    // Engine glow
    const engine = new Path.Ellipse({
        center: [w/2, h-6],
        radius: [7, 4],
        fillColor: new Color('#ff4444'),
        opacity: 0.5
    });
    new Group([body, cockpit, engine]);
}

// Tank enemy: heavy blue dreadnought
function drawTankEnemy(scope, w, h) {
    const { Path, Point, Color, Group, Shape } = scope;
    // Main body (octagon)
    const body = new Path();
    body.add(new Point(w/2, 8));
    body.add(new Point(12, 20));
    body.add(new Point(8, h/2));
    body.add(new Point(12, h-20));
    body.add(new Point(w/2, h-8));
    body.add(new Point(w-12, h-20));
    body.add(new Point(w-8, h/2));
    body.add(new Point(w-12, 20));
    body.closed = true;
    body.fillColor = new Color('#1a1a2e');
    body.strokeColor = new Color('#00eaff');
    body.strokeWidth = 2.5;
    // Cockpit
    const cockpit = new Shape.Ellipse({
        center: [w/2, h/2],
        radius: [10, 14],
        fillColor: new Color('#FFD700'),
        opacity: 0.8
    });
    // Shield ring
    const shield = new Path.Circle({
        center: [w/2, h/2],
        radius: w/2 - 6,
        strokeColor: new Color('#00ffff'),
        strokeWidth: 2,
        opacity: 0.4
    });
    // Engine glows
    const leftEngine = new Shape.Ellipse({
        center: [w/4, h-10],
        radius: [5, 7],
        fillColor: new Color('#00fff7'),
        opacity: 0.6
    });
    const rightEngine = new Shape.Ellipse({
        center: [3*w/4, h-10],
        radius: [5, 7],
        fillColor: new Color('#00fff7'),
        opacity: 0.6
    });
    new Group([body, cockpit, shield, leftEngine, rightEngine]);
}

// Destroyer enemy: stealthy purple battlecruiser
function drawDestroyerEnemy(scope, w, h) {
    const { Path, Point, Color, Group } = scope;
    // Main body (diamond)
    const body = new Path();
    body.add(new Point(w/2, 10));
    body.add(new Point(10, h/2));
    body.add(new Point(w/2, h-10));
    body.add(new Point(w-10, h/2));
    body.closed = true;
    body.fillColor = new Color('#6a1b9a');
    body.strokeColor = new Color('#fff');
    body.strokeWidth = 2;
    // Cockpit
    const cockpit = new Path.Circle({
        center: [w/2, h/2],
        radius: 8,
        fillColor: new Color('#00eaff'),
        opacity: 0.7
    });
    // Cloak ring
    const cloak = new Path.Circle({
        center: [w/2, h/2],
        radius: w/2 - 8,
        strokeColor: new Color('#9370DB'),
        strokeWidth: 2,
        opacity: 0.3
    });
    // Engine
    const engine = new Path.Ellipse({
        center: [w/2, h-8],
        radius: [6, 4],
        fillColor: new Color('#00fff7'),
        opacity: 0.5
    });
    new Group([body, cockpit, cloak, engine]);
}

// Export functions to get images
window.getAdvancedEnemyShipImage = {
    basic: () => createEnemyShipImage(drawBasicEnemy, 60, 60),
    tank: () => createEnemyShipImage(drawTankEnemy, 70, 70),
    destroyer: () => createEnemyShipImage(drawDestroyerEnemy, 70, 70)
}; 