class Piece {

    color;
    selected;

    constructor(color){
        this.color = color;
        this.selected = false;
    }

    getColor = () => {
        return this.color;
    }

    isSelected = () => {
        return this.selected;
    }

    select = () => {
        this.selected = true;
    }

    unSelect = () => {
        this.selected = false;
    }

}