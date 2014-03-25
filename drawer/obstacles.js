/**
 *	Constructor for the obstacles class
 *
**/
function Obstacles () {

	this.paper = grid.paper;
	this.xPos = 0;
	this.yPos = 0;
	this.obstacleSet = this.paper.set();
	this.txtSet = this.paper.set();
	this.lineSet = this.paper.set();
}

/**
 *	Function that updates the X and Y coordinates for the obstacle default position.
 *
**/
Obstacles.prototype.updateXY = function () {

	this.xPos = this.paper._viewBox[0];
	this.yPos = this.paper._viewBox[1];
}

/**
 *	Function that draws obstacles on the grid paper, based on the size defined here.
 *
**/
Obstacles.prototype.createObstacle = function (num, txt) {

	var w, 
		h,
		x = 100,
		y = 100,
		paper = this.paper;
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

		// Connection-point
		case '5':
			w = 10;
			h = 10;
			break;
		// Bench
		case '6':
			w = 200;
			h = 70;
			break;

		case '7':
			w = 100;
			h = 100;
			break;

		case '8':
			w = 100;
			h = 100;
			break;

		default:
			return;
	}

	// obstacle declared
	var obstacle = paper.rect(x, y, w, h).attr({
			fill: '#E73029',
			'fill-opacity': 0.4,
	        'stroke-opacity': 0.4
		});

	// Define the id of the preferred supplypoint, added by the user.
	// If multiple supplypoints, the first one will be used!
	if (this.supplyPoint == null && num == 5) {
		this.supplyPoint = obstacle.id;
	}

	// Storing custom data.
	obstacle.data('obstacleType', txt);

	// obstacle text related variables.
	var txtPoint = new Point((x + (w / 2)), (y + (h / 2))),
		txtField = paper.text(txtPoint.x, txtPoint.y, txt).attr({
			opacity: 1,
			'font-size': 12,
			'font-family': 'verdena',
			'font-style': 'oblique'
		});

	txtField.toBack();


	var start = function () {
			this.ox = this.attr("x");
			this.oy = this.attr("y");

			obst.selectObstacle();

			this.attr({fill: '#3366FF'});

			obst.nearestWalls(null, this);

			for (var i = 0; i < obst.obstacleSet.length; i++) {
				if (this == obst.obstacleSet[i]) {
					this.rectID = i;
					break;
				}
			}

		},

		move = function (dx, dy) {

			var xy = grid.getZoomedXY(dx, dy, true),
				newx = this.ox + xy[0],
				newy = this.oy + xy[1];


			// Updates obstacle list :)
			if (this.rectID != null) {
				options.obstacleList(this.rectID);
			}
			

			newx = (Math.round((newx / 10)) * 10);
			newy = (Math.round((newy / 10)) * 10);

	        this.attr({
	        	x: newx,
	        	y: newy
	        });

	        // obstacle text related action
	        var obstx = (newx + (w / 2)),
	        	obsty = (newy + (h / 2));

	        txtField.attr({
	        	x: obstx,
	        	y: obsty
	        });


	        obst.nearestWalls(null, this);
		},

		up = function () {

			this.attr({fill: '#E73029'});

			obst.lineSet.remove();
			obst.lineSet.clear();

		};

	obstacle.drag(move, start, up);

	this.obstacleSet.push(obstacle);
	this.txtSet.push(txtField);
}

Obstacles.prototype.adjustSize = function (i, w, h, x, y) {

	var obstacle = this.obstacleSet[i],
		text = this.txtSet[i],
		// obstacle text related action
		obstx = (x + (w / 2)),
		obsty = (y + (h / 2));

	obstacle.attr({
		'width': w, 
		'height': h,
		x : parseInt(x),
		y : parseInt(y)
	});

	text.attr({
		x : obstx,
		y : obsty
	});

	// update lenght line
	this.nearestWalls(null, obstacle);
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

	if (id != null) {
		this.nearestWalls(id);
	} else {
		this.lineSet.remove();
		this.lineSet.clear();
	}
}

/**
 * Remove the obstacle, based on which remove-button that was pushed.
**/
Obstacles.prototype.deleteObstacle = function (id) {

	var obstacleArr = this.obstacleSet,
		obstacleLength = obstacleArr.length,
		txtSet = this.txtSet;

	for (var i = 0; i < obstacleLength; i++) { 

		if (i == id) {
			var tmp = obstacleArr.splice(i, 1);
			tmp.remove();
			tmp = txtSet.splice(i, 1);
			tmp.remove();
			this.lineSet.remove();
			this.lineSet.clear();
			return;
		}
	}
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
		walls = ourRoom.walls,
		maxX = 0,
		maxY = 0,
		// variable with three options, 1, 2 or 3.
		// This variable tells the lengthline function to draw either or both lines.
		tri;

	// removing past lines.
	this.lineSet.remove();
	this.lineSet.clear();


	// returning if the obstacle is outside room (to the left or top).
	if (cx < 100 || cy < 100) {
		return;
	}

	// check if the cx or cy is out of bounds in regards to the room
	for (var i = 0; i < walls.length; i++) {

		var tmp1x = walls[i].attrs.path[0][1],
			tmp1y = walls[i].attrs.path[0][2],
			tmp2x = walls[i].attrs.path[1][1], 
			tmp2y = walls[i].attrs.path[1][2];

		// chained ternaries
		maxX = (tmp1x > maxX) ? (tmp2x > tmp1x) ? tmp2x : tmp1x : maxX;
		maxY = (tmp1y > maxY) ? (tmp2y > tmp1y) ? tmp2y : tmp1y : maxY;
	}


	// 1: draw the horizontal line
	// 2: draw the vertical line
	// 3: draw both
	// chained ternaries.
	tri = (cx < maxX) ? (cy < maxY) ? 3 : 2 : (cy < maxY) ? 1 : null;

	this.lengthLine(obstacle, cx, cy, tri);
}

/**
 *	Function that draws lines that show length from obstacle to nearest walls.
 *
**/
Obstacles.prototype.lengthLine = function (obstacle, cx, cy, tri) {

	var rad, 
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
				stroke: '#3366FF'
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
	if (tri == 1 || tri == 3) {
		rad = ((obstacle.attr("width") / 2) * (-1));
		P1 = [100, cy];
		P2 = [(cx + rad), cy];
		measurementO(P1, P2);

	// Creating vertical line
	} 

	if (tri == 2 || tri == 3) {
		
		rad = ((obstacle.attr("height") / 2) * (-1));
		P1 = [cx, 100];
		P2 = [cx, (cy + rad)];
		measurementO(P1, P2);
	}
}

/**
 * Used for clearing the sets that show the obstacles and length-stuff.
 * Called when we are pushing the 'new' button.
**/
Obstacles.prototype.clearSets = function () {
	this.obstacleSet.remove();
	this.obstacleSet.clear();
	this.txtSet.remove();
	this.txtSet.clear();
	this.lineSet.remove();
	this.lineSet.clear();
}
