class Game {

    boardWidth  = 6;
    boardHeight = 5;

    player1Color = "Blue";
    player2Color = "Red";

    pieceCounterForEachPlayer = this.boardWidth * 2;

    playerTurn = 1;   // By default, player '1' is the first to start playing
    currentPhase = 1; // By default, we start with phase '1' 

    selectedCell = null;

    /**
     * Only phase '2' have actions (The first phase have 1 action)
     * 0 : we still on phase '1' 
     * 1 : select my piece
     * 2 : chose new position of selected piece (check if i have a winning pos => if so action = 3 )
     * 3 : remove opponent piece
     */
    currentAction = 0;

    board = [];

    constructor(){
        this.createBoard();
        this.createHtmlBoard();
        this.setGameInfo(); // show game state
        
        console.log(this.board);     // ---> for debuging
        this.printfBoardPositions(); // ---> for debuging
    }

    createBoard = () => {
        for (let i = 0; i < this.boardHeight; i++) {
            let row = [];
            for (let j = 0; j < this.boardWidth; j++) {
                row.push(new Cell(i,j));
            }
            this.board.push(row);        
        }
    }

    createHtmlBoard = () => {

        let boardBox = document.getElementById("board");

        for (let i = 0; i < this.boardHeight; i++) {

            let row = document.createElement("div");
            row.setAttribute("class", "row");    

            for (let j = 0; j < this.boardWidth; j++) {

                let element = document.createElement("div");
                element.setAttribute("id",j+""+i);

                let image = document.createElement("img");
                image.setAttribute("width", "50px");
                image.setAttribute("height", "50px");
                image.setAttribute("src", "assets/white.png");
                element.appendChild(image);

                element.addEventListener('click',() => {this.click({x:i,y:j})});

                row.appendChild(element);
            }
            boardBox.append(row);
        }
    }

    click = (position) => {

        switch(this.currentPhase){
            case 1:
                this.pushPiece(position);
                break;
            case 2:
                switch(this.currentAction){
                    case 1:
                        this.selectPiece(position);
                        break;
                    case 2:
                        this.moveSelectedPiece(position); // STOPED HERE 
                        // TODO : add here : check if to move phase 3 or back to 1 for next player
                        break;
                    case 3:
                        this.destroyOpponentPiece(position);
                        break;
                    default:
                        throw new Exception("Invalid Phase Two Action");
                }
                break;
            default:
                throw new Exception("playerTurn is invalid");
        }
    }

    destroyOpponentPiece = (position) => {

        let pieceTodestroy = this.board[position.x][position.y].getPiece();

        if(this.isNull(pieceTodestroy)){
            alert("cannot destroy empty cell");
            return;
        }

        switch (this.playerTurn) {
            case 1: // player 1 is playing
                if(pieceTodestroy.getColor() == this.player1Color){
                    alert("you can't destroy your owne piece");
                    return;
                }
                break;
            case 2:// player 2 is playing
                if(pieceTodestroy.getColor() == this.player2Color){
                    alert("you can't destroy your owne piece");
                    return;
                }
                break;
            default:
                throw new Exception("playerTurn is invalid");
        }
        this.board[position.x][position.y].setPiece(null);
        this.updateBoard();
        this.changeTurn();
        this.setAction(1);
    }

    selectPiece = (position) => {
        
        // you cannot select an empty piece
        if(this.isPositionEmpty(position)){
            alert("Cannot select empty cell");
            return;
        }

        // check if selected piece has possible moves befor selecting it
        if(this.haveEmptyPositionArround(this.board[position.x][position.y])){
            this.selectedCell = this.board[position.x][position.y];
        }else{
            alert("cannot select this piece");
            alert("Select a piece that have possible moves");
            return;
        }
        
        // you cannot select opponent pieces
        switch(this.playerTurn){
            case 1:
                if(this.selectedCell.getPiece().getColor() == this.player1Color){
                    this.board[position.x][position.y].getPiece().select();
                    this.setAction(2); // move to action '2'
                    this.updateBoard();
                    return;
                }
                break;
            case 2:
                if(this.selectedCell.getPiece().getColor() == this.player2Color){
                    this.board[position.x][position.y].getPiece().select();
                    this.setAction(2); // move to action '2'
                    this.updateBoard();
                    return;
                }
                break;
            default:
                throw new Exception("playerTurn is wrong");
        }
        alert("You cannot select opponent piece");
    }

    haveEmptyPositionArround = (cell) => {

        let topPosition = this.getTopPosition(cell.getPosition());
        if(this.isNotNull(topPosition) && this.isPositionEmpty(topPosition)){
            return true;
        }

        let leftPosition = this.getLeftPosition(cell.getPosition());
        if(this.isNotNull(leftPosition) && this.isPositionEmpty(leftPosition)){
            return true;
        }

        let rightPosition = this.getRightPosition(cell.getPosition());
        if(this.isNotNull(rightPosition) && this.isPositionEmpty(rightPosition)){
            return true;
        }

        let bottomPosition = this.getBottomPosition(cell.getPosition());
        if(this.isNotNull(bottomPosition) && this.isPositionEmpty(bottomPosition)){
            return true;
        }

        return false;
    }

    moveSelectedPiece = (position) =>{
        let possibleMoves = this.getPossibleMoves(this.selectedCell.getPosition());

        possibleMoves.forEach(element => {
            if(this.isNotNull(element) && position.x == element.x && position.y == element.y){
                // set the selected piece on the new position
                // remove selected piece from old position
                let p = new Piece(this.selectedCell.getPiece().getColor());
                this.board[this.selectedCell.getPosition().x][this.selectedCell.getPosition().y].setPiece(null);
                this.board[position.x][position.y].setPiece(p);
                this.selectedCell = null;

                if(this.playerMadeTreeInLine(position)){
                    this.setAction(3);
                }else{
                    this.changeTurn();
                    this.setAction(1);
                }
                this.updateBoard();
                return;
            }
        });

        if(this.isNotNull(this.selectedCell)){
            alert("Not valide position");
        }
    }

    playerMadeTreeInLine = (position) => {

        // if position is invalid
        if( this.isNull(position) ||
            this.isNull(this.board[position.x][position.y].getPiece()) ) {
            return false;
        }

        let playerColor = this.board[position.x][position.y].getPiece().getColor();

        let firstTopPosition = this.getTopPosition(position);
        let secondeTopPosition = this.getTopPosition(firstTopPosition);
        if(this.isNotNull(firstTopPosition) && this.isNotNull(secondeTopPosition) ){
            let firstTopPiece = this.board[firstTopPosition.x][firstTopPosition.y].getPiece();
            let secondeTopPiece = this.board[secondeTopPosition.x][secondeTopPosition.y].getPiece();
            if( this.isNotNull(firstTopPiece) && this.isNotNull(secondeTopPiece) && 
                playerColor == firstTopPiece.getColor() && playerColor == secondeTopPiece.getColor() ){
                return true;
            }
        }

        let firstBottomPosition = this.getBottomPosition(position);
        let secondeBottomPosition = this.getBottomPosition(firstBottomPosition);
        if(this.isNotNull(firstBottomPosition) && this.isNotNull(secondeBottomPosition) ){
            let firstBottomPiece = this.board[firstBottomPosition.x][firstBottomPosition.y].getPiece();
            let secondeBottomPiece = this.board[secondeBottomPosition.x][secondeBottomPosition.y].getPiece();
            if( this.isNotNull(firstBottomPiece) && this.isNotNull(secondeBottomPiece) && 
                playerColor == firstBottomPiece.getColor() && playerColor == secondeBottomPiece.getColor() ){
                return true;
            }
        }

        let firstRightPosition = this.getRightPosition(position);
        let secondeRightPosition = this.getRightPosition(firstRightPosition);
        if(this.isNotNull(firstRightPosition) && this.isNotNull(secondeRightPosition) ){
            let firstRightPiece = this.board[firstRightPosition.x][firstRightPosition.y].getPiece();
            let secondeRightPiece = this.board[secondeRightPosition.x][secondeRightPosition.y].getPiece();
            if( this.isNotNull(firstRightPiece) && this.isNotNull(secondeRightPiece) && 
                playerColor == firstRightPiece.getColor() && playerColor == secondeRightPiece.getColor() ){
                return true;
            }
        }

        let firstLeftPosition = this.getLeftPosition(position);
        let secondeLeftPosition = this.getLeftPosition(firstLeftPosition);
        if(this.isNotNull(firstLeftPosition) && this.isNotNull(secondeLeftPosition) ){
            let firstLeftPiece = this.board[firstLeftPosition.x][firstLeftPosition.y].getPiece();
            let secondeLeftPiece = this.board[secondeLeftPosition.x][secondeLeftPosition.y].getPiece();
            if( this.isNotNull(firstLeftPiece) && this.isNotNull(secondeLeftPiece) && 
                playerColor == firstLeftPiece.getColor() && playerColor == secondeLeftPiece.getColor() ){
                return true;
            }
        }

        let topPosition = this.getTopPosition(position);
        let bottomPosition = this.getBottomPosition(position);
        if(this.isNotNull(topPosition) && this.isNotNull(bottomPosition) ){
            let topPiece = this.board[topPosition.x][topPosition.y].getPiece();
            let bottomPiece = this.board[bottomPosition.x][bottomPosition.y].getPiece();
            if( this.isNotNull(topPiece) && this.isNotNull(bottomPiece) && 
                playerColor == topPiece.getColor() && playerColor == bottomPiece.getColor() ){
                return true;
            }
        }

        let rightPosition = this.getRightPosition(position);
        let leftPosition = this.getLeftPosition(position);
        if(this.isNotNull(rightPosition) && this.isNotNull(leftPosition) ){
            let rightPiece = this.board[rightPosition.x][rightPosition.y].getPiece();
            let leftPiece = this.board[leftPosition.x][leftPosition.y].getPiece();
            if( this.isNotNull(rightPiece) && this.isNotNull(leftPiece) && 
                playerColor == rightPiece.getColor() && playerColor == leftPiece.getColor() ){
                return true;
            }
        }

        return false;
    }


    getPossibleMoves = (position) => {
        return [
            this.getTopPosition(position),
            this.getBottomPosition(position),
            this.getRightPosition(position),
            this.getLeftPosition(position)
        ];
    }

    getTopPosition = (position) => {
        if(this.isNull(position)){
            return null;
        }
        if(this.isPositionOnTopRow(position)){
            return null;
        }
        return {
            x: position.x - 1,
            y: position.y
        }
    }

    getBottomPosition = (position) => {
        if(this.isNull(position)){
            return null;
        }
        if(this.isPositionOnBottomRow(position)){
            return null;
        }
        return {
            x: position.x + 1,
            y: position.y
        }
    }

    getRightPosition = (position) => {
        if(this.isNull(position)){
            return null;
        }
        if(this.isPositionOnRightColumn(position)){
            return null;
        }
        return {
            x: position.x,
            y: position.y + 1 
        }
    }
 
    getLeftPosition = (position) => {
        if(this.isNull(position)){
            return null;
        }
        if(this.isPositionOnLeftColumn(position)){
            return null;
        }
        return {
            x: position.x,
            y: position.y - 1 
        }
    }

    isPositionOnTopRow = (position) => {
        return true ? position.x == 0 : false;
    }

    isPositionOnBottomRow = (position) => {
        return true ? position.x == (this.boardHeight - 1) : false;
    }

    isPositionOnRightColumn = (position) => {
        return true ? position.y == (this.boardWidth - 1) : false;
    }

    isPositionOnLeftColumn = (position) => {
        return true ? position.y == 0 : false;
    }

    updateBoard = () =>{
        for (let i = 0; i < this.boardHeight; i++) {
            for (let j = 0; j < this.boardWidth; j++) {
                let currentPiece = this.board[i][j].getPiece();

                if(this.isNotNull(currentPiece)){
                    if(currentPiece.getColor() == "Blue"){
                        document.getElementById(j+""+i).firstChild.setAttribute("src","assets/blue.png");
                    }else{
                        document.getElementById(j+""+i).firstChild.setAttribute("src","assets/red.png");
                    }
                }else{
                    document.getElementById(j+""+i).firstChild.setAttribute("src","assets/white.png");
                }
            }
        }
    }

    setGameInfo = () => {
        this.setPlayerTurn(1);
        this.setPhase(this.currentPhase);
        this.setAction(0);
    }

    setPlayerTurn = (playerNumber) => {
        document.getElementById("player-turn").innerText = "Turn : player "+playerNumber;
    }

    setPhase = (phaseNumber) => {
        this.currentPhase = phaseNumber;
        document.getElementById("phase").innerText = "Phase : "+this.currentPhase;
    }

    setAction = (actionNumber) => {
        this.currentAction = actionNumber;
        switch (this.currentAction) {
            case 0:
                document.getElementById("action").innerText = "Action : Push";
                break;
            case 1:
                document.getElementById("action").innerText = "Action : Select your piece";
                break;
            case 2:
                document.getElementById("action").innerText = "Action : Chose new position";
                break;
            case 3:
                document.getElementById("action").innerText = "Action : Select opponent piece to be removed";
                break;
            default:
                throw new Exception("Invalid action");
        }
    }

    /**
     * TODO : [add check] make sure not to push 3 piece on same line or column
     */
    pushPiece = (position) => {
        if(this.isPositionEmpty(position)){
            let piece = null;
            switch(this.playerTurn){
                case 1:
                    piece = new Piece(this.player1Color);
                    break;
                case 2:
                    piece = new Piece(this.player2Color);
                    break;
                default:
                    throw new Exception("playerTurn is wrong");
            }
            this.board[position.x][position.y].setPiece(piece);

            if(this.playerMadeTreeInLine(position)){
                alert("You can't place you piece here !");
                this.board[position.x][position.y].setPiece(null);
                return;
            }

            this.updateBoard();
            this.changeTurn();
            this.movePhaseTwoIfOneIsDone();
        }
    }

    movePhaseTwoIfOneIsDone = () => {
        let playerTwoPieceCounter = 0;
        for (let i = 0; i < this.boardHeight; i++) {
            for (let j = 0; j < this.boardWidth; j++) {
                let piece = this.board[i][j].getPiece();
                if(this.isNotNull(piece)){
                    if(piece.getColor() == this.player2Color){
                        playerTwoPieceCounter++;
                    }
                }
            }
        }

        console.log("total piece should be for each player : " + this.pieceCounterForEachPlayer);
        console.log("player two total played piece : "+playerTwoPieceCounter);

        if(playerTwoPieceCounter == this.pieceCounterForEachPlayer){
            this.setPhase(2);
            this.setAction(1);
        }
    }

    changeTurn = () =>{
        if(this.playerTurn == 1){
            this.playerTurn = 2
            this.setPlayerTurn(2);
        }else{
            this.playerTurn = 1;
            this.setPlayerTurn(1);
        }
    }

    isPositionEmpty = (position) => {
        return true ? this.isNull(this.board[position.x][position.y].getPiece()) : false;
    }

    isNull = (obj) => {
        return true ? obj == null : false;
    }

    isNotNull(obj){
        return !this.isNull(obj);
    }

    // maybe should be fixed
    printfBoardPositions(){
        for (let i = 0; i < this.boardHeight; i++) {  
            let row = "";   
            for (let j = 0; j < this.boardWidth; j++) {
                row += this.board[i][j].getPosition().x+":"+this.board[i][j].getPosition().y+"   ";
            }
            console.log(row);
        }
    }

}
