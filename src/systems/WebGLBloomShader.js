/**
 * WebGL Bloom Shader System
 * Professional AAA-quality glow effects to compete with Phoenix 2
 */

export class WebGLBloomShader {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = this.initWebGL();
    this.enabled = !!this.gl;
    
    if (this.enabled) {
      this.setupShaders();
      this.setupBuffers();
      this.setupTextures();
    }
  }

  initWebGL() {
    try {
      const gl = this.canvas.getContext('webgl2', { 
        alpha: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true
      }) || this.canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true
      });
      
      if (!gl) return null;
      
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      return gl;
    } catch (e) {
      console.warn('WebGL init failed:', e);
      return null;
    }
  }

  setupShaders() {
    const gl = this.gl;

    // Vertex shader (passthrough)
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    // Fragment shader with Gaussian bloom
    const fragmentShaderSource = `
      precision highp float;
      uniform sampler2D u_image;
      uniform vec2 u_resolution;
      uniform float u_bloomIntensity;
      uniform float u_bloomThreshold;
      varying vec2 v_texCoord;
      
      vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.411764705882353) * direction;
        vec2 off2 = vec2(3.2941176470588234) * direction;
        vec2 off3 = vec2(5.176470588235294) * direction;
        
        color += texture2D(image, uv) * 0.1964825501511404;
        color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
        color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
        color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
        color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
        color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
        color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
        
        return color;
      }
      
      void main() {
        vec4 original = texture2D(u_image, v_texCoord);
        
        // Extract bright areas
        vec4 bright = vec4(0.0);
        float brightness = dot(original.rgb, vec3(0.2126, 0.7152, 0.0722));
        if (brightness > u_bloomThreshold) {
          bright = original * (brightness - u_bloomThreshold);
        }
        
        // Blur bright areas (horizontal)
        vec4 blurH = blur13(u_image, v_texCoord, u_resolution, vec2(1.0, 0.0));
        // Blur bright areas (vertical)
        vec4 blurV = blur13(u_image, v_texCoord, u_resolution, vec2(0.0, 1.0));
        
        vec4 bloom = (blurH + blurV) * 0.5 * u_bloomIntensity;
        
        // Combine original + bloom
        gl_FragColor = original + bloom * vec4(1.2, 1.1, 1.0, 1.0); // Slight color tint
      }
    `;

    this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
    
    if (!this.program) {
      this.enabled = false;
      return;
    }

    // Get attribute and uniform locations
    this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
    this.texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');
    this.imageLocation = gl.getUniformLocation(this.program, 'u_image');
    this.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
    this.bloomIntensityLocation = gl.getUniformLocation(this.program, 'u_bloomIntensity');
    this.bloomThresholdLocation = gl.getUniformLocation(this.program, 'u_bloomThreshold');
  }

  createProgram(vertexSource, fragmentSource) {
    const gl = this.gl;
    
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link failed:', gl.getProgramInfoLog(program));
      return null;
    }

    return program;
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  setupBuffers() {
    const gl = this.gl;

    // Full-screen quad
    const positions = new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
      -1,  1,  0, 1,
       1, -1,  1, 0,
       1,  1,  1, 1
    ]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  }

  setupTextures() {
    const gl = this.gl;
    
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  /**
   * Apply bloom effect to canvas
   */
  applyBloom(sourceCanvas, intensity = 0.6, threshold = 0.5) {
    if (!this.enabled) return;

    const gl = this.gl;
    
    // Upload canvas texture
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);

    // Use shader program
    gl.useProgram(this.program);

    // Set uniforms
    gl.uniform1i(this.imageLocation, 0);
    gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.bloomIntensityLocation, intensity);
    gl.uniform1f(this.bloomThresholdLocation, threshold);

    // Setup attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(this.texCoordLocation);
    gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    // Draw
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Copy result back to 2D canvas
    const ctx = sourceCanvas.getContext('2d');
    ctx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    ctx.drawImage(this.canvas, 0, 0);
  }

  resize(width, height) {
    if (!this.enabled) return;
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  setEnabled(enabled) {
    this.enabled = enabled && !!this.gl;
  }
}

export default WebGLBloomShader;

