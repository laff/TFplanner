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
            line = paper.path("M"+(i*size+cutPix)+", "+0+", L"+(i*size+cutPix)+", "+(size*height)).attr({'stroke-opacity': 0});   //Path-function is named 'paperproto.path' in raphael.js
            // Make every 10th line stronger.
            if (i % 10 === 0) {
                line.attr({
                    'stroke-opacity': 0.4
                });
            }
        }

        // Draw horizontal lines, with 'size' number of pixels between each line.
        for (var i = 1; i <= height; i++) {
           line = paper.path("M"+0+", "+(i*size+cutPix)+", L"+(size*width)+", "+(i*size+cutPix)).attr({'stroke-opacity': 0});
           // Make every 10th line stronger.
           if (i % 10 === 0) {
                line.attr( {
                    'stroke-opacity': 0.4
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
        this.tmpCorners = [];
        this.initRoom();
        this.handle = null;
        this.finished = false;
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
     *  Function that adds drag and drop functionality to the walls.
     *

        var walls = this.walls,
            path1 = walls[indexArr[0][0]],
            path2 = walls[indexArr[1][0]],
            path1Order = indexArr[0][1],    // if path1Order = 0 : startpunktet skal endres. om det er = 1, endpunktet skal endres.
            path2Order = indexArr[1][1],    
            pathArray1 = path1.attr("path"),
            pathArray2 = path2.attr("path"),
            mx = match[0],
            my = match[1],
            room = this;

        this.handle = grid.paper.circle(mx,my,this.radius).attr({
            fill: "#3366FF",
            'fill-opacity': 0.3, 
            cursor: "pointer",
            stroke: "black"
        });

        var start = function () {
          this.cx = this.attr("cx"),
          this.cy = this.attr("cy");
        },
        move = function (dx, dy) {
           var X = this.cx + dx,
               Y = this.cy + dy;
           this.attr({cx: X, cy: Y});

           if (path1Order == 0) {
               pathArray1[0][1] = X;
               pathArray1[0][2] = Y;
           } else {
               pathArray1[1][1] = X;
               pathArray1[1][2] = Y;
           }

           if (path2Order == 0) {
               pathArray2[0][1] = X;
               pathArray2[0][2] = Y;
           } else {
               pathArray2[1][1] = X;
               pathArray2[1][2] = Y;
           }


           path1.attr({path: pathArray1});
           path2.attr({path: pathArray2});
        },
        up = function () {
           this.dx = this.dy = 0;
           this.animate({"fill-opacity": 1}, 500);
           this.remove();
           room.nullify();
           options.refresh();
        };
        this.handle.drag(move, start, up);

    **/
    Room.prototype.clickableWalls = function() {

        var walls = this.walls;
        
        for (var i = 0; i < walls.length; i++) {




            var start = function () {

                this.lastdx ? this.odx += this.lastdx : this.odx = 0;
                this.lastdy ? this.ody += this.lastdy : this.ody = 0;
                this.animate({"fill-opacity": 0.2, fill: "#FF000"}, 500);

            },
            move = function (dx, dy) {
              this.transform("T"+(dx+this.odx)+","+(dy+this.ody));
              this.lastdx = dx;
              this.lastdy = dy;
            },
            up = function () {
              //this.animate({"fill-opacity": 1}, 500);
            };

            walls[i].drag(move, start, up);
        }


    }

    /**
     * Binds action listeners to mouse click and movement, especially for moving corners.
     *
    **/
    Room.prototype.clickableCorners = function() {

        var room = this;

        $('#canvas_container').mousedown(room, function(e) {

            if ((match = room.checkMatch(e)) != null) {
                room.dragCorner(match);
            }
        });

        // Binds action for mouseover, specifically for showing temp shit
        $('#canvas_container').mousemove(room, function(e) {

            if ((match = room.checkMatch(e)) != null && room.handle == null) {
                room.visualizeRoomEnd(match);

            } else if (room.tmpCircle != null) {
                room.tmpCircle.remove();
            }

        });

    }

    Room.prototype.checkMatch = function(e) {
        var point = crossBrowserXY(e),
            match = this.findCorner(point);

        if (match != null) {
            return match;
        } else {
            return null;
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
     * Functionality that adds drag action to the tmpCircle.
    **/
    Room.prototype.dragCorner = function (point) {
        var match = point,
            x,
            y,
            walls = this.walls,
            indexArr = [],
            tmpSPx,
            tmpSPy, 
            tmpEPx,
            tmpEPy;

            x = match[0], 
            y = match[1];

            for (var i = 0; i < walls.length; i++) {

                var tmpWall = walls[i];

                tmpSPx = tmpWall.attrs.path[0][1];
                tmpSPy = tmpWall.attrs.path[0][2];
                tmpEPx = tmpWall.attrs.path[1][1];
                tmpEPy = tmpWall.attrs.path[1][2];

                if (x == tmpSPx && y == tmpSPy) {
                    indexArr.push([i, 0]);

                } else if (x == tmpEPx && y == tmpEPy) {
                    indexArr.push([i, 1]);
                }
            }

            if (indexArr.length > 1) {

                if (this.handle == null) {
                    this.drag(indexArr, match);
                }
                

        }
    }

    Room.prototype.drag = function(indexArr, match) {

        var walls = this.walls,
            path1 = walls[indexArr[0][0]],
            path2 = walls[indexArr[1][0]],
            path1Order = indexArr[0][1],    // if path1Order = 0 : startpunktet skal endres. om det er = 1, endpunktet skal endres.
            path2Order = indexArr[1][1],    
            pathArray1 = path1.attr("path"),
            pathArray2 = path2.attr("path"),
            mx = match[0],
            my = match[1],
            room = this;

        this.handle = grid.paper.circle(mx,my,this.radius).attr({
            fill: "#3366FF",
            'fill-opacity': 0.3, 
            cursor: "pointer",
            stroke: "black"
        });

        var start = function () {
          this.cx = this.attr("cx"),
          this.cy = this.attr("cy");
        },
        move = function (dx, dy) {
           var X = this.cx + dx,
               Y = this.cy + dy;
           this.attr({cx: X, cy: Y});

           if (path1Order == 0) {
               pathArray1[0][1] = X;
               pathArray1[0][2] = Y;
           } else {
               pathArray1[1][1] = X;
               pathArray1[1][2] = Y;
           }

           if (path2Order == 0) {
               pathArray2[0][1] = X;
               pathArray2[0][2] = Y;
           } else {
               pathArray2[1][1] = X;
               pathArray2[1][2] = Y;
           }


           path1.attr({path: pathArray1});
           path2.attr({path: pathArray2});
        },
        up = function () {
           this.dx = this.dy = 0;
           this.animate({"fill-opacity": 1}, 500);
           this.remove();
           room.nullify();
           options.refresh();
        };
        this.handle.drag(move, start, up);

    }

    Room.prototype.nullify = function() {
        this.handle = null;
    }

    /**
     * Function that unbinds mouse actions related to creating a room.
    **/
    Room.prototype.finishRoom = function () {

        $('#canvas_container').unbind('click');
        $('#canvas_container').unbind('mousemove');

        this.clickableCorners();

        this.finished = true;
    }

    /**
     * Function handling logic for the first point of a wall.
     * 
    **/
    Room.prototype.wallEnd = function (point) {
        var newStart = this.lastPoint,
            newEnd = point,
            wall,
            walls = this.walls,
            initPoint = null,
            crossed = this.crossed;

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

            if (this.proximity && !crossed) {
                console.log("within proximity, not crossed");
                setPoint = true;

            } else if (newEnd.x == initPoint[0] && newEnd.y == initPoint[1]) {
                console.log("the points match, let him draw");
                setPoint = true;
            }

            if (setPoint == true) {
                newEnd.x = initPoint[0];
                newEnd.y = initPoint[1];
                this.tmpCircle.remove();
                this.finishRoom();
            }
        }

        if (crossed && !setPoint) {
            console.log("paths cross");
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
    Room.prototype.isProximity = function (point1, point2) {
        var initPointX = (point2 == null) ? this.walls[0].attrs.path[0][1] : point2[0],
            initPointY = (point2 == null) ? this.walls[0].attrs.path[0][2] : point2[1],
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
    Room.prototype.wallCross = function (x1, y1, x2, y2) {

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
    Room.prototype.drawWall = function (point1, point2) {

        var tmpWall = this.tmpWall,
            walls = this.walls;

/*      Christians testing av pathIntersection
        if (walls.length > 3) {
                for (var i = 0; i < walls.length; i++) {
                    console.log(walls);
                    console.log(tmpWall.attrs.path);
                    console.log(Raphael.pathIntersection(tmpWall.attrs.path, walls[2].attrs.path));
                }
            
        }
*/
        if (tmpWall != null) {
            tmpWall.remove();
        }

        wall = grid.paper.path("M"+point1.x+","+point1.y+"L"+point2.x+","+point2.y).attr(
            {
                fill: "#00000", 
                stroke: "#2F4F4F",
                'stroke-width': 5,
                'stroke-linecap': "round"
            });

        this.walls.push(wall);

        // drawWall is called after certain other functions, 
        // finished is set true within finished wall, therefore when drawing the last wall they should be made clickable.
        if (this.finished) {
            this.clickableWalls();
        }

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
            crossed = false,
            x1 = null,
            y1 = null;

        if (walls.length > 1) {

            x1 = walls[0].attrs.path[0][1];
            y1 = walls[0].attrs.path[0][2];

           if (this.wallCross(p1.x, p1.y, p2.x, p2.y)) {
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
        // 2: deciding to color the tmpline red/black based on if it crosses another,
        // and if it is the same as the starting point of the first wall.
        // 3: assigning "this.crossed" to false/true based on the above. used in endWall().
        if (tmpWall != null) {
            tmpWall.remove();
        }

        if (crossed && !(x1 == p2.x && y1 == p2.y)) {
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
            point = (point == null) ? [this.walls[0].attrs.path[0][1], this.walls[0].attrs.path[0][2]] : point,
            doCircle = (tmpCircle == null) ? true : (tmpCircle[0] == null);


        if (doCircle) {
            this.tmpCircle = grid.paper.circle(point[0], point[1], this.radius, 0, 2 * Math.PI, false).attr(
            {
                fill: "#008000",
                'fill-opacity': 0.3, 
                stroke: "#3366FF"
            });

            this.tmpCircle.toBack();

        } else {
            this.tmpCircle.attr({
                path: [point[0], point[1]]
            });
        }
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
     * Some browser does not set the offsetX and offsetY variables on mouseclicks.
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
            
            myTable+="<td>" + walls[i].getTotalLength(); + " </td>";
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

