/**
 * Class that creates our grid, and adds some of the basic-functionality to it (zoom etc.)
**/
function Grid() {
    this.size = 5;               // How many pixels between each horizontal/vertical line.
    this.cutPix = 0.5;           // Used so that the drawing of a line not overlaps on the previous pixel.
    this.paper = Raphael(document.getElementById('canvas_container'));
    this.draw();
    this.scale();
    this.zoom();
    this.viewBoxWidth = this.paper.width;
    this.viewBoxHeight = this.paper.height;
}

Grid.prototype.draw = function() {

    var paper = this.paper,
        canvas = $('#canvas_container'),
        size = this.size,               
        cutPix = this.cutPix,           
        line,                                   // Saves the path to a variable during construction.
        width = (canvas.width()).toFixed(),     // The width and the height of the svg-element.
        height = (canvas.height()).toFixed();

    paper.setViewBox(0, 0, paper.width, paper.height); 
    

    // Draw vertical lines on the screen (lines are drawn so that the screen is filled even on min. zoom)
    for (var i = 0; i <= width; i+=10) {

         //Path-function is named 'paperproto.path' in raphael.js           
        line = paper.path("M"+(i*size+cutPix)+", "+0+", L"+(i*size+cutPix)+", "+(size*height)).attr({'stroke-opacity': 0.4});  
    }

    // Draw horizontal lines on the screen (lines are drawn so that the screen is filled even on min. zoom)
    for (var i = 0; i <= height; i+=10) {

        line = paper.path("M"+0+", "+(i*size+cutPix)+", L"+(size*width)+", "+(i*size+cutPix)).attr({'stroke-opacity': 0.4});
    }
}

/**
 *  Function that visualizes the scale of our grid. 
 *
**/
Grid.prototype.scale = function() {
    var paper = this.paper,
        box = paper.rect(1, 1, 99, 99).attr({'stroke-opacity': 1, 'stroke': "#E73029", 'stroke-width': 3, 'fill': "white", 'fill-opacity': 0.7}),
        strokeAttr = {
            'stroke-opacity': 1, 
            'stroke': "#E73029", 
            'stroke-width': 3, 
            "arrow-start": "classic-midium-midium",
            "arrow-end": "classic-midium-midium"
        },
        arrowNW = paper.path("M"+0+", " +50+", L"+25+", "+50+"M"+50+", " +25+", L"+50+", "+0).attr(strokeAttr),
        arrowSE = paper.path("M"+50+", " +100+", L"+50+", "+75+"M"+75+", " +50+", L"+100+", "+50).attr(strokeAttr),
        t = paper.text(50, 50, "100 cm");
}

//X and Y values for upper left corner of box
/*
Grid.prototype.menuBox = function (x, y) {
    var paper = this.paper,
        clearButton = paper.image("Graphics/clear_unpressed.png", x+115, y+10, 70, 30);
        

    //Event handler for clear button
    clearButton.mousedown(function(e) {
        //Loads image of pressed button
        var pressedButton = paper.image("Graphics/clear_pressed.png", x+115, y+10, 70, 30);
        if (ourRoom.finished == true) {
            paper.clear();
            var resultGrid = new ResultGrid();
           ourRoom.clearRoom();
            
            setTimeout(function(){
                ourRoom = new DrawRoom(20);
                resultGrid.clear();
                grid.draw();
                grid.menuBox(0,0);
            }, 50000);
            
        }
        //"Unclicks" button
        setTimeout(function(){ pressedButton.remove() }, 300);
    });

}
*/

/**
 * Makes sure that the user can`t draw in the left corner, where the 'scale' is.
**/
Grid.prototype.getRestriction = function(xy) {

    var x = xy[0],
        y = xy[1];

    return (!(x < 100 && y < 100)) ? new Point(x, y) : new Point(-1, -1);
}


/**
 *  Zoom functionality, 
 *
 * Sauce: http://jsfiddle.net/9zu4U/147/
**/
Grid.prototype.zoom = function() {

    var paper = this.paper,
        canvasID = "#canvas_container",

       // viewBoxWidth = paper.width,
       // viewBoxHeight = paper.height,
        
        startX,
        startY,
        mousedown = false,
        dX,
        dY,
        oX = 0,
        oY = 0,
       // oWidth = viewBoxWidth,
       // oHeight = viewBoxHeight,

        // View box
        viewBox = paper.setViewBox(oX, oY, paper.width, paper.height);


    /** 
     * This is high-level function.
     * It must react to delta being more/less than zero.
     *
    function handle(delta) {
        
        var vB = paper._viewBox,
            vX,
            vY;

        if (delta > 0) {
            viewBoxWidth *= 0.95;
            viewBoxHeight*= 0.95;

        } else {
            viewBoxWidth *= 1.05;
            viewBoxHeight *= 1.05;
        }

        // This will zoom into middle of the screen.
        vX = (vB[0] - ((viewBoxWidth - vB[2]) / 2));
        vY = (vB[1] - ((viewBoxHeight - vB[3]) / 2));


        paper.setViewBox(vX, vY, viewBoxWidth, viewBoxHeight);
    }
    */

    /** 
     * Event handler for mouse wheel event.
     */
    function wheel(event) {
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
            grid.handle(delta);
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


    // Pan functionality bound to arrow keys.
    document.onkeydown = function(e) {

        grid.pan(e.keyCode);
    };
}


/** 
     * This is the function that actually handles the zooming
     * It must react to delta being more/less than zero.
     */
Grid.prototype.handle = function(delta) {
        
    var paper = this.paper,
        vB = paper._viewBox,
        viewBoxWidth = this.viewBoxWidth,
        viewBoxHeight = this.viewBoxHeight,
        vX,
        vY;

    if (delta > 0) {
        this.viewBoxWidth *= 0.95;
        this.viewBoxHeight*= 0.95;

    } else {
        this.viewBoxWidth *= 1.05;
        this.viewBoxHeight *= 1.05;
    }

    // This will zoom into middle of the screen.
    vX = (vB[0] - ((viewBoxWidth - vB[2]) / 2));
    vY = (vB[1] - ((viewBoxHeight - vB[3]) / 2));


    paper.setViewBox(vX, vY, viewBoxWidth, viewBoxHeight);
}


//Function pans grid (left, right, up, down) on the screen

Grid.prototype.pan = function(keyCode) {
    var ticks = 50,
        paper = this.paper,
        vB = paper._viewBox;

    switch (keyCode) {
        // Left
        case 37:
            if (vB[0] > 0)
                paper.setViewBox(vB[0] - ticks, vB[1], vB[2], vB[3]);
            break;
        // Up
        case 38:
            if (vB[1] > 0)
            paper.setViewBox(vB[0], vB[1] - ticks, vB[2], vB[3]);
            break;
        // Right
        case 39:
            paper.setViewBox(vB[0] + ticks, vB[1], vB[2], vB[3]);
            break;

        // Down
        case 40:
            paper.setViewBox(vB[0], vB[1] + ticks, vB[2], vB[3]);
            break;
    }
}


Grid.prototype.getZoomedXY = function(x, y) {
    var paper = grid.paper,

        // Starting height and width
        sH = paper._viewBox[2],
        sW = paper._viewBox[3],

        // Original height and width
        oH = paper.width,
        oW = paper.height,

        // Viewbox X and Y.
        vX = paper._viewBox[0],
        vY = paper._viewBox[1],

        // Calculated ratio.
        ratio;

    if (sH != oH && sW != oW) {

        ratio = (sH / oH).toFixed(5);

        x *= ratio;
        y *= ratio;
    }

    x += vX;
    y += vY;

    return [x, y];
}

Grid.prototype.moveRoom = function () {

    var minX = 1000000, 
        maxX = 0, 
        minY = 1000000, 
        maxY = 0, 
        walls = ourRoom.walls,
        offsetX,
        offsetY,
        xstart,
        ystart,
        paper = grid.paper,
        numberOfWalls = walls.length,
        path;

    for (var i = 0; i < numberOfWalls; ++i) {
        //Find largest and smallest X value
        if ((walls[i].attrs.path[0][1]) > maxX)
            maxX = walls[i].attrs.path[0][1];
        if ((walls[i].attrs.path[1][1]) > maxX)
            maxX = walls[i].attrs.path[1][1];
        if ((walls[i].attrs.path[0][1]) < minX)
            minX = walls[i].attrs.path[0][1];
        if ((walls[i].attrs.path[1][1]) < minX)
            minX = walls[i].attrs.path[1][1];

        //Find smallest and largest Y value
        if ((walls[i].attrs.path[0][2]) > maxY)
            maxY = walls[i].attrs.path[0][2];
        if ((walls[i].attrs.path[1][2]) > maxY)
            maxY = walls[i].attrs.path[1][2];
        if ((walls[i].attrs.path[0][2]) < minY)
            minY = walls[i].attrs.path[0][2];
        if ((walls[i].attrs.path[1][2]) < minY)
            minY = walls[i].attrs.path[1][2];
    } 

    offsetX = minX - 99;
    offsetY = minY - 99;
    xstart = (walls[0].attrs.path[0][1] - offsetX);
    ystart = (walls[0].attrs.path[0][2] - offsetY);
    
    // Move all the walls to new coordinates    
    for (var i = 0; i < numberOfWalls; ++i) {
        path = walls[i].attr("path");

        path[0][1] = (walls[i].attrs.path[0][1] - offsetX); 
        path[0][2] = (walls[i].attrs.path[0][2] - offsetY);

        path[1][1] = (walls[i].attrs.path[1][1] - offsetX); 
        path[1][2] = (walls[i].attrs.path[1][2] - offsetY); 

        walls[i].attr({path: path});
    }
}

/**
 * Function to save our svg-drawing as a .png file.
 * Using libraries published at 'https://code.google.com/p/canvg/' under MIT-license.
**/
Grid.prototype.save = function () {
    var paper = this.paper,
        svg = paper.toSVG();

    //Use canvg-package to draw on a 'not-shown' canvas-element.
    canvg(document.getElementById('myCanvas'), svg);

    // Used so we are sure that the canvas is fully loaded before .png is generated.
    setTimeout(function() {
        // Fetch the dataURL from the 'myCanvas', then force a download of the picture, with a defined filename.
        var dataURL = document.getElementById('myCanvas').toDataURL("image/png"),
            a = document.createElement('a');
            a.href = dataURL;
            a.download = 'room.png';
            a.click();
    }, 100);
}
