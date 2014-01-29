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
            if (i % 10 === 0) {
                line.attr( {
                    'stroke-opacity': 0.5
                });
            }
        }

        // Draw horizontal lines, with 'size' number of pixels between each line.
        for (var i = 1; i <= height; i++) {
           line = paper.path("M"+0+", "+(i*size+cutPix)+", L"+(size*width)+", "+(i*size+cutPix)).attr({'stroke-opacity': 0.3});
           // Make every 10th line a bit stronger.
           if (i % 10 === 0) {
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
        this.startPoint = null;
        this.walls = [];
        this.tmpWall = null;
    }

    Room.prototype.plus = 5;

    /**
     * Function that initiates drawing of a room.
    **/
    Room.prototype.initRoom = function () {
        var room = this;

        // Binds action for mousedown.
        $('#canvas_container').mousedown(room, function(e) {

            var x = e.offsetX,
                y = e.offsetY,
                func = (this.startPoint == null) ? room.wallStart(x, y) : room.wallEnd(x, y);

        });

        // Binds action for mouseup.
        /*
        $('#canvas_container').mouseup(room, function(e) {

            room.wallEnd(e.offsetX, e.offsetY);

        });
        */
        $('#canvas_container').mousemove(room, function(e) {

            if (room.startPoint != null) {
                var x = e.offsetX,
                    y = e.offsetY,
                    point1 = grid.getLatticePoint(x, y);

                    point2 = grid.getReal(point1);

                if (room.startPoint != point2) {
                    room.drawTempLine(point2);
                }

            }

        });
    }

    /**
     * Function that unbinds mouse actions related to creating a room.
    **/
    Room.prototype.finishRoom = function () {

        $('#canvas_container').unbind('mousedown');

        $('#canvas_container').unbind('mouseup');

        $('#canvas_container').unbind('mousemove');
    }

    /**
     * Function handling logic for the first point of a wall.
     * 
    **/
    Room.prototype.wallStart = function (x, y) {
        var point = grid.getLatticePoint(x, y);

        this.startPoint = grid.getReal(point);
    }

    /**
     * Function handling logic for the first point of a wall.
     * 
    **/
    Room.prototype.wallEnd = function (x, y) {
        var point = grid.getLatticePoint(x, y),
            point1 = this.startPoint,
            point2,
            wall,
            walls = this.walls;
        
        point2 = grid.getReal(point);

        // Creates the new wall.
        wall = new Wall (point1, point2);

        // Stores the wall.
        walls.push(wall);

        // Check if the ending point of this wall is near the starting point of the first wall.
        //
        //
        //
        
        if (this.roomEndRad(point2)) {
            walls.pop();
            wall = new Wall (point1, walls[0].startPoint);
            walls.push(wall);
            this.finishRoom();
        }

        //
        this.startPoint = point2;

        // Draws the wall.
        this.drawWall(wall);

    }

    /** 
     * Function that checks if the ending point is in the vincinity of the initial point.
     * returns false if the point is not, and true if it is.
    **/
    Room.prototype.roomEndRad = function (point) {
        var initPointX = this.walls[0].startPoint.x,
            initPointY = this.walls[0].startPoint.y,
            endPointX = point.x,
            endPointY = point.y,
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
     * Function that draws the line.
     *
    **/
    Room.prototype.drawWall = function (line) {

        var tmpWall = this.tmpWall;

        if (tmpWall != null) {
            tmpWall.remove();
        }

        grid.paper.path("M"+line.startPoint.x+","+line.startPoint.y+"L"+line.endPoint.x+","+line.endPoint.y).attr(
            {
                fill: "#00000", 
                stroke: "#000000",
                'stroke-width': 1
            });
    }

    Room.prototype.drawPlus = function(point){
          point = grid.getReal(point);
    
          x = point.x + 0.5;
          y = point.y + 0.5;

        grid.paper.path("M"+x+","+(y-this.plus)+"L"+x+","+(y+this.plus));


        grid.paper.path("M"+(x-this.plus)+","+y+"L"+(x+this.plus)+","+y);

    }


    Room.prototype.drawTempLine = function(point){
      //this.drawPlus(this.firstPoint);
        var p2 = point,
            p1 = this.startPoint,
            tmpWall = this.tmpWall;


        if (tmpWall != null) {
            tmpWall.remove();
        }

        this.tmpWall = grid.paper.path("M"+p1.x+","+p1.y+"L"+p2.x+","+p2.y);

    }





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

    
    var myRoom = new Room(20);
    myRoom.initRoom();


});

