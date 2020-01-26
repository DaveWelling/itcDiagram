const node = require('./models/node');
module.exports = function forkController(request) {
    var requestNode = node.deserialize(request);
    var stamps = requestNode.stamp.fork();
    return {
        node1: new node.Instance(stamps[0], requestNode.value),
        node2: new node.Instance(stamps[1], requestNode.value)
    };
};
