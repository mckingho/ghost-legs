import {
    feet,
    heads,
    getColumns,
    getRows,
    reset,
    addSwap,
    removeSwap,
    addColumn,
    runRoute,
    shuffleHeads,
    shuffleFeet,
    setHead,
    setFoot,
} from './ghost-legs.js';

function update() {
    updateBoard();
    updateBoardSize();
}

function updateBoard() {
    let table = document.getElementById("main-board");
    let columns = getColumns();
    let rows = getRows();
    for (let lv = 0; lv < rows; lv += 1) {
        let row = table.insertRow(lv);
        for (let c = 0; c < columns; c += 1) {
            let idx = c * rows + lv;
            let cell = row.insertCell(c);
            if (c < columns - 1) {
                // no swap display at last column
                cell.classList.add("no-swap");
            }
            cell.setAttribute("id", "cell-" + idx);
            cell.addEventListener("click", function (event) {
                handleClickSwap(event, c, lv);
            });
        }
    }

    let foot = table.createTFoot();
    let footRow = foot.insertRow(0);
    for (let c = 0; c < feet.length; c += 1) {
        let cell = footRow.insertCell(c);
        cell.classList.add("foot-cell");
        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("id", "input-foot-" + c);
        input.value = feet[c];
        cell.appendChild(input);
    }

    let head = table.createTHead();
    let headRow = head.insertRow(0);
    for (let c = 0; c < heads.length; c += 1) {
        let cell = headRow.insertCell(c);
        cell.classList.add("head-cell");
        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("id", "input-head-" + c);
        input.value = heads[c];
        cell.appendChild(input);
    }
    let cell = headRow.insertCell(heads.length);
    cell.innerHTML = "+";
    cell.classList.add("head-plus-cell");
}

function updateBoardSize() {
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
        let cell = event.srcElement;
        if (cell.classList.contains("no-swap")) {
            addSwap(col, row);
            cell.classList.remove("no-swap");
            cell.classList.add("swap");
        } else if (cell.classList.contains("swap")) {
            removeSwap(col, row);
            cell.classList.remove("swap");
            cell.classList.add("no-swap");
        }
    } catch (e) {
        console.error(e);
    }
}

window.onresize = updateBoardSize;
window.update = update;