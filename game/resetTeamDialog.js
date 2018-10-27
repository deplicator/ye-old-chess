/**
 * @file The dialog box with reset team options; delete all pieces, reset to
 *       standard, or cancel.
 * @author james
 */

/**
  * ResetTeamDialog class handles the popup dialog box when clicking the Reset
  * button in the customize screen.
  * @extends Phaser.Group
  */
class ResetTeamDialog extends Phaser.Group {

    /** Builds then dialog box but keeps it hidden until the Reset button is clicked.
     * @param {object} game   Reference to the Phaser game object.
     * @param {object} player Reference to player that opented this dialog box.
     */
    constructor(game, player) {
        super(game, game.world);

        // Player that created this.
        this.player = player;

        // The dialog box background.
        this.background = this.game.add.sprite(0, 0, 'dialogBox');

        // A button for each option.
        this.deleteTeam = this.game.add.button(210, 200, 'btn-deleteTeam', this.delete, this, 1, 0, 2);
        this.resetTeam  = this.game.add.button(210, 300, 'btn-resetTeam', this.reset, this, 1, 0, 2);
        this.cancel     = this.game.add.button(450, 425, 'btn-cancel', this.hide, this, 1, 0, 2);

        // Add elements as children.
        this.add(this.background);
        this.add(this.deleteTeam);
        this.add(this.resetTeam);
        this.add(this.cancel);

        // Only show when New Piece button is clicked.
        this.hide();
    }

    /** Show this dialog box. */
    show() {
        this.deleteTeam.frame = 0;
        this.resetTeam.frame  = 0;
        this.cancel.frame     = 0;
        this.setAll('visible', true);
    }

    /** Hide this dialog box. */
    hide() {
        this.setAll('visible', false);
    }

    /** Delete all pieces then add a standard chess set. */
    reset() {
        this.game.noises.reset.play();
        this.player.clearTeam();
        this.player.addStandardPieces();
        this.player.copyPieceData();
        this.player.saveToLocalStorage();
        this.player.calculateTeamValue();
        this.player.placeTeamInCustomize();

        this.hide();
    }

    /**   */
    delete() {
        this.player.clearTeam();
        this.game.time.events.add(Phaser.Timer.SECOND, function() {
            this.player.copyPieceData();
            this.player.saveToLocalStorage();
            this.player.calculateTeamValue();
        }, this);

        this.hide();
    }
}
