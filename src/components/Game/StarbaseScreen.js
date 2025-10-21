/**
 * Starbase Headquarters Screen
 * The living, breathing hub of your space adventure
 */

import React, { useEffect, useRef, useState } from 'react';
import './StarbaseScreen.css';

const StarbaseScreen = ({ 
  starbaseSystem, 
  npcSystem, 
  progressionSystem,
  credits = 0,
  onNavigate,
  onClose
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    // Initialize NPC system if needed
    if (npcSystem && npcSystem.npcs.length === 0) {
      npcSystem.resize(canvas.width, canvas.height);
      npcSystem.initialize();
    }
    
    let animationTime = 0;
    
    const animate = () => {
      animationTime++;
      
      // Clear canvas
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw starfield background
      drawStarfield(ctx, canvas.width, canvas.height, animationTime);
      
      // Draw starbase structure
      drawStarbaseStructure(ctx, starbaseSystem, progressionSystem, animationTime);
      
      // Draw rooms
      drawRooms(ctx, starbaseSystem, hoveredRoom, selectedRoom);
      
      // Update and draw NPCs
      if (npcSystem) {
        npcSystem.update(1, starbaseSystem.currentRoom);
        npcSystem.draw(ctx, starbaseSystem.currentRoom);
      }
      
      // Draw hover tooltip
      if (hoveredRoom) {
        drawTooltip(ctx, hoveredRoom, canvas);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [starbaseSystem, npcSystem, progressionSystem, hoveredRoom, selectedRoom]);
  
  /**
   * Draw animated starfield
   */
  const drawStarfield = (ctx, width, height, time) => {
    ctx.save();
    
    // Draw stars
    for (let i = 0; i < 100; i++) {
      const x = (i * 73) % width;
      const y = (i * 127 + time * 0.5) % height;
      const size = (i % 3) + 1;
      const twinkle = Math.sin((time + i) * 0.1) * 0.5 + 0.5;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };
  
  /**
   * Draw starbase structure
   */
  const drawStarbaseStructure = (ctx, starbaseSystem, progressionSystem, time) => {
    ctx.save();
    
    // Get visual effects based on upgrades
    const effects = progressionSystem ? 
      progressionSystem.getVisualEffects(starbaseSystem.currentRoom) : 
      { brightness: 1.0 };
    
    // Draw main base structure (central hub)
    const centerX = 400;
    const centerY = 300;
    const radius = 80;
    
    // Glowing core
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, `rgba(0, 150, 255, ${0.6 * effects.brightness})`);
    gradient.addColorStop(1, 'rgba(0, 50, 100, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Rotating ring
    ctx.strokeStyle = `rgba(0, 200, 255, ${0.8 * effects.brightness})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, time * 0.02, time * 0.02 + Math.PI * 1.5);
    ctx.stroke();
    
    // Core structure
    ctx.fillStyle = '#1a3a5a';
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 * effects.brightness})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Station name
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HQ', centerX, centerY + 5);
    
    ctx.restore();
  };
  
  /**
   * Draw all rooms
   */
  const drawRooms = (ctx, starbaseSystem, hoveredRoom, selectedRoom) => {
    const rooms = starbaseSystem.getAvailableRooms();
    
    rooms.forEach(room => {
      const isHovered = hoveredRoom === room.id;
      const isSelected = selectedRoom === room.id;
      const isUnlocked = starbaseSystem.isRoomUnlocked(room.id);
      
      ctx.save();
      
      // Room background
      if (isUnlocked) {
        ctx.fillStyle = isHovered ? room.accentColor : room.backgroundColor;
        ctx.globalAlpha = isHovered ? 0.8 : 0.6;
      } else {
        ctx.fillStyle = '#1a1a1a';
        ctx.globalAlpha = 0.3;
      }
      
      // Draw rounded rectangle
      drawRoundedRect(
        ctx, 
        room.position.x, 
        room.position.y, 
        room.size.width, 
        room.size.height, 
        10
      );
      ctx.fill();
      
      // Room border (highlight if selected)
      ctx.globalAlpha = 1;
      ctx.strokeStyle = isSelected ? '#ffff00' : (isHovered ? '#ffffff' : room.accentColor);
      ctx.lineWidth = isSelected ? 4 : (isHovered ? 3 : 2);
      ctx.stroke();
      
      // Room icon and name
      ctx.fillStyle = isUnlocked ? '#ffffff' : '#666666';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        room.icon, 
        room.position.x + room.size.width / 2, 
        room.position.y + 50
      );
      
      ctx.font = 'bold 14px Arial';
      ctx.fillText(
        room.name, 
        room.position.x + room.size.width / 2, 
        room.position.y + 90
      );
      
      // Lock icon for locked rooms
      if (!isUnlocked) {
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(
          '🔒', 
          room.position.x + room.size.width / 2, 
          room.position.y + 110
        );
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#ffaa44';
        ctx.fillText(
          `Level ${room.unlockLevel}`, 
          room.position.x + room.size.width / 2, 
          room.position.y + 130
        );
      }
      
      ctx.restore();
    });
  };
  
  /**
   * Draw tooltip
   */
  const drawTooltip = (ctx, roomId, canvas) => {
    const room = starbaseSystem.rooms[roomId];
    if (!room) return;
    
    ctx.save();
    
    const tooltipWidth = 250;
    const tooltipHeight = 60;
    const tooltipX = Math.min(canvas.width - tooltipWidth - 20, Math.max(20, room.position.x + room.size.width / 2 - tooltipWidth / 2));
    const tooltipY = room.position.y - tooltipHeight - 10;
    
    // Tooltip background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.strokeStyle = room.accentColor;
    ctx.lineWidth = 2;
    
    drawRoundedRect(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8);
    ctx.fill();
    ctx.stroke();
    
    // Tooltip text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(room.name, tooltipX + tooltipWidth / 2, tooltipY + 20);
    
    ctx.font = '12px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(room.description, tooltipX + tooltipWidth / 2, tooltipY + 40);
    
    ctx.restore();
  };
  
  /**
   * Helper: Draw rounded rectangle
   */
  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };
  
  /**
   * Handle canvas click
   */
  const handleCanvasClick = (e) => {
    if (isTransitioning) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check which room was clicked
    const rooms = starbaseSystem.getAvailableRooms();
    for (const room of rooms) {
      if (
        x >= room.position.x && 
        x <= room.position.x + room.size.width &&
        y >= room.position.y && 
        y <= room.position.y + room.size.height
      ) {
        if (starbaseSystem.isRoomUnlocked(room.id)) {
          handleRoomClick(room.id);
        } else {
          console.log(`Room locked! Unlock at base level ${room.unlockLevel}`);
        }
        break;
      }
    }
  };
  
  /**
   * Handle canvas hover
   */
  const handleCanvasHover = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check which room is hovered
    const rooms = starbaseSystem.getAvailableRooms();
    let foundRoom = null;
    
    for (const room of rooms) {
      if (
        x >= room.position.x && 
        x <= room.position.x + room.size.width &&
        y >= room.position.y && 
        y <= room.position.y + room.size.height
      ) {
        foundRoom = room.id;
        canvas.style.cursor = starbaseSystem.isRoomUnlocked(room.id) ? 'pointer' : 'not-allowed';
        break;
      }
    }
    
    if (!foundRoom) {
      canvas.style.cursor = 'default';
    }
    
    setHoveredRoom(foundRoom);
  };
  
  /**
   * Handle room click
   */
  const handleRoomClick = (roomId) => {
    setIsTransitioning(true);
    setSelectedRoom(roomId);
    
    // Trigger transition
    setTimeout(() => {
      starbaseSystem.navigateToRoom(roomId);
      
      if (onNavigate) {
        onNavigate(roomId);
      }
      
      setIsTransitioning(false);
      setSelectedRoom(null);
    }, 500);
  };
  
  return (
    <div className="starbase-screen">
      <div className="starbase-header">
        <h1>🚀 STARBASE HEADQUARTERS</h1>
        <div className="starbase-info">
          <span className="base-level">Base Level: {starbaseSystem.baseLevel}</span>
          <span className="credits">Credits: {credits.toLocaleString()}</span>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        className={`starbase-canvas ${isTransitioning ? 'transitioning' : ''}`}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasHover}
      />
      
      <div className="starbase-footer">
        <button className="skip-button" onClick={onClose}>
          Quick Menu →
        </button>
        <div className="starbase-tip">
          💡 Click a room to enter • {starbaseSystem.visitCount} visits total
        </div>
      </div>
      
      {isTransitioning && (
        <div className="transition-overlay">
          <div className="transition-text">Entering {selectedRoom}...</div>
        </div>
      )}
    </div>
  );
};

export default StarbaseScreen;

