import {Cell} from './cell';
import {WordAdder} from './word-adder';
import {
    Random,
    removeEmptyRows, showField,
} from '../utils/utils-index';

/**
 * @class SimpleDropper
 * @extends WordAdder
 */
export class SimpleDropper extends WordAdder {
    /**
     * @inheritDoc
     */
    add (word, {positions = [], bottom= false, seek = false, exceptPositions = []} = {positions: [], bottom: false, seek: false, exceptPositions: []}) {
        const addedCells = [];
        this.addNewRow();

        if (bottom) {
            const firstEmptyX = this._getRight() + 1;
            if (firstEmptyX + word.length > this.maxWidth) {
                return addedCells;
            }

            const startX = this.maxWidth - word.length;
            const chars = word.split('');
            this._fill(0, startX, chars);

            for (let x = startX; x < startX + chars.length; ++x) {
                addedCells.push(this.field[0][x]);
            }

            return addedCells;
        }

        let startingX;
        if (positions.length) {
            startingX = positions.map(({x}) => x)
                .sort()
                .slice(0, positions.length - word.length + 1)
                .sort(() => Math.random() > 0.5 ? 1 : -1)[0];
        } else if (exceptPositions.length) {
            const xs = this.field[0].reduce((xs, cell, x) => xs.concat(x), [])
                .filter(x => !exceptPositions.map(pos => pos.x).includes(x));
        }
        else if (seek) {
            const x = this.field[0].findIndex(cell => Cell.isNull(cell));
            startingX = Random.getInt(Math.max(x - word.length + 1, 0), Math.min(x + 1, this.maxWidth - word.length + 1));
        }
        else {
            // Если нужно добавить со сдвигом, то проверяем, что сдвиг влезает
            if (this.field[0].filter(cell => !Cell.isNull(cell)).length == this.maxWidth) {
                return addedCells;
            }

            const minX = this._getLeft() - 1;
            const maxX = this._getRight() - word.length + 2;
            startingX = Random.getElement([minX, maxX]);
        }

        const startingY = this.field.length - 1;
        this._fill(startingY, startingX, word.split(''));

        for (let x = startingX; x < startingX + word.length; ++x) {
            let y = startingY;
            while (y > 0 && Cell.isNull(this.field[y - 1][x])) {
                --y;
            }

            this.field[y][x] = this.field[startingY][x];
            addedCells.push(this.field[y][x]);

            if (y != startingY) {
                this.field[startingY][x] = Cell.createNull();
            }
        }

        removeEmptyRows(this.field);

        return addedCells;
    }

    /**
     *
     * @param y
     * @param startX
     * @param chars
     * @private
     */
    _fill (y, startX, chars) {
        chars.forEach((char, number) => this.field[y][startX + number] = Cell.create(char));
    }
}