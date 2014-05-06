/**
 * Class that creates our grid, and adds some of the basic-functionality to it (zoom etc.)
**/
function Grid() {
    this.size = 5;
    this.cutPix = 0.5;
    this.paper = Raphael(document.getElementById('canvas_container'));
    this.boxSet = this.paper.set();
    this.gridSet = this.paper.set();
    this.draw();
    this.scale();
    this.zoom();
    this.viewBoxWidth = this.paper.width;
    this.viewBoxHeight = this.paper.height;
    this.resWidth = (this.viewBoxWidth / 2);
    this.resHeight = null;
    this.zoomed = false;
}

/**
 * Function that draw vertical and horizontal lines on the screen, and set the viewbox.
 * This is the "base" of our webpage, where all drawing and stuff will happen.
**/
Grid.prototype.draw = function() {

    var canvas = $('#canvas_container'),
        size = this.size,               
        cutPix = this.cutPix,
        i,                                            
        width = (canvas.width()).toFixed(),
        height = (canvas.height()).toFixed();

    this.paper.setViewBox(0, 0, this.paper.width, this.paper.height); 

    for (i = 0; i <= width; i+=10) {

        this.gridSet.push(this.paper.path('M'+(i*size+cutPix)+', '+0+', L'+(i*size+cutPix)+', '+(size*height)).attr({'stroke-opacity': 0.4}));
    }

    for (i = 0; i <= height; i+=10) {

        this.gridSet.push(this.paper.path('M'+0+', '+(i*size+cutPix)+', L'+(size*width)+', '+(i*size+cutPix)).attr({'stroke-opacity': 0.4}));
    }
};

/**
 * Function that visualizes the scale-figure in the left corner of our grid. 
 * Also adds the components to a set, to have easier access to them.
**/
Grid.prototype.scale = function() {

    var box = this.paper.rect(1, 1, 99, 99).attr({
            'stroke-opacity': 1, 
            'stroke': '#CB2C30', 
            'stroke-width': 3, 
            'fill': 'white', 
            'fill-opacity': 0.7
        }),
        strokeAttr = {
            'stroke-opacity': 1, 
            'stroke': '#CB2C30', 
            'stroke-width': 3, 
            'arrow-start': 'classic-midium-midium',
            'arrow-end': 'classic-midium-midium'
        },
        arrowNW = this.paper.path('M'+0+', '+50+', L'+25+', '+50+'M'+50+', '+25+', L'+50+', '+0).attr(strokeAttr),
        arrowSE = this.paper.path('M'+50+', '+100+', L'+50+', '+75+'M'+75+', '+50+', L'+100+', '+50).attr(strokeAttr),
        tRect = this.paper.rect(30, 40, 40, 20, 5, 5).attr({
            'stroke-width': 0,
            opacity: 1,
            fill: 'white'
        }),
        t = this.paper.text(50, 50, '100 cm');

    this.boxSet.push(box, arrowNW, arrowSE, tRect, t);
};

/**
 * Functionality for zooming on the paper that holds the grid.
 * Source: http://jsfiddle.net/9zu4U/147/
**/
Grid.prototype.zoom = function() {

    /** 
     * Event handler for mouse wheel event.
     */
    function wheel(event) {

        var delta = 0;
        // Indicates that zoom has been 'activated'.
        TFplanner.grid.zoomed = true;

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
            TFplanner.grid.handle(delta);
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

        TFplanner.grid.pan(e.keyCode);
    };
};


/** 
 * This is the function that actually handles the zooming
 * It must react to delta being more/less than zero.
 * @param delta - 
**/
Grid.prototype.handle = function(delta) {
        
    var vB = this.paper._viewBox,
        viewBoxWidth = this.viewBoxWidth,
        viewBoxHeight = this.viewBoxHeight,
        orgX = vB[0],
        orgY = vB[1];

    if (delta > 0) {
        this.viewBoxWidth *= 0.95;
        this.viewBoxHeight*= 0.95;
    } else {
        this.viewBoxWidth *= 1.05;
        this.viewBoxHeight *= 1.05;
    }

    this.paper.setViewBox(orgX, orgY, viewBoxWidth, viewBoxHeight);
};


/** 
 * Function that pans grid (left, right, up, down) on the screen, when 
 * arrow-keys are pressed.
 * @param keycode - Which arrowkey that was pressed.
**/
Grid.prototype.pan = function(keyCode) {

    var ticks = 50,
        vB = this.paper._viewBox;

    switch (keyCode) {
        // Left
        case 37:
            if (vB[0] > 0) {
                this.paper.setViewBox(vB[0] - ticks, vB[1], vB[2], vB[3]);
            }
            break;
        // Up
        case 38:
            if (vB[1] > 0) {
                this.paper.setViewBox(vB[0], vB[1] - ticks, vB[2], vB[3]);
            }
            break;
        // Right
        case 39:
            this.paper.setViewBox(vB[0] + ticks, vB[1], vB[2], vB[3]);
            break;

        // Down
        case 40:
            this.paper.setViewBox(vB[0], vB[1] + ticks, vB[2], vB[3]);
            break;
    }
};


/**
 * OBS: Is it correct that this should be call 24/7 when hovering the paper? 
 * @param x - X-coordinate of the mousepointer.
 * @param y - Y-coordinate of the mousepointer.
 * @param not - (CHANGE PARA-name?)
 * @return - Returns the coordinates updated with zoom-ratio.
**/
Grid.prototype.getZoomedXY = function(x, y, not) {
        // Starting height and width
    var sH = this.paper._viewBox[2],
        sW = this.paper._viewBox[3],
        // Original height and width
        oH = this.paper.width,
        oW = this.paper.height,
        // Viewbox X and Y.
        vX = this.paper._viewBox[0],
        vY = this.paper._viewBox[1],
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
};

/**
 * Function used to move the room to coordinates (99,99). 
 * This happends when the 'obstacles'-tab is clicked.
 * The paths of each wall is updated, also a string is created, 
 * so that the room can be redrawn later as
 * ONE path.
 * @return - Returns the path of our room as ONE string.
**/
Grid.prototype.moveRoom = function() {

    var minX = 1000000, 
        maxX = 0, 
        minY = 1000000, 
        maxY = 0,
        ns = TFplanner,
        measures = ns.measurement, 
        walls = ns.ourRoom.walls,
        numberOfWalls = walls.length,
        offsetX,
        offsetY,
        xstart,
        ystart,
        tempString,
        pathString,
        path,
        i;

    for (i = 0; i < numberOfWalls; ++i) {
        //Find largest and smallest X value
        if ((walls[i].attrs.path[0][1]) > maxX) {
            maxX = walls[i].attrs.path[0][1];
        }

        if ((walls[i].attrs.path[1][1]) > maxX) {
            maxX = walls[i].attrs.path[1][1];
        }

        if ((walls[i].attrs.path[0][1]) < minX) {
            minX = walls[i].attrs.path[0][1];
        }

        if ((walls[i].attrs.path[1][1]) < minX) {
            minX = walls[i].attrs.path[1][1];
        }

        //Find smallest and largest Y value
        if ((walls[i].attrs.path[0][2]) > maxY) {
            maxY = walls[i].attrs.path[0][2];
        }

        if ((walls[i].attrs.path[1][2]) > maxY) {
            maxY = walls[i].attrs.path[1][2];
        }

        if ((walls[i].attrs.path[0][2]) < minY) {
            minY = walls[i].attrs.path[0][2];
        }

        if ((walls[i].attrs.path[1][2]) < minY) {
            minY = walls[i].attrs.path[1][2];
        }
    } 

    offsetX = minX - 99.5;
    offsetY = minY - 99.5;
    this.resWidth = (maxX - minX);
    this.resHeight = (maxY - minY);
    xstart = (walls[0].attrs.path[0][1] - offsetX);
    ystart = (walls[0].attrs.path[0][2] - offsetY);

    pathString = new String('M '+xstart+', '+ystart);
    
    // Move all the walls to new coordinates (this updates the paths of the real walls)    
    for (i = 0; i < numberOfWalls; ++i) {
        path = walls[i].attr('path');

        path[0][1] = (walls[i].attrs.path[0][1] - offsetX); 
        path[0][2] = (walls[i].attrs.path[0][2] - offsetY);

        path[1][1] = (walls[i].attrs.path[1][1] - offsetX); 
        path[1][2] = (walls[i].attrs.path[1][2] - offsetY); 

        walls[i].attr({path: path});

        tempString = ' L'+path[0][1]+', '+path[0][2];
        pathString += tempString;
    }

    // Refresh the measurement-stuff after moving the walls, 
    //then hide the angles and remove handlers.
    measures.refreshMeasurements();
    measures.finalMeasurements();

    ns.finishedRoom.removeHandlers();

    tempString = ' Z';
    pathString += tempString;

    // Returns the path of our room as ONE string.
    return pathString;
};

/** TODO: Check the i, ii stuff, when saving as pdf. (Set to 0, because they was undefined unless)
 * Function to save our svg-drawing as a .png file.
 * Using libraries published at 'https://code.google.com/p/canvg/' under MIT-license.
 * @param callback - 
**/
Grid.prototype.save = function(callback) {

    var ns = TFplanner,
        doc = document,
        chosenMats = ns.resultGrid.chosenMats,
        footM = ns.footmenu,
        matTypes = ns.options.validMat.products,
        mats = [],
        tmp = null,
        name = null,
        chosenMat = null,
        desc = ns.options.validMat.desc,
        note = ns.options.validMat.note,

        /**
         * Sets up the paper for svg convertion, converts and returns svg.
         * Adding 201 which represents the 1 meter offset + the 1 pixel offset that shows the grid outlines.
         * @param theGrid - The Grid object, refered to as 'this' in save().
         * @return - Calls function to generate SVG of our paper-elements.
        **/
        setupPaper = function(theGrid) {
            // Sets width and height of the svg so to appropriate size for export.
            theGrid.paper.width = (theGrid.resWidth + 201);
            theGrid.paper.height = (theGrid.resHeight + 201);
            return theGrid.paper.toSVG();
        },
        svg = setupPaper(this),
        tableString;

    // Store generated svg to footmenu variable.
    footM.svg = svg;

    // Create table of chosen mats and attributes.
    // Decide mat amounts and info by going through chosen mats.
    for (var i = 0, ii = chosenMats.length; i < ii; i++) {
        // Store mat (productnumber).
        chosenMat = chosenMats[i];

        // If mat already counted
        if (chosenMat == tmp) {

            mats[(mats.length - 1)][2]++;
        // Else mat needs to be counted/ sat.
        } else {

            // Getting productname
            for (var j = 0, jj = matTypes.length; j < jj; j++) {

                if (matTypes[j].number == chosenMat) {
                    name = matTypes[j].name;
                }
            }

            mats.push([chosenMat, name, 1]);
        }
        tmp = chosenMat;
    }

    // Setting the initial content of tableString. Table and its headers with a class added to the ANTALL column header and an id to the table tag.
    tableString = '<table id="matTable"><tr><th>EL-NUMMER</th><th>PRODUKTBESKRIVELSE</th><th>PRODUKT</th><th class="amount">ANTALL</th></tr>';

    // Going through mats array, adding each of the variables to the tableString representing a row.
    for (var i = 0, ii = mats.length; i < ii; i++) {

        tableString += '<tr><td>'+mats[i][0]+'</td><td>'+desc+'</td><td>'+mats[i][1]+'</td><td class="amount">'+mats[i][2]+'</td></tr>';
    }

    // Adding the endtag of the table.
    tableString += '</table>';

    /**
     * Post svg and table html to php script that creates a page to be exported as pdf.
    **/
    $.post(
        'export/saveSVG.php', 
        {
            'svg': svg,
            'mats': tableString, 
            'note': note
        }, 
        function (data) {
            footM.drawId = data;
            callback();
        }
    );
};
