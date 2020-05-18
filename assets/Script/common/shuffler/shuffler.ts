/**
 * @class Shuffler
 */
export class Shuffler {
    /**
     *
     * @param {Game} game
     */
    constructor (game) {
        /**
         *
         * @type {Game}
         * @protected
         */
        this._game = game;
    }

    /**
     *
     * @returns {boolean}
     */
    shuffle () {
        return true;
    }

    /**
     * Очистка состояния игры
     */
    reset () {
        this._game.wordsOnField.splice(0);
        this._game.field.splice(0);
    }
}