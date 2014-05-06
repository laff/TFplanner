/**
 * @class Creating the result display
 * @param pathString - The room presented as ONE path.
**/ 
function ResultGrid(pathString) {
    this.height = TFplanner.grid.resHeight;
    this.width = TFplanner.grid.resWidth;
    this.paper = TFplanner.grid.paper;
    
    this.squares = [];
    this.startSquares = [];
    this.squarewidth = 0;
    this.squareheight= 0;
    this.area = 0;
    this.unusedArea = 0;
    //Validity period = 3 minutes/180000ms
    this.validPeriod = 180000;
    //Squarewidth and squareheight are the number
    // of squares high and wide the structure is
    this.path = pathString;
    this.chosenMats = [];
    // Color palette
    this.colorIndex = 0;
    this.matColors = [
        '#d3d3d3',
        '#a8a8a8', 
        '#7e7e7e',
        '#545454'
    ];
    this.currentColor = null;

    //Functionality to prepare data structure
    this.addSquares();
}

/**
 * Function that invokes the functionalites associated with the mat placements / guide.
**/
ResultGrid.prototype.calculateGuide = function () {

    var opts = TFplanner.options,
        that = this,

    /**
     * Function creates an array of the squares that are adjacent to a wall, which
     * gives a performance boost to findStart() 
    **/
    createStartPoints = function() {

        var square,
            width = that.squarewidth,
            len = that.squares.length - width, 
            supply = that.supplyPoint,
            squareList;

        for (var i = width; i < len; ++i) {
            square = that.squares[i];
            //If not inside the supply boundaries we can skip to next square
            if (supply && (square.xpos <= supply[0] || square.xpos >= supply[1] || 
                square.ypos < supply[2] || square.ypos >= supply[3])) {
                continue;
            }
            squareList = [i, i-width, i+1, i-1, i+width];
            if (that.adjacentWall(squareList, -1) && square.reallyInside) {
                that.startSquares.push(i);
            }
        }
    };

    this.supplyPoint = this.setSupplyPoint();
    this.addObstacles();
    this.moveWalls();
    createStartPoints();
    this.timestamp = Date.now();

    //Starts to populate the data structure
    if (this.findStart()) {
        opts.updateProgress(true, true);
    } else {
        opts.updateProgress(true, false);
    }
};

/**
 * Function creates a square/data structure
**/
ResultGrid.prototype.addSquares = function() {

    var xdim = 50, 
        ydim = 50,
        width = this.width,
        height = this.height,
        length = 0,
        square;

    // The grid is slightly larger than the figure, 
    // and grid is padded to avoid getting partial squares 
    height = height + 150 + (50 - height % 50);
    width = width + 150 + (50 - width % 50);
    this.squareheight = height/50;
    this.squarewidth = width/50;

    for (var i = 0; i < height; i += ydim) {
        for (var j = 0; j < width; j += xdim) {
            square = new Square(j, i, this.path, this.paper, length+1);
            this.squares[length++] = square;
        }
    }

    TFplanner.options.updateProgress(false);
};

/**
 * Clears the data structure and removes the drawn elements
**/
ResultGrid.prototype.clear = function() {

    var square;

    while (this.squares.length > 0) {
        square = this.squares.pop();

        if (square.subsquares.length != 0) {
            square.clearSubsquares();
        } 
    }
    //Removes the drawing
    this.paper.remove();
};

/**
 * Function finds the next valid starting square for a mat, then
 * calls placeMat to start the placement process
 * @return false if 'timedOut' or no start is found
**/
ResultGrid.prototype.findStart = function() {

    var width = this.squarewidth,
        supply = this.supplyPoint,
        index,
        square,
        squareList,
        xmin = null,
        xmax = null,
        ymin = null,
        ymax = null;

    // If no solution is found within alotted time, abort
    if ((Date.now() - this.timestamp) > this.validPeriod) {
        return false;
    }
 
    if (supply) {
        xmin = supply[0];
        xmax = supply[1];
        ymin = supply[2];
        ymax = supply[3];
    }
 
    for (var i = 0, ii = this.startSquares.length; i < ii; ++i) {
            index = this.startSquares[i];
            square = this.squares[index];
            squareList = [index, index-width, index+1, index-1, index+width];

        // If not inside the supply boundaries we can skip to next square
        if (supply && (square.xpos <= xmin || square.xpos >= xmax ||
                       square.ypos < ymin || square.ypos >= ymax)) {
            continue;
        }
       
        if (square.reallyInside && !square.populated) {
            if (square.subsquares.length === 0) {
                if (this.adjacentWall(squareList, -1) && 
                    this.placeMat(index, 1000, false, false)) {
                     return true; 
                } 
            } else {
                var strips =[ [0, 1, 2, 3, 4],      [5, 6, 7, 8, 9],      
                              [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], 
                              [20, 21, 22, 23, 24], [0, 5, 10, 15, 20],
                              [1, 6, 11, 16, 21],   [2, 7, 12, 17, 22],   
                              [3, 8, 13, 18, 23],   [4, 9, 14, 19, 24] ];

                // Checks for each subsquare if it has adjacent wall and recursive mat
                // placement
                for (var j = 0; j < 25; ++j) {
                    var sub = square.subsquares[j];

                    if (!sub.populated && !sub.hasWall && !sub.hasObstacle 
                        && this.adjacentWall(squareList, j)) {
                        var hor = Math.floor(j/5),
                            vert = j%5,
                            arr1 = strips[hor],
                            arr2 = strips[vert+5], 
                            arr3 = this.arrFree(index, arr1) ? arr1 : false,
                            arr4 = this.arrFree(index, arr2) ? arr2 : false;

                        if (this.placeMat(index, 1000, arr3, arr4)) {
                            return true;
                        }
                    }          
                }        
            }           
        }
    }
    return false;
    //End of findStart()
};

/**
 * Function tries to place mats by deciding mat length, then calling placeSquare.
 * Will try to place longest possible mat first, then in decreasing length.
 * @oaram squareNo - The index of the square where mat is to be placed
 * @param validPeriod - Valid timeperiod to use when placing mat
 * @param arr1 - Array of horizontal strips, might be false.
 * @param arr2 - Array of vertical strips, might be false.
 * @return False if mat-placement failed, true if success.
**/
ResultGrid.prototype.placeMat = function (squareNo, validPeriod, arr1, arr2) {

    var opts = TFplanner.options,
        mat,
        c,
        length,
        num,
        pref = [],
        prodNum = [],
        l = []; 

    //If no solution is found within alotted time, abort
    if ((Date.now() - this.timestamp) > this.validPeriod) {
        return false;
    }

    /** This functionality will be used if the user want to "override" what mat-lengths
     * to use. If the chosen mat doesn`t fit, it will not be used. This indicates
     * that the user must have some experience laying heating mats, and know what 
     * lengths that will fit in the room.
    **/
    if (opts.prefMat.length > 0) {

        for (var i = 0, ii = opts.prefMat.length; i < ii; i++) {
            pref[i] = opts.prefMat[i].length*100;
            // The object is undefined at this point, store the product-number.
            prodNum[i] = opts.prefMat[i].number;
        }

        if (pref.length > 0) {
            length = pref.shift();
            num = prodNum.shift();
            c = length * 50;

            if (c <= this.unusedArea) {
                mat = new HeatingMat(length, validPeriod);
                mat.productNr = num;
                // Take the mat out of the array, if it doesn`t fit in the room, we don`t
                // want to put it out anyway.
                opts.prefMat.shift();
                // PlaceSquare is where the placement of the mat begins
                if (!arr1 && !arr2 && this.placeSquare(squareNo, 0, mat, 0, -1)) {
                    mat.draw(this.paper);
                    this.chosenMats.push(mat.productNr);
                    return true;

                } else if ((arr1 && this.placeStrip(squareNo, arr1, mat, 0)) || 
                            (arr2 && this.placeStrip(squareNo, arr2, mat, 0))) {
                    mat.draw(this.paper);
                    this.chosenMats.push(mat.productNr);
                return true;
                }
                delete mat;
            }
        }
    } 
    // Get the length of all mats, and store it in cm instead of meters
    for (var i = 0, ii = opts.validMat.products.length; i < ii; i++) {
        l[i] = opts.validMat.products[i].length*100;
    }
    
    while (l.length > 0) {
        length = l.pop();
        c = length * 50;

        if (c <= this.unusedArea) {
            mat = new HeatingMat(length, validPeriod);
            mat.productNr = opts.validMat.products[l.length].number;

            // PlaceSquare is where the placement of the mat begins
            if (!arr1 && !arr2 && this.placeSquare(squareNo, 0, mat, 0, -1)) {
                mat.draw(this.paper);
                this.chosenMats.push(mat.productNr);
                return true;

            } else if ((arr1 && this.placeStrip(squareNo, arr1, mat, 0)) || 
                        (arr2 && this.placeStrip(squareNo, arr2, mat, 0))) {
                mat.draw(this.paper);
                this.chosenMats.push(mat.productNr);
                return true;
            }
            delete mat;
        }
    }
    //If we reach this point mat placement has failed, and we revert
    // and presumably recurse
    return false;
};

/**
 * Function that returns a color based on indexes 0-3.
 * The colors are defined in constructor.
**/
ResultGrid.prototype.pickColor = function() {

    if (this.colorIndex > 3) {
        this.colorIndex = 0;
    }

    return this.matColors[this.colorIndex];
};

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

    var square = this.squares[squareNo],
        width = this.squarewidth,
        area = 50*50,
        timeout = Date.now(),
        obst = TFplanner.obstacles,
        u = squareNo-width,
        l = squareNo-1,
        r = squareNo+1,
        d = squareNo+width,
        up = this.squares[u], 
        left =  this.squares[l], 
        right = this.squares[r], 
        down = this.squares[d],
        squareList,
        supply,
        correctWall,
        direction,
        arr = [],
        dir = squareNo - lastSquareNo;

    // If the recursive placement is taking too long, abort mat.
    if ((timeout - mat.timestamp) > mat.validPeriod ||
         (timeout - this.timestamp) > this.validPeriod) {
        return false;
    }


    // If there are now walls or other obstacles is square (no subsquare structure)
    // or if there is not enough area left in mat to fill an empty square
    if (!square.populated && (square.subsquares.length == 0) && (mat.unusedArea >= area)) {

        // Toggles this square as populated
        this.squares[squareNo].populated = true;
        mat.addSquare();
        this.unusedArea -= area;

        // If whole mat has been successfully placed: return true if new mat can be placed or room
        // is full, if not revert and recurse
        if (mat.unusedArea == 0) {
            squareList = [squareNo, squareNo-width, squareNo +1, squareNo-1, squareNo+width];
            supply = this.supplyPoint;
            correctWall = true;

            // Mats cannot end on same wall that contains the supplypoint
            if (obst.supplyEnd && supply && 
                (square.xpos >= supply[0] && square.xpos <= supply[1] && 
                square.ypos >= supply[2] && square.ypos <= supply[3])) {

                correctWall = false;
            }

            if (correctWall && this.adjacentWall(squareList, -1) && 
                 (this.unusedArea == 0 || this.findStart())) {
                
                // Picks color, then increments.
                this.currentColor = this.pickColor();
                this.colorIndex++;
                mat.matColor = this.currentColor;

                if (dir > 1) {
                    direction = 0;
                } else if (dir == 1) {
                    direction = 1;
                } else if (dir == -1) {
                    direction = 2;
                } else {
                    direction = 3;
                }
                this.squares[squareNo].setPath(mat);

                return true;
            } else {
                //Revert and recurse
                this.unusedArea += area;
                square.arrows.remove();
                this.squares[squareNo].populated = false;
                mat.removeSquare();
                return false;
            }
        }

        if (right.reallyInside && !right.populated && 
              this.proceed(r, 'right', squareNo, mat)) {
            return true;
        } else if (left.reallyInside && !left.populated && 
                  this.proceed(l, 'left', squareNo, mat)) {
            return true;
        } else if (up.reallyInside&& !up.populated && 
                  this.proceed(u, 'up', squareNo, mat)) {
            return true;
        } else if (down.reallyInside && !down.populated && 
                  this.proceed(d, 'down', squareNo, mat)) {
            return true;
        }

        // If function comes to this point, attempt has failed.
        // Reset and revert to previous square
        this.unusedArea += area;
        this.squares[squareNo].populated = false;
        mat.removeSquare();
    } 
    else {
        // If the end needs to be divided into subsquares to reach a wall we will 
        // need to know which direction we came from
        if (mat.unusedArea < area && lastSubsquareNo == -1) {

            //From left or top
            if (dir > 1) {
                arr = [0, 1, 2, 3, 4];
                subsquareNo = 20;
            } else if (dir == -1) {
                arr = [4, 9, 14, 19, 24];
                subsquareNo = 4; 
            } else if (dir == 1) {
                subsquareNo = 0;
                arr = [0, 5, 10, 15, 20];
            }
            else {
                arr = [20, 21, 22, 23, 24];
                subsquareNo = 0;
            }
        }
        if (this.placeSubsquare(squareNo, subsquareNo, mat, lastSubsquareNo)) {
            return true;
        }   
    }
    return false;
};


/**
 * Function places a strip of 5 adjacent subsquares, intended to extend a series
 * of squares all the way to a wall.
 * @param squareNo - Index of the square to place the strip in
 * @param arr - Array of indexes of the 5 subsquares to be placed
 * @param mat - The heating mat currently being placed
 * @param lastSquareNo - Index of the last square placed
 * @return false if placement failed
**/
ResultGrid.prototype.placeStrip = function(squareNo, arr, mat, lastSquareNo) {

    var square = this.squares[squareNo],
        subsquares = square.subsquares,
        timeout = Date.now(),
        area = 10*10,
        added = false,
        squareFull = true,
        abort = false,
        width = this.squarewidth,
        supply = this.supplyPoint,
        u = squareNo - width,
        d = squareNo + width,
        l = squareNo - 1,
        r = squareNo + 1,
        up = this.squares[u],
        right = this.squares[r],
        left = this.squares[l],
        down = this.squares[d],
        x, y, s,
        squareList,
        correctWall,
        rstrip = [],
        lstrip = [],
        ustrip = [], 
        dstrip = [];

    // If the recursive placement is taking too long, abort mat
    if ((timeout - mat.timestamp) > mat.validPeriod ||
         (timeout - this.timestamp) > this.validPeriod) {
        abort = true;
    }

    // If no subsquare structure exists, create one. 
    // Will happen if function is called because mat unused area is less
    // than a full square.
    if (subsquares.length == 0) {
        for (var i = 0; i < 25; ++i) {
            x = square.xpos + (i%5)*10;
            y = square.ypos + Math.floor(i/5)*10;
            s = new Subsquare(x, y, this.paper);

            s.insideRoom = true;
            this.squares[squareNo].subsquares.push(s);
        }
        added = true;
    }

    if (!this.arrFree(squareNo, arr)) {
        if (added === true) {
            this.squares[squareNo].clearSubsquares();
        }
        return false;
    }
    
    for (var i = 0; i < 5; ++i) {
        this.squares[squareNo].subsquares[arr[i]].populated = true;
        this.unusedArea -= area; 
        mat.addSubsquare();
    }

    // If end of mat is reached: check if new mat can be placed or if room is full,
    // if not revert and recurse.
    if (mat.unusedArea == 0) {
        squareList = [squareNo, u, r, l, d];
        correctWall = true;

        // Mats cannot end on same wall that contains the supplypoint
        if (TFplanner.obstacles.supplyEnd && supply && 
             (square.xpos >= supply[0] && square.xpos <= supply[1] && 
               square.ypos >= supply[2] && square.ypos <= supply[3])) {
            correctWall = false;
        }

        // One subsquare must be adjacent to a valid wall segment
        if (correctWall &&
            (this.adjacentWall(squareList, arr[0]) || 
             this.adjacentWall(squareList, arr[1]) ||
             this.adjacentWall(squareList, arr[2]) ||
             this.adjacentWall(squareList, arr[3]) ||
             this.adjacentWall(squareList, arr[4]))
            && (this.unusedArea == 0 || this.findStart())) {

            // Picks color, then increments.
            this.currentColor = this.pickColor();
            this.colorIndex++;
            mat.matColor = this.currentColor;

            this.colorArr(squareNo, arr, mat);
            return true;

        } else  {
            for (var i = 0; i < 5; ++i ) {
                this.unusedArea += area;
                mat.removeSubsquare();
            }
            if (added === true) {
                this.squares[squareNo].clearSubsquares();
            }
            this.squares[squareNo].populated = false;
            return false;
        }
    }

    // A quick check to see if square is now fully populated
    for (var i = 0; i < 25; ++i) {
        s = subsquares[i];

        if (!(s.populated || s.hasWall || s.hasObstacle)) {
            squareFull = false;
        }
    }
    this.squares[squareNo].populated = squareFull;

    // Finds adjacent strips
    if (arr[0] <= 4 && arr[4] >=20) {
        // Vertical strip - right/left placement
        rstrip = (arr[0] < 4) ? [arr[0]+1, arr[1]+1, arr[2]+1, arr[3]+1, arr[4]+1] : null;
        lstrip = (arr[0] > 0) ? [arr[0]-1, arr[1]-1, arr[2]-1, arr[3]-1, arr[4]-1] : null;
        ustrip = null;
        dstrip = null;
    } else {
        // Horizontal strip - up/down placement
        ustrip = (arr[0] > 4) ? [arr[0]-5, arr[1]-5, arr[2]-5, arr[3]-5, arr[4]-5] : null;
        dstrip = (arr[0] < 20) ? [arr[0]+5, arr[1]+5, arr[2]+5, arr[3]+5, arr[4]+5] : null;
        rstrip = null;
        lstrip = null;
    }

    // First tries to populate within the square by order right-left-up-down, 
    // then tries the next squares in order right-left-up-down
    if (!abort && rstrip && this.placeStrip(squareNo, rstrip, mat, lastSquareNo)) {
        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (!abort && lstrip && this.placeStrip(squareNo, lstrip, mat, lastSquareNo)) {
        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (!abort && ustrip && this.placeStrip(squareNo, ustrip, mat, lastSquareNo)) {
        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (!abort && dstrip && this.placeStrip(squareNo, dstrip, mat, lastSquareNo)) {
        this.colorArr(squareNo, arr, mat);
        return true;

    } else if ((arr[4] % 5 == 4) && !right.populated && right.reallyInside && 
                right.subsquares.length == 0 && !abort && (mat.unusedArea >= right.area) &&
                this.placeSquare(r, 0, mat, squareNo, -1)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    }  else if ((arr[0] % 5 == 0) && (arr[4] % 5 == 4) && !right.populated && 
                 right.reallyInside && !abort && 
                 this.placeStrip(r, arr, mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if ((arr[0] == 4) && (arr[4]  == 24) && !right.populated && 
                right.reallyInside && !abort &&  
                this.placeStrip(r, [0, 5, 10, 15, 20], mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if ((arr[0] % 5 == 0) && !left.populated && left.reallyInside &&
                left.subsquares.length == 0 && !abort && (mat.unusedArea >= left.area) &&
                this.placeSquare(l, 4, mat, squareNo, -1)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] % 5 ==  0 && arr[4] % 5 == 4  && !left.populated && 
                left.reallyInside && !abort && 
                this.placeStrip(l, arr, mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] == 0 && arr[4] == 20 && !left.populated && 
                left.reallyInside && !abort &&
                this.placeStrip(l, [4, 9, 14, 19, 24], mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] >= 0 && arr[0] < 5 && !up.populated && up.reallyInside && 
                up.subsquares.length == 0 && !abort && (mat.unusedArea >= up.area) &&
                this.placeSquare(u, 20, mat, squareNo, -1)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] >= 0 && arr[0] < 5 && arr[4] >= 20 && !up.populated && 
                up.reallyInside && !abort && 
                this.placeStrip(u, arr, mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] == 0 && arr[4] == 4 && !up.populated && 
                up.reallyInside && !abort && 
                this.placeStrip(u, [20, 21, 22, 23, 24], mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if ((arr[4] >= 20 && arr[4] < 25 ) && !down.populated && down.reallyInside && 
                down.subsquares.length == 0 && !abort && (mat.unusedArea >= down.area) &&
                this.placeSquare(d, 0, mat, squareNo, -1)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] >= 0 && arr[0] < 5 && arr[4] >= 20 && !down.populated && 
                down.reallyInside && !abort && 
                this.placeStrip(d, arr, mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] == 20 && arr[4] == 24 && !down.populated && 
                down.reallyInside && !abort && 
                this.placeStrip(d, [0, 1, 2, 3, 4], mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;
    } 

    //Exit plan
    for (var i = 0; i < 5; ++i) {
        this.squares[squareNo].subsquares[arr[i]].populated = false;
        this.unusedArea += area; 
        mat.removeSubsquare();
    }
    if (added === true) {
        this.squares[squareNo].clearSubsquares();
    }
    this.squares[squareNo].populated = false;
    return false;  
};


/**
 * Function populated a subsquare, if possible, then recursively calls itself. When no
 * new subsquare can be reached it will try to call placeSquare for the next square instead.
 * This function has been rendered obsolete by placeStrip(), but is still the fallback procedure
 * for placeSquare().
 * @param squareNo - Index of square containing the subsquare to be populated
 * @param subSquareNo - Index of subsquare to be populated
 * @param mat - The heating mat which is currently placed
 * @param lastSubsquareNo - The last subsquare populated. Will be -1 if this function is called
 *  from a square without subsquares
**/
ResultGrid.prototype.placeSubsquare = function(squareNo, subsquareNo, mat, lastSubsquareNo) {

    var square = this.squares[squareNo],
        subsquares = square.subsquares,
        added = false,
        abort = false,
        timeout = Date.now(),
        x, y, s,
        squareList,
        sub,
        width = this.squarewidth,
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


    // If the recursive placement is taking too long, abort mat
    // Simply returning false will not work due to asynchronous nature
    if ((timeout - mat.timestamp) > mat.validPeriod) {
        abort = true;
    }

    // If no subsquare structure exists, create one. 
    // Will happen if function is called because mat unused area is less
    // than a full square
    if (subsquares.length == 0) {
        for (var i = 0; i < 25; ++i) {
            x = square.xpos + (i % 5)*10;
            y = square.ypos + Math.floor(i / 5)*10;
            s = new Subsquare(x, y, this.paper);

            s.insideRoom = true;
            this.squares[squareNo].subsquares.push(s);
        }
        added = true;
    }

    sub = subsquares[subsquareNo];
    // The subsquare must be free to populate
    if (!(sub.hasWall || sub.hasObstacle || sub.populated)) {
        this.squares[squareNo].subsquares[subsquareNo].populated = true;
        this.unusedArea -= area;
        mat.addSubsquare();

        //If end of mat is reached: check if new mat can be placed or if room is full,
        // if not revert and recurse
        if (mat.unusedArea == 0) {
            squareList = [squareNo, squareNo-width, squareNo +1, squareNo-1, squareNo+width];
            
            if (this.adjacentWall(squareList, subsquareNo) && 
                (this.unusedArea == 0 || this.findStart())) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            } else  {
                this.unusedArea += area;
                mat.removeSubsquare();
                this.squares[squareNo].populated = false;
    
                if (added === true) {
                    this.squares[squareNo].clearSubsquares();
                }
                return false;
            }
        }

        // A quick check to see if square is now fully populated
        for (var i = 0; i < 25; ++i) {
            s = subsquares[i];
            if (!(s.populated || s.hasWall || s.hasObstacle)) {
                squareFull = false;
            }
        }
        this.squares[squareNo].populated = squareFull;

        // We first try to populate within the same square, then move to the adjacent squares
        // Up, inside same square
        if (u >= 0 && abort === false) {
            up = subsquares[u];
            if (!up.hasWall && !up.hasObstacle && !up.populated 
                && this.placeSubsquare(squareNo, u, mat, lastSubsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }
        // Right within same square
        if ((r < 25) && (r%5 != 0) && abort === false) {
            right = subsquares[r];
            if (!right.hasWall && !right.hasObstacle && !right.populated 
                && this.placeSubsquare(squareNo, r, mat, lastSubsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }
        //Left within same square
        if ((l >= 0) && (l%5 != 4) && abort === false) {
            left = subsquares[l];
            if (!left.hasWall && !left.hasObstacle && !left.populated 
                && this.placeSubsquare(squareNo, l, mat, lastSubsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }
        //Down inside same square
        if ((d < 25) && abort === false) {
            down = subsquares[d];
            if (!down.hasWall && !down.hasObstacle && !down.populated 
                && this.placeSubsquare(squareNo, d, mat, lastSubsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }

        //Up into the adjacent square
        if (u < 0 && abort == false) {
            up = this.squares[squareNo-width];
            if (up.reallyInside && !up.populated && 
                this.placeSquare(squareNo-width, u+25, mat, squareNo, subsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }

        //Right to next square
        if (r%5 == 0 && abort === false) {
            right = this.squares[squareNo+1];
            if (right.reallyInside && !right.populated && 
                this.placeSquare(squareNo+1, r-5, mat, squareNo, subsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }

        //Left to previous square
        if ((l == -1 || l%5 == 4) && abort === false) {
            left = this.squares[squareNo-1];
            if (left.reallyInside && !left.populated && 
                this.placeSquare(squareNo-1, l+5, mat, squareNo, subsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }

        //Down to square below
        if (d > 24 && abort === false) {
            down = this.squares[squareNo + width];
            if (down.reallyInside && !down.populated && 
                this.placeSquare(squareNo+width, d-25, mat, squareNo, subsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }

        //Could not place subsquare, reset and recurse
        this.unusedArea += area;
        mat.removeSubsquare();
        this.squares[squareNo].populated = false;
        this.squares[squareNo].subsquares[subsquareNo].populated = false;
    }

    //If a subsquare structure was constructed, remove it
    if (added === true) {
        this.squares[squareNo].clearSubsquares();
    }
    return false;
    //End of placeSubsquare
};

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
        square,
        up, down, left, right,
        u, d, l, r,
        area,
        clearable, 
        walls,
        sub,
        really;

    for (var i = width; i <= len; ++i) {
        square = this.squares[i];

        if (square.hasWall) {
            up = false;
            down = false;
            left = false; 
            right = false;
            //Finds neighboring squares
            u = this.squares[i-width];
            d = this.squares[i+width];
            l = this.squares[i-1];
            r = this.squares[i+1];

            //Checks for each direction whether the wall is movable.
            //Wall is movable if all 5 subsquares along one edge contain
            // wall
            if (square.movableWall(upWall) && 
                (!u.insideRoom || (l.insideRoom && !l.hasWall && 
                                    r.insideRoom && !r.hasWall))) {
                up = true;   
            } 
            if (square.movableWall(leftWall) && 
                (!l.insideRoom || (u.insideRoom && !u.hasWall && 
                                    d.insideRoom && !d.hasWall))) {
                left = true;  
            }
            if (square.movableWall(rightWall) && 
                (!r.insideRoom || (u.insideRoom && !u.hasWall && 
                                    d.insideRoom && !d.hasWall))) {
                right = true;
            }
            if (square.movableWall(downWall) && 
                (!d.insideRoom || (l.insideRoom && !l.hasWall && 
                                    r.insideRoom && !r.hasWall))) {
                down = true;   
            }
                
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
    for (var i = 0, ii = this.squares.length; i < ii; ++i) {
        square = this.squares[i];

        if (square.hasWall) {
            this.squares[i].insideRoom = true;
        }

        //Cleans up any leftover corners that are no longer connected to walls
        if (square.hasWall && i > width && i < len) {
            clearable = true;
            walls = false;
            sub = square.subsquares;
            u = this.squares[i-width];
            d = this.squares[i+width];
            l = this.squares[i-1];
            r = this.squares[i+1];
            area = 10*10;

            if (!u.hasWall && !l.hasWall && sub[0].hasWall
                 && !(sub[1].hasWall || sub[5].hasWall)) {
                this.squares[i].subsquares[0].hasWall = false;
                this.squares[i].area += area;
            }
            if (!u.hasWall && !r.hasWall && sub[4].hasWall 
                && !(sub[3].hasWall || sub[9].hasWall)) {
                this.squares[i].subsquares[4].hasWall = false;
                this.squares[i].area += area;
            }
            if (!d.hasWall && !l.hasWall && sub[20].hasWall
                 && !(sub[15].hasWall || sub[21].hasWall)) {
                this.squares[i].subsquares[20].hasWall = false;
                this.squares[i].area += area;
            }
            if (!r.hasWall && !d.hasWall && sub[24].hasWall
                 && !(sub[23].hasWall || sub[19].hasWall)) {
                this.squares[i].subsquares[24].hasWall = false;
                this.squares[i].area += area;
            }

            //If square no longer contains obstacles or walls:
            // Remove subsquare structure
            for (var j = 0; j < 25; ++j) {
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
            really = false;
            for (var j = 0; j < 25; ++j) {
                if (square.subsquares[j].insideRoom && !square.subsquares[j].hasWall) {
                    really = true;
                    break;
                }
            }
            this.squares[i].reallyInside = really;
        }
    }

    TFplanner.options.availableArea = (this.area / 10000);
    this.area -= 3000;
    this.area -= this.area%10000;
    this.unusedArea = this.area;
    //End of moveWalls
};

/**
 * Function checks whether there is piece of wall which 
 * is adjacent in the given direction.
 * @param squareList - List of square indexes involved [self, up, right, left, down]
 * @param subsquareNo - The subsquare to be evaluated, -1 if 
 *  no subsquare-structure in square
 * @return
**/
ResultGrid.prototype.adjacentWall = function (squareList, subsquareNo) {

    var square = this.squares[squareList[0]],
        targetSubsquares,
        wall,
        targetSquare,
        target,
        arr,
        subsquare,
        up, 
        down, 
        left, 
        right,
        upSquare,
        rightSquare,
        leftSquare,
        downSquare;

    //If the square calling the function does not have subsquare structure
    if (subsquareNo == -1) {

        for (var direction = 1; direction < 5; direction++) {
            //Checks for walls in adjacent square above-right-left-down
            if (direction == 1) {
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
            targetSquare = this.squares[squareList[direction]];

            if (targetSquare.hasWall) {

                targetSubsquares = targetSquare.subsquares;

                for (var i = 0; i < 5; ++i) {
                    target = wall[i];
                    if (targetSubsquares[target].hasWall)
                        return true;
                }
            }
        }
    }
    //Else executes if subsquare structure already exists,
    // i.e. if the square contains obstacles or walls
    else {     
        arr = square.subsquares;
        upSquare = this.squares[squareList[1]];
        rightSquare = this.squares[squareList[2]];
        leftSquare = this.squares[squareList[3]];
        downSquare = this.squares[squareList[4]];
        subsquare = arr[subsquareNo];

        //The subsquare we're checking FROM must be free
        // (but can be populated)
        if (subsquare.insideRoom && !subsquare.hasWall && !subsquare.hasObstacle) {

            //Finds neighboring subsquares inside own square 
            up = (subsquareNo > 4) ? arr[subsquareNo-5] : null;
            down = (subsquareNo < 20) ? arr[subsquareNo+5] : null;
            left = ((subsquareNo % 5) != 0) ? arr[subsquareNo-1] : null;
            right = ((subsquareNo % 5) != 4) ? arr[subsquareNo+1] : null;

            //If any neighboring squares have walls
            if ((up && up.hasWall) || (down && down.hasWall) ||
                 (right && right.hasWall) || (left && left.hasWall)) {
                return true;
            } 
            //or if subsquare directly to the top has wall
            else if (!up && upSquare.hasWall && 
                        upSquare.subsquares[subsquareNo+20].hasWall) {
                return true;
            }
            //or if subsquare directly to the right has wall
            else if (!right && rightSquare.hasWall && 
                        rightSquare.subsquares[subsquareNo-4].hasWall) {
                return true;
            }
            //or if subsquare directly to the left has wall
            else if (!left && leftSquare.hasWall && 
                        leftSquare.subsquares[subsquareNo+4].hasWall) {
                return true;
            }   
            //or if subsquare directly down has wall
            else if (!down && downSquare.hasWall && 
                        downSquare.subsquares[subsquareNo-20].hasWall) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Function adds obstacles to the datastructure. 
 * DOES NOT check whether obstacles are inside room, this responsibility
 * is left to the user!
**/
ResultGrid.prototype.addObstacles = function() {

    var list = TFplanner.obstacles.obstacleSet,
        width = this.squarewidth,
        obstacle,
        startSquare,
        currentSquare,
        x, y, 
        xdim,
        ydim,
        xoffset,
        yoffset,
        area,
        sub,
        square,
        xtemp,
        ytemp,
        s;

    for (var i = 0, ii = list.length; i < ii; ++i) {
        obstacle = list[i];
        x = obstacle.attr('x');
        y = obstacle.attr('y');
        xdim = obstacle.attr('width')/10;
        ydim = obstacle.attr('height')/10;
        startSquare = Math.floor(x/50) + (Math.floor(y/50) * width);
        currentSquare = startSquare;
        xoffset = x % 50;
        yoffset = y % 50;
        area = 10*10;

        // Traverses obstacle as a two-dimensional array of subsquares
        // and toggles hasObstacle in each subsquare
        for (var j = 0; j < ydim; ++j) {
            for (var k = 0; k < xdim; ++k) {
                square = this.squares[currentSquare];

                // Creates subsquare structure if there is none
                // (Squares with walls will already have a subsquare structure)
                if (square.subsquares.length == 0) {
                    for (var n = 0; n < 25; ++n) {
                        xtemp = square.xpos + (n % 5)*10;
                        ytemp = square.ypos + Math.floor(n / 5)*10;
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
                xoffset = (xoffset + 10) % 50;
                //Changes to next square when necessary
                if (xoffset == 0) {
                    currentSquare += 1;
                }
            }

            xoffset = x % 50;
            // X-axis loop finished, return to start and repeat one line below
            currentSquare = startSquare;
            yoffset = (yoffset + 10) % 50;
            // Changes to next row of squares
            if (yoffset == 0) {
                currentSquare += width;
                startSquare = currentSquare;
            }
        }
    }
};

/**
 * Sets supply point if one has been set by user. The supply point defines
 * a wall, and all starting points must be adjacent to this wall.
 * @return Information about the supplypoint
**/
ResultGrid.prototype.setSupplyPoint = function () {

    var obst = TFplanner.obstacles,
        list = obst.obstacleSet,
        walls = TFplanner.ourRoom.walls,
        supply = obst.supplyPoint,
        wall,
        xmin,
        xmax,
        ymin,
        ymax,
        x1, x2, y1, y2,
        x, y;

    for (var i = 0, ii = obst.obstacleSet.length; i < ii; ++i) {
        if (list[i].id == supply) {
            x = list[i].attr('x');
            y = list[i].attr('y');

            // Remvoves supplyPoint so that it doesn't act as obstacle (take up space etc.)
            obst.obstacleSet[i].remove();
            obst.txtSet[i].remove();

            // Why 11? Because of the x/y offset when moving the room and because
            // the supply point itself has dimensions 10*10
            // And, as importantly, these go to 11
            for (var j = 0, jj = walls.length; j < jj; ++j) {
                wall = walls[j];
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
                    return ([xmin-40, xmax+40, ymin-40, ymax+40]);
                }
            } 
        }
    }
};

/**
* Checks that all subsquares in an array are free to populate.
* @param squareNo - Index of square in which subsquares are found
* @param arr - Array of subsquare indexes to be checked
* @return true if subsquare free to populate.
**/
ResultGrid.prototype.arrFree = function(squareNo, arr) {

    var sub;

    for (var i = 0, ii = arr.length; i < ii; ++i) {
        sub = this.squares[squareNo].subsquares[arr[i]];
        if (!sub || sub.hasObstacle || sub.populated || sub.hasWall)  {
            return false;
        }
    }
    return true;
};

/**
* Function handles the transition from one full square to the next square.
* If the square is empty it populates with a 50cm*50cm segment, if not it 
* will try to populate with  
* @param squareNo - The index of the square we're transitioning to
* @param dir - The direction from which the previous square was entered
* @param direction - The direction from which this square is being entered
* @param lastSquareNo - The index of the previous square
* @param mat - The heating mat currently being placed
**/
ResultGrid.prototype.proceed = function(squareNo, direction, lastSquareNo, mat) {
    
    var strip0 = [], 
        strip1 = [],
        strip2 = [],
        strip3 = [],
        strip4 = [],
        strip5 = [],
        arr = [],
        square = this.squares[squareNo],
        subsquare,
        arrow;

    //Switch sets priority for strip placement varying in accordance with
    //which direction this square is entered as well as the direction the previous
    //square was entered. Also sets the entry point for the square to be populated
    //and the direction of connecting line/heating mat symbolization
    switch (direction) {
        case 'up':
            strip0 =  [20, 21, 22, 23, 24];
            strip1 = [0, 5, 10, 15, 20];
            strip2 = [1, 6, 11, 16, 21];
            strip3 = [2, 7, 12, 17, 22];
            strip4 = [3, 8, 13, 18, 23];
            strip5 = [4, 9, 14, 19, 24];

            arr = [strip0, strip5, strip4, strip3, strip2, strip1];
            subsquare = 20;
            arrow = 0;
            break;

        case 'right':
            strip0 =  [0, 5, 10, 15, 20];
            strip1 = [0, 1, 2, 3, 4];
            strip2 = [5, 6, 7, 8, 9];
            strip3 = [10, 11, 12, 13, 14];
            strip4 = [15, 16, 17, 18, 19];
            strip5 = [20, 21, 22, 23, 24];

            arr = [strip1, strip2, strip3, strip4, strip5, strip0];
            subsquare = 0;
            arrow = 1;
            break;

        case 'left':
            strip0 =  [4, 9, 14, 19, 24];
            strip1 = [0, 1, 2, 3, 4];
            strip2 = [5, 6, 7, 8, 9];
            strip3 = [10, 11, 12, 13, 14];
            strip4 = [15, 16, 17, 18, 19];
            strip5 = [20, 21, 22, 23, 24];

            arr = [strip1, strip2, strip3, strip4, strip5, strip0];
            subsquare = 4;
            arrow = 2;
            break;

        case 'down':
            strip0 = [0, 1, 2, 3, 4];
            strip1 = [0, 5, 10, 15, 20];
            strip2 = [1, 6, 11, 16, 21];
            strip3 = [2, 7, 12, 17, 22];
            strip4 = [3, 8, 13, 18, 23];
            strip5 = [4, 9, 14, 19, 24];

            arr = [strip0, strip1, strip2, strip3, strip4, strip5];
            subsquare = 0;
            arrow = 3;
            break;
        
        default:
            return false;
    }

    //If the square does not have obstacles or walls, try placing a full square
    //If it does contain obstacles, try placing a strip instead
    if (!square.hasObstacles && !square.hasWall && (square.area <= mat.unusedArea)) {
        if (this.placeSquare(squareNo, subsquare, mat, lastSquareNo, -1)) {
            this.squares[lastSquareNo].setPath(mat);
            return true;      
        }
    } else {
        for (var i = 0; i < 6; ++i) {
            if (this.placeStrip(squareNo, arr[i], mat, lastSquareNo)) {
                this.squares[lastSquareNo].setPath(mat);
                return true;
            }
        }
    }
    return false;
};

/**
* Function sets color for each subsquare in a strip and 
* marks the centre point in the middle subsquare as a point for 
* the red line
* @param squareNo - Index of square the strip is in
* @parawm arr - Array containing indexes of the 5 subsquares
* @param mat - The heating mat currently in use
*/
ResultGrid.prototype.colorArr = function(squareNo, arr, mat) {

    for (var i = 0; i < 5; ++i) {
        this.squares[squareNo].subsquares[arr[i]].setColor(mat);
    }
    this.squares[squareNo].subsquares[arr[2]].setPath(mat);
};

