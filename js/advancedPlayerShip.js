// advancedPlayerShip.js
// Uses Paper.js to draw an advanced sci-fi player ship and exports a function to get the image

// Create an offscreen canvas
const shipCanvas = document.createElement('canvas');
shipCanvas.width = 80;
shipCanvas.height = 80;
const shipScope = new paper.PaperScope();
shipScope.setup(shipCanvas);

// Draw advanced sci-fi ship using Paper.js
const { Path, Point, Color, Group, Shape } = shipScope;

// Main hull
const hull = new Path();
hull.add(new Point(40, 8)); // Nose
hull.add(new Point(18, 60)); // Left front
hull.add(new Point(32, 72)); // Left engine
hull.add(new Point(48, 72)); // Right engine
hull.add(new Point(62, 60)); // Right front
hull.closed = true;
hull.fillColor = new Color('#2e3b4e');
hull.strokeColor = new Color('#00eaff');
hull.strokeWidth = 2;

// Cockpit
const cockpit = new Shape.Ellipse({
    center: [40, 28],
    radius: [10, 14],
    fillColor: new Color('#00eaff'),
    opacity: 0.8
});

// Engine glows
const leftEngine = new Shape.Ellipse({
    center: [32, 74],
    radius: [5, 8],
    fillColor: new Color('#00fff7'),
    opacity: 0.7
});
const rightEngine = new Shape.Ellipse({
    center: [48, 74],
    radius: [5, 8],
    fillColor: new Color('#00fff7'),
    opacity: 0.7
});

// Layered hull details
const hullDetail = new Path();
hullDetail.add(new Point(40, 18));
hullDetail.add(new Point(24, 58));
hullDetail.add(new Point(56, 58));
hullDetail.closed = true;
hullDetail.strokeColor = new Color('#b0c4de');
hullDetail.strokeWidth = 1.5;
hullDetail.fillColor = null;

// Fuselage line
const fuselage = new Path();
fuselage.add(new Point(40, 18));
fuselage.add(new Point(40, 68));
fuselage.strokeColor = new Color('#00eaff');
fuselage.strokeWidth = 1.2;

// Group all parts
const shipGroup = new Group([hull, cockpit, leftEngine, rightEngine, hullDetail, fuselage]);

// Export as image
function getAdvancedPlayerShipImage() {
    shipScope.view.update();
    const img = new window.Image();
    img.src = shipCanvas.toDataURL('image/png');
    return img;
}

// Export the function for use in main.js
window.getAdvancedPlayerShipImage = getAdvancedPlayerShipImage; 