import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            GameWebView()
                .ignoresSafeArea()
        }
    }
}

struct GameWebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.backgroundColor = .black
        webView.isOpaque = false
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        
        // Load the HTML game file
        if let htmlURL = Bundle.main.url(forResource: "index", withExtension: "html") {
            webView.loadFileURL(htmlURL, allowingReadAccessTo: htmlURL.deletingLastPathComponent())
        }
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {}
} 