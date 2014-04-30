
function Measurement () {
    this.paper = TFplanner.grid.paper;
    this.measurements = this.paper.set();
    this.tmpMeasurements = this.paper.set();
    this.wallText = this.paper.set();
}

/**
 *  Measurement variables.
**/
Measurement.prototype.inverted = null;
Measurement.prototype.fontsize = null;
/**
 *  This array stores elements for length measurement. DO REMEMBER TO EMPTY IT BEFORE NEW ROOM, also make it available for toFront() ?!
**/
Measurement.prototype.lengthAid = [];

/**
 *  This array stores the elements showing the angle measurement. have it do the same as the array above regarding toFront().
**/
Measurement.prototype.angleAid = [];
/**
 *  "Deconstructor" for the lengthAid array, removing all the Raphael elements / entries.
**/
Measurement.prototype.deconstructLengthAid = function () {

    var i = this.lengthAid.length;
    while (i--) {

        this.lengthAid[i][1].remove();
        this.lengthAid[i][2].remove();

        this.lengthAid.pop();
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
Measurement.prototype.refreshMeasurements = function () {

    var theRoom = TFplanner.ourRoom,
        walls = theRoom.walls,
        finished = theRoom.finished,
        len = walls.length,
        longestWall = null,
        fontsize;

    this.measurements.remove();
    this.wallText.remove();
    this.wallText.clear();

    this.inverted = null;

    // Calculate text size of the measurements
    this.fontsize = 12;
    
    for (var i = 0; i < len; i++) {
        var currentWall = walls[i].getTotalLength();

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
            // Commented out for testing purposes.
            this.angleMeasurement(i);
        }

        this.lengthMeasurement(walls[i]);   
    }      
}


/**
 *
 *
**/
Measurement.prototype.angleMeasurement = function (index, overload) {

    var theRoom = TFplanner.ourRoom,
        circleRad = (theRoom.radius * 2),
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
        p3 = [],
        angleAid = this.angleAid,
        // making "this" available for the internal functions.
        that = this,
        hc,
        // Getting the connectin paths. using this variable in both hasmeasures and angleStep1
        connected = this.returnConnectingPaths(index),
        wallId = connected[0].id,
        createSector = function (centerX, centerY, p1, p2, angle, r) {
            var big = (angle >= 180) ? 1 : 0,
                x1 = p1.x, 
                x2 = p2.x, 
                y1 = p1.y,
                y2 = p2.y,
                theRoom = TFplanner.ourRoom,
                strokeColor = ((angle < theRoom.minAngle || angle > theRoom.maxAngle) && !theRoom.finished) ? "ff0000" : "2F4F4F";

            return TFplanner.grid.paper.path(["M", centerX, centerY, "L", x1, y1, "A", r, r, 0, big, 0, x2, y2, "z"]).attr(            
                {
                    fill: "#00000", 
                    stroke: strokeColor,
                    'stroke-width': 1,
                    'stroke-linecap': "round"
                });
        },
        /**
         *  Check if there are measures stored for this wall.
         *  Goes through lengthAid set and looks for an entry with an id value equal to the ('previous') wall id.
        **/
        hasMeasures = function() {

            for (var i = 0, ii = angleAid.length; i < ii; i++) {

                if (angleAid[i][0] == wallId) {
                    return angleAid[i];
                }
            }
            return false;
        },
        angleStep1 = function(index) {
            /** Logic that determines the points used for creating the angle measurements.
             *
             *  START!
            **/
            if (overload == null) {

                p1 = connected[0].attrs.path[0];
                p2 = connected[0].attrs.path[1];
                p3 = connected[1].attrs.path[1];  

                // finding the points used for positioning the halfcircle.
                halfCircleP1 = connected[0].getPointAtLength((connected[0].getTotalLength() - circleRad));
                halfCircleP2 = connected[1].getPointAtLength(circleRad);

            } else {

                if (that.tmpMeasurements !=  null) {
                    that.tmpMeasurements.remove();
                    that.tmpMeasurements.clear();
                }
                
                var walls = theRoom.walls,
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
            if (that.inverted == null && overload == null) {
                that.inverted = (angle > 0 && angle < 180);
            }
            inverted = that.inverted; 
            /** Logic that determines the points used for creating the angle measurements.
             *
             *  END.
            **/
        },
        angleStep2 = function(move) {

            /**
             *  Logic for calculating the  real angle
            **/
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
            if (move != false) {
                    
                // Storing the halfcircle and text for readability.
                halfCircle = move[1];
                hc = move[2];
                textPoint = halfCircle.getPointAtLength((halfCircle.getTotalLength()/2));
                textPoint = that.midPoint(textPoint, p2);


                // move halfCircle
                var pathArray = halfCircle.attr('path'),
                    big = (angle >= 180) ? 1 : 0,
                    strokeColor = ((angle < theRoom.minAngle || angle > theRoom.maxAngle) && !theRoom.finished) ? "ff0000" : "2F4F4F";

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
                    textPoint = that.midPoint(textPoint, p2);

                    hc = that.paper.text(textPoint.x, textPoint.y, newAngle);
                }

            }
            /**
             *  CREATE END.
            **/
        };

    angleStep1(index);

    angleStep2(hasMeasures());

    

    if (overload != null) {
        this.tmpMeasurements.push(halfCircle, hc);
    } else {
        this.angleAid.push([wallId, halfCircle, hc]);
    }

    // return angle for our measurementValues array.
    return angle;
}


/**
 * Function that creates a graphical representation of the walls length
 *
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
        measuresStep1 = function (move) {

            // moving the lines
            if (move != false) {

                // Getting the lines in question for movement.
                m1 = move[1];
                m2 = move[2];

                //console.log('moving supportline 1 and 2');


                var pathArray1 = m1.attr('path'),
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

               // console.log('creating supportline 1 and 2');

                    m1 = paper.path("M"+startP1[1]+","+startP1[2]+"L"+endP1.x+","+endP1.y).attr(
                        {
                            fill: "#00000", 
                            stroke: "#2F4F4F",
                            'stroke-width': 1,
                            'stroke-linecap': "round"
                        });

                    m2 = paper.path("M"+startP2[1]+","+startP2[2]+"L"+endP2.x+","+endP2.y).attr(
                        {
                            fill: "#00000", 
                            stroke: "#2F4F4F",
                            'stroke-width': 1,
                            'stroke-linecap': "round"
                        });
            }
        },
        /**
         *  Step 2 is creating the third supporting line and adding a text and rect.
         *  If this line, rect and text already exists - only move it.
        **/
        measuresStep2 = function (move) {

                // Creating the length text by converting the wall length to metres and adding a postfix "m".
            var len = (wall.getTotalLength() / 100).toFixed(2)+ " m",
                // Calculating the middle of the path by using similar functinality as the middle function of drawRoom.
                textPointx = ((m31x + m32x) / 2),
                textPointy = ((m31y + m32y) / 2),
                rectLen,
                rectHeight, 
                rectY,
                rectX;

            if (move != false) {

                // Setting the elements regarding the third supportline, text and rect.
                m3 = move[3];
                m3r = move[4];
                m3t = move[5];

                // Storing path array of m3 supportline
                var pathArray = m3.attr('path');

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

                //console.log('creating supportline 3');

                // Drawing the line paralell to the wall.        
                m3 = paper.path("M"+m31x+","+m31y+"L"+m32x+","+m32y).attr({
                        fill: "#00000", 
                        stroke: "#2F4F4F",
                        'stroke-width': 1,
                        'stroke-linecap': "round"
                    });

                // Functionality that shows length and stuff


                // Adds text on top of the rectangle, to display the length of the wall.
                m3t = paper.text(textPointx, textPointy, len).attr({
                    opacity: 1,
                    'font-size': fontsize,
                    'font-family': "verdana",
                    'font-style': "oblique"
                });

                // Dynamic size of the rectangle surrounding the text.
                rectLen = (m3t.getBBox().width + 20);
                rectHeight = (m3t.getBBox().height);
                rectX = (textPointx - (rectLen / 2));
                rectY = (textPointy - (rectHeight / 2));

                // Draws a rectangle at the middle of the line
                m3r = paper.rect(rectX, rectY , rectLen, rectHeight, 5, 5).attr({
                    opacity: 1,
                    fill: "white"
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

    var transform = "r"+angle1+","+startP1[1]+","+startP1[2],
        transformedPath = Raphael.transformPath(m1.attr('path'), transform);

    // Storing the starting point of supportline 3
    m31x = transformedPath[1][3];
    m31y = transformedPath[1][4];

    //this.startLine(transformedPath[1][3], transformedPath[1][4]);

    transform = "r"+angle2+","+startP2[1]+","+startP2[2];
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
    // STEP 2
    measuresStep2(currentAid);

    // Transforming the supportlines 1 and 2 visually.
    m1.transform("r"+angle1+","+startP1[1]+","+startP1[2]);
    m2.transform("r"+angle2+","+startP2[1]+","+startP2[2]);

    // Adds to measurements set.
    this.lengthAid.push([wallId, m1, m2, m3, m3r, m3t]);

    // return length for our measurementValues array.
    return wall.getTotalLength();
}


/**
 *  Function that updates the text that displays length of wall - does not move the measurement graphics.
 *
 * Goes through the wall and lengthmeasurement arrays with corresponding keys.
**/
Measurement.prototype.refreshLength = function() {

    var walls = TFplanner.ourRoom.walls;

        for (var i = 0, ii = walls.length; i < ii; i++) {

            var length = (walls[i].getTotalLength() / 100).toFixed(2)+' m',
                j = (i == 0) ? 0 : (i * 2),
                k = (j + 1);

            this.wallText[k].attr({
                text: length
            });

        }
}


/**
 * Function that gets the connecting walls.
 *
**/
Measurement.prototype.returnConnectingPaths = function (index) {

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
}

/**
 * midpoint formula
**/
Measurement.prototype.midPoint = function(p1, p2) {
    var x1 = p1.x,
        x2 = p2[1],
        y1 = p1.y,
        y2 = p2[2],
        x = ( (x1 + x2) / 2),
        y = ( (y1 + y2) / 2);

    return ({x: x, y: y});
}