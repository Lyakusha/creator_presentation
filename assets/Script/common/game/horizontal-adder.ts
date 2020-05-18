import {Cell} from './cell';
import {
    raiseField,
    Random,
    removeEmptyRows, showField
} from '../utils';
import {WordAdder} from './word-adder';

/**
 * @class HorizontalAdder
 * @extends WordAdder
 */
export class HorizontalAdder extends WordAdder {
    /**
     * @inheritDoc
     */
    add (word, {positions = []} = {positions: []}) {
        const y = positions[0].y;
        const baseWordStartX = positions.map(({x}) => x).sort()[0];
        const startX = Random.getInt(baseWordStartX, baseWordStartX + positions.length - word.length + 1);
        const endX = startX + word.length;

        raiseField(this.field, y + 1, startX, endX);

        const addedCells = [];
        for (let i = 0; i < word.length; i++) {
            const newCell = Cell.create(word[i]);
            this.field[y + 1][startX + i] = newCell;
            addedCells.push(newCell);
        }

        removeEmptyRows(this.field);

        return addedCells;
    }
}