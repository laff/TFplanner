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
        this.size = 5,               // How many pixels between each horizontal/vertical line.
        this.cutPix = 0.5;           // Used so that the drawing of a line not overlaps on the previous pixel.
    }

    Grid.prototype.paper = Raphael(document.getElementById('canvas_container'));
    Grid.prototype.offsetX = 0.5;
    Grid.prototype.offsetY = 0.5;

    Grid.prototype.draw = function() {

        var paper = this.paper,
            canvas = $('#canvas_container'),
            size = this.size,               
            cutPix = this.cutPix,           
            line,                   // Saves the path to a variable during construction.
            width = (canvas.width()).toFixed(),    // The width and the height of the svg-element.
            height = (canvas.height()).toFixed();

        paper.setViewBox(0, 0, paper.width, paper.height); 
        

        // Draw vertical lines on the screen (lines are drawn so that the screen is filled even on min. zoom)
        for (var i = 1; i <= width; i++) {
            
            // Draw on every 10th pixel
            if (i % 10 === 0) {
                line = paper.path("M"+(i*size+cutPix)+", "+0+", L"+(i*size+cutPix)+", "+(size*height)).attr({'stroke-opacity': 0.4});   //Path-function is named 'paperproto.path' in raphael.js
            }
        }

        // Draw horizontal lines on the screen (lines are drawn so that the screen is filled even on min. zoom)
        for (var i = 1; i <= height; i++) {

           // Make every 10th pixel.
           if (i % 10 === 0 ) {
                line = paper.path("M"+0+", "+(i*size+cutPix)+", L"+(size*width)+", "+(i*size+cutPix)).attr({'stroke-opacity': 0.4});
            }
        }

        //paper.setSize("100%" , "100%");
    }

    //X and Y values for upper left corner of box
    Grid.prototype.menuBox = function (x, y) {
        var paper = this.paper,
            frame = paper.rect(x, y, 310, 110),
            box = paper.rect(x, y, 100, 100),
            line1 = paper.path("M"+(50+x)+", " +y+", L"+(50+x)+", "+(25+y)).attr({'stroke-opacity': 0}),
            line2 = paper.path("M"+(50+x)+", " +(75+y)+", L"+(50+x)+", "+(100+y)).attr({'stroke-opacity': 0}),
            line3 = paper.path("M"+(x)+", " +(50+y)+", L"+(25+x)+", "+(50+y)).attr({'stroke-opacity': 0}),
            line4 = paper.path("M"+(75+x)+", " +(50+y)+", L"+(100+x)+", "+(50+y)).attr({'stroke-opacity': 0})
            clearButton = paper.image("Graphics/clear_unpressed.png", x+115, y+10, 70, 30);

        frame.attr({'stroke-opacity': 1.0, 'stroke': "black", 'stroke-width': 3.0, 'fill': "white", 'fill-opacity': 0.8});
        box.attr({'stroke-opacity': 1.0, 'stroke': "green", 'stroke-width': 3.0, 'fill': "white", 'fill-opacity': 0.1});
        line1.attr({'stroke-opacity': 1.0, 'stroke': "green", 'stroke-width': 3.0, "arrow-start": "classic-midium-midium"});
        line2.attr({'stroke-opacity': 1.0, 'stroke': "green", 'stroke-width': 3.0, "arrow-end": "classic-midium-midium"});
        line3.attr({'stroke-opacity': 1.0, 'stroke': "green", 'stroke-width': 3.0, "arrow-start": "classic-midium-midium"});
        line4.attr({'stroke-opacity': 1.0, 'stroke': "green", 'stroke-width': 3.0, "arrow-end": "classic-midium-midium"}),
        t = grid.paper.text(50+x, 50+y, "100 cm");

        //Event handler for clear button
        clearButton.mousedown(function(e) {
            //Loads image of pressed button
            var pressedButton = paper.image("Graphics/clear_pressed.png", x+115, y+10, 70, 30);
            if (ourRoom.finished == true) {
                paper.clear();
                var resultGrid = new ResultGrid();
                ourRoom.clearRoom();
                ourRoom = new Room(20);
                setTimeout(function(){
                    resultGrid.clear();
                    grid.draw();
                    grid.menuBox(0,0);
                }, 5000);
                
            }
            //"Unclicks" button
            setTimeout(function(){ pressedButton.remove() }, 300);
        });
    }


    var grid = new Grid();

    grid.draw();

    grid.menuBox(0, 0);

// This is the old functionality for "locking" a wall to a corner in the grid.
// TODO: This should be removed
/*
    Grid.prototype.getLatticePoint = function(x, y) {

      var tx = x - this.offsetX;
      var ty = y - this.offsetY;
      tx += this.size / 2;
      ty += this.size / 2;
      tx = parseInt(tx / this.size);
      ty = parseInt(ty / this.size);
      tx = Grid.range(tx, 0, this.width);
      ty = Grid.range(ty, 0, this.height);

      return new Point(x, y);
    }
*/
    /**
     * Makes sure that the user can`t draw in the left corner, where the 'scale' is.
     * TODO: Old functionality commented, should be removed!
    **/

    Grid.prototype.getRestriction = function(xy) {

        var x = xy[0],
            y = xy[1];
          //var x = latticePoint.x* this.size + this.offsetX;
          //var y = latticePoint.y * this.size + this.offsetY;

        if (!(x < 310 && y < 110))
            return new Point(x, y);
        else
            return new Point(-1, -1);
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
        this.walls = grid.paper.set();
        this.tmpWall = null;
        this.tmpLen = null;
        this.tmpRect = null;
        this.tmpCircle = null;
        this.proximity = false;
        this.invalid = false;
        this.tmpCorners = [];
        this.initRoom();
        this.handle = null;
        this.pathHandle = null;
        this.hoverWall = null;
        this.finished = false;
        this.measurements = grid.paper.set();
        this.tmpMeasurements = grid.paper.set();
        this.inverted = null;
        this.measurementValues = [];
        this.xAligned = false;
        this.yAligned = false;
        this.minAngle = 29.95;
        this.maxAngle = 330.05;
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

            // TEMPROARY SOLUTION: if click is inside the menu box => not registered
            if (point.x == -1) {}
            else if (room.lastPoint == null) {
                room.lastPoint = point;
            } else {
                room.wallEnd(point);
            }
        });

        // Binds action for mouseover, specifically for showing temp shit
        $('#canvas_container').mousemove(room, function(e) {

            var point = crossBrowserXY(e);

            if (room.lastPoint != null && point.x != -1) {

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
    Room.prototype.tmpLength = function(tmpWall) {

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
     * Called when we have targeted a wall. Used to find the 'neighbour-walls' of our target.
     *
    **/
    Room.prototype.clickableWalls = function(wMatch) {

        var walls = this.walls,
            length = walls.length,
            room = this,
            thisWall = wMatch,
            prevWall = null,
            nextWall = null;

        for (var i = 0; i < length; i++) {

            // When wall number 'i' is the same as our targeted wall, we can easily find the two walls
            // connected to it. (Some special-cases when we have targeted the first or the last wall in the array)
            if (walls[i] == thisWall) {
                prevWall = (walls[i-1] != null) ? walls[i-1] : walls[length-1];
                nextWall = (walls[i+1] != null) ? walls[i+1] : walls[0];
            }            
        }
            // If we not already have targeted a wall or a corner, we can select the wanted one.
            if (room.pathHandle == null && room.handle == null) {
                room.clickableWall(prevWall, thisWall, nextWall);
            }
    }

    /**
     *  Function that adds drag and drop functionality to the walls.
     *  Parameters are our targeted wall, and it`s two neighbours.
    **/
    Room.prototype.clickableWall = function(prev, current, next) {

        var room = this,
            prevWall = prev,
            thisWall = current,
            nextWall = next,
            pathArray1 = prevWall.attr("path"),
            pathArray2 = thisWall.attr("path"),
            pathArray3 = nextWall.attr("path");


            // Handler used so we easily can target and drag a wall.
           room.pathHandle = grid.paper.path(thisWall.attrs.path).attr({
                stroke: "#3366FF",
                'stroke-width': room.radius,
                'stroke-opacity': 0.5, 
                'stroke-linecap': "butt",
                cursor: "move"
            });
           
           var start = function () {
                //this.lastdx = this.attr("lastdx");
                //this.lastdy = this.attr("lastdy");
            },
        
            move = function (dx, dy) {
                var xy = getZoomedXY(dx, dy),
                    diffx = (this.lastdx != null) ? (this.lastdx - xy[0]) : 0,
                    diffy = (this.lastdy != null) ? (this.lastdy - xy[1]) : 0;

                this.lastdx = xy[0];
                this.lastdy = xy[1];

                // Changing values of the end of the wall 'before' the target-wall.
                pathArray1[1][1] -= diffx;
                pathArray1[1][2] -= diffy;

                // Changing values of both ends of our dragged target.
                pathArray2[0][1] -= diffx;
                pathArray2[0][2] -= diffy;
                pathArray2[1][1] -= diffx;
                pathArray2[1][2] -= diffy;

                // Changing values of the wall 'after' our target-wall.
                pathArray3[0][1] -= diffx;
                pathArray3[0][2] -= diffy;

                // Updating the attributes of the three walls, so they are redrawn as they are dragged.
                prevWall.attr({path: pathArray1});
                thisWall.attr({path: pathArray2});
                nextWall.attr({path: pathArray3});
                this.attr({path: pathArray2});

                room.refreshMeasurements();
                options.refresh();

            },

            up = function () {
                // Clear variables and delete the handler on mouseup.
                this.lastdx = this.lastdy = 0;
                this.remove();
                room.nullify(); 
            };

        room.pathHandle.drag(move, start, up);
    }


    /**
     * Functionality for adding mouse-handlers to all the walls. Called when the 'finishRoom'-variable is set.
     *
    **/
    Room.prototype.setHandlers = function() {
        var walls = this.walls,
            room = this;

            // Looping through the set of walls, and adding handlers to all of them.
            walls.forEach(function(element) {

                 element.mouseover(function() {
                    // Do not visualize the mouseovered wall, if an other wall or corner is targeted.
                    if (room.handle == null && room.tmpCircle == null && room.pathHandle == null) {
                        room.hoverWall = true;
                        this.attr({
                            stroke: "#008000",            
                            'stroke-width': room.radius,
                            'stroke-opacity': 0.5,
                            'stroke-linecap': "butt",
                            cursor: "pointer"      
                        })
                    }
                })

                element.mousedown(function() {
                    room.clickableWalls(this);
                })
            
                element.mouseout(function() {
                    room.hoverWall = null;
                    this.attr({
                        stroke: "#2F4F4F",
                        'stroke-width': 5,
                        'stroke-linecap': "square",
                        'stroke-opacity': 1,
                        cursor: "default"
                    })
                })
            })
    }

    /**
     * Binds action listeners to mouse click and movement, especially for moving corners and walls.
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
            // No need to draw the circle if a corner or a wall already is targeted.
            if ((match = room.checkMatch(e)) != null && room.handle == null && room.pathHandle == null && room.hoverWall == null) {
                room.visualizeRoomEnd(match);

            } else if (room.tmpCircle != null) {
                room.tmpCircle.remove();
                room.tmpCircle = null;
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

                if (this.handle == null && this.pathHandle == null) {
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

        room.handle = grid.paper.circle(mx,my,this.radius).attr({
            fill: "#3366FF",
            'fill-opacity': 0.5,
            'stroke-opacity': 0.5,
            cursor: "move"
        });

        var start = function () {
          this.cx = this.attr("cx");
          this.cy = this.attr("cy");
        },

        move = function (dx, dy) {
            var xy = getZoomedXY(dx, dy), 
            X = this.cx + xy[0],
            Y = this.cy + xy[1];

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
            room.refreshMeasurements();
            options.refresh();    
        },

        up = function () {
           this.dx = this.dy = 0;
           this.animate({"fill-opacity": 1}, 500);
           this.remove()
           room.nullify();           
        };

        room.handle.drag(move, start, up);
    }

    /**
     * Function to make sure our handlers are cleared, and nullified.
    **/
    Room.prototype.nullify = function() {
        this.handle = null;
        this.pathHandle = null;
    }

    /**
     * Function that unbinds mouse actions related to creating a room.
    **/
    Room.prototype.finishRoom = function () {

        $('#canvas_container').unbind('click');
        $('#canvas_container').unbind('mousemove');

        this.clickableCorners();

        this.finished = true;
        //this.zoom();
    }

    /**
     * Function handling logic for the first point of a wall.
     * 
    **/
    Room.prototype.wallEnd = function (point) {
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
                this.finishRoom();
                console.log("Finish this!");
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
    Room.prototype.isProximity = function (point1, point2) {

        
        var initPointX = (point2 == null) ? this.walls[0].attrs.path[0][1] : point2[0],
            initPointY = (point2 == null) ? this.walls[0].attrs.path[0][2] : point2[1];

            // No need to check the length if point1 is undefined. (Might occur over text at the grid)
            if (point1 == undefined) {return;}
            testLength = vectorLength(initPointX, initPointY, point1.x, point1.y);


            return (testLength <= this.radius);

            /*

            diffX = (initPointX > endPointX) ? (initPointX - endPointX) : (endPointX - initPointX), 
            diffY = (initPointY > endPointY) ? (initPointY - endPointY) : (endPointY - initPointY);

        if ( diffX < rad && diffY < rad) {
            return true;
        } else {
            return false;
        }

        */


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

        var room = this;

        // checking if x or y is set to aligned
        point2.x = (this.xAligned && !this.proximity) ? point1.x : point2.x;
        point2.y = (this.yAligned && !this.proximity) ? point1.y : point2.y;

        // If we have a temp-wall, we want to remove it, and at the same time remove the shown length of it.
        if (room.tmpWall != null) {

            room.tmpWall.remove();
            room.tmpWall = null;
            room.tmpRect.remove();
            room.tmpRect = null;
            room.tmpLen.remove();
            room.tmpLen = null;
            room.tmpMeasurements.remove();
            room.tmpMeasurements.clear();
        }

        wall = grid.paper.path("M"+point1.x+","+point1.y+"L"+point2.x+","+point2.y).attr({ 
                stroke: "#2F4F4F",
                'stroke-width': 5,
                'stroke-linecap': "round"
            });

        room.walls.push(wall);

        //options.refresh();
        room.refreshMeasurements();

        // When the room is finished, we can add handlers to the walls.
        if (room.finished) { 
            room.setHandlers();
            options.refresh();
        }
    }

    /**
     * Visualization of the line that the user is about to draw, and the length of the line.
     * This line will not be saved in our array.
    **/
    Room.prototype.drawTempLine = function (point2, point1, callback) {

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
            //
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
        tmpLen = vectorLength(p1.x, p1.y, p2.x, p2.y);

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
            var tmpAngle = this.angleMeasurement(null, this.tmpWall),
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


        } else if (this.tmpMeasurements != null) {
            this.tmpMeasurements.remove();
            this.tmpMeasurements.clear();
        }

        return tmpWall;
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
     * Function that renews the measurements visualized.
     * This function should be called each time paths are drawn / changed.
     *
     * Goes through all walls and calls length and angle functions with appropriate variables.
     * 
     * OBS! Should it go through all walls or only the ones that have changed?
     *
    **/
    Room.prototype.refreshMeasurements = function () {

        var walls = this.walls,
            finished = this.finished,
            len = walls.length,
            measurementValues = this.measurementValues;

        measurementValues.length = 0;

        this.measurements.remove();

        for (var i = 0; i < len; i++) {

            measurementValues.push([]);

            if (finished || i >= 1) {
              measurementValues[i].push(this.angleMeasurement(i));
            }

        measurementValues[i].push(this.lengthMeasurement(walls[i]));
            
        }


    }

    /**
     *
     *
    **/
    Room.prototype.angleMeasurement = function (index, overload) {

        var circleRad = (this.radius * 2),
            angle,
            tPoint = [],
            startAngle, 
            endAngle,
            diffAngle,
            inverted,
            halfCircleP1,
            halfCircleP2,
            halfCircle,
            p1, 
            p2, 
            p3 = [];

        if (overload == null) {
            var connected = this.returnConnectingPaths(index);

            p1 = connected[0].attrs.path[0];
            p2 = connected[0].attrs.path[1];
            p3 = connected[1].attrs.path[1];  

            // finding the points used for positioning the halfcircle.
            halfCircleP1 = connected[0].getPointAtLength((connected[0].getTotalLength() - circleRad));
            halfCircleP2 = connected[1].getPointAtLength(circleRad);

        } else {

            if (this.tmpMeasurements !=  null) {
                this.tmpMeasurements.remove();
                this.tmpMeasurements.clear();
            }
            
            var walls = this.walls,
                index = (walls.length - 1);

            p1 = walls[index].attrs.path[0];
            p2 = walls[index].attrs.path[1];
            p3 = overload.attrs.path[1];

            halfCircleP1 = walls[index].getPointAtLength((walls[index].getTotalLength() - circleRad));
            halfCircleP2 = overload.getPointAtLength(circleRad);
        }




            // Calculating the angle.
            angle = Raphael.angle(p1[1], p1[2], p3[1], p3[2], p2[1], p2[2]);

            // Need the start and ending angles between paths/points are needed for checking.
            startAngle = Raphael.angle(p1[1], p1[2], p2[1], p2[2]);
            endAngle = Raphael.angle(p2[1], p2[2], p3[1], p3[2]);

            diffAngle = endAngle - startAngle;



            // decides if the drawing is inverted or not
            if (this.inverted == null && overload == null) {
                this.inverted = (angle > 0 && angle < 180);
            }
            inverted = this.inverted; 

            // if inverted, always draw from the right.
            if (inverted) {

                if (angle < 0) {
                    angle = 360 + angle;
                }

                halfCircle = this.sector(p2[1], p2[2], halfCircleP1, halfCircleP2, angle, circleRad);
            
            } else {


                // Ensure that angle is positive.
                if (angle < 0) {
                    angle = angle * (-1);   
                }
              
                // angles that have an endangle larger and startangle larger than 180.
                if (endAngle >= 180) {

                    if (startAngle >= 180) {
                        angle = 360 - angle;

                    } else if (diffAngle < 180) {
                        angle = 360 - angle;
                    }


                // All angles that have endangles and startangles thar are smaller than 180, 
                // and also have a difference (diffangle) lower than -180.
                } else {

                    if (startAngle >= 180 && diffAngle < - 180) {
                        angle = 360 - angle;
                    }
                }

                var tmp = halfCircleP2;
                halfCircleP2 = halfCircleP1;
                halfCircleP1 = tmp;

                halfCircle = this.sector(p2[1], p2[2], halfCircleP1, halfCircleP2, angle, circleRad);

            }

            if (halfCircle != null) {
                var textPoint = halfCircle.getPointAtLength((halfCircle.getTotalLength()/2)),
                    newAngle = angle.toFixed(1),
                    hc,
                    textPoint = midPoint(textPoint, p2);

                hc = grid.paper.text(textPoint[0], textPoint[1], newAngle + String.fromCharCode(176));
            }


        if (overload != null) {
            this.tmpMeasurements.push(halfCircle, hc);
        } else {
            this.measurements.push(halfCircle, hc);
        }

        // return angle for our measurementValues array.
        return angle;
    }

    /**
     * Function that creates a "circle" from point1 to point2.
     * 
     *
    **/
    Room.prototype.sector = function (centerX, centerY, p1, p2, angle, r) {
        var big = (angle >= 180) ? 1 : 0,
            x1 = p1.x, 
            x2 = p2.x, 
            y1 = p1.y,
            y2 = p2.y,
            strokeColor = (angle < this.minAngle || angle > this.maxAngle) ? "ff0000" : "2F4F4F";

        return grid.paper.path(["M", centerX, centerY, "L", x1, y1, "A", r, r, 0, big, 0, x2, y2, "z"]).attr(            
            {
                fill: "#00000", 
                stroke: strokeColor,
                'stroke-width': 1,
                'stroke-linecap': "round"
            });
    }


    /**
     * Function that gets the connecting walls.
     *
    **/
    Room.prototype.returnConnectingPaths = function (index) {

        var walls = this.walls,
            prevWall,
            thisWall;

            if (this.finished) {
                prevWall = walls[index];
                thisWall = (walls[index+1] != null) ? walls[index+1] : walls[0];
            } else {
                prevWall = walls[index-1];
                thisWall = walls[index];
            }

        return [prevWall, thisWall];

    }


    /**
     * Function that creates a graphical representation of the walls length
     *
    **/

    Room.prototype.lengthMeasurement = function (wall) {

        var startP1 = wall.attrs.path[0],
            endP1 = wall.getPointAtLength(this.radius),
            startP2 = wall.attrs.path[1],
            endP2 = wall.getPointAtLength((wall.getTotalLength() - this.radius)),


            m1 = grid.paper.path("M"+startP1[1]+","+startP1[2]+"L"+endP1.x+","+endP1.y).attr(
            {
                fill: "#00000", 
                stroke: "#2F4F4F",
                'stroke-width': 1,
                'stroke-linecap': "round"
            }),

            m2 = grid.paper.path("M"+startP2[1]+","+startP2[2]+"L"+endP2.x+","+endP2.y).attr(
            {
                fill: "#00000", 
                stroke: "#2F4F4F",
                'stroke-width': 1,
                'stroke-linecap': "round"
            }),
            angle1,
            angle2,
            m1x,
            m1y,
            m2x,
            m2y,
            bm1,
            bm2,
            m3p1x,
            m3p1y,
            m3p2x,
            m3p2y,
            m3,
            t,
            r;

        if (this.inverted) {
            angle1 = 270;
            angle2 = 90;
        } else {
            angle1 = 90;
            angle2 = 270;
        }

        //m1.transform("r"+angle1+","+startP1[1]+","+startP1[2]);
        //m2.transform("r"+angle2+","+startP2[1]+","+startP2[2]);


        var //transform = m1.attr('transform'),
            transform1 = "r"+angle1+","+startP1[1]+","+startP1[2],
            transformedPath = Raphael.transformPath(m1.attr('path'), transform1);

        thinLine.startLine(transformedPath[1][3], transformedPath[1][4]);


         //transform = m2.attr('transform'),
            transform1 = "r"+angle2+","+startP2[1]+","+startP2[2],
            transformedPath = Raphael.transformPath(m2.attr('path'), transform1);

        thinLine.endLine(transformedPath[1][3], transformedPath[1][4]);

        m1.transform("r"+angle1+","+startP1[1]+","+startP1[2]);
        m2.transform("r"+angle2+","+startP2[1]+","+startP2[2]);

        /*

        m1.animate( 
            {
                
            },
            0,
            "none",
            function() {
                var transform = this.attr('transform'),
                    transformedPath = Raphael.transformPath(this.attr('path'), transform);

                thinLine.startLine(transformedPath[1][3], transformedPath[1][4]);
                

            }
        )

        m2.animate( 
            {
                transform: "r"+angle2+","+startP2[1]+","+startP2[2]
            },
            0,
            "none",
            function() {
                var transform = this.attr('transform'),
                    transformedPath = Raphael.transformPath(this.attr('path'), transform);

                thinLine.endLine(transformedPath[1][3], transformedPath[1][4]);

            }
        )
    
        */

        //bm1 = m1.getBBox();
       // bm2 = m2.getBBox();


        // Check what BBox value to use!
        //
        // Checking for the x value for point1 of our new  measurement line.
        /*
        if (bm1.x == startP1[1]) {
            m3p1x = bm1.x2;
        } else {
            m3p1x = bm1.x;
        } 
        // checking for the y.
        if (bm1.y == startP1[2]) {
            m3p1y = bm1.y2;
        } else {
            m3p1y = bm1.y;
        }


        // Checking for the x value for point2 of our new  measurement line.
        if (bm2.x == startP2[1]) {
            m3p2x = bm2.x2;
        } else {
            m3p2x = bm2.x;
        } 
        // checking for the y.
        if (bm2.y == startP2[2]) {
            m3p2y = bm2.y2;
        } else {
            m3p2y = bm2.y;
        }
*/
        // Drawing the line paralell to the wall.        
      /*  m3 = grid.paper.path("M"+m3p1x+","+m3p1y+"L"+m3p2x+","+m3p2y).attr({
                fill: "#00000", 
                stroke: "#2F4F4F",
                'stroke-width': 1,
                'stroke-linecap': "round"
            });


        // Functionality that shows length and shit.. doesnt look very good.
        var textPoint = m3.getPointAtLength((m3.getTotalLength()/2)),
            len = new Number(wall.getTotalLength())/100;
            len = len.toFixed(2);
        // Draws a rectangle at the middle of the line
        r = grid.paper.rect(textPoint.x-25, textPoint.y-10, 50, 20, 5, 5).attr({
            opacity: 1,
            fill: "white"
        });

        // Adds text on top of the rectangle, to display the length of the wall.
        t = grid.paper.text(textPoint.x, textPoint.y, len + " m").attr({
            opacity: 1,
            'font-size': 12,
            'font-family': "verdana",
            'font-style': "oblique"
        });

*/

        // Adds to measurements set.
        this.measurements.push(m1, m2);

        // return length for our measurementValues array.
        return wall.getTotalLength();
    }


    function ThinLine() {
        this.startX; 
        this.startY;
    }

    ThinLine.prototype.startLine = function(x, y) {
        this.startX = x;
        this.startY = y;
    }

    ThinLine.prototype.endLine = function(x, y) {

        var x1 = this.startX,
            y1 = this.startY,

        // Drawing the line paralell to the wall.        
        m = grid.paper.path("M"+x1+","+y1+"L"+x+","+y).attr({
                fill: "#00000", 
                stroke: "#2F4F4F",
                'stroke-width': 1,
                'stroke-linecap': "round"
            }),

        // Functionality that shows length and shit.. doesnt look very good.
        textPoint = m.getPointAtLength((m.getTotalLength()/2)),
        len = new Number(m.getTotalLength())/100,
        len = len.toFixed(2),

        // Draws a rectangle at the middle of the line
        r = grid.paper.rect(textPoint.x-25, textPoint.y-10, 50, 20, 5, 5).attr({
            opacity: 1,
            fill: "white"
        }),

        // Adds text on top of the rectangle, to display the length of the wall.
        t = grid.paper.text(textPoint.x, textPoint.y, len + " m").attr({
            opacity: 1,
            'font-size': 12,
            'font-family': "verdana",
            'font-style': "oblique"
        });



        ourRoom.measurements.push(m, r, t);

    }

    //Function removes the currently drawn room)
    Room.prototype.clearRoom = function() {
        var walls = this.walls, 
            tmpCorners = this.tmpCorners,
            len = walls.length;

        //Empties arrays
        for (var i = len-1; i >= 0; --i)
        {
            walls[i].remove();
        }
        walls.clear();
        len = tmpCorners.length;
        for (var i = len-1; i >= 0; --i)
        {
            tmpCorners[i].remove();
            tmpCorners.pop();
        }

        this.lastPoint = null;
        this.proximity = false;

        this.refreshMeasurements();
        options.refresh();

        ourRoom.finished = false;
    }


    /**
     * Function to be used for 'pre-defined' rooms. All drawing will be done 'clockwise', and
     * will follow the angle-axis predefined. (180 is straight to the right, 270 is downwards etc.)
     * @param len - Array with the length of each wall (entered by the user).
     * @param ang - Array with predefined angles for the chosen room-shape.
    **/
    Room.prototype.createRoom = function(ang) {

        var p1,
            p2,
            initPoint,
            room = this,
            p2tmp,
            tmpAng;

            room.clearRoom();
            
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
            room.wallEnd(p2);
        }
    }

    /**
     *  Zoom functionality
     *
     * Sauce: http://jsfiddle.net/9zu4U/147/
    **/
    Room.prototype.zoom = function() {

        var paper = grid.paper,
            canvasID = "#canvas_container",

            viewBoxWidth = paper.width,
            viewBoxHeight = paper.height,
            
            startX,
            startY,
            mousedown = false,
            dX,
            dY,
            oX = 0,
            oY = 0,
            oWidth = viewBoxWidth,
            oHeight = viewBoxHeight,

            // View box
            viewBox = paper.setViewBox(oX, oY, viewBoxWidth, viewBoxHeight);
            viewBox.X = oX;
            viewBox.Y = oY;


        /** 
         * This is high-level function.
         * It must react to delta being more/less than zero.
         */
        function handle(delta) {


            /*
                TODO:

                - New plan, change grid scale and redraw room? 5-10 steps?
                - No, no no.. No plan.
            */

            


            vBHo = viewBoxHeight;
            vBWo = viewBoxWidth;

            if (delta < 0) {
                viewBoxWidth *= 0.95;
                viewBoxHeight*= 0.95;

            } else {
                viewBoxWidth *= 1.05;
                viewBoxHeight *= 1.05;
            }

            viewBox.X -= (viewBoxWidth - vBWo) / 2;
            viewBox.Y -= (viewBoxHeight - vBHo) / 2;

            paper.setViewBox(0, 0, /*viewBox.X,viewBox.Y,*/viewBoxWidth,viewBoxHeight);
        }

        /** 
         * Event handler for mouse wheel event.
         */
        function wheel(event){
            var delta = 0;

            /* For IE. */
            if (!event) {
                event = window.event;
            }
            /* IE/Opera. */
            if (event.wheelDelta) { 
                delta = event.wheelDelta/120;

            /** Mozilla case. */
            } else if (event.detail) { 
                /** In Mozilla, sign of delta is different than in IE.
                * Also, delta is multiple of 3.
                */
                delta = -event.detail/3;
            }
            /** If delta is nonzero, handle it.
            * Basically, delta is now positive if wheel was scrolled up,
            * and negative, if wheel was scrolled down.
            */
            if (delta) {
                handle(delta);
            }
                

            /** Prevent default actions caused by mouse wheel.
            * That might be ugly, but we handle scrolls somehow
            * anyway, so don't bother here..
            */
            if (event.preventDefault) {
                event.preventDefault();
            }
                 
            event.returnValue = false;
        }

        /** Initialization code. 
        * If you use your own event management code, change it as required.
        */
        if (window.addEventListener) {
            /** DOMMouseScroll is for mozilla. */
            window.addEventListener('DOMMouseScroll', wheel, false);
        }
        /** IE/Opera. */
        window.onmousewheel = document.onmousewheel = wheel;

        //Pane
        
        if (this.finished) {

            $(canvasID).mousedown(function(e){

                if (paper.getElementByPoint( e.pageX, e.pageY ) != null) {
                    return;
                }

                mousedown = true;
                startX = e.pageX; 
                startY = e.pageY;    
            });



            $(canvasID).mousemove(function(e){

                if (mousedown == false) {
                    return;
                }

                dX = startX - e.pageX;
                dY = startY - e.pageY;
                x = viewBoxWidth / paper.width; 
                y = viewBoxHeight / paper.height; 

                dX *= x; 
                dY *= y; 
                //alert(viewBoxWidth +" "+ paper.width );

                paper.setViewBox(viewBox.X + dX, viewBox.Y + dY, viewBoxWidth, viewBoxHeight);

            })

            $(canvasID).mouseup(function(e){

                if ( mousedown == false ) {
                    return;
                }

                viewBox.X += dX; 
                viewBox.Y += dY; 
                mousedown = false; 

            });

        }
    }

    // Starts the room creation progress!
    var ourRoom = new Room(20);

    var thinLine = new ThinLine();

    ourRoom.zoom();

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
            e = e || window.event,
            x, 
            y,
            paper = grid.paper;


        x = e.offsetX;
        y = e.offsetY;

         // FF FIX        

        if (e.offsetX == undefined) { 
            x = e.screenX;//e.pageX;//- e.currentTarget.offsetLeft; 
            y = e.screenY;//e.pageY;// - e.currentTarget.offsetTop; 
        }
    









        // I used to use offsetX and Y, I still do, but i used to too.

        point = grid.getRestriction(getZoomedXY(x, y));

        return point;
    }

    function getZoomedXY(x, y) {
        var paper = grid.paper,
            sX = paper._viewBox[2],
            sY = paper._viewBox[3],
            oX = paper.width,
            oY = paper.height,
            ratio;


        if (sX != oX && sY != oY) {

            ratio = (sX / oX).toFixed(5);

            x *= ratio;
            y *= ratio;
        }

        return [x, y];
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

        var measurementValues = ourRoom.measurementValues,
            angleArr = [];

        // Creating the column names
        var myForm = "<form id='options'>";

     /*   // Filling in information
        for (var i = 0; i < measurementValues.length; i++) {

            // Wall number / name
            myForm += "wall" + i + " length";

            // wallinput
            myForm += "<input type='text' id=walll"+i+" value=" + measurementValues[i][1];
            myForm += "><br>";


            // Wall number / name
            myForm += "wall" + i + " angle";

            // wallinput
            myForm += "<input type='text' id=walla"+i+" value=" + measurementValues[i][0];
            myForm += "><br>";

            // extract point x and y.
            
           // myTable+="<td>" + walls[i].getTotalLength(); + " </td>";
        }
            myForm+="</form>";


        $('#options_container').html(myForm);

        */  

        //OBS: To get the 'original' functionality that update the wall-lengths etc, just out-comment the below code, and add the above code instead.

        //TODO: Hardcoded number of walls to be sure we create enough fields when testing.
        // The buttons should be created first, and the fields should be created afterwards (so it depends on the number of walls in the chosen shape)
        //TODO2: When a room is finished, the form outcommented above should be shown, including the length of the walls etc.

   /*     for (var i = 0; i < 8; i++) {

            // Wall number / name
            myForm += "wall" + i + " length";

            // wallinput
            myForm += "<input type='text' id=walll"+i+" value=";
            myForm += "><br>";

        }
        */

            myForm = "<button id='rect' type='button'>Rectangle</button>";
            myForm += "<button id='lshape' type='button'>L-shape</button>";
            myForm += "<button id='tshape' type='button'>T-shape</button>";
            myForm += "<button id='generate' type='button'>Generate Room</button>";

           // myForm+="</form>";


        $('#options_container').html(myForm);

        //TODO: The input-fields in myForm should be made AFTER the shape-buttons is clicked.
        // The user first choose the shape of the room, then the angleArr is set, based on what button was clicked.
     
        $('#generate').click(function() {
           // for (var i = 0; i < angleArr.length+1; i++) {
                // Checks if an valid integer is entered and checks if the field is empty (TODO: Should maybe check if it is > 50cm or something)

       /*     if (!isNaN($('#walll'+i).val()) && ($('#walll'+i).val()) != "") {
                    lengthArr.push($('#walll'+i).val());
                } else {
                    alert("Alle felter må fylles med tall!");
                    //Empties the array (just to be sure!).
                    lengthArr = [];
                    return;
                }
            }

        */

            angleArr = new PreDefRoom(8);
            ourRoom.createRoom(angleArr);

            
        });

        $('#rect').click(function() {
            angleArr = new PreDefRoom(0);
            ourRoom.createRoom(angleArr);
        });

        $('#lshape').click(function() {
            angleArr = new PreDefRoom(1);
            ourRoom.createRoom(angleArr);
        });

        $('#tshape').click(function() {
            angleArr = new PreDefRoom(2);
            ourRoom.createRoom(angleArr);
        });
    }

    /**
     * Function that holds the shapes and wall-lengths of 'predefined' rooms.
    **/
    function PreDefRoom (value) {

        switch(value) {
            case 0:
                return rectArr = [[180, 270, 360, 90],[300, 200, 300, 200]];                                            //Rectangle-shaped
            case 1:
                return lArr = [[180, 270, 180, 270, 360, 90],[200, 150, 200, 150, 400, 300]];                           //L-shaped
            case 2:
                return tArr = [[180, 270, 360, 270, 360, 90, 360, 90],[450, 150, 150, 250, 150, 250, 150, 150]];        //T-shaped
            case 3:
                return lRot90 = [[180, 270, 360, 270, 360, 90],[400, 150, 200, 150, 200, 300]];                         //L-shape rotated 90 degrees.
            case 4:
                return lRot180 = [[180, 270, 360, 90, 360, 90], [400, 350, 200, 200, 200, 150]];                        //L-shape rotated 180 degrees.
            case 5:
                return lRot270 = [[180, 270, 360, 90, 180, 90],[200, 300, 400, 150, 200, 150]];                         //L-shape rotated 270 degrees.
            case 6:
                return tRot90 = [[180, 270, 360, 90, 360, 90, 180, 90], [150, 450, 150, 150, 250, 150, 250, 150,]];     //T-shape rotated 90 degrees.
            case 7:
                return tRot180 = [[180, 270, 180, 270, 360, 90, 180, 90], [150, 250, 150, 150, 450, 150, 150, 250]];    //T-shape rotated 180 degrees.
            case 8:
                return tRot270 = [[180, 270, 180, 270, 360, 270, 360, 90], [150, 150, 250, 150, 250, 150, 150, 450]];  //T-shape rotated 270 degrees.
        }
    }



    // initiates the options_container
    var options = new Options('options_container');

    // Function that takes two points and calculates their vector length.
    function vectorLength(x1, y1, x2, y2) {

        var x = Math.pow((x2 - x1), 2),
            y = Math.pow((y2 - y1), 2),
            result = Math.pow((y + x), (1/2));

        return result;
    }
    
    /**
     * midpoint formula
    **/
    function midPoint(p1, p2) {
        var x1 = p1.x,
            x2 = p2[1],
            y1 = p1.y,
            y2 = p2[2],
            x = ( (x1 + x2) / 2),
            y = ( (y1 + y2) / 2);

        return ([x, y]);
    }

    //Constructor for the result display
    function ResultGrid() {
        this.size = 5;
        this.height = 0;
        this.width = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1;
        this.paper = Raphael(document.getElementById('canvas_container'));
        this.squares = [];
        this.area = 0;

        this.findDimension();

        //No scaling of image
        this.path = this.getWalls(this.offsetX, this.offsetY);

        this.populateSquares();

        this.draw(this.height, this.width, this.path);
    }


    //Function finds the height and width of the figure, as well as the height
    // and width of the screen. Also sets scale of image based on relation
    // between screen height/width and room height/width
    ResultGrid.prototype.findDimension = function() {
        var minX = 1000000, 
            maxX = 0, 
            minY = 1000000, 
            maxY = 0, 
            walls = ourRoom.walls,
            numberOfWalls = walls.length,
            yscale,
            xscale,
            canvas = $('#canvas_container');

        for (var i = 0; i < numberOfWalls; ++i)
        {
            //Find largest and smallest X value
            if ( (walls[i].attrs.path[0][1]) > maxX )
                maxX = walls[i].attrs.path[0][1];
            if ( (walls[i].attrs.path[1][1]) > maxX)
                maxX = walls[i].attrs.path[1][1];
            if ( (walls[i].attrs.path[0][1]) < minX )
                minX = walls[i].attrs.path[0][1];
            if ( (walls[i].attrs.path[1][1]) < minX )
                minX = walls[i].attrs.path[1][1];

            //Find smallest and largest Y value
            if ( (walls[i].attrs.path[0][2]) > maxY )
                maxY = walls[i].attrs.path[0][2];
            if ( (walls[i].attrs.path[1][2]) > maxY )
                maxY = walls[i].attrs.path[1][2];
            if ( (walls[i].attrs.path[0][2]) < minY )
                minY = walls[i].attrs.path[0][2];
            if ( (walls[i].attrs.path[1][2]) < minY )
                minY = walls[i].attrs.path[1][2];
        } 

        //Sets ResultGrid variables
        this.offsetX = minX -49;
        this.offsetY = minY - 49;
        this.width = (maxX - minX);
        this.height = (maxY - minY);

        //Finds a scale for final room, used to draw result
        xscale = canvas.width()/this.width,
        yscale = canvas.height()/this.height;
        this.scale = (xscale < yscale)?xscale:yscale;
        this.scale = this.scale.toFixed();
    }



    //Draws a scaled version of the path. VERY UNFINISHED!
    ResultGrid.prototype.draw = function(h, w, path) {
        paper = this.paper;
        var canvas = $('#canvas_container'), 
            xscale = canvas.width()/w,
            yscale = canvas.height()/h,
            squares = this.squares;
        //path.scale(xscale < yscale?xscale:yscale);
    }


    //Gets wall elements from ourroom and translates to new grid 
    ResultGrid.prototype.getWalls = function (offsetX, offsetY, scale) {
        
        var scalefactor;
        (scale!=null)?scalefactor = scale:scalefactor = 1;

        var walls = ourRoom.walls,
            paper = this.paper,
            size = this.size,
            width = 0, 
            height = 0,
            numberOfWalls = walls.length,
            pathString, 
            tempString,
            xstart = (walls[0].attrs.path[0][1]- offsetX)*scalefactor, 
            ystart = (walls[0].attrs.path[0][2]- offsetY)*scalefactor,
            xcurrent,
            ycurrent,
            path;

        pathString = new String("M "+xstart + ", "+ ystart);

        for (var i = 1; i < numberOfWalls; ++i)
        {
            xcurrent = (walls[i].attrs.path[0][1]- offsetX)*scalefactor; 
            ycurrent = (walls[i].attrs.path[0][2]- offsetY)*scalefactor;

            tempString = " L"+xcurrent + ", "+ ycurrent;
            pathString += tempString;
        }

        tempString = " Z";
        pathString += tempString;
        path = paper.path(pathString);
        path.attr({
            'stroke-width':     3.0,
            'stroke':           "Black",
            'stroke-opacity':   1.0 
        });

        return pathString;
    }

    //Divides the areaa into suqares, does wall and obstacle detecetion and
    // calculates the area to be covered
    ResultGrid.prototype.populateSquares = function() {
        var squares = this.squares,
            paper = this.paper,
            path = this.path,
            xdim = 50, 
            ydim = 50,
            width = this.width,
            height = this.height,
            square;

        //The grid is slightly larger than the figure, 
        // and grid is padded so that we don't get partial squares 
        height = height +100 + (50-height%50);
        width = width + 100 +(50-width%50);

        for (var i = 0; i < height; i += ydim) {
            for (var j = 0; j < width; j += xdim) {
                square = new Square(j, i, path, paper);
                squares.push(square);
                this.area += square.area;
            }
        }
        console.log("Availabe area: " + this.area + " square cm");
        this.area = this.area/(100*100);
        this.area = Math.floor(this.area);
        console.log("Usable area: " + this.area + " square meters");

    }

    //Constructor for a 0.5m X 0.5m square
    function Square (x, y, path, paper) {
        this.xpos = x/50;
        this.ypos = y/50;
        this.insideRoom = false;
        this.hasObstacles = false;
        this.hasWall = false;
        this.populated = false;
        this.subsquares = [];
        this.area = 0;

        var xdim = 50, 
            ydim = 50,
            xsubdim = 10, 
            ysubdim = 10, 
            subsquare,
            subsquares = this.subsquares,
            self = paper.rect(x, y, xdim, ydim),
            
            ul = Raphael.isPointInsidePath( path, x,y ),
            ur = Raphael.isPointInsidePath( path, x + xdim, y ), 
            ll = Raphael.isPointInsidePath( path, x, y + ydim ),
            lr = Raphael.isPointInsidePath( path, x+xdim, y+ydim );

        //If whole square is inside
        if (  ul && ur && ll && lr ) {

            self.attr({
                'fill': "cyan",
                'fill-opacity': 0.2
            });
            insideRoom = true;
            this.area = xdim*ydim;
        }
        //If at least one corner is inside   
        else if ( ul || ur || ll || lr) {
            var id = 0;
            for ( var i = 0; i < ydim; i += ysubdim) {
                for (var j = 0; j < xdim; j += xsubdim) {
                    subsquare = new Subsquare(x+j, y+i, path, paper, id++);
                    this.hasWall = true;
                    self.attr({
                        'stroke': "blue"
                    });
                    insideRoom = true;
                    this.subsquares.push(subsquare);
                    if (subsquare.insideRoom)
                        this.area += xsubdim*ysubdim;
                }
            }
        }
        //Whole square outside
        else {
            self.attr({
                'fill': "red",
                'fill-opacity': 0.2
            });
        }
    }


    //Constructor for 0.1m X 0.1m square
    function Subsquare (x, y, path, paper, squarenumber) {
        this.id = squarenumber;
        this.insideRoom = false;
        this.hasObstacles = false;
        this.hasWall = false;
        this.populated = false;

        var xdim = 10,
            ydim = 10,
            ul = Raphael.isPointInsidePath( path, x,y ),
            ur = Raphael.isPointInsidePath( path, x + xdim, y ), 
            ll = Raphael.isPointInsidePath( path, x, y + ydim ),
            lr = Raphael.isPointInsidePath( path, x+xdim, y+ydim ),
            self = paper.rect(x, y, xdim, ydim);

        //Subsquares are either in or out
        if ( ul && ur && ll && lr) {
            self.attr({
                'fill': "green",
                'fill-opacity': 0.2,
                'stroke-width': 0.1
            });
            this.insideRoom = true;
        } 
        else if (ul || ur || ll || lr) {
            self.attr({
                'fill': "blue",
                'fill-opacity': 0.2,
                'stroke-width': 0.1
            });
            this.hasWall = true;
        }
        else {
            self.attr ({
                'fill': "yellow",
                'fill-opacity': 0.2,
                'stroke-width': 0.1
            });
        }
    }


    ResultGrid.prototype.clear = function () {

        //Cleans up arrays
        var squares = this.squares, 
            len = squares.length,
            square,
            arr;
        for (var i = 0; i < len; ++i) {
            square = squares.pop();
            if (square.subsquares.length != 0) {
                arr = square.subsquares;
                for ( var j = 0; j < 25; j++)
                    arr.pop();
            }
        }

        //Removes the drawing
        this.paper.remove();
    }


//End of 
});
