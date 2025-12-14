import Metal
import MetalKit
import simd

class GameRenderer: NSObject, MTKViewDelegate {
    private var commandQueue: MTLCommandQueue?
    private var pipelineState: MTLRenderPipelineState?
    private var metalView: MTKView
    private var viewportSize: CGSize
    
    init(metalView: MTKView) {
        self.metalView = metalView
        self.viewportSize = metalView.bounds.size
        
        super.init()
        
        setupMetal()
    }
    
    private func setupMetal() {
        guard let device = metalView.device else { return }
        
        commandQueue = device.makeCommandQueue()
        
        let library = device.makeDefaultLibrary()
        let pipelineDescriptor = MTLRenderPipelineDescriptor()
        pipelineDescriptor.label = "Game Pipeline"
        pipelineDescriptor.vertexFunction = library?.makeFunction(name: "vertexShader")
        pipelineDescriptor.fragmentFunction = library?.makeFunction(name: "fragmentShader")
        pipelineDescriptor.colorAttachments[0].pixelFormat = metalView.colorPixelFormat
        
        do {
            pipelineState = try device.makeRenderPipelineState(descriptor: pipelineDescriptor)
        } catch {
            print("Failed to create pipeline state: \(error)")
        }
    }
    
    func render(gameState: GameState) {
        guard let drawable = metalView.currentDrawable,
              let descriptor = metalView.currentRenderPassDescriptor else { return }
        
        descriptor.colorAttachments[0].clearColor = MTLClearColor(red: 0.0, green: 0.0, blue: 0.1, alpha: 1.0)
        descriptor.colorAttachments[0].loadAction = .clear
        
        guard let commandBuffer = commandQueue?.makeCommandBuffer(),
              let renderEncoder = commandBuffer.makeRenderCommandEncoder(descriptor: descriptor),
              let pipelineState = pipelineState else { return }
        
        renderEncoder.setRenderPipelineState(pipelineState)
        renderEncoder.setViewport(MTLViewport(originX: 0, originY: 0, width: Double(viewportSize.width),
                                              height: Double(viewportSize.height), znear: 0, zfar: 1))
        
        // Render game objects here
        renderUI(renderEncoder: renderEncoder, gameState: gameState)
        
        renderEncoder.endEncoding()
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
    
    func resize(size: CGSize) {
        viewportSize = size
    }
    
    private func renderUI(renderEncoder: MTLRenderCommandEncoder, gameState: GameState) {
        // UI rendering logic would go here
        // For now, this is a placeholder
    }
}
