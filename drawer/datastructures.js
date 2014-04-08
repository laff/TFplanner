/*
 This file contains assorted minor structures used by resultGrid
  and their functions
 HeatingMat - Square - Subsquare - Mats
*/

/**
 * Constructor for the floor heating mats.
 * @param matLength - The length of the mat
 * @param timeoutLength - The time limit for this mat to be
 *  placed. If limit is exceeded, next length will be tried
 *  instead.
 * @param color - The color of the mat
**/
function HeatingMat(matLength, timeoutLength, color) {

	this.totalArea = (matLength * 50);
	this.unusedArea = this.totalArea;
    this.timestamp = Date.now();
    console.log("Timeoutlength is: " + timeoutLength + " Mat length is : " + matLength);
    this.validPeriod = timeoutLength ? timeoutLength : 3000;
    this.matColor = color;
    this.productNr;
    this.textPlaced = false;


    this.matId = mattur.matIndex;
    mattur.matIndex++;
}

/**
 * Reduces the available area by the area of one square
**/
HeatingMat.prototype.addSquare = function() {
	this.unusedArea -= 50*50;
}

/**
 * Reduces the available area by the area of one subsquare
**/
HeatingMat.prototype.addSubsquare = function() {
	this.unusedArea -= 10*10;
}

/**
 * Increases the available area by the area of one square
**/
HeatingMat.prototype.removeSquare = function() {
	this.unusedArea += 50*50;
}

/**
 * Increases the availalbe area by the area of one subsquare
**/
HeatingMat.prototype.removeSubsquare = function() {
	this.unusedArea += 10*10;
}

/**
 * Constructor for a 0.5m X 0.5m square
 * @param x - X coordinate of upper left corner
 * @param y - Y coordinate of upper left corner
 * @param path - The path string of the room
 * @param paper - The canvas of the grid
**/
function Square (x, y, path, paper, nr) {
    this.xpos = x;
    this.ypos = y;
    this.insideRoom = false;
    this.hasObstacles = false;
    this.hasWall = false;
    this.populated = false;
    this.subsquares = [];
    this.area = 0;
    this.paper = paper;
    this.arrows = paper.set();
    this.reallyInside = true;
    this.nr = nr;
    this.productNr;


    this.direction = null;
    // Square is texted
    this.texted = false;

    var xdim = 50, 
        ydim = 50,
        xsubdim = 10, 
        ysubdim = 10, 
        subsquare,
        subsquares = this.subsquares,
        ul = Raphael.isPointInsidePath( path, x,y ),
        ur = Raphael.isPointInsidePath( path, x + xdim, y ), 
        ll = Raphael.isPointInsidePath( path, x, y + ydim ),
        lr = Raphael.isPointInsidePath( path, x+xdim, y+ydim ),
        length = 0;

    this.rect = paper.rect(x, y, xdim, ydim).attr({
        'stroke-opacity': 0.2,
        'stroke-width': 0
    });

    //If whole square is inside
    if ( ul && ur && ll && lr ) {

        this.insideRoom = true;
        this.hasWall = false;
        this.area = xdim*ydim;
    }
    //If at least one corner is inside   
    else if (ul || ur || ll || lr) {
        this.insideRoom = true;
        this.hasWall = true;

        for (var i = 0; i < ydim; i += ysubdim) {
            for (var j = 0; j < xdim; j += xsubdim) {
                subsquare = new Subsquare(x+j, y+i, paper, path, this.nr, length);
                this.subsquares[length++] = subsquare;
                if (subsquare.insideRoom)
                    this.area += xsubdim*ysubdim;
            }
        }
    }
    //Whole square outside
    else {
        this.reallyInside = false;
    }
    //End of populateSquare()
}


/**
 *  Function that draws mats and shit based on the direction of the sun & wind.
 *  Stores lastdirection, right?
**/
Square.prototype.drawMatline = function(from) {

    var y = this.ypos,
        x = this.xpos,
        to = this.direction,
        paper = this.paper,
        attributes = {
            'stroke-opacity': 1, 
            'stroke': "#CB2C30", 
            'stroke-width': 3
        },
        direction = (from != 'productNr') ? (from + to) : from;
    this.arrows.remove();

    switch (direction) {

        case 'productNr':
            var texX = (x + 25),
                texY = (y + 25),
                tex = paper.text(x+25, y+25, this.productNr).attr({
                    'font-size': measurement.fontsize
                }),
                
                // Dynamic size of the rectangle surrounding the text.
                rectLen = (tex.getBBox().width + 10),
                rectHeight = (tex.getBBox().height),
                rectX = (texX - (rectLen / 2)),
                rectY = (texY - (rectHeight / 2)),

                rec = paper.rect(rectX, rectY, rectLen, rectHeight, 5, 5).attr({
                        opacity: 1,
                        fill: "white"
                    });

            tex.toFront();

            this.arrows.push(rec, tex);

            break;

        case 'rightright':
            this.arrows.push(paper.path("M"+(x)+", "+(y+25)+", L"+(x+50)+", "+(y+25)).attr(attributes));
            break;
            
        case 'leftleft':
            this.arrows.push(paper.path("M"+(x+50)+", "+(y+25)+", L"+(x)+", "+(y+25)).attr(attributes));
            break;

        case 'upup':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y)+", L"+(x+25)+", "+(y+50)).attr(attributes));
            break;

        case 'downdown':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y+50)+", L"+(x+25)+", "+(y)).attr(attributes));
            break;

        case 'upright':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y+50)+", L"+(x+25)+", "+(y+25)+", L"+(x+50)+", "+(y+25)).attr(attributes));
            break;

        case 'leftdown':
            this.arrows.push(paper.path("M"+(x+50)+", "+(y+25)+", L"+(x+25)+", "+(y+25)+", L"+(x+25)+", "+(y+50)).attr(attributes));
            break;

        case 'rightdown':
            this.arrows.push(paper.path("M"+(x)+", "+(y+25)+", L"+(x+25)+", "+(y+25)+", L"+(x+25)+", "+(y+50)).attr(attributes));
            break;

        case 'upleft': 
            this.arrows.push(paper.path("M"+(x+25)+", "+(y+50)+", L"+(x+25)+", "+(y+25)+", L"+(x)+", "+(y+25)).attr(attributes));
            break;

        case 'rightup':
            this.arrows.push(paper.path("M"+(x)+", "+(y+25)+", L"+(x+25)+", "+(y+25)+", L"+(x+25)+", "+(y)).attr(attributes));
            break;

        case 'downleft':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y)+", L"+(x+25)+", "+(y+25)+", L"+(x)+", "+(y+25)).attr(attributes));
            break;

        case 'downright':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y)+", L"+(x+25)+", "+(y+25)+", L"+(x+50)+", "+(y+25)).attr(attributes));
            break;

        case 'leftup':
            this.arrows.push(paper.path("M"+(x+50)+", "+(y+25)+", L"+(x+25)+", "+(y+25)+", L"+(x+25)+", "+(y)).attr(attributes));
            break;

        case 'nullup':
            this.arrows.push(paper.path("M"+(x+10)+", "+(y+35)+", L"+(x+40)+", "+(y+35)+", M"+(x+15)+", "+(y+25)+", L"+(x+35)+", "+(y+25)+", M"+(x+25)+", "+(y+25)+", L"+(x+25)+", "+(y)).attr(attributes));
            break;

        case 'nullright':
            this.arrows.push(paper.path("M"+(x+15)+", "+(y+10)+", L"+(x+15)+", "+(y+40)+", M"+(x+25)+", "+(y+15)+", L"+(x+25)+", "+(y+35)+", M"+(x+25)+", "+(y+25)+", L"+(x+50)+", "+(y+25)).attr(attributes));
            break;

        case 'nullleft':
            this.arrows.push(paper.path("M"+(x+35)+", "+(y+10)+", L"+(x+35)+", "+(y+40)+", M"+(x+25)+", "+(y+15)+", L"+(x+25)+", "+(y+35)+", M"+(x+25)+", "+(y+25)+", L"+(x)+", "+(y+25)).attr(attributes));
            break;

        case 'nulldown':
            this.arrows.push(paper.path("M"+(x+10)+", "+(y+15)+", L"+(x+40)+", "+(y+15)+", M"+(x+15)+", "+(y+25)+", L"+(x+35)+", "+(y+25)+", M"+(x+25)+", "+(y+25)+", L"+(x+25)+", "+(y+50)).attr(attributes));
            break;

        case 'upnull':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y+50)+", L"+(x+25)+", "+(y+25)+", M"+(x+15)+", "+(y+25)+", L"+(x+15)+", "+(y+25)).attr(attributes));
            break;

        case 'rightnull':
            this.arrows.push(paper.path("M"+(x)+", "+(y+25)+", L"+(x+25)+", "+(y+25)+", M"+(x+25)+", "+(y+15)+", L"+(x+25)+", "+(y+35)).attr(attributes));
            break;

        case 'leftnull':
            this.arrows.push(paper.path("M"+(x+50)+", "+(y+25)+", L"+(x+25)+", "+(y+25)+", M"+(x+25)+", "+(y+15)+", L"+(x+25)+", "+(y+35)).attr(attributes));
            break;

        case 'downnull':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y)+", L"+(x+25)+", "+(y+25)+", M"+(x+15)+", "+(y+25)+", L"+(x+35)+", "+(y+25)).attr(attributes));
            break;

        default: 
            this.arrows.push(paper.text(x+25, y+25, direction).attr({
                'font-size': 12 
            }));
            break;
    }
}

/**
 *  This function adds arrows to the squares.
 *  In addition it sets a color to the squares, even tho the function name doesnt give that away.
**/
Square.prototype.setArrow = function(dir, mat, squareNo) {

    this.productNr = mat.productNr;

    if (dir < 5 && dir >= 0) {
        mattur.addSquare(mat.matId, squareNo);
    }

    this.rect.attr({'fill': mat.matColor});

    switch (dir) {
        //up
        case 0: 
            this.direction = 'up';
            //this.arrows.push(paper.path("M"+(x+25)+", "+(y+35)+", L"+ (x+25)+", "+(y+ 15)).attr(attributes));
            break;
        //right
        case 1:
            this.direction = 'right';
            //this.arrows.push(paper.path("M"+(x+15)+", "+(y+25)+", L"+ (x+35)+", "+(y+25)).attr(attributes));
            break;
        //left
        case 2: 
            this.direction = 'left';
            //this.arrows.push(paper.path("M"+(x+35)+", "+(y+25)+", L"+ (x+15)+", "+(y+ 25)).attr(attributes));
            break;
        //down
        case 3:
            this.direction = 'down';
            //this.arrows.push(paper.path("M"+(x+25)+", "+(y+15)+", L"+ (x+25)+", "+(y+35)).attr(attributes));
            break;

        case 4:
            this.direction = null;
            //this.arrows.push(paper.circle(x+25, y+25, 3).attr({'fill': "#E73029", 'fill-opacity': 1}));
            break;
        case 6:
            this.rect.attr({'fill': "white"});
            break;

        default: 
            break;
    }
}

/**
 * Returns true if all the subsquares along a square edge contains a wall.
 * If this function returns true we can "shift" the wall to the next square (if unoccupied),
 * this allows us to maximize number of "wall-less" squares.
 * @param arr - Array of subsquares to be checked (one square edge) 
**/
Square.prototype.movableWall = function(arr) {
	var sub = this.subsquares;

	if ( sub[arr[0]].hasWall && sub[arr[1]].hasWall && sub[arr[2]].hasWall && sub[arr[3]].hasWall && sub[arr[4]].hasWall )
		return true;

	return false;
}

/**
 * Removes wall elements along a square edge
 * @param arr - Array containing subsquares to be removed (one square edge)
**/
Square.prototype.removeWall = function(arr) {
	var subsquare,
		area = 10*10,
		subNo;

	for (var i = 0; i < 5; ++i) {
		subNo = arr[i];
		if (this.subsquares[subNo].hasWall) {
			this.subsquares[subNo].hasWall = false;
			this.area += area;
		}
	}
	for (var i = 0; i < 25; ++i ) {
		subsquare = this.subsquares[i];
		if (subsquare.hasWall || subsquare.hasObstacle) 
			return;
	}

	//If function has not returned yet, there are no internal walls or obstacles left.
	//In this situation we clear the subsquares and revert to "empty" square
	this.hasWall = false;
	this.clearSubsquares();
}

/**
 * Function clears the subsquare array of the square
**/
Square.prototype.clearSubsquares = function() {
	this.hasWall = false;
	this.hasObstacles = false;
	for (var i = 24; i >= 0 ; --i){
		this.subsquares[i].rect.remove();
		this.subsquares.pop();
	}
}

/**
 * Adds wall elements along a square edge
 * Function does not add usable area to the room, that is done by the removeWall-function
 * @param arr - Array of wall elements to be added (one square edge)
**/
Square.prototype.addWall = function(arr) {
	var length = 0,
		xdim = 50,
		ydim = 50, 
		subdim = 10;

	//Populates with subsquares if there isn't a subgrid already
	if ( !(this.hasWall || this.hasObstacles) ) {
		for ( var i = 0; i < ydim; i += subdim) {
	        for (var j = 0; j < xdim; j += subdim) {
	            this.subsquares[length++] = new Subsquare(this.xpos+j, this.ypos+i, this.paper, null, this.nr);
	        }
	    }
	}	
	
	for (var i = 0; i < 5; ++i) { 
		this.subsquares[arr[i]].hasWall = true;
		this.subsquares[arr[i]].insideRoom = true;
	}
	this.hasWall = true;
}

/**
 * Constructor for 10 cm X 10 cm subsquare
 * @param x - X coordinate for upper left corner
 * @param y - Y coordinate for upper left corner
 * @param paper - Canvas for 
**/
function Subsquare (x, y, paper, path, squareNo, subNo) {

    this.insideRoom = false;
    this.hasObstacle = false;
    this.hasWall = false;
    this.populated = false;
    this.rect;
    this.paper = paper;
    this.x = x;
    this.y = y;
    this.direction = null;
    this.arrows = paper.set();
    this.squareNo = squareNo;
    this.subNo = subNo;

    var xdim = 10,
        ydim = 10,
        ul = false,
        ur = false,
        ll = false,
        lr = false;

    //Checks whether all corners are inside of room
    //If path == null this check does not to be done, it is quite
    // time consuming
    if (path != null) {
        ul = Raphael.isPointInsidePath( path, x,y );
        ur = Raphael.isPointInsidePath( path, x + xdim, y ); 
        ll = Raphael.isPointInsidePath( path, x, y + ydim );
        lr = Raphael.isPointInsidePath( path, x+xdim, y+ydim );
    }
    this.rect = paper.rect(x, y, xdim, ydim);

    //Subsquares are either in or out, if they are
    // "partially in" it means they contain a wall
    if ( ul && ur && ll && lr) {
        this.rect.attr({
            'stroke-width': 0.1
        });
        this.insideRoom = true;
    } 
    else if (ul || ur || ll || lr) {
        this.rect.attr({
            'stroke-width': 0.1
        });
        this.hasWall = true;
    }
    else {
        this.rect.attr ({
            'stroke-width': 0.1
        });
    }
}

/**
 * OBS: The if-check after the switch may not need to check all those values, Anders?
**/
Subsquare.prototype.setArrow = function(dir, mat) {
    var paper = this.paper,
        x = this.x,
        y = this.y;

    this.rect.attr({
        'fill': mat.matColor,
        'fill-opacity': 0.7
    });

    this.arrows.remove();

    switch (dir) {
        //up
        case 0: 
            this.direction = 'up';
            //this.arrows = (paper.path("M"+(x+2.5)+", "+(y+4)+", L"+ (x+2.5)+", "+(y+ 2)));
            break;
        //right
        case 1:
            this.direction = 'right';
            //this.arrows = (paper.path("M"+(x+2)+", "+(y+2.5)+", L"+ (x+4)+", "+(y+2.5)));
            break;
        //left
        case 2: 
            this.direction = 'left';
            //this.arrows = (paper.path("M"+(x+4)+", "+(y+2.5)+", L"+ (x+2)+", "+(y+ 2.5)));
            break;
        //down
        case 3:
            this.direction = 'down';
            //this.arrow = (paper.path("M"+(x+2.5)+", "+(y+2)+", L"+ (x+2.5)+", "+(y+4)));
            break;

        case 4:
            this.rect.attr({
                'fill': "white",
                'fill-opacity': 1,
                'stroke-width': 0.1
            });
            this.direction = null;
            break;

        default:
            break;   
    }

    if (dir < 4 && dir >= 0 && this.insideRoom == true && this.squareNo != undefined) {
        mattur.addSubsquare(mat.matId, this);
    }
}


/**
 *  Ninja constructor for our heatingmats
 *  Basically containing number of mats and what squares they are placed in / order.
 *
**/
function Mats () {
    this.list = [];
    this.subList = [];
    this.subObj = [];
    this.matIndex = 0;
}


/**
 * Function that adds squares to the mats they "belong" to.
 * @param mati - 
 * @param squareNo - Index of the square to be added
*/
Mats.prototype.addSquare = function(mati, squareNo) {

    if (this.list[mati] == null) {
        this.list[mati] = [];
    } 

    if (($.inArray(squareNo, this.list[mati])) < 0) {
        this.list[mati].push(squareNo);
    }
}



/**
 * Subsquares are re-drawn, so they ALWAYS get different ID`s, need to come 
 * up with a clever solution.
 */
Mats.prototype.addSubsquare = function (mati, subsquare) {
    var num = subsquare.squareNo;

    if (this.subList[num] == null) {
        this.subList[num] = [];
    }

    if (($.inArray(subsquare.subNo, this.subList[num])) < 0)  {
        // Adds subsquares to arrays, these arrays is traversed and 'cleaned' in resultgrid.
        this.subList[num].push(subsquare.subNo);
        this.subObj.push(subsquare);
    }
}

/**
 * Pretty much the same functionality as drawMatLine, but this is done in subsquares, and must use
 * some different coordinates.
 * @param from - what direction the mat 'comes from'.
 * @param subsquare - The actual subsquare-object, we need coordinates and some stuff from it.
**/
Mats.prototype.drawSubMat = function (from, subsquare) {

    var y = subsquare.y,
        x = subsquare.x,
        to = subsquare.direction,
        paper = subsquare.paper,
        attributes = {
            'stroke': "red"
        },

    direction = from+to;

    //TODO: We might want a default-case AND; what should we do when we get 'something''null'
    switch (direction) {
        case 'rightright':
            paper.path("M"+(x)+", "+(y+5)+", L"+(x+10)+", "+(y+5)).attr(attributes);
            break;

        case 'leftleft':
            paper.path("M"+(x+10)+", "+(y+5)+", L"+(x)+", "+(y+5)).attr(attributes);
            break;

        case 'upup':
            paper.path("M"+(x+5)+", "+(y+10)+", L"+(x+5)+", "+(y)).attr(attributes);
            break;

        case 'downdown':
            paper.path("M"+(x+5)+", "+(y)+", L"+(x+5)+", "+(y+10)).attr(attributes);
            break;

        case 'downleft':
            paper.path("M"+(x+5)+", "+(y)+", L"+(x+5)+", "+(y+5)+", L"+(x)+", "+(y+5)).attr(attributes);
            break;
         
        case 'upright':
            paper.path("M"+(x+5)+", "+(y+10)+", L"+(x+5)+", "+(y+5)+", L"+(x+10)+", "+(y+5)).attr(attributes);
            break;

        case 'leftdown':
            paper.path("M"+(x+10)+", "+(y+5)+", L"+(x+5)+", "+(y+5)+", L"+(x+5)+", "+(y+10)).attr(attributes);
            break;
 
        case 'rightdown':
            paper.path("M"+(x)+", "+(y+5)+", L"+(x+5)+", "+(y+5)+", L"+(x+5)+", "+(y+10)).attr(attributes);
            break;

        case 'upleft': 
            paper.path("M"+(x+5)+", "+(y+10)+", L"+(x+5)+", "+(y+5)+", L"+(x)+", "+(y+5)).attr(attributes);
            break;

        case 'rightup':
            paper.path("M"+(x)+", "+(y+5)+", L"+(x+5)+", "+(y+5)+", L"+(x+5)+", "+(y)).attr(attributes);
            break;

        case 'downleft':
            paper.path("M"+(x+5)+", "+(y)+", L"+(x+5)+", "+(y+5)+", L"+(x)+", "+(y+5)).attr(attributes);
            break;

        case 'downright':
            paper.path("M"+(x+5)+", "+(y)+", L"+(x+5)+", "+(y+5)+", L"+(x+10)+", "+(y+5)).attr(attributes);
            break;

        case 'leftup':
            paper.path("M"+(x+10)+", "+(y+5)+", L"+(x+5)+", "+(y+5)+", L"+(x+5)+", "+(y)).attr(attributes);
            break;

        case 'nullup':
            paper.path("M"+(x+5)+", "+(y+5)+", L"+(x+5)+", "+(y)).attr(attributes);
            break;

        case 'nullright':
            paper.path("M"+(x+5)+", "+(y+5)+", L"+(x+10)+", "+(y+5)).attr(attributes);
            break;

        case 'nullleft':
            paper.path("M"+(x+5)+", "+(y+5)+", L"+(x)+", "+(y+5)).attr(attributes);
            break;

        case 'nulldown':
            paper.path("M"+(x+5)+", "+(y+5)+", L"+(x+5)+", "+(y+10)).attr(attributes);
            break;
/*
        case 'upnull':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y+50)+", L"+(x+25)+", "+(y+25)+", M"+(x+15)+", "+(y+25)+", L"+(x+15)+", "+(y+25)).attr(attributes));
            break;

        case 'rightnull':
            this.arrows.push(paper.path("M"+(x)+", "+(y+25)+", L"+(x+25)+", "+(y+25)+", M"+(x+25)+", "+(y+15)+", L"+(x+25)+", "+(y+35)).attr(attributes));
            break;

        case 'leftnull':
            this.arrows.push(paper.path("M"+(x+50)+", "+(y+25)+", L"+(x+25)+", "+(y+25)+", M"+(x+25)+", "+(y+15)+", L"+(x+25)+", "+(y+35)).attr(attributes));
            break;
    
        case 'downnull':
            paper.path("M"+(x+5)+", "+(y)+", L"+(x+5)+", "+(y+5)).attr(attributes);
            break;
    */        
    }
}