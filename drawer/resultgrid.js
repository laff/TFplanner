//Constructor for the result display
    function ResultGrid() {
        this.size = 5;
        this.height = 0;
        this.width = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1;
        this.paper = Raphael(document.getElementById('canvas_container'));
        this.squares = [];
        this.area = 0;
        this.squarewidth = 0;
        this.squareheight= 0;

        this.findDimension();

        //No scaling of image
        this.path = this.getWalls(this.offsetX, this.offsetY);

        this.populateSquares();

        //this.draw(this.height, this.width, this.path);

        this.findStart();
    }


    //Function finds the height and width of the figure, as well as the height
    // and width of the screen. Also sets scale of image based on relation
    // between screen height/width and room height/width
    ResultGrid.prototype.findDimension = function() {
        var minX = 1000000, 
            maxX = 0, 
            minY = 1000000, 
            maxY = 0, 
            walls = ourRoom.walls,
            numberOfWalls = walls.length,
            yscale,
            xscale,
            canvas = $('#canvas_container');

        for (var i = 0; i < numberOfWalls; ++i)
        {
            //Find largest and smallest X value
            if ( (walls[i].attrs.path[0][1]) > maxX )
                maxX = walls[i].attrs.path[0][1];
            if ( (walls[i].attrs.path[1][1]) > maxX)
                maxX = walls[i].attrs.path[1][1];
            if ( (walls[i].attrs.path[0][1]) < minX )
                minX = walls[i].attrs.path[0][1];
            if ( (walls[i].attrs.path[1][1]) < minX )
                minX = walls[i].attrs.path[1][1];

            //Find smallest and largest Y value
            if ( (walls[i].attrs.path[0][2]) > maxY )
                maxY = walls[i].attrs.path[0][2];
            if ( (walls[i].attrs.path[1][2]) > maxY )
                maxY = walls[i].attrs.path[1][2];
            if ( (walls[i].attrs.path[0][2]) < minY )
                minY = walls[i].attrs.path[0][2];
            if ( (walls[i].attrs.path[1][2]) < minY )
                minY = walls[i].attrs.path[1][2];
        } 

        //Sets ResultGrid variables
        this.offsetX = minX -49;
        this.offsetY = minY - 49;
        this.width = (maxX - minX);
        this.height = (maxY - minY);

        //Finds a scale for final room, used to draw result
        xscale = canvas.width()/this.width,
        yscale = canvas.height()/this.height;
        this.scale = (xscale < yscale)?xscale:yscale;
        this.scale = this.scale.toFixed();

      //  this.paper.setViewBox(0, 0, (this.width*this.scale), (this.height*this.scale), true);
    }



    //Draws a scaled version of the path. VERY UNFINISHED!
    ResultGrid.prototype.draw = function(h, w, path) {
        paper = this.paper;
        var canvas = $('#canvas_container'), 
            xscale = canvas.width()/w,
            yscale = canvas.height()/h,
            squares = this.squares;
    }


    //Gets wall elements from ourroom and translates to new grid 
    ResultGrid.prototype.getWalls = function (offsetX, offsetY, scale) {
        
        var scalefactor;
        (scale!=null)?scalefactor = scale:scalefactor = 1;

        var walls = ourRoom.walls,
            paper = this.paper,
            size = this.size,
            width = 0, 
            height = 0,
            numberOfWalls = walls.length,
            pathString, 
            tempString,
            xstart = (walls[0].attrs.path[0][1]- offsetX)*scalefactor, 
            ystart = (walls[0].attrs.path[0][2]- offsetY)*scalefactor,
            xcurrent,
            ycurrent,
            path;

        pathString = new String("M "+xstart + ", "+ ystart);

        for (var i = 1; i < numberOfWalls; ++i)
        {
            xcurrent = (walls[i].attrs.path[0][1]- offsetX)*scalefactor; 
            ycurrent = (walls[i].attrs.path[0][2]- offsetY)*scalefactor;

            tempString = " L"+xcurrent + ", "+ ycurrent;
            pathString += tempString;
        }

        tempString = " Z";
        pathString += tempString;
        path = paper.path(pathString);
        path.attr({
            'stroke-width':     3.0,
            'stroke':           "Black",
            'stroke-opacity':   1.0 
        });

        return pathString;
    }

    //Divides the areaa into suqares, does wall and obstacle detecetion and
    // calculates the area to be covered
    ResultGrid.prototype.populateSquares = function() {
        var squares = this.squares,
            paper = this.paper,
            path = this.path,
            xdim = 50, 
            ydim = 50,
            width = this.width,
            height = this.height,
            length = 0,
            square;

        //The grid is slightly larger than the figure, 
        // and grid is padded so that we don't get partial squares 
        height = height +100 + (50-height%50);
        width = width + 100 +(50-width%50);
        this.squareheight = height/50;
        this.squarewidth = width/50;

        for (var i = 0; i < height; i += ydim) {
            for (var j = 0; j < width; j += xdim) {
                square = new Square(j, i, path, paper);
                squares[length++] = square;
                this.area += square.area;
            }
        }
        console.log("Availabe area: " + this.area + " square cm");
        this.area = this.area/(100*100);
        this.area = Math.floor(this.area);
        console.log("Usable area: " + this.area + " square meters");

    }

    //Constructor for a 0.5m X 0.5m square
    function Square (x, y, path, paper) {
        this.xpos = x/50;
        this.ypos = y/50;
        this.insideRoom = false;
        this.hasObstacles = false;
        this.hasWall = false;
        this.populated = false;
        this.subsquares = [];
        this.area = 0;

        var xdim = 50, 
            ydim = 50,
            xsubdim = 10, 
            ysubdim = 10, 
            subsquare,
            subsquares = this.subsquares,
            ul = Raphael.isPointInsidePath( path, x,y ),
            ur = Raphael.isPointInsidePath( path, x + xdim, y ), 
            ll = Raphael.isPointInsidePath( path, x, y + ydim ),
            lr = Raphael.isPointInsidePath( path, x+xdim, y+ydim ),
            length = 0;

        this.rect = paper.rect(x, y, xdim, ydim);

        //If whole square is inside
        if (  ul && ur && ll && lr ) {

            this.rect.attr({
                'fill': "cyan",
                'fill-opacity': 0.2
            });
            this.insideRoom = true;
            this.hasWall = false;
            this.area = xdim*ydim;
        }
        //If at least one corner is inside   
        else if ( ul || ur || ll || lr) {
            var id = 0;
            for ( var i = 0; i < ydim; i += ysubdim) {
                for (var j = 0; j < xdim; j += xsubdim) {
                    subsquare = new Subsquare(x+j, y+i, path, paper, id++);
                    this.hasWall = true;
                    this.rect.attr({
                        'stroke': "blue"
                    });
                    this.insideRoom = true;
                    this.subsquares[length++] = subsquare;
                    if (subsquare.insideRoom)
                        this.area += xsubdim*ysubdim;
                }
            }
        }
        //Whole square outside
        else {
            this.rect.attr({
                'fill': "red",
                'fill-opacity': 0.6
            });
        }
    }


    //Constructor for 0.1m X 0.1m square
    function Subsquare (x, y, path, paper, squarenumber) {
        this.id = squarenumber;
        this.insideRoom = false;
        this.hasObstacle = false;
        this.hasWall = false;
        this.populated = false;
        this.rect;

        var xdim = 10,
            ydim = 10,
            ul = Raphael.isPointInsidePath( path, x,y ),
            ur = Raphael.isPointInsidePath( path, x + xdim, y ), 
            ll = Raphael.isPointInsidePath( path, x, y + ydim ),
            lr = Raphael.isPointInsidePath( path, x+xdim, y+ydim );
        this.rect = paper.rect(x, y, xdim, ydim);

        //Subsquares are either in or out
        if ( ul && ur && ll && lr) {
            this.rect.attr({
                'fill': "green",
                'fill-opacity': 0.2,
                'stroke-width': 0.1
            });
            this.insideRoom = true;
            this.hasWall = false;
        } 
        else if (ul || ur || ll || lr) {
            this.rect.attr({
                'fill': "blue",
                'fill-opacity': 0.2,
                'stroke-width': 0.1
            });
            this.hasWall = true;
        }
        else {
            this.rect.attr ({
                'fill': "yellow",
                'fill-opacity': 0.2,
                'stroke-width': 0.1
            });
        }
    }


    ResultGrid.prototype.clear = function () {

        //Cleans up arrays
        var squares = this.squares, 
            len = squares.length,
            square,
            arr;
        for (var i = 0; i < len; ++i) {
            square = squares.pop();
            if (square.subsquares.length != 0) {
                arr = square.subsquares;
                for ( var j = 0; j < 25; j++)
                    arr.pop();
            }
        }

        //Removes the drawing
        this.paper.remove();
    }


    //Function finds the next valid starpoint for a mat
    ResultGrid.prototype.findStart = function() {
        var squares = this.squares, 
            len = squares.length,
            width = this.squarewidth,
            height = this.squareheight;

        for (var i = 0; i < len; ++i) {
            var square = squares[i];
            
            if (square.insideRoom) {
                
                if (!square.hasWall) {

                    //Neighbouring squares 
                    var up = squares[i-width], 
                        left =  squares[i-1], 
                        right = squares[i+1], 
                        down = squares[i+width],
                        arr;

                    if (up.hasWall && ( up.subsquares[20].hasWall ||
                                        up.subsquares[21].hasWall ||
                                        up.subsquares[22].hasWall ||
                                        up.subsquares[23].hasWall ||
                                        up.subsquares[24].hasWall ) ) {
                        this.squares[i].rect.attr({'fill': "magenta", 'fill-opacity': .5});
                    } 
                    else if (left.hasWall && ( left.subsquares[4].hasWall ||
                                               left.subsquares[9].hasWall ||
                                               left.subsquares[14].hasWall ||
                                               left.subsquares[19].hasWall ||
                                               left.subsquares[24].hasWall ) ) {
                        this.squares[i].rect.attr({'fill': "magenta", 'fill-opacity': .5});
                    } 
                    else if (right.hasWall && ( right.subsquares[0].hasWall ||
                                                right.subsquares[5].hasWall ||
                                                right.subsquares[10].hasWall ||
                                                right.subsquares[15].hasWall ||
                                                right.subsquares[20].hasWall ) ) {
                        this.squares[i].rect.attr({'fill': "magenta", 'fill-opacity': .5});
                    } 
                    else if (down.hasWall && ( down.subsquares[0].hasWall ||
                                               down.subsquares[1].hasWall ||
                                               down.subsquares[2].hasWall ||
                                               down.subsquares[3].hasWall ||
                                               down.subsquares[4].hasWall ) ) {
                       this.squares[i].rect.attr({'fill': "magenta", 'fill-opacity': .5});
                    }

                } else {
                    var arr = square.subsquares,
                        subsquare,
                        up, 
                        down, 
                        left, 
                        right;
                    for (var j=0; j < 25; ++j) {

                        subsquare = arr[j];
                        if ( subsquare.insideRoom  && !subsquare.populated && 
                             !subsquare.hasWall && !subsquare.hasObstacle ) {

                            //Finds neighboring subsquares inside own square
                            (j>4)?up=arr[j-5]:up=null;
                            (j<20)?down=arr[j+5]:down=null;
                            ((j%5)!=0)?left=arr[j-1]:left=null;
                            ((j%5)!=4)?right=arr[j+1]:right=null;

                            //If any neighboring squares have walls
                            if ( (up && up.hasWall) || 
                                 (down && down.hasWall) || 
                                 (right && right.hasWall) || 
                                 (left && left.hasWall) ) {

                                subsquare.rect.attr({
                                    'fill': "cyan",
                                    'fill-opacity': .5
                                });
                            } 
                            //or if subsquare directly to the top has wall
                            else if ( !up && squares[i-width].hasWall && 
                                        squares[i-width].subsquares[j+20].hasWall) {
                                subsquare.rect.attr({
                                    'fill': "magenta",
                                    'fill-opacity': .5
                                });
                            }
                            //or if subsquare directly to the top has wall
                            else if ( !left && squares[i-1].hasWall && 
                                        squares[i-1].subsquares[j+4].hasWall) {
                                subsquare.rect.attr({
                                    'fill': "magenta",
                                    'fill-opacity': .5
                                });
                            }
                            //or if subsquare directly to the top has wall
                            else if ( !right && squares[i+1].hasWall && 
                                        squares[i+1].subsquares[j-4].hasWall) {
                                subsquare.rect.attr({
                                    'fill': "magenta",
                                    'fill-opacity': .5
                                });
                            }   
                            //or if subsquare directly to the top has wall
                            else if ( !down && squares[i+width].hasWall && 
                                        squares[i+width].subsquares[j-20].hasWall) {
                                subsquare.rect.attr({
                                    'fill': "magenta",
                                    'fill-opacity': .5
                                });
                            }
                            
                        }
                    }
                }
                
            }
        
        }

    }