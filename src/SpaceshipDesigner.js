import React, { useState, useRef, useEffect } from 'react';

const SpaceshipDesigner = ({ onSave, onClose }) => {
  const [selectedColor, setSelectedColor] = useState('#4ecdc4');
  const [selectedShape, setSelectedShape] = useState('fighter');
  const [shipName, setShipName] = useState('My Spaceship');
  const [customColors, setCustomColors] = useState({
    primary: '#4ecdc4',
    secondary: '#e74c3c',
    accent: '#f39c12',
    cockpit: '#3498db'
  });
  
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapes, setShapes] = useState([]);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(-1);

  const colorPalette = [
    '#4ecdc4', '#e74c3c', '#f39c12', '#3498db', '#9b59b6',
    '#2ecc71', '#e67e22', '#1abc9c', '#34495e', '#f1c40f',
    '#e91e63', '#00bcd4', '#ff9800', '#795548', '#607d8b'
  ];

  const shipTemplates = {
    fighter: {
      name: 'Fighter Jet',
      shapes: [
        { type: 'triangle', x: 50, y: 30, width: 40, height: 30, color: '#4ecdc4', rotation: 0 },
        { type: 'triangle', x: 30, y: 50, width: 20, height: 15, color: '#e74c3c', rotation: 45 },
        { type: 'triangle', x: 70, y: 50, width: 20, height: 15, color: '#e74c3c', rotation: -45 },
        { type: 'triangle', x: 45, y: 60, width: 10, height: 8, color: '#3498db', rotation: 0 }
      ]
    },
    bomber: {
      name: 'Bomber',
      shapes: [
        { type: 'triangle', x: 50, y: 20, width: 50, height: 40, color: '#8e44ad', rotation: 0 },
        { type: 'triangle', x: 25, y: 50, width: 30, height: 20, color: '#e74c3c', rotation: 30 },
        { type: 'triangle', x: 75, y: 50, width: 30, height: 20, color: '#e74c3c', rotation: -30 },
        { type: 'triangle', x: 50, y: 70, width: 15, height: 12, color: '#f39c12', rotation: 0 }
      ]
    },
    interceptor: {
      name: 'Interceptor',
      shapes: [
        { type: 'triangle', x: 50, y: 25, width: 35, height: 25, color: '#e74c3c', rotation: 0 },
        { type: 'triangle', x: 35, y: 45, width: 25, height: 18, color: '#f39c12', rotation: 60 },
        { type: 'triangle', x: 65, y: 45, width: 25, height: 18, color: '#f39c12', rotation: -60 },
        { type: 'triangle', x: 50, y: 55, width: 12, height: 10, color: '#9b59b6', rotation: 0 }
      ]
    }
  };

  useEffect(() => {
    if (selectedShape && shipTemplates[selectedShape]) {
      setShapes([...shipTemplates[selectedShape].shapes]);
      setShipName(shipTemplates[selectedShape].name);
    }
  }, [selectedShape]);

  useEffect(() => {
    drawShip();
  }, [shapes, customColors]);

  const drawShip = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 10) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw shapes
    shapes.forEach((shape, index) => {
      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate((shape.rotation * Math.PI) / 180);
      
      if (shape.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(0, -shape.height / 2);
        ctx.lineTo(-shape.width / 2, shape.height / 2);
        ctx.lineTo(shape.width / 2, shape.height / 2);
        ctx.closePath();
        
        ctx.fillStyle = shape.color;
        ctx.fill();
        
        // Highlight selected shape
        if (index === selectedShapeIndex) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      
      ctx.restore();
    });
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked on a shape
    let clickedShapeIndex = -1;
    shapes.forEach((shape, index) => {
      if (x >= shape.x - shape.width/2 && x <= shape.x + shape.width/2 &&
          y >= shape.y - shape.height/2 && y <= shape.y + shape.height/2) {
        clickedShapeIndex = index;
      }
    });
    
    setSelectedShapeIndex(clickedShapeIndex);
  };

  const addShape = () => {
    const newShape = {
      type: 'triangle',
      x: 50,
      y: 50,
      width: 20,
      height: 15,
      color: selectedColor,
      rotation: 0
    };
    setShapes([...shapes, newShape]);
  };

  const removeShape = () => {
    if (selectedShapeIndex >= 0) {
      const newShapes = shapes.filter((_, index) => index !== selectedShapeIndex);
      setShapes(newShapes);
      setSelectedShapeIndex(-1);
    }
  };

  const updateShape = (property, value) => {
    if (selectedShapeIndex >= 0) {
      const newShapes = [...shapes];
      newShapes[selectedShapeIndex] = { ...newShapes[selectedShapeIndex], [property]: value };
      setShapes(newShapes);
    }
  };

  const saveShip = () => {
    const shipData = {
      name: shipName,
      shapes: shapes,
      colors: customColors,
      template: selectedShape
    };
    onSave(shipData);
  };

  const randomizeColors = () => {
    const newColors = {
      primary: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      secondary: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      accent: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      cockpit: colorPalette[Math.floor(Math.random() * colorPalette.length)]
    };
    setCustomColors(newColors);
    
    // Apply random colors to shapes
    const newShapes = shapes.map(shape => ({
      ...shape,
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)]
    }));
    setShapes(newShapes);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '2px solid #4ecdc4',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0, color: '#4ecdc4' }}>🚀 Spaceship Designer</h1>
          <button
            onClick={onClose}
            style={{
              background: '#e74c3c',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Canvas Area */}
          <div>
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              style={{
                border: '2px solid #4ecdc4',
                borderRadius: '10px',
                background: '#0c0c0c',
                cursor: 'crosshair'
              }}
              onClick={handleCanvasClick}
            />
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={addShape}
                style={{
                  background: '#2ecc71',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  margin: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                ➕ Add Shape
              </button>
              <button
                onClick={removeShape}
                disabled={selectedShapeIndex < 0}
                style={{
                  background: selectedShapeIndex >= 0 ? '#e74c3c' : '#666',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  margin: '0.25rem',
                  cursor: selectedShapeIndex >= 0 ? 'pointer' : 'not-allowed'
                }}
              >
                🗑️ Remove
              </button>
            </div>
          </div>

          {/* Controls Panel */}
          <div style={{ minWidth: '300px' }}>
            {/* Ship Template Selection */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ship Template:</label>
              <select
                value={selectedShape}
                onChange={(e) => setSelectedShape(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '5px',
                  background: '#2c3e50',
                  color: 'white',
                  border: '1px solid #4ecdc4'
                }}
              >
                <option value="fighter">Fighter Jet</option>
                <option value="bomber">Bomber</option>
                <option value="interceptor">Interceptor</option>
              </select>
            </div>

            {/* Ship Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ship Name:</label>
              <input
                type="text"
                value={shipName}
                onChange={(e) => setShipName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '5px',
                  background: '#2c3e50',
                  color: 'white',
                  border: '1px solid #4ecdc4'
                }}
              />
            </div>

            {/* Color Palette */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Color Palette:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {colorPalette.map((color, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: '30px',
                      height: '30px',
                      background: color,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: selectedColor === color ? '3px solid #fff' : '2px solid #333',
                      boxShadow: selectedColor === color ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Randomize Colors */}
            <button
              onClick={randomizeColors}
              style={{
                background: '#9b59b6',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                padding: '0.5rem 1rem',
                width: '100%',
                marginBottom: '1rem',
                cursor: 'pointer'
              }}
            >
              🎨 Randomize Colors
            </button>

            {/* Shape Properties */}
            {selectedShapeIndex >= 0 && (
              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#4ecdc4' }}>Shape Properties</h3>
                
                <div style={{ marginBottom: '0.5rem' }}>
                  <label>X Position:</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={shapes[selectedShapeIndex]?.x || 0}
                    onChange={(e) => updateShape('x', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <span>{shapes[selectedShapeIndex]?.x || 0}</span>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <label>Y Position:</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={shapes[selectedShapeIndex]?.y || 0}
                    onChange={(e) => updateShape('y', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <span>{shapes[selectedShapeIndex]?.y || 0}</span>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <label>Width:</label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={shapes[selectedShapeIndex]?.width || 0}
                    onChange={(e) => updateShape('width', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <span>{shapes[selectedShapeIndex]?.width || 0}</span>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <label>Height:</label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={shapes[selectedShapeIndex]?.height || 0}
                    onChange={(e) => updateShape('height', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <span>{shapes[selectedShapeIndex]?.height || 0}</span>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <label>Rotation:</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={shapes[selectedShapeIndex]?.height || 0}
                    onChange={(e) => updateShape('rotation', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <span>{shapes[selectedShapeIndex]?.rotation || 0}°</span>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <label>Color:</label>
                  <input
                    type="color"
                    value={shapes[selectedShapeIndex]?.color || '#ffffff'}
                    onChange={(e) => updateShape('color', e.target.value)}
                    style={{ width: '100%', height: '30px' }}
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={saveShip}
              style={{
                background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                padding: '1rem',
                width: '100%',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)'
              }}
            >
              💾 Save Spaceship
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', opacity: 0.7 }}>
          <p>💡 Click on shapes to select them, then adjust their properties</p>
          <p>🎨 Use the color palette or randomize for unique designs</p>
        </div>
      </div>
    </div>
  );
};

export default SpaceshipDesigner;
