import {Position} from '../game/position';
import {Shuffler} from './shuffler';

export class DropShuffler extends Shuffler {
    /**
     * @inheritDoc
     */
    shuffle () {
        this.reset();

        const game = this._game;
        const positions = [];
        for (let x = 0; x < game.maxWidth; ++x) {
            positions.push(new Position(x, 0));
        }

        while(game.wordsOnField.length != game.words.length) {
            const nextWords = game.getShuffledWords();
            game.dropWord(nextWords[0], {
                positions
            }, {
                nextWords: nextWords.slice(0)
            });
        }

        return true;
    }
}