/**
 * Holds handlers and functionality needed for a finished room
**/

function Room (radius, grid) {
        this.radius = radius;
        this.lastPoint = null;
        this.walls = grid.paper.set();
        this.tmpCircle = null;
        this.initRoom();
        this.handle = null;
        this.pathHandle = null;
        this.finished = false;
        this.measurements = grid.paper.set();
        this.measurementValues = [];
        this.grid = grid;
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

    //Function removes the currently drawn room
    Room.prototype.clearRoom = function() {
        var walls = this.walls, 
            len = walls.length;

        //Empties arrays
        for (var i = len-1; i >= 0; --i)
        {
            walls[i].remove();
        }
        walls.clear();

        this.lastPoint = null;
        this.proximity = false;

        this.refreshMeasurements();
        ourRoom.options.refresh();

        ourRoom.finished = false;
    }


    /**
     * Function to be used for 'pre-defined' rooms. All drawing will be done 'clockwise', and
     * will follow the angle-axis predefined. (180 is straight to the right, 270 is downwards etc.)
     * @param ang - Array with predefined angles and wall-lengths for the chosen room-shape.
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

    Room.prototype.getZoomedXY = function(x, y) {
        var paper = this.grid.paper,
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