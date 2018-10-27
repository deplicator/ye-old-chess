/**
 * @file The player class.
 * @author james
 */

/**
  * Player class does player stuff.
  * @extends Phaser.Group
  */
class Player extends Phaser.Group {

    /**
      * Player class does player stuff.
      * @param {object} game Reference to the Phaser game object.
      * @param {char}  color W or B for which color this player is.
      */
    constructor(game, color) {
        super(game, game.world);

        this.data = {};
        this.data.ai = false;

        this.data.version = 1;   // Local storage version, might be useful someday.
        this.data.color = color; // This player's color.
        this.data.turn = false;  // Is it this player's turn?
        this.data.teamValue = 0; // Sum of each piece value this player has.
        this.data.team = [];     // Player's piece info saved in local storage.
        this.data.history = [];  // An array of all this players moves.

        if (this.data.color == 'b') {
            this.data.playerName = 'player2';
            this.data.colorName  = 'Black';
            this.data.forward    = 1;       // Forward direction for player, positive is down.
            this.data.startRow   = 8;
            this.data.pawnRow    = 7;
            this.data.frontRow   = 6;
            this.data.opponent   = 'player1';
        } else {
            this.data.playerName = 'player1';
            this.data.colorName  = 'White';
            this.data.forward    = -1;      // Negative is up.
            this.data.startRow   = 1;
            this.data.pawnRow    = 2;
            this.data.frontRow   = 3;
            this.data.opponent   = 'player2';
        }

        // Check local storage for previous player data.
        let savedPlayerData = JSON.parse(localStorage.getItem(this.data.playerName));

        // Load previous team data for player if found.
        if (savedPlayerData !== null && savedPlayerData.team.length > 0) {
            this.data.team = _.clone(savedPlayerData.team);

        // Load default team if not.
        } else {
            this.addStandardPieces();
        }

        this.copyPieceData();
        this.calculateTeamValue();
        this.saveToLocalStorage();
    }

    /** Updates team from children, then saves to local storage. */
    saveToLocalStorage() {
        this.data.team = [];
        this.forEach(function(child) {
            let pieceData = {
                basePiece: child.data.basePiece,
                id: child.data.id,
                name: child.data.name,
                coordinate: child.data.coordinate,
                upgrades: child.data.upgrades
            };
            this.data.team.push(pieceData);
        }, this);

        localStorage.setItem(this.data.playerName, JSON.stringify(this.data));
    }

    // Create a standard team.
    addStandardPieces() {
        this.data.team = [];

        for (var i = 0; i < 8; i++) {
            let pawnData = {
                basePiece: 'pawn',
                id: 'pawn_' + (i + 1),
                name: 'Pawn',
                coordinate: COLUMNS[i] + this.data.pawnRow,
                upgrades: [false,false,false,false,false,false]
            };
            this.data.team.push(pawnData);
        }

        let rookData = {
            basePiece: 'rook',
            id: 'rook_1',
            name: 'Rook',
            coordinate: 'a' + this.data.startRow,
            upgrades: [false,false,false,false,false,false]
        };
        this.data.team.push(rookData);

        rookData = {
            basePiece: 'rook',
            id: 'rook_2',
            name: 'Rook',
            coordinate: 'h' + this.data.startRow,
            upgrades: [false,false,false,false,false,false]
        };
        this.data.team.push(rookData);

        let knightData = {
            basePiece: 'knight',
            id: 'knight_1',
            name: 'Knight',
            coordinate: 'b' + this.data.startRow,
            upgrades: [false,false,false,false,false,false]
        };
        this.data.team.push(knightData);

        knightData = {
            basePiece: 'knight',
            id: 'knight_2',
            name: 'Knight',
            coordinate: 'g' + this.data.startRow,
            upgrades: [false,false,false,false,false,false]
        };
        this.data.team.push(knightData);

        let bishopData = {
            basePiece: 'bishop',
            id: 'bishop_1',
            name: 'Bishop',
            coordinate: 'c' + this.data.startRow,
            upgrades: [false,false,false,false,false,false]
        };
        this.data.team.push(bishopData);

        bishopData = {
            basePiece: 'bishop',
            id: 'bishop_2',
            name: 'Bishop',
            coordinate: 'f' + this.data.startRow,
            upgrades: [false,false,false,false,false,false]
        };
        this.data.team.push(bishopData);

        let queenData = {
            basePiece: 'queen',
            id: 'queen_1',
            name: 'Queen',
            coordinate: 'd' + this.data.startRow,
            upgrades: [false,false,false,false,false,false]
        };
        this.data.team.push(queenData);

        let kingData = {
            basePiece: 'king',
            id: 'king_1',
            name: 'King',
            coordinate: 'e' + this.data.startRow,
            upgrades: [false,false,false,false,false,false]
        };
        this.data.team.push(kingData);
    }

    /** Add a new piece to this player's team.
     *  @param {string} [basePiece] - String representing one of the valid base pieces available.
     */
    addPieceToTeam(basePiece) {
        let coordinate = this.nextAvailableStartCoordinate();
        let numBasePieces= this.countBasePieces(basePiece);
        let pieceName = basePiece.charAt(0).toUpperCase() + basePiece.slice(1);

        if (coordinate === '') {
            console.log('Team full');
            return;
        }

        let piece = {
            basePiece: basePiece,
            id: basePiece + '_' + numBasePieces,
            name: pieceName,
            coordinate: coordinate,
            upgrades: [false,false,false,false,false,false]
        };

        switch (basePiece) {
            case 'bishop':
                this.data.team.push(piece);
                this.add(new Bishop(game, this, this.data.team[this.data.team.length - 1]));
                break;

            case 'king':
                this.data.team.push(piece);
                this.add(new King(game, this, this.data.team[this.data.team.length - 1]));
                break;

            case 'knight':
                this.data.team.push(piece);
                this.add(new Knight(game, this, this.data.team[this.data.team.length - 1]));
                break;

            case 'pawn':
                this.data.team.push(piece);
                this.add(new Pawn(game, this, this.data.team[this.data.team.length - 1]));
                break;

            case 'queen':
                this.data.team.push(piece);
                this.add(new Queen(game, this, this.data.team[this.data.team.length - 1]));
                break;

            case 'rook':
                this.data.team.push(piece);
                this.add(new Rook(game, this, this.data.team[this.data.team.length - 1]));
                break;

            default:
                console.log('base piece not implemented');
                break;
        }

        this.placeTeamInCustomize();
    }

    // Create children for this group from player data.team.
    copyPieceData() {
        for(var i = 0; i < this.data.team.length; i++) {
            switch (this.data.team[i].basePiece) {
                case 'bishop':
                    this.add(new Bishop(game, this, this.data.team[i]));
                    break;

                case 'king':
                    this.add(new King(game, this, this.data.team[i]));
                    break;

                case 'knight':
                    this.add(new Knight(game, this, this.data.team[i]));
                    break;

                case 'pawn':
                    this.add(new Pawn(game, this, this.data.team[i]));
                    break;

                case 'queen':
                    this.add(new Queen(game, this, this.data.team[i]));
                    break;

                case 'rook':
                    this.add(new Rook(game, this, this.data.team[i]));
                    break;

                default:
                    console.log('base piece not implemented');
                    break;
            }
        }
    }

    // Move player's pieces off screen.
    placeTeamOffScreen() {
        this.callAll('movePieceOffScreen');
    }

    // Move player's pieces to title screen location.
    placeTeamInTitle() {
        this.callAll('movePieceToTitle');
    }

    // Move player's pieces to customize screen location.
    placeTeamInCustomize() {
        this.callAll('movePieceToCustomize');
    }

    // Setup player's pieces for play.
    placeTeamOnBoard() {
        this.callAll('movePieceToPlay');
    }

    // Update player's team value.
    calculateTeamValue() {
        this.data.teamValue = 0;
        this.callAll('calculateValue');
        this.forEach(function(piece) {
            this.data.teamValue += piece.data.values.current;
        }, this);
    }

    // does someting
    savePieces() {
        this.callAll('setUpgrades');
    }

    // Remove all piece's from this players team.
    clearTeam() {
        this.callAll('deletePiece');
    }

    /** Begin turn for this player. */
    beginTurn() {

        console.log(this.data.playerName, " begin turn");

        // Set this player's turn flag.
        this.data.turn = true;

        this.game.state.states['play'].currentPlayerText.setText(this.data.colorName + "'s Move")
        //document.getElementById('turn').innerHTML = this.data.colorName + "'s Move";

        // Add's this player's pieces input.
        this.callAll('playEvents');

        // Make this player move if this player is set to computer control.
        if (this.data.ai) {
            this.game.time.events.add(Phaser.Timer.HALF, this.aiMove, this);
        }
    }

    /** End turn for this player, calls next player's beginTurn. */
    endTurn() {

        console.log(this.data.playerName, " end turn");

        this.data.turn = false;

        // Remove's this player's pieces input.
        this.callAll('resetEvents');

        // Determine who is next.
        if (this.data.playerName === 'player1') {
            this.game.player2.beginTurn();
        } else {
            this.game.player1.beginTurn();
        }
    }

    // Updates array of all this players moves.
    updateHistory(piece, coordinate) {
        this.data.history.push([piece, coordinate]);
    }

    // Returns piece in data.team.
    findPiecesById(PieceId) {
        for (var i = 0; i < this.data.team.length; i++) {
            if (this.data.team[i].id === PieceId) {
                return this.data.team[i];
            }
        }
    }

    /** Returns this player's next available start coordinate.
     * @return {string} The next coordinate, or empty if the player's start rows are full.
     */
    nextAvailableStartCoordinate() {
        let coordinate = '';

        // A list of this player's available start squares.
        let playerStartSquares = [];
        if (this.data.playerName === 'player1') {
            for (var i = 0; i < 8; i++) {
                for (var j = 5; j < 8; j++) {
                    playerStartSquares.push(COLUMNS[i] + ROWS[j]);
                }
            }
        } else if (this.data.playerName === 'player2') {
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 3; j++) {
                    playerStartSquares.push(COLUMNS[i] + ROWS[j]);
                }
            }
        }

        // A list of this player's current start squares.
        let currentStartSquares = [];
        for (var i = 0; i < this.data.team.length; i++) {
            currentStartSquares.push(this.data.team[i].coordinate);
        }

        // Which squares are left?
        let availableStartSquares = _.difference(playerStartSquares, currentStartSquares);

        if (availableStartSquares.length !== 0) {
            coordinate = availableStartSquares[0];
        }

        return coordinate;
    }

    /** Returns the number of give base pieces this player has on their team.
    *  @param  {string} [basePiece] String representing one of the valid base pieces available.
     * @return {number} How many of the given base piece this player has on their team.
     */
    countBasePieces(basePiece) {
        let count = 0;

        for (var i = 0; i < this.data.team.length; i++) {
            if (this.data.team[i].basePiece === basePiece) {
                count++;
            }
        }

        return count;
    }

    // it does a thing
    clearEnpassants() {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].data.enpassant) {
                for (var j = 0; j < this.children[i].data.enpassantSqs.length; j++) {
                    game.board.unsetEnpassant(this.children[i].data.enpassantSqs[j]);
                }
                this.children[i].data.enpassantSqs = [];
                this.children[i].clearEnpassant();
            }
        }
    }

    /** Makes a move. */
    aiMove() {

        console.log(this.data.playerName, "call ai move");

        let piecesWithMoves = [];
        let piecesWithTakes = [];
        let randomPiece;
        let validMoves = [];
        let validTakes = [];

        this.forEach(function(piece) {
            piece.determineValidMoves();
            piece.determineValidTakes();
            validMoves = piece.data.validMoves;
            validTakes = piece.data.validTakes;

            if (validTakes.length != 0) {
                piecesWithTakes.push(piece);
            }

            if (validMoves.length != 0) {
                piecesWithMoves.push(piece);
            }

            piece.data.validTakes = [];
            piece.data.validMoves = [];

        }, this);

        if (piecesWithTakes.length != 0) {
            randomPiece = _.sample(piecesWithTakes);
            randomPiece.determineValidTakes();
            randomPiece.move(_.sample(randomPiece.data.validTakes));
        } else if (piecesWithMoves.length != 0) {
            randomPiece = _.sample(piecesWithMoves);
            randomPiece.determineValidMoves();
            randomPiece.move(_.sample(randomPiece.data.validMoves));
        }
    }

    /** Changes this player to be controlled by mouse and keyboard input. */
    setHumanControl() {
        this.data.ai = false;
    }

    /** Changes this player to use the dumbest AI ever. */
    setComputerContro() {
        this.data.ai = true;
    }
}
