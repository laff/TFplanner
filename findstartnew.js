
/**
 * Function finds the next valid starting square for a mat, then
 * calls placeMat to start the placement process
**/
ResultGrid.prototype.findStart = function() {
    
    var squares = this.squares,
        startSquares = this.startSquares, 
        len = startSquares.length,
        width = this.squarewidth,
        height = this.squareheight,
        supply = this.supplyPoint,
        that = this,
        checkSquare = function(i, callback) {
            
            var index = startSquares[i],
                square = squares[index],
                squareList = [ index, index-width, index+1, index-1, index+width ],
                checkSubSquare = function(i, j, callback1) {

                console.log("Square: " + index + " subsquare: " + j);
                if (j >= 25) {
                    that.squares[index].populated = true;
                    return false;
                }   

                if ( that.adjacentWall(squareList, j) && that.placeMat(index, j, 500) ) {
                    return true;
                } else {
                    return callback1(i, j+1, callback1);
                }
            };

            if (i >= len) {
                return false;
            }

            if (square.reallyInside && !square.populated) {
                
                if (square.subsquares.length == 0) {

                    //Criteria: If adjacent to a wall and recursive mat placement works,
                    // return true
                    if ( that.placeMat( index, 0, 3000) ) {
                         return true;
                    }

                } else {
                    //Checks for each subsquare if it has adjacent wall and recursive mat
                    // placement 
                    /*
                    for (var j = 0; j < 25; ++j) {
                        if ( that.adjacentWall(squareList, j) && that.placeMat(i, j) ) {
                            return true;
                        }           
                    } 
                    /*/
                    if (checkSubSquare(i, 0, checkSubSquare)) {
                        return true;
                    } else {
                        return callback(i+1, callback);
                    }
                }
                
            } else {
                return callback(i+1, callback);
            }
            return false;
        };

    if (supply) {
        xmin = supply[0];
        xmax = supply[1];
        ymin = supply[2];
        ymax = supply[3];
    }

    return checkSquare(0, checkSquare);

/*
    for (var i = 0; i < len; ++i) {
        var square = squares[i];

        //If not inside the supply boundaries we can skip to next square
        if (supply && (square.xpos <= xmin || square.xpos >= xmax || square.ypos < ymin || square.ypos >= ymax) ) {
            continue;
        }
        
        if (square.reallyInside && !square.populated) {

            //Neighbouring square numbers 
            var squareList = [i, i-width, i+1, i-1, i+width];
            
            if (square.subsquares.length == 0) {

                //Criteria: If adjacent to a wall and recursive mat placement works,
                // return true
                if ( this.adjacentWall(squareList, -1) && this.placeMat(i, 0)  ) {
                     return true;
                }

            } else {
                //Checks for each subsquare if it has adjacent wall and recursive mat
                // placement 
                for (var j = 0; j < 25; ++j) {
                    if ( this.adjacentWall(squareList, j) && this.placeMat(i, 0) ) {
                        return true;
                    }           
                }        
            }
            
        }
    }
    */
    //return false;
    //End of findStart()
}
