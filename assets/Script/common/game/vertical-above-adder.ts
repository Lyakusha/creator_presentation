import {Cell} from './cell';
import {WordAdder} from './word-adder';
import {
    getColumnHeight,
    Random,
} from '../utils';
dsfdsfsdf
/**
 * @class VerticalAboveAdder
 * @extends WordAdder
 */
export class VerticalAboveAdder extends WordAdder {
    /**
     * @inheritDoc
     */
    add (word, {positions} = {positions: []}) {
        console.log(word, positions);
        const position = positions.slice(0)
            .sort(() => Math.random() > .5 ? 1 : -1)
            .sort((a, b) => getColumnHeight(this.field, a.x) - getColumnHeight(this.field, b.x))[0];

        const startX = position.x;
        const startY = position.y;

        const reversed = word.split('').reverse();
        const height = getColumnHeight(this.field, startX);
        const iters = (word.length + height) - this.field.length;

        for (let i = 0; i < iters; ++i) {
            this.addNewRow();
        }

        for (let y = height - 1; y > startY; --y) {
            this.field[y + reversed.length][startX] = this.field[y][startX];
        }

        const addedCells = [];
        for (let y = startY + 1, i = 0; i < reversed.length; ++y, ++i) {
            this.field[y][startX] = Cell.create(reversed[i]);
            addedCells.push(this.field[y][startX]);
        }

        return addedCells;
    }
}