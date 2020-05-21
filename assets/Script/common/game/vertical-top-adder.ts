import {WordAdder} from './word-adder';
import {Cell} from './cell';
import {
    getColumnHeight,
} from '../utils/utils-index';

/**
 * @class VerticalTopAdder
 * @extends WordAdder
 */
export class VerticalTopAdder extends WordAdder {
    /**
     * @inheritDoc
     */
    add (word, options = {}) {
        // Выбираем самый низкий столбец
        const x = this.field[0]
            .map((cell, x) => x)
            .sort((a, b) => getColumnHeight(this.field, a) - getColumnHeight(this.field, b))[0];

        const reversed = word.split('').reverse();
        const height = getColumnHeight(this.field, x);
        const iters = (word.length + height) - this.field.length;

        for (let i = 0; i < iters; ++i) {
            this.addNewRow();
        }

        const addedCells = [];

        for (let i = 0, y = height; i < reversed.length; ++y, ++i) {
            this.field[y][x] = Cell.create(reversed[i]);
            addedCells.push(this.field[y][x]);
        }

        return addedCells;
    }
}