var cellCreator = require('./cellFactory.js');

// GAME OF LIFE AS OBJECT
//considers a "cell" to be any object with a row and col field
var GameOfLife = function(liveCellArray, width, height) {
	this.width = width;
	this.height = height;
	this.currentArray = [];

	var currentCell;

	//set defaults
	for(var x = 0; x < this.width; x++) {
		this.currentArray[x] = [];
		for(var y = 0; y < this.height; y++) {
			//null means dead/not alive
			this.currentArray[x][y] = null;
		}
	}

	//add currently alive cells
	for(var cell_num = 0; cell_num < liveCellArray.length; cell_num++) {
		currentCell = liveCellArray[cell_num];
		this.currentArray[currentCell.col][currentCell.row] = currentCell;
	}
}

//iterate once, and report any cells that have changed as an array
GameOfLife.prototype.iterate = function () {
	var newArray = [];
	var currentSum = 0;
	var changedCells = [];

	//set defaults
	for(var x = 0; x < this.width; x++) {
		newArray[x] = [];
		for(var y = 0; y < this.height; y++) {
			//null means dead/not alive
			newArray[x][y] = null;
		}
	}

	var getValue = function(x, y) {
		var col = this.currentArray[x];
		if(!col) {
			return 0;
		}

		var cell = col[y];

		//null is dead cell, undefined is bad access
		return !!cell ? 1 : 0;
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
		if(!cell) {
			return null;
		}

		return cell.color;
	}.bind(this);

	var getAvgColor = function (x, y) {
		var num = 9;
		var currentColor;
		var currentRed = 0;
		var currentGreen = 0;
		var currentBlue = 0;

		// each cell in 3x3 around center, including center
		for(var x_index = x-1; x_index <= x+1; x_index++) {
			for(var y_index = y-1; y_index <= y+1; y_index++) {
				currentColor = getColor(x_index, y_index);

				//does not contribute to average
				if(currentColor == null) {
					num--;
				} else {
					//extract rgbs and add to currents
				}
			}
		}

		//calculate averages and build back into color

		return;
	}.bind(this);

	for(var x = 0; x < this.width; x++) {
		for(var y = 0; y < this.height; y++) {
			currentSum = getSum(x, y);

			// more succint version of the rules based on the total sum in a 3x3 (including center)

			//LIFE
			if(currentSum === 3) {
				//ARGGH x => COL, y => ROW

				//if changed, new cell
				if(this.currentArray[x][y] === null) {
					changedCells.push(newArray[x][y]);
					newArray[x][y] = cellCreator.createCell(y, x, getAvgColor(x, y));
				} else {
					//if there's already a cell, keep it
					newArray[x][y] = this.currentArray[x][y];
				}

				//CONSTANT
			} else if (currentSum === 4) {
				newArray[x][y] = this.currentArray[x][y];

				// DEATH
			} else {
				newArray[x][y] = null;

				//if changed, add to toggle list
				if(this.currentArray[x][y] !== null) {
					//mark for death for convenience
					this.currentArray[x][y].alive = false;

					changedCells.push(this.currentArray[x][y]);
				}
			}
		}
	}

	this.currentArray = newArray;

	return changedCells;
}

GameOfLife.prototype.addCell = function (cell) {
	//don't add a cell if one already exists there
	if(this.currentArray[cell.x][cell.y]) {
		return false;
	} else {
		this.currentArray[cell.x][cell.y] = cell;
		return true;
	}
}

GameOfLife.prototype.getCurrentCells = function () {
	var liveCells = [];
	var currentCell;
	
	for(var x = 0; x < this.width; x++) {
		for(var y = 0; y < this.height; y++) {
			var currentCell = this.currentArray[x][y];

			if(currentCell) {
				liveCells.push(currentCell);
			}
		}
	}

	return liveCells;
}


module.exports = GameOfLife;