/**
 *	Constructor for the obstacles class
 *
**/
function Obstacles() {

	this.paper = grid.paper;
	this.xPos = 0;
	this.yPos = 0;
	this.obstacleSet = this.paper.set();
	this.lineSet = this.paper.set();

}

/**
 *	Function that updates the X and Y coordinates for the obstacle default position.
 *
**/
Obstacles.prototype.updateXY = function() {

	this.xPos = this.paper._viewBox[0];
	this.yPos = this.paper._viewBox[1];
}

/**
 *	Function that draws a circular drain on the grid paper.
 *
**/
Obstacles.prototype.createObstacle = function (num) {

	var w, 
		h,
		obst = this;

	// Setting w and h values based on input
	switch (num) {

		// drain
		case '1':
			w = 40;
			h = 40;
			break;

		// toilet
		case '2': 
			w = 40;
			h = 80;
			break;

		// shower
		case '3':
			w = 90;
			h = 90;
			break;

		// bathtub
		case '4':
			w = 165;
			h = 80;
			break;

		default:
			return;
	}


	//this.updateXY();

	// Variables related to positioning declared first.
	var x = 100,
		y = 100,


	// Paper shortcut
		paper = this.paper,

		obstacle = paper.rect(x, y, w, h).attr({
			fill: '#E73029',
			'fill-opacity': 0.4,
	        'stroke-opacity': 0.4
		});

	var start = function() {
		this.ox = this.attr("x");
		this.oy = this.attr("y");

		this.attr({'fill-opacity': 0.6});
	},

	move = function(dx, dy) {

		var xy = grid.getZoomedXY(dx, dy, true),
			newx = this.ox + xy[0],
			newy = this.oy + xy[1];

		newx = (Math.round((newx / 10)) * 10);
		newy = (Math.round((newy / 10)) * 10);

        this.attr({
        	x: newx,
        	y: newy
        });


        obst.nearestWalls(null, this);
	},
	up = function () {

		this.attr({'fill-opacity': 0.4});

	};

	obstacle.drag(move, start, up);

	this.obstacleSet.push(obstacle);
}

Obstacles.prototype.adjustSize = function (i, w, h) {

	var obstacle = this.obstacleSet[i];

	obstacle.attr({
		'width': w, 
		'height': h
	});

	// update lenght line
	this.nearestWalls(i);
}


/**
 *	Function that visually selects an obstacle by changing its fill color.
 *
**/
Obstacles.prototype.selectObstacle = function (id) {

	var obstacleArr = this.obstacleSet,
		obstacleLength = obstacleArr.length;

	for (var i = 0; i < obstacleLength; i++) {

		if (i == id) {
			obstacleArr[i].attr({fill: '#3366FF'});
		} else {
			obstacleArr[i].attr({fill: '#E73029'});
		}

	}

	this.nearestWalls(id);
}


/**
 *	Function that visualizes the the nearest horizontal and vertical wall of an object.
 *
 *
**/
Obstacles.prototype.nearestWalls = function (id, obst) {

	// Declaring obstacle center coordinates
	var obstacle = (id != null) ? this.obstacleSet[id] : obst,
		cx = (obstacle.attr("x") + (obstacle.attr("width") / 2)),
		cy = (obstacle.attr("y") + (obstacle.attr("height") / 2)),

	// Declaring wall variables.
		walls = ourRoom.walls,
		hWalls = [],
		wWalls = [],
		hWall,
		wWall,

	// Function that finds nearest wall.
		nearest = function(xWalls, xy) {
			var tmplen1 = null,
				tmplen2 = null,
				tmplen3 = null,
				len = null,
				align = (xy == 1) ? cx : cy;

			for (var i = 0; i < xWalls.length; i++) {

				if (len == null) {
					len = (xWalls[i][0][xy] - align);
				} else {

					// Store length
					tmplen1 = (xWalls[i][0][xy] - align);

					// convert if negative
					tmplen2 = (tmplen1 < 0) ? (tmplen1 * -1) : tmplen1;
					tmplen3 = (len < 0) ? (len * -1) : len;


					if (tmplen2 < tmplen3) {
						len = tmplen1;
					}
				}
			}
			return len;
		};


	// Find the horizontal and vertical walls.
	for (var i = 0; i < walls.length; i++) {

		// Declaring temporary variables for this wall.
		var wall = walls[i].attrs.path,
			p1x = wall[0][1],
			p1y = wall[0][2],
			p2x = wall[1][1],
			p2y = wall[1][2],

			// helpers
			order = false,
			store = false;

		// Finding and storing horizontal walls
		// Only store wall if it is within the span of the horizontal wall.
		if (p1x == p2x) {
			order = (p1y < p2y) ? true : false;

			if (order) {
				store = (cy < p2y && cy > p1y) ? true : false;
			} else {
				store = (cy > p2y && cy < p1y) ? true : false;
			}

			if (store) {
				hWalls.push(wall);
			}
			
		
		// Vertical walls.
		// Only store wall if it is whithin the span of the vertical wall.
		} else if (p1y == p2y) {
			order = (p1x < p2x) ? true : false;
			store = false;

			if (order) {
				store = (cx < p2x && cx > p1x) ? true : false;
			} else {
				store = (cx > p2x && cx < p1x) ? true : false;
			}

			if (store) {
				wWalls.push(wall);
			}
		}
	}

	hWall = nearest(hWalls, 1);
	wWall = nearest(wWalls, 2);

	this.lengthLine(obstacle, cx, cy, hWall, wWall);

}

/**
 *	Function that draws lines that show length from obstacle to nearest walls.
 *
**/
Obstacles.prototype.lengthLine = function(obstacle, cx, cy, w, h) {

	// clear previous lines and text
	this.lineSet.remove();


	var Rad, 
		P1, 
		P2,
		that = this,
		measurementO = function(p1, p2) {

			var line,
				textPoint,
				textRect,
				text,
				length;

			line = that.paper.path("M"+P1[0]+","+P1[1]+"L"+P2[0]+","+P2[1]).attr( {
				stroke: '#ff0000'
			});

			// calculating length of
			length = ourRoom.vectorLength(P1[0], P1[1], P2[0], P2[1]);
			textPoint = line.getPointAtLength((length / 2));

			length = (new Number(length) / 100);

			textRect = that.paper.rect(textPoint.x-25, textPoint.y-10, 50, 20, 5, 5).attr({
	            opacity: 1,
	            fill: "white"
	        });

			text = that.paper.text(textPoint.x, textPoint.y, length + " m").attr({
	            opacity: 1,
	            'font-size': 12,
	            'font-family': "verdana",
	            'font-style': "oblique"
	        });

	        that.lineSet.push(line, textRect, text);
		};

	// Create the horizontal line
	if (w != null) {

		Rad = (obstacle.attr("width") / 2);
		Rad = (w < 0) ? (Rad * (-1)) : Rad;
		P1 = [(cx + w), cy];
		P2 = [(cx + Rad), cy];

		measurementO(P1, P2);
		

	}

	if (h != null) {
		Rad = (obstacle.attr("height") / 2);
		Rad = (h < 0) ? (Rad * (-1)) : Rad;
		P1 = [cx, (cy + Rad)];
		P2 = [cx, (cy + h)];
	
		measurementO(P1, P2);
	}
}

/**
 * Used for clearing the sets that show the obstacles and length-stuff.
 * Called when we are pushing the 'new' button.
**/
Obstacles.prototype.clearSets = function () {

	obstacles.obstacleSet.remove();
	obstacles.obstacleSet.clear();
	obstacles.lineSet.remove();
	obstacles.lineSet.clear();
}
