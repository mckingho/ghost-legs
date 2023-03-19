import {
    feet,
    heads,
    getColumns,
    getRows,
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
} from './ghost-legs.js';

let isShowFeetValue = true;
const imgElemPlus = "<img src=\"icons/add.svg\" width=\"12px\" height=\"12px\" alt=\"+\">";
const imgElemRemove = "<img src=\"icons/add.svg\" width=\"12px\" height=\"12px\" alt=\"x\" style=\"transform: rotate(45deg);\">";

function update() {
    updateBoard();
    updateLeftPanel();
    updateSize();
    setDefaultTheme();
}

function updateBoard() {
    const table = document.getElementById("main-board");
    const columns = getColumns();
    const rows = getRows();
    for (let lv = 0; lv < rows; lv += 1) {
        const row = table.insertRow(lv);
        row.setAttribute("id", "row-" + lv);
        for (let c = 0; c < columns; c += 1) {
            addCell(row, c, lv);
        }
    }

    const foot = table.createTFoot();
    const footRow = foot.insertRow(0);
    footRow.setAttribute("id", "row-foot");
    for (let c = 0; c < feet.length; c += 1) {
        addFootCell(footRow, c);
    }

    const head = table.createTHead();
    const headRow = head.insertRow(0);
    headRow.setAttribute("id", "row-head");
    for (let c = 0; c < heads.length; c += 1) {
        addHeadCell(headRow, c);
    }
    const cell = headRow.insertCell(heads.length);
    cell.innerHTML = "<img src=\"icons/add.svg\" width=\"24px\" height=\"24px\" alt=\"+\">";
    cell.setAttribute('title', 'Add column');
    cell.classList.add("head-plus-cell");
    cell.addEventListener("click", function (event) {
        handleAddColumn();
    })
}

function addCell(row, c, lv) {
    const columns = getColumns();
    const rows = getRows();
    const idx = c * rows + lv;
    const cell = row.insertCell(c);
    if (c < columns - 1) {
        // no swap display at last column
        cell.classList.add("no-swap");
        cell.classList.add("cell-with-img");
        cell.innerHTML = imgElemPlus;
        cell.setAttribute('title', 'Add bridge');
    }
    cell.setAttribute("id", "cell-" + idx);
    cell.addEventListener("click", function (event) {
        handleClickSwap(event, c, lv);
    });
}

function addFootCell(footRow, c) {
    const cell = footRow.insertCell(c);
    cell.classList.add("foot-cell");
    cell.setAttribute("id", "foot-cell-" + c);
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("id", "input-foot-" + c);
    input.classList.add(isShowFeetValue ? "show-foot-input" : "hide-foot-input");
    input.value = feet[c];
    input.addEventListener("input", function (event) {
        setFoot(c, event.target.value);
    });
    input.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            event.target.blur();
        }
    });
    cell.appendChild(input);
    const hideImg = document.createElement("img");
    hideImg.src = "icons/prohibited-horizontal.svg";
    hideImg.alt = "\\";
    hideImg.classList.add("foot-cell-icon");
    hideImg.classList.add(isShowFeetValue ? "hide-foot-cell-icon" : "show-foot-cell-icon");
    cell.appendChild(hideImg);
}

function addHeadCell(headRow, c) {
    const cell = headRow.insertCell(c);
    cell.classList.add("head-cell");
    cell.setAttribute("id", "head-cell-" + c);
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("id", "input-head-" + c);
    input.value = heads[c];
    input.addEventListener("input", function (event) {
        setHead(c, event.target.value);
    });
    input.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            event.target.blur();
        }
    });
    cell.appendChild(input);
    const runBtn = document.createElement("button");
    runBtn.classList.add("run-btn");
    runBtn.innerHTML = "RUN";
    cell.appendChild(runBtn);
    runBtn.addEventListener("click", function (event) {
        handleRun(event, c);
    });
}

function updateHeadDisplay() {
    for (let c = 0; c < heads.length; c += 1) {
        const input = document.getElementById("input-head-" + c);
        input.value = heads[c];
    }
}

function updateFeetDisplay() {
    for (let c = 0; c < feet.length; c += 1) {
        const input = document.getElementById("input-foot-" + c);
        input.value = feet[c];
    }
}

function updateSize() {
    const innerHeight = window.innerHeight;
    const bodyOffset = 16;
    document.getElementById("main-body").style.height = (innerHeight - bodyOffset) + "px";

    const cellOffset = 4;
    const cellHeight = Math.floor(innerHeight / 12) - cellOffset;
    const cols = getColumns();
    const cellWidth = Math.floor(100 / cols);
    const tds = document.getElementsByTagName("td");
    for (const element of tds) {
        element.style.height = cellHeight + "px";
        element.style.width = cellWidth + "%";
    }
}

function handleClickSwap(event, col, row) {
    try {
        resetRun();

        let cell = event.srcElement;
        if (cell.tagName.toLowerCase() !== "td") {
            // handle event triggered from child element
            cell = cell.parentElement;
        };
        if (cell.classList.contains("no-swap")) {
            addSwap(col, row);
            cell.classList.remove("no-swap");
            cell.classList.add("swap");
            cell.innerHTML = imgElemRemove;
            cell.setAttribute('title', 'Remove bridge');
        } else if (cell.classList.contains("swap")) {
            removeSwap(col, row);
            cell.classList.remove("swap");
            cell.classList.add("no-swap");
            cell.innerHTML = imgElemPlus;
            cell.setAttribute('title', 'Add bridge');
        }
    } catch (e) {
        console.debug(e);
    }
}

function handleRun(event, col) {
    try {
        resetRun();

        const { cellsRoute: route, colEnd } = runRoute(col);
        for (let idx = 0; idx < route.length; idx += 1) {
            const cell = document.getElementById("cell-" + idx);
            if (route[idx] == ROUTE_TOP) {
                cell.classList.add("run-top");
            } else if (route[idx] == ROUTE_LEFT) {
                cell.classList.add("run-left");
            } else if (route[idx] == ROUTE_TOP_LEFT) {
                cell.classList.add("run-top-left");
            }
        }
        const head = document.getElementById("head-cell-" + col);
        head.classList.add("run-left");
        const foot = document.getElementById("foot-cell-" + colEnd);
        foot.classList.add("run-left");
        const headInput = document.getElementById("input-head-" + col);
        headInput.classList.add("selected-input");
        const footInput = document.getElementById("input-foot-" + colEnd);
        footInput.classList.add("selected-input");
    } catch (e) {
        console.debug(e);
    }
}

function resetRun() {
    let cells = document.querySelectorAll(".run-top");
    [].forEach.call(cells, function (cell) {
        cell.classList.remove("run-top");
    });
    cells = document.querySelectorAll(".run-left");
    [].forEach.call(cells, function (cell) {
        cell.classList.remove("run-left");
    });
    cells = document.querySelectorAll(".run-top-left");
    [].forEach.call(cells, function (cell) {
        cell.classList.remove("run-top-left");
    });
    cells = document.querySelectorAll(".selected-input");
    [].forEach.call(cells, function (cell) {
        cell.classList.remove("selected-input");
    });
}

function handleAddColumn() {
    resetRun();

    addColumn();

    const columns = getColumns();
    const newCol = columns - 1;

    const rows = getRows();
    for (let lv = 0; lv < rows; lv += 1) {
        const row = document.getElementById("row-" + lv);
        addCell(row, newCol, lv);
        // set swap display to previouly last column
        const idx = (newCol - 1) * rows + lv;
        const prevCell = document.getElementById("cell-" + idx);
        prevCell.classList.add("no-swap");
        prevCell.classList.add("cell-with-img");
        prevCell.innerHTML = imgElemPlus;
        prevCell.setAttribute('title', 'Add bridge');
    }
    const footRow = document.getElementById("row-foot");
    addFootCell(footRow, newCol);
    const headRow = document.getElementById("row-head");
    addHeadCell(headRow, newCol);

    updateSize();
}

function updateLeftPanel() {
    const shuffleHeadBtn = document.getElementById("shuffle-head-btn");
    shuffleHeadBtn.addEventListener("click", function (event) {
        shuffleHeads();
        updateHeadDisplay();
    });
    const themeBtn = document.getElementById("light-dark-btn");
    themeBtn.addEventListener("click", function () {
        const body = document.querySelector("body");
        body.classList.toggle('dark');
    });
    const shuffleFootBtn = document.getElementById("shuffle-foot-btn");
    shuffleFootBtn.addEventListener("click", function (event) {
        shuffleFeet();
        updateFeetDisplay();
    });
    const showFootBtn = document.getElementById("show-foot-btn");
    showFootBtn.innerText = isShowFeetValue ? "HIDE" : "SHOW";
    showFootBtn.addEventListener("click", function (event) {
        isShowFeetValue = !isShowFeetValue;
        if (isShowFeetValue) {
            const cells = document.querySelectorAll(".hide-foot-input");
            [].forEach.call(cells, function (cell) {
                cell.classList.remove("hide-foot-input");
                cell.classList.add("show-foot-input");
            });
            const imgs = document.querySelectorAll(".show-foot-cell-icon");
            [].forEach.call(imgs, function (img) {
                img.classList.remove("show-foot-cell-icon");
                img.classList.add("hide-foot-cell-icon");
            });
        } else {
            const cells = document.querySelectorAll(".show-foot-input");
            [].forEach.call(cells, function (cell) {
                cell.classList.remove("show-foot-input");
                cell.classList.add("hide-foot-input");
            });
            const imgs = document.querySelectorAll(".hide-foot-cell-icon");
            [].forEach.call(imgs, function (img) {
                img.classList.remove("hide-foot-cell-icon");
                img.classList.add("show-foot-cell-icon");
            });
        }
        event.target.innerText = isShowFeetValue ? "HIDE" : "SHOW";
    });
}

// this index css default is light theme,
// change to dark theme if window prefers dark color scheme
function setDefaultTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        const body = document.querySelector("body");
        body.classList.add('dark');
    }
}

window.onresize = updateSize;
window.update = update;
