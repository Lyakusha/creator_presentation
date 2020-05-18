import {DefaultShuffler} from './default-shuffler';
import {DropShuffler} from './drop-shuffler';
import {Shuffler} from './shuffler';

export class SmartShuffler extends Shuffler {
    /**
     * @inheritDoc
     */
    shuffle () {
        this.reset();

        const game = this._game;
        if (game.words.length >= 10) {
            const shuffler = new DefaultShuffler(game);
            try {
                if(shuffler.shuffle()) {
                    return true;
                }
                else {
                    throw new Error();
                }
            }
            catch (e) {
                const shuffler = new DropShuffler(game);
                return shuffler.shuffle();
            }
        }
        else {
            const shuffler = new DropShuffler(game);
            return shuffler.shuffle();
        }
    }
}