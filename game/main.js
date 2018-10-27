/**
 * @file Sets up constants used throughout the game. Contains states used by Phaser and starts game.
 * @author james
 */


/* CONSTANTS */

/** @constant {object} SMALL_SCREEN_SIZE Size of all the screens except Play screen. */
const SMALL_SCREEN_SIZE = {x: 680, y: 680};

/** @constant {object} PLAY_SCREEN_SIZE Size of Play screen. */
const PLAY_SCREEN_SIZE = {x: 1062, y: 950};

/** @constant {object} BOARD_ORIGIN Top left corner of the board within the board sprite. */
const BOARD_ORIGIN = {x: 20, y: 70};

/** @constant {array} COLUMNS An index of board column names. Only supports 8x8. */
const COLUMNS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/** @constant {array} ROWS An index of board row names. Only supports 8x8. */
const ROWS = ['8', '7', '6', '5', '4', '3', '2', '1'];

/** @constant {number} DARKSQUARECOLOR A hex number for the dark color squares of the board. */
const DARKSQUARECOLOR = 0xD18B47;

/** @constant {number} LIGHTSQUARECOLOR A hex number for the light color squares of the board. */
const LIGHTSQUARECOLOR = 0xFFCE9E;

/** @constant {number} MOVESHIGHLIGHTCOLOR A hex number for the color to highlight squares a piece can move to. */
const MOVESHIGHLIGHTCOLOR = 0x63CEC9;

/** @constant {number} TAKESHIGHLIGHTCOLOR A hex number for the color to highlight squares a piece can take an opponent piece on. */
const TAKESHIGHLIGHTCOLOR = 0xF40000;

/** @constant {array} DIAGONAL Array of array representing diagonal movement. */
const DIAGONAL  = [[ 1,  1], [ 1, -1], [-1,  1], [-1, -1]];

/** @constant {array} ORTHOGONAL Array of array representing orthogonal movement. */
const ORTHOGONAL= [[ 1,  0], [-1,  0], [ 0,  1], [ 0, -1]];

/** @constant {array} STDKNIGHT Array of array representing knight movement. */
const STDKNIGHT = [[ 2,  1], [ 2, -1], [-2,  1], [-2, -1], [ 1,  2], [ 1, -2], [-1,  2], [-1, -2]];


/* PHASER STATES */

/** Functions related to the wait state.
 * Something to look at while things load.
 * @type {object}
 */
var waitJoke = {

    /** Preload function for wait state. */
    preload: function() {
        this.game.load.image('loading', 'assets/ui/loading.png');
    },

    /** Create function for wait state. */
    create: function() {
        this.state.start('load');
    }
}


/** Functions related to the load state.
 *  Loads all assets, sets up objects used in other states.
 * @type {object}
 */
var loadState = {

    /** Initialize function for load state. */
    init: function() {
        this.stage.backgroundColor = "#FFFFFF";
        this.loading = this.add.sprite(340, 50, 'loading');
        this.loading.anchor.setTo(0.5, 0);
    },

    /** Preload function for load state. */
    preload: function() {
        let g = this.game;

        // Some kind of terrible writing.
        g.load.bitmapFont('scribble', 'assets/ui/scribble.png', 'assets/ui/scribble.xml');

        // title & backgrounds
        g.load.image('title',     'assets/ui/title.png');
        g.load.image('addPiece',  'assets/ui/addPieceBackground.png');
        g.load.image('dialogBox', 'assets/ui/dialogBox.png');

        // buttons
        g.load.spritesheet('btn-editTeam',     'assets/ui/titleEditTeamButtton.png',      125, 0);
        g.load.spritesheet('btn-toggleControl','assets/ui/titleToggleControlButtton.png', 125, 0);

        g.load.spritesheet('btn-resetDialog','assets/ui/editResetDialogButton.png', 125, 0);
        g.load.spritesheet('btn-addPiece', 'assets/ui/editAddPieceButtton.png', 125, 0);

        g.load.spritesheet('btn-deleteTeam','assets/ui/editDeleteTeamButtton.png', 259, 0);
        g.load.spritesheet('btn-resetTeam','assets/ui/editResetTeamButtton.png', 259, 0);
        g.load.spritesheet('btn-cancel','assets/ui/cancelButtton.png', 125, 0);




        //g.load.spritesheet('btn-cb',        'assets/ui/titleCustomizeBlackButtton.png', 259, 0);
        //g.load.spritesheet('btn-cw',        'assets/ui/titleCustomizeWhiteButton.png',  259, 0);
        g.load.spritesheet('btn-play',      'assets/ui/titlePlayButton.png',            259, 0);
        //g.load.spritesheet('btn-addPiece',  'assets/ui/customizeAddPieceButton.png',    129, 0);
        //g.load.spritesheet('btn-resetTeam', 'assets/ui/customizeResetPiecesButton.png', 129, 0);
        //g.load.spritesheet('btn-deleteAll', 'assets/ui/customizeDeleteAllButton.png', 129, 0);
        g.load.spritesheet('btn-done',      'assets/ui/customizeDoneButton.png',        259, 0);
        g.load.spritesheet('btn-upgrade',   'assets/ui/customizeUpgradePieceToggle.png', 20, 0);
        g.load.spritesheet('btn-addBishop', 'assets/ui/addBishopButton.png',            259, 0);
        g.load.spritesheet('btn-addKing',   'assets/ui/addKingButton.png',              259, 0);
        g.load.spritesheet('btn-addKnight', 'assets/ui/addKnightButton.png',            259, 0);
        g.load.spritesheet('btn-addPawn',   'assets/ui/addPawnButton.png',              259, 0);
        g.load.spritesheet('btn-addQueen',  'assets/ui/addQueenButton.png',             259, 0);
        g.load.spritesheet('btn-addRook',   'assets/ui/addRookButton.png',              259, 0);

        // "themeed" boards
        g.load.image('board',       'assets/board/board-play.png');
        g.load.image('board-black', 'assets/board/board-customize-black.png');
        g.load.image('board-white', 'assets/board/board-customize-white.png');

        // black bishop group
        g.load.image('bBb0', 'assets/pieces/black-bishop/base0.png');
        g.load.image('bBb1', 'assets/pieces/black-bishop/base1.png');
        g.load.image('bBb2', 'assets/pieces/black-bishop/base2.png');
        g.load.image('bBb3', 'assets/pieces/black-bishop/base3.png');
        g.load.image('bBb4', 'assets/pieces/black-bishop/base4.png');
        g.load.image('bBb5', 'assets/pieces/black-bishop/base5.png');
        g.load.image('bBu0', 'assets/pieces/black-bishop/upgrade0.png');
        g.load.image('bBu2', 'assets/pieces/black-bishop/upgrade2.png');
        g.load.image('bBu4', 'assets/pieces/black-bishop/upgrade4.png');
        g.load.image('bBu5', 'assets/pieces/black-bishop/upgrade5.png');
        g.load.image('bBs1', 'assets/pieces/black-bishop/special1.png');
        g.load.image('bBs2', 'assets/pieces/black-bishop/special2.png');

        // white bishop group
        g.load.image('wBb0', 'assets/pieces/white-bishop/base0.png');
        g.load.image('wBb1', 'assets/pieces/white-bishop/base1.png');
        g.load.image('wBb2', 'assets/pieces/white-bishop/base2.png');
        g.load.image('wBb3', 'assets/pieces/white-bishop/base3.png');
        g.load.image('wBb4', 'assets/pieces/white-bishop/base4.png');
        g.load.image('wBb5', 'assets/pieces/white-bishop/base5.png');
        g.load.image('wBu0', 'assets/pieces/white-bishop/upgrade0.png');
        g.load.image('wBu2', 'assets/pieces/white-bishop/upgrade2.png');
        g.load.image('wBu4', 'assets/pieces/white-bishop/upgrade4.png');
        g.load.image('wBu5', 'assets/pieces/white-bishop/upgrade5.png');
        g.load.image('wBs1', 'assets/pieces/white-bishop/special1.png');
        g.load.image('wBs2', 'assets/pieces/white-bishop/special2.png');

        // black king group
        g.load.image('bKb0', 'assets/pieces/black-king/base0.png');
        g.load.image('bKu0', 'assets/pieces/black-king/upgrade0.png');
        g.load.image('bKu1', 'assets/pieces/black-king/upgrade1.png');
        g.load.image('bKu2', 'assets/pieces/black-king/upgrade2.png');
        g.load.image('bKu3', 'assets/pieces/black-king/upgrade3.png');
        g.load.image('bKu4', 'assets/pieces/black-king/upgrade4.png');
        g.load.image('bKu5', 'assets/pieces/black-king/upgrade5.png');
        g.load.image('bKs1', 'assets/pieces/black-king/special1.png');
        g.load.image('bKs2', 'assets/pieces/black-king/special2.png');

        // white king group
        g.load.image('wKb0', 'assets/pieces/white-king/base0.png');
        g.load.image('wKu0', 'assets/pieces/white-king/upgrade0.png');
        g.load.image('wKu1', 'assets/pieces/white-king/upgrade1.png');
        g.load.image('wKu2', 'assets/pieces/white-king/upgrade2.png');
        g.load.image('wKu3', 'assets/pieces/white-king/upgrade3.png');
        g.load.image('wKu4', 'assets/pieces/white-king/upgrade4.png');
        g.load.image('wKu5', 'assets/pieces/white-king/upgrade5.png');
        g.load.image('wKs1', 'assets/pieces/white-king/special1.png');
        g.load.image('wKs2', 'assets/pieces/white-king/special2.png');

        // black knight group
        g.load.image('bNb0', 'assets/pieces/black-knight/base0.png');
        g.load.image('bNu0', 'assets/pieces/black-knight/upgrade0.png');
        g.load.image('bNu1', 'assets/pieces/black-knight/upgrade1.png');
        g.load.image('bNu2', 'assets/pieces/black-knight/upgrade2.png');
        g.load.image('bNu3', 'assets/pieces/black-knight/upgrade3.png');
        g.load.image('bNu4', 'assets/pieces/black-knight/upgrade4.png');
        g.load.image('bNu5', 'assets/pieces/black-knight/upgrade5.png');
        g.load.image('bNs1', 'assets/pieces/black-knight/special1.png');
        g.load.image('bNs2', 'assets/pieces/black-knight/special2.png');

        // white knight guoup
        g.load.image('wNb0', 'assets/pieces/white-knight/base0.png');
        g.load.image('wNu0', 'assets/pieces/white-knight/upgrade0.png');
        g.load.image('wNu1', 'assets/pieces/white-knight/upgrade1.png');
        g.load.image('wNu2', 'assets/pieces/white-knight/upgrade2.png');
        g.load.image('wNu3', 'assets/pieces/white-knight/upgrade3.png');
        g.load.image('wNu4', 'assets/pieces/white-knight/upgrade4.png');
        g.load.image('wNu5', 'assets/pieces/white-knight/upgrade5.png');
        g.load.image('wNs1', 'assets/pieces/white-knight/special1.png');
        g.load.image('wNs2', 'assets/pieces/white-knight/special2.png');

        // black pawn group
        g.load.image('bPb0', 'assets/pieces/black-pawn/base0.png');
        g.load.image('bPu0', 'assets/pieces/black-pawn/upgrade0.png');
        g.load.image('bPu1', 'assets/pieces/black-pawn/upgrade1.png');
        g.load.image('bPu2', 'assets/pieces/black-pawn/upgrade2.png');
        g.load.image('bPu3', 'assets/pieces/black-pawn/upgrade3.png');
        g.load.image('bPu4', 'assets/pieces/black-pawn/upgrade4.png');
        g.load.image('bPu5', 'assets/pieces/black-pawn/upgrade5.png');
        g.load.image('bPs1', 'assets/pieces/black-pawn/special1.png');
        g.load.image('bPs2', 'assets/pieces/black-pawn/special2.png');

        // white pawn group
        g.load.image('wPb0', 'assets/pieces/white-pawn/base0.png');
        g.load.image('wPu0', 'assets/pieces/white-pawn/upgrade0.png');
        g.load.image('wPu1', 'assets/pieces/white-pawn/upgrade1.png');
        g.load.image('wPu2', 'assets/pieces/white-pawn/upgrade2.png');
        g.load.image('wPu3', 'assets/pieces/white-pawn/upgrade3.png');
        g.load.image('wPu4', 'assets/pieces/white-pawn/upgrade4.png');
        g.load.image('wPu5', 'assets/pieces/white-pawn/upgrade5.png');
        g.load.image('wPs1', 'assets/pieces/white-pawn/special1.png');
        g.load.image('wPs2', 'assets/pieces/white-pawn/special2.png');

        // black queen group
        g.load.image('bQb0', 'assets/pieces/black-queen/base0.png');
        g.load.image('bQu0', 'assets/pieces/black-queen/upgrade0.png');
        g.load.image('bQu1', 'assets/pieces/black-queen/upgrade1.png');
        g.load.image('bQu2', 'assets/pieces/black-queen/upgrade2.png');
        g.load.image('bQu3', 'assets/pieces/black-queen/upgrade3.png');
        g.load.image('bQu4', 'assets/pieces/black-queen/upgrade4.png');
        g.load.image('bQu5', 'assets/pieces/black-queen/upgrade5.png');
        g.load.image('bQs1', 'assets/pieces/black-queen/special1.png');
        g.load.image('bQs2', 'assets/pieces/black-queen/special2.png');

        // white queen group
        g.load.image('wQb0', 'assets/pieces/white-queen/base0.png');
        g.load.image('wQu0', 'assets/pieces/white-queen/upgrade0.png');
        g.load.image('wQu1', 'assets/pieces/white-queen/upgrade1.png');
        g.load.image('wQu2', 'assets/pieces/white-queen/upgrade2.png');
        g.load.image('wQu3', 'assets/pieces/white-queen/upgrade3.png');
        g.load.image('wQu4', 'assets/pieces/white-queen/upgrade4.png');
        g.load.image('wQu5', 'assets/pieces/white-queen/upgrade5.png');
        g.load.image('wQs1', 'assets/pieces/white-queen/special1.png');
        g.load.image('wQs2', 'assets/pieces/white-queen/special2.png');

        // black rook group
        g.load.image('bRb0', 'assets/pieces/black-rook/base0.png');
        g.load.image('bRu0', 'assets/pieces/black-rook/upgrade0.png');
        g.load.image('bRu1', 'assets/pieces/black-rook/upgrade1.png');
        g.load.image('bRu2', 'assets/pieces/black-rook/upgrade2.png');
        g.load.image('bRu3', 'assets/pieces/black-rook/upgrade3.png');
        g.load.image('bRu4', 'assets/pieces/black-rook/upgrade4.png');
        g.load.image('bRu5', 'assets/pieces/black-rook/upgrade5.png');
        g.load.image('bRs1', 'assets/pieces/black-rook/special1.png');
        g.load.image('bRs2', 'assets/pieces/black-rook/special2.png');

        // white rook group
        g.load.image('wRb0', 'assets/pieces/white-rook/base0.png');
        g.load.image('wRu0', 'assets/pieces/white-rook/upgrade0.png');
        g.load.image('wRu1', 'assets/pieces/white-rook/upgrade1.png');
        g.load.image('wRu2', 'assets/pieces/white-rook/upgrade2.png');
        g.load.image('wRu3', 'assets/pieces/white-rook/upgrade3.png');
        g.load.image('wRu4', 'assets/pieces/white-rook/upgrade4.png');
        g.load.image('wRu5', 'assets/pieces/white-rook/upgrade5.png');
        g.load.image('wRs1', 'assets/pieces/white-rook/special1.png');
        g.load.image('wRs2', 'assets/pieces/white-rook/special2.png');

        // movement description images
        g.load.image('bishop-std-move', 'assets/movement/bishop-std.png');
        g.load.image('pawn-std-move',   'assets/movement/pawn-std.png');

        // sounds
        g.load.audio('capture', 'assets/noises/capture.wav');
        g.load.audio('dedlde',  'assets/noises/dedlde.wav');
        g.load.audio('drop',    'assets/noises/drop.wav');
        g.load.audio('invalid', 'assets/noises/invalid.wav');
        g.load.audio('pickup',  'assets/noises/pickup.wav');
        g.load.audio('pop',     'assets/noises/pop.wav');
        g.load.audio('reset',   'assets/noises/reset.wav');
        g.load.audio('slide',   'assets/noises/slide.wav');
        g.load.audio('special', 'assets/noises/special.wav');
        g.load.audio('unpop',   'assets/noises/unpop.wav');

        g.load.audio('customize-loop', 'assets/noises/plucky-contemplation-music.ogg');
    },

    /** Create function for load state. */
    create: function() {
        let g = this.game;

        // create board
        g.board = new Board(game);
        g.board.visible = false;

        // create a couple of players
        g.player1 = new Player(game, 'w');
        g.player2 = new Player(game, 'b');

        // noises accessable everywhere (they're not really good enough to be called sounds)
        g.noises = {};
        g.noises.capture = game.add.audio('capture');
        g.noises.dedlde  = game.add.audio('dedlde');
        g.noises.drop    = game.add.audio('drop');
        g.noises.invalid = game.add.audio('invalid');
        g.noises.pickup  = game.add.audio('pickup');
        g.noises.pop     = game.add.audio('pop');
        g.noises.reset   = game.add.audio('reset');
        g.noises.slide   = game.add.audio('slide');
        g.noises.special = game.add.audio('special');
        g.noises.unpop   = game.add.audio('unpop');

        g.noises.customize = game.add.audio('customize-loop');

        this.loading.destroy();

        // move along
        g.state.start('title', false, false);
    }
}


/** Functions related to the title state.
* @type {object}
*/
var titleState = {

    /** Create function for title state. */
    create: function() {
        let style = { font: "18px Arial", fill: "#222222",};

        // Where things are on the screen.
        let teamNameRow = 230
        let valueRow    = 370;
        let buttonRow   = 400;
        let sideWidth = SMALL_SCREEN_SIZE.x / 2;         // 320
        let blackSideCenter = sideWidth / 2;             // 160
        let whiteSideCenter = sideWidth / 2 + sideWidth; // 480

        // background
        this.stage.backgroundColor = "#ffffff";

        // Top
        let titleX = SMALL_SCREEN_SIZE.x / 2;
        let titleY = 50;
        this.title = game.add.sprite(titleX, titleY, 'title');
        this.title.anchor.setTo(0.5, 0);

        // Black side - player 2
        this.blackTeamTitle = game.add.text(blackSideCenter, teamNameRow, 'Black', style);
        this.blackTeamTitle.anchor.setTo(0.5, 0);

        this.blackTeamValueText = game.add.text(blackSideCenter + 10, valueRow, 'Value:', style);
        this.blackTeamValue = game.add.bitmapText(blackSideCenter + 60, valueRow, 'scribble', game.player2.data.teamValue);

        this.game.player2.placeTeamInTitle();

        this.btnEditBlack = game.add.button(blackSideCenter, buttonRow, 'btn-editTeam', this.startCustom, this, 1, 0, 2);
        this.btnEditBlack.anchor.setTo(1.0, 0.0);
        this.btnEditBlack.player = 'player2';

        this.blackControl = game.add.button(blackSideCenter, buttonRow, 'btn-toggleControl', this.toggleControl, this);
        this.blackControl.anchor.setTo(0.0, 0.0);
        this.blackControl.player = 'player2';

        if (this.game.player2.data.ai) {
            this.blackControl.frame = 1;
        }

        // White side - player 1
        this.whiteTeamTitle = game.add.text(whiteSideCenter, teamNameRow, 'White', style);
        this.whiteTeamTitle.anchor.setTo(0.5, 0);

        this.whiteTeamValueText = game.add.text(whiteSideCenter + 10, valueRow, 'Value:', style);
        this.whiteTeamValue = game.add.bitmapText(whiteSideCenter + 60, valueRow, 'scribble', game.player1.data.teamValue);

        this.game.player1.placeTeamInTitle();

        this.btnEditeWhite = game.add.button(whiteSideCenter, buttonRow, 'btn-editTeam', this.startCustom, this, 1, 0, 2);
        this.btnEditeWhite.anchor.setTo(1.0, 0.0);
        this.btnEditeWhite.player = 'player1';

        this.whiteControl = game.add.button(whiteSideCenter, buttonRow, 'btn-toggleControl', this.toggleControl, this);
        this.whiteControl.anchor.setTo(0.0, 0.0);
        this.whiteControl.player = 'player1';


        if (this.game.player1.data.ai) {
            this.whiteControl.frame = 1;
        }

        // Bottom
        this.btnPlay = game.add.button(411, 588, 'btn-play', this.startPlay,   this, 1, 0, 2);

        this.game.noises.dedlde.play();
    },

    /** Shutdown function for title state. */
    shutdown: function() {
        this.title.destroy();

        this.blackTeamTitle.destroy();
        this.blackTeamValueText.destroy();
        this.blackTeamValue.destroy();
        this.btnEditBlack.destroy();
        this.blackControl.destroy();

        this.whiteTeamTitle.destroy();
        this.whiteTeamValueText.destroy();
        this.whiteTeamValue.destroy();
        this.btnEditeWhite.destroy();
        this.whiteControl.destroy();

        this.btnPlay.destroy();
    },

    startPlay() {
        this.game.noises.slide.play();
        game.state.start('play', false, false);
    },

    /** Go to customize screen for team, based on button pressed. */
    startCustom(button) {
        this.game.noises.slide.play();
        let team = 'black';
        if (button.player == 'player1') {
            team = 'white';
        }
        game.state.start('customize', false, false, team)
    },

    /** Toggle control for team between human and bad AI, based on button pressed. */
    toggleControl(button) {
        if (button.player === 'player1') {
            if (this.game.player1.data.ai) {
                this.game.player1.data.ai = false;
                button.frame = 0;
            } else {
                this.game.player1.data.ai = true;
                button.frame = 1;
            }
        }
        if (button.player === 'player2') {
            if (this.game.player2.data.ai) {
                this.game.player2.data.ai = false;
                button.frame = 0;
            } else {
                this.game.player2.data.ai = true;
                button.frame = 1;
            }
        }
    }
};


/** Functions related to the customize state.
* @type {object}
*/
var customizeState = {

    /** Initialize function for customize state. */
    init: function(team) {
        if (team == 'black') {
            this.currentPlayer = game.player2;
            this.otherPlayer   = game.player1;
        } else {
            this.currentPlayer = game.player1;
            this.otherPlayer   = game.player2;
        }
        this.game.board.showThemedCustomizeBoard(this.currentPlayer.data.playerName);
        this.currentPlayer.placeTeamInCustomize();
        this.otherPlayer.placeTeamOffScreen();
    },

    /** Create function for customize state. */
    create: function() {
        let style = { font: "18px Arial", fill: "#222222",};

        this.teamValueText = game.add.text(511, 270, 'Team Value: ', style);

        this.btnResetDialog = game.add.button(20, 620, 'btn-resetDialog', this.resetDialog, this, 1, 0, 2);

        this.btnAddPiece  = game.add.button(150, 620, 'btn-addPiece',  this.addDialog,    this, 1, 0, 2);

        this.btnDone      = game.add.button(411, 588, 'btn-done',      this.returnTitle, this, 1, 0, 2);

        this.addPieceDialog  = new PieceAddScreen(this.game, this.currentPlayer);
        this.resetTeamDialog = new ResetTeamDialog(this.game, this.currentPlayer);

        // some kind of music
        this.backgroundMusicCounter = 0;
        this.backgroundMusicTimer = this.game.time.create(false);
        this.backgroundMusicTimer.loop(10000, this.doMusicStuff, this);
        this.backgroundMusicTimer.start();
    },

    /** Update function for customize state. */
    update: function() {
        this.teamValueText.setText('Team Value: ' + this.currentPlayer.data.teamValue);
    },

    /** Shutdown function for customize state. */
    shutdown: function() {
        this.teamValueText.destroy();
        this.btnResetDialog.destroy();
        this.btnAddPiece.destroy();
        this.btnDone.destroy();
        this.addPieceDialog.destroy();
        this.resetTeamDialog.destroy();

        this.game.board.resetVisibleSquares();
        this.game.board.visible = false;
        this.backgroundMusicTimer.stop();
        this.game.noises.customize.stop();
    },

    doMusicStuff() {
        this.backgroundMusicCounter++;
        if (this.backgroundMusicCounter === 1) {
            this.game.noises.customize.loopFull(0.5);
        }

        // If you've had to listen to this "composition" for a long time you get a break.
        if (this.backgroundMusicCounter === 100) {
            this.game.noises.customize.stop();
            this.backgroundMusicCounter = 0;
        }
    },

    /** Show dialog with add piece options. */
    addDialog: function() {
        this.addPieceScreen.show();
    },

    /** Show dialog with reset options. */
    resetDialog: function() {
        this.resetTeamDialog.show();
    },

    returnTitle: function() {
        this.currentPlayer.callAll('unhighlight');
        this.currentPlayer.savePieces();
        this.currentPlayer.saveToLocalStorage();
        this.game.state.start('title', false, false);
    }
};


/** Functions related to the play state.
 * @type {object}
 */
var playState = {

    /** Create function for play state. */
    create: function() {
        let style = { font: "18px Arial", fill: "#222222",};

        let playScreenCenter = PLAY_SCREEN_SIZE.x / 2;

        this.currentPlayerText = game.add.text(playScreenCenter, 20, 'White\'s Move', style);
        this.currentPlayerText.anchor.setTo(0.5, 0.0);

        this.game.board.showThemedBoard();
        this.game.player1.placeTeamOnBoard();
        this.game.player2.placeTeamOnBoard();

        this.game.time.events.add(Phaser.Timer.SECOND, this.firstMove, this);

        this.escInput = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        this.escInput.onDown.add(function() {
            this.game.board.themedBoard.visible = false;
            this.game.state.start('title', false, false);
        }, this);
    },

    /** Shutdown function for play state. */
    shutdown: function() {
        this.escInput.destroy();
    },

    /** Do not allow piece movement until piece's have moved to the board. */
    firstMove: function() {
        this.game.player1.beginTurn();
    }
};


// Create the game.
var game = new Phaser.Game(1062, 950, Phaser.AUTO);

// Add some states to it.
game.state.add('wait',      waitJoke);
game.state.add('load',      loadState);
game.state.add('title',     titleState);
game.state.add('customize', customizeState);
game.state.add('play',      playState);

// Start the game.
game.state.start('wait');
