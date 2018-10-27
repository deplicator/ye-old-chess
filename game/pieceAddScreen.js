/**
 * @file The class that adds a new piece in the customize screen.
 * @author james
 */

/**
  * PieceAddScreen class is the popup dialog box when clicking the New Piece
  * button in the customize screen.
  * @extends Phaser.Group
  */
class PieceAddScreen extends Phaser.Group {

    /** Builds then dialog box but keeps it hidden until the New Piece button is clicked.
     * @param {object} game   Reference to the Phaser game object.
     * @param {object} player Reference to player that opented this dialog box.
     */
    constructor(game, player) {
        super(game, game.world);

        // Player that created this.
        this.player = player;

        // The dialog box background.
        this.background = this.game.add.sprite(0, 0, 'addPiece');

        // A button for each base piece.
        this.addPawn = this.game.add.button(210, 80, 'btn-addPawn', this.addPiece, this, 1, 0, 2);
        this.addPawn.basePiece = 'pawn';

        this.addKnight = this.game.add.button(210, 165, 'btn-addKnight', this.addPiece, this, 1, 0, 2);
        this.addKnight.basePiece = 'knight';

        this.addBishop = this.game.add.button(210, 250, 'btn-addBishop', this.addPiece, this, 1, 0, 2);
        this.addBishop.basePiece = 'bishop';

        this.addRook = this.game.add.button(210, 335, 'btn-addRook', this.addPiece, this, 1, 0, 2);
        this.addRook.basePiece = 'rook';

        this.addQueen = this.game.add.button(210, 420, 'btn-addQueen', this.addPiece, this, 1, 0, 2);
        this.addQueen.basePiece = 'queen';

        this.addKing = this.game.add.button(210, 505, 'btn-addKing', this.addPiece, this, 1, 0, 2);
        this.addKing.basePiece = 'king';

        // Add elements as children.
        this.add(this.background);
        this.add(this.addPawn);
        this.add(this.addKnight);
        this.add(this.addBishop);
        this.add(this.addRook);
        this.add(this.addQueen);
        this.add(this.addKing);

        // Only show when New Piece button is clicked.
        this.hide();
    }

    /** Show this dialog box. */
    show() {
        this.setAll('visible', true);
    }

    /** Hide this dialog box. */
    hide() {
        this.setAll('visible', false);
    }

    /** Calls this player's add piece method, then hides this dialog box.
     * @param {object} button The button that called this method is used to
     *                        differentiate base piece being added to the team.
     */
    addPiece(button) {
        this.player.addPieceToTeam(button.basePiece);
        this.player.calculateTeamValue();
        this.hide();
    }
}
