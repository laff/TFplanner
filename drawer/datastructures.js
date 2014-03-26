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
    this.textPlaced = 0;
    this.lastDirection = null;
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
 *  This function adds arrows to the squares.
 *  In addition it sets a color to the squares, even tho the function name doesnt give that away.
**/
Square.prototype.setArrow = function(dir, mat) {
    var paper = this.paper,
        that = this,
        y = this.ypos,
        x = this.xpos,
        currentDirection,
        attributes = {
            'stroke-opacity': 1, 
            'stroke': "#E73029", 
            'stroke-width': 3,
            "arrow-end": "classic-midium-midium"
        },
        drawLineard = function(from, to) {
            
            var x1,
                x2,
                y1, 
                y2,
                direction = (from != null) ? (from + to) : to;

            console.log(direction);

            that.arrows.push(paper.path("M"+(x+25)+", "+(y+35)+", L"+ (x+25)+", "+(y+ 15)).attr(attributes));

        };

    if (mat.textPlaced == 2) {
        // put that text in there
     //   console.log("place text"+ mat.productNr);
    } else {
        mat.textPlaced++;
    }

    this.rect.attr({'fill': mat.matColor});    
        
   if (dir != 4) {
        this.arrows.remove();
   }

    if (this.texted) {
        return;
    }

    switch (dir) {
        //up
        case 0: 
            currentDirection = 'up';
            //this.arrows.push(paper.path("M"+(x+25)+", "+(y+35)+", L"+ (x+25)+", "+(y+ 15)).attr(attributes));
            break;
        //right
        case 1:
            currentDirection = 'right';
            //this.arrows.push(paper.path("M"+(x+15)+", "+(y+25)+", L"+ (x+35)+", "+(y+25)).attr(attributes));
            break;
        //left
        case 2: 
            currentDirection = 'left';
            //this.arrows.push(paper.path("M"+(x+35)+", "+(y+25)+", L"+ (x+15)+", "+(y+ 25)).attr(attributes));
            break;
        //down
        case 3:
            currentDirection = 'down';
            //this.arrows.push(paper.path("M"+(x+25)+", "+(y+15)+", L"+ (x+25)+", "+(y+35)).attr(attributes));
            break;

        case 4:
            this.arrows.push(paper.circle(x+25, y+25, 3).attr({'fill': "#E73029", 'fill-opacity': 1}));
            break;

        default: 
            break;
    }

    drawLineard(mat.lastDirection, currentDirection);

    mat.lastDirection = currentDirection;

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
