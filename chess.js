var version = '0.0.1';
var is_playing = false
init();

function init() {
    // Initialisation
    bg_canvas = document.getElementById('background_canvas');
    bg_ctx = bg_canvas.getContext('2d')
    main_canvas = document.getElementById('main_canvas');
    main_ctx = main_canvas.getContext('2d');
    requestaframe = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();
    WIDTH = main_canvas.width;
    HEIGHT = main_canvas.height;

    grid_width = WIDTH / 8;
    grid_height = HEIGHT / 8;
    figures_srcWidth = 320;
    figures_srcHeight = 320;

    figIsSel = false;  // is figure selected
    whiteOrBlack = 0;  // whose turn is it
    kingsMoved = [false, false]  // whtie, black  check if king moved
    rookMoved = [ 
        [false, false],  // white
        [false, false]  // black
    ];
    wpMoved2 = [];  // position of pawn that made 2 steps
    bpMoved2 = [];
    clickStatus = "select"; 
    pawnTransFigures = ["wq", "wr", "wb", "wn"];  // pawn transformation selectable pawns
    pawnTransPos = [];
    enPassant = false;  // enemy made 2 step move --> en Passant possible
    rmPawn = [];  // remove pawn
    kingsPosition = [
        [4, 7],  // white
        [4, 0]  // black
    ];

    figures_field = [
        ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
        ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
        ["--", "--", "--", "--", "--", "--", "--", "--"],
        ["--", "--", "--", "--", "--", "--", "--", "--"],
        ["--", "--", "--", "--", "--", "--", "--", "--"],
        ["--", "--", "--", "--", "--", "--", "--", "--"],
        ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
        ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"]
    ];

    menuButtons = new Array();


    load_media();
    
    // start game on page load
    // window.setTimeout(() => {start_loop()}, 1000);
    document.addEventListener('DOMContentLoaded', function() {
        window.setTimeout(() => {start_loop()}, 300);
     }, false);
}
// ---------------------------------------------------------
// -----------------------Main-Loop-------------------------
// ---------------------------------------------------------
function loop() {
    // END
    if (is_playing) requestaframe(loop);
}

function start_loop() {
    if (!is_playing)
    {
        menu();
        is_playing = true;
        loop();
    }
}

function stop_loop() {
    is_playing = false;
}
// ---------------------------------------------------------
// ----------------------Main-Loop--------------------------
// ---------------------------------------------------------
function Figures() {
    this.src;
    this.moves;
}
Figures.prototype.draw = function(x, y) {
    main_ctx.drawImage(figures_sprite, this.src[0], this.src[1], figures_srcWidth, figures_srcHeight, x * grid_width, y * grid_height, grid_width, grid_height);
}

function Button (text, x, y, width, height, func) {
    this.text = text;
    this.drawX = x;
    this.drawY = y;
    this.width = width;
    this.height = height;
    this.func = func;
}

Button.prototype.is_over = function(x, y) {
    if (x > this.drawX && x < this.drawX + this.width &&
        y > this.drawY && y < this.drawY + this.height) {
        return true;
    }
    return false;
}

Button.prototype.call_back = function() {
    this.func();
}

Button.prototype.draw = function() {
    bg_ctx.fillStyle = 'black';
    bg_ctx.fillRect(this.drawX, this.drawY, this.width, this.height);

    bg_ctx.fillStyle = "white";
    bg_ctx.font = "30px Arial";
    bg_ctx.textAlign = 'center';
    bg_ctx.textBaseline = 'middle';
    bg_ctx.fillText(this.text, this.drawX+this.width/2, this.drawY+this.height/2)
}


function load_media() {
    figures_sprite = new Image();
    figures_sprite.src = 'media/chess_figures.png';
    circle_sprite = new Image();
    circle_sprite.src = 'media/moveable_circle.png';
    menu_bg_sprite = new Image();
    menu_bg_sprite.src = 'media/menu_background.png';
    winner_menu_bg_sprite = new Image();
    winner_menu_bg_sprite.src = 'media/menu_background.png';
    initializeFigures();
}

function btn_start(){
    clickStatus = "select";
    draw_field();
    draw_figures();
}

function menu() {
    main_ctx.clearRect(0, 0, WIDTH, HEIGHT);
    clickStatus = "menu";
    menuButtons = [new Button("Start", WIDTH / 2-100/2, HEIGHT / 2-50/2, 100, 50, btn_start)]

    bg_ctx.drawImage(menu_bg_sprite, 0, 0);

    for (var i = 0; i < menuButtons.length; i++) {
        menuButtons[i].draw();
    }
}

function btn_newGame(){
    location.reload();
}

function winner_menu(winner) {
    main_ctx.clearRect(0, 0, WIDTH, HEIGHT);
    clickStatus = "winnerMenu";
    winnerMenuButtons = [new Button("New Game", WIDTH / 2-200/2, HEIGHT / 2-50/2, 200, 50, btn_newGame)]

    bg_ctx.drawImage(winner_menu_bg_sprite, 0, 0);

    // show winner
    bg_ctx.fillStyle = 'black';
    bg_ctx.fillRect(WIDTH/2 - 400/2, 110, 400, 150);

    bg_ctx.fillStyle = "white";
    bg_ctx.font = "60px Arial";
    bg_ctx.textAlign = 'center';
    bg_ctx.textBaseline = 'middle';
    bg_ctx.fillText(winner + " WON", WIDTH/2, 185)

    for (var i = 0; i < winnerMenuButtons.length; i++) {
        winnerMenuButtons[i].draw();
    }
}

function initializeFigures() {
    // Figure Image Source
    figures = [{}, {}];
    figures_names = [
        ["wk", "wq", "wb", "wn", "wr", "wp"],
        ["bk", "bq", "bb", "bn", "br", "bp"]
    ];

    // bind figure_names and figures Objects
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 2; j++) {
            figures[figures_names[j][i]] = new Figures();
            figures[figures_names[j][i]].src = [i * figures_srcWidth, j * figures_srcHeight];
        }
    }

    initializeFiguresMoves();
}

function checkXYRange(x, y) {
    if (y < 8 && y >= 0 && x < 8 && x >= 0) return true;
    else return false
}

function initializeFiguresMoves() {  // set moves functions for figures

    // WR, BR
    tmpFunc = function(selFigure, selFigX, selFigY, FigColor, EnemyColor) {
        tmpMoves = new Array(8).fill(false).map(() => new Array(8).fill(false));

        // Loop through every axis
        for (var i = 0; i < 4; i++) {
            x = 0;
            y = 0;
            while (checkXYRange(selFigX + x, selFigY + y) && (figures_field[selFigY + y][selFigX + x] == "--" || (x == 0 && y == 0))) { 
                if (x != 0 || y != 0) tmpMoves[selFigY + y][selFigX + x] = true;  // set movable fields

                // Straights
                if (i == 0) x += 1;
                if (i == 1) x -= 1;
                if (i == 2) y += 1;
                if (i == 3) y -= 1;

                // add first enemy in row to moveable
                try {
                    if (figures_names[EnemyColor].includes(figures_field[selFigY + y][selFigX + x])) tmpMoves[selFigY + y][selFigX + x] = true;
                } catch {}
            }
        }
        return tmpMoves;
    }
    figures.wr.moves = tmpFunc;
    figures.br.moves = tmpFunc;

    // WB, BB
    tmpFunc = function(selFigure, selFigX, selFigY, FigColor, EnemyColor) {
        tmpMoves = new Array(8).fill(false).map(() => new Array(8).fill(false));

        // Loop through every axis
        for (var i = 0; i < 4; i++) {
            x = 0;
            y = 0;
            while (checkXYRange(selFigX + x, selFigY + y) && (figures_field[selFigY + y][selFigX + x] == "--" || (x == 0 && y == 0))) { //&& (figures_field[selFigX + x][selFigY + y] == "--" || (x == 0 && y == 0))
                if (x != 0 || y != 0) tmpMoves[selFigY + y][selFigX + x] = true;  // set movable fields

                // Diagonals
                if (i == 0) {
                    x += 1
                    y += 1
                }
                if (i == 1) {
                    x -= 1
                    y -= 1
                }
                if (i == 2) {
                    x -= 1
                    y += 1
                }
                if (i == 3) {
                    x += 1
                    y -= 1
                }

                // add first enemy in row to moveable
                try {
                    if (figures_names[EnemyColor].includes(figures_field[selFigY + y][selFigX + x])) tmpMoves[selFigY + y][selFigX + x] = true;
                } catch {}
            }
        }
        return tmpMoves;
    }
    figures.wb.moves = tmpFunc;
    figures.bb.moves = tmpFunc;

    // WN, BN
    tmpFunc = function(selFigure, selFigX, selFigY, FigColor, EnemyColor) {
        tmpMoves = new Array(8).fill(false).map(() => new Array(8).fill(false));

        [2, -2].forEach(i => {
            [1, -1].forEach(j => {
                if (checkXYRange(selFigX + j, selFigY + i) && (figures_field[selFigY + i][selFigX + j] == "--" || figures_names[EnemyColor].includes(figures_field[selFigY + i][selFigX + j]))) {
                    tmpMoves[selFigY + i][selFigX + j] = true;
                }
                if (checkXYRange(selFigX + i, selFigY + j) && (figures_field[selFigY + j][selFigX + i] == "--" || figures_names[EnemyColor].includes(figures_field[selFigY + j][selFigX + i]))) {
                    tmpMoves[selFigY + j][selFigX + i] = true;
                }
            });
        });
        return tmpMoves;
    }
    figures.wn.moves = tmpFunc;
    figures.bn.moves = tmpFunc;

    // WQ, BQ
    tmpFunc = function(selFigure, selFigX, selFigY, FigColor, EnemyColor) {
        tmpMoves = new Array(8).fill(false).map(() => new Array(8).fill(false));

        // Loop through every axis
        for (var i = 0; i < 8; i++) {
            x = 0;
            y = 0;
            while (checkXYRange(selFigX + x, selFigY + y) && (figures_field[selFigY + y][selFigX + x] == "--" || (x == 0 && y == 0))) { //&& (figures_field[selFigX + x][selFigY + y] == "--" || (x == 0 && y == 0))
                if (x != 0 || y != 0) tmpMoves[selFigY + y][selFigX + x] = true;  // set movable fields

                // Diagonals
                if (i == 0) {
                    x += 1
                    y += 1
                }
                if (i == 1) {
                    x -= 1
                    y -= 1
                }
                if (i == 2) {
                    x -= 1
                    y += 1
                }
                if (i == 3) {
                    x += 1
                    y -= 1
                }

                // Straights
                if (i == 4) x += 1;
                if (i == 5) x -= 1;
                if (i == 6) y += 1;
                if (i == 7) y -= 1;

                try {
                    if (figures_names[EnemyColor].includes(figures_field[selFigY + y][selFigX + x])) tmpMoves[selFigY + y][selFigX + x] = true;
                } catch {}
            }
        }

        return tmpMoves;
    }
    figures.wq.moves = tmpFunc;
    figures.bq.moves = tmpFunc;

    // WK, BK
    tmpFunc = function(selFigure, selFigX, selFigY, FigColor, EnemyColor) {
        tmpMoves = new Array(8).fill(false).map(() => new Array(8).fill(false));

        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (checkXYRange(selFigX + i, selFigY + j) && (figures_field[selFigY + j][selFigX + i] == "--" || figures_names[EnemyColor].includes(figures_field[selFigY + j][selFigX + i])) && !is_checking(selFigX + i, selFigY + j, EnemyColor)) {
                    tmpMoves[selFigY + j][selFigX + i] = true;
                }
            }
        }

        // Castle
        if (kingsMoved[FigColor] == false) {
            if (!rookMoved[FigColor][0] && figures_field[selFigY][selFigX - 1] == "--" && figures_field[selFigY][selFigX - 2] == "--" && figures_field[selFigY][selFigX - 3] == "--") {
                tmpMoves[selFigY][selFigX - 1] = true;
                tmpMoves[selFigY][selFigX - 2] = true;
            }
            if (!rookMoved[FigColor][1] && figures_field[selFigY][selFigX + 1] == "--" && figures_field[selFigY][selFigX + 2] == "--") {
                tmpMoves[selFigY][selFigX + 1] = true;
                tmpMoves[selFigY][selFigX + 2] = true;
            }
        }

        return tmpMoves
    }
    figures.wk.moves = tmpFunc;
    figures.bk.moves = tmpFunc;

    // WP, BP
    figures.wp.moves = function(selFigure, selFigX, selFigY, FigColor, EnemyColor) {
        tmpMoves = new Array(8).fill(false).map(() => new Array(8).fill(false));

        if (figures_field[selFigY - 1][selFigX] == "--") {
            tmpMoves[selFigY - 1][selFigX] = true;
            if (selFigY == 6 && figures_field[selFigY - 2][selFigX] == "--") {
                tmpMoves[selFigY - 2][selFigX] = true;
            }
        }

        // pawn diagonals
        if (checkXYRange(selFigY - 1, selFigX - 1) && figures_names[EnemyColor].includes(figures_field[selFigY - 1][selFigX - 1])) tmpMoves[selFigY - 1][selFigX - 1] = true;  // left
        if (checkXYRange(selFigY - 1, selFigX + 1) && figures_names[EnemyColor].includes(figures_field[selFigY - 1][selFigX + 1])) tmpMoves[selFigY - 1][selFigX + 1] = true;  // right

        // EN PASSANT
        if ((selFigX + 1 == bpMoved2[0] || selFigX - 1 == bpMoved2[0]) && selFigY == bpMoved2[1]) {
            tmpMoves[bpMoved2[1] - 1][bpMoved2[0]] = true;
            rmPawn = [bpMoved2[0], bpMoved2[1]];
            enPassant = true;
        }

        return tmpMoves
    }
    figures.bp.moves = function(selFigure, selFigX, selFigY, FigColor, EnemyColor) {
        tmpMoves = new Array(8).fill(false).map(() => new Array(8).fill(false));

        if (figures_field[selFigY + 1][selFigX] == "--") {
            tmpMoves[selFigY + 1][selFigX] = true;
            if (selFigY == 1 && figures_field[selFigY + 2][selFigX] == "--") {
                tmpMoves[selFigY + 2][selFigX] = true;
            }
        }

        // pawn diagonals
        if (checkXYRange(selFigY + 1, selFigX - 1) && figures_names[EnemyColor].includes(figures_field[selFigY + 1][selFigX - 1])) tmpMoves[selFigY + 1][selFigX - 1] = true;  // left
        if (checkXYRange(selFigY + 1, selFigX + 1) && figures_names[EnemyColor].includes(figures_field[selFigY + 1][selFigX + 1])) tmpMoves[selFigY + 1][selFigX + 1] = true;  // right

        // EN PASSANT
        if ((selFigX + 1 == wpMoved2[0] || selFigX - 1 == wpMoved2[0]) && selFigY == wpMoved2[1]) {
            tmpMoves[wpMoved2[1] + 1][wpMoved2[0]] = true;
            enPassant = true;
        }
        return tmpMoves
    }
}

function is_checkmate(selFigX, selFigY, EnemyColor){
    if (moveable(selFigX, selFigY).includes(true)){
        return false;
    }
    if (!is_checking(selFigX, selFigY, EnemyColor)){
        return false;
    }

    // loop through every figure
    for (var y = 0; y < figures_field.length; y++){
        for (var x = 0; x < figures_field[y].length; x++){

            // Only my figures
            if (figures_field[y][x] != '--' && !figures_names[EnemyColor].includes(figures_field[y][x])){
                tmp_movable = moveable(x, y);

                // loop through every possible move
                for (var i = 0; i < tmp_movable.length; i++){
                    for (var j = 0; j < tmp_movable[i].length; j++){
                        if (tmp_movable[i][j] == true){

                            tmp_fig = figures_field[i][j];
                            figures_field[i][j] = figures_field[y][x];  // move figure
                            figures_field[y][x] = '--';
                            if (!is_checking(selFigX, selFigY, EnemyColor)){  // is not check?
                                figures_field[y][x] = figures_field[i][j];  // move figure back
                                figures_field[i][j] = tmp_fig;
                                return false;  // no checkmate
                            }
                            figures_field[y][x] = figures_field[i][j];  // move figure back
                            figures_field[i][j] = tmp_fig;
                        }
                    }
                }
            }
        
        }
    }

    return true;  // checkmate

}

function is_checking(selFigX, selFigY, EnemyColor) {
    if (EnemyColor == 0) {
        enemyString = 'w';
        myString = 'b';
    }
    if (EnemyColor == 1){
        enemyString = 'b';
        myString = 'w';
    } 
        

    for (var i = 0; i < 8; i++) {
        x = 0;
        y = 0;

        while (checkXYRange(selFigX + x, selFigY + y) && (figures_field[selFigY + y][selFigX + x] == "--" || (x == 0 && y == 0) || myString + "k" == figures_field[selFigY + y][selFigX + x])) { //&& (figures_field[selFigX + x][selFigY + y] == "--" || (x == 0 && y == 0))
            // diagonals
            if (i == 0) {
                x += 1
                y += 1
            }
            if (i == 1) {
                x -= 1
                y -= 1
            }
            if (i == 2) {
                x -= 1
                y += 1
            }
            if (i == 3) {
                x += 1
                y -= 1
            }

            // straights
            if (i == 4) {
                x += 1;
            }
            if (i == 5) {
                x -= 1;
            }
            if (i == 6) {
                y += 1;
            }
            if (i == 7) {
                y -= 1;
            }

            try {
                if (i >= 0 && i <= 3)
                if (figures_field[selFigY + y][selFigX + x] == enemyString + "q" || figures_field[selFigY + y][selFigX + x] == enemyString + "b") return true;
                if (i >= 4 && i <= 7)
                if (figures_field[selFigY + y][selFigX + x] == enemyString + "q" || figures_field[selFigY + y][selFigX + x] == enemyString + "t") return true;
            } catch {}
        }
    }
    
    // kngiht
    tmp_is_checking = false;
    [2, -2].forEach(i => {
        [1, -1].forEach(j => {
            if (checkXYRange(selFigX + j, selFigY + i) && (figures_field[selFigY + i][selFigX + j] == enemyString + "n")) {
                tmp_is_checking = true;
                return true;
            }
            if (checkXYRange(selFigX + i, selFigY + j) && (figures_field[selFigY + j][selFigX + i] == enemyString + "n")) {
                tmp_is_checking = true;
                return true;
            }
        });
    });
    if (tmp_is_checking) return true;

    // pawns
    try {    if (enemyString == "b" && (figures_field[selFigY - 1][selFigX - 1] == "bp" || figures_field[selFigY - 1][selFigX + 1] == "bp")){
            return true;
        }
        if (enemyString == "w" && (figures_field[selFigY - 1][selFigX - 1] == "wp" || figures_field[selFigY - 1][selFigX + 1] == "wp")){
            return true;
        }
    }
    catch {}

    return false
}

function pawn_transformation(x, y) {
    window_width = grid_width * 4 + 20;
    window_height = grid_height + 20;

    main_ctx.fillStyle = "rgb(75, 75, 75)"
    main_ctx.fillRect((WIDTH / 2) - (window_width / 2), (HEIGHT / 2) - (window_height / 2), window_width, window_height);

    // draw pawn tranformation figures
    i = 0;
    pawnTransFigures.forEach(element => {
        figures[element].draw((2 + i), 3.5)
        i++;
    });
    clickStatus = "transWindow";

    pawnTransPos = [x, y]
}

function draw_field() {
    bg_ctx.clearRect(0, 0, WIDTH, HEIGHT);
    for (var y = 0; y < 8; y++) {
        for (var x = 0; x < 8; x++) {
            if ((x + y) % 2 == 0) bg_ctx.fillStyle = "whitesmoke";
            else bg_ctx.fillStyle = "rgb(175, 175, 175)";
            bg_ctx.fillRect(x * grid_width, y * grid_height, grid_width, grid_height);
        }
    }
}

function draw_figures() {
    main_ctx.clearRect(0, 0, WIDTH, HEIGHT);
    for (var y = 0; y < 8; y++) {
        for (var x = 0; x < 8; x++) {
            if (figures_field[y][x] != "--") {
                figure = figures_field[y][x];
                figures[figure].draw(x, y);
            }
        }
    }
}

function mouse(type, event) {
    if (is_playing) {
        // Mouse Position
        var xMPos = event.pageX - document.getElementById('game_object').offsetLeft;
        var yMPos = event.pageY - document.getElementById('game_object').offsetTop;
        // document.getElementById('x').innerHTML = xMPos;
        // document.getElementById('y').innerHTML = yMPos;
        if (type == "click") {
            mouse_click(xMPos, yMPos)
        }
    }
}

function mouse_click(xMPos, yMPos) {
    if (clickStatus == "select") {  // game
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                if (xMPos <= x * grid_width + grid_width && xMPos >= x * grid_width && yMPos <= y * grid_height + grid_height && yMPos >= y * grid_height) {
                    handle_clicks(x, y)
                }
            }
        }
    } else if (clickStatus == "transWindow") {  // pawn transformation window
        for (var i = 2; i <= 5; i++) {
            if (xMPos <= i * grid_width + grid_width && xMPos >= i * grid_width && yMPos <= 3.5 * grid_height + grid_height && yMPos >= 3.5 * grid_height) {
                console.log(pawnTransFigures[i - 2]);
                clickStatus = "select";
                figures_field[pawnTransPos[1]][pawnTransPos[0]] = pawnTransFigures[i - 2]
                draw_figures()
            }
        }
    } else if (clickStatus == "menu") {  // menu
        for (var i = 0; i < menuButtons.length; i++) {
            if (menuButtons[i].is_over(xMPos, yMPos)){
                menuButtons[i].call_back();
            }
        }
    } else if (clickStatus == "winnerMenu") {  // winner menu
        for (var i = 0; i < winnerMenuButtons.length; i++) {
            if (winnerMenuButtons[i].is_over(xMPos, yMPos)){
                winnerMenuButtons[i].call_back();
            }
        }
    }
}

function handle_clicks(x, y) {
    if (figures_names[whiteOrBlack].includes(figures_field[y][x])) {
        selFigX = x;
        selFigY = y;
        figIsSel = true;
        draw_figures();
        tmpMovable = moveable(selFigX, selFigY);
    } else if (figIsSel && tmpMovable[y][x]) {
        if (whiteOrBlack == 0) whiteOrBlack = 1; // white == 0, black == 1
        else whiteOrBlack = 0;
        figIsSel = false;
        figures_field[y][x] = figures_field[selFigY][selFigX];
        figures_field[selFigY][selFigX] = "--"

        // save kings position
        if (figures_field[y][x] == "wk") {
            kingsPosition[0] = [x, y];
        }
        if (figures_field[y][x] == "bk") {
            kingsPosition[1] = [x, y];
        }

        // IS CHECKING
        is_check = false;
        if (is_checking(kingsPosition[0][0], kingsPosition[0][1], 1)) {  // white
            console.log("is_checking");
            bg_ctx.fillStyle = "red";
            bg_ctx.fillRect(kingsPosition[0][0] * grid_width, kingsPosition[0][1] * grid_height, grid_width, grid_height);
            is_check = true;
        }

        if (is_checking(kingsPosition[1][0], kingsPosition[1][1], 0)) {  // black
            console.log("is_checking");
            bg_ctx.fillStyle = "red";
            bg_ctx.fillRect(kingsPosition[1][0] * grid_width, kingsPosition[1][1] * grid_height, grid_width, grid_height);
            is_check = true;
        }

        if (!is_check){
            draw_field();
        }


        // KING CASTLE
        if ((figures_field[y][x] == "wk" && kingsMoved[0] == false) || (figures_field[y][x] == "bk" && kingsMoved[1] == false)) {
            if (figures_field[y][x] == "wk") kingsMoved[0] = true;
            else if (figures_field[y][x] == "bk") kingsMoved[1] = true;

            if (x == selFigX + 2) {
                figures_field[y][x + 1] = "--"
                if (figures_field[y][x] == "wk") figures_field[y][x - 1] = "wr";
                else if (figures_field[y][x] == "bk") figures_field[y][x - 1] = "br";
            }
            if (x == selFigX - 2) {
                figures_field[y][x - 2] = "--"
                if (figures_field[y][x] == "wk") figures_field[y][x + 1] = "wr";
                else if (figures_field[y][x] == "bk") figures_field[y][x + 1] = "br";
            }
        }
        // EN PASSANT
        if (figures_field[y][x] == "wp") wpMoved2 = [];
        if (figures_field[y][x] == "bp") bpMoved2 = [];

        if (enPassant && (figures_field[y+1][x] == "bp" || figures_field[y-1][x] == "wp")) figures_field[rmPawn[1]][rmPawn[0]] = "--";

        if ((figures_field[y][x] == "wp") && y == selFigY - 2) wpMoved2 = [x, y];
        if ((figures_field[y][x] == "bp") && y == selFigY + 2) bpMoved2 = [x, y];

        // IS CHECKMATE
        if (is_checkmate(kingsPosition[0][0], kingsPosition[0][1], 1)) {  // white
            winner_menu("BLACK");
        }

        if (is_checkmate(kingsPosition[1][0], kingsPosition[1][1], 0)) {  // black
            winner_menu("WHITE");
        }

        if (clickStatus != "winnerMenu") draw_figures();

        // PAWN TRANSFORMATION
        if ((figures_field[y][x] == "wp" && y == 0) || (figures_field[y][x] == "bp" && y == 7)) pawn_transformation(x, y);

    }
}

function moveable(selFigX, selFigY) {
    moves = new Array(8).fill(false).map(() => new Array(8).fill(false));

    // define Figure Information
    selFigure = figures_field[selFigY][selFigX];
    if (figures_names[0].includes(selFigure)) {
        FigColor = 0
        EnemyColor = 1;
    }
    if (figures_names[1].includes(selFigure)) {
        FigColor = 1
        EnemyColor = 0;
    }


    // define figure moves
    enPassant = false;
    if (selFigure != "--")
        moves = figures[selFigure].moves(selFigure, selFigX, selFigY, FigColor, EnemyColor)

        
    // draw circles
    if (clickStatus != "winnerMenu")
    {    for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                circle_size = grid_width / 3
                if (moves[y][x]) main_ctx.drawImage(circle_sprite, (x * grid_width) + (grid_width / 2) - (circle_size / 2), (y * grid_height) + (grid_height / 2) - (circle_size / 2), circle_size, circle_size);
            }
        }
    }
    // console.table(moves)
    return moves
}
