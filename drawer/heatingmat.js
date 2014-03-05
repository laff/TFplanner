//Constructor for the floor heating mats,
//takes length in cm as parameter
function HeatingMat(matLength) {
	this.totalArea = matLength*50;
	this.unusedArea = this.totalArea;
}

HeatingMat.prototype.addSquare = function() {
	this.unusedArea -= 50*50;
}

HeatingMat.prototype.addSubsquare = function() {
	this.unusedArea -= 10*10;
}

HeatingMat.prototype.removeSquare = function() {
	this.unusedArea += 50*50;
}

HeatingMat.prototype.removeSubsquare = function() {
	this.unusedArea += 10*10;
}