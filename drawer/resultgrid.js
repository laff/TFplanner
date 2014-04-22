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
    this.startSquares = [];
    this.area = 0;
    this.unusedArea = 0;
    //Squarewidth and squareheight are the number
    // of squares high and wide the structure is
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
}

/**
 *  Function that invokes the functionalites associated with the mat placements / guide.
 *
**/
ResultGrid.prototype.calculateGuide = function () {

    this.supplyPoint =  this.setSupplyPoint();
    this.addObstacles();
    this.moveWalls();
    this.createStartPoints();

    //Starts to populate the data structure
    this.findStart();

    this.displayMats();


}

/**
 *  Drawing mats by calling fancy functions on all the squares.
**/
ResultGrid.prototype.displayMats = function () {

    var mats = mattur.list,     // FIX THESE NAMES
        matti = mattur.subList, // DENNI OG!
        squares = this.squares,
        subObj = mattur.subObj,
        products = [];

    // Clear out array incase doubleclick etc.
    this.chosenMats = null;

    for (var i = 0; i < mats.length; i++) {

        if (mats[i] == undefined) {
            continue;
        }

        // Extract productnumber from the first square.
        products.push(squares[mats[i][0]].productNr);
        //console.log(mats[i]);


        // Go through  each square, starting  with the highest square index.
        // This is because mats are placed backwards initially.
        var tmpDirection = null,
            j = (mats[i].length),
            k = 0;

        while  (j--) {

            if (j == 0) {
                squares[mats[i][j]].direction = null;
            }

            // Draw productnumber or line.
            (k != 2) ? squares[mats[i][j]].drawMatline(tmpDirection) : squares[mats[i][j]].drawMatline('productNr');

            // Put the productnumber to front of arrow
            if (k == 3) {
                squares[mats[i][(j + 1)]].arrows.toFront();
            }

            k++;

            tmpDirection = squares[mats[i][j]].direction;
        }
    }

    for (var i = 0; i < matti.length; i++) {
        // Will get a lot of undefined indexes, because of the length-parameter to the array.
        if (matti[i] != undefined) {
            // Loop through mats, then we must check each index in the mat.
            for (var j = 0; j < mats.length; j++) {
                // Will get a lot of undefined indexes, because of the length-parameter to the array.
                if (mats[j] != undefined) { 
                    // If it already exist in mats, we do not want to do anything with it.
                    if (($.inArray(i, mats[j]) != -1)) {
                        // Delete the item from the array, but the index is kept 'blank'. (Length of array stays the same)
                        delete matti[i];
                    }
                }
            }
        }
    }

    var temp = [];

    for (var k = 0; k < matti.length; k++) {
        // This index still exist in the array, and we don`t want to delete these, cause
        // they are the only ones we want to draw into.
        if (matti[k] != undefined) {
            temp.push(k);
        }
    }
    // Traverse, and delete all subsquares that no longer exist (because they are transformed to Square)
    for (var l = 0; l < subObj.length; l++) {
        if (($.inArray(subObj[l].squareNo, temp)) < 0) {
            delete subObj[l];
        }
    }
    
    // Now the subObj-array should contain ONLY the subsquares that really 'exist'.

    // Temp-storing some directions and stuff.
    // OBS: May be better ways to to this 'jumping to new Square'-stuff.
    var tmpDirection = null,
        currentSqNo = null,
        prevSqNo = null;

        for (var j = 0; j < subObj.length; j++) {
            // Since this array is complete chaos, we might have some undefined indexes.
            if (subObj[j] != undefined) {

                currentSqNo = subObj[j].squareNo;
                // If we jumps into a new square, the from-direction is set to 'null'.
                if (currentSqNo != prevSqNo) {
                    tmpDirection = null;
                }
                // Draw the mat on a subsquare, in correct direction.
                mattur.drawSubMat(tmpDirection, subObj[j]);

                tmpDirection = subObj[j].direction;
                prevSqNo = subObj[j].squareNo;
            }
        }
    this.chosenMats = products;

    // Removes the progress
    options.updateProgress(true);
}

/**
 * Function creates a square/data structure
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
            square = new Square(j, i, path, paper, length+1);
            squares[length++] = square;
        }
    }

    options.updateProgress(false, this);
}

/**
 * Clears the data structure and removes the drawn elements
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
        startSquares = this.startSquares,
        len = startSquares.length,
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
         var index = startSquares[i],
            square = squares[index],
            squareList = [ index, index-width, index+1, index-1, index+width ];

        //If not inside the supply boundaries we can skip to next square
        if (supply && (square.xpos <= xmin || square.xpos >= xmax ||
                       square.ypos < ymin || square.ypos >= ymax) ) {
            continue;
        }
       
        if (square.reallyInside && !square.populated) {
 
            //Neighbouring square numbers
            //var squareList = [i, i-width, i+1, i-1, i+width];
           
            if (square.subsquares.length == 0) {
 
                //Criteria: If adjacent to a wall and recursive mat placement works,
                // return true
                if ( this.adjacentWall(squareList, -1) && this.placeMat(index, 100, false, false)  ) {
                     return true;
                }
 
            } else {
                var strips =[ [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
                              [15, 16, 17, 18, 19], [20, 21, 22, 23, 24], [0, 5, 10, 15, 20],
                              [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23],
                              [4, 9, 14, 19, 24]];

                //Checks for each subsquare if it has adjacent wall and recursive mat
                // placement
                for (var j=0; j < 25; ++j) {

                    if ( this.adjacentWall(squareList, j) ) {//&& this.placeMat(index, j, 200) ) {
                        var hor = Math.floor(j/5),
                            vert = j%5,
                            arr1 = strips[hor],
                            arr2 = strips[vert+5];
                        arr1 = this.arrFree(index, arr1) ? arr1 : false;
                        arr2 = this.arrFree(index, arr2) ? arr2 : false;

                        if ( this.placeMat(index, 50, arr1, arr2) ) {
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

/**
 * Function tries to place mats by deciding mat length, then calling placeSquare.
 * Will try to place longest possible mat first, then in decreasing length
 * @oaram squareNo - The index of the square where mat is to be placed
 * @param subsquareNo - The index of the subsquare, iff any, where mat
 *  is to be placed
**/
ResultGrid.prototype.placeMat = function (squareNo, validPeriod, arr1, arr2) {

    var mat,    
        l = [];

    // Picks color, then increments.
    this.currentColor = this.pickColor();
    this.colorIndex++;

    /** This functionality will be used if the user want to "override" what mat-lengths
     * to use. If the chosen mat doesn`t fit, it will not be used. This indicates
     * that the user must have some experience laying heating mats, and know what 
     * lengths that will fit in the room.
    **/
    if (options.prefMat.length > 0) {
        var pref = [],
            prodNum = [];

        for (var i = 0; i < options.prefMat.length; i++) {
            pref[i] = options.prefMat[i].length*100;
            // The object is undefined at this point, store the product-number.
            prodNum[i] = options.prefMat[i].number;
        }

        if (pref.length > 0) {
            var length = pref.shift(),
                num = prodNum.shift(),
                c = length * 50;

            if (c <= this.unusedArea) {
                mat = new HeatingMat(length, validPeriod, this.currentColor);
                mat.productNr = num;
                // Take the mat out of the array, if it doesn`t fit in the room, we don`t
                // want to put it out anyway.
                options.prefMat.shift();
                // PlaceSquare is where the placement of the mat begins
                if ( !arr1 && !arr2 && this.placeSquare(squareNo, 0, mat, 0, -1) ) {
                    return true;
                } else if ( (arr1 && this.placeStrip(squareNo, arr1, mat, 0) ) || 
                            (arr2 && this.placeStrip(squareNo, arr2, mat, 0) ) ) {
                return true;
                }
                delete mat;
            }
        }
    } 

    for (var i = 0; i < options.validMat.products.length; i++) {
        // Length of mats is stored in meters, we want it in cm.
        l[i] = options.validMat.products[i].length*100;
    }
    
    while (l.length > 0) {
        var length = l.pop(),
            c = length * 50;

        if (c <= this.unusedArea) {
            mat = new HeatingMat(length, validPeriod, this.currentColor);
            mat.productNr = options.validMat.products[l.length].number;

            //placeSquare is where the placement of the mat begins
            if ( !arr1 && !arr2 && this.placeSquare(squareNo, 0, mat, 0, -1) ) {
                return true;
            } else if ( (arr1 && this.placeStrip(squareNo, arr1, mat, 0) ) || 
                        (arr2 && this.placeStrip(squareNo, arr2, mat, 0) ) ) {
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
        timeout = Date.now(),
        u = squareNo-width,
        l = squareNo-1,
        r = squareNo+1,
        d = squareNo+width,
        up = squares[u], 
        left =  squares[l], 
        right = squares[r], 
        down = squares[d],
        arr = [],
        dir = squareNo - lastSquareNo;

    //If thee recursive placement is taking too long, abort mat
    if ( (timeout - mat.timestamp) > mat.validPeriod) {
        return false;
    }


    //If there are now walls or other obstacles is square (no subsquare structure)
    // or if there is not enough area left in mat to fill an empty square
    if ( !square.populated && (square.subsquares.length == 0) && (mat.unusedArea >= area) ) {

        //Toggles this square as populated
        this.squares[squareNo].populated = true;
        mat.addSquare();
        this.unusedArea -= area;
        square.setArrow(5, mat, squareNo);


        
        //If whole mat has been successfully placed: return true if new mat can be placed or room
        // is full, if not revert and recurse
        if (mat.unusedArea == 0) {
            var squareList = [squareNo, squareNo-width, squareNo +1, squareNo-1, squareNo+width],
                supply = this.supplyPoint,
                correctWall = true;

            //Mats cannot end on same wall that contains the supplypoint
            if ( obstacles.supplyEnd && supply && 
                 ( square.xpos >= supply[0] && square.xpos <= supply[1] && 
                   square.ypos >= supply[2] && square.ypos <= supply[3] ) ) {
                correctWall = false;
            }


            if ( correctWall && this.adjacentWall(squareList, -1) && 
                 ( this.unusedArea == 0 || this.findStart() ) ) {

                var direction;

                if ( dir > 1 ) {
                    direction = 0;
                } else if ( dir == 1) {
                    direction = 1;
                } else if (dir == -1) {
                    direction = 2;
                } else {
                    direction = 3;
                }
                this.squares[squareNo].setArrow(direction, mat, squareNo);

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

        if ( right.reallyInside && !right.populated && 
              this.proceed(r, 'right', squareNo, mat ) ) {

            return true;
        } else if ( left.reallyInside && !left.populated && 
                  this.proceed(l, 'left', squareNo, mat ) ) {
            return true;
        } else if ( up.reallyInside&& !up.populated && 
                  this.proceed(u, 'up', squareNo, mat ) ) {
            return true;

        } else if ( down.reallyInside && !down.populated && 
                  this.proceed(d, 'down', squareNo, mat ) ) {
            return true;
        }

        //If function comes to this point, attempt has failed.
        //Reset and revert to previous square
        this.unusedArea += area;
        square.setArrow(6, mat, squareNo);
        this.squares[squareNo].populated = false;
        mat.removeSquare();
    } 
    else {
        //If the end needs to be divided into subsquares to reach a wall we will 
        // need to know which direction we came from
        if (mat.unusedArea < area && lastSubsquareNo == -1) {
            var arr;
            //From left or top
            if (dir > 1) {
                arr = [0, 1, 2, 3, 4];
                subsquareNo = 20;
            } else if ( dir == -1) {
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
        if ( this.placeSubsquare(squareNo, subsquareNo, mat, lastSquareNo, lastSubsquareNo) ) {
            return true;
        }   
    }
    return false;

    //End of placeSquare
}


/**
 * Function places a strip of 5 adjacent subsquares, intended to extend a series
 * of squares all the way to a wall.
 * @param squareNo - Index of the square to place the strip in
 * @param arr - Array of indexes of the 5 subsquares to be placed
 * @param mat - The heating mat currently being placed
 * @param lastSquareNo - Index of the last square placed
**/
ResultGrid.prototype.placeStrip = function(squareNo, arr, mat, lastSquareNo) {
    var squares = this.squares,
        square = squares[squareNo],
        subsquares = square.subsquares,
        timeout = Date.now(),
        nextArr = [],
        area = 10*10,
        added = false,
        squareFull = true,
        abort = false,
        width = this.squarewidth,
        supply = this.supplyPoint,
        dir = squareNo - lastSquareNo,
        u = squareNo - width,
        d = squareNo + width,
        l = squareNo - 1,
        r = squareNo + 1,
        up = squares[u],
        right = squares[r],
        left = squares[l],
        down = squares[d],
        offset,
        rstrip = [],
        lstrip = [],
        ustrip = [], 
        dstrip = [],
        arrowDir;

    //If the recursive placement is taking too long, abort mat
    if ( (timeout - mat.timestamp) > mat.validPeriod) {
        abort = true;
    }

    //If no subsquare structure exists, create one. 
    //Will happen if function is called because mat unused area is less
    // than a full square
    if (subsquares.length == 0) {
        for (var i = 0; i < 25; ++i) {
            var x = square.xpos + (i%5)*10,
                y = square.ypos + Math.floor(i/5)*10, 
                s = new Subsquare(x, y, this.paper, null, squareNo, i);

            s.insideRoom = true;
            this.squares[squareNo].subsquares.push(s);
        }
        added = true;
    }
    
    for (var i = 0; i < 5; ++i) {
        this.squares[squareNo].subsquares[arr[i]].populated = true;
        this.unusedArea -= area; 
        mat.addSubsquare();
    }



    //If end of mat is reached: check if new mat can be placed or if room is full,
    // if not revert and recurse
    if (mat.unusedArea == 0) {
        var squareList = [squareNo, u, r, l, d],
        correctWall = true;

        //Mats cannot end on same wall that contains the supplypoint
        if ( obstacles.supplyEnd && supply && 
             ( square.xpos >= supply[0] && square.xpos <= supply[1] && 
               square.ypos >= supply[2] && square.ypos <= supply[3] ) ) {
            correctWall = false;
        }

        //One subsquare must be adjacent to a valid wall segment
        if ( correctWall &&
             ( this.adjacentWall(squareList, arr[0]) || 
               this.adjacentWall(squareList, arr[1]) ||
               this.adjacentWall(squareList, arr[2]) ||
               this.adjacentWall(squareList, arr[3]) ||
               this.adjacentWall(squareList, arr[4]) )
             && ( this.unusedArea == 0 || this.findStart() ) ) {
            for (var i = 0; i < 5; ++i) {
                this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
            }
            return true;
        } else  {
            for (var i = 0; i < 5; ++i ) {
                this.unusedArea += area;
                mat.removeSubsquare();
            }
            if (added == true) {
                this.squares[squareNo].clearSubsquares();
            }
            this.squares[squareNo].populated = false;
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




    //NEEDS WORK
    if (arr[0] <= 4 && arr[4] >=20) {
        //Vertical strip - right/left placement
        rstrip = (arr[0] < 4) ? [arr[0]+1, arr[1]+1, arr[2]+1, arr[3]+1, arr[4]+1] : null;
        lstrip = (arr[0] > 0) ? [arr[0]-1, arr[1]-1, arr[2]-1, arr[3]-1, arr[4]-1] : null;
        ustrip = null;
        dstrip = null;
        offset = (dir == 1) ? 1 : -1;
    } else {
        //Horizontal strip - up/down placement
        ustrip = (arr[0] > 4) ? [arr[0]-5, arr[1]-5, arr[2]-5, arr[3]-5, arr[4]-5] : null;
        dstrip = (arr[0] < 20) ? [arr[0]+5, arr[1]+5, arr[2]+5, arr[3]+5, arr[4]+5] : null;
        rstrip = null;
        lstrip = null;
        offset = (dir == width) ? 5 : -5;
    }
    nextArr = [arr[0]+offset, arr[1]+offset, arr[2]+offset, arr[3]+offset, arr[4]+offset];

    if ( !abort && rstrip && this.arrFree(squareNo, rstrip) && 
         this.placeStrip(squareNo, rstrip, mat, lastSquareNo) ) {

        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        
        if (dir > 1) {
            arrowDir = 3;
        } else if (dir == 1) {
            arrowDir = 2;
        } else if (dir == -1) {
            arrowDir = 1;
        } else {
            arrowDir =0;
        }

        this.squares[squareNo].subsquares[arr[2]].setArrow(arrowDir, mat);
        return true;  
    } else if ( !abort && lstrip && this.arrFree(squareNo, lstrip) && 
         this.placeStrip(squareNo, lstrip, mat, lastSquareNo) ) {

        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        
        if (dir > 1) {
            arrowDir = 3;
        } else if (dir == 1) {
            arrowDir = 2;
        } else if (dir == -1) {
            arrowDir = 1;
        } else {
            arrowDir =0;
        }

        this.squares[squareNo].subsquares[arr[2]].setArrow(arrowDir, mat);
        return true;  
    } else if ( !abort && ustrip && this.arrFree(squareNo, ustrip) && 
         this.placeStrip(squareNo, ustrip, mat, lastSquareNo) ) {

        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        
        if (dir > 1) {
            arrowDir = 3;
        } else if (dir == 1) {
            arrowDir = 2;
        } else if (dir == -1) {
            arrowDir = 1;
        } else {
            arrowDir =0;
        }

        this.squares[squareNo].subsquares[arr[2]].setArrow(arrowDir, mat);
        return true;  
    } else if ( !abort && dstrip && this.arrFree(squareNo, dstrip) && 
         this.placeStrip(squareNo, dstrip, mat, lastSquareNo) ) {

        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        
        if (dir > 1) {
            arrowDir = 3;
        } else if (dir == 1) {
            arrowDir = 2;
        } else if (dir == -1) {
            arrowDir = 1;
        } else {
            arrowDir =0;
        }

        this.squares[squareNo].subsquares[arr[2]].setArrow(arrowDir, mat);
        return true;  
    }

    /*
    //Tries to place next strip inside square, if not it will try to populate the next
    // square in the order right-left-up-down
    if ( ( ( nextArr[0] >= 0 && nextArr[0] < 5 && nextArr[4] >= 20 && nextArr[4] < 25 ) ||
           ( nextArr[0] %5 == 0 && nextArr[0] >= 0 && nextArr[0] <= 20 )  ) && !abort &&
         this.arrFree(squareNo, nextArr) && this.placeStrip(squareNo, nextArr, mat, lastSquareNo) ) {

        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        
        if (dir > 1) {
            arrowDir = 3;
        } else if (dir == 1) {
            arrowDir = 2;
        } else if (dir == -1) {
            arrowDir = 1;
        } else {
            arrowDir =0;
        }

        this.squares[squareNo].subsquares[arr[2]].setArrow(arrowDir, mat);
        return true;
    }*/ else if ( (arr[4] % 5 == 4) && !right.populated && right.reallyInside && 
                right.subsquares.length == 0 && !abort && 
                this.placeSquare(r, 0, mat, squareNo, -1) ) {
        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        this.squares[squareNo].subsquares[arr[2]].setArrow(1, mat);
        return true;
    }  else if ( arr[0] % 5 == 4 && arr[4] % 5 == 4 && !right.populated && right.reallyInside && 
                !abort && this.arrFree(r, arr) && this.placeStrip(r, arr, mat, squareNo) ) {
        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        this.squares[squareNo].subsquares[arr[2]].setArrow(1, mat);
        return true;
    } else if ( arr[0] == 4 && arr[4]  == 24 && !right.populated && right.reallyInside &&  
                !abort && this.arrFree(r, [0, 5, 10, 15, 20]) && 
                this.placeStrip(u, [0, 5, 10, 15, 20], mat, squareNo) ) {
        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        this.squares[squareNo].subsquares[arr[2]].setArrow(1, mat);
        return true; 
    } else if ( (arr[0] % 5 == 0) && !left.populated && left.reallyInside &&
                left.subsquares.length == 0 && !abort &&
                this.placeSquare(l, 4, mat, squareNo, -1) ) {
        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        this.squares[squareNo].subsquares[arr[2]].setArrow(2, mat);
        return true;
    } else if ( arr[0] % 5 ==  0 && arr[0] % 5 == 4  && !left.populated && left.reallyInside && 
                !abort && this.arrFree(l, arr) && this.placeStrip(l, arr, mat, squareNo) ) {
        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        this.squares[squareNo].subsquares[arr[2]].setArrow(2, mat);
        return true;
    } else if ( arr[0] == 0 && arr[4] == 20 && !left.populated && left.reallyInside && 
                !abort && this.arrFree(l, [4, 9, 14, 19, 24]) &&
                this.placeStrip(u, [4, 9, 14, 19, 24], mat, squareNo) ) {
        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        this.squares[squareNo].subsquares[arr[2]].setArrow(2, mat);
        return true; 
    } else if ( arr[0] >= 0 && arr[0] < 5 && !up.populated && up.reallyInside && 
                up.subsquares.length == 0 && !abort &&
                this.placeSquare(u, 20, mat, squareNo, -1) ) {
        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        this.squares[squareNo].subsquares[arr[2]].setArrow(0, mat);
        return true;
    } else if ( arr[0] >= 0 && arr[0] < 5 && arr[4] >= 20 && !up.populated && up.reallyInside && 
                !abort && this.arrFree(u, arr) && this.placeStrip(u, arr, mat, squareNo) ) {
        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        this.squares[squareNo].subsquares[arr[2]].setArrow(0, mat);
        return true;
    } else if ( arr[0] == 0 && arr[4] == 4 && !up.populated && up.reallyInside && !abort && 
                this.arrFree(u, [20, 21, 22, 23, 24]) &&
                this.placeStrip(u, [20, 21, 22, 23, 24], mat, squareNo) ) {
        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        this.squares[squareNo].subsquares[arr[2]].setArrow(0, mat);
        return true;
    } else if ( (arr[4] >= 20 && arr[4] < 25 ) && !down.populated && down.reallyInside && 
                down.subsquares.length == 0 && !abort && 
                this.placeSquare(d, 0, mat, squareNo, -1) ) {
        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        this.squares[squareNo].subsquares[arr[2]].setArrow(3, mat);
        return true;
    } else if ( arr[0] >= 0 && arr[0] < 5 && arr[4] >= 20 && !down.populated && down.reallyInside && 
                !abort && this.arrFree(d, arr) && this.placeStrip(d, arr, mat, squareNo) ) {
        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        this.squares[squareNo].subsquares[arr[2]].setArrow(3, mat);
        return true;
    } else if ( arr[0] == 0 && arr[4] == 4 && !down.populated && down.reallyInside && !abort && 
                this.arrFree(d, [0, 1, 2, 3, 4])
                && this.placeStrip(d, [0, 1, 2, 3, 4], mat, squareNo) ) {
        for (var i = 0; i < 5; ++i) {
            this.squares[squareNo].subsquares[arr[i]].setArrow(9, mat);
        }
        this.squares[squareNo].subsquares[arr[2]].setArrow(0, mat);
        return true;
    } 

    //Exit plan
    for (var i = 0; i < 5; ++i) {
        this.squares[squareNo].subsquares[arr[i]].populated = false;
        this.unusedArea += area; 
        mat.removeSubsquare();
    }
    if (added == true) {
        this.squares[squareNo].clearSubsquares();
    }
    this.squares[squareNo].populated = false;
    return false;  
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
                s = new Subsquare(x, y, this.paper, null, squareNo, i);

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
        this.unusedArea -= area;
        mat.addSubsquare();

        //If end of mat is reached: check if new mat can be placed or if room is full,
        // if not revert and recurse
        if (mat.unusedArea == 0) {
            var squareList = [squareNo, squareNo-width, squareNo +1, squareNo-1, squareNo+width];
            
            if ( this.adjacentWall(squareList, subsquareNo) && ( this.unusedArea == 0 || this.findStart() ) ) {
                sub.setArrow(0, mat, subsquareNo);
                return true;
            } else  {
                this.unusedArea += area;
                mat.removeSubsquare();
                this.squares[squareNo].populated = false;
                //this.squares[squareNo].subsquares[subsquareNo].setArrow(4, mat, subsquareNo);
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
                 && this.placeSubsquare(squareNo, u, mat, squareNo, lastSubsquareNo) ) {

                this.squares[squareNo].subsquares[subsquareNo].setArrow(0, mat, subsquareNo);
                return true;
            }
        }
        //Right within same square
        if ( (r < 25) && (r%5 != 0) && abort == false) {
            right = subsquares[r];
            if ( !right.hasWall && !right.hasObstacle && !right.populated 
                 && this.placeSubsquare(squareNo, r, mat, squareNo, lastSubsquareNo) ) {
                this.squares[squareNo].subsquares[subsquareNo].setArrow(1, mat, subsquareNo);
                return true;
            }
        }
        //Left within same square
        if ( (l >= 0) && (l%5 != 4) && abort == false) {
            left = subsquares[l];
            if ( !left.hasWall && !left.hasObstacle && !left.populated 
                 && this.placeSubsquare(squareNo, l, mat, squareNo, lastSubsquareNo) ) {
                this.squares[squareNo].subsquares[subsquareNo].setArrow(2, mat, subsquareNo);
                return true;
            }
        }
        //Down inside same square
        if ( (d < 25) && abort == false) {
            down = subsquares[d];
            if ( !down.hasWall && !down.hasObstacle && !down.populated 
                 && this.placeSubsquare(squareNo, d, mat, squareNo, lastSubsquareNo) ) {
                this.squares[squareNo].subsquares[subsquareNo].setArrow(3, mat, subsquareNo);
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
        this.squares[squareNo].subsquares[subsquareNo].setArrow(4, mat, squareNo);
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

    // Stores the available area in options. converts it to m2 first.
    options.availableArea = (this.area / 10000);

    this.area -= 3000;
    this.area -= this.area%10000;
    this.unusedArea = this.area;

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
    //Else executes if subsquare structure already exists,
    // i.e. if the square contains obstacles or walls
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
        // (but can be populated)
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
                            s = new Subsquare(xtemp, ytemp, this.paper, null, currentSquare, n);

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

/**
* Checks that all subsquares in an array are free to populate, returns true
* if they are
* @param squareNo - Index of square in which subsquares are found
* @param arr - Array of subsquare indexes to be checked
**/
ResultGrid.prototype.arrFree = function(squareNo, arr) {

    var len = arr.length,
        sub;
    for (var i = 0; i < len; ++i) {
        sub = this.squares[squareNo].subsquares[arr[i]];
        if (!sub || sub.hasObstacle || sub.populated || sub.hasWall)  {
            return false;
        }
    }
    return true;
}

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
ResultGrid.prototype.proceed = function( squareNo, direction, lastSquareNo, mat ) {
    
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

            /*
            if ( dir > 1 ) {
                arr = [strip0, strip5, strip4, strip3, strip2, strip1];
            }
            else if ( dir == 1 ) {
                arr = [strip0, strip5, strip4, strip3, strip2, strip1];
            }
            else if ( dir < -1 ) {
                arr = [strip0, strip1, strip2, strip3, strip4, strip5];
            } else {*/
                arr = [strip0, strip5, strip4, strip3, strip2, strip1];
            //}
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

            /*
            if ( dir > 1 ) {
                arr = [strip5, strip4, strip3, strip2, strip1, strip0];
            }
            else if ( dir == 1 ) {
                arr = [strip0, strip5, strip4, strip3, strip2, strip1];
            }
            else if ( dir < -1 ) {
                arr = [strip1, strip2, strip3, strip4, strip5, strip0];
            } else {
                arr = [strip5, strip4, strip3, strip2, strip1, strip0];
            }
            */
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

            /*
            if ( dir > 1 ) {
                arr = [strip5, strip4, strip3, strip2, strip1, strip0];
            } else if ( dir == -1 ) {
                arr = [strip0, strip5, strip4, strip3, strip2, strip1];
            } else if ( dir < -1 ) {
                arr = [strip1, strip2, strip3, strip4, strip5, strip0];
            } else {
                arr = [strip0, strip5, strip4, strip3, strip2, strip1];
            }*/

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
            
            /*
            if ( dir > 1 ) {
                arr = [strip0, strip1, strip2, strip3, strip4, strip5];
            } else if ( dir == 1 ) {
                arr = [strip5, strip4, strip3, strip2, strip1, strip0];
            } else if ( dir == -1 ) {
                arr = [strip1, strip2, strip3, strip4, strip5, strip0];
            } else {
                arr = [strip0, strip1, strip2, strip3, strip4, strip5];
            }*/

            arr = [strip0, strip1, strip2, strip3, strip4, strip5];
            subsquare = 0;
            arrow = 3;
            break;
        
        default:
            return false;
    }

    //If the square does not have obstacles or walls, try placing a full square
    //If it does contain obstacles, try placing a strip instead
    if ( !square.hasObstacles && !square.hasWall) {
        if (this.placeSquare(squareNo, subsquare, mat, lastSquareNo, -1) ) {
            this.squares[lastSquareNo].setArrow(arrow, mat, lastSquareNo);
            return true;
        }      
    } else {
        for (var i = 0; i < 6; ++i) {
            if ( this.arrFree(squareNo, arr[i]) && 
                 this.placeStrip(squareNo, arr[i], mat, lastSquareNo) ) {
                return true;
            }
        }
    }
    return false;
}

/**
* Function creates an array of the squares that are adjacent to a wall, which
* gives a performance boost to findStart() 
**/
ResultGrid.prototype.createStartPoints = function() {

    var square,
        squares = this.squares,
        width = this.squarewidth,
        len = squares.length - width, 
        supply = this.supplyPoint;


    for (var i = width; i < len; ++i) {
        square = squares[i];
        //If not inside the supply boundaries we can skip to next square
        if (supply && (square.xpos <= supply[0] || square.xpos >= supply[1] || 
            square.ypos < supply[2] || square.ypos >= supply[3]) ) {
            continue;
        }
        var squareList = [i, i-width, i+1, i-1, i+width];
        if ( this.adjacentWall(squareList, -1) && square.reallyInside) {

            this.startSquares.push(i);
        }
    }
} 

