/**
 * @file The board class.
 * @author james
 */

 /**
   * Board class contains everything about the game board.
   * @extends Phaser.Group
   */
class Board extends Phaser.Group {

    /** Create a board.
     * @param {object} game Reference to the Phaser game object.
     */
    constructor(game) {
        super(game, game.world, 'board');

        this.themedBoard = this.game.add.tileSprite(BOARD_ORIGIN.x - 20, BOARD_ORIGIN.y - 20, 680, 680, 'board');
        this.themedBoard.visible = false;
        this.add(this.themedBoard);

        this.themedCustomizeBlack = this.game.add.tileSprite(BOARD_ORIGIN.x - 20, BOARD_ORIGIN.y - 20, 680, 680, 'board-black');
        this.themedCustomizeBlack.visible = false;
        this.add(this.themedCustomizeBlack);

        this.themedCustomizeWhite = this.game.add.tileSprite(BOARD_ORIGIN.x - 20, BOARD_ORIGIN.y - 20, 680, 680, 'board-white');
        this.themedCustomizeWhite.visible = false;
        this.add(this.themedCustomizeWhite);

        let darkSquare = game.add.graphics(0, 0);
        darkSquare.beginFill(DARKSQUARECOLOR, 1);
        darkSquare.drawRect(0, 0, 80, 80);

        let lightSquare = game.add.graphics(0, 0);
        lightSquare.beginFill(LIGHTSQUARECOLOR, 1);
        lightSquare.drawRect(0, 0, 80, 80);

        for (var r = 0; r < 8; r++) {
            let evenRow = false;
            if (r%2 == 0) { evenRow = true; }

            for (var c = 0; c < 8; c++) {
                let evenCol = false;
                if (c%2 == 0) { evenCol = true; }
                let texture;

                if (evenRow && evenCol || !evenRow && !evenCol) {
                    texture = lightSquare.generateTexture();
                } else {
                    texture = darkSquare.generateTexture();
                }

                let sq = game.add.sprite(r*80 + BOARD_ORIGIN.x, c*80 + BOARD_ORIGIN.y, texture);
                sq.coordinate = COLUMNS[c] + ROWS[r];
                sq.occupied = false;
                sq.enpassant = false;
                sq.highlighted = false;

                sq.customize = false;

                if (c > 2 && c < 6) {
                    sq.customize = true;
                }

                this.add(sq);
            }
        }

        lightSquare.destroy();
        darkSquare.destroy();

        // Add coordinates around board.
        let style = { font: "18px Arial", fill: "#222222",};

        for (var i = 0; i < 8; i++) {
            // top letters
            this.add(game.add.text((i * 80) + BOARD_ORIGIN.x + 34, -1, COLUMNS[i], style));

            // bottom letters
            this.add(game.add.text((i * 80) + BOARD_ORIGIN.x + 34, 659, COLUMNS[i], style));

            // left numbers
            this.add(game.add.text(6, (i * 80) + BOARD_ORIGIN.y + 32, ROWS[i], style));

            // right numbers
            this.add(game.add.text(666, (i * 80) + BOARD_ORIGIN.y + 32, ROWS[i], style));
        }


    }

    /** Use "hand drawn" theme board while playing. */
    showThemedBoard() {
        this.setAll('visible',false);
        this.visible = true;
        this.themedBoard.visible = true;
    }

    /** Use "hand drawn" theme board while on customize screen. */
    showThemedCustomizeBoard(player) {
        if (player === 'player1') {
            this.setAll('visible', false);
            this.visible = true;
            this.themedCustomizeWhite.visible = true;
        }
        if (player === 'player2') {
            this.setAll('visible', false);
            this.visible = true;
            this.themedCustomizeBlack.visible = true;
        }
    }

    /** Only show some board squares on customize screen. */
    showCustomizeSquares() {
        this.visible = true;
        this.children.forEach(function(sq){
            if (sq.customize) {
                sq.visible = true;
            } else {
                sq.visible = false;
            }
        }, this);
    }

    // Show all squares and text on board screen.
    resetVisibleSquares() {
        this.visible = true;
        this.children.forEach(function(sq){
            sq.visible = true;
        }, this);
    }

    /** Return board child object by coordinate.
     * @param  {string} coordinate The coordinate to get object for.
     * @return {object}            Phaser object of board child.
     */
    getSquareByCoordinate(coordinate) {
        return _.find(this.children, function(child) {
            return child.coordinate == coordinate;
        });
    }

    /** Return board child object by coordinate.
     * @param {array}  moves   List of squares to highlight.
     * @param {number} color   Color, in hex, to use for highlight.
     * @param {float}  [alpha] Transparancy percent of highlight.
     */
    highlightSquares(moves, color, alpha = 0.5) {
        let highlightSquare = game.add.graphics(0, 0);
        highlightSquare.beginFill(color, alpha);
        highlightSquare.drawRect(0, 0, 80, 80);

        for (const each of moves) {
            if (this.getSquareByCoordinate(each).highlight) { console.log('already highlighted'); }
            let x = COLUMNS.findIndex(function(element) {
                return element == each[0];
            });

            let y = ROWS.findIndex(function(element) {
                return element == each[1];
            });

            let hs = game.add.sprite(x*80 + BOARD_ORIGIN.x, y*80 + BOARD_ORIGIN.y, highlightSquare.generateTexture());
            hs.highlight = true;
            this.add(hs);
        }

        highlightSquare.destroy();
    }

    removeHighlight() {
        //https://stackoverflow.com/questions/34965592/phaser-js-delete-object-in-group-during-foreach-loop
        this.filter(sq => sq.highlight).callAll('destroy');
    }

    setOccupied(piece) {
        this.forEach(function(sq) {
            if(sq.coordinate == piece.data.coordinate) {
                sq.occupied = true;
                sq.piece = piece;
            }
        }, this);
    }

    unsetOccupied(coordinate) {
        this.forEach(function(sq) {
            if(sq.coordinate == coordinate) {
                sq.occupied = false;
                sq.piece = null;
            }
        }, this);
    }

    isOccupied(coordinate) {
        let sq = this.getSquareByCoordinate(coordinate);
        return sq.occupied;
    }

    isOccupiedByPlayer(player, coordinate) {
        if (this.isOccupied(coordinate)) {
            let sq = this.getSquareByCoordinate(coordinate);
            if (player == sq.piece.data.player) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    getOccupiedPiece(coordinate) {
        let sq = this.getSquareByCoordinate(coordinate);
        return sq;
    }

    setEnpassant(coordinate, piece) {
        this.forEach(function(sq) {
            if(sq.coordinate == coordinate) {
                sq.enpassant = true;
                sq.piece = piece;
            }
        }, this);
    }

    unsetEnpassant(coordinate) {
        this.forEach(function(sq) {
            if(sq.coordinate == coordinate) {
                sq.enpassant = false;
                sq.piece = null;
            }
        }, this);
    }

    isEnpassant(coordinate) {
        let sq = this.getSquareByCoordinate(coordinate);
        return sq.enpassant;
    }

    getEnpassantPiece(coordinate) {
        let sq = this.getSquareByCoordinate(coordinate);
        return sq;
    }

    occupiedSquares() {
        let occupiedSquares = [];
        this.forEach(function(sq) {
            if(sq.occupied) {
                occupiedSquares.push(sq.coordinate);
            }
        }, this);
        return occupiedSquares;
    }

    /** Returns a string representing direction between two squares.
     * @param  {string} start Start coordinate.
     * @param  {string} end   End coordinate.
     * @return {string}       Two character representation of direction in up, down, left, or right.
     *                        Irregular movement uses case to show which direction is dominant.
     *                          Some examples:
     *                            'U-' is a move only in the column (a1 to a5)
     *                            '-L' is a move only in a row (d3 to a3)
     *                            'UR' is a strait diagonal move up and to the right (a1 to d4)
     *                            'uR' is an irregular diagonal move to the up and right (b1 to d2)
     */
    getDirection(start, end) {
        let direction = '--';

        let startIndex = this.getSquareIndices(start);
        let endIndex   = this.getSquareIndices(end);

        // Start and end column are the same.
        if (startIndex.x == endIndex.x) {
            if (startIndex.y > endIndex.y) {
                direction = 'U' + direction[1];
            } else {
                direction = 'D' + direction[1];
            }

        // Start and end row are the same.
        } else if (startIndex.y == endIndex.y) {
            if (startIndex.x > endIndex.x) {
                direction = direction[0] + 'L';
            } else {
                direction = direction[0] + 'R';
            }

        // Diagonals
        } else if (startIndex.x < endIndex.x && startIndex.y > endIndex.y) {
            // Strait diagonal up and right.
            if (Math.abs(startIndex.x - endIndex.x) == Math.abs(startIndex.y - endIndex.y)) {
                direction = 'UR';

            // Irregular diagonal more upward than rightward.
            } else if (Math.abs(startIndex.x - endIndex.x) < Math.abs(startIndex.y - endIndex.y)) {
                direction = 'Ur';

            // Irregular diagonal more rightward than upward.
            } else if (Math.abs(startIndex.x - endIndex.x) > Math.abs(startIndex.y - endIndex.y)) {
                direction = 'uR';

            }

        } else if (startIndex.x > endIndex.x && startIndex.y > endIndex.y) {
            if (Math.abs(startIndex.x - endIndex.x) == Math.abs(startIndex.y - endIndex.y)) {
                direction = 'UL';

            // Irregular diagonal more upward than rightward.
            } else if (Math.abs(startIndex.x - endIndex.x) < Math.abs(startIndex.y - endIndex.y)) {
                direction = 'Ul';

            // Irregular diagonal more rightward than upward.
            } else if (Math.abs(startIndex.x - endIndex.x) > Math.abs(startIndex.y - endIndex.y)) {
                direction = 'uL';

            }

        } else if (startIndex.x < endIndex.x && startIndex.y < endIndex.y) {
            if (Math.abs(startIndex.x - endIndex.x) == Math.abs(startIndex.y - endIndex.y)) {
                direction = 'DR';

            // Irregular diagonal more upward than rightward.
            } else if (Math.abs(startIndex.x - endIndex.x) < Math.abs(startIndex.y - endIndex.y)) {
                direction = 'Dr';

            // Irregular diagonal more rightward than upward.
            } else if (Math.abs(startIndex.x - endIndex.x) > Math.abs(startIndex.y - endIndex.y)) {
                direction = 'dR';

            }

        } else if (startIndex.x > endIndex.x && startIndex.y < endIndex.y) {
            if (Math.abs(startIndex.x - endIndex.x) == Math.abs(startIndex.y - endIndex.y)) {
                direction = 'DL';

            // Irregular diagonal more upward than rightward.
            } else if (Math.abs(startIndex.x - endIndex.x) < Math.abs(startIndex.y - endIndex.y)) {
                direction = 'Dl';

            // Irregular diagonal more rightward than upward.
            } else if (Math.abs(startIndex.x - endIndex.x) > Math.abs(startIndex.y - endIndex.y)) {
                direction = 'dL';

            }

        } else {
            direction = '--';
            console.warn('Error: Board.getDirection() could not return a valid direction.');
        }

        return direction;
    }

    /** Return column and row index for a square's corrdinate.
     * @param  {string} coordinate The coordinate to get indices for.
     * @return {object}            Object with x and y for each index.
     */
    getSquareIndices(coordinate) {
        let coordinateX = COLUMNS.findIndex(function(element) {
            return element == coordinate[0];
        });

        let coordinateY = ROWS.findIndex(function(element) {
            return element == coordinate[1];
        });

        return {x: coordinateX, y: coordinateY};
    }

    /** Returns array of squares between two squares.
     * @param  {string} start Start coordinate.
     * @param  {string} end   End coordinate.
     * @return {array}        If start and end form a strait line the array has all squares between
     *                        them. If they do not form a straint line (irregular path) the squares
     *                        in the array makes a rectangle represenitng all squares between start
     *                        and end. Does not include start and end square for any case.
     */
    getSquaresBetween(start, end) {
        let sqsBetween = [];

        let direction    = this.getDirection(start, end);
        let startIndices = this.getSquareIndices(start);
        let endIndices   = this.getSquareIndices(end);

        switch (direction) {

            // Cases for strait orthogonal movement; up, down, left, and right.
            case 'U-':
                for (var i = (startIndices.y - 1); i > endIndices.y; i--) {
                    sqsBetween.push(COLUMNS[startIndices.x] + ROWS[i]);
                }
                break;

            case 'D-':
                for (var i = (startIndices.y + 1); i < endIndices.y; i++) {
                    sqsBetween.push(COLUMNS[startIndices.x] + ROWS[i]);
                }
                break;

            case '-L':
                for (var i = (startIndices.x - 1); i > endIndices.x; i--) {
                    sqsBetween.push(COLUMNS[i] + ROWS[startIndices.y]);
                }
                break;

            case '-R':
                for (var i = (startIndices.x + 1); i < endIndices.x; i++) {
                    sqsBetween.push(COLUMNS[i] + ROWS[startIndices.y]);
                }
                break;

            // Cases for strait diagonal movement.
            case 'UR':
                for (var i = (startIndices.y - 1); i > endIndices.y; i--) {
                    sqsBetween.push(COLUMNS[startIndices.x + startIndices.y - i] + ROWS[i]);
                }
                break;

            case 'UL':
                for (var i = (startIndices.y - 1); i > endIndices.y; i--) {
                    sqsBetween.push(COLUMNS[startIndices.x - startIndices.y + i] + ROWS[i]);
                }
                break;

            case 'DR':
                for (var i = (startIndices.y + 1); i < endIndices.y; i++) {
                    sqsBetween.push(COLUMNS[startIndices.x - startIndices.y+i] + ROWS[i]);
                }
                break;

            case 'DL':
                for (var i = (startIndices.y + 1); i < endIndices.y; i++) {
                    sqsBetween.push(COLUMNS[startIndices.x + startIndices.y-i] + ROWS[i]);
                }
                break;

            // Cases for irregular diagonal movement.
            /*
            Irregular movement for moves farther than a knight need to limit the
            rectangle to adjacent squares around the start and end coordinate.
            */
            // More up than right.
            case 'Ur':
                for (var i = (startIndices.x); i <= endIndices.x; i++) {
                    for (var j = (startIndices.y - 1); j > endIndices.y; j--) {
                        sqsBetween.push(COLUMNS[i] + ROWS[j]);
                    }
                }
                break;

            // More right than up.
            case 'uR':
                for (var i = (startIndices.x + 1); i < endIndices.x; i++) {
                    for (var j = (startIndices.y); j >= endIndices.y; j--) {
                        sqsBetween.push(COLUMNS[i] + ROWS[j]);
                    }
                }
                break;

            // More up than left.
            case 'Ul':
                for (var i = (startIndices.x); i >= endIndices.x; i--) {
                    for (var j = (startIndices.y - 1); j > endIndices.y; j--) {
                        sqsBetween.push(COLUMNS[i] + ROWS[j]);
                    }
                }
                break;

            // More left than up.
            case 'uL':
                for (var i = (startIndices.x - 1); i > endIndices.x; i--) {
                    for (var j = (startIndices.y); j >= endIndices.y; j--) {
                        sqsBetween.push(COLUMNS[i] + ROWS[j]);
                    }
                }
                break;

            // More down than right.
            case 'Dr':
                for (var i = (startIndices.x); i <= endIndices.x; i++) {
                    for (var j = (startIndices.y + 1); j < endIndices.y; j++) {
                        sqsBetween.push(COLUMNS[i] + ROWS[j]);
                    }
                }
                break;

            // More right than down.
            case 'dR':
                for (var i = (startIndices.x + 1); i < endIndices.x; i++) {
                    for (var j = (startIndices.y); j <= endIndices.y; j++) {
                        sqsBetween.push(COLUMNS[i] + ROWS[j]);
                    }
                }
                break;

            // More down than left.
            case 'Dl':
                for (var i = (startIndices.x); i >= endIndices.x; i--) {
                    for (var j = (startIndices.y + 1); j < endIndices.y; j++) {
                        sqsBetween.push(COLUMNS[i] + ROWS[j]);
                    }
                }
                break;

            // More left than down.
            case 'dL':
                for (var i = (startIndices.x - 1); i > endIndices.x; i--) {
                    for (var j = (startIndices.y); j <= endIndices.y; j++) {
                        sqsBetween.push(COLUMNS[i] + ROWS[j]);
                    }
                }
                break;

            default:
                console.warn('Error: Board.getSquaresBetween() used default case.');
                break;
        }
        return sqsBetween;
    }
}
