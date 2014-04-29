/**
 * Class that holds the functionality to draw a room from scratch
 * @param radius - Decides the radius of the wall-end forcefield
**/
function DrawRoom(radius) {
    this.radius = radius;
    this.lastPoint = null;
    this.walls = TFplanner.grid.paper.set();
    this.tmpWall = null;
    this.tmpLen = null;
    this.tmpRect = null;
    this.tmpCircle = null;
    this.proximity = false;
    this.invalid = false;
    this.finished = false;
    this.xAligned = false;
    this.yAligned = false;
    this.minAngle = 29.95;
    this.maxAngle = 330.05; 
    this.minLength = 50;
    this.selfDrawn = true;
}

/**
 * Function that initiates drawing of a room.
**/
DrawRoom.prototype.initRoom = function() {

    var room = this,
        point,
        tmp,

        /**
         * Function that display the length of a wall that is being drawn
         * at all times when the mouse is moved around.
         * @param tmpWall - The drawn temporary-wall, to show the length of.
        **/
        tmpLength = function (tmpWall) {

            var theGrid = TFplanner.grid,
                theRoom = TFplanner.ourRoom,
                textPoint = tmpWall.getPointAtLength((tmpWall.getTotalLength()/2)),
                len = new Number(tmpWall.getTotalLength())/100;

                len = len.toFixed(2);

            // Draws a rectangle, where the length can be displayed.
            if (theRoom.tmpRect === null) {
                theRoom.tmpRect = theGrid.paper.rect(textPoint.x-25, textPoint.y-10, 50, 20, 5, 5).attr({
                    opacity: 1,
                    fill: 'white'
                });

            // If the rectangle already exists, we only update its position.
            } else {
                theRoom.tmpRect.attr({
                    x: textPoint.x-25,
                    y: textPoint.y-10,
                });
            }

            // Create the text-element that show the length of the wall.
            if (theRoom.tmpLen === null) {
                theRoom.tmpLen = theGrid.paper.text(textPoint.x, textPoint.y, len + ' m').attr({
                    opacity: 1,
                    'font-size': 12,
                    'font-family': 'verdana',
                    'font-style': 'oblique'
                });

            // If the text-element already exist, we just update the position and the text.
            } else {
                theRoom.tmpLen.attr({
                    x: textPoint.x,
                    y: textPoint.y,
                    text: len + ' m' 
               });
            }
        };

    // Binds action for mousedown.
    $('#canvas_container').click(room, function(e) {

        point = room.crossBrowserXY(e);

        // Return if point is null or the target nodename is "tspan".
        // This fixes coordinate bugs.
        if (point === null || e.target.nodeName == 'tspan') {
            return;
        }

        (room.lastPoint === null) ? room.lastPoint = point : room.wallEnd(point);
    });

    // Binds action for mouseover, specifically for showing temp-stuff.
    $('#canvas_container').mousemove(room, function(e) {

        point = room.crossBrowserXY(e);

        // Return if point is null or the target nodename is "tspan",
        // for fixing coordinate-bugs.
        if (point === null || e.target.nodeName == 'tspan') {
            return;
        } 
        // Draws the templine and shows the length of it.
        if (room.lastPoint !== null && point !== null && room.lastPoint != point) {
            tmp = room.drawTempLine(point);

            if (tmp) {
                tmpLength(tmp);
            }
        }
    });
};

/**
 * Function that goes through our wall array and finds two points that are the same.
 * @param point - A mousecoordinate that will be checked against our walls.
 * @return A point where two walls connect, null if no match.
**/
DrawRoom.prototype.findCorner = function(point) {

    var start,
        end;

    for (var i = 0, ii = this.walls.length; i < ii; i++) {

        start = [this.walls[i].attrs.path[0][1], this.walls[i].attrs.path[0][2]];
        end = [this.walls[i].attrs.path[1][1], this.walls[i].attrs.path[1][2]];

        if (this.isProximity(point, start)) {
            return start;

        } else if (this.isProximity(point, end)) {
            return end;
        }
    }

    return null;
};

/**
 * Function handling the logic for autocompleting a room, and calls the drawing of a
 * wall in any cases, even if no autocompletion should be done.
 * @param point - The point/coordinate the mouse was clicked, and the end of the wall
 * should be drawn to.
**/
DrawRoom.prototype.wallEnd = function(point) {

    var newStart = this.lastPoint,
        newEnd = point,
        initPoint = null;

    // Check that the points are not the same, and if the line is < 30degress (invalid)
    // If it is: return from function.
    if ((newStart.x == newEnd.x && newStart.y == newEnd.y) || this.invalid) {
        return;
    }

    // If there are two or more walls, allow for room completion.
    if (this.walls.length > 1) {
        // Get the startingpoint of the first wall.
        initPoint = [this.walls[0].attrs.path[0][1], this.walls[0].attrs.path[0][2]];
        // Checks if we are in the area of auto-completion of the room. (Could use a failsafe in case
        // initPoint is null.
        if (this.proximity || (newEnd.x == initPoint[0] && newEnd.y == initPoint[1])) {
            newEnd.x = initPoint[0];
            newEnd.y = initPoint[1];
            
            if (this.tmpCircle !== null) {
                this.tmpCircle.remove();
            }
            // Set room to finished.
            this.finished = true;
        }
    }

    // If no returns has occured, we want to draw the wall, and update the last point.
    this.lastPoint = newEnd;
    this.drawWall(newStart, newEnd);
};

/** 
 * Function that checks if the ending point is in the vincinity of the initial point of the room.
 * @param point1 - Position of the mouse.
 * @param point2 - Coordinates of the wall-start/wall-end
 * @return 'True' if the point is near the initial point, else 'False'.
**/
DrawRoom.prototype.isProximity = function(point1, point2) {

    var initPointX,
        initPointY; 

    // No need to check the length if point1 is undefined. (Might occur over text at the grid)
    if (point1 === undefined) {
        return;
    }
    // Sets the X and Y values for the initpoint. This will be startpoints of wall[0] if
    // point2 is not sent as parameter to function.
    initPointX = (point2 === undefined) ? this.walls[0].attrs.path[0][1] : point2[0];
    initPointY = (point2 === undefined) ? this.walls[0].attrs.path[0][2] : point2[1]; 

    testLength = this.vectorLength(initPointX, initPointY, point1.x, point1.y);

    return (testLength <= this.radius);
};

/**
 * Function that draws a wall based on the coordinates of
 * two clicked mousepoints.
 * @param point1 - Startpoint of the wall to be drawn.
 * @param point2 - Endpoint of the same wall.
**/
DrawRoom.prototype.drawWall = function(point1, point2) {

    var ns = TFplanner,

        /**
         * Function that unbinds mouseactions related to drawing of a room,
         * Only called when the room is 'completed'.
        **/
        finishRoom = function() {

            $('#canvas_container').unbind('click');
            $('#canvas_container').unbind('mousemove');

            if (ns.finishedRoom === null) {
                ns.finishedRoom = new FinishedRoom();
            }

            ns.finishedRoom.addWalls();
        };
        

    // Checking if x or y is set to aligned
    point2.x = (this.xAligned && !this.proximity) ? point1.x : point2.x;
    point2.y = (this.yAligned && !this.proximity) ? point1.y : point2.y;

    // We might need to clean up some of the temporary-stuff.
    if (this.tmpWall) {
        this.clearTmp();
    }
    // Push the new wall to the walls-array.
    this.walls.push(ns.grid.paper.path('M'+point1.x+','+point1.y+' L'+point2.x+','+point2.y).attr({ 
        stroke: '#2F4F4F',
        'stroke-width': 5,
        'stroke-linecap': 'round'
    }));

    ns.measurement.refreshMeasurements();

    if (this.finished) {
        finishRoom();
    }
};

/**
 * Visualization of the line that the user is about to draw, and the length of the line.
 * This line will not be saved in our array.
 * @param point - Coordinate of the mouseposition at this moment.
 * @return the tmpWall that is drawn.
**/
DrawRoom.prototype.drawTempLine = function(point) {

    var p2 = point,
        p1 = this.lastPoint,
        tmpLen,
        theGrid = TFplanner.grid,
        measures = TFplanner.measurement,
        diffX, 
        diffY,
        tmpMultiplier = 0.05,
        walls = this.walls,
        crossed = false,
        x1 = null,
        y1 = null,
        tmpAngle,
        tmpBool,

        // TODO: This might need some more comments and cleaning
        /**
         * Heavy function that checks if the drawn line will cross an other wall in the room.
         * Source: http://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
         * @param x1 -
         * @param x2 -
         * @param x3 -
         * @param x4 -
         * @return 'True' if the line crosses an other line, 'False' if not.
        **/
        wallCross = function(x1, y1, x2, y2) {

            var x, 
                y, 
                x3,
                y3, 
                y4, 
                x4,
                tmpWall,
                crossed;

            for (var i = 0, wallCount = (walls.length-1); i < wallCount; i++) {

                crossed = true;
                tmpWall = walls[i];
                x3 = tmpWall.attrs.path[0][1];
                y3 = tmpWall.attrs.path[0][2];
                x4 = tmpWall.attrs.path[1][1];
                y4 = tmpWall.attrs.path[1][2];

                x = ((x1*y2-y1*x2) * (x3-x4)-(x1-x2) * (x3*y4-y3*x4)) / ((x1-x2) * (y3-y4) - (y1-y2) * (x3-x4));
                y = ((x1*y2-y1*x2) * (y3-y4)-(y1-y2) * (x3*y4-y3*x4)) / ((x1-x2) * (y3-y4) - (y1-y2) * (x3-x4));

                if (isNaN(x) || isNaN(y)) {
                    crossed = false;
                
                } else {

                    // if startpoint.x > endpoint.x
                    if (x1 >= x2) {
                        if (!(x2 <= x && x <= x1)) {
                            crossed = false;
                        }
                    //
                    } else {
                        if (!(x1 <= x && x <= x2)) {
                            crossed = false;
                        }
                    }
                    // 
                    if (y1 >= y2) {
                        if (!(y2 <= y && y <= y1)) {
                            crossed = false;
                        }
                    //
                    } else {
                        if (!(y1 <= y && y <= y2)) {
                            crossed = false;
                        }
                    }
                    //
                    if (x3 >= x4) {
                        if (!(x4 <= x && x <= x3)) {
                            crossed = false;
                        }
                    //
                    } else {
                        if (!(x3 <= x && x <= x4)) {
                            crossed = false;
                        }
                    }
                    //
                    if (y3 >= y4) {
                        if (!(y4 <= y && y <= y3)) {
                            crossed = false;
                        }
                    // 
                    } else {
                        if (!(y3 <= y && y <= y4)) {
                            crossed = false;
                        }
                    }
                }

                if (crossed) {
                    return true;
                }
            }
            return crossed;
        };


    if (this.walls.length > 1) {

        // Store x and y for the starting point of first wall.
        // used further down the line.
        x1 = walls[0].attrs.path[0][1];
        y1 = walls[0].attrs.path[0][2];

        // Logic for checking if the second wall crosses:
        crossed = wallCross(p1.x, p1.y, p2.x, p2.y) ? true : false;

        // See if we are in the area where the room gets 'auto-completed'.
        // Set ending point (p2) to the starting point of wall[0].
        if (this.isProximity(p2)) {
            this.visualizeRoomEnd();
            p2.x = x1;
            p2.y = y1;
            this.proximity = true;

        } else {
            if (this.tmpCircle !== null) {
                this.tmpCircle.remove();
            }
            this.proximity = false;
        } 
    }

    // Forcing 90 degree angles!
    tmpLen = this.vectorLength(p1.x, p1.y, p2.x, p2.y);

    diffX = (p1.x >= p2.x) ? (p1.x - p2.x) : (p2.x - p1.x);
    diffY = (p1.y >= p2.y) ? (p1.y - p2.y) : (p2.y - p1.y);

    if (!this.proximity) {
        // Checking if x value is in range
        if (diffX < (tmpLen * tmpMultiplier)) {
            p2.x = p1.x;
            this.xAligned = true;

        // Checking if y value is in range.
        } else if (diffY < (tmpLen * tmpMultiplier)) {
            p2.y = p1.y;
            this.yAligned = true;

        // Set both alignements to false.
        } else {
            this.xAligned = false;
            this.yAligned = false;
        }
    }

    // Three steps:
    // 1: If the tmpWall is 'null' we draw it, if it already exist we just change the attributes.
    // 2: deciding to color the tmpline red/black based on if it crosses another,
    // and if it is the same as the starting point of the first wall.
    // 3: assigning "this.crossed" to false/true based on the above. used in endWall().
    if (crossed && !(x1 == p2.x && y1 == p2.y)) {

        if (this.tmpWall === null) {
            this.tmpWall = theGrid.paper.path('M'+p1.x+','+p1.y+' L'+p2.x+','+p2.y);
        }

        this.tmpWall.attr({
            path: ['M'+p1.x+','+p1.y+' L'+p2.x+','+p2.y],
            stroke: '#ff0000'
        });

    } else if (this.tmpWall === null) {
        this.tmpWall = theGrid.paper.path('M'+p1.x+','+p1.y+' L'+p2.x+','+p2.y);

    } else {
        this.tmpWall.attr({
            path: ['M'+p1.x+','+p1.y+' L'+p2.x+','+p2.y],
            stroke: '#000000'
        });
    }

    // Show the angle of the temporary wall (angle to previous drawn wall).
    if (this.walls.length >= 1 && this.tmpWall.getTotalLength() > (this.radius * 2)) {
        // Store temporary angle in measurements
        tmpAngle = measures.angleMeasurement(null, this.tmpWall);
        tmpBool = false;

        // Check if angle is smaller than 30 and larger than 330 degrees, and if the wall is < 50cm.
        // If this is true, change the color to  red (like when crossed);
        if (tmpAngle > this.maxAngle || tmpAngle < this.minAngle || tmpLen < this.minLength) {
            this.tmpWall.attr({
                stroke: '#ff0000'
            });
            tmpBool = true;
        }

        // Update variable that indicates if a wall is crossed/angle is to small.
        this.invalid = (crossed) ? crossed : tmpBool;
    } else if (measures.tmpMeasurements !== null) {
        measures.tmpMeasurements.remove();
        measures.tmpMeasurements.clear();
    }

    return this.tmpWall;
};


/**
 * When the user draws a wall that the 'isProximity' is going to auto-complete, we
 * will visualize that the wall is in the range for this to happen by drawing a circle.
 * @param p - the point that the tmpCircle is based on.
**/
DrawRoom.prototype.visualizeRoomEnd = function(p) {
   
    var point = (p === undefined) ? [this.walls[0].attrs.path[0][1], this.walls[0].attrs.path[0][2]] : p,
        doCircle = (this.tmpCircle === null) ? true : (this.tmpCircle[0] === null);

    if (doCircle) {
        this.tmpCircle = TFplanner.grid.paper.circle(point[0], point[1], this.radius, 0, 2 * Math.PI, false).attr({
            fill: '#008000',
            'fill-opacity': 0.5,
            'stroke-opacity': 0.5
        });

    } else {
        this.tmpCircle.attr({
            path: [point[0], point[1]]
        });
    }
};

/**
 * Some browser does not set the offsetX and offsetY variables on mouseclicks,
 * so a workaround is needed.
 * @param e - The MouseEvent that occured in the browser
 * @return - Coordinate in the grid, null if pointer is outside the viewbox.
**/
DrawRoom.prototype.crossBrowserXY = function(e) {

    var theGrid = TFplanner.grid,
        e = e || window.event,
        vB = theGrid.paper._viewBox,

        /**
         * Makes sure that the user can`t draw in the left corner, where the 'scale' is placed.
         * @param xy - The position of the mouse, that holds an x- and y-value.
         * @return - If the coordinate is in the area of the 'scale' in left corner, return (-1, -1)
        **/
        getRestriction = function(xy) {

            var x = xy[0],
                y = xy[1];

            return (!(x < 100 && y < 100)) ? new Point(x, y) : new Point(-1, -1);
        },

        // In FF offsetX is undefined, so then we need to handle the coordinates in a different way.
        x = (e.offsetX !== undefined) ? e.offsetX : (e.screenX - e.currentTarget.offsetLeft),
        y = (e.offsetY !== undefined) ? e.offsetY : e.clientY,

        // If zoom is activated, we must get the zoomed coordinates, 'zoomed' in our Grid is TRUE if
        // zoom has been used.
        point = (!theGrid.zoomed) ? getRestriction([x, y]) : getRestriction(theGrid.getZoomedXY(x, y))

    // Preventing a bug that makes you draw outside the viewbox.
    if ((point.x < vB[0] || point.y < vB[1]) || (point.x < 0 || point.y < 0)) {
        return null;
        
    } else {
        return point;
    }
};

/**
 * Function that calculates the vector length between two points.
 * @param x1 - X-coordinate of point 1
 * @param y1 - Y-coordinate of point 1
 * @param x2 - X-coordinate of point 2
 * @param y2 - Y-coordinate of point 2
 * @return The calculated length between the points
**/
DrawRoom.prototype.vectorLength = function(x1, y1, x2, y2) {

    var x = Math.pow((x2 - x1), 2),
        y = Math.pow((y2 - y1), 2);
        
    return (Math.pow((y + x), (1/2)));
};

/**
 * Function to be used for 'pre-defined' rooms. All drawing will be done 'clockwise', and
 * will follow the angle-axis predefined. (180 is straight to the right, 270 is downwards etc.)
 * @param ang - Array with predefined angles and wall-lengths for the chosen room-shape.
**/
DrawRoom.prototype.createRoom = function(ang) {

    var p1,
        p2,
        initPoint,
        p2tmp,
        tmpAng;
    
        TFplanner.options.preDefArr = ang;
        this.clearRoom();
        this.initRoom();

        // The selfDrawn-flag is set as false, since we now have created a predefined room. 
        TFplanner.ourRoom.selfDrawn = false;
        
    // Looping through the number of walls in the room.
    for (var i = 0, ii = ang[0].length; i < ii; i++) {


        // The first wall is a horizontal wall, starting in point (150, 150).
        // The wall is ending in p2, which is the length of the wall, added to p1.
        if (i === 0) {
            p1 = new Point(350, 150);
            p2tmp = parseInt(ang[1][i]);
            p2 = new Point(p2tmp+p1.x, p1.y);
            initPoint = p1;

            // A special case for the first wall, used inn 'wallEnd'-function.
            if (this.lastPoint === null) {
                this.lastPoint = p1;
            }

        // The ending point of the walls are calculated out from the angles stored in the array.
        } else {
            p1 = this.lastPoint;
            tmpAng = parseInt(ang[0][i]);
            p2tmp = parseInt(ang[1][i]);

            if (tmpAng == 270) {
                p2 = new Point(p1.x, p1.y+p2tmp);

            } else if (tmpAng == 180) {
                p2 = new Point(p1.x+p2tmp, p1.y);

            } else if (tmpAng == 360) {
                p2 = new Point(p1.x-p2tmp, p1.y);

            } else if (tmpAng == 90 && i != ang[0].length-1) {
                p2 = new Point(p1.x, p1.y-p2tmp);
            // This means 'finish the room'
            } else if (i == ang[0].length-1 && tmpAng == 90) {
                p2 = initPoint;
            }
        }
        // Uses the same functionality as when the user is 'manually' drawing a room.
        this.wallEnd(p2);
    }
};

/**
 * Function removes the currently drawn room and resets handlers and variables.
**/
DrawRoom.prototype.clearRoom = function() {

    //Empties walls-arrays
    this.walls.remove();
    this.walls.clear();

    if (this.tmpWall) {
        this.clearTmp();
    }

    TFplanner.obstacles.clearSets();
    
    this.lastPoint = null;
    this.proximity = false;
    this.finished = false;
    this.xAligned = false;
    this.yAligned = false;
    this.selfDrawn = true;

    $('#canvas_container').unbind('click');
    $('#canvas_container').unbind('mousemove');
    $(document).unbind('keydown');

    if (TFplanner.finishedRoom) {
        TFplanner.finishedRoom.nullify();
    }

    TFplanner.measurement.refreshMeasurements();
};

/**
 * Function that deletes and nullifies all of the temp-stuff.
**/
DrawRoom.prototype.clearTmp = function() {

    var measures = TFplanner.measurement;

    this.tmpWall.remove();
    this.tmpWall = null;
    this.tmpRect.remove();
    this.tmpRect = null;
    this.tmpLen.remove();
    this.tmpLen = null;

    // Clean up the temp-stuff in case some lengths or lines are hanging around.
    measures.tmpMeasurements.remove();
    measures.tmpMeasurements.clear();
};