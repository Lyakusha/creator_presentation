/**
 * Базовый класс правила для валидатора
 * @implements Rule
 */
export class RuleBase {
    constructor () {
        /**
         * @type {Array}
         */
        this.errors = [];
    }

    /**
     * @returns boolean
     */
    isValid () {
        return true;
    }

    /**
     * @returns {string}
     */
    getErrorMessage () {
        return this.errors.join('\n');
    }
}