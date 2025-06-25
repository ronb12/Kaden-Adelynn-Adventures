// Game Feature Test Script - Run this in browser console
console.log("🚀 Kaden & Adelynn Space Adventures - Feature Test");
console.log("================================================");

// Test 1: Check game elements
console.log("
�� Test 1: Game Elements");
const elements = {
    canvas: document.getElementById("gameCanvas"),
    ui: document.getElementById("ui"),
    startScreen: document.getElementById("startScreen"),
    gameOver: document.getElementById("gameOver"),
    mobileControls: document.querySelector(".mobile-controls"),
    gameContainer: document.querySelector(".game-container")
};

let allElementsExist = true;
for (const [name, element] of Object.entries(elements)) {
    const exists = element !== null;
    console.log(`${exists ? "✅" : "❌"} ${name}: ${exists ? "Found" : "Missing"}`);
    if (!exists) allElementsExist = false;
}

// Test 2: Check mobile detection
console.log("
📱 Test 2: Mobile Detection");
const userAgent = navigator.userAgent;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
const hasTouch = "ontouchstart" in window;
const screenWidth = window.innerWidth;

console.log(`✅ User Agent: ${userAgent.substring(0, 50)}...`);
console.log(`✅ Mobile Device: ${isMobile ? "Yes" : "No"}`);
console.log(`✅ Touch Support: ${hasTouch ? "Yes" : "No"}`);
console.log(`✅ Screen Width: ${screenWidth}px`);

const mobileControls = document.querySelector(".mobile-controls");
const controlsVisible = mobileControls && mobileControls.style.display === "flex";
console.log(`✅ Mobile Controls Visible: ${controlsVisible ? "Yes" : "No"}`);

// Test 3: Check touch controls
console.log("
👆 Test 3: Touch Controls");
const controlButtons = ["upBtn", "downBtn", "leftBtn", "rightBtn", "upBtn2", "downBtn2", "shootBtn"];
let allButtonsExist = true;
for (const btnId of controlButtons) {
    const button = document.getElementById(btnId);
    const exists = button !== null;
    console.log(`${exists ? "✅" : "❌"} ${btnId}: ${exists ? "Found" : "Missing"}`);
    if (!exists) allButtonsExist = false;
}

// Test 4: Check game functions
console.log("
⚙️ Test 4: Game Functions");
const functions = ["startGame", "gameOver", "restartGame", "updatePlayer", "updateEnemies", "updateBullets", "spawnEnemy", "gameLoop"];
let allFunctionsExist = true;
for (const funcName of functions) {
    try {
        const exists = typeof window[funcName] === "function";
        console.log(`${exists ? "✅" : "❌"} ${funcName}(): ${exists ? "Defined" : "Missing"}`);
        if (!exists) allFunctionsExist = false;
    } catch (e) {
        console.log(`❌ ${funcName}(): Error accessing`);
        allFunctionsExist = false;
    }
}

// Test 5: Check power-up system
console.log("
⚡ Test 5: Power-Up System");
const powerUpVars = ["rapidFireActive", "rapidFireTimer", "doubleScoreActive", "doubleScoreTimer", "shieldPowerups", "rapidPowerups", "doublePowerups"];
let allPowerUpsExist = true;
for (const varName of powerUpVars) {
    try {
        const exists = typeof window[varName] !== "undefined";
        console.log(`${exists ? "✅" : "❌"} ${varName}: ${exists ? "Defined" : "Missing"}`);
        if (!exists) allPowerUpsExist = false;
    } catch (e) {
        console.log(`❌ ${varName}: Error accessing`);
        allPowerUpsExist = false;
    }
}

// Test 6: Check scoring system
console.log("
🏆 Test 6: Scoring System");
const scoringElements = ["enemiesDestroyed", "bigEnemiesDestroyed", "powerupsCollected", "maxCombo", "levelReached", "survivalTime"];
let allScoringElementsExist = true;
for (const elementId of scoringElements) {
    const element = document.getElementById(elementId);
    const exists = element !== null;
    console.log(`${exists ? "✅" : "❌"} ${elementId}: ${exists ? "Found" : "Missing"}`);
    if (!exists) allScoringElementsExist = false;
}

// Test 7: Check responsive design
console.log("
📐 Test 7: Responsive Design");
const screenWidth2 = window.innerWidth;
const screenHeight = window.innerHeight;
const gameContainer = document.querySelector(".game-container");

console.log(`✅ Screen Size: ${screenWidth2}x${screenHeight}`);

if (gameContainer) {
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;
    console.log(`✅ Container Size: ${containerWidth}x${containerHeight}`);
    
    const isResponsive = containerWidth <= screenWidth2 && containerHeight <= screenHeight;
    console.log(`✅ Responsive Layout: ${isResponsive ? "Yes" : "No"}`);
} else {
    console.log("❌ Game Container: Not found");
}

// Test 8: Check favicon
console.log("
🎨 Test 8: Favicon");
const faviconLinks = document.querySelectorAll("link[rel*=\"icon\"]");
const hasFavicon = faviconLinks.length > 0;

console.log(`✅ Favicon Links: ${faviconLinks.length} found`);

for (let i = 0; i < faviconLinks.length; i++) {
    const link = faviconLinks[i];
    console.log(`  - ${link.rel}: ${link.href.substring(0, 50)}...`);
}

// Summary
console.log("
📊 Test Results Summary");
console.log("========================");
const totalTests = 8;
const passedTests = [allElementsExist, allButtonsExist, allFunctionsExist, allPowerUpsExist, allScoringElementsExist, hasFavicon].filter(Boolean).length;
console.log(`✅ Passed: ${passedTests}/${totalTests}`);
console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

if (passedTests === totalTests) {
    console.log("
🎉 All tests passed! The game is ready to play!");
} else {
    console.log("
⚠️ Some tests failed. Check the details above.");
}

console.log("
💡 To run individual tests, use the functions above.");
