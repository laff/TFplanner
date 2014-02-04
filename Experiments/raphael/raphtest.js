$(function() {  
    /*	var paper = new Raphael(document.getElementById('canvas_container'), 500, 500);  

    	for(var i = 0; i < 5; i+=1) {  
    	    var multiplier = i*5;  
    	    paper.circle(250 + (2*multiplier), 100 + multiplier, 50 - multiplier);  

    		

    	} 
    	var rectangle = paper.rect(200, 200, 250, 100); 
    */


    // constructor
    function Grid() {
            this.size = 6,               // How many pixels between each horizontal/vertical line.
            this.cutPix = 0.5;           // Used so that the drawing of a line not overlaps on the previous pixel.
    }

    Grid.prototype.paper = Raphael(document.getElementById('canvas_container'));
    Grid.prototype.offsetX = 0.5;
    Grid.prototype.offsetY = 0.5;

    Grid.prototype.draw = function() {

        var paper = this.paper,
            size = this.size,               
            cutPix = this.cutPix,           
            line,                   // Saves the path to a variable during construction.
            width = paper.width;    // The width and the height of the svg-element.
            height = paper.height;  

        // Draw vertical lines, with 'size' number of pixels between each line.
        for (var i = 1; i <= width; i++) {
            line = paper.path("M"+(i*size+cutPix)+", "+0+", L"+(i*size+cutPix)+", "+(size*height)).attr({'stroke-opacity': 0.3});   //Path-function is named 'paperproto.path' in raphael.js
            // Make every 10th line a bit stronger.
            if (i % 5 === 0) {
                line.attr( {
                    'stroke-opacity': 0.5
                });
            }
        }

        // Draw horizontal lines, with 'size' number of pixels between each line.
        for (var i = 1; i <= height; i++) {
           line = paper.path("M"+0+", "+(i*size+cutPix)+", L"+(size*width)+", "+(i*size+cutPix)).attr({'stroke-opacity': 0.3});
           // Make every 10th line a bit stronger.
           if (i % 5 === 0) {
                line.attr( {
                    'stroke-opacity': 0.5
                });
            } 
        }

        paper.setSize("100%" , "100%");

    }

    var grid = new Grid();

    grid.draw();

    Grid.prototype.getLatticePoint = function(x, y) {

      var tx = x - this.offsetX;
      var ty = y - this.offsetY;
      tx += this.size / 2;
      ty += this.size / 2;
      tx = parseInt(tx / this.size);
      ty = parseInt(ty / this.size);
      tx = Grid.range(tx, 0, this.width);
      ty = Grid.range(ty, 0, this.height);

      return new Point(tx, ty);
    }

    Grid.prototype.getReal = function(latticePoint) {
          var x = latticePoint.x * this.size + this.offsetX;
          var y = latticePoint.y * this.size + this.offsetY;

        //  alert('real: ' + latticePoint.x + " = x: " + x + " y: " + y);
        return new Point(x, y);
    }

    Grid.range = function(val, min, max) {
        if (val < min) 
            return min;
        if (val > max) 
            return max;
      return val;
    }



    /**
     *  Constructor for Room
    **/
    function Room (radius) {
        this.radius = radius;   // Custom wall-end-force-field
        this.lastPoint = null;
        this.walls = [];
        this.tmpWall = null;
        this.tmpCircle = null;
        this.proximity = false;
        this.crossed = false;
        this.initRoom();
    }

    Room.prototype.plus = 5;

    /**
     * Function that initiates drawing of a room.
    **/
    Room.prototype.initRoom = function () {
        var room = this;

        // Binds action for mousedown.
        $('#canvas_container').click(room, function(e) {

            var point = crossBrowserXY(e);

            if (room.lastPoint == null) {
                room.lastPoint = point;
            } else {
                room.wallEnd(point);
            }
        });

        // Binds action for mouseover, specifically for showing temp shit
        $('#canvas_container').mousemove(room, function(e) {

            var point = crossBrowserXY(e);

            if (room.lastPoint != null) {

                if (room.lastPoint != point) {
                    room.drawTempLine(point);
                }

            }

        });
    }

    /**
     * Binds action listeners to mouse click and movement, especially for moving corners.
     *
    **/
    Room.prototype.clickableCorners = function() {

        var room = this;

        $('#canvas_container').mousedown(room, function(e) {

            room.dragCorner(e);

        });

        $('#canvas_container').mouseup(room, function(e) {

            room.dropCorner(e);

        });

        // Binds action for mouseover, specifically for showing temp shit
        $('#canvas_container').mousemove(room, function(e) {

            room.visualizeCorner(e);

        });

    }

    /**
     * functionality that uses the "isProximity" function to check if hte clicked/mouseovered area is valid.
     * Marks the points within proximity for either visualization or movement.
    **/

    Room.prototype.visualizeCorner = function (e) {
        var point = crossBrowserXY(e),
            match = this.findCorner(point);


        if (match != null) {
            this.visualizeRoomEnd(match);
        } else {
            this.tmpCircle.remove();
        }

    }

    /**
     * Function that goes through our wall array and finds two points that are the same.
     *
    **/
    Room.prototype.findCorner = function(point) {

        var walls = this.walls,
            match = null;

        for (var i = 0; i < walls.length; i++) {

            var start = walls[i].startPoint,
                end = walls[i].endPoint;

            match = (this.isProximity(point, start)) ? start : null;
            match = (match == null && this.isProximity(point, end)) ? end : null;

            if (match != null) {
                return match;
            }

        }
    }


    /**
     * Functionality that lets you drag a corner.
     * it will delete the previous two lines connected to the point matching.
     * And proceed to draw temporary lines.
    **/
    Room.prototype.dragCorner = function (e) {
        var point = crossBrowserXY(e),
        match = this.findCorner(point),
        x,
        y,
        walls = this.walls,
        wall,
        wallArr = [],
        count = 0;


        if (match != null) {
            x = match.x, 
            y = match.y;

            for (var i = 0; i < walls.length; i++) {

                var tmpWall = walls[i];

                if (x == tmpWall.startPoint.x && y == tmpWall.startPoint.y) {
                    wallArr.push(tmpWall);
                } else if (x == tmpWall.endPoint.x && y == tmpWall.endPoint.y) {
                    wallArr.push(tmpWall);

                }
            }

            if (wallArr.length > 1) {
                console.log(wallArr);
            }

        }
    }

    /** 
     * Functionality that draws the two new walls after its new point has been "dropped".
     *
    **/
    Room.prototype.dropCorner = function(e) {

        //console.log("drop corner here!");

    }

    /**
     * Function that unbinds mouse actions related to creating a room.
    **/
    Room.prototype.finishRoom = function () {

        $('#canvas_container').unbind('click');
        $('#canvas_container').unbind('mousemove');

        this.clickableCorners();
    }

    /**
     * Function handling logic for the first point of a wall.
     * 
    **/
    Room.prototype.wallEnd = function (point) {
        var point1 = this.lastPoint,
            point2 = point,
            wall,
            walls = this.walls,
            crossed = this.crossed,
            orgPoint;

        this.lastPoint = point2;

        // Check that the points are not the same, if it is quit function
        if (point1.x == point2.x && point1.y == point2.y) {
            return;

        }

        // Creates the new wall.
        wall = new Wall (point1, point2);


        // Stores the wall.
        walls.push(wall);


        orgPoint = walls[0].startPoint;

        // Check if the ending point of this wall is near the starting point of the first wall
        if (this.proximity && !crossed) {
            walls.pop();
            wall = new Wall (point1, orgPoint);
            walls.push(wall);
            this.tmpCircle.remove();
            this.finishRoom();

        }

        // If the points are the same, it will be marked as "crossed = True",
        // therefore drawing the new wall should be allowed anyways.
        if (crossed && point2.x == orgPoint.x && point2.y == orgPoint.y) {
            this.drawWall(wall);
            this.tmpCircle.remove();
            this.finishRoom();
        } else if (!crossed) {
            this.drawWall(wall);
        } else {
            walls.pop();
            this.lastPoint = point1;
        }
    }

    /** 
     * Function that checks if the ending point is in the vincinity of the initial point.
     * returns false if the point is not, and true if it is.
     * Two arguments can be sent to this funcion, sending one will set point1.
    **/
    Room.prototype.isProximity = function (point1, point2) {
        var initPointX = (point2 == undefined) ? this.walls[0].startPoint.x : point2.x,
            initPointY = (point2 == undefined) ? this.walls[0].startPoint.y : point2.y,
            endPointX = point1.x,
            endPointY = point1.y,
            rad = this.radius,
            diffX = (initPointX > endPointX) ? (initPointX - endPointX) : (endPointX - initPointX), 
            diffY = (initPointY > endPointY) ? (initPointY - endPointY) : (endPointY - initPointY);

        if ( diffX < rad && diffY < rad) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Function that checks if the line will cross a wall.
     *
    **/
    Room.prototype.wallCross = function (line) {

        var x1 = line.startPoint.x,
            y1 = line.startPoint.y,
            x2 = line.endPoint.x,
            y2 = line.endPoint.y,
            x, 
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
            x3 = tmpWall.startPoint.x;
            y3 = tmpWall.startPoint.y;
            x4 = tmpWall.endPoint.x;
            y4 = tmpWall.endPoint.y;

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
    Room.prototype.drawWall = function (line) {

        var tmpWall = this.tmpWall,
            wall;

        if (tmpWall != null) {
            tmpWall.remove();
        }

        wall = grid.paper.path("M"+line.startPoint.x+","+line.startPoint.y+"L"+line.endPoint.x+","+line.endPoint.y).attr(
            {
                fill: "#00000", 
                stroke: "#000000",
                'stroke-width': 1
            });

        options.refresh();

    }

    /**
     * Visualization of the line that the user is about to draw.
     * This line will not be saved in our array.
    **/
    Room.prototype.drawTempLine = function (point2, point1) {
        var p2 = point2,
            p1 = (point1 == null) ? this.lastPoint : point1,
            tmpWall = this.tmpWall,
            walls = this.walls,
            wall = new Wall(p1, p2),
            crossed = false;

        if (walls.length > 1) {
            if (this.wallCross(wall)) {
                crossed = true;
            } else {
                crossed = false;
            }

            // See if we are in the area where the room gets 'auto-completed'.
            if (this.isProximity(p2)) {
                this.visualizeRoomEnd();
                this.proximity = true;

            } else {
                if (this.tmpCircle != null) {
                    this.tmpCircle.remove();
                }
                this.proximity = false;
            }  
        }


        // Three steps:
        // 1: removing the last tmpwall if any.
        // 2: deciding to color the tmpline red/black based on if it crosses another.
        // 3: assigning "this.crossed" to false/true based on the above. used in endWall().
        if (tmpWall != null) {
            tmpWall.remove();
        }

        if (crossed) {
            this.tmpWall = grid.paper.path("M"+p1.x+","+p1.y+"L"+p2.x+","+p2.y).attr(
            {   
                stroke: '#ff0000'
            });

        } else {
            this.tmpWall = grid.paper.path("M"+p1.x+","+p1.y+"L"+p2.x+","+p2.y);
        }        

        this.crossed = crossed;
    }


    /**
     * When the user draws a wall that the 'isProximity' is going to auto-complete, we
     * will visualize that the wall is in the range for this to happen by drawing a circle.
    **/
    Room.prototype.visualizeRoomEnd = function (point) {
        var tmpCircle = this.tmpCircle,
            point = (point == null) ? this.walls[0].startPoint : point;

        if (tmpCircle != null) {
            tmpCircle.remove();
        }

        this.tmpCircle = grid.paper.circle(point.x, point.y, this.radius, 0, 2 * Math.PI, false).attr(
        {
            fill: "#3366FF",
            'fill-opacity': 0.3, 
            stroke: "#3366FF"
        });
    }


    // Starts the room creation progress!
    var ourRoom = new Room(20);


    /**
     * Point constructor
    **/
    function Point (x, y) {
        this.x = x;
        this.y = y;

    }

    /**
     * Wall constructor
    **/
    function Wall (startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }

    /**
     *
    **/
    function crossBrowserXY(e) {

        var point,
            e = e || window.event;

        if (e.offsetX == undefined) { 
            e.offsetX = e.pageX - e.currentTarget.offsetLeft; 
            e.offsetY = e.pageY - e.currentTarget.offsetTop; 
        }


        point = grid.getLatticePoint(e.offsetX, e.offsetY);
        point = grid.getReal(point);

        return point;
    }





    function Options(tableEle) {
        this.tableEle = tableEle;
        this.refresh();

    }

    /**
     *  Function that updates the wall-table.
     *  also adds functionality to -/+ buttons.
     *
    **/
    Options.prototype.refresh = function() {

        var walls = ourRoom.walls;

        if (!walls.length) {
            return;
        }   

        // Creating the column names
        var myTable= "<table id='options'><tr><th>Wall number</th>";
            myTable+= "<th>Wall length</th></tr>";

        // Filling in information
        for (var i = 0; i < walls.length; i++) {

            // Wall number / name
            myTable+="<tr><td>Number " + i + " :</td>";

            // extract point x and y.
            
            myTable+="<td>" + vectorLength(walls[i].startPoint, walls[i].endPoint); + " </td>";
        }  
           myTable+="</table>";

        $('#options_container').html(myTable);

    }


    // initiates the options_container
    var options = new Options('options_container');

    // Function that takes two points and calculates their vector length.
    function vectorLength(p1, p2) {
        var x1 = p1.x,
            x2 = p2.x,
            y1 = p1.y,
            y2 = p2.y,
            x = Math.pow((x2 - x1), 2),
            y = Math.pow((y2 - y1), 2),
            result = Math.pow((y + x), (1/2));

        return result;
    }

});

