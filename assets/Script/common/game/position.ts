/**
 * @class Position
 */
export class Position {
    /**
     *
     * @param {number|{x: number, y: number}} xOrPos
     * @param {number} [y]
     */
    constructor (xOrPos, y) {
        if (arguments.length == 1) {
            this.x = xOrPos.x;
            this.y = xOrPos.y;
        } else {
            this.x = xOrPos;
            this.y = y;
        }
    }
}