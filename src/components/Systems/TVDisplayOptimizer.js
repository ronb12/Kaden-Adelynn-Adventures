/**
 * TVDisplayOptimizer - Optimizes game display for TV screens of all sizes
 * Supports 4K, 8K, Ultra-wide, and standard TV displays
 */
export class TVDisplayOptimizer {
  constructor() {
    this.isTV = false;
    this.tvType = 'unknown';
    this.screenSize = 'unknown';
    this.aspectRatio = 'unknown';
    this.resolution = { width: 0, height: 0 };
    this.optimizations = {
      scaling: 1,
      uiScale: 1,
      fontScale: 1,
      controllerScale: 1
    };
    
    this.detectTVDisplay();
  }

  /**
   * Detect if running on a TV display
   */
  detectTVDisplay() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    this.resolution = { width, height };
    
    // TV detection criteria
    if (width >= 2560) {
      this.isTV = true;
      this.tvType = 'ultra-large';
      this.screenSize = this.getScreenSize(width, height);
      this.aspectRatio = this.getAspectRatio(aspectRatio);
      this.optimizations = this.getUltraLargeOptimizations();
    } else if (width >= 1920) {
      this.isTV = true;
      this.tvType = 'large';
      this.screenSize = this.getScreenSize(width, height);
      this.aspectRatio = this.getAspectRatio(aspectRatio);
      this.optimizations = this.getLargeOptimizations();
    } else if (width >= 1200) {
      this.isTV = true;
      this.tvType = 'standard';
      this.screenSize = this.getScreenSize(width, height);
      this.aspectRatio = this.getAspectRatio(aspectRatio);
      this.optimizations = this.getStandardOptimizations();
    }
    
    console.log(`📺 TV Display Detection:`, {
      isTV: this.isTV,
      tvType: this.tvType,
      screenSize: this.screenSize,
      aspectRatio: this.aspectRatio,
      resolution: this.resolution,
      optimizations: this.optimizations
    });
  }

  /**
   * Get screen size category
   */
  getScreenSize(width, height) {
    const diagonal = Math.sqrt(width * width + height * height) / 96; // Convert pixels to inches (96 DPI)
    
    if (diagonal >= 75) return 'extra-large'; // 75"+
    if (diagonal >= 55) return 'large';       // 55"-74"
    if (diagonal >= 40) return 'medium';      // 40"-54"
    if (diagonal >= 32) return 'small';       // 32"-39"
    return 'unknown';
  }

  /**
   * Get aspect ratio category
   */
  getAspectRatio(ratio) {
    if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
    if (Math.abs(ratio - 21/9) < 0.1) return '21:9';
    if (Math.abs(ratio - 32/9) < 0.1) return '32:9';
    if (Math.abs(ratio - 4/3) < 0.1) return '4:3';
    if (Math.abs(ratio - 3/2) < 0.1) return '3:2';
    return 'unknown';
  }

  /**
   * Get optimizations for ultra-large TVs (4K, 8K)
   */
  getUltraLargeOptimizations() {
    return {
      scaling: 1.8,
      uiScale: 1.8,
      fontScale: 1.6,
      controllerScale: 1.4,
      maxCanvasWidth: 2560,
      maxCanvasHeight: 1440,
      uiFontSize: 20,
      buttonPadding: 25,
      menuPadding: 50
    };
  }

  /**
   * Get optimizations for large TVs (1080p, 1440p)
   */
  getLargeOptimizations() {
    return {
      scaling: 1.4,
      uiScale: 1.4,
      fontScale: 1.3,
      controllerScale: 1.2,
      maxCanvasWidth: 1920,
      maxCanvasHeight: 1080,
      uiFontSize: 18,
      buttonPadding: 20,
      menuPadding: 40
    };
  }

  /**
   * Get optimizations for standard TVs
   */
  getStandardOptimizations() {
    return {
      scaling: 1.2,
      uiScale: 1.1,
      fontScale: 1.1,
      controllerScale: 1.0,
      maxCanvasWidth: 1400,
      maxCanvasHeight: 900,
      uiFontSize: 16,
      buttonPadding: 18,
      menuPadding: 35
    };
  }

  /**
   * Get optimal canvas dimensions for TV
   */
  getOptimalCanvasSize() {
    if (!this.isTV) {
      // Use more screen space for non-TV displays too
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const aspectRatio = 8/7;
      
      let width = Math.min(screenWidth * 0.9, 1200);
      let height = Math.min(screenHeight * 0.85, 900);
      
      // Maintain aspect ratio
      const widthBasedHeight = width / aspectRatio;
      const heightBasedWidth = height * aspectRatio;
      
      if (widthBasedHeight <= height) {
        height = widthBasedHeight;
      } else {
        width = heightBasedWidth;
      }
      
      return { width: Math.round(width), height: Math.round(height) };
    }

    const { maxCanvasWidth, maxCanvasHeight } = this.optimizations;
    const aspectRatio = 8/7; // Game's native aspect ratio
    
    // Use more screen space - 90% instead of 80%
    let width = Math.min(this.resolution.width * 0.9, maxCanvasWidth);
    let height = Math.min(this.resolution.height * 0.9, maxCanvasHeight);
    
    // Maintain aspect ratio
    const widthBasedHeight = width / aspectRatio;
    const heightBasedWidth = height * aspectRatio;
    
    if (widthBasedHeight <= height) {
      height = widthBasedHeight;
    } else {
      width = heightBasedWidth;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Get optimal UI scaling
   */
  getUIScaling() {
    return this.optimizations.uiScale;
  }

  /**
   * Get optimal font scaling
   */
  getFontScaling() {
    return this.optimizations.fontScale;
  }

  /**
   * Get optimal controller scaling
   */
  getControllerScaling() {
    return this.optimizations.controllerScale;
  }

  /**
   * Apply TV-specific CSS classes
   */
  applyTVClasses(element) {
    if (!this.isTV) return;
    
    element.classList.add('tv-display');
    element.classList.add(`tv-${this.tvType}`);
    element.classList.add(`screen-${this.screenSize}`);
    element.classList.add(`aspect-${this.aspectRatio.replace(':', '-')}`);
  }

  /**
   * Get TV-specific CSS variables
   */
  getCSSVariables() {
    if (!this.isTV) return {};
    
    return {
      '--tv-scaling': this.optimizations.scaling,
      '--tv-ui-scale': this.optimizations.uiScale,
      '--tv-font-scale': this.optimizations.fontScale,
      '--tv-controller-scale': this.optimizations.controllerScale,
      '--tv-ui-font-size': `${this.optimizations.uiFontSize}px`,
      '--tv-button-padding': `${this.optimizations.buttonPadding}px`,
      '--tv-menu-padding': `${this.optimizations.menuPadding}px`
    };
  }

  /**
   * Apply TV optimizations to document
   */
  applyTVOptimizations() {
    if (!this.isTV) return;
    
    const root = document.documentElement;
    const variables = this.getCSSVariables();
    
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Add TV-specific classes to body
    document.body.classList.add('tv-display');
    document.body.classList.add(`tv-${this.tvType}`);
    
    console.log('📺 TV optimizations applied:', variables);
  }

  /**
   * Get TV display info
   */
  getTVInfo() {
    return {
      isTV: this.isTV,
      tvType: this.tvType,
      screenSize: this.screenSize,
      aspectRatio: this.aspectRatio,
      resolution: this.resolution,
      optimizations: this.optimizations
    };
  }

  /**
   * Check if display supports 4K
   */
  is4K() {
    return this.resolution.width >= 3840 || this.resolution.height >= 2160;
  }

  /**
   * Check if display supports 8K
   */
  is8K() {
    return this.resolution.width >= 7680 || this.resolution.height >= 4320;
  }

  /**
   * Check if display is ultra-wide
   */
  isUltraWide() {
    const ratio = this.resolution.width / this.resolution.height;
    return ratio >= 2.0; // 21:9 or wider
  }

  /**
   * Get recommended controller deadzone for TV
   */
  getRecommendedDeadzone() {
    if (!this.isTV) return 0.15;
    
    // Larger screens may need different deadzone
    if (this.screenSize === 'extra-large') return 0.12;
    if (this.screenSize === 'large') return 0.14;
    return 0.15;
  }

  /**
   * Get recommended touch sensitivity for TV
   */
  getRecommendedTouchSensitivity() {
    if (!this.isTV) return 1.5;
    
    // TV touch screens may need different sensitivity
    if (this.screenSize === 'extra-large') return 2.0;
    if (this.screenSize === 'large') return 1.8;
    return 1.5;
  }

  /**
   * Update display detection (for window resize)
   */
  update() {
    this.detectTVDisplay();
    this.applyTVOptimizations();
  }
}

// Export singleton instance
export const tvDisplayOptimizer = new TVDisplayOptimizer();
