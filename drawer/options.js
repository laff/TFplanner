

/**
 * Structonator
**/
function Options(tab) {
        this.optPaper;
        this.preDefArr = null;
        this.optionTab = 1;

        // Default show.
        this.showOptions(1);
    }


/**
 *  Function that controlls what options to show based on selected tab.
 *
**/
Options.prototype.showOptions = function(tab) {

    var paper = (this.optPaper != null) ? this.optPaper : null;

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

    $('#content_container').empty();

    this.optPaper = Raphael(document.getElementById('content_container'));
  //  this.optPaper.setSize(null,"100%");

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
 *  Set up specifications
 *
**/
Options.prototype.initSpecs = function() {
    var paper = this.optPaper;

    paper.canvas.style.backgroundColor = '#999999';

}

/**
 *  
 *
**/
Options.prototype.initObstacles = function() {
    var paper = this.optPaper;

    paper.canvas.style.backgroundColor = '#BDBDBD';

}


/** 
 *  Function that creates a form that lets the user adjust lengths of his predifined room.
 *
**/
Options.prototype.initDefine = function () {
    
    var preDefArr = this.preDefArr,
        container = "#content_container",
        defSubmit = 'defSubmit',
        wallsLength = (preDefArr != null) ? (preDefArr[1].length - 1) : null,
        // Starting with a clean slate @ the html variable.
        html = "";

    // Removing the svg paper and adding room class for background color
    this.optPaper.remove();
    $(container).addClass('roomTab');


    // If preDef is assigned, list the walls and let the user input stuff, YO.
    if (preDefArr != null) {

        html += '<form id=define>';

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
 * TODO: Set title for the rooms
**/
Options.prototype.initDraw = function () {
        var paper = this.optPaper,
            width = paper.width,
            height = paper.height,        
            tabTxt,
            rectColl = paper.set(),
            tColl = paper.set(),
            lColl = paper.set(),
            lInvColl = paper.set(),
            lRot180Coll = paper.set(),
            lRot270Coll = paper.set(),
            tRot90Coll = paper.set(),
            tRot180Coll = paper.set(),
            buttonT, tImg,
            buttonRect, rectImg,
            buttonL, lImg,
            lInv, lInvImg,
            lRot180, lRot180Img,
            lRot270, lRot270Img,
            tRot90, tRot90Img,
            tRot180, tRot180Img, 
            defColor = '#6D8383',       // Default color.
            inColor = '#d8d8d8',        // Color for mouseover 
            rectAttr = {                // Attributes for the "background-square" of buttons.
                fill: defColor, 
                stroke: '#3B4449', 
                'stroke-width': 1, 
            },
            imgAttr = {                 // Attributes for the "image" on each button.
                fill: '#fafdd5',
                stroke: 'black',
                'stroke-width': 1,
            },
            temp;                       // Used for shorter writing of width-variables

    // Set backgroundcolor of the options-container canvas.
    paper.canvas.style.backgroundColor = '#D6D6D6';

    // Head-text on top of the buttons:
    tabTxt = paper.text(width/2, 10, "Ferdiglagde rom").attr({
        'font-size': 14
    })

    // Create the button used when creating a predefined rectangular room.
    buttonRect = paper.rect(width/8, height/20, width/4, width/4, 0).attr(rectAttr);
    temp = buttonRect.attrs.width;
    // Drawing a rectangle on the button.
    rectImg = paper.rect((width*(3/16)), ((height/20)+temp/4), temp/2, temp/2, 0).attr(imgAttr);


    this.createHandlers(rectColl.push(buttonRect, rectImg), 0);


    buttonT = paper.rect(width/8, (height*(3/20)), width/4, width/4, 0).attr(rectAttr);

    // Drawing a T on the button.
    tImg = paper.path('M'+(width*(3/16))+' '+((height*(3/20))+temp/4)+'L'+((width*(3/16))+(temp/2))+' '+((height*(3/20))+temp/4)+
            ' L'+((width*(3/16))+(temp/2))+' '+((height*(3/20))+temp/2)+' L'+((width*(3/16))+(temp/3))+' '+((height*(3/20))+temp/2)+
            ' L'+((width*(3/16))+(temp/3))+' '+((height*(3/20))+(temp*(3/4)))+' L'+((width*(3/16))+(temp/6))+' '+((height*(3/20))+(temp*(3/4)))+
            ' L'+((width*(3/16))+(temp/6))+' '+((height*(3/20))+temp/2)+' L'+(width*(3/16))+' '+((height*(3/20))+temp/2)+
            ' L'+(width*(3/16))+' '+((height*(3/20))+temp/4)).attr(imgAttr);


    //title: "Ferdiglaget T-formet rom",
    this.createHandlers(tColl.push(buttonT, tImg), 2);


    buttonL = paper.rect((width*(5/8)), height/20, width/4, width/4, 0).attr(rectAttr);
    lImg = paper.path('M'+(width*(11/16))+' '+((height/20)+temp/4)+' L'+((width*(11/16))+temp/4)+' '+((height/20)+temp/4)+
            ' L'+((width*(11/16))+temp/4)+' '+((height/20)+temp/2)+' L'+((width*(11/16))+temp/2)+' '+((height/20)+temp/2)+
            ' L'+((width*(11/16))+temp/2)+' '+((height/20)+(temp*3/4))+' L'+(width*(11/16))+' '+((height/20)+(temp*3/4))+
            ' L'+(width*(11/16))+' '+((height/20)+temp/4)).attr(imgAttr);

    
    // title: "Ferdiglaget L-formet rom",
    this.createHandlers(lColl.push(buttonL, lImg), 1);


    
    lInv = paper.rect((width*(5/8)), (height*(3/20)), width/4, width/4, 0).attr(rectAttr);
    lInvImg = paper.path('M'+((width*(11/16))+temp/4)+' '+((height*(3/20))+temp/4)+' L'+((width*(11/16))+temp/2)+' '+((height*(3/20))+temp/4)+
                ' L'+((width*(11/16))+temp/2)+' '+((height*(3/20))+(temp*(3/4)))+' L'+(width*(11/16))+' '+((height*(3/20))+(temp*(3/4)))+
                ' L'+(width*(11/16))+' '+((height*(3/20))+temp/2)+' L'+((width*(11/16))+temp/4)+' '+((height*(3/20))+temp/2)+
                ' L'+((width*(11/16))+temp/4)+' '+((height*(3/20))+temp/4)).attr(imgAttr);

    
    // title: "Ferdiglaget invertert L-rom",
    this.createHandlers(lInvColl.push(lInv, lInvImg), 5);

        

    lRot180 = paper.rect((width*(5/8)), (height*(5/20)), width/4, width/4, 0).attr(rectAttr);
    lRot180Img = paper.path('M'+(width*(11/16))+' '+((height*(5/20))+temp/4)+' L'+((width*(11/16))+(temp/2))+' '+((height*(5/20))+temp/4)+
                ' L'+((width*(11/16))+(temp/2))+' '+((height*(5/20))+(temp*(3/4)))+' L'+((width*(11/16))+temp/4)+' '+((height*(5/20))+(temp*(3/4)))+
                ' L'+((width*(11/16))+temp/4)+' '+((height*(5/20))+temp/2)+' L'+(width*(11/16))+' '+((height*(5/20))+temp/2)+
                ' L'+(width*(11/16))+' '+((height*(5/20))+temp/4)).attr(imgAttr);


    // title: "Ferdiglaget L-rom"
    this.createHandlers(lRot180Coll.push(lRot180, lRot180Img), 4);

    lRot270 = paper.rect((width*(5/8)), (height*(7/20)), width/4, width/4, 0).attr(rectAttr);
    lRot270Img = paper.path('M'+(width*(11/16))+' '+((height*(7/20))+temp/4)+' L'+((width*(11/16))+(temp/2))+' '+((height*(7/20))+temp/4)+
                ' L'+((width*(11/16))+(temp/2))+' '+((height*(7/20))+temp/2)+' L'+((width*(11/16))+temp/4)+' '+((height*(7/20))+temp/2)+
                ' L'+((width*(11/16))+temp/4)+' '+((height*(7/20))+(temp*(3/4)))+' L'+(width*(11/16))+' '+((height*(7/20))+(temp*(3/4)))+
                ' L'+(width*(11/16))+' '+((height*(7/20))+temp/4)).attr(imgAttr);

    
    // title: "Ferdiglaget L-rom"
    this.createHandlers(lRot270Coll.push(lRot270, lRot270Img), 3);

        


    tRot90 = paper.rect(width/8, (height*(5/20)), width/4, width/4, 0).attr(rectAttr);
    tRot90Img = paper.path('M'+((width*(3/16))+temp/4)+' '+((height*(5/20))+temp/4)+' L'+((width*(3/16))+temp/2)+' '+((height*(5/20))+temp/4)+
                ' L'+((width*(3/16))+temp/2)+' '+((height*(5/20))+(temp*(3/4)))+' L'+((width*(3/16))+temp/4)+' '+((height*(5/20))+(temp*(3/4)))+
                ' L'+((width*(3/16))+temp/4)+' '+((height*(5/20))+(temp*(7/12)))+' L'+(width*(3/16))+' '+((height*(5/20))+(temp*(7/12)))+
                ' L'+(width*(3/16))+' '+((height*(5/20))+temp*(5/12))+' L'+(width*(3/16)+temp/4)+' '+((height*(5/20))+temp*(5/12))+
                ' L'+((width*(3/16))+temp/4)+' '+((height*(5/20))+temp/4)).attr(imgAttr);

    this.createHandlers(tRot90Coll.push(tRot90, tRot90Img), 6);


/* TODO: WOrking on this upside-down T:
    tRot180 = paper.rect(width/8, (height*(7/20)), width/4, width/4, 0).attr(rectAttr);

    tRot180Img = paper.path('M'+((width*(3/16))+(temp/6))+' '+((height*(7/20))+temp/4)+' L'+((width*(3/16))+(temp/3))+' '+((height*(7/20))+temp/4)+
                ' L'+((width*(3/16))+(temp/3))+' '+((height*(7/20))+temp/2)+' L'+((width*(3/16))+temp/2)+' '+((height*(7/20))+(temp*(1/2)))+
                ' L'+((width*(3/16))+temp/2)+' '+((height*(7/20))+(temp*(3/4)))+' L'+(width*(3/16))+' '+((height*(7/20))+(temp*(3/4)))+
                ' L'+).attr(imgAttr);
*/
}

Options.prototype.createHandlers = function(Coll, val) {
    var defColor = '#6D8383',       // Default color.
        inColor = '#d8d8d8';        // Color for mouseover 

    Coll.attr({
        cursor: 'pointer',
        //title: "Ferdiglaget rektangulært rom",
    }).hover(function () {
        // Set attributes on hover.
        Coll[0].attr('fill', inColor);
    }, function () {
        Coll[0].attr('fill', defColor);

    }).mouseup(function () {
        ourRoom.createRoom(new PreDefRoom(val));
    });
}


/**
 * Function that holds the shapes and wall-lengths of 'predefined' rooms.
**/
function PreDefRoom (value) {

    switch(value) {
        case 0:
            return rectArr = [[180, 270, 360, 90],[300, 200, 300, 200]];                                            //Rectangle-shaped
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
    }
}




