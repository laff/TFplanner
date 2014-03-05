

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
    this.optPaper.setSize(null,"100%");

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
**/
Options.prototype.initDraw = function () {
        var paper = this.optPaper,             
            tabTxt,
            rectColl = paper.set(),
            tColl = paper.set(),
            lColl = paper.set(),
            buttonT, tImg,
            buttonRect, rectImg,
            buttonL, lImg,
            angleArr = [];



    // Set backgroundcolor of the options-container canvas.
    paper.canvas.style.backgroundColor = '#D6D6D6';
/*
    // Create the button used when creating a predefined rectangular room.
    buttonRect = paper.rect(12, 15, 65, 35, 0).attr({
        fill: '#6d8383',
        stroke: '#3B4449',
        'stroke-width': 1,
        title: "Auto-create a rectangular room"
    });
    // Drawing a rectangle on the button.
    rectImg = paper.rect(25, 23, 40, 20, 0).attr({
        fill: '#fafdd5',
        stroke: 'black',
        'stroke-width': 1,
        title: "Auto-create a rectangular room"
    });
*/

        //Head-text on top of the buttons:
    tabTxt = paper.text(paper.width/2, 10, "Ferdiglagde rom").attr({
        'font-size': 14
    })


        // Create the button used when creating a predefined rectangular room.
    buttonRect = paper.rect(20, 25, 65, 35, 0).attr({
        fill: '#6d8383',
        stroke: '#3B4449',
        'stroke-width': 1,
        title: "Auto-create a rectangular room"
    });
    // Drawing a rectangle on the button.
    rectImg = paper.rect(33, 31, 40, 23, 0).attr({
        fill: '#fafdd5',
        stroke: 'black',
        'stroke-width': 1,
        title: "Auto-create a rectangular room"
    });

    // Adds the rectangle-button to a set, and add mousehandlers to the button.
    rectColl.push(buttonRect, rectImg);

    rectColl.attr({
        cursor: 'pointer',
    }).mouseover(function(e) {
        buttonRect.attr('fill', '#d8d8d8');

    }).mouseout(function(e) {
        buttonRect.attr('fill', '#6d8383');

    }).mouseup(function(e) {
        angleArr = new PreDefRoom(0);
        ourRoom.createRoom(angleArr);
    });

/*
    buttonT = paper.rect(12, 55, 65, 35, 0).attr({
        fill: '#6d8383',
        stroke: '#3B4449',
        'stroke-width': 1,
        title: "Auto-create a T-shaped room"
    });
    // Drawing a T on the button.
    tImg = paper.path('M 25 60 L 65 60 L 65 70 L 50 70 L 50 85 L 40 85 L 40 70 L 25 70 L 25 60').attr({
        fill: '#fafdd5',
        stroke: 'black',
        'stroke-width': 1,
        title: "Auto-create a T-shaped room"
    });
*/

    buttonT = paper.rect(20, 65, 65, 35, 0).attr({
        fill: '#6D8383',
        stroke: '#3B4449',
        'stroke-width': 1,
        title: "Auto-create a T-shaped room"
    });
        // Drawing a T on the button.
        tImg = paper.path('M 33 72 L 73 72 L 73 83 L 60 83 L 60 95 L 46 95 L 46 83 L 33 83 L 33 72').attr({
        fill: '#FAFDD5',
        stroke: 'black',
        'stroke-width': 1,
        title: "Auto-create a T-shaped room"
    });


    // Adds the T-button-stuff to a set, and then create the mousehandlers for it!
    tColl.push(buttonT, tImg);

    tColl.attr({
        cursor: 'pointer',
    }).mouseover(function(e) {
        buttonT.attr('fill', '#d8d8d8');

    }).mouseout(function(e) {
        buttonT.attr('fill', '#6d8383');

    }).mouseup(function(e) {
        angleArr = new PreDefRoom(2);
        ourRoom.createRoom(angleArr);
    });

    buttonL = paper.rect(115, 25, 65, 35, 0).attr({
        fill: '#6D8383',
        stroke: '#3B4449',
        'stroke-width': 1,
        title: "Auto-create a L-shaped room"
    });

    lImg = paper.path('M 130 31 L 147 31 L 147 44 L 165 44 L 165 56 L 130 56 L 130 31').attr({
        fill: '#FAFDD5',
        stroke: 'black',
        'stroke-width': 1,
        title: "Auto-create a L-shaped room"
    });

    lColl.push(buttonL, lImg);

    lColl.attr({
        cursor: 'pointer',
    }).mouseover(function(e) {
        buttonL.attr('fill', '#D8D8D8');
    }).mouseout(function(e) {
        buttonL.attr('fill', '#6D8383');
    }).mouseup(function(e) {
        angleArr = new PreDefRoom(1);
        ourRoom.createRoom(angleArr);
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
            return lArr = [[180, 270, 180, 270, 360, 90],[200, 150, 200, 150, 400, 300]];                           //L-shaped
        case 2:
            return tArr = [[180, 270, 360, 270, 360, 90, 360, 90],[450, 150, 150, 250, 150, 250, 150, 150]];        //T-shaped
        case 3:
            return lRot90 = [[180, 270, 360, 270, 360, 90],[400, 150, 200, 150, 200, 300]];                         //L-shape rotated 90 degrees.
        case 4:
            return lRot180 = [[180, 270, 360, 90, 360, 90], [400, 350, 200, 200, 200, 150]];                        //L-shape rotated 180 degrees.
        case 5:
            return lRot270 = [[180, 270, 360, 90, 180, 90],[200, 300, 400, 150, 200, 150]];                         //L-shape rotated 270 degrees.
        case 6:
            return tRot90 = [[180, 270, 360, 90, 360, 90, 180, 90], [150, 450, 150, 150, 250, 150, 250, 150,]];     //T-shape rotated 90 degrees.
        case 7:
            return tRot180 = [[180, 270, 180, 270, 360, 90, 180, 90], [150, 250, 150, 150, 450, 150, 150, 250]];    //T-shape rotated 180 degrees.
        case 8:
            return tRot270 = [[180, 270, 180, 270, 360, 270, 360, 90], [150, 150, 250, 150, 250, 150, 150, 450]];   //T-shape rotated 270 degrees.
    }
}



