/**
 * @class Random
 */
export class Random {

    /**
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    static get (min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    static getInt (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Возвращает случайный элемент массива
     * @param {Array} array
     * @returns {*}
     */
    static getElement (array) {
        return array[Random.getInt(0, array.length)];
    }

    /**
     * @param {Array} array
     * @returns {Array}
     * @public
     */
    static shuffle (array) {
        for (let i = array.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }
}