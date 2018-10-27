/**
 * @file The class that shows piece in the customize screen.
 * @author james
 */

/**
 * PieceDataScreen class shows data about the piece clicked on in the customize screen.
 * @extends Phaser.Group
 */
class PieceDataScreen extends Phaser.Group {
    constructor(game, piece) {
        super(game, game.world); // Making the piece the parent breaks it for some reason.

        this.data = piece.data;
        this.data.piece = piece;

        this.updateData();

        this.hide();
    }

    /** Update details on piece data screen. */
    updateData() {
        this.removeAll();

        let style = { font: "18px Arial", fill: "#222222", align: 'left', wordWrap: true, wordWrapWidth: 300};

        // Loop through upgrades for this piece and make buttons.
        for (var i = 0; i < 6; i++) {
            let frame = 0;
            if (this.data.upgrades[i]) { frame = 1; }
            this.upgradeButton = this.game.add.button(330, (30 * i) + 10, 'btn-upgrade', this.setUpgrades, this);
            this.upgradeButton.data.id = i;
            this.upgradeButton.frame = frame;
            this.add(this.upgradeButton);
            this.add(new Phaser.Text(game, 360, (30 * i) + 10, this.data.upgradeText[i], style));
        }

        this.add(new Phaser.Text(game, 30, 30, 'Name: ' + this.data.name, style));
        this.add(new Phaser.Text(game, 30, 50, 'Value: ' + this.data.values.current, style));
        this.add(new Phaser.Text(game, 30, 70, 'Start: ' + this.data.coordinate, style));

        let nextLine = 90;
        let fullDescription = '';
        _.each(this.data.descritionText, function(description, key, list) {
            fullDescription += description;
        }, this);
        this.add(new Phaser.Text(game, 30, 90, fullDescription, style));

        //this.removeButton = this.game.add.button(30, 150, 'btn-upgrade', this.removePiece, this);
        //this.add(this.removeButton);
        //this.add(new Phaser.Text(game, 60, 150, 'Delete', style));

        //this.create(150, 30, this.data.moveDiagram);
    }

    show() {
        this.setAll('visible', true);
    }

    hide() {
        this.setAll('visible', false);
    }

    setUpgrades(button) {
        if (button.frame == 0) {
            button.frame = 1;
            this.data.upgrades[button.data.id] = true
            if (this.data.piece.setUpgrades()) {
                this.game.noises.special.play();
            } else {
                this.game.noises.pop.play();
            }
        } else {
            button.frame = 2;
            this.data.upgrades[button.data.id] = false
            if (this.data.piece.setUpgrades()) {
                this.game.noises.special.play();
            } else {
                this.game.noises.unpop.play();
            }
        }

        this.data.piece.calculateValue();
        this.updateData();
    }

    removePiece() {
        this.data.piece.deletePiece(true);
    }
}
