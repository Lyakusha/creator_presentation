import {reverseString} from '../utils';
import {GameRule} from './game-rule';

/**
 * @class SubwordRule
 * @extends GameRule
 */
export class SubwordRule extends GameRule {
    /**
     *
     * @return {boolean}
     * @protected
     */
    _isValid () {
        const words = this._game.words;
        const subwords = words.filter(currentWord => {
            const otherWords = words.filter(word => word != currentWord);

            const bigWords = otherWords.filter(word => word.includes(currentWord) || word.includes(reverseString(currentWord)));
            bigWords.forEach(word => this.errors.push(`Слово ${currentWord.toUpperCase()} является частью слова ${word.toUpperCase()}`));

            return bigWords.length > 0;
        });

        return subwords.length == 0;
    }
}