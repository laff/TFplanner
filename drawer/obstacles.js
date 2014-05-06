/**
 * @class Used when the user choose to add obstacles in the room.
**/
function Obstacles() {

	this.paper = TFplanner.grid.paper;
	this.obstacleSet = this.paper.set();
	this.txtSet = this.paper.set();
	this.lineSet = this.paper.set();
}

Obstacles.prototype.xPos = 0;
Obstacles.prototype.yPos = 0;
Obstacles.prototype.supplyPoint = null;
// True means that the mat needs to both start and end at the supplypoint/wall.
// false means that it will start at the supplypoint/wall but not end there.
Obstacles.prototype.supplyEnd = true;

/**
 * Function that draws obstacles on the grid paper, 
 * based on the size defined here.
 * @param num - The internal value of the added obstacle
 * @param txt - The text to be set on the obstacle
**/
Obstacles.prototype.createObstacle = function(num, txt) {

	var w, 
		h,
		x = 100,
		y = 100,
		ns = TFplanner,
		paper = this.paper,
		obst = this,
		obstacle,
		txtPoint,
		txtField,
		
		/**
		 *	Function that finds the wall that is most western.
		 *	Returns its middlepoint.
		**/
		westernWall = function() {

			var walls = TFplanner.ourRoom.walls,
				wall,
				newWall,
				west = null;

			for (var i = 0, ii = walls.length; i < ii; i++) {

				wall = walls[i];

				if (west === null) {
					west = wall.getPointAtLength((wall.getTotalLength() / 1.75));

				} else {
					newWall = wall.getPointAtLength((wall.getTotalLength() / 1.75));

					if (newWall.x < west.x) {
						west = newWall;
					}
				}
			}

			x = west.x;
			y = west.y;
		};

	// Setting width and height values based on input
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
			w = 170;
			h = 80;
			break;
		// Connection-point
		case '5':
			w = 10;
			h = 10;
			westernWall();
			break;
		// Bench
		case '6':
			w = 200;
			h = 70;
			break;
		// Chimney
		case '7':
			w = 100;
			h = 100;
			break;
		// Obstacle with no name, so the user can define the name and values herself.
		case '8':
			w = 100;
			h = 100;
			break;

		default:
			return;
	}

	// Obstacle created
	obstacle = paper.rect(x, y, w, h).attr({
		fill: '#E73029',
		'fill-opacity': 0.4,
		'stroke-opacity': 0.4
	});

	// Define the id of the preferred supplypoint, added by the user.
	// If multiple supplypoints, the first one will be used!
	if (this.supplyPoint === null && num == 5) {
		this.supplyPoint = obstacle.id;
	}

	// Storing custom data.
	obstacle.data('obstacleType', txt);

	// Obstacle text related variables.
	txtPoint = {x: (x + (w / 2)), y: (y + (h / 2))};
	txtField = paper.text(txtPoint.x, txtPoint.y, txt).attr({
			opacity: 1,
			'font-size': 12,
			'font-family': 'verdena',
			'font-style': 'oblique'
	}).toBack();

	var start = function() {

			this.ox = this.attr('x');
			this.oy = this.attr('y');
			w = this.attr('width');
			h = this.attr('height');
			
			this.startTime = Date.now();

			this.latency = TFplanner.latency;

			obst.selectObstacle();

			this.attr({fill: '#3366FF'});

			obst.nearestWalls(null, this);

			for (var i = 0, ii = obst.obstacleSet.length; i < ii; i++) {

				if (this == obst.obstacleSet[i]) {
					this.rectID = i;
					break;
				}
			}
		},

		move = function(dx, dy) {

			var xy = (!ns.grid.zoomed) ? [dx, dy] : ns.grid.getZoomedXY(dx, dy, true),
				newx = this.ox + xy[0],
				newy = this.oy + xy[1],
				obstx,
				obsty,
				nowTime,
				timeDiff;

			newx = (Math.round((newx / 10)) * 10);
			newy = (Math.round((newy / 10)) * 10);

			// Updates obstacle list :)
			if (this.rectID) {
				ns.options.obstacleList(this.rectID);
			}

			// Updating measurements every 50 ms
			nowTime = Date.now();
			timeDiff = (nowTime - this.startTime);

			if (timeDiff > this.latency) {

				this.attr({
					x: newx,
					y: newy
				});

				// Obstacle text related action
				obstx = (newx + (w / 2));
				obsty = (newy + (h / 2));

				txtField.attr({
					x: obstx,
					y: obsty
				});

				obst.nearestWalls(null, this);
				this.startTime = nowTime;
			}
		},

		up = function() {

			this.attr({fill: '#E73029'});

			obst.lineSet.remove();
			obst.lineSet.clear();
		};

	obstacle.drag(move, start, up);

	this.obstacleSet.push(obstacle);
	this.txtSet.push(txtField);
};

/**
 * Action related to the placement of obstacle-text.
 * @param i - Index of the targeted obstacle
 * @param w - The width of the obstacle
 * @param h - The height of the obstacle
 * @param x - X-coordinate of the obstacle
 * @param y - Y-coordinate of the obstacle
**/
Obstacles.prototype.adjustSize = function(i, w, h, x, y) {

	var obstx = (x + (w / 2)),
		obsty = (y + (h / 2));

	this.obstacleSet[i].attr({
		'width': w, 
		'height': h,
		x : parseInt(x),
		y : parseInt(y)
	});

	this.txtSet[i].attr({
		x : obstx,
		y : obsty
	});

	// Update the lenght line
	this.nearestWalls(null, this.obstacleSet[i]);
};


/**
 * Function that visually selects an obstacle by changing its fill color.
 * @param id - Id of the targeted obstacle
**/
Obstacles.prototype.selectObstacle = function(id) {

	for (var i = 0, ii = this.obstacleSet.length; i < ii; i++) {

		if (i == id) {
			this.obstacleSet[i].attr({fill: '#3366FF'});

		} else {
			this.obstacleSet[i].attr({fill: '#E73029'});
		}
	}

	if (id != null) {
		this.nearestWalls(id);

	} else {
		this.lineSet.remove();
		this.lineSet.clear();
	}
};

/**
 * Remove the obstacle, based on which remove-button that was pushed.
 * @param id(string) - Id of targeted obstacle for deletion
**/
Obstacles.prototype.deleteObstacle = function(id) {

	for (var i = 0, ii = this.obstacleSet.length; i < ii; i++) { 
		// Match on the ID, clean text and obstacle, and return
		if (i == id) {
			this.obstacleSet.splice(i, 1).remove();
			this.txtSet.splice(i, 1).remove();
			this.lineSet.remove();
			this.lineSet.clear();
			return;
		}
	}
};

/**
 * Function that visualizes the the nearest horizontal
 * and vertical wall of the targeted obstacle.
 * @param id - Id of the obstacle
 * @param obst - Current targeted obstacle
**/
Obstacles.prototype.nearestWalls = function(id, obst) {

	// Declaring obstacle center coordinates
	var obstacle = (id != null) ? this.obstacleSet[id] : obst,
		cx = (obstacle.attr('x') + (obstacle.attr('width') / 2)),
		cy = (obstacle.attr('y') + (obstacle.attr('height') / 2)),
		walls = TFplanner.ourRoom.walls,
		maxX = 0,
		maxY = 0,
		tmp1x, tmp1y, tmp2x, tmp2y,
		tri,
		that = this,

		/**
		 * Function that draw lines that show length from obstacle to nearest walls.
		**/
		lengthLine = function() {

			var rad, 
				P1, 
				P2,
				/**
				 * Calculates length from the obstacle to the nearest wall
				**/
				measurementO = function() {

					var textRect,
						textPoint,
						text,
						line = that.paper.path('M'+P1[0]+','+P1[1]+' L'+P2[0]+','+P2[1]).attr( {
							stroke: '#3366FF'
						}),
						length = (TFplanner.ourRoom.vectorLength(P1[0], P1[1], P2[0], P2[1]) / 100).toFixed(2);

					// Do not show the length-stuff unless it is >= 20cm.
					if (length >= 0.20) {
						textPoint = line.getPointAtLength((length / 2));
						textRect = that.paper.rect(textPoint.x-25, textPoint.y-10, 50, 20, 5, 5).attr({
							opacity: 1,
							fill: 'white'
						});

						text = that.paper.text(textPoint.x, textPoint.y, length + ' m').attr({
							opacity: 1,
							'font-size': 12,
							'font-family': 'verdana',
							'font-style': 'oblique'
						});
					}

					that.lineSet.push(line, textRect, text);
				};

			// Create the horizontal line
			if (tri === 1 || tri === 3) {

				rad = ((obstacle.attr('width') / 2) * (-1));
				P1 = [100, cy];
				P2 = [(cx + rad), cy];
				measurementO();
			} 
			// Creating vertical line
			if (tri === 2 || tri === 3) {
				
				rad = ((obstacle.attr('height') / 2) * (-1));
				P1 = [cx, 100];
				P2 = [cx, (cy + rad)];
				measurementO();
			}
		};

	// Removing past lines.
	this.lineSet.remove();
	this.lineSet.clear();

	// Returning if the obstacle is outside room (to the left or top).
	if (cx < 100 || cy < 100) {
		return;
	}

	// Check if the cx or cy is out of bounds in regards to the room
	for (var i = 0, ii = walls.length; i < ii; i++) {

		tmp1x = walls[i].attrs.path[0][1];
		tmp1y = walls[i].attrs.path[0][2];
		tmp2x = walls[i].attrs.path[1][1];
		tmp2y = walls[i].attrs.path[1][2];

		// Chained ternaries
		maxX = (tmp1x > maxX) ? (tmp2x > tmp1x) ? tmp2x : tmp1x : maxX;
		maxY = (tmp1y > maxY) ? (tmp2y > tmp1y) ? tmp2y : tmp1y : maxY;
	}

    /**
     * This variable tells the lengthline function to draw either one or both lines.
	 * 1: Draw the horizontal line
	 * 2: Draw the vertical line
	 * 3: Draw both
	**/
	tri = (cx < maxX) ? (cy < maxY) ? 3 : 2 : (cy < maxY) ? 1 : null;

	lengthLine();
};

/**
 * Used for clearing the sets that show the obstacles and length-stuff.
 * Called when we are pushing the 'new' button.
**/
Obstacles.prototype.clearSets = function() {

	this.obstacleSet.remove();
	this.obstacleSet.clear();
	this.txtSet.remove();
	this.txtSet.clear();
	this.lineSet.remove();
	this.lineSet.clear();
};
