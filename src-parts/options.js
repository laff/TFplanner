/**
 * @class Setting up content for the tabs on the 
 * lefthand-side of the page.
**/
function Options() {
    this.optPaper;
    // Default show.
    this.showOptions(1);
    // Showing title once options is loaded.
    this.setTitle();
}

Options.prototype.preDefArr = null;
Options.prototype.optionTab = 1;
// Default color
Options.prototype.defColor = '#707061';
// Color for mouseover
Options.prototype.inColor = '#d8d8d8';
// Color for the button-icons
Options.prototype.imgColor = 'white';
// Raphael-element for displaying title
Options.prototype.titleText = null; 
Options.prototype.areaText = null;
Options.prototype.titleRect = null;
Options.prototype.projectName ='Prosjektnavn/tittel';
Options.prototype.container = '#content_container';
Options.prototype.obstHtml = null;
Options.prototype.crossO = String.fromCharCode(248);
Options.prototype.dotA = String.fromCharCode(229);
// Mat-object based on specifications selected
Options.prototype.validMat = null;
// Will contain mat-lengths the user prefer to start with
Options.prototype.prefMat = null;
// Variable saved after resultgrid has calculated available area
Options.prototype.availableArea = null;
// String storing area and utilized percentage of area
Options.prototype.utilizeString = null;

/**
 * Function that control what options to show based on selected tab.
 * @param {int} tab - What tab to show/select
**/
Options.prototype.showOptions = function(tab) {

    var finRoom = TFplanner.finishedRoom;

    this.optionTab = tab;

    // Remove selected wall if any.
    if (finRoom != null && finRoom.selectedWall != null) {
        finRoom.selectedWall.remove();
    }

    $(this.container).empty();

    this.optPaper = (this.optPaper != null) ? this.optPaper.remove() : null;
    this.optPaper = Raphael(document.getElementById('content_container'));

    // Decide which tab to display
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

        // Case 4 is actually "sub options".
        case 4:
            this.initDefine();
            break;

        default:
            return;
    }
};

/**
 * Initialize the specifications-tab, creating
 * elements using JavaScript, add them to the 
 * DOM using jQuery.
**/
Options.prototype.initSpecs = function() {

    // Set title position
    this.setTitle();

    var html,
        opts = this,
        doc = document,
        header,
        inOutDiv,
        inOut,
        form,
        option1,
        option2,
        span;

    // Clear current html
    $(this.container).html("");

    // Adding class css, and remove the old ones.
    $(this.container).addClass('specTab');
    $(this.container).removeClass('obstacleTab');
    $(this.container).removeClass('roomTab');


    if (TFplanner.ourRoom.finished === true) {
        // Variables used for setting up elements, created
        // by using pure JavaScript
        header = doc.createElement('h3');
        inOutDiv = doc.createElement('div');
        inOut = doc.createElement('select');
        form = doc.createElement('form');
        option1 = doc.createElement('option');
        option2 = doc.createElement('option');
        span = doc.createElement('span');
        
        header.textContent = 'Velg spesifikasjoner';
        span.textContent = 'Velg utend'+this.crossO+'rs/innend'+this.crossO+'rs: ';

        inOutDiv.id = 'inOutDiv';
        inOut.id = 'inOutType';
        form.setAttribute('class', 'forms');
        
        option1.value = 'inside';
        option1.textContent = 'Inne';
        option2.value = 'outside';
        option2.textContent = 'Ute';

        inOut.add(option1, null);
        inOut.add(option2, null);
        // Add the elements to the DOM, using jQuery
        $(inOutDiv).append(span, inOut, '<br');
        $(form).append(inOutDiv);
        $(this.container).append(header, form);

        // Default selected is 'none', so a value MUST be chosen by the user.  
        $('#inOutType').val(-1);

    } else {
        // Error if the room is not 'finished' (closed area)
        html = '<p class="error"> Du m'+this.dotA+' tegne et rom f'+this.crossO+'rst! <br></p>';
        $(this.container).html(html);
    }

    $('#inOutType').change( function() {

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
};

/**
 * Functionality for showing dropdown-menu for chosing 'dry- or wet-area'.
 * Will only show this option if 'inside' is chosen on the first dropdown.
 * @param {Form} form - Form of the page, passed to all follwing functions.
**/
Options.prototype.inOrOut = function(form) {

    var selected = $('#inOutType').val(),
        opts = this,
        doc = document,
        dryWetDiv,
        dryWet,
        option1,
        option2,
        span;

    //Inside is selected
    if (selected === 'inside') {
        dryWetDiv = doc.createElement('div');
        dryWet = doc.createElement('select');
        option1 = doc.createElement('option');
        option2 = doc.createElement('option');
        span = doc.createElement('span');

        dryWetDiv.id = 'dryWetDiv';
        dryWet.id = 'climateType';

        span.textContent = 'Velg v'+this.dotA+'trom/t'+this.crossO+'rrom: ';
        option1.value = 'dry';
        option1.textContent = 'T'+this.crossO+'rrom';
        option2.value = 'wet';
        option2.textContent = 'V'+this.dotA+'trom';

        dryWet.add(option1, null);
        dryWet.add(option2, null);

        $(dryWetDiv).append(span, dryWet, '<br>');
        $(form).append(dryWetDiv);
        // Append the form to the container.
        $(this.container).append(form); 
        // Set default selected to 'none'
        $('#climateType').val(-1);

    } else {
        // 'Outside' is chosen, so we jump directly to the associated options.
        opts.chooseDeck(form);
    }

    // Call new function to set up the 'deck'-dropdown on change.
    $('#climateType').change( function() {

        //If this one changes, we want to remove all the divs following it:
        $('#deckDiv').remove();
        $('#wattDiv').remove();
        $('#castDiv').remove();
        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();

        opts.chooseDeck(form);
    });
};

/**
 * The third dropdown-menu, where the user must choose type of deck for the area.
 * @param {Form} form - Form of the page, passed to all follwing functions.
**/
Options.prototype.chooseDeck = function(form) {

    var opts = this,
        selected = $('#inOutType').val(),
        selectedClim = $('#climateType').val(),
        doc = document,
        deckDiv = doc.createElement('div'),
        span = doc.createElement('span'),
        deck = doc.createElement('select'),
        option1 = doc.createElement('option'),
        option2 = doc.createElement('option'),
        option3 = doc.createElement('option'),
        option4 = doc.createElement('option'),
        option5 = doc.createElement('option'),
        option6 = doc.createElement('option'),
        option7 = doc.createElement('option');

    deckDiv.id = 'deckDiv';
    deck.id = 'deckType';

    span.textContent = 'Velg dekke i rommet: ';

    // Do stuff for an indoor-room.
    if (selected === 'inside') {
        // Tiles and scale can occur both in dry-rooms and wet-rooms.
        option1.value = 'tile';
        option1.textContent = 'Flis';
        option5.value = 'scale';
        option5.textContent = 'Belegg';
        // 'Dry-room'
        if (selectedClim === 'dry') {
            // List options for 'dry'-rooms.
            option2.value = 'carpet';
            option2.textContent = 'Teppe';
            option3.value = 'parquet';
            option3.textContent = 'Parkett';
            option4.value = 'laminat';
            option4.textContent = 'Laminat';
            option6.value = 'concrete';
            option6.textContent = 'Betong';
            option7.value = 'cork';
            option7.textContent = 'Kork';

            deck.add(option1, null);
            deck.add(option2, null);
            deck.add(option3, null);
            deck.add(option4, null);
            deck.add(option5, null);
            deck.add(option6, null);
            deck.add(option7, null);

        // This should obviously be a 'wet'-room.
        } else if (selectedClim === 'wet') {
            deck.add(option1, null);
            deck.add(option5, null);
        }
    // The area is chosen as 'outside' 
    } else if (selected === 'outside') {
        option1.value = 'asphalt';
        option1.textContent = 'Asfalt';
        option2.value = 'pavblock';
        option2.textContent = 'Belegningsstein';
        option3.value = 'concrete';
        option3.textContent = 'St'+this.crossO+'p';

        deck.add(option1, null);
        deck.add(option2, null);
        deck.add(option3, null);
    }

    // Append the element to our form, then add the form to the container.
    $(deckDiv).append(span, deck, '<br>');
    $(form).append(deckDiv);
    $(this.container).append(form);

    // Set as blanc on initialization, to force the user to select an !default item.
    $('#deckType').val(-1);

    // When the user have selected an item in this list, the 'generate'-button is created,
    // unless 'wattage' also has to be selected.
    $('#deckType').change( function() {

        // Cleaning up some html-elements, if they exist:
        $('#wattDiv').remove();
        $('#castDiv').remove();
        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();
        
        // Calling next function, based on selected value.
        (selected === 'inside') ? opts.wattage(form) : opts.generateButton(form);
    });
};

/**
 * Function that adds a wattage dropdown select list button chooser.
 * @param {Form} form - Form of the page, passed to all follwing functions.
**/
Options.prototype.wattage = function(form) {

    var opts = this,
        doc = document,
        span = doc.createElement('span'),
        watt = doc.createElement('select'),
        wattDiv = doc.createElement('div'),
        option1 = doc.createElement('option'),
        option2 = doc.createElement('option'),
        option3 = doc.createElement('option'),
        option4 = doc.createElement('option');

    wattDiv.id = 'wattDiv';
    watt.id = 'wattage';

    span.textContent = 'Velg mattens effekt: ';
    option1.value = 60;
    option1.textContent = '60W';
    option2.value = 100;
    option2.textContent = '100W';
    option3.value = 130;
    option3.textContent = '130W';
    option4.value = 160;
    option4.textContent = '160W';

    watt.add(option1, null);
    watt.add(option2, null);
    watt.add(option3, null);
    watt.add(option4, null);

    // Append the element to our form, then add the form to the container.
    $(wattDiv).append(span, watt, '<br>');
    $(form).append(wattDiv);
    $(this.container).append(form);

    // Set as blanc on initialization, to force the user to select an !default item.
    $('#wattage').val(-1);

    // When the user have selected an item in this list, the 'generate'-button is created.
    $('#wattage').change( function() {

        var deck = $('#deckType').val(),
            watt = $('#wattage').val();

        // The elements that follow #wattage will be removed, before they are added again.
        $('#castDiv').remove();
        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();

        // For one specific option, casting/not casting must be made available.
        if ((deck === 'parquet' || deck === 'laminat') && watt === '60') {
            opts.casting(form);
        } else {
            opts.generateButton(form);
        }
    });
};

/**
 * Functionality that asks the user if casting is to be done for the floor
 * @param {Form} form - form of the tab, passed through all the connected functions, 
 * holds the html-structure.
**/
Options.prototype.casting = function(form) {

    var opts = this,
        doc = document,
        castDiv = doc.createElement('div'),
        span = doc.createElement('span'),
        cast = doc.createElement('select'),
        option1 = doc.createElement('option'),
        option2 = doc.createElement('option');

    cast.id = 'casting';
    castDiv.id = 'castDiv';

    span.textContent = 'Skal gulvet avrettes?';
    option1.value = 'nocast';
    option1.textContent = 'Nei';
    option2.value = 'cast';
    option2.textContent = 'Ja';

    cast.add(option1, null);
    cast.add(option2, null);

    $(castDiv).append(span, cast);
    // Append the element to our form, then add the form to the container.
    $(form).append(castDiv);
    $(this.container).append(form);
    // Set as blanc on initialization, to force the user to select an !default item.
    $('#casting').val(-1);

    // When the user have selected an item in this list, the 'generate'-button is created.
    $('#casting').change( function () {

        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();

        opts.generateButton(form);
    });
};

/**
 * Creation of a button to generate our solution for putting out a heatingmat.
 * Will be created when an item is chosen in all the dropdowns.
 * @param {Form} form - The form is passed "all the way" through the 'specs'-functionality and
 * stuff is appended to it.
**/
Options.prototype.generateButton = function(form) {

    var ns = TFplanner,
        theRoom = ns.ourRoom,
        theGrid = ns.grid,
        opts = this,
        doc = document,
        input = doc.createElement('input'),
        inputDiv = doc.createElement('div'),
        path,
        createProgresswindow = function(callback) {

            var grayDiv = doc.createElement('div'),
                infoDiv = doc.createElement('div'),
                information = doc.createElement('p');

            grayDiv.id = 'progress';
            infoDiv.id = 'infoprogress';
            information.id = 'progressinformation';

            information.textContent = 'Kalkulerer areal';
            
            $(infoDiv).append(information);
            $('#container').append(grayDiv, infoDiv);

            setTimeout(function() {
                callback();
            }, 10);
        };

    inputDiv.id = 'inputDiv';
    input.id = 'genButton';
    input.type = 'button';
    input.title = 'Klikk for '+this.dotA+' generere leggeanvisning';
    input.value = 'Generer leggeanvisning';

    $(inputDiv).append(input, '<br><br><br>');
    $(form).append(inputDiv);
    $(this.container).append(form);

    $('#genButton').click(function() {
        // If we have a finished room, we can call the algorithm and generate a drawing!
        if (theRoom.finished === true) {

            createProgresswindow(function() {
                // Moving room incase user did not visit "obstacles", also saves the new path
                // and send it as parameter to resultGrid.
                path = theGrid.moveRoom();
                ns.resultGrid = new ResultGrid(path);
            });
        }
    });

    // When we have chosen all steps and the 'generate-button' is created, we also want
    // to display the possible mats the user prefer to use.
    opts.preferredMats(form);
};

/**
 * Function that either removes progress or updates it.
 * @param {boolean} remove - Wether to remove the progress-visual or not.
 * @param {boolean} success - Wether area has successfully been calculated.
**/
Options.prototype.updateProgress = function(remove, success) {

    var theRoom = TFplanner.ourRoom,
        measures = TFplanner.measurement,
        grid = TFplanner.grid,
        doc = document,

        /**
         * Function that calculates the percentage of which the 
         * mats utilize the available area. Adds the values 'availableArea'
         * and 'areaUtilPercentage' as a string to the projectname.
        **/
        areaUtilization = function(obj) {
            // Decides wether to remove decimals or not.
            var availArea = ((obj.availableArea % 1) !== 0) ? obj.availableArea.toFixed(2) : obj.availableArea,
                chosenMats = TFplanner.resultGrid.chosenMats,
                matInfo = obj.validMat.products,
                squareMetres = 0,
                areaUtilPercentage = null;

            // Goes through mats used and the product info for matching values.
            // Adds the meters of the chosen mats.
            for (var j = 0, jj = chosenMats.length; j < jj; j++) {
                for (var i = 0, ii = matInfo.length; i < ii; i++) {

                    if (chosenMats[j] == matInfo[i].number) {
                        squareMetres += (matInfo[i].length / 2);
                    }
                }
            }
            
            areaUtilPercentage = ((100 / availArea) * squareMetres).toFixed(1);
            obj.utilizeString = availArea+'m2 ('+areaUtilPercentage+'% utnyttelse)';
            obj.setTitle();
        };

    // Removing the progress visual
    if (remove) {
        if (success) {
            areaUtilization(this);
        }
        doc.getElementById('progress').remove();
        doc.getElementById('infoprogress').remove();

        theRoom.walls.toFront();
        measures.finalMeasurements();
        grid.boxSet.toFront();

    } else {
        doc.getElementById('infoprogress').textContent = 'Kalkulerer leggeanvisning';

        // Give the JavaScript breathingroom for gui updates
        setTimeout(function() { 
            TFplanner.resultGrid.calculateGuide(); 
        }, 1);
    }
};

/**
 * This function makes it possible for the user to specify mat-length(s) to start with
 * in the room.
 * @param {Form} form - The form is passed "all the way" through the 'specs'-functionality and
 * stuff is appended to it.
**/
Options.prototype.preferredMats = function(form) {

    var opts = this,
        doc = document,
        span = doc.createElement('span'),
        lengths = doc.createElement('select'),
        add = doc.createElement('input'),
        lengthDiv = doc.createElement('div'),
        matDiv = doc.createElement('div'),
        ol = doc.createElement('ol'),
        text,
        availLengths = [];

    //Finds the correct heatingmat based on specs chosen by the user.
    this.tfProducts();
    this.prefMat = [];

    // Setting up the html-stuff.
    span.textContent = 'Legg til selvvalgte lengder';
    matDiv.id = 'matDiv';
    lengthDiv.id = 'lengthDiv';
    lengths.id = 'lengths';
    add.id = 'addLength';
    add.type = 'button';
    add.title = 'Legg til foretrukken mattelengde';
    add.value = 'Legg til matte';

    $(lengthDiv).append(span, lengths, add);
    $(matDiv).append(ol);
    $(form).append(lengthDiv, matDiv);

    // Add all the available lengths of this mat to the dropdown.
    for (var i = 0, ii = this.validMat.products.length; i < ii; i++) {
        availLengths[i] = this.validMat.products[i].length;
        $('#lengths').append('<option value='+i+'>'+availLengths[i]+'m</option>'); 
    }

    $(this.container).append(form);

    // This click-action add the chosen mat-length to array, so that
    // the algorithm will use this mat first.
    $('#addLength').click(function() {

        opts.prefMat.push(opts.validMat.products[$('#lengths').val()]);
        text = opts.prefMat[opts.prefMat.length-1].name;
        $(ol).append('<li>'+text+'</li>');
    });
};


/**
 * Set up 'Obstacles'-tab. This includes possibility 
 * to define Projectname and adding obstacles.
**/
Options.prototype.initObstacles = function() {

    var obst = TFplanner.obstacles,
        html = '';

    // Clear current html
    $(this.container).html(html);

    // Adding class css.
    $(this.container).addClass('obstacleTab');
    $(this.container).removeClass('specTab');

    if (TFplanner.ourRoom.finished === true) {
        // Move the room to coordinates (99, 99), but only if obstacles has not been loaded.
        if (obst.supplyPoint == null) {
            TFplanner.grid.moveRoom();
            obst.createObstacle('5', 'Startpunkt');
        }

        // Add inputfield and button to add a 'projectname'.
        html += '<h3> Sett prosjektnavn </h3>';
        html += '<form class=forms>';
        html += '<div class="inputfield"><input type="text" id="titleText" value='+this.projectName+' autocomplete="off"><br></div>';
        html += '<input id="titleSubmit" type="button" value="Endre prosjektnavn">';
        html += '</form>';

        // Header
        html += '<h3> Legg til hindring </h3>';

        // Form start
        html += '<form class=forms>';

        // Select (5 is missing, because same functionality is used for supplyPoint)
        html += "<select id ='obstacleType'><option value=1> Avl"+this.crossO+"p </option>";
        html += "<option value=2> Toalett </option>";
        html += "<option value=3> Dusj </option>";
        html += "<option value=4> Badekar </option>";
        html += "<option value=6> Benk </option>";
        html += "<option value=7> Pipe </option>";
        html += "<option value=8> Egendefinert </option></select>";

        // input button
        html += '<input id="defSubmit" type="button" value="Legg til">';

        // Form end
        html += '</form>';

        this.obstHtml = html;
    } else {
        html = '<p class="error"> Du m'+this.dotA+' tegne et rom f'+this.crossO+'rst! <br></p>';
        this.obstHtml = html;
    }

    this.obstacleList();

    // Set title position
    this.setTitle();
};

/**
 * Function that either refreshes or creates a list of obstacles.
 * Gets the html set in initObstacles (passed through function).
 * @param {int} obstacle - ID of an obstacle.
**/
Options.prototype.obstacleList = function(obstacle) {

    var ns = TFplanner,
        obstacleArr = ns.obstacles.obstacleSet,
        change = 'Endre',
        save = 'Lagre',
        del = 'Slett',
        html = this.obstHtml;

    for (var i = 0, ii = obstacleArr.length; i < ii; i++) {

        // Displaying "hindring" as name of the obstacle if no name is set (only in the html)
        if (obstacleArr[i].data('obstacleType') !== "") {

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
            html += "<div class='inputfield'><div class='inputtext'>H"+this.crossO+"yde: </div>"+decrease+"<input  type='number' id='height' value="+height+">"+increase+"<br></div>";
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

    $(this.container).html("");
    $(this.container).html(html);

    // Sets the focus on the 'project-name'-field the first time 'obstacles'-tab is selected
    if (ns.ourRoom.finished === true && this.titleText == null) {
        this.setTitle();
        var input = document.getElementById('titleText');
            input.focus();
            input.select();
    }

    this.actionListeners();
};

/**
 * Function that initiates action listeners for the
 * obstacle-tab
**/
Options.prototype.actionListeners = function() {

    var opts = this,
        obst = TFplanner.obstacles,
        doc = document;

    // If the 8th option is selected. aka "Egendefinert"
    $('#obstacleType').change(function() {
        
        if (this.value == 8) {

            // Creating elements.
            var parentDiv = doc.createElement('div'),
                textDiv = doc.createElement('div'),
                input = doc.createElement('input');
            
            // Setting properties.
            parentDiv.setAttribute('class', 'inputfield');
            parentDiv.id = 'inputfieldSelf';
            textDiv.setAttribute('class', 'inputtext');
            textDiv.textContent = 'Skriv inn navn: ';
            input.type = 'text';
            input.setAttribute('class', 'inputwidth');
            input.setAttribute('id', 'customObstTxt');
            input.setAttribute('autocomplete', 'off');

            // Adding the elements to its parentnode
            $(parentDiv).append(textDiv, input);

            // Using Jquery to add the parentDiv after the dropdown list
            $(this.parentNode.firstChild).after(parentDiv);
            // Put focus on, and selects the inputfield for adding a obstacle-name
            input.focus();
            input.select();

            $('#customObstTxt').keypress(function(e) {
                // If 'enter' is pressed in the inputfield:
                if (e.which == 13) {
                    e.preventDefault();

                    var value = $('#obstacleType').val(),
                        text = $('#customObstTxt').val();

                    // Create the obstacle, and update the tab.
                    obst.createObstacle(value, text);
                    opts.initObstacles();
                    opts.obstacleList();
                }
            });
        // We might get some issues if 'egendefinert' is chosen, followed by that the user choose an other
        // obstacle without pushing 'add' between. This will delete the <div> if it exists.
        } else if ($('#inputfieldSelf').val() != null) {
            $('#inputfieldSelf').remove();
        }
    });

    // Add click action for the "submit button".
    $('.change').click(function() {
        opts.obstacleList(this.id);
        obst.selectObstacle(this.id);
    });

    $('.delete').click(function() {
        obst.deleteObstacle(this.parentNode.firstChild.nextSibling.id);
        opts.obstacleList();
    });

    // Add click action for the "submit button".
    $('#defSubmit').click(function() {
        
        // Creating obstacle.
        var value = $('#obstacleType').val(),
            customTxt = $('#customObstTxt').val(),
            text = (customTxt != null) ? customTxt : $('#obstacleType option[value='+value+']').text();

        obst.createObstacle(value, text);

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
            supply = $('#supplyend').val();

        // stores the users choice on the matter of ending the mats at the supplywall or not.
        if (supply) {
            obst.supplyEnd = !supply.checked;
        }
        
        $('#posx').val((roundX - 100));
        $('#posy').val((roundY - 100));

        obst.adjustSize(
            this.name, 
            roundW,
            roundH,
            roundX, 
            roundY
        );

        opts.obstacleList();

        obst.selectObstacle(null);
    });

    // Action for the plus and minus buttons
    $('.plusminus').click(function () {

        var inputEle = this.parentNode.firstChild.nextSibling.nextSibling,
            inputVal = parseInt(inputEle.value),
            intention = this.value,

            /**
             *  Magic math function
             *  sauce: http://stackoverflow.com/questions/13077923/how-can-i-convert-a-string-into-a-math-operator-in-javascript
            **/
            matIt = {
                '+': function (x, y) { return x + y; },
                '-': function (x, y) { return x - y; }
            },
            changed = matIt[intention](inputVal, 10);
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
};

/**
 * Functionality that displays the 'projectname' that the user has entered on our paper.
 * Since it`s added as an svg-element, this will also be visible when the image is saved.
**/
Options.prototype.setTitle = function() {

    // Get the text from the html-element, and update it.
    var titleEle = document.getElementById('titleText'),
        grid = TFplanner.grid,
        drawWidth = (grid.resWidth + 201),
        rectX = null,
        rectY = 12,
        areaY = null,
        rectLen = null,
        rectH = 30,
        textX = (drawWidth / 2),
        textY = 25,

        /**
         * This function shows title and its rectangle in the right order.
         * @param obj - The options-object, sent as 'this'.
        **/
        setupTitle = function(obj) {

            // If titlerect and titletext exist (should be always).
            if (obj.titleRect != null && obj.titleText != null) {
                obj.titleRect.toFront();
                obj.titleText.toFront();

                // Incase areatext also exists
                if (obj.areaText != null) {
                    obj.areaText.toFront();
                }
            }
        };

    this.projectName = (titleEle != null) ? titleEle.value : this.projectName;

    // Clear the title-element if it already exist.
    this.titleText != null ? this.titleText.remove() : null;
    this.areaText != null ?  this.titleText.remove() : null;
    this.titleRect != null ? this.titleRect.remove() : null;           

    this.titleText = grid.paper.text(textX, textY, this.projectName).attr({
        'font-size': 20,
        'font-family': 'verdana',
        'font-style': 'oblique'
    });

    areaY = ((this.titleText.getBBox().height / 2) + 10 + textY);

    if (this.utilizeString != null) {
        this.areaText = grid.paper.text(textX, areaY, this.utilizeString).attr({
            'font-size': 14,
            'font-family': 'verdana',
            'font-style': 'oblique'
        });

        rectH += (this.areaText.getBBox().height); 
    }

    // Dynamic size of the rectangle surrounding the text.
    rectLen = (this.titleText.getBBox().width + 30);
    rectX = (textX - (rectLen / 2));

    this.titleRect = grid.paper.rect(rectX, rectY, rectLen, rectH, 5, 5).attr({
        opacity: 1,
        fill: 'white'
    });

    setupTitle(this);
};

/** 
 * Function that creates a form that lets the user 
 * adjust lengths of his predifined room.
**/
Options.prototype.initDefine = function() {
    
    var preDefArr = this.preDefArr,
        defSubmit = 'defSubmit',
        wallsLength = (preDefArr != null) ? (preDefArr[1].length - 1) : null,
        finished = TFplanner.finishedRoom,
        // Starting with a clean slate @ the html variable.
        html = "";

    // Removing the svg paper and adding room class for background color
    this.optPaper.remove();

    $(this.container).addClass('roomTab');
    $(this.container).removeClass('obstacleTab');

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
    $(this.container).html(html);

    // Add click action for the "submit button".
    $('#'+defSubmit).click(function() {

        // Goes through the input elements and stores the length
        for (var i = 0; i < wallsLength; i++) {
            preDefArr[1][i] = $('#wall'+i).val();
        }
        // Remove previous measurements, remove the selectwall 
        // and finally create the new room with specifications.
        TFplanner.measurement.deconstructAid();
        finished.selectWall();
        TFplanner.ourRoom.createRoom(preDefArr);
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
        id != wallsLength ? finished.selectWall(id) : finished.selectWall(null);
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
            id != wallsLength ? finished.selectWall(id) : finished.selectWall(null);
        } 
    });
};

/*
 * Sets up the 'options-container', and create buttons and handlers.
 * Basically the same is done for each button, but the coordinates is different for each one.
 * OBS: The order of pushing elements to collections is important! (The button must be pushed as first element)
**/
Options.prototype.initDraw = function() {

    var paper = this.optPaper,
        opts = this,
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
        // Attributes for the "background-square" of buttons.
        rectAttr = {                
            fill: this.defColor, 
            stroke: this.defColor, 
            'stroke-width': 1, 
        },
        // Attributes for the "image" on each button.
        imgAttr = {                 
            fill: this.imgColor,
            stroke: 'black',
            'stroke-width': 1,
        },
        txtAttr = {
            'font-size': 18,
            'font-weight': 'bold'
        },


    /**
     * All buttons is created the same way, with a square behind a illustration of the room-shape.
     * Here are some common variables for positioning:
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
    drawTxt = paper.text(x3, y0, 'Tegn selv').attr(txtAttr),

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
    tabTxt = paper.text(x3, y2, 'Ferdiglagde rom').attr(txtAttr),

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
            ).attr(imgAttr),

    /**
     * This function add the mouse-handlers for all the 'premade-room'-buttons.
     * @param Coll - A set, containing the rectangular button and the image upon it.
     * @param val - An int, that says what roomtype to be sent to the 'createRoom' function.
     * @param toolTip - A string, that is used to set the tooltip(title) of each button.
    **/
    createHandlers = function(coll, val, toolTip) {

        var theRoom = TFplanner.ourRoom,
            defColor = opts.defColor,
            inColor = opts.inColor;

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
                TFplanner.measurement.deconstructAid();
                theRoom.createRoom(opts.preDefRoom(val));
            } else {
                if (TFplanner.finishedRoom == null) {
                    theRoom.initRoom();
                }
            }
        });
    };

    // Set backgroundcolor of the options-container canvas.
    paper.canvas.style.backgroundColor = '#CBC4BC';

    // Create handlers and stuff for all the 'buttons'.
    createHandlers(drawColl.push(drawRect, drawImg), null, 'Tegn selv!');
    createHandlers(rectColl.push(buttonRect, rectImg), 0, 'Ferdiglaget kvadratisk rom');
    createHandlers(tColl.push(buttonT, tImg), 2, 'Ferdiglaget T-formet rom');
    createHandlers(lColl.push(buttonL, lImg), 1, 'Ferdiglaget L-formet rom');
    createHandlers(lInvColl.push(lInv, lInvImg), 5, 'Ferdiglaget invertert L-rom');
    createHandlers(lRot180Coll.push(lRot180, lRot180Img), 4, 'Ferdiglaget L-rom');
    createHandlers(lRot270Coll.push(lRot270, lRot270Img), 3, 'Ferdiglaget L-rom');
    createHandlers(tRot90Coll.push(tRot90, tRot90Img), 6, 'Ferdiglaget T-rom');
    createHandlers(tRot180Coll.push(tRot180, tRot180Img), 7, 'Ferdiglaget T-rom');
    createHandlers(tRot270Coll.push(tRot270, tRot270Img), 8, 'Ferdiglaget T-rom');
    createHandlers(uColl.push(buttonU, uImg), 9, 'Ferdiglaget U-rom');

};

/**
 * Function that holds the shapes and wall-lengths of 'predefined' rooms.
 * All drawing will be done clockwise and will follow the angle-axis predefined. 
 * (180 is straight to the right, 270 is downwards etc.).
 * The first array contain the angles, and the second array contain the length of the wall.
 * @param {int} value - A number from the function that calls this one, defines what room is to be returned.
**/
Options.prototype.preDefRoom = function(value) {

    switch(value) {
        case 0:  //Rectangle-shaped
            return [[180, 270, 360, 90],[600, 400, 600, 400]];                                           
        case 1: //L-shaped
            return [[180, 270, 180, 270, 360, 90],[200, 200, 200, 150, 400, 350]];                           
        case 2: //T-shaped
            return [[180, 270, 360, 270, 360, 90, 360, 90],[450, 150, 150, 250, 150, 250, 150, 150]];        
        case 3: //L-shape rotated 270 degrees.
            return [[180, 270, 360, 270, 360, 90],[400, 150, 200, 200, 200, 350]];                        
        case 4: //L-shape rotated 180 degrees.
            return [[180, 270, 360, 90, 360, 90], [400, 350, 200, 200, 200, 150]];                        
        case 5: //L-shape rotated 90 degrees.
            return [[180, 270, 360, 90, 180, 90],[200, 350, 400, 150, 200, 200]];                          
        case 6: //T-shape rotated 90 degrees.
            return [[180, 270, 360, 90, 360, 90, 180, 90], [150, 450, 150, 150, 250, 150, 250, 150,]];     
        case 7: //T-shape rotated 180 degrees.
            return [[180, 270, 180, 270, 360, 90, 180, 90], [150, 250, 150, 150, 450, 150, 150, 250]];    
        case 8: //T-shape rotated 270 degrees.
            return [[180, 270, 180, 270, 360, 270, 360, 90], [150, 150, 250, 150, 250, 150, 150, 450]];   
        case 9: //U-shaped room
            return [[180, 270, 180, 90, 180, 270, 360, 90],[150, 200, 200, 200, 150, 350, 500, 350]];       
    }
};


/**
 * Function that get the value from all dropdowns in the Specifications-tab
 * and find the corresponding product that fit the chosen values.
**/
Options.prototype.tfProducts = function() {

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

            note: 'Husk '+this.dotA+' bestille nok TFP underlagsmatte, tape og termostat med gulvf'+this.crossO+'ler',

            desc: 'Varmekabelmatte som parkettunderlag',

            products: [
                {
                    length: 2,
                    number: 1001051,
                    name: 'TFP 60W/1,0m2 0,5x2m 60W',
                }, {
                    length: 4, 
                    number: 1001052,
                    name: 'TFP 60W/2,0m2 0,5x4m 120W'
                }, {
                    length: 6, 
                    number: 1001053,
                    name: 'TFP 60W/3,0m2 0,5x6m 180W'
                }, {
                    length: 8, 
                    number: 1001054,
                    name: 'TFP 60W/4,0m2 0,5x8m 240W'
                }, {
                    length: 10, 
                    number: 1001055,
                    name: 'TFP 60W/5,0m2 0,5x10m 300W'
                }, {
                    length: 12, 
                    number: 1001056,
                    name: 'TFP 60W/6,0m2 0,5x12m 360W'
                }, {
                    length: 14, 
                    number: 1001057,
                    name: 'TFP 60W/7,0m2 0,5x14m 420W'
                }, {
                    length: 16, 
                    number: 1001058,
                    name: 'TFP 60W/8,0m2 0,5x16m 480W'
                }, {
                    length: 18, 
                    number: 1001059,
                    name: 'TFP 60W/9,0m2 0,5x18m 540W'
                }, {
                    length: 20, 
                    number: 1001060,
                    name: 'TFP 60W/10,0m2 0,5x20m 600W'
                }, {
                    length: 24, 
                    number: 1001062,
                    name: 'TFP 60W/12,0m2 0,5x24m 720W'
                }, {
                    length: 30,
                    number: 1001063,
                    name: 'TFP 60W/15,0m2 0,5x30m 900W'
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

            note: 'Husk '+this.dotA+' bestille styringssystem som passer anlegget.<br> Sp'+this.crossO+'r Thermo-Floor om r'+this.dotA+'d hvis du er usikker p'+this.dotA+' hva som kan brukes.',

            desc: 'Utend'+this.crossO+'rs varmekabelmatte',

            products: [
                {
                    length: 2,
                    number: 1001151,
                    name: 'TFU 230V 300W/1m2 - 300W'
                }, {
                    length: 4, 
                    number: 1001152,
                    name: 'TFU 230V 300W/2m2 - 600W'
                }, {
                    length: 6, 
                    number: 1001153,
                    name: 'TFU 230V 300W/3m2 - 900W'
                }, {
                    length: 8, 
                    number: 1001154,
                    name: 'TFU 230V 300W/4m2 - 1200W'
                }, {
                    length: 10, 
                    number: 1001155,
                    name: 'TFU 230V 300W/5m2 - 1500W'
                }, {
                    length: 12, 
                    number: 1001156,
                    name: 'TFU 230V 300W/6m2 - 1800W'
                }, {
                    length: 14, 
                    number: 1001157,
                    name: 'TFU 230V 300W/7m2 - 2100W'
                }, {
                    length: 16, 
                    number: 1001158,
                    name: 'TFU 230V 300W/8m2 - 2400W'
                }, {
                    length: 20, 
                    number: 1001160,
                    name: 'TFU 230V 300W/10m2 - 3000W'
                }, {
                    length: 24, 
                    number: 1001162,
                    name: 'TFU 230V 300W/12m2 - 3600W'
                }, {
                    length: 28, 
                    number: 1001164,
                    name: 'TFU 230V 300W/14m2 - 4200W'
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

            note: 'Husk '+this.dotA+' bestille styringssystem som passer anlegget.<br> Sp'+this.crossO+'r Thermo-Floor om r'+this.dotA+'d hvis du er usikker p'+this.dotA+' hva som kan brukes.',

            desc: 'Utend'+this.dotA+'rs varmekabelmatte',

            products: [
                {
                    length: 2,
                    number: 1001151,
                    name: 'TFU 230V 300W/1m2 - 300W'
                }, {
                    length: 4, 
                    number: 1001152,
                    name: 'TFU 230V 300W/2m2 - 600W'
                }, {
                    length: 6, 
                    number: 1001153,
                    name: 'TFU 230V 300W/3m2 - 900W'
                }, {
                    length: 8, 
                    number: 1001154,
                    name: 'TFU 230V 300W/4m2 - 1200W'
                }, {
                    length: 10, 
                    number: 1001155,
                    name: 'TFU 230V 300W/5m2 - 1500W'
                }, {
                    length: 12, 
                    number: 1001156,
                    name: 'TFU 230V 300W/6m2 - 1800W'
                }, {
                    length: 14, 
                    number: 1001157,
                    name: 'TFU 230V 300W/7m2 - 2100W'
                }, {
                    length: 16, 
                    number: 1011638,
                    name: 'TF SVK MATTE 2400W'
                }, {
                    length: 20, 
                    number: 1011640,
                    name: 'TF SVK MATTE 3000W'
                }, {
                    length: 24, 
                    number: 1011642,
                    name: 'TF SVK MATTE 3600W'
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

            note: 'Husk '+this.dotA+' bestille primer, st'+this.dotA+'lnett og termostat med gulvf'+this.crossO+'ler.',

            desc: 'TF Sticky selvklebende varmekabelmatte',

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

            note: 'Husk '+this.dotA+' bestille primer, st'+this.dotA+'lnett og termostat med gulvf'+this.crossO+'ler.',

            desc: 'TF Sticky selvklebende varmekabelmatte',

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

            note: 'Husk '+this.dotA+' bestille primer, st'+this.dotA+'lnett og termostat med gulvf'+this.crossO+'ler.',

            desc: 'TF Sticky selvklebende varmekabelmatte',

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

            note: 'Husk '+this.dotA+' bestille primer, st'+this.dotA+'lnett og termostat med gulvf'+this.crossO+'ler.',

            desc: 'TF Sticky selvklebende varmekabelmatte',

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
        }
    }
};