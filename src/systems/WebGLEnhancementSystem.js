/**
 * WebGL Enhancement System
 * Performance optimizations and visual enhancements using WebGL
 * Can work alongside Canvas2D or as standalone WebGL renderer
 */

export class WebGLShader {
  constructor(gl, vertexSource, fragmentSource) {
    this.gl = gl;
    this.program = this.createProgram(vertexSource, fragmentSource);
    this.attributes = {};
    this.uniforms = {};
  }

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  createProgram(vertexSource, fragmentSource) {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }

  use() {
    this.gl.useProgram(this.program);
  }

  getAttribute(name) {
    if (!this.attributes[name]) {
      this.attributes[name] = this.gl.getAttribLocation(this.program, name);
    }
    return this.attributes[name];
  }

  getUniform(name) {
    if (!this.uniforms[name]) {
      this.uniforms[name] = this.gl.getUniformLocation(this.program, name);
    }
    return this.uniforms[name];
  }
}

export class WebGLEnhancementSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = this.initializeWebGL();
    this.enabled = !!this.gl;
    this.shaders = {};
    this.buffers = {};
    this.textures = {};
    this.frameBuffer = null;
    
    if (this.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize WebGL context
   */
  initializeWebGL() {
    try {
      const gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
      
      if (!gl) {
        console.warn('WebGL not supported, falling back to Canvas2D');
        return null;
      }
      
      // Enable blending for transparency
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      return gl;
    } catch (e) {
      console.error('WebGL initialization failed:', e);
      return null;
    }
  }

  /**
   * Initialize shaders and buffers
   */
  initialize() {
    if (!this.enabled) return;
    
    // Basic particle shader
    const particleVertexShader = `
      attribute vec2 a_position;
      attribute vec2 a_velocity;
      attribute vec4 a_color;
      attribute float a_size;
      attribute float a_life;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      
      varying vec4 v_color;
      varying float v_life;
      
      void main() {
        vec2 position = a_position + a_velocity * u_time;
        vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
        clipSpace.y *= -1.0;
        
        gl_Position = vec4(clipSpace, 0.0, 1.0);
        gl_PointSize = a_size;
        
        v_color = a_color;
        v_life = a_life;
      }
    `;
    
    const particleFragmentShader = `
      precision mediump float;
      
      varying vec4 v_color;
      varying float v_life;
      
      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        if (dist > 0.5) discard;
        
        float alpha = (1.0 - dist * 2.0) * v_color.a * v_life;
        gl_FragColor = vec4(v_color.rgb, alpha);
      }
    `;
    
    this.shaders.particle = new WebGLShader(this.gl, particleVertexShader, particleFragmentShader);
    
    // Glow effect shader
    const glowVertexShader = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;
    
    const glowFragmentShader = `
      precision mediump float;
      
      uniform sampler2D u_texture;
      uniform vec2 u_resolution;
      uniform float u_intensity;
      
      varying vec2 v_texCoord;
      
      void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        
        // Simple bloom/glow effect
        vec2 texelSize = 1.0 / u_resolution;
        vec4 bloom = vec4(0.0);
        
        for (float x = -2.0; x <= 2.0; x++) {
          for (float y = -2.0; y <= 2.0; y++) {
            vec2 offset = vec2(x, y) * texelSize;
            bloom += texture2D(u_texture, v_texCoord + offset);
          }
        }
        
        bloom /= 25.0;
        gl_FragColor = color + bloom * u_intensity;
      }
    `;
    
    this.shaders.glow = new WebGLShader(this.gl, glowVertexShader, glowFragmentShader);
    
    // Create buffers
    this.createBuffers();
  }

  /**
   * Create vertex buffers
   */
  createBuffers() {
    const gl = this.gl;
    
    // Particle buffer (for instanced rendering)
    this.buffers.particles = {
      position: gl.createBuffer(),
      velocity: gl.createBuffer(),
      color: gl.createBuffer(),
      size: gl.createBuffer(),
      life: gl.createBuffer()
    };
    
    // Screen quad for post-processing
    this.buffers.quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.quad);
    const quadVertices = new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
       1,  1,  1, 1
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
  }

  /**
   * Render particles using WebGL
   */
  renderParticles(particles) {
    if (!this.enabled || !this.shaders.particle) return;
    
    const gl = this.gl;
    const shader = this.shaders.particle;
    
    shader.use();
    
    // Prepare particle data
    const positions = [];
    const velocities = [];
    const colors = [];
    const sizes = [];
    const lives = [];
    
    particles.forEach(p => {
      positions.push(p.x, p.y);
      velocities.push(p.vx, p.vy);
      
      // Parse color (assumes '#rrggbb' format or rgba)
      const color = this.parseColor(p.color);
      colors.push(color.r, color.g, color.b, p.alpha || 1);
      
      sizes.push(p.size);
      lives.push(p.life / p.maxLife);
    });
    
    // Upload data to GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.particles.position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.particles.velocity);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(velocities), gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.particles.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.particles.size);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.particles.life);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lives), gl.DYNAMIC_DRAW);
    
    // Set uniforms
    gl.uniform2f(shader.getUniform('u_resolution'), this.canvas.width, this.canvas.height);
    gl.uniform1f(shader.getUniform('u_time'), performance.now() / 1000);
    
    // Draw particles
    gl.drawArrays(gl.POINTS, 0, particles.length);
  }

  /**
   * Apply glow post-processing effect
   */
  applyGlowEffect(intensity = 0.3) {
    if (!this.enabled || !this.shaders.glow) return;
    
    const gl = this.gl;
    const shader = this.shaders.glow;
    
    shader.use();
    
    // Set uniforms
    gl.uniform2f(shader.getUniform('u_resolution'), this.canvas.width, this.canvas.height);
    gl.uniform1f(shader.getUniform('u_intensity'), intensity);
    
    // Render full-screen quad
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.quad);
    
    const positionLoc = shader.getAttribute('a_position');
    const texCoordLoc = shader.getAttribute('a_texCoord');
    
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);
    
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 16, 8);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /**
   * Parse color string to RGBA
   */
  parseColor(colorString) {
    if (colorString.startsWith('#')) {
      const hex = colorString.slice(1);
      return {
        r: parseInt(hex.slice(0, 2), 16) / 255,
        g: parseInt(hex.slice(2, 4), 16) / 255,
        b: parseInt(hex.slice(4, 6), 16) / 255,
        a: 1
      };
    }
    
    // Default white
    return { r: 1, g: 1, b: 1, a: 1 };
  }

  /**
   * Clear screen
   */
  clear(r = 0, g = 0, b = 0, a = 1) {
    if (!this.enabled) return;
    
    this.gl.clearColor(r, g, b, a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  /**
   * Resize viewport
   */
  resize(width, height) {
    if (!this.enabled) return;
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  /**
   * Performance optimization: Batch rendering
   */
  batchRender(renderCalls) {
    if (!this.enabled) return;
    
    // Group similar render calls and execute them together
    // This reduces state changes and improves performance
    const batches = {};
    
    renderCalls.forEach(call => {
      const key = call.shader + '_' + call.texture;
      if (!batches[key]) {
        batches[key] = [];
      }
      batches[key].push(call);
    });
    
    // Render each batch
    Object.values(batches).forEach(batch => {
      // Setup shader and texture once for entire batch
      batch.forEach(call => call.execute());
    });
  }

  /**
   * Get WebGL capabilities
   */
  getCapabilities() {
    if (!this.enabled) {
      return { supported: false };
    }
    
    const gl = this.gl;
    return {
      supported: true,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER)
    };
  }

  /**
   * Enable/disable WebGL rendering
   */
  setEnabled(enabled) {
    this.enabled = enabled && !!this.gl;
  }

  /**
   * Check if WebGL is available and enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

/**
 * Performance Monitor for WebGL
 */
export class WebGLPerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.frameTime = 16.67;
    this.drawCalls = 0;
    this.triangles = 0;
  }

  startFrame() {
    this.frameStart = performance.now();
    this.drawCalls = 0;
    this.triangles = 0;
  }

  endFrame() {
    const now = performance.now();
    this.frameTime = now - this.frameStart;
    
    this.frameCount++;
    
    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
    }
  }

  recordDrawCall(triangleCount = 0) {
    this.drawCalls++;
    this.triangles += triangleCount;
  }

  getStats() {
    return {
      fps: this.fps,
      frameTime: this.frameTime.toFixed(2),
      drawCalls: this.drawCalls,
      triangles: this.triangles
    };
  }
}

export default WebGLEnhancementSystem;

