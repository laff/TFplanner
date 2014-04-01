/**
 * Constructor for the result display
 * @param pathString - The room presented as ONE path.
**/ 
function ResultGrid(pathString) {
    //this.size = 5;
    this.height = grid.resHeight;
    this.width = grid.resWidth;
    this.paper = grid.paper;
    this.squares = [];
    this.area = 0;
    this.unusedArea = 0;
    this.squarewidth = 0;
    this.squareheight= 0;
    this.path = pathString;
    this.chosenMats = null;
    // Color palette
    this.colorIndex = 0;
    this.matColors = [
        '#d3d3d3',
        '#a8a8a8', 
        '#7e7e7e',
        '#545454'
    ];
    this.currentColor;

    //Functionality to prepare data structure
    this.addSquares();
    this.supplyPoint =  this.setSupplyPoint();
    this.addObstacles();
    this.moveWalls();

    //Starts to populate the data structure
    this.findStart();
}


/**
 *  Drawing mats by calling fancy functions on all the squares.
**/
ResultGrid.prototype.displayMats = function () {

    var mats = mattur.list,
        squares = this.squares,
        products = [];

    // Clear out array incase doubleclick etc.
    this.chosenMats = null;

    for (var i = 0; i < mats.length; i++) {

        if (mats[i] == undefined) {
            continue;
        }

        // Extract productnumber from the first square.
        products.push(squares[mats[i][0]].productNr);



        // Go through  each square, starting  with the highest square index.
        // This is because mats are placed backwards initially.
        var tmpDirection = null,
            j = (mats[i].length),
            k = 0;
        while  (j--) {
            
            if (j == 0) {
                squares[mats[i][j]].direction = null;
            }

            // Draw productnumber instead of arrow.
            if (k == 2) {
                squares[mats[i][j]].drawMatline('productNr');

            // Draw arrow.
            } else {
                squares[mats[i][j]].drawMatline(tmpDirection);
            }

            // Put the productnumber to front of arrow
            if (k == 3) {
                squares[mats[i][(j + 1)]].arrows.toFront();
            }

            k++;

            tmpDirection = squares[mats[i][j]].direction;
        }
    }

    this.chosenMats = products;
}

/**
 * Function creates a square structure
**/
ResultGrid.prototype.addSquares = function() {
    var squares = this.squares,
        paper = this.paper,
        path = this.path,
        xdim = 50, 
        ydim = 50,
        width = this.width,
        height = this.height,
        length = 0,
        square;


    //The grid is slightly larger than the figure, 
    // and grid is padded to avoid getting partial squares 
    height = height +150 + (50-height%50);
    width = width + 150 +(50-width%50);
    this.squareheight = height/50;
    this.squarewidth = width/50;

    for (var i = 0; i < height; i += ydim) {
        for (var j = 0; j < width; j += xdim) {
            square = new Square(j, i, path, paper);
            squares[length++] = square;
        }
    }
}

/**
 * Clears the data structury and removes the drawn elements
**/
ResultGrid.prototype.clear = function () {

    //Cleans up arrays
    var squares = this.squares,
        square,
        arr;
    while (this.squares.length > 0) {
        square = this.squares.pop();
        if (square.subsquares.length != 0) {
            square.clearSubsquares();
        } 
    }

    //Removes the drawing
    this.paper.remove();
}

/**
 * Function finds the next valid starting square for a mat, then
 * calls placeMat to start the placement process
**/
ResultGrid.prototype.findStart = function() {
    var squares = this.squares, 
        len = squares.length,
        width = this.squarewidth,
        height = this.squareheight,
        supply = this.supplyPoint,
        xmin = null,
        xmax = null,
        ymin = null, 
        ymax = null;

    if (supply) {
        xmin = supply[0];
        xmax = supply[1];
        ymin = supply[2];
        ymax = supply[3];
    }

    for (var i = 0; i < len; ++i) {
        var square = squares[i];

        //If not inside the supply boundaries we can skip to next square
        if (supply && (square.xpos <= xmin || square.xpos >= xmax || 
                       square.ypos < ymin || square.ypos >= ymax) ) {
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
                for (var j=0; j < 25; ++j) {
                    if ( this.adjacentWall(squareList, j) && this.placeMat(i, 0) ) {
                        return true;
                    }           
                }        
            }
            
        }
    }
    return false;
    //End of findStart()
}


/**
 * Function tries to place mats by deciding mat length, then calling placeSquare.
 * Will try to place longest possible mat first, then in decreasing length
 * @oaram squareNo - The index of the square where mat is to be placed
 * @param subsquareNo - The index of the subsquare, iff any, where mat
 *  is to be placed
**/
ResultGrid.prototype.placeMat = function (squareNo, subsquareNo) {

    var mat,    
        l = [];

    for (var i = 0; i < options.validMat.products.length; i++) {
        // Length of mats is stored in meters, we want it in cm.
        l[i] = options.validMat.products[i].length*100;
    }

    // Picks color, then increments.
    this.currentColor = this.pickColor();
    this.colorIndex++;


    while (l.length > 0) {
        var length = l.pop(),
            c = length * 50;

        if (c <= this.unusedArea) {
            mat = new HeatingMat(length, null, this.currentColor);
            mat.productNr = options.validMat.products[l.length].number;

            //placeSquare is where the placement of the mat begins
            if ( this.placeSquare(squareNo, subsquareNo, mat, 0, -1) ) {
                return true;
            }
            delete mat;
        }
    }

    //If we reach this point mat placement has failed, and we revert
    // and presumably recurse
    this.colorIndex--;
    return false;

    //End of placeMat
}

/**
 *  Function that returns a color based on indexes 0-3
 *
**/
ResultGrid.prototype.pickColor = function () {

    if (this.colorIndex > 3) {
        this.colorIndex = 0;
    }

    return this.matColors[this.colorIndex];
}

/**
 * Recursivevely places squares until mat is full, then tries to
 * place new mat if area is not full
 * @param squareNo - Index of square to be populated
 * @param subsquareNo - Index of subsquare to be populated, 0-24 if there is one, -1 if not
 * @param mat - The heating mat which is currently being placed
 * @param lastSquareNo - Index of last square to be populated
 * @param lastSubsquareNo - Index of last subsquare to be populated, -1 if last square did not
 *  use subsquares
**/
ResultGrid.prototype.placeSquare = function (squareNo, subsquareNo, mat, lastSquareNo, lastSubsquareNo) {
    var squares = this.squares,
        square = squares[squareNo],
        width = this.squarewidth,
        height = this.squareheight,
        area = 50*50,
        timeout = Date.now();

    //If thee recursive placement is taking too long, abort mat
    //Due to asynchronous nature of javascript this is safer than simply returning false
    if ( (timeout - mat.timestamp) > mat.validPeriod) {
        return false;
    }


    //If there are now walls or other obstacles is square (no subsquare structure)
    // or if there is not enough area left in mat to fill an empty square
    if ( !square.populated && (square.subsquares.length == 0) && (mat.unusedArea >= area) ) {

        //Neighboring squares and their numbers in squares array
        var u = squareNo-width,
            l = squareNo-1,
            r = squareNo+1,
            d = squareNo+width,
            up = squares[u], 
            left =  squares[l], 
            right = squares[r], 
            down = squares[d];
            

        //Toggles this square as populated
        this.squares[squareNo].populated = true;
        mat.addSquare();
        this.unusedArea -= area;
        square.setArrow(5, mat, squareNo);


        
        //If whole mat has been successfully placed: return true if new mat can be placed or room
        // is full, if not revert and recurse
        if (mat.unusedArea == 0) {
            var squareList = [squareNo, squareNo-width, squareNo +1, squareNo-1, squareNo+width];

            if ( this.adjacentWall(squareList, -1) && ( this.unusedArea == 0 || this.findStart() ) ) {
                var temp = squareNo-lastSquareNo,
                    dir;

                if ( temp > 1 ) {
                    dir = 0;
                } else if ( temp == 1) {
                    dir = 1;
                } else if (temp == -1) {
                    dir = 2;
                } else {
                    dir = 3;
                }


                this.squares[squareNo].setArrow(dir, mat, squareNo);

                return true;
            } else {
                //Revert and recurse
                this.unusedArea += area;
                square.arrows.remove();
                this.squares[squareNo].populated = false;
                mat.removeSquare();
                square.setArrow(6, mat, squareNo);
                return false;
            }
        }

        //Tries to populate next square, in order up-right-left-down
        if (up.reallyInside && !up.populated) { 
            if ( !up.hasObstacles && !up.hasWall) {
                if (this.placeSquare(u, 0, mat, squareNo, -1) ) {
                    this.squares[squareNo].setArrow(0, mat, squareNo);
                    return true;
                }      
            } else { 
                for (var i = 20; i < 25; ++i) {
                    if ( this.placeSquare(u, i, mat, squareNo, lastSubsquareNo) ) {
                        this.squares[squareNo].setArrow(1, mat, squareNo);
                        return true;
                    }
                }
            }
        }
        if (right.reallyInside && !right.populated) {
             if ( !right.hasObstacles && !right.hasWall && this.placeSquare(r, 0, mat, squareNo, -1) ) {
                this.squares[squareNo].setArrow(1, mat, squareNo);
                return true;                  
            } else { 
                for (var i = 0; i < 21; i += 5) {
                    if ( this.placeSquare(r, i, mat, squareNo, lastSubsquareNo) ) {
                        this.squares[squareNo].setArrow(1, mat, squareNo);
                        return true;
                    }
                }
            }
        }
        if (left.reallyInside && !left.populated) {
             if ( !left.hasObstacles && !left.hasWall ) {
                if (this.placeSquare(l, 4, mat, squareNo, -1) ) {
                    this.squares[squareNo].setArrow(2, mat, squareNo);
                    return true;
                }         
            } else { 
                for (var i = 4; i < 25; i += 5) {
                    if ( this.placeSquare(l, i, mat, squareNo, lastSubsquareNo) ) {
                        this.squares[squareNo].setArrow(2, mat, squareNo);
                        return true;
                    }   
                }
            }
        }
        if (down.reallyInside && !down.populated) {
            if ( !down.hasObstacles && !down.hasWall) {
                if (this.placeSquare(d, 0, mat, squareNo, -1) ) {
                    this.squares[squareNo].setArrow(3, mat, squareNo);
                    return true;
                }                
            } else {
                for (var i = 0; i < 5; ++i) {
                    if ( this.placeSquare(d, i, mat, squareNo, lastSubsquareNo) ) {
                        this.squares[squareNo].setArrow(3, mat, squareNo);
                        return true;
                    }                      
                }
            }
        }

        //If function comes to this point, attempt has failed.
        //Reset and revert to previous square
        this.unusedArea += area;
        square.setArrow(6, mat, squareNo);
        this.squares[squareNo].populated = false;
        mat.removeSquare();
    } 
    //This else-branch will occur if square has subsquare structure or there is not enough
    // mat area left to cover the entire square
    else {
        //If the end needs to be divided into subsquares to reach a wall we will 
        // need to know which direction we came from
        if (mat.unusedArea < area && lastSubsquareNo == -1) {
            var diff = subsquareNo - lastSubsquareNo;
            //From left or top
            if (diff > 1) {
                subsquareNo = 20;
            } else if ( diff == -1) {
                subsquareNo = 4; 
            } else {
                subsquareNo = 0;
            }
        }
        if ( this.placeSubsquare(squareNo, subsquareNo, mat, lastSquareNo, lastSubsquareNo) ) {
            return true;
        }   
    }
    return false;

    //End of placeSquare
}

/**
 * Function populated a subsquare, if possible, then recursively calls itself. When no
 * new subsquare can be reached it will try to call placeSquare for the next square instead.
 * @param squareNo - Index of square containing the subsquare to be populated
 * @param subSquareNo - Index of subsquare to be populated
 * @param mat - The heating mat which is currently placed
 * @param lastSquareNo -The last square to be populated. Will be the same as squareNo if 
 *  the last subsquare populated is inside the same square
 * @param lastSubsquareNo - The last subsquare populated. Will be -1 if this function is called
 *  from a square without subsquares
**/
ResultGrid.prototype.placeSubsquare = function(squareNo, subsquareNo, mat, lastSquareNo, lastSubsquareNo) {

    var squares = this.squares,
        square = squares[squareNo],
        subsquares = square.subsquares,
        added = false,
        abort = false,
        timeout = Date.now();

    //If the recursive placement is taking too long, abort mat
    //Simply returning false will not work due to asynchronous nature
    if ( (timeout - mat.timestamp) > mat.validPeriod) {
        abort = true;
    }

    //If no subsquare sttucture exists, create one. 
    //Will happen if function is called because mat unused area is less
    // than a full square
    if (subsquares.length == 0) {
        for (var i = 0; i < 25; ++i) {
            var x = square.xpos + (i%5)*10,
                y = square.ypos + Math.floor(i/5)*10, 
                s = new Subsquare(x, y, this.paper, null);

            s.insideRoom = true;
            this.squares[squareNo].subsquares.push(s);
        }
        added = true;
    }

    var sub = subsquares[subsquareNo],
        width = this.squarewidth,
        height = this.squareheight,
        area = 10*10,
        squareFull = true,
        u = subsquareNo-5,
        l = subsquareNo-1,
        r = subsquareNo+1,
        d = subsquareNo+5,
        up = null, 
        left = null, 
        right = null, 
        down = null;


    //The subsquare must be free to populate
    if ( !(sub.hasWall || sub.hasObstacle || sub.populated) ) {
        this.squares[squareNo].subsquares[subsquareNo].populated = true;
        sub.setArrow(0, mat);
        this.unusedArea -= area;
        mat.addSubsquare();

        //If end of mat is reached: check if new mat can be placed or if room is full,
        // if not revert and recurse
        if (mat.unusedArea == 0) {
            var squareList = [squareNo, squareNo-width, squareNo +1, squareNo-1, squareNo+width];
            
            if ( this.adjacentWall(squareList, subsquareNo) && ( this.unusedArea == 0 || this.findStart() ) ) {
                return true;
            } else  {
                this.unusedArea += area;
                mat.removeSubsquare();
                this.squares[squareNo].populated = false;
                this.squares[squareNo].subsquares[subsquareNo].setArrow(4, mat);
                if (added == true) {
                    this.squares[squareNo].clearSubsquares();
                }
                return false;
            }
        }

        //A quick check to see if square is now fully populated
        for ( var i = 0; i < 25; ++i) {
            var s = subsquares[i];
            if ( !(s.populated || s.hasWall || s.hasObstacle) ) {
                squareFull = false;
            }
        }
        this.squares[squareNo].populated = squareFull;

        //We first try to populate within the same square, then move to the adjacent squares
        //Up, inside same square
        if (u >= 0 && abort == false) {
            up = subsquares[u];
            if ( !up.hasWall && !up.hasObstacle && !up.populated 
                 && this.placeSubsquare(squareNo, u, mat, squareNo, subsquareNo) ) {
                this.squares[squareNo].subsquares[subsquareNo].setArrow(0, mat);
                return true;
            }
        }
        //Right within same square
        if ( (r < 25) && (r%5 != 0) && abort == false) {
            right = subsquares[r];
            if ( !right.hasWall && !right.hasObstacle && !right.populated 
                 && this.placeSubsquare(squareNo, r, mat, squareNo, subsquareNo) ) {
                this.squares[squareNo].subsquares[subsquareNo].setArrow(1, mat);
                return true;
            }
        }
        //Left within same square
        if ( (l >= 0) && (l%5 != 4) && abort == false) {
            left = subsquares[l];
            if ( !left.hasWall && !left.hasObstacle && !left.populated 
                 && this.placeSubsquare(squareNo, l, mat, squareNo, subsquareNo) ) {
                this.squares[squareNo].subsquares[subsquareNo].setArrow(2, mat);
                return true;
            }
        }
        //Down inside same square
        if ( (d < 25) && abort == false) {
            down = subsquares[d];
            if ( !down.hasWall && !down.hasObstacle && !down.populated 
                 && this.placeSubsquare(squareNo, d, mat, squareNo, subsquareNo) ) {
                this.squares[squareNo].subsquares[subsquareNo].setArrow(3, mat);
                return true;
            }
        }

        //Up into the adjacent square
        if (u < 0 && abort == false) {
            up = squares[squareNo-width];
            if ( up.reallyInside && !up.populated && this.placeSquare(squareNo-width, u+25, mat, squareNo, subsquareNo) ) {
                return true;
            }
        }

        //Right to next square
        if (r%5 == 0 && abort == false) {
            right = squares[squareNo+1];
            if ( right.reallyInside && !right.populated && this.placeSquare(squareNo+1, r-5, mat, squareNo, subsquareNo) ) {
                return true;
            }
        }

        //Left to previous square
        if ( (l == -1 || l%5 == 4) && abort == false) {
            left = squares[squareNo-1];
            if ( left.reallyInside && !left.populated && this.placeSquare(squareNo-1, l+5, mat, squareNo, subsquareNo) ) {
                return true;
            }
        }

        //Down to square below
        if (d > 24 && abort == false) {
            down = squares[squareNo + width];
            if ( down.reallyInside && !down.populated && this.placeSquare(squareNo+width, d-25, mat, squareNo, subsquareNo) ) {
                return true;
            }
        }

        //Could not place subsquare, reset and recurse
        this.unusedArea += area;
        mat.removeSubsquare();
        this.squares[squareNo].populated = false;
        this.squares[squareNo].subsquares[subsquareNo].populated = false;
        this.squares[squareNo].subsquares[subsquareNo].setArrow(4, mat);
    }

    //If a subsquare structure was constructed, remove it
    if (added == true) {
        this.squares[squareNo].clearSubsquares();
    }
    return false;
    //End of placeSubsquare
}

/**
 * Function moves all walls that are erroneously marked as being inside a square
 * to the adjacent square instead
**/
ResultGrid.prototype.moveWalls = function() {
    var leftWall = [0, 5, 10, 15, 20],
        rightWall = [4, 9, 14, 19, 24],
        upWall = [0, 1, 2, 3, 4],
        downWall = [20, 21, 22, 23, 24],
        squares = this.squares,
        width = this.squarewidth,
        len = squares.length-width, 
        square;

    for (var i = width; i <= len; ++i) {
        square = squares[i];
        if ( square.hasWall ) {
            var up = false,
                down = false,
                left = false, 
                right = false,
                //Finds neighboring squares
                u=squares[i-width],
                d=squares[i+width],
                l=squares[i-1],
                r=squares[i+1];

            //Checks for each direction whether the wall is movable.
            //Wall is movable if all 5 subsquares along one edge contain
            // wall
            if (square.movableWall(upWall) && 
                ( !u.insideRoom || (l.insideRoom && !l.hasWall && 
                                    r.insideRoom && !r.hasWall) ) )
                up = true; 
            if (square.movableWall(leftWall) && 
                ( !l.insideRoom || (u.insideRoom && !u.hasWall && 
                                    d.insideRoom && !d.hasWall) ) )
                left = true;
            if (square.movableWall(rightWall) && 
                ( !r.insideRoom || (u.insideRoom && !u.hasWall && 
                                    d.insideRoom && !d.hasWall) ) )
                right = true;  
            if (square.movableWall(downWall) && 
                ( !d.insideRoom || (l.insideRoom && !l.hasWall && 
                                    r.insideRoom && !r.hasWall) ) )
                down = true;

            //Shifts the movable walls to the adjacent square
            if (up) {
                this.squares[i].removeWall(upWall);
                this.squares[i-width].addWall(downWall);
            }
            if (right) {
                this.squares[i].removeWall(rightWall);
                this.squares[i+1].addWall(leftWall);
            }
            if (left) {
                this.squares[i].removeWall(leftWall);
                this.squares[i-1].addWall(rightWall);
            }
            if (down) {
                this.squares[i].removeWall(downWall);
                this.squares[i+width].addWall(upWall);
            }
        }
    }


    //Cannot set insideRoom in loop above, if we did only one wall adjacent
    // to a free space could be shifted
    for (var i = 0; i < squares.length; ++i) {
        square = squares[i];

        if(square.hasWall)
            this.squares[i].insideRoom = true;

        //Cleans up any leftover corners that are no longer connected to walls
        if (square.hasWall && i > width && i < len) {
            var clearable = true, 
                walls = false,
                sub = square.subsquares,
                u=squares[i-width],
                d=squares[i+width],
                l=squares[i-1],
                r=squares[i+1],
                area = 10*10;

            if ( !u.hasWall && !l.hasWall && sub[0].hasWall 
                 && !(sub[1].hasWall || sub[5].hasWall) ) {
                this.squares[i].subsquares[0].hasWall = false;
                this.squares[i].area += area;
            }
            if ( !u.hasWall && !r.hasWall && sub[4].hasWall
                 && !(sub[3].hasWall || sub[9].hasWall) ) {
                this.squares[i].subsquares[4].hasWall = false;
                this.squares[i].area += area;
            }
            if ( !d.hasWall && !l.hasWall && sub[20].hasWall
                 && !(sub[15].hasWall || sub[21].hasWall) ) {
                this.squares[i].subsquares[20].hasWall = false;
                this.squares[i].area += area;
            }
            if ( !r.hasWall && !d.hasWall && sub[24].hasWall
                 && !(sub[23].hasWall || sub[19].hasWall) ) {
                this.squares[i].subsquares[24].hasWall = false;
                this.squares[i].area += area;
            }

            //If square no longer contains obstacles or walls:
            // Remove subsquare structure
            for (var j=0; j<25; ++j) {
                if (square.subsquares[j].hasWall) {
                    clearable = false;
                    walls = true;
                }
                else if (square.subsquares[j].hasObstacle) {
                    clearable = false;
                }
            }
            if (clearable) {
                this.squares[i].clearSubsquares();
            }
        }
        //Shifting walls frees up usable space
        this.area += square.area;

        //Checks if square is inside room or merely has walls
        if (square.hasWall) {
            var really = false;
            for (var j = 0; j < 25; ++j) {
                if ( square.subsquares[j].insideRoom && !square.subsquares[j].hasWall ) {
                    really = true;
                    break;
                }
            }
            this.squares[i].reallyInside = really;
        }

    }

    console.log("Availabe area: " + this.area + " square cm");
    this.area -= 3000;
    this.area -= this.area%10000;
    this.unusedArea = this.area;
    console.log("Usable area: " + this.area + " square cm");

    //End of moveWalls
}



/**
 * Function checks whether there is piece of wall which is adjacent in the given direction
 * @param squareList - List of square indexes involved [self, up, right, left, down]
 * @param subsquareNo - The subsquare to be evaluated, -1 if no subsquare structure in square 
**/
ResultGrid.prototype.adjacentWall = function (squareList, subsquareNo) {
    var squares = this.squares,
        square = squares[squareList[0]],
        targetSubsquares,
        wall,
        targetSquare;

    //If the square calling the function does not have subsquare structure
    if(subsquareNo == -1) {

        for (var direction = 1; direction < 5; direction++) {
            
            //Checks for walls in adjacent square above-right-left-down
            if(direction == 1) {
                wall = [20, 21, 22, 23, 24]; 
            }
            else if (direction == 2) {
                wall = [0, 5, 10, 15, 20];
            }
            else if (direction == 3) {
                wall = [4, 9, 14, 19, 24];
            }
            else if (direction == 4) {
                wall = [0, 1, 2, 3, 4];
            }
            targetSquare = squares[squareList[direction]];

            if (targetSquare.hasWall) {

                targetSubsquares = targetSquare.subsquares;

                for (var i = 0; i < 5; ++i) {
                    var target = wall[i];
                    if (targetSubsquares[target].hasWall)
                        return true;
                }
            }
        }
    } 
    //Else executes if subsquare structure exists
    else {
        var arr = square.subsquares,
            subsquare,
            up, 
            down, 
            left, 
            right,
            upSquare = squares[squareList[1]],
            rightSquare = squares[squareList[2]],
            leftSquare = squares[squareList[3]],
            downSquare = squares[squareList[4]];


        subsquare = arr[subsquareNo];

        //The subsquare we're checking FROM must be free
        if ( subsquare.insideRoom  && 
             !subsquare.hasWall && !subsquare.hasObstacle ) {

            //Finds neighboring subsquares inside own square 
            (subsquareNo>4)?up=arr[subsquareNo-5]:up=null;
            (subsquareNo<20)?down=arr[subsquareNo+5]:down=null;
            ((subsquareNo%5)!=0)?left=arr[subsquareNo-1]:left=null;
            ((subsquareNo%5)!=4)?right=arr[subsquareNo+1]:right=null;

            //If any neighboring squares have walls
            if ( (up && up.hasWall) || 
                 (down && down.hasWall) || 
                 (right && right.hasWall) || 
                 (left && left.hasWall) ) {
                return true;
            } 
            //or if subsquare directly to the top has wall
            else if ( !up && upSquare.hasWall && 
                        upSquare.subsquares[subsquareNo+20].hasWall) {
                return true;
            }
            //or if subsquare directly to the right has wall
            else if ( !right && rightSquare.hasWall && 
                        rightSquare.subsquares[subsquareNo-4].hasWall) {
                return true;

            }
            //or if subsquare directly to the left has wall
            else if ( !left && leftSquare.hasWall && 
                        leftSquare.subsquares[subsquareNo+4].hasWall) {
                return true;
            }   
            //or if subsquare directly down has wall
            else if ( !down && downSquare.hasWall && 
                        downSquare.subsquares[subsquareNo-20].hasWall) {
                return true;
            }
        }
    }

    return false;

    //End of adjacentWall
}

/**
 * Function adds obstacles to the datastructure. 
 * DOES NOT check whether obstacles are inside room, this responsibility
 * is left to the user!
**/
ResultGrid.prototype.addObstacles = function() {

    var list = obstacles.obstacleSet,
        len = list.length,
        width = this.squarewidth,
        squares = this.squares,
        obstacle,
        startSquare,
        currentSquare,
        x,
        y, 
        xdim,
        ydim,
        xoffset,
        yoffset,
        subsquares,
        sub, 
        square;

    for (var i = 0; i < len; ++i) {

        obstacle = list[i];
        x = obstacle.attr("x");
        y = obstacle.attr("y");
        xdim = obstacle.attr("width")/10;
        ydim = obstacle.attr("height")/10;
        startSquare = Math.floor(x/50) + (Math.floor(y/50) * width);
        currentSquare = startSquare;
        xoffset = x%50;
        yoffset = y%50,
        area = 10*10;

        //Traverses obstacle as a two-dimensional array of subssquares
        // and toggles hasObstacle in each subsquare
        for (var j = 0; j < ydim; ++j) {

            for (var k = 0; k < xdim; ++k) {
                square = squares[currentSquare];

                //Creates subsquare structure if there is none
                //(Squares with walls will already have a subsquare structure)
                if (square.subsquares.length == 0) {
                    for (var n = 0; n < 25; ++n) {
                        var xtemp = square.xpos + (n%5)*10,
                            ytemp = square.ypos + Math.floor(n/5)*10, 
                            s = new Subsquare(xtemp, ytemp, this.paper, null);

                        s.insideRoom = true;
                        this.squares[currentSquare].subsquares.push(s);
                    }
                }
                //Finds subsquare number
                sub = yoffset/2+xoffset/10;
                //Marks subsquare as unavailable and decrements area available
                this.squares[currentSquare].subsquares[sub].hasObstacle = true;
                this.squares[currentSquare].area -= area;
                this.squares[currentSquare].hasObstacles = true;

                //Moves to next subsquare on x-axis
                xoffset = (xoffset + 10)%50;
                //Changes to next square when necessary
                if (xoffset == 0) {
                    currentSquare += 1;
                }
            }
            xoffset = x%50;
            //x-axis loop finished, return to start and repeat one line below
            currentSquare = startSquare;
            yoffset = (yoffset + 10)%50;
            //Changes to next row of squares
            if (yoffset == 0) {
                currentSquare += width;
                startSquare = currentSquare;
            }

        }
    }
    //End of addObstacles
}

/**
 * Sets supply point if one has been set by user. The supply point defines
 * a wall, and all starting points must be adjacent to this wall.
**/
ResultGrid.prototype.setSupplyPoint = function () {

    var list = obstacles.obstacleSet,
        texts = obstacles.txtSet,
        len = obstacles.obstacleSet.length, 
        walls = ourRoom.walls,
        wallLength = walls.length,
        wall,
        supply = obstacles.supplyPoint,
        xmin,
        xmax,
        ymin,
        ymax,
        x1,
        x2, 
        y1, 
        y2,
        x,
        y;

    for (var i = 0; i < len; ++i) {
        if (list[i].id == supply) {
            x = list[i].attr("x");
            y = list[i].attr("y");

            //Remvoves supplyPoint so that it doesn't act as obstacle (take up space etc.)
            obstacles.obstacleSet[i].remove();
            obstacles.txtSet[i].remove()

            //Why 11? Because of the x/y offset when moving the room and because
            // the supply point itself has dimensions 10*10
            //And, as importantly, these go to 11
            for (var l = 0; l < wallLength; ++l) {

                wall = walls[l];
                x1 = wall.attrs.path[0][1];
                x2 = wall.attrs.path[1][1];
                y1 = wall.attrs.path[0][2];
                y2 = wall.attrs.path[1][2];
                xmin = (x1 < x2) ? (x1 - 11) : (x2 - 11);
                xmax = (x1 < x2) ? (x2 + 11) : (x1 + 11);
                ymin = (y1 < y2) ? (y1 - 11) : (y2 - 11);
                ymax = (y1 < y2) ? (y2 + 11) : (y1 + 11);

                //+/-40 to allow for whole square inside boundaries
                if (x < xmax && x > xmin && y < ymax && y > ymin) {
                    var arr = [xmin-40, xmax+40, ymin-40, ymax+40];
                    return arr;
                }
            } 
        }
    }
    //End of setSupplyPoint    
}
