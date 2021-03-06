/**
 * @class Displaying different measurements for the room.
 * This include angles, wall-lengths etc.
**/
function Measurement () {
    this.paper = TFplanner.grid.paper;
    this.measurements = this.paper.set();
}

/**
 *  Measurement variables.
**/
Measurement.prototype.inverted = null;
Measurement.prototype.fontsize = null;

/**
 *  array storing temporary angle measurements used while drawing, and the wallid related
**/
Measurement.prototype.tmpAngle = null;
/**
 *  This array stores elements for length measurement. DO REMEMBER TO EMPTY IT BEFORE NEW ROOM, also make it available for toFront() ?!
**/
Measurement.prototype.lengthAid = [];

/**
 *  This array stores the elements showing the angle measurement. have it do the same as the array above regarding toFront().
**/
Measurement.prototype.angleAid = [];
/**
 *  "Deconstructor" for the aids, removing the containing elements of the arrays, and finally pop'ing the arrays.
**/
Measurement.prototype.deconstructAid = function() {

    var i = this.lengthAid.length,
        j = this.angleAid.length;

    while (i--) {
        this.lengthAid[i][1].remove();
        this.lengthAid[i][2].remove();
        this.lengthAid[i][3].remove();
        this.lengthAid[i][4].remove();
        this.lengthAid[i][5].remove();
        this.lengthAid.pop();
    }

    while (j--) {
        this.angleAid[j][1].remove();
        this.angleAid[j][2].remove();
        this.angleAid.pop();
    }
};
    

/**
 *  Function that removes angles and its text visually and inside the array
**/
Measurement.prototype.finalMeasurements = function() {

    var i = this.lengthAid.length,
        angles = (this.angleAid.length > 0);

    while(i--) {
        this.lengthAid[i][1].toFront();
        this.lengthAid[i][2].toFront();
        this.lengthAid[i][3].toFront();
        this.lengthAid[i][4].toFront();
        this.lengthAid[i][5].toFront();

        if (angles) {
            this.angleAid[i][1].remove();
            this.angleAid[i][2].remove();
            this.angleAid.pop();
        }
    }
};

/**
 * Function that renews the measurements visualized.
 * This function should be called each time paths are drawn / changed.
 * Goes through all walls and calls length and angle 
 * functions with appropriate variables.
**/
Measurement.prototype.refreshMeasurements = function() {

    var theRoom = TFplanner.ourRoom,
        walls = theRoom.walls,
        finished = theRoom.finished,
        len = walls.length,
        longestWall = null,
        currentWall,
        fontsize;

    this.measurements.remove();

    this.inverted = null;

    // Calculate text size of the measurements
    this.fontsize = 12;
    
    for (var i = 0; i < len; i++) {
        currentWall = walls[i].getTotalLength();

        if (longestWall != null) {
            if (longestWall <= currentWall) {
                longestWall = currentWall;
            }
        } else {
            longestWall = currentWall;
        }
    }

    fontsize = (longestWall)/100;
    fontsize = (fontsize * 1.4);

    if (fontsize > 12 && fontsize < 14) {
        fontsize = 12;
    }
    if (fontsize >= 14 && fontsize < 16) {
        fontsize = 14;
    }
    if (fontsize >= 16 && fontsize < 18) {
        fontsize = 16;
    } 
    if (fontsize >= 18) {
        fontsize = 18;
    }

    this.fontsize = (fontsize > this.fontsize) ? fontsize : this.fontsize;
    
    for (var i = 0; i < len; i++) {
        
        if (finished || i >= 1) {
            this.angleMeasurement(i);
        }

        this.lengthMeasurement(walls[i]);   
    }      
};

/**
 * Measure the angles between the different walls
 * @param {int} index - Index of a wall, needed to find its neighbours 
 * @param {Path} overload - 
 * @return angle - Angle for our measurementValues array.
**/
Measurement.prototype.angleMeasurement = function(index, overload) {

    var theRoom = TFplanner.ourRoom,
        circleRad = (theRoom.radius * 2),
        angle,
        startAngle, 
        endAngle,
        diffAngle,
        inverted,
        halfCircleP1,
        halfCircleP2,
        halfCircle,
        p1, 
        p2, 
        p3 = [],
        that = this,
        hc,
        // Getting the connectin paths. using this variable in both hasmeasures and angleStep1
        connected = this.returnConnectingPaths(index),
        midPoint = function(point1, point2) {
            var x1 = point1.x,
                x2 = point2[1],
                y1 = point1.y,
                y2 = point2[2],
                x = ((x1 + x2) / 2),
                y = ((y1 + y2) / 2);

            return ({x: x, y: y});
        },
        idFailsafe = function () {
            var wlen;

            if (typeof connected[0] === 'undefined') {

                wlen = theRoom.walls.length;

                return theRoom.walls[wlen - 1].id;
            }

            return connected[0].id;
        },
        wallId = idFailsafe(),
        /**
         *  Function that creates a sector that will represent the angle of a corner.
         *  @param: centerX - center of the sector ("halfcircle")
         *  @param: centerY - center of the sector ("halfcircle")
         *  @param: p1 - outer edges of the sector
         *  @param: p2 - outer edges of the sector
         *  @param: angle
         *  @param: r - radius
        **/
        createSector = function (centerX, centerY, p1, p2, angle, r) {
            var big = (angle >= 180) ? 1 : 0,
                x1 = p1.x, 
                x2 = p2.x, 
                y1 = p1.y,
                y2 = p2.y,
                theRoom = TFplanner.ourRoom,
                strokeColor = ((angle < theRoom.minAngle || angle > theRoom.maxAngle) && !theRoom.finished) ? 'ff0000' : '2F4F4F';

            return TFplanner.grid.paper.path(['M', centerX, centerY, 'L', x1, y1, 'A', r, r, 0, big, 0, x2, y2, 'z']).attr({
                    fill: '#00000', 
                    stroke: strokeColor,
                    'stroke-width': 1,
                    'stroke-linecap': 'round'
                });
        },
        /**
         *  Check if there are measures stored for this wall.
         *  Goes through lengthAid set and looks for an entry with an id value equal to the ('previous') wall id.
        **/
        hasMeasures = function() {
            var i;

            if (overload != null) {

                if (that.tmpAngle != null) {
                    return that.tmpAngle;
                } else {
                    return false;
                }

            } else {
                i = that.angleAid.length;
                while (i--) {
                    if (that.angleAid[i][0] == wallId) {
                        return that.angleAid[i];
                    }
                }
                return false;
            }
        },
        /**
         * Logic that determines the points used for creating the angle measurements.
        **/
        angleStep1 = function() {

            var walls = theRoom.walls,
                index = (walls.length - 1);

            if (overload == null) {

                p1 = connected[0].attrs.path[0];
                p2 = connected[0].attrs.path[1];
                p3 = connected[1].attrs.path[1];  

                // finding the points used for positioning the halfcircle.
                halfCircleP1 = connected[0].getPointAtLength((connected[0].getTotalLength() - circleRad));
                halfCircleP2 = connected[1].getPointAtLength(circleRad);

            } else {

                if (that.tmpMeasurements != null) {
                    that.tmpMeasurements.remove();
                    that.tmpMeasurements.clear();
                }

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
            if (that.inverted == null && overload == null) {
                that.inverted = (angle > 0 && angle < 180);
            }

            inverted = that.inverted; 
        },
        /**
         * Logic for calculating the  real angle
         * @param move - 
        **/
        angleStep2 = function(move) {

            if (inverted) {

                if (angle < 0) {
                    angle = 360 + angle;
                }
            
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
            }

            // Creating a new variable containing only two decimals and the degree char representing the angle in a string.
            var newAngle = angle.toFixed(1) + String.fromCharCode(176);

            /**
             *  real angle calculating done
            **/
            /**
             *  MOVE START!
            **/
            if (move !== false) {

                // Storing the halfcircle and text for readability.
                halfCircle = move[1];
                hc = move[2];
                textPoint = halfCircle.getPointAtLength((halfCircle.getTotalLength()/2));
                textPoint = midPoint(textPoint, p2);


                // move halfCircle
                var pathArray = halfCircle.attr('path'),
                    big = (angle >= 180) ? 1 : 0,
                    strokeColor = ((angle < theRoom.minAngle || angle > theRoom.maxAngle) && !theRoom.finished) ? 'ff0000' : '2F4F4F';

                // center coordinates
                pathArray[0][1] = p2[1];
                pathArray[0][2] = p2[2];

                // circle coordinates (basically where they start/end)
                // incase angle is inverted, swap places for P1 and P2.
                pathArray[1][1] = (inverted) ? halfCircleP1.x : halfCircleP2.x;
                pathArray[1][2] = (inverted) ? halfCircleP1.y : halfCircleP2.y;
                pathArray[2][6] = (inverted) ? halfCircleP2.x : halfCircleP1.x;
                pathArray[2][7] = (inverted) ? halfCircleP2.y : halfCircleP1.y;

                // big variable
                pathArray[2][4] = big;

                // updating the path array and setting the stroke color
                halfCircle.attr({
                    path: pathArray, 
                    stroke: strokeColor
                });
            
                // update hc text and position
                hc.attr({
                    text: newAngle,
                    x: textPoint.x,
                    y: textPoint.y
                });

            /**
             *  MOVE END.
            **/
            /**
             *  CREATE START!
            **/
            } else {

                if (!inverted) {
                    var tmp = halfCircleP2;
                    halfCircleP2 = halfCircleP1;
                    halfCircleP1 = tmp;
                }

                halfCircle = createSector(p2[1], p2[2], halfCircleP1, halfCircleP2, angle, circleRad);

                // only create the angle text if the halfcircle exists.
                if (halfCircle != null) {

                    textPoint = halfCircle.getPointAtLength((halfCircle.getTotalLength()/2));
                    textPoint = midPoint(textPoint, p2);

                    hc = that.paper.text(textPoint.x, textPoint.y, newAngle);
                }
            }
            /**
             *  CREATE END.
            **/
        };

    angleStep1(index);

    var moved = hasMeasures();

    angleStep2(moved);
    
    // either store as temporary measurements or proper ones.
    if (overload != null) {

        if (moved === false) {
            this.tmpAngle = [wallId, halfCircle, hc];
        }

    } else if (moved === false) {
        this.angleAid.push([wallId, halfCircle, hc]);
    }
    return angle;
};


/**
 * Function that creates a graphical representation of the walls length
 * @param {Path} wall -     
 * @return Wall-length for our measurementValues array.
**/
Measurement.prototype.lengthMeasurement = function (wall) {

    var theRoom = TFplanner.ourRoom,
        startP1 = wall.attrs.path[0],
        endP1 = wall.getPointAtLength(theRoom.radius),
        startP2 = wall.attrs.path[1],
        endP2 = wall.getPointAtLength((wall.getTotalLength() - theRoom.radius)),
        paper = this.paper,
        m1,
        m2,
        m3,
        m3r,
        m3t,
        // Coordinates of m3
        m31x,
        m31y,
        m32x,
        m32y,
        angle1,
        angle2,
        fontsize = this.fontsize,
        wallId = wall.id,
        lengthAid = this.lengthAid,
        currentAid = null,
        /**
         *  Check if there are measures stored for this wall.
         *  Goes through lengthAid set and looks for an entry with an id value equals to the current wall id.
         *  @param: id of the wall in question.
        **/
        hasMeasures = function(id) {

            for (var i = 0, ii = lengthAid.length; i < ii; i++) {

                if (lengthAid[i][0] == id) {
                    return lengthAid[i];
                }
            }
            return false;
        },
        /**
         *  Step one is creating or moving the supporting lines m1 and m2.
         *  @param: move boolean that tells to move or create.
        **/
        measuresStep1 = function(move) {

            var pathArray1,
                pathArray2;

            // moving the lines
            if (move !== false) {

                // Getting the lines in question for movement.
                m1 = move[1];
                m2 = move[2];

                pathArray1 = m1.attr('path');
                pathArray2 = m2.attr('path');

                // Changing coordinates of the paths
                pathArray1[0][1] = startP1[1];
                pathArray1[0][2] = startP1[2];
                pathArray1[1][1] = endP1.x;
                pathArray1[1][2] = endP1.y;

                pathArray2[0][1] = startP2[1];
                pathArray2[0][2] = startP2[2];
                pathArray2[1][1] = endP2.x;
                pathArray2[1][2] = endP2.y;

                m1.attr({path: pathArray1});
                m2.attr({path: pathArray2});

            // Creating lines when there is none.
            } else {

                m1 = paper.path('M'+startP1[1]+','+startP1[2]+'L'+endP1.x+','+endP1.y).attr({
                        fill: '#00000', 
                        stroke: '#2F4F4F',
                        'stroke-width': 1,
                        'stroke-linecap': 'round'
                    });

                m2 = paper.path('M'+startP2[1]+','+startP2[2]+'L'+endP2.x+','+endP2.y).attr({
                        fill: '#00000', 
                        stroke: '#2F4F4F',
                        'stroke-width': 1,
                        'stroke-linecap': 'round'
                    });
            }
        },
        /**
         *  Step 2 is creating the third supporting line and adding a text and rect.
         *  If this line, rect and text already exists - only move it.
        **/
        measuresStep2 = function(move) {

                // Creating the length text by converting the wall length to metres and adding a postfix "m".
            var len = (wall.getTotalLength() / 100).toFixed(2)+' m',
                // Calculating the middle of the path by using similar functinality as the middle function of drawRoom.
                textPointx = ((m31x + m32x) / 2),
                textPointy = ((m31y + m32y) / 2),
                rectLen,
                rectHeight, 
                rectY,
                rectX,
                pathArray;

            if (move !== false) {
                // Setting the elements regarding the third supportline, text and rect.
                m3 = move[3];
                m3r = move[4];
                m3t = move[5];

                // Storing path array of m3 supportline
                pathArray = m3.attr('path');

                // Changing coordinates of the path
                pathArray[0][1] = m31x;
                pathArray[0][2] = m31y;
                pathArray[1][1] = m32x;
                pathArray[1][2] = m32y;

                // updating path position
                m3.attr({path: pathArray});

                // updating text position and text.
                m3t.attr({
                    text: len,
                    x: textPointx,
                    y: textPointy
                });
               
                // Dynamic size of the rectangle surrounding the text.
                rectLen = (m3t.getBBox().width + 20);
                rectHeight = (m3t.getBBox().height);
                rectX = (textPointx - (rectLen / 2));
                rectY = (textPointy - (rectHeight / 2));

                // updating rect position
                m3r.attr({
                    x: rectX,
                    y: rectY,
                    width: rectLen,
                    height: rectHeight
                });

            } else {
                // Drawing the line paralell to the wall.        
                m3 = paper.path('M'+m31x+','+m31y+'L'+m32x+','+m32y).attr({
                        fill: '#00000', 
                        stroke: '#2F4F4F',
                        'stroke-width': 1,
                        'stroke-linecap': 'round'
                    });

                // Functionality that shows length and stuff
                // Adds text on top of the rectangle, to display the length of the wall.
                m3t = paper.text(textPointx, textPointy, len).attr({
                    opacity: 1,
                    'font-size': fontsize,
                    'font-family': 'verdana',
                    'font-style': 'oblique'
                });

                // Dynamic size of the rectangle surrounding the text.
                rectLen = (m3t.getBBox().width + 20);
                rectHeight = (m3t.getBBox().height);
                rectX = (textPointx - (rectLen / 2));
                rectY = (textPointy - (rectHeight / 2));

                // Draws a rectangle at the middle of the line
                m3r = paper.rect(rectX, rectY , rectLen, rectHeight, 5, 5).attr({
                    opacity: 1,
                    fill: 'white'
                });

                m3t.toFront();
            }
        };

    // Check if there is measureAids present
    currentAid = hasMeasures(wallId);
    // STEP 1 : creating the supporting lines.
    measuresStep1(currentAid);

    // Determening the angle of which the supporting lines will be transformed.
    if (this.inverted) {
        angle1 = 270;
        angle2 = 90;
    } else {
        angle1 = 90;
        angle2 = 270;
    }

    var transform = 'r'+angle1+','+startP1[1]+','+startP1[2],
        transformedPath = Raphael.transformPath(m1.attr('path'), transform);

    // Storing the starting point of supportline 3
    m31x = transformedPath[1][3];
    m31y = transformedPath[1][4];

    transform = 'r'+angle2+','+startP2[1]+','+startP2[2];
    transformedPath = Raphael.transformPath(m2.attr('path'), transform);

    // failsafe when corners are too close to each other (m2 being too short).
    if (typeof transformedPath[1] == 'undefined') {
        m1.remove();
        m2.remove();
        return wall.getTotalLength();
    }

    // Storing the ending point of supportline 3 and finally having it drawn together with its length
    m32x = transformedPath[1][3];
    m32y = transformedPath[1][4];

    // STEP 2: Calling the function that creates the paralell supportline and length text.
    measuresStep2(currentAid);

    // Transforming the supportlines 1 and 2 visually.
    m1.transform('r'+angle1+','+startP1[1]+','+startP1[2]);
    m2.transform('r'+angle2+','+startP2[1]+','+startP2[2]);

    // Adds to measurements set, but only if it was created (not moved).
    if (currentAid === false) {
        this.lengthAid.push([wallId, m1, m2, m3, m3r, m3t]);
    }

    return wall.getTotalLength();
};


/**
 * Function that finds the connecting walls.
 * @param {int} index - Index of the actual wall.
**/
Measurement.prototype.returnConnectingPaths = function(index) {

    var theRoom = TFplanner.ourRoom,
        walls = theRoom.walls,
        prevWall,
        thisWall;

        if (theRoom.finished) {
            prevWall = walls[index];
            thisWall = (walls[index+1] != null) ? walls[index+1] : walls[0];
        } else {
            prevWall = walls[index-1];
            thisWall = walls[index];
        }

    return [prevWall, thisWall];
};