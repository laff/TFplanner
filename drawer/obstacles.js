/**
 *	Constructor for the obstacles class
 *
**/
function Obstacles() {

	this.paper = grid.paper;
	this.xPos = 0;
	this.yPos = 0;
	this.obstacleSet = this.paper.set();

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
		h;

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


	this.updateXY();

	// Variables related to positioning declared first.
	var x = this.xPos,
		y = this.yPos,

	// Paper shortcut
		paper = this.paper,

		obstacle = paper.rect(x, y, w, h).attr({
			fill: '#E73029',
			'fill-opacity': 0.4,
	        'stroke-opacity': 0.4
		}),

	start = function() {
		this.ox = this.attr("x");
		this.oy = this.attr("y");

		this.attr({'fill-opacity': 0.6});
	},

	move = function(dx, dy) {

		var xy = grid.getZoomedXY(dx, dy),
			newx = this.ox + xy[0],
			newy = this.oy + xy[1];

		newx = (Math.round((newx / 10)) * 10);
		newy = (Math.round((newy / 10)) * 10);

        this.attr({
        	x: newx,
        	y: newy
        });

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
}