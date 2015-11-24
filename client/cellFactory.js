// so apparently this JS is cancerous, i'll refactor it later
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var createCell = function (xpos, ypos){

	var Cell = function (x, y) {
		this.x = x;
		this.y = y;

		this.color = {};
		this.color.r = 100;
		this.color.g = 100;
		this.color.b = 100;

		this.alive = false;

		this.css = rgbToHex(this.color.r, this.color.g, this.color.b);
		
		this.setRGB = function (r, g, b) {
			this.color = {'r': r, 'g': g, 'b': b};
			this.css = rgbToHex(r, g, b);
		}

		this.setCSS = function (hex) {
			this.color = hexToRgb(hex);
			this.css = hex;
		}
	}

	return new Cell(xpos, ypos);
}

module.exports = {
	'createCell': createCell
}