import {RepeatRule} from './repeat-rule';
import {SubwordRule} from './subword-rule';
import {GameRule} from "./game-rule";
import {GameRuleList} from "./game-rule-list";

export class GameValidator {
    static validate (game) {
        const rules = new GameRuleList([
            new GameRule(game, function () {
                if(this._game.words.filter(word => (word.length == 4 || word.length == 3)).length < 1) {
                    this.errors.push('На уровне нет ни одного слова длины 3 или 4');
                }

                return !this.errors.length;
            }),
            new GameRule(game, function () {
                if(this._game.words.filter(word => word.length == 6).length < 1) {
                    this.errors.push('На уровне нет слова длины 6');
                }

                return !this.errors.length;
            }),
            new GameRule(game, function () {
                if(this._game.words.filter(word => word.length == 5).length < 1) {
                    this.errors.push('На уровне нет слова длины 5');
                }

                return !this.errors.length;
            }),
            new GameRule(game, function () {
                if(this._game.words.filter(word => word.length <= 2).length > 0) {
                    this.errors.push('На уровне есть слова короче 3 букв');
                }

                return !this.errors.length;
            }),
            new SubwordRule(game),
            new RepeatRule(game),
        ]);

        const isValid = rules.isValid();
        if(isValid) {
            return true;
        }
        else {
            throw new Error(rules.getErrorMessage());
        }
    }
}