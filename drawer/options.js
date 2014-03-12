

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
    var paper = this.optPaper,
        container = this.container,
        specSubmit = 'specSubmit',
        that = this,
        option1,
        option2,
        form;

    // clear current html
    $(container).html("");

    // adding class css.
    $(container).addClass('specTab');
    $(container).removeClass('obstacleTab');
    $(container).removeClass('roomTab');


    if (ourRoom.finished ==  true) {

        // Form start
        var header = document.createElement("h3"),
            inOut;
            header.innerHTML = "Velg spesifikasjoner";

        form = document.createElement("form");
        form.setAttribute("class", "forms");
        form.setAttribute("id", "form1");

        inOut = document.createElement("select");
        inOut.setAttribute("id", "inOutType");

        option1 = document.createElement("option");
        option2 = document.createElement("option");

        option1.value = "1";
        option1.text = "Inne";
        option2.value = "2";
        option2.text = "Ute";

        inOut.add(option1, null);
        inOut.add(option2, null);

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


/*
     
        // To force a 'change'-event to occur.
        document.getElementById("climateType").selectedIndex = -1;

            $('#climateType').change( function () {

                $(form).append("<br>");

                var selected = $('#climateType').val(),
                    option3 = document.createElement("option"),
                    option4 = document.createElement("option"),
                    deck = document.createElement("select");

                    deck.setAttribute("id", "climateType");
                    option1 = document.createElement("option");
                    option2 = document.createElement("option");

                if (selected == 1) {
                    option1.value = "1";
                    option1.text = "Parkett";
                    option2.value = "2";
                    option2.text = "Laminat";
                    option3.value = "3";
                    option3.text = "Teppe";
                    option4.value = "4";
                    option4.text = "PVC/Vinyl";

                    deck.add(option1, null);
                    deck.add(option2, null);
                    deck.add(option3, null);
                    deck.add(option4, null);

                } else if (selected == 2) {
                    option1.value = "1";
                    option1.text = "Fliser";
                    option2.value = "2";
                    option2.text = "Laminat";
                    option3.value = "3";    
                    option3.text = "PVC/Vinyl";     // Can this occur?

                    deck.add(option1, null);
                    deck.add(option2, null);
                    deck.add(option3, null);
                }

                form.appendChild(deck);
                $(container).append(form);
            }); 
    
*/

   // this.guiElements.push(this.createHeader('Velg valg'));
}

/**
 * Functionality for showing dropdown-menu for chosing 'dry- or wetarea'.
 * Will only show this option if 'inside' is chosen on the first dropdown.
**/
Options.prototype.inOrOut = function (form) {

    var container = this.container,     
        selected = $('#inOutType').val(),
        that = this;

        // OBS: Should do a check here, in case a element with id 'climateType' 
        // already exists.

     //Inside is selected
    if (selected == 1) {

        var dryWet = document.createElement("select"),
            option1 = document.createElement("option"),
            option2 = document.createElement("option");

        dryWet.setAttribute("id", "climateType");

        option1.value = "1";
        option1.text = "Torr";
        option2.value = "2";
        option2.text = "Wetttt";

        dryWet.add(option1, null);
        dryWet.add(option2, null);

        form.appendChild(dryWet);
        // Append the form to the container.
        $(container).append(form); 
        $(form).append("<br>");
        document.getElementById("climateType").selectedIndex = -1;

    } else { 
        that.chooseDeck(form);
    }

    // Call new function to set up the 'deck'-dropdown on change.
    $('#climateType').change( function () {
        that.chooseDeck(form);
    });
}


Options.prototype.chooseDeck = function (form) {

    var container = this.container,
        selected = $('#inOutType').val(),
        selectedClim = $('#climateType').val(),
        deck = document.createElement("select"),
        option1 = document.createElement("option"),
        option2 = document.createElement("option"),
        option3 = document.createElement("option"),
        option4 = document.createElement("option"),
        option5 = document.createElement("option");
        deck.setAttribute("id", "deckType");

        // Do stuff for an indoor-room.
        if (selected == 1) {
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
                option4.text = "Belegg";
                option5.value = "5";
                option5.text = "St"+this.crossO+"p";

                deck.add(option1, null);
                deck.add(option2, null);
                deck.add(option3, null);
                deck.add(option4, null);
                deck.add(option5, null);

            // This should obviously be a 'wet'-room.
            } else if (selectedClim == 2) {
                
                deck.add(option1, null);
            }
        // The area is chosen as 'outside' 
        // OBS: May not have to check if selected is 2? (can work as a failsafe tho)
        } else if (selected == 2) {
            option1.value = "1";
            option1.text = "Asfalt"
            option2.value = "2";
            option2.text = "Belegningsstein";
            option3.value = "3";
            option3.text = "Whatever";

            deck.add(option1, null);
            deck.add(option2, null);
            deck.add(option3, null);
        }

    form.appendChild(deck);
    // Append the form to the container.
    $(container).append(form);
    document.getElementById("deckType").selectedIndex = -1;

    // In any cases we want to add the new stuff to our form!

    // OBS: Call new function to do something cool (Don`t know what, really)
    $('#deckType').change( function () {

    });

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
        html += "<input id="+defSubmit+" type='button' value='Legg til'>";

        // Form end
        html += '</form>';

        this.obstHtml = html;
        

    } else {
        html = '<p class="error"> You need to draw<br> and finish, or create a<br> predefined room first! </p>';
    }

    // insert html
    $(container).html(html);

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
        change = 'Endre',
        save = 'Lagre',
        container = this.container,
        crossO = this.crossO,
        html = this.obstHtml,
        that = this;
    
    if (obstacleLength <= 0) {
        return;
    }

    for (var i = 0; i < obstacleLength; i++) {

        html += "<div class=obst>Hindring "+(i + 1)+": <input id="+i+" class='change' type='button' value="+change+"></div>";

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

    // Add click action for the "submit button".
    $('.change').click(function() {

        that.obstacleList(this.id);
        obstacles.selectObstacle(this.id);

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




