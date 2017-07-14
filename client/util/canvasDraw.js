/*
 * Simple free drawing in a canvas.
 */

var State = require('ampersand-state');


module.exports = State.extend({
	props: {
		paint: 'boolean',
		points: {type: 'array', required: true},
		clickDrag: {type: 'array', required: true}
	},
	touchStart: function (context, e) {
		this.paint = true;
		if (this.paint) {
			var rect = context.canvas.getBoundingClientRect();
			var trueX = (e.touches[0].clientX - rect.left)/(rect.right - rect.left) * context.canvas.width;
			var trueY = (e.touches[0].clientY - rect.top)/(rect.bottom - rect.top) * context.canvas.height;
			this.addClick(trueX, trueY, false);
			this.drawNew(context);
		}
	},
	touchMove: function (context, e) {
		if (this.paint) {
			var rect = context.canvas.getBoundingClientRect();
			var trueX = (e.touches[0].clientX - rect.left)/(rect.right - rect.left) * context.canvas.width;
			var trueY = (e.touches[0].clientY - rect.top)/(rect.bottom - rect.top) * context.canvas.height;
			this.addClick(trueX, trueY, true);
			this.drawNew(context);
		}
	},
	mouseDown: function (context, e) {
		this.paint = true;
		var rect = context.canvas.getBoundingClientRect();
		var trueX = (e.clientX - rect.left)/(rect.right - rect.left) * context.canvas.width;
		var trueY = (e.clientY - rect.top)/(rect.bottom - rect.top) * context.canvas.height;
		if (this.paint) {
			this.addClick(trueX, trueY, false);
			this.drawNew(context);
		}
	},
	endSegment: function (context) {
		context.closePath();
		this.paint = false;
	},
	mouseMove: function (context, e) {
		var rect = context.canvas.getBoundingClientRect();
		var trueX = (e.clientX - rect.left)/(rect.right - rect.left) * context.canvas.width;
		var trueY = (e.clientY - rect.top)/(rect.bottom - rect.top) * context.canvas.height;

		if (this.paint) {
			this.addClick(trueX, trueY, true);
			this.drawNew(context);
		}
	},
	addClick: function (x, y, dragging) {
		//track new points
		this.points.push({x: x, y: y});
		this.clickDrag.push(dragging);
	},
	drawNew: function (context) {
		var i = this.points.length - 1

		if (!this.clickDrag[i]) {
			if (this.points.length == 0) {
				context.beginPath();
				context.moveTo(this.points[i].x, this.points[i].y);
				context.stroke();
			} else {
				context.closePath();
				context.beginPath();
				context.moveTo(this.points[i].x, this.points[i].y);
				context.stroke();
			}
		} else {
			context.lineTo(this.points[i].x, this.points[i].y);
			context.stroke();
		}
	}
});
