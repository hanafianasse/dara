class Cell {

    piece;    // typeOf piece
    position; // the position on the board !! may not be used => so delete it 

    constructor(i,j){
        this.piece = null;
        this.position = {x: i,y: j} 
    }

    getPiece = () => {
        return this.piece;
    }

    setPiece = (piece) => {
        this.piece = piece;
    }

    getPosition = () => {
        return this.position;
    }

}