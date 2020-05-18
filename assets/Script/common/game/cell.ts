let number = 1;

/**
 * @class Cell
 */
export class Cell {
    /**
     *
     * @param {string} char
     * @param {number} [number]
     */
    constructor (char, number = 0) {
        this._char = char;
        this._number = number;
    }

    /**
     *
     * @returns {boolean}
     */
    isNull () {
        return !this._char;
    }

    /**
     *
     * @returns {number}
     */
    get number () {
        return this._number;
    }

    /**
     *
     * @returns {string|null}
     */
    get char () {
        return this._char || null;
    }

    /**
     *
     * @returns {{number: number, char: string}}
     */
    toJSON () {
        return {
            number: this.number,
            char: this.char
        }
    }

    /**
     *
     * @param char
     * @returns {Cell}
     */
    static create (char = null) {
        return new Cell(char, ++number);
    }

    /**
     *
     * @returns {Cell}
     */
    static createNull () {
        return new Cell(undefined);
    }

    /**
     *
     * @param target
     * @returns {boolean}
     */
    static isNull (target) {
        if(!(target instanceof Cell))
            throw new Error('Ошибка при проверке на NULL');

        return target.isNull();
    }
}