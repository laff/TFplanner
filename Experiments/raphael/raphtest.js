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
            //this.paper = new Raphael(document.getElementById('canvas_container'));
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
    function Room (width, color, radius, canvas) {
        this.width = width;
        this.color = color;
        this.radius = radius;
        this.startPoint = null;
        this.endPoint = null;
        this.canvas = canvas;
        this.walls = [];
    }

    /**
     * Function that initiates drawing of a room.
    **/
    Room.prototype.initRoom = function () {
        var room = this;

        // Binds action for mousedown.
        $('#canvas_container').mousedown(room, function(e) { 

            room.wallStart(e.offsetX, e.offsetY);

        });

        // Binds action for mouseup.
        $('#canvas_container').mouseup(room, function(e) {

            room.wallEnd(e.offsetX, e.offsetY);

        });

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
            wall;

        this.endPoint = grid.getReal(point);

        wall = new Wall (this.startPoint, this.endPoint);

        this.drawWall(wall);

    }

    /**
     * Function that draws the line.
     *
    **/
    Room.prototype.drawWall = function (line) {

        grid.paper.path("M"+line.startPoint.x+","+line.startPoint.y+"L"+line.endPoint.x+","+line.endPoint.y).attr(
            {
                fill: "#00000", 
                stroke: "#000000"
            });
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

    
    var myRoom = new Room();
    myRoom.initRoom();


});

