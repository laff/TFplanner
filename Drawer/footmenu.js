function FootMenu () {
	this.footPaper = Raphael(document.getElementById('footmenu'));
	this.initFooter();
}

FootMenu.prototype.initFooter = function () {
	var paper = this.footPaper,
	height = paper.height,
	width = paper.width,
	load,
	loadTxt,
	save,
	saveTxt,
	clear,
	clearTxt;

	load = paper.path('M 0 0 L '+(width/3+8)+' 0 L '+(width/3-12)+' '+height+' L 0 '+height).attr({
        fill: 'green',
        stroke: '#6d8383',
        'stroke-width': 0,
        opacity: 0.8,
	});



	save = paper.path('M '+(width/3+8)+' 0 L '+(width*(2/3)-8)+' 0 L '+(width*(2/3)+12)+' '+height+' L '+(width/3-12)+' '+height).attr({
        fill: 'red',
        stroke: '#6d8383',
        'stroke-width': 0,
        opacity: 0.8,
	});

	clear = paper.path('M '+(width*(2/3)-8)+' 0 L '+width+' 0 L '+width+' '+height+' L '+(width*(2/3)+12)+' '+height).attr({
        fill: 'green',
        stroke: '#6d8383',
        'stroke-width': 0,
        opacity: 0.8,
	});

	loadTxt = paper.text((width/3-width/6), height/2, "Load");
	saveTxt = paper.text(width/2, height/2, "Save");
	clearTxt = paper.text(width-width/6, height/2, "Clear");



}