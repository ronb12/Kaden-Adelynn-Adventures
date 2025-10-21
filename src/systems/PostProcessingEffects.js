/**
 * Post-Processing Effects System
 * AAA-quality effects: bloom, motion blur, chromatic aberration, vignette
 * Pushes visuals to Phoenix 2 / HAWK quality level
 */

export class PostProcessingEffects {
  constructor() {
    this.motionBlurFrames = [];
    this.maxMotionBlurFrames = 3;
  }

  /**
   * Motion Blur Effect (creates sense of speed)
   */
  applyMotionBlur(ctx, canvas, intensity = 0.3) {
    if (this.motionBlurFrames.length === 0) return;

    ctx.save();
    
    // Draw previous frames with decreasing opacity
    this.motionBlurFrames.forEach((frame, index) => {
      const alpha = intensity * (1 - (index / this.motionBlurFrames.length));
      ctx.globalAlpha = alpha;
      ctx.globalCompositeOperation = 'lighter';
      
      if (frame && frame.complete) {
        ctx.drawImage(frame, 0, 0);
      }
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  /**
   * Capture current frame for motion blur
   */
  captureFrame(canvas) {
    // Store current frame
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = canvas.width;
    frameCanvas.height = canvas.height;
    const frameCtx = frameCanvas.getContext('2d');
    frameCtx.drawImage(canvas, 0, 0);

    this.motionBlurFrames.unshift(frameCanvas);
    
    // Keep only last N frames
    if (this.motionBlurFrames.length > this.maxMotionBlurFrames) {
      this.motionBlurFrames.pop();
    }
  }

  /**
   * Chromatic Aberration (RGB color split)
   */
  applyChromaticAberration(ctx, canvas, intensity = 2) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const offset = intensity;

    // Create separate color channels
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);

    // Clear original
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw red channel shifted
    ctx.globalCompositeOperation = 'lighter';
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.drawImage(tempCanvas, -offset, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    // Draw green channel normal
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();

    // Draw blue channel shifted opposite
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(tempCanvas, offset, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  /**
   * Vignette Effect (darkens edges)
   */
  applyVignette(ctx, canvas, intensity = 0.5) {
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.height / 4,
      canvas.width / 2, canvas.height / 2, canvas.height / 1.2
    );

    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Color Grading (cinematic color correction)
   */
  applyColorGrading(ctx, canvas, preset = 'space') {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const presets = {
      space: { r: 0.9, g: 1.0, b: 1.2, contrast: 1.1 }, // Cool blue tint
      warm: { r: 1.2, g: 1.1, b: 0.9, contrast: 1.05 }, // Warm orange
      dramatic: { r: 1.1, g: 0.95, b: 1.1, contrast: 1.3 }, // High contrast purple
      neon: { r: 1.3, g: 0.9, b: 1.4, contrast: 1.2 } // Vibrant neon
    };

    const grade = presets[preset] || presets.space;

    for (let i = 0; i < data.length; i += 4) {
      // Apply color multipliers
      data[i] *= grade.r; // Red
      data[i + 1] *= grade.g; // Green
      data[i + 2] *= grade.b; // Blue

      // Apply contrast
      data[i] = ((data[i] / 255 - 0.5) * grade.contrast + 0.5) * 255;
      data[i + 1] = ((data[i + 1] / 255 - 0.5) * grade.contrast + 0.5) * 255;
      data[i + 2] = ((data[i + 2] / 255 - 0.5) * grade.contrast + 0.5) * 255;

      // Clamp values
      data[i] = Math.max(0, Math.min(255, data[i]));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Scan Lines (retro CRT effect)
   */
  applyScanLines(ctx, canvas, intensity = 0.1) {
    ctx.fillStyle = `rgba(0, 0, 0, ${intensity})`;
    for (let y = 0; y < canvas.height; y += 2) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
  }

  /**
   * Light Rays (volumetric god rays)
   */
  applyLightRays(ctx, canvas, sourceX, sourceY, intensity = 0.3) {
    const rayCount = 12;
    const rayLength = Math.max(canvas.width, canvas.height);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = intensity;

    for (let i = 0; i < rayCount; i++) {
      const angle = (Math.PI * 2 / rayCount) * i;
      const gradient = ctx.createLinearGradient(
        sourceX, sourceY,
        sourceX + Math.cos(angle) * rayLength,
        sourceY + Math.sin(angle) * rayLength
      );

      gradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sourceX, sourceY);
      ctx.lineTo(
        sourceX + Math.cos(angle) * rayLength,
        sourceY + Math.sin(angle) * rayLength
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Screen Space Ambient Occlusion (SSAO-like darkening)
   */
  applyAmbientOcclusion(ctx, canvas) {
    // Darken areas around objects for depth
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple edge detection and darkening
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const idx = (y * canvas.width + x) * 4;
        
        // Check if pixel is opaque
        if (data[idx + 3] > 200) {
          // Darken slightly for depth
          data[idx] *= 0.95;
          data[idx + 1] *= 0.95;
          data[idx + 2] *= 0.95;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Lens Flare (bright light effect)
   */
  applyLensFlare(ctx, x, y, color = '#ffffff', intensity = 1.0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Main flare
    const mainGradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
    mainGradient.addColorStop(0, this.addAlpha(color, intensity));
    mainGradient.addColorStop(0.5, this.addAlpha(color, intensity * 0.5));
    mainGradient.addColorStop(1, this.addAlpha(color, 0));

    ctx.fillStyle = mainGradient;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();

    // Secondary flares
    for (let i = 0; i < 3; i++) {
      const offset = 30 + i * 20;
      const flareGradient = ctx.createRadialGradient(
        x + offset, y, 0,
        x + offset, y, 15
      );
      flareGradient.addColorStop(0, this.addAlpha(color, intensity * 0.4));
      flareGradient.addColorStop(1, this.addAlpha(color, 0));

      ctx.fillStyle = flareGradient;
      ctx.beginPath();
      ctx.arc(x + offset, y, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Apply all effects in optimal order
   */
  applyAllEffects(ctx, canvas, options = {}) {
    const {
      motionBlur = true,
      vignette = true,
      colorGrading = 'space',
      lensFlare = null, // {x, y, color, intensity}
      lightRays = null, // {x, y, intensity}
      intensity = 1.0
    } = options;

    // Motion blur (first, affects whole frame)
    if (motionBlur) {
      this.applyMotionBlur(ctx, canvas, 0.2 * intensity);
    }

    // Color grading (affects all colors)
    if (colorGrading) {
      this.applyColorGrading(ctx, canvas, colorGrading);
    }

    // Light rays (additive)
    if (lightRays) {
      this.applyLightRays(ctx, canvas, lightRays.x, lightRays.y, lightRays.intensity || 0.3);
    }

    // Lens flare (additive highlights)
    if (lensFlare) {
      this.applyLensFlare(ctx, lensFlare.x, lensFlare.y, lensFlare.color || '#ffffff', lensFlare.intensity || 1.0);
    }

    // Vignette (final framing)
    if (vignette) {
      this.applyVignette(ctx, canvas, 0.4 * intensity);
    }

    // Capture frame for next motion blur
    if (motionBlur) {
      this.captureFrame(canvas);
    }
  }
}

export default PostProcessingEffects;

