/**
 * Проверяет сразу несколько правил
 * @class GameRuleList
 * @implements Rule
 */
export class GameRuleList {
    /**
     * @constructor
     * @param {Rule[]} list
     */
    constructor (list) {
        /**
         * @type {Rule[]}
         */
        this._ruleList = list;
    }

    /**
     * @param {Rule} rule
     */
    add (rule) {
        this._ruleList.push(rule);
    }

    /**
     * @returns {boolean}
     */
    isValid () {
        return this._ruleList.reduce((isValid, rule) => isValid && rule.isValid(), true);
    }

    /**
     * @returns {string}
     */
    getErrorMessage () {
        return this._ruleList.reduce((error, rule) => rule.getErrorMessage() ? error + rule.getErrorMessage() + '\n' : error, '');
    }
}