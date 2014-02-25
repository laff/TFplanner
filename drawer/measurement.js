
function Measurement () {
    this.measurements = grid.paper.set();
    this.measurementValues = [];
    this.tmpMeasurements = grid.paper.set();
    this.inverted = null;
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

    var walls = ourRoom.walls,
        finished = ourRoom.finished,
        len = walls.length,
        measurementValues = this.measurementValues;

    measurementValues.length = 0;

    this.measurements.remove();

    if (finished) {
        this.inverted = null;
    }

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
Measurement.prototype.angleMeasurement = function (index, overload) {

    var circleRad = (ourRoom.radius * 2),
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
        
        var walls = ourRoom.walls,
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
                textPoint = this.midPoint(textPoint, p2);

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
 * Function that creates a graphical representation of the walls length
 *
**/

Measurement.prototype.lengthMeasurement = function (wall) {

    var startP1 = wall.attrs.path[0],
        endP1 = wall.getPointAtLength(ourRoom.radius),
        startP2 = wall.attrs.path[1],
        endP2 = wall.getPointAtLength((wall.getTotalLength() - ourRoom.radius)),


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
        angle2;

    if (this.inverted) {
        angle1 = 270;
        angle2 = 90;
    } else {
        angle1 = 90;
        angle2 = 270;
    }



    var transform1 = "r"+angle1+","+startP1[1]+","+startP1[2],
        transformedPath = Raphael.transformPath(m1.attr('path'), transform1);

    this.startLine(transformedPath[1][3], transformedPath[1][4]);


    transform1 = "r"+angle2+","+startP2[1]+","+startP2[2];
    transformedPath = Raphael.transformPath(m2.attr('path'), transform1);

    this.endLine(transformedPath[1][3], transformedPath[1][4]);

    m1.transform("r"+angle1+","+startP1[1]+","+startP1[2]);
    m2.transform("r"+angle2+","+startP2[1]+","+startP2[2]);

    // Adds to measurements set.
    this.measurements.push(m1, m2);

    // return length for our measurementValues array.
    return wall.getTotalLength();
}

Measurement.prototype.startLine = function(x, y) {
    this.startX = x;
    this.startY = y;
}

Measurement.prototype.endLine = function(x, y) {

    var x1 = this.startX,
        y1 = this.startY,

    // Drawing the line paralell to the wall.        
    m = grid.paper.path("M"+x1+","+y1+"L"+x+","+y).attr({
            fill: "#00000", 
            stroke: "#2F4F4F",
            'stroke-width': 1,
            'stroke-linecap': "round"
        }),

    // Functionality that shows length and stuff
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

    this.measurements.push(m, r, t);
}


/**
 * Function that creates a "circle" from point1 to point2.
 * 
 *
**/
Measurement.prototype.sector = function (centerX, centerY, p1, p2, angle, r) {
    var big = (angle >= 180) ? 1 : 0,
        x1 = p1.x, 
        x2 = p2.x, 
        y1 = p1.y,
        y2 = p2.y,
        strokeColor = (angle < ourRoom.minAngle || angle > ourRoom.maxAngle) ? "ff0000" : "2F4F4F";

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
Measurement.prototype.returnConnectingPaths = function (index) {

    var walls = ourRoom.walls,
        prevWall,
        thisWall;

        if (ourRoom.finished) {
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

    return ([x, y]);
}