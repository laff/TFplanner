    /**
     * Class that holds the functionality to draw a room from scratch
    **/
    function DrawRoom(radius) {
        this.radius = radius;   // Custom wall-end-force-field
        this.lastPoint = null;
        this.walls = grid.paper.set();
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
        this.initRoom();
        finishedRoom = null;
    }

    /**
     * Function that initiates drawing of a room.
    **/
    DrawRoom.prototype.initRoom = function () {
        var room = this;

        // Binds action for mousedown.
        $('#canvas_container').click(room, function(e) {

            var point = room.crossBrowserXY(e);

            // return if point is null or the target nodename is "tspan".
            // this fixes coordinate bugs.
            if (point == null || e.target.nodeName == "tspan") {
                return;
            }

            if (room.lastPoint == null) {
                room.lastPoint = point;

            } else {
                room.wallEnd(point);
            }
        });

        // Binds action for mouseover, specifically for showing temp shit
        $('#canvas_container').mousemove(room, function(e) {

            var point = room.crossBrowserXY(e);
            
            // return if point is null or the target nodename is "tspan".
            // this fixes coordinate bugs.
            if (point == null || e.target.nodeName == "tspan") {
                return;
            } 

            if (room.lastPoint != null && point != null) {

                if (room.lastPoint != point) {
                    var tmp = room.drawTempLine(point);

                    if (tmp != null) {
                        room.tmpLength(tmp);
                    }
                }
            }

        });
    }

    /**
     * Function that receives the temporary wall, and shows the length of it, as the mouse is moved around.
    **/
    DrawRoom.prototype.tmpLength = function(tmpWall) {

        var tmpLen = this.tmpLen,
            tmpRect = this.tmpRect,
            textPoint = tmpWall.getPointAtLength((tmpWall.getTotalLength()/2)),
            len = new Number(tmpWall.getTotalLength())/100;

            len = len.toFixed(2);

            // Draws a rectangle, where the length can be displayed.
            if (tmpRect == null) {
                this.tmpRect = grid.paper.rect(textPoint.x-25, textPoint.y-10, 50, 20, 5, 5).attr({
                    opacity: 1,
                    fill: "white"
                });
            // If the rectangle already exists, we only update its position.
            } else {
                tmpRect.attr({
                    x: textPoint.x-25,
                    y: textPoint.y-10,
                });
            }

            // The text-element that show the length of the wall.
            if (tmpLen == null) {
                this.tmpLen = grid.paper.text(textPoint.x, textPoint.y, len + " m").attr({
                opacity: 1,
                'font-size': 12,
                'font-family': "verdana",
                'font-style': "oblique"
                });

            // If the text-element already exist, we just update the position and the text that is shown.
            } else {
                tmpLen.attr({
                    x: textPoint.x,
                    y: textPoint.y,
                    text: len + " m" 
               });
            }
    }


    /**
     * Function that goes through our wall array and finds two points that are the same.
     *
    **/
    DrawRoom.prototype.findCorner = function(point) {

        var walls = this.walls,
            match = null;

        for (var i = 0; i < walls.length; i++) {

            var start = [walls[i].attrs.path[0][1], walls[i].attrs.path[0][2]],
                end = [walls[i].attrs.path[1][1], walls[i].attrs.path[1][2]];


            if (this.isProximity(point, start)) {
                match = start;
            } else if (this.isProximity(point, end)) {
                match = end;
            }

            if (match != null) {
                return match;
            }
        }
        return match;
    }

    /**
     * Function that unbinds mouse actions related to creating a room.
    **/
    DrawRoom.prototype.finishRoom = function () {

        $('#canvas_container').unbind('click');
        $('#canvas_container').unbind('mousemove');


        if (finishedRoom == null) {
            finishedRoom = new FinishedRoom(this.radius);
        }

        finishedRoom.addWalls();
    }

    /**
     * Function handling logic for the first point of a wall.
    **/
    DrawRoom.prototype.wallEnd = function (point) {
        var newStart = this.lastPoint,
            newEnd = point,
            walls = this.walls,
            initPoint = null,
            invalid = this.invalid;

        // If there are two or more walls, allow for room completion.
        if (walls.length > 1) {
            initPoint = [walls[0].attrs.path[0][1], walls[0].attrs.path[0][2]];
        }


        // Check that the points are not the same, if it is quit function.
        if (newStart.x == newEnd.x && newStart.y == newEnd.y) {
            console.log("points are the same");
            return;
        }


        if (initPoint != null) {
            var setPoint = false;

            if (this.proximity && !invalid) {
                console.log("within proximity, not valid");
                setPoint = true;

            } else if (newEnd.x == initPoint[0] && newEnd.y == initPoint[1]) {
                console.log("the points match, let him draw");
                setPoint = true;
            }

            if (setPoint == true) {
                newEnd.x = initPoint[0];
                newEnd.y = initPoint[1];
                
                if(this.tmpCircle != null) {
                    this.tmpCircle.remove();
                }

                this.finished = true;
            }
        }

        if (invalid && !setPoint) {
            console.log("paths invalid");
            return;
        }

        this.lastPoint = newEnd;
        this.drawWall(newStart, newEnd);
    }

    /** 
     * Function that checks if the ending point is in the vincinity of the initial point.
     * returns false if the point is not, and true if it is.
     * Two arguments can be sent to this funcion, sending one will set point1.
    **/
    DrawRoom.prototype.isProximity = function (point1, point2) {

        
        var initPointX = (point2 == null) ? this.walls[0].attrs.path[0][1] : point2[0],
            initPointY = (point2 == null) ? this.walls[0].attrs.path[0][2] : point2[1];

            // No need to check the length if point1 is undefined. (Might occur over text at the grid)
            if (point1 == undefined) {return;}
            testLength = this.vectorLength(initPointX, initPointY, point1.x, point1.y);

            return (testLength <= this.radius);
    }

    /**
     * Function that checks if the line will cross a wall.
     *
    **/
    DrawRoom.prototype.wallCross = function (x1, y1, x2, y2) {

        var x, 
            y, 
            x3,
            y3, 
            y4, 
            x4,
            tmpWall,
            crossed,
            walls = this.walls,
            wallCount = (walls.length - 1);

        for (var i = 0; i < wallCount; i++) {

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

                    //
                    if ( !(x2 <= x && x <= x1) ) {

                        crossed = false;
                    }
                //
                } else {
                    if ( !(x1 <= x && x <= x2) ) {
                        crossed = false;
                    }
                }

                // 
                if (y1 >= y2) {
                    //
                    if ( !(y2 <= y && y <= y1) ) {
                        crossed = false;
                    }
                //
                } else {
                    if ( !(y1 <= y && y <= y2) ) {
                        crossed = false;
                    }
                }
                //
                if (x3 >= x4) {
                    //
                    if ( !(x4 <= x && x <= x3) ) {
                        crossed = false;
                    }
                //
                } else {
                    // 
                    if ( !(x3 <= x && x <= x4) ) {
                        crossed = false;
                    }
                }
                //
                if (y3 >= y4) {
                    //
                    if ( !(y4 <= y && y <= y3) ) {
                        crossed = false;
                    }
                // 
                } else {
                    //
                    if ( !(y3 <= y && y <= y4)) {
                        crossed = false;
                    }
                }
            }

            if (crossed) {

                return true;
            }
        }
        return crossed;
    }

    /**
     * Function that draws the line.
     *
    **/
    DrawRoom.prototype.drawWall = function (point1, point2) {

        var point2 = point2;

        // checking if x or y is set to aligned
        point2.x = (this.xAligned && !this.proximity) ? point1.x : point2.x;
        point2.y = (this.yAligned && !this.proximity) ? point1.y : point2.y;

        // If we have a temp-wall, we want to remove it, and at the same time remove the shown length of it.
        if (this.tmpWall != null) {

            this.tmpWall.remove();
            this.tmpWall = null;
            this.tmpRect.remove();
            this.tmpRect = null;
            this.tmpLen.remove();
            this.tmpLen = null;
            measurement.tmpMeasurements.remove();
            measurement.tmpMeasurements.clear();
        }

        wall = grid.paper.path("M"+point1.x+","+point1.y+"L"+point2.x+","+point2.y).attr({ 
                stroke: "#2F4F4F",
                'stroke-width': 5,
                'stroke-linecap': "round"
            });

        this.walls.push(wall);

        measurement.refreshMeasurements();

        if (this.finished) {
            this.finishRoom();
        }
    }

    /**
     * Visualization of the line that the user is about to draw, and the length of the line.
     * This line will not be saved in our array.
    **/
    DrawRoom.prototype.drawTempLine = function (point2, point1, callback) {

        var p2 = point2,
            p1 = (point1 == null) ? this.lastPoint : point1,
            tmpWall = this.tmpWall,
            tmpRect = this.tmpRect,
            tmpLen,
            diffX, 
            diffY,
            tmpMultiplier = 0.05,
            walls = this.walls,
            crossed = false,
            x1 = null,
            y1 = null,
            length = walls.length,
            xAligned,
            yAligned;



        if (length > 1) {

            // Store x and y for the starting point of first wall.
            // used further down the line.
            x1 = walls[0].attrs.path[0][1];
            y1 = walls[0].attrs.path[0][2];


            // Logic for the second wall:
            // Checking if it crosses.

           if (this.wallCross(p1.x, p1.y, p2.x, p2.y)) {
                crossed = true;
            } else {
                crossed = false;
            }


            // See if we are in the area where the room gets 'auto-completed'.
            // visualize roomend by circle.
            // set ending point (p2) to the starting point of wall[0].
            if (this.isProximity(p2)) {
                this.visualizeRoomEnd();
                p2.x = x1;
                p2.y = y1;
                this.proximity = true;

            } else {
                if (this.tmpCircle != null) {
                    this.tmpCircle.remove();
                }
                this.proximity = false;
            } 

        }


        // Forcing 90 degree angles!
        // 
        // calculate temp length
        tmpLen = this.vectorLength(p1.x, p1.y, p2.x, p2.y);

        diffX = (p1.x >= p2.x) ? (p1.x - p2.x) : (p2.x - p1.x);
        diffY = (p1.y >= p2.y) ? (p1.y - p2.y) : (p2.y - p1.y);

        if (!this.proximity) {
            // Checking if x value is in range
            if (diffX < (tmpLen * tmpMultiplier)) {

                p2.x = p1.x;
                xAligned = true;

            // Checking if y value is in range.
            } else if (diffY < (tmpLen * tmpMultiplier)) {

                p2.y = p1.y;
                yAligned = true;

            // set both alignements to false.
            } else {

                xAligned = false;
                yAligned = false;
            }

            this.xAligned = xAligned;
            this.yAligned = yAligned;
        }


        // Three steps:
        // 1: If the tmpWall is 'null' we draw it, if it already exist we just change the attributes.
        // 2: deciding to color the tmpline red/black based on if it crosses another,
        // and if it is the same as the starting point of the first wall.
        // 3: assigning "this.crossed" to false/true based on the above. used in endWall().


        if (crossed && !(x1 == p2.x && y1 == p2.y)) {

            if (tmpWall == null) {
                this.tmpWall = grid.paper.path("M"+p1.x+","+p1.y+"L"+p2.x+","+p2.y).attr({
                    stroke: '#ff0000'
                });

            } else {
                tmpWall.attr({
                    path: ["M"+p1.x+","+p1.y+"L"+p2.x+","+p2.y],
                    stroke: '#ff0000'
                });
            }

        } else if (tmpWall == null) {
            this.tmpWall = grid.paper.path("M"+p1.x+","+p1.y+"L"+p2.x+","+p2.y);

        } else {

            tmpWall.attr({
                path: ["M"+p1.x+","+p1.y+"L"+p2.x+","+p2.y],
                stroke: "#000000"
            });
        }


        // show temporary Angle
        if (length >= 1 && this.tmpWall.getTotalLength() > (this.radius * 2)) {


            // Store temporary angle.
            var tmpAngle = measurement.angleMeasurement(null, this.tmpWall),
                tmpBool = false;

            // Check if angle is smaller than 30 and larger than 330 ellen degenerees.
            // If the angle this is true, change the color to  red (like when crossed);
            if (tmpAngle > this.maxAngle || tmpAngle < this.minAngle) {

                tmpWall.attr({
                    stroke: '#ff0000'
                });


                tmpBool = true;
            } 

            // Update this.invalid boolean (used in wallend)
            this.invalid = (crossed) ? crossed : tmpBool;


        } else if (measurement.tmpMeasurements != null) {
            measurement.tmpMeasurements.remove();
            measurement.tmpMeasurements.clear();
        }

        return tmpWall;
    }


    /**
     * When the user draws a wall that the 'isProximity' is going to auto-complete, we
     * will visualize that the wall is in the range for this to happen by drawing a circle.
    **/
    DrawRoom.prototype.visualizeRoomEnd = function (point) {
        var tmpCircle = this.tmpCircle,
            point = (point == null) ? [this.walls[0].attrs.path[0][1], this.walls[0].attrs.path[0][2]] : point,
            doCircle = (tmpCircle == null) ? true : (tmpCircle[0] == null);

        if (doCircle) {
            this.tmpCircle = grid.paper.circle(point[0], point[1], this.radius, 0, 2 * Math.PI, false).attr({
                fill: "#008000",
                'fill-opacity': 0.5,
                'stroke-opacity': 0.5
            });

        } else {
            this.tmpCircle.attr({
                path: [point[0], point[1]]
            });
        }
    }

    /**
     * Some browser does not set the offsetX and offsetY variables on mouseclicks.
    **/
    DrawRoom.prototype.crossBrowserXY = function(e) {

        var point,
            room = this,
            e = e || window.event,
            x = e.offsetX, 
            y = e.offsetY,
            vB = grid.paper._viewBox;

         // FF FIX        

        if (e.offsetX == undefined) { 
            x = e.screenX;
            y = e.screenY;
        }

        // I used to use offsetX and Y, I still do, but i used to too.
        point = grid.getRestriction(grid.getZoomedXY(x, y));

        // Preventing a bug that makes you draw outside the viewbox.
        if ((point.x < vB[0] || point.y < vB[1]) || (point.x < 0 || point.y < 0)) {
            return null;
        } else {
            return point;
        }
    }

    // Function that takes two points and calculates their vector length.
    DrawRoom.prototype.vectorLength = function(x1, y1, x2, y2) {

        var x = Math.pow((x2 - x1), 2),
            y = Math.pow((y2 - y1), 2),
            result = Math.pow((y + x), (1/2));

        return result;
    }


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
        
        this.clearRoom();

            
            // Looping through the number of walls in the room.
        for (var i = 0; i < ang[0].length; i++) {


            // The first wall is a horizontal wall, starting in point (150, 150).
            // The wall is ending in p2, which is the length of the wall, added to p1.
            if (i == 0) {
                p1 = new Point(350, 150);
                p2tmp = parseInt(ang[1][i]);
                p2 = new Point(p2tmp+p1.x, p1.y);
                initPoint = p1;

                // A special case for the first wall, used inn 'wallEnd'-function.
                if (this.lastPoint == null) {
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
    }


    //Function removes the currently drawn room
   DrawRoom.prototype.clearRoom = function() {
        var walls = this.walls;

        //Empties walls-arrays
        walls.remove();
        walls.clear();

        this.lastPoint = null;
        this.proximity = false;
        this.finished = false;
        this.xAligned = false;
        this.yAligned = false;

        measurement.refreshMeasurements();
        options.refresh();

        this.initRoom();
    }