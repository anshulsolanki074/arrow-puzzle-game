const fs = require('fs');

function canEscape(arrow, board, rows, cols) {
    const deltas = {
        'U': [-1, 0],
        'D': [1, 0],
        'L': [0, -1],
        'R': [0, 1]
    };
    const [dr, dc] = deltas[arrow.dir];
    let r = arrow.r + dr;
    let c = arrow.c + dc;
    while (r >= 0 && r < rows && c >= 0 && c < cols) {
        if (board[r][c] !== null) {
            return false;
        }
        r += dr;
        c += dc;
    }
    return true;
}

function solveLevel(level) {
    const { rows, cols, grid } = level;
    let currentGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
    let remaining = [];

    grid.forEach((item, index) => {
        const arrow = { id: index, r: item.r, c: item.c, dir: item.dir, color: item.color };
        currentGrid[item.r][item.c] = arrow;
        remaining.push(arrow);
    });

    const solutionOrder = [];

    while (remaining.length > 0) {
        const escapable = remaining.filter(a => canEscape(a, currentGrid, rows, cols));
        if (escapable.length === 0) {
            return {
                solvable: false,
                solvedCount: solutionOrder.length,
                total: grid.length,
                stuck: remaining
            };
        }
        // Take an escapable arrow
        const chosen = escapable[0];
        solutionOrder.push(chosen);
        currentGrid[chosen.r][chosen.c] = null;
        remaining = remaining.filter(a => a.id !== chosen.id);
    }

    return {
        solvable: true,
        order: solutionOrder
    };
}

// Generate an inversely guaranteed solvable puzzle:
// Start with an empty board, place arrows one by one in REVERSE order of escape.
// When an arrow is placed in reverse, its path from the edge to (r, c) was clear at the time it escaped!
function generateSolvableLevel(id, name, difficulty, rows, cols, arrowCount, parTime, seedPattern = null) {
    const deltas = {
        'U': [-1, 0],
        'D': [1, 0],
        'L': [0, -1],
        'R': [0, 1]
    };
    const dirs = ['U', 'D', 'L', 'R'];
    const colors = ['cyan', 'indigo', 'rose', 'emerald', 'amber', 'purple'];

    let attempts = 0;
    while (attempts < 1000) {
        attempts++;
        let board = Array.from({ length: rows }, () => Array(cols).fill(null));
        let arrows = [];
        let occupied = new Set();

        // If a predefined pattern is passed, try placing and verifying it
        if (seedPattern) {
            const res = solveLevel({ rows, cols, grid: seedPattern });
            if (res.solvable) {
                return {
                    id,
                    name,
                    difficulty,
                    rows,
                    cols,
                    parTime,
                    grid: seedPattern
                };
            }
        }

        // Procedural generation by reverse-escape:
        // In reverse: we start with an empty board (all escaped).
        // Each step, we pick a free cell (r, c), pick a direction D where the path to the edge is currently EMPTY,
        // and place an arrow pointing D!
        // When played forwards, this arrow will be able to escape once all arrows placed AFTER it have escaped!
        let placedCount = 0;
        let candidateCells = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                candidateCells.push({ r, c });
            }
        }
        // Shuffle candidate cells
        candidateCells.sort(() => Math.random() - 0.5);

        for (const cell of candidateCells) {
            if (placedCount >= arrowCount) break;
            const { r, c } = cell;
            if (board[r][c] !== null) continue;

            // Find directions that are clear to the edge right now
            const validDirs = [];
            for (const d of dirs) {
                const [dr, dc] = deltas[d];
                let currR = r + dr;
                let currC = c + dc;
                let clear = true;
                while (currR >= 0 && currR < rows && currC >= 0 && currC < cols) {
                    if (board[currR][currC] !== null) {
                        clear = false;
                        break;
                    }
                    currR += dr;
                    currC += dc;
                }
                if (clear) {
                    validDirs.push(d);
                }
            }

            if (validDirs.length > 0) {
                // Pick one valid direction
                const dir = validDirs[Math.floor(Math.random() * validDirs.length)];
                const color = colors[placedCount % colors.length];
                const arrowObj = { r, c, dir, color };
                board[r][c] = arrowObj;
                arrows.push(arrowObj);
                placedCount++;
            }
        }

        if (arrows.length >= arrowCount) {
            const finalLevel = {
                id,
                name,
                difficulty,
                rows,
                cols,
                parTime,
                grid: arrows
            };
            const verification = solveLevel(finalLevel);
            if (verification.solvable) {
                return finalLevel;
            }
        }
    }
    throw new Error(`Failed to generate solvable level ${id} after 1000 attempts`);
}

// Handcraft the introductory 5 levels for perfect pacing and educational tutorial feel:
const curatedLevels = [
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
            { r: 1, c: 1, dir: 'U', color: 'rose' }, // Blocked by (0,1) until (0,1) leaves!
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
            { r: 1, c: 0, dir: 'U', color: 'rose' }, // Blocked by (0,0)
            { r: 1, c: 1, dir: 'L', color: 'amber' }, // Blocked by (1,0)
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

const levelConfigs = [
    { id: 6, name: "Traffic Flow", diff: "Medium", rows: 4, cols: 4, count: 13, time: 50 },
    { id: 7, name: "The Anchor", diff: "Medium", rows: 4, cols: 4, count: 14, time: 55 },
    { id: 8, name: "The Plus Core", diff: "Medium", rows: 5, cols: 5, count: 15, time: 60 },
    { id: 9, name: "Spiral Maze", diff: "Medium", rows: 5, cols: 5, count: 16, time: 65 },
    { id: 10, name: "Double Ring", diff: "Medium", rows: 5, cols: 5, count: 17, time: 70 },
    { id: 11, name: "Castle Gate", diff: "Hard", rows: 5, cols: 5, count: 18, time: 75 },
    { id: 12, name: "Zig Zag", diff: "Hard", rows: 5, cols: 5, count: 19, time: 80 },
    { id: 13, name: "Diamond Vault", diff: "Hard", rows: 5, cols: 5, count: 20, time: 85 },
    { id: 14, name: "The Arrowhead", diff: "Hard", rows: 6, cols: 6, count: 21, time: 90 },
    { id: 15, name: "Vortex Nexus", diff: "Hard", rows: 6, cols: 6, count: 23, time: 95 },
    { id: 16, name: "Matrix Code", diff: "Expert", rows: 6, cols: 6, count: 25, time: 100 },
    { id: 17, name: "Shield Wall", diff: "Expert", rows: 6, cols: 6, count: 26, time: 110 },
    { id: 18, name: "Hourglass Trap", diff: "Expert", rows: 6, cols: 6, count: 27, time: 120 },
    { id: 19, name: "Master Labyrinth", diff: "Master", rows: 6, cols: 6, count: 29, time: 135 },
    { id: 20, name: "Grand Finale", diff: "Master", rows: 6, cols: 6, count: 32, time: 150 }
];

const allLevels = [...curatedLevels];

// Verify curated levels
curatedLevels.forEach(lvl => {
    const res = solveLevel(lvl);
    if (!res.solvable) {
        throw new Error(`Curated level ${lvl.id} is NOT solvable!`);
    }
});

// Generate remaining levels
levelConfigs.forEach(cfg => {
    const lvl = generateSolvableLevel(cfg.id, cfg.name, cfg.diff, cfg.rows, cfg.cols, cfg.count, cfg.time);
    allLevels.push(lvl);
});

// Final comprehensive test on all 20 levels
console.log(`Verifying all ${allLevels.length} levels...`);
allLevels.forEach(lvl => {
    const res = solveLevel(lvl);
    if (!res.solvable) {
        throw new Error(`Level ${lvl.id} failed verification!`);
    }
    console.log(`Level ${lvl.id}: "${lvl.name}" (${lvl.difficulty}, ${lvl.rows}x${lvl.cols}, ${lvl.grid.length} arrows) -> Solvable in ${res.order.length} moves!`);
});

fs.writeFileSync('./data/levels.json', JSON.stringify(allLevels, null, 2), 'utf-8');
console.log('Successfully written data/levels.json with 20 guaranteed solvable levels!');
