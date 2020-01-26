const $ = require('jquery');

const newNodeController = require('./itcControllers/newNodeController');
const forkController = require('./itcControllers/forkController');
const joinController = require('./itcControllers/joinController');
const nodeEvent = require('./itcControllers/eventController');

module.exports = new (function() {
	var api = {};

	api.newNode = newNodeController;

	api.fork = forkController;

	api.join = function(node1, node2) {
		var nodes = {
			Node1: node1,
			Node2: node2
        };
        return joinController(nodes);
	};

	api.nodeEvent = nodeEvent;

	return api;
})()