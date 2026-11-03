const levels = require('./data/levels.json');

// Simulate the gameplay loop logic from script.js
class GameSimulator {
    constructor(level) {
        this.level = level;
        this.gridState = Array.from({ length: level.rows }, () => Array(level.cols).fill(null));
        this.remainingArrows = level.grid.length;
        this.score = 0;
        this.combo = 1;
        this.mistakes = 0;
        this.moves = 0;
        this.deltas = {
            'U': [-1, 0],
            'D': [1, 0],
            'L': [0, -1],
            'R': [0, 1]
        };

        level.grid.forEach(a => {
            this.gridState[a.r][a.c] = { ...a };
        });
    }

    canArrowEscape(arrow) {
        const [dr, dc] = this.deltas[arrow.dir];
        let currR = arrow.r + dr;
        let currC = arrow.c + dc;

        while (currR >= 0 && currR < this.level.rows && currC >= 0 && currC < this.level.cols) {
            if (this.gridState[currR][currC] !== null) {
                return { canEscape: false, blocker: this.gridState[currR][currC] };
            }
            currR += dr;
            currC += dc;
        }

        return { canEscape: true };
    }

    tap(r, c) {
        const arrow = this.gridState[r][c];
        if (!arrow) return { success: false, reason: 'empty_cell' };

        const check = this.canArrowEscape(arrow);
        if (check.canEscape) {
            this.gridState[r][c] = null;
            this.remainingArrows--;
            this.moves++;
            this.score += 100 * this.combo;
            this.combo++;
            return { success: true, remaining: this.remainingArrows, score: this.score, combo: this.combo };
        } else {
            this.combo = 1;
            this.mistakes++;
            return { success: false, reason: 'blocked', blocker: check.blocker };
        }
    }
}

console.log('Testing Level 1 Gameplay Simulation...');
const sim1 = new GameSimulator(levels[0]);

// Level 1: 4 arrows.
// grid: (0,1:U), (1,0:L), (1,2:R), (2,1:D)
// Tap (0, 1) -> Up
let res = sim1.tap(0, 1);
console.log('Tap (0, 1):', res);
// Tap (1, 0) -> Left
res = sim1.tap(1, 0);
console.log('Tap (1, 0):', res);
// Tap (1, 2) -> Right
res = sim1.tap(1, 2);
console.log('Tap (1, 2):', res);
// Tap (2, 1) -> Down
res = sim1.tap(2, 1);
console.log('Tap (2, 1):', res);

if (sim1.remainingArrows === 0) {
    console.log('PASS: Level 1 Cleared with 0 mistakes, score:', sim1.score);
} else {
    console.error('FAIL: Level 1 not cleared!');
}

console.log('\nTesting Level 2 Blocking Simulation...');
const sim2 = new GameSimulator(levels[1]);
// Level 2 grid:
// (0,1:U), (1,1:U - blocked by 0,1), (1,0:L), (1,2:R), (2,1:D)
// Tap (1, 1) first -> SHOULD FAIL (blocked by 0,1)
let blockRes = sim2.tap(1, 1);
console.log('Tap (1, 1) while blocked:', blockRes);
if (!blockRes.success && blockRes.reason === 'blocked') {
    console.log('PASS: (1, 1) was correctly blocked by arrow at (0, 1)');
} else {
    console.error('FAIL: (1, 1) should have been blocked!');
}

// Now clear (0, 1)
sim2.tap(0, 1);
// Now tap (1, 1) -> SHOULD SUCCEED!
let clearRes = sim2.tap(1, 1);
console.log('Tap (1, 1) after path cleared:', clearRes);
if (clearRes.success) {
    console.log('PASS: (1, 1) escaped smoothly once blocker was removed!');
} else {
    console.error('FAIL: (1, 1) should have escaped!');
}
