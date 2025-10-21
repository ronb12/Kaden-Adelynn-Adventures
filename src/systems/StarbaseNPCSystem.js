/**
 * Starbase NPC System
 * Animated NPCs that bring the starbase to life
 */

export class StarbaseNPCSystem {
  constructor(canvasWidth = 800, canvasHeight = 600) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.npcs = [];
    this.time = 0;
    
    // NPC templates
    this.npcTemplates = {
      engineer: {
        type: 'engineer',
        name: 'Engineer',
        color: '#ffaa00',
        size: 12,
        speed: 0.5,
        dialogue: [
          "Ship systems at 100%!",
          "Running diagnostics...",
          "Weapons hot and ready!",
          "Engine efficiency optimal."
        ]
      },
      pilot: {
        type: 'pilot',
        name: 'Pilot',
        color: '#00aaff',
        size: 12,
        speed: 1.0,
        dialogue: [
          "Ready for launch!",
          "Navigation systems online.",
          "All clear for departure!",
          "Flight path calculated."
        ]
      },
      scientist: {
        type: 'scientist',
        name: 'Scientist',
        color: '#aa00ff',
        size: 12,
        speed: 0.3,
        dialogue: [
          "Research complete!",
          "Analyzing data...",
          "Fascinating discovery!",
          "Upgrading technology..."
        ]
      },
      commander: {
        type: 'commander',
        name: 'Commander',
        color: '#ff0088',
        size: 14,
        speed: 0.7,
        dialogue: [
          "Mission briefing ready.",
          "Excellent work, pilot!",
          "New orders incoming.",
          "The galaxy needs you!"
        ]
      },
      mechanic: {
        type: 'mechanic',
        name: 'Mechanic',
        color: '#00ff88',
        size: 12,
        speed: 0.4,
        dialogue: [
          "Ship repairs complete!",
          "Everything's ship-shape!",
          "Hull integrity at 100%.",
          "Ready for action!"
        ]
      }
    };
    
    this.initialize();
  }
  
  /**
   * Initialize NPCs
   */
  initialize() {
    // Create NPCs for different rooms
    const npcConfigs = [
      { template: 'engineer', room: 'hangar', count: 2 },
      { template: 'pilot', room: 'operations', count: 3 },
      { template: 'scientist', room: 'techlab', count: 2 },
      { template: 'commander', room: 'command', count: 1 },
      { template: 'mechanic', room: 'hangar', count: 2 }
    ];
    
    npcConfigs.forEach(config => {
      for (let i = 0; i < config.count; i++) {
        this.spawnNPC(config.template, config.room);
      }
    });
  }
  
  /**
   * Spawn an NPC
   */
  spawnNPC(templateType, room) {
    const template = this.npcTemplates[templateType];
    if (!template) return null;
    
    const npc = {
      id: `${templateType}_${Date.now()}_${Math.random()}`,
      ...template,
      room: room,
      x: Math.random() * this.canvasWidth,
      y: Math.random() * this.canvasHeight,
      targetX: Math.random() * this.canvasWidth,
      targetY: Math.random() * this.canvasHeight,
      currentDialogue: null,
      dialogueTimer: 0,
      animationPhase: Math.random() * Math.PI * 2,
      direction: Math.random() > 0.5 ? 1 : -1
    };
    
    this.npcs.push(npc);
    return npc;
  }
  
  /**
   * Update all NPCs
   */
  update(deltaTime = 1, currentRoom = null) {
    this.time += deltaTime;
    
    this.npcs.forEach(npc => {
      // Only update NPCs in current room
      if (currentRoom && npc.room !== currentRoom) return;
      
      // Move towards target
      const dx = npc.targetX - npc.x;
      const dy = npc.targetY - npc.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5) {
        npc.x += (dx / distance) * npc.speed;
        npc.y += (dy / distance) * npc.speed;
      } else {
        // Reached target, pick new random target
        npc.targetX = Math.random() * this.canvasWidth;
        npc.targetY = Math.random() * this.canvasHeight;
        
        // Random chance to say something
        if (Math.random() < 0.02) {
          this.triggerDialogue(npc);
        }
      }
      
      // Update animation phase
      npc.animationPhase += 0.1;
      
      // Update dialogue timer
      if (npc.dialogueTimer > 0) {
        npc.dialogueTimer -= deltaTime;
        if (npc.dialogueTimer <= 0) {
          npc.currentDialogue = null;
        }
      }
    });
  }
  
  /**
   * Trigger NPC dialogue
   */
  triggerDialogue(npc) {
    const dialogue = npc.dialogue[Math.floor(Math.random() * npc.dialogue.length)];
    npc.currentDialogue = dialogue;
    npc.dialogueTimer = 120; // Show for 2 seconds
  }
  
  /**
   * Draw all NPCs
   */
  draw(ctx, currentRoom = null) {
    this.npcs.forEach(npc => {
      // Only draw NPCs in current room
      if (currentRoom && npc.room !== currentRoom) return;
      
      ctx.save();
      
      // Draw NPC (simple animated circle)
      ctx.fillStyle = npc.color;
      ctx.beginPath();
      
      // Bobbing animation
      const bobOffset = Math.sin(npc.animationPhase) * 2;
      
      ctx.arc(
        npc.x, 
        npc.y + bobOffset, 
        npc.size, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      // Draw outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw direction indicator (simple line)
      ctx.strokeStyle = npc.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      const angle = Math.atan2(npc.targetY - npc.y, npc.targetX - npc.x);
      ctx.moveTo(npc.x, npc.y + bobOffset);
      ctx.lineTo(
        npc.x + Math.cos(angle) * npc.size * 1.5,
        npc.y + bobOffset + Math.sin(angle) * npc.size * 1.5
      );
      ctx.stroke();
      
      // Draw dialogue bubble if active
      if (npc.currentDialogue && npc.dialogueTimer > 0) {
        this.drawDialogueBubble(ctx, npc, bobOffset);
      }
      
      ctx.restore();
    });
  }
  
  /**
   * Draw dialogue bubble
   */
  drawDialogueBubble(ctx, npc, bobOffset) {
    const text = npc.currentDialogue;
    const padding = 10;
    const bubbleY = npc.y + bobOffset - npc.size - 20;
    
    // Measure text
    ctx.font = '12px Arial';
    const textWidth = ctx.measureText(text).width;
    const bubbleWidth = textWidth + padding * 2;
    const bubbleHeight = 30;
    const bubbleX = npc.x - bubbleWidth / 2;
    
    // Draw bubble background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.strokeStyle = npc.color;
    ctx.lineWidth = 2;
    
    // Rounded rectangle
    this.drawRoundedRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 5);
    ctx.fill();
    ctx.stroke();
    
    // Draw pointer
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.moveTo(npc.x, npc.y + bobOffset - npc.size);
    ctx.lineTo(npc.x - 5, bubbleY + bubbleHeight);
    ctx.lineTo(npc.x + 5, bubbleY + bubbleHeight);
    ctx.closePath();
    ctx.fill();
    
    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, npc.x, bubbleY + bubbleHeight / 2);
  }
  
  /**
   * Helper: Draw rounded rectangle
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
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
  }
  
  /**
   * Get NPCs in a specific room
   */
  getNPCsInRoom(room) {
    return this.npcs.filter(npc => npc.room === room);
  }
  
  /**
   * Resize canvas
   */
  resize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
  
  /**
   * Clear all NPCs
   */
  clear() {
    this.npcs = [];
  }
}

export default StarbaseNPCSystem;

