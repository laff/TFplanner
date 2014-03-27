/**
 * Constructor for the result display
 * @param pathString - The room presented as ONE path.
**/ 
function ResultGrid(pathString) {
    //this.size = 5;
    this.height = grid.resHeight;
    this.width = grid.resWidth;
    //this.offsetX = 0;
    //this.offsetY = 0;
    //this.scale = 1;
    this.paper = grid.paper; //Raphael(document.getElementById('canvas_container'));
    this.squares = [];
    this.area = 0;
    this.unusedArea = 0;
    this.squarewidth = 0;
    this.squareheight= 0;
    this.attempts = 0;

    //this.findDimension();

    //No scaling of image
    this.path = pathString;

    this.populateSquares();
    this.moveWalls();


    // Color choosar
    this.colorIndex = 0;
    this.matColors = [
        '#d3d3d3',
        '#a8a8a8', 
        '#7e7e7e',
        '#545454'
    ];
    this.currentColor;


    //this.draw(this.height, this.width, this.path);

    this.findStart();

    console.log(this.squares[38]);


    //this.draw(this.height, this.width, this.path);
}


/**
 *  Drawing mats by calling fancy functions on all the squares.
**/
ResultGrid.prototype.displayMats = function() {


    var mats = mattur.list,
        squares = this.squares;

    for (var i = 0; i < mats.length; i++) {

        var tmpDirection = null,
            j = (mats[i].length);
        while  (j--) { //(var j = 0; j < mats[i].length; j++) {


            if (j == 0) {
                squares[mats[i][j]].direction = null;

            }
            squares[mats[i][j]].drawMatline(tmpDirection);

            tmpDirection = squares[mats[i][j]].direction;

        }
    }
}

/*
OBS: Function(ality) moved to 'grid.js' and is cloned with the 'getWalls'-function, 
and now appears as 'moveRoom()'. 
The use of grid`s class-variables for width and height might be a bit dirty!

//Function finds the height and width of the figure, as well as the height
// and width of the screen. Also sets scale of image based on relation
// between screen height/width and room height/width
ResultGrid.prototype.findDimension = function() {
    var minX = 1000000, 
        maxX = 0, 
        minY = 1000000, 
        maxY = 0, 
        walls = ourRoom.walls,
        numberOfWalls = walls.length,
        yscale,
        xscale,
        canvas = $('#canvas_container');

    for (var i = 0; i < numberOfWalls; ++i)
    {
        //Find largest and smallest X value
        if ( (walls[i].attrs.path[0][1]) > maxX )
            maxX = walls[i].attrs.path[0][1];

        if ( (walls[i].attrs.path[1][1]) > maxX)
            maxX = walls[i].attrs.path[1][1];

        if ( (walls[i].attrs.path[0][1]) < minX )
            minX = walls[i].attrs.path[0][1];

        if ( (walls[i].attrs.path[1][1]) < minX )
            minX = walls[i].attrs.path[1][1];

        //Find smallest and largest Y value
        if ( (walls[i].attrs.path[0][2]) > maxY )
            maxY = walls[i].attrs.path[0][2];

        if ( (walls[i].attrs.path[1][2]) > maxY )
            maxY = walls[i].attrs.path[1][2];

        if ( (walls[i].attrs.path[0][2]) < minY )
            minY = walls[i].attrs.path[0][2];

        if ( (walls[i].attrs.path[1][2]) < minY )
            minY = walls[i].attrs.path[1][2];
    } 

    //Sets ResultGrid variables
    this.offsetX = minX - 49;
    this.offsetY = minY - 49;
    this.width = (maxX - minX);
    this.height = (maxY - minY);

    //Finds a scale for final room, used to draw result
    //NOT CURRENTLY USED FOR ANYTHING
    xscale = canvas.width()/this.width,
    yscale = canvas.height()/this.height;
    this.scale = (xscale < yscale)?xscale:yscale;
    this.scale = this.scale.toFixed();
  //  this.paper.setViewBox(0, 0, (this.width*this.scale), (this.height*this.scale), true);
}
*/


//Draws a scaled version of the path. VERY UNFINISHED!
// OBS: Parameters currently not being used!
ResultGrid.prototype.draw = function(h, w, path) {
    var paper = this.paper,
        canvas = $('#canvas_container'), 
        //xscale = canvas.width()/w,
        //yscale = canvas.height()/h,
        squares = this.squares,
        len = squares.length,
        square,
        subsquares, 
        subsquare;

    for (var i = 0; i < len; ++i) {

        square = squares[i];
        subsquares = square.subsquares;

        if (!square.insideRoom) {
            this.squares[i].rect.attr({
                'fill': "red",
                'fill-opacity': 0.8
            });
        } 
        else if (square.insideRoom && !square.reallyInside) {
            this.squares[i].rect.attr({
                'fill': "grey",
                'fill-opacity': 0.5
            });
        }
        else if (square.insideRoom && square.subsquares.length != 0 ) {

            for(var j=0;j<25; ++j) {
                subsquare = subsquares[j];
                if (subsquare.hasWall) 
                    this.squares[i].subsquares[j].rect.attr({
                        'fill': "magenta",
                        'fill-opacity': 0.5
                    });
                else if (subsquare.populated)
                    this.squares[i].subsquares[j].rect.attr({
                        'fill': "green",
                        'fill-opacity': 0.3
                    });
                else if (subsquare.insideRoom)
                    this.squares[i].subsquares[j].rect.attr({
                        'fill': "cyan",
                        'fill-opacity': 0.3
                    });
                else 
                    this.squares[i].subsquares[j].rect.attr({
                        'fill': "yellow",
                        'fill-opacity': 0.3
                    });
            } 
        } else {
            this.squares[i].rect.attr({
                'fill': "green",
                'fill-opacity': 0.8
            });
        }
    }
}


//Divides the area into suqares, does wall and obstacle detection
ResultGrid.prototype.populateSquares = function() {
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
    // and grid is padded so that we don't get partial squares 
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

    this.addObstacles();
}


ResultGrid.prototype.clear = function () {

    //Cleans up arrays
    var squares = this.squares,
        square,
        arr;
    while (squares.length > 0) {
        square = squares.pop();
        if (square.subsquares.length != 0) {
            square.clearSubsquares();
        } 
    }

    //Removes the drawing
    this.paper.remove();
}


//Function finds the next valid starpoint for a mat
ResultGrid.prototype.findStart = function() {
    var squares = this.squares, 
        len = squares.length,
        width = this.squarewidth,
        height = this.squareheight;

    for (var i = 0; i < len; ++i) {
        var square = squares[i];
        
        if (square.reallyInside && !square.populated) {

            //Neighbouring square numbers 
            var squareList = [i, i-width, i+1, i-1, i+width];
            
            if (square.subsquares.length == 0) {
           //     console.log("Placing mat in square " + i);

                //Criteria: If adjacent to a wall and recursive mat placement works,
                // return true
                if ( this.adjacentWall(squareList, -1) ) {
                    if ( this.placeMat(i, 0) ) {
                        return true;
                    }
                }

            } 
            else {
                //Checks for each subsquare if it has adjacent wall and recursive mat
                // placement 
                for (var j=0; j < 25; ++j) {
                    if ( this.adjacentWall(squareList, j) ) {
                        if (this.placeMat(i, 0)) {
                            return true;
                        } 
                    }           
                }        
            }
        }
    }
    return false;
    //End of findStart()
}


//Function tries to place mats in decreasing length
ResultGrid.prototype.placeMat = function (squareNo, subsquareNo) {

    //var l = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1200],
    var mat;

    //TESTING: Used for getting the lengths available for chosen mat.    
    var l = [];
    for (var i = 0; i < options.validMat.products.length; i++) {
        // Length of mats is stored in meters, we want it in cm.
        l[i] = options.validMat.products[i].length*100;
    }

    console.log("Lengths available: "+l);

    // Picks color, then increments.
    this.currentColor = this.pickColor();
    this.colorIndex++;

    while (l.length > 0) {
        var length = l.pop(),
            c = length * 50;

        if (c <= this.unusedArea) {
            mat = new HeatingMat(length, null, this.currentColor);
            mat.productNr = options.validMat.products[l.length].number;
            //console.log("Trying " + length/100 + "m at square " + squareNo);
            if ( this.placeSquare(squareNo, subsquareNo, mat, 0, -1) )
                return true;
        }
    }

    // decrements if returnring false.
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


//Recursive loveliness. Places squares until mat is full, then tries to
// place new mat if area is not full
ResultGrid.prototype.placeSquare = function (squareNo, subsquareNo, mat, lastSquareNo, lastSubsquareNo) {
    var squares = this.squares,
        square = squares[squareNo],
        width = this.squarewidth,
        height = this.squareheight,
        area = 50*50,
        timeout = Date.now()/1000;

    //The recursive placement is taking too long, abort mat
    if ( (timeout - mat.timestamp) > mat.validPeriod)
        return false;

    //The whole mat has been successfully placed, return true
    if (mat.unusedArea == 0) {
        var squareList = [lastSquareNo, lastSquareNo-width, lastSquareNo +1, lastSquareNo-1, lastSquareNo+width];

/*
        //Test procedure, only tries 15 times so we're not stuck with infinite loop
        if (this.attempts++ == 25) { 
            return true;
        }
*/
        if ( this.adjacentWall(squareList, lastSubsquareNo) && ( this.unusedArea == 0 || this.findStart() ) ) {

                return true;
            //}
        }
        else 
            return false;
    }

    if ( !( (square.subsquares.length > 0) || (mat.unusedArea < area) ) ) {

        //Neighboring squares and their numbers in squares array
        var u = squareNo-width,
            l = squareNo-1,
            r = squareNo+1,
            d = squareNo+width,
            up = squares[u], 
            left =  squares[l], 
            right = squares[r], 
            down = squares[d];
            

        this.squares[squareNo].populated = true;
        mat.addSquare();
        this.unusedArea -= area;
        //Olaf&Christian's .
        square.setArrow(4, mat, squareNo);

        //Tries to populate next square, in order up-right-left-down
        if (up.reallyInside && !up.populated) {
            if ( !up.hasObstacles && !up.hasWall) {
                if ( this.placeSquare(u, 0, mat, squareNo, -1) ) {
                    this.squares[squareNo].setArrow(0, mat, squareNo);
                    return true;
                }                 
            } else {
                for (var i = 20; i < 25; ++i) {
                    if ( this.placeSquare(u, i, mat, squareNo, lastSubsquareNo) )
                        return true;
                }
            }
        }
        if (right.reallyInside && !right.populated) {
            if ( !right.hasObstacles && !right.hasWall ) {
                if ( this.placeSquare(r, 0, mat, squareNo, -1) ) {
                    this.squares[squareNo].setArrow(1, mat, squareNo);
                    return true;
                }                  
            } else {
                for (var i = 0; i < 21; i += 5) {
                    if ( this.placeSquare(r, i, mat, squareNo, lastSubsquareNo) )
                        return true;
                }
            }
        }
        if (left.reallyInside && !left.populated) {
            if ( !left.hasObstacles && !left.hasWall ) {
                if ( this.placeSquare(l, 0, mat, squareNo, -1) ) {
                    this.squares[squareNo].setArrow(2, mat, squareNo);
                    return true;
                }                  
            } else {
                for (var i = 4; i < 25; i += 5) {
                    if ( this.placeSquare(l, i, mat, squareNo, lastSubsquareNo) )
                        return true;
                }
            }
        }
        if (down.reallyInside && !down.populated) {
            if ( !down.hasObstacles && !down.hasWall ) {
                if ( this.placeSquare(d, 0, mat, squareNo, -1) ) {
                    this.squares[squareNo].setArrow(3, mat, squareNo);
                    return true;
                }                
            } else {
                for (var i = 0; i < 5; ++i) {
                    if ( this.placeSquare(d, i, mat, squareNo, lastSubsquareNo) )
                        return true;
                }
            }
        }


        //If function comes to this point, attempt has failed.
        //Reset and revert to previous square
        this.unusedArea += area;
        square.arrows.remove();
        this.squares[squareNo].populated = false;
        mat.removeSquare();
    } else if ( this.placeSubsquare(squareNo, subsquareNo, mat, lastSquareNo, lastSubsquareNo) ) {
        return true;
    }
    return false;

    //End of placeSquare
}

ResultGrid.prototype.placeSubsquare = function(squareNo, subsquareNo, mat, lastSquareNo, lastSubsquareNo) {

    var squares = this.squares,
        square = squares[squareNo],
        subsquares = square.subsquares,
        added = false,
        abort = false,
        timeout = Date.now()/1000;

    //The recursive placement is taking too long, abort mat
    //Simply returning false does not work due to asynchronous nature
    if ( (timeout - mat.timestamp) > mat.validPeriod) {
        abort = true;
    }

    //Could happen if function is called because mat unused area is less than a full square
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
        suqareFull = true,
        u = subsquareNo-5,
        l = subsquareNo-1,
        r = subsquareNo+1,
        d = subsquareNo+5,
        up = null, 
        left = null, 
        right = null, 
        down = null;

    if (mat.unusedArea == 0) {
        var squareList = [lastSquareNo, lastSquareNo-width, lastSquareNo +1, lastSquareNo-1, lastSquareNo+width];
        
        if ( this.adjacentWall(squareList, lastSubsquareNo) && ( this.unusedArea == 0 || this.findStart() ) ) {
            return true;
        } else  {
            return false;
        }
    }
   // console.log(squareNo + " " + subsquareNo + " last: " + lastSquareNo + " " + lastSubsquareNo);


    //The subsquare must be free to populate
    if ( !(sub.hasWall || sub.hasObstacle || sub.populated) ) {
        this.squares[squareNo].subsquares[subsquareNo].populated = true;
        sub.setArrow(0, mat);
        this.unusedArea -= area;
        mat.addSubsquare();

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
                return true;
            }
        }
        //Right within same square
        if (r < 25 && r%5 != 0 && abort == false) {
            right = subsquares[r];
            if ( !right.hasWall && !right.hasObstacle && !right.populated 
                 && this.placeSubsquare(squareNo, r, mat, squareNo, subsquareNo) ) {
                return true;
            }
        }
        //Left within same square
        if (l >= 0 && l%5 != 4 && abort == false) {
            left = subsquares[l];
            if ( !left.hasWall && !left.hasObstacle && !left.populated 
                 && this.placeSubsquare(squareNo, l, mat, squareNo, subsquareNo) ) {
                return true;
            }
        }
        //Down inside same square
        if (d < 25 && abort == false) {
            down = subsquares[d];
            if ( !down.hasWall && !down.hasObstacle && !down.populated 
                 && this.placeSubsquare(squareNo, d, mat, squareNo, subsquareNo) ) {
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
        if (l == -1 || l%5 == 4 && abort == false) {
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

    if (added == true) {
        this.squares[squareNo].clearSubsquares();
    }
    return false;
    //End of placeSubsquare
}


//Function moves all walls that are erroneously marked as being inside a square
// to the adjacent square instead
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

        //Cleans up any left corners that are no longer connected to walls
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
            for (var j=0; j<25; ++j) {
                if (square.subsquares[j].hasWall) {
                    clearable = false;
                    walls = true;
                }
                else if (square.subsquares[j].hasObstacle)
                    clearable = false
            }
            if (clearable)
                this.squares[i].clearSubsquares();
        }
        this.area += square.area;

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



//Function checks whether there is piece of wall which is adjacent in the given direction
ResultGrid.prototype.adjacentWall = function (squareList, subsquareNo) {
    var squares = this.squares,
        square = squares[squareList[0]],
        targetSubsquares,
        wall,
        targetSquare;

    //No walls in square that calls function
    if(subsquareNo == -1 || square.subsquares.length == 0) {

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
    } else {
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


//Function adds obstacles to the datastructure. 
//DOES NOT check whether obstacles are inside room, this responsibility
// is left to the user
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
        yoffset = y%50;

        //Traverses obstacle as a two-dimensional array
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
                //Subsquare number
                sub = yoffset/2+xoffset/10;
                this.squares[currentSquare].subsquares[sub].hasObstacle = true;
                this.squares[currentSquare].area -= 100;
                this.squares[currentSquare].hasObstacles = true;

                //Moves to next square on x-axis
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
