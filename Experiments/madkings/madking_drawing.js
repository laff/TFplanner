
function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.compareInt = function(x, y){
  return x < y ? -1 : x > y ? 1 : 0;
}

Point.compare = function(p1, p2){
  if (p1.x == p2.x) return Point.compareInt(p1.y, p2.y);
  return Point.compareInt(p1.x, p2.x);
}

Point.prototype.eq = function(p2){
  return Point.compare(this, p2) == 0;
}

Point.prototype.lt = function(p2){
  return Point.compare(this, p2) < 0;
}

Point.prototype.le = function(p2){
  return Point.compare(this, p2) <= 0;
}

Point.prototype.gt = function(p2){
  return Point.compare(this, p2) > 0;
}

Point.prototype.ge = function(p2){
  return Point.compare(this, p2) >= 0;
}

Slope.gcd = function(x, y){
  if (y == 0) return x;
  return Slope.gcd(y, x%y);
}

function Slope(p1, p2) {
  var rise = p1.y - p2.y;
  var run = p1.x - p2.x;
  var gcd = Slope.gcd(Math.abs(rise), Math.abs(run));
  rise /= gcd;
  run /= gcd;
  if (run < 0) {
    rise *= -1;
    run *= -1;
  } else if (run == 0) {
    rise = 1;
  }
  this.rise = rise;
  this.run = run;
}
Slope.prototype.eq = function(s2) {
  return this.rise == s2.rise && this.run == s2.run;
}
function Line(p1, p2){
  if (Point.compare(p1, p2) > 0) {
    this.p1 = p2;
    this.p2 = p1;
  } else {
    this.p1 = p1;
    this.p2 = p2;
  }
  this.slope = new Slope(this.p1, this.p2);
}
Line.prototype.overlaps = function(line, includeEndPt) {
  if (!this.slope.eq(line.slope)) return false;
  if (!this.p1.eq(line.p1) &&
      !this.slope.eq(new Line(this.p1, line.p1).slope)) return false;
  if (this.p1.lt(line.p2) && this.p2.gt(line.p1)) return true;
  if (includeEndPt && this.p1.le(line.p2) && this.p2.ge(line.p1)) return true;
  return false;
};
Line.prototype.erase = function(line){
  var lines = [];
  if (this.p1.ge(line.p1) && this.p2.le(line.p2)) return lines;
  if (this.p1.ge(line.p1)) {
    lines.push(new Line(line.p2, this.p2));
  } else if (this.p2.le(line.p2)) {
    lines.push(new Line(this.p1, line.p1));
  } else {
    lines.push(new Line(this.p1, line.p1));
    lines.push(new Line(line.p2, this.p2));
  }
  return lines;
}
Line.prototype.merge = function(line) {
  var p1 = this.p1.lt(line.p1) ? this.p1 : line.p1;
  var p1 = this.p2.gt(line.p2) ? this.p2 : line.p2;
  return new Line(p1, p2); 
}

Grid.LIGHT_BLUE = "#00FFFF";
function Grid(canvas, width, height, options){
  this.ctx = canvas.getContext('2d');
  this.width = width;
  this.height = height;
  if (options) {
    if (options['size']) 
      this.size = options['size'];
    if (options['offsetX']) 
      this.offsetX = options['size'];
    if (options['offsetY']) 
      this.offsetY = options['size'];
  }  
}

Grid.prototype.color = Grid.LIGHT_BLUE;
Grid.prototype.size = 10;
Grid.prototype.offsetX = 1;
Grid.prototype.offsetY = 1;

Grid.prototype.draw = function(){
  var ctx = this.ctx;
  ctx.save();
  ctx.translate(this.offsetX + 0.5, this.offsetY + 0.5);
  ctx.strokeStyle = this.color;
  ctx.beginPath();
  var size = this.size;
  for (i = 0; i <= this.width; i++) {
    ctx.moveTo(i * size, 0);
    ctx.lineTo(i * size, size * this.height);
  }
  for (i = 0; i <= this.height; i++) {
    ctx.moveTo(0, i * size);
    ctx.lineTo(size * this.width, i * size);
  }
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

Grid.prototype.getLatticePoint = function(x, y){
  var tx = x - this.offsetX;
  var ty = y - this.offsetY;
  tx += this.size / 2;
  ty += this.size / 2;
  tx = parseInt(tx / this.size);
  ty = parseInt(ty / this.size);
  tx = Grid.range(tx, 0, this.width);
  ty = Grid.range(ty, 0, this.height);
  return new Point(tx, ty);
}
Grid.range = function(val, min, max){
  if (val < min) 
    return min;
  if (val > max) 
    return max;
  return val;
}
Grid.prototype.getReal = function(latticePoint){
  var x = latticePoint.x * this.size + this.offsetX;
  var y = latticePoint.y * this.size + this.offsetY;
  //  alert('real: ' + latticePoint.x + " = x: " + x + " y: " + y);
  return new Point(x, y);
}


function DrawingRecord(canvas, grid){
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.grid = grid;
  this.lines = {};
  this.nextLine = 0;
}
DrawingRecord.prototype.drawLine = function(line){
  var ctx = this.ctx;
  ctx.save();
  ctx.beginPath();
  var p1 = this.grid.getReal(line.p1);
  var p2 = this.grid.getReal(line.p2);
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}
DrawingRecord.prototype.clear = function(){
  this.canvas.width = this.canvas.width + 1;
  this.canvas.width = this.canvas.width - 1;
}
DrawingRecord.prototype.addLine = function(p1, p2){
  var line = new Line(p1, p2);
  this.lines[this.nextLine++] = line;
  if (!this.dontDraw) {
    this.drawLine(line);
  }
}

DrawingRecord.prototype.eraseLine = function(p1, p2){
  var line = new Line(p1, p2);
  for (var i in this.lines) {
    var tempLine = this.lines[i];
    if (line.overlaps(tempLine)) {
      var lines = tempLine.erase(line);
      delete this.lines[i];
      for(var j in lines) this.lines[this.nextLine++] = lines[j];
    }
  }
  if (!this.dontDraw) {
    this.clear();
    this.draw();  
  }
}
DrawingRecord.prototype.draw = function(){
  this.clear();
  var ctx = this.ctx;
  ctx.save();
  ctx.beginPath();
  for (var i in this.lines) {
    var line = this.lines[i];
    var p1 = this.grid.getReal(line.p1);
    var p2 = this.grid.getReal(line.p2);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
  }
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}
DrawingRecord.prototype.reset = function() {
  this.clear();
  this.lines = {};
  this.nextLine = 0;
}


ControlLayer.DEFAULT_STYLE = "#FF0000";
ControlLayer.ERASE_STYLE = Grid.LIGHT_BLUE;

/**
 * Function that declares properties for controllayer?
 *
**/
function ControlLayer(canvas, grid, drawRecord){
  this.ctx = canvas.getContext('2d');
  this.canvas = canvas;
  this.grid = grid;
  this.drawRecord = drawRecord;
  this.drawStyle = 0;
  this.undoStack = new UndoStack(drawRecord);
}
ControlLayer.prototype.lineStyle = "#000000";
ControlLayer.prototype.plusStyle = ControlLayer.DEFAULT_STYLE;
ControlLayer.prototype.plusSize = 5;
ControlLayer.prototype.drawPlus = function(point){
  point = this.grid.getReal(point);
  var ctx = this.ctx;
  x = point.x + 0.5;
  y = point.y + 0.5;
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = this.plusStyle;
  ctx.moveTo(x, y - this.plusSize);
  ctx.lineTo(x, y + this.plusSize);
  ctx.moveTo(x - this.plusSize, y);
  ctx.lineTo(x + this.plusSize, y);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}
ControlLayer.prototype.clear = function(){
  this.canvas.width = this.canvas.width + 1;
  this.canvas.width = this.canvas.width - 1;
}
ControlLayer.prototype.drawTempLine = function(){
  this.clear();
  this.drawPlus(this.firstPoint);
  var p2 = this.grid.getReal(this.currentPoint);
  var p1 = this.grid.getReal(this.firstPoint);
  var ctx = this.ctx;
  ctx.save();
  ctx.strokeStyle = this.lineStyle;
  if (this.rect) {
    ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
  } else {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.closePath();
  }
  ctx.restore();
}

ControlLayer.prototype.click = function(e){

	if (this.firstPoint) {

	  	// VARIABLES
	  	// points to be saved.
	  	var p1 = this.firstPoint,
	  		p2 = this.currentPoint,
	  		p2x = p2.x,
	  		p2y = p2.y,
	  		// function shortcut
	  		drawFunc = this.drawRecord.addLine,
	  		drawRecord = this.drawRecord,
	  		func,
	  		lineCount,
	  		complete = false;

	    // Functionality for when erasing
	    if (this.erase) {
	      drawFunc = this.drawRecord.eraseLine;
	    }

	    // Functionality for when drawing to the same point as prev.
		if (p1.eq(p2)) {
			this.resetState();
			return;
		}

		// Functionality for drawing
		// if rect
		if (this.rect) {

			func = function(){
				drawFunc.call(drawRecord, p1, new Point(p2.x, p1.y));
				drawFunc.call(drawRecord, p1, new Point(p1.x, p2.y));
				drawFunc.call(drawRecord, p2, new Point(p2.x, p1.y));
				drawFunc.call(drawRecord, p2, new Point(p1.x, p2.y));
			}
		// else its line
		} else { 
				/*
				if (drawRecord.lines[i].p1.eq(p1) && drawRecord.lines[i].p2.eq(p2)) {
					this.resetState();
					return;
				}
				*/
			func = function(){drawFunc.call(drawRecord, p1, p2);}
		}

		func();
		this.undoStack.add(func);
		this.resetUndoButtons();

		// Checks if the cycle is concluded.
		if (drawRecord.startPoint.eq(p2)) {
				this.resetState();
				complete = true;
		}

		if (!complete) {
			this.firstPoint = p2;
		}

	} else {
		this.firstPoint = this.currentPoint;
		this.drawRecord.startPoint = this.currentPoint;
	}
};

ControlLayer.prototype.resetState = function() {
  this.clear();
  this.firstPoint = undefined;
}

ControlLayer.prototype.onmousemove = function(e){
  var x = e.layerX;
  var y = e.layerY;
  var point = this.grid.getLatticePoint(x, y);
  if (!this.currentPoint || (this.currentPoint.x != point.x || this.currentPoint.y != point.y)) {
    this.currentPoint = point;
    this.clear();
    if (this.firstPoint) {
      this.drawTempLine();
    } else {
      this.drawPlus(this.currentPoint);
    }
  }
};

ControlLayer.prototype.registerMouse = function(){
  var self = this;

  this.canvas.addEventListener(
  	"click", 
  	function(e){ self.click(e); }, 
  	false
  );

  this.canvas.onmousemove = function(e){
	self.onmousemove(e);
  }
}

ControlLayer.prototype.registerDrawStyle = function(select){
  self = this;
  select.onchange = function(){
    self.setDrawStyle(select.selectedIndex);
  }
}
ControlLayer.prototype.setDrawStyle = function(style){
  this.resetState();
  this.drawStyle = style;
  this.rect = true;
  this.erase = false;
  switch (style) {
  case 0: this.rect = false;
  case 1: this.lineStyle = ControlLayer.DEFAULT_STYLE; break;
  case 2: this.rect = false;
  case 3: this.erase = true; this.lineStyle = ControlLayer.ERASE_STYLE; break;
  }
}

ControlLayer.prototype.reset = function() {
  this.drawRecord.reset();
  this.undoStack = new UndoStack(this.drawRecord);
  this.resetState();
  this.resetUndoButtons();
}

ControlLayer.prototype.registerUndo = function(undoButton, redoButton) {
  this.undoButton = undoButton;
  this.redoButton = redoButton;
  var self = this;

  undoButton.onclick = function() {
    self.undoStack.undo();
    self.resetUndoButtons();
    self.resetState();
    return false;
  }

  redoButton.onclick = function() {
    self.undoStack.redo();
    self.resetUndoButtons();
    self.resetState();
    return false;
  }

  this.resetUndoButtons();
}

ControlLayer.prototype.resetUndoButtons = function() {
  this.undoButton.disabled = (this.undoStack.curCmd < 1);
  this.redoButton.disabled = (this.undoStack.curCmd >= this.undoStack.maxCmds);
}

function UndoStack(draw){
  this.stack = [];
  this.maxCmds = 0;
  this.curCmd = 0;
  this.draw = draw;
}
UndoStack.prototype.add = function(cmd) {
  this.stack[this.curCmd++] = cmd;
  this.maxCmds = this.curCmd;
}
UndoStack.prototype.undo = function(){
  this.draw.reset();
  this.draw.dontDraw = true;
  this.curCmd--;
  for (var i = 0; i < this.curCmd; i++) {
    this.stack[i]();
  }
  this.draw.dontDraw = false;
  this.draw.draw();
}
UndoStack.prototype.redo = function(){
  this.stack[this.curCmd++]();
}


function init() {
  var gridLayer = document.getElementById("gridLayer");
  var drawLayer = document.getElementById("drawLayer");
  var controlLayer = document.getElementById("controlLayer");
  var width = gridLayer.width / 10;
  var height = gridLayer.height / 10;
  var grid = new Grid(gridLayer, width - 1, height - 1);
  var draw = new DrawingRecord(drawLayer, grid);
  var control = new ControlLayer(controlLayer, grid, draw);
  grid.draw();
  control.registerMouse();
  control.registerDrawStyle(document.getElementById("drawStyle"));
  document.getElementById('erase').onclick=function() {control.reset(); return false;}
  control.registerUndo(document.getElementById("undo"),document.getElementById("redo"));
}