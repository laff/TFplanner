

/**
 * Structonator
**/
function Options(tab) {
        this.optPaper;
        this.preDefArr = null;
        this.optionTab = 1;
        this.defColor = '#6D8383';       // Default color.
        this.inColor = '#d8d8d8';        // Color for mouseover 

        // Default show.
        this.showOptions(1);

        // Set containing gui elements we want to clear/store?
        this.guiElements = null;

        this.container = "#content_container";

        this.obstHtml = null;


        this.crossO = String.fromCharCode(248);
        this.dotA = String.fromCharCode(229);
    }


/**
 *  Function that controlls what options to show based on selected tab.
 *
**/
Options.prototype.showOptions = function(tab) {

    var paper = (this.optPaper != null) ? this.optPaper : null,
        container = this.container;

    this.optionTab = tab;

    if (paper != null) {
        paper.remove();
    }

    // remove selected wall if any.
    if (finishedRoom != null) {
        if (finishedRoom.selectedWall != null) {
            finishedRoom.selectedWall.remove();
        }
    }

    $(container).empty();

    this.optPaper = Raphael(document.getElementById('content_container'));

    // Setting up the guiElement set.
    if (this.guiElements != null) {
        this.guiElements.remove();
        this.guiElements = null;
    }
    this.guiElements = this.optPaper.set();

    switch (tab) {
        
        case 1:
            this.initDraw();
            break;

        case 2:
            this.initObstacles();
            break;

        case 3: 
            this.initSpecs();
            break;

        // case 4 and above is actually "sub options".
        case 4:
            this.initDefine();

        default:
            return;
    }
}


/**
 *  Function that creates a header.
 *  It is supposed to position a header perfectly within the options_container.
 *  
 *  @params:
 *      - yPos : The distance from the top. Makes it easy to position header.
 *      - text : The header text.
**/
Options.prototype.createHeader = function(text, yPos) {

    var paper = this.optPaper,
        paperW = paper.width,
        paperH = paper.height,
        offsetX = (paperW * 0.1),
        offsetY = (paperH * 0.05) + (yPos != null ? yPos : 0),
        rectWidth = (paperW * 0.8),
        rectHeight = (paperH * 0.05),
        text,
        rect;
    
    // Create the button used when creating a predefined rectangular room.
    rect = paper.rect(offsetX, offsetY, rectWidth, rectHeight).attr({
        fill: 'gray',
        'stroke-width': 0
    });

    // Getting the rectangle variables
    var attrs = rect.attrs,
        rectX = attrs.x,
        rectY = attrs.y,
        rectW = attrs.width,
        rectH = attrs.height,
        fontSize = Math.pow((rectH * rectW), 0.3);

    //Head-text on top of the buttons:
    text = paper.text((rectX + (rectW / 2)), (rectY + (rectH / 2)), text).attr({
        'font-size': fontSize
    })


    return (rect, text);

}

/**
 *  Set up specifications
 *
**/
Options.prototype.initSpecs = function() {
    var paper = this.optPaper;

    paper.canvas.style.backgroundColor = '#999999';

    this.guiElements.push(this.createHeader('Velg valg'));

}

/**
 *  Set up Obstacles
 *
**/
Options.prototype.initObstacles = function() {

    var container = this.container,
        html = "",
        crossO = this.crossO,
        defSubmit = 'defSubmit',
        that = this;


    // clear current html
    $(container).html(html);

    // adding class css.
    $(container).addClass('obstacleTab');

    // Header
    html += '<h3> Legg til hindring </h3>';

    // Form start
    html += '<form class=forms>';

    // Select
    html += "<select id ='obstacleType'><option value=1>Avl"+crossO+"p</option>";
    html += "<option value=2>Toalett</option>";
    html += "<option value=3>Dusj</option>";
    html += "<option value=4>Badekar</option></select>";

    // input button
    html += "<input id="+defSubmit+" type='button' value='legg til'>";

    // Form end
    html += '</form>';


    // insert html
    $(container).html(html);

    this.obstHtml = html;

    this.obstacleList();

    // Add click action for the "submit button".
    $('#'+defSubmit).click(function() {

        // Creating obstacle.
        obstacles.createObstacle($('#obstacleType').val());

        // Creating / refreshing list of obstacles.
        that.initObstacles();
    });

}

/**
 *  Function that either refreshes or creates a list of obstacles.
 *  Gets the html set in initObstacles (passed through function).
**/
Options.prototype.obstacleList = function(obstacle) {

    var obstacleArr = obstacles.obstacleSet,
        obstacleLength = obstacleArr.length,
        html = (html != null) ? html : this.obstHtml;
        change = 'Endre',
        save = 'Lagre',
        container = this.container,
        crossO = this.crossO;

    for (var i = 0; i < obstacleLength; i++) {

        html += "<div class=obst>Hindring "+(i + 1)+": <input id="+i+" class='change' type='button' value="+change+"></div>";

        if (obstacle == i) {
            var width = obstacleArr[i].attrs.width,
                height = obstacleArr[i].attrs.height;

            html += "<div id=change class='roomTab'>H"+crossO+"yde: <input  type='number' id='height' value="+height+"><br>";
            html += "Bredde: <input  type='number' id='width' value="+width+">";
            html += "<input id=changeObst name="+i+" type='button' value="+save+"></div>";
        }
    }

    $(container).html("");
    $(container).html(html);

    // Add click action for the "submit button".
    $('.change').click(function() {

        options.obstacleList(this.id);

    });

    // Add click action for the "submit button".
    $('#changeObst').click(function() {

        obstacles.adjustSize(this.name, $('#width').val(), $('#height').val());

    });
}


/** 
 *  Function that creates a form that lets the user adjust lengths of his predifined room.
 *
**/
Options.prototype.initDefine = function () {
    
    var preDefArr = this.preDefArr,
        container = this.container,
        defSubmit = 'defSubmit',
        wallsLength = (preDefArr != null) ? (preDefArr[1].length - 1) : null,
        // Starting with a clean slate @ the html variable.
        html = "",
        dotA = this.dotA;

    // Removing the svg paper and adding room class for background color
    this.optPaper.remove();
    $(container).addClass('roomTab');

    html += '<h3> Egendefiner m'+dotA+'l </h3>';

    // If preDef is assigned, list the walls and let the user input stuff, YO.
    if (preDefArr != null) {

        html += '<form class=forms>';

        for (var i = 0; i < wallsLength; i++) {
            
            html += "<span>Vegg "+(i+1)+": <input type='number' class='inputt' id=wall"+i+" value="+preDefArr[1][i];
            html += "></span><br>";

        }

        // Add last wall disabled input
        html += "<span class='inputt'>Vegg "+(wallsLength + 1)+" :";
        html += "<input type='text' id=wall"+wallsLength+" value='Automatisk' disabled='disabled'></span><br>";

        html += "<input id="+defSubmit+" type='button' value='Oppdater'>";
        html += "</form>";

    } else {
        html = '<p class="error"> You need to select<br> a predefined room first! </p>';
    }

    // Add html to container.
    $(container).html(html);


    // Add click action for the "submit button".
    $('#'+defSubmit).click(function() {

        var walls = [],
            valid = false;

        // Goes through the input elements and stores the length
        for (var i = 0; i < wallsLength; i++) {
            preDefArr[1][i] = $('#wall'+i).val();
        }

        finishedRoom.selectWall();
        ourRoom.createRoom(preDefArr);

    });


    /**
     * Functionality that signals what wall that is selected when typing into the input field.
     *
    **/
    $('.inputt').mousedown(function() {
        var child = $(this).children(),
            id,
            walls = ourRoom.walls,
            wallsLength = walls.length;

        // Sort out id of input field (should be same as wall id).
        if (child[0] != null) {
            id = child[0].id;
        } else {
            id = child.context.id;
        }

        // Get wall ID.
        id = id.slice(-1);

        // have a temporary selected wall thing, created.
        finishedRoom.selectWall(id);
    });


}

/*
 * Sets up the 'options-container', and create buttons and handlers.
 * Basically the same is done for each button, but the coordinates is different for each one.
 * OBS: The order of pushing elements to collections is important! (The button must be pushed as first element)
**/
Options.prototype.initDraw = function () {
        var paper = this.optPaper,
            width = paper.width,
            height = paper.height,        
            rectColl = paper.set(),
            tColl = paper.set(),
            lColl = paper.set(),
            lInvColl = paper.set(),
            lRot180Coll = paper.set(),
            lRot270Coll = paper.set(),
            tRot90Coll = paper.set(),
            tRot180Coll = paper.set(),
            tRot270Coll = paper.set(),
            uColl = paper.set(),
            rectAttr = {                // Attributes for the "background-square" of buttons.
                fill: this.defColor, 
                stroke: '#3B4449', 
                'stroke-width': 1, 
            },
            imgAttr = {                 // Attributes for the "image" on each button.
                fill: '#fafdd5',
                stroke: 'black',
                'stroke-width': 1,
            },
                     

    // Head-text on top of the buttons:
  

    tabTxt = paper.text(width/2, 10, "Ferdiglagde rom").attr({
        'font-size': 14
    }),

    // All buttons is created the same way, with a square behind a illustration of the room-shape.
    buttonRect = paper.rect(width/8, height/20, width/4, width/4, 0).attr(rectAttr),
    temp = buttonRect.attrs.width,          // Used for shorter writing of width-variable
    rectImg = paper.rect((width*(3/16)), ((height/20)+temp/4), temp/2, temp/2, 0).attr(imgAttr),


    buttonT = paper.rect(width/8, (height*(3/20)), width/4, width/4, 0).attr(rectAttr),
    tImg = paper.path('M'+(width*(3/16))+' '+((height*(3/20))+temp/4)+'L'+((width*(3/16))+(temp/2))+' '+((height*(3/20))+temp/4)+
            ' L'+((width*(3/16))+(temp/2))+' '+((height*(3/20))+temp/2)+' L'+((width*(3/16))+(temp/3))+' '+((height*(3/20))+temp/2)+
            ' L'+((width*(3/16))+(temp/3))+' '+((height*(3/20))+(temp*(3/4)))+' L'+((width*(3/16))+(temp/6))+' '+((height*(3/20))+(temp*(3/4)))+
            ' L'+((width*(3/16))+(temp/6))+' '+((height*(3/20))+temp/2)+' L'+(width*(3/16))+' '+((height*(3/20))+temp/2)+
            ' L'+(width*(3/16))+' '+((height*(3/20))+temp/4)).attr(imgAttr),


    buttonL = paper.rect((width*(5/8)), height/20, width/4, width/4, 0).attr(rectAttr),
    lImg = paper.path('M'+(width*(11/16))+' '+((height/20)+temp/4)+' L'+((width*(11/16))+temp/4)+' '+((height/20)+temp/4)+
            ' L'+((width*(11/16))+temp/4)+' '+((height/20)+temp/2)+' L'+((width*(11/16))+temp/2)+' '+((height/20)+temp/2)+
            ' L'+((width*(11/16))+temp/2)+' '+((height/20)+(temp*3/4))+' L'+(width*(11/16))+' '+((height/20)+(temp*3/4))+
            ' L'+(width*(11/16))+' '+((height/20)+temp/4)).attr(imgAttr),


    lInv = paper.rect((width*(5/8)), (height*(3/20)), width/4, width/4, 0).attr(rectAttr),
    lInvImg = paper.path('M'+((width*(11/16))+temp/4)+' '+((height*(3/20))+temp/4)+' L'+((width*(11/16))+temp/2)+' '+((height*(3/20))+temp/4)+
                ' L'+((width*(11/16))+temp/2)+' '+((height*(3/20))+(temp*(3/4)))+' L'+(width*(11/16))+' '+((height*(3/20))+(temp*(3/4)))+
                ' L'+(width*(11/16))+' '+((height*(3/20))+temp/2)+' L'+((width*(11/16))+temp/4)+' '+((height*(3/20))+temp/2)+
                ' L'+((width*(11/16))+temp/4)+' '+((height*(3/20))+temp/4)).attr(imgAttr),

    
    lRot180 = paper.rect((width*(5/8)), (height*(5/20)), width/4, width/4, 0).attr(rectAttr),
    lRot180Img = paper.path('M'+(width*(11/16))+' '+((height*(5/20))+temp/4)+' L'+((width*(11/16))+(temp/2))+' '+((height*(5/20))+temp/4)+
                ' L'+((width*(11/16))+(temp/2))+' '+((height*(5/20))+(temp*(3/4)))+' L'+((width*(11/16))+temp/4)+' '+((height*(5/20))+(temp*(3/4)))+
                ' L'+((width*(11/16))+temp/4)+' '+((height*(5/20))+temp/2)+' L'+(width*(11/16))+' '+((height*(5/20))+temp/2)+
                ' L'+(width*(11/16))+' '+((height*(5/20))+temp/4)).attr(imgAttr),

    
    lRot270 = paper.rect((width*(5/8)), (height*(7/20)), width/4, width/4, 0).attr(rectAttr),
    lRot270Img = paper.path('M'+(width*(11/16))+' '+((height*(7/20))+temp/4)+' L'+((width*(11/16))+(temp/2))+' '+((height*(7/20))+temp/4)+
                ' L'+((width*(11/16))+(temp/2))+' '+((height*(7/20))+temp/2)+' L'+((width*(11/16))+temp/4)+' '+((height*(7/20))+temp/2)+
                ' L'+((width*(11/16))+temp/4)+' '+((height*(7/20))+(temp*(3/4)))+' L'+(width*(11/16))+' '+((height*(7/20))+(temp*(3/4)))+
                ' L'+(width*(11/16))+' '+((height*(7/20))+temp/4)).attr(imgAttr),

    
    tRot90 = paper.rect(width/8, (height*(5/20)), width/4, width/4, 0).attr(rectAttr),
    tRot90Img = paper.path('M'+((width*(3/16))+temp/4)+' '+((height*(5/20))+temp/4)+' L'+((width*(3/16))+temp/2)+' '+((height*(5/20))+temp/4)+
                ' L'+((width*(3/16))+temp/2)+' '+((height*(5/20))+(temp*(3/4)))+' L'+((width*(3/16))+temp/4)+' '+((height*(5/20))+(temp*(3/4)))+
                ' L'+((width*(3/16))+temp/4)+' '+((height*(5/20))+(temp*(7/12)))+' L'+(width*(3/16))+' '+((height*(5/20))+(temp*(7/12)))+
                ' L'+(width*(3/16))+' '+((height*(5/20))+temp*(5/12))+' L'+(width*(3/16)+temp/4)+' '+((height*(5/20))+temp*(5/12))+
                ' L'+((width*(3/16))+temp/4)+' '+((height*(5/20))+temp/4)).attr(imgAttr),

    
    tRot180 =  paper.rect(width/8, (height*(7/20)), width/4, width/4, 0).attr(rectAttr),
    tRot180Img = paper.path('M'+((width*(3/16))+temp/6)+' '+((height*(7/20))+temp/4)+' L'+((width*(3/16))+temp/3)+' '+((height*(7/20))+temp/4)+
                ' L'+((width*(3/16))+temp/3)+' '+((height*(7/20))+temp/2)+' L'+((width*(3/16))+temp/2)+' '+((height*(7/20))+(temp*(1/2)))+
                ' L'+((width*(3/16))+temp/2)+' '+((height*(7/20))+(temp*(3/4)))+' L'+(width*(3/16))+' '+((height*(7/20))+(temp*(3/4)))+
                ' L'+(width*(3/16))+' '+((height*(7/20))+(temp*(1/2)))+' L'+((width*(3/16))+temp/6)+' '+((height*(7/20))+(temp*(1/2)))+
                ' L'+((width*(3/16))+temp/6)+' '+((height*(7/20))+temp/4)).attr(imgAttr),

    
    tRot270 = paper.rect(width/8, (height*(9/20)), width/4, width/4, 0).attr(rectAttr),
    tRot270Img = paper.path('M'+(width*(3/16))+' '+((height*(9/20))+temp/4)+' L'+((width*(3/16))+temp/4)+' '+((height*(9/20))+temp/4)+
                ' L'+((width*(3/16))+temp/4)+' '+((height*(9/20))+(temp*(5/12)))+' L'+((width*(3/16))+temp/2)+' '+((height*(9/20))+(temp*(5/12)))+
                ' L'+((width*(3/16))+temp/2)+' '+((height*(9/20))+(temp*(7/12)))+' L'+((width*(3/16))+temp/4)+' '+((height*(9/20))+(temp*(7/12)))+
                ' L'+((width*(3/16))+temp/4)+' '+((height*(9/20))+(temp*(3/4)))+' L'+(width*(3/16))+' '+((height*(9/20))+(temp*(3/4)))+
                ' L'+(width*(3/16))+' '+((height*(9/20))+temp/4)).attr(imgAttr),

    
    buttonU = paper.rect((width*(5/8)), (height*(9/20)), width/4, width/4, 0).attr(rectAttr),
    uImg = paper.path('M'+(width*(11/16))+' '+((height*(9/20))+temp/4)+' L'+((width*(11/16))+(temp/6))+' '+((height*(9/20))+temp/4)+
                ' L'+((width*(11/16))+(temp/6))+' '+((height*(9/20))+temp/2)+' L'+((width*(11/16))+temp/3)+' '+((height*(9/20))+temp/2)+
                ' L'+((width*(11/16))+temp/3)+' '+((height*(9/20))+temp/4)+' L'+((width*(11/16))+temp/2)+' '+((height*(9/20))+temp/4)+
                ' L'+((width*(11/16))+temp/2)+' '+((height*(9/20))+(temp*(3/4)))+' L'+(width*(11/16))+' '+((height*(9/20))+(temp*(3/4)))+
                ' L'+(width*(11/16))+' '+((height*(9/20))+temp/4)).attr(imgAttr);

    // Set backgroundcolor of the options-container canvas.
    paper.canvas.style.backgroundColor = '#D6D6D6';

    // Create handlers and stuff for all the 'buttons'.
    this.createHandlers(rectColl.push(buttonRect, rectImg), 0, "Ferdiglaget kvadratisk rom");
    this.createHandlers(tColl.push(buttonT, tImg), 2, "Ferdiglaget T-formet rom");
    this.createHandlers(lColl.push(buttonL, lImg), 1,"Ferdiglaget L-formet rom");
    this.createHandlers(lInvColl.push(lInv, lInvImg), 5, "Ferdiglaget invertert L-rom");
    this.createHandlers(lRot180Coll.push(lRot180, lRot180Img), 4, "Ferdiglaget L-rom");
    this.createHandlers(lRot270Coll.push(lRot270, lRot270Img), 3, "Ferdiglaget L-rom");
    this.createHandlers(tRot90Coll.push(tRot90, tRot90Img), 6, "Ferdiglaget T-rom");
    this.createHandlers(tRot180Coll.push(tRot180, tRot180Img), 7, "Ferdiglaget T-rom");
    this.createHandlers(tRot270Coll.push(tRot270, tRot270Img), 8, "Ferdiglaget T-rom");
    this.createHandlers(uColl.push(buttonU, uImg), 9, "Ferdiglaget U-rom");
}

/**
 * This function add the mouse-handlers for all the 'premade-room'-buttons.
 * @param Coll - A set, containing the rectangular button and the image upon it.
 * @param val - An int, that says what roomtype to be sent to the 'createRoom' function.
 * @param toolTip - A string, that is used to set the tooltip(title) of each button.
**/
Options.prototype.createHandlers = function(coll, val, toolTip) {
    var defColor = this.defColor,
        inColor = this.inColor;

    coll.attr({
        cursor: 'pointer',
        title: toolTip
    }).hover(function () {
        // Set attributes on hover.
        coll[0].attr('fill', inColor);
    }, function () {
        coll[0].attr('fill', defColor);

    }).mouseup(function () {
        ourRoom.createRoom(new PreDefRoom(val));
    });
}


/**
 * Function that holds the shapes and wall-lengths of 'predefined' rooms.
 * All drawing will be done clockwise and will follow the angle-axis predefined. 
 * (180 is straight to the right, 270 is downwards etc.).
 * The first array contain the angles, and the second array contain the length of the wall.
 *
**/
function PreDefRoom (value) {

    switch(value) {
        case 0:
            return rectArr = [[180, 270, 360, 90],[500, 400, 500, 400]];                                            //Rectangle-shaped
        case 1:
            return lArr = [[180, 270, 180, 270, 360, 90],[200, 200, 200, 150, 400, 350]];                           //L-shaped
        case 2:
            return tArr = [[180, 270, 360, 270, 360, 90, 360, 90],[450, 150, 150, 250, 150, 250, 150, 150]];        //T-shaped
        case 3:
            return lRot270 = [[180, 270, 360, 270, 360, 90],[400, 150, 200, 200, 200, 350]];                        //L-shape rotated 270 degrees.
        case 4:
            return lRot180 = [[180, 270, 360, 90, 360, 90], [400, 350, 200, 200, 200, 150]];                        //L-shape rotated 180 degrees.
        case 5:
            return lRot90 = [[180, 270, 360, 90, 180, 90],[200, 350, 400, 150, 200, 200]];                          //L-shape rotated 90 degrees.
        case 6:
            return tRot90 = [[180, 270, 360, 90, 360, 90, 180, 90], [150, 450, 150, 150, 250, 150, 250, 150,]];     //T-shape rotated 90 degrees.
        case 7:
            return tRot180 = [[180, 270, 180, 270, 360, 90, 180, 90], [150, 250, 150, 150, 450, 150, 150, 250]];    //T-shape rotated 180 degrees.
        case 8:
            return tRot270 = [[180, 270, 180, 270, 360, 270, 360, 90], [150, 150, 250, 150, 250, 150, 150, 450]];   //T-shape rotated 270 degrees.
        case 9:
            return u = [[180, 270, 180, 90, 180, 270, 360, 90],[150, 200, 200, 200, 150, 350, 500, 350]];           //U-shaped room
    }
}




