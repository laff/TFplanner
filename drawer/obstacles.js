/**
 *	Constructor for the obstacles class
 *
**/
function Obstacles() {

	this.paper = grid.paper;
	this.xPos = 0;
	this.yPos = 0;
	this.defaultH = 40;
	this.defaultW = 40;
	this.obstacleSet = this.paper.set();

}

Obstacles.prototype.typeHandler = function(num) {

	switch (num) {

		// creating new obstacle.
		case 1:
			this.createObstacle();
			break;

		// Undo creating of obstacle.
		case 2: 
			this.obstacleSet.remove();
			break;

		default:
			return;
	}
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
Obstacles.prototype.createObstacle = function () {

	this.updateXY();

	// Variables related to positioning declared first.
	var x = this.xPos,
		y = this.yPos,
		w = this.defaultW,
		h = this.defaultH,

	// Paper shortcut
		paper = this.paper,

		obstacle = paper.rect(x, y, w, h).attr({
			fill: '#E73029',
			'fill-opacity': 0.4,
	        'stroke-opacity': 0.4
		});

	this.obstacleSet.push(obstacle);

	this.adjustSize();
}

Obstacles.prototype.adjustSize = function () {

	var obstacles = this.obstacleSet;

	console.log(obstacles);
	console.log("last obstacle / to be adjusted: "+obstacles[(obstacles.length - 1)]);

}