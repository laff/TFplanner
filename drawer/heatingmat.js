//Constructor for the floor heating mats,
//takes length in cm as parameter
function HeatingMat(matLength) {
	this.totalArea = matLength*50;
	this.unusedArea = this.totalArea;
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
    this.arrow = null;
    this.paper = paper;

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

        this.rect.attr({
            'fill': "cyan",
            'fill-opacity': 0.2
        });
        this.insideRoom = true;
        this.hasWall = false;
        this.area = xdim*ydim;
    }
    //If at least one corner is inside   
    else if ( ul || ur || ll || lr) {
        var id = 0;
        for ( var i = 0; i < ydim; i += ysubdim) {
            for (var j = 0; j < xdim; j += xsubdim) {
                subsquare = new Subsquare(x+j, y+i, path, paper, id++);
                this.hasWall = true;
                this.rect.attr({
                    'stroke': "blue"
                });
                this.insideRoom = true;
                this.subsquares[length++] = subsquare;
                if (subsquare.insideRoom)
                    this.area += xsubdim*ysubdim;
            }
        }
    }
    //Whole square outside
    else {
        this.rect.attr({
            'fill': "red",
            'fill-opacity': 0.6
        });
    }
    //End of populateSquare()
}

Square.prototype.setArrow = function(dir) {
    var paper = this.paper,
        y = this.ypos,
        x = this.xpos,
        attributes = {
                    'stroke-opacity': 1, 
                    'stroke': "#E73029", 
                    'stroke-width': 3,
                    "arrow-end": "classic-midium-midium"
                };
    if (dir != 4)
        this.arrow.remove();

    switch (dir) {
        //up
        case 0: 
            this.arrow = paper.path("M"+(x+25)+", "+(y+35)+", L"+ (x+25)+", "+(y+ 15)).attr(attributes);
            break;
        //right
        case 1:
            this.arrow = paper.path("M"+(x+15)+", "+(y+25)+", L"+ (x+35)+", "+(y+25)).attr(attributes);
            break;
        //left
        case 2: 
            this.arrow = paper.path("M"+(x+35)+", "+(y+25)+", L"+ (x+15)+", "+(y+ 25)).attr(attributes);
            break;
        //down
        case 3:
            this.arrow = paper.path("M"+(x+25)+", "+(y+15)+", L"+ (x+25)+", "+(y+35)).attr(attributes);
            break;
        case 4:
            this.arrow = paper.circle(x+25, y+25, 3).attr({'fill': "#E73029", 'fill-opacity': 1});
            break;
        default: 
            break;
    }
}


//Constructor for 0.1m X 0.1m square
function Subsquare (x, y, path, paper, squarenumber) {
    this.id = squarenumber;
    this.insideRoom = false;
    this.hasObstacle = false;
    this.hasWall = false;
    this.populated = false;
    this.rect;

    var xdim = 10,
        ydim = 10,
        ul = Raphael.isPointInsidePath( path, x,y ),
        ur = Raphael.isPointInsidePath( path, x + xdim, y ), 
        ll = Raphael.isPointInsidePath( path, x, y + ydim ),
        lr = Raphael.isPointInsidePath( path, x+xdim, y+ydim );
    this.rect = paper.rect(x, y, xdim, ydim);

    //Subsquares are either in or out
    if ( ul && ur && ll && lr) {
        this.rect.attr({
            'fill': "green",
            'fill-opacity': 0.2,
            'stroke-width': 0.1
        });
        this.insideRoom = true;
        this.hasWall = false;
    } 
    else if (ul || ur || ll || lr) {
        this.rect.attr({
            'fill': "blue",
            'fill-opacity': 0.2,
            'stroke-width': 0.1
        });
        this.hasWall = true;
    }
    else {
        this.rect.attr ({
            'fill': "yellow",
            'fill-opacity': 0.2,
            'stroke-width': 0.1
        });
    }
}
