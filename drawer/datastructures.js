/*
 This file contains assorted minor structures used by resultGrid
  and their functions
 HeatingMat - Square - Subsquare
*/

/**
 * Constructor for the floor heating mats.
 * @param matLength - The length of the mat
 * @param timeoutLength - The time limit for this mat to be
 *  placed. If limit is exceeded, next length will be tried
 *  instead.
**/
function HeatingMat(matLength, timeoutLength) {

	this.totalArea = (matLength * 50);
	this.unusedArea = this.totalArea;
    this.timestamp = Date.now();
    this.validPeriod = timeoutLength ? timeoutLength : 500;
    this.matColor = null;
    this.productNr;
    this.textPlaced = false;
    this.path = [];
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
* Function draws the visualization line, as well as start and end
* points, onto the paper.
* @param paper - The paper the line is drawn onto
*/
HeatingMat.prototype.draw = function(paper) {
    var path = this.path,
        len = path.length,
        pathString = '',
        x,
        y, 
        start,
        end,
        textBox,
        text;


    for (var i = len-1; i >= 0; --i) {
        x = path[i][0];
        y = path[i][1];

        if (i == len-1) {
            if ( x-path[i-1][0] < 0 ) {
                //Start arrow pointing right
                start = paper.path('M'+(x-5)+','+(y-5)+'L'+x+','+y+'L'+(x-5)+','+(y+5)+'Z');            
            } else if ( x-path[i-1][0] > 0 ) {
                //Start arrow pointing left
                start = paper.path('M'+(x+5)+','+(y-5)+'L'+x+','+y+'L'+(x+5)+','+(y+5)+'Z');
            } else if ( y-path[i-1][1] > 0) {
                //Arrow pointing up
                start = paper.path('M'+(x-5)+','+y+'L'+x+','+(y-5)+'L'+(x+5)+','+y+'Z');
            } else {
                //Arrow pointing downward
                start = paper.path('M'+(x-5)+','+y+'L'+x+','+(y+5)+'L'+(x+5)+','+y+'Z');
            }
            start.attr({
                'fill': '#CB2C30',
                'stroke': '#CB2C30'
            });
            pathString += ('M'+x+','+y);
        } else if (i == len-3 ) {

            text = paper.text(x, y, this.productNr).attr({
                    'font-size': TFplanner.measurement.fontsize
                });

            // Dynamic size of the rectangle surrounding the text.
            var rectLen = (text.getBBox().width + 10),
                rectHeight = (text.getBBox().height),
                rectX = (x - (rectLen / 2)),
                rectY = (y - (rectHeight / 2));

            textBox = paper.rect(rectX, rectY, rectLen, rectHeight, 5, 5).attr({
                opacity: 1,
                fill: "white"
            });

            pathString += ('L'+x+','+y);
        } else if ( i == 0) {
            end = paper.path('M'+(x-5)+','+y+'L'+x+','+(y-5)+'L'+(x+5)+','+y+'L'+x+','+(y+5)+'Z');
            end.attr({
                'fill': '#CB2C30',
                'stroke': '#CB2C30'
            });
            pathString += ('L'+x+','+y);
        } else {
            pathString += ('L'+x+','+y);
        }
    }
    //Draws the actual line
    paper.path(pathString).attr({
        'stroke': '#CB2C30',
        'stroke-width': 1
    });
    textBox.toFront();
    text.toFront();

    //End of draw()
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
        'stroke-width': 0.1
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

/*
* Function adds the mat color to the square, then creates and stores
* the coordinates of the centre of the square. THis is later
* used for drawing connecting red line through the mat.
* @param mat - The mat currently in use
*/
Square.prototype.setPath = function(mat) {

    var path = [this.xpos+25, this.ypos+25];
    mat.path.push(path);
    this.rect.attr({'fill': mat.matColor});
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
		//this.subsquares[i].rect.remove();
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

    var xdim = 10,
        ydim = 10,
        ul = false,
        ur = false,
        ll = false,
        lr = false;

    //Checks whether all corners are inside of room
    //If path == null this check does not need to be done, it is quite
    // time consuming
    if (path != null) {
        ul = Raphael.isPointInsidePath( path, x,y );
        ur = Raphael.isPointInsidePath( path, x + xdim, y ); 
        ll = Raphael.isPointInsidePath( path, x, y + ydim );
        lr = Raphael.isPointInsidePath( path, x+xdim, y+ydim );
    }

    //Subsquares are either in or out, if they are
    // "partially in" it means they contain a wall
    if ( ul && ur && ll && lr) {
        this.insideRoom = true;
    } else if (ul || ur || ll || lr) {
        this.hasWall = true;
    }
}

/**
* Function sets color of the subsquare to the color
* of the mat.
* @param mat - The heating mat in use
*/
Subsquare.prototype.setColor = function(mat) {
    var paper = this.paper,
        x = this.x,
        y = this.y;

    this.rect = paper.rect(x, y, 10, 10);

    this.rect.attr({
        'stroke-width': 0,
        'fill': mat.matColor
    });
}

/**
* Function stored the coordinates of the centre of the subsquare
* @param mat - The heating mat in use
*/
Subsquare.prototype.setPath = function(mat) {
    var path = [this.x+5, this.y+5];
    mat.path.push(path); 
}
