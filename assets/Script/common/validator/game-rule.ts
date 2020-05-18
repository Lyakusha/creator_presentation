import {RuleBase} from './rule-base';

/**
 * @class GameRule
 * @extends RuleBase
 */
export class GameRule extends RuleBase {
    /**
     * @param {Game} game
     * @param {Function|null} [isValid]
     */
    constructor (game, isValid = null) {
        super();

        /**
         *
         * @type {Game}
         * @protected
         */
        this._game = game;

        if (isValid) {
            this._isValid = isValid;
        }
    }


    /**
     * @inheritDoc
     */
    isValid () {
        return this._isValid();
    }

    /**
     *
     * @return {boolean}
     * @protected
     */
    _isValid () {
        return super.isValid();
    }
}