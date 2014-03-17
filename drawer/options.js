

/**
 * Structonator
**/
function Options (tab) {
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
Options.prototype.showOptions = function (tab) {

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
            break;

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
Options.prototype.createHeader = function (text, yPos) {

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
 *  Set up the specifications-tab.
**/
Options.prototype.initSpecs = function () {

    var paper = this.optPaper,
        container = this.container,
        specSubmit = 'specSubmit',
        crossO = this.crossO,
        that = this;

    // Clear current html
    $(container).html("");

    // Adding class css, and remove the old ones.
    $(container).addClass('specTab');
    $(container).removeClass('obstacleTab');
    $(container).removeClass('roomTab');


    if (ourRoom.finished ==  true) {
        // Variables used for setting up elements.
        var header = document.createElement("h3"),
            inOut = document.createElement("select"),
            form = document.createElement("form"),
            option1 = document.createElement("option"),
            option2 = document.createElement("option"),
            span = document.createElement("span");
        
        header.innerHTML = "Velg spesifikasjoner";
        span.innerHTML = "Velg utend"+crossO+"rs/innend"+crossO+"rs: ";

        span.setAttribute("id", "inOrOut");
        form.setAttribute("class", "forms");
        form.setAttribute("id", "form1");
        inOut.setAttribute("id", "inOutType");

        option1.value = "1";
        option1.text = "Inne";
        option2.value = "2";
        option2.text = "Ute";

        inOut.add(option1, null);
        inOut.add(option2, null);
        form.appendChild(span);
        form.appendChild(inOut);

        $(container).append(header);
        $(container).append(form);
        $(form).append("<br>");

        // Default selected is 'none', so a value MUST be chosen by the user.        
        document.getElementById("inOutType").selectedIndex = -1;
    } else {
        html = '<p class="error"> You need to draw<br> and finish, or create a<br> predefined room first! </p>';
        $(container).html(html);
    }

    $('#inOutType').change( function () {
        that.inOrOut(form);
    });
}

/**
 * Functionality for showing dropdown-menu for chosing 'dry- or wet-area'.
 * Will only show this option if 'inside' is chosen on the first dropdown.
**/
Options.prototype.inOrOut = function (form) {

    var container = this.container,     
        selected = $('#inOutType').val(),
        that = this,
        crossO = this.crossO,
        dotA = this.dotA;

    // If the 'climateType'-id already exists, we want to delete the
    // <br> tag after it, and then remove the id itself.
    if ($('#climateType').length) {
        $('#climateType').next().remove();
        $('#climateType').remove();
        $('#dryOrWet').remove();
    }

    $('#decks').remove();
    $('#genButton').remove();

     //Inside is selected
    if (selected == 1) {

        $('#deckType').remove();

        var dryWet = document.createElement("select"),
            option1 = document.createElement("option"),
            option2 = document.createElement("option"),
            span = document.createElement("span");

        span.innerHTML = "Velg v"+dotA+"trom/t"+crossO+"rrom: ";
        dryWet.setAttribute("id", "climateType");
        span.setAttribute("id", "dryOrWet");

        option1.value = "1";
        option1.text = "T"+crossO+"rrom";
        option2.value = "2";
        option2.text = "V"+dotA+"trom";

        dryWet.add(option1, null);
        dryWet.add(option2, null);

        form.appendChild(span);
        form.appendChild(dryWet);
        // Append the form to the container.
        $(container).append(form); 
        $(form).append("<br>");
        document.getElementById("climateType").selectedIndex = -1;

    } else {
        // 'Outside' is chosen, so we jump directly to the options associated with this option.
        that.chooseDeck(form);
    }

    // Call new function to set up the 'deck'-dropdown on change.
    $('#climateType').change( function () {
        that.chooseDeck(form);
    });
}

/**
 * The third dropdown-menu, where the user must choose type of deck for the area.
**/
Options.prototype.chooseDeck = function (form) {

    var container = this.container,
        that = this,
        selected = $('#inOutType').val(),
        selectedClim = $('#climateType').val(),
        span = document.createElement("span"),
        deck = document.createElement("select"),
        option1 = document.createElement("option"),
        option2 = document.createElement("option"),
        option3 = document.createElement("option"),
        option4 = document.createElement("option"),
        option5 = document.createElement("option"),
        option6 = document.createElement("option"),
        option7 = document.createElement("option");

    // Make sure that a <select> with this id not exists, no need to use 'if' cause
    // nothing will happen if it doesn`t exist. Also remove the 'decks-<span>' that display text.
    $('#deckType').remove();
    $('#decks').remove();
    $('#genButton').remove();

    deck.setAttribute("id", "deckType");
    span.setAttribute("id", "decks");

    span.innerHTML = "Velg dekke i rommet: ";

    // Do stuff for an indoor-room.
    if (selected == 1) {
        // Tiles can occur both in dry-rooms and wet-rooms.
        option1.value = "1";
        option1.text = "Flis";
        // 'Dry-room'
        if (selectedClim == 1) {
            // List options for 'dry'-rooms.
            option2.value = "2";
            option2.text = "Teppe";
            option3.value = "3";
            option3.text = "Parkett";
            option4.value = "4";
            option4.text = "Laminat";
            option5.value = "5";
            option5.text = "Belegg";
            option6.value = "6";
            option6.text = "St"+this.crossO+"p";
            option7.value = "6";
            option7.text = "Kork";

            deck.add(option1, null);
            deck.add(option2, null);
            deck.add(option3, null);
            deck.add(option4, null);
            deck.add(option5, null);
            deck.add(option6, null);
            deck.add(option7, null);

        // This should obviously be a 'wet'-room.
        } else if (selectedClim == 2) {
            deck.add(option1, null);
        }
    // The area is chosen as 'outside' 
    } else if (selected == 2) {
        option1.value = "1";
        option1.text = "Asfalt"
        option2.value = "2";
        option2.text = "Belegningsstein";
        option3.value = "3";
        option3.text = "Betong";

        deck.add(option1, null);
        deck.add(option2, null);
        deck.add(option3, null);
    }

    // Append the element to our form, then add the form to the container.
    form.appendChild(span);
    form.appendChild(deck);
    $(container).append(form);
    // Set as blanc on initialization, to force the user to select an !default item.
    document.getElementById("deckType").selectedIndex = -1;

    // When the user have selected an item in this list, the 'generate'-button is created.
    $('#deckType').change( function () {
        that.generateButton(form);
    });
}

/**
 * Creation of a button to generate our solution for putting out a heatingmat.
 * Will be created when an item is chosen in all the dropdowns.
**/
Options.prototype.generateButton = function (form) {

    var container = this.container,
        input = document.createElement("input");

    $('#genButton').remove();

    input.setAttribute("id", "genButton");
    input.setAttribute("type", "button");
    input.setAttribute("title", "Klikk for "+this.dotA+" generere leggeanvisning");

    input.value = "Generer leggeanvisning";

    form.appendChild(input);
    $(container).append(form);

    $('#genButton').click( function () {
        // OBS: Call the algorithm and generate a drawing!
        // We also must find the product(s) that matches the chosen values!
    });
}

/**
 *  Set up Obstacles
 *
**/
Options.prototype.initObstacles = function () {

    var container = this.container,
        html = "",
        crossO = this.crossO,
        that = this;

    // clear current html
    $(container).html(html);

    // adding class css.
    $(container).addClass('obstacleTab');
    $(container).removeClass('specTab');


    if (ourRoom.finished ==  true) {
        // Move the room to coordinates (99, 99)
        grid.moveRoom();
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
        html += "<input id='defSubmit' type='button' value='legg til'>";

        // Form end
        html += '</form>';

        this.obstHtml = html;
        

    } else {
        html = '<p class="error"> You need to draw<br> and finish, or create a<br> predefined room first! </p>';
    }

    this.obstacleList();
}

/**
 *  Function that either refreshes or creates a list of obstacles.
 *  Gets the html set in initObstacles (passed through function).
**/
Options.prototype.obstacleList = function (obstacle) {

    var obstacleArr = obstacles.obstacleSet,
        obstacleLength = obstacleArr.length,
        change = 'Endre',
        save = 'Lagre',
        container = this.container,
        crossO = this.crossO,
        html = this.obstHtml,
        that = this;

    for (var i = 0; i < obstacleLength; i++) {

        html += "<div class=obst><div class=obsttxt>"+obstacleArr[i].data('obstacleType')+": </div><input id="+i+" class='change' type='button' value="+change+"></div>";

        if (obstacle == i) {
            var width = obstacleArr[i].attrs.width,
                height = obstacleArr[i].attrs.height,
                x = obstacleArr[i].attrs.x,
                y = obstacleArr[i].attrs.y;

            // Div start
            html += "<div id=change class='roomTab'>";
            // Height
            html += "<div class='inputfield'><div class='inputtext'>H"+crossO+"yde: </div><input  type='number' id='height' value="+height+"><br></div>";
            // Width
            html += "<div class='inputfield'><div class='inputtext'>Bredde: </div><input  type='number' id='width' value="+width+"><br></div>";
            // position x
            html += "<div class='inputfield'><div class='inputtext'>Horisontal avstand: </div><input type='number' id='posx' value="+(x - 100)+"><br></div>";
            // position y
            html += "<div class='inputfield'><div class='inputtext'>Vertikal avstand: </div><input type='number' id='posy' value="+(y - 100)+"></div>";
            // Button element.
            html += "<input id=changeObst name="+i+" type='button' value="+save+">";
            // Div end.
            html += "</div>";
        }
    }

    $(container).html("");
    $(container).html(html);

    this.actionListeners();

}

/**
 *  Function that initiates action listeners!
 *
**/
Options.prototype.actionListeners = function () {

    var that = this;


    // Add click action for the "submit button".
    $('.change').click(function() {

        that.obstacleList(this.id);
        obstacles.selectObstacle(this.id);

    });



    // Add click action for the "submit button".
    $('#defSubmit').click(function() {
        
        // Creating obstacle.
        var value = $('#obstacleType').val(),
            text = $('#obstacleType option[value='+value+']').text();

        obstacles.createObstacle(value, text);

        // Creating / refreshing list of obstacles.
        that.initObstacles();
    });


    // Add click action for the "submit button".
    $('#changeObst').click(function() {

        var roundX = (Math.round((($('#posx').val())/ 10)) * 10) + 100,
            roundY = (Math.round((($('#posy').val())/ 10)) * 10) + 100;

        $('#posx').val((roundX - 100));
        $('#posy').val((roundY - 100));


        obstacles.adjustSize(
            this.name, 
            $('#width').val(), 
            $('#height').val(), 
            roundX, 
            roundY
        );

        that.obstacleList();

        obstacles.selectObstacle(null);
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
    $(container).removeClass('obstacleTab');

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
    tabTxt = paper.text(width/2, 20.72, "Ferdiglagde rom").attr({
        'font-size': 18,
        'font-weight': 'bold'
    }),


    // All buttons is created the same way, with a square behind a illustration of the room-shape.
    // here are some common variables for positioning:
    x1 = (width / 8),
    x2 = (width * (5 / 8)),
    y1 = (height * (10 / 20)),
    y2 = (height * (12 / 20)),
    y3 = (height * (14 / 20)),
    y4 = (height * (16 / 20)),
    y5 = (height * (18 / 20)),
    w = (width / 4),
    topleft = (width * (3 / 16) ),
    offset1 = (w / 4),
    offset2 = (w / 2),
    offset3 = (3 / 4),
    offset4 = (w / 3),
    offset5 = (w / 6),
    offset6 = (w * (7 / 12)),
    offset7 = (w * (5 / 12)),
    offset8 = (w * (1 / 2)),
    p1 = (width * (11 / 16)),


    // FIRST ROW (y1)
    buttonRect = paper.rect(x1, y1, w, w).attr(rectAttr),
    rectImg = paper.rect((topleft), ((y1)+offset1), offset2, offset2).attr(imgAttr),

    buttonL = paper.rect((x2), y1, w, w).attr(rectAttr),
    lImg = paper.path('M'+(p1)+' '+((y1)+offset1)+' L'+((p1)+offset1)+' '+((y1)+offset1)+
            ' L'+((p1)+offset1)+' '+((y1)+offset2)+' L'+((p1)+offset2)+' '+((y1)+offset2)+
            ' L'+((p1)+offset2)+' '+((y1)+(w*offset3))+' L'+(p1)+' '+((y1)+(w*offset3))+
            ' L'+(p1)+' '+((y1)+offset1)).attr(imgAttr),


    // SECOND ROW
    buttonT = paper.rect(x1, (y2), w, w).attr(rectAttr),
    tImg = paper.path('M'+(topleft)+' '+((y2)+offset1)+'L'+((topleft)+(offset2))+' '+((y2)+offset1)+
            ' L'+((topleft)+(offset2))+' '+((y2)+offset2)+' L'+((topleft)+(offset4))+' '+((y2)+offset2)+
            ' L'+((topleft)+(offset4))+' '+((y2)+(w*(offset3)))+' L'+((topleft)+(offset5))+' '+((y2)+(w*(offset3)))+
            ' L'+((topleft)+(offset5))+' '+((y2)+offset2)+' L'+(topleft)+' '+((y2)+offset2)+
            ' L'+(topleft)+' '+((y2)+offset1)).attr(imgAttr),

    lInv = paper.rect((x2), (y2), w, w).attr(rectAttr),
    lInvImg = paper.path('M'+((p1)+offset1)+' '+((y2)+offset1)+' L'+((p1)+offset2)+' '+((y2)+offset1)+
                ' L'+((p1)+offset2)+' '+((y2)+(w*(offset3)))+' L'+(p1)+' '+((y2)+(w*(offset3)))+
                ' L'+(p1)+' '+((y2)+offset2)+' L'+((p1)+offset1)+' '+((y2)+offset2)+
                ' L'+((p1)+offset1)+' '+((y2)+offset1)).attr(imgAttr),

    // THIRD ROW!
    tRot90 = paper.rect(x1, (y3), w, w).attr(rectAttr),
    tRot90Img = paper.path('M'+((topleft)+offset1)+' '+((y3)+offset1)+' L'+((topleft)+offset2)+' '+((y3)+offset1)+
                ' L'+((topleft)+offset2)+' '+((y3)+(w*(offset3)))+' L'+((topleft)+offset1)+' '+((y3)+(w*(offset3)))+
                ' L'+((topleft)+offset1)+' '+((y3)+(offset6))+' L'+(topleft)+' '+((y3)+(offset6))+
                ' L'+(topleft)+' '+((y3)+offset7)+' L'+(topleft+offset1)+' '+((y3)+offset7)+
                ' L'+((topleft)+offset1)+' '+((y3)+offset1)).attr(imgAttr),

    lRot180 = paper.rect((x2), (y3), w, w).attr(rectAttr),
    lRot180Img = paper.path('M'+(p1)+' '+((y3)+offset1)+' L'+((p1)+(offset2))+' '+((y3)+offset1)+
                ' L'+((p1)+(offset2))+' '+((y3)+(w*(offset3)))+' L'+((p1)+offset1)+' '+((y3)+(w*(offset3)))+
                ' L'+((p1)+offset1)+' '+((y3)+offset2)+' L'+(p1)+' '+((y3)+offset2)+
                ' L'+(p1)+' '+((y3)+offset1)).attr(imgAttr),


    // FOURTH ROW!
    lRot270 = paper.rect((x2), (y4), w, w).attr(rectAttr),
    lRot270Img = paper.path('M'+(p1)+' '+((y4)+offset1)+' L'+((p1)+(offset2))+' '+((y4)+offset1)+
                ' L'+((p1)+(offset2))+' '+((y4)+offset2)+' L'+((p1)+offset1)+' '+((y4)+offset2)+
                ' L'+((p1)+offset1)+' '+((y4)+(w*(offset3)))+' L'+(p1)+' '+((y4)+(w*(offset3)))+
                ' L'+(p1)+' '+((y4)+offset1)).attr(imgAttr),

    
    tRot180 =  paper.rect(x1, (y4), w, w).attr(rectAttr),
    tRot180Img = paper.path('M'+((topleft)+offset5)+' '+((y4)+offset1)+' L'+((topleft)+offset4)+' '+((y4)+offset1)+
                ' L'+((topleft)+offset4)+' '+((y4)+offset2)+' L'+((topleft)+offset2)+' '+((y4)+(offset8))+
                ' L'+((topleft)+offset2)+' '+((y4)+(w*(offset3)))+' L'+(topleft)+' '+((y4)+(w*(offset3)))+
                ' L'+(topleft)+' '+((y4)+(offset8))+' L'+((topleft)+offset5)+' '+((y4)+(offset8))+
                ' L'+((topleft)+offset5)+' '+((y4)+offset1)).attr(imgAttr),


    // FIFTH ROW!
    tRot270 = paper.rect(x1, (y5), w, w).attr(rectAttr),
    tRot270Img = paper.path('M'+(topleft)+' '+((y5)+offset1)+' L'+((topleft)+offset1)+' '+((y5)+offset1)+
                ' L'+((topleft)+offset1)+' '+((y5)+(offset7))+' L'+((topleft)+offset2)+' '+((y5)+(offset7))+
                ' L'+((topleft)+offset2)+' '+((y5)+(offset6))+' L'+((topleft)+offset1)+' '+((y5)+(offset6))+
                ' L'+((topleft)+offset1)+' '+((y5)+(w*(offset3)))+' L'+(topleft)+' '+((y5)+(w*(offset3)))+
                ' L'+(topleft)+' '+((y5)+offset1)).attr(imgAttr),

    
    buttonU = paper.rect((x2), (y5), w, w).attr(rectAttr),
    uImg = paper.path('M'+(p1)+' '+((y5)+offset1)+' L'+((p1)+(offset5))+' '+((y5)+offset1)+
                ' L'+((p1)+(offset5))+' '+((y5)+offset2)+' L'+((p1)+offset4)+' '+((y5)+offset2)+
                ' L'+((p1)+offset4)+' '+((y5)+offset1)+' L'+((p1)+offset2)+' '+((y5)+offset1)+
                ' L'+((p1)+offset2)+' '+((y5)+(w*(offset3)))+' L'+(p1)+' '+((y5)+(w*(offset3)))+
                ' L'+(p1)+' '+((y5)+offset1)).attr(imgAttr);

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


    console.log(height, y1, y2, y3, y4, y5);
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




