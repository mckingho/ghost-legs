let columns; // # of columns
let rows; // # of rows

// cells: 1 dimensional array to store swap information
// index sequence: top-to-down first, then left-to-right
// each cell represents border top and border left
// '-' to denote swap at top, undefined to denote without swap
let cells;
let heads; // thead text
let feet; // tfoot text

const CELL_SWAP = '-';
const CELL_DEFAULT = undefined;

function reset() {
    columns = 4;
    rows = 10;

    cells = Array(columns * rows).fill(CELL_DEFAULT);
    heads = Array.from({ length: columns }, (_, i) => (i + 1).toString());
    feet = Array(columns).fill("");
    feet[0] = "*";
}

function getColumns() {
    return columns;
}

function getRows() {
    return rows;
}

function addSwap(col, row) {
    checkAddSwap(col, row);
    const index = col * rows + row;
    cells[index] = CELL_SWAP;
}

function removeSwap(col, row) {
    if (col < 0 || col >= columns - 1) {
        throw new Error("invalid col");
    }
    if (row < 0 || row >= rows) {
        throw new Error("invalid row");
    }
    cells[col * rows + row] = CELL_DEFAULT;
}

function checkAddSwap(col, row) {
    if (col < 0 || col >= columns - 1) {
        throw new Error("invalid col");
    }
    if (row < 0 || row >= rows) {
        throw new Error("invalid row");
    }
    const index = col * rows + row;
    if (index - rows >= 0 && cells[index - rows] == CELL_SWAP) {
        throw new Error("invalid swap position");
    }
    if (index + rows < columns * rows && cells[index + rows] == CELL_SWAP) {
        throw new Error("invalid swap position");
    }
}

function addColumn() {
    columns += 1;
    heads.push(columns.toString());
    cells.push(...Array(rows).fill(CELL_DEFAULT));
    feet.push("");
}

// constant to denote running route in a cell
const ROUTE_TOP = 'T';
const ROUTE_LEFT = 'L';
const ROUTE_TOP_LEFT = 'A';

function runRoute(col) {
    if (col < 0 || col >= columns) {
        throw new Error("invalid col");
    }

    const cellsRoute = Array(columns * rows).fill(CELL_DEFAULT);
    let currentCol = col;
    for (let r = 0; r < rows; r += 1) {
        // check left swap
        if (currentCol > 0) {
            if (cells[(currentCol - 1) * rows + r] === CELL_SWAP) {
                cellsRoute[(currentCol - 1) * rows + r] = ROUTE_TOP_LEFT;
                currentCol = currentCol - 1
                continue;
            }
        }
        // check right swap
        if (currentCol < columns - 1) {
            if (cells[currentCol * rows + r] === CELL_SWAP) {
                cellsRoute[currentCol * rows + r] = ROUTE_TOP;
                cellsRoute[(currentCol + 1) * rows + r] = ROUTE_LEFT;
                currentCol = currentCol + 1
                continue;
            }
        }
        // no swap
        cellsRoute[currentCol * rows + r] = ROUTE_LEFT;
    }
    return { cellsRoute, colEnd: currentCol };
}

function shuffleHeads() {
    for (let i = heads.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [heads[i], heads[j]] = [heads[j], heads[i]];
    }
}

function shuffleFeet() {
    for (let i = feet.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [feet[i], feet[j]] = [feet[j], feet[i]];
    }
}

function setHead(col, value) {
    if (col < 0 || col >= columns || col >= heads.length) {
        throw new Error("invalid col");
    }
    heads[col] = value;
}

function setFoot(col, value) {
    if (col < 0 || col >= columns || col >= feet.length) {
        throw new Error("invalid col");
    }
    feet[col] = value;
}

reset();

export {
    cells,
    heads,
    feet,
    getColumns,
    getRows,
    reset,
    addSwap,
    removeSwap,
    addColumn,
    ROUTE_TOP,
    ROUTE_LEFT,
    ROUTE_TOP_LEFT,
    runRoute,
    shuffleHeads,
    shuffleFeet,
    setHead,
    setFoot,
};
