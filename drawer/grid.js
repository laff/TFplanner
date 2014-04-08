/**
 * Class that creates our grid, and adds some of the basic-functionality to it (zoom etc.)
**/
function Grid() {
    this.size = 5;               // How many pixels between each horizontal/vertical line.
    this.cutPix = 0.5;           // Used so that the drawing of a line not overlaps on the previous pixel.
    this.paper = Raphael(document.getElementById('canvas_container'));
    this.boxSet = this.paper.set();
    this.gridSet = this.paper.set();
    this.draw();
    this.scale();
    this.zoom();
    this.viewBoxWidth = this.paper.width;
    this.viewBoxHeight = this.paper.height;
    this.resWidth = 0;
    this.resHeight = 0;
    this.rat = 1.0;             // Used for scaling up the visualized wall-lengths.
}

Grid.prototype.draw = function() {

    var paper = this.paper,
        canvas = $('#canvas_container'),
        size = this.size,               
        cutPix = this.cutPix,           
        line,                                   // Saves the path to a variable during construction.
        width = (canvas.width()).toFixed(),     // The width and the height of the svg-element.
        height = (canvas.height()).toFixed(),
        gridSet = this.gridSet;

    paper.setViewBox(0, 0, paper.width, paper.height); 
    

    // Draw vertical lines on the screen (lines are drawn so that the screen is filled even on min. zoom)
    for (var i = 0; i <= width; i+=10) {
    
        line = paper.path("M"+(i*size+cutPix)+", "+0+", L"+(i*size+cutPix)+", "+(size*height)).attr({'stroke-opacity': 0.4});  
        gridSet.push(line);
    }

    // Draw horizontal lines on the screen (lines are drawn so that the screen is filled even on min. zoom)
    for (var i = 0; i <= height; i+=10) {

        line = paper.path("M"+0+", "+(i*size+cutPix)+", L"+(size*width)+", "+(i*size+cutPix)).attr({'stroke-opacity': 0.4});
        gridSet.push(line);
    }
}

/**
 * Function that visualizes the scale of our grid. 
 * Also adds the components to a set, to have easier access to them.
**/
Grid.prototype.scale = function() {
    var paper = this.paper,
        box = paper.rect(1, 1, 99, 99).attr({
            'stroke-opacity': 1, 
            'stroke': "#CB2C30", 
            'stroke-width': 3, 
            'fill': "white", 
            'fill-opacity': 0.7}),
        strokeAttr = {
            'stroke-opacity': 1, 
            'stroke': "#CB2C30", 
            'stroke-width': 3, 
            "arrow-start": "classic-midium-midium",
            "arrow-end": "classic-midium-midium"
        },
        arrowNW = paper.path("M"+0+", " +50+", L"+25+", "+50+"M"+50+", " +25+", L"+50+", "+0).attr(strokeAttr),
        arrowSE = paper.path("M"+50+", " +100+", L"+50+", "+75+"M"+75+", " +50+", L"+100+", "+50).attr(strokeAttr),
        tRect = paper.rect(30, 40, 40, 20, 5, 5).attr({
            'stroke-width': 0,
            opacity: 1,
            fill: 'white'
        }),
        t = paper.text(50, 50, "100 cm");

    this.boxSet.push(box, arrowNW, arrowSE, tRect, t);
}

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
            grid.handle(delta, event);

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
Grid.prototype.handle = function(delta, event) {
        
    var paper = this.paper,
        vB = paper._viewBox,
        viewBoxWidth = this.viewBoxWidth,
        viewBoxHeight = this.viewBoxHeight,
        orgX = vB[0],
        orgY = vB[1],
        zoom = false;

    if (delta > 0) {
        this.viewBoxWidth *= 0.95;
        this.viewBoxHeight*= 0.95;
        zoom = true;

    } else {
        this.viewBoxWidth *= 1.05;
        this.viewBoxHeight *= 1.05;
    }

    paper.setViewBox(orgX, orgY, viewBoxWidth, viewBoxHeight);
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


Grid.prototype.getZoomedXY = function(x, y, not) {

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

        ratio = (sH / oH);

        x *= ratio;
        y *= ratio;

    }

    if (!not) {
        x += vX;
        y += vY;
    }



    return [x, y];
}

/**
 * Function used to move the room to coordinates (99,99). This happends when the 'obstacles'-tab is clicked.
 * The paths of each wall is update, also a string is created, so that the room can be redrawn later as
 * ONE path.
**/
Grid.prototype.moveRoom = function () {

    var minX = 1000000, 
        maxX = 0, 
        minY = 1000000, 
        maxY = 0, 
        walls = ourRoom.walls,
        numberOfWalls = walls.length,
        offsetX,
        offsetY,
        xstart,
        ystart,
        tempString,
        pathString,
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

    offsetX = minX - 99.5;
    offsetY = minY - 99.5;
    this.resWidth = (maxX - minX);
    this.resHeight = (maxY - minY);
    xstart = (walls[0].attrs.path[0][1] - offsetX);
    ystart = (walls[0].attrs.path[0][2] - offsetY);

    pathString = new String("M " + xstart + ", " + ystart);
    
    // Move all the walls to new coordinates (this updates the paths of the real walls)    
    for (var i = 0; i < numberOfWalls; ++i) {
        path = walls[i].attr("path");

        path[0][1] = (walls[i].attrs.path[0][1] - offsetX); 
        path[0][2] = (walls[i].attrs.path[0][2] - offsetY);

        path[1][1] = (walls[i].attrs.path[1][1] - offsetX); 
        path[1][2] = (walls[i].attrs.path[1][2] - offsetY); 

        walls[i].attr({path: path});

        tempString = " L" + path[0][1] + ", " + path[0][2];
        pathString += tempString;
    }

    //Refresh the measurement-stuff after moving the walls, then hide the angles and remove handlers.
    measurement.refreshMeasurements();
    measurement.angMeasurements.hide();
    finishedRoom.removeHandlers();

    tempString = " Z";
    pathString += tempString;
    // Returns the path of our room as ONE string.
    return pathString;
}

/**
 *  sets up the paper for svg convertion, converts and returns svg.
 *  adding 201 which represents the 1 meter offset + the 1 pixel offset that shows the grid outlines.
**/
Grid.prototype.setupPaper = function() {

    var paper = this.paper,
        viewW = (this.resWidth + 201),
        viewH = (this.resHeight + 201);

    // Sets width and height of the svg so that the export is the appropriate size.
    paper.width = viewW;
    paper.height = viewH;

    /**
     *  Seems like we dont need the shit beneath
     *  Functinoality added to the generate button in options
    **/
    // Removing angle measurements
    //measurement.angMeasurements.remove();

    // Rearranging / showing title rect and text.
    //options.setupTitle();

    return paper.toSVG();
}

/**
 * Function to save our svg-drawing as a .png file.
 * Using libraries published at 'https://code.google.com/p/canvg/' under MIT-license.
**/
Grid.prototype.save = function (callback) {
    var paper = this.paper,
        svg = this.setupPaper();
        chosenMats = resultGrid.chosenMats,
        matTypes = options.validMat.products,
        matTable = null;

    // store generated svg to footmenu variable.
    footmenu.svg = svg;

    // create table of chosen mats and attributes.
    // decide mat amounts and info by going through chosen mats.
    var mats = [],
        tmp = null;
    for (var i = 0; i < chosenMats.length; i++) {

        // store mat (productnumber).
        var chosenMat = chosenMats[i];

        // if mat already counted
        if (chosenMat == tmp) {
            mats[(mats.length - 1)][2]++;

        // else mat needs to be counted/ sat.
        } else {

            // getting productname
            var name;
            for (var j = 0; j < matTypes.length; j++) {
                if (matTypes[j].number == chosenMat) {
                    name = matTypes[j].name;
                }
            }

            mats.push([chosenMat, name, 1]);
        }
        tmp = chosenMat;
    }

    // element variables. tableEle will be sent to saveSVG.php.
    var tableEle = document.createElement('table'),
        trEle,
        thEle,
        tdEle,
        tableString;

    // setting id to table element
    tableEle.id = 'matTable';


    trEle = document.createElement('tr');

    // create and add header 'productnumber'
    thEle = document.createElement('th');
    thEle.innerHTML = 'Produktnummer';
    trEle.appendChild(thEle);

    // create and add header 'name'
    thEle = document.createElement('th');
    thEle.innerHTML = 'Beskrivelse';
    trEle.appendChild(thEle);

    // create and add header 'amount'
    thEle = document.createElement('th');
    thEle.innerHTML = 'Antall';
    trEle.appendChild(thEle);

    // add header row to table
    tableEle.appendChild(trEle);


    // Going through mats array creating rows and columns.
    for (var i = 0; i < mats.length; i++) {

        // Create row
        trEle = document.createElement('tr');
        
        // Add column 'productnumber' to row
        tdEle = document.createElement('td');
        tdEle.innerHTML = mats[i][0];
        trEle.appendChild(tdEle);

        // Add column 'name' to row
        tdEle = document.createElement('td');
        tdEle.innerHTML = mats[i][1];
        trEle.appendChild(tdEle);

        // Add column 'amount' to row
        tdEle = document.createElement('td');
        tdEle.innerHTML = mats[i][2];
        trEle.appendChild(tdEle);

        // Add row to table
        tableEle.appendChild(trEle);
    }

    // converting dom element to string.
    // This is needed for the post beneath as pure dom elements can not be passed.
    var tmp = document.createElement('div');
    tmp.appendChild(tableEle);
    tableString = tmp.innerHTML;


    /**
     *  Post svg and table html to php script that creates a page to be exported as pdf.
     *
    **/
    $.post(
        'export/saveSVG.php', 
        {
            'svg': svg,
            'mats': tableString
        }, 
        function (data) {
            footmenu.drawId = data;
            callback();
        });

}
