const node = require('./models/node');

module.exports = function joinController(request) {
    var node1 = node.deserialize(request.node1);
    var node2 = node.deserialize(request.node2);
    return node.join(node1, node2);
};
