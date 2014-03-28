//Constructor for the floor heating mats,
//takes length in cm as parameter
//Param timeoutLength is for choosing the timespan before
// the mat times out and reverts. NOT CURRENTLY IMPLEMENTED
function HeatingMat(matLength, timeoutLength, color) {

	this.totalArea = (matLength * 50);
	this.unusedArea = this.totalArea;
    this.timestamp = (Date.now() / 1000);
    this.validPeriod = timeoutLength ? timeoutLength : 3;
    this.matColor = color;
    this.productNr;
    this.textPlaced = false;


    this.matId = mattur.matIndex;
    mattur.matIndex++;

}

HeatingMat.prototype.addSquare = function() {
	this.unusedArea -= 50*50;
}

HeatingMat.prototype.addSubsquare = function() {
	this.unusedArea -= 10*10;
}

HeatingMat.prototype.removeSquare = function() {
	this.unusedArea += 50*50;
}

HeatingMat.prototype.removeSubsquare = function() {
	this.unusedArea += 10*10;
}


//Constructor for a 0.5m X 0.5m square
function Square (x, y, path, paper) {
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

    this.rect = paper.rect(x, y, xdim, ydim);

    //If whole square is inside
    if (  ul && ur && ll && lr ) {

        this.insideRoom = true;
        this.hasWall = false;
        this.area = xdim*ydim;
    }
    //If at least one corner is inside   
    else if ( ul || ur || ll || lr) {
        this.insideRoom = true;
        this.hasWall = true;

        for ( var i = 0; i < ydim; i += ysubdim) {
            for (var j = 0; j < xdim; j += xsubdim) {
                subsquare = new Subsquare(x+j, y+i, paper, path);
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
            'stroke': "#E73029", 
            'stroke-width': 3
        },
        attribut = {
            'stroke-opacity': 1, 
            'stroke': "#E73029", 
            'stroke-width': 3,
            "arrow-end": "classic-midium-midium"
        },
        attributts = {
            'stroke-opacity': 1, 
            'stroke': "#E73029", 
            'stroke-width': 3
        },
        direction = (from != 'productNr') ? (from + to) : from;

    this.arrows.remove();

    switch (direction) {

        case 'productNr':
            var rec = paper.rect(x-5, y+15, 60, 20, 5, 5).attr({
                    opacity: 1,
                    fill: "white"
               }),

                tex = paper.text(x+28, y+25, this.productNr).attr({
                    'font-size': 12 
                });

            this.arrows.push(rec, tex);

            break;

        case 'rightright':
            this.arrows.push(paper.path("M"+(x)+", "+(y+25)+", L"+ (x+50)+", "+(y+25)).attr(attributes));
            break;
            
        case 'leftleft':
            this.arrows.push(paper.path("M"+(x+50)+", "+(y+25)+", L"+ (x)+", "+(y+25)).attr(attributes));
            break;

        case 'upup':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y)+", L"+ (x+25)+", "+(y+50)).attr(attributes));
            break;

        case 'downdown':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y+50)+", L"+ (x+25)+", "+(y)).attr(attributes));
            break;

        case 'upright':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y+50)+", L"+ (x+25)+", "+(y+25)+", L"+ (x+50)+", "+(y+25)).attr(attributes));
            break;

        case 'leftdown':
            this.arrows.push(paper.path("M"+(x+50)+", "+(y+25)+", L"+ (x+25)+", "+(y+25)+", L"+ (x+25)+", "+(y+50)).attr(attributes));
            break;

        case 'rightdown':
            this.arrows.push(paper.path("M"+(x)+", "+(y+25)+", L"+ (x+25)+", "+(y+25)+", L"+ (x+25)+", "+(y+50)).attr(attributes));
            break;

        case 'upleft': 
            this.arrows.push(paper.path("M"+(x+25)+", "+(y+50)+", L"+ (x+25)+", "+(y+25)+", L"+ (x)+", "+(y+25)).attr(attributes));
            break;

        case 'rightup':
            this.arrows.push(paper.path("M"+(x)+", "+(y+25)+", L"+ (x+25)+", "+(y+25)+", L"+ (x+25)+", "+(y)).attr(attributes));
            break;

        case 'downleft':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y)+", L"+ (x+25)+", "+(y+25)+", L"+ (x)+", "+(y+25)).attr(attributes));
            break;

        case 'downright':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y)+", L"+ (x+25)+", "+(y+25)+", L"+ (x+50)+", "+(y+25)).attr(attributes));
            break;

        case 'leftup':
            this.arrows.push(paper.path("M"+(x+50)+", "+(y+25)+", L"+ (x+25)+", "+(y+25)+", L"+ (x+25)+", "+(y)).attr(attributes));
            break;

        case 'nullup':
            this.arrows.push(paper.path("M"+(x+15)+", "+(y+25)+", L"+ (x+35)+", "+(y+25)+", M"+ (x+25)+", "+(y+25)+", L"+ (x+25)+", "+(y)).attr(attributts));
            break;

        case 'nullright':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y+15)+", L"+ (x+25)+", "+(y+35)+", M"+ (x+25)+", "+(y+25)+", L"+ (x+50)+", "+(y+25)).attr(attributts));
            break;

        case 'nullleft':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y+15)+", L"+ (x+25)+", "+(y+35)+", M"+ (x+25)+", "+(y+25)+", L"+ (x)+", "+(y+25)).attr(attributts));
            break;

        case 'nulldown':
            this.arrows.push(paper.path("M"+(x+15)+", "+(y+25)+", L"+ (x+35)+", "+(y+25)+", M"+ (x+25)+", "+(y+25)+", L"+ (x+25)+", "+(y+50)).attr(attributts));
            break;

        case 'upnull':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y+50)+", L"+ (x+25)+", "+(y+25)).attr(attribut));
            break;

        case 'rightnull':
            this.arrows.push(paper.path("M"+(x)+", "+(y+25)+", L"+ (x+25)+", "+(y+25)).attr(attribut));
            break;

        case 'leftnull':
            this.arrows.push(paper.path("M"+(x+50)+", "+(y+25)+", L"+ (x+25)+", "+(y+25)).attr(attribut));
            break;

        case 'downnull':
            this.arrows.push(paper.path("M"+(x+25)+", "+(y)+", L"+ (x+25)+", "+(y+25)).attr(attribut));
            break;

        default: 
            this.arrows.push(paper.text(x+28, y+25, direction).attr({
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
            this.direction = 'hell';
            //this.arrows.push(paper.circle(x+25, y+25, 3).attr({'fill': "#E73029", 'fill-opacity': 1}));
            break;

        default: 
            break;
    }

   //     this.arrows.remove();


 //   if (mat.lastDirection == null) {
 //       mat.lastDirection = currentDirection;
 //   }

/*
    if (this.texted) {
        mat.lastDirection = currentDirection;
        return;
    }
*/
    //drawLineard(currentDirection, mat.lastDirection);


    //mat.lastDirection = currentDirection;

    /*
    if (mat.textPlaced == 2) {

        paper.rect(x-5, y+15, 60, 20, 5, 5).attr({
            opacity: 1,
            fill: "white"
        });

        paper.text(x+28, y+25, mat.productNr).attr({
            'font-size': 12 
        });

        this.texted = true;

        this.arrows.remove();     
    }
    mat.textPlaced++;
    */
}

//Checks whether all the subsquares along a square edge contains a wall.
// If this function returns true we can "shift" the wall to the next square (if unoccupied),
// this allows us to maximize number of "wall-less" squares 
Square.prototype.movableWall = function(arr) {
	var sub = this.subsquares;

	if ( sub[arr[0]].hasWall && sub[arr[1]].hasWall && sub[arr[2]].hasWall && sub[arr[3]].hasWall && sub[arr[4]].hasWall )
		return true;

	return false;
}

//Removes wall elements along a squares edge
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

//Function clears the subsquare array of the square
Square.prototype.clearSubsquares = function() {
	this.hasWall = false;
	this.hasObstacles = false;
	for (var i = 24; i >= 0 ; --i){
		this.subsquares[i].rect.remove();
		this.subsquares.pop();
	}
}

//Adds wall elements along a squares edge
//Function does not add area to the room given, that is done by the removeWall-function
Square.prototype.addWall = function(arr) {
	var length = 0,
		xdim = 50,
		ydim = 50, 
		subdim = 10;

	//Populates with subsquares if there isn't a subgrid already
	if ( !(this.hasWall || this.hasObstacles) ) {
		for ( var i = 0; i < ydim; i += subdim) {
	        for (var j = 0; j < xdim; j += subdim) {
	            this.subsquares[length++] = new Subsquare(this.xpos+j, this.ypos+i, this.paper, null);
	        }
	    }
	}	
	
	for (var i = 0; i < 5; ++i) { 
		this.subsquares[arr[i]].hasWall = true;
		this.subsquares[arr[i]].insideRoom = true;
	}
	this.hasWall = true;
}

//Constructor for 0.1m X 0.1m square
function Subsquare (x, y, paper, path) {
    this.insideRoom = false;
    this.hasObstacle = false;
    this.hasWall = false;
    this.populated = false;
    this.rect;

    var xdim = 10,
        ydim = 10,
        ul = false,
        ur = false,
        ll = false,
        lr = false;

    // Normal operation, but these cnecks are unneccesary if we willingly move a wall
    // or divide a square we know is inside
    if (path != null) {
        ul = Raphael.isPointInsidePath( path, x,y );
        ur = Raphael.isPointInsidePath( path, x + xdim, y ); 
        ll = Raphael.isPointInsidePath( path, x, y + ydim );
        lr = Raphael.isPointInsidePath( path, x+xdim, y+ydim );
    }
    this.rect = paper.rect(x, y, xdim, ydim);

    //Subsquares are either in or out
    if ( ul && ur && ll && lr) {
        this.rect.attr({
            'stroke-width': 0.1
        });
        this.insideRoom = true;
        this.hasWall = false;
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

Subsquare.prototype.setArrow = function(dir, mat) {
    this.rect.attr({
        'fill': mat.matColor,
        'fill-opacity': 0.7
    });

    if (dir == 4) {
        this.rect.attr({
            'fill': "white",
            'fill-opacity': 1
        });        
    }
}

/**
 *  Ninja constructor for our heatingmats
 *  Basically containing number of mats and what squares they are placed in / order.
 *
**/
function Mats () {
    this.list = [];
    this.matIndex = 0;
}


/**
 *  Function that adds squares to the mats they "belong" to.
**/
Mats.prototype.addSquare = function(mati, squareNo) {

    if (this.list[mati] == null) {
        this.list[mati] = [];
    }

    if (($.inArray(squareNo, this.list[mati])) < 0) {
        this.list[mati].push(squareNo);

    }
}