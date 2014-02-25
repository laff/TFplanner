

    // Constructor
    function Grid() {
        this.size = 5;               // How many pixels between each horizontal/vertical line.
        this.cutPix = 0.5;           // Used so that the drawing of a line not overlaps on the previous pixel.
        this.paper = Raphael(document.getElementById('canvas_container'));
        this.offsetX = 0.5;
        this.offsetY = 0.5;
    }

    Grid.prototype.draw = function() {

        var paper = this.paper,
            canvas = $('#canvas_container'),
            size = this.size,               
            cutPix = this.cutPix,           
            line,                   // Saves the path to a variable during construction.
            width = (canvas.width()).toFixed(),    // The width and the height of the svg-element.
            height = (canvas.height()).toFixed();

        paper.setViewBox(0, 0, paper.width, paper.height); 
        

        // Draw vertical lines on the screen (lines are drawn so that the screen is filled even on min. zoom)
        for (var i = 1; i <= width; i++) {
            
            // Draw on every 10th pixel
            if (i % 10 === 0) {
                line = paper.path("M"+(i*size+cutPix)+", "+0+", L"+(i*size+cutPix)+", "+(size*height)).attr({'stroke-opacity': 0.4});   //Path-function is named 'paperproto.path' in raphael.js
            }
        }

        // Draw horizontal lines on the screen (lines are drawn so that the screen is filled even on min. zoom)
        for (var i = 1; i <= height; i++) {

           // Make every 10th pixel.
           if (i % 10 === 0 ) {
                line = paper.path("M"+0+", "+(i*size+cutPix)+", L"+(size*width)+", "+(i*size+cutPix)).attr({'stroke-opacity': 0.4});
            }
        }

        //paper.setSize("100%" , "100%");
    }

    //X and Y values for upper left corner of box
    Grid.prototype.menuBox = function (x, y) {
        var paper = this.paper,
            frame = paper.rect(x, y, 310, 110),
            box = paper.rect(x, y, 100, 100),
            line1 = paper.path("M"+(50+x)+", " +y+", L"+(50+x)+", "+(25+y)).attr({'stroke-opacity': 0}),
            line2 = paper.path("M"+(50+x)+", " +(75+y)+", L"+(50+x)+", "+(100+y)).attr({'stroke-opacity': 0}),
            line3 = paper.path("M"+(x)+", " +(50+y)+", L"+(25+x)+", "+(50+y)).attr({'stroke-opacity': 0}),
            line4 = paper.path("M"+(75+x)+", " +(50+y)+", L"+(100+x)+", "+(50+y)).attr({'stroke-opacity': 0})
            clearButton = paper.image("Graphics/clear_unpressed.png", x+115, y+10, 70, 30);

        frame.attr({'stroke-opacity': 1.0, 'stroke': "black", 'stroke-width': 3.0, 'fill': "white", 'fill-opacity': 0.8});
        box.attr({'stroke-opacity': 1.0, 'stroke': "green", 'stroke-width': 3.0, 'fill': "white", 'fill-opacity': 0.1});
        line1.attr({'stroke-opacity': 1.0, 'stroke': "green", 'stroke-width': 3.0, "arrow-start": "classic-midium-midium"});
        line2.attr({'stroke-opacity': 1.0, 'stroke': "green", 'stroke-width': 3.0, "arrow-end": "classic-midium-midium"});
        line3.attr({'stroke-opacity': 1.0, 'stroke': "green", 'stroke-width': 3.0, "arrow-start": "classic-midium-midium"});
        line4.attr({'stroke-opacity': 1.0, 'stroke': "green", 'stroke-width': 3.0, "arrow-end": "classic-midium-midium"}),
        t = paper.text(50+x, 50+y, "100 cm");

        //Event handler for clear button
        clearButton.mousedown(function(e) {
            //Loads image of pressed button
            var pressedButton = paper.image("Graphics/clear_pressed.png", x+115, y+10, 70, 30);
            if (ourRoom.finished == true) {
                paper.clear();
                var resultGrid = new ResultGrid();
                ourRoom.clearRoom();
                ourRoom = new Room(20);
                setTimeout(function(){
                    resultGrid.clear();
                    grid.draw();
                    grid.menuBox(0,0);
                }, 5000);
                
            }
            //"Unclicks" button
            setTimeout(function(){ pressedButton.remove() }, 300);
        });
    }

    /**
     * Makes sure that the user can`t draw in the left corner, where the 'scale' is.
     * TODO: Old functionality commented, should be removed!
    **/

    Grid.prototype.getRestriction = function(xy) {

        var x = xy[0],
            y = xy[1];
          //var x = latticePoint.x* this.size + this.offsetX;
          //var y = latticePoint.y * this.size + this.offsetY;

        if (!(x < 310 && y < 110))
            return new Point(x, y);
        else
            return new Point(-1, -1);
    }

    Grid.prototype.range = function(val, min, max) {

        if (val < min) 
            return min;
        if (val > max) 
            return max;
      return val;
    }



    /**
     *  Zoom functionality
     *
     * Sauce: http://jsfiddle.net/9zu4U/147/
    **/
    Grid.prototype.zoom = function() {

        var paper = this.paper,
            canvasID = "#canvas_container",

            viewBoxWidth = paper.width,
            viewBoxHeight = paper.height,
            
            startX,
            startY,
            mousedown = false,
            dX,
            dY,
            oX = 0,
            oY = 0,
            oWidth = viewBoxWidth,
            oHeight = viewBoxHeight,

            // View box
            viewBox = paper.setViewBox(oX, oY, viewBoxWidth, viewBoxHeight);
            viewBox.X = oX;
            viewBox.Y = oY;


        /** 
         * This is high-level function.
         * It must react to delta being more/less than zero.
         */
        function handle(delta) {
            
            vBHo = viewBoxHeight;
            vBWo = viewBoxWidth;

            if (delta < 0) {
                viewBoxWidth *= 0.95;
                viewBoxHeight*= 0.95;

            } else {
                viewBoxWidth *= 1.05;
                viewBoxHeight *= 1.05;
            }

            viewBox.X -= (viewBoxWidth - vBWo) / 2;
            viewBox.Y -= (viewBoxHeight - vBHo) / 2;

            paper.setViewBox(0, 0, viewBoxWidth, viewBoxHeight);
        }

        /** 
         * Event handler for mouse wheel event.
         */
        function wheel(event){
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
                handle(delta);
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

        //Pane
        
        if (this.finished) {

            $(canvasID).mousedown(function(e){

                if (paper.getElementByPoint( e.pageX, e.pageY ) != null) {
                    return;
                }

                mousedown = true;
                startX = e.pageX; 
                startY = e.pageY;    
            });



            $(canvasID).mousemove(function(e){

                if (mousedown == false) {
                    return;
                }

                dX = startX - e.pageX;
                dY = startY - e.pageY;
                x = viewBoxWidth / paper.width; 
                y = viewBoxHeight / paper.height; 

                dX *= x; 
                dY *= y; 
                //alert(viewBoxWidth +" "+ paper.width );

                paper.setViewBox(viewBox.X + dX, viewBox.Y + dY, viewBoxWidth, viewBoxHeight);

            })

            $(canvasID).mouseup(function(e){

                if ( mousedown == false ) {
                    return;
                }

                viewBox.X += dX; 
                viewBox.Y += dY; 
                mousedown = false; 

            });

        }
    }

    Grid.prototype.getZoomedXY = function(x, y) {
        var paper = this.paper,
            sX = paper._viewBox[2],
            sY = paper._viewBox[3],
            oX = paper.width,
            oY = paper.height,
            ratio;


        if (sX != oX && sY != oY) {

            ratio = (sX / oX).toFixed(5);

            x *= ratio;
            y *= ratio;
        }

        return [x, y];
    }