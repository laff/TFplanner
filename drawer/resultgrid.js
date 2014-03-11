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

    //this.findDimension();

    //No scaling of image
    this.path = pathString;

    this.populateSquares();
    this.moveWalls();
    this.draw();

    //this.draw(this.height, this.width, this.path);

    this.findStart();
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
        else if (square.insideRoom && (square.hasWall || square.hasObstacles) ) {
            for(var j=0;j<25; ++j) {
                subsquare = subsquares[j];
                if (subsquare.hasWall) 
                    this.squares[i].subsquares[j].rect.attr({
                        'fill': "magenta",
                        'fill-opacity': 0.5
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

/*
THIS FUNCTION IS MOVED TO 'grid.js' (named 'moveRoom')
//Gets wall elements from ourroom and translates to new grid 
ResultGrid.prototype.getWalls = function (offsetX, offsetY, scale) {
    
    var scalefactor = (scale != null) ? scale : 1;

    var walls = ourRoom.walls,
        paper = this.paper,
        size = this.size,
        width = 0, 
        height = 0,
        numberOfWalls = walls.length,
        pathString, 
        tempString,
        xstart = (walls[0].attrs.path[0][1]),
        ystart = (walls[0].attrs.path[0][2]),
        ycurrent,
        path;

    pathString = new String("M "+xstart + ", "+ ystart);

    for (var i = 1; i < numberOfWalls; ++i) {
        xcurrent = (walls[i].attrs.path[0][1]);
        ycurrent = (walls[i].attrs.path[0][2]);

        tempString = " L" + xcurrent + ", " + ycurrent;
        pathString += tempString;
    }

    tempString = " Z";
    pathString += tempString;
    path = paper.path(pathString);
    path.attr({
        'stroke-width':     3.0,
        'stroke':           "Black",
        'stroke-opacity':   1.0 
    });

    return pathString;
    //End of getWalls()
}

*/

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
    height = height +100 + (50-height%50);
    width = width + 100 +(50-width%50);
    this.squareheight = height/50;
    this.squarewidth = width/50;

    for (var i = 0; i < height; i += ydim) {
        for (var j = 0; j < width; j += xdim) {
            square = new Square(j, i, path, paper);
            squares[length++] = square;
        }
    }
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
        
        if (square.insideRoom && !square.populated) {
            
            if (!square.hasWall) {

                //Neighbouring squares 
                var up = squares[i-width], 
                    left =  squares[i-1], 
                    right = squares[i+1], 
                    down = squares[i+width],
                    arr;

                if (up.hasWall && ( up.subsquares[20].hasWall ||
                                    up.subsquares[21].hasWall ||
                                    up.subsquares[22].hasWall ||
                                    up.subsquares[23].hasWall ||
                                    up.subsquares[24].hasWall ) ) {
                    if( this.placeMat(i, 0) )
                        return true;
                } 
                else if (left.hasWall && ( left.subsquares[4].hasWall ||
                                           left.subsquares[9].hasWall ||
                                           left.subsquares[14].hasWall ||
                                           left.subsquares[19].hasWall ||
                                           left.subsquares[24].hasWall ) ) {
                    if (this.placeMat(i, 0) )
                        return true;
                } 
                else if (right.hasWall && ( right.subsquares[0].hasWall ||
                                            right.subsquares[5].hasWall ||
                                            right.subsquares[10].hasWall ||
                                            right.subsquares[15].hasWall ||
                                            right.subsquares[20].hasWall ) ) {
                    if( this.placeMat(i, 0) )
                        return true;
                } 
                else if (down.hasWall && ( down.subsquares[0].hasWall ||
                                           down.subsquares[1].hasWall ||
                                           down.subsquares[2].hasWall ||
                                           down.subsquares[3].hasWall ||
                                           down.subsquares[4].hasWall ) ) {
                    if( this.placeMat(i, 0) )
                        return true;
                }

            } else {
                var arr = square.subsquares,
                    subsquare,
                    up, 
                    down, 
                    left, 
                    right;
                for (var j=0; j < 25; ++j) {

                    subsquare = arr[j];
                    if ( subsquare.insideRoom  && !subsquare.populated && 
                         !subsquare.hasWall && !subsquare.hasObstacle ) {

                        //Finds neighboring subsquares inside own square 
                        (j>4)?up=arr[j-5]:up=null;
                        (j<20)?down=arr[j+5]:down=null;
                        ((j%5)!=0)?left=arr[j-1]:left=null;
                        ((j%5)!=4)?right=arr[j+1]:right=null;

                        //If any neighboring squares have walls
                        if ( (up && up.hasWall) || 
                             (down && down.hasWall) || 
                             (right && right.hasWall) || 
                             (left && left.hasWall) ) {

                            subsquare.rect.attr({
                                'fill': "cyan",
                                'fill-opacity': .5
                            });
                        } 
                        //or if subsquare directly to the top has wall
                        else if ( !up && squares[i-width].hasWall && 
                                    squares[i-width].subsquares[j+20].hasWall) {
                            subsquare.rect.attr({
                                'fill': "magenta",
                                'fill-opacity': .5
                            });
                        }
                        //or if subsquare directly to the top has wall
                        else if ( !left && squares[i-1].hasWall && 
                                    squares[i-1].subsquares[j+4].hasWall) {
                            subsquare.rect.attr({
                                'fill': "magenta",
                                'fill-opacity': .5
                            });
                        }
                        //or if subsquare directly to the top has wall
                        else if ( !right && squares[i+1].hasWall && 
                                    squares[i+1].subsquares[j-4].hasWall) {
                            subsquare.rect.attr({
                                'fill': "magenta",
                                'fill-opacity': .5
                            });
                        }   
                        //or if subsquare directly to the top has wall
                        else if ( !down && squares[i+width].hasWall && 
                                    squares[i+width].subsquares[j-20].hasWall) {
                            subsquare.rect.attr({
                                'fill': "magenta",
                                'fill-opacity': .5
                            });
                        }
                    }
                }
            }        
        }
    }
    return false;
    //End of findStart()
}

ResultGrid.prototype.placeMat = function (squareNo, subsquareNo) {
    var lengths = [1200, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100],
        len = lengths.length,
        i = 0,
        mat = new HeatingMat(lengths[i]);

    while (i < len) {
        if ( (lengths[i]*50) <= this.unusedArea && 
             this.placeSquare(squareNo, subsquareNo, mat) ) {
            return true;
         } else {
            mat = new HeatingMat(lengths[++i]);
         }
    }

    return false;
}


//Recursive loveliness. Places squares until mat is full, then tries to
// place if area is not full
ResultGrid.prototype.placeSquare = function (squareNo, subsquareNo, mat) {
    var squares = this.squares,
        square = squares[squareNo],
        width = this.squarewidth,
        height = this.squareheight,
        area = 50*50;

    //The whole mat has been successfully placed, return true
    if (mat.unusedArea == 0){
        
        if (this.unusedArea == 0 )
            return true;
        else if ( this.findStart() ) {
            return true;
        }
    }

    if (square.hasWall || square.hasObstacles)
        return false;
        //this.placeSubsquare(squareNo, subsquareNo, mat)
    else {

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
        square.setArrow(4);

        //Tries to populate next square, in order up-right-left-down
        if (up.insideRoom && !up.populated) {
            if ( !up.hasObstacles && !up.hasWall) {
                if ( this.placeSquare(u, 0, mat) ) {
                    this.squares[squareNo].setArrow(0);
                    return true;
                }                 
            } else {
                for (var i = 20; i < 25; ++i) {
                    if ( this.placeSquare(u, i, mat) )
                        return true;
                }
            }
        }
        if (right.insideRoom && !right.populated) {
            if ( !right.hasObstacles && !right.hasWall ) {
                if ( this.placeSquare(r, 0, mat) ) {
                    this.squares[squareNo].setArrow(1);
                    return true;
                }                  
            } else {
                for (var i = 4; i < 25; i += 5) {
                    if ( this.placeSquare(r, i, mat) )
                        return true;
                }
            }
        }
        if (left.insideRoom && !left.populated) {
            if ( !left.hasObstacles && !left.hasWall ) {
                if ( this.placeSquare(l, 0, mat) ) {
                    this.squares[squareNo].setArrow(2);
                    return true;
                }                  
            } else {
                for (var i = 0; i < 21; i += 5) {
                    if ( this.placeSquare(l, i, mat) )
                        return true;
                }
            }
        }
        if (down.insideRoom && !down.populated) {
            if ( !down.hasObstacles && !down.hasWall ) {
                if ( this.placeSquare(d, 0, mat) ) {
                    this.squares[squareNo].setArrow(3);
                    return true;
                }                
            } else {
                for (var i = 0; i < 5; ++i) {
                    if ( this.placeSquare(d, i, mat) )
                        return true;
                }
            }
        }

        //If function comes to this point, attempt has failed.
        //Reset and revert to previous square
        this.unusedArea += area;
        square.arrow.remove();
        this.squares[squareNo].populated = false;
        mat.removeSquare();
        return false;
    }

}

ResultGrid.prototype.placeSubsquare = function(squareNo, subsquareNo, mat) {
    return true;

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
    }
    console.log("Availabe area: " + this.area + " square cm");
    this.area -= this.area%10000;
    this.unusedArea = this.area;
    console.log("Usable area: " + this.area + " square cm");
}

ResultGrid.prototype.legalEnd = function (squareNo, subsquareNo) {

}
