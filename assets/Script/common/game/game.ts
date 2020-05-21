import {EventEmitter} from 'events';
import {SmartShuffler} from '../shuffler/shuffler-index';
import {Cell} from './cell';
import {
    alignCenter,
    copyField,
    getCellsPositions,
    getCellsText,
    getRowLeftX,
    getRowRightX,
    Random,
    restoreField,
    reverseString,
} from '../utils/utils-index';
import {Position} from './position';
import {SimpleDropper} from './simple-dropper';
import {HorizontalAdder} from "./horizontal-adder";
import {VerticalTopAdder} from "./vertical-top-adder";
import {VerticalAboveAdder} from "./vertical-above-adder";
import {VerticalBelowAdder} from "./vertical-below-adder";

const MAX_DEPTH_FOR_ADD_WORD = 10;
const ADD_METHODS = {
    DROP: 'drop',
    HORIZONTAL: 'horizontal',
    VERTICAL_ABOVE: 'verticalAbove',
    VERTICAL_BELOW: 'verticalBelow',
    VERTICAL_TOP: 'verticalTop'
};

const ERRORS = {
    MULTIPLE_WORD: 'Слово можно собрать 2-мя способами',
    NEW_WORD_FAIL: 'Новое слово нельзя собрать',
    NEW_WORD_SUCCESS: 'Новое слово можно собрать',
    BEFORE_WORDS: 'Слово теперь можно собрать другим способом',
    WORD_WRONG_VARIANT: 'Слово можно собрать не тем способом, которым его добавили',
    FUTURE_WORD: 'Можно собрать слово, которое еще не добавили'
};

/**
 * @class Game
 */
export class Game {
    /**
     * @param {String[]} words
     */
    constructor (words) {
        /**
         * @type {Array<Array<Cell>>}
         * @private
         */
        this._field = [];

        /**
         * @type {String[]}
         * @private
         */
        this._words = words;

        /**
         *
         * @type {number}
         * @private
         */
        this._maxWidth = 10;

        this.simpleDropper = new SimpleDropper(this.field, this._maxWidth);
        this.verticalTopAdder = new VerticalTopAdder(this.field, this._maxWidth);
        this.horizontalAdder = new HorizontalAdder(this.field, this._maxWidth);
        this.verticalAboveAdder = new VerticalAboveAdder(this.field, this._maxWidth);
        this.verticalBelowAdder = new VerticalBelowAdder(this.field, this._maxWidth);

        /**
         * @type {EventEmitter}
         * @private
         */
        this._events = new EventEmitter();

        this._fieldCopy = null;

        this._wordsOnField = [];

        this._fieldHistory = [];
    }

    /**
     *
     * @returns {number}
     */
    get maxWidth () {
        return this._maxWidth;
    }

    /**
     * @returns {Array<Array<Cell>>}
     */
    get field () {
        return this._field;
    }

    /**
     * @returns {String[]}
     */
    get words () {
        return this._words;
    }

    /**
     *
     * @returns {Object[]}
     */
    get wordsOnField () {
        return this._wordsOnField;
    }

    /**
     *
     * @param {String[]}words
     */
    set words (words) {
        this._words = words;
    }

    /**
     * @returns {EventEmitter}
     */
    get events () {
        return this._events;
    }

    /**
     * @param {Position[]} positions
     * @returns {?String}
     */
    findWord (positions) {
        const cells = positions
            .map((position) => this.field[position.y][position.x]);
        const text = getCellsText(cells);

        return this.words.includes(text) ? text : undefined;
    }

    shuffle () {
        try {
            this._fieldHistory = [];
            const shuffler = new SmartShuffler(this);
            if (shuffler.shuffle()) {
                this.events.emit('fieldChanged', {
                    deleted: []
                });
                console.log('\n\n\n\n\n\n\n\n\n\n\n');
            }
        } catch (e) {
            alert('Уровень совсем плохой xD');
            alert(e);
        }
    }

    async startAIPlay () {
        try {
            this.removeRandomWord();
            setTimeout(() => this.startAIPlay(), 300);
        } catch (e) {
            alert(e);
        }
    }

    /**
     *
     * @param text
     * @param direction
     * @private
     */
    _setLastWord (text, cells, method) {
        const word = { text, cells, method };
        word.getPositions = () => getCellsPositions(this.field, cells);
        this._wordsOnField.push(word);

        return word;
    }

    /**
     *
     * @param steps
     * @private
     */
    _rewind (steps) {
        restoreField(this._fieldHistory[this._fieldHistory.length - steps - 1], this._field);
        this.events.emit('fieldChanged', {
            deleted: []
        });
    }

    /**
     *
     * @param {string[]} [exceptWords]
     * @return {string[]}
     */
    getShuffledWords (exceptWords = []) {
        const words = this.words
            .filter(word => !exceptWords.includes(word))
            .filter(word => !exceptWords.includes(reverseString(word)))
            .filter(word => !this._wordsOnField.map(({ text }) => text).includes(word))
            .filter(word => !this._wordsOnField.map(({ text }) => text).includes(reverseString(word)));

        return Random.shuffle(words).map(word => Math.random() > 0.5 ? word : reverseString(word));
    }

    /**
     *
     * @param text
     * @return {Object}
     */
    getWordOnField (text) {
        return this._wordsOnField.find(word => word.text == text) || this._wordsOnField.find(word => word.text == reverseString(text));
    }

    /**
     *
     * @param {string} word
     * @param {Object} [adderOptions]
     * @param {number} [options.depth]
     * @param {string[]} [options.exceptWords]
     */
    dropWord (word, adderOptions, { depth = 0, nextWords = [] } = { depth: 0, nextWords: [] }) {
        const field = copyField(this.field);
        const beforePossibleWords = this.getPossibleWords();

        const addedCells = this.simpleDropper.add(word, adderOptions);

        if (!addedCells.length) {
            restoreField(field, this.field);
            console.error(`Не смогли НИКАК добавить слово ${word}`);

            const nextWord = nextWords.shift();
            if (nextWord) {
                console.error(`Выбрали новое слово для вставки: ${nextWord}`);

                return this.dropWord(nextWord, adderOptions, {
                    nextWords,
                    depth: 0
                });
            } else {
                throw new Error(`dropWord: не смогли добавить НИКАКОЕ слово!`);
            }
        }

        const errors = [];
        const afterPossibleWords = this.getPossibleWords();
        if (afterPossibleWords.find(({ text, variants }) => {
            if (variants.length > 1) {
                errors.push(ERRORS.MULTIPLE_WORD);
            }

            if (text == word || text == reverseString(word)) {
                const { cells } = variants[0];

                return cells.map(cell => cell.number).sort().join("") != addedCells.map(cell => cell.number).sort().join("");
            } else {
                const { cells } = variants[0];
                const wordOnField = this.getWordOnField(text);
                if (wordOnField) {
                    const cellsString = cells.map(cell => cell.number).sort().join("");
                    const wordOnFieldCellsString = wordOnField.cells.map(cell => cell.number).sort().join("");

                    return wordOnField && cellsString != wordOnFieldCellsString;
                } else {
                    errors.push(ERRORS.FUTURE_WORD);

                    return false;
                }
            }
        })) {
            errors.push(ERRORS.WORD_WRONG_VARIANT);
        }

        if (errors.length) {
            if (depth < MAX_DEPTH_FOR_ADD_WORD) {
                console.error(`Не смогли ПРАВИЛЬНО добавить слово ${word} - ${errors}`);
                restoreField(field, this.field);

                return this.dropWord(word, adderOptions, {
                    depth: ++depth,
                    nextWords
                });
            } else {
                restoreField(field, this.field);
                console.error(`Не смогли ПРАВИЛЬНО добавить слово ${word} - превышена глубина рекурсии`);
                const nextWord = nextWords.shift();
                if (nextWord) {
                    console.error(`Выбрали новое слово для вставки: ${nextWord}`);

                    return this.dropWord(nextWord, adderOptions, {
                        nextWords,
                        depth: 0
                    });
                } else {
                    throw new Error(`dropWord: не смогли добавить НИКАКОЕ слово!`);
                }
            }
        } else {
            console.log('dropWord', beforePossibleWords.map(word => word.text), word, afterPossibleWords.map(word => word.text), this._wordsOnField.map(word => word.text));
            return this._setLastWord(word, addedCells, ADD_METHODS.DROP);
        }
    }

    /**
     *
     * @param {string} word
     * @param {Object} [adderOptions]
     * @param {number} [options.depth]
     * @param {string[]} [options.exceptWords]
     */
    addHorizontalWord (word, adderOptions, { depth = 0, nextWords = [] } = { depth: 0, nextWords: [] }) {
        const field = copyField(this.field);
        const beforePossibleWords = this.getPossibleWords();

        const addedCells = this.horizontalAdder.add(word, adderOptions);

        if (!addedCells.length) {
            restoreField(field, this.field);
            console.error(`Не смогли НИКАК добавить слово ${word}`);

            const nextWord = nextWords.shift();
            if (nextWord) {
                console.error(`Выбрали новое слово для вставки: ${nextWord}`);

                return this.addHorizontalWord(nextWord, adderOptions, {
                    nextWords,
                    depth: 0
                });
            } else {
                throw new Error(`addHorizontalWord: не смогли добавить НИКАКОЕ слово!`);
            }
        }

        const errors = [];
        const afterPossibleWords = this.getPossibleWords();

        if (afterPossibleWords.find(({ text, variants }) => {
            if (variants.length > 1) {
                errors.push(ERRORS.MULTIPLE_WORD);
            }

            if (text == word || text == reverseString(word)) {
                const { cells } = variants[0];

                return cells.map(cell => cell.number).sort().join("") != addedCells.map(cell => cell.number).sort().join("");
            } else {
                const { cells } = variants[0];
                const wordOnField = this.getWordOnField(text);
                if (wordOnField) {
                    const cellsString = cells.map(cell => cell.number).sort().join("");
                    const wordOnFieldCellsString = wordOnField.cells.map(cell => cell.number).sort().join("");

                    return wordOnField && cellsString != wordOnFieldCellsString;
                } else {
                    errors.push(ERRORS.FUTURE_WORD);

                    return false;
                }
            }
        })) {
            errors.push(ERRORS.WORD_WRONG_VARIANT);
        }

        if (errors.length) {
            if (depth < MAX_DEPTH_FOR_ADD_WORD) {
                console.error(`Не смогли ПРАВИЛЬНО добавить слово ${word} - ${errors}`);
                restoreField(field, this.field);

                return this.addHorizontalWord(word, adderOptions, {
                    nextWords,
                    depth: ++depth
                });
            } else {
                restoreField(field, this.field);
                console.error(`Не смогли ПРАВИЛЬНО добавить слово ${word} - превышена глубина рекурсии`);
                const nextWord = nextWords.shift();
                if (nextWord) {
                    console.error(`Выбрали новое слово для вставки: ${nextWord}`);

                    return this.addHorizontalWord(nextWord, adderOptions, {
                        nextWords,
                        depth: 0
                    });
                } else {
                    throw new Error(`addHorizontalWord: не смогли добавить НИКАКОЕ слово!`);
                }
            }
        } else {
            console.log('addHorizontalWord success', beforePossibleWords.map(word => word.text), word, afterPossibleWords.map(word => word.text), this._wordsOnField.map(word => word.text));
            return this._setLastWord(word, addedCells, ADD_METHODS.HORIZONTAL);
        }
    }

    /**
     *
     * @param {string} word
     * @param {Object} [adderOptions]
     * @param {number} [options.depth]
     * @param {string[]} [options.exceptWords]
     */
    addVerticalAboveWord (word, adderOptions, { depth = 0, nextWords = [] } = { depth: 0, nextWords: [] }) {
        const field = copyField(this.field);
        const beforePossibleWords = this.getPossibleWords();

        const addedCells = this.verticalAboveAdder.add(word, adderOptions);

        const errors = [];
        const afterPossibleWords = this.getPossibleWords();

        if (afterPossibleWords.find(({ text, variants }) => {
            if (variants.length > 1) {
                errors.push(ERRORS.MULTIPLE_WORD);
            }

            if (text == word || text == reverseString(word)) {
                const { cells } = variants[0];

                return cells.map(cell => cell.number).sort().join("") != addedCells.map(cell => cell.number).sort().join("");
            } else {
                const { cells } = variants[0];
                const wordOnField = this.getWordOnField(text);
                if (wordOnField) {
                    const cellsString = cells.map(cell => cell.number).sort().join("");
                    const wordOnFieldCellsString = wordOnField.cells.map(cell => cell.number).sort().join("");

                    return wordOnField && cellsString != wordOnFieldCellsString;
                } else {
                    errors.push(ERRORS.FUTURE_WORD);

                    return false;
                }
            }
        })) {
            errors.push(ERRORS.WORD_WRONG_VARIANT);
        }

        if (errors.length) {
            if (depth < MAX_DEPTH_FOR_ADD_WORD) {
                console.error(`Не смогли ПРАВИЛЬНО добавить слово ${word} - ${errors}`);
                restoreField(field, this.field);

                return this.addVerticalAboveWord(word, adderOptions, {
                    nextWords,
                    depth: 0
                });
            } else {
                restoreField(field, this.field);
                console.error(`Не смогли ПРАВИЛЬНО добавить слово ${word} - превышена глубина рекурсии`);
                const nextWord = nextWords.shift();
                if (nextWord) {
                    console.error(`Выбрали новое слово для вставки: ${nextWord}`);

                    return this.addVerticalAboveWord(nextWord, adderOptions, {
                        nextWords,
                        depth: ++depth
                    });
                } else {
                    throw new Error(`addVerticalAboveWord: не смогли добавить НИКАКОЕ слово!`);
                }
            }
        } else {
            console.log('addVerticalAboveWord success', beforePossibleWords.map(word => word.text), word, afterPossibleWords.map(word => word.text), this._wordsOnField.map(word => word.text));
            return this._setLastWord(word, addedCells, ADD_METHODS.VERTICAL_ABOVE);
        }
    }

    /**
     *
     * @param {string} word
     * @param {Object} [adderOptions]
     * @param {number} [options.depth]
     * @param {string[]} [options.exceptWords]
     */
    addVerticalBelowWord (word, adderOptions, { depth = 0, nextWords = [] } = { depth: 0, nextWords: [] }) {
        const field = copyField(this.field);
        const beforePossibleWords = this.getPossibleWords();

        const addedCells = this.verticalBelowAdder.add(word, adderOptions);

        const errors = [];
        const afterPossibleWords = this.getPossibleWords();

        const errorWord = afterPossibleWords.find(({ text, variants }) => {
            if (variants.length > 1) {
                errors.push(ERRORS.MULTIPLE_WORD);
            }

            if (text == word || text == reverseString(word)) {
                const { cells } = variants[0];

                return cells.map(cell => cell.number).sort().join("") != addedCells.map(cell => cell.number).sort().join("");
            } else {
                const { cells } = variants[0];
                const wordOnField = this.getWordOnField(text);
                if (wordOnField) {
                    const cellsString = cells.map(cell => cell.number).sort().join("");
                    const wordOnFieldCellsString = wordOnField.cells.map(cell => cell.number).sort().join("");

                    return wordOnField && cellsString != wordOnFieldCellsString;
                } else {
                    errors.push(ERRORS.FUTURE_WORD);

                    return false;
                }
            }
        });

        if (errorWord) {
            errors.push(ERRORS.WORD_WRONG_VARIANT);
        }

        if (errors.length) {
            if (depth < MAX_DEPTH_FOR_ADD_WORD) {
                console.error(`Не смогли ПРАВИЛЬНО добавить слово ${word} - ${errors}`);
                restoreField(field, this.field);

                return this.addVerticalBelowWord(word, adderOptions, {
                    nextWords,
                    depth: ++depth
                });
            } else {
                restoreField(field, this.field);
                console.error(`Не смогли ПРАВИЛЬНО добавить слово ${word} - превышена глубина рекурсии`);
                const nextWord = nextWords.shift();
                if (nextWord) {
                    console.error(`Выбрали новое слово для вставки: ${nextWord}`);

                    return this.addVerticalBelowWord(nextWord, adderOptions, {
                        nextWords,
                        depth: 0
                    });
                } else {
                    throw new Error(`addVerticalBelowWord: не смогли добавить НИКАКОЕ слово!`);
                }
            }
        } else {
            console.log('addVerticalBelowWord success', beforePossibleWords.map(word => word.text), word, afterPossibleWords.map(word => word.text), this._wordsOnField.map(word => word.text));
            return this._setLastWord(word, addedCells, ADD_METHODS.VERTICAL_BELOW);
        }
    }

    /**
     *
     * @param {string} word
     * @param {number} [options.depth]
     * @param {string[]} [options.exceptWords]
     */
    addVerticalTopWord (word, { depth = 0, nextWords = [] } = { depth: 0, nextWords: [] }) {
        const field = copyField(this.field);
        const beforePossibleWords = this.getPossibleWords();

        const addedCells = this.verticalTopAdder.add(word);

        const errors = [];
        const afterPossibleWords = this.getPossibleWords();

        if (afterPossibleWords.find(({ text, variants }) => {
            if (variants.length > 1) {
                errors.push(ERRORS.MULTIPLE_WORD);
            }

            if (text == word || text == reverseString(word)) {
                const { cells } = variants[0];

                return cells.map(cell => cell.number).sort().join("") != addedCells.map(cell => cell.number).sort().join("");
            } else {
                const { cells } = variants[0];
                const wordOnField = this.getWordOnField(text);
                if (wordOnField) {
                    const cellsString = cells.map(cell => cell.number).sort().join("");
                    const wordOnFieldCellsString = wordOnField.cells.map(cell => cell.number).sort().join("");

                    return wordOnField && cellsString != wordOnFieldCellsString;
                } else {
                    errors.push(ERRORS.FUTURE_WORD);

                    return false;
                }
            }
        })) {
            errors.push(ERRORS.WORD_WRONG_VARIANT);
        }

        if (errors.length) {
            if (depth < MAX_DEPTH_FOR_ADD_WORD) {
                console.error(`Не смогли ПРАВИЛЬНО добавить слово ${word} - ${errors}`);
                restoreField(field, this.field);

                return this.addVerticalTopWord(word, {
                    nextWords,
                    depth: ++depth
                });
            } else {
                restoreField(field, this.field);
                console.error(`Не смогли ПРАВИЛЬНО добавить слово ${word} - превышена глубина рекурсии`);
                const nextWord = nextWords.shift();
                if (nextWord) {
                    console.error(`Выбрали новое слово для вставки: ${nextWord}`);

                    return this.addVerticalTopWord(nextWord, {
                        nextWords,
                        depth: 0
                    });
                } else {
                    throw new Error(`addVerticalTopWord: не смогли добавить НИКАКОЕ слово!`);
                }
            }
        } else {
            console.log('addVerticalTopWord success', beforePossibleWords.map(word => word.text), word, afterPossibleWords.map(word => word.text), this._wordsOnField.map(word => word.text));
            return this._setLastWord(word, addedCells, ADD_METHODS.VERTICAL_TOP);
        }
    }

    /**
     * @returns {Object}
     */
    getPossibleWords () {
        const words = [];

        if (!this.field.length) {
            return words;
        }

        return this._words.map((text) => {
            const res = {
                text,
                variants: []
            };

            // Ищем по горизонтали
            for (let y = 0; y < this.field.length; y++) {
                for (let x = 0; x < this.field[y].length - text.length + 1; x++) {
                    const cells = this.field[y].slice(x, x + text.length);
                    if (getCellsText(cells) === text || getCellsText(cells.reverse()) === text) {
                        const positions = cells.map((c, i) => new Position(x + i, y));

                        res.variants.push({ cells, positions });
                    }
                }
            }

            // Ищем по вертикали
            for (let x = 0; x < this.field[0].length; x++) {
                const column = this.field.map((row) => row[x]);

                for (let y = 0; y < column.length - text.length + 1; y++) {
                    const cells = column.slice(y, y + text.length);
                    if (getCellsText(cells) === text || getCellsText(cells.reverse()) === text) {
                        const positions = cells.map((c, i) => new Position(x, y + i));

                        res.variants.push({ cells, positions });
                    }
                }
            }

            return res;
        }).filter(({ variants }) => variants.length);
    }

    /**
     * @param {Position[]} positions
     */
    removeCells (positions) {
        positions.forEach(({ x, y }) => this.field[y][x] = Cell.createNull());
        this.dropField();
        this.squashField();
        alignCenter(this.field);

        if (!this.getPossibleWords().length) {
            if (this._wordsOnField.length == 1) {
                this.events.emit('fieldChanged', {
                    deleted: positions
                });
                alert('LEVEL COMPLETED');
                return true;
            }

            alert('SHUFFLE');
            restoreField(this._fieldCopy, this.field);

            return false;
        } else {
            this.events.emit('fieldChanged', {
                deleted: positions
            });

            return true;
        }
    }

    /**
     * @returns {boolean}
     */
    removeRandomWord () {
        const possibleWords = this.getPossibleWords();

        if (!possibleWords.length) {
            return false;
        }

        const { text, variants } = possibleWords[0];

        this.removeWord(text, variants[0].positions);
    }

    /**
     * @param word
     * @param positions
     */
    removeWord (word, positions) {
        this._fieldCopy = copyField(this._field);
        this._fieldHistory.push(copyField(this._field));

        this._words = this._words.filter((w) => w !== word);

        this.events.emit('guessWord', word);

        if (this.removeCells(positions)) {
            const index = this._wordsOnField.map(({ text }) => text).findIndex(text => text == word);
            this._wordsOnField.splice(index, 1);
        }
    }

    /**
     *
     */
    dropField () {
        for (let x = 0; x < this.field[0].length; x++) {
            const columnElements = this.field.map((row) => row[x]).filter(cell => !Cell.isNull(cell));

            for (let y = 0; y < columnElements.length; y++) {
                this.field[y][x] = columnElements[y];
            }

            for (let y = columnElements.length; y < this.field.length; y++) {
                this.field[y][x] = Cell.createNull();
            }
        }
    }

    /**
     *
     */
    squashField () {
        const emptyColumns = [];
        const firstRow = this.field[0];
        const leftX = getRowLeftX(firstRow);
        const rightX = getRowRightX(firstRow);


        for (let x = leftX; x < rightX; x++) {
            const columnElements = this.field.map((row) => row[x]).filter(cell => !Cell.isNull(cell));

            if (!columnElements.length) {
                emptyColumns.push(x);
            }
        }

        emptyColumns.reverse().forEach((x) => {
            this.field.forEach((row) => {
                row.splice(x, 1);
            });
        });
    }
}