// Mobile and Desktop Fit Test
console.log("📱 Mobile & Desktop Fit Test");
console.log("============================");

// Test 1: Check viewport handling
console.log("
📐 Test 1: Viewport Handling");
console.log("✅ Screen Size:", window.innerWidth + "x" + window.innerHeight);
console.log("✅ Device Pixel Ratio:", window.devicePixelRatio);
console.log("✅ Viewport Meta Tag:", document.querySelector("meta[name=viewport]") ? "Present" : "Missing");

// Test 2: Check game container
console.log("
🎮 Test 2: Game Container");
const gameContainer = document.querySelector(".game-container");
if (gameContainer) {
    console.log("✅ Container Width:", gameContainer.offsetWidth + "px");
    console.log("✅ Container Height:", gameContainer.offsetHeight + "px");
    console.log("✅ Container CSS Width:", getComputedStyle(gameContainer).width);
    console.log("✅ Container CSS Height:", getComputedStyle(gameContainer).height);
    
    const fitsScreen = gameContainer.offsetWidth === window.innerWidth && gameContainer.offsetHeight === window.innerHeight;
    console.log("✅ Fits Screen:", fitsScreen ? "Yes" : "No");
} else {
    console.log("❌ Game Container: Not found");
}

// Test 3: Check canvas sizing
console.log("
🎨 Test 3: Canvas Sizing");
const canvas = document.getElementById("gameCanvas");
if (canvas) {
    console.log("✅ Canvas Width:", canvas.width + "px");
    console.log("✅ Canvas Height:", canvas.height + "px");
    console.log("✅ Canvas Display Width:", canvas.offsetWidth + "px");
    console.log("✅ Canvas Display Height:", canvas.offsetHeight + "px");
    
    const canvasFits = canvas.width === window.innerWidth && canvas.height === window.innerHeight;
    console.log("✅ Canvas Fits Screen:", canvasFits ? "Yes" : "No");
} else {
    console.log("❌ Canvas: Not found");
}

// Test 4: Check mobile detection
console.log("
📱 Test 4: Mobile Detection");
const userAgent = navigator.userAgent;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
const hasTouch = "ontouchstart" in window;
const screenWidth = window.innerWidth;

console.log("✅ User Agent:", userAgent.substring(0, 50) + "...");
console.log("✅ Mobile Device:", isMobile ? "Yes" : "No");
console.log("✅ Touch Support:", hasTouch ? "Yes" : "No");
console.log("✅ Screen Width:", screenWidth + "px");

// Test 5: Check mobile controls
console.log("
👆 Test 5: Mobile Controls");
const mobileControls = document.querySelector(".mobile-controls");
if (mobileControls) {
    const isVisible = mobileControls.style.display === "flex" || getComputedStyle(mobileControls).display === "flex";
    console.log("✅ Mobile Controls Visible:", isVisible ? "Yes" : "No");
    console.log("✅ Mobile Controls Display:", getComputedStyle(mobileControls).display);
} else {
    console.log("❌ Mobile Controls: Not found");
}

// Test 6: Check responsive CSS
console.log("
🎨 Test 6: Responsive CSS");
const styles = document.styleSheets;
let hasMediaQueries = false;
for (let i = 0; i < styles.length; i++) {
    try {
        const rules = styles[i].cssRules || styles[i].rules;
        for (let j = 0; j < rules.length; j++) {
            if (rules[j].type === CSSRule.MEDIA_RULE) {
                hasMediaQueries = true;
                console.log("✅ Media Query Found:", rules[j].conditionText);
            }
        }
    } catch (e) {
        // Cross-origin stylesheets may throw errors
    }
}
console.log("✅ Has Media Queries:", hasMediaQueries ? "Yes" : "No");

// Test 7: Check UI positioning
console.log("
📊 Test 7: UI Positioning");
const ui = document.getElementById("ui");
if (ui) {
    const uiRect = ui.getBoundingClientRect();
    console.log("✅ UI Position:", "x:" + uiRect.left + ", y:" + uiRect.top);
    console.log("✅ UI Size:", uiRect.width + "x" + uiRect.height);
    console.log("✅ UI Visible:", uiRect.width > 0 && uiRect.height > 0 ? "Yes" : "No");
} else {
    console.log("❌ UI: Not found");
}

// Test 8: Simulate different screen sizes
console.log("
🖥️ Test 8: Screen Size Simulation");
const testSizes = [
    { name: "Desktop Large", width: 1920, height: 1080 },
    { name: "Desktop Medium", width: 1366, height: 768 },
    { name: "Tablet", width: 768, height: 1024 },
    { name: "Mobile Large", width: 414, height: 896 },
    { name: "Mobile Medium", width: 375, height: 667 },
    { name: "Mobile Small", width: 320, height: 568 }
];

for (const size of testSizes) {
    const wouldFit = size.width <= window.innerWidth && size.height <= window.innerHeight;
    console.log("✅ " + size.name + " (" + size.width + "x" + size.height + "):", wouldFit ? "Would Fit" : "Too Large");
}

// Summary
console.log("
📊 Fit Test Summary");
console.log("===================");
const containerFits = gameContainer && gameContainer.offsetWidth === window.innerWidth && gameContainer.offsetHeight === window.innerHeight;
const canvasFits = canvas && canvas.width === window.innerWidth && canvas.height === window.innerHeight;
const mobileReady = mobileControls && (isMobile || hasTouch || screenWidth <= 768);

console.log("✅ Container Fits Screen:", containerFits ? "Yes" : "No");
console.log("✅ Canvas Fits Screen:", canvasFits ? "Yes" : "No");
console.log("✅ Mobile Ready:", mobileReady ? "Yes" : "No");
console.log("✅ Responsive Design:", hasMediaQueries ? "Yes" : "No");

const allTestsPass = containerFits && canvasFits && mobileReady && hasMediaQueries;
console.log("
🎯 Overall Result:", allTestsPass ? "✅ PASSED - Game fits mobile and desktop!" : "❌ FAILED - Issues detected");

if (allTestsPass) {
    console.log("🚀 The game is ready for both mobile and desktop devices!");
} else {
    console.log("⚠️ Some issues need to be addressed for full compatibility.");
}
