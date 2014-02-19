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
            width = (canvas.width()).toFixed();    // The width and the height of the svg-element.
            height = (canvas.height()).toFixed();
        
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

        paper.setSize("100%" , "100%");
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
                ourRoom.clearRoom();
                ourRoom = new Room(20);
            }
            //"Unclicks" button
            setTimeout(function(){ pressedButton.remove() }, 300);
        });
    }

    //TODO: This function's a'gonna DIE!
    //Is not currently called anywhere
    Grid.prototype.resultDraw = function() {

        var paper = this.paper,
            size = 5,               
            cutPix = this.cutPix,
            walls = ourRoom.walls,           
            line, 
            width = 0, 
            height = 0,
            numberOfWalls = walls.length,
            minX = 100000,                          //Random large number
            maxX = 0,
            minY = 100000,                          //Random large number
            maxY = 0, 
            xOffset = 0,
            yOffset = 0, 
            viewbox,
            viewset = grid.paper.set();

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

        width = (maxX - minX) + 100;
        height = (maxY - minY) + 100;
        console.log(width);

        xOffset = (minX %50);
        yOffset = (minY %50);

        viewbox = paper.rect(0, 0, width, height);
        viewbox.attr({'fill-opacity': 1.0, 'fill': "yellow"});
        viewset.push(viewbox);


        
        // Draw vertical lines, with 'size' number of pixels between each line.
        for (var i = 1; i <= width; i++) {
            line = paper.path("M"+(i*size+cutPix)+", "+0+", L"+(i*size+cutPix)+", "+(size*height)).attr({'stroke-opacity': 0});   //Path-function is named 'paperproto.path' in raphael.js
            // Make every 10th line stronger.
            if (i % 10 === 0) {
                line.attr({
                    'stroke-opacity': 0.5,
                });
                viewset.push(line);
            }
        }

        // Draw horizontal lines, with 'size' number of pixels between each line.
        for (var i = 1; i <= height; i++) {
           line = paper.path("M"+0+", "+(i*size+cutPix)+", L"+(size*width)+", "+(i*size+cutPix)).attr({'stroke-opacity': 0});
           // Make every 10th line stronger and push to set
           if (i % 10 === 0 ) {
                line.attr( {
                    'stroke-opacity': 0.5
                });
                viewset.push(line);
            }
        }
        var test = $('#canvas_container');
        console.log( test.height());
        //viewbox.scale(test.height(), test.width());
        viewset.hide();


        setTimeout(function(){ viewset.show() }, 500);
        setTimeout(function(){ viewset.transform( "S"+3.0 )}, 750);

        $('#canvas_container').click(viewbox, function (e) {
            var point = crossBrowserXY(e);
            if (viewbox.isPointInside(point.x, point.y))
                console.log("Hey macarena");
        });   
        setTimeout(function(){ viewset.remove() }, 10000);

        //paper.setSize("width" , "height");
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

    Grid.prototype.getRestriction = function(x, y) {
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
        this.crossed = false;
        this.tmpCorners = [];
        this.initRoom();
        this.handle = null;
        this.pathHandle = null;
        this.hoverWall = null;
        this.finished = false;
        this.measurements = grid.paper.set();
        this.tmpMeasurements = grid.paper.set();
        this.inverted = null;
        this.xAligned = false;
        this.yAligned = false;
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
                var diffx = (this.lastdx != null) ? (this.lastdx - dx) : 0,
                    diffy = (this.lastdy != null) ? (this.lastdy - dy) : 0;

                this.lastdx = dx;
                this.lastdy = dy;

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
        console.log(this.yAligned);
        console.log(this.yAligned);
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

        options.refresh();
        room.refreshMeasurements();

        // When the room is finished, we can add handlers to the walls.
        if (room.finished) { 
            room.setHandlers();
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
            length = walls.length;
            //xAligned = this.xAligned,
            //yAligned = this.yAligned;

        if (length > 1) {


            // Logic for the second wall:
            //
            // Checking if it crosses.
            x1 = walls[0].attrs.path[0][1];
            y1 = walls[0].attrs.path[0][2];

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


        // Forcing 90 degree angles
        // 
        // calculate temp length
        tmpLen = vectorLength(p1.x, p1.y, p2.x, p2.y);

        diffX = (p1.x >= p2.x) ? (p1.x - p2.x) : (p2.x - p1.x);
        diffY = (p1.y >= p2.y) ? (p1.y - p2.y) : (p2.y - p1.y);

        if (!this.proximity) {
            // Checking if x value is in range
            if (diffX < (tmpLen * tmpMultiplier)) {

                p2.x = p1.x;
                this.xAligned = true;
                console.log("X aligned");

            // Checking if y value is in range.
            } else if (diffY < (tmpLen * tmpMultiplier)) {

                p2.y = p1.y;
                this.yAligned = true;
                console.log("Y aligned");

            // set both alignements to false.
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

        this.crossed = crossed;


        // show temporary Angle

        if (length >= 1 && this.tmpWall.getTotalLength() > (this.radius * 2)) {

            this.angleMeasurement(null, this.tmpWall);

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
            len = walls.length;

        this.measurements.remove();

        for (var i = 0; i < len; i++) {

            if (finished) {
                this.angleMeasurement(i);
            } else if (i >= 1) {
                this.angleMeasurement(i);
            }

        this.lengthMeasurement(walls[i]);
            
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
            y2 = p2.y;

        return grid.paper.path(["M", centerX, centerY, "L", x1, y1, "A", r, r, 0, big, 0, x2, y2, "z"]).attr(            
            {
                fill: "#00000", 
                stroke: "#2F4F4F",
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
            bm1,
            bm2,
            m3p1x,
            m3p1y,
            m3p2x,
            mep2y,
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

        m1.transform("r"+angle1+","+startP1[1]+","+startP1[2]);
        m2.transform("r"+angle2+","+startP2[1]+","+startP2[2]);

        bm1 = m1.getBBox();
        bm2 = m2.getBBox();

        // Check what BBox value to use!
        //
        // Checking for the x value for point1 of our new  measurement line.
        if (bm1.x == startP1[1]) {
            m3p1x = bm1.x2;
        } else if (bm1.x2 == startP1[1]) {
            m3p1x = bm1.x;
        } 
        // checking for the y.
        if (bm1.y == startP1[2]) {
            m3p1y = bm1.y2;
        } else if (bm1.y2 == startP1[2]) {
            m3p1y = bm1.y;
        }
        // Checking for the x value for point2 of our new  measurement line.
        if (bm1.x == startP1[1]) {
            m3p2x = bm2.x2;
        } else if (bm1.x2 == startP1[1]) {
            m3p2x = bm2.x;
        } 
        // checking for the y.
        if (bm1.y == startP1[2]) {
            m3p2y = bm2.y2;
        } else if (bm1.y2 == startP1[2]) {
            m3p2y = bm2.y;
        }

        
        // Drawing the line paralell to the wall.        
        m3 = grid.paper.path("M"+m3p1x+","+m3p1y+"L"+m3p2x+","+m3p2y).attr({
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

        // Adds to measurements set.
        this.measurements.push(m1, m2, m3, t, r);
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
        this.refreshMeasurements();
        options.refresh();

        ourRoom.finished = false;
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

        point = grid.getRestriction(e.offsetX, e.offsetY);

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
    }

    //Draws 
    ResultGrid.prototype.draw = function() {
        var canvas = $('#canvas_container');
    }

    ResultGrid.prototype.getWalls = function () {

        var walls;

    }

});



