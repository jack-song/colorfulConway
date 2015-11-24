var cellCreator = require('./cellFactory.js');

var clearByDeath = function(array, width, height) {
	for(var x = 0; x < width; x++) {
		for(var y = 0; y < height; y++) {
			array[x][y].alive = false;
		}
	}
}

// GAME OF LIFE AS OBJECT
//considers a "cell" to be any object with a row and col field
var GameOfLife = function(width, height) {
	this.width = width;
	this.height = height;
	this.currentArray = [];

	var currentCell;

	//set defaults
	for(var x = 0; x < this.width; x++) {
		this.currentArray[x] = [];
		for(var y = 0; y < this.height; y++) {
			this.currentArray[x][y] = cellCreator.createCell(x, y);
		}
	}
}

//iterate once, and report any cells that have changed as an array
GameOfLife.prototype.iterate = function () {
	var currentSum = 0;
	var changedCells = [];

	var getValue = function(x, y) {
		var col = this.currentArray[x];
		if(!col) {
			return 0;
		}

		var cell = col[y];

		//null is dead cell, undefined is bad access
		return (cell && cell.alive) ? 1 : 0;
	}.bind(this);

	var getSum = function (x, y) {
		var sum = 0;

		// each cell in 3x3 around center, including center
		for(var x_index = x-1; x_index <= x+1; x_index++) {
			for(var y_index = y-1; y_index <= y+1; y_index++) {
				sum += getValue(x_index, y_index);
			}
		}

		return sum;
	}.bind(this);

	var getColor = function(x, y) {
		var col = this.currentArray[x];
		if(!col) {
			return null;
		}

		var cell = col[y];

		//null is dead cell, undefined is bad access
		if(!cell || !cell.alive) {
			return null;
		}

		return cell.color;
	}.bind(this);

	var setAvgColor = function (newCell) {
		var x = newCell.x;
		var y = newCell.y;
		var num = 9;
		var currentColor;
		var rgb = [0, 0, 0];

		// each cell in 3x3 around center, including center
		for(var x_index = x-1; x_index <= x+1; x_index++) {
			for(var y_index = y-1; y_index <= y+1; y_index++) {
				currentColor = getColor(x_index, y_index);

				//does not contribute to average
				if(currentColor == null) {
					num--;
				} else {
					rgb[0] += currentColor.r;
					rgb[1] += currentColor.g;
					rgb[2] += currentColor.b;
				}
			}
		}

		//get rgb averages
		newCell.setRGB(Math.floor(rgb[0]/num), Math.floor(rgb[1]/num), Math.floor(rgb[2]/num));

	}.bind(this);

	for(var x = 0; x < this.width; x++) {
		for(var y = 0; y < this.height; y++) {
			currentSum = getSum(x, y);

			// more succint version of the rules based on the total sum in a 3x3 (including center)

			//LIFE
			if(currentSum === 3) {

				//if changed, new cell
				if(!this.currentArray[x][y].alive) {
					setAvgColor(this.currentArray[x][y]);

					changedCells.push({
						x: x,
						y: y,
						alive: true,
						css: this.currentArray[x][y].css
					});
				} else {
					//if there's already a cell, leave it alone
				}

				//CONSTANT
			} else if (currentSum === 4) {
				//leave it alone

				// DEATH
			} else {
				//if changed, add to toggle list
				if(this.currentArray[x][y].alive) {

					changedCells.push({
						x: x,
						y: y,
						alive: false
					});
				} else {
					//if already dead, leave it alone
				}
			}
		}
	}

	//apply changes to model
	changedCells.forEach(function(cellData) {
		this.currentArray[cellData.x][cellData.y].alive = cellData.alive;
		//color should already be set
	}.bind(this));

	return changedCells;
}

GameOfLife.prototype.addCell = function (cellData) {
	//don't add a cell if one already exists there
	if(this.currentArray[cellData.x][cellData.y].alive) {
		return false;
	} else {
		this.currentArray[cellData.x][cellData.y].alive = true;
		this.currentArray[cellData.x][cellData.y].setCSS(cellData.css);
		return true;
	}
}

GameOfLife.prototype.getCurrentCells = function () {
	var liveCells = [];
	
	for(var x = 0; x < this.width; x++) {
		for(var y = 0; y < this.height; y++) {
			if(this.currentArray[x][y].alive) {
				liveCells.push(this.currentArray[x][y]);
			}
		}
	}

	return liveCells;
}

GameOfLife.prototype.clear = function () {
	clearByDeath(this.currentArray, this.width, this.height);
}


module.exports = GameOfLife;