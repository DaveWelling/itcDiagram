const d3 = require('d3');
const _ = require('lodash');


module.exports = (function itcNode() {
	var chartStamp;
	var chartNode;
	var chartWidth = 300;
	var chartHeight = 150;
	var heightChartBars = 10;
	var chartX = 20;
	var chartY = 5;
	var g;
	var selectionAction;

	chart.node = function (value) {
		if (!arguments.length) return chartNode;
		chartStamp = value.stamp;
		chartNode = value;
		return chart;
	};

	chart.width = function (value) {
		if (!arguments.length) return chartWidth;
		chartWidth = value;
		return chart;
	};

	chart.height = function (value) {
		if (!arguments.length) return chartHeight;
		chartHeight = value;
		return chart;
	};

	chart.heightOfStampValues = function (value) {
		if (!arguments.length) return heightChartBars;
		heightChartBars = value;
		return chart;
	};

	chart.x = function (value) {
		if (!arguments.length) return chartX;
		chartX = value;
		return chart;
	};

	chart.y = function (value) {
		if (!arguments.length) return chartY;
		chartY = value;
		return chart;
	};

	chart.g = function (value) {
		if (!arguments.length) return g;
		g = value;
		return chart;
	};

	chart.selectionAction = function(value) {
		if (!arguments.length) return selectionAction;
		selectionAction = value;
		return chart;
	};

	function chart(group) {
		g = group;
		update();
	}

	function update() {
		var chartId = 'x' + chartNode.id.split("-").join("");
		g.setAttribute("id", chartId);
		var gWidth = g.attributes['width'].value;
		var gHeight = g.attributes['height'].value;
		g = d3.select("#" + chartId);

		// Background
		g.append("rect")
			.attr({
				stroke: "#111111",
				fill: "#fff",
				x: 0,
				y: 0,
				width: parseInt(gWidth) + (chartX * 2),
				height: parseInt(gHeight) + (chartY * 2),
			})
		.classed("itcNodeBackground", true)
		.on("click", raiseSelectedEvent);


		// ID
		drawId([chartStamp.itcId], chartWidth, chartX);
		// Event
		drawEvent(chartStamp.itcEvent, chartWidth, chartY + heightChartBars);


	}

	function raiseSelectedEvent(e) {
		if (selectionAction) {
			selectionAction(this, e);
		}
	};

	function drawEvent(event, startingWidth, startingY) {
		var nesting = 0;
		drawValue(event, chartX, startingY, chartWidth);

		function drawValue(innerEvent, innerStartingX, innerStartingY, innerWidth) {
			nesting++;
			var valueBar = g.append('rect').classed('eventBar' + nesting, true);
			var innerBarHeight = innerEvent.value * heightChartBars;
			valueBar.attr({
				x: innerStartingX,
				y: innerStartingY,
				width: innerWidth,
				height: innerBarHeight,
				fill: "#5325b0",
				stroke: "#000000"
			});
			if (!_.isEmpty(innerEvent.left) && (innerEvent.left.value > 0 | !innerEvent.left.isLeaf)) {
				drawValue(innerEvent.left, innerStartingX, innerStartingY + innerBarHeight, innerWidth / 2);
			}
			if (!_.isEmpty(innerEvent.right) && (innerEvent.right.value > 0 | !innerEvent.right.isLeaf)) {
				drawValue(innerEvent.right, innerStartingX + innerWidth / 2, innerStartingY + innerBarHeight, innerWidth / 2);
			}
		}


	}

	function drawId(id, startingWidth, startingX) {
		var nesting = 0;
		innerDrawId(id, startingWidth, startingX);
		function innerDrawId(innerId, innerStartingWidth, innerStartingX) {
			nesting++;
			//console.log(nesting);
			var idBars = g.selectAll('rect.idBar' + nesting).data(innerId);
			idBars.enter().append('rect').classed('idBar' + nesting, true);
			idBars.attr({
				x: innerStartingX,
				y: chartY,
				fill: function (d) {
					return ((d && d.value > 0) ? "#7fdfff" : "#fffffe");
				},
				stroke: "#000000",
				height: heightChartBars,
				width: function (d) {
                    if (!d) return 0;
					var barWidth;
					if (d.isLeaf) {
						//console.log('nesting:' + nesting + ' | w1 | barWidth:' + innerStartingWidth + ' | X:' + innerStartingX + ' | data: (' + d.isLeaf + ',' + d.value + ',' + (d.left ? d.left.value : 'null') + ',' + (d.right ? d.right.value : 'null') + ')');
						return innerStartingWidth;
					}
					if ((d.left) && (d.right)) {
						barWidth = innerStartingWidth / 2;
						//console.log('nesting:' + nesting + ' | w2 | barWidth:' + barWidth + ' | X:' + innerStartingX + ' | data: (' + d.isLeaf + ',' + d.value + ',' + (d.left ? d.left.value : 'null') + ',' + (d.right ? d.right.value : 'null') + ')');
						innerDrawId([d.left], barWidth, innerStartingX );
						innerDrawId([d.right], barWidth, innerStartingX + barWidth);
						return barWidth;
					}
					barWidth = innerStartingWidth;
					//console.log('nesting:' + nesting + ' | w3 | barWidth:' + barWidth + ' | X:' + innerStartingX + ' | data: (' + d.isLeaf + ',' + d.value + ',' + (d.left ? d.left.value : 'null') + ',' + (d.right ? d.right.value : 'null') + ')');
					if (d.left) {
						innerDrawId(d.left, barWidth, innerStartingX);
					} else {
						innerDrawId(d.right, barWidth, innerStartingX);
					}
					return barWidth;
				}
			});
		}

	}

	function add(svg, itcStamp, width, barHeight, x, y) {
		if (!svg) {
			svg = d3.select('svg');
		}
		if (!itcStamp) {
			throw new Error("An itcStamp must be provided.");
		}
		chartStamp = itcStamp;
		if (width) { chartWidth = width;}
		if (barHeight) { heightChartBars = barHeight;}
		if (x) { chartX = x;}
		if (y) { chartY = y;}
		g = svg.append("g");
		update();
		return chart;
	}

	chart.add = add;
	chart.update = update;
	return chart;
})();
