import {Cell} from '../game/cell';
import {Position} from "../game/position";

const emptyCell = () => Cell.createNull();

/**
 *
 * @param row
 * @returns {number}
 */
export function getRowLeftX (row) {
    for (let x = 0; x < row.length; ++x) {
        if (!Cell.isNull(row[x]))
            return x;
    }

    return -1;
}

/**
 *
 * @param row
 * @returns {number}
 */
export function getRowRightX (row) {
    for (let x = row.length - 1; x >= 0; --x) {
        if (!Cell.isNull(row[x]))
            return x;
    }

    return -1;
}

/**
 *
 * @param field
 * @return {number}
 */
export function getFieldWidth (field) {
    return field[0].filter(cell => !Cell.isNull(cell)).length;
}

/**
 *
 * @returns {any}
 */
export function copyField (field) {
    return JSON.parse(JSON.stringify(field));
}

/**
 *
 * @param fieldCopy
 * @param field
 */
export function restoreField (fieldCopy, field) {
    field.forEach((row, y) => row.forEach((val, x) => field[y][x] = emptyCell()));
    fieldCopy.forEach((row, y) => row.map(val => ({val, y}))
        .forEach(({val, y}, x) => {
            field[y][x] = new Cell(val.char, val.number);
        }));

    removeEmptyRows(field);
}

/**
 *
 * @param field
 */
export function showField (field) {
    let text = "";
    for (let y = field.length - 1; y >= 0; --y) {
        for (let x = 0; x < field[0].length; ++x) {
            text += (!Cell.isNull(field[y][x]) ? field[y][x].char : x) + ' ';
        }
        text += '\n';
    }

    if(field.find(row => row.length > 10)) {
        console.error(text);
        return;
    }

    console.log(text);
}

/**
 *
 * @param field
 * @returns {number}
 */
export function findEmptyColumn (field) {
    return field[0].findIndex(cell => Cell.isNull(cell));
}

/**
 *
 * @param field
 * @param x
 */
export function removeColumn (field, x) {
    for (let y = 0; y < field.length; ++y) {
        field[y].splice(x, 1);
    }
}

/**
 * @param field
 */
export function removeEmptyRows (field) {
    for (let y = field[field.length - 1]; y >= 0; --y) {
        if (field[y].every(cell => Cell.isNull(cell))) {
            field.splice(y, 1);
        }
    }
}

/**
 *
 * @param field
 * @param length
 */
export function addRow (field, length) {
    field.push(new Array(length).fill(emptyCell()));
}

/**
 *
 * @param field
 * @param fromY
 * @param startX
 * @param endX
 */
export function raiseField (field, fromY, startX, endX) {
    addRow(field, field[0].length);

    for (let y = field.length - 2; y >= fromY; --y) {
        for (let x = startX; x < endX; ++x) {
            field[y + 1][x] = field[y][x];
            field[y][x] = Cell.createNull();
        }
    }
}

/**
 *
 * @param field
 * @param x
 * @returns {number}
 */
export function getColumnHeight (field, x) {
    for (let y = 0; y < field.length; ++y) {
        if (Cell.isNull(field[y][x])) {
            return y;
        }
    }

    return field.length;
}

/**
 *
 * @param {Cell[]} cells
 * @returns {string}
 */
export function getCellsText (cells) {
    return cells.map(cell => cell.char).join("");
}

/**
 *
 * @param field
 * @param cells
 * @return {Position[]}
 */
export function getCellsPositions (field, cells) {
    return field.reduce((positions, row, y) => {
        return positions.concat(row.reduce((positionsInRow, cell, x) => {
            if (cells.find(({number}) => number == cell.number)) {
                positionsInRow.push(new Position(x, y));
            }

            return positionsInRow;
        }, []));
    }, [])
}

/**
 *
 * @param field
 */
export function alignCenter (field) {
    const leftEmptyColumnsAmount = field[0].findIndex(cell => !Cell.isNull(cell));
    const rightEmptyColumnsAmount = field[0].slice(0).reverse().findIndex(cell => !Cell.isNull(cell));

    const shift = Math.floor(Math.abs((leftEmptyColumnsAmount - rightEmptyColumnsAmount) / 2));
    if (shift < 0)
        return;

    if (leftEmptyColumnsAmount > rightEmptyColumnsAmount) {
        field.forEach(row => {
            row.splice(0, shift);
            for (let i = 0; i < shift; ++i && row.push(emptyCell())) ;
        });
    } else {
        field.forEach(row => {
            row.splice(-shift, shift);
            for (let i = 0; i < shift; ++i && row.unshift(emptyCell())) ;
        });
    }
}

export function alignLeft (field) {
    const leftEmptyColumnsAmount = field[0].findIndex(cell => !Cell.isNull(cell));

    field.forEach(row => {
        row.splice(0, leftEmptyColumnsAmount);
        for (let i = 0; i < leftEmptyColumnsAmount; ++i && row.push(emptyCell())) ;
    });
}