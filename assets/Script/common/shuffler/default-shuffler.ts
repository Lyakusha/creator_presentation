import { Cell } from '../game/cell';
import { Position } from '../game/position'
import { alignLeft  } from '../utils/field-utils';
import { findEmptyColumn } from '../utils/field-utils';
import { getColumnHeight } from '../utils/field-utils';
import { getFieldWidth } from '../utils/field-utils';
import { reverseString } from '../utils/reverse-string';
import { showField } from '../utils/field-utils';
import {Shuffler} from './shuffler';

const MAX_DEPTH_FOR_SHUFFLE = 10;

export class DefaultShuffler extends Shuffler {
    /**
     *
     * @param {number} depth
     * @returns {boolean}
     * @private
     */
    _shuffle (depth = 0) {
        const game = this._game;

        // Очищаем состояние
        game.wordsOnField.splice(0);
        game.field.splice(0);

        try {

            {
                /*
                    Кладем первое слово горизонтально
                 */
                const words = game.getShuffledWords();
                const nextWords = words.sort((a, b) => a.length - b.length);

                game.dropWord(nextWords[0], {
                    bottom: true
                }, {
                    nextWords: nextWords.slice(1)
                });
                showField(game.field);
            }

            alignLeft(game.field);

            {
                /*
                    Роняем в 1-ую строчку слово ЦЕЛИКОМ так, чтобы башня была максимально широкой
                 */
                const words = game.getShuffledWords();
                const nextWords = words.slice(0).sort((a, b) => b.length - a.length).filter(word => word.length <= game.maxWidth - getFieldWidth(game.field));
                game.dropWord(nextWords[0], { bottom: true }, {
                    nextWords: nextWords.slice(1)
                });
                showField(game.field);
            }

            {
                /*
                    Если нижняя строка заполнена НЕ ЦЕЛИКОМ,
                    то роняем еще одно слово, так, чтобы она заполнилась
                 */
                let emptyColumn = findEmptyColumn(game.field);
                while (emptyColumn >= 0) {
                    const words = game.getShuffledWords();
                    const nextWords = words.slice(0).sort((a, b) => b.length - a.length);

                    game.dropWord(nextWords[0], {
                        seek: true,
                    }, {
                        nextWords: nextWords.slice(1)
                    });
                    showField(game.field);
                    emptyColumn = findEmptyColumn(game.field);
                }
            }

            {
                /*
                    Вставляем горизонтальное слово
                    на ШИРОКОЕ слово в первой строке
                    Новое слово должно быть СТРОГО МЕНЬШЕ по длине
                 */
                const words = game.getShuffledWords();
                const bottomWord = game.wordsOnField[1];
                const nextWords = words.slice(0).sort((a, b) => b.length - a.length).filter(word => word.length < bottomWord.text.length);
                game.addHorizontalWord(nextWords[0], {
                    positions: bottomWord.getPositions()
                }, {
                    nextWords: nextWords.slice(1)
                });
                showField(game.field);
            }

            {
                /*
                    Под первое (короткое) слово в первой строке
                    вставляем вертикальное слово, но НЕ В ПЕРВЫЙ столбец
                 */
                const baseWord = game.wordsOnField[0];
                const nextWords = game.getShuffledWords();
                game.addVerticalBelowWord(nextWords[0], {
                    positions: baseWord.getPositions().filter(({ x }) => x != 0)
                }, {
                    nextWords: nextWords.slice(1)
                });
                showField(game.field);
            }

            {
                /*
                    На второе (широкое) слово в первой строке
                    вставляем вертикальное слово.
                    Выбираем только 2 правых столбца
                 */
                const baseWord = game.wordsOnField[1];
                const nextWords = game.getShuffledWords();
                game.addVerticalAboveWord(nextWords[0], {
                    positions: baseWord.getPositions().sort((a, b) => a.x - b.x).slice(-2)
                }, {
                    nextWords: nextWords.slice(1)
                });
                showField(game.field);
            }

            {
                /*
                    Под второе (широкое) слово в первой строчке
                    вставляем вертикальное слово
                    Выбираем только 2 левых столбца
                 */
                const baseWord = game.wordsOnField[1];
                const nextWords = game.getShuffledWords();
                game.addVerticalBelowWord(nextWords[0], {
                    positions: baseWord.getPositions().sort((a, b) => a.x - b.x).slice(0, 2)
                }, {
                    nextWords: nextWords.slice(1)
                });
                showField(game.field);
            }

            let lastHorizontalWord;
            {
                /*
                    Во вторую строку пытаемся добавить горизонтальное слово,
                    так, чтобы оно разбило последнее вертикальное слово
                 */
                const splitX = game.wordsOnField[game.wordsOnField.length - 1].getPositions()[0].x;
                const minLength = game.maxWidth / 2;
                const nextWords = game.getShuffledWords().filter(word => word.length >= minLength && word.length <= minLength + 2).sort((a, b) => a.length - b.length);

                const positions = [];
                for (let x = Math.max(splitX - minLength + 1, 0); x < minLength + 1; ++x) {
                    positions.push(new Position(x, 0));
                }
                lastHorizontalWord = game.addHorizontalWord(nextWords[0], {
                    positions
                }, {
                    nextWords: nextWords.slice(1)
                });
                showField(game.field);
            }


            {
                /*
                    На последнее добавленное слово (горизонтальное)
                    добавляем вертикальное слово
                 */
                const baseWord = game.wordsOnField[game.wordsOnField.length - 1];
                const nextWords = game.getShuffledWords()
                game.addVerticalAboveWord(nextWords[0], {
                    positions: baseWord.getPositions()
                }, {
                    nextWords: nextWords.slice(1)
                });
                showField(game.field);
            }


            {
                /*
                    Пытаемся добавить горизонтальное слово
                    на третью строку так,
                    чтобы оно было правей последнего горизонтального слова
                 */
                const rightX = lastHorizontalWord.getPositions().sort((a, b) => b.x - a.x)[0].x;
                const y = 1;
                const positions = [];

                for (let x = rightX + 1; x < game.maxWidth; ++x) {
                    if (!Cell.isNull(game.field[y][x])) {
                        positions.push(new Position(x, y));
                    } else {
                        break;
                    }
                }

                const nextWords = game.getShuffledWords().filter(word => word.length <= positions.length);
                if (nextWords.length) {
                    game.addHorizontalWord(nextWords[0], {
                        positions
                    }, {
                        nextWords: nextWords.slice(1)
                    });
                    showField(game.field);
                }
            }


            {
                let flag = true;
                while (flag && game.words.length != game.wordsOnField.length) {
                    const addedWords = [];

                    // находим все горизонтальные слова, которые можно собрать сейчас
                    const possibleWords = game.getPossibleWords()
                        .filter(({ variants }) => variants[0].positions[0].y == variants[0].positions[1].y)
                        .sort((a, b) => a.text.length - b.text.length);

                    // на каждое из этих слов пытаемся положить целиком другое слово
                    for (let i = 0; i < possibleWords.length; ++i) {
                        const text = possibleWords[i].text;
                        const bottomWord = game.wordsOnField.find(word => word.text == text || word.text == reverseString(text));
                        const nextWords = game.getShuffledWords().sort((a, b) => b.length - a.length)
                            .filter(word => word.length <= bottomWord.text.length);

                        if (nextWords.length) {
                            const addedWord = game.addHorizontalWord(nextWords[0], {
                                positions: bottomWord.getPositions()
                            }, {
                                nextWords: nextWords.slice(1)
                            });
                            showField(game.field);
                            addedWords.push(addedWord);
                        }
                    }

                    // на каждое из добавленных слов ставим вертикальное
                    while (game.words.length != game.wordsOnField.length && addedWords.length) {
                        const baseWord = addedWords.shift();
                        const nextWords = game.getShuffledWords();
                        game.addVerticalAboveWord(nextWords[0], {
                            positions: baseWord.getPositions()
                        }, {
                            nextWords: nextWords.slice(1)
                        });
                        showField(game.field);
                    }

                    flag = addedWords.length > 0;
                }
            }

            // если есть столбцы высоты 1, то на них кладем вертикальное слово
            while (game.words.length != game.wordsOnField.length) {
                if (game.field[0].find((cell, x) => getColumnHeight(game.field, x) <= 1)) {
                    const nextWords = game.getShuffledWords();
                    game.addVerticalTopWord(nextWords[0], {
                        nextWords: nextWords.slice(1)
                    });
                } else {
                    break;
                }
            }

            // заполняем башню остатком слов
            while (game.words.length != game.wordsOnField.length) {
                const heights = game.field[0].map((cell, x) => ({ x, height: getColumnHeight(game.field, x) }))
                    .sort((a, b) => b.height - a.height);

                if ((game.wordsOnField.length == game.words.length - 1) || (game.wordsOnField.length % 3) > 0) {
                    // если высота башни не больше 12, то роняем слово горизонтально
                    if (heights[0].height <= 13) {
                        const nextWords = game.getShuffledWords();
                        game.dropWord(nextWords[0], {
                            positions: game.field[0].map((cell, x) => new Position(x, 0))
                        }, {
                            nextWords: nextWords.slice(0)
                        });
                    } else {
                        // кладем слово сверху вертикально
                        const nextWords = game.getShuffledWords();
                        game.addVerticalTopWord(nextWords[0], {
                            nextWords: nextWords.slice(1)
                        });
                    }
                } else {
                    // кладем слово сверху вертикально
                    const nextWords = game.getShuffledWords();
                    game.addVerticalTopWord(nextWords[0], {
                        nextWords: nextWords.slice(1)
                    });
                }
            }

            return true;
        } catch (e) {
            if (depth < MAX_DEPTH_FOR_SHUFFLE) {
                return this._shuffle(++depth);
            } else {
                throw e;
            }
        }
    }

    /**
     * @inheritDoc
     */
    shuffle () {
        return this._shuffle();
    }
}