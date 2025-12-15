import Metal
import MetalKit
import simd

class GameRenderer: NSObject {
    private var commandQueue: MTLCommandQueue?
    private var pipelineState: MTLRenderPipelineState?
    private var metalView: MTKView
    private var viewportSize: CGSize
    
    init(metalView: MTKView) {
        self.metalView = metalView
        self.viewportSize = metalView.bounds.size
        print("[DEBUG] GameRenderer init called")
        super.init()
        setupMetal()
    }
    
    private func setupMetal() {
        guard let device = metalView.device else {
            print("[DEBUG] No Metal device found in GameRenderer")
            return
        }
        print("[DEBUG] GameRenderer setupMetal with device: \(device)")
        commandQueue = device.makeCommandQueue()
        if commandQueue == nil {
            print("[DEBUG] Failed to create Metal command queue")
        }
        // Create a basic Metal shader library
        let shaderSource = """
        #include <metal_stdlib>
        using namespace metal;
        
        struct VertexOut {
            float4 position [[position]];
            float4 color;
        };
        
        vertex VertexOut vertexShader(uint vertexID [[vertex_id]]) {
            VertexOut out;
            out.position = float4(0.0, 0.0, 0.0, 1.0);
            out.color = float4(0.0, 0.0, 0.1, 1.0);
            return out;
        }
        
        fragment float4 fragmentShader(VertexOut in [[stage_in]]) {
            return in.color;
        }
        """
        
        do {
            let library = try device.makeLibrary(source: shaderSource, options: nil)
            let pipelineDescriptor = MTLRenderPipelineDescriptor()
            pipelineDescriptor.label = "Game Pipeline"
            pipelineDescriptor.vertexFunction = library.makeFunction(name: "vertexShader")
            pipelineDescriptor.fragmentFunction = library.makeFunction(name: "fragmentShader")
            pipelineDescriptor.colorAttachments[0].pixelFormat = metalView.colorPixelFormat
            
            pipelineState = try device.makeRenderPipelineState(descriptor: pipelineDescriptor)
        } catch {
            print("Failed to create shader library or pipeline state: \(error)")
        }
    }
    
    func render(gameState: GameState) {
          guard let drawable = metalView.currentDrawable,
              let descriptor = metalView.currentRenderPassDescriptor else {
            print("[DEBUG] No drawable or render pass descriptor available")
            return
          }
          print("[DEBUG] render() called, drawable and descriptor available")
          descriptor.colorAttachments[0].clearColor = MTLClearColor(red: 0.0, green: 0.0, blue: 0.1, alpha: 1.0)
          descriptor.colorAttachments[0].loadAction = .clear
          guard let commandBuffer = commandQueue?.makeCommandBuffer(),
              let renderEncoder = commandBuffer.makeRenderCommandEncoder(descriptor: descriptor),
              let pipelineState = pipelineState else {
            print("[DEBUG] Failed to create command buffer, render encoder, or pipeline state")
            return
          }
          renderEncoder.setRenderPipelineState(pipelineState)
          renderEncoder.setViewport(MTLViewport(originX: 0, originY: 0, width: Double(viewportSize.width),
                                    height: Double(viewportSize.height), znear: 0, zfar: 1))
          // Render game objects here
          renderUI(renderEncoder: renderEncoder, gameState: gameState)
          renderEncoder.endEncoding()
          commandBuffer.present(drawable)
          commandBuffer.commit()
          print("[DEBUG] Frame rendered and presented")
    }
    
    func resize(size: CGSize) {
        viewportSize = size
    }
    
    private func renderUI(renderEncoder: MTLRenderCommandEncoder, gameState: GameState) {
        // UI rendering logic would go here
        // For now, this is a placeholder
    }
}
