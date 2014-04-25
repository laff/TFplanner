/**
 * Structonator
**/
function Options (tab) {
    this.optPaper;
    this.preDefArr = null;
    this.optionTab = 1;
    this.defColor = '#707061';       // Default color.
    this.inColor = '#d8d8d8';        // Color for mouseover
    this.imgColor = 'white';         // Color for the button-icons.
    this.titleText = null;           // Raphael-element
    this.titleRect = null;
    this.projectName ='Prosjektnavn/tittel'; // String in html input-field

    // Default show.
    this.showOptions(1);

    // Set containing gui elements we want to clear/store?
    this.guiElements = null;

    this.container = '#content_container';
    this.obstHtml = null;
    this.crossO = String.fromCharCode(248);
    this.dotA = String.fromCharCode(229);

    // mat object based on specificatins selected
    this.validMat = null;
    // Will contain mat-lengths the user prefer to start with.
    this.prefMat = null;

    // Variable saved after resultgrid has calculated available area.
    this.availableArea = null;

    // Showing title once options is loaded.
    this.setTitle();
}
/**
 *  Function that calculates the percentage of which the mats utilize the available area.
 *  Adds the values 'availableArea' and 'areaUtilPercentage' as a string to the projectname.
**/
Options.prototype.areaUtilization = function() {
        // decides weither to remove decimals or not.
    var availArea = ((this.availableArea % 1) != 0) ? this.availableArea.toFixed(2) : this.availableArea,
        chosenMats = resultGrid.chosenMats,
        matInfo = this.validMat.products,
        squareMetres = 0,
        areaUtilPercentage = null;

    // goes through mats used and the product info for matching values.
    // adds the meters of the chosen mats.
    for (var j = 0; j < chosenMats.length; j++) {
        
        for (var i = 0; i < matInfo.length; i++) {

            if (chosenMats[j] == matInfo[i].number) {
                squareMetres += (matInfo[i].length / 2);
            }
        }
    }
    
    areaUtilPercentage = ((100 / availArea) * squareMetres).toFixed(1);

    this.projectName += ' '+availArea+'m2 ('+areaUtilPercentage+'% utnyttelse)';

    this.setTitle();

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
 *  Set up the specifications-tab.
**/
Options.prototype.initSpecs = function () {

    // set title position
    this.setTitle();

    var paper = this.optPaper,
        container = this.container,
        specSubmit = 'specSubmit',
        crossO = this.crossO,
        html,
        opts = this;

    // Clear current html
    $(container).html("");

    // Adding class css, and remove the old ones.
    $(container).addClass('specTab');
    $(container).removeClass('obstacleTab');
    $(container).removeClass('roomTab');


    if (ourRoom.finished ==  true) {
        // Variables used for setting up elements.
        var header = document.createElement('h3'),
            inOutDiv = document.createElement('div'),
            inOut = document.createElement('select'),
            form = document.createElement('form'),
            option1 = document.createElement('option'),
            option2 = document.createElement('option'),
            span = document.createElement('span');
        
        header.innerHTML = 'Velg spesifikasjoner';
        span.innerHTML = 'Velg utend'+crossO+'rs/innend'+crossO+'rs: ';

        inOutDiv.id = 'inOutDiv';
        span.id = 'inOrOut';
        form.setAttribute('class', 'forms');
        form.id = 'form1';
        inOut.id = 'inOutType';

        option1.value = 'inside';
        option1.text = 'Inne';
        option2.value = 'outside';
        option2.text = 'Ute';

        inOut.add(option1, null);
        inOut.add(option2, null);

        inOutDiv.appendChild(span);
        inOutDiv.appendChild(inOut);
        $(inOutDiv).append('<br>');

        form.appendChild(inOutDiv);

        $(container).append(header);
        $(container).append(form);

        // Default selected is 'none', so a value MUST be chosen by the user.        
        document.getElementById('inOutType').selectedIndex = -1;
    } else {
        html = '<p class="error"> Du m'+this.dotA+' tegne et rom f'+crossO+'rst! <br></p>';
        $(container).html(html);
    }

    $('#inOutType').change( function () {

        // If #inOutType-id changes, we want to clear ALL the DIVs following it:

        $('#dryWetDiv').remove();
        $('#deckDiv').remove();
        $('#wattDiv').remove();
        $('#castDiv').remove();
        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();
        
        opts.inOrOut(form);
    });
}

/**
 * Functionality for showing dropdown-menu for chosing 'dry- or wet-area'.
 * Will only show this option if 'inside' is chosen on the first dropdown.
**/
Options.prototype.inOrOut = function (form) {

    var container = this.container,     
        selected = $('#inOutType').val(),
        opts = this,
        crossO = this.crossO,
        dotA = this.dotA;

     //Inside is selected
    if (selected == "inside") {
        var dryWetDiv = document.createElement('div'),
            dryWet = document.createElement('select'),
            option1 = document.createElement('option'),
            option2 = document.createElement('option'),
            span = document.createElement('span');

        dryWetDiv.id = 'dryWetDiv';
        dryWet.id = 'climateType';
        span.id = 'dryOrWet';

        span.innerHTML = "Velg v"+dotA+"trom/t"+crossO+"rrom: ";
        option1.value = "dry";
        option1.text = "T"+crossO+"rrom";
        option2.value = "wet";
        option2.text = "V"+dotA+"trom";

        dryWet.add(option1, null);
        dryWet.add(option2, null);

        dryWetDiv.appendChild(span);
        dryWetDiv.appendChild(dryWet);
        $(dryWetDiv).append('<br>');

        form.appendChild(dryWetDiv);
        // Append the form to the container.
        $(container).append(form); 
        document.getElementById('climateType').selectedIndex = -1;

    } else {
        // 'Outside' is chosen, so we jump directly to the options associated with this option.
        opts.chooseDeck(form);
    }

    // Call new function to set up the 'deck'-dropdown on change.
    $('#climateType').change( function () {

        //If this one changes, we want to remove all the divs following it:

        $('#deckDiv').remove();
        $('#wattDiv').remove();
        $('#castDiv').remove();
        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();

        opts.chooseDeck(form);
    });
}

/**
 * The third dropdown-menu, where the user must choose type of deck for the area.
**/
Options.prototype.chooseDeck = function (form) {

    var container = this.container,
        opts = this,
        selected = $('#inOutType').val(),
        selectedClim = $('#climateType').val(),
        deckDiv = document.createElement('div'),
        span = document.createElement('span'),
        deck = document.createElement('select'),
        option1 = document.createElement('option'),
        option2 = document.createElement('option'),
        option3 = document.createElement('option'),
        option4 = document.createElement('option'),
        option5 = document.createElement('option'),
        option6 = document.createElement('option'),
        option7 = document.createElement('option');

    deckDiv.id = 'deckDiv';
    deck.id = 'deckType';
    span.id = 'decks';

    span.innerHTML = "Velg dekke i rommet: ";

    // Do stuff for an indoor-room.
    if (selected == "inside") {
        // Tiles and scale can occur both in dry-rooms and wet-rooms.
        option1.value = "tile";
        option1.text = "Flis";
        option5.value = "scale";
        option5.text = "Belegg";
        // 'Dry-room'
        if (selectedClim == "dry") {
            // List options for 'dry'-rooms.
            option2.value = "carpet";
            option2.text = "Teppe";
            option3.value = "parquet";
            option3.text = "Parkett";
            option4.value = "laminat";
            option4.text = "Laminat";
            option6.value = "concrete";
            option6.text = "Betong";
            option7.value = "cork";
            option7.text = "Kork";

            deck.add(option1, null);
            deck.add(option2, null);
            deck.add(option3, null);
            deck.add(option4, null);
            deck.add(option5, null);
            deck.add(option6, null);
            deck.add(option7, null);

        // This should obviously be a 'wet'-room.
        } else if (selectedClim == "wet") {
            deck.add(option1, null);
            deck.add(option5, null);
        }
    // The area is chosen as 'outside' 
    } else if (selected == "outside") {
        option1.value = "asphalt";
        option1.text = "Asfalt"
        option2.value = "pavblock";
        option2.text = "Belegningsstein";
        option3.value = "concrete";
        option3.text = "St"+this.crossO+"p";

        deck.add(option1, null);
        deck.add(option2, null);
        deck.add(option3, null);
    }

    // Append the element to our form, then add the form to the container.
    deckDiv.appendChild(span);
    deckDiv.appendChild(deck);
    $(deckDiv).append('<br>');

    form.appendChild(deckDiv);
    $(container).append(form);

    // Set as blanc on initialization, to force the user to select an !default item.
    document.getElementById('deckType').selectedIndex = -1;

    // When the user have selected an item in this list, the 'generate'-button is created,
    // unless 'wattage' also has to be selected.
    $('#deckType').change( function () {

        // Cleaning up some html-elements, if they exist:
        $('#wattDiv').remove();
        $('#castDiv').remove();
        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();
        
        // Calling next function, based on selected value.
        (selected == 'inside') ? opts.wattage(form) : opts.generateButton(form);
    });
}

/**
 *  Function that adds a wattage dropdown select list button chooser.
 *
**/
Options.prototype.wattage = function (form) {

    var container = this.container,
        opts = this,
        span = document.createElement('span'),
        watt = document.createElement('select'),
        wattDiv = document.createElement('div'),
        option1 = document.createElement('option'),
        option2 = document.createElement('option'),
        option3 = document.createElement('option'),
        option4 = document.createElement('option');

    wattDiv.id = 'wattDiv';
    watt.id = 'wattage';
    span.id = 'watt';

    span.innerHTML = 'Velg mattens effekt: ';
    option1.value = 60;
    option1.text = '60W';
    option2.value = 100;
    option2.text = '100W';
    option3.value = 130;
    option3.text = '130W';
    option4.value = 160;
    option4.text = '160W';

    watt.add(option1, null);
    watt.add(option2, null);
    watt.add(option3, null);
    watt.add(option4, null);

    // Append the element to our form, then add the form to the container.
    wattDiv.appendChild(span);
    wattDiv.appendChild(watt);
    $(wattDiv).append('<br>');

    form.appendChild(wattDiv);
    $(container).append(form);

    // Set as blanc on initialization, to force the user to select an !default item.
    document.getElementById('wattage').selectedIndex = -1;

    // When the user have selected an item in this list, the 'generate'-button is created.
    $('#wattage').change( function () {

        var deck = $('#deckType').val(),
            watt = $('#wattage').val();

        // The elements that follow #wattage will be removed, before they are added again.
        $('#castDiv').remove();
        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();

        // For one specific option, casting/not casting must be made available.
        if ((deck == 'parquet' || deck == 'laminat') && watt == '60') {
            opts.casting(form);
        } else {
            opts.generateButton(form);
        }
    });
}

/**
 * Functionality that asks the user if casting is to be done for the floor
 * @param form - form of the tab, passed through all the connected functions, 
 * holds the html-structure.
**/
Options.prototype.casting = function (form) {

    var container = this.container,
        opts = this,
        castDiv = document.createElement('div'),
        span = document.createElement('span'),
        cast = document.createElement('select'),
        option1 = document.createElement('option'),
        option2 = document.createElement('option');

    cast.id = 'casting';
    span.id = 'cast';
    castDiv.id = 'castDiv';

    span.innerHTML = 'Skal gulvet avrettes?';
    option1.value = 'nocast';
    option1.text = 'Nei';
    option2.value = 'cast';
    option2.text = 'Ja';

    cast.add(option1, null);
    cast.add(option2, null);

    castDiv.appendChild(span);
    castDiv.appendChild(cast);

    // Append the element to our form, then add the form to the container.
    form.appendChild(castDiv);
    $(container).append(form);
    // Set as blanc on initialization, to force the user to select an !default item.
    document.getElementById('casting').selectedIndex = -1;

    // When the user have selected an item in this list, the 'generate'-button is created.
    $('#casting').change( function () {

        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();

        opts.generateButton(form);
    });
}


/**
 * Creation of a button to generate our solution for putting out a heatingmat.
 * Will be created when an item is chosen in all the dropdowns.
 * @param form - The form is passed "all the way" through the 'specs'-functionality and
 * stuff is appended to it.
**/
Options.prototype.generateButton = function (form) {

    var container = this.container,
        opts = this,
        input = document.createElement('input'),
        inputDiv = document.createElement('div'),
        path,
        createProgresswindow = function(callback) {

            var grayDiv = document.createElement('div'),
                infoDiv = document.createElement('div'),
                information = document.createElement('p');

            grayDiv.id = 'progress';
            infoDiv.id = 'infoprogress';
            information.id = 'progressinformation';

            information.innerHTML = 'Kalkulerer areal';

            infoDiv.appendChild(information);
            

            
            $('#container').append(grayDiv);
            $('#container').append(infoDiv);

            setTimeout(function() {
                callback();
            }, 10);

        };
    inputDiv.id = 'inputDiv';
    input.id = 'genButton';
    input.type = 'button';
    input.title = 'Klikk for '+this.dotA+' generere leggeanvisning';
    input.value = 'Generer leggeanvisning';

    inputDiv.appendChild(input);
    $(inputDiv).append('<br><br><br>');

    form.appendChild(inputDiv);
    $(container).append(form);

    $('#genButton').click( function () {
        
        // If we have a finished room, we can call the algorithm and generate a drawing!
        if (ourRoom.finished == true) {

            createProgresswindow(
                function() {
                    // The functionality beneath is invoked in such an order that the final drawing is display correctly
                    path = grid.moveRoom();
                    resultGrid = new ResultGrid(path);

                    //scrollBox.paper.clear();

                    //grid.gridSet.toFront(); 
                    //resultGrid.displayMats();
                    
                    ourRoom.walls.toFront();

                    measurement.wallText.toFront();
                    grid.boxSet.toFront();
                });
        }
    });

    // When we have chosen all steps and the 'generate-button' is created, we also want
    // to display the possible mats the user prefer to use.
    opts.preferredMats(form);
}

/**
 *  Function that either removes progress or updates it.
 *
**/
Options.prototype.updateProgress = function (remove, resultgrid, success) {

    // removing the progress visual
    if (remove) {
        if (success) {
            this.areaUtilization();
        }
        document.getElementById('progress').remove();
        document.getElementById('infoprogress').remove();

    } else {
        document.getElementById('infoprogress').innerHTML = 'Kalkulerer leggeanvisning';

        // give the javascript breathingroom for gui updates
        setTimeout(function() { resultgrid.calculateGuide(); }, 1);
    }
}

/**
 * This function makes it possible for the user to specify mat-length(s) to start with
 * in the room.
 * @param form - The form is passed "all the way" through the 'specs'-functionality and
 * stuff is appended to it.
**/
Options.prototype.preferredMats = function (form) {

    var opts = this,
        container = opts.container,
        header = document.createElement('h3'),
        span = document.createElement('span'),
        lengths = document.createElement('select'),
        add = document.createElement('input'),
        lengthDiv = document.createElement('div'),
        matDiv = document.createElement('div'),
        ol = document.createElement('ol'),
        text,
        availLengths = [];

    //Finds the correct heatingmat based on specs chosen by the user.
    opts.tfProducts();
    opts.prefMat = [];

    // Setting up the html-stuff.
    span.id = 'length';
    span.innerHTML = 'Legg til selvvalgte lengder';
    matDiv.id = 'matDiv';
    lengthDiv.id = 'lengthDiv';

    lengths.id = 'lengths';
    add.id = 'addLength';
    add.type = 'button';
    add.title = 'Legg til foretrukken mattelengde';
    add.value = 'Legg til matte';

    lengthDiv.appendChild(span);
    lengthDiv.appendChild(lengths);
    lengthDiv.appendChild(add);
    matDiv.appendChild(ol);

    form.appendChild(lengthDiv);
    form.appendChild(matDiv);

    // Add all the available lengths of this mat to the dropdown.
    for (var i = 0; i < opts.validMat.products.length; i++) {
        availLengths[i] = opts.validMat.products[i].length;
        $('#lengths').append("<option value="+i+">"+availLengths[i]+"m</option>"); 
    }

    $(container).append(form);

    // This click-action add the chosen mat-length to array, so that
    // the algorithm will use this mat first.
    $('#addLength').click( function () {

        opts.prefMat.push(opts.validMat.products[$('#lengths').val()]);
        text = opts.prefMat[opts.prefMat.length-1].name;
        $(ol).append('<li>'+text+'</li>');
    });
}


/**
 * Set up 'Obstacles'-tab. This includes possibility to define Projectname and adding obstacles.
**/
Options.prototype.initObstacles = function () {

    var container = this.container,
        html = "",
        crossO = this.crossO;

    // clear current html
    $(container).html(html);

    // adding class css.
    $(container).addClass('obstacleTab');
    $(container).removeClass('specTab');

    if (ourRoom.finished ==  true) {
        // Move the room to coordinates (99, 99), but only if obstacles has not been loaded.
        if (obstacles.supplyPoint == null) {
            grid.moveRoom();
            obstacles.createObstacle("5", "Startpunkt");
        }

        // Add inputfield and button to add a 'projectname'.
        html += '<h3> Sett prosjektnavn </h3>';
        html += '<form class=forms>';
        html += "<div class='inputfield'><input type='text' id='titleText' value="+this.projectName+" autocomplete='off'><br></div>";
        html += "<input id='titleSubmit' type='button' value='Endre prosjektnavn'>";
        html += '</form>';
        /*
        html += '<h3> Sett tilf'+crossO+'rselspunkt </h3>';
        html += '<form class=forms>';
        html += "<input id='supplySubmit' type='button' value='Sett tilf"+crossO+"rselspunkt'>";
        html += '</form>';
        */
        // Header
        html += '<h3> Legg til hindring </h3>';

        // Form start
        html += '<form class=forms>';

        // Select (5 is missing, because same functionality is used for supplyPoint)
        html += "<select id ='obstacleType'><option value=1> Avl"+crossO+"p </option>";
        html += "<option value=2> Toalett </option>";
        html += "<option value=3> Dusj </option>";
        html += "<option value=4> Badekar </option>";
        html += "<option value=6> Benk </option>";
        html += "<option value=7> Pipe </option>";
        html += "<option value=8> Egendefinert </option></select>";

        // input button
        html += "<input id='defSubmit' type='button' value='legg til'>";

        // Form end
        html += '</form>';

        this.obstHtml = html;
    } else {
        html = '<p class="error"> Du m'+this.dotA+' tegne et rom f'+crossO+'rst! <br></p>';
        this.obstHtml = html;
    }

    this.obstacleList();

    // set title position
    this.setTitle();
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
        del = 'Slett',
        container = this.container,
        crossO = this.crossO,
        html = this.obstHtml;

    for (var i = 0; i < obstacleLength; i++) {

        // Displaying "hindring" as name of the obstacle if no name is set (only in the html)
        if (obstacleArr[i].data('obstacleType') != "") {

            html += "<div class=obst><div class=obsttxt>"+obstacleArr[i].data('obstacleType')+": </div><input id="+i+" class='change' type='button' value="+change+">"+ 
            "<input class='delete' type='button' value="+del+"></div>";
            html += "<br>";

        } else {
            html += "<div class=obst><div class=obsttxt>Hindring:</div><input id="+i+" class='change' type='button' value="+change+">"+ 
            "<input class='delete' type='button' value="+del+"></div>";
            html += "<br>";
        }

        if (obstacle == i) {
            var width = obstacleArr[i].attrs.width,
                height = obstacleArr[i].attrs.height,
                x = obstacleArr[i].attrs.x,
                y = obstacleArr[i].attrs.y,
                increase = "<input class='plusminus' type='button' name='increase' value='+' />",
                decrease = "<input class='plusminus' type='button' name='decrease' value='-' />";

            // Div start by a line break
            html += "<br>";
            html += "<div id=change class='roomTab'>";
            // Height
            html += "<div class='inputfield'><div class='inputtext'>H"+crossO+"yde: </div>"+decrease+"<input  type='number' id='height' value="+height+">"+increase+"<br></div>";
            // Width
            html += "<div class='inputfield'><div class='inputtext'>Bredde: </div>"+decrease+"<input  type='number' id='width' value="+width+">"+increase+"<br></div>";
            // position x
            html += "<div class='inputfield'><div class='inputtext'>X avstand: </div>"+decrease+"<input type='number' id='posx' value="+(x - 100)+">"+increase+"<br></div>";
            // position y
            html += "<div class='inputfield'><div class='inputtext'>Y avstand: </div>"+decrease+"<input type='number' id='posy' value="+(y - 100)+">"+increase+"</div>";
            
            // Checks if the obstacletType stored equals "Startpunkt" which translates to "supplypoint" in english.
            // Creates checkbox
            if (obstacleArr[i].data('obstacleType') == 'Startpunkt') {
                html += "Kan slutte mot startvegg: <input type='checkbox' id='supplyend'>";
            }

            // Button element.
            html += "<input id=changeObst name="+i+" type='button' value="+save+">";

            // Div end.
            html += "</div>";
        }
    }

    $(container).html("");
    $(container).html(html);

    // Sets the focus on the 'project-name'-field the first time 'obstacles'-tab is selected
    if (ourRoom.finished ==  true && this.titleText == null) {
        this.setTitle();
        var input = document.getElementById('titleText');
            input.focus();
            input.select();
    }

    this.actionListeners();
}

/**
 *  Function that initiates action listeners!
 *
**/
Options.prototype.actionListeners = function () {

    var opts = this;

    // If the 8th option is selected. aka "Egendefinert"
    $('#obstacleType').change(function() {
        
        if (this.value == 8) {

            // Creating elements.
            var parentDiv = document.createElement('div'),
                textDiv = document.createElement('div'),
                input = document.createElement('input');
            
            // Setting properties.
            parentDiv.setAttribute('class', 'inputfield');
            parentDiv.id = 'inputfieldSelf';
            textDiv.setAttribute('class', 'inputtext');
            textDiv.innerHTML = 'Skriv inn navn: ';
            input.type = 'text';
            input.setAttribute('class', 'inputwidth');
            input.setAttribute('id', 'customObstTxt');
            input.setAttribute('autocomplete', 'off');

            // Adding the elements to its parentnode
            parentDiv.appendChild(textDiv);
            parentDiv.appendChild(input);

            // Using Jquery to add the parentDiv after the dropdown list
            $(this.parentNode.firstChild).after(parentDiv);
            // Put focus on, and selects the inputfield for adding a obstacle-name
            input.focus();
            input.select();

            $('#customObstTxt').keypress(function (e) {
                // If 'enter' is pressed in the inputfield:
                if (e.which == 13) {
                    e.preventDefault();

                    var value = document.getElementById('obstacleType').value,
                        text = document.getElementById('customObstTxt').value;

                    // Create the obstacle, and update the tab.
                    obstacles.createObstacle(value, text);
                    opts.initObstacles();
                    opts.obstacleList();
                }
            });
        // We might get some issues if 'egendefinert' is chosen, followed by that the user choose an other
        // obstacle without pushing 'add' between. This will delete the <div> if it exists.
        } else if (document.getElementById('inputfieldSelf') != null) {

            document.getElementById('inputfieldSelf').remove();
        }
    });

    // Add click action for the "submit button".
    $('.change').click(function() {
        opts.obstacleList(this.id);
        obstacles.selectObstacle(this.id);
    });

    $('.delete').click(function () {
        obstacles.deleteObstacle(this.parentNode.firstChild.nextSibling.id);
        opts.obstacleList();
    });

    // Add click action for the "submit button".
    $('#defSubmit').click(function() {
        
        // Creating obstacle.
        var value = $('#obstacleType').val(),
            customTxt = $('#customObstTxt').val(),
            text = (customTxt != null) ? customTxt : $('#obstacleType option[value='+value+']').text();

        obstacles.createObstacle(value, text);

        // Creating / refreshing list of obstacles.
        opts.initObstacles();
        opts.obstacleList();
    });


    // Add click action for the "changeObst-button".
    $('#changeObst').click(function() {
        // Rounding the values to nearest 10.
        var roundX = (Math.round((($('#posx').val())/ 10)) * 10) + 100,
            roundY = (Math.round((($('#posy').val())/ 10)) * 10) + 100,
            roundW = (Math.round((($('#width').val())/ 10)) * 10),
            roundH = (Math.round((($('#height').val())/ 10)) * 10),
            supply = document.getElementById('supplyend');

        // stores the users choice on the matter of ending the mats at the supplywall or not.
        if (supply) {
            obstacles.supplyEnd = !supply.checked;
        }
        

        $('#posx').val((roundX - 100));
        $('#posy').val((roundY - 100));

        obstacles.adjustSize(
            this.name, 
            roundW,
            roundH,
            roundX, 
            roundY
        );

        opts.obstacleList();

        obstacles.selectObstacle(null);
    });

    // Action for the plus and minus buttons
    $('.plusminus').click(function () {

        var inputEle = this.parentNode.firstChild.nextSibling.nextSibling,
            inputVal = parseInt(inputEle.value),
            intention = this.value,
            changed = matIt[intention](inputVal, 10),
            changed = (changed < 0) ? 0 : changed;

        inputEle.value = changed;
    });

    // Action for the button to create a title on the paper.
    $('#titleSubmit').click(function () {

        opts.setTitle();
    });

    // Prevent the default 'submit form' when enter-button is pressed(this refreshes the page),
    // but apply the input-text to the title.
    $('#titleText').keypress(function (e) {

        if (e.which == 13) {
            e.preventDefault();
            this.blur();
            opts.setTitle();
        }
    });
/*
    $('#supplySubmit').click(function () {
        obstacles.createObstacle("5", "Startpunkt");
    });
*/
}

/**
 * Functionality that displays the 'projectname' that the user has entered on our paper.
 * Since it`s added as an svg-element, this will also be visible when the image is saved.
**/
Options.prototype.setTitle = function () {

    // Get the text from the html-element, and update it.
    var titleEle = document.getElementById('titleText'),
        title = (titleEle != null) ? titleEle.value : this.projectName;


    this.projectName = title;
    
    var drawWidth = (grid.resWidth + 201),
        rectX = null,
        rectY = 30,
        rectLen = null,
        textX = (drawWidth / 2),
        textY = 42;


    // Clear the title-element if it already exist.
    this.titleText != null ? this.titleText.remove() : null;
    this.titleRect != null ? this.titleRect.remove() : null;           


    this.titleText = grid.paper.text(textX, textY, title).attr({
        'font-size': 20,
        'font-family': 'verdana',
        'font-style': 'oblique'
    });

    // Dynamic size of the rectangle surrounding the text.
    rectLen = (this.titleText.getBBox().width + 30);
    rectX = (textX - (rectLen / 2));

    this.titleRect = grid.paper.rect(rectX, rectY, rectLen, 30, 5, 5).attr({
        opacity: 1,
        fill: "white"
    });

    this.setupTitle();
}

/**
 *  This function shows title and its rectangle in the right order.
 *  It is called within options.setTitle and grid.setupPaper
**/
Options.prototype.setupTitle = function() {
    if (this.titleRect != null && this.titleText != null) {
        this.titleRect.toFront();
        this.titleText.toFront();
    }
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
        html = "";

    // Removing the svg paper and adding room class for background color
    this.optPaper.remove();

    $(container).addClass('roomTab');
    $(container).removeClass('obstacleTab');

    html += '<h3> Egendefiner m'+this.dotA+'l </h3>';

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

        // Goes through the input elements and stores the length
        for (var i = 0; i < wallsLength; i++) {
            preDefArr[1][i] = $('#wall'+i).val();
        }

        finishedRoom.selectWall();
        ourRoom.createRoom(preDefArr);
    });


    /**
     * Functionality that signals what wall that is selected when typing into the input field.
    **/
    $('.inputt').mousedown(function() {

        var child = $(this).children(),
            // Sort out id of input field (should be same as wall id).
            id = (child[0] != null) ? child[0].id : child.context.id;

        // Get wall ID.
        id = id.slice(-1);

        // If the last wall-index is targeted we unselect.
        id != wallsLength ? finishedRoom.selectWall(id) : finishedRoom.selectWall(null);
    });

    
    // Pretty much the same as previous function, but this one handles 'keydown' in the inputfield
    $('.inputt').keydown(function (e) {

        // Handling actions when 'Tab' is pressed in the input-field(s).
        if (e.keyCode == 9) { 

            var child = $(this).children(),
            id = (child[0] != null) ? child[0].id : child.context.id;

            // Get wall ID, and add increment with 1, since we tabbed from the previous wall.
            id = id.slice(-1);
            id++;

            // If the last wall-index is targeted when tab is pressed, we unselect.
            id != wallsLength ? finishedRoom.selectWall(id) : finishedRoom.selectWall(null);
        } 
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
        drawColl = paper.set(),        
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
        helpColl = paper.set(),
        rectAttr = {                // Attributes for the "background-square" of buttons.
            fill: this.defColor, 
            stroke: this.defColor, 
            'stroke-width': 1, 
        },
        imgAttr = {                 // Attributes for the "image" on each button.
            fill: this.imgColor,
            stroke: 'black',
            'stroke-width': 1,
        },
        txtAttr = {
            'font-size': 18,
            'font-weight': 'bold'
        },


    /**
     *  All buttons is created the same way, with a square behind a illustration of the room-shape.
     *  here are some common variables for positioning:
    **/ 

    // each "column" has its own x variable.
    x0 = (width / 2.665),
    x1 = (width / 8),
    x2 = (width * (5 / 8)),
    x3 = (width / 2),

    // Each row has its own y variable.
    y0 = (height * (4 / 20)),
    y1 = (height * (5 / 20)),
    y2 = (height * (9 / 20)),
    y3 = (height * (10 / 20)),
    y4 = (height * (12 / 20)),
    y5 = (height * (14 / 20)),
    y6 = (height * (16 / 20)),
    y7 = (height * (18 / 20)),
    
    // Basically different offsets and points
    w = (width / 4),
    offset1 = (w / 4),
    offset2 = (w / 2),
    offset3 = (3 / 4),
    offset4 = (w / 3),
    offset5 = (w / 6),
    offset6 = (w * (7 / 12)),
    offset7 = (w * (5 / 12)),
    offset8 = (w / 2),
    p0 = (width * (7 / 16)),
    p1 = (width * (3 / 16)),
    p2 = (width * (11 / 16)),

    // CUSTOM DRAW
    // Header
    drawTxt = paper.text(x3, y0, "Tegn selv").attr(txtAttr),

    // Button
    drawRect = paper.rect(x0, y1, w, w).attr(rectAttr),
    drawImg = paper.path(
                'M'+(p0)+' '+((y1)+offset1)+
                ' L'+((p0)+offset2)+' '+((y1)+(w*offset3))+
                ' L'+(p0)+' '+((y1)+(w*offset3))+
                ' L'+(p0)+' '+((y1)+offset1)
            ).attr(imgAttr),

    // PREDEFINED DRAW
    // Header
    tabTxt = paper.text(x3, y2, "Ferdiglagde rom").attr(txtAttr),

    // FIRST ROW of buttons
    buttonRect = paper.rect(x1, y3, w, w).attr(rectAttr),
    rectImg = paper.rect(p1, (y3+offset1), offset2, offset2).attr(imgAttr),

    buttonL = paper.rect(x2, y3, w, w).attr(rectAttr),
    lImg = paper.path(
                'M'+p2+' '+(y3+offset1)+
                ' L'+(p2+offset1)+' '+(y3+offset1)+
                ' L'+(p2+offset1)+' '+(y3+offset2)+
                ' L'+(p2+offset2)+' '+(y3+offset2)+
                ' L'+(p2+offset2)+' '+(y3+(w*offset3))+
                ' L'+p2+' '+(y3+(w*offset3))+
                ' L'+p2+' '+(y3+offset1)
            ).attr(imgAttr),


    // SECOND ROW
    buttonT = paper.rect(x1, y4, w, w).attr(rectAttr),
    tImg = paper.path(
                'M'+p1+' '+(y4+offset1)+
                'L'+(p1+offset2)+' '+(y4+offset1)+
                ' L'+(p1+offset2)+' '+(y4+offset2)+
                ' L'+(p1+offset4)+' '+(y4+offset2)+
                ' L'+(p1+offset4)+' '+(y4+(w*offset3))+
                ' L'+(p1+offset5)+' '+(y4+(w*offset3))+
                ' L'+(p1+offset5)+' '+(y4+offset2)+
                ' L'+p1+' '+(y4+offset2)+
                ' L'+p1+' '+(y4+offset1)
            ).attr(imgAttr),

    lInv = paper.rect(x2, y4, w, w).attr(rectAttr),
    lInvImg = paper.path(
                'M'+(p2+offset1)+' '+(y4+offset1)+
                ' L'+(p2+offset2)+' '+(y4+offset1)+
                ' L'+(p2+offset2)+' '+(y4+(w*offset3))+
                ' L'+p2+' '+(y4+(w*offset3))+
                ' L'+p2+' '+(y4+offset2)+
                ' L'+(p2+offset1)+' '+(y4+offset2)+
                ' L'+(p2+offset1)+' '+(y4+offset1)
            ).attr(imgAttr),

    // THIRD ROW!
    tRot90 = paper.rect(x1, y5, w, w).attr(rectAttr),
    tRot90Img = paper.path(
                'M'+(p1+offset1)+' '+(y5+offset1)+
                ' L'+(p1+offset2)+' '+(y5+offset1)+
                ' L'+(p1+offset2)+' '+(y5+(w*offset3))+
                ' L'+(p1+offset1)+' '+(y5+(w*offset3))+
                ' L'+(p1+offset1)+' '+(y5+offset6)+
                ' L'+p1+' '+(y5+offset6)+
                ' L'+p1+' '+(y5+offset7)+
                ' L'+(p1+offset1)+' '+(y5+offset7)+
                ' L'+(p1+offset1)+' '+(y5+offset1)
            ).attr(imgAttr),

    lRot180 = paper.rect(x2, y5, w, w).attr(rectAttr),
    lRot180Img = paper.path(
                'M'+p2+' '+(y5+offset1)+
                ' L'+(p2+offset2)+' '+(y5+offset1)+
                ' L'+(p2+offset2)+' '+(y5+(w*offset3))+
                ' L'+(p2+offset1)+' '+(y5+(w*offset3))+
                ' L'+(p2+offset1)+' '+(y5+offset2)+
                ' L'+p2+' '+(y5+offset2)+
                ' L'+p2+' '+(y5+offset1)
            ).attr(imgAttr),


    // FOURTH ROW!
    lRot270 = paper.rect(x2, y6, w, w).attr(rectAttr),
    lRot270Img = paper.path(
                'M'+p2+' '+(y6+offset1)+
                ' L'+(p2+offset2)+' '+(y6+offset1)+
                ' L'+(p2+offset2)+' '+(y6+offset2)+
                ' L'+(p2+offset1)+' '+(y6+offset2)+
                ' L'+(p2+offset1)+' '+(y6+(w*offset3))+
                ' L'+p2+' '+(y6+(w*offset3))+
                ' L'+p2+' '+(y6+offset1)
            ).attr(imgAttr),

    
    tRot180 =  paper.rect(x1, y6, w, w).attr(rectAttr),
    tRot180Img = paper.path(
                'M'+(p1+offset5)+' '+(y6+offset1)+
                ' L'+(p1+offset4)+' '+(y6+offset1)+
                ' L'+(p1+offset4)+' '+(y6+offset2)+
                ' L'+(p1+offset2)+' '+(y6+offset8)+
                ' L'+(p1+offset2)+' '+(y6+(w*offset3))+
                ' L'+p1+' '+(y6+(w*offset3))+
                ' L'+p1+' '+(y6+offset8)+
                ' L'+(p1+offset5)+' '+(y6+offset8)+
                ' L'+(p1+offset5)+' '+(y6+offset1)
            ).attr(imgAttr),


    // FIFTH ROW!
    tRot270 = paper.rect(x1, y7, w, w).attr(rectAttr),
    tRot270Img = paper.path(
                'M'+p1+' '+(y7+offset1)+
                ' L'+(p1+offset1)+' '+(y7+offset1)+
                ' L'+(p1+offset1)+' '+(y7+offset7)+
                ' L'+(p1+offset2)+' '+(y7+offset7)+
                ' L'+(p1+offset2)+' '+(y7+offset6)+
                ' L'+(p1+offset1)+' '+(y7+offset6)+
                ' L'+(p1+offset1)+' '+(y7+(w*offset3))+
                ' L'+p1+' '+(y7+(w*offset3))+
                ' L'+p1+' '+(y7+offset1)
            ).attr(imgAttr),

    
    buttonU = paper.rect(x2, y7, w, w).attr(rectAttr),
    uImg = paper.path(
                'M'+p2+' '+(y7+offset1)+
                ' L'+(p2+offset5)+' '+(y7+offset1)+
                ' L'+(p2+offset5)+' '+(y7+offset2)+
                ' L'+(p2+offset4)+' '+(y7+offset2)+
                ' L'+(p2+offset4)+' '+(y7+offset1)+
                ' L'+(p2+offset2)+' '+(y7+offset1)+
                ' L'+(p2+offset2)+' '+(y7+(w*offset3))+
                ' L'+p2+' '+(y7+(w*offset3))+
                ' L'+p2+' '+(y7+offset1)
            ).attr(imgAttr);

    // Set backgroundcolor of the options-container canvas.
    paper.canvas.style.backgroundColor = '#CBC4BC';

    // Create handlers and stuff for all the 'buttons'.
    this.createHandlers(drawColl.push(drawRect, drawImg), null, "Tegn selv!");
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

        if (val != null) {
            ourRoom.createRoom(options.preDefRoom(val));
        } else {
            if (finishedRoom == null) {
                ourRoom.initRoom();
            }
        }
    });
}


/**
 * Function that holds the shapes and wall-lengths of 'predefined' rooms.
 * All drawing will be done clockwise and will follow the angle-axis predefined. 
 * (180 is straight to the right, 270 is downwards etc.).
 * The first array contain the angles, and the second array contain the length of the wall.
 * @param value - A number from the function that calls this one, defines what room is to be returned.
**/
Options.prototype.preDefRoom = function (value) {

    switch(value) {
        case 0:
            return rectArr = [[180, 270, 360, 90],[600, 400, 600, 400]];                                            //Rectangle-shaped
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


/**
 * Function that get the value from all dropdowns in the Specifications-tab
 * and find the corresponding product that fit the chosen values.
**/
Options.prototype.tfProducts = function () {

    var area = $('#inOutType').val(),
        climate = $('#climateType').val(),
        deck = $('#deckType').val(),
        watt = $('#wattage').val(),
        cast = $('#casting').val(),

        mats = [
        {
            name: 'TFP',
            areas: {
                inside: true
            },

            climates: {
                dry: true
            },

            decks: {
                parquet: true,
                laminat: true
            },

            wattage: {
                '60': true
            },

           casting: {
                nocast: true
            },         

            products: [
                {
                    length: 2,
                    number: 1001131,
                    name: 'TFP60W/1,0m2 0,5x2m 60W'
                }, {
                    length: 4, 
                    number: 1001132,
                    name: 'TFP60W/2,0m2 0,5x4m 120W'
                }, {
                    length: 6, 
                    number: 1001133,
                    name: 'TFP60W/3,0m2 0,5x6m 180W'
                }, {
                    length: 8, 
                    number: 1001134,
                    name: 'TFP60W/4,0m2 0,5x8m 240W'
                }, {
                    length: 10, 
                    number: 1001135,
                    name: 'TFP60W/5,0m2 0,5x10m 300W'
                }, {
                    length: 12, 
                    number: 1001136,
                    name: 'TFP60W/6,0m2 0,5x12m 360W'
                }, {
                    length: 14, 
                    number: 1001137,
                    name: 'TFP60W/7,0m2 0,5x14m 420W'
                }, {
                    length: 16, 
                    number: 1001138,
                    name: 'TFP60W/8,0m2 0,5x16m 480W'
                }, {
                    length: 18, 
                    number: 1001139,
                    name: 'TFP60W/9,0m2 0,5x18m 540W'
                }, {
                    length: 20, 
                    number: 1001140,
                    name: 'TFP60W/10,0m2 0,5x20m 600W'
                }, {
                    length: 24, 
                    number: 1001142,
                    name: 'TFP60W/12,0m2 0,5x24m 720W'
                }
            ]
        }, {
            name: 'TFU',
            areas: {
                outside: true
            },
            // Might be ugly to set undefined as 'true', but climate will not be defined if area is outside, so
            // it works.
            climates: {
                undefined: true
            },

            decks: {
                asphalt: true
            },

            wattage: {
                undefined: true
            },

           casting: {
                undefined: true
            },  

            products: [
                {
                    length: 2,
                    number: 1001151,
                    name: 'TFU230V 300W/1m2 - 300W'
                }, {
                    length: 4, 
                    number: 1001152,
                    name: 'TFU230V 300W/2m2 - 600W'
                }, {
                    length: 6, 
                    number: 1001153,
                    name: 'TFU230V 300W/3m2 - 900W'
                }, {
                    length: 8, 
                    number: 1001154,
                    name: 'TFU230V 300W/4m2 - 1200W'
                }, {
                    length: 10, 
                    number: 1001155,
                    name: 'TFU230V 300W/5m2 - 1500W'
                }, {
                    length: 12, 
                    number: 1001156,
                    name: 'TFU230V 300W/6m2 - 1800W'
                }, {
                    length: 14, 
                    number: 1001157,
                    name: 'TFU230V 300W/7m2 - 2100W'
                }, {
                    length: 16, 
                    number: 1001158,
                    name: 'TFU230V 300W/8m2 - 2400W'
                }, {
                    length: 20, 
                    number: 1001160,
                    name: 'TFU230V 300W/10m2 - 3000W'
                }, {
                    length: 24, 
                    number: 1001162,
                    name: 'TFU230V 300W/12m2 - 3600W'
                }, {
                    length: 28, 
                    number: 1001164,
                    name: 'TFU230V 300W/14m2 - 4200W'
                }
            ]
        }, {
            name: 'SVK/TFU',
            areas: {
                outside: true
            },

            climates: {
                undefined: true
            },

            decks: {
                pavblock: true,
                concrete: true
            },

            wattage: {
                undefined: true
            },

            casting: {
                undefined: true
            },

            products: [
                {
                    length: 2,
                    number: 1001151,
                    name: 'TFU230V 300W/1m2 - 300W'
                }, {
                    length: 4, 
                    number: 1001152,
                    name: 'TFU230V 300W/2m2 - 600W'
                }, {
                    length: 6, 
                    number: 1001153,
                    name: 'TFU230V 300W/3m2 - 900W'
                }, {
                    length: 8, 
                    number: 1001154,
                    name: 'TFU230V 300W/4m2 - 1200W'
                }, {
                    length: 10, 
                    number: 1001155,
                    name: 'TFU230V 300W/5m2 - 1500W'
                }, {
                    length: 12, 
                    number: 1001156,
                    name: 'TFU230V 300W/6m2 - 1800W'
                }, {
                    length: 14, 
                    number: 1001157,
                    name: 'TFU230V 300W/7m2 - 2100W'
                }, {
                    length: 16, 
                    number: 1011638,
                    name: 'TFSVK MATTE 2400W'
                }, {
                    length: 20, 
                    number: 1011640,
                    name: 'TFSVK MATTE 3000W'
                }, {
                    length: 24, 
                    number: 1011642,
                    name: 'TFSVK MATTE 3600W'
                }
            ]
        }, {
            name: 'TF STICKY MAT 60W',
            areas: {
                inside: true
            },

            climates: {
                dry: true,
                wet: true
            },

            decks: {
                tile: true,
                parquet: true,
                laminat: true,
                carpet: true,
                cork: true,
                scale: true,
                concrete: true
            },

            wattage: {
                '60': true,
                undefined: true
            },

            casting: {
                cast: true,
                undefined: true
            },

            products: [
                { 
                    length: 6,
                    number: 1011503,
                    name: 'TF Sticky Mat 60W/3m2 - 180W'
                }, {
                    length: 8, 
                    number: 1011504,
                    name: 'TF Sticky Mat 60W/4m2 - 240W'
                }, {
                    length: 10, 
                    number: 1011505,
                    name: 'TF Sticky Mat 60W/5m2 - 300W'
                }, {
                    length: 12, 
                    number: 1011506,
                    name: 'TF Sticky Mat 60W/6m2 - 360W'
                }, {
                    length: 14, 
                    number: 1011507,
                    name: 'TF Sticky Mat 60W/7m2 - 420W'
                }, {
                    length: 16, 
                    number: 1011508,
                    name: 'TF Sticky Mat 60W/8m2 - 480W'
                }, {
                    length: 18, 
                    number: 1011509,
                    name: 'TF Sticky Mat 60W/9m2 - 540W'
                }, {
                    length: 20, 
                    number: 1011510,
                    name: 'TF Sticky Mat 60W/10m2 - 600W'
                }, {
                    length: 24, 
                    number: 1011512,
                    name: 'TF Sticky Mat 60W/12m2 - 720W'
                }
            ]
        }, {
            name: 'TF STICKY MAT 100W',
            areas: {
                inside: true
            },

            climates: {
                dry: true,
                wet: true
            },

            decks: {
                tile: true,
                parquet: true,
                laminat: true,
                carpet: true,
                cork: true,
                scale: true,
                concrete: true
            },

            wattage: {
                '100': true,
                undefined: true
            },

            casting: {
                undefined: true
            },

            products: [
                { 
                    length: 6,
                    number: 1011513,
                    name: 'TF Sticky Mat 100W/3m2 - 300W'
                }, {
                    length: 8, 
                    number: 1011514,
                    name: 'TF Sticky Mat 100W/4m2 - 400W'
                }, {
                    length: 10, 
                    number: 1011515,
                    name: 'TF Sticky Mat 100W/5m2 - 500W'
                }, {
                    length: 12, 
                    number: 1011516,
                    name: 'TF Sticky Mat 100W/6m2 - 600W'
                }, {
                    length: 14, 
                    number: 1011517,
                    name: 'TF Sticky Mat 100W/7m2 - 700W'
                }, {
                    length: 16, 
                    number: 1011518,
                    name: 'TF Sticky Mat 100W/8m2 - 800W'
                }, {
                    length: 18, 
                    number: 1011519,
                    name: 'TF Sticky Mat 100W/9m2 - 900W'
                }, {
                    length: 20, 
                    number: 1011520,
                    name: 'TF Sticky Mat 100W/10m2 - 1000W'
                }, {
                    length: 24, 
                    number: 1011522,
                    name: 'TF Sticky Mat 100W/12m2 - 1200W'
                }
            ]
        }, {
            name: 'TF STICKY MAT 130W',
            areas: {
                inside: true
            },

            climates: {
                dry: true,
                wet: true
            },

            decks: {
                tile: true,
                parquet: true,
                laminat: true,
                carpet: true,
                cork: true,
                scale: true,
                concrete: true
            },

            wattage: {
                '130': true,
                undefined: true
            },

            casting: {
                undefined: true
            },

            products: [
                { 
                    length: 6,
                    number: 1011523,
                    name: 'TF Sticky Mat 130W/3m2 - 390W'
                }, {
                    length: 8, 
                    number: 1011524,
                    name: 'TF Sticky Mat 130W/4m2 - 520W'
                }, {
                    length: 10, 
                    number: 1011525,
                    name: 'TF Sticky Mat 130W/5m2 - 650W'
                }, {
                    length: 12, 
                    number: 1011526,
                    name: 'TF Sticky Mat 130W/6m2 - 780W'
                }, {
                    length: 14, 
                    number: 1011527,
                    name: 'TF Sticky Mat 130W/7m2 - 910W'
                }, {
                    length: 16, 
                    number: 1011528,
                    name: 'TF Sticky Mat 130W/8m2 - 1040W'
                }, {
                    length: 18, 
                    number: 1011529,
                    name: 'TF Sticky Mat 130W/9m2 - 1170W'
                }, {
                    length: 20, 
                    number: 1011550,
                    name: 'TF Sticky Mat 130W/10m2 - 1300W'
                }, {
                    length: 24, 
                    number: 1011552,
                    name: 'TF Sticky Mat 130W/12m2 - 1560W'
                }
            ]
        }, {
            name: 'TF STICKY MAT 160W',
            areas: {
                inside: true
            },

            climates: {
                dry: true,
                wet: true
            },

            decks: {
                tile: true,
                parquet: true,
                laminat: true,
                carpet: true,
                cork: true,
                scale: true,
                concrete: true
            },

            wattage: {
                '160': true,
                undefined: true
            },

            casting: {
                undefined: true
            },

            products: [
                { 
                    length: 2,
                    number: 1011530,
                    name: 'TF Sticky Mat 160W/1m2 - 160W'
                }, {
                    length: 3, 
                    number: 1011531,
                    name: 'TF Sticky Mat 160W/1,5m2 - 240W'
                }, {
                    length: 4, 
                    number: 1011532,
                    name: 'TF Sticky Mat 160W/2m2 - 320W'
                }, {
                    length: 5, 
                    number: 1011533,
                    name: 'TF Sticky Mat 160W/2,5m2 - 400W'
                }, {
                    length: 6, 
                    number: 1011534,
                    name: 'TF Sticky Mat 160W/3m2 - 480W'
                }, {
                    length: 7, 
                    number: 1011535,
                    name: 'TF Sticky Mat 160W/3,5m2 - 560W'
                }, {
                    length: 8, 
                    number: 1011536,
                    name: 'TF Sticky Mat 160W/4m2 - 640W'
                }, {
                    length: 9, 
                    number: 1011537,
                    name: 'TF Sticky Mat 160W/4,5m2 - 720W'
                }, {
                    length: 10, 
                    number: 1011538,
                    name: 'TF Sticky Mat 160W/5m2 - 800W'
                }, {
                    length: 12, 
                    number: 1011540,
                    name: 'TF Sticky Mat 160W/6m2 - 960W'
                }, {
                    length: 14, 
                    number: 1011542,
                    name: 'TF Sticky Mat 160W/7m2 - 1120W'
                }, {
                    length: 16, 
                    number: 1011544,
                    name: 'TF Sticky Mat 160W/8m2 - 1280W'
                }, {
                    length: 18, 
                    number: 1011546,
                    name: 'TF Sticky Mat 160W/9m2 - 1440W'
                }
            ]
        },
    ];

    var i = mats.length;
    while (i--) {
        if (mats[i].areas[area] && mats[i].climates[climate] && mats[i].decks[deck] && mats[i].wattage[watt] && mats[i].casting[cast]) {

            this.validMat = mats[i];
            console.log(mats[i].name);

        }
    }
}

/**
 *  Magic math function
 *  sauce: http://stackoverflow.com/questions/13077923/how-can-i-convert-a-string-into-a-math-operator-in-javascript
**/
var matIt = {
    '+': function (x, y) { return x + y },
    '-': function (x, y) { return x - y }
};
