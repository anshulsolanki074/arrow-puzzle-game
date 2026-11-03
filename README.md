# Arrow Escape Puzzle Game

A complete, modern, web-based **Arrow Escape Puzzle Game** built with HTML5, CSS3, vanilla JavaScript, Tailwind CSS, and a Node.js backend.

---

## 🎮 Game Overview

**Arrow Escape** is a strategic pathfinding puzzle game. Arrows of various colors and directions (Up, Down, Left, Right) sit across a grid.
- **Escape Mechanic**: Arrows can fly off the board only if their flight path in that direction is 100% unobstructed.
- **Tactical Clearing**: Tapping an unblocked arrow releases it, carving an escape corridor for the trapped arrows behind it.
- **Dynamic Physics & Feedback**: Smooth 60fps directional escape glide, physical collision bounce ("bump") with obstacle warning flashes, and Web Audio sound effects.
- **Progression**: 20 hand-crafted, mathematically verified levels scaling from 3x3 up to 6x6 grids with increasing complexity.
- **Rating System**: Earn up to 3 Stars per level based on speed, combos, and zero-mistake precision.

---

## 🌟 Key Features

1. **Modern Gaming Aesthetics**:
   - Cyberpunk / glassmorphism theme (`backdrop-blur`, radiant glowing gradients, sleek dark mode).
   - High-DPI vector SVG arrows with distinct color palettes (Cyan, Indigo, Rose, Emerald, Amber, Purple).
   - Canvas-based victory confetti burst.
   - Fully responsive for mobile, tablet, and desktop (auto-scales grid to avoid overflow or vertical scrolling).

2. **Full Audio Synthesizer (Zero External File Dependencies)**:
   - Uses browser Web Audio API to synthesize sounds on-the-fly.
   - Sound FX: Click, Escape whoosh + chime, Blocked thud, Victory arpeggio, Hint shimmer.
   - Ambient Procedural Music: Relaxing pentatonic pad chords.
   - Independent mute toggles & volume controls.

3. **Mandatory Internet-Based Gameplay**:
   - Requires an active internet connection to play.
   - Live health checks via `/api/health` and network heartbeat.
   - Pauses game and displays a full-screen **Connection Lost** radar overlay if offline.
   - Automatically detects network restoration, syncs cloud data, and resumes gameplay.

4. **100% Functional Buttons**:
   - `Play Game`, `Continue Game` (dynamic latest level), `Select Level`, `How to Play`, `Settings`.
   - `Sound On/Off`, `Music On/Off` (header quick toggles & settings panel).
   - `Pause / Resume`, `Restart`, `Home`, `Next Level`, `Hint (with Rewarded Ad option)`.
   - `Sync Now` and `Reset All Game Progress` (with confirmation).

5. **Dual Storage & Cloud Synchronization**:
   - LocalStorage for instantaneous loading.
   - Node.js backend REST API (`/api/progress/:userId`) for persistent multi-device progress syncing.

6. **Advertising Ready (Google AdSense & Ad Manager)**:
   - Built-in slots with policy-compliant placements:
     - Home Screen Banner
     - Level Select Screen Banner
     - Gameplay Screen Sticky Footer Banner (placed outside the puzzle grid)
     - Interstitial Ad (every 3 levels)
     - Rewarded Video Ad (+2 Free Hints)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16 or higher) installed on your system.

### Running the Server
In the project directory, run:
```bash
node server.js
```
or
```bash
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📡 Backend API Endpoints

The backend (`server.js`) requires zero third-party dependencies (uses Node.js native modules) and provides:

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Heartbeat connectivity verification (`{ status: "online", timestamp: ... }`) |
| `/api/levels` | GET | Returns the verified dataset of all 20 puzzle levels |
| `/api/progress/:userId` | GET | Retrieves stored progress for a specific player |
| `/api/progress/:userId` | POST | Saves and merges player progress to `data/progress.json` |
| `/api/reset-progress/:userId` | POST | Clears cloud progress for that player |

---

## 📢 Google AdSense & Ad Manager Configuration

The advertisement system is organized in `script.js` and `index.html`.

### 1. Configure Publisher ID & Slots
Open `script.js` and update `AD_CONFIG` at the top:
```javascript
const AD_CONFIG = {
    // 1. Enter your real Google AdSense Publisher ID:
    publisherId: "ca-pub-XXXXXXXXXXXXXXXX",

    // 2. Set testMode to false when deploying for live ads:
    testMode: false,

    // 3. Enter your Ad Unit Slot IDs from Google AdSense / Google Ad Manager:
    slots: {
        homeBanner: "1001001001",
        levelsBanner: "2002002002",
        gameplayBanner: "3003003003",
        interstitial: "4004004004",
        rewarded: "5005005005"
    },

    // 4. Frequency for interstitial ads (e.g. every 3 levels):
    interstitialFrequency: 3
};
```

### 2. Enable the Google AdSense Script Tag
Open `index.html` and uncomment / insert your AdSense script tag in the `<head>` section:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```

### 3. Google Ad Placement Compliance
- **Never Over the Grid**: The gameplay banner is fixed to the bottom footer outside the puzzle board.
- **Not on Every Click**: Interstitial ads only trigger between selected level completions (every 3 levels), adhering strictly to Google user-experience guidelines.
- **Fair Value Rewarded Ads**: Watching a rewarded video ad grants the user +2 Free Hints or a level continue.

---

## 🛠 Project Structure

```
arrow-puzzle-game/
├── data/
│   ├── levels.json              # 20 verified solvable levels (3x3 to 6x6)
│   └── progress.json            # Cloud-synced player progress database
├── index.html                   # Semantic markup, Tailwind CDN, HUD, modals
├── style.css                    # Custom animations, glassmorphism, responsive grid
├── script.js                    # Web Audio synth, Game Engine, AdManager, API sync
├── server.js                    # Production-ready Node.js HTTP server & REST API
├── favicon.svg                  # Vector game icon
├── generate-levels.js           # Procedural reverse-escape level generator & solver
├── test-solver.js               # Mathematical reachability & deadlock verifier
├── test-ui.js                   # DOM structure & ID validation suite
├── test-gameplay-simulation.js  # Automated gameplay loop test runner
├── package.json                 # Project configuration
└── README.md                    # Documentation
```

---

## 🧪 Testing Features

1. **Testing Offline Mode**:
   - Open browser DevTools (F12) -> **Network** tab -> change throttling to **Offline**.
   - The game will immediately pause the timer and display the **Connection Lost** radar screen.
   - Switch back to **Online**; the game automatically resumes and syncs!

2. **Testing Hints & Rewarded Ads**:
   - Use all 3 hints in gameplay.
   - Click **Hint** again; it will prompt you to watch a sponsored message.
   - The rewarded video modal will play a 5s simulation, then credit **+2 Free Hints**!

3. **Testing Interstitial Ads**:
   - Complete Level 3, 6, 9...
   - The interstitial modal will appear with a 5-second countdown and close button before progressing to the next level.
