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
let imgElemPlus = "<img src=\"icons/add.svg\" width=\"12px\" height=\"12px\" alt=\"+\">";
let imgElemRemove = "<img src=\"icons/add.svg\" width=\"12px\" height=\"12px\" alt=\"x\" style=\"transform: rotate(45deg);\">";

function update() {
    updateBoard();
    updateLeftPanel();
    updateSize();
}

function updateBoard() {
    let table = document.getElementById("main-board");
    let columns = getColumns();
    let rows = getRows();
    for (let lv = 0; lv < rows; lv += 1) {
        let row = table.insertRow(lv);
        row.setAttribute("id", "row-" + lv);
        for (let c = 0; c < columns; c += 1) {
            addCell(row, c, lv);
        }
    }

    let foot = table.createTFoot();
    let footRow = foot.insertRow(0);
    footRow.setAttribute("id", "row-foot");
    for (let c = 0; c < feet.length; c += 1) {
        addFootCell(footRow, c);
    }

    let head = table.createTHead();
    let headRow = head.insertRow(0);
    headRow.setAttribute("id", "row-head");
    for (let c = 0; c < heads.length; c += 1) {
        addHeadCell(headRow, c);
    }
    let cell = headRow.insertCell(heads.length);
    cell.innerHTML = "<img src=\"icons/add.svg\" width=\"24px\" height=\"24px\" alt=\"+\">";
    cell.classList.add("head-plus-cell");
    cell.addEventListener("click", function (event) {
        handleAddColumn(event);
    })
}

function addCell(row, c, lv) {
    let columns = getColumns();
    let rows = getRows();
    let idx = c * rows + lv;
    let cell = row.insertCell(c);
    if (c < columns - 1) {
        // no swap display at last column
        cell.classList.add("no-swap");
        cell.classList.add("cell-with-img");
        cell.innerHTML = imgElemPlus;
    }
    cell.setAttribute("id", "cell-" + idx);
    cell.addEventListener("click", function (event) {
        handleClickSwap(event, c, lv);
    });
}

function addFootCell(footRow, c) {
    let cell = footRow.insertCell(c);
    cell.classList.add("foot-cell");
    cell.setAttribute("id", "foot-cell-" + c);
    let input = document.createElement("input");
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
    let hideImg = document.createElement("img");
    hideImg.src = "icons/prohibited-horizontal.svg";
    hideImg.alt = "\\";
    hideImg.classList.add("foot-cell-icon");
    hideImg.classList.add(isShowFeetValue ? "hide-foot-cell-icon" : "show-foot-cell-icon");
    cell.appendChild(hideImg);
}

function addHeadCell(headRow, c) {
    let cell = headRow.insertCell(c);
    cell.classList.add("head-cell");
    cell.setAttribute("id", "head-cell-" + c);
    let input = document.createElement("input");
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
    let runBtn = document.createElement("button");
    runBtn.classList.add("run-btn");
    runBtn.innerHTML = "RUN";
    cell.appendChild(runBtn);
    runBtn.addEventListener("click", function (event) {
        handleRun(event, c);
    });
}

function updateHeadDisplay() {
    for (let c = 0; c < heads.length; c += 1) {
        let input = document.getElementById("input-head-" + c);
        input.value = heads[c];
    }
}

function updateFeetDisplay() {
    for (let c = 0; c < feet.length; c += 1) {
        let input = document.getElementById("input-foot-" + c);
        input.value = feet[c];
    }
}

function updateSize() {
    console.log(window.innerHeight);
    let innerHeight = window.innerHeight;
    let bodyOffset = 16;
    document.getElementById("main-body").style.height = (innerHeight - bodyOffset) + "px";

    let cellOffset = 4;
    let cellHeight = Math.floor(innerHeight / 12) - cellOffset;
    let cols = getColumns();
    let cellWidth = Math.floor(100 / cols);
    let tds = document.getElementsByTagName("td");
    for (let i = 0; i < tds.length; i += 1) {
        tds[i].style.height = cellHeight + "px";
        tds[i].style.width = cellWidth + "%";
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
        } else if (cell.classList.contains("swap")) {
            removeSwap(col, row);
            cell.classList.remove("swap");
            cell.classList.add("no-swap");
            cell.innerHTML = imgElemPlus;
        }
    } catch (e) {
        console.error(e);
    }
}

function handleRun(event, col) {
    try {
        resetRun();

        let { cellsRoute: route, colEnd } = runRoute(col);
        for (let idx = 0; idx < route.length; idx += 1) {
            let cell = document.getElementById("cell-" + idx);
            if (route[idx] == ROUTE_TOP) {
                cell.classList.add("run-top");
            } else if (route[idx] == ROUTE_LEFT) {
                cell.classList.add("run-left");
            } else if (route[idx] == ROUTE_TOP_LEFT) {
                cell.classList.add("run-top-left");
            }
        }
        let head = document.getElementById("head-cell-" + col);
        head.classList.add("run-left");
        let foot = document.getElementById("foot-cell-" + colEnd);
        foot.classList.add("run-left");
        let headInput = document.getElementById("input-head-" + col);
        headInput.classList.add("selected-input");
        let footInput = document.getElementById("input-foot-" + colEnd);
        footInput.classList.add("selected-input");
    } catch (e) {
        console.error(e);
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

    let columns = getColumns();
    let newCol = columns - 1;

    let rows = getRows();
    for (let lv = 0; lv < rows; lv += 1) {
        let row = document.getElementById("row-" + lv);
        addCell(row, newCol, lv);
        // set swap display to previouly last column
        let idx = (newCol - 1) * rows + lv;
        let prevCell = document.getElementById("cell-" + idx);
        prevCell.classList.add("no-swap");
        prevCell.classList.add("cell-with-img");
        prevCell.innerHTML = imgElemPlus;
    }
    let footRow = document.getElementById("row-foot");
    addFootCell(footRow, newCol);
    let headRow = document.getElementById("row-head");
    addHeadCell(headRow, newCol);

    updateSize();
}

function updateLeftPanel() {
    let shuffleHeadBtn = document.getElementById("shuffle-head-btn");
    shuffleHeadBtn.addEventListener("click", function (event) {
        shuffleHeads();
        console.log(heads);
        updateHeadDisplay();
    });
    let shuffleFootBtn = document.getElementById("shuffle-foot-btn");
    shuffleFootBtn.addEventListener("click", function (event) {
        shuffleFeet();
        console.log(feet);
        updateFeetDisplay();
    });
    let showFootBtn = document.getElementById("show-foot-btn");
    showFootBtn.innerText = isShowFeetValue ? "HIDE" : "SHOW";
    showFootBtn.addEventListener("click", function (event) {
        isShowFeetValue = !isShowFeetValue;
        if (isShowFeetValue) {
            let cells = document.querySelectorAll(".hide-foot-input");
            [].forEach.call(cells, function (cell) {
                cell.classList.remove("hide-foot-input");
                cell.classList.add("show-foot-input");
            });
            let imgs = document.querySelectorAll(".show-foot-cell-icon");
            [].forEach.call(imgs, function (img) {
                img.classList.remove("show-foot-cell-icon");
                img.classList.add("hide-foot-cell-icon");
            });
        } else {
            let cells = document.querySelectorAll(".show-foot-input");
            [].forEach.call(cells, function (cell) {
                cell.classList.remove("show-foot-input");
                cell.classList.add("hide-foot-input");
            });
            let imgs = document.querySelectorAll(".hide-foot-cell-icon");
            [].forEach.call(imgs, function (img) {
                img.classList.remove("hide-foot-cell-icon");
                img.classList.add("show-foot-cell-icon");
            });
        }
        event.target.innerText = isShowFeetValue ? "HIDE" : "SHOW";
    });
}

window.onresize = updateSize;
window.update = update;