import {
    addRow,
    getRowLeftX,
    getRowRightX
} from '../utils/utils-index';

/**
 * @class WordAdder
 */
export class WordAdder {
    /**
     * @param {Array<Array<Cell>>} field
     * @param {Number} maxWidth
     */
    constructor (field, maxWidth) {
        this.field = field;

        this.maxWidth = maxWidth;
    }

    /**
     * @param {String} word
     * @param {Object} [options]
     * @returns {Cell[]}
     */
    add (word, options = {}) {
        return [];
    }

    /**
     * Добавление новой строки
     */
    addNewRow () {
        return addRow(this.field, this.maxWidth);
    }

    /**
     *
     * @returns {number}
     * @protected
     */
    _getLeft () {
        return getRowLeftX(this.field[0]);
    }

    /**
     *
     * @returns {number}
     * @protected
     */
    _getRight () {
        return getRowRightX(this.field[0]);
    }
}