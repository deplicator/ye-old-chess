/**
 * @file All piece classes.
 * @author james
 */

/**
  * Piece class contains everything about a piece, it's sprites, moves,
  * abilities, and upgrade options.
  * @extends Phaser.Group
  */
class Piece extends Phaser.Group {

    /** Create a piece.
     * @param {object} game      Reference to the Phaser game object.
     * @param {object} player    Reference to the player object.
     * @param {object} pieceData Information about this piece from local storage.
     */
    constructor(game, player, pieceData) {
        super(game, player);

        this.data = {};
        this.data.player     = player;               // Who this piece belongs to.
        this.data.id         = pieceData.id;         // Unique identification for this piece.
        this.data.name       = pieceData.name;       // Name shown on customize screen.
        this.data.coordinate = pieceData.coordinate; // Piece's current coordinate while playing.

        this.data.previousMoves = [];   // List of previous coordinates this piece has occupied.
        this.data.validMoves    = [];   // List of valid squares this pice can move to.
        this.data.validTakes    = [];   // List of valid captures available to this piece.
        this.data.enpassantSqs  = [];   // List of squares this piece is en passant on.
        this.data.shadows       = [];   // Faded spites of piece where they can be en passantly taken.

        this.data.positions = {
            sqIndices: {x: 0, y: 0}, // Index used in ROWS and COLUMNS constant arrays.
            offScreen: {x: 0, y: 0}, // Random location off screen to move pieces out of the way.
            title:     {x: 0, y: 0}, // Piece location on title screen.
            customize: {x: 0, y: 0}, // Piece location on customize screen.
            playStart: {x: 0, y: 0}  // Piece location at start of play screen.
        }

        // Update positions.
        this.setScreenPositions();

        // Keys for sprites.
        this.spriteKeys = pieceData.spriteKeys;

        // An object that is a useful reference to this group's children.
        this.sprites = {};

        // Only add sprites that exist, each piece can have a different number of keys.
        let baseKey;
        let upgradeKey;
        let specialKey;
        for (var i = 0; i < 6; i++) {
            baseKey    = 'b' + i;
            upgradeKey = 'u' + i;
            specialKey = 's' + i;
            if (this.game.cache.checkImageKey(this.spriteKeys[baseKey])) {
                this.sprites[baseKey] = game.add.sprite(0, 0, this.spriteKeys[baseKey]);
                this.add(this.sprites[baseKey]);
            }
            if (this.game.cache.checkImageKey(this.spriteKeys[upgradeKey])) {
                this.sprites[upgradeKey] = game.add.sprite(0, 0, this.spriteKeys[upgradeKey]);
                this.add(this.sprites[upgradeKey]);
            }
            if (this.game.cache.checkImageKey(this.spriteKeys[specialKey])) {
                this.sprites[specialKey] = game.add.sprite(0, 0, this.spriteKeys[specialKey]);
                this.add(this.sprites[specialKey]);
            }
        }

        // Setup all the children.
        this.setAll('visible', false);

        this.forEach(function(sprite) {
            sprite.x = this.data.positions.offScreen.x;
            sprite.y = this.data.positions.offScreen.y;

            sprite.inputEnabled = true;
            sprite.input.enableDrag(false);
            sprite.input.enableSnap(80, 80, false, true, BOARD_ORIGIN.x, BOARD_ORIGIN.y);
            sprite.input.draggable = false;
        }, this);

        // Some kind of filter.
        //https://gist.github.com/MatthewBarker/032c325ef8577c6d0188
        let fragmentSrc = [
            'precision lowp float;',
            'varying vec2 vTextureCoord;',
            'varying vec4 vColor;',
            'uniform sampler2D uSampler;',

            'void main() {',
                'vec4 sum = vec4(0);',
                'vec2 texcoord = vTextureCoord;',
                'for(int xx = -4; xx <= 4; xx++) {',
                    'for(int yy = -3; yy <= 3; yy++) {',
                        'float dist = sqrt(float(xx*xx) + float(yy*yy));',
                        'float factor = 0.0;',
                        'if (dist == 0.0) {',
                            'factor = 2.0;',
                        '} else {',
                            'factor = 2.0/abs(float(dist));',
                        '}',
                        'sum += texture2D(uSampler, texcoord + vec2(xx, yy) * 0.002) * factor;',
                    '}',
                '}',
                'gl_FragColor = sum * 0.025 + texture2D(uSampler, texcoord);',
            '}'
        ];
        this.data.filterGlow = new Phaser.Filter(game, null, fragmentSrc);
    }

    /** Setup screen positions for this piece from board coordinate */
    setScreenPositions() {
        let d = this.data;

        // Must be called after coordinate set in subclass.
        d.positions.sqIndices = this.game.board.getSquareIndices(d.coordinate);

        /*** Off Screen ***/
        let randAngle = this.game.rnd.between(0, 360);
        this.data.positions.offScreen.x = Math.cos(randAngle) * 5000;
        this.data.positions.offScreen.y = Math.sin(randAngle) * 5000;

        /*** Title Screen ***/
        let titleStateOffsetx = 385;
        let titleStateOffsety = 80;
        let sqIndicesx = d.positions.sqIndices.x; // for uniformity
        let sqIndicesy = d.positions.sqIndices.y; // for fliping

        // Tthese are derived by board coordinate's, so the offsets are different for both players.
        if (d.player.data.playerName === 'player2') {
            titleStateOffsetx = 45;
            titleStateOffsety = 325;
            // Flip pawn row around for player2.
            if (d.positions.sqIndices.y === 1) {
                sqIndicesy = -1;
            } else if (d.positions.sqIndices.y === 2) {
                sqIndicesy = -2;
            }
        }

        d.positions.title.x = sqIndicesx * 30 + titleStateOffsetx;
        d.positions.title.y = sqIndicesy * 35 + titleStateOffsety;

        /*** Customize Screen ***/
        let customizeStateIndexOffsetX = 0;
        let customizeStateIndexOffsetY = -2;
        if (d.player.data.playerName === 'player2') {
            customizeStateIndexOffsetY = 3;
        }

        d.positions.customize.x = (d.positions.sqIndices.x + customizeStateIndexOffsetX) * 80 + BOARD_ORIGIN.x;
        d.positions.customize.y = (d.positions.sqIndices.y + customizeStateIndexOffsetY) * 80 + BOARD_ORIGIN.y;

        /*** Play Screen ***/
        d.positions.playStart.x = d.positions.sqIndices.x * 80 + BOARD_ORIGIN.x;
        d.positions.playStart.y = d.positions.sqIndices.y * 80 + BOARD_ORIGIN.y;
    }

    /** Move piece to random place off screen. */
    movePieceOffScreen() {
        this.resetEvents();

        this.forEach(function(sprite) {
            let move = this.game.add.tween(sprite).to(
                {x: this.data.positions.offScreen.x, y: this.data.positions.offScreen.y},
                2000,
                Phaser.Easing.Linear.Out,
                true,
                15
            );
            move.start();
        }, this);
    }

    /** Move piece to title screen position. */
    movePieceToTitle() {
        let d = this.data;

        this.resetEvents();

        this.forEach(function(sprite) {
            let move = this.game.add.tween(sprite).to(
                {x: d.positions.title.x, y: d.positions.title.y},
                1000,
                Phaser.Easing.Quadratic.Out,
                true,
                15
            );
            let scale = this.game.add.tween(sprite.scale).to(
                {x: 0.5, y: 0.5},
                1000,
                Phaser.Easing.Quadratic.Out,
                true,
                15
            );
            move.start();
            scale.start();
        }, this);
    }

    /** Move piece to customize screen position. */
    movePieceToCustomize() {
        let g = this.game;
        let d = this.data;
        let p = this.data.player;

        this.resetEvents();

        this.forEach(function(sprite) {
            let move  = g.add.tween(sprite).to(
                {x: d.positions.customize.x, y: d.positions.customize.y},
                1000,
                Phaser.Easing.Quadratic.Out,
                true,
                15
            );
            let scale = g.add.tween(sprite.scale).to(
                {x: 1.0, y: 1.0},
                1000,
                Phaser.Easing.Quadratic.Out,
                true,
                15
            );
            move.start();
            scale.start();

            // Drag without snap to middle.
            sprite.input.enableDrag(false);

            // Click handler for customize, handlers now use the same methods as play.
            sprite.events.onInputDown.add(this.clickPiece, this);

            // Drag event handlers while in customize.
            sprite.events.onDragStart.add(this.pickupPiece, this);
            sprite.events.onDragStop.add(this.dropPiece, this);
        }, this);
    }

    /** Move piece to play screen position. */
    movePieceToPlay() {

        // Remove all other inputs.
        this.resetEvents();

        // Move all the sprite children together for this piece.
        this.forEach(function(sprite) {

            // Move them in a cool way.
            let move = this.game.add.tween(sprite).to(
                {x: this.data.positions.playStart.x, y: this.data.positions.playStart.y},
                1000,
                Phaser.Easing.Quadratic.Out,
                true,
                15
              );
            let scale = this.game.add.tween(sprite.scale).to(
                {x: 1.0, y: 1.0},
                1000,
                Phaser.Easing.Quadratic.Out,
                true,
                15
            );

            move.onComplete.add(function() {
                if (this.data.player.data.turn && this.data.player.data.ai) {
                    this.data.player.aiMove();
                }
            }, this);

            move.start();
            scale.start();

            // Drag without snap to middle.
            sprite.input.enableDrag(false);

            // Drag event handlers while playing.
            sprite.events.onDragStart.add(this.pickupPiece, this);
            sprite.events.onDragStop.add(this.dropPiece, this);
        }, this);

        // Start this piece history.
        this.data.previousMoves.push(this.data.coordinate);
        this.game.board.setOccupied(this);
    }

    /** Reset filter and hide piece data screen. */
    unhighlight() {
        this.forEach(function(sprite) {
            sprite.filters = null;
        }, this);

        this.data.pieceDataScreen.hide();
    }

    /** Deleted piece fades away sadly.
     * @param {boolean} [sound] - Play delete piece sound when set.
     */
    deletePiece(sound = false) {
        let p = this.data.player;
        // Allows removing whole team without extra noise.
        if (sound) {
            this.game.noises.capture.play();
        }

        // Don't need this anymore.
        this.data.pieceDataScreen.destroy();

        // Tween fade all sprites in this group.
        this.forEach(function(sprite) {
            let alpha = parent.game.add.tween(sprite).to(
                {alpha: 0},
                500,
                Phaser.Easing.Circular.Out,
                true,
                15
            );
            alpha.onComplete.add(function() {
                // Destroy after fade.
                this.destroy();

                // Save and recalculate value.
                p.saveToLocalStorage();
                p.calculateTeamValue();

                // Reenable done button (see customize state for details).
                if (!customizeState.btnDone.inputEnabled) {
                    customizeState.btnDone.inputEnabled = true;
                }
            }, this);
            alpha.start();
        }, this);
    }

    /** Add all input events for play on this piece's sprites. */
    playEvents() {
        this.forEach(function(sprite) {
            // Drag without snap to middle.
            sprite.input.enableDrag(false);

            // Drag event handlers while playing.
            sprite.events.onDragStart.add(this.pickupPiece, this);
            sprite.events.onDragStop.add(this.dropPiece, this);
        }, this);
    }

    /** Remove all input events on this piece's sprites. */
    resetEvents() {
        this.forEach(function(sprite) {
            sprite.events.onInputDown.removeAll();
            sprite.events.onDragStart.removeAll();
            sprite.events.onDragStop.removeAll();
            sprite.input.disableDrag();
        }, this);
    }

    /** Calculate this piece's value based on start coordinate and upgrades. */
    calculateValue() {
        let d    = this.data;
        let base = this.data.values.base;
        let startColModifier = 0;
        let startRowModifier = 0;

        /*** Calcualte differences in start Columns ***/
        // Pieces in outside columns, a and h.
        if (d.positions.sqIndices.x === 0 || d.positions.sqIndices.x === 7) {
            startColModifier = base * d.values.startCol * -1;

        // Pieces in columns b and g
        } else if (d.positions.sqIndices.x === 1 || d.positions.sqIndices.x === 6) {
            startColModifier = 0;

        // Pieces in columns c and f.
        } else if (d.positions.sqIndices.x === 2 || d.positions.sqIndices.x === 5) {
            startColModifier = base * d.values.startCol;

        // Pieces in columns d and e.
        } else if (d.positions.sqIndices.x === 3 || d.positions.sqIndices.x === 4) {
            startColModifier = base * (d.values.startCol * 2);
        }

        /*** Calcualte differences in start Rows ***/
        // Pieces in first row (home row).
        if (d.positions.sqIndices.y === 0 || d.positions.sqIndices.y === 7) {
            startRowModifier = base * d.values.startRow * -1;

        // Pieces in second row (pawn row).
        } else if (d.positions.sqIndices.y === 1 || d.positions.sqIndices.y === 6) {
            startRowModifier = 0;

        // Pieces in third row (closest to enemy).
        } else if (d.positions.sqIndices.y === 2 || d.positions.sqIndices.y === 5) {
            startRowModifier = base * d.values.startRow;
        }

        // Update current value with everything that goes into calculating value,
        // round down to whole number.
        d.values.current = parseInt(base + startRowModifier + startColModifier + d.values.upgrade);
    }

    /** Event handler for picking up a piece during play.
     * @param {object} grabbed - A reference to the sprite in the group picked
     *                           up (whichever is on top).
     */
    pickupPiece(grabbed) {
        let d = this.data;
        // Handle pickup piece during game play.
        if (this.game.state.current === 'play') {

            // Only allowable on player's turn.
            if (this.data.player.data.turn) {

                // Start with some pick up noise.
                this.game.noises.pickup.play();

                // Move all children together.
                this.forEach(function(sprite) {
                    sprite.position = grabbed.position;
                }, this);

                // Figure out what this piece can do!
                this.determineValidMoves();
                if (d.movement.move !== d.movement.take ||
                    d.movement.maxMove !== d.movement.maxTake ||
                    d.movement.minMove !== d.movement.minTake) {
                    this.determineSpecialTakes();
                }

                // Display what this piece can do on the board.
                this.game.board.highlightSquares(_.unique(this.data.validMoves), MOVESHIGHLIGHTCOLOR);
                this.game.board.highlightSquares(_.unique(this.data.validTakes), TAKESHIGHLIGHTCOLOR);
            }
        }

        // Handle pickup piece during customize.
        if (this.game.state.current === 'customize') {

            // Start with some pick up noise.
            this.game.noises.pickup.play();

            // Move all children together.
            this.forEach(function(sprite) {
                sprite.position = grabbed.position;
            }, this);
        }
    }

    /** Event handler for dropping a piece. */
    dropPiece() {
        let g = this.game;
        let d = this.data;
        let p = this.data.player;

        // Handle drop piece during game play.
        if (g.state.current === 'play') {

            // square attempting to drop on
            this.move(COLUMNS[(this.sprites.b0.x - BOARD_ORIGIN.x) / 80]
                       + ROWS[(this.sprites.b0.y - BOARD_ORIGIN.y) / 80]);

            g.board.removeHighlight();
        }

        // Handle drop piece during customize.
        if (g.state.current === 'customize') {

            let indexOffsetY = 2;
            if (p.data.playerName == 'player2') {
                indexOffsetY = -3;
            }

            // Update this piece's data in player's team array (b0 is base sprite, all sprites have one).
            let parentTeamPeice = p.findPiecesById(d.id);
            parentTeamPeice.coordinate = COLUMNS[(this.sprites.b0.x - BOARD_ORIGIN.x) / 80] +
                                         ROWS[((this.sprites.b0.y - BOARD_ORIGIN.y) / 80) + indexOffsetY];
            d.coordinate = parentTeamPeice.coordinate;
            this.setScreenPositions();
            p.savePieces();
            p.saveToLocalStorage();
            p.calculateTeamValue();
            d.pieceDataScreen.updateData(d);
            g.noises.drop.play();
        }
    }

    /** Event handler for clicking on a piece. */
    clickPiece() {
        this.data.player.callAll('unhighlight');
        this.data.pieceDataScreen.show();

        this.forEach(function(sprite) {
            sprite.filters = [this.data.filterGlow];
        }, this);
    }

    /** Checks for valid placement and capture, updates data if good.
     * @param {string} coordinate - The coordinate the piece is attempting to
     *                              move to.
     */
    move(coordinate) {

        console.log(this.data.player.data.colorName + ' ' + this.data.name + ' ' + coordinate);

        let g = this.game;
        let d = this.data;

        // This is a value square to move on.
        if (d.validMoves.includes(coordinate) || d.validTakes.includes(coordinate)) {
            g.noises.drop.play();

            // clear any enpassantSqs
            g.player1.clearEnpassants();
            g.player2.clearEnpassants();

            if (d.validTakes.includes(coordinate)) {
                let enemy;

                // link enpassant sqs to actual piece coordinate
                if (g.board.isEnpassant(coordinate)) {
                    enemy = g.board.getEnpassantPiece(coordinate).piece;
                } else {
                    enemy = g.board.getOccupiedPiece(coordinate).piece;
                }
                g.noises.capture.play();
                enemy.destroy();
            }

            d.coordinate = coordinate;
            d.previousMoves.push(coordinate);

            // update sqIndices
            d.positions.sqIndices = g.board.getSquareIndices(d.coordinate);

            g.board.setOccupied(this);
            g.board.unsetOccupied(d.previousMoves[d.previousMoves.length-2]);

            // Deal with pieces that are en passant.
            if (d.modifiers.enpassant) {

                // Get all squares passed over, except start and end.
                d.enpassantSqs = g.board.getSquaresBetween(d.previousMoves[d.previousMoves.length-2], d.coordinate);

                // Loop through en passant squares and set a shadow.
                let enpassantSqIndices;
                for (var i = 0; i < d.enpassantSqs.length; i++) {
                    enpassantSqIndices = g.board.getSquareIndices(d.enpassantSqs[i]);
                    d.shadows[i] = g.add.sprite(enpassantSqIndices.x * 80 + BOARD_ORIGIN.x,
                                                enpassantSqIndices.y * 80 + BOARD_ORIGIN.y,
                                                this.spriteKeys.b0); // needs to show all visible sprites, not just base
                    d.shadows[i].alpha = 0.25;
                    g.board.setEnpassant(d.enpassantSqs[i], this);
                }
            }

            // Update history and end turn.
            d.player.updateHistory(this, d.coordinate);
            if (!d.player.data.ai) {
                d.player.endTurn(d.player.data.playerName);
            }

            // If this piece was moved by ai, we need to move it's actual position.
            if (d.positions.sqIndices.x != ((this.sprites.b0.x - BOARD_ORIGIN.x) / 80) ||
               (d.positions.sqIndices.y != ((this.sprites.b0.y - BOARD_ORIGIN.y) / 80))) {
               this.forEach(function(sprite) {

                    // Slow them down a bit so we can see them move.
                    let move = this.game.add.tween(sprite).to(
                        {
                            x: this.data.positions.sqIndices.x * 80 + BOARD_ORIGIN.x,
                            y: this.data.positions.sqIndices.y * 80 + BOARD_ORIGIN.y
                        },
                        250,
                        Phaser.Easing.Circular.Out,
                        true,
                        15
                    );

                    move.onComplete.add(function() {
                        d.player.endTurn(d.player.data.playerName);
                    }, this);

                    move.start();
               }, this);
            }

        // This is not a valid square to place this piece.
        } else {

            // Play some sounds.
            if (d.coordinate == coordinate) {
                g.noises.drop.play();
            } else {
                g.noises.invalid.play();
            }

            // Move back to original square.
            let last = g.board.getSquareIndices(d.previousMoves[d.previousMoves.length - 1]);
            this.sprites.b0.x = last.x * 80 + BOARD_ORIGIN.x;
            this.sprites.b0.y = last.y * 80 + BOARD_ORIGIN.y;
        }
    }

    /** Create array of valid squares this piece can move to. Also creates valid
     * takes array as long as the takes and moves are the same. */
    determineValidMoves(debug = false) {
        let d = this.data;

        // Reset current move list.
        d.validMoves = [];

        let normalTakes = false;

        if (d.movement.move === d.movement.take && d.movement.maxMove === d.movement.maxTake && d.movement.minMove === d.movement.minTake) {
            normalTakes = true;
            d.validTakes = [];
        }

        let intermediateMoves = [];

        let pathBlocked       = false; // Set if path is blocked in given direction.
        let irregularMovement = false; // Set if movement is not between -1 and 1.
        let jumps = d.modifiers.jump;  // Number of jumps this piece has.

        let tempIndices;
        let currentMovement;

        // Each way this piece can move.
        for (var j = 0; j < d.movement.move.length; j++) {

            // Reset path blacked.
            pathBlocked = false;

            // reflect can update this, but it usually doesn't change.
            currentMovement = d.movement.move[j]
            if (debug) { console.log('direction:', currentMovement); }

            // Also a thing for refelct to work.
            tempIndices = d.positions.sqIndices;
            if (debug) { console.log('    from sq:', COLUMNS[tempIndices.x] + ROWS[tempIndices.y]); }

            // Check if this piece moves irregularly.
            if ((d.movement.move[j][0] > 1) || (d.movement.move[j][0] < -1) ||
                (d.movement.move[j][1] > 1) || (d.movement.move[j][1] < -1)) {
                irregularMovement = true;
            }

            // How far this piece can move in this direction.
            for (var i = d.movement.minMove; i < d.movement.maxMove; i++) {

                // For reflect, update tempIndices.
                if (d.validMoves.length != 0 && i != 0) {
                    tempIndices = game.board.getSquareIndices(d.validMoves[d.validMoves.length-1]);
                }

                // Get coordinates for a potential final destination.
                let col = COLUMNS[tempIndices.x + (currentMovement[0])];
                let row =    ROWS[tempIndices.y + (currentMovement[1])];
                let checkSquare = col + row;


                // Ignore squares that don't makes sense and the square this piece is on.
                if (col != undefined && row != undefined && checkSquare != d.coordinate) {
                    if (debug) { console.log('    look at:', checkSquare); }

                    // Differentiate Leaping and Sliding pieces.
                    if (d.modifiers.leap) {
                        if (debug) { console.log('    leap'); }

                        // Leapers just go places as long as there is not a piece in the spot.
                        if (!this.game.board.isOccupied(checkSquare)) {
                            d.validMoves.push(checkSquare);
                        } else {
                            if (normalTakes && !this.game.board.isOccupiedByPlayer(d.player, checkSquare)) {
                                if (debug) { console.log('    capture at', checkSquare); }
                                d.validTakes.push(checkSquare);
                            }
                        }

                    } else {

                        if (debug) { console.log('    slide'); }

                        // If path is blocked, no more valid squares in this direction.
                        if (pathBlocked) {
                            if (debug) { console.log('    direction blocked'); }
                            break;
                        }

                        // If this square is blocked by another piece
                        if (this.game.board.isOccupied(checkSquare)) {
                            if (debug) { console.log('    occupied', checkSquare); }

                            if (normalTakes && !irregularMovement && !this.game.board.isOccupiedByPlayer(d.player, checkSquare)) {
                                if (debug) { console.log('    capture at', checkSquare); }
                                d.validTakes.push(checkSquare);
                            }

                            // Handle if this piece can jump.
                            if (jumps > 0) {
                                if (debug) { console.log('    can jump:', checkSquare); }
                                d.validMoves.push(checkSquare);
                                intermediateMoves.push(checkSquare);
                                jumps--;
                            } else {
                                if (debug) { console.log('    blocked at ', checkSquare); }
                                pathBlocked = true;
                            }

                            // This piece is funky--need to figure out takes
                            if (irregularMovement) {

                                // Get intermedate squares.
                                let paths = this.game.board.getSquaresBetween(d.coordinate, checkSquare);
                                let pathsCount = 0;
                                for (var l = 0; l < paths.length; l++) {
                                    // Count how many intermedate squares are occupied.
                                    if (this.game.board.isOccupied(paths[l])) {
                                        pathsCount++;
                                    // The non-occupied intermedate squares can be highlighted.
                                    } else {
                                        intermediateMoves.push(paths[l])
                                    }
                                }

                                // If all the intermedate squares are occupied, you can't go this way.
                                if (paths.length !== pathsCount) {
                                    // This currently only works for the knight, the getSquaresBetween
                                    // method returns too many squares if the start and end are greater
                                    // than 2 in either row or column. See that method for why.
                                    if (normalTakes && !this.game.board.isOccupiedByPlayer(d.player, checkSquare)) {
                                        if (debug) { console.log('    capture at', checkSquare); }
                                        d.validTakes.push(checkSquare);
                                    }
                                }
                            }

                        // If it's not blocked, this is a valid square this piece can move to.
                        } else {

                            // This piece is funky--need to figure out moves
                            if (irregularMovement) {

                                // Get intermedate squares.
                                let paths = this.game.board.getSquaresBetween(d.coordinate, checkSquare);
                                let pathsCount = 0;
                                for (var l = 0; l < paths.length; l++) {
                                    // Count how many intermedate squares are occupied.
                                    if (this.game.board.isOccupied(paths[l])) {
                                        pathsCount++;
                                    // The non-occupied intermedate squares can be highlighted.
                                    } else {
                                        intermediateMoves.push(paths[l])
                                    }
                                }

                                // If all the intermedate squares are occupied, you can't go this way.
                                if (paths.length !== pathsCount) {
                                    // This currently only works for the knight, the getSquaresBetween
                                    // method returns too many squares if the start and end are greater
                                    // than 2 in either row or column. See that method for why.
                                    d.validMoves.push(checkSquare);
                                }

                            } else {
                                if (debug) { console.log('    valied move:', checkSquare); }
                                d.validMoves.push(checkSquare);
                            }
                        }
                    }
                }


                // If row is off the board and this piece has reflect, try turning.
                if (d.modifiers.reflect && (col === undefined || row === undefined)) {
                    if (debug) { console.log('    reflect'); }

                    // If piece goes off the left or right of board, invert left and right movement.
                    if (col === undefined) {
                        if (debug) { console.log('    reverse col'); }
                        currentMovement = [currentMovement[0] * -1, currentMovement[1]];
                    }

                    // If piece goes off the top or bottom of board, invert up and down movement.
                    if (row === undefined) {
                        if (debug) { console.log('    reverse row'); }
                        currentMovement = [currentMovement[0], currentMovement[1] * -1];
                    }

                    // New valid square.
                    col = COLUMNS[tempIndices.x + currentMovement[0]];
                    row =    ROWS[tempIndices.y + currentMovement[1]];
                    checkSquare = col + row;
                    if (debug) { console.log('    valied move:', checkSquare); }

                    if (checkSquare != d.coordinate && !this.game.board.isOccupied(checkSquare)) {
                        d.validMoves.push(checkSquare);
                    }
                }
            }
            // Reset jumps for next move direction.
            jumps = d.modifiers.jump;
        }

        // Remove intermediate moves from valid moves.
        d.validMoves = _.difference(d.validMoves, intermediateMoves);

        // highlight intermediateMoves
        if (debug) {
            this.game.board.highlightSquares(_.unique(intermediateMoves), 0xff30a6);
        }
    }

    /** Create array of valid squares this piece can take. */
    determineSpecialTakes(debug = false) {
        let d = this.data;
        d.validTakes = [];
        let pathBlocked = false; // Set if path is blocked in given direction.

        for (var j = 0; j < d.movement.take.length; j++) {
            pathBlocked = false;
            for (var i = d.movement.minTake; i <= d.movement.maxTake; i++) {

                // If path is blocked, no more valid squares in this direction.
                if (pathBlocked) {
                    break;
                }

                let col = COLUMNS[d.positions.sqIndices.x + (d.movement.take[j][0] * i)];
                let row =    ROWS[d.positions.sqIndices.y + (d.movement.take[j][1] * i)];
                let checkSquare = col + row;

                if (col != undefined && row != undefined && checkSquare != d.coordinate) {
                    if (this.game.board.isOccupied(checkSquare)) {
                        if (!this.game.board.isOccupiedByPlayer(d.player, checkSquare)) {
                            if (debug) { console.log('    take:', checkSquare); }
                            d.validTakes.push(checkSquare);
                        }
                    }
                    if(this.game.board.isEnpassant(checkSquare)) {
                        d.validTakes.push(checkSquare);
                    }
                }
            }
        }
    }

    /** Remove enpassant shadows from board. */
    clearEnpassant() {
        if (this.data.shadows.length != 0) {
            _.each(this.data.shadows, function(shadow) {
                shadow.destroy();
            });
        }
    }

}

/** Bishop specific piece class.
 * @extends Piece
 */
class Bishop extends Piece {

    /** Create a Bishop.
     * @param {object} game      Reference to the Phaser game object.
     * @param {object} player    Reference to the player object.
     * @param {object} pieceData Information about this piece from local storage.
     */
    constructor(game, player, pieceData) {

        if (player.data.playerName === 'player1') {
            pieceData.spriteKeys = {
                b0:   'wBb0',
                b1:   'wBb1',
                b2:   'wBb2',
                b3:   'wBb3',
                b4:   'wBb4',
                b5:   'wBb5',
                u0:   'wBu0',
                u1:   'wBu1',
                u2:   'wBu2',
                u3:   'wBu3',
                u4:   'wBu4',
                u5:   'wBu5',
                s1:   'wBs1',
                s2:   'wBs2'
            };
        } else if (player.data.playerName === 'player2') {
            pieceData.spriteKeys = {
                b0:   'bBb0',
                b1:   'bBb1',
                b2:   'bBb2',
                b3:   'bBb3',
                b4:   'bBb4',
                b5:   'bBb5',
                u0:   'bBu0',
                u1:   'bBu1',
                u2:   'bBu2',
                u3:   'bBu3',
                u4:   'bBu4',
                u5:   'bBu5',
                s1:   'bBs1',
                s2:   'bBs2'
            };
        }

        super(game, player, pieceData);

        let d = this.data;             // Piece data.
        let p = this.data.player.data; // Player data.

        d.basePiece  = 'bishop';       // Base piece name (never changes).

        d.values = {
            current:    0,            // Calculated total value of piece.
            base:     347,            // All calculations start with this base value.
            upgrade:    0,            // Added or removed from base based on current upgrades.
            startCol:   0.0,          // Percent change (+ or -) for starting away from column B or G.
            startRow:   0.1           // Percent change (+ or -) for starting away from row 2 or 7.
        }

        d.movement = {
            minMove: 0,              // Minium this piece has to move on its turn.
            maxMove: 7,              // Maximum this piece can move on its turn.
            minTake: 0,              // Minium distance from enemy for this piece to take.
            maxTake: 7,              // Maximum distance from enemy for this piece to take.
            move: DIAGONAL,          // Array representing how this piece moves.
            take: DIAGONAL           // Array representing how this piece takes.
        };

        d.modifiers = {              // Modifiers on piece (see wiki descrition).
            enpassant: false,        // Can be taken and take en passant.
            opening:   false,        // Different start move.
            royal:     false,        // Loosing this piece is bad for you.
            leap:      false,        // Pieces on the board do not block this piece's movement.
            jump:          0,        // Value of 0 means no jump, other value is how many jumps.
            reflect:   false,        // Value of 0 means no reflect, other values is how many reflects.
            reverse:   false         // Directionally challenged pieces can go the other way with this.
        };

        d.upgrades = pieceData.upgrades; // Array of booleans representing selected upgrades.
        d.upgradeText = [                // Array of upgrade descriptions.
            "Reduce move and take by 5",
            "Reduce move and take by 1",
            "Increase move and take by 3",
            "Minimum move 2",
            "Give Jump 1",
            "Give Reflect"
        ];

        this.setUpgrades();
        this.calculateValue();

        d.moveDiagram = 'bishop-std-move';
        d.pieceDataScreen = new PieceDataScreen(game, this);

    }

    /** Figure out this piece's upgrade value and sprites.
     * @returns {boolean} True if this piece is special.
     */
    setUpgrades() {
        let d = this.data;
        let s = this.sprites;
        let special = false;

        d.name = "Bishop";
        d.values.upgrade = 0;
        d.movement.maxMove = 7;
        d.movement.maxTake = 7;
        d.movement.minMove = 0;
        d.movement.minTake = 0;

        // Intially set only base pieces to visible. Upgrades will hide and show sprites.
        this.setAll('visible', false);
        s.b0.visible = true;
        s.b1.visible = true;
        s.b2.visible = true;
        s.b3.visible = true;
        s.b4.visible = true;
        s.b5.visible = true;

        // Reduce move and take by 5
        if (d.upgrades[0]) {
            d.movement.maxMove -= 5;
            d.movement.maxTake -= 5;
            d.values.upgrade -= 150;
            s.b5.visible = false;   // Hide the base part.
            s.u5.visible = true;    // Show the upgraded part.
        } else {
            s.b5.visible = true;
            s.u5.visible = false;
        }

        // Reduce move and take by 1
        if (d.upgrades[1]) {
            d.movement.maxMove -= 1;
            d.movement.maxTake -= 1;
            d.values.upgrade -= 25;
            s.b0.visible = false;
        } else {
            s.b0.visible = true;
        }

        // Increase move and take by 3
        if (d.upgrades[2]) {
            d.movement.maxMove += 3;
            d.movement.maxTake += 3;
            d.values.upgrade += 100;
            s.b0.visible = false;
            s.u0.visible = true;
        } else {
            // Don't show b0 if this one is not selected and b0 is.
            if (!d.upgrades[1]) {
                s.b0.visible = true;
                s.u0.visible = false;
            }
        }

        // Minimum move 2
        if (d.upgrades[3]) {
            d.movement.minMove = 2;
            d.movement.minTake = 2;
            d.values.upgrade -= 100;
            s.b4.visible = false;
        } else {
            s.b4.visible = true;
        }

        // Give Jump 1
        if (d.upgrades[4]) {
            d.modifiers.jump = 1;
            d.values.upgrade += 200;
            s.b2.visible = false;
            s.u2.visible = true;
        } else {
            s.b2.visible = true;
            s.u2.visible = false;
        }

        // Give Reflect
        if (d.upgrades[5]) {
            d.modifiers.reflect = true;
            d.values.upgrade += 200;
            s.u4.visible = true;
        } else {
            s.u4.visible = false;
        }

        // Change piece name, value, and/or sprite in specific conditions.
        if (d.upgrades[0] && d.upgrades[3] && d.upgrades[4] &&
            !d.upgrades[1] && !d.upgrades[2] && !d.upgrades[5]) {
            d.name = "Alfil";
            d.values.upgrade -= 20;
            this.forEach(function(sprite) {
                sprite.visible = false;
            }, this);
            s.s1.visible = true;
        }

        if (d.upgrades[2] && d.upgrades[5] &&
           !d.upgrades[0] && !d.upgrades[1] && !d.upgrades[3] && !d.upgrades[4]) {
            d.name = "ArchBishop";
            d.values.upgrade -= 20;
            this.forEach(function(sprite) {
                sprite.visible = false;
            }, this);
            s.s2.visible = true;
        }

        if (d.upgrades[0] && d.upgrades[1] &&
           !d.upgrades[2] && !d.upgrades[3] && !d.upgrades[4] && !d.upgrades[5]) {
            d.name = "Ferz";
            d.values.upgrade -= 20;
        }
    }

    /** Moves specific to the Bishop. */
    determineValidMoves() {

        super.determineValidMoves();
    }
}

/** King specific piece class.
 * @extends Piece
 */
class King extends Piece {

    /** Create a King.
     * @param {object} game      Reference to the Phaser game object.
     * @param {object} player    Reference to the player object.
     * @param {object} pieceData Information about this piece from local storage.
     */
    constructor(game, player, pieceData) {

        if (player.data.playerName === 'player1') {
            pieceData.spriteKeys = {
                b0: 'wKb0',
                u0: 'wKu0',
                u1: 'wKu1',
                u2: 'wKu2',
                u3: 'wKu3',
                u4: 'wKu4',
                u5: 'wKu5',
                s1: 'wKs1',
                s2: 'wKs2'
            };
        } else if (player.data.playerName === 'player2') {
            pieceData.spriteKeys = {
                b0: 'bKb0',
                u0: 'bKu0',
                u1: 'bKu1',
                u2: 'bKu2',
                u3: 'bKu3',
                u4: 'bKu4',
                u5: 'bKu5',
                s1: 'bKs1',
                s2: 'bKs2'
            };
        }

        super(game, player, pieceData);

        let d = this.data;                   // Piece data.
        let p = this.data.player.data;       // Player data.

        d.basePiece  = 'king';              // Base piece name (never changes).

        d.values = {
            current:    0,            // Calculated total value of piece.
            base:    1151,            // All calculations start with this base value.
            upgrade:    0,            // Added or removed from base based on current upgrades.
            startCol:   0.0,          // Percent change (+ or -) for starting away from column B or G.
            startRow:   0.0          // Percent change (+ or -) for starting away from row 2 or 7.
        }

        d.movement = {
            minMove: 0,              // Minium this piece has to move on its turn.
            maxMove: 1,              // Maximum this piece can move on its turn.
            minTake: 0,              // Minium distance from enemy for this piece to take.
            maxTake: 1,              // Maximum distance from enemy for this piece to take.
            move: _.union(DIAGONAL, ORTHOGONAL), // Array representing how this piece moves.
            take: _.union(DIAGONAL, ORTHOGONAL) // Array representing how this piece takes.
        };

        d.modifiers = {              // Modifiers on piece (see wiki descrition).
            enpassant: false,        // Can be taken and take en passant.
            opening: false,          // Different start move.
            royal: true,             // Loosing this piece is bad for you.
            leap: false,             // Pieces on the board do not block this piece's movement.
            jump: 0,                 // Value of 0 means no jump, any other value is how many jumps.
            reflect: 0               // Value of 0 means no reflect, any other value is how many reflects.
        };

        d.upgrades = pieceData.upgrades; // Array of booleans representing selected upgrades.
        d.upgradeText = [                // Array of upgrade descriptions.
            "placeholder",
            "placeholder",
            "placeholder",
            "placeholder",
            "placeholder",
            "placeholder"
        ];

        this.setUpgrades();
        this.calculateValue();

        d.moveDiagram = 'pawn-std-move';
        d.pieceDataScreen = new PieceDataScreen(game, this);

    }

    /** Figure out this piece's upgrade value and sprites.
     * @returns {boolean} True if this piece is special.
     */
    setUpgrades() {
        this.data.upgradeValue = 0;
        this.sprites.b0.visible = true;
    }
}

/** Knight specific piece class.
 * @extends Piece
 */
class Knight extends Piece {

    /** Create a Knight.
     * @param {object} game      Reference to the Phaser game object.
     * @param {object} player    Reference to the player object.
     * @param {object} pieceData Information about this piece from local storage.
     */
    constructor(game, player, pieceData) {

        if (player.data.playerName === 'player1') {
            pieceData.spriteKeys = {
                b0: 'wNb0',
                u0: 'wNu0',
                u1: 'wNu1',
                u2: 'wNu2',
                u3: 'wNu3',
                u4: 'wNu4',
                u5: 'wNu5',
                s1: 'wNs1',
                s2: 'wNs2'
            };
        } else if (player.data.playerName === 'player2') {
            pieceData.spriteKeys = {
                b0: 'bNb0',
                u0: 'bNu0',
                u1: 'bNu1',
                u2: 'bNu2',
                u3: 'bNu3',
                u4: 'bNu4',
                u5: 'bNu5',
                s1: 'bNs1',
                s2: 'bNs2'
            };
        }

        super(game, player, pieceData);

        let d = this.data;              // Piece data.
        let p = this.data.player.data;  // Player data.

        d.basePiece  = 'knight';        // Base piece name (never changes).

        d.values = {
            current:    0,            // Calculated total value of piece.
            base:     253,            // All calculations start with this base value.
            upgrade:    0,            // Added or removed from base based on current upgrades.
            startCol:   0.0,          // Percent change (+ or -) for starting away from column B or G.
            startRow:   0.25          // Percent change (+ or -) for starting away from row 2 or 7.
        }

        d.movement = {
            minMove: 0,              // Minium this piece has to move on its turn.
            maxMove: 1,              // Maximum this piece can move on its turn.
            minTake: 0,              // Minium distance from enemy for this piece to take.
            maxTake: 1,              // Maximum distance from enemy for this piece to take.
            move: STDKNIGHT,         // Array representing how this piece moves.
            take: STDKNIGHT          // Array representing how this piece takes.
        };

        d.modifiers = {              // Modifiers on piece (see wiki descrition).
            enpassant: false,        // Can be taken and take en passant.
            opening: false,          // Different start move.
            royal: false,            // Loosing this piece is bad for you.
            leap: true,              // Pieces on the board do not block this piece's movement.
            jump: 0,                 // Value of 0 means no jump, any other value is how many jumps.
            reflect: 0               // Value of 0 means no reflect, any other value is how many reflects.
        };

        d.upgrades = pieceData.upgrades; // Array of booleans representing selected upgrades.
        d.upgradeText = [                // Array of upgrade descriptions.
            "Remove leap",
            "Increase move by 2",
            "Increase take by 2",
            "Add zig zag",
            "Change to 1, 4 leap",
            "Add post move orthoganal slide"
        ];

        this.setUpgrades();
        this.calculateValue();

        d.moveDiagram = 'pawn-std-move';
        d.pieceDataScreen = new PieceDataScreen(game, this);
    }

    /** Figure out this piece's upgrade value and sprites.
     * @returns {boolean} True if this piece is special.
     */
    setUpgrades() {
        let d = this.data;
        let s = this.sprites;
        let special = false;

        d.name = "Knight";

        this.data.upgradeValue = 0;
        this.sprites.b0.visible = true;

        d.movement.maxMove = 1;
        d.movement.maxTake = 1;

        // Remove leap
        if (d.upgrades[0]) {
            d.modifiers.leap = false;
        } else {
            d.modifiers.leap = true;
        }

        // Increase move by 2
        if (d.upgrades[1]) {
            d.movement.maxMove += 2;
        }

        // Increase take by 2
        if (d.upgrades[2]) {
            d.movement.maxTake += 2;
        }

        if (!d.upgrades[0] && !d.upgrades[3] && !d.upgrades[4] && !d.upgrades[5] &&
             d.upgrades[1] &&  d.upgrades[2]) {
            d.name = "Knight Rider";
            special= true;
        }

        return special;
    }
}

/** Pawn specific piece class.
 * @extends Piece
 */
class Pawn extends Piece {

    /** Create a Pawn.
     * @param {object} game      Reference to the Phaser game object.
     * @param {object} player    Reference to the player object.
     * @param {object} pieceData Information about this piece from local storage.
     */
    constructor(game, player, pieceData) {

        // Set sprite keys
        if (player.data.playerName === 'player1') {
            pieceData.spriteKeys = {
                b0: 'wPb0',
                u0: 'wPu0',
                u1: 'wPu1',
                u2: 'wPu2',
                u3: 'wPu3',
                u4: 'wPu4',
                u5: 'wPu5',
                s1: 'wPs1',
                s2: 'wPs2'
            };
        } else if (player.data.playerName === 'player2') {
            pieceData.spriteKeys = {
                b0: 'bPb0',
                u0: 'bPu0',
                u1: 'bPu1',
                u2: 'bPu2',
                u3: 'bPu3',
                u4: 'bPu4',
                u5: 'bPu5',
                s1: 'bPs1',
                s2: 'bPs2'
            };
        }

        super(game, player, pieceData);

        let d = this.data;                   // Piece data.
        let p = this.data.player.data;       // Player data.
        d.forward = p.forward;
        d.reverse = p.forward * -1;

        d.basePiece  = 'pawn';               // Base piece name (never changes).

        d.values = {
            current:    0,           // Calculated total value of piece.
            base:      97,           // All calculations start with this base value.
            upgrade:    0,           // Added or removed from base based on current upgrades.
            startCol:   0.12,        // Percent change (+ or -) for starting away from column B or G.
            startRow:   0.1          // Percent change (+ or -) for starting away from row 2 or 7.
        }

        d.movement = {
            minMove: 0,              // Minium this piece has to move on its turn.
            maxMove: 1,              // Maximum this piece can move on its turn.
            move: [[0, d.forward]],  // Array representing how this piece moves.
            minTake: 0,              // Minium distance from enemy for this piece to take.
            maxTake: 1,              // Maximum distance from enemy for this piece to take.
            take: [[1, d.forward],   // Array representing how this piece takes.
                   [-1, d.forward]]
        };

        d.modifiers = {              // Modifiers on piece (see wiki descrition).
            enpassant: true,         // Can be taken and take en passant.
            opening:   true,         // Different start move.
            royal:    false,         // Loosing this piece is bad for you.
            leap:     false,         // Pieces on the board do not block this piece's movement.
            jump:         0,         // Value of 0 means no jump, other value is how many jumps.
            reflect:      0,         // Value of 0 means no reflect, other values is how many reflects.
            reverse:  false          // Directionally challenged pieces can go the other way with this.
        };

        d.upgrades = pieceData.upgrades; // Array of booleans representing selected upgrades.
        d.upgradeText = [                // Array of upgrade descriptions.
            "Remove en passant capture",
            "Remove opening move",
            "Add move diagonal forward",
            "Add take forward",
            "Remove move forward",
            "Remove take diagonal"
        ];

        this.setUpgrades();
        this.calculateValue();

        d.moveDiagram = 'pawn-std-move';
        d.pieceDataScreen = new PieceDataScreen(game, this);
    }

    /** Figure out this piece's upgrade value and sprites.
     * @returns {boolean} True if this piece is special.
     */
    setUpgrades() {
        let d = this.data;
        let s = this.sprites;
        let special = false;

        d.values.upgrade = 0;
        d.name = "Pawn";
        d.descritionText = {
            move: "Move: forward 1.\n",
            take: "Take: diagonal forward 1.\n",
            enpassant: "Can take and be taken en passant.",
            opening: "First move can move up to center line of board."
        };

        this.setAll('visible', false);
        s.b0.visible = true;

        // remove en passant capture
        if (d.upgrades[0]) {
            d.modifiers.enpassant = false;
            d.values.upgrade += 19;
            s.u0.visible = true;
            d.descritionText.enpassant = "";
        } else {
            d.enpassant = true;
            s.u0.visible = false;
            d.descritionText.enpassant = "Can take and be taken en passant.";
        }

        // remove opening move
        if (d.upgrades[1]) {
            d.modifiers.opening = false;
            d.values.upgrade -= 23;
            s.u1.visible = true;
            d.descritionText.opening = "";
        } else {
            d.modifiers.opening = true;
            s.u1.visible = false;
            d.descritionText.opening = "First move can move up to center line of board.";
        }

        // add move diagonal forward
        if (d.upgrades[2]) {
            d.movement.move = _.union(d.movement.move, [[1, d.forward], [-1, d.forward]]);
            d.values.upgrade += 75;
            s.u2.visible = true;
        } else {
            d.movement.move = _.filter(d.movement.move, function(obj){
                return !_.findWhere([[1, d.forward], [-1, d.forward]], obj);
            }, this);
            s.u2.visible = false;
        }

        // add take forward
        if (d.upgrades[3]) {
            d.movement.take = _.union(d.movement.take, [[0, d.forward]]);
            d.values.upgrade += 90;
            s.u3.visible = true;
        } else {
            d.movement.take = _.filter(d.movement.take, function(obj){
                return !_.findWhere([[0, d.forward]], obj);
            }, this);
            s.u3.visible = false;
        }

        // remove move forward
        if (d.upgrades[4]) {
            d.movement.move = _.filter(d.movement.move, function(obj){
                return !_.findWhere([[0, d.forward]], obj);
            }, this);
            d.values.upgrade -= 90;
            s.u4.visible = false;
        } else {
            d.movement.move = _.union(d.movement.move, [[0, d.forward]]);
            s.u4.visible = true;
        }

        // remove take diagonal forward
        if (d.upgrades[5]) {
            d.movement.take = _.filter(d.movement.take, function(obj){
                return !_.findWhere([[1, d.forward], [-1, d.forward]], obj);
            }, this);
            d.values.upgrade -= 75;
            s.u5.visible = true;
        } else {
            d.movement.take = _.union(d.movement.take, [[1, d.forward], [-1, d.forward]]);
            s.u5.visible = false;
        }

        d.movement.move = _.unique(d.movement.move, function(v) {return v.toString()});
        d.movement.take = _.unique(d.movement.take, function(v) {return v.toString()});

        // change piece name or sprite in specific conditions
        if ( d.upgrades[2] &&  d.upgrades[3] &&
            !d.upgrades[0] && !d.upgrades[1] && !d.upgrades[4] && !d.upgrades[5]) {
            d.name = "Sergeant";
            this.forEach(function(sprite) {
                sprite.visible = false;
            }, this);
            s.s2.visible = true;
            special = true;
        }

        if (d.upgrades[2] && d.upgrades[3] && d.upgrades[4] && d.upgrades[5] &&
            !d.upgrades[0] && !d.upgrades[1]) {
            d.name = "Berolina Pawn";
            this.forEach(function(sprite) {
                sprite.visible = false;
            }, this);
            s.s1.visible = true;
            special = true;
        }

        if ( d.upgrades[3] &&
            !d.upgrades[0] && !d.upgrades[1] && !d.upgrades[2] && !d.upgrades[4] && !d.upgrades[5]) {
            d.name = "Eurasian Pawn";
        }

        // figure out move text descrition
        if ( d.upgrades[2] && !d.upgrades[4]) {
            d.descritionText.move = "Move: forward and diagonal forward 1.\n";
        }

        if ( d.upgrades[4] && !d.upgrades[2]) {
            d.descritionText.move = "Move: cannot move.\n";
        }

        if ( d.upgrades[2] && d.upgrades[4]) {
            d.descritionText.move = "Move: diagonal forward 1.\n";
        }

        // figure out take text descrition
        if ( d.upgrades[3] && !d.upgrades[5]) {
            d.descritionText.take = "Take: forward and diagonal forward 1.\n";
        }

        if ( d.upgrades[5] && !d.upgrades[3]) {
            d.descritionText.take = "Take: cannot take.\n";
        }

        if ( d.upgrades[3] && d.upgrades[5]) {
            d.descritionText.take = "Take: diagonal forward 1.\n";
        }

        this.calculateValue();
        this.data.player.calculateTeamValue();

        return special;
    }

    /** Moves specific to the Pawn. */
    determineValidMoves() {
        let d = this.data;

        // Handle opening move if applicable.
        if (d.modifiers.opening && d.previousMoves.length === 1) {
            // Pawn can move a max of whereever it is, to the middle line.
            if (d.positions.sqIndices.y === 0 || d.positions.sqIndices.y === 7) {
                d.movement.maxMove = 3;
            } else if (d.positions.sqIndices.y === 1 || d.positions.sqIndices.y === 6) {
                d.movement.maxMove = 2;
            }
        } else {
            d.movement.maxMove = 1;
        }

        // A bown in ROW 8 with a negative forward direction changes to go the other way.
        if (d.positions.sqIndices.y === 0 && d.forward ==  -1) {
            // Change this piece's forward.
            d.forward = 1;

            // Loop through move array.
            for (var i = 0; i < d.movement.move.length; i++) {
                // Second element is forward/backward, leave first elements alone.
                d.movement.move[i][1] = 1;
            }

            // Same for take array.
            for (var i = 0; i < d.movement.take.length; i++) {
                // Second element is forward/backward, leave first elements alone.
                d.movement.take[i][1] = 1;
            }
        }
        // A bown in ROW 1 with a positive forward direction changes to go the other way.
        if (d.positions.sqIndices.y === 7 && d.forward == 1) {
            // Change this piece's forward.
            d.forward = -1;

            // Loop through move array.
            for (var i = 0; i < d.movement.move.length; i++) {
                // Second element is forward/backward, leave first elements alone.
                d.movement.move[i][1] = -1;
            }

            // Same for take array.
            for (var i = 0; i < d.movement.take.length; i++) {
                // Second element is forward/backward, leave first elements alone.
                d.movement.take[i][1] = -1;
            }
        }

        // Continue on with normal piece move determinations.
        super.determineValidMoves();
    }

}

/** Queen specific piece class.
 * @extends Piece
 */
class Queen extends Piece {

    /** Create a Queen.
     * @param {object} game      Reference to the Phaser game object.
     * @param {object} player    Reference to the player object.
     * @param {object} pieceData Information about this piece from local storage.
     */
    constructor(game, player, pieceData) {

        if (player.data.playerName === 'player1') {
            pieceData.spriteKeys = {
                b0: 'wQb0',
                u0: 'wQu0',
                u1: 'wQu1',
                u2: 'wQu2',
                u3: 'wQu3',
                u4: 'wQu4',
                u5: 'wQu5',
                s1: 'wQs1',
                s2: 'wQs2'
            };
        } else if (player.data.playerName === 'player2') {
            pieceData.spriteKeys = {
                b0: 'bQb0',
                u0: 'bQu0',
                u1: 'bQu1',
                u2: 'bQu2',
                u3: 'bQu3',
                u4: 'bQu4',
                u5: 'bQu5',
                s1: 'bQs1',
                s2: 'bQs2'
            };
        }

        super(game, player, pieceData);

        let d = this.data;                   // Piece data.
        let p = this.data.player.data;       // Player data.

        d.basePiece  = 'queen';              // Base piece name (never changes).

        d.values = {
            current:    0,            // Calculated total value of piece.
            base:    1019,            // All calculations start with this base value.
            upgrade:    0,            // Added or removed from base based on current upgrades.
            startCol:   0.0,          // Percent change (+ or -) for starting away from column B or G.
            startRow:   0.25          // Percent change (+ or -) for starting away from row 2 or 7.
        }

        d.movement = {
            minMove: 0,              // Minium this piece has to move on its turn.
            maxMove: 7,              // Maximum this piece can move on its turn.
            minTake: 0,              // Minium distance from enemy for this piece to take.
            maxTake: 7,              // Maximum distance from enemy for this piece to take.
            move: _.union(DIAGONAL, ORTHOGONAL), // Array representing how this piece moves.
            take: _.union(DIAGONAL, ORTHOGONAL) // Array representing how this piece takes.
        };

        d.modifiers = {              // Modifiers on piece (see wiki descrition).
            enpassant: false,        // Can be taken and take en passant.
            opening: false,          // Different start move.
            royal: false,            // Loosing this piece is bad for you.
            leap: false,             // Pieces on the board do not block this piece's movement.
            jump: 0,                 // Value of 0 means no jump, any other value is how many jumps.
            reflect: 0               // Value of 0 means no reflect, any other value is how many reflects.
        };

        d.upgrades = pieceData.upgrades; // Array of booleans representing selected upgrades.
        d.upgradeText = [                // Array of upgrade descriptions.
            "placeholder",
            "placeholder",
            "placeholder",
            "placeholder",
            "placeholder",
            "placeholder"
        ];

        this.setUpgrades();
        this.calculateValue();

        d.moveDiagram = 'pawn-std-move';
        d.pieceDataScreen = new PieceDataScreen(game, this);

    }

    /** Figure out this piece's upgrade value and sprites.
     * @returns {boolean} True if this piece is special.
     */
    setUpgrades() {
        this.data.upgradeValue = 0;
        this.sprites.b0.visible = true;
    }
}

/** Rook specific piece class.
 * @extends Piece
 */
class Rook extends Piece {

    /** Create a Rook.
     * @param {object} game      Reference to the Phaser game object.
     * @param {object} player    Reference to the player object.
     * @param {object} pieceData Information about this piece from local storage.
     */
    constructor(game, player, pieceData) {

        if (player.data.playerName === 'player1') {
            pieceData.spriteKeys = {
                b0: 'wRb0',
                u0: 'wRu0',
                u1: 'wRu1',
                u2: 'wRu2',
                u3: 'wRu3',
                u4: 'wRu4',
                u5: 'wRu5',
                s1: 'wRs1',
                s2: 'wRs2'
            };
        } else if (player.data.playerName === 'player2') {
            pieceData.spriteKeys = {
                b0: 'bRb0',
                u0: 'bRu0',
                u1: 'bRu1',
                u2: 'bRu2',
                u3: 'bRu3',
                u4: 'bRu4',
                u5: 'bRu5',
                s1: 'bRs1',
                s2: 'bRs2'
            };
        }

        super(game, player, pieceData);

        let d = this.data;                   // Piece data.
        let p = this.data.player.data;       // Player data.

        d.basePiece  = 'rook';               // Base piece name (never changes).

        d.values = {
            current:    0,            // Calculated total value of piece.
            base:     491,            // All calculations start with this base value.
            upgrade:    0,            // Added or removed from base based on current upgrades.
            startCol:   0.2,          // Percent change (+ or -) for starting away from column B or G.
            startRow:   0.1           // Percent change (+ or -) for starting away from row 2 or 7.
        }

        d.movement = {
            minMove: 0,              // Minium this piece has to move on its turn.
            maxMove: 7,              // Maximum this piece can move on its turn.
            minTake: 0,              // Minium distance from enemy for this piece to take.
            maxTake: 7,              // Maximum distance from enemy for this piece to take.
            move: ORTHOGONAL,        // Array representing how this piece moves.
            take: ORTHOGONAL         // Array representing how this piece takes.
        };

        d.modifiers = {              // Modifiers on piece (see wiki descrition).
            enpassant: false,        // Can be taken and take en passant.
            opening:   false,        // Different start move.
            royal:     false,        // Loosing this piece is bad for you.
            leap:      false,        // Pieces on the board do not block this piece's movement.
            jump:          0,        // Value of 0 means no jump, any other value is how many jumps.
            reflect:       0         // Value of 0 means no reflect, any other value is how many reflects.
        };

        d.upgrades = pieceData.upgrades; // Array of booleans representing selected upgrades.
        d.upgradeText = [                // Array of upgrade descriptions.
            "placeholder",
            "placeholder",
            "placeholder",
            "placeholder",
            "placeholder",
            "placeholder"
        ];

        this.setUpgrades();
        this.calculateValue();

        d.moveDiagram = 'pawn-std-move';
        d.pieceDataScreen = new PieceDataScreen(game, this);

    }

    /** Figure out this piece's upgrade value and sprites.
     * @returns {boolean} True if this piece is special.
     */
    setUpgrades() {
        this.data.upgradeValue = 0;
        this.sprites.b0.visible = true;
    }
}
