import {GameRule} from './game-rule';

/**
 * @class RepeatRule
 * @extends GameRule
 */
export class RepeatRule extends GameRule {
    /**
     *
     * @return {boolean}
     * @protected
     */
    _isValid () {
        const words = this._game.words, accWords = [], repeatedWords = [];

        words.forEach(word => {
            if (accWords.includes(word)) {
                if (!repeatedWords.includes(word)) {
                    repeatedWords.push(word);
                }
            } else {
                accWords.push(word);
            }
        });

        if (repeatedWords.length) {
            repeatedWords.forEach(word => this.errors.push(`Слово ${word} повторяется`));
            return false;
        }

        return true;
    }
}