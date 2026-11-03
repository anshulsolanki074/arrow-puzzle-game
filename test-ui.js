const fs = require('fs');

const html = fs.readFileSync('./index.html', 'utf-8');
const js = fs.readFileSync('./script.js', 'utf-8');
const css = fs.readFileSync('./style.css', 'utf-8');

console.log('--- Checking HTML DOM Elements ---');
const requiredIds = [
    'loading-screen', 'loading-bar', 'loading-status',
    'home-screen', 'connection-status-pill', 'btn-quick-sound', 'btn-quick-music', 'btn-home-settings',
    'ad-banner-home', 'home-progress-badge', 'home-stars-count', 'home-highest-level', 'home-hints-count',
    'btn-play-game', 'btn-continue-game', 'btn-level-select', 'btn-how-to-play',
    'levels-screen', 'btn-levels-back', 'levels-screen-stars', 'levels-grid', 'ad-banner-levels',
    'gameplay-screen', 'btn-game-back', 'game-level-title', 'game-level-subtitle', 'game-remaining-arrows',
    'game-timer', 'btn-game-pause', 'game-score', 'game-combo-badge', 'game-combo-multiplier',
    'btn-game-restart', 'btn-game-hint', 'game-hint-badge', 'puzzle-board', 'ad-banner-gameplay',
    'modal-pause', 'btn-pause-resume', 'btn-pause-restart', 'btn-pause-levels', 'btn-pause-home',
    'modal-victory', 'star-1', 'star-2', 'star-3', 'victory-stat-time', 'victory-stat-par',
    'victory-stat-moves', 'victory-stat-score', 'btn-victory-next', 'btn-victory-replay', 'btn-victory-levels',
    'modal-how-to-play', 'btn-close-how-to-play', 'btn-how-to-play-gotit',
    'modal-settings', 'btn-close-settings', 'setting-toggle-sound', 'setting-toggle-music', 'setting-toggle-haptics',
    'settings-sync-status', 'btn-sync-now', 'btn-reset-progress',
    'screen-connection-lost', 'btn-retry-connection',
    'modal-ad-interstitial', 'btn-close-interstitial', 'interstitial-countdown',
    'modal-ad-rewarded', 'rewarded-timer', 'rewarded-progress-bar', 'btn-claim-reward',
    'confetti-canvas', 'toast-container'
];

let missing = 0;
requiredIds.forEach(id => {
    if (!html.includes(`id="${id}"`)) {
        console.error(`MISSING ID in HTML: ${id}`);
        missing++;
    }
});

if (missing === 0) {
    console.log(`PASS: All ${requiredIds.length} required UI element IDs are present in index.html!`);
} else {
    console.error(`FAIL: ${missing} IDs missing!`);
}

// Check JS references to IDs
console.log('--- Checking JS References ---');
requiredIds.forEach(id => {
    if (!js.includes(`'${id}'`) && !js.includes(`"${id}"`)) {
        console.warn(`Note: ID ${id} not referenced directly by string in script.js (may be CSS-only or template)`);
    }
});

console.log('Static verification complete.');
