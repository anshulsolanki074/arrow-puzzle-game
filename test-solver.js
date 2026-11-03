// Script to design and verify Arrow Escape levels are 100% solvable
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
            return false; // Blocked by another arrow
        }
        r += dr;
        c += dc;
    }
    return true; // Path to edge is clear
}

function solveLevel(level) {
    const { rows, cols, grid } = level;
    let currentGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
    let remaining = [];

    grid.forEach((item, index) => {
        const arrow = { id: index, r: item.r, c: item.c, dir: item.dir };
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
        // Greedily pick the first escapable arrow
        const chosen = escapable[0];
        solutionOrder.push(chosen);
        currentGrid[chosen.r][chosen.c] = null;
        remaining = remaining.filter(a => a.id !== chosen.id);
    }

    return {
        solvable: true,
        order: solutionOrder.map(a => `(${a.r},${a.c}:${a.dir})`)
    };
}

console.log("Solver module ready.");
