/**
 * Arrow Escape Puzzle Game
 * Full Featured Vanilla JavaScript Game Engine & Controller
 */

/* ==========================================================================
   1. GLOBAL CONFIGURATION & ADVERTISING CONFIG
   ========================================================================== */
const AD_CONFIG = {
    // Replace with your real Google AdSense Publisher ID: e.g. "ca-pub-1234567890123456"
    publisherId: "ca-pub-XXXXXXXXXXXXXXXX",
    // Test mode simulates responsive ad units & video rewarded flow cleanly
    testMode: true,
    // Google AdSense / Ad Manager slot identifiers
    slots: {
        homeBanner: "1001001001",
        levelsBanner: "2002002002",
        gameplayBanner: "3003003003",
        interstitial: "4004004004",
        rewarded: "5005005005"
    },
    // Show interstitial ad every X completed levels
    interstitialFrequency: 3
};

// Embedded fallback level data in case levels.json is served without backend or file://
const EMBEDDED_FALLBACK_LEVELS = [
    {
        id: 1,
        name: "First Steps",
        difficulty: "Easy",
        rows: 3,
        cols: 3,
        parTime: 25,
        grid: [
            { r: 0, c: 1, dir: 'U', color: 'cyan' },
            { r: 1, c: 0, dir: 'L', color: 'indigo' },
            { r: 1, c: 2, dir: 'R', color: 'emerald' },
            { r: 2, c: 1, dir: 'D', color: 'amber' }
        ]
    },
    {
        id: 2,
        name: "Crossroads",
        difficulty: "Easy",
        rows: 3,
        cols: 3,
        parTime: 30,
        grid: [
            { r: 0, c: 1, dir: 'U', color: 'cyan' },
            { r: 1, c: 1, dir: 'U', color: 'rose' },
            { r: 1, c: 0, dir: 'L', color: 'indigo' },
            { r: 1, c: 2, dir: 'R', color: 'emerald' },
            { r: 2, c: 1, dir: 'D', color: 'amber' }
        ]
    },
    {
        id: 3,
        name: "Boxed In",
        difficulty: "Easy",
        rows: 3,
        cols: 3,
        parTime: 35,
        grid: [
            { r: 0, c: 0, dir: 'U', color: 'cyan' },
            { r: 0, c: 2, dir: 'R', color: 'indigo' },
            { r: 1, c: 0, dir: 'U', color: 'rose' },
            { r: 1, c: 1, dir: 'L', color: 'amber' },
            { r: 2, c: 0, dir: 'D', color: 'emerald' },
            { r: 2, c: 1, dir: 'D', color: 'purple' },
            { r: 2, c: 2, dir: 'D', color: 'cyan' }
        ]
    },
    {
        id: 4,
        name: "Clockwork",
        difficulty: "Easy",
        rows: 4,
        cols: 4,
        parTime: 40,
        grid: [
            { r: 0, c: 0, dir: 'L', color: 'cyan' },
            { r: 0, c: 1, dir: 'U', color: 'indigo' },
            { r: 0, c: 2, dir: 'U', color: 'emerald' },
            { r: 0, c: 3, dir: 'R', color: 'rose' },
            { r: 1, c: 1, dir: 'U', color: 'amber' },
            { r: 1, c: 2, dir: 'R', color: 'purple' },
            { r: 2, c: 1, dir: 'L', color: 'cyan' },
            { r: 2, c: 2, dir: 'D', color: 'emerald' },
            { r: 3, c: 0, dir: 'L', color: 'rose' },
            { r: 3, c: 3, dir: 'R', color: 'indigo' }
        ]
    },
    {
        id: 5,
        name: "The Pinwheel",
        difficulty: "Medium",
        rows: 4,
        cols: 4,
        parTime: 45,
        grid: [
            { r: 0, c: 1, dir: 'U', color: 'cyan' },
            { r: 0, c: 2, dir: 'R', color: 'indigo' },
            { r: 1, c: 0, dir: 'L', color: 'rose' },
            { r: 1, c: 1, dir: 'U', color: 'emerald' },
            { r: 1, c: 2, dir: 'R', color: 'amber' },
            { r: 1, c: 3, dir: 'R', color: 'purple' },
            { r: 2, c: 0, dir: 'L', color: 'cyan' },
            { r: 2, c: 1, dir: 'L', color: 'rose' },
            { r: 2, c: 2, dir: 'D', color: 'indigo' },
            { r: 2, c: 3, dir: 'R', color: 'emerald' },
            { r: 3, c: 1, dir: 'L', color: 'amber' },
            { r: 3, c: 2, dir: 'D', color: 'purple' }
        ]
    }
];

/* ==========================================================================
   2. WEB AUDIO API SYNTHESIZER ENGINE
   Zero external audio file dependencies! Pure browser-synthesized audio.
   ========================================================================== */
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.musicOscillator = null;
        this.musicGain = null;
        this.musicInterval = null;
        this.isMusicPlaying = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClick() {
        if (!this.soundEnabled) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        } catch (e) {}
    }

    playEscape() {
        if (!this.soundEnabled) return;
        this.init();
        try {
            const t = this.ctx.currentTime;
            // Whoosh tone
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(260, t);
            osc1.frequency.exponentialRampToValueAtTime(950, t + 0.25);

            gain1.gain.setValueAtTime(0.2, t);
            gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.start(t);
            osc1.stop(t + 0.28);

            // Shimmer chime
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1200, t + 0.08);
            osc2.frequency.exponentialRampToValueAtTime(1600, t + 0.3);

            gain2.gain.setValueAtTime(0.12, t + 0.08);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.start(t + 0.08);
            osc2.stop(t + 0.32);
        } catch (e) {}
    }

    playBlocked() {
        if (!this.soundEnabled) return;
        this.init();
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(180, t);
            osc.frequency.exponentialRampToValueAtTime(70, t + 0.18);

            // Low-pass filter for woodblock thud
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, t);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.18);
        } catch (e) {}
    }

    playHint() {
        if (!this.soundEnabled) return;
        this.init();
        try {
            const t = this.ctx.currentTime;
            const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t + i * 0.06);

                gain.gain.setValueAtTime(0.1, t + i * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.2);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t + i * 0.06);
                osc.stop(t + i * 0.06 + 0.2);
            });
        } catch (e) {}
    }

    playVictory() {
        if (!this.soundEnabled) return;
        this.init();
        try {
            const t = this.ctx.currentTime;
            // Ascending major arpeggio fanfare (C5, E5, G5, C6)
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, t + idx * 0.1);

                gain.gain.setValueAtTime(0.2, t + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.35);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t + idx * 0.1);
                osc.stop(t + idx * 0.1 + 0.35);
            });
        } catch (e) {}
    }

    startAmbientMusic() {
        if (!this.musicEnabled || this.isMusicPlaying) return;
        this.init();
        try {
            this.isMusicPlaying = true;
            // Pentatonic chill ambient chord progression
            const chords = [
                [261.63, 329.63, 392.00], // C major
                [220.00, 261.63, 329.63], // A minor
                [174.61, 220.00, 261.63], // F major
                [196.00, 246.94, 293.66]  // G major
            ];
            let chordIdx = 0;

            const playNextPad = () => {
                if (!this.musicEnabled || !this.isMusicPlaying) return;
                const t = this.ctx.currentTime;
                const currentNotes = chords[chordIdx % chords.length];
                chordIdx++;

                currentNotes.forEach(freq => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const filter = this.ctx.createBiquadFilter();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t);

                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(600, t);

                    gain.gain.setValueAtTime(0.001, t);
                    gain.gain.linearRampToValueAtTime(0.035, t + 1.2);
                    gain.gain.linearRampToValueAtTime(0.001, t + 4.5);

                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.ctx.destination);

                    osc.start(t);
                    osc.stop(t + 4.6);
                });
            };

            playNextPad();
            this.musicInterval = setInterval(playNextPad, 4500);
        } catch (e) {}
    }

    stopAmbientMusic() {
        this.isMusicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    toggleSound(enable) {
        this.soundEnabled = enable !== undefined ? enable : !this.soundEnabled;
        return this.soundEnabled;
    }

    toggleMusic(enable) {
        this.musicEnabled = enable !== undefined ? enable : !this.musicEnabled;
        if (this.musicEnabled) {
            this.startAmbientMusic();
        } else {
            this.stopAmbientMusic();
        }
        return this.musicEnabled;
    }
}

/* ==========================================================================
   3. NETWORK MONITOR & CONNECTIVITY VERIFICATION
   Ensures mandatory internet connection. Pauses on offline, auto-resumes on online.
   ========================================================================== */
class NetworkMonitor {
    constructor(onOfflineCallback, onOnlineCallback) {
        this.isOnline = navigator.onLine;
        this.onOffline = onOfflineCallback;
        this.onOnline = onOnlineCallback;
        this.pingInterval = null;

        window.addEventListener('online', () => this.handleNetworkChange(true));
        window.addEventListener('offline', () => this.handleNetworkChange(false));

        // Periodic heartbeat ping to verify real internet connectivity
        this.startHeartbeat();
    }

    async checkConnectivity() {
        if (!navigator.onLine) {
            this.isOnline = false;
            return false;
        }
        try {
            // Attempt to fetch API health or lightweight ping
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            
            // Try local backend health endpoint first
            const res = await fetch('/api/health?t=' + Date.now(), {
                method: 'GET',
                signal: controller.signal
            }).catch(() => null);

            clearTimeout(timeoutId);

            if (res && res.ok) {
                this.isOnline = true;
                return true;
            }

            // Fallback public ping if served as static site
            const fallbackController = new AbortController();
            const fallbackTimeout = setTimeout(() => fallbackController.abort(), 3500);
            const fallbackRes = await fetch('https://dns.google/resolve?name=example.com', {
                mode: 'cors',
                signal: fallbackController.signal
            }).catch(() => null);

            clearTimeout(fallbackTimeout);

            this.isOnline = (fallbackRes && fallbackRes.ok) || navigator.onLine;
            return this.isOnline;
        } catch (e) {
            // If fetch aborted or failed, verify navigator status
            this.isOnline = navigator.onLine;
            return this.isOnline;
        }
    }

    async handleNetworkChange(reportedOnline) {
        if (!reportedOnline) {
            this.isOnline = false;
            if (this.onOffline) this.onOffline();
        } else {
            const verified = await this.checkConnectivity();
            if (verified && this.onOnline) {
                this.onOnline();
            } else if (!verified && this.onOffline) {
                this.onOffline();
            }
        }
    }

    startHeartbeat() {
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(async () => {
            const status = await this.checkConnectivity();
            if (!status && this.onOffline) {
                this.onOffline();
            }
        }, 12000);
    }
}

/* ==========================================================================
   4. PROGRESS & API STORAGE SERVICE
   LocalStorage caching + Backend API synchronization
   ========================================================================== */
class StorageService {
    constructor() {
        this.storageKey = 'arrow_escape_player_progress_v1';
        this.userIdKey = 'arrow_escape_user_uuid';
        this.userId = this.getOrGenerateUserId();
        this.progress = this.loadLocal();
    }

    getOrGenerateUserId() {
        let id = localStorage.getItem(this.userIdKey);
        if (!id) {
            id = 'player_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
            localStorage.setItem(this.userIdKey, id);
        }
        return id;
    }

    getDefaultProgress() {
        return {
            unlockedLevel: 1,
            completedLevels: [],
            stars: {},
            bestScores: {},
            bestTimes: {},
            lastPlayedLevel: 1,
            totalHints: 3,
            settings: {
                sound: true,
                music: true,
                haptics: true
            },
            updatedAt: Date.now()
        };
    }

    loadLocal() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return this.getDefaultProgress();
            return { ...this.getDefaultProgress(), ...JSON.parse(raw) };
        } catch (e) {
            return this.getDefaultProgress();
        }
    }

    saveLocal() {
        try {
            this.progress.updatedAt = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        } catch (e) {}
    }

    async syncRemote() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(`/api/progress/${encodeURIComponent(this.userId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.progress),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                return { success: true, timestamp: Date.now() };
            }
        } catch (e) {}
        return { success: false };
    }

    async fetchRemote() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(`/api/progress/${encodeURIComponent(this.userId)}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                if (data && data.progress) {
                    // Merge local and remote
                    this.progress = { ...this.progress, ...data.progress };
                    this.saveLocal();
                    return true;
                }
            }
        } catch (e) {}
        return false;
    }

    resetAll() {
        this.progress = this.getDefaultProgress();
        this.saveLocal();
        fetch(`/api/reset-progress/${encodeURIComponent(this.userId)}`, { method: 'POST' }).catch(() => {});
    }

    saveLevelWin(levelId, stars, score, time) {
        if (!this.progress.completedLevels.includes(levelId)) {
            this.progress.completedLevels.push(levelId);
        }
        // Unlock next level
        if (levelId >= this.progress.unlockedLevel && levelId < 20) {
            this.progress.unlockedLevel = levelId + 1;
        }

        // Record best stars
        const currentStars = this.progress.stars[levelId] || 0;
        if (stars > currentStars) {
            this.progress.stars[levelId] = stars;
        }

        // Record best time
        const currentBestTime = this.progress.bestTimes[levelId] || 99999;
        if (time < currentBestTime) {
            this.progress.bestTimes[levelId] = time;
        }

        // Record best score
        const currentBestScore = this.progress.bestScores[levelId] || 0;
        if (score > currentBestScore) {
            this.progress.bestScores[levelId] = score;
        }

        this.progress.lastPlayedLevel = levelId;
        this.saveLocal();
        this.syncRemote();
    }
}

/* ==========================================================================
   5. ADVERTISEMENT MANAGER
   Google AdSense / Ad Manager Integration & Simulation
   ========================================================================== */
class AdManager {
    constructor(audioEngine) {
        this.audio = audioEngine;
        this.completedLevelsCount = 0;
        this.interstitialModal = document.getElementById('modal-ad-interstitial');
        this.rewardedModal = document.getElementById('modal-ad-rewarded');
        this.interstitialCountdown = document.getElementById('interstitial-countdown');
        this.btnCloseInterstitial = document.getElementById('btn-close-interstitial');
        this.rewardedTimer = document.getElementById('rewarded-timer');
        this.rewardedProgressBar = document.getElementById('rewarded-progress-bar');
        this.btnClaimReward = document.getElementById('btn-claim-reward');

        this.interstitialCallback = null;
        this.rewardCallback = null;

        this.initEvents();
    }

    initEvents() {
        this.btnCloseInterstitial.addEventListener('click', () => {
            this.closeInterstitial();
        });

        this.btnClaimReward.addEventListener('click', () => {
            this.closeRewarded(true);
        });
    }

    showInterstitial(onComplete) {
        this.interstitialCallback = onComplete;
        this.interstitialModal.classList.remove('hidden');

        let secondsRemaining = 5;
        this.btnCloseInterstitial.disabled = true;
        this.interstitialCountdown.textContent = `Close in ${secondsRemaining}s`;

        const interval = setInterval(() => {
            secondsRemaining--;
            if (secondsRemaining <= 0) {
                clearInterval(interval);
                this.interstitialCountdown.textContent = 'Close Ad (✕)';
                this.btnCloseInterstitial.disabled = false;
                this.btnCloseInterstitial.classList.remove('disabled:opacity-50', 'disabled:cursor-not-allowed');
                this.btnCloseInterstitial.classList.add('bg-cyan-600', 'text-white', 'hover:bg-cyan-500');
            } else {
                this.interstitialCountdown.textContent = `Close in ${secondsRemaining}s`;
            }
        }, 1000);
    }

    closeInterstitial() {
        this.interstitialModal.classList.add('hidden');
        if (this.interstitialCallback) {
            const cb = this.interstitialCallback;
            this.interstitialCallback = null;
            cb();
        }
    }

    showRewarded(onRewardGranted) {
        this.rewardCallback = onRewardGranted;
        this.rewardedModal.classList.remove('hidden');

        let secondsRemaining = 5;
        this.btnClaimReward.disabled = true;
        this.btnClaimReward.classList.add('cursor-not-allowed', 'bg-slate-800', 'text-slate-500');
        this.btnClaimReward.classList.remove('bg-gradient-to-r', 'from-amber-400', 'to-rose-500', 'text-white');
        this.btnClaimReward.textContent = 'Watching Sponsor Message...';
        this.rewardedProgressBar.style.width = '0%';

        setTimeout(() => {
            this.rewardedProgressBar.style.width = '100%';
        }, 50);

        const interval = setInterval(() => {
            secondsRemaining--;
            if (secondsRemaining <= 0) {
                clearInterval(interval);
                this.rewardedTimer.textContent = 'Reward Ready!';
                this.btnClaimReward.disabled = false;
                this.btnClaimReward.classList.remove('cursor-not-allowed', 'bg-slate-800', 'text-slate-500');
                this.btnClaimReward.classList.add('bg-gradient-to-r', 'from-amber-400', 'to-rose-500', 'text-white', 'cursor-pointer');
                this.btnClaimReward.textContent = 'CLAIM +2 HINTS (COLLECT)';
                this.audio.playHint();
            } else {
                this.rewardedTimer.textContent = `Watching: ${secondsRemaining}s remaining`;
            }
        }, 1000);
    }

    closeRewarded(granted) {
        this.rewardedModal.classList.add('hidden');
        if (granted && this.rewardCallback) {
            const cb = this.rewardCallback;
            this.rewardCallback = null;
            cb();
        }
    }
}

/* ==========================================================================
   6. CONFETTI CELEBRATION SYSTEM
   ========================================================================== */
class ConfettiCannon {
    constructor() {
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    fire() {
        this.resize();
        this.particles = [];
        const colors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#38bdf8'];
        for (let i = 0; i < 90; i++) {
            this.particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2 - 50,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.7) * 18,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 12,
                alpha: 1
            });
        }
        if (!this.animationId) {
            this.animate();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35; // gravity
            p.rotation += p.vRot;
            p.alpha -= 0.012;

            if (p.alpha > 0) {
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.globalAlpha = p.alpha;
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                this.ctx.restore();
            }
        });

        this.particles = this.particles.filter(p => p.alpha > 0);
        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.animationId = null;
        }
    }
}

/* ==========================================================================
   7. MAIN ARROW ESCAPE GAME ENGINE
   ========================================================================== */
class ArrowGame {
    constructor() {
        this.audio = new AudioEngine();
        this.storage = new StorageService();
        this.adManager = new AdManager(this.audio);
        this.confetti = new ConfettiCannon();

        this.levels = [];
        this.currentLevel = null;
        this.gridState = []; // 2D array [row][col]
        this.remainingArrows = 0;
        this.timerSeconds = 0;
        this.timerInterval = null;
        this.score = 0;
        this.combo = 1;
        this.mistakes = 0;
        this.moves = 0;
        this.isGameActive = false;
        this.isPaused = false;

        // Direction vectors
        this.deltas = {
            'U': [-1, 0],
            'D': [1, 0],
            'L': [0, -1],
            'R': [0, 1]
        };

        // Network check setup
        this.network = new NetworkMonitor(
            () => this.handleNetworkLost(),
            () => this.handleNetworkRestored()
        );

        this.initDOMRefs();
        this.bindEvents();
        this.bootstrap();
    }

    initDOMRefs() {
        // Screens
        this.screenLoading = document.getElementById('loading-screen');
        this.screenHome = document.getElementById('home-screen');
        this.screenLevels = document.getElementById('levels-screen');
        this.screenGameplay = document.getElementById('gameplay-screen');
        this.screenConnLost = document.getElementById('screen-connection-lost');

        // Modals
        this.modalPause = document.getElementById('modal-pause');
        this.modalVictory = document.getElementById('modal-victory');
        this.modalHowToPlay = document.getElementById('modal-how-to-play');
        this.modalSettings = document.getElementById('modal-settings');

        // Loading widgets
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingStatus = document.getElementById('loading-status');

        // Home widgets
        this.homeStarsCount = document.getElementById('home-stars-count');
        this.homeHighestLevel = document.getElementById('home-highest-level');
        this.homeHintsCount = document.getElementById('home-hints-count');
        this.labelContinueGame = document.getElementById('label-continue-game');

        // Level grid widgets
        this.levelsGrid = document.getElementById('levels-grid');
        this.levelsScreenStars = document.getElementById('levels-screen-stars');

        // Gameplay widgets
        this.puzzleBoard = document.getElementById('puzzle-board');
        this.gameLevelTitle = document.getElementById('game-level-title');
        this.gameLevelSubtitle = document.getElementById('game-level-subtitle');
        this.gameRemainingArrows = document.getElementById('game-remaining-arrows');
        this.gameTimer = document.getElementById('game-timer');
        this.gameScore = document.getElementById('game-score');
        this.gameComboBadge = document.getElementById('game-combo-badge');
        this.gameComboMultiplier = document.getElementById('game-combo-multiplier');
        this.gameHintBadge = document.getElementById('game-hint-badge');

        // Audio icons
        this.iconSoundOn = document.getElementById('icon-sound-on');
        this.iconSoundOff = document.getElementById('icon-sound-off');
        this.iconMusicOn = document.getElementById('icon-music-on');
        this.iconMusicOff = document.getElementById('icon-music-off');

        // Settings checkboxes
        this.settingToggleSound = document.getElementById('setting-toggle-sound');
        this.settingToggleMusic = document.getElementById('setting-toggle-music');
        this.settingToggleHaptics = document.getElementById('setting-toggle-haptics');
        this.settingsSyncStatus = document.getElementById('settings-sync-status');
    }

    bindEvents() {
        // Screen Navigation & Home Buttons
        document.getElementById('btn-play-game').addEventListener('click', () => {
            this.audio.playClick();
            this.startLevel(this.storage.progress.unlockedLevel || 1);
        });

        document.getElementById('btn-continue-game').addEventListener('click', () => {
            this.audio.playClick();
            this.startLevel(this.storage.progress.lastPlayedLevel || this.storage.progress.unlockedLevel || 1);
        });

        document.getElementById('btn-level-select').addEventListener('click', () => {
            this.audio.playClick();
            this.showScreen('levels');
        });

        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            this.audio.playClick();
            this.modalHowToPlay.classList.remove('hidden');
        });

        document.getElementById('btn-close-how-to-play').addEventListener('click', () => {
            this.audio.playClick();
            this.modalHowToPlay.classList.add('hidden');
        });

        document.getElementById('btn-how-to-play-gotit').addEventListener('click', () => {
            this.audio.playClick();
            this.modalHowToPlay.classList.add('hidden');
        });

        document.getElementById('btn-home-settings').addEventListener('click', () => {
            this.audio.playClick();
            this.openSettings();
        });

        document.getElementById('btn-close-settings').addEventListener('click', () => {
            this.audio.playClick();
            this.modalSettings.classList.add('hidden');
        });

        // Quick Audio Toggles
        document.getElementById('btn-quick-sound').addEventListener('click', () => {
            const enabled = this.audio.toggleSound();
            this.storage.progress.settings.sound = enabled;
            this.storage.saveLocal();
            this.updateAudioIcons();
            this.showToast(enabled ? 'Sound FX Enabled' : 'Sound FX Muted');
        });

        document.getElementById('btn-quick-music').addEventListener('click', () => {
            const enabled = this.audio.toggleMusic();
            this.storage.progress.settings.music = enabled;
            this.storage.saveLocal();
            this.updateAudioIcons();
            this.showToast(enabled ? 'Ambient Music On' : 'Ambient Music Muted');
        });

        // Levels Screen
        document.getElementById('btn-levels-back').addEventListener('click', () => {
            this.audio.playClick();
            this.showScreen('home');
        });

        // Gameplay Screen Buttons
        document.getElementById('btn-game-back').addEventListener('click', () => {
            this.audio.playClick();
            this.stopTimer();
            this.showScreen('levels');
        });

        document.getElementById('btn-game-pause').addEventListener('click', () => {
            this.audio.playClick();
            this.pauseGame();
        });

        document.getElementById('btn-game-restart').addEventListener('click', () => {
            this.audio.playClick();
            this.startLevel(this.currentLevel.id);
        });

        document.getElementById('btn-game-hint').addEventListener('click', () => {
            this.triggerHint();
        });

        // Pause Modal Buttons
        document.getElementById('btn-pause-resume').addEventListener('click', () => {
            this.audio.playClick();
            this.resumeGame();
        });

        document.getElementById('btn-pause-restart').addEventListener('click', () => {
            this.audio.playClick();
            this.modalPause.classList.add('hidden');
            this.startLevel(this.currentLevel.id);
        });

        document.getElementById('btn-pause-levels').addEventListener('click', () => {
            this.audio.playClick();
            this.modalPause.classList.add('hidden');
            this.stopTimer();
            this.showScreen('levels');
        });

        document.getElementById('btn-pause-home').addEventListener('click', () => {
            this.audio.playClick();
            this.modalPause.classList.add('hidden');
            this.stopTimer();
            this.showScreen('home');
        });

        // Victory Modal Buttons
        document.getElementById('btn-victory-next').addEventListener('click', () => {
            this.audio.playClick();
            this.modalVictory.classList.add('hidden');

            const nextLevelId = this.currentLevel.id + 1;
            // Check for interstitial ad cadence
            if (this.currentLevel.id % AD_CONFIG.interstitialFrequency === 0) {
                this.adManager.showInterstitial(() => {
                    this.startLevel(nextLevelId <= this.levels.length ? nextLevelId : 1);
                });
            } else {
                this.startLevel(nextLevelId <= this.levels.length ? nextLevelId : 1);
            }
        });

        document.getElementById('btn-victory-replay').addEventListener('click', () => {
            this.audio.playClick();
            this.modalVictory.classList.add('hidden');
            this.startLevel(this.currentLevel.id);
        });

        document.getElementById('btn-victory-levels').addEventListener('click', () => {
            this.audio.playClick();
            this.modalVictory.classList.add('hidden');
            this.showScreen('levels');
        });

        // Settings Toggles
        this.settingToggleSound.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            this.audio.toggleSound(enabled);
            this.storage.progress.settings.sound = enabled;
            this.storage.saveLocal();
            this.updateAudioIcons();
        });

        this.settingToggleMusic.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            this.audio.toggleMusic(enabled);
            this.storage.progress.settings.music = enabled;
            this.storage.saveLocal();
            this.updateAudioIcons();
        });

        this.settingToggleHaptics.addEventListener('change', (e) => {
            this.storage.progress.settings.haptics = e.target.checked;
            this.storage.saveLocal();
        });

        document.getElementById('btn-sync-now').addEventListener('click', async () => {
            this.settingsSyncStatus.textContent = 'Syncing...';
            const res = await this.storage.syncRemote();
            if (res.success) {
                this.settingsSyncStatus.textContent = 'Synchronized Just Now';
                this.showToast('Cloud progress synced!');
            } else {
                this.settingsSyncStatus.textContent = 'Sync Failed (Offline)';
                this.showToast('Sync failed: check internet');
            }
        });

        document.getElementById('btn-reset-progress').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress, stars, and unlocked levels?')) {
                this.storage.resetAll();
                this.updateHomeScreenUI();
                this.renderLevelsGrid();
                this.modalSettings.classList.add('hidden');
                this.showToast('Progress has been reset');
            }
        });

        // Retry Connection Button
        document.getElementById('btn-retry-connection').addEventListener('click', async () => {
            const iconSpin = document.getElementById('icon-retry-spin');
            const labelRetry = document.getElementById('label-retry-connection');
            iconSpin.classList.remove('hidden');
            labelRetry.textContent = 'Checking Network...';

            const online = await this.network.checkConnectivity();
            iconSpin.classList.add('hidden');
            labelRetry.textContent = 'Retry Connection';

            if (online) {
                this.handleNetworkRestored();
            } else {
                this.showToast('Network unreachable. Please check WiFi or cellular.');
            }
        });

        // Orientation / Resize handling for responsive puzzle grid
        window.addEventListener('resize', () => {
            if (this.currentLevel && this.isGameActive) {
                this.adjustBoardLayout(this.currentLevel.rows, this.currentLevel.cols);
            }
        });
    }

    async bootstrap() {
        this.loadingBar.style.width = '30%';
        this.loadingStatus.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span> Verifying internet connection...`;

        const hasNet = await this.network.checkConnectivity();
        if (!hasNet) {
            this.loadingStatus.textContent = 'Offline. Connecting to network...';
            this.screenConnLost.classList.remove('hidden');
            return;
        }

        this.loadingBar.style.width = '65%';
        this.loadingStatus.textContent = 'Loading game levels from server...';

        await this.loadLevels();

        this.loadingBar.style.width = '85%';
        this.loadingStatus.textContent = 'Synchronizing player progress...';

        await this.storage.fetchRemote();

        // Restore audio settings
        if (this.storage.progress.settings) {
            this.audio.toggleSound(this.storage.progress.settings.sound);
            this.audio.toggleMusic(this.storage.progress.settings.music);
        }
        this.updateAudioIcons();

        this.loadingBar.style.width = '100%';
        this.loadingStatus.textContent = 'Ready!';

        setTimeout(() => {
            this.screenLoading.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => {
                this.screenLoading.classList.add('hidden');
            }, 500);
            this.updateHomeScreenUI();
            this.renderLevelsGrid();
            this.showScreen('home');
        }, 400);
    }

    async loadLevels() {
        try {
            const res = await fetch('/api/levels?t=' + Date.now());
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    this.levels = data;
                    return;
                }
            }
        } catch (e) {}
        // Fallback to verified embedded dataset
        this.levels = EMBEDDED_FALLBACK_LEVELS;
    }

    /* ==========================================================================
       SCREEN MANAGEMENT
       ========================================================================== */
    showScreen(screenName) {
        this.screenHome.classList.add('hidden');
        this.screenLevels.classList.add('hidden');
        this.screenGameplay.classList.add('hidden');

        if (screenName === 'home') {
            this.updateHomeScreenUI();
            this.screenHome.classList.remove('hidden');
        } else if (screenName === 'levels') {
            this.renderLevelsGrid();
            this.screenLevels.classList.remove('hidden');
        } else if (screenName === 'gameplay') {
            this.screenGameplay.classList.remove('hidden');
        }
    }

    updateHomeScreenUI() {
        // Calculate total stars earned
        let totalStars = 0;
        Object.values(this.storage.progress.stars || {}).forEach(s => totalStars += s);
        const maxStars = (this.levels.length || 20) * 3;

        this.homeStarsCount.textContent = `${totalStars} / ${maxStars}`;
        this.homeHighestLevel.textContent = `Level ${this.storage.progress.unlockedLevel || 1}`;
        this.homeHintsCount.textContent = `${this.storage.progress.totalHints || 3} Hints`;

        const lastPlayed = this.storage.progress.lastPlayedLevel || this.storage.progress.unlockedLevel || 1;
        this.labelContinueGame.textContent = `Continue Level ${lastPlayed}`;
    }

    renderLevelsGrid() {
        this.levelsGrid.innerHTML = '';
        let totalStars = 0;
        Object.values(this.storage.progress.stars || {}).forEach(s => totalStars += s);
        this.levelsScreenStars.textContent = `${totalStars} / ${(this.levels.length || 20) * 3}`;

        const unlockedLevel = this.storage.progress.unlockedLevel || 1;

        this.levels.forEach(lvl => {
            const isUnlocked = lvl.id <= unlockedLevel;
            const stars = this.storage.progress.stars[lvl.id] || 0;
            const bestTime = this.storage.progress.bestTimes[lvl.id];

            const card = document.createElement('div');
            card.className = `p-3 rounded-2xl glass-card flex flex-col items-center justify-between transition-all duration-200 ${
                isUnlocked 
                    ? 'cursor-pointer hover:border-cyan-400 hover:scale-105 active:scale-95' 
                    : 'opacity-40 grayscale cursor-not-allowed'
            }`;

            // Stars display
            const starsHtml = [1, 2, 3].map(i => `
                <span class="text-xs ${i <= stars ? 'text-amber-400' : 'text-slate-600'}">★</span>
            `).join('');

            card.innerHTML = `
                <div class="w-full flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>#${lvl.id}</span>
                    <span>${lvl.difficulty[0]}</span>
                </div>
                <div class="my-1 text-center">
                    ${isUnlocked ? `
                        <p class="text-xl font-black text-white">${lvl.id}</p>
                    ` : `
                        <svg class="w-5 h-5 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    `}
                </div>
                <div class="flex items-center gap-0.5">${starsHtml}</div>
                ${bestTime ? `<span class="text-[9px] font-mono text-cyan-400 mt-1">${bestTime}s</span>` : ''}
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    this.audio.playClick();
                    this.startLevel(lvl.id);
                });
            }

            this.levelsGrid.appendChild(card);
        });
    }

    openSettings() {
        this.settingToggleSound.checked = this.audio.soundEnabled;
        this.settingToggleMusic.checked = this.audio.musicEnabled;
        this.settingToggleHaptics.checked = this.storage.progress.settings.haptics !== false;
        this.modalSettings.classList.remove('hidden');
    }

    updateAudioIcons() {
        if (this.audio.soundEnabled) {
            this.iconSoundOn.classList.remove('hidden');
            this.iconSoundOff.classList.add('hidden');
        } else {
            this.iconSoundOn.classList.add('hidden');
            this.iconSoundOff.classList.remove('hidden');
        }

        if (this.audio.musicEnabled) {
            this.iconMusicOn.classList.remove('hidden');
            this.iconMusicOff.classList.add('hidden');
        } else {
            this.iconMusicOn.classList.add('hidden');
            this.iconMusicOff.classList.remove('hidden');
        }
    }

    /* ==========================================================================
       GAMEPLAY LOGIC
       ========================================================================== */
    async startLevel(levelId) {
        // Enforce online check before entering gameplay
        const online = await this.network.checkConnectivity();
        if (!online) {
            this.handleNetworkLost();
            return;
        }

        const levelData = this.levels.find(l => l.id === levelId) || this.levels[0];
        this.currentLevel = levelData;
        this.storage.progress.lastPlayedLevel = levelData.id;
        this.storage.saveLocal();

        this.gameLevelTitle.textContent = `Level ${levelData.id}`;
        this.gameLevelSubtitle.textContent = levelData.name;
        this.gameScore.textContent = '0';
        this.score = 0;
        this.combo = 1;
        this.mistakes = 0;
        this.moves = 0;
        this.timerSeconds = 0;
        this.isGameActive = true;
        this.isPaused = false;
        this.gameComboBadge.classList.add('hidden');
        this.gameHintBadge.textContent = this.storage.progress.totalHints || 3;

        this.initGrid(levelData);
        this.showScreen('gameplay');
        this.startTimer();
    }

    initGrid(levelData) {
        const { rows, cols, grid } = levelData;
        this.gridState = Array.from({ length: rows }, () => Array(cols).fill(null));
        this.remainingArrows = grid.length;
        this.gameRemainingArrows.textContent = this.remainingArrows;

        this.puzzleBoard.innerHTML = '';
        this.adjustBoardLayout(rows, cols);

        // Prepopulate grid slots
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const arrowDef = grid.find(item => item.r === r && item.c === c);
                if (arrowDef) {
                    const arrowObj = {
                        id: `arrow_${r}_${c}`,
                        r,
                        c,
                        dir: arrowDef.dir,
                        color: arrowDef.color || 'cyan',
                        el: null
                    };
                    this.gridState[r][c] = arrowObj;
                    const tileEl = this.createArrowTile(arrowObj);
                    arrowObj.el = tileEl;
                    this.puzzleBoard.appendChild(tileEl);
                } else {
                    const emptySlot = document.createElement('div');
                    emptySlot.className = 'grid-slot-empty';
                    emptySlot.dataset.r = r;
                    emptySlot.dataset.c = c;
                    this.puzzleBoard.appendChild(emptySlot);
                }
            }
        }
    }

    adjustBoardLayout(rows, cols) {
        // Compute responsive square dimensions
        const maxDim = Math.max(rows, cols);
        const containerWidth = Math.min(window.innerWidth - 32, 440);
        const cellSize = Math.floor((containerWidth - (maxDim * 8) - 24) / maxDim);

        this.puzzleBoard.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
        this.puzzleBoard.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
    }

    createArrowTile(arrow) {
        const tile = document.createElement('div');
        tile.id = arrow.id;
        tile.className = `arrow-tile color-${arrow.color} dir-${arrow.dir}`;
        tile.dataset.r = arrow.r;
        tile.dataset.c = arrow.c;
        tile.dataset.dir = arrow.dir;

        // Crisp Vector Chevron Arrow Graphic
        tile.innerHTML = `
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
        `;

        tile.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleArrowTap(arrow);
        });

        return tile;
    }

    canArrowEscape(arrow) {
        const [dr, dc] = this.deltas[arrow.dir];
        let currR = arrow.r + dr;
        let currC = arrow.c + dc;

        while (currR >= 0 && currR < this.currentLevel.rows && currC >= 0 && currC < this.currentLevel.cols) {
            if (this.gridState[currR][currC] !== null) {
                return {
                    canEscape: false,
                    blocker: this.gridState[currR][currC]
                };
            }
            currR += dr;
            currC += dc;
        }

        return { canEscape: true };
    }

    handleArrowTap(arrow) {
        if (!this.isGameActive || this.isPaused) return;

        // Ensure this arrow is still active on board
        if (!this.gridState[arrow.r] || this.gridState[arrow.r][arrow.c] !== arrow) return;

        const escapeCheck = this.canArrowEscape(arrow);

        if (escapeCheck.canEscape) {
            // SUCCESSFUL ESCAPE
            this.audio.playEscape();
            this.vibrate(30);

            // Free the logical grid cell immediately so subsequent taps are unblocked
            this.gridState[arrow.r][arrow.c] = null;
            this.remainingArrows--;
            this.moves++;
            this.gameRemainingArrows.textContent = this.remainingArrows;

            // Score and Combo
            const pointGain = 100 * this.combo;
            this.score += pointGain;
            this.gameScore.textContent = this.score.toLocaleString();

            if (this.combo > 1) {
                this.gameComboMultiplier.textContent = this.combo;
                this.gameComboBadge.classList.remove('hidden');
            }
            this.combo++;

            // Trigger smooth CSS escape animation
            const el = arrow.el;
            el.classList.add(`anim-escape-${arrow.dir}`);

            // Replace with placeholder after flight
            setTimeout(() => {
                if (el && el.parentNode) {
                    const emptySlot = document.createElement('div');
                    emptySlot.className = 'grid-slot-empty';
                    emptySlot.dataset.r = arrow.r;
                    emptySlot.dataset.c = arrow.c;
                    el.parentNode.replaceChild(emptySlot, el);
                }
            }, 400);

            // Check Win Condition
            if (this.remainingArrows <= 0) {
                this.handleVictory();
            }
        } else {
            // BLOCKED!
            this.audio.playBlocked();
            this.vibrate([40, 50, 40]);

            // Reset combo streak
            this.combo = 1;
            this.gameComboBadge.classList.add('hidden');
            this.mistakes++;

            // Animate bump towards obstacle
            const el = arrow.el;
            el.classList.remove(`anim-bump-${arrow.dir}`);
            void el.offsetWidth; // trigger reflow
            el.classList.add(`anim-bump-${arrow.dir}`);

            // Highlight blocker block to visually assist the player
            if (escapeCheck.blocker && escapeCheck.blocker.el) {
                const blockerEl = escapeCheck.blocker.el;
                blockerEl.classList.remove('anim-blocker-flash');
                void blockerEl.offsetWidth;
                blockerEl.classList.add('anim-blocker-flash');
            }
        }
    }

    triggerHint() {
        if (!this.isGameActive || this.isPaused) return;

        let hints = this.storage.progress.totalHints || 0;
        if (hints <= 0) {
            // Prompt to watch rewarded ad
            if (confirm("You are out of hints! Watch a quick 5-second sponsor message to receive +2 Free Hints?")) {
                this.adManager.showRewarded(() => {
                    this.storage.progress.totalHints = (this.storage.progress.totalHints || 0) + 2;
                    this.storage.saveLocal();
                    this.gameHintBadge.textContent = this.storage.progress.totalHints;
                    this.showToast('+2 Hints Added!');
                    this.triggerHint();
                });
            }
            return;
        }

        // Find all currently escapable arrows
        const escapable = [];
        for (let r = 0; r < this.currentLevel.rows; r++) {
            for (let c = 0; c < this.currentLevel.cols; c++) {
                const arrow = this.gridState[r][c];
                if (arrow && this.canArrowEscape(arrow).canEscape) {
                    escapable.push(arrow);
                }
            }
        }

        if (escapable.length === 0) {
            this.showToast('No arrows can escape right now!');
            return;
        }

        // Deduct 1 hint
        this.storage.progress.totalHints = hints - 1;
        this.storage.saveLocal();
        this.gameHintBadge.textContent = this.storage.progress.totalHints;

        // Highlight a valid arrow
        const hintArrow = escapable[Math.floor(Math.random() * escapable.length)];
        this.audio.playHint();
        hintArrow.el.classList.add('anim-hint-glow');

        setTimeout(() => {
            if (hintArrow.el) {
                hintArrow.el.classList.remove('anim-hint-glow');
            }
        }, 3200);

        this.showToast('Clear path found!');
    }

    handleVictory() {
        this.isGameActive = false;
        this.stopTimer();
        this.audio.playVictory();
        this.confetti.fire();

        // Calculate Stars: 3, 2, or 1
        const par = this.currentLevel.parTime || 40;
        let stars = 1;
        if (this.mistakes === 0 && this.timerSeconds <= Math.ceil(par * 1.25)) {
            stars = 3;
        } else if (this.mistakes <= 2 && this.timerSeconds <= par * 2.0) {
            stars = 2;
        }

        // Score bonus for remaining time
        const timeBonus = Math.max(0, (par - this.timerSeconds) * 25);
        this.score += timeBonus;

        // Save progress to local and remote
        this.storage.saveLevelWin(this.currentLevel.id, stars, this.score, this.timerSeconds);

        // Update Victory Modal UI
        document.getElementById('victory-stat-time').textContent = this.formatTime(this.timerSeconds);
        document.getElementById('victory-stat-par').textContent = this.formatTime(par);
        document.getElementById('victory-stat-moves').textContent = `${this.moves} (${this.mistakes} mistakes)`;
        document.getElementById('victory-stat-score').textContent = this.score.toLocaleString();

        // Animate stars
        for (let i = 1; i <= 3; i++) {
            const starEl = document.getElementById(`star-${i}`);
            starEl.classList.remove('anim-star-pop');
            starEl.style.opacity = '0.2';
            starEl.style.transform = 'scale(0.8)';
            if (i <= stars) {
                setTimeout(() => {
                    starEl.style.opacity = '1';
                    starEl.classList.add('anim-star-pop');
                }, i * 220);
            }
        }

        setTimeout(() => {
            this.modalVictory.classList.remove('hidden');
        }, 300);
    }

    pauseGame() {
        if (!this.isGameActive || this.isPaused) return;
        this.isPaused = true;
        this.stopTimer();
        document.getElementById('pause-level-info').textContent = `Level ${this.currentLevel.id}: ${this.currentLevel.name} (${this.remainingArrows} arrows remaining)`;
        this.modalPause.classList.remove('hidden');
    }

    resumeGame() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.modalPause.classList.add('hidden');
        this.startTimer();
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timerSeconds++;
            this.gameTimer.textContent = this.formatTime(this.timerSeconds);
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    vibrate(pattern) {
        if (this.storage.progress.settings.haptics !== false && 'vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {}
        }
    }

    showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'px-4 py-2 rounded-xl glass-card text-xs font-semibold text-white shadow-xl border border-cyan-500/30 flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0';
        toast.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span><span>${message}</span>`;
        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        });

        setTimeout(() => {
            toast.classList.add('opacity-0', '-translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 2200);
    }

    /* ==========================================================================
       NETWORK EVENT HANDLERS
       ========================================================================== */
    handleNetworkLost() {
        if (this.isGameActive && !this.isPaused) {
            this.pauseGame();
        }
        this.screenConnLost.classList.remove('hidden');
        const statusPill = document.getElementById('connection-status-pill');
        if (statusPill) {
            statusPill.innerHTML = `
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span class="text-rose-400">Offline</span>
            `;
        }
    }

    handleNetworkRestored() {
        this.screenConnLost.classList.add('hidden');
        const statusPill = document.getElementById('connection-status-pill');
        if (statusPill) {
            statusPill.innerHTML = `
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Online & Synced</span>
            `;
        }
        this.showToast('Internet connection restored!');
        this.storage.syncRemote();

        // If game was paused due to offline, close pause modal and resume
        if (this.isPaused && this.modalPause.classList.contains('hidden')) {
            this.resumeGame();
        }
    }
}

// Start Game instance on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new ArrowGame();
});
