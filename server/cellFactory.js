var createCell = function (xpos, ypos, color){

	//ARGGH x => COL, y => ROW

	var Cell = function (x, y) {
		this.x = x;
		this.y = y;
		this.color = color || '#444444';
		this.alive = true;
		this.id = '' + this.x + '-' + this.y;
	}

	return new Cell(xpos, ypos);
}

module.exports = {
	'createCell': createCell
}