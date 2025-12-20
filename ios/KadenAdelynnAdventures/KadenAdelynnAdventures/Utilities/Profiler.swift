//
// Profiler.swift
// KadenAdelynnAdventures
//
// Simple in-app profiler for frame timing and performance logging
//

import Foundation

class Profiler {
    static let shared = Profiler()
    private var frameTimes: [Double] = []
    private var lastTimestamp: TimeInterval = 0
    private let maxSamples = 120
    
    private init() {}
    
    func startFrame() {
        lastTimestamp = Date().timeIntervalSince1970
    }
    
    func endFrame() {
        let now = Date().timeIntervalSince1970
        let frameTime = now - lastTimestamp
        frameTimes.append(frameTime)
        if frameTimes.count > maxSamples {
            frameTimes.removeFirst()
        }
    }
    
    var averageFPS: Double {
        guard !frameTimes.isEmpty else { return 0 }
        let avg = frameTimes.reduce(0, +) / Double(frameTimes.count)
        return avg > 0 ? 1.0 / avg : 0
    }
    
    func logPerformance() {
        print("[Profiler] Average FPS: \(String(format: "%.1f", averageFPS))")
    }
}
